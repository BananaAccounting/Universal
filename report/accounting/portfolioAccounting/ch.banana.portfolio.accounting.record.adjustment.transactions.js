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
// @description = 4. Create adjustment transactions 
// @task = app.command
// @doctype = 100.*
// @publisher = Banana.ch SA
// @pubdate = 2025-11-27
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
        banDoc.addMessage(msg, getErrorMessageReferenceAnchor());
        return "@Cancel";
    }

    let itemsData = getItemsTableData(banDoc);

    if (itemsData.length < 1) {
        let msg = getErrorMessage_MissingElements("NO_ASSETS_FOUND", "");
        banDoc.addMessage(msg, getErrorMessageReferenceAnchor());
        return false;
    }

    // Read data from Items table and prepare the dialog parameters
    let dlgParams = initAdjustmentDialogParams(banDoc, itemsData);

    if (isObjectEmpty(dlgParams)) {
        let msg = getErrorMessage_MissingElements("NO_ASSET_WITH_CURRENT_PRICE", "");
        banDoc.addMessage(msg, getErrorMessageReferenceAnchor());
        return false;
    }

    if (!settingsDialog(banDoc, dlgParams))
        return "@Cancel";

    /** Recupero i parametri definiti dall'utente nel dialogo corrente e nel dialogo dei conti.*/
    let savedAccountsParams = getFormattedSavedParams(banDoc, dlgAccountsSettingsId);
    //savedAccountsParams = verifyAccountsParams(banDoc, savedAccountsParams);

    let savedValuesParams = getFormattedSavedParams(banDoc, adjustmentSettingsId);
    if (!savedValuesParams || isObjectEmpty(savedValuesParams))
        return "@Cancel";

    const adjustmentTransactionsManager = new AdjustmentTransactionsManager(banDoc, itemsData,
        savedValuesParams, savedAccountsParams);
    return adjustmentTransactionsManager.getDocumentChangeObject();
}

