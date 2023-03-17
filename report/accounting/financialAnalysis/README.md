

## FINANCIAL ANALYSIS, UPDATES LOG (since march 2023)

### 15.03.2023

#### Modifiche

- Modifica il campo per la scelta dei colori impostando il campo di tipo "colore", adesso l'utente può visualizzare una tabella con i colori da scegliere.
- il campo "Include control sums" diventa "Include always contro sums", questo perchè le somme di controllo vengono mostrate anche quando non ci sono errori
- L'acronimo "totp" (totale passivi) diventa "totle" (total liabilities and equity).
- Risolve bug con posizionamento del logo e dell'intestazione.
- Risolve bug nel bilancio con le immobilizzazioni non tangibili che non venivano calcolate correttamente.
- Risolve bug con i tag #revalutation e #devaluation, il controllo sui tag non veniva effetuato correttamente, ed in alcuni casi venivano prese in considerazione alcune registrazioni non necessarie.
- Modifica stili nel report, più precisamente:
  * Sposta analisi del cashflow appena dopo il Bilancio ed il CE
  * Applica lo stesso stile a tutti gli elementi di una riga.
  * Toglie lo stile colorato dalle righe degli aggiustamenti con attivi e capitale di terzi dal cashflow
- Rimuove i grafici, la libreria utilizzata è incompatibile con il Qt6, al suo posto si può usare la libreria QtCharts, attualmente però è stato deciso di aspettare per la transazione.
- Aggiusta alcuni problemi con il campo data, se l'utente non cliccava all'interno del campo con il mouse, il campo rimaneva vuoto e i dati nel report uscivano sbagliati.
- Modifica l'analisi Z-Score. più precisamente:
  * Corregge la formula
  * Modifica la tabella esistente
  * Aggiunge una nuova tabella con l'analisi per le aziende quotate in borsa.
- Refactoring del codice
- Modificato i testcases in maniera di avere un file con almeno un anno (o periodo) con tutti gli importi.


#### Note
- Si è provato ad inserire il bottone per importare i settings da un altro file, il problema e che questa è un estensione condivisa e ha salvato i settings usando un proprio id, la funzionalità lavora con l'id dello script.

### In sospeso
- Permettere di visualizzare solamente la colonna preventivo.
- Incrementare la data automaticamente nel dialogo.
