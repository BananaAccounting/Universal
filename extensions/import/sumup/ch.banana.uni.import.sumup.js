// Copyright [2025] [Banana.ch SA - Lugano Switzerland]
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

// @id = ch.banana.uni.import.sumup
// @api = 1.0
// @pubdate = 2025-05-20
// @publisher = Banana.ch SA
// @description = SumUp - Import movements .csv (Banana+ Advanced)
// @description.it = SumUp - Importa movimenti .csv (Banana+ Advanced)
// @description.en = SumUp - Import movements .csv (Banana+ Advanced)
// @description.de = SumUp - Bewegungen importieren .csv (Banana+ Advanced)
// @description.fr = SumUp - Importer mouvements .csv (Banana+ Advanced)
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


// AccountsNames
const BANK_ACCOUNT = "bankaccount"
const SUMUP_IN = "sumupin"
const CASH_ACCOUNT = "cashaccount"
const SUMUP_FEE = "stripefee"

// Accounting types
const DOUBLE_ENTRY_TYPE = "100";
const INCOME_EXPENSES_TYPE = "110";

// Tables
const ACCOUNTS_TABLE = "Accounts"
const CATEGORIES_TABLE = "Categories"

//Columns
const CATEGORY_COLUMN = "Category"
const ACCOUNT_COLUMN = "Account"

/**
 * Parse the data and return the data to be imported as a tab separated file.
 */
function exec(inData, isTest) {

   var importUtilities = new ImportUtilities(Banana.document);
   let userParam = {};
   let banDoc = Banana.document;

   if (!inData)
      return "";

   if (isTest !== true && !importUtilities.verifyBananaAdvancedVersion())
      return "";

   userParam = settingsDialog(banDoc);
   if (!userParam) {
      return "";
   }

   let transactions = processSumUpTransactions(inData, userParam, banDoc);
   if (!transactions) {
      importUtilities.getUnknownFormatError();
      return "";
   }

   return transactions;

}

function processSumUpTransactions(inData, userParam = {}, banDoc = {}) {
   let convertionParam = defineConversionParam(inData);
   let csvData = "";

   csvData = Banana.Converter.csvToArray(inData, convertionParam.separator, convertionParam.textDelim);
   let transactionsData = [];

   //Format 1
   let sumUpFormat1 = new SumupFormat1(banDoc, userParam);
   transactionsData = sumUpFormat1.getFormattedData(csvData, convertionParam);
   if (sumUpFormat1.match(transactionsData)) {
      return sumUpFormat1.processTransactions(transactionsData);
   }

   //Format 2
   let sumUpFormat2 = new SumupFormat2(banDoc, userParam);
   transactionsData = sumUpFormat2.getFormattedData(csvData, convertionParam);
   if (sumUpFormat2.match(transactionsData)) {
      return sumUpFormat2.processTransactions(transactionsData);
   }

}

