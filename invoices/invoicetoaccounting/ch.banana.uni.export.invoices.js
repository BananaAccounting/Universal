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
// @id = ch.banana.uni.export.invoices
// @api = 1.0
// @pubdate = 2026-07-24
// @publisher = Banana.ch SA
// @description = [DEV] Export invoices to CSV
// @description.en = [DEV] Export invoices to CSV
// @description.it = [DEV] Esporta fatture in CSV
// @description.fr = [DEV] Exporter les factures au format CSV
// @description.de = [DEV] Rechnungen als CSV exportieren
// @task = app.command
// @doctype = 400.400
// @docproperties =
// @outputformat = none
// @inputdataform = none
// @timeout = -1


/**
 * Main entry point of the extension.
 * Reads the invoices directly from their JSON data (no intermediate CSV
 * step) out of the currently open document (Banana.document — the
 * extension is meant to be run with the "Estimates and Invoices" file
 * already open, no source file is selected), lets the user pick the
 * period, builds the transaction rows and writes them to a CSV file
 * chosen by the user (columns: Date, DocInvoice, Description,
 * Amount, VatCode, VatAmountType, IsDetail, RowKind,
 * CustomerNumber, CustomerFirstName, CustomerLastName, CustomerAddress,
 * CustomerBuildingNumber, CustomerPostalCode, CustomerCity,
 * CustomerCountryCode, CustomerLanguage, DocLink).
 * IsDetail marks "S" on the invoice's summary/total row and "D" on every
 * detail row tied to that same invoice, for easy identification/grouping
 * - this is what Banana's own transactions.simple import relies on.
 * RowKind is a finer-grained tag (header/item/discount/rounding) meant for
 * other, non-CSV-import consumers of this same file (e.g. an extension
 * that needs to know which side of a double-entry posting a row belongs
 * to) - Banana's transactions.simple import ignores it.
 * The Customer* columns and DocLink are only populated on the header row
 * of each invoice (empty on item/discount/rounding rows), since they are
 * invoice-level, not row-level, data.
 * A single Amount column holds every row's signed value (negative for the
 * discount row, since it reduces rather than adds to the total, positive
 * otherwise) - there is no separate Debit/Credit pair, since one of the
 * two would always be empty anyway. transactions.simple supports this
 * single-column "Amount" convention natively (income positive, expenses
 * negative).
 * No account columns are included: account assignment is left entirely to
 * Banana / to a manual step after import.
 */
function exec() {

   if (!Banana.document)
      return "@Cancel";

   var texts = loadTexts(Banana.document);

   // Step 1: read the invoices data directly from the currently open document
   var sourceDoc = Banana.document;

   var isSourceDocEstimatesInvoices = isEstimatesInvoices(sourceDoc);
   if (!isSourceDocEstimatesInvoices) {
      Banana.application.addMessage(texts.errorFileSelected);
      return "@Cancel";
   }

   var invoices = readInvoicesFromSource(sourceDoc, texts);
   if (!invoices || !invoices.length) {
      Banana.application.addMessage(texts.errorGeneratingDataFromSourceFile);
      return "@Cancel";
   }

   // Step 2: select the period (the checkbox settings - insertDocLink,
   // groupByVatCode - are NOT asked here: they are loaded as-is from the
   // saved settings, and are only editable through Extensions > Manage
   // Extensions > select this extension > Settings button, which Banana
   // wires up automatically to the settingsDialog() function below)
   var params = loadSettings();
   if (!selectPeriodDialog(params))
      return "@Cancel";
   saveSettings(params);

   // Step 3: build the transaction rows from the invoices data
   var rows = buildTransactionsRows(invoices, params, texts);
   if (!rows || !rows.length) {
      Banana.application.addMessage(texts.errorGeneratingDataFromSourceFile);
      return "@Cancel";
   }

   // Step 4: ask the user where to save the CSV file, suggesting a name
   // built from the selected period so nothing has to be typed unless a
   // different name/location is wanted
   var suggestedFileName = buildCsvFileName(params);
   var csvFileName = Banana.IO.getSaveFileName(texts.selectCsvDestination, suggestedFileName, texts.csvFileType);
   if (!csvFileName || !csvFileName.length) {
      Banana.Ui.showInformation(texts.info, texts.noFileSelected);
      return "@Cancel";
   }

   // Step 5: build the CSV content and write it to disk
   var csvContent = rowsToCsv(rows);
   var csvFile = Banana.IO.getLocalFile(csvFileName);
   var writeOk = csvFile.write(csvContent);
   if (!writeOk || csvFile.errorString) {
      Banana.application.addMessage(texts.impossibleWriteFile + " " + csvFileName +
         (csvFile.errorString ? (" - " + csvFile.errorString) : ""));
      return "@Cancel";
   }

   Banana.Ui.showInformation(texts.info, texts.csvFileCreated + " " + csvFileName);

   return "";
}

/**
 * Returns the value if present, otherwise an empty string.
 */
function getVal(value) {
   return value ? value : "";
}

/**
 * Reads the "Invoices" table from the source document and returns an array
 * of invoice objects built directly from the invoice JSON data
 * (InvoiceData.invoice_json), with no intermediate CSV representation.
 * Each invoice object has the fields required to build the transaction
 * rows, plus an "items" array with one entry per invoice item.
 * Handles localized error messages via the texts object.
 * Returns the array of invoices (possibly empty) or null if the table
 * itself is missing.
 */
