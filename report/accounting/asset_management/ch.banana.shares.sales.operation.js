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
// @includejs = ch.banana.securities.calculation.methods.js
// @includejs = ch.banana.securities.dialog.js

/**
 * This extension creates the registration for the sale of shares using the document change, 
 * Sale operation example:
 * 
 * Vend. 10000 shares UBS                       |	1020    |           |   130'000.00 
 * Vend. 10000 shares UBS spese banca           |	6900    |	    	|   2'000.00 
 * Vend. 10000 shares UBS perdita su vendita    |	4200    |	    	|   6'000.00 
 * Vend. 10000 shares UBS                       |		    |   1400	|   138'000.00
 * 
 */


//Main function
function exec() {

    var banDoc=Banana.document;
    var salesOpArray=[];
    var currentSelectionBottom = banDoc.cursor.selectionBottom;
    //show the dialog
    var userParam=dialogExec();

    if(userParam && banDoc){

        var banDoc=Banana.document;
        var transList=[];
        var avgCost="";
        var multiCurrencyAcc=false;
        var currRow = banDoc.cursor.selectionTop;
        var sharesData="";
        var userParam=readDialogParams();

        multiCurrencyAcc=checkIfMultiCurrencyAccounting(banDoc);
        transList=getTransactionsTableData(banDoc);
        avgCost=getAverageCost(transList,currRow,userParam);
        sharesData=calculateSharesData(avgCost,userParam);
        //Creates the document change for the sale of shares
        salesOpArray = createSharesSalesOpDocChange(currentSelectionBottom,avgCost,sharesData,multiCurrencyAcc,userParam);
    
        jsonDoc = { "format": "documentChange", "error": "" };
        jsonDoc["data"] = salesOpArray;
    
        return jsonDoc;

    }else{
        return false;
    }
}

/**
 * To create the transactions, I assume that the net entry has been made (received from the bank).
 * @param {*} currentSelectionBottom line on which the cursor currently rests
 * @param {*} avgCost calculated average cost
 * @param {*} sharesData calculated share data 
 * @param {*} multiCurrencyAccounting true if the document is a multicurrency accounting (number 120)
 * @param {*} userParam parameters defined by the user
 * @returns returns the Json document
 */
function createSharesSalesOpDocChange(currentSelectionBottom,avgCost,sharesData,multiCurrencyAccounting,userParam){
    var jsonDoc = initJsonDoc();
    var rows=[];

    
    var amountColumn=getAmountColumn(multiCurrencyAccounting);

    rows.push(createSharesSalesOpDocChange_bankCharges(jsonDoc,currentSelectionBottom,userParam));
    rows.push(createSharesSalesOpDocChange_profitOrLoss(jsonDoc,sharesData,currentSelectionBottom,userParam));
    rows.push(createSharesSalesOpDocChange_sharesSale(jsonDoc,avgCost,currentSelectionBottom,userParam));

    
    var dataUnitFilePorperties = {};
    dataUnitFilePorperties.nameXml = "Transactions";
    dataUnitFilePorperties.data = {};
    dataUnitFilePorperties.data.rowLists = [];
    dataUnitFilePorperties.data.rowLists.push({ "rows": rows });

    jsonDoc.document.dataUnits.push(dataUnitFilePorperties);

    return jsonDoc;
}

/**
 * creates a record of net income in the bank (currently disabled)
 * @param {*} jsonDoc 
 * @param {*} currentSelectionBottom 
 * @param {*} saleParam 
 * @param {*} accParam 
 * @returns 
 */
/*function createSharesSalesOpDocChange_receivedFromSale(jsonDoc,sharesData,currentSelectionBottom,saleParam,accParam,amountColumn){

    var recAmount=Banana.SDecimal.subtract(sharesData.currentValue,saleParam.bankCharges); //current shares values minus the bank charges
    recAmount=Banana.SDecimal.add(recAmount,sharesData.result); //plus the profit (+value) / loss (- value)


    var opDescription="Sale shares "+saleParam.selectedItem;
    currentSelectionBottom=currentSelectionBottom+".3"; //set with the correct format to indicate the sequence

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
    row.fields[amountColumn]=recAmount;


    return row;
}*/

function createSharesSalesOpDocChange_bankCharges(jsonDoc,currentSelectionBottom,userParam){

    var opDescription="Sale shares "+userParam.selectedItem+" bank charges";
    var opCurrentSelectionBottom=currentSelectionBottom+".1"; //set with the correct format to indicate the sequence
    var opDate=jsonDoc.creator.executionDate;
    var opAccount=userParam.bankInterest;
    var opAmount=userParam.bankChargesAmount;

    var row={
        "fields":{
            "Date":opDate,
            "Description":opDescription,
            "AccountDebit":opAccount,
            "AmountCurrency":opAmount,

        },
        "operation":{
            "name":"add",
            "sequence":opCurrentSelectionBottom
        }
    }

    return row;
}

function createSharesSalesOpDocChange_profitOrLoss(jsonDoc,sharesData,currentSelectionBottom,userParam){

    // set the description based on the result
    var resultDescription=setResultDecription(sharesData.profitOnSale);
    var opDescription="Sale shares "+userParam.selectedItem+" "+resultDescription;
    //get the account based on the result
    var opAccount=getAccountForResult(sharesData.profitOnSale,userParam);
    var opDate=jsonDoc.creator.executionDate;
    var opCurrentSelectionBottom=currentSelectionBottom+".2"; //set with the correct format to indicate the sequence
    var opResult=sharesData.result;

    var row={
        "fields":{
            "Date":opDate,
            "Description":opDescription,
            "AccountDebit":opAccount,
            "AmountCurrency":opResult //ricordarsi di controllare se si tratta di una contabilita multimoneta o meno

        },
        "operation":{
            "name":"add",
            "sequence":opCurrentSelectionBottom
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

function createSharesSalesOpDocChange_sharesSale(jsonDoc,avgCost,currentSelectionBottom,userParam){
        //temporary UPPERCASE variables, the user will define those values through a dialog
        var opAccount=getItemAccount(userParam.selectedItem);
        var opDate=jsonDoc.creator.executionDate;
        var opItem=userParam.selectedItem;
        var opQuantity="1";
        var opAvgCost=avgCost;
        if(userParam.quantity){
            opQuantity=userParam.quantity;
        }
    
        var opDescription="Sale shares "+userParam.selectedItem;
        var opCurrentSelectionBottom=currentSelectionBottom+".3"; //set with the correct format to indicate the sequence
    
        var row={
            "fields":{
                "Date":opDate,
                "DocType":"s",
                "ItemsId":opItem,
                "Description":opDescription,
                "AccountCredit":opAccount,
                "Quantity":"-"+opQuantity,
                "UnitPrice":opAvgCost
            },
            "operation":{
                "name":"add",
                "sequence":opCurrentSelectionBottom
            }
        }

        return row;
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
    