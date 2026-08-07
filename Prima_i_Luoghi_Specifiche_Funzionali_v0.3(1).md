# Prima i luoghi

## Specifiche funzionali della PWA collaborativa

**Versione:** 0.3  
**Data:** 7 agosto 2026  
**Stato:** bozza di lavoro  
**Ambito iniziale:** Comune di Santa Marina, con particolare attenzione a Policastro Bussentino

---

## 0. Strategia di rilascio: MVP essenziale e visione completa

Il presente documento descrive la **visione completa** di Prima i luoghi. Il primo rilascio, tuttavia, deve essere intenzionalmente molto più semplice: il suo scopo non è realizzare subito l'intera piattaforma, ma verificare una sola ipotesi fondamentale.

> I cittadini invieranno contributi territoriali utili e il gruppo editoriale riuscirà a moderarli senza trasformare il progetto in una bacheca di lamentele?

### 0.1 Perimetro dell'MVP

L'MVP comprende soltanto quattro funzioni:

1. **Mappa pubblica**
   - visualizzazione dei luoghi già pubblicati;
   - massimo sei categorie iniziali;
   - filtri essenziali;
   - apertura della relativa scheda.

2. **Scheda del luogo**
   - titolo;
   - fotografia;
   - descrizione sintetica;
   - categoria;
   - data;
   - eventuale proposta;
   - stato pubblico.

3. **Modulo “Segnala un luogo”**
   - selezione del punto sulla mappa o geolocalizzazione facoltativa;
   - categoria;
   - descrizione;
   - massimo tre fotografie;
   - e-mail usata soltanto per eventuali chiarimenti e mai pubblicata;
   - accettazione delle regole editoriali.

4. **Moderazione essenziale**
   - elenco privato delle segnalazioni ricevute;
   - modifica editoriale;
   - pubblicazione o rifiuto;
   - unione manuale dei duplicati.

### 0.2 Stati semplificati

Nell'MVP sono previsti soltanto tre stati pubblici:

- **Segnalato:** contenuto controllato e pubblicato sulla mappa;
- **Inviato al Comune:** trasmissione documentata all'amministrazione o al soggetto competente;
- **Risolto:** problema non più presente o intervento concluso e verificato.

La fase precedente alla pubblicazione rimane interna e assume soltanto gli stati **Ricevuta**, **Pubblicata** o **Respinta**. I livelli di verifica L0–L3 e il workflow esteso descritti nelle sezioni successive appartengono alla visione evolutiva e non sono requisiti del primo rilascio.

### 0.3 PWA leggera

Il primo rilascio è una web app mobile-first installabile, dotata di:

- manifest;
- icona;
- modalità standalone;
- cache della sola interfaccia essenziale.

Non sono richieste nell'MVP la compilazione offline, la sincronizzazione differita, la cartografia offline o l'invio in background. In assenza di connessione l'utente viene invitato a conservare le fotografie e completare successivamente la segnalazione.

### 0.4 Contenuti iniziali

La piattaforma viene pubblicata con:

- **10–15 schede curate direttamente dal gruppo editoriale**;
- **massimo sei categorie**, scelte tra quelle elencate nella sezione 5.1;
- una distribuzione equilibrata tra criticità, risorse e proposte;
- nessuna registrazione o profilo pubblico.

Le schede iniziali servono a mostrare concretamente tono, qualità documentale e finalità del progetto prima di aprire la raccolta collaborativa.

### 0.5 Funzioni esplicitamente rinviate

Non appartengono all'MVP:

- account pubblici e ruoli articolati;
- collaboratori verificati;
- livelli di verifica pubblici;
- notifiche e iscrizioni;
- commenti, voti e classifiche;
- dashboard e statistiche avanzate;
- API pubblica;
- dossier PDF e comunicazioni automatiche;
- linee e poligoni geografici;
- invio automatico agli enti;
- funzionamento offline completo;
- riuso multi-comune e multitenancy.

### 0.6 Criteri per decidere se proseguire

Dopo un primo periodo di esercizio, indicativamente un mese, si valutano:

