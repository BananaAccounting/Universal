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

    if (!banDoc)
    return "@Cancel";


    var docInfo="";
    var transactionsData="";
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
    transactionsData=getTransactionsTableData(banDoc);
    itemsData=getItemsTableData(docInfo);

    //Get Secrurity account data.
    accountsDataList=getAccountsDataList(banDoc,accountsList,itemsData,transactionsData); //ritorna l'array con tutti i conti.
    //Insert the data into the reconciliation obj.
    reconciliationData.data=accountsDataList;

    //Banana.Ui.showText(JSON.stringify(reconciliationData));

    var report = printReport(reconciliationData,docInfo);
    getReportHeader(report,docInfo);
    var stylesheet = getReportStyle();
    Banana.Report.preview(report, stylesheet);


}

function getConciliationTable(report,currentDate){
    currentDate=Banana.Converter.toInternalDateFormat(currentDate);
    var tableConc = report.addTable('myTableConc');
    tableConc.setStyleAttributes("width:100%;");
    tableConc.getCaption().addText(qsTr("Securities Reconciliation Report \n Data as of: "+Banana.Converter.toLocaleDateFormat(currentDate)), "styleTitles");

    //columns definition 
    tableConc.addColumn("Account").setStyleAttributes("width:15%");
    tableConc.addColumn("Asset").setStyleAttributes("width:15%");
    tableConc.addColumn("Date").setStyleAttributes("width:15%");
    tableConc.addColumn("Description").setStyleAttributes("width:30%");
    tableConc.addColumn("Quantity").setStyleAttributes("width:15%");
    tableConc.addColumn("Price (base/account Currency)").setStyleAttributes("width:15%");
    tableConc.addColumn("Amount (base Currency)").setStyleAttributes("width:20%");
    tableConc.addColumn("Balance (base Currency)").setStyleAttributes("width:20%");
    tableConc.addColumn("Amount (account Currency)").setStyleAttributes("width:20%");
    tableConc.addColumn("Balance (account Currency)").setStyleAttributes("width:20%");
    tableConc.addColumn("Quantity Balance").setStyleAttributes("width:15%");
    
    //headers
    var tableHeader = tableConc.getHeader();
    var tableRow = tableHeader.addRow();
    tableRow.addCell("Account", "styleTablesHeaderText");
    tableRow.addCell("Asset", "styleTablesHeaderText");
    tableRow.addCell("Date", "styleTablesHeaderText");
    tableRow.addCell("Description", "styleTablesHeaderText");
    tableRow.addCell("Quantity", "styleTablesHeaderText");
    tableRow.addCell("Price", "styleTablesHeaderText");
    tableRow.addCell("Amount (base curr.)", "styleTablesHeaderText");
    tableRow.addCell("Balance (base curr.)", "styleTablesHeaderText");
    tableRow.addCell("Amount (acc. curr.)", "styleTablesHeaderText");
    tableRow.addCell("Balance (acc. curr.)", "styleTablesHeaderText");
    tableRow.addCell("Quantity Balance", "styleTablesHeaderText");

    return tableConc;
}

/**
 * Print the report.
 * @param {*} reconciliationData the data.
 */
