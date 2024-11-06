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
// @id = ch.banana.uni.import.chase
// @api = 1.0
// @pubdate = 2024-01.17
// @publisher = Banana.ch SA
// @description = Chase - import transactions (*.csv)
// @doctype = 100.*; 110.*; 130.*
// @docproperties =
// @task = import.transactions
// @outputformat = transactions.simple
// @inputdatasource = openfiledialog
// @inputfilefilter = Text files (*.txt *.csv);;All files (*.*)
// @timeout = -1
// @includejs = import.utilities.js

/**
 * Parse the Chase transactions file and returns the data in a format readable by banana
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

    transactions = Banana.Converter.csvToArray(inData, convertionParam.separator, convertionParam.textDelim);
    let transactionsData = getFormattedData(transactions, convertionParam, importUtilities);


    let importChaseFormat = new ImportChaseFormat(Banana.document);
    if (importChaseFormat.match(transactionsData)) {
        let intermediaryData = importChaseFormat.convertCsvToIntermediaryData(transactionsData);
        return Banana.Converter.arrayToTsv(intermediaryData);
    }

    // Format is unknow, return an error
    importUtilities.getUnknownFormatError();

    return "";
}

/**
 * CSV  structure
 * Transaction Date,Post Date,Description,Category,Type,Amount,Memo
 * 12/10/2023,12/11/2023,INFORM #123,Groceries,Sale,-87.04,
 * 12/8/2023,12/10/2023,RAKT Mktp GB*STUVWXYZ,Shopping,Sale,-63.28,
 * 12/9/2023,12/10/2023,RAKT Mktp GB*ABCDEFGH,Shopping,Sale,-32.98,
 * 12/9/2023,12/10/2023,PIZZA HUT - KEY CHATSWORTH,Food & Drink,Sale,-9.89,
 * 
 * @param {*} banDocument 
 */
var ImportChaseFormat = class ImportChaseFormat extends ImportUtilities {
    constructor(banDocument) {
        super(banDocument);
        this.decimalSeparator = ".";
    }

    match(transactionsData) {

        if (transactionsData.length === 0)
            return false;

        for (var i = 0; i < transactionsData.length; i++) {
            var transaction = transactionsData[i];

            var formatMatched = false;

            if (transaction["Transaction Date"] && (transaction["Transaction Date"].length >= 8 &&
                transaction["Transaction Date"].length <= 10) && transaction["Transaction Date"].match(/^[0-9]+\/[0-9]+\/[0-9]+$/))
                formatMatched = true;
            else
                formatMatched = false;

            if (formatMatched && transaction["Post Date"] && (transaction["Post Date"].length >= 8 &&
                transaction["Post Date"].length <= 10) && transaction["Post Date"].match(/^[0-9]+\/[0-9]+\/[0-9]+$/))
                formatMatched = true;
            else
                formatMatched = false;

            if (formatMatched)
                return true;
        }
        return false;
    }

    /** Convert the transaction to the format to be imported */
    convertCsvToIntermediaryData(transactionsData) {
        var transactionsToImport = [];

        for (var i = 0; i < transactionsData.length; i++) {
            if (transactionsData[i]["Transaction Date"] && (transactionsData[i]["Transaction Date"].length >= 8 &&
                transactionsData[i]["Transaction Date"].length <= 10) &&
                transactionsData[i]["Transaction Date"].match(/^[0-9]+\/[0-9]+\/[0-9]+$/)) {
                transactionsToImport.push(this.mapTransaction(transactionsData[i]));
            }
        }

        // Sort rows
        transactionsToImport = transactionsToImport.reverse();

        // Add header and return
        var header = [
            ["Date", "Description", "ExternalReference", "Notes", "Income", "Expenses"]
        ];
        return header.concat(transactionsToImport);
    }

    mapTransaction(element) {
        var mappedLine = [];

        mappedLine.push(Banana.Converter.toInternalDateFormat(element["Transaction Date"], "mm/dd/yyyy"));
        mappedLine.push(element["Description"] + ", " + element["Category"] + ", " + element["Type"]);
        mappedLine.push("") //External reference is not present in this format.
        mappedLine.push(element["Memo"])
        let indexOfMinusSign = element["Amount"].indexOf("-");
        if (indexOfMinusSign == -1) {
            mappedLine.push(Banana.Converter.toInternalNumberFormat(element["Amount"], this.decimalSeparator));
            mappedLine.push("");
        } else {
            let amount = element["Amount"];
            amount = amount.slice(indexOfMinusSign + 1); // remove minus sign and keep the remaining of the string after
            mappedLine.push("");
            mappedLine.push(Banana.Converter.toInternalNumberFormat(amount, this.decimalSeparator));
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
    //Load the form with data taken from the array. Create objects
    importUtilities.loadForm(form, columns, rows);
    return form;
}