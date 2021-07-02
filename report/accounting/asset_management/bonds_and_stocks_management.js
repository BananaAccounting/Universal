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
function addTableBaSAppraisal(report) {
    let current_date=new Date()
    current_date=Banana.Converter.toInternalDateFormat(current_date);
    var table_bas_appraisal = report.addTable('table_bas_appraisal');
    table_bas_appraisal.setStyleAttributes("width:100%;");
    table_bas_appraisal.getCaption().addText(qsTr("Appraisal Report \n Holdings as of: "+current_date), "styleTitles");
    var tableHeader = table_bas_appraisal.getHeader();
    var tableRow = tableHeader.addRow();
    tableRow.addCell("Type/Security", "styleTablesHeaderText");
    tableRow.addCell("Quantity", "styleTablesHeaderText");
    tableRow.addCell("Unit Cost", "styleTablesHeaderText");
    tableRow.addCell("Total Cost", "styleTablesHeaderText");
    tableRow.addCell("Market Price ", "styleTablesHeaderText");
    tableRow.addCell("Market Value", "styleTablesHeaderText");
    tableRow.addCell("% of Port", "styleTablesHeaderText");
    tableRow.addCell("Un. Gain or Loss", "styleTablesHeaderText");
    tableRow.addCell("% G/L", "styleTablesHeaderText");
    //this.generateHeaderColumns(tableRow);
    return table_bas_appraisal;
}

function addTableBaSHoldings(report) {
    let current_date=new Date()
    current_date=Banana.Converter.toInternalDateFormat(current_date);
    var table_bas_holdings = report.addTable('table_bas_holdings');
    table_bas_holdings.setStyleAttributes("width:100%;");
    table_bas_holdings.getCaption().addText(qsTr("Portfolio Holdings \n Holdings as of: "+current_date), "styleTitles");
    var tableHeader = table_bas_holdings.getHeader();
    var tableRow = tableHeader.addRow();
    tableRow.addCell("Type/Security", "styleTablesHeaderText");
    tableRow.addCell("Quantity", "styleTablesHeaderText");
    tableRow.addCell("Unit Cost", "styleTablesHeaderText");
    tableRow.addCell("Total Cost", "styleTablesHeaderText");
    tableRow.addCell("Market Price ", "styleTablesHeaderText");
    tableRow.addCell("Market Value", "styleTablesHeaderText");
    tableRow.addCell("% of Port", "styleTablesHeaderText");
    tableRow.addCell("Un. Gain or Loss", "styleTablesHeaderText");
    tableRow.addCell("% G/L", "styleTablesHeaderText");
    //this.generateHeaderColumns(tableRow);
    return table_bas_holdings;
}

