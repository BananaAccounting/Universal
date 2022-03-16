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
// @id = ch.banana.portfolio.accounting.reconciliation.report.js
// @description = Reconciliation
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

function exec(inData, options) {

    var banDoc=Banana.document;

    if (!verifyBananaVersion())
        return "@Cancel";


    var docInfo="";
    var itemsData="";
    var dlgLabel="Accounts Name (separated by semicolon ';')";
    var dlgTitle="Enter accounts for reconciliation";
    var scriptId="ch.banana.portfolio.accounting.riconciliation.report.js";
    var userParam = "";
    var accountsList=[];
    var reconciliationData={};
    reconciliationData.date=new Date();
    var accountsDataList=[];

    userParam=getComboBoxElement(scriptId,dlgTitle,dlgLabel);
    if(userParam)
        accountsList=userParam.split(";");
    else
        return false;

    docInfo=getDocumentInfo(banDoc);
    //let transactionsData=getTransactionsTableData(banDoc,docInfo);
    itemsData=getItemsTableData(banDoc,docInfo);

    //Get Secrurity account data.
    accountsDataList=getAccountsDataList(banDoc,docInfo,accountsList,itemsData); //ritorna l'array con tutti i conti.
    //Insert the data into the reconciliation obj.
    reconciliationData.data=accountsDataList;

    var report = printReport(reconciliationData,docInfo);
    getReportHeader(report,docInfo);
    var stylesheet = getReportStyle();
    Banana.Report.preview(report, stylesheet);


}

function getConciliationTable(report,currentDate,docInfo){
    currentDate=Banana.Converter.toInternalDateFormat(currentDate);
    var tableConc = report.addTable('myTable');

    tableConc.setStyleAttributes("width:100%;");
    tableConc.getCaption().addText(qsTr("Securities Reconciliation Report, Data as of: "+Banana.Converter.toLocaleDateFormat(currentDate)), "styleTitles");

    //columns definition 
    tableConc.addColumn("Account").setStyleAttributes("width:15%");
    tableConc.addColumn("Item").setStyleAttributes("width:15%");
    tableConc.addColumn("Date").setStyleAttributes("width:10%");
    tableConc.addColumn("Doc").setStyleAttributes("width:10%");
    tableConc.addColumn("Description").setStyleAttributes("width:35%");
    if(docInfo.isMultiCurrency){
        tableConc.addColumn("Debit (Item Currency)").setStyleAttributes("width:15%");
        tableConc.addColumn("Credit (Item Currency)").setStyleAttributes("width:15%");
        tableConc.addColumn("Balance (Item Currency)").setStyleAttributes("width:15%");
    }
    tableConc.addColumn("Debit (Base Currency)").setStyleAttributes("width:15%");
    tableConc.addColumn("Credit (Base Currency)").setStyleAttributes("width:15%");
    tableConc.addColumn("Balance (Base Currency)").setStyleAttributes("width:15%");
    tableConc.addColumn("Quantity").setStyleAttributes("width:15%");
    tableConc.addColumn("Unit Price").setStyleAttributes("width:15%");
    tableConc.addColumn("Quantity Balance").setStyleAttributes("width:15%");
    tableConc.addColumn("Current Average Cost").setStyleAttributes("width:15%");
    
    //headers
    var tableHeader = tableConc.getHeader();
    var tableRow = tableHeader.addRow();
    tableRow.addCell("Account", "styleTablesHeaderText");
    tableRow.addCell("Item", "styleTablesHeaderText");
    tableRow.addCell("Date", "styleTablesHeaderText");
    tableRow.addCell("Doc", "styleTablesHeaderText");
    tableRow.addCell("Description", "styleTablesHeaderText");
    if(docInfo.isMultiCurrency){
        tableRow.addCell("Debit\nItem Currency", "styleTablesHeaderText");
        tableRow.addCell("Credit\nItem Currency", "styleTablesHeaderText");
        tableRow.addCell("Balance\nItem Currency", "styleTablesHeaderText");
    }
    tableRow.addCell("Debit "+docInfo.baseCurrency, "styleTablesHeaderText");
    tableRow.addCell("Credit "+docInfo.baseCurrency, "styleTablesHeaderText");
    tableRow.addCell("Balance "+docInfo.baseCurrency, "styleTablesHeaderText");
    tableRow.addCell("Quantity ", "styleTablesHeaderText");
    tableRow.addCell("Unit Price ", "styleTablesHeaderText");
    tableRow.addCell("Quantity balance", "styleTablesHeaderText");
    tableRow.addCell("Current.\nAverage cost\n", "styleTablesHeaderText");

    return tableConc;
}

/**
 * sets and returns an object containing the properties with the values for the span being printed. 
 * The values change depending on the type of accounts:
 * -Double-entry
 * -Double-entry with Multi-currency
 * Basically with a multy currency accounting we have three more columns.
 */
