## Test platform and examples on internet

* [Postfinance](https://isotest.postfinance.ch/corporates/)
* [Credit Suisse](https://www.credit-suisse.com/microsites/zv-migration/en/unternehmen-in-der-umsetzung/iso-test-platform.html)
* [UBS](https://ubs-paymentstandards.ch/login?logout)

## Developments Notes

- Some statements does not have an account IBAN but they have a Id wich is also a specific reference to the account for the bank:
   1) Banking systems not based on IBAN: In some regions or for some banks, the IBAN might not be the standard method for identifying bank accounts. In these cases, an alternative ID provided by the bank is the primary way to identify an account.
   2) Internal needs: Some banks use internal identifiers or specific codes for managing accounts and transactions. These IDs can be useful for internal processing, account reconciliation, or other administrative operations.
   3) Additional information: In some cases, the ID in <n1:Othr> can provide additional or contextual information useful for data processing, especially if the IBAN is not sufficient for a unique identification of the account within a certain banking or financial system.