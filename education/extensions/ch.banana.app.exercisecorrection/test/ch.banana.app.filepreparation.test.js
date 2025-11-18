// @id = ch.banana.app.filepreparation.fulltest
// @api = 1.0
// @pubdate = 2025-07-29
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.app.filepreparation.full-combination>
// @task = app.command
// @doctype = *.*
// @outputformat = none
// @inputdataform = none
// @timeout = -1
// @includejs = ../ch.banana.app.exercisecorrection.sbaa/ch.banana.app.filepreparation.js

Test.registerTestCase(new TestFullFilePreparation());

function TestFullFilePreparation() {}

TestFullFilePreparation.prototype.initTestCase = function () {
  this.testLogger = Test.logger;

  this.fileAC2Path = ["file:script/../test/testcases/student-result-file-1.ac2"],
  ["file:script/../test/testcases/DoubleEntry.ac2"],
  ["file:script/../test/testcases/11310-student-file-result-iva.ac2"],
  ["file:script/../test/testcases/11310-student-file-result-iva-multi-currency.ac2"],
  ["file:script/../test/testcases/11310-student-file-result-multi-currency.ac2"];
};

TestFullFilePreparation.prototype.cleanupTestCase = function () {};
TestFullFilePreparation.prototype.init = function () {};
TestFullFilePreparation.prototype.cleanup = function () {};

TestFullFilePreparation.prototype.testImportFile = function () {

  for (let i = 0; i < this.fileAC2Path.length; i++) {

    const studentFile = this.fileAC2Path[i];
    const banDoc1 = Banana.application.openDocument(studentFile);
    let printreport = new CreateDoc(banDoc1, true);
    let result = printreport.result();
    this.testLogger.addText(result);

  }
};
