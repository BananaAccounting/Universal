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
// @pubdate = 2021-12-10
// @publisher = Banana.ch SA
// @description = ch.banana.securities.dialog
// @timeout = -1
// @includejs = ch.banana.portfolio.management.calculation.methods.js

//global variables

var SECTYPE=""; //The type of security

/**
 * This script defines the dialog   
 */
/*******************************************
 * 
 * DIALOG SETUP
 * 
 *******************************************/

/** Dialog's functions declaration */
dialog=Banana.Ui.createUi("ch.banana.portfolio.management.sales.dialog.ui");

//sales data section objects
var itemsCombobox = dialog.findChild('item_comboBox');
var quantity = dialog.findChild('quantity_lineEdit');
var bankChargesAmount = dialog.findChild('bank_charges_amount_lineEdit');

//registration accounts data section objects
var bankAccount = dialog.findChild('bankAccount_lineEdit');
var bankInterest = dialog.findChild('BankInterest_lineEdit');
var profitOnSecurities=dialog.findChild('ProfitOnSecurities_lineEdit');
var lossOnSecurities = dialog.findChild('LossOnSecurities_lineEdit');
var interestOnBond = dialog.findChild('interestOnBond_lineEdit');

//preview result label
var saleResultPreview = dialog.findChild('saleResultPreview_label');
var avgCostPreview = dialog.findChild('averageCost_label');
var exchangeResultPreview=dialog.findChild('exchangeResultPreview_label');

//buttons
var okButton = dialog.findChild('okButton');
var closeButton = dialog.findChild('closeButton');
var showResultsPreviewButton = dialog.findChild('showResultsPreview_button');


dialog.showPreviews=function(){

    var banDoc=Banana.document;
    var currentSelectionTop = banDoc.cursor.selectionTop;
    var transList=[];
    var avgCost="";
    var docInfo="";
    var secData="";
    var baseCurr="";
    var assetCurr="";
    var itemsData="";
    var userParam=readDialogParams();

    docInfo=getDocumentInfo(banDoc);
    itemsData=getItemsTableData(docInfo);
    transList=getTransactionsTableData(banDoc,docInfo);
    currentRowData=getCurrentRowData(banDoc,transList);
    baseCurr=docInfo.baseCurrency;
    assetCurr=getItemValue(itemsData,userParam.selectedItem,"currency");

    if(SECTYPE=="bonds"){
        bondTotalCourse=getBondTotalCourse(transList,userParam);
        secData=calculateBondSaleData(bondTotalCourse,userParam);
    }
    else if(SECTYPE=="shares"){
        accountingCourse=getAccountingCourse(userParam.selectedItem,itemsData,banDoc);
        avgCost=getAverageCost(userParam.selectedItem,currentSelectionTop,transList);
        secData=calculateShareSaleData(avgCost,userParam,currentRowData,accountingCourse);
    }

        avgCost=Banana.Converter.toLocaleNumberFormat(avgCost,decimals = 2, convZero = true);
        var saleResult=Banana.Converter.toLocaleNumberFormat(secData.saleResult,decimals = 2, convZero = true);
        var exchangeResult=Banana.Converter.toLocaleNumberFormat(secData.exchangeResult,decimals = 2, convZero = true);

    //set the values in the label
    //if its a multi currency accounting we display the currency for each result preview.
    if(docInfo.isMultiCurrency){
        avgCostPreview.setText(avgCost+" ("+assetCurr+")");
        saleResultPreview.setText(saleResult+" ("+assetCurr+")");
        exchangeResultPreview.setText(exchangeResult+" ("+baseCurr+")");
    }else{
        avgCostPreview.setText(avgCost);
        saleResultPreview.setText(saleResult);
        exchangeResultPreview.setText(exchangeResult);
    }

    return true;
}

dialog.formatQt=function(){

    //quantity
    var frmQt=quantity.text;
    frmQt=Banana.Converter.toLocaleNumberFormat(frmQt,decimals = 0, convZero = true);
    quantity.setText(frmQt);
}

