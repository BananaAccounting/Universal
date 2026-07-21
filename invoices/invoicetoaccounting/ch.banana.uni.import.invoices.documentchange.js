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
// @id = ch.banana.uni.import.invoices.documentchange
// @api = 1.0
// @pubdate = 2026-06-03
// @publisher = Banana.ch SA
// @description = [DEV] Import invoices from CSV (documentchange)
// @description.en = [DEV] Import invoices from CSV (documentchange)
// @description.it = [DEV] Importa fatture da CSV (documentchange)
// @description.fr = [DEV] Importer des factures depuis un fichier CSV (documentchange)
// @description.de = [DEV] Rechnungen aus CSV importieren (documentchange)
// @task = app.command
// @doctype = 100.100;100.110
// @docproperties =
// @outputformat = none
// @inputdataform = none
// @timeout = -1


/**
 * Main entry point of the extension.
 * Opens the source .ac2 file, reads the invoices directly from their JSON
 * data (no intermediate CSV step), displays the settings dialog, filters
 * by period and imports the transactions into Banana.
 */
function exec() {

   if (!Banana.document)
      return "@Cancel";

   var texts = loadTexts(Banana.document);

   // Step 1: select and open the source .ac2 file
   var ac2FileName = Banana.IO.getOpenFileName(texts.selectSourceFile, "", texts.fileType);
   if (!ac2FileName || !ac2FileName.length) {
      Banana.Ui.showInformation(texts.info, texts.noFileSelected);
      return "@Cancel";
   }

   var sourceDoc = Banana.application.openDocument(ac2FileName);
   if (!sourceDoc) {
      Banana.application.addMessage(texts.impossibleOpenFile + " " + ac2FileName);
      return "@Cancel";
   }

   // Step 2: read the invoices data directly from the source document
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

   // Step 3: show settings dialog
   var params = loadSettings();
   if (!settingsDialog(params))
      return "@Cancel";
   saveSettings(params);

   // Step 4: build the document change from the invoices data
   var documentChange = {
      "format": "documentChange",
      "error": "",
      "data": []
   };

   var jsonDoc = buildTransactionsAddDocumentChange(invoices, params, texts);
   documentChange["data"].push(jsonDoc);

   return documentChange;
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
            // buildTransactionsAddDocumentChange.
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
}

/**
 * Builds the documentChange object to return to Banana with the transaction
 * rows generated directly from the invoices data. For each invoice creates:
 * - one header row with customer in AccountDebit and total invoice amount
 * - one row per item (or per VatCode group if groupByVatCode is enabled)
 *   with AccountCredit "[CA]" and item/group amount
 * - one optional discount row with AccountDebit "[CA]" and customer in AccountCredit
 * All rows use InvoiceDescription as description.
 * Reads all parameters from the params object.
 */
function buildTransactionsAddDocumentChange(invoices, params, texts) {

   var customerIsCc3 = params.customerIsCc3;
   var insertCustomer = params.insertCustomer;
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

      // Invoice header row
      var headerRow = {};
      headerRow.operation = {};
      headerRow.operation.name = "add";
      headerRow.fields = {};
      headerRow.fields["Date"] = invoice.invoiceDate;
      headerRow.fields["DocInvoice"] = invoice.invoiceNumber;
      headerRow.fields["Description"] = invoice.invoiceDescription;
      if (customerIsCc3) {
         headerRow.fields["AccountDebit"] = "";
         headerRow.fields["Cc3"] = insertCustomer ? invoice.customerNumber : "[A]";
      } else {
         headerRow.fields["AccountDebit"] = insertCustomer ? invoice.customerNumber : "[A]";
         headerRow.fields["Cc3"] = "";
      }
      headerRow.fields["AccountCredit"] = "";
      headerRow.fields["Amount"] = invoice.invoiceTotalToPay;
      headerRow.fields["VatCode"] = "";
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
      addInvoiceDiscountRowsIfNeeded(rows, invoice, customerIsCc3, insertCustomer);

      // Rounding row, if needed
      addRoundingRowIfNeeded(rows, invoice.invoiceDate, invoice.invoiceNumber, invoice.invoiceRoundingDifference, invoice.invoiceDescription, texts);
   }

   var dataUnitTransactions = {};
   dataUnitTransactions.nameXml = "Transactions";
   dataUnitTransactions.data = {};
   dataUnitTransactions.data.rowLists = [];
   dataUnitTransactions.data.rowLists.push({ "rows": rows });

   var jsonDoc = initDocument();
   jsonDoc.document.dataUnits.push(dataUnitTransactions);

   return jsonDoc;
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
 * Returns true if a VAT rate string is empty or equals zero (0, 0.00, etc.).
 */
