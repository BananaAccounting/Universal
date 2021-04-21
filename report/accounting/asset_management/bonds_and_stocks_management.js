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
    tableRow.addCell("Description", "styleTablesHeaderText");
    tableRow.addCell("Quantity", "styleTablesHeaderText");
    tableRow.addCell("Course ", "styleTablesHeaderText");
    tableRow.addCell("Amount Currency", "styleTablesHeaderText");
    tableRow.addCell("Balance Currency", "styleTablesHeaderText");
    tableRow.addCell("Exchange Rate", "styleTablesHeaderText");
    tableRow.addCell("Amount CHF", "styleTablesHeaderText");
    tableRow.addCell("Balance CHF", "styleTablesHeaderText");
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
    tableRow.addCell("Resale Cost", "styleTablesHeaderText");
    //this.generateHeaderColumns(tableRow);
    return table_bas_details;
}

function printReport() {

    getBuyCoursesAverage();

    /**********************************************************
     * create the report and add header and footer
     **********************************************************/
    var report = Banana.Report.newReport("Bonds and stocks management");
    addHeader(report);
    addFooter(report);

    bas_data = loadBasData();

    /**********************************************************
     * add the Bonds and Stocks transactions table
     **********************************************************/
    var table_bas_transactions = addTableBaSTransactions(report);

    for (var key in bas_data) {

        let bas_names = getBasNames();
        //add the header from the bas names inserted ba the user
        let tableRow = table_bas_transactions.addRow("styleTablesBasNames");
        tableRow.addCell(bas_names[key]);

        let rows = bas_data[key];
        for (var index in rows) {
            Banana.console.debug(rows[index].qt_cum);
            let action = rows[index].action;
            let description = rows[index].description;
            let qt = rows[index].qt;
            let course = rows[index].course;
            let amount_currency = rows[index].amount_currency;
            let balance_currency = rows[index].balance_currency;
            let exchange_rate = rows[index].exchange_rate;
            let amount_chf = rows[index].amount_chf;
            let balance_resale = rows[index].balance;
            let tableRow = table_bas_transactions.addRow("styleTablRows");
            tableRow.addCell(action);
            tableRow.addCell(description);
            tableRow.addCell(Banana.SDecimal.round(qt, { 'decimals': 0 }), 'styleNormalAmount');
            tableRow.addCell(Banana.SDecimal.round(course, { 'decimals': 2 }), 'styleNormalAmount');
            tableRow.addCell(toLocaleAmountFormat(amount_currency), "styleNormalAmount");
            tableRow.addCell(toLocaleAmountFormat(balance_currency), "styleNormalAmount");
            tableRow.addCell(Banana.SDecimal.round(exchange_rate, { 'decimals': 2 }), 'styleNormalAmount');
            tableRow.addCell(toLocaleAmountFormat(amount_chf), "styleNormalAmount");
            tableRow.addCell(toLocaleAmountFormat(balance_resale), "styleNormalAmount");
        }

    }



    /**********************************************************
     * add the Bonds and Stocks details table
     **********************************************************/
    var table_bas_details = addTableBaSDetails(report);

    for (var i = 0; i < bas_data.length; i++) {
        let bas_names = getBasNames();
        let bas_closing_courses = getBasClosingCourses();
        //add the header from the bas names inserted ba the user
        let tableRow = table_bas_details.addRow("styleTablesBasNames");
        tableRow.addCell(bas_names[i]);

        tableRow = table_bas_details.addRow("styleTablesBasResults");
        tableRow.addCell("Profit(Loss) on sale");
        tableRow.addCell("Value");
        tableRow = table_bas_details.addRow("styleTablesBasResults");
        tableRow.addCell("Profit(Loss) on the course of the day ");
        tableRow.addCell("Value");
        tableRow = table_bas_details.addRow("styleTablesBasResults");
        tableRow.addCell("Income %");
        tableRow.addCell("Value");
        tableRow = table_bas_details.addRow("styleTablesBasResults");
        tableRow.addCell("Average course value");
        tableRow.addCell(bas_closing_courses[i]);
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
 * Unire i prossimi 3 metodi
 */

function loadBasData() {
    var bas_data = [];
    let userParam = initParam();
    let savedParam = Banana.document.getScriptSettings();
    if (savedParam.length > 0) {
        userParam = JSON.parse(savedParam);
        userParam = verifyParam(userParam);
    }

    // for each title account call the method loadCurrentCard
    let value = userParam.bonds_and_stocks_accounts.toString();
    let account_list = value.split(";");
    for (var i = 0; i <= account_list.length - 1; i++) {
        bas_data.push(loadCurrentCard(account_list[i]));
        //Banana.console.debug(account_list[i]);
    }


    return bas_data;

}

function getBasNames(useParam) {
    let userParam = initParam();
    let savedParam = Banana.document.getScriptSettings();
    if (savedParam.length > 0) {
        userParam = JSON.parse(savedParam);
        userParam = verifyParam(userParam);
    }
    let value = userParam.bonds_and_stocks_names.toString();
    let name_list = value.split(";");

    return name_list;

}

function getBasClosingCourses() {
    let userParam = initParam();
    let savedParam = Banana.document.getScriptSettings();
    if (savedParam.length > 0) {
        userParam = JSON.parse(savedParam);
        userParam = verifyParam(userParam);
    }
    let value = userParam.bonds_and_stocks_closing_courses.toString();
    let closing_course_list = value.split(";");

    return closing_course_list;
}

/**
 * 
 * @param {*} account the account identifying the asset in the chart of accounts
 * @returns an array of objects, one object for every transaction concerning  'account'
 * the data is taken from the account card of each 'account' element
 */
function loadCurrentCard(account) {
    var account_data = [];
    var qt_cum = [];
    //inizializzare con val di default
    if (account) {
        account_journal = Banana.document.currentCard(account, '', '', null);
        for (var i = 0; i < account_journal.rowCount - 1; i++) {
            let transaction = {};
            let tRow = account_journal.row(i);
            transaction.action = tRow.value('DocType');
            transaction.description = tRow.value('Description');
            transaction.qt = tRow.value('Quantity');
            transaction.course = tRow.value('UnitPrice');
            transaction.amount_currency = tRow.value('AmountCurrency');
            transaction.balance_currency = tRow.value("JBalanceAccountCurrency");
            transaction.exchange_rate = tRow.value('ExchangeRate');
            transaction.amount_chf = tRow.value('Amount');
            transaction.balance = tRow.value('JBalance');

            account_data.push(transaction);


        }
    }

    return account_data;
}

/**
 * Calculate the Profit (or loss) on sale for every account
 */
function getBuyCoursesAverage(account) {
    let bas_data = loadBasData();
    let buy_courses_sum = "";
    let buy_courses_total = 0;
    let buy_courses_average = "";

}


function getPreviousQtCum(qt_cum, qt) {
    let previous_qt_cum = qt_cum.slice(-1);
    previous_qt_cum = Banana.SDecimal.abs(previous_qt_cum);
    previous_qt_cum = Banana.SDecimal.add(previous_qt_cum, qt);

    return previous_qt_cum;

}


/**
 * Calculate the Purchasing cost of a stock.
 * The difference has to be calculated when the stock quantity decreases, so some stocks are selled.
 * With this difference it's possibile to see if selling the stock generated a profit
 */
function setBaSPurchasingCosts(balance_previous, cumulated_qt, qt) {

    let balance_purchasing = Banana.SDecimal.divide(balance_previous, cumulated_qt);
    balance_purchasing = Banana.SDecimal.divide(balance_purchasing, qt);

    return balance_purchasing;

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
    userParam.bonds_and_stocks_names = 'Nestle;Intel';
    //per il profitto(perdita) non realizzato
    userParam.bonds_and_stocks_closing_courses = '102;55';

    return userParam;

}

/**
 * Verifies the parameters entered by the user
 */
function verifyParam(userParam) {

    if (!userParam.bonds_and_stocks_accounts) {
        userParam.bonds_and_stocks_accounts = '1400;1401';
    }
    if (!userParam.bonds_and_stocks_names) {
        userParam.bonds_and_stocks_names = 'Title1;Title2';
    }
    if (!userParam.bonds_and_stocks_closing_courses) {
        userParam.bonds_and_stocks_closing_courses = '102;55';
    }

    return userParam;

}


/**
 *  Create the parameters of the settings dialog
 */
function convertParam(userParam) {

    var convertedParam = {};
    var defaultParam = initParam();
    convertedParam.version = '1.0';
    /* array of script's parameters */
    convertedParam.data = [];

    var currentParam = {};
    currentParam.name = 'bonds_and_stocks_accounts';
    currentParam.title = 'Bonds and Stocks accounts';
    currentParam.type = 'string';
    currentParam.value = userParam.bonds_and_stocks_accounts ? userParam.bonds_and_stocks_accounts : '';
    currentParam.defaultvalue = defaultParam.bonds_and_stocks_accounts;
    currentParam.editable = true;
    currentParam.readValue = function() {
        userParam.bonds_and_stocks_accounts = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.name = 'bonds_and_stocks_names';
    currentParam.title = 'Bonds and Stocks names';
    currentParam.type = 'string';
    currentParam.value = userParam.bonds_and_stocks_names ? userParam.bonds_and_stocks_names : '';
    currentParam.defaultvalue = defaultParam.bonds_and_stocks_names;
    currentParam.editable = true;
    currentParam.readValue = function() {
        userParam.bonds_and_stocks_names = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.name = 'bonds_and_stocks_closing_courses';
    currentParam.title = 'Bonds and Stocks closing courses';
    currentParam.type = 'string';
    currentParam.value = userParam.bonds_and_stocks_closing_courses ? userParam.bonds_and_stocks_closing_courses : '';
    currentParam.defaultvalue = defaultParam.bonds_and_stocks_closing_courses;
    currentParam.editable = true;
    currentParam.readValue = function() {
        userParam.bonds_and_stocks_closing_courses = this.value;
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

    if (typeof(Banana.Ui.openPropertyEditor) !== 'undefined') {
        var dialogTitle = 'Settings';
        var pageAnchor = 'dlgSettings';
        var convertedParam = convertParam(userParam);
        if (!Banana.Ui.openPropertyEditor(dialogTitle, convertedParam, pageAnchor))
            return;
        for (var i = 0; i < convertedParam.data.length; i++) {
            // Read values to dialogparam (through the readValue function)
            if (typeof(convertedParam.data[i].readValue) == "function")
                convertedParam.data[i].readValue();
        }
    }

    var paramToString = JSON.stringify(userParam);
    Banana.document.setScriptSettings(paramToString);
    return true;
}

/**
 *  executes the extension
 * @param {*} inData 
 * @param {*} options 
 */
function exec(inData, options) {

    //verificare la licenza

    var userParam = {};
    if (inData.length > 0) {
        userParam = JSON.parse(inData);
        userParam = verifyParam(userParam);
    } else if (options && options.useLastSettings) {
        var savedParam = Banana.document.getScriptSettings();
        if (savedParam.length > 0) {
            userParam = JSON.parse(savedParam);
            userParam = verifyParam(userParam);;
        }
    } else {
        if (!settingsDialog())
            return "@Cancel";
        var savedParam = Banana.document.getScriptSettings();
        if (savedParam.length > 0) {
            userParam = JSON.parse(savedParam);
            userParam = verifyParam(userParam);
        }
    }

    if (!Banana.document)
        return "@Cancel";
    var report = printReport();
    var stylesheet = getReportStyle();
    Banana.Report.preview(report, stylesheet);

}