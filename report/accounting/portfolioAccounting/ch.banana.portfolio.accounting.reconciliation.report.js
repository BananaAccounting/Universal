// Copyright [2026] [Banana.ch SA - Lugano Switzerland]
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
// @pubdate = 2026-03-05
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
        banDoc.addMessage(msg, getErrorMessageReferenceAnchor());
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
        banDoc.addMessage(msg, getErrorMessageReferenceAnchor());
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

function getConciliationTable(report, currentDate, docInfo, accountName) {
    currentDate = Banana.Converter.toInternalDateFormat(currentDate);
    var tableConc = report.addTable('myConcTable');
    let refCurr;
    docInfo.isMultiCurrency ? refCurr = "Security Currency" : refCurr = docInfo.baseCurrency;

    tableConc.setStyleAttributes("width:100%;");
    let caption = tableConc.getCaption().addText(
        "Account Reconciliation Report – " + accountName + ", Data as of: " + Banana.Converter.toLocaleDateFormat(currentDate), "styleTitles");
    caption.excludeFromTest();

    //columns definition 
    tableConc.addColumn("Asset").setStyleAttributes("width:40%");
    tableConc.addColumn("Date").setStyleAttributes("width:17%");
    tableConc.addColumn("Doc").setStyleAttributes("width:17%");
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
    tableRow.addCell("Asset", "styleTablesHeaderText");
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
        spanObj.allTable = 14;
        spanObj.afterTotals = 4;
        spanObj.recSummaryTitle = 13;
    } else {
        spanObj.allTable = 11;
        spanObj.afterTotals = 3;
        spanObj.recSummaryTitle = 10;
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
    let rowColorIndex = 0; //to know whether a line is odd or even.
    let styleNormalAmount = "styleNormalAmount";
    let isMulti = docInfo.isMultiCurrency;
    let pageCounter = 0;

    //Print the data.
    for (var a in concData) {
        const accountName = concData[a].account;
        if (pageCounter > 0) {
            // Add a page for each account reconciliation
            report.addPageBreak();
        }
        var tabConc = getConciliationTable(report, currentDate, docInfo, accountName);
        var items = concData[a].items;
        for (var i in items) {
            let itemData = items[i];
            let itemTrData = itemData.transactionsData;
            let itemOpeningData = itemData.openingData;
            var tableRow = tabConc.addRow("styleTableRows");
            tableRow.addCell(itemData.itemId + " - " + itemData.description, '', spanObj.allTable);
            //Add the opening data (if present)
            if (isMulti && itemOpeningData && itemOpeningData.amountCurr) {
                let tableOpeningRow = tabConc.addRow("styleOddRows");
                tableOpeningRow.addCell("", "", 1);
                addItemOpeningTableRowMultiCurrency(tableOpeningRow, itemOpeningData, decimals, styleNormalAmount);
            } else if (!isMulti && itemOpeningData && itemOpeningData.amount) {
                let tableOpeningRow = tabConc.addRow("styleOddRows");
                tableOpeningRow.addCell("", "", 1);
                addItemOpeningTableRow(tableOpeningRow, itemOpeningData, decimals, styleNormalAmount)
            }
            // Add the items movements.
            for (var t in itemTrData) {
                const isEven = checkIfNumberIsEven(rowColorIndex);
                const rowStyle = isEven ? "styleEvenRows" : "styleOddRows";
                var tableRow = tabConc.addRow(rowStyle);
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
            tableRow.addCell("", "");
            if (isMulti) {
                addItemTotalTableRowMultiCurrency(tableRow, itemData, decimals, styleTotalAmount, currentDate, descrText);
            } else {
                addItemTotalTableRow(tableRow, itemData, decimals, styleTotalAmount, currentDate, descrText);
            }

            var tableRow = tabConc.addRow("styleTableRows");
            tableRow.addCell("", "", spanObj.allTable);
        }

        // Add Reconciliation Summary section

        addSectionTitleRow(tabConc, spanObj.recSummaryTitle)
        if (isMulti) {
            addColumnsTitlesRowMultiCurrency(tabConc, concData[a], docInfo.baseCurrency);
            addAccountOpeningBalancesRowMultiCurrency(tabConc, concData[a]);
            addSecuritiesOpeningBalancesRowMultiCurrency(tabConc, concData[a]);
            addDifferencesOpeningBalancesRowMultiCurrency(tabConc, concData[a]);
            addEmptyRow(tabConc, spanObj.allTable);
            addSecuritiesMovementsRowMultiCurrency(tabConc, concData[a]);
            addEmptyRow(tabConc, spanObj.allTable);
            addAccountCurrentBalancesRowMultiCurrency(tabConc, concData[a]);
            addSecuritiesCurrentBalancesRowMultiCurrency(tabConc, concData[a]);
            addDifferencesCurrentBalancesRowMultiCurrency(tabConc, concData[a]);
        } else {
            addColumnsTitlesRow(tabConc, docInfo.baseCurrency);
            addAccountOpeningBalancesRow(tabConc, concData[a]);
            addSecuritiesOpeningBalancesRow(tabConc, concData[a]);
            addDifferencesOpeningBalancesRow(tabConc, concData[a]);
            addEmptyRow(tabConc, spanObj.allTable);
            addSecuritiesMovementsRow(tabConc, concData[a]);
            addEmptyRow(tabConc, spanObj.allTable);
            addAccountCurrentBalancesRow(tabConc, concData[a]);
            addSecuritiesCurrentBalancesRow(tabConc, concData[a]);
            addDifferencesCurrentBalancesRow(tabConc, concData[a]);
        }

        pageCounter++;
    }

    return report;

}

function addDifferencesCurrentBalancesRow(tabConc, accData) {
    let tableRow = tabConc.addRow("styleTableRows");
    const diffBase = accData.currentBalancesBase.currentBalancesDifferences;
    tableRow.addCell("Current difference (should be zero)", "styleDescrTotals");
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(diffBase, 2, true), getDifferenceAmountStyle(diffBase));
    tableRow.addCell("", "", 9);
}

