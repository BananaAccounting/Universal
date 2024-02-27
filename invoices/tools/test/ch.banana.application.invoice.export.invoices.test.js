// @id = ch.banana.application.invoice.export.invoices.test
// @api = 1.0
// @pubdate = 2023-02-08
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.application.invoice.export.invoices.test>
// @doctype = *.*
// @outputformat = none
// @inputdataform = none
// @task = app.command
// @timeout = -1
// @task = import.rows
// @outputformat = transactions.simple
// @inputdatasource = openfiledialog
// @inputencoding = utf8
// @inputfilefilter = Text file (*.csv);;All files (*.*)
// @inputfilefilter.de = Text datei (*.csv);;All files (*.*)
// @inputfilefilter.fr = Fichier text(*.csv);;All files (*.*)
// @inputfilefilter.it = File testo (*.csv);;All files (*.*)
// @includejs = ../src/ch.banana.application.invoice.export.invoices.js
// @includejs = ../src/ch.banana.application.invoice.import.invoices.js
/*
  SUMMARY
  -------
  Export invoices test, for each test:
  1. Open the specific .ac2 file
  2. Export the data in CSV formats
**/

/**
 * Tips (to delete once the test are finished)
 * 1. The test cases (*.ac2 files) should have at least 5 - 10 rows of example
 * 2. The example data should contains various cases:
 *     - Invoices with more items with different data
 *     - Invoices with missing data (mandatory or not)
 *     - Invoices with particular amounts
 * 3. A test should also be created that exports the data and imports it again, checking that the totals are equal
 * 4. For further information see API: Banana.Test
*/

// Register test case to be executed
Test.registerTestCase(new TestExportInvoices());

// Here we define the class, the name of the class is not important
function TestExportInvoices() {

}

// This method will be called at the beginning of the test case
TestExportInvoices.prototype.initTestCase = function() {
	this.testLogger = Test.logger;
	this.progressBar = Banana.application.progressBar;
	if(!this.testLogger){
		this.testLogger.addFatalError("Test logger not found");
	}
	this.fileImportAC2 = "file:script/../test/testcases/invoices_testfiles/export_import_invoices_test.ac2";
    this.csvInvoicesFile = "file:script/../test/testcases/invoices_testfiles/invoices.csv";
	this.jsonDoc = this.initJson();
}

// This method will be called at the end of the test case
TestExportInvoices.prototype.cleanupTestCase = function() {

}

// This method will be called before every test method is executed
TestExportInvoices.prototype.init = function() {

}

// This method will be called after every test method is executed
TestExportInvoices.prototype.cleanup = function() {

}

//Export Invoices without VAT
TestExportInvoices.prototype.testInvoicesWithoutVat = function(){
	//get the *ac2 file
	let fileAC2 = "file:script/../test/testcases/invoices_testfiles/invoices_without_vat_test.ac2";
	let banDoc = Banana.application.openDocument(fileAC2);
	Test.assert(banDoc, `file not found: "${fileAC2}"`);
	
	let invoicesTable = banDoc.table("Invoices");
	Test.assert(invoicesTable);
		
	banDoc.clearMessages();
	let csvData = generateCsvInvoices(invoicesTable);
	this.testLogger.addCsv('Data',csvData);
	
	let msgs = banDoc.getMessages();
	for (let i = 0; i < msgs.length; ++i) {
        let msg = msgs[i];
        this.testLogger.addKeyValue("ERROR_MSG_ROW_" + msg.rowNr, msg.message);
        this.testLogger.addKeyValue("ERROR_HELPID_ROW_" + msg.rowNr, msg.helpId);
    }
}

//Export Invoices VAT included
TestExportInvoices.prototype.testInvoicesVatIncluded = function(){
	//get the *ac2 file
	let fileAC2 = "file:script/../test/testcases/invoices_testfiles/invoices_vat_included_test.ac2";
	let banDoc = Banana.application.openDocument(fileAC2);
	Test.assert(banDoc, `file not found: "${fileAC2}"`);
	
	let invoicesTable = banDoc.table("Invoices");
	Test.assert(invoicesTable);
	
	banDoc.clearMessages();
	let csvData = generateCsvInvoices(invoicesTable);
	this.testLogger.addCsv("Data", csvData);
		
	let msgs = banDoc.getMessages();
    for (let i = 0; i < msgs.length; ++i) {
        let msg = msgs[i];
        this.testLogger.addKeyValue("ERROR_MSG_ROW_" + msg.rowNr, msg.message);
        this.testLogger.addKeyValue("ERROR_HELPID_ROW_" + msg.rowNr, msg.helpId);
    }
}

