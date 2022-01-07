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
// @id = ch.banana.securities.accounts.settings
// @api = 1.0
// @pubdate = 2021-12-10
// @publisher = Banana.ch SA
// @description = Securities accounts Settings
// @task = app.command
// @doctype = 100.*
// @docproperties =
// @outputformat = none
// @inputdatasource = none
// @timeout = -1

function initDialogParam() {

    //initialize the parameters for each section
    var dialogparam = {};

    dialogparam.bankCharges="";
    dialogparam.profitOnSecurieties="";
    dialogparam.lossOnSecurieties="";
    dialogparam.bondsInt="";
    dialogparam.bankAccount="";


    return dialogparam;

}

function verifyParam(userParam){

    //general ledger
    if (!userParam.bankCharges) {
        userParam.bankCharges = "";
    }

    if (!userParam.profitOnSecurieties) {
        userParam.profitOnSecurieties = "";
    }

    if(!userParam.lossOnSecurieties){
        userParam.lossOnSecurieties = "";
    }

    if (!userParam.bondsInt) {
        userParam.bondsInt = "";
    }

    if (!userParam.bankAccount) {
        userParam.bankAccount = "";
    }

    return userParam;
}

function convertParam(userParam) {
    var convertedParam = {};
    convertedParam.version = '1.0';
    convertedParam.data = [];

    //Bank account
    var currentParam = {};
    currentParam.name = 'bankaccount';
    currentParam.title = 'Bank Account';
    currentParam.type = 'string';
    currentParam.value = userParam.bankAccount ? userParam.bankAccount : '';
    currentParam.tooltip = "Enter the bank account number where revenues from sales of securities should be recorded"
    currentParam.readValue = function() {
        userParam.bankAccount = this.value;
    }
    convertedParam.data.push(currentParam);

    //bank charges
    var currentParam = {};
    currentParam.name = 'bankCharges';
    currentParam.title = 'Costs for bank interest';
    currentParam.type = 'string';
    currentParam.value = userParam.bankCharges ? userParam.bankCharges : '';
    currentParam.tooltip = "Enter the account number where Costs for bank interest be recorded"
    currentParam.readValue = function() {
        userParam.bankCharges = this.value;
    }
    convertedParam.data.push(currentParam);

    //Profit on securities
    var currentParam = {};
    currentParam.name = 'profitOnSecurieties';
    currentParam.title = 'Profit on securities';
    currentParam.type = 'string';
    currentParam.value = userParam.profitOnSecurieties ? userParam.profitOnSecurieties : '';
    currentParam.tooltip = "Enter the account number where Profit on securities be recorded"
    currentParam.readValue = function() {
        userParam.profitOnSecurieties = this.value;
    }
    convertedParam.data.push(currentParam);

    //Loss on securities
    var currentParam = {};
    currentParam.name = 'lossOnSecurieties';
    currentParam.title = 'Loss on securities';
    currentParam.type = 'string';
    currentParam.value = userParam.lossOnSecurieties ? userParam.lossOnSecurieties : '';
    currentParam.tooltip = "Enter the account number where Loss on securities be recorded"
    currentParam.readValue = function() {
        userParam.lossOnSecurieties = this.value;
    }
    convertedParam.data.push(currentParam);

    //Interest on bonds
    var currentParam = {};
    currentParam.name = 'interestonbonds';
    currentParam.title = 'Interest on bonds';
    currentParam.type = 'string';
    currentParam.value = userParam.bondsInt ? userParam.bondsInt : '';
    currentParam.tooltip = "Enter the account number where Interest on bonds be recorded"
    currentParam.readValue = function() {
        userParam.bondsInt = this.value;
    }
    convertedParam.data.push(currentParam);

    return convertedParam;
}

function settingsDialog() {

    var userParam = initDialogParam();
    var savedParam = Banana.document.getScriptSettings("ch.banana.securities.accounts.settings");
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
    Banana.document.setScriptSettings("ch.banana.securities.accounts.settings", paramToString);

    return true;
}

function exec() {
    if (!settingsDialog())
        return "@Cancel";
}