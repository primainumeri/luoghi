<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { CONTACT_EMAIL } from '@/lib/site';

const subject = encodeURIComponent('Candidatura revisore — Prima i Luoghi');
</script>

<template>
  <article class="container page">
    <h1>Diventa revisore</h1>
    <p class="page__lead">
      I revisori sono il cuore del progetto: leggono le segnalazioni, verificano
      ciò che è verificabile e aiutano a trasformarle in schede utili e corrette.
    </p>

    <h2>Cosa fa un revisore</h2>
    <ul>
      <li>Valuta le nuove segnalazioni ricevute dalla mappa.</li>
      <li>Controlla foto, posizione e coerenza delle informazioni.</li>
      <li>Decide se pubblicare, chiedere chiarimenti o respingere.</li>
      <li>Mantiene aggiornati gli stati delle schede pubblicate.</li>
    </ul>

    <h2>Cosa serve</h2>
    <ul>
      <li>Conoscere il territorio del Cilento e del Golfo di Policastro.</li>
      <li>Attenzione ai fatti e rispetto delle persone e dei luoghi.</li>
      <li>Poco tempo, ma con costanza.</li>
    </ul>

    <h2>Cosa non ti chiediamo</h2>
    <p>
      Nessuna appartenenza politica e nessuna competenza tecnica particolare:
      contano serietà, equilibrio e voglia di contribuire.
    </p>

    <div class="page__actions">
      <a
        class="btn"
        :href="`mailto:${CONTACT_EMAIL}?subject=${subject}`"
      >
        Candidati come revisore
      </a>
      <RouterLink
        to="/chi-siamo"
        class="btn btn--ghost"
      >
        Chi siamo
      </RouterLink>
    </div>
  </article>
</template>
