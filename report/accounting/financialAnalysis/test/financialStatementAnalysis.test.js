// Copyright [2020] [Banana.ch SA - Lugano Switzerland]
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


// @id = financialStatementAnalysis.test.test
// @api = 1.0
// @pubdate = 2020-09-24
// @publisher = Banana.ch SA
// @description = <TEST financialStatementAnalysis.test>
// @task = app.command
// @doctype = *.*
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @timeout = -1
// @includejs = ../financialStatementAnalysis.js


/*

  SUMMARY
  -------
  Javascript test
  1. Open the .ac2 file
  2. Execute the .js script
  3. Save the report



  virtual void addTestBegin(const QString& key, const QString& comment = QString());
  virtual void addTestEnd();

  virtual void addSection(const QString& key);
  virtual void addSubSection(const QString& key);
  virtual void addSubSubSection(const QString& key);

  virtual void addComment(const QString& comment);
  virtual void addInfo(const QString& key, const QString& value1, const QString& value2 = QString(), const QString& value3 = QString());
  virtual void addFatalError(const QString& error);
  virtual void addKeyValue(const QString& key, const QString& value, const QString& comment = QString());
  virtual void addReport(const QString& key, QJSValue report, const QString& comment = QString());
  virtual void addTable(const QString& key, QJSValue table, QStringList colXmlNames = QStringList(), const QString& comment = QString());

**/

// Register test case to be executed
Test.registerTestCase(new FSAnalysisTest());

// Here we define the class, the name of the class is not important
function FSAnalysisTest() {

}

// This method will be called at the beginning of the test case
FSAnalysisTest.prototype.initTestCase = function() {
    this.testLogger = Test.logger;
    this.progressBar = Banana.application.progressBar;
    // i file che voglio testare
    this.fileNameList = [];
    this.fileNameList.push("file:script/../test/testcases/Contabilità in partita doppia multi-moneta con IVA.ac2");
    this.fileNameList.push("file:script/../test/testcases/Documentscontabilita_sa-sagl_partitario_fatturato 2020.ac2");
}

// This method will be called at the end of the test case
FSAnalysisTest.prototype.cleanupTestCase = function() {

}

// This method will be called before every test method is executed
FSAnalysisTest.prototype.init = function() {

}

// This method will be called after every test method is executed
FSAnalysisTest.prototype.cleanup = function() {

}

//confronta i dati caricati da loadData()
FSAnalysisTest.prototype.testReport = function() {
    this.testLogger = Test.logger.newGroupLogger("testReport");
    this.testLogger.addKeyValue("FSAnalysisTest", "testReport");
    this.testLogger.addComment("Test report");

    var parentLogger = this.testLogger;
    this.progressBar.start(this.fileNameList.length);
    for (var i = 0; i < this.fileNameList.length; i++) {
        var parentLogger = this.testLogger;
        var fileName = this.fileNameList[i];
        this.testLogger = parentLogger.newLogger(Banana.IO.fileCompleteBaseName(fileName));
        if (!this.progressBar.step(fileName))
            break;
        var banDocument = Banana.application.openDocument(fileName);
        if (banDocument) {
            var financialStatementAnalysis = new FinancialStatementAnalysis(banDocument);
            var savedParam = banDocument.getScriptSettings("financialStatementAnalysis");
            if (savedParam.length > 0) {
                var param = JSON.parse(savedParam);
                financialStatementAnalysis.setParam(param);
            }
            financialStatementAnalysis.loadData();
            var reportName = "FILENAME: " + fileName;
            var report = financialStatementAnalysis.printReport();
            this.testLogger.addReport(reportName, report);
        } else {
            this.testLogger.addFatalError("File not found: " + fileName);
        }
    }
    this.testLogger.close();
    this.testLogger = Test.logger;
}

//Test calculation methods (indices and various elements of the financial statement analysis)
FSAnalysisTest.prototype.testCalcMethods = function() {

    var fileAC2 = "file:script/../test/testcases/Documentscontabilita_sa-sagl_partitario_fatturato 2020.ac2";
    var banDoc = Banana.application.openDocument(fileAC2);
    if (!banDoc) {
        return;
    }

    Test.logger.addSection("Test: Financial Statement Analysis Calculation Methods : " + fileAC2);

    Test.logger.addSubSection("Method: calculateCashflowIndex");
    this.add_test_calculateCashflowIndex_1(banDoc);

}

//check methods that load values from the BanDocument.

FSAnalysisTest.prototype.testLoadingMethods = function() {


    var fileAC2 = "file:script/../test/testcases/Documentscontabilita_sa-sagl_partitario_fatturato 2020.ac2";
    var banDoc = Banana.application.openDocument(fileAC2);
    if (!banDoc) {
        return;
    }

    Test.logger.addSection("Test: Financial Statement Analysis loading Methods : " + fileAC2);

    Test.logger.addSubSection("Method: loadAmountsFromTransactions_years");

    //the prefix used to recognise own capita withdrawals is '#disinvest'.
    Test.logger.addSubSubSection("Test1: disinvestments");
    this.add_test_loadAmountsFromTransactions_years_1(banDoc, "disinvestments"); //all correct, budget=false
    this.add_test_loadAmountsFromTransactions_years_2(banDoc, "disinvestments(descr reference non-existent)"); //Non-existent descr reference, budget=false.
    this.add_test_loadAmountsFromTransactions_years_3(banDoc, "disinvestments(Budget=true,but no Budget table)"); //All correct, Budget=true, but no Budget Table.
    this.add_test_loadAmountsFromTransactions_years_4(banDoc, "disinvestments(without any occurrence of the description)"); //Groups without any occurrence of the description in the  transactions 

    //the prefix used to recognise own capital withdrawals is '#capital_minus'.
    Test.logger.addSubSubSection("Test2: withdrawal of own capital");
    this.add_test_loadAmountsFromTransactions_years_5(banDoc, "withdrawal of own capital"); //all correct, budget=false
    this.add_test_loadAmountsFromTransactions_years_6(banDoc, "withdrawal of own capital(descr reference non-existent)"); //Non-existent descr reference, budget=false.
    this.add_test_loadAmountsFromTransactions_years_7(banDoc, "withdrawal of own capital(Budget=true,but no Budget table)"); //All correct, Budget=true, but no Budget Table.
    this.add_test_loadAmountsFromTransactions_years_8(banDoc, "withdrawal of own capital(without any occurrence of the description)"); //Groups without any occurrence of the description in the  transactions 


}

