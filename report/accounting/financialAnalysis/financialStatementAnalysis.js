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
// @api = 1.0
// @id = financialStatementAnalysis.js
// @description = Financial Reports
// @task = app.command
// @doctype = 100.*
// @publisher = Banana.ch SA
// @pubdate = 2021-01-13
// @inputdatasource = none
// @timeout = -1

var FinancialStatementAnalysis = class FinancialStatementAnalysis {
    /**
     * @description create the class attributes and give them a default value.
     * @dialogparam {Banana Document} banDocument: the current accounting file we are working with.
     */
    constructor(banDocument) {
        this.version = '1.0';
        this.banDocument = banDocument;
        this.data = {};
        this.info = this.getDocumentInfo();
        this.dialogparam = this.initDialogParam();
        this.balanceDifferences = 0;
        this.profitAndLossDifferences = 0;

        //errors
        this.ID_ERR_EXPERIMENTAL_REQUIRED = "ID_ERR_EXPERIMENTAL_REQUIRED";
        this.ID_ERR_LICENSE_NOTVALID = "ID_ERR_LICENSE_NOTVALID";
        this.ID_ERR_VERSION_NOTSUPPORTED = "ID_ERR_VERSION_NOTSUPPORTED";
    }

    /**
     * @description these methods are used to create the tables structure, in detail:
     * -set the number of columns and call the style for them
     * -the columns width
     * -set the table headers
     * all the methods have a similar structure, here is an example with the balance table.
     * @Param {object} report: the report created
     * @Param {number} columnsCount: the number of column in the table, is used for create empty space (span) for the titles inside the tables.
     * @returns the structure of the table
     */
    printReportAddTableCompanyInfo(report, columnsCount) {
        var tableCompanyInfo = report.addTable('myTableCompanyInfo');
        tableCompanyInfo.setStyleAttributes("width:100%;");
        tableCompanyInfo.getCaption().addText(qsTr("COMPANY INFORMATION"), "styleGroupTitles");
        //columns
        columnsCount = 3;
        tableCompanyInfo.addColumn("Name").setStyleAttributes("width:30%");
        tableCompanyInfo.addColumn("Description").setStyleAttributes("width:70%");
        return tableCompanyInfo;
    }

    printReportAddTableBalance(report, columnsCount) {
        var tableBalance = report.addTable('myTableBalance');
        tableBalance.getCaption().addText(qsTr("BALANCE"), "styleGroupTitles");
        //columns
        columnsCount = 0;
        // header
        var tableHeader = tableBalance.getHeader();
        var tableRow = tableHeader.addRow();
        tableRow.addCell(qsTr("Description"), "styleTableHeader");
        if (this.dialogparam.acronymcolumn) {
            tableRow.addCell(qsTr("Acronym"), "styleTableHeader");
        }
        for (var i = this.data.length - 1; i >= 0; i--) {
            var year = this.data[i].period.StartDate;
            var elementType = this.data[i].period.Type;
            if (elementType === "Y") {
                year = year.substr(0, 4);
            }
            tableRow.addCell(year, "styleTableHeader");
        }
        return tableBalance;
    }

    printReportAddTableBalanceControlSums(report) {
        var tableBalanceSumsControl = report.addTable('myTableBalanceSumsControl');
        tableBalanceSumsControl.getCaption().addText(qsTr("BALANCE CONTROL SUMS"), "styleGroupTitles");
        // header
        var tableHeader = tableBalanceSumsControl.getHeader();
        var tableRow = tableHeader.addRow();
        tableRow.addCell(qsTr("Year"), "styleTableHeader");
        tableRow.addCell(qsTr("Accounting Total"), "styleTableHeader");
        tableRow.addCell(qsTr("Calculated Total"), "styleTableHeader");
        tableRow.addCell(qsTr("Difference"), "styleTableHeader");
        return tableBalanceSumsControl;
    }
    printReportAddTableConCeControlSums(report) {
        var tableConCeSumsControl = report.addTable('mytableConCeSumsControl');
        tableConCeSumsControl.getCaption().addText(qsTr("PROFIT AND LOSS CONTROL SUMS"), "styleGroupTitles");
        // header
        var tableHeader = tableConCeSumsControl.getHeader();
        var tableRow = tableHeader.addRow();
        tableRow.addCell(qsTr("Accounting Total"), "styleTableHeader");
        tableRow.addCell(qsTr("Calculated Total"), "styleTableHeader");
        tableRow.addCell(qsTr("Difference"), "styleTableHeader");
        return tableConCeSumsControl;
    }

    printReportAddTableConCe(report) {
        var tableConCe = report.addTable('myConTableCe');
        tableConCe.getCaption().addText(qsTr("PROFIT AND LOSS"), "styleGroupTitles");
        //header
        var tableHeader = tableConCe.getHeader();
        var tableRow = tableHeader.addRow();
        tableRow.addCell(qsTr("Description"), "styleTableHeader");
        if (this.dialogparam.acronymcolumn) {
            tableRow.addCell(qsTr("Acronym"), "styleTableHeader");
        }
        for (var i = this.data.length - 1; i >= 0; i--) {
            var year = this.data[i].period.StartDate;
            var elementType = this.data[i].period.Type;
            if (elementType === "Y") {
                year = year.substr(0, 4);
            }
            tableRow.addCell(year, "styleTableHeader");
        }
        return tableConCe;
    }

    printReportAddTableIndliq(report) {
        var tableIndliq = report.addTable('myIndliqTable');
        tableIndliq.setStyleAttributes("width:100%");
        tableIndliq.getCaption().addText(qsTr("LIQUIDITY RATIOS"), "styleGroupTitles");
        tableIndliq.addColumn("Description").setStyleAttributes("width:25%");
        tableIndliq.addColumn("formula").setStyleAttributes("width:20%");
        // header
        var tableHeader = tableIndliq.getHeader();
        var tableRow = tableHeader.addRow();
        tableRow.addCell(qsTr("Description"), "styleTableHeader");
        if (this.dialogparam.formulascolumn) {
            tableRow.addCell(qsTr("formula"), "styleTableHeader");
        }
        for (var i = this.data.length - 1; i >= 0; i--) {
            var year = this.data[i].period.StartDate;
            var elementType = this.data[i].period.Type;
            if (elementType === "Y") {
                year = year.substr(0, 4);
            }
            tableRow.addCell(year, "styleTableHeader");

        }
        tableRow.addCell(qsTr("BenchMark"), "styleTableHeader");
        return tableIndliq;
    }
    printReportAddTableIndlev(report) {
        var tableIndlev = report.addTable('myIndlevTable');
        tableIndlev.setStyleAttributes("width:100%");
        tableIndlev.getCaption().addText(qsTr("LEVERAGE RATIOS"), "styleGroupTitles");
        tableIndlev.addColumn("Description").setStyleAttributes("width:25%");
        tableIndlev.addColumn("formula").setStyleAttributes("width:20%");
        // header
        var tableHeader = tableIndlev.getHeader();
        var tableRow = tableHeader.addRow();
        tableRow.addCell(qsTr("Description"), "styleTableHeader");
        if (this.dialogparam.formulascolumn) {
            tableRow.addCell(qsTr("formula"), "styleTableHeader");
        }
        for (var i = this.data.length - 1; i >= 0; i--) {
            var year = this.data[i].period.StartDate;
            var elementType = this.data[i].period.Type;
            if (elementType === "Y") {
                year = year.substr(0, 4);
            }
            tableRow.addCell(year, "styleTableHeader");
        }
        tableRow.addCell(qsTr("BenchMark"), "styleTableHeader");
        return tableIndlev;
    }
    printReportAddTableIndprof(report) {
        var tableIndprof = report.addTable('myIndprofTable');
        tableIndprof.setStyleAttributes("width:100%");
        tableIndprof.getCaption().addText(qsTr("PROFITABILITY RATIOS"), "styleGroupTitles");
        tableIndprof.addColumn("Description").setStyleAttributes("width:25%");
        tableIndprof.addColumn("formula").setStyleAttributes("width:20%");
        // header
        var tableHeader = tableIndprof.getHeader();
        var tableRow = tableHeader.addRow();
        tableRow.addCell(qsTr("Description"), "styleTableHeader");
        if (this.dialogparam.formulascolumn) {
            tableRow.addCell(qsTr("formula"), "styleTableHeader");
        }
        for (var i = this.data.length - 1; i >= 0; i--) {
            var year = this.data[i].period.StartDate;
            var elementType = this.data[i].period.Type;
            if (elementType === "Y") {
                year = year.substr(0, 4);
            }
            tableRow.addCell(year, "styleTableHeader");
        }
        tableRow.addCell(qsTr("BenchMark"), "styleTableHeader");
        return tableIndprof;
    }

    printReportAddTableIndeff(report) {
        var tableIndeff = report.addTable('myIndeffTable');
        tableIndeff.setStyleAttributes("width:100%");
        tableIndeff.getCaption().addText(qsTr("EFFICIENCY RATIOS"), "styleGroupTitles");
        tableIndeff.addColumn("Description").setStyleAttributes("width:25%");
        tableIndeff.addColumn("formula").setStyleAttributes("width:20%");
        // header
        var tableHeader = tableIndeff.getHeader();
        var tableRow = tableHeader.addRow();
        tableRow.addCell(qsTr("Description"), "styleTableHeader");
        if (this.dialogparam.formulascolumn) {
            tableRow.addCell(qsTr("formula"), "styleTableHeader");
        }
        for (var i = this.data.length - 1; i >= 0; i--) {
            var year = this.data[i].period.StartDate;
            var elementType = this.data[i].period.Type;
            if (elementType === "Y") {
                year = year.substr(0, 4);
            }
            tableRow.addCell(year, "styleTableHeader");
        }
        return tableIndeff;
    }

    printReportAddTableDupont(report) {
        var tableDupont = report.addTable('myDupontTable');
        return tableDupont;
    }

    printtableAltmanIndex(report) {

        var tableAltmanIndex = report.addTable('myTableAltmanIndex');
        tableAltmanIndex.getCaption().addText(qsTr("ALTMAN INDEX Z-SCORE"), "styleGroupTitles");
        // header
        var tableHeader = tableAltmanIndex.getHeader();
        var tableRow = tableHeader.addRow();
        for (var i = this.data.length - 1; i >= 0; i--) {
            var year = this.data[i].period.StartDate;
            var elementType = this.data[i].period.Type;
            if (elementType === "Y") {
                year = year.substr(0, 4);
            }
            tableRow.addCell(year, "styleTableHeader");
        }

        return tableAltmanIndex;

    }

    /**
     * this method calculate the rate of growth of two indexes with the following formula: ((Xt-Xt-1)/Xt-1)*100.
     * @dialogparam {*} indexT1 
     * @dialogparam {*} indexT2 
     */
    setRateOfGrowth(indexT1, indexT2) {
        var rateOfGrowth = Banana.SDecimal.subtract(indexT1, indexT2);
        var form1 = Banana.SDecimal.divide(rateOfGrowth, indexT2);
        var form2 = Banana.SDecimal.multiply(form1, '100');
        var rate = Banana.SDecimal.round(form2, { 'decimals': 2 });
        rate += '%'
        return rate;

    }

    /**
     * This Method compares two indexes, one at time 't' and one at time 't-1', 
     * according to the evolution of index 't' with respect to 't1', the correct icon is added to the cell
     * @Param {*} indexT1 the index at the time 't'
     * @Param {*} indexT2 the index at the time 't-1' 
     * @Param {*} cell the cell containing the index
     */
    setIndexEvolution(indexT1, indexT2, cell) {
        //var rateOfGrowth = this.setRateOfGrowth(indexT1, indexT2);
        var evolution = Banana.SDecimal.compare(indexT1, indexT2)
        var up = '🠑';
        var down = '🠓';
        var equal = '⇆';

        if (evolution === 1) {
            //increased
            cell.addText(up, "styleUpArrow");
        } else if (evolution === -1) {
            //decreased
            cell.addText(down, "styleDownArrow");
        } else if (evolution === 0) {
            //same
            cell.addText(equal, "styleEqualArrow");
        }
        //add the rate of growth of the index
        //cell.addText(rateOfGrowth);

    }

    /**
     * @description calculates the number of columns depending on the number of years of analysis,
     * the result is used to create the right span.
     * @Param {object} yearcolumns : an object set to 0.
     * @returns the number of columns
     */
    yearsColumnCount(yearcolumns) {
        for (var i = this.data.length - 1; i >= 0; i--) {

            yearcolumns++
        }
        yearcolumns += 2;
        return yearcolumns;
    }

    /**
     * @description set the header of the report.
     * @Param {object} report: the report created
     */
    addHeader(report) {
        var today = new Date();
        var day = today.getDate();
        var month = today.getMonth() + 1 //As January is 0;
        var year = today.getFullYear();
        if (day < 10) day = '0' + day;
        if (month < 10) month = '0' + month;
        report.getHeader().addClass("header");
        var myheader = qsTr("Financial Statements Analysis");
        report.getHeader().addText(myheader + ": " + day + '-' + month + '-' + year);
        // report.getHeader().addText("period: " + startperiod + " - " + endperiod);

    }

    /**
     * @description set the footer of the report.
     * @Param {object} report: the report created
     */
    addFooter(report) {
        report.getFooter().addClass("footer");
        report.getFooter().addText('Banana.ch');

    }

    /**
     * @description this method do the following things:
     * -call some other methods to recover the neccesary values
     * -print the tables and others report elements entering the different data.
     * -set the cells and the rows values
     * @returns a report object.
     */
    printReport() {

        var report = Banana.Report.newReport('Financial Statement Analysis Report');
        var docInfo = this.getDocumentInfo()
        var currency = docInfo.basicCurrency;
        var company = docInfo.company;
        var Address1 = docInfo.address1;
        var Country = docInfo.country;

        //i determinate the length of the years of analysis array and i subtract one, that's for the index evaluation
        var analsysisYears = this.data.length;
        analsysisYears -= 1;

        if (!this.data || this.data.length <= 0) {
            return report;
        }

        this.addHeader(report);
        this.addFooter(report);

        //Add the company Info's Table
        var tableCompanyInfo = this.printReportAddTableCompanyInfo(report);
        var tableRow = tableCompanyInfo.addRow();
        tableRow.addCell(qsTr('COMPANY NAME'));
        tableRow.addCell(company, 'styleCompanyInfocells');
        var tableRow = tableCompanyInfo.addRow();
        tableRow.addCell(qsTr('HEAD OFFICE'));
        tableRow.addCell(Address1, 'styleCompanyInfocells');
        var tableRow = tableCompanyInfo.addRow();
        tableRow.addCell(qsTr('COUNTRY'));
        tableRow.addCell(Country, 'styleCompanyInfocells');
        var tableRow = tableCompanyInfo.addRow();
        tableRow.addCell(qsTr('TYPE'));
        tableRow.addCell(qsTr("SME"), 'styleCompanyInfocells');
        var tableRow = tableCompanyInfo.addRow();
        tableRow.addCell(qsTr('ANALYSIS PERIOD'));
        var sep = "";
        var period = "";
        for (var i = this.data.length - 1; i >= 0; i--) {
            var year = this.data[i].period.EndDate;
            var elementType = this.data[i].period.Type;
            if (elementType === "Y") {
                year = year.substr(0, 4);
                if (i < analsysisYears) {
                    sep = '-'
                }
            }
            period = period + sep + year

        }

        tableRow.addCell((period), 'styleCompanyInfocells');

        //Add Table balance
        var colCountTableBalance = this.yearsColumnCount();
        var tableBalance = this.printReportAddTableBalance(report);
        // current assets
        for (var key in this.data[0].balance.ca) {
            var tableRow = tableBalance.addRow("styleTablRows");
            tableRow.addCell(qsTr(this.data[0].balance.ca[key].description));
            if (this.dialogparam.acronymcolumn) {
                tableRow.addCell(key);
            }
            for (var i = this.data.length - 1; i >= 0; i--) {
                var amount = this.data[i].balance.ca[key].balance;
                tableRow.addCell(this.toLocaleAmountFormat(amount), "styleAmount");
            }
        }
        tableRow = tableBalance.addRow("styleTablRows");
        tableRow.addCell(qsTr('Current Asset'), 'styleUnderGroupTitles');
        if (this.dialogparam.acronymcolumn) {
            tableRow.addCell("cuas");
        }
        for (var i = this.data.length - 1; i >= 0; i--) {
            tableRow.addCell(this.toLocaleAmountFormat(this.data[i].CalculatedData.CurrentAsset), "styleMidTotal");
        }

        //add the AF counts, and put the data inside with a loop on the right level
        for (var key in this.data[0].balance.fa) {
            var tableRow = tableBalance.addRow("styleTablRows");
            tableRow.addCell(qsTr(this.data[0].balance.fa[key].description));
            if (this.dialogparam.acronymcolumn) {
                tableRow.addCell(key);
            }
            for (var i = this.data.length - 1; i >= 0; i--) {
                var amount = this.data[i].balance.fa[key].balance;
                tableRow.addCell(this.toLocaleAmountFormat(amount), "styleAmount");
            }
        }
        tableRow = tableBalance.addRow("styleTablRows");
        tableRow.addCell(qsTr('Fixed Asset'), 'styleUnderGroupTitles');
        if (this.dialogparam.acronymcolumn) {
            tableRow.addCell("tfix");
        }
        for (var i = this.data.length - 1; i >= 0; i--) {
            tableRow.addCell(this.toLocaleAmountFormat(this.data[i].CalculatedData.FixedAsset), "styleMidTotal");
        }

        var tableRow = tableBalance.addRow("styleTablRows");
        tableRow.addCell(qsTr('Total Asset'), 'styleTitlesTotAmount');
        if (this.dialogparam.acronymcolumn) {
            tableRow.addCell("tota");
        }
        for (var i = this.data.length - 1; i >= 0; i--) {
            tableRow.addCell(this.toLocaleAmountFormat(this.data[i].CalculatedData.TotActive), "styleTotAmount");
        }

        //add the CT counts, and put the data inside with a loop on the right level
        for (var key in this.data[0].balance.dc) {
            var tableRow = tableBalance.addRow("styleTablRows");
            tableRow.addCell(qsTr(this.data[0].balance.dc[key].description));
            if (this.dialogparam.acronymcolumn) {
                tableRow.addCell(key);
            }
            for (var i = this.data.length - 1; i >= 0; i--) {
                var amount = this.data[i].balance.dc[key].balance;
                tableRow.addCell(this.toLocaleAmountFormat(amount), 'styleAmount');
            }
        }
        tableRow = tableBalance.addRow("styleTablRows");
        tableRow.addCell(qsTr('Debt Capital'), 'styleUnderGroupTitles');
        if (this.dialogparam.acronymcolumn) {
            tableRow.addCell("deca");
        }
        for (var i = this.data.length - 1; i >= 0; i--) {
            tableRow.addCell(this.toLocaleAmountFormat(this.data[i].CalculatedData.DebtCapital), "styleMidTotal");
        }

        // own capital
        for (var key in this.data[0].balance.oc) {
            var tableRow = tableBalance.addRow("styleTablRows");
            tableRow.addCell(qsTr(this.data[0].balance.oc[key].description));
            if (this.dialogparam.acronymcolumn) {
                tableRow.addCell(key);
            }
            for (var i = this.data.length - 1; i >= 0; i--) {
                var amount = this.data[i].balance.oc[key].balance;
                tableRow.addCell(this.toLocaleAmountFormat(amount), "styleAmount");
            }
        }
        tableRow = tableBalance.addRow("styleTablRows");
        tableRow.addCell(qsTr('Own Capital', 'styleUnderGroupTitles'));
        if (this.dialogparam.acronymcolumn) {
            tableRow.addCell("owca");
        }
        for (var i = this.data.length - 1; i >= 0; i--) {
            tableRow.addCell(this.toLocaleAmountFormat(this.data[i].CalculatedData.OwnCapital), "styleMidTotal");
        }

        var tableRow = tableBalance.addRow("styleTablRows");
        tableRow.addCell(qsTr('Total Liabilities and Equity'), 'styleTitlesTotAmount');
        if (this.dialogparam.acronymcolumn) {
            tableRow.addCell("totp");
        }
        for (var i = this.data.length - 1; i >= 0; i--) {
            tableRow.addCell(this.toLocaleAmountFormat(this.data[i].CalculatedData.TotPassive), "styleTotAmount");
        }
        // Add the Balance control sums table
        var tableBalanceControlSums = this.printReportAddTableBalanceControlSums(report);
        var tableRow = tableBalanceControlSums.addRow("styleTablRows");
        tableRow.addCell(qsTr("Assets"), "styleUnderGroupTitles", 4);
        for (var i = this.data.length - 1; i >= 0; i--) {
            var tableRow = tableBalanceControlSums.addRow("styleTablRows");
            var period = this.data[i].period.StartDate;
            var year = period.substr(0, 4);
            // we dont want to control the budget table sums
            if (year != "Budg" && year != "Prev") {
                tableRow.addCell(year);
                tableRow.addCell(this.toLocaleAmountFormat(this.data[i].CalculatedData.TotActiveSheet), "styleAmount");
                tableRow.addCell(this.toLocaleAmountFormat(this.data[i].CalculatedData.TotActive), "styleAmount");
                //check if the control sum i equal to 0, if is not, print a paragraf with a message error and the amount with the color red.
                var differenceStyle = this.setDifferenceStyle(this.data[i].CalculatedData.ActiveDifference, this.data.differences);
                tableRow.addCell(this.toLocaleAmountFormat(this.data[i].CalculatedData.ActiveDifference), differenceStyle);
                if (this.data[i].CalculatedData.ActiveDifference != 0) {
                    this.balanceDifferences++;
                }
            }
        }
        var tableRow = tableBalanceControlSums.addRow("styleTablRows");
        tableRow.addCell(qsTr("Liabilities and Equity"), "styleUnderGroupTitles", 4);
        for (var i = this.data.length - 1; i >= 0; i--) {
            var tableRow = tableBalanceControlSums.addRow("styleTablRows");
            var period = this.data[i].period.StartDate;
            var year = period.substr(0, 4);
            if (year != "Budg" && year != "Prev") {
                tableRow.addCell(year);
                tableRow.addCell(this.toLocaleAmountFormat(this.data[i].CalculatedData.TotPassiveSheet), "styleAmount");
                tableRow.addCell(this.toLocaleAmountFormat(this.data[i].CalculatedData.TotPassive), "styleAmount");
                var differenceStyle;
                //check if the control sum i equal to 0, if is not, print a paragraf with a message error and the amount with the color red.
                var differenceStyle = this.setDifferenceStyle(this.data[i].CalculatedData.PassiveDifference, this.data.differences);
                tableRow.addCell(this.toLocaleAmountFormat(this.data[i].CalculatedData.PassiveDifference), differenceStyle);
                if (this.data[i].CalculatedData.PassiveDifference != 0) {
                    this.balanceDifferences++;
                }
            }
        }
        //if there are differences between the accounting totals and the calculated totals in the balance, we show a warning message.
        if (this.balanceDifferences > 0) {
            report.addParagraph(this.showDifferencesWarning(), "styleWarningParagraph");
        }

        report.addPageBreak();

        //Add Table profit and loss
        var tableCe = this.printReportAddTableConCe(report);
        for (var key in this.data[0].profitandloss) {
            var invertAmount = false;
            var description = this.data[0].profitandloss[key].description;
            if (key == "cofm" || key == "cope" || key == "codi" || key == "amre") {
                invertAmount = true;
                description = "- " + description;
            } else if (key == "inte") {
                invertAmount = true;
                description = "+/- " + description;
            } else {
                description = "+ " + description;
            }
            var tableRow = tableCe.addRow("styleTablRows");
            tableRow.addCell(qsTr(description));
            if (this.dialogparam.acronymcolumn) {
                tableRow.addCell(key);
            }
            for (var i = this.data.length - 1; i >= 0; i--) {
                var amount = this.data[i].profitandloss[key].balance;
                if (invertAmount)
                    amount = Banana.SDecimal.invert(amount);
                tableRow.addCell(this.toLocaleAmountFormat(amount), "styleAmount");
            }
            if (key === "cofm") {
                var tableRow = tableCe.addRow("styleTablRows");
                tableRow.addCell(qsTr("= Added Value"), "styleUnderGroupTitles");
                if (this.dialogparam.acronymcolumn) {
                    tableRow.addCell("adva");
                }
                for (var i = this.data.length - 1; i >= 0; i--) {
                    tableRow.addCell(this.toLocaleAmountFormat(this.data[i].CalculatedData.AddedValue), "styleMidTotal");
                }
            }
            if (key === "amre") {
                var tableRow = tableCe.addRow("styleTablRows");
                tableRow.addCell("= EBIT", "styleUnderGroupTitles");
                if (this.dialogparam.acronymcolumn) {
                    tableRow.addCell("ebit");
                }
                for (var i = this.data.length - 1; i >= 0; i--) {
                    tableRow.addCell(this.toLocaleAmountFormat(this.data[i].CalculatedData.Ebit), "styleMidTotal");
                }
            }
            if (key === "codi") {
                var tableRow = tableCe.addRow("styleTablRows");
                tableRow.addCell("= EBITDA", "styleUnderGroupTitles");
                if (this.dialogparam.acronymcolumn) {
                    tableRow.addCell("ebitda");
                }
                for (var i = this.data.length - 1; i >= 0; i--) {
                    tableRow.addCell(this.toLocaleAmountFormat(this.data[i].CalculatedData.EbitDa), "styleMidTotal");
                }

            }
        }
        var tableRow = tableCe.addRow("styleTablRows");
        tableRow.addCell(qsTr("Annual result"), "styleTitlesTotAmount");
        if (this.dialogparam.acronymcolumn) {
            tableRow.addCell("fire");
        }
        for (var i = this.data.length - 1; i >= 0; i--) {
            tableRow.addCell(this.toLocaleAmountFormat(this.data[i].CalculatedData.TotAnnual), "styleTotAmount");
        }

        //add the control Sums Profit and loss table

        if (this.data[0].isBudget === true) {
            Arrayindexcurr = 1;
        } else {
            Arrayindexcurr = 0;
        }

        var tableConCeControlSums = this.printReportAddTableConCeControlSums(report);
        var tableRow = tableConCeControlSums.addRow("styleTablRows");
        tableRow.addCell(this.toLocaleAmountFormat(this.data[Arrayindexcurr].CalculatedData.TotAnnualSheet), "styleAmount");
        tableRow.addCell(this.toLocaleAmountFormat(this.data[Arrayindexcurr].CalculatedData.TotAnnual), "styleAmount");
        var differenceStyle;
        //check if the control sum i equal to 0, if is not, print a paragraf with a message error and the amount with the color red.
        var differenceStyle = this.setDifferenceStyle(this.data[Arrayindexcurr].CalculatedData.TotAnnualDifference, this.data.differences);
        tableRow.addCell(this.toLocaleAmountFormat(this.data[Arrayindexcurr].CalculatedData.TotAnnualDifference), differenceStyle);
        if (this.data[Arrayindexcurr].CalculatedData.TotAnnualDifference != 0) {
            this.profitAndLossDifferences++;
        }
        //control if there are difference between the accounting totals and the calculated totals in the profit and loss, we show a warning message
        if (this.profitAndLossDifferences > 0) {
            report.addParagraph(this.showDifferencesWarning(), "styleWarningParagraph");
        }

        report.addPageBreak();

        /*add the liquidity ratios table
        add the sign % only if the values are ratios
        also if the value arent't a ratio, we give them a normal amount style;
         */
        var tableindliq = this.printReportAddTableIndliq(report);

        for (var key in this.data[0].index.liqu) {
            var tableRow = tableindliq.addRow("styleTablRows");
            tableRow.addCell(qsTr(this.data[0].index.liqu[key].description), "styleTablRows");
            if (this.dialogparam.formulascolumn) {
                tableRow.addCell(this.data[0].index.liqu[key].formula, "styleNormal");
            }
            for (var i = this.data.length - 1; i >= 0; i--) {
                var perc = "";
                var stile = "";
                var cell = "";
                var ratios = this.data[i].index.liqu[key].amount;
                if (this.data[0].index.liqu[key].type != "dec") {
                    perc = "%";
                }
                if (this.data[0].index.liqu[key].type === "dec") {
                    stile = "styleAmount";
                } else {
                    stile = "styleRatiosAmount";
                }
                //add the index evolution icons, the space ' ' is a placeholder for the icon
                cell = tableRow.addCell(ratios + perc + ' ', stile);
                if (i < analsysisYears) {
                    var indexT1 = this.data[i].index.liqu[key].amount;
                    var indexT2 = this.data[i + 1].index.liqu[key].amount;
                    this.setIndexEvolution(indexT1, indexT2, cell);
                }


            }
            tableRow.addCell(this.data[0].index.liqu[key].benchmark, "styleNormal");
        }

        //add the leverage ratios table
        var tableIndlev = this.printReportAddTableIndlev(report);

        for (var key in this.data[0].index.lev) {
            var tableRow = tableIndlev.addRow("styleTablRows");
            tableRow.addCell(qsTr(this.data[0].index.lev[key].description), "styleTablRows");
            if (this.dialogparam.formulascolumn) {
                tableRow.addCell(this.data[0].index.lev[key].formula, "styleNormal");
            }
            for (var i = this.data.length - 1; i >= 0; i--) {
                var ratios = this.data[i].index.lev[key].amount;
                cell = tableRow.addCell(ratios + "%" + '  ', "styleRatiosAmount");
                if (i < analsysisYears) {
                    var indexT1 = this.data[i].index.lev[key].amount;
                    var indexT2 = this.data[i + 1].index.lev[key].amount;
                    this.setIndexEvolution(indexT1, indexT2, cell);
                }
            }
            tableRow.addCell(this.data[0].index.lev[key].benchmark, "styleNormal");
        }

        //add the profitability ratios table
        var tableindprof = this.printReportAddTableIndprof(report);

        for (var key in this.data[0].index.red) {
            var tableRow = tableindprof.addRow("styleTablRows");
            tableRow.addCell(qsTr(this.data[0].index.red[key].description), "styleTablRows");
            if (this.dialogparam.formulascolumn) {
                tableRow.addCell(this.data[0].index.red[key].formula, "styleNormal");
            }
            for (var i = this.data.length - 1; i >= 0; i--) {
                var ratios = this.data[i].index.red[key].amount;
                cell = tableRow.addCell(ratios + "%" + '  ', "styleRatiosAmount");
                if (i < analsysisYears) {
                    var indexT1 = this.data[i].index.red[key].amount;
                    var indexT2 = this.data[i + 1].index.red[key].amount;
                    this.setIndexEvolution(indexT1, indexT2, cell);
                }
            }
            tableRow.addCell(this.data[0].index.red[key].benchmark, "styleNormal");
        }

        //add the efficency ratios table
        var tableindeff = this.printReportAddTableIndeff(report);

        for (var key in this.data[0].index.eff) {
            var tableRow = tableindeff.addRow("styleTablRows");
            tableRow.addCell(qsTr(this.data[0].index.eff[key].description), "styleTablRows");
            if (this.dialogparam.formulascolumn) {
                tableRow.addCell(this.data[0].index.eff[key].formula, "styleNormal");
            }
            for (var i = this.data.length - 1; i >= 0; i--) {
                var ratios = this.data[i].index.eff[key].amount;
                tableRow.addCell(this.toLocaleAmountFormat(ratios), "styleAmount");
            }
        }

        report.addPageBreak();

        var year = "";
        var sep = "";

        report.addParagraph(qsTr("DUPONT SCHEME "), "styleGroupTitles");
        var Arrayindexcurr;
        var Arrayindexprec;

        if (this.data[0].isBudget === true) {
            Arrayindexcurr = 1;
            Arrayindexprec = 2;
        } else {
            Arrayindexcurr = 0;
            Arrayindexprec = 1;
        }

        var tabledupont = this.printReportAddTableDupont(report);
        var tableRow = tabledupont.addRow();
        tableRow.addCell(" ", "emptyCells", 5);
        tableRow.addCell(qsTr("Current"), "styleTableHeader");
        tableRow.addCell(qsTr("Previous"), "styleTableHeader");

        var tableRow = tabledupont.addRow();
        tableRow.addCell("ROI (ROT*MOL)", 'styleTitlesTotAmount', 2);
        tableRow.addCell(" ", "emptyCells", 3);
        var balance = 0;
        if (this.data[Arrayindexcurr])
            balance = this.data[Arrayindexcurr].DupontData.roi;
        tableRow.addCell(this.toLocaleAmountFormat(balance) + "%", "styleTotAmount");
        balance = 0;
        if (this.data[Arrayindexprec])
            balance = this.data[Arrayindexprec].DupontData.roi;
        tableRow.addCell(this.toLocaleAmountFormat(balance) + "%", "styleTotAmount");

        //2
        var tableRow = tabledupont.addRow();
        tableRow.addCell(" ", "emptyCells", 1);
        tableRow.addCell("ROT", 'styleUnderGroupTitles');
        tableRow.addCell(" ", "emptyCells", 3);
        var balance = 0;
        if (this.data[Arrayindexcurr])
            balance = this.data[Arrayindexcurr].DupontData.rot;
        tableRow.addCell(this.toLocaleAmountFormat(balance), "styleMidTotal");
        balance = 0;
        if (this.data[Arrayindexprec])
            balance = this.data[Arrayindexprec].DupontData.rot;
        tableRow.addCell(this.toLocaleAmountFormat(balance), "styleMidTotal");

        //3
        var tableRow = tabledupont.addRow();
        tableRow.addCell(" ", "emptyCells", 1);
        tableRow.addCell("MOL", 'styleUnderGroupTitles');
        tableRow.addCell(" ", "emptyCells", 3);
        var balance = 0;
        if (this.data[Arrayindexcurr])
            balance = this.data[Arrayindexcurr].DupontData.mol;
        tableRow.addCell(this.toLocaleAmountFormat(balance), "styleMidTotal");
        balance = 0;
        if (this.data[Arrayindexprec])
            balance = this.data[Arrayindexprec].DupontData.mol;
        tableRow.addCell(this.toLocaleAmountFormat(balance), "styleMidTotal");

        //4
        var tableRow = tabledupont.addRow();
        tableRow.addCell(qsTr("ROT (Capital:Sales)"), 'styleTitlesTotAmount', 2);
        tableRow.addCell(" ", "emptyCells", 3);
        var balance = 0;
        if (this.data[Arrayindexcurr])
            balance = this.data[Arrayindexcurr].DupontData.rot;
        tableRow.addCell(this.toLocaleAmountFormat(balance), "styleTotAmount");
        balance = 0;
        if (this.data[Arrayindexprec])
            balance = this.data[Arrayindexprec].DupontData.rot;
        tableRow.addCell(this.toLocaleAmountFormat(balance), "styleTotAmount");


        //5
        var tableRow = tabledupont.addRow();
        tableRow.addCell(" ", "emptyCells", 1);
        tableRow.addCell(qsTr("Capital"), 'styleUnderGroupTitles');
        tableRow.addCell(" ", "emptyCells", 3);
        var balance = 0;
        if (this.data[Arrayindexcurr])
            balance = this.data[Arrayindexcurr].DupontData.capital;
        tableRow.addCell(this.toLocaleAmountFormat(balance), "styleMidTotal");
        balance = 0;
        if (this.data[Arrayindexprec])
            balance = this.data[Arrayindexprec].DupontData.capital;
        tableRow.addCell(this.toLocaleAmountFormat(balance), "styleMidTotal");

        //6
        var tableRow = tabledupont.addRow();
        tableRow.addCell(" ", "emptyCells", 1);
        tableRow.addCell(qsTr("Sales"), 'styleUnderGroupTitles');
        tableRow.addCell(" ", "emptyCells", 3);
        var balance = 0;
        if (this.data[Arrayindexcurr])
            balance = this.data[Arrayindexcurr].DupontData.sales;
        tableRow.addCell(this.toLocaleAmountFormat(balance), "styleMidTotal");
        balance = 0;
        if (this.data[Arrayindexprec])
            balance = this.data[Arrayindexprec].DupontData.sales;
        tableRow.addCell(this.toLocaleAmountFormat(balance), "styleMidTotal");

        //7
        var tableRow = tabledupont.addRow();
        tableRow.addCell(qsTr("MOL (Sales:Ebit)"), 'styleTitlesTotAmount', 2);
        tableRow.addCell(" ", "emptyCells", 3);
        var balance = 0;
        if (this.data[Arrayindexcurr])
            balance = this.data[Arrayindexcurr].DupontData.mol;
        tableRow.addCell(this.toLocaleAmountFormat(balance), "styleTotAmount");
        balance = 0;
        if (this.data[Arrayindexprec])
            balance = this.data[Arrayindexprec].DupontData.mol;
        tableRow.addCell(this.toLocaleAmountFormat(balance), "styleTotAmount");

        //8
        var tableRow = tabledupont.addRow();
        tableRow.addCell(qsTr("Capital (Current asset+Fixed asset)"), 'styleTitlesTotAmount', 3);
        tableRow.addCell(" ", "emptyCells", 2);
        var balance = 0;
        if (this.data[Arrayindexcurr])
            balance = this.data[Arrayindexcurr].DupontData.capital;
        tableRow.addCell(this.toLocaleAmountFormat(balance), "styleTotAmount");
        balance = 0;
        if (this.data[Arrayindexprec])
            balance = this.data[Arrayindexprec].DupontData.capital;
        tableRow.addCell(this.toLocaleAmountFormat(balance), "styleTotAmount");

        //9
        var tableRow = tabledupont.addRow();
        tableRow.addCell(" ", "emptyCells", 1);
        tableRow.addCell(qsTr("Current asset"), 'styleUnderGroupTitles');
        tableRow.addCell(" ", "emptyCells", 3);
        var balance = 0;
        if (this.data[Arrayindexcurr])
            balance = this.data[Arrayindexcurr].DupontData.CurrentAsset;
        tableRow.addCell(this.toLocaleAmountFormat(balance), "styleMidTotal");
        balance = 0;
        if (this.data[Arrayindexprec])
            balance = this.data[Arrayindexprec].DupontData.CurrentAsset;
        tableRow.addCell(this.toLocaleAmountFormat(balance), "styleMidTotal");

        //10
        var tableRow = tabledupont.addRow();
        tableRow.addCell(" ", "emptyCells", 2);
        tableRow.addCell(qsTr("Liquidity 🠑xxx"));
        tableRow.addCell(" ", "emptyCells", 2);
        var balance = 0;
        if (this.data[Arrayindexcurr])
            balance = this.data[Arrayindexcurr].DupontData.liqu;
        tableRow.addCell(this.toLocaleAmountFormat(balance), "styleAmount");
        balance = 0;
        if (this.data[Arrayindexprec])
            balance = this.data[Arrayindexprec].DupontData.liqu;
        tableRow.addCell(this.toLocaleAmountFormat(balance), "styleAmount");

        //11
        var tableRow = tabledupont.addRow();
        tableRow.addCell(" ", "emptyCells", 2);
        tableRow.addCell(qsTr("Credits"));
        tableRow.addCell(" ", "emptyCells", 2);
        var balance = 0;
        if (this.data[Arrayindexcurr])
            balance = this.data[Arrayindexcurr].DupontData.cred;
        tableRow.addCell(this.toLocaleAmountFormat(balance), "styleAmount");
        balance = 0;
        if (this.data[Arrayindexprec])
            balance = this.data[Arrayindexprec].DupontData.cred;
        tableRow.addCell(this.toLocaleAmountFormat(balance), "styleAmount");

        //12
        var tableRow = tabledupont.addRow();
        tableRow.addCell(" ", "emptyCells", 2);
        tableRow.addCell(qsTr("Stocks"));
        tableRow.addCell(" ", "emptyCells", 2);
        var balance = 0;
        if (this.data[Arrayindexcurr])
            balance = this.data[Arrayindexcurr].DupontData.stoc;
        tableRow.addCell(this.toLocaleAmountFormat(balance), "styleAmount");
        balance = 0;
        if (this.data[Arrayindexprec])
            balance = this.data[Arrayindexprec].DupontData.stoc;
        tableRow.addCell(this.toLocaleAmountFormat(balance), "styleAmount");

        //13
        var tableRow = tabledupont.addRow();
        tableRow.addCell(" ", "emptyCells", 1);
        tableRow.addCell(qsTr("Fixed asset"), 'styleUnderGroupTitles');
        tableRow.addCell(" ", "emptyCells", 3);
        var balance = 0;
        if (this.data[Arrayindexcurr])
            balance = this.data[Arrayindexcurr].DupontData.FixedAsset;
        tableRow.addCell(this.toLocaleAmountFormat(balance), "styleMidTotal");
        balance = 0;
        if (this.data[Arrayindexprec])
            balance = this.data[Arrayindexprec].DupontData.FixedAsset;
        tableRow.addCell(this.toLocaleAmountFormat(balance), "styleMidTotal");

        //14
        var tableRow = tabledupont.addRow();
        tableRow.addCell(qsTr("Sales"), 'styleTitlesTotAmount');
        tableRow.addCell(" ", "emptyCells", 4);
        var balance = 0;
        if (this.data[Arrayindexcurr])
            balance = this.data[Arrayindexcurr].DupontData.sales;
        tableRow.addCell(this.toLocaleAmountFormat(balance), "styleTotAmount");
        balance = 0;
        if (this.data[Arrayindexprec])
            balance = this.data[Arrayindexprec].DupontData.sales;
        tableRow.addCell(this.toLocaleAmountFormat(balance), "styleTotAmount");

        //15
        var tableRow = tabledupont.addRow();
        tableRow.addCell(qsTr("Ebit (Sales-Total Costs)"), 'styleTitlesTotAmount', 3);
        tableRow.addCell(" ", "emptyCells", 2);
        var balance = 0;
        if (this.data[Arrayindexcurr])
            balance = this.data[Arrayindexcurr].DupontData.ebit;
        tableRow.addCell(this.toLocaleAmountFormat(balance), "styleTotAmount");
        balance = 0;
        if (this.data[Arrayindexprec])
            balance = this.data[Arrayindexprec].DupontData.ebit;
        tableRow.addCell(this.toLocaleAmountFormat(balance), "styleTotAmount");

        //16
        var tableRow = tabledupont.addRow();
        tableRow.addCell(" ", "emptyCells", 1);
        tableRow.addCell(qsTr("Total Costs"), 'styleUnderGroupTitles');
        tableRow.addCell(" ", "emptyCells", 3);
        var balance = 0;
        if (this.data[Arrayindexcurr])
            balance = this.data[Arrayindexcurr].DupontData.TotCosts;
        tableRow.addCell(this.toLocaleAmountFormat(balance), "styleMidTotal");
        balance = 0;
        if (this.data[Arrayindexprec])
            balance = this.data[Arrayindexprec].DupontData.TotCosts;
        tableRow.addCell(this.toLocaleAmountFormat(balance), "styleMidTotal");

        //17
        var tableRow = tabledupont.addRow();
        tableRow.addCell(" ", "emptyCells", 2);
        tableRow.addCell(qsTr("Merchandise costs"));
        tableRow.addCell(" ", "emptyCells", 2);
        var balance = 0;
        if (this.data[Arrayindexcurr])
            balance = this.data[Arrayindexcurr].DupontData.MerchCost;
        tableRow.addCell(this.toLocaleAmountFormat(balance), "styleAmount");
        balance = 0;
        if (this.data[Arrayindexprec])
            balance = this.data[Arrayindexprec].DupontData.MerchCost;
        tableRow.addCell(this.toLocaleAmountFormat(balance), "styleAmount");

        //18
        var tableRow = tabledupont.addRow();
        tableRow.addCell(" ", "emptyCells", 2);
        tableRow.addCell(qsTr("Personal costs"));
        tableRow.addCell(" ", "emptyCells", 2);
        var balance = 0;
        if (this.data[Arrayindexcurr])
            balance = this.data[Arrayindexcurr].DupontData.PersonelCost;
        tableRow.addCell(this.toLocaleAmountFormat(balance), "styleAmount");
        balance = 0;
        if (this.data[Arrayindexprec])
            balance = this.data[Arrayindexprec].DupontData.PersonelCost;
        tableRow.addCell(this.toLocaleAmountFormat(balance), "styleAmount");


        //19
        var tableRow = tabledupont.addRow();
        tableRow.addCell(" ", "emptyCells", 2);
        tableRow.addCell(qsTr("Different costs"));
        tableRow.addCell(" ", "emptyCells", 2);
        var balance = 0;
        if (this.data[Arrayindexcurr])
            balance = this.data[Arrayindexcurr].DupontData.DifferentCost;
        tableRow.addCell(this.toLocaleAmountFormat(balance), "styleAmount");
        balance = 0;
        if (this.data[Arrayindexprec])
            balance = this.data[Arrayindexprec].DupontData.DifferentCost;
        tableRow.addCell(this.toLocaleAmountFormat(balance), "styleAmount");

        //20
        var tableRow = tabledupont.addRow();
        tableRow.addCell(" ", "emptyCells", 1);
        tableRow.addCell(qsTr("Sales"), 'styleUnderGroupTitles');
        tableRow.addCell(" ", "emptyCells", 3);
        var balance = 0;
        if (this.data[Arrayindexcurr])
            balance = this.data[Arrayindexcurr].DupontData.sales;
        tableRow.addCell(this.toLocaleAmountFormat(balance), "styleMidTotal");
        balance = 0;
        if (this.data[Arrayindexprec])
            balance = this.data[Arrayindexprec].DupontData.sales;
        tableRow.addCell(this.toLocaleAmountFormat(balance), "styleMidTotal");

        report.addPageBreak();


        var tableAltmanIndex = this.printtableAltmanIndex(report);
        var yearcolumns = 0;
        var tableRow = tableAltmanIndex.addRow("styleTablRows");
        for (var i = this.data.length - 1; i >= 0; i--) {
            var ratios = this.data[i].AltmanIndex;
            tableRow.addCell(this.data[i].AltmanIndex, this.altmanScoreType(this.data[i].AltmanIndex));
        }
        var tableRow = tableAltmanIndex.addRow("styleTablRows");
        tableRow.addCell(qsTr("formula used for the calculation  = 0.717 X1 + 0.847 X2 +3.107 X3 +0.420 X4 + 0.998 X5"), "styleNormal", this.yearsColumnCount(yearcolumns));
        var tableRow = tableAltmanIndex.addRow("styleTablRows");
        tableRow.addCell("X1 = cuas / tota", "styleNormal", this.yearsColumnCount(yearcolumns));
        var tableRow = tableAltmanIndex.addRow("styleTablRows");
        tableRow.addCell("X2 = reut / tota ", "styleNormal", this.yearsColumnCount(yearcolumns));
        var tableRow = tableAltmanIndex.addRow("styleTablRows");
        tableRow.addCell("X3 = Ebit / tota ", "styleNormal", this.yearsColumnCount(yearcolumns));
        var tableRow = tableAltmanIndex.addRow("styleTablRows");
        tableRow.addCell("X4 = pant / totp", "styleNormal", this.yearsColumnCount(yearcolumns));
        var tableRow = tableAltmanIndex.addRow("styleTablRows");
        tableRow.addCell("X5 = sale / tota", "styleNormal", this.yearsColumnCount(yearcolumns));

        report.addParagraph(qsTr("for values > of 3 correspond to low probability of a financial crisis"), "styleParagraphs");
        report.addParagraph(qsTr("for values >= of 1.8 but <= to 3 there are possibilities of a financial crisis, to be kept under control"), "styleParagraphs");
        report.addParagraph(qsTr("for values < to 1.8 there is a strong probability of a financial crisis"), "styleParagraphs");


        return report;


    }

    /**
     * set the style of the difference value.
     * @Param {*} value the difference between the accounting total and the calculating total
     */
    setDifferenceStyle(value) {
        var differenceStyle;
        if (value != 0) {
            differenceStyle = "styleDifferencesFound";
        } else {
            differenceStyle = "styleAmount";
        }
        return differenceStyle;
    }

    /**
     * if there are differences between the accounting total and the calculated total, the user is notified.
     */
    showDifferencesWarning() {
        var WrnMsgg = qsTr("Warning: The difference between the 'Accounting total' and the 'Calculated total' columns should be 0.\n Checks that the groups used are correct. ");
        return WrnMsgg;
    }

    /**
     * @description control the result of the Altman index, and set the correct style, there are three different possibilites, therefore three different styles.
     * @Param {number} amount
     * @returns the style for the amount
     */
    altmanScoreType(amount) {
        var type = "";
        if (amount > 3) {
            type = 'styleZLow';
        } else if (amount <= 3 && amount >= 1.8) {
            type = 'styleZmid';
        } else {
            type = 'styleZprob';
        }
        return type;
    }

    /**
     * @description The method reads the account table of the current file and saves the id of all the groups in an array.
     * @returns an object containing the list of the groups found in the file
     */
    loadGroups() {
        var groupList = {};
        if (!this.banDocument) {
            return groupList;
        }
        var table = this.banDocument.table("Accounts");
        if (!table) {
            return groupList;
        }
        for (var i = 0; i < table.rowCount; i++) {
            var tRow = table.row(i);

            var groupId = tRow.value('Group');

            if (groupId.length > 0) {
                groupList += groupId + ";";

            }
        }
        return groupList;
    }

    /**
     * @description The method reads the account table of the current file and saves the id of all the accounts in an array.
     * @returns an object containing the list of the accounts found in the file
     */

    loadAccounts() {
        var accountList = {};
        if (!this.banDocument) {
            return groupList;
        }
        var table = this.banDocument.table("Accounts");
        if (!table) {
            return accountList;
        }
        for (var i = 0; i < table.rowCount; i++) {
            var tRow = table.row(i);

            var accountId = tRow.value('Account');

            if (accountId.length > 0) {
                accountList += accountId + ";";

            }
        }
        return accountList;
    }

    /**
     * @description set the different styles for the report elements.
     * @returns the stylesheet
     */
    getReportStyle() {
        //CREATE THE STYLE FOR THE REPORT
        //create the style
        var textCSS = "";
        var file = Banana.IO.getLocalFile("file:script/financialStatementAnalysis.css");
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
        style = stylesheet.addStyle("tableCompanyInfo");
        style = stylesheet.addStyle("tableUsedSetting");
        style = stylesheet.addStyle("tableBalance");
        style = stylesheet.addStyle("TableBalanceSumsControl");
        style = stylesheet.addStyle("tableConCe");
        style = stylesheet.addStyle("tableConCeSumsControl");
        style = stylesheet.addStyle("tableIndliq");
        style = stylesheet.addStyle("tableIndlev");
        style = stylesheet.addStyle("tableIndprof");
        style = stylesheet.addStyle("tableDupont");
        style = stylesheet.addStyle("myTableAltmanIndex");


        //Style for the tables header
        style = stylesheet.addStyle(".styleTableHeader");

        //Style for the company info rows
        style = stylesheet.addStyle(".styleCompanyInfocells");

        //style for the group titles
        style = stylesheet.addStyle(".styleGroupTitles");

        //style for the under-group titles
        style = stylesheet.addStyle(".styleUnderGroupTitles");

        //Style for the normal elements
        style = stylesheet.addStyle(".styleNormal");

        //Style for amounts
        style = stylesheet.addStyle(".styleAmount");

        //style for the accounting mid totals
        style = stylesheet.addStyle(".styleMidTotal");

        //style for the accounting totals Amount
        style = stylesheet.addStyle(".styleTotAmount");

        //style for the titles of the totals
        style = stylesheet.addStyle(".styleTitlesTotAmount");

        //style fot the ratios  Amount
        style = stylesheet.addStyle(".styleRatiosAmount");

        //style for the  header
        style = stylesheet.addStyle(".header");

        //style for the  footer
        style = stylesheet.addStyle(".footer");

        //style for the pharagraphs
        style = stylesheet.addStyle(".styleParagraphs");

        //style for the Z-score,low prob. of a financial crysis
        style = stylesheet.addStyle(".styleZLow");

        //style for the Z-score,mid prob. of a financial crysis
        style = stylesheet.addStyle(".styleZmid");

        //style for the Z-score,prob. of a financial crysis
        style = stylesheet.addStyle(".styleZprob");



        return stylesheet;
    }

    /**
     * @description It defines the structure of the parameters and gives them a default value.
     * for the representation and use of the necessary parameters, a *dialogparam={}* object has been created.
     * for a question of order for all groups and subgroups of the various layers of the object, has been created a function for every one of them.
     * @returns an object named dialogparam with all the parameters initialized with a default value
     */
    initDialogParam() {
        var dialogparam = {};
        dialogparam.version = "v1.0";
        dialogparam.balance = this.initDialogParamBalance();
        dialogparam.profitandloss = this.initDialogParamProfitLoss();
        dialogparam.ratios = this.initDialogParamRatiosBenchmarks();
        dialogparam.finalresult = this.initDialogParamFinalResult();
        dialogparam.maxpreviousyears = 2;
        dialogparam.numberofdecimals = 2;
        dialogparam.numberofemployees = 0;
        dialogparam.acronymcolumn = true;
        dialogparam.formulascolumn = true;
        dialogparam.includebudgettable = true;

        return dialogparam;
    }

    initDialogParamBalance() {
        var dialogparam = {};
        dialogparam.ca = this.initDialogParamCurrentAsset();
        dialogparam.fa = this.initDialogParamFixedAsset();
        dialogparam.dc = this.initDialogParamDebtCapital();
        dialogparam.oc = this.initDialogParamOwnCapital();

        return dialogparam;

    }

    initDialogParamCurrentAsset() {
        var dialogparam = {};
        dialogparam.liqu = {};
        dialogparam.liqu.gr = "100;106;109";
        dialogparam.liqu.description = qsTr("Liquidity");
        dialogparam.liqu.bclass = "1";
        dialogparam.cred = {};
        dialogparam.cred.gr = "110;114";
        dialogparam.cred.description = qsTr("Credits");
        dialogparam.cred.bclass = "1";
        dialogparam.stoc = {};
        dialogparam.stoc.gr = "120;130";
        dialogparam.stoc.description = qsTr("Stocks");
        dialogparam.stoc.bclass = "1";

        return dialogparam;
    }

    initDialogParamFixedAsset() {
        var dialogparam = {};
        dialogparam.fixa = {};
        dialogparam.fixa.gr = "14";
        dialogparam.fixa.description = qsTr("Fixed Asset");
        dialogparam.fixa.bclass = "1";


        return dialogparam;
    }

    initDialogParamDebtCapital() {
        var dialogparam = {};
        dialogparam.stdc = {};
        dialogparam.stdc.gr = "20";
        dialogparam.stdc.description = qsTr("Short term debt capital");
        dialogparam.stdc.bclass = "2";
        dialogparam.ltdc = {};
        dialogparam.ltdc.gr = "24";
        dialogparam.ltdc.description = qsTr("Long term debt capital");
        dialogparam.ltdc.bclass = "2";
        return dialogparam;
    }

    initDialogParamOwnCapital() {
        var dialogparam = {};
        dialogparam.obca = {};
        dialogparam.obca.gr = "280;298";
        dialogparam.obca.description = qsTr("Own base capital");
        dialogparam.obca.bclass = "2";
        dialogparam.reut = {};
        dialogparam.reut.gr = "290;295;296;297";
        dialogparam.reut.description = qsTr("Reserves and profits");
        dialogparam.reut.bclass = "2";

        return dialogparam;
    }

    initDialogParamProfitLoss() {
        var dialogparam = {};
        dialogparam.satu = {};
        dialogparam.satu.gr = "3";
        dialogparam.satu.description = qsTr("Sales turnover");
        dialogparam.satu.bclass = "4";
        dialogparam.cofm = {};
        dialogparam.cofm.gr = "4";
        dialogparam.cofm.description = qsTr("Cost of merchandise and services");
        dialogparam.cofm.bclass = "3";
        dialogparam.cope = {};
        dialogparam.cope.gr = "5";
        dialogparam.cope.description = qsTr("Personnel costs");
        dialogparam.cope.bclass = "3";
        dialogparam.codi = {};
        dialogparam.codi.gr = "6";
        dialogparam.codi.description = qsTr("Different costs");
        dialogparam.codi.bclass = "3";
        dialogparam.amre = {};
        dialogparam.amre.gr = "68";
        dialogparam.amre.description = qsTr("Depreciations and adjustments");
        dialogparam.amre.bclass = "3";
        dialogparam.inte = {};
        dialogparam.inte.gr = "69";
        dialogparam.inte.description = qsTr("Interests");
        dialogparam.inte.bclass = "3";
        return dialogparam;
    }

    initDialogParamFinalResult() {
        var dialogparam = {};
        dialogparam.fire = {};
        dialogparam.fire.gr = "E7";
        dialogparam.fire.description = qsTr("Final Result");
        return dialogparam;
    }

    /**
     * added the prefix prof because elements: .roe, .roi, .ros, .mol  already exists.
     */
    initDialogParamRatiosBenchmarks() {
        var dialogparam = {};
        dialogparam.liquidityratios = this.initDialogParamLiquidityBenchmarks();
        dialogparam.leverageratios = this.initDialogParamleverageBenchmarks();
        dialogparam.profitabilityratios = this.initDialogParamProfitabilityBenchmarks();

        return dialogparam;

    }
    initDialogParamLiquidityBenchmarks() {
        var dialogparam = {};
        dialogparam.liqu1 = {};
        dialogparam.liqu1.description = qsTr("Cash ratio");
        dialogparam.liqu1.value = "10%-35%";
        dialogparam.liqu2 = {};
        dialogparam.liqu2.description = qsTr("Quick ratio");
        dialogparam.liqu2.value = "100%";
        dialogparam.liqu3 = {};
        dialogparam.liqu3.description = qsTr("Current ratio");
        dialogparam.liqu3.value = "150%";
        dialogparam.netcurrass = {};
        dialogparam.netcurrass.description = qsTr("Net Current Asset");
        dialogparam.netcurrass.value = ">0";

        return dialogparam;
    }
    initDialogParamleverageBenchmarks() {
        var dialogparam = {};
        dialogparam.cirract = {};
        dialogparam.cirract.description = qsTr("Degree of Circulating Asset");
        dialogparam.cirract.value = "60%";
        dialogparam.fixass = {};
        dialogparam.fixass.description = qsTr("Percentage Fixed Asset");
        dialogparam.fixass.value = "40%";
        dialogparam.lvldeb = {};
        dialogparam.lvldeb.description = qsTr("Debt ratio");
        dialogparam.lvldeb.value = "40%-70%";
        dialogparam.lvlequ = {};
        dialogparam.lvlequ.description = qsTr("Equity ratio");
        dialogparam.lvlequ.value = "30%-60%";
        dialogparam.lvlsel = {};
        dialogparam.lvlsel.description = qsTr("Self financing ratio");
        dialogparam.lvlsel.value = "33,3%";
        dialogparam.covfix = {};
        dialogparam.covfix.description = qsTr("Fixed Asset Coverage");
        dialogparam.covfix.value = ">100%";

        return dialogparam;
    }
    initDialogParamProfitabilityBenchmarks() {
        var dialogparam = {};
        dialogparam.profroe = {};
        dialogparam.profroe.description = "ROE";
        dialogparam.profroe.value = "8%-14%";
        dialogparam.profroi = {};
        dialogparam.profroi.description = "ROI";
        dialogparam.profroi.value = "10%";
        dialogparam.profros = {};
        dialogparam.profros.description = "ROS";
        dialogparam.profros.value = ">0";
        dialogparam.profmol = {};
        dialogparam.profmol.description = "MOL";
        dialogparam.profmol.value = "40%";
        dialogparam.profebm = {};
        dialogparam.profebm.description = qsTr("EBIT margin");
        dialogparam.profebm.value = "2.4%";
        dialogparam.profmon = {};
        dialogparam.profmon.description = qsTr("Profit margin");
        dialogparam.profmon.value = "1.4%";
        return dialogparam;
    }


    /**
     * @description - assigns the maximum number of previous years to a varaible, if it is less than 5, is reset to 5
     * - calls up the loadDataBudget and the loadDataYear methods by passing the current document to them.
     * - Using the values returned by the loadDataBudget and loadDataYear, the methods for calculating the index, intermediate values, dupont scheme and Altman's index are called up.
     * - Each value returned by the calculation methods is assigned to an object which is then inserted in the "date"[] array.
     * unlike the loadDataBudget the loadDataYear is called up for each prevous year of the document.
     */
    loadData() {
        this.data = [];
        var yeardocument = this.banDocument;
        var i = 0;

        // only if the table budget exists and if the User choosed to use it.
        var withBudget = yeardocument.info("Budget", "TableNameXml");
        var isIncluded = this.dialogparam.includebudgettable;
        if (withBudget && isIncluded) {
            var dataBudget = this.loadDataBudget(yeardocument);
            var CalculatedData = this.calculateData(dataBudget, yeardocument);
            var index = this.calculateIndex(dataBudget, CalculatedData);
            var DupontData = this.createDupontData(dataBudget, CalculatedData, index);
            var AltmanIndex = this.calculateAltmanIndex(dataBudget, CalculatedData, index)
            dataBudget.CalculatedData = CalculatedData;
            dataBudget.index = index;
            dataBudget.DupontData = DupontData;
            dataBudget.AltmanIndex = AltmanIndex;
            this.data.push(dataBudget);
        }

        while (yeardocument && i <= this.dialogparam.maxpreviousyears) {
            var dataYear = this.loadDataYear(yeardocument);
            var CalculatedData = this.calculateData(dataYear, yeardocument);
            var index = this.calculateIndex(dataYear, CalculatedData);
            var DupontData = this.createDupontData(dataYear, CalculatedData, index);
            var AltmanIndex = this.calculateAltmanIndex(dataYear, CalculatedData, index)
            dataYear.CalculatedData = CalculatedData;
            dataYear.index = index;
            dataYear.DupontData = DupontData;
            dataYear.AltmanIndex = AltmanIndex;
            this.data.push(dataYear);
            yeardocument = yeardocument.previousYear();
            i++;
        }
    }

    /**
     * @description This method handles the loading of data from the budget table.
     *- Check that the Quote table exists in the current document
     *- It starts from the parameters of the main file and assigns them to a variable
     *- calls the loadgroups() method and assigns its return to a varaible
     *- set the variable budgetBalaces to "true".
     *- For each parameter calls the loadDaraParam() method
     *- Back to the processed parameters   
     *- set the start date and the end date with the string "budget", this information is going to be used on the company info's table.
     *If there is no budget table it is not executed.
     * @Param {Banana Document} _banDocument: the current document.
     */
    loadDataBudget(_banDocument) {
        if (!this.banDocument || !_banDocument) {
            return;
        }

        var dialogparam = JSON.stringify(this.dialogparam);
        dialogparam = JSON.parse(dialogparam);

        var groupList = this.loadGroups();
        var budgetBalances = true;
        for (var key in dialogparam) {
            this.loadDataParam(dialogparam[key], groupList, budgetBalances, _banDocument);
        }
        dialogparam.isBudget = true;
        dialogparam.period = {};
        dialogparam.period.StartDate = qsTr("Budget");
        dialogparam.period.EndDate = qsTr("Budget");
        dialogparam.period.Type = "B";
        return dialogparam;
    }

    /**
     * @description This method handles the loading of data from the record table
     *- Check if the document exists
     *- It starts from the parameters of the main file and assigns them to a variable
     *- calls the loadgroups() method and assigns its return to another object.
     *- For each parameter, call the loadDaraParam() method.
     *- Adds a new index to the dialogparam{} object containing the file's opening and closing date.
     *- set the start date and the end date with the current file dates, these information is going to be used on the company info's table.
     *- Returns the processed parameters
     * @Param {Banana Document} _banDocument: the current document.
     */
    loadDataYear(_banDocument) {
        if (!this.banDocument || !_banDocument) {
            return;
        }
        var dialogparam = JSON.stringify(this.dialogparam);
        dialogparam = JSON.parse(dialogparam);

        var groupList = this.loadGroups();
        var budgetBalances = false;
        for (var key in dialogparam) {
            this.loadDataParam(dialogparam[key], groupList, budgetBalances, _banDocument);
        }
        dialogparam.isBudget = false;
        dialogparam.period = {};
        dialogparam.period.StartDate = _banDocument.info("AccountingDataBase", "OpeningDate");
        dialogparam.period.EndDate = _banDocument.info("AccountingDataBase", "ClosureDate");
        dialogparam.period.Type = "Y";
        return dialogparam;
    }

    /**
     * @description cycles the parameters it receives, checking that they exist, and that the index that defines the group exists.
     * checks whether the elements in the index *gr* are accounts or groups.
     * formats the groups it finds so that it can use the *currentBalance()/budgetBalance() calculation functions.
     * assigns the amount of groups and accounts to dialogparam.balance.
     * @Param {object} dialogparam:  an object containing the parameters recovered from the dialog setting
     * @Param {object} groupList: the list of groups founded in the current document
     * @Param {Banana Document} _banDocument: the current document
     */
    loadDataParam(dialogparam, groupList, budgetBalances, _banDocument) {

        for (var key in dialogparam) {
            if (dialogparam[key] && dialogparam[key].gr) {
                var value = dialogparam[key].gr.toString();
                var valuelist = value.split(";");
                value = "";
                var isAccount = true;
                for (var token in valuelist) {
                    var token = valuelist[token];
                    if (value.length > 0)
                        value += "|";
                    if (groupList.indexOf(token) >= 0) {
                        token = token;
                        isAccount = false;
                    }
                    value += token;
                }
                if (!isAccount)
                    value = "Gr=" + value;
                var bal;
                if (budgetBalances) {
                    bal = _banDocument.budgetBalance(value, '', '', null);
                } else {
                    bal = _banDocument.currentBalance(value, '', '', null);
                    //Banana.console.debug(bal.amount);
                }
                //Banana.console.debug(JSON.stringify(bal.balance));
                if (bal) {
                    var mult = -1;
                    if (dialogparam[key].bclass === "1") {
                        dialogparam[key].balance = bal.balance;
                    } else if (dialogparam[key].bclass === "2") {
                        dialogparam[key].balance = Banana.SDecimal.multiply(bal.balance, mult);
                    } else if (dialogparam[key].bclass === "3") {
                        dialogparam[key].balance = bal.total;
                    } else if (dialogparam[key].bclass === "4" || !dialogparam[key].bclass) {
                        dialogparam[key].balance = Banana.SDecimal.multiply(bal.total, mult);
                    } else {
                        dialogparam[key].balance = bal.balance;
                    }
                    //Banana.console.debug(JSON.stringify(dialogparam[key]));
                    //Banana.console.debug(JSON.stringify("********************************"));
                    if (dialogparam[key].balance === "") {
                        dialogparam[key].balance = "0.00";
                    }
                }
            } else {
                if (typeof(dialogparam[key]) === "object")
                    this.loadDataParam(dialogparam[key], groupList, budgetBalances, _banDocument);
            }
        }
    }

    /**
     * @description This method is used for the calculation of total or reclassification elements, more precisely:
     * Instantiate a *CalculatedData= {}* object that will contain all the calculated data.
     * Calculate the various elements.
     * @Param {object} data: the data object created thanks to loadData methods, containing the values and the sums of the paramters recovered from the dialog
     * @Param {object} _banDocument: the startDate of the document, wich is located in the File Info.
     * @returns an object containing the calculated values
     */
    calculateData(data, _banDocument) {
        if (!data || !_banDocument) {
            return null;
        }
        var Calcdata = {};


        /*calculation of total active (with the total of current asset and fixed assets), and checking that they coincide*/
        Calcdata.TotActive = {};

        var Liqu = data.balance.ca.liqu.balance;
        var Credits = data.balance.ca.cred.balance;
        var Stocks = data.balance.ca.stoc.balance;
        var Fixa = data.balance.fa.fixa.balance;
        var Tota1 = Banana.SDecimal.add(Liqu, Credits);
        var Tota2 = Banana.SDecimal.add(Tota1, Stocks);
        Calcdata.CurrentAsset = Tota2;
        Calcdata.FixedAsset = Fixa;
        var Totactive = Banana.SDecimal.add(Tota2, Fixa);
        Calcdata.TotActive = Totactive;

        /*calculate the total assets resulting from the accounting sheet and then use it for controls*/

        Calcdata.TotActiveSheet = {}
        var TotActiveSheet = _banDocument.currentBalance('Gr=1', '', '', null);
        var TotActiveSheetBalance = TotActiveSheet.balance;
        Calcdata.TotActiveSheet = TotActiveSheetBalance;


        Calcdata.ActiveDifference = {};
        var ActDifference = Banana.SDecimal.subtract(Totactive, TotActiveSheetBalance);
        Calcdata.ActiveDifference = ActDifference



        /*calculation of total passive (with the total of debt capital and the own capital*/
        Calcdata.TotPassive = {};

        var Stdc = data.balance.dc.stdc.balance;
        var Ltdc = data.balance.dc.ltdc.balance;
        var Obca = data.balance.oc.obca.balance;
        var Reut = data.balance.oc.reut.balance;
        var Totp1 = Banana.SDecimal.add(Ltdc, Stdc);
        Calcdata.DebtCapital = Totp1;
        var Totp2 = Banana.SDecimal.add(Totp1, Obca);
        Calcdata.OwnCapital = Banana.SDecimal.add(Obca, Reut);
        var TotPassive = Banana.SDecimal.add(Totp2, Reut);
        Calcdata.TotPassive = TotPassive;

        /*calculation of the total passive resulting from the accounting sheet*/

        Calcdata.TotPassiveSheet = {}
        var mult = -1;
        var TotPassiveSheet = _banDocument.currentBalance('Gr=2', '', '', null);
        var TotPassiveSheetBalance = Banana.SDecimal.multiply(TotPassiveSheet.balance, mult);
        Calcdata.TotPassiveSheet = TotPassiveSheetBalance;

        //calculate the difference

        Calcdata.PassiveDifference = {};
        var PassDifference = Banana.SDecimal.subtract(TotPassive, TotPassiveSheetBalance);
        Calcdata.PassiveDifference = PassDifference

        /*calculation of the annual result (profit)*/

        Calcdata.TotAnnual = {};
        Calcdata.TotCosts = {};
        Calcdata.TotSales = {};


        var Sales = data.profitandloss.satu.balance;
        //for the dupont
        Calcdata.TotSales = Sales;

        var Cofm = data.profitandloss.cofm.balance;
        var Cope = data.profitandloss.cope.balance;
        var Codi = data.profitandloss.codi.balance;
        var Amre = data.profitandloss.amre.balance;
        var Inte = data.profitandloss.inte.balance;

        //I need to save each total and then reuse it in other calculations later (ebit, ebitda...).
        var Totce1 = Banana.SDecimal.subtract(Sales, Cofm);
        var Totce2 = Banana.SDecimal.subtract(Totce1, Cope);
        var Totce3 = Banana.SDecimal.subtract(Totce2, Codi);
        var Totce4 = Banana.SDecimal.subtract(Totce3, Amre);
        var Totce5 = Banana.SDecimal.subtract(Totce4, Inte);
        var Totce = Totce5;
        Calcdata.TotAnnual = Totce;

        /*calculation of the resulting annual result */

        Calcdata.TotAnnualSheet = {}

        Calcdata.TotAnnualSheet = data.finalresult.fire.balance;


        //calculate the difference
        Calcdata.TotAnnualDifference = {};
        Calcdata.TotAnnualDifference = Banana.SDecimal.subtract(Calcdata.TotAnnualSheet, Calcdata.TotAnnual);

        // calculate the added value
        Calcdata.AddedValue = {};
        Calcdata.AddedValue = Banana.SDecimal.subtract(Sales, Cofm);

        //Calculate ebit
        Calcdata.Ebit = {};
        Calcdata.Ebit = Totce4;

        //Calculate ebit-da
        Calcdata.EbitDa = {};
        Calcdata.EbitDa = Totce3;

        return Calcdata;
    }

    /**
     * give the value 0.00 to an index, wich is equal to "";
     * @dialogparam {*} index 
     */
    setIndexToZero(index) {
        var zero = "0";
        if (index === "") {
            index = zero;
        }
        return index;
    }

    /**
     * @description Instantiate an *index= {}* object that will contain all the calculated ratios.
     * retrieve the values of the calculated parameters and data.
     * divide the indexes by type thanks to the properties of the objects.
     * assign a value to each index property. (description, benchmark...).
     * calculate the ratios.
     * the values of the benchmarks are set taking the parameters from the dialog
     * @Param {object} data: the data object created thanks to loadData methods, containing the values and the sums of the paramters recovered from the dialog.
     * @Param {object} CalculatedData: the object returned by the CalculateData method containing the values of the calculated elements.
     * @returns an object containing the calulated ratios.
     */
    calculateIndex(data, CalculatedData) {
        var index = {};
        /*
        the numbers in the variables are present to allow each block of index type to have elements with distinct names
        to differentiate the calculation variables, while the others, once given the value, can be re-used in the
        other blocks .
        e.g.: block of liquidity we have for the first block 1, second block 2 and third block 3, for that of leverage equal
        both the various blocks are contradicted by the prefixes
        LIQUIDITY
        prefix variables of liquidity 'l'
        dofl = degree of liquidity
        1/one = reference to index 1
        2/two = reference to index 2
        3/three = reference to index 3
        type=identify if the value is a percentage o a decimal
        */

        index.liqu = {};

        index.liqu.doflone = {};
        index.liqu.doflone.description = qsTr("Cash ratio");
        index.liqu.doflone.type = "perc";
        index.liqu.doflone.formula = "liqu / stdc";
        var liqu = data.balance.ca.liqu.balance;
        var stdc = data.balance.dc.stdc.balance;
        var lcalc1 = Banana.SDecimal.multiply(liqu, 100);
        var lcalc2 = Banana.SDecimal.divide(lcalc1, stdc, { 'decimals': this.dialogparam.numberofdecimals })
        var lris = lcalc2.toString();
        index.liqu.doflone.amount = lris;
        index.liqu.doflone.benchmark = data.ratios.liquidityratios.liqu1.value;

        //degree of liquidity 2
        index.liqu.dofltwo = {};
        index.liqu.dofltwo.description = qsTr("Quick ratio");
        index.liqu.dofltwo.type = "perc";
        index.liqu.dofltwo.formula = "(liqu + cred) / stdc";
        var cred = data.balance.ca.cred.balance;
        var lcalc3 = Banana.SDecimal.add(liqu, cred);
        var lcalc4 = Banana.SDecimal.divide(lcalc3, stdc, { 'decimals': this.dialogparam.numberofdecimals });
        var lcalc4m = Banana.SDecimal.multiply(lcalc4, 100);
        var lris2 = lcalc4m.toString();
        index.liqu.dofltwo.amount = lris2;
        index.liqu.dofltwo.benchmark = data.ratios.liquidityratios.liqu2.value;

        //degree of liquidity 3
        index.liqu.doflthree = {};
        index.liqu.doflthree.description = qsTr("Current ratio");
        index.liqu.doflthree.type = "perc";
        index.liqu.doflthree.formula = "cuas / stdc";
        var cuasone = Banana.SDecimal.add((data.balance.ca.liqu.balance), (data.balance.ca.cred.balance));
        var cuastwo = Banana.SDecimal.add(cuasone, (data.balance.ca.stoc.balance));
        var lcalc5 = Banana.SDecimal.multiply(cuastwo, 100);
        var lcalc6 = Banana.SDecimal.divide(lcalc5, stdc, { 'decimals': this.dialogparam.numberofdecimals });
        var lris3 = lcalc6.toString();
        index.liqu.doflthree.amount = lris3;
        index.liqu.doflthree.benchmark = data.ratios.liquidityratios.liqu3.value;

        // net current assets
        index.liqu.netcuas = {};
        index.liqu.netcuas.description = qsTr("Net Current Asset");
        index.liqu.netcuas.type = "dec";
        index.liqu.netcuas.formula = "cuas-stdc";
        var lcalc7 = Banana.SDecimal.subtract(cuastwo, stdc, { 'decimals': this.dialogparam.numberofdecimals });
        var lris4 = lcalc7.toString();
        lris4 = this.setIndexToZero(lris4);
        index.liqu.netcuas.amount = lris4;
        index.liqu.netcuas.benchmark = data.ratios.liquidityratios.netcurrass.value;


        /*LEVERAGE RATIOS
        leverage variables prefix 'f'
            
        level of debt
        gdin= grado di indebitamento
        gfcp= grado finanziamento cap.proprio
        gdau= grado di autofinanziamento
        */
        index.lev = {};

        //degree of circulating assets
        index.lev.grcuas = {};
        index.lev.grcuas.description = qsTr("Degree of Circulating Asset ");
        index.lev.grcuas.type = "perc";
        index.lev.grcuas.formula = "cuas / tota";
        var totatt = CalculatedData.TotActive;
        var fcalc = Banana.SDecimal.divide(cuastwo, totatt);
        var fcalc = Banana.SDecimal.multiply(fcalc, 100, { 'decimals': this.dialogparam.numberofdecimals });
        var fris = fcalc.toString();
        index.lev.grcuas.amount = fris;
        index.lev.grcuas.benchmark = data.ratios.leverageratios.cirract.value;

        //degree of fixed assets
        index.lev.grfixa = {};
        index.lev.grfixa.description = qsTr("Percentage Fixed Asset");
        index.lev.grfixa.type = "perc";
        index.lev.grfixa.formula = "fixa / tota";
        var fixa = data.balance.fa.fixa.balance;
        var fcalc1 = Banana.SDecimal.divide(fixa, totatt);
        var fcalc1 = Banana.SDecimal.multiply(fcalc1, 100, { 'decimals': this.dialogparam.numberofdecimals });
        var fris1 = fcalc1.toString();
        index.lev.grfixa.amount = fris1;
        index.lev.grfixa.benchmark = data.ratios.leverageratios.fixass.value;



        //Level of debt
        index.lev.gdin = {};
        index.lev.gdin.description = qsTr("Debt ratio");
        index.lev.gdin.type = "perc";
        index.lev.gdin.formula = "(stdc+ltdc) / totp";
        var deca = Banana.SDecimal.add((data.balance.dc.ltdc.balance), (data.balance.dc.stdc.balance));
        var tocaone = Banana.SDecimal.add(data.balance.oc.obca.balance, data.balance.oc.reut.balance);
        var tocatwo = Banana.SDecimal.add(data.balance.dc.ltdc.balance, data.balance.dc.stdc.balance);
        var toca = Banana.SDecimal.add(tocaone, tocatwo)
        var fcalc2 = Banana.SDecimal.multiply(deca, 100);
        var fcalc3 = Banana.SDecimal.divide(fcalc2, toca, { 'decimals': this.dialogparam.numberofdecimals });
        var fris2 = fcalc3.toString();
        index.lev.gdin.amount = fris2;
        index.lev.gdin.benchmark = data.ratios.leverageratios.lvldeb.value;


        //Level of equity finance
        index.lev.gfcp = {};
        index.lev.gfcp.description = qsTr("Equity ratio");
        index.lev.gfcp.type = "perc";
        index.lev.gfcp.formula = "owca / totp";
        var owca = Banana.SDecimal.add((data.balance.oc.obca.balance), (data.balance.oc.reut.balance));
        var fcalc4 = Banana.SDecimal.multiply(owca, 100);
        var fcalc5 = Banana.SDecimal.divide(fcalc4, toca, { 'decimals': this.dialogparam.numberofdecimals });
        var fris3 = fcalc5.toString();
        index.lev.gfcp.amount = fris3;
        index.lev.gfcp.benchmark = data.ratios.leverageratios.lvlequ.value;

        //Level of self-leverage
        index.lev.gdau = {};
        index.lev.gdau.description = qsTr("Self-financing ratio");
        index.lev.gdau.type = "perc";
        index.lev.gdau.formula = "reut / owca";
        var reut = data.balance.oc.reut.balance;
        var fcalc6 = Banana.SDecimal.multiply(reut, 100);
        var fcalc7 = Banana.SDecimal.divide(fcalc6, owca, { 'decimals': this.dialogparam.numberofdecimals });
        var fris4 = fcalc7.toString();
        index.lev.gdau.amount = fris4;
        index.lev.gdau.benchmark = data.ratios.leverageratios.lvlsel.value;

        //degree of coverage of fixed assets
        index.lev.fixaco = {};
        index.lev.fixaco.description = qsTr("Fixed Asset coverage");
        index.lev.fixaco.type = "perc";
        index.lev.fixaco.formula = "(owca + ltdc) / tota";
        var ltdc = data.balance.dc.ltdc.balance;
        var fcalc8 = Banana.SDecimal.add(owca, ltdc);
        var fcalc9 = Banana.SDecimal.divide(fcalc8, totatt);
        var fcalc9 = Banana.SDecimal.multiply(fcalc9, 100, { 'decimals': this.dialogparam.numberofdecimals });
        var fris5 = fcalc9.toString();
        index.lev.fixaco.amount = fris5;
        index.lev.fixaco.benchmark = data.ratios.leverageratios.covfix.value;


        /*PROFITABILITY INDICATORS
        leverage variables prefix 'r'
        roe= Return of equity
        roi= Return of investiment
        ros= Return of sales
         */



        index.red = {};

        //capital profitability

        //ROE il profitto sarà da calcolare
        index.red.roe = {};
        index.red.roe.description = "ROE";
        index.red.roe.type = "perc";
        index.red.roe.formula = "profit / owca";
        var rcalc1 = Banana.SDecimal.multiply(CalculatedData.TotAnnual, 100);
        var rcalc2 = Banana.SDecimal.divide(rcalc1, owca, { 'decimals': this.dialogparam.numberofdecimals });
        var rris = rcalc2.toString();
        index.red.roe.amount = rris;
        index.red.roe.benchmark = data.ratios.profitabilityratios.profroe.value;


        //ROI il profitto sara da calcolare
        // il totale degli impieghi (employment) corrisponde al totale degli attivi
        index.red.roi = {};
        index.red.roi.description = "ROI";
        index.red.roi.type = "perc";
        index.red.roi.formula = "ebit / tota  ";
        var rcalc3 = Banana.SDecimal.divide(CalculatedData.Ebit, totatt);
        var rcalc4 = Banana.SDecimal.multiply(rcalc3, 100, { 'decimals': this.dialogparam.numberofdecimals });
        var rris2 = rcalc4.toString();
        index.red.roi.amount = rris2;
        index.red.roi.benchmark = data.ratios.profitabilityratios.profroi.value;

        //ROS-->trova EBIT
        index.red.ros = {};
        index.red.ros.description = "ROS";
        index.red.ros.type = "perc";
        index.red.ros.formula = "ebit / satu";
        var satu = data.profitandloss.satu.balance;
        var rcalc5 = Banana.SDecimal.multiply(CalculatedData.Ebit, 100);
        var rcalc6 = Banana.SDecimal.divide(rcalc5, satu, { 'decimals': this.dialogparam.numberofdecimals });
        var rris3 = rcalc6.toString();
        index.red.ros.amount = rris3;
        index.red.ros.benchmark = data.ratios.profitabilityratios.profros.value;

        // MOL (Gross profit Margin)
        index.red.mol = {};
        index.red.mol.description = "MOL";
        index.red.mol.type = "perc";
        index.red.mol.formula = "gross profit / satu";
        var ebitda = CalculatedData.EbitDa;
        var rcalc7 = Banana.SDecimal.multiply(ebitda, 100);
        var rcalc8 = Banana.SDecimal.divide(rcalc7, satu, { 'decimals': this.dialogparam.numberofdecimals });
        var rris4 = rcalc8.toString();
        index.red.mol.amount = rris4;
        index.red.mol.benchmark = data.ratios.profitabilityratios.profmol.value;

        //Ebit Margin
        index.red.ebm = {};
        index.red.ebm.description = qsTr("EBIT margin");
        index.red.ebm.type = "perc";
        index.red.ebm.formula = "ebit / satu";
        var rcalc9 = Banana.SDecimal.multiply(CalculatedData.Ebit, 100);
        var rcalc10 = Banana.SDecimal.divide(rcalc9, satu, { 'decimals': this.dialogparam.numberofdecimals });
        var rris5 = rcalc10.toString();
        index.red.ebm.amount = rris5;
        index.red.ebm.benchmark = data.ratios.profitabilityratios.profebm.value;

        //MON (Profit Margin)
        index.red.mon = {};
        index.red.mon.description = qsTr("Profit margin");
        index.red.mon.type = "perc";
        index.red.mon.formula = "net profit / satu";
        var rcalc11 = Banana.SDecimal.multiply(CalculatedData.TotAnnual, 100);
        var rcalc12 = Banana.SDecimal.divide(rcalc11, satu, { 'decimals': this.dialogparam.numberofdecimals });
        var rris6 = rcalc12.toString();
        index.red.mon.amount = rris6;
        index.red.mon.benchmark = data.ratios.profitabilityratios.profmon.value;


        /*EFFICENCY INDICATORS
            leverage variables prefix 'e'
         */

        index.eff = {};

        //Revenue per Employee

        index.eff.rpe = {};
        index.eff.rpe.description = qsTr("Revenue per Employee");
        index.eff.rpe.type = "dec";
        index.eff.rpe.formula = qsTr("satu/employees");
        var ecalc1 = Banana.SDecimal.divide(satu, this.dialogparam.numberofemployees, { 'decimals': this.dialogparam.numberofdecimals });
        var eris1 = ecalc1.toString();
        eris1 = this.setIndexToZero(eris1);
        index.eff.rpe.amount = eris1;

        //Added value per Employee

        index.eff.ape = {};
        index.eff.ape.description = qsTr("Added Value per Employee");
        index.eff.ape.type = "dec";
        index.eff.ape.formula = qsTr("adva/employees");
        var adva = CalculatedData.AddedValue
        var ecalc2 = Banana.SDecimal.divide(adva, this.dialogparam.numberofemployees, { 'decimals': this.dialogparam.numberofdecimals });
        var eris2 = ecalc2.toString();
        eris2 = this.setIndexToZero(eris2);
        index.eff.ape.amount = eris2;

        //Employees performance

        index.eff.emp = {};
        index.eff.emp.description = qsTr("Personnel Cost per Employee");
        index.eff.emp.type = "dec";
        index.eff.emp.formula = qsTr("cope/employees");
        var adva = CalculatedData.AddedValue
        var ecalc3 = Banana.SDecimal.divide(data.profitandloss.cope.balance, this.dialogparam.numberofemployees, { 'decimals': this.dialogparam.numberofdecimals });
        var eris3 = ecalc3.toString();
        eris3 = this.setIndexToZero(eris3);

        index.eff.emp.amount = eris3;

        return index;

    }


    /**
     * @description It takes care of adapting the structure of the parameters for the dialogue. Defines the structure that will be set in the syskey table. By default, I assign the values defined in *initDialogParam()* to the various elements.
       I also define the structure of the grouping of parameters, and under each of them is assigned to a group, so as to allow a clearer and cleaner display of the structure.
       Each parameter defined (along with its properties) is placed in an array.
     * @Param {object} dialogparam:  an object containing the parameters recovered from the dialog setting
     * @returns an object containing an array and the version.
     */
    convertParam() {
        var lang = this.getLang();
        var defaultParam = this.initDialogParam();
        var dialogparam = this.dialogparam;
        var convertedParam = {};
        convertedParam.version = '1.0';
        /*array dei parametri dello script*/
        convertedParam.data = [];

        //I create the balance sheet grouping
        var currentdialogparam = {};
        currentdialogparam.name = 'Balance';
        currentdialogparam.title = qsTr('Balance');
        currentdialogparam.editable = false;

        convertedParam.data.push(currentdialogparam);

        //Active subgroup
        var currentdialogparam = {};
        currentdialogparam.name = 'Assets';
        currentdialogparam.title = qsTr('Assets');
        currentdialogparam.editable = false;
        currentdialogparam.parentObject = 'Balance';

        convertedParam.data.push(currentdialogparam);

        // subgroup Liabilities and Equity
        var currentdialogparam = {};
        currentdialogparam.name = 'Liabilities and Equity';
        currentdialogparam.title = qsTr('Liabilities and Equity');
        currentdialogparam.editable = false;
        currentdialogparam.parentObject = 'Balance';

        convertedParam.data.push(currentdialogparam);


        // Profit and Loss grouping
        var currentdialogparam = {};
        currentdialogparam.name = 'Profit and Loss';
        currentdialogparam.title = qsTr('Profit and Loss');
        currentdialogparam.editable = false;

        convertedParam.data.push(currentdialogparam);

        // subgroup Revenues
        var currentdialogparam = {};
        currentdialogparam.name = 'Revenues';
        currentdialogparam.title = qsTr('Revenues');
        currentdialogparam.editable = false;
        currentdialogparam.parentObject = 'Profit and Loss';

        convertedParam.data.push(currentdialogparam);

        // sub-grouping of costs
        var currentdialogparam = {};
        currentdialogparam.name = 'Costs';
        currentdialogparam.title = qsTr('Costs');
        currentdialogparam.editable = false;
        currentdialogparam.parentObject = 'Profit and Loss';

        convertedParam.data.push(currentdialogparam);

        //subgroup Results
        var currentdialogparam = {};
        currentdialogparam.name = 'Results';
        currentdialogparam.title = qsTr('Results');
        currentdialogparam.editable = false;
        currentdialogparam.parentObject = 'Profit and Loss';

        convertedParam.data.push(currentdialogparam);

        //subgroup Final Result
        var currentdialogparam = {};
        currentdialogparam.name = 'Final Result';
        currentdialogparam.title = qsTr('Final Result');
        currentdialogparam.editable = false;
        currentdialogparam.parentObject = 'Results';

        convertedParam.data.push(currentdialogparam);

        //I create group of the company information
        var currentdialogparam = {};
        currentdialogparam.name = 'Company Information';
        currentdialogparam.title = qsTr('Company Information');
        currentdialogparam.editable = false;

        convertedParam.data.push(currentdialogparam);

        //I create group of preferences
        var currentdialogparam = {};
        currentdialogparam.name = 'Preferences';
        currentdialogparam.title = qsTr('Preferences');
        currentdialogparam.editable = false;

        convertedParam.data.push(currentdialogparam);

        // create an another group, Texts
        var currentdialogparam = {};
        currentdialogparam.name = 'Texts';
        currentdialogparam.title = qsTr('Texts');
        currentdialogparam.editable = false;
        currentdialogparam.collapse = true;
        currentdialogparam.parentObject = false;
        convertedParam.data.push(currentdialogparam);

        //we put inside the Texts section, the customizable banchmarks
        var currentdialogparam = {};
        currentdialogparam.name = 'Benchmarks texts';
        currentdialogparam.title = qsTr('Benchmarks texts');
        currentdialogparam.editable = false;
        currentdialogparam.parentObject = 'Texts';
        convertedParam.data.push(currentdialogparam);

        /**
         * under the benchmarks group, we separate the ratios by type: liquidity, leverage and profitability.
         */

        // liquidity ratios
        var currentdialogparam = {};
        currentdialogparam.name = 'Liquidity';
        currentdialogparam.title = qsTr('Liquidity');
        currentdialogparam.editable = false;
        currentdialogparam.parentObject = 'Benchmarks texts';
        convertedParam.data.push(currentdialogparam);

        // leverage ratios
        var currentdialogparam = {};
        currentdialogparam.name = 'Leverage';
        currentdialogparam.title = qsTr('Leverage');
        currentdialogparam.editable = false;
        currentdialogparam.parentObject = 'Benchmarks texts';
        convertedParam.data.push(currentdialogparam);

        // profitability ratios
        var currentdialogparam = {};
        currentdialogparam.name = 'Profitability';
        currentdialogparam.title = qsTr('Profitability');
        currentdialogparam.editable = false;
        currentdialogparam.parentObject = 'Benchmarks texts';
        convertedParam.data.push(currentdialogparam);


        var currentdialogparam = {};
        currentdialogparam.name = 'liqu';
        currentdialogparam.group = 'balance';
        currentdialogparam.title = dialogparam.balance.ca.liqu.description ? dialogparam.balance.ca.liqu.description : defaultParam.balance.ca.liqu.description;
        currentdialogparam.type = 'string';
        currentdialogparam.value = dialogparam.balance.ca.liqu.gr ? dialogparam.balance.ca.liqu.gr : '';
        currentdialogparam.defaultvalue = defaultParam.balance.ca.liqu.gr;
        //I assign it to a group
        currentdialogparam.parentObject = 'Assets';
        currentdialogparam.readValue = function() {
            dialogparam.balance.ca.liqu.gr = this.value;
        }

        convertedParam.data.push(currentdialogparam);

        var currentdialogparam = {};
        currentdialogparam.name = 'cred';
        currentdialogparam.group = 'balance';
        currentdialogparam.title = dialogparam.balance.ca.cred.description ? dialogparam.balance.ca.cred.description : defaultParam.balance.ca.cred.description;
        currentdialogparam.type = 'string';
        currentdialogparam.value = dialogparam.balance.ca.cred.gr ? dialogparam.balance.ca.cred.gr : '';
        currentdialogparam.defaultvalue = defaultParam.balance.ca.cred.gr;
        currentdialogparam.parentObject = 'Assets';
        currentdialogparam.readValue = function() {
            dialogparam.balance.ca.cred.gr = this.value;
        }
        convertedParam.data.push(currentdialogparam);

        var currentdialogparam = {};
        currentdialogparam.name = 'stoc';
        currentdialogparam.group = 'balance';
        currentdialogparam.title = dialogparam.balance.ca.stoc.description ? dialogparam.balance.ca.stoc.description : defaultParam.balance.ca.stoc.description;
        currentdialogparam.type = 'string';
        currentdialogparam.value = dialogparam.balance.ca.stoc.gr ? dialogparam.balance.ca.stoc.gr : '';
        currentdialogparam.defaultvalue = defaultParam.balance.ca.stoc.gr;
        currentdialogparam.parentObject = 'Assets';
        currentdialogparam.readValue = function() {
            dialogparam.balance.ca.stoc.gr = this.value;
        }
        convertedParam.data.push(currentdialogparam);

        var currentdialogparam = {};
        currentdialogparam.name = 'fixa';
        currentdialogparam.group = 'balance';
        currentdialogparam.title = dialogparam.balance.fa.fixa.description ? dialogparam.balance.fa.fixa.description : defaultParam.balance.fa.fixa.description;
        currentdialogparam.type = 'string';
        currentdialogparam.value = dialogparam.balance.fa.fixa.gr ? dialogparam.balance.fa.fixa.gr : '';
        currentdialogparam.defaultvalue = defaultParam.balance.fa.fixa.gr;
        currentdialogparam.parentObject = 'Assets';
        currentdialogparam.readValue = function() {
            dialogparam.balance.fa.fixa.gr = this.value;
        }
        convertedParam.data.push(currentdialogparam);

        var currentdialogparam = {};
        currentdialogparam.name = 'stdc';
        currentdialogparam.group = 'balance';
        currentdialogparam.title = dialogparam.balance.dc.stdc.description ? dialogparam.balance.dc.stdc.description : defaultParam.balance.dc.stdc.description;
        currentdialogparam.type = 'string';
        currentdialogparam.value = dialogparam.balance.dc.stdc.gr ? dialogparam.balance.dc.stdc.gr : '';
        currentdialogparam.defaultvalue = defaultParam.balance.dc.stdc.gr;
        currentdialogparam.parentObject = 'Liabilities and Equity';
        currentdialogparam.readValue = function() {
            dialogparam.balance.dc.stdc.gr = this.value;
        }
        convertedParam.data.push(currentdialogparam);

        var currentdialogparam = {};
        currentdialogparam.name = 'ltdc';
        currentdialogparam.group = 'balance';
        currentdialogparam.title = dialogparam.balance.dc.ltdc.description ? dialogparam.balance.dc.ltdc.description : defaultParam.balance.dc.ltdc.description;
        currentdialogparam.type = 'string';
        currentdialogparam.value = dialogparam.balance.dc.ltdc.gr ? dialogparam.balance.dc.ltdc.gr : '';
        currentdialogparam.defaultvalue = defaultParam.balance.dc.ltdc.gr;
        currentdialogparam.parentObject = 'Liabilities and Equity';
        currentdialogparam.readValue = function() {
            dialogparam.balance.dc.ltdc.gr = this.value;
        }
        convertedParam.data.push(currentdialogparam);

        var currentdialogparam = {};
        currentdialogparam.name = 'obca';
        currentdialogparam.group = 'balance';
        currentdialogparam.title = dialogparam.balance.oc.obca.description ? dialogparam.balance.oc.obca.description : defaultParam.balance.oc.obca.description;
        currentdialogparam.type = 'string';
        currentdialogparam.value = dialogparam.balance.oc.obca.gr ? dialogparam.balance.oc.obca.gr : '';
        currentdialogparam.defaultvalue = defaultParam.balance.oc.obca.gr;
        currentdialogparam.parentObject = 'Liabilities and Equity';
        currentdialogparam.readValue = function() {
            dialogparam.balance.oc.obca.gr = this.value;
        }
        convertedParam.data.push(currentdialogparam);

        var currentdialogparam = {};
        currentdialogparam.name = 'reut';
        currentdialogparam.group = 'balance';
        currentdialogparam.title = dialogparam.balance.oc.reut.description ? dialogparam.balance.oc.reut.description : defaultParam.balance.oc.reut.description;
        currentdialogparam.type = 'string';
        currentdialogparam.value = dialogparam.balance.oc.reut.gr ? dialogparam.balance.oc.reut.gr : '';
        currentdialogparam.defaultvalue = defaultParam.balance.oc.reut.gr;
        currentdialogparam.parentObject = 'Liabilities and Equity';
        currentdialogparam.readValue = function() {
            dialogparam.balance.oc.reut.gr = this.value;
        }
        convertedParam.data.push(currentdialogparam);

        var currentdialogparam = {};
        currentdialogparam.name = 'satu';
        currentdialogparam.group = 'profitandloss';
        currentdialogparam.title = dialogparam.profitandloss.satu.description ? dialogparam.profitandloss.satu.description : defaultParam.profitandloss.satu.description;
        currentdialogparam.type = 'string';
        currentdialogparam.value = dialogparam.profitandloss.satu.gr ? dialogparam.profitandloss.satu.gr : '';
        currentdialogparam.defaultvalue = defaultParam.profitandloss.satu.gr;
        currentdialogparam.parentObject = 'Revenues';
        currentdialogparam.readValue = function() {
            dialogparam.profitandloss.satu.gr = this.value;
        }
        convertedParam.data.push(currentdialogparam);

        var currentdialogparam = {};
        currentdialogparam.name = 'cofm';
        currentdialogparam.group = 'profitandloss';
        currentdialogparam.title = dialogparam.profitandloss.cofm.description ? dialogparam.profitandloss.cofm.description : defaultParam.profitandloss.cofm.description;
        currentdialogparam.type = 'string';
        currentdialogparam.value = dialogparam.profitandloss.cofm.gr ? dialogparam.profitandloss.cofm.gr : '';
        currentdialogparam.defaultvalue = defaultParam.profitandloss.cofm.gr;
        currentdialogparam.parentObject = 'Costs';
        currentdialogparam.readValue = function() {
            dialogparam.profitandloss.cofm.gr = this.value;
        }
        convertedParam.data.push(currentdialogparam);

        var currentdialogparam = {};
        currentdialogparam.name = 'cope';
        currentdialogparam.group = 'profitandloss';
        currentdialogparam.title = dialogparam.profitandloss.cope.description ? dialogparam.profitandloss.cope.description : defaultParam.profitandloss.cope.description;
        currentdialogparam.type = 'string';
        currentdialogparam.value = dialogparam.profitandloss.cope.gr ? dialogparam.profitandloss.cope.gr : '';
        currentdialogparam.defaultvalue = defaultParam.profitandloss.cope.gr;
        currentdialogparam.parentObject = 'Costs';
        currentdialogparam.readValue = function() {
            dialogparam.profitandloss.cope.gr = this.value;
        }
        convertedParam.data.push(currentdialogparam);

        var currentdialogparam = {};
        currentdialogparam.name = 'codi';
        currentdialogparam.group = 'profitandloss';
        currentdialogparam.title = dialogparam.profitandloss.codi.description ? dialogparam.profitandloss.codi.description : defaultParam.profitandloss.codi.description;
        currentdialogparam.type = 'string';
        currentdialogparam.value = dialogparam.profitandloss.codi.gr ? dialogparam.profitandloss.codi.gr : '';
        currentdialogparam.defaultvalue = defaultParam.profitandloss.codi.gr;
        currentdialogparam.parentObject = 'Costs';
        currentdialogparam.readValue = function() {
            dialogparam.profitandloss.codi.gr = this.value;
        }
        convertedParam.data.push(currentdialogparam);

        var currentdialogparam = {};
        currentdialogparam.name = 'inte';
        currentdialogparam.group = 'profitandloss';
        currentdialogparam.title = dialogparam.profitandloss.inte.description ? dialogparam.profitandloss.inte.description : defaultParam.profitandloss.inte.description;
        currentdialogparam.type = 'string';
        currentdialogparam.value = dialogparam.profitandloss.inte.gr ? dialogparam.profitandloss.inte.gr : '';
        currentdialogparam.defaultvalue = defaultParam.profitandloss.inte.gr;
        currentdialogparam.parentObject = 'Costs';
        currentdialogparam.readValue = function() {
            dialogparam.profitandloss.inte.gr = this.value;
        }
        convertedParam.data.push(currentdialogparam);

        var currentdialogparam = {};
        currentdialogparam.name = 'amre';
        currentdialogparam.group = 'profitandloss';
        currentdialogparam.title = dialogparam.profitandloss.amre.description ? dialogparam.profitandloss.amre.description : defaultParam.profitandloss.amre.description;
        currentdialogparam.type = 'string';
        currentdialogparam.value = dialogparam.profitandloss.amre.gr ? dialogparam.profitandloss.amre.gr : '';
        currentdialogparam.defaultvalue = defaultParam.profitandloss.amre.gr;
        currentdialogparam.parentObject = 'Costs';
        currentdialogparam.readValue = function() {
            dialogparam.profitandloss.amre.gr = this.value;
        }
        convertedParam.data.push(currentdialogparam);

        var currentdialogparam = {};
        currentdialogparam.name = 'fire';
        currentdialogparam.group = 'profitandloss';
        currentdialogparam.title = dialogparam.finalresult.fire.description ? dialogparam.finalresult.fire.description : defaultParam.finalresult.fire.description;
        currentdialogparam.type = 'string';
        currentdialogparam.value = dialogparam.finalresult.fire.gr ? dialogparam.finalresult.fire.gr : '';
        currentdialogparam.defaultvalue = defaultParam.finalresult.fire.gr;
        currentdialogparam.parentObject = 'Final Result';
        currentdialogparam.readValue = function() {
            dialogparam.finalresult.fire.gr = this.value;
        }
        convertedParam.data.push(currentdialogparam);

        //Previous years
        var currentdialogparam = {};
        currentdialogparam.name = 'maxpreviousyears';
        currentdialogparam.group = 'preferences';
        currentdialogparam.title = qsTr('Number of previous years');
        currentdialogparam.type = 'string';
        currentdialogparam.value = dialogparam.maxpreviousyears ? dialogparam.maxpreviousyears : '2';
        currentdialogparam.defaultvalue = defaultParam.maxpreviousyears;
        currentdialogparam.parentObject = 'Preferences';
        currentdialogparam.readValue = function() {
            dialogparam.maxpreviousyears = this.value;
        }

        convertedParam.data.push(currentdialogparam);

        //Number of decimals
        var currentdialogparam = {};
        currentdialogparam.name = 'numberofdecimals';
        currentdialogparam.group = 'preferences';
        currentdialogparam.title = qsTr('Number of decimals');
        currentdialogparam.type = 'string';
        currentdialogparam.value = dialogparam.numberofdecimals ? dialogparam.numberofdecimals : '2';
        currentdialogparam.defaultvalue = defaultParam.numberofdecimals;
        currentdialogparam.parentObject = 'Preferences';
        currentdialogparam.readValue = function() {
            dialogparam.numberofdecimals = this.value;
        }

        convertedParam.data.push(currentdialogparam);

        //Include the Budget table in the analysis
        var currentdialogparam = {};
        currentdialogparam.name = 'includebudgettable';
        currentdialogparam.group = 'preferences';
        currentdialogparam.title = qsTr('Include Budget');
        currentdialogparam.type = 'bool';
        currentdialogparam.value = dialogparam.includebudgettable ? dialogparam.includebudgettable : dialogparam.includebudgettable;
        currentdialogparam.defaultvalue = defaultParam.includebudgettable;
        currentdialogparam.parentObject = 'Preferences';
        currentdialogparam.readValue = function() {
            dialogparam.includebudgettable = this.value;
        }

        convertedParam.data.push(currentdialogparam);

        //Show the acronym column 
        var currentdialogparam = {};
        currentdialogparam.name = 'acronymcolumn';
        currentdialogparam.group = 'preferences';
        currentdialogparam.title = qsTr('Show Acronym column');
        currentdialogparam.type = 'bool';
        currentdialogparam.value = dialogparam.acronymcolumn ? dialogparam.acronymcolumn : dialogparam.acronymcolumn;
        currentdialogparam.defaultvalue = defaultParam.acronymcolumn;
        currentdialogparam.parentObject = 'Preferences';
        currentdialogparam.readValue = function() {
            dialogparam.acronymcolumn = this.value;
        }


        convertedParam.data.push(currentdialogparam);

        //Show the formulas column 
        var currentdialogparam = {};
        currentdialogparam.name = 'formulascolumn';
        currentdialogparam.group = 'preferences';
        currentdialogparam.title = qsTr('Show Formulas column');
        currentdialogparam.type = 'bool';
        currentdialogparam.value = dialogparam.formulascolumn ? dialogparam.formulascolumn : dialogparam.formulascolumn;
        currentdialogparam.defaultvalue = defaultParam.formulascolumn;
        currentdialogparam.parentObject = 'Preferences';
        currentdialogparam.readValue = function() {
            dialogparam.formulascolumn = this.value;
        }


        convertedParam.data.push(currentdialogparam);

        //Number of employees (for the productivity ratios) 
        var currentdialogparam = {};
        currentdialogparam.name = 'numberofemployees';
        currentdialogparam.group = 'preferences';
        currentdialogparam.title = qsTr('Average number of employees');
        currentdialogparam.type = 'string';
        currentdialogparam.value = dialogparam.numberofemployees ? dialogparam.numberofemployees : dialogparam.numberofemployees;
        currentdialogparam.defaultvalue = defaultParam.numberofemployees;
        currentdialogparam.parentObject = 'Company Information';
        currentdialogparam.readValue = function() {
            dialogparam.numberofemployees = this.value;
        }

        convertedParam.data.push(currentdialogparam);

        //ratios benchmarks
        // liquidity 1 benchmark
        var currentdialogparam = {};
        currentdialogparam.name = 'liq1benchmark';
        currentdialogparam.group = 'benchmarks';
        currentdialogparam.title = dialogparam.ratios.liquidityratios.liqu1.description ? dialogparam.ratios.liquidityratios.liqu1.description : defaultParam.ratios.liquidityratios.liqu1.description;
        currentdialogparam.type = 'string';
        currentdialogparam.value = dialogparam.ratios.liquidityratios.liqu1.value ? dialogparam.ratios.liquidityratios.liqu1.value : '';
        currentdialogparam.defaultvalue = defaultParam.ratios.liquidityratios.liqu1.value;
        currentdialogparam.parentObject = 'Liquidity';
        currentdialogparam.readValue = function() {
            dialogparam.ratios.liquidityratios.liqu1.value = this.value;
        }
        convertedParam.data.push(currentdialogparam);

        // liquidity 2 benchmark
        var currentdialogparam = {};
        currentdialogparam.name = 'liq2benchmark';
        currentdialogparam.group = 'benchmarks';
        currentdialogparam.title = dialogparam.ratios.liquidityratios.liqu2.description ? dialogparam.ratios.liquidityratios.liqu2.description : defaultParam.ratios.liquidityratios.liqu2.description;
        currentdialogparam.type = 'string';
        currentdialogparam.value = dialogparam.ratios.liquidityratios.liqu2.value ? dialogparam.ratios.liquidityratios.liqu2.value : '';
        currentdialogparam.defaultvalue = defaultParam.ratios.liquidityratios.liqu2.value;
        currentdialogparam.parentObject = 'Liquidity';
        currentdialogparam.readValue = function() {
            dialogparam.ratios.liquidityratios.liqu2.value = this.value;
        }
        convertedParam.data.push(currentdialogparam);

        // liquidity 3 benchmark
        var currentdialogparam = {};
        currentdialogparam.name = 'liq3benchmark';
        currentdialogparam.group = 'benchmarks';
        currentdialogparam.title = dialogparam.ratios.liquidityratios.liqu3.description ? dialogparam.ratios.liquidityratios.liqu3.description : defaultParam.ratios.liquidityratios.liqu3.description;
        currentdialogparam.type = 'string';
        currentdialogparam.value = dialogparam.ratios.liquidityratios.liqu3.value ? dialogparam.ratios.liquidityratios.liqu3.value : '';
        currentdialogparam.defaultvalue = defaultParam.ratios.liquidityratios.liqu3.value;
        currentdialogparam.parentObject = 'Liquidity';
        currentdialogparam.readValue = function() {
            dialogparam.ratios.liquidityratios.liqu3.value = this.value;
        }
        convertedParam.data.push(currentdialogparam);

        // net current asset benchmark
        var currentdialogparam = {};
        currentdialogparam.name = 'netcurrassbenchmark';
        currentdialogparam.group = 'benchmarks';
        currentdialogparam.title = dialogparam.ratios.liquidityratios.netcurrass.description ? dialogparam.ratios.liquidityratios.netcurrass.description : defaultParam.ratios.liquidityratios.netcurrass.description;
        currentdialogparam.type = 'string';
        currentdialogparam.value = dialogparam.ratios.liquidityratios.netcurrass.value ? dialogparam.ratios.liquidityratios.netcurrass.value : '';
        currentdialogparam.defaultvalue = defaultParam.ratios.liquidityratios.netcurrass.value;
        currentdialogparam.parentObject = 'Liquidity';
        currentdialogparam.readValue = function() {
            dialogparam.ratios.liquidityratios.netcurrass.value = this.value;
        }
        convertedParam.data.push(currentdialogparam);

        // degree of circulating assets benchmark
        var currentdialogparam = {};
        currentdialogparam.name = 'cirractbenchmark';
        currentdialogparam.group = 'benchmarks';
        currentdialogparam.title = dialogparam.ratios.leverageratios.cirract.description ? dialogparam.ratios.leverageratios.cirract.description : defaultParam.ratios.leverageratios.cirract.description;
        currentdialogparam.type = 'string';
        currentdialogparam.value = dialogparam.ratios.leverageratios.cirract.value ? dialogparam.ratios.leverageratios.cirract.value : '';
        currentdialogparam.defaultvalue = defaultParam.ratios.leverageratios.cirract.value;
        currentdialogparam.parentObject = 'Leverage';
        currentdialogparam.readValue = function() {
            dialogparam.ratios.leverageratios.cirract.value = this.value;
        }
        convertedParam.data.push(currentdialogparam);

        // degree of fixed asset benchmark
        var currentdialogparam = {};
        currentdialogparam.name = 'fixassbenchmark';
        currentdialogparam.group = 'benchmarks';
        currentdialogparam.title = dialogparam.ratios.leverageratios.fixass.description ? dialogparam.ratios.leverageratios.fixass.description : defaultParam.ratios.leverageratios.fixass.description;
        currentdialogparam.type = 'string';
        currentdialogparam.value = dialogparam.ratios.leverageratios.fixass.value ? dialogparam.ratios.leverageratios.fixass.value : '';
        currentdialogparam.defaultvalue = defaultParam.ratios.leverageratios.fixass.value;
        currentdialogparam.parentObject = 'Leverage';
        currentdialogparam.readValue = function() {
            dialogparam.ratios.leverageratios.fixass.value = this.value;
        }
        convertedParam.data.push(currentdialogparam);

        // level of debt benchmark
        var currentdialogparam = {};
        currentdialogparam.name = 'lvldebbenchmark';
        currentdialogparam.group = 'benchmarks';
        currentdialogparam.title = dialogparam.ratios.leverageratios.lvldeb.description ? dialogparam.ratios.leverageratios.lvldeb.description : defaultParam.ratios.leverageratios.lvldeb.description;
        currentdialogparam.type = 'string';
        currentdialogparam.value = dialogparam.ratios.leverageratios.lvldeb.value ? dialogparam.ratios.leverageratios.lvldeb.value : '';
        currentdialogparam.defaultvalue = defaultParam.ratios.leverageratios.lvldeb.value;
        currentdialogparam.parentObject = 'Leverage';
        currentdialogparam.readValue = function() {
            dialogparam.ratios.leverageratios.lvldeb.value = this.value;
        }
        convertedParam.data.push(currentdialogparam);

        // level of equity finance benchmark
        var currentdialogparam = {};
        currentdialogparam.name = 'lvlequbenchmark';
        currentdialogparam.group = 'benchmarks';
        currentdialogparam.title = dialogparam.ratios.leverageratios.lvlequ.description ? dialogparam.ratios.leverageratios.lvlequ.description : defaultParam.ratios.leverageratios.lvlequ.description;
        currentdialogparam.type = 'string';
        currentdialogparam.value = dialogparam.ratios.leverageratios.lvlequ.value ? dialogparam.ratios.leverageratios.lvlequ.value : '';
        currentdialogparam.defaultvalue = defaultParam.ratios.leverageratios.lvlequ.value;
        currentdialogparam.parentObject = 'Leverage';
        currentdialogparam.readValue = function() {
            dialogparam.ratios.leverageratios.lvlequ.value = this.value;
        }
        convertedParam.data.push(currentdialogparam);

        // level of self leverage benchmark
        var currentdialogparam = {};
        currentdialogparam.name = 'lvlselbenchmark';
        currentdialogparam.group = 'benchmarks';
        currentdialogparam.title = dialogparam.ratios.leverageratios.lvlsel.description ? dialogparam.ratios.leverageratios.lvlsel.description : defaultParam.ratios.leverageratios.lvlsel.description;
        currentdialogparam.type = 'string';
        currentdialogparam.value = dialogparam.ratios.leverageratios.lvlsel.value ? dialogparam.ratios.leverageratios.lvlsel.value : '';
        currentdialogparam.defaultvalue = defaultParam.ratios.leverageratios.lvlsel.value;
        currentdialogparam.parentObject = 'Leverage';
        currentdialogparam.readValue = function() {
            dialogparam.ratios.leverageratios.lvlsel.value = this.value;
        }
        convertedParam.data.push(currentdialogparam);

        // coverage of fixed assets benchmark
        var currentdialogparam = {};
        currentdialogparam.name = 'covfixbenchmark';
        currentdialogparam.group = 'benchmarks';
        currentdialogparam.title = dialogparam.ratios.leverageratios.covfix.description ? dialogparam.ratios.leverageratios.covfix.description : defaultParam.ratios.leverageratios.covfix.description;
        currentdialogparam.type = 'string';
        currentdialogparam.value = dialogparam.ratios.leverageratios.covfix.value ? dialogparam.ratios.leverageratios.covfix.value : '';
        currentdialogparam.defaultvalue = defaultParam.ratios.leverageratios.covfix.value;
        currentdialogparam.parentObject = 'Leverage';
        currentdialogparam.readValue = function() {
            dialogparam.ratios.leverageratios.covfix.value = this.value;
        }
        convertedParam.data.push(currentdialogparam);

        // roe benchmark
        var currentdialogparam = {};
        currentdialogparam.name = 'roebenchmark';
        currentdialogparam.group = 'benchmarks';
        currentdialogparam.title = dialogparam.ratios.profitabilityratios.profroe.description ? dialogparam.ratios.profitabilityratios.profroe.description : defaultParam.ratios.profitabilityratios.profroe.description;
        currentdialogparam.type = 'string';
        currentdialogparam.value = dialogparam.ratios.profitabilityratios.profroe.value ? dialogparam.ratios.profitabilityratios.profroe.value : '';
        currentdialogparam.defaultvalue = defaultParam.ratios.profitabilityratios.profroe.value;
        currentdialogparam.parentObject = 'Profitability';
        currentdialogparam.readValue = function() {
            dialogparam.ratios.profitabilityratios.profroe.value = this.value;
        }
        convertedParam.data.push(currentdialogparam);

        // roi benchmark
        var currentdialogparam = {};
        currentdialogparam.name = 'roibenchmark';
        currentdialogparam.group = 'benchmarks';
        currentdialogparam.title = dialogparam.ratios.profitabilityratios.profroi.description ? dialogparam.ratios.profitabilityratios.profroi.description : defaultParam.ratios.profitabilityratios.profroi.description;
        currentdialogparam.type = 'string';
        currentdialogparam.value = dialogparam.ratios.profitabilityratios.profroi.value ? dialogparam.ratios.profitabilityratios.profroi.value : '';
        currentdialogparam.defaultvalue = defaultParam.ratios.profitabilityratios.profroi.value;
        currentdialogparam.parentObject = 'Profitability';
        currentdialogparam.readValue = function() {
            dialogparam.ratios.profitabilityratios.profroi.value = this.value;
        }
        convertedParam.data.push(currentdialogparam)


        // ros benchmark
        var currentdialogparam = {};
        currentdialogparam.name = 'rosbenchmark';
        currentdialogparam.group = 'benchmarks';
        currentdialogparam.title = dialogparam.ratios.profitabilityratios.profros.description ? dialogparam.ratios.profitabilityratios.profros.description : defaultParam.ratios.profitabilityratios.profros.description;
        currentdialogparam.type = 'string';
        currentdialogparam.value = dialogparam.ratios.profitabilityratios.profros.value ? dialogparam.ratios.profitabilityratios.profros.value : '';
        currentdialogparam.defaultvalue = defaultParam.ratios.profitabilityratios.profros.value;
        currentdialogparam.parentObject = 'Profitability';
        currentdialogparam.readValue = function() {
            dialogparam.ratios.profitabilityratios.profros.value = this.value;
        }
        convertedParam.data.push(currentdialogparam)

        // mol benchmark
        var currentdialogparam = {};
        currentdialogparam.name = 'molbenchmark';
        currentdialogparam.group = 'benchmarks';
        currentdialogparam.title = dialogparam.ratios.profitabilityratios.profmol.description ? dialogparam.ratios.profitabilityratios.profmol.description : defaultParam.ratios.profitabilityratios.profmol.description;
        currentdialogparam.type = 'string';
        currentdialogparam.value = dialogparam.ratios.profitabilityratios.profmol.value ? dialogparam.ratios.profitabilityratios.profmol.value : '';
        currentdialogparam.defaultvalue = defaultParam.ratios.profitabilityratios.profmol.value;
        currentdialogparam.parentObject = 'Profitability';
        currentdialogparam.readValue = function() {
            dialogparam.ratios.profitabilityratios.profmol.value = this.value;
        }
        convertedParam.data.push(currentdialogparam)

        // Ebit Margin benchmark
        var currentdialogparam = {};
        currentdialogparam.name = 'ebmbenchmark';
        currentdialogparam.group = 'benchmarks';
        currentdialogparam.title = dialogparam.ratios.profitabilityratios.profebm.description ? dialogparam.ratios.profitabilityratios.profebm.description : defaultParam.ratios.profitabilityratios.profebm.description;
        currentdialogparam.type = 'string';
        currentdialogparam.value = dialogparam.ratios.profitabilityratios.profebm.value ? dialogparam.ratios.profitabilityratios.profebm.value : '';
        currentdialogparam.defaultvalue = defaultParam.ratios.profitabilityratios.profebm.value;
        currentdialogparam.parentObject = 'Profitability';
        currentdialogparam.readValue = function() {
            dialogparam.ratios.profitabilityratios.profebm.value = this.value;
        }
        convertedParam.data.push(currentdialogparam)

        // Profit Margin benchmark
        var currentdialogparam = {};
        currentdialogparam.name = 'monbenchmark';
        currentdialogparam.group = 'benchmarks';
        currentdialogparam.title = dialogparam.ratios.profitabilityratios.profmon.description ? dialogparam.ratios.profitabilityratios.profmon.description : defaultParam.ratios.profitabilityratios.profebm.description;
        currentdialogparam.type = 'string';
        currentdialogparam.value = dialogparam.ratios.profitabilityratios.profmon.value ? dialogparam.ratios.profitabilityratios.profmon.value : '';
        currentdialogparam.defaultvalue = defaultParam.ratios.profitabilityratios.profmon.value;
        currentdialogparam.parentObject = 'Profitability';
        currentdialogparam.readValue = function() {
            dialogparam.ratios.profitabilityratios.profmon.value = this.value;
        }
        convertedParam.data.push(currentdialogparam)

        return convertedParam;
    }

    /**
     * @description With the following method we calculate, starting from the base, the elements necessary for the creation of the dupont scheme, in particular:
     * instantiates a *Dupont= {}* object which will contain all the calculated indices.
     * retrieve the values of the calculated indices, parameters and data.
     * calculate the elements.
     * check that the values coincide with others previously calculated in other methods.
     * @Param {object} data: the data object created thanks to loadData methods, containing the values and the sums of the paramters recovered from the dialog.
     * @Param {object} CalculatedData: the object returned by the CalculateData method containing the values of the calculated elements.
     * @Param {object} index: the object returned by the CalculateIndex method containing the values of the calculated indexes.
     * @returns an object containing the data for the dupont table
     */
    createDupontData(data, CalculatedData, index) {

        var Dupont = {};

        //LEVEL 1 

        //goods costs, production.....
        Dupont.MerchCost = {};
        Dupont.MerchCost = data.profitandloss.cofm.balance;

        //personnel costs
        Dupont.PersonelCost = {};
        Dupont.PersonelCost = data.profitandloss.cope.balance;

        /*different costs*/
        Dupont.DifferentCost = {};
        var codi = data.profitandloss.codi.balance;
        var amre = data.profitandloss.amre.balance;
        Dupont.DifferentCost = Banana.SDecimal.add(codi, amre);



        //liquidity
        Dupont.liqu = {};
        Dupont.liqu = data.balance.ca.liqu.balance;

        //credits
        Dupont.cred = {};
        Dupont.cred = data.balance.ca.cred.balance;

        //stocks
        Dupont.stoc = {};
        Dupont.stoc = data.balance.ca.stoc.balance;

        //LEVEL 2

        //total costs
        Dupont.TotCosts = {};
        var Totcs1 = Banana.SDecimal.add(Dupont.DifferentCost, Dupont.PersonelCost);
        var Totcs2 = Banana.SDecimal.add(Totcs1, Dupont.MerchCost);
        Dupont.TotCosts = Totcs2

        //fixed assets
        Dupont.FixedAsset = {};
        Dupont.FixedAsset = data.balance.fa.fixa.balance;

        //current assets
        Dupont.CurrentAsset = {};
        var Totas1 = Banana.SDecimal.add(Dupont.liqu, Dupont.cred);
        var Totas2 = Banana.SDecimal.add(Totas1, Dupont.stoc);
        Dupont.CurrentAsset = Totas2;

        //sales
        Dupont.sales = {};
        Dupont.sales = CalculatedData.TotSales;



        //LEVEL 3

        /*profit or ebit (ebit is used for economic analysis)
         */
        Dupont.ebit = {};
        var ebit = CalculatedData.Ebit;
        var calcebit = Banana.SDecimal.subtract(Dupont.sales, Dupont.TotCosts);
        if (calcebit === ebit) {
            Dupont.ebit = calcebit;
        } else {
            Dupont.ebit = " i valori non coincidono"
        }

        //Cnet capital
        Dupont.capital = {};
        Dupont.capital = Banana.SDecimal.add(Dupont.CurrentAsset, Dupont.FixedAsset);

        //LEVEL 4

        //MOL
        Dupont.mol = {};
        Dupont.mol = Banana.SDecimal.divide(Dupont.ebit, Dupont.sales);

        //ROT
        Dupont.rot = {};
        Dupont.rot = Banana.SDecimal.divide(Dupont.sales, Dupont.capital);

        //LEVEL 5

        //  ROI

        Dupont.roi = {};
        var roi = index.red.roi.amount;
        var calcroi1 = Banana.SDecimal.multiply(Dupont.rot, Dupont.mol);
        var calcroi = Banana.SDecimal.multiply(calcroi1, 100, { 'decimals': 2 });
        calcroi = calcroi.toString();
        //check that the first 10 digits are equal, to avoid rounding errors
        if (calcroi.substr(0, 1) === roi.substr(0, 1)) {

            Dupont.roi = calcroi;
        } else {
            Dupont.roi = "the values do not match"
        }

        return Dupont;
    }

    /**
     * @description this method verifiy if the amount is negative or positive, and set the correct style to the amounts. In case of negative amount the text is set in red.
     * @Param {number} amount: a certain amount
     * @returns the style for the amount
     */
    amountType(amount) {
        var type = "";
        if (amount < 0) {
            type = 'styleNegativeAmount';
        } else {
            type = 'styleAmount';
        }
        return type;

    }

    /**
     * @description this method calculate the altman Index.
     * @Param {object} data: the data object created thanks to loadData methods, containing the values and the sums of the paramters recovered from the dialog.
     * @Param {object} CalculatedData: the object returned by the CalculateData method containing the values of the calculated elements.
     * @Param {object} index: the object returned by the CalculateIndex method containing the values of the calculated indexes.
     * @returns an object containing the Altman index elements
     */
    calculateAltmanIndex(data, CalculatedData, index) {

        /*Z-SCORE = 0.717 X1 + 0.847 X2 +3.107 X3 +0.420 X4 + 0.998 X5
        X1 = Capitale Circolante / Totale attività = Indice di flessibilità aziendale
        X2 = Utile non distribuito / Totale attività = Indice di autofinanziamento
        X3 = Risultato Operativo / Totale attività = ROI
        X4 = Valore di Mercato (o Patrimonio Netto) / Passività Totali = Capitalizzazione o Indice di indipendenza da terzi
        X5 = Vendite Nette / Totale attività = Turnover attività totali
        */

        var AltmanIndex = {};

        //X1
        var cuasone = Banana.SDecimal.add((data.balance.ca.liqu.balance), (data.balance.ca.cred.balance));
        var cuastwo = Banana.SDecimal.add(cuasone, (data.balance.ca.stoc.balance));
        var totatt = CalculatedData.TotActive;
        var x1 = Banana.SDecimal.divide(cuastwo, totatt);
        AltmanIndex.x1 = Banana.SDecimal.multiply(x1, 0.717);

        //X2
        var reut = data.balance.oc.reut.balance;
        var x2 = Banana.SDecimal.divide(reut, totatt);
        AltmanIndex.x2 = Banana.SDecimal.multiply(x2, 0.847);

        //X3
        var x3 = Banana.SDecimal.divide(index.red.roi.amount, 100);
        AltmanIndex.x3 = Banana.SDecimal.multiply(x3, 3.107);

        //X4
        //pant= patrimonio netto, attenzione leggo i dati dalfoglio contabile, ma cera il problema che leggeva solo il foglio attuale

        var pant = Banana.SDecimal.subtract(CalculatedData.TotActiveSheet, CalculatedData.TotPassiveSheet);
        var x4 = Banana.SDecimal.divide(pant, CalculatedData.TotPassive);
        AltmanIndex.x4 = Banana.SDecimal.multiply(x4, 0.420);

        //X5
        var x5 = Banana.SDecimal.divide(data.profitandloss.satu.balance, totatt);
        AltmanIndex.x5 = Banana.SDecimal.multiply(x5, 0.998);


        var placeholder = Banana.SDecimal.add(AltmanIndex.x1, AltmanIndex.x2);
        var placeholder1 = Banana.SDecimal.add(placeholder, AltmanIndex.x3);
        var placeholder2 = Banana.SDecimal.add(placeholder1, AltmanIndex.x4);
        AltmanIndex = Banana.SDecimal.add(placeholder2, AltmanIndex.x5, { 'decimals': 2 });

        return AltmanIndex;

    }

    /**
     * @description checks the type of error that has occurred and returns a message.
     * @Param {*} errorId: the error identification
     * @Param {*} lang: the language
     * @returns empty
     */
    getErrorMessage(errorId, lang) {
        if (!lang)
            lang = 'en';
        switch (errorId) {
            case this.ID_ERR_EXPERIMENTAL_REQUIRED:
                return "The Experimental version is required";
            case this.ID_ERR_LICENSE_NOTVALID:
                return "This extension requires Banana Accounting+ Advanced";
            case this.ID_ERR_VERSION_NOTSUPPORTED:
                if (lang == 'it')
                    return "Lo script non funziona con la vostra attuale versione di Banana Contabilità.\nVersione minimina richiesta: %1.\nPer aggiornare o per maggiori informazioni cliccare su Aiuto";
                else if (lang == 'fr')
                    return "Ce script ne s'exécute pas avec votre version actuelle de Banana Comptabilité.\nVersion minimale requise: %1.\nPour mettre à jour ou pour plus d'informations, cliquez sur Aide";
                else if (lang == 'de')
                    return "Das Skript wird mit Ihrer aktuellen Version von Banana Buchhaltung nicht ausgeführt.\nMindestversion erforderlich: %1.\nKlicken Sie auf Hilfe, um zu aktualisieren oder weitere Informationen zu bekommen";
                else
                    return "This script does not run with your current version of Banana Accounting.\nMinimum version required: %1.\nTo update or for more information click on Help";
        }
        return '';
    }

    /**
     * @description retrieves the language of the current document, and if not defined takes that of the application.
     * @returns the language.
     */
    getLang() {
        var lang = 'en';
        if (this.banDocument)
            lang = this.banDocument.locale;
        else if (Banana.application.locale)
            lang = Banana.application.locale;
        if (lang.length > 2)
            lang = lang.substr(0, 2);
        return lang;
    }

    /**
     *@description This method allows you to retrieve information about the accounting file using the *banDocument.info()* API, 
     * returning an object containing the various information.
     *@returns an object containing the document informations
     */
    getDocumentInfo() {
        var documentInfo = {};
        documentInfo.isDoubleEntry = false;
        documentInfo.isIncomeExpenses = false;
        documentInfo.isCashBook = false;
        documentInfo.decimalsAmounts = 2;
        documentInfo.multiCurrency = false;
        documentInfo.withVat = false;
        documentInfo.vatAccount = "";
        documentInfo.customersGroup = "";
        documentInfo.suppliersGroup = "";
        documentInfo.basicCurrency = "";
        documentInfo.company = "";
        documentInfo.name = "";
        documentInfo.familyName = "";
        documentInfo.StartPeriod = "";
        documentInfo.EndPeriod = "";
        documentInfo.Company = "";
        documentInfo.address1 = "";


        if (this.banDocument) {
            var fileGroup = this.banDocument.info("Base", "FileTypeGroup");
            var fileNumber = this.banDocument.info("Base", "FileTypeNumber");
            var fileVersion = this.banDocument.info("Base", "FileTypeVersion");
            var StartPeriod = this.banDocument.info("AccountingDataBase", "OpeningDate");
            var EndPeriod = this.banDocument.info("AccountingDataBase", "ClosureDate");

            if (fileGroup == "100")
                documentInfo.isDoubleEntry = true;
            else if (fileGroup == "110")
                documentInfo.isIncomeExpenses = true;
            else if (fileGroup == "130")
                documentInfo.isCashBook = true;

            if (fileNumber == "110") {
                documentInfo.withVat = true;
            }
            if (fileNumber == "120") {
                documentInfo.multiCurrency = true;
            }
            if (fileNumber == "130") {
                documentInfo.multiCurrency = true;
                documentInfo.withVat = true;
            }

            if (this.banDocument.info("AccountingDataBase", "VatAccount"))
                documentInfo.vatAccount =
                this.banDocument.info("AccountingDataBase", "VatAccount");

            if (this.banDocument.info("AccountingDataBase", "CustomersGroup"))
                documentInfo.customersGroup =
                this.banDocument.info("AccountingDataBase", "CustomersGroup");
            if (this.banDocument.info("AccountingDataBase", "SuppliersGroup"))
                documentInfo.suppliersGroup =
                this.banDocument.info("AccountingDataBase", "SuppliersGroup");

            if (this.banDocument.info("AccountingDataBase", "BasicCurrency"))
                documentInfo.basicCurrency =
                this.banDocument.info("AccountingDataBase", "BasicCurrency");

            if (this.banDocument.info("AccountingDataBase", "Company"))
                documentInfo.company =
                this.banDocument.info("AccountingDataBase", "Company");

            if (this.banDocument.info("AccountingDataBase", "Name"))
                documentInfo.name =
                this.banDocument.info("AccountingDataBase", "Name");

            if (this.banDocument.info("AccountingDataBase", "FamilyName"))
                documentInfo.familyName =
                this.banDocument.info("AccountingDataBase", "FamilyName");

            if (this.banDocument.info("Base", "DecimalsAmounts"))
                documentInfo.decimalsAmounts =
                this.banDocument.info("Base", "DecimalsAmounts");

            if (this.banDocument.info("AccountingDataBase", "OpeningDate"))
                documentInfo.StartPeriod =
                this.banDocument.info("AccountingDataBase", "OpeningDate");

            if (this.banDocument.info("AccountingDataBase", "ClosureDate"))
                documentInfo.Address1 =
                this.banDocument.info("AccountingDataBase", "ClosureDate");

            if (this.banDocument.info("AccountingDataBase", "Address1"))
                documentInfo.address1 =
                this.banDocument.info("AccountingDataBase", "Address1");
        }
        return documentInfo;
    }

    /**
     * @description
     * @Param {*} dialogparam 
     */
    setParam(dialogparam) {
        this.dialogparam = dialogparam;
        return this.verifyParam();
    }

    /**
     * @description This method simply convert a local amount to the local amount format.
     * @Param {number} value
     * @returns the value converted
     */
    toLocaleAmountFormat(value) {
        if (!value || value.trim().length === 0)
            return "";

        var dec = this.dialogparam.numberofdecimals
        return Banana.Converter.toLocaleNumberFormat(value, dec, true);
    }

    /**
     * @description checks the software version, only works with the latest version: 10.0, if the version is not the latest
     * shows an error message
     */
    verifyBananaVersion() {
        if (!this.banDocument)
            return false;

        var lang = this.getLang();

        //Banana+ is required
        var requiredVersion = "10.0.3";
        if (Banana.compareVersion && Banana.compareVersion(Banana.application.version, requiredVersion) < 0) {
            var msg = this.getErrorMessage(this.ID_ERR_VERSION_NOTSUPPORTED, lang);
            msg = msg.replace("%1", requiredVersion);
            this.banDocument.addMessage(msg, this.ID_ERR_VERSION_NOTSUPPORTED);
            return false;
        }
        /*if (!Banana.application.isExperimental) {
            var msg = this.getErrorMessage(this.ID_ERR_EXPERIMENTAL_REQUIRED, lang);
            this.banDocument.addMessage(msg, this.ID_ERR_EXPERIMENTAL_REQUIRED);
            return false;
        }*/
        if (!Banana.application.license || Banana.application.license.licenseType !== "advanced") {
            var msg = this.getErrorMessage(this.ID_ERR_LICENSE_NOTVALID, lang);
            this.banDocument.addMessage(msg, this.ID_ERR_LICENSE_NOTVALID);
            return false;
        }
        return true;
    }

    /**
     * @description this function check that the parameters are objects, if they are not they are set with the default value calling the initDialogParam() method.
     * @Param {object} dialogparam: an object containing the parameters recovered from the dialog setting
     */
    verifyParam() {
        // I check if the parameter is not the one I expect empty then I empty it.
        var defaultParam = this.initDialogParam();


        //I check if the number of previous years entered is valid, otherwise I reset it to the maximum number or zero if is NAN or >0
        this.dialogparam.maxpreviousyears
        if (this.dialogparam.maxpreviousyears > 3)
            this.dialogparam.maxpreviousyears = 3;
        if (isNaN(this.dialogparam.maxpreviousyears) || this.dialogparam.maxpreviousyears < 0) {
            this.dialogparam.maxpreviousyears = 0;
        }


        //I check if the number of decimals entered is valid, otherwise I reset it to the maximum number
        if (this.dialogparam.numberofdecimals > 4)
            this.dialogparam.numberofdecimals = 4;

        if (!this.dialogparam || this.dialogparam.version !== defaultParam.version) {
            //currently resets all parameters, 
            //for later versions, incorrect or missing parameters can be corrected
            this.dialogparam = defaultParam;
            return false;
        }
        return true;
    }

    /**
     * This method check if the parameters are presents in the chart of accounts of the document.
     * We cotrol only the balance and profit and loss groups, identified by the "".group" parameter.
     * If an element is not a valid account or a valid group, is inserted within a string, every element is divided by a semicolon;
     * If a Field has at least one missing element, for this section is set an error EMssage (.errorMsg)
     * for every missing element, a counter is increased, if the counter is greater than 0, so the method return false.
     * This method is called ba the validateParams() function.
     * @Param {*} convertedParam : the parameters in the setting dialog
     */
    CheckNonExistentGroupsOrAccounts(convertedParam) {
        var Docgroups = this.loadGroups();
        var Docaccounts = this.loadAccounts();
        var nonExistentElements = "";
        var everyGroupExist = true;
        var warningMsg = qsTr("Non-existent groups/accounts: ");
        var elementsList = {};
        var len = "";
        var somethingIsMissingCounter = 0;
        for (var i = 0; i < convertedParam.data.length; i++) {
            if (convertedParam.data[i].value) {
                if (convertedParam.data[i].group === "balance" || convertedParam.data[i].group === "profitandloss") {
                    var valuelist = convertedParam.data[i].value.toString();
                    valuelist = convertedParam.data[i].value.split(";");
                    for (var element in valuelist) {
                        if (Docgroups.indexOf(valuelist[element]) < 0 && Docaccounts.indexOf(valuelist[element]) < 0) {
                            somethingIsMissingCounter++;
                            if (nonExistentElements.length > 0) {
                                nonExistentElements += "; ";
                            }
                            nonExistentElements += valuelist[element];
                        }
                    }
                    if (nonExistentElements.length > 0) {
                        convertedParam.data[i].errorMsg = warningMsg + nonExistentElements;
                    }
                    nonExistentElements = "";
                }
            }
        }

        if (somethingIsMissingCounter > 0) {
            everyGroupExist = false;
        } else {
            everyGroupExist = true;
        }
        return everyGroupExist;
    }

}

