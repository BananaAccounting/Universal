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
// @id = ch.banana.uni.timesheet-daystable-report.js
// @api = 1.0
// @pubdate = 2020-04-08
// @publisher = Banana.ch SA
// @description = Time Sheet - monthly summary
// @description.it = Foglio Ore - Riepilogo Mensile
// @description.fr = Time Sheet - Résumé Mensuel
// @description.de = Zeiterfassung - Monatliche Zusammenfassung
// @description.en = Timesheet - Monthly Summary
// @description.nl = Timesheet - Maandelijks overzicht
// @task = app.command
// @doctype = 400.*
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @timeout = -1


/* 
    Print a summary of all the timesheetelement by month
*/


function exec() {
    if (!Banana.document) {
        return;
    }
    var userParam = initUserParam();
    // Columns choice only for 9.0.4 and higher
    // For previous versions we take all columns
    var isCurrentBananaVersionSupported = bananaRequiredVersion("9.0.4");
    if (isCurrentBananaVersionSupported) {
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
    }

    var columns = getColumns(userParam);
    //var dateMin = getJounralDateMin(Banana.document);
    //var year = dateMin.getFullYear();
    var year = Banana.Converter.toDate(userParam.selectionStartDate).getFullYear();
    var totals = totalizeHours(Banana.document, columns, year);
    var report = printTimeSheetJournal(Banana.document, userParam, columns, totals, year);
    var stylesheet = createStyleSheet();
    Banana.Report.preview(report, stylesheet);
}

// is in the formata -h:mm
// or format hh:mm:ss.mmm
function convertTimeToSeconds(t) {

    let s = 0;
    let m = 0;
    let h = 0;
    const st = String(t);
    if (st.indexOf(':') < 0) {
        // solo secondi old format
        return Number(t);
    }
    const parts = st.split(':');
    if (parts.length === 2) {
        h = Number(parts[0]);
        m = Number(parts[1]);
    }
    if (parts.length === 3) {
        h = Number(parts[0]);
        m = Number(parts[1]);
        s = Number(parts[2]);
    }
    s += m * 60 + h * 60 * 60;
    return s;
}

function getColumns(userParam) {
    var columns = [];
    if (userParam.print_timeWorkedTotal) {
        columns.push("TimeWorkedTotal");
    }
    if (userParam.print_timeAbsenceSick) {
        columns.push("TimeAbsenceSick");
    }
    if (userParam.print_timeAbsenceHoliday) {
        columns.push("TimeAbsenceHoliday");
    }
    if (userParam.print_timeAbsenceService) {
        columns.push("TimeAbsenceService");
    }
    if (userParam.print_timeAbsenceOther) {
        columns.push("TimeAbsenceOther");
    }
    if (userParam.print_timeAbsenceTotal) {
        columns.push("TimeAbsenceTotal");
    }
    if (userParam.print_timeAdjustment) {
        columns.push("TimeAdjustment");
    }
    if (userParam.print_timeDayTotal) {
        columns.push("TimeDayTotal");
    }
    if (userParam.print_timeDueDay) {
        columns.push("TimeDueDay");
    }
    if (userParam.print_timeDifference) {
        columns.push("TimeDifference");
    }
    return columns;
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

function totalizeHours(banDoc, columns, year) {
    // Create structure for totals
    // Month, column, day
    var months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 'TotalYear'];
    totals = {};
    for (m = 0; m < months.length; m++) {
        ml = months[m];
        totals[ml] = {};
        for (c = 0; c < columns.length; c++) {
            columnName = columns[c];
            //Banana.console.log(m + "; " + c + "; " + columnName);
            totals[ml][columnName] = {};
            totals[ml]['Festive'] = {};
            for (d = 1; d <= 31; d++) {
                totals[ml][columnName][d] = Number(0);
                totals[ml]["Festive"][d] = "";
            }
            totals[ml][columnName]['TotalMonth'] = 0;
        }
    }
    // Totalize
    var journalTable = banDoc.table("Journal");
    for (var j = 0; j < journalTable.rowCount; j++) {
        var tRow = journalTable.row(j);
        if (!tRow.value('Section') && tRow.value('Date')) { // do not take system rows (carry forward, start, total, balance)
            var date = Banana.Converter.toDate(tRow.value('Date'));
            var cday = date.getDate();
            var cmonth = date.getMonth() + 1;
            if (cmonth > 0 && cmonth <= 9) { // 1, 2, 3 => 01, 02, 03
                //cmonth = "0" + cmonth;
            }
            var cyear = date.getFullYear();
            if (cyear === year) {
                for (c = 0; c < columns.length; c++) {
                    columnName = columns[c];
                    let value = tRow.value(columnName);
                    value = convertTimeToSeconds(value);
                    totals[cmonth][columnName][cday] += value;
                    totals['TotalYear'][columnName][cday] += value;
                }
                totals[cmonth]["Festive"][cday] = tRow.value('TimeDayType');
            }
        }
    }
    // Total month
    for (m = 0; m < months.length; m++) {
        ml = months[m];
        for (c = 0; c < columns.length; c++) {
            var totMonth = 0;
            columnName = columns[c];
            for (d = 1; d <= 31; d++) {
                totMonth += Number(totals[ml][columnName][d]);
            }
            //Banana.application.addMessage( m + "; " + columnName + "; " + totMonth);
            //Banana.console.debug( m + "; " + columnName + "; " + totMonth);

            totals[ml][columnName]['TotalMonth'] = totMonth;
        }
    }
    return totals;
}

