<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, shallowRef } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { fetchPublishedPlaces } from '@/lib/places';
import {
  PLACE_TYPE_COLORS,
  PLACE_TYPE_ICONS,
  PLACE_TYPE_LABELS,
  isPlaceType,
} from '@/lib/labels';
import type { Place } from '@/lib/types';
import { isMobileDevice } from '@/lib/device';
import { SITE_URL } from '@/lib/site';
import ShareButtons from '@/components/ShareButtons.vue';

// Su desktop la segnalazione non e' disponibile: invitiamo a usare il telefono.
const isDesktop = !isMobileDevice();
// Su mobile la home e' una call-to-action: la mappa si apre solo su richiesta.
const showMap = ref(isDesktop);

// Centro predefinito: Policastro Bussentino (Comune di Santa Marina).
const DEFAULT_CENTER: [number, number] = [15.4783, 40.0783];
const DEFAULT_ZOOM = 13;

// Sfondo OpenStreetMap (raster tiles) come default.
const OSM_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      maxzoom: 19,
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    },
  },
  layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
};

// Sfondo ibrido: satellite Esri World Imagery + etichette (confini e località).
// MapLibre non può usare le tile di Google (vincoli tecnici e di licenza):
// Esri World Imagery è gratuito e non richiede chiave.
const HYBRID_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    'esri-imagery': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      maxzoom: 19,
      attribution: 'Imagery © Esri, Maxar, Earthstar Geographics',
    },
    'esri-transportation': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      maxzoom: 19,
      attribution: '© Esri',
    },
    'esri-labels': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      maxzoom: 19,
      attribution: '© Esri',
    },
  },
  layers: [
    { id: 'esri-imagery', type: 'raster', source: 'esri-imagery' },
    { id: 'esri-transportation', type: 'raster', source: 'esri-transportation' },
    { id: 'esri-labels', type: 'raster', source: 'esri-labels' },
  ],
};

// Se è configurato uno style esterno lo usiamo e nascondiamo il selettore.
const externalStyle = import.meta.env.VITE_MAP_STYLE_URL as string | undefined;
const canToggleBase = !externalStyle;
const baseMode = ref<'osm' | 'hybrid'>('hybrid');

const router = useRouter();
const mapContainer = ref<HTMLDivElement | null>(null);
const map = shallowRef<maplibregl.Map | null>(null);
const markers: maplibregl.Marker[] = [];

const loading = ref(true);
const error = ref<string | null>(null);
const places = ref<Place[]>([]);

function setBase(mode: 'osm' | 'hybrid') {
  if (!canToggleBase || baseMode.value === mode) return;
  baseMode.value = mode;
  const m = map.value;
  if (!m) return;
  // I marker sono elementi DOM (non parte dello style): restano dopo setStyle.
  m.setStyle(mode === 'hybrid' ? HYBRID_STYLE : OSM_STYLE);
}

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
    const icon = document.createElement('span');
    icon.className = 'map-marker__icon';
    icon.textContent = PLACE_TYPE_ICONS[type];
    icon.setAttribute('aria-hidden', 'true');
    el.appendChild(icon);
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

// Inizializza la mappa (solo quando il contenitore è montato/visibile).
function initMap() {
  if (map.value || !mapContainer.value) return;
  const m = new maplibregl.Map({
    container: mapContainer.value,
    style: externalStyle || (baseMode.value === 'hybrid' ? HYBRID_STYLE : OSM_STYLE),
    center: DEFAULT_CENTER,
    zoom: DEFAULT_ZOOM,
  });
  m.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

  // Recupera automaticamente la posizione dal dispositivo (telefono).
  const geolocate = new maplibregl.GeolocateControl({
    positionOptions: { enableHighAccuracy: true },
    trackUserLocation: true,
    showUserLocation: true,
  });
  m.addControl(geolocate, 'top-right');

  map.value = m;
  m.on('load', () => {
    loadPlaces();
    geolocate.trigger();
  });
}

function openMap() {
  showMap.value = true;
  // Attende il render del contenitore prima di creare la mappa.
  requestAnimationFrame(() => initMap());
}

