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
 * |     |   Vend. 10000 shares UBS                       |	1020    |           |            |        130'000.00 
 * | UBS |   shares UBS                                   |	        |	    	|   -10000   |        132'000.00
 * |     |   Vend. 10000 shares UBS bank charges          |	6900    |	    	|            |        2'000.00
 * |     |   Vend. 10000 shares UBS Profit/Sale           |	4200    |       	|            |        6'000.00 
 * |     |   Vend. 10000 shares UBS                       |		    |   1400	|            |        138'000.00
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
        var docInfo="";
        var currentSelectionTop = banDoc.cursor.selectionTop;
        var sharesData="";
        var itemsData="";
        var accountingCourse="";
        var currentRowData="";
        var userParam=readDialogParams();

        docInfo=getDocumentInfo(banDoc);
        itemsData=getItemsTableData(docInfo);
        transList=getTransactionsTableData(banDoc,docInfo);
        accountingCourse=getAccountingCourse(userParam.selectedItem,itemsData,banDoc);
        currentRowData=getCurrentRowData(banDoc,transList);
        avgCost=getAverageCost(userParam.selectedItem,currentSelectionTop,transList);
        sharesData=calculateShareSaleData(avgCost,userParam,currentRowData,accountingCourse);
        //Creates the document change for the sale of shares
        salesOpArray = createSharesSalesOpDocChange(currentSelectionBottom,currentRowData,sharesData,docInfo,userParam,itemsData);
    
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
 * @param {*} docInfo the info of the document
 * @param {*} userParam parameters defined by the user
 * @returns returns the Json document
 */
