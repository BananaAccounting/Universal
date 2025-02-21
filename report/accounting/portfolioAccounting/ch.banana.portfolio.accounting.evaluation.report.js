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
// @api = 1.0
// @id = ch.banana.portfolio.accounting.evaluation.report
// @description = 9. Evaluation of investments report
// @task = app.command
// @doctype = 100.*
// @publisher = Banana.ch SA
// @pubdate = 2023-12-11
// @inputdatasource = none
// @timeout = -1
// @includejs = ch.banana.portfolio.accounting.calculation.methods.js


function addTableBaSAppraisal(report) {
  let current_date = new Date();
  current_date = Banana.Converter.toLocaleDateFormat(current_date);
  var table_bas_appraisal = report.addTable('myAppraisalTable');
  table_bas_appraisal.setStyleAttributes("width:100%;");
  //columns definition
  table_bas_appraisal.addColumn("Type/Security").setStyleAttributes("width:15%");
  table_bas_appraisal.addColumn("ISIN").setStyleAttributes("width:15%");
  table_bas_appraisal.addColumn("Currency").setStyleAttributes("width:15%");
  table_bas_appraisal.addColumn("Quantity").setStyleAttributes("width:15%");
  table_bas_appraisal.addColumn("Unit Cost").setStyleAttributes("width:15%");
  table_bas_appraisal.addColumn("Total Cost").setStyleAttributes("width:15%");
  table_bas_appraisal.addColumn("Market Price").setStyleAttributes("width:15%");
  table_bas_appraisal.addColumn("Market Value").setStyleAttributes("width:15%");
  table_bas_appraisal.addColumn("% of Port").setStyleAttributes("width:15%");
  table_bas_appraisal.addColumn("Un. Gain or Loss").setStyleAttributes("width:15%");
  table_bas_appraisal.addColumn("% G/L").setStyleAttributes("width:15%");
  //headers definition
  let caption = table_bas_appraisal.getCaption().addText(qsTr("Appraisal Report \n Holdings as of: " + current_date), "styleTitles");
  caption.excludeFromTest();
  var tableHeader = table_bas_appraisal.getHeader();
  var tableRow = tableHeader.addRow();
  tableRow.addCell("Type/Security", "styleTablesHeaderText");
  tableRow.addCell("ISIN", "styleTablesHeaderText");
  tableRow.addCell("Currency", "styleTablesHeaderText");
  tableRow.addCell("Current quantity", "styleTablesHeaderText");
  tableRow.addCell("Book value\nper unit", "styleTablesHeaderText");
  tableRow.addCell("Book value", "styleTablesHeaderText");
  tableRow.addCell("Market value\nper unit", "styleTablesHeaderText");
  tableRow.addCell("Market value", "styleTablesHeaderText");
  tableRow.addCell("% of Port", "styleTablesHeaderText");
  tableRow.addCell("Un. Gain or Loss", "styleTablesHeaderText");
  tableRow.addCell("% G/L", "styleTablesHeaderText");
  return table_bas_appraisal;
}

function addTableBaSTransactions(report) {
  let current_date = new Date()
  current_date = Banana.Converter.toInternalDateFormat(current_date);
  var table_bas_transactions_details = report.addTable('myTransactionsTable');
  table_bas_transactions_details.setStyleAttributes("width:100%;");
  let caption = table_bas_transactions_details.getCaption().addText(qsTr("Investment accounting transactions \n Transactions as of: " + current_date), "styleTitles");
  caption.excludeFromTest();
  var tableHeader = table_bas_transactions_details.getHeader();
  var tableRow = tableHeader.addRow();
  //columns definition
  table_bas_transactions_details.addColumn("Date").setStyleAttributes("width:15%");
  table_bas_transactions_details.addColumn("Doc").setStyleAttributes("width:10%");
  table_bas_transactions_details.addColumn("Security").setStyleAttributes("width:15%");
  table_bas_transactions_details.addColumn("Description").setStyleAttributes("width:30%");
  table_bas_transactions_details.addColumn("Debit").setStyleAttributes("width:20%");
  table_bas_transactions_details.addColumn("Credit").setStyleAttributes("width:20%");
  table_bas_transactions_details.addColumn("Quantity").setStyleAttributes("width:10%");
  table_bas_transactions_details.addColumn("Unit Price").setStyleAttributes("width:15%");
  table_bas_transactions_details.addColumn("Amount").setStyleAttributes("width:15%");
  //headers definition
  tableRow.addCell("Date", "styleTablesHeaderText");
  tableRow.addCell("Doc", "styleTablesHeaderText");
  tableRow.addCell("Security", "styleTablesHeaderText");
  tableRow.addCell("Description", "styleTablesHeaderText");
  tableRow.addCell("Debit", "styleTablesHeaderText");
  tableRow.addCell("Credit", "styleTablesHeaderText");
  tableRow.addCell("Quantity", "styleTablesHeaderText");
  tableRow.addCell("Unit/Price", "styleTablesHeaderText");
  tableRow.addCell("Amount", "styleTablesHeaderText");
  return table_bas_transactions_details;
}

