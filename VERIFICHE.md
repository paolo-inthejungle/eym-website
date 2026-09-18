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
- **Voices from Europe è stato provato solo con dati finti** (3 autori e
  5 articoli inventati, rimossi prima del commit — vedi @NOTE.md e il
  messaggio di chiusura di questa sessione). Non è mai stato pubblicato o
  visto un articolo vero attraverso questo sistema.
- **Le traduzioni FR/ES/DE di tutti i testi nuovi di questa sessione**
  (organigramma, Voices from Europe, pagina Energia & Ambiente, mappa)
  **sono generate automaticamente, non riviste da madrelingua.** L'italiano
  è stato scritto con cura perché è la lingua che l'utente legge
  direttamente; francese, spagnolo e tedesco andrebbero fatti rileggere
  prima di considerarli definitivi.

## Verificato in locale (non in produzione)

- `node server.js` si avvia senza errori (verificato prima del push, per
  ciascun lavoro di questa sessione — vedi il messaggio di chiusura per i
  dettagli lavoro per lavoro).
- Le pagine toccate in ogni lavoro sono state aperte in locale con
  Chrome headless (screenshot e dump del DOM), non solo controllate che
  rispondessero HTTP 200: mappa (Repubblica Ceca e Regno Unito),
  organigramma (Consiglio Direttivo, Segreteria), tutte le viste di
  `voices/index.html` (indice completo, filtro autore, filtro tema,
  slug inesistente, indice vuoto, indice con JSON malformato), i due
  punti di accesso home con `VOICES_PUBLIC` a `true` e a `false`, le due
  sezioni Position Paper/Voices su `policies/energy-environment.html`, e
  il modale "Energia & Ambiente" in `index.html`.
- Non è stata verificata visivamente nessuna pagina in una risoluzione
  da telefono reale: Chrome headless su questa macchina non scende sotto
  una larghezza di rendering di 500px (limite dello strumento, non del
  sito), quindi la verifica "da telefono" di questa sessione si ferma a
  quella larghezza. Andrebbe riprovata su un telefono vero o un emulatore
  che scenda più in basso (es. 360–390px).