// Export Invoices VAT excluded
TestExportInvoices.prototype.testInvoicesVatExcluded = function(){
	//get the *ac2 file
	let fileAC2 = "file:script/../test/testcases/invoices_testfiles/invoices_vat_excluded_test.ac2";
	let banDoc = Banana.application.openDocument(fileAC2);
	Test.assert(banDoc, `file not found: "${fileAC2}"`);
	
	let invoicesTable = banDoc.table("Invoices");
	Test.assert(invoicesTable);
	
	banDoc.clearMessages();
	let csvData = generateCsvInvoices(invoicesTable);
	this.testLogger.addCsv("Data", csvData);
	
	let msgs = banDoc.getMessages();
    for (let i = 0; i < msgs.length; ++i) {
        let msg = msgs[i];
        this.testLogger.addKeyValue("ERROR_MSG_ROW_" + msg.rowNr, msg.message);
        this.testLogger.addKeyValue("ERROR_HELPID_ROW_" + msg.rowNr, msg.helpId);
    }
}

//Export Invoices without VAT, amounts rounded at 0.05
TestExportInvoices.prototype.testInvoicesVatExcludedAmountsRounded = function(){
	//get the *ac2 file
	let fileAC2 = "file:script/../test/testcases/invoices_testfiles/invoices_vat_excluded_amounts_rounded_test.ac2";
	let banDoc = Banana.application.openDocument(fileAC2);
	Test.assert(banDoc, `file not found: "${fileAC2}"`);
	
	let invoicesTable = banDoc.table("Invoices");
	Test.assert(invoicesTable);

	banDoc.clearMessages();
	let csvData = generateCsvInvoices(invoicesTable);
	this.testLogger.addCsv("Data", csvData);
	
	let msgs = banDoc.getMessages();
    for (let i = 0; i < msgs.length; ++i) {
        let msg = msgs[i];
        this.testLogger.addKeyValue("ERROR_MSG_ROW_" + msg.rowNr, msg.message);
        this.testLogger.addKeyValue("ERROR_HELPID_ROW_" + msg.rowNr, msg.helpId);
    }
}

//Export Invoices with particular amounts (0.0001, 333333.33,...)
TestExportInvoices.prototype.testInvoicesWithParticularAmounts = function(){
	//get the *ac2 file
	let fileAC2 = "file:script/../test/testcases/invoices_testfiles/invoices_with_particular_amounts_test.ac2";
	let banDoc = Banana.application.openDocument(fileAC2);
	Test.assert(banDoc, `file not found: "${fileAC2}"`);
	
	let invoicesTable = banDoc.table("Invoices");
	Test.assert(invoicesTable);

	banDoc.clearMessages();
	let csvData = generateCsvInvoices(invoicesTable);
	this.testLogger.addCsv("Data", csvData);
		
	let msgs = banDoc.getMessages();
    for (let i = 0; i < msgs.length; ++i) {
        let msg = msgs[i];
        this.testLogger.addKeyValue("ERROR_MSG_ROW_" + msg.rowNr, msg.message);
        this.testLogger.addKeyValue("ERROR_HELPID_ROW_" + msg.rowNr, msg.helpId);
    }
}

//Export Invoices with 1'000 with Items
TestExportInvoices.prototype.testInvoiceWithThousandItems = function(){
	//get the *ac2 file
	let fileAC2 = "file:script/../test/testcases/invoices_testfiles/invoices_with_thousand_items_test.ac2";
	let banDoc = Banana.application.openDocument(fileAC2);
	Test.assert(banDoc, `file not found: "${fileAC2}"`);
	
	let invoicesTable = banDoc.table("Invoices");
	Test.assert(invoicesTable);
		
	banDoc.clearMessages();
	let csvData = generateCsvInvoices(invoicesTable);
	this.testLogger.addCsv("Data", csvData);
		
	let msgs = banDoc.getMessages();
    for (let i = 0; i < msgs.length; ++i) {
        let msg = msgs[i];
        this.testLogger.addKeyValue("ERROR_MSG_ROW_" + msg.rowNr, msg.message);
        this.testLogger.addKeyValue("ERROR_HELPID_ROW_" + msg.rowNr, msg.helpId);
    }
}

//Export Invoices with missing data
TestExportInvoices.prototype.testInvoiceWithMissingData = function(){
	//get the *ac2 file
	let fileAC2 = "file:script/../test/testcases/invoices_testfiles/invoices_with_missing_data_test.ac2";
	let banDoc = Banana.application.openDocument(fileAC2);
	Test.assert(banDoc, `file not found: "${fileAC2}"`);
	
	let invoicesTable = banDoc.table("Invoices");
	Test.assert(invoicesTable);
		
	banDoc.clearMessages();
	let csvData = generateCsvInvoices(invoicesTable);
	this.testLogger.addCsv("Data", csvData);
	
	let msgs = banDoc.getMessages();
    for (let i = 0; i < msgs.length; ++i) {
        let msg = msgs[i];
        this.testLogger.addKeyValue("ERROR_MSG_ROW_" + msg.rowNr, msg.message);
        this.testLogger.addKeyValue("ERROR_HELPID_ROW_" + msg.rowNr, msg.helpId);
    }
}

