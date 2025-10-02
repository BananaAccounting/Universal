# STRIPE IMPORT EXTENSIONS DOCUMENTATION

## Description

Stripe offre molteplici reports, noi per semplicità permettiamo di importare due tipololgie di report.

### 1 Transactions report

It allows you to obtain all customer payments, including fees and collected transfers, and their corresponding status.

Go to Transactions → All activity → Export. In the export dialog, select All columns (17).

Stripe also lets you export only payments, payouts, or top-ups. For simplicity, we choose to export All activity — otherwise it would be too burdensome to map every case, since the exported format changes for each option.

### 2 Balance summary report.

is similar to a bank statement, helping you to reconcile your Stripe balance at the end of the month. 
It provides an itemized CSV export of your complete transaction history and any custom metadata associated 
with those transactions. All transactions are shown in your settlement currency (after any foreign currency conversion).

Go to Report->Summary Balance-> Export. In the dialog select All columns.


## Links

Useful links:
 * [Balance report] https://stripe.com/docs/reports/balance
 * [General documentation] https://support.stripe.com/questions/reserves-frequently-asked-questions?locale=en-GB
