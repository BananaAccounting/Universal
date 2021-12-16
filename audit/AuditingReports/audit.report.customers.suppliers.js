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

    var customersData = getCustAndSup("1", "01");
    var suppliersData = getCustAndSup("2", "02");


    //add Customers
    for (var c in customersData) {
        var customer = customersData[c];

        tableRow = customersTable.addRow();
        tableRow.addCell(customer.account, "centredStyle");
        tableRow.addCell(customer.description, "centredStyle");
        tableRow.addCell(customer.organization, "centredStyle");
        tableRow.addCell(customer.phone, "centredStyle");
        tableRow.addCell(customer.email, "centredStyle");
        tableRow.addCell(customer.address, "centredStyle");
        tableRow.addCell(customer.countryInfo, "centredStyle");
    }

    //add suppliers
    for (var s in suppliersData) {
        var supplier = suppliersData[s];

        tableRow = suppliersTable.addRow();
        tableRow.addCell(supplier.account, "centredStyle");
        tableRow.addCell(supplier.description, "centredStyle");
        tableRow.addCell(supplier.organization, "centredStyle");
        tableRow.addCell(supplier.phone, "centredStyle");
        tableRow.addCell(supplier.email, "centredStyle");
        tableRow.addCell(supplier.address, "centredStyle");
        tableRow.addCell(supplier.countryInfo, "centredStyle");
    }


}

//Function that load the jorunal rows
function getCustAndSup(bClass, section) {

    var elementsList = [];

    //customers and suppliers fields
    var account = "";
    var description = "";
    var name = "";
    var familyName = "";
    var organisation = "";
    var street = "";
    var postalCode = "";
    var locality = "";
    var country = "";
    var countryCode = "";
    var phoneMain = "";
    var phoneMobile = "";
    var email = "";

    //Get the Accounts table
    var accountsTab = Banana.document.table("Accounts");

    for (var i = 0; i < accountsTab.rowCount; i++) {
        var tRow = accountsTab.row(i);

        if (tRow.value("Section"))
            var currSection = tRow.value("Section");

        if (tRow.value("Account") && tRow.value("BClass") == bClass && currSection == section) {


            account = tRow.value("Account");
            description = tRow.value("Description");
            name = tRow.value("FirstName");
            familyName = tRow.value("FamilyName");
            organisation = tRow.value("OrganisationName");
            email = tRow.value("EmailWork");

            if (tRow.value("Street"))
                street = tRow.value("Street");
            if (tRow.value("PostalCode"))
                postalCode = tRow.value("PostalCode");
            if (tRow.value("Locality"))
                locality = tRow.value("Locality");
            if (tRow.value("Country"))
                country = tRow.value("Country")
            if (tRow.value("CountryCode"))
                countryCode = tRow.value("CountryCode");
            if (tRow.value("PhoneMain"))
                phoneMain = tRow.value("PhoneMain");
            if (tRow.value("PhoneMobile"))
                phoneMobile = tRow.value("PhoneMobile");

            var cutsup = {};
            cutsup.account = account;
            cutsup.description = description;
            cutsup.name = name;
            cutsup.familyName = familyName;
            cutsup.organisation = organisation;
            cutsup.address = street + " " + postalCode + " " + locality;
            cutsup.countryInfo = country + " " + countryCode;

            var phone = "";
            if (phoneMain)
                phone += "Phone: " + phoneMain;
            if (phoneMobile)
                phone += "\n" + "Mobile: " + phoneMobile;
            cutsup.phone = phone;

            elementsList.push(cutsup);
        }

    }
    return elementsList;
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