function readInvoicesFromSource(sourceDoc, texts) {
   var invoicesTable = sourceDoc.table("Invoices");
   if (!invoicesTable) {
      Banana.application.addMessage(texts.invoiceTableNotFound);
      return null;
   }

   var invoices = [];
   var hasErrors = false;

   for (var i = 0; i < invoicesTable.rowCount; i++) {
      var row = invoicesTable.row(i);
      if (row.isEmpty)
         continue;

      try {
         var invoiceFieldObj = JSON.parse(row.value("InvoiceData"));
         var invoiceObj = JSON.parse(invoiceFieldObj.invoice_json);

         if (!invoiceObj.document_info.date) {
            Banana.application.addMessage(texts.rowFieldMissing
               .replace("%1", i + 1)
               .replace("%2", "InvoiceDate"));
            hasErrors = true;
            continue;
         }
         if (!invoiceObj.customer_info.number) {
            Banana.application.addMessage(texts.rowFieldMissing
               .replace("%1", i + 1)
               .replace("%2", "CustomerNumber"));
            hasErrors = true;
            continue;
         }

         var vatExcl = invoiceObj.document_info.vat_mode === "vat_excl";
         var invoiceDiscount = vatExcl
            ? invoiceObj.billing_info.total_discount_vat_exclusive
            : invoiceObj.billing_info.total_discount_vat_inclusive;

         var customerName = invoiceObj.customer_info.business_name
            ? invoiceObj.customer_info.business_name
            : (getVal(invoiceObj.customer_info.first_name) + " " + getVal(invoiceObj.customer_info.last_name));

         var invoiceNumber = getVal(invoiceObj.document_info.number);

         // The Description column shows "<document_info.description> - <Cliente>".
         var invoiceDescription = getVal(invoiceObj.document_info.description) + " - " + customerName;

         var invoice = {
            invoiceNumber: invoiceNumber,
            invoiceDate: getVal(invoiceObj.document_info.date),
            invoiceDescription: invoiceDescription,
            invoiceDiscount: getVal(invoiceDiscount),
            invoiceRoundingDifference: getVal(invoiceObj.billing_info.total_rounding_difference),
            invoiceTotalToPay: getVal(invoiceObj.billing_info.total_to_pay),
            invoiceAmountType: getVal(invoiceObj.document_info.vat_mode),
            customerNumber: getVal(invoiceObj.customer_info.number),
            customerName: customerName,
            customerFirstName: getVal(invoiceObj.customer_info.first_name),
            customerLastName: getVal(invoiceObj.customer_info.last_name),
            customerAddress: getVal(invoiceObj.customer_info.address1),
            customerBuildingNumber: getVal(invoiceObj.customer_info.building_number),
            customerPostalCode: getVal(invoiceObj.customer_info.postal_code),
            customerCity: getVal(invoiceObj.customer_info.city),
            customerCountryCode: getVal(invoiceObj.customer_info.country_code),
            customerLanguage: getVal(invoiceObj.customer_info.lang),
            items: []
         };

         for (var j = 0; j < invoiceObj.items.length; j++) {
            var itemObj = invoiceObj.items[j];

            if (!itemObj.description) {
               Banana.application.addMessage(texts.rowItemFieldMissing
                  .replace("%1", i + 1)
                  .replace("%2", j + 1)
                  .replace("%3", "ItemDescription"));
               hasErrors = true;
               continue;
            }

            // Both totals are stored as-is from the json, with no
            // conversion/calculation. VatCode grouping is only allowed when
            // the invoice is already net (vat_excl) — see
            // buildTransactionsRows.
            if (vatExcl && !itemObj.total_amount_vat_exclusive) {
               Banana.application.addMessage(texts.rowItemFieldMissing
                  .replace("%1", i + 1)
                  .replace("%2", j + 1)
                  .replace("%3", "ItemTotal"));
               hasErrors = true;
               continue;
            }
            if (!vatExcl && !itemObj.total_amount_vat_inclusive) {
               Banana.application.addMessage(texts.rowItemFieldMissing
                  .replace("%1", i + 1)
                  .replace("%2", j + 1)
                  .replace("%3", "ItemTotal"));
               hasErrors = true;
               continue;
            }

            invoice.items.push({
               vatCode: getVal(itemObj.unit_price.vat_code),
               vatRate: getVal(itemObj.unit_price.vat_rate),
               totalVatExclusive: getVal(itemObj.total_amount_vat_exclusive),
               totalVatInclusive: getVal(itemObj.total_amount_vat_inclusive)
            });
         }

         if (invoice.items.length)
            invoices.push(invoice);

      } catch(e) {
         Banana.application.addMessage(texts.rowInvalidInvoice
            .replace("%1", i + 1)
            .replace("%2", e));
         hasErrors = true;
      }
   }

   if (hasErrors) {
      Banana.application.addMessage(texts.someRecordsHaveErrors);
   }

   return invoices;
}

/**
 * Checks that the source document is of type "Estimates and Invoices"
 * by verifying FileTypeGroup = "400" and FileTypeNumber = "400".
 * Returns true if the type is correct, false otherwise.
 */
function isEstimatesInvoices(sourceDoc) {
   if (sourceDoc) {
      var fileTypeGroup = sourceDoc.info("Base", "FileTypeGroup");
      var fileTypeNumber = sourceDoc.info("Base", "FileTypeNumber");
      if (fileTypeGroup === "400" && fileTypeNumber === "400") {
         return true;
      }
      return false;
   }
   return false;
}

