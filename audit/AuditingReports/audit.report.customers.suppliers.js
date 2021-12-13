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

function getCutAndSupTable(report, type) {
    var cutAndSupTable = report.addTable('cutAndSupTable');
    //title table
    cutAndSupTable.getCaption().addText(type, "dateIndicator");
    //columns
    cutAndSupTable.addColumn("Account").setStyleAttributes("width:10%", "tableHeaders");
    cutAndSupTable.addColumn("Customer").setStyleAttributes("width:20%", "tableHeaders");
    cutAndSupTable.addColumn("Organisation").setStyleAttributes("width:20%", "tableHeaders");
    cutAndSupTable.addColumn("Phone Numbers").setStyleAttributes("width:25%", "tableHeaders");
    cutAndSupTable.addColumn("Email").setStyleAttributes("width:20%", "tableHeaders");
    cutAndSupTable.addColumn("Address").setStyleAttributes("width:50%", "tableHeaders");
    cutAndSupTable.addColumn("Country").setStyleAttributes("width:20%", "tableHeaders");

    //header
    var tableHeader = cutAndSupTable.getHeader();
    var tableRow = tableHeader.addRow();
    tableRow.addCell("Account", "tableHeaders");
    tableRow.addCell("Customer", "tableHeaders");
    tableRow.addCell("Organisation", "tableHeaders");
    tableRow.addCell("Phone Numbers", "tableHeaders");
    tableRow.addCell("Email", "tableHeaders");
    tableRow.addCell("Address", "tableHeaders");
    tableRow.addCell("Country", "tableHeaders");


    return cutAndSupTable;
}


//Function that creates and prints the report
function printReport() {

    //Add a name to the report
    var report = Banana.Report.newReport("Customers and Suppliers");

    //Add a title
    report.addParagraph("Customers and Suppliers", "heading1");
    report.addParagraph(" ", "");

    //Create a table for the report
    var customersTable = getCutAndSupTable(report, "Customers");
    report.addPageBreak();
    var suppliersTable = getCutAndSupTable(report, "Suppliers");

    /* 1. Print the Jorunal with the totals */
    printTables(report, customersTable, suppliersTable);

    //Add a footer to the report
    addFooter(report);

    //Print the report
    var stylesheet = getReportStyle();
    Banana.Report.preview(report, stylesheet);
}

function printTables(report, customersTable, suppliersTable) {

    var cutAndSup = getCustAndSup();


    //add Customers
    for (var c in cutAndSup.customers) {
        var customer = cutAndSup.customers[c];

        tableRow = customersTable.addRow();
        tableRow.addCell(customer.account, "centredStyle");
        tableRow.addCell(customer.description, "centredStyle");
        tableRow.addCell(customer.organization, "centredStyle");
        tableRow.addCell("Phone: " + customer.phoneMain + "\n " + "Mobile: " + customer.phoneMobile, "centredStyle");
        tableRow.addCell(customer.email, "centredStyle");
        tableRow.addCell(customer.address, "centredStyle");
        tableRow.addCell(customer.country, "centredStyle");
    }

    //add suppliers
    for (var c in cutAndSup.suppliers) {
        var customer = cutAndSup.suppliers[c];

        tableRow = suppliersTable.addRow();
        tableRow.addCell(customer.account, "centredStyle");
        tableRow.addCell(customer.description, "centredStyle");
        tableRow.addCell(customer.organization, "centredStyle");
        tableRow.addCell("Phone: " + customer.phoneMain + "\n " + "Mobile: " + customer.phoneMobile, "centredStyle");
        tableRow.addCell(customer.email, "centredStyle");
        tableRow.addCell(customer.address, "centredStyle");
        tableRow.addCell(customer.country, "centredStyle");
    }


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
            customer.account = tRow.value("Account");
            customer.description = tRow.value("Description");
            customer.name = tRow.value("FirstName");
            customer.familyName = tRow.value("FamilyName");
            customer.organization = tRow.value("OrganisationName");
            customer.address = tRow.value("Street") + " " + tRow.value("PostalCode") + " " + tRow.value("Locality");;
            customer.country = tRow.value("Country") + " " + tRow.value("CountryCode");
            customer.phoneMain = tRow.value("PhoneMain");
            customer.phoneMobile = tRow.value("PhoneMobile");
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
            supplier.account = tRow.value("Account");
            supplier.description = tRow.value("Description");
            supplier.name = tRow.value("FirstName");
            supplier.familyName = tRow.value("FamilyName");
            supplier.organization = tRow.value("OrganisationName");
            supplier.address = tRow.value("Street") + " " + tRow.value("PostalCode") + " " + tRow.value("Locality");;
            supplier.country = tRow.value("Country") + " " + tRow.value("CountryCode");
            supplier.phoneMain = tRow.value("PhoneMain");
            supplier.phoneMobile = tRow.value("PhoneMobile");
            supplier.email = tRow.value("EmailWork");

            elementsList.push(supplier);
        }
    }

    CustAndSup.suppliers = elementsList;

    return CustAndSup;

}


//Function that adds a Footer to the report
function addFooter(report) {
    var date = new Date();
    var d = Banana.Converter.toLocaleDateFormat(date);
    report.getFooter().addClass("footerStyle");
    var versionLine = report.getFooter().addText(d + " - Customers and Suppliers - Page ", "description");
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