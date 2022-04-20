// Copyright [2022] [Banana.ch SA - Lugano Switzerland]
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


// @id = ch.banana.uni.app.transactionvoucher.test
// @api = 1.0
// @pubdate = 2022-04-20
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.uni.app.transactionvoucher.js>
// @task = app.command
// @doctype = *.*
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @includejs = ../ch.banana.uni.app.transactionvoucher.js
// @includejs = ../written-number.min.js
// @timeout = -1


/*
  SUMMARY
  -------
  Javascript test
  1. Open the .ac2 file
  2. Execute the .js script
  3. Save the report
**/





// Register test case to be executed
Test.registerTestCase(new VoucherTransactionTest());

// Here we define the class, the name of the class is not important
function VoucherTransactionTest() {

}

// This method will be called at the beginning of the test case
VoucherTransactionTest.prototype.initTestCase = function() {

}

// This method will be called at the end of the test case
VoucherTransactionTest.prototype.cleanupTestCase = function() {

}

// This method will be called before every test method is executed
VoucherTransactionTest.prototype.init = function() {

}

// This method will be called after every test method is executed
VoucherTransactionTest.prototype.cleanup = function() {

}

VoucherTransactionTest.prototype.testReportVoucher_1 = function() {

  var fileAC2 = "file:script/../test/testcases/test-uae.ac2";
  var banDoc = Banana.application.openDocument(fileAC2);
  if (!banDoc) {
    return;
  }

  Test.logger.addSection("Test file: " + fileAC2);

  var userParam = initUserParam();
  userParam.voucherNumber = "80";
  userParam.paidTo = "paid to text...";
  userParam.paidIn = "Cash";
  userParam.chequeNumber = "";
  userParam.paymentReceivedBy = "payment received text...";
  userParam.paidBy = "paid by text...";
  userParam.preparedBy = "prepared by text...";
  userParam.verifiedBy = "verified by text...";
  userParam.recommendedBy = "recommended by text...";
  userParam.approvedBy = "approved by text...";
  userParam.title = "Transaction Voucher";

  Test.logger.addSubSection("Test 1, voucher no.80 with VAT");
  
  var report = createReport(userParam, banDoc, "");
  Test.logger.addReport("", report);
}

VoucherTransactionTest.prototype.testReportVoucher_2 = function() {

  var fileAC2 = "file:script/../test/testcases/test-uae.ac2";
  var banDoc = Banana.application.openDocument(fileAC2);
  if (!banDoc) {
    return;
  }

  Test.logger.addSection("Test file: " + fileAC2);

  var userParam = initUserParam();
  userParam.voucherNumber = "90";
  userParam.paidTo = "paid to text...";
  userParam.paidIn = "Cheque";
  userParam.chequeNumber = "1234";
  userParam.paymentReceivedBy = "payment received text...";
  userParam.paidBy = "paid by text...";
  userParam.preparedBy = "prepared by text...";
  userParam.verifiedBy = "verified by text...";
  userParam.recommendedBy = "recommended by text...";
  userParam.approvedBy = "approved by text...";
  userParam.title = "TrAnSaCtIoN VoUcHeR";

  Test.logger.addSubSection("Test 2, voucher no.90 without VAT");
  
  var report = createReport(userParam, banDoc, "");
  Test.logger.addReport("", report);
}


function initUserParam() {
  var userParam = {};
  userParam.voucherNumber = "";
  userParam.paidTo = "";
  userParam.paidIn = "Cash";
  userParam.chequeNumber = "";
  userParam.paymentReceivedBy = "";
  userParam.paidBy = "";
  userParam.preparedBy = "";
  userParam.verifiedBy = "";
  userParam.recommendedBy = "";
  userParam.approvedBy = "";
  userParam.title = "Transaction Voucher";
  return userParam;
}