function setSpanObject(docInfo){
    var spanObj={};
    if(docInfo.isMultiCurrency){
        spanObj.allTable=15;
        spanObj.itemId=14;
        spanObj.afterTotals=5;
    }else{
        spanObj.allTable=12;
        spanObj.itemId=11;
        spanObj.afterTotals=4;
    }

    return spanObj;
}

/**
 * Print the report.
 * @param {*} reconciliationData the data.
 */
function printReport(reconciliationData,docInfo){

    //create the report
    var report = Banana.Report.newReport("Reconciliation Report");
    var currentDate=new Date();
    let spanObj=setSpanObject(docInfo);
    //add Reconciliation table
    var concData=reconciliationData.data;
    var tabConc = getConciliationTable(report,currentDate,docInfo);
    let rowColorIndex=0;//to know whether a line is odd or even.
    let isEven=false;
    let rowStyle="";

    //Print the data.
    for(var a in concData){
        var tableRow = tabConc.addRow("styleTableRows");
        tableRow.addCell(concData[a].account, 'styleDescrTotals',spanObj.allTable);
        var items=concData[a].items;
        for(var i in items){
            var item=items[i];
            var itemTr=item.itemCardData;
            var tableRow = tabConc.addRow("styleTableRows");
            tableRow.addCell("", "");
            tableRow.addCell(item.item, '',spanObj.itemId);
            for(var t in itemTr){//loop trough all the transactions for this item
                isEven=checkIfNumberisEven(rowColorIndex);
                if(isEven)
                    rowStyle="styleEvenRows";
                else
                    rowStyle="styleOddRows";
                var tableRow = tabConc.addRow(rowStyle);
                tableRow.addCell("", "");
                tableRow.addCell("", "");
                tableRow.addCell(Banana.Converter.toLocaleDateFormat(itemTr[t].date), 'styleAlignCenter');
                tableRow.addCell(itemTr[t].doc, 'styleAlignCenter');
                tableRow.addCell(itemTr[t].description, '');
                if(docInfo.isMultiCurrency){
                    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itemTr[t].debitCurr,2,false), "styleNormalAmount");
                    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itemTr[t].creditCurr,2,false), "styleNormalAmount");
                    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itemTr[t].balanceCurr,2,false), "styleNormalAmount");
                }
                tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itemTr[t].debitBase,2,false), "styleNormalAmount");
                tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itemTr[t].creditBase,2,false), "styleNormalAmount");
                tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itemTr[t].balanceBase,2,false), "styleNormalAmount");
                tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itemTr[t].qt,2,false), "styleNormalAmount");
                tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itemTr[t].unitPrice,2,false), "styleNormalAmount");
                tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itemTr[t].qtBalance,2,false), "styleNormalAmount");
                tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itemTr[t].accAvgCost,2,false), "styleNormalAmount");

                rowColorIndex++;
            }
            //add the item balance.
            var tableRow = tabConc.addRow("styleTableRows");
            tableRow.addCell("", "",2);
            tableRow.addCell(Banana.Converter.toLocaleDateFormat(currentDate), 'styleAlignCenter');
            tableRow.addCell("", "",1);
            tableRow.addCell("Balance "+item.item,"styleDescrTotals");
            if(docInfo.isMultiCurrency){
                tableRow.addCell(Banana.Converter.toLocaleNumberFormat(item.totalDebitCurr,2,true),"styleTotalAmount");
                tableRow.addCell(Banana.Converter.toLocaleNumberFormat(item.totalCreditCurr,2,true),"styleTotalAmount");
                tableRow.addCell(Banana.Converter.toLocaleNumberFormat(item.totalBalanceCurr,2,true),"styleTotalAmount");
            }
            tableRow.addCell(Banana.Converter.toLocaleNumberFormat(item.totalDebitBase,2,true),"styleTotalAmount");
            tableRow.addCell(Banana.Converter.toLocaleNumberFormat(item.totalCreditBase,2,true),"styleTotalAmount");
            tableRow.addCell(Banana.Converter.toLocaleNumberFormat(item.totalBalanceBase,2,true),"styleTotalAmount");
            tableRow.addCell("", "",2);
            tableRow.addCell(Banana.Converter.toLocaleNumberFormat(item.totalQtBalance,2,true),"styleTotalAmount");
            tableRow.addCell(Banana.Converter.toLocaleNumberFormat(item.totalCurrAvgCost,2,true),"styleTotalAmount");
            var tableRow = tabConc.addRow("styleTableRows");
            tableRow.addCell("", "",spanObj.allTable);
        }
        //add the account balance and the total transactions for the item
        var tableRow = tabConc.addRow("styleTableRows");
        tableRow.addCell("","",2);
        //opening balance
        tableRow.addCell(Banana.Converter.toLocaleDateFormat(currentDate), 'styleAlignCenter');
        tableRow.addCell("", "",1);
        tableRow.addCell("Opening Balance "+ concData[a].account,"styleDescrTotals",3);
        if(docInfo.isMultiCurrency){
            tableRow.addCell("", "",1);
            tableRow.addCell(Banana.Converter.toLocaleNumberFormat(concData[a].openBalanceCurr,2,true), 'styleTotalAmount');
        }
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(concData[a].openBalanceBase,2,true), 'styleTotalAmount');
        tableRow.addCell("", "",spanObj.afterTotals);
        //current balance
        var tableRow = tabConc.addRow("styleTableRows");
        tableRow.addCell("","",2);
        tableRow.addCell(Banana.Converter.toLocaleDateFormat(currentDate), 'styleAlignCenter');
        tableRow.addCell("", "",1);
        tableRow.addCell("Current Balance "+ concData[a].account,"styleDescrTotals",3);
        if(docInfo.isMultiCurrency){
            tableRow.addCell("", "",1);
            tableRow.addCell(Banana.Converter.toLocaleNumberFormat(concData[a].currentBalanceCurr,2,true), 'styleTotalAmount');
        }
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(concData[a].currentBalanceBase,2,true), 'styleTotalAmount');
        tableRow.addCell("", "",spanObj.afterTotals);
        //transactions total
        var tableRow = tabConc.addRow("styleTableRows");
        tableRow.addCell("","",2);
        tableRow.addCell(Banana.Converter.toLocaleDateFormat(currentDate), 'styleAlignCenter');
        tableRow.addCell("", "",1);
        tableRow.addCell("Total securities movements","styleDescrTotals",3);
        if(docInfo.isMultiCurrency){
            tableRow.addCell("", "",1);
            tableRow.addCell(Banana.Converter.toLocaleNumberFormat(concData[a].securityTrAmountCurrency,2,true), 'styleTotalAmount');
        }
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(concData[a].securityTrAmountBase,2,true), 'styleTotalAmount');
        tableRow.addCell("", "",spanObj.afterTotals);
        //difference
        var diffStyleBase=getDifferenceAmountStyle(concData[a].differenceBase);
        var diffStyleCurr=getDifferenceAmountStyle(concData[a].differenceCurr);
        var tableRow = tabConc.addRow("styleTableRows");
        tableRow.addCell("","",2);
        tableRow.addCell(Banana.Converter.toLocaleDateFormat(currentDate), 'styleAlignCenter');
        tableRow.addCell("", "",1);
        tableRow.addCell("Differences","styleDescrTotals",3);
        if(docInfo.isMultiCurrency){
            tableRow.addCell("", "",1);
            tableRow.addCell(Banana.Converter.toLocaleNumberFormat(concData[a].differenceCurr,2,true),diffStyleCurr);
        }
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(concData[a].differenceBase,2,true),diffStyleBase);
        tableRow.addCell("", "",spanObj.afterTotals);
    }

    return report;

}

