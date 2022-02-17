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
// @id = ch.banana.portfolio.management.add.columns.imports.table.js
// @api = 1.0
// @pubdate = 2022-02-16
// @publisher = Banana.ch SA
// @description = Add columns to imports table
// @task = app.command
// @doctype = 100.*
// @docproperties =
// @outputformat = none
// @inputdatasource = none
// @timeout = -1
// @includejs = ch.banana.portfolio.management.calculation.methods.js

/**
 * This extension creates the document change to add specific columns to the imports table. first the user has to create the table (tools-->Add/remove functionalities--> add simple table), then
 * run the command.
 * The columns that will be created are as follows: (XML names)
 * -Date
 * -ItemId
 * -NetAmount
 * -Price
 * -Quantity
 * -BankCharges
 * -Interest
 * -BankAccount
 * -Exchange Rate
 * -Currency
 * -Type
 * -Processed
 */

/**
 * Create a list with the new columns XML names and its type
 */
function setNewColumnList(){
    var columnsList={};

    columnsList.Date="Date";
    columnsList.ItemId="Text";
    columnsList.NetAmount="Amount";
    columnsList.Price="Amount";
    columnsList.Quantity="Number";
    columnsList.BankCharges="Amount";
    columnsList.Interest="Amount";
    columnsList.BankAccount="Text";
    columnsList.ExchangeRate="Number";
    columnsList.Currency="Text";
    columnsList.Type="Text";
    columnsList.Processed="Date/Time";

    return columnsList;

}

function columsAlreadyExist(column,existingColumns){
    for(var i=0;i<existingColumns.length;i++){
        if(column==existingColumns[i])
            return true;
    }
    return false;
}
function exec(){

    //I first check that the user has created the imports table, otherwise I will inform the user.
    var banDoc=Banana.document;
    if(banDoc){
        var table=banDoc.table("Imports");
    }
    if(!table){
        showMessage();
        return false;
    }

    //Add columns
    var jsonDoc = { "format": "documentChange", "error": "","data":[] };
    jsonDoc["data"].push(createColumns_DocChange(banDoc));

    return jsonDoc

}

function getColumnsList_DocChange(columnsList,banDoc){
    let columns=[];
    var table=banDoc.table("Imports");
    var existingColumns=table.columnNames;

    for(var key in columnsList){
        let column={};
        column.nameXml=key;
        column.header1=key;
        column.operation={};
        column.operation.name="add";
        column.definition={};
        column.definition.type=columnsList[key];
        if(!columsAlreadyExist(key,existingColumns)){
            columns.push(column);
        }
    }

    return columns;
}

function createColumns_DocChange(banDoc){

    var jsonDoc=initJsonDoc();
    var columnsList=setNewColumnList();

    //get the columns
    var columns=getColumnsList_DocChange(columnsList,banDoc);

    var dataUnits = {};
    dataUnits.nameXml = "Imports";
    dataUnits.id = "Imports";
    dataUnits.data = {};
    dataUnits.data.viewList = {};
    dataUnits.data.viewList.views = [];
    dataUnits.data.viewList.views.push({ "columns": columns });
    dataUnits.data.viewList.views.push({ "id": "Base" });
    dataUnits.data.viewList.views.push({ "NameXml": "Base"});
    dataUnits.data.viewList.views.push({ "nid": "1"});


    jsonDoc.document.dataUnits.push(dataUnits);

    return jsonDoc

}

function showMessage(){
    return Banana.Ui.showInformation("Information", 'the Imports table does not exist, create the table and then run the command to create the columns.');
}