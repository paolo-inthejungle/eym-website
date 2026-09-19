# NOTE.md — decisioni prese e questioni aperte

Numerate in ordine cronologico. Non cancellare le voci superate: se una
decisione cambia, aggiungine una nuova che rimanda a quella vecchia.

1. **(2026-09-17) Rimosso codice morto: Netlify, SVG inutilizzato,
   dipendenza `cors`.** `netlify.toml` e `netlify/` non erano
   referenziati da nessun altro file (il sito gira solo su Render);
   `assets/images/europe-main-map.svg` (~730KB) non era referenziato da
   nessun HTML/CSS/JS; il pacchetto `cors` era in `package.json` ma mai
   importato in `server.js` o `api/*.js`. Tutti e tre rimossi nello
   stesso commit. Non toccato `assets/images/european-union-map.svg`
   (quella è la mappa in uso).

2. **(2026-09-17) `competenze-curriculum.md` non è mai stato committato.**
   `git log --all --oneline -- '*competenze*'` non restituisce nulla: il
   file esiste solo sul filesystem locale, è già in `.gitignore`. Nessuna
   azione necessaria — se fosse comparso nella cronologia, cancellarlo
   oggi non lo avrebbe tolto dai commit passati.

3. **Le sigle paese (IT, FI, GR, RO...) sono emoji bandiera.** Windows
   non dispone dei simboli delle bandiere e mostra le due lettere al
   posto del tricolore: è un limite del sistema operativo, non un bug
   del sito. Scelta consapevole, confermata a settembre 2026. Non
   "correggere" sostituendole con testo o immagini.

4. **Il nome del paese nel tooltip della mappa non passa da i18n.**
   Viene letto direttamente dal tag `<title>` dentro ogni tracciato di
   `assets/images/european-union-map.svg` (sempre in inglese). Non è un
   difetto da correggere in questo giro di lavori: è così che funziona
   oggi, ed è indipendente dalla lingua scelta sul sito.

5. **(2026-09-17) `MEMBER_COUNTRIES` userà il prefisso `gb` per il Regno
   Unito, con un effetto collaterale.** L'SVG della mappa rappresenta il
   Regno Unito come più tracciati distinti che condividono tutti il
   prefisso `gb-` (`gb-gbn` = Gran Bretagna, `gb-nir` = Irlanda del Nord,
   più le dipendenze della Corona `gb-jsy` Jersey, `gb-gsy` Guernsey,
   `gb-iom` Isola di Man, e `gb-sba` Akrotiri e Dhecelia). Il codice
   esistente ricava l'id-paese con `el.id.split('-')[0]`: aggiungendo
   `gb` a `MEMBER_COUNTRIES` per usare la stessa convenzione già in uso
   per gli altri paesi, **anche Jersey, Guernsey, Isola di Man e
   Akrotiri/Dhekelia risulteranno evidenziati** come se avessero membri
   EYM, il che non è corretto. Non ho inventato un'eccezione per questi
   casi (avrebbe significato scostarsi dalla convenzione richiesta).
   Questione aperta: va rivista una logica che scelga solo `gb-gbn` e
   `gb-nir`, oppure va accettato come limite noto.

6. **(2026-09-18) Separati "Position Paper" da "Voices from Europe" nelle
   7 pagine `policies/*.html`.** Prima esisteva un unico riquadro che
   mescolava documenti ufficiali del gruppo tematico e contributi
   personali dei singoli membri, disorientando chi voleva scrivere
   un'opinione personale (sembrava dover produrre un documento
   ufficiale). Ora sono due sezioni distinte, sorelle nello stile: la
   prima mantiene il meccanismo esistente di filtro/lista/stato-vuoto per
   i soli documenti ufficiali (tolto il filtro "Articoli", che non ha più
   senso qui); la seconda è un testo breve + link a
   `voices/index.html?theme=<slug>`. Nessun template condiviso tra le 7
   pagine: la modifica è stata applicata a mano, identica, su tutti e 7 i
   file.

7. **(2026-09-18) Voices from Europe legge da un file JSON
   (`assets/data/voices.json`), non dal database Supabase.** Pubblicare
   da database avrebbe richiesto una schermata di amministrazione che
   oggi non esiste — lo stesso limite per cui gli accessi `wg_access` si
   gestiscono con query SQL a mano (vedi @docs/PROCEDURE.md) invece che da
   un'interfaccia. Finché non nasce un pannello admin, il JSON versionato
   nel repo resta la scelta più semplice: chi pubblica un articolo edita
   due file e fa commit, senza bisogno di credenziali Supabase.