function printTimeSheetJournal(banDoc, userParam, columns, totals, year) {

    var lang = 'en';
    if (banDoc.locale) {
        lang = banDoc.locale;
    }
    if (lang.length > 2) {
        lang = lang.substr(0, 2);
    }
    var texts = setTexts(lang);

    var monthStartDate = Banana.Converter.toDate(userParam.selectionStartDate).getMonth() + 1; //getMonth() returns 0 to 11
    var monthEndDate = Banana.Converter.toDate(userParam.selectionEndDate).getMonth() + 1;

    var report = Banana.Report.newReport('Timesheet Journal Table');
    printHeader(banDoc, report, userParam, texts);
    for (var i = monthStartDate; i <= monthEndDate; i++) {
        printTableMonth(texts, userParam, columns, totals, report, i, year);
    }
    printTableTotal(texts, userParam, columns, totals, report, "TotalYear", year);
    printFooter(report);

    return report;
}

function printHeader(banDoc, report, userParam, texts) {
    var headerleft = banDoc.info("Base", "HeaderLeft");
    var pageHeader = report.getHeader();
    var paragraph = pageHeader.addParagraph("", "center");
    // paragraph.addText(headerleft, "bold");
    // paragraph.addText(" (", "");
    // if (userParam.id_employee) {
    //     paragraph.addText(userParam.id_employee + ", ", "");
    // }
    // paragraph.addText(texts.period + ": " + Banana.Converter.toLocaleDateFormat(userParam.selectionStartDate) + " - " + Banana.Converter.toLocaleDateFormat(userParam.selectionEndDate) + ")", "");
    pageHeader.addParagraph(headerleft, "heading bold");
    pageHeader.addParagraph(userParam.id_employee, "heading");
    pageHeader.addParagraph(texts.period + ": " + Banana.Converter.toLocaleDateFormat(userParam.selectionStartDate) + " - " + Banana.Converter.toLocaleDateFormat(userParam.selectionEndDate), "heading");
    pageHeader.addParagraph(" ", "");
    pageHeader.addParagraph(" ", "");
}

function printFooter(report) {
    report.getFooter().addClass("footer");
    report.getFooter().addText("-", "");
    report.getFooter().addFieldPageNr();
    report.getFooter().addText("-", "");
}

