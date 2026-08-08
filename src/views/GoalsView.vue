<script setup lang="ts">
import { RouterLink } from 'vue-router';

const stati = ['Segnalato', 'Inviato al Comune', 'Risolto'];
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
        >🎯</span>
        <p class="eyebrow">
          Prima i luoghi · Obiettivi
        </p>
        <h1 class="hero__title">
          Obiettivi
        </h1>
        <p class="hero__claim">
          Dalle segnalazioni
          <span class="hl">ai risultati.</span>
        </p>
        <p class="hero__lead">
          Vogliamo mettere i luoghi al primo posto: osservare, proporre e seguire
          nel tempo il cambiamento del territorio.
        </p>
      </header>

      <section class="card">
        <p class="card__eyebrow">
          Passo dopo passo
        </p>
        <h2 class="card__title">
          Tre orizzonti
        </h2>
        <ul class="features">
          <li class="feature">
            <span
              class="feature__badge"
              aria-hidden="true"
            >🌱</span>
            <h3>Nel breve periodo</h3>
            <ul class="icon-list">
              <li>
                <span
                  class="ic"
                  aria-hidden="true"
                >🗺️</span>
                Una mappa condivisa e affidabile del Golfo di Policastro.
              </li>
              <li>
                <span
                  class="ic"
                  aria-hidden="true"
                >🔎</span>
                Verificare le segnalazioni e distinguere i fatti dalle opinioni.
              </li>
              <li>
                <span
                  class="ic"
                  aria-hidden="true"
                >🌿</span>
                Dare visibilità a chi già si prende cura del territorio.
              </li>
            </ul>
          </li>
          <li class="feature">
            <span
              class="feature__badge"
              aria-hidden="true"
            >🌿</span>
            <h3>Nel medio periodo</h3>
            <ul class="icon-list">
              <li>
                <span
                  class="ic"
                  aria-hidden="true"
                >💡</span>
                Trasformare le criticità in proposte concrete e realizzabili.
              </li>
              <li>
                <span
                  class="ic"
                  aria-hidden="true"
                >🏛️</span>
                Portarle all'attenzione delle amministrazioni competenti.
              </li>
              <li>
                <span
                  class="ic"
                  aria-hidden="true"
                >🔄</span>
                Seguire lo stato di ogni proposta fino al risultato.
              </li>
            </ul>
          </li>
          <li class="feature">
            <span
              class="feature__badge"
              aria-hidden="true"
            >🌳</span>
            <h3>Nel lungo periodo</h3>
            <ul class="icon-list">
              <li>
                <span
                  class="ic"
                  aria-hidden="true"
                >🤝</span>
                Una rete civica stabile e una futura associazione.
              </li>
              <li>
                <span
                  class="ic"
                  aria-hidden="true"
                >🧭</span>
                Estendere il metodo ad altri luoghi del Cilento.
              </li>
              <li>
                <span
                  class="ic"
                  aria-hidden="true"
                >♻️</span>
                Rendere la cura del territorio un'abitudine condivisa.
              </li>
            </ul>
          </li>
        </ul>
      </section>

      <section class="card">
        <div class="card__head">
          <span
            class="card__badge"
            aria-hidden="true"
          >⚖️</span>
          <h2 class="card__title">
            I nostri principi
          </h2>
        </div>
        <p>
          Indipendenza dai partiti, verifica prima della pubblicazione, rispetto
          delle persone e dei luoghi, trasparenza sugli stati di ogni scheda:
        </p>
        <ol class="flow">
          <li
            v-for="(s, i) in stati"
            :key="s"
            class="flow__step"
          >
            <span class="flow__num">{{ i + 1 }}</span>
            {{ s }}
          </li>
        </ol>
      </section>

      <div class="actions">
        <RouterLink
          to="/progetto"
          class="pill pill--navy"
        >
          Torna al progetto
        </RouterLink>
        <RouterLink
          to="/diventa-revisore"
          class="pill pill--orange"
        >
          Diventa revisore
        </RouterLink>
      </div>
    </article>
  </div>
</template>