- numero di contributi ricevuti;
- percentuale di contributi pubblicabili;
- utilità e qualità delle informazioni raccolte;
- tempo necessario per la moderazione;
- categorie effettivamente utilizzate;
- presenza di aggiornamenti o riscontri sui casi pubblicati;
- eventuali problemi editoriali, tecnici o di privacy.

Solo sulla base di questi risultati si decide quali funzioni della specifica completa sviluppare successivamente.

### 0.7 Architettura vincolante dell'MVP rapido

Per ridurre al minimo sviluppo, amministrazione e costi, l'MVP utilizza esclusivamente:

1. **GitHub Pages**, per pubblicare la PWA Vue come sito statico;
2. **Supabase gestito**, per database, API, autenticazione dei moderatori e archiviazione delle immagini;
3. **un servizio cartografico esterno compatibile con MapLibre**, limitato alla cartografia di base.

Non sono previsti server applicativi, FastAPI, VPS, container, macchine virtuali o database amministrati direttamente dal gruppo.

Il flusso è:

```text
Browser / PWA
   ├── GitHub Pages: interfaccia Vue
   ├── Supabase Database: dati e API
   ├── Supabase Storage: fotografie
   └── Supabase Auth: accesso moderatori
```

La scelta rende possibile pubblicare rapidamente il prototipo, ma introduce dipendenza da GitHub e Supabase. Il progetto Supabase deve essere collocato in una regione europea. Questa configurazione non soddisfa un requisito di sovranità tecnologica europea assoluta e dovrà poter essere sostituita in futuro grazie a schema SQL, migrazioni ed esportazioni documentate.

### 0.8 Stack dell'MVP

| Componente | Scelta |
| --- | --- |
| Frontend | Vue 3 + Vite |
| PWA | `vite-plugin-pwa` |
| Routing | Vue Router con hash history nell'MVP |
| Cartografia | MapLibre GL JS |
| Backend applicativo | Nessuno |
| API | Supabase Data API |
| Database | PostgreSQL Supabase con PostGIS |
| Fotografie | Supabase Storage |
| Autenticazione | Supabase Auth, solo moderatori |
| Autorizzazione | PostgreSQL Row Level Security (RLS) |
| Deploy | GitHub Actions verso GitHub Pages |
| Operazioni protette opzionali | Supabase Edge Function |

### 0.9 Distribuzione delle responsabilità

**GitHub Pages** gestisce:

- interfaccia pubblica;
- PWA installabile;
- mappa e schede;
- modulo di segnalazione;
- area di moderazione lato client;
- aggiornamento automatico tramite GitHub Actions.

**Supabase** gestisce:

- PostgreSQL e PostGIS;
- API per lettura e scrittura;
- tabelle pubbliche e private;
- fotografie pubbliche e in attesa;
- login e sessioni dei moderatori;
- policy RLS;
- funzioni server-side soltanto se necessarie per protezione antispam o operazioni privilegiate.

### 0.10 Sicurezza specifica del frontend statico

Nel bundle Vue possono essere presenti esclusivamente:

- URL pubblico del progetto Supabase;
- `SUPABASE_PUBLISHABLE_KEY`;
- eventuale token cartografico pubblico limitato al dominio.

Non devono mai essere inseriti nel repository, nelle variabili `VITE_*`, nei workflow o nel bundle:

- `SUPABASE_SECRET_KEY`;
- `service_role` key;
- password PostgreSQL;
- password SMTP;
- segreti CAPTCHA.

I veri segreti, se necessari, devono essere conservati tra i secret delle Supabase Edge Functions. Le credenziali dei moderatori sono gestite da Supabase Auth e non sono memorizzate nel codice.

Le variabili `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` possono essere impostate in GitHub Actions per evitare di scriverle nei file del repository, ma devono essere considerate pubbliche perché vengono incorporate nel JavaScript distribuito. La protezione effettiva dei dati dipende dalle policy RLS.

### 0.11 Regole RLS minime

| Operazione | Visitatore anonimo | Moderatore autenticato |
| --- | ---: | ---: |
| Leggere luoghi pubblicati | Sì | Sì |
| Leggere segnalazioni in attesa | No | Sì |
| Inserire una segnalazione | Sì | Sì |
| Modificare o cancellare una segnalazione | No | Sì |
| Leggere contatti dei segnalanti | No | Sì |
| Pubblicare o modificare un luogo | No | Sì |
| Leggere immagini approvate | Sì | Sì |
| Leggere immagini in attesa | No | Sì |

