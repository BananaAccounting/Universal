// @id = import_contacts.test
// @api = 1.0
// @pubdate = 2023-01-19
// @publisher = Banana.ch SA
// @description = Import contacts
// @description.de = Kontakte importieren
// @description.fr = Importer contacts
// @description.it = Importa contatti
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
// @includejs = ../import_contacts.js

// Register test case to be executed
Test.registerTestCase(new ImportContacts());

// Here we define the class, the name of the class is not important
function ImportContacts() {

}

// This method will be called at the beginning of the test case
ImportContacts.prototype.initTestCase = function() {
    this.testLogger = Test.logger;
    this.progressBar = Banana.application.progressBar;

    this.fileAC2 = "file:script/../test/testcases/import_invoices_test.ac2";
    this.csvContactsFile = "file:script/../test/testcases/contacts.csv";
    this.jsonDoc = this.initJson();
}

// This method will be called at the end of the test case
ImportContacts.prototype.cleanupTestCase = function() {

}

// This method will be called before every test method is executed
ImportContacts.prototype.init = function() {

}

// This method will be called after every test method is executed
ImportContacts.prototype.cleanup = function() {

}

ImportContacts.prototype.testImportContacts = function() {
    this.testLogger.addKeyValue("ImportContacts", "testReport");
    this.testLogger.addComment("Test Contacts import");

    let parentLogger = this.testLogger;
    this.testLogger = parentLogger.newLogger(Banana.IO.fileCompleteBaseName(this.fileAC2));

    let banDoc = Banana.application.openDocument(this.fileAC2);
    let file = Banana.IO.getLocalFile(this.csvContactsFile);

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
        let format_cnt = createFormatCnt();
        if (format_cnt.match(transactionsObjs)) {
            let format = format_cnt.convertInDocChange(transactionsObjs, this.jsonDoc);
            jsonDocArray = format;
        }
        
        let documentChange = { "format": "documentChange", "error": "","data":[]};
        documentChange["data"].push(jsonDocArray);

        return documentChange;
    }
}

ImportContacts.prototype.initJson = function() {
    let jsonDoc = {};
    jsonDoc.document = {};
    jsonDoc.document.dataUnits = [];

    jsonDoc.creator = {};
    jsonDoc.creator.executionDate = "";
    jsonDoc.creator.name = "this is a test"
    jsonDoc.creator.version = "1.0";

    return jsonDoc;
}
