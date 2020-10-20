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
// @pubdate = 2020-09-24
// @inputdatasource = none
// @timeout = -1


var FinancialStatementAnalysis = class FinancialStatementAnalysis {
    /**
     * @description create the class attributes and give them a default value.
     * @param {Banana Document} banDocument: the current accounting file we are working with.
     */
    constructor(banDocument) {
        this.version = '1.0';
        this.banDocument = banDocument;
        this.data = {};
        this.info = this.getDocumentInfo();
        this.param = this.initParam();

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
     * @param {object} report: the report created
     * @param {number} columnsCount: the number of column in the table, is used for create empty space (span) for the titles inside the tables.
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
        var tableBilancio = report.addTable('myTableBilancio');
        tableBilancio.setStyleAttributes("width:100%;");
        tableBilancio.getCaption().addText(qsTr("BALANCE"), "styleGroupTitles");
        //columns
        columnsCount = 0;
        tableBilancio.addColumn("Description").setStyleAttributes("width:30%");
        /*tableBilancio.addColumn("Acronym").setStyleAttributes("width:10%");
        tableBilancio.addColumn("Currency").setStyleAttributes("width:10%");
        var width = 50;
        if (this.data.length > 0)
            width = width / parseInt(this.data.length);
        for (var i = 0; i < this.data.length; i++) {
            tableBilancio.addColumn("Amount").setStyleAttributes("width:" + width.toString() + "%");
            columnsCount++;
        }*/
        // header
        var tableHeader = tableBilancio.getHeader();
        var tableRow = tableHeader.addRow();
        tableRow.addCell(qsTr("Description"), "styleTableHeader");
        tableRow.addCell(qsTr("Acronym"), "styleTableHeader");
        for (var i = 0; i < this.data.length; i++) {
            var year = this.data[i].period.StartDate;
            if (year !== "BUDGET")
                year = year.substr(0, 4);
            tableRow.addCell(year, "styleTableHeader");
        }
        return tableBilancio;
    }
    printReportAddTableBalanceControlSums(report) {
        var tableBilancioSumsControl = report.addTable('myTableBilancioSumsControl');
        tableBilancioSumsControl.setStyleAttributes("width:100%;");
        tableBilancioSumsControl.getCaption().addText(qsTr("BALANCE CONTROL SUMS"), "styleGroupTitles");
        tableBilancioSumsControl.addColumn("Year").setStyleAttributes("width:25%");
        tableBilancioSumsControl.addColumn("Sheet Total").setStyleAttributes("width:25%");
        tableBilancioSumsControl.addColumn("Calculated Total").setStyleAttributes("width:25%");
        tableBilancioSumsControl.addColumn("Difference").setStyleAttributes("width:25%");
        // header
        var tableHeader = tableBilancioSumsControl.getHeader();
        var tableRow = tableHeader.addRow();
        tableRow.addCell(qsTr("Year"), "styleTableHeader");
        tableRow.addCell(qsTr("Sheet Total"), "styleTableHeader");
        tableRow.addCell(qsTr("Calculated Total"), "styleTableHeader");
        tableRow.addCell(qsTr("Difference"), "styleTableHeader");
        return tableBilancioSumsControl;
    }
    printReportAddTableConCeControlSums(report) {
        var tableConCeSumsControl = report.addTable('mytableConCeSumsControl');
        tableConCeSumsControl.setStyleAttributes("width:100%;");
        tableConCeSumsControl.getCaption().addText(qsTr("PROFIT AND LOSS SUMS"), "styleGroupTitles");
        tableConCeSumsControl.addColumn("Sheet Total").setStyleAttributes("width:30%");
        tableConCeSumsControl.addColumn("Calculated Total").setStyleAttributes("width:30%");
        tableConCeSumsControl.addColumn("Difference").setStyleAttributes("width:30%");
        // header
        var tableHeader = tableConCeSumsControl.getHeader();
        var tableRow = tableHeader.addRow();
        tableRow.addCell(qsTr("Sheet Total"), "styleTableHeader");
        tableRow.addCell(qsTr("Calculated Total"), "styleTableHeader");
        tableRow.addCell(qsTr("Difference"), "styleTableHeader");
        return tableConCeSumsControl;
    }

    printReportAddTableConCe(report) {
        var tableConCe = report.addTable('myConTableCe');
        tableConCe.setStyleAttributes("width:100%;");
        tableConCe.getCaption().addText(qsTr("PROFIT AND LOSS"), "styleGroupTitles");
        tableConCe.addColumn("Description").setStyleAttributes("width:30%");
        /* tableConCe.addColumn("Acronym").setStyleAttributes("width:10%");
         tableConCe.addColumn("Currency").setStyleAttributes("width:10%");*/
        /*var width = 50;
        if (this.data.length > 0)
            width = width / parseInt(this.data.length);
        for (var i = 0; i < this.data.length; i++) {
            tableConCe.addColumn("Amount").setStyleAttributes("width:" + width.toString() + "%");
        }*/
        // header
        var tableHeader = tableConCe.getHeader();
        var tableRow = tableHeader.addRow();
        tableRow.addCell(qsTr("Description"), "styleTableHeader");
        tableRow.addCell(qsTr("Acronym"), "styleTableHeader");
        for (var i = 0; i < this.data.length; i++) {
            var year = this.data[i].period.StartDate;
            if (year !== "BUDGET")
                year = year.substr(0, 4);
            tableRow.addCell(year, "styleTableHeader");
        }
        return tableConCe;
    }

    printReportAddTableIndliq(report) {
        var tableIndliq = report.addTable('myIndliqTable');
        tableIndliq.setStyleAttributes("width:100%;");
        tableIndliq.getCaption().addText(qsTr("LIQUIDITY RATIOS"), "styleGroupTitles");
        tableIndliq.addColumn("Description").setStyleAttributes("width:20%");
        tableIndliq.addColumn("formula").setStyleAttributes("width:25%");
        var width = 50;
        if (this.data.length > 0)
            width = width / parseInt(this.data.length);
        for (var i = 0; i < this.data.length; i++) {
            tableIndliq.addColumn("Amount").setStyleAttributes("width:" + width.toString() + "%");
        }
        tableIndliq.addColumn("Benchmark").setStyleAttributes("width:20%");

        // header
        var tableHeader = tableIndliq.getHeader();
        var tableRow = tableHeader.addRow();
        tableRow.addCell(qsTr("Description"), "styleTableHeader");
        tableRow.addCell(qsTr("formula"), "styleTableHeader");
        for (var i = 0; i < this.data.length; i++) {
            var year = this.data[i].period.StartDate;
            if (year !== "BUDGET")
                year = year.substr(0, 4);
            tableRow.addCell(year, "styleTableHeader");
        }
        tableRow.addCell(qsTr("BenchMark"), "styleTableHeader");
        return tableIndliq;
    }
    printReportAddTableIndfin(report) {
        var tableIndfin = report.addTable('myIndfinTable');
        tableIndfin.setStyleAttributes("width:100%;");
        tableIndfin.getCaption().addText(qsTr("FINANCING RATIOS"), "styleGroupTitles");
        tableIndfin.addColumn("Description").setStyleAttributes("width:20%");
        tableIndfin.addColumn("formula").setStyleAttributes("width:25%");
        var width = 50;
        if (this.data.length > 0)
            width = width / parseInt(this.data.length);
        for (var i = 0; i < this.data.length; i++) {
            tableIndfin.addColumn("Amount").setStyleAttributes("width:" + width.toString() + "%");
        }
        tableIndfin.addColumn("Benchmark").setStyleAttributes("width:20%");
        // header
        var tableHeader = tableIndfin.getHeader();
        var tableRow = tableHeader.addRow();
        tableRow.addCell(qsTr("Description"), "styleTableHeader");
        tableRow.addCell(qsTr("formula"), "styleTableHeader");
        for (var i = 0; i < this.data.length; i++) {
            var year = this.data[i].period.StartDate;
            if (year !== "BUDGET")
                year = year.substr(0, 4);
            tableRow.addCell(year, "styleTableHeader");
        }
        tableRow.addCell(qsTr("BenchMark"), "styleTableHeader");
        return tableIndfin;
    }
    printReportAddTableIndprof(report) {
        var tableIndprof = report.addTable('myIndprofTable');
        tableIndprof.setStyleAttributes("width:100%;");
        tableIndprof.getCaption().addText(qsTr("PROFITABILITY RATIOS"), "styleGroupTitles");
        tableIndprof.addColumn("Description").setStyleAttributes("width:20%");
        tableIndprof.addColumn("formula").setStyleAttributes("width:25%");
        var width = 50;
        if (this.data.length > 0)
            width = width / parseInt(this.data.length);
        for (var i = 0; i < this.data.length; i++) {
            tableIndprof.addColumn("Amount").setStyleAttributes("width:" + width.toString() + "%");
        }
        tableIndprof.addColumn("Benchmark").setStyleAttributes("width:20%");
        // header
        var tableHeader = tableIndprof.getHeader();
        var tableRow = tableHeader.addRow();
        tableRow.addCell(qsTr("Description"), "styleTableHeader");
        tableRow.addCell(qsTr("formula"), "styleTableHeader");
        for (var i = 0; i < this.data.length; i++) {
            var year = this.data[i].period.StartDate;
            if (year !== "BUDGET")
                year = year.substr(0, 4);
            tableRow.addCell(year, "styleTableHeader");
        }
        tableRow.addCell(qsTr("BenchMark"), "styleTableHeader");
        return tableIndprof;
    }

    printReportAddTableDupont(report) {
        var tableDupont = report.addTable('myDupontTable');
        tableDupont.setStyleAttributes("width:100%;");
        tableDupont.addColumn("").setStyleAttributes("width:10%");
        tableDupont.addColumn("").setStyleAttributes("width:10%");
        tableDupont.addColumn("").setStyleAttributes("width:10%");
        tableDupont.addColumn("").setStyleAttributes("width:10%");
        tableDupont.addColumn("").setStyleAttributes("width:10%");
        tableDupont.addColumn("").setStyleAttributes("width:10%");
        tableDupont.addColumn("").setStyleAttributes("width:10%");
        tableDupont.addColumn("").setStyleAttributes("width:10%");
        tableDupont.addColumn("").setStyleAttributes("width:10%");
        tableDupont.addColumn("").setStyleAttributes("width:10%");
        tableDupont.addColumn("").setStyleAttributes("width:10%");
        tableDupont.addColumn("").setStyleAttributes("width:10%");
        tableDupont.addColumn("").setStyleAttributes("width:10%");
        tableDupont.addColumn("").setStyleAttributes("width:10%");
        tableDupont.addColumn("").setStyleAttributes("width:10%");
        return tableDupont;
    }

    printtableAltmanIndex(report) {

        var tableAltmanIndex = report.addTable('myTableAltmanIndex');
        tableAltmanIndex.setStyleAttributes("width:100%;");
        tableAltmanIndex.getCaption().addText("Altman Index Z-SCORE", "styleGroupTitles");
        var width = 100;
        if (this.data.length > 0)
            width = width / parseInt(this.data.length);
        for (var i = 0; i < this.data.length; i++) {
            tableAltmanIndex.addColumn("Amount").setStyleAttributes("width:" + width.toString() + "%");
        }
        // header
        var tableHeader = tableAltmanIndex.getHeader();
        var tableRow = tableHeader.addRow();
        for (var i = 0; i < this.data.length; i++) {
            var year = this.data[i].period.StartDate;
            if (year !== "BUDGET")
                year = year.substr(0, 4);
            tableRow.addCell(year, "styleTableHeader");
        }

        return tableAltmanIndex;

    }
    printReportAddTableUsedSetting(report, columnsCount) {
            var tableCompanyInfo = report.addTable('myTableUsedSetting');
            tableCompanyInfo.setStyleAttributes("width:40%;");
            tableCompanyInfo.getCaption().addText("Used Setting", "styleGroupTitles");
            //columns
            columnsCount = 3;
            tableCompanyInfo.addColumn("Property").setStyleAttributes("width:30%");
            tableCompanyInfo.addColumn("Value").setStyleAttributes("width:10%");
            tableCompanyInfo.addColumn("Currency").setStyleAttributes("width:10%");
            return tableCompanyInfo;
        }
        /**
         * @description calculates the number of columns depending on the number of years of analysis,
         * the result is used to create the right span.
         * @param {object} yearcolumns : an object set to 0.
         * @returns the number of columns
         */
    yearsColumnCount(yearcolumns) {
            for (var i = 0; i < this.data.length; i++) {

                yearcolumns++
            }
            return yearcolumns;
        }
        /**
         * @description set the header of the report.
         * @param {object} report: the report created
         */
    addHeader(report) {
            /*for (var i = 0; i < this.data.length; i++) {
                var lunghezza = this.data.length;
                var startperiod = this.data[lunghezza - 1].period.StartDate;
                startperiod = startperiod.substr(0, 4);
                var endperiod = this.data[0].period.EndDate;
                endperiod = endperiod.substr(0, 4);
            }*/
            report.getHeader().addClass("header");
            report.getHeader().addText(qsTr('Financial Statements Analysis'));
            // report.getHeader().addText("period: " + startperiod + " - " + endperiod);

        }
        /**
         * @description set the footer of the report.
         * @param {object} report: the report created
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

        var report = Banana.Report.newReport('Analisi di Bilancio');
        var docInfo = this.getDocumentInfo()
        var currency = docInfo.basicCurrency;
        var company = docInfo.company;
        var Address1 = docInfo.address1;
        var Country = docInfo.country;
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
        tableRow.addCell(qsTr("PMI / KMU"), 'styleCompanyInfocells');
        var tableRow = tableCompanyInfo.addRow();
        tableRow.addCell(qsTr('ANALYSIS PERIOD'));
        var period = " ";
        var sep = "";
        for (var i = 0; i < this.data.length; i++) {
            var endperiod = this.data[i].period.EndDate;
            endperiod = endperiod.substr(0, 4);
            if (i >= 1) {
                sep = '-'
            }
            period = period + sep + endperiod;

        }
        report.addPageBreak();

        tableRow.addCell(qsTr(period), 'styleCompanyInfocells');

        //Add Table balance
        var colCountTableBilancio = 0;
        var tableBilancio = this.printReportAddTableBalance(report, this.yearsColumnCount(colCountTableBilancio));
        // current assets
        var tableRow = tableBilancio.addRow("styleTablRows");
        tableRow.addCell(qsTr('Active'), "styleUnderGroupTitles", 7);
        for (var key in this.data[0].bilancio.ac) {
            var tableRow = tableBilancio.addRow("styleTablRows");
            tableRow.addCell(qsTr(this.data[0].bilancio.ac[key].description));
            tableRow.addCell(key);
            for (var i = 0; i < this.data.length; i++) {
                var amount = this.data[i].bilancio.ac[key].balance;
                tableRow.addCell(this.toLocaleAmountFormat(amount), "styleAmount");
            }
        }
        tableRow = tableBilancio.addRow("styleTablRows");
        tableRow.addCell(qsTr('Current Assets'), 'styleUnderGroupTitles');
        tableRow.addCell('cuas');
        for (var i = 0; i < this.data.length; i++) {
            tableRow.addCell(this.toLocaleAmountFormat(this.data[i].CalculatedData.CurrentAsset), "styleMidTotal");
        }

        //add the AF counts, and put the data inside with a loop on the right level
        for (var key in this.data[0].bilancio.af) {
            var tableRow = tableBilancio.addRow("styleTablRows");
            tableRow.addCell(qsTr(this.data[0].bilancio.af[key].description));
            tableRow.addCell(key);
            for (var i = 0; i < this.data.length; i++) {
                var amount = this.data[i].bilancio.af[key].balance;
                tableRow.addCell(this.toLocaleAmountFormat(amount), "styleAmount");
            }
        }
        tableRow = tableBilancio.addRow("styleTablRows");
        tableRow.addCell(qsTr('Fixed Assets'), 'styleUnderGroupTitles');
        tableRow.addCell('tfix');
        for (var i = 0; i < this.data.length; i++) {
            tableRow.addCell(this.toLocaleAmountFormat(this.data[i].CalculatedData.FixedAsset), "styleMidTotal");
        }

        var tableRow = tableBilancio.addRow("styleTablRows");
        tableRow.addCell(qsTr('Total Active'), 'styleTitlesTotAmount');
        tableRow.addCell('tota');
        for (var i = 0; i < this.data.length; i++) {
            tableRow.addCell(this.toLocaleAmountFormat(this.data[i].CalculatedData.TotActive), "styleTotAmount");
        }

        //add the CT counts, and put the data inside with a loop on the right level
        var tableRow = tableBilancio.addRow("styleTablRows");
        tableRow.addCell('Liabilities and Equity', 'styleUnderGroupTitles', colCountTableBilancio);
        for (var key in this.data[0].bilancio.ct) {
            var tableRow = tableBilancio.addRow("styleTablRows");
            tableRow.addCell(qsTr(this.data[0].bilancio.ct[key].description));
            tableRow.addCell(key);
            for (var i = 0; i < this.data.length; i++) {
                var amount = this.data[i].bilancio.ct[key].balance;
                tableRow.addCell(this.toLocaleAmountFormat(amount), 'styleAmount');
            }
        }
        tableRow = tableBilancio.addRow("styleTablRows");
        tableRow.addCell(qsTr('Debt Capital'), 'styleUnderGroupTitles');
        tableRow.addCell('deca');
        for (var i = 0; i < this.data.length; i++) {
            tableRow.addCell(this.toLocaleAmountFormat(this.data[i].CalculatedData.DebtCapital), "styleMidTotal");
        }

        // own capital
        for (var key in this.data[0].bilancio.cp) {
            var tableRow = tableBilancio.addRow("styleTablRows");
            tableRow.addCell(qsTr(this.data[0].bilancio.cp[key].description));
            tableRow.addCell(key);
            for (var i = 0; i < this.data.length; i++) {
                var amount = this.data[i].bilancio.cp[key].balance;
                tableRow.addCell(this.toLocaleAmountFormat(amount), "styleAmount");
            }
        }
        tableRow = tableBilancio.addRow("styleTablRows");
        tableRow.addCell(qsTr('Own Capital', 'styleUnderGroupTitles'));
        tableRow.addCell('owca');
        for (var i = 0; i < this.data.length; i++) {
            tableRow.addCell(this.toLocaleAmountFormat(this.data[i].CalculatedData.OwnCapital), "styleMidTotal");
        }

        var tableRow = tableBilancio.addRow("styleTablRows");
        tableRow.addCell(qsTr('Total Liabilities and Equity'), 'styleTitlesTotAmount');
        tableRow.addCell('totp');
        for (var i = 0; i < this.data.length; i++) {
            tableRow.addCell(this.toLocaleAmountFormat(this.data[i].CalculatedData.TotPassive), "styleTotAmount");
        }
        // Add the Balance control sums table
        var tableBalanceControlSums = this.printReportAddTableBalanceControlSums(report);
        var tableRow = tableBalanceControlSums.addRow("styleTablRows");
        tableRow.addCell(qsTr("Active"), "styleUnderGroupTitles", 4);
        for (var i = 0; i < this.data.length; i++) {
            var tableRow = tableBalanceControlSums.addRow("styleTablRows");
            var period = this.data[i].period.StartDate;
            var year = period.substr(0, 4);
            Banana.console.debug(year);
            if (year != "BUDG") {
                tableRow.addCell(year);
                tableRow.addCell(this.toLocaleAmountFormat(this.data[i].CalculatedData.TotActiveSheet), "styleAmount");
                tableRow.addCell(this.toLocaleAmountFormat(this.data[i].CalculatedData.TotActive), "styleAmount");
                tableRow.addCell(this.toLocaleAmountFormat(this.data[i].CalculatedData.ActiveDifference), "styleAmount");
            }
        }
        var tableRow = tableBalanceControlSums.addRow("styleTablRows");
        tableRow.addCell(qsTr("Liabilities and Equity"), "styleUnderGroupTitles", 4);
        for (var i = 0; i < this.data.length; i++) {
            var tableRow = tableBalanceControlSums.addRow("styleTablRows");
            var period = this.data[i].period.StartDate;
            var year = period.substr(0, 4);
            if (year != "BUDG") {
                tableRow.addCell(year);
                tableRow.addCell(this.toLocaleAmountFormat(this.data[i].CalculatedData.TotPassiveSheet), "styleAmount");
                tableRow.addCell(this.toLocaleAmountFormat(this.data[i].CalculatedData.TotPassive), "styleAmount");
                tableRow.addCell(this.toLocaleAmountFormat(this.data[i].CalculatedData.PassiveDifference), "styleAmount");
            }
        }

        report.addPageBreak();

        //Add Table profit and loss
        var tableCe = this.printReportAddTableConCe(report);
        for (var key in this.data[0].contoeconomico) {
            var invertAmount = false;
            var description = this.data[0].contoeconomico[key].description;
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
            tableRow.addCell(key);
            for (var i = 0; i < this.data.length; i++) {
                var amount = this.data[i].contoeconomico[key].balance;
                if (invertAmount)
                    amount = Banana.SDecimal.invert(amount);
                tableRow.addCell(this.toLocaleAmountFormat(amount), "styleAmount");
            }
            if (key === "cofm") {
                var tableRow = tableCe.addRow("styleTablRows");
                tableRow.addCell(qsTr("= Added Value"), "styleUnderGroupTitles");
                tableRow.addCell("adva");
                for (var i = 0; i < this.data.length; i++) {
                    tableRow.addCell(this.toLocaleAmountFormat(this.data[i].CalculatedData.AddedValue), "styleMidTotal");
                }
            }
            if (key === "amre") {
                var tableRow = tableCe.addRow("styleTablRows");
                tableRow.addCell("= EBIT", "styleUnderGroupTitles");
                tableRow.addCell("ebit");
                for (var i = 0; i < this.data.length; i++) {
                    tableRow.addCell(this.toLocaleAmountFormat(this.data[i].CalculatedData.Ebit), "styleMidTotal");
                }
            }
            if (key === "codi") {
                var tableRow = tableCe.addRow("styleTablRows");
                tableRow.addCell("= EBITDA", "styleUnderGroupTitles");
                tableRow.addCell("ebitda");
                for (var i = 0; i < this.data.length; i++) {
                    tableRow.addCell(this.toLocaleAmountFormat(this.data[i].CalculatedData.EbitDa), "styleMidTotal");
                }

            }
        }
        var tableRow = tableCe.addRow("styleTablRows");
        tableRow.addCell(qsTr("Annual result"), "styleTitlesTotAmount");
        tableRow.addCell("anre");
        for (var i = 0; i < this.data.length; i++) {
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
        tableRow.addCell(this.toLocaleAmountFormat(this.data[Arrayindexcurr].CalculatedData.TotAnnualDifference), "styleAmount");

        report.addPageBreak();

        report.addParagraph(qsTr("analysis by index"), "styleUnderGroupTitles");

        /*add the liquidity ratios table
        add the sign % only if the values are ratios
        also if the value arent't a ratio, we give them a normal amount style;
         */
        var tableindliq = this.printReportAddTableIndliq(report);

        for (var key in this.data[0].index.liqu) {
            var tableRow = tableindliq.addRow("styleTablRows");
            tableRow.addCell(qsTr(this.data[0].index.liqu[key].description), "styleNormal");
            tableRow.addCell(this.data[0].index.liqu[key].formula, "styleNormal");
            for (var i = 0; i < this.data.length; i++) {
                var perc = "";
                var stile = "";
                var ratios = this.data[i].index.liqu[key].amount;
                if (this.data[0].index.liqu[key].description != "net current asset") {
                    perc = "%";
                }
                if (this.data[0].index.liqu[key].description === "net current asset") {
                    stile = "styleAmount";
                } else {
                    stile = "styleRatiosAmount";
                }
                tableRow.addCell(ratios + perc, stile);
            }
            tableRow.addCell(this.data[0].index.liqu[key].benchmark, "styleNormal");
        }

        //add the financing ratios table
        var tableindfin = this.printReportAddTableIndfin(report);

        for (var key in this.data[0].index.fin) {
            var tableRow = tableindfin.addRow("styleTablRows");
            tableRow.addCell(qsTr(this.data[0].index.fin[key].description), "styleNormal");
            tableRow.addCell(this.data[0].index.fin[key].formula, "styleNormal");
            for (var i = 0; i < this.data.length; i++) {
                var ratios = this.data[i].index.fin[key].amount;
                tableRow.addCell(ratios + "%", "styleRatiosAmount");
            }
            tableRow.addCell(this.data[0].index.fin[key].benchmark, "styleNormal");
        }

        //add the profitability ratios table
        var tableindprof = this.printReportAddTableIndprof(report);

        for (var key in this.data[0].index.red) {
            var tableRow = tableindprof.addRow("styleTablRows");
            tableRow.addCell(qsTr(this.data[0].index.red[key].description), "styleNormal");
            tableRow.addCell(this.data[0].index.red[key].formula, "styleNormal");
            for (var i = 0; i < this.data.length; i++) {
                var ratios = this.data[i].index.red[key].amount;
                tableRow.addCell(ratios + "%", "styleRatiosAmount");
            }
            tableRow.addCell(this.data[0].index.red[key].benchmark, "styleNormal");
        }
        report.addPageBreak();
        var year = "";
        var sep = "";
        for (var i = 0; i < this.data.length; i++) {
            var period = this.data[i].period.StartDate;
            var period = period.substr(0, 4);
            if (i >= 1) {
                sep = '-'
            }
            year = year + sep + period;

        }
        report.addParagraph(qsTr("DUPONT SCHEME YEARS: ") + year, "styleGroupTitles");
        var Arrayindexcurr;
        var Arrayindexprec;

        if (this.data[0].isBudget === true) {
            Arrayindexcurr = 1;
            Arrayindexprec = 2;
        } else {
            Arrayindexcurr = 0;
            Arrayindexprec = 1;
        }

        //add the dupont scheme for the current year
        var tabledupont = this.printReportAddTableDupont(report);
        //first row
        var tableRow = tabledupont.addRow();
        tableRow.addCell(" ", "emptyCells", 14);

        //row n.2
        var tableRow = tabledupont.addRow();
        tableRow.addCell(" ", "emptyCells", 6);
        tableRow.addCell(qsTr("Capital"), "styledupontTexts", 2);
        tableRow.addCell(" ", "emptyCells", 1);
        tableRow.addCell(qsTr("Fixed Asset"), "styledupontTexts", 2);
        tableRow.addCell(" ", "emptyCells", 3);

        //row n.3
        var tableRow = tabledupont.addRow();
        tableRow.addCell(" ", "emptyCells", 6);
        var balance = 0;
        if (this.data[Arrayindexcurr])
            balance = this.data[Arrayindexcurr].DupontData.capital;
        tableRow.addCell(this.toLocaleAmountFormat(balance), "dupontCurryearValueCells");
        balance = 0;
        if (this.data[Arrayindexprec])
            balance = this.data[Arrayindexprec].DupontData.capital;
        tableRow.addCell(this.toLocaleAmountFormat(balance), "dupontYearbackValueCells");
        tableRow.addCell(" ", "emptyCells", 1);
        var balance = 0;
        if (this.data[Arrayindexcurr])
            balance = this.data[Arrayindexcurr].DupontData.FixedAsset;
        tableRow.addCell(this.toLocaleAmountFormat(balance), "dupontCurryearValueCells");
        balance = 0;
        if (this.data[Arrayindexprec])
            balance = this.data[Arrayindexprec].DupontData.FixedAsset;
        tableRow.addCell(this.toLocaleAmountFormat(balance), "dupontYearbackValueCells");

        tableRow.addCell(" ", "emptyCells", 3);

        //row n.4
        var tableRow = tabledupont.addRow();
        tableRow.addCell(" ", "emptyCells", 14);

        //row n.5
        var tableRow = tabledupont.addRow();
        tableRow.addCell(" ", "emptyCells", 3);
        tableRow.addCell("ROT", "styledupontTexts", 2);
        tableRow.addCell(" ", "emptyCells", 4);
        tableRow.addCell(qsTr("Current Asset"), "styledupontTexts", 2);
        tableRow.addCell(" ", "emptyCells", 1);
        tableRow.addCell(qsTr("liquidity"), "styledupontTexts", 2);


        //row n.6
        var tableRow = tabledupont.addRow();
        tableRow.addCell(" ", "emptyCells", 3);
        var balance = 0;
        if (this.data[Arrayindexcurr])
            balance = this.data[Arrayindexcurr].DupontData.rot;
        tableRow.addCell(this.toLocaleAmountFormat(balance), "dupontCurryearValueCells");
        balance = 0;
        if (this.data[Arrayindexprec])
            balance = this.data[Arrayindexprec].DupontData.rot;
        tableRow.addCell(this.toLocaleAmountFormat(balance), "dupontYearbackValueCells");

        tableRow.addCell(" ", "emptyCells", 4);
        var balance = 0;
        if (this.data[Arrayindexcurr])
            balance = this.data[Arrayindexcurr].DupontData.CurrentAsset;
        tableRow.addCell(this.toLocaleAmountFormat(balance), "dupontCurryearValueCells");
        balance = 0;
        if (this.data[Arrayindexprec])
            balance = this.data[Arrayindexprec].DupontData.CurrentAsset;
        tableRow.addCell(this.toLocaleAmountFormat(balance), "dupontYearbackValueCells");

        tableRow.addCell(" ", "emptyCells", 1);
        var balance = 0;
        if (this.data[Arrayindexcurr])
            balance = this.data[Arrayindexcurr].DupontData.liqu;
        tableRow.addCell(this.toLocaleAmountFormat(balance), "dupontCurryearValueCells");
        balance = 0;
        if (this.data[Arrayindexprec])
            balance = this.data[Arrayindexprec].DupontData.liqu;
        tableRow.addCell(this.toLocaleAmountFormat(balance), "dupontYearbackValueCells");

        //row n.7
        var tableRow = tabledupont.addRow();
        tableRow.addCell(" ", "emptyCells", 14);

        //row n.8
        var tableRow = tabledupont.addRow();
        tableRow.addCell(" ", "emptyCells", 6);
        tableRow.addCell(qsTr("Sales"), "styledupontTexts", 2);
        tableRow.addCell(" ", "emptyCells", 4);
        tableRow.addCell(qsTr("Credits"), "styledupontTexts", 2);

        //row n.9
        var tableRow = tabledupont.addRow();
        tableRow.addCell("ROI", "styledupontTexts", 2);
        tableRow.addCell(" ", "emptyCells", 4);
        var balance = 0;
        if (this.data[Arrayindexcurr])
            balance = this.data[Arrayindexcurr].DupontData.sales;
        tableRow.addCell(this.toLocaleAmountFormat(balance), "dupontCurryearValueCells");
        balance = 0;
        if (this.data[Arrayindexprec])
            balance = this.data[Arrayindexprec].DupontData.sales;
        tableRow.addCell(this.toLocaleAmountFormat(balance), "dupontYearbackValueCells");

        tableRow.addCell(" ", "emptyCells", 4);
        var balance = 0;
        if (this.data[Arrayindexcurr])
            balance = this.data[Arrayindexcurr].DupontData.cred;
        tableRow.addCell(this.toLocaleAmountFormat(balance), "dupontCurryearValueCells");
        balance = 0;
        if (this.data[Arrayindexprec])
            balance = this.data[Arrayindexprec].DupontData.cred;
        tableRow.addCell(this.toLocaleAmountFormat(balance), "dupontYearbackValueCells");


        //row n.10
        var tableRow = tabledupont.addRow();
        var balance = 0;
        if (this.data[Arrayindexcurr])
            balance = this.data[Arrayindexcurr].DupontData.roi;
        tableRow.addCell(this.toLocaleAmountFormat(balance) + "%", "dupontCurryearValueCells");
        balance = 0;
        if (this.data[Arrayindexprec])
            balance = this.data[Arrayindexprec].DupontData.roi;
        tableRow.addCell(this.toLocaleAmountFormat(balance) + "%", "dupontYearbackValueCells");

        tableRow.addCell(" ", "emptyCells", 12);

        //row n.11
        var tableRow = tabledupont.addRow();
        tableRow.addCell("benchmark 10%", "styledupontTexts", 2);
        tableRow.addCell(" ", "emptyCells", 10);
        tableRow.addCell(qsTr("Stocks"), "styledupontTexts", 2);

        //row n.12
        var tableRow = tabledupont.addRow();
        tableRow.addCell(" ", "emptyCells", 12);
        var balance = 0;
        if (this.data[Arrayindexcurr])
            balance = this.data[Arrayindexcurr].DupontData.stoc;
        tableRow.addCell(this.toLocaleAmountFormat(balance), "dupontCurryearValueCells");
        balance = 0;
        if (this.data[Arrayindexprec])
            balance = this.data[Arrayindexprec].DupontData.stoc;
        tableRow.addCell(this.toLocaleAmountFormat(balance), "dupontYearbackValueCells");


        //row n.13
        var tableRow = tabledupont.addRow();
        tableRow.addCell(" ", "emptyCells", 6);
        tableRow.addCell(qsTr("Sales"), "styledupontTexts", 2);
        tableRow.addCell(" ", "emptyCells", 6);

        //row n.14
        var tableRow = tabledupont.addRow();
        tableRow.addCell(" ", "emptyCells", 6);
        var balance = 0;
        if (this.data[Arrayindexcurr])
            balance = this.data[Arrayindexcurr].DupontData.sales;
        tableRow.addCell(this.toLocaleAmountFormat(balance), "dupontCurryearValueCells");
        balance = 0;
        if (this.data[Arrayindexprec])
            balance = this.data[Arrayindexprec].DupontData.sales;
        tableRow.addCell(this.toLocaleAmountFormat(balance), "dupontYearbackValueCells");

        tableRow.addCell(" ", "emptyCells", 6);

        //row n.15
        var tableRow = tabledupont.addRow();
        tableRow.addCell(" ", "emptyCells", 14);

        //row n.16
        var tableRow = tabledupont.addRow();
        tableRow.addCell(" ", "emptyCells", 3);
        tableRow.addCell("MOL", "styledupontTexts", 2);
        tableRow.addCell(" ", "emptyCells", 9);

        //row n.17
        var tableRow = tabledupont.addRow();
        tableRow.addCell(" ", "emptyCells", 3);
        var balance = 0;
        if (this.data[Arrayindexcurr])
            balance = this.data[Arrayindexcurr].DupontData.mol;
        tableRow.addCell(this.toLocaleAmountFormat(balance), "dupontCurryearValueCells");
        balance = 0;
        if (this.data[Arrayindexprec])
            balance = this.data[Arrayindexprec].DupontData.mol;
        tableRow.addCell(this.toLocaleAmountFormat(balance), "dupontYearbackValueCells");

        tableRow.addCell(" ", "emptyCells", 9);

        //row n.18
        var tableRow = tabledupont.addRow();
        tableRow.addCell(" ", "emptyCells", 14);


        //row n.19
        var tableRow = tabledupont.addRow();
        tableRow.addCell(" ", "emptyCells", 6);
        tableRow.addCell("EBIT", "styledupontTexts", 2);
        tableRow.addCell(" ", "emptyCells", 1);
        tableRow.addCell(qsTr("Sales"), "styledupontTexts", 2);
        tableRow.addCell(" ", "emptyCells", 3);

        //row n.20
        var tableRow = tabledupont.addRow();
        tableRow.addCell(" ", "emptyCells", 6);
        var balance = 0;
        if (this.data[Arrayindexcurr])
            balance = this.data[Arrayindexcurr].DupontData.ebit;
        tableRow.addCell(this.toLocaleAmountFormat(balance), "dupontCurryearValueCells");
        balance = 0;
        if (this.data[Arrayindexprec])
            balance = this.data[Arrayindexprec].DupontData.ebit;
        tableRow.addCell(this.toLocaleAmountFormat(balance), "dupontYearbackValueCells");

        tableRow.addCell(" ", "emptyCells", 1);
        var balance = 0;
        if (this.data[Arrayindexcurr])
            balance = this.data[Arrayindexcurr].DupontData.sales;
        tableRow.addCell(this.toLocaleAmountFormat(balance), "dupontCurryearValueCells");
        balance = 0;
        if (this.data[Arrayindexprec])
            balance = this.data[Arrayindexprec].DupontData.sales;
        tableRow.addCell(this.toLocaleAmountFormat(balance), "dupontYearbackValueCells");

        tableRow.addCell(" ", "emptyCells", 3);

        //row n.21
        var tableRow = tabledupont.addRow();
        tableRow.addCell(" ", "emptyCells", 14);

        //row n.22
        var tableRow = tabledupont.addRow();
        tableRow.addCell(" ", "emptyCells", 9);
        tableRow.addCell(qsTr("Total Cost"), "styledupontTexts", 2);
        tableRow.addCell(" ", "emptyCells", 1);
        tableRow.addCell(qsTr("Merchandise cost"), "styledupontTexts", 2);

        //row n.23
        var tableRow = tabledupont.addRow();
        tableRow.addCell(" ", "emptyCells", 9);
        var balance = 0;
        if (this.data[Arrayindexcurr])
            balance = this.data[Arrayindexcurr].DupontData.TotCosts;
        tableRow.addCell(this.toLocaleAmountFormat(balance), "dupontCurryearValueCells");
        balance = 0;
        if (this.data[Arrayindexprec])
            balance = this.data[Arrayindexprec].DupontData.TotCosts;
        tableRow.addCell(this.toLocaleAmountFormat(balance), "dupontYearbackValueCells");
        tableRow.addCell(" ", "emptyCells", 1);
        if (this.data[Arrayindexcurr])
            balance = this.data[Arrayindexcurr].DupontData.MerchCost;
        tableRow.addCell(this.toLocaleAmountFormat(balance), "dupontCurryearValueCells");
        balance = 0;
        if (this.data[Arrayindexprec])
            balance = this.data[Arrayindexprec].DupontData.MerchCost;
        tableRow.addCell(this.toLocaleAmountFormat(balance), "dupontYearbackValueCells");

        //row n.24
        var tableRow = tabledupont.addRow();
        tableRow.addCell(" ", "emptyCells", 14);

        //row n.25
        var tableRow = tabledupont.addRow();
        tableRow.addCell(" ", "emptyCells", 12);
        tableRow.addCell(qsTr("Personal costs"), "styledupontTexts", 2);

        //row n.26
        var tableRow = tabledupont.addRow();
        tableRow.addCell(" ", "emptyCells", 12);
        if (this.data[Arrayindexcurr])
            balance = this.data[Arrayindexcurr].DupontData.PersonelCost;
        tableRow.addCell(this.toLocaleAmountFormat(balance), "dupontCurryearValueCells");
        balance = 0;
        if (this.data[Arrayindexprec])
            balance = this.data[Arrayindexprec].DupontData.PersonelCost;
        tableRow.addCell(this.toLocaleAmountFormat(balance), "dupontYearbackValueCells");

        //row n.27
        var tableRow = tabledupont.addRow();
        tableRow.addCell(" ", "emptyCells", 14);

        //row n.28
        var tableRow = tabledupont.addRow();
        tableRow.addCell(" ", "emptyCells", 12);
        tableRow.addCell(qsTr("Different Costs"), "styledupontTexts", 2);

        //row n.29
        /* here the value of the different costs is without the depreciations and adjustments (amre)
         */
        var tableRow = tabledupont.addRow();
        tableRow.addCell(" ", "emptyCells", 12);
        if (this.data[Arrayindexcurr])
            balance = this.data[Arrayindexcurr].DupontData.DifferentCost;
        tableRow.addCell(this.toLocaleAmountFormat(balance), "dupontCurryearValueCells");
        balance = 0;
        if (this.data[Arrayindexprec])
            balance = this.data[Arrayindexprec].DupontData.DifferentCost;
        tableRow.addCell(this.toLocaleAmountFormat(balance), "dupontYearbackValueCells");

        report.addPageBreak();


        var tableAltmanIndex = this.printtableAltmanIndex(report);
        var yearcolumns = 0;
        var tableRow = tableAltmanIndex.addRow("styleTablRows");
        for (var i = 0; i < this.data.length; i++) {
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

        report.addPageBreak();

        //Add the Used Setting Table
        var tableUsedSsetting = this.printReportAddTableUsedSetting(report);
        var tableRow = tableUsedSsetting.addRow();
        tableRow.addCell(qsTr("Number of Previous Years"));
        tableRow.addCell(this.data[0].maxpreviousyears);
        var tableRow = tableUsedSsetting.addRow();
        tableRow.addCell(qsTr("Number of Decimals"));
        tableRow.addCell(this.data[0].numberofdecimals);
        var tableRow = tableUsedSsetting.addRow();
        tableRow.addCell(qsTr("Currency"));
        tableRow.addCell(currency);
        report.addPageBreak();

        return report;


    }

    /**
     * @description control the result of the Altman index, and set the correct style, there are three different possibilites, therefore three different styles.
     * @param {number} amount
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
        var groupList = [];
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
                groupList.push(groupId);

            }
        }
        return groupList;

    }

    /**
     * @description set the different styles for the report elements.
     * @returns the stylesheet
     */
    getReportStyle() {
        //CREATE THE STYLE FOR THE REPORT
        var stylesheet = Banana.Report.newStyleSheet();

        var pageStyle = stylesheet.addStyle("@page");
        pageStyle.setAttribute("margin", "15m 10mm 10mm 10mm");
        //style = stylesheet.addStyle("body", "font-size: 11pt");


        //style for the main title
        var style = stylesheet.addStyle(".styleBottomBorder");
        style.setAttribute("border-bottom", "1px solid black");


        //Create a table style adding the border
        style = stylesheet.addStyle("tableCompanyInfo");
        style = stylesheet.addStyle("tableUsedSetting");
        style = stylesheet.addStyle("tableBilancio");
        style = stylesheet.addStyle("TableBilancioSumsControl");
        style = stylesheet.addStyle("tableConCe");
        style = stylesheet.addStyle("tableConCeSumsControl");
        style = stylesheet.addStyle("tableIndliq");
        style = stylesheet.addStyle("tableIndfin");
        style = stylesheet.addStyle("tableIndprof");
        style = stylesheet.addStyle("tableDupont");
        style = stylesheet.addStyle("myTableAltmanIndex");
        stylesheet.addStyle("table.myTableCompanyInfo td", "border: thin solid black", "");
        stylesheet.addStyle("table.myTableUsedSetting td", "border: thin solid black", "");
        stylesheet.addStyle("table.myTableBilancio td", "border: thin solid black", "");
        stylesheet.addStyle("table.myTableBilancioSumsControl td", "border: thin solid black", "");
        stylesheet.addStyle("table.myConTableCe td", "border: thin solid black");
        stylesheet.addStyle("table.mytableConCeSumsControl td", "border: thin solid black", "");
        stylesheet.addStyle("table.myIndliqTable td", "border: thin solid black");
        stylesheet.addStyle("table.myIndfinTable td", "border: thin solid black");
        stylesheet.addStyle("table.myIndprofTable td", "border: thin solid black");
        stylesheet.addStyle("table.myDupontTable td", "border: thin solid black");
        stylesheet.addStyle("table.myTableAltmanIndex td", "border: thin solid black", "");


        //Style for the tables header
        style = stylesheet.addStyle(".styleTableHeader");
        style.setAttribute("font-weight", "bold");
        style.setAttribute("padding-bottom", "5px");
        style.setAttribute("background-color", "#FBF876");
        style.setAttribute("color", "#1b365d");
        style.setAttribute("text-align", "center");

        //Style for the tables rows
        style = stylesheet.addStyle(".styleTablRows");
        style.setAttribute("background-color", "#F7F7F7");

        //Style for the company info rows
        style = stylesheet.addStyle(".styleCompanyInfocells");
        style.setAttribute("font-weight", "bold");
        style.setAttribute("background-color", "#FBF876");
        style.setAttribute("text-align", "center");

        //style for the group titles
        style = stylesheet.addStyle(".styleGroupTitles");
        style.setAttribute("font-weight", "bold");
        style.setAttribute("padding", "10px");
        style.setAttribute("color", "#1b365d");

        //style for the under-group titles
        style = stylesheet.addStyle(".styleUnderGroupTitles");
        style.setAttribute("margin", "2px");
        style.setAttribute("color", "#1b365d");

        //Style for the normal elements
        style = stylesheet.addStyle(".styleNormal");
        style.setAttribute("padding-bottom", "5px");
        style.setAttribute("text-align", "center");

        //Style for amounts
        style = stylesheet.addStyle(".styleAmount");
        style.setAttribute("font-weight", "thin");
        style.setAttribute("text-align", "right");

        //style for the accounting mid totals
        style = stylesheet.addStyle(".styleMidTotal");
        style.setAttribute("font-weight", "bold");
        style.setAttribute("text-align", "right");

        //style for the accounting totals Amount
        style = stylesheet.addStyle(".styleTotAmount");
        style.setAttribute("background-color", "#e5f2ff");
        style.setAttribute("font-weight", "bold");
        style.setAttribute("text-align", "right");

        //style for the titles of the totals
        style = stylesheet.addStyle(".styleTitlesTotAmount");
        style.setAttribute("font-weight", "bold");
        style.setAttribute("color", "black");

        //styel for the negative Amounts
        style = stylesheet.addStyle(".styleNegativeAmount");
        style.setAttribute("color", "#ff0000");
        style.setAttribute("text-align", "right");

        //style fot the ratios  Amount
        style = stylesheet.addStyle(".styleRatiosAmount");
        style.setAttribute("font-weight", "bold");
        style.setAttribute("text-align", "center");

        //style for the control sums
        style = stylesheet.addStyle(".styleControlTitles");
        style.setAttribute("font-weight", "bold");
        style.setAttribute("margin", "5px");
        style.setAttribute("margin", "5px");

        //style for the  header
        style = stylesheet.addStyle(".header");
        style.setAttribute("text-align", "left");

        //style for the  footer
        style = stylesheet.addStyle(".footer");
        style.setAttribute("text-align", "left");

        //style for the Dupont's empty cells
        style = stylesheet.addStyle(".emptyCells");
        style.setAttribute("background-color", "#f2f2f2");
        style.setAttribute("padding-bottom", "5px");
        style.setAttribute("text-align", "center");

        //style for the Dupont's currente year value cells
        style = stylesheet.addStyle(".dupontCurryearValueCells");
        style.setAttribute("background-color", "#FEDBDA");
        style.setAttribute("text-align", "right");

        //style for the Dupont's year back values cells
        style = stylesheet.addStyle(".dupontYearbackValueCells");
        style.setAttribute("text-align", "right");
        style.setAttribute("background-color", "#DBFEDA");

        //style for the Dupont's texts
        style = stylesheet.addStyle(".styledupontTexts");
        style.setAttribute("text-align", "center");
        style.setAttribute("font-weight", "bold");

        //style for the pharagraphs
        style = stylesheet.addStyle(".styleParagraphs");
        style.setAttribute("text-align", "left");
        style.setAttribute("padding", "3px");
        style.setAttribute("font-weight", "italic");

        //style for the Z-score,low prob. of a financial crysis
        style = stylesheet.addStyle(".styleZLow");
        style.setAttribute("background-color", "#00ff00");
        style.setAttribute("text-align", "center");

        //style for the Z-score,mid prob. of a financial crysis
        style = stylesheet.addStyle(".styleZmid");
        style.setAttribute("background-color", "#ffff00");
        style.setAttribute("text-align", "center");

        //style for the Z-score,prob. of a financial crysis
        style = stylesheet.addStyle(".styleZprob");
        style.setAttribute("background-color", "#ff0000");
        style.setAttribute("text-align", "center");



        return stylesheet;
    }

    /**
     * @description It defines the structure of the parameters and gives them a default value.
     * for the representation and use of the necessary parameters, a *param={}* object has been created.
     * for a question of order for all groups and subgroups of the various layers of the object, has been created a function for every one of them.
     * @returns an object named param with all the parameters initialized with a default value
     */
    initParam() {
        var param = {};
        param.version = "1.0";
        param.bilancio = this.initParamBilancio();
        param.contoeconomico = this.initParamContoEconomico();
        param.ratios = this.initParamRatiosBenchmarks();
        param.finalresult = this.initParamFinalResult();
        param.maxpreviousyears = 2;
        param.numberofdecimals = 2;
        return param;
    }

    initParamBilancio() {
        var param = {};
        param.ac = this.initParamAttivoCircolante();
        param.af = this.initParamAttivoFisso();
        param.ct = this.initParamCapitaleTerzi();
        param.cp = this.initParamCapitaleProprio();

        return param;

    }

    initParamAttivoCircolante() {
        var param = {};
        param.liqu = {};
        param.liqu.gr = "100;106;109";
        param.liqu.description = qsTr("Liquidity");
        param.cred = {};
        param.cred.gr = "110;114";
        param.cred.description = qsTr("Credits");
        param.stoc = {};
        param.stoc.gr = "120;130";
        param.stoc.description = qsTr("Stocks");

        return param;
    }

    initParamAttivoFisso() {
        var param = {};
        param.fixa = {};
        param.fixa.gr = "14";
        param.fixa.description = qsTr("Fixed assets");


        return param;
    }

    initParamCapitaleTerzi() {
        var param = {};
        param.stdc = {};
        param.stdc.gr = "20";
        param.stdc.description = qsTr("Short-term debt capital");
        param.ltdc = {};
        param.ltdc.gr = "24";
        param.ltdc.description = qsTr("Long term debt capital");

        return param;
    }

    initParamCapitaleProprio() {
        var param = {};
        param.obca = {};
        param.obca.gr = "280;298";
        param.obca.description = qsTr("Own base capital");
        param.reut = {};
        param.reut.gr = "290;295;296;297";
        param.reut.description = qsTr("Reserves and profits");

        return param;
    }

    initParamContoEconomico() {
        var param = {};
        param.satu = {};
        param.satu.gr = "3";
        param.satu.description = qsTr("Sales turnover");
        param.cofm = {};
        param.cofm.gr = "4";
        param.cofm.description = qsTr("Cost of merchandise and services");
        param.cope = {};
        param.cope.gr = "5";
        param.cope.description = qsTr("Personnel costs");
        param.codi = {};
        param.codi.gr = "6";
        param.codi.description = qsTr("Different costs");
        param.amre = {};
        param.amre.gr = "68";
        param.amre.description = qsTr("Depreciations and adjustments");
        param.inte = {};
        param.inte.gr = "69";
        param.inte.description = qsTr("Interests");
        return param;
    }

    initParamFinalResult() {
        var param = {};
        param.fire = {};
        param.fire.gr = "E7";
        param.fire.description = qsTr("Final Result");
        return param;
    }




    /**
     * added the prefix prof because elements: .roe, .roi, .ros, .mol  already exists.
     */
    initParamRatiosBenchmarks() {
        var param = {};
        param.liquidityratios = this.initParamLiquidityBenchmarks();
        param.financingratios = this.initParamFinancingBenchmarks();
        param.profitabilityratios = this.initParamProfitabilityBenchmarks();

        return param;

    }
    initParamLiquidityBenchmarks() {
        var param = {};
        param.liqu1 = {};
        param.liqu1.description = qsTr("cash ratio");
        param.liqu1.value = "10%-35%";
        param.liqu2 = {};
        param.liqu2.description = qsTr("quick ratio");
        param.liqu2.value = "100%";
        param.liqu3 = {};
        param.liqu3.description = qsTr("current ratio");
        param.liqu3.value = "150%";
        param.netcurrass = {};
        param.netcurrass.description = qsTr("net current asset");
        param.netcurrass.value = qsTr("compare with the previous internal data");

        return param;
    }
    initParamFinancingBenchmarks() {
        var param = {};
        param.cirract = {};
        param.cirract.description = qsTr("degree of circulating active");
        param.cirract.value = qsTr("compare with the industry average data");
        param.fixass = {};
        param.fixass.description = qsTr("percentage fixed assets");
        param.fixass.value = qsTr("compare with the industry average data");
        param.lvldeb = {};
        param.lvldeb.description = qsTr("debt ratio");
        param.lvldeb.value = "40%-70%";
        param.lvlequ = {};
        param.lvlequ.description = qsTr("equity ratio");
        param.lvlequ.value = "30%-60%";
        param.lvlsel = {};
        param.lvlsel.description = qsTr("self financing ratio");
        param.lvlsel.value = qsTr("depends on the company");
        param.covfix = {};
        param.covfix.description = qsTr(" fixed asset coverage");
        param.covfix.value = ">100%";

        return param;
    }
    initParamProfitabilityBenchmarks() {
        var param = {};
        param.profroe = {};
        param.profroe.description = "roe";
        param.profroe.value = "8%-14%";
        param.profroi = {};
        param.profroi.description = "roi";
        param.profroi.value = "10%";
        param.profros = {};
        param.profros.description = "ros";
        param.profros.value = ">0";
        param.profmol = {};
        param.profmol.description = "mol";
        param.profmol.value = qsTr("compare with the industry average data");
        return param;
    }

    /**
         * @description - assigns the maximum number of previous years to a varaible, if it is less than 5, is reset to 5
         * - calls up the loadDataBudget and the loadDataYear methods by passing the current document to them.
         * - Using the values returned by the loadDataBudget and loadDataYear, the methods for calculating the index, intermediate values, dupont scheme and Altman's index are called up.
         * - Each value returned by the calculation methods is assigned to an object which is then inserted in the "date"[] array.
         * unlike the loadDataBudget the loadDataYear is called up for each prevous year of the document.

    Translated with www.DeepL.com/Translator (free version)
         */
    loadData() {
            this.data = [];
            var yeardocument = this.banDocument;
            var i = 0;
            var maxpreviousyear = this.param.maxpreviousyears;
            if (maxpreviousyear > 5)
                maxpreviousyear = 5;

            // solo se c'è la tabella Budget, eventualmente aggiungere un parametro così può decidere l'utente
            var withBudget = yeardocument.info("Budget", "TableNameXml");
            if (withBudget) {
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

            while (yeardocument && i <= maxpreviousyear) {
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
         * @param {Banana Document} _banDocument: the current document.
         */
    loadDataBudget(_banDocument) {
        if (!this.banDocument || !_banDocument) {
            return;
        }

        // parte sempre dai parametri del file principale
        var param = JSON.stringify(this.param);
        param = JSON.parse(param);

        var groupList = this.loadGroups();
        var budgetBalances = true;
        for (var key in param) {
            this.loadDataParam(param[key], groupList, budgetBalances, _banDocument);
        }
        param.isBudget = true;
        param.period = {};
        param.period.StartDate = qsTr("BUDGET");
        param.period.EndDate = qsTr("BUDGET");
        //param.period.StartDate = _banDocument.info("AccountingDataBase", "OpeningDate");
        //param.period.EndDate = _banDocument.info("AccountingDataBase", "ClosureDate");
        return param;
    }

    /**
     * @description This method handles the loading of data from the record table
     *- Check if the document exists
     *- It starts from the parameters of the main file and assigns them to a variable
     *- calls the loadgroups() method and assigns its return to another object.
     *- For each parameter, call the loadDaraParam() method.
     *- Adds a new index to the param{} object containing the file's opening and closing date.
     *- set the start date and the end date with the current file dates, these information is going to be used on the company info's table.
     *- Returns the processed parameters
     * @param {Banana Document} _banDocument: the current document.
     */
    loadDataYear(_banDocument) {
        if (!this.banDocument || !_banDocument) {
            return;
        }

        // parte sempre dai parametri del file principale
        var param = JSON.stringify(this.param);
        param = JSON.parse(param);

        var groupList = this.loadGroups();
        var budgetBalances = false;
        for (var key in param) {
            this.loadDataParam(param[key], groupList, budgetBalances, _banDocument);
        }
        param.isBudget = false;
        param.period = {};
        param.period.StartDate = _banDocument.info("AccountingDataBase", "OpeningDate");
        param.period.EndDate = _banDocument.info("AccountingDataBase", "ClosureDate");
        return param;
    }

    /**
     * @description cycles the parameters it receives, checking that they exist, and that the index that defines the group exists.
     * checks whether the elements in the index *gr* are accounts or groups.
     * formats the groups it finds so that it can use the *currentBalance()/budgetBalance() calculation functions.
     * assigns the amount of groups and accounts to param.balance.
     * @param {object} param:  an object containing the parameters recovered from the dialog setting
     * @param {object} groupList: the list of groups founded in the current document
     * @param {Banana Document} _banDocument: the current document
     */
    loadDataParam(param, groupList, budgetBalances, _banDocument) {

        for (var key in param) {
            if (param[key] && param[key].gr) {
                var value = param[key].gr.toString();
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
                }
                if (bal) {
                    param[key].balance = bal.amount;
                    if (param[key].balance === "") {
                        param[key].balance = "0.00";
                    }

                }
            } else {
                if (typeof(param[key]) === "object")
                    this.loadDataParam(param[key], groupList, budgetBalances, _banDocument);
            }
        }
    }

    /**
     * @description This method is used for the calculation of total or reclassification elements, more precisely:
     * Instantiate a *CalculatedData= {}* object that will contain all the calculated data.
     * Calculate the various elements.
     * @param {object} data: the data object created thanks to loadData methods, containing the values and the sums of the paramters recovered from the dialog
     * @param {date} startDate: the startDate of the document, wich is located in the File Info.
     * @param {date} EndDate: the EndDate of the document, wich is located in the File Info.
     * @returns an object containing the calculated values
     */
    calculateData(data, _banDocument) {
            if (!data || !_banDocument) {
                return null;
            }
            var Calcdata = {};


            /*calculation of total active (with the total of current asset and fixed assets), and checking that they coincide*/
            Calcdata.TotActive = {};

            var Liqu = data.bilancio.ac.liqu.balance;
            var Credits = data.bilancio.ac.cred.balance;
            var Stocks = data.bilancio.ac.stoc.balance;
            var Fixa = data.bilancio.af.fixa.balance;
            var Tota1 = Banana.SDecimal.add(Liqu, Credits);
            var Tota2 = Banana.SDecimal.add(Tota1, Stocks);
            Calcdata.CurrentAsset = Tota2;
            Calcdata.FixedAsset = Fixa;
            var Totactive = Banana.SDecimal.add(Tota2, Fixa);
            Calcdata.TotActive = Totactive;

            /*calculate the total active resulting from the accounting sheet and then use it for controls*/

            Calcdata.TotActiveSheet = {}
            var TotActiveSheet = _banDocument.currentBalance('BClass=1', "", "", null);
            var TotActiveSheetBalance = TotActiveSheet.amount;
            Calcdata.TotActiveSheet = TotActiveSheetBalance;


            Calcdata.ActiveDifference = {};
            var ActDifference = Banana.SDecimal.subtract(Totactive, TotActiveSheetBalance);
            Calcdata.ActiveDifference = ActDifference



            /*calculation of total passive (with the total of debt capital and the own capital*/
            Calcdata.TotPassive = {};

            var Stdc = data.bilancio.ct.stdc.balance;
            var Ltdc = data.bilancio.ct.ltdc.balance;
            var Obca = data.bilancio.cp.obca.balance;
            var Reut = data.bilancio.cp.reut.balance;
            var Totp1 = Banana.SDecimal.add(Ltdc, Stdc);
            Calcdata.DebtCapital = Totp1;
            var Totp2 = Banana.SDecimal.add(Totp1, Obca);
            Calcdata.OwnCapital = Banana.SDecimal.add(Obca, Reut);
            var TotPassive = Banana.SDecimal.add(Totp2, Reut);
            Calcdata.TotPassive = TotPassive;

            /*calculation of the total passive resulting from the accounting sheet*/

            Calcdata.TotPassiveSheet = {}
                //da rivedere

            var TotPassiveSheet = _banDocument.currentBalance('BClass=2', "", "", null);
            var TotPassiveSheetBalance = TotPassiveSheet.amount;
            Calcdata.TotPassiveSheet = TotPassiveSheetBalance;

            //calculate the difference

            Calcdata.PassiveDifference = {};
            var PassDifference = Banana.SDecimal.subtract(TotPassive, TotPassiveSheetBalance);
            Calcdata.PassiveDifference = PassDifference

            /*calculation of the annual result (profit)*/

            Calcdata.TotAnnual = {};
            Calcdata.TotCosts = {};
            Calcdata.TotSales = {};


            var Sales = data.contoeconomico.satu.balance;
            //for the dupont
            Calcdata.TotSales = Sales;

            var Cofm = data.contoeconomico.cofm.balance;
            var Cope = data.contoeconomico.cope.balance;
            var Codi = data.contoeconomico.codi.balance;
            var Amre = data.contoeconomico.amre.balance;
            var Inte = data.contoeconomico.inte.balance;

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

            var TotRicavi = _banDocument.currentBalance('BClass=4', '', '', null);
            var TotCosti = _banDocument.currentBalance('BClass=3', '', '', null);
            // Banana.console.debug(data.contoeconomico.fire.balance);
            var RisAnnual = Banana.SDecimal.subtract(TotRicavi.amount, TotCosti.amount);
            Calcdata.TotAnnualSheet = RisAnnual;

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
         * @description Instantiate an *index= {}* object that will contain all the calculated ratios.
         * retrieve the values of the calculated parameters and data.
         * divide the indexes by type thanks to the properties of the objects.
         * assign a value to each index property. (description, benchmark...).
         * calculate the ratios.
         * the values of the benchmarks are set taking the parameters from the dialog
         * @param {object} data: the data object created thanks to loadData methods, containing the values and the sums of the paramters recovered from the dialog.
         * @param {object} CalculatedData: the object returned by the CalculateData method containing the values of the calculated elements.
         * @returns an object containing the calulated ratios.
         */
    calculateIndex(data, CalculatedData) {
        var index = {};
        /*
        the numbers in the variables are present to allow each block of index type to have elements with distinct names
        to differentiate the calculation variables, while the others, once given the value, can be re-used in the
        other blocks .
        e.g.: block of liquidity we have for the first block 1, second block 2 and third block 3, for that of financing equal
        both the various blocks are contradicted by the prefixes
        LIQUIDITY
        prefix variables of liquidity 'l'
        dofl = degree of liquidity
        1/one = reference to index 1
        2/two = reference to index 2
        3/three = reference to index 3
        */

        index.liqu = {};

        index.liqu.doflone = {};
        index.liqu.doflone.description = qsTr("cash ratio");
        index.liqu.doflone.formula = "liqu / stdc";
        var liqu = data.bilancio.ac.liqu.balance;
        var stdc = data.bilancio.ct.stdc.balance;
        var lcalc1 = Banana.SDecimal.multiply(liqu, 100);
        var lcalc2 = Banana.SDecimal.divide(lcalc1, stdc, { 'decimals': this.param.numberofdecimals })
        var lris = lcalc2.toString();
        index.liqu.doflone.amount = lris;
        index.liqu.doflone.benchmark = data.ratios.liquidityratios.liqu1.value;

        //degree of liquidity 2
        index.liqu.dofltwo = {};
        index.liqu.dofltwo.description = qsTr("quick ratio");
        index.liqu.dofltwo.formula = "(liqu + cred) / stdc";
        var cred = data.bilancio.ac.cred.balance;
        var lcalc3 = Banana.SDecimal.add(liqu, cred);
        var lcalc4 = Banana.SDecimal.divide(lcalc3, stdc, { 'decimals': this.param.numberofdecimals });
        var lris2 = lcalc4.toString();
        index.liqu.dofltwo.amount = lris2;
        index.liqu.dofltwo.benchmark = data.ratios.liquidityratios.liqu2.value;

        //degree of liquidity 3
        index.liqu.doflthree = {};
        index.liqu.doflthree.description = qsTr("current ratio");
        index.liqu.doflthree.formula = "cuas / stdc";
        var cuasone = Banana.SDecimal.add((data.bilancio.ac.liqu.balance), (data.bilancio.ac.cred.balance));
        var cuastwo = Banana.SDecimal.add(cuasone, (data.bilancio.ac.stoc.balance));
        var lcalc5 = Banana.SDecimal.multiply(cuastwo, 100);
        var lcalc6 = Banana.SDecimal.divide(lcalc5, stdc, { 'decimals': this.param.numberofdecimals });
        var lris3 = lcalc6.toString();
        index.liqu.doflthree.amount = lris3;
        index.liqu.doflthree.benchmark = data.ratios.liquidityratios.liqu3.value;

        // net current assets
        index.liqu.netcuas = {};
        index.liqu.netcuas.description = qsTr("net current asset");
        index.liqu.netcuas.formula = "cuas-stdc";
        var lcalc7 = Banana.SDecimal.subtract(cuastwo, stdc, { 'decimals': this.param.numberofdecimals });
        var lris4 = lcalc7.toString();
        index.liqu.netcuas.amount = lris4;
        index.liqu.netcuas.benchmark = data.ratios.liquidityratios.netcurrass.value;


        /*FINANCING INDICATORS
        financing variables prefix 'f'
            
        level of debt
        gdin= grado di indebitamento
        gfcp= grado finanziamento cap.proprio
        gdau= grado di autofinanziamento
        */
        index.fin = {};

        //degree of circulating assets
        index.fin.grcuas = {};
        index.fin.grcuas.description = qsTr("degree of circulating active ");
        index.fin.grcuas.formula = "cuas / tota";
        var totatt = CalculatedData.TotActive;
        var fcalc = Banana.SDecimal.divide(cuastwo, totatt);
        var fcalc = Banana.SDecimal.multiply(fcalc, 100, { 'decimals': this.param.numberofdecimals });
        var fris = fcalc.toString();
        index.fin.grcuas.amount = fris;
        index.fin.grcuas.benchmark = data.ratios.financingratios.cirract.value;

        //degree of fixed assets
        index.fin.grfixa = {};
        index.fin.grfixa.description = qsTr("percentage fixed assets");
        index.fin.grfixa.formula = "fixa / tota";
        var fixa = data.bilancio.af.fixa.balance;
        var fcalc1 = Banana.SDecimal.divide(fixa, totatt);
        var fcalc1 = Banana.SDecimal.multiply(fcalc1, 100, { 'decimals': this.param.numberofdecimals });
        var fris1 = fcalc1.toString();
        index.fin.grfixa.amount = fris1;
        index.fin.grfixa.benchmark = data.ratios.financingratios.fixass.value;



        //Level of debt
        index.fin.gdin = {};
        index.fin.gdin.description = qsTr("debt ratio");
        index.fin.gdin.formula = "stdc+ltdc / totp";
        var deca = Banana.SDecimal.add((data.bilancio.ct.ltdc.balance), (data.bilancio.ct.stdc.balance));
        var tocaone = Banana.SDecimal.add(data.bilancio.cp.obca.balance, data.bilancio.cp.reut.balance);
        var tocatwo = Banana.SDecimal.add(data.bilancio.ct.ltdc.balance, data.bilancio.ct.stdc.balance);
        var toca = Banana.SDecimal.add(tocaone, tocatwo)
        var fcalc2 = Banana.SDecimal.multiply(deca, 100);
        var fcalc3 = Banana.SDecimal.divide(fcalc2, toca, { 'decimals': this.param.numberofdecimals });
        var fris2 = fcalc3.toString();
        index.fin.gdin.amount = fris2;
        index.fin.gdin.benchmark = data.ratios.financingratios.lvldeb.value;


        //Level of equity finance
        index.fin.gfcp = {};
        index.fin.gfcp.description = qsTr("equity ratio");
        index.fin.gfcp.formula = "owca / totp";
        var owca = Banana.SDecimal.add((data.bilancio.cp.obca.balance), (data.bilancio.cp.reut.balance));
        var fcalc4 = Banana.SDecimal.multiply(owca, 100);
        var fcalc5 = Banana.SDecimal.divide(fcalc4, toca, { 'decimals': this.param.numberofdecimals });
        var fris3 = fcalc5.toString();
        index.fin.gfcp.amount = fris3;
        index.fin.gfcp.benchmark = data.ratios.financingratios.lvlequ.value;

        //Level of self-financing
        index.fin.gdau = {};
        index.fin.gdau.description = qsTr("self-financing ratio");
        index.fin.gdau.formula = "reut / owca";
        var reut = data.bilancio.cp.reut.balance;
        var fcalc6 = Banana.SDecimal.multiply(reut, 100);
        var fcalc7 = Banana.SDecimal.divide(fcalc6, owca, { 'decimals': this.param.numberofdecimals });
        var fris4 = fcalc7.toString();
        index.fin.gdau.amount = fris4;
        index.fin.gdau.benchmark = data.ratios.financingratios.lvlsel.value;

        //degree of coverage of fixed assets
        index.fin.fixaco = {};
        index.fin.fixaco.description = qsTr("fixed assets coverage");
        index.fin.fixaco.formula = "( owca + ltdc ) / tota";
        var ltdc = data.bilancio.ct.ltdc.balance;
        var fcalc8 = Banana.SDecimal.add(owca, ltdc);
        var fcalc9 = Banana.SDecimal.divide(fcalc8, totatt);
        var fcalc9 = Banana.SDecimal.multiply(fcalc9, 100, { 'decimals': this.param.numberofdecimals });
        var fris5 = fcalc9.toString();
        index.fin.fixaco.amount = fris5;
        index.fin.fixaco.benchmark = data.ratios.financingratios.covfix.value;


        /*PROFITABILITY INDICATORS
        financing variables prefix 'r'
        roe= Return of equity
        roi= Return of investiment
        ros= Return of sales
         */



        index.red = {};



        //ROE il profitto sarà da calcolare
        index.red.roe = {};
        index.red.roe.description = "ROE";
        index.red.roe.formula = "profit / own capital";
        var rcalc1 = Banana.SDecimal.multiply(CalculatedData.TotAnnual, 100);
        var rcalc2 = Banana.SDecimal.divide(rcalc1, owca, { 'decimals': this.param.numberofdecimals });
        var rris = rcalc2.toString();
        index.red.roe.amount = rris;
        index.red.roe.benchmark = data.ratios.profitabilityratios.profroe.value;


        //ROI il profitto sara da calcolare
        // il totale degli impieghi (employment) corrisponde al totale degli attivi
        index.red.roi = {};
        index.red.roi.description = "ROI";
        index.red.roi.formula = "EBIT / total employment  ";
        var rcalc3 = Banana.SDecimal.divide(CalculatedData.Ebit, totatt);
        var rcalc4 = Banana.SDecimal.multiply(rcalc3, 100, { 'decimals': this.param.numberofdecimals });
        var rris2 = rcalc4.toString();
        index.red.roi.amount = rris2;
        index.red.roi.benchmark = data.ratios.profitabilityratios.profroi.value;

        //ROS-->trova EBIT
        index.red.ros = {};
        index.red.ros.description = "ROS";
        index.red.ros.formula = "ebit / satu";
        var satu = data.contoeconomico.satu.balance;
        var rcalc5 = Banana.SDecimal.multiply(CalculatedData.Ebit, 100);
        var rcalc6 = Banana.SDecimal.divide(rcalc5, satu, { 'decimals': this.param.numberofdecimals });
        var rris3 = rcalc6.toString();
        index.red.ros.amount = rris3;
        index.red.ros.benchmark = data.ratios.profitabilityratios.profros.value;

        // MOL
        index.red.mol = {};
        index.red.mol.description = "MOL";
        index.red.mol.formula = "gross profit / sales turnover";
        var ebitda = CalculatedData.EbitDa;
        var rcalc7 = Banana.SDecimal.multiply(ebitda, 100);
        var rcalc8 = Banana.SDecimal.divide(rcalc7, satu, { 'decimals': this.param.numberofdecimals });
        var rris4 = rcalc8.toString();
        index.red.mol.amount = rris4;
        index.red.mol.benchmark = data.ratios.profitabilityratios.profmol.value;

        return index;

    }

    /**
     * @description It takes care of adapting the structure of the parameters for the dialogue. Defines the structure that will be set in the syskey table. By default, I assign the values defined in *initParam()* to the various elements.
       I also define the structure of the grouping of parameters, and under each of them is assigned to a group, so as to allow a clearer and cleaner display of the structure.
       Each parameter defined (along with its properties) is placed in an array.
     * @param {object} param:  an object containing the parameters recovered from the dialog setting
     * @returns an object containing an array and the version.
     */
    convertParam() {
        var lang = this.getLang();
        var defaultParam = this.initParam();
        var param = this.param;
        var convertedParam = {};
        convertedParam.version = '1.0';
        /*array dei parametri dello script*/
        convertedParam.data = [];

        //I create the balance sheet grouping
        var currentParam = {};
        currentParam.name = 'Balance';
        currentParam.title = 'Balance';
        currentParam.editable = false;

        convertedParam.data.push(currentParam);

        //Active subgroup
        var currentParam = {};
        currentParam.name = 'Active';
        currentParam.title = 'Active';
        currentParam.editable = false;
        currentParam.parentObject = 'Balance';

        convertedParam.data.push(currentParam);

        // subgroup Liabilities and Equity
        var currentParam = {};
        currentParam.name = 'Liabilities and Equity';
        currentParam.title = 'Liabilities and Equity';
        currentParam.editable = false;
        currentParam.parentObject = 'Balance';

        convertedParam.data.push(currentParam);


        // Profit and Loss grouping
        var currentParam = {};
        currentParam.name = 'Profit and Loss';
        currentParam.title = 'Profit and Loss';
        currentParam.editable = false;

        convertedParam.data.push(currentParam);

        // subgroup Revenues
        var currentParam = {};
        currentParam.name = 'Revenues';
        currentParam.title = 'Revenues';
        currentParam.editable = false;
        currentParam.parentObject = 'Profit and Loss';

        convertedParam.data.push(currentParam);

        // sub-grouping of costs
        var currentParam = {};
        currentParam.name = 'Costs';
        currentParam.title = 'Costs';
        currentParam.editable = false;
        currentParam.parentObject = 'Profit and Loss';

        convertedParam.data.push(currentParam);

        //subgroup Results
        var currentParam = {};
        currentParam.name = 'Results';
        currentParam.title = 'Results';
        currentParam.editable = false;
        currentParam.parentObject = 'Profit and Loss';

        convertedParam.data.push(currentParam);

        //subgroup Final Result
        var currentParam = {};
        currentParam.name = 'Final Result';
        currentParam.title = 'Final Result';
        currentParam.editable = false;
        currentParam.parentObject = 'Results';

        convertedParam.data.push(currentParam);

        //I create group of preferences
        var currentParam = {};
        currentParam.name = 'Preferences';
        currentParam.title = 'Preferences';
        currentParam.editable = false;

        convertedParam.data.push(currentParam);

        // create an another group, Texts
        var currentParam = {};
        currentParam.name = 'Texts';
        currentParam.title = 'Texts';
        currentParam.editable = false;
        currentParam.parentObject = false;
        convertedParam.data.push(currentParam);

        //we put inside the Texts section, the customizable banchmarks
        var currentParam = {};
        currentParam.name = 'Benchmarks texts';
        currentParam.title = 'Benchmarks texts';
        currentParam.editable = false;
        currentParam.parentObject = 'Texts';
        convertedParam.data.push(currentParam);

        /**
         * under the benchmarks group, we separate the ratios by type: liquidity, financing and profitability.
         */

        // liquidity ratios
        var currentParam = {};
        currentParam.name = 'liquidity';
        currentParam.title = 'liquidity';
        currentParam.editable = false;
        currentParam.parentObject = 'Benchmarks texts';
        convertedParam.data.push(currentParam);

        // financing ratios
        var currentParam = {};
        currentParam.name = 'financing';
        currentParam.title = 'financing';
        currentParam.editable = false;
        currentParam.parentObject = 'Benchmarks texts';
        convertedParam.data.push(currentParam);

        // profitability ratios
        var currentParam = {};
        currentParam.name = 'profitability';
        currentParam.title = 'profitability';
        currentParam.editable = false;
        currentParam.parentObject = 'Benchmarks texts';
        convertedParam.data.push(currentParam);


        var currentParam = {};
        currentParam.name = 'liqu';
        currentParam.title = param.bilancio.ac.liqu.description ? param.bilancio.ac.liqu.description : defaultParam.bilancio.ac.liqu.description;
        currentParam.type = 'string';
        currentParam.value = param.bilancio.ac.liqu.gr ? param.bilancio.ac.liqu.gr : '';
        currentParam.defaultvalue = defaultParam.bilancio.ac.liqu.gr;
        //I assign it to a group
        currentParam.parentObject = 'Active';
        currentParam.readValue = function() {
            param.bilancio.ac.liqu.gr = this.value;
        }

        convertedParam.data.push(currentParam);

        var currentParam = {};
        currentParam.name = 'cred';
        currentParam.title = param.bilancio.ac.cred.description ? param.bilancio.ac.cred.description : defaultParam.bilancio.ac.cred.description;
        currentParam.type = 'string';
        currentParam.value = param.bilancio.ac.cred.gr ? param.bilancio.ac.cred.gr : '';
        currentParam.defaultvalue = defaultParam.bilancio.ac.cred.gr;
        currentParam.parentObject = 'Active';
        currentParam.readValue = function() {
            param.bilancio.ac.cred.gr = this.value;
        }
        convertedParam.data.push(currentParam);

        var currentParam = {};
        currentParam.name = 'stoc';
        currentParam.title = param.bilancio.ac.stoc.description ? param.bilancio.ac.stoc.description : defaultParam.bilancio.ac.stoc.description;
        currentParam.type = 'string';
        currentParam.value = param.bilancio.ac.stoc.gr ? param.bilancio.ac.stoc.gr : '';
        currentParam.defaultvalue = defaultParam.bilancio.ac.stoc.gr;
        currentParam.parentObject = 'Active';
        currentParam.readValue = function() {
            param.bilancio.ac.stoc.gr = this.value;
        }
        convertedParam.data.push(currentParam);

        var currentParam = {};
        currentParam.name = 'fixa';
        currentParam.title = param.bilancio.af.fixa.description ? param.bilancio.af.fixa.description : defaultParam.bilancio.af.fixa.description;
        currentParam.type = 'string';
        currentParam.value = param.bilancio.af.fixa.gr ? param.bilancio.af.fixa.gr : '';
        currentParam.defaultvalue = defaultParam.bilancio.af.fixa.gr;
        currentParam.parentObject = 'Active';
        currentParam.readValue = function() {
            param.bilancio.af.fixa.gr = this.value;
        }
        convertedParam.data.push(currentParam);

        var currentParam = {};
        currentParam.name = 'stdc';
        currentParam.title = param.bilancio.ct.stdc.description ? param.bilancio.ct.stdc.description : defaultParam.bilancio.ct.stdc.description;
        currentParam.type = 'string';
        currentParam.value = param.bilancio.ct.stdc.gr ? param.bilancio.ct.stdc.gr : '';
        currentParam.defaultvalue = defaultParam.bilancio.ct.stdc.gr;
        currentParam.parentObject = 'Liabilities and Equity';
        currentParam.readValue = function() {
            param.bilancio.ct.stdc.gr = this.value;
        }
        convertedParam.data.push(currentParam);

        var currentParam = {};
        currentParam.name = 'ltdc';
        currentParam.title = param.bilancio.ct.ltdc.description ? param.bilancio.ct.ltdc.description : defaultParam.bilancio.ct.ltdc.description;
        currentParam.type = 'string';
        currentParam.value = param.bilancio.ct.ltdc.gr ? param.bilancio.ct.ltdc.gr : '';
        currentParam.defaultvalue = defaultParam.bilancio.ct.ltdc.gr;
        currentParam.parentObject = 'Liabilities and Equity';
        currentParam.readValue = function() {
            param.bilancio.ct.ltdc.gr = this.value;
        }
        convertedParam.data.push(currentParam);

        var currentParam = {};
        currentParam.name = 'obca';
        currentParam.title = param.bilancio.cp.obca.description ? param.bilancio.cp.obca.description : defaultParam.bilancio.cp.obca.description;
        currentParam.type = 'string';
        currentParam.value = param.bilancio.cp.obca.gr ? param.bilancio.cp.obca.gr : '';
        currentParam.defaultvalue = defaultParam.bilancio.cp.obca.gr;
        currentParam.parentObject = 'Liabilities and Equity';
        currentParam.readValue = function() {
            param.bilancio.cp.obca.gr = this.value;
        }
        convertedParam.data.push(currentParam);

        var currentParam = {};
        currentParam.name = 'reut';
        currentParam.title = param.bilancio.cp.reut.description ? param.bilancio.cp.reut.description : defaultParam.bilancio.cp.reut.description;
        currentParam.type = 'string';
        currentParam.value = param.bilancio.cp.reut.gr ? param.bilancio.cp.reut.gr : '';
        currentParam.defaultvalue = defaultParam.bilancio.cp.reut.gr;
        currentParam.parentObject = 'Liabilities and Equity';
        currentParam.readValue = function() {
            param.bilancio.cp.reut.gr = this.value;
        }
        convertedParam.data.push(currentParam);

        var currentParam = {};
        currentParam.name = 'satu';
        currentParam.title = param.contoeconomico.satu.description ? param.contoeconomico.satu.description : defaultParam.contoeconomico.satu.description;
        currentParam.type = 'string';
        currentParam.value = param.contoeconomico.satu.gr ? param.contoeconomico.satu.gr : '';
        currentParam.defaultvalue = defaultParam.contoeconomico.satu.gr;
        currentParam.parentObject = 'Revenues';
        currentParam.readValue = function() {
            param.contoeconomico.satu.gr = this.value;
        }
        convertedParam.data.push(currentParam);

        var currentParam = {};
        currentParam.name = 'cofm';
        currentParam.title = param.contoeconomico.cofm.description ? param.contoeconomico.cofm.description : defaultParam.contoeconomico.cofm.description;
        currentParam.type = 'string';
        currentParam.value = param.contoeconomico.cofm.gr ? param.contoeconomico.cofm.gr : '';
        currentParam.defaultvalue = defaultParam.contoeconomico.cofm.gr;
        currentParam.parentObject = 'Costs';
        currentParam.readValue = function() {
            param.contoeconomico.cofm.gr = this.value;
        }
        convertedParam.data.push(currentParam);

        var currentParam = {};
        currentParam.name = 'cope';
        currentParam.title = param.contoeconomico.cope.description ? param.contoeconomico.cope.description : defaultParam.contoeconomico.cope.description;
        currentParam.type = 'string';
        currentParam.value = param.contoeconomico.cope.gr ? param.contoeconomico.cope.gr : '';
        currentParam.defaultvalue = defaultParam.contoeconomico.cope.gr;
        currentParam.parentObject = 'Costs';
        currentParam.readValue = function() {
            param.contoeconomico.cope.gr = this.value;
        }
        convertedParam.data.push(currentParam);

        var currentParam = {};
        currentParam.name = 'codi';
        currentParam.title = param.contoeconomico.codi.description ? param.contoeconomico.codi.description : defaultParam.contoeconomico.codi.description;
        currentParam.type = 'string';
        currentParam.value = param.contoeconomico.codi.gr ? param.contoeconomico.codi.gr : '';
        currentParam.defaultvalue = defaultParam.contoeconomico.codi.gr;
        currentParam.parentObject = 'Costs';
        currentParam.readValue = function() {
            param.contoeconomico.codi.gr = this.value;
        }
        convertedParam.data.push(currentParam);

        var currentParam = {};
        currentParam.name = 'inte';
        currentParam.title = param.contoeconomico.inte.description ? param.contoeconomico.inte.description : defaultParam.contoeconomico.inte.description;
        currentParam.type = 'string';
        currentParam.value = param.contoeconomico.inte.gr ? param.contoeconomico.inte.gr : '';
        currentParam.defaultvalue = defaultParam.contoeconomico.inte.gr;
        currentParam.parentObject = 'Costs';
        currentParam.readValue = function() {
            param.contoeconomico.inte.gr = this.value;
        }
        convertedParam.data.push(currentParam);

        var currentParam = {};
        currentParam.name = 'amre';
        currentParam.title = param.contoeconomico.amre.description ? param.contoeconomico.amre.description : defaultParam.contoeconomico.amre.description;
        currentParam.type = 'string';
        currentParam.value = param.contoeconomico.amre.gr ? param.contoeconomico.amre.gr : '';
        currentParam.defaultvalue = defaultParam.contoeconomico.amre.gr;
        currentParam.parentObject = 'Costs';
        currentParam.readValue = function() {
            param.contoeconomico.amre.gr = this.value;
        }
        convertedParam.data.push(currentParam);

        var currentParam = {};
        currentParam.name = 'fire';
        currentParam.title = param.finalresult.fire.description ? param.finalresult.fire.description : defaultParam.finalresult.fire.description;
        currentParam.type = 'string';
        currentParam.value = param.finalresult.fire.gr ? param.finalresult.fire.gr : '';
        currentParam.defaultvalue = defaultParam.finalresult.fire.gr;
        currentParam.parentObject = 'Final Result';
        currentParam.readValue = function() {
            param.finalresult.fire.gr = this.value;
        }
        convertedParam.data.push(currentParam);

        //Previous years
        var currentParam = {};
        currentParam.name = 'maxpreviousyears';
        currentParam.title = 'Number of previous years';
        currentParam.type = 'string';
        currentParam.value = param.maxpreviousyears ? param.maxpreviousyears : '2';
        currentParam.defaultvalue = defaultParam.maxpreviousyears;
        currentParam.parentObject = 'Preferences';
        currentParam.readValue = function() {
            param.maxpreviousyears = this.value;
        }

        convertedParam.data.push(currentParam);

        //Number of decimals
        var currentParam = {};
        currentParam.name = 'numberofdecimals';
        currentParam.title = 'Number of decimals';
        currentParam.type = 'string';
        currentParam.value = param.numberofdecimals ? param.numberofdecimals : '2';
        currentParam.defaultvalue = defaultParam.numberofdecimals;
        currentParam.parentObject = 'Preferences';
        currentParam.readValue = function() {
            param.numberofdecimals = this.value;
        }

        convertedParam.data.push(currentParam);

        //ratios benchmarks
        // liquidity 1 benchmark
        var currentParam = {};
        currentParam.name = 'liq1benchmark';
        currentParam.title = param.ratios.liquidityratios.liqu1.description ? param.ratios.liquidityratios.liqu1.description : defaultParam.ratios.liquidityratios.liqu1.description;
        currentParam.type = 'string';
        currentParam.value = param.ratios.liquidityratios.liqu1.value ? param.ratios.liquidityratios.liqu1.value : '';
        currentParam.defaultvalue = defaultParam.ratios.liquidityratios.liqu1.value;
        currentParam.parentObject = 'liquidity';
        currentParam.readValue = function() {
            param.ratios.liquidityratios.liqu1.value = this.value;
        }
        convertedParam.data.push(currentParam);

        // liquidity 2 benchmark
        var currentParam = {};
        currentParam.name = 'liq2benchmark';
        currentParam.title = param.ratios.liquidityratios.liqu2.description ? param.ratios.liquidityratios.liqu2.description : defaultParam.ratios.liquidityratios.liqu2.description;
        currentParam.type = 'string';
        currentParam.value = param.ratios.liquidityratios.liqu2.value ? param.ratios.liquidityratios.liqu2.value : '';
        currentParam.defaultvalue = defaultParam.ratios.liquidityratios.liqu2.value;
        currentParam.parentObject = 'liquidity';
        currentParam.readValue = function() {
            param.ratios.liquidityratios.liqu2.value = this.value;
        }
        convertedParam.data.push(currentParam);

        // liquidity 3 benchmark
        var currentParam = {};
        currentParam.name = 'liq3benchmark';
        currentParam.title = param.ratios.liquidityratios.liqu3.description ? param.ratios.liquidityratios.liqu3.description : defaultParam.ratios.liquidityratios.liqu3.description;
        currentParam.type = 'string';
        currentParam.value = param.ratios.liquidityratios.liqu3.value ? param.ratios.liquidityratios.liqu3.value : '';
        currentParam.defaultvalue = defaultParam.ratios.liquidityratios.liqu3.value;
        currentParam.parentObject = 'liquidity';
        currentParam.readValue = function() {
            param.ratios.liquidityratios.liqu3.value = this.value;
        }
        convertedParam.data.push(currentParam);

        // net current asset benchmark
        var currentParam = {};
        currentParam.name = 'netcurrassbenchmark';
        currentParam.title = param.ratios.liquidityratios.netcurrass.description ? param.ratios.liquidityratios.netcurrass.description : defaultParam.ratios.liquidityratios.netcurrass.description;
        currentParam.type = 'string';
        currentParam.value = param.ratios.liquidityratios.netcurrass.value ? param.ratios.liquidityratios.netcurrass.value : '';
        currentParam.defaultvalue = defaultParam.ratios.liquidityratios.netcurrass.value;
        currentParam.parentObject = 'liquidity';
        currentParam.readValue = function() {
            param.ratios.liquidityratios.netcurrass.value = this.value;
        }
        convertedParam.data.push(currentParam);

        // degree of circulating active benchmark
        var currentParam = {};
        currentParam.name = 'cirractbenchmark';
        currentParam.title = param.ratios.financingratios.cirract.description ? param.ratios.financingratios.cirract.description : defaultParam.ratios.financingratios.cirract.description;
        currentParam.type = 'string';
        currentParam.value = param.ratios.financingratios.cirract.value ? param.ratios.financingratios.cirract.value : '';
        currentParam.defaultvalue = defaultParam.ratios.financingratios.cirract.value;
        currentParam.parentObject = 'financing';
        currentParam.readValue = function() {
            param.ratios.financingratios.cirract.value = this.value;
        }
        convertedParam.data.push(currentParam);

        // degree of fixed asset benchmark
        var currentParam = {};
        currentParam.name = 'fixassbenchmark';
        currentParam.title = param.ratios.financingratios.fixass.description ? param.ratios.financingratios.fixass.description : defaultParam.ratios.financingratios.fixass.description;
        currentParam.type = 'string';
        currentParam.value = param.ratios.financingratios.fixass.value ? param.ratios.financingratios.fixass.value : '';
        currentParam.defaultvalue = defaultParam.ratios.financingratios.fixass.value;
        currentParam.parentObject = 'financing';
        currentParam.readValue = function() {
            param.ratios.financingratios.fixass.value = this.value;
        }
        convertedParam.data.push(currentParam);

        // level of debt benchmark
        var currentParam = {};
        currentParam.name = 'lvldebbenchmark';
        currentParam.title = param.ratios.financingratios.lvldeb.description ? param.ratios.financingratios.lvldeb.description : defaultParam.ratios.financingratios.lvldeb.description;
        currentParam.type = 'string';
        currentParam.value = param.ratios.financingratios.lvldeb.value ? param.ratios.financingratios.lvldeb.value : '';
        currentParam.defaultvalue = defaultParam.ratios.financingratios.lvldeb.value;
        currentParam.parentObject = 'financing';
        currentParam.readValue = function() {
            param.ratios.financingratios.lvldeb.value = this.value;
        }
        convertedParam.data.push(currentParam);

        // level of equity finance benchmark
        var currentParam = {};
        currentParam.name = 'lvlequbenchmark';
        currentParam.title = param.ratios.financingratios.lvlequ.description ? param.ratios.financingratios.lvlequ.description : defaultParam.ratios.financingratios.lvlequ.description;
        currentParam.type = 'string';
        currentParam.value = param.ratios.financingratios.lvlequ.value ? param.ratios.financingratios.lvlequ.value : '';
        currentParam.defaultvalue = defaultParam.ratios.financingratios.lvlequ.value;
        currentParam.parentObject = 'financing';
        currentParam.readValue = function() {
            param.ratios.financingratios.lvlequ.value = this.value;
        }
        convertedParam.data.push(currentParam);

        // level of self financing benchmark
        var currentParam = {};
        currentParam.name = 'lvlselbenchmark';
        currentParam.title = param.ratios.financingratios.lvlsel.description ? param.ratios.financingratios.lvlsel.description : defaultParam.ratios.financingratios.lvlsel.description;
        currentParam.type = 'string';
        currentParam.value = param.ratios.financingratios.lvlsel.value ? param.ratios.financingratios.lvlsel.value : '';
        currentParam.defaultvalue = defaultParam.ratios.financingratios.lvlsel.value;
        currentParam.parentObject = 'financing';
        currentParam.readValue = function() {
            param.ratios.financingratios.lvlsel.value = this.value;
        }
        convertedParam.data.push(currentParam);

        // coverage of fixed assets benchmark
        var currentParam = {};
        currentParam.name = 'covfixbenchmark';
        currentParam.title = param.ratios.financingratios.covfix.description ? param.ratios.financingratios.covfix.description : defaultParam.ratios.financingratios.covfix.description;
        currentParam.type = 'string';
        currentParam.value = param.ratios.financingratios.covfix.value ? param.ratios.financingratios.covfix.value : '';
        currentParam.defaultvalue = defaultParam.ratios.financingratios.covfix.value;
        currentParam.parentObject = 'financing';
        currentParam.readValue = function() {
            param.ratios.financingratios.covfix.value = this.value;
        }
        convertedParam.data.push(currentParam);

        // roe benchmark
        var currentParam = {};
        currentParam.name = 'roebenchmark';
        currentParam.title = param.ratios.profitabilityratios.profroe.description ? param.ratios.profitabilityratios.profroe.description : defaultParam.ratios.profitabilityratios.profroe.description;
        currentParam.type = 'string';
        currentParam.value = param.ratios.profitabilityratios.profroe.value ? param.ratios.profitabilityratios.profroe.value : '';
        currentParam.defaultvalue = defaultParam.ratios.profitabilityratios.profroe.value;
        currentParam.parentObject = 'profitability';
        currentParam.readValue = function() {
            param.ratios.profitabilityratios.profroe.value = this.value;
        }
        convertedParam.data.push(currentParam);

        // roi benchmark
        var currentParam = {};
        currentParam.name = 'roibenchmark';
        currentParam.title = param.ratios.profitabilityratios.profroi.description ? param.ratios.profitabilityratios.profroi.description : defaultParam.ratios.profitabilityratios.profroi.description;
        currentParam.type = 'string';
        currentParam.value = param.ratios.profitabilityratios.profroi.value ? param.ratios.profitabilityratios.profroi.value : '';
        currentParam.defaultvalue = defaultParam.ratios.profitabilityratios.profroi.value;
        currentParam.parentObject = 'profitability';
        currentParam.readValue = function() {
            param.ratios.profitabilityratios.profroi.value = this.value;
        }
        convertedParam.data.push(currentParam)


        // ros benchmark
        var currentParam = {};
        currentParam.name = 'rosbenchmark';
        currentParam.title = param.ratios.profitabilityratios.profros.description ? param.ratios.profitabilityratios.profros.description : defaultParam.ratios.profitabilityratios.profros.description;
        currentParam.type = 'string';
        currentParam.value = param.ratios.profitabilityratios.profros.value ? param.ratios.profitabilityratios.profros.value : '';
        currentParam.defaultvalue = defaultParam.ratios.profitabilityratios.profros.value;
        currentParam.parentObject = 'profitability';
        currentParam.readValue = function() {
            param.ratios.profitabilityratios.profros.value = this.value;
        }
        convertedParam.data.push(currentParam)

        // mol benchmark
        var currentParam = {};
        currentParam.name = 'molbenchmark';
        currentParam.title = param.ratios.profitabilityratios.profmol.description ? param.ratios.profitabilityratios.profmol.description : defaultParam.ratios.profitabilityratios.profmol.description;
        currentParam.type = 'string';
        currentParam.value = param.ratios.profitabilityratios.profmol.value ? param.ratios.profitabilityratios.profmol.value : '';
        currentParam.defaultvalue = defaultParam.ratios.profitabilityratios.profmol.value;
        currentParam.parentObject = 'profitability';
        currentParam.readValue = function() {
            param.ratios.profitabilityratios.profmol.value = this.value;
        }
        convertedParam.data.push(currentParam)

        return convertedParam;
    }

    /**
     * @description With the following method we calculate, starting from the base, the elements necessary for the creation of the dupont scheme, in particular:
     * instantiates a *Dupont= {}* object which will contain all the calculated indices.
     * retrieve the values of the calculated indices, parameters and data.
     * calculate the elements.
     * check that the values coincide with others previously calculated in other methods.
     * @param {object} data: the data object created thanks to loadData methods, containing the values and the sums of the paramters recovered from the dialog.
     * @param {object} CalculatedData: the object returned by the CalculateData method containing the values of the calculated elements.
     * @param {object} index: the object returned by the CalculateIndex method containing the values of the calculated indexes.
     * @returns an object containing the data for the dupont table
     */
    createDupontData(data, CalculatedData, index) {

        var Dupont = {};

        //LEVEL 1 

        //goods costs, production.....
        Dupont.MerchCost = {};
        Dupont.MerchCost = data.contoeconomico.cofm.balance;

        //personnel costs
        Dupont.PersonelCost = {};
        Dupont.PersonelCost = data.contoeconomico.cope.balance;

        /*different costs*/
        Dupont.DifferentCost = {};
        var codi = data.contoeconomico.codi.balance;
        var amre = data.contoeconomico.amre.balance;
        Dupont.DifferentCost = Banana.SDecimal.add(codi, amre);



        //liquidity
        Dupont.liqu = {};
        Dupont.liqu = data.bilancio.ac.liqu.balance;

        //credits
        Dupont.cred = {};
        Dupont.cred = data.bilancio.ac.cred.balance;

        //stocks
        Dupont.stoc = {};
        Dupont.stoc = data.bilancio.ac.stoc.balance;

        //LEVEL 2

        //total costs
        Dupont.TotCosts = {};
        var Totcs1 = Banana.SDecimal.add(Dupont.DifferentCost, Dupont.PersonelCost);
        var Totcs2 = Banana.SDecimal.add(Totcs1, Dupont.MerchCost);
        Dupont.TotCosts = Totcs2

        //fixed assets
        Dupont.FixedAsset = {};
        Dupont.FixedAsset = data.bilancio.af.fixa.balance;

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
        //check that the first 5 digits are equal, to avoid rounding errors
        if (calcroi.substr(0, 5) === roi.substr(0, 5)) {

            Dupont.roi = calcroi;
        } else {
            Dupont.roi = "the values do not match"
        }

        return Dupont;
    }
    getRAttPerc() {
        //...
    }


    /**
     * @description this method verifiy if the amount is negative or positive, and set the correct style to the amounts. In case of negative amount the text is set in red.
     * @param {number} amount: a certain amount
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
     * @param {object} data: the data object created thanks to loadData methods, containing the values and the sums of the paramters recovered from the dialog.
     * @param {object} CalculatedData: the object returned by the CalculateData method containing the values of the calculated elements.
     * @param {object} index: the object returned by the CalculateIndex method containing the values of the calculated indexes.
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
            var cuasone = Banana.SDecimal.add((data.bilancio.ac.liqu.balance), (data.bilancio.ac.cred.balance));
            var cuastwo = Banana.SDecimal.add(cuasone, (data.bilancio.ac.stoc.balance));
            var totatt = CalculatedData.TotActive;
            var x1 = Banana.SDecimal.divide(cuastwo, totatt);
            AltmanIndex.x1 = Banana.SDecimal.multiply(x1, 0.717);

            //X2
            var reut = data.bilancio.cp.reut.balance;
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
            var x5 = Banana.SDecimal.divide(data.contoeconomico.satu.balance, totatt);
            AltmanIndex.x5 = Banana.SDecimal.multiply(x5, 0.998);


            var placeholder = Banana.SDecimal.add(AltmanIndex.x1, AltmanIndex.x2);
            var placeholder1 = Banana.SDecimal.add(placeholder, AltmanIndex.x3);
            var placeholder2 = Banana.SDecimal.add(placeholder1, AltmanIndex.x4);
            AltmanIndex = Banana.SDecimal.add(placeholder2, AltmanIndex.x5, { 'decimals': 2 });

            return AltmanIndex;

        }
        /**
         * @description checks the type of error that has occurred and returns a message.
         * @param {*} errorId: the error identification
         * @param {*} lang: the language
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
         * @description retrieves the language of the current document. 
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
         * @param {*} param 
         */
    setParam(param) {
        this.param = param;
        this.verifyParam();
    }

    /**
     * @description This method simply convert a local amount to the local amount format.
     * @param {number} value
     * @returns the value converted
     */
    toLocaleAmountFormat(value) {
            if (!value || value.trim().length === 0)
                return "";

            var dec = this.param.numberofdecimals
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
        var requiredVersion = "10.0";
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
        }
        if (!Banana.application.license || Banana.application.license.licenseType !== "advanced") {
            var msg = this.getErrorMessage(this.ID_ERR_LICENSE_NOTVALID, lang);
            this.banDocument.addMessage(msg, this.ID_ERR_LICENSE_NOTVALID);
            return false;
        }*/
        return true;
    }

    /**
     * @description this function check that the parameters are objects, if they are not they are set with the default value calling the initParam() method.
     * @param {object} param: an object containing the parameters recovered from the dialog setting
     */
    verifyParam() {
        if (!this.param)
            this.param = {};

        // verifico se il parametro non e quello che mi aspetto vuoto allora lo svuoto
        var defaultParam = this.initParam();

        //first level
        if (!this.param.bilancio)
            this.param.bilancio = {};
        if (!this.param.contoeconomico)
            this.param.contoeconomico = {};
        if (!this.param.ratios)
            this.param.ratios = {};
        if (!this.param.finalresult)
            this.param.finalresult = {};


        //second level
        if (!this.param.bilancio.ac)
            this.param.bilancio.ac = {};
        if (!this.param.bilancio.af)
            this.param.bilancio.af = {};
        if (!this.param.bilancio.ct)
            this.param.bilancio.ct = {};
        if (!this.param.bilancio.cp)
            this.param.bilancio.cp = {};


        if (!this.param.contoeconomico.satu)
            this.param.contoeconomico.satu = {};
        if (!this.param.contoeconomico.cofm)
            this.param.contoeconomico.cofm = {};
        if (!this.param.contoeconomico.cope)
            this.param.contoeconomico.cope = {};
        if (!this.param.contoeconomico.codi)
            this.param.contoeconomico.codi = {};
        if (!this.param.contoeconomico.amre)
            this.param.contoeconomico.amre = {};
        if (!this.param.contoeconomico.inte)
            this.param.contoeconomico.inte = {};

        if (!this.param.finalresult.fire)
            this.param.finalresult.fire = {};

        if (!this.param.ratios.liquidityratios)
            this.param.ratios.liquidityratios = {};
        if (!this.param.ratios.financingratios)
            this.param.ratios.financingratios = {};
        if (!this.param.ratios.profitabilityratios)
            this.param.ratios.profitabilityratios = {};

        //third level
        //current asset
        if (!this.param.bilancio.ac.liqu)
            this.param.bilancio.ac.liqu = {};
        if (!this.param.bilancio.ac.cred)
            this.param.bilancio.ac.cred = {};
        if (!this.param.bilancio.ac.stoc)
            this.param.bilancio.ac.stoc = {};
        //fixed asset
        if (!this.param.bilancio.af.fixa)
            this.param.bilancio.af = {};

        //third capital
        if (!this.param.bilancio.ct.ltdc)
            this.param.bilancio.ct.ltdc = {};
        if (!this.param.bilancio.ct.stdc)
            this.param.bilancio.ct.stdc = {};

        //own capital
        if (!this.param.bilancio.cp.obca)
            this.param.bilancio.cp.obca = {};
        if (!this.param.bilancio.cp.reut)
            this.param.bilancio.cp.reut = {};

        //liquidity ratios
        if (!this.param.ratios.liquidityratios.liqu1)
            this.param.ratios.liquidityratios.liqu1 = {};
        if (!this.param.ratios.liquidityratios.liqu2)
            this.param.ratios.liquidityratios.liqu2 = {};
        if (!this.param.ratios.liquidityratios.liqu3)
            this.param.ratios.liquidityratios.liqu3 = {};
        if (!this.param.ratios.liquidityratios.netcurrass)
            this.param.ratios.liquidityratios.netcurrass = {};

        //financing ratios
        if (!this.param.ratios.financingratios.cirract)
            this.param.ratios.financingratios.cirract = {};
        if (!this.param.ratios.financingratios.fixass)
            this.param.ratios.financingratios.fixass = {};
        if (!this.param.ratios.financingratios.lvldeb)
            this.param.ratios.financingratios.lvldeb = {};
        if (!this.param.ratios.financingratios.lvlequ)
            this.param.ratios.financingratios.lvlequ = {};
        if (!this.param.ratios.financingratios.lvlsel)
            this.param.ratios.financingratios.lvlsel = {};
        if (!this.param.ratios.financingratios.covfix)
            this.param.ratios.financingratios.covfix = {};

        //profitability ratios

        if (!this.param.ratios.profitabilityratios.profroe)
            this.param.ratios.profitabilityratios.profroe = {};
        if (!this.param.ratios.profitabilityratios.profroi)
            this.param.ratios.profitabilityratios.profroi = {};
        if (!this.param.ratios.profitabilityratios.profros)
            this.param.ratios.profitabilityratios.profros = {};
        if (!this.param.ratios.profitabilityratios.profmol)
            this.param.ratios.profitabilityratios.profmol = {};

    }
}

/**
 * @description is called when the script is executed.
 * Inside it, the **FinancialStatementAnalysis** class is declared and instantiated, which takes the document you want to run the script on as a parameter. In addition, the methods that must be executed when the application runs are called.
 * @param {*} inData, (chiedere)
 * @param {*} options, (chiedere)
 */
function exec(inData, options) {
    /*per svuotare la tabella dei settings, la setto con vuoto.
    Banana.document.setScriptSettings("financialStatementAnalysis", "");
    return;*/

    if (!Banana.document)
        return "@Cancel";

    var financialStatementAnalysis = new FinancialStatementAnalysis(Banana.document);
    if (!financialStatementAnalysis.verifyBananaVersion()) {
        return "@Cancel";
    }

    var param = {};
    if (inData.length > 0) {
        param = JSON.parse(inData);
        financialStatementAnalysis.setParam(param);
    } else if (options && options.useLastSettings) {
        var savedParam = Banana.document.getScriptSettings("financialStatementAnalysis");
        if (savedParam.length > 0) {
            param = JSON.parse(savedParam);
            financialStatementAnalysis.setParam(param);
        }
    } else {
        if (!settingsDialog())
            return "@Cancel";
        var savedParam = Banana.document.getScriptSettings("financialStatementAnalysis");
        if (savedParam.length > 0) {
            param = JSON.parse(savedParam);
            financialStatementAnalysis.setParam(param);
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

    var dialogTitle = 'Conti';
    var pageAnchor = 'dlgSettings';
    var convertedParam = financialStatementAnalysis.convertParam();
    if (!Banana.Ui.openPropertyEditor(dialogTitle, convertedParam, pageAnchor))
        return false;
    for (var i = 0; i < convertedParam.data.length; i++) {
        // Read values to param (through the readValue function)
        if (typeof(convertedParam.data[i].readValue) == "function")
            convertedParam.data[i].readValue();
    }

    var paramToString = JSON.stringify(financialStatementAnalysis.param);
    Banana.document.setScriptSettings("financialStatementAnalysis", paramToString);
    return true;
}