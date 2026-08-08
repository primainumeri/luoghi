<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { PLACE_TYPE_LABELS, PLACE_TYPE_ICONS } from '@/lib/labels';
import { isMobileDevice } from '@/lib/device';

const canReport = isMobileDevice();
const tipologie = ['criticita', 'proposta', 'risorsa', 'cura'] as const;
const categorie = [
  'Acqua, fognature e depurazione',
  'Strade, marciapiedi e mobilità',
  'Verde pubblico e alberature',
  'Rifiuti, pulizia e decoro',
  'Costa, spiagge e ambiente marino',
  'Patrimonio storico e bellezza urbana',
];
</script>

<template>
  <article class="container page">
    <h1>Il progetto</h1>
    <p class="page__lead">
      Prima i Luoghi è un progetto civico indipendente per il Cilento, che parte
      dal Golfo di Policastro. Osserviamo i luoghi, verifichiamo le segnalazioni
      e le trasformiamo in proposte concrete.
    </p>

    <h2>Come funziona</h2>
    <p>
      Sulla mappa raccogliamo e mostriamo i luoghi segnalati dalle persone. Ogni
      segnalazione parte da una foto scattata sul posto, viene verificata dal
      gruppo editoriale e, se pubblicata, resta aggiornata fino all'eventuale
      risultato.
    </p>
    <p>
      Percorso di una scheda:
      <strong>segnalazione → verifica → proposta → confronto → azione → risultato.</strong>
    </p>

    <h2>Cosa raccoglie la mappa</h2>
    <p>Ogni luogo appartiene a una tipologia:</p>
    <ul class="page__pills">
      <li
        v-for="t in tipologie"
        :key="t"
        class="page__pill"
      >
        <span aria-hidden="true">{{ PLACE_TYPE_ICONS[t] }}</span>
        {{ PLACE_TYPE_LABELS[t] }}
      </li>
    </ul>
    <p>e a una categoria tematica:</p>
    <ul>
      <li
        v-for="c in categorie"
        :key="c"
      >
        {{ c }}
      </li>
    </ul>

    <h2>Cosa non è</h2>
    <p>
      Non è un canale di emergenza: per situazioni urgenti chiama i numeri di
      soccorso. Non è uno strumento di parte: è indipendente da partiti e liste.
      Pubblicare una segnalazione non significa accusare qualcuno: le
      informazioni vengono verificate e possono essere corrette e aggiornate.
    </p>

    <h2>Approfondisci</h2>
    <ul class="page__cards">
      <li>
        <RouterLink
          to="/chi-siamo"
          class="page__card"
        >
          <strong>Chi siamo</strong>
          Il gruppo promotore e come contattarci.
        </RouterLink>
      </li>
      <li>
        <RouterLink
          to="/obiettivi"
          class="page__card"
        >
          <strong>Obiettivi</strong>
          Cosa vogliamo ottenere, passo dopo passo.
        </RouterLink>
      </li>
      <li>
        <RouterLink
          to="/diventa-revisore"
          class="page__card"
        >
          <strong>Diventa revisore</strong>
          Aiutaci a verificare e curare le segnalazioni.
        </RouterLink>
      </li>
    </ul>

    <div class="page__actions">
      <RouterLink
        to="/"
        class="btn btn--ghost"
      >
        Apri la mappa
      </RouterLink>
      <RouterLink
        v-if="canReport"
        to="/segnala"
        class="btn"
      >
        Segnala
      </RouterLink>
    </div>
  </article>
</template>
