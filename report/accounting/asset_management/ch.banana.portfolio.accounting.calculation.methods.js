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
// @id = ch.banana.portfolio.accounting.calculation.methods.js
// @api = 1.0
// @pubdate = 2022-01-13
// @publisher = Banana.ch SA

/**********************************************************
 * 
 * PORTFOLIO ACCOUNTING METHODS
 * 
 *********************************************************/

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

function getItemCurrency(itemData,item){
    let itemcCurr="";

    for(var e in itemData){  
        if(itemData[e].item==item && itemData[e].currency!=""){
            itemcCurr=itemData[e].currency;
            return itemcCurr;
        }
    }

}

function getCurrentRowData(banDoc,transList){
    var currRowNr=banDoc.cursor.rowNr;

    if(transList){
        for (var i = 0; i < transList.length; i++) {
            if(transList[i].row==currRowNr){
                currentRowData={};
                currentRowData.date=transList[i].date;
                currentRowData.description=transList[i].description;
                currentRowData.debit=transList[i].debit;
                currentRowData.credit=transList[i].credit;
                currentRowData.amount=transList[i].amount;
                currentRowData.rate=transList[i].rate;

                return currentRowData;
            }
        }
    }
}


function getDocumentInfo(banDoc){

    var docInfo={};

    //define if its a multicurrency accounting
    var multiCurrency="120";
    docInfo.isMultiCurrency=false;
    var fileNumber=banDoc.info("Base","FileTypeNumber");
    if(fileNumber==multiCurrency)
        docInfo.isMultiCurrency=true;

    //get the base currency
    docInfo.baseCurrency=banDoc.info("AccountingDataBase","BasicCurrency");

    //get the accounts for the recording of exchange rate differences.
    docInfo.accountExchangeRateProfit=banDoc.info("AccountingDataBase","AccountExchangeRateProfit");
    docInfo.accountExchangeRateLoss=banDoc.info("AccountingDataBase","AccountExchangeRateLoss");


    return docInfo;

}

/**
 * Get the data from the transactions table only once
 */
 function getTransactionsTableData(banDoc,docInfo){
    var transactionsList = [];
    var trnsactionsTable = banDoc.table("Transactions");


    if (trnsactionsTable) {
        for (var i = 0; i < trnsactionsTable.rowCount; i++) {
            var trData={};
            var tRow = trnsactionsTable.row(i);
            trData.row=tRow.rowNr;
            trData.date=tRow.value("Date");
            trData.type=tRow.value("DocType");
            trData.item=tRow.value("ItemsId");
            trData.description=tRow.value("Description");
            trData.debit=tRow.value("AccountDebit");
            trData.credit=tRow.value("AccountCredit");
            trData.qt=tRow.value("Quantity");
            trData.unitPrice=tRow.value("UnitPrice");
            //check if it is a multichange file or not
            if(docInfo.isMultiCurrency){
                trData.amount=tRow.value("AmountCurrency");
                trData.currency=tRow.value("ExchangeCurrency");
                trData.rate=tRow.value("ExchangeRate");
            }
            else{
                trData.amount=tRow.value("Amount");
            }


            transactionsList.push(trData);

        }
    } else(Banana.console.debug("no transactions table"));

    return transactionsList;
}

function getSumOfPurchasedShares(item,transList){
    //look for all purchases done before for this item, and sum the amounts
    var purchasesSum="";
    var rowPurchase="";

    if(transList){
        for (var i = 0; i < transList.length; i++) {
            if(transList[i].item==item && transList[i].qt && Banana.SDecimal.sign(transList[i].qt)!=-1){
                rowPurchase=transList[i].amount;
                purchasesSum=Banana.SDecimal.add(purchasesSum,rowPurchase);
            }
        }
    }
    return purchasesSum;


}

function getQtOfSharesPurchased(item,transList){
    //look for all purchases done before for this item, and sum the quantities
    var purchaseQt="";
    var rowQt="";

    if(transList){
        for (var i = 0; i < transList.length; i++) {
            if(transList[i].item==item && transList[i].qt && Banana.SDecimal.sign(transList[i].qt)!=-1){
                rowQt=transList[i].qt;
                purchaseQt=Banana.SDecimal.add(purchaseQt,rowQt);
            }
        }
    }
    return purchaseQt;
}