dialog.formatBankCharges=function(){
    //bank charges
    var frmBankCharges=bankChargesAmount.text;
    frmBankCharges=Banana.Converter.toLocaleNumberFormat(frmBankCharges,decimals = 0, convZero = true);
    bankChargesAmount.setText(frmBankCharges);
}


/** Dialog's events declaration */
//quantity.editingFinished.connect(dialog,dialog.formatQt);
//bankChargesAmount.editingFinished.connect(dialog,dialog.formatBankCharges);
showResultsPreviewButton.clicked.connect(dialog,dialog.showPreviews);

/**
 * I initialise the parameters, everything is empty at first
 * @returns 
 */
function initParam(){
    var param={};

    param.salesParam={};

    param.salesParam.selectedItem="";
    param.salesParam.quantity="";
    param.salesParam.bankChargesAmount="";

    param.accountsParam={};

    param.accountsParam.bankAccount="";
    param.accountsParam.bankInterest="";
    param.accountsParam.profitOnSecurities="";
    param.accountsParam.lossOnSecurities="";
    param.accountsParam.interestOnBond="";

    return param;

}

/**
 * 
 * @param {*} userParam 
 */
 function setDialogAccountsParams(userParam){
    /*setto il testo al dialogo con i parametri esistente (gli ultimi usati)
    questo lo faccio solo per i conti, le altre informazioni devono essere vuote ogni volta che si avvia
    il dialogo, siccome cambiano per ogni operazione di vendita, avere i dati precedenti rischierebbe di essere fuorviante
    */
    bankAccount.setText(userParam.bankAccount);
    bankInterest.setText(userParam.bankInterest);
    profitOnSecurities.setText(userParam.profitOnSecurities);
    lossOnSecurities.setText(userParam.lossOnSecurities);
    interestOnBond.setText(userParam.interestOnBond);
}

/**
 * Read the params from the dialog
 */
function readDialogParams(){
    var userParam={};

    userParam.selectedItem=itemsCombobox.currentText;
    userParam.quantity=quantity.text;
    userParam.bankChargesAmount=bankChargesAmount.text;

    userParam.bankAccount=bankAccount.text;
    userParam.bankInterest=bankInterest.text;
    userParam.profitOnSecurities=profitOnSecurities.text;
    userParam.lossOnSecurities=lossOnSecurities.text;
    userParam.interestOnBond=interestOnBond.text;

    return userParam;


}

/**
 * Fills the dialogue combobox with the items found in the item table
 * @param {*} itemsCombobox 
 */
function insertComboBoxElements(itemsCombobox){
    //First set the editable attribute to true,in this way the user can also enter the text.
    itemsCombobox.editable=true;

    listString=[]; //list of the items in the combobox
    var itemsData=getItemsTableData("false"); //I give as parameter "false" as I only need the list of items

    //fill the listString with the existing items
    for(var e in itemsData){
        if(itemsData[e].item)
            listString.push(itemsData[e].item);
    }
    
    if(itemsCombobox)
        itemsCombobox.insertItems(1, listString);
}


function dialogExec(secType){

    SECTYPE=secType;
    var savedParam={};
    var userParam=initParam();

    //If there are resumes the last saved accounts, otherwise it is empty
    var savedParam = Banana.document.getScriptSettings("ch.banana.shares.sales.operation");
    if (savedParam.length > 0) {
        userParam = JSON.parse(savedParam);
        if(userParam){
            //set the user params
            setDialogAccountsParams(userParam);
        }
    }

    //fill the combobox with the existent items
    insertComboBoxElements(itemsCombobox);
    Banana.application.progressBar.pause();
    var dlgResult = dialog.exec();
    Banana.application.progressBar.resume();

    //Read the params
    userParam=readDialogParams();
    var paramToString = JSON.stringify(userParam);
    Banana.document.setScriptSettings("ch.banana.shares.sales.operation", paramToString);

    if (dlgResult !== 1)
        return false;
    else
        return true;


}