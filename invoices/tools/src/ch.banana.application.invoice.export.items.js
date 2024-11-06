// @id = ch.banana.application.invoice.tools
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

    if (!itemsTable) {
        return "";
    }

    let itemsData = generateCsvItems(itemsTable);

    if (!itemsData) {
        Banana.application.showMessages(true); // Be sure the user is notified
        Banana.document.addMessage(qsTr("Fix errors first, as listed in the pane Messages."), "internal_error");
        return "";
    }
    return itemsData;
}

function getValue(column) {
    // Check if a column is empty 
    return column ? column : ''
}

function generateCsvItems(itemsTable) {
    let header = "RowId,Description,UnitPrice,AmountType,Unit,VatCode,VatRate,Discount\n";
    let csv = '';
    let rowMatched = true;
    for (let i = 0; i < itemsTable.rowCount; i++) {
        let row = itemsTable.row(i);
        if (!row.isEmpty) {
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
                    row.addMessage(qsTr("%1 is a required field").arg("RowId"), "RowId", "missing_field");
                    rowMatched = false;
                } if (!description) {
                    row.addMessage(qsTr("%1 is a required field").arg("Description"), "Description", "missing_field");
                    rowMatched = false;
                } else if (!unitPrice) {
                    row.addMessage(qsTr("%1 is a required field").arg("UnitPrice"), "UnitPrice", "missing_field");
                    rowMatched = false;
                }
                csv += `${getValue(id)},${getValue(description)},${getValue(unitPrice)},${getValue(amountType)},${getValue(unit)},${getValue(vatCode)},${getValue(vatRate)},${getValue(discount)}\n`;
            }
            catch(e) {
                row.addMessage(qsTr("Item not valid.\nError: %1").arg(e), "RowId", "internal_error");
                rowMatched = false;
            }
        }
    }

    if (rowMatched) {
        return header + csv;
    } 
    return null;
}
