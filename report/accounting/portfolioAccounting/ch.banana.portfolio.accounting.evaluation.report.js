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
// @description = Evaluation of Portfolio
// @task = app.command
// @doctype = 100.*
// @publisher = Banana.ch SA
// @pubdate = 2021-04-14
// @inputdatasource = none
// @timeout = -1
// @includejs = ch.banana.portfolio.accounting.calculation.methods.js

/**
 * 
 * This report is currently available only for base accounting, without other currencies.
 */


function addTableBaSAppraisal(report) {
    let current_date = new Date();
    current_date = Banana.Converter.toInternalDateFormat(current_date);
    var table_bas_appraisal = report.addTable('myAppraisalTable');
    table_bas_appraisal.setStyleAttributes("width:100%;");
    //columns definition
    table_bas_appraisal.addColumn("Type/Security").setStyleAttributes("width:15%");
    table_bas_appraisal.addColumn("ISIN").setStyleAttributes("width:15%");
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
    let caption = table_bas_transactions_details.getCaption().addText(qsTr("Portfolio Transactions \n Transactions as of: " + current_date), "styleTitles");
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

function printReport(appraisalDataList, portfolioTrData, comboboxParam) {

    //creates a new report
    let report = Banana.Report.newReport("Portfolio Evaluation Report");
    //add appraisal table
    let appraisalTable = addTableBaSAppraisal(report);
    let rowColorIndex = 0;//to know whether a line is odd or even.
    let isEven = false;
    let rowStyle = "";

    //APPRAISAL REPORT
    for (var key in appraisalDataList.secType) {
        let secType = appraisalDataList.secType[key];
        var tableRow = appraisalTable.addRow("");
        tableRow.addCell(secType.type, 'styleDescrTotals');
        tableRow.addCell('', '', 9);
        //sort the results before printing them
        if (secType.data && secType.data.length >= 1)
            secType.data.setSortParam(comboboxParam);
        //Define the style for the values taken as reference for the data sorting
        let styleMarketValue = setSortedColumnStyle(comboboxParam, 'Market Value');
        let stylePerPorfolio = setSortedColumnStyle(comboboxParam, 'Percentage of Portfolio');
        let styleCurrentQt = setSortedColumnStyle(comboboxParam, 'Quantity');
        //define cell styles for the value
        //print data
        for (var e in secType.data) {
            isEven = checkIfNumberisEven(rowColorIndex);
            if (isEven)
                rowStyle = "styleEvenRows";
            else
                rowStyle = "styleOddRows";

            var tableRow = appraisalTable.addRow(rowStyle);
            let sec = secType.data[e];
            tableRow.addCell(sec.description, '');
            tableRow.addCell(sec.item, 'styleNormalAmount');
            tableRow.addCell(Banana.Converter.toLocaleNumberFormat(sec.currentQt, 0, true), styleCurrentQt);
            tableRow.addCell(Banana.Converter.toLocaleNumberFormat(sec.avgCost, 2, true), 'styleNormalAmount');
            tableRow.addCell(Banana.Converter.toLocaleNumberFormat(sec.totalCost, 2, true), 'styleNormalAmount');
            tableRow.addCell(Banana.Converter.toLocaleNumberFormat(sec.marketPrice, 2, true), 'styleNormalAmount');
            tableRow.addCell(Banana.Converter.toLocaleNumberFormat(sec.marketValue, 2, true), styleMarketValue);
            tableRow.addCell(Banana.Converter.toLocaleNumberFormat(sec.percOfPort, 2, true), stylePerPorfolio);
            tableRow.addCell(Banana.Converter.toLocaleNumberFormat(sec.unGainLoss, 2, true), 'styleNormalAmount');
            tableRow.addCell(Banana.Converter.toLocaleNumberFormat(sec.percGL, 2, true), 'styleNormalAmount');

            rowColorIndex++;
        }
        //print totals
        if (secType.type) {
            var tableRow = appraisalTable.addRow("rowStyle");
            tableRow.addCell("Totals", 'styleDescrTotals');
            tableRow.addCell("", '', 3);
            tableRow.addCell(Banana.Converter.toLocaleNumberFormat(secType.totalCostSum, 2, true), 'styleTotalAmount');
            tableRow.addCell("", '', 1);
            tableRow.addCell(Banana.Converter.toLocaleNumberFormat(secType.marketValueSum, 2, true), 'styleTotalAmount');
            tableRow.addCell(Banana.Converter.toLocaleNumberFormat(secType.percOfPortSum, 2, true), 'styleTotalAmount');
            tableRow.addCell(Banana.Converter.toLocaleNumberFormat(secType.unGainLossSum, 2, true), 'styleTotalAmount');
            tableRow.addCell(Banana.Converter.toLocaleNumberFormat(secType.percGLSum, 2, true), 'styleTotalAmount');
        }
    }

    report.addPageBreak();

    //add portfolio transactions table
    let transactionsTable = addTableBaSTransactions(report);
    //reset row color index to zero
    rowColorIndex = 0;

    //PORTFOLIO TRANSACTIONS REPORT
    for (var key in portfolioTrData.data) {
        let trElement = portfolioTrData.data[key];
        var tableRow = transactionsTable.addRow("");
        tableRow.addCell(trElement.item, 'styleDescrTotals');
        tableRow.addCell('', '', 8);
        if (trElement.transactions && trElement.transactions.length >= 1) {
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
                tableRow.addCell(Banana.Converter.toLocaleNumberFormat(transaction.unitPrice, 0, false), 'styleNormalAmount');
                tableRow.addCell(Banana.Converter.toLocaleNumberFormat(transaction.amount, 2, false), 'styleNormalAmount');

                rowColorIndex++;
            }
        }

    }

    return report;

}

