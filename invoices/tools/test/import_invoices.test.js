// @id = import_items.test
// @api = 1.0
// @pubdate = 2023-01-20
// @publisher = Banana.ch SA
// @description = Import items
// @description.de = Artikeln importieren
// @description.fr = Importer articles
// @description.it = Importa articoli
// @doctype = 400.400
// @docproperties =
// @task = import.rows
// @outputformat = transactions.simple
// @inputdatasource = openfiledialog
// @inputencoding = utf8
// @inputfilefilter = Text file (*.csv);;All files (*.*)
// @inputfilefilter.de = Text datei (*.csv);;All files (*.*)
// @inputfilefilter.fr = Fichier text(*.csv);;All files (*.*)
// @inputfilefilter.it = File testo (*.csv);;All files (*.*)
// @includejs = ../src/import_invoices.js

// Register test case to be executed
Test.registerTestCase(new ImportInvoices());

// Here we define the class, the name of the class is not important
function ImportInvoices() {

}

// This method will be called at the beginning of the test case
ImportInvoices.prototype.initTestCase = function() {
    this.testLogger = Test.logger;
    this.progressBar = Banana.application.progressBar;

    this.fileAC2 = "file:script/../test/testcases/import_invoices_test.ac2";
    this.csvItemsFile = "file:script/../test/testcases/items.csv";
    this.jsonDoc = this.initJson();
}

// This method will be called at the end of the test case
ImportInvoices.prototype.cleanupTestCase = function() {

}

// This method will be called before every test method is executed
ImportInvoices.prototype.init = function() {

}

// This method will be called after every test method is executed
ImportInvoices.prototype.cleanup = function() {

}

ImportInvoices.prototype.testImportItems = function() {
    this.testLogger.addKeyValue("ImportInvoices", "testReport");
    this.testLogger.addComment("Test Invoices import");

    let banDoc = Banana.application.openDocument(this.fileAC2);
    let file = Banana.IO.getLocalFile(this.csvItemsFile);

    if (file) {
        fileContent = file.read();
    } else {
        this.testLogger.addFatalError("File not found: " + fileContent);
    }

    if (banDoc) {
        let jsonDocArray = {};
        let transactions = Banana.Converter.csvToArray(fileContent, ";", '"');
        let transactions_header = transactions[0];

        transactions.splice(0, 1);
        let transactionsObjs = Banana.Converter.arrayToObject(transactions_header, transactions, true);
        let format_itm = createFormatItm();
        if (format_itm.match(transactionsObjs)) {
            let format = format_itm.convertInDocChange(transactionsObjs, this.jsonDoc);
            jsonDocArray = format;
        }
        
        let documentChange = { "format": "documentChange", "error": "","data":[]};
        documentChange["data"].push(jsonDocArray);

        return documentChange;
    }
}

ImportInvoices.prototype.initJson = function() {
    let jsonDoc = {};
    jsonDoc.document = {};
    jsonDoc.document.dataUnits = [];

    jsonDoc.creator = {};
    jsonDoc.creator.executionDate = "";
    jsonDoc.creator.name = "this is a test"
    jsonDoc.creator.version = "1.0";

    return jsonDoc;
}