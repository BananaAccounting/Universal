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
    var selectedItem=""; //Selected by the user
    var docInfo="";
    var itemsData="";
    var itemAccount="";
    var journal=""; //hold the journal table
    var journalData=[];
    var trIdList="";// transactions id List
    var accountCard=""; //hold the account card table
    var accountCardData=""; 
    var itemCardData={};

    if (!banDoc)
    return "@Cancel";

    selectedItem = getComboBoxElement();
    if (!selectedItem)
        return false;


    docInfo=getDocumentInfo(banDoc);
    transactionsData=getTransactionsTableData(banDoc,docInfo,true);
    itemsData=getItemsTableData(itemsData);
    itemAccount=getItemValue(itemsData,selectedItem,"account");

    //get the journal data and creates an array of objects containing the transactions data
    journal = banDoc.journal(banDoc.ORIGINTYPE_CURRENT, banDoc.ACCOUNTTYPE_NONE);
    journalData=getJournalData(docInfo,journal,selectedItem);
    trIdList=getTransactionsIdList(journalData);

    //get the account card, filter the result by item and return an array of objects containing the transactions data
    accountCard=banDoc.currentCard(itemAccount);
    accountCardData=getAccountCardData(docInfo,selectedItem,accountCard,trIdList);

    //Returns the title account card as an object
    itemCardData.data=getItemCardData(docInfo,selectedItem,accountCardData,journalData);


    var report = printReport(itemCardData);
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
 * @param {*} itemCardData the data.
 */
function printReport(itemCardData){

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
 * saves the list of ids of all registrations in an array. each id is saved only once
 * @param {*} journalData 
 */
function getTransactionsIdList(journalData){
    var trIdElements=new Set();
    var trIdList=[];

    for(var key in journalData){
        trIdElements.add(journalData[key].trId);
    }

    trIdList=Array.from(trIdElements);

    return trIdList;

}

function getItemCardData(docInfo,selectedItem,accountCardData,journalData){
    var itemCardData=[...accountCardData,...journalData]; //merge the arrays
    itemCardData.sort(compare); //sort the array be trId
    Banana.Ui.showText(JSON.stringify(itemCardData));
    getCurrentAccExchangeRate();
    getCurrentAccAvgCost();

    return itemCardData;
}

function compare( a, b ) {
    if ( a.trId < b.trId ){
      return -1;
    }
    if ( a.trId > b.trId ){
      return 1;
    }
    return 0;
  }

/**
 * Reads the journal data and returns an array of objects with the information we need
 * @param {*} journal journal table
 */
function getJournalData(docInfo,journal,selectedItem){
    var journalData=[];

    for (var i = 0; i < journal.rowCount; i++) {
        var tRow = journal.row(i);
        var jrRow={};
        jrRow.date=tRow.value("JDate");
        jrRow.trId=tRow.value("JContraAccountGroup");
        jrRow.item = tRow.value("ItemsId");
        jrRow.description = tRow.value("Description");
        jrRow.debitBase = tRow.value("JDebitAmount"); //debit value in base currency
        jrRow.creditBase = tRow.value("JCreditAmount"); //credit value base currency
        jrRow.balanceBase = tRow.value("JBalance"); //credit value base currency
        jrRow.qt = tRow.value("Quantity"); //credit value base currency
        jrRow.unitPrice = tRow.value("UnitPrice"); //credit value base currency
        if(docInfo.isMultiCurrency){
            jrRow.debitCurr = tRow.value("JDebitAmountCurrency"); //debit value in base currency
            jrRow.creditCurr = tRow.value("JCreditAmountCurrency"); //credit value base currency
            jrRow.balanceCurr = tRow.value("JBalanceAccountCurrency"); //credit value base currency
        }

        if(selectedItem===jrRow.item)//We only keep records that relate to the chosen item. 
            journalData.push(jrRow);
    }

    return journalData;

}

/**
 * Retrieves the transactions from the account card of the item selected by the user and
 * returns the transactions as objects.
 * In order to save the data from the account card, I use two checks: the first one checks that the isin in the item column matches,
 *  the second one checks that the transaction number matches one of those in the list. 
 * This check is due to the fact that not all of the entries regarding the item have a direct reference to the isin in the column, 
 * for example the sale entry did not indicate the item.
 * @param {*} selectedItem item selected by the user
 * @param {*} docInfo item selected by the user
 * @param {*} accountCard account card (table obj)
 * @param {*} trIdList list of transaction ids concerning the item. the list was retrieved by doing the journal
 */
function getAccountCardData(docInfo,selectedItem,accountCard,trIdList){
    var transactions=[];

    if (!accountCard) {
        return transactions;
    }
    for (var i = 0; i < accountCard.rowCount; i++) {
        var tRow = accountCard.row(i);
        var trData={};
        trData.rowNr=tRow.rowNr;
        trData.date=tRow.value("Date");
        trData.trId=tRow.value("JContraAccountGroup");
        trData.item = tRow.value("ItemsId");
        trData.description = tRow.value("Description");
        trData.debitBase = tRow.value("JDebitAmount"); //debit value in base currency
        trData.creditBase = tRow.value("JCreditAmount"); //credit value base currency
        trData.balanceBase = tRow.value("JBalance"); //credit value base currency
        if(docInfo.isMultiCurrency){
            trData.debitCurr = tRow.value("JDebitAmountCurrency"); //debit value in base currency
            trData.creditCurr = tRow.value("JCreditAmountCurrency"); //credit value base currency
            trData.balanceCurr = tRow.value("JBalanceAccountCurrency"); //credit value base currency
        }

        /**
         * 
         */
        if (trData.item===selectedItem || transactionRefToTheItem(trIdList,trData.trId));
            transactions.push(trData);
    }
    return transactions;
}

/**
 * Check that the registration id is in the list of registration ids on the item.
 * @param {*} trIdList list of id
 * @param {*} trId the transaction id
 */
function transactionRefToTheItem(trIdList,trId){
    for(var i=0;i<trIdList.length;i++){
        if(trId===trIdList[i])
            return true;
    }
    return false;
}

/**
 * Calculates how the quantity of securities is updated after each movement 
 * @param {*} transactions the movements of the item.
 */
function getQuantityBalance(transactions){
    for (var key in transactions){
        transactions[key].exchangeRate=Banana.SDecimal.divide(transactions[key].balanceCurr,transactions[key].quantityBalance);
    }

    return transactions;
}
/**
 * Calculates how the average accounting cost of the security is updated after each movement.
 * The accounting average cost is calculated by doing: Balance (in the item currency)/Quantity balance.
 * @param {*} transactions the movements of the item
 */
function getCurrentAccAvgCost(transactions){
    for (var key in transactions){
        transactions[key].exchangeRate=Banana.SDecimal.divide(transactions[key].balanceCurr,transactions[key].quantityBalance);
    }
    return transactions;
}

/**
 * Calculates how the accounting exchange rate is updated after each movement
 * @param {*} transactions the movements of the item
 * @returns 
 */
function getCurrentAccExchangeRate(transactions){

    for (var key in transactions){
        transactions[key].exchangeRate=Banana.SDecimal.divide(transactions[key].balanceBase,transactions[key].balanceCurr);
    }

    return transactions;

}

//esempio struttura dati.
var itemCardData={
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
                        "Quantity Balance":"",
                        "Current Average Cost":"",
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
                        "Quantity Balance":"",
                        "Current Average Cost":"",
                        },
                    ]
        }
    ]

}