/**
 * Builds the array of transaction rows generated directly from the
 * invoices data (same row structure/logic used by the import extension).
 * For each invoice creates:
 * - one summary row (IsDetail "S") with the total invoice amount in
 *   Amount
 * - one detail row (IsDetail "D") per item (or per VatCode group, depending
 *   on groupByVatCode and the vat_rate-based grouping rules) with the item
 *   amount in Amount
 * - discount rows (IsDetail "D"), split proportionally by VatCode, with a
 *   negative Amount, if a discount is present
 * - one optional rounding row (IsDetail "D")
 * No account columns (AccountDebit/AccountCredit) are produced: account
 * assignment is left entirely to Banana / to a manual step after import.
 * All rows use InvoiceDescription as description.
 * Reads all parameters from the params object. Returns a flat array of
 * {operation, fields} objects — not wrapped in a documentChange, since this
 * extension writes the rows to a CSV file instead of importing them.
 */
function buildTransactionsRows(invoices, params, texts) {

   var insertDocLink = params.insertDocLink;
   var docLinkTemplate = params.docLinkTemplate;
   var groupByVatCode = params.groupByVatCode;
   var periodStartDate = params.selectionStartDate;
   var periodEndDate = params.selectionEndDate;

   var rows = [];

   for (var i = 0; i < invoices.length; i++) {
      var invoice = invoices[i];

      // Filter by period
      if (periodStartDate && periodEndDate && invoice.invoiceDate) {
         if (invoice.invoiceDate < periodStartDate || invoice.invoiceDate > periodEndDate)
            continue;
      }

      // Invoice summary row ("S")
      var headerRow = {};
      headerRow.operation = {};
      headerRow.operation.name = "add";
      headerRow.fields = {};
      headerRow.fields["Date"] = invoice.invoiceDate;
      headerRow.fields["DocInvoice"] = invoice.invoiceNumber;
      headerRow.fields["Description"] = invoice.invoiceDescription;
      headerRow.fields["Amount"] = invoice.invoiceTotalToPay;
      headerRow.fields["VatCode"] = "";
      headerRow.fields["IsDetail"] = "S";
      headerRow.fields["RowKind"] = "header";
      headerRow.fields["CustomerNumber"] = invoice.customerNumber;
      headerRow.fields["CustomerFirstName"] = invoice.customerFirstName;
      headerRow.fields["CustomerLastName"] = invoice.customerLastName;
      headerRow.fields["CustomerAddress"] = invoice.customerAddress;
      headerRow.fields["CustomerBuildingNumber"] = invoice.customerBuildingNumber;
      headerRow.fields["CustomerPostalCode"] = invoice.customerPostalCode;
      headerRow.fields["CustomerCity"] = invoice.customerCity;
      headerRow.fields["CustomerCountryCode"] = invoice.customerCountryCode;
      headerRow.fields["CustomerLanguage"] = invoice.customerLanguage;
      headerRow.fields["DocLink"] = insertDocLink ? resolveDocLink(docLinkTemplate, invoice.invoiceNumber, invoice.customerName) : "";
      rows.push(headerRow);

      // Il raggruppamento per codice IVA viene deciso gruppo per gruppo
      // dentro flushInvoiceItems: gli articoli "senza IVA" (nessun codice)
      // vengono sempre raggruppati in un'unica riga se richiesto, anche a
      // fattura lorda, mentre i gruppi con un codice IVA effettivo restano
      // dettagliati riga per riga quando si è al lordo, per evitare
      // differenze di arrotondamento. Gli importi vengono sempre letti così
      // come sono dal json, senza alcun calcolo.
      flushInvoiceItems(rows, invoice.invoiceDate, invoice.invoiceNumber, invoice.invoiceDescription, invoice.items, groupByVatCode, invoice.invoiceAmountType);

      // Discount rows, if any — split proportionally by VatCode
      addInvoiceDiscountRowsIfNeeded(rows, invoice);

      // Rounding row, if needed
      addRoundingRowIfNeeded(rows, invoice.invoiceDate, invoice.invoiceNumber, invoice.invoiceRoundingDifference, invoice.invoiceDescription, texts);
   }

   return rows;
}

/**
 * Writes the transaction rows for an invoice's items.
 * If groupByVatCode is true, items are grouped by VatCode summing their
 * amounts — but the merge is only applied per group:
 * - items whose vat_rate is empty or 0.00 ("senza IVA") are always merged
 *   into one row, even when the invoice is gross (vat_incl);
 * - items with an actual (non-zero) VAT rate are merged only when the
 *   invoice is net (vat_excl); when gross, they are kept as one row per
 *   item, to avoid VAT rounding differences.
 * If groupByVatCode is false, writes one row per item.
 * The amount used is always taken directly from the item's
 * totalVatExclusive/totalVatInclusive field, as read from the json —
 * no VAT conversion/calculation is performed.
 */
