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


// @includejs = ch.banana.portfolio.accounting.errormessagges.handler.js

/**********************************************************
 * 
 * INVESTMENT ACCOUNTING METHODS
 * 
 *********************************************************/

function initJsonDoc() {
    var jsonDoc = {};
    jsonDoc.document = {};
    jsonDoc.document.dataUnitsfileVersion = "1.0.0";
    jsonDoc.document.dataUnits = [];

    jsonDoc.creator = {};
    var d = new Date();
    var datestring = d.getFullYear() + ("0" + (d.getMonth() + 1)).slice(-2) + ("0" + d.getDate()).slice(-2);
    var timestring = ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
    jsonDoc.creator.executionDate = Banana.Converter.toInternalDateFormat(datestring, "yyyymmdd");
    jsonDoc.creator.name = Banana.script.getParamValue('id');
    jsonDoc.creator.version = "1.0";

    return jsonDoc;
}

function getReportHeader(report, docInfo) {
    var headerParagraph = report.getHeader().addSection();
    headerParagraph.addParagraph(docInfo.company, "styleNormalHeader styleCompanyName");
    headerParagraph.addParagraph("", "");
}

function getInvestmentsAccountsFormatted(banDoc) {
    const accountsList = getItemsAccounts(banDoc);
    if (!accountsList || accountsList.length === 0)
        return "";
    let accountsStringList = accountsList.join(";");
    return accountsStringList;
}

/** Returns the date of the current day in the internal format YYYYmmDD */
function getCurrentDate() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // Mesi da 0 a 11
    const dd = String(today.getDate()).padStart(2, '0'); // Giorno del mese

    return `${yyyy}${mm}${dd}`;
}

function getCurrentRowNumber(banDoc, tableName) {

    let currentRowNr = "";

    if (!banDoc)
        return currentRowNr;

    if (banDoc.cursor.tableName == tableName)
        currentRowNr = banDoc.cursor.rowNr;

    return currentRowNr;
}

function getCurrentLang(banDoc) {
    let lang = 'en';
    if (banDoc)
        lang = banDoc.locale;
    else if (Banana.application.locale)
        lang = Banana.application.locale;
    if (lang.length > 2)
        lang = lang.slice(0, 2);
    return lang;
}

function getCurrentRowObj(banDoc, currentRowNr, tableName) {
    var table = banDoc.table(tableName);
    if (!table)
        return {};
    return table.row(currentRowNr);
}

function getCurrentRowData(banDoc, transList) {
    var currRowNr = banDoc.cursor.rowNr;

    if (transList) {
        for (var i = 0; i < transList.length; i++) {
            if (transList[i].row == currRowNr) {
                currentRowData = {};
                currentRowData.date = transList[i].date;
                currentRowData.description = transList[i].description;
                currentRowData.debit = transList[i].debit;
                currentRowData.credit = transList[i].credit;
                currentRowData.amount = transList[i].amount;
                currentRowData.rate = transList[i].rate;

                return currentRowData;
            }
        }
    }
}

function getDocumentInfo(banDoc) {

    var docInfo = {};

    docInfo.openingDate = banDoc.info("AccountingDataBase", "OpeningDate");

    //define if its a multicurrency accounting
    let multiCurrency = "120";
    let multiCurrency_withVat = "130";
    docInfo.isMultiCurrency = false;
    var fileNumber = banDoc.info("Base", "FileTypeNumber");
    if (fileNumber === multiCurrency || fileNumber === multiCurrency_withVat)
        docInfo.isMultiCurrency = true;

    //get the base currency
    docInfo.baseCurrency = banDoc.info("AccountingDataBase", "BasicCurrency");

    //get the accounts for the recording of exchange rate differences.
    docInfo.accountExchangeRateProfit = banDoc.info("AccountingDataBase", "AccountExchangeRateProfit");
    docInfo.accountExchangeRateLoss = banDoc.info("AccountingDataBase", "AccountExchangeRateLoss");
    docInfo.company = banDoc.info("AccountingDataBase", "Company");
    docInfo.address = banDoc.info("AccountingDataBase", "Address1");
    docInfo.zip = banDoc.info("AccountingDataBase", "Zip");
    docInfo.city = banDoc.info("AccountingDataBase", "City");


    return docInfo;

}

/**
 * Reads the journal data and returns an array of objects with the information we need
 * @param {*} journal journal table
 */
function getJournalData(docInfo, journal) {
    var journalData = [];

    for (var i = 0; i < journal.rowCount; i++) {
        var tRow = journal.row(i);
        var jrRow = {};
        jrRow.date = tRow.value("JDate");
        jrRow.doc = tRow.value("Doc");
        jrRow.trId = tRow.value("JContraAccountGroup");
        jrRow.item = tRow.value("ItemsId");
        jrRow.description = tRow.value("Description");
        jrRow.debitBase = tRow.value("JDebitAmount"); //debit value in base currency
        jrRow.creditBase = tRow.value("JCreditAmount"); //credit value base currency
        jrRow.balanceBase = tRow.value("JBalance"); //credit value base currency
        jrRow.qt = tRow.value("Quantity"); //credit value base currency
        jrRow.unitPrice = tRow.value("UnitPrice"); //credit value base currency
        if (docInfo.isMultiCurrency) {
            jrRow.debitCurr = tRow.value("JDebitAmountCurrency"); //debit value in base currency
            jrRow.creditCurr = tRow.value("JCreditAmountCurrency"); //credit value base currency
            jrRow.balanceCurr = tRow.value("JBalanceAccountCurrency"); //credit value base currency
        }

        journalData.push(jrRow);
    }

    return journalData;

}

function getFormattedSavedParams(banDoc, paramsId) {
    let savedParam = banDoc.getScriptSettings(paramsId);
    let userParam = {};
    if (savedParam.length > 0) {
        userParam = JSON.parse(savedParam);
    }
    return userParam;
}

/**
 * saves the list of ids of all registrations in an array. each id is saved only once
 * @param {*} journalData 
 */
