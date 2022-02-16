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


function exec(){

    //I first check that the user has created the imports table, otherwise I will inform the user.
    var banDoc=Banana.document.table("Imports");
    if(!banDoc){
        showMessage();
        return false;
    }

    //Add columns
    jsonDoc = { "format": "documentChange", "error": "" };
    jsonDoc["data"].push(createColumnsDocChange);

    return jsonDoc


}

function createColumnsDocChange(){

    var jsonDoc=addColumns();

    //columns
    var columns=[];

    //Column Processed
    var column={};
    column.operataion={};
    column.operataion.name="add"
    column.nameXml={};
    column.header1={};
    column={};
    columns.push(column);


    var dataUnits = {};
    dataUnits.nameXml = "Imports";
    dataUnits.data = {};
    dataUnits.data.viewList = [];
    dataUnits.data.viewList.push({ "columns": columns });

}

function showMessage(){
    return Banana.Ui.showInformation("Information", 'the Imports table does not exist, create the table and then run the command to create the columns.');
}