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
// @description = Security Card
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
    var secCardData=[];
    var selectedItem=""; //Selected by the user
    var docInfo="";
    var itemsData="";
    var itemAccount="";
    var itemTransactions=[];
    var accountCard="";

    if (!banDoc)
    return "@Cancel";

    selectedItem = getComboBoxElement();
    if (!selectedItem)
        return false;


    docInfo=getDocumentInfo(banDoc);
    transactionsData=getTransactionsTableData(banDoc,docInfo,true);
    itemsData=getItemsTableData(itemsData);
    itemAccount=getItemValue(itemsData,item,"account");
    accountCard=banDoc.currentCard(itemAccount);
    itemTransactions=filterTransactions(selectedItem,accountCard);



    //Banana.Ui.showText(JSON.stringify(conciliationData));

    var report = printReport(secCardData);
    var stylesheet = getReportStyle();
    Banana.Report.preview(report, stylesheet);


}

function getConciliationTable(report,currentDate,basCurr,itemCurr){
    currentDate=Banana.Converter.toInternalDateFormat(currentDate);
    var tableConc = report.addTable('myTableConc');
    tableConc.setStyleAttributes("width:100%;");
    tableConc.getCaption().addText(qsTr("Securities Conciliation Report \n Data as of: "+currentDate), "styleTitles");

    //columns definition 
    tableConc.addColumn("Date").setStyleAttributes("width:15%");
    tableConc.addColumn("Description").setStyleAttributes("width:20%");
    tableConc.addColumn("Debit (Base Currency)").setStyleAttributes("width:15%");
    tableConc.addColumn("Credit (Base Currency)").setStyleAttributes("width:15%");
    tableConc.addColumn("Balance (Item Currency)").setStyleAttributes("width:15%");
    tableConc.addColumn("Current accounting exchange rate").setStyleAttributes("width:15%");
    tableConc.addColumn("Debit (Item Currency)").setStyleAttributes("width:15%");
    tableConc.addColumn("Credit (Item Currency)").setStyleAttributes("width:15%");
    tableConc.addColumn("Balance (Item Currency)").setStyleAttributes("width:15%");
    tableConc.addColumn("Current Average Cost").setStyleAttributes("width:15%");
    tableConc.addColumn("Quantity Balance").setStyleAttributes("width:15%");
    
    //headers
    var tableHeader = tableConc.getHeader();
    var tableRow = tableHeader.addRow();
    tableRow.addCell("Date", "");
    tableRow.addCell("Description", "");
    tableRow.addCell("Debit "+basCurr, "");
    tableRow.addCell("Credit "+basCurr, "");
    tableRow.addCell("Balance"+basCurr, "");
    tableRow.addCell("Curr. acc. exchange rate", "");
    tableRow.addCell("Debit "+itemCurr, "");
    tableRow.addCell("Credit "+itemCurr, "");
    tableRow.addCell("Balance "+itemCurr, "");
    tableRow.addCell("Curr. average cost "+itemCurr, "");
    tableRow.addCell("Quantity balance", "");

    return tableConc;
}

/**
 * Print the report.
 * @param {*} secCardData the data.
 */
function printReport(secCardData){

    //create the report
    var report = Banana.Report.newReport("Security Card Report");
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

function getComboBoxElement() {

    var item = "";
    //Read script settings
    var data = Banana.document.getScriptSettings();

    //Check if there are previously saved settings and read them
    if (data.length > 0) {
        var readSettings = JSON.parse(data);
        //We check if "readSettings" is not null, then we fill the formeters with the values just read
        if (readSettings) {
            item = readSettings;
        }
    }
    //A dialog window is opened asking the user to insert the desired period. By default is the accounting period
    var selectedItem = Banana.Ui.getText("Security", "enter the Isin number of the security ");

    //We take the values entered by the user and save them as "new default" values.
    //This because the next time the script will be executed, the dialog window will contains the new values.
    if (selectedItem) {
        item=selectedItem;
        //Save script settings
        var valueToString = JSON.stringify(item);
        Banana.document.setScriptSettings(valueToString);
    } else {
        //User clicked cancel
        return false;
    }
    return item;
}

/**
 * Retrieves the entries from the account card of the item selected by the user
 * @param {*} selectedItem item selected by the user
 */
function filterTransactions(selectedItem,accountCard){
    var transactions=[];

    if (!accountCard) {
        return transactions;
    }
    for (var i = 0; i < accountCard.rowCount; i++) {
        var tRow = accountCard.row(i);
        var trData={};
        itemData.rowNr=tRow.rowNr;
        itemData.item = tRow.value("ItemsId");
        if(docInfo.isMultiCurrency)
            itemData.currency=tRow.value("Currency");
        if (itemsData && itemData.item)//only if the item has an id (isin)
            itemsData.push(itemData);
    }

    return transactions;
}

//esempio struttura dati.
var secCardData={
    "date":"date",
    "data":[
        {
            "item":"CH003886335",
                    "account":"1400",
                    "transactions":[
                        {
                        "date":"",
                        "Description":"",
                        "debit (baseCurr)":"",
                        "credit (baseCurr)":"",
                        "balance (baseCurr)":"",
                        "Curr. acc. exchange rate":"",
                        "debit (itemCurr)":"",
                        "credit (itemCurr)":"",
                        "balance (itemCurr)":"",
                        "Current Average Cost":"",
                        "Quantity Balance":"",
                        },
                        {
                        "date":"",
                        "Description":"",
                        "debit (baseCurr)":"",
                        "credit (baseCurr)":"",
                        "balance (baseCurr)":"",
                        "Curr. acc. exchange rate":"",
                        "debit (itemCurr)":"",
                        "credit (itemCurr)":"",
                        "balance (itemCurr)":"",
                        "Current Average Cost":"",
                        "Quantity Balance":"",
                        },
                    ]
        }
    ]

}