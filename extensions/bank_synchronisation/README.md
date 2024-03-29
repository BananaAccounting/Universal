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

  #### Factors Influencing Uniqueness

    - Date: If transactions are evenly distributed over time and the granularity is to the day, the date provides an initial level of discrimination. However, on days with a high volume of transactions, the date alone is not sufficient to guarantee uniqueness.

    - Description: Transaction descriptions tend to have significant variations, especially in contexts where each transaction can be described in detail. However, cases such as recurring payments or purchases from common suppliers may have very similar or identical descriptions.

    - Income and Expenses: The amounts of transactions can vary widely. Identical transactions in terms of amount might be common in certain contexts (e.g., standardized subscriptions, recurring payments of the same amount), but combining this with the description and date reduces this likelihood.

#### Uniqueness Analysis

   - Unique Transactions: For most business and personal contexts, a combination of these four fields will be sufficiently unique. This is particularly true for transactions that are not standardized or recurring with the same description and amount.

   - Recurring Transactions: In the case of recurring payments with identical descriptions and amounts, uniqueness could be questioned. However, if these recurrences are recorded on different dates, uniqueness is maintained.

#### Estimating Uniqueness

In diversified contexts where standardized and recurring payments do not dominate, one might reasonably assume that uniqueness is assured in more than 95% of cases. For contexts with many recurring transactions (e.g., subscriptions, fixed monthly payments to the same supplier), this percentage might slightly decrease.