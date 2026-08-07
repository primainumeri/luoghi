<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { fetchActiveCategories } from '@/lib/categories';
import { submitReport } from '@/lib/submissions';
import { uploadPendingMedia } from '@/lib/media';
import { isMobileDevice } from '@/lib/device';
import type { Category } from '@/lib/types';

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
  startCamera();
}

// --- Dati della segnalazione -------------------------------------------------
const description = ref('');
const categoryId = ref('');
const reporterName = ref('');

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

function validate(): string | null {
  if (!photo.value) return 'Scatta prima una foto.';
  if (!hasGeo.value) return 'Consenti l’accesso alla posizione.';
  if (!description.value.trim()) return 'Aggiungi una descrizione.';
  if (!categoryId.value) return 'Scegli una categoria.';
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
      type: 'criticita',
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

  <!-- Mobile: flusso guidato camera-first -->
  <section
    v-else
    class="mx-auto max-w-xl px-4 py-6"
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
      <router-link
        to="/"
        class="mt-6 inline-block font-semibold text-emerald-700"
      >
        ← Torna alla mappa
      </router-link>
    </div>

    <!-- Passo 1: scatta la foto -->
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

    <!-- Passo 2: dettagli e invio -->
    <form
      v-else
      class="grid gap-5"
      novalidate
      @submit.prevent="onSubmit"
    >
      <h1 class="text-xl font-bold text-slate-900">
        Completa la segnalazione
      </h1>

      <div class="overflow-hidden rounded-xl border border-slate-300">
        <img
          :src="photoUrl"
          alt="Foto scattata"
          class="aspect-[3/4] w-full object-cover"
        >
      </div>
      <button
        type="button"
        class="justify-self-start font-semibold text-emerald-700"
        @click="retakePhoto"
      >
        ↻ Rifai la foto
      </button>

      <p
        v-if="loadError"
        class="font-semibold text-red-700"
        role="alert"
      >
        {{ loadError }}
      </p>
      <p
        v-if="submitError"
        class="font-semibold text-red-700"
        role="alert"
      >
        {{ submitError }}
      </p>

      <label class="grid gap-1.5 font-semibold text-slate-800">
        Descrizione
        <textarea
          v-model="description"
          rows="4"
          maxlength="2000"
          required
          class="w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal text-slate-900"
        />
      </label>

      <label class="grid gap-1.5 font-semibold text-slate-800">
        Categoria
        <select
          v-model="categoryId"
          required
          class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal text-slate-900"
        >
          <option
            value=""
            disabled
          >Seleziona…</option>
          <option
            v-for="c in categories"
            :key="c.id"
            :value="c.id"
          >{{ c.label }}</option>
        </select>
      </label>

      <label class="grid gap-1.5 font-semibold text-slate-800">
        Il tuo nome
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

      <p class="text-xs text-slate-500">
        Caricando accetti l’informativa sulla privacy. Il nome non viene pubblicato.
      </p>

      <button
        class="rounded-lg bg-emerald-700 px-5 py-3 text-lg font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        type="submit"
        :disabled="submitting"
      >
        {{ submitting ? 'Caricamento…' : 'Carica' }}
      </button>
    </form>
  </section>
</template>
