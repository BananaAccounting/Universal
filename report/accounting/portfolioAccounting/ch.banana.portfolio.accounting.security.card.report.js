
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
// @api = 1.0
// @id = ch.banana.portfolio.accounting.security.card.report.js
// @description = 8. Security card report
// @task = app.command
// @doctype = 100.*
// @publisher = Banana.ch SA
// @pubdate = 2021-04-14
// @inputdatasource = none
// @timeout = -1
// @includejs = ch.banana.portfolio.accounting.calculation.methods.js

/**
 * This extension generates a report that allows you to see the movements of bonds and stocks held in the accounts and details
 * acronym bas= bonds and stocks
 */

function exec() {

    let banDoc = Banana.document;
    let selectedItem = ""; //Selected by the user
    let docInfo = "";
    let itemsData = "";
    const dlgTitle = "Security ISIN";
    const dlgLabel = "Enter the ISIN number of the security";
    const scriptId = "ch.banana.portfolio.accounting.security.card.report.js";
    let journal = ""; //hold the journal table
    let journalData = [];
    let accountCard = ""; //hold the account card table
    let accountCardData = "";
    let itemCardData = {};
    itemCardData.date = new Date();

    if (!verifyBananaVersion(banDoc))
        return "@Cancel";

    if (!tableExists(banDoc, "Items")) {
        let msg = getErrorMessage_MissingElements("NO_ITEMS_TABLE", "");
        banDoc.addMessage(msg, "NO_ITEMS_TABLE");
        return "@Cancel";
    }

    selectedItem = getSelectedItem(banDoc, scriptId, dlgTitle, dlgLabel);
    if (!selectedItem)
        return false;

    docInfo = getDocumentInfo(banDoc);
    itemsData = getItemsTableData(banDoc, docInfo);

    const itemObject = itemsData.find(itemsData => itemsData.item === selectedItem)
    if (!itemObject) {
        const ITEM_NOT_FOUND = "ITEM_NOT_FOUND";
        let msg = getErrorMessage_MissingElements(ITEM_NOT_FOUND, selectedItem);
        banDoc.addMessage(msg, ITEM_NOT_FOUND);
        return "";
    }

    //get the journal data and creates an array of objects containing the transactions data
    journal = banDoc.journal(banDoc.ORIGINTYPE_CURRENT, banDoc.ACCOUNTTYPE_NONE);
    journalData = getJournalData(docInfo, journal);

    //get the account card, filter the result by item and return an array of objects containing the transactions data
    accountCard = banDoc.currentCard(itemObject.account);
    accountCardData = getAccountCardDataAdapted(itemObject, accountCard);

    //get the calculated data and the totals
    itemCardData = getItemCardData(banDoc, docInfo, accountCardData, journalData, itemObject);

    let itemDescription = itemObject.description;
    let report = printReport(banDoc, docInfo, itemCardData, itemDescription);
    getReportHeader(report, docInfo);
    let stylesheet = getReportStyle();
    Banana.Report.preview(report, stylesheet);

}

function getSelectedItem(banDoc, scriptId, dlgTitle, dlgLabel) {
    let itemsListAvailable = [];
    let itemSaved = "";
    let itemSelected = "";
    itemSaved = banDoc.getScriptSettings(scriptId);
    let itemSavedIdx = itemsListAvailable = getItemsIds(banDoc);
    if (!itemsListAvailable || itemsListAvailable.length < 1) {
        let msg = getErrorMessage_MissingElements("NO_SECURITIES_FOUND");
        banDoc.addMessage(msg, "NO_SECURITIES_FOUND");
        return itemSelected;
    }

    itemSavedIdx = itemsListAvailable.indexOf(itemSaved);
    if (itemSavedIdx == -1)
        itemSavedIdx = 0;
    itemSelected = Banana.Ui.getItem(dlgTitle, dlgLabel, itemsListAvailable, itemSavedIdx, true);
    if (itemSelected) {
        banDoc.setScriptSettings(scriptId, itemSelected);
    }
    return itemSelected;
}

function getItemCardData(banDoc, docInfo, accountCardData, journalData, itemObject) {
    let itemCardData = {};
    let unitPriceColumn = banDoc.table("Transactions").column("UnitPrice", "Base");
    let unitPriceColDecimals = unitPriceColumn.decimal; // we want to use the same decimals as defined in the unit price column.

    itemCardData.data = getItemCardDataList(docInfo, itemObject, accountCardData, journalData, unitPriceColDecimals);
    // We expand the object by adding the calculated sum of debit and credit columns (just for build the security card).
    itemCardData.totalDebitBase = getSum(accountCardData, "debitBase");
    itemCardData.totalCreditBase = getSum(accountCardData, "creditBase");
    if (docInfo.isMultiCurrency) {
        itemCardData.totalDebitCurr = getSum(accountCardData, "debitCurr");
        itemCardData.totalCreditCurr = getSum(accountCardData, "creditCurr");
    }

    return itemCardData;
}

