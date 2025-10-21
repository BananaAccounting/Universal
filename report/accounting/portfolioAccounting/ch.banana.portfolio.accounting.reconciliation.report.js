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
// @id = ch.banana.portfolio.accounting.riconciliation.report.js
// @description = 6. Reconciliation report
// @task = app.command
// @doctype = 100.*
// @publisher = Banana.ch SA
// @pubdate = 2025-08-25
// @inputdatasource = none
// @timeout = -1
// @includejs = ch.banana.portfolio.accounting.calculation.methods.js

/**
 * This extension generates a report that allows you to see the movements of bonds and stocks held in the accounts and details
 * acronym bas= bonds and stocks
 */

function exec() {

    let banDoc = Banana.document;

    if (!verifyBananaVersion(banDoc))
        return "@Cancel";

    if (!tableExists(banDoc, "Items")) {
        let msg = getErrorMessage_MissingElements("NO_ITEMS_TABLE", "");
        banDoc.addMessage(msg, "NO_ITEMS_TABLE");
        return "@Cancel";
    }

    let docInfo = "";
    const dlgLabel = "Available accounts (select one or more accounts)";
    const dlgTitle = "Select accounts to show";
    const scriptId = "ch.banana.portfolio.accounting.riconciliation.report.js";
    let accountsList = [];
    let reconciliationData = {};
    reconciliationData.date = new Date();
    let accountsDataList = [];

    accountsList = getSelectedAccounts(banDoc, scriptId, dlgTitle, dlgLabel);
    if (!accountsList || accountsList.length < 0)
        return;

    docInfo = getDocumentInfo(banDoc);

    //Get Secrurity account data.
    accountsDataList = getAccountsDataList(banDoc, docInfo, accountsList);

    if (!accountsDataList.length)
        return "";

    //Insert the data into the reconciliation obj.
    reconciliationData.data = accountsDataList;

    let report = printReport(banDoc, reconciliationData, docInfo);
    getReportHeader(report, docInfo);
    let stylesheet = getReportStyle();
    Banana.Report.preview(report, stylesheet);

}

function getSelectedAccounts(banDoc, scriptId, dlgTitle, dlgLabel) {
    let accountsListAvailable = [];
    let accountsListSaved = [];
    let accountsListSelected = [];
    let savedAccounts = banDoc.getScriptSettings(scriptId);
    let savedAccList = savedAccounts.split(";");
    if (savedAccList && savedAccList.length >= 1) {
        accountsListSaved = savedAccList;
    }
    let invAccounts = getAssetAccountsFormatted(banDoc);
    if (!invAccounts || invAccounts.length < 0) {
        let msg = getErrorMessage_MissingElements("NO_ASSET_ACCOUNTS_FOUND");
        banDoc.addMessage(msg, "NO_ASSET_ACCOUNTS_FOUND");
        return accountsListSelected;
    }

    let invAccountsList = invAccounts.split(";");
    accountsListAvailable = invAccountsList;
    accountsListSelected = Banana.Ui.getItems(dlgTitle, dlgLabel, accountsListAvailable, accountsListSaved);
    if (accountsListSelected && accountsListSelected.length > 0) {
        let valuesToString = accountsListSelected.join(";");
        banDoc.setScriptSettings(scriptId, valuesToString);
    }
    return accountsListSelected;
}

function getConciliationTable(report, currentDate, docInfo) {
    currentDate = Banana.Converter.toInternalDateFormat(currentDate);
    var tableConc = report.addTable('myConcTable');
    let refCurr;
    docInfo.isMultiCurrency ? refCurr = "Security Currency" : refCurr = docInfo.baseCurrency;

    tableConc.setStyleAttributes("width:100%;");
    let caption = tableConc.getCaption().addText(qsTr("Securities Reconciliation Report, Data as of: " + Banana.Converter.toLocaleDateFormat(currentDate)), "styleTitles");
    caption.excludeFromTest();

    //columns definition 
    tableConc.addColumn("Account").setStyleAttributes("width:15%");
    tableConc.addColumn("Security").setStyleAttributes("width:15%");
    tableConc.addColumn("Date").setStyleAttributes("width:10%");
    tableConc.addColumn("Doc").setStyleAttributes("width:10%");
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
    tableRow.addCell("Account", "styleTablesHeaderText");
    tableRow.addCell("Security", "styleTablesHeaderText");
    tableRow.addCell("Date", "styleTablesHeaderText");
    tableRow.addCell("Doc", "styleTablesHeaderText");
    tableRow.addCell("Description", "styleTablesHeaderText");
    tableRow.addCell("Quantity ", "styleTablesHeaderText");
    tableRow.addCell("Unit Price ", "styleTablesHeaderText");
    tableRow.addCell("Debit\n" + refCurr, "styleTablesHeaderText");
    tableRow.addCell("Credit\n" + refCurr, "styleTablesHeaderText");
    tableRow.addCell("Balance\n" + refCurr, "styleTablesHeaderText");
    tableRow.addCell("Quantity balance", "styleTablesHeaderText");
    tableRow.addCell("Book value \n per unit\n", "styleTablesHeaderText");
    if (docInfo.isMultiCurrency) {
        tableRow.addCell("Debit " + docInfo.baseCurrency, "styleTablesHeaderText");
        tableRow.addCell("Credit " + docInfo.baseCurrency, "styleTablesHeaderText");
        tableRow.addCell("Balance " + docInfo.baseCurrency, "styleTablesHeaderText");
    }

    return tableConc;
}

