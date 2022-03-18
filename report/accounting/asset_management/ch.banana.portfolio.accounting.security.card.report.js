
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
// @id = ch.banana.portfolio.accounting.security.card.report.js
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
    var dlgTitle="Security ISIN";
    var dlgLabel="Enter the ISIN number of the security";
    var scriptId="ch.banana.portfolio.accounting.security.card.report.js";
    var journal=""; //hold the journal table
    var journalData=[];
    var accountCard=""; //hold the account card table
    var accountCardData="";
    var itemCardData={};
    var itemCurrency="";
    itemCardData.date=new Date();

    if (!verifyBananaVersion())
        return "@Cancel";

    selectedItem = getComboBoxElement(scriptId,dlgTitle,dlgLabel);
    if (!selectedItem)
        return false;

    docInfo=getDocumentInfo(banDoc);
    itemsData=getItemsTableData(banDoc,docInfo);
    itemAccount=getItemValue(itemsData,selectedItem,"account");
    itemCurrency=getItemCurrency(itemsData,selectedItem);

    //check if item exist
    findElement(banDoc,selectedItem, itemsData,"item","Items table");

    //get the journal data and creates an array of objects containing the transactions data
    journal = banDoc.journal(banDoc.ORIGINTYPE_CURRENT, banDoc.ACCOUNTTYPE_NONE);
    journalData=getJournalData(docInfo,journal);

    //get the account card, filter the result by item and return an array of objects containing the transactions data
    accountCard=banDoc.currentCard(itemAccount);
    accountCardData=getAccountCardData(docInfo,selectedItem,accountCard);

    //get the calculated data and the totals
    itemCardData=getItemCardData(docInfo,accountCardData,journalData,itemCurrency,selectedItem);

    let itemDescription=getItemValue(itemsData,selectedItem,"description");
    var report = printReport(docInfo,itemCardData,itemDescription);
    getReportHeader(report,docInfo);
    var stylesheet = getReportStyle();
    Banana.Report.preview(report, stylesheet);


}

function getItemCardData(docInfo,accountCardData,journalData,itemCurrency,selectedItem){
    let itemCardData={};
    itemCardData.data=getItemCardDataList(accountCardData,journalData);
    itemCardData.currency=itemCurrency;
    itemCardData.item=selectedItem;
    itemCardData.totalDebitBase=getSum(accountCardData,"debitBase");
    itemCardData.totalCreditBase=getSum(accountCardData,"creditBase");
    itemCardData.totalBalanceBase=getBalance(accountCardData,"debitBase","creditBase");
    if(docInfo.isMultiCurrency){
        itemCardData.totalDebitCurr=getSum(accountCardData,"debitCurr");
        itemCardData.totalCreditCurr=getSum(accountCardData,"creditCurr");
        itemCardData.totalBalanceCurr=getBalance(accountCardData,"debitCurr","creditCurr");
    }
    //In the total I also show the last known cumulative quantity and the last known average accounting cost.
    if(itemCardData.data){
        itemCardData.totalQtBalance=itemCardData.data.slice(-1)[0].qtBalance; 
        itemCardData.totalCurrAvgCost=itemCardData.data.slice(-1)[0].accAvgCost;
    }
    return itemCardData;
}

function getItemCardTable(report,docInfo,currentDate,baseCurr,itemCardData,itemDescription){
    currentDate=Banana.Converter.toInternalDateFormat(currentDate);
    var tableConc = report.addTable('myTable');
    let itemId=itemCardData.item;
    let itemCurr=itemCardData.currency;
    let refCurr=itemCurr? itemCurr:baseCurr; //currency dispayed on the header.
    tableConc.setStyleAttributes("width:100%;");
    tableConc.getCaption().addText(qsTr("Security Card: "+itemId+" "+itemDescription+" "+refCurr+", Data as of: "+currentDate), "styleTitles");

    //columns definition 
    tableConc.addColumn("Date").setStyleAttributes("width:10%");
    tableConc.addColumn("Doc").setStyleAttributes("width:5%");
    tableConc.addColumn("Description").setStyleAttributes("width:35%");
    tableConc.addColumn("Debit (Item Currency)").setStyleAttributes("width:15%");
    tableConc.addColumn("Credit (Item Currency)").setStyleAttributes("width:15%");
    tableConc.addColumn("Balance (Item Currency)").setStyleAttributes("width:15%");
    if(docInfo.isMultiCurrency){
        tableConc.addColumn("Debit (Base Currency)").setStyleAttributes("width:15%");
        tableConc.addColumn("Credit (Base Currency)").setStyleAttributes("width:15%");
        tableConc.addColumn("Balance (Base Currency)").setStyleAttributes("width:15%");
    }
    tableConc.addColumn("Quantity").setStyleAttributes("width:15%");
    tableConc.addColumn("Unit Price").setStyleAttributes("width:15%");
    tableConc.addColumn("Quantity Balance").setStyleAttributes("width:15%");
    tableConc.addColumn("Current Average Cost").setStyleAttributes("width:15%");
    
    //headers
    var tableHeader = tableConc.getHeader();
    var tableRow = tableHeader.addRow();
    tableRow.addCell("Date", "styleTablesHeaderText");
    tableRow.addCell("Doc", "styleTablesHeaderText");
    tableRow.addCell("Description", "styleTablesHeaderText");
    if(docInfo.isMultiCurrency){
        tableRow.addCell("Debit "+itemCurr, "styleTablesHeaderText");
        tableRow.addCell("Credit "+itemCurr, "styleTablesHeaderText");
        tableRow.addCell("Balance "+itemCurr, "styleTablesHeaderText");
    }
    tableRow.addCell("Debit "+baseCurr, "styleTablesHeaderText");
    tableRow.addCell("Credit "+baseCurr, "styleTablesHeaderText");
    tableRow.addCell("Balance "+baseCurr, "styleTablesHeaderText");

    tableRow.addCell("Quantity ", "styleTablesHeaderText");
    if(itemCurr)
        tableRow.addCell("Unit Price\n"+itemCurr, "styleTablesHeaderText");
    else
        tableRow.addCell("Unit Price\n"+baseCurr, "styleTablesHeaderText");

    tableRow.addCell("Quantity\nBalance", "styleTablesHeaderText");
    if(itemCurr)
        tableRow.addCell("Current.\nAverage cost\n"+itemCurr, "styleTablesHeaderText");
    else
        tableRow.addCell("Current.\nAverage cost\n"+baseCurr, "styleTablesHeaderText");

    return tableConc;
}

