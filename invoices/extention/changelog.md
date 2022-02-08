# Changelog
 
## 2022-02-08

* [RELEASE STABLE] Released as Stable
* [FIX] Fix button create invoice does not create any invoice
* [FIX] Fix button duplicate invoice does not create any invoice

## 2022-02-07

* [RELEASE STABLE] Released as Stable
* [FIX] Fix save button not working due to a property missing in the invoice document
* [FIX] Fix text fields doesn't automatically scroll horizontally, edited text beyond the field's with is not visible
* [TODO] Fix overwrapping article's descriptions that span over more lines

## 2022-02-01

* [RELEASE STABLE] Released as Stable
* [FIX] Add payment date to invoice json to determine if an invoice is paid

## 2022-01-31

* [RELEASE BETA] Released as Beta
* [FIX] Fix language, currency and contacts combobox were empty and did not show the current values
* [FIX] Fix text in contacts combobox was deleted while entering text
* [FIX] Changes in custom fields text was not immediately take over


## 2022-01-27

* [FIX] Fix some italian translations

## 2022-01-27

* [RELEASE BETA] Released as Beta
* [ENHANCEMENT] Show a notification to the user when an updated extension is installed

## 2022-01-25

* [BUG] Fix vat code V0 in invoice's items table is not pre-selected in the combo box
* [ENHANCEMENT] Show in invoice dialog the total for the vat rate 0%
* [ENHANCEMENT] Show in translations dialog at least the mains languages german, italian, french and english

## 2022-01-17

* [BUG] Fix some translations

## 2022-01-12

* [BUG] Fix changes to application's setting vat mode are not saved
* [BUG] Fix first item of news invoices has the item number set as the invoice number
* [BUG] Fix changes to invoice items vat rates are not saved
* [BUG] Fix vat number and fiscal number are not resumed from the contact table
* [BUG] Fix invoice (or estimate) progessive number doesn't consider archived documents

## 2021-12-23

* [BUG] Fix article's unit price is resumed resumed in the invoice dialog with 4 decimals instead of 2 decimals

## 2021-12-22

* [BUG] Fix invoice number in the description of new invoices
* [BUG] Fix invoice language was not correctly resumed from the contact table
* [BUG] Fix invoice without a valid language is not printed

## 2021-12-09

* [BUG] Fix F6 (Cmd-6) on Invoice Id column skip a number
* [Enhancement] For new item rows the inserted default quantity is "1" instead of "1.00"
* [BUG] Fix invoice language is not updated when a contact is selected from the combo box
* [Enhancement] Add a dialog to show the display properties and the applied pixel ratio (Ctrl+Alt+9, Cmd+ALt+9 on macOS)
* [BUG] Fix custom fields descriptions are not updated while printing
* [BUG] Fix empties custom fields remain in the printing
* [BUG] Fix key F9 create new invoices on empty rows
* [BUG] Fix supplier info are not updated in the invoice and in the print out

## 2021-11-23

* [Enhancement] Let search items by description
* [Enhancement] Let search customers by name, address, email or fiscal number
* [Enhancement] Add customer fields to the invoice
* [Enhancement] Check entered dates and notify the user if the date is not valid
* [Bug] Fix the entered item date is not saved
* [Bug] Fix tab key on field item quantity does not save the edited text
* [Bug] Fix textes and translations

## 2021-10-13

* First beta release

### Main changes

* [Enhancement] Add in the items the discount column (require advanced plan)
* [Enhancement] Add in the items the date column (require advanced plan)
* [Enhancement] Let insert items quantity and unit price with 4 or more decimals
* [Enhancement] Let insert multi line text in the item's description
* [Enhancement] Let insert multi line text in the invoice's begin text
* [Enhancement] Let choose which invoice's fields are visibles
* [Enhancement] Let choose which item's columns are visibles
* [Enhancement] Let insert bold text in item's description, invoice's begin text and invoice's end text
* [Enhancement] Let set the title for new invoices and estimates
* [Enhancement] Add views to the dialog
* [Bug] Resolves an issue where text changes sometimes were not applied if the enter key was not pressed
* [Bug] Resolves an issue related to clipped text fields on hdpi monitors under window

### Other changes

* [Enhancement] Add address fields Postbox and Extra
* [Enhancement] Add address fields Postbox and Extra
* [Enhancement] Add smart fill to the customer language column
* [Enhancement] Add in the edit invoice dialog the languages spanish, portuguese, russia, dutch and chinese
* [Enhancement] Add in the edit invoice dialog all the languages present in the customer table (user defined languages)
* [Enhancement] Add help button to dialogs;
* [Enhancement] In the edit invoice dialog the width of invoice details fields grows with the widht of the dialog;
* [Enhancement] In the edit invoice dialog the height of invoice articles a grows with the height of the dialog;
* [Enhancement] The dimension of the invoice dialog is saved and restored at the next opening (require the last version of Banana Accounting);
* [Enhancement] Support dynamic switch to dark mode
* [Enhancement] Add the invoice / estimate total to the dialog's top right corner
* [Bug] Fix textes and translations

### To do

* [Enhancement] Simplify the search of customers and articles
* [Enhancement] Allow to add customer fields to the invoice
* [Enhancement] Allow to print remainders
* [Enhancement] Allow to print delivery note
* [Enhancement] Add status to the invoice (draft, sent, remainder1, canceled, ...)
* [Enhancement] Allow to to insert totals and subtotals of items


## 2021-08-24

* [Bug] Fix under macOs dark mode item's texts are not visible;

## 2021-03-16

* [Bug] Prints amounts for items without price (0.00) but with quantity

## 2021-02-03

* [Enhancement] Doesn't prints amounts for items used as notes (items without price)

## 2021-01-18

* [Bug] Fix error invoiceObj is not defined in command duplicate;

## 2021-01-13

* [Bug] Fix translations errors;

## 2020-12-01

* [Enhancement] Add fields for deposit's amount and deposit's description;

## 2020-11-26

* [Bug] Fix changing invoice's notes in the dialog will not update the Note's field in the invoice's table;
* [Bug] Fix creating a new invoice doesn't set the expiring date;

## 2020-11-18

* [Bug] Fix when adding an item to the invoice, the item's price is set to amount_vat_exclusive or amount_vat_inclusive depending on invoice's settings;

## 2020-10-27

* [Enhancement] Add copy and paste of invoice's rows;