/**
 * sets and returns an object containing the properties with the values for the span being printed. 
 * The values change depending on the type of accounts:
 * -Double-entry
 * -Double-entry with Multi-currency
 * Basically with a multy currency accounting we have three more columns.
 */
function setSpanObject(docInfo) {
    var spanObj = {};
    if (docInfo.isMultiCurrency) {
        spanObj.allTable = 15;
        spanObj.itemId = 14;
        spanObj.afterTotals = 5;
    } else {
        spanObj.allTable = 12;
        spanObj.itemId = 11;
        spanObj.afterTotals = 4;
    }

    return spanObj;
}

/**
 * Print the report.
 * @param {*} reconciliationData the data.
 */
function printReport(banDoc, reconciliationData, docInfo) {

    //create the report
    var report = Banana.Report.newReport("Reconciliation Report");
    var currentDate = new Date();
    let spanObj = setSpanObject(docInfo);
    let unitPriceColumn = banDoc.table("Transactions").column("UnitPrice", "Base");
    let decimals = unitPriceColumn.decimal;
    if (decimals > 11)
        decimals = 11; // Over 11 decimals shown, the amounts overlap each others.
    //add Reconciliation table
    var concData = reconciliationData.data;
    var tabConc = getConciliationTable(report, currentDate, docInfo);
    let rowColorIndex = 0; //to know whether a line is odd or even.
    let styleNormalAmount = "styleNormalAmount";
    let isMulti = docInfo.isMultiCurrency;

    //Print the data.
    for (var a in concData) {
        var tableRow = tabConc.addRow("styleTableRows");
        tableRow.addCell(concData[a].account, 'styleDescrTotals', spanObj.allTable);
        var items = concData[a].items;
        for (var i in items) {
            let itemData = items[i];
            let itemTrData = itemData.transactionsData;
            let itemOpeningData = itemData.openingData;
            var tableRow = tabConc.addRow("styleTableRows");
            tableRow.addCell("", "");
            tableRow.addCell(itemData.itemId, '', spanObj.itemId);
            //Add the opening data (if present)
            if (isMulti && itemOpeningData && itemOpeningData.amountCurr) {
                let tableOpeningRow = tabConc.addRow("styleOddRows");
                tableOpeningRow.addCell("", "", 2);
                addItemOpeningTableRowMultiCurrency(tableOpeningRow, itemOpeningData, decimals, styleNormalAmount);
            } else if (!isMulti && itemOpeningData && itemOpeningData.amount) {
                let tableOpeningRow = tabConc.addRow("styleOddRows");
                tableOpeningRow.addCell("", "", 2);
                addItemOpeningTableRow(tableOpeningRow, itemOpeningData, decimals, styleNormalAmount)
            }
            // Add the items movements.
            for (var t in itemTrData) {
                const isEven = checkIfNumberIsEven(rowColorIndex);
                const rowStyle = isEven ? "styleEvenRows" : "styleOddRows";
                var tableRow = tabConc.addRow(rowStyle);
                tableRow.addCell("", "");
                tableRow.addCell("", "");

                if (isMulti) {
                    addItemTransactionTableRowMultiCurrency(tableRow, itemTrData[t], decimals, styleNormalAmount);
                } else {
                    addItemTransactionTableRow(tableRow, itemTrData[t], decimals, styleNormalAmount);
                }

                rowColorIndex++;
            }

            //add the item balance.
            let styleTotalAmount = "styleTotalAmount";
            var tableRow = tabConc.addRow("styleTableRows");
            let descrText = "Balance " + itemData.itemId;
            tableRow.addCell("", "", 2);
            if (isMulti) {
                addItemTotalTableRowMultiCurrency(tableRow, itemData, decimals, styleTotalAmount, currentDate, descrText);
            } else {
                addItemTotalTableRow(tableRow, itemData, decimals, styleTotalAmount, currentDate, descrText);
            }

            var tableRow = tabConc.addRow("styleTableRows");
            tableRow.addCell("", "", spanObj.allTable);
        }

        //Add the account balance and the total transactions for the item

        //Opening balance
        let OpBalanceTableRow = tabConc.addRow("styleTableRows");
        OpBalanceTableRow.addCell("", "", 2);
        // Current balance
        var tableRowCurrBalance = tabConc.addRow("styleTableRows");
        tableRowCurrBalance.addCell("", "", 2);
        // Transactions total
        var tableRowTransTotal = tabConc.addRow("styleTableRows");
        tableRowTransTotal.addCell("", "", 2);
        // Differences
        var tableRowDifferences = tabConc.addRow("styleTableRows");
        tableRowDifferences.addCell("", "", 2);

        if (isMulti) {
            addAccountOpeningTableRowMultiCurrency(OpBalanceTableRow, concData[a], currentDate);
            addAccountCurrentBalanceTableRowMultiCurrency(tableRowCurrBalance, concData[a], currentDate);
            addAccountTransTotalTableRowMultiCurrency(tableRowTransTotal, concData[a], currentDate);
            addAccountDfferencesTableRowMultiCurrency(tableRowDifferences, concData[a], currentDate);

        } else {
            addAccountOpeningTableRow(OpBalanceTableRow, concData[a], currentDate);
            addAccountCurrentBalanceTableRow(tableRowCurrBalance, concData[a], currentDate);
            addAccountTransTotalTableRow(tableRowTransTotal, concData[a], currentDate);
            addAccountDifferenceslTableRow(tableRowDifferences, concData[a], currentDate);
        }
    }

    return report;

}

