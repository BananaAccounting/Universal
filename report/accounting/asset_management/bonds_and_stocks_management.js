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
    tableRow.addCell("Date", "styleTablesHeaderText");
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
    tableRow.addCell("Accumulated Quantity ", "styleTablesHeaderText");
    tableRow.addCell("Purchase Cost", "styleTablesHeaderText");
    tableRow.addCell("Sale Cost", "styleTablesHeaderText");
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
            let date = rows[index].date;
            let action = rows[index].action;
            let description = rows[index].description;
            let qt = rows[index].qt;
            let course = rows[index].course;
            let amount_currency = rows[index].amount_currency;
            let balance_currency = rows[index].balance_currency;
            let exchange_rate = rows[index].exchange_rate;
            let amount_chf = rows[index].amount_chf;
            let balance = rows[index].balance;
            let tableRow = table_bas_transactions.addRow("styleTablRows");
            tableRow.addCell(Banana.Converter.toLocaleDateFormat(date));
            tableRow.addCell(action);
            tableRow.addCell(description);
            tableRow.addCell(Banana.SDecimal.round(qt, { 'decimals': 0 }), 'styleNormalAmount');
            tableRow.addCell(Banana.SDecimal.round(course, { 'decimals': 2 }), 'styleNormalAmount');
            tableRow.addCell(toLocaleAmountFormat(amount_currency), "styleNormalAmount");
            tableRow.addCell(toLocaleAmountFormat(balance_currency), "styleNormalAmount");
            tableRow.addCell(Banana.SDecimal.round(exchange_rate, { 'decimals': 2 }), 'styleNormalAmount');
            tableRow.addCell(toLocaleAmountFormat(amount_chf), "styleNormalAmount");
            tableRow.addCell(toLocaleAmountFormat(balance), "styleNormalAmount");
        }

    }



    /**********************************************************
     * add the Bonds and Stocks details table
     **********************************************************/
    var table_bas_details = addTableBaSDetails(report);

    for (var key in bas_data) {
        let bas_names = getBasNames();
        let bas_closing_courses = getBasClosingCourses();
        //add the header from the bas names inserted ba the user
        let tableRow = table_bas_details.addRow("styleTablesBasNames");
        tableRow.addCell(bas_names[key]);
        let rows = bas_data[key];
        for (var index in rows) {
            let qt_cum = rows[index].qt_cum;
            let balance = rows[index].balance;
            let balance_purchase = rows[index].balance_purchase;
            let tableRow = table_bas_details.addRow("styleTablRows");
            tableRow.addCell(Banana.SDecimal.round(qt_cum, { 'decimals': 0 }), 'style');
            tableRow.addCell(toLocaleAmountFormat(balance), "styleNormalAmount");
            tableRow.addCell(toLocaleAmountFormat(balance_purchase), "styleNormalAmount");
        }

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
        tableRow.addCell(bas_closing_courses[key]);
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
    let currentDate = new Date();
    report.getFooter().addClass("footer");
    report.getFooter().addText(Banana.Converter.toLocaleDateFormat(currentDate));

}

/**
 * Unire i prossimi 3 metodi
 */

function loadBasData() {
    let bas_data = [];
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
    let account_data = [];
    let qt_cum = ["0.0"];
    //to calculate the profits on sales
    let average_courses = [];
    //inizializzare con val di default
    if (account) {
        account_journal = Banana.document.currentCard(account, '', '', null);
        for (var i = 0; i < account_journal.rowCount - 1; i++) {
            let transaction = {};
            let tRow = account_journal.row(i);
            transaction.date = tRow.value('Date');
            transaction.action = tRow.value('DocType');
            transaction.description = tRow.value('Description');
            transaction.qt = tRow.value('Quantity');
            qt_cum.push(transaction.qt);
            transaction.qt_cum = qt_cum.reduce(sumQt);
            //aggiorno il corso medio
            average_courses.push(getCourseAverage(transaction.balance, transaction.qt));
            transaction.course = tRow.value('UnitPrice');
            average_courses.push(transaction.course);
            transaction.amount_currency = tRow.value('AmountCurrency');
            transaction.balance_currency = tRow.value("JBalanceAccountCurrency");
            transaction.exchange_rate = tRow.value('ExchangeRate');
            transaction.amount_chf = tRow.value('Amount');
            transaction.balance = tRow.value('JBalance');
            transaction.average_course = average_courses[i];


            transaction.balance_purchase = getPurchaseBalance(transaction.qt_cum, transaction.average_course);

            account_data.push(transaction);

            Banana.console.debug(JSON.stringify(transaction));


        }
    }

    return account_data;
}

function sumQt(cum_qt, qt) {
    return Banana.SDecimal.add(qt, cum_qt);
}

function getCourseAverage(balance, qt) {
    let course_average = Banana.SDecimal.add(balance, qt);
    course_average = Banana.SDecimal.divide(course_average, 2);
    course_average = toLocaleAmountFormat(course_average);

    return course_average;
}

function getPurchaseBalance(qt_cum, average_course) {
    let balance_purchase = Banana.SDecimal.multiply(average_course, qt_cum);

    return balance_purchase;

}


function toLocaleAmountFormat(value) {
    if (!value || value.trim().length === 0)
        return "";

    //cambiare
    let dec = 2
    return Banana.Converter.toLocaleNumberFormat(value, dec, true);
}

function initParam() {

    let userParam = {};

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