function isZeroOrEmptyVatRate(vatRateStr) {
   if (!vatRateStr || !("" + vatRateStr).length)
      return true;
   var rate = parseFloat(("" + vatRateStr).replace(",", ".")) || 0;
   return rate === 0;
}

/**
 * Builds a single item detail transaction row.
 * AccountDebit is empty, AccountCredit is "[CA]".
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
   row.fields["AccountDebit"] = "";
   row.fields["AccountCredit"] = "[CA]";
   row.fields["Cc3"] = "";
   row.fields["VatCode"] = vatCode;
   row.fields["VatAmountType"] = (invoiceAmountType === "vat_excl" && !isZeroOrEmptyVatRate(vatRate)) ? "1" : "";
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
 * AccountDebit is "[CA]". The customer account is never inserted into
 * AccountCredit, which is always left empty.
 */
function addInvoiceDiscountRowsIfNeeded(rows, invoice, customerIsCc3, insertCustomer) {
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
      row.fields["AccountDebit"] = "[CA]";
      if (customerIsCc3) {
         row.fields["AccountCredit"] = "";
         row.fields["Cc3"] = insertCustomer ? invoice.customerNumber : "[A]";
      } else {
         row.fields["AccountCredit"] = "";
         row.fields["Cc3"] = "";
      }
      row.fields["Amount"] = portion.toString();
      row.fields["VatCode"] = vatCode ? ("-" + vatCode) : "";
      row.fields["VatAmountType"] = (isVatExcl && !isZeroOrEmptyVatRate(groups[vatCode].vatRate)) ? "1" : "";
      row.fields["DocLink"] = "";

      rows.push(row);
   }
}

/**
 * Adds a rounding row using the rounding difference already calculated
 * upstream (billing_info.total_rounding_difference in the invoice JSON).
 * No recalculation is performed: if the value is present and not zero,
 * it is used as-is as the row amount.
 * AccountDebit is empty, AccountCredit is "[CA]", VatCode is empty.
 */
