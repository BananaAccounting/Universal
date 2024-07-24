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
// @id = ch.banana.uni.import.revolut
// @api = 1.0
// @pubdate = 2024-07-24
// @publisher = Banana.ch SA
// @description = Revolut - Import movements .csv (Banana+ Advanced)
// @doctype = 100.*; 110.*; 130.*
// @docproperties =
// @task = import.transactions
// @outputformat = transactions.simple
// @inputdatasource = openfiledialog
// @inputfilefilter = Text files (*.txt *.csv);;All files (*.*)
// @timeout = -1
// @includejs = import.utilities.js

/**
 * Parse the revolut file and return a string in with data in tab separated
 * 
 * REVOLUT has two mains platforms: 
 * - PRIVATE
 * - BUSINESS
 * Each platform:
 * - Exports .csv files with different format. Csv export formats are standard and not customizable.
 * - Allows to export all the transactions or just the expenses, files format are different.
 */


function exec(inData, isTest) {


    var convertionParam = "";
    var intermediaryData = "";
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

    // Format Private 1. (All transactions)
    var importRevolutPrivateFormat1 = new ImportRevolutPrivateFormat1(Banana.document);
    if (importRevolutPrivateFormat1.match(transactions)) {
        var intermediaryData = importRevolutPrivateFormat1.convertCsvToIntermediaryData(transactions, convertionParam);
        intermediaryData = importRevolutPrivateFormat1.sortData(intermediaryData, convertionParam);
        return importRevolutPrivateFormat1.convertToBananaFormat(intermediaryData);
    }

    // Format Business 1. (All transactions)
    var importRevolutBusinessFormat1 = new ImportRevolutBusinessFormat1(Banana.document);
    if (importRevolutBusinessFormat1.match(transactions)) {
        var intermediaryData = importRevolutBusinessFormat1.convertCsvToIntermediaryData(transactions, convertionParam);
        intermediaryData = importRevolutBusinessFormat1.sortData(intermediaryData, convertionParam);
        return importRevolutBusinessFormat1.convertToBananaFormat(intermediaryData);
    }

    // Format Business 2. (All transactions)
    var importRevolutBusinessFormat2 = new ImportRevolutBusinessFormat2(Banana.document);
    if (importRevolutBusinessFormat2.match(transactions)) {
        let intermediaryData = importRevolutBusinessFormat2.convertCsvToIntermediaryData(transactions, convertionParam);
        intermediaryData = importRevolutBusinessFormat2.sortData(intermediaryData, convertionParam);
        return importRevolutBusinessFormat2.convertToBananaFormat(intermediaryData);
    }

    // Format Business 3. Works with column headers (All transactions)
    var importRevolutBusinessFormat3 = new ImportRevolutBusinessFormat3(Banana.document);
    if (importRevolutBusinessFormat3.match(transactionsData)) {
        let intermediaryData = importRevolutBusinessFormat3.convertCsvToIntermediaryData(transactionsData);
        return Banana.Converter.arrayToTsv(intermediaryData);
    }

    // Format Business Expenses 1. Works with column headers.
    var importRevolutBusinessExpensesFormat1 = new ImportRevolutBusinessExpensesFormat1(Banana.document);
    if (importRevolutBusinessExpensesFormat1.match(transactionsData)) {
        let intermediaryData = importRevolutBusinessExpensesFormat1.convertCsvToIntermediaryData(transactionsData);
        return Banana.Converter.arrayToTsv(intermediaryData);
    }

    // Format is unknow, return an error
    importUtilities.getUnknownFormatError();

    return "";
}

/**
 * CSV  structure
 * Type,Product,Started Date,Completed Date,Description,Amount,Fee,Currency,State,Balance
 * CARD_PAYMENT,Current,2022-08-30 14:37:38,2022-09-01 00:41:15,Mafe Neman,-4.99,0.00,CHF,COMPLETED,2804.22
 * CARD_PAYMENT,Current,2022-08-30 14:13:52,2022-09-01 19:15:38,Rav Kav Online,-14.64,0.00,CHF,COMPLETED,2789.58
 * 
 * @param {*} banDocument 
 */