/**
 * 
 * @Param {*} params 
 */

function validateParams(params) {
    var financialStatementAnalysis = new FinancialStatementAnalysis(Banana.document);
    return financialStatementAnalysis.CheckNonExistentGroupsOrAccounts(params);
}
/**
 * @description is called when the script is executed.
 * Inside it, the **FinancialStatementAnalysis** class is declared and instantiated, which takes the document you want to run the script on as a parameter. In addition, the methods that must be executed when the application runs are called.
 * @Param {*} inData
 * @Param {*} options
 */
function exec(inData, options) {
    /*Per svuotare la tabella dei settings, la setto con vuoto.
    Banana.document.setScriptSettings("financialStatementAnalysis", "");
    return;*/

    if (!Banana.document)
        return "@Cancel";

    var financialStatementAnalysis = new FinancialStatementAnalysis(Banana.document);
    if (!financialStatementAnalysis.verifyBananaVersion()) {
        return "@Cancel";
    }

    var dialogparam = {};
    if (inData.length > 0) {
        dialogparam = JSON.parse(inData);
        financialStatementAnalysis.setParam(dialogparam);
    } else if (options && options.useLastSettings) {
        var savedParam = Banana.document.getScriptSettings("financialStatementAnalysis");
        if (savedParam.length > 0) {
            dialogparam = JSON.parse(savedParam);
            financialStatementAnalysis.setParam(dialogparam);
        }
    } else {
        if (!settingsDialog())
            return "@Cancel";
        var savedParam = Banana.document.getScriptSettings("financialStatementAnalysis");
        if (savedParam.length > 0) {
            dialogparam = JSON.parse(savedParam);
            financialStatementAnalysis.setParam(dialogparam);
        }
    }
    financialStatementAnalysis.loadData();
    var report = financialStatementAnalysis.printReport();
    var stylesheet = financialStatementAnalysis.getReportStyle();
    Banana.Report.preview(report, stylesheet);

}

