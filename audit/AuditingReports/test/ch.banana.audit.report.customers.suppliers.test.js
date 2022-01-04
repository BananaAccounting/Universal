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
// @id = ch.banana.audit.report.customers.suppliers.test
// @api = 1.0
// @pubdate = 2021-12-20
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.audit.report.customers.suppliers.js>
// @task = app.command
// @doctype = *.*
// @outputformat = none
// @inputdataform = none
// @includejs = ../ch.banana.audit.report.customers.suppliers.js
// @timeout = -1


// Register test case to be executed
Test.registerTestCase(new AuditReports_CustomersAndSuppliers());

// Here we define the class, the name of the class is not important
function AuditReports_CustomersAndSuppliers() {

}

// This method will be called at the beginning of the test case
AuditReports_CustomersAndSuppliers.prototype.initTestCase = function() {

    this.fileAC2_withoutVAT = "file:script/../test/testcases/accounting_without_vat.ac2";

}

// This method will be called at the end of the test case
AuditReports_CustomersAndSuppliers.prototype.cleanupTestCase = function() {

}

// This method will be called before every test method is executed
AuditReports_CustomersAndSuppliers.prototype.init = function() {

}

// This method will be called after every test method is executed
AuditReports_CustomersAndSuppliers.prototype.cleanup = function() {

}

//test for general ledger report
AuditReports_CustomersAndSuppliers.prototype.testGeneralLedgerReport = function() {

    Test.logger.addComment("Test Customers and Suppliers Report");

    var banDoc = Banana.application.openDocument(this.fileAC2_withoutVAT);
    if (!banDoc) {
        Test.logger.addFatalError("Document not found");
    }

    /**************************************************
     * TEST CASES FILE WITHOUT VAT
     *************************************************/

    Test.logger.addSection("Test base columns")
    var userParam=initUserParam();

    //Only base columns
    var report = printReport(banDoc, userParam);

    Test.logger.addReport("Customers and Suppliers Report, Base Columns", report);

    //with additional columns: Language, Fax, Website

    Test.logger.addSection("Test With additional columns: Language, Fax, Website");

    userParam.customersAndSuppliers.xmlColumnsName = ["Language", "Fax", "Website"];
    var report = printReport(banDoc, userParam);

    Test.logger.addReport("Customers and Suppliers Report, Additional Columns", report);


    Test.logger.close();


}

function initUserParam(){
    var userParam={};
    userParam.customersAndSuppliers={};
    userParam.customersAndSuppliers.xmlColumnsName=[];//test all the accounts, also those without transactions

    return userParam;
}