function getQtStyle(qt) {
    var style = "";
    var sign = Banana.SDecimal.sign(qt);

    if (sign == -1)
        style = 'styleNegativeAmount';
    else
        style = 'styleTablesBasResults';

    return style;
}

function setSortedColumnStyle(comboboxParam, value) {
    if (comboboxParam) {
        var style = "";
        if (comboboxParam === value) {
            style = "styleSortedByColumn";
            return style;
        } else {
            style = "styleNormalAmount";
            return style;
        }
    } else
        return 'styleNormalAmount';
}

function getAppraisalData(banDoc, docInfo, itemsData) {
    let appraisalData = {};
    let secTypesList = getSecurityTypesList(itemsData);//list of groups into which the titles in the items table are grouped

    let d = new Date();//save the current date
    appraisalData.date = d.getDate();
    appraisalData.secType = getAppraisalDataList(banDoc, docInfo, secTypesList, itemsData);

    return appraisalData;

}

function getAppraisalDataList(banDoc, docInfo, secTypesList, itemsData) {

    let appraisalDataList = [];
    let journal = banDoc.journal(banDoc.ORIGINTYPE_CURRENT, banDoc.ACCOUNTTYPE_NONE);
    let journalData = getJournalData(docInfo, journal);

    //For each group I create an object that will contain the movements of the titles concerning the group
    for (var i = 0; i < secTypesList.length; i++) {
        secType = {};
        secType.type = secTypesList[i];
        secType.data = getAppraisalDataList_transactions(banDoc, docInfo, itemsData, journalData, secTypesList[i]);
        //calculate portfolio percentage for each transactions and then totals for each type
        getAppraisalDataList_portfolioPercentage(secType.data);
        getAppraisalDataList_calculateTotals(secType, secType.data);
        if (secType) {
            appraisalDataList.push(secType);
        }
    }

    return appraisalDataList;
}

