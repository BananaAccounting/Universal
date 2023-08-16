// @id = ch.banana.app.createupdateitems.test
// @api = 1.0
// @pubdate = 2018-10-30
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.app.createupdateitems.test>
// @task = app.command
// @doctype = *.*
// @docproperties =
// @outputformat = none
// @inputdataform = none
// @timeout = -1
// @includejs = ../WooCommerce.sbaa/createupdateitems.js

// Register this test case to be executed
Test.registerTestCase(new TestWooCommerceImport());

// Define the test class, the name of the class is not important
function TestWooCommerceImport() {
}

// This method will be called at the beginning of the test case
TestWooCommerceImport.prototype.initTestCase = function() {
   this.progressBar = Banana.application.progressBar;
}

// This method will be called at the end of the test case
TestWooCommerceImport.prototype.cleanupTestCase = function() {
}

// This method will be called before every test method is executed
TestWooCommerceImport.prototype.init = function() {
}

// This method will be called after every test method is executed
TestWooCommerceImport.prototype.cleanup = function() {
}

// Every method with the prefix 'test' are executed automatically as test method
// You can defiend as many test methods as you need

TestWooCommerceImport.prototype.testVerifyMethods = function() {
   Test.logger.addText("The object Test defines methods to verify conditions.");

   // This method verify that the condition is true
   Test.assert(true);
   Test.assert(true, "message"); // You can specify a message to be logged in case of failure

   // This method verify that the two parameters are equals
   Test.assertIsEqual("Same text", "Same text");
}

TestWooCommerceImport.prototype.testImport = function() {
   var fileNameList = [];

   fileNameList.push("file:script/../test/testcases/csv.woocommerce.example.format1.csv");

   
   var parentLogger = Test.logger;
   Banana.application.progressBar.start(fileNameList.length);

   for (var i = 0; i < fileNameList.length; i++) {
      var fileName = fileNameList[i];
      let logger = parentLogger.newLogger(Banana.IO.fileCompleteBaseName(fileName));

      var file = Banana.IO.getLocalFile(fileName);
      Test.assert(file);
      var fileContent = file.read();
      Test.assert(fileContent);
      var jsonitems = exec(fileContent,true); //takes the exec from the import script.
      logger.addJson('Format Data', JSON.stringify(jsonitems));
      
      if (! Banana.application.progressBar.step())
         break;
   }

   Banana.application.progressBar.finish();
}