# PROCEDURE.md — operazioni manuali

Queste operazioni non hanno una schermata nel sito: si fanno a mano, nel
dashboard Supabase o editando file nel repo. Scritte per chi non legge
il codice.

## 1. Dare o togliere a un utente l'accesso ai documenti di un working group

Dashboard Supabase → **SQL Editor** → nuova query. Le query pronte sono
in `supabase/admin-queries.sql` (in italiano, con commenti). In sintesi:

1. Trova l'UUID dell'utente dalla sua email (query 1 del file).
2. Dai accesso in sola lettura a un working group (query 2), o con
   permesso di caricare documenti (query 3).
3. Per togliere solo il permesso di upload (query 4) o revocare
   l'accesso del tutto (query 5).
4. Gli slug validi dei working group sono SOLO questi sette:
   `foreign-policy`, `defence-security`, `energy-environment`,
   `justice`, `education`, `healthcare`, `immigration-human-rights`.

## 2. Aggiungere o rimuovere una persona dall'organigramma

L'organigramma è testo scritto a mano in `index.html`, sezione
`#movement`. **Ogni persona compare in due punti del file** (vedi
@docs/ARCHITETTURA.md): la lista statica dentro `#movement` e il modale
`#modal-org-*` corrispondente — vanno modificati entrambi, altrimenti il
bottone "View Members →" mostra dati vecchi.

Per aggiungere: duplica una scheda `.member-card` (lista statica) e una
`.modal-member-row` (modale), cambia nome e bandiera (emoji, scritta a
mano — non tradurre il nome). Se la carica non esiste già come chiave
i18n, aggiungila in tutti e 5 i file `assets/i18n/*.json` sotto
`movement.roles.*` (o `modals.*` per le cariche dei coordinatori
tematici) — mai il nome della persona, solo il titolo della carica.

Per rimuovere: cancella entrambe le schede. Se una carica resta
scoperta, usa il segnaposto già in uso nel resto del file: `— Pending
Charge —` (`common.pending_charge`) per una carica assegnabile, o
`— To be announced —` (`common.tba`) quando non c'è ancora nessuno.

## 3. Aggiungere un paese alla mappa

1. Apri `assets/images/european-union-map.svg` e cerca l'id del paese
   (minuscolo, codice ISO 3166-1 alpha-2, es. `id="cz"` per la
   Repubblica Ceca). Se il tracciato non esiste nel file, il paese non
   può essere aggiunto senza procurarsi/disegnare un nuovo tracciato —
   non è un'operazione che si fa da qui.
2. In `index.html`, nello `<script>` dopo `loadEuropeMap()`, aggiungi
   il codice al `Set` `MEMBER_COUNTRIES`.
3. Il nome mostrato nel tooltip **non passa da i18n**: viene letto
   direttamente dal tag `<title>` dentro il tracciato SVG (sempre in
   inglese, es. "Czechia"). Per cambiarlo si modifica il testo dentro
   quel `<title>` nell'SVG, non un file JSON.

## 4. Aggiungere un testo nuovo passando da i18n

1. Scegli una chiave puntata coerente con quelle vicine (es.
   `movement.roles.nuovo_titolo`).
2. Aggiungi la chiave con la traduzione corretta in **tutti e 5** i
   file: `assets/i18n/en.json`, `it.json`, `fr.json`, `es.json`,
   `de.json`. Una chiave in un solo file è un bug silenzioso: l'elemento
   resta vuoto (o mostra il fallback inglese) nelle lingue mancanti.
3. Nell'HTML: `data-i18n="chiave"` per testo semplice,
   `data-i18n-html="chiave"` se il testo contiene markup (link, `<br>`,
   `<strong>`), `data-i18n-placeholder="chiave"` per il placeholder di
   un campo.