Tutte le tabelle esposte tramite Data API devono avere RLS attiva. L'utente anonimo non deve poter ottenere l'elenco delle segnalazioni ricevute, nemmeno di quelle inviate da lui, nella prima versione.

### 0.12 Immagini nell'MVP

Supabase Storage utilizza due bucket logici:

- `pending-media`, privato, per i caricamenti non ancora moderati;
- `public-media`, pubblico in lettura, per le sole copie approvate.

L'MVP non automatizza oscuramento di volti o targhe. Il moderatore esamina le fotografie e pubblica soltanto file già compatibili con le regole editoriali. Se la rimozione automatica dei metadati EXIF non può essere garantita nel browser, la fotografia deve essere ricodificata lato client prima del caricamento oppure non deve essere resa pubblica fino al trattamento manuale.

### 0.13 Protezione antispam

Durante una beta controllata è ammesso l'inserimento anonimo diretto, con:

- massimo tre fotografie;
- limiti di tipo e dimensione;
- nessuna pubblicazione automatica;
- monitoraggio manuale.

Prima di una diffusione pubblica ampia, se emergono abusi, viene aggiunta una Supabase Edge Function che valida i dati, verifica un CAPTCHA e applica limiti agli invii. L'Edge Function resta parte dell'ecosistema Supabase e non introduce un backend separato.

---

## 1. Sintesi

**Prima i luoghi** è una Progressive Web App (PWA) civica e indipendente per documentare, localizzare e seguire nel tempo criticità, risorse e proposte relative al territorio.

L'applicazione non è un social network, un canale per segnalazioni d'emergenza o uno spazio di propaganda. È una banca dati territoriale moderata, costruita attraverso contributi verificabili e rappresentata principalmente su una mappa.

Il progetto nasce come evoluzione di **Prima i numeri**: dai dati e dagli atti del PUC si passa all'osservazione documentata dei luoghi. Il principio guida è:

> Prima di decidere come trasformare il territorio, occorre conoscere ciò che esiste, ciò che non funziona e ciò che merita di essere tutelato o migliorato.

## 2. Obiettivi

### 2.1 Obiettivi principali

1. Rendere visibili e localizzabili problemi territoriali concretamente osservabili.
2. Raccogliere fotografie, descrizioni, fonti e proposte in una forma ordinata e confrontabile.
3. Distinguere una semplice segnalazione da una criticità verificata.
4. Seguire pubblicamente l'evoluzione di ciascun caso.
5. Produrre nel tempo indicatori utili per cittadini, tecnici, associazioni e amministrazione.
6. Valorizzare anche luoghi, beni e pratiche positive, evitando una rappresentazione esclusivamente negativa del territorio.
7. Rendere il modello replicabile in altri comuni o da parte di organizzazioni civiche senza scopo di lucro.

### 2.2 Obiettivi non inclusi

La piattaforma non deve:

- sostituire i numeri di emergenza o i canali ufficiali per situazioni urgenti;
- raccogliere accuse contro persone, imprese o amministratori;
- pubblicare automaticamente contenuti inviati dagli utenti;
- diventare una bacheca politica o elettorale;
- attribuire responsabilità giuridiche;
- profilare gli utenti o tracciarne gli spostamenti;
- mostrare dati personali, targhe, volti riconoscibili o dettagli di proprietà private non necessari.

## 3. Principi editoriali

Ogni contenuto pubblico deve essere:

- **territoriale:** riferito a un luogo identificabile;
- **osservabile:** descrivere fatti o condizioni riscontrabili;
- **documentato:** accompagnato, ove possibile, da fotografie, dati o atti pubblici;
- **prudente:** distinguere fatti, ipotesi, percezioni e proposte;
- **non personale:** concentrato sui luoghi e non sulle persone;
- **aggiornabile:** dotato di data, stato e cronologia;
- **moderato:** verificato prima della pubblicazione.

