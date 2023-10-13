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
// @id = ch.banana.uni.mport.csv.js
// @api = 1.0
// @pubdate = 2023-08-22
// @publisher = Banana.ch SA
// @description = Import CSV
// @description.it = Importa CSV
// @description.en = Import CSV
// @description.de = CSV-Datei importieren
// @description.fr = Importer CSV
// @doctype = *
// @docproperties =
// @task = import.transactions
// @outputformat = transactions.simple
// @inputdatasource = openfiledialog
// @inputencoding = latin1
// @inputfilefilter = Text files (*.txt *.csv);;All files (*.*)
// @timeout = -1
// @includejs = import.utilities.js
// @includejs = ch.banana.uni.dlgmap.csv.js

/**
 * 
 * The exec function calls the Map dialog each time is executed.
 */

function exec(inData, isTest) {

    let importUtilities = new ImportUtilities(Banana.document);
    let errId = "ID_ERR_FORMAT_NOT_MATCH";

    if (!importUtilities.verifyBananaAdvancedVersion())
        return "";

    let dlgMapCsvFields = new DlgMapCsvFields();

    if (!dlgMapCsvFields.settingsDialog()) {
        return "";
    }

    let userParams = dlgMapCsvFields.dialogParam;
    if (Object.keys(userParams).length > 0) {
        let csvReader = new CsvReader(inData, userParams);
        let csvRows = Banana.Converter.csvToArray(csvReader.inData, csvReader.fieldsDelim,
            csvReader.textDelim);
        if (csvReader.separatorMatch(inData) && csvReader.formatMatch(csvRows)) {
            let transactions = csvReader.getCsvTransactions(csvRows);
            if (transactions.length >= 0) {
                return Banana.Converter.arrayToTsv(transactions);
            }
        }
        getErrorMessage(errId);
    }

    return "";
}

