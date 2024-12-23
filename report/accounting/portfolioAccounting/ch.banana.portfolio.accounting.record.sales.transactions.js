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
    constructor(banDoc, docInfo, salesData, dlgParams, itemsData, currItemObj, currentRowNr) {
        this.banDoc = banDoc;
        this.docInfo = docInfo;
        this.salesData = salesData;
        this.currentRowNr = currentRowNr;
        this.dlgParams = dlgParams;
        this.jsonDoc = { "format": "documentChange", "error": "" };
        this.settingsId = "ch.banana.portfolio.accounting.accounts.dialog";
        this.savedParams = getFormattedSavedParams(this.settingsId); // To access to the defined accounts
        this.texts = this.getTransactionsTexts();
        this.itemsData = itemsData;
        this.itemObject = currItemObj;
        this.itemType = ""; // Stocks, bonds,... Far definire il tipo all'utente in una colonna ?  
    }
    getRecordSalesTransactions() {
        let jsonDoc = {};
        if (!this.salesData)
            return jsonDoc;
        // Stocks.
        jsonDoc["data"] = this.getStockSaleResultDocChangeTransaction();
        Banana.Ui.showText(JSON.stringify(jsonDoc));
        // Bonds (to define via itemType).
        return jsonDoc;
    }

    /**
    * Returns a document change containing the record of sale of the action.
    * Each sale transactions is composed as following:
    *  |       DESCRIPTION       |           DEBIT          |           CREDIT             |
    *     Total sale		                                        Share account               (This row has to be inserted by the user, contains quantity and selling price)
    *     Bank charges	                Bank charges	
    *     Cashed Net	                Bank account	
    *     Loss or profit on sale	    (Loss share account)        (Share account)
    *     Exchange Rate Profit	        (Shares Unicredit)	        (Exchange profit/loss)      (This row is present only in multi-currency accounting)
    */
    getStockSaleResultDocChangeTransaction() {
        let jsonDoc = this.getDocumentChangeInit();
        jsonDoc.document.dataUnits.nameXml = "Transactions";
        jsonDoc.document.dataUnits.data = {};
        jsonDoc.document.dataUnits.data.rowLists = [];
        let rows = [];

        if (this.docInfo.isMultiCurrency)
            rows = this.getTransactionsRowsMulti();
        else
            rows = this.getTransactionsRows();

        jsonDoc.document.dataUnits.data.rowLists.push({ "rows": rows }); // Riprendere da qui e testare con le spese bancarie, vedere perche non vaa 27.12
        return jsonDoc;
    }

    getTransactionsRowsMulti() {
        let rows = [];
        // Bank charges transaction
        let rowBankCharges = this.getDocChangeRow_bankCharges();
        let rowCashedNet = {};
        let rowSaleResult = {};


        rows.push(rowBankCharges);
    }

    getTransactionsRows() {

    }

    getDocChangeRow_bankCharges() {
        let row = {};
        row.operation = {};
        row.operation.name = "add";
        row.fields = {};

        row.fields["Date"] = getCurrentDate();
        row.fields["ItemsId"] = this.itemObject.item;
        row.fields["Description"] = this.getBankChargesDescription();
        row.fields["AccountDebit"] = this.savedParams.chargesAccount;
        row.fields["AmountCurrency"] = this.savedParams.bankCharges;
        row.fields["ExchangeCurrency"] = this.itemObject.currency;
        row.fields["ExchangeRate"] = this.dlgParams.currExRate;

        return row;
    }

    /**
     * Compone la descrizione per la registrazione delle spese bancarie.
     * La dscrizione è composta dal nome del titolo e dalla descrizione che l'utente
     * usa per indicare il conto delle spese bancarie, che noi abbiamo salvato
     * solo se l'utente lo ha indicato nei "Accounts settings." Se non ce, 
     * lavoro con delle traduzioni predefinite.
     */
    getBankChargesDescription() {
        let description = this.itemObject.description;
        let accDescr = "";
        if (this.savedParams && this.savedParams.chargesAccount) {
            accDescr = this.savedParams.chargesAccount;
        }
        else {
            accDescr = this.texts.bankCharges;
        }

        description += " " + accDescr;
        return description;
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

        texts.bankCharges = "Bank charges";

        return texts;
    }

    getTransactionsTexts_it() {
        let texts = {};

        texts.bankCharges = "Spese bancarie";

        return texts;
    }

    getTransactionsTexts_de() {
        let texts = {};

        texts.bankCharges = "Bankspesen";

        return texts;
    }

    getTransactionsTexts_fr() {
        let texts = {};

        texts.bankCharges = "Frais bancaires";

        return texts;
    }

    getDocumentChangeInit() {


        let jsonDoc = {};
        jsonDoc.document = {};
        jsonDoc.document.dataUnitsfileVersion = "1.0.0";
        jsonDoc.document.dataUnits = [];

        jsonDoc.creator = {};
        var d = new Date();
        //jsonDoc.creator.executionDate = Banana.Converter.toInternalDateFormat(datestring, "yyyymmdd");
        //jsonDoc.creator.executionTime = Banana.Converter.toInternalTimeFormat(timestring, "hh:mm");
        jsonDoc.creator.name = Banana.script.getParamValue('id');
        jsonDoc.creator.version = "1.0";

        return jsonDoc;

    }
}
