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
  @docs/ARCHITETTURA.md) non sono stati testati end-to-end con una vera email
  Brevo/Supabase in questo giro di lavori.
- Le query di `supabase/admin-queries.sql` non sono state eseguite contro
  il database di produzione durante questa sessione.
- L'upload di un documento reale in area utente (`area-utente.html`) con
  un utente che ha `can_upload=true` non è stato provato in questa
  sessione.
- **Voices from Europe è stato provato solo con dati finti** (3 autori e
  5 articoli inventati, rimossi prima del commit — vedi @docs/NOTE.md e il
  messaggio di chiusura di questa sessione). Non è mai stato pubblicato o
  visto un articolo vero attraverso questo sistema.
- **(2026-09-17) Le traduzioni FR/ES/DE di tutti i testi nuovi della
  sessione del 17 settembre** (organigramma, Voices from Europe, pagina
  Energia & Ambiente, mappa) **sono generate automaticamente, non
  riviste da madrelingua.** L'italiano è stato scritto con cura perché
  è la lingua che l'utente legge direttamente; francese, spagnolo e
  tedesco andrebbero fatti rileggere prima di considerarli definitivi.
- **(2026-09-18) Stesso avvertimento per i testi riscritti nel LAVORO 2
  di questa sessione** (rimozione di incisi fra trattini e costruzioni
  "non è X, è Y" in tutti e 5 i file i18n): le riscritture FR/ES/DE
  sono anch'esse automatiche, non riviste da madrelingua. In italiano e
  inglese il senso è stato controllato frase per frase; nelle altre tre
  lingue solo la forma (rimozione del trattino/dell'antitesi), non la
  naturalezza del risultato.
- **(2026-09-18) Stesso avvertimento per tutte le chiavi nuove aggiunte
  nella sessione del 18 settembre** (messaggi d'errore dei moduli,
  menu utente, link "Back to main site", titoli/segnaposto/intestazioni
  di signup.html e apply-coordinator.html): IT/EN scritti e controllati
  a mano, FR/ES/DE tradotti senza revisione di un madrelingua.

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
- **(2026-09-18) Il modulo di iscrizione (modale di login, tab "Sign
  Up") è stato aperto e controllato per davvero in tedesco e in
  spagnolo**, non solo letto nel codice: screenshot con Chrome headless
  forzato su `--lang=de-DE` e `--lang=es-ES`, confermando che i campi
  "Land"/"Telefon" e "País"/"Teléfono" (le tre chiavi aggiunte nel
  LAVORO 1) compaiono davvero tradotti. Controllata anche la pagina
  `pages/apply-coordinator.html` nelle stesse due lingue: il campo
  "Telefonnummer"/"Número de teléfono" funziona; trovato ma NON
  corretto in questa sessione (vedi @docs/NOTE.md) che il titolo della
  pagina, l'eyebrow "GET INVOLVED" e il testo sotto il campo Paese
  restano in inglese in ogni lingua.
- **(2026-09-18) Verificato con Chrome headless pilotato via CDP
  (protocollo nativo di Chrome, nessuna libreria nuova), forzato in
  tedesco (`--lang=de-DE`), non solo letto nel codice:**
  - Modale di login in `index.html`: compilato con credenziali
    sbagliate e inviato per davvero. Il bottone "Anmelden" resta
    "Anmelden" dopo l'errore (prima di questa sessione tornava
    "Log In" in inglese). Il messaggio d'errore mostrato
    ("Invalid login credentials") arriva da Supabase in inglese: non è
    stato tradotto, per istruzione esplicita.
  - Voce di menu utente e bottone Logout in `index.html`: mostrano
    "👤 Mitgliederbereich" e "↩ Logout".
  - Link di ritorno in fondo pagina: verificato aperto per davvero su
    `policies/justice.html` e su `voices/index.html`, mostra "Zurück
    zur Hauptseite →" in entrambi.
  - `pages/signup.html` e `pages/apply-coordinator.html` aperte per
    intero (screenshot a piena pagina): sopratitolo, titolo, paragrafo
    introduttivo, segnaposto dei campi, intestazioni dei menu a
    tendina e footer tutti in tedesco. Confermato lasciato intenzionalmente
    in inglese/non tradotto: indirizzo email, dominio
    "www.eym-europe.eu", numero di telefono d'esempio
    "+39 333 123 4567".
  - Stessa verifica ripetuta su `policies/justice.html`: pagina
    interamente in tedesco tranne il titolo `<h2>Position Paper</h2>`,
    senza alcun collegamento a i18n — segnalato come buco nuovo del
    censimento in @docs/NOTE.md, non corretto in questa sessione.
- **(2026-09-18) Non verificato**: il tag `<title>` del browser non è
  stato controllato in nessuna lingua, perché il LAVORO 4 di questa
  sessione è stato saltato (il motore i18n non è in grado di
  aggiornarlo — vedi @docs/NOTE.md).
- **(2026-09-18, sessione "Voices from Europe") Il tag `<title>` è
  stato controllato per davvero**, non solo letto nel codice: aperta una
  pagina, cambiata la lingua dal selettore SENZA ricaricare (chiamata
  diretta a `EYM.setLang()`), controllando che il testo nella linguetta
  del browser (`document.title`) cambiasse subito. Provato su
  `index.html`, `pages/signup.html`, `policies/justice.html` e
  `voices/index.html`, passando da inglese a italiano a tedesco sulla
  stessa pagina senza mai ricaricare.
- **(2026-09-18) Pubblicazione del primo articolo di Voices from Europe:
  il consenso di Esther Miguez Aparicio alla pubblicazione di foto,
  biografia e bandiera/nazionalità è stato ottenuto e conservato
  dall'utente prima di questa sessione**, come richiesto da
  @docs/PROCEDURE.md punto 9. **I contenuti fattuali dell'articolo (date,
  nomi, accordi, citazioni) non sono stati verificati da chi ha lavorato
  a questa sessione**: il testo è stato pubblicato così come consegnato,
  per istruzione esplicita, senza controllo di accuratezza giornalistica
  o fattuale.
