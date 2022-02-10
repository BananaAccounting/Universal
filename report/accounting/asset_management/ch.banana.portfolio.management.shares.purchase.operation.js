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

var AssetPurchaseOperation=class AssetPurchaseOperation{


    constructor(banDoc,tabMovementsData,tabItemsData,docInfo){
        this.banDoc=banDoc;
        this.tabMovementsData=tabMovementsData;
        this.tabItemsData=tabItemsData;
        this.docInfo=docInfo;

    }
    //Main function
    exec() {

        var banDoc=this.banDoc;
        var docInfo=this.docInfo;
        var jsonDoc={};
        var tabItemsData=this.tabItemsData;
        var tabMovementsData=this.tabMovementsData;
        var purchMovList=getPurchaseOperationList(tabMovementsData); //filtro la lista estrapolando solamente le operazioni di acquisto 

        if(purchMovList && banDoc)
            jsonDoc=this.createSharesPurchaseOperations(purchMovList,tabItemsData,docInfo);

        return jsonDoc;

    }

     createSharesPurchaseOperations(movList,tabItemsData,docInfo){
        var jsonDoc = this.initJsonDoc();
        var amountColumn=getAmountColumn(docInfo);
        var rows=[];

        for(var e in movList){

            rows.push(this.createBondsSalesOpDocChange_sharePurchase_share(docInfo,tabItemsData,movList[e]));
            rows.push(this.createBondsSalesOpDocChange_bankCharges(docInfo,movList[e],amountColumn));
            rows.push(this.createBondsSalesOpDocChange_sharePurchase_bank(docInfo,movList[e],amountColumn));

            
            var dataUnitFilePorperties = {};
            dataUnitFilePorperties.nameXml = "Transactions";
            dataUnitFilePorperties.data = {};
            dataUnitFilePorperties.data.rowLists = [];
            dataUnitFilePorperties.data.rowLists.push({ "rows": rows });

        }

        jsonDoc.document.dataUnits.push(dataUnitFilePorperties);

        return jsonDoc;
    }

    createBondsSalesOpDocChange_sharePurchase_share(docInfo,tabItemsData,movRow){

        var opDate=movRow.date;
        var opItem=movRow.itemId;
        var opDescription="Shares "+movRow.description;
        var opAccountDebit=getItemValue(tabItemsData,opItem,"account");
        var opQuantity=movRow.quantity;
        var opPrice=movRow.price;
        var opCurrency=movRow.currency;
        var opRate=movRow.exchangeRate;

        var row={};

        row.fields={};
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

    createBondsSalesOpDocChange_bankCharges(docInfo,movRow,amountColumn){

        var opDate=movRow.date;
        var opDescription=movRow.description+" Bank charges";;
        var opAccountDebit="6900"; //DA CAMBIARE
        var opAmount=movRow.bankCharges;
        var opCurrency=movRow.currency;
        var opRate=movRow.exchangeRate;

        var row={};

        row.fields={};
        row.fields.Date=opDate;
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
     createBondsSalesOpDocChange_sharePurchase_bank(docInfo,movRow,amountColumn){

        var opDate=movRow.date;
        var opDescription="Purchase Shares "+movRow.description;
        var opAccountCredit=movRow.bankAccount;
        var opAmount=Banana.SDecimal.add(movRow.netAmount,movRow.bankCharges);//Net amount+bank charges.
        var opCurrency=movRow.currency;
        var opRate=movRow.exchangeRate;

        var row={};

        row.fields={};
        row.fields.Date=opDate;
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

    /**
     * Initialise the Json document
     * @returns 
     */
    initJsonDoc() {
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
}
        