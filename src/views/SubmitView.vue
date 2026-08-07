<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { fetchActiveCategories } from '@/lib/categories';
import { submitReport } from '@/lib/submissions';
import { uploadPendingMedia } from '@/lib/media';
import { PLACE_TYPE_LABELS } from '@/lib/labels';
import type { Category, PlaceType } from '@/lib/types';

interface TurnstileApi {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  reset: (id?: string) => void;
}
declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const categories = ref<Category[]>([]);
const loadError = ref<string | null>(null);

const form = ref({
  type: 'criticita' as PlaceType,
  categoryId: '',
  title: '',
  description: '',
  proposal: '',
  lng: '',
  lat: '',
  locationLabel: '',
  consent: false,
  honeypot: '',
});

const submitting = ref(false);
const submitError = ref<string | null>(null);
const reference = ref<string | null>(null);

const locating = ref(false);
const locationStatus = ref<string | null>(null);
const hasLocation = computed(() => form.value.lng !== '' && form.value.lat !== '');

const types: PlaceType[] = ['criticita', 'risorsa', 'proposta'];

// --- Foto (scatto sul posto o caricamento), massimo 3 -----------------------
const MAX_PHOTOS = 3;
const photos = ref<File[]>([]);
const photoUrls = ref<string[]>([]);
const photosFull = computed(() => photos.value.length >= MAX_PHOTOS);

function onPhotosSelected(e: Event) {
  const input = e.target as HTMLInputElement;
  if (!input.files) return;
  for (const file of Array.from(input.files)) {
    if (photos.value.length >= MAX_PHOTOS) break;
    photos.value.push(file);
    photoUrls.value.push(URL.createObjectURL(file));
  }
  input.value = '';
}

function removePhoto(index: number) {
  URL.revokeObjectURL(photoUrls.value[index]);
  photos.value.splice(index, 1);
  photoUrls.value.splice(index, 1);
}

onBeforeUnmount(() => {
  for (const url of photoUrls.value) URL.revokeObjectURL(url);
});

// --- Captcha (Cloudflare Turnstile), attivo solo se è configurata la site key
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

function detectLocation() {
  if (!('geolocation' in navigator)) {
    locationStatus.value =
      'Geolocalizzazione non disponibile su questo dispositivo: non è possibile inviare la segnalazione.';
    form.value.lng = '';
    form.value.lat = '';
    return;
  }
  locating.value = true;
  locationStatus.value = 'Richiesta della posizione in corso…';
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      form.value.lng = pos.coords.longitude.toFixed(6);
      form.value.lat = pos.coords.latitude.toFixed(6);
      locationStatus.value = 'Posizione acquisita.';
      locating.value = false;
    },
    () => {
      form.value.lng = '';
      form.value.lat = '';
      locationStatus.value =
        'Accesso alla posizione negato. Consenti la geolocalizzazione per inviare la segnalazione.';
      locating.value = false;
    },
    { enableHighAccuracy: true, timeout: 10000 },
  );
}

function validate(): string | null {
  if (!form.value.title.trim()) return 'Inserisci un titolo.';
  if (!form.value.description.trim()) return 'Inserisci una descrizione.';
  if (!form.value.categoryId) return 'Seleziona una categoria.';
  if (!hasLocation.value) {
    return 'Consenti l’accesso alla posizione per inviare la segnalazione.';
  }
  if (captchaEnabled && !turnstileToken.value) {
    return 'Completa la verifica anti-spam.';
  }
  if (!form.value.consent) return 'È necessario accettare le regole editoriali.';
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
    let mediaPaths: string[] | undefined;
    if (photos.value.length > 0) {
      mediaPaths = await uploadPendingMedia(photos.value);
    }
    reference.value = await submitReport({
      title: form.value.title.trim(),
      description: form.value.description.trim(),
      type: form.value.type,
      categoryId: form.value.categoryId,
      proposal: form.value.proposal.trim() || undefined,
      lng: Number(form.value.lng),
      lat: Number(form.value.lat),
      locationLabel: form.value.locationLabel.trim() || undefined,
      consent: form.value.consent,
      honeypot: form.value.honeypot,
      mediaPaths,
    });
  } catch (e) {
    submitError.value =
      e instanceof Error && e.message
        ? e.message
        : 'Invio non riuscito. Controlla i dati e riprova più tardi.';
     
    console.error(e);
  } finally {
    submitting.value = false;
  }
}

onMounted(async () => {
  detectLocation();
  loadTurnstile();
  try {
    categories.value = await fetchActiveCategories();
  } catch (e) {
    loadError.value = 'Impossibile caricare le categorie.';
     
    console.error(e);
  }
});
</script>

