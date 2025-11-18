# SumUp IMPORT EXTENSION DOCUMENTATION

## Description

This extension allows to import transactions from the SumUp platform into Banana Accounting.

You can install the extension from the menu Extensions -> [Manage Extensions](https://www.banana.ch/doc/en/node/4702).

## Requirements

- [Banana Accounting Plus](https://www.banana.ch/en/buy) with the [Advanced Plan](https://www.banana.ch/en/advanced)

## Export Procedure

Export your transactions from the SumUp platform in CSV format. 

* Login on your SumUp profile.
* Click on Home
* Click on Download Center
* Go to the Accounting section
*  Download Transactions and select the CSV (current format) option.

The transaction report lists all your transactions, including card payments, cash payments, and refunds.

It shows the payment method, transaction status, customer card type and, if added, the transaction description.

## Import Procedure

- Via the Actions → Import to accounting → select Import transactions box
- Choose the extension to be used, in this case 'SumUp - Import movements .csv (Banana+ Advanced)'.
- With the Browse button, choose the file from which to import the transactions.
- Press OK Button.

For more details see [import transactions](https://www.banana.ch/doc/en/node/2795) page. 

## Error Messages

If the import fails, an error message will be displayed. The most common errors are:

- Unrecognised *.csv file format: The format of the *.csv file you are trying to import does not match any of the formats associated with this filter:
    - Check that you have chosen the correct file.
    - If the file you have chosen is correct, it may be that our filter requires updating.
- This extension requires Banana Accounting+ Advanced: You are trying to use the extension with a licence other than the one requested, please upgrade to the [Advanced Plan](https://www.banana.ch/en/advanced). to be able to use the functionality of this filter.

Useful links:
 * [SumUp reports](https://help.sumup.com/en-GB/articles/1K6tiRe1quFjBtGgGSs21e-reports)
 * [SumUp API](https://developer.sumup.com)