function printReport(banDoc, docInfo, appraisalDataList, portfolioTrData) {

  /** Get the decimals used for the values in the Transactions table, to keep the same format in the report, 
   *  especially to display the full booking and market value based on the decimals used in the UnitPrice & UnitPriceCurrent columns.
   * */
  let unitPriceColumn = banDoc.table("Transactions").column("UnitPrice", "Base");
  let decimals = unitPriceColumn.decimal;
  if (decimals > 11)
    decimals = 11; // Over 11 decimals shown, the amounts overlap each others.

  //creates a new report
  let report = Banana.Report.newReport("Investment accounting evaluation report");
  //add appraisal table
  let appraisalTable = addTableBaSAppraisal(report);
  let rowColorIndex = 0;//to know whether a line is odd or even.
  let isEven = false;
  let rowStyle = "";

  //APPRAISAL REPORT
  const reportData = appraisalDataList.securitiesData;

  //Print accounts Data
  reportData.accountsData.forEach(accountData => {
    const element = accountData;
    var tableRow = appraisalTable.addRow("");
    tableRow.addCell(element.account.name, 'styleDescrTotals');
    tableRow.addCell('', '', 10);
    const itemsData = element.account.data.items;
    const itemsTotals = element.account.data.totals;
    //Print account data.
    itemsData.forEach(itemData => {
      //Defines style for alternating rows 
      isEven = checkIfNumberisEven(rowColorIndex);
      if (isEven)
        rowStyle = "styleEvenRows";
      else
        rowStyle = "styleOddRows";
      let itemCurrency = itemData.currency || docInfo.baseCurrency;
      var tableRow = appraisalTable.addRow(rowStyle);
      tableRow.addCell(itemData.description, '');
      tableRow.addCell(itemData.item, 'styleNormalAmount');
      tableRow.addCell(itemCurrency, 'styleNormalAmount');
      tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itemData.currentQt, 0, true), 'styleNormalAmount');
      tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itemData.avgCost, decimals, true), 'styleNormalAmount');
      tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itemData.totalCost, decimals, true), 'styleNormalAmount');
      tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itemData.marketPrice, decimals, true), 'styleNormalAmount');
      tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itemData.marketValue, decimals, true), 'styleNormalAmount');
      tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itemData.percOfPort, 2, true), 'styleNormalAmount');
      tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itemData.unGainLoss, 2, true), 'styleNormalAmount');
      tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itemData.percGL, 2, true), 'styleNormalAmount');
      rowColorIndex++;
    });
    rowColorIndex = 0;
    //Print account totals.
    itemsTotals.forEach(total => {
      var tableRow = appraisalTable.addRow("");
      tableRow.addCell(total.description, 'styleDescrTotals');
      tableRow.addCell("", '', 1);
      tableRow.addCell(total.currency, 'styleTotalAmount');
      tableRow.addCell(Banana.Converter.toLocaleNumberFormat(total.accountTotCurrentQt, 0, true), 'styleTotalAmount');
      tableRow.addCell("", '', 1);
      tableRow.addCell(Banana.Converter.toLocaleNumberFormat(total.accountTotBookValue, decimals, true), 'styleTotalAmount');
      tableRow.addCell("", '', 1);
      tableRow.addCell(Banana.Converter.toLocaleNumberFormat(total.accountTotMarketValue, decimals, true), 'styleTotalAmount');
      tableRow.addCell(Banana.Converter.toLocaleNumberFormat(total.accountTotPercOfPort, 2, true), 'styleTotalAmount');
      tableRow.addCell(Banana.Converter.toLocaleNumberFormat(total.accountTotUnGainLoss, 2, true), 'styleTotalAmount');
      tableRow.addCell("", '', 1);
    });

  });
  //Print Portfolio totals
  var tableRow = appraisalTable.addRow("styleTotaPortfolio");
  reportData.portfolioTotals.forEach(portFolioTotal => {
    tableRow.addCell(portFolioTotal.description, 'styleDescrTotals');
    tableRow.addCell("", '', 2);
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(portFolioTotal.portfolioTotCurrentQt, 0, true), 'styleTotalAmount');
    tableRow.addCell("", '', 4);
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(portFolioTotal.portfolioTotPercOfPort, 2, true), 'styleTotalAmount');
    tableRow.addCell("", '', 2);
  });

  report.addPageBreak();

  //add portfolio transactions table
  let transactionsTable = addTableBaSTransactions(report);
  //reset row color index to zero
  rowColorIndex = 0;

  for (var key in portfolioTrData.data) {
    let trElement = portfolioTrData.data[key];
    if (trElement.transactions && trElement.transactions.length >= 1) {
      var tableRow = transactionsTable.addRow("");
      tableRow.addCell(trElement.item, 'styleDescrTotals');
      tableRow.addCell('', '', 8);
      for (var e in trElement.transactions) {
        isEven = checkIfNumberisEven(rowColorIndex);
        if (isEven)
          rowStyle = "styleEvenRows";
        else
          rowStyle = "styleOddRows";
        let transaction = trElement.transactions[e];
        var tableRow = transactionsTable.addRow(rowStyle);
        tableRow.addCell(Banana.Converter.toLocaleDateFormat(transaction.date, ''));
        tableRow.addCell(transaction.doc, 'styleAlignCenter');
        tableRow.addCell(transaction.item, '');
        tableRow.addCell(transaction.description, '');
        tableRow.addCell(transaction.debit, '');
        tableRow.addCell(transaction.credit, '');
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(transaction.qt, 0, false), 'styleNormalAmount');
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(transaction.unitPrice, decimals, false), 'styleNormalAmount');
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(transaction.amount, 2, false), 'styleNormalAmount');

        rowColorIndex++;
      }
    }

  }

  return report;

}

