# ARCHITETTURA.md — mappa del codice

## Struttura dei file

```
index.html              Homepage: tutte le sezioni pubbliche in un unico file
                         (HTML + CSS in <style> + JS in <script>, inline)
area-utente.html         Area riservata (profilo, documenti dei working group)
pages/
  signup.html            Form "Join the Movement" (iscrizione pubblica)
  apply-coordinator.html Candidatura a Coordinatore Nazionale
policies/
  foreign-policy.html    ) Sette pagine per working group, ognuna un file
  defence-security.html  ) HTML a sé stante (nessun template condiviso):
  justice.html            ) stesso <head>, stesso <main>, cambiano testo,
  education.html          ) colore accent, icona ed i18n-key prefix.
  healthcare.html         )
  immigration-human-rights.html
  energy-environment.html  Come le altre sei, MA con in più — in cima al
                          <main>, sezione .wg-intro — la presentazione del
                          gruppo (chi siamo, visione, sei ambiti, CTA):
                          è il modello da riusare per gli altri gruppi
                          quando avranno una pagina (vedi @docs/PROCEDURE.md).
  policies.css           CSS condiviso dalle 7 pagine sopra
  policies.js            Filtro (Tutti/Position/Brief) sui .paper-card
                          dentro #papers-list; mostra #empty-state se
                          non ci sono card. Riguarda SOLO la sezione
                          "Position Paper" (documenti ufficiali): la
                          sezione "Voices from Europe" di ogni pagina è
                          testo statico + link a
                          voices/index.html?theme=<slug del gruppo>.
voices/
  index.html              Pagina unica "Voices from Europe": tutti gli
                          articoli, o filtrati con ?author=/?theme=
                          (vedi sotto)
  _template.html          Modello da duplicare per ogni nuovo articolo
                          (non è mai elencato nell'indice)
  voices.css, voices.js   Stile e logica di rendering/filtro, letti da
                          assets/data/voices.json
assets/
  data/voices.json        Indice di autori e articoli di Voices from
                          Europe (authors[], articles[]) — vedi
                          @docs/PROCEDURE.md per come aggiungere un articolo
  images/authors/         Foto autori Voices, ritagliate a cerchio via
                          CSS (400×400, vedi @docs/PROCEDURE.md)
  js/i18n.js              Motore i18n custom (vedi sotto)
  js/auth.js              Wrapper Supabase Auth, esposto come window.EYMAuth
  i18n/{en,it,fr,es,de}.json  Le 5 lingue del sito
  images/european-union-map.svg  Mappa SVG usata da #territory (index.html)
  docs/manifesto.pdf, ethics-code.pdf  Scaricabili
  logos/                  Loghi EYM in varie versioni/formati
api/
  subscribe.js            POST /api/subscribe    → Brevo (newsletter)
  signup.js                POST /api/signup       → Brevo + invito Supabase
  apply-coordinator.js     POST /api/apply-coordinator → email via Brevo SMTP
  auth.js                  Route autenticate (upload-url, documents) sotto
                           /api/auth/*, usano la service role key
server.js                 Express: statico + monta le 4 route sopra
supabase/
  migration.sql            Schema v1 (profiles, whitelist — superata)
  migration_v2.sql         Schema v2 (wg_access, RLS su documents)
  admin-queries.sql        Query pronte per il dashboard Supabase (IT)
```

## Le sezioni di index.html

Sono tutte dentro `<section id="...">`, navigabili da `<nav>` in header
tramite anchor: `#home`, `#policies`, `#movement`, `#territory`,
`#events`, `#news`. In coda al file: i modali (`.modal-overlay`), lo
script della mappa e il modale di login/signup (`#auth-modal`).

Dentro `#policies`, dopo le 7 card dei gruppi tematici, ci sono **due
blocchi distinti e non vanno più rifusi in uno solo** (successe una
volta, corretto il 2026-09-18 — vedi @docs/NOTE.md):
- **"Position Papers"** (`policies_section.papers_*`): sempre visibile,
  parla solo di documenti ufficiali dei Gruppi Tematici. Stato vuoto
  sobrio, nessun invito a contribuire.
- **"Voices from Europe"** (`#voices-cta-policies`,
  `policies_section.voices_*`): nascosto di default, si accende con
  l'interruttore `VOICES_PUBLIC` (vedi @docs/PROCEDURE.md). Parla di
  contributi personali dei singoli membri e porta a `voices/index.html`.

