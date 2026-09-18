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

// @id = ch.banana.uni.import.wordline
// @api = 1.0
// @pubdate = 2026-09-18
// @publisher = Banana.ch SA
// @description = Worldline - Import movements .csv (Banana+ Advanced)
// @description.it = Worldline - Importa movimenti .csv (Banana+ Advanced)
// @description.en = Worldline - Import movements .csv (Banana+ Advanced)
// @description.de = Worldline - Bewegungen importieren .csv (Banana+ Advanced)
// @description.fr = Worldline - Importer mouvements .csv (Banana+ Advanced)
// @doctype = *
// @docproperties =
// @task = import.transactions
// @outputformat = tablewithheaders
// @inputdatasource = openfiledialog
// @inputencoding = utf-8
// @inputfilefilter = Text files (*.txt *.csv);;All files (*.*)
// @inputfilefilter.de = Text (*.txt *.csv);;Alle Dateien (*.*)
// @inputfilefilter.fr = Texte (*.txt *.csv);;Tous (*.*)
// @inputfilefilter.it = Testo (*.txt *.csv);;Tutti i files (*.*)
// @timeout = -1
// @includejs = import.utilities.js


// Dialog parameter names
const BANK_ACCOUNT = "bankaccount"
const WORDLINE_IN = "wordlinein"
const FEE_ACCOUNT = "feeaccount"

// Accounting types
const DOUBLE_ENTRY_TYPE = "100";
const INCOME_EXPENSES_TYPE = "110";

// Tables
const ACCOUNTS_TABLE = "Accounts"
const CATEGORIES_TABLE = "Categories"

// Columns
const CATEGORY_COLUMN = "Category"
const ACCOUNT_COLUMN = "Account"

/**
 * Parse the data and return the data to be imported as a tab separated file.
 */
function exec(inData, isTest) {

   var importUtilities = new ImportUtilities(Banana.document);
   var banDoc = Banana.document;

   if (!inData)
      return "";

   if (isTest !== true && !importUtilities.verifyBananaAdvancedVersion())
      return "";

   var userParam = settingsDialog(banDoc);
   if (!userParam) {
      return "";
   }

   var transactions = processWordlineTransactions(inData, userParam, banDoc);
   if (transactions === null) {
      importUtilities.getUnknownFormatError();
      return "";
   }

   return transactions;
}

/**
 * Parses the csv content and, if the format is recognised, returns the converted
 * transactions ready to be imported. Returns null when the file format is not recognised
 * (an empty string is instead returned when the format is recognised but the accounting
 * type of the open file is not supported).
 */
function processWordlineTransactions(inData, userParam, banDoc) {
   var convertionParam = defineConversionParam(inData);
   var csvData = Banana.Converter.csvToArray(inData, convertionParam.separator, convertionParam.textDelim);

   var wordlineFormat1 = new WordlineFormat1(banDoc, userParam);
   var transactionsData = wordlineFormat1.getFormattedData(csvData, convertionParam);

   if (wordlineFormat1.match(transactionsData)) {
      return wordlineFormat1.processTransactions(transactionsData);
   }

   return null;
}

