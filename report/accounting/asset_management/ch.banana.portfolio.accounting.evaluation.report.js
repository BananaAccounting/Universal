// Copyright [2021] [Banana.ch SA - Lugano Switzerland]
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
// @api = 1.0
// @id = ch.banana.portfolio.accounting.evaluation.report
// @description = Evaluation of Portfolio
// @task = app.command
// @doctype = 100.*
// @publisher = Banana.ch SA
// @pubdate = 2021-04-14
// @inputdatasource = none
// @timeout = -1
// @includejs = ch.banana.portfolio.accounting.calculation.methods.js

/**
 * 
 * This report is currently available only for base accounting, without other currencies.
 */


function addTableBaSAppraisal(report) {
    let current_date=new Date()
    current_date=Banana.Converter.toInternalDateFormat(current_date);
    var table_bas_appraisal = report.addTable('table_bas_appraisal');
    table_bas_appraisal.setStyleAttributes("width:100%;");
    table_bas_appraisal.getCaption().addText(qsTr("Appraisal Report \n Holdings as of: "+current_date), "styleTitles");
    var tableHeader = table_bas_appraisal.getHeader();
    var tableRow = tableHeader.addRow();
    tableRow.addCell("Type/Security", "styleTablesHeaderText");
    tableRow.addCell("Quantity", "styleTablesHeaderText");
    tableRow.addCell("Unit Cost", "styleTablesHeaderText");
    tableRow.addCell("Total Cost", "styleTablesHeaderText");
    tableRow.addCell("Market Price ", "styleTablesHeaderText");
    tableRow.addCell("Market Value", "styleTablesHeaderText");
    tableRow.addCell("% of Port", "styleTablesHeaderText");
    tableRow.addCell("Un. Gain or Loss", "styleTablesHeaderText");
    tableRow.addCell("% G/L", "styleTablesHeaderText");
    return table_bas_appraisal;
}

function addTableBaSTransactionsDetails(report) {
    let current_date=new Date()
    current_date=Banana.Converter.toInternalDateFormat(current_date);
    var table_bas_transactions_details = report.addTable('table_bas_transactions_details');
    table_bas_transactions_details.setStyleAttributes("width:100%;");
    table_bas_transactions_details.getCaption().addText(qsTr("Portfolio Transactions \n Transactions as of: "+current_date), "styleTitles");
    var tableHeader = table_bas_transactions_details.getHeader();
    var tableRow = tableHeader.addRow();
    tableRow.addCell("Date", "styleTablesHeaderText");
    tableRow.addCell("Type", "styleTablesHeaderText");
    tableRow.addCell("Description", "styleTablesHeaderText");
    tableRow.addCell("Debit", "styleTablesHeaderText");
    tableRow.addCell("Credit", "styleTablesHeaderText");
    tableRow.addCell("Quantity", "styleTablesHeaderText");
    tableRow.addCell("Qt.Balance", "styleTablesHeaderText");
    tableRow.addCell("Unit/Price", "styleTablesHeaderText");
    tableRow.addCell("Amount", "styleTablesHeaderText");
    return table_bas_transactions_details;
}

function printReport(banDoc,docInfo){

    //creates a new report
    var report = Banana.Report.newReport("Portfolio Evaluation Report");
    let appraisalData={};
    //get the data list
    let appraisalDataList=getAppraisalData(banDoc,docInfo);
    Banana.Ui.showText(JSON.stringify(appraisalDataList));

    //add item card table
    var appraisalTable = addTableBaSAppraisal(report);

    //Print the data.
    for(var key in appraisalDataList.secType){
        let secType=appraisalDataList.secType[key];
        var tableRow = appraisalTable.addRow(rowStyle);
        tableRow.addCell(secType.type, '');//TESTARE SE DA QUA FUNZIONAA IL REPORT
    
    }

    return report;

}

function getQtStyle(qt){
    var style="";
    var sign=Banana.SDecimal.sign(qt);

    if(sign==-1)
        style='styleNegativeAmount';
    else
        style='styleTablesBasResults';

    return style;
}