function printTableMonth(texts, userParam, columns, totals, report, month, year) {
    report.addParagraph(texts.decimalValues, '');
    report.addParagraph(texts.month + ": " + month + ", " + texts.year + ": " + year);

    var table = report.addTable("table01");
    var col1 = table.addColumn("col1");
    var col2 = table.addColumn("col2");
    var col3 = table.addColumn("col3");
    var col4 = table.addColumn("col4");
    var col5 = table.addColumn("col5");
    var col6 = table.addColumn("col6");
    var col7 = table.addColumn("col7");
    var col8 = table.addColumn("col8");
    var col9 = table.addColumn("col9");
    var col10 = table.addColumn("col10");
    var col11 = table.addColumn("col11");
    var col12 = table.addColumn("col12");
    var col13 = table.addColumn("col13");
    var col14 = table.addColumn("col14");
    var col15 = table.addColumn("col15");
    var col16 = table.addColumn("col16");
    var col17 = table.addColumn("col17");
    var col18 = table.addColumn("col18");
    var col19 = table.addColumn("col19");
    var col20 = table.addColumn("col20");
    var col21 = table.addColumn("col21");
    var col22 = table.addColumn("col22");
    var col23 = table.addColumn("col23");
    var col24 = table.addColumn("col24");
    var col25 = table.addColumn("col25");
    var col26 = table.addColumn("col26");
    var col27 = table.addColumn("col27");
    var col28 = table.addColumn("col28");
    var col29 = table.addColumn("col29");
    var col30 = table.addColumn("col30");
    var col31 = table.addColumn("col31");
    var col32 = table.addColumn("col32");
    var col33 = table.addColumn("col33");
    tableRow = table.addRow();

    /* Columns titles */
    tableRow.addCell(texts.element, 'header', 1);
    for (i = 1; i <= 31; i++) {
        var day = String(i);
        if (i > daysInMonth(month, year)) {
            day = "";
        }
        var style = "header center";
        if (String(totals[month]["Festive"][i]).indexOf('0') >= 0) {
            style += " red";
        }
        else if (String(totals[month]["Festive"][i]).indexOf('1') >= 0) {
            style += " blue";
        }
        tableRow.addCell(day, style, 1);
    }
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


        for (d = 1; d <= 31; d++) {
            value = convertToHourDecimals(Number(totals[month][columnName][d]));
            //value = convertToHoursMinutes(Number(totals[month][columnName][d]));
            tableRow.addCell(value, "right");
        }
        value = convertToHourDecimals(Number(totals[month][columnName]["TotalMonth"]));
        //value = convertToHoursMinutes(Number(totals[month][columnName]["TotalMonth"]));
        tableRow.addCell(value, "right");
    }
    report.addParagraph('  ');
    report.addParagraph('  ');
}

