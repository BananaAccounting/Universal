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
// @id = ch.banana.uni.import.stripe
// @api = 1.0
// @pubdate = 2023-10-09
// @publisher = Banana.ch SA
// @description = Stripe - Import movements .csv (Banana+ Advanced)
// @doctype = 100.*; 110.*; 130.*
// @docproperties =
// @task = import.transactions
// @outputformat = transactions.simple
// @inputdatasource = openfiledialog
// @inputfilefilter = Text files (*.txt *.csv);;All files (*.*)
// @timeout = -1
// @includejs = import.utilities.js


/**
 * Main function
 */
function exec(inData, isTest) {


    let convertionParam = "";
    let csvData = "";
    let transactionsData = [];
    let importUtilities = new ImportUtilities(Banana.document);

    if (!inData)
        return "";

    if (isTest !== true && !importUtilities.verifyBananaAdvancedVersion())
        return "";

    convertionParam = defineConversionParam(inData);
    csvData = Banana.Converter.csvToArray(inData, convertionParam.separator, convertionParam.textDelim);

    let stripeFormat1 = new ImportStripeFormat1(Banana.document);
    transactionsData = stripeFormat1.getformattedData(csvData, convertionParam);
    if (stripeFormat1.match(transactionsData)) {
        let intermediaryData = stripeFormat1.convertCsvToIntermediaryData(transactionsData, convertionParam);
        stripeFormat1.postProcessIntermediaryData(intermediaryData);
        return Banana.Converter.arrayToTsv(intermediaryData);
    }

    // Format is unknow, return an error
    importUtilities.getUnknownFormatError();

    return "";
}

/**
 * CSV  structure details:
 * Export mode: Payments, Standard columns.
 * We only import Stripe standard columns, 
 * for the columns that are added from other platforms to the csv we do not offer currently a solution.
 * https://support.stripe.com/questions/exporting-payment-reports.
 * 
 * @param {*} banDocument 
 */
