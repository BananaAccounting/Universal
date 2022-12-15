// @id = ch.banana.application.invoice.export.items
// @api = 1.0
// @pubdate = 2022-10-24
// @publisher = Banana.ch SA
// @description = Export items
// @description.de = Artikeln exportieren
// @description.fr = Exporter articles
// @description.it = Esporta articoli
// @doctype = 400.400
// @docproperties =
// @task = export.file
// @exportfiletype = csv
// @exportfilename = items
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
    let itemsTable = Banana.document.table("Items");
    let csv = "RowId,Description,UnitPrice,AmountType,Unit,VatCode,VatRate,Discount\n";

    if (!itemsTable) {
        return
    }

    csv += generateCsvItems(itemsTable);
      
    return csv;
}

function getValue(column) {
    // Check if a column is empty 
    return column ? column : ''
}

function generateCsvItems(itemsTable) {
    let csv = '';
    for (let i = 0; i < itemsTable.rowCount; i++) {
        let row = itemsTable.row(i);
        if (row) {
            try {
                let id = row.value("RowId");
                let description = row.value("Description");
                let unitPrice = row.value("UnitPrice");
                let amountType = row.value("AmountType");
                let unit = row.value("Unit");
                let vatCode = row.value("VatCode");
                let vatRate = row.value("VatRate");
                let discount = row.value("Discount");
                if (!id) {
                    Banana.document.addMessage("Number is a required field");
                    return;
                } else if (!description) {
                    Banana.document.addMessage("Description is a required field");
                    return;
                } else if (!unitPrice) {
                    Banana.document.addMessage("UnitPrice is a required field");
                    return;
                }
                csv += `${getValue(id)}, \
                        ${getValue(description)}, \
                        ${getValue(unitPrice)}, \
                        ${getValue(amountType)}, \
                        ${getValue(unit)}, \
                        ${getValue(vatCode)}, \
                        ${getValue(vatRate)}, \
                        ${getValue(discount)}\n`;
            }
            catch(e) {
                Banana.document.addMessage(`An error occured while exporting the csv invoice! \nError Description: ${e}`);
            }
        }
    }
    
    return csv;
}