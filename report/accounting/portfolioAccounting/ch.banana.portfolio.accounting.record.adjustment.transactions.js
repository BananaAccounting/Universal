// Copyright [2026] [Banana.ch SA - Lugano Switzerland]
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
// @pubdate = 2026-02-24
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

    const docInfo = getDocumentInfo(banDoc);

    if (!tableExists(banDoc, "Items")) {
        let msg = getErrorMessage_MissingElements("NO_ITEMS_TABLE", "");
        banDoc.addMessage(msg, getErrorMessageReferenceAnchor());
        return "@Cancel";
    }

    let itemsData = getItemsTableData(banDoc);

    if (itemsData.length < 1) {
        let msg = getErrorMessage_MissingElements("NO_ASSETS_FOUND", "");
        banDoc.addMessage(msg, getErrorMessageReferenceAnchor());
        return "@Cancel";
    }

    // Read data from Items table and prepare the dialog parameters
    let dlgParams = initAdjustmentDialogParams();

    if (!settingsDialog(banDoc, dlgParams))
        return "@Cancel";

    /** Recupero i parametri definiti dall'utente nel dialogo corrente e nel dialogo dei conti.*/
    let savedAccountsParams = getFormattedSavedParams(banDoc, dlgAccountsSettingsId);
    savedAccountsParams = verifyAccountsParams(banDoc, savedAccountsParams);

    let savedValuesParams = getFormattedSavedParams(banDoc, adjustmentSettingsId);
    if (!savedValuesParams || isObjectEmpty(savedValuesParams))
        return "@Cancel";

    const adjustmentTransactionsManager = new AdjustmentTransactionsManager(banDoc, docInfo, itemsData,
        savedValuesParams, savedAccountsParams);
    return adjustmentTransactionsManager.getDocumentChangeObject();
}