4. **Come verificare che le 5 lingue abbiano davvero le stesse
   chiavi** (non basta contare, un file può avere una chiave in meno e
   una in più e il totale torna uguale per caso — successo il
   2026-09-18): confronta gli ELENCHI, non i numeri. Da terminale, nella
   root del repo:
   ```
   node -e "
   const fs = require('fs');
   function flat(o,p,out){ for (const k in o){ const kp=p?p+'.'+k:k; if (o[k]&&typeof o[k]==='object'&&!Array.isArray(o[k])) flat(o[k],kp,out); else out[kp]=true; } return out; }
   const langs = ['en','it','fr','es','de'];
   const data = {};
   for (const l of langs) data[l] = flat(JSON.parse(fs.readFileSync('assets/i18n/'+l+'.json','utf8')), '', {});
   const ref = new Set(Object.keys(data.en));
   for (const l of langs) {
     if (l==='en') continue;
     const other = new Set(Object.keys(data[l]));
     const missing = [...ref].filter(k => !other.has(k));
     const extra = [...other].filter(k => !ref.has(k));
     console.log(l, 'missing:', missing, 'extra:', extra);
   }
   "
   ```
   Se una lingua ha `missing` o `extra`, è un bug: aggiungi la chiave
   mancante ovunque manchi, ma NON cancellare una chiave "extra" senza
   prima controllare se è ancora usata nel codice.
5. **Come trovare chiavi richiamate nel codice ma assenti da
   `en.json`.** Non producono un elemento vuoto: il motore i18n lascia
   il testo statico inglese com'è quando la chiave non risolve, quindi
   quel testo resta in inglese anche nelle altre lingue senza errori
   visibili. Da terminale, nella root del repo:
   ```
   node -e "
   const fs = require('fs');
   const path = require('path');
   function flat(o,p,out){ for (const k in o){ const kp=p?p+'.'+k:k; if (o[k]&&typeof o[k]==='object'&&!Array.isArray(o[k])) flat(o[k],kp,out); else out[kp]=true; } return out; }
   const enKeys = new Set(Object.keys(flat(JSON.parse(fs.readFileSync('assets/i18n/en.json','utf8')), '', {})));
   function walk(dir, exts, out) {
     for (const entry of fs.readdirSync(dir, {withFileTypes:true})) {
       if (entry.name === 'node_modules' || entry.name === '.git') continue;
       const p = path.join(dir, entry.name);
       if (entry.isDirectory()) walk(p, exts, out);
       else if (exts.some(e => entry.name.endsWith(e))) out.push(p);
     }
     return out;
   }
   const files = [...walk('.', ['.html'], []), ...walk('.', ['.js'], []).filter(f => !f.includes('node_modules'))];
   const referenced = new Map();
   for (const f of files) {
     const content = fs.readFileSync(f, 'utf8');
     for (const re of [/data-i18n(?:-html|-placeholder)?=\"([^\"]+)\"/g, /EYM\??\.t\(['\"]([^'\"]+)['\"]\)/g]) {
       let m;
       while ((m = re.exec(content))) {
         if (!referenced.has(m[1])) referenced.set(m[1], new Set());
         referenced.get(m[1]).add(f);
       }
     }
   }
   for (const [key, files] of referenced) if (!enKeys.has(key)) console.log(key, '->', [...files].join(', '));
   "
   ```
   Ogni riga stampata è una chiave da aggiungere (con la traduzione
   corretta, non inventata) in tutti e 5 i file, oppure un refuso nel
   nome della chiave nell'HTML/JS da correggere.
6. **Apri almeno una pagina davvero, in una lingua diversa
   dall'inglese, e confronta quello che vedi con l'elenco delle
   modifiche fatte.** I controlli sopra leggono il codice, non lo
   schermo: il 18 settembre 2026 la sola lettura del codice aveva perso
   lo stesso link ("Back to main site →") scollegato in otto file su
   nove, trovato solo aprendo due pagine per davvero. Un `data-i18n`
   scritto bene ma su un elemento sbagliato, o un testo senza nessun
   attributo, non emerge da nessuno script.

## 5. Caricare i template email in Supabase Auth

Dashboard Supabase → **Authentication → Email Templates**. Ogni tipo di
email (Confirm signup, Invite user, Magic Link, Change Email Address,
Reset Password) ha un template modificabile separatamente — sono quelli
usati dai due flussi di iscrizione descritti in @docs/ARCHITETTURA.md
("Confirm signup" per il flusso 1, "Invite user" per il flusso 2 via
`inviteUserByEmail`) e dal recupero password
(`EYMAuth.resetPassword()` → "Reset Password", con redirect già
impostato su `/area-utente.html`). Non è un'operazione che si può fare
da questo repo: va fatta a mano nel dashboard.

