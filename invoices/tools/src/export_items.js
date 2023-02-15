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
    let csv = "";

    if (!itemsTable) {
        return
    }

    let itemsData = generateCsvItems(itemsTable, false);

    if (!itemsData) 
        return "";
    
    csv += itemsData;
      
    return csv;
}

function getValue(column) {
    // Check if a column is empty 
    return column ? column : ''
}

function generateCsvItems(itemsTable, isTest) {
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
                    if (!isTest) 
                        row.addMessage(qsTr("RowId is a required field"), id);
                    else
                        Test.logger.addText("RowId is a required field");
                    rowMatched = false;
                } if (!description) {
                    if (!isTest)
                        row.addMessage(qsTr("Description is a required field"), description);
                    else
                        Test.logger.addText("Description is a required field");
                    rowMatched = false;
                } else if (!unitPrice) {
                    if (!isTest)
                        row.addMessage(qsTr("UnitPrice is a required field"), unitPrice);
                    else
                        Test.logger.addText("UnitPrice is a required field");
                    rowMatched = false;
                }
                csv += `${getValue(id)},${getValue(description)},${getValue(unitPrice)},${getValue(amountType)},${getValue(unit)},${getValue(vatCode)},${getValue(vatRate)},${getValue(discount)}\n`;
            }
            catch(e) {
                Banana.document.addMessage(qsTr("An error occured while exporting the csv items! ") + "\n" + qsTr("Error Description: ") + e);
            }
        }
    }

    if (rowMatched) {
        return header + csv;
    } else {
        if (!isTest)
            Banana.document.addMessage(qsTr("Complete the missing details first, as listed in the message pane below."));
        else
            Test.logger.addText("Complete the missing details first, as listed above.");
        return "";
        
    }
}
