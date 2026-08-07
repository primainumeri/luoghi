<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import { fetchPlaceById } from '@/lib/places';
import {
  PLACE_TYPE_LABELS,
  PUBLIC_STATUS_LABELS,
  isPlaceType,
} from '@/lib/labels';
import type { Place, PublicStatus } from '@/lib/types';

const props = defineProps<{ id: string }>();

const loading = ref(true);
const error = ref<string | null>(null);
const place = ref<Place | null>(null);

function typeLabel(type: string): string {
  return isPlaceType(type) ? PLACE_TYPE_LABELS[type] : type;
}

function statusLabel(status: string): string {
  return PUBLIC_STATUS_LABELS[status as PublicStatus] ?? status;
}

async function load(id: string) {
  loading.value = true;
  error.value = null;
  place.value = null;
  try {
    place.value = await fetchPlaceById(id);
    if (!place.value) {
      error.value = 'Scheda non trovata.';
    }
  } catch (e) {
    error.value = 'Errore nel caricamento della scheda.';
     
    console.error(e);
  } finally {
    loading.value = false;
  }
}

onMounted(() => load(props.id));
watch(
  () => props.id,
  (id) => load(id),
);
</script>

<template>
  <article class="container place-detail">
    <p>
      <RouterLink to="/">
        ← Torna alla mappa
      </RouterLink>
    </p>

    <p
      v-if="loading"
      role="status"
    >
      Caricamento…
    </p>
    <p
      v-else-if="error"
      role="alert"
    >
      {{ error }}
    </p>

    <template v-else-if="place">
      <p class="place-detail__meta">
        <span class="tag">{{ typeLabel(place.type) }}</span>
        <span class="tag tag--status">{{ statusLabel(place.public_status) }}</span>
      </p>
      <h1>{{ place.title }}</h1>
      <p
        v-if="place.location_label"
        class="place-detail__location"
      >
        {{ place.location_label }}
      </p>
      <p
        v-if="place.summary"
        class="place-detail__summary"
      >
        {{ place.summary }}
      </p>
      <p v-if="place.description">
        {{ place.description }}
      </p>
      <section v-if="place.proposal">
        <h2>Proposta</h2>
        <p>{{ place.proposal }}</p>
      </section>
    </template>
  </article>
</template>

<style scoped>
.place-detail {
  padding-block: 1rem 2rem;
}

.place-detail__meta {
  display: flex;
  gap: 0.5rem;
}

.tag {
  display: inline-block;
  padding: 0.15rem 0.6rem;
  border-radius: 999px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  font-size: 0.85rem;
}

.tag--status {
  background: var(--color-brand);
  color: #fff;
  border-color: var(--color-brand);
}

.place-detail__location {
  color: var(--color-muted);
}
</style>
