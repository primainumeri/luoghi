<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/lib/auth';
import {
  fetchQueue,
  fetchSubmissionMedia,
  publishSubmission,
  rejectSubmission,
  type QueueItem,
} from '@/lib/moderation';
import { fetchActiveCategories } from '@/lib/categories';
import { PLACE_TYPE_COLORS, PLACE_TYPE_LABELS, isPlaceType } from '@/lib/labels';
import type { Category } from '@/lib/types';

const router = useRouter();
const { session, signOut } = useAuth();

const ready = ref(false);
const loading = ref(false);
const error = ref<string | null>(null);
const items = ref<QueueItem[]>([]);
const busyId = ref<string | null>(null);
const categoriesById = ref<Record<string, Category>>({});

function typeLabel(t: string): string {
  return isPlaceType(t) ? PLACE_TYPE_LABELS[t] : t;
}
function typeColor(t: string): string {
  return isPlaceType(t) ? PLACE_TYPE_COLORS[t] : '#64748b';
}
function categoryLabel(id: string): string {
  return categoriesById.value[id]?.label ?? 'Categoria';
}
function categoryColor(id: string): string {
  return categoriesById.value[id]?.color ?? '#64748b';
}
function mapsUrl(item: QueueItem): string {
  return `https://www.google.com/maps/search/?api=1&query=${item.lat},${item.lng}`;
}

async function load() {
  loading.value = true;
  error.value = null;
  try {
    const [queue, cats] = await Promise.all([fetchQueue(), fetchActiveCategories()]);
    categoriesById.value = Object.fromEntries(cats.map((c) => [c.id, c]));
    await Promise.all(
      queue.map(async (it) => {
        it.mediaUrls = await fetchSubmissionMedia(it.id);
      }),
    );
    items.value = queue;
  } catch (e) {
    error.value = 'Impossibile caricare la coda.';
     
    console.error(e);
  } finally {
    loading.value = false;
  }
}

async function onReject(item: QueueItem) {
  const reason = window.prompt('Motivazione del rifiuto:');
  if (!reason || !reason.trim()) return;
  busyId.value = item.id;
  try {
    await rejectSubmission(item.id, reason.trim());
    await load();
  } catch (e) {
    error.value = 'Rifiuto non riuscito.';
     
    console.error(e);
  } finally {
    busyId.value = null;
  }
}

async function onPublish(item: QueueItem) {
  busyId.value = item.id;
  try {
    await publishSubmission({
      submissionId: item.id,
      title: item.title,
      description: item.description,
      proposal: item.proposal ?? undefined,
      publicStatus: 'segnalato',
    });
    await load();
  } catch (e) {
    error.value = 'Pubblicazione non riuscita.';
     
    console.error(e);
  } finally {
    busyId.value = null;
  }
}

async function onSignOut() {
  await signOut();
  router.push({ name: 'login' });
}

onMounted(async () => {
  ready.value = true;
  if (session.value) await load();
});
</script>

<template>
  <section class="mx-auto max-w-4xl px-4 py-6">
    <div class="flex items-center justify-between gap-4">
      <h1 class="text-2xl font-bold text-slate-900">
        Moderazione
      </h1>
      <button
        v-if="session"
        class="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700"
        type="button"
        @click="onSignOut"
      >
        Esci
      </button>
    </div>

    <p
      v-if="ready && !session"
      class="mt-4 text-slate-700"
      role="alert"
    >
      Sessione non attiva.
      <router-link
        to="/accedi"
        class="font-semibold text-emerald-700"
      >
        Accedi
      </router-link>
      per continuare.
    </p>

    <template v-else>
      <p
        v-if="error"
        class="mt-4 font-semibold text-red-700"
        role="alert"
      >
        {{ error }}
      </p>
      <p
        v-if="loading"
        class="mt-4 text-slate-600"
        role="status"
      >
        Caricamento della coda…
      </p>
      <p
        v-else-if="items.length === 0"
        class="mt-4 text-slate-600"
        role="status"
      >
        Nessuna segnalazione in attesa.
      </p>

      <ul
        v-else
        class="mt-6 grid gap-5"
      >
        <li
          v-for="item in items"
          :key="item.id"
          class="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[220px_1fr]"
        >
          <!-- Foto caricata -->
          <div class="grid gap-2">
            <img
              v-for="(url, i) in item.mediaUrls"
              :key="url"
              :src="url"
              :alt="`Foto ${i + 1} della segnalazione`"
              class="aspect-[3/4] w-full rounded-lg border border-slate-200 object-cover"
            >
            <p
              v-if="!item.mediaUrls || item.mediaUrls.length === 0"
              class="flex aspect-[3/4] items-center justify-center rounded-lg border border-dashed border-slate-300 text-sm text-slate-400"
            >
              Nessuna foto
            </p>
          </div>

          <!-- Contenuto + azioni -->
          <div class="flex flex-col gap-3">
            <div class="flex flex-wrap items-center gap-2">
              <span
                class="rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
                :style="{ backgroundColor: typeColor(item.type) }"
              >
                {{ typeLabel(item.type) }}
              </span>
              <span
                class="rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
                :style="{ backgroundColor: categoryColor(item.category_id) }"
              >
                {{ categoryLabel(item.category_id) }}
              </span>
              <span
                v-if="item.location_label"
                class="text-sm text-slate-500"
              >
                {{ item.location_label }}
              </span>
            </div>

            <h2 class="text-lg font-semibold text-slate-900">
              {{ item.title }}
            </h2>
            <p class="whitespace-pre-line text-slate-700">
              {{ item.description }}
            </p>
            <p
              v-if="item.proposal"
              class="text-slate-700"
            >
              <strong>Proposta:</strong> {{ item.proposal }}
            </p>

            <a
              :href="mapsUrl(item)"
              target="_blank"
              rel="noopener"
              class="inline-flex w-fit items-center gap-1.5 font-semibold text-emerald-700"
            >
              📍 Vai alla posizione
            </a>

            <div class="mt-1 flex gap-2">
              <button
                class="rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white disabled:opacity-50"
                type="button"
                :disabled="busyId === item.id"
                @click="onPublish(item)"
              >
                Pubblica
              </button>
              <button
                class="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 disabled:opacity-50"
                type="button"
                :disabled="busyId === item.id"
                @click="onReject(item)"
              >
                Rifiuta
              </button>
            </div>
          </div>
        </li>
      </ul>
    </template>
  </section>
</template>
