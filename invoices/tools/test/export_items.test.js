// @id = export_items.test
// @api = 1.0
// @pubdate = 2023-02-08
// @publisher = Banana.ch SA
// @description = <TEST export_items.test>
// @doctype = *.*
// @outputformat = none
// @inputdataform = none
// @task = app.command
// @timeout = -1
// @includejs = ../src/export_items.js

/*
  SUMMARY
  -------
  Export items test, for each test:
  1. Open the specific .ac2 file
  2. Export the data in CSV formats
  3. Add the exported data to the text logger as new sub section.
**/

/**
 * Tips (to delete once the test are finished)
 * 1. The test cases (*.ac2 files) should have at least 5 - 10 rows of example
 * 2. The example data should contains various cases:
 *     - Items with missing data (mandatory or not)
 * 3. A test should also be created that exports the data and imports it again, checking that the totals are equal
 * 4. For further information see API: Banana.Test
*/

// Register test case to be executed
Test.registerTestCase(new TestExportItems());

// Here we define the class, the name of the class is not important
function TestExportItems() {

}

// This method will be called at the beginning of the test case
TestExportItems.prototype.initTestCase = function() {
	this.testLogger = Test.logger;
	if(!this.testLogger){
		this.testLogger.addFatalError("Test logger not found");
	}
}

// This method will be called at the end of the test case
TestExportItems.prototype.cleanupTestCase = function() {

}

// This method will be called before every test method is executed
TestExportItems.prototype.init = function() {
}

// This method will be called after every test method is executed
TestExportItems.prototype.cleanup = function() {

}

//Export Items with complete data
TestExportItems.prototype.testItemsWithCompleteData = function(){
	
	//get the *ac2 file
	let fileAC2 = "file:script/../test/testcases/items_testfiles/items_complete_data_test.ac2";
	let banDoc = Banana.application.openDocument(fileAC2);
	//create a new logger to split the result of this test on a different file.
	let parentLogger = this.testLogger;
	this.testLogger = parentLogger.newLogger(Banana.IO.fileCompleteBaseName(fileAC2));
	if (banDoc) {
		let itemsTable = banDoc.table("Items");
		if (itemsTable){
			let csvData = "";
			csvData += generateCsvItems(itemsTable);
			this.testLogger.addCsv("Data",csvData);
		} else {
			this.testLogger.addFatalError("Items table not found !");
		}
	} else {
		this.testLogger.addFatalError("File not found: " + fileAC2);
	}
}

//Export Items with missing Data
TestExportItems.prototype.testItemsWithMissingData = function(){
	//get the *ac2 file
	let fileAC2 = "file:script/../test/testcases/items_testfiles/items_missing_data_test.ac2";
	let banDoc = Banana.application.openDocument(fileAC2);
	//create a new logger to split the result of this test on a different file.
	let parentLogger = this.testLogger;
	this.testLogger = parentLogger.newLogger(Banana.IO.fileCompleteBaseName(fileAC2));
	if (banDoc) {
		let itemsTable = banDoc.table("Items");
		if (itemsTable){
			let csvData = "";
			csvData += generateCsvItems(itemsTable);
			this.testLogger.addCsv("Data",csvData);
		} else {
			this.testLogger.addFatalError("Items table not found !");
		}
	} else {
		this.testLogger.addFatalError("File not found: " + fileAC2);
	}
}

//Export Items with missing mandatory data
TestExportItems.prototype.testItemsWithMissingMandatoryData = function(){
	//get the *ac2 file
	let fileAC2 = "file:script/../test/testcases/items_testfiles/items_missing_mandatory_data_test.ac2";
	let banDoc = Banana.application.openDocument(fileAC2);
	//create a new logger to split the result of this test on a different file.
	let parentLogger = this.testLogger;
	this.testLogger = parentLogger.newLogger(Banana.IO.fileCompleteBaseName(fileAC2));
	if (banDoc) {
		let itemsTable = banDoc.table("Items");
		if (itemsTable){
			let csvData = "";
			csvData += generateCsvItems(itemsTable, true);
			this.testLogger.addCsv("Data",csvData);
		} else {
			this.testLogger.addFatalError("Items table not found !");
		}
	} else {
		this.testLogger.addFatalError("File not found: " + fileAC2);
	}
}
