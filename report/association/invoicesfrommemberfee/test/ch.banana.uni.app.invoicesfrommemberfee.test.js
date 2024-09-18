// @id = ch.banana.script.invoices.frommemberfee.test
// @api = 1.0
// @pubdate = 2024.08.23
// @publisher = Banana.ch SA
// @description = [Test] Create invoice transactions, from account
// @task = app.command
// @doctype = *.*
// @docproperties =
// @outputformat = none
// @inputdataform = none
// @timeout = -1
// @includejs = ../ch.banana.script.invoices.frommemberfee.js

// Register this test case to be executed
Test.registerTestCase(new TestCreateInvoiceTransactions());

// Define the test class, the name of the class is not important
function TestCreateInvoiceTransactions() {
}

// This method will be called at the beginning of the test case
TestCreateInvoiceTransactions.prototype.initTestCase = function() {
    this.testLogger = Test.logger;
    this.progressBar = Banana.application.progressBar;
}

// This method will be called at the end of the test case
TestCreateInvoiceTransactions.prototype.cleanupTestCase = function() {}

// This method will be called before every test method is executed
TestCreateInvoiceTransactions.prototype.init = function() {}

// This method will be called after every test method is executed
TestCreateInvoiceTransactions.prototype.cleanup = function() {}

// Every method with the prefix 'test' are executed automatically as test method
// You can defiend as many test methods as you need

TestCreateInvoiceTransactions.prototype.testImport = function() {
 
    this.testLogger.addKeyValue("InvoiceFromMembership", "Document Change Invoices from Membership Fee");

    let fileAC2 = "file:script/../test/testcases/membership_fee_invoice_creator_test_file.ac2";
    let banDoc = Banana.application.openDocument(fileAC2);

    let parentLogger = this.testLogger;    

    this.testLogger = parentLogger.newLogger(Banana.IO.fileCompleteBaseName(this.fileAC2));
    
    if (banDoc) {
        var isTest = {};

        isTest.useLastSettings = true;

        let docChangeObj = exec(banDoc, isTest);
        var reportName = "FILENAME: " + this.fileAC2;

        this.testLogger.addJson(reportName, JSON.stringify(docChangeObj));
    } else {
        this.testLogger.addFatalError("File not found: " + fileAC2);
    }
    this.testLogger.close();
}
