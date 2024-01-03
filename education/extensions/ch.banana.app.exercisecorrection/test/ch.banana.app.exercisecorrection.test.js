// @id = ch.banana.app.exercisecorrection.test
// @api = 1.0
// @pubdate = 2023-12-14
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.app.exercisecorrection.test>
// @task = app.command
// @doctype = *.*
// @docproperties =
// @outputformat = none
// @inputdataform = none
// @timeout = -1
// @includejs = ../ch.banana.app.exercisecorrection.sbaa/ch.banana.app.exercisecorrection.js


// Register this test case to be executed
Test.registerTestCase(new TestImportFile());

// Define the test class, the name of the class is not important
function TestImportFile() {
}

// This method will be called at the beginning of the test case
TestImportFile.prototype.initTestCase = function () {

  this.testLogger = Test.logger;
  this.fileAC2Path = [];
  this.fileAC2Path.push("file:script/../test/testcases/EducationStudent.ac2");
  this.fileAC2Path.push("file:script/../test/testcases/EducationTeacher.ac2");

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

  let banDoc1 = Banana.application.openDocument(this.fileAC2Path[0]);
  let banDoc2 = Banana.application.openDocument(this.fileAC2Path[1]);
  let isTest = true;

  if (banDoc1 && banDoc2) {

    let test = new PrintReport(banDoc1, banDoc2, isTest);
    let result = test.result();
    this.testLogger.addJson("TestImportFile", JSON.stringify(result));

  }
  else {

    this.testLogger.addFatalError("No valid file ac2 found in this directory: " + this.fileAC2Path[0] + " and/or " + this.fileAC2Path[1]);

  }
}