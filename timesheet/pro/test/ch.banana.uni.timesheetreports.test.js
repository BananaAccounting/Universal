// Copyright [2018] [Banana.ch SA - Lugano Switzerland]
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
// @id = ch.banana.uni.timesheetreports.test
// @api = 1.0
// @pubdate = 2020-10-20
// @publisher = Banana.ch SA
// @description = [Test] Timesheet report
// @task = app.command
// @doctype = *.*
// @docproperties =
// @outputformat = none
// @inputdataform = none
// @timeout = -1
// @includejs = ../ch.banana.uni.timesheetreports.js

// Register this test case to be executed
Test.registerTestCase(new TestTimesheetReport());

// Define the test class, the name of the class is not important
function TestTimesheetReport() {
}

// This method will be called at the beginning of the test case
TestTimesheetReport.prototype.initTestCase = function() {
   this.progressBar = Banana.application.progressBar;
}

// This method will be called at the end of the test case
TestTimesheetReport.prototype.cleanupTestCase = function() {
}

// This method will be called before every test method is executed
TestTimesheetReport.prototype.init = function() {
}

// This method will be called after every test method is executed
TestTimesheetReport.prototype.cleanup = function() {
}

TestTimesheetReport.prototype.testBananaExtensions = function() {
   Test.logger.addText("This test will tests the Banana Extension ch.banana.uni.timesheetreports.js");
   
   var banDoc = Banana.application.openDocument("file:script/../test/testcases/muster_zeiterfassung_vereinfacht_for_projektverwaltung.ac2");
   Test.assert(banDoc, "File ac2 not found");

   var userParam = {};
   userParam.selectionStartDate = "2020-01-01";
   userParam.selectionEndDate = "2020-01-31";
   userParam.logo_print = true;
   userParam.logo_name = 'Logo';
    userParam.call_id = "";
    userParam.responsibleEmployee = "";
    userParam.customer_id = "";
    userParam.name = "";
    userParam.contactPerson = "";
    userParam.changeRequestTask = "";
    userParam.psp = "";
   
   var report = printTimeSheetJournal(banDoc, userParam);

   Test.logger.addReport("TEST - Timesheet Report", report);

}