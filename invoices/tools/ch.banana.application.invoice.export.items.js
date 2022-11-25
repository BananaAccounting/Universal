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
    let csv = "RowId,Description,Unit,UnitPrice\n";

    if (!itemsTable) {
        return
    }

    for (let i = 0; i < itemsTable.rowCount; i++) {
        let row = itemsTable.row(i);
        if (row) {
            try {
                let id = row.value("RowId");
                let description = row.value("Description");
                let unit = row.value("Unit");
                let unit_price = row.value("UnitPrice");
                csv += `${id},${description},${unit},${unit_price}\n`;
            }
            catch(e) {
                return null;
            }
        }
      }
      
    return csv;
}
