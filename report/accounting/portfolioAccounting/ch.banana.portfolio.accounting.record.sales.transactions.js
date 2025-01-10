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
// @id = ch.banana.portfolio.accounting.record.sales.transactions.js
// @api = 1.0
// @pubdate = 2025-01-09
// @publisher = Banana.ch SA
// @includejs = ch.banana.portfolio.accounting.record.sales.transactions.js
// @includejs = ch.banana.portfolio.accounting.calculation.methods.js
// @includejs = ch.banana.portfolio.accounting.errormessagges.handler.js

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
        this.salesCodesRegex = "/^inv_sale_\d+$/";
        this.trTableData = getTransactionsTableData(this.banDoc, this.docInfo);
        this.transactionsType = getTransactionsType();
    }
    getRecordSalesTransactions() {
        let jsonDoc = { "format": "documentChange", "error": "" };
        if (!this.salesData)
            return jsonDoc;

        /**
         * In the “ReferenceUnit” column of the items table, 
         * we request to indicate the type of Title that is being used:
         * - S: Stock
         * - B: Bond
         */
        this.itemType = this.itemObject.type;

        switch (this.itemType) {
            case "B":
                jsonDoc["data"] = this.getBondSaleResultDocChangeTransaction();
                break;
            case "S":
            default:
                jsonDoc["data"] = this.getStockSaleResultDocChangeTransaction();
                break;
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

        if (rows.length < 1)
            return jsonDoc;

        var dataUnitTransactionsTable = {};
        dataUnitTransactionsTable.nameXml = "Transactions";
        dataUnitTransactionsTable.data = {};
        dataUnitTransactionsTable.data.rowLists = [];
        dataUnitTransactionsTable.data.rowLists.push({ "rows": rows });

        jsonDoc.document.dataUnits.push(dataUnitTransactionsTable);

        return jsonDoc;
    }

    getBondTransactionsRows() {
        let rows = [];
        let currExRef = this.currentRowObj.value("ExternalReference");

        // Controlliamo se la riga di vendita selezionata è valida, se dobbiamo aggiungere il codice dell'operazione o crearla nuova da 0.
        if (!selectedRowSaleIsComplete(currExRef)) {
            let rowSale = this.getDocChangeRowSale(currExRef);
            if (!rowSale || Object.entries(rowSale).length === 0)
                return rows;
            else
                rows.push(rowSale);
        }

        let rowBankCharges = this.getBondDocChangeRow_bankCharges();
        let otherCahrges = this.getBondDocChangeRow_otherCharges();
        let accruedInterests = this.getBondDocChangeRow_accruedInterests();
        let rowCashedNet = this.getBondDocChangeRow_cashedNet();
        let rowSaleResult = this.getBondDocChangeRow_saleResult();


        if (rowBankCharges && rowExistenceChecked(rowBankCharges, this.transactionsType.BANK_CHARGES)) // cambiare tutti gli altri metodi sulla base di questi esempi 10.01-13.01 e poi testare.
            rows.push(rowBankCharges);
        if (otherCahrges)
            rows.push(otherCahrges);
        if (accruedInterests)
            rows.push(accruedInterests);
        if (rowCashedNet)
            rows.push(rowCashedNet);
        if (rowSaleResult)
            rows.push(rowSaleResult);

        return rows;
    }

    getBondTransactionsRowsMulti() {
        let rows = [];
        let rowSale = this.getDocChangeRowSale();
        let rowBankCharges = this.getBondDocChangeRow_bankChargesMulti(rowSale);
        let otherCahrges = this.getBondDocChangeRow_otherChargesMulti(rowSale);
        let accruedInterests = this.getBondDocChangeRow_accruedInterestsMulti(rowSale);
        let rowCashedNet = this.getBondDocChangeRow_cashedNetMulti(rowSale);
        let rowSaleResult = this.getBondDocChangeRow_saleResultMulti(rowSale);
        let rowExchangeResult = this.getBondDocChangeRow_ExhangeResult(rowSale);

        if (rowSale)
            rows.push(rowSale);
        if (rowBankCharges)
            rows.push(rowBankCharges);
        if (otherCahrges)
            rows.push(otherCahrges);
        if (accruedInterests)
            rows.push(accruedInterests);
        if (rowCashedNet)
            rows.push(rowCashedNet);
        if (rowSaleResult)
            rows.push(rowSaleResult);
        if (rowExchangeResult)
            rows.push(rowExchangeResult);

        return rows;
    }

    getBondDocChangeRow_bankCharges(rowSale) {
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
        row.fields["ExternalReference"] = rowSale["ExternalReference"] + ".1";
        row.fields["Description"] = this.itemObject.description.trim() + " " + this.texts.bankCharges;
        row.fields["AccountDebit"] = this.savedParams.profitAndLossAccounts.chargesAccount || texts.bankChargesPlaceHolder;
        row.fields["Amount"] = Banana.Converter.toInternalNumberFormat(bankCharges);

        return row;
    }

    getBondDocChangeRow_bankChargesMulti(rowSale) {
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
        row.fields["ExternalReference"] = rowSale["ExternalReference"] + ".1";
        row.fields["Description"] = this.itemObject.description.trim() + " " + this.texts.bankCharges;
        row.fields["AccountDebit"] = this.savedParams.profitAndLossAccounts.chargesAccount || texts.bankChargesPlaceHolder;
        row.fields["AmountCurrency"] = Banana.Converter.toInternalNumberFormat(bankCharges);
        row.fields["ExchangeCurrency"] = this.itemObject.currency;
        row.fields["ExchangeRate"] = this.dlgParams.currExRate;

        return row;
    }

    getBondDocChangeRow_otherCharges(rowSale) {
        let row = {};
        let otherChargesAmount = Banana.Converter.toInternalNumberFormat(this.dlgParams.otherCahrges);
        if (!otherChargesAmount)
            return row;
        row.operation = {};
        row.operation.name = "add";
        row.operation.sequence = Banana.document.cursor.rowNr + ".2";
        row.fields = {};

        row.fields["Date"] = this.currentRowObj.value("Date") || getCurrentDate();
        row.fields["Doc"] = this.currentRowObj.value("Doc") || "";
        row.fields["ItemsId"] = this.itemObject.item;
        row.fields["ExternalReference"] = rowSale["ExternalReference"] + ".2";
        row.fields["Description"] = this.itemObject.description + " " + this.texts.otherCharges;
        row.fields["AccountDebit"] = this.savedParams.profitAndLossAccounts.otherCostsAccount;
        row.fields["Amount"] = Banana.Converter.toInternalNumberFormat(otherChargesAmount);

        return row;
    }

    getBondDocChangeRow_otherChargesMulti(rowSale) {
        let row = {};
        let otherChargesAmount = Banana.Converter.toInternalNumberFormat(this.dlgParams.otherCahrges);
        if (!otherChargesAmount)
            return row;
        row.operation = {};
        row.operation.name = "add";
        row.operation.sequence = Banana.document.cursor.rowNr + ".2";
        row.fields = {};

        row.fields["Date"] = this.currentRowObj.value("Date") || getCurrentDate();
        row.fields["Doc"] = this.currentRowObj.value("Doc") || "";
        row.fields["ItemsId"] = this.itemObject.item;
        row.fields["ExternalReference"] = rowSale["ExternalReference"] + ".2";
        row.fields["Description"] = this.itemObject.description.trim() + " " + this.texts.otherCharges;
        row.fields["AccountDebit"] = this.savedParams.profitAndLossAccounts.otherCostsAccount;
        row.fields["AmountCurrency"] = Banana.Converter.toInternalNumberFormat(otherChargesAmount);
        row.fields["ExchangeCurrency"] = this.itemObject.currency;
        row.fields["ExchangeRate"] = this.dlgParams.currExRate;

        return row;
    }

    getBondDocChangeRow_accruedInterests(rowSale) {
        let row = {};
        row.operation = {};
        row.operation.name = "add";
        row.operation.sequence = Banana.document.cursor.rowNr + ".3";
        row.fields = {};

        row.fields["Date"] = this.currentRowObj.value("Date") || getCurrentDate();
        row.fields["Doc"] = this.currentRowObj.value("Doc") || "";
        row.fields["ItemsId"] = this.itemObject.item;
        row.fields["ExternalReference"] = rowSale["ExternalReference"] + ".3";
        row.fields["Description"] = this.itemObject.description + " " + this.texts.accruedInterests;
        row.fields["AccountCredit"] = this.savedParams.profitAndLossAccounts.interestEarnedAccount || texts.accruedInterestsPlaceHolder;
        row.fields["Amount"] = Banana.Converter.toInternalNumberFormat(this.salesData.accruedInterests);

        return row;
    }

    getBondDocChangeRow_accruedInterestsMulti(rowSale) {
        let row = {};
        row.operation = {};
        row.operation.name = "add";
        row.operation.sequence = Banana.document.cursor.rowNr + ".3";
        row.fields = {};

        row.fields["Date"] = this.currentRowObj.value("Date") || getCurrentDate();
        row.fields["Doc"] = this.currentRowObj.value("Doc") || "";
        row.fields["ItemsId"] = this.itemObject.item;
        row.fields["ExternalReference"] = rowSale["ExternalReference"] + ".3";
        row.fields["Description"] = this.itemObject.description.trim() + " " + this.texts.accruedInterests;
        row.fields["AccountCredit"] = this.savedParams.profitAndLossAccounts.interestEarnedAccount || texts.accruedInterestsPlaceHolder;
        row.fields["AmountCurrency"] = Banana.Converter.toInternalNumberFormat(this.salesData.accruedInterests);
        row.fields["ExchangeCurrency"] = this.itemObject.currency;
        row.fields["ExchangeRate"] = this.dlgParams.currExRate;

        return row;
    }

    getBondDocChangeRow_cashedNet(rowSale) {
        let row = {};
        row.operation = {};
        row.operation.name = "add";
        row.operation.sequence = Banana.document.cursor.rowNr + ".4";
        row.fields = {};

        row.fields["Date"] = this.currentRowObj.value("Date") || getCurrentDate();
        row.fields["Doc"] = this.currentRowObj.value("Doc") || "";
        row.fields["ItemsId"] = this.itemObject.item;
        row.fields["ExternalReference"] = rowSale["ExternalReference"] + ".4";
        row.fields["Description"] = this.itemObject.description + " " + this.texts.cashedNet;
        row.fields["AccountDebit"] = this.texts.bankAccountPlaceHolder;
        row.fields["Amount"] = Banana.Converter.toInternalNumberFormat(this.getBondCashedNetAmount());

        return row;
    }

    getBondDocChangeRow_cashedNetMulti(rowSale) {
        let row = {};
        row.operation = {};
        row.operation.name = "add";
        row.operation.sequence = Banana.document.cursor.rowNr + ".4";
        row.fields = {};

        row.fields["Date"] = this.currentRowObj.value("Date") || getCurrentDate();
        row.fields["Doc"] = this.currentRowObj.value("Doc") || "";
        row.fields["ItemsId"] = this.itemObject.item;
        row.fields["ExternalReference"] = rowSale["ExternalReference"] + ".4";
        row.fields["Description"] = this.itemObject.description.trim() + " " + this.texts.cashedNet;
        row.fields["AccountDebit"] = this.texts.bankAccountPlaceHolder;
        row.fields["AmountCurrency"] = Banana.Converter.toInternalNumberFormat(this.getBondCashedNetAmount());
        row.fields["ExchangeCurrency"] = this.itemObject.currency;
        row.fields["ExchangeRate"] = this.dlgParams.currExRate;

        return row;
    }

    getBondDocChangeRow_saleResult(rowSale) {
        let row = {};
        let isLossOnSale = this.setIsLossOnSale(this.salesData.saleResult);
        row.operation = {};
        row.operation.name = "add";
        row.operation.sequence = Banana.document.cursor.rowNr + ".5";
        row.fields = {};

        let itemAccount = getItemAccount(this.itemObject.item, this.banDoc);

        row.fields["Date"] = this.currentRowObj.value("Date") || getCurrentDate();
        row.fields["Doc"] = this.currentRowObj.value("Doc") || "";
        row.fields["ItemsId"] = this.itemObject.item;
        row.fields["ExternalReference"] = rowSale["ExternalReference"] + ".5";
        row.fields["Description"] = this.itemObject.description + " " + this.texts.resultOnSale;
        if (isLossOnSale) {
            row.fields["AccountDebit"] = this.savedParams.valueChangingcontraAccounts.realizedLossAccount
                || this.texts.realizedLossAccountPlaceHolder;
            row.fields["AccountCredit"] = itemAccount;
        } else {
            row.fields["AccountDebit"] = itemAccount;
            row.fields["AccountCredit"] = this.savedParams.valueChangingcontraAccounts.realizedGainAccount
                || this.texts.realizedGainAccountPlaceHolder;
        }
        row.fields["Amount"] = Banana.Converter.toInternalNumberFormat(this.salesData.saleResult);

        return row;
    }

    getBondDocChangeRow_saleResultMulti(rowSale) {
        let row = {};
        let isLossOnSale = this.setIsLossOnSale(this.salesData.saleResult);
        row.operation = {};
        row.operation.name = "add";
        row.operation.sequence = Banana.document.cursor.rowNr + ".5";
        row.fields = {};

        let itemAccount = getItemAccount(this.itemObject.item, this.banDoc);

        row.fields["Date"] = this.currentRowObj.value("Date") || getCurrentDate();
        row.fields["Doc"] = this.currentRowObj.value("Doc") || "";
        row.fields["ItemsId"] = this.itemObject.item;
        row.fields["ExternalReference"] = rowSale["ExternalReference"] + ".5";
        row.fields["Description"] = this.itemObject.description.trim() + " " + this.texts.resultOnSale;
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

    getBondDocChangeRow_ExhangeResult(rowSale) {
        let row = {};
        let isLossOnExchange = this.setIsLossOnSale(this.salesData.exRateResult);
        row.operation = {};
        row.operation.name = "add";
        row.operation.sequence = Banana.document.cursor.rowNr + ".6";
        row.fields = {};

        let itemAccount = getItemAccount(this.itemObject.item, this.banDoc);

        row.fields["Date"] = this.currentRowObj.value("Date") || getCurrentDate();
        row.fields["Doc"] = this.currentRowObj.value("Doc") || "";
        row.fields["ItemsId"] = this.itemObject.item;
        row.fields["ExternalReference"] = rowSale["ExternalReference"] + ".6";
        row.fields["Description"] = this.itemObject.description.trim() + " " + this.texts.resultExchange;
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

    getBondCashedNetAmount() {
        let netCashedAmount = Banana.SDecimal.subtract(this.salesData.totalSharesvalue, this.dlgParams.bankCharges);
        netCashedAmount = Banana.SDecimal.subtract(netCashedAmount, this.dlgParams.otherCahrges);
        netCashedAmount = Banana.SDecimal.add(netCashedAmount, this.salesData.accruedInterests);
        return netCashedAmount;
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

    getStockTransactionsRows() {
        let rows = [];
        let rowSale = this.getDocChangeRowSale();
        let rowBankCharges = this.getStockDocChangeRow_bankCharges(rowSale);
        let otherCahrges = this.getStockDocChangeRow_otherCharges(rowSale);
        let rowCashedNet = this.getStockDocChangeRow_cashedNet(rowSale);
        let rowSaleResult = this.getStockDocChangeRow_saleResult(rowSale);

        if (rowSale)
            rows.push(rowSale);
        if (rowBankCharges)
            rows.push(rowBankCharges);
        if (otherCahrges)
            rows.push(otherCahrges);
        if (rowCashedNet)
            rows.push(rowCashedNet);
        if (rowSaleResult)
            rows.push(rowSaleResult);

        return rows;
    }

    getStockTransactionsRowsMulti() {
        let rows = [];
        let rowSale = this.getDocChangeRowSale();
        let rowBankCharges = this.getStockDocChangeRow_bankChargesMulti(rowSale);
        let otherCahrges = this.getStockDocChangeRow_otherChargesMulti(rowSale);
        let rowCashedNet = this.getStockDocChangeRow_cashedNetMulti(rowSale);
        let rowSaleResult = this.getStockDocChangeRow_saleResultMulti(rowSale);
        let rowExchangeResult = this.getStockDocChangeRow_ExhangeResult(rowSale);

        if (rowSale)
            rows.push(rowSale);
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

    getStockDocChangeRow_bankCharges(rowSale) {
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
        row.fields["ExternalReference"] = rowSale["ExternalReference"] + ".1";
        row.fields["Description"] = this.itemObject.description.trim() + " " + this.texts.bankCharges;
        row.fields["AccountDebit"] = this.savedParams.profitAndLossAccounts.chargesAccount || texts.bankChargesPlaceHolder;
        row.fields["Amount"] = Banana.Converter.toInternalNumberFormat(bankCharges);

        return row;
    }

    getStockDocChangeRow_otherCharges(rowSale) {
        let row = {};
        let otherChargesAmount = Banana.Converter.toInternalNumberFormat(this.dlgParams.otherCahrges);
        if (!otherChargesAmount)
            return row;
        row.operation = {};
        row.operation.name = "add";
        row.operation.sequence = Banana.document.cursor.rowNr + ".2";
        row.fields = {};

        row.fields["Date"] = this.currentRowObj.value("Date") || getCurrentDate();
        row.fields["Doc"] = this.currentRowObj.value("Doc") || "";
        row.fields["ItemsId"] = this.itemObject.item;
        row.fields["ExternalReference"] = rowSale["ExternalReference"] + ".2";
        row.fields["Description"] = this.itemObject.description.trim() + " " + this.texts.otherCharges;
        row.fields["AccountDebit"] = this.savedParams.profitAndLossAccounts.otherCostsAccount;
        row.fields["Amount"] = Banana.Converter.toInternalNumberFormat(otherChargesAmount);

        return row;
    }

    getStockDocChangeRow_cashedNet(rowSale) {
        let row = {};
        row.operation = {};
        row.operation.name = "add";
        row.operation.sequence = Banana.document.cursor.rowNr + ".3";
        row.fields = {};

        row.fields["Date"] = this.currentRowObj.value("Date") || getCurrentDate();
        row.fields["Doc"] = this.currentRowObj.value("Doc") || "";
        row.fields["ItemsId"] = this.itemObject.item;
        row.fields["ExternalReference"] = rowSale["ExternalReference"] + ".3";
        row.fields["Description"] = this.itemObject.description.trim() + " " + this.texts.cashedNet;
        row.fields["AccountDebit"] = this.texts.bankAccountPlaceHolder;
        row.fields["Amount"] = Banana.Converter.toInternalNumberFormat(this.getStockCashedNetAmount());

        return row;
    }

    getStockDocChangeRow_saleResult(rowSale) {
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
        row.fields["ExternalReference"] = rowSale["ExternalReference"] + ".4";
        row.fields["Description"] = this.itemObject.description.trim() + " " + this.texts.resultOnSale;
        if (isLossOnSale) {
            row.fields["AccountDebit"] = this.savedParams.valueChangingcontraAccounts.realizedLossAccount
                || this.texts.realizedLossAccountPlaceHolder;
            row.fields["AccountCredit"] = itemAccount;
        } else {
            row.fields["AccountDebit"] = itemAccount;
            row.fields["AccountCredit"] = this.savedParams.valueChangingcontraAccounts.realizedGainAccount
                || this.texts.realizedGainAccountPlaceHolder;
        }
        row.fields["Amount"] = Banana.Converter.toInternalNumberFormat(this.salesData.saleResult);

        return row;
    }

    getStockDocChangeRow_ExhangeResult(rowSale) {
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
        row.fields["ExternalReference"] = rowSale["ExternalReference"] + ".5";
        row.fields["Description"] = this.itemObject.description.trim() + " " + this.texts.resultExchange;
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

    getStockDocChangeRow_saleResultMulti(rowSale) {
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
        row.fields["ExternalReference"] = rowSale["ExternalReference"] + ".4";
        row.fields["Description"] = this.itemObject.description.trim() + " " + this.texts.resultOnSale;
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

    getStockDocChangeRow_cashedNetMulti(rowSale) {
        let row = {};
        row.operation = {};
        row.operation.name = "add";
        row.operation.sequence = Banana.document.cursor.rowNr + ".3";
        row.fields = {};

        row.fields["Date"] = this.currentRowObj.value("Date") || getCurrentDate();
        row.fields["Doc"] = this.currentRowObj.value("Doc") || "";
        row.fields["ItemsId"] = this.itemObject.item;
        row.fields["ExternalReference"] = rowSale["ExternalReference"] + ".3";
        row.fields["Description"] = this.itemObject.description.trim() + " " + this.texts.cashedNet;
        row.fields["AccountDebit"] = this.texts.bankAccountPlaceHolder;
        row.fields["AmountCurrency"] = Banana.Converter.toInternalNumberFormat(this.getStockCashedNetAmount());
        row.fields["ExchangeCurrency"] = this.itemObject.currency;
        row.fields["ExchangeRate"] = this.dlgParams.currExRate;

        return row;
    }

    getStockCashedNetAmount() {
        let netCashedAmount = Banana.SDecimal.subtract(this.salesData.totalSharesvalue, this.dlgParams.bankCharges);
        netCashedAmount = Banana.SDecimal.subtract(netCashedAmount, this.dlgParams.otherCahrges);
        return netCashedAmount;
    }

    getStockDocChangeRow_bankChargesMulti(rowSale) {
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
        row.fields["ExternalReference"] = rowSale["ExternalReference"] + ".1";
        row.fields["Description"] = this.itemObject.description.trim() + " " + this.texts.bankCharges;
        row.fields["AccountDebit"] = this.savedParams.profitAndLossAccounts.chargesAccount || texts.bankChargesPlaceHolder;
        row.fields["AmountCurrency"] = Banana.Converter.toInternalNumberFormat(bankCharges);
        row.fields["ExchangeCurrency"] = this.itemObject.currency;
        row.fields["ExchangeRate"] = this.dlgParams.currExRate;

        return row;
    }

    getStockDocChangeRow_otherChargesMulti(rowSale) {
        let row = {};
        let otherChargesAmount = Banana.Converter.toInternalNumberFormat(this.dlgParams.otherCahrges);
        if (!otherChargesAmount)
            return row;
        row.operation = {};
        row.operation.name = "add";
        row.operation.sequence = Banana.document.cursor.rowNr + ".2";
        row.fields = {};

        row.fields["Date"] = this.currentRowObj.value("Date") || getCurrentDate();
        row.fields["Doc"] = this.currentRowObj.value("Doc") || "";
        row.fields["ItemsId"] = this.itemObject.item;
        row.fields["ExternalReference"] = rowSale["ExternalReference"] + ".2";
        row.fields["Description"] = this.itemObject.description.trim() + " " + this.texts.otherCharges;
        row.fields["AccountDebit"] = this.savedParams.profitAndLossAccounts.otherCostsAccount;
        row.fields["AmountCurrency"] = Banana.Converter.toInternalNumberFormat(otherChargesAmount);
        row.fields["ExchangeCurrency"] = this.itemObject.currency;
        row.fields["ExchangeRate"] = this.dlgParams.currExRate;

        return row;
    }

    /**
     * We advise the user to already enter this record manually; the dialog then automatically resumes the data entered.
     * If the user starts from a blank row and fills in the data completely in the dialog, 
     * then we can create this record ourselves as well.
     * If the row is empty, and the values entered are the ones needed, we create a new row.
     * If the row exists, we update it by adding the operation identifier (Column “ExternalReference”).
     * If the row is not empty and already has an operation identifier...
     */
    getDocChangeRowSale(currExRef) {
        let saleRow = {};
        if (this.currentRowObj.isEmpty) {
            saleRow = createSaleRow();
        } else {
            if (!currExRef.match(this.salesCodesRegex))
                saleRow = modifySaleRow();
        }

        return saleRow;
    }

    /**
     * Returns true if the selected title sale row is already in place as is, and does not need to be changed.
     */
    selectedRowSaleIsComplete(currExRef) {
        if (!this.currentRowObj.isEmpty && currExRef.match(this.salesCodesRegex)) {
            return true;
        }

        return false;
    }

    createSaleRow() {
        let row = {};
        row.operation = {};
        row.operation.name = "add";
        row.operation.sequence = Banana.document.cursor.rowNr || getFirstAvailableRowNr(); // testare se funziona.
        row.fields = {};
        let itemAccount = getItemAccount(this.dlgParams.selectedItem);

        row.fields["Date"] = getCurrentDate();
        row.fields["Doc"] = "";
        row.fields["ItemsId"] = this.dlgParams.selectedItem;
        row.fields["ExternalReference"] = getNewSaleCode();
        row.fields["Description"] = getItemDescription(this.dlgParams.selectedItem);
        row.fields["AccountCredit"] = itemAccount;
        if (this.dlgParams.quantity && this.dlgParams.quantity.length >= 0) {
            row.fields["Quantity"] = this.dlgParams.quantity;
        } else {
            let msg = getErrorMessage_MissingElements("DLG_QUANTITY_MISSING");
            banDoc.addMessage(msg, "DLG_QUANTITY_MISSING");
            return {};
        }
        if (this.dlgParams.marketPrice && this.dlgParams.marketPrice.length >= 0) {
            row.fields["UnitPrice"] = this.dlgParams.marketPrice;
        } else {
            let msg = getErrorMessage_MissingElements("DLG_MARKETPRICE_MISSING");
            banDoc.addMessage(msg, "DLG_MARKETPRICE_MISSING");
            return {};
        }

        if (this.docInfo.isMultiCurrency) {
            row.fields["ExchangeCurrency"] = getAccountCurrency(itemAccount, this.banDoc);
            if (this.dlgParams.currExRate && this.dlgParams.currExRate.length >= 0) {
                row.fields["ExchangeRate"] = this.dlgParams.currExRate;
            } else {
                let msg = getErrorMessage_MissingElements("DLG_EXCHANGERATE_MISSING");
                banDoc.addMessage(msg, "DLG_EXCHANGERATE_MISSING");
                return {};
            }
        }
        return row;
    }

    modifySaleRow() {
        let row = {};
        row.operation = {};
        row.operation.name = "modify";
        row.operation.sequence = Banana.document.cursor.rowNr
        row.fields = {};
        row.fields["ExternalReference"] = getNewSaleCode();
        return row;
    }

    /**
     * The operation sale code is entered in the “ExternalReference” column and is used to identify a sales operation.
     * A code composed as follows is added to the initial sales transaction:
     * - prefix: “inv_sale”, allows us to identify the type of transaction we want to work on, leaving out all
     * other types of transactions that use the same column.
     * - sequential unique number.
     * Which would be for example: inv_sale_1, inv_sale_2, etc.
     * The method returns the first available code.
     */
    getNewSaleCode() {
        let exCodes = getAllSaleExistingCodes();
        return getFirstAvailableSaleCode(exCodes);
    }

    /**
     * Returns all existing sales codes found in the “ExternalReference” column.
     */
    getAllSaleExistingCodes() {
        let trTable = this.banDoc.table("Transactions");
        let exCodes = [];
        for (var i = 0; i < trTable.rowCount; i++) {
            var tRow = table.row(i);
            let exReference = tRow.value("ExternalReference");
            if (exReference.match(this.salesCodesRegex))
                exCodes.push(exReference);
        }

        return exCodes;
    }

    /**
     * Returns true if a row is found in the records table.
     * with the sale transaction code equal to “saleCode”.
     */
    findRowByOperationSaleCode(saleCode) {
        for (const tr of this.trTableData) {
            let rowCode = tr.externalReference;
            if (rowCode == saleCode)
                return true;
        }
        return false;
    }

    rowExistenceChecked(rowBankCharges, transactionType) {
        let rowExist = findRowByOperationSaleCode(rowBankCharges.fields["ExternalReference"]);
        if (rowExist) {
            return getOverwriteTransactionDlg(transactionType);
        } else
            return true;
    }

    getOverwriteTransactionDlg(transactionType) {
        let baseMsg = "The %1 have already been recorded, you want to overwrite the transaction ?";
        baseMsg.replace("%1", transactionType);
        let answer = Banana.Ui.showQuestion("Overwrite transaction", baseMsg);
        return answer;
    }

    getTransactionsType() {
        return {
            BANK_CHARGES: "Bank charges",
            OTHER_CHARGES: "Other charges",
            CASHED_NET: "Cashed net",
            SALE_RESULT: "Result on sale",
            EXCHANGE_RESULT: "Exchange result",
            ACCRUED_INTERESTS: "Accrued interests"
        };
    }

    /**
     * Given a list of existing codes, it returns the first available sequential number.
     * Code format: inv_sale_XX
     */
    getFirstAvailableSaleCode(exCodes) {
        let numbers = exCodes.map(code => parseInt(code.split("_").pop(), 10));
        let maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
        let nextNumber = maxNumber + 1;
        let newCode = `inv_sale_${nextNumber}`;
        return newCode;
    }

    /**
     * Returns the first available row number in the Transactions table.
     */
    getFirstAvailableRowNr() {
        let trTable = this.banDoc.table("Transactions");
        let tRows = trTable.rows;
        let lastRowObj = tRows[tRows.length - 1];
        return Banana.SDecimal.add(lastRowObj.rowNr, 1);
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
        texts.accruedInterests = "Accrued interests";
        // Accounts placeholders (replaces accounts if not defined)
        texts.exRateLossAccounPlaceHolder = "[Realized exchange loss account]";
        texts.exRateGainAccounPlaceHolder = "[Realized exchange profit account]";
        texts.realizedLossAccountPlaceHolder = "[Realized loss account]";
        texts.realizedGainAccountPlaceHolder = "[Realized profit account]";
        texts.bankAccountPlaceHolder = "[Bank account]";
        texts.bankChargesPlaceHolder = "[Bank charges account]";
        texts.accruedInterestsPlaceHolder = "[Accrued interests account]";

        return texts;
    }

    getTransactionsTexts_it() {
        let texts = {};

        texts.bankCharges = "Spese bancarie";
        texts.otherCharges = "Altre spese";
        texts.cashedNet = "Netto incassato";
        texts.resultOnSale = "Risultato della vendita";
        texts.resultExchange = "Risultato sul cambio";
        texts.accruedInterests = "Interessi maturati";

        texts.exRateLossAccounPlaceHolder = "[Conto perdite su cambi realizzate]";
        texts.exRateGainAccounPlaceHolder = "[Conto profitti su cambi realizzati]";
        texts.realizedLossAccountPlaceHolder = "[Conto perdite realizzate]";
        texts.realizedGainAccountPlaceHolder = "[Conto profitti realizzati]";
        texts.bankAccountPlaceHolder = "[Conto bancario]";
        texts.bankCharges = "[Conto spese bancarie]";
        texts.accruedInterestsPlaceHolder = "[Conto interessi maturati]";

        return texts;
    }

    getTransactionsTexts_de() {
        let texts = {};

        texts.bankCharges = "Bankspesen";
        texts.otherCharges = "Sonstige Gebühren";
        texts.cashedNet = "Netto eingelöst";
        texts.resultOnSale = "Verkaufsergebnis";
        texts.resultExchange = "Ergebnis des Wechselkurses";
        texts.accruedInterests = "Aufgelaufene Zinsen";

        texts.exRateLossAccounPlaceHolder = "[Konto für realisierte Wechselkursverluste]";
        texts.exRateGainAccounPlaceHolder = "[Konto für realisierte Wechselkursgewinne]";
        texts.realizedLossAccountPlaceHolder = "[Konto für realisierte Verluste]";
        texts.realizedGainAccountPlaceHolder = "[Konto für realisierte Gewinne]";
        texts.bankAccountPlaceHolder = "[Bankkonto]";
        texts.bankCharges = "[Konto für Bankspesen]";
        texts.accruedInterestsPlaceHolder = "[Konto für aufgelaufene Zinsen]";

        return texts;
    }

    getTransactionsTexts_fr() {
        let texts = {};

        texts.bankCharges = "Frais bancaires";
        texts.otherCharges = "Autres frais";
        texts.cashedNet = "Net encaissé";
        texts.resultOnSale = "Résultat de la vente";
        texts.resultExchange = "Résultat du change";
        texts.accruedInterests = "Intérêts courus";

        texts.exRateLossAccounPlaceHolder = "[Compte des pertes de change réalisées]";
        texts.exRateGainAccounPlaceHolder = "[Compte des gains de change réalisés]";
        texts.realizedLossAccountPlaceHolder = "[Compte des pertes réalisées]";
        texts.realizedGainAccountPlaceHolder = "[Compte des gains réalisés]";
        texts.bankAccountPlaceHolder = "[Compte bancaire]";
        texts.bankCharges = "[Compte des frais bancaires]";
        texts.accruedInterestsPlaceHolder = "[Compte d’intérêts courus]"

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
