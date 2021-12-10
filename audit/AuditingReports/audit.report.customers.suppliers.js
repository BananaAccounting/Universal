// Copyright [2015] [Banana.ch SA - Lugano Switzerland]
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
// @id = ch.banana.audit.report.customers.suppliers
// @api = 1.0
// @pubdate = 2021-12-10
// @publisher = Banana.ch SA
// @description = Customers and Suppliers
// @task = app.command
// @doctype = *;*
// @docproperties =
// @outputformat = none
// @inputdatasource = none
// @timeout = -1


//Main function
function exec(string) {

    //Check if we are on an opened document
    if (!Banana.document) {
        return;
    }

    printReport();
}

function getJournalTable(report, endDate) {
    var journalTable = report.addTable('journalTable');
    //title table
    journalTable.getCaption().addText("Journal at " + Banana.Converter.toLocaleDateFormat(endDate), "dateIndicator");
    //columns
    journalTable.addColumn("Date").setStyleAttributes("width:10%", "tableHeaders");
    journalTable.addColumn("Transaction Type").setStyleAttributes("width:15%", "tableHeaders");
    journalTable.addColumn("Doc").setStyleAttributes("width:10%", "tableHeaders");
    journalTable.addColumn("Description").setStyleAttributes("width:50%", "tableHeaders");
    journalTable.addColumn("Vat Code").setStyleAttributes("width:15%", "tableHeaders");
    journalTable.addColumn("Debit").setStyleAttributes("width:15%", "tableHeaders");
    journalTable.addColumn("Credit").setStyleAttributes("width:15%", "tableHeaders");
    journalTable.addColumn("Vat Taxable").setStyleAttributes("width:15%", "tableHeaders");
    journalTable.addColumn("Vat Amount").setStyleAttributes("width:15%", "tableHeaders");

    //header
    var tableHeader = journalTable.getHeader();
    var tableRow = tableHeader.addRow();
    tableRow.addCell("Date", "tableHeaders");
    tableRow.addCell("Transaction Type", "tableHeaders");
    tableRow.addCell("Doc", "tableHeaders");
    tableRow.addCell("Description", "tableHeaders"); //description of the vat code 
    tableRow.addCell("Vat Code", "tableHeaders");
    tableRow.addCell("Debit", "tableHeaders");
    tableRow.addCell("Credit", "tableHeaders");
    tableRow.addCell("Vat Taxable", "tableHeaders");
    tableRow.addCell("Vat Amount", "tableHeaders");


    return journalTable;
}


//Function that creates and prints the report
function printReport() {

    //Add a name to the report
    var report = Banana.Report.newReport("Customers and Suppliers");

    //Add a title
    report.addParagraph("Customers and Suppliers", "heading1");
    report.addParagraph(" ", "");

    //Create a table for the report
    var table = getJournalTable();

    /* 1. Print the Jorunal with the totals */
    printJournal(table);

    //Add a footer to the report
    addFooter(report);

    //Print the report
    var stylesheet = getReportStyle();
    Banana.Report.preview(report, stylesheet);
}

function printJournal(table) {

    var cutAndSup = getCustAndSup();


    for (var op in journalOp) {
        var operation = journalOp[op];

        tableRow = table.addRow();
        tableRow.addCell(Banana.Converter.toLocaleDateFormat(operation.date), "centredStyle");
        tableRow.addCell(operation.type, "centredStyle");
        tableRow.addCell(operation.doc, "centredStyle");
        tableRow.addCell("", "", 6);
        for (var row in operation.rows) {
            var opRow = operation.rows[row];
            tableRow = table.addRow();
            tableRow.addCell("", "", 3);
            tableRow.addCell(opRow.description, "textStyle");
            tableRow.addCell(opRow.vatCode, "centredStyle");
            tableRow.addCell(Banana.Converter.toLocaleNumberFormat(opRow.debitAmount, "2", false), "amountStyle");
            tableRow.addCell(Banana.Converter.toLocaleNumberFormat(opRow.creditAmount, "2", false), "amountStyle");
            tableRow.addCell(Banana.Converter.toLocaleNumberFormat(opRow.vatTaxable, "2", false), "amountStyle");
            tableRow.addCell(Banana.Converter.toLocaleNumberFormat(opRow.vatAmount, "2", false), "amountStyle");
            sumVatAmount = Banana.SDecimal.add(sumVatAmount, opRow.vatAmount);
        }
    }

    //add totals
    tableRow = table.addRow();
    tableRow.addCell("Total", "sumStyle");
    tableRow.addCell("", "", 7);
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(sumVatAmount, "2", false), "sumStyle");


}

//Function that load the jorunal rows
function getCustAndSup() {

    var CustAndSup = {};
    var elementsList = [];

    //Get the Accounts table
    var accountsTab = Banana.document.table("Accounts");

    //Customers - Section = 01, Bclass=1
    for (var i = 0; i < accountsTab.rowCount; i++) {
        var tRow = accountsTab.row(i);

        if (tRow.value("Section"))
            var section = tRow.value("Section");

        if (tRow.value("Account") && tRow.value("BClass") == "1" && section == "01") {
            var customer = {};
            tableRow = table.addRow();
            customer.account = tRow.value("Account");
            customer.description = tRow.value("Description");
            customer.name = tRow.value("FirstName");
            customer.familyName = tRow.value("FamilyName");
            customer.organization = tRow.value("OrganizationName");
            customer.address = tRow.value("Street") + ", " + tRow.value("PostalCode") + " " + tRow.value("Locality");;
            customer.country = tRow.value("Country") + ", " + tRow.value("CountryCode");
            customer.phone = tRow.value("PhoneMain");
            customer.email = tRow.value("EmailWork");

            elementsList.push(customer);
        }
    }
    CustAndSup.customers = elementsList;

    //Suppliers - Section = 02, Bclass=2
    elementsList = [];
    for (var i = 0; i < accountsTab.rowCount; i++) {
        var tRow = accountsTab.row(i);

        if (tRow.value("Section"))
            var section = tRow.value("Section");

        if (tRow.value("Account") && tRow.value("BClass") == "2" && section == "02") {
            var supplier = {};
            tableRow = table.addRow();
            supplier.account = tRow.value("Account");
            supplier.description = tRow.value("Description");
            supplier.name = tRow.value("FirstName");
            supplier.familyName = tRow.value("FamilyName");
            supplier.organization = tRow.value("OrganizationName");
            supplier.address = tRow.value("Street") + ", " + tRow.value("PostalCode") + " " + tRow.value("Locality");;
            supplier.country = tRow.value("Country") + ", " + tRow.value("CountryCode");
            supplier.phone = tRow.value("PhoneMain");
            supplier.email = tRow.value("EmailWork");

            elementsList.push(supplier);
        }
    }

    CustAndSup.suppliers = elementsList;

    Banana.Ui.showText(JSON.stringify(CustAndSup));

    return CustAndSup;

}


//Function that adds a Footer to the report
function addFooter(report) {
    var date = new Date();
    var d = Banana.Converter.toLocaleDateFormat(date);
    report.getFooter().addClass("footerStyle");
    var versionLine = report.getFooter().addText(d + " - Journal - Page ", "description");
    report.getFooter().addFieldPageNr();
}


/**
 * Defines the style for the report
 * @returns 
 */
function getReportStyle() {
    var textCSS = "";
    var file = Banana.IO.getLocalFile("file:script/audit.report.css");
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

    return stylesheet;
}