function addDifferencesCurrentBalancesRowMultiCurrency(tabConc, accData) {
    let tableRow = tabConc.addRow("styleTableRows");
    const diffCurr = accData.currentBalancesCurrency.currentBalancesDifferences;
    const diffBase = accData.currentBalancesBase.currentBalancesDifferences;
    tableRow.addCell("Current difference (should be zero)", "styleDescrTotals");
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(diffCurr, 2, true), getDifferenceAmountStyle(diffCurr));
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(diffBase, 2, true), getDifferenceAmountStyle(diffBase));
    tableRow.addCell("", "", 11);
}

function addSecuritiesCurrentBalancesRow(tabConc, accData) {
    let tableRow = tabConc.addRow("styleTableRows");
    tableRow.addCell("Actual Balance (Securities)", "styleDescrTotals");
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(accData.currentBalancesBase.securitiesCurrentBalance, 2, true), 'styleTotalAmount');
    tableRow.addCell("", "", 9);
}

function addSecuritiesCurrentBalancesRowMultiCurrency(tabConc, accData) {
    let tableRow = tabConc.addRow("styleTableRows");
    tableRow.addCell("Actual Balance (Securities)", "styleDescrTotals");
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(accData.currentBalancesCurrency.securitiesCurrentBalance, 2, true), 'styleTotalAmount');
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(accData.currentBalancesBase.securitiesCurrentBalance, 2, true), 'styleTotalAmount');
    tableRow.addCell("", "", 11);
}

function addAccountCurrentBalancesRow(tabConc, accData) {
    let tableRow = tabConc.addRow("styleTableRows");
    tableRow.addCell("Expected Current Balance " + accData.account, "styleDescrTotals");
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(accData.currentBalancesBase.accountCurrentBalance, 2, true), 'styleTotalAmount');
    tableRow.addCell("", "", 9);
}

function addAccountCurrentBalancesRowMultiCurrency(tabConc, accData) {
    let tableRow = tabConc.addRow("styleTableRows");
    tableRow.addCell("Expected Current Balance " + accData.account, "styleDescrTotals");
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(accData.currentBalancesCurrency.accountCurrentBalance, 2, true), 'styleTotalAmount');
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(accData.currentBalancesBase.accountCurrentBalance, 2, true), 'styleTotalAmount');
    tableRow.addCell("", "", 11);
}

function addAccountOpeningBalancesRow(tabConc, accData) {
    let tableRow = tabConc.addRow("styleTableRows");
    tableRow.addCell("Opening Balance " + accData.account, "styleDescrTotals");
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(accData.openingBalancesBase.accountOpeningBalance, 2, true), 'styleTotalAmount');
    tableRow.addCell("", "", 9);
}

function addAccountOpeningBalancesRowMultiCurrency(tabConc, accData) {
    let tableRow = tabConc.addRow("styleTableRows");
    tableRow.addCell("Opening Balance " + accData.account, "styleDescrTotals");
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(accData.openingBalancesCurrency.accountOpeningBalance, 2, true), 'styleTotalAmount');
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(accData.openingBalancesBase.accountOpeningBalance, 2, true), 'styleTotalAmount');
    tableRow.addCell("", "", 11);
}

