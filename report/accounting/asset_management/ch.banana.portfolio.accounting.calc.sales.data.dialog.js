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
// @id = ch.banana.portfolio.accounting.calc.sales.data.dialog.js
// @api = 1.0
// @pubdate = 2022-02-16
// @publisher = Banana.ch SA
// @description = Calculate Sales Data
// @task = app.command
// @doctype = 100.*
// @docproperties =
// @outputformat = none
// @inputdatasource = none
// @timeout = -1
// @includejs = ch.banana.portfolio.accounting.calculation.methods.js

/*******************************************
 * 
 * DIALOG SETUP
 * 
 *******************************************/

/** Dialog's functions declaration */
dialog=Banana.Ui.createUi("ch.banana.portfolio.accounting.calc.sales.data.dialog.ui");

//sales data section objects
var itemsCombobox = dialog.findChild('item_comboBox');
var quantity = dialog.findChild('quantity_lineEdit');
var marketPrice = dialog.findChild('marketPrice_lineEdit');
var currExRate = dialog.findChild('currentExchangeRate_lineEdit');

//preview result label
var saleResultPreview = dialog.findChild('saleResultPreview_label');
var avgCostPreview = dialog.findChild('averageCost_label');
var exchangeResultPreview=dialog.findChild('exchangeResultPreview_label');
var totalValueOfSharesPreview=dialog.findChild('totalValueOfShares_label');
var avgValueOfSharesPreview=dialog.findChild('averageValueOfShares_label');

//Buttons
var okButton = dialog.findChild('okButton');
var closeButton = dialog.findChild('closeButton');
var showResultsPreviewButton = dialog.findChild('showResultsPreview_button');


dialog.showPreviews=function(){

    var banDoc=Banana.document;
    var avgCost="";
    var baseCurr="";
    var assetCurr="";
    var saleResult="";
    var avgSharesValue="";
    var totalSharesvalue="";
    var itemsData=[];
    var userParam={};
    var salesData={};


    docInfo=getDocumentInfo(banDoc);
    userParam=readDialogParams();
    itemsData=getItemsTableData(docInfo);
    salesData=calculateShareSaleData(banDoc,docInfo,userParam,itemsData);
    assetCurr=getItemCurrency(itemsData,userParam.selectedItem);
    baseCurr=docInfo.baseCurrency;

    avgCost=Banana.Converter.toLocaleNumberFormat(salesData.avgCost,2,true);
    saleResult=Banana.Converter.toLocaleNumberFormat(salesData.saleResult,2,true);
    exRateResult=Banana.Converter.toLocaleNumberFormat(salesData.exRateResult,2,true);
    avgSharesValue=Banana.Converter.toLocaleNumberFormat(salesData.avgSharesValue,2,true);
    totalSharesvalue=Banana.Converter.toLocaleNumberFormat(salesData.totalSharesvalue,2,true);

    if(docInfo.isMultiCurrency){
        avgCostPreview.setText(avgCost+" ("+assetCurr+")");
        saleResultPreview.setText(saleResult+" ("+assetCurr+")");
        exchangeResultPreview.setText(exRateResult+" ("+baseCurr+")");
        avgValueOfSharesPreview.setText(avgSharesValue+" ("+baseCurr+")");
        totalValueOfSharesPreview.setText(totalSharesvalue+" ("+baseCurr+")");
    }else{
        avgCostPreview.setText(avgCost);
        saleResultPreview.setText(saleResult);
        exchangeResultPreview.setText(exRateResult);
    }

    return true;
}

/**
 * 
 * @param {*} avgCost the average cost
 * @param {*} userParam the parameters that the user defined in the dialog
 * @param {*} currentRowData the current line transaction data
 * @returns an object with the calculation data.
 */
 function calculateShareSaleData(banDoc,docInfo,userParam,itemsData){
    
    let saleData={};
    let item="";
    let journal="";
    let quantity="";
    let marketPrice="";
    let currExRate=""; //current exchange rate
    let accExRate=""; //accounting exchange rate
    let avgCost="";
    let avgSharesValue="";
    let totalSharesvalue="";
    let saleResult="";
    let exRateResult="";
    let accountCard="";
    let accountCardData="";
    let itemAccount="";
    let itemCardData=[];
    
    item=userParam.selectedItem;//get the item
    itemAccount=getItemValue(itemsData,item,"account");//get the account of the item
    //check if element exist
    findElement(banDoc,item, itemsData,"item","Items table");
    //get item card data to find the current average cost
    journal = banDoc.journal(banDoc.ORIGINTYPE_CURRENT, banDoc.ACCOUNTTYPE_NONE);
    journalData=getJournalData(docInfo,journal);
    accountCard=banDoc.currentCard(itemAccount);
    accountCardData=getAccountCardData(docInfo,item,accountCard);
    itemCardData=getItemCardData(accountCardData,journalData);
    //extract from the array the current avg cost value (accounting value)
    if(itemCardData){
        avgCost=itemCardData.slice(-1)[0].accAvgCost;
    }

    quantity=userParam.quantity;
    marketPrice=userParam.marketPrice;
    currExRate=userParam.currExRate;
    accExRate=getAccountingCourse(item,itemsData,banDoc);

    //Banana.console.debug(accExRate);

    //avgCost=getAverageCost(item,transList);
    avgSharesValue=getSharesAvgValue(quantity,avgCost);
    totalSharesvalue=getSharesTotalValue(quantity,marketPrice);
    saleResult=getSaleResult(avgSharesValue,totalSharesvalue);
    exRateResult=getExchangeResult(marketPrice,quantity,currExRate,accExRate);

    saleData.avgCost=avgCost;
    saleData.avgSharesValue=avgSharesValue;
    saleData.totalSharesvalue=totalSharesvalue;
    saleData.saleResult=saleResult;
    saleData.exRateResult=exRateResult;

    return saleData;

}


/** Dialog's events declaration */
//quantity.editingFinished.connect(dialog,dialog.formatQt);
//bankChargesAmount.editingFinished.connect(dialog,dialog.formatBankCharges);
showResultsPreviewButton.clicked.connect(dialog,dialog.showPreviews);

/**
 * Read the params from the dialog
 */
function readDialogParams(){
    var userParam={};

    userParam.selectedItem=itemsCombobox.currentText;
    userParam.quantity=quantity.text;
    userParam.marketPrice=marketPrice.text;
    userParam.currExRate=currExRate.text;

    return userParam;

}

/**
 * Fills the dialogue combobox with the items found in the item table
 * @param {*} itemsCombobox 
 */
 function insertComboBoxElements(){
    //First set the editable attribute to true,in this way the user can also enter the text.
    itemsCombobox.editable=true;

    const itemList=new Set();
    var itemsData=getItemsTableData("false"); //I give as parameter "false" as I only need the list of items

    //fill the listString with the existing items
    for(var r in itemsData){
        if(itemsData[r].item){
            itemList.add(itemsData[r].item);
        }
    }

    var itemList_array=Array.from(itemList); //convert the set into an array.
    
    if(itemsCombobox)
        itemsCombobox.insertItems(1, itemList_array);
}


function exec(){

    if(!verifyBananaVersion())
        return "@Cancel";
    //fill the combobox with the existent groups and fill the labelw with the known data
    insertComboBoxElements();
    Banana.application.progressBar.pause();
    var dlgResult = dialog.exec();
    Banana.application.progressBar.resume();

    if (dlgResult !== 1)
        return false;
    else
        return true;

}