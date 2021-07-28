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
// @id = ch.banana.uni.timesheetreports.js
// @api = 1.0
// @pubdate = 2021-07-28
// @publisher = Banana.ch SA
// @description = Time Sheet Projects
// @description.it = Foglio Ore Progetti
// @description.fr = Time Sheet Projets
// @description.de = Zeiterfassung Projekte
// @description.en = Timesheet Projects
// @description.nl = Timesheet Projecten
// @task = app.command
// @doctype = 400.*
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @timeout = -1


/* 
	Print a summary of the timesheet report
*/


function exec() {
    if (!Banana.document) {
        return;
    }   

    var isCurrentBananaVersionSupported = bananaRequiredVersion("10.0");
    if (!isCurrentBananaVersionSupported) {
        Banana.document.addMessage("This extension requires Banana Accounting+ Professional", "ID_ERR_VERSION_NOTSUPPORTED");
        return;
    }    

    var userParam = initUserParam();
        
    // Retrieve saved param
    var savedParam = Banana.document.getScriptSettings();
    if (savedParam && savedParam.length > 0) {
        userParam = JSON.parse(savedParam);
    }
    // If needed show the settings dialog to the user
    if (!options || !options.useLastSettings) {
        userParam = settingsDialog(); // From properties
    }
    if (!userParam) {
        return "@Cancel";
    }

    var report = printTimeSheetJournal(Banana.document, userParam);
    var stylesheet = createStyleSheet();
    Banana.Report.preview(report, stylesheet);
}

/**
function getJounralDateMin(banDoc) {
    var dateMin;
    var journalTable = banDoc.table("Journal");
    for (var j = 0; j < journalTable.rowCount; j++) {
        var tRow = journalTable.row(j);
        if (!tRow.value('Section') && tRow.value('Date')) { // do not take system rows (carry forward, start, total, balanc
            var cdate = tRow.value('Date');
            if (cdate < dateMin || !dateMin) {
                dateMin = cdate;
            }
        }
    }
    return Banana.Converter.toDate(dateMin);
}
*/

function printTimeSheetJournal(banDoc, userParam) {

    var lang = 'en';
    if (banDoc.locale) {
        lang = banDoc.locale;
    }
    if (lang.length > 2) {
        lang = lang.substr(0, 2);
    }
    var texts = setTexts(lang);

    var report = Banana.Report.newReport('Timesheet Report');
    printHeader(report, userParam);
    
    printTableMonth(banDoc, texts, userParam, report);
    printFooter(report);

    return report;
}