## 6. Accendere i collegamenti a Voices from Europe nella home

Finché non ci sono articoli pubblicati, i due collegamenti a "Voices from
Europe" nella home (il blocco nella sezione Politiche e il link leggero
sotto i due bottoni della copertina) restano nascosti. Sono già pronti e
completi, solo spenti.

Per accenderli entrambi insieme: apri **`index.html`**, cerca la
costante **`VOICES_PUBLIC`** (oggi intorno alla **riga 2899**, dentro
l'ultimo `<script>` prima della chiusura di `</body>`) e cambia
```
const VOICES_PUBLIC = false;
```
in
```
const VOICES_PUBLIC = true;
```
Salva, fai commit e push. Non serve toccare nient'altro: è l'unico
interruttore. Nota: riguarda solo la home — le sezioni "Voices from
Europe" nelle pagine dei gruppi tematici e la pagina
`voices/index.html` restano raggiungibili anche a interruttore spento.

## 7. Pubblicare un nuovo articolo su Voices from Europe

Guida passo-passo con un esempio vero: il primo articolo pubblicato,
"If you are not at the table, you are on the menu" di Esther Miguez
Aparicio (2026-09-18, slug `variable-geometry-middle-powers`). Segui gli
stessi passi con i tuoi dati e sei a posto — non serve altro.

**Promemoria valido per tutto questo punto**: il testo dell'articolo e
le biografie dell'autore **non si traducono, non si riscrivono, non si
accorciano e non si "correggono"**. Sono la voce di una persona, firmata
col suo nome: si pubblicano come sono state scritte, in qualunque lingua
siano arrivate. Solo l'interfaccia del sito intorno all'articolo (le
etichette dei bottoni, "Torna al sito" e simili) passa da i18n — mai il
titolo, il corpo o le bio.

### 7.1 L'autore esiste già?

Apri `assets/data/voices.json` e cerca lo slug dell'autore fra gli
`"authors"`. Se non c'è ancora, aggiungilo prima con questi campi:

- **Obbligatori**: `slug` (minuscolo, trattini, univoco — es.
  `"esther-miguez-aparicio"`), `name` (nome e cognome, mai tradotto — es.
  `"Esther Miguez Aparicio"`), `flag` (emoji bandiera, stessa tecnica
  dell'organigramma — es. `"🇪🇸"`).
- **Facoltativo `bio`**: il PRIMO paragrafo della biografia, breve
  (indicativamente sotto le 300 parole). È l'unico che compare in cima
  alla pagina di OGNI articolo di quell'autore, dentro il riquadro
  piccolo sopra il testo — lì `bioLong` non compare mai, nemmeno se
  esiste.
- **Facoltativo `bioLong`**: il SEGUITO della biografia, non una sua
  alternativa. Compare SOLO nella pagina
  `voices/index.html?author=<slug>` (quando qualcuno clicca sul nome
  dell'autore), e lì compare DOPO `bio`, come un'unica biografia
  continua — `bio` è il primo paragrafo, `bioLong` sono quelli
  successivi. **Non è una stringa unica: è un elenco JSON di
  paragrafi**, uno per elemento — non scrivere tutto in un unico blocco
  con `\n\n` in mezzo, il sito non lo spezzerebbe. Non ha senso avere
  `bioLong` senza `bio`: scriveresti una biografia che salta il primo
  paragrafo. Esempio reale (versione accorciata):
  ```json
  "bio": "Esther Miguez Aparicio is a Law and International Relations graduate […]",
  "bioLong": [
    "In Brussels, she worked on European Commission programmes at the Official Spanish Chamber of Commerce in Belgium and Luxembourg. […]",
    "At the Embassy of Paraguay, she drafted notes verbales and official communications […]",
    "She now applies this breadth of experience to geopolitical analysis and strategic foresight […]"
  ]
  ```
  Sulla pagina dell'autore, questo esempio mostra quattro paragrafi in
  fila: `bio`, poi i tre elementi di `bioLong`, nell'ordine in cui sono
  scritti nell'array.

  Se manca `bioLong`, la pagina dell'autore mostra solo `bio`. Se manca
  anche `bio`, non mostra nessun paragrafo (nessuno spazio vuoto,
  nessuna scritta tipo "undefined") — resta comunque il riquadro con
  foto, nome e bandiera.
- **Facoltativo `photo`**: percorso relativo, es.
  `"assets/images/authors/esther-miguez-aparicio.jpg"`. Senza foto compare
  l'icona generica 👤 — non è un difetto, è il comportamento previsto.
  **Questo stesso campo alimenta anche l'anteprima social della pagina
  dell'autore** (quella che compare condividendo
  `voices/index.html?author=<slug>` su WhatsApp/Telegram/LinkedIn — vedi
  @docs/ARCHITETTURA.md): con `photo`, l'anteprima mostra la foto vera
  dell'autore; senza, mostra il logo EYM di riserva. Nessuna azione in
  più da fare: basta che il campo sia compilato con il percorso giusto.
  **Prima di aggiungere foto, bio o bandiera di una persona vera, leggi
  il punto 9 qui sotto (consenso).**

Per ridimensionare una foto a 400×400 prima di caricarla in
`assets/images/authors/`: il progetto ha `sharp` tra le
`devDependencies`. Da terminale, nella root del repo:
```
node -e "require('sharp')('input.jpg').resize(400,400,{fit:'cover'}).toFile('assets/images/authors/esther-miguez-aparicio.jpg')"
```
Sostituisci `input.jpg` con il file originale e il nome del file di
destinazione con lo slug dell'autore.

**La foto va sempre salvata su disco e data a Claude Code come percorso
di file** (es. `C:\Users\...\Desktop\foto.jpeg`), non incollata
direttamente nella chat. Un'immagine incollata in chat non è raggiungibile
sul filesystem: non esiste un file a cui puntare `sharp`, quindi non è
possibile elaborarla né salvarla in `assets/images/authors/`. Se il file
non è ancora disponibile, pubblica l'autore senza `photo` — compare 👤 —
e aggiungi la foto in un secondo momento quando arriva il percorso del
file vero.

### 7.2 Duplica il template

Copia `voices/_template.html` dentro la cartella `voices/`, con un nuovo
nome file in minuscolo e trattini: lo slug dell'articolo. Nel nostro
esempio, `voices/variable-geometry-middle-powers.html`. Poi compila SOLO
le parti segnate `EDIT` nel template:

- `<html lang="en">`: la lingua in cui è scritto l'articolo (`en`, `it`,
  `fr`, `es` o `de`) — serve solo per quell'attributo, non traduce nulla.
- `<title>…</title>`: il titolo dell'articolo, uguale a quello che metti
  al punto 7.3, seguito da ` — Voices from Europe` ("Voices from Europe"
  non si traduce mai).
- **I nove campi dell'anteprima social** (subito sotto il `<title>`, i
  tag `og:*` e `twitter:*`): sono quello che WhatsApp, Telegram e
  LinkedIn mostrano quando qualcuno condivide il link, non quello che si
  vede aprendo la pagina nel browser — se li lasci com'erano nel
  template, l'anteprima resta quella segnaposto. Compilali così:
  - `og:title` e `twitter:title`: uguale al titolo dell'articolo.
  - `og:description` e `twitter:description`: l'`excerpt` che scrivi al
    punto 7.4 per lo stesso articolo — copialo, non riscriverlo.
  - `og:image` e `twitter:image`: lascia il valore del template
    (`assets/logos/og-default.png`, il logo di riserva) — non serve
    un'immagine diversa per ogni articolo.
  - `og:url`: **l'indirizzo completo e pubblico della pagina**, non un
    percorso relativo — i social non risolvono i percorsi relativi, e se
    lo lasci relativo l'anteprima non si genera affatto. Forma:
    `https://www.eym-europe.eu/voices/NOME-FILE.html`.
  - `og:site_name`: lascia `European Youth Movement`.

  **Prima di diffondere il link**, controlla davvero come appare
  l'anteprima (vedi il controllo ripetibile più sotto in questo punto):
  WhatsApp, Telegram e LinkedIn tengono l'anteprima in cache per giorni.
  Se il link viene condiviso con l'anteprima sbagliata e la si corregge
  solo dopo, chi l'ha già ricevuto continua a vedere quella vecchia a
  lungo — non c'è modo di forzare l'aggiornamento dal lato del sito.
