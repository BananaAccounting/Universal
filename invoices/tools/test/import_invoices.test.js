// @id = import_invoices.test
// @api = 1.0
// @pubdate = 2023-01-20
// @publisher = Banana.ch SA
// @description = Import invoices
// @description.de = Rechnungen importieren
// @description.fr = Importer factures
// @description.it = Importa fatture
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
Test.registerTestCase(new TestImportInvoices());

// Here we define the class, the name of the class is not important
function TestImportInvoices() {

}

// This method will be called at the beginning of the test case
TestImportInvoices.prototype.initTestCase = function() {
    this.testLogger = Test.logger;
    this.progressBar = Banana.application.progressBar;

    this.fileAC2 = "file:script/../test/testcases/invoices_testfiles/import_invoices_test.ac2";
    this.csvInvoicesFile = "file:script/../test/testcases/invoices_testfiles/invoices.csv";
    this.jsonDoc = this.initJson();
}

// This method will be called at the end of the test case
TestImportInvoices.prototype.cleanupTestCase = function() {

}

// This method will be called before every test method is executed
TestImportInvoices.prototype.init = function() {

}

// This method will be called after every test method is executed
TestImportInvoices.prototype.cleanup = function() {

}

TestImportInvoices.prototype.testImportInvoices = function() {
    this.testLogger.addKeyValue("ImportInvoices", "testReport");
    this.testLogger.addComment("Test Invoices import");

    let banDoc = Banana.application.openDocument(this.fileAC2);
    Test.assert(banDoc, `file not found: "${this.fileAC2}"`);

    let file = Banana.IO.getLocalFile(this.csvInvoicesFile);
    Test.assert(file, `file not found: "${this.csvInvoicesFile}"`);

    fileContent = file.read();
   
    banDoc.clearMessages();
    let jsonDocArray = {};
    let transactions = Banana.Converter.csvToArray(fileContent, ";", '"');
    let transactions_header = transactions[0];

    transactions.splice(0, 1);
    let transactionsObjs = Banana.Converter.arrayToObject(transactions_header, transactions, true);
    let format_invs = createFormatInvs(banDoc);
    if (format_invs.match(transactionsObjs)) {
        let format = format_invs.convertInDocChange(transactionsObjs, this.jsonDoc);
        jsonDocArray = format;
    }
    
    let documentChange = { "format": "documentChange", "error": "","data":[]};
    documentChange["data"].push(jsonDocArray);

    let msgs = banDoc.getMessages();
    for (let i = 0; i < msgs.length; ++i) {
        let msg = msgs[i];
        this.testLogger.addKeyValue("ERROR_MSG_ROW_" + msg.rowNr, msg.message);
        this.testLogger.addKeyValue("ERROR_HELPID_ROW_" + msg.rowNr, msg.helpId);
    }

    return documentChange;
    
}

TestImportInvoices.prototype.initJson = function() {
    let jsonDoc = {};
    jsonDoc.document = {};
    jsonDoc.document.dataUnits = [];

    jsonDoc.creator = {};
    jsonDoc.creator.executionDate = "";
    jsonDoc.creator.name = "this is a test"
    jsonDoc.creator.version = "1.0";

    return jsonDoc;
}
