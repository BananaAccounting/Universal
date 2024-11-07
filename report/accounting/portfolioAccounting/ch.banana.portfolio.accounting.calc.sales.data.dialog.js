// Copyright [2021] [Banana.ch SA - Lugano Switzerland]
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
// @pubdate = 2022-02-16
// @publisher = Banana.ch SA
// @description = Calculate Sales Data
// @task = app.command
// @doctype = 100.*
// @docproperties =
// @outputformat = none
// @inputdatasource = none
// @timeout = -1
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
        this.labelSaleResultPrev = "";
        this.labelAvgCostPrev = "";
        this.labelExcResultPrev = "";
        this.labelTotValSharesPrev = "";
        this.AvgValSharesPrev = "";
        this.buttonOk = "";
        this.buttonClose = "";
        this.buttonShowResults = "";

        this.currentRowNr = currentRowNr; // Selected row in transactions table.
        this.currentRowObj = this.getCurrentRowObj();

        this.init();

        /** We use an arrow function to make sure the "this" in "this.updateDialogData" refers to the class and not to this.dialog as per default. */
        this.dialog.showPreviews = () => {
            this.updateDialogData();
        };

        /** Dialog's events declaration */
        this.buttonShowResults.clicked.connect(this.dialog, this.dialog.showPreviews);

    }

    getCurrentRowObj() {
        var table = this.banDoc.table("Transactions");
        if (!table)
            return {};
        return table.row(this.currentRowNr);
    }

    init() {

        //sales data section objects
        //07.09.2023: Warning: file:....ch.banana.portfolio.accounting.calc.sales.data.dialog.js:38: Calling C++ methods with 'this' objects different from the one they were retrieved from is broken, due to historical reasons. The original object is used as 'this' object. You can allow the given 'this' object to be used by setting 'pragma NativeMethodBehavior: AcceptThisObject'
        this.cmbItems = this.dialog.findChild('item_comboBox');
        this.lineEditQt = this.dialog.findChild('quantity_lineEdit');
        this.lineEditMarketPrice = this.dialog.findChild('marketPrice_lineEdit');
        this.lineEditCurrentExRate = this.dialog.findChild('currentExchangeRate_lineEdit');

        //preview result label
        this.labelSaleResultPrev = this.dialog.findChild('saleResultPreview_label');
        this.labelAvgCostPrev = this.dialog.findChild('averageCost_label');
        this.labelExcResultPrev = this.dialog.findChild('exchangeResultPreview_label');
        this.labelTotValSharesPrev = this.dialog.findChild('totalValueOfShares_label');
        this.AvgValSharesPrev = this.dialog.findChild('averageValueOfShares_label');

        //Buttons
        this.buttonOk = this.dialog.findChild('okButton');
        this.buttonClose = this.dialog.findChild('closeButton');
        this.buttonShowResults = this.dialog.findChild('showResultsPreview_button');

        // Displayed values
        this.insertComboBoxElements(this.banDoc, this.docInfo);
        this.setQuantity();
        this.setCurrentPrice();
        this.setCurrentExchangeRate();
    }

    setQuantity() {
        if (!this.currentRowObj)
            return;
        let quantity = this.currentRowObj.value("Quantity");
        this.lineEditQt.setText(quantity);
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

    updateDialogData() {
        let exRateResult = "";
        let avgCost = "";
        let baseCurr = "";
        let assetCurr = "";
        let saleResult = "";
        let avgSharesValue = "";
        let totalSharesvalue = "";
        let itemsData = [];
        let userParam = {};
        let salesData = {};

        userParam = this.readDialogParams();
        itemsData = getItemsTableData(this.banDoc, this.docInfo);

        let item = userParam.selectedItem;
        // Check if the item exists
        const itemObject = itemsData.find(obj => obj.item === item)
        if (!itemObject) {
            const ITEM_NOT_FOUND = "ITEM_NOT_FOUND";
            let msg = getErrorMessage_MissingElements(ITEM_NOT_FOUND, item);
            this.banDoc.addMessage(msg, ITEM_NOT_FOUND);
            return "";
        }

        salesData = calculateShareSaleData(this.banDoc, this.docInfo, itemObject, userParam, this.currentRowNr);
        assetCurr = itemObject.currency;
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

        return userParam;

    }

    insertComboBoxElements(banDoc, docInfo) {
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
    let currentRowNr = "";
    if (banDoc.cursor.tableName == "Transactions")
        currentRowNr = banDoc.cursor.rowNr;

    if (!verifyBananaVersion())
        return "@Cancel";

    const dlgCalculateSaleDataManager = new DlgCalculateSaleDataManager(banDoc, docInfo, currentRowNr);

    Banana.application.progressBar.pause();
    var dlgResult = dlgCalculateSaleDataManager.dialog.exec();
    Banana.application.progressBar.resume();

    if (dlgResult !== 1)
        return false;
    else
        return true;

}