/**
 * Wordline Format 1
 * Data example (";" separated, header on the first line):
 * Transaktionsdatum;Transaktionsuhrzeit;Partner ID;Partner Name;Vertragsnummer;Vertrag;PLZ Ort;Status;Transaktionstyp;
 * Ihre Referenz;Acquirer Reference;Kartennummer;Brand;Karten Kategorie;DCC;Eingelieferte Währung;Transaktions- betrag;
 * Wechselkurs;Händler Währung;Bruttobetrag;Clearing Region;Gebühren;DCC Payback;Netto Betrag;Terminal ID
 * 17.07.2026;13:09:08;412393;Partners & Partners GmbH;12345678;Secure E-Commerce;12345 Basel;Ausbezahlt;First Presentment(Retail);
 * 11-2222 XXX HLP;000000000111111111;1233;Visa;Commercial;nein;CHF;1035.00;1;CHF;1035.00;International;-44.55;0;990.45;11111111
 *
 * Specifics (see develop_specifics.md):
 * "Ihre Referenz" ("Your reference") is the client's own internal voucher number, used to
 * uniquely match a payment to the correct customer.
 * "Händler Währung" ("Merchant currency") tells in which currency Worldline settles the
 * transaction (CHF, EUR or GBP). As with the SumUp import extension, for now we book every
 * transaction through a single bank/income account pair regardless of currency; the merchant
 * currency is only kept in the Notes column for reference.
 * "Bruttobetrag" (Gross amount), "Gebühren" (Fee, exported with a negative sign) and
 * "Netto Betrag" (Net amount) drive the three booking lines below.
 *
 * For every transaction we create three booking lines so that the Worldline income account
 * (as with the SumUp income account) always nets back to zero:
 * 1) Debit bank account / Credit income account, for the net amount (money credited to the bank).
 * 2) Debit income account / Credit customer account, for the gross amount. The customer account
 *    is not known from the file, so it is left blank: the accountant assigns it using
 *    "Ihre Referenz" (kept in the ExternalReference column) to identify the customer.
 * 3) Debit fee account / Credit income account, for the fee (booked as a positive cost).
 */
