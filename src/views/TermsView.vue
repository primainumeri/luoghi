<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { CONTACT_EMAIL } from '@/lib/site';

const lastUpdate = '8 agosto 2026';
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
        >📜</span>
        <p class="eyebrow">
          Prima i luoghi · Termini
        </p>
        <h1 class="hero__title">
          Termini di utilizzo
        </h1>
        <p class="hero__lead">
          Poche regole chiare per usare la mappa e inviare segnalazioni in modo
          corretto e rispettoso.
        </p>
        <p class="eyebrow">
          Ultimo aggiornamento: {{ lastUpdate }}
        </p>
      </header>

      <section class="card">
        <div class="card__head">
          <span
            class="card__badge"
            aria-hidden="true"
          >🧭</span>
          <h2 class="card__title">
            Cos'è questo servizio
          </h2>
        </div>
        <p>
          Prima i luoghi è uno strumento civico
          <strong>gratuito, indipendente e non partitico</strong>
          per documentare criticità, luoghi da custodire,
          proposte e azioni di cura del territorio.
          <strong>Non è un canale di emergenza</strong>: per situazioni urgenti
          chiama i numeri di soccorso.
        </p>
      </section>

      <section class="card">
        <div class="card__head">
          <span
            class="card__badge"
            aria-hidden="true"
          >🤝</span>
          <h2 class="card__title">
            Come usarlo correttamente
          </h2>
        </div>
        <ul class="icon-list">
          <li>
            <span
              class="ic"
              aria-hidden="true"
            >✅</span>
            <span>Segnala in buona fede, con informazioni vere e verificabili.</span>
          </li>
          <li>
            <span
              class="ic"
              aria-hidden="true"
            >🙅</span>
            <span>
              Non caricare contenuti offensivi, diffamatori, illeciti o che
              violino i diritti altrui.
            </span>
          </li>
          <li>
            <span
              class="ic"
              aria-hidden="true"
            >👤</span>
            <span>
              Evita di includere dati personali di altre persone (volti
              riconoscibili, targhe, nomi) quando non è necessario.
            </span>
          </li>
          <li>
            <span
              class="ic"
              aria-hidden="true"
            >📷</span>
            <span>
              Carica solo foto che hai scattato tu o per cui hai i diritti
              necessari.
            </span>
          </li>
        </ul>
      </section>

      <section class="card">
        <div class="card__head">
          <span
            class="card__badge"
            aria-hidden="true"
          >🖼️</span>
          <h2 class="card__title">
            I contenuti che invii
          </h2>
        </div>
        <p>
          Inviando una segnalazione ci autorizzi a pubblicarne foto e testo sulla
          mappa pubblica del progetto, nell'ambito delle sue finalità civiche.
          Resti responsabile di ciò che carichi. Puoi chiederne la rimozione
          scrivendo a
          <a :href="`mailto:${CONTACT_EMAIL}`">{{ CONTACT_EMAIL }}</a>.
        </p>
      </section>

      <section class="card">
        <div class="card__head">
          <span
            class="card__badge"
            aria-hidden="true"
          >✔️</span>
          <h2 class="card__title">
            Verifica e moderazione
          </h2>
        </div>
        <p>
          Le segnalazioni vengono verificate prima della pubblicazione. Possiamo
          modificarle, aggiornarle, non pubblicarle o rimuoverle. Pubblicare una
          segnalazione <strong>non è un'accusa</strong>: le informazioni possono
          essere corrette e aggiornate nel tempo.
        </p>
      </section>

      <section class="card">
        <div class="card__head">
          <span
            class="card__badge"
            aria-hidden="true"
          >⚠️</span>
          <h2 class="card__title">
            Nessuna garanzia
          </h2>
        </div>
        <p>
          Il servizio è offerto "così com'è", su base volontaria. Non garantiamo
          continuità, assenza di errori o completezza delle informazioni e non
          rispondiamo dei contenuti caricati dagli utenti.
        </p>
      </section>

      <section class="card">
        <div class="card__head">
          <span
            class="card__badge"
            aria-hidden="true"
          >📌</span>
          <h2 class="card__title">
            Legge e contatti
          </h2>
        </div>
        <p>
          Questi termini sono regolati dalla legge italiana. Per il trattamento
          dei dati personali consulta l'<a
            href="#/privacy"
          >informativa sulla privacy</a>. Per qualsiasi domanda scrivi a
          <a :href="`mailto:${CONTACT_EMAIL}`">{{ CONTACT_EMAIL }}</a>.
        </p>
      </section>

      <div class="actions">
        <RouterLink
          to="/privacy"
          class="pill pill--navy"
        >
          Informativa privacy
        </RouterLink>
        <RouterLink
          to="/contribuisci"
          class="pill pill--orange"
        >
          Contribuisci
        </RouterLink>
      </div>
    </article>
  </div>
</template>