var ImportRevolutPrivateFormat1 = class ImportRevolutPrivateFormat1 extends ImportUtilities {
    constructor(banDocument) {
        super(banDocument);

        this.colBalance = 9;
        this.colStartedDate = 2;

        this.dateFormat = "";
    }

    match(transactions) {

        if (transactions.length === 0)
            return false;
        for (var i = 0; i < transactions.length; i++) {
            var transaction = transactions[i];

            var formatMatched = false;

            /* array should have all columns */
            if (transaction.length === (this.colBalance + 1))
                formatMatched = true;
            else
                formatMatched = false;

            //18 as the format is YYYY-MM-DD HH:MM:SS -> 2022-01-01 00:00:00
            if (formatMatched && transaction[this.colStartedDate].length > 18 &&
                transaction[this.colStartedDate].match(/^[0-9]+(\-|\.)[0-9]+(\-|\.)[0-9]+\s[0-9]+\:[0-9]+(\:[0-9]+)?$/))
                formatMatched = true;
            else
                formatMatched = false;

            if (formatMatched)
                return true;
        }
        return false;
    }

    formatColumnsNames(columnsTemps) {
        let columns = [];
        for (var i = 0; i <= columnsTemps.length; i++) {
            var colName = columnsTemps[i];
            /**
             * Actually we use Started Date as the Completed Date is not Always present
             * Could be possible to check the state of the transaction using the field "State" to 
             * define wich date to use, as far we know a transaction can have two main states: COMPLETED 
             * and PENDING.
             */
            switch (colName) {
                case "Started Date":
                    colName = "Date";
                    break;
            }
            columns.push(colName);
        }

        return columns;
    }

    //Override the utilities method by adding language control
    convertCsvToIntermediaryData(transactions, convertionParam) {
        var form = [];
        var intermediaryData = [];

        //Variables used to save the columns titles and the rows values
        var columnsTemps = this.getHeaderData(transactions, convertionParam.headerLineStart); //array
        var rows = this.getRowData(transactions, convertionParam.dataLineStart); //array of array
        let columns = [];

        //format the columns
        columns = this.formatColumnsNames(columnsTemps);

        //Load the form with data taken from the array. Create objects
        this.loadForm(form, columns, rows);

        //For each row of the form, we call the rowConverter() function and we save the converted data
        for (var i = 0; i < form.length; i++) {
            let convertedRow = {};
            convertedRow = this.translateHeader(form[i], convertedRow);
            intermediaryData.push(convertedRow);
        }

        return intermediaryData;
    }

    translateHeader(inputRow, convertedRow) {
        //get the Banana Columns Name from csv file columns name
        let descText = "";
        let amountValue = "";
        let feeValue = "";
        let totAmount = "";

        let dateText = inputRow["Date"].substring(0, 10);

        convertedRow['Date'] = Banana.Converter.toInternalDateFormat(dateText, "yyyy-mm-dd");
        descText = inputRow["Description"] + ", " + inputRow["Product"] + " " + inputRow["Type"];
        convertedRow["Description"] = descText;

        //get the total amount
        amountValue = inputRow["Amount"];
        feeValue = inputRow["Fee"];
        totAmount = calculateAmount(amountValue, feeValue);
        //define if the amount is an income or an expenses.
        convertedRow["Expenses"] = "";
        convertedRow["Income"] = "";

        if (inputRow["Amount"].indexOf("-") == -1) {
            convertedRow["Income"] = totAmount;
        } else {
            convertedRow["Expenses"] = totAmount;
        }

        return convertedRow;
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
        for (var i = 0; i < intermediaryData.length; i++) {
            var convertedData = intermediaryData[i];

            //Invert values
            if (convertedData["Expenses"]) {
                convertedData["Expenses"] = Banana.SDecimal.invert(convertedData["Expenses"]);
            }
        }
    }
}

/**
 * CSV  structure
 * Date started (UTC),Date completed (UTC),Date started (Europe/Zurich),Date completed (Europe/Zurich),ID,Type,Description,Reference,Payer,Card number,Orig currency,Orig amount,Payment currency,Amount,Fee,Balance,Account,Beneficiary account number,Beneficiary sort code or routing number,Beneficiary IBAN,Beneficiary BIC
 * 2022-07-03,2022-07-04,2022-07-03,2022-07-04,1234abc-def456,CARD_PAYMENT,Payment with card,,Bruno Frey,1234567890,USD,59.00,CHF,-54.26,-0.22,2621.00,Bank CHF,,,,
 * 2022-07-03,2022-07-03,2022-07-03,2022-07-03,1234abc-def456,CARD_PAYMENT,Payment with card,,Bruno Frey,1234567890,CHF,0.00,CHF,0.00,0.00,2675.48,Bank CHF,,,,2
 * @param {*} banDocument 
 */