//Export Invoices with missing mandatory data
TestExportInvoices.prototype.testInvoiceWithMissingMandatoryData = function(){
	//get the *ac2 file
	let fileAC2 = "file:script/../test/testcases/invoices_testfiles/invoices_with_missing_mandatory_data_test.ac2";
	let banDoc = Banana.application.openDocument(fileAC2);
	Test.assert(banDoc, `file not found: "${fileAC2}"`);
	
	let invoicesTable = banDoc.table("Invoices");
	Test.assert(invoicesTable);
		
	banDoc.clearMessages();
	let csvData = generateCsvInvoices(invoicesTable);
	this.testLogger.addCsv("Data", csvData);
	
	let msgs = banDoc.getMessages();
    for (let i = 0; i < msgs.length; ++i) {
        let msg = msgs[i];
        this.testLogger.addKeyValue("ERROR_MSG_ROW_" + msg.rowNr, msg.message);
        this.testLogger.addKeyValue("ERROR_HELPID_ROW_" + msg.rowNr, msg.helpId);
    }
}

//Export Invoices with 1'000 with Items
TestExportInvoices.prototype.testInvoiceErrors = function() {
    //get the *ac2 file
    let fileAC2 = "file:script/../test/testcases/invoices_testfiles/invoices_export_errors_test.ac2";
	let banDoc = Banana.application.openDocument(fileAC2);
    Test.assert(banDoc, `file not found: "${fileAC2}"`);

    let invoicesTable = banDoc.table("Invoices");
    Test.assert(invoicesTable);

    banDoc.clearMessages();
    let csvData = generateCsvInvoices(invoicesTable);
	this.testLogger.addCsv("Data", csvData);

    let msgs = banDoc.getMessages();
    for (let i = 0; i < msgs.length; ++i) {
        let msg = msgs[i];
        this.testLogger.addKeyValue("ERROR_MSG_ROW_" + msg.rowNr, msg.message);
        this.testLogger.addKeyValue("ERROR_HELPID_ROW_" + msg.rowNr, msg.helpId);
    }
}

// Test Export/Import 
TestExportInvoices.prototype.testExportImportInvoices = function() {
    //get the *ac2 file
    let fileAC2 = "file:script/../test/testcases/invoices_testfiles/invoices_vat_excluded_test.ac2";
	let banDoc = Banana.application.openDocument(fileAC2);
    Test.assert(banDoc, `file not found: "${fileAC2}"`);

    let invoicesTable = banDoc.table("Invoices");
    Test.assert(invoicesTable);

    banDoc.clearMessages();
    let csvData = generateCsvInvoices(invoicesTable);
	this.testLogger.addCsv("Data", csvData);

    let msgs = banDoc.getMessages();
    for (let i = 0; i < msgs.length; ++i) {
        let msg = msgs[i];
        this.testLogger.addKeyValue("ERROR_MSG_ROW_" + msg.rowNr, msg.message);
        this.testLogger.addKeyValue("ERROR_HELPID_ROW_" + msg.rowNr, msg.helpId);
    }

	// Import
	let banDocImport = Banana.application.openDocument(this.fileImportAC2);
    Test.assert(banDocImport, `file not found: "${this.fileImportAC2}"`);

    let file = Banana.IO.getLocalFile(this.csvInvoicesFile);
    Test.assert(file, `file not found: "${this.csvInvoicesFile}"`);

    fileContent = file.read();

	banDocImport.clearMessages();
    let jsonDocArray = {};
    let transactions = Banana.Converter.csvToArray(fileContent, ";", '"');
    let transactions_header = transactions[0];

    transactions.splice(0, 1);
    let transactionsObjs = Banana.Converter.arrayToObject(transactions_header, transactions, true);
    let format_invs = createFormatInvs(banDocImport);
    if (format_invs.match(transactionsObjs)) {
        let format = format_invs.convertInDocChange(transactionsObjs, this.jsonDoc);
        jsonDocArray = format;
    }
    
    let documentChange = { "format": "documentChange", "error": "","data":[]};
    documentChange["data"].push(jsonDocArray);

    let msgs_i = banDocImport.getMessages();
    for (let i = 0; i < msgs.length; ++i) {
        let msg = msgs_i[i];
        this.testLogger.addKeyValue("ERROR_MSG_ROW_" + msg.rowNr, msg.message);
        this.testLogger.addKeyValue("ERROR_HELPID_ROW_" + msg.rowNr, msg.helpId);
    }

    return documentChange;
}

TestExportInvoices.prototype.initJson = function() {
    let jsonDoc = {};
    jsonDoc.document = {};
    jsonDoc.document.dataUnits = [];

    jsonDoc.creator = {};
    jsonDoc.creator.executionDate = "";
    jsonDoc.creator.name = "this is a test"
    jsonDoc.creator.version = "1.0";

    return jsonDoc;
}