function createSharesSalesOpDocChange(currentSelectionBottom,currentRowData,sharesData,docInfo,userParam,itemsData){
    var jsonDoc = initJsonDoc();
    var rows=[];
    
    var amountColumn=getAmountColumn(docInfo);
    var opCurrency=getItemCurrency(itemsData,userParam.selectedItem);

    rows.push(createSharesSalesOpDocChange_shares(jsonDoc,currentRowData,sharesData,currentSelectionBottom,userParam,opCurrency,docInfo));
    rows.push(createSharesSalesOpDocChange_bankCharges(jsonDoc,currentRowData,currentSelectionBottom,userParam,amountColumn,opCurrency,docInfo));
    rows.push(createSharesSalesOpDocChange_profitOrLoss_sale(jsonDoc,currentRowData,sharesData,currentSelectionBottom,userParam,amountColumn,opCurrency,docInfo));
    rows.push(createSharesSalesOpDocChange_sharesSale(jsonDoc,currentRowData,sharesData,currentSelectionBottom,userParam,itemsData,amountColumn,opCurrency,docInfo));
    if(opCurrency!=docInfo.baseCurrency)
        rows.push(createSharesSalesOpDocChange_profitOrLoss_exchange(jsonDoc,currentRowData,sharesData,currentSelectionBottom,userParam,amountColumn,docInfo));

    
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
function createSharesSalesOpDocChange_shares(jsonDoc,currentRowData,sharesData,currentSelectionBottom,userParam,opCurrency,docInfo){

    var opDate="";
    if(currentRowData)
        opDate=currentRowData.date;
    else
        opDate=jsonDoc.creator.executionDate;  
    var opItem=userParam.selectedItem;
    var opQuantity="1";
    var opPrice=sharesData.PricePerShare;
    if(userParam.quantity){
        opQuantity=userParam.quantity;
    }
    var opDescription="Shares "+userParam.selectedItem;
    var opCurrentSelectionBottom=currentSelectionBottom+".1"; //set with the correct format to indicate the sequence.
    var opRate=currentRowData.rate;

    var row={};

    row.fields={};
    row.fields.Date=opDate;
    row.fields.ItemsId=opItem;
    row.fields.Description=opDescription;
    row.fields.Quantity="-"+opQuantity;
    row.fields.UnitPrice=opPrice;
    //columns to add only if its a multicurrency accounting
    if(docInfo.isMultiCurrency){ 
        if(opCurrency!="")
            row.fields.ExchangeCurrency=opCurrency;
        row.fields.ExchangeRate=opRate;

    }


    row.operation={};
    row.operation.name="add";
    row.operation.sequence=opCurrentSelectionBottom;

    return row;;
}

function createSharesSalesOpDocChange_bankCharges(jsonDoc,currentRowData,currentSelectionBottom,userParam,amountColumn,opCurrency,docInfo){

    var opDescription="Sale shares "+userParam.selectedItem+" bank charges";
    var opCurrentSelectionBottom=currentSelectionBottom+".2"; //set with the correct format to indicate the sequence
    var opDate="";
    var opRate=currentRowData.rate;
    if(currentRowData)
        opDate=currentRowData.date;
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
    if(docInfo.isMultiCurrency){ 
        if(opCurrency!="")
            row.fields.ExchangeCurrency=opCurrency;
        row.fields.ExchangeRate=opRate;
    }

    row.operation={};
    row.operation.name="add";
    row.operation.sequence=opCurrentSelectionBottom;


    return row;
}

function createSharesSalesOpDocChange_profitOrLoss_sale(jsonDoc,currentRowData,sharesData,currentSelectionBottom,userParam,amountColumn,opCurrency,docInfo){

    // set the description based on the result
    var opProfitOnSale=sharesData.profitOnSale;
    var resultDescription=setOperationResultDecription(opProfitOnSale,"sale");
    var opDescription="Sale shares "+userParam.selectedItem+" "+resultDescription;
    //get the account based on the result
    var opAccount=getAccountForResult(opProfitOnSale,userParam);
    var opRate=currentRowData.rate;
    var opDate="";
    if(currentRowData)
        opDate=currentRowData.date;
    else
        opDate=jsonDoc.creator.executionDate;    
    var opCurrentSelectionBottom=currentSelectionBottom+".3"; //set with the correct format to indicate the sequence
    var opAmount=sharesData.saleResult;

    var row={};

    row.fields={};
    row.fields.Date=opDate;
    row.fields.Description=opDescription;
    if(opProfitOnSale)
        row.fields.AccountCredit=opAccount;
    else
        row.fields.AccountDebit=opAccount;

    row.fields[amountColumn]=opAmount;

    if(docInfo.isMultiCurrency){ 
        if(opCurrency!="")
            row.fields.ExchangeCurrency=opCurrency;
        row.fields.ExchangeRate=opRate;
    }

    row.operation={};
    row.operation.name="add";
    row.operation.sequence=opCurrentSelectionBottom;

    return row;

}

function createSharesSalesOpDocChange_sharesSale(jsonDoc,currentRowData,sharesData,currentSelectionBottom,userParam,itemsData,amountColumn,opCurrency,docInfo){

    var opAccount=getItemAccount(userParam.selectedItem,itemsData);
    var opDate="";
    if(currentRowData)
        opDate=currentRowData.date;
    else
        opDate=jsonDoc.creator.executionDate;  
    var opAmount=sharesData.avgShareValue;
    var opRate=currentRowData.rate;
    var opDescription="Sale shares "+userParam.selectedItem;
    var opCurrentSelectionBottom=currentSelectionBottom+".4"; //set with the correct format to indicate the sequence

    var row={};

    row.fields={};
    row.fields.Date=opDate;
    row.fields.Description=opDescription;
    row.fields.AccountCredit=opAccount;

    row.fields[amountColumn]=opAmount;

    if(docInfo.isMultiCurrency){ 
        if(opCurrency!="")
            row.fields.ExchangeCurrency=opCurrency;
        row.fields.ExchangeRate=opRate;
    }
    row.operation={};
    row.operation.name="add";
    row.operation.sequence=opCurrentSelectionBottom;

    return row;
}

function createSharesSalesOpDocChange_profitOrLoss_exchange(jsonDoc,currentRowData,sharesData,currentSelectionBottom,userParam,amountColumn,docInfo){
        // set the description based on the result
        var opProfitOnExchange=sharesData.profitOnExchange;
        var resultDescription=setOperationResultDecription(opProfitOnExchange,"exchange");
        var opDescription="Sale shares "+userParam.selectedItem+" "+resultDescription;
        //get the accounts based on the result
        var opDebitAccount=sharesData.profitOnExchange? "1020":"6949";
        var opCreditAccount=sharesData.profitOnExchange? "6999":"1020";
        var opCurrency=docInfo.baseCurrency;//this entry is always made in base currency
        if(currentRowData)
            opDate=currentRowData.date;
        else
            opDate=jsonDoc.creator.executionDate;    
        var opCurrentSelectionBottom=currentSelectionBottom+".5"; //set with the correct format to indicate the sequence
        var opAmount=sharesData.exchangeResult;
    
        var row={};
    
        row.fields={};
        row.fields.Date=opDate;
        row.fields.Description=opDescription;
        row.fields.AccountDebit=opDebitAccount;
        row.fields.AccountCredit=opCreditAccount;
        row.fields[amountColumn]=opAmount;

        //columns to add only if its a multicurrency accounting
        if(docInfo.isMultiCurrency){ 
            if(opCurrency!="")
            row.fields.ExchangeCurrency=opCurrency;

        }

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
    