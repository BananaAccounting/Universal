// Copyright [2019] [Banana.ch SA - Lugano Switzerland]
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
// @pubdate = 2020-03-19
// @publisher = Banana.ch SA
// @description = Timesheet Month Summary
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
    var columns = ["TimeWorkTotal", "TimeAbsenceSick", "TimeAbsenceHoliday", "TimeAbsenceService",
        "TimeAbsenceOther", "TimeAbsenceTotal", "TimeAdjustment",
        "TimeDayTotal", "TimeDueDay", "TimeDifference"];
    var dateMin = getJounralDateMin();
    year = dateMin.getFullYear();
    var totals = totalizeHours(columns, year);
    var report = printTimeSheetJournal(userParam, columns, totals, year);
    var stylesheet = createStyleSheet();
    Banana.Report.preview(report, stylesheet);
}

function getJounralDateMin() {
    var dateMin;
    var journalTable = Banana.document.table("Journal");
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

function totalizeHours(columns, year) {
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
                totals[ml][columnName][d] = 0;
                totals[ml]["Festive"][d] = "";
            }
            totals[ml][columnName]['TotalMonth'] = 0;
        }
    }
    // Totalize
    var journalTable = Banana.document.table("Journal");
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
            //Banana.console.log(day + "; " + month + "; " + monthText + "; " + year + "; " + quarter);
            if (cyear === year) {
                for (c = 0; c < columns.length; c++) {
                    columnName = columns[c];
                    totals[cmonth][columnName][cday] += Number(tRow.value(columnName));
                    totals['TotalYear'][columnName][cday] += Number(tRow.value(columnName));
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

            //Banana.console.log( month + "; " + columnName + "; " + totMonth);

            totals[ml][columnName]['TotalMonth'] = totMonth;
        }
    }
    return totals;
}
function printTimeSheetJournal(userParam, columns, totals, year) {
    var report = Banana.Report.newReport('Timesheet Journal Table');
    printTableMonth(userParam, columns, totals, report, 3, year);
    printTableMonth(userParam, columns, totals, report, 4, year);
    printTableMonth(userParam, columns, totals, report, "TotalYear", year);
    return report;
}

