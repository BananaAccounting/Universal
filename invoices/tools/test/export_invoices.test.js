// @id = export_invoices.test
// @api = 1.0
// @pubdate = 2023-02-08
// @publisher = Banana.ch SA
// @description = <TEST export_invoices.test>
// @doctype = *.*
// @outputformat = none
// @inputdataform = none
// @task = app.command
// @timeout = -1
// @includejs = ../export_invoices.js

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
	if(!this.testLogger){
		this.testLogger.addFatalError("Test logger not found");
	}
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
	//create a new logger to split the result of this test on a different file.
	let parentLogger = this.testLogger;
	this.testLogger = parentLogger.newLogger(Banana.IO.fileCompleteBaseName(fileAC2));
	if (banDoc) {
		let invoicesTable = banDoc.table("Invoices");
		if (invoicesTable){
			let csvData = "";
			csvData += generateCsvInvoices(invoicesTable, true);
			this.testLogger.addCsv('Data',csvData);
		} else {
			this.testLogger.addFatalError("Invoices table not found !");
		}
	} else {
		this.testLogger.addFatalError("File not found: " + fileAC2);
	}
}

//Export Invoices VAT included
TestExportInvoices.prototype.testInvoicesVatIncluded = function(){
	//get the *ac2 file
	let fileAC2 = "file:script/../test/testcases/invoices_testfiles/invoices_vat_included_test.ac2";
	let banDoc = Banana.application.openDocument(fileAC2);
	//create a new logger to split the result of this test on a different file.
	let parentLogger = this.testLogger;
	this.testLogger = parentLogger.newLogger(Banana.IO.fileCompleteBaseName(fileAC2));
	if (banDoc) {
		let invoicesTable = banDoc.table("Invoices");
		if (invoicesTable){
			let csvData = "";
			csvData += generateCsvInvoices(invoicesTable, true);
			this.testLogger.addCsv("Data",csvData);
		} else {
			this.testLogger.addFatalError("Invoices table not found !");
		}
	} else {
		this.testLogger.addFatalError("File not found: " + fileAC2);
	}
}

// Export Invoices VAT excluded
TestExportInvoices.prototype.testInvoicesVatExcluded = function(){
	//get the *ac2 file
	let fileAC2 = "file:script/../test/testcases/invoices_testfiles/invoices_vat_excluded_test.ac2";
	let banDoc = Banana.application.openDocument(fileAC2);
	//create a new logger to split the result of this test on a different file.
	let parentLogger = this.testLogger;
	this.testLogger = parentLogger.newLogger(Banana.IO.fileCompleteBaseName(fileAC2));
	if (banDoc) {
		let invoicesTable = banDoc.table("Invoices");
		if (invoicesTable){
			let csvData = "";
			csvData += generateCsvInvoices(invoicesTable, true);
			this.testLogger.addCsv("Data",csvData);
		} else {
			this.testLogger.addFatalError("Invoices table not found !");
		}
	} else {
		this.testLogger.addFatalError("File not found: " + fileAC2);
	}
}

//Export Invoices without VAT, amounts rounded at 0.05
TestExportInvoices.prototype.testInvoicesVatExcludedAmountsRounded = function(){
	//get the *ac2 file
	let fileAC2 = "file:script/../test/testcases/invoices_testfiles/invoices_vat_excluded_amounts_rounded_test.ac2";
	let banDoc = Banana.application.openDocument(fileAC2);
	//create a new logger to split the result of this test on a different file.
	let parentLogger = this.testLogger;
	this.testLogger = parentLogger.newLogger(Banana.IO.fileCompleteBaseName(fileAC2));
	if (banDoc) {
		let invoicesTable = banDoc.table("Invoices");
		if (invoicesTable){
			let csvData = "";
			csvData += generateCsvInvoices(invoicesTable, true);
			this.testLogger.addCsv("Data",csvData);
		} else {
			this.testLogger.addFatalError("Invoices table not found !");
		}
	} else {
		this.testLogger.addFatalError("File not found: " + fileAC2);
	}
}

