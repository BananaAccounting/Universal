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
// @description = 5. Check balances report
// @task = app.command
// @doctype = 100.*
// @publisher = Banana.ch SA
// @pubdate = 2025-08-25
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

  if (!verifyBananaVersion(banDoc))
    return "@Cancel";

  if (!tableExists(banDoc, "Items")) {
    let msg = getErrorMessage_MissingElements("NO_ITEMS_TABLE", "");
    banDoc.addMessage(msg, getErrorMessageReferenceAnchor());
    return "@Cancel";
  }

  let docInfo = getDocumentInfo(banDoc);

  let checkBalancesObj = {};
  let data = getAccountsDataObjList(banDoc, docInfo);

  if (data.length < 1)
    return "";

  checkBalancesObj.data = data;

  let report = getReport(banDoc, docInfo, checkBalancesObj);
  getReportHeader(report, docInfo);
  let styleSheet = getReportStyle();
  Banana.Report.preview(report, styleSheet);

  return "";

}

function getReport(banDoc, docInfo, checkBalancesObj) {
  let texts = getTexts(banDoc);
  let report = Banana.Report.newReport(texts.tablecaption);
  let table = report.addTable('discrepanciesTable');
  table.setStyleAttributes("width:100%");
  table.getCaption().addText(texts.tablecaption, "styleTitles");
  defineTableColumns(table);
  addTableHeaders(table);
  addTableData(docInfo, table, checkBalancesObj);
  return report;
}

function addTableData(docInfo, table, dataObj) {
  // Show data (In the account currency).
  let accountData = dataObj.data;
  let accOpBalance = "";
  let secOpBalance = "";
  let opBalancesDiff = "";
  let accBalance = "";
  let secBalance = ""
  let balancesDiff = "";
  let accMovements = "";
  let secMovements = "";
  let movDiff = "";
  let accountName = "";

  /**
  * For the differencese take note that in normal accouting files (no multi), for data arriving from the journal (such as security movement data) we have the value also
  * in currency of the security (same as in base currency-->JBalanceAccountCurrency), while for data coming from the ‘Accounts’ table if the accounts are not multi-currency, 
  * this value does not exist, so could exists a difference in currencies fields wich is not real as wecorrectly miss data in one side. 
  * We manage that by just using base amounts with a non multi-currency ac2 file.
 */

  accountData.forEach(account => {
    let tableRow = table.addRow();

    accountName = account.account;

    if (docInfo.isMultiCurrency) {
      accOpBalance = account.accountDetails.accountOpeningCurrency || account.accountDetails.accountOpening;
      secOpBalance = account.securitiesTotals.secTotalOpeningCurrency || account.securitiesTotals.secTotalOpening;
      opBalancesDiff = account.discrepancies.openingBalanceCurrencyDifference || account.discrepancies.openingBalanceDifference;
      accBalance = account.accountDetails.accountBalanceCurrency || account.accountDetails.accountBalance;
      secBalance = account.securitiesTotals.secTotalBalanceCurrency || account.securitiesTotals.secTotalBalance;
      balancesDiff = account.discrepancies.balanceCurrencyDifference || account.discrepancies.balanceDifference;
      accMovements = account.accountDetails.accountTotalMovementsCurrency || account.accountDetails.accountTotalMovements;
      secMovements = account.securitiesTotals.secTotalMovementsCurrency || account.securitiesTotals.secTotalMovements;
      movDiff = account.discrepancies.movementsCurrencyDifference || account.discrepancies.movementsDifference;
    } else {
      accOpBalance = account.accountDetails.accountOpening;
      secOpBalance = account.securitiesTotals.secTotalOpening;
      opBalancesDiff = account.discrepancies.openingBalanceDifference;
      accBalance = account.accountDetails.accountBalance;
      secBalance = account.securitiesTotals.secTotalBalance;
      balancesDiff = account.discrepancies.balanceDifference;
      accMovements = account.accountDetails.accountTotalMovements;
      secMovements = account.securitiesTotals.secTotalMovements;
      movDiff = account.discrepancies.movementsDifference;
    }


    tableRow.addCell(accountName, "");
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(accOpBalance, 2, true), "styleNormalAmount");
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(secOpBalance, 2, true), "styleNormalAmount");
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(opBalancesDiff, 2, true), "styleNormalAmount_checkBalancesDiffCol");
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(accBalance, 2, true), "styleNormalAmount");
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(secBalance, 2, true), "styleNormalAmount");
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(balancesDiff, 2, true), "styleNormalAmount_checkBalancesDiffCol");
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(accMovements, 2, true), "styleNormalAmount");
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(secMovements, 2, true), "styleNormalAmount");
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(movDiff, 2, true), "styleNormalAmount_checkBalancesDiffCol");

  });
}

