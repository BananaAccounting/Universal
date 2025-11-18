// @id = ch.banana.app.settings.fulltest
// @api = 1.0
// @pubdate = 2025-07-29
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.app.settings.full-combination>
// @task = app.command
// @doctype = *.*
// @outputformat = none
// @inputdataform = none
// @timeout = -1
// @includejs = ../ch.banana.app.exercisecorrection.sbaa/ch.banana.app.settings.js
// @includejs = ../ch.banana.app.exercisecorrection.sbaa/ch.banana.app.correctexercises.js

Test.registerTestCase(new TestSettingsFullCombination());

function TestSettingsFullCombination() { }

TestSettingsFullCombination.prototype.initTestCase = function () {
  this.testLogger = Test.logger;

  this.fileAC2Path = ["file:script/../test/testcases/student-result-file-1.ac2"],
  ["file:script/../test/testcases/teacher-solution-file-1.ac2"],
    ["file:script/../test/testcases/11310-student-file-result-iva.ac2"],
    ["file:script/../test/testcases/11311-teacher-file-solution-iva.ac2"],
    ["file:script/../test/testcases/11310-student-file-result-iva-multi-currency.ac2"],
    ["file:script/../test/testcases/11311-teacher-file-solution-iva-multi-currency.ac2"],
    ["file:script/../test/testcases/11310-student-file-result-multi-currency.ac2"],
    ["file:script/../test/testcases/11311-teacher-file-solution-multi-currency.ac2"];
};

TestSettingsFullCombination.prototype.cleanupTestCase = function () { };
TestSettingsFullCombination.prototype.init = function () { };
TestSettingsFullCombination.prototype.cleanup = function () { };

TestSettingsFullCombination.prototype.testImportFile = function () {

  for (let i = 0; i < this.fileAC2Path.length; i++) {
  const studentFile = this.fileAC2Path[i];
  const banDoc1 = Banana.application.openDocument(studentFile);
  let printsettings = new PrintSettings(banDoc1, true);
  let result = printsettings.result();
  this.testLogger.addText(result);
  }
};