var ImportStripeFormat1 = class ImportStripeFormat1 extends ImportUtilities {
    constructor(banDocument) {
        super(banDocument);

        this.decimalSeparator = ".";
        this.columnsLenght = 16;
        this.dateFormat = 'yyyy-mm-dd';
    }

    getformattedData(csvData, convertionParam) {
        let columns = this.getHeaderData(csvData, convertionParam); //array
        let rows = this.getRowData(csvData, convertionParam); //array of array
        let form = [];

        //We pass them all so as not to have to guess the language of the header.
        columns = this.convertHeaderIt(columns); // Converte le intestazioni dall'italiano all'inglese.
        columns = this.convertHeaderDe(columns); // Converte le intestazioni dal tedesco all'inglese.
        columns = this.convertHeaderFr(columns); // Converte le intestazioni dal francese all'inglese.

        //Load the form with data taken from the array. Create objects
        this.loadForm(form, columns, rows);
        return form;
    }

    convertHeaderIt(columns) {
        for (var i = 0; i < columns.length; i++) {
            // Convert headers...
        }

        return columns;
    }

    convertHeaderDe(columns) {
        for (var i = 0; i < columns.length; i++) {
            // Convert headers...
        }

        return columns;
    }

    convertHeaderFr(columns) {
        for (var i = 0; i < columns.length; i++) {
            // Convert headers...
        }

        return columns;
    }

    getHeaderData(csvData, convertionParam) {
        var headerData = csvData[convertionParam.headerLineStart];
        for (var i = 0; i < headerData.length; i++) {

            headerData[i] = headerData[i].trim();

            if (!headerData[i]) {
                headerData[i] = i;
            }
        }
        return headerData;
    }

    getRowData(csvData, convertionParam) {
        var rowData = [];
        for (var i = convertionParam.dataLineStart; i < csvData.length; i++) {
            rowData.push(csvData[i]);
        }
        return rowData;
    }

    //The purpose of this function is to load all the data (titles of the columns and rows) and create a list of objects.
    //Each object represents a row of the csv file
    loadForm(form, columns, rows) {
        var obj = new Object;

        for (var j = 0; j < rows.length; j++) {
            var obj = {};

            for (var i = 0; i < columns.length; i++) {
                obj[columns[i]] = rows[j][i];
            }
            form.push(obj);
        }
    }

    match(transactionsData) {

        if (transactionsData.length === 0)
            return false;

        for (var i = 0; i < transactionsData.length; i++) {
            var transaction = transactionsData[i];

            var formatMatched = true;

            if (formatMatched && transaction["Created (UTC)"] && transaction["Created (UTC)"].length >= 16 &&
                transaction["Created (UTC)"].match(/^\d{2,4}[-.]\d{2}[-.]\d{2} \d{2}:\d{2}$/))
                formatMatched = true;
            else
                formatMatched = false;

            if (formatMatched && transaction["Seller Message"] && transaction["Seller Message"] != "")
                formatMatched = true;
            else
                formatMatched = false;

            if (formatMatched)
                return true;
        }

        return false;
    }

    /** Convert the transaction to the format to be imported */
    convertCsvToIntermediaryData(transactionsData, convertionParam) {
        var transactionsToImport = [];

        // Filter and map rows
        for (let i = 0; i < transactionsData.length; i++) {
            var transactionObj = transactionsData[i];
            transactionsToImport.push(this.mapTransaction(transactionObj));
        }

        // Sort rows
        transactionsToImport = this.sortData(transactionsToImport, convertionParam);

        // Add header and return
        var header = [
            ["Date", "ExternalReference", "Description", "Notes", "Expenses", "Income"]
        ];
        return header.concat(transactionsToImport);
    }

    mapTransaction(transationObj) {
        var mappedLine = [];

        mappedLine.push(Banana.Converter.toInternalDateFormat(transationObj["Created (UTC)"], "yyyy-mm-dd"));
        mappedLine.push(transationObj["id"]);
        let description = this.getDescription(transationObj);
        mappedLine.push(description);
        mappedLine.push(transationObj["Seller Message"]);
        let netAmount = transationObj["Amount"];
        this.setDecimalSeparator(netAmount); // could be done better.
        if (netAmount.length > 0) {
            if (netAmount[0] === "-") {
                netAmount = netAmount.replace(/-/g, ''); //remove minus sign
                mappedLine.push(Banana.Converter.toInternalNumberFormat(netAmount, this.decimalSeparator));
                mappedLine.push("");

            } else {
                mappedLine.push("");
                mappedLine.push(Banana.Converter.toInternalNumberFormat(netAmount, this.decimalSeparator));
            }
        }

        return mappedLine;
    }

    setDecimalSeparator(amount) {
        /** As far as we know the decimal separator could be: ',' or '.' and there is no thousand divisor  */
        const parts = amount.split('.');
        if (parts.length === 1) {
            const commaParts = amount.split(',');
            if (commaParts.length === 2 && !isNaN(commaParts[1])) {
                this.decimalSeparator = ',';
            }
        } else if (parts.length === 2 && !isNaN(parts[1])) {
            this.decimalSeparator = '.';
        }
    }

    getDescription(element) {
        let description = "";
        let texts = this.getTexts();

        description = element["Description"];

        if (description !== "" && element["Fee"] !== "") {
            description += ", " + texts.fee + ": " + element["Fee"];
        }

        return description;
    }

    getTexts() {

        let lang = this.getLang();

        if (lang == "")
            return lang;

        switch (lang) {
            case 'de':
                return this.getTextsDe();
            case 'it':
                return this.getTextsIt();
            case 'fr':
                return this.getTextsFr();
            case 'en':
            default:
                return this.getTextsEn();
        }
    }

    getTextsDe() {
        let texts = {};

        texts.fee = "Steuer";

        return texts;
    }

    getTextsIt() {
        let texts = {};

        texts.fee = "Tassa";

        return texts;
    }

    getTextsFr() {
        let texts = {};

        texts.fee = "Taxe";

        return texts;
    }

    getTextsEn() {
        let texts = {};

        texts.fee = "Fee";

        return texts;
    }

    getLang() {
        let lang = 'en';
        if (Banana.document)
            lang = Banana.document.locale;
        else if (Banana.application.locale)
            lang = Banana.application.locale;
        if (lang.length > 2)
            lang = lang.substr(0, 2);
        return lang;
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
    convertionParam.textDelim = '';
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