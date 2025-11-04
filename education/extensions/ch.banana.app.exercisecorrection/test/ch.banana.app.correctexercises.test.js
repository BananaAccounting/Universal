// @id = ch.banana.app.correctexercises.fulltest
// @api = 1.0
// @pubdate = 2025-07-29
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.app.correctexercises.full-combination>
// @task = app.command
// @doctype = *.*
// @outputformat = none
// @inputdataform = none
// @timeout = -1
// @includejs = ../ch.banana.app.exercisecorrection.sbaa/ch.banana.app.correctexercises.js

Test.registerTestCase(new TestFullCorrectExercises());

function TestFullCorrectExercises() { }

TestFullCorrectExercises.prototype.initTestCase = function () {
  this.testLogger = Test.logger;

  this.fileAC2Path = [
    ["file:script/../test/testcases/student-result-file-1.ac2", "file:script/../test/testcases/teacher-solution-file-1.ac2"],
    // ["file:script/../test/testcases/student-result-file-2.ac2", "file:script/../test/testcases/teacher-solution-file-2.ac2"],
    // ["file:script/../test/testcases/student-result-file-3.ac2", "file:script/../test/testcases/teacher-solution-file-3.ac2"],
    ["file:script/../test/testcases/11310-student-file-result-iva.ac2", "file:script/../test/testcases/11311-teacher-file-solution-iva.ac2"],
    ["file:script/../test/testcases/11310-student-file-result-iva-multi-currency.ac2", "file:script/../test/testcases/11311-teacher-file-solution-iva-multi-currency.ac2"],
    ["file:script/../test/testcases/11310-student-file-result-multi-currency.ac2", "file:script/../test/testcases/11311-teacher-file-solution-multi-currency.ac2"]
  ];

  this.paramOptions = {
    datescore: ["0", "1"],
    debitaccountscore: ["0", "1"],
    creditaccountscore: ["0", "1"],
    amountscore: ["0", "1"],
    debitcreditaccountsscore: [false, true],
    vatcodescore: ["0", "1"],
    amountcurrencyscore: ["0", "1"],
    exchangecurrencyscore: ["0", "1"],
    exchangeratescore: ["0", "1"],
    totalscore: ["0", "1"]
  };
};

TestFullCorrectExercises.prototype.cleanupTestCase = function () { };
TestFullCorrectExercises.prototype.init = function () { };
TestFullCorrectExercises.prototype.cleanup = function () {};

TestFullCorrectExercises.prototype.testFullCorrectExercises = function () {

  var currentCombination = {};
  function combineParams(paramOptions, index = 0) {
    if (index === Object.keys(paramOptions).length) {
      return [Object.assign({}, currentCombination)];
    }
    const paramName = Object.keys(paramOptions)[index];
    const combinations = [];
    for (const value of paramOptions[paramName]) {
      currentCombination[paramName] = value;
      combinations.push(...combineParams(paramOptions, index + 1));
    }
    return combinations;
  }

  for (let i = 0; i < this.fileAC2Path.length; i++) {
    const studentFile = this.fileAC2Path[i][0];
    const teacherFile = this.fileAC2Path[i][1];
    const banDoc1 = Banana.application.openDocument(studentFile);
    const banDoc2 = Banana.application.openDocument(teacherFile);
    //creates a folder for each file tested
    //log name student file
    let studentFileName = '';
    const matchStudent = studentFile.match(/([^/\\]+)(?=\.ac2$)/);
    if (matchStudent) {
      studentFileName += matchStudent[1];
    }
    //log name teacher file
    let teacherFileName = '';
    const matchTeacher = teacherFile.match(/([^/\\]+)(?=\.ac2$)/);
    if (matchTeacher) {
      teacherFileName += matchTeacher[1];
    }
    //folder Test0, Test1,...
    this.testLogger = Test.logger.newGroupLogger("Test" + i.toString());

    let index = 0;
    let printreport = new CorrectDoc(banDoc1, banDoc2, true);
    for (const param of combineParams(this.paramOptions)) {
      let parentLogger = this.testLogger;
      //test filename param0, param1, ...
      this.testLogger = parentLogger.newLogger("param" + index.toString());
      // let printresults = printreport.result(param);
      // this.testLogger.addJson("CorrectDocResults", JSON.stringify(printresults, null, 3));
      this.testLogger.addKeyValue("StudentFileName", studentFileName);
      this.testLogger.addKeyValue("TeacherFileName", teacherFileName);
      this.testLogger.addSection(this.fileAC2Path[i][0] + " vs " + this.fileAC2Path[i][1] + " with parameters: " + JSON.stringify(param));
      this.testLogger.addTable("TransactionsStudentFile", banDoc1.table("Transactions"));
      this.testLogger.addTable("TransactionsTeacherFile", banDoc2.table("Transactions"));
      index++;
    }

    this.testLogger.close();
    this.testLogger = Test.logger;
  }
}
