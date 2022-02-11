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
// @id = ch.banana.create.transactions
// @api = 1.0
// @pubdate = 2022-01-19
// @publisher = Banana.ch SA
// @description = Create asset transactions
// @task = app.command
// @doctype = 100.*
// @docproperties =
// @outputformat = none
// @inputdatasource = none
// @timeout = -1
// @includejs = ch.banana.portfolio.management.shares.purchase.operation.js
// @includejs = ch.banana.portfolio.management.shares.sales.operation.js
// @includejs = ch.banana.portfolio.management.new.items.dialog.js

/**
 * Questa è l'estensione che si occupa di chiamare gli script per la registrazione degli acquisti e vendite di titoli.
 * */

//Main function
function exec() {

    var banDoc=Banana.document;
    var tabMovementsData=getTabMovementsData(banDoc);
    var docInfo=getDocumentInfo(banDoc);
    var tabItemsData=getItemsTableData(docInfo);

    var jsonDoc = { "format": "documentChange", "error": "","data":[] };
    var docChange={};

    /*check that each item referred to in the table with the imported movements exists in the items table, 
    if not I will add it.*/
    docChange=addMissingItems(docInfo,tabMovementsData,tabItemsData);
    jsonDoc["data"].push(docChange);

    //Create the transactions-->first Purchases, then Sales.

    var sharesPurchaseOperation= new SharesPurchaseOperation(banDoc,tabMovementsData,tabItemsData,docInfo); //create purchase transactions (shares).
    docChange=sharesPurchaseOperation.getDocumentChange();
    jsonDoc["data"].push(docChange);


    var sharesSaleOperation= new SharesSaleOperation(banDoc,tabMovementsData,tabItemsData,docInfo);
    docChange=sharesSaleOperation.getDocumentChange();
    jsonDoc["data"].push(docChange);


    return jsonDoc;
}

//da spostare nel calculation methods

/**
 * Check if the items exists in the item table. All the item we want to record in the transactions table must be present in the items table
 *  If the item doesn't exists, we add the item and its data in the items table. the user should complete the info manually
 * @param {*} tabMovementsData 
 * @param {*} tabItemsData
 */
function addMissingItems(docInfo,tabMovementsData,tabItemsData){

    var jsonDoc=initJsonDoc();
    var rows=[];
    var userParam="";
    var rowNr=""; //row after which to insert the new item.

    for(var mrow in tabMovementsData){
        let currItem=tabMovementsData[mrow].itemId;
        let isPresent=false;
        for(var irow in tabItemsData){
            let exItem=tabItemsData[irow].item;
            if(currItem==exItem)
                isPresent=true;
        }
        if(!isPresent){
            //FARE INSERIRE ALL UTENTE DEI VALORI A MANO (gruppo ecc) 
            //recuperare la riga dell ultimo elemento con quel gruppo ed inserire il nuovo item
            //alla riga dopo
            dialogExec();
            userParam=readDialogParams();
            rowNr=getItemRowNr(userParam.itemGroupComboBox,tabItemsData);
            rows.push(addMissingItem_createDocChange(docInfo,userParam,tabMovementsData[mrow],rowNr));
        } 
    }

    var dataUnitFilePorperties = {};
    dataUnitFilePorperties.nameXml = "Items";
    dataUnitFilePorperties.data = {};
    dataUnitFilePorperties.data.rowLists = [];
    dataUnitFilePorperties.data.rowLists.push({ "rows": rows });

    jsonDoc.document.dataUnits.push(dataUnitFilePorperties);

    return jsonDoc;
}

/**
 * Creates a new row for the items table
 * @param {*} movRow 
 */
function addMissingItem_createDocChange(docInfo,userParam,movRow,rowNr){

    var row={};

    row.fields={};
    row.fields.ItemsId=movRow.itemId;
    row.fields.Description=movRow.description;
    row.fields.Gr=userParam.itemGroupComboBox;
    row.fields.Account=userParam.itemAccount;
    //columns to add only if its a multicurrency accounting
    if(docInfo.isMultiCurrency){ 
        row.fields.Currency=movRow.currency;
    }

    row.operation={};
    row.operation.name="add";
    row.operation.sequence=rowNr;

    return row;

}

/**
 * returns the line number following the last item found whose group is the same as that of the new item
 * @param {*} refGroup reference group.
 * @param {*} tabItemsData 
 */
function getItemRowNr(refGroup,tabItemsData){
    var refNr="";
    for(var r in tabItemsData){
        tRow=tabItemsData[r];
        if(refGroup==tRow.group){
            refNr=tRow.rowNr;
        }
    }
    // format the number so that it is added after the line I have taken as a reference.--> if row = 6 became 6.6
    if(refNr){
        refNr=Banana.SDecimal.subtract(refNr,"1");
        refNr=refNr+"."+refNr;
    }
    return refNr;
}

/**
 * Questa funzione recupera le righe dalla tabella movimenti e li inserisce in un oggetto.
 */
function getTabMovementsData(banDoc){
    var tabMovementsData=[];
    let table = banDoc.table("ImportMovements");
    if (!table) {
        return tabMovementsData;
    }
    for (var i = 0; i < table.rowCount; i++) {
        var tRow = table.row(i);
        var row={};
        row.rowNr=tRow.rowNr;
        row.date = tRow.value("Date");
        row.itemId=tRow.value("ItemId");
        row.netAmount=tRow.value("NetAmount");
        row.quantity=tRow.value("Quantity");
        row.price=tRow.value("Price");
        row.bankCharges=tRow.value("BankCharges");
        row.interest=tRow.value("Interest");
        row.bankAccount=tRow.value("Account");
        row.description=tRow.value("Description");
        row.currency=tRow.value("Currency");
        row.exchangeRate=tRow.value("ExchangeRate");
        row.type=tRow.value("Type");

        //...

        if (row && row.itemId)
            tabMovementsData.push(row);
    }

    return tabMovementsData;

}

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