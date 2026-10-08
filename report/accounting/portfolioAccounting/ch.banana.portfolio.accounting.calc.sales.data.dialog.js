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
// @id = ch.banana.portfolio.accounting.calc.sales.data.dialog.js
// @api = 1.0
// @pubdate = 2025-08-25
// @publisher = Banana.ch SA
// @description = 3. Calculate sales data [developed with AI]
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

const ERROR_FIELD_STYLE = "border: 1px solid #b3261e; border-radius: 3px; padding: 2px;";
const GAIN_COLOR = "#1e7b34";
const LOSS_COLOR = "#b3261e";
const EMPTY_PREVIEW_VALUE = "–";

class DlgCalculateSaleDataManager {
    constructor(banDoc, docInfo, currentRowNr) {

        this.banDoc = banDoc;
        this.docInfo = docInfo;
        this.dialog = Banana.Ui.createUi("ch.banana.portfolio.accounting.calc.sales.data.dialog.ui");
        this.cmbItems = "";
        this.labelSecurityName = "";
        this.lineEditQt = "";
        this.lineEditMarketPrice = "";
        this.lineEditCurrentExRate = "";
        this.lineEditBankCharges = "";
        this.lineEditOtherCharges = "";
        this.lineEditAccruedInterests = "";
        // Current position
        this.labelActualQuantityPrev = "";
        this.labelCurrentBookValue = "";
        this.labelCurrentUnitBookValue = "";
        // Result
        this.labelSaleResultPrev = "";
        this.labelExcResultPrev = "";
        this.labelTotValSharesPrev = "";
        this.AvgValSharesPrev = "";
        // Position after the sale
        this.labelQuantityAfterSale = "";
        this.labelBookValueAfterSale = "";
        this.labelUnitBookValueAfterSale = "";
        // Others
        this.recordingGroupBox = "";
        this.checkBoxRecord = "";
        this.labelStatus = "";
        this.labelFieldErrors = "";
        this.buttonsBox = "";
        this.positionCache = { 'item': "", 'data': null };
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

        /**
         * OK button: if "Record the sale transactions" is checked, creates the sale transactions
         * (if they cannot be created the dialog stays open), otherwise closes the dialog without changes.
         */
        this.dialog.createSalesRecord = () => {
            this.setStatusText("");
            if (!this.checkBoxRecord.checked) {
                this.documentChangeJsonDoc = {};
                this.dialog.close();
                return;
            }
            if (!this.validateInputFields(true)) {
                this.setStatusText(qsTr("Correct the fields marked in red."));
                return;
            }
            let JsonDoc = this.createDocChangeSaleRecord();
            if (JsonDoc && !isObjectEmpty(JsonDoc) && JsonDoc.data && JsonDoc.data[0] && !isObjectEmpty(JsonDoc.data[0])) { // Check if there are new transactions to add
                this.documentChangeJsonDoc = JsonDoc;
                this.dialog.close();
            } else {
                this.setStatusText(qsTr("The sale transactions could not be created. Check the data entered and the messages shown by Banana."));
            }
        };

        this.dialog.updateSecurityData = () => {
            this.updateSecurityElements();
            this.updateDialogData();
        }

        /** Charges and interests are only used to record the transactions. */
        this.dialog.updateRecordingMode = () => {
            this.recordingGroupBox.enabled = this.checkBoxRecord.checked;
            this.updateDialogData();
        }

        /** Dialog's events declaration */
        this.buttonsBox.accepted.connect(this.dialog, this.dialog.createSalesRecord);
        this.buttonsBox.helpRequested.connect(this.dialog, this.dialog.showHelp);
        this.checkBoxRecord.toggled.connect(this.dialog, this.dialog.updateRecordingMode);
        this.cmbItems.currentIndexChanged.connect(this.dialog, this.dialog.updateSecurityData);
        this.cmbItems.editTextChanged.connect(this.dialog, this.dialog.updateSecurityData);
        // The previews are recalculated when the user leaves a field.
        this.lineEditQt.editingFinished.connect(this.dialog, this.dialog.showPreviews);
        this.lineEditMarketPrice.editingFinished.connect(this.dialog, this.dialog.showPreviews);
        this.lineEditCurrentExRate.editingFinished.connect(this.dialog, this.dialog.showPreviews);
        this.lineEditBankCharges.editingFinished.connect(this.dialog, this.dialog.showPreviews);
        this.lineEditOtherCharges.editingFinished.connect(this.dialog, this.dialog.showPreviews);
        this.lineEditAccruedInterests.editingFinished.connect(this.dialog, this.dialog.showPreviews);
    }

