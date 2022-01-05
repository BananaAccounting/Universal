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
// @id = ch.banana.stocks.sales.operation
// @api = 1.0
// @pubdate = 2022-01-13
// @publisher = Banana.ch SA
// @description = Stock sale operation
// @task = app.command
// @doctype = 100.*
// @docproperties =
// @outputformat = none
// @inputdatasource = none
// @timeout = -1

/**
 * This extension takes care of performing calculations and creating the record for the sale of securities with the document change.
 * Sale operation example:
 * 
 * Vend. 10000 stocks UBS                       |	1020    |           |   130'000.00 -----> to Bank, the specific account must be defined in a dialog
 * Vend. 10000 stocks UBS spese banca           |	6900    |	    	|   2'000.00 -------> no idea
 * Vend. 10000 stocks UBS perdita su vendita    |	4200    |	    	|   6'000.00 -----> Quantity multiplied for the difference between avg cost and market price
 * Vend. 10000 stocks UBS                       |		    |   1400	|   138'000.00-----> the stock account (to define how to get it, maybe all the purchase of the year, semester, ...)
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
var closeButton = dialog.findChild('closeButton');
var percCheckBox = dialog.findChild('perc_checkBox');
var decCheckBox = dialog.findChild('dec_checkBox');
var bankChargesAmountLineEdit = dialog.findChild('bank_charges_amount_lineEdit');
var okButton = dialog.findChild('okButton');
var closeButton = dialog.findChild('closeButton');

dialog.closeDialog = function () {
    dialog.close();
};

/** Dialog's events declaration */
closeButton.clicked.connect(dialog, dialog.closeDialog);

function dialogExec(){
    Banana.application.progressBar.pause();
    var dlgResult = dialog.exec();
    Banana.application.progressBar.resume();

    if (dlgResult !== 1)
        return false;
}

//Main function
function exec() {

    dialogExec();

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
    stocksActualData=getStocksActualData(avgCost)


    //Creates the document change for the sale of shares
    salesOpArray = createStocksSalesOpDocChange(currentSelectionBottom,avgCost,stocksActualData);

    jsonDoc = { "format": "documentChange", "error": "" };
    jsonDoc["data"] = salesOpArray;

    return jsonDoc;




}

function getStocksActualData(avgCost){
    var stocksActualData={};
    var MARKETCOST="14.6";
    var TEMPQT="10000";

    stocksActualData.avgCost=avgCost;
    stocksActualData.currentValue=Banana.SDecimal.multiply(stocksActualData.avgCost,TEMPQT);
    stocksActualData.marketValue=Banana.SDecimal.multiply(MARKETCOST,TEMPQT);
    stocksActualData.result=Banana.SDecimal.subtract(stocksActualData.currentValue,stocksActualData.marketValue);
    stocksActualData.profitOnSale=false;
    if(Banana.SDecimal.sign(stocksActualData.result)=="1")
        stocksActualData.profitOnSale=true;

    return stocksActualData;

}

function createStocksSalesOpDocChange(currentSelectionBottom,avgCost){
    var jsonDoc = initJsonDoc();
    var rows=[];

    rows.push(ccreateStocksSalesOpDocChange_receivedFromSale(jsonDoc,avgCost,currentSelectionBottom));
    rows.push(ccreateStocksSalesOpDocChange_bankCharges(jsonDoc,avgCost,currentSelectionBottom));
    rows.push(createStocksSalesOpDocChange_profitOrLoss(jsonDoc,stocksActualData,currentSelectionBottom));
    rows.push(createStocksSalesOpDocChange_stockSale(jsonDoc,avgCost,currentSelectionBottom));

    
    var dataUnitFilePorperties = {};
    dataUnitFilePorperties.nameXml = "Transactions";
    dataUnitFilePorperties.data = {};
    dataUnitFilePorperties.data.rowLists = [];
    dataUnitFilePorperties.data.rowLists.push({ "rows": rows });

    jsonDoc.document.dataUnits.push(dataUnitFilePorperties);

    return jsonDoc;
}

function createStocksSalesOpDocChange_receivedFromSale(jsonDoc,avgCost,currentSelectionBottom){
    var TEMPTYPE="UBS";
    var BANKINTERESTSACCOUNT="1020";
    var RECEIVED="";

    var opDescription="Sale stocks "+TEMPTYPE;
    currentSelectionBottom=currentSelectionBottom+".3"; //set with the correct format to indicate the sequence

    var row={
        "fields":{
            "Date":jsonDoc.creator.executionDate,
            "Description":opDescription,
            "AccountDebit":BANKINTERESTSACCOUNT,
            "AmountCurrency":RECEIVED

        },
        "operation":{
            "name":"add",
            "sequence":currentSelectionBottom
        }
    }

    return row;
}

function createStocksSalesOpDocChange_bankCharges(jsonDoc,avgCost,currentSelectionBottom){
    var TEMPTYPE="UBS";
    var BANKINTERESTSACCOUNT="6900";
    var BANKCHARGES="";

    var opDescription="Sale stocks "+TEMPTYPE+" bank charges";
    currentSelectionBottom=currentSelectionBottom+".3"; //set with the correct format to indicate the sequence

    var row={
        "fields":{
            "Date":jsonDoc.creator.executionDate,
            "Description":opDescription,
            "AccountDebit":BANKINTERESTSACCOUNT,
            "AmountCurrency":BANKCHARGES

        },
        "operation":{
            "name":"add",
            "sequence":currentSelectionBottom
        }
    }

    return row;
}

function createStocksSalesOpDocChange_profitOrLoss(jsonDoc,stocksActualData,currentSelectionBottom){

    var TEMPTYPE="UBS";
    var SALESACCOUNT="4200";
    var resultDescription=setResultDecription(stocksActualData.profitOnSale);

    var opDescription="Sale stocks "+TEMPTYPE+" "+resultDescription;
    currentSelectionBottom=currentSelectionBottom+".3"; //set with the correct format to indicate the sequence

    var row={
        "fields":{
            "Date":jsonDoc.creator.executionDate,
            "Description":opDescription,
            "AccountDebit":SALESACCOUNT,
            "AmountCurrency":stocksActualData.result //ricordarsi di controllare se si tratta di una contabilita multimoneta o meno

        },
        "operation":{
            "name":"add",
            "sequence":currentSelectionBottom
        }
    }

    return row;

}

function createStocksSalesOpDocChange_stockSale(jsonDoc,avgCost,currentSelectionBottom){
        //temporary UPPERCASE variables, the user will define those values through a dialog

        var TEMPQT="10000";
        TEMPQT="-"+TEMPQT;
        var TEMPTYPE="UBS";
        var STOCKACCOUNT="1400";
    
        var opDescription="Sale stocks "+TEMPTYPE;
        currentSelectionBottom=currentSelectionBottom+".4"; //set with the correct format to indicate the sequence
    
        var row={
            "fields":{
                "Date":jsonDoc.creator.executionDate,
                "DocType":"s",
                "ItemsId":TEMPTYPE,
                "Description":opDescription,
                "AccountCredit":STOCKACCOUNT,
                "Quantity":TEMPQT,
                "UnitPrice":avgCost
            },
            "operation":{
                "name":"add",
                "sequence":currentSelectionBottom
            }
        }

        return row;
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
    