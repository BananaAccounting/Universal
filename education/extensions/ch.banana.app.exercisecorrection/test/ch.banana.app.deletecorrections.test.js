// @id = ch.banana.app.exercisecorrection.test
// @api = 1.0
// @pubdate = 2025-02-06
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.app.exercisecorrection.test>
// @task = app.command
// @doctype = *.*
// @docproperties =
// @outputformat = none
// @inputdataform = none
// @timeout = -1
// @includejs = ../ch.banana.app.exercisecorrection.sbaa/ch.banana.app.deletecorrections.js


// Register this test case to be executed
Test.registerTestCase(new TestImportFile());

// Define the test class, the name of the class is not important
function TestImportFile() {
}

// This method will be called at the beginning of the test case
TestImportFile.prototype.initTestCase = function () {

  this.testLogger = Test.logger;
  this.fileAC2Path = [];
  this.fileAC2Path.push("file:script/../test/testcases/student-result-file-1.ac2");
  this.fileAC2Path.push("file:script/../test/testcases/teacher-solution-file-1.ac2");
  this.fileAC2Path.push("file:script/../test/testcases/student-result-file-2.ac2");
  this.fileAC2Path.push("file:script/../test/testcases/teacher-solution-file-2.ac2");
  this.fileAC2Path.push("file:script/../test/testcases/student-result-file-3.ac2");
  this.fileAC2Path.push("file:script/../test/testcases/teacher-solution-file-3.ac2");
  this.fileAC2Path.push("file:script/../test/testcases/DoubleEntry.ac2");

}

// This method will be called at the end of the test case
TestImportFile.prototype.cleanupTestCase = function () {
}

// This method will be called before every test method is executed
TestImportFile.prototype.init = function () {
}

// This method will be called after every test method is executed
TestImportFile.prototype.cleanup = function () {
}

TestImportFile.prototype.testImportFile = function () {


  for (let i = 0; i < this.fileAC2Path.length; i++) {

    let banDoc1 = Banana.application.openDocument(this.fileAC2Path[i]);
    let isTest = true;

    if (banDoc1) {

      let printsettings = new PrintSettings(banDoc1, false);
      let correctdoc = new CorrectDoc(banDoc1,"", false);
      let test = new DeleteCorrections(banDoc1, isTest, correctdoc, printsettings);
      let result = test.deletecorrections();
      this.testLogger.addText("TestDeleteCorrections " + i);
      this.testLogger.addJson("TestDeleteCorrections", JSON.stringify(result));

    }
    else {

      this.testLogger.addFatalError("No valid file ac2 found in this directory: " + this.fileAC2Path[i]);

    }
  }
}