function getAppraisalData(banDoc, docInfo, itemsData) {
  let appraisalData = {};
  let accountsList = getSecurityAccountsList(itemsData);

  let d = new Date();//save the current date
  appraisalData.date = d.getDate();
  appraisalData.securitiesData = getAppraisalDataList(banDoc, docInfo, accountsList, itemsData);

  return appraisalData;

}

function getAppraisalDataList(banDoc, docInfo, accountsList, itemsData) {

  let appraisalDataList = {};
  let accountsData = [];
  let portfolioTotals = [];
  let journal = banDoc.journal(banDoc.ORIGINTYPE_CURRENT, banDoc.ACCOUNTTYPE_NONE);
  let journalData = getJournalData(docInfo, journal);

  //Get the transactions data for every item.
  for (var i = 0; i < accountsList.length; i++) {
    let secAccountData = {};
    let account = accountsList[i];
    secAccountData.account = {};
    secAccountData.account.name = account;
    secAccountData.account.data = {};
    secAccountData.account.data.items = getAppraisalDataList_transactions(banDoc, docInfo, itemsData, journalData, account);
    accountsData.push(secAccountData);
  }

  let portfolioMarketValueSum = getPortfolioMarketValueSum(accountsData);
  addPortfolioPercentages(accountsData, portfolioMarketValueSum);
  calculateAccountsTotals(accountsData, banDoc);
  calculatePortfolioTotals(accountsData, portfolioTotals);

  appraisalDataList.accountsData = accountsData;
  appraisalDataList.portfolioTotals = portfolioTotals;

  return appraisalDataList;
}

