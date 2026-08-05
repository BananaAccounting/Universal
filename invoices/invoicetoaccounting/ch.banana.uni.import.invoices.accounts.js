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
// @id = ch.banana.uni.import.invoices.accounts
// @api = 1.0
// @pubdate = 2026-07-24
// @publisher = Banana.ch SA
// @description = [DEV] Import customer accounts from CSV
// @description.en = [DEV] Import customer accounts from CSV
// @description.it = [DEV] Importa conti clienti da CSV
// @description.fr = [DEV] Importer les comptes clients depuis un fichier CSV
// @description.de = [DEV] Kundenkonten aus CSV importieren
// @task = import.accounts
// @doctype = 100.*;110.*
// @docproperties =
// @inputdatasource = openfiledialog
// @inputfilefilter = CSV files (*.csv);;All files (*.*)
// @inputencoding = utf-8
// @timeout = -1

/**
 * Import extension entry point.
 * Receives the raw content of the CSV file exported by
 * ch.banana.uni.export.invoices.js (the same file used by
 * ch.banana.uni.import.invoices.transactions.js and
 * ch.banana.uni.import.invoices.documentchange.js), extracts every unique
 * customer found on the CSV's header rows (RowKind = "header" - the only
 * rows carrying customer data, one per invoice, so the same customer can
 * appear several times if they have several invoices - deduplicated here
 * by CustomerNumber), and returns a documentChange JSON object that adds
 * one row per unique customer to the Accounts table of the currently
 * open document (columns: Account, Description, FirstName, FamilyName,
 * OrganisationName, Street, PostalCode, Locality, CountryCode,
 * LanguageCode, Gr - these are the real nameXml of the Accounts table
 * columns, shared by double-entry and Income & Expense accounting alike).
 * @task = import.file (rather than import.accounts) specifically so a
 * documentChange can be returned instead of being limited to plain TSV
 * rows - the duplicate-account handling below needs to inspect
 * Banana.document.table("Accounts") before deciding what to write, which
 * a pure "convert text to TSV" import can't do as naturally.
 *
 * Before building the output, shows a settings panel (see
 * showSettingsDialog()) asking:
 *  - whether each customer becomes a normal Account or a Cc3 cost center
 *    (the Account column value gets a ";" prefix in the latter case,
 *    Banana's own convention for Cc3-type accounts)
 *  - which existing Group (Gr column) the new accounts should belong to
 *    (must already exist in the Accounts table - this extension does not
 *    create groups, only warns if the typed group can't be found)
 *
 * If an account with the same number already exists in the currently
 * open document's Accounts table, the row is still added (never
 * skipped), but with "_TOCHECK" (plus a counter if needed) appended to
 * the account number, and a message is logged via
 * Banana.application.addMessage - so nothing is silently lost, but
 * nothing silently overwrites an existing account either; the person
 * running the import is expected to check and fix those manually
 * afterwards.
 */
