// Copyright [2022] [Banana.ch SA - Lugano Switzerland]
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
// @pubdate = 2023-01-05
// @publisher = Banana.ch SA
// @description = Wise - import transactions (*.csv)
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

    let importWisePersonalFormat1 = new ImportWisePersonalFormat1(Banana.document);
    if (importWisePersonalFormat1.match(transactions)) {
        let intermediaryData = importWisePersonalFormat1.convertCsvToIntermediaryData(transactions, convertionParam);
        importWisePersonalFormat1.postProcessIntermediaryData(intermediaryData);
        return Banana.Converter.arrayToTsv(intermediaryData);
    }

    let importWiseBusinessFormat1 = new ImportWiseBusinessFormat1(Banana.document);
    if (importWiseBusinessFormat1.match(transactions)) {
        let intermediaryData = importWiseBusinessFormat1.convertCsvToIntermediaryData(transactions, convertionParam);
        importWiseBusinessFormat1.postProcessIntermediaryData(intermediaryData);
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

        this.colExternalRef = 0;
        this.colDate = 1;
        this.colAmount = 2;
        this.colDescription = 4;
        this.colPaymentRef = 5;
        this.colBalance = 6;
        this.colNotes = 17;
        this.colTotalFees = 18;

        //Index of columns in import format.
        this.newColExpenses = 4;


        this.dateFormat = "";
    }

    match(transactions) {

        if (transactions.length === 0)
            return false;
        for (var i = 0; i < transactions.length; i++) {
            var transaction = transactions[i];

            var formatMatched = false;

            /* array should have all columns */
            if (transaction.length === (this.colTotalFees + 1))
                formatMatched = true;
            else
                formatMatched = false;

            if (formatMatched && transaction[this.colDate] && transaction[this.colDate].length == 10 &&
                transaction[this.colDate].match(/^[0-9]+\-[0-9]+\-[0-9]+$/))
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
            if (transaction.length < (this.colCount + 1))
                continue;
            if (transaction[this.colDate].match(/[0-9\.]+/g) && transaction[this.colDate].length === 10)
                transactionsToImport.push(this.mapTransaction(transaction));
        }

        // Sort rows
        transactionsToImport = this.sortData(transactionsToImport, convertionParam);

        // Add header and return
        var header = [
            ["Date", "Description", "ExternalReference", "Notes", "Expenses", "Income"]
        ];
        return header.concat(transactionsToImport);
    }

    mapTransaction(element) {
        var mappedLine = [];

        mappedLine.push(Banana.Converter.toInternalDateFormat(element[this.colDate], "dd-mm-yyyy"));
        mappedLine.push(element[this.colDescription]);
        mappedLine.push(element[this.colExternalRef]);
        mappedLine.push(element[this.colNotes]);

        if (element[this.colAmount].indexOf("-") == -1) {
            mappedLine.push("");
            mappedLine.push(Banana.Converter.toInternalNumberFormat(element[this.colAmount], this.decimalSeparator));
        } else {
            mappedLine.push(Banana.Converter.toInternalNumberFormat(element[this.colAmount], this.decimalSeparator));
            mappedLine.push("");
        }
        return mappedLine;
    }

    //The purpose of this function is to let the user specify how to convert the categories
    postProcessIntermediaryData(intermediaryData) {
        /** INSERT HERE THE LIST OF ACCOUNTS NAME AND THE CONVERSION NUMBER 
         *   If the content of "Account" is the same of the text 
         *   it will be replaced by the account number given */
        //Accounts conversion
        let accounts = {
            //...
        }

        /** INSERT HERE THE LIST OF CATEGORIES NAME AND THE CONVERSION NUMBER 
         *   If the content of "ContraAccount" is the same of the text 
         *   it will be replaced by the account number given */

        //Categories conversion
        let categories = {
            //...
        }

        //Apply the conversions
        for (let i = 1; i < intermediaryData.length; i++) {
            let convertedData = intermediaryData[i];

            //Invert values
            if (convertedData[this.newColExpenses]) {
                convertedData[this.newColExpenses] = Banana.SDecimal.invert(convertedData[this.newColExpenses]);
            }
        }
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

        this.colExternalRef = 0;
        this.colDate = 1;
        this.colAmount = 2;
        this.colDescription = 4;
        this.colPaymentRef = 5;
        this.colBalance = 6;
        this.colNotes = 17;
        this.colTotalFees = 18;

        //Index of columns in import format.
        this.newColExpenses = 4;

    }

    match(transactions) {

        if (transactions.length === 0)
            return false;
        for (var i = 0; i < transactions.length; i++) {
            var transaction = transactions[i];

            var formatMatched = false;

            /* array should have all columns */
            if (transaction.length === (this.totalFees + 1))
                formatMatched = true;
            else
                formatMatched = false;

            if (formatMatched && transaction[this.colDate] && transaction[this.colDate].length == 10 &&
                transaction[this.colDate].match(/^[0-9]+\-[0-9]+\-[0-9]+$/))
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
            if (transaction.length < (this.colCount + 1))
                continue;
            if (transaction[this.colDate].match(/[0-9\.]+/g) && transaction[this.colDate].length === 10)
                transactionsToImport.push(this.mapTransaction(transaction));
        }

        // Sort rows
        transactionsToImport = this.sortData(transactionsToImport, convertionParam);

        // Add header and return
        var header = [
            ["Date", "Description", "ExternalReference", "Notes", "Expenses", "Income"]
        ];
        return header.concat(transactionsToImport);
    }

    mapTransaction(element) {
        var mappedLine = [];

        mappedLine.push(Banana.Converter.toInternalDateFormat(element[this.colDate], "dd-mm-yyyy"));
        mappedLine.push(element[this.colDescription]);
        mappedLine.push(element[this.colExternalRef]);
        mappedLine.push(element[this.colNotes]);

        if (element[this.colAmount].indexOf("-") == -1) {
            mappedLine.push("");
            mappedLine.push(Banana.Converter.toInternalNumberFormat(element[this.colAmount], this.decimalSeparator));
        } else {
            mappedLine.push(Banana.Converter.toInternalNumberFormat(element[this.colAmount], this.decimalSeparator));
            mappedLine.push("");
        }
        return mappedLine;
    }

    //The purpose of this function is to let the user specify how to convert the categories
    postProcessIntermediaryData(intermediaryData) {
        /** INSERT HERE THE LIST OF ACCOUNTS NAME AND THE CONVERSION NUMBER 
         *   If the content of "Account" is the same of the text 
         *   it will be replaced by the account number given */
        //Accounts conversion
        var accounts = {
            //...
        }

        /** INSERT HERE THE LIST OF CATEGORIES NAME AND THE CONVERSION NUMBER 
         *   If the content of "ContraAccount" is the same of the text 
         *   it will be replaced by the account number given */

        //Categories conversion
        var categories = {
            //...
        }

        //Apply the conversions
        for (let i = 1; i < intermediaryData.length; i++) {
            var convertedData = intermediaryData[i];

            //Invert values
            if (convertedData[this.newColExpenses]) {
                convertedData[this.newColExpenses] = Banana.SDecimal.invert(convertedData[this.newColExpenses]);
            }
        }
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