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
// @id = ch.banana.portfolio.accounting.calc.sales.data.dialog.js
// @api = 1.0
// @pubdate = 2025-08-25
// @publisher = Banana.ch SA
// @description = 3. Calculate sales data
// @task = app.command
// @doctype = 100.*
// @docproperties =
// @outputformat = none
// @inputdatasource = none
// @timeout = -1
// @includejs = ch.banana.portfolio.accounting.record.sales.transactions.js
// @includejs = ch.banana.portfolio.accounting.calculation.methods.js
// @includejs = ch.banana.portfolio.accounting.errormessagges.handler.js

/*******************************************
 * 
 * DIALOG SETUP
 * 
 *******************************************/

class DlgCalculateSaleDataManager {
    constructor(banDoc, docInfo, currentRowNr) {

        this.banDoc = banDoc;
        this.docInfo = docInfo;
        this.dialog = Banana.Ui.createUi("ch.banana.portfolio.accounting.calc.sales.data.dialog.ui");
        this.cmbItems = "";
        this.labelType = "";
        this.lineEditQt = "";
        this.lineEditMarketPrice = "";
        this.lineEditCurrentExRate = "";
        this.lineEditBankCharges = "";
        this.lineEditOtherCharges = "";
        this.lineEditAccruedInterests = "";
        this.labelActualQuantityPrev = "";
        this.labelSaleResultPrev = "";
        this.labelAvgCostPrev = "";
        this.labelExcResultPrev = "";
        this.labelTotValSharesPrev = "";
        this.AvgValSharesPrev = "";
        this.buttonsBox = "";
        this.buttonShowResults = "";
        this.buttonCreateSalesRecord = "";
        this.accruedInterestsGroupBox = "";
        this.documentChangeJsonDoc = {};
        this.unitPriceColDecimals = "";
        this.currentPriceColDecimals = "";
        this.exRateColDecimals = "";

        /*this.dayCountConventions_thirty_360 = "30/360";
        this.dayCountConventions_actual_360 = "Actual/360";
        this.dayCountConventions_actual_365 = "Actual/365";
        this.dayCountConventions_actual_actual = "Actual/Actual";*/

        this.currentRowNr = currentRowNr; // Selected row in transactions table.
        this.currentRowObj = getCurrentRowObj(this.banDoc, this.currentRowNr, "Transactions");

        this.init();

        /** We use an arrow function to make sure the "this" in "this.updateDialogData" refers to the class and not to this.dialog as per default. */
        this.dialog.showPreviews = () => {
            this.updateDialogData();
        };

        this.dialog.showHelp = () => {
            Banana.Ui.showHelp("ch.banana.portfolio.accounting.calc.sales.data.dialog.js");
        };


        this.dialog.createSalesRecord = () => {
            let JsonDoc = this.createDocChangeSaleRecord();
            if (!isObjectEmpty(JsonDoc) && JsonDoc.data[0] && !isObjectEmpty(JsonDoc.data[0])) { // Check if there are new transactions to add
                this.documentChangeJsonDoc = JsonDoc;
                this.dialog.close();
            }
        };

        this.dialog.enableAccruedInterestsElements = () => {
            this.setAccruedInterestsElementsEnabled();
        }

        this.dialog.updateTypeLabel = () => {
            this.setSecurityTypeLabel();
        }

        /** Dialog's events declaration */
        this.buttonsBox.helpRequested.connect(this.dialog, this.dialog.showHelp);
        this.buttonShowResults.clicked.connect(this.dialog, this.dialog.showPreviews);
        this.buttonCreateSalesRecord.clicked.connect(this.dialog, this.dialog.createSalesRecord);
        this.cmbItems.currentIndexChanged.connect(this.dialog, this.dialog.enableAccruedInterestsElements);
        this.cmbItems.editTextChanged.connect(this.dialog, this.dialog.enableAccruedInterestsElements);
        this.cmbItems.currentIndexChanged.connect(this.dialog, this.dialog.updateTypeLabel);
        this.cmbItems.editTextChanged.connect(this.dialog, this.dialog.updateTypeLabel);
    }

