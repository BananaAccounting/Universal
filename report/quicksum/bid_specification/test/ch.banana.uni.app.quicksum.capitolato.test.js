// Copyright [2026] [Banana.ch SA - Lugano Switzerland]
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


// @id = ch.banana.uni.app.quicksum.capitolato.test
// @api = 1.0
// @pubdate = 2026-01-30
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.uni.app.quicksum.capitolato.js>
// @task = app.command
// @doctype = *.*
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @includejs = ../ch.banana.uni.app.quicksum.capitolato.sbaa/ch.banana.uni.app.quicksum.capitolato.js
// @timeout = -1



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
ReportTest.prototype.testBananaExtension = function() {

  //Test file 1
  var files = [];
  files.push("file:script/../test/testcases/quicksum_presentation.ac2");
  files.push("file:script/../test/testcases/quicksum_presentation_2.ac2");

  for (var i = 0; i < files.length; i++) {
    var file = files[i];
    var banDoc = Banana.application.openDocument(file);
    Test.assert(banDoc);

    var lang = getLang(banDoc);
    var texts = loadTexts(banDoc);
    var userParam = {};

    // Test #1
    Test.logger.addComment("****************************************************************************** TEST #1 ******************************************************************************");
    userParam.version = '1.0';
    userParam.param_print_technical_proposal = true;
    userParam.param_print_summary = true;
    userParam.param_report_name = '';
    userParam.param_print_header_logo = false;
    userParam.param_header_logo_name = 'Logo';
    userParam.param_print_header_address = false;
    userParam.param_regex_exclude_itemid_cell = '';
    userParam.param_max_description_lenght = '58';
    userParam.param_quantity_decimals = '2';
    userParam.param_print_carryforward = true;
    userParam.param_summary_print_other_positions = '';
    userParam.param_report_currency = 'CHF';
    this.report_test(banDoc, userParam, texts);

    // Test #2
    Test.logger.addComment("****************************************************************************** TEST #2 ******************************************************************************");
    userParam.version = '1.0';
    userParam.param_print_technical_proposal = true;
    userParam.param_print_summary = true;
    userParam.param_report_name = 'ABcd123';
    userParam.param_print_header_logo = false;
    userParam.param_header_logo_name = 'Logo';
    userParam.param_print_header_address = false;
    userParam.param_regex_exclude_itemid_cell = '/[a-zA-Z]$/';
    userParam.param_max_description_lenght = '58';
    userParam.param_quantity_decimals = '1';
    userParam.param_print_carryforward = true;
    userParam.param_summary_print_other_positions = '9.1.2;9.1.3';
    userParam.param_report_currency = 'CHF';
    this.report_test(banDoc, userParam, texts);
  
  }
}

ReportTest.prototype.report_test = function(banDoc, userParam, texts) {
  var report = Banana.Report.newReport(userParam.param_report_name || texts.reportTitle);
  var reportName = userParam.param_report_name || texts.reportTitle;
  printReport(banDoc, report, userParam, "");
  Test.logger.addReport(reportName, report);
}

