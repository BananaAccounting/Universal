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
// @id = report_progetto_costruzione.js
// @description = Report progetto costruzione
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

function addTableCategoriesManagement(report) {


    var tableCategoriesManagement = report.addTable('myTableCategoriesManagement');
    tableCategoriesManagement.setStyleAttributes("width:100%;");
    tableCategoriesManagement.getCaption().addText(qsTr("Rendiconto per Categoria"), "styleTablesTitles");
    tableCategoriesManagement.addColumn("Categoria").setStyleAttributes("width:20%");
    tableCategoriesManagement.addColumn("Completamento").setStyleAttributes("width:15%");
    tableCategoriesManagement.addColumn("Preventivo di Massima").setStyleAttributes("width:15%");
    tableCategoriesManagement.addColumn("Delibere").setStyleAttributes("width:10%");
    tableCategoriesManagement.addColumn("Uscite Effettive").setStyleAttributes("width:10%");
    tableCategoriesManagement.addColumn("Uscite-Delibere").setStyleAttributes("width:15%");
    tableCategoriesManagement.addColumn("Delibere-Preventivo di massima").setStyleAttributes("width:15%");

    var tableHeader = tableCategoriesManagement.getHeader();
    var tableRow = tableHeader.addRow();
    tableRow.addCell("Categoria", "styleTablesHeaderText");
    tableRow.addCell("Completamento %", "styleTablesHeaderText");
    tableRow.addCell("Preventivo di Massima", "styleTablesHeaderText");
    tableRow.addCell("Delibere", "styleTablesHeaderText");
    tableRow.addCell("Uscite Effettive", "styleTablesHeaderText");
    tableRow.addCell("Uscite-Delibere", "styleTablesHeaderText");
    tableRow.addCell("Delibere-Preventivo di massima", "styleTablesHeaderText");

    return tableCategoriesManagement;
}

function addTableCompaniesManagement(report) {


    var tableCompaniesManagement = report.addTable('myTableCompaniesManagement');
    tableCompaniesManagement.setStyleAttributes("width:100%;");
    tableCompaniesManagement.getCaption().addText(qsTr("Rendiconto per Impresa"), "styleTablesTitles");
    tableCompaniesManagement.addColumn("Impresa").setStyleAttributes("width:20%");
    tableCompaniesManagement.addColumn("Completamento %").setStyleAttributes("width:15%");
    tableCompaniesManagement.addColumn("Importo deliberato").setStyleAttributes("width:20%");
    tableCompaniesManagement.addColumn("Uscite Effettive").setStyleAttributes("width:20%");
    tableCompaniesManagement.addColumn("Uscite-Delibere").setStyleAttributes("width:20%");

    var tableHeader = tableCompaniesManagement.getHeader();
    var tableRow = tableHeader.addRow();
    tableRow.addCell("Impresa", "styleTablesHeaderText");
    tableRow.addCell("Completamento %", "styleTablesHeaderText");
    tableRow.addCell("Delibere", "styleTablesHeaderText");
    tableRow.addCell("Uscite Effettive", "styleTablesHeaderText");
    tableRow.addCell("Uscite-Delibere", "styleTablesHeaderText");

    return tableCompaniesManagement;
}

