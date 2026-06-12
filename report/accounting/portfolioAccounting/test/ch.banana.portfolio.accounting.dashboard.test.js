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


// @id = ch.banana.portfolio.accounting.dashboard.test
// @api = 1.0
// @pubdate = 2026-06-11
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.portfolio.accounting.dashboard.test>
// @task = app.command
// @doctype = *.*
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @includejs = ../ch.banana.portfolio.accounting.calculation.methods.js
// @includejs = ../ch.banana.portfolio.accounting.charts.js
// @timeout = -1

// Register test case to be executed
Test.registerTestCase(new TestDashboard());

// Here we define the class, the name of the class is not important
function TestDashboard() {
}

// This method will be called at the beginning of the test case
TestDashboard.prototype.initTestCase = function () {
    this.testLogger = Test.logger;
    this.progressBar = Banana.application.progressBar;
}

// This method will be called at the end of the test case
TestDashboard.prototype.cleanupTestCase = function () {

}

// This method will be called before every test method is executed
TestDashboard.prototype.init = function () {

}

// This method will be called after every test method is executed
TestDashboard.prototype.cleanup = function () {

}

/**
 * Test methods from: ch.banana.portfolio.accounting.calculation.methods.js that
 * returns and prepares data shown in the Dashboard.
 */

TestDashboard.prototype.testDashBoardData = function () {

    let dashboardData = "";
    let logger = this.testLogger.newLogger("testDashBoardData");

    /**Test 1.
     * In the accounting file, end year adjustments are not registered yet.
     */
    fileName = "file:script/../test/testcases/dashboard/portfolio_accounting_double_entry_multi_currency_tutorial_withoutadjustments.ac2";
    banDoc = Banana.application.openDocument(fileName);
    Test.assert(banDoc);
    dashboardData = getPortfolioDashboardData(banDoc);
    dashboardData.asOfDate =  "11.06.2026"; // Set fix date.
    logger.addSection("Test 1.");
    logger.addJson("Dashboard data", JSON.stringify(dashboardData));

    /**Test 2.
     * Same accounting data as Test 1 but adjustments are registered. Unrealized gain or losses must be 0.
     */
    fileName = "file:script/../test/testcases/dashboard/portfolio_accounting_double_entry_multi_currency_tutorial_withadjustments.ac2";
    banDoc = Banana.application.openDocument(fileName);
    Test.assert(banDoc);
    dashboardData = getPortfolioDashboardData(banDoc);
    dashboardData.asOfDate =  "11.06.2026"; // Set fix date.
    logger.addSection("Test 2.");
    logger.addJson("Dashboard data", JSON.stringify(dashboardData));

    logger.close();
}

/**
 * Test methods from: ch.banana.portfolio.accounting.calculation.methods.js that
 * returns the history of average cost for each security, data shown in the 
 * Graphs.
 */
TestDashboard.prototype.testSecurityAverageCostHistory = function () {

    let dashboardData = "";
    let logger = this.testLogger.newLogger("testSecurityAverageCostHistory");
    let itemsData = {};

    /**Test 1.
     * In the accounting file, end year adjustments are not registered yet.
     */
    fileName = "file:script/../test/testcases/dashboard/portfolio_accounting_double_entry_multi_currency_tutorial_withoutadjustments.ac2";
    banDoc = Banana.application.openDocument(fileName);
    Test.assert(banDoc);
    itemsData = getItemsTableData(banDoc);
    Test.assert(itemsData);
    logger.addSection("Test 1.");
    for (let i = 0; i < itemsData.length; i++) {
        const item = itemsData[i];
        Test.assert(item);
        let itemId = item.item;
        let historyData = getSecurityAverageCostHistory(banDoc, itemId);
        logger.addJson("Item history data", JSON.stringify(historyData));
    }

    /**Test 2.
     * Same accounting data as Test 1 but adjustments are registered. Unrealized gain or losses must be 0.
     */
    fileName = "file:script/../test/testcases/dashboard/portfolio_accounting_double_entry_multi_currency_tutorial_withadjustments.ac2";
    banDoc = Banana.application.openDocument(fileName);
    Test.assert(banDoc);
    itemsData = getItemsTableData(banDoc);
    Test.assert(itemsData);
    logger.addSection("Test 2.");
    for (let i = 0; i < itemsData.length; i++) {
        const item = itemsData[i];
        Test.assert(item);
        let itemId = item.item;
        let historyData = getSecurityAverageCostHistory(banDoc, itemId);
        logger.addJson("Item history data", JSON.stringify(historyData));
    }
    logger.close();
}