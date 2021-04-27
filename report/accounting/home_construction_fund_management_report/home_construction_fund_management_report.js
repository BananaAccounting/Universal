// Copyright [2020] [Banana.ch SA - Lugano Switzerland]
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
// @api = 1.1
// @id = home_construction_fund_management_report.js
// @description = Home construction fund management report
// @task = app.command
// @doctype = 110.*
// @publisher = Banana.ch SA
// @pubdate = 2021-04-23
// @inputdatasource = none
// @timeout = -1

/**
 *  executes the extension
 * @param {*} inData 
 * @param {*} options 
 */

function addTableFundManagement(report) {

    //altre colonne verranno aggiunte con il document Change
    let new_budget_columns = addBudgetColumn_columns();


    var tableFundManagement = report.addTable('myTableFundManagement');
    tableFundManagement.setStyleAttributes("width:100%;");
    tableFundManagement.getCaption().addText(qsTr("GESTIONE FONDI COSTRUZIONE"), "styleTitles");
    tableFundManagement.addColumn("Categoria").setStyleAttributes("width:20%");
    tableFundManagement.addColumn("Uscite").setStyleAttributes("width:10%");
    tableFundManagement.addColumn("Delibere").setStyleAttributes("width:10%");
    tableFundManagement.addColumn("Delibere-Uscite").setStyleAttributes("width:15%");
    tableFundManagement.addColumn("Preventivo di Massima").setStyleAttributes("width:15%");
    tableFundManagement.addColumn("Delibere-Preventivo di massima").setStyleAttributes("width:15%");
    for (var key in new_budget_columns) {
        tableFundManagement.addColumn("New Budget Columns").setStyleAttributes("width:15%");
    }

    var tableHeader = tableFundManagement.getHeader();
    var tableRow = tableHeader.addRow();
    tableRow.addCell("Categoria", "styleTablesHeaderText");
    tableRow.addCell("Uscite", "styleTablesHeaderText");
    tableRow.addCell("Delibere", "styleTablesHeaderText");
    tableRow.addCell("Delibere-Uscite", "styleTablesHeaderText");
    tableRow.addCell("Preventivo di Massima", "styleTablesHeaderText");
    tableRow.addCell("Delibere-Preventivo di massima", "styleTablesHeaderText");
    for (var key in new_budget_columns) {
        tableRow.addCell(new_budget_columns[key].nameXml, "styleTablesHeaderText");
    }

    return tableFundManagement;
}

function printReport() {

    var report = Banana.Report.newReport("Gestione delle");
    addHeader(report);
    addFooter(report);

    var tableFundManagement = addTableFundManagement(report);

    let group_list = loadGroups();
    for (var i = 0; i < group_list.length - 1; i++) {
        let rows = loadCategoryTableRows(group_list[i]);
        for (var key in rows) {
            let tableRow = tableFundManagement.addRow("styleTablRows");
            tableRow.addCell(rows[key].category, 'styleTablRows');
            tableRow.addCell(toLocaleAmountFormat(rows[key].expenses), 'styleNormalAmount');
            tableRow.addCell(toLocaleAmountFormat(rows[key].deliberations), 'styleNormalAmount');
            cell = tableRow.addCell(toLocaleAmountFormat(rows[key].deliberations_expenses) + ' ', 'styleNormalAmount');
            addSymbol(rows[key].deliberations_expenses, cell);
            tableRow.addCell(toLocaleAmountFormat(rows[key].budget), 'styleNormalAmount');
            cell = tableRow.addCell(toLocaleAmountFormat(rows[key].deliberations_budget) + ' ', 'styleNormalAmount');
            addSymbol(rows[key].deliberations_budget, cell);
        }
        let tableRow = tableFundManagement.addRow("styleTablRows");
        tableRow.addCell("TOTALE", "styleTablRows");
        tableRow.addCell("totale uscite", "styleTablRows");
        tableRow.addCell("totale delibere", "styleTablRows");
        tableRow.addCell("totale differenza", "styleTablRows");
        tableRow.addCell("totale preventivo di massima", "styleTablRows");
        tableRow.addCell("totale differenza", "styleTablRows");


    }


    /*  let categories = loadCategoryTableData("Category", false);
    let expenses = loadCategoryTableData("Expenses", true);
    //con il nuovo formato questa colonna contiene i valori delle delibere
    let deliberations = loadCategoryTableData("Budget", true);
    let exp_delib_difference = getExpAndDelibDifference(expenses, deliberations);
    let budget = loadCategoryTableData("PreventivoGenerale", true);
    let delib_budg_difference = getExpAndBudgDifference(deliberations, budget);
    //altre colonne verranno aggiunte con il document Change
    let new_budget_columns = addBudgetColumn_columns();

    var report = Banana.Report.newReport("Gestione delle");
    addHeader(report);
    addFooter(report);

    //add the table
    var tableFundManagement = addTableFundManagement(report);
    for (var i = 0; i < categories.length - 1; i++) {
        let tableRow = tableFundManagement.addRow("styleTablRows");
        tableRow.addCell(categories[i]);
        tableRow.addCell(toLocaleAmountFormat(expenses[i]), 'styleNormalAmount');
        tableRow.addCell(toLocaleAmountFormat(deliberations[i]), 'styleNormalAmount');
        cell = tableRow.addCell(toLocaleAmountFormat(exp_delib_difference[i]) + ' ', 'styleNormalAmount');
        addSymbol(exp_delib_difference[i], cell);
        tableRow.addCell(toLocaleAmountFormat(budget[i]), 'styleNormalAmount');
        cell = tableRow.addCell(toLocaleAmountFormat(delib_budg_difference[i]) + ' ', 'styleNormalAmount');
        addSymbol(delib_budg_difference[i], cell);
    }


*/

    return report;

}


