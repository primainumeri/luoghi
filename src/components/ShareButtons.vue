<script setup lang="ts">
import { ref } from 'vue';
import { SITE_URL } from '@/lib/site';

const props = withDefaults(
  defineProps<{
    url?: string;
    title?: string;
    text?: string;
    compact?: boolean;
  }>(),
  {
    url: SITE_URL,
    title: 'Prima i luoghi — la mappa civica del Cilento',
    text: 'Prima i luoghi: segnala, proponi e proteggi i luoghi del Cilento.',
    compact: false,
  },
);

const copied = ref(false);
// navigator.share è disponibile soprattutto su mobile.
const canNativeShare = typeof navigator !== 'undefined' && 'share' in navigator;

function enc(value: string) {
  return encodeURIComponent(value);
}

const whatsapp = () => `https://wa.me/?text=${enc(`${props.text} ${props.url}`)}`;
const facebook = () =>
  `https://www.facebook.com/sharer/sharer.php?u=${enc(props.url)}`;
const telegram = () =>
  `https://t.me/share/url?url=${enc(props.url)}&text=${enc(props.text)}`;
const email = () =>
  `mailto:?subject=${enc(props.title)}&body=${enc(`${props.text}\n${props.url}`)}`;

async function nativeShare() {
  try {
    await navigator.share({ title: props.title, text: props.text, url: props.url });
  } catch {
    // L'utente ha annullato la condivisione: nessuna azione.
  }
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(props.url);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch {
    copied.value = false;
  }
}
</script>

<template>
  <div
    class="share"
    :class="{ 'share--compact': compact }"
  >
    <button
      v-if="canNativeShare"
      type="button"
      class="share__btn share__btn--primary"
      @click="nativeShare"
    >
      <span aria-hidden="true">📤</span>
      <span class="share__label">Condividi</span>
    </button>

    <a
      class="share__btn"
      :href="whatsapp()"
      target="_blank"
      rel="noopener"
      aria-label="Condividi su WhatsApp"
    >
      <span aria-hidden="true">🟢</span>
      <span class="share__label">WhatsApp</span>
    </a>

    <a
      class="share__btn"
      :href="telegram()"
      target="_blank"
      rel="noopener"
      aria-label="Condividi su Telegram"
    >
      <span aria-hidden="true">✈️</span>
      <span class="share__label">Telegram</span>
    </a>

    <a
      class="share__btn"
      :href="facebook()"
      target="_blank"
      rel="noopener"
      aria-label="Condividi su Facebook"
    >
      <span aria-hidden="true">📘</span>
      <span class="share__label">Facebook</span>
    </a>

    <a
      class="share__btn"
      :href="email()"
      aria-label="Condividi via email"
    >
      <span aria-hidden="true">✉️</span>
      <span class="share__label">Email</span>
    </a>

    <button
      type="button"
      class="share__btn"
      @click="copyLink"
    >
      <span aria-hidden="true">🔗</span>
      <span class="share__label">{{ copied ? 'Copiato!' : 'Copia link' }}</span>
    </button>
  </div>
</template>

<style scoped>
.share {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.share__btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.9rem;
  border-radius: 999px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  background: #fff;
  color: inherit;
  font: inherit;
  font-weight: 600;
  font-size: 0.95rem;
  text-decoration: none;
  cursor: pointer;
  line-height: 1;
}

.share__btn:hover {
  border-color: rgba(0, 0, 0, 0.28);
}

.share__btn--primary {
  background: var(--color-brand, #1f6f5c);
  border-color: transparent;
  color: #fff;
}

.share__btn span[aria-hidden='true'] {
  font-size: 1.1rem;
}

/* Variante compatta: solo icone (usata su mappa). */
.share--compact {
  gap: 0.4rem;
}

.share--compact .share__btn {
  padding: 0.5rem;
  width: 2.4rem;
  height: 2.4rem;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.share--compact .share__label {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
