// Copyright [2024] [Banana.ch SA - Lugano Switzerland]
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

// @pubdate = 2024-08-20
// @publisher = Banana.ch SA
// @includejs = import.utilities.js
/**
 * Parse the data and return the data to be imported as a tab separated file.
 */

var SyncPostFinanceData = class SyncPostFinanceData {
   constructor() {
   }

   /**
    * This method returns an object containing the statement data ( statement params + statement transactions)
    */
   getStatementData(fileContent, fileParams) {

      if (!fileContent) return "";

      var importUtilities = new ImportUtilities(Banana.document);
      var fieldSeparator = findSeparator(fileContent);
      let fileContentCleared = clearText(fileContent);
      var transactions = Banana.Converter.csvToArray(fileContentCleared, fieldSeparator);

      // Format SBU 1
      var formatSBU1 = new PFCSVFormatSBU1();
      if (formatSBU1.match(transactions)) {
         let transactionsList = [];
         let statementParams = {};
         statementParams = formatSBU1.getStatementParams(transactions);
         transactionsList = formatSBU1.getStatementTransactions(transactions, fileParams, statementParams);
         return transactionsList;
      }

      // Credit Card format 1
      var format1_CreditCard = new PFCSVFormat1_CreditCard();
      if (format1_CreditCard.match(transactions)) {
         let transactionsList = [];
         let statementParams = {};
         statementParams = format1_CreditCard.getStatementParams(transactions);
         transactionsList = format1_CreditCard.getStatementTransactions(transactions, fileParams, statementParams);
         return transactionsList;
      }

      // Format 1
      var format1 = new PFCSVFormat1(fileParams);
      if (format1.match(transactions)) {
         let transactionsList = [];
         let statementParams = {};
         statementParams = format1.getStatementParams(transactions);
         transactionsList = format1.getStatementTransactions(transactions, fileParams, statementParams);
         return transactionsList;
      }

      // Format 2
      var format2 = new PFCSVFormat2();
      if (format2.match(transactions)) {
         let transactionsList = [];
         let statementParams = {};
         statementParams = format2.getStatementParams(transactions);
         transactionsList = format2.getStatementTransactions(transactions, fileParams, statementParams);
         return transactionsList;
      }

      // Format 3
      var format3 = new PFCSVFormat3();
      if (format3.match(transactions)) {
         let transactionsList = [];
         let statementParams = {};
         statementParams = format3.getStatementParams(transactions);
         transactionsList = format3.getStatementTransactions(transactions, fileParams, statementParams);
         return transactionsList;
      }

      // Format 4
      var format4 = new PFCSVFormat4();
      if (format4.match(transactions)) {
         let transactionsList = [];
         let statementParams = {};
         statementParams = format4.getStatementParams(transactions);
         transactionsList = format4.getStatementTransactions(transactions, fileParams, statementParams);
         return transactionsList;
      }

      // Format 5
      var format5 = new PFCSVFormat5();
      if (format5.match(transactions)) {
         let transactionsList = [];
         let statementParams = {};
         statementParams = format5.getStatementParams(transactions);
         transactionsList = format5.getStatementTransactions(transactions, fileParams, statementParams);
         return transactionsList;
      }

      // Format 6, works with translated column headers.
      var format6 = new PFCSVFormat6();
      let transactionsData = format6.getFormattedData(transactions, importUtilities);
      if (format6.match(transactionsData)) {
         let transactionsList = [];
         let statementParams = {};
         statementParams = format6.getStatementParams(transactions); // here we must work with the original array
         transactionsList = format6.getStatementTransactions(transactionsData, fileParams, statementParams);
         return transactionsList;
      }
      return [];
   }
}

/**
 * PFCSV Format 6, since february 2024.
 */
