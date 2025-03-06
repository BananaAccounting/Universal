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
// @id = ch.banana.portfolio.accounting.record.adjustment.transactions
// @description = 5. Create adjustment transactions 
// @task = app.command
// @doctype = 100.*
// @publisher = Banana.ch SA
// @pubdate = 2025-02-06
// @inputdatasource = none
// @timeout = -1
// @includejs = ch.banana.portfolio.accounting.accounts.dialog.js
// @includejs = ch.banana.portfolio.accounting.calculation.methods.js
// @includejs = ch.banana.portfolio.accounting.errormessagges.handler.js

/**
 * This extension creates settlement records for securities with respect to the 
 * market price.
 */

function exec() {
    let banDoc = Banana.document;
    let dlgAccountsSettingsId = "ch.banana.portfolio.accounting.accounts.dialog";
    let adjustmentSettingsId = "ch.banana.portfolio.accounting.record.adjustment.transactions";

    if (!banDoc)
        return;

    if (!verifyBananaVersion(banDoc))
        return "@Cancel";

    if (!tableExists(banDoc, "Items")) {
        let msg = getErrorMessage_MissingElements("NO_ITEMS_TABLE", "");
        banDoc.addMessage(msg, "NO_ITEMS_TABLE");
        return "@Cancel";
    }

    if (!settingsDialog())
        return;

    /** Recupero i parametri definiti dall'utente nel dialogo corrente e nel dialogo dei conti.*/
    let savedAccountsParams = getFormattedSavedParams(banDoc, dlgAccountsSettingsId);
    savedAccountsParams = verifyAccountsParams(banDoc, savedAccountsParams);

    let savedMarketValuesParams = getFormattedSavedParams(banDoc, adjustmentSettingsId);
    if (!savedMarketValuesParams || isObjectEmpty(savedMarketValuesParams))
        return;


    let docChange = { "format": "documentChange", "error": "", "data": [] };
    let jsonDoc = getDocChangeAdjustmentTransactions(banDoc, savedMarketValuesParams, savedAccountsParams, false);
    docChange["data"].push(jsonDoc);
    return docChange;
}

/**
 * Transactions to adjust the security to the market price usually take place at the end of the year and are arranged on a single line.
 * The settlement can lead to a settlement income or a settlement cost that changes the value of the security account.
 * In the example case, a security settlement income is shown:
 * |                   DESCRIPTION                   |                 DEBIT                  |                  CREDIT                |
 *     Shares Netflix Adjustment at market price                    Shares Netflix                   Other value changing income        
 */
function getDocChangeAdjustmentTransactions(banDoc, savedMarketValuesParams, savedAccountsParams, isTest) {
    let docChangeObj = getDocumentChangeInit();
    let rows = getAdjustmentTransactionsRows(banDoc, savedMarketValuesParams, savedAccountsParams, isTest);

    var dataUnitTransactionsTable = {};
    dataUnitTransactionsTable.nameXml = "Transactions";
    dataUnitTransactionsTable.data = {};
    dataUnitTransactionsTable.data.rowLists = [];
    dataUnitTransactionsTable.data.rowLists.push({ "rows": rows });

    docChangeObj.document.dataUnits.push(dataUnitTransactionsTable);

    return docChangeObj;
}

/**
 * Creates the row to add if the result is not zero.
 * If a security does not have a current book value as all the stocks has been sell, we do not
 * create the transaction.
 */
function getAdjustmentTransactionsRows(banDoc, savedMarketValuesParams, savedAccountsParams, isTest) {
    let rows = [];
    let texts = getTransactionsTexts(banDoc);

    let docInfo = getDocumentInfo(banDoc);
    let unitPriceColumn = banDoc.table("Transactions").column("UnitPrice", "Base");
    let unitPriceColDecimals = unitPriceColumn.decimal;

    for (const param in savedMarketValuesParams) {
        let itemId = param;
        let itemUnitMarketValue = Banana.Converter.toInternalNumberFormat(savedMarketValuesParams[param], ".");
        let adjustmentResult = calculateAdjustmentResult(banDoc, docInfo, itemId, itemUnitMarketValue, unitPriceColDecimals);

        if (!adjustmentResult || Banana.SDecimal.isZero(adjustmentResult))
            continue;

        let currentDate = "";
        if (!isTest)
            currentDate = getCurrentDate();

        let row = {};
        row.operation = {};
        row.operation.name = "add";
        row.fields = {};
        row.fields["Date"] = currentDate;
        row.fields["Doc"] = "";
        row.fields["ItemsId"] = itemId;
        row.fields["Description"] = getItemDescription(itemId, banDoc) + " " + texts.adjustmentTxt + " (" + itemUnitMarketValue + ")";
        if (adjustmentResult.indexOf("-") >= 0) {
            row.fields["AccountDebit"] = savedAccountsParams.valueChangingcontraAccounts.unrealizedLossAccount || texts.otherValChangeCostPlaceHolder;
            row.fields["AccountCredit"] = getItemAccount(itemId, banDoc);
        } else {
            row.fields["AccountDebit"] = getItemAccount(itemId, banDoc);
            row.fields["AccountCredit"] = savedAccountsParams.valueChangingcontraAccounts.unrealizedGainAccount || texts.otherValChangeIncomePlaceHolder;
        }
        if (docInfo.isMultiCurrency)
            row.fields["AmountCurrency"] = Banana.Converter.toInternalNumberFormat(adjustmentResult);
        else
            row.fields["Amount"] = Banana.Converter.toInternalNumberFormat(adjustmentResult);
        if (docInfo.isMultiCurrency)
            row.fields["ExchangeCurrency"] = getItemCurrency(itemId, banDoc);

        rows.push(row);
    }

    return rows;
}

