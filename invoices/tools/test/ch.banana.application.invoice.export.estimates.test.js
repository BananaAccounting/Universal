// @id = ch.banana.application.invoice.export.estimates.test
// @api = 1.0
// @pubdate = 2023-03-17
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.application.invoice.export.estimates.test>
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
// @includejs = ../src/ch.banana.application.invoice.export.estimates.js
// @includejs = ../src/ch.banana.application.invoice.import.estimates.js

/*
  SUMMARY
  -------
  Export estimates test, for each test:
  1. Open the specific .ac2 file
  2. Export the data in CSV formats
**/

/**
 * Tips (to delete once the test are finished)
 * 1. The test cases (*.ac2 files) should have at least 5 - 10 rows of example
 * 2. The example data should contains various cases:
 *     - Estimates with more items with different data
 *     - Estimates with missing data (mandatory or not)
 *     - Estimates with particular amounts
 * 3. A test should also be created that exports the data and imports it again, checking that the totals are equal
 * 4. For further information see API: Banana.Test
*/

// Register test case to be executed
Test.registerTestCase(new TestExportEstimates());

// Here we define the class, the name of the class is not important
function TestExportEstimates() {

}

// This method will be called at the beginning of the test case
TestExportEstimates.prototype.initTestCase = function() {
	this.testLogger = Test.logger;
	this.progressBar = Banana.application.progressBar;
	if(!this.testLogger){
		this.testLogger.addFatalError("Test logger not found");
	}
	this.fileImportAC2 = "file:script/../test/testcases/invoices_testfiles/export_import_invoices_test.ac2";
    this.csvEstimatesFile = "file:script/../test/testcases/invoices_testfiles/estimates.csv";
	this.jsonDoc = this.initJson();
}

// This method will be called at the end of the test case
TestExportEstimates.prototype.cleanupTestCase = function() {

}

// This method will be called before every test method is executed
TestExportEstimates.prototype.init = function() {

}

// This method will be called after every test method is executed
TestExportEstimates.prototype.cleanup = function() {

}

//Export Estimates without VAT
TestExportEstimates.prototype.testEstimatesWithoutVat = function(){
	//get the *ac2 file
	let fileAC2 = "file:script/../test/testcases/invoices_testfiles/invoices_without_vat_test.ac2";
	let banDoc = Banana.application.openDocument(fileAC2);
	Test.assert(banDoc, `file not found: "${fileAC2}"`);
	
	let estimatesTable = banDoc.table("Estimates");
	Test.assert(estimatesTable);
		
	banDoc.clearMessages();
	let csvData = generateCsvEstimates(estimatesTable);
	this.testLogger.addCsv('Data', csvData);
	
	let msgs = banDoc.getMessages();
	for (let i = 0; i < msgs.length; ++i) {
        let msg = msgs[i];
        this.testLogger.addKeyValue("ERROR_MSG_ROW_" + msg.rowNr, msg.message);
        this.testLogger.addKeyValue("ERROR_HELPID_ROW_" + msg.rowNr, msg.helpId);
    }
}

//Export Estimates VAT included
TestExportEstimates.prototype.testEstimatesVatIncluded = function(){
	//get the *ac2 file
	let fileAC2 = "file:script/../test/testcases/invoices_testfiles/invoices_vat_included_test.ac2";
	let banDoc = Banana.application.openDocument(fileAC2);
	Test.assert(banDoc, `file not found: "${fileAC2}"`);
	
	let estimatesTable = banDoc.table("Estimates");
	Test.assert(estimatesTable);
	
	banDoc.clearMessages();
	let csvData = generateCsvEstimates(estimatesTable);
	this.testLogger.addCsv("Data", csvData);
		
	let msgs = banDoc.getMessages();
    for (let i = 0; i < msgs.length; ++i) {
        let msg = msgs[i];
        this.testLogger.addKeyValue("ERROR_MSG_ROW_" + msg.rowNr, msg.message);
        this.testLogger.addKeyValue("ERROR_HELPID_ROW_" + msg.rowNr, msg.helpId);
    }
}