- Il link del tema in cima: `href="index.html?theme=foreign-policy"` (uno
  dei sette slug dei working group, o `general`), col `data-i18n` giusto
  per quel tema — nel nostro esempio
  `data-i18n="policies_section.wg.fp_title"` per `foreign-policy`. Ogni
  slug ha la sua chiave; guarda `voices/voices.js` (oggetto
  `THEME_I18N_KEYS`) se non sei sicuro di quale usare.
- `<h1 class="article-title">`: il titolo, identico ovunque compaia (non
  è detto che coincida col titolo del documento originale, se l'autore
  ne ha scelto uno diverso per la pubblicazione — usa quello che l'autore
  ti ha dato per la pubblicazione).
- `<p class="article-date">`: la data in formato AAAA-MM-GG.
- Il riquadro autore in alto (quello piccolo, sopra il testo): se
  l'autore ha una `photo`, lascia il tag `<img>` con il percorso giusto;
  se non ce l'ha, sostituisci l'intero `<img>` con
  `<div class="author-avatar-sm">👤</div>`. Il testo della bio qui è la
  versione **breve** (`bio`, non `bioLong`) — copiata a mano da
  `voices.json`, non collegata via JS: se in futuro cambi `bio`
  nell'autore, questa pagina non si aggiorna da sola, va modificata a
  mano.