//disinvestments
FSAnalysisTest.prototype.add_test_loadAmountsFromTransactions_years_1 = function(banDoc, reportName) {
    var financialStatementAnalysis = new FinancialStatementAnalysis(banDoc);
    var group = "140;150;160;170";
    var descr = "#disinvest";
    var budgetBalances = false;
    //Loaded Elements
    var loaded_amount = financialStatementAnalysis.loadAmountsFromTransactions_years(group, descr, banDoc, budgetBalances);
    Test.logger.addKeyValue(reportName, loaded_amount);
}
FSAnalysisTest.prototype.add_test_loadAmountsFromTransactions_years_2 = function(banDoc, reportName) {
    var financialStatementAnalysis = new FinancialStatementAnalysis(banDoc);
    var group = "140;150;160;170";
    var descr = "#disinvesttt";
    var budgetBalances = false;
    //Loaded Elements
    var loaded_amount = financialStatementAnalysis.loadAmountsFromTransactions_years(group, descr, banDoc, budgetBalances);
    Test.logger.addKeyValue(reportName, loaded_amount);
}
FSAnalysisTest.prototype.add_test_loadAmountsFromTransactions_years_3 = function(banDoc, reportName) {
    var financialStatementAnalysis = new FinancialStatementAnalysis(banDoc);
    var group = "140;150;160;170";
    var descr = "#disinvest";
    var budgetBalances = true;
    //Loaded Elements
    var loaded_amount = financialStatementAnalysis.loadAmountsFromTransactions_years(group, descr, banDoc, budgetBalances);
    Test.logger.addKeyValue(reportName, loaded_amount);
}
FSAnalysisTest.prototype.add_test_loadAmountsFromTransactions_years_4 = function(banDoc, reportName) {
    var financialStatementAnalysis = new FinancialStatementAnalysis(banDoc);
    var group = "100;110";
    var descr = "#disinvest";
    var budgetBalances = true;
    //Loaded Elements
    var loaded_amount = financialStatementAnalysis.loadAmountsFromTransactions_years(group, descr, banDoc, budgetBalances);
    Test.logger.addKeyValue(reportName, loaded_amount);
}

//withdrawal of own capital

FSAnalysisTest.prototype.add_test_loadAmountsFromTransactions_years_5 = function(banDoc, reportName) {
    var financialStatementAnalysis = new FinancialStatementAnalysis(banDoc);
    var group = "28";
    var descr = "#capital_minus";
    var budgetBalances = false;
    //Loaded Elements
    var loaded_amount = financialStatementAnalysis.loadAmountsFromTransactions_years(group, descr, banDoc, budgetBalances);
    Test.logger.addKeyValue(reportName, loaded_amount);
}
FSAnalysisTest.prototype.add_test_loadAmountsFromTransactions_years_6 = function(banDoc, reportName) {
    var financialStatementAnalysis = new FinancialStatementAnalysis(banDoc);
    var group = "28";
    var descr = "#capital_minusss";
    var budgetBalances = false;
    //Loaded Elements
    var loaded_amount = financialStatementAnalysis.loadAmountsFromTransactions_years(group, descr, banDoc, budgetBalances);
    Test.logger.addKeyValue(reportName, loaded_amount);
}
FSAnalysisTest.prototype.add_test_loadAmountsFromTransactions_years_7 = function(banDoc, reportName) {
    var financialStatementAnalysis = new FinancialStatementAnalysis(banDoc);
    var group = "28";
    var descr = "#capital_minus";
    var budgetBalances = true;
    //Loaded Elements
    var loaded_amount = financialStatementAnalysis.loadAmountsFromTransactions_years(group, descr, banDoc, budgetBalances);
    Test.logger.addKeyValue(reportName, loaded_amount);
}
FSAnalysisTest.prototype.add_test_loadAmountsFromTransactions_years_8 = function(banDoc, reportName) {
    var financialStatementAnalysis = new FinancialStatementAnalysis(banDoc);
    var group = "100;110";
    var descr = "#capital_minus";
    var budgetBalances = true;
    //Loaded Elements
    var loaded_amount = financialStatementAnalysis.loadAmountsFromTransactions_years(group, descr, banDoc, budgetBalances);
    Test.logger.addKeyValue(reportName, loaded_amount);
}

//calculation methods

FSAnalysisTest.prototype.add_test_calculateCashflowIndex_1 = function(banDoc) {
    var free_cashflow = "15000";
    var investments = "2000";

    Test.assert(false, "This test failed");



}