// Export Estimates VAT excluded
TestExportEstimates.prototype.testEstimatesVatExcluded = function(){
	//get the *ac2 file
	let fileAC2 = "file:script/../test/testcases/invoices_testfiles/invoices_vat_excluded_test.ac2";
	let banDoc = Banana.application.openDocument(fileAC2);
	Test.assert(banDoc, `file not found: "${fileAC2}"`);
	
	let estimatesTable = banDoc.table("Estimates");
	Test.assert(estimatesTable);
	
	banDoc.clearMessages();
	let csvData = generateCsvEstimates(estimatesTable);
	this.testLogger.addCsv("Data", csvData);
	
	let msgs = banDoc.getMessages();
    for (let i = 0; i < msgs.length; ++i) {
        let msg = msgs[i];
        this.testLogger.addKeyValue("ERROR_MSG_ROW_" + msg.rowNr, msg.message);
        this.testLogger.addKeyValue("ERROR_HELPID_ROW_" + msg.rowNr, msg.helpId);
    }
}

//Export Estimates without VAT, amounts rounded at 0.05
TestExportEstimates.prototype.testEstimatesVatExcludedAmountsRounded = function(){
	//get the *ac2 file
	let fileAC2 = "file:script/../test/testcases/invoices_testfiles/invoices_vat_excluded_amounts_rounded_test.ac2";
	let banDoc = Banana.application.openDocument(fileAC2);
	Test.assert(banDoc, `file not found: "${fileAC2}"`);
	
	let estimatesTable = banDoc.table("Estimates");
	Test.assert(estimatesTable);

	banDoc.clearMessages();
	let csvData = generateCsvEstimates(estimatesTable);
	this.testLogger.addCsv("Data", csvData);
	
	let msgs = banDoc.getMessages();
    for (let i = 0; i < msgs.length; ++i) {
        let msg = msgs[i];
        this.testLogger.addKeyValue("ERROR_MSG_ROW_" + msg.rowNr, msg.message);
        this.testLogger.addKeyValue("ERROR_HELPID_ROW_" + msg.rowNr, msg.helpId);
    }
}

//Export Estimates with particular amounts (0.0001, 333333.33,...)
TestExportEstimates.prototype.testEstimatesWithParticularAmounts = function(){
	//get the *ac2 file
	let fileAC2 = "file:script/../test/testcases/invoices_testfiles/invoices_with_particular_amounts_test.ac2";
	let banDoc = Banana.application.openDocument(fileAC2);
	Test.assert(banDoc, `file not found: "${fileAC2}"`);
	
	let estimatesTable = banDoc.table("Estimates");
	Test.assert(estimatesTable);

	banDoc.clearMessages();
	let csvData = generateCsvEstimates(estimatesTable);
	this.testLogger.addCsv("Data", csvData);
		
	let msgs = banDoc.getMessages();
    for (let i = 0; i < msgs.length; ++i) {
        let msg = msgs[i];
        this.testLogger.addKeyValue("ERROR_MSG_ROW_" + msg.rowNr, msg.message);
        this.testLogger.addKeyValue("ERROR_HELPID_ROW_" + msg.rowNr, msg.helpId);
    }
}

//Export Estimates with 1'000 with Items
TestExportEstimates.prototype.testEstimateWithThousandItems = function(){
	//get the *ac2 file
	let fileAC2 = "file:script/../test/testcases/invoices_testfiles/invoices_with_thousand_items_test.ac2";
	let banDoc = Banana.application.openDocument(fileAC2);
	Test.assert(banDoc, `file not found: "${fileAC2}"`);
	
	let estimatesTable = banDoc.table("Estimates");
	Test.assert(estimatesTable);
		
	banDoc.clearMessages();
	let csvData = generateCsvEstimates(estimatesTable);
	this.testLogger.addCsv("Data", csvData);
		
	let msgs = banDoc.getMessages();
    for (let i = 0; i < msgs.length; ++i) {
        let msg = msgs[i];
        this.testLogger.addKeyValue("ERROR_MSG_ROW_" + msg.rowNr, msg.message);
        this.testLogger.addKeyValue("ERROR_HELPID_ROW_" + msg.rowNr, msg.helpId);
    }
}

//Export Estimates with missing data
TestExportEstimates.prototype.testEstimateWithMissingData = function(){
	//get the *ac2 file
	let fileAC2 = "file:script/../test/testcases/invoices_testfiles/invoices_with_missing_data_test.ac2";
	let banDoc = Banana.application.openDocument(fileAC2);
	Test.assert(banDoc, `file not found: "${fileAC2}"`);
	
	let estimatesTable = banDoc.table("Estimates");
	Test.assert(estimatesTable);
		
	banDoc.clearMessages();
	let csvData = generateCsvEstimates(estimatesTable);
	this.testLogger.addCsv("Data", csvData);
	
	let msgs = banDoc.getMessages();
    for (let i = 0; i < msgs.length; ++i) {
        let msg = msgs[i];
        this.testLogger.addKeyValue("ERROR_MSG_ROW_" + msg.rowNr, msg.message);
        this.testLogger.addKeyValue("ERROR_HELPID_ROW_" + msg.rowNr, msg.helpId);
    }
}