function printReport(reconciliationData,docInfo){

    //create the report
    var report = Banana.Report.newReport("Reconciliation Report");
    var currentDate=new Date();
    //add Reconciliation table
    var concData=reconciliationData.data;
    var tabConc = getConciliationTable(report,currentDate);

    //Print the data.
    for(var a in concData){
        var tableRow = tabConc.addRow("styleTableRows");
        tableRow.addCell(concData[a].account, 'styleSummaryRows',11);
        var items=concData[a].items;
        for(var i in items){
            var item=items[i];
            var itemTr=item.transactions
            var tableRow = tabConc.addRow("styleTableRows");
            tableRow.addCell("", "");
            tableRow.addCell(item.item, '',10);
            for(var t in itemTr){//loop trough all the transactions for this item
                var tableRow = tabConc.addRow("styleTableRows");
                tableRow.addCell("", "");
                tableRow.addCell("", "");
                tableRow.addCell(Banana.Converter.toLocaleDateFormat(itemTr[t].date), '');
                tableRow.addCell(itemTr[t].description, '');
                tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itemTr[t].qt,0,false), "styleNormalAmount");
                tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itemTr[t].unitPrice,2,false), "styleNormalAmount");
                tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itemTr[t].amountBase,2,true), "styleNormalAmount");
                tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itemTr[t].balanceBase,2,true), "styleNormalAmount");
                tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itemTr[t].amountCurr,2,true), "styleNormalAmount");
                tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itemTr[t].balanceCurr,2,true), "styleNormalAmount");
                tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itemTr[t].qtBalance,2,false), "styleNormalAmount");
            }
            //add the item balance.
            var tableRow = tabConc.addRow("styleTableRows");
            tableRow.addCell("", "",2);
            tableRow.addCell(Banana.Converter.toLocaleDateFormat(currentDate), '');
            tableRow.addCell("Balance "+item.item,"styleDescrTotals",4);
            tableRow.addCell(Banana.Converter.toLocaleNumberFormat(item.balanceBase,2,true),"styleTotalAmount");
            tableRow.addCell("", "",1);
            tableRow.addCell(Banana.Converter.toLocaleNumberFormat(item.balanceCurr,2,true),"styleTotalAmount");
            tableRow.addCell("", "");
            var tableRow = tabConc.addRow("styleTableRows");
            tableRow.addCell("", "",11);
        }
        //add the account balance and the total transactions for the item
        var tableRow = tabConc.addRow("styleTableRows");
        tableRow.addCell("","",2);
        //opening balance
        tableRow.addCell(Banana.Converter.toLocaleDateFormat(currentDate), '');
        tableRow.addCell("Opening Balance "+ concData[a].account,"styleDescrTotals",4);
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(concData[a].openBalanceBase,2,true), 'styleTotalAmount');
        tableRow.addCell("", "",1);
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(concData[a].openBalanceCurr,2,true), 'styleTotalAmount');
        tableRow.addCell("", "");
        //current balance
        var tableRow = tabConc.addRow("styleTableRows");
        tableRow.addCell("","",2);
        tableRow.addCell(Banana.Converter.toLocaleDateFormat(currentDate), '');
        tableRow.addCell("Current Balance "+ concData[a].account,"styleDescrTotals",4);
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(concData[a].currentBalanceBase,2,true), 'styleTotalAmount');
        tableRow.addCell("", "",1);
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(concData[a].currentBalanceCurr,2,true), 'styleTotalAmount');
        tableRow.addCell("", "");
        //transactions total
        var tableRow = tabConc.addRow("styleTableRows");
        tableRow.addCell("","",2);
        tableRow.addCell(Banana.Converter.toLocaleDateFormat(currentDate), '');
        tableRow.addCell("Total securities movements","styleDescrTotals",4);
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(concData[a].securityTrAmountBase,2,true), 'styleTotalAmount');
        tableRow.addCell("", "",1);
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(concData[a].securityTrAmountCurrency,2,true), 'styleTotalAmount');
        tableRow.addCell("", "");
        //difference
        var diffStyleBase=getDifferenceAmountStyle(concData[a].differenceBase);
        var diffStyleCurr=getDifferenceAmountStyle(concData[a].differenceCurr);
        var tableRow = tabConc.addRow("styleTableRows");
        tableRow.addCell("","",2);
        tableRow.addCell(Banana.Converter.toLocaleDateFormat(currentDate), '');
        tableRow.addCell("Differences","styleDescrTotals",4);
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(concData[a].differenceBase,2,true),diffStyleBase);
        tableRow.addCell("", "",1);
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(concData[a].differenceCurr,2,true),diffStyleCurr);
        tableRow.addCell("", "");
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
    
 function getItemsDataList(itemsData,transactionsData,account){

    var itemsDataList=[];

    for(var key in itemsData){
        if(account==itemsData[key].account){ //i want to take the transactions related only to the account gave as parameter.
            var itemData={};
            itemData.item="";
            itemData.transactions=[];

            itemData.item=itemsData[key].item;
            itemData.transactions=getItemRelatedTransactions(itemsData[key].item,transactionsData,account);
            if(itemData.transactions){
                itemData.balanceBase=sumArrayElements(itemData.transactions,"amountBase");
                itemData.balanceCurr=sumArrayElements(itemData.transactions,"amountCurr");
            }

            itemsDataList.push(itemData);
        }
    }
    return itemsDataList;
}

/**
 * Get the transactions related to the item passed as parameter
 * @param {*} item 
 * @param {*} transactionsData 
 * @returns 
 */