function PFCSVFormat6() {


   this.getFormattedData = function (transactions, importUtilities) {
      let headerLineStart = 6;
      let dataLineStart = 8;
      // We do a copy as the getHeaderData modifies the content and we need to keep the original version clean.
      var transactionsCopy = transactions.map(function (arr) {
         return arr.slice();
      });
      if (transactionsCopy.length < dataLineStart)
         return [];
      let columns = importUtilities.getHeaderData(transactionsCopy, headerLineStart); //array
      let rows = importUtilities.getRowData(transactionsCopy, dataLineStart); //array of array
      let form = [];

      /** We convert the original headers into a custom format to be able to work with the same
       * format regardless of original's headers language or the position of the header column.
       * We need to translate all the .csv fields as the loadForm() method expects the header and
       * the rows to have the same length.
       * */
      let convertedColumns = [];

      convertedColumns = this.convertHeaderDe(columns, convertedColumns);
      if (convertedColumns.length > 0) {
         importUtilities.loadForm(form, convertedColumns, rows);
         return form;
      }
      // Convert headers from italian. 
      convertedColumns = this.convertHeaderIt(columns, convertedColumns);
      if (convertedColumns.length > 0) {
         importUtilities.loadForm(form, convertedColumns, rows);
         return form;
      }
      // Convert headers from french.
      convertedColumns = this.convertHeaderFr(columns, convertedColumns);
      if (convertedColumns.length > 0) {
         importUtilities.loadForm(form, convertedColumns, rows);
         return form;
      }
      // Convert headers from english.
      convertedColumns = this.convertHeaderEn(columns, convertedColumns);
      if (convertedColumns.length > 0) {
         importUtilities.loadForm(form, convertedColumns, rows);
         return form;
      }

      return [];

   }

   this.convertHeaderDe = function (columns) {
      let convertedColumns = [];
      for (var i = 0; i < columns.length; i++) {
         switch (columns[i]) {
            case "Datum":
               convertedColumns[i] = "Date";
               break;
            case "Bewegungstyp":
               convertedColumns[i] = "Type";
               break;
            case "Avisierungstext":
               convertedColumns[i] = "Description";
               break;
            case "Gutschrift in CHF":
               convertedColumns[i] = "Income";
               break;
            case "Lastschrift in CHF":
               convertedColumns[i] = "Expenses";
               break;
            case "Label":
               convertedColumns[i] = "Label";
               break;
            case "Kategorie":
               convertedColumns[i] = "Category";
               break;
            default:
               break;
         }
      }

      if (convertedColumns.indexOf("Date") < 0
         || convertedColumns.indexOf("Description") < 0
         || convertedColumns.indexOf("Income") < 0
         || convertedColumns.indexOf("Expenses") < 0) {
         return [];
      }
      return convertedColumns;
   }

   this.convertHeaderIt = function (columns, convertedColumns) {
      for (var i = 0; i < columns.length; i++) {
         switch (columns[i]) {
            case "Data":
               convertedColumns[i] = "Date";
               break;
            case "Tipo di movimento":
               convertedColumns[i] = "Type";
               break;
            case "Testo di avviso":
               convertedColumns[i] = "Description";
               break;
            case "Accredito in CHF":
               convertedColumns[i] = "Income";
               break;
            case "Addebito in CHF":
               convertedColumns[i] = "Expenses";
               break;
            case "Tag":
               convertedColumns[i] = "Label";
               break;
            case "Categoria":
               convertedColumns[i] = "Category";
               break;
            default:
               break;
         }
      }

      if (convertedColumns.indexOf("Date") < 0
         || convertedColumns.indexOf("Description") < 0
         || convertedColumns.indexOf("Income") < 0
         || convertedColumns.indexOf("Expenses") < 0) {
         return [];
      }

      return convertedColumns;
   }

   this.convertHeaderFr = function (columns, convertedColumns) {
      for (var i = 0; i < columns.length; i++) {
         switch (columns[i]) {
            case "Date":
               convertedColumns[i] = "Date";
               break;
            case "Type de transaction":
               convertedColumns[i] = "Type";
               break;
            case "Texte de notification":
               convertedColumns[i] = "Description";
               break;
            case "Crédit en CHF":
               convertedColumns[i] = "Income";
               break;
            case "Débit en CHF":
               convertedColumns[i] = "Expenses";
               break;
            case "Label":
               convertedColumns[i] = "Label";
               break;
            case "Catégorie":
               convertedColumns[i] = "Category";
               break;
            default:
               break;
         }
      }

      if (convertedColumns.indexOf("Date") < 0
         || convertedColumns.indexOf("Description") < 0
         || convertedColumns.indexOf("Income") < 0
         || convertedColumns.indexOf("Expenses") < 0) {
         return [];
      }

      return convertedColumns;
   }

   this.convertHeaderEn = function (columns, convertedColumns) {
      for (var i = 0; i < columns.length; i++) {
         switch (columns[i]) {
            case "Date":
               convertedColumns[i] = "Date";
               break;
            case "Type of transaction":
               convertedColumns[i] = "Type";
               break;
            case "Notification text":
               convertedColumns[i] = "Description";
               break;
            case "Credit in CHF":
               convertedColumns[i] = "Income";
               break;
            case "Debit in CHF":
               convertedColumns[i] = "Expenses";
               break;
            case "Tag":
               convertedColumns[i] = "Label";
               break;
            case "Category":
               convertedColumns[i] = "Category";
               break;
            default:
               break;
         }
      }

      if (convertedColumns.indexOf("Date") < 0
         || convertedColumns.indexOf("Description") < 0
         || convertedColumns.indexOf("Income") < 0
         || convertedColumns.indexOf("Expenses") < 0) {
         return [];
      }

      return convertedColumns;
   }

   /** Return true if the transactions match this format */
   this.match = function (transactionsData) {
      if (transactionsData.length === 0)
         return false;

      for (var i = 0; i < transactionsData.length; i++) {
         var transaction = transactionsData[i];
         var formatMatched = true;

         if (formatMatched && transaction["Date"] && transaction["Date"].length >= 10 &&
            transaction["Date"].match(/^\d{2}.\d{2}.\d{4}$/))
            formatMatched = true;
         else
            formatMatched = false;

         if (formatMatched)
            return true;
      }

      return false;
   }

   this.getStatementParams = function (transactions) {
      /**
       * File params for this format are located in the first rows of the document:
       * Data dal:;="22.02.2024"
       * Data fino al:;="27.02.2024"
       * Tipo di registrazione:;="Tutti"
       * Conto:;="CH5809000000652501224"
       * Valuta:;="CHF"
       * 
       * Data;Tipo di movimento;Testo di avviso;Accredito in CHF;Addebito in CHF
       *  6 ....
       *  7 ....
       */
      let statementParams = {};

      let iban = transactions[3][1];
      let statementCreationDate = this.getStatementCreationDate(transactions);
      let statementOwner = "";
      let statementCurrency = transactions[4][1];
      let initialBalance = "";
      let finalBalance = "";

      statementParams.StatementIban = iban;
      statementParams.StatementCreationDate = statementCreationDate;
      statementParams.StatementOwner = statementOwner;
      statementParams.StatementCurrency = statementCurrency;
      statementParams.StatementInitialBalance = initialBalance;
      statementParams.StatementFinalBalance = finalBalance;

      return statementParams;
   }

   this.getStatementTransactions = function (transactionsData, fileParams, statementParams) {
      var transactionsToImport = [];

      for (var i = 0; i < transactionsData.length; i++) {
         if (transactionsData[i]["Date"] && transactionsData[i]["Date"].length >= 10 &&
            transactionsData[i]["Date"].match(/^\d{2}.\d{2}.\d{4}$/)) {
            transactionsToImport.push(this.mapTransaction(transactionsData[i], fileParams, statementParams));
         }
      }
      transactionsToImport = transactionsToImport.reverse();
      return transactionsToImport;
   }

   this.getStatementCreationDate = function (transactions) {
      let dateClean = "";
      let dateTxt = transactions[1][1]; // ="27.02.2024"
      if (dateTxt.length > 0)
         dateClean = dateTxt;
      return dateClean;
   }

   this.mapTransaction = function (transaction, fileParams, statementParams) {
      let trDescription = transaction["Description"] + ", " + transaction["Type"];
      let trDate = transaction["Date"];
      let trIncome = transaction["Income"];
      let trExpenses = transaction["Expenses"];
      let trTexts = trDate + trIncome + trExpenses + trDescription;
      transaction = {
         'FileId': fileParams.FileId,
         'FileName': fileParams.FileName,
         'FileType': fileParams.FileType,
         'FileCreationDate': fileParams.FileCreationDate,
         'StatementIban': statementParams.StatementIban,
         'StatementCreationDate': statementParams.StatementCreationDate,
         'StatementOwner': statementParams.StatementOwner,
         'StatementCurrency': statementParams.StatementCurrency,
         'StatementInitialBalance': statementParams.StatementInitialBalance,
         'StatementFinalBalance': statementParams.StatementFinalBalance,
         'TransactionDate': Banana.Converter.toInternalDateFormat(trDate, "dd.mm.yyyy"),
         'TransactionDateValue': '',
         'TransactionDescription': '',
         'TransactionDescription': trDescription,
         'TransactionIncome': Banana.Converter.toInternalNumberFormat(trIncome, '.'),
         'TransactionExpenses': Banana.Converter.toInternalNumberFormat(Banana.SDecimal.abs(trExpenses), '.'),
         'TransactionExternalReference': getHash(trTexts, fileParams, statementParams),
         'TransactionContraAccount': '',
         'TransactionCc1': '',
         'TransactionCc2': '',
         'TransactionCc3': '',
         'TransactionIsDetail': ''
      };

      return transaction;
   }

}

