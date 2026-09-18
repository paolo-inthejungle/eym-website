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
   gestiscono con query SQL a mano (vedi @PROCEDURE.md) invece che da
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
    invisibile. Vedi @PROCEDURE.md per il controllo ripetibile.

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

    Perché il controllo in @PROCEDURE.md (sezione i18n, punto 5) non
    trova questi casi: quel controllo cerca `data-i18n="chiave"` nel
    codice e verifica che la chiave esista in `en.json` — funziona solo
    se l'ATTRIBUTO è presente ma la CHIAVE manca. Qui il problema è
    all'origine: l'attributo stesso non è mai stato scritto, quindi non
    c'è nessun richiamo da trovare. Un controllo diverso servirebbe a
    intercettarli (es. cercare testo visibile senza `data-i18n` nelle
    vicinanze), ma non è stato scritto in questa sessione: si decide
    prima cosa tradurre, poi si scrive la procedura su quel lavoro
    davvero fatto.