function getDifferenceAmountStyle(diffAmount){

    style="styleTotalAmount";
    if(!Banana.SDecimal.isZero(diffAmount))
        style="styleTotalAmountNegative";

    return style;
}

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
/**
 * Creates an array with all the data of all the items that are registered under this account 
 * @param {*} itemsData list of items
 * @param {*} transactionsData list of transactions
 * @param {*} account ref. account.
 */
    
 function getItemsDataList(docInfo,itemsData,accountCard,journalData,account){

    let itemsDataList=[];//list of item cards
    let accountCardData="";
    let itemCardData="";

    for(var key in itemsData){
        //set the item values
        if(itemsData[key].account==account){
            let itemData={};
            itemData.item=itemsData[key].item;
            itemData.itemCardData=[];
            accountCardData=getAccountCardData(docInfo,itemsData[key].item,accountCard);
            itemCardData=getItemCardDataList(accountCardData,journalData);//returns an array of objects with the movements of the item card.
            if(itemCardData){
                itemData.itemCardData=itemCardData;
            }
            //calculate totals for the item
            itemData.totalDebitBase=getSum(accountCardData,"debitBase");
            itemData.totalCreditBase=getSum(accountCardData,"creditBase");;
            itemData.totalBalanceBase=getBalance(accountCardData,"debitBase","creditBase");
            if(docInfo.isMultiCurrency){
                itemData.totalDebitCurr=getSum(accountCardData,"debitCurr");
                itemData.totalCreditCurr=getSum(accountCardData,"creditCurr");
                itemData.totalBalanceCurr=getBalance(accountCardData,"debitCurr","creditCurr");
            }
            if(itemData.itemCardData.length>=1){
                itemData.totalQtBalance=itemData.itemCardData.slice(-1)[0].qtBalance;//I take the last calculated value
                itemData.totalCurrAvgCost=itemData.itemCardData.slice(-1)[0].accAvgCost;//I take the last calculated value
            }

            itemsDataList.push(itemData);
        }
    }
    return itemsDataList;
}