- Il corpo dell'articolo (`<div class="article-body">`): vedi il punto
  7.3 qui sotto.
- I due link in fondo: lasciali come sono, puntano già al posto giusto
  (`?author=<slug>` e all'indice) tramite chiavi i18n già esistenti.

### 7.3 Come scrivere il corpo dell'articolo

Dentro `<div class="article-body">`, **solo tre elementi sono ammessi**:

- `<p>…</p>` per ogni paragrafo. Un paragrafo del testo originale = un
  `<p>`, non spezzarli né unirli.
- `<h2>…</h2>` per ogni sottotitolo, esattamente dove l'autore lo ha
  messo (non tutti gli articoli ne hanno; il nostro esempio ne ha due,
  non uno di più).
- `<blockquote>…</blockquote>` solo se l'autore ha scritto una citazione
  isolata da evidenziare (nel nostro esempio non è stato usato: le frasi
  fra virgolette sono rimaste dentro il loro `<p>`, perché fanno parte
  del discorso, non sono citazioni isolate).

**Cosa NON si usa mai in questo corpo**: `<strong>`/grassetto, elenchi
puntati o numerati (`<ul>`/`<ol>`), link dentro il testo (`<a>`). Se il
testo originale li contiene, non riprodurli: è un limite deliberato del
formato, pensato per restare semplice.

Il nostro esempio: 3 sezioni — la prima senza sottotitolo (4 paragrafi),
poi `<h2>Sovereignty through collective resilience.</h2>` (7 paragrafi),
poi `<h2>The middle-power dilemma and its solution through variable
geometry.</h2>` (10 paragrafi). Prima di scrivere, conta i sottotitoli e
i paragrafi nel testo che ti hanno dato: se il conteggio che ti aspetti
non torna con quello che leggi, fidati di quello che leggi, non di
quello che ti aspettavi — è già capitato che il conteggio annunciato
fosse sbagliato.

### 7.4 Aggiungi la riga in "articles"

Dentro `"articles"` di `assets/data/voices.json`, una voce con tutti
questi campi:
```json
{
  "slug": "variable-geometry-middle-powers",
  "title": "\"If you are not at the table, you are on the menu\": Europe's variable geometry and the course of middle powers in an increasingly fragmented world.",
  "authorSlug": "esther-miguez-aparicio",
  "themeSlug": "foreign-policy",
  "date": "2026-09-18",
  "lang": "en",
  "excerpt": "On 16 September 2026, Ursula von der Leyen proposed Canada as the EU's first associate member, a sign of how middle powers are turning to variable geometry to navigate an increasingly fragmented world.",
  "file": "variable-geometry-middle-powers.html"
}
```
- `slug`: uguale al nome del file, senza `.html`.
- `title`: identico a quello scritto nell'`<h1>` del punto 7.2. Le
  virgolette dentro il titolo vanno scritte `\"` (sono dentro una
  stringa JSON).
- `authorSlug`: deve corrispondere esattamente a uno slug già presente
  in `"authors"` (punto 7.1) — uno sbagliato e l'articolo compare senza
  nome autore.
- `themeSlug`: uno dei sette slug dei working group, oppure `"general"`.
- `date`: formato AAAA-MM-GG, usata per ordinare l'elenco (il più recente
  in cima).