function defineTableColumns(table) {
  table.addColumn("Account");
  table.addColumn("Account opening balance");
  table.addColumn("Securities opening balance");
  table.addColumn("Opening balance differences");
  table.addColumn("Account balance");
  table.addColumn("Securities balance");
  table.addColumn("Balance differences");
  table.addColumn("Account movements");
  table.addColumn("Securities movements");
  table.addColumn("Movements differences");
}

function addTableHeaders(table) {
  var tableHeader = table.getHeader();
  var table = tableHeader.addRow();
  table.addCell("Account", "styleTablesHeaderText");
  table.addCell("Account opening balance", "styleTablesHeaderText");
  table.addCell("Securities opening balance", "styleTablesHeaderText");
  table.addCell("Opening balance differences", "styleTablesHeaderText");
  table.addCell("Account balance", "styleTablesHeaderText");
  table.addCell("Securities balance", "styleTablesHeaderText");
  table.addCell("Balance differences", "styleTablesHeaderText");
  table.addCell("Account movements", "styleTablesHeaderText");
  table.addCell("Securities movements", "styleTablesHeaderText");
  table.addCell("Movements differences", "styleTablesHeaderText");
}

function getAccountsDataObjList(banDoc, docInfo) {
  let data = [];
  const accountsData = getAccountsTableData(banDoc);
  let accountsList = getItemsAccounts(banDoc);

  if (!accountsList || accountsList.length === 0) {
    let msg = getErrorMessage_MissingElements("NO_ASSET_ACCOUNTS_FOUND");
    banDoc.addMessage(msg, getErrorMessageReferenceAnchor());
    return accountsList;
  }

  for (const account of accountsList) {
    accCheckBalancesObj = {};
    accTableObj = accountsData.find(obj => obj.account === account); // Find the account in the Account table.

    if (!accTableObj || isObjectEmpty(accTableObj))
      return data;

    accCheckBalancesObj.account = account;

    //Account details
    accCheckBalancesObj.accountDetails = {};
    accCheckBalancesObj.accountDetails.accountDescription = accTableObj.descritpion;
    accCheckBalancesObj.accountDetails.accountOpening = accTableObj.opening || "";
    accCheckBalancesObj.accountDetails.accountOpeningCurrency = accTableObj.openingCurrency || "";
    accCheckBalancesObj.accountDetails.accountBalance = accTableObj.balance || "";
    accCheckBalancesObj.accountDetails.accountBalanceCurrency = accTableObj.balanceCurrency || "";
    accCheckBalancesObj.accountDetails.accountTotalMovements = Banana.SDecimal.subtract(accTableObj.balance, accTableObj.opening) || "";
    accCheckBalancesObj.accountDetails.accountTotalMovementsCurrency = Banana.SDecimal.subtract(accTableObj.balanceCurrency, accTableObj.openingCurrency) || "";
    // Securities
    accCheckBalancesObj.securitiesData = [];
    accCheckBalancesObj.securitiesData = getSecuritiesDataObjList(banDoc, docInfo, account);
    //Securities Totals
    accCheckBalancesObj.securitiesTotals = calculateSecuritiesTotals(accCheckBalancesObj.securitiesData);
    // Discrepancies
    accCheckBalancesObj.discrepancies = checkForDiscrepancies(accCheckBalancesObj);

    data.push(accCheckBalancesObj);
  }

  return data;
}

function getSecuritiesDataObjList(banDoc, docInfo, account) {
  let securitiesList = [];
  let itemsTableData = getItemsTableData(banDoc);

  if (itemsTableData.length < 1) {
    let msg = getErrorMessage_MissingElements("NO_ASSETS_FOUND", "");
    banDoc.addMessage(msg, getErrorMessageReferenceAnchor());
    return "@Cancel";
  }

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

      let itemCardData = getItemCardDataList(banDoc, docInfo, itemObj, unitPriceColDecimals, null);

      if (!itemCardData || isObjectEmpty(itemCardData))
        return;

      secBalance = itemCardData.currentValues.itemBalanceBase;
      secBalanceCurrency = itemCardData.currentValues.itemBalanceCurr;

      let secObj = {};
      secObj.securityId = itemObj.item || "";
      secObj.securityName = itemObj.description || "";
      secObj.securityOpening = itemObj.valueBegin || "";
      secObj.securityOpeningCurrency = itemObj.valueBeginCurrency || "";
      secObj.securityBalance = secBalance || "";
      secObj.securityBalanceCurrency = secBalanceCurrency || "";
      secObj.securityTotalMovements = Banana.SDecimal.subtract(secBalance, itemObj.valueBegin) || "";
      secObj.securityTotalMovementsCurrency = Banana.SDecimal.subtract(secBalanceCurrency, itemObj.valueBeginCurrency) || "";
      securitiesList.push(secObj);
    }
  });

  return securitiesList;
}

