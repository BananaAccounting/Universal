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

// @id = ch.banana.portfolio.accounting.calculate.unit.price.test
// @api = 1.0
// @pubdate = 2025-01-22
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.portfolio.accounting.calculate.unit.price.test>
// @task = app.command
// @doctype = *.*
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @includejs = ../ch.banana.portfolio.accounting.calculation.methods.js
// @includejs = ../ch.banana.portfolio.accounting.calculate.unit.price.js
// @timeout = -1

// Register test case to be executed
Test.registerTestCase(new TestCalculateUnitPrice());

// Here we define the class, the name of the class is not important
function TestCalculateUnitPrice() {
}

// This method will be called at the beginning of the test case
TestCalculateUnitPrice.prototype.initTestCase = function () {
    this.testLogger = Test.logger;
    this.progressBar = Banana.application.progressBar;

    let fileName = "file:script/../test/testcases/portfolio_accounting_double_entry_multi_currency_tutorial_salesrecordtest_2024.ac2";
    this.banDoc = Banana.application.openDocument(fileName);
    if (!this.banDoc) {
        this.testLogger.addFatalError("File not found: " + fileName);
        return;
    }

    this.docInfo = getDocumentInfo(this.banDoc);

}

// This method will be called at the end of the test case
TestCalculateUnitPrice.prototype.cleanupTestCase = function () {

}

// This method will be called before every test method is executed
TestCalculateUnitPrice.prototype.init = function () {

}

// This method will be called after every test method is executed
TestCalculateUnitPrice.prototype.cleanup = function () {

}

TestCalculateUnitPrice.prototype.testRecordSalesTransactions = function () {

    let docChange = {};
    let currentRowObj = {};
    let currentRowNr = "";
    let qtSold = "";

    // Add test main section
    this.testLogger.addSection("Test: Calculate unit price");

    // Add test sub sections

    //Row 7
    currentRowNr = 7;
    qtSold = "100";
    this.testLogger.addSubSection("Row: 7");
    currentRowObj = getCurrentRowObj(this.banDoc, currentRowNr, "Transactions");
    docChange = getUnitPriceDocChange(this.banDoc, this.docInfo, currentRowObj, currentRowNr, qtSold);
    this.testLogger.addJson("Row:7", JSON.stringify(docChange));
    // Row 21
    currentRowNr = 21;
    qtSold = "100";
    this.testLogger.addSubSection("Row: 21");
    currentRowObj = getCurrentRowObj(this.banDoc, currentRowNr, "Transactions");
    docChange = getUnitPriceDocChange(this.banDoc, this.docInfo, currentRowObj, currentRowNr, qtSold);
    this.testLogger.addJson("Row:21", JSON.stringify(docChange));
    // Row 28
    currentRowNr = 28;
    qtSold = "100";
    this.testLogger.addSubSection("Row: 28");
    currentRowObj = getCurrentRowObj(this.banDoc, currentRowNr, "Transactions");
    docChange = getUnitPriceDocChange(this.banDoc, this.docInfo, currentRowObj, currentRowNr, qtSold);
    this.testLogger.addJson("Row:28", JSON.stringify(docChange));

    // Row 47
    currentRowNr = 47;
    qtSold = "5000";
    this.testLogger.addSubSection("Row: 47");
    currentRowObj = getCurrentRowObj(this.banDoc, currentRowNr, "Transactions");
    docChange = getUnitPriceDocChange(this.banDoc, this.docInfo, currentRowObj, currentRowNr, qtSold);
    this.testLogger.addJson("Row:47", JSON.stringify(docChange));

    // Row 68
    currentRowNr = 68;
    qtSold = "150";
    this.testLogger.addSubSection("Row: 68");
    currentRowObj = getCurrentRowObj(this.banDoc, currentRowNr, "Transactions");
    docChange = getUnitPriceDocChange(this.banDoc, this.docInfo, currentRowObj, currentRowNr, qtSold);
    this.testLogger.addJson("Row:68", JSON.stringify(docChange));
}