function getAppraisalDataList_transactions(banDoc, docInfo, itemsData, journalData, sumInName) {
    let appraisalDataListTrans = [];
    for (var key in itemsData) {
        if (itemsData[key].sumIn === sumInName) {
            itemAccount = getItemValue(itemsData, itemsData[key].item, "account");//get the account of the item
            accountCard = banDoc.currentCard(itemAccount);
            /**
             * getAccountCardData = Per ogni item ritorna una scheda "item" creata partendo dalla scheda conto del conto associato a quell item.
             */
            let accountCardData = getAccountCardData(docInfo, itemsData[key].item, accountCard);
            let appraisalData = {};
            appraisalData.item = itemsData[key].item;
            appraisalData.description = itemsData[key].description;
            appraisalData.currentQt = itemsData[key].currentQt;
            //get the average cost
            appraisalData.avgCost = "";
            /**
             * getItemCardDataList = Aggiunge info all'oggetto accountCardData, tra cui il book value
             */
            let itemCardData = getItemCardDataList(accountCardData, journalData);
            //Banana.Ui.showText(JSON.stringify(itemCardData));
            if (itemCardData.length >= 1) {
                appraisalData.avgCost = itemCardData.slice(-1)[0].accAvgCost;
                //Banana.console.debug(itemCardData.slice(-1)[0].accAvgCost);
            }
            appraisalData.totalCost = Banana.SDecimal.multiply(appraisalData.currentQt, appraisalData.avgCost);
            /**
             * If market price is not present, we put the average also as market price.
             * In this way  the gain or loss will be zero
             */
            itemsData[key].unitPriceCurrent ? appraisalData.marketPrice = itemsData[key].unitPriceCurrent : appraisalData.marketPrice = appraisalData.avgCost;
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

function getSecurityTypesList(itemsData) {
    let secTypesList = new Set();
    for (var key in itemsData) {
        if (itemsData[key].sumIn) {
            secTypesList.add(itemsData[key].sumIn);
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
    let portfolioTotalAmount = getPortfolioSum(appraisalDataList);

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
function getPortfolioSum(appraisalDataList) {
    let portSum = "";

    //sum the elements mapped in the new array items and returns the value.
    portSum = appraisalDataList.map(item => parseInt(item.marketValue)).reduce((prev, curr) => prev + curr, 0);

    return portSum;

}

/**
 * 
 * @param {*} appraisalDataList the appraisalDataList object
 * @param {*} arrayData the array with the data to sum.
 * @returns 
 */
function getAppraisalDataList_calculateTotals(appraisalDataList, arrayData) {
    appraisalDataList.totalCostSum = "";
    appraisalDataList.marketValueSum = "";
    appraisalDataList.percOfPortSum = "";
    appraisalDataList.unGainLossSum = "";
    appraisalDataList.percGLSum = "";

    //get the sums
    let totalCostSum = arrayData.map(item => parseFloat(item.totalCost)).reduce((prev, curr) => prev + curr, 0);
    let marketValueSum = arrayData.map(item => parseFloat(item.marketValue)).reduce((prev, curr) => prev + curr, 0);
    let percOfPortSum = arrayData.map(item => parseFloat(item.percOfPort)).reduce((prev, curr) => prev + curr, 0);
    let unGainLossSum = arrayData.map(item => parseFloat(item.unGainLoss)).reduce((prev, curr) => prev + curr, 0);
    let percGLSum = arrayData.map(item => parseFloat(item.percGL)).reduce((prev, curr) => prev + curr, 0);

    //reset values to string and save values as ohbect properties.
    appraisalDataList.totalCostSum = totalCostSum.toString();
    appraisalDataList.marketValueSum = marketValueSum.toString();
    appraisalDataList.percOfPortSum = percOfPortSum.toString();
    appraisalDataList.unGainLossSum = unGainLossSum.toString();
    appraisalDataList.percGLSum = percGLSum.toString();


    return appraisalDataList;
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

/**
 *  Create the parameters of the settings dialog
 */
function convertParam(userParam) {

    var convertedParam = {};
    convertedParam.version = '1.0';
    /* array of script's parameters */
    convertedParam.data = [];

    var currentParam = {};
    currentParam.name = 'sort_items_by';
    currentParam.title = 'Sort Holdings by';
    currentParam.type = 'combobox';
    currentParam.items = ['Market Value', 'Percentage of Portfolio', 'Quantity'];
    currentParam.value = userParam.sort_items_by ? userParam.sort_items_by : userParam.sort_items_by;
    currentParam.editable = true;
    currentParam.readValue = function () {
        userParam.sort_items_by = this.value;
    }
    convertedParam.data.push(currentParam);

    return convertedParam;

}
/**
 * This function sorts the items according to what the user has chosen in the dialog 
 * @param {*} a 
 * @param {*} b 
 * @returns items ordered 
 */
Array.prototype.setSortParam = function (userParam) {
    function compare(a, b) {

        switch (userParam) {
            case "Market Value":
                return b.marketValue - a.marketValue;
                break;
            case "Percentage of Portfolio":
                return b.percOfPort - a.percOfPort;
                break;
            case "Quantity":
                return b.currentQt - a.currentQt;
                break;
        }
    }
    this.sort(compare);
}

function getComboBoxElement() {

    var market_value = qsTr("Market Value");
    var quantity = qsTr("Quantity");
    var perc_of_port = qsTr("Percentage of Portfolio");

    //The formeters of the period that we need

    var combobox_value = "";
    //Read script settings
    var data = Banana.document.getScriptSettings();

    //Check if there are previously saved settings and read them
    if (data.length > 0) {
        var readSettings = JSON.parse(data);
        //We check if "readSettings" is not null, then we fill the formeters with the values just read
        if (readSettings) {
            combobox_value = readSettings;
        }
    }
    //A dialog window is opened asking the user to insert the desired period. By default is the accounting period

    var selected_value = Banana.Ui.getItem("Sort by", "Choose a value", [market_value, quantity, perc_of_port], combobox_value, false);

    //We take the values entered by the user and save them as "new default" values.
    //This because the next time the script will be executed, the dialog window will contains the new values.
    if (selected_value) {
        combobox_value = selected_value;
        //Save script settings
        var valueToString = JSON.stringify(combobox_value);
        Banana.document.setScriptSettings(valueToString);
    } else {
        //User clicked cancel
        return;
    }
    return combobox_value;
}

function exec(inData, options) {

    let banDoc = Banana.document;
    let docInfo = getDocumentInfo(banDoc);

    if (isMultiCurrency(banDoc) || !verifyBananaVersion())
        return "@Cancel";

    var comboboxParam = getComboBoxElement();
    if (!comboboxParam)
        return;

    //get the items table data
    let itemsData = getItemsTableData(banDoc, docInfo);
    //get the appraisal data list
    let appraisalDataList = getAppraisalData(banDoc, docInfo, itemsData);
    //get the transactionsList
    let portfolioTrData = getportfolioTrData(banDoc, docInfo, itemsData);
    var report = printReport(appraisalDataList, portfolioTrData, comboboxParam);
    getReportHeader(report, docInfo);
    var stylesheet = getReportStyle();
    Banana.Report.preview(report, stylesheet);


}

/*example  Appraisal data structure
var appraisalData={
    "date":"date",
    "securityTypes":[
        {
            "Type":"Stocks",
            "data":[
                {
                "item":"IT0005239360",
                "Quantity Balance":"",
                "Current Avg cost":"",
                "Currency":"",
                "Total Cost":"",
                "MarketPrice":"",
                "MarketValue":"",
                "PercOfPort":"",
                "UnrealizedGainOrLoss":"",
                "PercGL":"",
                },
                {
                "item":"CH003886335",
                "Quantity Balance":"",
                "Current Avg cost":"",
                "Currency":"",
                "Total Cost":"",
                "MarketPrice":"",
                "MarketValue":"",
                "PercOfPort":"",
                "UnrealizedGainOrLoss":"",
                "PercGL":"",
                },
            ],
            "totalCost":"",
            "totalMarketValue":"",
            "totalPerOfPort":"",
            "totalUnGainOrLoss":"",
            "totalGl":"",
            
        },
        {
            "Type":"Bonds",
            "data":[
                {
                "item":"IT0005239360",
                "Quantity Balance":"",
                "Current Avg cost":"",
                "Currency":"",
                "Total Cost":"",
                "MarketPrice":"",
                "MarketValue":"",
                "PercOfPort":"",
                "UnrealizedGainOrLoss":"",
                "PercGL":"",
                },
                {
                "item":"CH003886335",
                "Quantity Balance":"",
                "Current Avg cost":"",
                "Currency":"",
                "Total Cost":"",
                "MarketPrice":"",
                "MarketValue":"",
                "PercOfPort":"",
                "UnrealizedGainOrLoss":"",
                "PercGL":"",
                },
            ],
            "totalCost":"",
            "totalMarketValue":"",
            "totalPerOfPort":"",
            "totalUnGainOrLoss":"",
            "totalGl":""
        }
    ]
}*/

/*example portfolio transactions data structure
var appraisalData={
    "date":"currentDate",
    "data":[
        {
            item:"CH003886335",
            transactions:[
                {
                    "date":"",
                    "Doc":"",
                    "Item":"",
                    "Description":"",
                    "Debit":"",
                    "Credit":"",
                    "Qt":"",
                    "UnitPrice":""

                },
                {
                    "date":"",
                    "Doc":"",
                    "Item":"",
                    "Description":"",
                    "Debit":"",
                    "Credit":"",
                    "Qt":"",
                    "UnitPrice":""

                }
            ]
        },
            item:"CH012775214",
            transactions:[
                {
                    "date":"",
                    "Doc":"",
                    "Item":"",
                    "Description":"",
                    "Debit":"",
                    "Credit":"",
                    "Qt":"",
                    "UnitPrice":""

                },
                {
                    "date":"",
                    "Doc":"",
                    "Item":"",
                    "Description":"",
                    "Debit":"",
                    "Credit":"",
                    "Qt":"",
                    "UnitPrice":""

                }
            ]
    ]
}*/