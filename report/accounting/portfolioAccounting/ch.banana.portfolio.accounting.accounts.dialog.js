// Copyright [2024] [Banana.ch SA - Lugano Switzerland]
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
// @id = ch.banana.portfolio.accounting.accounts.dialog.js
// @api = 1.0
// @pubdate = 2024-11-14
// @publisher = Banana.ch SA
// @description = Account Settings
// @task = app.command
// @doctype = 100.*
// @timeout = -1
// @includejs = ch.banana.portfolio.accounting.calculation.methods.js
// @includejs = ch.banana.portfolio.accounting.errormessagges.handler.js

/*******************************************
 * 
 * Property editor dialog.
 * L'utente inserisce i conti che utilizza, che ci permettono poi nel report della scheda titolo, di calcolare
 * alcuni dei valori progressivi.
 * 
 *******************************************/


function exec() {
    let userParam = initDialogParams();
    let settingsId = "ch.banana.portfolio.accounting.accounts.dialog";
    let savedParam = Banana.document.getScriptSettings(settingsId);
    if (savedParam.length > 0) {
        userParam = JSON.parse(savedParam);
    }

    userParam = verifyParam(userParam);
    let dlgTitle = 'Account Settings';
    let convertedParam = convertParam(userParam);
    if (!Banana.Ui.openPropertyEditor(dlgTitle, convertedParam))
        return false;
    for (var i = 0; i < convertedParam.data.length; i++) {
        // Read values to dialogparam (through the readValue function)
        if (typeof (convertedParam.data[i].readValue) == "function")
            convertedParam.data[i].readValue();
    }

    var paramToString = JSON.stringify(userParam);
    Banana.document.setScriptSettings(settingsId, paramToString);
}

function initDialogParams() {
    let dialogParam = {};
    dialogParam.realizedGainAccount = "";
    dialogParam.unrealizedGainAccount = "";
    dialogParam.realizedLossAccount = "";
    dialogParam.unrealizedLossAccount = "";
    dialogParam.expensesAccount = "";
    dialogParam.commissionsAccount = "";
    return dialogParam;
}

function verifyParam(userParam) {
    if (!userParam)
        userParam = initDialogParams();
    return userParam;
}

function convertParam(userParam) {
    var convertedParam = {};
    convertedParam.version = '1.0';
    convertedParam.data = [];

    //Realized gain account.
    var currentParam = {};
    currentParam.name = 'realizedgainaccount';
    currentParam.title = "Realized gain";
    currentParam.type = 'string';
    currentParam.value = userParam.realizedGainAccount ? userParam.realizedGainAccount : '';
    currentParam.readValue = function () {
        userParam.realizedGainAccount = this.value;
    }
    convertedParam.data.push(currentParam);

    //Unrealized gain account.
    var currentParam = {};
    currentParam.name = 'unrealizedgainaccount';
    currentParam.title = "Unrealized gain";
    currentParam.type = 'string';
    currentParam.value = userParam.unrealizedGainAccount ? userParam.unrealizedGainAccount : '';
    currentParam.readValue = function () {
        userParam.unrealizedGainAccount = this.value;
    }
    convertedParam.data.push(currentParam);

    // Realized loss account.
    var currentParam = {};
    currentParam.name = 'realizedlossaccount';
    currentParam.title = "Realized loss";
    currentParam.type = 'string';
    currentParam.value = userParam.realizedLossAccount ? userParam.realizedLossAccount : '';
    currentParam.readValue = function () {
        userParam.realizedLossAccount = this.value;
    }
    convertedParam.data.push(currentParam);

    // Unrealized loss account.
    var currentParam = {};
    currentParam.name = 'unrealizedlossaccount';
    currentParam.title = "Unrealized loss";
    currentParam.type = 'string';
    currentParam.value = userParam.unrealizedLossAccount ? userParam.unrealizedLossAccount : '';
    currentParam.readValue = function () {
        userParam.unrealizedLossAccount = this.value;
    }
    convertedParam.data.push(currentParam);

    // Expenses account.
    var currentParam = {};
    currentParam.name = 'expensesaccount';
    currentParam.title = "Expenses";
    currentParam.type = 'string';
    currentParam.value = userParam.expensesAccount ? userParam.expensesAccount : '';
    currentParam.readValue = function () {
        userParam.expensesAccount = this.value;
    }
    convertedParam.data.push(currentParam);

    // Commissions account.
    var currentParam = {};
    currentParam.name = 'commissionsAccount';
    currentParam.title = "Commissions";
    currentParam.type = 'string';
    currentParam.value = userParam.commissionsAccount ? userParam.commissionsAccount : '';
    currentParam.readValue = function () {
        userParam.commissionsAccount = this.value;
    }
    convertedParam.data.push(currentParam);

    return convertedParam;
}