function calculateSecuritiesTotals(securitiesData) {
  let secTotals = {};

  let totalOpeningBalance = "0";
  let totalOpeningBalanceCurrency = "0";
  let totalMovements = "0";
  let totalMovementsCurrency = "0";
  let totalBalance = "0";
  let totalBalanceCurrency = "0";


  securitiesData.forEach(security => {

    totalOpeningBalance = Banana.SDecimal.add(totalOpeningBalance, security.securityOpening);
    totalOpeningBalanceCurrency = Banana.SDecimal.add(totalOpeningBalanceCurrency, security.securityOpeningCurrency);
    totalMovements = Banana.SDecimal.add(totalMovements, security.securityTotalMovements);
    totalMovementsCurrency = Banana.SDecimal.add(totalMovementsCurrency, security.securityTotalMovementsCurrency);
    totalBalance = Banana.SDecimal.add(totalBalance, security.securityBalance);
    totalBalanceCurrency = Banana.SDecimal.add(security.securityBalanceCurrency, totalBalanceCurrency);

    secTotals.secTotalOpening = totalOpeningBalance;
    secTotals.secTotalOpeningCurrency = totalOpeningBalanceCurrency;
    secTotals.secTotalBalance = totalBalance;
    secTotals.secTotalBalanceCurrency = totalBalanceCurrency;
    secTotals.secTotalMovements = totalMovements;
    secTotals.secTotalMovementsCurrency = totalMovementsCurrency;
  });

  return secTotals;
}

function checkForDiscrepancies(accCheckBalancesObj) {

  let accountTotals = accCheckBalancesObj.accountDetails;
  let securitiesTotals = accCheckBalancesObj.securitiesTotals;

  let discrepancy = {};

  discrepancy.openingBalanceDifference = "";
  discrepancy.openingBalanceCurrencyDifference = "";
  discrepancy.balanceDifference = "";
  discrepancy.balanceCurrencyDifference = "";
  discrepancy.movementsDifference = "";
  discrepancy.movementsCurrencyDifference = "";


  // Opening differences
  if (Banana.SDecimal.compare(accountTotals.accountOpening, securitiesTotals.secTotalOpening) !== 0) {
    let discrepancyAmt = Banana.SDecimal.subtract(accountTotals.accountOpening, securitiesTotals.secTotalOpening);
    discrepancyAmt = Banana.SDecimal.abs(discrepancyAmt);
    discrepancy.openingBalanceDifference = discrepancyAmt;
  }

  // Opening differences currency
  if (Banana.SDecimal.compare(accountTotals.accountOpeningCurrency, securitiesTotals.secTotalOpeningCurrency) !== 0) {
    let discrepancyAmt = Banana.SDecimal.subtract(accountTotals.accountOpeningCurrency, securitiesTotals.secTotalOpeningCurrency);
    discrepancyAmt = Banana.SDecimal.abs(discrepancyAmt);
    discrepancy.openingBalanceCurrencyDifference = discrepancyAmt;
  }

  // Balance differences
  if (Banana.SDecimal.compare(accountTotals.accountBalance, securitiesTotals.secTotalBalance) !== 0) {
    let discrepancyAmt = Banana.SDecimal.subtract(accountTotals.accountBalance, securitiesTotals.secTotalBalance);
    discrepancyAmt = Banana.SDecimal.abs(discrepancyAmt);
    discrepancy.balanceDifference = discrepancyAmt;
  }

  // Balance currency differences
  if (Banana.SDecimal.compare(accountTotals.accountBalanceCurrency, securitiesTotals.secTotalBalanceCurrency) !== 0) {
    let discrepancyAmt = Banana.SDecimal.subtract(accountTotals.accountBalanceCurrency, securitiesTotals.secTotalBalanceCurrency);
    discrepancyAmt = Banana.SDecimal.abs(discrepancyAmt);
    discrepancy.balanceCurrencyDifference = discrepancyAmt;
  }

  // Movements differences
  if (Banana.SDecimal.compare(accountTotals.accountTotalMovements, securitiesTotals.secTotalMovements) !== 0) {
    let discrepancyAmt = Banana.SDecimal.subtract(accountTotals.accountZotalMovements, securitiesTotals.secTotalMovements);
    discrepancyAmt = Banana.SDecimal.abs(discrepancyAmt);
    discrepancy.movementsDifference = discrepancyAmt;
  }

  // Movements currency differences
  if (Banana.SDecimal.compare(accountTotals.accountTotalMovementsCurrency, securitiesTotals.secTotalMovementsCurrency) !== 0) {
    let discrepancyAmt = Banana.SDecimal.subtract(accountTotals.accountTotalMovementsCurrency, securitiesTotals.secTotalMovementsCurrency);
    discrepancyAmt = Banana.SDecimal.abs(discrepancyAmt);
    discrepancy.movementsCurrencyDifference = discrepancyAmt;
  }

  return discrepancy;

}