function setSortedColumnStyle(value){
    var savedParam = Banana.document.getScriptSettings();
    var userParam="";
    if (savedParam.length > 0) {
        userParam = JSON.parse(savedParam);
    }
    if(userParam){
        var style="";
        if(userParam===value){
            style="styleSortedByColumn";
            return style;
        }else{
            style="styleTablesBasResults";
            return style;
        }
    }else
        return 'styleTablesBasResults';
}

function setNegativeStyle(value,isTotal){
    var style="";
    var sign=Banana.SDecimal.sign(value);
    var normal_style="";
    var negative_style="";

    if(isTotal){
        normal_style="styleTablesBasResults_totals";
        negative_style="styleTotalNegativeAmount";
    }else{
        normal_style="styleTablesBasResults";
        negative_style="styleNegativeAmount";
    }

    if(sign==-1){
        style=negative_style;
    }else{
        style=normal_style;
    }

    return style;
}


function getAppraisalData(banDoc,docInfo) {
    let appraisalData={};

    let itemsData=getItemsTableData(banDoc,docInfo);
    let secTypesList=getSecurityTypesList(itemsData);//list of groups into which the titles in the items table are grouped
    
    let d=new Date();//save the current date
    appraisalData.date=d.getDate();
    appraisalData.secType=getAppraisalDataList(banDoc,docInfo,secTypesList,itemsData);

    return appraisalData;

}

function getAppraisalDataList(banDoc,docInfo,secTypesList,itemsData){

    let appraisalDataList=[];
    let journal = banDoc.journal(banDoc.ORIGINTYPE_CURRENT, banDoc.ACCOUNTTYPE_NONE);
    let journalData=getJournalData(docInfo,journal);

    //For each group I create an object that will contain the movements of the titles concerning the group
    for(var i=0;i<secTypesList.length;i++){
        secType={};
        secType.type=secTypesList[i];
        secType.data=getAppraisalDataList_transactions(banDoc,docInfo,itemsData,journalData,secTypesList[i]);
        //calculate portfolio percentage for each transactions and then totals for each type
        calculatePortfolioPercentage(secType.data);
        calculateTotals(secType.data);  //RIPRENDERE DA QUIIII, NON VENGONO INSERITE LE PROPRIETÀ.
        if(secType){
            appraisalDataList.push(secType);
        }
    }
    
    return appraisalDataList;
}

function getAppraisalDataList_transactions(banDoc,docInfo,itemsData,journalData,sumInName){
    let appraisalDataListTrans=[];
    for(var key in itemsData){
        if(itemsData[key].sumIn===sumInName){
            itemAccount=getItemValue(itemsData,itemsData[key].item,"account");//get the account of the item
            accountCard=banDoc.currentCard(itemAccount);
            let accountCardData=getAccountCardData(docInfo,itemsData[key].item,accountCard);
            let appraisalData={};
            appraisalData.item=itemsData[key].item;
            appraisalData.currentQt=itemsData[key].currentQt;
            //get the average cost
            appraisalData.avgCost="";
            let itemCardData=getItemCardDataList(accountCardData,journalData);
            if(itemCardData.length>=1){
                appraisalData.avgCost=itemCardData.slice(-1)[0].accAvgCost;
            }
            appraisalData.totalCost=Banana.SDecimal.multiply(appraisalData.currentQt,appraisalData.avgCost);
            appraisalData.marketPrice=itemsData[key].unitPriceCurrent;
            appraisalData.marketValue=Banana.SDecimal.multiply(appraisalData.currentQt,appraisalData.marketPrice);
            appraisalData.unGainLoss=Banana.SDecimal.subtract(appraisalData.marketValue,appraisalData.totalCost);
            appraisalData.percGL=getGLPerc(appraisalData.marketValue,appraisalData.totalCost);

            if(appraisalData){
                appraisalDataListTrans.push(appraisalData);
            }
        }
    }
    return appraisalDataListTrans;
}