var ImportRevolutBusinessFormat1 = class ImportRevolutBusinessFormat1 extends ImportUtilities {
    constructor(banDocument) {
        super(banDocument);

        this.colBeneficiaryBic = 20; //Last column
        this.colDateCompletedUTC = 1;
        this.colId = 4; //Present only in business version
    }

    match(inData) {

        if (inData.length === 0)
            return false;
        for (var i = 0; i < inData.length; i++) {
            var transaction = inData[i];

            var formatMatched = false;

            /* array should have all columns */
            if (transaction.length === (this.colBeneficiaryBic + 1))
                formatMatched = true;
            else
                formatMatched = false;

            //9 as the format is YYYY-MM-DD
            if (formatMatched && transaction[this.colDateCompletedUTC].length > 9 &&
                transaction[this.colDateCompletedUTC].match(/^[0-9]+(\-|\.)[0-9]+(\-|\.)[0-9]/))
                formatMatched = true;
            else
                formatMatched = false;
            // id column is present only in the Business
            if (formatMatched && transaction[this.colId].length >= 0)
                formatMatched = true;
            else
                formatMatched = false;

            if (formatMatched)
                return true;
        }

    }

    formatColumnsNames(columnsTemps) {
        let columns = [];
        for (var i = 0; i <= columnsTemps.length; i++) {
            var colName = columnsTemps[i];
            switch (colName) {
                case "Date started (UTC)":
                    colName = "Date";
                    break;
                case "Card number":
                    colName = "CardNr";
                    break;
                case "Orig currency":
                    colName = "OrigCurr";
                    break;
                case "Orig amount":
                    colName = "OrigAmount";
                    break;
                case "Payment currency":
                    colName = "PaymentCurr";
                    break;
            }
            columns.push(colName);
        }

        return columns;
    }

    //Override the utilities method by adding language control
    convertCsvToIntermediaryData(transactions, convertionParam) {
        var form = [];
        var intermediaryData = [];

        //Variables used to save the columns titles and the rows values
        var columnsTemps = this.getHeaderData(transactions, convertionParam.headerLineStart); //array
        var rows = this.getRowData(transactions, convertionParam.dataLineStart); //array of array
        let columns = [];

        //format the columns
        columns = this.formatColumnsNames(columnsTemps);

        //Load the form with data taken from the array. Create objects
        this.loadForm(form, columns, rows);

        //For each row of the form, we call the rowConverter() function and we save the converted data
        for (var i = 0; i < form.length; i++) {
            let convertedRow = {};
            convertedRow = this.translateHeader(form[i], convertedRow);
            intermediaryData.push(convertedRow);
        }

        return intermediaryData;
    }

    translateHeader(inputRow, convertedRow) {
        //Get the Banana Columns Name from csv file columns name
        let descText = "";
        let amountValue = "";
        let feeValue = "";
        let totAmount = "";

        convertedRow['Date'] = Banana.Converter.toInternalDateFormat(inputRow["Date"], "yyyy-mm-dd");
        descText = inputRow["Type"] + ", " + inputRow["Description"] + " " + inputRow["Reference"];
        convertedRow["Description"] = descText;
        convertedRow["ExternalReference"] = inputRow["ID"];

        //Get the total amount
        amountValue = inputRow["Amount"];
        feeValue = inputRow["Fee"];
        totAmount = calculateAmount(amountValue, feeValue);
        //Define if the amount is an income or an expenses.
        convertedRow["Expenses"] = "";
        convertedRow["Income"] = "";

        if (inputRow["Amount"].indexOf("-") == -1) {
            convertedRow["Income"] = totAmount;
        } else {
            convertedRow["Expenses"] = totAmount;
        }

        return convertedRow;
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
        for (var i = 0; i < intermediaryData.length; i++) {
            var convertedData = intermediaryData[i];

            //Invert values
            if (convertedData["Expenses"]) {
                convertedData["Expenses"] = Banana.SDecimal.invert(convertedData["Expenses"]);
            }
        }
    }
}

