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
    var dlgTitle="Security Isin";
    var dlgLabel="Enter the Isin number of the security";
    var scriptId="ch.banana.portfolio.accounting.security.card.report.js";
    var docInfo="";
    var itemsData="";
    var itemAccount="";
    var journal=""; //hold the journal table
    var journalData=[];
    var trIdList="";// transactions id List
    var accountCard=""; //hold the account card table
    var accountCardData="";
    var itemCardData={};
    var itemCurrency="";
    itemCardData.date=new Date();

    if (!banDoc)
    return "@Cancel";

    selectedItem = getComboBoxElement(scriptId,dlgTitle,dlgLabel);
    if (!selectedItem)
        return false;


    docInfo=getDocumentInfo(banDoc);
    itemsData=getItemsTableData(docInfo);
    itemAccount=getItemValue(itemsData,selectedItem,"account");
    itemCurrency=getItemCurrency(itemsData,selectedItem);

    //get the journal data and creates an array of objects containing the transactions data
    journal = banDoc.journal(banDoc.ORIGINTYPE_CURRENT, banDoc.ACCOUNTTYPE_NONE);
    journalData=getJournalData(docInfo,journal,selectedItem);
    trIdList=getTransactionsIdList(journalData);

    //get the account card, filter the result by item and return an array of objects containing the transactions data
    accountCard=banDoc.currentCard(itemAccount);
    accountCardData=getAccountCardData(docInfo,selectedItem,accountCard,trIdList);

    //get the calculated data and the totals
    itemCardData.data=getItemCardData(accountCardData,journalData);
    itemCardData.currency=itemCurrency;
    itemCardData.item=selectedItem;
    itemCardData.totalDebitBase=getSum(accountCardData,"debitBase");
    itemCardData.totalCreditBase=getSum(accountCardData,"creditBase");;
    itemCardData.totalBalanceBase=getBalance(accountCardData,"debitBase","creditBase");
    if(docInfo.isMultiCurrency){
        itemCardData.totalDebitCurr=getSum(accountCardData,"debitCurr");
        itemCardData.totalCreditCurr=getSum(accountCardData,"creditCurr");
        itemCardData.totalBalanceCurr=getBalance(accountCardData,"debitCurr","creditCurr");
    }
    //In the total I also show the last known cumulative quantity and the last known average accounting cost.
    itemCardData.totalQtBalance=itemCardData.data.slice(-1)[0].qtBalance; 
    itemCardData.totalCurrAvgCost=itemCardData.data.slice(-1)[0].accAvgCost;


    var report = printReport(docInfo,itemCardData);
    getReportHeader(report,docInfo);
    var stylesheet = getReportStyle();
    Banana.Report.preview(report, stylesheet);


}

function getItemCardTable(report,docInfo,currentDate,basCurr,itemCardData){
    currentDate=Banana.Converter.toInternalDateFormat(currentDate);
    var tableConc = report.addTable('myTableConc');
    var item=itemCardData.item;
    var itemCurr=itemCardData.currency;
    tableConc.setStyleAttributes("width:100%;");
    tableConc.getCaption().addText(qsTr("Security Card: "+item+", Data as of: "+Banana.Converter.toLocaleDateFormat(currentDate)), "styleTitles");

    //columns definition 
    tableConc.addColumn("Date").setStyleAttributes("width:15%");
    tableConc.addColumn("Description").setStyleAttributes("width:35%");
    tableConc.addColumn("Debit (Base Currency)").setStyleAttributes("width:15%");
    tableConc.addColumn("Credit (Base Currency)").setStyleAttributes("width:15%");
    tableConc.addColumn("Balance (Base Currency)").setStyleAttributes("width:15%");
    if(docInfo.isMultiCurrency){
        tableConc.addColumn("Debit (Item Currency)").setStyleAttributes("width:15%");
        tableConc.addColumn("Credit (Item Currency)").setStyleAttributes("width:15%");
        tableConc.addColumn("Balance (Item Currency)").setStyleAttributes("width:15%");
    }
    tableConc.addColumn("Quantity").setStyleAttributes("width:15%");
    tableConc.addColumn("Unit Price").setStyleAttributes("width:15%");
    tableConc.addColumn("Quantity Balance").setStyleAttributes("width:15%");
    tableConc.addColumn("Current Average Cost").setStyleAttributes("width:25%");
    
    //headers
    var tableHeader = tableConc.getHeader();
    var tableRow = tableHeader.addRow();
    tableRow.addCell("Date", "styleTablesHeaderText");
    tableRow.addCell("Description", "styleTablesHeaderText");
    tableRow.addCell("Debit "+basCurr, "styleTablesHeaderText");
    tableRow.addCell("Credit "+basCurr, "styleTablesHeaderText");
    tableRow.addCell("Balance "+basCurr, "styleTablesHeaderText");
    if(docInfo.isMultiCurrency){
        tableRow.addCell("Debit "+itemCurr, "styleTablesHeaderText");
        tableRow.addCell("Credit "+itemCurr, "styleTablesHeaderText");
        tableRow.addCell("Balance "+itemCurr, "styleTablesHeaderText");
    }
    tableRow.addCell("Quantity ", "styleTablesHeaderText");
    if(itemCurr)
        tableRow.addCell("Unit Price "+itemCurr, "styleTablesHeaderText");
    else
        tableRow.addCell("Unit Price "+basCurr, "styleTablesHeaderText");

    tableRow.addCell("Quantity balance", "styleTablesHeaderText");
    if(itemCurr)
        tableRow.addCell("Curr. average cost "+itemCurr, "styleTablesHeaderText");
    else
        tableRow.addCell("Curr. average cost "+basCurr, "styleTablesHeaderText");

    return tableConc;
}

