<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'pil-install-dismissed';

const deferred = ref<BeforeInstallPromptEvent | null>(null);
const visible = ref(false);
const iosHint = ref(false);

function isStandalone(): boolean {
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    // iOS Safari
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function isIos(): boolean {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function alreadyDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISS_KEY) === '1';
  } catch {
    return false;
  }
}

function onBeforeInstallPrompt(e: Event) {
  e.preventDefault();
  deferred.value = e as BeforeInstallPromptEvent;
  if (!alreadyDismissed()) visible.value = true;
}

async function install() {
  const evt = deferred.value;
  if (!evt) return;
  await evt.prompt();
  await evt.userChoice;
  deferred.value = null;
  dismiss();
}

function dismiss() {
  visible.value = false;
  iosHint.value = false;
  try {
    localStorage.setItem(DISMISS_KEY, '1');
  } catch {
    /* localStorage non disponibile: nessun problema */
  }
}

onMounted(() => {
  if (isStandalone() || alreadyDismissed()) return;
  window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
  // iOS non emette beforeinstallprompt: mostriamo le istruzioni manuali.
  if (isIos()) {
    iosHint.value = true;
    visible.value = true;
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
});
</script>

<template>
  <div
    v-if="visible"
    class="install-prompt"
    role="dialog"
    aria-label="Installa l'app"
  >
    <div class="install-prompt__body">
      <p class="install-prompt__text">
        <strong>Salva “Prima i luoghi” sul telefono</strong>
        <template v-if="iosHint">
          Tocca il tasto Condividi e scegli “Aggiungi a Home”.
        </template>
        <template v-else>
          Aggiungila alla schermata Home per aprirla come un'app e segnalare più
          in fretta.
        </template>
      </p>
      <div class="install-prompt__actions">
        <button
          v-if="!iosHint"
          type="button"
          class="btn"
          @click="install"
        >
          Installa
        </button>
        <button
          type="button"
          class="install-prompt__dismiss"
          @click="dismiss"
        >
          Non ora
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.install-prompt {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1200;
  padding: 0.75rem 1rem calc(0.75rem + env(safe-area-inset-bottom));
  background: var(--color-bg);
  border-top: 1px solid var(--color-border);
  box-shadow: 0 -6px 20px rgba(0, 0, 0, 0.08);
}

.install-prompt__body {
  width: min(100% - 1rem, 900px);
  margin-inline: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.install-prompt__text {
  margin: 0;
  font-size: 0.95rem;
}

.install-prompt__text strong {
  display: block;
  color: var(--color-brand-dark);
}

.install-prompt__actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-left: auto;
}

.install-prompt__dismiss {
  background: transparent;
  border: 0;
  color: var(--color-muted);
  cursor: pointer;
  text-decoration: underline;
}
</style>
