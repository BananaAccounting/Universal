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


// @id = ch.banana.uni.import.revolut.test
// @api = 1.0
// @pubdate = 2025-10-16
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.uni.import.revolut.test>
// @task = app.command
// @doctype = *.*
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @includejs = ../ch.banana.uni.import.revolut.sbaa/import.utilities.js
// @includejs = ../ch.banana.uni.import.revolut.sbaa/ch.banana.uni.import.revolut.js
// @timeout = -1

// Register test case to be executed
Test.registerTestCase(new TestImportRevolutTrans());

// Here we define the class, the name of the class is not important
function TestImportRevolutTrans() {
}

// This method will be called at the beginning of the test case
TestImportRevolutTrans.prototype.initTestCase = function () {
   this.testLogger = Test.logger;
   this.progressBar = Banana.application.progressBar;
}

// This method will be called at the end of the test case
TestImportRevolutTrans.prototype.cleanupTestCase = function () {

}

// This method will be called before every test method is executed
TestImportRevolutTrans.prototype.init = function () {

}

// This method will be called after every test method is executed
TestImportRevolutTrans.prototype.cleanup = function () {

}

TestImportRevolutTrans.prototype.testImport = function () {
   var fileNameList = [];

   fileNameList.push("file:script/../test/testcases/ch.banana.revolut.transactions.business1_20222609.csv");
   fileNameList.push("file:script/../test/testcases/ch.banana.revolut.transactions.private1_20222609.csv");
   fileNameList.push("file:script/../test/testcases/ch.banana.revolut.transactions.private1_20250922_de.csv");
   fileNameList.push("file:script/../test/testcases/ch.banana.revolut.transactions.private1_20250922_it.csv");
   fileNameList.push("file:script/../test/testcases/ch.banana.revolut.transactions.business2_20222410.csv");
   fileNameList.push("file:script/../test/testcases/ch.banana.revolut.transactions.business3_20240724.csv");
   fileNameList.push("file:script/../test/testcases/ch.banana.revolut.transactions.business3_20251016.csv");
   fileNameList.push("file:script/../test/testcases/ch.banana.revolut.transactions.business_exp1_EUR_20240131.csv");
   fileNameList.push("file:script/../test/testcases/ch.banana.revolut.transactions.business_exp1_USD_20240131.csv");

   var parentLogger = this.testLogger;
   this.progressBar.start(fileNameList.length);

   for (var i = 0; i < fileNameList.length; i++) {
      var fileName = fileNameList[i];
      this.testLogger = parentLogger.newLogger(Banana.IO.fileCompleteBaseName(fileName));

      var file = Banana.IO.getLocalFile(fileName);
      Test.assert(file);
      var fileContent = file.read();
      Test.assert(fileContent);
      var transactions = exec(fileContent, true); //takes the exec from the import script.
      this.testLogger.addCsv('', transactions);

      if (!this.progressBar.step())
         break;
   }

   this.progressBar.finish();
}