function flushInvoiceItems(rows, invoiceDate, invoiceNumber, invoiceDescription, items, groupByVatCode, invoiceAmountType) {
   if (!items || items.length === 0)
      return;

   var isVatExcl = invoiceAmountType === "vat_excl";

   if (!groupByVatCode) {
      // One row per item
      for (var k = 0; k < items.length; k++) {
         var itemAmount = isVatExcl ? items[k].totalVatExclusive : items[k].totalVatInclusive;
         var row = buildItemRow(invoiceDate, invoiceNumber, invoiceDescription, items[k].vatCode, itemAmount, invoiceAmountType, items[k].vatRate);
         rows.push(row);
      }
      return;
   }

   // Group items by VatCode
   var groups = {};
   var groupOrder = [];
   for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var key = item.vatCode || "";
      if (!groups[key]) {
         groups[key] = { sum: 0, items: [] };
         groupOrder.push(key);
      }
      var amountNum = parseFloat(("" + (isVatExcl ? item.totalVatExclusive : item.totalVatInclusive)).replace(",", ".")) || 0;
      groups[key].sum += amountNum;
      groups[key].items.push(item);
   }

   for (var j = 0; j < groupOrder.length; j++) {
      var vatCode = groupOrder[j];
      var group = groups[vatCode];
      var noVatRate = isZeroOrEmptyVatRate(group.items[0].vatRate);

      // Merge into one row if: net invoice (always safe), or the group's
      // vat_rate is empty/0.00 ("senza IVA" — nothing to round, always
      // safe to merge).
      var canMerge = isVatExcl || noVatRate;

      if (canMerge) {
         var mergedRow = buildItemRow(invoiceDate, invoiceNumber, invoiceDescription, vatCode, group.sum.toString(), invoiceAmountType, group.items[0].vatRate);
         rows.push(mergedRow);
      } else {
         // Gross invoice with an actual VAT rate: keep one row per item
         for (var g = 0; g < group.items.length; g++) {
            var groupItem = group.items[g];
            var itemAmountG = isVatExcl ? groupItem.totalVatExclusive : groupItem.totalVatInclusive;
            var groupRow = buildItemRow(invoiceDate, invoiceNumber, invoiceDescription, groupItem.vatCode, itemAmountG, invoiceAmountType, groupItem.vatRate);
            rows.push(groupRow);
         }
      }
   }
}

/**
 * Parses an amount string (accepting both "." and "," as decimal
 * separator) and returns its negation as a plain dot-decimal string.
 */
function negateAmountString(amountStr) {
   var n = parseFloat(("" + amountStr).replace(",", ".")) || 0;
   return (-n).toString();
}

/**
 * Returns true if a VAT rate string is empty or equals zero (0, 0.00, etc.).
 */
function isZeroOrEmptyVatRate(vatRateStr) {
   if (!vatRateStr || !("" + vatRateStr).length)
      return true;
   var rate = parseFloat(("" + vatRateStr).replace(",", ".")) || 0;
   return rate === 0;
}

/**
 * Builds a single item detail transaction row ("D"). The amount is
 * written to the single Amount column, positive, same as the invoice's
 * "S" row. No account column is produced.
 * VatAmountType is set to "1" only when the invoice is at net (vat_excl)
 * AND the row's vat_rate is not empty/0.00 — rows with no VAT rate never
 * get "1", regardless of the invoice amount type.
 */
function buildItemRow(invoiceDate, invoiceNumber, invoiceDescription, vatCode, amount, invoiceAmountType, vatRate) {
   var row = {};
   row.operation = {};
   row.operation.name = "add";
   row.fields = {};
   row.fields["Date"] = invoiceDate;
   row.fields["DocInvoice"] = invoiceNumber;
   row.fields["Description"] = invoiceDescription;
   row.fields["VatCode"] = vatCode;
   row.fields["VatAmountType"] = (invoiceAmountType === "vat_excl" && !isZeroOrEmptyVatRate(vatRate)) ? "1" : "";
   row.fields["IsDetail"] = "D";
   row.fields["RowKind"] = "item";
   row.fields["Amount"] = amount;
   row.fields["DocLink"] = "";
   return row;
}

/**
 * Adds one discount row per VatCode present in the invoice's items, after
 * the item rows. The total discount (invoice.invoiceDiscount) is split
 * proportionally to each VatCode's share of the invoice items total:
 *   portion = discount * (groupTotal / invoiceItemsTotal)
 * Each group's amount uses the same field already booked for the items
 * (totalVatExclusive/totalVatInclusive depending on invoiceAmountType) —
 * no separate calculation of item amounts, only the proportional split of
 * the discount itself. The last group absorbs the rounding remainder so
 * the portions always sum exactly to the total discount.
 * VatCode is written with a leading "-" (e.g. "-V81") to mark it as a
 * discount on that code; groups with no VatCode ("senza IVA") keep VatCode
 * empty, since there is no code to negate.
 * VatAmountType is set to "1" when the invoice is net (vat_excl) and the
 * group's vat_rate is not empty/0.00 — same rule as the item rows.
 * No account column is produced.
 */