function addItemTotalTableRowMultiCurrency(tableRow, itemCardData, decimals, styleTotalAmount, currentDate) {
    let cellDateItemBal = tableRow.addCell(Banana.Converter.toLocaleDateFormat(currentDate), 'styleAlignCenter');
    cellDateItemBal.excludeFromTest();
    tableRow.addCell("", "", 1);
    tableRow.addCell("Balance " + itemCardData.itemId, "styleDescrTotals");
    tableRow.addCell("", "", 2);
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itemCardData.totalDebitCurr, 2, true), styleTotalAmount);
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itemCardData.totalCreditCurr, 2, true), styleTotalAmount);
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itemCardData.currentValues.itemBalanceCurr, 2, true), styleTotalAmount);
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itemCardData.currentValues.itemQtBalance, 0, true), styleTotalAmount);
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itemCardData.currentValues.itemAvgCost, decimals, true), styleTotalAmount);
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itemCardData.totalDebitBase, 2, true), styleTotalAmount);
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itemCardData.totalCreditBase, 2, true), styleTotalAmount);
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itemCardData.currentValues.itemBalanceBase, 2, true), styleTotalAmount);
}

function addItemTotalTableRow(tableRow, itemCardData, decimals, styleTotalAmount, currentDate) {
    let cellDateItemBal = tableRow.addCell(Banana.Converter.toLocaleDateFormat(currentDate), 'styleAlignCenter');
    cellDateItemBal.excludeFromTest();
    tableRow.addCell("", "", 1);
    tableRow.addCell("Balance " + itemCardData.itemId, "styleDescrTotals");
    tableRow.addCell("", "", 2);
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itemCardData.totalDebitBase, 2, true), styleTotalAmount);
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itemCardData.totalCreditBase, 2, true), styleTotalAmount);
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itemCardData.currentValues.itemBalanceBase, 2, true), styleTotalAmount);
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itemCardData.currentValues.itemQtBalance, 0, true), styleTotalAmount);
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itemCardData.currentValues.itemAvgCost, decimals, true), styleTotalAmount);
}

function addAccountOpeningTableRow(tableRow, accData, currentDate) {
    let cellDateOpBal = tableRow.addCell(Banana.Converter.toLocaleDateFormat(currentDate), 'styleAlignCenter');
    cellDateOpBal.excludeFromTest();
    tableRow.addCell("", "", 1);
    tableRow.addCell("Opening Balance " + accData.account, "styleDescrTotals", 5);
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(accData.openBalanceBase, 2, true), 'styleTotalAmount');
    tableRow.addCell("", "", 2);
}

