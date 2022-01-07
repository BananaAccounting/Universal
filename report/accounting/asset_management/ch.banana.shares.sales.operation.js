// Copyright [2022] [Banana.ch SA - Lugano Switzerland]
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
// @id = ch.banana.shares.sales.operation
// @api = 1.0
// @pubdate = 2022-01-13
// @publisher = Banana.ch SA
// @description = Shares sales operation
// @task = app.command
// @doctype = 100.*
// @docproperties =
// @outputformat = none
// @inputdatasource = none
// @timeout = -1
// @includejs = ch.banana.securities.accounts.settings.js

/**
 * This extension takes care of performing calculations and creating the record for the sale of shares with the document change.
 * Sale operation example:
 * 
 * Vend. 10000 shares UBS                       |	1020    |           |   130'000.00 
 * Vend. 10000 shares UBS spese banca           |	6900    |	    	|   2'000.00 
 * Vend. 10000 shares UBS perdita su vendita    |	4200    |	    	|   6'000.00 
 * Vend. 10000 shares UBS                       |		    |   1400	|   138'000.00
 * 
 * L'utente dovra definire in un dialogo dei settings:il conto della banca, delle spese bancarie, delle vendite e del titolo
 * 
 */

/*******************************************
 * 
 * DIALOG SETUP
 * 
 *******************************************/

/** Dialog's functions declaration */
dialog=Banana.Ui.createUi("ch.banana.stocks.sales.ui");

var itemsCombobox = dialog.findChild('item_comboBox');
var quantityLineEdit = dialog.findChild('quantity_lineEdit');
var marketPrice_lineEdit=dialog.findChild('marketPrice_lineEdit');
var closeButton = dialog.findChild('closeButton');
var percCheckBox = dialog.findChild('perc_checkBox');
var decCheckBox = dialog.findChild('dec_checkBox');
var bankChargesAmountLineEdit = dialog.findChild('bank_charges_amount_lineEdit');
var okButton = dialog.findChild('okButton');
var closeButton = dialog.findChild('closeButton');

dialog.closeDialog = function () {
    dialog.close();
};


function insertComboBoxElements(){
    listString=[]; //list of the items in the combobox
    var itemsData=getItemsTableData();

    //fill the listString with the existing items
    for(var e in itemsData){
        if(itemsData[e].item)
            listString.push(itemsData[e].item);
    }
    
    itemsCombobox.insertItems(1, listString);
}

function getItemsTableData(){
    //get the items list from the items table
    var itemsData=[];
    let table = Banana.document.table("Items");
    let value = "";
    if (!table) {
        return value;
    }
    for (var i = 0; i < table.rowCount; i++) {
        var tRow = table.row(i);
        var itemData={};
        itemData.item = tRow.value("ItemsId");
        itemData.bankAccount=tRow.value("Account");
        if (itemsData) {
            itemsData.push(itemData);
        }
    }
    return itemsData;
}


function dialogExec(){

    saleParam={};

    //fill the combobox
    insertComboBoxElements();

    Banana.application.progressBar.pause();
    var dlgResult = dialog.exec();
    Banana.application.progressBar.resume();

    saleParam.selectedItem=itemsCombobox.currentText;
    saleParam.quantity=quantityLineEdit.text;
    saleParam.marketPrice=marketPrice_lineEdit.text;
    saleParam.perc=percCheckBox.checked; //checked property from QAbstractButton
    saleParam.dec=decCheckBox.checked; //checked property from QAbstractButton
    saleParam.bankCharges=bankChargesAmountLineEdit.text;

    if (dlgResult !== 1)
        return false;
    else
        return saleParam;


}


//Main function
function exec() {

    //show the dialog to the user abd retrieve the parameters for the sale.
    var saleParam=dialogExec();
    //retrieve accounts parameters
    var accParam = Banana.document.getScriptSettings("ch.banana.securities.accounts.settings");
    accParam=JSON.parse(accParam);

    var banDoc=Banana.document;
    var transactionsList=[];
    var avgCost="";
    var salesOpArray=[];
    //current selected row
    var currentSelectionTop = banDoc.cursor.selectionTop;
    var currentSelectionBottom = banDoc.cursor.selectionBottom;

    if(!banDoc)
        return false;
    
    transactionsList=getTransactionsTableData(banDoc);
    avgCost=getAverageCost(transactionsList,currentSelectionTop);
    sharesActualData=calculateSharesActualData(avgCost,saleParam)


    //Creates the document change for the sale of shares
    salesOpArray = createSharesSalesOpDocChange(currentSelectionBottom,avgCost,sharesActualData,saleParam,accParam);

    jsonDoc = { "format": "documentChange", "error": "" };
    jsonDoc["data"] = salesOpArray;

    return jsonDoc;




}

