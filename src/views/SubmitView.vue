<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watchEffect } from 'vue';
import { fetchActiveCategories } from '@/lib/categories';
import { submitReport } from '@/lib/submissions';
import { uploadPendingMedia } from '@/lib/media';
import { isMobileDevice } from '@/lib/device';
import { immersive } from '@/lib/uiState';
import { PLACE_TYPE_ICONS, PLACE_TYPE_LABELS } from '@/lib/labels';
import type { Category, PlaceType } from '@/lib/types';

interface TurnstileApi {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
}
declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

// La segnalazione è consentita solo su mobile (fotocamera + posizione).
const isMobile = isMobileDevice();

const categories = ref<Category[]>([]);
const loadError = ref<string | null>(null);

// --- Posizione ---------------------------------------------------------------
const geo = ref<{ lng: number; lat: number } | null>(null);
const geoError = ref<string | null>(null);
const hasGeo = computed(() => geo.value !== null);

function requestGeo() {
  geoError.value = null;
  if (!('geolocation' in navigator)) {
    geoError.value = 'Geolocalizzazione non disponibile su questo dispositivo.';
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      geo.value = { lng: pos.coords.longitude, lat: pos.coords.latitude };
    },
    () => {
      geo.value = null;
      geoError.value = 'Consenti l’accesso alla posizione per continuare.';
    },
    { enableHighAccuracy: true, timeout: 15000 },
  );
}

// --- Fotocamera live (getUserMedia) -----------------------------------------
const videoEl = ref<HTMLVideoElement | null>(null);
const stream = ref<MediaStream | null>(null);
const cameraError = ref<string | null>(null);

async function startCamera() {
  cameraError.value = null;
  if (!navigator.mediaDevices?.getUserMedia) {
    cameraError.value = 'Fotocamera non disponibile su questo dispositivo.';
    return;
  }
  try {
    const s = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' },
      audio: false,
    });
    stream.value = s;
    await nextTick();
    if (videoEl.value) {
      videoEl.value.srcObject = s;
      try {
        await videoEl.value.play();
      } catch {
        /* autoplay può richiedere un gesto: il video parte comunque */
      }
    }
  } catch {
    cameraError.value = 'Consenti l’accesso alla fotocamera per scattare la foto.';
  }
}

function stopCamera() {
  if (stream.value) {
    for (const track of stream.value.getTracks()) track.stop();
    stream.value = null;
  }
}

// --- Foto scattata -----------------------------------------------------------
const photo = ref<File | null>(null);
const photoUrl = ref('');
const canCapture = computed(() => !!stream.value && hasGeo.value);

function capturePhoto() {
  const v = videoEl.value;
  if (!v || !v.videoWidth) return;
  const canvas = document.createElement('canvas');
  canvas.width = v.videoWidth;
  canvas.height = v.videoHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
  canvas.toBlob(
    (blob) => {
      if (!blob) return;
      if (photoUrl.value) URL.revokeObjectURL(photoUrl.value);
      photo.value = new File([blob], `foto-${Date.now()}.jpg`, { type: 'image/jpeg' });
      photoUrl.value = URL.createObjectURL(photo.value);
      step.value = 'type';
      stopCamera();
    },
    'image/jpeg',
    0.9,
  );
}

function retakePhoto() {
  if (photoUrl.value) URL.revokeObjectURL(photoUrl.value);
  photo.value = null;
  photoUrl.value = '';
  step.value = 'type';
  startCamera();
}

// --- Dati della segnalazione (flusso a pagine) -------------------------------
type Step = 'type' | 'category' | 'details';
const step = ref<Step>('type');

const placeType = ref<PlaceType | ''>('');
const typeOptions: { value: PlaceType; hint: string }[] = [
  { value: 'criticita', hint: 'Problemi da verificare' },
  { value: 'proposta', hint: 'Idee per migliorare' },
  { value: 'risorsa', hint: 'Beni e paesaggi da proteggere' },
  { value: 'cura', hint: 'Interventi già realizzati' },
];
const description = ref('');
const categoryId = ref('');
const reporterName = ref('');

