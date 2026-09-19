# CLAUDE.md — eym-europe.eu

## Cos'è
Sito del European Youth Movement (eym-europe.eu). Homepage a sezione unica
(`index.html`), pagine dei gruppi tematici (`policies/`), area riservata
(`area-utente.html`), form di iscrizione (`pages/`), backend Express
minimale (`server.js`, `api/`) su Supabase (auth + DB + storage) e Brevo
(mailing list + email transazionali). Nessun framework, nessun build step:
si edita l'HTML/CSS/JS direttamente e si fa il deploy così com'è.

## Stack
- Frontend: HTML/CSS/JS vanilla, nessun bundler.
- Backend: Express (`server.js`), route in `api/*.js`.
- Dati: Supabase (Postgres + Auth + Storage). Schema in `supabase/*.sql`.
- Email/CRM: Brevo (mailing list newsletter, invii transazionali).
- Hosting: Render, deploy automatico ad ogni push su `main`.

## Come si lavora
- **Non esiste staging.** Il sito è in produzione con utenti reali.
- **Push su `main` = pubblicazione live**, non un salvataggio. Il deploy su
  Render parte automaticamente e va online in pochi minuti.
- Nessun test automatico: ogni verifica è manuale, nel browser.
- Nessuna dipendenza npm nuova (framework, bundler, parser Markdown, set
  di icone, ecc.) senza autorizzazione esplicita.
- Ogni modifica allo schema del database va scritta come file SQL in
  `supabase/`, mai eseguita solo a mano nel dashboard Supabase.
- I commit si separano committando man mano, mentre si lavora. Non si
  ricostruisce una storia pulita alla fine ricopiando file da backup o
  copie di lavoro: il rischio è che il registro dei commit racconti un
  ordine diverso da quello realmente accaduto, e che una copia
  disallineata faccia sparire del lavoro senza che nessuno se ne accorga.

## Regole di questo codice
- **i18n**: ogni testo di interfaccia visibile passa da
  `assets/js/i18n.js` + `assets/i18n/{en,it,fr,es,de}.json`. Una chiave
  aggiunta in un solo file è un bug — va aggiunta in tutti e 5. Una
  chiave mancante non lascia il campo vuoto, lascia il testo inglese:
  i testi non tradotti sono invisibili a occhio, vanno cercati (vedi
  @docs/PROCEDURE.md).
- **Slug dei working group** (usati in URL, DB, JSON — non inventarne
  altri): `foreign-policy`, `defence-security`, `energy-environment`,
  `justice`, `education`, `healthcare`, `immigration-human-rights`.
- Le sigle paese nell'organigramma e altrove sono **emoji bandiera**
  scritte a mano nell'HTML — non sostituirle con testo o icone (vedi
  @docs/NOTE.md per il limite noto su Windows).
- Segreti reali (chiavi API, service role key) non vanno mai in file
  versionati: solo placeholder, con nota di cosa serve.
- Nei testi pubblici del sito non si usano incisi fra trattini lunghi
  né la costruzione "non è X, è Y". Fanno sembrare il testo generato da
  una macchina. Eccezione: i testi della pagina Energy & Environment,
  dove gli incisi sono voluti.

## Mappa del progetto
Per la struttura del codice, le sezioni di `index.html`, i due flussi di
iscrizione, l'area riservata e il motore i18n: @docs/ARCHITETTURA.md

Per le operazioni manuali (accessi Supabase, organigramma, mappa,
i18n, template email, pubblicazione articoli Voices): @docs/PROCEDURE.md

Per le decisioni prese e le questioni aperte: @docs/NOTE.md

Per cosa è stato verificato davvero (e cosa no) in produzione: @docs/VERIFICHE.md