    init() {

        if (!this.banDoc)
            return;

        /** We currently hide the Accrued Interest Group Box as we just want to make the user inserting the amount of
         * the accrued interest avoiding all the complex calculations, as those could be much more complex than expected.*/

        //sales data section objects
        //07.09.2023: Warning: file:....ch.banana.portfolio.accounting.calc.sales.data.dialog.js:38: Calling C++ methods with 'this' objects different from the one they were retrieved from is broken, due to historical reasons. The original object is used as 'this' object. You can allow the given 'this' object to be used by setting 'pragma NativeMethodBehavior: AcceptThisObject'
        this.cmbItems = this.dialog.findChild('item_comboBox');
        this.labelType = this.dialog.findChild('typeValue_label');
        this.lineEditQt = this.dialog.findChild('quantity_lineEdit');
        this.lineEditMarketPrice = this.dialog.findChild('marketPrice_lineEdit');
        this.lineEditCurrentExRate = this.dialog.findChild('currentExchangeRate_lineEdit');
        this.lineEditBankCharges = this.dialog.findChild('bankCharges_lineEdit');
        this.lineEditOtherCharges = this.dialog.findChild('otherCharges_lineEdit');
        this.lineEditAccruedInterests = this.dialog.findChild('accruedInterests_lineEdit');

        // Preview result label
        this.labelActualQuantityPrev = this.dialog.findChild('actualQuantity_label');
        this.labelSaleResultPrev = this.dialog.findChild('saleResultPreview_label');
        this.labelAvgCostPrev = this.dialog.findChild('averageCost_label');
        this.labelExcResultPrev = this.dialog.findChild('exchangeResultPreview_label');
        this.labelTotValSharesPrev = this.dialog.findChild('totalValueOfShares_label');
        this.AvgValSharesPrev = this.dialog.findChild('averageValueOfShares_label');

        // Buttons
        this.buttonsBox = this.dialog.findChild('buttonsBox');
        this.buttonShowResults = this.dialog.findChild('showResultsPreview_button');
        this.buttonCreateSalesRecord = this.dialog.findChild('createSaleRecord_button');

        // Others
        let unitPriceColumn = this.banDoc.table("Transactions").column("UnitPrice", "Base");
        let quantityColumn = this.banDoc.table("Transactions").column("Quantity", "Base");
        let exRateColumn = this.banDoc.table("Transactions").column("ExchangeRate", "Base");
        let currentPriceColumn = this.banDoc.table("Items").column("UnitPriceCurrent", "Base");
        let amtColumn = this.banDoc.table("Transactions").column("Amount", "Base");
        let amtCurrColumn = this.banDoc.table("Transactions").column("AmountCurrency", "Base");
        this.unitPriceColDecimals = unitPriceColumn.decimal; // we want to use the same decimals as defined in the unit price column.
        this.quantityColDecimals = quantityColumn.decimal;
        this.currentPriceColDecimals = currentPriceColumn.decimal;
        // We check the correct column to get the amount decimals although normally it should be the same for both.
        if (amtCurrColumn && amtCurrColumn.decimal) {
            this.amtColumnDecimals = amtCurrColumn.decimal;
        } else {
            this.amtColumnDecimals = amtColumn.decimal;
        }

        if (exRateColumn)
            this.exRateColDecimals = exRateColumn.decimal;

        // Displayed values
        this.insertItemsComboBoxElements(this.banDoc, this.docInfo);
        this.setCurrentItem();
        this.setQuantity();
        this.setCurrentPrice();
        this.setCurrentExchangeRate();
        //this.insertDayCountConventionsComboBoxElements();

        // Disable the Accrued Interest Group Box if the selected item is not a bond.
        this.setAccruedInterestsElementsEnabled();
        this.setSecurityTypeLabel();
    }

    setSecurityTypeLabel() {
        let type = "unknown";
        let currentItem = this.cmbItems.currentText;
        let itemsData = getItemsTableData(this.banDoc, this.docInfo);
        let itemObj = itemsData.find(obj => obj.item === currentItem);
        if (itemObj && itemObj.type == "1")
            type = "Stock";
        if (itemObj && itemObj.type == "2")
            type = "Bond";
        this.labelType.setText(type);
    }

    setAccruedInterestsElementsEnabled() {
        let currentItem = this.cmbItems.currentText;
        let itemsData = getItemsTableData(this.banDoc, this.docInfo);
        let itemObj = itemsData.find(obj => obj.item === currentItem);
        if (itemObj && itemObj.type == "2") {
            this.lineEditAccruedInterests.enabled = true;
        } else {
            this.lineEditAccruedInterests.enabled = false;
        }
    }

