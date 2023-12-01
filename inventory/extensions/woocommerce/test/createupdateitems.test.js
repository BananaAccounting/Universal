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
TestWooCommerceImport.prototype.initTestCase = function () {
   this.progressBar = Banana.application.progressBar;
}

// This method will be called at the end of the test case
TestWooCommerceImport.prototype.cleanupTestCase = function () {
}

// This method will be called before every test method is executed
TestWooCommerceImport.prototype.init = function () {
}

// This method will be called after every test method is executed
TestWooCommerceImport.prototype.cleanup = function () {
}

TestWooCommerceImport.prototype.testImport = function () {
   let csvNameList = [];
   let fileAC2Path = "file:script/../test/testcases/Inventory.ac2";
   csvNameList.push("file:script/../test/testcases/csv.woocommerce.example.format1.csv");


   let parentLogger = Test.logger;
   Banana.application.progressBar.start(csvNameList.length);
   let banDoc = Banana.application.openDocument(fileAC2Path);

   if (banDoc) {
      for (let i = 0; i < csvNameList.length; i++) {
         let fileName = csvNameList[i];
         let logger = parentLogger.newLogger(Banana.IO.fileCompleteBaseName(fileName));
         let file = Banana.IO.getLocalFile(fileName);
         Test.assert(file);
         let fileContent = file.read();
         Test.assert(fileContent);
         let csvFile = Banana.Converter.csvToArray(fileContent, ',', '"');
         //Check if the csv file is not empty
         if (csvFile.length <= 1) {
            logger.addFatalError("File not found" + fileName);
            return;
         }
         let create_update = new CreateUpdate(banDoc);
         let jsonDoc = "";
         rows = create_update.getUpdatedItemsRows(csvFile);
         jsonDoc = create_update.getJsonDocument(rows);

         // We set the executionDate and the executionTime to avoid differences messages in test
         jsonDoc.creator.executionDate = "2023-12-01";
         jsonDoc.creator.executionTime = "15:20:00";

         let documentChange = { "format": "documentChange", "error": "", "data": [] };
         documentChange["data"].push(jsonDoc);
         logger.addJson(fileName, JSON.stringify(documentChange));

         if (!Banana.application.progressBar.step())
            break;
      }
   } else {
      logger.addFatalError("No valid file ac2 found in this directory: " + fileAC2Path);
   }

   Banana.application.progressBar.finish();
}