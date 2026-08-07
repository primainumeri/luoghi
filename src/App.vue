<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
import { isMobileDevice } from '@/lib/device';

// La segnalazione è disponibile solo su mobile (fotocamera + posizione).
const canReport = isMobileDevice();
</script>

<template>
  <a
    class="skip-link"
    href="#main"
  >Salta al contenuto</a>
  <header class="site-header">
    <div class="container site-header__inner">
      <RouterLink
        to="/"
        class="site-header__brand"
      >
        Prima i luoghi
      </RouterLink>
      <nav
        class="site-header__nav"
        aria-label="Navigazione principale"
      >
        <RouterLink to="/">
          Mappa
        </RouterLink>
        <RouterLink
          v-if="canReport"
          to="/segnala"
          class="btn"
        >
          Segnala un luogo
        </RouterLink>
      </nav>
    </div>
  </header>

  <main
    id="main"
    tabindex="-1"
  >
    <RouterView />
  </main>

  <footer class="site-footer">
    <div class="container">
      <p>
        Progetto civico indipendente e non partitico. <strong>Non è un canale di
          emergenza</strong>: per situazioni urgenti chiama i numeri di soccorso.
      </p>
    </div>
  </footer>
</template>

<style scoped>
.site-header {
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg);
}

.site-header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-block: 0.75rem;
}

.site-header__brand {
  font-weight: 700;
  font-size: 1.15rem;
  color: var(--color-brand-dark);
  text-decoration: none;
}

.site-header__nav {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.site-footer {
  margin-top: 2rem;
  padding-block: 1.5rem;
  border-top: 1px solid var(--color-border);
  color: var(--color-muted);
  font-size: 0.9rem;
}
</style>
