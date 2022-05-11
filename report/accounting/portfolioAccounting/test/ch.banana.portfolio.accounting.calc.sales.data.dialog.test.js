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


// @id = ch.banana.portfolio.accounting.calc.sales.data.dialog.test
// @api = 1.0
// @pubdate = 2021-03-08
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.portfolio.accounting.calc.sales.data.dialog.test>
// @task = app.command
// @doctype = *.*
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @includejs = ../ch.banana.portfolio.accounting.calculation.methods.js
// @timeout = -1

// Register test case to be executed
Test.registerTestCase(new TestCalcSalesDialog());

// Here we define the class, the name of the class is not important
function TestCalcSalesDialog() {
}

// This method will be called at the beginning of the test case
TestCalcSalesDialog.prototype.initTestCase = function() {
   this.testLogger = Test.logger;
   this.progressBar = Banana.application.progressBar;
   this.fileNameList = [];

   this.fileNameList.push("file:script/../test/testcases/portfolio_accounting_double_entry_tutorial.ac2");
   this.fileNameList.push("file:script/../test/testcases/portfolio_accounting_double_entry_multi_currency_tutorial.ac2");
}

// This method will be called at the end of the test case
TestCalcSalesDialog.prototype.cleanupTestCase = function() {

}

// This method will be called before every test method is executed
TestCalcSalesDialog.prototype.init = function() {

}

// This method will be called after every test method is executed
TestCalcSalesDialog.prototype.cleanup = function() {

}

TestCalcSalesDialog.prototype.testDataStructure = function() {
    let parentLogger = this.testLogger;
   this.progressBar.start(this.fileNameList.length);
    for (var i = 0; i < this.fileNameList.length; i++) {

        let fileName = this.fileNameList[i];
        if (!this.progressBar.step())
            break;
        let banDoc=Banana.application.openDocument(fileName);
        this.testLogger = parentLogger.newLogger(Banana.IO.fileCompleteBaseName(fileName));
        if(banDoc){
            let docInfo=getDocumentInfo(banDoc);
            let params=getParams(i);
            let itemsData=getItemsTableData(banDoc,docInfo);
            let salesData=calculateShareSaleData(banDoc,docInfo,params,itemsData);
            let jsonName = "FILENAME: " + fileName;
            this.testLogger.addJson(jsonName,JSON.stringify(salesData));
        }else{
            this.testLogger.addFatalError("File not found: " + fileName);
        }
   }
}

/**
 * Params object should have the following properties:
 * .selectedItem--> item selected by the user
 * .quantity--> sale qt
 * .marketPrice-->currentPrice of the stock
 * .currExrate--> current exchange rate
 * @param {*} index 
 * @returns 
 */
function getParams(index){
    params={};
    if(index==0){
        params.selectedItem="CH003886335";
        params.quantity="20";
        params.marketPrice="12";
        params.currExRate="";
    }
    else if(index==1){
        params.selectedItem="IT0005239360";
        params.quantity="10";
        params.marketPrice="12";
        params.currExRate="1.12";
    }

    return params;
}