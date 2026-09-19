# European Youth Movement — sito

Sito ufficiale del European Youth Movement (eym-europe.eu): homepage,
pagine dei gruppi tematici, area riservata per i membri, moduli di
iscrizione e "Voices from Europe", lo spazio per i contributi personali
degli iscritti.

## Stack

- Frontend: HTML/CSS/JS vanilla, nessun framework né build step.
- Backend: Express (`server.js`, route in `api/*.js`).
- Dati: Supabase (Postgres, Auth, Storage) e Brevo (newsletter, email transazionali).

## Avvio in locale

```
npm install
npm start
```

Il sito è raggiungibile su `http://localhost:3000`. Serve un file `.env`
con le credenziali (non incluso nel repository).

## Documentazione

Nella cartella `docs/`:
- [`docs/ARCHITETTURA.md`](docs/ARCHITETTURA.md) — struttura del codice, sezioni del sito, motore i18n
- [`docs/PROCEDURE.md`](docs/PROCEDURE.md) — operazioni manuali (organigramma, mappa, articoli Voices, ecc.)
- [`docs/NOTE.md`](docs/NOTE.md) — decisioni prese e questioni aperte
- [`docs/VERIFICHE.md`](docs/VERIFICHE.md) — cosa è stato verificato davvero e cosa no

`CLAUDE.md`, nella root, contiene le regole di lavoro su questo repository.

## Attenzione

**Non esiste un ambiente di staging.** Ogni push su `main` pubblica il
sito in produzione in pochi minuti (deploy automatico su Render).
