# VERIFICHE.md — cosa è stato provato davvero

Non esistono test automatici in questo repo: l'unica verifica è manuale,
nel browser, fatta da chi legge questo file. Questa pagina serve a non
confondere "il codice sembra corretto" con "è stato visto funzionare".

## Mai verificato

- **Il ripristino del database da backup non è mai stato eseguito.** Gli
  script in `supabase/` (`migration.sql`, `migration_v2.sql`) sono stati
  scritti per ricostruire lo schema da zero, ma non è mai stato provato
  un ripristino reale su un progetto Supabase vuoto.
- I due flussi di iscrizione (§ "I due flussi di iscrizione" in
  @ARCHITETTURA.md) non sono stati testati end-to-end con una vera email
  Brevo/Supabase in questo giro di lavori.
- Le query di `supabase/admin-queries.sql` non sono state eseguite contro
  il database di produzione durante questa sessione.
- L'upload di un documento reale in area utente (`area-utente.html`) con
  un utente che ha `can_upload=true` non è stato provato in questa
  sessione.

## Verificato in locale (non in produzione)

- `node server.js` si avvia senza errori (verificato prima del push, per
  ciascun lavoro di questa sessione — vedi il messaggio di chiusura per i
  dettagli lavoro per lavoro).
- Le pagine toccate in ogni lavoro sono state aperte e controllate che si
  carichino, sempre in locale.
