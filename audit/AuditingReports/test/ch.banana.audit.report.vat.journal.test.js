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
// @id = ch.banana.audit.report.vat.journal.test
// @api = 1.0
// @pubdate = 2021-12-20
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.audit.report.vat.journal.js>
// @task = app.command
// @doctype = *.*
// @outputformat = none
// @inputdataform = none
// @includejs = ../ch.banana.audit.report.vat.journal.js
// @timeout = -1


// Register test case to be executed
Test.registerTestCase(new AuditReports_VatJournal());

// Here we define the class, the name of the class is not important
function AuditReports_VatJournal() {

}

// This method will be called at the beginning of the test case
AuditReports_VatJournal.prototype.initTestCase = function() {

    this.fileAC2_withVAT = "file:script/../test/testcases/accounting_with_vat.ac2";
    this.fileAC2_withoutVAT = "file:script/../test/testcases/accounting_without_vat.ac2";

}

// This method will be called at the end of the test case
AuditReports_VatJournal.prototype.cleanupTestCase = function() {

}

// This method will be called before every test method is executed
AuditReports_VatJournal.prototype.init = function() {

}

// This method will be called after every test method is executed
AuditReports_VatJournal.prototype.cleanup = function() {

}

//test for Vat Journal report
AuditReports_VatJournal.prototype.testVatJournalReport = function() {

    Test.logger.addComment("Test Vat Journal Report");
    var userParam=initUserParam();

    var banDoc_withVAT = Banana.application.openDocument(this.fileAC2_withVAT);
    var banDoc_withoutVAT = Banana.application.openDocument(this.fileAC2_withoutVAT);
    if (!banDoc_withVAT || !banDoc_withoutVAT) {
        Test.logger.addFatalError("Document not found");
    }

    /**************************************************
     * TEST CASES FILE WITH VAT
     *************************************************/
    Test.logger.addSection("Test File with VAT");

    //Only base columns
    Test.logger.addSubSection("Only Base Columns");
    var startDate = "2021.01.01";
    var endDate = "2022.12.31";
    var report = printReport(startDate, endDate, userParam, banDoc_withVAT);

    Test.logger.addReport("VAT journal Report", report);

    //with additional columns: Notes, AccountDebit,AccountCredit
    Test.logger.addSubSection("Test With additional columns");
    var startDate = "2021.01.01";
    var endDate = "2022.12.31";
    userParam.vatJournal.xmlColumnsName = ["Notes", "AccountDebit", "AccountCredit"];
    var report = printReport(startDate, endDate, userParam, banDoc_withVAT);

    Test.logger.addReport("Vat journal Report", report);

    //with addition columns (vat) VatAccount,VatRateEffective,VatAmount

    Test.logger.addSubSection("Test With additional columns (vat related)");
    var startDate = "2021.01.01";
    var endDate = "2022.12.31";
    userParam.vatJournal.xmlColumnsName = ["VatAccount", "VatRateEffective", "VatAmount"];
    var report = printReport(startDate, endDate, userParam, banDoc_withVAT);

    Test.logger.addReport("Vat Journal Report", report);

    /**************************************************
     * TEST CASES FILE WITHOUT VAT
     *************************************************/
    Test.logger.addSection("Test File Without VAT");
    //Only base columns
    Test.logger.addSubSection("Only Base Columns");
    var startDate = "2021.01.01";
    var endDate = "2022.12.31";
    userParam.vatJournal.xmlColumnsName=[];
    var report = printReport(startDate, endDate, userParam, banDoc_withoutVAT);

    Test.logger.addReport("Vat Journal Report", report);

    //with additional columns: ContraAccount;AccountDebitDes,AccountCreditDes
    Test.logger.addSubSection("Test With additional columns");
    var startDate = "2021.01.01";
    var endDate = "2022.12.31";
    userParam.vatJournal.xmlColumnsName = ["ContraAccount", "AccountDebitDes", "AccountCreditDes"];
    var report = printReport(startDate, endDate, userParam, banDoc_withoutVAT);

    Test.logger.addReport("Vat Journal Report", report);

    Test.logger.close();


}
function initUserParam(){
    var userParam={};
    userParam.vatJournal={};
    userParam.vatJournal.xmlColumnsName=[];//test all the accounts, also those without transactions

    return userParam;
}