/**
 * CSV  structure
 * Date started (UTC),Date completed (UTC),ID,Type,Description,Reference,Payer,Card number,Orig currency,Orig amount,Payment currency,Amount,Fee,Balance,Account,Beneficiary account number,Beneficiary sort code or routing number,Beneficiary IBAN,Beneficiary BIC
 * 2022-07-03,2022-07-04,1234abc-def456,CARD_PAYMENT,Payment with card,,Bruno Frey,1234567890,USD,59.00,CHF,-54.26,-0.22,2621.00,Bank CHF,,,,
 * 2022-07-03,2022-07-03,1234abc-def456,CARD_PAYMENT,Payment with card,,Bruno Frey,1234567890,CHF,0.00,CHF,0.00,0.00,2675.48,Bank CHF,,,,2
 * @param {*} banDocument 
 */
var ImportRevolutBusinessFormat2 = class ImportRevolutBusinessFormat2 extends ImportUtilities {
    constructor(banDocument) {
        super(banDocument);

        this.colBeneficiaryBic = 18; //Last column
        this.colDateCompletedUTC = 1;
        this.colId = 2; //Present only in business version
    }

    match(inData) {

        if (inData.length === 0)
            return false;
        for (var i = 0; i < inData.length; i++) {
            var transaction = inData[i];

            var formatMatched = false;

            /* array should have all columns */
            if (transaction.length === (this.colBeneficiaryBic + 1))
                formatMatched = true;
            else
                formatMatched = false;

            //9 as the format is YYYY-MM-DD
            if (formatMatched && transaction[this.colDateCompletedUTC].length > 9 &&
                transaction[this.colDateCompletedUTC].match(/^[0-9]+(\-|\.)[0-9]+(\-|\.)[0-9]/))
                formatMatched = true;
            else
                formatMatched = false;
            // id column is present only in the Business
            if (formatMatched && transaction[this.colId].length >= 0)
                formatMatched = true;
            else
                formatMatched = false;

            if (formatMatched)
                return true;
        }

    }

    formatColumnsNames(columnsTemps) {
        let columns = [];
        for (var i = 0; i <= columnsTemps.length; i++) {
            var colName = columnsTemps[i];
            switch (colName) {
                case "Date started (UTC)":
                    colName = "Date";
                    break;
                case "Card number":
                    colName = "CardNr";
                    break;
                case "Orig currency":
                    colName = "OrigCurr";
                    break;
                case "Orig amount":
                    colName = "OrigAmount";
                    break;
                case "Payment currency":
                    colName = "PaymentCurr";
                    break;
            }
            columns.push(colName);
        }

        return columns;
    }

    //Override the utilities method by adding language control
    convertCsvToIntermediaryData(transactions, convertionParam) {
        var form = [];
        var intermediaryData = [];

        //Variables used to save the columns titles and the rows values
        var columnsTemps = this.getHeaderData(transactions, convertionParam.headerLineStart); //array
        var rows = this.getRowData(transactions, convertionParam.dataLineStart); //array of array
        let columns = [];

        //format the columns
        columns = this.formatColumnsNames(columnsTemps);

        //Load the form with data taken from the array. Create objects
        this.loadForm(form, columns, rows);

        //For each row of the form, we call the rowConverter() function and we save the converted data
        for (var i = 0; i < form.length; i++) {
            let convertedRow = {};
            convertedRow = this.translateHeader(form[i], convertedRow);
            intermediaryData.push(convertedRow);
        }

        return intermediaryData;
    }

    translateHeader(inputRow, convertedRow) {
        //Get the Banana Columns Name from csv file columns name
        let descText = "";
        let amountValue = "";
        let feeValue = "";
        let totAmount = "";

        convertedRow['Date'] = Banana.Converter.toInternalDateFormat(inputRow["Date"], "yyyy-mm-dd");
        descText = inputRow["Type"] + ", " + inputRow["Description"] + " " + inputRow["Reference"];
        convertedRow["Description"] = descText;
        convertedRow["ExternalReference"] = inputRow["ID"];

        //Get the total amount
        amountValue = inputRow["Amount"];
        feeValue = inputRow["Fee"];
        totAmount = calculateAmount(amountValue, feeValue);
        //Define if the amount is an income or an expenses.
        convertedRow["Expenses"] = "";
        convertedRow["Income"] = "";

        if (inputRow["Amount"].indexOf("-") == -1) {
            convertedRow["Income"] = totAmount;
        } else {
            convertedRow["Expenses"] = totAmount;
        }

        return convertedRow;
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
        for (var i = 0; i < intermediaryData.length; i++) {
            var convertedData = intermediaryData[i];

            //Invert values
            if (convertedData["Expenses"]) {
                convertedData["Expenses"] = Banana.SDecimal.invert(convertedData["Expenses"]);
            }
        }
    }
}

