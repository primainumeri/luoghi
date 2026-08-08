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
        >🔒</span>
        <p class="eyebrow">
          Prima i luoghi · Privacy
        </p>
        <h1 class="hero__title">
          Informativa sulla privacy
        </h1>
        <p class="hero__lead">
          Spieghiamo in modo semplice quali dati trattiamo quando usi la mappa e
          invii una segnalazione, perché lo facciamo e quali diritti hai.
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
          >🏷️</span>
          <h2 class="card__title">
            Chi tratta i dati
          </h2>
        </div>
        <p>
          Il titolare del trattamento è il gruppo promotore civico
          <strong>Prima i luoghi</strong>, un'iniziativa indipendente e non
          partitica. Per qualsiasi richiesta puoi scrivere a
          <a :href="`mailto:${CONTACT_EMAIL}`">{{ CONTACT_EMAIL }}</a>.
        </p>
      </section>

      <section class="card">
        <div class="card__head">
          <span
            class="card__badge"
            aria-hidden="true"
          >🗂️</span>
          <h2 class="card__title">
            Quali dati raccogliamo
          </h2>
        </div>
        <ul class="icon-list">
          <li>
            <span
              class="ic"
              aria-hidden="true"
            >📸</span>
            <span>
              <strong>Foto</strong> che scatti o carichi per documentare la
              segnalazione.
            </span>
          </li>
          <li>
            <span
              class="ic"
              aria-hidden="true"
            >📍</span>
            <span>
              <strong>Posizione geografica</strong> del luogo segnalato. La mappa
              può usare la posizione del tuo dispositivo solo per centrarsi: non
              la memorizziamo.
            </span>
          </li>
          <li>
            <span
              class="ic"
              aria-hidden="true"
            >📝</span>
            <span>
              <strong>Testo</strong> della segnalazione (descrizione, categoria,
              eventuale proposta).
            </span>
          </li>
          <li>
            <span
              class="ic"
              aria-hidden="true"
            >🙈</span>
            <span>
              Il <strong>tuo nome</strong>, che chiediamo solo per uso interno:
              <strong>non viene mai pubblicato</strong>.
            </span>
          </li>
          <li>
            <span
              class="ic"
              aria-hidden="true"
            >🛡️</span>
            <span>
              Dati tecnici della <strong>verifica anti-spam</strong> (se attiva),
              gestita da Cloudflare Turnstile.
            </span>
          </li>
        </ul>
      </section>

      <section class="card">
        <div class="card__head">
          <span
            class="card__badge"
            aria-hidden="true"
          >🎯</span>
          <h2 class="card__title">
            Perché li trattiamo
          </h2>
        </div>
        <p>
          Usiamo questi dati per raccogliere, verificare e pubblicare le
          segnalazioni sulla mappa pubblica, per moderarle e, se necessario, per
          contattarti. La base giuridica è il <strong>consenso</strong> che presti
          inviando la segnalazione e l'<strong>interesse legittimo</strong> a
          documentare e migliorare i luoghi del territorio.
        </p>
      </section>

      <section class="card">
        <div class="card__head">
          <span
            class="card__badge"
            aria-hidden="true"
          >🌍</span>
          <h2 class="card__title">
            Cosa diventa pubblico
          </h2>
        </div>
        <p>
          Dopo la verifica, sulla mappa pubblichiamo la <strong>foto approvata</strong>,
          il testo, la categoria, lo stato e la <strong>posizione</strong> della
          segnalazione. <strong>Non</strong> pubblichiamo il tuo nome, la tua
          email o altri tuoi dati di contatto.
        </p>
      </section>

      <section class="card">
        <div class="card__head">
          <span
            class="card__badge"
            aria-hidden="true"
          >🧰</span>
          <h2 class="card__title">
            Fornitori che ci aiutano
          </h2>
        </div>
        <ul class="icon-list">
          <li>
            <span
              class="ic"
              aria-hidden="true"
            >🗄️</span>
            <span>
              <strong>Supabase</strong> — database e archiviazione delle foto, su
              server nell'Unione Europea.
            </span>
          </li>
          <li>
            <span
              class="ic"
              aria-hidden="true"
            >📄</span>
            <span>
              <strong>GitHub Pages</strong> — pubblicazione del sito.
            </span>
          </li>
          <li>
            <span
              class="ic"
              aria-hidden="true"
            >🛡️</span>
            <span>
              <strong>Cloudflare</strong> — verifica anti-spam (se attiva).
            </span>
          </li>
          <li>
            <span
              class="ic"
              aria-hidden="true"
            >🗺️</span>
            <span>
              <strong>OpenStreetMap</strong> ed <strong>Esri</strong> — sfondi
              cartografici della mappa.
            </span>
          </li>
        </ul>
      </section>

      <section class="card">
        <div class="card__head">
          <span
            class="card__badge"
            aria-hidden="true"
          >⏳</span>
          <h2 class="card__title">
            Per quanto tempo
          </h2>
        </div>
        <p>
          I contenuti pubblicati restano online finché la segnalazione è utile o
          fino alla loro rimozione. Il nome e gli eventuali contatti sono
          conservati solo per il tempo necessario alla gestione interna e alla
          verifica. Puoi chiederne la cancellazione in qualsiasi momento.
        </p>
      </section>

      <section class="card">
        <div class="card__head">
          <span
            class="card__badge"
            aria-hidden="true"
          >🍪</span>
          <h2 class="card__title">
            Cookie e tecnologie
          </h2>
        </div>
        <p>
          Non usiamo cookie di profilazione né strumenti di tracciamento
          pubblicitario. L'app salva in locale solo dati tecnici necessari al
          funzionamento (cache dell'interfaccia e, per i moderatori, la sessione
          di accesso).
        </p>
      </section>

      <section class="card">
        <div class="card__head">
          <span
            class="card__badge"
            aria-hidden="true"
          >⚖️</span>
          <h2 class="card__title">
            I tuoi diritti
          </h2>
        </div>
        <p>
          Puoi chiedere di accedere, correggere, aggiornare o cancellare i tuoi
          dati, oppure opporti al trattamento. Scrivi a
          <a :href="`mailto:${CONTACT_EMAIL}`">{{ CONTACT_EMAIL }}</a>: daremo
          seguito nel più breve tempo possibile. Il servizio non è rivolto a minori
          di 14 anni.
        </p>
      </section>

      <div class="actions">
        <RouterLink
          to="/termini"
          class="pill pill--navy"
        >
          Termini di utilizzo
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
