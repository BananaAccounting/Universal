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
// @id = ch.banana.uni.import.invoices.documentchange.test
// @api = 1.0
// @pubdate = 2026-07-21
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.uni.import.invoices.documentchange.test>
// @task = app.command
// @doctype = *.*
// @docproperties =
// @outputformat = none
// @inputdataform = none
// @timeout = -1
// @includejs = ../ch.banana.uni.import.invoices.documentchange.js

/**
 * Test case for ch.banana.uni.import.invoices.documentchange.
 *
 * Opens a real "Estimates and Invoices" .ac2 fixture once, reads its
 * invoices, then for each interesting combination of settings generates
 * the documentChange JSON (via buildTransactionsAddDocumentChange) and
 * logs it with Test.logger.addJson. No row-by-row assertions: the JSON
 * itself is the test result, checked manually on the first run and then
 * diffed automatically against test/testexpected on every following run.
 *
 * exec() itself is never called, since it opens file/UI dialogs and
 * cannot run unattended.
 *
 * NOTE: jsonDoc.creator.executionDate/executionTime come from new Date()
 * and would differ on every run, so they are normalized to a fixed
 * placeholder before logging.
 *
 * Rename AC2_FILE below if your fixture file has a different name,
 * and make sure it sits in test/testcases/ next to this test file.
 */

var AC2_FILE = "file:script/../test/testcases/test-export-offerte-fatture-iva-lordo-netto-senza-iva.ac2";

Test.registerTestCase(new TestImportInvoicesDocumentChange());

function TestImportInvoicesDocumentChange() {
}

// Opens the file once for the whole test case (all test* methods share it).
TestImportInvoicesDocumentChange.prototype.initTestCase = function () {
   this.sourceDoc = Banana.application.openDocument(AC2_FILE);
   Test.assert(this.sourceDoc, "Unable to open fixture file: " + AC2_FILE);

   this.texts = loadTexts({ locale: "en" });

   this.invoices = readInvoicesFromSource(this.sourceDoc, this.texts);
   Test.assert(this.invoices && this.invoices.length > 0, "Fixture file contains no usable invoices");
};

TestImportInvoicesDocumentChange.prototype.cleanupTestCase = function () {
};

TestImportInvoicesDocumentChange.prototype.init = function () {
};

TestImportInvoicesDocumentChange.prototype.cleanup = function () {
};

// ---------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------

function defaultParams() {
   return {
      customerIsCc3: false,
      insertCustomer: false,
      insertDocLink: false,
      docLinkTemplate: "",
      groupByVatCode: false,
      selectionStartDate: "2026-01-01",
      selectionEndDate: "2026-12-31"
   };
}

/**
 * Builds the documentChange JSON for the given invoices/params, normalizes
 * the volatile creator fields and logs it with Test.logger.addJson.
 */
function buildAndLog(testCase, logKey, invoices, params) {
   var jsonDoc = buildTransactionsAddDocumentChange(invoices, params, testCase.texts);

   jsonDoc.creator.executionDate = "<normalized>";
   jsonDoc.creator.executionTime = "<normalized>";

   Test.logger.addJson(logKey, JSON.stringify(jsonDoc, null, 3));
}

// ---------------------------------------------------------------------
// Test methods - one per settings combination worth checking
// ---------------------------------------------------------------------

TestImportInvoicesDocumentChange.prototype.testDefaultParams = function () {
   buildAndLog(this, "Default params", this.invoices, defaultParams());
};

TestImportInvoicesDocumentChange.prototype.testCustomerAsCc3WithRealCustomer = function () {
   var params = defaultParams();
   params.customerIsCc3 = true;
   params.insertCustomer = true;
   buildAndLog(this, "Customer as Cc3 - real customer inserted", this.invoices, params);
};

TestImportInvoicesDocumentChange.prototype.testInsertDocLink = function () {
   var params = defaultParams();
   params.insertDocLink = true;
   params.docLinkTemplate = "Invoice <DocInvoice> - <CustomerName>.pdf";
   buildAndLog(this, "Insert DocLink", this.invoices, params);
};

TestImportInvoicesDocumentChange.prototype.testGroupByVatCode = function () {
   var params = defaultParams();
   params.groupByVatCode = true;
   buildAndLog(this, "Group by VAT code", this.invoices, params);
};

TestImportInvoicesDocumentChange.prototype.testPeriodFilter = function () {
   var params = defaultParams();
   params.selectionStartDate = "2026-06-01";
   params.selectionEndDate = "2026-06-30";
   buildAndLog(this, "Period filter - June 2026", this.invoices, params);
};