function getItemCardTable(report, docInfo, currentDate, baseCurr, itemCardData, itemDescription) {
    currentDate = Banana.Converter.toLocaleDateFormat(currentDate);
    var tableConc = report.addTable('mySecCardTable');
    let itemId = itemCardData.data.itemId;
    let itemCurr = itemCardData.data.itemCurrency;
    let refCurr = itemCurr ? itemCurr : baseCurr; //currency dispayed on the header.
    tableConc.setStyleAttributes("width:100%;");
    let caption = tableConc.getCaption().addText(qsTr("Security Card: " + itemId + " " + itemDescription + " " + refCurr + ", Data as of: " + currentDate), "styleTitles");
    caption.excludeFromTest();

    //columns definition 
    tableConc.addColumn("Date").setStyleAttributes("width:10%");
    tableConc.addColumn("Doc").setStyleAttributes("width:5%");
    tableConc.addColumn("Description").setStyleAttributes("width:35%");
    tableConc.addColumn("Quantity").setStyleAttributes("width:15%");
    tableConc.addColumn("Unit Price").setStyleAttributes("width:15%");
    tableConc.addColumn("Debit (Security Currency)").setStyleAttributes("width:15%");
    tableConc.addColumn("Credit (Security Currency)").setStyleAttributes("width:15%");
    tableConc.addColumn("Balance (Security Currency)").setStyleAttributes("width:15%");
    tableConc.addColumn("Quantity Balance").setStyleAttributes("width:15%");
    tableConc.addColumn("Current Average Cost").setStyleAttributes("width:15%");
    if (docInfo.isMultiCurrency) {
        tableConc.addColumn("Debit (Base Currency)").setStyleAttributes("width:15%");
        tableConc.addColumn("Credit (Base Currency)").setStyleAttributes("width:15%");
        tableConc.addColumn("Balance (Base Currency)").setStyleAttributes("width:15%");
    }

    //headers
    var tableHeader = tableConc.getHeader();
    var tableRow = tableHeader.addRow();
    tableRow.addCell("Date", "styleTablesHeaderText");
    tableRow.addCell("Doc", "styleTablesHeaderText");
    tableRow.addCell("Description", "styleTablesHeaderText");
    tableRow.addCell("Quantity ", "styleTablesHeaderText");
    tableRow.addCell("Unit Price\n" + refCurr, "styleTablesHeaderText");
    tableRow.addCell("Debit " + refCurr, "styleTablesHeaderText");
    tableRow.addCell("Credit " + refCurr, "styleTablesHeaderText");
    tableRow.addCell("Balance " + refCurr, "styleTablesHeaderText");
    tableRow.addCell("Quantity\nBalance", "styleTablesHeaderText");
    tableRow.addCell("Book value \n per unit\n" + refCurr, "styleTablesHeaderText");
    if (docInfo.isMultiCurrency) {
        tableRow.addCell("Debit " + baseCurr, "styleTablesHeaderText");
        tableRow.addCell("Credit " + baseCurr, "styleTablesHeaderText");
        tableRow.addCell("Balance " + baseCurr, "styleTablesHeaderText");
    }

    return tableConc;
}

/**
 * Print the report.
 * @param {*} itemCardData the data.
 */
