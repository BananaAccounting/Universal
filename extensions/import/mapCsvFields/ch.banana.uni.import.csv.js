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
    let csvRows = readCsvFile(inData, userParams);
    let transactions = convertRows(csvRows);

    //Implementare la logica per la lettura del file csv.

    return "";
}

function readCsvFile(inData, userParams) {
    let csvRows = [];
    if (userParams) {
        csvRows = Banana.Converter.csvToArray(inData, userParams.fieldsDelimiter,
            userParams.textDelimiter);
        if (csvRows.length >= 0) {
            return csvRows;
        }
    }
    return csvRows;
}

function convertRows(csvRows) {

    for (i = 0; i < csvRows.length; i++) {
        var transaction = csvRows[i];
        //Banana.console.debug(transaction);
    }


}