function calculateSharesActualData(avgCost,saleParam){
    var sharesActualData={};

    sharesActualData.avgCost=avgCost;
    sharesActualData.currentValue=Banana.SDecimal.multiply(sharesActualData.avgCost,saleParam.quantity);
    sharesActualData.marketValue=Banana.SDecimal.multiply(saleParam.marketPrice,saleParam.quantity);
    sharesActualData.result=Banana.SDecimal.subtract(sharesActualData.currentValue,sharesActualData.marketValue);
    sharesActualData.profitOnSale=false;
    if(Banana.SDecimal.sign(sharesActualData.result)=="1")
    sharesActualData.profitOnSale=true;

    return sharesActualData;

}

function createSharesSalesOpDocChange(currentSelectionBottom,avgCost,sharesActualData,saleParam,accParam){
    var jsonDoc = initJsonDoc();
    var rows=[];

    rows.push(createSharesSalesOpDocChange_receivedFromSale(jsonDoc,currentSelectionBottom,saleParam,accParam));
    rows.push(createSharesSalesOpDocChange_bankCharges(jsonDoc,currentSelectionBottom,saleParam,accParam));
    rows.push(createSharesSalesOpDocChange_profitOrLoss(jsonDoc,sharesActualData,currentSelectionBottom,saleParam,accParam));
    rows.push(createSharesSalesOpDocChange_sharesSale(jsonDoc,avgCost,currentSelectionBottom,saleParam,accParam));

    
    var dataUnitFilePorperties = {};
    dataUnitFilePorperties.nameXml = "Transactions";
    dataUnitFilePorperties.data = {};
    dataUnitFilePorperties.data.rowLists = [];
    dataUnitFilePorperties.data.rowLists.push({ "rows": rows });

    jsonDoc.document.dataUnits.push(dataUnitFilePorperties);

    return jsonDoc;
}

function createSharesSalesOpDocChange_receivedFromSale(jsonDoc,currentSelectionBottom,saleParam,accParam){

    //calculate the effective amount entering the bank (x10.01.2022)

    var opDescription="Sale shares "+saleParam.selectedItem;
    currentSelectionBottom=currentSelectionBottom+".3"; //set with the correct format to indicate the sequence

    var row={
        "fields":{
            "Date":jsonDoc.creator.executionDate,
            "Description":opDescription,
            "AccountDebit":accParam.bankAccount,
            "AmountCurrency":"RECEIVED"

        },
        "operation":{
            "name":"add",
            "sequence":currentSelectionBottom
        }
    }

    return row;
}

function createSharesSalesOpDocChange_bankCharges(jsonDoc,currentSelectionBottom,saleParam,accParam){

    var opDescription="Sale shares "+saleParam.selectedItem+" bank charges";
    currentSelectionBottom=currentSelectionBottom+".3"; //set with the correct format to indicate the sequence

    var row={
        "fields":{
            "Date":jsonDoc.creator.executionDate,
            "Description":opDescription,
            "AccountDebit":accParam.bankCharges,
            "AmountCurrency":saleParam.bankCharges

        },
        "operation":{
            "name":"add",
            "sequence":currentSelectionBottom
        }
    }

    return row;
}

function createSharesSalesOpDocChange_profitOrLoss(jsonDoc,sharesActualData,currentSelectionBottom,saleParam,accParam){

    // set the description based on the result
    var resultDescription=setResultDecription(sharesActualData.profitOnSale);
    //get the account based on the result
    var resultAccount=getResultAccount(sharesActualData.profitOnSale,accParam);

    var opDescription="Sale shares "+saleParam.selectedItem+" "+resultDescription;
    currentSelectionBottom=currentSelectionBottom+".3"; //set with the correct format to indicate the sequence

    var row={
        "fields":{
            "Date":jsonDoc.creator.executionDate,
            "Description":opDescription,
            "AccountDebit":resultAccount,
            "AmountCurrency":sharesActualData.result //ricordarsi di controllare se si tratta di una contabilita multimoneta o meno

        },
        "operation":{
            "name":"add",
            "sequence":currentSelectionBottom
        }
    }

    return row;

}

function getItemAccount(item){
    itemsData=getItemsTableData();
    //fill the listString with the existing items
    if(itemsData){
        for(var e in itemsData){
            if(itemsData[e].item==item)
                return itemsData[e].bankAccount;
        }
    }else 
        return false;

}