function getAppraisalDataList_transactions(banDoc, docInfo, itemsData, journalData, account) {
  let appraisalDataListTrans = [];
  let unitPriceColumn = banDoc.table("Transactions").column("UnitPrice", "Base");
  let unitPriceColDecimals = unitPriceColumn.decimal; // we want to use the same decimals as defined in the unit price column.
  //Get rows data.
  for (var key in itemsData) {
    if (itemsData[key].account === account) {
      let itemId = itemsData[key].item;
      let itemObj = itemsData.find(obj => obj.item === itemId);
      accountCard = banDoc.currentCard(account);
      let accountCardData = getAccountCardDataAdapted(itemObj, accountCard);
      let appraisalData = {};
      appraisalData.item = itemId;
      appraisalData.description = itemsData[key].description;
      appraisalData.currency = getAccountCurrency(account, banDoc); // Per ora usiamo la valuta del conto, che è quella effettiva, e non quella nella tab items, siccome non ce nessun controllo.
      appraisalData.currentQt = itemsData[key].currentQt;
      //get the average cost
      appraisalData.avgCost = "";
      let itemCardData = getItemCardDataList(docInfo, itemObj, accountCardData, journalData, unitPriceColDecimals);
      if (itemCardData && itemCardData.currentValues) {
        appraisalData.avgCost = itemCardData.currentValues.itemAvgCost;
      }
      appraisalData.totalCost = Banana.SDecimal.multiply(appraisalData.currentQt, appraisalData.avgCost);
      /**
       * If market price is not present, we put the average also as market price.
       * In this way  the gain or loss will be zero
       */
      itemsData[key].unitPriceCurrent ? appraisalData.marketPrice = itemsData[key].unitPriceCurrent : appraisalData.marketPrice = appraisalData.avgCost; // Aggiungere avviso se non ce.
      appraisalData.marketValue = Banana.SDecimal.multiply(appraisalData.currentQt, appraisalData.marketPrice);
      appraisalData.unGainLoss = Banana.SDecimal.subtract(appraisalData.marketValue, appraisalData.totalCost);
      appraisalData.percGL = getGLPerc(appraisalData.marketValue, appraisalData.totalCost);

      if (appraisalData) {
        appraisalDataListTrans.push(appraisalData);
      }
    }
  }

  return appraisalDataListTrans;
}

function addPortfolioPercentages(accountsData, portfolioMarketValueSum) {

  accountsData.forEach(item => {
    const accountName = item.account.name;
    const accountData = item.account.data;

    accountData.items.forEach(subItem => {
      let temp = Banana.SDecimal.divide(subItem.marketValue, portfolioMarketValueSum);
      subItem.percOfPort = Banana.SDecimal.multiply(temp, 100);
    });

  });
}

/**
 * Calculate the totals for each object    /** Calcolo i totali per ogni conto:
 * - Current Qt --> sommo le qt di ogni item.
 * - % of port --> vedo il valore di mercato in base al totale calcolato sopra.
 * - Book value --> totale del total cost.
 * - Market value --> totale unrealized gain or loss.
 * - Unrealized gain or loss --> totale unrealized gain or loss
 */
function calculateAccountsTotals(accountsData, banDoc) {

  accountsData.forEach(item => {
    const accountName = item.account.name;
    const accountData = item.account.data;
    let totals = [];
    let total = {};

    let totCurrentQt = "";
    let totBookValue = "";
    let totMarketValue = "";
    let totUnGainLoss = "";
    let totPercOfPort = "";

    accountData.items.forEach(subItem => {
      totCurrentQt = Banana.SDecimal.add(totCurrentQt, subItem.currentQt);
      totBookValue = Banana.SDecimal.add(totBookValue, subItem.totalCost);
      totMarketValue = Banana.SDecimal.add(totMarketValue, subItem.marketValue);
      totUnGainLoss = Banana.SDecimal.add(totUnGainLoss, subItem.unGainLoss);
      totPercOfPort = Banana.SDecimal.add(totPercOfPort, subItem.percOfPort);
    });

    // Aggiungo un nuovo oggetto in cui salvo i totali.
    total.description = qsTr("Total ") + accountName; // da tradurre
    total.currency = getAccountCurrency(accountName, banDoc);
    total.accountTotCurrentQt = totCurrentQt;
    total.accountTotBookValue = totBookValue;
    total.accountTotMarketValue = totMarketValue;
    total.accountTotUnGainLoss = totUnGainLoss;
    total.accountTotPercOfPort = totPercOfPort

    totals.push(total);

    item.account.data.totals = totals;

  });

}

