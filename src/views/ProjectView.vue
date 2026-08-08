<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { PLACE_TYPE_LABELS, PLACE_TYPE_ICONS } from '@/lib/labels';
import { isMobileDevice } from '@/lib/device';

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
    </article>
  </div>
</template>

<style scoped>
.flyer {
  --paper: #f4ecdb;
  --paper-card: #fbf7ec;
  --navy: #1f3d6b;
  --navy-dark: #16305a;
  --orange: #d9663b;
  --olive: #5f6b2f;
  --ink: #26303f;
  background: var(--paper);
  margin-block: -0.1rem 2rem;
  padding-block: 1rem 2.5rem;
}

.flyer__inner {
  color: var(--ink);
}

/* --- Hero --------------------------------------------------------------- */
.hero {
  position: relative;
  padding-block: 1.5rem 0.5rem;
  overflow: hidden;
}

.sun {
  position: absolute;
  top: -18px;
  right: -18px;
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: radial-gradient(circle at 40% 40%, #e8834f, var(--orange));
  opacity: 0.9;
}

.eyebrow,
.card__eyebrow {
  margin: 0 0 0.5rem;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--olive);
}

.hero__title {
  margin: 0;
  font-size: clamp(2.6rem, 9vw, 4rem);
  line-height: 0.95;
  font-weight: 900;
  letter-spacing: 0.01em;
  text-transform: uppercase;
  color: var(--navy);
}

.hero__claim {
  margin: 0.75rem 0 0;
  font-size: clamp(1.2rem, 4.5vw, 1.7rem);
  font-weight: 800;
  color: var(--navy);
  max-width: 22ch;
}

.hl {
  display: inline-block;
  background: var(--orange);
  color: #fff;
  padding: 0.05em 0.4em;
  border-radius: 6px;
  transform: rotate(-1.5deg);
}

.hero__lead {
  margin-top: 1rem;
  font-size: 1.1rem;
  max-width: 58ch;
  color: var(--ink);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.pill {
  display: inline-flex;
  align-items: center;
  padding: 0.7rem 1.5rem;
  border-radius: 999px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  text-decoration: none;
  font-size: 0.95rem;
}

.pill--navy {
  background: var(--navy);
  color: #fff;
}

.pill--orange {
  background: var(--orange);
  color: #fff;
}

.tagline {
  margin-top: 1.25rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--navy);
}

.tagline span {
  color: var(--orange);
  margin-inline: 0.15em;
}

/* --- Cards -------------------------------------------------------------- */
.card,
.approfondisci {
  margin-top: 1.5rem;
  padding: 1.5rem;
  border-radius: 18px;
  background: var(--paper-card);
  border: 1px solid #e5dcc5;
}

.card--quiet {
  background: transparent;
  border-style: dashed;
}

.card__title {
  margin: 0 0 0.75rem;
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--navy);
}

.card__sub {
  margin-top: 1.25rem;
  font-weight: 700;
  color: var(--navy);
}

.card p {
  max-width: 62ch;
}

/* Flusso */
.flow {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 1.25rem 0 0;
  padding: 0;
  list-style: none;
}

.flow__step {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: #fff;
  border: 1px solid #e5dcc5;
  border-radius: 999px;
  padding: 0.35rem 0.8rem 0.35rem 0.35rem;
  font-weight: 700;
  color: var(--navy);
  font-size: 0.9rem;
}

.flow__num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.4rem;
  height: 1.4rem;
  border-radius: 50%;
  background: var(--navy);
  color: #fff;
  font-size: 0.8rem;
}

/* Tipologie */
.types {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 0.6rem;
  margin: 0.5rem 0 0;
  padding: 0;
  list-style: none;
}

.type {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: #fff;
  border: 1px solid #e5dcc5;
  border-radius: 12px;
  padding: 0.7rem 0.9rem;
  font-weight: 700;
  color: var(--navy);
}

.type__icon {
  font-size: 1.4rem;
}

/* Categorie */
.cats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.5rem;
  margin: 0.75rem 0 0;
  padding: 0;
  list-style: none;
}

.cat {
  position: relative;
  background: #fff;
  border: 1px solid #e5dcc5;
  border-left: 5px solid var(--olive);
  border-radius: 10px;
  padding: 0.7rem 0.9rem;
  font-weight: 600;
}

/* Approfondisci */
.links {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  margin-top: 0.75rem;
}

.link-card {
  display: block;
  background: #fff;
  border: 1px solid #e5dcc5;
  border-radius: 14px;
  padding: 1rem;
  text-decoration: none;
  color: var(--ink);
}

.link-card strong {
  display: block;
  margin-bottom: 0.25rem;
  color: var(--navy);
  font-size: 1.05rem;
}

.link-card:hover {
  border-color: var(--orange);
}
</style>
