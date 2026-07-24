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
 * Each test method loads its OWN CSV fixture (via loadInvoiceGroups),
 * instead of sharing a single one across the whole test case. Fill in
 * the CSV_* constants below with the file names you want each method to
 * use (all expected in test/testcases/, next to this file) - everything
 * else is already wired up.
 *
 * Reminder: documentchange.js itself no longer computes anything from the
 * invoice data (no VAT grouping, no discount split, no period filter, no
 * doc link resolution) - all of that already happened once, when the CSV
 * was exported by ch.banana.uni.export.invoices.js. Only customerIsCc3/
 * insertCustomer are still read from params here. So for
 * testInsertDocLink/testGroupByVatCode/testPeriodFilter to actually
 * exercise something different, CSV_INSERT_DOC_LINK/CSV_GROUP_BY_VAT_CODE/
 * CSV_PERIOD_FILTER need to point at CSVs that were exported WITH that
 * setting active (via ch.banana.uni.export.invoices.js) - if you point
 * them at the same CSV as testDefaultParams, they will just produce the
 * same output, since documentchange.js can't tell the difference.
 *
 * exec() itself is never called (it opens a file-selection dialog, which
 * cannot run unattended). Instead each test method calls the same two
 * functions exec() calls internally:
 *   - parseCsvIntoInvoiceGroups(csvContent, texts)
 *   - buildTransactionRowsFromCsv(invoiceGroups, params)
 * and logs the resulting rows (wrapped the same way exec() wraps them
 * into a documentChange) with Test.logger.addJson.
 */

Test.registerTestCase(new TestImportInvoicesDocumentChange());

function TestImportInvoicesDocumentChange() {
}

TestImportInvoicesDocumentChange.prototype.initTestCase = function () {
   this.texts = loadTexts({ locale: "en" });
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
      insertCustomer: false
   };
}

/**
 * Reads and parses the given CSV fixture file (a path relative to the
 * test folder, e.g. "file:script/../test/testcases/xxx.csv").
 */
function loadInvoiceGroups(testCase, csvFileName) {
   var csvFile = Banana.IO.getLocalFile(csvFileName);
   Test.assert(csvFile, "Unable to access fixture file: " + csvFileName);

   var csvContent = csvFile.read();
   Test.assert(csvContent && csvContent.length > 0,
      "Fixture file is empty or unreadable: " + csvFileName +
      (csvFile.errorString ? (" - " + csvFile.errorString) : ""));

   var invoiceGroups = parseCsvIntoInvoiceGroups(csvContent, testCase.texts);
   Test.assert(invoiceGroups && invoiceGroups.length > 0,
      "Fixture CSV contains no usable invoices (check it has RowKind, Date, DocInvoice columns): " + csvFileName);

   return invoiceGroups;
}

/**
 * Builds the documentChange rows from the parsed CSV invoice groups
 * (same call exec() makes), wraps them the same way exec() does, and
 * logs the JSON with Test.logger.addJson.
 */
function buildAndLog(testCase, logKey, invoiceGroups, params) {
   var rows = buildTransactionRowsFromCsv(invoiceGroups, params);

   var dataUnitTransactions = {};
   dataUnitTransactions.nameXml = "Transactions";
   dataUnitTransactions.data = {};
   dataUnitTransactions.data.rowLists = [];
   dataUnitTransactions.data.rowLists.push({ "rows": rows });

   var jsonDoc = initDocument();
   jsonDoc.document.dataUnits.push(dataUnitTransactions);

   jsonDoc.creator.executionDate = "<normalized>";
   jsonDoc.creator.executionTime = "<normalized>";

   Test.logger.addJson(logKey, JSON.stringify(jsonDoc, null, 3));

   return rows;
}

// ---------------------------------------------------------------------
// CSV fixtures - one per test method, fill in the file names
// (all expected in test/testcases/)
// ---------------------------------------------------------------------

var CSV_DEFAULT_PARAMS = "file:script/../test/testcases/test-export-offerte-fatture-iva-lordo-netto-senza-iva-non-raggruppato.csv";
var CSV_INSERT_DOC_LINK = "file:script/../test/testcases/test-export-offerte-fatture-iva-lordo-netto-senza-iva-doclink.csv";
var CSV_GROUP_BY_VAT_CODE = "file:script/../test/testcases/test-export-offerte-fatture-iva-lordo-netto-senza-iva-raggruppato.csv";
var CSV_PERIOD_FILTER = "file:script/../test/testcases/test-export-offerte-fatture-iva-lordo-netto-senza-iva-giugno.csv";

// ---------------------------------------------------------------------
// Test methods
// ---------------------------------------------------------------------

TestImportInvoicesDocumentChange.prototype.testDefaultParams = function () {
   var invoiceGroups = loadInvoiceGroups(this, CSV_DEFAULT_PARAMS);
   buildAndLog(this, "Default params", invoiceGroups, defaultParams());
};

TestImportInvoicesDocumentChange.prototype.testCustomerAsCc3WithRealCustomer = function () {
   var invoiceGroups = loadInvoiceGroups(this, CSV_DEFAULT_PARAMS);

   var params = defaultParams();
   params.customerIsCc3 = true;
   params.insertCustomer = true;

   buildAndLog(this, "Customer as Cc3 - real customer inserted", invoiceGroups, params);
};

// NOTE: for this to actually differ from testDefaultParams, CSV_INSERT_DOC_LINK
// must be a CSV exported from ch.banana.uni.export.invoices.js with
// insertDocLink = true - documentchange.js just passes DocLink through as-is.
TestImportInvoicesDocumentChange.prototype.testInsertDocLink = function () {
   var invoiceGroups = loadInvoiceGroups(this, CSV_INSERT_DOC_LINK);
   buildAndLog(this, "Insert DocLink", invoiceGroups, defaultParams());
};

// NOTE: for this to actually differ from testDefaultParams, CSV_GROUP_BY_VAT_CODE
// must be a CSV exported from ch.banana.uni.export.invoices.js with
// groupByVatCode = true - the grouping itself happens at export time.
TestImportInvoicesDocumentChange.prototype.testGroupByVatCode = function () {
   var invoiceGroups = loadInvoiceGroups(this, CSV_GROUP_BY_VAT_CODE);
   buildAndLog(this, "Group by VAT code", invoiceGroups, defaultParams());
};

// NOTE: for this to actually differ from testDefaultParams, CSV_PERIOD_FILTER
// must be a CSV exported from ch.banana.uni.export.invoices.js with a
// narrower selectionStartDate/selectionEndDate - the filtering itself
// happens at export time (fewer invoices end up in the CSV at all).
TestImportInvoicesDocumentChange.prototype.testPeriodFilter = function () {
   var invoiceGroups = loadInvoiceGroups(this, CSV_PERIOD_FILTER);
   buildAndLog(this, "Period filter - June 2026", invoiceGroups, defaultParams());
};
