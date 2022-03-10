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

function getReportHeader(report, docInfo) {
    var headerParagraph = report.getHeader().addSection();
    headerParagraph.addParagraph(docInfo.company, "styleNormalHeader styleCompanyName");
    headerParagraph.addParagraph(docInfo.address, "styleNormalHeader");
    headerParagraph.addParagraph(docInfo.zip+" "+docInfo.city, "styleNormalHeader");
    headerParagraph.addParagraph(docInfo.zip + " " + docInfo.city, "styleNormalHeader");
    headerParagraph.addParagraph("", "");
    headerParagraph.addParagraph("", "");
    headerParagraph.addParagraph("", "");

}

function getComboBoxElement(scriptId,title,label) {

    var item = "";
    //Read script settings
    var data = Banana.document.getScriptSettings(scriptId);

    //Check if there are previously saved settings and read them
    if (data.length > 0) {
        var readSettings = JSON.parse(data);
        //We check if "readSettings" is not null, then we fill the formeters with the values just read
        if (readSettings) {
            item = readSettings;
        }
    }
    //A dialog window is opened asking the user to insert the desired period. By default is the accounting period
    var selectedItem = Banana.Ui.getText(title,label,item);

    //We take the values entered by the user and save them as "new default" values.
    //This because the next time the script will be executed, the dialog window will contains the new values.
    if (selectedItem) {
        item=selectedItem;
        //Save script settings
        var valueToString = JSON.stringify(item);
        Banana.document.setScriptSettings(scriptId,valueToString);
    } else {
        //User clicked cancel
        return false;
    }
    return item;
}

