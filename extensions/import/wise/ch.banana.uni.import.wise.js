// Copyright [2024] [Banana.ch SA - Lugano Switzerland]
//
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
//
// @id = ch.banana.uni.import.wise
// @api = 1.0
// @pubdate = 2024-04-23
// @publisher = Banana.ch SA
// @description = Wise - Import movements .csv (Banana+ Advanced)
// @doctype = 100.*; 110.*; 130.*
// @docproperties =
// @task = import.transactions
// @outputformat = transactions.simple
// @inputdatasource = openfiledialog
// @inputfilefilter = Text files (*.txt *.csv);;All files (*.*)
// @timeout = -1
// @includejs = import.utilities.js

/**
 * Parse the wise transactions file and returns the data in a format readable by banana
 * 
 * WISE has two mains platforms: PERSONAL and BUSINESS, actually files exported have the same format.
 * 
 * Files can be exported with fees included or in separate transactions, format does not change.
 */
/**
 * Main function
 */
function exec(inData, isTest) {


    var convertionParam = "";
    var transactions = "";
    var importUtilities = new ImportUtilities(Banana.document);

    if (!inData)
        return "";

    if (isTest !== true && !importUtilities.verifyBananaAdvancedVersion())
        return "";

    convertionParam = defineConversionParam(inData);
    //Add the header if present 
    if (convertionParam.header) {
        inData = convertionParam.header + inData;
    }

    transactions = Banana.Converter.csvToArray(inData, convertionParam.separator, convertionParam.textDelim);
    let transactionsData = getFormattedData(transactions, convertionParam, importUtilities);


    let importWisePersonalFormat1 = new ImportWisePersonalFormat1(Banana.document);
    if (importWisePersonalFormat1.match(transactionsData)) {
        let intermediaryData = importWisePersonalFormat1.convertCsvToIntermediaryData(transactionsData);
        return Banana.Converter.arrayToTsv(intermediaryData);
    }

    let importWiseBusinessFormat1 = new ImportWiseBusinessFormat1(Banana.document);
    if (importWiseBusinessFormat1.match(transactionsData)) {
        let intermediaryData = importWiseBusinessFormat1.convertCsvToIntermediaryData(transactionsData);
        return Banana.Converter.arrayToTsv(intermediaryData);
    }

    let importWiseBusinessFormat2 = new ImportWiseBusinessFormat2(Banana.document);
    if (importWiseBusinessFormat2.match(transactionsData)) {
        let intermediaryData = importWiseBusinessFormat2.convertCsvToIntermediaryData(transactionsData);
        return Banana.Converter.arrayToTsv(intermediaryData);
    }

    // Format is unknow, return an error
    importUtilities.getUnknownFormatError();

    return "";
}

/**
 * CSV  structure
 * "TransferWise ID",Date,Amount,Currency,Description,"Payment Reference","Running Balance","Exchange From","Exchange To","Exchange Rate","Payer Name","Payee Name","Payee Account Number",Merchant,"Card Last Four Digits","Card Holder Full Name",Attachment,Note,"Total fees"
 * BIGAVIAE-707401703,23-01-2022,-1071.84,USA,"Frit divia an Lapuple IN Fruccutuid",,0.00,,,,,"Lapuple IN Fruccutuid",QQ8413432384236413826,,,,,,0.50
 * BIGAVIAE-683586350,17-01-2022,-154.91,USA,"Frit divia an OSTUDIT I.",,1071.84,USA,AUT,0.95836,,"OSTUDIT I.",UC11426477442750171520,,,,,,4.65
 * BIGAVIAE-730688867,11-01-2022,-193.88,USA,"Frit divia an OSTUDIT I.",,1226.75,USA,AUT,0.95229,,"OSTUDIT I.",UC11426477442750171520,,,,,,4.86
 * BIGAVIAE-361320314,04-01-2022,-191.49,USA,"Frit divia an OSTUDIT I.",,1420.63,USA,AUT,0.96418,,"OSTUDIT I.",UC11426477442750171520,,,,,,4.80
 * 
 * @param {*} banDocument 
 */
