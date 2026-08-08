<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { CONTACT_EMAIL } from '@/lib/site';
</script>

<template>
  <article class="container page">
    <h1>Chi siamo</h1>
    <p class="page__lead">
      Siamo un gruppo promotore di cittadine e cittadini del Cilento. Il progetto
      è civico, indipendente e non partitico, ed è ancora in costruzione.
    </p>

    <h2>Perché lo facciamo</h2>
    <p>
      Il Cilento non è soltanto una cartolina: è un territorio vivente, fatto di
      strade, coste, centri storici e persone che se ne prendono cura ogni giorno.
      Vogliamo dare a chi vive e ama questi luoghi uno strumento semplice per
      osservarli, documentarli e migliorarli insieme.
    </p>

    <h2>Come lavoriamo</h2>
    <ul>
      <li>Raccogliamo segnalazioni verificabili, sempre a partire da una foto.</li>
      <li>Verifichiamo ciò che è verificabile prima di pubblicare.</li>
      <li>Trasformiamo i problemi in proposte concrete e le condividiamo.</li>
      <li>Non pubblichiamo il nome di chi segnala: chiediamo il nome solo per uso interno.</li>
    </ul>

    <h2>Trasparenza</h2>
    <p>
      Non riceviamo indicazioni da partiti o liste. Pubblicare una segnalazione
      non è un'accusa: le informazioni possono essere corrette e aggiornate.
      L'associazione formale non esiste ancora: stiamo costruendo la rete di chi
      vuole contribuire.
    </p>

    <h2>Contatti</h2>
    <p>
      Per segnalazioni particolari, correzioni o per unirti al gruppo promotore
      scrivi a
      <a :href="`mailto:${CONTACT_EMAIL}`">{{ CONTACT_EMAIL }}</a>.
    </p>

    <div class="page__actions">
      <RouterLink
        to="/diventa-revisore"
        class="btn"
      >
        Diventa revisore
      </RouterLink>
      <RouterLink
        to="/progetto"
        class="btn btn--ghost"
      >
        Torna al progetto
      </RouterLink>
    </div>
  </article>
</template>