- `lang`: la lingua in cui è scritto (mostrata come etichetta, non usata
  per tradurre né nascondere nulla).
- `excerpt`: **lo scrivi tu**, non l'autore — due righe al massimo,
  prendendo parole vere dal testo, senza inventare fatti che l'articolo
  non dice.
- `file`: **solo il nome del file creato al punto 7.2, SENZA la cartella
  `voices/` davanti.**
  - Giusto: `"variable-geometry-middle-powers.html"`
  - Sbagliato: `"voices/variable-geometry-middle-powers.html"`

  Il motivo non è stilistico: la pagina che mostra gli articoli
  (`voices/index.html`) sta già dentro `voices/`, e usa questo valore
  così com'è per costruire il link. Se scrivi `voices/nome-file.html`,
  il browser lo cerca partendo dalla cartella in cui si trova già —
  `voices/` — e ottiene `voices/voices/nome-file.html`, che non esiste:
  l'articolo diventa impossibile da aprire, senza nessun avviso al
  salvataggio (è esattamente l'errore corretto il 2026-09-19, vedi
  @docs/NOTE.md). La home page, che sta invece nella root del sito e
  costruisce i propri link aggiungendo lei stessa `voices/` davanti,
  usa lo stesso valore di `file` in un modo diverso — un motivo in più
  per lasciarlo come nome nudo e non decidere da soli di anteporgli
  qualcosa.

Attenzione alla punteggiatura JSON: una virgola fuori posto rende
l'intero elenco illeggibile (il sito mostra un avviso, ma è meglio non
arrivarci — dopo aver salvato, valida il file, per esempio con
`node -e "JSON.parse(require('fs').readFileSync('assets/data/voices.json','utf8'))"`,
che non stampa nulla se il file è valido e si ferma con un errore se
non lo è).

### 7.5 Fine

Salva, fai commit e push. Non serve toccare nient'altro:
`voices/index.html` legge `voices.json` e costruisce la pagina da solo,
comprese le viste filtrate per autore e per tema.

**Prima di considerarlo pubblicato**, apri davvero nel browser (non
basta leggere il codice):
1. `voices/index.html` — l'articolo compare con titolo, autore, tema,
   data, etichetta lingua, estratto.
2. Il nome dell'autore è cliccabile e porta a `?author=<slug>`; su quella
   pagina compaiono foto (o 👤), nome, bandiera e la biografia COMPLETA
   a paragrafi separati — `bio` seguita da `bioLong` se presente, non
   una delle due al posto dell'altra — sempre visibile, mai dentro un
   menu a scomparsa.
3. Il tema è cliccabile e porta a `?theme=<slug>`.
4. La pagina dell'articolo vera e propria: SOLO `bio` (mai `bioLong`)
   sopra il testo, sottotitoli al posto giusto, paragrafi separati.
5. Dalla pagina `policies/<slug-tema>.html`, il link nella sezione
   "Voices from Europe" porta all'articolo.
6. La pagina si legge bene anche stringendo la finestra del browser
   (o da telefono vero).
7. **L'anteprima social è compilata**, non lasciata come nel template:
   apri il codice sorgente della pagina pubblicata (non serve altro) e
   controlla che `og:title`, `og:description` e `og:url` non siano più
   `ARTICLE TITLE` / `ARTICLE EXCERPT` / `NOME-FILE.html`, ma i valori
   veri di questo articolo.

