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
// @id = ch.banana.portfolio.accounting.conciliation.report.js
// @description = Conciliation
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
    var conciliationData={};
    conciliationData.date=new Date();
    var userParamList=["1400","1401","1450"];
    var accountsDataList=[];

    docInfo=getDocumentInfo(banDoc);
    transactionsData=getTransactionsTableData(banDoc,docInfo,true);
    itemsData=getItemsTableData(docInfo);

    //Get Secrurity account data.
    accountsDataList=getAccountsDataList(banDoc,userParamList,itemsData,transactionsData); //ritorna l'array con tutti i conti.
    //Insert the data into the conciliation obj.
    conciliationData.data=accountsDataList;

    //Banana.Ui.showText(JSON.stringify(conciliationData));

    var report = printReport(conciliationData);
    var stylesheet = getReportStyle();
    Banana.Report.preview(report, stylesheet);


}

function getConciliationTable(report,currentDate){
    currentDate=Banana.Converter.toInternalDateFormat(currentDate);
    var tableConc = report.addTable('myTableConc');
    tableConc.setStyleAttributes("width:100%;");
    tableConc.getCaption().addText(qsTr("Securities Conciliation Report \n Data as of: "+currentDate), "styleTitles");

    //columns definition 
    tableConc.addColumn("Account").setStyleAttributes("width:15%");
    tableConc.addColumn("Asset").setStyleAttributes("width:15%");
    tableConc.addColumn("Description").setStyleAttributes("width:20%");
    tableConc.addColumn("Quantity").setStyleAttributes("width:15%");
    tableConc.addColumn("Price").setStyleAttributes("width:15%");
    tableConc.addColumn("Amount").setStyleAttributes("width:15%");
    tableConc.addColumn("Amount Balance").setStyleAttributes("width:15%");
    tableConc.addColumn("Quantity Balance").setStyleAttributes("width:15%");
    
    //headers
    var tableHeader = tableConc.getHeader();
    var tableRow = tableHeader.addRow();
    tableRow.addCell("Account", "");
    tableRow.addCell("Asset", "");
    tableRow.addCell("Description", "");
    tableRow.addCell("Quantity", "");
    tableRow.addCell("Price", "");
    tableRow.addCell("Amount", "");
    tableRow.addCell("Amount Balance", "");
    tableRow.addCell("Quantity Balance", "");

    return tableConc;
}

/**
 * Print the report.
 * @param {*} conciliationData the data.
 */
function printReport(conciliationData){

    //create the report
    var report = Banana.Report.newReport("Conciliation Report");
    var currentDate=new Date();
    //add Conciliation table
    var tabConc = getConciliationTable(report,currentDate);
    var concData=conciliationData.data;

    //Print the data.
    for(var a in concData){
        var tableRow = tabConc.addRow("styleTableRows");
        tableRow.addCell(concData[a].account, '',8);
        var items=concData[a].items;
        for(var i in items){
            var item=items[i];
            var itemTr=item.transactions
            var tableRow = tabConc.addRow("styleTableRows");
            tableRow.addCell("", "");
            tableRow.addCell(item.item, '',7);
            for(var t in itemTr){//loop trough all the transactions for this item
                var tableRow = tabConc.addRow("styleTableRows");
                tableRow.addCell("", "");
                tableRow.addCell("", "");
                tableRow.addCell(itemTr[t].description, '');
                tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itemTr[t].qt,0,false), "styleNormalAmount");
                tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itemTr[t].unitPrice,2,false), "styleNormalAmount");
                tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itemTr[t].amount,2,false), "styleNormalAmount");
                tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itemTr[t].amountBalance,2,false), "styleNormalAmount");
                tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itemTr[t].qtBalance,2,false), "styleNormalAmount");
            }
            //add the item balance.
            var tableRow = tabConc.addRow("styleTableRows");
            tableRow.addCell("", "",1);
            tableRow.addCell("Security Balance","descrAccBalancesLevel",4);
            tableRow.addCell(Banana.Converter.toLocaleNumberFormat(item.balance,2,true),"amountAccBalancesLevel");
            tableRow.addCell("", "",3);
            var tableRow = tabConc.addRow("styleTableRows");
            tableRow.addCell("", "",8);
        }
        //add the account balance and the total transactions for the item
        var tableRow = tabConc.addRow("styleTableRows");
        tableRow.addCell("","",1);
        tableRow.addCell("Opening Balance","descrAccBalancesLevel",4);
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(concData[a].openBalance,2,true), 'amountAccBalancesLevel');
        tableRow.addCell("", "",3);
        var tableRow = tabConc.addRow("styleTableRows");
        tableRow.addCell("","",1);
        tableRow.addCell("Current Balance","descrAccBalancesLevel",4);
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(concData[a].currentBalance,2,true), 'amountAccBalancesLevel');
        tableRow.addCell("", "",3);
        var tableRow = tabConc.addRow("styleTableRows");
        tableRow.addCell("","",1);
        tableRow.addCell("Total securities movements","descrAccBalancesLevel",4);
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(concData[a].securityTrAmount,2,true), 'amountAccBalancesLevel');
        tableRow.addCell("", "",3);
        var tableRow = tabConc.addRow("styleTableRows");
        tableRow.addCell("","",1);
        tableRow.addCell("Differences","descrAccBalancesLevel",4);
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(concData[a].difference,2,true),"amountAccBalancesLevel");
        tableRow.addCell("", "",3);
    }

    return report;

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

//esempio struttura dati.
var conciliationData={
    "date":"date",
    "data":[
        {
            "account":"1400",
            "accountOpening":"0.00",
            "accountBalance":"500.00",
            "items":[
                {
                    "item":"CH003886335",
                    "account":"1400",
                    "transactions":[
                        {
                        "description":"",
                        "qt":"",
                        "qtBalance":"",
                        "price":"",
                        "amount":"",
                        "amountBalance":""
                        },
                        {
                        "description":"",
                        "qt":"",
                        "qtBalance":"",
                        "price":"",
                        "amount":"",
                        "amountBalance":""
                        },
                        {

                            "...":"..."
                        }
                    ],
                    "balance":"1187.55"

                },
                {
                    "item":"CH012775214",
                    "account":"1400",
                    "transactions":[
                        {
                        "description":"",
                        "qt":"",
                        "qtBalance":"",
                        "price":"",
                        "amount":"",
                        "amountBalance":""
                        },
                        {

                            "...":"..."
                        }
                    ],
                    "balance":"500"

                }
            ],
            "securitiesTransactionsAmount":"500",
            "difference":"" //should be zero.
        },
        {
            "account":"1401",
            "opening":"0.00",
            "accountBalance":"200.00",
            "items":[
                {
                    "item":"IT0005239360",
                    "transactions":[
                        {
                        "description":"",
                        "qt":"",
                        "qtBalance":"",
                        "price":"",
                        "amount":"",
                        "amountBalance":""
                        }
                    ]

                }
            ],
            "securitiesTransactionsAmount":"1000"
        }
    ]

}