function printReport() {

    var report = Banana.Report.newReport("Rendiconto progetto costruzione");
    addHeader(report);
    addFooter(report);

    //add title and date
    var currentDate = new Date();
    currentDate = Banana.Converter.toLocaleDateFormat(currentDate);
    report.addParagraph("Rendiconto progetto costruzione " + currentDate, "styleTitle");

    var tableCategoriesManagement = addTableCategoriesManagement(report);

    let group_list = loadGroups("Categories");
    for (var i = 0; i < group_list.length; i++) {
        //inserisco i valori normali
        let categories_rows = loadCategoriesData(group_list[i]);
        for (var key in categories_rows) {
            let tableRow = tableCategoriesManagement.addRow("styleTablRows");
            tableRow.addCell(categories_rows[key].category, 'styleTablRows');
            tableRow.addCell(categories_rows[key].percentage_completion, 'stylepercentages');
            tableRow.addCell(toLocaleAmountFormat(categories_rows[key].budget), 'styleNormalAmount');
            tableRow.addCell(toLocaleAmountFormat(categories_rows[key].deliberations), 'styleNormalAmount');
            tableRow.addCell(toLocaleAmountFormat(categories_rows[key].expenses), 'styleNormalAmount');
            cell = tableRow.addCell(toLocaleAmountFormat(categories_rows[key].deliberations_expenses) + ' ', 'styleNormalAmount');
            addSymbol(categories_rows[key].deliberations_expenses, cell, false);
            cell = tableRow.addCell(toLocaleAmountFormat(categories_rows[key].deliberations_budget) + ' ', 'styleNormalAmount');
            addSymbol(categories_rows[key].deliberations_budget, cell, false);
        }
        //inserisco i totali alla fine di ogni gruppo
        let totals = loadCategoriesDataTotals(group_list[i]);
        for (var key in totals) {
            let tableRow = tableCategoriesManagement.addRow("table_row_total");
            tableRow.addCell(totals[key].description, 'styleTablesTotalsDescriptions');
            tableRow.addCell("-", 'stylepercentages');
            tableRow.addCell(toLocaleAmountFormat(totals[key].total_budget), 'styleTotalAmount');
            tableRow.addCell(toLocaleAmountFormat(totals[key].total_deliberations), 'styleTotalAmount');
            tableRow.addCell(toLocaleAmountFormat(totals[key].total_expenses), 'styleTotalAmount');
            cell = tableRow.addCell(toLocaleAmountFormat(totals[key].total_deliberations_expenses) + ' ', 'styleTotalAmount');
            addSymbol(totals[key].total_deliberations_expenses, cell, true);
            cell = tableRow.addCell(toLocaleAmountFormat(totals[key].total_deliberations_budget) + ' ', 'styleTotalAmount');
            addSymbol(totals[key].total_deliberations_budget, cell, true);
        }


    }

    report.addPageBreak()

    var tableCompaniesManagement = addTableCompaniesManagement(report);
    let account_rows = loadAccountsTableRows();
    for (var key in account_rows) {
        let tableRow = tableCompaniesManagement.addRow("styleTablRows");
        tableRow.addCell(account_rows[key].account, 'styleTablRows');
        tableRow.addCell(account_rows[key].percentage_completion, 'stylepercentages');
        tableRow.addCell(toLocaleAmountFormat(account_rows[key].deliberations), 'styleNormalAmount');
        tableRow.addCell(toLocaleAmountFormat(account_rows[key].expenses), 'styleNormalAmount');
        cell = tableRow.addCell(toLocaleAmountFormat(account_rows[key].deliberations_expenses) + ' ', 'styleNormalAmount');
        addSymbol(account_rows[key].deliberations_expenses, cell, true);

    }
    //inserisco i totali per le aziende
    let companies_total = getCompaniesTotal(account_rows);
    let tableRow = tableCompaniesManagement.addRow("table_row_total");
    tableRow.addCell(companies_total.description, 'styleTablesTotalsDescriptions');
    tableRow.addCell("-", 'stylepercentages');
    tableRow.addCell(toLocaleAmountFormat(companies_total.total_deliberations), 'styleTotalAmount');
    tableRow.addCell(toLocaleAmountFormat(companies_total.total_expenses), 'styleTotalAmount');
    cell = tableRow.addCell(toLocaleAmountFormat(companies_total.total_deliberations_expenses) + ' ', 'styleTotalAmount');
    addSymbol(companies_total.total_deliberations_expenses, cell, true);

    return report;

}


function getReportStyle() {
    //CREATE THE STYLE FOR THE REPORT
    //create the style
    var textCSS = "";
    var file = Banana.IO.getLocalFile("file:script/report_progetto_costruzione.css");
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
    style = stylesheet.addStyle("tableCategoriesManagement");

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

}

function toLocaleAmountFormat(value) {
    if (!value || value.trim().length === 0)
        return "";

    var dec = 2
    return Banana.Converter.toLocaleNumberFormat(value, dec, true);
}

