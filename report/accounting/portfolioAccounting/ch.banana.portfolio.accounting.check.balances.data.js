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
// @id = ch.banana.portfolio.accounting.check.balances.data
// @description = Check balances
// @task = app.command
// @doctype = 100.*
// @publisher = Banana.ch SA
// @pubdate = 2025-02-07
// @inputdatasource = none
// @timeout = -1
// @includejs = ch.banana.portfolio.accounting.calculation.methods.js
// @includejs = ch.banana.portfolio.accounting.errormessagges.handler.js

/**
 * This extension checks that the balances of individual securities correspond with the balances of the account to which they are assigned.
 * This check is especially useful after the start of a new accounting year to check that the 
 * openings and closings have been made using the correct values and that the balances 
 * of the various securities coincide with the total account balances.
 * The check currently works on the current year.
 * We work with the data in a single object with the following structure: 
 */

function exec() {

    let banDoc = Banana.document;

    if (!banDoc)
        return;

    let docInfo = getDocumentInfo(banDoc);

    let checkBalancesObj = {};
    checkBalancesObj.accounts = getAccountsDataObjList(banDoc, docInfo);

}

function getAccountsDataObjList(banDoc, docInfo) {
    let data = [];
    const accountsData = getAccountsTableData(banDoc);
    let accountsList = getItemsAccounts(banDoc);

    for (const account of accountsList) {
        accCheckBalancesObj = {};
        accTableObj = accountsData.find(obj => obj.account === account); // Find the account in the Account table.

        if (!accTableObj || isObjectEmpty(accTableObj))
            return data;

        accCheckBalancesObj.account = account;
        accCheckBalancesObj.accountDescription = accTableObj.descritpion;
        accCheckBalancesObj.accountOpening = accTableObj.opening;
        accCheckBalancesObj.accountOpeningCurrency = accTableObj.openingCurrency;
        accCheckBalancesObj.accountBalance = accTableObj.balance;
        accCheckBalancesObj.accountBalanceCurrency = accTableObj.balanceCurrency;
        accCheckBalancesObj.totalMovements = Banana.SDecimal.subtract(accTableObj.balance, accTableObj.opening);
        accCheckBalancesObj.totalMovementsCurrency = Banana.SDecimal.subtract(accTableObj.balanceCurrency, accTableObj.openingCurrency);
        accCheckBalancesObj.securities = [];
        accCheckBalancesObj.causingSecurities = getSecuritiesDataObjList(banDoc, docInfo, account);
        data.push(accCheckBalancesObj);
    }
    return data;
}

function getSecuritiesDataObjList(banDoc, docInfo, account) {
    let securitiesList = [];
    let itemsTableData = getItemsTableData(banDoc);
    let accountCard = banDoc.currentCard(account);
    let journal = banDoc.journal(banDoc.ORIGINTYPE_CURRENT, banDoc.ACCOUNTTYPE_NONE);
    let journalData = getJournalData(docInfo, journal);
    let unitPriceColumn = banDoc.table("Transactions").column("UnitPrice", "Base");
    let unitPriceColDecimals = unitPriceColumn.decimal;

    /**
     * We derive the current book value of a security on the basis of its movements (see Security card).
     * An alternative would be to ask the user to enter the current book value in the ‘Price current’ column
     * and use the value in the ValueCurrent column, but it would require explaining to the user to enter the price current
     * before generating the report and may become annoying.
     */

    itemsTableData.forEach(itemObj => {
        if (itemObj && itemObj.account && itemObj.account == account) {
            let secBalance = "";
            let secBalanceCurrency = "";

            let accountCardAdpt = getAccountCardDataAdapted(banDoc, docInfo, itemObj, accountCard, account);
            let itemCardData = getItemCardDataList(itemObj, accountCardAdpt, journalData, unitPriceColDecimals, null);

            if (!itemCardData || isObjectEmpty(itemCardData))
                return;

            secBalance = itemCardData.currentValues.itemBalance;
            secBalanceCurrency = itemCardData.currentValues.itemBalanceCurr;

            let secObj = {};
            secObj.securityId = item.item;
            secObj.securityName = item.description;
            secObj.securityOpening = item.valueBegin;
            secObj.valueBeginCurrency = item.valueCurrentCurrency;
            secObj.securityBalance = secBalance; // 10.02, testare se funzionaaa.
            secObj.securityBalanceCurrency = secBalanceCurrency;
            secObj.securityTotalMovements = Banana.SDecimal.subtract(secBalance, item.valueBegin);
            secObj.securityTotalMovementsCurrency = Banana.SDecimal.subtract(secBalanceCurrency, item.valueBeginCurrency);
            secObj.discrepancies = [];
            securitiesList.push(secObj);
        }
    });

    return securitiesList;
}

// !!! Alla fine aggiornare il json d'esempio sulla base della versione finale !!!
/** Example generated object structure:
 * {
  "accounts": [
    {
      "account": "1001",
      "accountName": "Investment Account USD",
      "openingBalance": 5000.00,
      "totalMovements": 1500.00,
      "currentBalance": 6500.00,
      "discrepancies": {
        "hasDiscrepancy": true,
        "expectedBalance": 7000.00,
        "difference": -500.00,
        "notes": "Il bilancio corrente del conto non coincide con la somma dei titoli.",
        "causingSecurities": [
          {
            "securityId": "GOOGL",
            "securityName": "Alphabet Inc.",
            "expectedValue": 3500.00,
            "currentValue": 4000.00,
            "difference": 500.00
          }
        ]
      },
      "securities": [
        {
          "securityId": "AAPL",
          "securityName": "Apple Inc.",
          "openingBalanceValue": 2000.00,
          "openingBalanceSecurityCard": 2000.00,
          "currentBalanceValue": 2500.00,
          "discrepancies": {
            "hasDiscrepancy": false,
            "difference": 0.00,
            "notes": ""
          }
        },
        {
          "securityId": "GOOGL",
          "securityName": "Alphabet Inc.",
          "openingBalanceValue": 3000.00,
          "openingBalanceSecurityCard": 3000.00,
          "currentBalanceValue": 4000.00,
          "discrepancies": {
            "hasDiscrepancy": true,
            "expectedValue": 3500.00,
            "difference": 500.00,
            "notes": "Valore corrente del titolo superiore al previsto."
          }
        }
      ]
    },
    {
      "account": "1002",
      "accountName": "Investment Account EUR",
      "openingBalance": 8000.00,
      "totalMovements": -1000.00,
      "currentBalance": 7000.00,
      "discrepancies": {
        "hasDiscrepancy": false,
        "difference": 0.00,
        "notes": "",
        "causingSecurities": []
      },
      "securities": [
        {
          "securityId": "TSLA",
          "securityName": "Tesla Inc.",
          "openingBalanceValue": 4000.00,
          "openingBalanceSecurityCard": 4000.00,
          "currentBalanceValue": 3500.00,
          "discrepancies": {
            "hasDiscrepancy": false,
            "difference": 0.00,
            "notes": ""
          }
        }
      ]
    }
  ],
  "globalErrors": [
    {
      "type": "DataMismatch",
      "message": "Discrepanze trovate in uno o più conti.",
      "affectedAccounts": ["1001"]
    }
  ]
} 
 */