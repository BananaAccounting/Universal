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
// @id = bonds_and_stocks_management.js
// @description = Bonds and Stocks Management
// @task = app.command
// @doctype = 100.*
// @publisher = Banana.ch SA
// @pubdate = 2021-04-14
// @inputdatasource = none
// @timeout = -1

/**
 * This extension generates a report that allows you to see the movements of securities held in the accounts and details of their purchase and sale.
 * acronym bas= bonds and stocks
 */
function addTableBaSTransactions(report) {
    var table_bas_transactions = report.addTable('table_bas_transactions');
    table_bas_transactions.setStyleAttributes("width:100%;");
    table_bas_transactions.getCaption().addText(qsTr("BONDS AND STOCKS TRANSACTIONS"), "styleTitles");

    var tableHeader = table_bas_transactions.getHeader();
    var tableRow = tableHeader.addRow();
    tableRow.addCell("Action", "styleTablesHeaderText");
    tableRow.addCell("Notes", "styleTablesHeaderText");
    tableRow.addCell("Description", "styleTablesHeaderText");
    tableRow.addCell("Quantity", "styleTablesHeaderText");
    tableRow.addCell("AmountCurrency", "styleTablesHeaderText");
    tableRow.addCell("Amount", "styleTablesHeaderText");
    //this.generateHeaderColumns(tableRow);
    return table_bas_transactions;
}

function addTableBaSDetails(report) {
    var table_bas_details = report.addTable('table_bas_details');
    table_bas_details.setStyleAttributes("width:100%;");
    table_bas_details.getCaption().addText(qsTr("BONDS AND STOCKS DETAILS"), "styleTitles");
    var tableHeader = table_bas_details.getHeader();
    var tableRow = tableHeader.addRow();
    tableRow.addCell("Quantity", "styleTablesHeaderText");
    tableRow.addCell("Purchase Cost", "styleTablesHeaderText");
    tableRow.addCell("Resale Cost, da generare il numero a dipendenza dei movimenti", "styleTablesHeaderText");
    //this.generateHeaderColumns(tableRow);
    return table_bas_details;
}

function printReport() {

    /**********************************************************
     * create the report and add header and footer
     **********************************************************/
    var report = Banana.Report.newReport("Bonds and stocks management");
    addHeader(report);
    addFooter(report);

    //save the transactions data
    bas_transactions = loadBasTransactions()

    /**********************************************************
     * add the Bonds and Stocks transactions table
     **********************************************************/
    var table_bas_transactions = addTableBaSTransactions(report);
    for (var i = 0; i <= bas_transactions.length - 1; i++) {
        for (var j = 0; j <= bas_transactions.length - 1; j++) {
            let action = bas_transactions[i][j].action;
            let qt = bas_transactions[i][j].qt;
            let notes = bas_transactions[i][j].notes;
            let description = bas_transactions[i][j].description;
            let amount_currency = bas_transactions[i][j].amount_currency;
            let amount = bas_transactions[i][j].amount;
            let tableRow = table_bas_transactions.addRow("styleTablRows");
            tableRow.addCell(action);
            tableRow.addCell(notes);
            tableRow.addCell(description);
            tableRow.addCell(Banana.SDecimal.round(qt, { 'decimals': 0 }));
            tableRow.addCell(toLocaleAmountFormat(amount_currency), "styleNormalAmount");
            tableRow.addCell(toLocaleAmountFormat(amount), "styleNormalAmount");
        }
    }



    /**********************************************************
     * add the Bonds and Stocks details table
     **********************************************************/
    var table_bas_details = addTableBaSDetails(report);

    var tableRow = table_bas_details.addRow("styleTablRows");
    for (var i = 0; i <= bas_transactions.length - 1; i++) {
        for (var j = 0; j <= bas_transactions.length - 1; j++) {
            var tableRow = table_bas_details.addRow();
            let qt = bas_transactions[i][j].qt;
            let balance = bas_transactions[i][j].balance // bonds and stocks resale value
            tableRow.addCell(Banana.SDecimal.round(qt, { 'decimals': 0 }));
            tableRow.addCell(balance);
        }
    }


    return report;

}

function getReportStyle() {
    //CREATE THE STYLE FOR THE REPORT
    //create the style
    var textCSS = "";
    var file = Banana.IO.getLocalFile("file:script/bonds_and_stocks_management.css");
    var fileContent = file.read();
    if (!file.errorString) {
        Banana.IO.openPath(fileContent);
        //Banana.console.log(fileContent);
        textCSS = fileContent;
    } else {
        Banana.console.log(file.errorString);
    }

    var stylesheet = Banana.Report.newStyleSheet();
    // Parse the CSS text
    stylesheet.parse(textCSS);

    var style = stylesheet;


    //Create a table style adding the border
    style = stylesheet.addStyle("table_bas_transactions");
    style = stylesheet.addStyle("table_bas_details");

    return stylesheet;
}

