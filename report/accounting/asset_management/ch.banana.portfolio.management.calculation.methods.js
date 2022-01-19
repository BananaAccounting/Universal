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

function getCurrentRowDate(banDoc,transList){
    var currRowNr=banDoc.cursor.rowNr;
    var currentRowDate="";

    if(transList){
        for (var i = 0; i < transList.length; i++) {
            if(transList[i].row==currRowNr){
                currentRowDate=transList[i].date;
                return currentRowDate;
            }
        }
    }
}


function checkIfMultiCurrencyAccounting(banDoc){
    //file type numbers
    var multiCurrency="120";
    var isMultiCurrency=false;

    //get the document info and check the type of the accounting file
    var fileNumber=banDoc.info("Base","FileTypeNumber");

    if(fileNumber==multiCurrency){
        isMultiCurrency=true;
    }


    return isMultiCurrency;

}

/**
 * Get the data from the transactions table only once
 */
 function getTransactionsTableData(banDoc,multiCurrencyAcc){
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
            if(multiCurrencyAcc){
                trData.amount=tRow.value("AmountCurrency");
                trData.currency="ExchangeCurrency";
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
            if(transList[i].item==item && Banana.SDecimal.sign(transList[i].qt)!==-1 && transList[i].row<=currentSelectionTop ){
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
            if(transList[i].item==item && Banana.SDecimal.sign(transList[i].qt)!==-1 && transList[i].row<=currentSelectionTop){
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

function calculateSharesData(avgCost,userParam){
    
    var sharesData={};

    sharesData.avgCost=avgCost;
    sharesData.currentValue=Banana.SDecimal.multiply(sharesData.avgCost,userParam.quantity);
    sharesData.marketValue=Banana.SDecimal.multiply(userParam.marketPrice,userParam.quantity);
    sharesData.result=Banana.SDecimal.subtract(sharesData.marketValue,sharesData.currentValue);
    sharesData.profitOnSale=false;
    if(Banana.SDecimal.sign(sharesData.result)=="1")
    sharesData.profitOnSale=true;

    return sharesData;

}

/**
 * defines the xml name of the column where the amount is entered 
 * according to whether it is a multi-currency account or not
 * @param {*} multiCurrencyAccounting 
 */
 function getAmountColumn(multiCurrencyAccounting){
    var columnName="Amount";

    if(multiCurrencyAccounting){
        columnName="AmountCurrency";
    }

    return columnName;
}

/**
 * simply defines the description for the line on which the profit or loss is recorded.
 * @param {*} profitOnSale if true there is a profit on sale
 * @returns 
 */
function setResultDecription(profitOnSale){
    var description="";

    if(profitOnSale)
        description="profit on sale";
    else
        description="loss on sale";

    return description;
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
 * Retrieves item information from the items table
 * @returns 
 */
function getItemsTableData(){
    //get the items list from the items table
    var itemsData=[];
    let table = Banana.document.table("Items");
    let value = "";
    if (!table) {
        return value;
    }
    for (var i = 0; i < table.rowCount; i++) {
        var tRow = table.row(i);
        var itemData={};
        itemData.rowNr=tRow.rowNr;
        itemData.item = tRow.value("ItemsId");
        itemData.bankAccount=tRow.value("Account");
        itemData.currentQt=tRow.value("QuantityCurrent");
        itemData.valueCurrent=tRow.value("ValueCurrent");
        itemData.group=tRow.value("Group");
        itemData.interestRate=tRow.value("Notes");
        if (itemsData) {
            itemsData.push(itemData);
        }
    }
    return itemsData;
}
