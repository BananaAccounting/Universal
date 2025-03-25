// Copyright [2025] [Banana.ch SA - Lugano Switzerland]
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

   this.fileNameList = [];

   this.fileNameList.push("file:script/../test/testcases/csv_example_format1_20240215.csv");
   this.fileNameList.push("file:script/../test/testcases/csv_example_format2_20250324.csv");
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

TestImportSumupTrans.prototype.testImportDoubleEntry = function () {
   let ac2File = "file:script/../test/testcases/Double-entry.ac2";

   let parentLogger = this.testLogger;
   this.progressBar.start(this.fileNameList.length);
   let banDocument = Banana.application.openDocument(ac2File);

   if (!banDocument)
      parentLogger.addFatalError("File not found: " + ac2File);

   for (let i = 0; i < this.fileNameList.length; i++) {
      let fileName = this.fileNameList[i];
      let loggerName = Banana.IO.fileCompleteBaseName(ac2File) + ";" + Banana.IO.fileCompleteBaseName(fileName);
      this.testLogger = parentLogger.newLogger(loggerName);

      let file = Banana.IO.getLocalFile(fileName);
      Test.assert(file);
      let fileContent = file.read();
      Test.assert(fileContent);
      let userParam = getUserParam_DoubleEntry(i);
      let transactions = processSumUpTransactions(fileContent, userParam, banDocument);
      this.testLogger.addCsv('', transactions);

      if (!this.progressBar.step())
         break;
   }

   this.progressBar.finish();
}
TestImportSumupTrans.prototype.testImportIncomeExpenses = function () {
   let ac2File = "file:script/../test/testcases/Income & Expense.ac2";

   let parentLogger = this.testLogger;
   this.progressBar.start(this.fileNameList.length);
   let banDocument = Banana.application.openDocument(ac2File);

   if (!banDocument)
      parentLogger.addFatalError("File not found: " + ac2File);

   for (let i = 0; i < this.fileNameList.length; i++) {

      let fileName = this.fileNameList[i];
      let loggerName = Banana.IO.fileCompleteBaseName(ac2File) + ";" + Banana.IO.fileCompleteBaseName(fileName);
      this.testLogger = parentLogger.newLogger(loggerName);

      let file = Banana.IO.getLocalFile(fileName);
      Test.assert(file);
      let fileContent = file.read();
      Test.assert(fileContent);
      let userParam = getUserParam_IncomeExpenses(i);
      let transactions = processSumUpTransactions(fileContent, userParam, banDocument);
      this.testLogger.addCsv('', transactions);

      if (!this.progressBar.step())
         break;
   }

   this.progressBar.finish();
}

function getUserParam_DoubleEntry(index) {
   var params = {};

   if (index === 0)
      params.dateFormat = "dd/mm/yyyy";
   else
      params.dateFormat = "yyyy-mm-dd";

   params.bankAccount = "1020";
   params.sumUpIn = "3001";
   params.cashAccount = "1000";
   params.sumUpFee = "4001";

   return params;

}

function getUserParam_IncomeExpenses(index) {
   var params = {};

   if (index === 0)
      params.dateFormat = "dd/mm/yyyy";
   else
      params.dateFormat = "yyyy-mm-dd";

   params.bankAccount = "1020";
   params.sumUpIn = "3000";
   params.cashAccount = "1000";
   params.sumUpFee = "5001";

   return params;

}