function addInvoiceDiscountRowsIfNeeded(rows, invoice) {
   var discountStr = invoice.invoiceDiscount;
   if (!discountStr || !discountStr.length)
      return;
   if (isZeroAmountString(discountStr))
      return;

   var discountAmount = parseFloat(("" + discountStr).replace(",", ".")) || 0;
   var isVatExcl = invoice.invoiceAmountType === "vat_excl";

   // Sum item amounts per VatCode (always grouped for this proportional
   // split, independently of the groupByVatCode item-detail setting).
   // The group's vat_rate (from the first item found) is kept to decide
   // VatAmountType further down.
   var groups = {};
   var groupOrder = [];
   var invoiceItemsTotal = 0;
   for (var i = 0; i < invoice.items.length; i++) {
      var item = invoice.items[i];
      var key = item.vatCode || "";
      var amountNum = parseFloat(("" + (isVatExcl ? item.totalVatExclusive : item.totalVatInclusive)).replace(",", ".")) || 0;
      if (!groups[key]) {
         groups[key] = { sum: 0, vatRate: item.vatRate };
         groupOrder.push(key);
      }
      groups[key].sum += amountNum;
      invoiceItemsTotal += amountNum;
   }

   if (invoiceItemsTotal === 0 || groupOrder.length === 0)
      return;

   var remaining = Math.round(discountAmount * 100) / 100;

   for (var j = 0; j < groupOrder.length; j++) {
      var vatCode = groupOrder[j];
      var isLast = (j === groupOrder.length - 1);
      var portion;

      if (isLast) {
         portion = remaining;
      } else {
         portion = Math.round((discountAmount * groups[vatCode].sum / invoiceItemsTotal) * 100) / 100;
         remaining = Math.round((remaining - portion) * 100) / 100;
      }

      if (isZeroAmountString(portion.toString()))
         continue;

      var row = {};
      row.operation = {};
      row.operation.name = "add";

      row.fields = {};
      row.fields["Date"] = invoice.invoiceDate;
      row.fields["DocInvoice"] = invoice.invoiceNumber;
      row.fields["Description"] = invoice.invoiceDescription;
      // The discount reduces the total being accumulated in Amount by the
      // item rows above, so it is written here as a *negative* Amount -
      // this row is still an "IsDetail = D" row like the item rows, using
      // the same Amount column, but with a sign that subtracts instead of
      // adding, so that the sum of all detail rows' Amount still matches
      // the total booked as Amount on the invoice's "S" row.
      row.fields["Amount"] = negateAmountString(portion.toString());
      row.fields["VatCode"] = vatCode ? ("-" + vatCode) : "";
      row.fields["VatAmountType"] = (isVatExcl && !isZeroOrEmptyVatRate(groups[vatCode].vatRate)) ? "1" : "";
      row.fields["IsDetail"] = "D";
      row.fields["RowKind"] = "discount";
      row.fields["DocLink"] = "";

      rows.push(row);
   }
}

/**
 * Adds a rounding row using the rounding difference already calculated
 * upstream (billing_info.total_rounding_difference in the invoice JSON).
 * If none of this invoice's detail rows already pushed to "rows" has
 * VatAmountType = "1", the value is used as-is (sign preserved), same as
 * before.
 * If at least one of them has VatAmountType = "1" (net/vat_excl invoice,
 * with a real VAT rate), Banana grosses up those rows' amount by the VAT
 * rate at import time; against that recalculated total, the rounding
 * adjustment must always be entered as a positive value here, regardless
 * of the sign coming from the source data — so it is forced to its
 * absolute value in that case.
 * No account column is produced, VatCode is empty.
 */
function addRoundingRowIfNeeded(rows, invoiceDate, invoiceNumber, roundingDifferenceStr, invoiceDescription, texts) {
   if (!roundingDifferenceStr || !roundingDifferenceStr.length)
      return;
   if (isZeroAmountString(roundingDifferenceStr))
      return;

   var hasNetVatDetail = false;
   for (var i = 0; i < rows.length; i++) {
      var f = rows[i].fields;
      if (f && f["DocInvoice"] === invoiceNumber && f["VatAmountType"] === "1") {
         hasNetVatDetail = true;
         break;
      }
   }

   var roundingAmount = roundingDifferenceStr;
   if (hasNetVatDetail) {
      var n = parseFloat(("" + roundingDifferenceStr).replace(",", ".")) || 0;
      roundingAmount = Math.abs(n).toString();
   }

   var row = {};
   row.operation = {};
   row.operation.name = "add";
   row.fields = {};
   row.fields["Date"] = invoiceDate;
   row.fields["DocInvoice"] = invoiceNumber;
   row.fields["Description"] = invoiceDescription + " (" + texts.rounding + ")";
   row.fields["VatCode"] = "";
   row.fields["IsDetail"] = "D";
   row.fields["RowKind"] = "rounding";
   row.fields["Amount"] = roundingAmount;
   // Raw value, sign never forced - only used by
   // ch.banana.uni.import.invoices.documentchange.js, which (unlike the
   // transactions.simple import) does not gross up VatAmountType=1 rows on
   // import, so it must use the original sign instead of Amount above.
   row.fields["RoundingRawAmount"] = roundingDifferenceStr;
   row.fields["DocLink"] = "";

   rows.push(row);
}


function isZeroAmountString(amountStr) {
   if (!amountStr)
      return true;
   var t = ("" + amountStr).replace(/\s+/g, "");
   if (t === "0" || t === "0.0" || t === "0.00" || t === "0.000" || t === "0,0" || t === "0,00" || t === "0,000")
      return true;
   if (t === "+0" || t === "-0" || t === "+0.00" || t === "-0.00" || t === "+0,00" || t === "-0,00")
      return true;
   return false;
}



/**
 * Replaces the <DocInvoice> and <CustomerName> placeholders in the file
 * name template with the actual invoice number and customer name values.
 * Example: "Invoice <DocInvoice> - <CustomerName>.pdf" → "Invoice 1001 - Mario Rossi.pdf"
 */
function resolveDocLink(template, invoiceNumber, customerName) {
   if (!template)
      return "";
   var result = template.replace(/<DocInvoice>/g, invoiceNumber);
   result = result.replace(/<CustomerName>/g, customerName ? customerName : "");
   return result;
}

/**
 * Builds a suggested CSV file name from the selected period, so the save
 * dialog is pre-filled and the user doesn't have to type anything unless
 * a different name is wanted.
 * Format: "<start>_<end>_invoices.csv", with dates as YYYYMMDD (no
 * separators) - e.g. "20260101_20260630_invoices.csv". Dates first so
 * that exports sort chronologically in a file browser, instead of all
 * clumping together under "invoices" with the date hidden at the end.
 * Falls back to "invoices.csv" if no period was selected.
 */
