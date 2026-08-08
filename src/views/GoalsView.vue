<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>

<template>
  <article class="container page">
    <h1>Obiettivi</h1>
    <p class="page__lead">
      Vogliamo passare dalle segnalazioni ai risultati, mettendo i luoghi al
      primo posto. Ecco cosa cerchiamo di ottenere.
    </p>

    <h2>Nel breve periodo</h2>
    <ul>
      <li>Costruire una mappa condivisa e affidabile dei luoghi del Golfo di Policastro.</li>
      <li>Verificare le segnalazioni e distinguere i fatti dalle opinioni.</li>
      <li>Dare visibilità a chi già si prende cura del territorio.</li>
    </ul>

    <h2>Nel medio periodo</h2>
    <ul>
      <li>Trasformare le criticità in proposte concrete e realizzabili.</li>
      <li>Portare le proposte all'attenzione delle amministrazioni competenti.</li>
      <li>Seguire lo stato di ogni proposta fino all'eventuale risultato.</li>
    </ul>

    <h2>Nel lungo periodo</h2>
    <ul>
      <li>Far crescere una rete civica stabile e una futura associazione.</li>
      <li>Estendere il metodo ad altri luoghi del Cilento.</li>
      <li>Rendere la cura del territorio un'abitudine condivisa, non un'eccezione.</li>
    </ul>

    <h2>I nostri principi</h2>
    <p>
      Indipendenza dai partiti, verifica prima della pubblicazione, rispetto
      delle persone e dei luoghi, trasparenza sugli stati di ogni scheda:
      <strong>Segnalato → Inviato al Comune → Risolto.</strong>
    </p>

    <div class="page__actions">
      <RouterLink
        to="/progetto"
        class="btn btn--ghost"
      >
        Torna al progetto
      </RouterLink>
    </div>
  </article>
</template>
