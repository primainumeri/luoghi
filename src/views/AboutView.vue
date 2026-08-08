<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { CONTACT_EMAIL } from '@/lib/site';
</script>

<template>
  <div class="flyer">
    <article class="container flyer__inner">
      <header class="hero">
        <span
          class="sun"
          aria-hidden="true"
        />
        <span
          class="hero__icon"
          aria-hidden="true"
        >🤝</span>
        <p class="eyebrow">
          Prima i luoghi · Chi siamo
        </p>
        <h1 class="hero__title">
          Chi siamo
        </h1>
        <p class="hero__claim">
          Cittadine e cittadini del Cilento.
          <span class="hl">Indipendenti e non partitici.</span>
        </p>
        <p class="hero__lead">
          Siamo un gruppo promotore civico, ancora in costruzione. Mettiamo i
          luoghi al primo posto e costruiamo insieme la rete di chi vuole
          contribuire.
        </p>
      </header>

      <section class="card">
        <div class="card__head">
          <span
            class="card__badge"
            aria-hidden="true"
          >🌍</span>
          <h2 class="card__title">
            Perché lo facciamo
          </h2>
        </div>
        <p>
          Il Cilento non è soltanto una cartolina: è un territorio vivente, fatto
          di strade, coste, centri storici e persone che se ne prendono cura ogni
          giorno. Vogliamo dare a chi vive e ama questi luoghi uno strumento
          semplice per osservarli, documentarli e migliorarli insieme.
        </p>
      </section>

      <section class="card">
        <div class="card__head">
          <span
            class="card__badge"
            aria-hidden="true"
          >🛠️</span>
          <h2 class="card__title">
            Come lavoriamo
          </h2>
        </div>
        <ul class="icon-list">
          <li>
            <span
              class="ic"
              aria-hidden="true"
            >📸</span>
            Raccogliamo segnalazioni verificabili, sempre a partire da una foto.
          </li>
          <li>
            <span
              class="ic"
              aria-hidden="true"
            >✔️</span>
            Verifichiamo ciò che è verificabile prima di pubblicare.
          </li>
          <li>
            <span
              class="ic"
              aria-hidden="true"
            >💡</span>
            Trasformiamo i problemi in proposte concrete e le condividiamo.
          </li>
          <li>
            <span
              class="ic"
              aria-hidden="true"
            >🙈</span>
            Non pubblichiamo il nome di chi segnala: lo chiediamo solo per uso
            interno.
          </li>
        </ul>
      </section>

      <section class="card">
        <div class="card__head">
          <span
            class="card__badge"
            aria-hidden="true"
          >🧭</span>
          <h2 class="card__title">
            Trasparenza
          </h2>
        </div>
        <p>
          Non riceviamo indicazioni da partiti o liste. Pubblicare una
          segnalazione non è un'accusa: le informazioni possono essere corrette e
          aggiornate. L'associazione formale non esiste ancora: stiamo costruendo
          la rete di chi vuole contribuire.
        </p>
      </section>

      <section class="card">
        <div class="card__head">
          <span
            class="card__badge"
            aria-hidden="true"
          >✉️</span>
          <h2 class="card__title">
            Contatti
          </h2>
        </div>
        <p>
          Per segnalazioni particolari, correzioni o per unirti al gruppo
          promotore scrivi a
          <a :href="`mailto:${CONTACT_EMAIL}`">{{ CONTACT_EMAIL }}</a>.
        </p>
      </section>

      <div class="actions">
        <RouterLink
          to="/diventa-revisore"
          class="pill pill--orange"
        >
          Diventa revisore
        </RouterLink>
        <RouterLink
          to="/progetto"
          class="pill pill--navy"
        >
          Torna al progetto
        </RouterLink>
      </div>
    </article>
  </div>
</template>
