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
// @id = ch.banana.audit.report
// @api = 1.0
// @pubdate = 2021-12-10
// @publisher = Banana.ch SA
// @description = Customers and Suppliers
// @task = app.command
// @doctype = 100.*
// @docproperties =
// @outputformat = none
// @inputdatasource = none
// @timeout = -1
// @includejs= ch.banana.audit.settings.js


//Main function
function exec(string) {

    var banDoc = Banana.document;

    //Check if we are on an opened document
    if (!banDoc) {
        return;
    }

    //get user parameters
    var userParam=initDialogParam();
    var savedParam = banDoc.getScriptSettings("ch.banana.audit.settings");
    if (savedParam.length>0)
        userParam = getParamObj(userParam,savedParam);

    var report = printReport(banDoc, userParam);

    //preview of the report
    var stylesheet = getReportStyle();
    Banana.Report.preview(report, stylesheet);
}

/**
 * Format the parameters defined by the user.
 * @param {*} userParam 
 * @param {*} savedParam 
 * @returns 
 */
 function getParamObj(userParam,savedParam) {
    userParam = JSON.parse(savedParam);
    userParam=verifyParam(userParam);

    //Only call the split method if the string is not empty.
    if (userParam.customersAndSuppliers.xmlColumnsName)
        userParam.customersAndSuppliers.xmlColumnsName = userParam.customersAndSuppliers.xmlColumnsName.split(";");

    return userParam;
}

function getCutAndSupTable(report, type, userParam) {
    var cutAndSupTable = report.addTable('cutAndSupTable');
    //title table
    cutAndSupTable.getCaption().addText(type);
    //columns
    cutAndSupTable.addColumn("Account").setStyleAttributes("width%", "tableHeaders");
    cutAndSupTable.addColumn("Customer").setStyleAttributes("width:20%", "tableHeaders");
    cutAndSupTable.addColumn("Organisation").setStyleAttributes("width:20%", "tableHeaders");
    cutAndSupTable.addColumn("Phone Numbers").setStyleAttributes("width:25%", "tableHeaders");
    cutAndSupTable.addColumn("Email").setStyleAttributes("width:20%", "tableHeaders");
    cutAndSupTable.addColumn("Address").setStyleAttributes("width:50%", "tableHeaders");
    cutAndSupTable.addColumn("Country").setStyleAttributes("width:20%", "tableHeaders");
    for (var i = 0; i < userParam.customersAndSuppliers.xmlColumnsName.length; i++) {
        cutAndSupTable.addColumn(userParam.customersAndSuppliers.xmlColumnsName[i]).setStyleAttributes("width:15%", "tableHeaders");
    }

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
    //add the additional columns inserted by the user in the settings dialog
    for (var i = 0; i < userParam.customersAndSuppliers.xmlColumnsName.length; i++) {
        tableRow.addCell(userParam.customersAndSuppliers.xmlColumnsName[i], "tableHeaders");
    }


    return cutAndSupTable;
}


//Function that creates and prints the report
function printReport(banDoc, userParam) {

    //Add a name to the report
    var report = Banana.Report.newReport("Customers and Suppliers");

    //Add a title
    addHeader(report,banDoc);

    //Create a table for the report
    var customersTable = getCutAndSupTable(report, "Customers", userParam);
    report.addPageBreak();
    var suppliersTable = getCutAndSupTable(report, "Suppliers", userParam);

    /* 1. Print the Jorunal with the totals */
    printTables(customersTable, suppliersTable, banDoc, userParam);

    //Add a footer to the report
    addFooter(report);

    return report;
}

function printTables(customersTable, suppliersTable, banDoc, userParam) {

    var customersData = getCustAndSup("1", "01", banDoc, userParam);
    var suppliersData = getCustAndSup("2", "02", banDoc, userParam);


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
        //add the additional columns inserted by the user in the settings dialog
        for (var i = 0; i < userParam.customersAndSuppliers.xmlColumnsName.length; i++) {
            tableRow.addCell(customer[userParam.customersAndSuppliers.xmlColumnsName[i]], "centredStyle");
        }

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
        //add the additional columns inserted by the user in the settings dialog
        for (var i = 0; i < userParam.customersAndSuppliers.xmlColumnsName.length; i++) {
            tableRow.addCell(supplier[userParam.customersAndSuppliers.xmlColumnsName[i]], "centredStyle");
        }
    }


}

//Function that load the jorunal rows
function getCustAndSup(bClass, section, banDoc, userParam) {

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
    var accountsTab = banDoc.table("Accounts");

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
            cutsup.email = email;

            var phone = "";
            if (phoneMain)
                phone += "Phone: " + phoneMain;
            if (phoneMobile)
                phone += "\n" + "Mobile: " + phoneMobile;
            cutsup.phone = phone;

            //we save also the values of additional columns
            for (var j = 0; j < userParam.customersAndSuppliers.xmlColumnsName.length; j++) {
                var index = userParam.customersAndSuppliers.xmlColumnsName[j];
                cutsup[index] = tRow.value(userParam.customersAndSuppliers.xmlColumnsName[j]);
            }

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
    var versionLine = report.getFooter().addText(d + " - Customers and Suppliers - Page ", "description").excludeFromTest();
    report.getFooter().addFieldPageNr();
}

function addHeader(report, banDoc) {
    docInfo = getDocumentInfo(banDoc);

    //initialize values
    company="";
    address="";
    zip="";
    city="";
    vatNumber="";

    //give them a value, if it is present
    if(docInfo.company)
        company=docInfo.company;
    if(docInfo.address)
        address=docInfo.address;
    if(docInfo.zip)
        zip=docInfo.zip;
    if(docInfo.city)
        city=docInfo.city;
    if(docInfo.vatNumber)
        vatNumber=docInfo.vatNumber;

    var headerParagraph = report.getHeader().addSection("headerStyle");
    headerParagraph.addParagraph("Customers and Suppliers", "heading1");
    headerParagraph.addParagraph("", "");
    headerParagraph.addParagraph(company, "");
    headerParagraph.addParagraph(address, "");
    headerParagraph.addParagraph(zip + " " + city, "");
    headerParagraph.addParagraph(vatNumber, "");
    headerParagraph.addParagraph("", "");
    headerParagraph.addParagraph("", "");
    headerParagraph.addParagraph("", "");
}

/**
 * return the document info
 * @returns 
 */
function getDocumentInfo(banDoc) {

    var documentInfo = {};
    documentInfo.company = "";
    documentInfo.address = "";
    documentInfo.zip = "";
    documentInfo.city = "";
    documentInfo.vatNumber = "";


    if (banDoc) {
        if (banDoc.info("AccountingDataBase", "Company"));
        documentInfo.company = banDoc.info("AccountingDataBase", "Company");
        if (banDoc.info("AccountingDataBase", "Address1"))
            documentInfo.address = banDoc.info("AccountingDataBase", "Address1");
        if (banDoc.info("AccountingDataBase", "Zip"))
            documentInfo.zip = banDoc.info("AccountingDataBase", "Zip");
        if (banDoc.info("AccountingDataBase", "City"))
            documentInfo.city = banDoc.info("AccountingDataBase", "City");
        if (banDoc.info("AccountingDataBase", "VatNumber"))
            documentInfo.vatNumber = banDoc.info("AccountingDataBase", "VatNumber");
    }

    return documentInfo;
}


/**
 * Defines the style for the report
 * @returns 
 */
function getReportStyle() {
    var textCSS = "";
    var file = Banana.IO.getLocalFile("file:script/ch.banana.audit.report.css");
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