function getSecurityTypesList(itemsData){
    let secTypesList=new Set();
    for(var key in itemsData){
        if(itemsData[key].sumIn){
            secTypesList.add(itemsData[key].sumIn);
        }
    }
    let secTypesList_array=Array.from(secTypesList); //convert the set into an array.
    
    return secTypesList_array;

}

function getGLPerc(marketValue,totalCost){
    let percGL = Banana.SDecimal.subtract(marketValue, totalCost);
    percGL = Banana.SDecimal.divide(percGL, marketValue);
    percGL = Banana.SDecimal.multiply(percGL, 100);

    return percGL;
}

function calculatePortfolioPercentage(appraisalDataList){
    let portfolioTotalAmount=getPortfolioSum(appraisalDataList);

    for(var key in appraisalDataList){
        let temp=Banana.SDecimal.divide(appraisalDataList[key].marketValue,portfolioTotalAmount);
        appraisalDataList[key].percOfPort=Banana.SDecimal.multiply(temp,100);
    }

    return appraisalDataList;

}

/**
 * Get the total of an array by making the sum of all the market value amounts
 * @param {*} appraisalDataList 
 * @returns 
 */
function getPortfolioSum(appraisalDataList){
    let portSum="";

//sum the elements mapped in the new array items and returns the value.
    portSum=appraisalDataList.map(item=>parseInt(item.marketValue)).reduce((prev,curr)=>prev+curr,0);

    return portSum;

}

function calculateTotals(appraisalDataList){
    appraisalDataList.totalCostSum="";
    appraisalDataList.marketValueSum="";
    appraisalDataList.percOfPortSum="";
    appraisalDataList.unGainLossSum="";
    appraisalDataList.percGLSum="";

    //get the sums
    let totalCostSum=appraisalDataList.map(item=>parseFloat(item.totalCost)).reduce((prev,curr)=>prev+curr,0);
    let marketValueSum=appraisalDataList.map(item=>parseFloat(item.marketValue)).reduce((prev,curr)=>prev+curr,0);
    let percOfPortSum=appraisalDataList.map(item=>parseFloat(item.percOfPort)).reduce((prev,curr)=>prev+curr,0);
    let unGainLossSum=appraisalDataList.map(item=>parseFloat(item.unGainLoss)).reduce((prev,curr)=>prev+curr,0);
    let percGLSum=appraisalDataList.map(item=>parseFloat(item.percGL)).reduce((prev,curr)=>prev+curr,0);

    //reset values to string and save values as ohbect properties.
    appraisalDataList.totalCostSum=totalCostSum.toString();
    appraisalDataList.marketValueSum=marketValueSum.toString();
    appraisalDataList.percOfPortSum=percOfPortSum.toString();
    appraisalDataList.unGainLossSum=unGainLossSum.toString();
    appraisalDataList.percGLSum=percGLSum.toString();


    return appraisalDataList;
}



/**
 *  Create the parameters of the settings dialog
 */
function convertParam(userParam) {

    var convertedParam = {};
    convertedParam.version = '1.0';
    /* array of script's parameters */
    convertedParam.data = [];

    var currentParam = {};
    currentParam.name = 'sort_items_by';
    currentParam.title = 'Sort Holdings by';
    currentParam.type = 'combobox';
    currentParam.items = ['Market Value','Percentage of Portfolio','Quantity'];
    currentParam.value = userParam.sort_items_by ? userParam.sort_items_by : userParam.sort_items_by;
    currentParam.editable = true;
    currentParam.readValue = function() {
        userParam.sort_items_by = this.value;
    }
    convertedParam.data.push(currentParam);

    return convertedParam;

}
/**
 * this function sorts the items according to what the user has chosen in the dialog 
 * @param {*} a 
 * @param {*} b 
 * @returns items ordered 
 */