function getReportStyle() {
    //CREATE THE STYLE FOR THE REPORT
    //create the style
    var textCSS = "";
    var file = Banana.IO.getLocalFile("file:script/home_construction_fund_management_report.css");
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
    style = stylesheet.addStyle("tableFundManagement");

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

function toLocaleAmountFormat(value) {
    if (!value || value.trim().length === 0)
        return "";

    var dec = 2
    return Banana.Converter.toLocaleNumberFormat(value, dec, true);
}

function loadGroups() {
    var groupList = [];
    if (!Banana.document) {
        return groupList;
    }
    var table = Banana.document.table("Categories");
    if (!table) {
        return groupList;
    }
    for (var i = 0; i < table.rowCount; i++) {
        var tRow = table.row(i);

        var groupId = tRow.value('Group');

        if (groupId.length > 0) {
            groupList.push(groupId);

        }
    }
    return groupList;
}

/**
 * 
 * @param {*} column the column of the categories table
 * @param {*} importo 
 * @returns 
 */
function loadCategoryTableRows(group) {

    var element_list = [];
    if (!Banana.document) {
        return element_list;
    }

    var table = Banana.document.table("Categories");
    if (!table) {
        return element_list;
    }

    //mettere nella doc che le prime due rige vanno lasciate libere come da modello
    for (var i = 2; i < table.rowCount; i++) {
        let tRow = table.row(i);
        let gr = tRow.value("Gr");
        if (gr === group) {
            let categories = {};
            categories.category = tRow.value("Category");
            categories.expenses = tRow.value("Expenses");
            categories.deliberations = tRow.value("Budget");
            categories.deliberations_expenses = getExpAndDelibDifference(categories.expenses, categories.deliberations);
            categories.budget = tRow.value("PreventivoGenerale");
            categories.deliberations_budget = getExpAndBudgDifference(categories.expenses, categories.budget);
            categories.gr = group;
            element_list.push(categories);
        }
    }

    return element_list;
}

/**
 * Calculate the Difference between the Expenses and the Deliberations, the deliberations should be greater than the expenses,
 * otherwise the expense was to expensive.
 */
function getExpAndDelibDifference(expense, deliberation) {
    let result = "";
    //for calculation I remove the sign from the deliberations, if it is present
    if (deliberation.indexOf("-" >= 0)) {
        deliberation = Banana.SDecimal.abs(deliberation);
    }

    result = Banana.SDecimal.subtract(deliberation, expense);

    return result;

}

/**
 * Calculate the Difference between the Deliberations and the Budget*(i), the deliberations should be greater than the expenses,
 * otherwise the expense was to expensive.
 * 
 * *(i)For ever Budget columns
 */
function getExpAndBudgDifference(deliberation, budget) {
    let result = "";
    //for calculation I remove the sign from the deliberations, if it is present
    if (deliberation.indexOf("-" >= 0)) {
        deliberation = Banana.SDecimal.abs(deliberation);
    }
    result = (Banana.SDecimal.subtract(deliberation, budget));



    return result;

}
/**
 * Adds the symbol to the cell, and the style changes from the result.
 * If a value is positive, set the symbolGreen style, otherwise the symbolRed style.
 * @param {*} cell the cell with the result
 * @returns 
 */
function addSymbol(value, cell) {
    //var rateOfGrowth = this.setRateOfGrowth(indexT1, indexT2);
    var symbol = '●';

    if (value > 0) {
        cell.addText(symbol, "symbolGreen");
    } else if (value < 0) {
        cell.addText(symbol, "symbolRed");
    } else {
        cell.addText(symbol, "symbolOrange");
    }
    return;
}

/**
 * initialises the document change structure
 */
function initDocument() {
    var jsonDoc = {};
    jsonDoc.document = {};
    jsonDoc.document.dataUnits = [];

    jsonDoc.creator = {};
    jsonDoc.creator.name = Banana.script.getParamValue('id');
    jsonDoc.creator.version = "1.0";

    return jsonDoc;
}

/**
 * Se l'utente lo ha scelto, aggiunge una nuova colonna per il preventivo al file
 */
function addBudgetColumn_columns() {

    let userParam = initParam();
    let savedParam = Banana.document.getScriptSettings();
    if (savedParam.length > 0) {
        userParam = JSON.parse(savedParam);
        userParam = verifyParam(userParam);
    }
    var columns = [];
    for (var i = 0; i <= userParam.new_budget_columns - 1; i++) {
        //column operation
        let column = {};
        column.operation = {};
        column.operation.name = "add";

        //column name Xml
        column.nameXml = "Preventivo" + i;

        //column Header
        column.header1 = "Preventivo" + i;

        columns.push(column);
    }

    return columns
}

function addBudgetColumn_dataUnits(columns) {

    //data Units
    let dataUnitsCategories = {};
    dataUnitsCategories.id = "Categories";
    dataUnitsCategories.nameXml = "Categories";
    dataUnitsCategories.nid = "100";

    dataUnitsCategories.data = {};
    dataUnitsCategories.data.viewList = {};
    dataUnitsCategories.data.viewList.views = [];
    dataUnitsCategories.data.viewList.views.push({ "columns": columns, "id": "Base", "nameXml": "Base", "nid": "1" });

    //document
    let jsonDoc = initDocument();
    jsonDoc.document.dataUnits.push(dataUnitsCategories);

    return jsonDoc;

}

function initParam() {

    var userParam = {};

    userParam.version = "v1.0";
    userParam.new_budget_columns = '0';
    userParam.copy_previous_data = 'true';

    return userParam;

}

function verifyParam(userParam) {

    if (!userParam.new_budget_columns) {
        userParam.new_budget_columns = 0;
    }

    if (userParam.new_budget_columns > 3) {
        userParam.new_budget_columns = 3;
    }


    if (!userParam.copy_previous_data) {
        userParam.copy_previous_data = 'true';
    }

    return userParam;

}

function convertParam(userParam) {

    var convertedParam = {};
    convertedParam.version = '1.0';
    /* array of script's parameters */
    convertedParam.data = [];

    var currentParam = {};
    currentParam.name = 'new_budget_columns';
    currentParam.title = 'Nuove colonne Preventivo';
    currentParam.type = 'string';
    currentParam.value = userParam.new_budget_columns ? userParam.new_budget_columns : '';
    currentParam.editable = true;
    currentParam.readValue = function() {
        userParam.new_budget_columns = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.name = 'copy_previous_data';
    currentParam.title = 'Copia i valori dal preventivo precedente';
    currentParam.type = 'string';
    currentParam.value = userParam.copy_previous_data ? userParam.copy_previous_data : '';
    currentParam.editable = true;
    currentParam.readValue = function() {
        userParam.copy_previous_data = this.value;
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


function exec(inData, options) {

    //verificare la licenza

    if (!Banana.document)
        return "@Cancel";
    var report = printReport();
    var stylesheet = getReportStyle();
    Banana.Report.preview(report, stylesheet);

    let userParam = initParam();
    let savedParam = Banana.document.getScriptSettings();
    if (savedParam.length > 0) {
        userParam = JSON.parse(savedParam);
        userParam = verifyParam(userParam);
    }
    if (userParam.new_budget_columns > 0) {

        var documentChange = { "format": "documentChange", "error": "", "data": [] };

        //Appends a budget column to the categories table
        let jsonDoc_columns = addBudgetColumn_columns();
        let jsonDoc = addBudgetColumn_dataUnits(jsonDoc_columns);
        documentChange["data"].push(jsonDoc);

        // Banana.console.debug(JSON.stringify(documentChange));

        return documentChange;
    }

}