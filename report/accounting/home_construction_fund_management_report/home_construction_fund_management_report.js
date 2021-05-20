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
    var tableFundManagement = report.addTable('myTableFundManagement');
    tableFundManagement.setStyleAttributes("width:100%;");
    tableFundManagement.getCaption().addText(qsTr("GESTIONE FONDI COSTRUZIONE"), "styleTitles");

    var tableHeader = tableFundManagement.getHeader();
    var tableRow = tableHeader.addRow();
    tableRow.addCell("Categoria", "styleTablesHeaderText");
    tableRow.addCell("Uscite", "styleTablesHeaderText");
    tableRow.addCell("Delibere", "styleTablesHeaderText");
    tableRow.addCell("Uscite-Delibere", "styleTablesHeaderText");
    tableRow.addCell("Preventivo di Massima ", "styleTablesHeaderText");
    tableRow.addCell("Delibere-Preventivo di massima", "styleTablesHeaderText");
    //altre colonne verranno aggiunte con il document Change
    return tableFundManagement;
}

function printReport() {

    let categories = loadCategotyTableData("Category");
    let expenses = loadCategotyTableData("Expenses");
    //con il nuovo formato questa colonna contiene i valori delle delibere
    let deliberations = loadCategotyTableData("Budget");
    let exp_delib_difference = getExpAndDelibDifference(expenses, deliberations);
    let cell_style = "";
    let budget = loadCategotyTableData("PreventivoGenerale");
    let delib_and_budg_difference = getExpAndBudgDifference(deliberations, budget);

    /**********************************************************
     * create the report and add header and footer
     **********************************************************/
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
        //cell_style = setStyleToCell(deliberations[i]);
        tableRow.addCell(toLocaleAmountFormat(exp_delib_difference[i]), 'styleNormalAmount');
        tableRow.addCell(toLocaleAmountFormat(budget[i]), 'styleNormalAmount');
        //cell_style = setStyleToCell(deliberations[i]);
        tableRow.addCell(toLocaleAmountFormat(delib_and_budg_difference[i]), 'styleNormalAmount');

    }



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

function loadCategotyTableData(column) {
    var element_list = [];
    if (!Banana.document) {
        return element_list;
    }

    var table = Banana.document.table("Categories");
    if (!table) {
        return element_list;
    }

    for (var i = 0; i < table.rowCount; i++) {
        var tRow = table.row(i);
        var category_id = tRow.value(column);

        if (category_id.length > 0) {
            element_list.push(category_id);

        }

    }

    return element_list;

}

/**
 * Calculate the Difference between the Expenses and the Deliberations, the deliberations should be greater than the expenses,
 * otherwise the expense was to expensive.
 */
function getExpAndDelibDifference(expenses, deliberations) {
    let results = [];
    for (var i = 0; i < deliberations.length - 1; i++) {
        //for calculation I remove the sign from the deliberations, if it is present
        if (deliberations[i].indexOf("-" >= 0)) {
            deliberations[i] = Banana.SDecimal.abs(deliberations[i]);
        }

        results[i] = (Banana.SDecimal.subtract(expenses[i], deliberations[i]));

    }

    return results;

}

/**
 * Calculate the Difference between the Deliberations and the Budget*(i), the deliberations should be greater than the expenses,
 * otherwise the expense was to expensive.
 * 
 * *(i)For ever Budget columns
 */
function getExpAndBudgDifference(deliberations, budget) {
    let results = [];
    for (var i = 0; i < deliberations.length - 1; i++) {
        //for calculation I remove the sign from the deliberations, if it is present
        if (deliberations[i].indexOf("-" >= 0)) {
            deliberations[i] = Banana.SDecimal.abs(deliberations[i]);
        }

        results[i] = (Banana.SDecimal.subtract(deliberations[i], budget[i]));

    }

    return results;

}

/**
 * METTERE A POSTO
 * set the style of a cell depending of the results
 * explaination:
 * 
 * @param {*} exp_delib_difference 
 */
function setStyleToCell(exp_delib_difference) {
    if (!exp_delib_difference) {
        return;
    }

    let style = "";
    //if it's negative, so the deliberations are greater and expenses were within budget 
    if (exp_delib_difference.indexOf("-") >= 0) {
        style = "cellGreen";
    } else {
        style = "cellOrange";
    }

    return style;
}

function exec(inData, options) {

    //verificare la licenza

    if (!Banana.document)
        return "@Cancel";
    var report = printReport();
    var stylesheet = getReportStyle();
    Banana.Report.preview(report, stylesheet);

}