function getItemRelatedTransactions(item,transactionsData,itemAccount){
    var transactions=[];
    var  qtBalance="";
    var amountBalanceBase="";
    var amountBalanceCurr="";

    for(var key in transactionsData){
        if(transactionsData[key].item.includes(item)){
            var trData={};
            trData.date=transactionsData[key].date;
            trData.description=transactionsData[key].description;
            trData.qt=transactionsData[key].qt;
            qtBalance=Banana.SDecimal.add(qtBalance,trData.qt);
            trData.qtBalance=qtBalance;
            trData.unitPrice=transactionsData[key].unitPrice;
            trData.amountBase=setSign(transactionsData[key].amountBase,trData.qt,transactionsData[key].debit,itemAccount);
            trData.amountCurr=setSign(transactionsData[key].amountCurr,trData.qt,transactionsData[key].debit,itemAccount);
            amountBalanceBase=Banana.SDecimal.add(amountBalanceBase,trData.amountBase);
            amountBalanceCurr=Banana.SDecimal.add(amountBalanceCurr,trData.amountCurr);
            trData.balanceBase=amountBalanceBase;
            trData.balanceCurr=amountBalanceCurr;
            transactions.push(trData);
        }
    }
    return transactions;
}

/**
 * Sets the negative sign to those amounts that represent a decrease in the value of the securities account.
 * Decreases are recognised in the thank you entries:
 * -The negative quantity in the quantity column, i.e. a sale of securities.
 * -To losses on the sale, in this case I have recorded the loss in a debit account.
 * 
 * @param {*} amount
 * @param {*} qt 
 * @param {*} debitAcc 
 */
function setSign(amount,qt,debitAcc,itemAccount){
    var newAmount="";

    if(!amount){
        return newAmount;
    }

    if(itemAccount!==debitAcc && ((qt.includes("-"))|| debitAcc!=="" && qt=="")){ //control to be reviewed.
        newAmount="-"+amount;
        return newAmount;
    }

    return amount;
}

/**
 * sums the elements in the array, taking into account the values in the property passed as parameter  
 * @param {*} transactions 
 * @returns 
 */
function sumArrayElements(objArray,property){
    var sum="";

    for(var key in objArray){
        sum=Banana.SDecimal.add(sum,objArray[key][property]);
    }


    return sum;
}

/**
 * For each account creates an object containing the open balance, the current balance and the account nr of the account
 * @param {*} banDoc 
 * @param {*} accountsList the list of the accounts defined by the user.
 */
function getAccountsDataList(banDoc,accountsList,itemsData,transactionsData){
    var accDataList=[];

    for(var i=0;i<accountsList.length;i++){
        var account=accountsList[i];
        var itemsDataList=[];
        var accData={};
        var accBalance={};

        accBalance=banDoc.currentBalance(account);

        accData.account=accountsList[i];
        accData.openBalanceBase=accBalance.opening;
        accData.openBalanceCurr=accBalance.openingCurrency;
        accData.currentBalanceBase=accBalance.balance;
        accData.currentBalanceCurr=accBalance.balanceCurrency;
        accData.currency="";

        //get the items data.
        itemsDataList=getItemsDataList(itemsData,transactionsData,account); //ritorna l'array di items con questo account.
        accData.items=itemsDataList;

        //get total amount of transactions for securities registered in this account
        accData.securityTrAmountBase=sumArrayElements(itemsDataList,"balanceBase");
        accData.securityTrAmountCurrency=sumArrayElements(itemsDataList,"balanceCurr");

        //difference between the securities transactions and the account balance (should be 0).
        accData.differenceBase=Banana.SDecimal.subtract(accData.securityTrAmountBase,accData.currentBalanceBase);
        accData.differenceCurr=Banana.SDecimal.subtract(accData.securityTrAmountCurrency,accData.currentBalanceCurr);

        accDataList.push(accData);

    }

    return accDataList;
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
            "items":[
                {
                    "item":"CH003886335",
                    "account":"1400",
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
                        },
                        {
                        "description":"",
                        "qt":"",
                        "price":"",//in the account currency
                        "amountBase":"",
                        "balanceBase":"",
                        "amountCurr":"",
                        "balanceCurr":"",
                        "qtBalance":"",
                        },
                        {

                            "...":"..."
                        }
                    ],
                    "balanceBase":"1187.55",
                    "balanceCurr":"1187.55",

                },
                {
                    "item":"CH012775214",
                    "account":"1400",
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
                        },
                        {

                            "...":"..."
                        }
                    ],
                    "balanceBase":"500",
                    "balanceCurr":"500"

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