    init() {

        if (!this.banDoc)
            return;

        /** We currently hide the Accrued Interest Group Box as we just want to make the user inserting the amount of
         * the accrued interest avoiding all the complex calculations, as those could be much more complex than expected.*/

        //sales data section objects
        //07.09.2023: Warning: file:....ch.banana.portfolio.accounting.calc.sales.data.dialog.js:38: Calling C++ methods with 'this' objects different from the one they were retrieved from is broken, due to historical reasons. The original object is used as 'this' object. You can allow the given 'this' object to be used by setting 'pragma NativeMethodBehavior: AcceptThisObject'
        this.cmbItems = this.dialog.findChild('item_comboBox');
        this.labelSecurityName = this.dialog.findChild('securityName_label');
        this.lineEditQt = this.dialog.findChild('quantity_lineEdit');
        this.lineEditMarketPrice = this.dialog.findChild('marketPrice_lineEdit');
        this.lineEditCurrentExRate = this.dialog.findChild('currentExchangeRate_lineEdit');
        this.lineEditBankCharges = this.dialog.findChild('bankCharges_lineEdit');
        this.lineEditOtherCharges = this.dialog.findChild('otherCharges_lineEdit');
        this.lineEditAccruedInterests = this.dialog.findChild('accruedInterests_lineEdit');
        this.labelFieldErrors = this.dialog.findChild('fieldError_label');

        // Current position
        this.labelActualQuantityPrev = this.dialog.findChild('actualQuantity_label');
        this.labelCurrentBookValue = this.dialog.findChild('currentBookValue_label');
        this.labelCurrentUnitBookValue = this.dialog.findChild('currentUnitBookValue_label');

        // Result
        this.labelSaleResultPrev = this.dialog.findChild('saleResultPreview_label');
        this.labelExcResultPrev = this.dialog.findChild('exchangeResultPreview_label');
        this.labelTotValSharesPrev = this.dialog.findChild('totalValueOfShares_label');
        this.AvgValSharesPrev = this.dialog.findChild('averageValueOfShares_label');

        // Position after the sale
        this.labelQuantityAfterSale = this.dialog.findChild('quantityAfterSale_label');
        this.labelBookValueAfterSale = this.dialog.findChild('bookValueAfterSale_label');
        this.labelUnitBookValueAfterSale = this.dialog.findChild('unitBookValueAfterSale_label');

        // Others
        this.recordingGroupBox = this.dialog.findChild('recordingGroupBox');
        this.checkBoxRecord = this.dialog.findChild('recordTransactions_checkBox');
        this.labelStatus = this.dialog.findChild('status_label');

        // Buttons
        this.buttonsBox = this.dialog.findChild('buttonsBox');

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

        // Exchange rate fields are only used with multi-currency accounting files.
        this.setMultiCurrencyElementsVisible(this.docInfo.isMultiCurrency);
        this.setStatusText("");
        this.setFieldErrorsText([]);

        // Security data (name, currency, bond fields) and first previews.
        this.updateSecurityElements();
        this.updateDialogData();
    }

    /** Returns the selected security object from the Items table, without showing any message. */
    getSelectedItemObj() {
        let currentItem = this.cmbItems.currentText;
        if (!currentItem)
            return null;
        let itemsData = getItemsTableData(this.banDoc, this.docInfo);
        return itemsData.find(obj => obj.item === currentItem) || null;
    }

    /** Currency of the selected security (base currency if not defined). */
    getSelectedItemCurrency(itemObj) {
        if (itemObj && itemObj.currency)
            return itemObj.currency;
        return this.docInfo.baseCurrency;
    }

    isSelectedItemBond(itemObj) {
        return itemObj && itemObj.type == "2" ? true : false;
    }