/**
 * Print the report.
 * @param {*} itemCardData the data.
 */
function printReport(docInfo,itemCardData){

    //create the report
    var report = Banana.Report.newReport("Security Card Report");
    var currentDate=new Date();
    //add item card table
    var tabItemCard = getItemCardTable(report,docInfo,currentDate,docInfo.baseCurrency,itemCardData);

    //Print the data.
    for(var key in itemCardData.data){
        itCardRow=itemCardData.data[key];
        var tableRow = tabItemCard.addRow("styleTableRows");
        tableRow.addCell(Banana.Converter.toLocaleDateFormat(itCardRow.date), '');
        tableRow.addCell(itCardRow.description, '');
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itCardRow.debitBase,2,false),"styleNormalAmount");
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itCardRow.creditBase,2,false),"styleNormalAmount");
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itCardRow.balanceBase,2,false),"styleNormalAmount");
        if(docInfo.isMultiCurrency){
            tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itCardRow.debitCurr,2,false),"styleNormalAmount");
            tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itCardRow.creditCurr,2,false),"styleNormalAmount");
            tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itCardRow.balanceCurr,2,false),"styleNormalAmount");
        }
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itCardRow.qt,2,false),"styleNormalAmount");
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itCardRow.unitPrice,2,false),"styleNormalAmount");
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itCardRow.qtBalance,2,false),"styleNormalAmount");
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itCardRow.accAvgCost,3,false),"styleNormalAmount");
    }

    //Print the totals
    var tableRow = tabItemCard.addRow("styleTableRows");
    tableRow.addCell(Banana.Converter.toLocaleDateFormat(currentDate), '');
    tableRow.addCell("Total transactions:  "+itemCardData.item, 'styleDescrTotals');
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itemCardData.totalDebitBase,2,false),"styleTotalAmount");
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itemCardData.totalCreditBase,2,false),"styleTotalAmount");
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itemCardData.totalBalanceBase,2,false),"styleTotalAmount");
    if(docInfo.isMultiCurrency){
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itemCardData.totalDebitCurr,2,false),"styleTotalAmount");
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itemCardData.totalCreditCurr,2,false),"styleTotalAmount");
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itemCardData.totalBalanceCurr,2,false),"styleTotalAmount");
    }
    tableRow.addCell("","",2);
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itemCardData.totalQtBalance,2,false),"styleTotalAmount");
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(itemCardData.totalCurrAvgCost,3,false),"styleTotalAmount");

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

/**
 * Sum up the amounts.
 * @param {*} itemCardData 
 * @param {*} ref Indicates the name of the property in the object (column) from which the values to be summed are to be taken
 */
function getSum(itemCardData,ref){
    var sum="";
    if(ref){
        for(var key in itemCardData){
            sum=Banana.SDecimal.add(sum,itemCardData[key][ref]);
        }
    }
    return sum;
}
/**
 * Calculates the balance.
 * @param {*} itemCardData 
 * @param {*} debRef debit data
 * @param {*} credRef credita data
 * @returns 
 */
