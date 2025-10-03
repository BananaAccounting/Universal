# STRIPE IMPORT EXTENSIONS DOCUMENTATION

## Description

Stripe offers multiple reports. For convenience, we allow the import of two types of reports, which are in fact the ones our users have provided to us, and which we therefore believe are the most commonly used and most useful for accounting purposes.

### 1 Transactions report

It allows you to obtain all customer payments, including fees and collected transfers, and their corresponding status.

Go to Transactions → All activity → Export. 

In the export dialog select:

* Columns: All columns.

Stripe also lets you export only payments, payouts, or top-ups. For simplicity, we choose to export All activity — otherwise it would be too burdensome to map every case, since the exported format changes for each option.

### 2 Balance summary report.

is similar to a bank statement, helping you to reconcile your Stripe balance at the end of the month. 
It provides an itemized CSV export of your complete transaction history and any custom metadata associated 
with those transactions. All transactions are shown in your settlement currency (after any foreign currency conversion).

There are 3 summary balances, we use the: Balance change from activity, which includes changes to Stripe balance from activity (payments, refunds, transfers, etc.), excluding payouts, as well as itemised downloads.

Go to Report->Summary Balance->Balance change from activity-> Download. 

In the dialog select: 

* Report format: Itemied.
* Columns: All columns.

## Links

Useful links:
 * [Balance report] https://stripe.com/docs/reports/balance
 * [General documentation] https://support.stripe.com/questions/reserves-frequently-asked-questions?locale=en-GB
