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

    // File Year 2024
    let fileName2024 = "file:script/../test/testcases/portfolio_accounting_double_entry_multi_currency_tutorial_salesrecordtest_2024.ac2";
    this.banDoc2024 = Banana.application.openDocument(fileName2024);
    if (!this.banDoc2024) {
        this.testLogger.addFatalError("File not found: " + fileName2024);
        return;
    }
    this.docInfo2024 = getDocumentInfo(this.banDoc2024);
    this.itemsData2024 = getItemsTableData(this.banDoc2024, this.docInfo2024);

    // File Year 2025
    let fileName2025 = "file:script/../test/testcases/portfolio_accounting_double_entry_multi_currency_tutorial_salesrecordtest_2025.ac2";
    this.banDoc2025 = Banana.application.openDocument(fileName2025);
    if (!this.banDoc2025) {
        this.testLogger.addFatalError("File not found: " + fileName2025);
        return;
    }
    this.docInfo2025 = getDocumentInfo(this.banDoc2025);
    this.itemsData2025 = getItemsTableData(this.banDoc2025, this.docInfo2025);

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
 * 
 * Keep in mind that changes are not really applied to the document as we can not create a copy of
 * the original file and modify it instead of the original one.
 * 
 * For the cases where we ask the user to overwwrite the existing transactions, we return always true as
 * no real changes are applied to the document, just to have in the test the document change object.
 */
TestCalcSalesDialog.prototype.testRecordSalesTransactions = function () {

    let testDataObj = {}
    // Test 1, Share
    testDataObj = getTestData_1(this.banDoc2024, this.docInfo2024, this.itemsData2024);
    this.testLogger.addSection("Test 1: Sell All Unicredit Shares purchased before.");
    this.testLogger.addSubSection("Test 1: Calculated Data");
    this.testLogger.addJson("Test 1", JSON.stringify(testDataObj.calcSaleData));
    this.testLogger.addSubSection("Test 1: Recorded Data");
    this.testLogger.addJson("Test 1", JSON.stringify(testDataObj.recordsSalesTransactions));
    // Test 2, Share
    testDataObj = getTestData_2(this.banDoc2024, this.docInfo2024, this.itemsData2024);
    this.testLogger.addSection("Test 2: Sell first half of Netflix shares purchased before.");
    this.testLogger.addSubSection("Test 2: Calculated Data");
    this.testLogger.addJson("Test 2", JSON.stringify(testDataObj.calcSaleData));
    this.testLogger.addSubSection("Test 2: Recorded Data");
    this.testLogger.addJson("Test 2", JSON.stringify(testDataObj.recordsSalesTransactions));
    // Test 3, Share
    testDataObj = getTestData_3(this.banDoc2024, this.docInfo2024, this.itemsData2024);
    this.testLogger.addSection("Test 3: Sell second half of Netflix shares purchased before.");
    this.testLogger.addSubSection("Test 3: Calculated Data");
    this.testLogger.addJson("Test 3", JSON.stringify(testDataObj.calcSaleData));
    this.testLogger.addSubSection("Test 3: Recorded Data");
    this.testLogger.addJson("Test 3", JSON.stringify(testDataObj.recordsSalesTransactions));
    // Test 4, Bond
    testDataObj = getTestData_4(this.banDoc2024, this.docInfo2024, this.itemsData2024);
    this.testLogger.addSection("Test 4: Sell all Bnp Paribas Bonds purchased before.");
    this.testLogger.addSubSection("Test 4: Calculated Data");
    this.testLogger.addJson("Test 4", JSON.stringify(testDataObj.calcSaleData));
    this.testLogger.addSubSection("Test 4: Recorded Data");
    this.testLogger.addJson("Test 4", JSON.stringify(testDataObj.recordsSalesTransactions));
    // Test 5, Share
    testDataObj = getTestData_5(this.banDoc2024, this.docInfo2024, this.itemsData2024);
    this.testLogger.addSection("Test 5: Sell part of BancaStato shares purchased before.");
    this.testLogger.addSubSection("Test 5: Calculated Data");
    this.testLogger.addJson("Test 5", JSON.stringify(testDataObj.calcSaleData));
    this.testLogger.addSubSection("Test 5: Recorded Data");
    this.testLogger.addJson("Test 5", JSON.stringify(testDataObj.recordsSalesTransactions));
    // Test 6, Share
    testDataObj = getTestData_6(this.banDoc2025, this.docInfo2025, this.itemsData2025);
    this.testLogger.addSection("Test 6: Sell all UBS shares purchased in the previous year.");
    this.testLogger.addSubSection("Test 6: Calculated Data");
    this.testLogger.addJson("Test 6", JSON.stringify(testDataObj.calcSaleData));
    this.testLogger.addSubSection("Test 6: Recorded Data");
    this.testLogger.addJson("Test 6", JSON.stringify(testDataObj.recordsSalesTransactions));
    // Test 7, Share
    testDataObj = getTestData_7(this.banDoc2025, this.docInfo2025, this.itemsData2025);
    this.testLogger.addSection("Test 7: Sell an another part of BancaStato shares purchased in the previous year.");
    this.testLogger.addSubSection("Test 7: Calculated Data");
    this.testLogger.addJson("Test 7", JSON.stringify(testDataObj.calcSaleData));
    this.testLogger.addSubSection("Test 7: Recorded Data");
    this.testLogger.addJson("Test 7", JSON.stringify(testDataObj.recordsSalesTransactions));

}

