// Copyright [2026] [Banana.ch SA - Lugano Switzerland]
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

// @id = ch.banana.portfolio.accounting.record.adjustment.transactions.test
// @api = 1.0
// @pubdate = 2026-02-24
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.portfolio.accounting.record.adjustment.transactions.test>
// @task = app.command
// @doctype = *.*
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @includejs = ../ch.banana.portfolio.accounting.calculation.methods.js
// @includejs = ../ch.banana.portfolio.accounting.record.adjustment.transactions.js
// @includejs = ../ch.banana.portfolio.accounting.accounts.dialog.js
// @timeout = -1

// Register test case to be executed
Test.registerTestCase(new TestAdjustmentTransactions());

// Here we define the class, the name of the class is not important
function TestAdjustmentTransactions() {
}

// This method will be called at the beginning of the test case
TestAdjustmentTransactions.prototype.initTestCase = function () {
    this.testLogger = Test.logger;
    this.progressBar = Banana.application.progressBar;

}

// This method will be called at the end of the test case
TestAdjustmentTransactions.prototype.cleanupTestCase = function () {

}

// This method will be called before every test method is executed
TestAdjustmentTransactions.prototype.init = function () {

}

// This method will be called after every test method is executed
TestAdjustmentTransactions.prototype.cleanup = function () {

}

TestAdjustmentTransactions.prototype.testRecordSalesTransactions = function () {

    let docChange = {};
    let fileName = "";
    let banDoc = {};
    /** Test 1
     * Generate adjustment transactions. 
     * In this test case, are always used the same exchange rate for each transaction, that means,
     * adjustment are created only for the price.
     * The current data is:
     * - CH003886335: Book value: 12.8226, Market value: 12.8001, Qt 200 -> price un.loss
     * - CH002775224: Book value: 5.9876, Market value: 5.9998, Qt 250 -> price un.profit
     * - IT0005239360: Book value: 10.0000, Market value: 9.50, Qt 100 -> price un.loss
     * - US123456789: Book value: 11.0000, Market value: 11.5562, Qt 100 -> price un.profit
     * - IT000792468: Book value: 0.9800, Market value: 1.025, Qt 5000 -> price un.profit
     */
    fileName = "file:script/../test/testcases/portfolio_accounting_double_entry_multi_currency_tutorial_adjustmenttest_2024.ac2";
    banDoc = Banana.application.openDocument(fileName);
    Test.assert(banDoc);
    docChange = getTestData(banDoc);
    this.testLogger.addSection("Adjustment transactions document change 1.");
    this.testLogger.addJson("Doc Change object", JSON.stringify(docChange));

    /** Test 2
     * !!! This test could give differences if runned with a Banana version lower than: 10.2.6.65535 as a different API method is used. !!!
     * Generate adjustment transactions. 
     * The current data is:
     * - QQQ: Book value: 400.00, Market value: 380.00, Qt 50, Acc ExRate: 1.42, Actual ExRate: 1.175  -> price un.loss, ExRate profit
     * - IBB1: Book value: 5.9876, Market value: 5.9998, Qt 250, Acc ExRate: 1.00, Actual ExRate: 1.00 -> price un.profit
     */
    fileName = "file:script/../test/testcases/portfolio_accounting_double_entry_multi_currency_tutorial_adjustmenttest_2026.ac2";
    banDoc = Banana.application.openDocument(fileName);
    Test.assert(banDoc);
    docChange = getTestData(banDoc);
    this.testLogger.addSection("Adjustment transactions document change 2.");
    this.testLogger.addJson("Doc Change object", JSON.stringify(docChange));

    /** Test 3
     * Generate adjustment transactions, single currency file.
     * The current data is:
     * - CH003886335: Book value: 11.00, Market value: 12.10, Qt 5, -> price un.profit
     * - CH012775214: Book value: 10.00, Market value: 9.15, Qt 50, price un.loss
     * */
    fileName = "file:script/../test/testcases/portfolio_accounting_double_entry_tutorial_adjustmenttest_2026.ac2";
    banDoc = Banana.application.openDocument(fileName);
    Test.assert(banDoc);
    docChange = getTestData(banDoc);
    this.testLogger.addSection("Adjustment transactions document change 3.");
    this.testLogger.addJson("Doc Change object", JSON.stringify(docChange));
}

function getTestData(banDoc) {
    let dlgAccountsSettingsId = "ch.banana.portfolio.accounting.accounts.dialog";
    const docInfo = getDocumentInfo(banDoc);

    let itemsData = getItemsTableData(banDoc);

    let savedAccountsParams = getFormattedSavedParams(banDoc, dlgAccountsSettingsId);
    savedAccountsParams = verifyAccountsParams(banDoc, savedAccountsParams);

    let savedMarketValuesParams = initAdjustmentDialogParams(banDoc, docInfo, itemsData);
    savedMarketValuesParams.date = ""; // Date remains empty.

    const adjustmentTransactionsManager = new AdjustmentTransactionsManager(banDoc, docInfo, itemsData,
        savedMarketValuesParams, savedAccountsParams);

    const docObj = adjustmentTransactionsManager.getDocumentChangeObject();

    return docObj;
}