function exec(inText) {

   if (!inText || !inText.length)
      return "@Cancel";

   var texts = loadTexts(Banana.document);

   // Step 1: show the settings panel (Account vs Cc3, target Group)
   var params = loadSettings();
   if (!showSettingsDialog(params))
      return "@Cancel";
   saveSettings(params);

   // Step 2: parse the CSV and collect unique customers from header rows
   var separator = findSeparator(inText);
   var rows = Banana.Converter.csvToArray(inText, separator, '"');
   if (!rows || rows.length < 2)
      return "@Cancel";

   var header = rows[0];
   var idx = mapHeaderIndex(header);

   if (idx.RowKind < 0 || idx.CustomerNumber < 0) {
      Banana.application.addMessage(texts.missingRequiredColumns);
      return "@Cancel";
   }

   var customersByNumber = {};
   var customerOrder = [];

   for (var i = 1; i < rows.length; i++) {
      var r = rows[i];
      if (!r || r.length === 0)
         continue;
      if (getValue(r, idx.RowKind) !== "header")
         continue;

      var customerNumber = getValue(r, idx.CustomerNumber);
      if (!customerNumber || customersByNumber[customerNumber])
         continue;

      customersByNumber[customerNumber] = {
         customerNumber: customerNumber,
         businessName: getValue(r, idx.CustomerOrganisationName),
         firstName: getValue(r, idx.CustomerFirstName),
         lastName: getValue(r, idx.CustomerLastName),
         address: getValue(r, idx.CustomerAddress),
         buildingNumber: getValue(r, idx.CustomerBuildingNumber),
         postalCode: getValue(r, idx.CustomerPostalCode),
         city: getValue(r, idx.CustomerCity),
         countryCode: getValue(r, idx.CustomerCountryCode),
         language: getValue(r, idx.CustomerLanguage)
      };
      customerOrder.push(customerNumber);
   }

   if (customerOrder.length === 0) {
      Banana.application.addMessage(texts.noCustomersFound);
      return "@Cancel";
   }

   // Step 3: find the group's totalization row, to insert new accounts
   // right before it (Banana convention: accounts belonging to a group
   // come before that group's total row). Warn (but proceed, appending
   // at the end instead) if the typed Group can't be found.
   var groupRowNr = params.group ? findGroupRowNr(Banana.document, params.group) : null;
   if (params.group && groupRowNr === null) {
      Banana.application.addMessage(texts.groupNotFound + " \"" + params.group + "\"");
   }

   // Step 4: collect existing account numbers, to detect duplicates
   var existingAccounts = getExistingAccountNumbers(Banana.document);

   // Step 5: build one documentChange "add" row per unique customer
   var accountRows = [];

   // Fixed-width, zero-padded fractional suffixes (e.g. ".01", ".02", ...
   // instead of ".1", ".2", ..., ".10") so the sequence values compare
   // correctly as decimal numbers regardless of how many rows are being
   // inserted - "12.10" and "12.1" are the SAME decimal number, which
   // would silently collide two rows onto one position if not padded.
   var seqPadWidth = Math.max(2, ("" + customerOrder.length).length);

   for (var c = 0; c < customerOrder.length; c++) {
      var customer = customersByNumber[customerOrder[c]];

      var accountNumber = params.accountType === "Cc3" ? (";" + customer.customerNumber) : customer.customerNumber;

      if (existingAccounts[accountNumber]) {
         var newAccountNumber = makeUniqueAccountNumber(accountNumber, existingAccounts);
         Banana.application.addMessage(texts.accountAlreadyExists + " \"" + accountNumber + "\" -> \"" + newAccountNumber + "\"");
         accountNumber = newAccountNumber;
      }
      existingAccounts[accountNumber] = true;

      var description = customer.businessName || joinName(customer.firstName, customer.lastName) || customer.customerNumber;
      var street = joinStreetAndNumber(customer.address, customer.buildingNumber);

      var row = {};
      row.operation = {};
      row.operation.name = "add";
      if (groupRowNr !== null) {
         var seqFraction = "" + (c + 1);
         while (seqFraction.length < seqPadWidth)
            seqFraction = "0" + seqFraction;
         row.operation.sequence = (groupRowNr - 1) + "." + seqFraction;
      }
      row.fields = {};
      row.fields["Account"] = accountNumber;
      row.fields["Description"] = tabSafe(description);
      row.fields["FirstName"] = tabSafe(customer.firstName);
      row.fields["FamilyName"] = tabSafe(customer.lastName);
      row.fields["OrganisationName"] = tabSafe(customer.businessName);
      row.fields["Street"] = tabSafe(street);
      row.fields["PostalCode"] = tabSafe(customer.postalCode);
      row.fields["Locality"] = tabSafe(customer.city);
      row.fields["CountryCode"] = tabSafe(customer.countryCode);
      row.fields["LanguageCode"] = tabSafe(customer.language);
      row.fields["Gr"] = tabSafe(params.group);

      accountRows.push(row);
   }

   var dataUnitAccounts = {};
   dataUnitAccounts.nameXml = "Accounts";
   dataUnitAccounts.data = {};
   dataUnitAccounts.data.rowLists = [];
   dataUnitAccounts.data.rowLists.push({ "rows": accountRows });

   var jsonDoc = initDocument();
   jsonDoc.document.dataUnits.push(dataUnitAccounts);

   var documentChange = {
      "format": "documentChange",
      "error": "",
      "data": []
   };
   documentChange["data"].push(jsonDoc);

   return documentChange;
}