function printReport() {

    /**********************************************************
     * create the report
     **********************************************************/
    var report = Banana.Report.newReport("Bonds and stocks management");

    /***********************************************************
     * Add the appraisal report table
     **********************************************************/

    var table_bas_appraisal = addTableBaSAppraisal(report);
    addHeader(report);
    addFooter(report);
    var items = getReportRows();
    var sorted_items=items.sort(compare);
    var items_total = getReportRows_GroupTotals();

    for (var row_total in items_total) {
        var tableRow = table_bas_appraisal.addRow("styleTableRows");
        tableRow.addCell(items_total[row_total].name, 'styleTablesBasNames_totals',9);
        for (var row in items) {
            if (items[row].gr === items_total[row_total].name) {
                let tableRow = table_bas_appraisal.addRow("styleTableRows");
                tableRow.addCell(items[row].name, 'styleTablesBasNames');
                tableRow.addCell(toLocaleAmountFormat(items[row].quantity), 'styleTablesBasResults');
                tableRow.addCell(toLocaleAmountFormat(items[row].unit_cost), 'styleTablesBasResults');
                tableRow.addCell(toLocaleAmountFormat(items[row].total_cost), 'styleTablesBasResults');
                tableRow.addCell(toLocaleAmountFormat(items[row].market_price), 'styleTablesBasResults');
                tableRow.addCell(toLocaleAmountFormat(items[row].market_value), 'styleTablesBasResults');
                tableRow.addCell(toLocaleAmountFormat(items[row].perc_of_port), 'styleTablesBasResults');
                tableRow.addCell(toLocaleAmountFormat(items[row].unrealized_gain_loss), 'styleTablesBasResults');
                tableRow.addCell(toLocaleAmountFormat(items[row].perc_g_l), 'styleTablesBasResults');
            }
        }
        var tableRow = table_bas_appraisal.addRow("styleTableRows");
        tableRow.addCell("", 'styleTablesBasResults', 3);
        tableRow.addCell(toLocaleAmountFormat(items_total[row_total].total_cost), 'styleTablesBasResults_totals');
        tableRow.addCell(toLocaleAmountFormat(items_total[row_total].market_value), 'styleTablesBasResults_totals',2);
        tableRow.addCell(toLocaleAmountFormat(items_total[row_total].perc_of_port), 'styleTablesBasResults_totals');
        tableRow.addCell(toLocaleAmountFormat(items_total[row_total].unrealized_gain_loss), 'styleTablesBasResults_totals');
        tableRow.addCell(toLocaleAmountFormat(items_total[row_total].perc_g_l), 'styleTablesBasResults_totals');

    }
    
    /***********************************************************
     * Add the Portfolio Holdings table (sorted by Market value)
     **********************************************************/
    var style_market_value=setSortedColumnStyle('Market Value');
    var style_percentage_of_portfolio=setSortedColumnStyle('Percentage of Portfolio');
    var style_market_quantity=setSortedColumnStyle('Quantity');

     var table_bas_holdings = addTableBaSHoldings(report);
     for (var row in sorted_items) {
            let tableRow = table_bas_holdings.addRow("styleTableRows");
            tableRow.addCell(sorted_items[row].name, 'styleTablesBasNames');
            tableRow.addCell(toLocaleAmountFormat(sorted_items[row].quantity),style_market_quantity)
            tableRow.addCell(toLocaleAmountFormat(sorted_items[row].unit_cost), 'styleTablesBasResults');
            tableRow.addCell(toLocaleAmountFormat(sorted_items[row].total_cost), 'styleTablesBasResults');
            tableRow.addCell(toLocaleAmountFormat(sorted_items[row].market_price), 'styleTablesBasResults');
            tableRow.addCell(toLocaleAmountFormat(sorted_items[row].market_value), style_market_value);
            tableRow.addCell(toLocaleAmountFormat(sorted_items[row].perc_of_port), style_percentage_of_portfolio);
            tableRow.addCell(toLocaleAmountFormat(sorted_items[row].unrealized_gain_loss),'styleTablesBasResults');
            tableRow.addCell(toLocaleAmountFormat(sorted_items[row].perc_g_l), 'styleTablesBasResults');
    }

    return report;

}