/**
 * Test 1. (Accounting 2024)
 * Sell All Unicredit Shares purchased before. Row correctly filled with the following data:
 * - ISIN: IT0005239360
 * - Qt: 100
 * - Current (Market) Price: 9.5000
 * - Exhange rate: 1.150000
 * - Bank Charges: 25.00
 * Loss on sale, profit on exchange, full sale.
 * Rows already contains the sales code into the External reference column, so the result
 * must show just the rows to mofify (overwrite existent set always to yes), without any change to first one.
 */
function getTestData_1(banDoc, docInfo, itemsData) {

    let testDataObj = {};
    testDataObj.calcSaleData = {};
    testDataObj.recordsSalesTransactions = {};

    let userParams = {};
    let itemObj = {};
    let calcSaleData = {};
    let currentRowNr = -1;
    let currentRowObj = {};

    // Calculate Data
    userParams = getUserParams("1");
    itemObj = itemsData.find(obj => obj.item === userParams.selectedItem);
    currentRowNr = 7;
    currentRowObj = getCurrentRowObj(banDoc, currentRowNr, "Transactions");
    calcSaleData = calculateStockSaleData(banDoc, docInfo, itemObj, userParams, currentRowNr);
    const recordSalesTransactions = new RecordSalesTransactions(banDoc, docInfo, calcSaleData,
        userParams, itemsData, itemObj, currentRowObj, false);

    //Save the data into test object
    testDataObj.calcSaleData = calcSaleData;
    testDataObj.recordsSalesTransactions = recordSalesTransactions.getRecordSalesTransactions();

    return testDataObj;
}

/**
 * Test 2. (Accounting 2024)
 * Sell half of Netflix shares purchased before. Row correctly filled with the following data:
 * - ISIN: US123456789
 * - Qt: 100
 * - Current (Market) Price: 11.5000
 * - Exhange rate: 0.970000
 * - Bank Charges: 42.110
 * Profit on sale, profit on exchange, first half sale
 * Rows does not contains yet the sale code. The result must show the rows to add and the first one modified
 * with the new sale code created, wich should be inv_sale_3
 */
function getTestData_2(banDoc, docInfo, itemsData) {
    let testDataObj = {};
    testDataObj.calcSaleData = {};
    testDataObj.recordsSalesTransactions = {};

    let userParams = {};
    let itemObj = {};
    let calcSaleData = {};
    let currentRowNr = -1;
    let currentRowObj = {};

    // Calculate Data
    userParams = getUserParams("2");
    itemObj = itemsData.find(obj => obj.item === userParams.selectedItem);
    currentRowNr = 21;
    currentRowObj = getCurrentRowObj(banDoc, currentRowNr, "Transactions");
    calcSaleData = calculateStockSaleData(banDoc, docInfo, itemObj, userParams, currentRowNr);
    const recordSalesTransactions = new RecordSalesTransactions(banDoc, docInfo, calcSaleData,
        userParams, itemsData, itemObj, currentRowObj, false);

    //Save the data into test object
    testDataObj.calcSaleData = calcSaleData;
    testDataObj.recordsSalesTransactions = recordSalesTransactions.getRecordSalesTransactions();

    return testDataObj;
}

