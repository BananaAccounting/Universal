// @id = export_invoices
// @api = 1.0
// @pubdate = 2023-02-21
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
        return "";
    }

    let invoicesData = generateCsvInvoices(invoicesTable);
    if (!invoicesData) {
        Banana.application.showMessages(true); // Be sure the user is notified
        Banana.document.addMessage(qsTr("Fix errors first, as listed in the pane Messages."), "internal_error");
        return "";
    }
    return invoicesData;
}

function getValue(column) {
    // Check if a column is empty 
    return column ? column : ''
}

function convertToCsv(jsonArray) {
    let result = "";
    for (let i = 0; i < jsonArray.length; i++) {
        if (!jsonArray[i].number) 
            result += "0,";
        result += `${jsonArray[i].number},`;
    }
    for (let i = 0; i < jsonArray.length; i++) {
        result += `${jsonArray[i].description},`;
    }
    return result;
}

function generateCsvInvoices(invoicesTable) {
    let header = "InvoiceNumber,InvoiceDate,InvoiceDueDate,InvoiceDescription,InvoiceDiscount,InvoiceVatTotal,InvoiceTotalToPay,InvoiceCurrency,InvoiceRoundingTotal,InvoiceAmountType,CustomerNumber,CustomerName,ItemNumber,ItemDescription,ItemQuantity,ItemUnitPrice,ItemUnit,ItemVatRate,ItemVatCode,ItemDiscount,ItemTotal,ItemVatTotal\n";
    let csv = "";
    let rowMatched = true;

    for (let i = 0; i < invoicesTable.rowCount; i++) {
        let row = invoicesTable.row(i);
        if (!row.isEmpty) {
            try {
                let invoiceFieldObj = JSON.parse(row.value("InvoiceData"));
                let invoiceObj = JSON.parse(invoiceFieldObj.invoice_json);
                
                if (!invoiceObj.document_info.date) {
                    row.addMessage(qsTr("%1 is a required field").arg("InvoiceDate"), "InvoiceDate", "missing_field");
                    rowMatched = false;
                } 
                if (!invoiceObj.customer_info.number) {
                    row.addMessage(qsTr("%1 is a required field").arg("CustomerId"), "CustomerId", "missing_field");
                    rowMatched = false;
                } 
                
                for (let j = 0; j < invoiceObj.items.length; j++) {
                    let invoiceDiscount = "";
                    let itemTotal = "";
                    let itemUnitPrice = "";
                    let itemDiscount = "";
                    if (!invoiceObj.items[j].description) {
                        row.addMessage(qsTr("%1 is a required field").arg("ItemDescription"), "RowId", "missing_field");
                        rowMatched = false;
                        return "";
                    }
                    if (invoiceObj.document_info.vat_mode === "vat_excl") {
                        invoiceDiscount = invoiceObj.billing_info.total_discount_vat_exclusive;
                        if (!invoiceObj.items[j].total_amount_vat_exclusive) {
                            row.addMessage(qsTr("%1 is a required field").arg("ItemTotal"), "RowId", "missing_field");
                            rowMatched = false;
                            return "";
                        } else {
                            itemTotal = invoiceObj.items[j].total_amount_vat_exclusive;
                            itemUnitPrice = invoiceObj.items[j].unit_price.amount_vat_exclusive;
                        }
                        
                    } else {
                        invoiceDiscount = invoiceObj.billing_info.total_discount_vat_inclusive;
                        if (!invoiceObj.items[j].total_amount_vat_inclusive) {
                            row.addMessage(qsTr("%1 is a required field").arg("ItemTotal"), "RowId", "missing_field");
                            rowMatched = false;
                            return "";
                        } else {
                            itemTotal = invoiceObj.items[j].total_amount_vat_inclusive;
                            itemUnitPrice = invoiceObj.items[j].unit_price.amount_vat_inclusive;
                        }
                    }
                    if (invoiceObj.items[j].discount && (invoiceObj.items[j].discount.amount || invoiceObj.items[j].discount.percent)) {
                        if (invoiceObj.document_info.vat_mode === "vat_excl" && invoiceObj.items[j].unit_price.discounted_amount_vat_exclusive) {
                            itemDiscount = Banana.SDecimal.subtract(invoiceObj.items[j].unit_price.calculated_amount_vat_exclusive,
                                                                    invoiceObj.items[j].unit_price.discounted_amount_vat_exclusive);
                        } else if (invoiceObj.items[j].unit_price.calculated_amount_vat_inclusive) {
                            itemDiscount = Banana.SDecimal.subtract(invoiceObj.items[j].unit_price.calculated_amount_vat_inclusive,
                                                                    invoiceObj.items[j].unit_price.discounted_amount_vat_inclusive);
                        }
                    }
                    let itemDescription = invoiceObj.items[j].description;
                    let checkDescription = /[,']/.test(itemDescription); // check for special characters in itemDescription
                    if (checkDescription) { 
                        itemDescription = `"${itemDescription}"`;
                    }
                    // Banana.Ui.showText(JSON.stringify(invoiceObj));    
                    csv += `${getValue(invoiceObj.document_info.number)},${getValue(invoiceObj.document_info.date)},${getValue(invoiceObj.payment_info.due_date)},${getValue(invoiceObj.document_info.description)},${getValue(invoiceDiscount)},${getValue(invoiceObj.billing_info.total_vat_amount)},${getValue(invoiceObj.billing_info.total_to_pay)},${getValue(invoiceObj.document_info.currency)},${getValue(invoiceObj.document_info.rounding_total)},${getValue(invoiceObj.document_info.vat_mode)},`+
                           `${getValue(invoiceObj.customer_info.number)},${getValue(invoiceObj.customer_info.first_name)} ${getValue(invoiceObj.customer_info.last_name)},${getValue(invoiceObj.items[j].number)},${getValue(itemDescription)},${getValue(invoiceObj.items[j].quantity)},${itemUnitPrice},${getValue(invoiceObj.items[j].mesure_unit)},${getValue(invoiceObj.items[j].unit_price.vat_rate)},${getValue(invoiceObj.items[j].unit_price.vat_code)},${getValue(itemDiscount)},${getValue(itemTotal)},${getValue(invoiceObj.items[j].total_vat_amount)}\n`;
                }
            }
            catch(e) {
                row.addMessage(qsTr("Invoice not valid.\nError: %1").arg(e), "RowId", "internal_error");
                rowMatched = false;
            }
        }
    }
    if (rowMatched) {
        return header + csv;
    }
    return null;
}