/**
 * Print the report.
 * @param {*} itemCardData the data.
 */
function printReport(docInfo,itemCardData,itemDescription){

    //create the report
    var report = Banana.Report.newReport("Security Card Report");
    var currentDate=new Date();
    //let hexColorBase = "#354793";//in the future we can let the user choose it.
    //let colorsObj=getColors(hexColorBase);
    let rowColorIndex=0;//to know whether a line is odd or even.
    let isEven=false;
    let rowStyle="";

    //add item card table
    var tabItemCard = getItemCardTable(report,docInfo,currentDate,docInfo.baseCurrency,itemCardData,itemDescription);

    //Print the data.
    for(var key in itemCardData.data){
        isEven=checkIfNumberisEven(rowColorIndex);
        if(isEven)
            rowStyle="styleEvenRows";
        else
        rowStyle="styleOddRows";

        itCardRow=itemCardData.data[key];

        var tableRow = tabItemCard.addRow(rowStyle);
        tableRow.addCell(Banana.Converter.toLocaleDateFormat(itCardRow.date), '');
        tableRow.addCell(itCardRow.doc, 'styleAlignCenter');
        tableRow.addCell(itCardRow.description, '');
        if(docInfo.isMultiCurrency){
            tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itCardRow.debitCurr,2,false),"styleNormalAmount");
            tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itCardRow.creditCurr,2,false),"styleNormalAmount");
            tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itCardRow.balanceCurr,2,false),"styleNormalAmount");
        }
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itCardRow.debitBase,2,false),"styleNormalAmount");
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itCardRow.creditBase,2,false),"styleNormalAmount");
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itCardRow.balanceBase,2,false),"styleNormalAmount");
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itCardRow.qt,2,false),"styleNormalAmount");
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itCardRow.unitPrice,2,false),"styleNormalAmount");
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itCardRow.qtBalance,2,false),"styleNormalAmount");
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itCardRow.accAvgCost,3,false),"styleNormalAmount");

        rowColorIndex++;
    }

    //Print the totals
    var tableRow = tabItemCard.addRow("styleTableRows");
    tableRow.addCell(Banana.Converter.toLocaleDateFormat(currentDate), '');
    tableRow.addCell("","",1);
    tableRow.addCell("Total transactions", 'styleDescrTotals');
    if(docInfo.isMultiCurrency){
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itemCardData.totalDebitCurr,2,false),"styleTotalAmount");
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itemCardData.totalCreditCurr,2,false),"styleTotalAmount");
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itemCardData.totalBalanceCurr,2,false),"styleTotalAmount");
    }
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itemCardData.totalDebitBase,2,false),"styleTotalAmount");
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itemCardData.totalCreditBase,2,false),"styleTotalAmount");
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itemCardData.totalBalanceBase,2,false),"styleTotalAmount");
    tableRow.addCell("","",2);
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itemCardData.totalQtBalance,2,false),"styleTotalAmount");
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itemCardData.totalCurrAvgCost,3,false),"styleTotalAmount");

    return report;

}

/*example data structure
var itemCardData={
    "date":"date",
    "currency":"EUR",
    "item":"IT0005239360",
    "data":[
        {
        "TransactionType":"Purchase",
        "date":"",
        "doc":"",
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
        "doc":"",
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

}*/