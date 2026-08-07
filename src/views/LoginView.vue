<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/lib/auth';

const router = useRouter();
const { signIn } = useAuth();

const email = ref('');
const password = ref('');
const error = ref<string | null>(null);
const loading = ref(false);

async function onSubmit() {
  error.value = null;
  loading.value = true;
  try {
    await signIn(email.value.trim(), password.value);
    router.push({ name: 'moderation' });
  } catch (e) {
    error.value = 'Accesso non riuscito. Verifica le credenziali.';
     
    console.error(e);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <section class="container login-view">
    <h1>Accesso moderatori</h1>
    <p>Area riservata al gruppo editoriale.</p>
    <form
      class="login-view__form"
      novalidate
      @submit.prevent="onSubmit"
    >
      <p
        v-if="error"
        role="alert"
        class="login-view__error"
      >
        {{ error }}
      </p>
      <label>
        E-mail
        <input
          v-model="email"
          type="email"
          autocomplete="username"
          required
        >
      </label>
      <label>
        Password
        <input
          v-model="password"
          type="password"
          autocomplete="current-password"
          required
        >
      </label>
      <button
        class="btn"
        type="submit"
        :disabled="loading"
      >
        {{ loading ? 'Accesso…' : 'Accedi' }}
      </button>
    </form>
  </section>
</template>

<style scoped>
.login-view {
  padding-block: 1rem 2rem;
}

.login-view__form {
  display: grid;
  gap: 1rem;
  max-width: 360px;
}

.login-view__form label {
  display: grid;
  gap: 0.3rem;
  font-weight: 600;
}

.login-view__form input {
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
}

.login-view__error {
  color: var(--color-danger);
}
</style>
