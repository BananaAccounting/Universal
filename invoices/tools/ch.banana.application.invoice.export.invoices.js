// @id = ch.banana.application.invoice.export.invoices
// @api = 1.0
// @pubdate = 2022-10-24
// @publisher = Banana.ch SA
// @description = Export invoices
// @description.de = Rechnungen exportieren
// @description.fr = Exporter factures
// @description.it = Esporta fatture
// @doctype = 400.400
// @docproperties =
// @task = export.file
// @exportfiletype = csv
// @exportfilename = invoices
// @outputformat = tablewithheaders
// @outputencoding = utf8
// @inputfilefilter = Text file (*.csv);;All files (*.*)
// @inputfilefilter.de = Text datei (*.csv);;All files (*.*)
// @inputfilefilter.fr = Fichier text(*.csv);;All files (*.*)
// @inputfilefilter.it = File testo (*.csv);;All files (*.*)

/**
 * Parse the file and create a document change document to import the imvoices.
 */
function exec() {
    let invoicesTable = Banana.document.table("Invoices");

    if (!invoicesTable) {
        return
    }

    let csv = "InvoiceNumber,InvoiceDate,InvoiceDueDate,InvoiceDescription,InvoiceDiscount,InvoiceCurrency, \
               InvoiceAmountType,CustomerNumber,CustomerName,ItemNumber,ItemDescription,ItemQuantity, \
               ItemUnitPrice,ItemUnit,ItemVatRate,ItemVatCode,ItemDiscount,ItemTotal,ItemVatTotal\n";

    csv += generateCsv(invoicesTable);
      
    return csv;
}

function getValue(column) {
    // Check if a column is empty 
    return column ? column : ''
}

function generateCsv(invoicesTable) {
    let csv = '';
    for (let i = 0; i < invoicesTable.rowCount; i++) {
        let row = invoicesTable.row(i);
        if (row) {
            try {
                let invoiceFieldObj = JSON.parse(row.value("InvoiceData"));
                let invoiceObj = JSON.parse(invoiceFieldObj.invoice_json);
                let itemDiscountAmount = '';
                let itemDiscountPercent = '';

                // Check the required fields
                if (!invoiceObj.document_info.date) {
                    Banana.document.addMessage("InvoiceDate is a required field");
                    return;
                } else if (!invoiceObj.customer_info.number) {
                    Banana.document.addMessage("CustomerNumber is a required field");
                    return;
                } else if (!invoiceObj.items[i].description) {
                    Banana.document.addMessage("ItemDescription is a required field");
                    return;
                } else if (!invoiceObj.items[i].unit_price.calculated_amount_vat_exclusive) {
                    Banana.document.addMessage("ItemTotal is a required field");
                    return;
                } else if (invoiceObj.items[i].discount) {
                    if (invoiceObj.items[i].discount.amount) {
                        itemDiscountAmount = invoiceObj.items[i].discount.amount;
                    } else {
                        itemDiscountAmount = '';
                    }
                    if (invoiceObj.items[i].discount.percent) {
                        itemDiscountPercent = invoiceObj.items[i].discount.percent;
                    } else {
                        itemDiscountPercent = '';
                    } 
                } else {
                    csv += `${getValue(invoiceObj.document_info.number)}, \
                            ${getValue(invoiceObj.document_info.date)}, \
                            ${getValue(invoiceObj.billing_info.due_date)}, \
                            ${getValue(invoiceObj.document_info.description)}, \
                            ${getValue(invoiceObj.billing_info.discount.amount_vat_exclusive)}, \
                            ${getValue(invoiceObj.document_info.currency)}, \
                            ${getValue(invoiceObj.document_info.vat_mode)}, \
                            ${getValue(invoiceObj.customer_info.number)}, \
                            ${getValue(invoiceObj.customer_info.first_name) + ' ' + getValue(invoiceObj.customer_info.last_name)}, \
                            ${getValue(invoiceObj.items[i].number)}, \
                            ${getValue(invoiceObj.items[i].description)}, \
                            ${getValue(invoiceObj.items[i].quantity)}, \
                            ${getValue(invoiceObj.items[i].unit_price.calculated_amount_vat_exclusive)}, \
                            ${getValue(invoiceObj.items[i].mesure_unit)}, \
                            ${getValue(invoiceObj.items[i].vat_rate)}, \
                            ${getValue(invoiceObj.items[i].vat_code)}, \
                            ${getValue(itemDiscountPercent)}, \
                            ${getValue(invoiceObj.items[i].unit_price.calculated_amount_vat_exclusive)}, \
                            ${getValue(invoiceObj.items[i].unit_price.calculated_vat_amount)}\n`;
                }    
            }
            catch(e) {
                Banana.document.addMessage(`An error occured while exporting the csv invoice! \nError Description: ${e}`);
            }
        }
    }
    return csv;
}
