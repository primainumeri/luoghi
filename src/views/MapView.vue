<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, shallowRef } from 'vue';
import { useRouter } from 'vue-router';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { fetchPublishedPlaces } from '@/lib/places';
import { PLACE_TYPE_COLORS, PLACE_TYPE_LABELS, isPlaceType } from '@/lib/labels';
import type { Place } from '@/lib/types';

// Centro predefinito: Policastro Bussentino (Comune di Santa Marina).
const DEFAULT_CENTER: [number, number] = [15.4783, 40.0783];
const DEFAULT_ZOOM = 13;

// Style demo di MapLibre come fallback se non è configurato un provider tile.
const FALLBACK_STYLE = 'https://demotiles.maplibre.org/style.json';
const styleUrl = import.meta.env.VITE_MAP_STYLE_URL || FALLBACK_STYLE;

const router = useRouter();
const mapContainer = ref<HTMLDivElement | null>(null);
const map = shallowRef<maplibregl.Map | null>(null);
const markers: maplibregl.Marker[] = [];

const loading = ref(true);
const error = ref<string | null>(null);
const places = ref<Place[]>([]);

function addMarkers(list: Place[]) {
  for (const marker of markers.splice(0)) {
    marker.remove();
  }
  const m = map.value;
  if (!m) return;

  for (const place of list) {
    const type = isPlaceType(place.type) ? place.type : 'criticita';
    const el = document.createElement('button');
    el.className = 'map-marker';
    el.style.background = PLACE_TYPE_COLORS[type];
    el.setAttribute(
      'aria-label',
      `${PLACE_TYPE_LABELS[type]}: ${place.title}. Apri la scheda.`,
    );
    el.addEventListener('click', () => {
      router.push({ name: 'place', params: { id: place.id } });
    });

    const marker = new maplibregl.Marker({ element: el })
      .setLngLat([place.lng, place.lat])
      .addTo(m);
    markers.push(marker);
  }
}

async function loadPlaces() {
  loading.value = true;
  error.value = null;
  try {
    places.value = await fetchPublishedPlaces();
    addMarkers(places.value);
  } catch (e) {
    error.value =
      'Non è stato possibile caricare i luoghi. Riprova più tardi.';
     
    console.error(e);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  if (!mapContainer.value) return;
  const m = new maplibregl.Map({
    container: mapContainer.value,
    style: styleUrl,
    center: DEFAULT_CENTER,
    zoom: DEFAULT_ZOOM,
  });
  m.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
  map.value = m;
  m.on('load', loadPlaces);
});

onBeforeUnmount(() => {
  for (const marker of markers.splice(0)) marker.remove();
  map.value?.remove();
});
</script>

<template>
  <section class="map-view">
    <h1 class="visually-hidden">
      Mappa dei luoghi pubblicati
    </h1>

    <p
      v-if="error"
      class="map-view__status map-view__status--error"
      role="alert"
    >
      {{ error }}
    </p>
    <p
      v-else-if="loading"
      class="map-view__status"
      role="status"
    >
      Caricamento della mappa…
    </p>
    <p
      v-else-if="places.length === 0"
      class="map-view__status"
      role="status"
    >
      Nessun luogo pubblicato al momento.
    </p>

    <div
      ref="mapContainer"
      class="map-view__canvas"
      role="application"
      aria-label="Mappa"
    />
  </section>
</template>

<style scoped>
.map-view {
  position: relative;
}

.map-view__canvas {
  width: 100%;
  height: calc(100vh - 140px);
  min-height: 320px;
}

.map-view__status {
  position: absolute;
  top: 0.75rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 5;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 0.5rem 0.9rem;
  margin: 0;
}

.map-view__status--error {
  border-color: var(--color-danger);
  color: var(--color-danger);
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

:deep(.map-marker) {
  width: 22px;
  height: 22px;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  border: 2px solid #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
  cursor: pointer;
  padding: 0;
}
</style>
