// Copyright [2021] [Banana.ch SA - Lugano Switzerland]
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
// @id = ch.banana.audit.report.trialbalance.test
// @api = 1.0
// @pubdate = 2021-12-20
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.audit.report.trialbalance.js>
// @task = app.command
// @doctype = *.*
// @outputformat = none
// @inputdataform = none
// @includejs = ../ch.banana.audit.report.trialbalance.js
// @timeout = -1


// Register test case to be executed
Test.registerTestCase(new AuditReports_TrialBalance());

// Here we define the class, the name of the class is not important
function AuditReports_TrialBalance() {

}

// This method will be called at the beginning of the test case
AuditReports_TrialBalance.prototype.initTestCase = function() {

    //for this test it does not matter if the file includes vat or not
    this.fileAC2 = "file:script/../test/testcases/accounting_without_vat.ac2";

}

// This method will be called at the end of the test case
AuditReports_TrialBalance.prototype.cleanupTestCase = function() {

}

// This method will be called before every test method is executed
AuditReports_TrialBalance.prototype.init = function() {

}

// This method will be called after every test method is executed
AuditReports_TrialBalance.prototype.cleanup = function() {

}

//test for Trial Balance report
AuditReports_TrialBalance.prototype.testTrialBalanceReport = function() {

    Test.logger.addComment("Test Trial Balance Report");

    var banDoc = Banana.application.openDocument(this.fileAC2);

    if (!banDoc) {
        Test.logger.addFatalError("Document not found: " + this.fileAC2);
    }

    //All
    Test.logger.addSection("All Year");
    var startDate = "2021.01.01";
    var endDate = "2021.12.31";
    var report = printReport(startDate, endDate, banDoc);
    Test.logger.addReport("Test all year", report);

    //First semester
    Test.logger.addSection("First Semester");
    var startDate = "2021.01.01";
    var endDate = "2021.06.30";
    var report = printReport(startDate, endDate, banDoc);
    Test.logger.addReport("Test first semester", report);


    //Second semester
    Test.logger.addSection("Second Semester");
    var startDate = "2021.07.01";
    var endDate = "2021.06.30";
    var report = printReport(startDate, endDate, banDoc);
    Test.logger.addReport("Test second semester", report);

    //First quarter
    Test.logger.addSection("First Quarter");
    var startDate = "2021.01.01";
    var endDate = "2021.06.30";
    var report = printReport(startDate, endDate, banDoc);
    Test.logger.addReport("Test first Quarter", report);

    //Second Quarter
    Test.logger.addSection("Second Quarter");
    var startDate = "2021.04.01";
    var endDate = "2021.06.30";
    var report = printReport(startDate, endDate, banDoc);
    Test.logger.addReport("Test Second Quarter", report);

    //Third Quarter
    Test.logger.addSection("Third Quarter");
    var startDate = "2021.07.01";
    var endDate = "2021.09.31";
    var report = printReport(startDate, endDate, banDoc);
    Test.logger.addReport("Test Third Quarter", report);

    //Fourth Quarter
    Test.logger.addSection("Fourth Quarter");
    var startDate = "2021.10.01";
    var endDate = "2021.12.31";
    var report = printReport(startDate, endDate, banDoc);
    Test.logger.addReport("Test Fourth Quarter", report);

    Test.logger.close();


}