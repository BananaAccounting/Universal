# To do

## To be implemented

### Step I

- Read the documentation:

  - [Export extensions](https://www.banana.ch/doc/en/node/4732)
  - [Invoice json object](https://www.banana.ch/doc/en/node/8833)
  - [Invoice json data mapping](https://www.banana.ch/doc/en/node/8837)

- Study the following code

```javascript
// How to read invoice json data
// See https://github.com/BananaAccounting/InvoicesApp/blob/c31e1823191c1a992f88e2e19b87db5bac36ca33/src/base/invoice.js#L258
function invoiceObjGet(rowNr) {
    let invoicesTable = Banana.document.table("Invoices");
    let row = invoicesTable.row(rowNr);
    if (row) {
        try {
            let invoiceFieldObj = JSON.parse(row.value("InvoiceData"));
            return JSON.parse(invoiceFieldObj.invoice_json);
        }
        catch(e) {
            return null;
        }
    }
    return null;
}
```

- Create a Estimates and Invoice test file with some tests invoices where the vat mode is vat exclusive
- Save the file under testcases/
- Implement the script in tests/h.banana.application.invoice.export.invoices.js
- Do some manual testing exporting data
- Implement automatic tests in tests/ch.banana.application.invoice.export.invoices.test.js

- Do a pull request

### Step II

- Create a test file with some invoices, where the vat mode is vat inclusive
- Save the file under testcases/
- Extend automatic tests in tests/ch.banana.application.invoice.export.invoices.test.js

- Create a test file with some invoices, where the vat mode is vat none
- Save the file under testcases/
- Extend automatic tests in tests/ch.banana.application.invoice.export.invoices.test.js

- Do a pull request

### Step III

- Read the documentation:
  - [DocumentChange document](https://www.banana.ch/doc/en/node/9641)

- Study the following code

```javascript
// Set fields in the document change for invoices
https://github.com/BananaAccounting/InvoicesApp/blob/c31e1823191c1a992f88e2e19b87db5bac36ca33/src/base/invoice.js#L352
function invoiceChangedFieldsGet(invoiceObj, row) {
    var changedRowFields = {};

    if (invoiceObj) {
        changedRowFields["RowId"] = invoiceObj.document_info.number;
        changedRowFields["InvoiceDate"] = invoiceObj.document_info.date.substring(0, 10);
        changedRowFields["Description"] = invoiceObj.document_info.description;
        changedRowFields["ContactsId"] = invoiceObj.customer_info.number;
        changedRowFields["InvoiceAddress"] = invoiceCustomerAddressBriefDescriptionGet(invoiceObj);
        changedRowFields["InvoiceDiscountAmount"] = invoiceObj.billing_info.total_discount_vat_inclusive
        if (invoiceObj.billing_info.discount && invoiceObj.billing_info.discount.percent)
            changedRowFields["InvoiceDiscountPercentage"] = invoiceObj.billing_info.total_discount_percent;
        else
            changedRowFields["InvoiceDiscountPercentage"] = "";
        changedRowFields["InvoiceTotalAmount"] = invoiceObj.billing_info.total_to_pay;
        changedRowFields["InvoiceTotalVat"] = invoiceObj.billing_info.total_vat_amount;
        changedRowFields["EmailWork"] = invoiceObj.customer_info.email;
        changedRowFields["PhoneWork"] = invoiceObj.customer_info.phone;
        changedRowFields["InvoiceDateExpiration"] = invoiceObj.payment_info.due_date

...

    return changedRowFields;
}

// Set InvoiceData field in the document change
// See https://github.com/BananaAccounting/InvoicesApp/blob/c31e1823191c1a992f88e2e19b87db5bac36ca33/src/base/invoice.js#L283
function invoiceUpdatedInvoiceDataFieldGet(tabPos, invoiceObj) {
    var invoiceFieldObj = {};
    var row = invoiceRowGet(tabPos);
    if (row) {
        try {
            invoiceFieldObj = JSON.parse(row.value("InvoiceData"));
        } catch(e) {

        }
    }
    // Save as string, because getMapValue can't handle json data
    invoiceFieldObj.invoice_json = JSON.stringify(invoiceObj);
    return invoiceFieldObj;
}
```

- Implement the script ch.banana.application.invoice.import.invoices.js
- Do some manual tests
- Implement the test tests/ch.banana.application.invoice.import.invoices.test.js
- Do a pull request

### Step IV

- To be defined

## Implemented

Move here the implmented steps