//Export Estimates with missing mandatory data
TestExportEstimates.prototype.testEstimateWithMissingMandatoryData = function(){
	//get the *ac2 file
	let fileAC2 = "file:script/../test/testcases/invoices_testfiles/invoices_with_missing_mandatory_data_test.ac2";
	let banDoc = Banana.application.openDocument(fileAC2);
	Test.assert(banDoc, `file not found: "${fileAC2}"`);
	
	let estimatesTable = banDoc.table("Estimates");
	Test.assert(estimatesTable);
		
	banDoc.clearMessages();
	let csvData = generateCsvEstimates(estimatesTable);
	this.testLogger.addCsv("Data", csvData);
	
	let msgs = banDoc.getMessages();
    for (let i = 0; i < msgs.length; ++i) {
        let msg = msgs[i];
        this.testLogger.addKeyValue("ERROR_MSG_ROW_" + msg.rowNr, msg.message);
        this.testLogger.addKeyValue("ERROR_HELPID_ROW_" + msg.rowNr, msg.helpId);
    }
}

//Export Estimates with errors
TestExportEstimates.prototype.testEstimateErrors = function() {
    //get the *ac2 file
    let fileAC2 = "file:script/../test/testcases/invoices_testfiles/invoices_export_errors_test.ac2";
	let banDoc = Banana.application.openDocument(fileAC2);
    Test.assert(banDoc, `file not found: "${fileAC2}"`);

    let estimatesTable = banDoc.table("Estimates");
    Test.assert(estimatesTable);

    banDoc.clearMessages();
    let csvData = generateCsvEstimates(estimatesTable);
	this.testLogger.addCsv("Data", csvData);

    let msgs = banDoc.getMessages();
    for (let i = 0; i < msgs.length; ++i) {
        let msg = msgs[i];
        this.testLogger.addKeyValue("ERROR_MSG_ROW_" + msg.rowNr, msg.message);
        this.testLogger.addKeyValue("ERROR_HELPID_ROW_" + msg.rowNr, msg.helpId);
    }
}

// Test Export/Import 
TestExportEstimates.prototype.testExportImportInvoices = function() {
    //get the *ac2 file
    let fileAC2 = "file:script/../test/testcases/invoices_testfiles/invoices_vat_excluded_test.ac2";
	let banDoc = Banana.application.openDocument(fileAC2);
    Test.assert(banDoc, `file not found: "${fileAC2}"`);

    let estimatesTable = banDoc.table("Estimates");
    Test.assert(estimatesTable);

    banDoc.clearMessages();
    let csvData = generateCsvEstimates(estimatesTable);
	this.testLogger.addCsv("Data", csvData);

    let msgs = banDoc.getMessages();
    for (let i = 0; i < msgs.length; ++i) {
        let msg = msgs[i];
        this.testLogger.addKeyValue("ERROR_MSG_ROW_" + msg.rowNr, msg.message);
        this.testLogger.addKeyValue("ERROR_HELPID_ROW_" + msg.rowNr, msg.helpId);
    }

	// Import estimates
	let banDocImport = Banana.application.openDocument(this.fileImportAC2);
    Test.assert(banDocImport, `file not found: "${this.fileImportAC2}"`);

    let file = Banana.IO.getLocalFile(this.csvEstimatesFile);
    Test.assert(file, `file not found: "${this.csvEstimatesFile}"`);

    fileContent = file.read();

	banDocImport.clearMessages();
    let jsonDocArray = {};
    let transactions = Banana.Converter.csvToArray(fileContent, ";", '"');
    let transactions_header = transactions[0];

    transactions.splice(0, 1);
    let transactionsObjs = Banana.Converter.arrayToObject(transactions_header, transactions, true);
    let format_invs = createFormatEsts(banDocImport);
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

TestExportEstimates.prototype.initJson = function() {
    let jsonDoc = {};
    jsonDoc.document = {};
    jsonDoc.document.dataUnits = [];

    jsonDoc.creator = {};
    jsonDoc.creator.executionDate = "";
    jsonDoc.creator.name = "this is a test"
    jsonDoc.creator.version = "1.0";

    return jsonDoc;
}