    /** Updates the elements that depend on the selected security. */
    updateSecurityElements() {
        let itemObj = this.getSelectedItemObj();
        this.setSecurityTypeLabel(itemObj);
        this.setAccruedInterestsElementsEnabled(itemObj);
        this.setCurrencyLabels(this.getSelectedItemCurrency(itemObj));
    }

    setMultiCurrencyElementsVisible(visible) {
        this.dialog.findChild('currentExchangeRate_label').visible = visible;
        this.lineEditCurrentExRate.visible = visible;
        this.dialog.findChild('exchangeResultPreviewTitle_label').visible = visible;
        this.labelExcResultPrev.visible = visible;
    }

    /** Shows the currency in the labels of the amounts (entered and shown in the position). */
    setCurrencyLabels(currency) {
        let suffix = currency ? " (" + currency + ")" : "";
        this.dialog.findChild('bookValueRowTitle_label').setText(qsTr("Book value") + suffix);
        this.dialog.findChild('unitBookValueRowTitle_label').setText(qsTr("Book value per unit") + suffix);
        this.dialog.findChild('bookValueAfterSaleTitle_label').setText(qsTr("Book value") + suffix);
        this.dialog.findChild('unitBookValueAfterSaleTitle_label').setText(qsTr("Book value per unit") + suffix);
        this.dialog.findChild('marketPrice_label').setText(qsTr("Sale price per unit") + suffix);
        this.dialog.findChild('bankCharges_label').setText(qsTr("Bank charges") + suffix);
        this.dialog.findChild('otherCharges_label').setText(qsTr("Other charges") + suffix);
        this.dialog.findChild('accruedInterests_label').setText(qsTr("Accrued interests") + suffix);
    }

    /** Shows a message under the previews (empty text hides it). */
    setStatusText(text) {
        this.labelStatus.setText(text);
        this.labelStatus.visible = text ? true : false;
    }

    /** Shows the list of the field errors under the fields (empty list hides it). */
    setFieldErrorsText(errors) {
        this.labelFieldErrors.setText(errors.map(error => "• " + error).join("\n"));
        this.labelFieldErrors.visible = errors.length > 0;
    }

    /** True if the text is empty or a valid number in the locale format. */
    isValidNumberText(text) {
        if (!text || !text.trim())
            return true;
        let internalValue = Banana.Converter.toInternalNumberFormat(text);
        return /^-?\d+(\.\d+)?$/.test(String(internalValue).trim());
    }

    /**
     * Checks the values entered, marks the wrong fields in red and lists the errors under the fields.
     * Only the format is checked: the values are then used as before by the calculations.
     * Charges and interests are only checked when the transactions are recorded.
     * withRecordingData = false: returns true if the sale data (used for the calculation) are valid.
     * withRecordingData = true: returns true if all the fields are valid.
     */
    validateInputFields(withRecordingData) {
        let errors = [];
        let calcErrors = 0;
        let record = this.checkBoxRecord.checked;
        let fields = [
            { 'edit': this.lineEditQt, 'name': qsTr("Quantity sold"), 'required': true, 'notZero': true },
            { 'edit': this.lineEditMarketPrice, 'name': qsTr("Sale price per unit"), 'required': true },
            { 'edit': this.lineEditCurrentExRate, 'name': qsTr("Exchange rate"), 'required': this.docInfo.isMultiCurrency, 'skip': !this.docInfo.isMultiCurrency },
            { 'edit': this.lineEditBankCharges, 'name': qsTr("Bank charges"), 'recording': true, 'skip': !record },
            { 'edit': this.lineEditOtherCharges, 'name': qsTr("Other charges"), 'recording': true, 'skip': !record },
            { 'edit': this.lineEditAccruedInterests, 'name': qsTr("Accrued interests"), 'recording': true, 'skip': !record || !this.lineEditAccruedInterests.visible }
        ];
        fields.forEach(field => {
            let text = field.edit.text.trim();
            let error = "";
            if (!field.skip) {
                if (!this.isValidNumberText(text))
                    error = qsTr("%1: \"%2\" is not a valid number.").replace("%1", field.name).replace("%2", text);
                else if (field.required && !text)
                    error = qsTr("Enter the %1.").replace("%1", field.name.toLowerCase());
                else if (field.notZero && Banana.SDecimal.isZero(Banana.Converter.toInternalNumberFormat(text)))
                    error = qsTr("The %1 cannot be zero.").replace("%1", field.name.toLowerCase());
            }
            field.edit.styleSheet = error ? ERROR_FIELD_STYLE : "";
            if (error) {
                errors.push(error);
                if (!field.recording)
                    calcErrors++;
            }
        });
        this.setFieldErrorsText(errors);
        if (withRecordingData)
            return errors.length === 0;
        return calcErrors === 0;
    }