/**
 * Credit Card format 1
 * Kartenkonto:;0000 1234 5467 7654
 * Karte:;XXXX XXXX XXXX 1111 PostFinance Visa Business Card
 * Datum;Buchungsdetails;Gutschrift in CHF;Lastschrift in CHF
 * 2023-08-24;"Tankstelle Marche        Brugg BE";;-94.70
 * 2023-08-21;"Tankstelle Marche        Brugg BE";;-114.05
 * 2023-08-10;"6131 STORNO JAHRESPREIS";80.00;
**/
function PFCSVFormat1_CreditCard() {

   this.colDate = 0;
   this.colDescr = 1;
   this.colCredit = 2;
   this.colDebit = 3;

   this.dateFormat = 'dd-mm-yyyy';

   /** Return true if the transactions match this format */
   this.match = function (transactions) {
      if (transactions.length === 0)
         return false;

      for (i = 0; i < transactions.length; i++) {
         var transaction = transactions[i];

         var formatMatched = false;
         if (transaction.length === this.colDebit + 1)
            formatMatched = true;
         else
            formatMatched = false;
         if (formatMatched && transaction[this.colDate].match(/[0-9]{2}(\-)[0-9]{2}(\-)[0-9]{4}/g)) {
            formatMatched = true;
         } else if (formatMatched && transaction[this.colDate].match(/[0-9]{4}(\-)[0-9]{2}(\-)[0-9]{2}/g)) {
            formatMatched = true;
            this.dateFormat = 'yyyy-mm-dd';
         } else {
            formatMatched = false;
         }

         if (formatMatched)
            return true;
      }

      return false;
   }

   this.getStatementParams = function (transactions) {
      /**
       * File params for this format are located in the first two rows of the document:
       * 1  Kartenkonto:;0000 1234 5467 7654
      *  2  Karte:;XXXX XXXX XXXX 1111 PostFinance Visa Business Card
      *  3  Datum;Buchungsdetails;Gutschrift in CHF;Lastschrift in CHF
      *  4  2023-08-24;"Tankstelle";;-94.70
      *  5  2023-08-21;"Tankstelle";;-114.05
      *  6 ....
      *  7 ....
      *  For some reasons, for this format the params are different, as it is an old format we
      *  currently can keep it like this, for the future, if it will be necessary we could manage various cases.
       */
      let statementParams = {};

      let iban = transactions[0][1];
      let statementCreationDate = "";
      let statementOwner = "";
      let statementCurrency = "";
      let initialBalance = "";
      let finalBalance = "";

      statementParams.StatementIban = iban.replace(/^=/, "");
      statementParams.StatementCreationDate = statementCreationDate;
      statementParams.StatementOwner = statementOwner;
      statementParams.StatementCurrency = statementCurrency.replace(/^=/, "");;
      statementParams.StatementInitialBalance = initialBalance;
      statementParams.StatementFinalBalance = finalBalance;

      return statementParams;
   }

   /** Convert the transaction to the format to be imported */
   this.getStatementTransactions = function (transactions, fileParams, statementParams) {
      var transactionsToImport = [];

      // Filter and map rows
      for (i = 0; i < transactions.length; i++) {
         var transaction = transactions[i];
         if (transaction.length < (this.colAmount + 1))
            continue;
         if (transaction[this.colDate] && transaction[this.colDate].match(/[0-9]{2,4}(\-)[0-9]{2}(\-)[0-9]{2,4}/g)
            && transaction[this.colDate].length == 10)
            transactionsToImport.push(this.mapTransaction(transaction, fileParams, statementParams));
      }
      transactionsToImport = transactionsToImport.reverse();
      return transactionsToImport;
   }


   this.mapTransaction = function (element, fileParams, statementParams) {
      var tidyDescr = element[this.colDescr].replace(/ {2,}/g, ''); //remove white spaces
      var crAmount = element[this.colCredit].replace(/-/g, ''); //remove minus sign
      var dbAmount = element[this.colDebit].replace(/-/g, ''); //remove minus sign
      let trDate = element[this.colDate];
      let trTexts = trDate + crAmount + dbAmount + tidyDescr;

      transaction = {
         'FileId': fileParams.FileId,
         'FileName': fileParams.FileName,
         'FileType': fileParams.FileType,
         'FileCreationDate': fileParams.FileCreationDate,
         'StatementIban': statementParams.StatementIban,
         'StatementCreationDate': statementParams.StatementCreationDate,
         'StatementOwner': statementParams.StatementOwner,
         'StatementCurrency': statementParams.StatementCurrency,
         'StatementInitialBalance': statementParams.StatementInitialBalance,
         'StatementFinalBalance': statementParams.StatementFinalBalance,
         'TransactionDate': Banana.Converter.toInternalDateFormat(trDate, this.dateFormat),
         'TransactionDateValue': '',
         'TransactionDocInvoice': '',
         'TransactionDescription': Banana.Converter.stringToCamelCase(tidyDescr),
         'TransactionIncome': Banana.Converter.toInternalNumberFormat(crAmount),
         'TransactionExpenses': Banana.Converter.toInternalNumberFormat(dbAmount),
         'TransactionExternalReference': getHash(trTexts, fileParams, statementParams),
         'TransactionContraAccount': '',
         'TransactionCc1': '',
         'TransactionCc2': '',
         'TransactionCc3': '',
         'TransactionIsDetail': ''
      };

      return transaction;
   }
}
/**
 * PFCSV Format 5
 * Example: pfcsv.#20230901
**/
function PFCSVFormat5() {

   this.colDate = 0;
   this.colMovType = 1;
   this.colDescr = 2;
   this.colCredit = 3;
   this.colDebit = 4;

   this.dateFormat = 'dd.mm.yyyy';

   /** Return true if the transactions match this format */
   this.match = function (transactions) {
      if (transactions.length === 0)
         return false;

      for (i = 0; i < transactions.length; i++) {
         var transaction = transactions[i];

         var formatMatched = false;
         if (transaction.length === this.colDebit + 1)
            formatMatched = true;
         else
            formatMatched = false;

         if (formatMatched && transaction[this.colDate].match(/[0-9]{2}(\.)[0-9]{2}(\.)[0-9]{2}/g)) {
            formatMatched = true;
         } else {
            formatMatched = false;
         }

         if (formatMatched)
            return true;
      }

      return false;
   }

   this.getStatementParams = function (transactions) {
      /**
       * File params for this format are located in the first rows of the document:
       * 1  Data dal:;="23.08.2023"
       * 2  Data fino al:;="30.08.2023"
       * 3  Tipo di registrazione:;="Tutti"
       * 4  Conto:;="CH5809000000652501224"
       * 5  Valuta:;="CHF"
       * 6  Data;Tipo di movimento;Testo di avviso;Accredito in CHF;Addebito in CHF
       * 7  ...
       */
      let statementParams = {};

      let iban = transactions[3][1];
      let statementCreationDate = this.getStatementCreationDate(transactions);
      let statementOwner = "";
      let statementCurrency = transactions[4][1];
      let initialBalance = "";
      let finalBalance = "";

      statementParams.StatementIban = iban.replace(/^=/, "");
      statementParams.statementCreationDate = statementCreationDate;
      statementParams.StatementOwner = statementOwner;
      statementParams.StatementCurrency = statementCurrency.replace(/^=/, "");;
      statementParams.StatementInitialBalance = initialBalance;
      statementParams.StatementFinalBalance = finalBalance;

      return statementParams;
   }

   /** Convert the transaction to the format to be imported */
   this.getStatementTransactions = function (transactions, fileParams, statementParams) {
      var transactionsToImport = [];

      // Filter and map rows
      for (i = 0; i < transactions.length; i++) {
         var transaction = transactions[i];
         if (transaction.length < (this.colAmount + 1))
            continue;
         if (transaction[this.colDate] && transaction[this.colDate].match(/[0-9]{2}(\.)[0-9]{2}(\.)[0-9]{4}/g) && transaction[this.colDate].length == 10)
            transactionsToImport.push(this.mapTransaction(transaction, fileParams, statementParams));
      }
      transactionsToImport = transactionsToImport.reverse();
      return transactionsToImport;
   }

   this.getStatementCreationDate = function (transactions) {
      let dateClean = "";
      let dateTxt = transactions[1][1]; // ="27.02.2024"
      if (dateTxt.length > 0)
         dateClean = dateTxt;
      return dateClean;
   }

   this.mapTransaction = function (element, fileParams, statementParams) {
      let tidyDescr = element[this.colDescr].replace(/ {2,}/g, ''); //remove white spaces
      let amountDebit = element[this.colDebit].replace(/-/g, ''); //remove minus sign
      let amountCredit = element[this.colCredit];
      let trDate = element[this.colDate];
      let trTexts = trDate + amountCredit + amountDebit + tidyDescr;

      transaction = {
         'FileId': fileParams.FileId,
         'FileName': fileParams.FileName,
         'FileType': fileParams.FileType,
         'FileCreationDate': fileParams.FileCreationDate,
         'StatementIban': statementParams.StatementIban,
         'StatementcreationDate': statementParams.statementCreationDate,
         'StatementOwner': statementParams.StatementOwner,
         'StatementCurrency': statementParams.StatementCurrency,
         'StatementInitialBalance': statementParams.StatementInitialBalance,
         'StatementFinalBalance': statementParams.StatementFinalBalance,
         'TransactionDate': Banana.Converter.toInternalDateFormat(trDate, this.dateFormat),
         'TransactionDateValue': '',
         'TransactionDocInvoice': '',
         'TransactionDescription': Banana.Converter.stringToCamelCase(tidyDescr),
         'TransactionIncome': Banana.Converter.toInternalNumberFormat(amountCredit),
         'TransactionExpenses': Banana.Converter.toInternalNumberFormat(amountDebit),
         'TransactionExternalReference': getHash(trTexts, fileParams, statementParams),
         'TransactionContraAccount': '',
         'TransactionCc1': '',
         'TransactionCc2': '',
         'TransactionCc3': '',
         'TransactionIsDetail': ''
      };

      return transaction;
   }
}