var ImportWisePersonalFormat1 = class ImportWisePersonalFormat1 extends ImportUtilities {
    constructor(banDocument) {
        super(banDocument);

        this.decimalSeparator = ".";
    }

    match(transactions) {
        
        if (transactions.length === 0)
            return false;
        for (var i = 0; i < transactions.length; i++) {
            var transaction = transactions[i];

            var formatMatched = false;

            if (transaction["TransferWise ID"] && transaction["TransferWise ID"].length !== 0)
                formatMatched = true;
            else
                formatMatched = false;

            if (formatMatched && transaction["Date"] && transaction["Date"].length >= 10 &&
                transaction["Date"].match(/^[0-9]+\-[0-9]+\-[0-9]+$/))
                formatMatched = true;
            else
                formatMatched = false;

            if (formatMatched)
                return true;
        }
        return false;
    }

    /** Convert the transaction to the format to be imported */
    convertCsvToIntermediaryData(transactions) {
        var transactionsToImport = [];

        // Filter and map rows
        for (let i = 0; i < transactions.length; i++) {
            var transaction = transactions[i];
            transactionsToImport.push(this.mapTransaction(transaction));
        }

        // Sort rows by date
        transactionsToImport = transactionsToImport.reverse();

        // Add header and return
        var header = [
            ["Date", "Description", "ExternalReference", "Notes", "Expenses", "Income"]
        ];
        return header.concat(transactionsToImport);
    }

    mapTransaction(transaction) {
        var mappedLine = [];

        mappedLine.push(Banana.Converter.toInternalDateFormat(transaction["Date"], "dd-mm-yyyy"));
        mappedLine.push(transaction["Description"]);
        mappedLine.push(transaction["TransferWise ID"]);
        mappedLine.push(transaction["Note"]);

        if (transaction["Amount"].indexOf("-") == -1) {
            mappedLine.push("");
            mappedLine.push(Banana.Converter.toInternalNumberFormat(transaction["Amount"], this.decimalSeparator));
        } else {
            let amount = Banana.SDecimal.abs(transaction["Amount"]);
            mappedLine.push(Banana.Converter.toInternalNumberFormat(amount, this.decimalSeparator));
            mappedLine.push("");
        }
        return mappedLine;
    }
}

/**
 * CSV  structure (with separate fees transactions)
 * 
 * "TransferWise ID",Date,Amount,Currency,Description,"Payment Reference","Running Balance","Exchange From","Exchange To","Exchange Rate","Payer Name","Payee Name","Payee Account Number",Merchant,"Card Last Four Digits","Card Holder Full Name",Attachment,Note,"Total fees"
 * GANT-208846541,01-01-2023,-1.00,COR,"Gant remptiffine in COR diffig an Sente.sed/fice ÆDIFIG.SED",,11761.73,,,,,,,"Sente.sed/fice ÆDIFIG.SED",6559,"Lego Pramnit",,,0.00
 * GANT-116454107,01-01-2023,-60.96,COR,"Gant remptiffine in DEO diffig an Dectus*Ligune Pramnit. UT DECTUS.SED",,14762.73,COR,DEO,1.01056,,,,"Dectus*Ligune Pramnit. UT DECTUS.SED",6559,"Lego Pramnit",,,0.24
 * GANT-116454107,01-01-2023,-0.24,COR,"Cent Dimurra off: GANT-116454107",,14823.69,,,,,,,"Dectus*Ligune Pramnit. UT DECTUS.SED",6559,"Lego Pramnit",,,8
 * LIBERRUM-520757333,01-01-2023,-278.14,COR,"Sper quisu et Forperm O.",,11823.93,COR,XXX,39.54860,,"Forperm O.","************3304",,,,,,1.86
 * LIBERRUM-520757333,01-01-2023,-1.86,COR,"Cent Dimurra off: LIBERRUM-520757333",,15102.07,,,,,Cent,,,,,,,8
 * 
 * @param {*} banDocument 
 */