onMounted(() => {
  if (showMap.value) initMap();
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

    <!-- Home mobile: call-to-action prima della mappa. -->
    <div
      v-if="!showMap"
      class="map-cta"
    >
      <div class="map-cta__inner">
        <span
          class="map-cta__icon"
          aria-hidden="true"
        >📸</span>
        <h2 class="map-cta__title">
          Aiutaci a migliorare
          <span>questo paese</span>
        </h2>
        <p class="map-cta__lead">
          Vedi qualcosa che non va, o un luogo da valorizzare?
          Bastano una foto e poche parole. Niente moduli, niente politica.
        </p>
        <RouterLink
          to="/segnala"
          class="map-cta__btn"
        >
          <span aria-hidden="true">📸</span>
          Segnala
        </RouterLink>
        <button
          type="button"
          class="map-cta__link"
          @click="openMap"
        >
          Esplora la mappa
        </button>
        <ShareButtons
          class="map-cta__share"
          :url="SITE_URL"
        />
      </div>
    </div>

    <template v-if="showMap">
      <ShareButtons
        v-if="isDesktop"
        class="map-view__share"
        compact
        :url="SITE_URL"
      />

      <div
        v-if="isDesktop"
        class="map-view__cta"
        role="note"
      >
        <span aria-hidden="true">📱</span>
        Apri questa pagina col telefono per contribuire con le tue segnalazioni.
      </div>

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
        v-if="canToggleBase && isDesktop"
        class="map-view__base-toggle"
        role="group"
        aria-label="Tipo di mappa"
      >
        <button
          type="button"
          :class="{ 'is-active': baseMode === 'osm' }"
          @click="setBase('osm')"
        >
          Mappa
        </button>
        <button
          type="button"
          :class="{ 'is-active': baseMode === 'hybrid' }"
          @click="setBase('hybrid')"
        >
          Ibrida
        </button>
      </div>
    </template>

    <div
      v-show="showMap"
      ref="mapContainer"
      class="map-view__canvas"
      role="application"
      aria-label="Mappa"
    />

    <div
      v-if="showMap && !isDesktop"
      class="map-view__report-bar"
    >
      <button
        type="button"
        class="map-view__report-btn"
        @click="showMap = false"
      >
        <span aria-hidden="true">📸</span>
        Segnala
      </button>
    </div>
  </section>
</template>

<style scoped>
.map-view {
  position: relative;
  /* Palette "volantino" per i controlli sopra la mappa. */
  --map-navy: #1f3d6b;
  --map-orange: #d9663b;
  --map-paper: #fbf7ec;
  --map-border: #e5dcc5;
  --map-ink: #26303f;
}

.map-cta {
  min-height: calc(100vh - 140px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: var(--map-paper);
}

.map-cta__inner {
  max-width: 30rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;
}

.map-cta__icon {
  font-size: 3.5rem;
  line-height: 1;
}

.map-cta__title {
  margin: 0;
  font-size: clamp(2rem, 8vw, 2.8rem);
  font-weight: 900;
  line-height: 1.02;
  text-transform: uppercase;
  color: var(--map-navy);
}

.map-cta__title span {
  color: var(--map-orange);
}

.map-cta__lead {
  margin: 0;
  max-width: 30ch;
  color: var(--map-ink);
  font-size: 1.05rem;
}

.map-cta__btn {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  margin-top: 0.5rem;
  padding: 1.05rem 2.4rem;
  border-radius: 999px;
  background: var(--map-orange);
  color: #fff;
  font-size: 1.35rem;
  font-weight: 800;
  text-decoration: none;
  box-shadow: 0 8px 22px rgba(217, 102, 59, 0.4);
}

.map-cta__btn span {
  font-size: 1.5rem;
}

.map-cta__link {
  border: 0;
  background: none;
  color: var(--map-navy);
  font-weight: 700;
  font-size: 1rem;
  text-decoration: underline;
  cursor: pointer;
  padding: 0.4rem;
}

.map-cta__share {
  margin-top: 0.75rem;
  justify-content: center;
}

.map-view__share {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  z-index: 6;
}

.map-view__cta {
  position: absolute;
  left: 50%;
  bottom: 1.25rem;
  transform: translateX(-50%);
  z-index: 6;
  max-width: min(92%, 560px);
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: var(--map-orange);
  color: #fff;
  font-weight: 800;
  padding: 0.8rem 1.2rem;
  border-radius: 999px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.28);
  text-align: left;
}

.map-view__cta span {
  font-size: 1.4rem;
}

.map-view__report-bar {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 7;
  display: flex;
  justify-content: center;
  padding: 0.9rem 1rem calc(0.9rem + env(safe-area-inset-bottom));
  background: linear-gradient(to top, rgba(0, 0, 0, 0.2), transparent);
  pointer-events: none;
}

.map-view__report-btn {
  pointer-events: auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  max-width: 420px;
  padding: 1rem 1.5rem;
  border: 0;
  border-radius: 999px;
  background: var(--map-orange);
  color: #fff;
  font-size: 1.2rem;
  font-weight: 800;
  text-decoration: none;
  cursor: pointer;
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.3);
}

.map-view__report-btn span {
  font-size: 1.35rem;
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
  background: var(--map-paper);
  border: 1px solid var(--map-border);
  border-radius: 999px;
  color: var(--map-ink);
  font-weight: 600;
  padding: 0.5rem 0.9rem;
  margin: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

.map-view__status--error {
  border-color: var(--color-danger);
  color: var(--color-danger);
}

.map-view__base-toggle {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  z-index: 5;
  display: inline-flex;
  overflow: hidden;
  border: 1px solid var(--map-border);
  border-radius: 999px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
}

.map-view__base-toggle button {
  border: 0;
  background: var(--map-paper);
  color: var(--map-navy);
  padding: 0.4rem 0.9rem;
  font-weight: 700;
  cursor: pointer;
}

.map-view__base-toggle button + button {
  border-left: 1px solid var(--map-border);
}

.map-view__base-toggle button.is-active {
  background: var(--map-navy);
  color: #fff;
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
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  border: 2px solid #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
  cursor: pointer;
  padding: 0;
}

:deep(.map-marker__icon) {
  transform: rotate(45deg);
  font-size: 14px;
  line-height: 1;
  pointer-events: none;
}
</style>
