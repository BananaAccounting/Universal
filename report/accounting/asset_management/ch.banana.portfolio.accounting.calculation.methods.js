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

/**********************************************************
 * 
 * PORTFOLIO ACCOUNTING METHODS
 * 
 *********************************************************/

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
    let multiCurrency="120";
    let multiCurrency_withVat="130";
    docInfo.isMultiCurrency=false;
    var fileNumber=banDoc.info("Base","FileTypeNumber");
    if(fileNumber===multiCurrency || fileNumber===multiCurrency_withVat)
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
 function getJournalData(docInfo,journal){
    var journalData=[];

    for (var i = 0; i < journal.rowCount; i++) {
        var tRow = journal.row(i);
        var jrRow={};
        jrRow.date=tRow.value("JDate");
        jrRow.doc=tRow.value("Doc");
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
 * 
 * @param {*} avgCost the average cost
 * @param {*} userParam the parameters that the user defined in the dialog
 * @param {*} currentRowData the current line transaction data
 * @returns an object with the calculation data.
 */
 function calculateShareSaleData(banDoc,docInfo,userParam,itemsData){
    
    let saleData={};
    let item="";
    let journal="";
    let quantity="";
    let marketPrice="";
    let currExRate=""; //current exchange rate
    let accExRate=""; //accounting exchange rate
    let avgCost="";
    let avgSharesValue="";
    let totalSharesvalue="";
    let saleResult="";
    let exRateResult="";
    let accountCard="";
    let accountCardData="";
    let itemAccount="";
    let itemCardData=[];
    
    item=userParam.selectedItem;//get the item
    itemAccount=getItemValue(itemsData,item,"account");//get the account of the item
    //check if element exist
    findElement(banDoc,item, itemsData,"item","Items table");
    //get item card data to find the current average cost
    journal = banDoc.journal(banDoc.ORIGINTYPE_CURRENT, banDoc.ACCOUNTTYPE_NONE);
    journalData=getJournalData(docInfo,journal);
    accountCard=banDoc.currentCard(itemAccount);
    accountCardData=getAccountCardData(docInfo,item,accountCard);
    itemCardData=getItemCardDataList(accountCardData,journalData);
    //extract from the array the current avg cost value (accounting value)
    if(itemCardData.length>=1){
        avgCost=itemCardData.slice(-1)[0].accAvgCost;
    }

    quantity=userParam.quantity;
    marketPrice=userParam.marketPrice;
    currExRate=userParam.currExRate;
    accExRate=getAccountingCourse(item,itemsData,banDoc);

    //avgCost=getAverageCost(item,transList);
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

/**
 * Retrieves the transactions from the account card of the item selected by the user and
 * returns the transactions as objects.
 * In order to save the data from the account card, i checks that the isin in the item column matches. 
 * @param {*} selectedItem item selected by the user.
 * @param {*} docInfo item selected by the user
 * @param {*} accountCard account card (table obj)
 */
 function getAccountCardData(docInfo,selectedItem,accountCard){
    let transactions=[];

    for (var i = 0; i < accountCard.rowCount; i++) {
        let tRow = accountCard.row(i);
        let trData={};
        trData.rowNr=tRow.rowNr;
        trData.doc=tRow.value("Doc");
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
        if (trData.item===selectedItem){//each item transaction has the item id (isin)
            transactions.push(trData);
        }
    }
    if(transactions.length>0)
        return transactions;
    else 
        return false;
}

function getItemCardDataList(accountCardData,journalData){

    SetSoldData(accountCardData,journalData);
    getQuantityBalance(accountCardData);
    getCurrentAccAvgCost(accountCardData);

    if(accountCardData){
        return accountCardData;
    }
    else{
        return false;
    }
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
 * Sum up the amounts.
 * @param {*} itemCardData 
 * @param {*} ref Indicates the name of the property in the object (column) from which the values to be summed are to be taken
 */
 function getSum(itemCardData,ref){
    var sum="";
    if(ref){
        for(var key in itemCardData){
            sum=Banana.SDecimal.add(sum,itemCardData[key][ref]);
        }
    }
    return sum;
}
/**
 * Calculates the balance.
 * @param {*} itemCardData 
 * @param {*} debRef debit data
 * @param {*} credRef credita data
 * @returns 
 */
function getBalance(itemCardData,debRef,credRef){
    var balance="";
    if(debRef || credRef){
        for(var key in itemCardData){
            //At each iteration, I add the value found in dates to the value on the balance sheet and subtract the value found in credits.
            balance=Banana.SDecimal.add(balance,itemCardData[key][debRef]);
            balance=Banana.SDecimal.subtract(balance,itemCardData[key][credRef]);
        }
    }
    return balance;
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
function getItemsTableData(banDoc,docInfo){
    //get the items list from the items table
    var itemsData=[];
    let table = banDoc.table("Items");
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

//COLOR FUNCTIONS

function hexToHSL(H, hue, saturation, lightness) {
    // Convert hex to RGB first
    let r = 0, g = 0, b = 0;
    if (H.length == 4) {
      r = "0x" + H[1] + H[1];
      g = "0x" + H[2] + H[2];
      b = "0x" + H[3] + H[3];
    } else if (H.length == 7) {
      r = "0x" + H[1] + H[2];
      g = "0x" + H[3] + H[4];
      b = "0x" + H[5] + H[6];
    }
    // Then to HSL
    r /= 255;
    g /= 255;
    b /= 255;
    let cmin = Math.min(r,g,b),
        cmax = Math.max(r,g,b),
        delta = cmax - cmin,
        h = 0,
        s = 0,
        l = 0;
  
    if (delta == 0)
      h = 0;
    else if (cmax == r)
      h = ((g - b) / delta) % 6;
    else if (cmax == g)
      h = (b - r) / delta + 2;
    else
      h = (r - g) / delta + 4;
  
    h = Math.round(h * 60);
  
    if (h < 0)
      h += 360;
  
    l = (cmax + cmin) / 2;
    s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);
  
  
    // eventually overwrite values
    if (hue) {
      h = hue;
    }
    if (saturation) {
      s = saturation;
    }
    if (lightness) {
      l = lightness;
    }
  
    return "hsl(" + h + "," + s + "%," + l + "%)"
  }

  
  function HSLToHex(hslColor) {
  
    // hsl(167,47.3%,39.4%)
  
    let h = '';
    let s = '';
    let l = '';
  
    let regexp = /hsl\(\s*(\d+)\s*,\s*(\d+(?:\.\d+)?%)\s*,\s*(\d+(?:\.\d+)?%)\)/g;
    let res = regexp.exec(hslColor).slice(1);
    h = res[0];
    s = res[1].replace(/%/,'');
    l = res[2].replace(/%/,'');
    //Banana.console.log("Hue: " + res[0] + "\nSaturation: " + res[1] + "\nValue: " + res[2]);
  
  
    //.... (h,s,l)
    s /= 100;
    l /= 100;
  
    let c = (1 - Math.abs(2 * l - 1)) * s,
        x = c * (1 - Math.abs((h / 60) % 2 - 1)),
        m = l - c/2,
        r = 0,
        g = 0, 
        b = 0; 
  
    if (0 <= h && h < 60) {
      r = c; g = x; b = 0;
    } else if (60 <= h && h < 120) {
      r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
      r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
      r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
      r = x; g = 0; b = c;
    } else if (300 <= h && h < 360) {
      r = c; g = 0; b = x;
    }
    // Having obtained RGB, convert channels to hex
    r = Math.round((r + m) * 255).toString(16);
    g = Math.round((g + m) * 255).toString(16);
    b = Math.round((b + m) * 255).toString(16);
  
    // Prepend 0s, if necessary
    if (r.length == 1)
      r = "0" + r;
    if (g.length == 1)
      g = "0" + g;
    if (b.length == 1)
      b = "0" + b;
  
    return "#" + r + g + b;
  }

  /**
   * Returns an object with colour gradients for the report
   * @param {*} HexColor the base color.
   */
  function getColors(HexColor){
    let colors={};

    //change the colors properties
    colors.hslColorEvenTableRow=hexToHSL(HexColor,'235','44','95');
    colors.hslColorOddTableRow=hexToHSL(HexColor,'231', '45', '85');

    //Set back the colors to HEX format
    colors.hslColorEvenTableRow = HSLToHex(colors.hslColorEvenTableRow);
    colors.hslColorOddTableRow = HSLToHex(colors.hslColorOddTableRow);

    return colors;
  }

  function checkIfNumberisEven(number){
      isEven=false;

      if(number%2==0)
        isEven=true;
    
        return isEven;
  }

  
function setVariables(variables, baseColor) {
    /* Variables that set the colors */
    variables.$baseColor = baseColor;

}

/**
 *Function that replaces all the css variables inside of the given cssText with their values.
 *All the css variables start with "$" (i.e. $font_size, $margin_top)
 * @param {*} cssText 
 * @param {*} variables 
 */
function replaceVariables(cssText, variables) {

    var result = "";
    var varName = "";
    var insideVariable = false;
    var variablesNotFound = [];

    for (var i = 0; i < cssText.length; i++) {
        var currentChar = cssText[i];
        if (currentChar === "$") {
            insideVariable = true;
            varName = currentChar;
        } else if (insideVariable) {
            if (currentChar.match(/^[0-9a-z]+$/) || currentChar === "_" || currentChar === "-") {
                // still a variable name
                varName += currentChar;
            } else {
                // end variable, any other charcter
                if (!(varName in variables)) {
                    variablesNotFound.push(varName);
                    result += varName;
                } else {
                    result += variables[varName];
                }
                result += currentChar;
                insideVariable = false;
                varName = "";
            }
        } else {
            result += currentChar;
        }
    }

    if (insideVariable) {
        // end of text, end of variable
        if (!(varName in variables)) {
            variablesNotFound.push(varName);
            result += varName;
        } else {
            result += variables[varName];
        }
        insideVariable = false;
    }

    if (variablesNotFound.length > 0) {
        //Banana.console.log(">>Variables not found: " + variablesNotFound);
    }
    return result;
}

/**
 * The purpose of this function is to find the account number or user-defined item 
 * within the data extracted from the tables (accounts and item) 
 * in order to avoid errors such as spaces in the input dialogue.
 * @param {*} accountParam the account defined by the user
 * @param {*} listData the list of data within which to search for values (list of elements from accounts table or from items table)
 * @param {*} refProp the property to be searched in the data list
 * @param {*} refTableName the name of the table where the param is searched.
 */
 function findElement(banDoc,userParam, listData,refProp,refTableName){
     //define error messages
     let ELEMENT_NOT_FOUND_IN_ACCOUNTING="ELEMENT_NOT_FOUND_IN_ACCOUNTING";
     let lang='en';
     let msg=getErrorMessage(ELEMENT_NOT_FOUND_IN_ACCOUNTING,lang,userParam,refTableName);

    for(var key in listData){
        //set to lower case the strings
        let ref_lower=listData[key][refProp].toLowerCase();
        let userParam_lower=userParam.toLowerCase();
        if((userParam_lower && ref_lower) && userParam_lower.includes(ref_lower)){//check the strings after the lower case.
            return listData[key][refProp];//return the original (not formatted value)
        }
    }
    //element not found in the listData, display a message
    banDoc.addMessage(msg,ELEMENT_NOT_FOUND_IN_ACCOUNTING);

    return userParam;

}

function getErrorMessage(errorId, lang,userParam,refTableName){
    if (!lang)
    lang = 'en';
    switch (errorId) {
        case "ELEMENT_NOT_FOUND_IN_ACCOUNTING":
            if (lang == "en")
                return "Element: "+userParam+" not found in "+refTableName;
            else
                return "Element: "+userParam+" not found in "+refTableName;
        case "ID_ERR_VERSION_NOTSUPPORTED":
            return "This script does not run with your current version of Banana Accounting.\nMinimum version required: %1.\nTo update or for more information click on Help";
        case "ID_ERR_LICENSE_NOTVALID":
            return "This extension requires Banana Accounting+ Advanced";
    }
    return '';
}

//VERSION CONTROL FUNCTIONS
function verifyBananaVersion(banDoc) {
    if (banDoc)
        return false;

    let lang = "en";

    let BAN_VERSION_MIN = "10.0.10";
    let BAN_DEV_VERSION_MIN = "";
    let ID_ERR_VERSION_NOTSUPPORTED="ID_ERR_VERSION_NOTSUPPORTED";
    let ID_ERR_LICENSE_NOTVALID="ID_ERR_LICENSE_NOTVALID";
    let CURR_VERSION = bananaRequiredVersion(BAN_VERSION_MIN, BAN_DEV_VERSION_MIN);
    let CURR_LICENSE = isBananaAdvanced();

    if (!CURR_VERSION) {
        let msg = getErrorMessage(ID_ERR_VERSION_NOTSUPPORTED, lang);
        msg = msg.replace("%1", BAN_VERSION_MIN);
        banDoc.addMessage(msg, ID_ERR_VERSION_NOTSUPPORTED);
        return false;
    }
    if (!CURR_LICENSE) {
        let msg = getErrorMessage(ID_ERR_LICENSE_NOTVALID, lang);
        banDoc.addMessage(msg, ID_ERR_LICENSE_NOTVALID);
        return false;
    }
    return true;
}

function bananaRequiredVersion(requiredVersion, expmVersion) {
     //Check Banana version
    if (expmVersion) {
        requiredVersion = requiredVersion + "." + expmVersion;
    }
    if (Banana.compareVersion && Banana.compareVersion(Banana.application.version, requiredVersion) >= 0) {
        return true;
    }
    return false;
}

function isBananaAdvanced() {
    // Starting from version 10.0.7 it is possible to read the property Banana.application.license.isWithinMaxRowLimits 
    // to check if all application functionalities are permitted
    // the version Advanced returns isWithinMaxRowLimits always false
    // other versions return isWithinMaxRowLimits true if the limit of transactions number has not been reached

    if (Banana.compareVersion && Banana.compareVersion(Banana.application.version, "10.0.10") >= 0) {
        var license = Banana.application.license;
        if (license.licenseType === "advanced" || license.isWithinMaxFreeLines) {
            return true;
        }
    }

    return false;
}