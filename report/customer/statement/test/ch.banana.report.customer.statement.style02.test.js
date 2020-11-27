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
// @id = ch.banana.uni.timesheet-daystable-report.test
// @api = 1.0
// @pubdate = 2020-03-24
// @publisher = Banana.ch SA
// @description = [Test] Timesheet daystable report
// @task = app.command
// @doctype = *.*
// @docproperties =
// @outputformat = none
// @inputdataform = none
// @timeout = -1
// @includejs = ../ch.banana.report.customer.statement.style02.js

// Register this test case to be executed
Test.registerTestCase(new TestCustomerStatementReport());

// Define the test class, the name of the class is not important
function TestCustomerStatementReport() {}

// This method will be called at the beginning of the test case
TestCustomerStatementReport.prototype.initTestCase = function() {
    this.progressBar = Banana.application.progressBar;
}

// This method will be called at the end of the test case
TestCustomerStatementReport.prototype.cleanupTestCase = function() {}

// This method will be called before every test method is executed
TestCustomerStatementReport.prototype.init = function() {}

// This method will be called after every test method is executed
TestCustomerStatementReport.prototype.cleanup = function() {}

TestCustomerStatementReport.prototype.testBananaExtensions = function() {
    Test.logger.addText("This test will tests the Banana Extension ch.banana.report.customer.statement.style02.js");

    var banDoc = Banana.application.openDocument("file:script/../test/testcases/example.invoice.with.cc.it[1351].ac2");
    Test.assert(banDoc, "File ac2 not found");

    var userParam = {};
    userParam.selectionStartDate = "2020-03-01";
    userParam.selectionEndDate = "2020-04-30";
    userParam.id_employee = "AVS: 123.4567.8910.11";
    userParam.print_timeWorkedTotal = true;
    userParam.print_timeAbsenceSick = true;
    userParam.print_timeAbsenceHoliday = true;
    userParam.print_timeAbsenceService = true;
    userParam.print_timeAbsenceOther = true;
    userParam.print_timeAbsenceTotal = true;
    userParam.print_timeAdjustment = true;
    userParam.print_timeDayTotal = true;
    userParam.print_timeDueDay = true;
    userParam.print_timeDifference = true;
    // userParam.print_date = true;
    // userParam.print_timeDayType = true;
    // userParam.print_timeDayDescription = true;
    // userParam.print_description = true;
    // userParam.print_code1 = true;
    // userParam.print_notes = true;
    // userParam.print_timeWork1 = true;
    // userParam.print_timeWork2 = true;
    // userParam.print_timeStart1 = true;
    // userParam.print_timeStop1 = true;
    // userParam.print_timeStart2 = true;
    // userParam.print_timeStop2 = true;
    // userParam.print_timeStart3 = true;
    // userParam.print_timeStop3 = true;
    // userParam.print_timeStart4 = true;
    // userParam.print_timeStop4 = true;
    // userParam.print_timeStart5 = true;
    // userParam.print_timeStop5 = true;
    // userParam.print_timeDueCode = true;
    // userParam.print_timeProgressive = true;
    // userParam.print_timeSplit1 = true;
    // userParam.print_timeSplit2 = true;
    // userParam.print_km = true;

    var columns = getColumns(userParam);
    // var dateMin = getJounralDateMin(banDoc);
    // var year = dateMin.getFullYear();
    var year = Banana.Converter.toDate(userParam.selectionStartDate).getFullYear();
    var totals = totalizeHours(banDoc, columns, year);
    var report = printInvoiceStatement(jsonStatement, repDocObj, repStyleObj, param);

    Test.logger.addReport("TEST - Timesheet Daystable Report", report);

}