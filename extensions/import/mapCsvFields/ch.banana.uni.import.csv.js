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

function exec(inData, test) {

    let importUtilities = new ImportUtilities(Banana.document);

    if (!importUtilities.verifyBananaAdvancedVersion())
        return "";

    let dlgMapCsvFields = new DlgMapCsvFields();

    if (!dlgMapCsvFields.settingsDialog()) {
        return "@Cancel";
    }

    let userParams = dlgMapCsvFields.dialogParam;
    if (Object.keys(userParams).length > 0) {
        let csvReader = new CsvReader(inData, userParams);
        let transactions = csvReader.getCsvTransactions();
        if (transactions.length >= 0) {
            return Banana.Converter.arrayToTsv(transactions);
        }
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

    getCsvTransactions() {
        let csvRows = [];
        csvRows = Banana.Converter.csvToArray(this.inData, this.fieldsDelim,
            this.textDelim);
        if (csvRows.length >= 0) {
            return this.convertRows(csvRows);
        }
        return csvRows;
    }
    convertRows(csvRows) {

        let transactionsToImport = [];

        for (let i = 0; i < csvRows.length; i++) {
            let transaction = csvRows[i];
            if (this.transactionMatch(transaction)) {
                transactionsToImport.push(this.mapTransaction(csvRows[i]));
            } else {
                //Aggiungere messaggio con info sulla registrazione.
            }
        }

        //Order the entries by Date.
        transactionsToImport = transactionsToImport.reverse();

        // Add header and return
        var header = [["Date", "Description", "Income", "Expenses"]];
        return header.concat(transactionsToImport);
    }

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
                //Banana.console.debug("orig char: " + parsedDate[i]);
                if (!isNaN(parsedDate[i])) {
                    continue; // Il carattere è numerico, continua con il prossimo carattere
                }
                /**Il carattere della data parsata non è numerico, 
                 * controllo se è lo stesso anche con quello della data originale alla posizionie i.
                 * cosi controllo che almeno le posizioni (giorni, mesi e anni) siano rimasti gli stessi.
                 *  */
                let char = rowDate.indexOf(i);
                //Banana.console.debug("orig char: " + parsedDate[i]);
                if (isNaN(char)) {
                    return false;
                }
            }
            return true;
        }
        return false;
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
                mappedTr.push("");
                mappedTr.push(Banana.Converter.toInternalNumberFormat(amountCol, this.decimalSep));
            } else { //It's a credit amount.
                mappedTr.push(Banana.Converter.toInternalNumberFormat(amountCol, this.decimalSep));
                mappedTr.push("");
            }
        }

        return mappedTr;

    }
}

