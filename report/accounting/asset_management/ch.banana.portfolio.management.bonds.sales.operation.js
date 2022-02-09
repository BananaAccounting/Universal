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
// @id = ch.banana.bonds.sales.operation
// @api = 1.0
// @pubdate = 2022-01-19
// @publisher = Banana.ch SA
// @description = Bonds sales operation
// @task = app.command
// @doctype = 100.*
// @docproperties =
// @outputformat = none
// @inputdatasource = none
// @timeout = -1
// @includejs = ch.banana.portfolio.management.calculation.methods.js
// @includejs = ch.banana.portfolio.management.sales.dialog.js

/**
 * This extension creates the registration for the sale of bonds using the document change, 
 * Sale operation example:
 * 
 * Vend. 500'000 obbligazioni Holcim                                   |	1020    |           |   512'000.00 
 * Vend. 500'000 obbligazioni Holcim int. maturati su vendita          |	3600    |	    	|     3'000.00 
 * Vend. 500'000 obbligazioni Holcim spese banca                       |	6900    |	    	|     1'000.00 
 * Vend. 500'000 obbligazioni Holcim utile su vendita                  |		    |   3200	|    15'500.00
 * Vend. 500'000 obbligazioni Holcim utile su vendita                  |		    |   1450	|   505'000.00
 * 
 */