var ImportWiseBusinessFormat1 = class ImportWiseBusinessFormat1 extends ImportUtilities {
    constructor(banDocument) {
        super(banDocument);

        this.decimalSeparator = ".";

    }

    match(transactions) {

        if (transactions.length === 0)
            return false;
        for (var i = 0; i < transactions.length; i++) {
            var transaction = transactions[i];

            var formatMatched = false;

            if (transaction["TransferWise ID"] && transaction["TransferWise ID"].length !== 0)
                formatMatched = true;
            else
                formatMatched = false;

            if (formatMatched && transaction["Date"] && transaction["Date"].length >= 10 &&
                transaction["Date"].match(/^[0-9]+\-[0-9]+\-[0-9]+$/))
                formatMatched = true;
            else
                formatMatched = false;

            if (formatMatched)
                return true;
        }
        return false;
    }

    /** Convert the transaction to the format to be imported */
    convertCsvToIntermediaryData(transactions, convertionParam) {
        var transactionsToImport = [];

        // Filter and map rows
        for (let i = 0; i < transactions.length; i++) {
            var transaction = transactions[i];
            transactionsToImport.push(this.mapTransaction(transaction));
        }

        // Sort rows by date
        transactionsToImport = transactionsToImport.reverse();

        // Add header and return
        var header = [
            ["Date", "Description", "ExternalReference", "Notes", "Expenses", "Income"]
        ];
        return header.concat(transactionsToImport);
    }

    mapTransaction(transaction) {
        var mappedLine = [];

        mappedLine.push(Banana.Converter.toInternalDateFormat(transaction["Date"], "dd-mm-yyyy"));
        mappedLine.push(transaction["Description"]);
        mappedLine.push(transaction["TransferWise ID"]);
        mappedLine.push(transaction["Note"]);

        if (transaction["Amount"].indexOf("-") == -1) {
            mappedLine.push("");
            mappedLine.push(Banana.Converter.toInternalNumberFormat(transaction["Amount"], this.decimalSeparator));
        } else {
            let amount = Banana.SDecimal.abs(transaction["Amount"]);
            mappedLine.push(Banana.Converter.toInternalNumberFormat(amount, this.decimalSeparator));
            mappedLine.push("");
        }
        return mappedLine;
    }
}

/**
 *  Business format 2
 *  - Format is standard, cant customize it.
 *  - Private format has a similar format.
 * ID,Status,Direction,"Created on","Finished on","Source fee amount","Source fee currency","Target fee amount","Target fee currency","Source name","Source amount (after fees)","Source currency","Target name","Target amount (after fees)","Target currency","Exchange rate",Reference,Batch
 * TRANSFER-1033053142,COMPLETED,IN,"2024-04-12 14:00:47","2024-04-12 14:01:05",4.14,USD,,,"XXX SCHWEIZ AG",35797.44,USD,cybovate,35797.44,USD,1.0,"CH24Q2 002",
 * TRANSFER-1030251410,COMPLETED,OUT,"2024-04-10 08:26:47","2024-04-10 08:50:23",12.38,USD,,,cybovate,13819.77,USD,"YYY AG",13819.77,USD,1.0,"Rechnung Nr 200506",
 * TRANSFER-1023612560,COMPLETED,IN,"2024-04-04 13:48:40","2024-04-04 13:49:06",0.00,USD,,,"ZZZ In",2500.0,USD,cybovate,2500.0,USD,1.0,AB-TNTHQSI,
 * @param {*} banDocument 
 */
var ImportWiseBusinessFormat2 = class ImportWiseBusinessFormat2 extends ImportUtilities {
    constructor(banDocument) {
        super(banDocument);

        this.decimalSeparator = ".";

    }

    match(transactions) {
        
        if (transactions.length === 0)
            return false;
        for (var i = 0; i < transactions.length; i++) {
            var transaction = transactions[i];

            var formatMatched = false;

            if (transaction["ID"] && transaction["ID"].length !== 0)
                formatMatched = true;
            else
                formatMatched = false;
            
            //18 as the format is YYYY-MM-DD HH:MM:SS -> 2024-04-12 14:00:47
            if (formatMatched && transaction["Created on"] && transaction["Created on"].length >= 18 &&
                transaction["Created on"].match(/^[0-9]+(\-|\.)[0-9]+(\-|\.)[0-9]+\s[0-9]+\:[0-9]+(\:[0-9]+)?$/))
                formatMatched = true;
            else
                formatMatched = false;

            if (formatMatched && transaction["Finished on"] && transaction["Finished on"].length >= 18 &&
                transaction["Finished on"].match(/^[0-9]+(\-|\.)[0-9]+(\-|\.)[0-9]+\s[0-9]+\:[0-9]+(\:[0-9]+)?$/))
                formatMatched = true;
            else
                formatMatched = false;

            if (formatMatched)
                return true;
        }
        return false;
    }

    /** Convert the transaction to the format to be imported */
    convertCsvToIntermediaryData(transactions, convertionParam) {
        var transactionsToImport = [];

        // Filter and map rows
        for (let i = 0; i < transactions.length; i++) {
            var transaction = transactions[i];
            transactionsToImport.push(this.mapTransaction(transaction));
        }

        // Sort rows by date
        transactionsToImport = transactionsToImport.reverse();

        // Add header and return
        var header = [
            ["Date", "Description", "ExternalReference", "Notes", "Expenses", "Income"]
        ];
        return header.concat(transactionsToImport);
    }

    mapTransaction(transaction) {
        var mappedLine = [];

        let dateText = transaction["Finished on"].substring(0, 10);
        mappedLine.push(Banana.Converter.toInternalDateFormat(dateText, "yyyy-mm-dd"));
        let description = transaction["Source name"] + ", " + transaction["Reference"];
        mappedLine.push(description);
        mappedLine.push(transaction["ID"]);
        mappedLine.push(transaction["Source fee amount"]);

        if (transaction["Direction"] == "IN") {
            mappedLine.push("");
            mappedLine.push(Banana.Converter.toInternalNumberFormat(transaction["Source amount (after fees)"], this.decimalSeparator));
        } else { // Direction == OUT.
            let amount = Banana.SDecimal.abs(transaction["Source amount (after fees)"]);
            mappedLine.push(Banana.Converter.toInternalNumberFormat(amount, this.decimalSeparator));
            mappedLine.push("");
        }
        return mappedLine;
    }
}

