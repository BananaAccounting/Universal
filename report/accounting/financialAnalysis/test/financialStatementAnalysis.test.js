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
    this.fileNameList.push("file:script/../test/testcases/accounting 2019.ac2");
    this.fileNameList.push("file:script/../test/testcases/Contabilità in partita doppia con IVA - 1.ac2");
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
    // stampa il report e lo butta nel log del test
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