function getTransactionsIdList(journalData) {
    var trIdElements = new Set();
    var trIdList = [];

    for (var key in journalData) {
        trIdElements.add(journalData[key].trId);
    }

    trIdList = Array.from(trIdElements);

    return trIdList;

}

/**
 * 08.01.2025, currently disabled and specific parameters deleted:
 * - currSettlementDate
 * - accruedInterests
 * - dayCountConvention
 * This function calculate the accrued intererest for the bond based on parameters defined by the user.
 * Formula: Accrued interest = ((Rate / Frequency) x Nominal Value) x (Days elapsed / Total days in the coupon period)
 * Rate: Is taken from the items table. The user must insert this value in the new column "CouponRate".
 * Frequency: Is taken from the items table. The user must insert this value in the new column "CouponFrequency".
 * The frequency must be indicate using a number, wich is then mapped in the following way:
 *  -1: Annual frequency.
 *  -2: Six-monthly frequency.
    -3: Quarterly frequency.
    -4: Quarterly frequency.
 *  If a different value is entered, the frequency is set to 1.
 */
function calculateAccruedInterests(dlgParams, itemObj) {

    let accruedInterests = "";
    let nominalValue = "";
    let rate = "";
    let frequency = "";
    let startDate = "";
    let endDate = "";
    let dayCountfractionQuote = "";
    let frequencies = ["1", "2", "3", "4"];

    if (!dlgParams || !itemObj)
        return accruedInterests;

    //Get the parameters from the user
    nominalValue = Banana.SDecimal.abs(dlgParams.quantity);
    rate = itemObj.rate; // in %

    frequency = itemObj.frequency;
    if (!frequencies.includes(frequency))
        frequency = "1";

    startDate = getDateObject(dlgParams.lastCouponDate, "dd.mm.yyyy");
    endDate = getDateObject(dlgParams.currSettlementDate, "dd.mm.yyyy");

    /** Calculate the fraction of the coupon period (Days elapsed/Total days in the coupon period).
     * The calculation i done based on the day count convention selected by the user.*/
    dayCountfractionQuote = dayCountFractionBetweenDates(startDate, endDate, dlgParams.dayCountConvention);
    //Calculate the accrued interest.
    let perc = Banana.SDecimal.divide(Banana.SDecimal.divide(rate, frequency), 100);
    accruedInterests = Banana.SDecimal.multiply(perc, nominalValue);
    accruedInterests = Banana.SDecimal.multiply(accruedInterests, dayCountfractionQuote);
    return accruedInterests;
}

/** Given two dates in format "format", calculates the day between the two first and second date.
 * @param {string} date1 first date, more actual date.
 * @param {string} date2 second date, less actual date.
*/
function dayCountFractionBetweenDates(startDate, endDate, convention) {
    if (startDate > endDate) {
        [startDate, endDate] = [endDate, startDate];
    }

    switch (convention) {
        case "30/360":
            return fraction30_360(startDate, endDate);
        case "Actual/360":
            return fractionActual_360(startDate, endDate);
        case "Actual/365":
            return fractionActual_365(startDate, endDate);
        case "Actual/Actual":
        default:
            return fractionActual_Actual(startDate, endDate);
    }
}

/**
 * 30/360 (US)
 * @param {*} startDate 
 * @param {*} endDate 
 */
function fraction30_360(startDate, endDate) {
    // Extraction of year, month, day
    let y1 = startDate.getFullYear();
    let m1 = startDate.getMonth() + 1; // In JS: 0=January, 1=February, ...
    let d1 = startDate.getDate();

    let y2 = endDate.getFullYear();
    let m2 = endDate.getMonth() + 1;
    let d2 = endDate.getDate();

    // 30/360 US rules (simplyfied):
    //  1) Se d1 è 31 => d1 = 30
    if (d1 === 31) {
        d1 = 30;
    }
    //  2) Se d2 è 31 e d1 era 30 => d2 = 30
    if (d2 === 31 && d1 === 30) {
        d2 = 30;
    }

    // Generic formula:
    // dayCount = 360*(Y2 - Y1) + 30*(M2 - M1) + (D2 - D1)
    const dayCount = 360 * (y2 - y1) + 30 * (m2 - m1) + (d2 - d1);
    return dayCount / 360;
}

/** 
 * Actual/360.
 * @param {*} startDate 
 * @param {*} endDate 
*/
function fractionActual_360(startDate, endDate) {
    const msPerDay = 24 * 60 * 60 * 1000;
    const actualDays = Math.floor((endDate - startDate) / msPerDay);
    return actualDays / 360;
}

/**
 * Actual/365
 * @param {*} startDate 
 * @param {*} endDate 
 * @returns 
 */
function fractionActual_365(startDate, endDate) {
    const msPerDay = 24 * 60 * 60 * 1000;
    const actualDays = Math.floor((endDate - startDate) / msPerDay);
    return actualDays / 365;
}

/**
 * Actual/Actual
 * There are some different versions of Actual/Actual:
 * - Actual/Actual ICMA (International Capital Market Association) (most used in Europe)
 * - Actual/Actual ISDA (International Swaps and Derivatives Association)
 * - Actual/Actual AFB (Association Française des Banques)
 * Currently we use a simplified version of the ICMA convention.
 * @param {*} startDate 
 * @param {*} endDate
 * @returns
 */
function fractionActual_Actual(startDate, endDate) {
    const msPerDay = 24 * 60 * 60 * 1000;
    const actualDays = Math.floor((endDate - startDate) / msPerDay);
    return actualDays / 365;
}


function getDateObject(dateString, format) {
    let dateObj = "";
    let dateFormatted = Banana.Converter.toInternalDateFormat(dateString, format);

    if (dateFormatted)
        dateObj = Banana.Converter.toDate(dateFormatted);

    return dateObj;
}