// Solo le categorie compatibili con la tipologia scelta (fallback: tutte).
const visibleCategories = computed(() => {
  const t = placeType.value;
  if (!t) return categories.value;
  const filtered = categories.value.filter((c) => c.types.includes(t));
  return filtered.length ? filtered : categories.value;
});

function chooseType(t: PlaceType) {
  placeType.value = t;
  categoryId.value = '';
  step.value = 'category';
}

function chooseCategory(id: string) {
  categoryId.value = id;
  step.value = 'details';
}

function goBack() {
  if (step.value === 'details') step.value = 'category';
  else if (step.value === 'category') step.value = 'type';
  else retakePhoto();
}

// --- Captcha (Cloudflare Turnstile), attivo solo se configurata la site key --
const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;
const captchaEnabled = !!turnstileSiteKey;
const turnstileToken = ref('');
const turnstileEl = ref<HTMLDivElement | null>(null);

function renderTurnstile() {
  if (!turnstileSiteKey || !window.turnstile || !turnstileEl.value) return;
  window.turnstile.render(turnstileEl.value, {
    sitekey: turnstileSiteKey,
    callback: (token: string) => {
      turnstileToken.value = token;
    },
    'expired-callback': () => {
      turnstileToken.value = '';
    },
    'error-callback': () => {
      turnstileToken.value = '';
    },
  });
}

function loadTurnstile() {
  if (!captchaEnabled) return;
  if (window.turnstile) {
    renderTurnstile();
    return;
  }
  const script = document.createElement('script');
  script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
  script.async = true;
  script.defer = true;
  script.onload = renderTurnstile;
  document.head.appendChild(script);
}

// --- Invio -------------------------------------------------------------------
const submitting = ref(false);
const submitError = ref<string | null>(null);
const reference = ref<string | null>(null);

// Nasconde l'intestazione del sito mentre e' attiva la fotocamera,
// per la massima visibilita' dell'inquadratura.
watchEffect(() => {
  immersive.value = isMobile && !reference.value && !photo.value;
});

function validate(): string | null {
  if (!photo.value) return 'Scatta prima una foto.';
  if (!hasGeo.value) return 'Consenti l’accesso alla posizione.';
  if (!placeType.value) return 'Scegli di cosa si tratta.';
  if (!categoryId.value) return 'Scegli una categoria.';
  if (!description.value.trim()) return 'Aggiungi una nota.';
  if (!reporterName.value.trim()) return 'Inserisci il tuo nome.';
  if (captchaEnabled && !turnstileToken.value) return 'Completa la verifica anti-spam.';
  return null;
}

async function onSubmit() {
  submitError.value = null;
  const problem = validate();
  if (problem) {
    submitError.value = problem;
    return;
  }
  submitting.value = true;
  try {
    const paths = await uploadPendingMedia([photo.value as File]);
    const text = description.value.trim();
    reference.value = await submitReport({
      title: text.slice(0, 120),
      description: text,
      type: placeType.value as PlaceType,
      categoryId: categoryId.value,
      lng: (geo.value as { lng: number; lat: number }).lng,
      lat: (geo.value as { lng: number; lat: number }).lat,
      name: reporterName.value.trim(),
      consent: true,
      mediaPaths: paths,
    });
    stopCamera();
  } catch (e) {
    submitError.value =
      e instanceof Error && e.message
        ? e.message
        : 'Invio non riuscito. Riprova più tardi.';

    console.error(e);
  } finally {
    submitting.value = false;
  }
}

onMounted(async () => {
  if (!isMobile) return;
  requestGeo();
  startCamera();
  loadTurnstile();
  try {
    categories.value = await fetchActiveCategories();
  } catch (e) {
    loadError.value = 'Impossibile caricare le categorie.';

    console.error(e);
  }
});

