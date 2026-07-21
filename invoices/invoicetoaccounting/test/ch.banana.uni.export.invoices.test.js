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
// @id = ch.banana.uni.export.invoices.test
// @api = 1.0
// @pubdate = 2026-07-21
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.uni.export.invoices.test>
// @task = app.command
// @doctype = *.*
// @docproperties =
// @outputformat = none
// @inputdataform = none
// @timeout = -1
// @includejs = ../ch.banana.uni.export.invoices.js

/**
 * Test case for ch.banana.uni.export.invoices.
 *
 * Opens a real "Estimates and Invoices" .ac2 fixture once, reads its
 * invoices, then for each interesting combination of settings builds the
 * transaction rows (buildTransactionsRows) and converts them to CSV
 * (rowsToCsv) exactly like exec() does - just without the file/UI dialogs,
 * which cannot run unattended. The CSV text is logged with
 * Test.logger.addCsv: no row-by-row assertions, the CSV itself is the
 * test result, checked manually on the first run and then diffed
 * automatically against test/testexpected on every following run.
 *
 * Unlike the documentchange extension's JSON output, this CSV has no
 * volatile fields (no execution date/time), so nothing needs normalizing
 * before logging.
 *
 * Rename AC2_FILE below if your fixture file has a different name, and
 * make sure it sits in test/testcases/ next to this test file.
 */

var AC2_FILE = "file:script/../test/testcases/test-export-offerte-fatture-iva-lordo-netto-senza-iva.ac2";

Test.registerTestCase(new TestExportInvoices());

function TestExportInvoices() {
}

// Opens the file once for the whole test case (all test* methods share it).
TestExportInvoices.prototype.initTestCase = function () {
   this.sourceDoc = Banana.application.openDocument(AC2_FILE);
   Test.assert(this.sourceDoc, "Unable to open fixture file: " + AC2_FILE);

   this.texts = loadTexts({ locale: "en" });

   this.invoices = readInvoicesFromSource(this.sourceDoc, this.texts);
   Test.assert(this.invoices && this.invoices.length > 0, "Fixture file contains no usable invoices");
};

// Left empty on purpose: see ch.banana.uni.import.invoices.documentchange.test.js
// for why Test.closeDocument caused an unattributed fatal error here too.
TestExportInvoices.prototype.cleanupTestCase = function () {
};

TestExportInvoices.prototype.init = function () {
};

TestExportInvoices.prototype.cleanup = function () {
};

// ---------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------

function defaultParams() {
   return {
      insertDocLink: false,
      docLinkTemplate: "",
      groupByVatCode: false,
      selectionStartDate: "2026-01-01",
      selectionEndDate: "2026-12-31"
   };
}

/**
 * Builds the transaction rows and the CSV text for the given
 * invoices/params (same two calls exec() makes), and logs the CSV with
 * Test.logger.addCsv.
 */
function buildAndLogCsv(testCase, logKey, invoices, params) {
   var rows = buildTransactionsRows(invoices, params, testCase.texts);
   var csv = rowsToCsv(rows);

   Test.logger.addCsv(logKey, csv);
}

// ---------------------------------------------------------------------
// Test methods - one per settings combination worth checking
// ---------------------------------------------------------------------

TestExportInvoices.prototype.testDefaultParams = function () {
   buildAndLogCsv(this, "Default params", this.invoices, defaultParams());
};

TestExportInvoices.prototype.testInsertDocLink = function () {
   var params = defaultParams();
   params.insertDocLink = true;
   params.docLinkTemplate = "Invoice <DocInvoice> - <CustomerName>.pdf";
   buildAndLogCsv(this, "Insert DocLink", this.invoices, params);
};

TestExportInvoices.prototype.testGroupByVatCode = function () {
   var params = defaultParams();
   params.groupByVatCode = true;
   buildAndLogCsv(this, "Group by VAT code", this.invoices, params);
};

TestExportInvoices.prototype.testPeriodFilter = function () {
   var params = defaultParams();
   params.selectionStartDate = "2026-06-01";
   params.selectionEndDate = "2026-06-30";
   buildAndLogCsv(this, "Period filter - June 2026", this.invoices, params);
};