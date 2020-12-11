// Copyright [2020] [Banana.ch SA - Lugano Switzerland]
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
// @pubdate = 2020-12-11
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.uni.app.donationstatement.js>
// @task = app.command
// @doctype = *.*
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @includejs = ../ch.banana.uni.app.donationstatement.js
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
  var file = "file:script/../test/testcases/test001.ac2";
  var banDoc = Banana.application.openDocument(file);
  Test.assert(banDoc);

  var userParam = {};
  var texts = {};
  var lang;

  // Test #1 - it
  Test.logger.addComment("****************************************************************************** TEST #1 ******************************************************************************");
  lang = "it";
  texts = loadTexts(banDoc,lang);
  userParam.costcenter = ';10001,;10002,;10003,;10004';
  userParam.minimumAmount = '0.00';
  userParam.texts = '';
  userParam.useDefaultTexts = true;
  userParam.titleText = texts.title;
  userParam.text1 = texts.multiTransactionText;
  userParam.text2 = '';
  userParam.text3 = '';
  userParam.text4 = '';
  userParam.details = true;
  userParam.signature = 'Pinco Pallino';
  userParam.localityAndDate = 'Lugano, 2 ottobre 2018';
  userParam.printLogo = false;
  userParam.signatureImage = '';
  userParam.imageHeight = '';
  userParam.printHeaderLogo = false;
  userParam.headerLogoName = "";
  this.report_test(banDoc, "2018-01-01", "2018-12-31", userParam, lang, "Whole year report");
  this.report_test(banDoc, "2018-01-01", "2018-03-31", userParam, lang, "Whole year report");
  this.report_test(banDoc, "2018-01-01", "2018-06-30", userParam, lang, "Whole year report");
  this.report_test(banDoc, "2018-01-01", "2018-11-30", userParam, lang, "Whole year report");
  
  // Test #2 - it
  Test.logger.addComment("****************************************************************************** TEST #2 ******************************************************************************");
  lang = "it";
  texts = loadTexts(banDoc,lang);
  userParam.costcenter = '';
  userParam.minimumAmount = '0.00';
  userParam.texts = '';
  userParam.useDefaultTexts = false;
  userParam.titleText = 'Donazioni #<Account>: <Period>';
  userParam.text1 = 'Con la presente attestiamo che **<FirstName> <FamilyName>** ha donato alla nostra associazione **<Currency> <Amount>**.';
  userParam.text2 = 'Periodo delle donazioni: dal <StartDate> al <EndDate>.';
  userParam.text3 = 'Indirizzo: <Address>.';
  userParam.text4 = 'Ringraziamo cordialmente.';
  userParam.details = false;
  userParam.signature = 'Pinco Pallino';
  userParam.localityAndDate = 'Lugano, dicembre 2018';
  userParam.printLogo = false;
  userParam.signatureImage = '';
  userParam.imageHeight = '';
  userParam.printHeaderLogo = false;
  userParam.headerLogoName = "";
  this.report_test(banDoc, "2018-01-01", "2018-12-31", userParam, lang, "Whole year report");
  this.report_test(banDoc, "2018-01-01", "2018-03-31", userParam, lang, "Whole year report");
  this.report_test(banDoc, "2018-07-01", "2018-12-31", userParam, lang, "Whole year report");
  this.report_test(banDoc, "2018-01-01", "2018-10-30", userParam, lang, "Whole year report");

  // Test #3 - en
  Test.logger.addComment("****************************************************************************** TEST #3 ******************************************************************************");
  lang = "en";
  texts = loadTexts(banDoc,lang);
  userParam.costcenter = '10002';
  userParam.minimumAmount = '0.00';
  userParam.texts = '';
  userParam.useDefaultTexts = true;
  userParam.titleText = texts.title;
  userParam.text1 = texts.multiTransactionText;
  userParam.text2 = '';
  userParam.text3 = '';
  userParam.text4 = '';
  userParam.details = true;
  userParam.signature = 'Pinco Pallino';
  userParam.localityAndDate = 'Lugano, october 2nd 2018';
  userParam.printLogo = false;
  userParam.signatureImage = '';
  userParam.imageHeight = '';
  userParam.printHeaderLogo = false;
  userParam.headerLogoName = "";
  this.report_test(banDoc, "2018-01-01", "2018-12-31", userParam, lang, "Whole year report");
  this.report_test(banDoc, "2018-01-01", "2018-03-31", userParam, lang, "Whole year report");
  this.report_test(banDoc, "2018-01-01", "2018-06-30", userParam, lang, "Whole year report");
  this.report_test(banDoc, "2018-01-01", "2018-11-30", userParam, lang, "Whole year report");

  // Test #4 - de
  Test.logger.addComment("****************************************************************************** TEST #4 ******************************************************************************");
  lang = "de";
  texts = loadTexts(banDoc,lang);
  userParam.costcenter = '10002';
  userParam.minimumAmount = '0.00';
  userParam.texts = '';
  userParam.useDefaultTexts = true;
  userParam.titleText = texts.title;
  userParam.text1 = texts.multiTransactionText;
  userParam.text2 = '';
  userParam.text3 = '';
  userParam.text4 = '';
  userParam.details = true;
  userParam.signature = 'Pinco Pallino';
  userParam.localityAndDate = 'Lugano, 2 Oktober 2018';
  userParam.printLogo = false;
  userParam.signatureImage = '';
  userParam.imageHeight = '';
  userParam.printHeaderLogo = false;
  userParam.headerLogoName = "";
  this.report_test(banDoc, "2018-01-01", "2018-12-31", userParam, lang, "Whole year report");
  this.report_test(banDoc, "2018-01-01", "2018-03-31", userParam, lang, "Whole year report");
  this.report_test(banDoc, "2018-01-01", "2018-06-30", userParam, lang, "Whole year report");
  this.report_test(banDoc, "2018-01-01", "2018-11-30", userParam, lang, "Whole year report");

  // Test #5 - fr
  Test.logger.addComment("****************************************************************************** TEST #5 ******************************************************************************");
  lang = "fr";
  texts = loadTexts(banDoc,lang);
  userParam.costcenter = '10002';
  userParam.minimumAmount = '0.00';
  userParam.texts = '';
  userParam.useDefaultTexts = true;
  userParam.titleText = texts.title;
  userParam.text1 = texts.multiTransactionText;
  userParam.text2 = '';
  userParam.text3 = '';
  userParam.text4 = '';
  userParam.details = true;
  userParam.signature = 'Pinco Pallino';
  userParam.localityAndDate = 'Lugano, 2 octobre 2018';
  userParam.printLogo = false;
  userParam.signatureImage = '';
  userParam.imageHeight = '';
  userParam.printHeaderLogo = false;
  userParam.headerLogoName = "";
  this.report_test(banDoc, "2018-01-01", "2018-12-31", userParam, lang, "Whole year report");
  this.report_test(banDoc, "2018-01-01", "2018-03-31", userParam, lang, "Whole year report");
  this.report_test(banDoc, "2018-01-01", "2018-06-30", userParam, lang, "Whole year report");
  this.report_test(banDoc, "2018-01-01", "2018-11-30", userParam, lang, "Whole year report");

  // Test #6 - nl
  Test.logger.addComment("****************************************************************************** TEST #6 ******************************************************************************");
  lang = "nl";
  texts = loadTexts(banDoc,lang);
  userParam.costcenter = '10002';
  userParam.minimumAmount = '0.00';
  userParam.texts = '';
  userParam.useDefaultTexts = true;
  userParam.titleText = texts.title;
  userParam.text1 = texts.multiTransactionText;
  userParam.text2 = '';
  userParam.text3 = '';
  userParam.text4 = '';
  userParam.details = true;
  userParam.signature = 'Pinco Pallino';
  userParam.localityAndDate = 'Lugano, 2 oktober 2018';
  userParam.printLogo = false;
  userParam.signatureImage = '';
  userParam.imageHeight = '';
  userParam.printHeaderLogo = false;
  userParam.headerLogoName = "";
  this.report_test(banDoc, "2018-01-01", "2018-12-31", userParam, lang, "Whole year report");
  this.report_test(banDoc, "2018-01-01", "2018-03-31", userParam, lang, "Whole year report");
  this.report_test(banDoc, "2018-01-01", "2018-06-30", userParam, lang, "Whole year report");
  this.report_test(banDoc, "2018-01-01", "2018-11-30", userParam, lang, "Whole year report");

  // Test #7 - pt
  Test.logger.addComment("****************************************************************************** TEST #7 ******************************************************************************");
  lang = "pt";
  texts = loadTexts(banDoc,lang);
  userParam.costcenter = '10002';
  userParam.minimumAmount = '0.00';
  userParam.texts = '';
  userParam.useDefaultTexts = true;
  userParam.titleText = texts.title;
  userParam.text1 = texts.multiTransactionText;
  userParam.text2 = '';
  userParam.text3 = '';
  userParam.text4 = '';
  userParam.details = true;
  userParam.signature = 'Pinco Pallino';
  userParam.localityAndDate = 'Lugano, 2 oktober 2018';
  userParam.printLogo = false;
  userParam.signatureImage = '';
  userParam.imageHeight = '';
  userParam.printHeaderLogo = false;
  userParam.headerLogoName = "";
  this.report_test(banDoc, "2018-01-01", "2018-12-31", userParam, lang, "Whole year report");
  this.report_test(banDoc, "2018-01-01", "2018-03-31", userParam, lang, "Whole year report");
  this.report_test(banDoc, "2018-01-01", "2018-06-30", userParam, lang, "Whole year report");
  this.report_test(banDoc, "2018-01-01", "2018-11-30", userParam, lang, "Whole year report");

  // Test #8 - en, without accounts with balance zero (10003 and 10004 are not printed)
  Test.logger.addComment("****************************************************************************** TEST #8 ******************************************************************************");
  lang = "en";
  texts = loadTexts(banDoc,lang);
  userParam.costcenter = ';10001,;10003,;10004';
  userParam.minimumAmount = '1.00';
  userParam.texts = '';
  userParam.useDefaultTexts = true;
  userParam.titleText = texts.title;
  userParam.text1 = texts.multiTransactionText;
  userParam.text2 = '';
  userParam.text3 = '';
  userParam.text4 = '';
  userParam.details = true;
  userParam.signature = 'Pinco Pallino';
  userParam.localityAndDate = 'Lugano, 12 february 2019';
  userParam.printLogo = false;
  userParam.signatureImage = '';
  userParam.imageHeight = '';
  userParam.printHeaderLogo = false;
  userParam.headerLogoName = "";
  this.report_test(banDoc, "2018-01-01", "2018-03-31", userParam, lang, "Whole year report");

  // Test #9 - it with <NamePrefix>
  Test.logger.addComment("****************************************************************************** TEST #9 ******************************************************************************");
  lang = "it";
  texts = loadTexts(banDoc,lang);
  userParam.costcenter = '';
  userParam.minimumAmount = '0.00';
  userParam.texts = '';
  userParam.useDefaultTexts = false;
  userParam.titleText = 'Donazioni #<Account>: <Period>';
  userParam.text1 = 'Con la presente attestiamo che **<NamePrefix> <FirstName> <FamilyName>** ha donato alla nostra associazione **<Currency> <Amount>**.';
  userParam.text2 = 'Periodo delle donazioni: dal <StartDate> al <EndDate>.';
  userParam.text3 = 'Indirizzo: <NamePrefix> <Address>.';
  userParam.text4 = 'Ringraziamo cordialmente.';
  userParam.details = false;
  userParam.signature = 'Pinco Pallino';
  userParam.localityAndDate = 'Lugano, dicembre 2018';
  userParam.printLogo = false;
  userParam.signatureImage = '';
  userParam.imageHeight = '';
  userParam.printHeaderLogo = false;
  userParam.headerLogoName = "";
  this.report_test(banDoc, "2018-01-01", "2018-12-31", userParam, lang, "Whole year report");

}

//Function that create the report for the test
ReportTest.prototype.report_test = function(banDoc, startDate, endDate, userParam, lang, reportName) {
  texts = loadTexts(banDoc,lang);
  var accounts = getAccountsToPrint(banDoc, startDate, endDate, userParam);
  var report = createReport(banDoc, startDate, endDate, userParam, accounts,lang);
  Test.logger.addReport(reportName, report);
}

