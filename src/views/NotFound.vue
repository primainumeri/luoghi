<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>

<template>
  <section class="container not-found">
    <h1>Pagina non trovata</h1>
    <p>La pagina richiesta non esiste o è stata spostata.</p>
    <p>
      <RouterLink
        to="/"
        class="btn"
      >
        Torna alla mappa
      </RouterLink>
    </p>
  </section>
</template>

<style scoped>
.not-found {
  padding-block: 2rem;
}
</style>
