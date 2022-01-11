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
// @id = ch.banana.shares.adjustment.operation
// @api = 1.0
// @pubdate = 2022-01-13
// @publisher = Banana.ch SA
// @description = Shares adjustment operation
// @task = app.command
// @doctype = 100.*
// @docproperties =
// @outputformat = none
// @inputdatasource = none
// @timeout = -1
// @includejs = ch.banana.securities.accounts.settings.js

/**
 * This extension takes care of performing calculations and creating the record for the adjustment of shares account with the document change.
 * Sale operation example:
 * 
 * Utile-->Adjustment  on 31.12 shares UBS                       |	1400    |    3200       |   130'000.00 
 * Perdita-->Adjustment  on 31.12 shares UBS                     |	4200    |    1400       |   130'000.00 
 * 
 * 
 */

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
        itemData.currentQt=tRow.value("QuantityCurrent");
        if (itemsData) {
            itemsData.push(itemData);
        }
    }
    return itemsData;
}



//Main function
function exec() {

    //show the dialog to the user abd retrieve the parameters for the sale.
    var adjustmentParam=dialogExec();
    //retrieve accounts parameters
    var accParam = Banana.document.getScriptSettings("ch.banana.securities.accounts.settings");
    accParam=JSON.parse(accParam);

    var banDoc=Banana.document;
    var transactionsList=[];
    var avgCost="";
    var itemCurrentQt="";
    var salesOpArray=[];
    var multiCurrencyAccounting=false;
    //current selected row
    var currentSelectionTop = banDoc.cursor.selectionTop;
    var currentSelectionBottom = banDoc.cursor.selectionBottom;

    if(!banDoc)
        return false;
    
    multiCurrencyAccounting=checkIfMultiCurrencyAccounting(banDoc);
    transactionsList=getTransactionsTableData(banDoc);
    avgCost=getAverageCost(transactionsList,currentSelectionTop);
    itemCurrentQt=getItemCurrentQt(item);
    sharesActualData=calculateSharesActualData(avgCost,itemCurrentQt,adjustmentParam);


    //Creates the document change for the sale of shares
    salesOpArray = createSharesAdjustmentOpDocChange(currentSelectionBottom,avgCost,sharesActualData,adjustmentParam,accParam,multiCurrencyAccounting);

    jsonDoc = { "format": "documentChange", "error": "" };
    jsonDoc["data"] = salesOpArray;

    return jsonDoc;




}

/**
 * get the current qt for the passed item
 * @param {*} item 
 */
function getItemCurrentQt(item){
    itemsData=getItemsTableData();

    if(itemsData){
        for(var e in itemsData){
            if(itemsData[e].item==item)
                return itemsData[e].currentQt;
        }
    }

}

function checkIfMultiCurrencyAccounting(banDoc){
    //file type numbers
    var multiCurrency="120";
    var isMultiCurrency=false;

    //get the document info and check the type of the accounting file
    var fileNumber=banDoc.info("Base","FileTypeNumber");

    if(fileNumber==multiCurrency){
        isMultiCurrency=true;
    }


    return isMultiCurrency;


}

function calculateSharesActualData(avgCost,itemCurrentQt,adjustmentParam){
    var sharesActualData={};

    sharesActualData.avgCost=avgCost;
    sharesActualData.currentValue=Banana.SDecimal.multiply(sharesActualData.avgCost,itemCurrentQt);
    sharesActualData.marketValue=Banana.SDecimal.multiply(adjustmentParam.marketPrice,itemCurrentQt);
    sharesActualData.result=Banana.SDecimal.subtract(sharesActualData.currentValue,sharesActualData.marketValue);
    sharesActualData.adjustmentProfit=false;
    if(Banana.SDecimal.sign(sharesActualData.result)=="1")
    sharesActualData.adjustmentProfit=true;

    return sharesActualData;

}

function createSharesAdjustmentOpDocChange(currentSelectionBottom,avgCost,sharesActualData,adjustmentParam,accParam,multiCurrencyAccounting){
    var jsonDoc = initJsonDoc();
    var rows=[];

    var amountColumn=getAmountColumn(multiCurrencyAccounting);

    rows.push(createAdjustmentOpDocChange(jsonDoc,sharesActualData,currentSelectionBottom,adjustmentParam,accParam,amountColumn));

    
    var dataUnitFilePorperties = {};
    dataUnitFilePorperties.nameXml = "Transactions";
    dataUnitFilePorperties.data = {};
    dataUnitFilePorperties.data.rowLists = [];
    dataUnitFilePorperties.data.rowLists.push({ "rows": rows });

    jsonDoc.document.dataUnits.push(dataUnitFilePorperties);

    return jsonDoc;
}

/**
 * defines the xml name of the column where the amount is entered 
 * according to whether it is a multi-currency account or not
 * @param {*} multiCurrencyAccounting 
 */
function getAmountColumn(multiCurrencyAccounting){
    var columnName="Amount";

    if(multiCurrencyAccounting){
        columnName="AmountCurrency";
    }

    return columnName;
}

function createAdjustmentOpDocChange(jsonDoc,sharesActualData,currentSelectionBottom,adjustmentParam,accParam,amountColumn){

    var resultDescription=setAdjustmentDecription(sharesActualData.adjustmentProfit); //settare la descrizione
    var opDescription="Adjustment"+adjustmentParam.selectedItem+" "+resultDescription;
    currentSelectionBottom=currentSelectionBottom;

    var row={};
    row.fields={};
    row.fields.Date=jsonDoc.creator.executionDate;
    row.fields.Description=opDescription;
    row.fields.AccountDebit=opDescription;
    row.fields.AccountDebit=opDescription;

    row.operation={};
    row.operation.name="add";
    row.sequence.name="add";


    var row={
        "fields":{
            "Date":jsonDoc.creator.executionDate,
            "Description":opDescription,
            "AccountDebit":accParam.bankAccount,

        },
        "operation":{
            "name":"add",
            "sequence":currentSelectionBottom
        }
    }

    //set the amount column
    row.fields[amountColumn]=sharesActualData.result;


    return row;
}

function setAdjustmentDecription(profitOnAdj){
    var description="";

    if(profitOnAdj)
        description="(Profit)";
    else
    profitOnAdj="(Loss)";

    return description;
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
    