/**
 * To calculate the adjustment result we must:
 * 1) Calculate the current value: multiply the current quantity of a security by its book value.
 * 2) Calculate the market value: multiply the current quantity of a security by its market value.
 * 3) Subtract the market value from the current value.
 */
function calculateAdjustmentResult(banDoc, docInfo, itemId, itemUnitMarketValue, unitPriceColDecimals) {
    let itemRowObj = getItemRowObj(itemId, banDoc);
    let itemCurrentQt = itemRowObj.currentQt;
    let itemUnitBookValue = getItemBookValue(banDoc, docInfo, itemRowObj, unitPriceColDecimals);

    if (!itemUnitBookValue || Banana.SDecimal.isZero(itemUnitBookValue)
        || !itemUnitMarketValue || Banana.SDecimal.isZero(itemUnitMarketValue))
        return "";

    let marketValue = Banana.SDecimal.multiply(itemUnitMarketValue, itemCurrentQt);
    let bookValue = Banana.SDecimal.multiply(itemUnitBookValue, itemCurrentQt);

    return Banana.SDecimal.subtract(marketValue, bookValue);
}

function getItemBookValue(banDoc, docInfo, itemRowObj, unitPriceColDecimals) {

    if (!itemRowObj || isObjectEmpty(itemRowObj))
        return result;

    let journal = banDoc.journal(banDoc.ORIGINTYPE_CURRENT, banDoc.ACCOUNTTYPE_NONE);
    journalData = getJournalData(docInfo, journal);
    accountCard = banDoc.currentCard(itemRowObj.account);
    accountCardData = getAccountCardDataAdapted(itemRowObj, accountCard);

    let itemCardData = getItemCardDataList(docInfo, itemRowObj, accountCardData, journalData, unitPriceColDecimals);

    if (!itemCardData || isObjectEmpty(itemCardData) || !itemCardData.currentValues.itemAvgCost)
        return "";
    else
        return itemCardData.currentValues.itemAvgCost;
}

function getTransactionsTexts(banDoc) {

    let text = {};
    let lang = getCurrentLang(banDoc);

    switch (lang) {
        case "it":
            text = getTransactionsTexts_it();
            break;
        case "de":
            text = getTransactionsTexts_de();
            break;
        case "fr":
            text = getTransactionsTexts_fr();
            break;
        case "en":
        default:
            text = getTransactionsTexts_en();
            break;
    }

    return text;
}

function getTransactionsTexts_it() {
    let texts = {};

    // Normal texts
    texts.adjustmentTxt = "Assestamento al prezzo di mercato";

    // Placeholder for accounts
    texts.otherValChangeIncomePlaceHolder = "[Conto per utili non realizzati]";
    texts.otherValChangeCostPlaceHolder = "[Conto per perdite non realizzate]";

    // tooltips
    texts.tooltipdialog = "Inserire il prezzo di mercato attuale per questo titolo";

    return texts;
}

function getTransactionsTexts_de() {
    let texts = {};

    // Normal texts
    texts.adjustmentTxt = "Anpassung zum Marktpreis";

    // Placeholder for accounts
    texts.otherValChangeIncomePlaceHolder = "[Konto für unrealisierte Gewinne]";
    texts.otherValChangeCostPlaceHolder = "[Konto für unrealisierte Verluste]";

    // Tooltip
    texts.tooltipdialog = "Geben Sie den aktuellen Marktpreis für dieses Wertpapier ein";


    return texts;
}

