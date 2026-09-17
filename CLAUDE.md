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

## Regole di questo codice
- **i18n**: ogni testo di interfaccia visibile passa da
  `assets/js/i18n.js` + `assets/i18n/{en,it,fr,es,de}.json`. Una chiave
  aggiunta in un solo file è un bug — va aggiunta in tutti e 5.
- **Slug dei working group** (usati in URL, DB, JSON — non inventarne
  altri): `foreign-policy`, `defence-security`, `energy-environment`,
  `justice`, `education`, `healthcare`, `immigration-human-rights`.
- Le sigle paese nell'organigramma e altrove sono **emoji bandiera**
  scritte a mano nell'HTML — non sostituirle con testo o icone (vedi
  @NOTE.md per il limite noto su Windows).
- Segreti reali (chiavi API, service role key) non vanno mai in file
  versionati: solo placeholder, con nota di cosa serve.

## Mappa del progetto
Per la struttura del codice, le sezioni di `index.html`, i due flussi di
iscrizione, l'area riservata e il motore i18n: @ARCHITETTURA.md

Per le operazioni manuali (accessi Supabase, organigramma, mappa,
i18n, template email, pubblicazione articoli Voices): @PROCEDURE.md

Per le decisioni prese e le questioni aperte: @NOTE.md

Per cosa è stato verificato davvero (e cosa no) in produzione: @VERIFICHE.md