function printHeader(report, userParam) {
    var headerLogoSection = report.getHeader().addSection();

    if (userParam.logo_print) {
        headerLogoSection = report.addSection("");
        var logoFormat = Banana.Report.logoFormat(userParam.logo_name); //Logo
        if (logoFormat) {
            var style = Banana.Report.newStyleSheet();
            var logoElement = logoFormat.createDocNode(headerLogoSection, style, "logo");
            report.getHeader().addChild(logoElement);
        } else {
            report.addImage("documents:logo", "logoStyle"); 
        }
    } else {
        report.addImage("documents:logo", "logoStyle");
    }

    var table = report.addTable("tableNoBorder");
    tableRow = table.addRow();
    tableRow.addCell("", "", 20);
    tableRow = table.addRow();
    tableRow.addCell("", "", 20);
    tableRow = table.addRow();
    tableRow.addCell("", "", 20);

    var table = report.addTable("tableNoBorder");
    tableRow = table.addRow();
   tableRow.addCell("Timesheet", "bold", 4).setStyleAttributes("border-left: 2px solid blue; border-bottom: 1px solid blue");
   tableRow.addCell(formatDate(Banana.Converter.toDate(userParam.selectionStartDate)) + " - " + formatDate(Banana.Converter.toDate(userParam.selectionEndDate)), "", 16).setStyleAttributes("border-bottom: 1px solid blue; padding-bottom: 2px");

   tableRow = table.addRow();
   tableRow.addCell("", "", 20);

   tableRow = table.addRow();
   tableRow.addCell("Call ID", "", 4).setStyleAttributes("border-left: 1.5px solid grey;color: grey; border-bottom: thin solid grey");
   tableRow.addCell(userParam.call_id, "bold", 4).setStyleAttributes("background-color: #e6ecf5; border: thin solid grey");
   tableRow.addCell("", "", 8);
   tableRow.addCell("State", "", 4).setStyleAttributes("border-left: 1.5px solid grey;color: grey; border-bottom: thin solid grey");

   var table = report.addTable("tableNoBorder");

   var today = new Date();
   tableRow = table.addRow();
   tableRow.addCell("Date", "", 4).setStyleAttributes("border-left: 1.5px solid grey;color: grey; border-bottom: thin solid grey");
   tableRow.addCell(formatDate(today), "", 4).setStyleAttributes("background-color: #e6ecf5; border: thin solid grey");
   tableRow.addCell("", "", 8);
   tableRow.addCell("", "", 4).setStyleAttributes("background-color: #e6ecf5; border: 1px solid grey");

   var table = report.addTable("tableNoBorder");

   tableRow = table.addRow();
   tableRow.addCell("Responsible Employee", "", 4).setStyleAttributes("border-left: 1.5px solid grey;color: grey; border-bottom: thin solid grey");
   tableRow.addCell(userParam.responsibleEmployee, "", 9).setStyleAttributes("background-color: #e6ecf5; border: thin solid grey");
   tableRow.addCell("", "", 7);

   var table = report.addTable("tableNoBorder");

   tableRow = table.addRow();
   tableRow.addCell("Customer ID", "", 4).setStyleAttributes("border-left: 1.5px solid grey;color: grey; border-bottom: thin solid grey");
   tableRow.addCell(userParam.customer_id, "", 4).setStyleAttributes("background-color: #e6ecf5; border: thin solid grey");
   tableRow.addCell("", "", 8);
   tableRow.addCell("Call Character", "", 4).setStyleAttributes("border-left: 1.5px solid grey;color: grey; border-bottom: thin solid grey");

   var table = report.addTable("tableNoBorder");

   tableRow = table.addRow();
   tableRow.addCell("Name", "", 4).setStyleAttributes("border-left: 1.5px solid grey;color: grey; border-bottom: thin solid grey");
   tableRow.addCell(userParam.name, "", 9).setStyleAttributes("background-color: #e6ecf5; border: thin solid grey");
   tableRow.addCell("", "", 3);
   tableRow.addCell("", "", 4).setStyleAttributes("background-color: #e6ecf5; border: thin solid grey");

   var table = report.addTable("tableNoBorder");

   tableRow = table.addRow();
   tableRow.addCell("Contact Person", "", 4).setStyleAttributes("border-left: 1.5px solid grey;color: grey; border-bottom: thin solid grey");
   tableRow.addCell(userParam.contactPerson, "", 9).setStyleAttributes("background-color: #e6ecf5; border: thin solid grey");
   tableRow.addCell("", "", 7);

   var table = report.addTable("tableNoBorder");

   tableRow = table.addRow();
   tableRow.addCell("Change request Task", "", 4).setStyleAttributes("border-left: 1.5px solid grey;color: grey; border-bottom: thin solid grey");
   tableRow.addCell(userParam.changeRequestTask, "", 16).setStyleAttributes("background-color: #e6ecf5; border: thin solid grey");

   var table = report.addTable("tableNoBorder");

   tableRow = table.addRow();
   tableRow.addCell("PSP/Int. Ord./PO", "", 4).setStyleAttributes("border-left: 1.5px solid grey; color: grey; border-bottom: thin solid grey");
   tableRow.addCell(userParam.psp, "", 16).setStyleAttributes("background-color: #e6ecf5; border: thin solid grey");  

   var table = report.addTable("tableNoBorder");

   tableRow = table.addRow();
   tableRow.addCell("Project ID", "", 4).setStyleAttributes("border-left: 1.5px solid grey; color: grey; border-bottom: thin solid grey");
   tableRow.addCell(userParam.filterProjectId, "", 6).setStyleAttributes("background-color: #e6ecf5; border: thin solid grey");
   tableRow.addCell("Resource ID", "", 4).setStyleAttributes("color: grey; border-bottom: thin solid grey");
   tableRow.addCell(userParam.filterRessourceId, "", 6).setStyleAttributes("background-color: #e6ecf5; border: thin solid grey");
}

function printFooter(report) {
    report.getFooter().addClass("footer");
    report.getFooter().addText("-", "");
    report.getFooter().addFieldPageNr();
    report.getFooter().addText("-", "");
}

function getTimesheetJournal(banDoc, startDate, endDate) {
    var journalTable = banDoc.table("Journal");
    var timesheetRows = [];
    for (var j = 0; j < journalTable.rowCount; j++) {
        var line = {};
        var tRow = journalTable.row(j);
        if (!tRow.value('Section') && tRow.value('Date') >= startDate && tRow.value('Date') <= endDate) {
            line.date = tRow.value("Date");
            line.resource = tRow.value("ResourcesDescription");
            line.notes = tRow.value("Notes");
            line.duration = tRow.value("TimeDayTotal");
            line.billable = tRow.value("TimeDueDay");
            line.projectid = tRow.value("ProjectsId");
            line.resourceid = tRow.value("ResourcesId");
            timesheetRows.push(line);
        }
    }
    return timesheetRows;
}

