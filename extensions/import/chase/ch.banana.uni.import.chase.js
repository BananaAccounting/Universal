// Copyright [2023] [Banana.ch SA - Lugano Switzerland]
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
// @pubdate = 2023-12-21
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
 * 
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
    
    let importChaseFormat = new ImportChaseFormat(Banana.document);
    if (importChaseFormat.match(transactions)) {
        let intermediaryData = importChaseFormat.convertCsvToIntermediaryData(transactions, convertionParam);
        importChaseFormat.postProcessIntermediaryData(intermediaryData);
        return Banana.Converter.arrayToTsv(intermediaryData);
    }

    // Format is unknow, return an error
    importUtilities.getUnknownFormatError();

    return "";
}

/**
 * CSV  structure
 * "Transaction Date","Post Date",Description,Category,Type,Amount,Memo
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

        this.colTransactionDate = 0;
        this.colPostDate = 1;
        this.colDescription = 2;
        this.colCategory = 3;
        this.colType = 4;
        this.colAmount = 5;
        this.colMemo = 6;

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
            if (transaction.length === (this.colMemo + 1)) 
                formatMatched = true;
            else
                formatMatched = false;

            if (formatMatched && transaction[this.colTransactionDate] && (transaction[this.colTransactionDate].length >= 8 && 
                transaction[this.colTransactionDate].length <= 10 ) && transaction[this.colTransactionDate].match(/^[0-9]+\/[0-9]+\/[0-9]+$/))
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
            if (transaction[this.colTransactionDate].match(/[0-9\.]+/g) && transaction[this.colTransactionDate].length >= 8 && transaction[this.colTransactionDate].length <= 10)
                transactionsToImport.push(this.mapTransaction(transaction));
        }

        // Sort rows
        transactionsToImport = this.sortData(transactionsToImport, convertionParam);

        // Add header and return
        var header = [
            ["Date", "Description", "ExternalReference", "Notes", "Expenses", "Amount"]
        ];
        return header.concat(transactionsToImport);
    }

    mapTransaction(element) {
        var mappedLine = [];

        mappedLine.push(Banana.Converter.toInternalDateFormat(element[this.colTransactionDate], "mm/dd/yyyy"));
        mappedLine.push(element[this.colDescription] + " - " + element[this.colCategory]);
        mappedLine.push(element[this.colCategory]);
        mappedLine.push(element[this.colType]);

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