Una segnalazione pubblicata non certifica automaticamente un illecito o una responsabilità. Certifica soltanto che il contenuto ha superato i controlli editoriali previsti dalla piattaforma.

## 4. Utenti e ruoli

| Ruolo | Descrizione | Permessi principali |
| --- | --- | --- |
| Visitatore | Utente non autenticato | Consulta mappa, schede, filtri e statistiche pubbliche |
| Segnalante | Persona che invia un contributo | Crea una segnalazione; nell'MVP non dispone di un account personale |
| Collaboratore verificato | Tecnico, associazione o cittadino riconosciuto | Propone verifiche, fonti, aggiornamenti e integrazioni |
| Moderatore | Componente del gruppo editoriale | Valuta, corregge, unisce, pubblica o respinge contributi |
| Amministratore | Responsabile della piattaforma | Gestisce utenti, categorie, configurazione, audit ed esportazioni |

### 4.1 Autenticazione nell'MVP

- Consultazione pubblica senza registrazione.
- Invio possibile indicando un indirizzo e-mail valido.
- L'indirizzo e-mail non viene pubblicato.
- Conferma immediata dell'avvenuta ricezione; il tracciamento personale tramite link o codice è rinviato.
- Accesso dei moderatori tramite autenticazione sicura.
- Account pubblici e profili personali rinviati a una fase successiva.

## 5. Oggetti territoriali

La mappa contiene **schede luogo**. Una scheda può rappresentare:

1. **Criticità:** problema osservabile che richiede verifica o intervento.
2. **Risorsa:** luogo, bene, paesaggio, servizio o pratica da tutelare o valorizzare.
3. **Proposta:** intervento concreto riferito a un luogo.
4. **Intervento:** attività annunciata, programmata, avviata o conclusa da un soggetto competente.

Nell'MVP sono obbligatorie le tipologie **Criticità**, **Risorsa** e **Proposta**. La tipologia **Intervento** può essere gestita inizialmente come stato o aggiornamento della scheda.

### 5.1 Categorie iniziali

- Acqua, fognature e depurazione
- Strade, marciapiedi e mobilità
- Accessibilità e barriere architettoniche
- Verde pubblico e alberature
- Rifiuti, pulizia e decoro
- Costa, spiagge e ambiente marino
- Rischio idrogeologico e drenaggio
- Spazi pubblici, servizi e attrezzature
- Patrimonio storico, paesaggio e bellezza urbana
- Edifici o aree inutilizzate
- Illuminazione e sicurezza degli spazi
- Altro, soggetto a riclassificazione del moderatore

Le categorie dovranno essere configurabili senza modifiche al codice.

## 6. Flusso principale della segnalazione

Questa sezione descrive il flusso completo verso cui il prodotto può evolvere. Per l'MVP prevale il perimetro semplificato della sezione 0: massimo tre fotografie, nessun account pubblico, nessun tracciamento personale e soli tre stati pubblici.

### 6.1 Invio

Il segnalante:

1. apre la mappa o il pulsante **Segnala un luogo**;
2. autorizza facoltativamente la geolocalizzazione oppure posiziona manualmente il punto;
3. seleziona tipo e categoria;
4. inserisce titolo e descrizione;
5. allega da una a cinque fotografie;
6. indica da quando il fatto è osservato, se noto;
7. può aggiungere una proposta e una fonte pubblica;
8. inserisce l'e-mail e accetta informativa e regole di pubblicazione;
9. visualizza un riepilogo prima dell'invio;
10. riceve conferma e riferimento della pratica.

### 6.2 Stati interni e pubblici

| Stato | Visibilità | Significato |
| --- | --- | --- |
| Bozza | Solo segnalante/dispositivo | Inserimento non ancora inviato |
| Ricevuta | Privata | Segnalazione acquisita |
| In verifica | Privata o sintetica | Controllo di luogo, contenuto, privacy e duplicati |
| Da integrare | Privata | Sono richieste informazioni aggiuntive |
| Verificata | Pubblica | Esistenza e localizzazione ragionevolmente riscontrate |
| Inoltrata | Pubblica | Trasmissione documentata al soggetto competente |
| Presa in carico | Pubblica | Esiste un riscontro formale o un intervento annunciato |
| In lavorazione | Pubblica | Intervento documentato come avviato |
| Risolta | Pubblica | Criticità non più presente o intervento completato |
| Archiviata | Pubblica o privata | Superata, duplicata, non pertinente o non verificabile |
| Respinta | Privata | Viola le regole o non è pubblicabile |

