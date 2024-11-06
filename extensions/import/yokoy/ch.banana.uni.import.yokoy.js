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
// @id = ch.banana.uni.import.yokoy
// @api = 1.0
// @pubdate = 2022-03-07
// @publisher = Banana.ch SA
// @description = Yokoy - Import movements .csv (Banana+ Advanced)
// @doctype = 100.110
// @docproperties =
// @task = import.transactions
// @outputformat = transactions.simple
// @inputdatasource = openfiledialog
// @inputfilefilter = Text files (*.txt *.csv);;All files (*.*)
// @timeout = -1
// @includejs = import.utilities.js


function exec(inData, isTest) {

    var convertionParam = "";
    var intermediaryData = "";
    var transactions = "";
    var importUtilities = new ImportUtilities(Banana.document);

    if (!inData)
        return "";

    if (isTest !== true && !importUtilities.verifyBananaAdvancedVersion())
        return "";

    convertionParam = defineConversionParam();
    //Add the header if present 
    if (convertionParam.header) {
        inData = convertionParam.header + inData;
    }
    transactions = Banana.Converter.csvToArray(inData, convertionParam.separator, convertionParam.textDelim);

    var importYokoyTransFormat1 = new ImportYokoyTransFormat1(Banana.document);
    if (importYokoyTransFormat1.match(transactions)) {
        var intermediaryData = importYokoyTransFormat1.convertCsvToIntermediaryData(transactions, convertionParam);
        intermediaryData = importYokoyTransFormat1.sortData(intermediaryData, convertionParam);
        //importRevolutPrivateFormat1.postProcessIntermediaryData(intermediaryData);
        return importYokoyTransFormat1.convertToBananaFormat(intermediaryData);
    }

    // Format is unknow, return an error
    importUtilities.getUnknownFormatError();

    return "";
}

/**
 * CSV file format
 * 
 * Datum;Beleg;Beschreibung;KtSoll;KtHaben;BetragCHF;MWST/USt- Code
 * 03.03.21;uReKDacEo;IT Hardware, Y. Support, Personalentwicklung 2021/03, Migros;;1213;14;
 * 02.03.21;uReKDacEo;IT Hardware, Y. Support, Personalentwicklung 2021/03, Migros;6583;;13.78;33
 * 01.03.21;uReKDacEo;IT Hardware, Y. Support, Personalentwicklung 2021/03, Migros;6583;;0.22;35
 */
var ImportYokoyTransFormat1 = class ImportYokoyTransFormat1 extends ImportUtilities {
    constructor(banDocument) {
        super(banDocument);

        this.colDate = 0;
        this.vatCode = 6;

    }

    match(transactions) {

        if (transactions.length === 0)
            return false;
        for (var i = 0; i < transactions.length; i++) {
            var transaction = transactions[i];

            var formatMatched = false;

            /* array should have all columns */
            if (transaction.length === (this.vatCode + 1))
                formatMatched = true;
            else
                formatMatched = false;

            if (formatMatched && transaction[this.colDate].match(/[0-9\.]+/g) && transaction[this.colDate].length === 8)
                formatMatched = true;
            else
                formatMatched = false;

            if (formatMatched)
                return true;
        }
        return false;
    }

    //Override the utilities method by adding language control
    convertCsvToIntermediaryData(transactions, convertionParam) {
        let form = [];
        let intermediaryData = [];

        /** SPECIFY AT WHICH ROW OF THE CSV FILE IS THE HEADER (COLUMN TITLES)
        We suppose the data will always begin right away after the header line */
        convertionParam.headerLineStart = 0;
        convertionParam.dataLineStart = 1;

        //Variables used to save the columns titles and the rows values
        let columns = this.getHeaderData(transactions, convertionParam.headerLineStart); //array
        let rows = this.getRowData(transactions, convertionParam.dataLineStart); //array of array
        let lang = this.getLanguage(transactions, convertionParam.headerLineStart);

        //Load the form with data taken from the array. Create objects
        this.loadForm(form, columns, rows);
        //get the language of the headers
        //For each row of the form, we call the rowConverter() function and we save the converted data
        for (var i = 0; i < form.length; i++) {
            let convertedRow = {};
            let transaction = form[i];
            switch (lang) {
                case "de":
                    if (transaction["Datum"].match(/[0-9\/]+/g) && transaction["Datum"].length == 8) {
                        convertedRow = this.translateHeaderDe(transaction, convertedRow);
                        intermediaryData.push(convertedRow);
                    }
                    break;
                default:
                    Banana.console.info("csv format not recognised");
            }
        }
        //Return the converted CSV data into the Banana document table
        return intermediaryData;
    }


    getLanguage(transactions, headerRow) {
        //Check language on header field: "Description".
        let lang = "";
        let headerData = transactions[headerRow];
        for (var i = 0; i < headerData.length; i++) {
            let element = headerData[i];
            switch (element) {
                case "Beschreibung":
                    lang = "de";
                    break;
            }
        }
        return lang;
    }

    translateHeaderEn(inputRow, convertedRow) {
        //to be defined when we have the test cases
        return convertedRow;
    }

    translateHeaderDe(inputRow, convertedRow) {
        //get the Banana Columns Name from german csv file columns name
        convertedRow['Date'] = Banana.Converter.toInternalDateFormat(inputRow["Datum"], "dd.mm.yyyy");
        convertedRow["Description"] = inputRow["Beschreibung"];
        convertedRow["ExternalReference"] = inputRow["Beleg"];
        /* use the Banana.Converter.toInternalNumberFormat to convert to the appropriate number format */
        convertedRow["AccountDebit"] = Banana.Converter.toInternalNumberFormat(inputRow["KtSoll"]);
        convertedRow["AccountCredit"] = Banana.Converter.toInternalNumberFormat(inputRow["KtHaben"]);
        convertedRow["Amount"] = Banana.Converter.toInternalNumberFormat(inputRow["BetragCHF"]);
        convertedRow["VatCode"] = Banana.Converter.toInternalNumberFormat(inputRow["MWST/USt- Code"]);
        return convertedRow;
    }

    translateHeaderNl(inputRow, convertedRow) {
        //to be defined when we have the test cases
        return convertedRow;
    }
}

function defineConversionParam() {
    var convertionParam = {};
    /** SPECIFY THE SEPARATOR AND THE TEXT DELIMITER USED IN THE CSV FILE */
    convertionParam.format = "csv"; // available formats are "csv", "html"
    //get text delimiter
    convertionParam.textDelim = '\"';
    // get separator
    convertionParam.separator = ";";

    /** SPECIFY THE COLUMN TO USE FOR SORTING
    If sortColums is empty the data are not sorted */
    convertionParam.sortColums = ["Date", "Description"];
    convertionParam.sortDescending = false;

    return convertionParam;
}