# Estimates and Invoices Tools

The extension Estimates and Invoices tools implements different functionalies used with the [Estimates and incoices application](https://www.banana.ch/doc/en/node/9752).

The following functionalities are currently implemented:

- Import invoices
- Import contacts
- Import items
- Export invoices
- Export contacts
- Export items

The menu will look at the following:

![Menu Esttimates and invoices Tools](doc/menu.png)

## Folder structure

The extension's consists of the following files:

- CMakeLists.txt: project file to be opened in Qt Creator
- ch.banana.application.invoice.tools.qrc: resource file to build the extension's package, building the project the extension's package .sbaa is created
- ch.banana.application.invoice.tools.manifest.json: manifest file with the extention's description
- ch.banana.application.invoice.export.contacts.js: script for exporting contacts
- ch.banana.application.invoice.export.invoices.js: script for exporting invoices
- ch.banana.application.invoice.export.items.js: script for exporting items
- ch.banana.application.invoice.import.contacts.js: script for importing contacts
- ch.banana.application.invoice.import.invoices.js: script for importing invoices
- ch.banana.application.invoice.import.items.js: script for importing items
- changelog.md: cronology of modifications
- README.md: documentation
- test/: folder with test units

## Import and export file format

The import and export files are csv (coma separated values) files, where:

- Values are separated by a "," (comma).
- Text values are delimited by quotes '"'.
- Text values can't contains quotes, quotes are replaced by apos '`'.
- Dates value are in ISO format "2022-10-24" (yyyy-MM-dd).
- Amount values have a dot "." as decimal separator, and no thousand separator.

### Invoice columns

- InvoiceNumber 2)
- InvoiceDate *
- InvoiceDueDate
- InvoiceDescription
- InvoiceDiscount
- InvoiceCurrency
- InvoiceAmountType 3)
- CustomerNumber *
- CustomerName 1) 4)
- ItemNumber
- ItemDescription *
- ItemQuantity
- ItemUnitPrice
- ItemUnit
- ItemVatRate
- ItemVatCode
- ItemDiscount
- ItemTotal *
- ItemVatTotal 1)

Notes:

- *\) Required fields
- 1\) Not used for import  
- 2\) By import will be replaced  
- 3\) vat_excl, vat_incl, vat_none (default is vat_excl)  
- 4\) it contains the Organisation Name or the First and Last Name plus the Locality separated by a comma  

Example:

```csv
InvoiceDate,CustomerNumber,ItemDescription,ItemTotal,ItemVatRate,ItemVatTotal
2022-10-24,120001,"Red roses",100.00,V77,7.70
2022-10-24,120001,"White tulips",20.00,V77,1.54
2022-10-25,120002,"Garofani",12.00,V77,V77,0.92
2022-10-25,120002,"Rododendrus",20.00,V77,1.54
```

Import rules:

- The invoice number will be replaces with an internal invoice number.
- If the customer number doesn't exist an error is retuned.
- If the item number doesn't exist an error is retuned.
- If the vat code doesn't exist an error is retuned.
- If a required field is missind an error is retuned.
- If any field doesn't match the format an error is retuned.
- In case of any error no invoice is imported. The user have first to fix the error in the file to import, and then import again the file.
- The returned result is a [DocumentChange document](https://www.banana.ch/doc/en/node/9641)
- The DocumentChange file contains the field to be inserted in the Invoices table and the [Invoice in json format](https://www.banana.ch/doc/en/node/8833).

Export rules:

- All avalilabels columns are exported;

## Contacts columns

- Number *
- OrganisationName *
- OrganisationUnit
- NamePrefix
- FirstName *
- LastName *
- Street *
- AddressExtra
- POBox
- PostalCode *
- Locality *
- CountryCode *
- LanguageCode
- EmailWork
- Discount

Notes:

- *\) Required fields

Import rules:

- If an item with the same id exists an error is retuned.
- If a required field is missing an error is retuned.
- If any field doesn't match the format an error is retuned.
- In case on any error no item is imported. The user have first to fix the error in the file to import, and then import again the file.
- The returned result is a [DocumentChange document](https://www.banana.ch/doc/en/node/9641)
- The DocumentChange file contains the field to be inserted in the Contacts table.

Export rules:

- All avalilabels columns are exported;

## Items columns

- Number *
- Description *
- UnitPrice *
- AmountType 1)
- Unit
- VatCode
- VatRate
- Discount

Notes:

- *\) Required fields
- 1\) vat_excl, vat_incl, vat_none (default is vat_excl)

Import rules:

- If a contact with the same id exists an error is retuned.
- If any field doesn't match the format an error is retuned.
- In case on any error no contacts is imported. The user have first to fix the error in the file to import, and then import again the file.
- The returned result is a [DocumentChange document](https://www.banana.ch/doc/en/node/9641)
- The DocumentChange file contains the field to be inserted in the Items table.


Export rules:

- All avalilabels columns are exported;

## Tests

Tests are implemented followinf the [BananaApp Test Framework](https://www.banana.ch/doc/en/node/9026). The functionnalities are to be implemented so that test cases can be implmeneted without efforts.

For each functionality a separated test have to be implemented:

- tests/ch.banana.application.invoice.export.contacts.test.js: test for exporting contacts
- tests/ch.banana.application.invoice.export.invoices.test.js: test for exporting invoices
- tests/ch.banana.application.invoice.export.items.test.js: test for exporting items
- tests/ch.banana.application.invoice.import.contacts.test.js: test for importing contacts
- tests/ch.banana.application.invoice.import.invoices.test.js: test for importing invoices
- tests/ch.banana.application.invoice.import.items.test.js: test for importing items

Test input test data is placed under:

- tests/testcases

Test exprected results are placed under:

- tests/testexpected