**Come controllare l'anteprima social prima di diffondere il link**
(WhatsApp, Telegram e LinkedIn la tengono in cache per giorni: vedi
sopra): incolla l'indirizzo pubblico della pagina in uno strumento di
verifica prima di condividerlo per davvero. Il Facebook Sharing
Debugger (`https://developers.facebook.com/tools/debug/`) e il Twitter
Card Validator mostrano l'anteprima esatta e forzano un nuovo
scaricamento, utile anche se hai corretto un'anteprima sbagliata già
condivisa in passato. In alternativa, mandati il link in una chat privata
(a te stesso o a un collega) su WhatsApp o Telegram e guarda cosa
compare prima di mandarlo a chiunque altro.

Lo stesso controllo vale per il link `voices/index.html?author=<slug>`
di ogni autore (quello che compare cliccando sul suo nome): la sua
anteprima è generata dal server al momento della richiesta, non scritta
a mano come quella dell'articolo — vedi @docs/ARCHITETTURA.md — ma va
controllata allo stesso modo prima di condividerla, con lo stesso
strumento.

## 8. Aggiungere un nuovo autore a Voices from Europe (senza un articolo pronto)

Il punto 7.1 sopra spiega tutti i campi passo-passo con un esempio vero
(compresi `bioLong` a paragrafi e il comando `sharp` per la foto): usa
quello come riferimento. Questo punto serve solo per il caso in cui vuoi
registrare un autore in anticipo, prima che abbia un articolo pronto —
aggiungi comunque la sua voce dentro `"authors"` in
`assets/data/voices.json` con gli stessi campi (`slug`, `name`, `flag`
obbligatori; `bio`, `bioLong`, `photo` facoltativi). Un autore senza
nessun articolo collegato non compare da nessuna parte del sito finché
non pubblichi almeno un suo articolo (punto 7).

## 9. Privacy — foto, bio e nazionalità degli autori di Voices

Foto, biografia e bandiera/nazionalità di una persona si pubblicano
**solo con il suo consenso esplicito**, ottenuto prima e conservato (non
basta un "va bene" a voce non registrato da qualche parte).

Se un autore chiede di essere rimosso, va fatto **senza discutere e in
tempi brevi**:
1. Togli la sua voce da `"authors"` in `assets/data/voices.json`.
2. Togli tutte le voci in `"articles"` con quel `authorSlug`.
3. Cancella i file dei suoi articoli in `voices/`.
4. Cancella la sua foto da `assets/images/authors/`.
5. Commit e push.

## 10. Dare a un altro gruppo tematico la stessa pagina di Energia & Ambiente

`policies/energy-environment.html` è il modello (vedi @docs/ARCHITETTURA.md).
Per un altro gruppo (es. Justice):
1. Nella pagina `policies/<slug>.html` di quel gruppo, copia la sezione
   `<section class="wg-intro">...</section>` da
   `policies/energy-environment.html` (è in cima al `<main>`, prima della
   sezione "Position Paper") e incollala nello stesso punto.
2. Sostituisci i testi con quelli del nuovo gruppo e le chiavi i18n con un
   prefisso nuovo (es. `policies_page.jus_page_who_title` invece di
   `ee_page_who_title`), aggiunto in tutti e 5 i file
   `assets/i18n/*.json`.
3. Aggiorna i link della sezione "Get involved": iscrizione al Movimento
   (`../pages/signup.html`, invariato) e il link Telegram del gruppo
   (prendilo dalla card corrispondente in `index.html`, sezione
   `#policies` — ogni gruppo ha il proprio link `https://t.me/c/...`).
4. In `index.html`, nella card del gruppo dentro `#policies`: rimuovi (se
   presente) il link testuale "pubblicati nella sezione Politiche" dal
   testo del modale, e aggiungi lo stesso bottone grande
   (`class="btn-primary"`, stile come quello del modale Energia &
   Ambiente) verso `policies/<slug>.html`, con la chiave i18n
   `policies_section.wg.<slug>_page_cta` in tutti e 5 i file JSON.
