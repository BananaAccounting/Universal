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


// @id = construction_project_report.test.test
// @api = 1.0
// @pubdate = 2020-09-24
// @publisher = Banana.ch SA
// @description = <TEST construction_project_report.test>
// @task = app.command
// @doctype = *.*
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @timeout = -1
// @includejs = ../construction_project_report.js


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
Test.registerTestCase(new ConstructionsReportTest());

// Here we define the class, the name of the class is not important
function ConstructionsReportTest() {

}

// This method will be called at the beginning of the test case
ConstructionsReportTest.prototype.initTestCase = function() {
    this.testLogger = Test.logger;
    this.progressBar = Banana.application.progressBar;
    // i file che voglio testare
    this.fileNameList = [];
    this.fileNameList.push("file:script/../test/testcases/constructions_ita_model.ac2");
    this.fileNameList.push("file:script/../test/testcases/constructions_ita_tutorial.ac2");
}

// This method will be called at the end of the test case
ConstructionsReportTest.prototype.cleanupTestCase = function() {

}

// This method will be called before every test method is executed
ConstructionsReportTest.prototype.init = function() {

}

// This method will be called after every test method is executed
ConstructionsReportTest.prototype.cleanup = function() {

}

ConstructionsReportTest.prototype.testReport = function() {
    this.testLogger = Test.logger.newGroupLogger("testReport");
    this.testLogger.addKeyValue("Constructions Report Test", "testReport");
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
            Test.logger.addSection("Constructions Report test - file: " + fileName);

            Test.logger.addSubSection("Test1: Load Categories Data");
            this.add_test_categories_data(banDocument);//all categories table data

        } else {
            this.testLogger.addFatalError("File not found: " + fileName);
        }
    }
    this.testLogger.close();
    this.testLogger = Test.logger;
}


ConstructionsReportTest.prototype.add_test_categories_data=function(banDoc){
    Test.logger.addText("prova");
}
