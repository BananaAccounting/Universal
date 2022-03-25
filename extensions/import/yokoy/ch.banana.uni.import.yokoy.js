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
// @description = Yokoy import transactions (*.csv)
// @doctype = 100.*
// @docproperties =
// @task = import.transactions
// @outputformat = tablewithheaders
// @inputdatasource = openfiledialog
// @inputfilefilter = Text files (*.txt *.csv);;All files (*.*)
// @timeout = -1
// @includejs = import.utilities.js

/**
 * Parse the yokoy file and return a string in with data in tab separated
 * Actually works only for double entry accounting because the file already has debit and credit account:
 * 
 * Datum;Beleg;Beschreibung;KtSoll;KtHaben;BetragCHF;MwSt/USt- Code
 * 03.03.21;uReKDacEo;IT Hardware, Y. Support, Personalentwicklung 2021/03, Migros;;1213;14;
 * 02.03.21;uReKDacEo;IT Hardware, Y. Support, Personalentwicklung 2021/03, Migros;6583;;13.78;33
 * 01.03.21;uReKDacEo;IT Hardware, Y. Support, Personalentwicklung 2021/03, Migros;6583;;0.22;35
 * 
 */
function exec(inData,isTest) {

    var convertionParam = "";
    var intermediaryData = "";

    if (!inData)
        return "";

    var importYokoyTrans = new ImportYokoyTrans(Banana.document);

//Check the input and the version
    if (isTest!==true && !importYokoyTrans.verifyBananaAdvancedVersion())
        return "";

    //1. Function call to define the conversion parameters
    convertionParam = importYokoyTrans.defineConversionParam(inData);

    //2. intermediaryData is an array of objects where the property is the banana column name
    var intermediaryData = importYokoyTrans.convertCsvToIntermediaryData(inData, convertionParam);

    //3. sort data
    intermediaryData = importYokoyTrans.sortData(intermediaryData, convertionParam);

    return importYokoyTrans.convertToBananaFormat(intermediaryData);
}

var ImportYokoyTrans = class ImportYokoyTrans extends ImportUtilities {
    constructor(banDocument) {
        super(banDocument);
    }

    defineConversionParam(inData) {

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

        /* rowConvert is a function that convert the inputRow (passed as parameter)
         *  to a convertedRow object 
         * - inputRow is an object where the properties are the columns name found in the CSV file
         * - convertedRow is an  object where the properties are the columns name to be exported in Banana 
         * For each column that you need to export in Banana creates a line that create convertedRow column 
         * The right part can be any fuction or value 
         * Remember that in Banana
         * - Date must be in the format "yyyy-mm-dd"
         * - Number decimal separator must be "." and there should be no thousand separator */
        convertionParam.rowConverter = function(inputRow, lang) {
            var convertedRow = {};
            switch (lang) {
                case 'en':
                    return translateHeaderEn(inputRow, convertedRow);
                case 'de':
                    return translateHeaderDe(inputRow, convertedRow);
                case 'nl':
                    return translateHeaderNl(inputRow, convertedRow);
                default:
                    return convertedRow;
            }
        }

        return convertionParam;
    }

    //Override the utilities method by adding language control
    convertCsvToIntermediaryData(inData, convertionParam) {
        var form = [];
        var intermediaryData = [];
        var lang = "";
        //Add the header if present 
        if (convertionParam.header) {
            inData = convertionParam.header + inData;
        }

        //Read the CSV file and create an array with the data
        var csvFile = Banana.Converter.csvToArray(inData, convertionParam.separator, convertionParam.textDelim);

        //Variables used to save the columns titles and the rows values
        var columns = this.getHeaderData(csvFile, convertionParam.headerLineStart); //array
        var rows = this.getRowData(csvFile, convertionParam.dataLineStart); //array of array

        //Load the form with data taken from the array. Create objects
        this.loadForm(form, columns, rows);

        //get the language of the headers
        lang = this.getLanguage(columns);

        //Create the new CSV file with converted data
        var convertedRow;
        //For each row of the form, we call the rowConverter() function and we save the converted data
        for (var i = 0; i < form.length; i++) {
            convertedRow = convertionParam.rowConverter(form[i], lang);
            intermediaryData.push(convertedRow);
        }

        //Return the converted CSV data into the Banana document table
        return intermediaryData;
    }


    getLanguage(headers) {
        //I check the description field (since in de and nl the date field is the same
        var lang = "";
        for (var i = 0; i < headers.length; ++i) {
            if (headers[i]) {
                if (headers[i].toLowerCase() === 'description') {
                    lang = 'en';
                    return lang;
                }
                if (headers[i].toLowerCase() === 'beschreibung') {
                    lang = 'de';
                    return lang;
                }
                if (headers[i].toLowerCase() === 'beschrijving') {
                    lang = 'nl';
                    return lang;
                }
            }
        }
    }
}