/**
 * Calcolo i totali per l'intero Portfolio
 * - Current Qt --> sommo tutte le Current Qt degli items.
 * - % of port -->  sommo tutte le perc of port.
*/
function calculatePortfolioTotals(accountsData, portfolioTotals) {
  let totals = {};
  let totCurrentQt = "";
  let totPercOfPort = "";

  accountsData.forEach(item => {
    const accountName = item.account.name;
    const accountData = item.account.data;

    accountData.totals.forEach(subItem => {
      totCurrentQt = Banana.SDecimal.add(totCurrentQt, subItem.accountTotCurrentQt);
      totPercOfPort = Banana.SDecimal.add(totPercOfPort, subItem.accountTotPercOfPort);
    });

  });

  totals.description = qsTr("Total Portfolio");
  totals.portfolioTotCurrentQt = totCurrentQt;
  totals.portfolioTotPercOfPort = totPercOfPort;
  portfolioTotals.push(totals);

}

function getSecurityAccountsList(itemsData) {
  let secTypesList = new Set();
  for (var key in itemsData) {
    if (itemsData[key].account) {
      secTypesList.add(itemsData[key].account);
    }
  }
  let secTypesList_array = Array.from(secTypesList); //convert the set into an array.

  return secTypesList_array;

}

function getGLPerc(marketValue, totalCost) {
  let percGL = Banana.SDecimal.subtract(marketValue, totalCost);
  percGL = Banana.SDecimal.divide(percGL, marketValue);
  percGL = Banana.SDecimal.multiply(percGL, 100);

  return percGL;
}

function getAppraisalDataList_portfolioPercentage(appraisalDataList) {
  for (var key in appraisalDataList) {
    let temp = Banana.SDecimal.divide(appraisalDataList[key].marketValue, portfolioTotalAmount);
    appraisalDataList[key].percOfPort = Banana.SDecimal.multiply(temp, 100);
  }

  return appraisalDataList;

}

/**
 * Get the total of an array by making the sum of all the market value amounts
 * @param {*} appraisalDataList 
 * @returns 
 */
function getPortfolioMarketValueSum(appraisalDataList) {
  let totalMarketValue = 0;

  appraisalDataList.forEach(item => {
    item.account.data.items.forEach(subItem => {
      const marketValue = parseFloat(subItem.marketValue);
      totalMarketValue += marketValue;
    });
  });

  return totalMarketValue;

}

function getportfolioTrData(banDoc, docInfo, itemsData) {
  let portfolioTrData = {};
  portfolioTrData.date = "";
  portfolioTrData.data = [];
  let trTableData = {};

  trTableData = getTransactionsTableData(banDoc, docInfo);

  for (var key in itemsData) {
    let item = {};
    item.item = itemsData[key].item;
    item.transactions = getportfolioTrData_transactions(item.item, trTableData);
    if (item.item)
      portfolioTrData.data.push(item);

  }
  return portfolioTrData;
}

/**
 * Saves in an array of obj all the records that have the item equal to ItemsId
 * @param {*} itemId ref item
 * @param {*} trTableData transactions tabel data
 */
function getportfolioTrData_transactions(itemId, trTableData) {
  let transactions = [];

  for (var key in trTableData) {
    if (trTableData[key].item != "" && itemId == trTableData[key].item) {
      let transaction = {};
      transaction.date = trTableData[key].date;
      transaction.doc = trTableData[key].doc;
      transaction.item = trTableData[key].item;
      transaction.description = trTableData[key].description;
      transaction.debit = trTableData[key].debit;
      transaction.credit = trTableData[key].credit;
      transaction.qt = trTableData[key].qt;
      transaction.unitPrice = trTableData[key].unitPrice;
      transaction.amount = trTableData[key].amountBase;
      if (transaction)
        transactions.push(transaction);
    }
  }
  return transactions;
}