function printReport(banDoc, docInfo, itemCardData, itemDescription) {

    //create the report
    var report = Banana.Report.newReport("Security Card Report");
    var currentDate = new Date();
    let unitPriceColumn = banDoc.table("Transactions").column("UnitPrice", "Base"); // we want to use the same decimals as defined in the unit price column.
    let decimals = unitPriceColumn.decimal;
    if (decimals > 11)
        decimals = 11; // Over 11 decimals shown, the amounts overlap each others.

    //let hexColorBase = "#354793";//in the future we can let the user choose it.
    //let colorsObj=getColors(hexColorBase);
    let rowColorIndex = 0;//to know whether a line is odd or even.
    let isEven = false;
    let rowStyle = "";

    //add item card table
    var tabItemCard = getItemCardTable(report, docInfo, currentDate, docInfo.baseCurrency, itemCardData, itemDescription);

    //Add the opening data (if present)
    if (itemCardData.data.openingData.itemValueBegin || itemCardData.data.openingData.itemValueBeginCurrency) {
        var tableOpeningRow = tabItemCard.addRow("styleOddRows");
        tableOpeningRow.addCell(Banana.Converter.toLocaleDateFormat(itemCardData.data.openingData.itemOpeningDate), '');
        tableOpeningRow.addCell("", "", 1);
        tableOpeningRow.addCell(itemCardData.data.openingData.itemOpeningDescription, '');
        tableOpeningRow.addCell("", "", 4);
        tableOpeningRow.addCell(Banana.Converter.toLocaleNumberFormat(itemCardData.data.openingData.itemValueBegin, 2, true), "styleNormalAmount");
        tableOpeningRow.addCell(Banana.Converter.toLocaleNumberFormat(itemCardData.data.openingData.itemQuantityBegin, 0, true), "styleNormalAmount");
        tableOpeningRow.addCell(Banana.Converter.toLocaleNumberFormat(itemCardData.data.openingData.itemUnitPriceBegin, decimals, false), "styleNormalAmount");
        if (docInfo.isMultiCurrency) {
            tableOpeningRow.addCell("", "", 2);
            tableOpeningRow.addCell(Banana.Converter.toLocaleNumberFormat(itemCardData.data.openingData.itemValueBeginCurrency, 2, true), "styleNormalAmount");
        }
    }

    //Add the movements data.
    for (var key in itemCardData.data.transactionsData) {
        isEven = checkIfNumberisEven(rowColorIndex);
        if (isEven)
            rowStyle = "styleEvenRows";
        else
            rowStyle = "styleOddRows";

        itCardRow = itemCardData.data.transactionsData[key];

        var tableRow = tabItemCard.addRow(rowStyle);
        tableRow.addCell(Banana.Converter.toLocaleDateFormat(itCardRow.date), '');
        tableRow.addCell(itCardRow.doc, 'styleAlignCenter');
        tableRow.addCell(itCardRow.description, '');
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itCardRow.qt, 0, false), "styleNormalAmount");
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itCardRow.unitPrice, decimals, false), "styleNormalAmount");
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itCardRow.debitCurr, 2, false), "styleNormalAmount");
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itCardRow.creditCurr, 2, false), "styleNormalAmount");
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itCardRow.balanceCurr, 2, true), "styleNormalAmount");
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itCardRow.qtBalance, 0, true), "styleNormalAmount");
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itCardRow.accAvgCost, decimals, false), "styleNormalAmount");
        if (docInfo.isMultiCurrency) {
            tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itCardRow.debitBase, 2, false), "styleNormalAmount");
            tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itCardRow.creditBase, 2, false), "styleNormalAmount");
            tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itCardRow.balanceBase, 2, true), "styleNormalAmount");
        }

        rowColorIndex++;
    }

    //Add the totals.
    var tableRow = tabItemCard.addRow("styleTableRows");
    let dateCell = tableRow.addCell(Banana.Converter.toLocaleDateFormat(currentDate), '');
    dateCell.excludeFromTest();
    tableRow.addCell("", "", 1);
    tableRow.addCell("Total transactions", 'styleDescrTotals');
    tableRow.addCell("", "", 2);
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itemCardData.totalDebitCurr, 2, false), "styleTotalAmount");
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itemCardData.totalCreditCurr, 2, false), "styleTotalAmount");
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itemCardData.data.currentValues.itemBalanceCurr, 2, false), "styleTotalAmount");
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itemCardData.data.currentValues.itemQtBalance, 0, false), "styleTotalAmount");
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itemCardData.data.currentValues.itemAvgCost, decimals, false), "styleTotalAmount");
    if (docInfo.isMultiCurrency) {
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itemCardData.totalDebitBase, 2, false), "styleTotalAmount");
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itemCardData.totalCreditBase, 2, false), "styleTotalAmount");
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itemCardData.data.currentValues.itemBalanceBase, 2, false), "styleTotalAmount");
    }


    return report;

}

/*example data structure
var itemCardData={
    "date":"date",
    "currency":"EUR",
    "item":"IT0005239360",
    "data":[
        {
        "TransactionType":"Purchase",
        "date":"",
        "doc":"",
        "Description":"",
        "debit (baseCurr)":"",
        "credit (baseCurr)":"",
        "balance (baseCurr)":"",
        "Curr. acc. exchange rate":"",
        "debit (itemCurr)":"",
        "credit (itemCurr)":"",
        "balance (itemCurr)":"",
        "Quantity Balance":"",
        "Current Average Cost":"",
        },
        {
        "TransactionType":"Purchase",
        "date":"",
        "doc":"",
        "Description":"",
        "debit (baseCurr)":"",
        "credit (baseCurr)":"",
        "balance (baseCurr)":"",
        "Curr. acc. exchange rate":"",
        "debit (itemCurr)":"",
        "credit (itemCurr)":"",
        "balance (itemCurr)":"",
        "Quantity Balance":"",
        "Current Average Cost":"",
        },
    ],
    "TotalDebit (baseCurr)":"",
    "TotalCredit (baseCurr)":"",
    "TotalBalance (baseCurr)":"",
    "TotalDebit (itemCurr)":"",
    "TotalCredit (itemCurr)":"",
    "TotalBalance (itemCurr)":"",
    "TotalQtBalance (itemCurr)":"",//the last value calculated in the column: Quantity Balance
    "TotalCurrAvgCost (itemCurr)":"",//the last value calculated in the column: Current Average Cost

}*/