var WordlineFormat1 = class WordlineFormat1 extends ImportUtilities {

   constructor(banDocument, userParam) {
      super(banDocument, userParam);

      this.banDoc = banDocument;
      this.params = userParam;
      this.texts = getTexts(banDocument);
   }

   getFormattedData(csvData, convertionParam) {
      var columns = getHeaderData(csvData, convertionParam); //array
      var rows = getRowData(csvData, convertionParam); //array of array
      var form = [];

      var convertedColumns = this.convertHeaderDe(columns);
      if (convertedColumns.length === 0) {
         return [];
      }

      //Load the form with data taken from the array. Create objects
      loadForm(form, convertedColumns, rows);

      return form;
   }

   convertHeaderDe(columns) {
      var convertedColumns = [];

      for (var i = 0; i < columns.length; i++) {
         switch (columns[i]) {
            case "Transaktionsdatum":
               convertedColumns[i] = "Transaction Date";
               break;
            case "Transaktionsuhrzeit":
               convertedColumns[i] = "Transaction Time";
               break;
            case "Partner ID":
               convertedColumns[i] = "Partner ID";
               break;
            case "Partner Name":
               convertedColumns[i] = "Partner Name";
               break;
            case "Vertragsnummer":
               convertedColumns[i] = "Contract Number";
               break;
            case "Vertrag":
               convertedColumns[i] = "Contract";
               break;
            case "PLZ Ort":
               convertedColumns[i] = "Postal Code City";
               break;
            case "Status":
               convertedColumns[i] = "Status";
               break;
            case "Transaktionstyp":
               convertedColumns[i] = "Transaction Type";
               break;
            case "Ihre Referenz":
               convertedColumns[i] = "Your Reference";
               break;
            case "Acquirer Reference":
               convertedColumns[i] = "Acquirer Reference";
               break;
            case "Kartennummer":
               convertedColumns[i] = "Card Number";
               break;
            case "Brand":
               convertedColumns[i] = "Brand";
               break;
            case "Karten Kategorie":
               convertedColumns[i] = "Card Category";
               break;
            case "DCC":
               convertedColumns[i] = "DCC";
               break;
            case "Eingelieferte Währung":
               convertedColumns[i] = "Delivered Currency";
               break;
            case "Transaktions- betrag":
            case "Transaktionsbetrag":
               convertedColumns[i] = "Transaction Amount";
               break;
            case "Wechselkurs":
               convertedColumns[i] = "Exchange Rate";
               break;
            case "Händler Währung":
               convertedColumns[i] = "Merchant Currency";
               break;
            case "Bruttobetrag":
               convertedColumns[i] = "Gross Amount";
               break;
            case "Clearing Region":
               convertedColumns[i] = "Clearing Region";
               break;
            case "Gebühren":
               convertedColumns[i] = "Fee";
               break;
            case "DCC Payback":
               convertedColumns[i] = "DCC Payback";
               break;
            case "Netto Betrag":
               convertedColumns[i] = "Net Amount";
               break;
            case "Terminal ID":
               convertedColumns[i] = "Terminal ID";
               break;
            default:
               convertedColumns[i] = columns[i]; // Keep the original header if not recognised
               break;
         }
      }

      if (convertedColumns.indexOf("Transaction Date") < 0
         || convertedColumns.indexOf("Your Reference") < 0
         || convertedColumns.indexOf("Merchant Currency") < 0
         || convertedColumns.indexOf("Gross Amount") < 0
         || convertedColumns.indexOf("Fee") < 0
         || convertedColumns.indexOf("Net Amount") < 0) {
         return [];
      }

      return convertedColumns;
   }

   /** Return true if the transactions match this format */
   match(transactionsData) {
      if (transactionsData.length === 0)
         return false;

      for (var i = 0; i < transactionsData.length; i++) {
         var transaction = transactionsData[i];

         var transactionDate = transaction["Transaction Date"];
         var reference = transaction["Your Reference"];
         var currency = transaction["Merchant Currency"];

         if (transactionDate && transactionDate.match(/^\d{2}\.\d{2}\.\d{4}$/)
            && reference && String(reference).trim() !== ""
            && currency && currency.trim().match(/^[A-Za-z]{3}$/)) {
            return true;
         }
      }

      return false;
   }

   processTransactions(transactionsData) {
      var accoutingType = this.banDoc.info("Base", "FileTypeGroup");
      var headers = [];
      var processedTrans = [];

      if (accoutingType == DOUBLE_ENTRY_TYPE) {
         headers = ["Date", "ExternalReference", "Description", "AccountDebit", "AccountCredit", "Amount", "Notes"];
      } else if (accoutingType == INCOME_EXPENSES_TYPE) {
         headers = ["Date", "ExternalReference", "Description", "Income", "Expenses", "Account", "Category", "Notes"];
      } else {
         Banana.document.addMessage(this.texts.accountingTypeNotSupported, "ID_ERR_WORDLINE_ACCOUNTINGTYPE");
         return "";
      }

      processedTrans = this.mapTransactions(transactionsData, accoutingType);

      return Banana.Converter.objectArrayToCsv(headers, processedTrans, ";");
   }

   mapTransactions(transactionsData, accoutingType) {
      var transactionsMapped = [];

      for (var i = 0; i < transactionsData.length; i++) {
         this.mapTransaction(transactionsData[i], accoutingType, transactionsMapped);
      }

      return transactionsMapped;
   }

   mapTransaction(row, accoutingType, transactionsMapped) {
      if (!row["Your Reference"] || String(row["Your Reference"]).trim() === "") {
         Banana.console.debug("Wordline: missing 'Ihre Referenz', row skipped.");
         return;
      }

      var date = Banana.Converter.toInternalDateFormat(row["Transaction Date"], this.params.dateFormat);
      var reference = String(row["Your Reference"]).trim();
      var currency = row["Merchant Currency"] ? row["Merchant Currency"].trim().toUpperCase() : "";
      var transactionType = row["Transaction Type"] ? row["Transaction Type"].trim() : "";
      var grossNotes = [transactionType, currency].filter(function (value) { return !!value; }).join(" - ");

      var grossAmount = this.toPositiveAmount(row["Gross Amount"]);
      var feeAmount = this.toPositiveAmount(row["Fee"]);
      var netAmount = this.toPositiveAmount(row["Net Amount"]);

      if (accoutingType == DOUBLE_ENTRY_TYPE) {
         this.mapNetPayoutDoubleEntry(date, reference, netAmount, currency, transactionsMapped);
         this.mapGrossPaymentDoubleEntry(date, reference, grossAmount, grossNotes, transactionsMapped);
         this.mapFeeDoubleEntry(date, reference, feeAmount, currency, transactionsMapped);
      } else if (accoutingType == INCOME_EXPENSES_TYPE) {
         this.mapNetPayoutIncomeExpenses(date, reference, netAmount, currency, transactionsMapped);
         this.mapGrossPaymentIncomeExpenses(date, reference, grossAmount, grossNotes, transactionsMapped);
         this.mapFeeIncomeExpenses(date, reference, feeAmount, currency, transactionsMapped);
      }
   }

   /** Converts a source amount to Banana's internal number format, always returning a positive value. */
   toPositiveAmount(value) {
      var converted = Banana.Converter.toInternalNumberFormat(String(value).trim(), ".");
      if (converted.indexOf("-") === 0) {
         converted = converted.substring(1);
      }
      return converted;
   }

   mapNetPayoutDoubleEntry(date, reference, netAmount, notes, transactionsMapped) {
      var trRow = initTrRowObjectStructure_DoubleEntry();
      trRow.Date = date;
      trRow.ExternalReference = reference;
      trRow.Description = this.texts.netPayout;
      trRow.AccountDebit = this.params.bankAccount;
      trRow.AccountCredit = this.params.wordlineIn;
      trRow.Amount = netAmount;
      trRow.Notes = notes;

      transactionsMapped.push(trRow);
   }

   mapGrossPaymentDoubleEntry(date, reference, grossAmount, notes, transactionsMapped) {
      var trRow = initTrRowObjectStructure_DoubleEntry();
      trRow.Date = date;
      trRow.ExternalReference = reference;
      trRow.Description = this.texts.customerPayment;
      trRow.AccountDebit = this.params.wordlineIn;
      trRow.AccountCredit = ""; // Customer account is not known from the file, assigned manually via ExternalReference.
      trRow.Amount = grossAmount;
      trRow.Notes = notes;

      transactionsMapped.push(trRow);
   }

   mapFeeDoubleEntry(date, reference, feeAmount, notes, transactionsMapped) {
      var trRow = initTrRowObjectStructure_DoubleEntry();
      trRow.Date = date;
      trRow.ExternalReference = reference;
      trRow.Description = this.texts.fee;
      trRow.AccountDebit = this.params.feeAccount;
      trRow.AccountCredit = this.params.wordlineIn;
      trRow.Amount = feeAmount;
      trRow.Notes = notes;

      transactionsMapped.push(trRow);
   }

   mapNetPayoutIncomeExpenses(date, reference, netAmount, notes, transactionsMapped) {
      var trRow = initTrRowObjectStructure_IncomeExpenses();
      trRow.Date = date;
      trRow.ExternalReference = reference;
      trRow.Description = this.texts.netPayout;
      trRow.Income = "";
      trRow.Expenses = netAmount;
      trRow.Account = this.params.wordlineIn;
      trRow.Category = this.params.bankAccount;
      trRow.Notes = notes;

      transactionsMapped.push(trRow);
   }

   mapGrossPaymentIncomeExpenses(date, reference, grossAmount, notes, transactionsMapped) {
      var trRow = initTrRowObjectStructure_IncomeExpenses();
      trRow.Date = date;
      trRow.ExternalReference = reference;
      trRow.Description = this.texts.customerPayment;
      trRow.Income = grossAmount;
      trRow.Expenses = "";
      trRow.Account = this.params.wordlineIn;
      trRow.Category = ""; // Customer category is not known from the file, assigned manually via ExternalReference.
      trRow.Notes = notes;

      transactionsMapped.push(trRow);
   }

   mapFeeIncomeExpenses(date, reference, feeAmount, notes, transactionsMapped) {
      var trRow = initTrRowObjectStructure_IncomeExpenses();
      trRow.Date = date;
      trRow.ExternalReference = reference;
      trRow.Description = this.texts.fee;
      trRow.Income = "";
      trRow.Expenses = feeAmount;
      trRow.Account = this.params.wordlineIn;
      trRow.Category = this.params.feeAccount;
      trRow.Notes = notes;

      transactionsMapped.push(trRow);
   }
}

