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
// @pubdate = 2025-08-25
// @publisher = Banana.ch SA
// @includejs = ch.banana.portfolio.accounting.accounts.dialog.js
// @includejs = ch.banana.portfolio.accounting.calculation.methods.js
// @includejs = ch.banana.portfolio.accounting.errormessagges.handler.js

/** We must use the class declaration using "var" to be able to correctly use this class outside this file. */
var RecordSalesTransactions = class RecordSalesTransactions {
    constructor(banDoc, docInfo, salesData, dlgParams, itemsData, currItemObj, currentRowObj, showMsgDlg) {
        this.banDoc = banDoc;
        this.docInfo = docInfo;
        this.salesData = salesData;
        this.currentRowObj = currentRowObj;
        this.dlgParams = dlgParams;
        this.jsonDoc = { "format": "documentChange", "error": "" };
        this.settingsId = "ch.banana.portfolio.accounting.accounts.dialog";
        this.savedAccountsParams = this.getAccountsParams(this.banDoc, this.settingsId); // To access to the defined accounts.
        this.texts = this.getTransactionsTexts();
        this.itemsData = itemsData;
        this.itemObject = currItemObj;
        this.salesCodesRegex = new RegExp("^inv_sale_\\d+(\\.\\d+)?$");
        this.trTableData = getTransactionsTableData(this.banDoc, this.docInfo);
        this.transactionsType = this.getTransactionsType();
        this.saleTrRef = ""; // In ExternalReference column of the transactions table.
        this.saleQty = "0"; // Sold quantity.
        this.showMsgDlg = showMsgDlg; // To show messages to the user. Disabled during tests.
    }

    getAccountsParams(banDoc, settingsId) {
        let userParam = getFormattedSavedParams(banDoc, settingsId);
        return verifyAccountsParams(banDoc, userParam);
    }

    getRecordSalesTransactions() {
        let jsonDoc = { "format": "documentChange", "error": "" };
        if (!this.salesData || !this.currentSelectedRowIsValid())
            return {};

        /**
         * In the “AssetType” column of the items table, 
         * we request to indicate the type of Title that is being used:
         * - 1: Stocks
         * - 2: Bonds
         */
        this.saleTrRef = this.currentRowObj.value("ExternalReference"); // By default.

        /** Sold quantity. We need to save this information to be able tu calculate the
         * sale result per unit.*/
        this.saleQty = Banana.SDecimal.abs(this.currentRowObj.value("Quantity"));

        /**Notes: 
         * -To properly set up the document change with the changes, the modification of the main sale row and the addition
         * of the new rows must be done in two separate documents
         * - We identify the transactions automatically created by the program by adding in the ExternalReference column an identifier with
         * the prefix “inv_sale_” followed by a sequence number. For example: inv_sale_1, inv_sale_2, etc. see method: getNewSaleCode()
         * */

        switch (this.itemObject.type) {
            case "2":
                jsonDoc["data"] = this.getBondSaleResultDocChangeTransaction();
                break;
            case "1":
                jsonDoc["data"] = this.getStockSaleResultDocChangeTransaction();
                break;
            default:
                let msg = getErrorMessage_MissingElements("ASSET_WITHOUT_TYPE", this.itemObject.item);
                this.banDoc.addMessage(msg, getErrorMessageReferenceAnchor());
                return {};
        }
        return jsonDoc;
    }

    currentSelectedRowIsValid() {

        /** Let's check whether or not the currently selected line is valid. We wanto to reduce the cases where the user
         *  generates new rows inside the table that are not correct, so we take case of checking if the selected row is 
         * a row wich relates to a sale of a security, to do so we check:
         * - The row is not empty.
         * - The ItemsId column contains a valite item id.
         * - The Quantity column contains a valid quantity (with the minus sign, thats means a sale).
         * - The UnitPrice column is not empty.
         */
        if (this.currentRowObj || !isObjectEmpty(this.currentRowObj)) {
            // row is a valid object, we check now the values.
            let itemIdList = getItemsIds(this.banDoc);

            // Check if the row contains the item id and if the item exists in the items table.
            if (!this.currentRowObj.value("ItemsId") || this.currentRowObj.value("ItemsId") === ""
                || !itemIdList.includes(this.currentRowObj.value("ItemsId"))) {
                let msg = getErrorMessage_MissingElements("ASSET_ID_MISSING_IN_ROW");
                this.banDoc.addMessage(msg, getErrorMessageReferenceAnchor());
                return false;
            }

            // Check if the row contains the quantity.
            if (!this.currentRowObj.value("Quantity") || this.currentRowObj.value("Quantity") === ""
                || this.currentRowObj.value("Quantity").indexOf("-") < 0) {
                let msg = getErrorMessage_MissingElements("QTY_MISSING_IN_ROW");
                this.banDoc.addMessage(msg, getErrorMessageReferenceAnchor());
                return false;
            }

            // Check if the row contains the unit price.
            if (!this.currentRowObj.value("UnitPrice") || this.currentRowObj.value("UnitPrice") === "") {
                let msg = getErrorMessage_MissingElements("UNITPRICE_MISSING_IN_ROW");
                this.banDoc.addMessage(msg, getErrorMessageReferenceAnchor());
                return false;
            }

        } else {
            let msg = getErrorMessage_MissingElements("SELECTED_ROW_NOT_VALID");
            this.banDoc.addMessage(msg, getErrorMessageReferenceAnchor());
            return false;
        }
        return true;
    }

    /**
     * Returns the document containing the changes to be made to the main sales line (the one with the quantity and sales price).
     * These changes are the same for all title types.
     */
    getSaleRowChangesDocument() {
        let docChangeObj = {};
        let rowSale = this.getDocChangeRow_mainSale();
        if (rowSale && !isObjectEmpty(rowSale)) {
            docChangeObj = this.getDocumentChangeInit();

            // Add the row to the document (we just have one row to add)
            let rows = [];
            rows.push(rowSale);

            if (rows.length < 1)
                return {};

            var dataUnitTransactionsTable = {};
            dataUnitTransactionsTable.nameXml = "Transactions";
            dataUnitTransactionsTable.data = {};
            dataUnitTransactionsTable.data.rowLists = [];
            dataUnitTransactionsTable.data.rowLists.push({ "rows": rows });
            docChangeObj.document.dataUnits.push(dataUnitTransactionsTable);
        }

        return docChangeObj;
    }

    /**
     * Returns the document containing the rows to be added (Bonds)
     */
    getBondsOtherRowsChangesDocument() {
        let docChangeObj = this.getDocumentChangeInit();
        let rows = [];

        if (this.docInfo.isMultiCurrency)
            rows = this.getBondTransactionsRowsMulti();
        else
            rows = this.getBondTransactionsRows();

        if (rows.length < 1)
            return {};

        var dataUnitTransactionsTable = {};
        dataUnitTransactionsTable.nameXml = "Transactions";
        dataUnitTransactionsTable.data = {};
        dataUnitTransactionsTable.data.rowLists = [];
        dataUnitTransactionsTable.data.rowLists.push({ "rows": rows });

        docChangeObj.document.dataUnits.push(dataUnitTransactionsTable);

        return docChangeObj;
    }

    /**
 * Returns the document containing the rows to be added (Stocks)
 */
    getStocksOtherRowsChangesDocument() {
        let docChangeObj = this.getDocumentChangeInit();
        let rows = [];

        if (this.docInfo.isMultiCurrency)
            rows = this.getStockTransactionsRowsMulti();
        else
            rows = this.getStockTransactionsRows();

        if (rows.length < 1)
            return {};

        var dataUnitTransactionsTable = {};
        dataUnitTransactionsTable.nameXml = "Transactions";
        dataUnitTransactionsTable.data = {};
        dataUnitTransactionsTable.data.rowLists = [];
        dataUnitTransactionsTable.data.rowLists.push({ "rows": rows });

        docChangeObj.document.dataUnits.push(dataUnitTransactionsTable);

        return docChangeObj;
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

        let data = [];
        let saleRowChangeDocument = this.getSaleRowChangesDocument(); // Row to modify
        let otherRowsChangeDocument = this.getBondsOtherRowsChangesDocument(); // Rows to add

        if (saleRowChangeDocument && !isObjectEmpty(saleRowChangeDocument))
            data.push(saleRowChangeDocument);
        if (otherRowsChangeDocument && !isObjectEmpty(otherRowsChangeDocument))
            data.push(otherRowsChangeDocument);

        return data;
    }

    getDocChangeRow_mainSale() {
        let rowSaleObj = {};
        if (this.saleTrRef.length < 1) { // empty.
            rowSaleObj = this.getDocChangeRow_addSaleRef();
            this.saleTrRef = rowSaleObj.fields["ExternalReference"];
            return rowSaleObj;
        } else if (this.saleTrRef.length > 0 && !this.salesCodesRegex.test(this.saleTrRef)
            && this.customExternalReferenceChecked(this.saleTrRef, this.banDoc.cursor.rowNr)) {
            // The code found in ExternalReference is custom code, we ask the user if he wants to overwrite it.
            rowSaleObj = this.getDocChangeRow_addSaleRef();
            this.saleTrRef = rowSaleObj.fields["ExternalReference"];
            return rowSaleObj;
        } else if (this.salesCodesRegex.test(this.saleTrRef) && this.saleTrRef.indexOf(".") > -1) { // User selected a child row.
            let msg = getErrorMessage_MissingElements("CHILD_ROW_SELECTED");
            banDoc.addMessage(msg, getErrorMessageReferenceAnchor());
            return rowSaleObj;
        } else {
            return rowSaleObj; // The row already contains a valid code, we return an empty object as we dont need any change
        }
    }

    getBondTransactionsRows() {
        let rows = [];

        let rowBankCharges = this.getBondDocChangeRow_bankCharges();
        let rowOtherCahrges = this.getBondDocChangeRow_otherCharges();
        let rowAccruedInterests = this.getBondDocChangeRow_accruedInterests();
        let rowCashedNet = this.getBondDocChangeRow_cashedNet();
        let rowSaleResult = this.getBondDocChangeRow_saleResult();

        if (rowBankCharges && !isObjectEmpty(rowBankCharges) && this.rowExistenceChecked(rowBankCharges, this.transactionsType.BANK_CHARGES))
            rows.push(rowBankCharges);
        if (rowOtherCahrges && !isObjectEmpty(rowOtherCahrges) && this.rowExistenceChecked(rowOtherCahrges, this.transactionsType.OTHER_CHARGES))
            rows.push(rowOtherCahrges);
        if (rowAccruedInterests && !isObjectEmpty(rowAccruedInterests) && this.rowExistenceChecked(rowAccruedInterests, this.transactionsType.ACCRUED_INTERESTS))
            rows.push(rowAccruedInterests);
        if (rowCashedNet && !isObjectEmpty(rowCashedNet) && this.rowExistenceChecked(rowCashedNet, this.transactionsType.CASHED_NET))
            rows.push(rowCashedNet);
        if (rowSaleResult && !isObjectEmpty(rowSaleResult) && this.rowExistenceChecked(rowSaleResult, this.transactionsType.SALE_RESULT))
            rows.push(rowSaleResult);

        return rows;
    }

    getBondTransactionsRowsMulti() {
        let rows = [];

        let rowBankCharges = this.getBondDocChangeRow_bankChargesMulti();
        let rowOtherCahrges = this.getBondDocChangeRow_otherChargesMulti();
        let rowAccruedInterests = this.getBondDocChangeRow_accruedInterestsMulti();
        let rowCashedNet = this.getBondDocChangeRow_cashedNetMulti();
        let rowSaleResult = this.getBondDocChangeRow_saleResultMulti();
        let rowExchangeResult = this.getBondDocChangeRow_ExhangeResult();

        if (rowBankCharges && !isObjectEmpty(rowBankCharges) && this.rowExistenceChecked(rowBankCharges, this.transactionsType.BANK_CHARGES))
            rows.push(rowBankCharges);
        if (rowOtherCahrges && !isObjectEmpty(rowOtherCahrges) && this.rowExistenceChecked(rowOtherCahrges, this.transactionsType.OTHER_CHARGES))
            rows.push(rowOtherCahrges);
        if (rowAccruedInterests && !isObjectEmpty(rowAccruedInterests) && this.rowExistenceChecked(rowAccruedInterests, this.transactionsType.ACCRUED_INTERESTS))
            rows.push(rowAccruedInterests);
        if (rowCashedNet && !isObjectEmpty(rowCashedNet) && this.rowExistenceChecked(rowCashedNet, this.transactionsType.CASHED_NET))
            rows.push(rowCashedNet);
        if (rowSaleResult && !isObjectEmpty(rowSaleResult) && this.rowExistenceChecked(rowSaleResult, this.transactionsType.SALE_RESULT))
            rows.push(rowSaleResult);
        if (rowExchangeResult && !isObjectEmpty(rowExchangeResult)
            && this.rowExistenceChecked(rowSaleResult, this.transactionsType.EXCHANGE_RESULT)
            && !Banana.SDecimal.isZero(this.salesData.exRateResult))
            rows.push(rowExchangeResult);

        return rows;
    }

    getBondDocChangeRow_bankCharges() {
        let row = {};
        let bankCharges = this.dlgParams.bankCharges;
        if (!bankCharges)
            return row;
        row.operation = {};
        row.operation.name = "add";
        row.operation.sequence = this.banDoc.cursor.rowNr + ".1";
        row.fields = {};

        row.fields["Date"] = this.currentRowObj.value("Date") || getCurrentDate();
        row.fields["Doc"] = this.currentRowObj.value("Doc") || "";
        row.fields["ItemsId"] = this.itemObject.item;
        row.fields["ExternalReference"] = this.saleTrRef + ".1";
        row.fields["Description"] = this.itemObject.description.trim() + " " + this.texts.bankCharges;
        row.fields["AccountDebit"] = this.savedAccountsParams.profitAndLossAccounts.chargesAccount || this.texts.bankChargesPlaceHolder;
        row.fields["Amount"] = bankCharges;

        return row;
    }

    getBondDocChangeRow_bankChargesMulti() {
        let row = {};
        let bankCharges = this.dlgParams.bankCharges;
        if (!bankCharges)
            return row;
        row.operation = {};
        row.operation.name = "add";
        row.operation.sequence = this.banDoc.cursor.rowNr + ".1";
        row.fields = {};

        row.fields["Date"] = this.currentRowObj.value("Date") || getCurrentDate();
        row.fields["Doc"] = this.currentRowObj.value("Doc") || "";
        row.fields["ItemsId"] = this.itemObject.item;
        row.fields["ExternalReference"] = this.saleTrRef + ".1";
        row.fields["Description"] = this.itemObject.description.trim() + " " + this.texts.bankCharges;
        row.fields["AccountDebit"] = this.savedAccountsParams.profitAndLossAccounts.chargesAccount || this.texts.bankChargesPlaceHolder;
        row.fields["AmountCurrency"] = Banana.Converter.toInternalNumberFormat(bankCharges, ".");
        row.fields["ExchangeCurrency"] = this.itemObject.currency;
        row.fields["ExchangeRate"] = this.dlgParams.currExRate;

        return row;
    }

    getBondDocChangeRow_otherCharges() {
        let row = {};
        let otherChargesAmount = this.dlgParams.otherCharges;
        if (!otherChargesAmount)
            return row;
        row.operation = {};
        row.operation.name = "add";
        row.operation.sequence = this.banDoc.cursor.rowNr + ".2";
        row.fields = {};

        row.fields["Date"] = this.currentRowObj.value("Date") || getCurrentDate();
        row.fields["Doc"] = this.currentRowObj.value("Doc") || "";
        row.fields["ItemsId"] = this.itemObject.item;
        row.fields["ExternalReference"] = this.saleTrRef + ".2";
        row.fields["Description"] = this.itemObject.description + " " + this.texts.otherCharges;
        row.fields["AccountDebit"] = this.savedAccountsParams.profitAndLossAccounts.otherCostsAccount || this.texts.otherChargesPlaceHolder;
        row.fields["Amount"] = otherChargesAmount;

        return row;
    }

    getBondDocChangeRow_otherChargesMulti() {
        let row = {};
        let otherChargesAmount = this.dlgParams.otherCharges;
        if (!otherChargesAmount)
            return row;
        row.operation = {};
        row.operation.name = "add";
        row.operation.sequence = this.banDoc.cursor.rowNr + ".2";
        row.fields = {};

        row.fields["Date"] = this.currentRowObj.value("Date") || getCurrentDate();
        row.fields["Doc"] = this.currentRowObj.value("Doc") || "";
        row.fields["ItemsId"] = this.itemObject.item;
        row.fields["ExternalReference"] = this.saleTrRef + ".2";
        row.fields["Description"] = this.itemObject.description.trim() + " " + this.texts.otherCharges;
        row.fields["AccountDebit"] = this.savedAccountsParams.profitAndLossAccounts.otherCostsAccount || this.texts.otherChargesPlaceHolder;
        row.fields["AmountCurrency"] = otherChargesAmount;
        row.fields["ExchangeCurrency"] = this.itemObject.currency;
        row.fields["ExchangeRate"] = this.dlgParams.currExRate;

        return row;
    }

    getBondDocChangeRow_accruedInterests() {
        let row = {};
        let accruedInterests = this.salesData.accruedInterests;
        if (!accruedInterests)
            return row;
        row.operation = {};
        row.operation.name = "add";
        row.operation.sequence = this.banDoc.cursor.rowNr + ".3";
        row.fields = {};

        row.fields["Date"] = this.currentRowObj.value("Date") || getCurrentDate();
        row.fields["Doc"] = this.currentRowObj.value("Doc") || "";
        row.fields["ItemsId"] = this.itemObject.item;
        row.fields["ExternalReference"] = this.saleTrRef + ".3";
        row.fields["Description"] = this.itemObject.description + " " + this.texts.accruedInterests;
        row.fields["AccountCredit"] = this.savedAccountsParams.profitAndLossAccounts.interestEarnedAccount || this.texts.accruedInterestsPlaceHolder;
        row.fields["Amount"] = accruedInterests;

        return row;
    }

    getBondDocChangeRow_accruedInterestsMulti() {
        let row = {};
        let accruedInterests = this.salesData.accruedInterests;
        if (!accruedInterests)
            return row;
        row.operation = {};
        row.operation.name = "add";
        row.operation.sequence = this.banDoc.cursor.rowNr + ".3";
        row.fields = {};

        row.fields["Date"] = this.currentRowObj.value("Date") || getCurrentDate();
        row.fields["Doc"] = this.currentRowObj.value("Doc") || "";
        row.fields["ItemsId"] = this.itemObject.item;
        row.fields["ExternalReference"] = this.saleTrRef + ".3";
        row.fields["Description"] = this.itemObject.description.trim() + " " + this.texts.accruedInterests;
        row.fields["AccountCredit"] = this.savedAccountsParams.profitAndLossAccounts.interestEarnedAccount || this.texts.accruedInterestsPlaceHolder;
        row.fields["AmountCurrency"] = accruedInterests;
        row.fields["ExchangeCurrency"] = this.itemObject.currency;
        row.fields["ExchangeRate"] = this.dlgParams.currExRate;

        return row;
    }

    getBondDocChangeRow_cashedNet() {
        let row = {};
        row.operation = {};
        row.operation.name = "add";
        row.operation.sequence = this.banDoc.cursor.rowNr + ".4";
        row.fields = {};

        row.fields["Date"] = this.currentRowObj.value("Date") || getCurrentDate();
        row.fields["Doc"] = this.currentRowObj.value("Doc") || "";
        row.fields["ItemsId"] = this.itemObject.item;
        row.fields["ExternalReference"] = this.saleTrRef + ".4";
        row.fields["Description"] = this.itemObject.description + " " + this.texts.cashedNet;
        row.fields["AccountDebit"] = this.texts.bankAccountPlaceHolder;
        row.fields["Amount"] = Banana.Converter.toInternalNumberFormat(this.getBondCashedNetAmount(), ".");

        return row;
    }

    getBondDocChangeRow_cashedNetMulti() {
        let row = {};
        row.operation = {};
        row.operation.name = "add";
        row.operation.sequence = this.banDoc.cursor.rowNr + ".4";
        row.fields = {};

        row.fields["Date"] = this.currentRowObj.value("Date") || getCurrentDate();
        row.fields["Doc"] = this.currentRowObj.value("Doc") || "";
        row.fields["ItemsId"] = this.itemObject.item;
        row.fields["ExternalReference"] = this.saleTrRef + ".4";
        row.fields["Description"] = this.itemObject.description.trim() + " " + this.texts.cashedNet;
        row.fields["AccountDebit"] = this.texts.bankAccountPlaceHolder;
        row.fields["AmountCurrency"] = Banana.Converter.toInternalNumberFormat(this.getBondCashedNetAmount(), ".");
        row.fields["ExchangeCurrency"] = this.itemObject.currency;
        row.fields["ExchangeRate"] = this.dlgParams.currExRate;

        return row;
    }

    getBondDocChangeRow_saleResult() {
        let row = {};
        let isLossOnSale = this.setIsLossOnSale(this.salesData.saleResult);
        row.operation = {};
        row.operation.name = "add";
        row.operation.sequence = this.banDoc.cursor.rowNr + ".5";
        row.fields = {};

        let itemAccount = getItemAccount(this.itemObject.item, this.banDoc);

        row.fields["Date"] = this.currentRowObj.value("Date") || getCurrentDate();
        row.fields["Doc"] = this.currentRowObj.value("Doc") || "";
        row.fields["ItemsId"] = this.itemObject.item;
        row.fields["ExternalReference"] = this.saleTrRef + ".5";
        row.fields["Description"] = this.itemObject.description + " " + this.texts.resultOnSale;
        row.fields["Quantity"] = getPlusMinusSign() + this.saleQty;
        row.fields["UnitPrice"] = Banana.SDecimal.divide(this.salesData.saleResult,
            this.saleQty, this.getUnitPriceRoundingContext());
        if (isLossOnSale) {
            row.fields["AccountDebit"] = this.savedAccountsParams.valueChangingcontraAccounts.realizedLossAccount
                || this.texts.realizedLossAccountPlaceHolder;
            row.fields["AccountCredit"] = itemAccount;
        } else {
            row.fields["AccountDebit"] = itemAccount;
            row.fields["AccountCredit"] = this.savedAccountsParams.valueChangingcontraAccounts.realizedGainAccount
                || this.texts.realizedGainAccountPlaceHolder;
        }
        row.fields["Amount"] = this.salesData.saleResult;

        return row;
    }

    getBondDocChangeRow_saleResultMulti() {
        let row = {};
        let isLossOnSale = this.setIsLossOnSale(this.salesData.saleResult);
        row.operation = {};
        row.operation.name = "add";
        row.operation.sequence = this.banDoc.cursor.rowNr + ".5";
        row.fields = {};

        let itemAccount = getItemAccount(this.itemObject.item, this.banDoc);

        row.fields["Date"] = this.currentRowObj.value("Date") || getCurrentDate();
        row.fields["Doc"] = this.currentRowObj.value("Doc") || "";
        row.fields["ItemsId"] = this.itemObject.item;
        row.fields["ExternalReference"] = this.saleTrRef + ".5";
        row.fields["Description"] = this.itemObject.description.trim() + " " + this.texts.resultOnSale;
        row.fields["Quantity"] = getPlusMinusSign() + this.saleQty;
        row.fields["UnitPrice"] = Banana.SDecimal.divide(this.salesData.saleResult,
            this.saleQty, this.getUnitPriceRoundingContext());
        if (isLossOnSale) {
            row.fields["AccountDebit"] = this.savedAccountsParams.valueChangingcontraAccounts.realizedLossAccount
                || this.texts.realizedLossAccountPlaceHolder;
            row.fields["AccountCredit"] = itemAccount;
        } else {
            row.fields["AccountDebit"] = itemAccount;
            row.fields["AccountCredit"] = this.savedAccountsParams.valueChangingcontraAccounts.realizedGainAccount
                || this.texts.realizedGainAccountPlaceHolder;
        }
        row.fields["AmountCurrency"] = this.salesData.saleResult;
        row.fields["ExchangeCurrency"] = this.itemObject.currency;
        row.fields["ExchangeRate"] = this.dlgParams.currExRate;

        return row;
    }

    getBondDocChangeRow_ExhangeResult() {
        let row = {};
        let isLossOnExchange = this.setIsLossOnSale(this.salesData.exRateResult);
        row.operation = {};
        row.operation.name = "add";
        row.operation.sequence = this.banDoc.cursor.rowNr + ".6";
        row.fields = {};

        let itemAccount = getItemAccount(this.itemObject.item, this.banDoc);

        row.fields["Date"] = this.currentRowObj.value("Date") || getCurrentDate();
        row.fields["Doc"] = this.currentRowObj.value("Doc") || "";
        row.fields["ItemsId"] = this.itemObject.item;
        row.fields["ExternalReference"] = this.saleTrRef + ".6";
        row.fields["Description"] = this.itemObject.description.trim() + " " + this.texts.resultExchange;
        if (isLossOnExchange) {
            row.fields["AccountDebit"] = this.savedAccountsParams.valueChangingcontraAccounts.realizedExRateLossAccount
                || this.texts.exRateLossAccounPlaceHolder;
            row.fields["AccountCredit"] = itemAccount;
        } else {
            row.fields["AccountDebit"] = itemAccount;
            row.fields["AccountCredit"] = this.savedAccountsParams.valueChangingcontraAccounts.realizedExRateGainAccount
                || this.texts.exRateGainAccounPlaceHolder;
        }

        row.fields["ExchangeCurrency"] = this.docInfo.baseCurrency;
        row.fields["Amount"] = this.salesData.exRateResult;

        return row;
    }

    getBondCashedNetAmount() {
        let netCashedAmount = Banana.SDecimal.subtract(this.salesData.totalSharesvalue, this.dlgParams.bankCharges);
        netCashedAmount = Banana.SDecimal.subtract(netCashedAmount, this.dlgParams.otherCharges);
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

        let data = [];
        let saleRowChangeDocument = this.getSaleRowChangesDocument(); // Row to modify
        let otherRowsChangeDocument = this.getStocksOtherRowsChangesDocument(); // Rows to add

        if (saleRowChangeDocument && !isObjectEmpty(saleRowChangeDocument))
            data.push(saleRowChangeDocument);
        if (otherRowsChangeDocument && !isObjectEmpty(otherRowsChangeDocument))
            data.push(otherRowsChangeDocument);

        return data;
    }

    getStockTransactionsRows() {
        let rows = [];

        let rowBankCharges = this.getStockDocChangeRow_bankCharges();
        let rowOtherCahrges = this.getStockDocChangeRow_otherCharges();
        let rowCashedNet = this.getStockDocChangeRow_cashedNet();
        let rowSaleResult = this.getStockDocChangeRow_saleResult();

        if (rowBankCharges && !isObjectEmpty(rowBankCharges) && this.rowExistenceChecked(rowBankCharges, this.transactionsType.BANK_CHARGES))
            rows.push(rowBankCharges);
        if (rowOtherCahrges && !isObjectEmpty(rowOtherCahrges) && this.rowExistenceChecked(rowOtherCahrges, this.transactionsType.OTHER_CHARGES))
            rows.push(rowOtherCahrges);
        if (rowCashedNet && !isObjectEmpty(rowCashedNet) && this.rowExistenceChecked(rowCashedNet, this.transactionsType.CASHED_NET))
            rows.push(rowCashedNet);
        if (rowSaleResult && !isObjectEmpty(rowSaleResult) && this.rowExistenceChecked(rowSaleResult, this.transactionsType.SALE_RESULT))
            rows.push(rowSaleResult);

        return rows;
    }

    getStockTransactionsRowsMulti() {
        let rows = [];

        let rowBankCharges = this.getStockDocChangeRow_bankChargesMulti();
        let rowOtherCahrges = this.getStockDocChangeRow_otherChargesMulti();
        let rowCashedNet = this.getStockDocChangeRow_cashedNetMulti();
        let rowSaleResult = this.getStockDocChangeRow_saleResultMulti();
        let rowExchangeResult = this.getStockDocChangeRow_ExhangeResult();

        if (rowBankCharges && !isObjectEmpty(rowBankCharges) && this.rowExistenceChecked(rowBankCharges, this.transactionsType.BANK_CHARGES))
            rows.push(rowBankCharges);
        if (rowOtherCahrges && !isObjectEmpty(rowOtherCahrges) && this.rowExistenceChecked(rowOtherCahrges, this.transactionsType.OTHER_CHARGES))
            rows.push(rowOtherCahrges);
        if (rowCashedNet && !isObjectEmpty(rowCashedNet) && this.rowExistenceChecked(rowCashedNet, this.transactionsType.CASHED_NET))
            rows.push(rowCashedNet);
        if (rowSaleResult && !isObjectEmpty(rowSaleResult) && this.rowExistenceChecked(rowSaleResult, this.transactionsType.SALE_RESULT))
            rows.push(rowSaleResult);
        if (rowExchangeResult && !isObjectEmpty(rowExchangeResult)
            && this.rowExistenceChecked(rowExchangeResult, this.transactionsType.EXCHANGE_RESULT)
            && !Banana.SDecimal.isZero(this.salesData.exRateResult))
            rows.push(rowExchangeResult);

        return rows;
    }

    getStockDocChangeRow_bankCharges() {
        let row = {};
        let bankCharges = this.dlgParams.bankCharges;
        if (!bankCharges)
            return row;
        row.operation = {};
        row.operation.name = "add";
        row.operation.sequence = this.banDoc.cursor.rowNr + ".1";
        row.fields = {};

        row.fields["Date"] = this.currentRowObj.value("Date") || getCurrentDate();
        row.fields["Doc"] = this.currentRowObj.value("Doc") || "";
        row.fields["ItemsId"] = this.itemObject.item;
        row.fields["ExternalReference"] = this.saleTrRef + ".1";
        row.fields["Description"] = this.itemObject.description.trim() + " " + this.texts.bankCharges;
        row.fields["AccountDebit"] = this.savedAccountsParams.profitAndLossAccounts.chargesAccount || this.texts.bankChargesPlaceHolder;
        row.fields["Amount"] = bankCharges;

        return row;
    }

    getStockDocChangeRow_otherCharges() {
        let row = {};
        let otherChargesAmount = this.dlgParams.otherCharges;
        if (!otherChargesAmount)
            return row;
        row.operation = {};
        row.operation.name = "add";
        row.operation.sequence = this.banDoc.cursor.rowNr + ".2";
        row.fields = {};

        row.fields["Date"] = this.currentRowObj.value("Date") || getCurrentDate();
        row.fields["Doc"] = this.currentRowObj.value("Doc") || "";
        row.fields["ItemsId"] = this.itemObject.item;
        row.fields["ExternalReference"] = this.saleTrRef + ".2";
        row.fields["Description"] = this.itemObject.description.trim() + " " + this.texts.otherCharges;
        row.fields["AccountDebit"] = this.savedAccountsParams.profitAndLossAccounts.otherCostsAccount || this.texts.otherChargesPlaceHolder;
        row.fields["Amount"] = otherChargesAmount;

        return row;
    }

    getStockDocChangeRow_cashedNet() {
        let row = {};
        row.operation = {};
        row.operation.name = "add";
        row.operation.sequence = this.banDoc.cursor.rowNr + ".3";
        row.fields = {};

        row.fields["Date"] = this.currentRowObj.value("Date") || getCurrentDate();
        row.fields["Doc"] = this.currentRowObj.value("Doc") || "";
        row.fields["ItemsId"] = this.itemObject.item;
        row.fields["ExternalReference"] = this.saleTrRef + ".3";
        row.fields["Description"] = this.itemObject.description.trim() + " " + this.texts.cashedNet;
        row.fields["AccountDebit"] = this.texts.bankAccountPlaceHolder;
        row.fields["Amount"] = Banana.Converter.toInternalNumberFormat(this.getStockCashedNetAmount(), ".");

        return row;
    }

    getStockDocChangeRow_saleResult() {
        let row = {};
        let isLossOnSale = this.setIsLossOnSale(this.salesData.saleResult);
        row.operation = {};
        row.operation.name = "add";
        row.operation.sequence = this.banDoc.cursor.rowNr + ".4";
        row.fields = {};

        let itemAccount = getItemAccount(this.itemObject.item, this.banDoc);

        row.fields["Date"] = this.currentRowObj.value("Date") || getCurrentDate();
        row.fields["Doc"] = this.currentRowObj.value("Doc") || "";
        row.fields["ItemsId"] = this.itemObject.item;
        row.fields["ExternalReference"] = this.saleTrRef + ".4";
        row.fields["Description"] = this.itemObject.description.trim() + " " + this.texts.resultOnSale;
        row.fields["Quantity"] = getPlusMinusSign() + this.saleQty;
        row.fields["UnitPrice"] = Banana.SDecimal.divide(this.salesData.saleResult,
            this.saleQty, this.getUnitPriceRoundingContext());
        if (isLossOnSale) {
            row.fields["AccountDebit"] = this.savedAccountsParams.valueChangingcontraAccounts.realizedLossAccount
                || this.texts.realizedLossAccountPlaceHolder;
            row.fields["AccountCredit"] = itemAccount;
        } else {
            row.fields["AccountDebit"] = itemAccount;
            row.fields["AccountCredit"] = this.savedAccountsParams.valueChangingcontraAccounts.realizedGainAccount
                || this.texts.realizedGainAccountPlaceHolder;
        }
        row.fields["Amount"] = this.salesData.saleResult;

        return row;
    }

    getStockDocChangeRow_ExhangeResult() {
        let row = {};
        let isLossOnExchange = this.setIsLossOnSale(this.salesData.exRateResult);
        row.operation = {};
        row.operation.name = "add";
        row.operation.sequence = this.banDoc.cursor.rowNr + ".5";
        row.fields = {};

        let itemAccount = getItemAccount(this.itemObject.item, this.banDoc);

        row.fields["Date"] = this.currentRowObj.value("Date") || getCurrentDate();
        row.fields["Doc"] = this.currentRowObj.value("Doc") || "";
        row.fields["ItemsId"] = this.itemObject.item;
        row.fields["ExternalReference"] = this.saleTrRef + ".5";
        row.fields["Description"] = this.itemObject.description.trim() + " " + this.texts.resultExchange;
        if (isLossOnExchange) {
            row.fields["AccountDebit"] = this.savedAccountsParams.valueChangingcontraAccounts.realizedExRateLossAccount
                || this.texts.exRateLossAccounPlaceHolder;
            row.fields["AccountCredit"] = itemAccount;
        } else {
            row.fields["AccountDebit"] = itemAccount;
            row.fields["AccountCredit"] = this.savedAccountsParams.valueChangingcontraAccounts.realizedExRateGainAccount
                || this.texts.exRateGainAccounPlaceHolder;
        }

        row.fields["ExchangeCurrency"] = this.docInfo.baseCurrency;
        row.fields["Amount"] = this.salesData.exRateResult;

        return row;
    }

    setIsLossOnExchange(exRateResult) {
        let isLossOnExchange = false;
        if (exRateResult.indexOf("-") > -1)
            isLossOnExchange = true;

        return isLossOnExchange;
    }

    getStockDocChangeRow_saleResultMulti() {
        let row = {};
        let isLossOnSale = this.setIsLossOnSale(this.salesData.saleResult);
        row.operation = {};
        row.operation.name = "add";
        row.operation.sequence = this.banDoc.cursor.rowNr + ".4";
        row.fields = {};

        let itemAccount = getItemAccount(this.itemObject.item, this.banDoc);

        row.fields["Date"] = this.currentRowObj.value("Date") || getCurrentDate();
        row.fields["Doc"] = this.currentRowObj.value("Doc") || "";
        row.fields["ItemsId"] = this.itemObject.item;
        row.fields["ExternalReference"] = this.saleTrRef + ".4";
        row.fields["Description"] = this.itemObject.description.trim() + " " + this.texts.resultOnSale;
        row.fields["Quantity"] = getPlusMinusSign() + this.saleQty;
        row.fields["UnitPrice"] = Banana.SDecimal.divide(this.salesData.saleResult,
            this.saleQty, this.getUnitPriceRoundingContext());
        if (isLossOnSale) {
            row.fields["AccountDebit"] = this.savedAccountsParams.valueChangingcontraAccounts.realizedLossAccount
                || this.texts.realizedLossAccountPlaceHolder;
            row.fields["AccountCredit"] = itemAccount;
        } else {
            row.fields["AccountDebit"] = itemAccount;
            row.fields["AccountCredit"] = this.savedAccountsParams.valueChangingcontraAccounts.realizedGainAccount
                || this.texts.realizedGainAccountPlaceHolder;
        }
        row.fields["AmountCurrency"] = this.salesData.saleResult;
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

    getStockDocChangeRow_cashedNetMulti() {
        let row = {};
        row.operation = {};
        row.operation.name = "add";
        row.operation.sequence = this.banDoc.cursor.rowNr + ".3";
        row.fields = {};

        row.fields["Date"] = this.currentRowObj.value("Date") || getCurrentDate();
        row.fields["Doc"] = this.currentRowObj.value("Doc") || "";
        row.fields["ItemsId"] = this.itemObject.item;
        row.fields["ExternalReference"] = this.saleTrRef + ".3";
        row.fields["Description"] = this.itemObject.description.trim() + " " + this.texts.cashedNet;
        row.fields["AccountDebit"] = this.texts.bankAccountPlaceHolder;
        row.fields["AmountCurrency"] = Banana.Converter.toInternalNumberFormat(this.getStockCashedNetAmount(), ".");
        row.fields["ExchangeCurrency"] = this.itemObject.currency;
        row.fields["ExchangeRate"] = this.dlgParams.currExRate;

        return row;
    }

    getStockCashedNetAmount() {
        let netCashedAmount = Banana.SDecimal.subtract(this.salesData.totalSharesvalue, this.dlgParams.bankCharges);
        netCashedAmount = Banana.SDecimal.subtract(netCashedAmount, this.dlgParams.otherCharges);
        return netCashedAmount;
    }

    getStockDocChangeRow_bankChargesMulti() {
        let row = {};
        let bankCharges = this.dlgParams.bankCharges;
        if (!bankCharges)
            return row;
        row.operation = {};
        row.operation.name = "add";
        row.operation.sequence = this.banDoc.cursor.rowNr + ".1";
        row.fields = {};

        row.fields["Date"] = this.currentRowObj.value("Date") || getCurrentDate();
        row.fields["Doc"] = this.currentRowObj.value("Doc") || "";
        row.fields["ItemsId"] = this.itemObject.item;
        row.fields["ExternalReference"] = this.saleTrRef + ".1";
        row.fields["Description"] = this.itemObject.description.trim() + " " + this.texts.bankCharges;
        row.fields["AccountDebit"] = this.savedAccountsParams.profitAndLossAccounts.chargesAccount || this.texts.bankChargesPlaceHolder;
        row.fields["AmountCurrency"] = bankCharges;
        row.fields["ExchangeCurrency"] = this.itemObject.currency;
        row.fields["ExchangeRate"] = this.dlgParams.currExRate;

        return row;
    }

    getStockDocChangeRow_otherChargesMulti() {
        let row = {};
        let otherChargesAmount = this.dlgParams.otherCharges;
        if (!otherChargesAmount)
            return row;
        row.operation = {};
        row.operation.name = "add";
        row.operation.sequence = this.banDoc.cursor.rowNr + ".2";
        row.fields = {};

        row.fields["Date"] = this.currentRowObj.value("Date") || getCurrentDate();
        row.fields["Doc"] = this.currentRowObj.value("Doc") || "";
        row.fields["ItemsId"] = this.itemObject.item;
        row.fields["ExternalReference"] = this.saleTrRef + ".2";
        row.fields["Description"] = this.itemObject.description.trim() + " " + this.texts.otherCharges;
        row.fields["AccountDebit"] = this.savedAccountsParams.profitAndLossAccounts.otherCostsAccount || this.texts.otherChargesPlaceHolder;
        row.fields["AmountCurrency"] = otherChargesAmount;
        row.fields["ExchangeCurrency"] = this.itemObject.currency;
        row.fields["ExchangeRate"] = this.dlgParams.currExRate;

        return row;
    }

    getDocChangeRow_addSaleRef() {
        let row = {};
        row.operation = {};
        row.operation.name = "modify";
        row.operation.sequence = String(this.banDoc.cursor.rowNr);
        row.fields = {};
        row.fields["ExternalReference"] = this.getNewSaleCode();
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
        let exCodes = this.getAllSaleExistingCodes();
        return this.getFirstAvailableSaleCode(exCodes);
    }

    /**
     * Returns all existing sales codes found in the “ExternalReference” column.
     */
    getAllSaleExistingCodes() {
        let trTable = this.banDoc.table("Transactions");
        let exCodes = [];
        for (var i = 0; i < trTable.rowCount; i++) {
            var tRow = trTable.row(i);
            let exReference = tRow.value("ExternalReference");
            if (this.salesCodesRegex.test(exReference))
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
                return tr.row;
        }
        return -1;
    }

    rowExistenceChecked(rowObj, transactionType) {
        let rowNr = this.findRowByOperationSaleCode(rowObj.fields["ExternalReference"]);
        if ((rowNr >= 0)) {
            if (!this.showMsgDlg) {
                rowObj.operation.name = "modify";
                rowObj.operation.sequence = rowNr.toString();
                return true;
            }

            if (this.getOverwriteTransactionDlg(transactionType)) {
                rowObj.operation.name = "modify";
                rowObj.operation.sequence = rowNr.toString();
                return true;
            }
        } else
            return true;


        return false;
    }

    customExternalReferenceChecked(currentExtRef, rowNr) {
        if (this.showMsgDlg) {
            return this.getOverWriteExternalReferenceDlg(currentExtRef, rowNr);
        }
        return true;
    }

    getOverWriteExternalReferenceDlg(currentExtRef, rowNr) {
        let baseMsg = "The external reference '%1' found at row %2 will be overwritten. Would you like to proceed? ?";
        baseMsg = baseMsg.replace('%1', currentExtRef);
        baseMsg = baseMsg.replace('%2', rowNr);
        let answer = Banana.Ui.showQuestion("Overwrite external reference", baseMsg);
        return answer;
    }

    getOverwriteTransactionDlg(transactionType) {
        let baseMsg = "The %1 have already been recorded, you want to overwrite the transaction ?";
        baseMsg = baseMsg.replace('%1', transactionType);
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
        texts.otherChargesPlaceHolder = "[Other charges account]";
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
        texts.bankChargesPlaceHolder = "[Conto spese bancarie]";
        texts.otherChargesPlaceHolder = "[Conto altre spese]";
        texts.accruedInterestsPlaceHolder = "[Conto interessi maturati]";

        return texts;
    }

    getTransactionsTexts_de() {
        let texts = {};

        texts.bankCharges = "Bankspesen";
        texts.otherCharges = "Sonstige Spesen";
        texts.cashedNet = "Netto eingelöst";
        texts.resultOnSale = "Verkaufsergebnis";
        texts.resultExchange = "Ergebnis des Wechselkurses";
        texts.accruedInterests = "Aufgelaufene Zinsen";

        texts.exRateLossAccounPlaceHolder = "[Konto für realisierte Wechselkursverluste]";
        texts.exRateGainAccounPlaceHolder = "[Konto für realisierte Wechselkursgewinne]";
        texts.realizedLossAccountPlaceHolder = "[Konto für realisierte Verluste]";
        texts.realizedGainAccountPlaceHolder = "[Konto für realisierte Gewinne]";
        texts.bankAccountPlaceHolder = "[Bankkonto]";
        texts.bankChargesPlaceHolder = "[Konto für Bankspesen]";
        texts.otherChargesPlaceHolder = "[Konto für sonstige Spesen]";
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
        texts.bankChargesPlaceHolder = "[Compte des frais bancaires]";
        texts.otherChargesPlaceHolder = "[Compte pour frais divers]";
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

    getUnitPriceRoundingContext() {
        let unitPriceDecimals = this.docInfo.unitPriceColDecimals;
        return { 'decimals': unitPriceDecimals, 'mode': Banana.SDecimal.HALF_UP };
    }
}