function exec() {

  let banDoc = Banana.document;
  let docInfo = getDocumentInfo(banDoc);

  if (!verifyBananaVersion(banDoc))
    return "@Cancel";

  if (!tableExists(banDoc, "Items")) {
    let msg = getErrorMessage_MissingElements("NO_ITEMS_TABLE", "");
    banDoc.addMessage(msg, "NO_ITEMS_TABLE");
    return "@Cancel";;
  }

  //get the items table data
  let itemsData = getItemsTableData(banDoc);

  if (itemsData.length < 1) {
    let msg = getErrorMessage_MissingElements("NO_SECURITIES_FOUND", "");
    banDoc.addMessage(msg, "NO_SECURITIES_FOUND");
    return "@Cancel";
  }

  //get the appraisal data list
  let appraisalDataList = getAppraisalData(banDoc, docInfo, itemsData);
  //get the transactionsList
  let portfolioTrData = getportfolioTrData(banDoc, docInfo, itemsData);
  var report = printReport(banDoc, docInfo, appraisalDataList, portfolioTrData);
  getReportHeader(report, docInfo);
  var stylesheet = getReportStyle();
  Banana.Report.preview(report, stylesheet);
}

/*example  Appraisal data structure
 * 
{
  "accountsData": [
    {
      "account": {
        "name": "Shares CHF",
        "data": {
          "items": [
            {
              "item": "CH003886335",
              "description": "Shares UBS",
              "currentQt": "5.0000",
              "avgCost": "11.00",
              "totalCost": "55.000000",
              "marketPrice": "11.7000",
              "marketValue": "58.50000000",
              "unGainLoss": "3.50000000",
              "percGL": "5.982905982905982905982905982905983",
              "percOfPort": "1.762844658731354527648033750188338"
            }
          ],
          "totals": [
            {
              "accountTotCurrentQt": "5.0000",
              "accountTotBookValue": "55.000000",
              "accountTotMarketValue": "58.50000000",
              "accountTotUnGainLoss": "3.50000000",
              "accountTotPercOfPort": "1.762844658731354527648033750188338"
            }
          ]
        }
      }
    },
    {
      "account": {
        "name": "Shares EUR",
        "data": {
          "items": [
            {
              "item": "IT0005239360",
              "description": "Shares Unicredit",
              "currentQt": "50.0000",
              "avgCost": "10.48",
              "totalCost": "524.000000",
              "marketPrice": "10.7000",
              "marketValue": "535.00000000",
              "unGainLoss": "11.00000000",
              "percGL": "2.056074766355140186915887850467290",
              "percOfPort": "16.12174175079102003917432574958566"
            }
          ],
          "totals": [
            {
              "accountTotCurrentQt": "50.0000",
              "accountTotBookValue": "524.000000",
              "accountTotMarketValue": "535.00000000",
              "accountTotUnGainLoss": "11.00000000",
              "accountTotPercOfPort": "16.12174175079102003917432574958566"
            }
          ]
        }
      }
    },
    {
      "account": {
        "name": "Bonds EUR",
        "data": {
          "items": [
            {
              "item": "IT000792468",
              "description": "Bonds Bnp Paribas ",
              "currentQt": "2500.0000",
              "avgCost": "1.09",
              "totalCost": "2725.000000",
              "marketPrice": "1.09",
              "marketValue": "2725.000000",
              "unGainLoss": "0",
              "percGL": "0",
              "percOfPort": "82.11541359047762543317764050022601"
            }
          ],
          "totals": [
            {
              "accountTotCurrentQt": "2500.0000",
              "accountTotBookValue": "2725.000000",
              "accountTotMarketValue": "2725.000000",
              "accountTotUnGainLoss": "0",
              "accountTotPercOfPort": "82.11541359047762543317764050022601"
            }
          ]
        }
      }
    }
  ],
  "portfolioTotals": [
    {
      "portfolioTotCurrentQt": "2555.0000",
      "portfolioTotPercOfPort": "100.0000000000000000000000000000000"
    }
  ]
}
*/