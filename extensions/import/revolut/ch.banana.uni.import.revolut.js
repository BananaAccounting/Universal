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
// @description = Revolut import transactions (*.csv)
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
 * CSV structure
 * Date started (UTC),Date completed (UTC),Date started (Europe/Zurich),Date completed (Europe/Zurich),ID,Type,Description,Reference,Payer,Card number,Orig currency,Orig amount,Payment currency,Amount,Fee,Balance,Account,Beneficiary account number,Beneficiary sort code or routing number,Beneficiary IBAN,Beneficiary BIC
 * 2022-07-03,2022-07-04,2022-07-03,2022-07-04,1234abc-def456,CARD_PAYMENT,Payment with card,,Bruno Frey,1234567890,USD,59.00,CHF,-54.26,-0.22,2621.00,Bank CHF,,,,
 * 2022-07-03,2022-07-03,2022-07-03,2022-07-03,1234abc-def456,CARD_PAYMENT,Payment with card,,Bruno Frey,1234567890,CHF,0.00,CHF,0.00,0.00,2675.48,Bank CHF,,,,2
*/

/**
 * Main function
 */
function exec(inData,isTest) {


    var convertionParam = "";
    var intermediaryData = "";

    if (!inData)
        return "";

    var importRevolutTrans = new ImportRevolutTrans(Banana.document);

    if (isTest!==true && !importRevolutTrans.verifyBananaAdvancedVersion())
        return "";

    //1. Function call to define the conversion parameters
    convertionParam = importRevolutTrans.defineConversionParam(inData);
    //2. intermediaryData is an array of objects where the property is the banana column name
    var intermediaryData = importRevolutTrans.convertCsvToIntermediaryData(inData, convertionParam);
    //3. sort data
    intermediaryData = importRevolutTrans.sortData(intermediaryData, convertionParam);
    //4. translate categories and Description 
	// can define as much postProcessIntermediaryData function as needed
	importRevolutTrans.postProcessIntermediaryData(intermediaryData);

    //Banana.Ui.showText(JSON.stringify(intermediaryData));

    return importRevolutTrans.convertToBananaFormat(intermediaryData);
}

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
        convertionParam.sortColums = ["Date", "Description"];
        convertionParam.sortDescending = false;

        /* rowConvert is a function that convert the inputRow (passed as parameter)
         *  to a convertedRow object */
        convertionParam.rowConverter = function(inputRow) {
            let convertedRow={};
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

        let convertedRow;

        //For each row of the form, we call the rowConverter() function and we save the converted data
        for (var i = 0; i < form.length; i++) {
            convertedRow = convertionParam.rowConverter(form[i]);
            intermediaryData.push(convertedRow);
        }

        return intermediaryData;
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

    //Check if the version of Banana Accounting is compatible with this class
    verifyBananaAdvancedVersion() {
        if (!this.banDocument)
            return false;

        if (!Banana.application.license || Banana.application.license.licenseType !== "advanced") {
            var lang = this.getLang();
            var msg = "This extension requires Banana Accounting+ Advanced";
            this.banDocument.addMessage(msg, "ID_ERR_LICENSE_NOTVALID");
            return false;
        }

        return true;
    }
}

function formatColumnsNames(columnsTemps){
    let columns=[];
    for (var i=0;i<=columnsTemps.length;i++) {
        var colName = columnsTemps[i];
        switch(colName){
            case "Date completed (UTC)":
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
    let descText="";
    let totAmount="";
    let amountValue="";

    convertedRow['Date'] = Banana.Converter.toInternalDateFormat(inputRow["Date"], "yyyy.mm.dd");
    descText=inputRow["Description"]+" "+inputRow["Reference"]+" "+" Original Amount "+inputRow["OrigCurr"]+" "+inputRow["OrigAmount"]+" Amount "+inputRow["PaymentCurr"]+" "+getAmountWithoutSign(inputRow["Amount"])+" Fee "+inputRow["PaymentCurr"]+" "+getAmountWithoutSign(inputRow["Fee"]);
    convertedRow["Description"] = descText;
    convertedRow["ExternalReference"] = inputRow["ID"];

    //get the total amount
    amountValue=inputRow["Amount"];
    feeValue=inputRow["Fee"];
    totAmount = calculateAmount(amountValue,feeValue);
    //define if the amount is an income or an expenses.
    convertedRow["Expenses"]="";
    convertedRow["Income"]="";

    if(inputRow["Amount"].indexOf("-")==-1){
        convertedRow["Income"]=totAmount;
    }else{
        convertedRow["Expenses"]=totAmount;
    }


    return convertedRow;
}
/**
 * Returns the amount without sign.
 * in the csv file you normally have two fields that could have a negative amounts:
 * -amount
 * -fee
 * @param {*} amount 
 */
function getAmountWithoutSign(amount){
    let cleanAmt="";
    if(amount.indexOf("-")!=-1){
        cleanAmt=amount.replace("-","");
        return cleanAmt;
    }else{
        return amount;
    }
}

function calculateAmount(netAmount,fee){
    let amount="";
    amount=Banana.SDecimal.add(netAmount,fee);
    return amount;
}