function addSecuritiesOpeningBalancesRow(tabConc, accData) {
    let tableRow = tabConc.addRow("styleTableRows");
    tableRow.addCell("Opening Balance (Securities)", "styleDescrTotals");
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(accData.openingBalancesBase.securitiesOpeningBalance, 2, true), 'styleTotalAmount');
    tableRow.addCell("", "", 9);
}

function addSecuritiesOpeningBalancesRowMultiCurrency(tabConc, accData) {
    let tableRow = tabConc.addRow("styleTableRows");
    tableRow.addCell("Opening Balance (Securities)", "styleDescrTotals");
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(accData.openingBalancesCurrency.securitiesOpeningBalance, 2, true), 'styleTotalAmount');
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(accData.openingBalancesBase.securitiesOpeningBalance, 2, true), 'styleTotalAmount');
    tableRow.addCell("", "", 11);
}

function addDifferencesOpeningBalancesRow(tabConc, accData) {
    let tableRow = tabConc.addRow("styleTableRows");
    const diffBase = accData.openingBalancesBase.openingBalancesDifferences;
    tableRow.addCell("Opening difference (should be zero)", "styleDescrTotals");
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(diffBase, 2, true), getDifferenceAmountStyle(diffBase));
    tableRow.addCell("", "", 9);
}

function addDifferencesOpeningBalancesRowMultiCurrency(tabConc, accData) {
    let tableRow = tabConc.addRow("styleTableRows");
    const diffCurr = accData.openingBalancesCurrency.openingBalancesDifferences;
    const diffBase = accData.openingBalancesBase.openingBalancesDifferences;
    tableRow.addCell("Opening difference (should be zero)", "styleDescrTotals");
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(diffCurr, 2, true), getDifferenceAmountStyle(diffCurr));
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(diffBase, 2, true), getDifferenceAmountStyle(diffBase));
    tableRow.addCell("", "", 11);
}

function addSecuritiesMovementsRow(tabConc, accData) {
    let tableRow = tabConc.addRow("styleTableRows");
    tableRow.addCell("Total Securities movements", "styleDescrTotals");
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(accData.securitiesMovementsBase, 2, true), 'styleTotalAmount');
    tableRow.addCell("", "", 9);
}

function addSecuritiesMovementsRowMultiCurrency(tabConc, accData) {
    let tableRow = tabConc.addRow("styleTableRows");
    tableRow.addCell("Total Securities movements", "styleDescrTotals");
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(accData.securitiesMovementsCurrency, 2, true), 'styleTotalAmount');
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(accData.securitiesMovementsBase, 2, true), 'styleTotalAmount');
    tableRow.addCell("", "", 11);
}

function addColumnsTitlesRowMultiCurrency(tabConc, accData, baseCurrency) {
    let tableRow = tabConc.addRow("styleTableRows");
    tableRow.addCell("", "", 1);
    tableRow.addCell("Account Currency " + "(" + accData.currency + ")", "styleTableReconciliationSummaryColumns");
    tableRow.addCell("Base Currency " + "(" + baseCurrency + ")", "styleTableReconciliationSummaryColumns");
    tableRow.addCell("", "", 11);
}

function addColumnsTitlesRow(tabConc, baseCurrency) {
    let tableRow = tabConc.addRow("styleTableRows");
    tableRow.addCell("", "", 1);
    tableRow.addCell("Account Currency " + "(" + baseCurrency + ")", "styleTableReconciliationSummaryColumns");
    tableRow.addCell("", "", 9);
}

function addSectionTitleRow(tabConc, span) {
    let tableRow = tabConc.addRow("styleTableReconciliationSummaryTitle");
    tableRow.addCell("Reconciliation Summary", "");
    tableRow.addCell("", "", span);
}

function addEmptyRow(tabConc, span) {
    let tableRow = tabConc.addRow("styleTableRows");
    tableRow.addCell("", "", span);
}

