<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { fetchPlaceMedia } from '@/lib/places';
import {
  PLACE_TYPE_LABELS,
  PLACE_TYPE_ICONS,
  PLACE_TYPE_COLORS,
  PUBLIC_STATUS_LABELS,
  isPlaceType,
} from '@/lib/labels';
import type { Place, PublicStatus } from '@/lib/types';

const props = defineProps<{ place: Place | null }>();
const emit = defineEmits<{ close: [] }>();

const photos = ref<string[]>([]);
const mediaLoading = ref(false);

function typeLabel(type: string): string {
  return isPlaceType(type) ? PLACE_TYPE_LABELS[type] : type;
}
function typeIcon(type: string): string {
  return isPlaceType(type) ? PLACE_TYPE_ICONS[type] : '📍';
}
function typeColor(type: string): string {
  return isPlaceType(type) ? PLACE_TYPE_COLORS[type] : '#1f3d6b';
}
function statusLabel(status: string): string {
  return PUBLIC_STATUS_LABELS[status as PublicStatus] ?? status;
}

async function loadMedia(id: string) {
  photos.value = [];
  mediaLoading.value = true;
  try {
    photos.value = await fetchPlaceMedia(id);
  } catch (e) {
    console.error(e);
  } finally {
    mediaLoading.value = false;
  }
}

watch(
  () => props.place,
  (place) => {
    if (place) loadMedia(place.id);
  },
  { immediate: true },
);

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close');
}
onMounted(() => document.addEventListener('keydown', onKeydown));
onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown));
</script>

<template>
  <Transition name="modal">
    <div
      v-if="place"
      class="place-modal"
      role="dialog"
      aria-modal="true"
      :aria-label="place.title"
      @click.self="emit('close')"
    >
      <div class="place-modal__card">
        <button
          type="button"
          class="place-modal__close"
          aria-label="Chiudi"
          @click="emit('close')"
        >
          ×
        </button>

        <div
          v-if="mediaLoading"
          class="place-modal__photo place-modal__photo--empty"
        >
          Caricamento foto…
        </div>
        <img
          v-else-if="photos.length"
          class="place-modal__photo"
          :src="photos[0]"
          :alt="`Foto di ${place.title}`"
        >
        <div
          v-else
          class="place-modal__photo place-modal__photo--empty"
        >
          <span aria-hidden="true">📷</span>
          Nessuna foto disponibile
        </div>

        <div class="place-modal__body">
          <div class="place-modal__tags">
            <span
              class="place-modal__type"
              :style="{ background: typeColor(place.type) }"
            >
              <span aria-hidden="true">{{ typeIcon(place.type) }}</span>
              {{ typeLabel(place.type) }}
            </span>
            <span class="place-modal__status">
              {{ statusLabel(place.public_status) }}
            </span>
          </div>

          <h2 class="place-modal__title">
            {{ place.title }}
          </h2>

          <p
            v-if="place.location_label"
            class="place-modal__location"
          >
            📍 {{ place.location_label }}
          </p>

          <p
            v-if="place.summary"
            class="place-modal__summary"
          >
            {{ place.summary }}
          </p>
          <p
            v-if="place.description"
            class="place-modal__text"
          >
            {{ place.description }}
          </p>

          <div
            v-if="place.proposal"
            class="place-modal__proposal"
          >
            <strong>Proposta</strong>
            <p>{{ place.proposal }}</p>
          </div>

          <p class="place-modal__author">
            Segnalazione della comunità di Prima i luoghi
          </p>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.place-modal {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(15, 23, 42, 0.55);
}

.place-modal__card {
  position: relative;
  width: 100%;
  max-width: 30rem;
  max-height: 90vh;
  overflow: auto;
  background: #fbf7ec;
  border-radius: 18px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
}

.place-modal__close {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  z-index: 2;
  width: 2.2rem;
  height: 2.2rem;
  border: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.9);
  color: #1f3d6b;
  font-size: 1.6rem;
  line-height: 1;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.place-modal__photo {
  width: 100%;
  height: 220px;
  object-fit: cover;
  display: block;
  border-radius: 18px 18px 0 0;
  background: #e5dcc5;
}

.place-modal__photo--empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  color: #6b6350;
  font-weight: 600;
}

.place-modal__photo--empty span {
  font-size: 2rem;
}

.place-modal__body {
  padding: 1rem 1.25rem 1.5rem;
}

.place-modal__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.6rem;
}

.place-modal__type {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.7rem;
  border-radius: 999px;
  color: #fff;
  font-weight: 700;
  font-size: 0.85rem;
}

.place-modal__status {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.7rem;
  border-radius: 999px;
  border: 1px solid #e5dcc5;
  background: #fff;
  color: #1f3d6b;
  font-weight: 700;
  font-size: 0.85rem;
}

.place-modal__title {
  margin: 0 0 0.35rem;
  color: #1f3d6b;
  font-size: 1.5rem;
  font-weight: 800;
  line-height: 1.15;
}

.place-modal__location {
  margin: 0 0 0.6rem;
  color: #6b6350;
  font-weight: 600;
}

.place-modal__summary {
  margin: 0 0 0.5rem;
  color: #26303f;
  font-weight: 600;
}

.place-modal__text {
  margin: 0 0 0.75rem;
  color: #26303f;
  white-space: pre-line;
}

.place-modal__proposal {
  margin: 0.5rem 0 0.75rem;
  padding: 0.75rem 0.9rem;
  background: #fff;
  border: 1px solid #e5dcc5;
  border-radius: 12px;
}

.place-modal__proposal strong {
  display: block;
  margin-bottom: 0.25rem;
  color: #1f3d6b;
}

.place-modal__proposal p {
  margin: 0;
  color: #26303f;
}

.place-modal__author {
  margin: 0.75rem 0 0;
  color: #6b6350;
  font-size: 0.9rem;
  font-style: italic;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.18s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