/**
 * PFCSV Format 4
 * Example: pfcsv.#20230509
 * Fœnum porto natio:;0000 8003 3386 9363
 * Natio:;LIAM LIAM LIAM 5526 PecuLeverba Aturaequat Cocet Voluna
 * Tuundit nostinsan:;06.04.2022 - 05.05.2022
 * Data;Denominazione;Accredito in CHF;Addebito in CHF;Importo in CHF
 * 2022-05-04;"ARTION *PRATIUNDICO      52163467544  XXX";;52.00;
 * 2022-05-04;"1.7% SUPPL. CHF ALL'ESTERO";;0.88;
 * 2022-05-04;"ARTION *EXPECT CUNT      1324126664   NOS";;21.93;
 * 2022-05-03;"ARTION *EXPECT CUNT      1324126664   NOS";;11.11;
 * 2022-05-03;"ARTION *MENTIO SET       1324126664   STO";;15.00;
 * 2022-05-03;"1.7% SUPPL. CHF ALL'ESTERO";;0.26;
 * 2022-05-02;"PATTINDE NATHOC FŒNUM NATIO";300.00;;
 * 2022-05-01;"ARATIMOTE PATUBIT        MODO CONDE MONCH NIS 0.56 Effect 8.1480 ost 37.77.6604 TER 0.62 8.52% de todivispect cor pasus fertumquobsemo TER 0.77";;8.44;
**/
function PFCSVFormat4() {

   this.colDate = 0;
   this.colDescr = 1;
   this.colCredit = 2;
   this.colDebit = 3;
   this.colAmount = 4;

   this.dateFormat = 'dd-mm-yyyy';

   /** Return true if the transactions match this format */
   this.match = function (transactions) {
      if (transactions.length === 0)
         return false;

      for (i = 0; i < transactions.length; i++) {
         var transaction = transactions[i];

         var formatMatched = false;
         if (transaction.length === this.colAmount + 1)
            formatMatched = true;
         else
            formatMatched = false;
         if (formatMatched && transaction[this.colDate].match(/[0-9]{2}(\-)[0-9]{2}(\-)[0-9]{4}/g)) {
            formatMatched = true;
         } else if (formatMatched && transaction[this.colDate].match(/[0-9]{4}(\-)[0-9]{2}(\-)[0-9]{2}/g)) {
            formatMatched = true;
            this.dateFormat = 'yyyy-mm-dd';
         } else {
            formatMatched = false;
         }

         if (formatMatched)
            return true;
      }

      return false;
   }

   this.getStatementParams = function (transactions) {
      /**
       * File params for this format are located in the first three rows of the document:
       * 1  Conto della carta:;0000 8003 3386 9363
       * 2  Carta:;XXXX XXXX XXXX 6953 PostFinance Mastercard Value Design
       * 3  Periodo contabile:;06.04.2022 - 05.05.2022
       * 4  Data;Denominazione;Accredito in CHF;Addebito in CHF;Importo in CHF
       * 5  2022-05-04;"ARTION *PRATIUNDICO      52163467544  XXX";;52.00;
       */
      let statementParams = {};

      let iban = transactions[0][1];
      let statementCreationDate = this.getStatementCreationDate(transactions);
      let statementOwner = "";
      let statementCurrency = ""; // recuperarla dalle intestazioni ?
      let initialBalance = "";
      let finalBalance = "";

      statementParams.StatementIban = iban.replace(/^=/, "");
      statementParams.StatementCreationDate = statementCreationDate;
      statementParams.StatementOwner = statementOwner;
      statementParams.StatementCurrency = statementCurrency.replace(/^=/, "");;
      statementParams.StatementInitialBalance = initialBalance;
      statementParams.StatementFinalBalance = finalBalance;

      return statementParams;
   }

   /** Convert the transaction to the format to be imported */
   this.getStatementTransactions = function (transactions, fileParams, statementParams) {
      var transactionsToImport = [];

      // Filter and map rows
      for (i = 0; i < transactions.length; i++) {
         var transaction = transactions[i];
         if (transaction.length < (this.colAmount + 1))
            continue;
         if (transaction[this.colDate].match(/[0-9]{2,4}(\-)[0-9]{2}(\-)[0-9]{2,4}/g) && transaction[this.colDate].length == 10)
            transactionsToImport.push(this.mapTransaction(transaction, fileParams, statementParams));
      }
      transactionsToImport = transactionsToImport.reverse();
      return transactionsToImport;
   }

   this.getStatementCreationDate = function (transactions) {
      let dateClean = "";
      let dateTxt = transactions[2][1]; // 06.04.2022 - 05.05.2022
      let dates = dateTxt.split(' - ');  // Divide la stringa in un array usando ' - ' come delimitatore
      if (dates[1].length > 0)
         dateClean = dates[1];
      return formatCreationStatementDate(dateClean);
   }


   this.mapTransaction = function (element, fileParams, statementParams) {
      var tidyDescr = element[this.colDescr].replace(/ {2,}/g, ''); //remove white spaces
      var crAmount = element[this.colCredit].replace(/-/g, ''); //remove minus sign
      var dbAmount = element[this.colDebit].replace(/-/g, ''); //remove minus sign
      let trDate = element[this.colDate];
      let trTexts = trDate + crAmount + dbAmount + tidyDescr;

      transaction = {
         'FileId': fileParams.FileId,
         'FileName': fileParams.FileName,
         'FileType': fileParams.FileType,
         'FileCreationDate': fileParams.FileCreationDate,
         'StatementIban': statementParams.StatementIban,
         'StatementCreationDate': statementParams.StatementCreationDate,
         'StatementOwner': statementParams.StatementOwner,
         'StatementCurrency': statementParams.StatementCurrency,
         'StatementInitialBalance': statementParams.StatementInitialBalance,
         'StatementFinalBalance': statementParams.StatementFinalBalance,
         'TransactionDate': Banana.Converter.toInternalDateFormat(trDate, this.dateFormat),
         'TransactionDateValue': '',
         'TransactionDocInvoice': '',
         'TransactionDescription': Banana.Converter.stringToCamelCase(tidyDescr),
         'TransactionIncome': Banana.Converter.toInternalNumberFormat(crAmount),
         'TransactionExpenses': Banana.Converter.toInternalNumberFormat(dbAmount),
         'TransactionExternalReference': getHash(trTexts, fileParams, statementParams),
         'TransactionContraAccount': '',
         'TransactionCc1': '',
         'TransactionCc2': '',
         'TransactionCc3': '',
         'TransactionIsDetail': ''
      };

      return transaction;
   }
}

