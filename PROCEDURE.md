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
@ARCHITETTURA.md): la lista statica dentro `#movement` e il modale
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

## 5. Caricare i template email in Supabase Auth

Dashboard Supabase → **Authentication → Email Templates**. Ogni tipo di
email (Confirm signup, Invite user, Magic Link, Change Email Address,
Reset Password) ha un template modificabile separatamente — sono quelli
usati dai due flussi di iscrizione descritti in @ARCHITETTURA.md
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
costante **`VOICES_PUBLIC`** (oggi intorno alla **riga 2897**, dentro
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

## Come ridimensionare una foto autore a 400×400 (Voices from Europe)

Il progetto ha `sharp` tra le `devDependencies`. Da terminale, nella
root del repo:

```
node -e "require('sharp')('input.jpg').resize(400,400,{fit:'cover'}).toFile('assets/images/authors/nome-cognome.jpg')"
```

Sostituisci `input.jpg` con il file originale e `nome-cognome` con lo
slug dell'autore in `assets/data/voices.json`.