//Main function
function exec() {

    var banDoc=Banana.document;
    //show the dialog
    var userParam=dialogExec("bonds"); //use this if the data are taken from the dialog

    if(userParam && banDoc){

        var salesOpArray=[];
        var itemsData=getItemsTableData();
        var currentSelectionBottom = banDoc.cursor.selectionBottom;
        var docInfo="";
        var transList=[];
        var multiCurrencyAcc=false;
        var bondsData="";
        var currentRowData="";
        var bondTotalCourse="";
        var userParam=readDialogParams();

        multiCurrencyAcc=checkIfMultiCurrencyAccounting(banDoc);
        docInfo=getDocumentInfo(banDoc);
        transList=getTransactionsTableData(banDoc,multiCurrencyAcc);
        bondTotalCourse=getBondTotalCourse(transList,userParam);
        currentRowData=getCurrentRowData(banDoc,transList);
        bondsData=calculateBondSaleData(currentRowData,userParam,bondTotalCourse);
        //Creates the document change for the sale of bonds transactions
        salesOpArray = createBondsSalesOpDocChange(docInfo,currentSelectionBottom,currentRowData,bondsData,multiCurrencyAcc,userParam,itemsData);
    
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
 * @param {*} bondsData calculated share data 
 * @param {*} multiCurrencyAccounting true if the document is a multicurrency accounting (number 120)
 * @param {*} userParam parameters defined by the user
 * @returns returns the Json document
 */
function createBondsSalesOpDocChange(docInfo,currentSelectionBottom,currentRowData,bondsData,multiCurrencyAccounting,userParam,itemsData){
    var jsonDoc = initJsonDoc();
    var rows=[];

    
    var amountColumn=getAmountColumn(multiCurrencyAccounting);
    var opCurrency=getItemValue(itemsData,userParam.selectedItem,"currency");
    var itemDescr=getItemValue(itemsData,userParam.selectedItem,"description");
    var itemAccount=getItemValue(itemsData,userParam.selectedItem,"account");
    var accExchRes=getAccountsForExchangeResult(banDoc,docInfo);

    rows.push(createBondsSalesOpDocChange_bonds(jsonDoc,currentRowData,currentSelectionBottom,bondsData,opCurrency,itemDescr));
    rows.push(createBondsSalesOpDocChange_bankCharges(jsonDoc,currentRowData,currentSelectionBottom,userParam,amountColumn,opCurrency,docInfo,itemDescr));
    rows.push(createBondsSalesOpDocChange_accruedInterest(jsonDoc,currentRowData,bondsData,currentSelectionBottom,userParam,amountColumn));
    rows.push(createBondsSalesOpDocChange_profitOrLoss_sale(jsonDoc,currentRowData,bondsData,currentSelectionBottom,userParam,amountColumn));
    rows.push(createBondsSalesOpDocChange_bondSale(jsonDoc,currentRowData,currentSelectionBottom,userParam,bondsData,amountColumn,itemAccount));
    if(opCurrency!=docInfo.baseCurrency)
        rows.push(createBondsSalesOpDocChange_profitOrLoss_exchange(jsonDoc,currentRowData,bondsData,itemAccount,currentSelectionBottom,docInfo,accExchRes));

    
    var dataUnitFilePorperties = {};
    dataUnitFilePorperties.nameXml = "Transactions";
    dataUnitFilePorperties.data = {};
    dataUnitFilePorperties.data.rowLists = [];
    dataUnitFilePorperties.data.rowLists.push({ "rows": rows });

    jsonDoc.document.dataUnits.push(dataUnitFilePorperties);

    return jsonDoc;
}

function createBondsSalesOpDocChange_bonds(jsonDoc,currentRowData,currentSelectionBottom,bondsData,opCurrency,itemDescr){

    var opDescription=itemDescr;
    var opCurrentSelectionBottom=currentSelectionBottom+".1"; //set with the correct format to indicate the sequence
    var opDate="";
    if(currentRowData)
        opDate=currentRowData.date;
    else
        opDate=jsonDoc.creator.executionDate;   
    var opQuantity="1";
    var opPrice=bondsData.PricePerShare;
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


    return row;
}

function createBondsSalesOpDocChange_bankCharges(jsonDoc,currentRowData,currentSelectionBottom,userParam,amountColumn,opCurrency,docInfo,itemDescr){

    var opDescription="Sale "+itemDescr+" bank charges";
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


/**
 * Creates the record of the accrued interest
 * @param {*} jsonDoc 
 * @param {*} currentSelectionBottom 
 * @param {*} saleParam 
 * @param {*} accParam 
 * @returns 
 */
 function createBondsSalesOpDocChange_accruedInterest(jsonDoc,currentRowData,currentSelectionBottom,userParam,amountColumn){

    var opDate="";
    if(currentRowData)
        opDate=currentRowData.date;
    else
        opDate=jsonDoc.creator.executionDate;   
    var opCurrentSelectionBottom=currentSelectionBottom+".2";
    var opDescription="Sale bonds "+userParam.selectedItem+" accrued interest on sale";
    var opAccount="3601";
    var opAmount=userParam.accruedInterest;

    var row={};

    row.fields={};
    row.fields.Date=opDate;
    row.fields.Description=opDescription;
    row.fields.AccountCredit=opAccount;
    row.fields[amountColumn]=opAmount;

    row.operation={};
    row.operation.name="add";
    row.operation.sequence=opCurrentSelectionBottom;


    return row;
}

function createBondsSalesOpDocChange_profitOrLoss_sale(jsonDoc,currentRowData,bondsData,currentSelectionBottom,userParam,amountColumn){

    // set the description based on the result
    var opProfitOnSale=bondsData.profitOnSale;
    var resultDescription=setResultDecription(opProfitOnSale);
    var opDescription="Sale bonds "+userParam.selectedItem+" "+resultDescription;
    //get the account based on the result
    var opAccount=getAccountForResult(opProfitOnSale,userParam);
    var opDate="";
    if(currentRowData)
        opDate=currentRowData.date;
    else
        opDate=jsonDoc.creator.executionDate;   
    var opCurrentSelectionBottom=currentSelectionBottom+".3"; //set with the correct format to indicate the sequence
    var opAmount=bondsData.result;

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

/**
 * Crea la registrazione di vendita dell'obbligazione. L'importo registrato è il corso totale d'acquisto, se ho più registrazioni per la stessa obbligazione, 
 * devo fare una media tra gli importi
 * @param {*} jsonDoc 
 * @param {*} currentRowData 
 * @param {*} currentSelectionBottom 
 * @param {*} userParam 
 * @param {*} itemsData 
 * @returns 
 */
function createBondsSalesOpDocChange_bondSale(jsonDoc,currentRowData,currentSelectionBottom,userParam,bondsData,amountColumn,itemAccount){
        //temporary UPPERCASE variables, the user will define those values through a dialog
        var opAccount=itemAccount;
        var opDate="";
        if(currentRowData)
            opDate=currentRowData.date;
        else
            opDate=jsonDoc.creator.executionDate;   
    
        var opDescription="Sale bonds "+userParam.selectedItem;
        var opCurrentSelectionBottom=currentSelectionBottom+".4"; //set with the correct format to indicate the sequence
        var opAmount=bondsData.currentValue;

        var row={};

        row.fields={};
        row.fields.Date=opDate;
        row.fields.Description=opDescription;
        row.fields.AccountCredit=opAccount;
        row.fields[amountColumn]=opAmount;
    
        row.operation={};
        row.operation.name="add";
        row.operation.sequence=opCurrentSelectionBottom;

        return row;
}

function createBondsSalesOpDocChange_profitOrLoss_exchange(jsonDoc,currentRowData,bondsData,itemAccount,currentSelectionBottom,docInfo,accExchRes,itemDescr){
    // set the description based on the result
    var opProfitOnExchange=bondsData.profitOnExchange;
    var resultDescription=setOperationResultDecription(opProfitOnExchange,"exchange");
    var opDescription="Sale "+itemDescr+" "+resultDescription;
    //get the accounts based on the result
    var opDebitAccount=bondsData.profitOnExchange? itemAccount:accExchRes.loss;
    var opCreditAccount=bondsData.profitOnExchange? accExchRes.profit:itemAccount;
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
    row.fields.Amount=opAmount; //set the value only in the base currency

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
    