function initTrRowObjectStructure_DoubleEntry() {
   var trRow = {};

   trRow.Date = "";
   trRow.ExternalReference = "";
   trRow.Description = "";
   trRow.AccountDebit = "";
   trRow.AccountCredit = "";
   trRow.Amount = "";
   trRow.Notes = "";

   return trRow;
}

function initTrRowObjectStructure_IncomeExpenses() {
   var trRow = {};

   trRow.Date = "";
   trRow.ExternalReference = "";
   trRow.Description = "";
   trRow.Income = "";
   trRow.Expenses = "";
   trRow.Account = "";
   trRow.Category = "";
   trRow.Notes = "";

   return trRow;
}


function settingsDialog(banDoc) {

   var dialogParam = {};
   var savedDlgParam = Banana.document.getScriptSettings("wordlineImportDlgParams");
   if (savedDlgParam.length > 0) {
      var parsedParam = JSON.parse(savedDlgParam);
      if (parsedParam) {
         dialogParam = parsedParam;
      }
   }

   //Verify Params.
   verifyParam(dialogParam);
   //Settings dialog
   var dialogTitle = 'Settings';
   var pageAnchor = 'wordlineImportDlgParams';
   var convertedParam = {};

   convertedParam = convertParam(banDoc, dialogParam);
   if (!Banana.Ui.openPropertyEditor(dialogTitle, convertedParam, pageAnchor))
      return false;
   for (var i = 0; i < convertedParam.data.length; i++) {
      // Read values to dialogparam (through the readValue function)
      if (typeof (convertedParam.data[i].readValue) == "function")
         convertedParam.data[i].readValue();
   }
   //set the parameters
   var paramToString = JSON.stringify(dialogParam);
   Banana.document.setScriptSettings("wordlineImportDlgParams", paramToString);
   return dialogParam;
}

