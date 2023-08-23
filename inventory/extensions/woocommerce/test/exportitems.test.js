// @id = ch.banana.app.exportitems.test
// @api = 1.0
// @pubdate = 2018-10-30
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.app.exportitems.test>
// @task = app.command
// @doctype = *.*
// @docproperties =
// @outputformat = none
// @inputdataform = none
// @timeout = -1
// @includejs = ../WooCommerce.sbaa/exportitems.js

// Register this test case to be executed
Test.registerTestCase(new TestWooCommerceExport());

// Define the test class, the name of the class is not important
function TestWooCommerceExport() {
}

// This method will be called at the beginning of the test case
TestWooCommerceExport.prototype.initTestCase = function() {
   this.progressBar = Banana.application.progressBar;
}

// This method will be called at the end of the test case
TestWooCommerceExport.prototype.cleanupTestCase = function() {
}

// This method will be called before every test method is executed
TestWooCommerceExport.prototype.init = function() {
}

// This method will be called after every test method is executed
TestWooCommerceExport.prototype.cleanup = function() {
}

// Every method with the prefix 'test' are executed automatically as test method
// You can defiend as many test methods as you need

//Export Items with missing Data
TestWooCommerceExport.prototype.testExport = function(){
	//get the *ac2 file
	let fileAC2Path = "file:script/../test/testcases/Inventory.ac2";
	let banDoc = Banana.application.openDocument(fileAC2Path);
   if (banDoc) {
	let itemsTable = banDoc.table("Items");
	Test.assert(itemsTable);
	
	banDoc.clearMessages();
	let csvData = generateCsvItems(itemsTable);
	Test.logger.addCsv("Data", csvData);
		
	let msgs = banDoc.getMessages();
    for (let i = 0; i < msgs.length; ++i) {
        let msg = msgs[i];
        this.testLogger.addKeyValue("ERROR_MSG_ROW_" + msg.rowNr, msg.message);
        this.testLogger.addKeyValue("ERROR_HELPID_ROW_" + msg.rowNr, msg.helpId);
    } 
   }
   else {
      logger.addFatalError("No valid file ac2 found in this directory: " + fileAC2Path);
   }
}