function printTableMonth(banDoc, texts, userParam, report) {
    

    var table = report.addTable("tableNoBorder");
    tableRow = table.addRow();
    tableRow.addCell("", "", 20);

    tableRow = table.addRow();
    tableRow.addCell("", "", 20);

    tableRow = table.addRow();
    tableRow.addCell("", "", 20);

    table = styleTable(report, "table");
    tableRow = table.addRow();
    tableRow.addCell("Service rendered", "bold", 20).setStyleAttributes("background-color: #f8fafc");

    tableRow = table.addRow();
    tableRow.addCell("Date", "", 2).setStyleAttributes("background-color: #e6ecf5");
    tableRow.addCell("Ressource", "", 3).setStyleAttributes("background-color: #e6ecf5");
    tableRow.addCell("Remarks", "", 11).setStyleAttributes("background-color: #e6ecf5");
    tableRow.addCell("Duration (h)", "right", 2).setStyleAttributes("background-color: #e6ecf5");
    tableRow.addCell("Billable (h)", "right", 2).setStyleAttributes("background-color: #e6ecf5");

    // Get rows from timesheet journal for selected period
    var rows = getTimesheetJournal(banDoc, userParam.selectionStartDate, userParam.selectionEndDate);

    var totalDuration = 0;
    var totalBillable = 0;

    for (var i = 0; i < rows.length; i++) {
        // Print only the rows with non empty resources
        if (rows[i].resource) {
            tableRow = table.addRow();
            if (!userParam.filterProjectId && !userParam.filterRessourceId) {
                tableRow.addCell(formatDateNoFullYear(Banana.Converter.toDate(rows[i].date)), "", 2);
                tableRow.addCell(rows[i].resource, "", 3);
                tableRow.addCell(rows[i].notes, "", 11);
                tableRow.addCell(convertToHourDecimals(rows[i].duration), "right", 2);
                tableRow.addCell(convertToHourDecimals(rows[i].billable), "right", 2);
                totalDuration += parseFloat(convertToHourDecimals(rows[i].duration ? rows[i].duration : '0.0'));
                totalBillable += parseFloat(convertToHourDecimals(rows[i].billable ? rows[i].billable : '0.0'));
            } else {
                if (userParam.filterProjectId && (userParam.filterProjectId === rows[i].projectid)) {
                    tableRow.addCell(formatDateNoFullYear(Banana.Converter.toDate(rows[i].date)), "", 2);
                    tableRow.addCell(rows[i].resource, "", 3);
                    tableRow.addCell(rows[i].notes, "", 11);
                    tableRow.addCell(convertToHourDecimals(rows[i].duration), "right", 2);
                    tableRow.addCell(convertToHourDecimals(rows[i].billable), "right", 2);
                    totalDuration += parseFloat(convertToHourDecimals(rows[i].duration ? rows[i].duration : '0.0'));
                    totalBillable += parseFloat(convertToHourDecimals(rows[i].billable ? rows[i].billable : '0.0'));
                }
                if (userParam.filterRessourceId && (userParam.filterRessourceId === rows[i].resourceid)) {
                    tableRow.addCell(formatDateNoFullYear(Banana.Converter.toDate(rows[i].date)), "", 2);
                    tableRow.addCell(rows[i].resource, "", 3);
                    tableRow.addCell(rows[i].notes, "", 11);
                    tableRow.addCell(convertToHourDecimals(rows[i].duration), "right", 2);
                    tableRow.addCell(convertToHourDecimals(rows[i].billable), "right", 2);
                    totalDuration += parseFloat(convertToHourDecimals(rows[i].duration ? rows[i].duration : '0.0'));
                    totalBillable += parseFloat(convertToHourDecimals(rows[i].billable ? rows[i].billable : '0.0'));
                }
            }
        }   
    }

    table = styleTable(report, "tableNoBorder");
    tableRow = table.addRow();

    tableRow.addCell("Total Efforts", "bold", 3).setStyleAttributes("border-top: 0.5px solid black; background-color: #6495ed");
    tableRow.addCell("", "", 2).setStyleAttributes("border-top: 0.5px solid black; background-color: #6495ed");
    tableRow.addCell("", "", 11).setStyleAttributes("border-top: 0.5px solid black; background-color: #6495ed");
    tableRow.addCell(totalDuration, "right", 2).setStyleAttributes("font-weight: bold; border-top: 0.5px solid black; background-color: #6495ed");
    tableRow.addCell(totalBillable, "right", 2).setStyleAttributes("font-weight: bold; border-top: 0.5px solid black; background-color: #6495ed");

    tableRow = table.addRow();
    tableRow.addCell("", "", 20);

    table = styleTable(report, "table");
    tableRow = table.addRow();
    tableRow.addCell("Expendable Items / Spare Parts", "bold", 20).setStyleAttributes("background-color: #f8fafc; padding-top: 3px; padding-bottom: 3px");

    tableRow = table.addRow();
    tableRow.addCell("Item Number", "", 2).setStyleAttributes("background-color: #e6ecf5");
    tableRow.addCell("Description", "", 16).setStyleAttributes("background-color: #e6ecf5");
    tableRow.addCell("Amount", "right", 2).setStyleAttributes("background-color: #e6ecf5");

    tableRow = table.addRow();
    tableRow.addCell("", "", 2);
    tableRow.addCell("", "", 16);
    tableRow.addCell("", "right", 2);

    table = styleTable(report, "tableNoBorder");
    tableRow = table.addRow();

    tableRow.addCell("Supplier Representative", "", 4).setStyleAttributes("padding-top: 3px; padding-bottom: 3px");
    tableRow.addCell("", "", 9).setStyleAttributes("padding-top: 3px; padding-bottom: 3px");
    tableRow.addCell("Project Manager", "", 7).setStyleAttributes("padding-top: 3px; padding-bottom: 3px");

    tableRow = table.addRow();
    tableRow.addCell("Date", "", 3);
    tableRow.addCell("Signature", "", 10);
    tableRow.addCell("Date", "", 3);
    tableRow.addCell("Signature", "", 4);

    tableRow = table.addRow();
    tableRow.addParagraph(' ');

    tableRow = table.addRow();
    tableRow.addParagraph(' ');
    tableRow = table.addRow();
    tableRow.addParagraph(' ');
    tableRow = table.addRow();
    tableRow.addParagraph(' ');

    tableRow = table.addRow();
    tableRow.addCell("", "", 7).setStyleAttributes("border-bottom: thin dotted black");
    tableRow.addCell("", "", 6);
    tableRow.addCell("", "", 7).setStyleAttributes("border-bottom: thin dotted black");
}

