// @id = exports_tools.test
// @api = 1.0
// @pubdate = 2023-01-31
// @publisher = Banana.ch SA
// @description = <TEST exports_tools.test>
// @doctype = *.*
// @outputformat = none
// @inputdataform = none
// @task = app.command
// @timeout = -1
// @includejs = ../export_invoices.js
// @includejs = ../export_contacts.js
// @includejs = ../export_items.js

/*
  SUMMARY
  -------
  Export tool test, for each test:
  1. Open the specific .ac2 file
  2. Export the data in CSV formats
  3. Add the exported data to the text logger as new sub section.
**/

/**
 * Tips (to delete once the test are finished)
 * The test cases (*.ac2 files)
 */


// Register test case to be executed
Test.registerTestCase(new TestExportTools());

// Here we define the class, the name of the class is not important
function TestExportTools() {

}

// This method will be called at the beginning of the test case
TestExportTools.prototype.initTestCase = function() {

	this.testLogger = Test.Logger;
	this.testLogger.addSection("Test Export Tools");

}

// This method will be called at the end of the test case
TestExportTools.prototype.cleanupTestCase = function() {

}

// This method will be called before every test method is executed
TestExportTools.prototype.init = function() {

}

// This method will be called after every test method is executed
TestExportTools.prototype.cleanup = function() {

}

//Export Invoices without VAT
TestExportTools.prototype.testInvoicesWithoutVat = function(){

	let fileAC2 = "file:script/../test/testcases/invoices_without_vat_test.ac2";
	this.testLogger.addSubSection(fileAC2);
	let banDoc = Banana.application.openDocument(fileAC2);
	if (banDoc) {
		let invoicesTable = banDoc.table("Invoices");
		if (invoicesTable){
			let csvData = "";
			csvData += generateCsvInvoices(contactsTable);
			return csvData;
		} else {
			this.testLogger.addFatalError("Invoices table not found !");
		}
	} else {
		this.testLogger.addFatalError("File not found: " + fileAC2);
	}

	this.testLogger.addCsv();
}

//Export Invoices VAT included
TestExportTools.prototype.testInvoicesVatIncluded = function(){
	let fileAC2 = "file:script/../test/testcases/invoices_vat_included_test.ac2";
	this.testLogger.addSubSection(fileAC2);
	let banDoc = Banana.application.openDocument(fileAC2);
	if (banDoc) {
		let invoicesTable = banDoc.table("Invoices");
		if (invoicesTable){
			let csvData = "";
			csvData += generateCsvInvoices(contactsTable);
			return csvData;
		} else {
			this.testLogger.addFatalError("Invoices table not found !");
		}
	} else {
		this.testLogger.addFatalError("File not found: " + fileAC2);
	}
}

//Export Contacts
TestExportTools.prototype.testContacts = function(){
	let fileAC2 = "file:script/../test/testcases/simple_contacts_test.ac2";
	this.testLogger.addSubSection(fileAC2);
	let banDoc = Banana.application.openDocument(fileAC2);
	if (banDoc) {
		let contactsTable = banDoc.table("contacts");
		if (contactsTable){
			let csvData = "";
			csvData += generateCsvInvoices(contactsTable);
			return csvData;
		} else {
			this.testLogger.addFatalError("Contacts table not found !");
		}
	} else {
		this.testLogger.addFatalError("File not found: " + fileAC2);
	}
}

//Export Invoices VAT excluded
TestExportTools.prototype.testInvoicesVatIncluded = function(){
	let fileAC2 = "file:script/../test/testcases/invoices_vat_excluded_test.ac2";
	this.testLogger.addSubSection(fileAC2);
	let banDoc = Banana.application.openDocument(fileAC2);
	if (banDoc) {
		let invoicesTable = banDoc.table("Invoices");
		if (invoicesTable){
			let csvData = "";
			csvData += generateCsvInvoices(contactsTable);
			return csvData;
		} else {
			this.testLogger.addFatalError("Invoices table not found !");
		}
	} else {
		this.testLogger.addFatalError("File not found: " + fileAC2);
	}
}

