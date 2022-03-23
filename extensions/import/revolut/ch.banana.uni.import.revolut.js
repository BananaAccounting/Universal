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
// @id = ch.banana.uni.import.revolut
// @api = 1.0
// @pubdate = 2022-03-23
// @publisher = Banana.ch SA
// @description = Revolut Import (*.csv)
// @doctype = *
// @docproperties =
// @task = import.transactions
// @outputformat = tablewithheaders
// @inputdatasource = openfiledialog
// @inputfilefilter = Text files (*.txt *.csv);;All files (*.*)
// @timeout = -1
// @includejs = import.utilities.js

/**
 * Parse the yokoy file and return a string in with data in tab separated
 */
function exec(inData) {

    if (!inData || !verifyBananaVersion())
        return "@Cancel";

    var convertionParam = "";
    var intermediaryData = "";

    var importRevolutTrans = new ImportRevolutTrans(Banana.document);

    //1. Function call to define the conversion parameters
    convertionParam = importRevolutTrans.defineConversionParam(inData);

    //2. intermediaryData is an array of objects where the property is the banana column name
    var intermediaryData = importRevolutTrans.convertCsvToIntermediaryData(inData, convertionParam);

    //3. sort data
    intermediaryData = importRevolutTrans.sortData(intermediaryData, convertionParam);

    Banana.Ui.showText(JSON.stringify(intermediaryData));

    return importRevolutTrans.convertToBananaFormat(intermediaryData);
}

/*
Date started (UTC),Date completed (UTC),Date started (Europe/Zurich),Date completed (Europe/Zurich),ID,Type,Description,Reference,Payer,Card number,Orig currency,Orig amount,Payment currency,Amount,Fee,Balance,Account,Beneficiary account number,Beneficiary sort code or routing number,Beneficiary IBAN,Beneficiary BIC
2022-07-03,2022-07-04,2022-07-03,2022-07-04,1234abc-def456,CARD_PAYMENT,Payment with card,,Bruno Frey,1234567890,USD,59.00,CHF,-54.26,-0.22,2621.00,Bank CHF,,,,
2022-07-03,2022-07-03,2022-07-03,2022-07-03,1234abc-def456,CARD_PAYMENT,Payment with card,,Bruno Frey,1234567890,CHF,0.00,CHF,0.00,0.00,2675.48,Bank CHF,,,,
2
*/

var ImportRevolutTrans = class ImportRevolutTrans extends ImportUtilities {
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
        convertionParam.sortColums = ["Date completed (UTC)", "Description"];
        convertionParam.sortDescending = false;

        //Create the new CSV file with converted data
        var convertedRow;

        /* rowConvert is a function that convert the inputRow (passed as parameter)
         *  to a convertedRow object */
        convertionParam.rowConverter = function(inputRow) {
            return translateHeader(inputRow, convertedRow);
        }

        return convertionParam;
    }

    //Override the utilities method by adding language control
    convertCsvToIntermediaryData(inData, convertionParam) {
        var form = [];
        var intermediaryData = [];
        //Add the header if present 
        if (convertionParam.header) {
            inData = convertionParam.header + inData;
        }

        //Read the CSV file and create an array with the data
        var csvFile = Banana.Converter.csvToArray(inData, convertionParam.separator, convertionParam.textDelim);

        //Variables used to save the columns titles and the rows values
        var columnsTemps = this.getHeaderData(csvFile, convertionParam.headerLineStart); //array
        var rows = this.getRowData(csvFile, convertionParam.dataLineStart); //array of array
        let columns=[];

        //format the columns
        columns=formatColumnsNames(columnsTemps);

        //Load the form with data taken from the array. Create objects
        this.loadForm(form, columns, rows);

        //For each row of the form, we call the rowConverter() function and we save the converted data
        for (var i = 0; i < form.length; i++) {
            convertedRow = convertionParam.rowConverter(form[i]);
            intermediaryData.push(convertedRow);
        }

        return intermediaryData;
    }
}

function formatColumnsNames(columnsTemps){
    let columns=[];
    for (var i=0;i<=columnsTemps.length;i++) {
        var colName = columnsTemps[i];
        switch(colName){
            case "Date completed":
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

function translateHeader(inputRow, convertedRow) {
    //get the Banana Columns Name from csv file columns name
    convertedRow['Date'] = Banana.Converter.toInternalDateFormat(inputRow["Date"], "dd.mm.yyyy");
    //get the description test
    let descText=inputRow["Description"]+", "+inputRow["Reference"]+", "+inputRow["ID"]+",Original Amount "+inputRow["OrigAmount"]+", Amount "+inputRow["Amount"]+", Fee "+inputRow["Fee"];
    convertedRow["Description"] = descText;
    //calculate the amount
    convertedRow["Amount"] = calculateAmount(inputRow["Amount"],inputRow["Fee"]);
    return convertedRow;
}

function calculateAmount(netAmount,fee){
    let amount="";
    amount=Banana.SDecimal.add(netAmount,fee);
    return amount;
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