function calculateStockSaleData(banDoc, docInfo, itemObj, dlgParams, currentRowNr) {

    let saleData = {};
    let journal = "";
    let quantity = "";
    let accExRate = ""; //Accounting exchange rate.
    let currentQt = "";
    let avgCost = "";
    let avgSharesValue = "";
    let totalSharesValue = "";
    let saleResult = "";
    let exRateResult = "";
    let accountCard = "";
    let accountCardData = "";
    let accruedInterests = "";
    let itemAccount = "";
    let itemCardData = [];
    let unitPriceColumn = banDoc.table("Transactions").column("UnitPrice", "Base");
    let unitPriceColDecimals = unitPriceColumn.decimal; // We want to use the same decimals as defined in the unit price column.

    //Get the account of the item
    itemAccount = itemObj.account;
    if (itemAccount === "") {
        const ITEM_WITHOUT_ACCOUNT = "ITEM_WITHOUT_ACCOUNT";
        let msg = getErrorMessage_MissingElements(ITEM_WITHOUT_ACCOUNT, itemObj.item);
        banDoc.addMessage(msg, ITEM_WITHOUT_ACCOUNT);
        return "";
    }
    //Get item card data to find the current average cost
    journal = banDoc.journal(banDoc.ORIGINTYPE_CURRENT, banDoc.ACCOUNTTYPE_NONE);
    journalData = getJournalData(docInfo, journal);
    accountCard = banDoc.currentCard(itemAccount);
    accountCardData = getAccountCardDataAdapted(itemObj, accountCard);
    itemCardData = getItemCardDataList(docInfo, itemObj, accountCardData, journalData, unitPriceColDecimals, currentRowNr);

    if (!itemCardData || isObjectEmpty(itemCardData))
        return saleData;

    currentQt = itemCardData.currentValues.itemQtBalance;
    avgCost = itemCardData.currentValues.itemAvgCost;
    quantity = Banana.SDecimal.abs(dlgParams.quantity);
    accExRate = Banana.SDecimal.divide(itemCardData.currentValues.itemBalanceBase, itemCardData.currentValues.itemBalanceCurr);

    avgSharesValue = getSharesAvgValue(quantity, avgCost);
    totalSharesValue = getSharesTotalValue(quantity, dlgParams.marketPrice);
    saleResult = getSaleResult(avgSharesValue, totalSharesValue);
    exRateResult = getExchangeResult(totalSharesValue, saleResult, dlgParams.currExRate, accExRate);

    // only for bonds
    if (itemObj.type === "B") {
        accruedInterests = dlgParams.accruedInterests; //calculateAccruedInterests(dlgParams, itemObj);
    }

    saleData.currentQt = currentQt;
    saleData.avgCost = avgCost;
    saleData.avgSharesValue = avgSharesValue;
    saleData.totalSharesvalue = totalSharesValue;
    saleData.saleResult = saleResult;
    saleData.exRateResult = exRateResult;
    saleData.accruedInterests = accruedInterests;

    return saleData;

}

function getClosestPreviousObjByRowNr(accountCardData, currentRowNr) {
    // Find the object with `originRow` equal to `currentRowNr`.
    const currentObject = accountCardData.find(obj => obj.originRow === currentRowNr.toString());
    if (!currentObject) {
        /** Could happen if the current selected row is emtpy, or if the user insert manually the data without selecting a row. 
         * In that case we use the last object in the array, if the array has no objects, means there are not movements yet for the item selected. 
         * */
        if (accountCardData.length > 0) {
            const lastObject = accountCardData[accountCardData.length - 1];
            return lastObject;
        } else {
            return "";
        }
    }

    // Finds the object with the immediately preceding `rowNr`.
    const previousObject = accountCardData
        .filter(obj => obj.rowNr < currentObject.rowNr)
        .sort((a, b) => b.rowNr - a.rowNr)[0];

    if (!previousObject) // could happen if the first operation of the year is a sale, in this case we use the opening data.
        return {};

    return previousObject;
}

/**
 * Given an account card, it filters the transactions by item and adds values useful for creating
 * of an account card by returning a new account card adapted to the creation of a
 * item card. (see getItemCardDataList()). We may combine the two methods in the future.
 */
function getAccountCardDataAdapted(itemObj, accountCard) {
    let transactions = [];
    let accBalance = "";
    let accBalanceCurr = "";
    /**
     * When creating the account card, before calculating the balance manually using the debit and credit columns, 
     * we must take into account, if any, the opening balance of the security found in the ‘ValueBegin’ ( or ‘ValueBeginCurrency’) column
     * and use it as a starting point for the balance calculation. New options could be considered in the future, for now it seems 
     * the only way to start from the correct initial balance of the security (and not of the account, which may consist of several securities).
     */
    let itemName = itemObj.item;
    let itemValueBegin = itemObj.valueBegin;
    let itemValueBeginCurrency = itemObj.valueBeginCurrency;

    if (itemValueBegin)
        accBalance = itemValueBegin;
    if (itemValueBeginCurrency)
        accBalanceCurr = itemValueBeginCurrency;

    for (var i = 0; i < accountCard.rowCount; i++) {
        let tRow = accountCard.row(i);
        let trType = tRow.value("JOperationType");
        if (tRow.value("ItemsId") == itemName) {
            let trData = {};
            trData.rowNr = tRow.rowNr;
            trData.originTable = tRow.value("JTableOrigin");
            trData.originRow = tRow.value("JRowOrigin");
            trData.rowType = trType;
            trData.doc = tRow.value("Doc");
            trData.date = tRow.value("Date");
            trData.trId = tRow.value("JContraAccountGroup");
            trData.item = tRow.value("ItemsId");
            trData.description = tRow.value("Description");
            trData.qt = tRow.value("Quantity");
            trData.currency = tRow.value("ExchangeCurrency");
            //trData.balanceBase = tRow.value("JBalance"); //Se il conto è usato per più items, il bilancio deve essere ripreso in altro modo.
            trData.unitPrice = tRow.value("UnitPrice");
            trData.debitBase = tRow.value("JDebitAmount"); //debit value in base currency
            trData.creditBase = tRow.value("JCreditAmount"); //credit value base currency
            /** 
             * Calculate the balances manually, as an account can include more items, 
             * we need to calculate the balance only for the current item.
             * */
            if (trData.debitBase !== "") {
                accBalance = Banana.SDecimal.add(accBalance, trData.debitBase);
            }
            if (trData.creditBase !== "") {
                accBalance = Banana.SDecimal.subtract(accBalance, trData.creditBase);
            }
            trData.balanceBase = accBalance;
            trData.debitCurr = tRow.value("JDebitAmountAccountCurrency");
            trData.creditCurr = tRow.value("JCreditAmountAccountCurrency");
            if (trData.debitCurr !== "") {
                accBalanceCurr = Banana.SDecimal.add(accBalanceCurr, trData.debitCurr);
            }
            if (trData.creditCurr !== "") {
                accBalanceCurr = Banana.SDecimal.subtract(accBalanceCurr, trData.creditCurr);
            }
            trData.balanceCurr = accBalanceCurr;

            transactions.push(trData);
        }
    }
    if (transactions.length > 0)
        return transactions;
    else
        return [];
}