    /** Empty value used in the numeric operations of the previews. */
    toDecimalValue(value) {
        return (value === undefined || value === null || String(value).trim() === "") ? "0" : String(value);
    }

    /** Amount in the locale format followed by the currency. */
    formatAmount(value, decimals, currency) {
        let text = Banana.Converter.toLocaleNumberFormat(this.toDecimalValue(value), decimals, true);
        if (currency)
            text += " " + currency;
        return text;
    }

    /**
     * Position of the selected security before this sale (the same data used by calculateStockSaleData):
     * quantity, book value (security currency and base currency) and book value per unit.
     * The data are read again only when the selected security changes.
     */
    getCurrentPositionData(itemObj) {
        if (this.positionCache.item === itemObj.item && this.positionCache.data)
            return this.positionCache.data;
        let itemCardData = getItemCardDataList(this.banDoc, this.docInfo, itemObj, this.unitPriceColDecimals, this.currentRowNr);
        if (!itemCardData || isObjectEmpty(itemCardData) || !itemCardData.currentValues)
            return null;
        let currentValues = itemCardData.currentValues;
        let positionData = {};
        positionData.quantity = this.toDecimalValue(currentValues.itemQtBalance);
        positionData.unitBookValue = this.toDecimalValue(currentValues.itemAvgCost);
        positionData.bookValueBase = this.toDecimalValue(currentValues.itemBalanceBase);
        // The book value in the security currency is only available in multi-currency accounting files.
        positionData.bookValue = this.docInfo.isMultiCurrency ? this.toDecimalValue(currentValues.itemBalanceCurr) : positionData.bookValueBase;
        this.positionCache = { 'item': itemObj.item, 'data': positionData };
        return positionData;
    }

    /**
     * Position before the sale: quantity, book value, book value per unit (currency in the row titles).
     * For securities in a foreign currency the book value in base currency is shown in the tooltip.
     */
    showCurrentPosition(positionData, assetCurr) {
        if (!positionData) {
            this.clearCurrentPosition();
            return;
        }
        let baseCurr = this.docInfo.baseCurrency;
        let bookValueTip = "";
        if (this.docInfo.isMultiCurrency && assetCurr !== baseCurr)
            bookValueTip = qsTr("Book value in base currency: %1").replace("%1", this.formatAmount(positionData.bookValueBase, this.amtColumnDecimals, baseCurr));
        this.labelActualQuantityPrev.setText(Banana.Converter.toLocaleNumberFormat(positionData.quantity, this.quantityColDecimals, true));
        this.labelCurrentBookValue.setText(this.formatAmount(positionData.bookValue, this.amtColumnDecimals, ""));
        this.labelCurrentBookValue.toolTip = bookValueTip;
        this.labelCurrentUnitBookValue.setText(this.formatAmount(positionData.unitBookValue, this.unitPriceColDecimals, ""));
    }

    clearCurrentPosition() {
        this.labelActualQuantityPrev.setText(EMPTY_PREVIEW_VALUE);
        this.labelCurrentBookValue.setText(EMPTY_PREVIEW_VALUE);
        this.labelCurrentUnitBookValue.setText(EMPTY_PREVIEW_VALUE);
        this.labelCurrentBookValue.toolTip = "";
    }

    /** Clears the result, e.g. when the values entered are not valid. */
    clearPreview(message) {
        this.labelSaleResultPrev.setText(EMPTY_PREVIEW_VALUE);
        this.labelSaleResultPrev.styleSheet = "";
        this.labelExcResultPrev.setText(EMPTY_PREVIEW_VALUE);
        this.labelExcResultPrev.styleSheet = "";
        this.setResultRowTitles("", "");
        this.labelTotValSharesPrev.setText(EMPTY_PREVIEW_VALUE);
        this.AvgValSharesPrev.setText(EMPTY_PREVIEW_VALUE);
        this.clearPositionAfterSale();
        this.setStatusText(message || "");
    }

