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
// @pubdate = 2024-12-20
// @publisher = Banana.ch SA
// @description = Create sales record
// @task = app.command
// @doctype = 100.*
// @docproperties =
// @outputformat = none
// @inputdatasource = none
// @timeout = -1

/**
 * This script generates and records the sales transactions.
 */
function exec() {

    let banDoc = Banana.document;

    if (!!banDoc || !verifyBananaVersion(banDoc))
        return "@Cancel";

    let docInfo = getDocumentInfo(banDoc);
    let currentRowNr = getCurrentRowNumber(banDoc, "Transactions");
    let calcParams = {};
    let currentRowObj = getCurrentRowObj(banDoc, currentRowNr, "Transactions");
    if (!currentRowObj)
        return docChange;

    calcParams.itemId = currentRowObj.value("ItemsId");
    calcParams.quantity = currentRowObj.value("Quantity");
    calcParams.marketPrice = currentRowObj.value("UnitPrice");
    calcParams.currExRate = currentRowObj.value("ExchangeRate");
    calcParams.currency = currentRowObj.value("ExchangeCurrency");

    salesData = calculateShareSaleData(banDoc, docInfo, itemObject, calcParams, currentRowNr);
    const recordSalesTransactions = new RecordSalesTransactions(banDoc, docInfo, salesData, calcParams, currentRowNr);
    let docChange = recordSalesTransactions.getRecordSalesTransactions();

    return docChange;
}