function initParam() {
   var params = {};

   params.dateFormat = "dd.mm.yyyy";
   params.bankAccount = "1020"; // Bank account
   params.wordlineIn = "1022"; // Worldline income account
   params.feeAccount = "6946"; // Worldline fee (cost) account

   return params;
}

function convertParam(banDoc, userParam) {
   var paramList = {};
   var texts = getTexts(banDoc);
   var defaultParam = initParam();
   paramList.version = '1.0';
   paramList.data = [];

   var param = {};
   param.name = 'dateformat';
   param.title = texts.dateFormat;
   param.type = 'string';
   param.value = userParam.dateFormat ? userParam.dateFormat : '';
   param.defaultvalue = defaultParam.dateFormat;
   param.readValue = function () {
      userParam.dateFormat = this.value;
   }
   paramList.data.push(param);

   var param = {};
   param.name = BANK_ACCOUNT;
   param.title = texts.bankAccount;
   param.type = 'string';
   param.value = userParam.bankAccount ? userParam.bankAccount : '';
   param.defaultvalue = defaultParam.bankAccount;
   param.readValue = function () {
      userParam.bankAccount = this.value;
   }
   paramList.data.push(param);

   var param = {};
   param.name = WORDLINE_IN;
   param.title = texts.wordlineIn;
   param.type = 'string';
   param.value = userParam.wordlineIn ? userParam.wordlineIn : '';
   param.defaultvalue = defaultParam.wordlineIn;
   param.readValue = function () {
      userParam.wordlineIn = this.value;
   }
   paramList.data.push(param);

   var param = {};
   param.name = FEE_ACCOUNT;
   param.title = texts.feeAccount;
   param.type = 'string';
   param.value = userParam.feeAccount ? userParam.feeAccount : '';
   param.defaultvalue = defaultParam.feeAccount;
   param.readValue = function () {
      userParam.feeAccount = this.value;
   }
   paramList.data.push(param);

   return paramList;
}

