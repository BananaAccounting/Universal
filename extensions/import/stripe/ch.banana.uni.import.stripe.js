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
// @pubdate = 2023-10-04
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


    var convertionParam = "";
    var transactions = "";
    var importUtilities = new ImportUtilities(Banana.document);

    if (!inData)
        return "";

    if (isTest !== true && !importUtilities.verifyBananaAdvancedVersion())
        return "";

    convertionParam = defineConversionParam(inData);
    transactions = Banana.Converter.csvToArray(inData, convertionParam.separator, convertionParam.textDelim);

    let stripeFormat1 = new ImportStripeFormat1(Banana.document);
    if (stripeFormat1.match(transactions)) {
        let intermediaryData = stripeFormat1.convertCsvToIntermediaryData(transactions, convertionParam);
        stripeFormat1.postProcessIntermediaryData(intermediaryData);
        return Banana.Converter.arrayToTsv(intermediaryData);
    }

    // Format is unknow, return an error
    importUtilities.getUnknownFormatError();

    return "";
}

/**
 * CSV  structure:
 * "automatic_payout_id","balance_transaction_id","created","available_on","currency","gross","fee","net","reporting_category","description"
 * "sd_4Fo4U4EYTmn5oT4sVY3ch5nt","awq_6FlEY0IMHrk1dQ3s4kily3vN","2023-04-05 15:25:14","2023-04-12 02:00:00","ror","120.00","3.78","116.22","pribus","Prodo Orage Adde'i Vite: Men veraest iné at alis-anget"
 * "jx_0YbvMwVVEof6tW2iRPOd2A7L","wxb_1GssUCEVBni4mU1f5GUtBm1Q","2023-04-08 19:04:23","2023-04-14 02:00:00","ror","65.00","2.19","62.81","pribus","Description"
 * 
 * @param {*} banDocument 
 */
var ImportStripeFormat1 = class ImportStripeFormat1 extends ImportUtilities {
    constructor(banDocument) {
        super(banDocument);

        this.decimalSeparator = ".";

        this.colPayoutId = 0;
        this.colTransactionId = 1;
        this.colCreatedAt = 2;
        this.colAvailableOn = 3;
        this.colCurrency = 4;
        this.colGrossAmount = 5;
        this.colFee = 6;
        this.colNetAmount = 7;
        this.colCategory = 8;
        this.colDescription = 9;

        //Index of columns in import format.
        // this.newColExpenses = 4;


        this.dateFormat = "";
    }

    match(transactions) {

        if (transactions.length === 0)
            return false;
        for (var i = 0; i < transactions.length; i++) {
            var transaction = transactions[i];

            var formatMatched = false;

            /* array should have all columns */
            if (transaction.length === (this.colDescription + 1))
                formatMatched = true;
            else
                formatMatched = false;

            if (formatMatched && transaction[this.colCreatedAt] && transaction[this.colCreatedAt].length >= 19 &&
                transaction[this.colCreatedAt].match(/^[0-9]+(\-|\.)[0-9]+(\-|\.)[0-9]+\s[0-9]+\:[0-9]+(\:[0-9]+)?$/))
                formatMatched = true;

            if (formatMatched && transaction[this.colAvailableOn] && transaction[this.colAvailableOn].length >= 19 &&
                transaction[this.colAvailableOn].match(/^[0-9]+(\-|\.)[0-9]+(\-|\.)[0-9]+\s[0-9]+\:[0-9]+(\:[0-9]+)?$/))
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
            var date = transaction[this.colCreatedAt].substring(0, 10);
            if (transaction.length < (this.colCount + 1)) {

                continue;
            }

            if (date.match(/[0-9\.]+/g) && date.length === 10) {
                transactionsToImport.push(this.mapTransaction(transaction));
            }
        }

        // Sort rows
        transactionsToImport = this.sortData(transactionsToImport, convertionParam);

        // Add header and return
        var header = [
            ["Date", "ExternalReference", "Description", "Expenses", "Income"]
        ];
        return header.concat(transactionsToImport);
    }

    mapTransaction(element) {
        var mappedLine = [];

        mappedLine.push(Banana.Converter.toInternalDateFormat(element[this.colCreatedAt], "yyyy-mm-dd"));
        mappedLine.push(element[this.colTransactionId]);
        let description = this.getDescription(element);
        mappedLine.push(description);
        let netAmount = element[this.colNetAmount];
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

    getDescription(element) {
        let description = "";
        let texts = this.getTexts();

        description = element[this.colDescription];

        if (element[this.colFee] !== "") {
            description += ", " + texts.fee + ": " + element[this.colFee];
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