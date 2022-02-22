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
// @id = ch.banana.portfolio.accounting.conciliation.report.js
// @description = Conciliation
// @task = app.command
// @doctype = 100.*
// @publisher = Banana.ch SA
// @pubdate = 2021-04-14
// @inputdatasource = none
// @timeout = -1
// @includejs = ch.banana.portfolio.accounting.calculation.methods.js

/**
 * This extension generates a report that allows you to see the movements of bonds and stocks held in the accounts and details
 * acronym bas= bonds and stocks
 */

function exec(inData, options) {

    var banDoc=Banana.document;

    if (!banDoc)
    return "@Cancel";


    var docInfo="";
    var transactionsData="";
    var itemsData="";
    var conciliationData={};
    conciliationData.date=new Date();
    conciliationData.data=[];
    var userParamList=["1400","1401","1450"];
    var secAccountsDataList=[];
    var itemsDataList=[];

    banDoc=Banana.document;
    docInfo=getDocumentInfo(banDoc);
    transactionsData=getTransactionsTableData(banDoc,docInfo);
    itemsData=getItemsTableData(itemsData);


    //Get Secrurity account data
    secAccountsDataList=[]; //lista dei conti titoli, dovrà essere definita dall utente.
    secAccountsDataList=getSecurityAccountsData(banDoc,secAccountsList);
    //Get Items transactions data.
    itemsDataList=getItemsDataList(itemsData,transactionsData); //ritorna l'array di items.


    var report = portfolioManagement.printReport(transactionsRows);
    var stylesheet = portfolioManagement.getReportStyle();
    Banana.Report.preview(report, stylesheet);


}

//esempio struttura
var conciliationData={
    "date":"date",
    "data":[
        {
            "account":"1400",
            "opening":"0.00",
            "balance":"500.00",
            "items":[
                {
                    "item":"CH003886335",
                    "transactions":[
                        {
                        "description":"",
                        "quantity":"",
                        "price":"",
                        "amount":""
                        },
                        {
                        "description":"",
                        "quantity":"",
                        "price":"",
                        "amount":""
                        }
                    ]

                },
                {
                    "item":"CH012775214",
                    "transactions":[
                        {
                        "description":"",
                        "quantity":"",
                        "price":"",
                        "amount":""
                        }
                    ]

                }
            ]
        },
        {
            "account":"1401",
            "opening":"0.00",
            "balance":"200.00",
            "items":[
                {
                    "item":"IT0005239360",
                    "transactions":[
                        {
                        "description":"",
                        "quantity":"",
                        "price":"",
                        "amount":""
                        }
                    ]

                }
            ]
        }
    ]

}