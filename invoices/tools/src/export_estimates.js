// @id = export_estimates
// @api = 1.0
// @pubdate = 2023-03-17
// @publisher = Banana.ch SA
// @description = Export estimates
// @description.de = Rechnungen exportieren
// @description.fr = Exporter offres
// @description.it = Esporta Offerte
// @doctype = 400.400
// @docproperties =
// @task = export.file
// @exportfiletype = csv
// @exportfilename = estimates
// @outputformat = tablewithheaders
// @outputencoding = utf8
// @inputfilefilter = Text file (*.csv);;All files (*.*)
// @inputfilefilter.de = Text datei (*.csv);;All files (*.*)
// @inputfilefilter.fr = Fichier text(*.csv);;All files (*.*)
// @inputfilefilter.it = File testo (*.csv);;All files (*.*)

/**
 * Parse the file and create a document change document to import the estimates.
 */
function exec() {
    let estimatesTable = Banana.document.table("Estimates");
    if (!estimatesTable) {
        return "";
    }

    let estimatesData = generateCsvEstimates(estimatesTable);
    if (!estimatesData) {
        Banana.application.showMessages(true); // Be sure the user is notified
        Banana.document.addMessage(qsTr("Fix errors first, as listed in the pane Messages."), "internal_error");
        return "";
    }
    return estimatesData;
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

function generateCsvEstimates(estimatesTable) {
    let header = "InvoiceNumber,InvoiceDate,InvoiceDueDate,InvoiceDescription,InvoiceDiscount,InvoiceVatTotal,InvoiceTotalToPay,InvoiceCurrency,InvoiceRoundingTotal,InvoiceAmountType,CustomerNumber,CustomerName,ItemNumber,ItemDescription,ItemQuantity,ItemUnitPrice,ItemUnit,ItemVatRate,ItemVatCode,ItemDiscount,ItemTotal,ItemVatTotal\n";
    let csv = "";
    let rowMatched = true;

    for (let i = 0; i < estimatesTable.rowCount; i++) {
        let row = estimatesTable.row(i);
        if (!row.isEmpty) {
            try {
                let estimateFieldObj = JSON.parse(row.value("InvoiceData"));
                let estimateObj = JSON.parse(estimateFieldObj.invoice_json);
                
                if (!estimateObj.document_info.date) {
                    row.addMessage(qsTr("%1 is a required field").arg("InvoiceDate"), "InvoiceDate", "missing_field");
                    rowMatched = false;
                } 
                if (!estimateObj.customer_info.number) {
                    row.addMessage(qsTr("%1 is a required field").arg("CustomerId"), "CustomerId", "missing_field");
                    rowMatched = false;
                } 
                
                for (let j = 0; j < estimateObj.items.length; j++) {
                    let invoiceDiscount = "";
                    let itemTotal = "";
                    let itemUnitPrice = "";
                    let itemDiscount = "";
                    if (!estimateObj.items[j].description) {
                        row.addMessage(qsTr("%1 is a required field").arg("ItemDescription"), "RowId", "missing_field");
                        rowMatched = false;
                        return "";
                    }
                    if (estimateObj.document_info.vat_mode === "vat_excl") {
                        invoiceDiscount = estimateObj.billing_info.total_discount_vat_exclusive;
                        if (!estimateObj.items[j].total_amount_vat_exclusive) {
                            row.addMessage(qsTr("%1 is a required field").arg("ItemTotal"), "RowId", "missing_field");
                            rowMatched = false;
                            return "";
                        } else {
                            itemTotal = estimateObj.items[j].total_amount_vat_exclusive;
                            itemUnitPrice = estimateObj.items[j].unit_price.amount_vat_exclusive;
                        }
                        
                    } else {
                        invoiceDiscount = estimateObj.billing_info.total_discount_vat_inclusive;
                        if (!estimateObj.items[j].total_amount_vat_inclusive) {
                            row.addMessage(qsTr("%1 is a required field").arg("ItemTotal"), "RowId", "missing_field");
                            rowMatched = false;
                            return "";
                        } else {
                            itemTotal = estimateObj.items[j].total_amount_vat_inclusive;
                            itemUnitPrice = estimateObj.items[j].unit_price.amount_vat_inclusive;
                        }
                    }
                    if (estimateObj.items[j].discount && (estimateObj.items[j].discount.amount ||estimateObj.items[j].discount.percent)) {
                        if (estimateObj.document_info.vat_mode === "vat_excl" && estimateObj.items[j].unit_price.discounted_amount_vat_exclusive) {
                            itemDiscount = Banana.SDecimal.subtract(estimateObj.items[j].unit_price.calculated_amount_vat_exclusive,
                                                                    estimateObj.items[j].unit_price.discounted_amount_vat_exclusive);
                        } else if (estimateObj.items[j].unit_price.calculated_amount_vat_inclusive) {
                            itemDiscount = Banana.SDecimal.subtract(estimateObj.items[j].unit_price.calculated_amount_vat_inclusive,
                                                                    estimateObj.items[j].unit_price.discounted_amount_vat_inclusive);
                        }
                    }
                    let itemDescription = estimateObj.items[j].description;
                    let checkDescription = /[,']/.test(itemDescription); // check for special characters in itemDescription
                    if (checkDescription) { 
                        itemDescription = `"${itemDescription}"`;
                    }

                    csv += `${getValue(estimateObj.document_info.number)},${getValue(estimateObj.document_info.date)},${getValue(estimateObj.payment_info.due_date)},${getValue(estimateObj.document_info.description)},${getValue(invoiceDiscount)},${getValue(estimateObj.billing_info.total_vat_amount)},${getValue(estimateObj.billing_info.total_to_pay)},${getValue(estimateObj.document_info.currency)},${getValue(estimateObj.document_info.rounding_total)},${getValue(estimateObj.document_info.vat_mode)},`+
                           `${getValue(estimateObj.customer_info.number)},${getValue(estimateObj.customer_info.first_name)} ${getValue(estimateObj.customer_info.last_name)},${getValue(estimateObj.items[j].number)},${getValue(itemDescription)},${getValue(estimateObj.items[j].quantity)},${itemUnitPrice},${getValue(estimateObj.items[j].mesure_unit)},${getValue(estimateObj.items[j].unit_price.vat_rate)},${getValue(estimateObj.items[j].unit_price.vat_code)},${getValue(itemDiscount)},${getValue(itemTotal)},${getValue(estimateObj.items[j].total_vat_amount)}\n`;
                }
            }
            catch(e) {
                row.addMessage(qsTr("Estimate not valid.\nError: %1").arg(e), "RowId", "internal_error");
                rowMatched = false;
            }
        }
    }
    if (rowMatched) {
        return header + csv;
    }
    return null;
}
