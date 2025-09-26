// Copyright [2025] [Banana.ch SA - Lugano Switzerland]
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//     http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// @api = 1.0
// @id = ch.banana.portfolio.accounting.update.market.prices.js
// @description = 2. Update market prices
// @task = import.file
// @inputdatasource = openfiledialog
// @doctype = 100.*
// @publisher = Banana.ch SA
// @pubdate = 2025-08-25
// @inputdatasource = none
// @timeout = -1
// @inputfilefilter = Text files (*.txt *.csv);;All files (*.*)
// @inputfilefilter.de = Text (*.txt *.csv);;Alle Dateien (*.*)
// @inputfilefilter.fr = Texte (*.txt *.csv);;Tous (*.*)
// @inputfilefilter.it = Testo (*.txt *.csv);;Tutti i files (*.*)
// @includejs = ch.banana.portfolio.accounting.calculation.methods.js
// @includejs = ch.banana.portfolio.accounting.errormessagges.handler.js

/**
 * This extension imports and updates the current prices of the securities with the 
 * latest market prices selected by the user.
 * We reuire the user to select a csv or to select the data directly from excel, the data must have the following format:
 * US123456789;11.04873
 * IT000792468;10.98732
 * ....
 * Without any header !
 */

function exec(inData) {

    let banDoc = Banana.document;

    if (!banDoc)
        return;

    if (!verifyBananaVersion(banDoc))
        return "@Cancel";

    if (!tableExists(banDoc, "Items")) {
        let msg = getErrorMessage_MissingElements("NO_ITEMS_TABLE", "");
        banDoc.addMessage(msg, "NO_ITEMS_TABLE");
        return "";
    }

    let arrData = getArrayData(inData);
    arrData = validateData(banDoc, arrData);

    if (arrData.length < 1)
        return "";

    return getDocChange(banDoc, arrData);
}

function getDocChange(banDoc, arrData) {
    let docChange = { "format": "documentChange", "error": "", "data": [] };
    let jsonDoc = getDocChangeData(banDoc, arrData);
    docChange["data"].push(jsonDoc);
    return docChange;
}

function getArrayData(inData) {
    let convertionParam = defineConversionParam(inData);
    return Banana.Converter.csvToArray(inData, convertionParam.separator, convertionParam.textDelim);
}

function validateData(banDoc, data) {
    // Validate format
    let isValid = true;
    data.forEach(element => {
        if (element.length !== 2) {
            isValid = false;
            return;
        }
    });

    if (!isValid) {
        getUnknownFormatError(banDoc);
        return [];
    }

    // Validate data
    for (let i = data.length - 1; i >= 0; i--) {
        let itemId = data[i][0];
        let itemObj = getItemRowObj(itemId, banDoc);
        if (!isValidItemSelected(itemId, itemObj, banDoc)) {
            data.splice(i, 1);
        }
    }

    return data;
}

function getDocChangeData(banDoc, arrData) {
    let docChangeObj = getDocumentChangeInit();
    let rows = getRowsToModify(banDoc, arrData);

    var dataUnitItemsTable = {};
    dataUnitItemsTable.nameXml = "Items";
    dataUnitItemsTable.data = {};
    dataUnitItemsTable.data.rowLists = [];
    dataUnitItemsTable.data.rowLists.push({ "rows": rows });

    docChangeObj.document.dataUnits.push(dataUnitItemsTable);

    return docChangeObj;
}

function getRowsToModify(banDoc, arrData) {
    let rows = [];

    arrData.forEach(e => {
        let itemId = e[0];
        let marketValue = Banana.Converter.toInternalNumberFormat(e[1], ".");
        let itemObj = getItemRowObj(itemId, banDoc);

        if (!itemObj || isObjectEmpty(itemObj))
            return;

        let row = {};
        row.operation = {};
        row.operation.name = "modify";
        row.operation.sequence = String(itemObj.rowNr);
        row.fields = {};
        row.fields["UnitPriceCurrent"] = marketValue;
        rows.push(row);
    });

    return rows;
}

function getDocumentChangeInit() {

    let jsonDoc = {};
    jsonDoc.document = {};
    jsonDoc.document.dataUnitsfileVersion = "1.0.0";
    jsonDoc.document.dataUnits = [];
    jsonDoc.document.cursorPosition = {};

    jsonDoc.creator = {};
    var d = new Date();
    jsonDoc.creator.name = Banana.script.getParamValue('id');
    jsonDoc.creator.version = "1.0";

    return jsonDoc;

}

function defineConversionParam(inData) {
    var convertionParam = {};
    convertionParam.format = "csv";
    convertionParam.textDelim = '\"';
    convertionParam.separator = findSeparator(inData);

    return convertionParam;
}

function findSeparator(inData) {

    var commaCount = 0;
    var semicolonCount = 0;
    var tabCount = 0;

    for (var i = 0; i < 1000 && i < inData.length; i++) {
        var c = inData[i];
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

function getUnknownFormatError(banDoc) {
    let errId = "ID_ERR_FORMAT_UNKNOWN";
    let lang = getLang();
    let msg = getFormatErrorMessage(errId, lang);
    banDoc.addMessage(msg, errId);
}

function getLang() {
    var lang = 'en';
    if (Banana.application.locale)
        lang = Banana.application.locale;
    if (lang.length > 2)
        lang = lang.substring(0, 2);
    return lang;
}
function getFormatErrorMessage(errorId, lang) {
    if (!lang)
        lang = 'en';
    switch (errorId) {
        case "ID_ERR_FORMAT_UNKNOWN":
            if (lang == 'it')
                return "Formato del file *.csv non riconosciuto";
            else if (lang == 'fr')
                return "Format de fichier *.csv non reconnu";
            else if (lang == 'de')
                return "Unerkanntes *.csv-Dateiformat";
            else
                return "Unrecognised *.csv file format";
    }
    return '';
}