8. **(2026-09-18) I testi degli articoli di Voices from Europe non si
   traducono.** Ogni articolo resta nella lingua in cui l'autore lo ha
   scritto (indicata dal campo `"lang"`, mostrato come etichetta — non
   usato per filtrare o nascondere nulla). Motivo: sono contributi
   personali firmati, nelle parole di chi li scrive; tradurli
   automaticamente snaturerebbe la voce dell'autore, tradurli a mano non
   è sostenibile con volumi crescenti. Solo l'interfaccia del sito
   (etichette, pulsanti, messaggi) passa da i18n.

9. **(2026-09-18) DECISIONE: il riquadro "Position Papers" nella home
   parla solo di documenti ufficiali.** L'invito a contribuire ("Vuoi
   contribuire? Unisciti al Movimento") è stato tolto da questo blocco:
   quel ruolo appartiene a "Voices from Europe" (vedi voce 6 sopra),
   che è lo spazio pensato per i contributi personali. Il blocco
   "Position Papers" ora è uno stato informativo/vuoto, senza inviti.

10. **(2026-09-18) QUESTIONE CHIUSA: corrispondenza paesi/mappa
    verificata visivamente, funziona** — con un avvertimento per il
    futuro. Il codice in `index.html` ricava l'id-paese con
    `el.id.split('-')[0]`, cioè confronta solo l'INIZIO del codice del
    tracciato, non il codice esatto (vedi voce 5 sopra per il caso già
    trovato del Regno Unito). Oggi, in
    `assets/images/european-union-map.svg`, Francia, Portogallo, Paesi
    Bassi e Danimarca non hanno tracciati separati per i territori
    d'oltremare (nessun id tipo `fr-xxx`): sono un unico tracciato
    `fr`, `pt`, `nl`, `dk`. Ma se in futuro questo SVG viene sostituito
    con una versione che li include, o se qualcuno aggiunge quei
    tracciati, chi lo fa deve controllare A MANO quali id compaiono e
    cosa si accende aggiungendo il codice base a `MEMBER_COUNTRIES` —
    non è garantito che corrisponda solo al paese voluto.

11. **(2026-09-18) QUESTIONE APERTA: le 7 pagine `policies/*.html` sono
    file indipendenti, senza template condiviso.** Ogni modifica che
    riguarda tutte e 7 (come la separazione Position Paper/Voices della
    sessione precedente, o la riscrittura del 2026-09-18) va ripetuta a
    mano, identica, su ciascun file. Non esiste un meccanismo che lo
    faccia automaticamente: un domani, se le pagine crescono, vale la
    pena valutare un vero template — ma è un cambio di architettura,
    non una correzione, e va deciso esplicitamente.

12. **(2026-09-18) DIFETTO TROVATO E CORRETTO: tre etichette dei moduli
    erano richiamate nel codice senza esistere nei file i18n.**
    `auth.label_country` e `auth.label_phone` (modale di login, tab
    "Sign Up", campi Paese/Telefono) e `apply.phone` (pagina candidatura
    coordinatore, campo Numero di telefono) restavano in inglese in
    tutte le lingue, IT compreso. Corretto: le tre chiavi sono state
    aggiunte in tutti e 5 i file `assets/i18n/*.json`. Causa di fondo:
    il motore i18n (`assets/js/i18n.js`) non segnala le chiavi mancanti
    né in console né sulla pagina — lascia semplicemente il testo
    statico dell'HTML così com'è. Un'etichetta inglese in un modulo
    tedesco sembra una scelta, non un errore: per questo è rimasto
    invisibile. Vedi @docs/PROCEDURE.md per il controllo ripetibile.

13. **(2026-09-18) QUESTIONE APERTA: altri testi statici in
    `pages/apply-coordinator.html` restano in inglese in ogni lingua.**
    Trovato verificando il LAVORO 1 sopra, non ancora corretto (segnalo
    senza risolvere, come da istruzioni). Il titolo "Apply as National
    Coordinator", l'eyebrow "GET INVOLVED" e il testo sotto il campo
    Paese ("If your country already has a coordinator...") non hanno
    `data-i18n` nell'HTML: non è un caso di chiave mancante come la
    voce 12 sopra, sono proprio senza l'attributo. Andrebbero cercati
    altri casi simili nel resto del sito.