function printTableTotal(texts, userParam, columns, totals, report, month, year) {
    report.addParagraph(texts.decimalValues, '');
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
function convertToHourDecimals(seconds) {
    // attention 0:02 results in 0.03.
    if (seconds) {
        return Banana.SDecimal.divide(String(seconds), 3600, { 'decimals': 2 });
    }
    return "";
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


function bananaRequiredVersion(requiredVersion) {
    if (Banana.compareVersion && Banana.compareVersion(Banana.application.version, requiredVersion) < 0) {
        return false;
    }
    return true;
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

    var currentParam = {};
    currentParam.name = 'id_employee';
    currentParam.title = texts.param_id_employee;
    currentParam.type = 'string';
    currentParam.value = userParam.id_employee ? userParam.id_employee : "";
    currentParam.defaultvalue = "";
    currentParam.readValue = function () {
        userParam.id_employee = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.name = 'print_timeWorkedTotal';
    currentParam.title = texts.param_timeWorkedTotal;
    currentParam.type = 'bool';
    currentParam.value = userParam.print_timeWorkedTotal ? true : false;
    currentParam.defaultvalue = true;
    currentParam.readValue = function () {
        userParam.print_timeWorkedTotal = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.name = 'print_timeAbsenceSick';
    currentParam.title = texts.param_timeAbsenceSick;
    currentParam.type = 'bool';
    currentParam.value = userParam.print_timeAbsenceSick ? true : false;
    currentParam.defaultvalue = true;
    currentParam.readValue = function () {
        userParam.print_timeAbsenceSick = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.name = 'print_timeAbsenceHoliday';
    currentParam.title = texts.param_timeAbsenceHoliday;
    currentParam.type = 'bool';
    currentParam.value = userParam.print_timeAbsenceHoliday ? true : false;
    currentParam.defaultvalue = true;
    currentParam.readValue = function () {
        userParam.print_timeAbsenceHoliday = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.name = 'print_timeAbsenceService';
    currentParam.title = texts.param_timeAbsenceService;
    currentParam.type = 'bool';
    currentParam.value = userParam.print_timeAbsenceService ? true : false;
    currentParam.defaultvalue = true;
    currentParam.readValue = function () {
        userParam.print_timeAbsenceService = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.name = 'print_timeAbsenceOther';
    currentParam.title = texts.param_timeAbsenceOther;
    currentParam.type = 'bool';
    currentParam.value = userParam.print_timeAbsenceOther ? true : false;
    currentParam.defaultvalue = true;
    currentParam.readValue = function () {
        userParam.print_timeAbsenceOther = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.name = 'print_timeAbsenceTotal';
    currentParam.title = texts.param_timeAbsenceTotal;
    currentParam.type = 'bool';
    currentParam.value = userParam.print_timeAbsenceTotal ? true : false;
    currentParam.defaultvalue = true;
    currentParam.readValue = function () {
        userParam.print_timeAbsenceTotal = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.name = 'print_timeAdjustment';
    currentParam.title = texts.param_timeAdjustment;
    currentParam.type = 'bool';
    currentParam.value = userParam.print_timeAdjustment ? true : false;
    currentParam.defaultvalue = true;
    currentParam.readValue = function () {
        userParam.print_timeAdjustment = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.name = 'print_timeDayTotal';
    currentParam.title = texts.param_timeDayTotal;
    currentParam.type = 'bool';
    currentParam.value = userParam.print_timeDayTotal ? true : false;
    currentParam.defaultvalue = true;
    currentParam.readValue = function () {
        userParam.print_timeDayTotal = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.name = 'print_timeDueDay';
    currentParam.title = texts.param_timeDueDay;
    currentParam.type = 'bool';
    currentParam.value = userParam.print_timeDueDay ? true : false;
    currentParam.defaultvalue = true;
    currentParam.readValue = function () {
        userParam.print_timeDueDay = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.name = 'print_timeDifference';
    currentParam.title = texts.param_timeDifference;
    currentParam.type = 'bool';
    currentParam.value = userParam.print_timeDifference ? true : false;
    currentParam.defaultvalue = true;
    currentParam.readValue = function () {
        userParam.print_timeDifference = this.value;
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
    userParam.print_timeWorkedTotal = true;
    userParam.print_timeAbsenceSick = true;
    userParam.print_timeAbsenceHoliday = true;
    userParam.print_timeAbsenceService = true;
    userParam.print_timeAbsenceOther = true;
    userParam.print_timeAbsenceTotal = true;
    userParam.print_timeAdjustment = true;
    userParam.print_timeDayTotal = true;
    userParam.print_timeDueDay = true;
    userParam.print_timeDifference = true;

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
            convertedParam.data[i].readValue();
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
    var docStartDate = "2021-01-01";//Banana.document.startPeriod();
    var docEndDate = "2021-12-31"; //Banana.document.endPeriod();   

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
        texts.param_timeWorkedTotal = "Tempo lavorato totale";
        texts.param_timeAbsenceSick = "Assenza per malattia";
        texts.param_timeAbsenceHoliday = "Assenza per vacanza";
        texts.param_timeAbsenceService = "Assenza per servizio";
        texts.param_timeAbsenceOther = "Ore perse / Lavoro ridotto";
        texts.param_timeAbsenceTotal = "Assenza totale";
        texts.param_timeAdjustment = "Aggiustamento";
        texts.param_timeDayTotal = "Tempo giorno totale";
        texts.param_timeDueDay = "Dovuto per la giornata";
        texts.param_timeDifference = "Differenza giorno";
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
        texts.param_timeWorkedTotal = "Arbeitszeit insgesamt";
        texts.param_timeAbsenceSick = "Abwesenheit wegen Krankheit";
        texts.param_timeAbsenceHoliday = "Abwesenheit wegen Ferien";
        texts.param_timeAbsenceService = "Abwesenheit wegen öffentlichem Dienst";
        texts.param_timeAbsenceOther = "Verlorene Stunden / reduzierte Arbeit";
        texts.param_timeAbsenceTotal = "Total Abwesenheitsdauer";
        texts.param_timeAdjustment = "Korrektur";
        texts.param_timeDayTotal = "Total Tageszeit";
        texts.param_timeDueDay = "Sollzeit pro Tag";
        texts.param_timeDifference = "Zeitdifferenz Tag";
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
        texts.param_timeWorkedTotal = "Temps de travail total";
        texts.param_timeAbsenceSick = "Absence pour maladie";
        texts.param_timeAbsenceHoliday = "Absence pour les vacances";
        texts.param_timeAbsenceService = "Service public";
        texts.param_timeAbsenceOther = "Heures perdues / Travail réduit";
        texts.param_timeAbsenceTotal = "Absence totale";
        texts.param_timeAdjustment = "Ajustement";
        texts.param_timeDayTotal = "Temps jour total";
        texts.param_timeDueDay = "Dû pour la journée";
        texts.param_timeDifference = "Différence jour";
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
        texts.param_timeWorkedTotal = "Totaal gewerkte tijd";
        texts.param_timeAbsenceSick = "Verzuim wegens ziekte";
        texts.param_timeAbsenceHoliday = "Afwezigheid voor vakantie";
        texts.param_timeAbsenceService = "Openbare dienst";
        texts.param_timeAbsenceOther = "Niet gewerkte uren ivm COVID-19";
        texts.param_timeAbsenceTotal = "Totaal afwezig";
        texts.param_timeAdjustment = "Aanpassing";
        texts.param_timeDayTotal = "Totaal tijd dag";
        texts.param_timeDueDay = "Verschuldigd voor de dag";
        texts.param_timeDifference = "Tijd dag verschil";
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
        texts.param_timeWorkedTotal = "Time worked total";
        texts.param_timeAbsenceSick = "Absence for sick leave";
        texts.param_timeAbsenceHoliday = "Absence for holiday";
        texts.param_timeAbsenceService = "Public service";
        texts.param_timeAbsenceOther = "Lost hours / Reduced work";
        texts.param_timeAbsenceTotal = "Absence total";
        texts.param_timeAdjustment = "Adjustment";
        texts.param_timeDayTotal = "Time day total";
        texts.param_timeDueDay = "Due for the day";
        texts.param_timeDifference = "Time day difference";
    }

    return texts;
}


/***********************
* STYLES
***********************/
function createStyleSheet(userParam) {
    var stylesheet = Banana.Report.newStyleSheet();

    var pageStyle = stylesheet.addStyle("@page");
    pageStyle.setAttribute("margin", "15mm 10mm 15mm 10mm");
    pageStyle.setAttribute("size", "landscape");

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

    var table2Style = stylesheet.addStyle(".table02");
    stylesheet.addStyle(".coltot1", "width:12%");
    stylesheet.addStyle(".coltot2").setAttribute("width-sym", "totcol");
    tableStyle.setAttribute("width", "100%");
    stylesheet.addStyle("table.table02 td", "border:thin solid black;");

    return stylesheet;
}

