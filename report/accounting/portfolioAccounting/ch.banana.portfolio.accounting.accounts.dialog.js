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
    userParam = getFormattedSavedParams(settingsId);
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

    // Balance Accounts
    dialogParam.balanceAccounts = {};
    dialogParam.balanceAccounts.investmentsAccount = "";
    dialogParam.balanceAccounts.assetsAccount = "";
    dialogParam.balanceAccounts.liabilitiesAccount = "";

    // Value Changing Contra Accounts
    dialogParam.valueChangingcontraAccounts = {};
    dialogParam.valueChangingcontraAccounts.realizedGainAccount = "";
    dialogParam.valueChangingcontraAccounts.unrealizedGainAccount = "";
    dialogParam.valueChangingcontraAccounts.realizedLossAccount = "";
    dialogParam.valueChangingcontraAccounts.unrealizedLossAccount = "";
    dialogParam.valueChangingcontraAccounts.realizedExRateGainAccount = "";
    dialogParam.valueChangingcontraAccounts.realizedExRateLossAccount = "";
    dialogParam.valueChangingcontraAccounts.unrealizedExRateGainAccount = "";
    dialogParam.valueChangingcontraAccounts.unrealizedExRateLossAccount = "";
    dialogParam.valueChangingcontraAccounts.depreciationsAccount = "";
    dialogParam.valueChangingcontraAccounts.otherValueChangingCostsAccount = "";
    dialogParam.valueChangingcontraAccounts.otherValueChangingIncomeAccount = "";
    dialogParam.valueChangingcontraAccounts.roundingDiffrencesAccount = "";

    // Profit and loss Accounts (wuth Item id but not a Balance account)
    dialogParam.profitAndLossAccounts = {};
    dialogParam.profitAndLossAccounts.chargesAccount = "";
    dialogParam.profitAndLossAccounts.commissionsAccount = "";
    dialogParam.profitAndLossAccounts.interestEarnedAccount = "";
    dialogParam.profitAndLossAccounts.interestPayedAccount = "";
    dialogParam.profitAndLossAccounts.dividendIncomeAccount = "";
    dialogParam.profitAndLossAccounts.otherIncomeAccount = "";
    dialogParam.profitAndLossAccounts.otherCostsAccount = "";

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

    //create the Balance accounts section
    var currentParam = {};
    currentParam.name = 'balanceaccounts';
    currentParam.title = "Balance Accounts";
    currentParam.editable = false;

    convertedParam.data.push(currentParam);

    //create the Value changing accounts section
    var currentParam = {};
    currentParam.name = 'valuechangingaccounts';
    currentParam.title = "Value Changing Accounts";
    currentParam.editable = false;

    convertedParam.data.push(currentParam);

    //create the Profit and loss accounts section
    var currentParam = {};
    currentParam.name = 'profitandlossaccounts';
    currentParam.title = "Profit and Loss Accounts";
    currentParam.editable = false;

    convertedParam.data.push(currentParam);

    // Balance accounts elements

    //InvestmentsAccount 
    var currentParam = {};
    currentParam.name = 'investmentsaccount';
    currentParam.title = "Investments";
    currentParam.type = 'string';
    currentParam.value = userParam.balanceAccounts.investmentsAccount ? userParam.balanceAccounts.investmentsAccount : '';
    currentParam.parentObject = 'balanceaccounts';
    currentParam.readValue = function () {
        userParam.balanceAccounts.investmentsAccount = this.value;
    }
    convertedParam.data.push(currentParam);

    // Assests
    var currentParam = {};
    currentParam.name = 'assetssccount';
    currentParam.title = "Assets";
    currentParam.type = 'string';
    currentParam.value = userParam.balanceAccounts.assetsAccount ? userParam.balanceAccounts.assetsAccount : '';
    currentParam.parentObject = 'balanceaccounts';
    currentParam.readValue = function () {
        userParam.balanceAccounts.assetsAccount = this.value;
    }
    convertedParam.data.push(currentParam);

    // Liabilities
    var currentParam = {};
    currentParam.name = 'liabilitiesaccount';
    currentParam.title = "Liabilities";
    currentParam.type = 'string';
    currentParam.value = userParam.balanceAccounts.liabilitiesAccount ? userParam.balanceAccounts.liabilitiesAccount : '';
    currentParam.parentObject = 'balanceaccounts';
    currentParam.readValue = function () {
        userParam.balanceAccounts.liabilitiesAccount = this.value;
    }
    convertedParam.data.push(currentParam);

    // Value changing Contra Accounts

    //Realized gain account.
    var currentParam = {};
    currentParam.name = 'realizedgainaccount';
    currentParam.title = "Realized gain";
    currentParam.type = 'string';
    currentParam.value = userParam.valueChangingcontraAccounts.realizedGainAccount ? userParam.valueChangingcontraAccounts.realizedGainAccount : '';
    currentParam.parentObject = 'valuechangingaccounts';
    currentParam.readValue = function () {
        userParam.valueChangingcontraAccounts.realizedGainAccount = this.value;
    }
    convertedParam.data.push(currentParam);

    //Unrealized gain account.
    var currentParam = {};
    currentParam.name = 'unrealizedgainaccount';
    currentParam.title = "Unrealized gain";
    currentParam.type = 'string';
    currentParam.value = userParam.valueChangingcontraAccounts.unrealizedGainAccount ? userParam.valueChangingcontraAccounts.unrealizedGainAccount : '';
    currentParam.parentObject = 'valuechangingaccounts';
    currentParam.readValue = function () {
        userParam.valueChangingcontraAccounts.unrealizedGainAccount = this.value;
    }
    convertedParam.data.push(currentParam);

    // Realized loss account.
    var currentParam = {};
    currentParam.name = 'realizedlossaccount';
    currentParam.title = "Realized loss";
    currentParam.type = 'string';
    currentParam.value = userParam.valueChangingcontraAccounts.realizedLossAccount ? userParam.valueChangingcontraAccounts.realizedLossAccount : '';
    currentParam.parentObject = 'valuechangingaccounts';
    currentParam.readValue = function () {
        userParam.realizedLossAccount = this.value;
    }
    convertedParam.data.push(currentParam);

    // Unrealized loss account.
    var currentParam = {};
    currentParam.name = 'unrealizedlossaccount';
    currentParam.title = "Unrealized loss";
    currentParam.type = 'string';
    currentParam.value = userParam.valueChangingcontraAccounts.unrealizedLossAccount ? userParam.valueChangingcontraAccounts.unrealizedLossAccount : '';
    currentParam.parentObject = 'valuechangingaccounts';
    currentParam.readValue = function () {
        userParam.valueChangingcontraAccounts.unrealizedLossAccount = this.value;
    }
    convertedParam.data.push(currentParam);

    // Realized exchange rate gain account.
    var currentParam = {};
    currentParam.name = 'realizedexrategainaccount';
    currentParam.title = "Realized Exchange Rate Gain";
    currentParam.type = 'string';
    currentParam.value = userParam.valueChangingcontraAccounts.realizedExRateGainAccount ? userParam.valueChangingcontraAccounts.realizedExRateGainAccount : '';
    currentParam.parentObject = 'valuechangingaccounts';
    currentParam.readValue = function () {
        userParam.valueChangingcontraAccounts.realizedExRateGainAccount = this.value;
    }
    convertedParam.data.push(currentParam);

    // Realized exchange rate loss account.
    var currentParam = {};
    currentParam.name = 'realizedexratelossaccount';
    currentParam.title = "Realized Exchange Rate Loss";
    currentParam.type = 'string';
    currentParam.value = userParam.valueChangingcontraAccounts.realizedExRateLossAccount ? userParam.valueChangingcontraAccounts.realizedExRateLossAccount : '';
    currentParam.parentObject = 'valuechangingaccounts';
    currentParam.readValue = function () {
        userParam.valueChangingcontraAccounts.realizedExRateLossAccount = this.value;
    }
    convertedParam.data.push(currentParam);

    // Unrealized exchange rate gain account.
    var currentParam = {};
    currentParam.name = 'unrealizedexrategainaccount';
    currentParam.title = "Unrealized Exchange Rate Gain";
    currentParam.type = 'string';
    currentParam.value = userParam.valueChangingcontraAccounts.unrealizedExRateGainAccount ? userParam.valueChangingcontraAccounts.unrealizedExRateGainAccount : '';
    currentParam.parentObject = 'valuechangingaccounts';
    currentParam.readValue = function () {
        userParam.valueChangingcontraAccounts.unrealizedExRateGainAccount = this.value;
    }
    convertedParam.data.push(currentParam);

    // Unrealized exchange rate loss account.
    var currentParam = {};
    currentParam.name = 'unrealizedexratelossaccount';
    currentParam.title = "Unrealized Exchange Rate Loss";
    currentParam.type = 'string';
    currentParam.value = userParam.valueChangingcontraAccounts.unrealizedExRateGainAccount ? userParam.valueChangingcontraAccounts.unrealizedExRateGainAccount : '';
    currentParam.parentObject = 'valuechangingaccounts';
    currentParam.readValue = function () {
        userParam.valueChangingcontraAccounts.unrealizedExRateGainAccount = this.value;
    }
    convertedParam.data.push(currentParam);

    // Depreciations account.
    var currentParam = {};
    currentParam.name = 'depreciationsaccount';
    currentParam.title = "Depreciations";
    currentParam.type = 'string';
    currentParam.value = userParam.valueChangingcontraAccounts.depreciationsAccount ? userParam.valueChangingcontraAccounts.depreciationsAccount : '';
    currentParam.parentObject = 'valuechangingaccounts';
    currentParam.readValue = function () {
        userParam.valueChangingcontraAccounts.depreciationsAccount = this.value;
    }
    convertedParam.data.push(currentParam);

    // Other Value Changing Costs account
    var currentParam = {};
    currentParam.name = 'othervaluechangingcostsaccount';
    currentParam.title = "Other Value Changing Costs";
    currentParam.type = 'string';
    currentParam.value = userParam.valueChangingcontraAccounts.otherValueChangingCostsAccount ? userParam.valueChangingcontraAccounts.otherValueChangingCostsAccount : '';
    currentParam.parentObject = 'valuechangingaccounts';
    currentParam.readValue = function () {
        userParam.valueChangingcontraAccounts.otherValueChangingCostsAccount = this.value;
    }
    convertedParam.data.push(currentParam);

    // Other Value Changing Income account
    var currentParam = {};
    currentParam.name = 'othervaluechangingincomeaccount';
    currentParam.title = "Other Value Changing Income";
    currentParam.type = 'string';
    currentParam.value = userParam.valueChangingcontraAccounts.otherValueChangingIncomeAccount ? userParam.valueChangingcontraAccounts.otherValueChangingIncomeAccount : '';
    currentParam.parentObject = 'valuechangingaccounts';
    currentParam.readValue = function () {
        userParam.valueChangingcontraAccounts.otherValueChangingIncomeAccount = this.value;
    }
    convertedParam.data.push(currentParam);

    // Rounding Diffrerences account
    var currentParam = {};
    currentParam.name = 'othervaluechangingincomeaccount';
    currentParam.title = "Rounding Diffrerences";
    currentParam.type = 'string';
    currentParam.value = userParam.valueChangingcontraAccounts.roundingDiffrencesAccount ? userParam.valueChangingcontraAccounts.roundingDiffrencesAccount : '';
    currentParam.parentObject = 'valuechangingaccounts';
    currentParam.readValue = function () {
        userParam.valueChangingcontraAccounts.roundingDiffrencesAccount = this.value;
    }
    convertedParam.data.push(currentParam);


    // Profit and loss accounts section

    // Charges account.
    var currentParam = {};
    currentParam.name = 'chargesaccount';
    currentParam.title = "Charges";
    currentParam.type = 'string';
    currentParam.value = userParam.chargesAccount ? userParam.chargesAccount : '';
    currentParam.parentObject = 'profitandlossaccounts';
    currentParam.readValue = function () {
        userParam.chargesAccount = this.value;
    }
    convertedParam.data.push(currentParam);

    // Commissions account.
    var currentParam = {};
    currentParam.name = 'commissionsAccount';
    currentParam.title = "Commissions";
    currentParam.type = 'string';
    currentParam.value = userParam.commissionsAccount ? userParam.commissionsAccount : '';
    currentParam.parentObject = 'profitandlossaccounts';
    currentParam.readValue = function () {
        userParam.commissionsAccount = this.value;
    }
    convertedParam.data.push(currentParam);

    // Interest earned account.
    var currentParam = {};
    currentParam.name = 'interestearnedaccount';
    currentParam.title = "Interest earned";
    currentParam.type = 'string';
    currentParam.value = userParam.interestEarnedAccount ? userParam.interestEarnedAccount : '';
    currentParam.parentObject = 'profitandlossaccounts';
    currentParam.readValue = function () {
        userParam.interestEarnedAccount = this.value;
    }
    convertedParam.data.push(currentParam);

    // Interest payed account.
    var currentParam = {};
    currentParam.name = 'interestpayedaccount';
    currentParam.title = "Interest payed";
    currentParam.type = 'string';
    currentParam.value = userParam.interestPayedAccount ? userParam.interestPayedAccount : '';
    currentParam.parentObject = 'profitandlossaccounts';
    currentParam.readValue = function () {
        userParam.interestPayedAccount = this.value;
    }
    convertedParam.data.push(currentParam);

    // Dividend income account.
    var currentParam = {};
    currentParam.name = 'dividendincomeaccount';
    currentParam.title = "Dividends income";
    currentParam.type = 'string';
    currentParam.value = userParam.dividendIncomeAccount ? userParam.dividendIncomeAccount : '';
    currentParam.parentObject = 'profitandlossaccounts';
    currentParam.readValue = function () {
        userParam.dividendIncomeAccount = this.value;
    }
    convertedParam.data.push(currentParam);

    // Other Income account.
    var currentParam = {};
    currentParam.name = 'otherincomeaccount';
    currentParam.title = "Other Income";
    currentParam.type = 'string';
    currentParam.value = userParam.otherIncomeAccount ? userParam.otherIncomeAccount : '';
    currentParam.parentObject = 'profitandlossaccounts';
    currentParam.readValue = function () {
        userParam.otherIncomeAccount = this.value;
    }
    convertedParam.data.push(currentParam);

    // Other Costs account.
    var currentParam = {};
    currentParam.name = 'othercostsaccount';
    currentParam.title = "Other Costs";
    currentParam.type = 'string';
    currentParam.value = userParam.otherCostsAccount ? userParam.otherCostsAccount : '';
    currentParam.parentObject = 'profitandlossaccounts';
    currentParam.readValue = function () {
        userParam.otherCostsAccount = this.value;
    }
    convertedParam.data.push(currentParam);

    return convertedParam;
}

function validateParams(params) {

    let texts = getTexts();
    let paramsOk = true;
    const data = params.data;
    const accountsTable = Banana.document.table("Accounts");
    if (!accountsTable)
        return paramsOk;

    data.forEach(item => {
        if (["balanceaccounts", "valuechangingaccounts", "profitandlossaccounts"].includes(item.parentObject)) {
            if (!accountExists(accountsTable, item.value)) {
                item.errorMsg = texts.nonExistentAccount.replace("%1", item.value);
                paramsOk = false;
            }
        }
    });

    return paramsOk;
}

function accountExists(accountsTable, account) {
    for (var i = 0; i < accountsTable.rowCount; i++) {
        var tRow = accountsTable.row(i);
        const rAccount = tRow.value("Account");
        if (rAccount.toLowerCase() == account.toLowerCase())
            return true;
    }
    return false;
}

function getTexts() {

    const texts = {};
    texts.nonExistentAccount = "Account %1 not found in the Accounts table";
    return texts;
}