function printTableTotal(texts, userParam, columns, totals, report, month, year) {
    report.addParagraph(texts.decimalValues,'');
    report.addParagraph(texts.totalYear + ": " + year);
    
    var table = report.addTable("table02");
    var col1 = table.addColumn("coltot1");
    var col2 = table.addColumn("coltot2");
    tableRow = table.addRow();

    /* Columns titles */
    tableRow.addCell(texts.element, 'header', 1);
    tableRow.addCell(texts.total, 'header', 1);
    for (c = 0; c < columns.length; c++) {
        tableRow = table.addRow();
        columnName = columns[c];

        var colText = "";
        if (columnName === "TimeWorkedTotal") {
            colText = texts.param_timeWorkedTotal;
        }
        else if (columnName === "TimeAbsenceSick") {
            colText = texts.param_timeAbsenceSick;
        }
        else if (columnName === "TimeAbsenceHoliday") {
            colText = texts.param_timeAbsenceHoliday;
        }
        else if (columnName === "TimeAbsenceService") {
            colText = texts.param_timeAbsenceService;
        }
        else if (columnName === "TimeAbsenceOther") {
            colText = texts.param_timeAbsenceOther;
        }
        else if (columnName === "TimeAbsenceTotal") {
            colText = texts.param_timeAbsenceTotal;
        }
        else if (columnName === "TimeAdjustment") {
            colText = texts.param_timeAdjustment;
        }
        else if (columnName === "TimeDayTotal") {
            colText = texts.param_timeDayTotal;
        }
        else if (columnName === "TimeDueDay") {
            colText = texts.param_timeDueDay;
        }
        else if (columnName === "TimeDifference") {
            colText = texts.param_timeDifference;
        }
        else {
            colText = columnName
        }

        tableRow.addCell(colText);

        value = convertToHourDecimals(Number(totals[month][columnName]["TotalMonth"]));
        //value = convertToHoursMinutes(Number(totals[month][columnName]["TotalMonth"]));
        tableRow.addCell(value, "right");
    }
}
// Month here is 1-indexed (January is 1, February is 2, etc). This is
// because we're using 0 as the day so that it returns the last day
// of the last month, so you have to add 1 to the month number 
// so it returns the correct amount of days
function daysInMonth(month, year) {
    return new Date(year, month, 0).getDate();
}

/***********************
* UTILITIES 
***********************/
function convertToHourDecimals(time) {
    if (time) {
        var timeHoursMinutes = time.split(':');
        var hours = parseInt(timeHoursMinutes[0], 10);
        var minutes = timeHoursMinutes[1] ? parseInt(timeHoursMinutes[1], 10) : 0;
        return (hours + minutes / 60).toFixed(2);
    }
}

function convertToHoursMinutes(seconds) {
    if (!seconds) {
        return;
    }
    negative = (seconds < 0);
    seconds = Math.abs(seconds);
    var hours = Math.floor(seconds / 3600);
    reminder = seconds % 3600;
    var min = Math.floor(reminder / 60);
    if (min < 10) {
        min = "0" + min;
    }
    reminder = reminder % 60;
    value = hours + ":" + min;
    if (negative) {
        value = "-" + value;
    }
    return value;

}

function getMonthText(month) {
    var monthText = "";
    switch (month) {
        case 1:
            monthText = "jan";
            break;
        case 2:
            monthText = "feb";
            break;
        case 3:
            monthText = "mar";
            break;
        case 4:
            monthText = "apr";
            break;
        case 5:
            monthText = "may";
            break;
        case 6:
            monthText = "jun";
            break;
        case 7:
            monthText = "jul";
            break;
        case 8:
            monthText = "aug";
            break;
        case 9:
            monthText = "sep";
            break;
        case 10:
            monthText = "oct";
            break;
        case 11:
            monthText = "nov";
            break;
        case 12:
            monthText = "dec";
    }
    return monthText;
}

function formatDate(date) {
    month = '' + (date.getMonth() + 1);
        day = '' + date.getDate();
        year = date.getFullYear();
 
    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;
 
    return [day, month, year].join('/');
 }

 function formatDateNoFullYear(date) {
    month = '' + (date.getMonth() + 1);
        day = '' + date.getDate();
        year = date.getFullYear();
        year = year - 2000;
 
    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;
 
    return [day, month, year].join('/');
 }


 function bananaRequiredVersion(requiredVersion) {
    if (Banana.compareVersion && Banana.compareVersion(Banana.application.version, requiredVersion) >= 0) {
        if (Banana.application.license) {
            if (Banana.application.license.licenseType === "professional" || Banana.application.license.licenseType === "advanced") {
                return true;
            }
        }
    }
    return false;
}

