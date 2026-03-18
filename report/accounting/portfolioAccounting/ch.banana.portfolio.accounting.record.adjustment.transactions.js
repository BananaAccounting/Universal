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

        this.itemsTableData.forEach(item => {
            if (item && item.unitPriceCurrent !== undefined && item.unitPriceCurrent !== null && item.unitPriceCurrent !== "") {
                const itemId = item.item;
                const itemDescr = item.description;
                const itemAccount = item.account;
                const itemCurrentQt = item.currentQt;
                const itemUnitMarketPrice = item.unitPriceCurrent;
                const itemCurrentValues = this.getItemCurrentValues(item, unitPriceColDecimals);
                const bookCurrExRate = getCurrentBookingRate(itemCurrentValues);
                const priceAdj = this.calculatePriceAdjustmentResult(itemCurrentValues, itemCurrentQt, itemUnitMarketPrice);
                /**
                 * Calculate the FX variation. This could be done directly using the command “Create transactions for exchange rate differences”. 
                 * While this would produce correct balances in the accounting, it generates only one transaction per account. 
                 * As a result, the operation would not be properly reflected in the investment reports, 
                 * since no Item ID is automatically assigned to the transaction. Moreover, only a single Item ID can be specified, 
                 * which makes this approach unsuitable for accounts containing multiple items.
                 */
                const fxAdj = this.calculateFXAdjustmentResult(itemCurrentValues, item, priceAdj, bookCurrExRate);

                /**Add price adjustment transaction */
                if ((priceAdj && !Banana.SDecimal.isZero(priceAdj))) {
                    rows.push(this.getAdjustmentTransactionsRows_PriceAdj(itemId, itemDescr, itemAccount, priceAdj, itemUnitMarketPrice, bookCurrExRate, texts));
                }

                /** Add FX adjustment transaction */
                if (this.docInfo.isMultiCurrency && (fxAdj && !Banana.SDecimal.isZero(fxAdj))) {
                    rows.push(this.getAdjustmentTransactionsRows_FXAdj(itemId, itemDescr, itemAccount, fxAdj, texts))
                }

            }
        });

        return rows;
    }

    getAdjustmentTransactionsRows_PriceAdj(itemId, itemDescr, itemAccount, priceAdj, itemUnitMarketPrice, bookCurrExRate, texts) {

        let row = {};
        row.operation = {};
        row.operation.name = "add";
        row.fields = {};
        row.fields["Date"] = Banana.Converter.toInternalDateFormat(this.savedValuesParams.date);
        row.fields["Doc"] = "";
        row.fields["ItemsId"] = itemId;
        row.fields["Description"] = itemDescr + " " + texts.priceAdjustmentTxt + " (" + itemUnitMarketPrice + ")";
        if (priceAdj.indexOf("-") >= 0) {
            row.fields["AccountDebit"] = this.savedAccountsParams.valueChangingcontraAccounts.unrealizedLossAccount || texts.otherValChangeCostPlaceHolder;
            row.fields["AccountCredit"] = itemAccount;
        } else {
            row.fields["AccountDebit"] = itemAccount;
            row.fields["AccountCredit"] = this.savedAccountsParams.valueChangingcontraAccounts.unrealizedGainAccount || texts.otherValChangeIncomePlaceHolder;
        }
        if (this.docInfo.isMultiCurrency) {
            row.fields["AmountCurrency"] = Banana.Converter.toInternalNumberFormat(priceAdj, ".");
            row.fields["ExchangeRate"] = Banana.Converter.toInternalNumberFormat(bookCurrExRate, ".");
        }
        else {
            row.fields["Amount"] = Banana.Converter.toInternalNumberFormat(priceAdj, ".");
        }

        return row;

    }

    getAdjustmentTransactionsRows_FXAdj(itemId, itemDescr, itemAccount, fxAdj, texts) {

        let row = {};
        row.operation = {};
        row.operation.name = "add";
        row.fields = {};
        row.fields["Date"] = Banana.Converter.toInternalDateFormat(this.savedValuesParams.date);
        row.fields["Doc"] = "";
        row.fields["ItemsId"] = itemId;
        row.fields["Description"] = itemDescr + " " + texts.exRateAdjustmentTxt;
        if (fxAdj.indexOf("-") >= 0) {
            row.fields["AccountDebit"] = this.savedAccountsParams.valueChangingcontraAccounts.unrealizedExRateLossAccount || texts.otherValChangeExRateCostPlaceHolder;
            row.fields["AccountCredit"] = itemAccount;
        } else {
            row.fields["AccountDebit"] = itemAccount;
            row.fields["AccountCredit"] = this.savedAccountsParams.valueChangingcontraAccounts.unrealizedExRateGainAccount || texts.otherValChangeExRateIncomePlaceHolder;
        }
        row.fields["ExchangeCurrency"] = this.docInfo.baseCurrency;
        row.fields["Amount"] = Banana.Converter.toInternalNumberFormat(fxAdj, ".");

        return row;

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
    calculatePriceAdjustmentResult(itemCurrentValues, itemCurrentQt, itemUnitMarketPrice) {

        if (!itemCurrentValues)
            return "";

        const itemUnitBookPrice = itemCurrentValues.itemAvgCost;
        let marketValue = Banana.SDecimal.multiply(itemUnitMarketPrice, itemCurrentQt);
        let bookValue = Banana.SDecimal.multiply(itemUnitBookPrice, itemCurrentQt);
        return Banana.SDecimal.subtract(marketValue, bookValue);
    }

    /**
     * L'assestamento della variazione del tasso di cambio viene calcolato
     * sulla base del valore attuale del bilancio, se è presente un aggiustamento
     * del prezzo, è necessario aggiornare il bilancio in moneta del conto tenendo conto
     * dell'assestamento.
     *
     */
    calculateFXAdjustmentResult(itemCurrentValues, itemObj, priceAdj, bookCurrExRate) {

        if (!this.docInfo.isMultiCurrency)
            return "";

        let accBalCurrency = "";
        let fxAdjust = "";
        let accBalanceBase = "";

        if (!itemObj || !itemObj.valueCurrent)
            return;

        const marketBalBase = itemObj.valueCurrent;

        if (priceAdj) {
            // Adjust the current balance then calculate the difference.
            const multiplier = itemCurrentValues.itemOpMultiplier;

            // Item in base currencies does not have multiplier
            if (!multiplier)
                return "";

            const negativeMult = multiplier.indexOf("-") > -1;
            const absMult = Banana.SDecimal.abs(multiplier);

            // Calculate balance adjusted on priceAdj.
            accBalCurrency = Banana.SDecimal.add(itemCurrentValues.itemBalanceCurr, priceAdj);
            accBalanceBase = getAmountInBaseCurrency(accBalCurrency, absMult, negativeMult, bookCurrExRate);

            fxAdjust = Banana.SDecimal.subtract(marketBalBase, accBalanceBase);
        } else {
            // Calculate the difference using the current values as no price adjustment has been found.
            fxAdjust = Banana.SDecimal.subtract(marketBalBase, itemCurrentValues.itemBalanceBase);
        }

        return fxAdjust;
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