function getBalance(itemCardData,debRef,credRef){
    var balance="";
    if(debRef || credRef){
        for(var key in itemCardData){
            //At each iteration, I add the value found in dates to the value on the balance sheet and subtract the value found in credits.
            balance=Banana.SDecimal.add(balance,itemCardData[key][debRef]);
            balance=Banana.SDecimal.subtract(balance,itemCardData[key][credRef]);
        }
    }
    return balance;
}

function getItemCardData(accountCardData,journalData){
    var itemCardData={};
    var balRefCol=""; //ref column for balance

    SetSoldData(accountCardData,journalData);
    getQuantityBalance(accountCardData);

    itemCardData=getCurrentAccAvgCost(accountCardData,balRefCol);

    return itemCardData;
}

/**
 *  * Calculates how the average accounting cost of the security is updated after each movement.
 * The accounting average cost is calculated by doing: Balance (in the item currency)/Quantity balance.
 * Calculates for each line of the card the average accounting purchase price.
 * @param {*} accountCardData 
 * @param {*} balanceCol 
 */
function getCurrentAccAvgCost(accountCardData){
    var context = {'decimals' : 2, 'mode' : Banana.SDecimal.HALF_EVEN};
    for(var key in accountCardData){
        /**
         * if the balance sheet column in foreign currency exists, I am sure that it is a multi-currency account, 
         * so I take the value of the balance sheet in the currency of the asset, wich in case of an asset in the same currency as the base currency, 
         * the value is the same.
         */
        if(accountCardData[key].balanceCurr)
            accountCardData[key].accAvgCost=Banana.SDecimal.divide(accountCardData[key].balanceCurr,accountCardData[key].qtBalance,context);
        else
            accountCardData[key].accAvgCost=Banana.SDecimal.divide(accountCardData[key].balanceBase,accountCardData[key].qtBalance,context);
    }

    return accountCardData;
}

/**
 * Calculates for each line of the card the cumulative quantity
 * @param {*} accountCardData 
 * @returns 
 */
function getQuantityBalance(accountCardData){
    let amountBalance="";
    for(var key in accountCardData){
        amountBalance=Banana.SDecimal.add(amountBalance,accountCardData[key].qt);
        accountCardData[key].qtBalance=amountBalance;
    }
    return accountCardData;
}

/**
 * Sets the quantity and the price to the sales records in the accountCard by taking the data from the journal lines
 * If the accountCard line does not have the item, it means that the  
 * represents the sales amount. To this amount I add the quantity that I retrieve from the journal, 
 * I retrieve it by going to the only line that contains a reference to the quantity of the record with the same id.
 * @param {*} accountCardData 
 * @param {*} journalData 
 */
function SetSoldData(accountCardData,journalData){

    for(var key in accountCardData){
        if(!accountCardData[key].item){
            let trId=accountCardData[key].trId;
            accountCardData[key].qt=getJournalValueFiltered(journalData,trId,"qt");
            accountCardData[key].unitPrice=getJournalValueFiltered(journalData,trId,"unitPrice");
        }
    }
    return accountCardData
}

function getJournalValueFiltered(journalData,trId,objProp){

    let value="";
    for(var key in journalData){
        if(journalData[key].trId==trId && journalData[key][objProp]){
            //in the journal I should only have one entry line that corresponds to the control parameters.
            value=journalData[key][objProp];
            return value;
        }
    }
    return value;
}

/**
 * Reads the journal data and returns an array of objects with the information we need
 * @param {*} journal journal table
 */
function getJournalData(docInfo,journal,selectedItem,){
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
        trData.unitPrice=tRow.value("UnitPrice");
        if(docInfo.isMultiCurrency){
            trData.debitCurr = tRow.value("JDebitAmountAccountCurrency"); //debit value in base currency
            trData.creditCurr = tRow.value("JCreditAmountAccountCurrency"); //credit value base currency
            trData.balanceCurr = tRow.value("JBalanceAccountCurrency"); //credit value base currency
        }
        trData.qt=tRow.value("Quantity");

        /**
         * 
         */
        if (trData.item===selectedItem || transactionRefToTheItem(trIdList,trData.trId))
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

//esempio struttura dati.
var itemCardData={
    "date":"date",
    "currency":"EUR",
    "item":"IT0005239360",
    "data":[
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