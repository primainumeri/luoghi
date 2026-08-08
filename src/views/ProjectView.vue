<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { PLACE_TYPE_LABELS, PLACE_TYPE_ICONS } from '@/lib/labels';
import { isMobileDevice } from '@/lib/device';
import { SITE_URL } from '@/lib/site';
import ShareButtons from '@/components/ShareButtons.vue';

const canReport = isMobileDevice();
const tipologie = ['criticita', 'proposta', 'risorsa', 'cura'] as const;
const categorie = [
  'Acqua, natura e ambiente',
  'Mobilità e accessibilità',
  'Spazi pubblici e territorio costruito',
  'Pulizia e decoro',
  'Servizi e vita comunitaria',
  'Attività e identità del territorio',
];
const flusso = ['Segnalazione', 'Verifica', 'Proposta', 'Confronto', 'Azione', 'Risultato'];
</script>

<template>
  <div class="flyer">
    <article class="container flyer__inner">
      <!-- Hero -->
      <header class="hero">
        <span
          class="sun"
          aria-hidden="true"
        />
        <p class="eyebrow">
          Prima i luoghi · La mappa civica del Cilento
        </p>
        <h1 class="hero__title">
          Il progetto
        </h1>
        <p class="hero__claim">
          Il Cilento non è una cartolina.
          <span class="hl">È un territorio vivente.</span>
        </p>
        <p class="hero__lead">
          Un progetto civico indipendente per il Cilento, che parte dal Golfo di
          Policastro. Osserviamo i luoghi, verifichiamo le segnalazioni e le
          trasformiamo in proposte concrete.
        </p>

        <div class="actions">
          <RouterLink
            to="/"
            class="pill pill--navy"
          >
            Apri la mappa
          </RouterLink>
          <RouterLink
            v-if="canReport"
            to="/segnala"
            class="pill pill--orange"
          >
            Segnala
          </RouterLink>
        </div>

        <p class="tagline">
          Segnala <span aria-hidden="true">•</span> Proponi
          <span aria-hidden="true">•</span> Proteggi
          <span aria-hidden="true">•</span> Racconta
        </p>
      </header>

      <!-- Come funziona -->
      <section class="card">
        <p class="card__eyebrow">
          Come funziona
        </p>
        <h2 class="card__title">
          Bastano una foto e poche parole
        </h2>
        <p>
          Sulla mappa raccogliamo i luoghi segnalati dalle persone. Ogni
          segnalazione parte da una foto scattata sul posto, viene verificata dal
          gruppo editoriale e, se pubblicata, resta aggiornata fino all'eventuale
          risultato.
        </p>
        <ol class="flow">
          <li
            v-for="(step, i) in flusso"
            :key="step"
            class="flow__step"
          >
            <span class="flow__num">{{ i + 1 }}</span>
            {{ step }}
          </li>
        </ol>
      </section>

      <!-- Cosa raccoglie la mappa -->
      <section class="card">
        <p class="card__eyebrow">
          Cosa raccoglie la mappa
        </p>
        <h2 class="card__title">
          Quattro modi di guardare i luoghi
        </h2>
        <ul class="types">
          <li
            v-for="t in tipologie"
            :key="t"
            class="type"
          >
            <span
              class="type__icon"
              aria-hidden="true"
            >{{ PLACE_TYPE_ICONS[t] }}</span>
            {{ PLACE_TYPE_LABELS[t] }}
          </li>
        </ul>

        <p class="card__sub">
          E sei aree tematiche:
        </p>
        <ul class="cats">
          <li
            v-for="c in categorie"
            :key="c"
            class="cat"
          >
            {{ c }}
          </li>
        </ul>
      </section>

      <!-- Cosa non è -->
      <section class="card card--quiet">
        <p class="card__eyebrow">
          Cosa non è
        </p>
        <p>
          Non è un canale di emergenza: per situazioni urgenti chiama i numeri di
          soccorso. Non è uno strumento di parte: è indipendente da partiti e
          liste. Pubblicare una segnalazione non significa accusare qualcuno: le
          informazioni vengono verificate e possono essere corrette e aggiornate.
        </p>
      </section>

      <!-- Approfondisci -->
      <section class="approfondisci">
        <p class="card__eyebrow">
          Approfondisci
        </p>
        <div class="links">
          <RouterLink
            to="/contribuisci"
            class="link-card"
          >
            <strong>Contribuisci</strong>
            Tutti i modi per dare una mano al progetto.
          </RouterLink>
          <RouterLink
            to="/chi-siamo"
            class="link-card"
          >
            <strong>Chi siamo</strong>
            Il gruppo promotore e come contattarci.
          </RouterLink>
          <RouterLink
            to="/obiettivi"
            class="link-card"
          >
            <strong>Obiettivi</strong>
            Cosa vogliamo ottenere, passo dopo passo.
          </RouterLink>
          <RouterLink
            to="/diventa-revisore"
            class="link-card"
          >
            <strong>Diventa revisore</strong>
            Aiutaci a verificare e curare le segnalazioni.
          </RouterLink>
        </div>
      </section>

      <!-- Condividi -->
      <section class="card">
        <div class="card__head">
          <span
            class="card__badge"
            aria-hidden="true"
          >📣</span>
          <h2 class="card__title">
            Fai girare la mappa
          </h2>
        </div>
        <p>
          Più persone la conoscono, più diventa utile. Condividila con chi ti sta
          vicino.
        </p>
        <ShareButtons :url="SITE_URL" />
      </section>
    </article>
  </div>
</template>
