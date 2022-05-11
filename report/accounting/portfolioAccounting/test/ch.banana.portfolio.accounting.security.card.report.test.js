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


// @id = ch.banana.portfolio.accounting.security.card.report.test
// @api = 1.0
// @pubdate = 2021-03-08
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.portfolio.accounting.security.card.report.test>
// @task = app.command
// @doctype = *.*
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @includejs = ../ch.banana.portfolio.accounting.security.card.report.js
// @timeout = -1

// Register test case to be executed
Test.registerTestCase(new TestSecurityCardReport());

// Here we define the class, the name of the class is not important
function TestSecurityCardReport() {
}

// This method will be called at the beginning of the test case
TestSecurityCardReport.prototype.initTestCase = function() {
   this.testLogger = Test.logger;
   this.progressBar = Banana.application.progressBar;
   this.fileNameList = [];

   this.fileNameList.push("file:script/../test/testcases/portfolio_accounting_double_entry_tutorial.ac2");
   this.fileNameList.push("file:script/../test/testcases/portfolio_accounting_double_entry_multi_currency_tutorial.ac2");
}

// This method will be called at the end of the test case
TestSecurityCardReport.prototype.cleanupTestCase = function() {

}

// This method will be called before every test method is executed
TestSecurityCardReport.prototype.init = function() {

}

// This method will be called after every test method is executed
TestSecurityCardReport.prototype.cleanup = function() {

}

TestSecurityCardReport.prototype.testDataStructure = function() {
    let parentLogger = this.testLogger;
   this.progressBar.start(this.fileNameList.length);
    for (var i = 0; i < this.fileNameList.length; i++) {
        let fileName = this.fileNameList[i];
        if (!this.progressBar.step())
            break;
        let banDoc=Banana.application.openDocument(fileName);
        this.testLogger = parentLogger.newLogger(Banana.IO.fileCompleteBaseName(fileName));
        if(banDoc){
            let selectedItem=getItemForTest(i);
            let docInfo=getDocumentInfo(banDoc);
            let itemsData=getItemsTableData(banDoc,docInfo);
            let itemAccount=getItemValue(itemsData,selectedItem,"account");
            let itemCurrency=getItemCurrency(itemsData,selectedItem);
            let journal = banDoc.journal(banDoc.ORIGINTYPE_CURRENT, banDoc.ACCOUNTTYPE_NONE);
            let journalData=getJournalData(docInfo,journal);
            let accountCard=banDoc.currentCard(itemAccount);
            let accountCardData=getAccountCardData(docInfo,selectedItem,accountCard);
            let itemCardData=getItemCardData(docInfo,accountCardData,journalData,itemCurrency,selectedItem);
            let reportName = "FILENAME: " + fileName;
            let itemDescription=getItemValue(itemsData,selectedItem,"description");
            let report = printReport(docInfo,itemCardData,itemDescription);
            this.testLogger.addReport(reportName, report);
        }else{
            this.testLogger.addFatalError("File not found: " + fileName);
        }
   }
}

function getItemForTest(index){
    item="";
    if(index==0)
        item="CH003886335";
    else if(index==1)
        item="IT0005239360";

    return item;
}