    /** Titles of the result rows, with the calculation in brackets (empty: no calculation shown). */
    setResultRowTitles(saleValueCalc, bookValueSoldCalc) {
        this.dialog.findChild('TotalValueOfSharestitle_label').setText(qsTr("Sale value") + (saleValueCalc ? "  (" + saleValueCalc + ")" : ""));
        this.dialog.findChild('AverageValueOfSharesTitle_label').setText("– " + qsTr("Book value sold") + (bookValueSoldCalc ? "  (" + bookValueSoldCalc + ")" : ""));
    }

    /** Adds "+" to positive values: gains are shown in green with "+", losses in red with "-". */
    formatSignedPreviewValue(rawValue, formattedValue, currency) {
        let text = formattedValue;
        if (rawValue && Banana.SDecimal.sign(rawValue) > 0)
            text = "+" + text;
        if (currency)
            text += " " + currency;
        return text;
    }

    /** Style of a gain (green) or a loss (red). */
    getSignedPreviewStyle(rawValue) {
        let style = "font-weight: bold;";
        if (!rawValue)
            return style;
        if (Banana.SDecimal.sign(rawValue) > 0)
            style += " color: " + GAIN_COLOR + ";";
        else if (Banana.SDecimal.sign(rawValue) < 0)
            style += " color: " + LOSS_COLOR + ";";
        return style;
    }

    /** Line under the security: name, type and currency. */
    setSecurityTypeLabel(itemObj) {
        if (!itemObj) {
            this.labelSecurityName.setText(qsTr("Security not found in the Items table"));
            return;
        }
        let type = qsTr("unknown type");
        if (itemObj.type == "1")
            type = qsTr("Stock");
        if (itemObj.type == "2")
            type = qsTr("Bond");
        this.labelSecurityName.setText([itemObj.description || itemObj.item, type, this.getSelectedItemCurrency(itemObj)].join("  ·  "));
    }

    /** Accrued interests are only shown for bonds. */
    setAccruedInterestsElementsEnabled(itemObj) {
        let isBond = this.isSelectedItemBond(itemObj);
        this.lineEditAccruedInterests.enabled = isBond;
        this.lineEditAccruedInterests.visible = isBond;
        this.dialog.findChild('accruedInterests_label').visible = isBond;
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
        const multiplier = this.getExchangeRateMultiplierFromCurrentRow();
        salesData = calculateStockSaleData(this.banDoc, this.docInfo, itemObj, dlgParams, this.currentRowNr, multiplier);
        const recordSalesTransactions = new RecordSalesTransactions(this.banDoc, this.docInfo, salesData,
            dlgParams, itemsData, itemObj, this.currentRowObj, true);
        return recordSalesTransactions.getRecordSalesTransactions();

    }