    setCurrentItem() {
        if (!this.currentRowObj || !this.currentRowObj.value("ItemsId")) {
            if (this.cmbItems.itemCount >= 0)
                this.cmbItems.setCurrentText(this.cmbItems.itemText(0));
            return;
        }
        let item = this.currentRowObj.value("ItemsId");
        this.cmbItems.setCurrentText(item);
    }

    setQuantity() {
        if (!this.currentRowObj)
            return;
        let quantity = this.currentRowObj.value("Quantity");
        let absQuantity = Banana.SDecimal.abs(quantity, { 'decimals': this.quantityColDecimals });
        if (Banana.SDecimal.isZero(absQuantity))
            absQuantity = "";
        this.lineEditQt.setText(Banana.Converter.toLocaleNumberFormat(absQuantity, this.quantityColDecimals, true));
    }

    setCurrentPrice() {
        if (!this.currentRowObj)
            return;
        let currPrice = this.currentRowObj.value("UnitPrice");
        this.lineEditMarketPrice.setText(Banana.Converter.toLocaleNumberFormat(currPrice, this.unitPriceColDecimals, true));
    }

    setCurrentExchangeRate() {
        if (!this.currentRowObj || !this.docInfo.isMultiCurrency)
            return;
        let exRate = this.currentRowObj.value("ExchangeRate");
        this.lineEditCurrentExRate.setText(Banana.Converter.toLocaleNumberFormat(exRate, this.exRateColDecimals, true));
    }

    createDocChangeSaleRecord() {
        let dlgParams = this.readDialogParams();
        let itemsData = getItemsTableData(this.banDoc, this.docInfo);

        if (!itemsData)
            return;

        let salesData = {};


        let item = dlgParams.selectedItem;
        let itemObj = itemsData.find(obj => obj.item === item);
        if (!isValidItemSelected(item, itemObj, this.banDoc)) {
            return {};
        }

        this.convertDlgParamsToInternalFormat(dlgParams);
        salesData = calculateStockSaleData(this.banDoc, this.docInfo, itemObj, dlgParams, this.currentRowNr);
        const recordSalesTransactions = new RecordSalesTransactions(this.banDoc, this.docInfo, salesData,
            dlgParams, itemsData, itemObj, this.currentRowObj, true);
        return recordSalesTransactions.getRecordSalesTransactions();

    }
    convertSalesDataToLocaleFormat(salesData) {
        salesData.currentQt = Banana.Converter.toLocaleNumberFormat(salesData.currentQt, this.quantityColDecimals, true);
        salesData.avgCost = Banana.Converter.toLocaleNumberFormat(salesData.avgCost, this.unitPriceColDecimals, true);
        salesData.saleResult = Banana.Converter.toLocaleNumberFormat(salesData.saleResult, this.amtColumnDecimals, true);
        salesData.exRateResult = Banana.Converter.toLocaleNumberFormat(salesData.exRateResult, this.exRateColDecimals, true);
        salesData.avgSharesValue = Banana.Converter.toLocaleNumberFormat(salesData.avgSharesValue, this.unitPriceColDecimals, true);
        salesData.totalSharesvalue = Banana.Converter.toLocaleNumberFormat(salesData.totalSharesvalue, this.currentPriceColDecimals, true);
        salesData.accruedInterests = Banana.Converter.toLocaleNumberFormat(salesData.accruedInterests, this.unitPriceColDecimals, true);
    }