/**
 * CSV  structure format 3 Business All transactions
 */
var ImportRevolutBusinessFormat3 = class ImportRevolutBusinessFormat3 extends ImportUtilities {
    constructor(banDocument) {
        super(banDocument);
    }

    match(transactionsData) {
        if (transactionsData.length === 0)
            return false;
        for (var i = 0; i < transactionsData.length; i++) {
            var transaction = transactionsData[i];
            var formatMatched = true;

            if (formatMatched && transaction["Date started (UTC)"] && transaction["Date started (UTC)"].length >= 10 &&
                transaction["Date started (UTC)"].match(/^[0-9]+(\-|\.)[0-9]+(\-|\.)[0-9]/))
                formatMatched = true;
            else
                formatMatched = false;

            if (formatMatched && transaction["Date completed (UTC)"] && transaction["Date completed (UTC)"].length >= 10 &&
                transaction["Date completed (UTC)"].match(/^[0-9]+(\-|\.)[0-9]+(\-|\.)[0-9]/))
                formatMatched = true;
            else
                formatMatched = false;

            if (formatMatched)
                return true;
        }
        return false;
    }

    //Override the utilities method by adding language control
    convertCsvToIntermediaryData(transactionsData) {
        var transactionsToImport = [];
        for (var i = 0; i < transactionsData.length; i++) {
            if (transactionsData[i]["Date started (UTC)"] && transactionsData[i]["Date started (UTC)"].length >= 10 &&
                transactionsData[i]["Date started (UTC)"].match(/^[0-9]+(\-|\.)[0-9]+(\-|\.)[0-9]/)) {
                transactionsToImport.push(this.mapTransaction(transactionsData[i]));
            }
        }

        // Sort rows by date
        transactionsToImport = transactionsToImport.reverse();

        // Add header and return
        var header = [["Date", "DateValue", "Doc", "ExternalReference", "Description", "Income", "Expenses"]];
        return header.concat(transactionsToImport);
    }

    mapTransaction(transaction) {

        let mappedLine = [];
        let descText = "";
        let amount = "";
        let feeAmount = "";
        let absFeeAmount = "";
        let absAmount = "";
        let totAmount = "";

        mappedLine.push(Banana.Converter.toInternalDateFormat(transaction["Date started (UTC)"], "yyyy-mm-dd"));
        mappedLine.push(Banana.Converter.toInternalDateFormat(transaction["Date completed (UTC)"], "yyyy-mm-dd"));
        mappedLine.push("");
        mappedLine.push(transaction["ID"]);
        descText = transaction["Type"] + ", " + transaction["Description"] + " " + transaction["Payer"];
        mappedLine.push(descText);
        amount = transaction["Amount"];
        feeAmount = transaction["Fee"];
        if (transaction["Amount"].indexOf("-") == -1) {
            totAmount = calculateAmount(amount, feeAmount);
            mappedLine.push(Banana.Converter.toInternalNumberFormat(totAmount, '.'));
            mappedLine.push("");
        } else {
            absAmount = Banana.SDecimal.abs(amount);
            absFeeAmount = Banana.SDecimal.abs(feeAmount);
            totAmount = calculateAmount(absAmount, absFeeAmount);
            mappedLine.push("");
            mappedLine.push(Banana.Converter.toInternalNumberFormat(totAmount, '.'));
        }

        return mappedLine;
    }
}

/**
 * CSV  structure format 1 for Revoluts Business Expenses Report
 * For more info see:
 * - https://help.revolut.com/en-IT/business/help/managing-my-business/expenses/introduction-to-expenses/what-information-does-the-expenses-csv-export-contain/
 * 
 */
