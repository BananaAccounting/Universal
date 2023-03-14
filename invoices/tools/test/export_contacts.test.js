// @id = export_contacts.test
// @api = 1.0
// @pubdate = 2023-02-08
// @publisher = Banana.ch SA
// @description = <TEST export_contacts.test>
// @doctype = *.*
// @outputformat = none
// @inputdataform = none
// @task = app.command
// @timeout = -1
// @includejs = ../src/export_contacts.js

/*
  SUMMARY
  -------
  Export contacts test, for each test:
  1. Open the specific .ac2 file
  2. Export the data in CSV formats
  3. Add the exported data to the text logger as new sub section.
**/

/**
 * Tips (to delete once the test are finished)
 * 1. The test cases (*.ac2 files) should have at least 5 - 10 rows of example
 * 2. The example data should contains various cases:
 *     - Contacts with missing data (mandatory or not)
 * 3. A test should also be created that exports the data and imports it again, checking that the totals are equal
 * 4. For further information see API: Banana.Test
*/

// Register test case to be executed
Test.registerTestCase(new TestExportContacts());

// Here we define the class, the name of the class is not important
function TestExportContacts() {

}

// This method will be called at the beginning of the test case
TestExportContacts.prototype.initTestCase = function() {
	this.testLogger = Test.logger;
	if(!this.testLogger){
		this.testLogger.addFatalError("Test logger not found");
	}
}

// This method will be called at the end of the test case
TestExportContacts.prototype.cleanupTestCase = function() {

}

// This method will be called before every test method is executed
TestExportContacts.prototype.init = function() {

}

// This method will be called after every test method is executed
TestExportContacts.prototype.cleanup = function() {

}

//Export Contacts with complete data
TestExportContacts.prototype.testContactsWithCompleteData = function(){
	//get the *ac2 file
	let fileAC2 = "file:script/test/testcases/contacts_testfiles/contacts_complete_data_test.ac2";
	let banDoc = Banana.application.openDocument(fileAC2);
	Test.assert(banDoc, `file not found: "${fileAC2}"`);

	let contactsTable = banDoc.table("Contacts");
	Test.assert(contactsTable);
		
	banDoc.clearMessages();
	let csvData = generateCsvContacts(contactsTable);
	this.testLogger.addCsv("Data", csvData);
	
	let msgs = banDoc.getMessages();
    for (let i = 0; i < msgs.length; ++i) {
        let msg = msgs[i];
        this.testLogger.addKeyValue("ERROR_MSG_ROW_" + msg.rowNr, msg.message);
        this.testLogger.addKeyValue("ERROR_HELPID_ROW_" + msg.rowNr, msg.helpId);
    }
}

//Export Contacts with missing data
TestExportContacts.prototype.testContactsWithMissingData = function(){
	//get the *ac2 file
	let fileAC2 = "file:script/test/testcases/contacts_testfiles/contacts_missing_data_test.ac2";
	let banDoc = Banana.application.openDocument(fileAC2);
	Test.assert(banDoc, `file not found: "${fileAC2}"`);
	
	let contactsTable = banDoc.table("Contacts");
	Test.assert(contactsTable);
		
	banDoc.clearMessages();
	let csvData = generateCsvContacts(contactsTable);
	this.testLogger.addCsv("Data", csvData);
	
	let msgs = banDoc.getMessages();
    for (let i = 0; i < msgs.length; ++i) {
        let msg = msgs[i];
        this.testLogger.addKeyValue("ERROR_MSG_ROW_" + msg.rowNr, msg.message);
        this.testLogger.addKeyValue("ERROR_HELPID_ROW_" + msg.rowNr, msg.helpId);
    }
}

// Export Contacts with missing mandatory data
TestExportContacts.prototype.testContactsWithMissingMandatoryData = function(){
	//get the *ac2 file
	let fileAC2 = "file:script/../test/testcases/contacts_testfiles/contacts_missing_mandatory_data_test.ac2";
	let banDoc = Banana.application.openDocument(fileAC2);
	Test.assert(banDoc, `file not found: "${fileAC2}"`);
	
	let contactsTable = banDoc.table("Contacts");
	Test.assert(contactsTable);
		
	banDoc.clearMessages();
	let csvData = generateCsvContacts(contactsTable);
	this.testLogger.addCsv("Data", csvData);
		
	let msgs = banDoc.getMessages();
    for (let i = 0; i < msgs.length; ++i) {
        let msg = msgs[i];
        this.testLogger.addKeyValue("ERROR_MSG_ROW_" + msg.rowNr, msg.message);
        this.testLogger.addKeyValue("ERROR_HELPID_ROW_" + msg.rowNr, msg.helpId);
    }
}