/**
 * SumUp Format 2
 * Data example:
 * E-Mail,Datum,Transaktions-ID,Zahlungsart,Status,Kartentyp,Letzte 4 Ziffern,Durchgeführt mit,Zahlungsmethode,Eingabemodus,Autorisierungscode,Beschreibung,Betrag inkl. MwSt.,Netto,Steuerbetrag,Trinkgeldbetrag,Gebühr,Auszahlung,Auszahlungsdatum,Auszahlungs-ID,Referenz
 * bar@test.ch,2025-01-31 19:56:55,T4SLAD3TU4,Umsatz,Erfolgreich,MASTERCARD,**** **** **** 0000,CREDIT,POS,CONTACTLESS,740559,"2 x Getränk 4.50.-, 1 x Snack 2,50.-",11.5,11.21,0.29,0.0,0.29,11.21,,,
 * ,2025-01-31 19:57:11,T4SLAD3TU4,Auszahlung,Gezahlt,,,,,,,,11.5,,,,0.29,11.21,2025-02-03,952982,
 * bar@test.ch,2025-01-31 18:45:43,TAAATLVFSDG,Umsatz,Erfolgreich,,,,CASH,N/A,,"1 x Snack 2,50.-",2.5,2.44,0.06,0.0,0.0,2.5,,,
 * bar@test.ch,2025-01-31 18:37:09,TFAZULKF26,Umsatz,Erfolgreich,MASTERCARD,**** **** **** 0000,CREDIT,POS,CONTACTLESS,603849,2 x Getränk 4.50.-,9.0,8.77,0.23,0.0,0.23,8.77,,,
 * ,2025-01-31 18:37:21,TFAZULKF26,Auszahlung,Gezahlt,,,,,,,,9.0,,,,0.23,8.77,2025-02-03,952982,
 * bar@test.ch,2025-01-31 18:37:00,TEG9E236RY,Umsatz,Abgebrochen,UNKNOWN,,UNKNOWN,N/A,N/A,,2 x Getränk 4.50.-,9.0,8.77,0.23,0.0,0.0,,,,
 * bar@test.ch,2025-01-31 18:27:49,TFGXAVY3UF,Umsatz,Erfolgreich,VISA,**** **** **** 0000,DEBIT,POS,CONTACTLESS,347185,"1 x Snack 2,50.-",2.5,2.44,0.06,0.0,0.04,2.46,,,
 * ,2025-01-31 18:28:01,TFGXAVY3UF,Auszahlung,Gezahlt,,,,,,,,2.5,,,,0.04,2.46,2025-02-03,952982,
 * bar@test.ch,2025-01-31 18:02:46,TAAATLUYM44,Umsatz,Erfolgreich,,,,CASH,N/A,,1 x Obst 1.-,1.0,0.93,0.07,0.0,0.0,1.0,,,
 * bar@test.ch,2025-01-31 17:59:12,TC6XLX3E7M,Umsatz,Erfolgreich,VISA,**** **** **** 0000,CREDIT,POS,CONTACTLESS,082724,1 x Getränk 4.50.-,4.5,4.39,0.11,0.0,0.11,4.39,,,
 * ,2025-01-31 17:59:21,TC6XLX3E7M,Auszahlung,Gezahlt,,,,,,,,4.5,,,,0.11,4.39,2025-02-03,952982,
 * 
 * Specifics:
 * We need to separate two types of transactions: Card and cash.
 * Bank Account → to record payments actually credited to the bank account (Zahlungsart = Auszahlung).
 * Cash Account → to record cash receipts (Zahlungsmethode = CASH).
 * Commission Account → to record fees charged by SumUp (Gebühr).
 * Revenue Account → to record receipts (Umsatz).
 * 
 * Example Bank Payout:
 * 01.01.2025	T4SLAD3TU4	Payment from client		3001	11.50
 * 01.01.2025	T4SLAD3TU4	Bank payout	1020		11.21
 * 01.01.2025	T4SLAD3TU4	SumUp Fee	4001		0.29
 * Example Cash payment
 * 01.01.2025	TAAATLVFSDG		1001	3001	2.50
 * 
 * Where:
 * 1020->Bank account
 * 3001->SumUp In
 * 4001->SumUp Fee
 * 1001->Cash account
 * 
 * We book the payouts and the cashed amounts and ignore the payments from the client that are not yet credited to the bank account.
 * In the example in our hands we do not have any example about eventual refunds or chargebacks. 24.03.2025.
 * 
*/
var SumupFormat2 = class SumupFormat2 extends ImportUtilities {

   constructor(banDocument, userParam) {
      super(banDocument, userParam);

      this.banDoc = banDocument;
      this.decimalSeparator = ".";
      this.params = userParam;
      this.texts = getTexts(banDocument);
      this.csvLanguage = "";

   }
   getFormattedData(csvData, convertionParam) {

      var columns = getHeaderData(csvData, convertionParam); //array
      var rows = getRowData(csvData, convertionParam); //array of array
      let form = [];

      columns = this.convertHeaderDe(columns);
      //Load the form with data taken from the array. Create objects
      loadForm(form, columns, rows);

      return form;
   }
   convertHeaderDe(columns) {
      let convertedColumns = [];
      for (var i = 0; i < columns.length; i++) {
         switch (columns[i]) {
            case "E-Mail":
               convertedColumns[i] = "Email";
               break;
            case "Datum":
               convertedColumns[i] = "Transaction Date";
               break;
            case "Transaktions-ID":
               convertedColumns[i] = "Transaction Id";
               break;
            case "Zahlungsart":
               convertedColumns[i] = "Payment type";
               break;
            case "Status":
               convertedColumns[i] = "Status";
               break;
            case "Kartentyp":
               convertedColumns[i] = "Card type";
               break;
            case "Letzte 4 Ziffern":
               convertedColumns[i] = "Last 4 digits";
               break;
            case "Durchgeführt mit":
               convertedColumns[i] = "Processed by";
               break;
            case "Zahlungsmethode":
               convertedColumns[i] = "Payment method";
               break;
            case "Eingabemodus":
               convertedColumns[i] = "Entry mode";
               break;
            case "Autorisierungscode":
               convertedColumns[i] = "Authorization code";
               break;
            case "Beschreibung":
               convertedColumns[i] = "Description";
               break;
            case "Betrag inkl. MwSt.":
               convertedColumns[i] = "Amount incl. VAT";
               break;
            case "Netto":
               convertedColumns[i] = "Net amount";
               break;
            case "Steuerbetrag":
               convertedColumns[i] = "Tax amount";
               break;
            case "Trinkgeldbetrag":
               convertedColumns[i] = "Tip amount";
               break;
            case "Gebühr":
               convertedColumns[i] = "Fee";
               break;
            case "Auszahlung":
               convertedColumns[i] = "Payout";
               break;
            case "Auszahlungsdatum":
               convertedColumns[i] = "Payout date";
               break;
            case "Auszahlungs-ID":
               convertedColumns[i] = "Payout ID";
               break;
            case "Referenz":
               convertedColumns[i] = "Reference";
               break;
            default:
               convertedColumns[i] = columns[i]; // Mantiene il valore originale se non è nella lista
               break;
         }
      }


      if (convertedColumns.indexOf("Transaction Date") < 0
         || convertedColumns.indexOf("Description") < 0
         || convertedColumns.indexOf("Net amount") < 0
         || convertedColumns.indexOf("Fee") < 0
         || convertedColumns.indexOf("Reference") < 0) {
         return [];
      }

      this.csvLanguage = "de";
      return convertedColumns;
   }

   /** Return true if the transactions match this format */
   match(transactionsData) {
      if (transactionsData.length === 0)
         return false;

      for (var i = 0; i < transactionsData.length; i++) {
         var transaction = transactionsData[i];
         var formatMatched = true;

         if (formatMatched && transaction["Transaction Date"] && transaction["Transaction Date"].length >= 16 &&
            transaction["Transaction Date"].match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}(:\d{2})?$/))
            formatMatched = true;
         else
            formatMatched = false;

         if (formatMatched && transaction["Transaction Id"])
            formatMatched = true;
         else
            formatMatched = false;

         if (formatMatched)
            return true;
      }

      return false;
   }

   processTransactions(transactionsData) {
      let accoutingType = this.banDoc.info("Base", "FileTypeGroup");
      let headers = [];
      let objectArrayToCsv = [];
      let processedTrans = {};

      if (accoutingType == INCOME_EXPENSES_TYPE) {
         processedTrans = this.getprocessedTransactions(transactionsData, accoutingType);
         headers = ["Date", "ExternalReference", "Description", "Income", "Expenses", "Account", "Category", "Notes"];
      } else if (accoutingType == DOUBLE_ENTRY_TYPE) {
         processedTrans = this.getprocessedTransactions(transactionsData, accoutingType);
         headers = ["Date", "ExternalReference", "Description", "AccountDebit", "AccountCredit", "Amount", "Notes"];
      }

      objectArrayToCsv = Banana.Converter.objectArrayToCsv(headers, processedTrans, ";");

      return objectArrayToCsv;
   }

   getprocessedTransactions(transactionsData, accoutingType) {

      let transactionsMapped = [];
      let paymentTransactions = {};
      let controlTerms = this.getControlTerms();

      if (transactionsData.length === 0)
         return transactionsMapped;

      for (let row of transactionsData) {

         let trType = row["Payment type"];
         let trStatus = row["Status"];
         let trPaymentMethod = row["Payment method"];
         let trId = row["Transaction Id"];

         if (!trId || trId.trim() === "") {
            Banana.console.debug("Skipping row with missing Transaction Id.");
            continue;
         }

         // Check if transactions is canceled or failed
         if (trStatus === controlTerms.paymentStatusFailed || trStatus === controlTerms.paymentStatusCanceled) {
            Banana.console.debug("Skipping canceled/failed transaction: " + trId);
            continue;
         }

         if (trType === controlTerms.paymentTypeTransaction
            && trStatus === controlTerms.paymentStatusSuccessful
            && trPaymentMethod == controlTerms.paymentMethodPos) {
            paymentTransactions[trId] = row; // The transaction is a valid POS payment.
         } else if (trType === controlTerms.paymentTypePayout && trStatus === controlTerms.paymentStatusPaid) {
            /** The transaction is a valid payout.
             * As the payouts row do not have the description and other useful data, 
             * We search for the corresponding POS payment to get description and payment method. */
            let paymentRow = paymentTransactions[trId] || null;
            let paymentDescription = paymentRow ? paymentRow["Description"] : "";
            let paymentMethod = paymentRow ? paymentRow["Payment method"] : "";
            this.mapBankPayoutTransactions(accoutingType, row, transactionsMapped, paymentDescription, paymentMethod);
         } else if (trType === controlTerms.paymentTypeTransaction
            && trStatus === controlTerms.paymentStatusSuccessful
            && trPaymentMethod == controlTerms.paymentMethodCash) {
            this.mapCashPaymentTransactions(accoutingType, row, transactionsMapped); // The transaction is a valid cash payment.
         } else {
            Banana.console.debug("Transaction type not recognised: " + row["Transaction Id"]);
         }
      }

      return transactionsMapped;
   }

   mapCashPaymentTransactions(accoutingType, row, transactionsMapped) {
      if (accoutingType == DOUBLE_ENTRY_TYPE) {
         this.mapCashPaymentDoubleEntry(row, transactionsMapped);
      } else if (accoutingType == INCOME_EXPENSES_TYPE) {
         this.mapCashPaymentIncomeExpenses(row, transactionsMapped);
      }
   }

   mapCashPaymentDoubleEntry(row, transactionsMapped) {
      let trRow = initTrRowObjectStructure_DoubleEntry();
      trRow.Date = Banana.Converter.toInternalDateFormat(row["Transaction Date"], this.params.dateFormat);
      trRow.ExternalReference = row["Transaction Id"];
      trRow.Description = row["Description"];
      trRow.AccountDebit = this.params.cashAccount;
      trRow.AccountCredit = this.params.sumUpIn;
      trRow.Amount = row["Amount incl. VAT"];
      trRow.Notes = row["Payment method"];

      transactionsMapped.push(trRow);
   }

   mapCashPaymentIncomeExpenses(row, transactionsMapped) {
      let trRow = initTrRowObjectStructure_IncomeExpenses();
      trRow.Date = Banana.Converter.toInternalDateFormat(row["Transaction Date"], this.params.dateFormat);
      trRow.ExternalReference = row["Transaction Id"];
      trRow.Description = row["Description"];
      trRow.Income = row["Amount incl. VAT"];
      trRow.Expenses = "";
      trRow.Account = this.params.cashAccount;
      trRow.Category = this.params.sumUpIn;
      trRow.Notes = row["Payment method"];

      transactionsMapped.push(trRow);
   }

   mapBankPayoutTransactions(accoutingType, row, transactionsMapped, paymentDescription, paymentMethod) {

      if (accoutingType == DOUBLE_ENTRY_TYPE) {
         this.mapGrossPaymentDoubleEntry(row, transactionsMapped, paymentDescription, paymentMethod);
         this.mapPayoutDoubleEntry(row, transactionsMapped);
         this.mapFeeDoubleEntry(row, transactionsMapped);
      } else if (accoutingType == INCOME_EXPENSES_TYPE) {
         this.mapGrossPaymentIncomeExpenses(row, transactionsMapped, paymentDescription, paymentMethod);
         this.mapPayoutIncomeExpenses(row, transactionsMapped);
         this.mapFeeIncomeExpenses(row, transactionsMapped);
      }
   }

   mapGrossPaymentIncomeExpenses(row, transactionsMapped, paymentDescription, paymentMethod) {
      let trRow = initTrRowObjectStructure_IncomeExpenses();
      trRow.Date = Banana.Converter.toInternalDateFormat(row["Transaction Date"], this.params.dateFormat);
      trRow.ExternalReference = row["Transaction Id"];
      trRow.Description = paymentDescription;
      trRow.Income = row["Amount incl. VAT"];
      trRow.Expenses = "";
      trRow.Account = "";
      trRow.Category = this.params.sumUpIn;
      trRow.Notes = paymentMethod;

      transactionsMapped.push(trRow);
   }

   mapPayoutIncomeExpenses(row, transactionsMapped) {
      let trRow = initTrRowObjectStructure_IncomeExpenses();
      trRow.Date = Banana.Converter.toInternalDateFormat(row["Transaction Date"], this.params.dateFormat);
      trRow.ExternalReference = row["Transaction Id"];
      trRow.Description = this.texts.bankPayout;
      trRow.Income = row["Payout"];
      trRow.Expenses = "";
      trRow.Account = this.params.bankAccount;
      trRow.Category = "";
      trRow.Notes = row["Payout ID"];

      transactionsMapped.push(trRow);
   }

   mapFeeIncomeExpenses(row, transactionsMapped) {
      let trRow = initTrRowObjectStructure_IncomeExpenses();
      trRow.Date = Banana.Converter.toInternalDateFormat(row["Transaction Date"], this.params.dateFormat);
      trRow.ExternalReference = row["Transaction Id"];
      trRow.Description = this.texts.fee;
      trRow.Income = "";
      trRow.Expenses = row["Fee"];
      trRow.Account = "";
      trRow.Category = this.params.sumUpFee;
      trRow.Notes = "";

      transactionsMapped.push(trRow);
   }

   mapGrossPaymentDoubleEntry(row, transactionsMapped, paymentDescription, paymentMethod) {
      let trRow = initTrRowObjectStructure_DoubleEntry();
      trRow.Date = Banana.Converter.toInternalDateFormat(row["Transaction Date"], this.params.dateFormat);
      trRow.ExternalReference = row["Transaction Id"];
      trRow.Description = paymentDescription
      trRow.AccountDebit = "";
      trRow.AccountCredit = this.params.sumUpIn;
      trRow.Amount = row["Amount incl. VAT"];
      trRow.Notes = paymentMethod;

      transactionsMapped.push(trRow);
   }

   mapPayoutDoubleEntry(row, transactionsMapped) {
      let trRow = initTrRowObjectStructure_DoubleEntry();
      trRow.Date = Banana.Converter.toInternalDateFormat(row["Transaction Date"], this.params.dateFormat);
      trRow.ExternalReference = row["Transaction Id"];
      trRow.Description = this.texts.bankPayout;
      trRow.AccountDebit = this.params.bankAccount;
      trRow.AccountCredit = "";
      trRow.Amount = row["Payout"];
      trRow.Notes = row["Payout ID"];

      transactionsMapped.push(trRow);
   }

   mapFeeDoubleEntry(row, transactionsMapped) {
      let trRow = initTrRowObjectStructure_DoubleEntry();
      trRow.Date = Banana.Converter.toInternalDateFormat(row["Transaction Date"], this.params.dateFormat);
      trRow.ExternalReference = row["Transaction Id"];
      trRow.Description = this.texts.fee;
      trRow.AccountDebit = this.params.sumUpFee;
      trRow.AccountCredit = "";
      trRow.Amount = row["Fee"];
      trRow.Notes = "";

      transactionsMapped.push(trRow);
   }

   getControlTerms() {
      switch (this.csvLanguage) {
         case "de":
            return this.getControlTermsDE();
         default:
            Banana.console.debug("*.csv headers language not recognized.");
            return {};
      }
   }

   getControlTermsDE() {
      let terms = {};
      terms.paymentStatusFailed = "Fehlgeschlagen";
      terms.paymentStatusCanceled = "Abgebrochen";
      terms.paymentStatusSuccessful = "Erfolgreich";
      terms.paymentStatusPaid = "Gezahlt";
      terms.paymentMethodPos = "POS";
      terms.paymentMethodCash = "CASH";
      terms.paymentTypeTransaction = "Umsatz";
      terms.paymentTypePayout = "Auszahlung";
      return terms;
   }

   getControlTermsEN() {
      let terms = {};
      terms.paymentStatusFailed = "";
      terms.paymentStatusCanceled = "";
      terms.paymentStatusSuccessful = "";
      terms.paymentStatusPaid = "";
      terms.paymentMethodPos = "";
      terms.paymentMethodCash = "";
      terms.paymentTypeTransaction = "";
      terms.paymentTypePayout = "";
      return terms;
   }

   getControlTermsIT() {
      let terms = {};
      terms.paymentStatusFailed = "";
      terms.paymentStatusCanceled = "";
      terms.paymentStatusSuccessful = "";
      terms.paymentStatusPaid = "";
      terms.paymentMethodPos = "";
      terms.paymentMethodCash = "";
      terms.paymentTypeTransaction = "";
      terms.paymentTypePayout = "";
      return terms;
   }

   getControlTermsFR() {
      let terms = {};
      terms.paymentStatusFailed = "";
      terms.paymentStatusCanceled = "";
      terms.paymentStatusSuccessful = "";
      terms.paymentStatusPaid = "";
      terms.paymentMethodPos = "";
      terms.paymentMethodCash = "";
      terms.paymentTypeTransaction = "";
      terms.paymentTypePayout = "";
      return terms;
   }
}
/**
 * SumUp Format 1
 * Format example:
 * Data transazione,Codice transazione,Tipo transazione,Riferimento,Causale pagamento,employees.list.columns.status,Importo di fatturazione in uscita,Importo di fatturazione in entrata,Valuta della carta,Importo transazione in uscita,Importo transazione in entrata,Valuta della transazione,Tasso di cambio,Commissione,Saldo disponibile
 * 23/12/2023 09:02,CD4MQ4JRRM,Pagamento online,Test,Test,Approvato,12.08,0.00,EUR,12.08,0.00,EUR,1.00,0.00,4352.16
 * 22/12/2023 13:40,C9E6QPVQW3,Pagamento da SumUp,Test,Test,Pagamento in entrata,0.00,34.35,EUR,0.00,34.35,EUR,1.00,0.00,4364.24
 * 19/12/2023 13:31,CDWM4ZYZXN,Pagamento da SumUp,Test,Test,Pagamento in entrata,0.00,34.32,EUR,0.00,34.32,EUR,1.00,0.00,4329.89
 * 19/12/2023 11:28,CDVYJLP55W,Bonifico bancario in entrata,Test,Test,Approvato,0.00,35.00,EUR,0.00,35.00,EUR,1.00,0.00,4295.57
 * 12/12/2023 13:32,CD27XM6M7G,Pagamento da SumUp,Test,Test,Pagamento in entrata,0.00,53.93,EUR,0.00,53.93,EUR,1.00,0.00,4260.57
 * 08/12/2023 12:18,CD272EWGRR,Bonifico bancario in entrata,Test,Test,Approvato,0.00,75.00,EUR,0.00,75.00,EUR,1.00,0.00,4206.64
 * 07/12/2023 12:44,CDWMXXKEWN,Bonifico bancario in uscita,Test,Test,Approvato,400.00,0.00,EUR,400.00,0.00,EUR,1.00,0.00,4131.64
 * 07/12/2023 09:31,CO3ZNNW5M6,Prelievo allo sportello ATM,Test,Test,Approvato,300.00,0.00,EUR,300.00,0.00,EUR,1.00,0.00,4531.64
 * 
 * We treat this format as a bank statement as it contains both inflows and outflows, fees are set to 0 and there
 * is no information about net or gross amounts.Moreover, looking at the data, seems be transactions related to a bank account.
*/
var SumupFormat1 = class SumupFormat1 extends ImportUtilities {

   constructor(banDocument, userParam) {
      super(banDocument, userParam);

      this.banDoc = banDocument;
      this.decimalSeparator = ".";
      this.params = userParam;
      this.texts = getTexts(banDocument);

   }

   getFormattedData(csvData, convertionParam) {
      var columns = getHeaderData(csvData, convertionParam); //array
      var rows = getRowData(csvData, convertionParam); //array of array
      let form = [];

      columns = this.convertHeaderIt(columns);

      //Load the form with data taken from the array. Create objects
      loadForm(form, columns, rows);

      return form;
   }
   convertHeaderIt(columns) {
      let convertedColumns = [];
      for (var i = 0; i < columns.length; i++) {
         switch (columns[i]) {
            case "Data transazione":
               convertedColumns[i] = "Transaction Date";
               break;
            case "Codice transazione":
               convertedColumns[i] = "Transaction Code";
               break;
            case "Tipo transazione":
               convertedColumns[i] = "Transaction Type";
               break;
            case "Riferimento":
               convertedColumns[i] = "Reference";
               break;
            case "Causale pagamento":
               convertedColumns[i] = "Payment Reason";
               break;
            case "employees_list_columns_status":
               convertedColumns[i] = "Status";
               break;
            case "Importo di fatturazione in uscita":
               convertedColumns[i] = "Billing Amount Out";
               break;
            case "Importo di fatturazione in entrata":
               convertedColumns[i] = "Billing Amount In";
               break;
            case "Valuta della carta":
               convertedColumns[i] = "Card Currency";
               break;
            case "Importo transazione in uscita":
               convertedColumns[i] = "Transaction Amount Out";
               break;
            case "Importo transazione in entrata":
               convertedColumns[i] = "Transaction Amount In";
               break;
            case "Valuta della transazione":
               convertedColumns[i] = "Transaction Currency";
               break;
            case "Tasso di cambio":
               convertedColumns[i] = "Exchange Rate";
               break;
            case "Commissione":
               convertedColumns[i] = "Fee";
               break;
            case "Saldo disponibile":
               convertedColumns[i] = "Available Balance";
               break;
            default:
               convertedColumns[i] = columns[i]; // Mantiene il valore originale se non è nella lista
               break;
         }
      }

      // Verifica la presenza delle colonne necessarie per l'elaborazione
      if (convertedColumns.indexOf("Transaction Date") < 0
         || convertedColumns.indexOf("Reference") < 0
         || convertedColumns.indexOf("Transaction Amount In") < 0
         || convertedColumns.indexOf("Fee") < 0) {
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
         var formatMatched = true;

         if (formatMatched && transaction["Transaction Date"] && transaction["Transaction Date"].length >= 15 &&
            (transaction["Transaction Date"].match(/^[0-9]+\/[0-9]+\/[0-9]+\s[0-9]+\:[0-9]+$/) ||
               transaction["Transaction Date"].match(/^\d{2}\/\d{2}\/\d{2},\s\d{2}:\d{2}$/)))
            formatMatched = true;
         else
            formatMatched = false;

         if (formatMatched && transaction["Transaction Code"])
            formatMatched = true;
         else
            formatMatched = false;

         if (formatMatched)
            return true;
      }

      return false;
   }

   processTransactions(transactionsData) {
      let accoutingType = this.banDoc.info("Base", "FileTypeGroup");
      let headers = [];
      let objectArrayToCsv = [];
      let processedTrans = {};

      if (accoutingType == INCOME_EXPENSES_TYPE) {
         processedTrans = this.getprocessedTransactions(transactionsData, accoutingType);
         headers = ["Date", "ExternalReference", "Description", "Income", "Expenses", "Account", "Category", "Notes"];
      } else if (accoutingType == DOUBLE_ENTRY_TYPE) {
         processedTrans = this.getprocessedTransactions(transactionsData, accoutingType);
         headers = ["Date", "ExternalReference", "Description", "AccountDebit", "AccountCredit", "Amount", "Notes"];
      }

      objectArrayToCsv = Banana.Converter.objectArrayToCsv(headers, processedTrans, ";");

      return objectArrayToCsv;
   }

   getprocessedTransactions(transactionsData, accoutingType) {

      let transactionsMapped = [];

      if (transactionsData.length === 0)
         return transactionsMapped;

      for (let row of transactionsData) {
         this.mapTransactions(accoutingType, row, transactionsMapped);
      }

      return transactionsMapped;
   }

   mapTransactions(accoutingType, row, transactionsMapped) {
      if (accoutingType == DOUBLE_ENTRY_TYPE) {
         this.mapTransactionsDoubleEntry(row, transactionsMapped);
      } else if (accoutingType == INCOME_EXPENSES_TYPE) {
         this.mapTransactionsIncomeExpenses(row, transactionsMapped);
      }
   }

   mapTransactionsDoubleEntry(row, transactionsMapped) {
      let trRow = initTrRowObjectStructure_DoubleEntry();
      trRow.Date = Banana.Converter.toInternalDateFormat(row["Transaction Date"], this.params.dateFormat);
      trRow.ExternalReference = row["Transaction Code"];
      trRow.Description = row["Transaction Type"];
      if (row["Transaction Amount In"] > 0
         && row["Transaction Amount Out"] == 0) {
         trRow.AccountDebit = this.params.bankAccount;
         trRow.AccountCredit = this.params.sumUpIn;
         trRow.Amount = row["Transaction Amount In"];
      } else if (row["Transaction Amount Out"] > 0
         && row["Transaction Amount In"] == 0) {
         trRow.AccountDebit = this.params.sumUpIn;
         trRow.AccountCredit = this.params.bankAccount;
         trRow.Amount = row["Transaction Amount Out"];
      }

      trRow.Notes = row["Reference"];
      transactionsMapped.push(trRow);
   }

   mapTransactionsIncomeExpenses(row, transactionsMapped) {
      let trRow = initTrRowObjectStructure_IncomeExpenses();
      trRow.Date = Banana.Converter.toInternalDateFormat(row["Transaction Date"], this.params.dateFormat);
      trRow.ExternalReference = row["Transaction Code"];
      trRow.Description = row["Transaction Type"];
      if (row["Transaction Amount In"] > 0
         && row["Transaction Amount Out"] == 0) {
         trRow.Income = row["Transaction Amount In"];
         trRow.Expenses = "";
         trRow.Category = this.params.sumUpIn;
      } else if (row["Transaction Amount Out"] > 0
         && row["Transaction Amount In"] == 0) {
         trRow.Income = "";
         trRow.Expenses = row["Transaction Amount Out"];
         trRow.Category = this.params.sumUpIn;
      }

      trRow.Notes = row["Reference"];
      transactionsMapped.push(trRow);
   }

}

