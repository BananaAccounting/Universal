// Copyright [2026] [Banana.ch SA - Lugano Switzerland]
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//


// @id = ch.banana.uni.import.wordline.test
// @api = 1.0
// @pubdate = 2026-09-18
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.uni.import.wordline.test>
// @task = app.command
// @doctype = *.*
// @docproperties =
// @outputformat = none
// @inputdataform = none
// @includejs = ../ch.banana.uni.import.wordline.sbaa/import.utilities.js
// @includejs = ../ch.banana.uni.import.wordline.sbaa/ch.banana.uni.import.wordline.js
// @timeout = -1

// Register test case to be executed
Test.registerTestCase(new TestImportWordlineTrans());

// Here we define the class, the name of the class is not important
function TestImportWordlineTrans() {
}

// This method will be called at the beginning of the test case
TestImportWordlineTrans.prototype.initTestCase = function () {
   this.testLogger = Test.logger;
   this.progressBar = Banana.application.progressBar;

   this.fileNameList = [];

   this.fileNameList.push("file:script/../test/testcases/csv_example_format1_20260812.csv");
}

// This method will be called at the end of the test case
TestImportWordlineTrans.prototype.cleanupTestCase = function () {

}

// This method will be called before every test method is executed
TestImportWordlineTrans.prototype.init = function () {

}

// This method will be called after every test method is executed
TestImportWordlineTrans.prototype.cleanup = function () {

}

TestImportWordlineTrans.prototype.testImportDoubleEntry = function () {
   var ac2File = "file:script/../test/testcases/Double-entry.ac2";

   var parentLogger = this.testLogger;
   this.progressBar.start(this.fileNameList.length);
   var banDocument = Banana.application.openDocument(ac2File);

   if (!banDocument)
      parentLogger.addFatalError("File not found: " + ac2File);

   var userParam = getUserParam();

   for (var i = 0; i < this.fileNameList.length; i++) {
      var fileName = this.fileNameList[i];
      var loggerName = Banana.IO.fileCompleteBaseName(ac2File) + ";" + Banana.IO.fileCompleteBaseName(fileName);
      this.testLogger = parentLogger.newLogger(loggerName);

      var file = Banana.IO.getLocalFile(fileName);
      Test.assert(file);
      var fileContent = file.read();
      Test.assert(fileContent);
      var transactions = processWordlineTransactions(fileContent, userParam, banDocument);
      this.testLogger.addCsv('', transactions);

      if (!this.progressBar.step())
         break;
   }

   this.progressBar.finish();
}

TestImportWordlineTrans.prototype.testImportIncomeExpenses = function () {
   var ac2File = "file:script/../test/testcases/Income-Expense.ac2";

   var parentLogger = this.testLogger;
   this.progressBar.start(this.fileNameList.length);
   var banDocument = Banana.application.openDocument(ac2File);

   if (!banDocument)
      parentLogger.addFatalError("File not found: " + ac2File);

   var userParam = getUserParam();

   for (var i = 0; i < this.fileNameList.length; i++) {
      var fileName = this.fileNameList[i];
      var loggerName = Banana.IO.fileCompleteBaseName(ac2File) + ";" + Banana.IO.fileCompleteBaseName(fileName);
      this.testLogger = parentLogger.newLogger(loggerName);

      var file = Banana.IO.getLocalFile(fileName);
      Test.assert(file);
      var fileContent = file.read();
      Test.assert(fileContent);
      var transactions = processWordlineTransactions(fileContent, userParam, banDocument);
      this.testLogger.addCsv('', transactions);

      if (!this.progressBar.step())
         break;
   }

   this.progressBar.finish();
}

function getUserParam() {
   var params = {};

   params.dateFormat = "dd.mm.yyyy";
   params.bankAccount = "1020";
   params.wordlineIn = "1022";
   params.feeAccount = "6946";

   return params;
}
