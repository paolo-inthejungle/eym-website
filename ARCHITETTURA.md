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
  foreign-policy.html    ) Sette pagine identiche nella struttura, una per
  defence-security.html  ) working group. Ognuna è un file HTML a sé stante
  energy-environment.html) (nessun template condiviso): stesso <head>,
  justice.html            ) stesso <main>, cambiano solo testo, colore
  education.html          ) accent, icona ed i18n-key prefix.
  healthcare.html         )
  immigration-human-rights.html
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
                          @PROCEDURE.md per come aggiungere un articolo
  images/authors/         Foto autori Voices, ritagliate a cerchio via
                          CSS (400×400, vedi @PROCEDURE.md)
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
@PROCEDURE.md.

## Motore i18n

`assets/js/i18n.js` è ~60 righe, nessuna libreria. Al `DOMContentLoaded`
rileva la lingua (localStorage → lingua browser → default `en`), fa
`fetch('/assets/i18n/<lang>.json')` e applica il JSON al DOM:
- `[data-i18n="a.b.c"]` → `el.textContent` (chiave puntata, letta con
  `key.split('.').reduce(...)` nel JSON)
- `[data-i18n-html="a.b.c"]` → `el.innerHTML` (per testo con markup)
- `[data-i18n-placeholder="a.b.c"]` → `el.placeholder`
Il cambio lingua (`EYM.setLang()`) è client-side, senza reload. Ogni
pagina che usa testo i18n include lo script e replica le stesse chiavi:
non c'è un file centrale di route → pagina, ogni file richiama
`i18n.js` in autonomia.

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
