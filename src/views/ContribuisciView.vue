<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { CONTACT_EMAIL, SITE_URL } from '@/lib/site';
import { isMobileDevice } from '@/lib/device';
import ShareButtons from '@/components/ShareButtons.vue';

const canReport = isMobileDevice();
const pdfUrl = `${import.meta.env.BASE_URL}prima-i-luoghi-volantino-a5-questo-paese.pdf`;

const meetSubject = encodeURIComponent('Incontriamoci');
const reviewerSubject = encodeURIComponent('Candidatura revisore — Prima i Luoghi');
const meetMailto = `mailto:${CONTACT_EMAIL}?subject=${meetSubject}`;
const reviewerMailto = `mailto:${CONTACT_EMAIL}?subject=${reviewerSubject}`;
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
        >🙌</span>
        <p class="eyebrow">
          Prima i luoghi · Partecipa
        </p>
        <h1 class="hero__title">
          Contribuisci
        </h1>
        <p class="hero__claim">
          La mappa cresce
          <span class="hl">grazie a chi partecipa.</span>
        </p>
        <p class="hero__lead">
          Ci sono tanti modi per dare una mano: bastano pochi minuti e la voglia
          di prenderti cura del tuo territorio.
        </p>
      </header>

      <section class="card">
        <div class="card__head">
          <span
            class="card__badge"
            aria-hidden="true"
          >📸</span>
          <h2 class="card__title">
            Fai una segnalazione
          </h2>
        </div>
        <p>
          Una criticità, un luogo da custodire, una proposta o un intervento di
          cura: bastano una foto e poche parole per metterlo sulla mappa.
        </p>
        <div class="actions">
          <RouterLink
            v-if="canReport"
            to="/segnala"
            class="pill pill--orange"
          >
            Segnala un luogo
          </RouterLink>
          <span
            v-else
            class="tagline"
          >📱 Apri questa pagina col telefono per segnalare.</span>
        </div>
      </section>

      <section class="card">
        <div class="card__head">
          <span
            class="card__badge"
            aria-hidden="true"
          >🔎</span>
          <h2 class="card__title">
            Diventa revisore
          </h2>
        </div>
        <p>
          I revisori leggono le segnalazioni, verificano ciò che è verificabile e
          le trasformano in schede utili e corrette. Non serve competenza tecnica:
          contano serietà ed equilibrio.
        </p>
        <div class="actions">
          <a
            class="pill pill--orange"
            :href="reviewerMailto"
          >
            Candidati come revisore
          </a>
          <RouterLink
            to="/diventa-revisore"
            class="pill pill--navy"
          >
            Come funziona
          </RouterLink>
        </div>
      </section>

      <section class="card">
        <div class="card__head">
          <span
            class="card__badge"
            aria-hidden="true"
          >📣</span>
          <h2 class="card__title">
            Fai conoscere la mappa
          </h2>
        </div>
        <p>
          Più persone la usano, più la mappa diventa utile. Aiutaci a farla girare:
        </p>
        <ul class="icon-list">
          <li>
            <span
              class="ic"
              aria-hidden="true"
            >🖨️</span>
            <span>
              Stampa il volantino e mettilo in giro (bar, negozi, bacheche).
              <a
                :href="pdfUrl"
                target="_blank"
                rel="noopener"
              >Scarica il volantino (PDF)</a>.
            </span>
          </li>
          <li>
            <span
              class="ic"
              aria-hidden="true"
            >💬</span>
            Invialo a un amico e raccontagli di cosa si tratta.
          </li>
          <li>
            <span
              class="ic"
              aria-hidden="true"
            >🌍</span>
            Condividilo sui social e nei gruppi del tuo paese.
          </li>
        </ul>
        <ShareButtons
          class="contribuisci__share"
          :url="SITE_URL"
        />
      </section>

      <section class="card">
        <div class="card__head">
          <span
            class="card__badge"
            aria-hidden="true"
          >🤝</span>
          <h2 class="card__title">
            Incontriamoci
          </h2>
        </div>
        <p>
          Vuoi conoscere il gruppo promotore, organizzare un incontro nel tuo
          paese o proporre una collaborazione? Scrivici.
        </p>
        <div class="actions">
          <a
            class="pill pill--orange"
            :href="meetMailto"
          >
            Scrivici: «Incontriamoci»
          </a>
        </div>
      </section>

      <section class="card card--quiet">
        <div class="card__head">
          <span
            class="card__badge"
            aria-hidden="true"
          >🛠️</span>
          <h2 class="card__title">
            Sei un tecnico?
          </h2>
        </div>
        <p>
          Se ti occupi di dati, mappe o sviluppo, puoi aiutarci a migliorare le
          osservazioni e l'analisi del territorio.
        </p>
        <div class="actions">
          <a
            class="pill pill--navy"
            href="https://santamarina.primainumeri.it"
            target="_blank"
            rel="noopener"
          >
            Vai a santamarina.primainumeri.it
          </a>
        </div>
      </section>
    </article>
  </div>
</template>

<style scoped>
.contribuisci__share {
  margin-top: 1rem;
}
</style>
