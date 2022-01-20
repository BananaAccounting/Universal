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
// @id = ch.banana.portfolio.management.closing.operation
// @api = 1.0
// @pubdate = 2022-01-20
// @publisher = Banana.ch SA
// @description = Closing operation
// @task = app.command
// @doctype = 100.*
// @docproperties =
// @outputformat = none
// @inputdatasource = none
// @timeout = -1
// @includejs = ch.banana.portfolio.management.calculation.methods.js
// @includejs = ch.banana.portfolio.management.sales.dialog.js

/**
 * This extension creates the registration for the sale of shares using the document change
 * 
 * */

//Main function
function exec() {

    var banDoc=Banana.document;
    //show the dialog
    var userParam=dialogExec();

    if(userParam && banDoc){

        var salesOpArray=[];
        var itemsData=getItemsTableData();
        var currentSelectionBottom = banDoc.cursor.selectionBottom;
        var transList=[];
        var multiCurrencyAcc=false;
        var currentSelectionTop = banDoc.cursor.selectionTop;
        var currentRowDate="";
        var closingData="";
        var userParam=readDialogParams();

        multiCurrencyAcc=checkIfMultiCurrencyAccounting(banDoc);
        transList=getTransactionsTableData(banDoc,multiCurrencyAcc);
        currentRowDate=getCurrentRowDate(banDoc,transList);
        closingData=calculateSecurityClosingData(banDoc,userParam,itemsData)
        //Creates the document change for the closing transaction
        salesOpArray = createClosingOpDocChange(currentSelectionBottom,currentRowDate,multiCurrencyAcc,userParam,closingData);
    
        jsonDoc = { "format": "documentChange", "error": "" };
        jsonDoc["data"] = salesOpArray;
    
        return jsonDoc;

    }else{
        return false;
    }
}

/**
 * 
 * @param {*} currentSelectionBottom the row under the selected one
 * @param {*} currentRowDate the date in the selected row
 * @param {*} multiCurrencyAccounting true if we work on a multycurrency accounting
 * @param {*} userParam 
 * @param {*} closingData 
 * @returns 
 */
function createClosingOpDocChange(currentSelectionBottom,currentRowDate,multiCurrencyAccounting,userParam,closingData){
    var jsonDoc = initJsonDoc();
    var rows=[];
    
    var amountColumn=getAmountColumn(multiCurrencyAccounting);

    rows.push(createClosingOpDocChange_adjustment(jsonDoc,currentRowDate,currentSelectionBottom,userParam,amountColumn,closingData));

    
    var dataUnitFilePorperties = {};
    dataUnitFilePorperties.nameXml = "Transactions";
    dataUnitFilePorperties.data = {};
    dataUnitFilePorperties.data.rowLists = [];
    dataUnitFilePorperties.data.rowLists.push({ "rows": rows });

    jsonDoc.document.dataUnits.push(dataUnitFilePorperties);

    return jsonDoc;
}

function createClosingOpDocChange_adjustment(jsonDoc,currentRowDate,currentSelectionBottom,userParam,amountColumn,closingData){

    var resultDescription=setResultDecription(closingData.profit);
    var opDescription="Adjustment "+"("+resultDescription+")";
    var opCurrentSelectionBottom=currentSelectionBottom+".1"; //set with the correct format to indicate the sequence
    var opDate="";
    var opItem=userParam.selectedItem;
    if(currentRowDate)
        opDate=currentRowDate;
    else
        opDate=jsonDoc.creator.executionDate;   
    var opDebitAccount=closingData.profit? closingData.account:userParam.lossOnSecurities;
    var opCreditAccount=closingData.profit? userParam.peofitOnSecurities:closingData.account;
    var opAmount=closingData.adjustment;

    var row={};

    row.fields={};
    row.fields.Date=opDate;
    row.fields.ItemsId=opItem;
    row.fields.Description=opDescription;
    row.fields.AccountDebit=opDebitAccount;
    row.fields.AccountCredit=opCreditAccount;
    row.fields[amountColumn]=opAmount;

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
    