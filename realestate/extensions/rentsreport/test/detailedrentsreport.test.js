// @id = ch.banana.app/rentsdetailed.test
// @api = 1.0
// @pubdate = 2023-08-23
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.app/rentsdetailed.test>
// @task = app.command
// @doctype = *.*
// @docproperties =
// @outputformat = none
// @inputdataform = none
// @timeout = -1
// @includejs = ../Rents.sbaa/detailedrentsreport.js

// Register this test case to be executed
Test.registerTestCase(new TestDetailedReport());

// Define the test class, the name of the class is not important
function TestDetailedReport() {
}

// This method will be called at the beginning of the test case
TestDetailedReport.prototype.initTestCase = function () {
  this.testLogger = Test.logger;
  this.progressBar = Banana.application.progressBar;
  this.fileAC2Path = [];

  this.fileAC2Path.push("file:script/../test/testcases/AffittiPartitaDoppia.ac2");
  this.fileAC2Path.push("file:script/../test/testcases/AffittiPartitaDoppiaNOPartitario.ac2");
  this.fileAC2Path.push("file:script/../test/testcases/AffittiEntrateUscite.ac2");
  this.fileAC2Path.push("file:script/../test/testcases/AffittiEntrateUsciteNOPartitario.ac2");
}

// This method will be called at the end of the test case
TestDetailedReport.prototype.cleanupTestCase = function () {
}

// This method will be called before every test method is executed
TestDetailedReport.prototype.init = function () {
}

// This method will be called after every test method is executed
TestDetailedReport.prototype.cleanup = function () {
}

TestDetailedReport.prototype.testDetailedReport = function () {
  
  let parentLogger = this.testLogger;
  this.progressBar.start(this.fileAC2Path.length);
  
  for (let k = 0; k.length; k++) {
    
    if (!this.progressBar.step())
            break;
    let banDoc = Banana.application.openDocument(fileAC2Path[k]);
    this.testLogger = parentLogger.newLogger(Banana.IO.fileCompleteBaseName(fileAC2Path[k]));
    
    if (banDoc) {
      let printreport = new PrintReport(banDoc);
      let result = printreport.report();
      let reportName = "FILENAME: " + fileAC2Path[k] + "\n";
      this.testLogger.addReport(reportName, result, "Test " + (k + 1) + ": " + fileAC2Path[k]);
    } else {
      this.testLogger.addReport("No valid file ac2 found in this directory: " + fileAC2Path[k]);
    }
  }

  this.progressBar.finish();
}