/**
 * To calculate the average cost, divide the total purchase amount by the number of shares purchased to figure the average cost per share. 
 */
 function getAverageCost(item,transList){

    var purchaseSum=getSumOfPurchasedShares(item,transList);
    var purchaseQt=getQtOfSharesPurchased(item,transList);
    var avgCost="";

    //calculate the average cost and return it
    var context = {'decimals' : 2, 'mode' : Banana.SDecimal.HALF_UP};
    avgCost=Banana.SDecimal.divide(purchaseSum,purchaseQt,context);

    return avgCost;

}

/**
 * Ritorna il cambio contabile calcolato sulla base della differenza tra i saldi nelle due valute ad una certa data.
 */
function getAccountingCourse(item,itemsData,banDoc){

    var accData=getItemBalance(banDoc,item,itemsData);
    var course="";

   baseCurrBalance =accData.currbalance.balance;
   assetCurrBalance=accData.currbalance.balanceCurrency;

    //divido il saldo in moneta base per quello del asset
    course=Banana.SDecimal.divide(baseCurrBalance,assetCurrBalance);

    return course;

}

/**
 * 
 * Ritorna il valore medio di un azione.
 */
function getSharesAvgValue(quantity,avgCost){
    var avgValue="";

    avgValue=Banana.SDecimal.multiply(quantity,avgCost);

    return avgValue;
}

/**
 * 
 * Ritorna il valore totale di un azione.
 */
 function getSharesTotalValue(quantity,marketPrice){
    var totalValue="";

    totalValue=Banana.SDecimal.multiply(quantity,marketPrice);

    return totalValue;
}

/**
 * Calcola il risultato di vendita.
 */
function getSaleResult(avgSharesValue,totalSharesvalue){
    var saleResult="";

    saleResult=Banana.SDecimal.subtract(totalSharesvalue,avgSharesValue);


    return saleResult;

}

function getExchangeResult(marketPrice,quantity,currExRate,accExRate){
    var exResult="";
    var accAmount="";
    var currAmount="";

    accAmount=Banana.SDecimal.multiply(accExRate,Banana.SDecimal.multiply(marketPrice,quantity));//valore al cambio contabile
    currAmount=Banana.SDecimal.multiply(currExRate,Banana.SDecimal.multiply(marketPrice,quantity));//valore al cambiol corrente
    exResult=Banana.SDecimal.subtract(currAmount,accAmount);

    return exResult;
}

/**
 * 
 * @param {*} avgCost the average cost
 * @param {*} userParam the parameters that the user defined in the dialog
 * @param {*} currentRowData the current line transaction data
 * @returns an object with the calculation data.
 */
function calculateShareSaleData(banDoc,docInfo,userParam,itemsData){
    
    var saleData={};
    var item="";
    var quantity="";
    var marketPrice="";
    var currExRate=""; //current exchange rate
    var accExRate=""; //accounting exchange rate
    var avgCost="";
    var avgSharesValue="";
    var totalSharesvalue="";
    var saleResult="";
    var exRateResult="";
    var transList=getTransactionsTableData(banDoc,docInfo);
    
    item=userParam.selectedItem;
    quantity=userParam.quantity;
    marketPrice=userParam.marketPrice;
    currExRate=userParam.currExRate;
    accExRate=getAccountingCourse(item,itemsData,banDoc);

    avgCost=getAverageCost(item,transList);
    avgSharesValue=getSharesAvgValue(quantity,avgCost);
    totalSharesvalue=getSharesTotalValue(quantity,marketPrice);
    saleResult=getSaleResult(avgSharesValue,totalSharesvalue);
    exRateResult=getExchangeResult(marketPrice,quantity,currExRate,accExRate);

    saleData.avgCost=avgCost;
    saleData.avgSharesValue=avgSharesValue;
    saleData.totalSharesvalue=totalSharesvalue;
    saleData.saleResult=saleResult;
    saleData.exRateResult=exRateResult;

    return saleData;

}

function getItemBalance(banDoc,item,itemsData){
    var accBalance={};

    accBalance.account=getItemValue(itemsData,item,"account");
    accBalance.currbalance=banDoc.currentBalance(accBalance.account);

    return accBalance;
}