function createSharesSalesOpDocChange_sharesSale(jsonDoc,avgCost,currentSelectionBottom,saleParam){
        //temporary UPPERCASE variables, the user will define those values through a dialog
        account=getItemAccount(saleParam.selectedItem);
        Banana.console.debug(JSON.stringify(saleParam.selectedItem));
        var quantity="1";
        if(saleParam.quantity){
            quantity=saleParam.quantity;
        }
    
        var opDescription="Sale shares "+saleParam.selectedItem;
        currentSelectionBottom=currentSelectionBottom+".4"; //set with the correct format to indicate the sequence
    
        var row={
            "fields":{
                "Date":jsonDoc.creator.executionDate,
                "DocType":"s",
                "ItemsId":saleParam.selectedItem,
                "Description":opDescription,
                "AccountCredit":account,
                "Quantity":"-"+quantity,
                "UnitPrice":avgCost
            },
            "operation":{
                "name":"add",
                "sequence":currentSelectionBottom
            }
        }

        return row;
}

function getResultAccount(profitOnSale,accParam){
    var account="";

    if(profitOnSale){
        account=accParam.profitOnSecurieties;
    }else{
        account=accParam.lossOnSecurieties;
    }

    return account;
}

function setResultDecription(profitOnSale){
    var description="";

    if(profitOnSale)
        description="profit on sale";
    else
        description="loss on sale";

    return description;
}

/**
 * Initialise the Json document
 * @returns 
 */
 function initJsonDoc() {
    var jsonDoc = {};
    jsonDoc.document = {};
    jsonDoc.document.dataUnitsfileVersion = "1.0.0";
    jsonDoc.document.dataUnits = [];

    jsonDoc.creator = {};
    var d = new Date();
    var datestring = d.getFullYear() + ("0" + (d.getMonth() + 1)).slice(-2) + ("0" + d.getDate()).slice(-2);
    var timestring = ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
    jsonDoc.creator.executionDate = Banana.Converter.toInternalDateFormat(datestring, "yyyymmdd");
    jsonDoc.creator.name = Banana.script.getParamValue('id');
    jsonDoc.creator.version = "1.0";

    return jsonDoc;
}


//Define the average cost
/**
 * mi leggo le registazioni di acquisto ed il prezzo unitario (a differenza del report però devo fare attenzione a non prendere tutte le registrazioni di acquisto ma solo quelle utili )
 */
function getAverageCost(transactionsList,currentSelectionTop){
    //per ora prendo tutti gli acquisti fatti prima della riga selezionata
    var unitPrices=[];
    var unitPrice="";
    var avgCost="";
    var item="UBS";//questo deve essere definito dall utente

    
    for (var i = 0; i < transactionsList.length; i++) {
        if (transactionsList[i].row<=currentSelectionTop && transactionsList[i].item==item) {
            unitPrice = transactionsList[i].unitPrice;
            if (unitPrice.length > 0) {
                unitPrices.push(unitPrice);
            }
        }
    }

    avgCost=getAverageCost_calc(unitPrices);

    return avgCost;


}

function getAverageCost_calc(unitPrices){

    var avgCost="";

    for (var i = 0; i < unitPrices.length; i++) {
        avgCost = Banana.SDecimal.add(avgCost, unitPrices[i]);
    }
    //divido la somma per il numero di elementi.

    avgCost = Banana.SDecimal.divide(avgCost, unitPrices.length);

    return avgCost;

}

/**
 * Get the data from the transactions table only once
 */
function getTransactionsTableData(banDoc){
    var transactionsList = [];
    var trnsactionsTable = banDoc.table("Transactions");


    if (trnsactionsTable) {
        for (var i = 0; i < trnsactionsTable.rowCount; i++) {
            var trData={};
            var tRow = trnsactionsTable.row(i);
            trData.row=tRow.rowNr;
            trData.date=tRow.value("Date");
            trData.type=tRow.value("DocType");
            trData.item=tRow.value("ItemsId");
            trData.description=tRow.value("Description");
            trData.debit=tRow.value("AccountDebit");
            trData.credit=tRow.value("AccountCredit");
            trData.qt=tRow.value("Quantity");;
            trData.unitPrice=tRow.value("UnitPrice");
            //check if it is a multichange file or not
            trData.currencyAmount="AmountCurrency";
            trData.currency="ExchangeCurrency";

            transactionsList.push(trData);

        }
    } else(Banana.console.debug("no transactions table"));

    return transactionsList;
}
    