- **(2026-09-18) L'articolo pubblicato è stato controllato per davvero
  nel browser** (screenshot, non solo lettura del codice): la scheda
  nell'indice `voices/index.html` (titolo, tema, lingua, data, estratto,
  autrice); la pagina filtrata `?author=esther-miguez-aparicio` (bio
  estesa a tre paragrafi separati, sempre visibile); la pagina filtrata
  `?theme=foreign-policy`; la pagina dell'articolo per intero (bio breve
  in alto, i due sottotitoli nel punto giusto, paragrafi separati); il
  collegamento da `policies/foreign-policy.html` fino all'articolo; la
  pagina a una larghezza di 1920px (colonna di lettura già limitata a
  720px, nessuna modifica necessaria) e a 500px (il limite minimo di
  rendering di Chrome headless su questa macchina, stesso limite già
  noto — non un vero telefono). I due punti di accesso a Voices in home
  con `VOICES_PUBLIC` a `true`: verificati sia in italiano sia in
  tedesco (`--lang=de-DE`), confermando che il link leggero in copertina
  non rompe il layout dell'header in tedesco (più lungo che in italiano)
  e che i riquadri "Position Papers" e "Voices from Europe" si
  distinguono a colpo d'occhio.
- **(2026-09-18) Foto dell'autrice non pubblicata, non verificabile.**
  Non essendoci un file immagine raggiungibile (vedi @docs/NOTE.md), non è
  stato eseguito né il ridimensionamento con `sharp` né una verifica
  visiva del ritaglio a 400×400.
