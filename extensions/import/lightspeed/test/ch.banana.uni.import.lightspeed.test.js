// Copyright [2024] [Banana.ch SA - Lugano Switzerland]
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//     http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//


// @id = ch.banana.uni.import.lightspeed.test
// @api = 1.0
// @pubdate = 2024-05-22
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.uni.import.lightspeed.test>
// @task = app.command
// @doctype = *.*
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @includejs = ../ch.banana.uni.import.lightspeed.sbaa/import.utilities.js
// @includejs = ../ch.banana.uni.import.lightspeed.sbaa/ch.banana.uni.import.lightspeed.js
// @timeout = -1

// Register test case to be executed
Test.registerTestCase(new TestImportLightspeedTrans());

// Here we define the class, the name of the class is not important
function TestImportLightspeedTrans() {
}

// This method will be called at the beginning of the test case
TestImportLightspeedTrans.prototype.initTestCase = function () {
   this.testLogger = Test.logger;
   this.progressBar = Banana.application.progressBar;
}

// This method will be called at the end of the test case
TestImportLightspeedTrans.prototype.cleanupTestCase = function () {

}

// This method will be called before every test method is executed
TestImportLightspeedTrans.prototype.init = function () {

}

// This method will be called after every test method is executed
TestImportLightspeedTrans.prototype.cleanup = function () {

}

TestImportLightspeedTrans.prototype.testJsonInvoiceStructure = function () {
    this.testLogger.addKeyValue("ImportLightspeed", "testReport");

    let fileNameList = [];
    fileNameList.push("file:script/../test/testcases/ch.banana.uni.lightspeed.transactions.format1.csv");
 
    let fileAc2 = "file:script/../test/testcases/lightspeed_import_double_entry_accounting_vat.ac2"; 
    let banDoc = Banana.application.openDocument(fileAc2);
 
    let parentLogger = this.testLogger;
    this.progressBar.start(fileNameList.length);
 
    if (banDoc) {
       for (let i = 0; i < fileNameList.length; i++) {
          let fileName = fileNameList[i];
          if (fileName) {
             this.testLogger = parentLogger.newLogger(Banana.IO.fileCompleteBaseName(fileName));
             let file = Banana.IO.getLocalFile(fileName);
             Test.assert(file);
             let fileContent = file.read();
             Test.assert(fileContent);
             let docChangeObj = exec(fileContent, banDoc, true); //takes the exec from the import script.
             this.testLogger.addJson('', JSON.stringify(docChangeObj));
          } else {
             this.testLogger.addFatalError("File not found: " + fileName);
          }
          if (!this.progressBar.step())
             break;
       }
    } else {
       this.testLogger.addFatalError("File not found: " + fileAc2);
    }
    this.progressBar.finish();
    this.testLogger.close();
}