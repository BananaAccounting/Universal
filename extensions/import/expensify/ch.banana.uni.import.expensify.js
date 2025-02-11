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

// @id = ch.banana.uni.import.expensify
// @api = 1.0
// @pubdate = 2025-02-04
// @publisher = Banana.ch SA
// @description = Expensify - Import movements .csv (Banana+ Advanced)
// @description.it = Expensify - Importa movimenti .csv (Banana+ Advanced)
// @description.en = Expensify - Import movements .csv (Banana+ Advanced)
// @description.de = Expensify - Bewegungen importieren .csv (Banana+ Advanced)
// @description.fr = Expensify - Importer mouvements .csv (Banana+ Advanced)
// @doctype = *
// @docproperties =
// @task = import.transactions
// @outputformat = transactions.simple
// @inputdatasource = openfiledialog
// @inputencoding = latin1
// @inputfilefilter = Text files (*.txt *.csv);;All files (*.*)
// @inputfilefilter.de = Text (*.txt *.csv);;Alle Dateien (*.*)
// @inputfilefilter.fr = Texte (*.txt *.csv);;Tous (*.*)
// @inputfilefilter.it = Testo (*.txt *.csv);;Tutti i files (*.*)
// @timeout = -1
// @includejs = import.utilities.js

/**
 * Parse the data and return the data to be imported as a tab separated file.
 */
function exec(string, isTest) {

    var importUtilities = new ImportUtilities(Banana.document);
 
    if (isTest !== true && !importUtilities.verifyBananaAdvancedVersion())
       return "";
 
    let convertionParam = defineConversionParam(string);
 
    var transactions = Banana.Converter.csvToArray(string, convertionParam.separator, '"'); 
    
    let transactionsData = getFormattedData(transactions, convertionParam, importUtilities);
    
    // Expensify Format, this format works with the header names.
    var expensifyFormat = new ExpensifyFormat();
    if (expensifyFormat.match(transactionsData)) {
       transactions = expensifyFormat.convert(transactionsData);
       return Banana.Converter.arrayToTsv(transactions);
    }
 
    // Format is unknow, return an error
    importUtilities.getUnknownFormatError();
 
    return "";
 }
 
 /**
  * Expensify Format
  *
  * 
 */
 function ExpensifyFormat() {
 
    /** Return true if the transactions match this format */
    this.match = function (transactionsData) {
       if (transactionsData.length === 0)
          return false;
 
       for (var i = 0; i < transactionsData.length; i++) {
          var transaction = transactionsData[i];
          var formatMatched = true;
 
          if (formatMatched && transaction["Date"] && transaction["Date"].length >= 19 &&
             transaction["Date"].match(/^[0-9]+\-[0-9]+\-[0-9]+\s[0-9]+\:[0-9]+\:[0-9]+$/))
             formatMatched = true;
          else
             formatMatched = false;
 
          if (formatMatched)
             return true;
       }
 
       return false;
    }
 
    this.convert = function (transactionsData) {
       var transactionsToImport = [];
 
       for (var i = 0; i < transactionsData.length; i++) {
          if (transactionsData[i]["Date"] && transactionsData[i]["Date"].length >= 19 &&
             transactionsData[i]["Date"].match(/^[0-9]+\-[0-9]+\-[0-9]+\s[0-9]+\:[0-9]+\:[0-9]+$/)) {
             transactionsToImport.push(this.mapTransaction(transactionsData[i]));
          }
       }
 
       // Sort rows by date
       transactionsToImport = transactionsToImport.reverse();
 
       // Add header and return
       var header = [["Date", "DateValue", "Doc", "ExternalReference", "Description", "Notes", "Income", "Expenses"]];
       return header.concat(transactionsToImport);
    }
 
    this.mapTransaction = function (transaction) {
        let mappedLine = [];
    
        mappedLine.push(Banana.Converter.toInternalDateFormat(transaction["Date"].substring(0, 10), "yyyy.mm.dd"));
        mappedLine.push(Banana.Converter.toInternalDateFormat("", "yyyy.mm.dd"));
        mappedLine.push("");
        mappedLine.push("");
        mappedLine.push(transaction["Description"] + ', ' + transaction["Category"]);
        mappedLine.push("");
        mappedLine.push(Banana.Converter.toInternalNumberFormat("", '.'));
        mappedLine.push(Banana.Converter.toInternalNumberFormat(transaction["Amount"], '.'));
        
        return mappedLine;
    }
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
 
 function getFormattedData(inData, convertionParam, importUtilities) {
    var columns = importUtilities.getHeaderData(inData, convertionParam.headerLineStart); //array
    var rows = importUtilities.getRowData(inData, convertionParam.dataLineStart); //array of array
    let form = [];
    
    let convertedColumns = [];

    convertedColumns = convertHeaderDe(columns);
    if (convertedColumns.length > 0) {
        importUtilities.loadForm(form, convertedColumns, rows);
        return form;
    }

    return [];
 }

 function convertHeaderDe(columns) {
    let convertedColumns = [];
 
    for (var i = 0; i < columns.length; i++) {
        switch (columns[i]) {
            case "Zeitstempel":
                convertedColumns[i] = "Date";
                break;
            case "Händler":
                convertedColumns[i] = "Retailer";
                break;
            case "Betrag":
                convertedColumns[i] = "Amount";
                break;  
            case "Kundencenter":
                convertedColumns[i] = "Customer Center";
                break; 
            case "Kategorie":
                convertedColumns[i] = "Category";
                break;
            case "Tag":
                convertedColumns[i] = "Day";
                break;
            case "Beschreibung":
                convertedColumns[i] = "Description";
                break;
            case "Erstattungsfähig":
                convertedColumns[i] = "Refundable";
                break;
            case "Original Währung":
                convertedColumns[i] = "Original Currency";
                break;
            case "Original Quittung":
                convertedColumns[i] = "Original Receipt";
                break;
            case "Quittung":
                convertedColumns[i] = "Receipt";
                break;
            case "Teilnehmer":
                convertedColumns[i] = "Participant";
                break;
            default:
                break;
        }
    }
 
    if (convertedColumns.indexOf("Date") < 0) {
       return [];
    }
 
    return convertedColumns;
 }