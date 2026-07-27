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
// @pubdate = 2026-07-24
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
 *
 * Reads the CSV file produced by ch.banana.uni.export.invoices.js and
 * turns it into a documentChange that adds the corresponding double-entry
 * rows to the accounting file currently open (Banana.document).
 *
 * Unlike the previous version, this extension no longer reads the
 * Invoices table / invoice JSON directly and no longer computes VAT
 * grouping, discount splitting or the rounding row itself - all of that
 * business logic lives in ch.banana.uni.export.invoices.js now, which
 * already resolved it once when it built the CSV. This extension's only
 * job is to remap each CSV row into an account posting, based on the
 * row's RowKind column:
 *  - "header"   -> customer account (AccountDebit, or Cc3 if
 *                  customerIsCc3 is set) / Amount = the row's Amount
 *  - "item"     -> AccountCredit "[CA]" / Amount = the row's Amount
 *  - "discount" -> AccountDebit "[CA]" (opposite side from "item" rows) /
 *                  Amount = absolute value. The CSV encodes discount rows
 *                  as a *negative* Amount (needed for the
 *                  transactions.simple import, which accumulates
 *                  everything in a single signed column); here the row
 *                  instead moves to the opposite account side, so the
 *                  amount is normalized back to positive.
 *  - "rounding" -> AccountCredit "[CA]" / Amount = the row's
 *                  RoundingRawAmount (sign never forced positive, unlike
 *                  the Amount column used by the transactions.simple
 *                  import - documentChange rows are not grossed up by VAT
 *                  on import, so the original sign must be preserved to
 *                  match this extension's pre-CSV behavior exactly)
 * The period, VAT-grouping and doc-link choices are NOT asked again here:
 * they were already decided when the CSV was exported. The only settings
 * specific to this extension are customerIsCc3 and insertCustomer, which
 * only affect how the *already known* customer number is mapped onto
 * accounts - see settingsDialog().
 */
function exec() {

   if (!Banana.document)
      return "@Cancel";

   var texts = loadTexts(Banana.document);
   var params = loadSettings();

   // Step 1: select and read the CSV file exported by
   // ch.banana.uni.export.invoices.js
   var csvFileName = Banana.IO.getOpenFileName(texts.selectCsvSource, "", texts.csvFileType);
   if (!csvFileName || !csvFileName.length) {
      Banana.Ui.showInformation(texts.info, texts.noFileSelected);
      return "@Cancel";
   }

   // Step 2: show the settings panel (customerIsCc3, insertCustomer)
   // immediately - not just via the Manage Extensions > Settings button
   // (settingsDialog() further below remains available too, as an
   // alternate entry point to change the settings without running a full
   // import).
   if (!showSettingsDialog(params))
      return "@Cancel";
   saveSettings(params);

   var csvFile = Banana.IO.getLocalFile(csvFileName);
   var csvContent = csvFile.read();
   if (!csvContent || !csvContent.length) {
      Banana.application.addMessage(texts.impossibleOpenFile + " " + csvFileName +
         (csvFile.errorString ? (" - " + csvFile.errorString) : ""));
      return "@Cancel";
   }

   // Step 3: parse the CSV, grouping its rows by invoice
   var invoiceGroups = parseCsvIntoInvoiceGroups(csvContent, texts);
   if (!invoiceGroups || !invoiceGroups.length) {
      Banana.application.addMessage(texts.errorGeneratingDataFromSourceFile);
      return "@Cancel";
   }

   // Step 4: remap every CSV row into a documentChange row
   var rows = buildTransactionRowsFromCsv(invoiceGroups, params);
   if (!rows || !rows.length) {
      Banana.application.addMessage(texts.errorGeneratingDataFromSourceFile);
      return "@Cancel";
   }

   var dataUnitTransactions = {};
   dataUnitTransactions.nameXml = "Transactions";
   dataUnitTransactions.data = {};
   dataUnitTransactions.data.rowLists = [];
   dataUnitTransactions.data.rowLists.push({ "rows": rows });

   var jsonDoc = initDocument();
   jsonDoc.document.dataUnits.push(dataUnitTransactions);

   var documentChange = {
      "format": "documentChange",
      "error": "",
      "data": []
   };
   documentChange["data"].push(jsonDoc);

   return documentChange;
}

/**
 * Automatically detects the CSV separator (tab, semicolon or comma) by
 * analyzing the first line of the text. Same logic as
 * ch.banana.uni.import.invoices.transactions.js.
 */
function findSeparator(text) {
   var lines = text.split(/\r\n|\n|\r/);
   var firstLine = lines.length > 0 ? lines[0] : "";

   var commaCount = 0;
   var semicolonCount = 0;
   var tabCount = 0;

   for (var i = 0; i < firstLine.length; i++) {
      var c = firstLine.charAt(i);
      if (c === ",")
         commaCount++;
      else if (c === ";")
         semicolonCount++;
      else if (c === "\t")
         tabCount++;
   }

   if (tabCount >= commaCount && tabCount >= semicolonCount)
      return "\t";
   if (semicolonCount > commaCount)
      return ";";
   return ",";
}

/**
 * Normalizes a CSV header string by removing the leading BOM, whitespace
 * and converting to lowercase, for robust comparison.
 */
function normalizeHeader(s) {
   if (!s)
      return "";
   var t = "" + s;
   t = t.replace(/^\uFEFF/, ""); // BOM
   t = t.replace(/\s+/g, "");
   t = t.toLowerCase();
   return t;
}

/**
 * Maps the CSV header names this extension needs to their column indices.
 * Returns an object with field names as keys and indices as values.
 * Fields not found have value -1. Column order in the source file does
 * not matter - only the header names do.
 */
function mapHeaderIndex(headerRow) {
   var idx = {
      Date: -1,
      DocInvoice: -1,
      Description: -1,
      Amount: -1,
      VatCode: -1,
      VatAmountType: -1,
      RowKind: -1,
      CustomerNumber: -1,
      RoundingRawAmount: -1,
      DocLink: -1
   };

   for (var i = 0; i < headerRow.length; i++) {
      var h = normalizeHeader(headerRow[i]);

      if (h === "date")
         idx.Date = i;
      else if (h === "docinvoice")
         idx.DocInvoice = i;
      else if (h === "description")
         idx.Description = i;
      else if (h === "amount")
         idx.Amount = i;
      else if (h === "vatcode")
         idx.VatCode = i;
      else if (h === "vatamounttype")
         idx.VatAmountType = i;
      else if (h === "rowkind")
         idx.RowKind = i;
      else if (h === "customernumber")
         idx.CustomerNumber = i;
      else if (h === "roundingrawamount")
         idx.RoundingRawAmount = i;
      else if (h === "doclink")
         idx.DocLink = i;
   }

   return idx;
}

/**
 * Returns the cell value at column index in the given row. Returns an
 * empty string if the index is negative, the row is null or the index is
 * out of range.
 */
function getValue(row, index) {
   if (index < 0 || !row || index >= row.length)
      return "";
   return row[index] ? row[index] : "";
}

/**
 * Parses the CSV text and groups its data rows by DocInvoice, preserving
 * the order invoices first appear in. Requires the Date, DocInvoice and
 * RowKind columns to be present (RowKind is what makes this CSV usable
 * for a documentChange import, as opposed to the plain transactions.simple
 * import which only needs IsDetail).
 * Returns an array of invoice groups (each one an array of parsed row
 * objects), or null if the file is unusable.
 */
function parseCsvIntoInvoiceGroups(csvContent, texts) {
   var separator = findSeparator(csvContent);
   var rows = Banana.Converter.csvToArray(csvContent, separator, '"');
   if (!rows || rows.length < 2)
      return null;

   var header = rows[0];
   var idx = mapHeaderIndex(header);

   if (idx.Date < 0 || idx.DocInvoice < 0 || idx.RowKind < 0) {
      Banana.application.addMessage(texts.missingRequiredColumns);
      return null;
   }

   var groupsByInvoice = {};
   var invoiceOrder = [];

   for (var i = 1; i < rows.length; i++) {
      var r = rows[i];
      if (!r || r.length === 0)
         continue;

      var docInvoice = getValue(r, idx.DocInvoice);
      var rowKind = getValue(r, idx.RowKind);
      if (!docInvoice || !rowKind)
         continue;

      if (!groupsByInvoice[docInvoice]) {
         groupsByInvoice[docInvoice] = [];
         invoiceOrder.push(docInvoice);
      }

      groupsByInvoice[docInvoice].push({
         date: getValue(r, idx.Date),
         docInvoice: docInvoice,
         description: getValue(r, idx.Description),
         amount: getValue(r, idx.Amount),
         vatCode: getValue(r, idx.VatCode),
         vatAmountType: getValue(r, idx.VatAmountType),
         rowKind: rowKind,
         customerNumber: getValue(r, idx.CustomerNumber),
         roundingRawAmount: getValue(r, idx.RoundingRawAmount),
         docLink: getValue(r, idx.DocLink)
      });
   }

   var invoiceGroups = [];
   for (var j = 0; j < invoiceOrder.length; j++) {
      invoiceGroups.push(groupsByInvoice[invoiceOrder[j]]);
   }
   return invoiceGroups;
}

/**
 * Parses an amount string (accepting both "." and "," as decimal
 * separator) and returns its absolute value as a plain dot-decimal
 * string.
 */
function absAmountString(amountStr) {
   var n = parseFloat(("" + amountStr).replace(",", ".")) || 0;
   return Math.abs(n).toString();
}

/**
 * Remaps a single parsed CSV row into a documentChange {operation, fields}
 * row, based on its RowKind. Returns null for an unrecognized RowKind
 * (defensive: e.g. a CSV hand-edited or produced by something else).
 */
function buildDocumentChangeRowFromCsvRow(csvRow, customerIsCc3, insertCustomer, invoiceCustomerNumber) {
   var row = {};
   row.operation = {};
   row.operation.name = "add";
   row.fields = {};
   row.fields["Date"] = csvRow.date;
   row.fields["DocInvoice"] = csvRow.docInvoice;
   row.fields["Description"] = csvRow.description;

   if (csvRow.rowKind === "header") {
      var customerValue = insertCustomer ? invoiceCustomerNumber : "[A]";
      if (customerIsCc3) {
         row.fields["AccountDebit"] = "";
         row.fields["Cc3"] = customerValue;
      } else {
         row.fields["AccountDebit"] = customerValue;
         row.fields["Cc3"] = "";
      }
      row.fields["AccountCredit"] = "";
      row.fields["Amount"] = csvRow.amount;
      row.fields["VatCode"] = "";
      row.fields["DocLink"] = csvRow.docLink;
   } else if (csvRow.rowKind === "item") {
      row.fields["AccountDebit"] = "";
      row.fields["AccountCredit"] = "[CA]";
      row.fields["Cc3"] = "";
      row.fields["VatCode"] = csvRow.vatCode;
      row.fields["VatAmountType"] = csvRow.vatAmountType;
      row.fields["Amount"] = csvRow.amount;
      row.fields["DocLink"] = "";
   } else if (csvRow.rowKind === "rounding") {
      row.fields["AccountDebit"] = "";
      row.fields["AccountCredit"] = "[CA]";
      row.fields["Cc3"] = "";
      row.fields["VatCode"] = "";
      // No VatAmountType field at all here (not even empty) - matches the
      // pre-CSV-refactor rounding row exactly, which never set it.
      // Uses the raw, never-forced-positive value: unlike the
      // transactions.simple import, documentChange rows are not grossed
      // up by VAT on import, so the original sign must be kept as-is.
      // Falls back to Amount for CSVs exported before RoundingRawAmount
      // existed.
      row.fields["Amount"] = csvRow.roundingRawAmount || csvRow.amount;
      row.fields["DocLink"] = "";
   } else if (csvRow.rowKind === "discount") {
      row.fields["AccountDebit"] = "[CA]";
      // Matches the pre-CSV-refactor behavior exactly, "possible bug"
      // included: when customerIsCc3 is set, the discount row's Cc3 was
      // (and still is) filled with the customer value too, same as the
      // header row - even though a discount row has nothing to do with
      // the customer account. Left as-is here for strict result parity;
      // fix deliberately in a separate change if/when wanted.
      if (customerIsCc3) {
         row.fields["AccountCredit"] = "";
         row.fields["Cc3"] = insertCustomer ? invoiceCustomerNumber : "[A]";
      } else {
         row.fields["AccountCredit"] = "";
         row.fields["Cc3"] = "";
      }
      row.fields["Amount"] = absAmountString(csvRow.amount);
      row.fields["VatCode"] = csvRow.vatCode;
      row.fields["VatAmountType"] = csvRow.vatAmountType;
      row.fields["DocLink"] = "";
   } else {
      return null;
   }

   return row;
}

/**
 * Builds the full flat array of documentChange rows from the CSV invoice
 * groups, applying customerIsCc3/insertCustomer to every header row.
 */
function buildTransactionRowsFromCsv(invoiceGroups, params) {
   var customerIsCc3 = params.customerIsCc3;
   var insertCustomer = params.insertCustomer;

   var rows = [];

   for (var g = 0; g < invoiceGroups.length; g++) {
      var csvRows = invoiceGroups[g];

      // CustomerNumber is only populated on the CSV's header row (see
      // ch.banana.uni.export.invoices.js), but the discount row also
      // needs it when customerIsCc3 is set - fetch it once per invoice.
      var invoiceCustomerNumber = "";
      for (var k = 0; k < csvRows.length; k++) {
         if (csvRows[k].rowKind === "header") {
            invoiceCustomerNumber = csvRows[k].customerNumber;
            break;
         }
      }

      for (var i = 0; i < csvRows.length; i++) {
         var row = buildDocumentChangeRowFromCsvRow(csvRows[i], customerIsCc3, insertCustomer, invoiceCustomerNumber);
         if (row)
            rows.push(row);
      }
   }

   return rows;
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
 * Initializes the user parameters with their default values. Only
 * customerIsCc3/insertCustomer remain here: the period, VAT-grouping and
 * doc-link choices used to live here too, but they are no longer this
 * extension's concern now that it reads an already-built CSV instead of
 * computing everything itself.
 */
function initUserParam() {
   var userParam = {};
   userParam.version = '1.0';
   userParam.customerIsCc3 = false;
   userParam.insertCustomer = false;
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
 * Converts the user parameters into the format required by
 * openPropertyEditor, with name, type, current value, default value and
 * readValue function for each user-configurable parameter.
 */
function convertParam(userParam) {

   var texts = loadTexts(Banana.document);

   var convertedParam = {};
   convertedParam.version = '1.0';
   convertedParam.data = [];

   var currentParam = {};
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

   return convertedParam;
}

/**
 * Displays the settings panel (customerIsCc3, insertCustomer) via
 * openPropertyEditor. Updates the userParam object with what the user
 * chose. Returns false if the user cancels, true otherwise (including
 * when openPropertyEditor isn't available - keeps working with whatever
 * was already in userParam).
 */
function showSettingsDialog(userParam) {

   var texts = loadTexts(Banana.document);

   if (typeof Banana.Ui.openPropertyEditor === 'undefined')
      return true;

   var dialogTitle = texts.settingsTitle;
   var convertedParam = convertParam(userParam);
   var pageAnchor = 'dlgSettings';
   if (!Banana.Ui.openPropertyEditor(dialogTitle, convertedParam, pageAnchor))
      return false;

   for (var i = 0; i < convertedParam.data.length; i++) {
      convertedParam.data[i].readValue();
   }

   return true;
}

/**
 * Settings entry point recognized by Banana Accounting itself: called
 * automatically when the user clicks the "Settings" button in
 * Extensions > Manage Extensions > (select this extension). This is now
 * just an alternate way to change customerIsCc3/insertCustomer without
 * running a full import - exec() itself already shows the same checkbox
 * panel every time it runs (see showSettingsDialog()).
 * Returns null if the user cancels, or the JSON-stringified saved
 * settings otherwise.
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
 * Loads localized texts based on the language of the Banana document.
 * Supports Italian (it), German (de), French (fr) and English (en, default).
 */
function loadTexts(banDoc) {
   // get language
   var lang = "en";
   if (banDoc && banDoc.locale) {
      lang = banDoc.locale;
   }
   if (lang && lang.length > 2) {
      lang = lang.substr(0, 2);
   }

   // set texts
   var texts = {};

   if (lang === "de") {
      texts.selectCsvSource = "CSV-Datei auswählen (von 'Export invoices to CSV' erzeugt)";
      texts.csvFileType = "CSV-Datei (*.csv);;Alle Dateien (*)";
      texts.info = "Info";
      texts.noFileSelected = "Keine Datei ausgewählt";
      texts.impossibleOpenFile = "Datei kann nicht geöffnet oder gelesen werden";
      texts.missingRequiredColumns = "Pflichtspalte(n) in der CSV-Datei fehlen (Date, DocInvoice und RowKind sind obligatorisch).";
      texts.errorGeneratingDataFromSourceFile = "Fehler beim Verarbeiten der CSV-Datei. Bitte überprüfen Sie die Fehlermeldungen.";
      texts.customerIsCc3 = "Das Kundenkonto ist ein Kostenstelle CC3";
      texts.insertCustomer = "Kundenkonto einfügen";
      texts.settingsTitle = "Einstellungen Rechnungsimport (documentChange)";
   }
   else if (lang === "fr") {
      texts.selectCsvSource = "Sélectionner le fichier CSV (généré par 'Export invoices to CSV')";
      texts.csvFileType = "Fichier CSV (*.csv);;Tous les fichiers (*)";
      texts.info = "Info";
      texts.noFileSelected = "Aucun fichier sélectionné";
      texts.impossibleOpenFile = "Impossible d'ouvrir ou de lire le fichier";
      texts.missingRequiredColumns = "Colonne(s) obligatoire(s) manquante(s) dans le fichier CSV (Date, DocInvoice et RowKind sont obligatoires).";
      texts.errorGeneratingDataFromSourceFile = "Erreur lors du traitement du fichier CSV. Vérifiez les messages d'erreur.";
      texts.customerIsCc3 = "Le compte client est un centre de coût CC3";
      texts.insertCustomer = "Insérer le compte client";
      texts.settingsTitle = "Paramètres d'import des factures (documentChange)";
   }
   else if (lang === "it") {
      texts.selectCsvSource = "Seleziona il file CSV (generato da 'Export invoices to CSV')";
      texts.csvFileType = "File CSV (*.csv);;Tutti i file (*)";
      texts.info = "Info";
      texts.noFileSelected = "Nessun file selezionato";
      texts.impossibleOpenFile = "Impossibile aprire o leggere il file";
      texts.missingRequiredColumns = "Colonna/e obbligatoria/e mancante/i nel file CSV (Date, DocInvoice e RowKind sono obbligatorie).";
      texts.errorGeneratingDataFromSourceFile = "Errore durante l'elaborazione del file CSV. Verificare i messaggi di errore.";
      texts.customerIsCc3 = "Il conto cliente è un centro di costo CC3";
      texts.insertCustomer = "Inserisci il conto cliente";
      texts.settingsTitle = "Impostazioni importazione fatture (documentChange)";
   }
   else { // lang === "en"
      texts.selectCsvSource = "Select the CSV file (generated by 'Export invoices to CSV')";
      texts.csvFileType = "CSV file (*.csv);;All files (*)";
      texts.info = "Info";
      texts.noFileSelected = "No file selected";
      texts.impossibleOpenFile = "Unable to open or read the file";
      texts.missingRequiredColumns = "Required column(s) missing in the CSV file (Date, DocInvoice and RowKind are mandatory).";
      texts.errorGeneratingDataFromSourceFile = "Error processing the CSV file. Please check the error messages.";
      texts.customerIsCc3 = "The customer account is a cost center CC3";
      texts.insertCustomer = "Insert customer account";
      texts.settingsTitle = "Invoice import settings (documentChange)";
   }

   return texts;
}