function getTexts(banDoc) {
  let text = {};
  let lang = getCurrentLang(banDoc);

  switch (lang) {
    case "it":
      text = getTexts_it();
      break;
    case "de":
      text = getTexts_de();
      break;
    case "fr":
      text = getTexts_fr();
      break;
    case "en":
    default:
      text = getTexts_en();
      break;
  }

  return text;
}

function getTexts_it() {
  let texts = {};

  texts.tablecaption = "Controllo bilancio dei conti titoli";
  texts.discrepancy_openingBalance = "Il bilancio di apertura del conto %1 non corrisponde al totale \n dei bilanci di apertura dei titoli. Discrepanza: %2";
  texts.discrepancy_currentBalance = "Il bilancio del conto %1 non corrisponde al totale \n dei bilanci dei titoli. Discrepanza: %2";
  texts.discrepancy_totalmovements = "Il totale dei movimenti del conto %1 non corrisponde al totale \n dei movimenti dei titoli. Discrepanza: %2";

  return texts;
}

function getTexts_de() {
  let texts = {};

  texts.tablecaption = "Überprüfung des Wertpapierkontosaldos";
  texts.discrepancy_openingBalance = "Der Eröffnungssaldo des Kontos %1 stimmt nicht mit der Summe \n der Eröffnungssalden der Wertpapiere überein. Abweichung: %2";
  texts.discrepancy_currentBalance = "Der Kontosaldo %1 stimmt nicht mit der Summe \n der Salden der Wertpapiere überein. Abweichung: %2";
  texts.discrepancy_totalmovements = "Die Gesamtsummen der Bewegungen des Kontos %1 stimmen nicht mit der Summe \n der Bewegungen der Wertpapiere überein. Abweichung: %2";

  return texts;
}

function getTexts_fr() {
  let texts = {};

  texts.tablecaption = "Vérification du solde des comptes de titres";
  texts.discrepancy_openingBalance = "Le solde d'ouverture du compte %1 ne correspond pas au total \n des soldes d'ouverture des titres. Écart : %2";
  texts.discrepancy_currentBalance = "Le solde du compte %1 ne correspond pas au total \n des soldes des titres. Écart : %2";
  texts.discrepancy_totalmovements = "Le total des mouvements du compte %1 ne correspond pas au total \n des mouvements des titres. Écart : %2";

  return texts;
}

function getTexts_en() {
  let texts = {};

  texts.tablecaption = "Securities Account Balance Check";
  texts.discrepancy_openingBalance = "The opening balance of account %1 does not match the total \n of the securities' opening balances. Discrepancy: %2";
  texts.discrepancy_currentBalance = "The balance of account %1 does not match the total \n of the securities' balances. Discrepancy: %2";
  texts.discrepancy_totalmovements = "The total movements of account %1 do not match the total \n of the securities' movements. Discrepancy: %2";

  return texts;

}

