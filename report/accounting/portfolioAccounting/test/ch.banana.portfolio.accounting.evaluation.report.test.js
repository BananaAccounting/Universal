// Copyright [2022] [Banana.ch SA - Lugano Switzerland]
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


// @id = ch.banana.portfolio.accounting.evaluation.report.test
// @api = 1.0
// @pubdate = 2021-03-08
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.portfolio.accounting.evaluation.report.test>
// @task = app.command
// @doctype = *.*
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @includejs = ../ch.banana.portfolio.accounting.evaluation.report.js
// @timeout = -1

// Register test case to be executed
Test.registerTestCase(new TestPortfolioEvaluationReport());

// Here we define the class, the name of the class is not important
function TestPortfolioEvaluationReport() {
}

// This method will be called at the beginning of the test case
TestPortfolioEvaluationReport.prototype.initTestCase = function () {
    this.testLogger = Test.logger;
    this.progressBar = Banana.application.progressBar;
    this.fileNameList = [];

    this.fileNameList.push("file:script/../test/testcases/portfolio_accounting_double_entry_tutorial_2022.ac2");
}

// This method will be called at the end of the test case
TestPortfolioEvaluationReport.prototype.cleanupTestCase = function () {

}

// This method will be called before every test method is executed
TestPortfolioEvaluationReport.prototype.init = function () {

}

// This method will be called after every test method is executed
TestPortfolioEvaluationReport.prototype.cleanup = function () {

}

TestPortfolioEvaluationReport.prototype.testCompleteReport = function () {
    let parentLogger = this.testLogger;
    this.progressBar.start(this.fileNameList.length);
    for (var i = 0; i < this.fileNameList.length; i++) {
        let fileName = this.fileNameList[i];
        if (!this.progressBar.step())
            break;
        let banDoc = Banana.application.openDocument(fileName);
        this.testLogger = parentLogger.newLogger(Banana.IO.fileCompleteBaseName(fileName));
        if (banDoc) {
            //Appraisal Report
            let docInfo = getDocumentInfo(banDoc);
            let itemsData = getItemsTableData(banDoc);
            let appraisalDataList = getAppraisalData(banDoc, docInfo, itemsData);
            let portfolioTrData = getportfolioTrData(banDoc, docInfo, itemsData);
            //Add the report
            let reportName = "FILENAME: " + fileName;
            let report = printReport(banDoc, docInfo, appraisalDataList, portfolioTrData);
            this.testLogger.addReport(reportName, report);

        } else {
            this.testLogger.addFatalError("File not found: " + fileName);
        }
    }
}