//Export Invoices without VAT, amounts rounded at 0.05
TestExportTools.prototype.testInvoicesVatExcludedAmountsRounded = function(){
	let fileAC2 = "file:script/../test/testcases/invoices_vat_excluded_amounts_rounded_test.ac2";
	this.testLogger.addSubSection(fileAC2);
	let banDoc = Banana.application.openDocument(fileAC2);
	if (banDoc) {
		let invoicesTable = banDoc.table("Invoices");
		if (invoicesTable){
			let csvData = "";
			csvData += generateCsvInvoices(contactsTable);
			return csvData;
		} else {
			this.testLogger.addFatalError("Invoices table not found !");
		}
	} else {
		this.testLogger.addFatalError("File not found: " + fileAC2);
	}
}

//Export Items
TestExportTools.prototype.testItems = function(){
	let fileAC2 = "file:script/../test/testcases/simple_items_test.ac2";
	this.testLogger.addSubSection(fileAC2);
	let banDoc = Banana.application.openDocument(fileAC2);
	if (banDoc) {
		let itemsTable = banDoc.table("Items");
		if (itemsTable){
			let csvData = "";
			csvData += generateCsvInvoices(contactsTable);
			return csvData;
		} else {
			this.testLogger.addFatalError("Items table not found !");
		}
	} else {
		this.testLogger.addFatalError("File not found: " + fileAC2);
	}
}

//Export Invoices with particular amounts (0.0001, 333333.33,...)
TestExportTools.prototype.testInvoicesWithParticularAmounts = function(){
	let fileAC2 = "file:script/../test/testcases/invoices_with_particular_amounts_test.ac2";
	this.testLogger.addSubSection(fileAC2);
	let banDoc = Banana.application.openDocument(fileAC2);
	if (banDoc) {
		let invoicesTable = banDoc.table("Invoices");
		if (invoicesTable){
			let csvData = "";
			csvData += generateCsvInvoices(contactsTable);
			return csvData;
		} else {
			this.testLogger.addFatalError("Invoices table not found !");
		}
	} else {
		this.testLogger.addFatalError("File not found: " + fileAC2);
	}
}

//Export Items (correct) and Contacts with errors.
TestExportTools.prototype.testCorrectItemsAndContactWithErrors = function(){
	let fileAC2 = "file:script/../test/testcases/correct_items_and_contacts_with_errors.ac2";
	this.testLogger.addSubSection(fileAC2);
	let banDoc = Banana.application.openDocument(fileAC2);
	if (banDoc) {
		let contactsTable = banDoc.table("Contacts");
		let itemsTable = banDoc.table("Items");
		if (invoicesTable && itemsTable){
			let csvData = "";
			csvData += generateCsvContacts(contactsTable);
			csvData += generateCsvItems(contactsTable);
			return csvData;
		} else {
			this.testLogger.addFatalError("Items or Contacts table not found !");
		}
	} else {
		this.testLogger.addFatalError("File not found: " + fileAC2);
	}
}

//Export Items with errors and Contacts (correct)
TestExportTools.prototype.testCorrectContactsAndItemsWithErrors = function(){
	let fileAC2 = "file:script/../test/testcases/correct_contacts_and_items_with_errors.ac2";
	this.testLogger.addSubSection(fileAC2);
	let banDoc = Banana.application.openDocument(fileAC2);
	if (banDoc) {
		let contactsTable = banDoc.table("Contacts");
		let itemsTable = banDoc.table("Items");
		if (invoicesTable && itemsTable){
			let csvData = "";
			csvData += generateCsvContacts(contactsTable);
			csvData += generateCsvItems(contactsTable);
			return csvData;
		} else {
			this.testLogger.addFatalError("Items or Contacts table not found !");
		}
	} else {
		this.testLogger.addFatalError("File not found: " + fileAC2);
	}
}

//Export Invoices with 1'000 with Items
TestExportTools.prototype.testInvoiceWithThousandItems = function(){
	let fileAC2 = "file:script/../test/testcases/invoices_with_thousand_items.ac2";
	this.testLogger.addSubSection(fileAC2);
	let banDoc = Banana.application.openDocument(fileAC2);
	if (banDoc) {
		let contactsTable = banDoc.table("Contacts");
		let itemsTable = banDoc.table("Items");
		if (invoicesTable && itemsTable){
			let csvData = "";
			csvData += generateCsvContacts(contactsTable);
			csvData += generateCsvItems(contactsTable);
			return csvData;
		} else {
			this.testLogger.addFatalError("Items or Contacts table not found !");
		}
	} else {
		this.testLogger.addFatalError("File not found: " + fileAC2);
	}
}
