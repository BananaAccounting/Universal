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
// @id = ch.banana.audit.settings
// @api = 1.0
// @pubdate = 2021-12-10
// @publisher = Banana.ch SA
// @description = Settings
// @task = app.command
// @doctype = *;*
// @docproperties =
// @outputformat = none
// @inputdatasource = none
// @timeout = -1

function initDialogParam() {

    //initialize the parameters for each section
    var dialogparam = {};
    dialogparam.generalLedger_xmlColumnsName = "";
    dialogparam.journal_xmlColumnsName = "";
    dialogparam.vatJournal_xmlColumnsName = "";
    dialogparam.trialBalance_xmlColumnsName = "";
    dialogparam.customersAndSuppliers_xmlColumnsName = "";

    return dialogparam;

}

function convertParam(userParam) {
    var convertedParam = {};
    var defaultParam = this.initDialogParam();
    convertedParam.version = '1.0';
    convertedParam.data = [];

    //create the General Ledger section
    var currentParam = {};
    currentParam.name = 'generalLedger';
    currentParam.title = "General Ledger";
    currentParam.editable = false;

    //create the Journal section
    var currentParam = {};
    currentParam.name = 'journal';
    currentParam.title = "Journal";
    currentParam.editable = false;

    //create the VAT Journal section
    var currentParam = {};
    currentParam.name = 'vatjournal';
    currentParam.title = "VAT Journal";
    currentParam.editable = false;

    //customers and suppliers
    var currentParam = {};
    currentParam.name = 'customersandsuppliers';
    currentParam.title = "Customer and Suppliers";
    currentParam.editable = false;

    //GENERAL LEDGER ADDTIONAL COLUMNS
    var currentParam = {};
    currentParam.name = 'generalLedger';
    currentParam.title = 'General Ledger';
    currentParam.type = 'string';
    currentParam.value = userParam.generalLedger_xmlColumnsName ? userParam.generalLedger_xmlColumnsName : '';
    currentParam.defaultvalue = defaultParam.generalLedger_xmlColumnsName;
    currentParam.tooltip = "indicates the xml name of the columns you want to add to this report"
    currentParam.parentObject = 'generalLedger';
    currentParam.readValue = function() {
        userParam.generalLedger_xmlColumnsName = this.value;
    }
    convertedParam.data.push(currentParam);

    //Journal additional columns
    var currentParam = {};
    currentParam.name = 'journal';
    currentParam.title = 'Journal';
    currentParam.type = 'string';
    currentParam.value = userParam.journal_xmlColumnsName ? userParam.journal_xmlColumnsName : '';
    currentParam.defaultvalue = defaultParam.journal_xmlColumnsName;
    currentParam.tooltip = "indicates the xml name of the columns you want to add to this report"
    currentParam.parentObject = 'journal';
    currentParam.readValue = function() {
        userParam.journal_xmlColumnsName = this.value;
    }
    convertedParam.data.push(currentParam);

    //VAT Journal additional columns
    var currentParam = {};
    currentParam.name = 'vatjournal';
    currentParam.title = "VAT Journal";
    currentParam.type = 'string';
    currentParam.value = userParam.vatJournal_xmlColumnsName ? userParam.vatJournal_xmlColumnsName : '';
    currentParam.defaultvalue = defaultParam.vatJournal_xmlColumnsName;
    currentParam.tooltip = "indicates the xml name of the columns you want to add to this report"
    currentParam.parentObject = 'vatjournal';
    currentParam.readValue = function() {
        userParam.vatJournal_xmlColumnsName = this.value;
    }
    convertedParam.data.push(currentParam);

    //Customers and Suppliers additional columns
    var currentParam = {};
    currentParam.name = 'customersandSuppliers';
    currentParam.title = "Customers and Suppliers";
    currentParam.type = 'string';
    currentParam.value = userParam.customersAndSuppliers_xmlColumnsName ? userParam.customersAndSuppliers_xmlColumnsName : '';
    currentParam.defaultvalue = defaultParam.customersAndSuppliers_xmlColumnsName;
    currentParam.tooltip = "indicates the xml name of the columns you want to add to this report"
    currentParam.parentObject = 'customersandsuppliers';
    currentParam.readValue = function() {
        userParam.customersAndSuppliers_xmlColumnsName = this.value;
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

    var dialogTitle = 'Additional Columns';
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