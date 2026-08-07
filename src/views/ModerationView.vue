<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/lib/auth';
import {
  fetchQueue,
  publishSubmission,
  rejectSubmission,
  type QueueItem,
} from '@/lib/moderation';
import { PLACE_TYPE_LABELS, isPlaceType } from '@/lib/labels';

const router = useRouter();
const { session, signOut } = useAuth();

const ready = ref(false);
const loading = ref(false);
const error = ref<string | null>(null);
const items = ref<QueueItem[]>([]);
const busyId = ref<string | null>(null);

function typeLabel(t: string): string {
  return isPlaceType(t) ? PLACE_TYPE_LABELS[t] : t;
}

async function load() {
  loading.value = true;
  error.value = null;
  try {
    items.value = await fetchQueue();
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
  <section class="container moderation-view">
    <div class="moderation-view__head">
      <h1>Moderazione</h1>
      <button
        v-if="session"
        class="btn btn--ghost"
        type="button"
        @click="onSignOut"
      >
        Esci
      </button>
    </div>

    <p
      v-if="ready && !session"
      role="alert"
    >
      Sessione non attiva. <RouterLink to="/accedi">
        Accedi
      </RouterLink> per continuare.
    </p>

    <template v-else>
      <p
        v-if="error"
        role="alert"
        class="moderation-view__error"
      >
        {{ error }}
      </p>
      <p
        v-if="loading"
        role="status"
      >
        Caricamento della coda…
      </p>
      <p
        v-else-if="items.length === 0"
        role="status"
      >
        Nessuna segnalazione in attesa.
      </p>

      <ul
        v-else
        class="moderation-view__list"
      >
        <li
          v-for="item in items"
          :key="item.id"
          class="moderation-item"
        >
          <div class="moderation-item__body">
            <p class="moderation-item__meta">
              <span class="tag">{{ typeLabel(item.type) }}</span>
              <span
                v-if="item.location_label"
                class="moderation-item__loc"
              >
                {{ item.location_label }}
              </span>
            </p>
            <h2>{{ item.title }}</h2>
            <p>{{ item.description }}</p>
            <p v-if="item.proposal">
              <strong>Proposta:</strong> {{ item.proposal }}
            </p>
          </div>
          <div class="moderation-item__actions">
            <button
              class="btn"
              type="button"
              :disabled="busyId === item.id"
              @click="onPublish(item)"
            >
              Pubblica
            </button>
            <button
              class="btn btn--ghost"
              type="button"
              :disabled="busyId === item.id"
              @click="onReject(item)"
            >
              Rifiuta
            </button>
          </div>
        </li>
      </ul>
    </template>
  </section>
</template>

<style scoped>
.moderation-view {
  padding-block: 1rem 2rem;
}

.moderation-view__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.moderation-view__list {
  list-style: none;
  padding: 0;
  display: grid;
  gap: 1rem;
}

.moderation-item {
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 1rem;
}

.moderation-item__actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 140px;
}

.moderation-item__meta {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.moderation-item__loc {
  color: var(--color-muted);
}

.tag {
  display: inline-block;
  padding: 0.15rem 0.6rem;
  border-radius: 999px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  font-size: 0.85rem;
}

.moderation-view__error {
  color: var(--color-danger);
}
</style>
