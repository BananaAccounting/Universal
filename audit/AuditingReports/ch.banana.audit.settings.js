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
// @id = ch.banana.audit.report
// @api = 1.0
// @pubdate = 2021-12-10
// @publisher = Banana.ch SA
// @description = Columns Settings
// @task = app.command
// @doctype = 100.*
// @docproperties =
// @outputformat = none
// @inputdatasource = none
// @timeout = -1

function initDialogParam() {

    //initialize the parameters for each section
    var dialogparam = {};

    //general ledger
    dialogparam.generalLedger={};
    dialogparam.generalLedger.xmlColumnsName = "";
    dialogparam.generalLedger.includeAccountsWithoutTr = false;

    //Journal
    dialogparam.journal={};
    dialogparam.journal.xmlColumnsName="";

    //VAT journal
    dialogparam.vatJournal={};
    dialogparam.vatJournal.xmlColumnsName = "";

    //Customers and Suppliers
    dialogparam.customersAndSuppliers={};
    dialogparam.customersAndSuppliers.xmlColumnsName = "";

    return dialogparam;

}

function verifyParam(userParam){

    //general ledger
    if (!userParam.generalLedger) {
        userParam.generalLedger={};
        userParam.generalLedger.xmlColumnsName = "";
    }

    if (!userParam.journal) {
        userParam.journal={};
        userParam.journal.xmlColumnsName = "";
    }

    if(!userParam.vatJournal){
        userParam.vatJournal={};
        userParam.vatJournal.xmlColumnsName = "";
    }

    if (!userParam.customersAndSuppliers) {
        userParam.customersAndSuppliers={};
        userParam.customersAndSuppliers.xmlColumnsName = "";
    }

    return userParam;
}

function convertParam(userParam) {
    var convertedParam = {};
    convertedParam.version = '1.0';
    convertedParam.data = [];

    //create the General Ledger section
    var currentParam = {};
    currentParam.name = 'generalLedger';
    currentParam.title = "General Ledger";
    currentParam.editable = false;

    convertedParam.data.push(currentParam);

    //create the Journal section
    var currentParam = {};
    currentParam.name = 'journal';
    currentParam.title = "Journal";
    currentParam.editable = false;

    convertedParam.data.push(currentParam);

    //create the VAT Journal section
    var currentParam = {};
    currentParam.name = 'vatjournal';
    currentParam.title = "VAT Journal";
    currentParam.editable = false;

    convertedParam.data.push(currentParam);

    //customers and suppliers
    var currentParam = {};
    currentParam.name = 'customersandsuppliers';
    currentParam.title = "Customer and Suppliers";
    currentParam.editable = false;

    convertedParam.data.push(currentParam);

    //GENERAL LEDGER

    //Additional Columns
    var currentParam = {};
    currentParam.name = 'additionalcolumns';
    currentParam.title = 'Additional Columns';
    currentParam.type = 'string';
    currentParam.value = userParam.generalLedger.xmlColumnsName ? userParam.generalLedger.xmlColumnsName : '';
    currentParam.tooltip = "indicates the xml name of the columns you want to add"
    currentParam.parentObject = 'generalLedger';
    currentParam.readValue = function() {
        userParam.generalLedger.xmlColumnsName = this.value;
    }
    convertedParam.data.push(currentParam);

    //Include accounts without transactions
    var currentParam = {};
    currentParam.name = 'accountswithouttransactions';
    currentParam.title = 'Include accounts without transactions';
    currentParam.type = 'bool';
    currentParam.value = userParam.generalLedger.includeAccountsWithoutTr ? userParam.generalLedger.includeAccountsWithoutTr : userParam.generalLedger.includeAccountsWithoutTr;
    currentParam.tooltip = "Check to include accounts without transactions"
    currentParam.parentObject = 'generalLedger';
    currentParam.readValue = function() {
        userParam.generalLedger.includeAccountsWithoutTr = this.value;
    }
    convertedParam.data.push(currentParam);

    //JOURNAL

    //Journal additional columns
    var currentParam = {};
    currentParam.name = 'journal';
    currentParam.title = 'Additional Columns';
    currentParam.type = 'string';
    currentParam.value = userParam.journal.xmlColumnsName ? userParam.journal.xmlColumnsName : '';
    currentParam.tooltip = "indicates the xml name of the columns you want to add"
    currentParam.parentObject = 'journal';
    currentParam.readValue = function() {
        userParam.journal.xmlColumnsName = this.value;
    }
    convertedParam.data.push(currentParam);

    //VAT JOURNAL

    //VAT Journal additional
    var currentParam = {};
    currentParam.name = 'vatjournal';
    currentParam.title = "Additional Columns";
    currentParam.type = 'string';
    currentParam.value = userParam.vatJournal.xmlColumnsName ? userParam.vatJournal.xmlColumnsName : '';
    currentParam.tooltip = "indicates the xml name of the columns you want to add"
    currentParam.parentObject = 'vatjournal';
    currentParam.readValue = function() {
        userParam.vatJournal.xmlColumnsName = this.value;
    }
    convertedParam.data.push(currentParam);

    //CUSTOMERS AND SUPPLIERS

    //Customers and Suppliers additional columns
    var currentParam = {};
    currentParam.name = 'customersandSuppliers';
    currentParam.title = "Additional Columns";
    currentParam.type = 'string';
    currentParam.value = userParam.customersAndSuppliers.xmlColumnsName ? userParam.customersAndSuppliers.xmlColumnsName : '';
    currentParam.tooltip = "indicates the xml name of the columns you want to add"
    currentParam.parentObject = 'customersandsuppliers';
    currentParam.readValue = function() {
        userParam.customersAndSuppliers.xmlColumnsName = this.value;
    }
    convertedParam.data.push(currentParam);

    return convertedParam;
}

function settingsDialog() {

    var userParam = initDialogParam();
    var savedParam = Banana.document.getScriptSettings("ch.banana.audit.settings");
    if (savedParam.length > 0) {
        userParam = JSON.parse(savedParam);
    }

    userParam=verifyParam(userParam);
    var dialogTitle = 'Settings';
    var convertedParam = convertParam(userParam);
    if (!Banana.Ui.openPropertyEditor(dialogTitle, convertedParam))
        return false;
    for (var i = 0; i < convertedParam.data.length; i++) {
        // Read values to dialogparam (through the readValue function)
        if (typeof(convertedParam.data[i].readValue) == "function")
            convertedParam.data[i].readValue();
    }

    var paramToString = JSON.stringify(userParam);
    Banana.document.setScriptSettings("ch.banana.audit.settings", paramToString);

    return true;
}

function exec() {
    if (!settingsDialog())
        return "@Cancel";
}