    updateDialogData() {
        let baseCurr = "";
        let assetCurr = "";
        let itemsData = [];
        let dlgParams = {};
        let salesData = {};

        dlgParams = this.readDialogParams();
        itemsData = getItemsTableData(this.banDoc, this.docInfo);
        let item = dlgParams.selectedItem;

        let itemObj = itemsData.find(obj => obj.item === item);
        if (!isValidItemSelected(item, itemObj, this.banDoc))
            return;

        this.convertDlgParamsToInternalFormat(dlgParams);

        salesData = calculateStockSaleData(this.banDoc, this.docInfo, itemObj, dlgParams, this.currentRowNr);
        assetCurr = itemObj.currency;
        baseCurr = this.docInfo.baseCurrency;

        this.convertSalesDataToLocaleFormat(salesData);

        this.labelActualQuantityPrev.setText(salesData.currentQt);

        if (this.docInfo.isMultiCurrency) {
            this.labelAvgCostPrev.setText(salesData.avgCost + " (" + assetCurr + ")");
            this.labelSaleResultPrev.setText(salesData.saleResult + " (" + assetCurr + ")");
            this.labelExcResultPrev.setText(salesData.exRateResult + " (" + baseCurr + ")");
            this.AvgValSharesPrev.setText(salesData.avgSharesValue + " (" + assetCurr + ")");
            this.labelTotValSharesPrev.setText(salesData.totalSharesvalue + " (" + assetCurr + ")");
        } else {
            this.labelAvgCostPrev.setText(salesData.avgCost);
            this.labelSaleResultPrev.setText(salesData.saleResult);
            this.labelExcResultPrev.setText(salesData.exRateResult);
            this.AvgValSharesPrev.setText(salesData.avgSharesValue);
            this.labelTotValSharesPrev.setText(salesData.totalSharesvalue);
        }
    }

    readDialogParams() {
        var userParam = {};

        userParam.selectedItem = this.cmbItems.currentText;
        userParam.quantity = this.lineEditQt.text;
        userParam.marketPrice = this.lineEditMarketPrice.text;
        userParam.currExRate = this.lineEditCurrentExRate.text;
        userParam.bankCharges = this.lineEditBankCharges.text;
        userParam.otherCharges = this.lineEditOtherCharges.text;
        userParam.accruedInterests = this.lineEditAccruedInterests.text;

        return userParam;

    }

    /* Convert the dialog parameters to the internal format for the calculations.
    * User must use the locale format to enter the numbers in the dialog.
    * Let the API define the decimal separator based on the locale of the document. 
    * */
    convertDlgParamsToInternalFormat(dlgParams) {
        dlgParams.marketPrice = Banana.Converter.toInternalNumberFormat(dlgParams.marketPrice);
        dlgParams.currExRate = Banana.Converter.toInternalNumberFormat(dlgParams.currExRate);
        dlgParams.bankCharges = Banana.Converter.toInternalNumberFormat(dlgParams.bankCharges);
        dlgParams.otherCharges = Banana.Converter.toInternalNumberFormat(dlgParams.otherCharges);
        dlgParams.quantity = Banana.Converter.toInternalNumberFormat(dlgParams.quantity);
        dlgParams.accruedInterests = Banana.Converter.toInternalNumberFormat(dlgParams.accruedInterests);
    }

    insertItemsComboBoxElements(banDoc, docInfo) {
        //First set the editable attribute to true,in this way the user can also enter the text.
        this.cmbItems.editable = true;
        const itemList = new Set();
        var itemsData = getItemsTableData(banDoc, docInfo); //I give as parameter "false" as I only need the list of items

        //fill the listString with the existing items
        for (var r in itemsData) {
            if (itemsData[r].item) {
                itemList.add(itemsData[r].item);
            }
        }

        var itemList_array = Array.from(itemList); //convert the set into an array.

        if (this.cmbItems)
            this.cmbItems.insertItems(1, itemList_array);
    }
}


function exec() {

    let banDoc = Banana.document;

    if (!banDoc)
        return;

    if (!verifyBananaVersion(banDoc))
        return "@Cancel";

    if (!tableExists(banDoc, "Items")) {
        let msg = getErrorMessage_MissingElements("NO_ITEMS_TABLE", "");
        banDoc.addMessage(msg, getErrorMessageReferenceAnchor());
        return "@Cancel";
    }

    let docInfo = getDocumentInfo(banDoc);
    let currentRowNr = getCurrentRowNumber(banDoc, "Transactions");
    let docChange = {};

    const dlgCalculateSaleDataManager = new DlgCalculateSaleDataManager(banDoc, docInfo, currentRowNr);

    Banana.application.progressBar.pause();
    dlgCalculateSaleDataManager.dialog.exec();
    docChange = dlgCalculateSaleDataManager.documentChangeJsonDoc;
    Banana.application.progressBar.resume();

    if (docChange)
        return docChange;
}
