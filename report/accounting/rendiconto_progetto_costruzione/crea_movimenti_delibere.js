// Copyright [2020] [Banana.ch SA - Lugano Switzerland]
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
// @api = 1.1
// @id = crea_movimenti_delibere.js
// @description = Crea i movimenti delle delibere
// @task = app.command
// @doctype = 110.*
// @publisher = Banana.ch SA
// @pubdate = 2021-04-28
// @inputdatasource = none
// @timeout = -1

/**
 * initialises the document change structure
 */
function initDocument() {
    var jsonDoc = {};
    jsonDoc.document = {};
    jsonDoc.document.dataUnits = [];

    jsonDoc.creator = {};
    jsonDoc.creator.executionDate = getCurrentDate();
    jsonDoc.creator.name = Banana.script.getParamValue('id');
    jsonDoc.creator.version = "1.0";


    return jsonDoc;

}

/**
 * set the row operation, the row fields and the table
 * @returns 
 */
function deliberationRowAppend() {

    //rows
    let rows = [];
    let categories_list = loadBudgetColumnValues();
    let sequence = 1.0;
    let sequence_incr = 0.1;

    for (var key in categories_list) {

        //row operation
        let row = {};
        row.operation = {};
        row.operation.name = "add";
        // row.operation.sequence = sequence + sequence_incr;

        row.fields = {};
        row.fields["Date"] = getCurrentDate();
        row.fields["Description"] = categories_list[key].description;
        row.fields["Expenses"] = categories_list[key].budget;
        row.fields["Category"] = categories_list[key].category;
        row.fields["Cc1"] = "Non assegnati";

        rows.push(row);
    }

    //table
    var dataUnitTransactions = {};
    dataUnitTransactions.nameXml = "Budget";
    dataUnitTransactions.data = {};
    dataUnitTransactions.data.rowLists = [];
    dataUnitTransactions.data.rowLists.push({ "rows": rows });

    //document
    var jsonDoc = initDocument();
    jsonDoc.document.dataUnits.push(dataUnitTransactions);


    return jsonDoc;

}

function getCurrentDate() {
    var d = new Date();
    var datestring = d.getFullYear() + ("0" + (d.getMonth() + 1)).slice(-2) + ("0" + d.getDate()).slice(-2);
    return Banana.Converter.toInternalDateFormat(datestring, "yyyymmdd");
}

function loadBudgetColumnValues() {
    let categories_list = [];

    if (!Banana.document) {
        return categories_list;
    }
    var table = Banana.document.table("Categories");
    if (!table) {
        return categories_list;
    }
    for (var i = 2; i < table.rowCount; i++) {
        let categories = {};
        var tRow = table.row(i);

        categories.budget = tRow.value("PreventivoMassima");
        categories.description = tRow.value("Description");
        categories.category = tRow.value("Category");

        categories_list.push(categories);

    }
    return categories_list;
}

function exec(inData) {

    if (!Banana.document)
        return "@Cancel"

    var documentChange = { "format": "documentChange", "error": "", "data": [] };

    //1. Appends a row to the transaction table
    var jsonDoc = deliberationRowAppend();
    documentChange["data"].push(jsonDoc);
    // Banana.console.debug(JSON.stringify(documentChange));

    return documentChange;
}