function buildCsvFileName(params) {
   var startDate = params.selectionStartDate;
   var endDate = params.selectionEndDate;

   if (!startDate || !endDate)
      return "invoices.csv";

   var startCompact = startDate.replace(/-/g, "");
   var endCompact = endDate.replace(/-/g, "");

   return startCompact + "_" + endCompact + "_invoices.csv";
}

/**
 * Converts a flat array of {operation, fields} rows into a CSV string.
 * Columns: Date, DocInvoice, Description, Amount,
 * VatCode, VatAmountType, IsDetail, RowKind, CustomerNumber,
 * CustomerFirstName, CustomerLastName, CustomerAddress,
 * CustomerBuildingNumber, CustomerPostalCode, CustomerCity,
 * CustomerCountryCode, CustomerLanguage, RoundingRawAmount, DocLink.
 * A single signed Amount column is used instead of a Debit/Credit pair,
 * since one of the two would always be empty anyway (see exec()'s doc
 * comment). RowKind (header/item/discount/rounding) and the Customer*
 * columns are only populated on the header row of each invoice - they are
 * the same for every row of that invoice, so repeating them on every
 * detail row would be redundant; consumers that need them (e.g. an import
 * extension building account postings) read them off the header row they
 * already grouped by DocInvoice. RoundingRawAmount is only populated on
 * the rounding row and carries its value with the sign never forced to
 * positive - see addRoundingRowIfNeeded() for why Amount and
 * RoundingRawAmount can differ on that one row. IsDetail (S/D) is kept
 * exactly as before, since Banana's own transactions.simple import
 * relies on it for grouping.
 * Comma-separated, values wrapped in double quotes when needed.
 */
function rowsToCsv(rows) {
   var columns = ["Date", "DocInvoice", "Description", "Amount",
      "VatCode", "VatAmountType", "IsDetail", "RowKind", "CustomerNumber",
      "CustomerFirstName", "CustomerLastName", "CustomerAddress", "CustomerBuildingNumber",
      "CustomerPostalCode", "CustomerCity", "CustomerCountryCode", "CustomerLanguage",
      "RoundingRawAmount", "DocLink"];
   var lines = [];

   lines.push(columns.join(","));

   for (var i = 0; i < rows.length; i++) {
      var fields = rows[i].fields || {};
      var values = [];
      for (var c = 0; c < columns.length; c++) {
         values.push(csvEscape(fields[columns[c]]));
      }
      lines.push(values.join(","));
   }

   return lines.join("\n");
}

/**
 * Wraps a value in double quotes if it contains special characters
 * (comma, quotes, newlines) that would otherwise break CSV parsing.
 * Internal double quotes are escaped by doubling them.
 */
