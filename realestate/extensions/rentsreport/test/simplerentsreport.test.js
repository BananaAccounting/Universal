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
// @includejs = ../Rents.sbaa/simplerentsreport.js


// Register this test case to be executed
Test.registerTestCase(new TestSimpleReport());

// Define the test class, the name of the class is not important
function TestSimpleReport() {
}

// This method will be called at the beginning of the test case
TestSimpleReport.prototype.initTestCase = function () {
  this.progressBar = Banana.application.progressBar;
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

TestSimpleReport.prototype.testImport = function () {

  let fileAC2Path = [];

  fileAC2Path.push("file:script/../test/testcases/AffittiPartitaDoppia.ac2");
  fileAC2Path.push("file:script/../test/testcases/AffittiPartitaDoppiaNOPartitario.ac2");
  fileAC2Path.push("file:script/../test/testcases/AffittiEntrateUscite.ac2");
  fileAC2Path.push("file:script/../test/testcases/AffittiEntrateUsciteNOPartitario.ac2");


  let logger = Test.logger;
  
  for (let k = 0; k.lenght; k++) {
    let banDoc = Banana.application.openDocument(fileAC2Path[k]);

    if (banDoc) {

      let printreport = new PrintReport(banDoc);
      var result = printreport.report();
      logger.addReport("Result simple report", result);
      logger.addComment("Test " + (k + 1) + ": " + fileAC2Path[k]);

      if (!Banana.application.progressBar.step())
        break;

    } else {
      logger.addFatalError("No valid file ac2 found in this directory: " + fileAC2Path[k]);
    }
  }

  Banana.application.progressBar.finish();
}