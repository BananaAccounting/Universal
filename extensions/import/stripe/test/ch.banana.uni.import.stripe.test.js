// Copyright [2023] [Banana.ch SA - Lugano Switzerland]
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


// @id = ch.banana.uni.import.stripe.test
// @api = 1.0
// @pubdate = 2023-10-27
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.uni.import.stripe.test>
// @task = app.command
// @doctype = *.*
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @includejs = ../ch.banana.uni.import.stripe.sbaa/import.utilities.js
// @includejs = ../ch.banana.uni.import.stripe.sbaa/ch.banana.uni.import.stripe.js
// @timeout = -1

// Register test case to be executed
Test.registerTestCase(new TestImportStripeTrans());

// Here we define the class, the name of the class is not important
function TestImportStripeTrans() {
}

// This method will be called at the beginning of the test case
TestImportStripeTrans.prototype.initTestCase = function () {
   this.testLogger = Test.logger;
   this.progressBar = Banana.application.progressBar;
}

// This method will be called at the end of the test case
TestImportStripeTrans.prototype.cleanupTestCase = function () {

}

// This method will be called before every test method is executed
TestImportStripeTrans.prototype.init = function () {
}

// This method will be called after every test method is executed
TestImportStripeTrans.prototype.cleanup = function () {

}

TestImportStripeTrans.prototype.testImportDoubleEntry = function () {
   let fileNameList = [];
   let ac2File = "file:script/../test/testcases/Double-entry Stripe.ac2";

   fileNameList.push("file:script/../test/testcases/ch.banana.filter.import.stripe.balance_summary_format1_20231010.csv");
   fileNameList.push("file:script/../test/testcases/ch.banana.filter.import.stripe.transactions_all_format1_20231004.csv");
   fileNameList.push("file:script/../test/testcases/ch.banana.filter.import.stripe..balance_summary_format1_20250102.csv");

   let parentLogger = this.testLogger;
   this.progressBar.start(fileNameList.length);
   let banDocument = Banana.application.openDocument(ac2File);

   if (!banDocument)
      parentLogger.addFatalError("File not found: " + ac2File);

   let importUtilities = new ImportUtilities(banDocument);

   for (let i = 0; i < fileNameList.length; i++) {
      let fileName = fileNameList[i];
      let loggerName = Banana.IO.fileCompleteBaseName(ac2File) + ";" + Banana.IO.fileCompleteBaseName(fileName);
      this.testLogger = parentLogger.newLogger(loggerName);

      let file = Banana.IO.getLocalFile(fileName);
      Test.assert(file);
      let fileContent = file.read();
      Test.assert(fileContent);
      let userParam = getUserParam_DoubleEntry();
      let transactions = processStripeTransactions(fileContent, userParam, banDocument, importUtilities);
      this.testLogger.addCsv('', transactions);

      if (!this.progressBar.step())
         break;
   }

   this.progressBar.finish();
}
TestImportStripeTrans.prototype.testImportIncomeExpenses = function () {
   let fileNameList = [];
   let ac2File = "file:script/../test/testcases/Income & Expense accounting Stripe.ac2";

   fileNameList.push("file:script/../test/testcases/ch.banana.filter.import.stripe.balance_summary_format1_20231010.csv");
   fileNameList.push("file:script/../test/testcases/ch.banana.filter.import.stripe.transactions_all_format1_20231004.csv");
   fileNameList.push("file:script/../test/testcases/ch.banana.filter.import.stripe..balance_summary_format1_20250102.csv");

   let parentLogger = this.testLogger;
   this.progressBar.start(fileNameList.length);
   let banDocument = Banana.application.openDocument(ac2File);

   if (!banDocument)
      parentLogger.addFatalError("File not found: " + ac2File);

   let importUtilities = new ImportUtilities(banDocument);

   for (let i = 0; i < fileNameList.length; i++) {

      let fileName = fileNameList[i];
      let loggerName = Banana.IO.fileCompleteBaseName(ac2File) + ";" + Banana.IO.fileCompleteBaseName(fileName);
      this.testLogger = parentLogger.newLogger(loggerName);

      let file = Banana.IO.getLocalFile(fileName);
      Test.assert(file);
      let fileContent = file.read();
      Test.assert(fileContent);
      let userParam = getUserParam_IncomeExpenses();
      let transactions = processStripeTransactions(fileContent, userParam, banDocument, importUtilities);
      this.testLogger.addCsv('', transactions);

      if (!this.progressBar.step())
         break;
   }

   this.progressBar.finish();
}

function getUserParam_DoubleEntry() {
   var params = {};

   params.dateFormat = "yyyy-mm-dd";
   params.stripeAccount = "1001"; // Bank account
   params.stripeIn = "3000"; // Revenues account.
   params.stripeFunds = "6941"; // Costs account.
   params.stripeFee = "6940"; // Costs account.

   return params;

}

function getUserParam_IncomeExpenses() {
   var params = {};

   params.dateFormat = "yyyy-mm-dd";
   params.stripeAccount = "1001"; // Bank account
   params.stripeIn = "3621"; // Revenues account.
   params.stripeFunds = "6901"; // Costs account.
   params.stripeFee = "6900"; // Costs account.

   return params;

}