Attenzione alla **duplicazione dei membri dell'organigramma**: ogni
sezione dell'organigramma (Consiglio Direttivo, Segreteria, Dipartimento
Legale, Coordinatori Tematici, Comunicazione) compare **due volte** nel
file — una volta come lista statica dentro `#movement`, e una seconda
volta dentro il modale corrispondente (`#modal-org-*`), aperto dal
bottone "View Members →". Le due liste vanno tenute sincronizzate a
mano: non esiste una fonte unica.

## I due flussi di iscrizione (distinti, non confonderli)

1. **Modale di login → tab "Sign Up"** (`#auth-modal`, `data-panel="signup"`,
   funzione `handleSignup()` in `index.html`). Chiama
   `EYMAuth.signUp()` → `supabase.auth.signUp()` **direttamente dal
   browser**: crea subito un account Supabase (con email di conferma
   gestita da Supabase Auth). Non passa da Brevo né dal backend Express.

2. **Form "Join the Movement"** (`pages/signup.html` → `POST /api/signup`
   → `api/signup.js`). Scrive il contatto su **Brevo** (lista
   `BREVO_MEMBERS_LIST_ID`). Se la scrittura va a buon fine, in modo
   *fire-and-forget* invia anche un invito Supabase
   (`admin.auth.admin.inviteUserByEmail`) e pre-compila la riga in
   `profiles` con i dati del form. L'utente riceve quindi un'email di
   invito Supabase (diversa dall'email di conferma del flusso 1) per
   impostare la password.

Sono due strade diverse per finire nello stesso posto (un account
Supabase con una riga in `profiles`), ma con trigger, email e side
effect (Brevo) differenti. `api/subscribe.js` è un terzo flusso ancora
più semplice: iscrizione alla sola newsletter, nessun account.

## Area riservata e `wg_access`

`area-utente.html` mostra profilo utente, cambio password, e — per ogni
working group — la lista documenti e (se autorizzato) un form di
upload. L'accesso ai documenti di un working group non è legato al
ruolo utente ma a righe nella tabella `public.wg_access`
(`user_id`, `working_group`, `can_upload`): niente riga → nessun
accesso; riga con `can_upload=false` → sola lettura; `can_upload=true`
→ lettura e upload. Le policy RLS su `documents` e `wg_access`
(`supabase/migration_v2.sql`) applicano questa regola anche lato
database, non solo in `api/auth.js`. Gestione riga per riga: vedi
@docs/PROCEDURE.md.

## Motore i18n

`assets/js/i18n.js` è ~60 righe, nessuna libreria. Al `DOMContentLoaded`
rileva la lingua (localStorage → lingua browser → default `en`), fa
`fetch('/assets/i18n/<lang>.json')` e applica il JSON al DOM:
- `[data-i18n="a.b.c"]` → `el.textContent` (chiave puntata, letta con
  `key.split('.').reduce(...)` nel JSON)
- `[data-i18n-html="a.b.c"]` → `el.innerHTML` (per testo con markup)
- `[data-i18n-placeholder="a.b.c"]` → `el.placeholder`
- `[data-i18n-label="a.b.c"]` → `el.label` (aggiunto il 2026-09-18, serve
  per le intestazioni `<optgroup>` dei menu a tendina)
Il cambio lingua (`EYM.setLang()`) è client-side, senza reload. Il tag
`<title>` **si aggiorna anche lui**, sia al caricamento che al cambio
lingua: non serve un meccanismo dedicato, basta mettere `data-i18n="…"`
direttamente sul tag `<title>` come su un qualsiasi altro elemento —
`document.querySelectorAll('[data-i18n]')` lo trova lì dentro `<head>`
come farebbe altrove, e scrivere il suo `textContent` aggiorna anche la
linguetta del browser (comportamento nativo del DOM, non codice scritto
apposta). Verificato il 2026-09-18 aprendo una pagina, cambiando lingua
dal selettore senza ricaricare e controllando che il titolo nella
linguetta cambiasse davvero (vedi @docs/NOTE.md). Ogni pagina che usa testo
i18n include lo script e replica le stesse chiavi: non c'è un file
centrale di route → pagina, ogni file richiama `i18n.js` in autonomia.

## Voices from Europe — modello dati

`assets/data/voices.json` ha due elenchi, `authors[]` e `articles[]`
(schema completo e passo-passo per pubblicare in @docs/PROCEDURE.md). È
letto da **due punti del sito**, non uno solo: `voices/voices.js` (la
pagina `voices/index.html`, elenco completo e viste filtrate) e, dal
2026-09-19, un piccolo script inline in `index.html` (le anteprime degli
ultimi 3 articoli nella sezione Politiche/home). Qui solo la parte che
riguarda il codice:

- **`article.file` è SOLO il nome del file, mai un percorso.** Es.
  `"variable-geometry-middle-powers.html"`, non
  `"voices/variable-geometry-middle-powers.html"`. Il motivo è che i due
  punti che lo leggono stanno a due livelli diversi del sito e ciascuno
  ci antepone la propria posizione per conto proprio:
  - `voices/voices.js` sta già dentro `voices/`: usa `article.file`
    così com'è come `href` (nessun prefisso aggiunto nel codice).
  - Lo script in `index.html` sta nella root: costruisce il link come
    `'voices/' + article.file`.

  Se `file` contenesse già `voices/` davanti, il primo caso
  funzionerebbe per caso ma il secondo produrrebbe
  `voices/voices/nome-file.html` (percorso raddoppiato, pagina
  introvabile) — è esattamente il difetto trovato e corretto il
  2026-09-19 in produzione. Stesso discorso per `author.photo`: è un
  percorso dalla root del sito (es.
  `"assets/images/authors/nome.jpg"`), e ciascun punto che lo consuma
  antepone da solo quello che gli serve per arrivarci dalla propria
  posizione (`voices/voices.js` mette `'../'` davanti, lo script in
  `index.html` lo usa così com'è).
- Ogni autore ha `bio` (il primo paragrafo, breve) e, dal 2026-09-18,
  `bioLong` (facoltativa): un **array di stringhe**, una per paragrafo,
  non un unico blocco di testo con `\n\n`. **Le due bio non sono
  alternative, sono in sequenza**: `bio` è sempre il primo paragrafo,
  `bioLong` — se presente — continua da lì. `voices/voices.js` →
  `renderAuthorCard()` stampa prima `bio` (se c'è), poi ogni elemento di
  `bioLong` (se c'è); se l'autore non ha né l'una né l'altra non stampa
  nessun paragrafo, ma il riquadro con foto/nome/bandiera resta (corretto
  il 2026-09-19: prima la presenza di `bioLong` faceva sparire `bio`,
  come se fossero due opzioni invece che due parti della stessa
  biografia).
- Le due bio non vivono nello stesso punto della pagina: la biografia
  COMPLETA (`bio` + `bioLong`) compare **solo** nel riquadro
  `#author-card` di `voices/index.html` quando la pagina è filtrata con
  `?author=<slug>`. La pagina di ogni singolo articolo mostra **solo**
  `bio`, mai `bioLong` — e quel testo in cima alla pagina articolo
  (`.author-card-sm`) non è generato da JS: è scritto a mano dentro il
  file dell'articolo stesso, duplicato da `voices.json` al momento di
  compilare il template (vedi @docs/PROCEDURE.md) — cambiare `bio` in
  `voices.json` dopo la pubblicazione non aggiorna le pagine articolo
  già scritte.
- Le anteprime in home (`index.html`, dentro `#voices-preview-grid`,
  sotto il riquadro `#voices-cta-policies`) leggono lo stesso
  `voices.json`, ordinano gli articoli per `date` decrescente e ne
  mostrano al massimo 3. Se il file non c'è, non risponde, o il JSON non
  è leggibile, la funzione (`loadVoicesPreviews()`) esce in silenzio: il
  blocco resta `display:none` (il suo stato di partenza nell'HTML) e il
  resto della home non risente di nulla — nessun errore in console.
  Stesso comportamento se l'elenco è vuoto. Il blocco è collegato allo
  stesso interruttore `VOICES_PUBLIC` del resto della sezione Voices
  (vedi @docs/PROCEDURE.md): se è `false`, le anteprime non vengono
  nemmeno richieste.
- La colonna di lettura degli articoli è già limitata in
  `voices.css` (`.article-main { max-width: 720px; }`): su schermi
  larghi il testo non si allarga a piena pagina. Non serve toccarla per
  ogni nuovo articolo.

## Dati scritti a mano nell'HTML (non nel database)

Nessuno di questi ha una schermata di amministrazione: sono testo
statico in `index.html`, modificabile solo editando il file e
pubblicando.
- **Organigramma**: nomi, cariche e bandiere di Consiglio Direttivo,
  Segreteria, Dipartimento Legale, Coordinatori Tematici, Comunicazione
  & Marketing (sezione `#movement` + modali corrispondenti).
- **Coordinatori Nazionali**: lista per paese in `#territory` (+ modale
  `#modal-org-nc`) — oggi tutti segnaposto "To be announced".
- **Paesi della mappa**: il Set `MEMBER_COUNTRIES` nello `<script>` di
  `index.html` (dopo il caricamento SVG), che decide quali tracciati
  della mappa vengono evidenziati in blu.