/**
 * PFCSV Format 3
 * Example: pfcsv.#20101031
 * BookingDate;BookingText;Details;ValutaDate;DebitAmount;CreditAmount;Balance
 * 31.10.2010;FÜR DAS ONLINE-SET SEPTEMBER XXXX;;31.10.2010;;0.00;5831.73
 * 29.10.2010;E-FINANCE XXX;1;29.10.2010;-45.00;;5831.73
 * 29.10.2010;E-FINANCE XXX;1;29.10.2010;-131.55;;
 * Example: pfcsv.#20131231
 * Buchung;Buchungstext;Details;Valuta;Belastung;Gutschrift;Saldo;Kategorie;Familienmitglied;Kommentar
 * "31.12.2013";"ZINSABSCHLUSS 010113 - 311213";"";"31.12.2013";"-0.15";"";"2549.30";"";"";""
 * "24.12.2013";"KAUF/DIENSTLEISTUNG
 * VOM 23.12.2013
 * KARTEN NR. 82770597
 * CUCINA PERO AG
 * WƒDENSWIL";"1";"23.12.2013";"-124.00";"";"2549.45";"";"";""
**/
function PFCSVFormat3() {

   this.colDate = 0;
   this.colDescr = 1;
   this.colDateValuta = 3;
   this.colDebit = 4;
   this.colCredit = 5;
   this.colBalance = 6;
   this.colComment = 9;

   /** Return true if the transactions match this format */
   this.match = function (transactions) {
      if (transactions.length === 0)
         return false;

      for (i = 0; i < transactions.length; i++) {
         var transaction = transactions[i];

         var formatMatched = false;
         if (transaction.length === (this.colBalance + 1) ||
            transaction.length === (this.colComment + 1))
            formatMatched = true;
         else
            formatMatched = false;

         if (formatMatched && transaction[this.colDate].match(/[0-9]{2,4}(\.|-)[0-9]{2}(\.|-)[0-9]{2,4}/g) &&
            transaction[this.colDate].length === 10)
            formatMatched = true;
         else
            formatMatched = false;

         if (formatMatched && transaction[this.colDateValuta].match(/[0-9]{2,4}(\.|-)[0-9]{2}(\.|-)[0-9]{2,4}/g) &&
            transaction[this.colDateValuta].length === 10)
            formatMatched = true;
         else
            formatMatched = false;

         if (formatMatched)
            return true;
      }

      return false;
   }

   this.getStatementParams = function () {
      /**
       * File params for this format are not present...
       */
      let statementParams = {};

      let iban = "";
      let statementCreationDate = "";
      let statementOwner = "";
      let statementCurrency = "";
      let initialBalance = "";
      let finalBalance = "";

      statementParams.StatementIban = iban.replace(/^=/, "");
      statementParams.StatementCreationDate = statementCreationDate
      statementParams.StatementOwner = statementOwner;
      statementParams.StatementCurrency = statementCurrency.replace(/^=/, "");;
      statementParams.StatementInitialBalance = initialBalance;
      statementParams.StatementFinalBalance = finalBalance;

      return statementParams;
   }

   /** Convert the transaction to the format to be imported */
   this.getStatementTransactions = function (transactions, fileParams, statementParams) {
      var transactionsToImport = [];

      // Filter and map rows
      for (i = 0; i < transactions.length; i++) {
         var transaction = transactions[i];
         if (transaction.length < (this.colBalance + 1))
            continue;
         if (transaction[this.colDate].match(/[0-9]{2,4}(\.|-)[0-9]{2}(\.|-)[0-9]{2,4}/g) && transaction[this.colDate].length == 10 &&
            transaction[this.colDateValuta].match(/[0-9]{2,4}(\.|-)[0-9]{2}(\.|-)[0-9]{2,4}/g) && transaction[this.colDateValuta].length == 10)
            transactionsToImport.push(this.mapTransaction(transaction, fileParams, statementParams));
      }
      transactionsToImport = transactionsToImport.reverse();
      return transactionsToImport;
   }


   this.mapTransaction = function (element, fileParams, statementParams) {
      var tidyDescr = element[this.colDescr].replace(/ {2,}/g, ''); //remove white spaces
      var crAmount = element[this.colCredit].replace(/-/g, ''); //remove minus sign
      var dbAmount = element[this.colDebit].replace(/-/g, ''); //remove minus sign
      let trDate = element[this.colDate];
      let trDateValuta = element[this.colDateValuta];
      let trTexts = trDate + trDateValuta + crAmount + dbAmount + tidyDescr;

      transaction = {
         'FileId': fileParams.FileId,
         'FileName': fileParams.FileName,
         'FileType': fileParams.FileType,
         'FileCreationDate': fileParams.FileCreationDate,
         'StatementIban': statementParams.StatementIban,
         'StatementCreationDate': statementParams.StatementCreationDate,
         'StatementOwner': statementParams.StatementOwner,
         'StatementCurrency': statementParams.StatementCurrency,
         'StatementInitialBalance': statementParams.StatementInitialBalance,
         'StatementFinalBalance': statementParams.StatementFinalBalance,
         'TransactionDate': Banana.Converter.toInternalDateFormat(trDate, 'dd-mm-yyyy'),
         'TransactionDateValue': Banana.Converter.toInternalDateFormat(trDateValuta, 'dd-mm-yyyy'),
         'TransactionDocInvoice': '',
         'TransactionDescription': Banana.Converter.stringToCamelCase(tidyDescr),
         'TransactionIncome': Banana.Converter.toInternalNumberFormat(crAmount),
         'TransactionExpenses': Banana.Converter.toInternalNumberFormat(dbAmount),
         'TransactionExternalReference': getHash(trTexts, fileParams, statementParams),
         'TransactionContraAccount': '',
         'TransactionCc1': '',
         'TransactionCc2': '',
         'TransactionCc3': '',
         'TransactionIsDetail': ''
      };

      return transaction;
   }
}

