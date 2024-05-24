## Test platform and examples on internet

* [Postfinance](https://isotest.postfinance.ch/corporates/)
* [Credit Suisse](https://www.credit-suisse.com/microsites/zv-migration/en/unternehmen-in-der-umsetzung/iso-test-platform.html)
* [UBS](https://ubs-paymentstandards.ch/login?logout)

## Developments Notes

### Synchronise the accounting using .xml (camt) files.
- Some statements does not have an account IBAN but they have a Id wich is also a specific reference to the account for the bank:
   1) Banking systems not based on IBAN: In some regions or for some banks, the IBAN might not be the standard method for identifying bank accounts. In these cases, an alternative ID provided by the bank is the primary way to identify an account.
   2) Internal needs: Some banks use internal identifiers or specific codes for managing accounts and transactions. These IDs can be useful for internal processing, account reconciliation, or other administrative operations.
   3) Additional information: In some cases, the ID in <n1:Othr> can provide additional or contextual information useful for data processing, especially if the IBAN is not sufficient for a unique identification of the account within a certain banking or financial system.

### Synchronise the accounting using .csv files.

  * Files must start with the name of the bank: bankname_*.csv, this allow us to understand wich extension to call.
  * We use a modified version of the existing import extensions.
  * Actually we look to a reference of the IBAN inside the csv content (wich it could be found in different places not only for each extension but also for each format in each extension), in future we could consider other option, like to add the iban in the file name like: bankname_ibancode*.csv, this would allow us to work also with those csv that dont contains any reference to any IBAN.
  * Most of files does not have any reference id, thats why to identify a transaction we use the combination of
    -  Date
    -  Description
    -  Income
    -  Expenses
  to create an hash that identifies a transactions, those are base fields that are present basically in all the transactions. To make this decision we also used chatgpt, wich also made us an analysi about the unicity that this fields could have in our context:

#### Estimating Uniqueness

In diversified contexts where standardized and recurring payments do not dominate, one might reasonably assume that uniqueness is assured in more than 95% of cases. For contexts with many recurring transactions (e.g., subscriptions, fixed monthly payments to the same supplier), this percentage might slightly decrease.

### TODO

25.04.2024: TodoList:

- Changed JSON structure, now only work with transaction objects containing all data-->Done
- Update db and queries according to the new structure, should allow better handling of single record exclusions-->Done
- Put processFile() in the multi trhead-->Testing
- Create API to generate hashes to be called in the js.-->To be added in the Banana.Converter.-->Done.
- Define how to:
  * Show the Bank Balance, based on the content fo the xml files, is possible ? Intuit can do it, but maybe trough the API they can define it easy, we should use the info in the camt, but it might be confusing, rather we can show the total of the movements which added to the banana balance should lead to the same result
  * Show the last synchronisation date ? To define.--> added
  * Let the user start using the synchronisation when they already have transactions in accouting without any id. --> We could build an extension that looks for the transactions and gives them an id.--> Done.
  * Manage if we are processing two new files containing the same transaction (could happen if it has been exported two times (in two different files) and those file have not been processed yet.) If we process the same transaction twice we will have the same id twice, what we could do is a filtering method who checks if there are duplicated transactions by checking the id.--> Done.
- Add to the overview the date of the last importation for each iban.
- Add the balance of the new transactions.
- Test what happens if:
  * An iban is modified in the accounts table--> works good.

08.05.2024, Incontro con Domenico.

TodoList e modifiche:


- [x] Cambiare "Balance in Banana" con "Balance in Accounting"
- [x] Inserire la voce "Last Balance" dove mostriamo l'importo dell bilancio più aggiornato collegato allo statement.
- [x] Spostare il file .db dentro la cartella dove esistono i file e la contabilità, in maniera che ogni contabilità lavori con un proprio DB.
- [x] Aggiungere nella tabella "SyncHistoryData" due nuovi campi:
   * UserName: Il nome dell'utente che sta usando il computer.
   * ComputerName: Il nome del computer utilizzato
- [x] Creare una nuova tab "Overview" dove mostrare i dati relativi ai file processati, per contro la vecchia tab overview verrà chiamata: "Bank accounts" e conterrà tutte le informazioni relative ai conti bancari presenti in Banana.
   * Aggiungere ai dati presenti nella tab "Bank Overview" le info relative all'ultimo movimento importato.
   * Alla nuova tab "Overview" aggiungere dati relativi anche a chi ha fatto l'ultima transazione (Nome utente e nome computer)
   * Spostare i dati presenti nella tab "Bank Overview" in colonne adiacenti quella del conto (a cui aggiungo l'iban dopo la descrizione) usando una stuttura simile a quella che gia usiamo per i dati nella tab details.
- [x] Aggiungere nuovo bottone "Clear All" che elimina tutti i dati dal database. Questo bottone coesiste con "Read all Files"
- [ ] Aggiustare come funziona ora la processazione e la ri-lettura dei file, attualmente se elimino delle transazioni dalla contabilità ma il file risulta processato, esse non mi verranno più automaticamente proposte da importare, invece dovremmo essere in grado di riproporle nel caso in cui non vengano trovate in contabilità, anche se il file risulta processato.
- [x] Quando controllo l'esistenza di una transazione o la importo, devo controllare che riguardi la contabilità corrente, devo quindi controllare che stia dentro il range definito dalla data di apertura e chiusura della contabilità.
- [ ] Aggiungere una classe per mostrare all'utente i dati relativi alla processazione del file (Progress bar, numero di dati elaborati).
  - I tempi di processazione avvengono:
    - Quando viene selezionato il file, la classe deve mostrare una barra di caricamento in base al tempo di processazione di ogni file in base al totale dei file che ci sono da processare.
    - Se è possibile, collegare anche il tasto "read all files" per mostrare tutti i file che vengono processati nuovamente.
    - i dati di processazione poi sarebbe bello poterli mostrare nel dialogo, per esempio indicando nell'overview quanti file sono stati processati, quante transazioni totali nuove sono state trovate.
- [ ] Fare in maniera di ottimizzare le tempistiche dei processi li dove è possibile non fare qualcosa non lo facciamo.

Altre idee post:
1) Salvare il last balance nel db in maniera che sia visibile anche quando non vengono letti i nuovi file, per mostrare che il file è sincronizzato.
2) aggiungere un controllo anche sul bilancio di apertura dell'ultimo statement presente ? in questo modo possiamo anche controllare che l'apertura sia uguale...
3) L'aggiornamento delle tabelle dei db, trasformarli in slot e segnali.
4) Attualmente per salvare i dati delle transazioni e dei conti bancari usiamo due oggetti differenti, sarebbe utile unificare il tutto in un solo oggetto ? Attualmente lavoriamo solo con i dati impostati nei dettagli delle transazioni, nelle altre tab recuperiamo gia quei dati li e li mostriamo per non creare doppioni.
5) Come ci comportiamo con le registrazioni di dettaglio che hanno data, id e importo uguale ? Attualmente dobbiamo testare cosa sucede in un caso tipo quello che accade con il file della zurcher.

### Notes for automated tests.

* Transactions who refers to an iban that not exists in the accounting, are not imported.