function getAccountCurrency(accountName, banDoc) {
    const accountsData = getAccountsTableData(banDoc);
    let currency = "";

    // Iterate through the array of objects
    for (const obj of accountsData) {
        // Check if the "description" field matches the desired description
        if (obj.account == accountName) {
            // If there's a match, store the currency from the current object
            currency = obj.currency;
            break;
        }
    }
    return currency;
}

function accountIsInForeignCurrency(banDoc, docInfo, account) {
    let currency = getAccountCurrency(account, banDoc);
    if (currency !== docInfo.baseCurrency)
        return true;
    return false;
}

/**
 * Starting from the adapted account card data (see method: getAccountCardDataAdapted), adds:
 * - A new object in the first position of the array that contains the opening data (if found) of the security.
 * Then for each transaction add:
 * - The quantity change (if present)
 * - The unit price (if present)
 * - The balance of the quantity (updated for each movement)
 * - The book value (updated with each movement)
 * At the end add a new object containing the resulting values in the last transaction, these
 * values rapresent the current situation for the quantity balance and the book value.
 * If no transaction is found, the values are directly taken form the opening data.
 * The returned structure looks like this:
{
  "itemId": "CH002775224",
  "openingData": {
    "itemUnitPriceBegin": "5.9998",
    "itemValueBeginCurrency": "1499.95",
    "itemValueBegin": "1499.95",
    "itemExchangeBegin": "",
    "itemQuantityBegin": "250.0000"
  },
  "transactionsData": [
    {
      "rowNr": 3,
      "originTable": "Transactions",
      "originRow": "8",
      "rowType": "3",
      "doc": "2",
      "date": "2025-01-31",
      "trId": "8",
      "item": "CH002775224",
      "description": "Shares BancaStato",
      "qt": "-200.0000",
      "currency": "CHF",
      "unitPrice": "6.0201",
      "debitBase": "",
      "creditBase": "1204.02",
      "balanceBase": "295.93",
      "qtBalance": "50.0000",
      "accAvgCost": "5.9186"
    },
    {
      "rowNr": 4,
      "originTable": "Transactions",
      "originRow": "11",
      "rowType": "3",
      "doc": "2",
      "date": "2025-01-31",
      "trId": "11",
      "item": "CH002775224",
      "description": "Shares BancaStato Result on sale",
      "qt": "",
      "currency": "CHF",
      "unitPrice": "",
      "debitBase": "4.06",
      "creditBase": "",
      "balanceBase": "299.99",
      "qtBalance": "50.0000",
      "accAvgCost": "5.9998"
    }
  ],
  "currentValues": {
    "itemAvgCost": "5.9998",
    "itemQtBalance": "50.0000",
    "itemBalanceBase": "299.99",
    "itemBalanceCurr": "",
    "itemExchangeRate": ""
  }
}
This structure has been designed to allow saving separately the data related to the opening of the security, 
those related to its evolution (transactions), and the current values (the latest transaction( or transaction x if a currentRowNr is defined) resulting data).
 */
function getItemCardDataList(docInfo, itemObj, accountCardData, journalData, unitPriceColDecimals, currentRowNr) {
    let itemCardData = {};
    let openingData = getItemOpeningDataObj(docInfo, itemObj);
    setSoldData(accountCardData, journalData);
    setQuantityBalance(openingData, accountCardData);
    setCurrentAccAvgCost(accountCardData, unitPriceColDecimals);

    itemCardData.itemId = itemObj.item;
    itemCardData.itemCurrency = itemObj.currency;
    itemCardData.openingData = openingData;
    itemCardData.transactionsData = accountCardData;
    itemCardData.currentValues = getItemCurrentValues(openingData, accountCardData, currentRowNr);

    return itemCardData;
}

/**
 * Returns the object containing the current calculated data for the security, which is basically taken from the last transaction present.
 * If currentRowNr is defined and valid, we do not take the last transaction but the one before it.
 * If there are no transactions, we take the data from the opening data.
 */
function getItemCurrentValues(openingData, accountCardData, currentRowNr) {
    let currentValuesObj = {};
    let trObj = {};

    setOpeningValues(currentValuesObj, openingData); // always set with the opening values.

    if (accountCardData.length < 1) {
        return currentValuesObj;
    }

    if (Number.isFinite(currentRowNr)) {
        trObj = getClosestPreviousObjByRowNr(accountCardData, currentRowNr);
        if (!trObj || isObjectEmpty(trObj)) {
            return currentValuesObj;
        }
    } else {
        trObj = accountCardData[accountCardData.length - 1];
    }

    currentValuesObj.itemAvgCost = trObj.accAvgCost;
    currentValuesObj.itemQtBalance = trObj.qtBalance;
    currentValuesObj.itemBalanceBase = trObj.balanceBase;
    currentValuesObj.itemBalanceCurr = trObj.balanceCurr;
    currentValuesObj.itemExchangeRate = "";

    return currentValuesObj;
}

function setOpeningValues(currentValuesObj, openingData) {
    currentValuesObj.itemAvgCost = openingData.itemUnitPriceBegin;
    currentValuesObj.itemQtBalance = openingData.itemQuantityBegin;
    currentValuesObj.itemBalanceBase = openingData.itemValueBegin;
    currentValuesObj.itemBalanceCurr = openingData.itemValueBeginCurrency;
    currentValuesObj.itemExchangeRate = openingData.itemExchangeBegin;
}

