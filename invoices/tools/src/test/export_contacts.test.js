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
// @includejs = ../export_contacts.js
// @includejs = ../export_items.js
// @includejs = ../export_invoices.js

/*
  SUMMARY
  -------
  Javascript test
  1. Open the various .ac2 file
  2. Export the data in CSV formats
**/




// Register test case to be executed
Test.registerTestCase(new ExportTools());

// Here we define the class, the name of the class is not important
function ExportTools() {

}

// This method will be called at the beginning of the test case
ExportTools.prototype.initTestCase = function() {

}

// This method will be called at the end of the test case
ExportTools.prototype.cleanupTestCase = function() {

}

// This method will be called before every test method is executed
ExportTools.prototype.init = function() {

}

// This method will be called after every test method is executed
ExportTools.prototype.cleanup = function() {

}

ExportTools.prototype.testBananaExtension = function() {

	Test.logger.addSection("Test Export Tools");
	var csvData = "";

	//Export Invoices without VAT
	csvData = this.getInvoicesWithoutVatCsvData(Test.logger);
	testLogger.addCsv("Test 'Invoices without VAT", csvData);

	//Export Invoices VAT included
	csvData = this.getInvoicesVatIncludedCsvData(Test.logger);
	testLogger.addCsv("Test 'Invoices VAT included'", csvData);

	//Export Contacts
	csvData = this.getContactsCsvData(Test.logger);
	testLogger.addCsv("Test 'Contacts'", csvData);

	//Export Invoices VAT excluded
	csvData = this.getInvoicesVatExcludedCsvData(Test.logger);
	testLogger.addCsv("Test 'Invoices VAT excluded'", csvData);

	//Export Invoices without VAT, amounts rounded at 0.05

	//Export Items

	//Export Invoices with particular amounts (0.0001, 333333.33,...), Items and Contacts

	//Export Items (correct) and Contacts with errors

	//Export Items with errors and Contacts (correct)

	//Export Invoices with 1'000 with Items

	Test.logger.close();
}


ExportTools.prototype.getInvoicesWithoutVatCsvData = function(testLogger){
	let fileAC2 = "file:script/../test/testcases/invoices_without_vat_test.ac2";
	let banDoc = Banana.application.openDocument(fileAC2);
	if (banDoc) {
		let invoicesTable = banDoc.table("Invoices");
		if(invoicesTable){
			let csvData = "";
			csvData += generateCsvInvoices(contactsTable);
			return csvData;
		}else{
			testLogger.addFatalError("Invoices table not found !");
		}
	} else{
		testLogger.addFatalError("File not found: " + fileAC2);
	}
}
ExportTools.prototype.getInvoicesVatIncludedCsvData = function(testLogger){
	let fileAC2 = "file:script/../test/testcases/invoices_vat_included_test.ac2";
	let banDoc = Banana.application.openDocument(fileAC2);
	if (banDoc) {
		let invoicesTable = banDoc.table("Invoices");
		if(invoicesTable){
			let csvData = "";
			csvData += generateCsvInvoices(contactsTable);
			return csvData;
		}else{
			testLogger.addFatalError("Invoices table not found !");
		}
	} else{
		testLogger.addFatalError("File not found: " + fileAC2);
	}
}

ExportTools.prototype.getContactsCsvData = function(testLogger){
	let fileAC2 = "file:script/../test/testcases/simple_contacts_test.ac2";
	let banDoc = Banana.application.openDocument(fileAC2);
	if (banDoc) {
		let contactsTable = banDoc.table("contacts");
		if(invoicesTable){
			let csvData = "";
			csvData += generateCsvInvoices(contactsTable);
			return csvData;
		}else{
			testLogger.addFatalError("Contacts table not found !");
		}
	} else{
		testLogger.addFatalError("File not found: " + fileAC2);
	}
}

ExportTools.prototype.getInvoicesVatIncludedCsvData = function(testLogger){
	let fileAC2 = "file:script/../test/testcases/invoices_vat_excluded_test.ac2";
	let banDoc = Banana.application.openDocument(fileAC2);
	if (banDoc) {
		let invoicesTable = banDoc.table("Invoices");
		if(invoicesTable){
			let csvData = "";
			csvData += generateCsvInvoices(contactsTable);
			return csvData;
		}else{
			testLogger.addFatalError("Invoices table not found !");
		}
	} else{
		testLogger.addFatalError("File not found: " + fileAC2);
	}
}