/**
 * PFCSV Format 2
 * Example: pfcsv.#private20090401
 * Example: pfcsv.#private20090401
 * Data	Testo d'avviso	Accredito	Addebito	Data della valuta	Saldo	
 * 20090401	/t ACQUISTO/SERVIZIO DEL XX.XX.XXXX  CARTA N. XXX	/t99.9	/t20090331	/t			/t
 * 20090331	/t ORDINE DEBIT DIRECT NUMERO CLIENTE XXX			/t85.9	/t20090331	/t7881.35	/t
 * 20090330	/t ACQUISTO/SERVIZIO DEL XX.XX.XXXX  CARTA N. XXX	/t43	/t20090328	/t7967.25	/t
 *
 *
**/
function PFCSVFormat2() {

   this.colDate = 0;
   this.colDescr = 1;
   this.colCredit = 2;
   this.colDebit = 3;
   this.colDateValuta = 4;
   this.colBalance = 5;

   /** Return true if the transactions match this format */
   this.match = function (transactions) {
      if (transactions.length === 0)
         return false;

      for (i = 0; i < transactions.length; i++) {
         var transaction = transactions[i];

         var formatMatched = false;
         if (transaction.length === (this.colBalance + 2))
            formatMatched = true;
         else
            formatMatched = false;

         if (formatMatched && transaction[this.colDate].match(/[0-9]{6}/g)
            && transaction[this.colDate].length === 8)
            formatMatched = true;

         if (formatMatched && transaction[this.colDateValuta].match(/[0-9]{6}/g) &&
            transaction[this.colDateValuta].length == 8)
            formatMatched = true;
         else
            formatMatched = false;

         if (formatMatched)
            return true;
      }

      return false;
   }

   this.getStatementParams = function () {
      /**
       * File params for this format are not present...
       */
      let statementParams = {};

      let iban = "";
      let statementCreationDate = "";
      let statementOwner = "";
      let statementCurrency = "";
      let initialBalance = "";
      let finalBalance = "";

      statementParams.StatementIban = iban.replace(/^=/, "");
      statementParams.StatementCreationDate = statementCreationDate;
      statementParams.StatementOwner = statementOwner;
      statementParams.StatementCurrency = statementCurrency.replace(/^=/, "");;
      statementParams.StatementInitialBalance = initialBalance;
      statementParams.StatementFinalBalance = finalBalance;

      return statementParams;
   }

   /** Convert the transaction to the format to be imported */
   this.getStatementTransactions = function (transactions, fileParams, statementParams) {
      var transactionsToImport = [];

      // Filter and map rows
      for (i = 0; i < transactions.length; i++) {
         var transaction = transactions[i];
         if (transaction.length < (this.colBalance + 1))
            continue;
         if (transaction[this.colDate].match(/[0-9]+/g) && transaction[this.colDate].length == 8 &&
            transaction[this.colDateValuta].match(/[0-9]+/g) && transaction[this.colDateValuta].length == 8)
            transactionsToImport.push(this.mapTransaction(transaction, fileParams, statementParams));
      }
      transactionsToImport = transactionsToImport.reverse();
      return transactionsToImport;
   }


   this.mapTransaction = function (element, fileParams, statementParams) {
      var tidyDescr = element[this.colDescr].replace(/ {2,}/g, ' '); //remove white spaces
      var crAmount = element[this.colCredit].replace(/-/g, ''); //remove minus sign
      var dbAmount = element[this.colDebit].replace(/-/g, ''); //remove minus sign
      let trDate = element[this.colDate];
      let trDateValuta = element[this.colDateValuta];
      let trTexts = trDate + trDateValuta + crAmount + dbAmount + tidyDescr;

      transaction = {
         'FileId': fileParams.FileId,
         'FileName': fileParams.FileName,
         'FileType': fileParams.FileType,
         'FileCreationDate': fileParams.FileCreationDate,
         'StatementIban': statementParams.StatementIban,
         'StatementCreationDate': statementParams.statementCreationDate,
         'StatementOwner': statementParams.StatementOwner,
         'StatementCurrency': statementParams.StatementCurrency,
         'StatementInitialBalance': statementParams.StatementInitialBalance,
         'StatementFinalBalance': statementParams.StatementFinalBalance,
         'TransactionDate': trDate,
         'TransactionDateValue': trDateValuta,
         'TransactionDocInvoice': '',
         'TransactionDescription': Banana.Converter.stringToCamelCase(tidyDescr),
         'TransactionIncome': Banana.Converter.toInternalNumberFormat(crAmount),
         'TransactionExpenses': Banana.Converter.toInternalNumberFormat(dbAmount),
         'TransactionExternalReference': getHash(trTexts, fileParams, statementParams),
         'TransactionContraAccount': '',
         'TransactionCc1': '',
         'TransactionCc2': '',
         'TransactionCc3': '',
         'TransactionIsDetail': ''
      };

      return transaction;
   }
}

