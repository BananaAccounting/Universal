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
// @id = ch.banana.portfolio.management.calculation.methods.js
// @api = 1.0
// @pubdate = 2022-01-13
// @publisher = Banana.ch SA

/**
 * This script contains the methods used for calculating securities transactions.
 */

/**********************************************************
 * 
 * PORTFOLIO MANAGEMENT METHODS
 * 
 *********************************************************/

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
            trData.qt=tRow.value("Quantity");;
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

function getSumOfPurchasedShares(item,currentSelectionTop,transList){
    //look for all purchases done before for this item, and sum the amounts
    var purchasesSum="";
    var rowPurchase="";

    if(transList){
        for (var i = 0; i < transList.length; i++) {
            if(transList[i].item==item && transList[i].qt && Banana.SDecimal.sign(transList[i].qt)!=-1 && transList[i].row<=currentSelectionTop ){
                rowPurchase=transList[i].amount;
                purchasesSum=Banana.SDecimal.add(purchasesSum,rowPurchase);
            }
        }
    }
    return purchasesSum;


}

function getQtOfSharesPurchased(item,currentSelectionTop,transList){
    //look for all purchases done before for this item, and sum the quantities
    var purchaseQt="";
    var rowQt="";

    if(transList){
        for (var i = 0; i < transList.length; i++) {
            if(transList[i].item==item && transList[i].qt && Banana.SDecimal.sign(transList[i].qt)!=-1 && transList[i].row<=currentSelectionTop){
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
 function getAverageCost(item,currentSelectionTop,transList){

    var purchaseSum=getSumOfPurchasedShares(item,currentSelectionTop,transList);
    var purchaseQt=getQtOfSharesPurchased(item,currentSelectionTop,transList);
    var avgCost="";

    //calculate the average cost and return it
    var context = {'decimals' : 2, 'mode' : Banana.SDecimal.HALF_UP};
    avgCost=Banana.SDecimal.divide(purchaseSum,purchaseQt,context);

    return avgCost;

}

/**
 * Trova il corso totale di un obbligazione.
 * il corso totale è il prezzo con qui l'abbiamo aquistata, e lo cerchiamo nella tabella registrazioni
 * Se della stessa obbligazione vengono trovati due acquisti, viene fatta la media tra gli importi.
 * @param {*} transList 
 */
 function getBondTotalCourse(transList,userParam){

    let total="";
    let result="";
    let elementsNr=0;

    for(var t in transList){
        if(transList[t].item==userParam.selectedItem && transList[t].qt && Banana.SDecimal.sign(transList[t].qt)!=-1){ //cerco la riga di registrazione di acquisto dell'obbligazione, controllando che la quantità sia positiva.
            total = Banana.SDecimal.add(total,transList[t].amount);
            elementsNr++;
        }
    }
    result = total / elementsNr;

    return result;

}

/**
 * Bonds:
 * Trova il corso di acquisto, indicato nella colonna unitPrice al momento dell'acquisto del titolo.
 * Se sono stati effetuati più acquisti dello stesso titolo viene fatta la media tra i prezzi di acquisto
 * L'importo che ne risulterà viene inserito nella registra
 */
function getPurchaseCourse(transList,item,currentSelectionTop){
    var purCourse="";
    var elements=0;

    if(transList){
        for (var i = 0; i < transList.length; i++) {
            if(transList[i].item==item && transList[i].qt && Banana.SDecimal.sign(transList[i].qt)!=-1 && transList[i].row<=currentSelectionTop){
                rowPurchase=transList[i].unitPrice;
                purCourse=Banana.SDecimal.add(purCourse,rowPurchase);
                elements++;
            }
        }
        purCourse=Banana.SDecimal.divide(purCourse,elements);

        return purCourse;
    }
}

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
 * @param {*} avgCost the average cost
 * @param {*} userParam the parameters that the user defined in the dialog
 * @param {*} currentRowData the current line transaction data
 * @returns an object with the calculation data.
 */
function calculateShareSaleData(avgCost,userParam,currentRowData,accountingCourse){
    
    var shareData={};
    var exCurrentCourse=currentRowData.rate; //il corso corrente, indicato nella registrazione

    shareData.netTransaction=currentRowData.amount; //importo della riga corrente
    shareData.charges=userParam.bankChargesAmount;

    //importo totale vendita azioni (importo trasmesso dalla banca più le spese trattenute)
    shareData.totSaleShare={};
    shareData.totSaleShare.assetCurr=Banana.SDecimal.add(shareData.charges,shareData.netTransaction);//valore di vendita effettivo (con spese incluse)
    //base currencies values
    shareData.totSaleShare.baseCurr=Banana.SDecimal.multiply(exCurrentCourse,shareData.totSaleShare.assetCurr);//valore effettivo (da mostrare nel dialogo)
    shareData.totSaleShare.accounting=Banana.SDecimal.multiply(accountingCourse,shareData.totSaleShare.assetCurr);//valore contabile (in chf)

    //Result on exchange rate variation 
    shareData.changeResult=Banana.SDecimal.subtract(shareData.totSaleShare.baseCurr,shareData.totSaleShare.accounting);
    
    //other data
    shareData.quantity=userParam.quantity;
    shareData.PricePerShare=Banana.SDecimal.divide(shareData.totSaleShare.assetCurr,shareData.quantity);
    shareData.avgCost=avgCost;
    shareData.avgShareValue=Banana.SDecimal.multiply(shareData.quantity,shareData.avgCost);

    //Results
    //sales
    shareData.saleResult=Banana.SDecimal.subtract(shareData.totSaleShare.assetCurr,shareData.avgShareValue);
    shareData.profitOnSale=false;
    if(Banana.SDecimal.sign(shareData.saleResult)=="1")
    shareData.profitOnSale=true;
    //exchange
    shareData.exchangeResult=Banana.SDecimal.subtract(shareData.totSaleShare.baseCurr,shareData.totSaleShare.accounting);
    shareData.profitOnExchange=false;
    if(Banana.SDecimal.sign(shareData.exchangeResult)=="1")
    shareData.profitOnExchange=true;

    return shareData;

}

function calculateBondSaleData(bondTotalCourse,userParam){
    var bondData={};
    
    bondData.currentValue=bondTotalCourse;
    bondData.nominalValue=userParam.quantity;
    bondData.marketValue=Banana.SDecimal.multiply(userParam.marketPrice,bondData.nominalValue);
    bondData.result=Banana.SDecimal.subtract(bondData.marketValue,bondData.currentValue);
    bondData.profitOnSale=false;
    if(Banana.SDecimal.sign(bondData.result)=="1")
    bondData.profitOnSale=true;

    return bondData;

}

function calculateSecurityClosingData(banDoc,userParam,itemsData){
    var closingData={};
    var accBalance=getItemBalance(banDoc,userParam.selectedItem,itemsData);

    closingData.account=accBalance.account;
    closingData.balance=accBalance.currentBalance;
    closingData.marketValue=Banana.SDecimal.multiply(userParam.marketPrice,userParam.quantity);
    closingData.adjustment=Banana.SDecimal.subtract(closingData.marketValue,closingData.balance);
    closingData.profit=false;
    if(Banana.SDecimal.sign(closingData.adjustment)=="1")
        closingData.profit=true;

    return closingData;

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
 * defines the xml name of the column where the amount is entered 
 * according to whether it is a multi-currency account or not
 * @param {*} multiCurrencyAccounting 
 */
 function getAmountColumn(docInfo){
    var columnName="Amount";

    if(docInfo.isMultiCurrency){
        columnName="AmountCurrency";
    }

    return columnName;
}

/**
 * Simply defines the description for the line on which the profit or loss is recorded.
 * Profit/loss on sale and Profit/loss on exchange have a difference description.
 * @param {*} profit bool that identifies a profit or loss
 * @param {*} type profit/loss on sale or exchange
 * @returns 
 */
function setOperationResultDecription(profit,type){
    var description="";

    switch(type){
        case "sale":
            if(profit)
            description="Profit on Sale";
            else
            description="Loss on Sale";
            return description;

        case "exchange":
            if(profit)
            description="Exchange rate profit";
            else
            description="Exchange rate loss";
            return description;
        default:
            return description;
    }
}

/**
 * returns the correct account depending on the result of the sale (profit or loss), accounts are defined by the user in the dialog 
 * @param {*} profitOnSale 
 * @param {*} userParam 
 * @returns 
 */
function getAccountForResult(profitOnSale,userParam){
    var account="";

    if(profitOnSale){
        account=userParam.profitOnSecurities;
    }else{
        account=userParam.lossOnSecurities;
    }

    return account;
}

/**
 * ritorna i dati presenti nella tabella conti.
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
 * Cerco i risultati prima nella tabella conti, colonna "Exch. rate Diff. Acct."
 * Se non dovessi trovare niente guardo nelle proprietà del file.
 * Se non ce nessun riferimento a dei conti avverto l'utente, e ne imposto io di default.
 */
function getAccountsForExchangeResult(banDoc,docInfo){
    var accExchRes={};
    var accData=getAccountsTableData(banDoc,docInfo);

    //cerco nella tabella conti
    for(var r in accData ){
        element=accData[r];
        if(element.exchangeRateDiffAcc){
            //l'utile e la perdita vengono registrati sullo stesso conto
            accExchRes.loss=element.exchangeRateDiffAcc;
            accExchRes.profit=element.exchangeRateDiffAcc;
            return accExchRes;
        }
    }

    //se non viene trovato niente nel piano dei conti, cerco nelle proprietà del file
    if(docInfo && docInfo.accountExchangeRateProfit && docInfo.accountExchangeRateLoss){
        accExchRes.loss=docInfo.accountExchangeRateLoss;
        accExchRes.profit=docInfo.accountExchangeRateProfit;
        return accExchRes;
    }

    //se non viene trovato nessun riferimento viene assegnato un conto de default (standard piano dei conti per PMI svizzero)
    accExchRes.loss="6949";
    accExchRes.profit="6999";
    return accExchRes;

}

/**
 * Retrieves item information from the items table
 * @returns 
 */
function getItemsTableData(docInfo){
    //get the items list from the items table
    var itemsData=[];
    let table = Banana.document.table("Items");
    let value = "";
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
        if (itemsData)
            itemsData.push(itemData);
    }
    return itemsData;
}