function setSortedColumnStyle(value){
    var userParam = initParam();
    var savedParam = Banana.document.getScriptSettings();
    if (savedParam.length > 0) {
        userParam = JSON.parse(savedParam);
        userParam = verifyParam(userParam);
    }
    var style="";
    if(userParam.sort_items_by===value){
        style="styleSortedByColumn";
        return style;
    }else{
        style="styleTablesBasResults";
        return style;
    }
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

function getItemColumnValue(item, column, total) {
    let table = Banana.document.table("Items");
    let value = "";
    if (!table) {
        return value;
    }
    for (var i = 0; i < table.rowCount; i++) {
        var tRow = table.row(i);
        if (item === tRow.value("ItemsId") || item === tRow.value("Group")) {
            value = tRow.value(column);
            if (value.length > 0) {
                return value;
            }
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

function getPercOfPortfolioSum(items,column_total_name){
    let sum="";

    for (var key in items){
        if(items[key].gr===column_total_name){
            sum=Banana.SDecimal.add(sum,Banana.SDecimal.abs(items[key].perc_of_port));
        }
    }

    return sum;
}

function getTotalCostSum(items,column_total_name){
    let sum="";

    for (var key in items){
        if(items[key].gr===column_total_name){
            sum=Banana.SDecimal.add(sum,items[key].total_cost);
        }
    }

    return sum;
}

function getUnrealizedGainOrLossSum(items,column_total_name){
    let sum="";

    for (var key in items){
        if(items[key].gr===column_total_name){
            sum=Banana.SDecimal.add(sum,items[key].unrealized_gain_loss);
        }
    }

    return sum;
}

function getGLAverage(items,column_total_name){
    let average="";
    let number_of_elements=0;

    for (var key in items){
        if(items[key].gr===column_total_name){
            average=Banana.SDecimal.add(average,Banana.SDecimal.abs(items[key].perc_g_l));
            number_of_elements++;
        }
    }
    average=Banana.SDecimal.divide(average,number_of_elements);


    return average;
}

function compare(a,b){
    var userParam = initParam();
    var savedParam = Banana.document.getScriptSettings();
    if (savedParam.length > 0) {
        userParam = JSON.parse(savedParam);
        userParam = verifyParam(userParam);
    }
    switch(userParam.sort_items_by){
        case "Market Value":
            return b.market_value-a.market_value;
            break;
        case "Percentage of Portfolio":
            return b.perc_of_port-a.perc_of_port;
            break;
        case "Quantity":
            return b.quantity-a.quantity;
            break;
    }
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
        item_data.unrealized_gain_loss = Banana.SDecimal.subtract(item_data.market_value,item_data.total_cost);
        //è possibile fare in modo che l'utente inserisca il gruppo del totale, se personalizzato
        item_data.perc_of_port = getItemPercOfPort(item_data.market_value, "Total");
        item_data.perc_g_l = getItemGLPerc(item_data.market_value, item_data.total_cost);

        //il gr lo uso solo come riferimento per quando ciclo i dati nel print report
        item_data.gr = getItemColumnValue(items_list[i], "Gr");

        items.push(item_data);

        //Banana.console.debug(item_data.perc_of_port);

    }

    return items
}


function getReportRows_GroupTotals() {
    let items=getReportRows();

    let items_total = [];
    items_list_total = getTableValues("Items", "Group");
    for (var i = 0; i <= items_list_total.length - 1; i++) {
        let item_data_group_total = {};
        item_data_group_total.name = getItemColumnValue(items_list_total[i], "Group", true);
        let total_cost_sum=getTotalCostSum(items,item_data_group_total.name);
        item_data_group_total.total_cost = total_cost_sum;
        item_data_group_total.market_value = getItemColumnValue(items_list_total[i], "CurrencyCurrentValue", true);
        item_data_group_total.unrealized_gain_loss = getUnrealizedGainOrLossSum(items,item_data_group_total.name);
        item_data_group_total.perc_of_port = getPercOfPortfolioSum(items,item_data_group_total.name);
        item_data_group_total.perc_g_l = getGLAverage(items,item_data_group_total.name);

        items_total.push(item_data_group_total);

    }

    return items_total;
}

function getReportRows_FinalTotals(){
    let item_data_final_total={};

    item_data_final_total.name="Totals";
    item_data_final_total.total_cost="Totale ";



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
    userParam.sort_items_by = 'Market Value';

    return userParam;

}

/**
 * Verifies the parameters entered by the user
 */
function verifyParam(userParam) {

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
    currentParam.name = 'sort_items_by';
    currentParam.title = 'Sort Holdings by';
    currentParam.type = 'combobox';
    currentParam.items = ['Market Value','Percentage of Portfolio','Quantity'];
    currentParam.value = userParam.sort_items_by ? userParam.sort_items_by : userParam.sort_items_by;
    currentParam.editable = true;
    currentParam.readValue = function() {
        userParam.sort_items_by = this.value;
    }
    convertedParam.data.push(currentParam);

    return convertedParam;

}

function getErrorMessage(errorId, lang) {
    if (!lang)
        lang = 'en';
    switch (errorId) {
        case this.ID_ERR_EXPERIMENTAL_REQUIRED:
            return "The Experimental version is required";
        case this.ID_ERR_LICENSE_NOTVALID:
            return "This extension requires Banana Accounting+ Advanced";
        case this.ID_ERR_VERSION_NOTSUPPORTED:
            if (lang == 'it')
                return "Lo script non funziona con la vostra attuale versione di Banana Contabilità.\nVersione minimina richiesta: %1.\nPer aggiornare o per maggiori informazioni cliccare su Aiuto";
            else if (lang == 'fr')
                return "Ce script ne s'exécute pas avec votre version actuelle de Banana Comptabilité.\nVersion minimale requise: %1.\nPour mettre à jour ou pour plus d'informations, cliquez sur Aide";
            else if (lang == 'de')
                return "Das Skript wird mit Ihrer aktuellen Version von Banana Buchhaltung nicht ausgeführt.\nMindestversion erforderlich: %1.\nKlicken Sie auf Hilfe, um zu aktualisieren oder weitere Informationen zu bekommen";
            else
                return "This script does not run with your current version of Banana Accounting.\nMinimum version required: %1.\nTo update or for more information click on Help";
    }
    return '';
}

function getLang() {
    var lang = 'en';
    if (this.banDocument)
        lang = this.banDocument.locale;
    else if (Banana.application.locale)
        lang = Banana.application.locale;
    if (lang.length > 2)
        lang = lang.substr(0, 2);
    return lang;
}

function isBananaAdvanced() {
    // Starting from version 10.0.7 it is possible to read the property Banana.application.license.isWithinMaxRowLimits 
    // to check if all application functionalities are permitted
    // the version Advanced returns isWithinMaxRowLimits always false
    // other versions return isWithinMaxRowLimits true if the limit of transactions number has not been reached

    if (Banana.compareVersion && Banana.compareVersion(Banana.application.version, "10.0.9") >= 0) {
        var license = Banana.application.license;
        if (license.licenseType === "advanced" || license.isWithinMaxFreeLines) {
            return true;
        }
    }

    return false;
}

function bananaRequiredVersion(requiredVersion, expmVersion) {
    /**
     * Check Banana version
     */
    if (expmVersion) {
        requiredVersion = requiredVersion + "." + expmVersion;
    }
    if (Banana.compareVersion && Banana.compareVersion(Banana.application.version, requiredVersion) >= 0) {
        return true;
    }
    return false;
}

function verifyBananaVersion() {
    if (!Banana.document)
        return false;

    var lang = this.getLang();

    var ban_version_min = "10.0.9";
    var ban_dev_version_min = "";
    var curr_version = bananaRequiredVersion(ban_version_min, ban_dev_version_min);
    var curr_license = isBananaAdvanced();

    if (!curr_version) {
        var msg = this.getErrorMessage(this.ID_ERR_VERSION_NOTSUPPORTED, lang);
        msg = msg.replace("%1", BAN_VERSION_MIN);
        Banana.document.addMessage(msg, this.ID_ERR_VERSION_NOTSUPPORTED);
        return false;
    }
    if (!curr_license) {
        var msg = getErrorMessage(this.ID_ERR_LICENSE_NOTVALID, lang);
        Banana.document.addMessage(msg, this.ID_ERR_LICENSE_NOTVALID);
        return false;
    }
    return true;
}

function settingsDialog() {
    var userParam = initParam();
    var savedParam = Banana.document.getScriptSettings();
    if (savedParam.length > 0) {
        userParam = JSON.parse(savedParam);
        userParam = verifyParam(userParam);
    }

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

    return true;
}

function exec(inData, options) {

    if (!Banana.document)
        return "@Cancel";

    if (!verifyBananaVersion()) {
        return "@Cancel";
    }

    var userParam = {};
    if (inData.length > 0) {
        userParam = JSON.parse(inData);
        userParam = verifyParam(userParam);
    } else if (options && options.useLastSettings) {
        var savedParam = Banana.document.getScriptSettings();
        if (savedParam.length > 0) {
            userParam = JSON.parse(savedParam);
            userParam = verifyParam(userParam);
        }
    } else {
        if (!settingsDialog()) {
            return "@Cancel";
        }
        var savedParam = Banana.document.getScriptSettings();
        if (savedParam.length > 0) {
            userParam = JSON.parse(savedParam);
            userParam = verifyParam(userParam);
        }
    }

    var report = printReport();
    var stylesheet = getReportStyle();
    Banana.Report.preview(report, stylesheet);


}