14. **(2026-09-18) I titoli di pagina nel formato "Justice — EYM
    Policies" sono una convenzione tecnica, non un inciso.** Il
    trattino lì separa il nome della pagina dal nome del sito (schema
    comune sul web), non isola una parte di una frase. Non vanno
    trattati come gli incisi da rimuovere (regola in @CLAUDE.md, "Regole
    di questo codice") e non vanno "corretti" togliendo il trattino.

15. **(2026-09-18) CENSIMENTO: testi visibili senza alcun collegamento
    al motore i18n (non chiavi mancanti — nessun `data-i18n` proprio).**
    Censiti 16 file HTML (13 pagine/modelli del sito + 3 modelli email
    Supabase). Circa 164 testi scollegati sul sito (72 su pagine
    pubbliche, 53 nella sola pagina `area-utente.html` — che non include
    affatto `assets/js/i18n.js` ed è quindi 100% scollegata — 7 nel
    modello `voices/_template.html`, non raggiungibile), più altri ~32
    testi nei 3 modelli email (struttura diversa: sono renderizzati da
    Supabase, non dal JS del sito, quindi non possono passare dal motore
    i18n così com'è) e ~20 messaggi di errore restituiti dal backend
    (`api/*.js`), sempre in inglese, mai passati dal frontend. Elenco
    completo consegnato nella chat di questa sessione (censimento del
    18 settembre 2026), non riportato qui per intero.

    Perché il controllo in @docs/PROCEDURE.md (sezione i18n, punto 5) non
    trova questi casi: quel controllo cerca `data-i18n="chiave"` nel
    codice e verifica che la chiave esista in `en.json` — funziona solo
    se l'ATTRIBUTO è presente ma la CHIAVE manca. Qui il problema è
    all'origine: l'attributo stesso non è mai stato scritto, quindi non
    c'è nessun richiamo da trovare. Un controllo diverso servirebbe a
    intercettarli (es. cercare testo visibile senza `data-i18n` nelle
    vicinanze), ma non è stato scritto in questa sessione: si decide
    prima cosa tradurre, poi si scrive la procedura su quel lavoro
    davvero fatto.

16. **(2026-09-18) Corrette le fasi 1 e 2 del censimento del 17-18
    settembre: messaggi d'errore dei moduli pubblici, menu utente, link
    "Back to main site", titoli e testi introduttivi di signup.html e
    apply-coordinator.html.** In ordine di frustrazione dell'utente, non
    di conteggio:
    - Modale di login/iscrizione in `index.html`: due messaggi di
      validazione ("Please select your country." / "Phone number is
      required.") collegati a i18n con le nuove chiavi
      `auth.err_country` / `auth.err_phone`; i tre bottoni del modale
      (Log In / Create Account / Send Reset Link) che perdevano la
      traduzione dopo ogni tentativo, riportati alle chiavi già
      esistenti `auth.btn_login` / `auth.btn_signup` / `auth.btn_forgot`
      invece di un testo inglese fisso.
    - `pages/signup.html` e `pages/apply-coordinator.html`: messaggi di
      validazione e di stato (campi obbligatori, email duplicata,
      errore generico, errore di connessione) collegati a nuove chiavi
      `signup.err_*` / `apply.err_*`. Il messaggio che arriva dal
      server (`data.error`, da `api/signup.js` e
      `api/apply-coordinator.js`) resta in inglese: non è stato
      toccato, per istruzione esplicita.
    - `index.html`: voce di menu "👤 Area Utente" (era in italiano
      fisso) e bottone "↩ Logout" collegati a `nav.member_area` /
      `nav.logout`.
    - Link "Back to main site →", scollegato in tutti e nove i file che
      lo usano (le 7 pagine `policies/*.html`, `voices/index.html`,
      `voices/_template.html`), unificato sotto una sola chiave nuova
      `footer.back_to_site`. Prima di toccare i due file `voices/`, si è
      verificato che caricassero già `assets/js/i18n.js`: lo caricavano,
      nessuna aggiunta di script necessaria.
    - Sopratitolo, titolo, paragrafo introduttivo, segnaposto dei campi
      e intestazioni dei gruppi nei menu a tendina di `signup.html` e
      `apply-coordinator.html`, con nuove chiavi (`signup.eyebrow`,
      `signup.hero_title`, `apply.eyebrow`, `apply.hero_lead`,
      `country_groups.*` e altre). Il titolo di `apply-coordinator.html`
      riusa la chiave già esistente `apply.form_title`, identica nel
      contenuto: nessuna chiave nuova creata per quel caso. Sui
      segnaposto con nomi propri e numeri di telefono ("e.g. Anna
      Müller", "+39 333 123 4567") è stata tradotta solo la parte
      "e.g."/"z. B."/ecc., non il nome o il numero.
    - **Aggiunto un piccolo meccanismo nuovo a `assets/js/i18n.js`**:
      l'attributo `data-i18n-label`, che traduce l'attributo `label` di
      un elemento (serviva per le intestazioni `<optgroup>` dei menu a
      tendina, che il motore non sapeva toccare). Stessa logica già
      esistente per `data-i18n-placeholder`, nessuna libreria nuova.
    - I NOMI DEI PAESI nei tre elenchi a tendina duplicati **non sono
      stati toccati**: restano fuori sessione finché i tre elenchi non
      vengono unificati (vedi voce 13 sopra).

17. **(2026-09-18) LAVORO 4 di questa sessione (traduzione dei tag
    `<title>`) saltato per una capacità mancante, non per scelta.** Il
    motore i18n (`assets/js/i18n.js`) non aggiorna mai `document.title`:
    né al caricamento, né al cambio lingua — verificato leggendo il
    file (nessuna occorrenza di `document.title` o di `.title =`) e
    trovando che le chiavi `signup.page_title` e `apply.page_title`,
    già presenti in tutti e 5 i file JSON da sessioni precedenti, non
    sono richiamate da nessuna parte del codice. Tradurre il testo
    statico dentro i tag `<title>` senza questa capacità avrebbe solo
    sostituito un inglese fisso con un'altra lingua fissa, non reso il
    titolo multilingua. Per istruzione esplicita non è stato aggiunto
    da sé questo meccanismo: il lavoro resta da fare, richiede una
    decisione su come e se estendere il motore i18n.

18. **(2026-09-18) Esito del LAVORO 5 (verifica incrociata reale in
    tedesco su `signup.html`, `apply-coordinator.html` e
    `policies/justice.html`): nessun difetto da correggere nelle due
    pagine dei moduli**, tutto il testo visibile risultava già tradotto
    o correttamente escluso (nomi propri, email, URL del dominio,
    numero di telefono d'esempio). **Trovato un buco nuovo del
    censimento**, non richiesto da questa sessione e quindi non
    corretto: il titolo `<h2>Position Paper</h2>` sopra il riquadro dei
    documenti ufficiali, identico e privo di qualunque `data-i18n` in
    tutte e 7 le pagine `policies/*.html` (non solo in Justice — stesso
    controllo ripetuto sulle altre sei). Nessun commit per questo
    lavoro: non c'era nulla da correggere nel suo perimetro.

19. **(2026-09-18) "Position Papers" è un termine tecnico invariato in
    tutte le lingue, come "Voices from Europe".** Prima di questa
    sessione compariva in modi diversi: al plurale in home, al singolare
    "Position Paper" nelle 7 pagine `policies/*.html`, e tradotto
    (Prises de position, Documentos de posición, Positionspapiere) in
    più chiavi dei file i18n. Corretti 9 chiavi i18n (in tutte le lingue
    dove serviva), i 7 titoli `<h2>` delle pagine policies, i relativi
    fallback HTML statici in `index.html` e nelle 7 pagine policies, un
    commento in `policies/policies.js` e una riga nel modello email
    `supabase/emails/invite-user.html`. Sui contesti dove il termine
    compare accanto a un determinativo che in quella lingua vuole il
    singolare (nessun/aucun/ningún/kein), è rimasto "Position Paper" al
    singolare invece di forzare il plurale: forzare il plurale avrebbe
    prodotto frasi agrammaticali ("nessun Position Papers"). Non è
    un'eccezione al principio del termine invariato — resta comunque
    inglese e non tradotto — riguarda solo il numero grammaticale.

20. **(2026-09-18) Il tag `<title>` ora si aggiorna davvero, sia al
    caricamento che al cambio lingua.** Non è servito un meccanismo
    nuovo: `data-i18n="chiave"` messo direttamente sul tag `<title>`
    viene già trovato e aggiornato dal motore i18n esistente, perché
    `querySelectorAll('[data-i18n]')` cerca in tutto il documento,
    `<head>` compreso, e scrivere il `textContent` di un `<title>` già
    nel DOM aggiorna la linguetta del browser (comportamento nativo,
    non codice scritto apposta). Collegati i tag `<title>` di
    `index.html`, `pages/signup.html`, `pages/apply-coordinator.html`,
    le 7 pagine `policies/*.html` e `voices/index.html` (non
    `voices/_template.html`, modello con segnaposto). Riusate le chiavi
    `signup.page_title` e `apply.page_title`, già presenti ma mai
    richiamate da una sessione precedente — **con una correzione**: le
    traduzioni IT/FR/ES/DE esistenti traducevano anche "European Youth
    Movement" (es. "Movimento Giovanile Europeo"), contro la regola di
    questa sessione che vuole quel nome invariato in ogni lingua.
    Corretta la seconda metà di quelle due chiavi in tutte e 4 le
    lingue, lasciata invariata la prima metà (già tradotta
    correttamente). Le altre 9 chiavi dei titoli di pagina sono nuove,
    in un namespace `page_titles` a sé.

21. **(2026-09-18) Pubblicato il primo articolo di Voices from Europe e
    acceso `VOICES_PUBLIC`.** Autrice Esther Miguez Aparicio, articolo
    "If you are not at the table, you are on the menu" (tema Foreign
    Policy). Aggiunto il campo facoltativo `bioLong` (array di paragrafi)
    al modello dati degli autori — vedi @docs/ARCHITETTURA.md — con relativo
    supporto in `voices/voices.js` e un piccolo aggiustamento di stile in
    `voices/voices.css` per ospitarlo. Tre cose segnalate e NON corrette
    di mia iniziativa, come da istruzione:
    - Il testo consegnato per `bioLong` conteneva tre paragrafi, non
      quattro come annunciato nel prompt della sessione. Pubblicati i
      tre paragrafi così come ricevuti, senza inventarne un quarto né
      unire gli esistenti per far tornare il conto.
    - Il testo dell'articolo conteneva due sottotitoli (tre sezioni:
      una senza titolo più due titolate), non tre come annunciato nel
      prompt. Pubblicato così come ricevuto. L'utente ha confermato in
      seguito che il conteggio dichiarato nel prompt era un proprio
      errore.
    - **La foto dell'autrice non è stata pubblicata**: l'immagine
      allegata alla chat non corrisponde a nessun file raggiungibile dal
      filesystem (cercato in `%TEMP%`, Desktop, Downloads, Pictures e
      nelle cartelle di lavoro di questa sessione) e non ho un
      meccanismo per salvare su disco un'immagine incollata in
      conversazione: senza un file non è possibile eseguire `sharp`.
      L'autrice è stata pubblicata senza `photo` (compare l'icona 👤).
      Se in futuro arriva il file vero, va ridimensionato e collegato
      seguendo @docs/PROCEDURE.md punto 7.1.

22. **(2026-09-19) I cinque file di documentazione sono stati riordinati:
    quattro dentro `docs/`, uno resta in root.** Censiti tutti i file
    `.md` del repository (esclusi `node_modules`): risultano essere
    esattamente questi cinque, nessun altro — nessun file `.md` vecchio
    o abbandonato da sessioni precedenti, nessun file appartenente a una
    libreria o a uno strumento, nessun `README.md` preesistente. Di
    conseguenza **non è stato creato `docs/archivio/`**: non c'era nulla
    da mettere in quarantena, perché non è stato trovato niente da
    classificare come superato. Se in futuro un file di documentazione
    smette di essere aggiornato, va spostato lì (non cancellato) e
    segnalato in questa pagina.

    Spostati con `git mv` (storia preservata) dentro `docs/`:
    `ARCHITETTURA.md`, `PROCEDURE.md`, `NOTE.md`, `VERIFICHE.md`.

    **`CLAUDE.md` resta nella root e non va mai spostato**: è l'unico
    file che Claude Code legge automaticamente all'avvio di una
    sessione, e lo fa solo se lo trova lì. Spostarlo in `docs/`
    significherebbe che tutte le regole che contiene smettono di essere
    applicate — senza nessun errore visibile: nessun avviso, nessuna
    pagina rotta, solo un assistente che non conosce più le regole del
    progetto finché qualcuno non se ne accorge.

    Aggiornati tutti i riferimenti ai quattro file spostati, ovunque nel
    repository: dentro gli altri file di documentazione (si citano
    spesso fra loro), dentro `CLAUDE.md` (i richiami `@…md`, che
    determinano cosa viene caricato automaticamente a inizio sessione)
    e un commento in `voices/_template.html`. Verificato con una ricerca
    nell'intero repository: dopo la correzione, non resta nessuna
    menzione dei quattro nomi di file priva del prefisso `docs/`, a
    parte le intestazioni `# ARCHITETTURA.md`, `# PROCEDURE.md` ecc. in
    cima a ciascun file — quelle non sono riferimenti ad altrove, sono
    il titolo del file stesso: restano corrette così, il file si chiama
    ancora esattamente così, solo in una cartella diversa.

    Creato anche un `README.md` nella root (non esisteva prima), con
    una descrizione breve del progetto e i collegamenti a `docs/`.

23. **(2026-09-19) Tre difetti trovati aprendo il sito dopo la
    pubblicazione del primo articolo di Voices from Europe, tutti e tre
    corretti nella stessa sessione.**

    - **L'articolo non si apriva.** `assets/data/voices.json` aveva
      `"file": "voices/variable-geometry-middle-powers.html"` (percorso
      completo). `voices/index.html`, che sta già dentro `voices/`, usa
      quel valore così com'è per costruire il link: il risultato era
      `voices/voices/variable-geometry-middle-powers.html`, una pagina
      che non esiste. Corretto togliendo `voices/` dal valore nel JSON
      (ora è solo il nome del file) invece di modificare il codice che
      lo legge: rende il campo `file` inequivocabile — è sempre "il nome
      del file dentro voices/", mai un percorso — e mette la
      responsabilità di anteporre `voices/` o `../` su chi consuma il
      dato dalla propria posizione, non su chi lo scrive. Vedi
      @docs/ARCHITETTURA.md per il dettaglio tecnico e @docs/PROCEDURE.md
      per l'esempio giusto/sbagliato da seguire per il prossimo
      articolo.
    - **La pagina dell'autrice mostrava solo metà della biografia.**
      `bio` e `bioLong` erano trattati come alternativi (se c'era
      `bioLong` il paragrafo di `bio` spariva), ma non lo sono: `bio` è
      il primo paragrafo, `bioLong` il seguito. Corretto in
      `voices/voices.js`: ora la pagina dell'autore mostra sempre `bio`
      per prima, poi `bioLong` se presente. La pagina del singolo
      articolo non è stata toccata: mostrava e mostra solo `bio`, mai
      `bioLong`, per scelta di design (bio breve in cima all'articolo,
      biografia completa solo nella pagina dedicata all'autore).
    - **Il riquadro "Voices from Europe" in home non mostrava
      contenuti.** Aggiunte le anteprime degli ultimi 3 articoli sotto
      il riquadro esistente, lette dallo stesso `voices.json` (nessun
      dato duplicato nell'HTML). Comportamento verificato per davvero,
      non solo letto nel codice: con l'indice vuoto il blocco resta
      esattamente com'era prima (nessuno spazio bianco, nessun
      segnaposto); con un solo articolo (il caso reale di oggi) la
      singola scheda resta centrata e non sembra un errore di layout.

24. **(2026-09-19) DECISIONE: `bio` e `bioLong` non sono alternativi, ma
    una biografia continua.** `bio` è sempre il primo paragrafo,
    mostrato ovunque compaia il nome dell'autore con del testo
    biografico (oggi: in cima a ogni pagina articolo). `bioLong` è il
    seguito, mostrato SOLO nella pagina dedicata all'autore
    (`voices/index.html?author=<slug>`), sempre dopo `bio`, mai al posto
    suo. Un autore può avere solo `bio` (biografia breve ovunque), non
    ha senso avere solo `bioLong` senza `bio` (biografia che salterebbe
    il primo paragrafo proprio dove serve di più, in cima all'articolo).

25. **(2026-09-19) DECISIONE: le anteprime social per gli autori si
    generano dal server, non con una pagina statica per autore.**
    Aggiunte anteprime WhatsApp/Telegram/LinkedIn per gli articoli di
    Voices from Europe (dati scritti a mano nel `<head>` di ciascun
    articolo, vedi @docs/PROCEDURE.md) e per l'autrice pubblicata finora.
    Per gli articoli è bastato scrivere i tag `og:*`/`twitter:*`
    direttamente nel file HTML, perché ogni articolo È già un file HTML
    a sé. La pagina autore invece è UNA SOLA
    (`voices/index.html?author=<slug>`) che cambia contenuto via
    JavaScript in base al parametro: i crawler dei social non eseguono
    JavaScript, quindi senza intervento ogni autore condiviso avrebbe
    mostrato la stessa anteprima generica.

    Scartata l'alternativa di generare un file HTML statico per autore
    (sul modello degli articoli): avrebbe richiesto un passo manuale in
    più a ogni autore nuovo (facile da dimenticare, a differenza del
    campo `bio`/`photo` in `voices.json` che serve comunque). Scelto
    invece di far leggere `assets/data/voices.json` al server
    (`server.js`) e sostituire i tag dell'anteprima al volo, così lo
    stesso identico posto (l'indice) alimenta sia il sito che l'anteprima,
    senza un secondo posto da tenere aggiornato.

    **Il rischio è diverso da qualunque altro cambiamento fatto finora
    su questo sito.** Fino al 2026-09-19, `server.js` serviva solo file
    statici: un errore in un lavoro precedente produceva al massimo una
    pagina sbagliata, mai un sito che smette di rispondere — non c'era
    codice lato server capace di far cadere l'intero processo Node per
    colpa di un singolo autore o di un JSON malformato. Da oggi c'è: se
    la funzione che genera l'anteprima lanciasse un'eccezione non presa,
    bloccherebbe l'intero sito, non solo la pagina interessata, per
    tutti gli utenti registrati, finché qualcuno non se ne accorge (non
    esiste staging). Per questo l'intera funzione è avvolta in un
    `try/catch` che su qualunque errore fa proseguire la richiesta come
    se non fosse successo nulla (vedi @docs/ARCHITETTURA.md per il
    dettaglio, @docs/VERIFICHE.md per i casi provati davvero prima del
    push).

26. **(2026-09-19) L'indirizzo ufficiale del sito è `eym-europe.eu`,
    SENZA `www.` davanti.** Il sito reindirizza comunque chi digita
    `www.eym-europe.eu`, quindi finora nessuno se n'era accorto: i due
    indirizzi FUNZIONANO entrambi nel browser, ma non sono la stessa
    cosa per chi non è un browser. I social (WhatsApp, Telegram,
    LinkedIn) mettono in cache l'anteprima separatamente per ciascun
    indirizzo, e Google tratta le due forme come pagine diverse ai fini
    del posizionamento, dividendo fra loro l'autorità che altrimenti
    andrebbe a una sola. Le anteprime social scritte per gli articoli di
    Voices from Europe nella sessione precedente usavano per errore la
    forma con `www.`: corrette in tutto il repository (9 file, 15
    occorrenze — dettaglio nel messaggio di chiusura di questa sessione).
    **Chi scrive un indirizzo pubblico completo del sito, da qui in
    avanti, usa sempre `https://eym-europe.eu/…`, mai `www.`.** In
    `server.js`, l'indirizzo è ora costruito da un'unica costante
    (`SITE_URL`) invece di essere scritto a mano in tre punti diversi.

27. **(2026-09-19) DECISIONE: il Movimento passa da Telegram a
    WhatsApp.** Una sola community generale esiste ed è attiva oggi
    (`https://chat.whatsapp.com/FAyQhmk7g9P3eAD9KSWB3m`); le sette
    community per gruppo tematico non esistono ancora. Telegram non
    viene cancellato dal codice — viene spento con l'interruttore
    `TELEGRAM_ENABLED` (vedi @docs/PROCEDURE.md punto 11), così può
    essere riacceso in futuro senza riscrivere nulla se dovesse
    ricomparire un uso reale. Stesso principio per i sette bottoni
    WhatsApp di gruppo: scritti fin da ora con indirizzi segnaposto
    (`PLACEHOLDER-<slug>`) e tenuti spenti (`WHATSAPP_GROUPS_ENABLED =
    false`) finché non esistono davvero, invece di aggiungerli in un
    secondo momento quando serviranno.

28. **(2026-09-19) QUESTIONE CHIUSA: il bottone WhatsApp nella barra di
    navigazione in alto è stato provato e tolto, non dimenticato.**
    Richiesto per completare la serie Instagram/LinkedIn nell'header,
    è stato scritto, poi verificato con Chrome headless pilotato via
    CDP a più larghezze di finestra, in tedesco (le parole più lunghe
    fra le 5 lingue del sito) per istruzione esplicita di chi ha dato
    il lavoro: "se non ci sta, non forzarlo, fermati e dimmi cosa hai
    trovato". Risultato della prova: a piena larghezza desktop
    (≥1024px) e a larghezza telefono (≤768px, dove la barra passa già
    in modalità solo-icone) il terzo bottone sta comodamente. Nella
    fascia intermedia (circa 800-928px — una finestra affiancata a
    metà schermo su un monitor normale, non uno scenario raro) la
    pagina comincia a scorrere orizzontalmente: un difetto già
    presente in tedesco anche solo con i due bottoni esistenti (i
    link della barra vanno già a capo su due righe sotto quella
    larghezza, comportamento voluto — `nav ul` ha sempre avuto
    `flex-wrap:wrap`), ma il terzo bottone lo aggrava, spostando la
    soglia di rottura da circa 800px a circa 928px. Per istruzione
    esplicita non è stato forzato: il bottone è stato tolto
    dall'header (restano solo Instagram e LinkedIn, come prima), e
    WhatsApp è stato aggiunto invece nel piè di pagina e nella sezione
    News, dove questo problema non esiste (sono elenchi verticali, non
    una riga che deve stare tutta su una larghezza fissa). Nessun
    ridisegno della barra di navigazione è stato tentato: sarebbe un
    cambio di architettura (es. abbassare la soglia della modalità
    solo-icone, o permettere il wrap anche all'header-inner), non una
    correzione, e va deciso esplicitamente. Screenshot e misure exact
    nel messaggio di chiusura di questa sessione.

29. **(2026-09-19) TROVATO MA NON CORRETTO: il testo introduttivo della
    sezione Politiche invita ancora a "unirsi alla conversazione su
    Telegram", con `TELEGRAM_ENABLED` spento.** Chiave
    `policies_section.lead`, tutte e 5 le lingue (in italiano: "Unisciti
    alla conversazione su Telegram e leggi le posizioni sviluppate dai
    nostri membri."). Con Telegram spento e WhatsApp di gruppo ancora
    spento (nessuna community di gruppo esiste ancora — voce 27 sopra),
    questa frase oggi non descrive nessun bottone realmente visibile
    sulle sette card. Trovato mentre si verificava che nessun link
    Telegram fosse visibile (lavoro di verifica di questa sessione),
    non mentre si lavorava su quel testo: per istruzione permanente
    (un problema trovato mentre se ne risolve un altro si segnala, non
    si corregge di propria iniziativa) non è stato toccato. Andrà
    aggiornato quando si deciderà cosa dire lì — probabilmente qualcosa
    di più neutro finché nessuna delle due piattaforme ha un bottone
    visibile su tutti i gruppi, o un riferimento a WhatsApp quando le
    community di gruppo esisteranno.

30. **(2026-09-19) CORRETTO: la barra di navigazione in alto scorreva
    orizzontalmente fra 769 e 1024px, un difetto che esisteva PRIMA
    dell'aggiunta del terzo pulsante (voce 28 sopra), non causato da
    essa.** Misurando con Chrome headless via CDP (vedi @docs/VERIFICHE.md
    per la tabella completa), con i soli due pulsanti Instagram/LinkedIn
    già presenti, la barra sforava la larghezza della finestra fra 769 e
    804px in tedesco (fra 769 e 896px in italiano) perché `.header-inner`
    non aveva `flex-wrap` fuori dal breakpoint mobile a 768px: sopra
    quella soglia il layout desktop (una sola riga) non aveva più spazio
    per restringersi e la pagina scorreva lateralmente, invece di andare
    a capo. La soglia che fa passare la barra alla modalità "controlli
    sopra, menu sotto" (già esistente, pensata per i telefoni) è stata
    spostata da 768px a 1024px: sotto 1024px la barra usa sempre quella
    modalità, sopra resta identica a prima (verificato confrontando
    screenshot prima/dopo a 1280 e 1920px). Le regole del piè di pagina
    che condividevano lo stesso blocco `@media (max-width: 768px)` sono
    state separate in un blocco a sé, rimasto a 768px: il piè di pagina
    non è stato toccato.

    **Perché 1024px e non un valore più stretto**: ogni pulsante fisso da
    100px aggiunto alla barra (con il suo spazio, `gap: 1.5rem`) sposta in
    avanti di 124px la larghezza minima sotto la quale la barra desktop
    sfora — misurato aggiungendo pulsanti finti via JavaScript, senza
    toccare il file, prima di decidere la soglia: 804px con 2 pulsanti,
    928px con 3 (il caso di oggi, dopo aver aggiunto WhatsApp), 1052px
    con 4, 1176px con 5. 1024px copre il caso a 3 pulsanti con un margine
    di 96px, restando un valore riconoscibile (uguale al breakpoint
    "tablet" usato da molti framework) invece di un numero scelto solo
    per far tornare i conti di oggi. Non è una soglia che si adatta da
    sola: se in futuro si aggiunge un QUARTO pulsante fisso alla barra
    (oltre a Instagram, LinkedIn, WhatsApp), va rifatta questa stessa
    misurazione in tedesco e la soglia va eventualmente spostata più in
    alto, con lo stesso metodo.

    **DECISIONE: le sette schede dei gruppi tematici in `#policies`
    restano senza nessun collegamento a chat o community finché le sette
    community WhatsApp non esisteranno davvero.** Non è stato aggiunto il
    link della community generale al loro posto: il bottone WhatsApp
    generale vive solo nell'header, nel piè di pagina e nella sezione
    News (vedi @docs/ARCHITETTURA.md). Il codice dei sette bottoni Telegram
    per gruppo resta esattamente dov'era, spento da `TELEGRAM_ENABLED`
    (@docs/PROCEDURE.md, punto 11): nessuna riga cancellata, solo
    verificato che restasse invisibile.

    **CORRETTO: la frase sopra le sette schede invitava a "unirsi alla
    conversazione su Telegram" (voce 29 sopra) con Telegram spento.**
    Tolta solo la frase sulla conversazione, in tutte e 5 le lingue
    (chiave `policies_section.lead`): resta la frase che descrive cosa il
    gruppo di lavoro fa e l'invito a leggere le posizioni dei membri, che
    è vero oggi indipendentemente dagli interruttori social. Cercato nel
    resto del sito (home, le 7 pagine `policies/*.html`, i 7 modali dei
    gruppi tematici, `pages/signup.html`, `pages/apply-coordinator.html`)
    altre frasi che invitassero a un canale o una community: trovate solo
    menzioni generiche della parola "conversazione"/"community" che non
    promettono un canale specifico (es. `policies_page.ee_page_involved_text`
    in Energia & Ambiente — "si parte in piccolo, un tema, una
    conversazione, un contributo alla volta" — è una metafora sul
    crescere del progetto, non un invito a scrivere da qualche parte).
    Nessuna di queste è stata toccata.
