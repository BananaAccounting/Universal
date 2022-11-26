// @id = ch.banana.application.invoice.export.items.test
// @api = 1.0
// @pubdate = 2022-11-27
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

// Register test case to be executed
Test.registerTestCase(new ExportItems());

// Here we define the class, the name of the class is not important
function ExportItems() {

}

// This method will be called at the beginning of the test case
ExportItems.prototype.initTestCase = function() {

}

// This method will be called at the end of the test case
ExportItems.prototype.cleanupTestCase = function() {

}

// This method will be called before every test method is executed
ExportItems.prototype.init = function() {

}

// This method will be called after every test method is executed
ExportItems.prototype.cleanup = function() {

}

ExportItems.prototype.testBananaExtension = function() {

	let banDoc = Banana.application.openDocument("file:script/../test/testcases/invoices_excl_vat.ac2");
	Test.assert(banDoc);

	let itemsTable = banDoc.table("Items");

    if (!itemsTable) {
        return
    }

	let csv = "RowId,Description,Unit,UnitPrice\n";

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
    
	Test.logger.addCsv("Test 'Items'", csv);


}