// !!! Alla fine aggiornare il json d'esempio sulla base della versione finale !!!
/** Example generated object structure:
 *{
  "data": [
    {
      "account": "Shares CHF",
      "accountDetails": {
        "accountOpening": "",
        "accountOpeningCurrency": "",
        "accountBalance": "",
        "accountBalanceCurrency": "",
        "accountTotalMovements": "0",
        "accountTotalMovementsCurrency": "0"
      },
      "securitiesData": [
        {
          "securityId": "CH003886335",
          "securityName": "Shares UBS",
          "securityOpening": "",
          "securityOpeningCurrency": "",
          "securityBalance": "",
          "securityBalanceCurrency": "",
          "securityTotalMovements": "0",
          "securityTotalMovementsCurrency": "0"
        }
      ],
      "securitiesTotals": {
        "secTotalOpening": "0",
        "secTotalOpeningCurrency": "0",
        "secTotalBalance": "0",
        "secTotalBalanceCurrency": "0",
        "secTotalMovements": "0",
        "secTotalMovementsCurrency": "0"
      },
      "discrepancies": {
        "openingBalanceDifference": "",
        "openingBalanceCurrencyDifference": "",
        "balanceDifference": "",
        "balanceCurrencyDifference": "",
        "movementsDifference": "",
        "movementsCurrencyDifference": ""
      }
    },
    {
      "account": "Shares Unicredit",
      "accountDetails": {
        "accountOpening": "",
        "accountOpeningCurrency": "",
        "accountBalance": "",
        "accountBalanceCurrency": "",
        "accountTotalMovements": "0",
        "accountTotalMovementsCurrency": "0"
      },
      "securitiesData": [
        {
          "securityId": "IT0005239360",
          "securityName": "Shares Unicredit",
          "securityOpening": "",
          "securityOpeningCurrency": "",
          "securityBalance": "0",
          "securityBalanceCurrency": "0",
          "securityTotalMovements": "0",
          "securityTotalMovementsCurrency": "0"
        }
      ],
      "securitiesTotals": {
        "secTotalOpening": "0",
        "secTotalOpeningCurrency": "0",
        "secTotalBalance": "0",
        "secTotalBalanceCurrency": "0",
        "secTotalMovements": "0",
        "secTotalMovementsCurrency": "0"
      },
      "discrepancies": {
        "openingBalanceDifference": "",
        "openingBalanceCurrencyDifference": "",
        "balanceDifference": "",
        "balanceCurrencyDifference": "",
        "movementsDifference": "",
        "movementsCurrencyDifference": ""
      }
    },
    {
      "account": "Shares Netflix",
      "accountDetails": {
        "accountOpening": "",
        "accountOpeningCurrency": "",
        "accountBalance": "1569.15",
        "accountBalanceCurrency": "1651.73",
        "accountTotalMovements": "1569.15",
        "accountTotalMovementsCurrency": "1651.73"
      },
      "securitiesData": [
        {
          "securityId": "US123456789",
          "securityName": "Shares Netflix",
          "securityOpening": "",
          "securityOpeningCurrency": "",
          "securityBalance": "1569.15",
          "securityBalanceCurrency": "1651.73",
          "securityTotalMovements": "1569.15",
          "securityTotalMovementsCurrency": "1651.73"
        }
      ],
      "securitiesTotals": {
        "secTotalOpening": "0",
        "secTotalOpeningCurrency": "0",
        "secTotalBalance": "1569.15",
        "secTotalBalanceCurrency": "1651.73",
        "secTotalMovements": "1569.15",
        "secTotalMovementsCurrency": "1651.73"
      },
      "discrepancies": {
        "openingBalanceDifference": "",
        "openingBalanceCurrencyDifference": "",
        "balanceDifference": "",
        "balanceCurrencyDifference": "",
        "movementsDifference": "",
        "movementsCurrencyDifference": ""
      }
    },
    {
      "account": "Bonds EUR",
      "accountDetails": {
        "accountOpening": "",
        "accountOpeningCurrency": "",
        "accountBalance": "",
        "accountBalanceCurrency": "",
        "accountTotalMovements": "0",
        "accountTotalMovementsCurrency": "0"
      },
      "securitiesData": [
        {
          "securityId": "IT000792468",
          "securityName": "Bonds Bnp Paribas",
          "securityOpening": "",
          "securityOpeningCurrency": "",
          "securityBalance": "0",
          "securityBalanceCurrency": "0",
          "securityTotalMovements": "0",
          "securityTotalMovementsCurrency": "0"
        }
      ],
      "securitiesTotals": {
        "secTotalOpening": "0",
        "secTotalOpeningCurrency": "0",
        "secTotalBalance": "0",
        "secTotalBalanceCurrency": "0",
        "secTotalMovements": "0",
        "secTotalMovementsCurrency": "0"
      },
      "discrepancies": {
        "openingBalanceDifference": "",
        "openingBalanceCurrencyDifference": "",
        "balanceDifference": "",
        "balanceCurrencyDifference": "",
        "movementsDifference": "",
        "movementsCurrencyDifference": ""
      }
    }
  ]
}
 */