/**
 * PFCSV Format 1
 * Example: pfcsv.#20030903-B
 * Example: pfcsv.#20121101-B
 * Example: pfcsv.#20160707
 * Data;Descrizione della transazione;Accreditamento;Debito;Valuta;Saldo
 * 31.08.2003;Saldo;;;;50078.40
 * 01.09.2003;"YELLOWNET SAMMELAUFTRAG NR. X,YELLOWNET NUMMER XXXXXX";;-28.60;01.09.2003;50049.80
 * 01.09.2003;"AUFTRAG DEBIT DIRECT,AUFTRAGSNUMMER X,KUNDENNUMMER XXXX";26.80;;01.09.2003;50076.60
**/

function PFCSVFormat1() {

   this.colDate = 0;
   this.colDescr = 1;
   this.colCredit = 2;
   this.colDebit = 3;
   this.colDateValuta = 4;
   this.colBalance = 5;

   this.dateFormat = 'dd-mm-yyyy';
   this.decimalSeparator = '.';


   /** Return true if the transactions match this format */
   this.match = function (transactions) {
      if (transactions.length === 0)
         return false;

      for (i = 0; i < transactions.length; i++) {
         var transaction = transactions[i];

         var formatMatched = false;
         if (transaction.length === (this.colBalance + 1) || transaction.length === (this.colBalance + 2))
            formatMatched = true;
         else
            formatMatched = false;

         if (formatMatched && transaction[this.colDate].match(/[0-9]{2}(\.)[0-9]{2}(\.)[0-9]{2}/g)) {
            this.dateFormat = 'dd.mm.yy';
            formatMatched = true;
         } else if (formatMatched && transaction[this.colDate].match(/[0-9]{2}(\.|-)[0-9]{2}(\.|-)[0-9]{4}/g)) {
            formatMatched = true;
         } else if (formatMatched && transaction[this.colDate].match(/[0-9]{4}(\.|-)[0-9]{2}(\.|-)[0-9]{2}/g)) {
            formatMatched = true;
            this.dateFormat = 'yyyy-mm-dd';
         } else {
            formatMatched = false;
         }

         if (formatMatched && transaction[this.colDateValuta].match(/[0-9]{2,4}(\.|-)[0-9]{2}(\.|-)[0-9]{2,4}/g))
            formatMatched = true;
         else
            formatMatched = false;

         if (formatMatched)
            return true;
      }

      return false;
   }

   this.getStatementParams = function (transactions) {
      /**
       * File params for this format are located in the secont and third row of the document:
       * 1  Tipo di registrazione:;Tutte le registrazioni
       * 2  Conto :;CH5809000000652501224
       * 3  Valuta del conto:;CHF
       * 4  Data di contabilizzazione;Testo d'avviso;Accredito;Addebito;Valuta;Saldo;
       * 5  ....
       * 6  ....
       */
      let statementParams = {};

      let iban = transactions[1][1];
      if (iban)
         iban = iban.replace(/^=/, "");
      let statementCreationDate = "";
      let statementOwner = "";
      let statementCurrency = transactions[2][1];
      let initialBalance = "";
      let finalBalance = "";

      statementParams.StatementIban = iban;
      statementParams.StatementCreationDate = statementCreationDate;
      statementParams.StatementOwner = statementOwner;
      statementParams.StatementCurrency = statementCurrency.replace(/^=/, "");;
      statementParams.StatementInitialBalance = initialBalance;
      statementParams.StatementFinalBalance = finalBalance;

      return statementParams;
   }

   /** Convert the transaction to the format to be imported */
   this.getStatementTransactions = function (transactions, fileParams, statementParams) {
      var transactionsToImport = [];

      // Filter and map rows
      for (i = 0; i < transactions.length; i++) {
         var transaction = transactions[i];
         if (transaction.length < (this.colBalance + 1))
            continue;
         if (transaction[this.colDate].match(/[0-9\.]{3}/g) && transaction[this.colDateValuta].match(/[0-9\.]{3}/g))
            transactionsToImport.push(this.mapTransaction(transaction, fileParams, statementParams));
      }
      transactionsToImport = transactionsToImport.reverse();
      return transactionsToImport;
   }

   this.mapTransaction = function (element, fileParams, statementParams) {
      var tidyDescr = element[this.colDescr].replace(/ {2,}/g, ''); // remove white spaces
      var crAmount = element[this.colCredit].replace(/\+/g, ''); // remove plus sign
      var dbAmount = element[this.colDebit].replace(/-/g, ''); // remove minus sign
      let trDate = element[this.colDate];
      let trDateValuta = element[this.colDateValuta];
      let trTexts = trDate + trDateValuta + crAmount + dbAmount + tidyDescr;

      transaction = {
         'FileId': fileParams.FileId,
         'FileName': fileParams.FileName,
         'FileType': fileParams.FileType,
         'FileCreationDate': fileParams.FileCreationDate,
         'StatementIban': statementParams.StatementIban,
         'StatementCreationDate': statementParams.StatementCreationDate,
         'StatementOwner': statementParams.StatementOwner,
         'StatementCurrency': statementParams.StatementCurrency,
         'StatementInitialBalance': statementParams.StatementInitialBalance,
         'StatementFinalBalance': statementParams.StatementFinalBalance,
         'TransactionDate': Banana.Converter.toInternalDateFormat(trDate, this.dateFormat),
         'TransactionDateValue': Banana.Converter.toInternalDateFormat(trDateValuta, this.dateFormat),
         'TransactionDocInvoice': '',
         'TransactionDescription': Banana.Converter.stringToCamelCase(tidyDescr),
         'TransactionIncome': Banana.Converter.toInternalNumberFormat(crAmount, this.decimalSeparator),
         'TransactionExpenses': Banana.Converter.toInternalNumberFormat(dbAmount, this.decimalSeparator),
         'TransactionExternalReference': getHash(trTexts, fileParams, statementParams),
         'TransactionContraAccount': '',
         'TransactionCc1': '',
         'TransactionCc2': '',
         'TransactionCc3': '',
         'TransactionIsDetail': ''
      };

      return transaction;
   }
}

/**
 * The function findSeparator is used to find the field separator.
 */
