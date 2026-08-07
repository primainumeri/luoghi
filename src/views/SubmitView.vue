<script setup lang="ts">
import { onMounted, ref } from 'vue';
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

const types: PlaceType[] = ['criticita', 'risorsa', 'proposta'];

function validate(): string | null {
  if (!form.value.title.trim()) return 'Inserisci un titolo.';
  if (!form.value.description.trim()) return 'Inserisci una descrizione.';
  if (!form.value.categoryId) return 'Seleziona una categoria.';
  const lng = Number(form.value.lng);
  const lat = Number(form.value.lat);
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
    return 'Indica una posizione valida (longitudine e latitudine).';
  }
  if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
    return 'Le coordinate indicate non sono valide.';
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
  try {
    categories.value = await fetchActiveCategories();
  } catch (e) {
    loadError.value = 'Impossibile caricare le categorie.';
     
    console.error(e);
  }
});
</script>

<template>
  <section class="container submit-view">
    <h1>Segnala un luogo</h1>

    <p
      class="submit-view__notice"
      role="note"
    >
      Questo non è un canale di emergenza. Per situazioni urgenti contatta i
      numeri di soccorso. Il contenuto non viene pubblicato automaticamente: sarà
      valutato dal gruppo editoriale. L'e-mail serve solo per eventuali
      chiarimenti e non viene mai pubblicata.
    </p>

    <div
      v-if="reference"
      class="submit-view__success"
      role="status"
    >
      <h2>Segnalazione ricevuta</h2>
      <p>Grazie. Riferimento: <strong>{{ reference }}</strong>.</p>
    </div>

    <form
      v-else
      class="submit-view__form"
      novalidate
      @submit.prevent="onSubmit"
    >
      <p
        v-if="loadError"
        role="alert"
      >
        {{ loadError }}
      </p>
      <p
        v-if="submitError"
        class="submit-view__error"
        role="alert"
      >
        {{ submitError }}
      </p>

      <fieldset>
        <legend>Tipo</legend>
        <label
          v-for="t in types"
          :key="t"
          class="submit-view__radio"
        >
          <input
            v-model="form.type"
            type="radio"
            :value="t"
          >
          {{ PLACE_TYPE_LABELS[t] }}
        </label>
      </fieldset>

      <label>
        Categoria
        <select
          v-model="form.categoryId"
          required
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

      <label>
        Titolo
        <input
          v-model="form.title"
          type="text"
          maxlength="120"
          required
        >
      </label>

      <label>
        Descrizione
        <textarea
          v-model="form.description"
          rows="5"
          maxlength="2000"
          required
        />
      </label>

      <label>
        Proposta (facoltativa)
        <textarea
          v-model="form.proposal"
          rows="3"
          maxlength="1000"
        />
      </label>

      <div class="submit-view__coords">
        <label>
          Longitudine
          <input
            v-model="form.lng"
            type="number"
            step="any"
            required
          >
        </label>
        <label>
          Latitudine
          <input
            v-model="form.lat"
            type="number"
            step="any"
            required
          >
        </label>
      </div>

      <label>
        Località (facoltativa)
        <input
          v-model="form.locationLabel"
          type="text"
          maxlength="120"
        >
      </label>

      <label>
        E-mail (non sarà pubblicata)
        <input
          v-model="form.email"
          type="email"
          required
        >
      </label>

      <label class="submit-view__consent">
        <input
          v-model="form.consent"
          type="checkbox"
          required
        >
        Accetto le regole editoriali e l'informativa sulla privacy.
      </label>

      <!-- Campo honeypot anti-bot: nascosto agli utenti, non compilabile via tastiera. -->
      <label
        class="submit-view__honeypot"
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
        class="btn"
        type="submit"
        :disabled="submitting"
      >
        {{ submitting ? 'Invio in corso…' : 'Invia segnalazione' }}
      </button>
    </form>
  </section>
</template>

<style scoped>
.submit-view {
  padding-block: 1rem 2rem;
}

.submit-view__notice {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 0.75rem 1rem;
}

.submit-view__form {
  display: grid;
  gap: 1rem;
  max-width: 640px;
}

.submit-view__form label {
  display: grid;
  gap: 0.3rem;
  font-weight: 600;
}

.submit-view__form input,
.submit-view__form select,
.submit-view__form textarea {
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  font-weight: 400;
}

.submit-view__coords {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.submit-view__radio {
  display: inline-flex;
  gap: 0.3rem;
  margin-right: 1rem;
  font-weight: 400;
}

.submit-view__consent {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-weight: 400;
}

.submit-view__error {
  color: var(--color-danger);
}

.submit-view__honeypot {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

.submit-view__success {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 1rem;
}
</style>
