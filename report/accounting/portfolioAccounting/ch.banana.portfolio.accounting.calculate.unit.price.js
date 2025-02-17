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
// @id = ch.banana.portfolio.accounting.calculate.unit.price.js
// @description = 3. Calculate unit price
// @task = app.command
// @doctype = 100.*
// @publisher = Banana.ch SA
// @pubdate = 2025-02-13
// @inputdatasource = none
// @timeout = -1
// @includejs = ch.banana.portfolio.accounting.calculation.methods.js
// @includejs = ch.banana.portfolio.accounting.errormessagges.handler.js

/**
 * This extension returns a document change that adds or modifies the unit price indicated in the current selected line, based on
 * the amount entered.
 */

function exec() {
    let banDoc = Banana.document;

    if (!banDoc)
        return;

    if (!verifyBananaVersion(banDoc))
        return "@Cancel";

    let currentRowNr = getCurrentRowNumber(banDoc, "Transactions");
    let currentRowObj = getCurrentRowObj(banDoc, currentRowNr, "Transactions");
    let docInfo = getDocumentInfo(banDoc);

    if (!currentSelectedRowIsValid(banDoc, docInfo, currentRowObj))
        return "";

    //Ask for the Quantity to add
    let qtSold = Banana.Ui.getText("Calculate unit price", "Quantity sold");

    if (!qtSold)
        return "";

    return getUnitPriceDocChange(banDoc, docInfo, currentRowObj, currentRowNr, qtSold);
}

function currentSelectedRowIsValid(banDoc, docInfo, currentRowObj) {
    if (currentRowObj || !isObjectEmpty(currentRowObj)) {
        // Check if the row contains the quantity.
        let itemIdList = getItemsIds(banDoc);

        if (!currentRowObj.value("ItemsId") || currentRowObj.value("ItemsId") === ""
            || !itemIdList.includes(currentRowObj.value("ItemsId"))) {
            let msg = getErrorMessage_MissingElements("ITEM_ID_MISSING_IN_ROW");
            banDoc.addMessage(msg, "ITEM_ID_MISSING_IN_ROW");
            return false;
        }

        if (docInfo.isMultiCurrency && (!currentRowObj.value("AmountCurrency") || currentRowObj.value("AmountCurrency") === "")) {
            let msg = getErrorMessage_MissingElements("AMOUNT_MISSING_IN_ROW");
            banDoc.addMessage(msg, "AMOUNT_MISSING_IN_ROW");
            return false;
        }

        if (!docInfo.isMultiCurrency && (!currentRowObj.value("Amount") || currentRowObj.value("Amount") === "")) {
            let msg = getErrorMessage_MissingElements("AMOUNT_MISSING_IN_ROW");
            banDoc.addMessage(msg, "AMOUNT_MISSING_IN_ROW");
            return false;
        }

    } else {
        let msg = getErrorMessage_MissingElements("SELECTED_ROW_NOT_VALID");
        banDoc.addMessage(msg, "SELECTED_ROW_NOT_VALID");
        return false;
    }
    return true;
}

function getUnitPriceDocChange(banDoc, docInfo, currentRowObj, currentRowNr, qtSold) {
    let docChange = { "format": "documentChange", "error": "", "data": [] };
    let docChangeObj = getDocumentChangeInit();
    let unitPrice = calculateUnitPrice(banDoc, docInfo, currentRowObj, qtSold);
    let rows = getRowToModify(currentRowNr, unitPrice, qtSold);

    var dataUnitItemsTable = {};
    dataUnitItemsTable.nameXml = "Transactions";
    dataUnitItemsTable.data = {};
    dataUnitItemsTable.data.rowLists = [];
    dataUnitItemsTable.data.rowLists.push({ "rows": rows });

    docChangeObj.document.dataUnits.push(dataUnitItemsTable);

    docChange["data"].push(docChangeObj);

    return docChange;
}

function calculateUnitPrice(banDoc, docInfo, currentRowObj, qtSold) {
    let unitPriceColumn = banDoc.table("Transactions").column("UnitPrice", "Base");
    let unitPriceColDecimals = unitPriceColumn.decimal;
    let currentAmount = "";
    docInfo.isMultiCurrency ? currentAmount = currentRowObj.value("AmountCurrency") : currentAmount = currentRowObj.value("Amount");
    Banana.console.debug(currentAmount);
    return Banana.SDecimal.divide(currentAmount, qtSold, { 'decimals': unitPriceColDecimals }); // controlla prima qtSold.
}

function getRowToModify(currentRowNr, unitPrice, qtSold) {
    let rows = [];
    let row = {};
    row.operation = {};
    row.operation.name = "modify";
    row.operation.sequence = String(currentRowNr);
    row.fields = {};
    row.fields["UnitPrice"] = unitPrice;
    row.fields["Quantity"] = qtSold;
    rows.push(row);
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
    let msg = getErrorMessage(errId, lang);
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
function getErrorMessage(errorId, lang) {
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