function addRoundingRowIfNeeded(rows, invoiceDate, invoiceNumber, roundingDifferenceStr, invoiceDescription, texts) {
   if (!roundingDifferenceStr || !roundingDifferenceStr.length)
      return;
   if (isZeroAmountString(roundingDifferenceStr))
      return;

   var row = {};
   row.operation = {};
   row.operation.name = "add";
   row.fields = {};
   row.fields["Date"] = invoiceDate;
   row.fields["DocInvoice"] = invoiceNumber;
   row.fields["Description"] = invoiceDescription + " (" + texts.rounding + ")";
   row.fields["AccountDebit"] = "";
   row.fields["AccountCredit"] = "[CA]";
   row.fields["Cc3"] = "";
   row.fields["VatCode"] = "";
   row.fields["Amount"] = roundingDifferenceStr;
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
 * Initializes the JSON document to be returned to Banana with the
 * creator metadata (date, time, script name, version).
 */
function initDocument() {
   var jsonDoc = {};
   jsonDoc.document = {};
   jsonDoc.document.fileVersion = "1.0.0";
   jsonDoc.document.dataUnits = [];
   jsonDoc.creator = {};
   jsonDoc.creator.executionDate = getCurrentDate();
   jsonDoc.creator.executionTime = getCurrentTime();
   jsonDoc.creator.name = Banana.script.getParamValue('id');
   jsonDoc.creator.version = "1.0";
   return jsonDoc;
}

/**
 * Returns the current date formatted as an internal Banana date string (YYYY-MM-DD).
 */
function getCurrentDate() {
   var d = new Date();
   var datestring = d.getFullYear() + ("0" + (d.getMonth() + 1)).slice(-2) + ("0" + d.getDate()).slice(-2);
   return Banana.Converter.toInternalDateFormat(datestring, "yyyymmdd");
}

/**
 * Returns the current time formatted as an internal Banana time string (HH:MM).
 */
function getCurrentTime() {
   var d = new Date();
   var timestring = ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
   return Banana.Converter.toInternalTimeFormat(timestring);
}

/**
 * Initializes the user parameters with their default values.
 */
function initUserParam() {
   var texts = loadTexts(Banana.document);
   var userParam = {};
   userParam.version = '1.0';
   userParam.customerIsCc3 = false;
   userParam.insertCustomer = false;
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
         if (typeof saved.customerIsCc3 !== "undefined")
            userParam.customerIsCc3 = saved.customerIsCc3;
         if (typeof saved.insertCustomer !== "undefined")
            userParam.insertCustomer = saved.insertCustomer;
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
   currentParam.name = 'customerIsCc3';
   currentParam.parentObject = '';
   currentParam.title = texts.customerIsCc3;
   currentParam.type = 'bool';
   currentParam.value = userParam.customerIsCc3 ? true : false;
   currentParam.defaultvalue = false;
   currentParam.readValue = function() {
      userParam.customerIsCc3 = this.value;
   }
   convertedParam.data.push(currentParam);

   currentParam = {};
   currentParam.name = 'insertCustomer';
   currentParam.parentObject = '';
   currentParam.title = texts.insertCustomer;
   currentParam.type = 'bool';
   currentParam.value = userParam.insertCustomer ? true : false;
   currentParam.defaultvalue = false;
   currentParam.readValue = function() {
      userParam.insertCustomer = this.value;
   }
   convertedParam.data.push(currentParam);

   currentParam = {};
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
 * Displays the settings dialog using openPropertyEditor and then the period
 * selection dialog using getPeriod. Updates the userParam object with the
 * values chosen by the user. Returns false if the user cancels.
 */
function settingsDialog(userParam) {

   var texts = loadTexts(Banana.document);

   if (typeof Banana.Ui.openPropertyEditor !== 'undefined') {
      var dialogTitle = texts.settingsTitle;
      var convertedParam = convertParam(userParam);
      var pageAnchor = 'dlgSettings';
      if (!Banana.Ui.openPropertyEditor(dialogTitle, convertedParam, pageAnchor))
         return false;
      for (var i = 0; i < convertedParam.data.length; i++) {
         convertedParam.data[i].readValue();
      }
   }

   // Period selection
   var docStartDate = Banana.document.startPeriod();
   var docEndDate = Banana.document.endPeriod();
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
      texts.selectSourceFile = "Quelldatei auswählen (.ac2)";
      texts.fileType = "Banana-Datei (*.ac2);;Alle Dateien (*.*)";
      texts.info = "Info";
      texts.noFileSelected = "Keine Datei ausgewählt";
      texts.impossibleOpenFile = "Datei kann nicht geöffnet werden";
      texts.errorGeneratingDataFromSourceFile = "Fehler beim Generieren der Daten aus der Quelldatei. Bitte überprüfen Sie die Fehlermeldungen.";
      texts.errorFileSelected = "Die ausgewählte Datei ist kein Angebote- und Rechnungstyp.";
      texts.customerIsCc3 = "Das Kundenkonto ist ein Kostenstelle CC3";
      texts.insertCustomer = "Kundenkonto einfügen";
      texts.insertDocLink = "PDF-Namen in der Spalte Link einfügen";
      texts.invoice = "Rechnung";
      texts.settingsTitle = "Einstellungen Rechnungsimport (Artikeldetail)";
      texts.selectPeriod = "Importzeitraum auswählen";
      texts.invoiceTableNotFound = "Tabelle 'Invoices' nicht in der Quelldatei gefunden.";
      texts.rowFieldMissing = "Zeile %1: Pflichtfeld '%2' fehlt.";
      texts.rowItemFieldMissing = "Zeile %1, Artikel %2: Pflichtfeld '%3' fehlt.";
      texts.rowInvalidInvoice = "Zeile %1: Rechnung ungültig. Fehler: %2";
      texts.someRecordsHaveErrors = "Einige Datensätze enthalten Fehler und wurden übersprungen. Bitte überprüfen Sie die obigen Meldungen.";
      texts.docLinkTemplate = "Dateiname (verwende <DocInvoice> und <CustomerName>)";
      texts.groupByVatCode = "Registrierungen nach MwSt-Code gruppieren";
      texts.rounding = "Rundung";
   }
   else if (lang === "fr") {
      texts.selectSourceFile = "Sélectionner le fichier source (.ac2)";
      texts.fileType = "Fichier Banana (*.ac2);;Tous les fichiers (*.*)";
      texts.info = "Info";
      texts.noFileSelected = "Aucun fichier sélectionné";
      texts.impossibleOpenFile = "Impossible d'ouvrir le fichier";
      texts.errorGeneratingDataFromSourceFile = "Erreur lors de la génération des données depuis le fichier source. Vérifiez les messages d'erreur.";
      texts.errorFileSelected = "Le fichier sélectionné n'est pas de type Offres et Factures.";
      texts.customerIsCc3 = "Le compte client est un centre de coût CC3";
      texts.insertCustomer = "Insérer le compte client";
      texts.insertDocLink = "Insérer le nom du PDF dans la colonne Lien";
      texts.invoice = "Facture";
      texts.settingsTitle = "Paramètres d'import des factures (détail articles)";
      texts.selectPeriod = "Sélectionner la période à importer";
      texts.invoiceTableNotFound = "Table 'Invoices' introuvable dans le fichier source.";
      texts.rowFieldMissing = "Ligne %1 : champ obligatoire '%2' manquant.";
      texts.rowItemFieldMissing = "Ligne %1, article %2 : champ obligatoire '%3' manquant.";
      texts.rowInvalidInvoice = "Ligne %1 : facture invalide. Erreur : %2";
      texts.someRecordsHaveErrors = "Certains enregistrements contiennent des erreurs et ont été ignorés. Vérifiez les messages ci-dessus.";
      texts.docLinkTemplate = "Nom du fichier (utilise <DocInvoice> et <CustomerName>)";
      texts.groupByVatCode = "Regrouper les enregistrements par code TVA";
      texts.rounding = "Arrondi";
   }
   else if (lang === "it") {
      texts.selectSourceFile = "Seleziona il file sorgente (.ac2)";
      texts.fileType = "File Banana (*.ac2);;Tutti i files (*.*)";
      texts.info = "Info";
      texts.noFileSelected = "Nessun file selezionato";
      texts.impossibleOpenFile = "Impossibile aprire il file";
      texts.errorGeneratingDataFromSourceFile = "Errore durante la generazione dei dati dal file sorgente. Verificare i messaggi di errore.";
      texts.errorFileSelected = "Il file selezionato non è di tipo Offerte e Fatture.";
      texts.customerIsCc3 = "Il conto cliente è un centro di costo CC3";
      texts.insertCustomer = "Inserisci il conto cliente";
      texts.insertDocLink = "Inserisci il nome del PDF nella colonna Link";
      texts.invoice = "Fattura";
      texts.settingsTitle = "Impostazioni importazione fatture (dettaglio articoli)";
      texts.selectPeriod = "Seleziona il periodo da importare";
      texts.invoiceTableNotFound = "Tabella 'Invoices' non trovata nel file sorgente.";
      texts.rowFieldMissing = "Riga %1: campo '%2' obbligatorio mancante.";
      texts.rowItemFieldMissing = "Riga %1, item %2: campo '%3' obbligatorio mancante.";
      texts.rowInvalidInvoice = "Riga %1: fattura non valida. Errore: %2";
      texts.someRecordsHaveErrors = "Alcuni record presentano errori e sono stati saltati. Verificare i messaggi sopra.";
      texts.docLinkTemplate = "Nome del file (usa <DocInvoice> e <CustomerName>)";
      texts.groupByVatCode = "Raggruppa registrazioni per codice IVA";
      texts.rounding = "Arrotondamento";
   }
   else { // lang === "en"
      texts.selectSourceFile = "Select the source file (.ac2)";
      texts.fileType = "Banana file (*.ac2);;All files (*.*)";
      texts.info = "Info";
      texts.noFileSelected = "No file selected";
      texts.impossibleOpenFile = "Unable to open file";
      texts.errorGeneratingDataFromSourceFile = "Error generating data from the source file. Please check the error messages.";
      texts.errorFileSelected = "The selected file is not of type Estimates and Invoices.";
      texts.customerIsCc3 = "The customer account is a cost center CC3";
      texts.insertCustomer = "Insert customer account";
      texts.insertDocLink = "Insert PDF name in the Link column";
      texts.invoice = "Invoice";
      texts.settingsTitle = "Invoice import settings (item detail)";
      texts.selectPeriod = "Select the period to import";
      texts.invoiceTableNotFound = "Table 'Invoices' not found in the source file.";
      texts.rowFieldMissing = "Row %1: required field '%2' missing.";
      texts.rowItemFieldMissing = "Row %1, item %2: required field '%3' missing.";
      texts.rowInvalidInvoice = "Row %1: invalid invoice. Error: %2";
      texts.someRecordsHaveErrors = "Some records have errors and were skipped. Please check the messages above.";
      texts.docLinkTemplate = "File name (use <DocInvoice> and <CustomerName>)";
      texts.groupByVatCode = "Group transaction rows by VAT code";
      texts.rounding = "Rounding";
   }

   return texts;
}