var ImportRevolutBusinessExpensesFormat1 = class ImportRevolutBusinessExpensesFormat1 extends ImportUtilities {
    constructor(banDocument) {
        super(banDocument);
    }

    match(transactionsData) {
        if (transactionsData.length === 0)
            return false;
        for (var i = 0; i < transactionsData.length; i++) {
            var transaction = transactionsData[i];
            var formatMatched = true;

            if (formatMatched && transaction["Transaction started (UTC)"] && transaction["Transaction started (UTC)"].length >= 10 &&
                transaction["Transaction started (UTC)"].match(/^[0-9]+(\-|\.)[0-9]+(\-|\.)[0-9]/))
                formatMatched = true;
            else
                formatMatched = false;

            if (formatMatched && transaction["Transaction completed (UTC)"] && transaction["Transaction completed (UTC)"].length >= 10 &&
                transaction["Transaction completed (UTC)"].match(/^[0-9]+(\-|\.)[0-9]+(\-|\.)[0-9]/))
                formatMatched = true;
            else
                formatMatched = false;

            if (formatMatched)
                return true;
        }
        return false;
    }

    //Override the utilities method by adding language control
    convertCsvToIntermediaryData(transactionsData) {
        var transactionsToImport = [];
        for (var i = 0; i < transactionsData.length; i++) {
            if (transactionsData[i]["Transaction started (UTC)"] && transactionsData[i]["Transaction started (UTC)"].length >= 10 &&
                transactionsData[i]["Transaction started (UTC)"].match(/^[0-9]+(\-|\.)[0-9]+(\-|\.)[0-9]/)) {
                transactionsToImport.push(this.mapTransaction(transactionsData[i]));
            }
        }

        // Sort rows by date
        transactionsToImport = transactionsToImport.reverse();

        // Add header and return
        var header = [["Date", "DateValue", "Doc", "ExternalReference", "Description", "Income", "Expenses"]];
        return header.concat(transactionsToImport);
    }

    mapTransaction(transaction) {

        let mappedLine = [];
        let descText = "";
        let amountValue = "";
        let feeValue = "";
        let totAmount = "";


        mappedLine.push(Banana.Converter.toInternalDateFormat(transaction["Transaction started (UTC)"], "yyyy-mm-dd"));
        mappedLine.push(Banana.Converter.toInternalDateFormat(transaction["Transaction completed (UTC)"], "yyyy-mm-dd"));
        mappedLine.push("");
        mappedLine.push(transaction["Transaction ID"]);
        descText = transaction["Transaction type"] + ", " + transaction["Transaction description"] + " " + transaction["Payer"];
        mappedLine.push(descText);
        amountValue = transaction["Amount (Payment currency)"];
        feeValue = transaction["Fee"];
        totAmount = calculateAmount(amountValue, feeValue);
        mappedLine.push("");
        mappedLine.push(Banana.Converter.toInternalNumberFormat(totAmount, '.'));

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
        for (var i = 0; i < intermediaryData.length; i++) {
            var convertedData = intermediaryData[i];

            //Invert values
            if (convertedData["Expenses"]) {
                convertedData["Expenses"] = Banana.SDecimal.invert(convertedData["Expenses"]);
            }
        }
    }
}

function getFormattedData(inData, convertionParam, importUtilities) {
    var columns = importUtilities.getHeaderData(inData, convertionParam.headerLineStart); //array
    var rows = importUtilities.getRowData(inData, convertionParam.dataLineStart); //array of array
    let form = [];
    //Load the form with data taken from the array. Create objects
    importUtilities.loadForm(form, columns, rows);
    return form;
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
/**
 * Returns the amount without sign.
 * in the csv file you normally have two fields that could have a negative amounts:
 * -amount
 * -fee
 * @param {*} amount 
 */
function getAmountWithoutSign(amount) {
    let cleanAmt = "";
    if (amount.indexOf("-") != -1) {
        cleanAmt = amount.replace("-", "");
        return cleanAmt;
    } else {
        return amount;
    }
}

function calculateAmount(netAmount, fee) {
    let amount = "";
    amount = Banana.SDecimal.add(Banana.SDecimal.abs(netAmount), Banana.SDecimal.abs(fee));
    return amount;
}