/**
 * Test 3. (Accounting 2024)
 * Sell the second half of Netflix shares purchased before. Row correctly filled with the following data:
 * - ISIN: US123456789
 * - Qt: 100
 * - Current (Market) Price: 11.5562
 * - Exhange rate: 0.945
 * - Bank Charges: 42.33
 * Profit on sale, loss on exchange, second half sale
 * First row contains a custom code in ExternalReference column, wich should be replaced by the
 * automatically generated one: inv_sale_3 (overwrite existent set always to yes).
 * The other rows do not contains any sale code, so for them is added a new one.
 */
function getTestData_3(banDoc, docInfo, itemsData) {
    let testDataObj = {};
    testDataObj.calcSaleData = {};
    testDataObj.recordsSalesTransactions = {};

    let userParams = {};
    let itemObj = {};
    let calcSaleData = {};
    let currentRowNr = -1;
    let currentRowObj = {};

    // Calculate Data
    userParams = getUserParams("3");
    itemObj = itemsData.find(obj => obj.item === userParams.selectedItem);
    currentRowNr = 28;
    currentRowObj = getCurrentRowObj(banDoc, currentRowNr, "Transactions");
    calcSaleData = calculateStockSaleData(banDoc, docInfo, itemObj, userParams, currentRowNr);
    const recordSalesTransactions = new RecordSalesTransactions(banDoc, docInfo, calcSaleData,
        userParams, itemsData, itemObj, currentRowObj, false);

    //Save the data into test object
    testDataObj.calcSaleData = calcSaleData;
    testDataObj.recordsSalesTransactions = recordSalesTransactions.getRecordSalesTransactions();

    return testDataObj;
}

/**
 * Test 4. (Accounting 2024)
 * Sell all the Bnp Paribas bonds. Row correctly filled with the following data:
 * - ISIN: IT000792468
 * - Qt (Nominal value): -5000.00
 * - Current (Market) Price: 1.025
 * - Exhange rate: 1.13
 * - Bank Charges: 55.00
 * - Accrued interests: 25.56
 * Profit on sale, profit on exchange.
 * Rows does not contains yet the sale code. The result must show the rows to add and the first one modified
 * with the new sale code created, wich should be inv_sale_3
 */

function getTestData_4(banDoc, docInfo, itemsData) {
    let testDataObj = {};
    testDataObj.calcSaleData = {};
    testDataObj.recordsSalesTransactions = {};

    let userParams = {};
    let itemObj = {};
    let calcSaleData = {};
    let currentRowNr = -1;
    let currentRowObj = {};

    // Calculate Data
    userParams = getUserParams("4");
    itemObj = itemsData.find(obj => obj.item === userParams.selectedItem);
    currentRowNr = 47;
    currentRowObj = getCurrentRowObj(banDoc, currentRowNr, "Transactions");
    calcSaleData = calculateStockSaleData(banDoc, docInfo, itemObj, userParams, currentRowNr);
    const recordSalesTransactions = new RecordSalesTransactions(banDoc, docInfo, calcSaleData,
        userParams, itemsData, itemObj, currentRowObj, false);

    //Save the data into test object
    testDataObj.calcSaleData = calcSaleData;
    testDataObj.recordsSalesTransactions = recordSalesTransactions.getRecordSalesTransactions();

    return testDataObj;
}

/**
 * Test 5. (Accounting 2024)
 * Sell some of the Bancastato shares
 * - ISIN: CH002775224
 * - Qt : -150.00
 * - Current (Market) Price: 5.7944
 * - Exhange rate: 1.00
 * - Bank Charges: 15.00
 * Loss on sale
 * Rows constains already the correct sale codes (inv_sale_2, inv_sale_2.1, ...)
 * We should See only three rows modified (overwrited as already exists) while the main row is already on the 
 * correct format.
 */
function getTestData_5(banDoc, docInfo, itemsData) {
    let testDataObj = {};
    testDataObj.calcSaleData = {};
    testDataObj.recordsSalesTransactions = {};

    let userParams = {};
    let itemObj = {};
    let calcSaleData = {};
    let currentRowNr = -1;
    let currentRowObj = {};

    // Calculate Data
    userParams = getUserParams("5");
    itemObj = itemsData.find(obj => obj.item === userParams.selectedItem);
    currentRowNr = 68;
    currentRowObj = getCurrentRowObj(banDoc, currentRowNr, "Transactions");
    calcSaleData = calculateStockSaleData(banDoc, docInfo, itemObj, userParams, currentRowNr);
    const recordSalesTransactions = new RecordSalesTransactions(banDoc, docInfo, calcSaleData,
        userParams, itemsData, itemObj, currentRowObj, false);

    //Save the data into test object
    testDataObj.calcSaleData = calcSaleData;
    testDataObj.recordsSalesTransactions = recordSalesTransactions.getRecordSalesTransactions();

    return testDataObj;
}

