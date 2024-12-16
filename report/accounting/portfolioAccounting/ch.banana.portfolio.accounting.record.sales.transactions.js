// Copyright [2024] [Banana.ch SA - Lugano Switzerland]
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
// @id = ch.banana.portfolio.accounting.record.sales.transactions.js
// @api = 1.0
// @pubdate = 2022-02-16
// @publisher = Banana.ch SA
// @description = Record Sales Transactions
// @task = app.command
// @doctype = 100.*
// @docproperties =
// @outputformat = none
// @inputdatasource = none
// @timeout = -1
// @includejs = ch.banana.portfolio.accounting.calculation.methods.js
// @includejs = ch.banana.portfolio.accounting.errormessagges.handler.js

/**
 * This script generates and records the sales transactions
 */
function exec() { // se viene chiamato dal dialogo, devo passare gia i parametri scelti.

    let banDoc = Banana.document;

    if (!banDoc)
        return;

    let docInfo = getDocumentInfo(banDoc);
    let currentRowNr = "";
    if (banDoc.cursor.tableName == "Transactions")
        currentRowNr = banDoc.cursor.rowNr;

    if (!verifyBananaVersion(banDoc))
        return "@Cancel";

    let docChange = getRecordSalesTransactions(banDoc, docInfo, currentRowNr);

    return docChange;
}

function getRecordSalesTransactions(banDoc, docInfo, currentRowNr) {

    let docChange = {};
    let saleData = {};
    let calcParams = {};

    let currentRowObj = getCurrentRowObj(banDoc, currentRowNr);
    if (!currentRowObj)
        return docChange;

    calcParams.itemId = currentRowObj.value("ItemsId");
    calcParams.quantity = currentRowObj.value("Quantity");
    calcParams.marketPrice = currentRowObj.value("UnitPrice");
    calcParams.currExRate = currentRowObj.value("ExchangeRate");
    calcParams.currency = currentRowObj.value("ExchangeCurrency");
    itemsData = getItemsTableData(banDoc, docInfo);
    // Check if the item exists
    const itemObject = itemsData.find(obj => obj.item === calcParams.itemId)
    saleData = calculateShareSaleData(banDoc, docInfo, itemObject, calcParams, currentRowNr);
    let saleResultTransaction = getSaleResultDocChangeTransaction(saleData);
    if (calcParams.exchangeRate && calcParams.currency) {
        getExchangeResultDocChangeTransaction(saleData);
    }

    /**
     * 1. Valutare se si tratta di un titolo in valuta base o meno.
     *   1.1 Se il titolo è in valuta base, creo solo la registrazione di vendita
     *   1.2 Se il titolo è in valuta estera, creo la registrazione di vendita e di cambio
     */

}

function getExchangeResultDocChangeTransaction(saleData) {

}

function getSaleResultDocChangeTransaction(saleData) {

}

function getDocumentChangeInit() {


    let jsonDoc = {};
    jsonDoc.document = {};
    jsonDoc.document.dataUnitsfileVersion = "1.0.0";
    jsonDoc.document.dataUnits = [];

    jsonDoc.creator = {};
    var d = new Date();
    jsonDoc.creator.executionDate = Banana.Converter.toInternalDateFormat(datestring, "yyyymmdd");
    jsonDoc.creator.executionTime = Banana.Converter.toInternalTimeFormat(timestring, "hh:mm");
    jsonDoc.creator.name = Banana.script.getParamValue('id');
    jsonDoc.creator.version = "1.0";

    return jsonDoc;

}