function printTableMonth(userParam, columns, totals, report, month, year) {
    report.addParagraph('Decimal time values');
    report.addParagraph('Month: ' + month + " Year: " + year);
    var table = report.addTable("table01");
    tableRow = table.addRow();

    /* Columns titles */
    tableRow.addCell('Element', 'header', 1);
    for (i = 1; i <= 31; i++) {
        var day = String(i);
        if (i > daysInMonth(month, year)) {
            day = "";
        }
        var style = "header center";
        if (String(totals[month]["Festive"][i]).indexOf('0') >= 0) {
            style += " red"
        }
        else if (String(totals[month]["Festive"][i]).indexOf('1') >= 0) {
            style += " blue"
        }
        tableRow.addCell(day, style, 1);
    }
    tableRow.addCell('Total', 'header', 1);
    for (c = 0; c < columns.length; c++) {
        tableRow = table.addRow();
        columnName = columns[c];
        tableRow.addCell(columnName);
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

    var convertedParam = {};
    convertedParam.version = '1.0';
    convertedParam.data = [];

    var currentParam = {};
    currentParam.name = 'include_column';
    currentParam.title = 'Columns to include:';
    currentParam.type = 'string';
    currentParam.value = '';
    currentParam.editable = false;
    currentParam.readValue = function () {
        userParam.header = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.name = 'print_date';
    currentParam.parentObject = 'include_column';
    currentParam.title = 'Date';
    currentParam.type = 'bool';
    currentParam.value = userParam.print_date ? true : false;
    currentParam.defaultvalue = true;
    currentParam.readValue = function () {
        userParam.print_date = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.parentObject = 'include_column';
    currentParam.name = 'print_timeDayType';
    currentParam.title = 'TimeDayType';
    currentParam.type = 'bool';
    currentParam.value = userParam.print_timeDayType ? true : false;
    currentParam.defaultvalue = true;
    currentParam.readValue = function () {
        userParam.print_timeDayType = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.parentObject = 'include_column';
    currentParam.name = 'print_timeDayDescription';
    currentParam.title = 'TimeDayDescription';
    currentParam.type = 'bool';
    currentParam.value = userParam.print_timeDayDescription ? true : false;
    currentParam.defaultvalue = true;
    currentParam.readValue = function () {
        userParam.print_timeDayDescription = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.parentObject = 'include_column';
    currentParam.name = 'print_description';
    currentParam.title = 'Description';
    currentParam.type = 'bool';
    currentParam.value = userParam.print_description ? true : false;
    currentParam.defaultvalue = true;
    currentParam.readValue = function () {
        userParam.print_description = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.parentObject = 'include_column';
    currentParam.name = 'print_code1';
    currentParam.title = 'Code1';
    currentParam.type = 'bool';
    currentParam.value = userParam.print_code1 ? true : false;
    currentParam.defaultvalue = true;
    currentParam.readValue = function () {
        userParam.print_code1 = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.parentObject = 'include_column';
    currentParam.name = 'print_notes';
    currentParam.title = 'Notes';
    currentParam.type = 'bool';
    currentParam.value = userParam.print_notes ? true : false;
    currentParam.defaultvalue = true;
    currentParam.readValue = function () {
        userParam.print_notes = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.parentObject = 'include_column';
    currentParam.name = 'print_timeWork1';
    currentParam.title = 'TimeWork1';
    currentParam.type = 'bool';
    currentParam.value = userParam.print_timeWork1 ? true : false;
    currentParam.defaultvalue = true;
    currentParam.readValue = function () {
        userParam.print_timeWork1 = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.parentObject = 'include_column';
    currentParam.name = 'print_timeWork2';
    currentParam.title = 'TimeWork2';
    currentParam.type = 'bool';
    currentParam.value = userParam.print_timeWork2 ? true : false;
    currentParam.defaultvalue = true;
    currentParam.readValue = function () {
        userParam.print_timeWork2 = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.parentObject = 'include_column';
    currentParam.name = 'print_timeStart1';
    currentParam.title = 'TimeStart1';
    currentParam.type = 'bool';
    currentParam.value = userParam.print_timeStart1 ? true : false;
    currentParam.defaultvalue = true;
    currentParam.readValue = function () {
        userParam.print_timeStart1 = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.parentObject = 'include_column';
    currentParam.name = 'print_timeStop1';
    currentParam.title = 'TimeStop1';
    currentParam.type = 'bool';
    currentParam.value = userParam.print_timeStop1 ? true : false;
    currentParam.defaultvalue = true;
    currentParam.readValue = function () {
        userParam.print_timeStop1 = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.parentObject = 'include_column';
    currentParam.name = 'print_timeStart2';
    currentParam.title = 'TimeStart2';
    currentParam.type = 'bool';
    currentParam.value = userParam.print_timeStart2 ? true : false;
    currentParam.defaultvalue = true;
    currentParam.readValue = function () {
        userParam.print_timeStart2 = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.parentObject = 'include_column';
    currentParam.name = 'print_timeStop2';
    currentParam.title = 'TimeStop2';
    currentParam.type = 'bool';
    currentParam.value = userParam.print_timeStop2 ? true : false;
    currentParam.defaultvalue = true;
    currentParam.readValue = function () {
        userParam.print_timeStop2 = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.parentObject = 'include_column';
    currentParam.name = 'print_timeStart3';
    currentParam.title = 'TimeStart3';
    currentParam.type = 'bool';
    currentParam.value = userParam.print_timeStart3 ? true : false;
    currentParam.defaultvalue = true;
    currentParam.readValue = function () {
        userParam.print_timeStart3 = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.parentObject = 'include_column';
    currentParam.name = 'print_timeStop3';
    currentParam.title = 'TimeStop3';
    currentParam.type = 'bool';
    currentParam.value = userParam.print_timeStop3 ? true : false;
    currentParam.defaultvalue = true;
    currentParam.readValue = function () {
        userParam.print_timeStop3 = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.parentObject = 'include_column';
    currentParam.name = 'print_timeStart4';
    currentParam.title = 'TimeStart4';
    currentParam.type = 'bool';
    currentParam.value = userParam.print_timeStart4 ? true : false;
    currentParam.defaultvalue = true;
    currentParam.readValue = function () {
        userParam.print_timeStart4 = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.parentObject = 'include_column';
    currentParam.name = 'print_timeStop4';
    currentParam.title = 'TimeStop4';
    currentParam.type = 'bool';
    currentParam.value = userParam.print_timeStop4 ? true : false;
    currentParam.defaultvalue = true;
    currentParam.readValue = function () {
        userParam.print_timeStop4 = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.parentObject = 'include_column';
    currentParam.name = 'print_timeStart5';
    currentParam.title = 'TimeStart5';
    currentParam.type = 'bool';
    currentParam.value = userParam.print_timeStart5 ? true : false;
    currentParam.defaultvalue = true;
    currentParam.readValue = function () {
        userParam.print_timeStart5 = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.parentObject = 'include_column';
    currentParam.name = 'print_timeStop5';
    currentParam.title = 'TimeStop5';
    currentParam.type = 'bool';
    currentParam.value = userParam.print_timeStop5 ? true : false;
    currentParam.defaultvalue = true;
    currentParam.readValue = function () {
        userParam.print_timeStop5 = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.parentObject = 'include_column';
    currentParam.name = 'print_timeWorkedTotal';
    currentParam.title = 'TimeWorkedTotal';
    currentParam.type = 'bool';
    currentParam.value = userParam.print_timeWorkedTotal ? true : false;
    currentParam.defaultvalue = true;
    currentParam.readValue = function () {
        userParam.print_timeWorkedTotal = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.parentObject = 'include_column';
    currentParam.name = 'print_timeAbsenceSick';
    currentParam.title = 'TimeAbsenceSick';
    currentParam.type = 'bool';
    currentParam.value = userParam.print_timeAbsenceSick ? true : false;
    currentParam.defaultvalue = true;
    currentParam.readValue = function () {
        userParam.print_timeAbsenceSick = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.parentObject = 'include_column';
    currentParam.name = 'print_timeAbsenceHoliday';
    currentParam.title = 'TimeAbsenceHoliday';
    currentParam.type = 'bool';
    currentParam.value = userParam.print_timeAbsenceHoliday ? true : false;
    currentParam.defaultvalue = true;
    currentParam.readValue = function () {
        userParam.print_timeAbsenceHoliday = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.parentObject = 'include_column';
    currentParam.name = 'print_timeAbsenceService';
    currentParam.title = 'TimeAbsenceService';
    currentParam.type = 'bool';
    currentParam.value = userParam.print_timeAbsenceService ? true : false;
    currentParam.defaultvalue = true;
    currentParam.readValue = function () {
        userParam.print_timeAbsenceService = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.parentObject = 'include_column';
    currentParam.name = 'print_timeAbsenceOther';
    currentParam.title = 'TimeAbsenceOther';
    currentParam.type = 'bool';
    currentParam.value = userParam.print_timeAbsenceOther ? true : false;
    currentParam.defaultvalue = true;
    currentParam.readValue = function () {
        userParam.print_timeAbsenceOther = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.parentObject = 'include_column';
    currentParam.name = 'print_timeAbsenceTotal';
    currentParam.title = 'TimeAbsenceTotal';
    currentParam.type = 'bool';
    currentParam.value = userParam.print_timeAbsenceTotal ? true : false;
    currentParam.defaultvalue = true;
    currentParam.readValue = function () {
        userParam.print_timeAbsenceTotal = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.parentObject = 'include_column';
    currentParam.name = 'print_timeAdjustment';
    currentParam.title = 'TimeAdjustment';
    currentParam.type = 'bool';
    currentParam.value = userParam.print_timeAdjustment ? true : false;
    currentParam.defaultvalue = true;
    currentParam.readValue = function () {
        userParam.print_timeAdjustment = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.parentObject = 'include_column';
    currentParam.name = 'print_timeDayTotal';
    currentParam.title = 'TimeDayTotal';
    currentParam.type = 'bool';
    currentParam.value = userParam.print_timeDayTotal ? true : false;
    currentParam.defaultvalue = true;
    currentParam.readValue = function () {
        userParam.print_timeDayTotal = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.parentObject = 'include_column';
    currentParam.name = 'print_timeDueCode';
    currentParam.title = 'TimeDueCode';
    currentParam.type = 'bool';
    currentParam.value = userParam.print_timeDueCode ? true : false;
    currentParam.defaultvalue = true;
    currentParam.readValue = function () {
        userParam.print_timeDueCode = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.parentObject = 'include_column';
    currentParam.name = 'print_timeDueDay';
    currentParam.title = 'TimeDueDay';
    currentParam.type = 'bool';
    currentParam.value = userParam.print_timeDueDay ? true : false;
    currentParam.defaultvalue = true;
    currentParam.readValue = function () {
        userParam.print_timeDueDay = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.parentObject = 'include_column';
    currentParam.name = 'print_timeDifference';
    currentParam.title = 'TimeDifference';
    currentParam.type = 'bool';
    currentParam.value = userParam.print_timeDifference ? true : false;
    currentParam.defaultvalue = true;
    currentParam.readValue = function () {
        userParam.print_timeDifference = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.parentObject = 'include_column';
    currentParam.name = 'print_timeProgressive';
    currentParam.title = 'TimeProgressive';
    currentParam.type = 'bool';
    currentParam.value = userParam.print_timeProgressive ? true : false;
    currentParam.defaultvalue = true;
    currentParam.readValue = function () {
        userParam.print_timeProgressive = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.parentObject = 'include_column';
    currentParam.name = 'print_timeSplit1';
    currentParam.title = 'TimeSplit1';
    currentParam.type = 'bool';
    currentParam.value = userParam.print_timeSplit1 ? true : false;
    currentParam.defaultvalue = true;
    currentParam.readValue = function () {
        userParam.print_timeSplit1 = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.parentObject = 'include_column';
    currentParam.name = 'print_timeSplit2';
    currentParam.title = 'TimeSplit2';
    currentParam.type = 'bool';
    currentParam.value = userParam.print_timeSplit2 ? true : false;
    currentParam.defaultvalue = true;
    currentParam.readValue = function () {
        userParam.print_timeSplit2 = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.parentObject = 'include_column';
    currentParam.name = 'print_km';
    currentParam.title = 'Km';
    currentParam.type = 'bool';
    currentParam.value = userParam.print_km ? true : false;
    currentParam.defaultvalue = true;
    currentParam.readValue = function () {
        userParam.print_km = this.value;
    }
    convertedParam.data.push(currentParam);

    return convertedParam;
}

function initUserParam() {
    var userParam = {};
    userParam.print_date = true;
    userParam.print_timeDayType = true;
    userParam.print_timeDayDescription = true;
    userParam.print_description = true;
    userParam.print_code1 = true;
    userParam.print_notes = true;
    userParam.print_timeWork1 = true;
    userParam.print_timeWork2 = true;
    userParam.print_timeStart1 = true;
    userParam.print_timeStop1 = true;
    userParam.print_timeStart2 = true;
    userParam.print_timeStop2 = true;
    userParam.print_timeStart3 = true;
    userParam.print_timeStop3 = true;
    userParam.print_timeStart4 = true;
    userParam.print_timeStop4 = true;
    userParam.print_timeStart5 = true;
    userParam.print_timeStop5 = true;
    userParam.print_timeWorkedTotal = true;
    userParam.print_timeAbsenceSick = true;
    userParam.print_timeAbsenceHoliday = true;
    userParam.print_timeAbsenceService = true;
    userParam.print_timeAbsenceOther = true;
    userParam.print_timeAbsenceTotal = true;
    userParam.print_timeAdjustment = true;
    userParam.print_timeDayTotal = true;
    userParam.print_timeDueCode = true;
    userParam.print_timeDueDay = true;
    userParam.print_timeDifference = true;
    userParam.print_timeProgressive = true;
    userParam.print_timeSplit1 = true;
    userParam.print_timeSplit2 = true;
    userParam.print_km = true;
    return userParam;
}

function parametersDialog(userParam) {

    if (typeof (Banana.Ui.openPropertyEditor) !== 'undefined') {
        var dialogTitle = "Settings";
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

    scriptform = parametersDialog(scriptform); // From propertiess
    if (scriptform) {
        var paramToString = JSON.stringify(scriptform);
        Banana.document.setScriptSettings(paramToString);
    }

    return scriptform;
}


/***********************
* STYLES
***********************/
function createStyleSheet(userParam) {
    var stylesheet = Banana.Report.newStyleSheet();

    var pageStyle = stylesheet.addStyle("@page");
    pageStyle.setAttribute("margin", "10mm 10mm 10mm 10mm");
    pageStyle.setAttribute("size", "landscape");

    stylesheet.addStyle("body", "font-size: 7pt; font-family: Helvetica");
    stylesheet.addStyle(".bold", "font-weight:bold");
    stylesheet.addStyle(".right", "text-align:right");
    stylesheet.addStyle(".center", "text-align:center");
    stylesheet.addStyle(".header", "background-color:#F0F8FF");
    stylesheet.addStyle(".red", "color:red");
    stylesheet.addStyle(".blue", "color:blue");

    var tableStyle = stylesheet.addStyle(".table01");
    tableStyle.setAttribute("width", "100%");
    stylesheet.addStyle("table.table01 td", "border:thin solid black;");

    return stylesheet;
}