function getItemValue(itemsData,item,value){
    if(itemsData){
        for(var e in itemsData){
            if(itemsData[e].item==item && itemsData[e][value]!=""){
                return itemsData[e][value];
            }
        }
    }else 
        return false;
}

/**
 * Ritorna i dati presenti nella tabella conti.
 */
function getAccountsTableData(banDoc,docInfo){
    let accountsData=[];
    let accTable=banDoc.table("Accounts");

    if(!accTable){
        accountsData;
    }

    for (var i = 0; i < accTable.rowCount; i++) {
        var tRow = accTable.row(i);
        var accRow={};
        accRow.rowNr=tRow.rowNr;
        accRow.group = tRow.value("Group");
        accRow.account = tRow.value("Account");
        accRow.description = tRow.value("Description");
        accRow.bClass = tRow.value("BClass");
        accRow.sumIn = tRow.value("Gr");
        accRow.bankAccount = tRow.value("BankAccount");
        accRow.exchangeRateDiffAcc=tRow.value("AccountExchangeDifference");
        if(docInfo.isMultiCurrency)
            accRow.currency=tRow.value("Currency");       
        //...

        if(accRow.account || accRow.group)
            accountsData.push(accRow);
    }

    return accountsData;


}

/**
 * Retrieves item information from the items table
 * @returns 
 */
function getItemsTableData(docInfo){
    //get the items list from the items table
    var itemsData=[];
    let table = Banana.document.table("Items");
    if (!table) {
        return itemsData;
    }
    for (var i = 0; i < table.rowCount; i++) {
        var tRow = table.row(i);
        var itemData={};
        itemData.rowNr=tRow.rowNr;
        itemData.item = tRow.value("ItemsId");
        itemData.description=tRow.value("Description");
        itemData.account=tRow.value("Account");
        itemData.currentQt=tRow.value("QuantityCurrent");
        itemData.valueCurrent=tRow.value("ValueCurrent");
        itemData.group=tRow.value("Group");
        itemData.expiryDate=tRow.value("ExpiryDate");
        itemData.interestRate=tRow.value("Notes");
        itemData.currency="";
        if(docInfo.isMultiCurrency)
            itemData.currency=tRow.value("Currency");
        if (itemsData && itemData.item)//only if the item has an id (isin)
            itemsData.push(itemData);
    }
    return itemsData;
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
 * Recupero il bilancio iniziale e finale per i conti passati come parametro.
 * @param {*} secAccountsList lista di conti
 */
function getSecurityAccountsData(banDoc,secAccountsList){
    var secAccountsData=[];

    for (var i=0;i<secAccountsList.length;i++){
        var accData={};
        var accBalance=""; //temp variable
        var account=secAccountsList[i];

        accBalance=banDoc.currentBalance(account);

        accData.account=account;
        accData.accountCurrBal=accBalance.balance;//current balance of the account
        accData.accountInitBal=accBalance.opening;//initial balance of the account

        secAccountsData.push(accData);

    }

    return secAccountsData;

}

/**
 * For each items creates an object containing the transactions wich includes the item id (isin) in the item column.
 * @param {*} itemsData 
 */
    function getItemsDataList(itemsData,transactionsData){

    var itemsDataList=[];

    for(var key in itemsData){
        var itemData={};
        itemData.item="";
        itemData.transactions=[];

        itemData.item=itemsData[key].item;
        itemData.transactions=getItemRelatedTransactions(itemsData[key].item,transactionsData);

        itemsDataList.push(itemData);
    }
    return itemsDataList;
}

/**
 * Get the transactions related to the item passed as parameter
 * @param {*} item 
 * @param {*} transactionsData 
 * @returns 
 */
function getItemRelatedTransactions(item,transactionsData){
    var transactions=[];
    for(var key in transactionsData){
        if(transactionsData[key].item.contains(item)){
            var trData={};
            trData.description=transactionsData[key].description;
            trData.qt=transactionsData[key].qt;
            trData.unitPrice=transactionsData[key].unitPrice;
            trData.amount=transactionsData[key].amount;
            transactions.push(trData);
        }
    }
    return transactions;
}
