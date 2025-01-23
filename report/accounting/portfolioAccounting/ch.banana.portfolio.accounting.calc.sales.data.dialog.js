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
// @id = ch.banana.portfolio.accounting.js
// @api = 1.0
// @pubdate = 2024-12-23
// @publisher = Banana.ch SA
// @description = Calculate Sales Data
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
        this.lineEditQt = "";
        this.lineEditMarketPrice = "";
        this.lineEditCurrentExRate = "";
        this.lineEditBankCharges = "";
        this.lineEditOtherCharges = "";
        this.lineEditAccruedInterests = "";
        this.labelSaleResultPrev = "";
        this.labelAvgCostPrev = "";
        this.labelExcResultPrev = "";
        this.labelTotValSharesPrev = "";
        this.AvgValSharesPrev = "";
        this.buttonOk = "";
        this.buttonClose = "";
        this.buttonShowResults = "";
        this.buttonCreateSalesRecord = "";
        this.accruedInterestsGroupBox = "";
        this.documentChangeJsonDoc = {};

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

        this.dialog.createSalesRecord = () => {
            let JsonDoc = this.createDocChangeSaleRecord();
            if (JsonDoc.data[1] && !isObjectEmpty(JsonDoc.data[1])) { // Check if there are new transactions to add
                this.documentChangeJsonDoc = JsonDoc;
                this.dialog.close();
            }
        };

        this.dialog.enableAccruedInterestsElements = () => {
            this.setAccruedInterestsElementsEnabled();
        }

        /** Dialog's events declaration */
        this.buttonShowResults.clicked.connect(this.dialog, this.dialog.showPreviews);
        this.buttonCreateSalesRecord.clicked.connect(this.dialog, this.dialog.createSalesRecord);
        this.cmbItems.currentIndexChanged.connect(this.dialog, this.dialog.enableAccruedInterestsElements);
        this.cmbItems.editTextChanged.connect(this.dialog, this.dialog.enableAccruedInterestsElements);
    }

    init() {

        /** We currently hide the Accrued Interest Group Box as we just want to make the user inserting the amount of
         * the accrued interest avoiding all the complex calculations, as those could be much more complex than expected.*/

        //sales data section objects
        //07.09.2023: Warning: file:....ch.banana.portfolio.accounting.calc.sales.data.dialog.js:38: Calling C++ methods with 'this' objects different from the one they were retrieved from is broken, due to historical reasons. The original object is used as 'this' object. You can allow the given 'this' object to be used by setting 'pragma NativeMethodBehavior: AcceptThisObject'
        this.cmbItems = this.dialog.findChild('item_comboBox');
        this.lineEditQt = this.dialog.findChild('quantity_lineEdit');
        this.lineEditMarketPrice = this.dialog.findChild('marketPrice_lineEdit');
        this.lineEditCurrentExRate = this.dialog.findChild('currentExchangeRate_lineEdit');
        this.lineEditBankCharges = this.dialog.findChild('bankCharges_lineEdit');
        this.lineEditOtherCharges = this.dialog.findChild('otherCharges_lineEdit');
        this.lineEditAccruedInterests = this.dialog.findChild('accruedInterests_lineEdit');

        // Preview result label
        this.labelSaleResultPrev = this.dialog.findChild('saleResultPreview_label');
        this.labelAvgCostPrev = this.dialog.findChild('averageCost_label');
        this.labelExcResultPrev = this.dialog.findChild('exchangeResultPreview_label');
        this.labelTotValSharesPrev = this.dialog.findChild('totalValueOfShares_label');
        this.AvgValSharesPrev = this.dialog.findChild('averageValueOfShares_label');

        // Buttons
        this.buttonOk = this.dialog.findChild('okButton');
        this.buttonClose = this.dialog.findChild('closeButton');
        this.buttonShowResults = this.dialog.findChild('showResultsPreview_button');
        this.buttonCreateSalesRecord = this.dialog.findChild('createSaleRecord_button');


        // Displayed values
        this.insertItemsComboBoxElements(this.banDoc, this.docInfo);
        this.setCurrentItem();
        this.setQuantity();
        this.setCurrentPrice();
        this.setCurrentExchangeRate();
        //this.insertDayCountConventionsComboBoxElements();

        // Disable the Accrued Interest Group Box if the selected item is not a bond.
        this.setAccruedInterestsElementsEnabled();

    }

    setAccruedInterestsElementsEnabled() {
        let currentItem = this.cmbItems.currentText;
        let itemsData = getItemsTableData(this.banDoc, this.docInfo);
        let itemObj = itemsData.find(obj => obj.item === currentItem);
        if (itemObj && itemObj.type == "B") {
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
        let absQuantity = Banana.SDecimal.abs(quantity);
        if (Banana.SDecimal.isZero(absQuantity))
            absQuantity = "";
        this.lineEditQt.setText(absQuantity);
    }

    setCurrentPrice() {
        if (!this.currentRowObj)
            return;
        let currPrice = this.currentRowObj.value("UnitPrice");
        this.lineEditMarketPrice.setText(currPrice);
    }

    setCurrentExchangeRate() {
        if (!this.currentRowObj || !this.docInfo.isMultiCurrency)
            return;
        let exRate = this.currentRowObj.value("ExchangeRate");
        this.lineEditCurrentExRate.setText(exRate);
    }

    createDocChangeSaleRecord() {
        let dlgParams = this.readDialogParams();
        let itemsData = getItemsTableData(this.banDoc, this.docInfo);

        if (!itemsData)
            return;

        let salesData = {};

        let item = dlgParams.selectedItem;
        let itemObj = itemsData.find(obj => obj.item === item);
        if (!isValidItemSelected(item, itemObj, this.banDoc))
            return;

        salesData = calculateStockSaleData(this.banDoc, this.docInfo, itemObj, dlgParams, this.currentRowNr);
        const recordSalesTransactions = new RecordSalesTransactions(this.banDoc, this.docInfo, salesData,
            dlgParams, itemsData, itemObj, this.currentRowObj, true);
        return recordSalesTransactions.getRecordSalesTransactions();

    }

    updateDialogData() {
        let exRateResult = "";
        let avgCost = "";
        let baseCurr = "";
        let assetCurr = "";
        let saleResult = "";
        let avgSharesValue = "";
        let totalSharesvalue = "";
        let itemsData = [];
        let dlgParams = {};
        let salesData = {};

        dlgParams = this.readDialogParams();
        itemsData = getItemsTableData(this.banDoc, this.docInfo);
        let item = dlgParams.selectedItem;

        let itemObj = itemsData.find(obj => obj.item === item);
        if (!isValidItemSelected(item, itemObj, this.banDoc))
            return;

        salesData = calculateStockSaleData(this.banDoc, this.docInfo, itemObj, dlgParams, this.currentRowNr);
        assetCurr = itemObj.currency;
        baseCurr = this.docInfo.baseCurrency;

        avgCost = Banana.Converter.toLocaleNumberFormat(salesData.avgCost, 2, true);
        saleResult = Banana.Converter.toLocaleNumberFormat(salesData.saleResult, 2, true);
        exRateResult = Banana.Converter.toLocaleNumberFormat(salesData.exRateResult, 2, true);
        avgSharesValue = Banana.Converter.toLocaleNumberFormat(salesData.avgSharesValue, 2, true);
        totalSharesvalue = Banana.Converter.toLocaleNumberFormat(salesData.totalSharesvalue, 2, true);


        if (this.docInfo.isMultiCurrency) {
            this.labelAvgCostPrev.setText(avgCost + " (" + assetCurr + ")");
            this.labelSaleResultPrev.setText(saleResult + " (" + assetCurr + ")");
            this.labelExcResultPrev.setText(exRateResult + " (" + baseCurr + ")");
            this.AvgValSharesPrev.setText(avgSharesValue + " (" + assetCurr + ")");
            this.labelTotValSharesPrev.setText(totalSharesvalue + " (" + assetCurr + ")");
        } else {
            this.labelAvgCostPrev.setText(avgCost);
            this.labelSaleResultPrev.setText(saleResult);
            this.labelExcResultPrev.setText(exRateResult);
            this.AvgValSharesPrev.setText(avgSharesValue);
            this.labelTotValSharesPrev.setText(totalSharesvalue);
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

    let docInfo = getDocumentInfo(banDoc);
    let currentRowNr = getCurrentRowNumber(banDoc, "Transactions");
    let docChange = {};

    if (!verifyBananaVersion(banDoc))
        return "@Cancel";

    const dlgCalculateSaleDataManager = new DlgCalculateSaleDataManager(banDoc, docInfo, currentRowNr);

    Banana.application.progressBar.pause();
    dlgCalculateSaleDataManager.dialog.exec();
    docChange = dlgCalculateSaleDataManager.documentChangeJsonDoc;
    Banana.application.progressBar.resume();

    if (docChange)
        return docChange;
}