/** We must use the class declaration using "var" to be able to correctly use this class outside this file. */
var RecordSalesTransactions = class RecordSalesTransactions {
    constructor(banDoc, docInfo, salesData, dlgParams, itemsData, currItemObj, currentRowObj) {
        this.banDoc = banDoc;
        this.docInfo = docInfo;
        this.salesData = salesData;
        this.currentRowObj = currentRowObj;
        this.dlgParams = dlgParams;
        this.jsonDoc = { "format": "documentChange", "error": "" };
        this.settingsId = "ch.banana.portfolio.accounting.accounts.dialog";
        this.savedParams = getFormattedSavedParams(this.settingsId); // To access to the defined accounts
        this.texts = this.getTransactionsTexts();
        this.itemsData = itemsData;
        this.itemObject = currItemObj;
        this.itemType = "S"; // Base is stock.
    }
    getRecordSalesTransactions() {
        let jsonDoc = { "format": "documentChange", "error": "" };
        if (!this.salesData)
            return jsonDoc;

        this.itemType = this.itemObject.type;
        Banana.console.debug(this.itemType);

        switch (this.itemType) {
            case "B":
                jsonDoc["data"] = this.getBondSaleResultDocChangeTransaction();
            case "S":
            default:
                jsonDoc["data"] = this.getStockSaleResultDocChangeTransaction();
        }

        return jsonDoc;
    }

    /**
    * Returns a document change containing the record of sale of a bond.
    * Each sale transactions is composed as following:
    *  |       DESCRIPTION       |              DEBIT             |           CREDIT             |
    *     Total sale		                                               Bonds account            (This row has to be inserted by the user, contains quantity and selling price)
    *     Bank charges	                Bank charges account	
    *     Accrued interest	                                               Interest income             
    *     Cashed Net	                Bank account
    *     Loss or profit on sale	    (Loss share account)               (Share account)
    *     Exchange Rate Profit	        (Share account)	                 (Exchange profit/loss)      (This row is present only in multi-currency accounting)
     */
    getBondSaleResultDocChangeTransaction() {
        let jsonDoc = this.getDocumentChangeInit();
        let rows = [];

        if (this.docInfo.isMultiCurrency)
            rows = this.getBondTransactionsRowsMulti();
        else
            rows = this.getBondTransactionsRows();

        var dataUnitTransactionsTable = {};
        dataUnitTransactionsTable.nameXml = "Transactions";
        dataUnitTransactionsTable.data = {};
        dataUnitTransactionsTable.data.rowLists = [];
        dataUnitTransactionsTable.data.rowLists.push({ "rows": rows });

        jsonDoc.document.dataUnits.push(dataUnitTransactionsTable);

        return jsonDoc;
    }

    getBondTransactionsRowsMulti() {
        let rows = [];
        // Bank charges transaction
        let rowBankCharges = this.getBondDocChangeRow_bankCharges(); // riprendere da quiiii il 31.12
        let otherCahrges = this.getBondDocChangeRow_otherCharges();
        let accruedInterests = this.getBondDocChangeRow_accruedInterests();
        let rowCashedNet = this.getBondDocChangeRow_cashedNet();
        let rowSaleResult = this.getBondDocChangeRow_saleResult();
        let rowExchangeResult = this.getBondDocChangeRow_ExhangeResult();

        if (rowBankCharges)
            rows.push(rowBankCharges);
        if (otherCahrges)
            rows.push(otherCahrges);
        if (rowCashedNet)
            rows.push(rowCashedNet);
        if (rowSaleResult)
            rows.push(rowSaleResult);
        if (rowExchangeResult)
            rows.push(rowExchangeResult);

        return rows;
    }

    /**
    * Returns a document change containing the record of sale of a stock.
    * Each sale transactions is composed as following:
    *  |       DESCRIPTION       |              DEBIT             |           CREDIT             |
    *     Total sale		                                               Share account            (This row has to be inserted by the user, contains quantity and selling price)
    *     Bank charges	                Bank charges account	
    *     Cashed Net	                Bank account	
    *     Loss or profit on sale	    (Loss share account)               (Share account)
    *     Exchange Rate Profit	        (Share account)	                 (Exchange profit/loss)      (This row is present only in multi-currency accounting)
    */
    getStockSaleResultDocChangeTransaction() {
        let jsonDoc = this.getDocumentChangeInit();
        let rows = [];

        if (this.docInfo.isMultiCurrency)
            rows = this.getStockTransactionsRowsMulti();
        else
            rows = this.getStockTransactionsRows();

        var dataUnitTransactionsTable = {};
        dataUnitTransactionsTable.nameXml = "Transactions";
        dataUnitTransactionsTable.data = {};
        dataUnitTransactionsTable.data.rowLists = [];
        dataUnitTransactionsTable.data.rowLists.push({ "rows": rows });

        jsonDoc.document.dataUnits.push(dataUnitTransactionsTable);

        return jsonDoc;
    }

    getStockTransactionsRowsMulti() {
        let rows = [];
        // Bank charges transaction
        let rowBankCharges = this.getStockDocChangeRow_bankCharges();
        let otherCahrges = this.getStockDocChangeRow_otherCharges();
        let rowCashedNet = this.getStockDocChangeRow_cashedNet();
        let rowSaleResult = this.getStockDocChangeRow_saleResult();
        let rowExchangeResult = this.getStockDocChangeRow_ExhangeResult();

        if (rowBankCharges)
            rows.push(rowBankCharges);
        if (otherCahrges)
            rows.push(otherCahrges);
        if (rowCashedNet)
            rows.push(rowCashedNet);
        if (rowSaleResult)
            rows.push(rowSaleResult);
        if (rowExchangeResult)
            rows.push(rowExchangeResult);

        return rows;
    }

    getStockTransactionsRows() {

    }

    getStockDocChangeRow_ExhangeResult() {
        let row = {};
        let isLossOnExchange = this.setIsLossOnSale(this.salesData.exRateResult);
        row.operation = {};
        row.operation.name = "add";
        row.operation.sequence = Banana.document.cursor.rowNr + ".5";
        row.fields = {};

        let itemAccount = getItemAccount(this.itemObject.item, this.banDoc);

        row.fields["Date"] = this.currentRowObj.value("Date") || getCurrentDate();
        row.fields["Doc"] = this.currentRowObj.value("Doc") || "";
        row.fields["ItemsId"] = this.itemObject.item;
        row.fields["Description"] = this.texts.resultExchange;
        if (isLossOnExchange) {
            row.fields["AccountDebit"] = this.savedParams.valueChangingcontraAccounts.realizedExRateLossAccount
                || this.texts.exRateLossAccounPlaceHolder;
            row.fields["AccountCredit"] = itemAccount;
        } else {
            row.fields["AccountDebit"] = itemAccount;
            row.fields["AccountCredit"] = this.savedParams.valueChangingcontraAccounts.realizedExRateGainAccount
                || this.texts.exRateGainAccounPlaceHolder;
        }

        row.fields["ExchangeCurrency"] = this.docInfo.baseCurrency;
        row.fields["Amount"] = Banana.Converter.toInternalNumberFormat(this.salesData.exRateResult);

        return row;
    }

    setIsLossOnExchange(exRateResult) {
        let isLossOnExchange = false;
        if (exRateResult.indexOf("-") > -1)
            isLossOnExchange = true;

        return isLossOnExchange;
    }

    getStockDocChangeRow_saleResult() {
        let row = {};
        let isLossOnSale = this.setIsLossOnSale(this.salesData.saleResult);
        row.operation = {};
        row.operation.name = "add";
        row.operation.sequence = Banana.document.cursor.rowNr + ".4";
        row.fields = {};

        let itemAccount = getItemAccount(this.itemObject.item, this.banDoc);

        row.fields["Date"] = this.currentRowObj.value("Date") || getCurrentDate();
        row.fields["Doc"] = this.currentRowObj.value("Doc") || "";
        row.fields["ItemsId"] = this.itemObject.item;
        row.fields["Description"] = this.texts.resultOnSale;
        if (isLossOnSale) {
            row.fields["AccountDebit"] = this.savedParams.valueChangingcontraAccounts.realizedLossAccount
                || this.texts.realizedLossAccountPlaceHolder;
            row.fields["AccountCredit"] = itemAccount;
        } else {
            row.fields["AccountDebit"] = itemAccount;
            row.fields["AccountCredit"] = this.savedParams.valueChangingcontraAccounts.realizedGainAccount
                || this.texts.realizedGainAccountPlaceHolder;
        }
        row.fields["AmountCurrency"] = Banana.Converter.toInternalNumberFormat(this.salesData.saleResult);
        row.fields["ExchangeCurrency"] = this.itemObject.currency;
        row.fields["ExchangeRate"] = this.dlgParams.currExRate;

        return row;
    }

    setIsLossOnSale(saleResult) {
        let isLossOnSale = false;
        if (saleResult.indexOf("-") > -1)
            isLossOnSale = true;

        return isLossOnSale;
    }

    getStockDocChangeRow_cashedNet() {
        let row = {};
        row.operation = {};
        row.operation.name = "add";
        row.operation.sequence = Banana.document.cursor.rowNr + ".3";
        row.fields = {};

        row.fields["Date"] = this.currentRowObj.value("Date") || getCurrentDate();
        row.fields["Doc"] = this.currentRowObj.value("Doc") || "";
        row.fields["ItemsId"] = this.itemObject.item;
        row.fields["Description"] = this.texts.cashedNet;
        row.fields["AccountDebit"] = this.texts.bankAccountPlaceHolder;
        row.fields["AmountCurrency"] = Banana.Converter.toInternalNumberFormat(this.getCashedNetAmount());
        row.fields["ExchangeCurrency"] = this.itemObject.currency;
        row.fields["ExchangeRate"] = this.dlgParams.currExRate;

        return row;
    }

    getCashedNetAmount() {
        let netCashedAmount = Banana.SDecimal.subtract(this.salesData.totalSharesvalue, this.dlgParams.bankCharges);
        netCashedAmount = Banana.SDecimal.subtract(netCashedAmount, this.dlgParams.otherCahrges);
        return netCashedAmount;
    }

    getStockDocChangeRow_bankCharges() {
        let row = {};
        let bankCharges = Banana.Converter.toInternalNumberFormat(this.dlgParams.bankCharges);
        if (!bankCharges)
            return row;
        row.operation = {};
        row.operation.name = "add";
        row.operation.sequence = Banana.document.cursor.rowNr + ".1";
        row.fields = {};

        row.fields["Date"] = this.currentRowObj.value("Date") || getCurrentDate();
        row.fields["Doc"] = this.currentRowObj.value("Doc") || "";
        row.fields["ItemsId"] = this.itemObject.item;
        row.fields["Description"] = this.texts.bankCharges;
        row.fields["AccountDebit"] = this.savedParams.profitAndLossAccounts.chargesAccount || texts.bankChargesPlaceHolder;
        row.fields["AmountCurrency"] = Banana.Converter.toInternalNumberFormat(bankCharges);
        row.fields["ExchangeCurrency"] = this.itemObject.currency;
        row.fields["ExchangeRate"] = this.dlgParams.currExRate;

        return row;
    }

    getStockDocChangeRow_otherCharges() {
        let row = {};
        let otherChargesAmount = Banana.Converter.toInternalNumberFormat(this.dlgParams.otherCahrges);
        if (!otherChargesAmount)
            return row;
        row.operation = {};
        row.operation.name = "add";
        row.operation.sequence = Banana.document.cursor.rowNr + ".2";
        row.fields = {};

        row.fields["Date"] = getCurrentDate();
        row.fields["Doc"] = this.currentRowObj.value("Doc") || "";
        row.fields["ItemsId"] = this.itemObject.item;
        row.fields["Description"] = this.texts.otherCharges;
        row.fields["AccountDebit"] = this.savedParams.profitAndLossAccounts.otherCostsAccount;
        row.fields["AmountCurrency"] = Banana.Converter.toInternalNumberFormat(otherChargesAmount);
        row.fields["ExchangeCurrency"] = this.itemObject.currency;
        row.fields["ExchangeRate"] = this.dlgParams.currExRate;

        return row;
    }

    getTransactionsTexts() {

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

    getTransactionsTexts_en() {
        let texts = {};

        // Accounts descriptions
        texts.bankCharges = "Bank charges";
        texts.otherCharges = "Other charges";
        texts.cashedNet = "Cashed Net";
        texts.resultOnSale = "Result on sale";
        texts.resultExchange = "Result on exchange";
        // Accounts placeholders (replaces accounts if not defined)
        texts.exRateLossAccounPlaceHolder = "[Realized exchange loss account]";
        texts.exRateGainAccounPlaceHolder = "[Realized exchange profit account]";
        texts.realizedLossAccountPlaceHolder = "[Realized loss account]";
        texts.realizedGainAccountPlaceHolder = "[Realized profit account]";
        texts.bankAccountPlaceHolder = "[Bank account]";
        texts.bankChargesPlaceHolder = "[Bank charges account]";

        return texts;
    }

    getTransactionsTexts_it() {
        let texts = {};

        texts.bankCharges = "Spese bancarie";
        texts.otherCharges = "Altre spese";
        texts.cashedNet = "Netto incassato";
        texts.resultOnSale = "Risultato della vendita";
        texts.resultExchange = "Risultato sul cambio";

        texts.exRateLossAccounPlaceHolder = "[Conto perdite su cambi realizzate]";
        texts.exRateGainAccounPlaceHolder = "[Conto profitti su cambi realizzati]";
        texts.realizedLossAccountPlaceHolder = "[Conto perdite realizzate]";
        texts.realizedGainAccountPlaceHolder = "[Conto profitti realizzati]";
        texts.bankAccountPlaceHolder = "[Conto bancario]";
        texts.bankCharges = "[Conto spese bancarie]";

        return texts;
    }

    getTransactionsTexts_de() {
        let texts = {};

        texts.bankCharges = "Bankspesen";
        texts.otherCharges = "Sonstige Gebühren";
        texts.cashedNet = "Netto eingelöst";
        texts.resultOnSale = "Verkaufsergebnis";
        texts.resultExchange = "Ergebnis des Wechselkurses";

        texts.exRateLossAccounPlaceHolder = "[Konto für realisierte Wechselkursverluste]";
        texts.exRateGainAccounPlaceHolder = "[Konto für realisierte Wechselkursgewinne]";
        texts.realizedLossAccountPlaceHolder = "[Konto für realisierte Verluste]";
        texts.realizedGainAccountPlaceHolder = "[Konto für realisierte Gewinne]";
        texts.bankAccountPlaceHolder = "[Bankkonto]";
        texts.bankCharges = "[Konto für Bankspesen]";

        return texts;
    }

    getTransactionsTexts_fr() {
        let texts = {};

        texts.bankCharges = "Frais bancaires";
        texts.otherCharges = "Autres frais";
        texts.cashedNet = "Net encaissé";
        texts.resultOnSale = "Résultat de la vente";
        texts.resultExchange = "Résultat du change";

        texts.exRateLossAccounPlaceHolder = "[Compte des pertes de change réalisées]";
        texts.exRateGainAccounPlaceHolder = "[Compte des gains de change réalisés]";
        texts.realizedLossAccountPlaceHolder = "[Compte des pertes réalisées]";
        texts.realizedGainAccountPlaceHolder = "[Compte des gains réalisés]";
        texts.bankAccountPlaceHolder = "[Compte bancaire]";
        texts.bankCharges = "[Compte des frais bancaires]";

        return texts;
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
