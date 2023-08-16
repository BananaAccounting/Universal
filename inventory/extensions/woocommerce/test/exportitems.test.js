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

TestWooCommerceExport.prototype.testVerifyMethods = function() {
   Test.logger.addText("The object Test defines methods to verify conditions.");

   // This method verify that the condition is true
   Test.assert(true);
   Test.assert(true, "message"); // You can specify a message to be logged in case of failure

   // This method verify that the two parameters are equals
   Test.assertIsEqual("Same text", "Same text");
}

TestWooCommerceExport.prototype.testBananaApps = function() {
   Test.logger.addText("This test will tests the BananaApp helloworld.js");
   
   var document = Banana.application.openDocument("file:script/../test/testcases/Magazzino.ac2");
   Test.assert(document, "File ac2 not found");
   
   // Add the report content text to the result txt file
   var report = createReport();
   Test.logger.addReport("ReportName", report);
}