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
        return "";
    }

    let csv = "";

    let invoicesData = generateCsvInvoices(invoicesTable);

    // Banana.Ui.showText(invoicesData);

    if (!invoicesData) {
        return "";
    }
    csv += invoicesData;
      
    return csv;
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
    let header = "InvoiceNumber,InvoiceDate,InvoiceDueDate,InvoiceDescription,InvoiceDiscount,InvoiceCurrency,InvoiceAmountType,InvoiceTotalToPay,CustomerNumber,CustomerName,ItemNumber,ItemDescription,ItemQuantity,ItemUnitPrice,ItemUnit,ItemVatRate,ItemVatCode,ItemDiscount,ItemTotal,ItemVatTotal\n";
    let csv = "";
    let isHeader = true;
    let rowMatched = true;
    let arrayItems = [];

    for (let i = 0; i < invoicesTable.rowCount; i++) {
        let row = invoicesTable.row(i);
        if (!row.isEmpty) {
            try {
                let invoiceFieldObj = JSON.parse(row.value("InvoiceData"));
                let invoiceObj = JSON.parse(invoiceFieldObj.invoice_json);
                
                if (!invoiceObj.document_info.date) {
                    row.addMessage(qsTr("InvoiceDate is a required field"));
                    rowMatched = false;
                } 
                if (!invoiceObj.customer_info.number) {
                    row.addMessage(qsTr("ContactsId is a required field"));
                    rowMatched = false;
                } 
                
                for (let j = 0; j < invoiceObj.items.length; j++) {
                    let itemTotal = "";
                    let itemUnitPrice = "";
                    let itemDiscount = "";
                    if (!invoiceObj.items[j].description) {
                        row.addMessage(qsTr("ItemDescription is a required field"));
                        rowMatched = false;
                        return "";
                    }
                    if (invoiceObj.document_info.vat_mode === "vat_excl") {
                        if (!invoiceObj.items[j].total_amount_vat_exclusive) {
                            row.addMessage(qsTr("ItemTotal is a required field"));
                            rowMatched = false;
                            return "";
                        } else {
                            itemTotal = invoiceObj.items[j].total_amount_vat_exclusive;
                            itemUnitPrice = invoiceObj.items[j].unit_price.amount_vat_exclusive;
                        }
                        
                    } else {
                        if (!invoiceObj.items[j].total_amount_vat_inclusive) {
                            row.addMessage(qsTr("ItemTotal is a required field"));
                            rowMatched = false;
                            return "";
                        } else {
                            itemTotal = invoiceObj.items[j].total_amount_vat_inclusive;
                            itemUnitPrice = invoiceObj.items[j].unit_price.amount_vat_inclusive;
                        }
                    }
                    if (invoiceObj.items[j].discount) {
                        if (invoiceObj.items[j].discount.percent) {
                            itemDiscount = invoiceObj.items[j].discount.percent;
                        } else {
                            itemDiscount = invoiceObj.items[j].discount.amount;
                        }
                    }
                    csv += `${getValue(invoiceObj.document_info.number)},${getValue(invoiceObj.document_info.date)},${getValue(invoiceObj.payment_info.due_date)},${getValue(invoiceObj.document_info.description)},${getValue(invoiceObj.billing_info.discount.amount)},${getValue(invoiceObj.document_info.currency)},${getValue(invoiceObj.document_info.vat_mode)},${getValue(invoiceObj.billing_info.total_to_pay)},`+
                           `${getValue(invoiceObj.customer_info.number)},${getValue(invoiceObj.customer_info.first_name)} ${getValue(invoiceObj.customer_info.last_name)},${getValue(invoiceObj.items[j].number)},${getValue(invoiceObj.items[j].description)},${getValue(invoiceObj.items[j].quantity)},${itemUnitPrice},${getValue(invoiceObj.items[j].mesure_unit)},${getValue(invoiceObj.items[j].unit_price.vat_rate)},${getValue(invoiceObj.items[j].unit_price.vat_code)},${getValue(itemDiscount)},${getValue(itemTotal)},${getValue(invoiceObj.items[j].total_vat_amount)}\n`;
                }
            }
            catch(e) {
                Banana.document.addMessage(qsTr("An error occured while exporting the csv invoice! ") + "\n" + qsTr("Error Description: ") + e);
            }
        }
    }
    if (rowMatched) {
        return header + csv;
    } else {
        Banana.document.addMessage(qsTr("Complete the missing details first, as listed in the message pane below."));
        return "";
    }
    
}