Ogni variazione di stato deve registrare data, autore, motivazione ed eventuale fonte. Gli stati **Presa in carico**, **In lavorazione** e **Risolta** richiedono una prova o una verifica, non la sola dichiarazione di un utente.

### 6.3 Moderazione

Il moderatore deve poter:

- correggere refusi senza alterare il significato;
- oscurare volti, targhe o dettagli sensibili;
- richiedere integrazioni;
- modificare categoria e posizione;
- trasformare formulazioni accusatorie in descrizioni neutrali, previa accettazione del segnalante quando il significato cambia;
- unire segnalazioni duplicate conservandone contributi e cronologia;
- pubblicare, archiviare o respingere motivando la decisione;
- attribuire un livello di verifica.

### 6.4 Livelli di verifica

| Livello | Etichetta pubblica | Criterio minimo |
| --- | --- | --- |
| L0 | Segnalazione ricevuta | Contenuto inviato ma non verificato; non appare sulla mappa pubblica |
| L1 | Documentata | Foto o fonte coerente con luogo e descrizione |
| L2 | Verificata | Riscontro indipendente, sopralluogo o più contributi coerenti |
| L3 | Riscontro ufficiale | Atto, protocollo o risposta di un ente competente |

## 7. Funzioni della visione completa

Le funzioni di questa sezione costituiscono la visione evolutiva. Il primo rilascio implementa esclusivamente il sottoinsieme definito nella sezione 0.

### 7.1 Mappa pubblica

- Mappa centrata sul territorio comunale.
- Marker differenziati per tipologia e stato, con legenda accessibile.
- Raggruppamento dei marker a livelli di zoom bassi.
- Filtri per categoria, tipologia, stato, livello di verifica, località e periodo.
- Ricerca per indirizzo, località o parola chiave.
- Possibilità di mostrare elenco e mappa in modo alternativo.
- URL condivisibile per ogni scheda e per una vista filtrata.
- Posizione approssimata per casi che richiedono tutela della privacy o del bene segnalato.

### 7.2 Scheda luogo

Ogni scheda pubblica mostra:

- titolo e sintesi;
- tipo e categoria;
- posizione sulla mappa;
- fotografie pubblicabili;
- data della prima osservazione e ultimo aggiornamento;
- stato e livello di verifica;
- descrizione del problema o del valore del luogo;
- proposta, se presente;
- fonti e documenti pubblici;
- cronologia degli aggiornamenti;
- eventuale collegamento a casi correlati;
- pulsante **Aggiungi informazioni**;
- pulsante di condivisione;
- avvertenza per emergenze e contenuti impropri.

Il nome e l'e-mail del segnalante non sono mostrati, salvo scelta editoriale esplicita e consenso separato.

### 7.3 Modulo di segnalazione

- Mobile-first e completabile in meno di cinque minuti.
- Salvataggio temporaneo locale della bozza.
- Acquisizione foto da fotocamera o galleria.
- Rimozione automatica dei metadati EXIF dalle immagini pubblicate.
- Ridimensionamento e compressione prima del caricamento.
- Controllo obbligatorio del riepilogo.
- Informativa breve durante il flusso e informativa completa collegata.
- Segnalazione evidente che la piattaforma non gestisce emergenze.

### 7.4 Area di moderazione

- Coda ordinabile per data, categoria, località e rischio editoriale.
- Vista comparativa con possibili duplicati vicini.
- Anteprima della scheda pubblica.
- Gestione delle richieste di integrazione.
- Registro delle decisioni di moderazione.
- Gestione degli stati e dei livelli di verifica.
- Esportazione CSV/GeoJSON dei dati non personali.
- Separazione netta tra dati pubblici e contatti dei segnalanti.

### 7.5 PWA