function initTrRowObjectStructure_DoubleEntry() {
   let trRow = {};

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
   let trRow = {};

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

   let dialogParam = {};
   let savedDlgParam = Banana.document.getScriptSettings("sumupImportDlgParams");
   if (savedDlgParam.length > 0) {
      let parsedParam = JSON.parse(savedDlgParam);
      if (parsedParam) {
         dialogParam = parsedParam;
      }
   }

   //Verify Params.
   verifyParam(dialogParam);
   //Settings dialog
   var dialogTitle = 'Settings';
   var pageAnchor = 'sumupImportDlgParams';
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
   let paramToString = JSON.stringify(dialogParam);
   Banana.document.setScriptSettings("sumupImportDlgParams", paramToString);
   return dialogParam;
}

function initParam() {
   var params = {};

   params.dateFormat = "yyyy-mm-dd";
   params.bankAccount = ""; // Bank account
   params.sumUpIn = ""; // Revenues account.
   params.cashAccount = ""; // Cash account
   params.sumUpFee = ""; // Costs account.

   return params;

}

function convertParam(banDoc, userParam) {
   var paramList = {};
   let texts = getTexts(banDoc);
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
   param.title = texts.sumUpAccount;
   param.type = 'string';
   param.value = userParam.bankAccount ? userParam.bankAccount : '';
   param.defaultvalue = defaultParam.bankAccount;
   param.readValue = function () {
      userParam.bankAccount = this.value;
   }
   paramList.data.push(param);

   var param = {};
   param.name = SUMUP_IN;
   param.title = texts.sumUpIn;
   param.type = 'string';
   param.value = userParam.sumUpIn ? userParam.sumUpIn : '';
   param.defaultvalue = defaultParam.sumUpIn;
   param.readValue = function () {
      userParam.sumUpIn = this.value;
   }
   paramList.data.push(param);

   var param = {};
   param.name = CASH_ACCOUNT;
   param.title = texts.sumUpCash;
   param.type = 'string';
   param.value = userParam.cashAccount ? userParam.cashAccount : '';
   param.defaultvalue = defaultParam.cashAccount;
   param.readValue = function () {
      userParam.cashAccount = this.value;
   }
   paramList.data.push(param);

   var param = {};
   param.name = SUMUP_FEE;
   param.title = texts.sumUpFee;
   param.type = 'string';
   param.value = userParam.sumUpFee ? userParam.sumUpFee : '';
   param.defaultvalue = defaultParam.sumUpFee;
   param.readValue = function () {
      userParam.sumUpFee = this.value;
   }
   paramList.data.push(param);

   return paramList;
}

