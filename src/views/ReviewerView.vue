<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { CONTACT_EMAIL } from '@/lib/site';

const subject = encodeURIComponent('Candidatura revisore — Prima i Luoghi');
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
        >🔎</span>
        <p class="eyebrow">
          Prima i luoghi · Partecipa
        </p>
        <h1 class="hero__title">
          Diventa revisore
        </h1>
        <p class="hero__claim">
          I revisori sono
          <span class="hl">il cuore del progetto.</span>
        </p>
        <p class="hero__lead">
          Leggono le segnalazioni, verificano ciò che è verificabile e aiutano a
          trasformarle in schede utili e corrette.
        </p>
      </header>

      <section class="card">
        <div class="card__head">
          <span
            class="card__badge"
            aria-hidden="true"
          >🔎</span>
          <h2 class="card__title">
            Cosa fa un revisore
          </h2>
        </div>
        <ul class="icon-list">
          <li>
            <span
              class="ic"
              aria-hidden="true"
            >🗂️</span>
            Valuta le nuove segnalazioni ricevute dalla mappa.
          </li>
          <li>
            <span
              class="ic"
              aria-hidden="true"
            >📸</span>
            Controlla foto, posizione e coerenza delle informazioni.
          </li>
          <li>
            <span
              class="ic"
              aria-hidden="true"
            >✅</span>
            Decide se pubblicare, chiedere chiarimenti o respingere.
          </li>
          <li>
            <span
              class="ic"
              aria-hidden="true"
            >🔄</span>
            Mantiene aggiornati gli stati delle schede pubblicate.
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
            Cosa serve
          </h2>
        </div>
        <ul class="icon-list">
          <li>
            <span
              class="ic"
              aria-hidden="true"
            >📍</span>
            Conoscere il territorio del Cilento e del Golfo di Policastro.
          </li>
          <li>
            <span
              class="ic"
              aria-hidden="true"
            >⚖️</span>
            Attenzione ai fatti e rispetto delle persone e dei luoghi.
          </li>
          <li>
            <span
              class="ic"
              aria-hidden="true"
            >⏳</span>
            Poco tempo, ma con costanza.
          </li>
        </ul>
      </section>

      <section class="card card--quiet">
        <div class="card__head">
          <span
            class="card__badge"
            aria-hidden="true"
          >🌱</span>
          <h2 class="card__title">
            Cosa non ti chiediamo
          </h2>
        </div>
        <p>
          Nessuna appartenenza politica e nessuna competenza tecnica particolare:
          contano serietà, equilibrio e voglia di contribuire.
        </p>
      </section>

      <div class="actions">
        <a
          class="pill pill--orange"
          :href="`mailto:${CONTACT_EMAIL}?subject=${subject}`"
        >
          Candidati come revisore
        </a>
        <RouterLink
          to="/chi-siamo"
          class="pill pill--navy"
        >
          Chi siamo
        </RouterLink>
      </div>
    </article>
  </div>
</template>