/**
 * @description It is called when the user clicks on "Set Parameters" in the extension management dialog, goes to read the current values of the parameters (via a value get containing the id of the settings) from a system table called *syskey,
 * where the values the user enters as parameters in the dialog are saved, asks the user to enter the information and changes the values via a set.
 * By doing so the Exec function should be able to read the new settings.
 * @returns true if there arent error while reading and setting new parameters.
 */
function settingsDialog() {
    var financialStatementAnalysis = new FinancialStatementAnalysis(Banana.document);
    var savedParam = Banana.document.getScriptSettings("financialStatementAnalysis");
    if (savedParam.length > 0) {
        financialStatementAnalysis.setParam(JSON.parse(savedParam));
    }

    var dialogTitle = 'Settings';
    var pageAnchor = 'financialStatementAnalysis';
    var convertedParam = financialStatementAnalysis.convertParam();
    if (!Banana.Ui.openPropertyEditor(dialogTitle, convertedParam, pageAnchor))
        return false;
    for (var i = 0; i < convertedParam.data.length; i++) {
        // Read values to dialogparam (through the readValue function)
        if (typeof(convertedParam.data[i].readValue) == "function")
            convertedParam.data[i].readValue();
    }
    var paramToString = JSON.stringify(financialStatementAnalysis.dialogparam);
    Banana.document.setScriptSettings("financialStatementAnalysis", paramToString);
    return true;
}