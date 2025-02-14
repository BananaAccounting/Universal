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


// @id = ch.banana.portfolio.accounting.update.market.prices.test
// @api = 1.0
// @pubdate = 2025-02-14
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.portfolio.accounting.update.market.prices.test>
// @task = app.command
// @doctype = *.*
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @timeout = -1
// @includejs = ../ch.banana.portfolio.accounting.calculation.methods.js
// @includejs = ../ch.banana.portfolio.accounting.update.market.prices.js

// Register test case to be executed
Test.registerTestCase(new TestUpdateMarketPricesTrans());

// Here we define the class, the name of the class is not important
function TestUpdateMarketPricesTrans() {
}

// This method will be called at the beginning of the test case
TestUpdateMarketPricesTrans.prototype.initTestCase = function () {
   this.testLogger = Test.logger;
   this.progressBar = Banana.application.progressBar;
}

// This method will be called at the end of the test case
TestUpdateMarketPricesTrans.prototype.cleanupTestCase = function () {

}

// This method will be called before every test method is executed
TestUpdateMarketPricesTrans.prototype.init = function () {

}

// This method will be called after every test method is executed
TestUpdateMarketPricesTrans.prototype.cleanup = function () {

}

TestUpdateMarketPricesTrans.prototype.testImport = function () {
   var fileNameList = [];

   fileNameList.push("file:script/../test/testcases/market_values.csv");

   let fileAc2 = "file:script/../test/testcases/portfolio_accounting_double_entry_multi_currency_tutorial_salesrecordtest_2025.ac2";
   let banDoc = Banana.application.openDocument(fileAc2);
   if (!banDoc)
      this.testLogger.addFatalError("ac2 file not valid: " + fileAc2);

   var parentLogger = this.testLogger;
   this.progressBar.start(fileNameList.length);

   for (var i = 0; i < fileNameList.length; i++) {
      var fileName = fileNameList[i];
      this.testLogger = parentLogger.newLogger(Banana.IO.fileCompleteBaseName(fileName));

      var file = Banana.IO.getLocalFile(fileName)
      Test.assert(file);
      var fileContent = file.read();
      Test.assert(fileContent);
      let arrData = getArrayData(fileContent);
      arrData = validateData(banDoc, arrData);
      let docChange = getDocChange(banDoc, arrData);
      this.testLogger.addJson('', JSON.stringify(docChange));

      if (!this.progressBar.step())
         break;
   }

   this.progressBar.finish();
   this.testLogger.close();
}