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
// @id = ch.banana.portfolio.management.shares.purchase.operation.js
// @api = 1.0
// @pubdate = 2022-01-19
// @publisher = Banana.ch SA
// @description = Share purchase operation
// @task = app.command
// @doctype = 100.*
// @docproperties =
// @outputformat = none
// @inputdatasource = none
// @timeout = -1
// @includejs = ch.banana.portfolio.management.calculation.methods.js

/**
 * This extension creates the registration for the purchase of shares using the document change, 
 * Purchase operation example:
 * 
 * Azioni Unicredit                                           |	1402    |           |   1000.00 
 * Acquisto azioni Unicredit spese banca                      |	6900    |	    	|     20.00 
 * Acquisto azioni unicredit                                  |	        |	1024    |     1'020.00 
 * 
 */

//Main function
function exec() {

    var banDoc=Banana.document;
    var tabImportsData=getTabImportsData(banDoc);
    var docInfo=getDocumentInfo(banDoc);
    var tabItemsData=getItemsTableData(docInfo);
    var docChange_newItems={};
    var docChange_updateAccounts={};
    var docChange_newTransactions={};
    var docChange_updateMovements={};
    var jsonDoc = { "format": "documentChange", "error": "","data":[] };
    var purchMovList=getNPValuesFromMovData(tabImportsData,"Acquisto");

    if(purchMovList && banDoc){
        /*check that each item referred to in the table with the imported movements exists in the items table, 
        if not I will add it*/
        docChange_newItems=addMissingItems(docInfo,tabImportsData,tabItemsData);
        //update the accounts table, actually only by mapping the bank number with the corrispondent bank account (in the chart of accounts).
        //docChange_updateAccounts=updateAccountNumbers();
        //add the transactions
        docChange_newTransactions=createSharesPurchaseOperations(purchMovList,tabItemsData,docInfo,banDoc);
        //Update the imports table movements status, if the addition of lines was successful.
        if(docChange_newTransactions)
            docChange_updateMovements=updateImportRowStatus(purchMovList);

        //push the three documents
        jsonDoc["data"].push(docChange_newItems);
        jsonDoc["data"].push(docChange_newTransactions);
        jsonDoc["data"].push(docChange_updateMovements);
    }

    return jsonDoc;

}

function createSharesPurchaseOperations(movList,tabItemsData,docInfo,banDoc){

    var jsonDoc = initJsonDoc();
    var amountColumn=getAmountColumn(docInfo);
    var rows=[];
    var movRow="";

    for(var e in movList){
        movRow=movList[e];
        var itemBankAcc=getAccountingAccount(banDoc,docInfo,movRow.bankAccount);
        rows.push(createSharesPurchaseOpDocChange_sharePurchase_share(docInfo,tabItemsData,movRow));
        rows.push(createSharesPurchaseOpDocChange_bankCharges(docInfo,movRow,amountColumn));
        rows.push(createSharesPurchaseOpDocChange_sharePurchase_bank(docInfo,movRow,amountColumn,itemBankAcc));
    }

    var dataUnitFilePorperties = {};
    dataUnitFilePorperties.nameXml = "Transactions";
    dataUnitFilePorperties.data = {};
    dataUnitFilePorperties.data.rowLists = [];
    dataUnitFilePorperties.data.rowLists.push({ "rows": rows });

    jsonDoc.document.dataUnits.push(dataUnitFilePorperties);



    return jsonDoc;
}

function createSharesPurchaseOpDocChange_sharePurchase_share(docInfo,tabItemsData,movRow){

    var opDate=movRow.date;
    var opExtRef=movRow.rowId;
    var opItem=movRow.itemId;
    var opDescription="Shares "+movRow.description;
    var opAccountDebit=getItemValue(tabItemsData,opItem,"account");
    var opQuantity=movRow.quantity;
    var opPrice=movRow.price;
    var opCurrency=movRow.currency;
    var opRate=movRow.exchangeRate;

    var row={};

    row.fields={};
    row.fields.ExternalReference=opExtRef;
    row.fields.Date=opDate;
    row.fields.ItemsId=opItem;
    row.fields.Description=opDescription;
    row.fields.AccountDebit=opAccountDebit;
    row.fields.Quantity=opQuantity;
    row.fields.UnitPrice=opPrice;
    //columns to add only if its a multicurrency accounting
    if(docInfo.isMultiCurrency){ 
        row.fields.ExchangeCurrency=opCurrency;
        row.fields.ExchangeRate=opRate;
    }

    row.operation={};
    row.operation.name="add";


    return row;
}

function createSharesPurchaseOpDocChange_bankCharges(docInfo,movRow,amountColumn){

    var opDate=movRow.date;
    var opExtRef=movRow.rowId;
    var opDescription=movRow.description+" Bank charges";
    var opAccountDebit="6900"; //DA CAMBIARE
    var opAmount=movRow.bankCharges;
    var opCurrency=movRow.currency;
    var opRate=movRow.exchangeRate;

    var row={};

    row.fields={};
    row.fields.Date=opDate;
    row.fields.ExternalReference=opExtRef;
    row.fields.Description=opDescription;
    row.fields.AccountDebit=opAccountDebit;
    //columns to add only if its a multicurrency accounting
    if(docInfo.isMultiCurrency){ 
        row.fields.ExchangeCurrency=opCurrency;
        row.fields.ExchangeRate=opRate;
    }
    row.fields[amountColumn]=opAmount;
    row.operation={};
    row.operation.name="add";

    return row;
}


/**
 * Creates the record of the accrued interest
 * @param {*} jsonDoc 
 * @param {*} currentSelectionBottom 
 * @param {*} saleParam 
 * @param {*} accParam 
 * @returns 
 */
function createSharesPurchaseOpDocChange_sharePurchase_bank(docInfo,movRow,amountColumn,itemBankAcc){

    var opDate=movRow.date;
    var opExtRef=movRow.rowId;
    var opDescription="Purchase Shares "+movRow.description;
    var opAccountCredit=itemBankAcc;
    var opAmount=Banana.SDecimal.add(movRow.netAmount,movRow.bankCharges);//Net amount+bank charges.
    var opCurrency=movRow.currency;
    var opRate=movRow.exchangeRate;

    var row={};

    row.fields={};
    row.fields.Date=opDate;
    row.fields.ExternalReference=opExtRef;
    row.fields.Description=opDescription;
    row.fields.AccountCredit=opAccountCredit;
    //columns to add only if its a multicurrency accounting
    if(docInfo.isMultiCurrency){ 
        row.fields.ExchangeCurrency=opCurrency;
        row.fields.ExchangeRate=opRate;
    }
    row.fields[amountColumn]=opAmount;
    row.operation={};
    row.operation.name="add";


    return row;
}
        