/**
 * The opening data of an object can be found in the table ‘Items’ in the columns:
 * - UnitPriceBegin: Opening price of the security.
 * - ValueBeginCurrency: Opening Balance of the security. 
 * - ValueBegin: Opening Balance of the security in the base currency
 * - QuantityBegin: Opening Quantity of the security.
 * - ExchangeBegin: Opening exchange rate.
 * When the user creates a new year and wants to report the data correctly 
 * as described above, he must have the following values in the table ‘Items’ after the adjustment
 * - PriceCurrent: Current price of the security (resulting book value after settlement).
 * - QuantityCurrent: Current quantity of the security (automatically calculated by Banana).
 * - CurrentValue (or CurrencyCurrentValue): Current balance of the security (automatically calculated by Banana if given quantity and price).
 * This data will then serve as the opening data for the new year.
 */
function getItemOpeningDataObj(docInfo, itemObj) {
    let openingDataObj = {};

    openingDataObj.itemOpeningDate = docInfo.openingDate;
    openingDataObj.itemOpeningDescription = "Initial balance";
    openingDataObj.itemUnitPriceBegin = itemObj.unitPriceBegin;
    openingDataObj.itemValueBeginCurrency = itemObj.valueBeginCurrency;
    openingDataObj.itemValueBegin = itemObj.valueBegin;
    openingDataObj.itemExchangeBegin = itemObj.exchangeBeginCurrency;
    openingDataObj.itemQuantityBegin = itemObj.beginQt;

    return openingDataObj;
}

function isObjectEmpty(obj) {
    return Object.keys(obj).length === 0;
}

/**
 * Calculates how the average accounting cost of the security is updated after each movement.
 * The accounting average cost is calculated by doing: Balance (in the item currency)/Quantity balance.
 * Calculates for each line of the card the average accounting purchase price.
 * @param {*} accountCardData 
 * @param {*} balanceCol 
 */
function setCurrentAccAvgCost(accountCardData, unitPriceColDecimals) {

    if (accountCardData.length < 1)
        return accountCardData;

    for (var key in accountCardData) {
        let trId = "";
        trId = accountCardData[key].trId;
        if (trId && trId !== "") {
            if (accountCardData[key].balanceCurr)
                accountCardData[key].accAvgCost = Banana.SDecimal.divide(accountCardData[key].balanceCurr, accountCardData[key].qtBalance, { 'decimals': unitPriceColDecimals });
            else
                accountCardData[key].accAvgCost = Banana.SDecimal.divide(accountCardData[key].balanceBase, accountCardData[key].qtBalance, { 'decimals': unitPriceColDecimals });
        }
    }

    return accountCardData;
}

/**
 * Sum up the amounts.
 * @param {*} itemCardData 
 * @param {*} ref Indicates the name of the property in the object (column) from which the values to be summed are to be taken
 */
function getSum(itemCardData, ref) {
    var sum = "";
    if (ref) {
        for (var key in itemCardData) {
            sum = Banana.SDecimal.add(sum, itemCardData[key][ref]);
        }
    }
    return sum;
}
/**
 * Calculates the balance.
 * @param {*} itemCardData 
 * @param {*} debRef debit data
 * @param {*} credRef credita data
 * @returns 
 */
function getBalance(itemCardData, debRef, credRef) {
    var balance = "";
    if (debRef || credRef) {
        for (var key in itemCardData) {
            //At each iteration, I add the value found in dates to the value on the balance sheet and subtract the value found in credits.
            balance = Banana.SDecimal.add(balance, itemCardData[key][debRef]);
            balance = Banana.SDecimal.subtract(balance, itemCardData[key][credRef]);
        }
    }
    return balance;
}

/**
 * Sets the quantity and the price to the sales records in the accountCard by taking the data from the journal lines
 * If the accountCard line does not have the item, it means that the  
 * represents the sales amount. To this amount I add the quantity that I retrieve from the journal, 
 * I retrieve it by going to the only line that contains a reference to the quantity of the record with the same id.
 * @param {*} accountCardData 
 * @param {*} journalData 
 */
function setSoldData(accountCardData, journalData) {

    if (accountCardData.length < 1)
        return accountCardData;

    for (var key in accountCardData) {
        let trId = "";
        trId = accountCardData[key].trId;
        if (trId && trId !== "") {
            accountCardData[key].qt = getJournalValueFiltered(journalData, trId, "qt",);
            accountCardData[key].unitPrice = getJournalValueFiltered(journalData, trId, "unitPrice");
        }
    }
    return accountCardData
}

/**
 * Calculates for each line of the card the cumulative quantity
 * @param {*} accountCardData 
 * @returns 
 */
function setQuantityBalance(openingData, accountCardData) {

    let quantityBalance = "";

    if (accountCardData.length < 1)
        return accountCardData;

    if (openingData.itemQuantityBegin)
        quantityBalance = openingData.itemQuantityBegin;

    for (var key in accountCardData) {
        let quantity = "";
        quantity = accountCardData[key].qt;
        if (quantity && quantity !== "")
            quantityBalance = Banana.SDecimal.add(quantityBalance, accountCardData[key].qt);

        accountCardData[key].qtBalance = quantityBalance;
    }
    return accountCardData;
}

function getJournalValueFiltered(journalData, trId, objProp) {

    let value = "";
    for (var key in journalData) {
        if (journalData[key].trId == trId && journalData[key][objProp]) {
            //in the journal I should only have one entry line that corresponds to the control parameters.
            value = journalData[key][objProp];
            return value;
        }
    }
    return value;
}

/**
 * Check that the transaction id is in the list of registration ids on the item.
 * @param {*} trIdList list of id
 * @param {*} trId the transaction id
 */
function transactionRefToTheItem(trIdList, trId) {
    for (var i = 0; i < trIdList.length; i++) {
        if (trId === trIdList[i])
            return true;
    }
    return false;
}

/**
 * Get the data from the transactions table only once
 * The isreport parameter identifies the script from which i call the method. for the report i need to take the amount in base currency in any case (method to be reviewed)
 */