function verifyParam(dialogParam) {

   var defaultParam = initParam();

   if (!dialogParam.dateFormat) {
      dialogParam.dateFormat = defaultParam.dateFormat;
   }
   if (!dialogParam.bankAccount) {
      dialogParam.bankAccount = defaultParam.bankAccount;
   }
   if (!dialogParam.wordlineIn) {
      dialogParam.wordlineIn = defaultParam.wordlineIn;
   }
   if (!dialogParam.feeAccount) {
      dialogParam.feeAccount = defaultParam.feeAccount;
   }
}

function validateParams(params) {

   var banDoc = Banana.document;

   if (!banDoc)
      return false;

   var texts = getTexts(banDoc);
   for (var i = 1; i < params.data.length; i++) { // We skip the first one as it is the date format.
      if (!params.data[i].value) {
         params.data[i].errorMsg = texts.accountMissing;
         return false;
      } else if (!accountExists(banDoc, params.data[i].value)) {
         params.data[i].errorMsg = texts.accountErrorMsg + ": " + params.data[i].value;
         return false;
      }
   }
   return true;
}

function accountExists(banDoc, account) {
   var accoutingType = banDoc.info("Base", "FileTypeGroup");

   if (banDoc && account) {
      var accountsTable = banDoc.table(ACCOUNTS_TABLE);
      if (!accountsTable)
         return false;
      //check in the chart of accounts.
      for (var i = 0; i < accountsTable.rowCount; i++) {
         var tRow = accountsTable.row(i);
         // Check if the account is present in the chart of accounts.
         if (account == tRow.value(ACCOUNT_COLUMN)) {
            return true;
         }
      }
      //check also in the category table
      if (accoutingType == INCOME_EXPENSES_TYPE) {
         var categoriesTable = banDoc.table(CATEGORIES_TABLE);
         for (var i = 0; i < categoriesTable.rowCount; i++) {
            var tRow = categoriesTable.row(i);
            // Check if the account is present in the chart of accounts.
            if (account == tRow.value(CATEGORY_COLUMN)) {
               return true;
            }
         }
      }
   }
   return false;
}

function getTexts(banDocument) {

   var lang = getLang(banDocument);

   switch (lang) {
      case 'de':
         return getTextsDe();
      case 'it':
         return getTextsIt();
      case 'fr':
         return getTextsFr();
      case 'en':
      default:
         return getTextsEn();
   }
}

function getTextsDe() {
   var texts = {};

   texts.dateFormat = "Datumsformat";
   texts.bankAccount = "Bankkonto";
   texts.wordlineIn = "Worldline-Ertragskonto";
   texts.feeAccount = "Worldline-Gebührenkonto";
   texts.accountMissing = "Fehlendes Konto";
   texts.accountErrorMsg = "Dieses Konto existiert nicht in Ihrem Kontenplan";
   texts.netPayout = "Worldline-Auszahlung";
   texts.customerPayment = "Kundenzahlung";
   texts.fee = "Worldline-Gebühr";
   texts.accountingTypeNotSupported = "Diese Erweiterung unterstützt nur die doppelte Buchhaltung und die Einnahmen/Ausgaben-Buchhaltung.";

   return texts;
}

