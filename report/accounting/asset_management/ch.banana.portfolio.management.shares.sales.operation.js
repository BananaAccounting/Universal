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
// @includejs = ch.banana.portfolio.management.calculation.methods.js
// @includejs = ch.banana.portfolio.management.sales.dialog.js

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
    //show the dialog
    var userParam=dialogExec("shares");
    var banDoc=Banana.document;

    if(userParam && banDoc){

        var salesOpArray=[];
        var currentSelectionBottom = banDoc.cursor.selectionBottom;
        var transList=[];
        var avgCost="";
        var multiCurrencyAcc=false;
        var currentSelectionTop = banDoc.cursor.selectionTop;
        var sharesData="";
        var itemsData=getItemsTableData();
        var currentRowDate="";
        var userParam=readDialogParams();

        multiCurrencyAcc=checkIfMultiCurrencyAccounting(banDoc);
        transList=getTransactionsTableData(banDoc,multiCurrencyAcc);
        currentRowDate=getCurrentRowDate(banDoc,transList);
        avgCost=getAverageCost(userParam.selectedItem,currentSelectionTop,transList);
        sharesData=calculateShareSaleData(avgCost,userParam);
        //Creates the document change for the sale of shares
        salesOpArray = createSharesSalesOpDocChange(currentSelectionBottom,currentRowDate,sharesData,multiCurrencyAcc,userParam,itemsData);
    
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
function createSharesSalesOpDocChange(currentSelectionBottom,currentRowDate,sharesData,multiCurrencyAccounting,userParam,itemsData){
    var jsonDoc = initJsonDoc();
    var rows=[];
    
    var amountColumn=getAmountColumn(multiCurrencyAccounting);

    rows.push(createSharesSalesOpDocChange_bankCharges(jsonDoc,currentRowDate,currentSelectionBottom,userParam,amountColumn));
    rows.push(createSharesSalesOpDocChange_profitOrLoss(jsonDoc,currentRowDate,sharesData,currentSelectionBottom,userParam,amountColumn));
    rows.push(createSharesSalesOpDocChange_sharesSale(jsonDoc,currentRowDate,currentSelectionBottom,userParam,itemsData));

    
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

function createSharesSalesOpDocChange_bankCharges(jsonDoc,currentRowDate,currentSelectionBottom,userParam,amountColumn){

    var opDescription="Sale shares "+userParam.selectedItem+" bank charges";
    var opCurrentSelectionBottom=currentSelectionBottom+".1"; //set with the correct format to indicate the sequence
    var opDate="";
    if(currentRowDate)
        opDate=currentRowDate;
    else
        opDate=jsonDoc.creator.executionDate;  
    var opAccount=userParam.bankInterest;
    var opAmount=userParam.bankChargesAmount;

    var row={};

    row.fields={};
    row.fields.Date=opDate;
    row.fields.Description=opDescription;
    row.fields.AccountDebit=opAccount;
    row.fields[amountColumn]=opAmount;

    row.operation={};
    row.operation.name="add";
    row.operation.sequence=opCurrentSelectionBottom;


    return row;
}

function createSharesSalesOpDocChange_profitOrLoss(jsonDoc,currentRowDate,sharesData,currentSelectionBottom,userParam,amountColumn){

    // set the description based on the result
    var opProfitOnSale=sharesData.profitOnSale;
    var resultDescription=setResultDecription(opProfitOnSale);
    var opDescription="Sale shares "+userParam.selectedItem+" "+resultDescription;
    //get the account based on the result
    var opAccount=getAccountForResult(opProfitOnSale,userParam);
    var opDate="";
    if(currentRowDate)
        opDate=currentRowDate;
    else
        opDate=jsonDoc.creator.executionDate;    
    var opCurrentSelectionBottom=currentSelectionBottom+".2"; //set with the correct format to indicate the sequence
    var opAmount=sharesData.result;

    var row={};

    row.fields={};
    row.fields.Date=opDate;
    row.fields.Description=opDescription;
    if(opProfitOnSale)
        row.fields.AccountCredit=opAccount;
    else
        row.fields.AccountDebit=opAccount;

    row.fields[amountColumn]=opAmount;

    row.operation={};
    row.operation.name="add";
    row.operation.sequence=opCurrentSelectionBottom;

    return row;

}

function createSharesSalesOpDocChange_sharesSale(jsonDoc,currentRowDate,currentSelectionBottom,userParam,itemsData){
        //temporary UPPERCASE variables, the user will define those values through a dialog
        var opAccount=getItemAccount(userParam.selectedItem,itemsData);
        var opDate="";
        if(currentRowDate)
            opDate=currentRowDate;
        else
            opDate=jsonDoc.creator.executionDate;  
        var opItem=userParam.selectedItem;
        var opQuantity="1";
        var opMarketPrice=userParam.marketPrice;
        if(userParam.quantity){
            opQuantity=userParam.quantity;
        }
    
        var opDescription="Sale shares "+userParam.selectedItem;
        var opCurrentSelectionBottom=currentSelectionBottom+".3"; //set with the correct format to indicate the sequence

        var row={};

        row.fields={};
        row.fields.Date=opDate;
        row.fields.ItemsId=opItem;
        row.fields.Description=opDescription;
        row.fields.AccountCredit=opAccount;
        row.fields.Quantity="-"+opQuantity;
        row.fields.UnitPrice=opMarketPrice;
    
        row.operation={};
        row.operation.name="add";
        row.operation.sequence=opCurrentSelectionBottom;

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
    