//Export Invoices with particular amounts (0.0001, 333333.33,...)
TestExportInvoices.prototype.testInvoicesWithParticularAmounts = function(){
	//get the *ac2 file
	let fileAC2 = "file:script/../test/testcases/invoices_testfiles/invoices_with_particular_amounts_test.ac2";
	let banDoc = Banana.application.openDocument(fileAC2);
	//create a new logger to split the result of this test on a different file.
	let parentLogger = this.testLogger;
	this.testLogger = parentLogger.newLogger(Banana.IO.fileCompleteBaseName(fileAC2));
	if (banDoc) {
		let invoicesTable = banDoc.table("Invoices");
		if (invoicesTable){
			let csvData = "";
			csvData += generateCsvInvoices(invoicesTable, true);
			this.testLogger.addCsv("Data",csvData);
		} else {
			this.testLogger.addFatalError("Invoices table not found !");
		}
	} else {
		this.testLogger.addFatalError("File not found: " + fileAC2);
	}
}

//Export Invoices with 1'000 with Items
TestExportInvoices.prototype.testInvoiceWithThousandItems = function(){
	//get the *ac2 file
	let fileAC2 = "file:script/../test/testcases/invoices_testfiles/invoices_with_thousand_items.ac2";
	let banDoc = Banana.application.openDocument(fileAC2);
	//create a new logger to split the result of this test on a different file.
	let parentLogger = this.testLogger;
	this.testLogger = parentLogger.newLogger(Banana.IO.fileCompleteBaseName(fileAC2));
	if (banDoc) {
		let invoicesTable = banDoc.table("Invoices");
		let itemsTable = banDoc.table("Items");
		if (invoicesTable && itemsTable){
			let csvData = "";
			csvData += generateCsvInvoices(invoicesTable, true);
			this.testLogger.addCsv("Data",csvData);
		} else {
			this.testLogger.addFatalError("Invoice or Items table not found !");
		}
	} else {
		this.testLogger.addFatalError("File not found: " + fileAC2);
	}
}

//Export Invoices with missing data
TestExportInvoices.prototype.testInvoiceWithMissingData = function(){
	//get the *ac2 file
	let fileAC2 = "file:script/../test/testcases/invoices_testfiles/invoices_with_missing_data_test.ac2";
	let banDoc = Banana.application.openDocument(fileAC2);
	//create a new logger to split the result of this test on a different file.
	let parentLogger = this.testLogger;
	this.testLogger = parentLogger.newLogger(Banana.IO.fileCompleteBaseName(fileAC2));
	if (banDoc) {
		let invoicesTable = banDoc.table("Invoices");
		let itemsTable = banDoc.table("Items");
		if (invoicesTable && itemsTable){
			let csvData = "";
			csvData += generateCsvInvoices(invoicesTable, true);
			this.testLogger.addCsv("Data",csvData);
		} else {
			this.testLogger.addFatalError("Invoice or Items table not found !");
		}
	} else {
		this.testLogger.addFatalError("File not found: " + fileAC2);
	}
}

//Export Invoices with missing mandatory data
TestExportInvoices.prototype.testInvoiceWithMissingMandatoryData = function(){
	//get the *ac2 file
	let fileAC2 = "file:script/../test/testcases/invoices_testfiles/invoices_with_missing_mandatory_data_test.ac2";
	let banDoc = Banana.application.openDocument(fileAC2);
	//create a new logger to split the result of this test on a different file.
	let parentLogger = this.testLogger;
	this.testLogger = parentLogger.newLogger(Banana.IO.fileCompleteBaseName(fileAC2));
	if (banDoc) {
		let invoicesTable = banDoc.table("Invoices");
		let itemsTable = banDoc.table("Items");
		if (invoicesTable && itemsTable){
			let csvData = "";
			csvData += generateCsvInvoices(invoicesTable, true);
			this.testLogger.addCsv("Data",csvData);
		} else {
			this.testLogger.addFatalError("Invoice or Items table not found !");
		}
	} else {
		this.testLogger.addFatalError("File not found: " + fileAC2);
	}
}