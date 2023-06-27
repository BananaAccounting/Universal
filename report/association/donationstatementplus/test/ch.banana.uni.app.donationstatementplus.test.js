// Copyright [2023] [Banana.ch SA - Lugano Switzerland]
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


// @id = ch.banana.uni.app.donationstatement.test
// @api = 1.0
// @pubdate = 2023-03-03
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.uni.app.donationstatementplus.js>
// @task = app.command
// @doctype = *.*
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @includejs = ../ch.banana.uni.app.donationstatementplus.js
// @timeout = -1


var texts;

// Register test case to be executed
Test.registerTestCase(new ReportTest());

// Here we define the class, the name of the class is not important
function ReportTest() {

}

// This method will be called at the beginning of the test case
ReportTest.prototype.initTestCase = function() {

}

// This method will be called at the end of the test case
ReportTest.prototype.cleanupTestCase = function() {

}

// This method will be called before every test method is executed
ReportTest.prototype.init = function() {

}

// This method will be called after every test method is executed
ReportTest.prototype.cleanup = function() {

}

// Generate the expected (correct) file
ReportTest.prototype.testBananaApp = function() {

  //Test file 1
  var file = "file:script/../test/testcases/test002.ac2";
  var banDoc = Banana.application.openDocument(file);
  Test.assert(banDoc);

  var userParam = {};
  var texts = {};
  var lang;

  // Test #1
  Test.logger.addComment("****************************************************************************** TEST #1 ******************************************************************************");
  lang = getLang(banDoc);
  texts = loadTexts(banDoc,lang);
  userParam.costcenter = '';
  userParam.minimumAmount = '1.00';
  userParam.useExtractTable = false;
  userParam.textToUse = texts.text1;
  userParam.text1 = texts.predefinedText;
  userParam.text2 = '';
  userParam.text3 = '';
  userParam.text4 = '';
  userParam.embeddedTextFile = '';
  userParam.useMarkdown = false;
  userParam.details = true;
  userParam.description = true;
  userParam.textSignature = 'Pinco Pallino';
  userParam.localityAndDate = 'Lugano, 2 ottobre 2023';
  userParam.printSignatureImage = false;
  userParam.nameSignatureImage = '';
  userParam.printHeaderLogo = false;
  userParam.headerLogoName = 'Logo';
  userParam.fontFamily = 'Helvetica';
  userParam.fontSize = '10';
  userParam.css = '';
  this.report_test(banDoc, "2023-01-01", "2023-12-31", userParam, lang, "year report");
  this.report_test(banDoc, "2023-01-01", "2023-06-30", userParam, lang, "1. semester report");
  this.report_test(banDoc, "2023-01-01", "2023-03-31", userParam, lang, "1. quarter report");
  this.report_test(banDoc, "2023-01-01", "2023-01-31", userParam, lang, "january report");

  
  // Test #2
  Test.logger.addComment("****************************************************************************** TEST #2 ******************************************************************************");
  lang = getLang(banDoc);
  texts = loadTexts(banDoc,lang);
  userParam.costcenter = '';
  userParam.minimumAmount = '1.00';
  userParam.useExtractTable = false;
  userParam.textToUse = texts.text2;
  userParam.text1 = texts.predefinedText;
  userParam.text2 = 'TEXT2 - Donazioni #<Account>: <Period>\n\nCon la presente attestiamo che **<FirstName> <FamilyName>** ha donato alla nostra associazione **<Currency> <Amount>**.\nPeriodo delle donazioni: dal <StartDate> al <EndDate>.\nIndirizzo: <Address>.\nRingraziamo cordialmente.';
  userParam.text3 = '';
  userParam.text4 = '';
  userParam.embeddedTextFile = '';
  userParam.useMarkdown = false;
  userParam.details = false;
  userParam.description = false;
  userParam.textSignature = 'Pinco Pallino';
  userParam.localityAndDate = 'Lugano, dicembre 2023';
  userParam.printSignatureImage = false;
  userParam.nameSignatureImage = '';
  userParam.printHeaderLogo = false;
  userParam.headerLogoName = "Logo";
  userParam.fontFamily = 'Helvetica';
  userParam.fontSize = '10';
  userParam.css = '';
  this.report_test(banDoc, "2023-01-01", "2023-12-31", userParam, lang, "year report");
  this.report_test(banDoc, "2023-01-01", "2023-06-30", userParam, lang, "1. semester report");
  this.report_test(banDoc, "2023-01-01", "2023-03-31", userParam, lang, "1. quarter report");
  this.report_test(banDoc, "2023-01-01", "2023-01-31", userParam, lang, "january report");

  // Test #3 - document1.txt
  Test.logger.addComment("****************************************************************************** TEST #3 ******************************************************************************");
  lang = getLang(banDoc);
  texts = loadTexts(banDoc,lang);
  userParam.costcenter = '';
  userParam.minimumAmount = '1.00';
  userParam.useExtractTable = false;
  userParam.textToUse = texts.textEmbedded;
  userParam.text1 = texts.predefinedText;
  userParam.text2 = '';
  userParam.text3 = '';
  userParam.text4 = '';
  userParam.embeddedTextFile = 'document1.txt';
  userParam.useMarkdown = false;
  userParam.details = true;
  userParam.description = false;
  userParam.textSignature = 'Pinco Pallino';
  userParam.localityAndDate = 'Lugano, december 2023';
  userParam.printSignatureImage = false;
  userParam.nameSignatureImage = '';
  userParam.printHeaderLogo = false;
  userParam.headerLogoName = 'Logo';
  userParam.fontFamily = 'Helvetica';
  userParam.fontSize = '10';
  userParam.css = '';
  this.report_test(banDoc, "2023-01-01", "2023-12-31", userParam, lang, "year report");
  this.report_test(banDoc, "2023-01-01", "2023-06-30", userParam, lang, "1. semester report");
  this.report_test(banDoc, "2023-01-01", "2023-03-31", userParam, lang, "1. quarter report");
  this.report_test(banDoc, "2023-01-01", "2023-01-31", userParam, lang, "january report");


  // Test #4
  Test.logger.addComment("****************************************************************************** TEST #4 ******************************************************************************");
  lang = getLang(banDoc);
  texts = loadTexts(banDoc,lang);
  userParam.costcenter = '10001,;10004';
  userParam.minimumAmount = '1.00';
  userParam.useExtractTable = false;
  userParam.textToUse = texts.text1;
  userParam.text1 = texts.predefinedText;
  userParam.text2 = '';
  userParam.text3 = '';
  userParam.text4 = '';
  userParam.embeddedTextFile = '';
  userParam.useMarkdown = false;
  userParam.details = true;
  userParam.description = true;
  userParam.textSignature = 'Pinco Pallino';
  userParam.localityAndDate = 'Lugano 2023';
  userParam.printSignatureImage = false;
  userParam.nameSignatureImage = '';
  userParam.printHeaderLogo = false;
  userParam.headerLogoName = 'Logo';
  userParam.fontFamily = 'Helvetica';
  userParam.fontSize = '10';
  userParam.css = '';
  this.report_test(banDoc, "2023-01-01", "2023-12-31", userParam, lang, "year report");
  this.report_test(banDoc, "2023-01-01", "2023-06-30", userParam, lang, "1. semester report");
  this.report_test(banDoc, "2023-01-01", "2023-03-31", userParam, lang, "1. quarter report");
  this.report_test(banDoc, "2023-01-01", "2023-01-31", userParam, lang, "january report");
  

  // // Test #9 - en - document2.txt as markdown
  // Test.logger.addComment("****************************************************************************** TEST #9 ******************************************************************************");
  // lang = getLang(banDoc);
  // texts = loadTexts(banDoc,lang);
  // userParam.costcenter = '';
  // userParam.minimumAmount = '1.00';
  // userParam.useExtractTable = false;
  // userParam.textToUse = texts.textEmbedded;
  // userParam.text1 = texts.predefinedText;
  // userParam.text2 = '';
  // userParam.text3 = '';
  // userParam.text4 = '';
  // userParam.embeddedTextFile = 'document2.txt';
  // userParam.useMarkdown = true;
  // userParam.details = false;
  // userParam.description = false;
  // userParam.textSignature = 'Pinco Pallino';
  // userParam.localityAndDate = 'xxx, December 2023';
  // userParam.printSignatureImage = false;
  // userParam.nameSignatureImage = '';
  // userParam.printHeaderLogo = false;
  // userParam.headerLogoName = 'Logo';
  // userParam.fontFamily = 'Helvetica';
  // userParam.fontSize = '10';
  // userParam.css = '';
  // this.report_test(banDoc, "2023-01-01", "2023-12-31", userParam, lang, "year report");
  // this.report_test(banDoc, "2023-01-01", "2023-06-30", userParam, lang, "1. semester report");
  // this.report_test(banDoc, "2023-01-01", "2023-03-31", userParam, lang, "1. quarter report");
  // this.report_test(banDoc, "2023-01-01", "2023-01-31", userParam, lang, "january report");

}

//Function that create the report for the test
ReportTest.prototype.report_test = function(banDoc, startDate, endDate, userParam, lang, reportName) {
  userParam.selectionStartDate = startDate;
  userParam.selectionEndDate = endDate;
  texts = loadTexts(banDoc,lang);
  var accounts = getAccountsToPrint(banDoc, userParam, texts);
  var report = printReport(banDoc, userParam, accounts, texts, "");
  Test.logger.addReport(reportName, report);
}