/**
 * Test 6. (Accounting 2025)
 * Sell all the UBS Shares purchased the previous year.
 * - ISIN: CH003886335
 * - Qt : -200.00
 * - Current (Market) Price: 12.75
 * - Exhange rate: 1.00
 * - Bank Charges: 22
 * Loss on sale
 * Rows constains already the correct sale codes (inv_sale_1, inv_sale_1.2, ...)
 * We should See only three rows modified (overwrited as already exists) while the main row is already on the 
 * correct format.
 */
function getTestData_6(banDoc, docInfo, itemsData) {
    let testDataObj = {};
    testDataObj.calcSaleData = {};
    testDataObj.recordsSalesTransactions = {};

    let userParams = {};
    let itemObj = {};
    let calcSaleData = {};
    let currentRowNr = -1;
    let currentRowObj = {};

    // Calculate Data
    userParams = getUserParams("6");
    itemObj = itemsData.find(obj => obj.item === userParams.selectedItem);
    currentRowNr = 3;
    currentRowObj = getCurrentRowObj(banDoc, currentRowNr, "Transactions");
    calcSaleData = calculateStockSaleData(banDoc, docInfo, itemObj, userParams, currentRowNr);
    const recordSalesTransactions = new RecordSalesTransactions(banDoc, docInfo, calcSaleData,
        userParams, itemsData, itemObj, currentRowObj, false);

    //Save the data into test object
    testDataObj.calcSaleData = calcSaleData;
    testDataObj.recordsSalesTransactions = recordSalesTransactions.getRecordSalesTransactions();

    return testDataObj;
}

/**
 * Test 7. (Accounting 2025)
 * Sell an another part of BancaStato shares.
 * - ISIN: CH002775224
 * - Qt : -200.00
 * - Current (Market) Price: 6.0201
 * - Exhange rate: 1.00
 * - Bank Charges: 15
 * Profit on sale
 * Rows constains already the correct sale codes (inv_sale_2, inv_sale_2.1, ...)
 * We should See only three rows modified (overwrited as already exists) while the main row is already on the 
 * correct format.
 */
function getTestData_7(banDoc, docInfo, itemsData) {
    let testDataObj = {};
    testDataObj.calcSaleData = {};
    testDataObj.recordsSalesTransactions = {};

    let userParams = {};
    let itemObj = {};
    let calcSaleData = {};
    let currentRowNr = -1;
    let currentRowObj = {};

    // Calculate Data
    userParams = getUserParams("7");
    itemObj = itemsData.find(obj => obj.item === userParams.selectedItem);
    currentRowNr = 8;
    currentRowObj = getCurrentRowObj(banDoc, currentRowNr, "Transactions");
    calcSaleData = calculateStockSaleData(banDoc, docInfo, itemObj, userParams, currentRowNr);
    const recordSalesTransactions = new RecordSalesTransactions(banDoc, docInfo, calcSaleData,
        userParams, itemsData, itemObj, currentRowObj, false);

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
        case "2":
            params.selectedItem = "US123456789";
            params.quantity = "100";
            params.marketPrice = "11.5000";
            params.currExRate = "0.970000";
            params.bankCharges = "40.85";
            return params;
        case "3":
            params.selectedItem = "US123456789";
            params.quantity = "100";
            params.marketPrice = "11.5562";
            params.currExRate = "0.945";
            params.bankCharges = "42.33";
            return params;
        case "4":
            params.selectedItem = "IT000792468";
            params.quantity = "5000";
            params.marketPrice = "1.025";
            params.currExRate = "1.13";
            params.bankCharges = "55.00";
            params.accruedInterests = "25.560";
            return params;
        case "5":
            params.selectedItem = "CH002775224";
            params.quantity = "150";
            params.marketPrice = "5.7944";
            params.currExRate = "1.00";
            params.bankCharges = "15.00";
            return params;
        case "6":
            params.selectedItem = "CH003886335";
            params.quantity = "200";
            params.marketPrice = "12.75";
            params.currExRate = "1.00";
            params.bankCharges = "22.00";
            return params;
        case "7":
            params.selectedItem = "CH002775224";
            params.quantity = "200";
            params.marketPrice = "6.0201";
            params.currExRate = "1.00";
            params.bankCharges = "22.00";
            return params;
        default:
            return params;
    }
}