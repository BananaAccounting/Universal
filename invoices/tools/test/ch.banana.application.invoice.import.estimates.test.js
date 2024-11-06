// @id = ch.banana.application.invoice.import.estimates.test
// @api = 1.0
// @pubdate = 2023-06-04
// @publisher = Banana.ch SA
// @description = // @description = <TEST ch.banana.application.invoice.import.estimates.test>
// @doctype = 400.400
// @docproperties =
// @task = import.rows
// @outputformat = transactions.simple
// @inputdatasource = openfiledialog
// @inputencoding = utf8
// @inputfilefilter = Text file (*.csv);;All files (*.*)
// @includejs = ../src/ch.banana.application.invoice.import.estimates.js

// Register test case to be executed
Test.registerTestCase(new TestImportEstimates());

// Here we define the class, the name of the class is not important
function TestImportEstimates() {

}

// This method will be called at the beginning of the test case
TestImportEstimates.prototype.initTestCase = function() {
    this.testLogger = Test.logger;
    this.progressBar = Banana.application.progressBar;

    this.fileAC2 = "file:script/../test/testcases/invoices_testfiles/import_invoices_test.ac2";
    this.csvInvoicesFile = "file:script/../test/testcases/invoices_testfiles/invoices.csv";
    this.csvInvoicesFileWithMissingData = "file:script/../test/testcases/invoices_testfiles/invoices_with_missing_data.csv";
    this.jsonDoc = this.initJson();
}

// This method will be called at the end of the test case
TestImportEstimates.prototype.cleanupTestCase = function() {

}

// This method will be called before every test method is executed
TestImportEstimates.prototype.init = function() {

}

// This method will be called after every test method is executed
TestImportEstimates.prototype.cleanup = function() {

}

TestImportEstimates.prototype.testImportEstimates = function() {
    this.testLogger.addKeyValue("ImportEstimates", "testReport");
    this.testLogger.addComment("Test Estimates import");

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
    let format_ests = createFormatEsts(banDoc);
    if (format_ests.match(transactionsObjs)) {
        let format = format_ests.convertInDocChange(transactionsObjs, this.jsonDoc);
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

TestImportEstimates.prototype.testImportEstimatesWithMissingData = function() {
    this.testLogger.addKeyValue("ImportEstimates", "testReport");
    this.testLogger.addComment("Test Estimates import: missing data");

    let banDoc = Banana.application.openDocument(this.fileAC2);
    Test.assert(banDoc, `file not found: "${this.fileAC2}"`);

    let file = Banana.IO.getLocalFile(this.csvInvoicesFileWithMissingData);
    Test.assert(file, `file not found: "${this.csvInvoicesFileWithMissingData}"`);

    fileContent = file.read();
   
    banDoc.clearMessages();
    let jsonDocArray = {};
    let transactions = Banana.Converter.csvToArray(fileContent, ";", '"');
    let transactions_header = transactions[0];

    transactions.splice(0, 1);
    let transactionsObjs = Banana.Converter.arrayToObject(transactions_header, transactions, true);
    let format_ests = createFormatEsts(banDoc);
    if (format_ests.match(transactionsObjs)) {
        let format = format_ests.convertInDocChange(transactionsObjs, this.jsonDoc);
        jsonDocArray = format;
    }
    let msgs = banDoc.getMessages();

    let documentChange = { "format": "documentChange", "error": "","data":[]};
    documentChange["data"].push(jsonDocArray);

    for (let i = 0; i < msgs.length; ++i) {
        let msg = msgs[i];
        this.testLogger.addKeyValue("ERROR_MSG_ROW_" + msg.rowNr, msg.message);
        this.testLogger.addKeyValue("ERROR_HELPID_ROW_" + msg.rowNr, msg.helpId);
    }

    return documentChange;
    
}

TestImportEstimates.prototype.initJson = function() {
    let jsonDoc = {};
    jsonDoc.document = {};
    jsonDoc.document.dataUnits = [];

    jsonDoc.creator = {};
    jsonDoc.creator.executionDate = "";
    jsonDoc.creator.name = "this is a test"
    jsonDoc.creator.version = "1.0";

    return jsonDoc;
}