var CsvReader = class CsvReader {
    constructor(inData, userParams) {
        /** Initialize fields to be imported with values defined by the user */
        this.inData = inData;
        this.dateFormat = userParams.dateFormat;
        this.dateCol = Banana.SDecimal.subtract(userParams.dateColumn, 1);
        this.descriptionCol = Banana.SDecimal.subtract(userParams.descriptionColumn, 1);
        this.amountCol = userParams.amountColumn;
        this.decimalSep = userParams.decimalSeparator;
        this.fieldsDelim = userParams.fieldsDelimiter;
        this.textDelim = userParams.textDelimiter;
    }

    separatorMatch(stringRows) {

        if (this.findSeparator(stringRows) == this.fieldsDelim) {
            return true;
        }
        return false;
    }

    formatMatch(csvRows) {
        if (csvRows.length === 0)
            return false;


        for (var i = 0; i < csvRows.length; i++) {
            var row = csvRows[i];

            var formatMatched = false;

            /** Eseguo i controlli sui parametri che l'utente mi ha fornito per identificare le colonne. */

            //Controllo se il formato data coincide.
            if (row[this.dateCol] && this.dateFormatMatch(row[this.dateCol])) {
                formatMatched = true;
            }

            if (formatMatched)
                return true;
        }

        return false;
    }

    getCsvTransactions(csvRows) {
        let transactionsToImport = [];
        if (csvRows && csvRows.length >= 0) {
            for (let i = 0; i < csvRows.length; i++) {
                if (this.transactionMatch(csvRows[i])) {
                    transactionsToImport.push(this.mapTransaction(csvRows[i]));
                }
            }
            //Order the entries by Date.
            transactionsToImport = transactionsToImport.reverse();
            // Add header and return
            var header = [["Date", "Description", "Income", "Expenses"]];
            return header.concat(transactionsToImport);
        }
        return transactionsToImport;
    }

    mapTransaction(transaction) {
        /** User starts counting columns from 1, we start from 0 */
        let mappedTr = [];
        let amtColumns = [];

        mappedTr.push(Banana.Converter.toInternalDateFormat(transaction[this.dateCol], this.dateFormat));
        mappedTr.push(transaction[this.descriptionCol]);
        if (this.amountCol.indexOf(";") >= 0) {
            // Debit and Credit amounts are on two different columns.
            amtColumns = this.amountCol.split(";");
            //Prima la colonna di accredito e poi di addebito
            if (amtColumns.length == 2) { // 2 columns: [1] = Credit amount and [2] = Debit amount
                let creditAmt = transaction[Banana.SDecimal.subtract(amtColumns[0], 1)];
                let debitAmt = transaction[Banana.SDecimal.subtract(amtColumns[1], 1)];
                debitAmt = debitAmt.replace(/-/g, '');
                mappedTr.push(Banana.Converter.toInternalNumberFormat(creditAmt, this.decimalSep));
                mappedTr.push(Banana.Converter.toInternalNumberFormat(debitAmt, this.decimalSep));
            } else {
                mappedTr.push("");
                mappedTr.push("");
            }
        } else {
            /** Debit and Credit amounts are on the same column. 
             * In this case, the debit amount MUST be identified a minus: "-"
            */
            let amountCol = transaction[Banana.SDecimal.subtract(this.amountCol, 1)];
            if (amountCol.indexOf("-") >= 0) { // It's a debit amount.
                amountCol = amountCol.replace(/-/g, '');
                mappedTr.push("");
                mappedTr.push(Banana.Converter.toInternalNumberFormat(amountCol, this.decimalSep));
            } else { //It's a credit amount.
                mappedTr.push(Banana.Converter.toInternalNumberFormat(amountCol, this.decimalSep));
                mappedTr.push("");
            }
        }

        return mappedTr;

    }

    /** 
     * Per ora lo uso per controllare se si tratta di un movimento che voglio prendere in considerazione 
     * o di una di quelle righe che non mi interessa (come l'header o eventuali righe iniziali o finali)
     */
    transactionMatch(transaction) {
        if (this.dateFormatMatch(transaction[this.dateCol])) {
            return true;
        }

        return false;
    }

    dateFormatMatch(rowDate) {
        if (rowDate && rowDate.length == this.dateFormat.length) {
            let parsedDate = Banana.Converter.toInternalDateFormat(rowDate, this.dateFormat);
            //Dopo la conversione controllo che il formato risulti ancora corretto.
            for (let i = 0; i < parsedDate.length; i++) {
                if (!isNaN(parsedDate[i])) {
                    continue; // Il carattere è numerico, continua con il prossimo carattere
                }
                /**Il carattere della data parsata non è numerico, 
                 * controllo se è lo stesso anche con quello della data originale alla posizionie i.
                 * cosi controllo che almeno le posizioni (giorni, mesi e anni) siano rimasti gli stessi.
                 *  */
                let char = rowDate.indexOf(i);
                if (isNaN(char)) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }

    findSeparator(string) {

        var commaCount = 0;
        var semicolonCount = 0;
        var tabCount = 0;

        for (var i = 0; i < 1000 && i < string.length; i++) {
            var c = string[i];
            if (c === ',')
                commaCount++;
            else if (c === ';')
                semicolonCount++;
            else if (c === '\t')
                tabCount++;
        }

        if (tabCount > commaCount && tabCount > semicolonCount) {
            return '\t';
        }
        else if (semicolonCount > commaCount) {
            return ';';
        }

        return ',';
    }
}

function getLang() {
    var lang = 'en';
    if (Banana.application.locale)
        lang = Banana.application.locale;
    if (lang.length > 2)
        lang = lang.substring(0, 2);
    return lang;
}


function getErrorSpecificMessage(errorId, lang) {
    if (!lang)
        lang = 'en';
    switch (errorId) {
        case "ID_ERR_FORMAT_NOT_MATCH":
            if (lang == 'it')
                return "Il formato del file non corrisponde ai parametri";
            else if (lang == 'fr')
                return "Le format du fichier ne correspond pas aux paramètres";
            else if (lang == 'de')
                return "Das Dateiformat stimmt nicht mit den Parametern überein";
            else
                return "The file format does not match the parameters";
    }
    return '';
}

function getErrorMessage(errID) {
    let lang = getLang();
    let msg = getErrorSpecificMessage(errID, lang);
    Banana.document.addMessage(msg, errID);
}