function csvEscape(value) {
   if (value === undefined || value === null)
      return "";
   var s = "" + value;
   if (s.indexOf(",") >= 0 || s.indexOf('"') >= 0 || s.indexOf("\n") >= 0 || s.indexOf("\r") >= 0) {
      s = s.replace(/"/g, '""');
      s = '"' + s + '"';
   }
   return s;
}

/**
 * Initializes the user parameters with their default values.
 */
function initUserParam() {
   var texts = loadTexts(Banana.document);
   var userParam = {};
   userParam.version = '1.0';
   userParam.insertDocLink = false;
   userParam.docLinkTemplate = texts.invoice + ' <DocInvoice>.pdf';
   userParam.groupByVatCode = false;
   userParam.selectionStartDate = '';
   userParam.selectionEndDate = '';
   userParam.selectionChecked = false;
   return userParam;
}

/**
 * Loads the parameters saved in the Banana document via getScriptSettings.
 * If no saved parameters exist, uses the default values from initUserParam.
 */
function loadSettings() {
   var userParam = initUserParam();
   var savedParam = Banana.document.getScriptSettings();
   if (savedParam && savedParam.length > 0) {
      try {
         var saved = JSON.parse(savedParam);
         if (typeof saved.insertDocLink !== "undefined")
            userParam.insertDocLink = saved.insertDocLink;
         if (typeof saved.docLinkTemplate !== "undefined")
            userParam.docLinkTemplate = saved.docLinkTemplate;
         if (typeof saved.groupByVatCode !== "undefined")
            userParam.groupByVatCode = saved.groupByVatCode;
         if (typeof saved.selectionStartDate !== "undefined")
            userParam.selectionStartDate = saved.selectionStartDate;
         if (typeof saved.selectionEndDate !== "undefined")
            userParam.selectionEndDate = saved.selectionEndDate;
         if (typeof saved.selectionChecked !== "undefined")
            userParam.selectionChecked = saved.selectionChecked;
      } catch(e) {}
   }
   return userParam;
}

/**
 * Saves the user parameters to the Banana document via setScriptSettings
 * in JSON format, so they are restored on the next execution.
 */
function saveSettings(userParam) {
   Banana.document.setScriptSettings(JSON.stringify(userParam));
}

/**
 * Converts the user parameters into the format required by openPropertyEditor,
 * with name, type, current value, default value and readValue function
 * for each user-configurable parameter.
 */
function convertParam(userParam) {

   var texts = loadTexts(Banana.document);

   var convertedParam = {};
   convertedParam.version = '1.0';
   convertedParam.data = [];

   var currentParam = {};
   currentParam.name = 'insertDocLink';
   currentParam.parentObject = '';
   currentParam.title = texts.insertDocLink;
   currentParam.type = 'bool';
   currentParam.value = userParam.insertDocLink ? true : false;
   currentParam.defaultvalue = false;
   currentParam.readValue = function() {
      userParam.insertDocLink = this.value;
   }
   convertedParam.data.push(currentParam);

   currentParam = {};
   currentParam.name = 'docLinkTemplate';
   currentParam.parentObject = 'insertDocLink';
   currentParam.title = texts.docLinkTemplate;
   currentParam.type = 'string';
   currentParam.value = userParam.docLinkTemplate ? userParam.docLinkTemplate : texts.invoice + ' <DocInvoice>.pdf';
   currentParam.defaultvalue = texts.invoice + ' <DocInvoice>.pdf';
   currentParam.readValue = function() {
      userParam.docLinkTemplate = this.value;
   }
   convertedParam.data.push(currentParam);

   currentParam = {};
   currentParam.name = 'groupByVatCode';
   currentParam.parentObject = '';
   currentParam.title = texts.groupByVatCode;
   currentParam.type = 'bool';
   currentParam.value = userParam.groupByVatCode ? true : false;
   currentParam.defaultvalue = false;
   currentParam.readValue = function() {
      userParam.groupByVatCode = this.value;
   }
   convertedParam.data.push(currentParam);

   return convertedParam;
}

/**
 * Settings entry point recognized by Banana Accounting itself: it is
 * called automatically when the user clicks the "Settings" button in
 * Extensions > Manage Extensions > (select this extension), NOT when
 * exec() runs. It shows only the checkbox panel (insertDocLink +
 * docLinkTemplate, groupByVatCode) - the period is not part of it, since
 * that is chosen fresh on every run inside exec() via selectPeriodDialog().
 * Returns null if the user cancels, or the (JSON-stringified, though the
 * return value itself is not used by exec()) saved settings otherwise, per
 * the convention documented for this function.
 */
function settingsDialog() {

   var texts = loadTexts(Banana.document);
   var userParam = loadSettings();

   if (typeof Banana.Ui.openPropertyEditor === 'undefined')
      return null;

   var dialogTitle = texts.settingsTitle;
   var convertedParam = convertParam(userParam);
   var pageAnchor = 'dlgSettings';
   if (!Banana.Ui.openPropertyEditor(dialogTitle, convertedParam, pageAnchor))
      return null;

   for (var i = 0; i < convertedParam.data.length; i++) {
      convertedParam.data[i].readValue();
   }

   saveSettings(userParam);

   return JSON.stringify(userParam);
}

/**
 * Displays the period selection dialog using getPeriod. Updates the
 * userParam object with the period chosen by the user. Returns false if
 * the user cancels.
 * The checkbox settings panel (insertDocLink, groupByVatCode) is
 * intentionally not shown: those two values are taken as-is from
 * userParam (i.e. whatever loadSettings() returned - the last saved
 * values, or the defaults from initUserParam() on first run) and can
 * only be changed by editing the saved settings directly.
 */
function selectPeriodDialog(userParam) {

   var texts = loadTexts(Banana.document);

   // Period selection
   var docStartDate = "";
   var docEndDate = "";
   if (typeof Banana.document.startPeriod === 'function')
      docStartDate = Banana.document.startPeriod();
   if (typeof Banana.document.endPeriod === 'function')
      docEndDate = Banana.document.endPeriod();
   var selectedDates = Banana.Ui.getPeriod(texts.selectPeriod, docStartDate, docEndDate,
      userParam.selectionStartDate, userParam.selectionEndDate, userParam.selectionChecked);
   if (selectedDates) {
      userParam.selectionStartDate = selectedDates.startDate;
      userParam.selectionEndDate = selectedDates.endDate;
      userParam.selectionChecked = selectedDates.hasSelection;
   } else {
      return false;
   }

   return true;
}

/**
 * Loads localized texts based on the language of the Banana document.
 * Supports Italian (it), German (de), French (fr) and English (en, default).
 */
function loadTexts(banDoc) {
   // get language
   var lang = "en";
   if (!banDoc) {
      return lang;
   }
   if (banDoc.locale) {
      lang = banDoc.locale;
   }
   if (lang && lang.length > 2) {
      lang = lang.substr(0, 2);
   }

   // set texts
   var texts = {};

   if (lang === "de") {
      texts.info = "Info";
      texts.noFileSelected = "Keine Datei ausgewählt";
      texts.errorGeneratingDataFromSourceFile = "Fehler beim Generieren der Daten aus der Quelldatei. Bitte überprüfen Sie die Fehlermeldungen.";
      texts.selectCsvDestination = "CSV-Datei speichern unter";
      texts.csvFileType = "CSV-Datei (*.csv);;Alle Dateien (*)";
      texts.impossibleWriteFile = "Datei kann nicht geschrieben werden";
      texts.csvFileCreated = "CSV-Datei erfolgreich erstellt:";
      texts.errorFileSelected = "Die ausgewählte Datei ist kein Angebote- und Rechnungstyp.";
      texts.insertDocLink = "PDF-Namen in der Spalte Link einfügen";
      texts.invoice = "Rechnung";
      texts.settingsTitle = "Einstellungen Rechnungsexport (Artikeldetail)";
      texts.docLinkTemplate = "Dateiname (verwende <DocInvoice> und <CustomerName>)";
      texts.groupByVatCode = "Registrierungen nach MwSt-Code gruppieren";
      texts.selectPeriod = "Importzeitraum auswählen";
      texts.invoiceTableNotFound = "Tabelle 'Invoices' nicht in der Quelldatei gefunden.";
      texts.rowFieldMissing = "Zeile %1: Pflichtfeld '%2' fehlt.";
      texts.rowItemFieldMissing = "Zeile %1, Artikel %2: Pflichtfeld '%3' fehlt.";
      texts.rowInvalidInvoice = "Zeile %1: Rechnung ungültig. Fehler: %2";
      texts.someRecordsHaveErrors = "Einige Datensätze enthalten Fehler und wurden übersprungen. Bitte überprüfen Sie die obigen Meldungen.";
      texts.rounding = "Rundung";
   }
   else if (lang === "fr") {
      texts.info = "Info";
      texts.noFileSelected = "Aucun fichier sélectionné";
      texts.errorGeneratingDataFromSourceFile = "Erreur lors de la génération des données depuis le fichier source. Vérifiez les messages d'erreur.";
      texts.selectCsvDestination = "Enregistrer le fichier CSV sous";
      texts.csvFileType = "Fichier CSV (*.csv);;Tous les fichiers (*)";
      texts.impossibleWriteFile = "Impossible d'écrire le fichier";
      texts.csvFileCreated = "Fichier CSV créé avec succès :";
      texts.errorFileSelected = "Le fichier sélectionné n'est pas de type Offres et Factures.";
      texts.insertDocLink = "Insérer le nom du PDF dans la colonne Lien";
      texts.invoice = "Facture";
      texts.settingsTitle = "Paramètres d'export des factures (détail articles)";
      texts.docLinkTemplate = "Nom du fichier (utilise <DocInvoice> et <CustomerName>)";
      texts.groupByVatCode = "Regrouper les enregistrements par code TVA";
      texts.selectPeriod = "Sélectionner la période à importer";
      texts.invoiceTableNotFound = "Table 'Invoices' introuvable dans le fichier source.";
      texts.rowFieldMissing = "Ligne %1 : champ obligatoire '%2' manquant.";
      texts.rowItemFieldMissing = "Ligne %1, article %2 : champ obligatoire '%3' manquant.";
      texts.rowInvalidInvoice = "Ligne %1 : facture invalide. Erreur : %2";
      texts.someRecordsHaveErrors = "Certains enregistrements contiennent des erreurs et ont été ignorés. Vérifiez les messages ci-dessus.";
      texts.rounding = "Arrondi";
   }
   else if (lang === "it") {
      texts.info = "Info";
      texts.noFileSelected = "Nessun file selezionato";
      texts.errorGeneratingDataFromSourceFile = "Errore durante la generazione dei dati dal file sorgente. Verificare i messaggi di errore.";
      texts.selectCsvDestination = "Salva file CSV con nome";
      texts.csvFileType = "File CSV (*.csv);;Tutti i file (*)";
      texts.impossibleWriteFile = "Impossibile scrivere il file";
      texts.csvFileCreated = "File CSV creato con successo:";
      texts.errorFileSelected = "Il file selezionato non è di tipo Offerte e Fatture.";
      texts.insertDocLink = "Inserisci il nome del PDF nella colonna Link";
      texts.invoice = "Fattura";
      texts.settingsTitle = "Impostazioni esportazione fatture (dettaglio articoli)";
      texts.docLinkTemplate = "Nome del file (usa <DocInvoice> e <CustomerName>)";
      texts.groupByVatCode = "Raggruppa registrazioni per codice IVA";
      texts.selectPeriod = "Seleziona il periodo da importare";
      texts.invoiceTableNotFound = "Tabella 'Invoices' non trovata nel file sorgente.";
      texts.rowFieldMissing = "Riga %1: campo '%2' obbligatorio mancante.";
      texts.rowItemFieldMissing = "Riga %1, item %2: campo '%3' obbligatorio mancante.";
      texts.rowInvalidInvoice = "Riga %1: fattura non valida. Errore: %2";
      texts.someRecordsHaveErrors = "Alcuni record presentano errori e sono stati saltati. Verificare i messaggi sopra.";
      texts.rounding = "Arrotondamento";
   }
   else { // lang === "en"
      texts.info = "Info";
      texts.noFileSelected = "No file selected";
      texts.errorGeneratingDataFromSourceFile = "Error generating data from the source file. Please check the error messages.";
      texts.selectCsvDestination = "Save CSV file as";
      texts.csvFileType = "CSV file (*.csv);;All files (*)";
      texts.impossibleWriteFile = "Unable to write file";
      texts.csvFileCreated = "CSV file successfully created:";
      texts.errorFileSelected = "The selected file is not of type Estimates and Invoices.";
      texts.insertDocLink = "Insert PDF name in the Link column";
      texts.invoice = "Invoice";
      texts.settingsTitle = "Invoice export settings (item detail)";
      texts.docLinkTemplate = "File name (use <DocInvoice> and <CustomerName>)";
      texts.groupByVatCode = "Group transaction rows by VAT code";
      texts.selectPeriod = "Select the period to import";
      texts.invoiceTableNotFound = "Table 'Invoices' not found in the source file.";
      texts.rowFieldMissing = "Row %1: required field '%2' missing.";
      texts.rowItemFieldMissing = "Row %1, item %2: required field '%3' missing.";
      texts.rowInvalidInvoice = "Row %1: invalid invoice. Error: %2";
      texts.someRecordsHaveErrors = "Some records have errors and were skipped. Please check the messages above.";
      texts.rounding = "Rounding";
   }

   return texts;
}