function getTransactionsTexts_fr() {
    let texts = {};

    // Normal texts
    texts.adjustmentTxt = "Ajustement au prix du marché";

    // Placeholder for accounts
    texts.otherValChangeIncomePlaceHolder = "[Compte pour les gains latents]";
    texts.otherValChangeCostPlaceHolder = "[Compte pour les pertes latentes]";

    // tooltip
    texts.tooltipdialog = "Saisissez le prix du marché actuel pour ce titre";

    return texts;
}

function getTransactionsTexts_en() {
    let texts = {};

    // Normal texts
    texts.adjustmentTxt = "Market Price Adjustment";

    // Placeholder for accounts
    texts.otherValChangeIncomePlaceHolder = "[Account for unrealized gains]";
    texts.otherValChangeCostPlaceHolder = "[Account for unrealized losses]";

    //tooltip
    texts.tooltipdialog = "Enter the current market price for this security";

    return texts;

}

function getDocumentChangeInit() {

    let jsonDoc = {};
    jsonDoc.document = {};
    jsonDoc.document.dataUnitsfileVersion = "1.0.0";
    jsonDoc.document.dataUnits = [];
    jsonDoc.document.cursorPosition = {};

    jsonDoc.creator = {};
    var d = new Date();
    //jsonDoc.creator.executionDate = Banana.Converter.toInternalDateFormat(datestring, "yyyymmdd");
    //jsonDoc.creator.executionTime = Banana.Converter.toInternalTimeFormat(timestring, "hh:mm");
    jsonDoc.creator.name = Banana.script.getParamValue('id');
    jsonDoc.creator.version = "1.0";

    return jsonDoc;

}

function settingsDialog() {

    //BanDoc and settings id to define also inside this method to be correctly called from Manage extension dialog-->Settings button.
    let adjustmentSettingsId = "ch.banana.portfolio.accounting.record.adjustment.transactions";
    let banDoc = Banana.document;

    let itemsData = getItemsTableData(banDoc);

    if (itemsData.length < 1) {
        let msg = getErrorMessage_MissingElements("NO_SECURITIES_FOUND", "");
        banDoc.addMessage(msg, "NO_SECURITIES_FOUND");
        return "@Cancel";
    }

    let baseParams = initAdjustmentDialogParams(itemsData);
    let savedParams = getFormattedSavedParams(banDoc, adjustmentSettingsId);
    userParam = verifyAdjustmentParams(baseParams, savedParams);
    let dlgTitle = 'Create adjustment transactions';
    let convertedParam = convertParam(banDoc, userParam);
    if (!Banana.Ui.openPropertyEditor(dlgTitle, convertedParam))
        return false;
    for (var i = 0; i < convertedParam.data.length; i++) {
        // Read values to dialogparam (through the readValue function)
        if (typeof (convertedParam.data[i].readValue) == "function")
            convertedParam.data[i].readValue();
    }
    var paramToString = JSON.stringify(userParam);
    banDoc.setScriptSettings(adjustmentSettingsId, paramToString);
    return true;
}

function initAdjustmentDialogParams(itemsData) {
    let dialogParam = {};

    itemsData.forEach(item => {
        dialogParam[item.item] = item.unitPriceCurrent || "";
    });

    return dialogParam;
}

/**
 * Add new items to the savedParams if has been added (baseParams), and delete those removed.
 */
function verifyAdjustmentParams(baseParams, savedParams) {
    // Add new items from baseParams if they are missing in savedParams
    for (const key in baseParams) {
        if (!savedParams.hasOwnProperty(key)) {
            savedParams[key] = baseParams[key];
        }
    }

    // Remove items from savedParams if they do not exist in baseParams
    for (const key in savedParams) {
        if (!baseParams.hasOwnProperty(key)) {
            delete savedParams[key];
        }
    }

    // if savedParams has an item without value, check in baseParams if it has a value and add it to savedParams
    for (const key in savedParams) {
        if (!savedParams[key]) {
            savedParams[key] = baseParams[key];
        }
    }

    return savedParams;
}

function convertParam(banDoc, userParam) {
    var convertedParam = {};
    convertedParam.version = '1.0';
    convertedParam.data = [];
    let texts = getTransactionsTexts(banDoc);

    for (const param in userParam) {
        let itemDescription = getItemDescription(param, banDoc);
        var currentParam = {};
        currentParam.name = param; // item id.
        currentParam.title = itemDescription;
        currentParam.type = 'string';
        currentParam.defaultvalue = "";
        currentParam.tooltip = texts.tooltipdialog;
        currentParam.value = userParam[param] ? userParam[param] : '';
        currentParam.readValue = function () {
            userParam[param] = this.value;
        }
        convertedParam.data.push(currentParam);
    }

    return convertedParam;
}