/**
 * Initializes the JSON document to be returned to Banana with the
 * creator metadata (date, time, script name, version) - same pattern
 * used in ch.banana.uni.import.invoices.documentchange.js.
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

// ---------------------------------------------------------------------
// CSV parsing helpers (same pattern as the other CSV-consuming
// extensions in this project)
// ---------------------------------------------------------------------

/**
 * Automatically detects the CSV separator (tab, semicolon or comma) by
 * analyzing the first line of the text.
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
 * Maps the CSV header names this extension needs to their column
 * indices. Fields not found have value -1.
 */
function mapHeaderIndex(headerRow) {
   var idx = {
      RowKind: -1,
      CustomerNumber: -1,
      CustomerOrganisationName: -1,
      CustomerFirstName: -1,
      CustomerLastName: -1,
      CustomerAddress: -1,
      CustomerBuildingNumber: -1,
      CustomerPostalCode: -1,
      CustomerCity: -1,
      CustomerCountryCode: -1,
      CustomerLanguage: -1
   };

   for (var i = 0; i < headerRow.length; i++) {
      var h = normalizeHeader(headerRow[i]);

      if (h === "rowkind")
         idx.RowKind = i;
      else if (h === "customernumber")
         idx.CustomerNumber = i;
      else if (h === "customerorganisationname")
         idx.CustomerOrganisationName = i;
      else if (h === "customerfirstname")
         idx.CustomerFirstName = i;
      else if (h === "customerlastname")
         idx.CustomerLastName = i;
      else if (h === "customeraddress")
         idx.CustomerAddress = i;
      else if (h === "customerbuildingnumber")
         idx.CustomerBuildingNumber = i;
      else if (h === "customerpostalcode")
         idx.CustomerPostalCode = i;
      else if (h === "customercity")
         idx.CustomerCity = i;
      else if (h === "customercountrycode")
         idx.CustomerCountryCode = i;
      else if (h === "customerlanguage")
         idx.CustomerLanguage = i;
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
 * Removes tabs/newlines from a value, since the output is tab-separated.
 */
function tabSafe(value) {
   if (!value)
      return "";
   return ("" + value).replace(/[\t\r\n]+/g, " ").trim();
}

// ---------------------------------------------------------------------
// Domain helpers
// ---------------------------------------------------------------------

/**
 * Joins first and last name with a single space, omitting either side if
 * empty (avoids a leading/trailing/double space).
 */
function joinName(firstName, lastName) {
   var parts = [];
   if (firstName)
      parts.push(firstName);
   if (lastName)
      parts.push(lastName);
   return parts.join(" ");
}

/**
 * Joins the street and building number into a single value for the
 * Street column, since the Accounts table has no separate building
 * number column.
 */
function joinStreetAndNumber(street, buildingNumber) {
   if (!street)
      return buildingNumber || "";
   if (!buildingNumber)
      return street;
   return street + " " + buildingNumber;
}

/**
 * Returns a set (object used as a hash set) of every non-empty value
 * currently in the Account column of the open document's Accounts
 * table, so new customer accounts can be checked for collisions.
 */
function getExistingAccountNumbers(doc) {
   var existing = {};
   if (!doc || typeof doc.table !== "function")
      return existing;

   var accountsTable = doc.table("Accounts");
   if (!accountsTable)
      return existing;

   for (var i = 0; i < accountsTable.rowCount; i++) {
      var row = accountsTable.row(i);
      if (!row || row.isEmpty)
         continue;
      var accountValue = row.value("Account");
      if (accountValue)
         existing[accountValue] = true;
   }

   return existing;
}

/**
 * Returns the rowNr of the row whose Group column matches groupValue in
 * the open document's Accounts table (i.e. the totalization row that new
 * accounts should be inserted before), or null if no such row exists.
 * Used both for the soft "group not found" warning and to position new
 * account rows via documentChange's row.operation.sequence - this
 * extension does not attempt to create missing groups itself, it only
 * warns and falls back to appending at the end of the table.
 */
function findGroupRowNr(doc, groupValue) {
   if (!doc || typeof doc.table !== "function")
      return null;

   var accountsTable = doc.table("Accounts");
   if (!accountsTable)
      return null;

   for (var i = 0; i < accountsTable.rowCount; i++) {
      var row = accountsTable.row(i);
      if (!row || row.isEmpty)
         continue;
      if (row.value("Group") === groupValue)
         return row.rowNr;
   }

   return null;
}

/**
 * Builds an account number guaranteed not to collide with any value in
 * existingAccounts, by appending "_TOCHECK" (and a numeric counter if
 * that alone still collides) to baseAccountNumber. The "_TOCHECK" marker
 * (not localized, same convention as the "[A]"/"[CA]" placeholders used
 * elsewhere in this project) makes it obvious the account number is
 * temporary and needs a manual look before being renamed/merged into the
 * real, already-existing account.
 */
function makeUniqueAccountNumber(baseAccountNumber, existingAccounts) {
   var candidate = baseAccountNumber + "_TOCHECK";
   var suffix = 2;
   while (existingAccounts[candidate]) {
      candidate = baseAccountNumber + "_TOCHECK" + suffix;
      suffix++;
   }
   return candidate;
}

// ---------------------------------------------------------------------
// Settings (Account vs Cc3, target Group)
// ---------------------------------------------------------------------

/**
 * Initializes the user parameters with their default values.
 */
function initUserParam() {
   var userParam = {};
   userParam.version = '1.0';
   userParam.accountType = "Account";
   userParam.group = '';
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
         if (typeof saved.accountType !== "undefined")
            userParam.accountType = saved.accountType;
         if (typeof saved.group !== "undefined")
            userParam.group = saved.group;
      } catch (e) {}
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
 * openPropertyEditor. accountType is a real combobox (type: 'combobox',
 * with an 'items' array) letting the user pick exactly one of "Account"
 * or "Cc3" - the item labels are intentionally left untranslated
 * (same convention as the "[A]"/"[CA]" placeholders used elsewhere in
 * this project), so the saved value stays meaningful and comparable
 * (params.accountType === "Cc3") no matter which language the document
 * is in when the setting is read back later.
 */
function convertParam(userParam) {

   var texts = loadTexts(Banana.document);

   var convertedParam = {};
   convertedParam.version = '1.0';
   convertedParam.data = [];

   var currentParam = {};
   currentParam.name = 'accountType';
   currentParam.parentObject = '';
   currentParam.title = texts.accountType;
   currentParam.type = 'combobox';
   // Displayed labels are translated (texts.accountTypeAccountLabel/
   // accountTypeCc3Label), but the value saved in userParam.accountType
   // stays the fixed, untranslated code ("Account"/"Cc3") - so
   // params.accountType === "Cc3" keeps working the same regardless of
   // which language the document was in when the setting was last saved.
   var accountTypeCodes = ["Account", "Cc3"];
   var accountTypeLabels = [texts.accountTypeAccountLabel, texts.accountTypeCc3Label];
   currentParam.items = accountTypeLabels;
   var currentCodeIndex = accountTypeCodes.indexOf(userParam.accountType);
   if (currentCodeIndex < 0)
      currentCodeIndex = 0;
   currentParam.value = accountTypeLabels[currentCodeIndex];
   currentParam.defaultvalue = accountTypeLabels[0];
   currentParam.readValue = function () {
      var selectedIndex = accountTypeLabels.indexOf(this.value);
      userParam.accountType = accountTypeCodes[selectedIndex < 0 ? 0 : selectedIndex];
   }
   convertedParam.data.push(currentParam);

   currentParam = {};
   currentParam.name = 'group';
   currentParam.parentObject = '';
   currentParam.title = texts.group;
   currentParam.type = 'string';
   currentParam.value = userParam.group ? userParam.group : '';
   currentParam.defaultvalue = '';
   currentParam.readValue = function () {
      userParam.group = this.value;
   }
   convertedParam.data.push(currentParam);

   return convertedParam;
}

/**
 * Displays the settings panel (accountType, group) via
 * openPropertyEditor, shown every time exec() runs (not just via the
 * Manage Extensions > Settings button - see settingsDialog() below).
 * Updates userParam with what the user chose. Returns false if the user
 * cancels, true otherwise (including when openPropertyEditor isn't
 * available - keeps working with whatever was already in userParam).
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
 * Extensions > Manage Extensions > (select this extension). Alternate
 * way to change accountType/group without running a full import -
 * exec() itself already shows the same panel every time it runs (see
 * showSettingsDialog()).
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

// ---------------------------------------------------------------------
// Localized texts
// ---------------------------------------------------------------------

/**
 * Loads localized texts based on the language of the Banana document.
 * Supports Italian (it), German (de), French (fr) and English (en, default).
 */
function loadTexts(banDoc) {
   var lang = "en";
   if (banDoc && banDoc.locale) {
      lang = banDoc.locale;
   }
   if (lang && lang.length > 2) {
      lang = lang.substr(0, 2);
   }

   var texts = {};

   if (lang === "de") {
      texts.missingRequiredColumns = "Pflichtspalte(n) in der CSV-Datei fehlen (RowKind und CustomerNumber sind obligatorisch).";
      texts.noCustomersFound = "In der CSV-Datei wurden keine Kunden gefunden.";
      texts.accountAlreadyExists = "Konto existiert bereits, mit neuer Nummer hinzugefügt:";
      texts.groupNotFound = "Gruppe nicht in der Kontentabelle gefunden:";
      texts.accountType = "Kontotyp für Kunden";
      texts.accountTypeAccountLabel = "Konto";
      texts.accountTypeCc3Label = "Kostenstelle (Cc3)";
      texts.group = "Kundengruppe (Kontentabelle)";
      texts.settingsTitle = "Einstellungen Import Kundenkonten";
   }
   else if (lang === "fr") {
      texts.missingRequiredColumns = "Colonne(s) obligatoire(s) manquante(s) dans le fichier CSV (RowKind et CustomerNumber sont obligatoires).";
      texts.noCustomersFound = "Aucun client trouvé dans le fichier CSV.";
      texts.accountAlreadyExists = "Le compte existe déjà, ajouté avec un nouveau numéro :";
      texts.groupNotFound = "Groupe introuvable dans le tableau des comptes :";
      texts.accountType = "Type de compte pour les clients";
      texts.accountTypeAccountLabel = "Compte";
      texts.accountTypeCc3Label = "Centre de coût (Cc3)";
      texts.group = "Groupe clients (tableau des Comptes)";
      texts.settingsTitle = "Paramètres d'import des comptes clients";
   }
   else if (lang === "it") {
      texts.missingRequiredColumns = "Colonna/e obbligatoria/e mancante/i nel file CSV (RowKind e CustomerNumber sono obbligatorie).";
      texts.noCustomersFound = "Nessun cliente trovato nel file CSV.";
      texts.accountAlreadyExists = "Il conto esiste già, aggiunto con un nuovo numero:";
      texts.groupNotFound = "Gruppo non trovato nella tabella Conti:";
      texts.accountType = "Tipo di conto per i clienti";
      texts.accountTypeAccountLabel = "Conto";
      texts.accountTypeCc3Label = "Centro di costo (Cc3)";
      texts.group = "Gruppo clienti (tabella Conti)";
      texts.settingsTitle = "Impostazioni importazione conti clienti";
   }
   else { // lang === "en"
      texts.missingRequiredColumns = "Required column(s) missing in the CSV file (RowKind and CustomerNumber are mandatory).";
      texts.noCustomersFound = "No customers found in the CSV file.";
      texts.accountAlreadyExists = "Account already exists, added with a new number:";
      texts.groupNotFound = "Group not found in the Accounts table:";
      texts.accountType = "Account type for customers";
      texts.accountTypeAccountLabel = "Account";
      texts.accountTypeCc3Label = "Cost center (Cc3)";
      texts.group = "Customer group (Accounts table)";
      texts.settingsTitle = "Import customer accounts settings";
   }

   return texts;
}
