<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { fetchActiveCategories } from '@/lib/categories';
import { submitReport } from '@/lib/submissions';
import { PLACE_TYPE_LABELS } from '@/lib/labels';
import type { Category, PlaceType } from '@/lib/types';

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
  email: '',
  consent: false,
  honeypot: '',
});

const submitting = ref(false);
const submitError = ref<string | null>(null);
const reference = ref<string | null>(null);

const locating = ref(false);
const locationStatus = ref<string | null>(null);
const hasLocation = computed(
  () => form.value.lng !== '' && form.value.lat !== '',
);

const types: PlaceType[] = ['criticita', 'risorsa', 'proposta'];

// La posizione è obbligatoria: senza consenso non si può inviare.
function detectLocation() {
  if (!('geolocation' in navigator)) {
    locationStatus.value =
      'Geolocalizzazione non disponibile su questo dispositivo.';
    return;
  }
  locating.value = true;
  locationStatus.value = 'Richiesta di accesso alla posizione in corso…';
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
        'Accesso alla posizione negato. Consentilo per inviare la segnalazione.';
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
    return 'Consenti l\'accesso alla posizione per inviare la segnalazione.';
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.value.email)) {
    return 'Inserisci un indirizzo e-mail valido.';
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
    reference.value = await submitReport({
      title: form.value.title.trim(),
      description: form.value.description.trim(),
      type: form.value.type,
      categoryId: form.value.categoryId,
      proposal: form.value.proposal.trim() || undefined,
      lng: Number(form.value.lng),
      lat: Number(form.value.lat),
      locationLabel: form.value.locationLabel.trim() || undefined,
      email: form.value.email.trim(),
      consent: form.value.consent,
      honeypot: form.value.honeypot,
    });
  } catch (e) {
    submitError.value =
      'Invio non riuscito. Controlla i dati e riprova più tardi.';
     
    console.error(e);
  } finally {
    submitting.value = false;
  }
}

onMounted(async () => {
  detectLocation();
  try {
    categories.value = await fetchActiveCategories();
  } catch (e) {
    loadError.value = 'Impossibile caricare le categorie.';
     
    console.error(e);
  }
});
</script>

<template>
  <section class="mx-auto w-[min(100%-2rem,640px)] py-6">
    <h1 class="mb-2 text-2xl font-bold text-gray-900">
      Segnala un luogo
    </h1>

    <p
      class="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600"
      role="note"
    >
      Questo non è un canale di emergenza. Per situazioni urgenti contatta i
      numeri di soccorso. Il contenuto non viene pubblicato automaticamente: sarà
      valutato dal gruppo editoriale. L'e-mail serve solo per eventuali
      chiarimenti e non viene mai pubblicata.
    </p>

    <div
      v-if="reference"
      class="rounded-lg border border-emerald-200 bg-emerald-50 p-4"
      role="status"
    >
      <h2 class="text-lg font-semibold text-emerald-800">
        Segnalazione ricevuta
      </h2>
      <p class="mt-1 text-emerald-900">
        Grazie. Riferimento: <strong>{{ reference }}</strong>.
      </p>
    </div>

    <form
      v-else
      class="grid gap-5"
      novalidate
      @submit.prevent="onSubmit"
    >
      <p
        v-if="loadError"
        class="text-red-700"
        role="alert"
      >
        {{ loadError }}
      </p>
      <p
        v-if="submitError"
        class="font-medium text-red-700"
        role="alert"
      >
        {{ submitError }}
      </p>

      <fieldset class="grid gap-2 rounded-lg border border-gray-200 p-4">
        <legend class="px-1 font-semibold text-gray-900">
          Tipo
        </legend>
        <div class="flex flex-wrap gap-x-6 gap-y-1">
          <label
            v-for="t in types"
            :key="t"
            class="inline-flex items-center gap-2 text-gray-900"
          >
            <input
              v-model="form.type"
              type="radio"
              :value="t"
              class="h-4 w-4 accent-emerald-700"
            >
            {{ PLACE_TYPE_LABELS[t] }}
          </label>
        </div>
      </fieldset>

      <label class="grid gap-1.5 font-semibold text-gray-900">
        Categoria
        <select
          v-model="form.categoryId"
          required
          class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 font-normal focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
        >
          <option
            value=""
            disabled
          >Seleziona…</option>
          <option
            v-for="c in categories"
            :key="c.id"
            :value="c.id"
          >
            {{ c.label }}
          </option>
        </select>
      </label>

      <label class="grid gap-1.5 font-semibold text-gray-900">
        Titolo
        <input
          v-model="form.title"
          type="text"
          maxlength="120"
          required
          class="w-full rounded-lg border border-gray-300 px-3 py-2 font-normal focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
        >
      </label>

      <label class="grid gap-1.5 font-semibold text-gray-900">
        Descrizione
        <textarea
          v-model="form.description"
          rows="5"
          maxlength="2000"
          required
          class="w-full resize-y rounded-lg border border-gray-300 px-3 py-2 font-normal focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
        />
      </label>

      <label class="grid gap-1.5 font-semibold text-gray-900">
        Proposta (facoltativa)
        <textarea
          v-model="form.proposal"
          rows="3"
          maxlength="1000"
          class="w-full resize-y rounded-lg border border-gray-300 px-3 py-2 font-normal focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
        />
      </label>

      <fieldset class="grid gap-2 rounded-lg border border-gray-200 p-4">
        <legend class="px-1 font-semibold text-gray-900">
          Posizione
        </legend>
        <p class="text-sm text-gray-600">
          Per inviare la segnalazione è necessario consentire l'accesso alla tua
          posizione. Le coordinate servono solo a collocare il luogo sulla mappa.
        </p>
        <button
          type="button"
          :disabled="locating"
          class="inline-flex w-fit items-center gap-2 rounded-lg border border-emerald-700 px-4 py-2 font-medium disabled:opacity-60"
          :class="
            hasLocation
              ? 'bg-emerald-50 text-emerald-800'
              : 'bg-emerald-700 text-white'
          "
          @click="detectLocation"
        >
          {{
            locating
              ? 'Richiesta in corso…'
              : hasLocation
                ? 'Posizione acquisita ✓'
                : 'Consenti la posizione'
          }}
        </button>
        <p
          v-if="locationStatus"
          class="text-sm"
          :class="hasLocation ? 'text-emerald-700' : 'text-gray-600'"
          role="status"
        >
          {{ locationStatus }}
        </p>
      </fieldset>

      <label class="grid gap-1.5 font-semibold text-gray-900">
        Località (facoltativa)
        <input
          v-model="form.locationLabel"
          type="text"
          maxlength="120"
          class="w-full rounded-lg border border-gray-300 px-3 py-2 font-normal focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
        >
      </label>

      <label class="grid gap-1.5 font-semibold text-gray-900">
        E-mail (non sarà pubblicata)
        <input
          v-model="form.email"
          type="email"
          required
          class="w-full rounded-lg border border-gray-300 px-3 py-2 font-normal focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
        >
      </label>

      <label class="flex items-start gap-2 text-gray-900">
        <input
          v-model="form.consent"
          type="checkbox"
          required
          class="mt-1 h-4 w-4 accent-emerald-700"
        >
        Accetto le regole editoriali e l'informativa sulla privacy.
      </label>

      <!-- Campo honeypot anti-bot: nascosto agli utenti, non compilabile via tastiera. -->
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
        type="submit"
        :disabled="submitting || !hasLocation"
        class="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {{ submitting ? 'Invio in corso…' : 'Invia segnalazione' }}
      </button>
    </form>
  </section>
</template>
