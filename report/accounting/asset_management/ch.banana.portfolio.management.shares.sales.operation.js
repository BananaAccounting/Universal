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

 var SharesSaleOperation=class SharesSalesOperation{

    constructor(banDoc,tabMovementsData,tabItemsData,docInfo){
        this.banDoc=banDoc;
        this.tabMovementsData=tabMovementsData;
        this.tabItemsData=tabItemsData;
        this.docInfo=docInfo;
    }

    getDocumentChange() {

        var banDoc=this.banDoc;
        var docInfo=this.docInfo;
        var jsonDoc={};
        var tabItemsData=this.tabItemsData;
        var tabMovementsData=this.tabMovementsData;
        var saleMovList=getValuesFromMovData(tabMovementsData,"Vendita"); //filtro la lista estrapolando solamente le operazioni di vendita 

        if(saleMovList && banDoc){
            //Creates the document change for the sale of shares
            jsonDoc = this.createSharesSaleOperations(saleMovList,tabItemsData,docInfo,banDoc);
        
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
     createSharesSaleOperations(movList,tabItemsData,docInfo,banDoc){

        var jsonDoc = this.initJsonDoc();
        var amountColumn=getAmountColumn(docInfo);
        var transList=getTransactionsTableData(banDoc,docInfo);
        var rows=[];

        //creates the operation for each (sale) movement in the import movements table
        for(var e in movList){

            var sharesData="";
            var avgCost="";
            var accountingCourse="";

            accountingCourse=getAccountingCourse(movList[e].itemId,tabItemsData,banDoc);// da vedere se filtrare con la data
            avgCost=getAverageCost(movList[e].itemId,transList);//ok
            sharesData=calculateShareSaleData(avgCost,movList[e],accountingCourse);//ok
            
            var amountColumn=getAmountColumn(docInfo);
            var itemAccount=getItemValue(tabItemsData,movList[e].itemId,"account");
            var accExchRes=getAccountsForExchangeResult(banDoc,docInfo);
            //Banana.console.debug(itemDescr);

            rows.push(this.createSharesSalesOpDocChange_sharesSale_bank(movList[e],amountColumn,docInfo));
            rows.push(this.createSharesSalesOpDocChange_shares(movList[e],sharesData,docInfo));
            rows.push(this.createSharesSalesOpDocChange_bankCharges(movList[e],amountColumn,docInfo));
            rows.push(this.createSharesSalesOpDocChange_profitOrLoss_sale(movList[e],sharesData,amountColumn,docInfo));
            rows.push(this.createSharesSalesOpDocChange_sharesSale_share(movList[e],sharesData,itemAccount,amountColumn,docInfo));
            if(movList[e].currency!=docInfo.baseCurrency)
                rows.push(this.createSharesSalesOpDocChange_profitOrLoss_exchange(movList[e],sharesData,itemAccount,docInfo,accExchRes));
        }

        
        var dataUnitFilePorperties = {};
        dataUnitFilePorperties.nameXml = "Transactions";
        dataUnitFilePorperties.data = {};
        dataUnitFilePorperties.data.rowLists = [];
        dataUnitFilePorperties.data.rowLists.push({ "rows": rows });

        jsonDoc.document.dataUnits.push(dataUnitFilePorperties);

        return jsonDoc;
    }

    createSharesSalesOpDocChange_sharesSale_bank(movRow,amountColumn,docInfo){

        var opAccount=movRow.account;
        var opDate=movRow.date;
        var opAmount=movRow.netAmount
        var opRate=movRow.exchangeRate;
        var opCurrency=movRow.currency;
        var opDescription="Shares "+movRow.description;

        var row={};

        row.fields={};
        row.fields.Date=opDate;
        row.fields.Description=opDescription;
        row.fields.AccountDebit=opAccount;

        row.fields[amountColumn]=opAmount;

        if(docInfo.isMultiCurrency){ 
            row.fields.ExchangeCurrency=opCurrency;
            row.fields.ExchangeRate=opRate;
        }
        row.operation={};
        row.operation.name="add";

        return row;
    }

    createSharesSalesOpDocChange_shares(movRow,sharesData,docInfo){

        var opDate=movRow.date; 
        var opItem=movRow.itemId;
        var opQuantity=movRow.quantity;
        var opPrice=sharesData.PricePerShare;
        var opDescription=movRow.description;
        var opCurrency=movRow.currency;
        var opRate=movRow.exchangeRate;

        var row={};

        row.fields={};
        row.fields.Date=opDate;
        row.fields.ItemsId=opItem;
        row.fields.Description=opDescription;
        row.fields.Quantity="-"+opQuantity;
        row.fields.UnitPrice=opPrice;
        //columns to add only if its a multicurrency accounting
        if(docInfo.isMultiCurrency){ 
            row.fields.ExchangeCurrency=opCurrency;
            row.fields.ExchangeRate=opRate;

        }


        row.operation={};
        row.operation.name="add";

        return row;;
    }

    createSharesSalesOpDocChange_bankCharges(movRow,amountColumn,docInfo){

        var opDescription=movRow.description+" Bank charges";
        var opDate=movRow.date;
        var opRate=movRow.exchangeRate;
        var opAccount="6900";
        var opCurrency=movRow.currency;
        var opAmount=movRow.bankCharges;

        var row={};

        row.fields={};
        row.fields.Date=opDate;
        row.fields.Description=opDescription;
        row.fields.AccountDebit=opAccount;
        row.fields[amountColumn]=opAmount;
        if(docInfo.isMultiCurrency){ 
            row.fields.ExchangeCurrency=opCurrency;
            row.fields.ExchangeRate=opRate;
        }

        row.operation={};
        row.operation.name="add";


        return row;
    }

    createSharesSalesOpDocChange_profitOrLoss_sale(movRow,sharesData,amountColumn,docInfo){

        // set the description based on the result
        var opProfitOnSale=sharesData.profitOnSale;
        var resultDescription=setOperationResultDecription(opProfitOnSale,"sale");
        var opDescription="Sale "+movRow.description+" "+resultDescription;
        //get the account based on the result
        var opAccount=getAccountForResult(opProfitOnSale);
        var opRate=movRow.exchangeRate;
        var opDate=movRow.date;
        var opCurrency=movRow.currency;
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
            row.fields.ExchangeCurrency=opCurrency;
            row.fields.ExchangeRate=opRate;
        }

        row.operation={};
        row.operation.name="add";

        return row;

    }

    createSharesSalesOpDocChange_sharesSale_share(movRow,sharesData,itemAccount,amountColumn,docInfo){

        var opAccount=itemAccount;
        var opDate=movRow.date;
        var opAmount=sharesData.avgShareValue;
        var opRate=movRow.exchangeRate;
        var opCurrency=movRow.currency;
        var opDescription="Sale Shares "+movRow.description;

        var row={};

        row.fields={};
        row.fields.Date=opDate;
        row.fields.Description=opDescription;
        row.fields.AccountCredit=opAccount;

        row.fields[amountColumn]=opAmount;

        if(docInfo.isMultiCurrency){ 
            row.fields.ExchangeCurrency=opCurrency;
            row.fields.ExchangeRate=opRate;
        }
        row.operation={};
        row.operation.name="add";

        return row;
    }

    createSharesSalesOpDocChange_profitOrLoss_exchange(movRow,sharesData,itemAccount,docInfo,accExchRes){
            // set the description based on the result
            var opProfitOnExchange=sharesData.profitOnExchange;
            var resultDescription=setOperationResultDecription(opProfitOnExchange,"exchange");
            var opDescription="Sale "+movRow.description+" "+resultDescription;
            //get the accounts based on the result
            var opDebitAccount=sharesData.profitOnExchange? itemAccount:accExchRes.loss;
            var opCreditAccount=sharesData.profitOnExchange? accExchRes.profit:itemAccount;
            var opCurrency=docInfo.baseCurrency;//this entry is always made in base currency
            var opDate=movRow.date;
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
                row.fields.ExchangeCurrency=opCurrency;
            }

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
    