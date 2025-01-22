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


// @id = ch.banana.portfolio.accounting.calc.sales.data.dialog.test
// @api = 1.0
// @pubdate = 2025-01-22
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.portfolio.accounting.calc.sales.data.dialog.test>
// @task = app.command
// @doctype = *.*
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @includejs = ../ch.banana.portfolio.accounting.calculation.methods.js
// @includejs = ../ch.banana.portfolio.accounting.record.sales.transactions.js
// @timeout = -1

// Register test case to be executed
Test.registerTestCase(new TestCalcSalesDialog());

// Here we define the class, the name of the class is not important
function TestCalcSalesDialog() {
}

// This method will be called at the beginning of the test case
TestCalcSalesDialog.prototype.initTestCase = function () {
    this.testLogger = Test.logger;
    this.progressBar = Banana.application.progressBar;
    this.fileName = "file:script/../test/testcases/portfolio_accounting_double_entry_multi_currency_tutorial_salesrecordtest.ac2";
    this.banDoc = Banana.application.openDocument(this.fileName);
    if (!this.banDoc) {
        this.testLogger.addFatalError("File not found: " + this.fileName);
        return;
    }
    this.docInfo = getDocumentInfo(this.banDoc);
    this.itemsData = getItemsTableData(this.banDoc, this.docInfo);
}

// This method will be called at the end of the test case
TestCalcSalesDialog.prototype.cleanupTestCase = function () {

}

// This method will be called before every test method is executed
TestCalcSalesDialog.prototype.init = function () {

}

// This method will be called after every test method is executed
TestCalcSalesDialog.prototype.cleanup = function () {

}

/**
 * We test the sale of various types of securities under various conditions.
 * In the test results we save the data calculated via: calculateStockSaleData() and 
 * After that we save the transactions generated via the getRecordSalesTransactions() method.
 * We dont use (or save) the accounts saved by the user normally via "DlgInvestmentsAccounts", so
 * we work by default with the placehoder texts defined for the accounts that are not defined by the user.
 */
TestCalcSalesDialog.prototype.testRecordSalesTransactions = function () {

    // *** Ricordarsi in qualche maniere di disabilitare i messaggi se necessario, valutare ****

    let testDataObj = {}
    // Test 1
    testDataObj = getTestData_1(this.banDoc, this.docInfo, this.itemsData);
    this.testLogger.addSection("Test 1: Sell All Unicredit Shares purchased before.");
    this.testLogger.addSubSection("Test 1: Calculate Data");
    this.testLogger.addJson("Test 1", JSON.stringify(testDataObj.calcSaleData));
    this.testLogger.addSubSection("Test 1: Record Data");
    this.testLogger.addJson("Test 1", JSON.stringify(testDataObj.recordsSalesTransactions));
    // Test 2

}

/**
 * Test 1.
 * Sell All Unicredit Shares purchased before. Row correctly filled with the following data:
 * - ISIN: IT0005239360
 * - Qt: 100
 * - Current (Market) Price: 9.5000
 * - Exhange rate: 1.150000
 * - Bank Charges: 25.00
 */
function getTestData_1(banDoc, docInfo, itemsData) {

    let testDataObj = {};
    testDataObj.calcSaleData = {};
    testDataObj.recordsSalesTransactions = {};

    let userParams = {};
    let itemObj = {};
    let calcSaleData = {};
    let currentRowNr = "-1";
    let currentRowObj = {};

    // Calculate Data
    userParams = getUserParams("1");
    itemObj = itemsData.find(obj => obj.item === userParams.selectedItem);
    currentRowNr = "7";
    currentRowObj = getCurrentRowObj(banDoc, currentRowNr, "Transactions");
    calcSaleData = calculateStockSaleData(banDoc, docInfo, itemObj, userParams, currentRowNr);
    const recordSalesTransactions = new RecordSalesTransactions(banDoc, docInfo, calcSaleData,
        userParams, itemsData, itemObj, currentRowObj);

    //Save the data into test object
    testDataObj.calcSaleData = calcSaleData;
    testDataObj.recordsSalesTransactions = recordSalesTransactions.getRecordSalesTransactions();

    return testDataObj;
}

/**
 * Params object should have the following properties:
 * .selectedItem--> item selected by the user
 * .quantity--> sale qt
 * .marketPrice-->currentPrice of the stock
 * .currExrate--> current exchange rate
 * @param {*} index 
 * @returns 
 */
function getUserParams(testNr) {
    params = {};
    switch (testNr) {
        case "1":
            params.selectedItem = "IT0005239360";
            params.quantity = "100";
            params.marketPrice = "9.5000";
            params.currExRate = "1.150000";
            params.bankCharges = "25.00";
            return params;
        default:
            return params;
    }
}