var AdjustmentTransactionsManager = class AdjustmentTransactionsManager {
    constructor(banDoc, itemsData, savedValuesParams, savedAccountsParams) {
        this.banDoc = banDoc;
        this.itemsTableData = itemsData;
        this.docChangeObj = { "format": "documentChange", "error": "", "data": [] };
        this.savedValuesParams = savedValuesParams;
        this.savedAccountsParams = savedAccountsParams;
    }

    getDocumentChangeObject() {
        let jsonDoc = this.getDocChangeAdjustment();
        this.docChangeObj["data"].push(jsonDoc);
        return this.docChangeObj;
    }

    getDocChangeAdjustment() {
        let docChangeObj = this.getDocumentChangeInit();

        docChangeObj.document.dataUnits.push(
            this.getDocChangeAdjustment_ItemsUnit());
        docChangeObj.document.dataUnits.push(
            this.getDocChangeAdjustment_TransactionsUnit());
        return docChangeObj;
    }

    /* If any price has been changed, we must update the Items table.*/
    getDocChangeAdjustment_ItemsUnit() {

        let rows = this.getAdjustmentItemsRows();

        var dataUnitItemsTable = {};
        dataUnitItemsTable.nameXml = "Items";
        dataUnitItemsTable.data = {};
        dataUnitItemsTable.data.rowLists = [];
        dataUnitItemsTable.data.rowLists.push({ "rows": rows });

        return dataUnitItemsTable
    }

    /**
     * Returns rows to be modified in the Items table.
     * Only field: UnitPriceCurrent, if the user changed the value in the dialog.
     */
    getAdjustmentItemsRows() {
        let rows = [];
        for (var key in this.savedValuesParams) {
            let itemId = key;
            let dlgItemCurrentP = Banana.Converter.toInternalNumberFormat(this.savedValuesParams[key]);
            let objFound = this.itemsTableData.find(o => o.item === itemId);
            if (objFound) {
                let tabItemsCurrentP = objFound.unitPriceCurrent || "";
                let tabItemsRowNr = String(objFound.rowNr);
                if (dlgItemCurrentP !== tabItemsCurrentP) {
                    let row = {};
                    row.operation = {};
                    row.operation.name = "modify";
                    row.operation.sequence = tabItemsRowNr;
                    row.fields = {};
                    row.fields["UnitPriceCurrent"] = dlgItemCurrentP;
                    rows.push(row);
                }
            }
        }
        return rows;
    }


    /**
     * Transactions to adjust the security to the market price usually take place at the end of the year and are arranged on a single line.
     * The settlement can lead to a settlement income or a settlement cost that changes the value of the security account.
     * In the example case, a security settlement income is shown:
     * |                   DESCRIPTION                   |                 DEBIT                  |                  CREDIT                |
     *     Shares Netflix Adjustment at market price                    Shares Netflix                   Other value changing income        
     */
    getDocChangeAdjustment_TransactionsUnit() {
        let rows = this.getAdjustmentTransactionsRows();

        var dataUnitTransactionsTable = {};
        dataUnitTransactionsTable.nameXml = "Transactions";
        dataUnitTransactionsTable.data = {};
        dataUnitTransactionsTable.data.rowLists = [];
        dataUnitTransactionsTable.data.rowLists.push({ "rows": rows });

        return dataUnitTransactionsTable;
    }

    /**
    * Creates the row to add if the result is not zero.
    * If a security does not have a current book value as all the stocks has been sell, we do not
    * create the transaction.
    */
    getAdjustmentTransactionsRows() {
        let rows = [];
        let texts = getTransactionsTexts();

        let docInfo = getDocumentInfo(this.banDoc);
        let unitPriceColumn = this.banDoc.table("Transactions").column("UnitPrice", "Base");
        let unitPriceColDecimals = unitPriceColumn.decimal;
        let transactionsDate = this.savedValuesParams.date;

        for (const param in this.savedValuesParams.items) {
            let itemId = param;
            // User must use the locale format to enter the numbers in the dialog.
            const itemUnitMarketPriceLocale = this.savedValuesParams.items[param].priceCurrent;
            const itemExRateCurrentLocale = this.savedValuesParams.items[param].exRateCurrent;
            const itemUnitMarketPrice = Banana.Converter.toInternalNumberFormat(itemUnitMarketPriceLocale);
            const itemExRateCurrent = Banana.Converter.toInternalNumberFormat(itemExRateCurrentLocale);

            // Get item card data.
            const itemRowObj = getItemRowObj(itemId, this.banDoc);
            const itemCurrentQt = itemRowObj.currentQt;
            const itemCurrentValues = this.getItemCurrentValues(docInfo, itemRowObj, unitPriceColDecimals);
            const itemCurrBookRate = getCurrentBookingRate(itemCurrentValues);

            let adjustmentResults = this.calculateAdjustmentResults(docInfo, itemCurrentValues, itemCurrentQt, itemUnitMarketPrice, itemCurrBookRate, itemExRateCurrent);
            const priceAdj = adjustmentResults[0];
            const exchRateAdj = adjustmentResults[1];

            if (!priceAdj || Banana.SDecimal.isZero(priceAdj))
                continue;

            rows.push(this.getAdjustmentTransactionsRows_PriceAdj(docInfo, itemId, transactionsDate, priceAdj, itemCurrBookRate, itemUnitMarketPriceLocale, texts));
            if (docInfo.isMultiCurrency && exchRateAdj) {
                rows.push(this.getAdjustmentTransactionsRows_ExRateAdj(docInfo, itemId, transactionsDate, exchRateAdj, itemExRateCurrent, texts));
            }
        }

        return rows;
    }

    getAdjustmentTransactionsRows_PriceAdj(docInfo, itemId, transactionsDate, priceAdj, itemCurrBookRate, itemUnitMarketPriceLocale, texts) {

        let row = {};
        row.operation = {};
        row.operation.name = "add";
        row.fields = {};
        row.fields["Date"] = Banana.Converter.toInternalDateFormat(transactionsDate);
        row.fields["Doc"] = "";
        row.fields["ItemsId"] = itemId;
        row.fields["Description"] = getItemDescription(itemId, this.banDoc) + " " + texts.priceAdjustmentTxt + " (" + itemUnitMarketPriceLocale + ")";
        if (priceAdj.indexOf("-") >= 0) {
            row.fields["AccountDebit"] = this.savedAccountsParams.valueChangingcontraAccounts.unrealizedLossAccount || texts.otherValChangeCostPlaceHolder;
            row.fields["AccountCredit"] = getItemAccount(itemId, this.banDoc);
        } else {
            row.fields["AccountDebit"] = getItemAccount(itemId, this.banDoc);
            row.fields["AccountCredit"] = this.savedAccountsParams.valueChangingcontraAccounts.unrealizedGainAccount || texts.otherValChangeIncomePlaceHolder;
        }
        if (docInfo.isMultiCurrency)
            row.fields["AmountCurrency"] = Banana.Converter.toInternalNumberFormat(priceAdj, ".");
        else
            row.fields["Amount"] = Banana.Converter.toInternalNumberFormat(priceAdj, ".");
        if (docInfo.isMultiCurrency) {
            row.fields["ExchangeCurrency"] = docInfo.baseCurrency;
            row.fields["ExchangeRate"] = itemCurrBookRate;
        }

        return row;

    }
    getAdjustmentTransactionsRows_ExRateAdj(docInfo, itemId, transactionsDate, exchRateAdj, itemExRateCurrent, texts) {

        let row = {};
        row.operation = {};
        row.operation.name = "add";
        row.fields = {};
        row.fields["Date"] = Banana.Converter.toInternalDateFormat(transactionsDate);
        row.fields["Doc"] = "";
        row.fields["ItemsId"] = itemId;
        row.fields["Description"] = getItemDescription(itemId, this.banDoc) + " " + texts.exRateAdjustmentTxt + " (" + itemExRateCurrent + ")";
        if (exchRateAdj.indexOf("-") >= 0) {
            row.fields["AccountDebit"] = this.savedAccountsParams.valueChangingcontraAccounts.unrealizedExRateLossAccount || texts.otherValChangeExRateCostPlaceHolder;
            row.fields["AccountCredit"] = getItemAccount(itemId, this.banDoc);
        } else {
            row.fields["AccountDebit"] = getItemAccount(itemId, this.banDoc);
            row.fields["AccountCredit"] = this.savedAccountsParams.valueChangingcontraAccounts.unrealizedExRateGainAccount || texts.otherValChangeExRateIncomePlaceHolder;
        }
        row.fields["ExchangeCurrency"] = docInfo.baseCurrency;
        row.fields["Amount"] = Banana.Converter.toInternalNumberFormat(exchRateAdj, ".");

        return row;
    }

    /**
     * A year-end valuation adjustment normally consists of two entries:
     *  1) Price adjustment to align the security to its market price.
     *  2) FX adjustment to align the carrying amount to the closing exchange rate.
     */
    calculateAdjustmentResults(docInfo, itemCurrentValues, itemCurrentQt, itemUnitMarketPrice, itemCurrBookRate, itemExRateCurrent) {

        let adjResults = [];

        if (!itemCurrentValues)
            return adjResults;

        adjResults.push(this.calculateAdjustmentResults_PriceAdj(itemCurrentQt, itemCurrentValues.itemAvgCost, itemUnitMarketPrice));
        if (docInfo.isMultiCurrency) {
            adjResults.push(this.calculateAdjustmentResults_ExRateAdj(itemCurrentQt, itemCurrentValues, itemUnitMarketPrice, itemCurrBookRate, itemExRateCurrent));
        }
        return adjResults;
    }

    /**
     * The price adjustment is calculated as:
     *
     *    Qty × (MarketPrice − AverageBookPrice)
     *
     * The resulting difference represents the variation in the account currency.
     *
     * If the account is denominated in a foreign currency, the price adjustment
     * must be converted using the account’s implicit book rate.
     * This isolates the pure price effect,
     * keeping the FX component unchanged.
     * @itemCurrentQt Actual Item current quanity.
     * @itemUnitMarketPrice Actual Item book price.
     * @itemUnitMarketPrice Actual market price.
     */
    calculateAdjustmentResults_PriceAdj(itemCurrentQt, itemUnitBookPrice, itemUnitMarketPrice) {
        let marketValue = Banana.SDecimal.multiply(itemUnitMarketPrice, itemCurrentQt);
        let bookValue = Banana.SDecimal.multiply(itemUnitBookPrice, itemCurrentQt);
        return Banana.SDecimal.subtract(marketValue, bookValue);
    }

    /**
     * * After the price adjustment, the account currency balance
     * is correct, but the base currency balance is still
     * valued using the implicit book rate.
     *
     * To obtain the fair value at period end, the foreign currency balance
     * must be converted at the closing rate.
     *
     * The FX adjustment is calculated as:
     *
     *    (CurrencyBalance / ClosingRate) - CurrentBaseBalance
     *
     * (CurrentBaseBalance refers to the updated base balance after step 1.)
     * 
     * As we do not have the updated balance yet, 
     * we get the value doing the following calculation:
     * 
     * (MarketValue '*' or '/' closingRate) - (MarketValue '*' or '/' bookRate)
     *
     * This entry affects only the base currency (CurrencyAmount = 0)
     * and represents the unrealized gain or loss arising exclusively
     * from the exchange rate movement.
     * @itemCurrentQt Actual Item current quanity.
     * @itemCurrentValues Actual Item current values taken from the Item card.
     * @itemCurrBookRate Actual book rate of the item (calculated based on current balances)
     */
    calculateAdjustmentResults_ExRateAdj(itemCurrentQt, itemCurrentValues, itemUnitMarketPrice, itemCurrBookRate, itemExRateCurrent) {
        const marketValue = Banana.SDecimal.multiply(itemUnitMarketPrice, itemCurrentQt);
        const mult = itemCurrentValues.itemOpMultiplier;
        if (mult && mult.indexOf("-") > -1) {
            return Banana.SDecimal.subtract
                (Banana.SDecimal.multiply(marketValue, itemExRateCurrent),
                    Banana.SDecimal.multiply(marketValue, itemCurrBookRate));
        } else if (mult && mult.indexOf("-") == -1) {
            return Banana.SDecimal.subtract
                (Banana.SDecimal.divide(marketValue, itemExRateCurrent),
                    Banana.SDecimal.divide(marketValue, itemCurrBookRate));
        } else {
            return Banana.Converter.toLocaleNumberFormat("0.00"); //... No multiplier ? (In future in income/expenses accounting ?)
        }
    }

    getItemCurrentValues(docInfo, itemRowObj, unitPriceColDecimals) {

        if (!itemRowObj || isObjectEmpty(itemRowObj))
            return "";

        const invalidRow = -1;
        let itemCardData = getItemCardDataList(this.banDoc, docInfo, itemRowObj, unitPriceColDecimals, invalidRow);

        if (!itemCardData || isObjectEmpty(itemCardData) || !itemCardData.currentValues)
            return "";
        else
            return itemCardData.currentValues;
    }

    getDocumentChangeInit() {

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
}

function settingsDialog(banDoc, dlgParams) {

    //BanDoc and settings id to define also inside this method to be correctly called from Manage extension dialog-->Settings button.
    let adjustmentSettingsId = "ch.banana.portfolio.accounting.record.adjustment.transactions";

    let dlgTitle = 'Create adjustment transactions';
    let convertedParam = convertParam(banDoc, dlgParams);
    if (!Banana.Ui.openPropertyEditor(dlgTitle, convertedParam))
        return false;
    for (var i = 0; i < convertedParam.data.length; i++) {
        // Read values to dialogparam (through the readValue function)
        if (typeof (convertedParam.data[i].readValue) == "function")
            convertedParam.data[i].readValue();
    }
    var paramToString = JSON.stringify(dlgParams);
    banDoc.setScriptSettings(adjustmentSettingsId, paramToString);
    return true;
}

function initAdjustmentDialogParams(banDoc, itemsData) {

    if (!banDoc)
        return;

    const unitPriceColSettings = banDoc.table("Items").column("UnitPriceCurrent", "Base");
    const exRateColSettings = banDoc.table("Transactions").column("ExchangeRate", "Base");
    let dialogParam = {};
    dialogParam.items = {};
    let mult = "";
    // We want just the items that have a current unit price defined.
    itemsData.forEach(item => {
        if (item.unitPriceCurrent !== undefined && item.unitPriceCurrent !== null && item.unitPriceCurrent !== "") {
            dialogParam.items[item.item] = {};
            dialogParam.items[item.item].priceCurrent = Banana.Converter.toLocaleNumberFormat(item.unitPriceCurrent, unitPriceColSettings.decimal) || "";
            /*
             * We use Banana.Document.exchangeRate to get the default rate,
             * which already includes the multiplier.
             * To display it in the same direction defined by the user in the
             * exchange rates table, we check the multiplier:
             * - if it is -1, the value is already correct;
             * - if it is 1, we calculate the inverse rate.
             */
            mult = findFirstOccurencyMultiplierForCurr(banDoc, item.currency);
            let currentExchangeRate = banDoc.exchangeRate(item.currency).exchangeRate;
            if (mult.indexOf("-") == -1) {
                dialogParam.items[item.item].exRateCurrent = Banana.Converter.toLocaleNumberFormat(
                    Banana.SDecimal.divide(1, currentExchangeRate), exRateColSettings.decimal);
            } else {
                dialogParam.items[item.item].exRateCurrent = Banana.Converter.toLocaleNumberFormat(
                    currentExchangeRate, exRateColSettings.decimal);
            }
        }

    });

    dialogParam.date = getCurrentDate();

    return dialogParam;
}

function convertParam(banDoc, baseParams) {
    var convertedParam = {};
    convertedParam.version = '1.0';
    convertedParam.data = [];
    let texts = getTransactionsTexts(banDoc);

    for (const param in baseParams.items) {

        // Create a group for each item
        var currentParam = {};
        let itemDescription = getItemDescription(param, banDoc);
        currentParam.name = param;
        currentParam.title = itemDescription;
        currentParam.editable = false;

        convertedParam.data.push(currentParam);

        // Add the price row.
        var currentParam = {};
        currentParam.name = param; // item id.
        currentParam.title = texts.currentPriceDlg;
        currentParam.type = 'string';
        currentParam.defaultvalue = "";
        currentParam.tooltip = texts.tooltipPriceDialog;
        currentParam.value = baseParams.items[param].priceCurrent ? baseParams.items[param].priceCurrent : '';
        currentParam.readValue = function () {
            baseParams.items[param].priceCurrent = this.value;
        }
        currentParam.parentObject = param;
        convertedParam.data.push(currentParam);

        // Add the exchange rate row.
        var currentParam = {};
        currentParam.name = param; // item id.
        currentParam.title = texts.currentExRateDlg;
        currentParam.type = 'string';
        currentParam.defaultvalue = "";
        currentParam.tooltip = texts.tooltipExrateDialog;
        currentParam.value = baseParams.items[param].exRateCurrent ? baseParams.items[param].exRateCurrent : '';
        currentParam.readValue = function () {
            baseParams.items[param].exRateCurrent = this.value;
        }
        currentParam.parentObject = param;
        convertedParam.data.push(currentParam);
    }

    // Add current date row
    var currentParam = {};
    currentParam.name = 'Date';
    currentParam.title = texts.operationDate;
    currentParam.type = 'date';
    currentParam.defaultvalue = "";
    currentParam.tooltip = texts.tooltipRefDateDialog;
    currentParam.value = baseParams.date ? baseParams.date : '';
    currentParam.readValue = function () {
        baseParams.date = this.value;
    }
    convertedParam.data.push(currentParam);

    return convertedParam;
}

function getTransactionsTexts() {

    let text = {};
    let lang = getCurrentLang(this.banDoc);

    switch (lang) {
        case "it":
            text = this.getTransactionsTexts_it();
            break;
        case "de":
            text = this.getTransactionsTexts_de();
            break;
        case "fr":
            text = this.getTransactionsTexts_fr();
            break;
        case "en":
        default:
            text = this.getTransactionsTexts_en();
            break;
    }

    return text;
}

function getTransactionsTexts_it() {
    let texts = {};

    // Normal texts
    texts.priceAdjustmentTxt = "Assestamento al prezzo di mercato";
    texts.exRateAdjustmentTxt = "Assestamento al tasso di cambio alla data di valutazione";

    // Placeholder for accounts
    texts.otherValChangeIncomePlaceHolder = "[Conto per utili non realizzati]";
    texts.otherValChangeCostPlaceHolder = "[Conto per perdite non realizzate]";
    texts.otherValChangeExRateIncomePlaceHolder = "[Conto per utili di cambio non realizzati]";
    texts.otherValChangeExRateCostPlaceHolder = "[Conto per perdite di cambio non realizzate]";

    // Dialog texts
    texts.currentPriceDlg = "Prezzo corrente";
    texts.currentExRateDlg = "Tasso di cambio corrente";
    texts.operationDate = "Data dell’operazione";

    // Dialog tooltips
    texts.tooltipPriceDialog = "Inserire il prezzo di mercato attuale per questo titolo";
    texts.tooltipExrateDialog = "Inserire il tasso di cambio corrente della valuta in cui è espresso questo titolo.";
    texts.tooltipRefDateDialog = "Inserire la data dell'operazione";

    return texts;
}

function getTransactionsTexts_de() {
    let texts = {};

    // Normal texts
    texts.priceAdjustmentTxt = "Anpassung zum Marktpreis";
    texts.exRateAdjustmentTxt = "Anpassung zum Wechselkurs am Bewertungsdatum";

    // Placeholder for accounts
    texts.otherValChangeIncomePlaceHolder = "[Konto für unrealisierte Gewinne]";
    texts.otherValChangeCostPlaceHolder = "[Konto für unrealisierte Verluste]";
    texts.otherValChangeExRateIncomePlaceHolder = "[Konto für nicht realisierte Wechselkursgewinne]";
    texts.otherValChangeExRateCostPlaceHolder = "[Konto für nicht realisierte Wechselkursverluste]";

    // Dialog texts
    texts.currentPriceDlg = "Aktueller Preis";
    texts.currentExRateDlg = "Aktueller Wechselkurs";
    texts.operationDate = "Buchungsdatum";

    // Tooltip
    texts.tooltipPriceDialog = "Geben Sie den aktuellen Marktpreis für dieses Wertpapier ein";
    texts.tooltipExrateDialog = "Geben Sie den aktuellen Wechselkurs der Währung ein, in der dieses Wertpapier denominiert ist.";
    texts.tooltipRefDateDialog = "Geben Sie das Buchungsdatum ein.";


    return texts;
}

function getTransactionsTexts_fr() {
    let texts = {};

    // Normal texts
    texts.priceAdjustmentTxt = "Ajustement au prix du marché";
    texts.exRateAdjustmentTxt = "Ajustement au taux de change à la date d’évaluation";

    // Placeholder for accounts
    texts.otherValChangeIncomePlaceHolder = "[Compte pour les gains latents]";
    texts.otherValChangeCostPlaceHolder = "[Compte pour les pertes latentes]";
    texts.otherValChangeExRateIncomePlaceHolder = "[Compte pour gains de change non réalisés]";
    texts.otherValChangeExRateCostPlaceHolder = "[Compte pour pertes de change non réalisées]";

    // Dialog texts
    texts.currentPriceDlg = "Prix actuel";
    texts.currentExRateDlg = "Taux de change actuel";
    texts.operationDate = "Date de l’opération";

    // tooltip
    texts.tooltipPriceDialog = "Saisissez le prix du marché actuel pour ce titre";
    texts.tooltipExrateDialog = "Saisissez le taux de change actuel de la devise dans laquelle ce titre est libellé.";
    texts.tooltipRefDateDialog = "Saisissez la date de l’opération.";

    return texts;
}

function getTransactionsTexts_en() {
    let texts = {};

    // Normal texts
    texts.priceAdjustmentTxt = "Market Price Adjustment";
    texts.exRateAdjustmentTxt = "Adjustment at exchange rate on valuation date";


    // Placeholder for accounts
    texts.otherValChangeIncomePlaceHolder = "[Account for unrealized gains]";
    texts.otherValChangeCostPlaceHolder = "[Account for unrealized losses]";
    texts.otherValChangeExRateIncomePlaceHolder = "[Account for unrealized foreign exchange gains]";
    texts.otherValChangeExRateCostPlaceHolder = "[Account for unrealized foreign exchange losses]";

    // Dialog texts
    texts.currentPriceDlg = "Current price";
    texts.currentExRateDlg = "Current exchange rate";
    texts.operationDate = "Transaction date";

    //tooltip
    texts.tooltipPriceDialog = "Enter the current market price for this security";
    texts.tooltipExrateDialog = "Enter the current exchange rate for the currency in which this security is denominated.";
    texts.tooltipRefDateDialog = "Enter the transaction date.";

    return texts;

}