function getTextsIt() {
   var texts = {};

   texts.dateFormat = "Formato data";
   texts.bankAccount = "Conto bancario";
   texts.wordlineIn = "Conto entrate Worldline";
   texts.feeAccount = "Conto commissioni Worldline";
   texts.accountMissing = "Conto mancante";
   texts.accountErrorMsg = "Questo conto non esiste nel tuo piano dei conti";
   texts.netPayout = "Accredito Worldline";
   texts.customerPayment = "Pagamento cliente";
   texts.fee = "Commissione Worldline";
   texts.accountingTypeNotSupported = "Questa estensione supporta solo la contabilità in partita doppia e la contabilità entrate/uscite.";

   return texts;
}

function getTextsFr() {
   var texts = {};

   texts.dateFormat = "Format de date";
   texts.bankAccount = "Compte bancaire";
   texts.wordlineIn = "Compte des recettes Worldline";
   texts.feeAccount = "Compte de frais Worldline";
   texts.accountMissing = "Compte manquant";
   texts.accountErrorMsg = "Ce compte n'existe pas dans votre plan comptable";
   texts.netPayout = "Virement Worldline";
   texts.customerPayment = "Paiement client";
   texts.fee = "Frais Worldline";
   texts.accountingTypeNotSupported = "Cette extension prend en charge uniquement la comptabilité en partie double et la comptabilité recettes/dépenses.";

   return texts;
}

function getTextsEn() {
   var texts = {};

   texts.dateFormat = "Date format";
   texts.bankAccount = "Bank account";
   texts.wordlineIn = "Worldline income account";
   texts.feeAccount = "Worldline fee account";
   texts.accountMissing = "Missing account";
   texts.accountErrorMsg = "This account does not exists in your chart of accounts";
   texts.netPayout = "Worldline payout";
   texts.customerPayment = "Customer payment";
   texts.fee = "Worldline fee";
   texts.accountingTypeNotSupported = "This extension only supports double-entry and income/expenses accounting.";

   return texts;
}

function getLang(banDocument) {
   var lang = 'en';
   if (banDocument)
      lang = banDocument.locale;
   else if (Banana.application.locale)
      lang = Banana.application.locale;
   if (lang.length > 2)
      lang = lang.substr(0, 2);
   return lang;
}


function defineConversionParam(inData) {

   var inDataArray = Banana.Converter.csvToArray(inData);
   var header = String(inDataArray[0]);
   var convertionParam = {};
   /** SPECIFY THE SEPARATOR AND THE TEXT DELIMITER USED IN THE CSV FILE */
   convertionParam.format = "csv";
   //get text delimiter
   convertionParam.textDelim = '"';
   // get separator
   if (header.indexOf(';') >= 0) {
      convertionParam.separator = ';';
   } else {
      convertionParam.separator = ',';
   }

   /** SPECIFY AT WHICH ROW OF THE CSV FILE IS THE HEADER (COLUMN TITLES)
   We suppose the data will always begin right away after the header line */
   convertionParam.headerLineStart = 0;
   convertionParam.dataLineStart = 1;

   return convertionParam;
}

function getHeaderData(csvData, convertionParam) {
   var headerData = csvData[convertionParam.headerLineStart];
   // we make a copy of the array
   var headerDataCopy = [...headerData];
   for (var i = 0; i < headerDataCopy.length; i++) {

      headerDataCopy[i] = headerDataCopy[i].trim();

      if (!headerDataCopy[i]) {
         headerDataCopy[i] = i;
      }
   }
   return headerDataCopy;
}

function getRowData(csvData, convertionParam) {
   var rowData = [];
   for (var i = convertionParam.dataLineStart; i < csvData.length; i++) {
      rowData.push(csvData[i]);
   }
   return rowData;
}

//The purpose of this function is to load all the data (titles of the columns and rows) and create a list of objects.
//Each object represents a row of the csv file
function loadForm(form, columns, rows) {
   for (var j = 0; j < rows.length; j++) {
      var obj = {};

      for (var i = 0; i < columns.length; i++) {
         obj[columns[i]] = rows[j][i];
      }
      form.push(obj);
   }
}