function getTransactionsTableData(banDoc, docInfo) {
    var transactionsList = [];
    var trnsactionsTable = banDoc.table("Transactions");


    if (trnsactionsTable) {
        for (var i = 0; i < trnsactionsTable.rowCount; i++) {
            var trData = {};
            var tRow = trnsactionsTable.row(i);
            trData.row = tRow.rowNr;
            trData.date = tRow.value("Date");
            trData.doc = tRow.value("Doc");
            trData.type = tRow.value("DocType");
            trData.item = tRow.value("ItemsId");
            trData.externalReference = tRow.value("ExternalReference");
            trData.description = tRow.value("Description");
            trData.debit = tRow.value("AccountDebit");
            trData.credit = tRow.value("AccountCredit");
            trData.qt = tRow.value("Quantity");
            trData.unitPrice = tRow.value("UnitPrice");
            //check if it is a multichange file or not
            if (docInfo.isMultiCurrency) {
                trData.amountCurr = tRow.value("AmountCurrency");
                trData.currency = tRow.value("ExchangeCurrency");
                trData.rate = tRow.value("ExchangeRate");
            }
            trData.amountBase = tRow.value("Amount");


            transactionsList.push(trData);

        }
    } else (Banana.console.debug("no transactions table"));

    return transactionsList;
}

/**
 * 
 * Ritorna il valore medio di un azione.
 */
function getSharesAvgValue(quantity, avgCost) {
    var avgValue = "";
    avgValue = Banana.SDecimal.multiply(quantity, avgCost);
    return avgValue;
}

/**
 * 
 * Ritorna il valore totale di un azione.
 */
function getSharesTotalValue(quantity, marketPrice) {
    var totalValue = "";
    totalValue = Banana.SDecimal.multiply(quantity, marketPrice);
    return totalValue;
}

/**
 * Calcola il risultato di vendita.
 */
function getSaleResult(avgSharesValue, totalSharesvalue) {
    var saleResult = "";
    saleResult = Banana.SDecimal.subtract(totalSharesvalue, avgSharesValue);
    return saleResult;
}

function getExchangeResult(totalSharesValue, saleResult, currExRate, accExRate) {

    if (!accExRate || accExRate.length < 1)
        return Banana.Converter.toLocaleNumberFormat("0.00");

    // Default to accExRate if currExRate is not provided
    if (!currExRate) {
        currExRate = accExRate;
    }

    // Calculate the realized exchange (theorical result)
    let realizedExchangeResult = Banana.SDecimal.subtract(
        Banana.SDecimal.multiply(totalSharesValue, currExRate),
        Banana.SDecimal.multiply(totalSharesValue, accExRate)
    );

    // Calculate the unrealized exchange profit/loss based on saleResult
    let unrealizedExchangeProfitLoss = Banana.SDecimal.subtract(
        Banana.SDecimal.multiply(saleResult, accExRate),
        Banana.SDecimal.multiply(saleResult, currExRate)
    );

    // Calculate the effective exchange result by adding realized and unrealized components
    let effectiveExchangeResult = Banana.SDecimal.add(realizedExchangeResult, unrealizedExchangeProfitLoss);

    // Return the total effective exchange result
    return effectiveExchangeResult;
}

/**
 * Ritorna i dati presenti nella tabella conti.
 */
function getAccountsTableData(banDoc) {
    let accountsData = [];
    let accTable = banDoc.table("Accounts");

    if (!accTable) {
        accountsData;
    }

    for (var i = 0; i < accTable.rowCount; i++) {
        var tRow = accTable.row(i);
        var accRow = {};
        accRow.rowNr = tRow.rowNr;
        accRow.group = tRow.value("Group");
        accRow.account = tRow.value("Account");
        accRow.description = tRow.value("Description");
        accRow.bClass = tRow.value("BClass");
        accRow.sumIn = tRow.value("Gr");
        accRow.bankAccount = tRow.value("BankAccount");
        accRow.exchangeRateDiffAcc = tRow.value("AccountExchangeDifference");
        accRow.currency = tRow.value("Currency");
        accRow.opening = tRow.value("Opening");
        accRow.openingCurrency = tRow.value("OpeningCurrency");
        accRow.balance = tRow.value("Balance");
        accRow.balanceCurrency = tRow.value("BalanceCurrency");

        accountsData.push(accRow);
    }

    return accountsData;

}

/**
 * Returns the list of accounts assigned to securities in the Items table.
 */
function getItemsAccounts(banDoc) {
    let itemTableData = getItemsTableData(banDoc);
    if (!itemTableData)
        return [];
    const allAccounts = itemTableData.map(item => item.account);
    const uniqueAccounts = [...new Set(allAccounts)];
    return uniqueAccounts;
}

function getItemsIds(banDoc) {
    let itemTableData = getItemsTableData(banDoc);
    if (!itemTableData)
        return [];
    const allItemsId = itemTableData.map(item => item.item);
    const uniqueItemsId = [...new Set(allItemsId)];
    return uniqueItemsId;
}

function getItemAccount(itemId, banDoc) {
    let itemTableData = getItemsTableData(banDoc);
    if (!itemTableData)
        return "";
    const item = itemTableData.find(item => item.item === itemId);
    if (!item)
        return "";
    return item.account;
}

function getItemDescription(itemId, banDoc) {
    let itemTableData = getItemsTableData(banDoc);
    if (!itemTableData)
        return "";
    const item = itemTableData.find(item => item.item === itemId);
    if (!item)
        return "";
    return item.description;
}

function getItemCurrency(itemId, banDoc) {
    let itemTableData = getItemsTableData(banDoc);
    if (!itemTableData)
        return "";
    const item = itemTableData.find(item => item.item === itemId);
    if (!item)
        return "";
    return item.currency;
}

function getItemRowObj(itemId, banDoc) {
    let itemTableData = getItemsTableData(banDoc);
    if (!itemTableData)
        return {};
    const item = itemTableData.find(item => item.item === itemId);
    if (!item)
        return {};
    return item;
}

/**
 * Retrieves item information from the items table
 * @returns 
 */
