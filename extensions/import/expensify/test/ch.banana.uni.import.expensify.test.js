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


// @id = ch.banana.uni.import.expensify.test
// @api = 1.0
// @pubdate = 2025-02-24
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.uni.import.expensify.test>
// @task = app.command
// @doctype = *.*
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @includejs = ../ch.banana.uni.import.expensify.sbaa/import.utilities.js
// @includejs = ../ch.banana.uni.import.expensify.sbaa/ch.banana.uni.import.expensify.js
// @timeout = -1

// Register test case to be executed
Test.registerTestCase(new TestImportExpensifyTrans());

// Here we define the class, the name of the class is not important
function TestImportExpensifyTrans() {
}

// This method will be called at the beginning of the test case
TestImportExpensifyTrans.prototype.initTestCase = function () {
   this.testLogger = Test.logger;
   this.progressBar = Banana.application.progressBar;
}

// This method will be called at the end of the test case
TestImportExpensifyTrans.prototype.cleanupTestCase = function () {

}

// This method will be called before every test method is executed
TestImportExpensifyTrans.prototype.init = function () {

}

// This method will be called after every test method is executed
TestImportExpensifyTrans.prototype.cleanup = function () {

}

TestImportExpensifyTrans.prototype.testImport = function () {
   var fileNameList = [];

   fileNameList.push("file:script/../test/testcases/csv_expensify_example_format1_2024_07_09.csv");

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