function addAccountOpeningTableRowMultiCurrency(tableRow, accData, currentDate) {
    let cellDateOpBal = tableRow.addCell(Banana.Converter.toLocaleDateFormat(currentDate), 'styleAlignCenter');
    cellDateOpBal.excludeFromTest();
    tableRow.addCell("", "", 1);
    tableRow.addCell("Opening Balance " + accData.account, "styleDescrTotals", 5);
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(accData.openBalanceCurr, 2, true), 'styleTotalAmount');
    tableRow.addCell("", "", 4);
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(accData.openBalanceBase, 2, true), 'styleTotalAmount');
}

function addAccountCurrentBalanceTableRow(tableRow, concData, currentDate) {
    let cellDateAccBal = tableRow.addCell(Banana.Converter.toLocaleDateFormat(currentDate), 'styleAlignCenter');
    cellDateAccBal.excludeFromTest();
    tableRow.addCell("", "", 1);
    tableRow.addCell("Current Balance " + concData.account, "styleDescrTotals", 5);
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(concData.currentBalanceBase, 2, true), 'styleTotalAmount');
    tableRow.addCell("", "", 2);
}

function addAccountCurrentBalanceTableRowMultiCurrency(tableRow, concData, currentDate) {
    let cellDateAccBal = tableRow.addCell(Banana.Converter.toLocaleDateFormat(currentDate), 'styleAlignCenter');
    cellDateAccBal.excludeFromTest();
    tableRow.addCell("", "", 1);
    tableRow.addCell("Current Balance " + concData.account, "styleDescrTotals", 5);
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(concData.currentBalanceCurr, 2, true), 'styleTotalAmount');
    tableRow.addCell("", "", 4);
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(concData.currentBalanceBase, 2, true), 'styleTotalAmount');
}

function addAccountTransTotalTableRow(tableRow, concData, currentDate) {
    let cellDateTr = tableRow.addCell(Banana.Converter.toLocaleDateFormat(currentDate), 'styleAlignCenter');
    cellDateTr.excludeFromTest();
    tableRow.addCell("", "", 1);
    tableRow.addCell("Total securities movements", "styleDescrTotals", 5);
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(concData.securityTrAmountBase, 2, true), 'styleTotalAmount');
    tableRow.addCell("", "", 2);
}

function addAccountTransTotalTableRowMultiCurrency(tableRow, concData, currentDate) {
    let cellDateTr = tableRow.addCell(Banana.Converter.toLocaleDateFormat(currentDate), 'styleAlignCenter');
    cellDateTr.excludeFromTest();
    tableRow.addCell("", "", 1);
    tableRow.addCell("Total securities movements", "styleDescrTotals", 5);
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(concData.securityTrAmountCurrency, 2, true), 'styleTotalAmount');
    tableRow.addCell("", "", 4);
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(concData.securityTrAmountBase, 2, true), 'styleTotalAmount');
}

function addAccountDifferenceslTableRow(tableRow, concData, currentDate) {
    var diffStyleBase = getDifferenceAmountStyle(concData.differenceBase);
    let cellDateDiff = tableRow.addCell(Banana.Converter.toLocaleDateFormat(currentDate), 'styleAlignCenter');
    cellDateDiff.excludeFromTest();
    tableRow.addCell("", "", 1);
    tableRow.addCell("Differences", "styleDescrTotals", 5);
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(concData.differenceBase, 2, true), diffStyleBase);
    tableRow.addCell("", "", 2);
}

function addAccountDfferencesTableRowMultiCurrency(tableRow, concData, currentDate) {
    var diffStyleBase = getDifferenceAmountStyle(concData.differenceBase);
    var diffStyleCurr = getDifferenceAmountStyle(concData.differenceCurr);
    let cellDateDiff = tableRow.addCell(Banana.Converter.toLocaleDateFormat(currentDate), 'styleAlignCenter');
    cellDateDiff.excludeFromTest();
    tableRow.addCell("", "", 1);
    tableRow.addCell("Differences", "styleDescrTotals", 5);
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(concData.differenceCurr, 2, true), diffStyleCurr);
    tableRow.addCell("", "", 4);
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(concData.differenceBase, 2, true), diffStyleBase);
}