onBeforeUnmount(() => {
  immersive.value = false;
  stopCamera();
  if (photoUrl.value) URL.revokeObjectURL(photoUrl.value);
});
</script>

<template>
  <!-- Desktop: sola consultazione, segnalazione non disponibile -->
  <section
    v-if="!isMobile"
    class="mx-auto max-w-xl px-4 py-16 text-center"
  >
    <h1 class="text-2xl font-bold text-slate-900">
      Segnala un luogo
    </h1>
    <p class="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-6 text-slate-600">
      Apri l’app sul telefonino per segnalare. La segnalazione richiede la
      fotocamera e la posizione, disponibili solo da smartphone.
    </p>
    <router-link
      to="/"
      class="mt-6 inline-block font-semibold text-emerald-700"
    >
      ← Torna alla mappa
    </router-link>
  </section>

  <!-- Mobile: flusso guidato a pagine -->
  <section
    v-else
    class="mx-auto flex min-h-[85vh] max-w-xl flex-col px-4 py-6"
  >
    <!-- Esito -->
    <div
      v-if="reference"
      class="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-6 text-center"
    >
      <h1 class="text-xl font-semibold text-emerald-900">
        Segnalazione inviata
      </h1>
      <p class="mt-2 text-emerald-800">
        Grazie. Riferimento: <strong>{{ reference }}</strong>.
      </p>
      <p class="mt-2 text-emerald-800">
        La verifichiamo prima di pubblicarla sulla mappa: controlliamo foto,
        posizione e coerenza. Se pubblicata, comparirà tra i luoghi. Il tuo
        nome non viene pubblicato.
      </p>
      <router-link
        to="/"
        class="mt-6 inline-block font-semibold text-emerald-700"
      >
        ← Torna alla mappa
      </router-link>
    </div>

    <!-- Passo 0: scatta la foto -->
    <div
      v-else-if="!photo"
      class="grid gap-4"
    >
      <h1 class="text-xl font-bold text-slate-900">
        Scatta una foto
      </h1>

      <div class="relative overflow-hidden rounded-xl bg-black">
        <video
          ref="videoEl"
          class="aspect-[3/4] w-full object-cover"
          playsinline
          muted
        />
        <p
          v-if="cameraError"
          class="absolute inset-0 flex items-center justify-center p-6 text-center text-white"
        >
          {{ cameraError }}
        </p>
      </div>

      <p
        v-if="cameraError"
        class="text-center"
      >
        <button
          type="button"
          class="font-semibold text-emerald-700"
          @click="startCamera"
        >
          Riprova ad attivare la fotocamera
        </button>
      </p>
      <p
        v-if="geoError"
        class="text-center text-sm text-red-700"
      >
        {{ geoError }}
        <button
          type="button"
          class="font-semibold underline"
          @click="requestGeo"
        >
          Riprova
        </button>
      </p>
      <p
        v-else-if="!hasGeo"
        class="text-center text-sm text-slate-600"
      >
        Acquisizione della posizione in corso…
      </p>

      <button
        type="button"
        class="rounded-full bg-emerald-700 px-6 py-3 text-lg font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="!canCapture"
        @click="capturePhoto"
      >
        Scatta
      </button>
    </div>

    <!-- Passi successivi: una scelta per pagina -->
    <div
      v-else
      class="flex flex-1 flex-col"
    >
      <!-- Intestazione compatta con miniatura e indietro -->
      <div class="mb-5 flex items-center gap-3">
        <button
          type="button"
          class="text-2xl leading-none text-slate-500"
          aria-label="Indietro"
          @click="goBack"
        >
          ←
        </button>
        <img
          :src="photoUrl"
          alt="Foto scattata"
          class="h-14 w-14 flex-none rounded-lg border border-slate-300 object-cover"
        >
        <button
          type="button"
          class="ml-auto text-sm font-semibold text-emerald-700"
          @click="retakePhoto"
        >
          ↻ Rifai la foto
        </button>
      </div>

      <!-- Passo 1: che cos'è? -->
      <div
        v-if="step === 'type'"
        class="flex flex-1 flex-col"
      >
        <h1 class="mb-4 text-2xl font-bold text-slate-900">
          Che cos’è?
        </h1>
        <div class="grid grid-cols-2 gap-3">
          <button
            v-for="t in typeOptions"
            :key="t.value"
            type="button"
            class="flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 bg-white p-3 text-center active:scale-95"
            @click="chooseType(t.value)"
          >
            <span
              class="text-4xl"
              aria-hidden="true"
            >{{ PLACE_TYPE_ICONS[t.value] }}</span>
            <span class="text-base font-semibold text-slate-900">{{ PLACE_TYPE_LABELS[t.value] }}</span>
            <span class="text-xs leading-tight text-slate-500">{{ t.hint }}</span>
          </button>
        </div>
      </div>

      <!-- Passo 2: dimmi di più (categoria) -->
      <div
        v-else-if="step === 'category'"
        class="flex flex-1 flex-col"
      >
        <h1 class="text-2xl font-bold text-slate-900">
          Dimmi di più
        </h1>
        <button
          type="button"
          class="mb-4 mt-1 flex items-center gap-2 self-start rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700"
          @click="step = 'type'"
        >
          <span aria-hidden="true">{{ PLACE_TYPE_ICONS[placeType as PlaceType] }}</span>
          {{ PLACE_TYPE_LABELS[placeType as PlaceType] }}
          <span class="text-emerald-700">· cambia</span>
        </button>
        <p
          v-if="loadError"
          class="font-semibold text-red-700"
          role="alert"
        >
          {{ loadError }}
        </p>
        <div class="grid gap-2">
          <button
            v-for="c in visibleCategories"
            :key="c.id"
            type="button"
            class="flex items-center gap-3 rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-left active:scale-[0.98]"
            @click="chooseCategory(c.id)"
          >
            <span
              class="h-4 w-4 flex-none rounded-full"
              :style="{ backgroundColor: c.color }"
              aria-hidden="true"
            />
            <span class="font-semibold text-slate-900">{{ c.label }}</span>
            <span class="ml-auto text-slate-400">›</span>
          </button>
        </div>
      </div>

      <!-- Passo 3: nota e pubblica -->
      <form
        v-else
        class="flex flex-1 flex-col gap-4"
        novalidate
        @submit.prevent="onSubmit"
      >
        <h1 class="text-2xl font-bold text-slate-900">
          Aggiungi una nota
        </h1>

        <label class="grid gap-1.5 font-semibold text-slate-800">
          Nota
          <textarea
            v-model="description"
            rows="4"
            maxlength="2000"
            required
            placeholder="Descrivi cosa hai visto…"
            class="w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal text-slate-900"
          />
        </label>

        <label class="grid gap-1.5 font-semibold text-slate-800">
          Il tuo nome
          <span class="text-xs font-normal text-slate-500">
            Serve solo per la verifica: non viene pubblicato.
          </span>
          <input
            v-model="reporterName"
            type="text"
            maxlength="120"
            required
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal text-slate-900"
          >
        </label>

        <div
          v-if="captchaEnabled"
          ref="turnstileEl"
          class="min-h-[65px]"
        />

        <p
          v-if="submitError"
          class="font-semibold text-red-700"
          role="alert"
        >
          {{ submitError }}
        </p>

        <p class="text-xs text-slate-500">
          Inviando accetti i
          <a
            href="#/termini"
            target="_blank"
            rel="noopener"
            class="underline"
          >termini</a>
          e l’<a
            href="#/privacy"
            target="_blank"
            rel="noopener"
            class="underline"
          >informativa sulla privacy</a>. Il nome non viene pubblicato.
        </p>

        <button
          class="mt-auto rounded-lg bg-emerald-700 px-5 py-3 text-lg font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          type="submit"
          :disabled="submitting"
        >
          {{ submitting ? 'Invio…' : 'Invia' }}
        </button>
      </form>
    </div>
  </section>
</template>