function getItemsTableData(banDoc) {

    var itemsData = [];
    if (!banDoc)
        itemsData;

    let docInfo = getDocumentInfo(banDoc);

    if (!docInfo)
        return itemsData;

    let table = banDoc.table("Items");

    if (!table) {
        return itemsData;
    }

    for (var i = 0; i < table.rowCount; i++) {
        var tRow = table.row(i);
        var itemData = {};
        itemData.rowNr = tRow.rowNr;
        itemData.item = tRow.value("ItemsId");
        itemData.description = tRow.value("Description");
        itemData.account = tRow.value("Account");
        itemData.currentQt = tRow.value("QuantityCurrent");
        itemData.valueCurrent = tRow.value("ValueCurrent");
        itemData.valueCurrentCurrency = tRow.value("CurrencyCurrentValue");
        itemData.sumIn = tRow.value("Gr");
        itemData.group = tRow.value("Group");
        itemData.expiryDate = tRow.value("ExpiryDate");
        itemData.interestRate = tRow.value("Notes");
        itemData.unitPriceCurrent = tRow.value("UnitPriceCurrent");
        itemData.currency = tRow.value("Currency");
        itemData.type = tRow.value("ReferenceUnit");
        itemData.unitPriceBegin = tRow.value("UnitPriceBegin");
        itemData.valueBegin = tRow.value("ValueBegin");
        itemData.beginQt = tRow.value("QuantityBegin");
        itemData.valueBeginCurrency = "";
        itemData.exchangeBeginCurrency = "";
        if (docInfo.isMultiCurrency) {
            itemData.valueBeginCurrency = tRow.value("ValueBeginCurrency");
            itemData.exchangeBeginCurrency = tRow.value("ExchangeBegin");
        }

        if (itemsData && itemData.item && itemData.account)//only if the item has an id (isin)
            itemsData.push(itemData);
    }
    return itemsData;
}
/**
 * returns the line number following the last item found whose group is the same as that of the new item
 * @param {*} refGroup reference group.
 * @param {*} tabItemsData 
 */
function getItemRowNr(refGroup, tabItemsData) {
    var refNr = "";
    for (var r in tabItemsData) {
        tRow = tabItemsData[r];
        if (refGroup == tRow.group) {
            refNr = tRow.rowNr;
        }
    }
    // format the number so that it is added after the line I have taken as a reference.--> if row = 6 became 6.6
    if (refNr) {
        refNr = Banana.SDecimal.subtract(refNr, "1");
        refNr = refNr + "." + refNr;
    }
    return refNr;
}

function isValidItemSelected(selectedItem, itemObj, banDoc) {
    if (!itemObj || isObjectEmpty(itemObj) || !selectedItem) {
        const ITEM_NOT_FOUND = "ITEM_NOT_FOUND";
        let msg = getErrorMessage_MissingElements(ITEM_NOT_FOUND, selectedItem);
        banDoc.addMessage(msg, ITEM_NOT_FOUND);
        return false;
    }

    return true;
}

/**
 * Sets the negative sign to those amounts that represent a decrease in the value of the securities account.
 * Decreases are recognised in the thank you entries:
 * -The negative quantity in the quantity column, i.e. a sale of securities.
 * -To losses on the sale, in this case I have recorded the loss in a debit account.
 * 
 * @param {*} amount
 * @param {*} qt 
 * @param {*} debitAmount 
 */
function setSign(amount, qt, debitAmount) {
    var newAmount = "";

    if (!amount) {
        return newAmount;
    }

    if ((qt.includes("-")) || debitAmount !== "" && qt == "") {
        newAmount = "-" + amount;
        return newAmount;
    }

    return amount;
}

/**
 * sums the elements in the array, taking into account the values in the property passed as parameter  
 * @param {*} transactions 
 * @returns 
 */
function sumArrayElements(objArray, property) {
    var sum = "";

    for (var key in objArray) {
        sum = Banana.SDecimal.add(sum, objArray[key][property]);
    }


    return sum;
}

//COLOR FUNCTIONS

function hexToHSL(H, hue, saturation, lightness) {
    // Convert hex to RGB first
    let r = 0, g = 0, b = 0;
    if (H.length == 4) {
        r = "0x" + H[1] + H[1];
        g = "0x" + H[2] + H[2];
        b = "0x" + H[3] + H[3];
    } else if (H.length == 7) {
        r = "0x" + H[1] + H[2];
        g = "0x" + H[3] + H[4];
        b = "0x" + H[5] + H[6];
    }
    // Then to HSL
    r /= 255;
    g /= 255;
    b /= 255;
    let cmin = Math.min(r, g, b),
        cmax = Math.max(r, g, b),
        delta = cmax - cmin,
        h = 0,
        s = 0,
        l = 0;

    if (delta == 0)
        h = 0;
    else if (cmax == r)
        h = ((g - b) / delta) % 6;
    else if (cmax == g)
        h = (b - r) / delta + 2;
    else
        h = (r - g) / delta + 4;

    h = Math.round(h * 60);

    if (h < 0)
        h += 360;

    l = (cmax + cmin) / 2;
    s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);


    // eventually overwrite values
    if (hue) {
        h = hue;
    }
    if (saturation) {
        s = saturation;
    }
    if (lightness) {
        l = lightness;
    }

    return "hsl(" + h + "," + s + "%," + l + "%)"
}


function HSLToHex(hslColor) {

    // hsl(167,47.3%,39.4%)

    let h = '';
    let s = '';
    let l = '';

    let regexp = /hsl\(\s*(\d+)\s*,\s*(\d+(?:\.\d+)?%)\s*,\s*(\d+(?:\.\d+)?%)\)/g;
    let res = regexp.exec(hslColor).slice(1);
    h = res[0];
    s = res[1].replace(/%/, '');
    l = res[2].replace(/%/, '');
    //Banana.console.log("Hue: " + res[0] + "\nSaturation: " + res[1] + "\nValue: " + res[2]);


    //.... (h,s,l)
    s /= 100;
    l /= 100;

    let c = (1 - Math.abs(2 * l - 1)) * s,
        x = c * (1 - Math.abs((h / 60) % 2 - 1)),
        m = l - c / 2,
        r = 0,
        g = 0,
        b = 0;

    if (0 <= h && h < 60) {
        r = c; g = x; b = 0;
    } else if (60 <= h && h < 120) {
        r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
        r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
        r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
        r = x; g = 0; b = c;
    } else if (300 <= h && h < 360) {
        r = c; g = 0; b = x;
    }
    // Having obtained RGB, convert channels to hex
    r = Math.round((r + m) * 255).toString(16);
    g = Math.round((g + m) * 255).toString(16);
    b = Math.round((b + m) * 255).toString(16);

    // Prepend 0s, if necessary
    if (r.length == 1)
        r = "0" + r;
    if (g.length == 1)
        g = "0" + g;
    if (b.length == 1)
        b = "0" + b;

    return "#" + r + g + b;
}