function translateHeaderEn(inputRow, convertedRow) {
    //to be defined when we have the test cases
    return convertedRow;
}

function translateHeaderDe(inputRow, convertedRow) {
    //get the Banana Columns Name from german csv file columns name
    convertedRow['Date'] = Banana.Converter.toInternalDateFormat(inputRow["Datum"], "dd.mm.yyyy");
    convertedRow["Description"] = inputRow["Beschreibung"];
    convertedRow["ExternalReference"] = inputRow["Beleg"];
    /* use the Banana.Converter.toInternalNumberFormat to convert to the appropriate number format */
    convertedRow["AccountDebit"] = Banana.Converter.toInternalNumberFormat(inputRow["KtSoll"]);
    convertedRow["AccountCredit"] = Banana.Converter.toInternalNumberFormat(inputRow["KtHaben"]);
    convertedRow["Amount"] = Banana.Converter.toInternalNumberFormat(inputRow["BetragCHF"]);
    convertedRow["VatCode"] = Banana.Converter.toInternalNumberFormat(inputRow["MwSt/USt- Code"]);
    return convertedRow;
}

function translateHeaderNl(inputRow, convertedRow) {
    //to be defined when we have the test cases
    return convertedRow;
}

function verifyBananaVersion() {
    var BAN_VERSION_MIN = "10.0.5";

    var supportedVersion = false;
    if (Banana.compareVersion && Banana.compareVersion(Banana.application.version, BAN_VERSION_MIN) >= 0) {
        supportedVersion = true;
    }

    if (!supportedVersion) {
        var lang = 'en';
        if (Banana.document) {
            if (Banana.document.locale)
                lang = Banana.document.locale;
            if (lang.length > 2)
                lang = lang.substr(0, 2);
        }
        var msg = "This script does not run with your current version of Banana Accounting.\nMinimum version required: %1.\nTo update or for more information click on Help";
        if (lang == 'it')
            msg = "Lo script non funziona con la vostra attuale versione di Banana Contabilità.\nVersione minimina richiesta: %1.\nPer aggiornare o per maggiori informazioni cliccare su Aiuto";
        else if (lang == 'fr')
            msg = "Ce script ne s'exécute pas avec votre version actuelle de Banana Comptabilité.\nVersion minimale requise: %1.\nPour mettre à jour ou pour plus d'informations, cliquez sur Aide";
        else if (lang == 'de')
            msg = "Das Skript wird mit Ihrer aktuellen Version von Banana Buchhaltung nicht ausgeführt.\nMindestversion erforderlich: %1.\nKlicken Sie auf Hilfe, um zu aktualisieren oder weitere Informationen zu bekommen";

        msg = msg.replace("%1", BAN_VERSION_MIN);
        if (Banana.document)
            Banana.document.addMessage(msg, this.ID_ERR_VERSION_NOTSUPPORTED);
        return false;
    }
    return true;
}