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
    var table_bas_data = report.addTable('table_bas_transactions');
    table_bas_data.setStyleAttributes("width:100%;");
    table_bas_data.getCaption().addText(qsTr("BONDS AND STOCKS TRANSACTIONS"), "styleTitles");

    var tableHeader = table_bas_data.getHeader();
    var tableRow = tableHeader.addRow();
    tableRow.addCell("Type/Security", "styleTablesHeaderText");
    tableRow.addCell("Quantity", "styleTablesHeaderText");
    tableRow.addCell("Unit Cost", "styleTablesHeaderText");
    tableRow.addCell("Total Cost", "styleTablesHeaderText");
    tableRow.addCell("Market Price ", "styleTablesHeaderText");
    tableRow.addCell("Market Value", "styleTablesHeaderText");
    tableRow.addCell("% of Port", "styleTablesHeaderText");
    tableRow.addCell("% G/L", "styleTablesHeaderText");
    //this.generateHeaderColumns(tableRow);
    return table_bas_data;
}

function printReport() {

    /**********************************************************
     * create the report and add header and footer
     **********************************************************/
    var report = Banana.Report.newReport("Bonds and stocks management");

    var table_bas_data = addTableBaSTransactions(report);
    addHeader(report);
    addFooter(report);
    let report_rows = getReportRows();

    for (var row in report_rows) {
        let tableRow = table_bas_data.addRow("styleTableRows");
        tableRow.addCell(report_rows[row].name, 'styleTablesBasNames');
        tableRow.addCell(toLocaleAmountFormat(report_rows[row].quantity), 'styleTablesBasResults');
        tableRow.addCell(toLocaleAmountFormat(report_rows[row].unit_cost), 'styleTablesBasResults');
        tableRow.addCell(toLocaleAmountFormat(report_rows[row].total_cost), 'styleTablesBasResults');
        tableRow.addCell(toLocaleAmountFormat(report_rows[row].market_price), 'styleTablesBasResults');
        tableRow.addCell(toLocaleAmountFormat(report_rows[row].market_value), 'styleTablesBasResults');
        tableRow.addCell(toLocaleAmountFormat(report_rows[row].perc_of_port), 'styleTablesBasResults');
        tableRow.addCell(toLocaleAmountFormat(report_rows[row].perc_g_l), 'styleTablesBasResults');
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


function getTableValues(table, column) {
    var values = [];
    if (!Banana.document) {
        return values;
    }
    var table = Banana.document.table(table);
    if (!table) {
        return values;
    }
    for (var i = 0; i < table.rowCount; i++) {
        var tRow = table.row(i);

        var value = tRow.value(column);

        if (value.length > 0) {
            values.push(value);

        }
    }
    return values;
}

function getItemColumnValue(item, column) {
    let table = Banana.document.table("Items");
    let value = "";
    if (!table) {
        return value;
    }
    for (var i = 0; i < table.rowCount; i++) {
        var tRow = table.row(i);
        if (tRow.value("ItemsId") === item)
            value = tRow.value(column);
        if (value.length > 0) {
            return value;
        }
    }
}

function getItemUnitCost(item) {
    let table = Banana.document.table("Transactions");
    let unit_price = "";
    // il costo unitario è rappresentato dal costo medio di acquisto
    let unit_cost = "";
    let n_elements = [];

    for (var i = 0; i < table.rowCount; i++) {
        var tRow = table.row(i);
        if (tRow.value("ItemsId") === item && tRow.value("DocType") === "buy") {
            unit_price = tRow.value("UnitPrice");
            if (unit_price.length > 0) {
                n_elements.push(unit_price);
            }
        }
    }

    /************************************
     * calcolo costo medio di acquisto 
     ***********************************/

    //trovo la somma di tutti i tassi
    for (var i = 0; i < n_elements.length; i++) {
        unit_cost = Banana.SDecimal.add(unit_cost, n_elements[i]);
    }
    //divido la somma per il numero di elementi.

    unit_cost = Banana.SDecimal.divide(unit_cost, n_elements.length);


    return unit_cost;

}

function getItemPercOfPort(amount, group_name) {
    let table = Banana.document.table("Items");
    let result = "";
    let group_total = "";
    if (!table) {
        return result;
    }
    for (var i = 0; i < table.rowCount; i++) {
        var tRow = table.row(i);
        if (tRow.value("Group") === group_name) {
            group_total = tRow.value("CurrencyCurrentValue");
            if (group_total.length > 0) {
                /************************************************************************************
                 *calcolo che percentuale l'importo rappresenta rispetto al totale del portafoglio
                 formula: (ammontare (amount) currency current value /totale colonna currency current value)*100
                 ************************************************************************************/
                result = Banana.SDecimal.divide(amount, group_total);
                result = Banana.SDecimal.multiply(result, 100);

                return result;
            }
        }
    }
}

function getItemGLPerc(market_value, total_cost) {
    let perc_g_l = Banana.SDecimal.subtract(market_value, total_cost);
    perc_g_l = Banana.SDecimal.divide(perc_g_l, market_value);
    perc_g_l = Banana.SDecimal.multiply(perc_g_l, 100);

    return perc_g_l;

}


function getReportRows() {
    let items = [];
    //get the list of the items in the Item table
    items_list = getTableValues("Items", "ItemsId");
    for (var i = 0; i < items_list.length; i++) {
        let item_data = {};
        item_data.name = items_list[i];
        item_data.quantity = getItemColumnValue(items_list[i], "QuantityCurrent");
        item_data.unit_cost = getItemUnitCost(items_list[i]);
        item_data.total_cost = Banana.SDecimal.multiply(item_data.quantity, item_data.unit_cost);
        item_data.market_price = getItemColumnValue(items_list[i], "UnitPriceCurrent");
        item_data.market_value = getItemColumnValue(items_list[i], "CurrencyCurrentValue");
        //è possibile fare in modo che l'utente inserisca il gruppo del totale, se personalizzato
        item_data.perc_of_port = getItemPercOfPort(item_data.market_value, "Total");
        item_data.perc_g_l = getItemGLPerc(item_data.market_value, item_data.total_cost);

        items.push(item_data);

        //Banana.console.debug(item_data.perc_of_port);

    }

    return items
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
    convertedParam.version = '1.0';
    /* array of script's parameters */
    convertedParam.data = [];

    var currentParam = {};
    currentParam.name = 'bonds_and_stocks_accounts';
    currentParam.title = 'Bonds and Stocks accounts';
    currentParam.type = 'string';
    currentParam.value = userParam.bonds_and_stocks_accounts ? userParam.bonds_and_stocks_accounts : '';
    currentParam.editable = true;
    currentParam.readValue = function() {
        userParam.include = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.name = 'bonds_and_stocks_names';
    currentParam.title = 'Bonds and Stocks names';
    currentParam.type = 'string';
    currentParam.value = userParam.bonds_and_stocks_names ? userParam.bonds_and_stocks_names : '';
    currentParam.editable = true;
    currentParam.readValue = function() {
        userParam.include = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.name = 'bonds_and_stocks_closing_courses';
    currentParam.title = 'Bonds and Stocks closing courses';
    currentParam.type = 'string';
    currentParam.value = userParam.bonds_and_stocks_closing_courses ? userParam.bonds_and_stocks_closing_courses : '';
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

}