function getDifferenceAmountStyle(diffAmount) {

    style = "styleTotalAmount";
    if (!Banana.SDecimal.isZero(diffAmount))
        style = "styleTotalAmountNegative";

    return style;
}
/**
 * Creates an array with all the data of all the items that are registered under this account 
 */

function getItemsDataList(banDoc, docInfo, account) {

    let itemsData = getItemsTableData(banDoc, docInfo);
    let itemsDataList = [];//list of item cards
    let unitPriceColumn = banDoc.table("Transactions").column("UnitPrice", "Base");
    let unitPriceColDecimals = unitPriceColumn.decimal; // we want to use the same decimals as defined in the unit price column.

    for (var key in itemsData) {
        //set the item values
        if (itemsData[key].account == account) {
            let itemData = {};
            itemData = getItemCardDataList(banDoc, docInfo, itemsData[key], unitPriceColDecimals);
            // We expand the object by adding the calculated sum of debit and credit columns (just for build the security card).
            itemData.totalDebitBase = getSum(itemData.transactionsData, "debitBase");
            itemData.totalCreditBase = getSum(itemData.transactionsData, "creditBase");
            itemData.totalDebitCurr = getSum(itemData.transactionsData, "debitCurr");
            itemData.totalCreditCurr = getSum(itemData.transactionsData, "creditCurr");
            itemsDataList.push(itemData);
        }
    }
    return itemsDataList;
}

/**
 * For each account creates an object containing the open balance, the current balance and the account nr of the account
 * @param {*} banDoc 
 * @param {*} accountsList the list of the accounts defined by the user.
 */
function getAccountsDataList(banDoc, docInfo, accountsList) {
    var accDataList = [];

    for (var i = 0; i < accountsList.length; i++) {
        let account = accountsList[i];
        var itemsDataList = [];
        var accData = {};
        var accBalance = {};

        accBalance = banDoc.currentBalance(account);

        accData.account = account
        accData.openBalanceBase = accBalance.opening;
        accData.openBalanceCurr = accBalance.openingCurrency;
        accData.currentBalanceBase = accBalance.balance;
        accData.currentBalanceCurr = accBalance.balanceCurrency;
        accData.currency = "";

        // Opening balance - currentBalance = Calculated movements amount.
        accData.balanceDiffBase = Banana.SDecimal.subtract(accBalance.balance, accBalance.opening);
        accData.balanceDiffCurr = Banana.SDecimal.subtract(accBalance.balanceCurrency, accBalance.openingCurrency);

        //get the items data.
        itemsDataList = getItemsDataList(banDoc, docInfo, account);
        accData.items = itemsDataList;

        //Get total movements from the securities
        let itemsTotalBalance = getItemsMovementsTotal(itemsDataList);
        accData.securityTrAmountBase = itemsTotalBalance.movTotalBase;
        accData.securityTrAmountCurrency = itemsTotalBalance.movTotalCurrency;

        //difference between the securities transactions and the account balance (should be 0).
        accData.differenceBase = Banana.SDecimal.subtract(accData.securityTrAmountBase, accData.balanceDiffBase);
        accData.differenceCurr = Banana.SDecimal.subtract(accData.securityTrAmountCurrency, accData.balanceDiffCurr);

        accDataList.push(accData);
    }

    return accDataList;
}

/** Calculate the difference between the opening anc current balance of each items and sum the value found for each item.
 * The returned value is the total movements amount calculated from the items.
*/
function getItemsMovementsTotal(itemsDataList) {
    let itemsTotalMovements = {};
    let itemTotalMov = "0";
    let itemTotalMovCurrency = "0";

    itemsDataList.forEach(item => {
        let itemOpBalance = item.openingData.amount;
        let itemOpBalanceCurr = item.openingData.amountCurr;
        let itemCurrBalance = item.currentValues.itemBalanceBase;
        let itemCurrBalanceCurr = item.currentValues.itemBalanceCurr;

        itemTotalMov = Banana.SDecimal.add(itemTotalMov, Banana.SDecimal.subtract(itemCurrBalance, itemOpBalance));
        itemTotalMovCurrency = Banana.SDecimal.add(itemTotalMovCurrency, Banana.SDecimal.subtract(itemCurrBalanceCurr, itemOpBalanceCurr));
    });

    itemsTotalMovements.movTotalBase = itemTotalMov;
    itemsTotalMovements.movTotalCurrency = itemTotalMovCurrency;

    return itemsTotalMovements;
}