function defineConversionParam(inData) {

    var csvData = Banana.Converter.csvToArray(inData);
    var header = String(csvData[0]);
    var convertionParam = {};
    /** SPECIFY THE SEPARATOR AND THE TEXT DELIMITER USED IN THE CSV FILE */
    convertionParam.format = "csv"; // available formats are "csv", "html"
    //get text delimiter
    convertionParam.textDelim = '\"';
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
    convertionParam.sortColums = ["Date", "Description"];
    convertionParam.sortDescending = false;

    return convertionParam;
}

function getFormattedData(inData, convertionParam, importUtilities) {
    var columns = importUtilities.getHeaderData(inData, convertionParam.headerLineStart); //array
    var rows = importUtilities.getRowData(inData, convertionParam.dataLineStart); //array of array
    let form = [];

    let convertedColumns = [];

    convertedColumns = convertHeaderDe(columns);
    // Load the form with data taken from the array. Create objects
    if (convertedColumns.length > 0) {
        importUtilities.loadForm(form, convertedColumns, rows);
        return form;
     } 

     convertedColumns = convertHeaderEn(columns);

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
          case "ID":
            convertedColumns[i] = "ID";
            break;
          case "Erstellt am":
             convertedColumns[i] = "Created on";
             break;
          case "Abgeschlossen am":
             convertedColumns[i] = "Finished on";
             break;
          case "Quellenname":
             convertedColumns[i] = "Source name";
             break;
          case "Referenz":
             convertedColumns[i] = "Reference";
             break;
          case "Betrag der Ausgangsgebühr":
             convertedColumns[i] = "Source fee amount";
             break;
          case "Richtung":
             convertedColumns[i] = "Direction";
             break;
          case "Ausgangsbetrag (nach Gebühren)":
             convertedColumns[i] = "Source amount (after fees)";
             break;
          default:
             break;
       }
    }
 
    if (convertedColumns.indexOf("Created on") < 0) {
       return [];
    }
 
    return convertedColumns;
 }

 function convertHeaderEn(columns) {
    let convertedColumns = [];
    
    for (var i = 0; i < columns.length; i++) {
       switch (columns[i]) {
          case "TransferWise ID":
            convertedColumns[i] = "TransferWise ID";
            break;
          case "ID":
             convertedColumns[i] = "ID";
             break;
          case "Date":
             convertedColumns[i] = "Date";
             break;
          case "Amount":
             convertedColumns[i] = "Amount";
             break;
          case "Description":
             convertedColumns[i] = "Description";
             break;
          case "Note":
             convertedColumns[i] = "Note";
             break;
          case "Created on":
             convertedColumns[i] = "Created on";
             break;
          case "Finished on":
             convertedColumns[i] = "Finished on";
             break;
          case "Source name":
             convertedColumns[i] = "Source name";
             break;
          case "Reference":
             convertedColumns[i] = "Reference";
             break;
          case "Source fee amount":
             convertedColumns[i] = "Source fee amount";
             break;
          case "Direction":
             convertedColumns[i] = "Direction";
             break;
          case "Source amount (after fees)":
             convertedColumns[i] = "Source amount (after fees)";
             break;
          default:
             break;
       }
    }
 
    if (convertedColumns.indexOf("Created on") < 0 && convertedColumns.indexOf("Date") < 0) {
       return [];
    }
 
    return convertedColumns;
 }