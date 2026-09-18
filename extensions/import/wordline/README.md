# Worldline IMPORT EXTENSION DOCUMENTATION

## Description

This extension imports the Worldline payment/settlement transaction list (CSV export) into
Banana Accounting and automatically creates, for every transaction, the three booking lines
needed to keep the Worldline income account at zero (the same approach used by the SumUp import
extension):

1. Debit bank account / Credit Worldline income account, for the net amount credited by Worldline.
2. Debit Worldline income account / Credit customer account, for the gross amount paid by the
   customer. The customer account is not part of the Worldline export, so it is left blank: use
   "Ihre Referenz" ("Your reference"), kept in the row's reference column, to identify and assign
   the correct customer account.
3. Debit fee account / Credit Worldline income account, for the Worldline commission (exported
   with a negative sign, booked here as a positive cost).

Worldline can settle in CHF, EUR or GBP ("Händler Währung" / merchant currency column). As with
the SumUp import extension, for now all transactions are booked through a single bank/income
account pair regardless of currency; the merchant currency is kept in the Notes column for
reference.

You can install the extension from the menu Extensions -> [Manage Extensions](https://www.banana.ch/doc/en/node/4702).

## Requirements

- [Banana Accounting Plus](https://www.banana.ch/en/buy) with the [Advanced Plan](https://www.banana.ch/en/advanced)

## Export Procedure

Export the payment/settlement transaction list from your Worldline back-office in CSV format.
The file must contain at least the following columns: "Transaktionsdatum", "Ihre Referenz",
"Händler Währung", "Bruttobetrag", "Gebühren" and "Netto Betrag".

## Import Procedure

- Via the Actions → Import to accounting → select Import transactions box
- Choose the extension to be used, in this case 'Worldline - Import movements .csv (Banana+ Advanced)'.
- With the Browse button, choose the file from which to import the transactions.
- In the settings dialog, check or adjust the date format and the bank/income/fee accounts for
  your chart of accounts, then press OK.

For more details see [import transactions](https://www.banana.ch/doc/en/node/2795) page.

## Error Messages

If the import fails, an error message will be displayed. The most common errors are:

- Unrecognised *.csv file format: The format of the *.csv file you are trying to import does
  not match any of the formats associated with this filter:
    - Check that you have chosen the correct file.
    - If the file you have chosen is correct, it may be that our filter requires updating.
- Missing account / This account does not exist in your chart of accounts: one of the
  configured accounts (bank, Worldline income or fee account) is empty or not present in the
  chart of accounts; add it or fix the account number in the settings dialog.
- This extension requires Banana Accounting+ Advanced: You are trying to use the extension with
  a licence other than the one requested, please upgrade to the [Advanced Plan](https://www.banana.ch/en/advanced).

## Notes

The extension has been developed and tested against a Double-entry and an Income & Expenses
accounting file, following the same automatic fee-separation approach used for the Wise and
SumUp import extensions in this repository.