- **(2026-09-19) Il link all'articolo, dopo la correzione del percorso
  doppio, è stato aperto per davvero da tre punti di partenza diversi**
  (letto l'indirizzo risolto nella barra, non solo il codice sorgente):
  dal link leggero in copertina della home (`hero-voices-link` →
  `voices/index.html`), dall'elenco completo degli articoli
  (`voices/index.html`), e dal riquadro "Voices from Europe" di
  `policies/foreign-policy.html` (→ `voices/index.html?theme=foreign-policy`).
  In tutti e tre i casi il link all'articolo risolve a
  `.../voices/variable-geometry-middle-powers.html` (una sola cartella
  `voices/`), e la pagina si apre con il titolo giusto.
- **(2026-09-19) La correzione bio/bioLong (pagina dell'autore) è stata
  verificata con due autori finti temporanei**: uno con solo `bio`, uno
  senza nessuno dei due campi. Entrambe le pagine si sono viste per
  davvero (screenshot), pulite e senza scritte tipo "undefined"; i due
  autori sono stati rimossi da `assets/data/voices.json` prima del
  commit e la loro assenza è stata confermata con una ricerca testuale
  nel file.
- **(2026-09-19) Le anteprime in home sono state verificate per davvero
  in tre stati**: con l'indice reale (un articolo, scheda singola
  centrata, non sembra un layout rotto), con `assets/data/voices.json`
  temporaneamente svuotato (`{"authors":[],"articles":[]}`: il blocco
  resta `display:none`, nessuno spazio bianco, nessun errore in
  console — poi il file è stato ripristinato e verificato di nuovo
  identico all'originale), e a una larghezza di 500px (il limite minimo
  di Chrome headless su questa macchina). **Non è stato provato un
  telefono vero su nessuna pagina di Voices from Europe** (indice,
  pagina autore, pagina articolo, anteprime in home): tutte le verifiche
  "da telefono" fatte finora, in questa sessione e nelle precedenti, si
  fermano al limite di 500px dello strumento.
- **(2026-09-19) La route dinamica di `server.js` per le anteprime degli
  autori è stata provata per davvero, con richieste HTTP reali al
  server avviato in locale, non solo leggendo il codice.** Servite e
  controllate (codice HTTP e valore reale dei tag `og:*`, `curl` sul
  server locale):
  - le 8 pagine di base: home, `pages/signup.html`,
    `pages/apply-coordinator.html`, `policies/foreign-policy.html`,
    `voices/index.html` senza parametri, `voices/index.html?author=
    esther-miguez-aparicio`, la pagina dell'articolo,
    `area-utente.html` — tutte 200, tutte con contenuto (byte scaricati
    controllati, non solo il codice di stato).
  - i sei casi limite del LAVORO 3: slug inesistente, parametro `author`
    vuoto e uno con caratteri di path-traversal/XSS (confermato anche
    che quella stringa non compare da nessuna parte nella risposta),
    autore senza `photo` (temporaneo, rimosso dopo il test), autore
    senza `bio` (temporaneo, rimosso dopo il test), `voices.json`
    assente/vuoto/JSON non valido (tre prove separate, file rinominato e
    poi ripristinato ogni volta), richiesta senza nessun parametro. In
    tutti e sei i casi: pagina servita, codice 200, anteprima
    predefinita (o il campo giusto quando presente, per i due casi con
    autore parziale).
  - il server è rimasto in esecuzione, senza riavvii né errori nel log,
    per tutta la sequenza dei test sopra (log del processo controllato
    alla fine, non solo assunto).
  - i dati reali prodotti per un articolo, per la pagina dell'autrice
    vera e per una pagina qualsiasi (la home, non toccata da questo
    lavoro) sono stati letti dalla risposta HTTP effettiva, non dedotti
    dal codice — vedi il messaggio di chiusura di questa sessione per i
    valori esatti.
  - **Non verificato**: come appare l'anteprima per davvero dentro
    WhatsApp, Telegram o LinkedIn (serve un dominio pubblico raggiungibile
    da quei servizi, non disponibile da qui — solo il server locale). Il
    formato dei tag è stato controllato contro le specifiche Open
    Graph/Twitter Card, non contro il rendering reale di una singola
    piattaforma.
- **(2026-09-19) Ancora non verificato, stessa ragione di sopra: come
  appare l'anteprima per davvero su WhatsApp, e come si legge l'articolo
  da un telefono vero.** Non ho accesso a WhatsApp né a un dispositivo
  fisico da questa sessione: solo al repository locale e a un server
  avviato in locale (`http://localhost:3000`), non raggiungibile da
  servizi esterni. Quello che è stato verificato per davvero in questa
  sessione, sul server locale: il formato e il contenuto reale dei tag
  `og:*`/`twitter:*` per home, articolo e pagina autrice (vedi sopra), e
  l'aspetto della pagina autrice a una larghezza di 500px in Chrome
  headless (il limite minimo di rendering di questa macchina — non un
  telefono vero, stesso limite già noto). Per la verifica reale su
  WhatsApp e su un telefono vero serve chi ha accesso a entrambi:
  incollare l'indirizzo pubblico in una chat privata e aprirlo da un
  dispositivo fisico.
