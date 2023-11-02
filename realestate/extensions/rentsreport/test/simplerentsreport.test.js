// @id = ch.banana.app/rentssimple.test
// @api = 1.0
// @pubdate = 2023-08-23
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.app/rentssimple.test>
// @task = app.command
// @doctype = *.*
// @docproperties =
// @outputformat = none
// @inputdataform = none
// @timeout = -1
// @includejs = ../ch.banana.ch.rents.sbaa/simplerentsreport.js


// Register this test case to be executed
Test.registerTestCase(new TestSimpleReport());

// Define the test class, the name of the class is not important
function TestSimpleReport() {
}

// This method will be called at the beginning of the test case
TestSimpleReport.prototype.initTestCase = function () {
  this.testLogger = Test.logger;

  this.fileAC2Path = [];
  this.fileAC2Path.push("file:script/../test/testcases/AffittiPartitaDoppia.ac2");
  this.fileAC2Path.push("file:script/../test/testcases/AffittiPartitaDoppiaNOPartitario.ac2");
  this.fileAC2Path.push("file:script/../test/testcases/AffittiEntrateUscite.ac2");
  this.fileAC2Path.push("file:script/../test/testcases/AffittiEntrateUsciteNOPartitario.ac2");
}

// This method will be called at the end of the test case
TestSimpleReport.prototype.cleanupTestCase = function () {
}

// This method will be called before every test method is executed
TestSimpleReport.prototype.init = function () {
}

// This method will be called after every test method is executed
TestSimpleReport.prototype.cleanup = function () {
}

TestSimpleReport.prototype.testSimpleReport = function () {
  
  for (var k = 0; k < this.fileAC2Path.length; k++) {
  
    let banDoc = Banana.application.openDocument(this.fileAC2Path[k]);

    if (banDoc) {
     
      let printreport = new PrintReport(banDoc);
      let stylesheet = printreport.createStyleSheet(); // create the first stylesheet
      let result = printreport.report(stylesheet);
      let reportName = "FILENAME: " + this.fileAC2Path[k];
      this.testLogger.addReport(reportName, result, "Test " + (k + 1) + ": " + this.fileAC2Path[k]);
    } else {
      this.testLogger.addFatalError("No valid file ac2 found in this directory: " + this.fileAC2Path[k]);
    }
  }
}