- Installabile su Android, iOS e desktop dai browser compatibili.
- Manifest con nome, icone, colore e modalità standalone.
- Service worker per cache dell'interfaccia e delle ultime schede consultate.
- Pagina offline comprensibile.
- Bozza della segnalazione disponibile offline sul dispositivo.
- Invio o sincronizzazione solo dopo conferma dell'utente quando torna la connessione.
- Indicazione chiara di dati aggiornati/non aggiornati quando offline.

Nell'MVP non è necessario rendere offline l'intera cartografia né consentire l'invio silenzioso in background.

## 8. Funzioni successive all'MVP

### Fase 2

- notifiche via e-mail sugli aggiornamenti di una scheda;
- iscrizione a categoria o zona;
- contributi e verifiche da collaboratori riconosciuti;
- dashboard pubblica con tempi medi e distribuzione territoriale;
- generazione di dossier PDF e comunicazioni protocollabili;
- mappa temporale prima/dopo;
- API pubblica in sola lettura;
- importazione di open data e atti pubblici georiferiti.

### Fase 3

- istanze distinte per altri comuni o associazioni;
- personalizzazione di marchio, categorie e territorio;
- interoperabilità con sistemi civici o comunali;
- votazione o sostegno alle priorità, solo con adeguate misure anti-manipolazione;
- analisi aggregate e confronto tra periodi o aree.

Il voto alle segnalazioni non appartiene all'MVP: rischierebbe di premiare la capacità di mobilitazione più della rilevanza tecnica.

## 9. Requisiti dei dati

### 9.1 Entità principali

| Entità | Campi essenziali |
| --- | --- |
| Luogo | ID, geometria, località, indirizzo descrittivo, precisione pubblica |
| Scheda | ID, tipo, categoria, titolo, descrizione, proposta, stato, livello verifica, date |
| Media | ID, file, didascalia, autore/diritti, data, versione oscurata |
| Fonte | titolo, ente/autore, data, URL o documento, riferimento puntuale |
| Aggiornamento | data, testo, stato precedente/nuovo, prova associata |
| Segnalante | ID interno, e-mail, consenso, data verifica; mai pubblico per default |
| Moderazione | autore, azione, data, motivazione, versione precedente |
| Relazione | scheda origine, scheda destinazione, tipo di relazione |

### 9.2 Geometrie

L'MVP supporta punti. Il modello dati deve poter evolvere verso linee e poligoni per rappresentare strade, corsi d'acqua, spiagge, quartieri e aree di trasformazione.

### 9.3 Qualità e provenienza

Ogni dato rilevante deve conservare:

- chi lo ha inserito o modificato, internamente;
- data di acquisizione e aggiornamento;
- provenienza;
- livello di verifica;
- storico delle modifiche;
- eventuali limiti o incertezze.

## 10. Privacy, sicurezza e responsabilità editoriale

### 10.1 Privacy by design

- Raccogliere solo i dati personali necessari.
- Non pubblicare identità e contatti per impostazione predefinita.
- Conservare separatamente contenuti territoriali e contatti.
- Definire tempi di conservazione per segnalazioni respinte e dati di contatto.
- Consentire richiesta di accesso, rettifica e cancellazione nei limiti applicabili.
- Rimuovere metadati di geolocalizzazione dalle immagini distribuite pubblicamente.
- Impedire l'indicizzazione delle aree amministrative e delle segnalazioni non pubblicate.

### 10.2 Sicurezza minima

- HTTPS obbligatorio.
- Controllo degli accessi per ruolo.
- Autenticazione robusta e secondo fattore per amministratori e moderatori.
- Protezione da spam, invii automatizzati e caricamenti malevoli.
- Validazione di file, dimensioni, MIME type e contenuto.
- Rate limiting e registrazione degli accessi amministrativi.
- Backup periodici e procedura di ripristino verificata.
- Aggiornamento delle dipendenze e gestione delle vulnerabilità.
- RLS attiva su ogni tabella esposta tramite Supabase Data API.
- Nessuna secret key o service-role key inclusa nel frontend GitHub Pages.
- Bucket delle immagini in attesa non accessibile agli utenti anonimi.

### 10.3 Regole sui contenuti

Sono esclusi:

- nomi o accuse riferite a persone;
- propaganda elettorale o di partito;
- contenuti discriminatori, offensivi o intimidatori;
- informazioni sanitarie o altri dati sensibili;
- fotografie non necessarie di minori, volti, targhe o spazi privati;
- segnalazioni di emergenza;
- affermazioni non verificabili formulate come fatti;
- materiale coperto da diritti senza autorizzazione.

## 11. Requisiti non funzionali

### 11.1 Usabilità e accessibilità

- Interfaccia progettata innanzitutto per smartphone.
- Linguaggio semplice, non burocratico.
- Conformità almeno a WCAG 2.2 livello AA per i flussi principali.
- Navigazione da tastiera, focus visibile e testi alternativi.
- Colore mai usato come unico indicatore di categoria o stato.
- Moduli con errori comprensibili e recuperabili.

### 11.2 Prestazioni

- Caricamento rapido anche su connessioni mobili deboli.
- Immagini responsive e caricate progressivamente.
- Marker richiesti per area visibile o raggruppati lato server/client.
- Obiettivo iniziale: interfaccia utilizzabile entro 3 secondi su una normale rete mobile, esclusa la cartografia di terze parti.

### 11.3 Portabilità e apertura

- Dati territoriali esportabili almeno in CSV e GeoJSON.
- Identificativi stabili e URL permanenti.
- Nessun vincolo funzionale a una singola piattaforma proprietaria.
- Separazione tra motore, configurazione territoriale e identità grafica, in vista del riuso.

### 11.4 Osservabilità

- Monitoraggio di errori e disponibilità senza profilazione commerciale degli utenti.
- Statistiche aggregate e rispettose della privacy.
- Registro delle operazioni amministrative.

## 12. User story e criteri di accettazione essenziali

### US-01 — Consultare le criticità

**Come** cittadino, **voglio** vedere sulla mappa le criticità verificate **per** capire quali problemi sono documentati nella mia zona.

**Accettazione:**

- la mappa mostra solo contenuti pubblicati;
- ogni marker conduce a una scheda;
- filtri e legenda restano utilizzabili da smartphone;
- lo stato pubblico è sempre visibile.

### US-02 — Segnalare un luogo

**Come** cittadino, **voglio** inviare una segnalazione con posizione e foto **per** sottoporla alla verifica del gruppo editoriale.

**Accettazione:**

- la posizione può essere automatica o manuale;
- l'utente vede il riepilogo e accetta le regole;
- il contenuto non diventa pubblico automaticamente;
- l'utente riceve un riferimento per seguirlo;
- una bozza non inviata può essere recuperata sullo stesso dispositivo.

### US-03 — Moderare una segnalazione

**Come** moderatore, **voglio** controllare contenuto, privacy, localizzazione e duplicati **per** pubblicare informazioni affidabili e prudenti.

**Accettazione:**

- ogni decisione è registrata;
- il moderatore può richiedere integrazioni;
- dati personali e scheda pubblica sono separati;
- la pubblicazione richiede almeno categoria, posizione e stato.

### US-04 — Aggiornare lo stato

**Come** moderatore, **voglio** registrare un riscontro o una soluzione **per** mostrare l'evoluzione documentata del caso.

**Accettazione:**

- il cambio di stato crea una voce cronologica;
- gli stati che implicano azioni esterne richiedono una fonte o una nota di verifica;
- la scheda conserva lo storico senza sovrascrivere il passato.

## 13. Metriche di successo dell'MVP

Le metriche non devono premiare il semplice volume. Sono proposte:

- percentuale di segnalazioni valutate entro sette giorni;
- percentuale di contributi pubblicabili dopo integrazione;
- percentuale di schede aggiornate almeno una volta;
- numero di duplicati correttamente aggregati;
- tempo mediano tra ricezione, verifica e pubblicazione;
- numero di casi con riscontro formale o soluzione documentata;
- copertura equilibrata tra categorie e località;
- assenza di incidenti rilevanti relativi a privacy o contenuti personali.

## 14. Perimetro della prima evoluzione dopo l'MVP

Se l'MVP conferma l'interesse dei cittadini e la sostenibilità della moderazione, la prima evoluzione può comprendere:

