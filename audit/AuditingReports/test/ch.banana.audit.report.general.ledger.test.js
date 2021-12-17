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
// @id = ch.banana.audit.report.general.ledger.test
// @api = 1.0
// @pubdate = 2021-11-26
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.audit.report.general.ledger.js>
// @task = app.command
// @doctype = *.*
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @includejs = ../ch.banana.audit.report.general.ledger.js
// @timeout = -1


// Register test case to be executed
Test.registerTestCase(new AuditReports_GeneralLedger());

// Here we define the class, the name of the class is not important
function AuditReports_GeneralLedger() {

}

// This method will be called at the beginning of the test case
AuditReports_GeneralLedger.prototype.initTestCase = function() {

    this.fileAC2_withVAT="file:script/../test/testcases/accounting_with_vat.ac2";
    this.fileAC2_withoutVAT="file:script/../test/testcases/accounting_with_vat.ac2";

}

// This method will be called at the end of the test case
AuditReports_GeneralLedger.prototype.cleanupTestCase = function() {

}

// This method will be called before every test method is executed
AuditReports_GeneralLedger.prototype.init = function() {

}

// This method will be called after every test method is executed
AuditReports_GeneralLedger.prototype.cleanup = function() {

}

//test for general ledger report
AuditReports_GeneralLedger.prototype.testGeneralLedgerReport = function() {

    Test.logger.addComment("Test General Ledger Report");

    /**************************************************
     * TEST CASES FILE WITH VAT
     *************************************************/
    //Only base columns¨
    var banDoc=Banana.application.openDocument(this.fileAC2_withVAT);
    var startDate="2021.01.01";
    var endDate="2022.12.31";
    var addColumns=[];
    var report=printReport(startDate,endDate,addColumns,banDoc);

    Test.logger.addReport("General Ledger Report",report);

    //with additional columns: Notes, AccountDebit,AccountCredit


    //with addition columns (vat) VatRate, VatRateEffective, VatTaxable  and VatAmount

    /**************************************************
     * TEST CASES FILE WITH VAT
     *************************************************/
    //Only base columns


    //with additional columns: ContraAccount;AccountDebitDes,AccountCreditDes

    Test.logger.close();


}