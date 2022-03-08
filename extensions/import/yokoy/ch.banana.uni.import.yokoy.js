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
// @description = Yokoy Import (*.csv)
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

	if (!inData)
		return "@Cancel";

    var convertionParam="";
    var intermediaryData="";
	
    var importYokoyTrans = new ImportYokoyTrans(Banana.document);

    //1. Function call to define the conversion parameters
    convertionParam = importYokoyTrans.defineConversionParam(inData);

    //2. intermediaryData is an array of objects where the property is the banana column name
    var intermediaryData = importYokoyTrans.convertToIntermediaryData(inData, convertionParam);

    //3. Here I can translate data

    //4. sort data
    intermediaryData = importYokoyTrans.sortData(intermediaryData, convertionParam);

    return importYokoyTrans.convertToBananaFormat(intermediaryData);
}

var ImportYokoyTrans = class ImportYokoyTrans extends ImportUtilities {
	constructor(banDocument) {
		super(banDocument);
	}

    defineConversionParam(inData){

        var csvData=Banana.Converter.csvToArray(inData);
        Banana.Ui.showText(JSON.stringify(csvData));
        var header = String(csvData[0]);
        var convertionParam = {};
		/** SPECIFY THE SEPARATOR AND THE TEXT DELIMITER USED IN THE CSV FILE */
		convertionParam.format = "csv"; // available formats are "csv", "html"
        //get text delimiter
        if(header.indexOf("\"") >= 0){
		    convertionParam.textDelim = "\"";
        }else{
            convertionParam.textDelim = '';
        }
        // get separator
	    if (header.indexOf(';') >= 0) {
            convertionParam.separator = ';';
	    }else{
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
		convertionParam.rowConverter = function (inputRow) {
			var convertedRow = {};
            //Banana.Ui.showText(JSON.stringify());

			/** MODIFY THE FIELDS NAME AND THE CONVERTION HERE 
			*   The right part is a statements that is then executed for each inputRow
			
			/*   Field that start with the underscore "_" will not be exported
			*    Create this fields so that you can use-it in the postprocessing function */
			if (inputRow["Datum"]) {
				convertedRow["Date"] = Banana.Converter.toInternalDateFormat(inputRow["Datum"], "dd.mm.yyyy");
			}
			convertedRow["Description"] = inputRow["Beschreibung"];
            convertedRow["Description"] = inputRow["Beschreibung"];
            convertedRow["Notes"] = inputRow["Beleg"];
			/* use the Banana.Converter.toInternalNumberFormat to convert to the appropriate number format */
			convertedRow["AccountDebit"] = Banana.Converter.toInternalNumberFormat(inputRow["KtSoll"]);
			convertedRow["AccountCredit"] = Banana.Converter.toInternalNumberFormat(inputRow["KtHaben"]);
            convertedRow["VatCode"] = Banana.Converter.toInternalNumberFormat(inputRow["MwSt/USt- Code"]);

			/** END */

			return convertedRow;
		};

        return convertionParam;
    }
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