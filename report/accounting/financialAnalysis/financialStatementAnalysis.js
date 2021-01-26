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
    printReportAdd_TableCompanyInfo(report, columnsCount) {
        var texts = this.initFinancialAnalysisTexts();
        var tableCompanyInfo = report.addTable('myTableCompanyInfo');
        tableCompanyInfo.setStyleAttributes("width:100%;");
        tableCompanyInfo.getCaption().addText(texts.companyinfos, "styleGroupTitles");
        //columns
        columnsCount = 3;
        tableCompanyInfo.addColumn("Name").setStyleAttributes("width:30%");
        tableCompanyInfo.addColumn("Description").setStyleAttributes("width:70%");
        return tableCompanyInfo;
    }

    printReportAdd_TableBalance(report, columnsCount) {
        var texts = this.initFinancialAnalysisTexts();
        var tableBalance = report.addTable('myTableBalance');
        tableBalance.getCaption().addText(texts.upperbalance, "styleGroupTitles");
        //columns
        columnsCount = 0;
        // header
        var tableHeader = tableBalance.getHeader();
        var tableRow = tableHeader.addRow();
        tableRow.addCell(texts.description, "styleTableHeader");
        if (this.dialogparam.acronymcolumn) {
            tableRow.addCell(texts.acronym, "styleTableHeader");
        }
        this.generateHeaderColumns(tableRow);
        return tableBalance;
    }

    printReportAdd_TableBalanceControlSums(report) {
        var texts = this.initFinancialAnalysisTexts();
        var tableBalanceSumsControl = report.addTable('myTableBalanceSumsControl');
        tableBalanceSumsControl.getCaption().addText(texts.balancecontrolsums, "styleGroupTitles");
        // header
        var tableHeader = tableBalanceSumsControl.getHeader();
        var tableRow = tableHeader.addRow();
        tableRow.addCell(texts.year, "styleTableHeader");
        tableRow.addCell(texts.accountingtotal, "styleTableHeader");
        tableRow.addCell(texts.calculatedtotal, "styleTableHeader");
        tableRow.addCell(texts.difference, "styleTableHeader");
        return tableBalanceSumsControl;
    }
    printReportAdd_TableConCeControlSums(report) {
        var texts = this.initFinancialAnalysisTexts();
        var tableConCeSumsControl = report.addTable('mytableConCeSumsControl');
        tableConCeSumsControl.getCaption().addText(texts.profandlosscontrolsums, "styleGroupTitles");
        // header
        var tableHeader = tableConCeSumsControl.getHeader();
        var tableRow = tableHeader.addRow();
        tableRow.addCell(texts.accountingtotal, "styleTableHeader");
        tableRow.addCell(texts.calculatedtotal, "styleTableHeader");
        tableRow.addCell(texts.difference, "styleTableHeader");
        return tableConCeSumsControl;
    }

    printReportAdd_TableConCe(report) {
        var texts = this.initFinancialAnalysisTexts();
        var tableConCe = report.addTable('myConTableCe');
        tableConCe.getCaption().addText(texts.profitandloss, "styleGroupTitles");
        //header
        var tableHeader = tableConCe.getHeader();
        var tableRow = tableHeader.addRow();
        tableRow.addCell(texts.description, "styleTableHeader");
        if (this.dialogparam.acronymcolumn) {
            tableRow.addCell(texts.acronym, "styleTableHeader");
        }
        this.generateHeaderColumns(tableRow);
        return tableConCe;
    }

    printReportAdd_TableIndliq(report) {
        var texts = this.initFinancialAnalysisTexts();
        var tableIndliq = report.addTable('myIndliqTable');
        tableIndliq.setStyleAttributes("width:100%");
        tableIndliq.getCaption().addText(texts.upperliquidityratios, "styleGroupTitles");
        tableIndliq.addColumn("Description").setStyleAttributes("width:25%");
        tableIndliq.addColumn("formula").setStyleAttributes("width:20%");
        // header
        var tableHeader = tableIndliq.getHeader();
        var tableRow = tableHeader.addRow();
        tableRow.addCell(texts.description, "styleTableHeader");
        if (this.dialogparam.formulascolumn) {
            tableRow.addCell(texts.formula, "styleTableHeader");
        }
        this.generateHeaderColumns(tableRow);
        tableRow.addCell(texts.benchmark, "styleTableHeader");
        return tableIndliq;
    }
    printReportAdd_TableIndlev(report) {
        var texts = this.initFinancialAnalysisTexts();
        var tableIndlev = report.addTable('myIndlevTable');
        tableIndlev.setStyleAttributes("width:100%");
        tableIndlev.getCaption().addText(texts.upperleverageratios, "styleGroupTitles");
        tableIndlev.addColumn("Description").setStyleAttributes("width:25%");
        tableIndlev.addColumn("formula").setStyleAttributes("width:20%");
        // header
        var tableHeader = tableIndlev.getHeader();
        var tableRow = tableHeader.addRow();
        tableRow.addCell(texts.description, "styleTableHeader");
        if (this.dialogparam.formulascolumn) {
            tableRow.addCell(texts.formula, "styleTableHeader");
        }
        this.generateHeaderColumns(tableRow);
        tableRow.addCell(texts.benchmark, "styleTableHeader");
        return tableIndlev;
    }
    printReportAdd_TableIndprof(report) {
        var texts = this.initFinancialAnalysisTexts();
        var tableIndprof = report.addTable('myIndprofTable');
        tableIndprof.setStyleAttributes("width:100%");
        tableIndprof.getCaption().addText(texts.upperprofitabilityratios, "styleGroupTitles");
        tableIndprof.addColumn("Description").setStyleAttributes("width:25%");
        tableIndprof.addColumn("formula").setStyleAttributes("width:20%");
        // header
        var tableHeader = tableIndprof.getHeader();
        var tableRow = tableHeader.addRow();
        tableRow.addCell(texts.description, "styleTableHeader");
        if (this.dialogparam.formulascolumn) {
            tableRow.addCell(texts.formula, "styleTableHeader");
        }
        this.generateHeaderColumns(tableRow);
        tableRow.addCell(texts.benchmark, "styleTableHeader");
        return tableIndprof;
    }

    printReportAdd_TableIndeff(report) {
        var texts = this.initFinancialAnalysisTexts();
        var tableIndeff = report.addTable('myIndeffTable');
        tableIndeff.setStyleAttributes("width:100%");
        tableIndeff.getCaption().addText(texts.upperefficiancyratios, "styleGroupTitles");
        tableIndeff.addColumn("Description").setStyleAttributes("width:25%");
        tableIndeff.addColumn("formula").setStyleAttributes("width:20%");
        // header
        var tableHeader = tableIndeff.getHeader();
        var tableRow = tableHeader.addRow();
        tableRow.addCell(texts.description, "styleTableHeader");
        if (this.dialogparam.formulascolumn) {
            tableRow.addCell(texts.formula, "styleTableHeader");
        }
        this.generateHeaderColumns(tableRow);
        return tableIndeff;
    }

    printReportAdd_TableDupont(report) {
        var texts = this.initFinancialAnalysisTexts();
        var tableDupont = report.addTable('myDupontTable');
        tableDupont.getCaption().addText(texts.upperdupontscheme, "styleGroupTitles");
        tableDupont.addColumn("Description").setStyleAttributes("width:25%");
        //header
        var tableHeader = tableDupont.getHeader();
        var tableRow = tableHeader.addRow();
        tableRow.addCell(texts.description, "styleTableHeader");
        this.generateHeaderColumns(tableRow);
        return tableDupont;
    }

    printtableAltmanIndex(report) {
        var texts = this.initFinancialAnalysisTexts();
        var tableAltmanIndex = report.addTable('myTableAltmanIndex');
        tableAltmanIndex.getCaption().addText(texts.upperaltmanindex, "styleGroupTitles");
        // header
        var tableHeader = tableAltmanIndex.getHeader();
        var tableRow = tableHeader.addRow();
        this.generateHeaderColumns(tableRow);
        return tableAltmanIndex;

    }

    generateHeaderColumns(tableRow, ) {
        for (var i = this.data.length - 1; i >= 0; i--) {
            var year = this.data[i].period.StartDate;
            var elementType = this.data[i].period.Type;
            if (elementType === "Y") {
                year = year.substr(0, 4);
            }
            tableRow.addCell(year, "styleTableHeader");
        }
    }

    /**
     * this method calculate the rate of growth of two indexes with the following formula: ((Xt-Xt-1)/Xt-1)*100.
     * @Param {*} indexT1 
     * @Param {*} indexT2 
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
        var up = '↑';
        var down = '↓';
        var equal = '↔';

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
        var texts = this.initFinancialAnalysisTexts();
        var today = new Date();
        var day = today.getDate();
        var month = today.getMonth() + 1 //As January is 0;
        var year = today.getFullYear();
        if (day < 10) day = '0' + day;
        if (month < 10) month = '0' + month;
        report.getHeader().addClass("header");
        var myheader = texts.financialstatementanalysis;
        report.getHeader().addText(myheader + ": " + day + '-' + month + '-' + year);
        // report.getHeader().addText("period: " + startperiod + " - " + endperiod);

    }

    /**
     * @description set the footer of the report.
     * @Param {object} report: the report created
     */
    addFooter(report) {
        report.getFooter().addClass("footer");
        report.getFooter().addText('Banana.ch SA');

    }

    /**
     * @description this method do the following things:
     * -call some other methods to recover the neccesary values
     * -print the tables and others report elements entering the different data.
     * -set the cells and the rows values
     * @returns a report object.
     */
    printReport() {


        /******************************************************************************************
         * initialize the variables i will use frequently in this method
         * ***************************************************************************************/

        var texts = this.initFinancialAnalysisTexts();
        var report = Banana.Report.newReport('Financial Statement Analysis Report');
        var docInfo = this.getDocumentInfo()
        var currency = docInfo.basicCurrency;
        var company = docInfo.company;
        var Address1 = docInfo.address1;
        var Country = docInfo.country;
        var analsysisYears = this.data.length;
        analsysisYears -= 1;
        var cell = "";
        var perc = "%";
        var amount = "";
        var ratios = "";
        var amountstyle = "";
        var textstyle = "";

        /******************************************************************************************
         * exporting liquidity
         * ***************************************************************************************/
        //this.exportingNegativeLiquidity();



        if (!this.data || this.data.length <= 0) {
            return report;
        }

        this.addHeader(report);
        this.addFooter(report);

        /******************************************************************************************
         * Add the company info's table
         * ***************************************************************************************/
        var tableCompanyInfo = this.printReportAdd_TableCompanyInfo(report);
        var tableRow = tableCompanyInfo.addRow();
        tableRow.addCell(texts.uppercompanyname);
        tableRow.addCell(company, 'styleCompanyInfocells');
        var tableRow = tableCompanyInfo.addRow();
        tableRow.addCell(texts.upperheadoffice);
        tableRow.addCell(Address1, 'styleCompanyInfocells');
        var tableRow = tableCompanyInfo.addRow();
        tableRow.addCell(texts.uppercountry);
        tableRow.addCell(Country, 'styleCompanyInfocells');
        var tableRow = tableCompanyInfo.addRow();
        var tableRow = tableCompanyInfo.addRow();
        tableRow.addCell(texts.upperanalysisperiod);
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



        /******************************************************************************************
         * Add the balance table
         * ***************************************************************************************/
        var colCountTableBalance = this.yearsColumnCount();
        var tableBalance = this.printReportAdd_TableBalance(report);

        /******************************************************************************************
         * Add the current asset to the  balance table
         * ***************************************************************************************/
        for (var key in this.data[0].balance.ca) {
            var tableRow = tableBalance.addRow("styleTablRows");
            tableRow.addCell(qsTr(this.data[0].balance.ca[key].description));
            if (this.dialogparam.acronymcolumn) {
                tableRow.addCell(key);
            }
            for (var i = this.data.length - 1; i >= 0; i--) {
                amount = this.data[i].balance.ca[key].balance;
                tableRow.addCell(this.toLocaleAmountFormat(amount), "styleAmount");
            }
        }
        tableRow = tableBalance.addRow("styleTablRows");
        tableRow.addCell(texts.currentasset, 'styleUnderGroupTitles');
        if (this.dialogparam.acronymcolumn) {
            tableRow.addCell("cuas");
        }
        for (var i = this.data.length - 1; i >= 0; i--) {
            tableRow.addCell(this.toLocaleAmountFormat(this.data[i].CalculatedData.CurrentAsset), "styleMidTotal");
        }

        /******************************************************************************************
         * Add the fixed asset to the  balance table
         * ***************************************************************************************/
        for (var key in this.data[0].balance.fa) {
            var tableRow = tableBalance.addRow("styleTablRows");
            tableRow.addCell(qsTr(this.data[0].balance.fa[key].description));
            if (this.dialogparam.acronymcolumn) {
                tableRow.addCell(key);
            }
            for (var i = this.data.length - 1; i >= 0; i--) {
                amount = this.data[i].balance.fa[key].balance;
                tableRow.addCell(this.toLocaleAmountFormat(amount), "styleAmount");
            }
        }
        tableRow = tableBalance.addRow("styleTablRows");
        tableRow.addCell(texts.fixedassets, 'styleUnderGroupTitles');
        if (this.dialogparam.acronymcolumn) {
            tableRow.addCell("tfix");
        }
        for (var i = this.data.length - 1; i >= 0; i--) {
            tableRow.addCell(this.toLocaleAmountFormat(this.data[i].CalculatedData.FixedAsset), "styleMidTotal");
        }

        /******************************************************************************************
         * Add the total asset to the balance table
         * ***************************************************************************************/
        var tableRow = tableBalance.addRow("styleTablRows");
        tableRow.addCell(texts.totalasset, 'styleTitlesTotAmount');
        if (this.dialogparam.acronymcolumn) {
            tableRow.addCell("tota");
        }
        for (var i = this.data.length - 1; i >= 0; i--) {
            tableRow.addCell(this.toLocaleAmountFormat(this.data[i].CalculatedData.TotActive), "styleTotAmount");
        }

        /******************************************************************************************
         * Add the third capital to the balance table
         * ***************************************************************************************/
        for (var key in this.data[0].balance.dc) {
            var tableRow = tableBalance.addRow("styleTablRows");
            tableRow.addCell(qsTr(this.data[0].balance.dc[key].description));
            if (this.dialogparam.acronymcolumn) {
                tableRow.addCell(key);
            }
            for (var i = this.data.length - 1; i >= 0; i--) {
                amount = this.data[i].balance.dc[key].balance;
                tableRow.addCell(this.toLocaleAmountFormat(amount), 'styleAmount');
            }
        }
        tableRow = tableBalance.addRow("styleTablRows");
        tableRow.addCell(texts.debtcapital, 'styleUnderGroupTitles');
        if (this.dialogparam.acronymcolumn) {
            tableRow.addCell("deca");
        }
        for (var i = this.data.length - 1; i >= 0; i--) {
            tableRow.addCell(this.toLocaleAmountFormat(this.data[i].CalculatedData.DebtCapital), "styleMidTotal");
        }

        /******************************************************************************************
         * Add the own capital to the balance table
         * ***************************************************************************************/
        for (var key in this.data[0].balance.oc) {
            var tableRow = tableBalance.addRow("styleTablRows");
            tableRow.addCell(qsTr(this.data[0].balance.oc[key].description));
            if (this.dialogparam.acronymcolumn) {
                tableRow.addCell(key);
            }
            for (var i = this.data.length - 1; i >= 0; i--) {
                amount = this.data[i].balance.oc[key].balance;
                tableRow.addCell(this.toLocaleAmountFormat(amount), "styleAmount");
            }
        }
        tableRow = tableBalance.addRow("styleTablRows");
        tableRow.addCell(texts.ownbasecapital, 'styleUnderGroupTitles');
        if (this.dialogparam.acronymcolumn) {
            tableRow.addCell("owca");
        }
        for (var i = this.data.length - 1; i >= 0; i--) {
            tableRow.addCell(this.toLocaleAmountFormat(this.data[i].CalculatedData.OwnCapital), "styleMidTotal");
        }

        /******************************************************************************************
         * Add the total liabilities and equity to the balance table
         * ***************************************************************************************/
        var tableRow = tableBalance.addRow("styleTablRows");
        tableRow.addCell(texts.totalliabilitiesandequity, 'styleTitlesTotAmount');
        if (this.dialogparam.acronymcolumn) {
            tableRow.addCell("totp");
        }
        for (var i = this.data.length - 1; i >= 0; i--) {
            tableRow.addCell(this.toLocaleAmountFormat(this.data[i].CalculatedData.TotPassive), "styleTotAmount");
        }

        /******************************************************************************************
         * Add the balance control sums table
         * ***************************************************************************************/
        var tableBalanceControlSums = this.printReportAdd_TableBalanceControlSums(report);
        var tableRow = tableBalanceControlSums.addRow("styleTablRows");
        tableRow.addCell(texts.asset, "styleUnderGroupTitles", 4);
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
        tableRow.addCell(texts.liabilitiesandequity, "styleUnderGroupTitles", 4);
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

        /******************************************************************************************
         * Add the profit and loss table
         * ***************************************************************************************/
        var tableCe = this.printReportAdd_TableConCe(report);
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
                amount = this.data[i].profitandloss[key].balance;
                if (invertAmount)
                    amount = Banana.SDecimal.invert(amount);
                tableRow.addCell(this.toLocaleAmountFormat(amount), "styleAmount");
            }
            if (key === "cofm") {
                var tableRow = tableCe.addRow("styleTablRows");
                tableRow.addCell(texts.addedvalue, "styleUnderGroupTitles");
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
        tableRow.addCell(texts.annualresult, "styleTitlesTotAmount");
        if (this.dialogparam.acronymcolumn) {
            tableRow.addCell("fire");
        }
        for (var i = this.data.length - 1; i >= 0; i--) {
            tableRow.addCell(this.toLocaleAmountFormat(this.data[i].CalculatedData.TotAnnual), "styleTotAmount");
        }

        /******************************************************************************************
         * Add the rpofit and loss control sums table
         * ***************************************************************************************/
        var Arrayindexcurr;

        if (this.data[0].isBudget === true) {
            Arrayindexcurr = 1;
        } else {
            Arrayindexcurr = 0;
        }

        var tableConCeControlSums = this.printReportAdd_TableConCeControlSums(report);
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

        /******************************************************************************************
         * Add the Liquidity ratios table
         * ***************************************************************************************/
        var tableindliq = this.printReportAdd_TableIndliq(report);

        for (var key in this.data[0].index.liqu) {
            var tableRow = tableindliq.addRow("styleTablRows");
            tableRow.addCell(qsTr(this.data[0].index.liqu[key].description), "styleTablRows");
            if (this.dialogparam.formulascolumn) {
                tableRow.addCell(this.data[0].index.liqu[key].formula, "styleNormal");
            }
            for (var i = this.data.length - 1; i >= 0; i--) {
                ratios = this.data[i].index.liqu[key].amount;
                if (this.data[0].index.liqu[key].type != "dec") {
                    cell = tableRow.addCell(ratios + perc + ' ', "styleAmount");
                } else {
                    cell = tableRow.addCell(this.toLocaleAmountFormat(ratios) + ' ', "styleAmount");
                }
                //add the index evolution icons, the space ' ' is a placeholder for the icon
                if (i < analsysisYears) {
                    var indexT1 = this.data[i].index.liqu[key].amount;
                    var indexT2 = this.data[i + 1].index.liqu[key].amount;
                    this.setIndexEvolution(indexT1, indexT2, cell);
                }


            }
            tableRow.addCell(this.data[0].index.liqu[key].benchmark, "styleNormal");
        }

        /******************************************************************************************
         * Add the Leverage ratios table
         * ***************************************************************************************/
        var tableIndlev = this.printReportAdd_TableIndlev(report);

        for (var key in this.data[0].index.lev) {
            var tableRow = tableIndlev.addRow("styleTablRows");
            tableRow.addCell(qsTr(this.data[0].index.lev[key].description), "styleTablRows");
            if (this.dialogparam.formulascolumn) {
                tableRow.addCell(this.data[0].index.lev[key].formula, "styleNormal");
            }
            for (var i = this.data.length - 1; i >= 0; i--) {
                ratios = this.data[i].index.lev[key].amount;
                cell = tableRow.addCell(ratios + perc + ' ', "styleAmount");
                if (i < analsysisYears) {
                    var indexT1 = this.data[i].index.lev[key].amount;
                    var indexT2 = this.data[i + 1].index.lev[key].amount;
                    this.setIndexEvolution(indexT1, indexT2, cell);
                }
            }
            tableRow.addCell(this.data[0].index.lev[key].benchmark, "styleNormal");
        }

        /******************************************************************************************
         * Add the Profitability ratios table
         * ***************************************************************************************/
        var tableindprof = this.printReportAdd_TableIndprof(report);

        for (var key in this.data[0].index.red) {
            var tableRow = tableindprof.addRow("styleTablRows");
            tableRow.addCell(qsTr(this.data[0].index.red[key].description), "styleTablRows");
            if (this.dialogparam.formulascolumn) {
                tableRow.addCell(this.data[0].index.red[key].formula, "styleNormal");
            }
            for (var i = this.data.length - 1; i >= 0; i--) {
                ratios = this.data[i].index.red[key].amount;
                cell = tableRow.addCell(ratios + perc + ' ', "styleAmount");
                if (i < analsysisYears) {
                    var indexT1 = this.data[i].index.red[key].amount;
                    var indexT2 = this.data[i + 1].index.red[key].amount;
                    this.setIndexEvolution(indexT1, indexT2, cell);
                }
            }
            tableRow.addCell(this.data[0].index.red[key].benchmark, "styleNormal");
        }

        /******************************************************************************************
         * Add the Efficiency ratios table
         * ***************************************************************************************/
        var tableindeff = this.printReportAdd_TableIndeff(report);

        for (var key in this.data[0].index.eff) {
            var tableRow = tableindeff.addRow("styleTablRows");
            tableRow.addCell(qsTr(this.data[0].index.eff[key].description), "styleTablRows");
            if (this.dialogparam.formulascolumn) {
                tableRow.addCell(this.data[0].index.eff[key].formula, "styleNormal");
            }
            for (var i = this.data.length - 1; i >= 0; i--) {
                ratios = this.data[i].index.eff[key].amount;
                tableRow.addCell(this.toLocaleAmountFormat(ratios), "styleAmount");
            }
        }



        report.addPageBreak();

        /******************************************************************************************
         * Add the Dupont Analysis table, if the user selected it
         * ***************************************************************************************/

        if (this.dialogparam.includedupontanalysis) {

            var tabledupont = this.printReportAdd_TableDupont(report);

            for (var key in this.data[0].DupontData) {
                var tableRow = tabledupont.addRow("styleTablRows");
                if (this.data[0].DupontData[key].description == "MOL" || this.data[0].DupontData[key].description == "ROT") {
                    textstyle = "styleTitlesTotAmount";
                    perc = '%';
                } else {
                    textstyle = "styleTablRows";
                    perc = "";
                }
                if (this.data[0].DupontData[key].description.indexOf("ROI") >= 0) {
                    textstyle = "styleTitlesTotAmount";
                    perc = '%';
                }
                tableRow.addCell(qsTr(this.data[0].DupontData[key].description), textstyle);
                for (var i = this.data.length - 1; i >= 0; i--) {
                    ratios = this.data[i].DupontData[key].amount;
                    if (this.data[i].DupontData[key].type != "dec") {
                        cell = tableRow.addCell(ratios + perc + ' ', "styleAmount");
                    } else {
                        cell = tableRow.addCell(this.toLocaleAmountFormat(ratios) + ' ', "styleAmount");
                    }
                    if (i < analsysisYears) {
                        var indexT1 = this.data[i].DupontData[key].amount;
                        var indexT2 = this.data[i + 1].DupontData[key].amount;
                        this.setIndexEvolution(indexT1, indexT2, cell);
                    }
                }
            }


            report.addPageBreak();
        }

        /******************************************************************************************
         * Add the Altman index Analysis
         * ***************************************************************************************/
        var tableAltmanIndex = this.printtableAltmanIndex(report);
        var yearcolumns = 0;
        var tableRow = tableAltmanIndex.addRow("styleTablRows");
        for (var i = this.data.length - 1; i >= 0; i--) {
            ratios = this.data[i].AltmanIndex;
            tableRow.addCell(this.data[i].AltmanIndex, this.altmanScoreType(this.data[i].AltmanIndex));
        }
        var tableRow = tableAltmanIndex.addRow("styleTablRows");
        tableRow.addCell(texts.altmanformula, "styleNormal", this.yearsColumnCount(yearcolumns));
        var tableRow = tableAltmanIndex.addRow("styleTablRows");
        tableRow.addCell("X1 = cuas / tota", "styleNormal", this.yearsColumnCount(yearcolumns));
        var tableRow = tableAltmanIndex.addRow("styleTablRows");
        tableRow.addCell("X2 = reut / tota ", "styleNormal", this.yearsColumnCount(yearcolumns));
        var tableRow = tableAltmanIndex.addRow("styleTablRows");
        tableRow.addCell("X3 = EBIT / tota ", "styleNormal", this.yearsColumnCount(yearcolumns));
        var tableRow = tableAltmanIndex.addRow("styleTablRows");
        tableRow.addCell("X4 = pant / totp", "styleNormal", this.yearsColumnCount(yearcolumns));
        var tableRow = tableAltmanIndex.addRow("styleTablRows");
        tableRow.addCell("X5 = sale / tota", "styleNormal", this.yearsColumnCount(yearcolumns));

        report.addParagraph(texts.altmanlowprob, "styleParagraphs");
        report.addParagraph(texts.altmanmediumprob, "styleParagraphs");
        report.addParagraph(texts.altmanstrongprob, "styleParagraphs");


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
        var WrnMsgg = qsTr("Warning: The difference between the 'Accounting total' and the 'Calculated total' columns should be 0.\n Check that the groups used are correct. ");
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
     * Define all the dialog texts
     */
    initFinancialAnalysisTexts() {

        var texts = {};

        /******************************************************************************************
         * texts for groups
         * ***************************************************************************************/
        texts.liquidity = qsTr("Liquidity");
        texts.credits = qsTr("Credits");
        texts.stocks = qsTr("Stocks");
        texts.fixedassets = qsTr("Fixed Asset");
        texts.shorttermdebtcapital = qsTr("Short term debt capital");
        texts.longtermdebtcapital = qsTr("Long term debt capital");
        texts.ownbasecapital = qsTr("Own base capital");
        texts.reservesandprofits = qsTr("Reserves and profits");
        texts.salesturnover = qsTr("Sales turnover");
        texts.costofmerchandservices = qsTr("Cost of merchandise and services");
        texts.personnelcosts = qsTr("Personnel costs");
        texts.differentcosts = qsTr("Different costs");
        texts.depreandadjust = qsTr("Depreciations and adjustments");
        texts.interests = qsTr("Interests");
        texts.finalresult = qsTr("Final Result");

        /******************************************************************************************
         * texts for titles,headers,..
         * ***************************************************************************************/
        texts.companyinfos = qsTr("COMPANY INFORMATION");
        texts.upperbalance = qsTr("BALANCE");
        texts.balance = qsTr('Balance');
        texts.upperprofitandloss = qsTr("PROFIT AND LOSS");
        texts.description = qsTr("Description");
        texts.acronym = qsTr("Acronym");
        texts.formula = qsTr("formula");
        texts.balancecontrolsums = qsTr("BALANCE CONTROL SUMS");
        texts.profandlosscontrolsums = qsTr("PROFIT AND LOSS CONTROL SUMS");
        texts.profitandloss = qsTr("Profit and Loss");
        texts.year = qsTr("Year");
        texts.accountingtotal = qsTr("Accounting Total");
        texts.calculatedtotal = qsTr("Calculated Total");
        texts.difference = qsTr("Difference");
        texts.upperliquidityratios = qsTr("LIQUIDITY RATIOS");
        texts.upperleverageratios = qsTr("LEVERAGE RATIOS");
        texts.upperprofitabilityratios = qsTr("PROFITABILITY RATIOS");
        texts.upperefficiancyratios = qsTr("EFFICIENCY RATIOS");
        texts.benchmark = qsTr("BenchMark");
        texts.upperaltmanindex = qsTr("ALTMAN INDEX Z-SCORE");
        texts.upperdupontscheme = qsTr("DUPONT ANALYSIS ");
        texts.financialstatementanalysis = qsTr("Financial Statements Analysis");
        texts.totalasset = qsTr('Total Asset');
        texts.asset = qsTr("Asset");
        texts.debtcapital = qsTr("Debt Capital");
        texts.liabilitiesandequity = qsTr("Liabilities and Equity");
        texts.totalliabilitiesandequity = qsTr("Total Liabilities and Equity");
        texts.addedvalue = qsTr("= Added Value");
        texts.annualresult = qsTr("Annual result");
        texts.results = qsTr("Results");
        texts.current = qsTr("Current");
        texts.previous = qsTr("Previous");
        texts.revenues = qsTr('Revenues');
        texts.currentasset = qsTr("Current Asset");
        texts.costs = qsTr('Costs');
        texts.totalcosts = qsTr("Total Costs");
        texts.preferences = qsTr('Preferences');
        texts.texts = qsTr('Texts');
        texts.benchmarktexts = qsTr('Benchmarks texts');
        texts.numberofpreviousyear = qsTr('Number of previous years');
        texts.numberofdecimals = qsTr('Number of decimals');
        texts.includebudget = qsTr('Include Budget');
        texts.includedupontanalysis = qsTr('Include DuPont Analysis')
        texts.showacronymcolumn = qsTr('Show Acronym column');
        texts.showformulascolumn = qsTr('Show Formulas column');
        texts.averageemployees = qsTr('Average number of employees');
        texts.leverage = qsTr('Leverage');
        texts.profitability = qsTr('Profitability');



        /******************************************************************************************
         * texts for company info's
         * ***************************************************************************************/
        texts.uppercompanyname = qsTr('COMPANY NAME');
        texts.upperheadoffice = qsTr('HEAD OFFICE');
        texts.uppercountry = qsTr('COUNTRY');
        texts.upperanalysisperiod = qsTr('ANALYSIS PERIOD');

        /******************************************************************************************
         * texts for the formulas
         * ***************************************************************************************/
        texts.altmanformula = qsTr("formula used for the calculation  = 0.717 X1 + 0.847 X2 +3.107 X3 +0.420 X4 + 0.998 X5")
        texts.altmanlowprob = qsTr("for values > than 3 correspond a low probability of a financial crisis");
        texts.altmanmediumprob = qsTr("for values >= than 1.8 but <= than 3 there are possibilities of a financial crisis, should be kept under control");
        texts.altmanstrongprob = qsTr("for values < than 1.8 there is a strong probability of a financial crisis");
        texts.efficiencyRPE = qsTr("satu/employees");
        texts.efficiencyAVE = qsTr("adva/employees");
        texts.efficiencyPCE = qsTr("cope/employees");
        /******************************************************************************************
         * texts for Dupont Formulas
         * ***************************************************************************************/
        /*texts.dupontrot = qsTr("total asset:sales");
        texts.dupontmol = qsTr("satu:EBIT");
        texts.dupontcapital = qsTr("cuas+fixa");
        texts.dupontebit = qsTr("satu-totc");
        texts.dupontcurrentasset = qsTr("liqu+cred+stocks");
        texts.duponttotalcosts = qsTr("cofm+cope+codi")*/

        /******************************************************************************************
         * texts for ratios
         * ***************************************************************************************/
        texts.roi = "ROI";
        texts.dupontroi = "ROI(ROT*MOL)";
        texts.rot = "ROT";
        texts.mol = "MOL";
        texts.ebit = "EBIT";
        texts.ebitDA = "EBIT-DA";
        texts.cashratio = qsTr("Cash ratio");
        texts.quickratio = qsTr("Quick ratio");
        texts.currentratio = qsTr("Current ratio");
        texts.netcurrentasset = qsTr("Net Current Asset");
        texts.degreecirculatingasset = qsTr("Degree of Circulating Asset");
        texts.percentagefixedasset = qsTr("Percentage Fixed Asset");
        texts.debtratio = qsTr("Debt ratio");
        texts.equityratio = qsTr("Equity ratio");
        texts.selfinancingratio = qsTr("Self financing ratio");
        texts.fixedassetcoverage = qsTr("Fixed Asset Coverage");
        texts.ebitmargin = qsTr("EBIT margin");
        texts.profitmargin = qsTr("Profit margin");
        texts.revenueperemployee = qsTr("Revenue per Employee");
        texts.addedvalueperemployee = qsTr("Added Value per Employee");
        texts.personnelcostperemployee = qsTr("Personnel Cost per Employee");



        return texts;
    }

    /**
     * @description It defines the structure of the parameters and gives them a default value.
     * for the representation and use of the necessary parameters, a *dialogparam={}* object has been created.
     * for a question of order for all groups and subgroups of the various layers of the object, has been created a function for every one of them.
     * @returns an object named dialogparam with all the parameters initialized with a default value
     */
    initDialogParam() {


        var texts = this.initFinancialAnalysisTexts();
        var dialogparam = {};
        dialogparam.version = "v1.1";
        dialogparam.balance = this.initDialogParam_Balance();
        dialogparam.profitandloss = this.initDialogParam_ProfitLoss(texts);
        dialogparam.ratios = this.initDialogParam_RatiosBenchmarks();
        dialogparam.finalresult = this.initDialogParam_FinalResult(texts);
        dialogparam.maxpreviousyears = 2;
        dialogparam.numberofdecimals = 2;
        dialogparam.numberofemployees = 1;
        dialogparam.acronymcolumn = true;
        dialogparam.formulascolumn = true;
        dialogparam.includebudgettable = true;
        dialogparam.includedupontanalysis = true;

        return dialogparam;
    }

    initDialogParam_Balance() {
        var texts = this.initFinancialAnalysisTexts();
        var dialogparam = {};
        dialogparam.ca = this.initDialogParam_CurrentAsset(texts);
        dialogparam.fa = this.initDialogParam_FixedAsset(texts);
        dialogparam.dc = this.initDialogParam_DebtCapital(texts);
        dialogparam.oc = this.initDialogParam_OwnCapital(texts);

        return dialogparam;

    }

    initDialogParam_CurrentAsset(texts) {
        var dialogparam = {};
        dialogparam.liquidity = {};
        dialogparam.liquidity.gr = "100;106;109";
        dialogparam.liquidity.description = texts.liquidity;
        dialogparam.liquidity.bclass = "1";
        dialogparam.credits = {};
        dialogparam.credits.gr = "110;114";
        dialogparam.credits.description = texts.credits;
        dialogparam.credits.bclass = "1";
        dialogparam.stocks = {};
        dialogparam.stocks.gr = "120;130";
        dialogparam.stocks.description = texts.stocks;
        dialogparam.stocks.bclass = "1";

        return dialogparam;
    }

    initDialogParam_FixedAsset(texts) {
        var dialogparam = {};
        dialogparam.fixedassets = {};
        dialogparam.fixedassets.gr = "14";
        dialogparam.fixedassets.description = texts.fixedassets;
        dialogparam.fixedassets.bclass = "1";


        return dialogparam;
    }

    initDialogParam_DebtCapital(texts) {
        var dialogparam = {};
        dialogparam.shorttermdebtcapital = {};
        dialogparam.shorttermdebtcapital.gr = "20";
        dialogparam.shorttermdebtcapital.description = texts.shorttermdebtcapital;
        dialogparam.shorttermdebtcapital.bclass = "2";
        dialogparam.ltlongtermdebtcapitaldc = {};
        dialogparam.longtermdebtcapital.gr = "24";
        dialogparam.longtermdebtcapital.description = texts.longtermdebtcapital;
        dialogparam.longtermdebtcapital.bclass = "2";
        return dialogparam;
    }

    initDialogParam_OwnCapital(texts) {
        var dialogparam = {};
        dialogparam.ownbasecapital = {};
        dialogparam.ownbasecapital.gr = "280;298";
        dialogparam.ownbasecapital.description = texts.ownbasecapital;
        dialogparam.ownbasecapital.bclass = "2";
        dialogparam.reservesandprofits = {};
        dialogparam.reservesandprofits.gr = "290;295;296;297";
        dialogparam.reservesandprofits.description = texts.reservesandprofits;
        dialogparam.reservesandprofits.bclass = "2";

        return dialogparam;
    }

    initDialogParam_ProfitLoss(texts) {
        var dialogparam = {};
        dialogparam.salesturnover = {};
        dialogparam.salesturnover.gr = "3";
        dialogparam.salesturnover.description = texts.salesturnover;
        dialogparam.salesturnover.bclass = "4";
        dialogparam.costofmerchandservices = {};
        dialogparam.costofmerchandservices.gr = "4";
        dialogparam.costofmerchandservices.description = texts.costofmerchandservices;
        dialogparam.costofmerchandservices.bclass = "3";
        dialogparam.personnelcosts = {};
        dialogparam.personnelcosts.gr = "5";
        dialogparam.personnelcosts.description = texts.personnelcosts;
        dialogparam.personnelcosts.bclass = "3";
        dialogparam.differentcosts = {};
        dialogparam.differentcosts.gr = "6";
        dialogparam.differentcosts.description = texts.differentcosts;
        dialogparam.differentcosts.bclass = "3";
        dialogparam.depreandadjust = {};
        dialogparam.depreandadjust.gr = "68";
        dialogparam.depreandadjust.description = texts.depreandadjust;
        dialogparam.depreandadjust.bclass = "3";
        dialogparam.interests = {};
        dialogparam.interests.gr = "69";
        dialogparam.interests.description = texts.interests;
        dialogparam.interests.bclass = "3";
        return dialogparam;
    }

    initDialogParam_FinalResult(texts) {
        var dialogparam = {};
        dialogparam.finalresult = {};
        dialogparam.finalresult.gr = "E7";
        dialogparam.finalresult.description = texts.finalresult;
        return dialogparam;
    }

    /***********************************************************************************
     * added the prefix prof because elements: .roe, .roi, .ros, .mol  already exists.
     ************************************************************************************/
    initDialogParam_RatiosBenchmarks() {
        var texts = this.initFinancialAnalysisTexts();
        var dialogparam = {};
        dialogparam.liquidityratios = this.initDialogParam_LiquidityBenchmarks(texts);
        dialogparam.leverageratios = this.initDialogParam_leverageBenchmarks(texts);
        dialogparam.profitabilityratios = this.initDialogParam_ProfitabilityBenchmarks(texts);

        return dialogparam;

    }
    initDialogParam_LiquidityBenchmarks(texts) {
        var dialogparam = {};
        dialogparam.cashratio = {};
        dialogparam.cashratio.description = texts.cashratio;
        dialogparam.cashratio.value = "10%-35%";
        dialogparam.quickratio = {};
        dialogparam.quickratio.description = texts.quickratio;
        dialogparam.quickratio.value = "100%";
        dialogparam.currentratio = {};
        dialogparam.currentratio.description = texts.currentratio;
        dialogparam.currentratio.value = "150%";
        dialogparam.netcurrentasset = {};
        dialogparam.netcurrentasset.description = texts.netcurrentasset;
        dialogparam.netcurrentasset.value = ">0";

        return dialogparam;
    }
    initDialogParam_leverageBenchmarks(texts) {
        var dialogparam = {};
        dialogparam.degreecirculatingasset = {};
        dialogparam.degreecirculatingasset.description = texts.degreecirculatingasset;
        dialogparam.degreecirculatingasset.value = "60%";
        dialogparam.percentagefixedasset = {};
        dialogparam.percentagefixedasset.description = texts.percentagefixedasset;
        dialogparam.percentagefixedasset.value = "40%";
        dialogparam.debtratio = {};
        dialogparam.debtratio.description = texts.debtratio;
        dialogparam.debtratio.value = "40%-70%";
        dialogparam.equityratio = {};
        dialogparam.equityratio.description = texts.equityratio;
        dialogparam.equityratio.value = "30%-60%";
        dialogparam.selfinancingratio = {};
        dialogparam.selfinancingratio.description = texts.selfinancingratio;
        dialogparam.selfinancingratio.value = "33,3%";
        dialogparam.fixedassetcoverage = {};
        dialogparam.fixedassetcoverage.description = texts.fixedassetcoverage;
        dialogparam.fixedassetcoverage.value = ">100%";

        return dialogparam;
    }
    initDialogParam_ProfitabilityBenchmarks(texts) {
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
        dialogparam.profebm.description = texts.ebitmargin;
        dialogparam.profebm.value = "2.4%";
        dialogparam.profmon = {};
        dialogparam.profmon.description = texts.profitmargin;
        dialogparam.profmon.value = "1.4%";

        Banana.console.debug(JSON.stringifydialogparam);

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
            var dataBudget = this.loadData_Budget(yeardocument);
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
            var dataYear = this.loadData_Year(yeardocument);
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
    loadData_Budget(_banDocument) {
        if (!this.banDocument || !_banDocument) {
            return;
        }

        var dialogparam = JSON.stringify(this.dialogparam);
        dialogparam = JSON.parse(dialogparam);

        var groupList = this.loadGroups();
        var budgetBalances = true;
        for (var key in dialogparam) {
            this.loadData_Param(dialogparam[key], groupList, budgetBalances, _banDocument);
        }
        dialogparam.isBudget = true;
        dialogparam.period = {};
        dialogparam.period.StartDate = "Budget";
        dialogparam.period.EndDate = "Budget";
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
    loadData_Year(_banDocument) {
        if (!this.banDocument || !_banDocument) {
            return;
        }
        var dialogparam = JSON.stringify(this.dialogparam);
        dialogparam = JSON.parse(dialogparam);

        var groupList = this.loadGroups();
        var budgetBalances = false;
        for (var key in dialogparam) {
            this.loadData_Param(dialogparam[key], groupList, budgetBalances, _banDocument);
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
    loadData_Param(dialogparam, groupList, budgetBalances, _banDocument) {

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
                    this.loadData_Param(dialogparam[key], groupList, budgetBalances, _banDocument);
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
        /*******************************************************************************************************************
         * Calculation of total Asset (with the total of current asset and fixed assets), and checking that they coincide
         *********************************************************************************************************************/
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

        /************************************************************************************************
         * Calculate the total assets resulting from the accounting sheet and then use it for controls
         ************************************************************************************************/
        Calcdata.TotActiveSheet = {}
        var TotActiveSheet = _banDocument.currentBalance('Gr=1', '', '', null);
        var TotActiveSheetBalance = TotActiveSheet.balance;
        Calcdata.TotActiveSheet = TotActiveSheetBalance;

        /********************************************************************************************************
         * Calculate the difference between Calculated Asset and the Asset amount found in the accountin sheet
         ********************************************************************************************************/
        Calcdata.ActiveDifference = {};
        var ActDifference = Banana.SDecimal.subtract(Totactive, TotActiveSheetBalance);
        Calcdata.ActiveDifference = ActDifference



        /******************************************************************************************************
         * Calculation of total liabilities and equity (with the total of debt capital and the own capital
         ******************************************************************************************************/
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

        /*********************************************************************************************
         * Calculation of the total liabilities and equity resulting from the accounting sheet
         *********************************************************************************************/

        Calcdata.TotPassiveSheet = {}
        var mult = -1;
        var TotPassiveSheet = _banDocument.currentBalance('Gr=2', '', '', null);
        var TotPassiveSheetBalance = Banana.SDecimal.multiply(TotPassiveSheet.balance, mult);
        Calcdata.TotPassiveSheet = TotPassiveSheetBalance;

        /**********************************************************************************************************************************
         * Calculate the difference between liabilities and equity and the liabilities and equit amount found in the accountin sheet
         **********************************************************************************************************************************/

        Calcdata.PassiveDifference = {};
        var PassDifference = Banana.SDecimal.subtract(TotPassive, TotPassiveSheetBalance);
        Calcdata.PassiveDifference = PassDifference

        /*********************************************************
         * Calculation of the Annual Result (profit)
         **********************************************************/

        Calcdata.TotAnnual = {};
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

        /************************************************************************
         * Calculation of the Annual Result (profit) from the accounting sheet
         ************************************************************************/

        Calcdata.TotAnnualSheet = {}
        Calcdata.TotAnnualSheet = data.finalresult.fire.balance;


        /*******************************************************************************************************
         * Calculation of the difference between the calculated annual result and the accounting annual result
         *******************************************************************************************************/
        Calcdata.TotAnnualDifference = {};
        Calcdata.TotAnnualDifference = Banana.SDecimal.subtract(Calcdata.TotAnnualSheet, Calcdata.TotAnnual);

        /*******************************************************************************************************
         * Calculation of the Added Value
         *******************************************************************************************************/
        Calcdata.AddedValue = {};
        Calcdata.AddedValue = Banana.SDecimal.subtract(Sales, Cofm);

        /*******************************************************************************************************
         * Calculation of the EBIT
         *******************************************************************************************************/
        Calcdata.Ebit = {};
        Calcdata.Ebit = Totce4;

        /*******************************************************************************************************
         * Calculation of the EBIT-DA
         *******************************************************************************************************/
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
     * If it is negative this method export the amount of liquidity to the short term debt capital.
     * the exportation is made only at report level.
     * @param {*} liquidity 
     * @param {*} shorttermdebtcapital 
     */
    exportingNegativeLiquidity(liquidity, shorttermdebtcapital) {
        Banana.console.debug("chiamato");
        for (var i = this.data.length - 1; i >= 0; i--) {
            if (this.data[i].balance.ca.liqu.balance < "0") {
                this.data[i].balance.dc.stdc.balance = Banana.SDecimal.add(this.data[i].balance.dc.stdc.balance, Banana.SDecimal.abs(this.data[i].balance.ca.liqu.balance));
                this.data[i].balance.ca.liqu.balance = ("0.00")
            }
        }
        return;
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
        var texts = this.initFinancialAnalysisTexts();
        var index = {};

        /***********************************************************************************************************************************************************************************
         * The numbers in the variables are present to allow each block of index type to have elements with distinct names
         * to differentiate the calculation variables, while the others, once given the value, can be re-used in the other blocks.
         * e.g.: block of liquidity we have for the first block 1, second block 2 and third block 3, for that of leverage equal both the various blocks are contradicted by the prefixes
         * type = identify if the value is a percentage o a decimal
         ************************************************************************************************************************************************************************************/


        /*******************************************************************************
         * LIQUIDITY
         * prefix variables of liquidity 'l'
         * dofl = degree of liquidity
         * 1 / one = reference to index 1
         * 2 / two = reference to index 2
         * 3 / three = reference to index 3
         ********************************************************************************/

        index.liqu = {};

        index.liqu.doflone = {};
        index.liqu.doflone.description = texts.cashratio;
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
        index.liqu.dofltwo.description = texts.quickratio;
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
        index.liqu.doflthree.description = texts.currentratio;
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
        index.liqu.netcuas.description = texts.netcurrentasset;
        index.liqu.netcuas.type = "dec";
        index.liqu.netcuas.formula = "cuas-stdc";
        var lcalc7 = Banana.SDecimal.subtract(cuastwo, stdc, { 'decimals': this.dialogparam.numberofdecimals });
        var lris4 = lcalc7.toString();
        lris4 = this.setIndexToZero(lris4);
        index.liqu.netcuas.amount = lris4;
        index.liqu.netcuas.benchmark = data.ratios.liquidityratios.netcurrass.value;


        /*************************************
         * LEVERAGE RATIOS
         * leverage variables prefix 'f'  
         ****************************************/
        index.lev = {};

        //degree of circulating assets
        index.lev.grcuas = {};
        index.lev.grcuas.description = texts.degreecirculatingasset;
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
        index.lev.grfixa.description = texts.percentagefixedasset;
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
        index.lev.gdin.description = texts.debtratio;
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
        index.lev.gfcp.description = texts.equityratio;
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
        index.lev.gdau.description = texts.selfinancingratio;
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
        index.lev.fixaco.description = texts.fixedassetcoverage;
        index.lev.fixaco.type = "perc";
        index.lev.fixaco.formula = "(owca + ltdc) / tota";
        var ltdc = data.balance.dc.ltdc.balance;
        var fcalc8 = Banana.SDecimal.add(owca, ltdc);
        var fcalc9 = Banana.SDecimal.divide(fcalc8, totatt);
        var fcalc9 = Banana.SDecimal.multiply(fcalc9, 100, { 'decimals': this.dialogparam.numberofdecimals });
        var fris5 = fcalc9.toString();
        index.lev.fixaco.amount = fris5;
        index.lev.fixaco.benchmark = data.ratios.leverageratios.covfix.value;


        /******************************************
         *PROFITABILITY INDICATORS
         *leverage variables prefix 'r'
         *roe= Return of equity
         *roi= Return of investiment
         *ros= Return of sales
         *****************************************/

        index.red = {};

        //capital profitability

        //ROE 
        index.red.roe = {};
        index.red.roe.description = "ROE";
        index.red.roe.type = "perc";
        index.red.roe.formula = "profit / owca";
        var rcalc1 = Banana.SDecimal.multiply(CalculatedData.TotAnnual, 100);
        var rcalc2 = Banana.SDecimal.divide(rcalc1, owca, { 'decimals': this.dialogparam.numberofdecimals });
        var rris = rcalc2.toString();
        index.red.roe.amount = rris;
        index.red.roe.benchmark = data.ratios.profitabilityratios.profroe.value;


        //ROI
        index.red.roi = {};
        index.red.roi.description = "ROI";
        index.red.roi.type = "perc";
        index.red.roi.formula = "EBIT / tota  ";
        var rcalc3 = Banana.SDecimal.divide(CalculatedData.Ebit, totatt);
        var rcalc4 = Banana.SDecimal.multiply(rcalc3, 100, { 'decimals': this.dialogparam.numberofdecimals });
        var rris2 = rcalc4.toString();
        index.red.roi.amount = rris2;
        index.red.roi.benchmark = data.ratios.profitabilityratios.profroi.value;

        //ROS
        index.red.ros = {};
        index.red.ros.description = "ROS";
        index.red.ros.type = "perc";
        index.red.ros.formula = "EBIT / satu";
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
        index.red.ebm.description = texts.ebitmargin;
        index.red.ebm.type = "perc";
        index.red.ebm.formula = "EBIT / satu";
        var rcalc9 = Banana.SDecimal.multiply(CalculatedData.Ebit, 100);
        var rcalc10 = Banana.SDecimal.divide(rcalc9, satu, { 'decimals': this.dialogparam.numberofdecimals });
        var rris5 = rcalc10.toString();
        index.red.ebm.amount = rris5;
        index.red.ebm.benchmark = data.ratios.profitabilityratios.profebm.value;

        //MON (Profit Margin)
        index.red.mon = {};
        index.red.mon.description = texts.profitmargin;
        index.red.mon.type = "perc";
        index.red.mon.formula = "net profit / satu";
        var rcalc11 = Banana.SDecimal.multiply(CalculatedData.TotAnnual, 100);
        var rcalc12 = Banana.SDecimal.divide(rcalc11, satu, { 'decimals': this.dialogparam.numberofdecimals });
        var rris6 = rcalc12.toString();
        index.red.mon.amount = rris6;
        index.red.mon.benchmark = data.ratios.profitabilityratios.profmon.value;


        /*************************************
         *EFFICENCY INDICATORS
         *leverage variables prefix 'e'
         ************************************/

        index.eff = {};

        //Revenue per Employee

        index.eff.rpe = {};
        index.eff.rpe.description = texts.revenueperemployee;
        index.eff.rpe.type = "dec";
        index.eff.rpe.formula = texts.efficiencyRPE;
        var ecalc1 = Banana.SDecimal.divide(satu, this.dialogparam.numberofemployees, { 'decimals': this.dialogparam.numberofdecimals });
        var eris1 = ecalc1.toString();
        eris1 = this.setIndexToZero(eris1);
        index.eff.rpe.amount = eris1;

        //Added value per Employee

        index.eff.ape = {};
        index.eff.ape.description = texts.addedvalueperemployee;
        index.eff.ape.type = "dec";
        index.eff.ape.formula = texts.efficiencyAVE;
        var adva = CalculatedData.AddedValue
        var ecalc2 = Banana.SDecimal.divide(adva, this.dialogparam.numberofemployees, { 'decimals': this.dialogparam.numberofdecimals });
        var eris2 = ecalc2.toString();
        eris2 = this.setIndexToZero(eris2);
        index.eff.ape.amount = eris2;

        //Employees performance

        index.eff.emp = {};
        index.eff.emp.description = texts.personnelcostperemployee;
        index.eff.emp.type = "dec";
        index.eff.emp.formula = texts.efficiencyPCE;
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
        var userParam = this.dialogparam;
        var convertedParam = {};
        convertedParam.version = '1.0';
        var texts = this.initFinancialAnalysisTexts();
        /*array dei parametri dello script*/
        convertedParam.data = [];

        //I create the balance sheet grouping
        var currentParam = {};
        currentParam.name = 'Balance';
        currentParam.title = texts.balance;
        currentParam.editable = false;

        convertedParam.data.push(currentParam);

        //Active subgroup
        var currentParam = {};
        currentParam.name = 'Assets';
        currentParam.title = texts.asset;
        currentParam.editable = false;
        currentParam.parentObject = 'Balance';

        convertedParam.data.push(currentParam);

        // subgroup Liabilities and Equity
        var currentParam = {};
        currentParam.name = 'Liabilities and Equity';
        currentParam.title = texts.liabilitiesandequity;
        currentParam.editable = false;
        currentParam.parentObject = 'Balance';

        convertedParam.data.push(currentParam);


        // Profit and Loss grouping
        var currentParam = {};
        currentParam.name = 'Profit and Loss';
        currentParam.title = texts.profitandloss;
        currentParam.editable = false;

        convertedParam.data.push(currentParam);

        // subgroup Revenues
        var currentParam = {};
        currentParam.name = 'Revenues';
        currentParam.title = texts.revenues;
        currentParam.editable = false;
        currentParam.parentObject = 'Profit and Loss';

        convertedParam.data.push(currentParam);

        // sub-grouping of costs
        var currentParam = {};
        currentParam.name = 'Costs';
        currentParam.title = texts.costs;
        currentParam.editable = false;
        currentParam.parentObject = 'Profit and Loss';

        convertedParam.data.push(currentParam);

        //subgroup Results
        var currentParam = {};
        currentParam.name = 'Results';
        currentParam.title = texts.results;
        currentParam.editable = false;
        currentParam.parentObject = 'Profit and Loss';

        convertedParam.data.push(currentParam);

        //subgroup Final Result
        var currentParam = {};
        currentParam.name = 'Final Result';
        currentParam.title = texts.annualresult;
        currentParam.editable = false;
        currentParam.parentObject = 'Results';

        convertedParam.data.push(currentParam);

        //I create group of preferences
        var currentParam = {};
        currentParam.name = 'Preferences';
        currentParam.title = texts.preferences;
        currentParam.editable = false;

        convertedParam.data.push(currentParam);

        // create an another group, Texts
        var currentParam = {};
        currentParam.name = 'Texts';
        currentParam.title = texts.texts;
        currentParam.editable = false;
        currentParam.collapse = true;
        currentParam.parentObject = false;
        convertedParam.data.push(currentParam);

        //we put inside the Texts section, the customizable banchmarks
        var currentParam = {};
        currentParam.name = 'Benchmarks texts';
        currentParam.title = texts.benchmarktexts;
        currentParam.editable = false;
        currentParam.parentObject = 'Texts';
        convertedParam.data.push(currentParam);

        /**
         * under the benchmarks group, we separate the ratios by type: liquidity, leverage and profitability.
         */

        // liquidity ratios
        var currentParam = {};
        currentParam.name = 'Liquidity';
        currentParam.title = texts.liquidity;
        currentParam.editable = false;
        currentParam.parentObject = 'Benchmarks texts';
        convertedParam.data.push(currentParam);

        // leverage ratios
        var currentParam = {};
        currentParam.name = 'Leverage';
        currentParam.title = texts.leverage;
        currentParam.editable = false;
        currentParam.parentObject = 'Benchmarks texts';
        convertedParam.data.push(currentParam);

        // profitability ratios
        var currentParam = {};
        currentParam.name = 'Profitability';
        currentParam.title = texts.profitability;
        currentParam.editable = false;
        currentParam.parentObject = 'Benchmarks texts';
        convertedParam.data.push(currentParam);


        var currentParam = {};
        currentParam.name = 'liqu';
        currentParam.group = 'balance';
        currentParam.title = defaultParam.balance.ca.liqu.description;
        currentParam.type = 'string';
        currentParam.value = userParam.balance.ca.liqu.gr ? userParam.balance.ca.liqu.gr : '';
        currentParam.defaultvalue = defaultParam.balance.ca.liqu.gr;
        //I assign it to a group
        currentParam.parentObject = 'Assets';
        currentParam.readValue = function() {
            userParam.balance.ca.liqu.gr = this.value;
        }

        convertedParam.data.push(currentParam);

        var currentParam = {};
        currentParam.name = 'cred';
        currentParam.group = 'balance';
        currentParam.title = defaultParam.balance.ca.cred.description;
        currentParam.type = 'string';
        currentParam.value = userParam.balance.ca.cred.gr ? userParam.balance.ca.cred.gr : '';
        currentParam.defaultvalue = defaultParam.balance.ca.cred.gr;
        currentParam.parentObject = 'Assets';
        currentParam.readValue = function() {
            userParam.balance.ca.cred.gr = this.value;
        }
        convertedParam.data.push(currentParam);

        var currentParam = {};
        currentParam.name = 'stoc';
        currentParam.group = 'balance';
        currentParam.title = defaultParam.balance.ca.stoc.description;
        currentParam.type = 'string';
        currentParam.value = userParam.balance.ca.stoc.gr ? userParam.balance.ca.stoc.gr : '';
        currentParam.defaultvalue = defaultParam.balance.ca.stoc.gr;
        currentParam.parentObject = 'Assets';
        currentParam.readValue = function() {
            userParam.balance.ca.stoc.gr = this.value;
        }
        convertedParam.data.push(currentParam);

        var currentParam = {};
        currentParam.name = 'fixa';
        currentParam.group = 'balance';
        currentParam.title = defaultParam.balance.fa.fixa.description;
        currentParam.type = 'string';
        currentParam.value = userParam.balance.fa.fixa.gr ? userParam.balance.fa.fixa.gr : '';
        currentParam.defaultvalue = defaultParam.balance.fa.fixa.gr;
        currentParam.parentObject = 'Assets';
        currentParam.readValue = function() {
            userParam.balance.fa.fixa.gr = this.value;
        }
        convertedParam.data.push(currentParam);

        var currentParam = {};
        currentParam.name = 'stdc';
        currentParam.group = 'balance';
        currentParam.title = defaultParam.balance.dc.stdc.description;
        currentParam.type = 'string';
        currentParam.value = userParam.balance.dc.stdc.gr ? userParam.balance.dc.stdc.gr : '';
        currentParam.defaultvalue = defaultParam.balance.dc.stdc.gr;
        currentParam.parentObject = 'Liabilities and Equity';
        currentParam.readValue = function() {
            userParam.balance.dc.stdc.gr = this.value;
        }
        convertedParam.data.push(currentParam);

        var currentParam = {};
        currentParam.name = 'ltdc';
        currentParam.group = 'balance';
        currentParam.title = defaultParam.balance.dc.ltdc.description;
        currentParam.type = 'string';
        currentParam.value = userParam.balance.dc.ltdc.gr ? userParam.balance.dc.ltdc.gr : '';
        currentParam.defaultvalue = defaultParam.balance.dc.ltdc.gr;
        currentParam.parentObject = 'Liabilities and Equity';
        currentParam.readValue = function() {
            userParam.balance.dc.ltdc.gr = this.value;
        }
        convertedParam.data.push(currentParam);

        var currentParam = {};
        currentParam.name = 'obca';
        currentParam.group = 'balance';
        currentParam.title = defaultParam.balance.oc.obca.description;
        currentParam.type = 'string';
        currentParam.value = userParam.balance.oc.obca.gr ? userParam.balance.oc.obca.gr : '';
        currentParam.defaultvalue = defaultParam.balance.oc.obca.gr;
        currentParam.parentObject = 'Liabilities and Equity';
        currentParam.readValue = function() {
            userParam.balance.oc.obca.gr = this.value;
        }
        convertedParam.data.push(currentParam);

        var currentParam = {};
        currentParam.name = 'reut';
        currentParam.group = 'balance';
        currentParam.title = defaultParam.balance.oc.reut.description;
        currentParam.type = 'string';
        currentParam.value = userParam.balance.oc.reut.gr ? userParam.balance.oc.reut.gr : '';
        currentParam.defaultvalue = defaultParam.balance.oc.reut.gr;
        currentParam.parentObject = 'Liabilities and Equity';
        currentParam.readValue = function() {
            userParam.balance.oc.reut.gr = this.value;
        }
        convertedParam.data.push(currentParam);

        var currentParam = {};
        currentParam.name = 'satu';
        currentParam.group = 'profitandloss';
        currentParam.title = defaultParam.profitandloss.satu.description;
        currentParam.type = 'string';
        currentParam.value = userParam.profitandloss.satu.gr ? userParam.profitandloss.satu.gr : '';
        currentParam.defaultvalue = defaultParam.profitandloss.satu.gr;
        currentParam.parentObject = 'Revenues';
        currentParam.readValue = function() {
            userParam.profitandloss.satu.gr = this.value;
        }
        convertedParam.data.push(currentParam);

        var currentParam = {};
        currentParam.name = 'cofm';
        currentParam.group = 'profitandloss';
        currentParam.title = defaultParam.profitandloss.cofm.description;
        currentParam.type = 'string';
        currentParam.value = userParam.profitandloss.cofm.gr ? userParam.profitandloss.cofm.gr : '';
        currentParam.defaultvalue = defaultParam.profitandloss.cofm.gr;
        currentParam.parentObject = 'Costs';
        currentParam.readValue = function() {
            userParam.profitandloss.cofm.gr = this.value;
        }
        convertedParam.data.push(currentParam);

        var currentParam = {};
        currentParam.name = 'cope';
        currentParam.group = 'profitandloss';
        currentParam.title = defaultParam.profitandloss.cope.description;
        currentParam.type = 'string';
        currentParam.value = userParam.profitandloss.cope.gr ? userParam.profitandloss.cope.gr : '';
        currentParam.defaultvalue = defaultParam.profitandloss.cope.gr;
        currentParam.parentObject = 'Costs';
        currentParam.readValue = function() {
            userParam.profitandloss.cope.gr = this.value;
        }
        convertedParam.data.push(currentParam);

        var currentParam = {};
        currentParam.name = 'codi';
        currentParam.group = 'profitandloss';
        currentParam.title = defaultParam.profitandloss.codi.description;
        currentParam.type = 'string';
        currentParam.value = userParam.profitandloss.codi.gr ? userParam.profitandloss.codi.gr : '';
        currentParam.defaultvalue = defaultParam.profitandloss.codi.gr;
        currentParam.parentObject = 'Costs';
        currentParam.readValue = function() {
            userParam.profitandloss.codi.gr = this.value;
        }
        convertedParam.data.push(currentParam);

        var currentParam = {};
        currentParam.name = 'inte';
        currentParam.group = 'profitandloss';
        currentParam.title = defaultParam.profitandloss.inte.description;
        currentParam.type = 'string';
        currentParam.value = userParam.profitandloss.inte.gr ? userParam.profitandloss.inte.gr : '';
        currentParam.defaultvalue = defaultParam.profitandloss.inte.gr;
        currentParam.parentObject = 'Costs';
        currentParam.readValue = function() {
            userParam.profitandloss.inte.gr = this.value;
        }
        convertedParam.data.push(currentParam);

        var currentParam = {};
        currentParam.name = 'amre';
        currentParam.group = 'profitandloss';
        currentParam.title = defaultParam.profitandloss.amre.description;
        currentParam.type = 'string';
        currentParam.value = userParam.profitandloss.amre.gr ? userParam.profitandloss.amre.gr : '';
        currentParam.defaultvalue = defaultParam.profitandloss.amre.gr;
        currentParam.parentObject = 'Costs';
        currentParam.readValue = function() {
            userParam.profitandloss.amre.gr = this.value;
        }
        convertedParam.data.push(currentParam);

        var currentParam = {};
        currentParam.name = 'fire';
        currentParam.group = 'profitandloss';
        currentParam.title = defaultParam.finalresult.fire.description;
        currentParam.type = 'string';
        currentParam.value = userParam.finalresult.fire.gr ? userParam.finalresult.fire.gr : '';
        currentParam.defaultvalue = defaultParam.finalresult.fire.gr;
        currentParam.parentObject = 'Final Result';
        currentParam.readValue = function() {
            userParam.finalresult.fire.gr = this.value;
        }
        convertedParam.data.push(currentParam);

        //Previous years
        var currentParam = {};
        currentParam.name = 'maxpreviousyears';
        currentParam.group = 'preferences';
        currentParam.title = texts.numberofpreviousyear;
        currentParam.type = 'string';
        currentParam.value = userParam.maxpreviousyears ? userParam.maxpreviousyears : '2';
        currentParam.defaultvalue = defaultParam.maxpreviousyears;
        currentParam.parentObject = 'Preferences';
        currentParam.readValue = function() {
            userParam.maxpreviousyears = this.value;
        }

        convertedParam.data.push(currentParam);

        //Number of decimals
        var currentParam = {};
        currentParam.name = 'numberofdecimals';
        currentParam.group = 'preferences';
        currentParam.title = texts.numberofdecimals;
        currentParam.type = 'string';
        currentParam.value = userParam.numberofdecimals ? userParam.numberofdecimals : '2';
        currentParam.defaultvalue = defaultParam.numberofdecimals;
        currentParam.parentObject = 'Preferences';
        currentParam.readValue = function() {
            userParam.numberofdecimals = this.value;
        }

        convertedParam.data.push(currentParam);

        //Include the Budget table in the analysis
        var currentParam = {};
        currentParam.name = 'includebudgettable';
        currentParam.group = 'preferences';
        currentParam.title = texts.includebudget;
        currentParam.type = 'bool';
        currentParam.value = userParam.includebudgettable ? userParam.includebudgettable : userParam.includebudgettable;
        currentParam.defaultvalue = defaultParam.includebudgettable;
        currentParam.parentObject = 'Preferences';
        currentParam.readValue = function() {
            userParam.includebudgettable = this.value;
        }

        convertedParam.data.push(currentParam);

        //Include the Dupont elements tale in the analysis
        var currentParam = {};
        currentParam.name = 'includedupontanalysis';
        currentParam.group = 'preferences';
        currentParam.title = texts.includedupontanalysis;
        currentParam.type = 'bool';
        currentParam.value = userParam.includedupontanalysis ? userParam.includedupontanalysis : userParam.includedupontanalysis;
        currentParam.defaultvalue = defaultParam.includedupontanalysis;
        currentParam.parentObject = 'Preferences';
        currentParam.readValue = function() {
            userParam.includedupontanalysis = this.value;
        }

        convertedParam.data.push(currentParam);

        //Show the acronym column 
        var currentParam = {};
        currentParam.name = 'acronymcolumn';
        currentParam.group = 'preferences';
        currentParam.title = texts.showacronymcolumn;
        currentParam.type = 'bool';
        currentParam.value = userParam.acronymcolumn ? userParam.acronymcolumn : userParam.acronymcolumn;
        currentParam.defaultvalue = defaultParam.acronymcolumn;
        currentParam.parentObject = 'Preferences';
        currentParam.readValue = function() {
            userParam.acronymcolumn = this.value;
        }


        convertedParam.data.push(currentParam);

        //Show the formulas column 
        var currentParam = {};
        currentParam.name = 'formulascolumn';
        currentParam.group = 'preferences';
        currentParam.title = texts.showformulascolumn;
        currentParam.type = 'bool';
        currentParam.value = userParam.formulascolumn ? userParam.formulascolumn : userParam.formulascolumn;
        currentParam.defaultvalue = defaultParam.formulascolumn;
        currentParam.parentObject = 'Preferences';
        currentParam.readValue = function() {
            userParam.formulascolumn = this.value;
        }


        convertedParam.data.push(currentParam);

        //Number of employees (for the productivity ratios) 
        var currentParam = {};
        currentParam.name = 'numberofemployees';
        currentParam.group = 'preferences';
        currentParam.title = texts.averageemployees;
        currentParam.type = 'string';
        currentParam.value = userParam.numberofemployees ? userParam.numberofemployees : userParam.numberofemployees;
        currentParam.defaultvalue = defaultParam.numberofemployees;
        currentParam.parentObject = 'Company Information';
        currentParam.readValue = function() {
            userParam.numberofemployees = this.value;
        }

        convertedParam.data.push(currentParam);

        //ratios benchmarks
        // liquidity 1 benchmark
        var currentParam = {};
        currentParam.name = 'liq1benchmark';
        currentParam.group = 'benchmarks';
        currentParam.title = defaultParam.ratios.liquidityratios.liqu1.description;
        currentParam.type = 'string';
        currentParam.value = userParam.ratios.liquidityratios.liqu1.value ? userParam.ratios.liquidityratios.liqu1.value : '';
        currentParam.defaultvalue = defaultParam.ratios.liquidityratios.liqu1.value;
        currentParam.parentObject = 'Liquidity';
        currentParam.readValue = function() {
            userParam.ratios.liquidityratios.liqu1.value = this.value;
        }
        convertedParam.data.push(currentParam);

        // liquidity 2 benchmark
        var currentParam = {};
        currentParam.name = 'liq2benchmark';
        currentParam.group = 'benchmarks';
        currentParam.title = defaultParam.ratios.liquidityratios.liqu2.description;
        currentParam.type = 'string';
        currentParam.value = userParam.ratios.liquidityratios.liqu2.value ? userParam.ratios.liquidityratios.liqu2.value : '';
        currentParam.defaultvalue = defaultParam.ratios.liquidityratios.liqu2.value;
        currentParam.parentObject = 'Liquidity';
        currentParam.readValue = function() {
            userParam.ratios.liquidityratios.liqu2.value = this.value;
        }
        convertedParam.data.push(currentParam);

        // liquidity 3 benchmark
        var currentParam = {};
        currentParam.name = 'liq3benchmark';
        currentParam.group = 'benchmarks';
        currentParam.title = defaultParam.ratios.liquidityratios.liqu3.description;
        currentParam.type = 'string';
        currentParam.value = userParam.ratios.liquidityratios.liqu3.value ? userParam.ratios.liquidityratios.liqu3.value : '';
        currentParam.defaultvalue = defaultParam.ratios.liquidityratios.liqu3.value;
        currentParam.parentObject = 'Liquidity';
        currentParam.readValue = function() {
            userParam.ratios.liquidityratios.liqu3.value = this.value;
        }
        convertedParam.data.push(currentParam);

        // net current asset benchmark
        var currentParam = {};
        currentParam.name = 'netcurrassbenchmark';
        currentParam.group = 'benchmarks';
        currentParam.title = defaultParam.ratios.liquidityratios.netcurrass.description;
        currentParam.type = 'string';
        currentParam.value = userParam.ratios.liquidityratios.netcurrass.value ? userParam.ratios.liquidityratios.netcurrass.value : '';
        currentParam.defaultvalue = defaultParam.ratios.liquidityratios.netcurrass.value;
        currentParam.parentObject = 'Liquidity';
        currentParam.readValue = function() {
            userParam.ratios.liquidityratios.netcurrass.value = this.value;
        }
        convertedParam.data.push(currentParam);

        // degree of circulating assets benchmark
        var currentParam = {};
        currentParam.name = 'cirractbenchmark';
        currentParam.group = 'benchmarks';
        currentParam.title = defaultParam.ratios.leverageratios.cirract.description;
        currentParam.type = 'string';
        currentParam.value = userParam.ratios.leverageratios.cirract.value ? userParam.ratios.leverageratios.cirract.value : '';
        currentParam.defaultvalue = defaultParam.ratios.leverageratios.cirract.value;
        currentParam.parentObject = 'Leverage';
        currentParam.readValue = function() {
            userParam.ratios.leverageratios.cirract.value = this.value;
        }
        convertedParam.data.push(currentParam);

        // degree of fixed asset benchmark
        var currentParam = {};
        currentParam.name = 'fixassbenchmark';
        currentParam.group = 'benchmarks';
        currentParam.title = defaultParam.ratios.leverageratios.fixass.description;
        currentParam.type = 'string';
        currentParam.value = userParam.ratios.leverageratios.fixass.value ? userParam.ratios.leverageratios.fixass.value : '';
        currentParam.defaultvalue = defaultParam.ratios.leverageratios.fixass.value;
        currentParam.parentObject = 'Leverage';
        currentParam.readValue = function() {
            userParam.ratios.leverageratios.fixass.value = this.value;
        }
        convertedParam.data.push(currentParam);

        // level of debt benchmark
        var currentParam = {};
        currentParam.name = 'lvldebbenchmark';
        currentParam.group = 'benchmarks';
        currentParam.title = defaultParam.ratios.leverageratios.lvldeb.description;
        currentParam.type = 'string';
        currentParam.value = userParam.ratios.leverageratios.lvldeb.value ? userParam.ratios.leverageratios.lvldeb.value : '';
        currentParam.defaultvalue = defaultParam.ratios.leverageratios.lvldeb.value;
        currentParam.parentObject = 'Leverage';
        currentParam.readValue = function() {
            userParam.ratios.leverageratios.lvldeb.value = this.value;
        }
        convertedParam.data.push(currentParam);

        // level of equity finance benchmark
        var currentParam = {};
        currentParam.name = 'lvlequbenchmark';
        currentParam.group = 'benchmarks';
        currentParam.title = defaultParam.ratios.leverageratios.lvlequ.description;
        currentParam.type = 'string';
        currentParam.value = userParam.ratios.leverageratios.lvlequ.value ? userParam.ratios.leverageratios.lvlequ.value : '';
        currentParam.defaultvalue = defaultParam.ratios.leverageratios.lvlequ.value;
        currentParam.parentObject = 'Leverage';
        currentParam.readValue = function() {
            userParam.ratios.leverageratios.lvlequ.value = this.value;
        }
        convertedParam.data.push(currentParam);

        // level of self leverage benchmark
        var currentParam = {};
        currentParam.name = 'lvlselbenchmark';
        currentParam.group = 'benchmarks';
        currentParam.title = defaultParam.ratios.leverageratios.lvlsel.description;
        currentParam.type = 'string';
        currentParam.value = userParam.ratios.leverageratios.lvlsel.value ? userParam.ratios.leverageratios.lvlsel.value : '';
        currentParam.defaultvalue = defaultParam.ratios.leverageratios.lvlsel.value;
        currentParam.parentObject = 'Leverage';
        currentParam.readValue = function() {
            userParam.ratios.leverageratios.lvlsel.value = this.value;
        }
        convertedParam.data.push(currentParam);

        // coverage of fixed assets benchmark
        var currentParam = {};
        currentParam.name = 'covfixbenchmark';
        currentParam.group = 'benchmarks';
        currentParam.title = defaultParam.ratios.leverageratios.covfix.description;
        currentParam.type = 'string';
        currentParam.value = userParam.ratios.leverageratios.covfix.value ? userParam.ratios.leverageratios.covfix.value : '';
        currentParam.defaultvalue = defaultParam.ratios.leverageratios.covfix.value;
        currentParam.parentObject = 'Leverage';
        currentParam.readValue = function() {
            userParam.ratios.leverageratios.covfix.value = this.value;
        }
        convertedParam.data.push(currentParam);

        // roe benchmark
        var currentParam = {};
        currentParam.name = 'roebenchmark';
        currentParam.group = 'benchmarks';
        currentParam.title = userParam.ratios.profitabilityratios.profroe.description ? userParam.ratios.profitabilityratios.profroe.description : defaultParam.ratios.profitabilityratios.profroe.description;
        currentParam.type = 'string';
        currentParam.value = userParam.ratios.profitabilityratios.profroe.value ? userParam.ratios.profitabilityratios.profroe.value : '';
        currentParam.defaultvalue = defaultParam.ratios.profitabilityratios.profroe.value;
        currentParam.parentObject = 'Profitability';
        currentParam.readValue = function() {
            userParam.ratios.profitabilityratios.profroe.value = this.value;
        }
        convertedParam.data.push(currentParam);

        // roi benchmark
        var currentParam = {};
        currentParam.name = 'roibenchmark';
        currentParam.group = 'benchmarks';
        currentParam.title = defaultParam.ratios.profitabilityratios.profroi.description;
        currentParam.type = 'string';
        currentParam.value = userParam.ratios.profitabilityratios.profroi.value ? userParam.ratios.profitabilityratios.profroi.value : '';
        currentParam.defaultvalue = defaultParam.ratios.profitabilityratios.profroi.value;
        currentParam.parentObject = 'Profitability';
        currentParam.readValue = function() {
            userParam.ratios.profitabilityratios.profroi.value = this.value;
        }
        convertedParam.data.push(currentParam)


        // ros benchmark
        var currentParam = {};
        currentParam.name = 'rosbenchmark';
        currentParam.group = 'benchmarks';
        currentParam.title = defaultParam.ratios.profitabilityratios.profros.description;
        currentParam.type = 'string';
        currentParam.value = userParam.ratios.profitabilityratios.profros.value ? userParam.ratios.profitabilityratios.profros.value : '';
        currentParam.defaultvalue = defaultParam.ratios.profitabilityratios.profros.value;
        currentParam.parentObject = 'Profitability';
        currentParam.readValue = function() {
            userParam.ratios.profitabilityratios.profros.value = this.value;
        }
        convertedParam.data.push(currentParam)

        // mol benchmark
        var currentParam = {};
        currentParam.name = 'molbenchmark';
        currentParam.group = 'benchmarks';
        currentParam.title = defaultParam.ratios.profitabilityratios.profmol.description;
        currentParam.type = 'string';
        currentParam.value = userParam.ratios.profitabilityratios.profmol.value ? userParam.ratios.profitabilityratios.profmol.value : '';
        currentParam.defaultvalue = defaultParam.ratios.profitabilityratios.profmol.value;
        currentParam.parentObject = 'Profitability';
        currentParam.readValue = function() {
            userParam.ratios.profitabilityratios.profmol.value = this.value;
        }
        convertedParam.data.push(currentParam)

        // Ebit Margin benchmark
        var currentParam = {};
        currentParam.name = 'ebmbenchmark';
        currentParam.group = 'benchmarks';
        currentParam.title = defaultParam.ratios.profitabilityratios.profebm.description;
        currentParam.type = 'string';
        currentParam.value = userParam.ratios.profitabilityratios.profebm.value ? userParam.ratios.profitabilityratios.profebm.value : '';
        currentParam.defaultvalue = defaultParam.ratios.profitabilityratios.profebm.value;
        currentParam.parentObject = 'Profitability';
        currentParam.readValue = function() {
            userParam.ratios.profitabilityratios.profebm.value = this.value;
        }
        convertedParam.data.push(currentParam)

        // Profit Margin benchmark
        var currentParam = {};
        currentParam.name = 'monbenchmark';
        currentParam.group = 'benchmarks';
        currentParam.title = defaultParam.ratios.profitabilityratios.profmon.description;
        currentParam.type = 'string';
        currentParam.value = userParam.ratios.profitabilityratios.profmon.value ? userParam.ratios.profitabilityratios.profmon.value : '';
        currentParam.defaultvalue = defaultParam.ratios.profitabilityratios.profmon.value;
        currentParam.parentObject = 'Profitability';
        currentParam.readValue = function() {
            userParam.ratios.profitabilityratios.profmon.value = this.value;
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
     * @Param {object} data: the data object created thanks to loadData methods, containing the values and the sums of the paramters recovered from the dialog.
     * @Param {object} CalculatedData: the object returned by the CalculateData method containing the values of the calculated elements.
     * @Param {object} index: the object returned by the CalculateIndex method containing the values of the calculated indexes.
     * @returns an object containing the data for the dupont table
     */
    createDupontData(data, CalculatedData, index) {
        var texts = this.initFinancialAnalysisTexts();

        var Dupont = {};

        var sales = CalculatedData.TotSales;
        var currentasset = CalculatedData.CurrentAsset;
        var fixedasset = CalculatedData.FixedAsset;
        var ebit = CalculatedData.Ebit;
        var roi = index.red.roi.amount;

        /*profit or ebit (ebit is used for economic analysis)
         */
        Dupont.ebit = {};
        Dupont.ebit.description = texts.ebit;
        Dupont.ebit.type = "dec";
        Dupont.ebit.amount = ebit;

        //sales (for MOL)
        Dupont.molsales = {};
        Dupont.molsales.description = texts.salesturnover;
        Dupont.molsales.type = "dec";
        Dupont.molsales.amount = sales;

        //MOL (EBIT MARGIN)
        Dupont.mol = {};
        Dupont.mol.description = texts.mol;
        Dupont.mol.type = "perc";
        Dupont.mol.amount = Banana.SDecimal.divide(Dupont.ebit.amount, Dupont.molsales.amount, { 'decimals': this.dialogparam.numberofdecimals });

        //sales (for ROT)
        Dupont.rotsales = {};
        Dupont.rotsales.description = texts.salesturnover;
        Dupont.rotsales.type = "dec";
        Dupont.rotsales.amount = sales;

        //Total Asset
        Dupont.totalasset = {};
        Dupont.totalasset.description = texts.totalasset;
        Dupont.totalasset.type = "dec";
        Dupont.totalasset.amount = Banana.SDecimal.add(currentasset, fixedasset);

        //ROT
        Dupont.rot = {};
        Dupont.rot.description = texts.rot;
        Dupont.rot.type = "perc";
        Dupont.rot.amount = Banana.SDecimal.divide(Dupont.rotsales.amount, Dupont.totalasset.amount, { 'decimals': this.dialogparam.numberofdecimals });

        //  ROI
        Dupont.roi = {};
        Dupont.roi.description = texts.dupontroi;
        Dupont.roi.amount = roi;

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
        X1 = Current Asset / Total Asset
        X2 = Reserves and Profit/ Total Asset
        X3 = EBIT / Total Asset
        X4 = Net Assets / Total liabilities and Equitiy
        X5 = Sales / Total Asset
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

    isBananaAdvanced() {
        // Starting from version 10.0.7 it is possible to read the property Banana.application.license.isWithinMaxRowLimits 
        // to check if all application functionalities are permitted
        // the version Advanced returns isWithinMaxRowLimits always false
        // other versions return isWithinMaxRowLimits true if the limit of transactions number has not been reached

        if (Banana.compareVersion && Banana.compareVersion(Banana.application.version, "10.0.7") >= 0) {
            var license = Banana.application.license;
            if (license.licenseType === "advanced" || license.isWithinMaxFreeLines) {
                return true;
            }
        }

        return false;
    }

    bananaRequiredVersion(requiredVersion, expmVersion) {
        /**
         * Check Banana version
         */
        if (expmVersion) {
            requiredVersion = requiredVersion + "." + expmVersion;
        }
        if (Banana.compareVersion && Banana.compareVersion(Banana.application.version, requiredVersion) >= 0) {
            return true;
        }
        return false;
    }

    /**
     * @description checks the software version, only works with the latest version: 10.0, if the version is not the latest
     * shows an error message
     */

    verifyBananaVersion() {
        if (!this.banDocument)
            return false;

        var lang = this.getLang();

        var BAN_VERSION_MIN = "10.0.7";
        var BAN_DEV_VERSION_MIN = "";
        var CURR_VERSION = this.bananaRequiredVersion(BAN_VERSION_MIN, BAN_DEV_VERSION_MIN);
        var CURR_LICENSE = this.isBananaAdvanced();

        if (CURR_VERSION === "false") {
            Banana.console.debug("is Compatible: " + CURR_VERSION);
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
        if (CURR_LICENSE === 'false') {
            var msg = this.getErrorMessage(this.ID_ERR_LICENSE_NOTVALID, lang);
            this.banDocument.addMessage(msg, this.ID_ERR_LICENSE_NOTVALID);
            return false;
        }
        return true;
    }

    /**
     * Update the old version Dialogparams (version 1.0) with the new version Dialogparams (1.1)
     * @param {*} oldparams 
     * @param {*} newparams 
     */
    UpdateOldtoNewParams(oldparams, newparams) {
        var updatedparams = {};
        Banana.console.debug(JSON.stringify(oldparams));
        /******************************************************* */
        Banana.console.debug(JSON.stringify(newparams));


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

        this.UpdateOldtoNewParams(defaultParam, this.dialogparam);

        if (!this.dialogparam || this.dialogparam.version < defaultParam.version) {

            //change the parameters with those defined in the new version(26.01.2021: 1.0-->1.1)
            //this.dialogparam = this.UpdateOldtoNewParams(defaultParam, this.dialogparam);
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
    checkNonExistentGroupsOrAccounts(convertedParam) {
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
 * Validate the Params in the setting Dialog
 * @Param {*} params 
 */

function validateParams(params) {
    var financialStatementAnalysis = new FinancialStatementAnalysis(Banana.document);
    return financialStatementAnalysis.checkNonExistentGroupsOrAccounts(params);
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