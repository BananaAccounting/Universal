// Copyright [2024] [Banana.ch SA - Lugano Switzerland]
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


// @id = ch.banana.uni.import.sumup.test
// @api = 1.0
// @pubdate = 2024-03-25
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.uni.import.sumup.test>
// @task = app.command
// @doctype = *.*
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @includejs = ../ch.banana.uni.import.sumup.sbaa/import.utilities.js
// @includejs = ../ch.banana.uni.import.sumup.sbaa/ch.banana.uni.import.sumup.js
// @timeout = -1

// Register test case to be executed
Test.registerTestCase(new TestImportSumupTrans());

// Here we define the class, the name of the class is not important
function TestImportSumupTrans() {
}

// This method will be called at the beginning of the test case
TestImportSumupTrans.prototype.initTestCase = function () {
   this.testLogger = Test.logger;
   this.progressBar = Banana.application.progressBar;
}

// This method will be called at the end of the test case
TestImportSumupTrans.prototype.cleanupTestCase = function () {

}

// This method will be called before every test method is executed
TestImportSumupTrans.prototype.init = function () {

}

// This method will be called after every test method is executed
TestImportSumupTrans.prototype.cleanup = function () {

}

TestImportSumupTrans.prototype.testImport = function () {
   let fileNameList = [];
   let ac2FileList = [];

   //finire test 25.03

   fileNameList.push("file:script/../test/testcases/csv_example_format1_20240215.csv");
   fileNameList.push("file:script/../test/testcases/csv_example_format2_20250324.csv");

   ac2FileList.push("file:script/../test/testcases/Double-entry.ac2");
   ac2FileList.push("file:script/../test/testcases/Income & Expense.ac2");

   let parentLogger = this.testLogger;
   this.progressBar.start(fileNameList.length);

   for (var i = 0; i < fileNameList.length; i++) {
      let fileName = fileNameList[i];
      let file = Banana.IO.getLocalFile(fileName);
      for (var j = 0; j < ac2FileList.length; j++) {
         let ac2Name = ac2FileList[j];
         let loggerName = fileName + "_" + ac2Name;
         this.testLogger = parentLogger.newLogger(Banana.IO.fileCompleteBaseName(loggerName));
         Test.assert(file);
         let fileContent = file.read();
         Test.assert(fileContent);
         let transactions = processSumUpTransactions(fileContent);
         this.testLogger.addCsv('', transactions);
         if (!this.progressBar.step())
            break;
      }
   }
   this.progressBar.finish();
}

function getUserParams() {
   var params = {};

   params.dateFormat = "yyyy-mm-dd";
   params.stripeAccount = "1001"; // Bank account
   params.stripeIn = "3000"; // Revenues account.
   params.stripeFunds = "6941"; // Costs account.
   params.stripeFee = "6940"; // Costs account.

   return params;
}