var AdjustmentTransactionsManager = class AdjustmentTransactionsManager {
    constructor(banDoc, docInfo, itemsData, savedValuesParams, savedAccountsParams) {
        this.initValues(banDoc, docInfo, itemsData, savedValuesParams, savedAccountsParams);
    }

    initValues(banDoc, docInfo, itemsData, savedValuesParams, savedAccountsParams) {
        this.banDoc = {};
        this.docInfo = {};
        this.itemsTableData = {};
        this.docChangeObj = { "format": "documentChange", "error": "", "data": [] };
        this.savedValuesParams = {};
        this.savedAccountsParams = {};

        if (banDoc) {
            this.banDoc = banDoc;
        }
        if (docInfo) {
            this.docInfo = docInfo;
        }
        if (itemsData) {
            this.itemsTableData = itemsData;
        }
        if (savedValuesParams) {
            this.savedValuesParams = savedValuesParams;
        }
        if (savedAccountsParams) {
            this.savedAccountsParams = savedAccountsParams;
        }
    }

    getDocumentChangeObject() {
        let jsonDoc = this.getDocChangeAdjustment();
        this.docChangeObj["data"].push(jsonDoc);
        return this.docChangeObj;
    }

    getDocChangeAdjustment() {
        let docChangeObj = this.getDocumentChangeInit();
        let trDataUnitObj = this.getDocChangeAdjustment_TransactionsUnit();
        docChangeObj.document.dataUnits.push(trDataUnitObj);

        return docChangeObj;
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

        /**
         * Checks whether any valuation adjustment entries need to be created.
         * 
         * If no rows are generated, it means that:
         * - the securities have already been adjusted, or
         * - the market price and exchange rate have not changed since the last adjustment.
         * 
         * In this case, the current carrying amount is already aligned
         * with the latest market price and exchange rate.
         */
        if (rows.length < 1) {
            let msg = getErrorMessage_MissingElements("NO_ADJUSTMENT_OPERATION_FOUND", "");
            this.banDoc.addMessage(msg, getErrorMessageReferenceAnchor());
        }
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

        let unitPriceColumn = this.banDoc.table("Transactions").column("UnitPrice", "Base");
        let unitPriceColDecimals = unitPriceColumn.decimal;
        let transactionsDate = this.savedValuesParams.date;

        this.itemsTableData.forEach(item => {
            if (item && item.unitPriceCurrent !== undefined && item.unitPriceCurrent !== null && item.unitPriceCurrent !== "") {
                const itemId = item.item;
                const itemUnitMarketPrice = item.unitPriceCurrent;
                const itemExRateCurrent = getCurrentExchangeRate(this.banDoc, this.docInfo, item.currency);

                // Get item card data.
                const itemRowObj = getItemRowObj(itemId, this.banDoc);
                const itemCurrentQt = itemRowObj.currentQt;
                const itemCurrentValues = this.getItemCurrentValues(itemRowObj, unitPriceColDecimals);
                const itemCurrBookRate = getCurrentBookingRate(itemCurrentValues);

                let adjustmentResults = this.calculateAdjustmentResults(itemCurrentValues, itemCurrentQt, itemUnitMarketPrice, itemCurrBookRate, itemExRateCurrent);
                const priceAdj = adjustmentResults[0];
                const exchRateAdj = adjustmentResults[1];

                if (!priceAdj || Banana.SDecimal.isZero(priceAdj))
                    return;

                rows.push(this.getAdjustmentTransactionsRows_PriceAdj(itemRowObj, transactionsDate, priceAdj, itemCurrBookRate, itemUnitMarketPrice, texts));
                if (this.docInfo.isMultiCurrency && exchRateAdj && !Banana.SDecimal.isZero(exchRateAdj)) {
                    rows.push(this.getAdjustmentTransactionsRows_ExRateAdj(itemRowObj, transactionsDate, exchRateAdj, itemExRateCurrent, texts));
                }

            }
        });

        return rows;
    }

    getAdjustmentTransactionsRows_PriceAdj(itemRowObj, transactionsDate, priceAdj, itemCurrBookRate, itemUnitMarketPrice, texts) {

        let row = {};
        row.operation = {};
        row.operation.name = "add";
        row.fields = {};
        row.fields["Date"] = Banana.Converter.toInternalDateFormat(transactionsDate);
        row.fields["Doc"] = "";
        row.fields["ItemsId"] = itemRowObj.item;
        row.fields["Description"] = itemRowObj.description + " " + texts.priceAdjustmentTxt + " (" + itemUnitMarketPrice + ")";
        if (priceAdj.indexOf("-") >= 0) {
            row.fields["AccountDebit"] = this.savedAccountsParams.valueChangingcontraAccounts.unrealizedLossAccount || texts.otherValChangeCostPlaceHolder;
            row.fields["AccountCredit"] = itemRowObj.account;
        } else {
            row.fields["AccountDebit"] = itemRowObj.account;
            row.fields["AccountCredit"] = this.savedAccountsParams.valueChangingcontraAccounts.unrealizedGainAccount || texts.otherValChangeIncomePlaceHolder;
        }
        if (this.docInfo.isMultiCurrency)
            row.fields["AmountCurrency"] = Banana.Converter.toInternalNumberFormat(priceAdj, ".");
        else
            row.fields["Amount"] = Banana.Converter.toInternalNumberFormat(priceAdj, ".");
        if (this.docInfo.isMultiCurrency) {
            row.fields["ExchangeCurrency"] = itemRowObj.currency;
            row.fields["ExchangeRate"] = itemCurrBookRate;
        }

        return row;

    }
    getAdjustmentTransactionsRows_ExRateAdj(itemRowObj, transactionsDate, exchRateAdj, itemExRateCurrent, texts) {

        let row = {};
        row.operation = {};
        row.operation.name = "add";
        row.fields = {};
        row.fields["Date"] = Banana.Converter.toInternalDateFormat(transactionsDate);
        row.fields["Doc"] = "";
        row.fields["ItemsId"] = itemRowObj.item;
        row.fields["Description"] = itemRowObj.description + " " + texts.exRateAdjustmentTxt + " (" + itemExRateCurrent + ")";
        if (exchRateAdj.indexOf("-") >= 0) {
            row.fields["AccountDebit"] = this.savedAccountsParams.valueChangingcontraAccounts.unrealizedExRateLossAccount || texts.otherValChangeExRateCostPlaceHolder;
            row.fields["AccountCredit"] = itemRowObj.account;
        } else {
            row.fields["AccountDebit"] = itemRowObj.account;
            row.fields["AccountCredit"] = this.savedAccountsParams.valueChangingcontraAccounts.unrealizedExRateGainAccount || texts.otherValChangeExRateIncomePlaceHolder;
        }
        row.fields["ExchangeCurrency"] = this.docInfo.baseCurrency;
        row.fields["Amount"] = Banana.Converter.toInternalNumberFormat(exchRateAdj, ".");

        return row;
    }

    /**
     * A year-end valuation adjustment normally consists of two entries:
     *  1) Price adjustment to align the security to its market price.
     *  2) FX adjustment to align the carrying amount to the closing exchange rate.
     */
    calculateAdjustmentResults(itemCurrentValues, itemCurrentQt, itemUnitMarketPrice, itemCurrBookRate, itemExRateCurrent) {

        let adjResults = [];

        if (!itemCurrentValues)
            return adjResults;

        adjResults.push(this.calculateAdjustmentResults_PriceAdj(itemCurrentQt, itemCurrentValues.itemAvgCost, itemUnitMarketPrice));
        if (this.docInfo.isMultiCurrency) {
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
            /*Banana.console.debug("market value: " + marketValue);
            Banana.console.debug("itemExRateCurrent: " + itemExRateCurrent);
            Banana.console.debug("itemCurrBookRate: " + itemCurrBookRate);*/
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

    getItemCurrentValues(itemRowObj, unitPriceColDecimals) {

        if (!itemRowObj || isObjectEmpty(itemRowObj))
            return "";

        const invalidRow = -1;
        let itemCardData = getItemCardDataList(this.banDoc, this.docInfo, itemRowObj, unitPriceColDecimals, invalidRow);

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

function initAdjustmentDialogParams() {

    let dialogParam = {};
    dialogParam.date = getCurrentDate();

    return dialogParam;
}

/**
 * Returns the current exchange rate taken from the ExchangeRate table.
 * Check the program versione to decide wich API to call.
 * API method: exchangeRateRaw() has been added in version 10.2.6.65535,
 * for older versions, we call the API method: exchangeRate(), which returns
 * the exchange rate already considering the multiplier.
 */
function getCurrentExchangeRate(banDoc, docInfo, currency) {
    let exRateCurr = "";
    let exDataObj = {};

    if (!banDoc || !docInfo || !docInfo.isMultiCurrency) {
        return exRateCurr;
    }

    if (Banana.application.version >= "10.2.6.65535") {
        // Raw exchange rate exactly as stored in the Exchange Rates table (multiplier not applied).
        exDataObj = banDoc.exchangeRateRaw(currency);
        if (exDataObj && exDataObj.exchangeRate) {
            exRateCurr = exDataObj.exchangeRate;
        }
    } else {
        // The returned exchange rate already includes the multiplier (normalized value).
        exDataObj = banDoc.exchangeRate(currency);
        if (exDataObj && exDataObj.exchangeRate) {
            exRateCurr = exDataObj.exchangeRate;
        }
    }
    return exRateCurr;
}

function convertParam(banDoc, baseParams) {
    var convertedParam = {};
    convertedParam.version = '1.0';
    convertedParam.data = [];
    let texts = getTransactionsTexts(banDoc);

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
    texts.operationDate = "Operation date";

    //tooltip
    texts.tooltipPriceDialog = "Enter the current market price for this security";
    texts.tooltipExrateDialog = "Enter the current exchange rate for the currency in which this security is denominated.";
    texts.tooltipRefDateDialog = "Enter the operation date.";

    return texts;

}