function getItemCurrency(itemData,item){
    let itemcCurr="";

    for(var e in itemData){
        if(itemData[e].item==item && itemData[e].currency!==""){
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
    docInfo.company=banDoc.info("AccountingDataBase","Company");
    docInfo.address=banDoc.info("AccountingDataBase","Address1");
    docInfo.zip=banDoc.info("AccountingDataBase","Zip");
    docInfo.city=banDoc.info("AccountingDataBase","City");


    return docInfo;

}

/**
 * Reads the journal data and returns an array of objects with the information we need
 * @param {*} journal journal table
 */
 function getJournalData(docInfo,journal,selectedItem){
    var journalData=[];

    for (var i = 0; i < journal.rowCount; i++) {
        var tRow = journal.row(i);
        var jrRow={};
        jrRow.date=tRow.value("JDate");
        jrRow.trId=tRow.value("JContraAccountGroup");
        jrRow.item = tRow.value("ItemsId");
        jrRow.description = tRow.value("Description");
        jrRow.debitBase = tRow.value("JDebitAmount"); //debit value in base currency
        jrRow.creditBase = tRow.value("JCreditAmount"); //credit value base currency
        jrRow.balanceBase = tRow.value("JBalance"); //credit value base currency
        jrRow.qt = tRow.value("Quantity"); //credit value base currency
        jrRow.unitPrice = tRow.value("UnitPrice"); //credit value base currency
        if(docInfo.isMultiCurrency){
            jrRow.debitCurr = tRow.value("JDebitAmountCurrency"); //debit value in base currency
            jrRow.creditCurr = tRow.value("JCreditAmountCurrency"); //credit value base currency
            jrRow.balanceCurr = tRow.value("JBalanceAccountCurrency"); //credit value base currency
        }

        if(selectedItem===jrRow.item)//We only keep records that relate to the chosen item. 
            journalData.push(jrRow);
    }

    return journalData;

}

/**
 * saves the list of ids of all registrations in an array. each id is saved only once
 * @param {*} journalData 
 */
 function getTransactionsIdList(journalData){
    var trIdElements=new Set();
    var trIdList=[];

    for(var key in journalData){
        trIdElements.add(journalData[key].trId);
    }

    trIdList=Array.from(trIdElements);

    return trIdList;

}

/**
 * Retrieves the transactions from the account card of the item selected by the user and
 * returns the transactions as objects.
 * In order to save the data from the account card, I use two checks: the first one checks that the isin in the item column matches,
 *  the second one checks that the transaction number matches one of those in the list. 
 * This check is due to the fact that not all of the entries regarding the item have a direct reference to the isin in the column, 
 * for example the sale entry did not indicate the item.
 * @param {*} selectedItem item selected by the user
 * @param {*} docInfo item selected by the user
 * @param {*} accountCard account card (table obj)
 * @param {*} trIdList list of transaction ids concerning the item. the list was retrieved by doing the journal
 */
 function getAccountCardData(docInfo,selectedItem,accountCard,trIdList){
    var transactions=[];

    if (!accountCard) {
        return transactions;
    }
    for (var i = 0; i < accountCard.rowCount; i++) {
        var tRow = accountCard.row(i);
        var trData={};
        trData.rowNr=tRow.rowNr;
        trData.date=tRow.value("Date");
        trData.trId=tRow.value("JContraAccountGroup");
        trData.item = tRow.value("ItemsId");
        trData.description = tRow.value("Description");
        trData.debitBase = tRow.value("JDebitAmount"); //debit value in base currency
        trData.creditBase = tRow.value("JCreditAmount"); //credit value base currency
        trData.balanceBase = tRow.value("JBalance"); //credit value base currency
        trData.unitPrice=tRow.value("UnitPrice");
        if(docInfo.isMultiCurrency){
            trData.debitCurr = tRow.value("JDebitAmountAccountCurrency"); //debit value in base currency
            trData.creditCurr = tRow.value("JCreditAmountAccountCurrency"); //credit value base currency
            trData.balanceCurr = tRow.value("JBalanceAccountCurrency"); //credit value base currency
        }
        trData.qt=tRow.value("Quantity");

        /**
         * 
         */
        if (trData.item===selectedItem || transactionRefToTheItem(trIdList,trData.trId))
            transactions.push(trData);
    }
    return transactions;
}

function getItemCardData(accountCardData,journalData){
    var itemCardData={};
    var balRefCol=""; //ref column for balance

    SetSoldData(accountCardData,journalData);
    getQuantityBalance(accountCardData);

    itemCardData=getCurrentAccAvgCost(accountCardData,balRefCol);

    return itemCardData;
}

/**
 *  * Calculates how the average accounting cost of the security is updated after each movement.
 * The accounting average cost is calculated by doing: Balance (in the item currency)/Quantity balance.
 * Calculates for each line of the card the average accounting purchase price.
 * @param {*} accountCardData 
 * @param {*} balanceCol 
 */
 function getCurrentAccAvgCost(accountCardData){
    var context = {'decimals' : 2, 'mode' : Banana.SDecimal.HALF_EVEN};
    for(var key in accountCardData){
        /**
         * if the balance sheet column in foreign currency exists, I am sure that it is a multi-currency account, 
         * so I take the value of the balance sheet in the currency of the asset, wich in case of an asset in the same currency as the base currency, 
         * the value is the same.
         */
        if(accountCardData[key].balanceCurr)
            accountCardData[key].accAvgCost=Banana.SDecimal.divide(accountCardData[key].balanceCurr,accountCardData[key].qtBalance,context);
        else
            accountCardData[key].accAvgCost=Banana.SDecimal.divide(accountCardData[key].balanceBase,accountCardData[key].qtBalance,context);
    }

    return accountCardData;
}

/**
 * Sets the quantity and the price to the sales records in the accountCard by taking the data from the journal lines
 * If the accountCard line does not have the item, it means that the  
 * represents the sales amount. To this amount I add the quantity that I retrieve from the journal, 
 * I retrieve it by going to the only line that contains a reference to the quantity of the record with the same id.
 * @param {*} accountCardData 
 * @param {*} journalData 
 */
 function SetSoldData(accountCardData,journalData){

    for(var key in accountCardData){
        let trId=accountCardData[key].trId;
        accountCardData[key].qt=getJournalValueFiltered(journalData,trId,"qt",);
        accountCardData[key].unitPrice=getJournalValueFiltered(journalData,trId,"unitPrice");
    }
    return accountCardData
}

/**
 * Calculates for each line of the card the cumulative quantity
 * @param {*} accountCardData 
 * @returns 
 */
 function getQuantityBalance(accountCardData){
    let amountBalance="";
    for(var key in accountCardData){
        amountBalance=Banana.SDecimal.add(amountBalance,accountCardData[key].qt);
        accountCardData[key].qtBalance=amountBalance;
    }
    return accountCardData;
}

function getJournalValueFiltered(journalData,trId,objProp){

    let value="";
    for(var key in journalData){
        if(journalData[key].trId==trId && journalData[key][objProp]){
            //in the journal I should only have one entry line that corresponds to the control parameters.
            value=journalData[key][objProp];
            return value;
        }
    }
    return value;
}

/**
 * Check that the transaction id is in the list of registration ids on the item.
 * @param {*} trIdList list of id
 * @param {*} trId the transaction id
 */
 function transactionRefToTheItem(trIdList,trId){
    for(var i=0;i<trIdList.length;i++){
        if(trId===trIdList[i])
            return true;
    }
    return false;
}

/**
 * Get the data from the transactions table only once
 * The isreport parameter identifies the script from which i call the method. for the report i need to take the amount in base currency in any case (method to be reviewed)
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
                trData.amountCurr=tRow.value("AmountCurrency");
                trData.currency=tRow.value("ExchangeCurrency");
                trData.rate=tRow.value("ExchangeRate");
            }
            trData.amountBase=tRow.value("Amount");


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
                if(transList[i].amountCurr)
                    rowPurchase=transList[i].amountCurr;
                else
                    rowPurchase=transList[i].amountBase;
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

    //cambiare metodo di calcolo del prezzo medio ?

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

    Banana.console.debug(accExRate);

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

/******************************************************
 * 
 * Specifics methods for riconciliation report (forse da spostare)
 * 
 *****************************************************/

/**
 * Creates an array with all the data of all the items that are registered under this account 
 * @param {*} itemsData list of items
 * @param {*} transactionsData list of transactions
 * @param {*} account ref. account.
 */
    
function getItemsDataList(itemsData,transactionsData,account){

    var itemsDataList=[];

    for(var key in itemsData){
        if(account==itemsData[key].account){ //i want to take the transactions related only to the account gave as parameter.
            var itemData={};
            itemData.item="";
            itemData.transactions=[];

            itemData.item=itemsData[key].item;
            itemData.transactions=getItemRelatedTransactions(itemsData[key].item,transactionsData);
            //i take the resulting balance from the transactions for displaiing it as result balance for the item.
            if(itemData.transactions){
                itemData.balanceBase=itemData.transactions.slice(-1)[0].balanceBase;
                itemData.balanceCurr=itemData.transactions.slice(-1)[0].balanceCurr;
            }

            itemsDataList.push(itemData);
        }
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
    var  qtBalance="";
    var amountBalanceBase="";
    var amountBalanceCurr="";

    for(var key in transactionsData){
        if(transactionsData[key].item.includes(item)){
            var trData={};
            trData.description=transactionsData[key].description;
            trData.qt=transactionsData[key].qt;
            qtBalance=Banana.SDecimal.add(qtBalance,trData.qt);
            trData.qtBalance=qtBalance;
            trData.unitPrice=transactionsData[key].unitPrice;
            trData.amountBase=setSign(transactionsData[key].amountBase,trData.qt,transactionsData[key].debit);
            trData.amountCurr=setSign(transactionsData[key].amountCurr,trData.qt,transactionsData[key].debit);
            amountBalanceBase=Banana.SDecimal.add(amountBalanceBase,trData.amountBase);
            amountBalanceCurr=Banana.SDecimal.add(amountBalanceCurr,trData.amountCurr);
            trData.balanceBase=amountBalanceBase;
            trData.balanceCurr=amountBalanceCurr;
            transactions.push(trData);
        }
    }
    return transactions;
}

/**
 * Sets the negative sign to those amounts that represent a decrease in the value of the securities account.
 * Decreases are recognised in the thank you entries:
 * -The negative quantity in the quantity column, i.e. a sale of securities.
 * -To losses on the sale, in this case I have recorded the loss in a debit account.
 * 
 * @param {*} amount
 * @param {*} qt 
 * @param {*} debitAmount 
 */
function setSign(amount,qt,debitAmount){
    var newAmount="";

    if(!amount){
        return newAmount;
    }

    if((qt.includes("-"))|| debitAmount!=="" && qt==""){
        newAmount="-"+amount;
        return newAmount;
    }

    return amount;
}

/**
 * sums the elements in the array, taking into account the values in the property passed as parameter  
 * @param {*} transactions 
 * @returns 
 */
function sumArrayElements(objArray,property){
    var sum="";

    for(var key in objArray){
        sum=Banana.SDecimal.add(sum,objArray[key][property]);
    }


    return sum;
}

/**
 * For each account creates an object containing the open balance, the current balance and the account nr of the account
 * @param {*} banDoc 
 * @param {*} accountList the list of the accounts defined by the user.
 */
function getAccountsDataList(banDoc,accountList,itemsData,transactionsData){
    var accDataList=[];

    for(var i=0;i<accountList.length;i++){
        var account=accountList[i];
        var itemsDataList=[];
        var accData={};
        var accBalance={};

        accBalance=banDoc.currentBalance(account);

        accData.account=accountList[i];
        accData.openBalanceBase=accBalance.opening;
        accData.openBalanceCurr=accBalance.openingCurrency;
        accData.currentBalanceBase=accBalance.balance;
        accData.currentBalanceCurr=accBalance.balanceCurrency;
        accData.currency="";

        //get the items data.
        itemsDataList=getItemsDataList(itemsData,transactionsData,account); //ritorna l'array di items con questo account.
        accData.items=itemsDataList;

        //get total amount of transactions for securities registered in this account
        accData.securityTrAmountBase=sumArrayElements(itemsDataList,"balanceBase"); 
        accData.securityTrAmountCurrency=sumArrayElements(itemsDataList,"balanceCurr");

        //difference between the securities transactions and the account balance (should be 0).
        accData.differenceBase=Banana.SDecimal.subtract(accData.securityTrAmountBase,accData.currentBalanceBase);
        accData.differenceCurr=Banana.SDecimal.subtract(accData.securityTrAmountCurr,accData.currentBalanceBase);

        accDataList.push(accData);

    }

    return accDataList;
}