/**
 * 
 * @param {*} report 
 */
function addHeader(report) {
    report.getHeader().addClass("header");

}

/**
 * @description set the footer of the report.
 * @param {object} report: the report created
 */
function addFooter(report) {
    var currentDate = new Date();
    report.getFooter().addClass("footer");
    report.getFooter().addText(Banana.Converter.toLocaleDateFormat(currentDate));

}

/**
 * 
 */
function loadBasTransactions() {
    var transactions = [];
    let userParam = initParam();
    let savedParam = Banana.document.getScriptSettings();
    if (savedParam.length > 0) {
        userParam = JSON.parse(savedParam);
        userParam = verifyParam(userParam);
    }

    // for each title account call the method loadCurrentCard
    let value = userParam.bonds_and_stocks_accounts.toString();
    account_list = value.split(";");
    for (var i = 0; i <= account_list.length - 1; i++) {
        transactions.push(loadCurrentCard(account_list[i]));
    }


    return transactions;

}

/**
 * 
 * @param {*} account the account identifying the asset in the chart of accounts
 * @returns an array of objects, one object for every transaction concerning  'account'
 */
function loadCurrentCard(account) {
    if (account) {
        var account_transactions = [];
        account_journal = Banana.document.currentCard(account, '', '', null);
        for (var i = 0; i < account_journal.rowCount; i++) {
            let tRow = account_journal.row(i);
            let action = "Action";
            let qt = tRow.value('Quantity');
            let notes = tRow.value('Notes');
            let description = tRow.value('Description');
            let amount_currency = tRow.value('AmountCurrency');
            let amount = tRow.value('Amount');
            //balance is the value for the load Bas resale cost
            let balance = tRow.value('JBalance');
            let balance_currency = tRow.value("JBalanceAccountCurrency");

            Banana.console.debug(JSON.stringify(account_transactions));

            account_transactions.push({ action, qt, notes, description, amount_currency, amount, balance, balance_currency });



        }
    }
    return account_transactions;
}


/**
 * 
 */
function loadBaSPurchasingCosts() {

}

/**
 * 
 * @param account the account identifying the asset in the chart of accounts
 * @returns 
 */
function loadBaSResaleCosts(account) {

    var account_balances
        //gli importi equivalgono alla colonna Balance
        //carico i dati per ogni conto titoli che viene inserito

    return account_balances


}

function toLocaleAmountFormat(value) {
    if (!value || value.trim().length === 0)
        return "";

    //cambiare
    var dec = 2
    return Banana.Converter.toLocaleNumberFormat(value, dec, true);
}

function initParam() {

    var userParam = {};

    userParam.version = "v1.0";
    userParam.bonds_and_stocks_accounts = '1400;1401';

    return userParam;

}

/**
 * Verifies the parameters entered by the user
 */
function verifyParam(userParam) {

    if (!userParam.bonds_and_stocks_accounts) {
        userParam.bonds_and_stocks_accounts = '1400;1401';
    }

    return userParam;

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
    currentParam.name = 'bonds_and_stocks';
    currentParam.title = 'Bonds and Stocks';
    currentParam.type = 'string';
    currentParam.value = userParam.bonds_and_stocks_accounts ? userParam.bonds_and_stocks_accounts : '';
    currentParam.editable = true;
    currentParam.readValue = function() {
        userParam.include = this.value;
    }
    convertedParam.data.push(currentParam);

    return convertedParam;

}

function settingsDialog() {
    var userParam = initParam();
    var savedParam = Banana.document.getScriptSettings();
    if (savedParam.length > 0) {
        userParam = JSON.parse(savedParam);
    }
    userParam = verifyParam(userParam);


    var dialogTitle = 'Settings';
    var pageAnchor = 'dlgSettings';
    var convertedParam = convertParam(userParam);
    if (!Banana.Ui.openPropertyEditor(dialogTitle, convertedParam, pageAnchor))
        return false;
    for (var i = 0; i < convertedParam.data.length; i++) {
        // Read values to dialogparam (through the readValue function)
        if (typeof(convertedParam.data[i].readValue) == "function")
            convertedParam.data[i].readValue();
    }

    var paramToString = JSON.stringify(userParam);
    Banana.document.setScriptSettings(paramToString);
}

/**
 *  executes the extension
 * @param {*} inData 
 * @param {*} options 
 */
function exec(inData, options) {

    //verificare la licenza

    if (!Banana.document)
        return "@Cancel";
    var report = printReport();
    var stylesheet = getReportStyle();
    Banana.Report.preview(report, stylesheet);
    Banana.Report.preview(report, stylesheet);

}