/**
 * Returns an object with colour gradients for the report
 * @param {*} HexColor the base color.
 */
function getColors(HexColor) {
    let colors = {};

    //change the colors properties
    colors.hslColorEvenTableRow = hexToHSL(HexColor, '235', '44', '95');
    colors.hslColorOddTableRow = hexToHSL(HexColor, '231', '45', '85');

    //Set back the colors to HEX format
    colors.hslColorEvenTableRow = HSLToHex(colors.hslColorEvenTableRow);
    colors.hslColorOddTableRow = HSLToHex(colors.hslColorOddTableRow);

    return colors;
}

function checkIfNumberisEven(number) {
    isEven = false;

    if (number % 2 == 0)
        isEven = true;

    return isEven;
}

function tableExists(banDoc, tableName) {
    if (!banDoc)
        return false;
    let table = banDoc.table(tableName);
    if (!table)
        return false;
    return true;
}


function setVariables(variables, baseColor) {
    /* Variables that set the colors */
    variables.$baseColor = baseColor;

}

/**
 *Function that replaces all the css variables inside of the given cssText with their values.
 *All the css variables start with "$" (i.e. $font_size, $margin_top)
 * @param {*} cssText 
 * @param {*} variables 
 */
function replaceVariables(cssText, variables) {

    var result = "";
    var varName = "";
    var insideVariable = false;
    var variablesNotFound = [];

    for (var i = 0; i < cssText.length; i++) {
        var currentChar = cssText[i];
        if (currentChar === "$") {
            insideVariable = true;
            varName = currentChar;
        } else if (insideVariable) {
            if (currentChar.match(/^[0-9a-z]+$/) || currentChar === "_" || currentChar === "-") {
                // still a variable name
                varName += currentChar;
            } else {
                // end variable, any other charcter
                if (!(varName in variables)) {
                    variablesNotFound.push(varName);
                    result += varName;
                } else {
                    result += variables[varName];
                }
                result += currentChar;
                insideVariable = false;
                varName = "";
            }
        } else {
            result += currentChar;
        }
    }

    if (insideVariable) {
        // end of text, end of variable
        if (!(varName in variables)) {
            variablesNotFound.push(varName);
            result += varName;
        } else {
            result += variables[varName];
        }
        insideVariable = false;
    }

    if (variablesNotFound.length > 0) {
        //Banana.console.log(">>Variables not found: " + variablesNotFound);
    }
    return result;
}

//VERSION CONTROL FUNCTIONS
function verifyBananaVersion(banDoc) {
    if (!banDoc)
        return false;

    let BAN_VERSION_MIN = "10.0.10";
    let BAN_DEV_VERSION_MIN = "";
    let ID_ERR_VERSION_NOTSUPPORTED = "ID_ERR_VERSION_NOTSUPPORTED";
    let ID_ERR_LICENSE_NOTVALID = "ID_ERR_LICENSE_NOTVALID";
    let CURR_VERSION = bananaRequiredVersion(BAN_VERSION_MIN, BAN_DEV_VERSION_MIN);
    let CURR_LICENSE = isBananaAdvanced();

    if (!CURR_VERSION) {
        let msg = getErrorMessage(ID_ERR_VERSION_NOTSUPPORTED);
        msg = msg.replace("%1", BAN_VERSION_MIN);
        banDoc.addMessage(msg, ID_ERR_VERSION_NOTSUPPORTED);
        return false;
    }
    if (!CURR_LICENSE) {
        let msg = getErrorMessage(ID_ERR_LICENSE_NOTVALID);
        banDoc.addMessage(msg, ID_ERR_LICENSE_NOTVALID);
        return false;
    }
    return true;
}

function bananaRequiredVersion(requiredVersion, expmVersion) {
    //Check Banana version
    if (expmVersion) {
        requiredVersion = requiredVersion + "." + expmVersion;
    }
    if (Banana.compareVersion && Banana.compareVersion(Banana.application.version, requiredVersion) >= 0) {
        return true;
    }
    return false;
}

function isBananaAdvanced() {
    // Starting from version 10.0.7 it is possible to read the property Banana.application.license.isWithinMaxRowLimits 
    // to check if all application functionalities are permitted
    // the version Advanced returns isWithinMaxRowLimits always false
    // other versions return isWithinMaxRowLimits true if the limit of transactions number has not been reached

    if (Banana.compareVersion && Banana.compareVersion(Banana.application.version, "10.0.10") >= 0) {
        var license = Banana.application.license;
        if (license.licenseType === "advanced" || license.isWithinMaxFreeLines) {
            return true;
        }
    }

    return false;
}

//STYLESHEET
function getReportStyle() {
    //CREATE THE STYLE FOR THE REPORT
    //create the style
    var textCSS = "";
    var file = Banana.IO.getLocalFile("file:script/ch.banana.portfolio.accounting.reports.css");
    var fileContent = file.read();
    if (!file.errorString) {
        Banana.IO.openPath(fileContent);
        //Banana.console.log(fileContent);
        textCSS = fileContent;
    } else {
        Banana.console.log(file.errorString);
    }

    var stylesheet = Banana.Report.newStyleSheet();
    // Parse the CSS text
    stylesheet.parse(textCSS);

    var style = stylesheet;


    //Create a table style adding the border
    style = stylesheet.addStyle("table_bas_transactions");

    return stylesheet;
}
