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


// @id = ch.banana.uni.swiss.camt.iso20022.reader.test
// @api = 1.0
// @pubdate = 2024-10-04
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.uni.swiss.camt.iso20022.reader.test>
// @task = app.command
// @doctype = *.*
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @includejs = ../ch.banana.uni.swiss.camt.iso20022.reader.sbaa/import.utilities.js
// @includejs = ../ch.banana.uni.swiss.camt.iso20022.reader.sbaa/ch.banana.uni.swiss.camt.iso20022.reader.js
// @timeout = -1

// Register test case to be executed
Test.registerTestCase(new TestSwissCamtReader());

// Here we define the class, the name of the class is not important
function TestSwissCamtReader() {
}

// This method will be called at the beginning of the test case
TestSwissCamtReader.prototype.initTestCase = function () {
   this.testLogger = Test.logger;
   this.progressBar = Banana.application.progressBar;
}

// This method will be called at the end of the test case
TestSwissCamtReader.prototype.cleanupTestCase = function () {

}

// This method will be called before every test method is executed
TestSwissCamtReader.prototype.init = function () {

}

// This method will be called after every test method is executed
TestSwissCamtReader.prototype.cleanup = function () {

}

TestSwissCamtReader.prototype.testImport = function () {
   var fileNameList = [];

   fileNameList.push("file:script/../test/testcases/2023-02-01_C053_001_04_CH2801234000123456789_CHF_001.xml");
   fileNameList.push("file:script/../test/testcases/2023-02-01_C053_001_08_CH2801234000123456789_CHF_001.xml");
   fileNameList.push("file:script/../test/testcases/2023-02-01_C054_001_04_CH2801234000123456789_CHF_001.xml");
   fileNameList.push("file:script/../test/testcases/2023-02-01_C054_001_08_CH2801234000123456789_CHF_001.xml");
   fileNameList.push("file:script/../test/testcases/camt054_v04_adrline_ubs.xml");
   fileNameList.push("file:script/../test/testcases/export_postbank_cam.052.xml");

   var parentLogger = this.testLogger;
   this.progressBar.start(fileNameList.length);

   let fileContent = "";
   let fileId = "";
   let filePath = "";
   let fileName = "test_file";
   let fileDateTime = "2024-05-13 13:55:43";
   let fileSuffix = "xml";

   for (var i = 0; i < fileNameList.length; i++) {
      var fName = fileNameList[i];
      this.testLogger = parentLogger.newLogger(Banana.IO.fileCompleteBaseName(fName));

      var file = Banana.IO.getLocalFile(fName);
      Test.assert(file);

      fileContent = file.read();
      fileId = Banana.Converter.textToHash(fileContent, "Sha256");
      filePath = fName;

      var jsonObj = exec(fileContent, fileId, filePath, fileName, fileDateTime, fileSuffix); //takes the exec from the import script.

      this.testLogger.addJson('FileData', JSON.stringify(jsonObj));

      if (!this.progressBar.step())
         break;
   }

   this.progressBar.finish();
}