function loadGroups(table) {
    var groupList = [];
    if (!Banana.document) {
        return groupList;
    }
    var table = Banana.document.table(table);
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
function loadTableData(table_name) {

    if (!Banana.document) {
        return;
    }

    var table = Banana.document.table(table_name);
    if (!table) {
        return;
    }

    return table;
}

function loadTransactionsTableRows() {
    let table = loadTableData("Transactions");
    let transactions_table_rows = [];

    for (var i = 0; i < table.rowCount; i++) {
        let tRow = table.row(i);
        /*recupero in un oggetto la percentuale di completamento e la categoria o la compagnia associata(sulla stessa riga) e la posizione delle due colonne
        con questo metodo recupero tutti i valori.
        */
        let transactions = {};
        transactions.completion_of_activities = tRow.value("CompletionActivity");
        transactions.categories = tRow.value("Category");
        transactions.companies = tRow.value("Cc1");
        transactions_table_rows.push(transactions);

    }
    return transactions_table_rows;
}

/**
 * Recupero l'ultima percentuale presente nella tabella delle registrazioni, per la colonna delle categorie
 * @returns 
 */
function getLastPerc_category(column) {
    let transactions_table_rows = loadTransactionsTableRows()
    let percentage_completion = "0.00";

    for (var row in transactions_table_rows) {
        if (transactions_table_rows[row].categories == column) {
            percentage_completion = transactions_table_rows[row].completion_of_activities;
            if (percentage_completion == "")
                percentage_completion = "0.00";
        }
    }

    return percentage_completion;
}

function getLastPerc_company(column) {
    let transactions_table_rows = loadTransactionsTableRows()
    let percentage_completion = "0.00";

    for (var row in transactions_table_rows) {
        if (transactions_table_rows[row].companies == column) {
            percentage_completion = transactions_table_rows[row].completion_of_activities;
            if (percentage_completion == "")
                percentage_completion = "0.00";
        }
    }

    return percentage_completion;
}

/**
 * load the data of the companies (CC1) from the accounts table
 */
function loadAccountsTableRows() {
    let table = loadTableData("Accounts");
    let accounts_table_rows = [];

    for (var i = 2; i < table.rowCount; i++) {
        let tRow = table.row(i);
        let company = tRow.value("Account");
        //if it is a cost center (controllare con più centri di costo cosa succede)
        if (company.substr(0, 1) === '.' || company.substr(0, 1) === ',' || company.substr(0, 1) === ';') {
            let companies = {};
            companies.account = tRow.value("Account");
            //tolgo il punto iniziale dalla descrizione del conto
            companies.account = companies.account.slice(1);
            companies.percentage_completion = getLastPerc_company(companies.account);
            companies.deliberations = tRow.value("Budget");
            companies.deliberations = Banana.SDecimal.abs(companies.deliberations);
            companies.expenses = tRow.value("Expenses");
            companies.expenses = Banana.SDecimal.abs(companies.expenses);
            companies.deliberations_expenses = getExpAndDelibDifference(companies.expenses, companies.deliberations);
            accounts_table_rows.push(companies);

        }
    }
    return accounts_table_rows;
}

function getCompaniesTotal(accounts_table_rows) {
    let companies_total = {};
    companies_total.description = "Totale Imprese";
    companies_total.total_deliberations = "";
    companies_total.total_expenses = "";
    companies_total.total_deliberations_expenses = "";
    //calcolo il totale delle delibere, uscite e la differenza
    for (var key in accounts_table_rows) {
        companies_total.total_deliberations = Banana.SDecimal.add(companies_total.total_deliberations, accounts_table_rows[key].deliberations);
        companies_total.total_expenses = Banana.SDecimal.add(companies_total.total_expenses, accounts_table_rows[key].expenses);
        companies_total.total_deliberations_expenses = Banana.SDecimal.add(companies_total.total_deliberations_expenses, accounts_table_rows[key].deliberations_expenses);
    }


    return companies_total;

}



function loadCategoriesData(group) {
    let table = loadTableData("Categories");
    let categories_table_rows = [];

    //mettere nella doc che le prime due rige vanno lasciate libere come da modello
    for (var i = 2; i < table.rowCount; i++) {
        let tRow = table.row(i);
        let gr = tRow.value("Gr");
        if (gr === group && tRow.value("Category")) {
            let categories = {};
            categories.category = tRow.value("Category");
            categories.percentage_completion = getLastPerc_category(categories.category);
            categories.expenses = tRow.value("Expenses");
            categories.expenses = Banana.SDecimal.abs(categories.expenses);
            categories.deliberations = tRow.value("Budget");
            categories.deliberations = Banana.SDecimal.abs(categories.deliberations);
            categories.deliberations_expenses = getExpAndDelibDifference(categories.expenses, categories.deliberations);
            categories.budget = tRow.value("EstimateBudget");
            categories.budget = Banana.SDecimal.abs(categories.budget);
            categories.deliberations_budget = getDelibAndBudgDifference(categories.deliberations, categories.budget);
            categories.gr = group;
            categories_table_rows.push(categories);
        }
    }

    return categories_table_rows;

}

function loadCategoriesDataTotals(group) {
    let table = loadTableData("Categories");
    let categories_table_totals = [];

    for (var i = 0; i < table.rowCount; i++) {
        let tRow = table.row(i);
        let group_column = tRow.value("Group");
        if (group_column === group) {
            let categories_group_total = {};
            categories_group_total.description = tRow.value("Description");
            categories_group_total.total_expenses = tRow.value("Expenses");
            categories_group_total.total_deliberations = tRow.value("Budget");
            categories_group_total.total_deliberations = Banana.SDecimal.abs(categories_group_total.total_deliberations);
            categories_group_total.total_deliberations_expenses = getExpAndDelibDifference(categories_group_total.total_expenses, categories_group_total.total_deliberations);
            categories_group_total.total_budget = tRow.value("EstimateBudget");
            categories_group_total.total_deliberations_budget = getDelibAndBudgDifference(categories_group_total.total_deliberations, categories_group_total.total_budget);
            categories_group_total.group_column = group;
            categories_table_totals.push(categories_group_total);
        }
    }

    return categories_table_totals;
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

    result = Banana.SDecimal.subtract(expense, deliberation);

    return result;

}

/**
 * Calculate the Difference between the Deliberations and the Budget*(i), the deliberations should be greater than the expenses,
 * otherwise the expense was to expensive.
 * 
 * *(i)For ever Budget columns
 */
function getDelibAndBudgDifference(deliberation, budget) {
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
    let symbolGreen = "symbolGreen";
    let symbolRed = "symbolRed";
    let symbolOrange = "symbolOrange";


    if (value > 0) {
        cell.addText(symbol, symbolRed);
    } else if (value < 0) {
        cell.addText(symbol, symbolGreen);
    } else {
        cell.addText(symbol, symbolOrange);
    }
    return;
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

}