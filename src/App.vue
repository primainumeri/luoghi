<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink, RouterView, useRoute } from 'vue-router';
import { isMobileDevice } from '@/lib/device';
import { immersive } from '@/lib/uiState';
import InstallPrompt from '@/components/InstallPrompt.vue';

// La segnalazione è disponibile solo su mobile (fotocamera + posizione).
const canReport = isMobileDevice();
const isMobile = canReport;

// Su mobile la barra superiore è nascosta: un pulsante flottante riporta alla home.
const route = useRoute();
const showHomeButton = computed(
  () => route.name !== 'map' && route.name !== 'submit',
);
</script>

<template>
  <a
    class="skip-link"
    href="#main"
  >Salta al contenuto</a>
  <header
    v-if="!immersive && !isMobile"
    class="site-header"
  >
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
        <RouterLink to="/progetto">
          Progetto
        </RouterLink>
        <RouterLink to="/contribuisci">
          Contribuisci
        </RouterLink>
        <RouterLink
          v-if="canReport"
          to="/segnala"
          class="btn"
        >
          Segnala
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
      <nav
        class="site-footer__nav"
        aria-label="Pagine del progetto"
      >
        <RouterLink to="/progetto">
          Il progetto
        </RouterLink>
        <RouterLink to="/chi-siamo">
          Chi siamo
        </RouterLink>
        <RouterLink to="/obiettivi">
          Obiettivi
        </RouterLink>
        <RouterLink to="/diventa-revisore">
          Diventa revisore
        </RouterLink>
        <RouterLink to="/contribuisci">
          Contribuisci
        </RouterLink>
      </nav>
      <p>
        Progetto civico indipendente e non partitico. <strong>Non è un canale di
          emergenza</strong>: per situazioni urgenti chiama i numeri di soccorso.
      </p>
    </div>
  </footer>

  <RouterLink
    v-if="isMobile && !immersive && showHomeButton"
    to="/"
    class="home-fab"
  >
    <span aria-hidden="true">‹</span>
    Prima i luoghi
  </RouterLink>

  <InstallPrompt />
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

.site-footer__nav {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.home-fab {
  position: fixed;
  top: calc(0.6rem + env(safe-area-inset-top));
  left: 0.6rem;
  z-index: 20;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.5rem 0.9rem;
  border-radius: 999px;
  background: #1f3d6b;
  color: #fff;
  font-weight: 700;
  font-size: 0.95rem;
  text-decoration: none;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.28);
}

.home-fab span {
  font-size: 1.15rem;
  line-height: 1;
}
</style>
