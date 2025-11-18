// @id = ch.banana.app.exercisecorrection.test
// @api = 1.0
// @pubdate = 2025-07-29
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
  this.fileAC2Path = ["file:script/../test/testcases/student-result-file-1-corrected.ac2"], ["file:script/../test/testcases/teacher-solution-file-1.ac2"];

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

    const studentFile = this.fileAC2Path[i];
    const banDoc1 = Banana.application.openDocument(studentFile);
    let printsettings = new PrintSettings(banDoc1, false);
    let printreport = new DeleteCorrections(banDoc1, true, printsettings);
    let result = printreport.deletecorrections();
    this.testLogger.addText(result);

  }

}