<template>
  <section class="mx-auto max-w-2xl px-4 py-6">
    <h1 class="text-2xl font-bold text-slate-900">
      Segnala un luogo
    </h1>

    <p
      class="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600"
      role="note"
    >
      Questo non è un canale di emergenza. Per situazioni urgenti contatta i
      numeri di soccorso. Il contenuto non viene pubblicato automaticamente: sarà
      valutato dal gruppo editoriale.
    </p>

    <div
      v-if="reference"
      class="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-4"
      role="status"
    >
      <h2 class="text-lg font-semibold text-emerald-900">
        Segnalazione ricevuta
      </h2>
      <p class="mt-1 text-emerald-800">
        Grazie. Riferimento: <strong>{{ reference }}</strong>.
      </p>
    </div>

    <form
      v-else
      class="mt-6 grid gap-5"
      novalidate
      @submit.prevent="onSubmit"
    >
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

      <fieldset class="grid gap-2 rounded-lg border border-slate-200 p-4">
        <legend class="px-1 font-semibold text-slate-800">
          Tipo
        </legend>
        <div class="flex flex-wrap gap-x-6 gap-y-1">
          <label
            v-for="t in types"
            :key="t"
            class="inline-flex items-center gap-2 text-slate-700"
          >
            <input
              v-model="form.type"
              type="radio"
              :value="t"
              class="h-4 w-4"
            >
            {{ PLACE_TYPE_LABELS[t] }}
          </label>
        </div>
      </fieldset>

      <label class="grid gap-1.5 font-semibold text-slate-800">
        Categoria
        <select
          v-model="form.categoryId"
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
        Titolo
        <input
          v-model="form.title"
          type="text"
          maxlength="120"
          required
          class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal text-slate-900"
        >
      </label>

      <label class="grid gap-1.5 font-semibold text-slate-800">
        Descrizione
        <textarea
          v-model="form.description"
          rows="5"
          maxlength="2000"
          required
          class="w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal text-slate-900"
        />
      </label>

      <label class="grid gap-1.5 font-semibold text-slate-800">
        Proposta (facoltativa)
        <textarea
          v-model="form.proposal"
          rows="3"
          maxlength="1000"
          class="w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal text-slate-900"
        />
      </label>

      <!-- Foto: scatto sul posto (capture) oppure scelta dalla galleria -->
      <fieldset class="grid gap-3 rounded-lg border border-slate-200 p-4">
        <legend class="px-1 font-semibold text-slate-800">
          Foto (facoltative, max 3)
        </legend>
        <p class="text-sm text-slate-600">
          Puoi scattare una foto sul momento o sceglierla dai tuoi file.
        </p>
        <div class="flex flex-wrap gap-3">
          <label
            class="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white"
            :class="{ 'pointer-events-none opacity-50': photosFull }"
          >
            Scatta una foto
            <input
              type="file"
              accept="image/*"
              capture="environment"
              class="hidden"
              :disabled="photosFull"
              @change="onPhotosSelected"
            >
          </label>
          <label
            class="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-emerald-700 px-4 py-2 font-semibold text-emerald-800"
            :class="{ 'pointer-events-none opacity-50': photosFull }"
          >
            Carica dai file
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              class="hidden"
              :disabled="photosFull"
              @change="onPhotosSelected"
            >
          </label>
        </div>
        <ul
          v-if="photoUrls.length"
          class="flex flex-wrap gap-3"
        >
          <li
            v-for="(url, i) in photoUrls"
            :key="url"
            class="relative h-24 w-24 overflow-hidden rounded-lg border border-slate-300"
          >
            <img
              :src="url"
              alt="Anteprima foto"
              class="h-full w-full object-cover"
            >
            <button
              type="button"
              class="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white"
              aria-label="Rimuovi foto"
              @click="removePhoto(i)"
            >
              ×
            </button>
          </li>
        </ul>
      </fieldset>

      <!-- Posizione obbligatoria: le coordinate non sono modificabili a mano -->
      <fieldset class="grid gap-2 rounded-lg border border-slate-200 p-4">
        <legend class="px-1 font-semibold text-slate-800">
          Posizione
        </legend>
        <p class="text-sm text-slate-600">
          La segnalazione usa la tua posizione attuale. È necessaria per inviare.
        </p>
        <button
          type="button"
          class="justify-self-start rounded-lg px-4 py-2 font-semibold"
          :class="
            hasLocation
              ? 'bg-emerald-700 text-white'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-700'
          "
          :disabled="locating"
          @click="detectLocation"
        >
          <template v-if="locating">
            Richiesta in corso…
          </template>
          <template v-else-if="hasLocation">
            Posizione acquisita ✓
          </template>
          <template v-else>
            Consenti la posizione
          </template>
        </button>
        <p
          v-if="locationStatus"
          class="text-sm text-slate-600"
          role="status"
        >
          {{ locationStatus }}
        </p>
      </fieldset>

      <label class="grid gap-1.5 font-semibold text-slate-800">
        Località (facoltativa)
        <input
          v-model="form.locationLabel"
          type="text"
          maxlength="120"
          class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal text-slate-900"
        >
      </label>

      <!-- Captcha anti-spam: mostrato solo se configurato -->
      <div
        v-if="captchaEnabled"
        ref="turnstileEl"
        class="min-h-[65px]"
      />

      <label class="flex items-start gap-2 font-normal text-slate-700">
        <input
          v-model="form.consent"
          type="checkbox"
          required
          class="mt-1 h-4 w-4"
        >
        Accetto le regole editoriali e l'informativa sulla privacy.
      </label>

      <!-- Campo honeypot anti-bot: nascosto agli utenti reali -->
      <label
        class="absolute left-[-9999px] h-px w-px overflow-hidden"
        aria-hidden="true"
      >
        Non compilare questo campo
        <input
          v-model="form.honeypot"
          type="text"
          tabindex="-1"
          autocomplete="off"
        >
      </label>

      <button
        class="rounded-lg bg-emerald-700 px-5 py-2.5 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        type="submit"
        :disabled="submitting || !hasLocation"
      >
        {{ submitting ? 'Invio in corso…' : 'Invia segnalazione' }}
      </button>
    </form>
  </section>
</template>
