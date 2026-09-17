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
