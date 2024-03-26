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

// @id = ch.banana.uni.import.lightspeed
// @api = 1.0
// @pubdate = 2024-03-25
// @publisher = Banana.ch SA
// @description = Lightspeed - Import movements .csv (Banana+ Advanced)
// @description.it = Lightspeed - Importa movimenti .csv (Banana+ Advanced)
// @description.en = Lightspeed - Import movements .csv (Banana+ Advanced)
// @description.de = Lightspeed - Bewegungen importieren .csv (Banana+ Advanced)
// @description.fr = Lightspeed - Importer mouvements .csv (Banana+ Advanced)
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
 
    //If the file contains double quotations marks, remove them
    var cleanString = string;
    if (cleanString.match(/""/)) {
       cleanString = cleanString.replace(/^"/mg, "");
       cleanString = cleanString.replace(/"$/mg, "");
       cleanString = cleanString.replace(/""/g, "\"");
    }
 
    let convertionParam = defineConversionParam(string);
 
    var transactions = Banana.Converter.csvToArray(string, convertionParam.separator, '"'); 
    
    let transactionsData = getFormattedData(transactions, convertionParam, importUtilities);
    
    // Lightspeed Format, this format works with the header names.
    var lightspeedFormat = new LightspeedFormat();
    if (lightspeedFormat.match(transactionsData)) {
       transactions = lightspeedFormat.convert(transactionsData);
       return Banana.Converter.arrayToTsv(transactions);
    }
 
    // Format is unknow, return an error
    importUtilities.getUnknownFormatError();
 
    return "";
 }
 
 /**
  * SumUp Format
  *
  * 
 */
 function LightspeedFormat() {
 
    /** Return true if the transactions match this format */
    this.match = function (transactionsData) {
       if (transactionsData.length === 0)
          return false;
 
       for (var i = 0; i < transactionsData.length; i++) {
          var transaction = transactionsData[i];
          var formatMatched = true;
 
          if (formatMatched && transaction["Date"] && transaction["Date"].length >= 10 &&
             transaction["Date"].match(/^[0-9]+\.[0-9]+\.[0-9]+$/))
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
          if (transactionsData[i]["Date"] && transactionsData[i]["Date"].length >= 10 &&
             transactionsData[i]["Date"].match(/^[0-9]+\.[0-9]+\.[0-9]+$/)) {
             transactionsToImport.push(this.mapTransaction(transactionsData[i]));
          }
       }
 
       // Sort rows by date
       transactionsToImport = transactionsToImport.reverse();
 
       // Add header and return
       var header = [["Date", "Doc", "ExternalReference", "Description", "AccountDebit", "AccountCredit", "Amount", "VatRate", "VatAmount"]];
       return header.concat(transactionsToImport);
    }
 
    this.mapTransaction = function (transaction) {
        let mappedLine = [];
 
        mappedLine.push(Banana.Converter.toInternalDateFormat(transaction["Date"], "dd/mm/yyyy"));
        mappedLine.push(transaction["Voucher Nb."]);
        mappedLine.push("");
        mappedLine.push(transaction["Text"]);
        mappedLine.push(transaction["Cpt_debit"]);
        mappedLine.push(transaction["Cpt_credit"]);
        mappedLine.push(Banana.Converter.toInternalNumberFormat(transaction["Montant"]), '.');
        mappedLine.push(Banana.Converter.toInternalNumberFormat(transaction["TVA_Taux"]), '.');
        mappedLine.push(Banana.Converter.toInternalNumberFormat(transaction["TVA_mnt"]), '.');
        
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
    
    // columns = this.convertHeaderFr(columns); 

    //Load the form with data taken from the array. Create objects
    importUtilities.loadForm(form, columns, rows);

    return form;
 }

 function convertHeaderFr(columns) {
   for (var i = 0; i < columns.length; i++) {
       // Convert headers...
   }

   return columns;
}