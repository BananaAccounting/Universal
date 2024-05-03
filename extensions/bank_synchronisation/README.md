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

TodoList:

- Changed JSON structure, now only work with transaction objects containing all data-->Done
- Update db and queries according to the new structure, should allow better handling of single record exclusions-->Done
- Put processFile() in the multi trhead-->Testing
- Create API to generate hashes to be called in the js.-->To be added in the Banana.Converter.-->Done.
- Define how to:
  * Show the Bank Balance, based on the content fo the xml files, is possible ? Intuit can do it, but maybe trough the API they can define it easy, we should use the info in the camt, but it might be confusing, rather we can show the total of the movements which added to the banana balance should lead to the same result
  * Show the last synchronisation date ? To define.
  * Let the user start using the synchronisation when they already have transactions in accouting without any id. --> We could build an extension that looks for the transactions and gives them an id.--> Done.
  * Manage if we are processing two new files containing the same transaction (could happen if it has been exported two times (in two different files) and those file have not been processed yet.) If we process the same transaction twice we will have the same id twice, what we could do is a filtering method who checks if there are duplicated transactions by checking the id.--> Done.
- Add to the overview the date of the last importation for each iban.
- Add the balance of the new transactions.
- Test what happens if:
  * An iban is modified in the accounts table--> works good.
### Notes for automated tests.

* Transactions who refers to an iban that not exists in the accounting, are not imported.