/**
 * Sums the debit and credit values taken from the list of records and returns the calculated balance
 * @param {*} itemsDataList list od item transactions
 * @param {*} debitType debit column name in base currency or debit column name in item currency
 * @param {*} creditType credit column name in base currency or credit column name in item currency
 * @returns 
 */
function calcBalanceFromTransactions(itemsDataList,debitType,creditType){
    let calcBalance="";
    for(var key in itemsDataList){
        let debit=itemsDataList.itemCardData[key][debitType];
        let credit=itemsDataList.itemCardData[key][creditType];
        calcBalance=Banana.SDecimal.add(calcBalance,credit);
        calcBalance=Banana.SDecimal.subtract(calcBalance,debit);
    }

    return calcBalance;
}

/**
 * For each account creates an object containing the open balance, the current balance and the account nr of the account
 * @param {*} banDoc 
 * @param {*} accountsList the list of the accounts defined by the user.
 */
function getAccountsDataList(banDoc,docInfo,accountsList,itemsData){
    var accDataList=[];
    let journal = "";
    let journalData="";
    let trIdList="";
    let account="";
    let accountSTableData=getAccountsTableData(banDoc,docInfo);

    journal=banDoc.journal(banDoc.ORIGINTYPE_CURRENT, banDoc.ACCOUNTTYPE_NONE);
    journalData=getJournalData(docInfo,journal);
    trIdList=getTransactionsIdList(journalData);


    for(var i=0;i<accountsList.length;i++){
        account=findElement(banDoc,accountsList[i],accountSTableData,"account","Accounts Table");//look for the account in the account table
        var itemsDataList=[];
        var accData={};
        var accBalance={};
        let accountCard=banDoc.currentCard(account);//get the account card

        accBalance=banDoc.currentBalance(account);

        accData.account=account;
        accData.openBalanceBase=accBalance.opening;
        accData.openBalanceCurr=accBalance.openingCurrency;
        accData.currentBalanceBase=accBalance.balance;
        accData.currentBalanceCurr=accBalance.balanceCurrency;
        accData.currency="";

        //get the items data.
        itemsDataList=getItemsDataList(docInfo,itemsData,accountCard,journalData,accData.account); //ritorna l'array di items con questo account.
        accData.items=itemsDataList;

        //get total amount of balances calculated for the various items.
        accData.securityTrAmountBase=sumBalances(itemsDataList,"totalBalanceBase");
        accData.securityTrAmountCurrency=sumBalances(itemsDataList,"totalBalanceCurr");

        //difference between the securities transactions and the account balance (should be 0).
        accData.differenceBase=Banana.SDecimal.subtract(accData.securityTrAmountBase,accData.currentBalanceBase);
        accData.differenceCurr=Banana.SDecimal.subtract(accData.securityTrAmountCurrency,accData.currentBalanceCurr);

        accDataList.push(accData);

    }

    return accDataList;
}

/**
 * Sums the balances of each item
 */
function sumBalances(itemsDataList,property){
    var sum="";

    for(var key in itemsDataList){
        sum=Banana.SDecimal.add(sum,itemsDataList[key][property]);
    }
    return sum;

}


//esempio struttura dati.
var reconciliationData={
    "date":"date",
    "data":[
        {
            "account":"1400",
            "accountOpeningBase":"500.00",
            "accountBalanceBase":"500.00",
            "accountOpeningCurr":"500.00",
            "accountBalanceCurr":"500.00",
            "currency":"CHF",
            "items":[// list of the item cards
                {
                "item":"IT0005239360",
                "itemCardData":[
                    {
                    "TransactionType":"Purchase",
                    "date":"",
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
                },
                {
                "item":"IT0005239360",
                "itemCardData":[
                    {
                    "TransactionType":"Purchase",
                    "date":"",
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

                }
            ],
            "securitiesTransactionsAmount":"500",
            "difference":"" //should be zero.
        },
        {
            "account":"1401",
            "opening":"0.00",
            "accountBalance":"200.00",
            "currency":"EUR",
            "items":[
                {
                    "item":"IT0005239360",
                    "transactions":[
                        {
                        "description":"",
                        "qt":"",
                        "price":"",//in the account currency
                        "amountBase":"",
                        "balanceBase":"",
                        "amountCurr":"",
                        "balanceCurr":"",
                        "qtBalance":"",
                        }
                    ]

                }
            ],
            "securitiesTransactionsAmount":"1000"
        }
    ]

}