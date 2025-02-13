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

// @id = ch.banana.portfolio.accounting.check.balances.data.test
// @api = 1.0
// @pubdate = 2025-02-11
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.portfolio.accounting.check.balances.data.test>
// @task = app.command
// @doctype = *.*
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @includejs = ../ch.banana.portfolio.accounting.calculation.methods.js
// @includejs = ../ch.banana.portfolio.accounting.check.balances.data.js
// @timeout = -1

// Register test case to be executed
Test.registerTestCase(new TestCheckBalancesData());

// Here we define the class, the name of the class is not important
function TestCheckBalancesData() {
}

// This method will be called at the beginning of the test case
TestCheckBalancesData.prototype.initTestCase = function () {
    this.testLogger = Test.logger;
    this.progressBar = Banana.application.progressBar;

    let fileName = "file:script/../test/testcases/portfolio_accounting_double_entry_multi_currency_tutorial_salesrecordtest_2025.ac2";
    this.banDoc = Banana.application.openDocument(fileName);
    if (!this.banDoc) {
        this.testLogger.addFatalError("File not found: " + fileName);
        return;
    }

    this.docInfo = getDocumentInfo(this.banDoc);
}

// This method will be called at the end of the test case
TestCheckBalancesData.prototype.cleanupTestCase = function () {

}

// This method will be called before every test method is executed
TestCheckBalancesData.prototype.init = function () {

}

// This method will be called after every test method is executed
TestCheckBalancesData.prototype.cleanup = function () {

}

TestCheckBalancesData.prototype.testRecordSalesTransactions = function () {

    let testDataObj = {};
    this.testLogger.addSection("TestCheckBalancesData");
    testDataObj.data = getAccountsDataObjList(this.banDoc, this.docInfo);
    this.testLogger.addSubSection("Object data");
    // We add first the accounts calculated data.
    this.testLogger.addJson("ObjectData", JSON.stringify(testDataObj));
    //Then we add the complete report.
    let report = getReport(this.banDoc, this.docInfo, testDataObj);
    this.testLogger.addSubSection("Report data");
    this.testLogger.addReport("ReportData", report);
}

/**
 * Generate adjustment transactions. The current data is:
 */
function getTestAccountsDataObj(banDoc, docInfo) {

}