// @id = ch.banana.app.civicrmimport.test
// @api = 1.0
// @pubdate = 2025-07-08
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.app.civicrmimport.test>
// @task = app.command
// @doctype = *.*
// @docproperties =
// @outputformat = none
// @inputdataform = none
// @timeout = -1
// @includejs = ../ch.banana.app.civicrmimport.sbaa/ch.banana.app.civicrmimport.js


// Register this test case to be executed
Test.registerTestCase(new TestImportFile());

// Define the test class, the name of the class is not important
function TestImportFile() {
}

// This method will be called at the beginning of the test case
TestImportFile.prototype.initTestCase = function () {

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

  let parentLogger = Test.logger;
  this.testLogger = parentLogger.newLogger("ch.banana.app.civicrmimport.test");

  this.fileAC2Path = [];
  this.fileAC2Path.push("file:script/../test/testcases/double-entry-accounting.ac2");
  this.fileAC2Path.push("file:script/../test/testcases/income-expenses-accounting.ac2");
  this.fileNameList = [];
  this.fileNameList.push("file:script/../test/testcases/Financial_Transactions_10_20250625104706.csv");

  for (var i = 0; i < this.fileAC2Path.length; i++) {
    var fileName = this.fileNameList[0];
    Test.assert(fileName, "File name not defined for test: ");
    let file = Banana.IO.getLocalFile(fileName);
    Test.assert(file, "File not found: " + fileName);
    let fileContent = file.read();
    let csvFile = Banana.Converter.csvToArray(fileContent, ',', '');
    //Check if the csv file is not empty
    if (csvFile.length < 1) {
      this.testLogger.addFatalError("File not found: " + fileName);
      return;
    }
    let test = new ImportCSV(this.fileAC2Path[i], true);
    let result = test.result(fileContent);
    this.testLogger.addJson("Result", JSON.stringify(result));
  }
}