function compare(a,b){
    var savedParam = Banana.document.getScriptSettings();
    var userParam="";
    if (savedParam.length > 0) {
        userParam = JSON.parse(savedParam);
    }
    if(userParam){
        switch(userParam){
            case "Market Value":
                return b.market_value-a.market_value;
                break;
            case "Percentage of Portfolio":
                return b.perc_of_port-a.perc_of_port;
                break;
            case "Quantity":
                return b.quantity-a.quantity;
                break;
        }
    }
    else 
        return false;
}

function getComboBoxElement() {

    var market_value=qsTr("Market Value");
    var quantity=qsTr("Quantity");
    var perc_of_port=qsTr("Percentage of Portfolio");

    //The formeters of the period that we need

    var combobox_value = "";
    //Read script settings
    var data = Banana.document.getScriptSettings();

    //Check if there are previously saved settings and read them
    if (data.length > 0) {
        var readSettings = JSON.parse(data);
        //We check if "readSettings" is not null, then we fill the formeters with the values just read
        if (readSettings) {
            combobox_value = readSettings;
        }
    }
    //A dialog window is opened asking the user to insert the desired period. By default is the accounting period

    var selected_value = Banana.Ui.getItem("Sort by", "Choose a value", [market_value,quantity,perc_of_port], combobox_value, false);

    //We take the values entered by the user and save them as "new default" values.
    //This because the next time the script will be executed, the dialog window will contains the new values.
    if (selected_value) {
        combobox_value=selected_value;
        //Save script settings
        var valueToString = JSON.stringify(combobox_value);
        Banana.document.setScriptSettings(valueToString);
    } else {
        //User clicked cancel
        return;
    }
    return combobox_value;
}

function sumQt(cumulatedQuantity, quantity) {
    return Banana.SDecimal.add(quantity, cumulatedQuantity);
}

function exec(inData, options) {

    let banDoc=Banana.document;
    let docInfo=getDocumentInfo(banDoc);

    if (!Banana.document || docInfo.isMultiCurrency || !verifyBananaVersion())
        return "@Cancel";

    var comboboxForm = getComboBoxElement();
    if (!comboboxForm)
        return;

    var report = printReport(banDoc,docInfo);
    var stylesheet = getReportStyle();
    Banana.Report.preview(report, stylesheet);


}

/*example data structure
var appraisalData={
    "date":"date",
    "securityTypes":[
        {
            "Type":"Stocks",
            "data":[
                {
                "item":"IT0005239360",
                "Quantity Balance":"",
                "Current Avg cost":"",
                "Currency":"",
                "Total Cost":"",
                "MarketPrice":"",
                "MarketValue":"",
                "PercOfPort":"",
                "UnrealizedGainOrLoss":"",
                "PercGL":"",
                },
                {
                "item":"CH003886335",
                "Quantity Balance":"",
                "Current Avg cost":"",
                "Currency":"",
                "Total Cost":"",
                "MarketPrice":"",
                "MarketValue":"",
                "PercOfPort":"",
                "UnrealizedGainOrLoss":"",
                "PercGL":"",
                },
            ],
            "totalCost":"",
            "totalMarketValue":"",
            "totalPerOfPort":"",
            "totalUnGainOrLoss":"",
            "totalGl":"",
            
        },
        {
            "Type":"Bonds",
            "data":[
                {
                "item":"IT0005239360",
                "Quantity Balance":"",
                "Current Avg cost":"",
                "Currency":"",
                "Total Cost":"",
                "MarketPrice":"",
                "MarketValue":"",
                "PercOfPort":"",
                "UnrealizedGainOrLoss":"",
                "PercGL":"",
                },
                {
                "item":"CH003886335",
                "Quantity Balance":"",
                "Current Avg cost":"",
                "Currency":"",
                "Total Cost":"",
                "MarketPrice":"",
                "MarketValue":"",
                "PercOfPort":"",
                "UnrealizedGainOrLoss":"",
                "PercGL":"",
                },
            ],
            "totalCost":"",
            "totalMarketValue":"",
            "totalPerOfPort":"",
            "totalUnGainOrLoss":"",
            "totalGl":""
        }
    ]
}*/