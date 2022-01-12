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
// @id = ch.banana.securities.calculation.methods
// @api = 1.0
// @pubdate = 2022-01-13
// @publisher = Banana.ch SA

/**
 * This script contains the methods used for calculating securities transactions.
 */

/**********************************************************
 * 
 * SHARES SALE METHODS
 * 
 *********************************************************/


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
 function getTransactionsTableData(banDoc){
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
            trData.currencyAmount="AmountCurrency";
            trData.currency="ExchangeCurrency";

            transactionsList.push(trData);

        }
    } else(Banana.console.debug("no transactions table"));

    return transactionsList;
}

/**
 *Calculate the average cost by reading all purchase records of the item passed as a parameter
 */
 function getAverageCost(transactionsList,currentSelectionTop,userParam){
    //per ora prendo tutti gli acquisti fatti prima della riga selezionata
    var unitPrices=[];
    var unitPrice="";
    var avgCost="";
    var item=userParam.selectedItem;

    
    for (var i = 0; i < transactionsList.length; i++) {
        if (transactionsList[i].row<=currentSelectionTop && transactionsList[i].item==item) {
            unitPrice = transactionsList[i].unitPrice;
            if (unitPrice.length > 0) {
                unitPrices.push(unitPrice);
            }
        }
    }

    avgCost=getAverageCost_calc(unitPrices);

    return avgCost;


}

function getAverageCost_calc(unitPrices){

    var avgCost="";

    for (var i = 0; i < unitPrices.length; i++) {
        avgCost = Banana.SDecimal.add(avgCost, unitPrices[i]);
    }
    //divido la somma per il numero di elementi.

    avgCost = Banana.SDecimal.divide(avgCost, unitPrices.length);

    return avgCost;

}

function calculateSharesData(avgCost,userParam){
    
    var sharesData={};

    sharesData.avgCost=avgCost;
    sharesData.currentValue=Banana.SDecimal.multiply(sharesData.avgCost,userParam.quantity);
    sharesData.marketValue=Banana.SDecimal.multiply(userParam.marketPrice,userParam.quantity);
    sharesData.result=Banana.SDecimal.subtract(sharesData.currentValue,sharesData.marketValue);
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
        itemData.item = tRow.value("ItemsId");
        itemData.bankAccount=tRow.value("Account");
        if (itemsData) {
            itemsData.push(itemData);
        }
    }
    return itemsData;
}
    