function findSeparator(string) {

   var commaCount = 0;
   var semicolonCount = 0;
   var tabCount = 0;

   for (var i = 0; i < 1000 && i < string.length; i++) {
      var c = string[i];
      if (c === ',')
         commaCount++;
      else if (c === ';')
         semicolonCount++;
      else if (c === '\t')
         tabCount++;
   }

   if (tabCount > commaCount && tabCount > semicolonCount) {
      return '\t';
   }
   else if (semicolonCount > commaCount) {
      return ';';
   }

   return ',';
}

/**
 * PFCSV Smart Business Format 1
 * Example: pfcsv.#20180220-SBU
 * "client_name";"paid_date";"paid_amount"
 * "Schaub Thomas";"21.02.2018";"100.00"
 * "Prins Carla";"20.02.2018";"150.00"
 * "Mario Wlotzka";"15.02.2018";"960.00"
**/

function PFCSVFormatSBU1() {

   this.colDate = 1;
   this.colDescr = 0;
   this.colCredit = 2;

   this.dateFormat = 'dd.mm.yyyy';
   this.decimalSeparator = '.';

   /** Return true if the transactions match this format */
   this.match = function (transactions) {
      if (transactions.length === 0)
         return false;

      for (i = 0; i < transactions.length; i++) {
         var transaction = transactions[i];

         var formatMatched = false;
         if (transaction.length === (this.colCredit + 1))
            formatMatched = true;
         else
            formatMatched = false;

         if (formatMatched && transaction[this.colDate].match(/[0-9]{2}(\.|-)[0-9]{2}(\.|-)[0-9]{4}/g)) {
            formatMatched = true;
         } else {
            formatMatched = false;
         }

         if (formatMatched)
            return true;
      }

      return false;
   }

   this.getStatementParams = function (transactions) {
      /**
       * File params for this format are not present...
       */

      let statementParams = {};

      let iban = "";
      let id = ""; // Sobstitute to the IBAN, we use this only if the IBAN is not present.
      let statementCreationDate = "";
      let statementOwner = "";
      let statementCurrency = ""; // recuperarla dalle intestazioni ?
      let initialBalance = "";
      let finalBalance = "";

      statementParams.StatementIban = iban.replace(/^=/, "");
      statementParams.StatementCreationDate = statementCreationDate;
      statementParams.StatementOwner = statementOwner;
      statementParams.StatementCurrency = statementCurrency.replace(/^=/, "");;
      statementParams.StatementInitialBalance = initialBalance;
      statementParams.StatementFinalBalance = finalBalance;

      return statementParams;
   }


   /** Convert the transaction to the format to be imported */
   this.getStatementTransactions = function (transactions, fileParams, statementParams) {
      var transactionsToImport = [];

      // Filter and map rows
      for (var i = 0; i < transactions.length; i++) {
         var transaction = transactions[i];
         if (transaction.length < this.colCredit)
            continue;
         if (transaction[this.colDate].match(/[0-9\.]{3}/g))
            transactionsToImport.push(this.mapTransaction(transaction, fileParams, statementParams));
      }
      transactionsToImport = transactionsToImport.reverse();
      return transactionsToImport;
   }

   this.mapTransaction = function (element, fileParams, statementParams) {
      var trDescr = element[this.colDescr];
      var crAmount = element[this.colCredit];
      let trDate = element[this.colDate];
      let trTexts = trDate + crAmount + trDescr;

      transaction = {
         'FileId': fileParams.FileId,
         'FileName': fileParams.FileName,
         'FileType': fileParams.FileType,
         'FileCreationDate': fileParams.FileCreationDate,
         'StatementIban': statementParams.StatementIban,
         'StatementCreationDate': statementParams.statementCreationDate,
         'StatementOwner': statementParams.StatementOwner,
         'StatementCurrency': statementParams.StatementCurrency,
         'StatementInitialBalance': statementParams.StatementInitialBalance,
         'StatementFinalBalance': statementParams.StatementFinalBalance,
         'TransactionDate': Banana.Converter.toInternalDateFormat(trDate, this.dateFormat),
         'TransactionDateValue': '',
         'TransactionDocInvoice': '',
         'TransactionDescription': trDescr,
         'TransactionIncome': Banana.Converter.toInternalNumberFormat(crAmount, this.decimalSeparator),
         'TransactionExpenses': '',
         'TransactionExternalReference': getHash(trTexts, fileParams, statementParams),
         'TransactionContraAccount': '',
         'TransactionCc1': '',
         'TransactionCc2': '',
         'TransactionCc3': '',
         'TransactionIsDetail': ''
      };

      return transaction;
   }
}

/**
 * The function findSeparator is used to find the field separator.
 */
function findSeparator(string) {

   var commaCount = 0;
   var semicolonCount = 0;
   var tabCount = 0;

   for (var i = 0; i < 1000 && i < string.length; i++) {
      var c = string[i];
      if (c === ',')
         commaCount++;
      else if (c === ';')
         semicolonCount++;
      else if (c === '\t')
         tabCount++;
   }

   if (tabCount > commaCount && tabCount > semicolonCount) {
      return '\t';
   }
   else if (semicolonCount > commaCount) {
      return ';';
   }

   return ',';
}
/**
 * Pulisce il testo dai doppi a capo, con la versione 6 del formato csv, per qualche motivo quando il file .csv
 * viene aperto su windows vengono aggiunti degli a capo aggiuntivi (uno o più).
 * Ogni riga dovrebbe contenere un "\r\n" non di più, anche quelle vuote.
 */
function clearText(text) {
   // Sostituisce tutte le occorrenze multiple di "\r\r\n" con un singolo "\r\n"
   return text.replace(/\r\r\n/g, "\r\n");
}

function getHash(entryTexts, fileParams, statementParams) {

   let entryId = "";
   let textToHash = entryTexts +
      fileParams.filaName +
      fileParams.FileType +
      fileParams.FileCreationDate +
      statementParams +
      statementParams.StatementIban +
      statementParams.statementCreationDate +
      statementParams.StatementOwner +
      statementParams.StatementIban +
      statementParams.StatementCurrency +
      statementParams.StatementInitialBalance +
      statementParams.StatementFinalBalance;

   entryId = Banana.Converter.textToHash(textToHash, "Sha256");

   //Banana.console.debug(textToHash + " / " + entryId);

   return entryId;

}

function formatCreationStatementDate(dateString) {
   let date = new Date(dateString);

   //Get the date.
   let year = date.getFullYear();
   let month = (date.getMonth() + 1).toString().padStart(2, '0');
   let day = date.getDate().toString().padStart(2, '0');
   let formattedDate = year + "-" + month + "-" + day;
   // Do we need also the time... ?

   return formattedDate;
}