    getExchangeRateMultiplierFromCurrentRow() {
        if (!this.currentRowObj || !this.docInfo.isMultiCurrency)
            return;
        return this.currentRowObj.value("ExchangeMultiplier");
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


    /**
     * Previews of the dialog.
     * The result is calculated with calculateStockSaleData, exactly as when the transactions are created.
     * The book value per unit after the sale is only shown, it is not used by the transactions.
     * The checks are done without Banana messages, because the previews are updated while the user is typing.
     */
    updateDialogData() {
        let baseCurr = "";
        let assetCurr = "";
        let dlgParams = {};
        let salesData = {};

        let itemObj = this.getSelectedItemObj();
        if (!itemObj) {
            this.setFieldErrorsText([]);
            this.clearCurrentPosition();
            this.clearPreview(qsTr("Select a security of the Items table."));
            return;
        }
        if (!itemObj.account) {
            this.clearCurrentPosition();
            this.clearPreview(qsTr("The security has no asset account in the Items table."));
            return;
        }
        assetCurr = this.getSelectedItemCurrency(itemObj);
        baseCurr = this.docInfo.baseCurrency;

        // Current position: shown also when the values entered are not valid.
        const positionData = this.getCurrentPositionData(itemObj);
        this.showCurrentPosition(positionData, assetCurr);

        // Charges and interests do not change the result: only the sale data are needed.
        if (!this.validateInputFields(false)) {
            this.clearPreview("");
            return;
        }

        dlgParams = this.readDialogParams();
        this.convertDlgParamsToInternalFormat(dlgParams);

        const multiplier = this.getExchangeRateMultiplierFromCurrentRow();
        salesData = calculateStockSaleData(this.banDoc, this.docInfo, itemObj, dlgParams, this.currentRowNr, multiplier);
        if (!salesData || isObjectEmpty(salesData)) {
            this.clearPreview(qsTr("No data found for this security."));
            return;
        }

        // Raw values, used for signs, colors and the book value after the sale before the conversion to the locale format.
        const rawSaleResult = salesData.saleResult;
        const rawExRateResult = salesData.exRateResult;
        const rawSoldBookValue = salesData.avgSharesValue;
        const soldQty = Banana.SDecimal.abs(dlgParams.quantity);
        const qtyAfterSale = Banana.SDecimal.subtract(salesData.currentQt, soldQty);
        const soldQtyText = Banana.Converter.toLocaleNumberFormat(soldQty, this.quantityColDecimals, true);
        const salePriceText = Banana.Converter.toLocaleNumberFormat(dlgParams.marketPrice, this.unitPriceColDecimals, true);

        this.convertSalesDataToLocaleFormat(salesData);

        // Result: the row titles show the calculation with the quantity sold, the sale price and the book value per unit above.
        this.setResultRowTitles(soldQtyText + " × " + salePriceText, soldQtyText + " × " + salesData.avgCost);
        this.labelTotValSharesPrev.setText(salesData.totalSharesvalue + " " + assetCurr);
        this.AvgValSharesPrev.setText(salesData.avgSharesValue + " " + assetCurr);
        this.labelSaleResultPrev.setText(this.formatSignedPreviewValue(rawSaleResult, salesData.saleResult, assetCurr));
        this.labelSaleResultPrev.styleSheet = this.getSignedPreviewStyle(rawSaleResult);
        if (this.docInfo.isMultiCurrency) {
            this.labelExcResultPrev.setText(this.formatSignedPreviewValue(rawExRateResult, salesData.exRateResult, baseCurr));
            this.labelExcResultPrev.styleSheet = this.getSignedPreviewStyle(rawExRateResult);
        }

        // Position after the sale
        this.showPositionAfterSale(positionData, qtyAfterSale, rawSoldBookValue);
    }

    /**
     * Position after the sale (preview only, it is not used by the transactions), with the same data of the
     * position before the sale: quantity left, book value left (current book value - book value sold)
     * and book value per unit (book value left / quantity left, as the average cost of the security card).
     */
    showPositionAfterSale(positionData, qtyAfterSale, soldBookValue) {
        if (Banana.SDecimal.sign(qtyAfterSale) < 0)
            this.setStatusText(qsTr("The quantity sold is greater than the quantity held."));
        else
            this.setStatusText("");

        if (!positionData) {
            this.clearPositionAfterSale();
            return;
        }
        let bookValueAfterSale = Banana.SDecimal.subtract(positionData.bookValue, this.toDecimalValue(soldBookValue));
        let unitBookValueAfterSale = "0";
        if (!Banana.SDecimal.isZero(qtyAfterSale))
            unitBookValueAfterSale = Banana.SDecimal.divide(bookValueAfterSale, qtyAfterSale, { 'decimals': this.unitPriceColDecimals });
        this.labelQuantityAfterSale.setText(Banana.Converter.toLocaleNumberFormat(qtyAfterSale, this.quantityColDecimals, true));
        this.labelBookValueAfterSale.setText(this.formatAmount(bookValueAfterSale, this.amtColumnDecimals, ""));
        this.labelUnitBookValueAfterSale.setText(this.formatAmount(unitBookValueAfterSale, this.unitPriceColDecimals, ""));
    }

    clearPositionAfterSale() {
        this.labelQuantityAfterSale.setText(EMPTY_PREVIEW_VALUE);
        this.labelBookValueAfterSale.setText(EMPTY_PREVIEW_VALUE);
        this.labelUnitBookValueAfterSale.setText(EMPTY_PREVIEW_VALUE);
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
