// @id = ch.banana.app.recalculatetotal.fulltest
// @api = 1.0
// @pubdate = 2025-07-29
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.app.recalculatetotal.full-combination>
// @task = app.command
// @doctype = *.*
// @outputformat = none
// @inputdataform = none
// @timeout = -1
// @includejs = ../ch.banana.app.exercisecorrection.sbaa/ch.banana.app.recalculatetotal.js
// @includejs = ../ch.banana.app.exercisecorrection.sbaa/ch.banana.app.correctexercises.js

Test.registerTestCase(new TestRecalculateTotalFull());

function TestRecalculateTotalFull() {}

TestRecalculateTotalFull.prototype.initTestCase = function () {
  this.testLogger = Test.logger;

  this.fileAC2Path = [
    ["file:script/../test/testcases/student-result-file-1.ac2", "file:script/../test/testcases/teacher-solution-file-1.ac2"],
    ["file:script/../test/testcases/DoubleEntry.ac2", "file:script/../test/testcases/DoubleEntry.ac2"],
    ["file:script/../test/testcases/11310-student-file-result-iva.ac2", "file:script/../test/testcases/11311-teacher-file-solution-iva.ac2"],
    ["file:script/../test/testcases/11310-student-file-result-iva-multi-currency.ac2", "file:script/../test/testcases/11311-teacher-file-solution-iva-multi-currency.ac2"],
    ["file:script/../test/testcases/11310-student-file-result-multi-currency.ac2", "file:script/../test/testcases/11311-teacher-file-solution-multi-currency.ac2"]
  ];
};

TestRecalculateTotalFull.prototype.cleanupTestCase = function () {};
TestRecalculateTotalFull.prototype.init = function () {};
TestRecalculateTotalFull.prototype.cleanup = function () {};

TestRecalculateTotalFull.prototype.testImportFile = function () {

  for (let i = 0; i < this.fileAC2Path.length; i++) {

    const studentFile = this.fileAC2Path[i][0];
    const teacherFile = this.fileAC2Path[i][1];
    const banDoc1 = Banana.application.openDocument(studentFile);
    const banDoc2 = Banana.application.openDocument(teacherFile);
    let printsettings = new PrintSettings(banDoc1, false);
    let correctdoc = new CorrectDoc(banDoc1, banDoc2, false);
    let printreport = new PrintReport(banDoc1, true, correctdoc, printsettings);
    let result = printreport.recalculatetotal();
    this.testLogger.addText(result);
  }
  
};