1. home e manifesto editoriale;
2. mappa pubblica con filtri;
3. schede luogo e cronologia;
4. modulo guidato con foto e geolocalizzazione;
5. conferma e tracciamento della segnalazione;
6. area riservata di moderazione;
7. gestione di stati e livelli di verifica;
8. esportazione CSV/GeoJSON;
9. bozza offline e gestione più completa della PWA;
10. ampliamento progressivo delle schede curate, distribuite tra criticità, risorse e proposte.

Anche questa evoluzione non comprende necessariamente commenti pubblici, chat, voti, classifiche, profili social, notifiche push, invio automatico a enti o multitenancy: ciascuna funzione deve rispondere a un bisogno emerso durante l'uso reale.

## 15. Architettura tecnica dell'MVP

L'architettura dell'MVP è definita e non richiede un backend personalizzato:

```text
Repository GitHub
├── Vue 3 + Vite
├── MapLibre GL JS
├── vite-plugin-pwa
├── supabase-js
└── GitHub Actions → GitHub Pages

Supabase
├── PostgreSQL + PostGIS
├── Data API
├── Storage
├── Auth
├── RLS
└── Edge Function opzionale
```

### 15.1 Deploy

Ogni push accettato sul ramo principale deve:

1. installare le dipendenze;
2. eseguire controlli e build di produzione;
3. fornire alla build URL Supabase e publishable key;
4. generare l'artefatto statico;
5. pubblicarlo su GitHub Pages tramite GitHub Actions.

Il deploy non esegue migrazioni del database. Le migrazioni SQL sono versionate nel repository e applicate a Supabase attraverso un'operazione separata e consapevole.

### 15.2 Routing e dominio

Per evitare errori al caricamento diretto delle rotte su GitHub Pages, l'MVP usa Vue Router con hash history. Un dominio personalizzato potrà essere collegato a GitHub Pages senza cambiare l'architettura. Il passaggio a URL senza hash è rinviato.

### 15.3 Portabilità

Devono essere conservati nel repository:

- migrazioni SQL complete;
- definizioni delle policy RLS;
- configurazione dei bucket e relative policy;
- eventuali Edge Functions;
- dati iniziali non personali;
- procedura di esportazione e ripristino.

Questa documentazione deve consentire di spostare in futuro database e applicazione su un'infrastruttura differente.

## 16. Decisioni aperte

Prima della progettazione esecutiva occorre decidere:

1. se l'ambito iniziale comprende l'intero Comune o parte da Policastro;
2. chi assume formalmente il ruolo di titolare del trattamento e responsabile editoriale;
3. quali criteri qualificano collaboratori e tecnici verificati;
4. se pubblicare segnalazioni L1 oppure soltanto da L2;
5. come documentare sopralluoghi e verifiche senza esporre i collaboratori;
6. quali canali ufficiali usare per l'inoltro agli enti;
7. quali licenze applicare a codice, dati, testi e fotografie;
8. quale livello di anonimato offrire al segnalante;
9. quali tempi di conservazione applicare ai dati personali;
10. quale organizzazione sosterrà costi, moderazione e continuità del servizio.

## 17. Roadmap proposta

### Fase 0 — Definizione editoriale

- manifesto, regolamento e privacy;
- categorie, stati e criteri di verifica;
- gruppo minimo di moderazione;
- selezione delle prime dieci schede.

### Fase 1 — Prototipo

- wireframe mobile;
- mappa con dati dimostrativi;
- test del flusso di invio e moderazione;
- verifica con un piccolo gruppo di cittadini e tecnici.

### Fase 2 — MVP pubblico

- pubblicazione PWA;
- monitoraggio intensivo delle prime settimane;
- revisione di categorie, regole e carico di moderazione.

### Fase 3 — Consolidamento

- dashboard, notifiche e dossier;
- collaborazione strutturata con associazioni e tecnici;
- documentazione per il riuso in altri territori.

---

## Nota conclusiva

Il principale elemento di qualità di **Prima i luoghi** non sarà la quantità delle segnalazioni, ma la capacità di trasformare osservazioni sparse in una memoria territoriale verificabile: localizzata, documentata, aggiornata e utilizzabile per discutere scelte pubbliche senza trasformare il confronto in uno scontro tra persone o schieramenti.