function verifyParam(dialogParam) {

   let defaultParam = initParam();

   if (!dialogParam.dateFormat) {
      dialogParam.dateFormat = defaultParam.dateFormat;
   }
   if (!dialogParam.bankAccount) {
      dialogParam.bankAccount = defaultParam.bankAccount;
   }
   if (!dialogParam.cashAccount) {
      dialogParam.cashAccount = defaultParam.cashAccount;
   }
   if (!dialogParam.sumUpIn) {
      dialogParam.sumUpIn = defaultParam.sumUpIn;
   }
   if (!dialogParam.sumUpFee) {
      dialogParam.sumUpFee = defaultParam.sumUpFee;
   }
}

function validateParams(params) {

   let banDoc = Banana.document;

   if (!banDoc)
      return false;

   let texts = getTexts(banDoc);
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
   let accoutingType = banDoc.info("Base", "FileTypeGroup");

   if (banDoc && account) {
      let accountsTable = banDoc.table(ACCOUNTS_TABLE);
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
         let categoriesTable = banDoc.table(CATEGORIES_TABLE);
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

   let lang = getLang(banDocument);

   if (lang == "")
      return lang;

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
   let texts = {};

   texts.dateFormat = "Datumsformat";
   texts.bankPayout = "Bankauszahlung";
   texts.sumUpAccount = "Bankkonto";
   texts.sumUpIn = "SumUp-Ertragskonto";
   texts.sumUpCash = "Kassenkonto";
   texts.sumUpFee = "SumUp-Gebührenkonto";
   texts.accountMissing = "Fehlendes Konto";
   texts.accountErrorMsg = "Dieses Konto existiert nicht in Ihrem Kontenplan";
   texts.net = "Netto";
   texts.fee = "Gebühr";


   return texts;
}

function getTextsIt() {
   let texts = {};

   texts.dateFormat = "Formato data";
   texts.bankPayout = "Pagamento alla banca";
   texts.sumUpAccount = "Conto bancario";
   texts.sumUpIn = "Conto entrate Sumup";
   texts.sumUpCash = "Conto cassa";
   texts.sumUpFee = "Conto commissione SumUp";
   texts.accountMissing = "Conto mancante";
   texts.accountErrorMsg = "Questo conto non esiste nel tuo piano dei conti";
   texts.net = "Netto";
   texts.fee = "Commissione";


   return texts;
}

function getTextsFr() {
   let texts = {};

   texts.dateFormat = "Format de date";
   texts.bankPayout = "Paiement bancaire";
   texts.sumUpAccount = "Compte bancaire";
   texts.sumUpIn = "Compte des recettes SumUp";
   texts.sumUpCash = "Compte de caisse";
   texts.sumUpFee = "Compte des frais SumUp";
   texts.accountMissing = "Compte manquant";
   texts.accountErrorMsg = "Ce compte n'existe pas dans votre plan comptable";
   texts.net = "Net";
   texts.fee = "Frais";

   return texts;
}

function getTextsEn() {
   let texts = {};

   texts.dateFormat = "Date format";
   texts.bankPayout = "Bank payout";
   texts.sumUpAccount = "Bank account";
   texts.sumUpIn = "SumUp income account";
   texts.sumUpCash = "Cash account";
   texts.sumUpFee = "SumUp fee account";
   texts.accountMissing = "Missing account";
   texts.accountErrorMsg = "This account does not exists in your chart of accounts";
   texts.net = "Net";
   texts.fee = "Fee";

   return texts;
}

function getLang(banDocument) {
   let lang = 'en';
   if (banDocument)
      lang = banDocument.locale;
   else if (Banana.application.locale)
      lang = Banana.application.locale;
   if (lang.length > 2)
      lang = lang.substr(0, 2);
   return lang;
}


function defineConversionParam(inData) {

   var inData = Banana.Converter.csvToArray(inData);
   var header = String(inData[0]);
   var convertionParam = {};
   /** SPECIFY THE SEPARATOR AND THE TEXT DELIMITER USED IN THE CSV FILE */
   convertionParam.format = "csv"; // available formats are "csv", "html"
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

   /** SPECIFY THE COLUMN TO USE FOR SORTING
   If sortColums is empty the data are not sorted */
   convertionParam.sortColums = ["Date", "Doc"];
   convertionParam.sortDescending = false;

   return convertionParam;
}

function getHeaderData(csvData, convertionParam) {
   var headerData = csvData[convertionParam.headerLineStart];
   // we make a copy of the array
   let headerDataCopy = [...headerData];
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
   var obj = new Object;

   for (var j = 0; j < rows.length; j++) {
      var obj = {};

      for (var i = 0; i < columns.length; i++) {
         obj[columns[i]] = rows[j][i];
      }
      form.push(obj);
   }
}