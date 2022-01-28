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
    var userParam=dialogExec("bonds");

    if(userParam && banDoc){

        var salesOpArray=[];
        var itemsData=getItemsTableData();
        var currentSelectionBottom = banDoc.cursor.selectionBottom;
        var currentSelectionTop = banDoc.cursor.selectionTop;
        var transList=[];
        var multiCurrencyAcc=false;
        var purchaseCourse=""
        var bondsData="";
        var currentRowDate="";
        var bondTotalCourse="";
        var userParam=readDialogParams();

        multiCurrencyAcc=checkIfMultiCurrencyAccounting(banDoc);
        transList=getTransactionsTableData(banDoc,multiCurrencyAcc);
        bondTotalCourse=getBondTotalCourse(transList,userParam);
        currentRowDate=getCurrentRowDate(banDoc,transList);
        purchaseCourse=getPurchaseCourse(transList,userParam.selectedItem,currentSelectionTop);
        bondsData=calculateBondSaleData(bondTotalCourse,userParam);
        //Creates the document change for the sale of bonds transactions
        salesOpArray = createBondsSalesOpDocChange(currentSelectionBottom,currentRowDate,bondsData,multiCurrencyAcc,userParam,itemsData,purchaseCourse);
    
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
function createBondsSalesOpDocChange(currentSelectionBottom,currentRowDate,bondsData,multiCurrencyAccounting,userParam,itemsData,purchaseCourse){
    var jsonDoc = initJsonDoc();
    var rows=[];

    
    var amountColumn=getAmountColumn(multiCurrencyAccounting);

    rows.push(createBondsSalesOpDocChange_bankCharges(jsonDoc,currentRowDate,currentSelectionBottom,userParam,amountColumn));//indicati nel dialogo
    rows.push(createBondsSalesOpDocChange_accruedInterest(jsonDoc,currentRowDate,bondsData,currentSelectionBottom,userParam,amountColumn,itemsData));//((valore nominale*tasso%)/360)* giorni maturazione interesse dalla scadenza.
    rows.push(createBondsSalesOpDocChange_profitOrLoss(jsonDoc,currentRowDate,bondsData,currentSelectionBottom,userParam,amountColumn));//(valore nominale cedole*corso attuale)-valore di acquisto.
    rows.push(createBondsSalesOpDocChange_bondSale(jsonDoc,currentRowDate,currentSelectionBottom,userParam,itemsData,bondsData,amountColumn,purchaseCourse));//valore di acquisto (avere)-->lo posso cercare nelle registrazioni, recupero la riga di registrazione che contiene il conto dell'obbligazione

    
    var dataUnitFilePorperties = {};
    dataUnitFilePorperties.nameXml = "Transactions";
    dataUnitFilePorperties.data = {};
    dataUnitFilePorperties.data.rowLists = [];
    dataUnitFilePorperties.data.rowLists.push({ "rows": rows });

    jsonDoc.document.dataUnits.push(dataUnitFilePorperties);

    return jsonDoc;
}

function createBondsSalesOpDocChange_bankCharges(jsonDoc,currentRowDate,currentSelectionBottom,userParam,amountColumn){

    var opDescription="Sale bonds "+userParam.selectedItem+" bank charges";
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


/**
 * Creates the record of the accrued interest
 * @param {*} jsonDoc 
 * @param {*} currentSelectionBottom 
 * @param {*} saleParam 
 * @param {*} accParam 
 * @returns 
 */
 function createBondsSalesOpDocChange_accruedInterest(jsonDoc,currentRowDate,bondsData,currentSelectionBottom,userParam,amountColumn,itemsData){

    var opDate="";
    if(currentRowDate)
        opDate=currentRowDate;
    else
        opDate=jsonDoc.creator.executionDate;   
    var opCurrentSelectionBottom=currentSelectionBottom+".2";
    var opDescription="Sale bonds "+userParam.selectedItem+" accrued interest on sale";
    var opAccount=userParam.interestOnBond;
    var opAmount=getAccruedInterest(bondsData,itemsData,userParam.selectedItem,opDate);

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

/**
 * Calculate the accrued interest by taken the percentage from the items table (row corresponding to the item).
 * @param {*} item 
 * @param {*} nominalValue the nominal value is taken as the value being sold.
 * @returns 
 */
 function getAccruedInterest(bondsData,itemsData,item,opDate){
    //the interest percentage of the bonds is currently indicated in the "Notes" Column
    var intRate="";
    var nomValue=bondsData.nominalValue;
    var accInterest="";
    var currDate=new Date(opDate);
    var expiryDate="";
    var actualDays="";

        if(itemsData){
            for(var e in itemsData){
                if(itemsData[e].item==item){
                    intRate=itemsData[e].interestRate;
                    accInterest=Banana.SDecimal.divide(nomValue,100);
                    accInterest=Banana.SDecimal.multiply(accInterest,intRate);

                    /*
                    expiryDate=itemsData[e].expiryDate; //what gets it is only the day and the months of the expiry date, indicated in the expiry date in the items table
                    //set the current
                    expiryDate+=currDate.getFullYear();
                    expiryDate=new Date(expiryDate);


                    accInterest=Banana.SDecimal.divide(accInterest,360);
                    actualDays=Banana.SDecimal.subtract(currDate,expiryDate);*/

                    return accInterest;
                }
            }
        }else 
            return "";

}

function createBondsSalesOpDocChange_profitOrLoss(jsonDoc,currentRowDate,bondsData,currentSelectionBottom,userParam,amountColumn){

    // set the description based on the result
    var opProfitOnSale=bondsData.profitOnSale;
    var resultDescription=setResultDecription(opProfitOnSale);
    var opDescription="Sale bonds "+userParam.selectedItem+" "+resultDescription;
    //get the account based on the result
    var opAccount=getAccountForResult(opProfitOnSale,userParam);
    var opDate="";
    if(currentRowDate)
        opDate=currentRowDate;
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
 * @param {*} currentRowDate 
 * @param {*} currentSelectionBottom 
 * @param {*} userParam 
 * @param {*} itemsData 
 * @returns 
 */
function createBondsSalesOpDocChange_bondSale(jsonDoc,currentRowDate,currentSelectionBottom,userParam,itemsData,bondsData,amountColumn,purchaseCourse){
        //temporary UPPERCASE variables, the user will define those values through a dialog
        var opAccount=getItemAccount(userParam.selectedItem,itemsData);
        var opDate="";
        if(currentRowDate)
            opDate=currentRowDate;
        else
            opDate=jsonDoc.creator.executionDate;   
        var opItem=userParam.selectedItem;
        var opNpminalValue="1"; //for the bonds the qt reperesent the nominal value of a bond
        var opMarketPrice=purchaseCourse;
        if(userParam.quantity){
            opNpminalValue=userParam.quantity;
        }
    
        var opDescription="Sale bonds "+userParam.selectedItem;
        var opCurrentSelectionBottom=currentSelectionBottom+".4"; //set with the correct format to indicate the sequence
        var opAmount=bondsData.currentValue;

        var row={};

        row.fields={};
        row.fields.Date=opDate;
        row.fields.ItemsId=opItem;
        row.fields.Description=opDescription;
        row.fields.AccountCredit=opAccount;
        row.fields.Quantity="-"+opNpminalValue;
        row.fields.UnitPrice=opMarketPrice;
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
    