/***********************
* MANAGE USER PARAMETERS 
***********************/
function convertParam(userParam) {

    var lang = 'en';
    if (Banana.document.locale) {
        lang = Banana.document.locale;
    }
    if (lang.length > 2) {
        lang = lang.substr(0, 2);
    }
    var texts = setTexts(lang);

    var convertedParam = {};
    convertedParam.version = '1.0';
    convertedParam.data = [];

    // var currentParam = {};
    // currentParam.name = 'include';
    // currentParam.title = texts.param_include;
    // currentParam.type = 'string';
    // currentParam.value = '';
    // currentParam.editable = false;
    // currentParam.readValue = function() {
    //     userParam.include = this.value;
    // }
    // convertedParam.data.push(currentParam);

    // currentParam = {};
    // currentParam.name = 'header_include';
    // currentParam.parentObject = 'include';
    // currentParam.title = texts.param_header_include;
    // currentParam.type = 'string';
    // currentParam.value = '';
    // currentParam.editable = false;
    // currentParam.readValue = function() {
    //     userParam.header_include = this.value;
    // }
    // convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'logo_print';
    // currentParam.parentObject = 'header_include';
    currentParam.title = texts.param_logo_print;
    currentParam.type = 'bool';
    currentParam.value = userParam.logo_print ? true : false;
    currentParam.defaultvalue = false;
    currentParam.tooltip = texts.param_tooltip_logo_print;
    currentParam.readValue = function() {
        userParam.logo_print = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'logo_name';
    // currentParam.parentObject = 'header_include';
    currentParam.title = texts.param_logo_name;
    currentParam.type = 'string';
    currentParam.value = userParam.logo_name ? userParam.logo_name : '';
    currentParam.defaultvalue = "Logo";
    currentParam.tooltip = texts.param_tooltip_logo_name;
    currentParam.readValue = function() {
        userParam.logo_name = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.name = 'call_id';
    currentParam.title = texts.param_call_id;
    currentParam.type = 'string';
    currentParam.value = userParam.call_id ? userParam.call_id : "";
    currentParam.defaultvalue = "";
    currentParam.readValue = function () {
        userParam.call_id = this.value;
    }
    convertedParam.data.push(currentParam);  

    var currentParam = {};
    currentParam.name = 'responsible_employee';
    currentParam.title = texts.param_responsibleEmployee;
    currentParam.type = 'string';
    currentParam.value = userParam.responsibleEmployee ? userParam.responsibleEmployee : "";
    currentParam.defaultvalue = "";
    currentParam.readValue = function () {
        userParam.responsibleEmployee = this.value;
    }
    convertedParam.data.push(currentParam);  

    var currentParam = {};
    currentParam.name = 'customer_id';
    currentParam.title = texts.param_customer_id;
    currentParam.type = 'string';
    currentParam.value = userParam.customer_id ? userParam.customer_id : "";
    currentParam.defaultvalue = "";
    currentParam.readValue = function () {
        userParam.customer_id = this.value;
    }
    convertedParam.data.push(currentParam);    

    var currentParam = {};
    currentParam.name = 'name';
    currentParam.title = texts.param_name;
    currentParam.type = 'string';
    currentParam.value = userParam.name ? userParam.name : "";
    currentParam.defaultvalue = "";
    currentParam.readValue = function () {
        userParam.name = this.value;
    }
    convertedParam.data.push(currentParam);   

    var currentParam = {};
    currentParam.name = 'contact_person';
    currentParam.title = texts.param_contactPerson;
    currentParam.type = 'string';
    currentParam.value = userParam.contactPerson ? userParam.contactPerson : "";
    currentParam.defaultvalue = "";
    currentParam.readValue = function () {
        userParam.contactPerson = this.value;
    }
    convertedParam.data.push(currentParam);   

    var currentParam = {};
    currentParam.name = 'change_request_task';
    currentParam.title = texts.param_changeRequestTask;
    currentParam.type = 'string';
    currentParam.value = userParam.changeRequestTask ? userParam.changeRequestTask : "";
    currentParam.defaultvalue = "";
    currentParam.readValue = function () {
        userParam.changeRequestTask = this.value;
    }
    convertedParam.data.push(currentParam);   

    var currentParam = {};
    currentParam.name = 'psp';
    currentParam.title = texts.param_psp;
    currentParam.type = 'string';
    currentParam.value = userParam.psp ? userParam.psp : "";
    currentParam.defaultvalue = "";
    currentParam.readValue = function () {
        userParam.psp = this.value;
    }
    convertedParam.data.push(currentParam);      

    var currentParam = {};
    currentParam.name = 'filter';
    currentParam.title = 'Filter';
    currentParam.editable = false;
    convertedParam.data.push(currentParam);
    
    var currentParam = {};
    currentParam.name = 'filterProjectId';
    currentParam.title = 'Project ID';
    currentParam.parentObject = 'filter';
    currentParam.type = 'string';
    currentParam.value = userParam.filterProjectId ? userParam.filterProjectId : "";
    currentParam.readValue = function () {
        userParam.filterProjectId = this.value;
    }
    convertedParam.data.push(currentParam);      
    
    var currentParam = {};
    currentParam.name = 'filterRessourceId';
    currentParam.title = 'Ressource ID';
    currentParam.parentObject = 'filter';
    currentParam.type = 'string';
    currentParam.value = userParam.filterRessourceId ? userParam.filterRessourceId : "";
    currentParam.readValue = function () {
    userParam.filterRessourceId = this.value;
    }
    convertedParam.data.push(currentParam);

    return convertedParam;
}

function initUserParam() {
    var userParam = {};
    
    var lang = 'en';
    if (Banana.document.locale) {
        lang = Banana.document.locale;
    }
    if (lang.length > 2) {
        lang = lang.substr(0, 2);
    }
    var texts = setTexts(lang);

    userParam.id_employee = "";
    userParam.logo_print = true;
    userParam.logo_name = 'Logo';
    userParam.call_id = "";
    userParam.responsibleEmployee = "";
    userParam.customer_id = "";
    userParam.name = "";
    userParam.contactPerson = "";
    userParam.changeRequestTask = "";
    userParam.psp = "";
    userParam.filterProjectId="";
    userParam.filterRessourceId="";
    return userParam;
}

function parametersDialog(userParam) {

    if (typeof (Banana.Ui.openPropertyEditor) !== 'undefined') {
        var dialogTitle = "";
        var convertedParam = convertParam(userParam);
        var pageAnchor = 'dlgSettings';
        if (!Banana.Ui.openPropertyEditor(dialogTitle, convertedParam, pageAnchor)) {
            return null;
        }

        for (var i = 0; i < convertedParam.data.length; i++) {
            // Read values to userParam (through the readValue function)
            if (typeof (convertedParam.data[i].readValue) !== 'undefined') {
                convertedParam.data[i].readValue();
            }            
        }

        //  Reset reset default values
        userParam.useDefaultTexts = false;
    }

    return userParam;
}

function settingsDialog() {

    var scriptform = initUserParam();

    // Retrieve saved param
    var savedParam = Banana.document.getScriptSettings();
    if (savedParam && savedParam.length > 0) {
        scriptform = JSON.parse(savedParam);
    }

    //We take the accounting "starting date" and "ending date" from the document. These will be used as default dates
    var docStartDate = Banana.document.info("TimesheetDataBase","DateStart");
    var docEndDate = Banana.document.info("TimesheetDataBase","DateEnd");
    
    //A dialog window is opened asking the user to insert the desired period. By default is the accounting period
    var selectedDates = Banana.Ui.getPeriod("", docStartDate, docEndDate, 
        scriptform.selectionStartDate, scriptform.selectionEndDate, scriptform.selectionChecked);
        
    //We take the values entered by the user and save them as "new default" values.
    //This because the next time the script will be executed, the dialog window will contains the new values.
    if (selectedDates) {
        scriptform["selectionStartDate"] = selectedDates.startDate;
        scriptform["selectionEndDate"] = selectedDates.endDate;
        scriptform["selectionChecked"] = selectedDates.hasSelection;    
    } else {
        //User clicked cancel
        return null;
    }

    scriptform = parametersDialog(scriptform); // From propertiess
    if (scriptform) {
        var paramToString = JSON.stringify(scriptform);
        Banana.document.setScriptSettings(paramToString);
    }

    return scriptform;
}

/***********************
* TEXTS
***********************/
function setTexts(language) {

    var texts = {};

    if (language === 'it') {
        texts.period = "Periodo";
        texts.decimalValues = "Valori di tempo decimali";
        texts.month = "Mese";
        texts.totalYear = "Totale anno";
        texts.year = "Anno";
        texts.element = "Elemento";
        texts.total = "Totale";
        texts.param_id_employee = "ID sociale";
        texts.param_logo_print = "Logo";
        texts.param_logo_name = "Nom du logo (composition formats de logo)";
        texts.param_call_id = "Call ID";
        texts.param_responsibleEmployee = "Dipendente Responsabile";
        texts.param_customer_id = "Cliente ID";
        texts.param_name = "Name";
        texts.param_contactPerson = "Contact Person";
        texts.param_changeRequestTask = "Change request Task";
        texts.param_psp = "PSP/Int.Ord./PO";
    }
    else if (language === 'de') {
        texts.period = "Periode";
        texts.decimalValues = "Dezimale Zeitwerte";
        texts.month = "Monat";
        texts.totalYear = "Total Jahr";
        texts.year = "Jahr";
        texts.element = "Element";
        texts.total = "Total";
        texts.param_id_employee = "Sozialversicherungs-ID";
        texts.param_logo_print = "Logo";
        texts.param_logo_name = "Nom du logo (composition formats de logo)";
        texts.param_call_id = "Call ID";
        texts.param_responsibleEmployee = "Verantwortlicher Mitarbeiter";
        texts.param_customer_id = "Kundennummer";
        texts.param_name = "Name";
        texts.param_contactPerson = "Contact Person";
        texts.param_changeRequestTask = "Change request Task";
        texts.param_psp = "PSP/Int.Ord./PO";
    }
    else if (language === 'fr') {
        texts.period = "Période";
        texts.decimalValues = "Valeurs décimales du temps";
        texts.month = "Mois";
        texts.totalYear = "Total Année";
        texts.year = "Année";
        texts.element = "Élément";
        texts.total = "Total";
        texts.param_id_employee = "ID sécurité sociale";
        texts.param_logo_print = "Logo";
        texts.param_logo_name = "Nom du logo (composition formats de logo)";
        texts.param_call_id = "Call ID";
        texts.param_responsibleEmployee = "Employé Responsable";
        texts.param_customer_id = "Numéro Client";
        texts.param_name = "Nom";
        texts.param_contactPerson = "Contact Person";
        texts.param_changeRequestTask = "Change request Task";
        texts.param_psp = "PSP/Int.Ord./PO";
    }
    else if (language === 'nl') {
        texts.period = "Periode";
        texts.decimalValues = "Decimale tijdwaarden";
        texts.month = "Maand";
        texts.totalYear = "Totaal jaar";
        texts.year = "Jaar";
        texts.element = "Element";
        texts.total = "Totaal";
        texts.param_id_employee = "Burgerservicenummer";
        texts.param_logo_print = "Logo";
        texts.param_logo_name = "Nom du logo (composition formats de logo)";
        texts.param_call_id = "Call ID";
        texts.param_responsibleEmployee = "Verantwoordelijke Medewerker";
        texts.param_customer_id = "Klanten ID";
        texts.param_name = "Name";
        texts.param_contactPerson = "Contact Person";
        texts.param_changeRequestTask = "Change request Task";
        texts.param_psp = "PSP/Int.Ord./PO";
    }
    else {
        texts.period = "Period";
        texts.decimalValues = "Decimal time values";
        texts.month = "Month";
        texts.totalYear = "Total Year";
        texts.year = "Year";
        texts.element = "Element";
        texts.total = "Total";
        texts.param_id_employee = "Social security ID";
        texts.param_logo_print = "Logo";
        texts.param_logo_name = "Logo name (composition logo formats)";
        texts.param_call_id = "Call ID";
        texts.param_responsibleEmployee = "Responsible Employee";
        texts.param_customer_id = "Client ID";
        texts.param_name = "Name";
        texts.param_contactPerson = "Contact Person";
        texts.param_changeRequestTask = "Change request Task";
        texts.param_psp = "PSP/Int.Ord./PO";
    }

    return texts;
}

function styleTable(report, style) {
    var table = report.addTable(style);
    var col1 = table.addColumn("colTable1");
    col1.setStyleAttributes("width:5%");
    var col2 = table.addColumn("colTable2");
    col2.setStyleAttributes("width:5%");
    var col3 = table.addColumn("colTable3");
    col3.setStyleAttributes("width:5%");
    var col4 = table.addColumn("colTable4");
    col4.setStyleAttributes("width:5%");
    var col5 = table.addColumn("colTable5");
    col5.setStyleAttributes("width:5%");
    var col6 = table.addColumn("colTable6");
    col6.setStyleAttributes("width:5%");
    var col7 = table.addColumn("colTable7");
    col7.setStyleAttributes("width:5%");
    var col8 = table.addColumn("colTable8");
    col8.setStyleAttributes("width:5%");
    var col9 = table.addColumn("colTable9");
    col9.setStyleAttributes("width:5%");
    var col10 = table.addColumn("colTable10");
    col10.setStyleAttributes("width:5%");
    var col11 = table.addColumn("colTable11");
    col11.setStyleAttributes("width:5%");
    var col12 = table.addColumn("colTable12");
    col12.setStyleAttributes("width:5%");
    var col13 = table.addColumn("colTable13");
    col13.setStyleAttributes("width:5%");
    var col14 = table.addColumn("colTable14");
    col14.setStyleAttributes("width:5%");
    var col15 = table.addColumn("colTable15");
    col15.setStyleAttributes("width:5%");
    var col16 = table.addColumn("colTable16");
    col16.setStyleAttributes("width:5%");
    var col17 = table.addColumn("colTable17");
    col17.setStyleAttributes("width:5%");
    var col18 = table.addColumn("colTable18");
    col18.setStyleAttributes("width:5%");
    var col19 = table.addColumn("colTable19");
    col19.setStyleAttributes("width:5%");
    var col20 = table.addColumn("colTable20");
    col20.setStyleAttributes("width:5%");
    return table;
 }

/***********************
* STYLES
***********************/
function createStyleSheet(userParam) {
    var stylesheet = Banana.Report.newStyleSheet();

    var pageStyle = stylesheet.addStyle("@page");
    pageStyle.setAttribute("margin", "15mm 10mm 15mm 10mm");

    stylesheet.addStyle("body", "font-size: 7pt; font-family: Helvetica");
    stylesheet.addStyle(".bold", "font-weight:bold");
    stylesheet.addStyle(".right", "text-align:right");
    stylesheet.addStyle(".center", "text-align:center");
    stylesheet.addStyle(".header", "background-color:#F0F8FF");
    stylesheet.addStyle(".red", "color:red");
    stylesheet.addStyle(".blue", "color:blue");
    stylesheet.addStyle(".heading", "font-size:9pt");   
    stylesheet.addStyle(".footer", "text-align:center;");


    var tableStyle = stylesheet.addStyle(".table01");
    stylesheet.addStyle(".col1", "width:12%");
    stylesheet.addStyle(".col2").setAttribute("width-sym", "daycol");
    stylesheet.addStyle(".col3").setAttribute("width-sym", "daycol");
    stylesheet.addStyle(".col4").setAttribute("width-sym", "daycol");
    stylesheet.addStyle(".col5").setAttribute("width-sym", "daycol");
    stylesheet.addStyle(".col6").setAttribute("width-sym", "daycol");
    stylesheet.addStyle(".col7").setAttribute("width-sym", "daycol");
    stylesheet.addStyle(".col8").setAttribute("width-sym", "daycol");
    stylesheet.addStyle(".col9").setAttribute("width-sym", "daycol");
    stylesheet.addStyle(".col10").setAttribute("width-sym", "daycol");
    stylesheet.addStyle(".col11").setAttribute("width-sym", "daycol");
    stylesheet.addStyle(".col12").setAttribute("width-sym", "daycol");
    stylesheet.addStyle(".col13").setAttribute("width-sym", "daycol");
    stylesheet.addStyle(".col14").setAttribute("width-sym", "daycol");
    stylesheet.addStyle(".col15").setAttribute("width-sym", "daycol");
    stylesheet.addStyle(".col16").setAttribute("width-sym", "daycol");
    stylesheet.addStyle(".col17").setAttribute("width-sym", "daycol");
    stylesheet.addStyle(".col18").setAttribute("width-sym", "daycol");
    stylesheet.addStyle(".col19").setAttribute("width-sym", "daycol");
    stylesheet.addStyle(".col20").setAttribute("width-sym", "daycol");
    stylesheet.addStyle(".col21").setAttribute("width-sym", "daycol");
    stylesheet.addStyle(".col22").setAttribute("width-sym", "daycol");
    stylesheet.addStyle(".col23").setAttribute("width-sym", "daycol");
    stylesheet.addStyle(".col24").setAttribute("width-sym", "daycol");
    stylesheet.addStyle(".col25").setAttribute("width-sym", "daycol");
    stylesheet.addStyle(".col26").setAttribute("width-sym", "daycol");
    stylesheet.addStyle(".col27").setAttribute("width-sym", "daycol");
    stylesheet.addStyle(".col28").setAttribute("width-sym", "daycol");
    stylesheet.addStyle(".col29").setAttribute("width-sym", "daycol");
    stylesheet.addStyle(".col30").setAttribute("width-sym", "daycol");
    stylesheet.addStyle(".col31").setAttribute("width-sym", "daycol");
    stylesheet.addStyle(".col32").setAttribute("width-sym", "daycol");
    stylesheet.addStyle(".col33").setAttribute("width-sym", "totcol");
    tableStyle.setAttribute("width", "100%");
    stylesheet.addStyle("table.table01 td", "border:thin solid black;");

    var tableStyle = stylesheet.addStyle(".table");
    tableStyle.setAttribute("width", "100%");
    tableStyle.setAttribute("font-size", "8pt");
    stylesheet.addStyle(".colTable1", "");
    stylesheet.addStyle(".colTable2", "");
    stylesheet.addStyle(".colTable3", "");
    stylesheet.addStyle(".colTable4", "");
    stylesheet.addStyle(".colTable5", "");
    stylesheet.addStyle(".colTable6", "");
    stylesheet.addStyle(".colTable7", "");
    stylesheet.addStyle(".colTable8", "");
    stylesheet.addStyle(".colTable9", "");
    stylesheet.addStyle(".colTable10", "");
    stylesheet.addStyle(".colTable11", "");
    stylesheet.addStyle(".colTable12", "");
    stylesheet.addStyle(".colTable13", "");
    stylesheet.addStyle(".colTable14", "");
    stylesheet.addStyle(".colTable15", "");
    stylesheet.addStyle(".colTable16", "");
    stylesheet.addStyle(".colTable17", "");
    stylesheet.addStyle(".colTable18", "");
    stylesheet.addStyle(".colTable19", "");
    stylesheet.addStyle(".colTable20", "");
    stylesheet.addStyle("table.table td", "border:thin solid black");

    var tableStyle = stylesheet.addStyle(".tableNoBorder");
    tableStyle.setAttribute("width", "100%");
    tableStyle.setAttribute("font-size", "8pt");
    stylesheet.addStyle(".colTable1", "");
    stylesheet.addStyle(".colTable2", "");
    stylesheet.addStyle(".colTable3", "");
    stylesheet.addStyle(".colTable4", "");
    stylesheet.addStyle(".colTable5", "");
    stylesheet.addStyle(".colTable6", "");
    stylesheet.addStyle(".colTable7", "");
    stylesheet.addStyle(".colTable8", "");
    stylesheet.addStyle(".colTable9", "");
    stylesheet.addStyle(".colTable10", "");
    stylesheet.addStyle(".colTable11", "");
    stylesheet.addStyle(".colTable12", "");
    stylesheet.addStyle(".colTable13", "");
    stylesheet.addStyle(".colTable14", "");
    stylesheet.addStyle(".colTable15", "");
    stylesheet.addStyle(".colTable16", "");
    stylesheet.addStyle(".colTable17", "");
    stylesheet.addStyle(".colTable18", "");
    stylesheet.addStyle(".colTable19", "");
    stylesheet.addStyle(".colTable20", "");
    stylesheet.addStyle("table.tableNoBorder td", "");

    var table2Style = stylesheet.addStyle(".table02");
    stylesheet.addStyle(".coltot1", "width:12%");
    stylesheet.addStyle(".coltot2").setAttribute("width-sym", "totcol");
    tableStyle.setAttribute("width", "100%");
    stylesheet.addStyle("table.table02 td", "border:thin solid black;");

    return stylesheet;
}
