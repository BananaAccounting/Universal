// @id = ch.banana.app.documentation.test
// @api = 1.0
// @pubdate = 2025-07-29
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.app.documentation.selected-files>
// @task = app.command
// @doctype = *.*
// @outputformat = none
// @inputdataform = none
// @timeout = -1
// @includejs = ../ch.banana.app.exercisecorrection.sbaa/ch.banana.app.documentation.js

Test.registerTestCase(new TestDocumentationSelectedFiles());

function TestDocumentationSelectedFiles() {}

TestDocumentationSelectedFiles.prototype.initTestCase = function () {
  this.testLogger = Test.logger;

  this.fileAC2Path = [
    "file:script/../test/testcases/student-result-file-1.ac2"
  ];
};

TestDocumentationSelectedFiles.prototype.cleanupTestCase = function () {};
TestDocumentationSelectedFiles.prototype.init = function () {};
TestDocumentationSelectedFiles.prototype.cleanup = function () {};

TestDocumentationSelectedFiles.prototype.testImportFile = function () {
  for (let i = 0; i < this.fileAC2Path.length; i++) {

    const studentFile = this.fileAC2Path[i];
    const banDoc1 = Banana.application.openDocument(studentFile);
    let printreport = new PrintDoc(banDoc1, true);
    let result = printreport.documentation();
    this.testLogger.addText(result);
  }
};