function addItemTotalTableRowMultiCurrency(tableRow, itemCardData, decimals, styleTotalAmount, currentDate) {
    let cellDateItemBal = tableRow.addCell(Banana.Converter.toLocaleDateFormat(currentDate), '');
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
    let cellDateItemBal = tableRow.addCell(Banana.Converter.toLocaleDateFormat(currentDate), '');
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

    if (itemsData.length < 1) {
        let msg = getErrorMessage_MissingElements("NO_ASSETS_FOUND", "");
        banDoc.addMessage(msg, getErrorMessageReferenceAnchor());
        return [];
    }

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
        accData.currency = getAccountCurrency(account, banDoc);

        //get the items data.
        itemsDataList = getItemsDataList(banDoc, docInfo, account);
        accData.items = itemsDataList;

        // Get items total initial balances
        const itemsTotalInitialBalance = getItemsTotalInitialBalance(itemsDataList);
        // Set initial balances data
        setInitalBalancesData(accData, accBalance, itemsTotalInitialBalance);
        // Get items total current balance
        const itemsTotalCurrentBalance = getItemsTotalCurrentBalance(itemsDataList);
        // Set current balances data
        setCurrentBalancesData(accData, accBalance, itemsTotalCurrentBalance);

        //Get total movements from the securities
        let itemsTotalBalance = getItemsMovementsTotal(itemsDataList);
        accData.securitiesMovementsBase = itemsTotalBalance.movTotalBase;
        accData.securitiesMovementsCurrency = itemsTotalBalance.movTotalCurrency;

        accDataList.push(accData);
    }

    return accDataList;
}

function setCurrentBalancesData(accDataObj, accBalance, itemsTotalCurrentBalance) {

    // Base balance
    accDataObj.currentBalancesBase = {};
    accDataObj.currentBalancesBase.accountCurrentBalance = accBalance.balance;
    accDataObj.currentBalancesBase.securitiesCurrentBalance = itemsTotalCurrentBalance.totalBase;
    accDataObj.currentBalancesBase.currentBalancesDifferences = Banana.SDecimal.abs(
        Banana.SDecimal.subtract(accBalance.balance, itemsTotalCurrentBalance.totalBase));

    // Currency balance
    accDataObj.currentBalancesCurrency = {};
    accDataObj.currentBalancesCurrency.accountCurrentBalance = accBalance.balanceCurrency;
    accDataObj.currentBalancesCurrency.securitiesCurrentBalance = itemsTotalCurrentBalance.totalSecurity;
    accDataObj.currentBalancesCurrency.currentBalancesDifferences = Banana.SDecimal.abs(
        Banana.SDecimal.subtract(accBalance.balanceCurrency, itemsTotalCurrentBalance.totalSecurity));
}

function setInitalBalancesData(accDataObj, accBalance, itemsTotalInitialBalance) {

    // Base balance
    accDataObj.openingBalancesBase = {};
    accDataObj.openingBalancesBase.accountOpeningBalance = accBalance.opening;
    accDataObj.openingBalancesBase.securitiesOpeningBalance = itemsTotalInitialBalance.totalBase;
    accDataObj.openingBalancesBase.openingBalancesDifferences = Banana.SDecimal.abs(
        Banana.SDecimal.subtract(accBalance.opening, itemsTotalInitialBalance.totalBase));

    // Currency balance
    accDataObj.openingBalancesCurrency = {};
    accDataObj.openingBalancesCurrency.accountOpeningBalance = accBalance.openingCurrency;
    accDataObj.openingBalancesCurrency.securitiesOpeningBalance = itemsTotalInitialBalance.totalSecurity;
    accDataObj.openingBalancesCurrency.openingBalancesDifferences = Banana.SDecimal.abs(
        Banana.SDecimal.subtract(accBalance.openingCurrency, itemsTotalInitialBalance.totalSecurity));
}

function getItemsTotalCurrentBalance(itemsDataList) {
    let totalBase;
    let totalSecurity;

    if (!Array.isArray(itemsDataList))
        return { totalBase: "0", totalSecurity: "0" };

    itemsDataList.forEach(item => {

        if (!item || !item.currentValues)
            return;

        totalBase = Banana.SDecimal.add(totalBase, item.currentValues.itemBalanceBase);
        totalSecurity = Banana.SDecimal.add(totalSecurity, item.currentValues.itemBalanceCurr);
    });

    return {
        totalBase,
        totalSecurity
    };
}

function getItemsTotalInitialBalance(itemsDataList) {
    let totalBase;
    let totalSecurity;

    if (!Array.isArray(itemsDataList))
        return { totalBase: "0", totalSecurity: "0" };

    itemsDataList.forEach(item => {

        if (!item || !item.openingData)
            return;

        totalBase = Banana.SDecimal.add(totalBase, item.openingData.amount);
        totalSecurity = Banana.SDecimal.add(totalSecurity, item.openingData.amountCurr);
    });

    return {
        totalBase,
        totalSecurity
    };
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