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
// @api = 1.1
// @id = financialStatementAnalysis.js
// @description = Financial Reports
// @task = app.command
// @doctype = 100.*
// @publisher = Banana.ch SA
// @pubdate = 2021-11-03
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
        this.docInfo = this.getDocumentInfo();
        this.dialogparam = this.initDialogParam();
        this.controlsums_differences = 0;
        this.with_budget = this.banDocument.info("Budget", "TableNameXml");
        this.projection_start_date = "";
        this.fileGroups = this.loadGroups();
        this.fileAccounts = this.loadAccounts();

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

    printReportAdd_TableBalance(report) {
        var headerStyle = this.getColorStyle("styleTablesHeaderText");
        var texts = this.getFinancialAnalysisTexts();
        var tableBalance = report.addTable('myTableBalance');
        tableBalance.getCaption().addText(texts.upperbalance, "styleTitles");
        //columns
        if (this.dialogparam.acronymcolumn) {
            tableBalance.addColumn("acronym").setStyleAttributes("width:12%");
        }
        tableBalance.addColumn("Description").setStyleAttributes("width:40%");
        this.setColumnsWidthDinamically(tableBalance);

        // header
        var tableHeader = tableBalance.getHeader();
        var tableRow = tableHeader.addRow();
        if (this.dialogparam.acronymcolumn) {
            tableRow.addCell(texts.acronym, headerStyle);
        }
        tableRow.addCell(texts.description, headerStyle);
        this.generateHeaderColumns(tableRow);

        return tableBalance;
    }

    /**
     * Takes as parameter the default style in the css (or anchor) of any element to which a colour is applied in the report, 
     * if the without_colors parameter is false, 
     * it simply returns the same style, otherwise it returns a similar style but without the color, 
     * so the report elements concerned will be applied a default style without any colour
     * @param {*} normalStyle 
     */
    getColorStyle(normalStyle) {
        let styleWithoutColor = "";

        if (this.dialogparam.without_colors) {
            switch (normalStyle) {
                //headers
                case "styleTablesHeaderText":
                    styleWithoutColor = "styleTablesHeaderText_withoutColor";
                    return styleWithoutColor;
                    //Altman index performance indicators colors
                case "styleZIndexLow":
                    styleWithoutColor = "styleZIndexLow_withoutColor";
                    return styleWithoutColor;
                case "styleZIndexMid":
                    styleWithoutColor = "styleZIndexMid_withoutColor";
                    return styleWithoutColor;
                case "styleZIndexProb":
                    styleWithoutColor = "styleZIndexProb_withoutColor";
                    return styleWithoutColor;
                    //assets and liabilities 
                case "styleAssetsAdjustments":
                    styleWithoutColor = "styleAssetsAdjustments_withoutColor";
                    return styleWithoutColor;
                case "styleLiabilitiesAdjustments":
                    styleWithoutColor = "styleLiabilitiesAdjustments_withoutColor";
                    return styleWithoutColor;
                    //totals
                case "styleTotalAmount":
                    styleWithoutColor = "styleTotalAmount_withoutColor";
                    return styleWithoutColor;
                case "styleTitlesTotalAmount":
                    styleWithoutColor = "styleTitlesTotalAmount_withoutColor";
                    return styleWithoutColor;

            }
        } else {
            return normalStyle;
        }
    }

    printReportAdd_TableConCe(report) {
        var headerStyle = this.getColorStyle("styleTablesHeaderText");
        var texts = this.getFinancialAnalysisTexts();
        var tableConCe = report.addTable('myConTableCe');
        tableConCe.getCaption().addText(texts.upperprofitandloss, "styleTitles");
        //columns
        if (this.dialogparam.acronymcolumn) {
            tableConCe.addColumn("acronym").setStyleAttributes("width:12%");
        }
        tableConCe.addColumn("Description").setStyleAttributes("width:40%");

        this.setColumnsWidthDinamically(tableConCe);

        //header
        var tableHeader = tableConCe.getHeader();
        var tableRow = tableHeader.addRow();
        if (this.dialogparam.acronymcolumn) {
            tableRow.addCell(texts.acronym, headerStyle);
        }
        tableRow.addCell(texts.description, headerStyle);
        this.generateHeaderColumns(tableRow);
        return tableConCe;
    }

    printReportAdd_TableControlSums(report) {
        var headerStyle = this.getColorStyle("styleTablesHeaderText");
        var texts = this.getFinancialAnalysisTexts();
        var tableBalanceSumsControl = report.addTable('myTableBalanceSumsControl');
        tableBalanceSumsControl.getCaption().addText(texts.controlsums, "styleTitles");
        // header
        var tableHeader = tableBalanceSumsControl.getHeader();
        var tableRow = tableHeader.addRow();
        tableRow.addCell(texts.year, headerStyle);
        tableRow.addCell(texts.accountingtotal, headerStyle);
        tableRow.addCell(texts.calculatedtotal, headerStyle);
        tableRow.addCell(texts.difference, headerStyle);
        return tableBalanceSumsControl;
    }

    printReportAdd_TableIndliq(report) {
        var headerStyle = this.getColorStyle("styleTablesHeaderText");
        var texts = this.getFinancialAnalysisTexts();
        var tableIndliq = report.addTable('myIndliqTable');
        tableIndliq.getCaption().addText(texts.upperliquidityratios, "styleTitles");
        tableIndliq.addColumn("Description").setStyleAttributes("width:25%");
        tableIndliq.addColumn("formula").setStyleAttributes("width:15%");
        if (this.dialogparam.formulascolumn) {
            tableIndliq.addColumn("benchmark").setStyleAttributes("width:10%");
        }
        this.setColumnsWidthDinamically(tableIndliq);
        // header
        var tableHeader = tableIndliq.getHeader();
        var tableRow = tableHeader.addRow();
        tableRow.addCell(texts.description, headerStyle);
        if (this.dialogparam.formulascolumn) {
            tableRow.addCell(texts.formula, headerStyle);
        }
        tableRow.addCell(texts.benchmark, headerStyle);
        this.generateHeaderColumns(tableRow);
        return tableIndliq;
    }
    printReportAdd_TableIndlev(report) {
        var headerStyle = this.getColorStyle("styleTablesHeaderText");
        var texts = this.getFinancialAnalysisTexts();
        var tableIndlev = report.addTable('myIndlevTable');
        tableIndlev.setStyleAttributes("width:100%");
        tableIndlev.getCaption().addText(texts.upperleverageratios, "styleTitles");
        tableIndlev.addColumn("Description").setStyleAttributes("width:25%");
        tableIndlev.addColumn("formula").setStyleAttributes("width:15%");
        if (this.dialogparam.formulascolumn) {
            tableIndlev.addColumn("benchmark").setStyleAttributes("width:10%");
        }

        this.setColumnsWidthDinamically(tableIndlev);
        // header
        var tableHeader = tableIndlev.getHeader();
        var tableRow = tableHeader.addRow();
        tableRow.addCell(texts.description, headerStyle);
        if (this.dialogparam.formulascolumn) {
            tableRow.addCell(texts.formula, headerStyle);
        }
        tableRow.addCell(texts.benchmark, headerStyle);
        this.generateHeaderColumns(tableRow);
        return tableIndlev;
    }
    printReportAdd_TableIndprof(report) {
        var headerStyle = this.getColorStyle("styleTablesHeaderText");
        var texts = this.getFinancialAnalysisTexts();
        var tableIndprof = report.addTable('myIndprofTable');
        tableIndprof.setStyleAttributes("width:100%");
        tableIndprof.getCaption().addText(texts.upperprofitabilityratios, "styleTitles");
        tableIndprof.addColumn("Description").setStyleAttributes("width:25%");
        tableIndprof.addColumn("formula").setStyleAttributes("width:15%");
        if (this.dialogparam.formulascolumn) {
            tableIndprof.addColumn("benchmark").setStyleAttributes("width:10%");
        }
        this.setColumnsWidthDinamically(tableIndprof);

        // header
        var tableHeader = tableIndprof.getHeader();
        var tableRow = tableHeader.addRow();
        tableRow.addCell(texts.description, headerStyle);
        if (this.dialogparam.formulascolumn) {
            tableRow.addCell(texts.formula, headerStyle);
        }
        tableRow.addCell(texts.benchmark, headerStyle);
        this.generateHeaderColumns(tableRow);
        return tableIndprof;
    }

    printReportAdd_TableIndeff(report) {
        var headerStyle = this.getColorStyle("styleTablesHeaderText");
        var texts = this.getFinancialAnalysisTexts();
        var tableIndeff = report.addTable('myIndeffTable');
        tableIndeff.setStyleAttributes("width:100%");
        tableIndeff.getCaption().addText(texts.upperefficiancyratios, "styleTitles");
        tableIndeff.addColumn("Description").setStyleAttributes("width:25%");
        tableIndeff.addColumn("formula").setStyleAttributes("width:15%");
        if (this.dialogparam.formulascolumn) {
            tableIndeff.addColumn("benchmark").setStyleAttributes("width:10%");
        }
        this.setColumnsWidthDinamically(tableIndeff);

        // header
        var tableHeader = tableIndeff.getHeader();
        var tableRow = tableHeader.addRow();
        tableRow.addCell(texts.description, headerStyle);
        if (this.dialogparam.formulascolumn) {
            tableRow.addCell(texts.formula, headerStyle);
        }
        tableRow.addCell(texts.benchmark, headerStyle);
        this.generateHeaderColumns(tableRow);

        return tableIndeff;
    }

    printReportAdd_TableCashflow(report) {
        var headerStyle = this.getColorStyle("styleTablesHeaderText");
        var texts = this.getFinancialAnalysisTexts();
        var tableCashflow = report.addTable('myTableCashflow');
        tableCashflow.getCaption().addText(texts.uppercashflow, "styleTitles");
        //columns
        if (this.dialogparam.acronymcolumn) {
            tableCashflow.addColumn("acronym").setStyleAttributes("width:12%");
        }
        tableCashflow.addColumn("Description").setStyleAttributes("width:50%");

        this.setColumnsWidthDinamically(tableCashflow);

        // header
        var tableHeader = tableCashflow.getHeader();
        var tableRow = tableHeader.addRow();
        if (this.dialogparam.acronymcolumn) {
            tableRow.addCell(texts.acronym, headerStyle);
        }
        tableRow.addCell(texts.description, headerStyle);
        this.generateHeaderColumns(tableRow);
        return tableCashflow;
    }

    printReportAdd_TableCashflowVerification(report) {
        var tableCashflowVerif = report.addTable('myTableCashflowVerif');
        //columns
        if (this.dialogparam.acronymcolumn) {
            tableCashflowVerif.addColumn("acronym").setStyleAttributes("width:12%");
        }
        tableCashflowVerif.addColumn("Description").setStyleAttributes("width:50%");

        this.setColumnsWidthDinamically(tableCashflowVerif);

        // header
        return tableCashflowVerif;
    }

    printReportAdd_TableRetainedEarnings(report) {
        var headerStyle = this.getColorStyle("styleTablesHeaderText");
        var texts = this.getFinancialAnalysisTexts();
        var tableRetainedEarnings = report.addTable('myRetainedEarningsTable');
        tableRetainedEarnings.setStyleAttributes("width:100%");
        tableRetainedEarnings.getCaption().addText(texts.retainedEarnings, "styleTitles");
        tableRetainedEarnings.addColumn("Description").setStyleAttributes("width:50%");

        this.setColumnsWidthDinamically(tableRetainedEarnings);

        // header
        var tableHeader = tableRetainedEarnings.getHeader();
        var tableRow = tableHeader.addRow();
        tableRow.addCell(texts.description, headerStyle);
        this.generateHeaderColumns(tableRow);
        return tableRetainedEarnings;
    }

    printReportAdd_TableIndCashflow(report) {
        var headerStyle = this.getColorStyle("styleTablesHeaderText");
        var texts = this.getFinancialAnalysisTexts();
        var tableIndCashflow = report.addTable('myIndCashflowTable');
        tableIndCashflow.setStyleAttributes("width:100%");
        tableIndCashflow.getCaption().addText(texts.uppercashflowratios, "styleTitles");
        tableIndCashflow.addColumn("Description").setStyleAttributes("width:25%");
        tableIndCashflow.addColumn("formula").setStyleAttributes("width:15%");
        if (this.dialogparam.formulascolumn) {
            tableIndCashflow.addColumn("benchmark").setStyleAttributes("width:10%");
        }

        this.setColumnsWidthDinamically(tableIndCashflow);

        // header
        var tableHeader = tableIndCashflow.getHeader();
        var tableRow = tableHeader.addRow();
        tableRow.addCell(texts.description, headerStyle);
        if (this.dialogparam.formulascolumn) {
            tableRow.addCell(texts.formula, headerStyle);
        }
        tableRow.addCell(texts.benchmark, headerStyle);
        this.generateHeaderColumns(tableRow);
        return tableIndCashflow;
    }

    printReportAdd_TableDupont(report) {
        var headerStyle = this.getColorStyle("styleTablesHeaderText");
        var texts = this.getFinancialAnalysisTexts();
        var tableDupont = report.addTable('myDupontTable');
        tableDupont.getCaption().addText(texts.upperdupontscheme, "styleTitles");
        tableDupont.addColumn("Description").setStyleAttributes("width:30%");
        this.setColumnsWidthDinamically(tableDupont);

        //header
        var tableHeader = tableDupont.getHeader();
        var tableRow = tableHeader.addRow();
        tableRow.addCell(texts.description, headerStyle);
        this.generateHeaderColumns(tableRow);

        return tableDupont;
    }

    printReportAdd_TableAltmanZScoreIndex(report) {
        var headerStyle = this.getColorStyle("styleTablesHeaderText");
        var texts = this.getFinancialAnalysisTexts();
        var tableAltmanIndex = report.addTable('myTableAltmanZScoreIndex');
        tableAltmanIndex.setStyleAttributes("width:100%");
        tableAltmanIndex.getCaption().addText(texts.upperaltmanindex, "styleTitles");
        //columns
        tableAltmanIndex.addColumn("Description").setStyleAttributes("width:45%");
        if (this.dialogparam.formulascolumn) {
            tableAltmanIndex.addColumn("Formula").setStyleAttributes("width:55%");
        }
        tableAltmanIndex.addColumn("Weighting").setStyleAttributes("width:15%");
        this.setColumnsWidthDinamically(tableAltmanIndex);
        // header
        var tableHeader = tableAltmanIndex.getHeader();
        var tableRow = tableHeader.addRow();
        tableRow.addCell(texts.description, headerStyle);
        if (this.dialogparam.formulascolumn) {
            tableRow.addCell(texts.formula, headerStyle);
        }
        tableRow.addCell(texts.weighting, headerStyle);
        this.generateHeaderColumns(tableRow);
        return tableAltmanIndex;

    }

    printReportAdd_TableZScorePrivateCompanies(report) {
        var headerStyle = this.getColorStyle("styleTablesHeaderText");
        var texts = this.getFinancialAnalysisTexts();
        var tableAltmanIndexPC = report.addTable('myTableZScorePrivateCompanies');
        tableAltmanIndexPC.getCaption().addText(texts.upperzscoreprivatecompanies, "styleTitles");
        tableAltmanIndexPC.addColumn("Description").setStyleAttributes("width:45%");
        if (this.dialogparam.formulascolumn) {
            tableAltmanIndexPC.addColumn("Formula").setStyleAttributes("width:55%");
        }
        tableAltmanIndexPC.addColumn("Weighting").setStyleAttributes("width:15%");
        this.setColumnsWidthDinamically(tableAltmanIndexPC);
        // header
        var tableHeader = tableAltmanIndexPC.getHeader();
        var tableRow = tableHeader.addRow();
        tableRow.addCell(texts.description, headerStyle);
        if (this.dialogparam.formulascolumn) {
            tableRow.addCell(texts.formula, headerStyle);
        }
        tableRow.addCell(texts.weighting, headerStyle);
        this.generateHeaderColumns(tableRow);
        return tableAltmanIndexPC;

    }

    generateHeaderColumns(tableRow) {
        var headerStyle = this.getColorStyle("styleTablesHeaderText");
        var texts = this.getFinancialAnalysisTexts();
        for (var i = this.data.length - 1; i >= 0; i--) {
            var year = this.data[i].period.EndDate;
            var periodType = this.data[i].period.Type;
            switch (periodType) {
                //previous year
                case "PY":
                    year = year.substr(0, 4);
                    break;
                    //current year (to date)
                case "CY":
                    year = texts.year_to_date;
                    break;
                    //current year projection
                case "CYP":
                    year = texts.year_projection;
                    break;
                    //budget
                case "B":
                    year = texts.budget;
                    break;
                    //budget to date
                case "BTD":
                    year = texts.budget_to_date;
                    break;
                    //budget differences complete
                case "BDC":
                    year = texts.budget_differences_complete;
                    break;
                    //budget differences to date
                case "BDT":
                    year = texts.budget_differences_todate;
                    break;
            }
            tableRow.addCell(year, headerStyle);
        }
    }

    setColumnsWidthDinamically(table) {
        var width = 110;
        if (this.data.length > 0)
            width = width / parseInt(this.data.length);
        for (var i = 0; i < this.data.length; i++) {
            table.addColumn("year").setStyleAttributes("width:" + width.toString() + "%");
        }

        return width;
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
    setIndexEvolution(indexT1, indexT2, cell, periodType) {
        //var rateOfGrowth = this.setRateOfGrowth(indexT1, indexT2);
        var evolution = Banana.SDecimal.compare(indexT1, indexT2)
        var up = '↑';
        var down = '↓';
        var equal = '↔';
        if (periodType !== "BDT" && periodType !== "BDC" && periodType !== "CYP") {
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
        return true;
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
     * Return a value for the span used in the Balance titles (Assets, Liabilities and Equity).
     * @returns 
     */
    generateSpanForBalanceTitles() {
        let span = "";
        if (this.dialogparam.includebudgettable && this.with_budget)
            span = 1;
        else
            span = 0;
        for (var i = this.data.length; i >= 0; i--) {
            span++
        }
        if (this.dialogparam.acronymcolumn) {
            span += 1;
        }
        return span;
    }

    /**
     * @description set the header of the report.
     * @Param {object} report: the report created
     */
    addHeader(report, styleSheet) {
        let texts = this.getFinancialAnalysisTexts();
        let company = "";
        let address1 = "";
        let city = "";
        let headerSx = "";
        var headerParagraph = report.getHeader().addSection();
        if (this.dialogparam.printlogo) {
            headerParagraph = report.addSection("");
            var logoFormat = Banana.Report.logoFormat(this.dialogparam.logoname); //Logo
            if (logoFormat) {
                var logoElement = logoFormat.createDocNode(headerParagraph, styleSheet, "logo");
                report.getHeader().addChild(logoElement);
            } else {
                headerParagraph.addClass("header_text");
            }

        } else {
            headerParagraph.addClass("header_text");
        }

        if (this.dialogparam.pageheader) {
            if (this.docInfo) {
                company = this.docInfo.company;
                address1 = this.docInfo.address1;
                city = this.docInfo.City;
                headerSx = this.docInfo.headerLeft;

                if (company !== "") {
                    headerParagraph.addParagraph(company, "header_row_company_name");
                    headerParagraph.addParagraph(address1, "header_row_address");
                    headerParagraph.addParagraph(city, "header_row_address");
                } else {
                    headerParagraph.addParagraph(headerSx, "header_row_company_name");
                }

            }
        }

        //add the reference date choose as current date
        var budgetToDate = "";
        if (this.dialogparam.includebudget_todate) {
            budgetToDate = "/" + texts.budget_to_date;
        }

        headerParagraph.addParagraph(texts.year_to_date + budgetToDate + " ref: " +
            Banana.Converter.toLocaleDateFormat(Banana.Converter.toInternalDateFormat(this.dialogparam.currentdate, 'yyyymmdd')), "header_row_address");
        headerParagraph.excludeFromTest();
    }

    /**
     * @description set the footer of the report.
     * @Param {object} report: the report created
     */
    addFooter(report) {
        let date = new Date();
        let footer = report.getFooter();
        footer.addParagraph(Banana.Converter.toLocaleDateFormat(date), "footer_left");
        footer.addParagraph("", "footer_right").addFieldPageNr("footer right");
        footer.excludeFromTest();

    }

    /**
     * @description this method do the following things:
     * -call some other methods to recover the neccesary values
     * -print the tables and others report elements entering the different data.
     * -set the cells and the rows values
     * @returns a report object.
     */
    printReport(styleSheet) {

        //Banana.console.debug(JSON.stringify(this.data));

        /******************************************************************************************
         * initialize the variables i will use frequently in this method
         * ***************************************************************************************/

        var texts = this.getFinancialAnalysisTexts();
        var report = Banana.Report.newReport('Financial Statement Analysis Report');

        var analsysisYears = this.data.length;
        analsysisYears -= 1;
        var cell = "";
        var perc = "%";
        var amount = "";
        var description = "";
        var acronym = "";
        var ratios = "";
        var textstyle = "";
        var spanBalanceTitle = this.generateSpanForBalanceTitles();
        var styleAssetsAdjustments = this.getColorStyle("styleAssetsAdjustments");
        var styleLiabilitiesAdjustments = this.getColorStyle("styleLiabilitiesAdjustments");
        var styleTotalAmount = this.getColorStyle("styleTotalAmount");
        let styleTitlesTotalAmount = this.getColorStyle("styleTitlesTotalAmount");

        if (!this.data || this.data.length <= 0) {
            return report;
        }


        this.addHeader(report, styleSheet);
        this.addFooter(report);

        /******************************************************************************************
         * exporting liquidity
         * ***************************************************************************************/
        //this.exportingNegativeLiquidity();


        /******************************************************************************************
         * Add the balance table
         * ***************************************************************************************/
        var tableBalance = this.printReportAdd_TableBalance(report);
        //Assets title
        var tableRow = tableBalance.addRow("styleTablRows");
        tableRow.addCell(texts.assets, styleAssetsAdjustments, spanBalanceTitle);

        /******************************************************************************************
         * Add the current asset to the  balance table
         * ***************************************************************************************/
        for (var key in this.data[0].balance.ca) {
            var tableRow = tableBalance.addRow("styleTablRows");

            if (this.dialogparam.acronymcolumn) {
                acronym = this.data[0].balance.ca[key].acronym;
                tableRow.addCell(acronym);
            }
            description = this.data[0].balance.ca[key].description;
            if (texts[key])
                description = texts[key];
            tableRow.addCell(description);

            for (var i = this.data.length - 1; i >= 0; i--) {
                amount = this.toLocaleAmountFormat(this.data[i].balance.ca[key].balance);
                tableRow.addCell(amount, "styleNormalAmount");
            }
        }
        tableRow = tableBalance.addRow("styleTablRows");
        if (this.dialogparam.acronymcolumn) {
            tableRow.addCell(texts.currentassets_acronym, "styleUnderGroupTitles");
        }
        tableRow.addCell(texts.totalcurrentasset, 'styleUnderGroupTitles');
        for (var i = this.data.length - 1; i >= 0; i--) {
            tableRow.addCell(this.toLocaleAmountFormat(this.data[i].calculated_data.currentassets), "styleMidTotalAmount");
        }

        /******************************************************************************************
         * Add the fixed asset to the  balance table
         * ***************************************************************************************/
        for (var key in this.data[0].balance.fa) {
            var tableRow = tableBalance.addRow("styleTablRows");

            if (this.dialogparam.acronymcolumn) {
                acronym = this.data[0].balance.fa[key].acronym;
                tableRow.addCell(acronym);
            }

            description = this.data[0].balance.fa[key].description;
            if (texts[key])
                description = texts[key];
            tableRow.addCell(description);

            for (var i = this.data.length - 1; i >= 0; i--) {
                amount = this.toLocaleAmountFormat(this.data[i].balance.fa[key].balance);
                tableRow.addCell(amount, "styleNormalAmount");
            }
        }
        //add the total of fixed assets
        tableRow = tableBalance.addRow("styleTablRows");
        if (this.dialogparam.acronymcolumn) {
            tableRow.addCell(texts.fixedassets_acronym, "styleUnderGroupTitles");
        }
        tableRow.addCell(texts.totalfixedasset, 'styleUnderGroupTitles');
        for (var i = this.data.length - 1; i >= 0; i--) {
            tableRow.addCell(this.toLocaleAmountFormat(this.data[i].calculated_data.fixedassets), "styleMidTotalAmount");
        }

        /******************************************************************************************
         * Add the total asset to the balance table
         * ***************************************************************************************/
        var tableRow = tableBalance.addRow("styleTablRows");
        if (this.dialogparam.acronymcolumn) {
            tableRow.addCell(texts.totassets_acronym, styleTitlesTotalAmount);
        }
        tableRow.addCell(texts.totalasset, styleTitlesTotalAmount);
        for (var i = this.data.length - 1; i >= 0; i--) {
            tableRow.addCell(this.toLocaleAmountFormat(this.data[i].calculated_data.totalassets), styleTotalAmount);
        }

        //Liabilities and Equity title
        var tableRow = tableBalance.addRow("styleTablRows");
        tableRow.addCell(texts.liabilitiesandequity, styleLiabilitiesAdjustments, spanBalanceTitle);

        /******************************************************************************************
         * Add the Short term third capital to the balance table
         * ***************************************************************************************/
        for (var key in this.data[0].balance.stdc) {
            var tableRow = tableBalance.addRow("styleTablRows");

            if (this.dialogparam.acronymcolumn) {
                acronym = this.data[0].balance.stdc[key].acronym;
                tableRow.addCell(acronym);
            }

            description = this.data[0].balance.stdc[key].description;
            if (texts[key])
                description = texts[key];
            tableRow.addCell(description);

            for (var i = this.data.length - 1; i >= 0; i--) {
                amount = this.toLocaleAmountFormat(this.data[i].balance.stdc[key].balance);
                tableRow.addCell(amount, 'styleNormalAmount');
            }
        }
        //add the sum of the short term debt capital
        tableRow = tableBalance.addRow("styleTablRows");
        if (this.dialogparam.acronymcolumn) {
            tableRow.addCell(texts.shorttermdebtcapital_acronym, "styleUnderGroupTitles");
        }
        tableRow.addCell(texts.total_shorttermdebtcapital, 'styleUnderGroupTitles');
        for (var i = this.data.length - 1; i >= 0; i--) {
            tableRow.addCell(this.toLocaleAmountFormat(this.data[i].calculated_data.shorttermdebtcapital), "styleMidTotalAmount");
        }

        /******************************************************************************************
         * Add the Long term third capital to the balance table
         * ***************************************************************************************/
        for (var key in this.data[0].balance.ltdc) {
            var tableRow = tableBalance.addRow("styleTablRows");

            if (this.dialogparam.acronymcolumn) {
                acronym = this.data[0].balance.ltdc[key].acronym;
                tableRow.addCell(acronym);
            }

            description = this.data[0].balance.ltdc[key].description;
            if (texts[key])
                description = texts[key];
            tableRow.addCell(description);

            for (var i = this.data.length - 1; i >= 0; i--) {
                amount = this.toLocaleAmountFormat(this.data[i].balance.ltdc[key].balance);
                tableRow.addCell(amount, 'styleNormalAmount');
            }
        }
        //add the sum of the third capital (debt capital)
        tableRow = tableBalance.addRow("styleTablRows");
        if (this.dialogparam.acronymcolumn) {
            tableRow.addCell(texts.longtermdebtcapital_acronym, "styleUnderGroupTitles");
        }
        tableRow.addCell(texts.total_longtermdebtcapital, 'styleUnderGroupTitles');
        for (var i = this.data.length - 1; i >= 0; i--) {
            tableRow.addCell(this.toLocaleAmountFormat(this.data[i].calculated_data.longtermdebtcapital), "styleMidTotalAmount");
        }


        /******************************************************************************************
         * Add the Long term third capital plus Short term debt capital (Debt Capital)
         * ***************************************************************************************/

        tableRow = tableBalance.addRow("styleTablRows");
        if (this.dialogparam.acronymcolumn) {
            tableRow.addCell(texts.debtcapital_acronym, "styleUnderGroupTitles");
        }
        tableRow.addCell(texts.debtcapital, 'styleUnderGroupTitles');
        for (var i = this.data.length - 1; i >= 0; i--) {
            tableRow.addCell(this.toLocaleAmountFormat(this.data[i].calculated_data.debtcapital), "styleMidTotalAmount");
        }

        /******************************************************************************************
         * Add the own capital to the balance table
         * ***************************************************************************************/
        for (var key in this.data[0].balance.oc) {
            var tableRow = tableBalance.addRow("styleTablRows");

            if (this.dialogparam.acronymcolumn) {
                acronym = this.data[0].balance.oc[key].acronym;
                tableRow.addCell(acronym);
            }

            description = this.data[0].balance.oc[key].description;
            if (texts[key])
                description = texts[key];
            tableRow.addCell(description);

            for (var i = this.data.length - 1; i >= 0; i--) {
                amount = this.toLocaleAmountFormat(this.data[i].balance.oc[key].balance);
                tableRow.addCell(amount, "styleNormalAmount");
            }
        }
        //add the sum of the owned capital
        tableRow = tableBalance.addRow("styleTablRows");
        if (this.dialogparam.acronymcolumn) {
            tableRow.addCell(texts.ownedcapital_acronym, "styleUnderGroupTitles");
        }
        tableRow.addCell(texts.total_owncapital, 'styleUnderGroupTitles');
        for (var i = this.data.length - 1; i >= 0; i--) {
            tableRow.addCell(this.toLocaleAmountFormat(this.data[i].calculated_data.owncapital), "styleMidTotalAmount");
        }

        /******************************************************************************************
         * Add the total liabilities and equity to the balance table
         * ***************************************************************************************/
        var tableRow = tableBalance.addRow("styleTablRows");
        if (this.dialogparam.acronymcolumn) {
            tableRow.addCell(texts.liabilitiesandequity_acronym, styleTitlesTotalAmount);
        }
        tableRow.addCell(texts.totalliabilitiesandequity, styleTitlesTotalAmount);
        for (var i = this.data.length - 1; i >= 0; i--) {
            tableRow.addCell(this.toLocaleAmountFormat(this.data[i].calculated_data.totalliabilitiesandequity), styleTotalAmount);
        }

        /******************************************************************************************
         * Add the profit and loss table
         * ***************************************************************************************/
        var tableCe = this.printReportAdd_TableConCe(report);
        for (var key in this.data[0].profitandloss) {

            var tableRow = tableCe.addRow("styleTablRows");

            if (this.dialogparam.acronymcolumn) {
                var acronym = this.data[0].profitandloss[key].acronym
                tableRow.addCell(acronym);
            }

            var invertAmount = false;
            var description = this.data[0].profitandloss[key].description;
            if (texts[key])
                description = texts[key];

            if (key == "costofmerchandservices" || key == "personnelcosts" || key == "differentcosts" || key == "depreandadjust" || key == "directtaxes") {
                invertAmount = true;
                description = "- " + description;
            } else if (key == "interests") {
                invertAmount = true;
                description = "+/- " + description;
            } else {
                description = "+ " + description;
            }

            tableRow.addCell(qsTr(description));

            for (var i = this.data.length - 1; i >= 0; i--) {
                amount = this.data[i].profitandloss[key].balance;
                if (invertAmount)
                    amount = Banana.SDecimal.invert(amount);
                tableRow.addCell(this.toLocaleAmountFormat(amount), "styleNormalAmount");
            }

            if (key === "costofmerchandservices") {
                var tableRow = tableCe.addRow("styleTablRows");
                if (this.dialogparam.acronymcolumn) {
                    tableRow.addCell(texts.addedvalue_acronym, "styleUnderGroupTitles");
                }
                tableRow.addCell(texts.addedvalue, "styleUnderGroupTitles");
                for (var i = this.data.length - 1; i >= 0; i--) {
                    tableRow.addCell(this.toLocaleAmountFormat(this.data[i].calculated_data.addedvalue), "styleMidTotalAmount");
                }
            }
            if (key === "differentcosts") {
                var tableRow = tableCe.addRow("styleTablRows");
                if (this.dialogparam.acronymcolumn) {
                    tableRow.addCell(texts.ebitda_acronym, "styleUnderGroupTitles");
                }
                tableRow.addCell(texts.ebitda, "styleUnderGroupTitles");
                for (var i = this.data.length - 1; i >= 0; i--) {
                    tableRow.addCell(this.toLocaleAmountFormat(this.data[i].calculated_data.ebitda), "styleMidTotalAmount");
                }

            }
            if (key === "depreandadjust") {
                var tableRow = tableCe.addRow("styleTablRows");
                if (this.dialogparam.acronymcolumn) {
                    tableRow.addCell(texts.ebit_acronym, "styleUnderGroupTitles");
                }
                tableRow.addCell(texts.ebit, "styleUnderGroupTitles");
                for (var i = this.data.length - 1; i >= 0; i--) {
                    tableRow.addCell(this.toLocaleAmountFormat(this.data[i].calculated_data.ebit), "styleMidTotalAmount");
                }
            }
            if (key === "interests") {
                var tableRow = tableCe.addRow("styleTablRows");
                if (this.dialogparam.acronymcolumn) {
                    tableRow.addCell(texts.ebt_acronym, "styleUnderGroupTitles");
                }
                tableRow.addCell(texts.ebt, "styleUnderGroupTitles");
                for (var i = this.data.length - 1; i >= 0; i--) {
                    tableRow.addCell(this.toLocaleAmountFormat(this.data[i].calculated_data.ebt), "styleMidTotalAmount");
                }
            }
        }
        var tableRow = tableCe.addRow("styleTablRows");
        if (this.dialogparam.acronymcolumn) {
            tableRow.addCell(texts.finalresult_acronym, styleTitlesTotalAmount);
        }
        tableRow.addCell(texts.annualresult, styleTitlesTotalAmount);
        for (var i = this.data.length - 1; i >= 0; i--) {
            tableRow.addCell(this.toLocaleAmountFormat(this.data[i].calculated_data.annualresult), styleTotalAmount);
        }

        report.addPageBreak();



        /******************************************************************************************
         * Add the control sums table (could be done better with a method)
         * ***************************************************************************************/
        let ctsumsData = this.getControlSumsTitlesData(texts);
        if (this.dialogparam.includecontrolsums) {
            var tableControlSums = this.printReportAdd_TableControlSums(report);
            for (var key in ctsumsData) {
                let descrTableRow = tableControlSums.addRow("styleTablRows");
                descrTableRow.addCell(ctsumsData[key].description, "styleUnderGroupTitles", 4);
                let dataId = ctsumsData[key].id;
                for (var i = this.data.length - 1; i >= 0; i--) {
                    let period = this.data[i].period.EndDate;
                    let year = period.substr(0, 4);
                    if (this.data[i].period.Type == "CY" || this.data[i].period.Type == "PY") {
                        for (var key in this.data[i].controlSumsData) {
                            let type = typeof(this.data[i].controlSumsData[key]);
                            if (type == "object" && this.data[i].controlSumsData[key].id == dataId) {
                                let diffStyle = this.data[i].controlSumsData[key].getStyle();
                                let amtRow = tableControlSums.addRow("styleTablRows");
                                amtRow.addCell(year);
                                amtRow.addCell(this.toLocaleAmountFormat(this.data[i].controlSumsData[key].sheet), "styleNormalAmount");
                                amtRow.addCell(this.toLocaleAmountFormat(this.data[i].controlSumsData[key].calc), "styleNormalAmount");
                                amtRow.addCell(this.toLocaleAmountFormat(this.data[i].controlSumsData[key].difference), diffStyle);
                            }
                        }
                    }
                }
            }
            //if differences are presents, display a warning
            let hasDifferences = this.controlSumsWithDifferences(this.data);
            if (hasDifferences) {
                report.addParagraph(texts.controlSums, "styleWarningText");
            }
            report.addPageBreak();
        }

        /******************************************************************
         * Add the Cashflow table (only if we have at least 2yr of analysis)
         *****************************************************************/

        var tableCashflow = this.printReportAdd_TableCashflow(report);
        //save the acronyms I need for reference
        let provisionsAcronym = this.data[0].cashflowData.operatingCashflow.provsionsAndSimilar.acronym.text;
        let prepaidExpensesAcronym = this.data[0].cashflowData.operatingCashflow.prepaidExpenses.acronym.text;

        //add the operating cashflow elements
        for (var key in this.data[0].cashflowData.operatingCashflow) {
            var tableRow = tableCashflow.addRow("styleTablRows");
            if (typeof(this.data[0].cashflowData.operatingCashflow[key]) == 'object') {
                if (this.dialogparam.acronymcolumn) {
                    //add acronym
                    tableRow.addCell(this.data[0].cashflowData.operatingCashflow[key].acronym.text, this.data[0].cashflowData.operatingCashflow[key].acronym.style);
                }
                tableRow.addCell(this.data[0].cashflowData.operatingCashflow[key].description.text, this.data[0].cashflowData.operatingCashflow[key].description.style);
                for (var i = this.data.length - 1; i >= 0; i--) {
                    tableRow.addCell(this.toLocaleAmountFormat(this.data[i].cashflowData.operatingCashflow[key].amount.value), this.data[i].cashflowData.operatingCashflow[key].amount.style);
                }
                //add adjustment titles in the correct place by checking the acronyms
                if (this.data[0].cashflowData.operatingCashflow[key].acronym.text == provisionsAcronym) {
                    //add asset adjustment section title
                    var tableRow = tableCashflow.addRow("styleTablRows");
                    tableRow.addCell("", "styleTablRows");
                    tableRow.addCell(texts.adjusted_assets_cashflow, "styleUnderGroupTitles", spanBalanceTitle - 1);
                } else if (this.data[0].cashflowData.operatingCashflow[key].acronym.text == prepaidExpensesAcronym) {
                    //add liabilities adjustment section title
                    var tableRow = tableCashflow.addRow("styleTablRows");
                    tableRow.addCell("", "styleTablRows");
                    tableRow.addCell(texts.adjusted_liabilities_cashflow, "styleUnderGroupTitles", spanBalanceTitle - 1);
                }
            }
        }

        //add the investing cashflow elements
        for (var key in this.data[0].cashflowData.cashflowFromInvesting) {
            var tableRow = tableCashflow.addRow("styleTablRows");
            if (typeof(this.data[0].cashflowData.cashflowFromInvesting[key]) == 'object') {
                if (this.dialogparam.acronymcolumn) {
                    tableRow.addCell(this.data[0].cashflowData.cashflowFromInvesting[key].acronym.text, this.data[0].cashflowData.cashflowFromInvesting[key].acronym.style);
                }
                tableRow.addCell(this.data[0].cashflowData.cashflowFromInvesting[key].description.text, this.data[0].cashflowData.cashflowFromInvesting[key].description.style);
                for (var i = this.data.length - 1; i >= 0; i--) {
                    tableRow.addCell(this.toLocaleAmountFormat(this.data[i].cashflowData.cashflowFromInvesting[key].amount.value), this.data[i].cashflowData.cashflowFromInvesting[key].amount.style);
                }
            }
        }
        //add the financing cashflow elements
        for (var key in this.data[0].cashflowData.cashflowFromFinancing) {
            var tableRow = tableCashflow.addRow("styleTablRows");
            if (typeof(this.data[0].cashflowData.cashflowFromFinancing[key]) == 'object') {
                if (this.dialogparam.acronymcolumn) {
                    tableRow.addCell(this.data[0].cashflowData.cashflowFromFinancing[key].acronym.text, this.data[0].cashflowData.cashflowFromFinancing[key].acronym.style);
                }
                tableRow.addCell(this.data[0].cashflowData.cashflowFromFinancing[key].description.text, this.data[0].cashflowData.cashflowFromFinancing[key].description.style);
                for (var i = this.data.length - 1; i >= 0; i--) {
                    tableRow.addCell(this.toLocaleAmountFormat(this.data[i].cashflowData.cashflowFromFinancing[key].amount.value), this.data[i].cashflowData.cashflowFromFinancing[key].amount.style);
                }
            }
        }

        //add final cashflow section
        var tableRow = tableCashflow.addRow("styleTablRows");
        if (this.dialogparam.acronymcolumn) {
            tableRow.addCell(this.data[0].cashflowData.finalCashflow.acronym.text, this.data[0].cashflowData.finalCashflow.acronym.style);
        }
        tableRow.addCell(this.data[0].cashflowData.finalCashflow.description.text, this.data[0].cashflowData.finalCashflow.description.style);
        for (var i = this.data.length - 1; i >= 0; i--) {
            tableRow.addCell(this.toLocaleAmountFormat(this.data[i].cashflowData.finalCashflow.amount.value), this.data[i].cashflowData.finalCashflow.amount.style);
        }

        /**********************************************************
         * Add the Cashflow verification section 
         **********************************************************/
        //first ad white row

        var tableCashflowVerif = this.printReportAdd_TableCashflowVerification(report);
        var tableRow = tableCashflowVerif.addRow("styleTablRows");
        tableRow.addCell(texts.cashflow_verification, "styleUnderGroupTitles", spanBalanceTitle);
        //add the investing cashflow elements
        for (var key in this.data[0].cashflowData.verifData) {
            var tableRow = tableCashflowVerif.addRow("styleTablRows");
            if (typeof(this.data[0].cashflowData.verifData[key]) == 'object') {
                if (this.dialogparam.acronymcolumn) {
                    tableRow.addCell(this.data[0].cashflowData.verifData[key].acronym.text, this.data[0].cashflowData.verifData[key].acronym.style);
                }
                tableRow.addCell(this.data[0].cashflowData.verifData[key].description.text, this.data[0].cashflowData.verifData[key].description.style);
                for (var i = this.data.length - 1; i >= 0; i--) {
                    tableRow.addCell(this.toLocaleAmountFormat(this.data[i].cashflowData.verifData[key].amount.value), this.data[i].cashflowData.verifData[key].amount.style);
                }
            }
        }
        //add row with the differences (only if presents)
        let differencesData = this.getCashflowDifferencesData(this.data);
        if (differencesData.hasDifferences) {
            var tableRow = tableCashflowVerif.addRow("styleTablRows");
            if (this.dialogparam.acronymcolumn) {
                tableRow.addCell("", "styleTablRows");
            }
            tableRow.addCell(differencesData.values[0].description.text, differencesData.values[0].description.style);
            for (var key in differencesData.values) {
                tableRow.addCell(this.toLocaleAmountFormat(differencesData.values[key].amount.value), differencesData.values[key].amount.getStyle());
            }
        }


        /**********************************************************
         * Add the Retained Earnings Statement table
         **********************************************************/
        //I show the table even if the annual result is not positive, but the values are all 0
        var tableRetainedEarnings = this.printReportAdd_TableRetainedEarnings(report);
        for (var key in this.data[0].retEarningsData) {
            var tableRow = tableRetainedEarnings.addRow();
            if (typeof this.data[0].retEarningsData[key] === 'object') {
                let textStyle = this.data[0].retEarningsData[key].textStyle;
                tableRow.addCell(this.data[0].retEarningsData[key].description, textStyle);
                for (var i = this.data.length - 1; i >= 0; i--) {
                    let amount = this.data[i].retEarningsData[key].amount;
                    let amountStyle = this.data[i].retEarningsData[key].amountStyle;
                    tableRow.addCell(this.toLocaleAmountFormat(amount), amountStyle);
                }
            }
        }

        /**************************************************
         * Add the Cashflow ratios
         *************************************************/
        var tableIndCashflow = this.printReportAdd_TableIndCashflow(report);

        for (var key in this.data[0].cashflow_index) {
            var tableRow = tableIndCashflow.addRow("styleTablRows");
            tableRow.addCell(this.data[0].cashflow_index[key].description, "styleTablRows");
            if (this.dialogparam.formulascolumn) {
                tableRow.addCell(this.data[0].cashflow_index[key].formula, "styleCentralText");
            }
            tableRow.addCell(this.data[0].cashflow_index[key].benchmark, "styleCentralText");
            for (var i = this.data.length - 1; i >= 0; i--) {
                ratios = this.data[i].cashflow_index[key].amount;
                cell = tableRow.addCell(ratios + perc + ' ', "styleNormalAmount");
                if (i < analsysisYears) {
                    var indexT1 = this.data[i].cashflow_index[key].amount;
                    var indexT2 = this.data[i + 1].cashflow_index[key].amount;
                    this.setIndexEvolution(indexT1, indexT2, cell, this.data[i].period.Type);
                }
            }
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
                tableRow.addCell(this.data[0].index.liqu[key].formula, "styleCentralText");
            }
            tableRow.addCell(this.data[0].index.liqu[key].benchmark, "styleCentralText");
            for (var i = this.data.length - 1; i >= 0; i--) {
                ratios = this.data[i].index.liqu[key].amount;
                if (this.data[0].index.liqu[key].type != "dec") {
                    cell = tableRow.addCell(ratios + perc + ' ', "styleNormalAmount");
                } else {
                    cell = tableRow.addCell(this.toLocaleAmountFormat(ratios) + ' ', "styleNormalAmount");
                }
                //add the index evolution icons, the space ' ' is a placeholder for the icon
                if (i < analsysisYears) {
                    //for set ratios arrows
                    var indexT1 = this.data[i].index.liqu[key].amount;
                    var indexT2 = this.data[i + 1].index.liqu[key].amount;
                    this.setIndexEvolution(indexT1, indexT2, cell, this.data[i].period.Type);
                }

            }
        }
        /******************************************************************************************
         * Add the Leverage ratios table
         * ***************************************************************************************/
        var tableIndlev = this.printReportAdd_TableIndlev(report);

        for (var key in this.data[0].index.lev) {
            var tableRow = tableIndlev.addRow("styleTablRows");
            tableRow.addCell(qsTr(this.data[0].index.lev[key].description), "styleTablRows");
            if (this.dialogparam.formulascolumn) {
                tableRow.addCell(this.data[0].index.lev[key].formula, "styleCentralText");
            }
            tableRow.addCell(this.data[0].index.lev[key].benchmark, "styleCentralText");
            for (var i = this.data.length - 1; i >= 0; i--) {
                ratios = this.data[i].index.lev[key].amount;
                cell = tableRow.addCell(ratios + perc + ' ', "styleNormalAmount");
                if (i < analsysisYears) {
                    var indexT1 = this.data[i].index.lev[key].amount;
                    var indexT2 = this.data[i + 1].index.lev[key].amount;
                    this.setIndexEvolution(indexT1, indexT2, cell, this.data[i].period.Type);
                }
            }
        }

        /******************************************************************************************
         * Add the Profitability ratios table
         * ***************************************************************************************/
        var tableindprof = this.printReportAdd_TableIndprof(report);

        for (var key in this.data[0].index.red) {
            var tableRow = tableindprof.addRow("styleTablRows");
            tableRow.addCell(qsTr(this.data[0].index.red[key].description), "styleTablRows");
            if (this.dialogparam.formulascolumn) {
                tableRow.addCell(this.data[0].index.red[key].formula, "styleCentralText");
            }
            tableRow.addCell(this.data[0].index.red[key].benchmark, "styleCentralText");
            for (var i = this.data.length - 1; i >= 0; i--) {
                ratios = this.data[i].index.red[key].amount;
                cell = tableRow.addCell(ratios + perc + ' ', "styleNormalAmount");
                if (i < analsysisYears) {
                    var indexT1 = this.data[i].index.red[key].amount;
                    var indexT2 = this.data[i + 1].index.red[key].amount;
                    this.setIndexEvolution(indexT1, indexT2, cell, this.data[i].period.Type);
                }
            }
        }

        /******************************************************************************************
         * Add the Efficiency ratios table
         * ***************************************************************************************/
        var tableindeff = this.printReportAdd_TableIndeff(report);

        for (var key in this.data[0].index.eff) {
            var tableRow = tableindeff.addRow("styleTablRows");
            tableRow.addCell(qsTr(this.data[0].index.eff[key].description), "styleTablRows");
            if (this.dialogparam.formulascolumn) {
                tableRow.addCell(this.data[0].index.eff[key].formula, "styleCentralText");
            }
            tableRow.addCell(this.data[0].index.eff[key].benchmark, "styleCentralText");
            for (var i = this.data.length - 1; i >= 0; i--) {
                ratios = this.data[i].index.eff[key].amount;
                tableRow.addCell(this.toLocaleAmountFormat(ratios), "styleNormalAmount");
            }
        }

        report.addPageBreak();

        /******************************************************************************************
         * Add the Dupont Analysis table, if the user included it
         * ***************************************************************************************/

        if (this.dialogparam.includedupontanalysis) {

            var tabledupont = this.printReportAdd_TableDupont(report);

            for (var key in this.data[0].dupont_data) {
                //for the dupont data we dont display the "difference" columns as those are not useful for this analysis.
                var tableRow = tabledupont.addRow("styleTablRows");
                if (this.data[0].dupont_data[key].style == "titl") {
                    textstyle = "styleUnderGroupTitles";
                } else {
                    textstyle = "styleTablRows";
                }
                tableRow.addCell(qsTr(this.data[0].dupont_data[key].description), textstyle);
                for (var i = this.data.length - 1; i >= 0; i--) {
                    ratios = this.data[i].dupont_data[key].amount;
                    if (this.data[i].dupont_data[key].type === "perc") {
                        cell = tableRow.addCell(ratios + perc + ' ', "styleNormalAmount");
                    } else {
                        cell = tableRow.addCell(this.toLocaleAmountFormat(ratios) + ' ', "styleNormalAmount");
                    }
                    if (i < analsysisYears) {
                        var indexT1 = this.data[i].dupont_data[key].amount;
                        var indexT2 = this.data[i + 1].dupont_data[key].amount;
                        this.setIndexEvolution(indexT1, indexT2, cell, this.data[i].period.Type);
                    }
                }
            }
        }

        /******************************************************************************************
         * Add the Z score Altman index Analysis
         * ***************************************************************************************/
        var tableAltmanZScoreIndex = this.printReportAdd_TableAltmanZScoreIndex(report);
        var tableRow = tableAltmanZScoreIndex.addRow("styleTablRows");
        for (var key in this.data[0].altman_index) {
            var tableRow = tableAltmanZScoreIndex.addRow("styleTablRows");
            tableRow.addCell(this.data[0].altman_index[key].text.descr,
                this.data[0].altman_index[key].text.style);
            if (this.dialogparam.formulascolumn) {
                tableRow.addCell(this.data[0].altman_index[key].formula.descr,
                    this.data[0].altman_index[key].formula.style);
            }
            tableRow.addCell(this.data[0].altman_index[key].weighting.descr,
                this.data[0].altman_index[key].weighting.style);

            for (var i = this.data.length - 1; i >= 0; i--) {
                tableRow.addCell(this.data[i].altman_index[key].amount.value, this.data[i].altman_index[key].amount.style);
            }
        }

        /****************************************************************************************
         * Add the Z Score for Private Companies
         ****************************************************************************************/
        var tableAltmanZScoreIndexPC = this.printReportAdd_TableZScorePrivateCompanies(report);
        var tableRow = tableAltmanZScoreIndexPC.addRow("styleTablRows");
        for (var key in this.data[0].altman_index_pc) {
            var tableRow = tableAltmanZScoreIndexPC.addRow("styleTablRows");
            tableRow.addCell(this.data[0].altman_index_pc[key].text.descr,
                this.data[0].altman_index_pc[key].text.style);
            if (this.dialogparam.formulascolumn) {
                tableRow.addCell(this.data[0].altman_index_pc[key].formula.descr,
                    this.data[0].altman_index_pc[key].formula.style);
            }
            tableRow.addCell(this.data[0].altman_index_pc[key].weighting.descr,
                this.data[0].altman_index_pc[key].weighting.style);

            for (var i = this.data.length - 1; i >= 0; i--) {
                tableRow.addCell(this.data[i].altman_index_pc[key].amount.value, this.data[i].altman_index_pc[key].amount.style);
            }
        }

        /*report.addParagraph("","");
        report.addParagraph(texts.altmanlowprob, "styleParagraphs");
        report.addParagraph(texts.altmanmediumprob, "styleParagraphs");
        report.addParagraph(texts.altmanstrongprob, "styleParagraphs");*/


        return report;


    }

    getCashflowDifferencesData(data) {
        let differences = {};
        differences.hasDifferences = false;
        differences.values = [];

        for (var i = data.length - 1; i >= 0; i--) {
            //first check if are present at least one difference,if its present, we will print the row with the differences
            if (data[i].cashflowData.difference.amount.value !== "0") {
                differences.hasDifferences = true;
            }
            //push the data in the array in each case.
            //the data will be printed if we have at least one year with differences, for the other year will be displayed
            //the symbol.
            differences.values.push(data[i].cashflowData.difference);
        }
        return differences;
    }

    /**
     * set the style of the difference value.
     * @Param {*} value the difference between the accounting total and the calculating total
     */
    setDifferenceStyle(value) {
        var differenceStyle;
        if (value != 0) {
            differenceStyle = "styleDifferenceFoundAmount";
        } else {
            differenceStyle = "styleNormalAmount";
        }
        return differenceStyle;
    }

    /**
     * if there are differences between the accounting total and the calculated total, the user is notified.
     */
    showDifferencesWarning(diffAmount, texts) {
        var warning_message = {};
        warning_message.control_sums = texts.controlSumsWrn
        warning_message.cashflow_diff_desc = texts.differenceWrn;
        warning_message.cashflow_diff_amt = diffAmount;
        return warning_message;
    }

    /**
     * @description control the result of the Altman index, and set the correct style, there are three different possibilites, therefore three different styles.
     * @Param {number} amount
     * @returns the style for the amount
     */
    altmanScoreType(amount) {
        var type = "";
        if (amount > 3) {
            type = 'styleZIndexLow';
        } else if (amount <= 3 && amount >= 1.8) {
            type = 'styleZIndexMid';
        } else {
            type = 'styleZIndexProb';
        }

        let style = this.getColorStyle(type);

        return style;
    }

    /**
     * @description The method reads the account table of the current file and saves the id of all the groups in an array.
     * @returns an object containing the list of the groups found in the file
     */
    loadGroups() {
        var groupList = "";
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


    setVariables(variables, dialogparam) {
        /* Variables that set the colors */
        variables.$headers_background_color = dialogparam.headers_background_color;
        variables.$headers_texts_color = dialogparam.headers_texts_color;

    }

    /**
     *Function that replaces all the css variables inside of the given cssText with their values.
     *All the css variables start with "$" (i.e. $font_size, $margin_top)
     * @param {*} cssText 
     * @param {*} variables 
     */
    replaceVariables(cssText, variables) {

        var result = "";
        var varName = "";
        var insideVariable = false;
        var variablesNotFound = [];

        for (var i = 0; i < cssText.length; i++) {
            var currentChar = cssText[i];
            if (currentChar === "$") {
                insideVariable = true;
                varName = currentChar;
            } else if (insideVariable) {
                if (currentChar.match(/^[0-9a-z]+$/) || currentChar === "_" || currentChar === "-") {
                    // still a variable name
                    varName += currentChar;
                } else {
                    // end variable, any other charcter
                    if (!(varName in variables)) {
                        variablesNotFound.push(varName);
                        result += varName;
                    } else {
                        result += variables[varName];
                    }
                    result += currentChar;
                    insideVariable = false;
                    varName = "";
                }
            } else {
                result += currentChar;
            }
        }

        if (insideVariable) {
            // end of text, end of variable
            if (!(varName in variables)) {
                variablesNotFound.push(varName);
                result += varName;
            } else {
                result += variables[varName];
            }
            insideVariable = false;
        }

        if (variablesNotFound.length > 0) {
            //Banana.console.log(">>Variables not found: " + variablesNotFound);
        }
        return result;
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
        var variables = {};
        this.setVariables(variables, this.dialogparam);
        // Replace all the "$xxx" variables with the real value
        textCSS = this.replaceVariables(textCSS, variables);


        var stylesheet = Banana.Report.newStyleSheet();
        // Parse the CSS text
        stylesheet.parse(textCSS);

        return stylesheet;
    }

    /**
     * Define all the dialog texts
     */
    getFinancialAnalysisTexts() {

        var texts = {};

        /************************************
         * Acronnym texts
         ************************************/
        texts.liquidity_acronym = "liqu";
        texts.credits_acronym = "cred";
        texts.stocks_acronym = "stoc";
        texts.fixedassets_acronym = "fixa";
        texts.financial_fixedassets_acronym = "finfix";
        texts.tangible_fixedassets_acronym = "tanfix";
        texts.intangible_fixedassets_acronym = "intfix";
        texts.shorttermdebtcapital_acronym = "stdc";
        texts.longtermdebtcapital_acronym = "ltdc";
        texts.longter_debts_acronym = "ltde";
        texts.debts_acronym = "dbts";
        texts.accruals_and_deferred_income_acronym = "accr";
        texts.ownbasecapital_acronym = "obca";
        texts.reserves_acronym = "rese";
        texts.balanceProfits_acronym = "balp";
        texts.salesturnover_acronym = "satu";
        texts.costofmerchandservices_acronym = "cofm";
        texts.personnelcosts_acronym = "cope";
        texts.differentcosts_acronym = "cofi";
        texts.depreandadjust_acronym = "amre";
        texts.interests_acronym = "inte";
        texts.directtaxes_acronym = "dita";
        texts.finalresult_acronym = "fire";
        texts.currentassets_acronym = "cuas";
        texts.totassets_acronym = "tota";
        texts.debtcapital_acronym = "deca";
        texts.ownedcapital_acronym = "owca";
        texts.liabilitiesandequity_acronym = "totle"
        texts.addedvalue_acronym = "adva";
        texts.ebitda_acronym = "EBIT-DA";
        texts.ebit_acronym = "EBIT";
        texts.ebt_acronym = "EBT";
        texts.prepaid_expenses_acronym = "prep";
        texts.accruals_and_deferred_income = "wown";
        texts.provisionsandsimilar_acronym = "prov";
        texts.revaluationPrefix_acronym = "#revaluation";
        texts.devaluationPrefix_acronym = "#devaluation";
        texts.disinvestmentsPrefix_acronym = "#disinvest";
        texts.investments_acronym = "inve";
        texts.cashflowFromOperations_acronym = "A";
        texts.cashflowFromFinancing_acronym = "C";
        texts.cashflowFromInvesting_acronym = "B";
        texts.finalCashflow_acronym = "A+B+C";
        texts.dividends_acronym = "#dividends";
        /******************************************************************************************
         * texts for tooltips
         ******************************************************************************************/
        texts.groups_tooltip = qsTr("Enter the groups, separated by a semicolon ';'");
        texts.amounts_tooltip = qsTr("Enter the amount");
        texts.logo_tooltip = qsTr("Check to include Logo");
        texts.includebudget_todate_tooltip = qsTr('Check to include the budget to date column');
        texts.includecurrentyear_projection_tooltip = qsTr('Check to include the current year projection column');
        texts.currentdate_tooltip = qsTr('Enter the current date');
        texts.logoname_tooltip = qsTr("Enter the Logo name");
        texts.numberofpreviousyear_tooltip = qsTr("Enter the number of previous accounting years you wish to include in the analysis");
        texts.numberofdecimals_tooltip = qsTr("Enter the number of decimals for the amounts");
        texts.includebudget_tooltip = qsTr("Check to include the Budget in the Analysis");
        texts.includedupontanalysis_tooltip = qsTr("Check to include the DuPont Analysis table");
        texts.includecontrolsums_tooltip = qsTr("Check to include the Control Sums table");
        texts.showacronymcolumn_tooltip = qsTr("Check to show the Acronym Column");
        texts.showformulascolumn_tooltip = qsTr("Check to show the Formulas Column");
        texts.benchmarks_tooltip = qsTr("Enter the Benchmark for this index");
        texts.averagenumberofemployee_tooltip = qsTr("Enter the number of employees in your company");
        texts.headers_background_color_tooltip = qsTr("Enter the color for the header's background");
        texts.headers_texts_color_tooltip = qsTr("Enter the color for the header's texts");
        texts.without_colors_tooltip = qsTr("Check if you want the entire report without colors, for example for black and white prints");


        /******************************************************************************************
         * texts for groups
         * ***************************************************************************************/
        texts.liquidity = qsTr("Liquidity");
        texts.credits = qsTr("Credits");
        texts.stocks = qsTr("Stocks");
        texts.fixedassets = qsTr("Fixed Assets");
        texts.currentassets = qsTr("Current Assets");
        texts.financial_fixedassets = qsTr("Financial Fixed Assets");
        texts.tangible_fixedassets = qsTr("Tangible Fixed Assets");
        texts.intangible_fixedassets = qsTr("Intangible Fixed Assets");
        texts.shorttermdebtcapital = qsTr("Short term Debt Capital");
        texts.total_shorttermdebtcapital = qsTr("Total Short term Debt Capital");
        texts.debts = qsTr("Debts");
        texts.longtermdebtcapital = qsTr("Long term debt Capital");
        texts.total_longtermdebtcapital = qsTr("Total Long term debt Capital");
        texts.longter_debts = qsTr("Long term Debts");
        texts.ownbasecapital = qsTr("Own base capital");
        texts.owncapital = qsTr("Own Capital");
        texts.total_owncapital = qsTr("Total Own Capital");
        texts.reserves = qsTr("Reserves");
        texts.balanceProfits = qsTr("Profit / Loss carried forward");
        texts.salesturnover = qsTr("Sales turnover");
        texts.costofmerchandservices = qsTr("Cost of merchandise and services");
        texts.personnelcosts = qsTr("Personnel costs");
        texts.differentcosts = qsTr("Different costs");
        texts.depreandadjust = qsTr("Depreciations and adjustments");
        texts.interests = qsTr("Interests");
        texts.directtaxes = qsTr("Direct taxes");
        texts.finalresult = qsTr("Final Result");
        texts.prepaid_expenses = qsTr("Prepaid Expenses");
        texts.provisionsandsimilar = qsTr("Provisions and similar");
        texts.accruals_and_deferred_income = qsTr("Accruals and Deferred Income");

        /******************************************************************************************
         * texts for Cash flow elements
         * ***************************************************************************************/

        texts.provisionsandsimilar_cashflow = qsTr("+/- (+)Creation and (-)release of provisions")
        texts.credits_cashflow = qsTr("+/- (+) Decrease or (-) increase of credits");
        texts.stocks_cashflow = qsTr("+/- (+) Decrease or (-) increase of stocks");
        texts.prepaid_expenses_cashflow = qsTr("+/- (+) Decrease or (-) increase of prepaid expenses");
        texts.liabilities_cashflow = qsTr("+/- (+)Increase or (-) decrease of liabilities");
        texts.accruals_and_deferred_income_cashflow = qsTr("+/- (+) Increase or (-) decrease of accruals and deferred income");
        texts.investments_cashflow = qsTr("- Investments");
        texts.disinvestments_cashflow = qsTr("+ Disinvestments");
        texts.longtermdebtcapital_cashflow = qsTr("+/- Long term (+) increases or (-) repayments of debt capital");
        texts.ownbasecapital_cashflow = qsTr("Share capital (+) increases or (-) reductions ");
        texts.adjusted_assets_cashflow = qsTr("Adjustment with assets accounts ");
        texts.adjusted_liabilities_cashflow = qsTr("Adjustment with liabilities accounts ");
        texts.cashflow_from_operations = qsTr("= Cash Flow from operations");
        texts.cashflow_from_investing = qsTr("= Cash Flow from investing");
        texts.cashflow_from_financing = qsTr("=Cash Flow from financing")
        texts.final_cashflow = qsTr("Increase/decrease in liquidity");
        texts.opening_liquidity = qsTr("Liquidity at the beginning of the period");
        texts.closing_liquidity = qsTr("Liquidity at the end of the period");
        texts.cashflowFinal = qsTr("Change in liquidity");
        texts.gain_on_sales = qsTr("- Revaluations on Fixed Assets");
        texts.loss_on_sales = qsTr("+ Devaluations on Fixed Assets");
        texts.dividends = qsTr("- Dividends");
        texts.cashflow_verification = qsTr("Cash Flow verification");
        /******************************************************************************************
         * texts for titles,headers,..
         * ***************************************************************************************/
        texts.companyinfos = qsTr("COMPANY INFORMATION");
        texts.upperbalance = qsTr("BALANCE");
        texts.balance = qsTr('Balance');
        texts.budget = qsTr('Budget');
        texts.budget_to_date = qsTr('Budget to Date');
        texts.budget_differences_complete = qsTr("Budget +/-");
        texts.budget_differences_todate = qsTr("Budget to Date +/-");
        texts.totowncapital = qsTr("Owned Capital");
        texts.upperprofitandloss = qsTr("PROFIT AND LOSS");
        texts.description = qsTr("Description");
        texts.acronym = qsTr("Acronym");
        texts.formula = qsTr("formula");
        texts.weighting = qsTr("Weighting"); //ponderazione, per indice Z Score di altman.
        texts.controlsums = qsTr("CONTROL SUMS");
        texts.profitandloss = qsTr("Profit and Loss");
        texts.year = qsTr("Year");
        texts.accountingtotal = qsTr("Accounting Total");
        texts.calculatedtotal = qsTr("Calculated Total");
        texts.difference = qsTr("Difference");
        texts.uppercashflow = qsTr("CASH FLOW STATEMENT (INDIRECT METHOD)");
        texts.upperliquidityratios = qsTr("LIQUIDITY RATIOS");
        texts.upperleverageratios = qsTr("LEVERAGE RATIOS");
        texts.upperprofitabilityratios = qsTr("PROFITABILITY RATIOS");
        texts.upperefficiancyratios = qsTr("EFFICIENCY RATIOS");
        texts.retainedEarnings = qsTr("RETAINED EARNINGS STATEMENT");
        texts.uppercashflowratios = qsTr("CASH FLOW RATIOS");
        texts.benchmark = qsTr("Benchmark");
        texts.benchmarks = qsTr("Benchmarks");
        texts.upperaltmanindex = qsTr("ALTMAN Z-SCORE");
        texts.upperzscoreprivatecompanies = qsTr("Z-SCORE FOR PRIVATE COMPANIES");
        texts.upperdupontscheme = qsTr("DUPONT ANALYSIS ");
        texts.financialstatementanalysis = qsTr("Financial Statements Analysis and Ratios");
        texts.totalasset = qsTr('Total Assets');
        texts.assets = qsTr("Assets");
        texts.debtcapital = qsTr("Total Debt Capital");
        texts.liabilitiesandequity = qsTr("Liabilities and Equity");
        texts.totalliabilitiesandequity = qsTr("Total Liabilities and Equity");
        texts.addedvalue = qsTr("= Added Value");
        texts.annualresult = qsTr("Annual result");
        texts.results = qsTr("Results");
        texts.current = qsTr("Current");
        texts.previous = qsTr("Previous");
        texts.revenues = qsTr('Revenues');
        texts.totalcurrentasset = qsTr("Total Current Assets");
        texts.totalfixedasset = qsTr("Total Fixed Assets");
        texts.costs = qsTr('Costs');
        texts.totalcosts = qsTr("Total Costs");
        texts.preferences = qsTr('Preferences');
        texts.grouping = qsTr('Grouping');
        texts.printdetails = qsTr('Print Details');
        texts.analysisdetails = qsTr('Analysis Details');
        texts.includebudget_todate = qsTr('Include Budget to date column');
        texts.includecurrentyear_projection = qsTr('Include Current year projection column');
        texts.currentdate = qsTr('Current date');
        texts.texts = qsTr('Texts');
        texts.benchmarktexts = qsTr('Benchmarks texts');
        texts.numberofpreviousyear = qsTr('Number of previous years');
        texts.numberofdecimals = qsTr('Number of decimals');
        texts.includebudget = qsTr('Include Budget');
        texts.includecontrolsums = qsTr('Include always Control Sums');
        texts.includedupontanalysis = qsTr('Include DuPont Analysis')
        texts.showacronymcolumn = qsTr('Show Acronym column');
        texts.showformulascolumn = qsTr('Show Formulas column');
        texts.printlogo = 'Logo';
        texts.headers_background_color = qsTr("Background color of headers");
        texts.headers_texts_color = qsTr("Text color of headers");
        texts.without_colors = qsTr("Report without Colors");
        texts.pageheader = qsTr("Page header");
        texts.logoname = qsTr("Composition for logo and header alignment");
        texts.averageemployees = qsTr('Average number of employees');
        texts.leverage = qsTr('Leverage');
        texts.profitability = qsTr('Profitability');
        texts.efficiency = qsTr('Efficiency');
        texts.cashflow = qsTr("Cash Flow");
        texts.errorMsg = qsTr("Non-existent groups/accounts: ");
        texts.year_to_date = qsTr("Year to Date")
        texts.year_projection = qsTr("Year to Date + Budget");
        texts.ebitda = qsTr("= Operating result before depreciation and value adjustments, financial results and taxes (EBITDA)");
        texts.ebit = qsTr("= Operating result before financial results and taxes (EBIT)");
        texts.ebt = qsTr("Operating result before taxes (EBT)");
        texts.balanceProfitCarriedForward = qsTr("Profit/Loss carried forward at the beginning of the Period");
        texts.annualResult_retEarnings = qsTr("+ Annual Result");
        texts.reservesVariation = qsTr('+/- Reserves');
        texts.totalRetainedEarning = qsTr('Total retained earning');
        texts.currentYearRetainedEarning = qsTr('Current year retained earning');
        texts.altmanRatioADescription = qsTr('Working capital / total Assets');
        texts.altmanRatioADescriptionPC = qsTr('(Current Assets - Current Liabilities) / total Assets');
        texts.altmanRatioBDescription = qsTr('Retained earnings / total Assets');
        texts.altmanRatioCDescription = qsTr('Earnings before interest and task payment / total Assets');
        texts.altmanRatioDDescription = qsTr('Equity market value / total Liabilities');
        texts.altmanRatioDDescriptionPC = qsTr('Book Value of Equity / total Liabilities');
        texts.altmanRatioEDescription = qsTr('Total Sales / total Assets');
        texts.altmanFinalZScore = "Z-Score";


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
        texts.altmanformula = qsTr("formula used for the calculation  = 1.2A + 1.4B + 3.3C + 0.6D + 1.0E");
        texts.altmanlowprob = qsTr("for values > than 3 correspond a low probability of a financial crisis");
        texts.altmanmediumprob = qsTr("for values >= than 1.8 but <= than 3 there are possibilities of a financial crisis, should be kept under control");
        texts.altmanstrongprob = qsTr("for values < than 1.8 there is a strong probability of a financial crisis");
        texts.efficiencyRPE = qsTr("satu/employees");
        texts.efficiencyAVE = qsTr("adva/employees");
        texts.efficiencyPCE = qsTr("cope/employees");
        texts.efficiencyPCE = qsTr("cope/employees");
        /******************************************************************************************
         * texts for Altman Z-Score index Formulas
         * ***************************************************************************************/
        texts.altmanFormulaA = "(cuas-stdc) / tota";
        texts.altmanFormulaB = qsTr("Total retained earning / tota");
        texts.altmanFormulaC = "EBIT / tota";
        texts.altmanFormulaD = "owca / deca";
        texts.altmanFormulaE = "satu / tota";
        texts.altmanZScoreFormula = "(1.2 x A) + (1.4 x B) + (3.3 x C) + (0.6 x D) + (0.999 x E)";
        texts.altmanZScoreFormulaPC = "(0.717 x A) + (0.847 x B) + (3.107 x C) + (0.420 x D) + (0.998 x E)";

        /******************************************************************************************
         * texts for ratios
         * ***************************************************************************************/
        texts.roi = qsTr("Return on investment (ROI)");
        texts.roe = qsTr("Return on equity (ROE)");
        texts.ros = qsTr("Return on sales (ROS)");
        texts.mol = qsTr("Gross profit margin (MOL)");
        texts.ebitDA = "EBIT-DA";
        texts.cashratio = qsTr("Cash ratio");
        texts.quickratio = qsTr("Quick ratio");
        texts.currentratio = qsTr("Current ratio");
        texts.netcurrentasset = qsTr("Net Current Assets");
        texts.degreecirculatingasset = qsTr("Degree of Circulating Assets");
        texts.percentagefixedasset = qsTr("Percentage Fixed Assets");
        texts.debtratio = qsTr("Debt ratio");
        texts.equityratio = qsTr("Equity ratio");
        texts.selfinancingratio = qsTr("Self financing ratio");
        texts.fixedassetcoverage = qsTr("Fixed Assets Coverage");
        texts.ebtmargin = qsTr("EBT margin");
        texts.profitmargin = qsTr("Profit margin");
        texts.revenueperemployee = qsTr("Revenue per Employee");
        texts.addedvalueperemployee = qsTr("Added Value per Employee");
        texts.personnelcostperemployee = qsTr("Personnel Cost per Employee");
        texts.assetturnover = qsTr("Total Assets Turnover");
        //Cashflow ratios
        texts.cashflow_margin = qsTr("Operating Cash Flow Margin");
        texts.cashflow_asset_efficiency = qsTr("Asset Efficiency");
        texts.cashflow_current_liabilities = qsTr("Cash Flow to current Liabilities");
        texts.cashflow_liabilities = qsTr("Cash Flow to Liabilities");
        texts.cashflow_to_investments = qsTr("Cash Flow to Investments");

        //Warning messagges
        texts.differenceWrn = qsTr("Warning: Difference of: ");
        texts.controlSums = qsTr("Warning: The difference between the 'Accounting total' and the 'Calculated total' columns should be 0.\n Check that the groups used are correct.");



        return texts;
    }

    /**
     * @description It defines the structure of the parameters and gives them a default value.
     * for the representation and use of the necessary parameters, a *dialogparam={}* object has been created.
     * for a question of order for all groups and subgroups of the various layers of the object, has been created a function for every one of them.
     * @returns an object named dialogparam with all the parameters initialized with a default value
     */
    initDialogParam() {


        var texts = this.getFinancialAnalysisTexts();
        var dialogparam = {};
        dialogparam.version = "v1.3";
        dialogparam.period = {};

        dialogparam.currentdate = this.getCurrentDate();
        dialogparam.includebudget_todate = true;
        dialogparam.includecurrentyear_projection = true;
        dialogparam.selectionChecked = false;
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
        dialogparam.includecontrolsums = true;
        dialogparam.printlogo = true;
        dialogparam.without_colors = false;
        dialogparam.pageheader = true;
        dialogparam.logoname = "Logo";
        dialogparam.headers_background_color = "#337AB7";
        dialogparam.headers_texts_color = "#000000";

        return dialogparam;
    }

    initDialogParam_Balance() {
        var texts = this.getFinancialAnalysisTexts();
        var dialogparam = {};
        dialogparam.ca = this.initDialogParam_CurrentAsset(texts);
        dialogparam.fa = this.initDialogParam_FixedAsset(texts);
        dialogparam.stdc = this.initDialogParam_ShortTermDebtCapital(texts);
        dialogparam.ltdc = this.initDialogParam_LongTermDebtCapital(texts);
        dialogparam.oc = this.initDialogParam_OwnCapital(texts);

        return dialogparam;

    }

    initDialogParam_CurrentAsset(texts) {
        var dialogparam = {};
        dialogparam.liquidity = {};
        dialogparam.liquidity.gr = "100;106;109";
        dialogparam.liquidity.description = texts.liquidity;
        dialogparam.liquidity.acronym = texts.liquidity_acronym;
        dialogparam.liquidity.bclass = "1";
        dialogparam.credits = {};
        dialogparam.credits.gr = "110;114";
        dialogparam.credits.description = texts.credits;
        dialogparam.credits.acronym = texts.credits_acronym;
        dialogparam.credits.bclass = "1";
        dialogparam.stocks = {};
        dialogparam.stocks.gr = "120";
        dialogparam.stocks.description = texts.stocks;
        dialogparam.stocks.acronym = texts.stocks_acronym;
        dialogparam.stocks.bclass = "1";
        dialogparam.prepaid_expenses = {};
        dialogparam.prepaid_expenses.gr = "130";
        dialogparam.prepaid_expenses.description = texts.prepaid_expenses;
        dialogparam.prepaid_expenses.acronym = texts.prepaid_expenses_acronym;
        dialogparam.prepaid_expenses.bclass = "1";

        return dialogparam;
    }

    initDialogParam_FixedAsset(texts) {
        var dialogparam = {};
        dialogparam.financial_fixedassets = {};
        dialogparam.financial_fixedassets.gr = "140;148";
        dialogparam.financial_fixedassets.description = texts.financial_fixedassets;
        dialogparam.financial_fixedassets.acronym = texts.financial_fixedassets_acronym;
        dialogparam.financial_fixedassets.bclass = "1";
        dialogparam.tangible_fixedassets = {};
        dialogparam.tangible_fixedassets.gr = "150;160";
        dialogparam.tangible_fixedassets.description = texts.tangible_fixedassets;
        dialogparam.tangible_fixedassets.acronym = texts.tangible_fixedassets_acronym;
        dialogparam.tangible_fixedassets.bclass = "1";
        dialogparam.intangible_fixedassets = {};
        dialogparam.intangible_fixedassets.gr = "170;180";
        dialogparam.intangible_fixedassets.description = texts.intangible_fixedassets;
        dialogparam.intangible_fixedassets.acronym = texts.intangible_fixedassets_acronym;
        dialogparam.intangible_fixedassets.bclass = "1";


        return dialogparam;
    }

    initDialogParam_ShortTermDebtCapital(texts) {
        var dialogparam = {};

        dialogparam.debts = {};
        dialogparam.debts.gr = "200;210;220";
        dialogparam.debts.description = texts.debts;
        dialogparam.debts.acronym = texts.debts_acronym;
        dialogparam.debts.bclass = "2";
        dialogparam.accruals_and_deferred_income = {};
        dialogparam.accruals_and_deferred_income.gr = "230";
        dialogparam.accruals_and_deferred_income.description = texts.accruals_and_deferred_income;
        dialogparam.accruals_and_deferred_income.acronym = texts.accruals_and_deferred_income_acronym;
        dialogparam.accruals_and_deferred_income.bclass = "2";

        return dialogparam;
    }
    initDialogParam_LongTermDebtCapital(texts) {
        var dialogparam = {};

        dialogparam.longter_debts = {};
        dialogparam.longter_debts.gr = "240;250";
        dialogparam.longter_debts.description = texts.longter_debts;
        dialogparam.longter_debts.acronym = texts.longter_debts_acronym;
        dialogparam.longter_debts.bclass = "2";
        dialogparam.provisionsandsimilar = {};
        dialogparam.provisionsandsimilar.gr = "260";
        dialogparam.provisionsandsimilar.description = texts.provisionsandsimilar;
        dialogparam.provisionsandsimilar.acronym = texts.provisionsandsimilar_acronym;
        dialogparam.provisionsandsimilar.bclass = "2";

        return dialogparam;
    }

    initDialogParam_OwnCapital(texts) {
        var dialogparam = {};

        dialogparam.ownbasecapital = {};
        dialogparam.ownbasecapital.gr = "280";
        dialogparam.ownbasecapital.description = texts.ownbasecapital;
        dialogparam.ownbasecapital.acronym = texts.ownbasecapital_acronym;
        dialogparam.ownbasecapital.bclass = "2";
        dialogparam.reserves = {};
        dialogparam.reserves.gr = "290;295;296";
        dialogparam.reserves.description = texts.reserves;
        dialogparam.reserves.acronym = texts.reserves_acronym;
        dialogparam.reserves.bclass = "2";
        dialogparam.balanceProfits = {};
        dialogparam.balanceProfits.gr = "297;298";
        dialogparam.balanceProfits.description = texts.balanceProfits;
        dialogparam.balanceProfits.acronym = texts.balanceProfits_acronym;
        dialogparam.balanceProfits.bclass = "2";

        return dialogparam;
    }

    initDialogParam_ProfitLoss(texts) {
        var dialogparam = {};
        dialogparam.salesturnover = {};
        dialogparam.salesturnover.gr = "3";
        dialogparam.salesturnover.description = texts.salesturnover;
        dialogparam.salesturnover.acronym = texts.salesturnover_acronym;
        dialogparam.salesturnover.bclass = "4";
        dialogparam.costofmerchandservices = {};
        dialogparam.costofmerchandservices.gr = "4";
        dialogparam.costofmerchandservices.description = texts.costofmerchandservices;
        dialogparam.costofmerchandservices.acronym = texts.costofmerchandservices_acronym;
        dialogparam.costofmerchandservices.bclass = "3";
        dialogparam.personnelcosts = {};
        dialogparam.personnelcosts.gr = "5";
        dialogparam.personnelcosts.description = texts.personnelcosts;
        dialogparam.personnelcosts.acronym = texts.personnelcosts_acronym;
        dialogparam.personnelcosts.bclass = "3";
        dialogparam.differentcosts = {};
        dialogparam.differentcosts.gr = "6;7;8";
        dialogparam.differentcosts.description = texts.differentcosts;
        dialogparam.differentcosts.acronym = texts.differentcosts_acronym;
        dialogparam.differentcosts.bclass = "3";
        dialogparam.depreandadjust = {};
        dialogparam.depreandadjust.gr = "68";
        dialogparam.depreandadjust.description = texts.depreandadjust;
        dialogparam.depreandadjust.acronym = texts.depreandadjust_acronym;
        dialogparam.depreandadjust.bclass = "3";
        dialogparam.interests = {};
        dialogparam.interests.gr = "69";
        dialogparam.interests.description = texts.interests;
        dialogparam.interests.acronym = texts.interests_acronym;
        dialogparam.interests.bclass = "3";
        dialogparam.directtaxes = {};
        dialogparam.directtaxes.gr = "89";
        dialogparam.directtaxes.description = texts.directtaxes;
        dialogparam.directtaxes.acronym = texts.directtaxes_acronym;
        dialogparam.directtaxes.bclass = "3";
        return dialogparam;
    }

    initDialogParam_FinalResult(texts) {
        var dialogparam = {};
        dialogparam.finalresult = {};
        dialogparam.finalresult.gr = "E7";
        dialogparam.finalresult.description = texts.finalresult;
        dialogparam.finalresult.acronym = texts.finalresult_acronym;
        return dialogparam;
    }

    /***********************************************************************************
     * added the prefix prof because elements: .roe, .roi, .ros, .mol  already exists.
     ************************************************************************************/
    initDialogParam_RatiosBenchmarks() {
        var texts = this.getFinancialAnalysisTexts();
        var dialogparam = {};
        dialogparam.liquidityratios = this.initDialogParam_LiquidityBenchmarks(texts);
        dialogparam.leverageratios = this.initDialogParam_leverageBenchmarks(texts);
        dialogparam.profitabilityratios = this.initDialogParam_ProfitabilityBenchmarks(texts);
        dialogparam.efficiencyratios = this.initDialogParam_EfficiencyBenchmarks(texts);
        dialogparam.cashflowratios = this.initDialogParam_CashflowBenchmarks(texts);
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
        dialogparam.profroe.description = texts.roe;
        dialogparam.profroe.value = "8%-14%";
        dialogparam.profroi = {};
        dialogparam.profroi.description = texts.roi;
        dialogparam.profroi.value = "10%";
        dialogparam.profros = {};
        dialogparam.profros.description = texts.ros;
        dialogparam.profros.value = ">0";
        dialogparam.profmol = {};
        dialogparam.profmol.description = texts.mol;
        dialogparam.profmol.value = "40%";
        dialogparam.profebm = {};
        dialogparam.profebm.description = texts.ebtmargin;
        dialogparam.profebm.value = "2.4%";
        dialogparam.profmon = {};
        dialogparam.profmon.description = texts.profitmargin;
        dialogparam.profmon.value = "1.4%";

        return dialogparam;
    }
    initDialogParam_EfficiencyBenchmarks(texts) {
        var dialogparam = {};
        dialogparam.revenueperemployee = {};
        dialogparam.revenueperemployee.description = texts.revenueperemployee;
        dialogparam.revenueperemployee.value = ">0";
        dialogparam.addedvalueperemployee = {};
        dialogparam.addedvalueperemployee.description = texts.addedvalueperemployee;
        dialogparam.addedvalueperemployee.value = ">0";
        dialogparam.personnelcostperemployee = {};
        dialogparam.personnelcostperemployee.description = texts.personnelcostperemployee;
        dialogparam.personnelcostperemployee.value = ">0";

        return dialogparam;
    }

    initDialogParam_CashflowBenchmarks(texts) {
        var dialogparam = {};
        dialogparam.cashflow_margin = {};
        dialogparam.cashflow_margin.description = texts.cashflow_margin;
        dialogparam.cashflow_margin.value = "-";
        dialogparam.cashflow_asset_efficiency = {};
        dialogparam.cashflow_asset_efficiency.description = texts.cashflow_asset_efficiency;
        dialogparam.cashflow_asset_efficiency.value = "-";
        dialogparam.cashflow_current_liabilities = {};
        dialogparam.cashflow_current_liabilities.description = texts.cashflow_current_liabilities;
        dialogparam.cashflow_current_liabilities.value = "-";
        dialogparam.cashflow_liabilities = {};
        dialogparam.cashflow_liabilities.description = texts.cashflow_liabilities;
        dialogparam.cashflow_liabilities.value = "-";
        dialogparam.cashflow_to_investments = {};
        dialogparam.cashflow_to_investments.description = texts.cashflow_to_investments;
        dialogparam.cashflow_to_investments.value = "-";

        return dialogparam;
    }

    setCounter(type) {
        var counter;
        if (this.dialogparam.includebudget_todate) {
            counter = 1;
        } else {
            counter = 0;
        }

        return counter;
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
            var data_year_todate = {};
            var data_budget_todate = {};

            var data_year_projection = {};
            var data_budget_complete = {};
            //converto l'attributo di classe this.dialogparam.current_date nel formato corretto

            // only if the table budget exists and if the User choosed to use it.
            var isIncluded = this.dialogparam.includebudgettable;
            if (this.with_budget && isIncluded) {
                //Normal Budget data (complete)
                let data_budget = this.loadData_Budget(yeardocument);
                let calculated_data = this.calculateData(data_budget, yeardocument, isIncluded, "");
                let index = this.calculateIndex(data_budget, calculated_data);
                let dupont_data = this.createdupont_data(data_budget, calculated_data, index);
                let cashflowData = this.calculateCashflowData(data_budget, calculated_data);
                let retEarningsData = this.setRetainedEarningsData(data_budget, calculated_data);
                let cashflow_index = this.calculateCashflowIndex(data_budget, calculated_data, cashflowData);
                let altman_index = this.calculateAltmanZScoreIndex(data_budget, calculated_data, retEarningsData);
                let altman_index_pc = this.calculateAltmanZScoreIndexPC(data_budget, calculated_data, retEarningsData); // Z score for private companies
                data_budget.calculated_data = calculated_data;
                data_budget.index = index;
                data_budget.dupont_data = dupont_data;
                data_budget.altman_index = altman_index;
                data_budget.altman_index_pc = altman_index_pc;
                data_budget.cashflowData = cashflowData;
                data_budget.retEarningsData = retEarningsData;
                data_budget.cashflow_index = cashflow_index;
                this.data.push(data_budget);
                data_budget_complete = data_budget;
            }

            //current year with projection
            if (this.dialogparam.includecurrentyear_projection && this.with_budget && isIncluded) {
                let data_year = this.loadData_Year_Projection(yeardocument);
                let calculated_data = this.calculateData(data_year, yeardocument, false, "");
                let index = this.calculateIndex(data_year, calculated_data);
                let dupont_data = this.createdupont_data(data_year, calculated_data, index);
                let cashflowData = this.calculateCashflowData(data_year, calculated_data);
                let retEarningsData = this.setRetainedEarningsData(data_year, calculated_data);
                let cashflow_index = this.calculateCashflowIndex(data_year, calculated_data, cashflowData);
                let altman_index = this.calculateAltmanZScoreIndex(data_year, calculated_data, retEarningsData);
                let altman_index_pc = this.calculateAltmanZScoreIndexPC(data_year, calculated_data, retEarningsData); // Z score for private companies
                data_year.calculated_data = calculated_data;
                data_year.index = index;
                data_year.dupont_data = dupont_data;
                data_year.altman_index = altman_index;
                data_year.altman_index_pc = altman_index_pc;
                data_year.cashflowData = cashflowData;
                data_year.retEarningsData = retEarningsData;
                data_year.cashflow_index = cashflow_index;
                data_year_projection = data_year;
                this.data.push(data_year);
            }

            //Budget to Date (until the current date)
            //if user selected it
            if (this.with_budget && isIncluded && this.dialogparam.includebudget_todate) {
                let data_budget = this.loadData_Budget_ToDate(yeardocument);
                let calculated_data = this.calculateData(data_budget, yeardocument, isIncluded, "");
                let index = this.calculateIndex(data_budget, calculated_data);
                let dupont_data = this.createdupont_data(data_budget, calculated_data, index);
                let cashflowData = this.calculateCashflowData(data_budget, calculated_data);
                let retEarningsData = this.setRetainedEarningsData(data_budget, calculated_data);
                let cashflow_index = this.calculateCashflowIndex(data_budget, calculated_data, cashflowData);
                let altman_index = this.calculateAltmanZScoreIndex(data_budget, calculated_data, retEarningsData);
                let altman_index_pc = this.calculateAltmanZScoreIndexPC(data_budget, calculated_data, retEarningsData); // Z score for private companies
                data_budget.calculated_data = calculated_data;
                data_budget.index = index;
                data_budget.dupont_data = dupont_data;
                data_budget.altman_index = altman_index;
                data_budget.altman_index_pc = altman_index_pc;
                data_budget.cashflowData = cashflowData;
                data_budget.retEarningsData = retEarningsData;
                data_budget.cashflow_index = cashflow_index;
                data_budget_todate = data_budget;
                this.data.push(data_budget);

            }

            //current year to date and previous years
            while (yeardocument && i <= this.dialogparam.maxpreviousyears) {
                let data_year = this.loadData_Year(yeardocument, i);
                let calculated_data = this.calculateData(data_year, yeardocument, false, i);
                let controlSumsData = this.getControlSumsData(calculated_data); //only for the current year and previous year
                let index = this.calculateIndex(data_year, calculated_data);
                let dupont_data = this.createdupont_data(data_year, calculated_data, index);
                let cashflowData = this.calculateCashflowData(data_year, calculated_data);
                let retEarningsData = this.setRetainedEarningsData(data_year, calculated_data);
                let cashflow_index = this.calculateCashflowIndex(data_year, calculated_data, cashflowData);
                let altman_index = this.calculateAltmanZScoreIndex(data_year, calculated_data, retEarningsData);
                let altman_index_pc = this.calculateAltmanZScoreIndexPC(data_year, calculated_data, retEarningsData); // Z score for private companies
                data_year.calculated_data = calculated_data;
                data_year.controlSumsData = controlSumsData;
                data_year.index = index;
                data_year.dupont_data = dupont_data;
                data_year.altman_index = altman_index;
                data_year.altman_index_pc = altman_index_pc;
                data_year.cashflowData = cashflowData;
                data_year.retEarningsData = retEarningsData;
                data_year.cashflow_index = cashflow_index;
                if (i == 0) {
                    data_year_todate = data_year;
                }
                this.data.push(data_year);
                yeardocument = yeardocument.previousYear();
                i++;
            }

            //calculate the differences between current and budget (complete) BDC=budget difference complete
            if (this.with_budget && isIncluded && this.dialogparam.includecurrentyear_projection) {
                var differences = this.getCurrAndBudgDiff(data_year_projection, data_budget_complete);
                differences.period = {};
                differences.period.StartDate = this.banDocument.info("AccountingDataBase", "OpeningDate");
                differences.period.EndDate = this.banDocument.info("AccountingDataBase", "ClosureDate");
                differences.period.Type = "BDC";
                this.data.unshift(differences);
            }

            //calculate the differences between current and budget (to date) BDT=budget difference to date
            if (this.with_budget && isIncluded && this.dialogparam.includebudget_todate) {
                var differences = this.getCurrAndBudgDiff(data_year_todate, data_budget_todate);
                differences.period = {};
                differences.period.StartDate = this.banDocument.info("AccountingDataBase", "OpeningDate");
                differences.period.EndDate = this.banDocument.info("AccountingDataBase", "ClosureDate");
                differences.period.Type = "BDT";
                var position = this.getArrayPosition(this.data, "BTD", "");
                this.data.splice(position, 0, differences);
            }

        }
        /**
         * searches the array for the position of a certain object, using the ref parameter as a reference.
         * @param {*} array the array where look for the position
         * @param {*} ref this parameter identifies the objects within the array
         * @param {*} position insert before or after in case you want to insert an element either before or after the found position.
         */
    getArrayPosition(array, ref, position) {
        var current_pos = "";

        for (var i = 0; i < array.length; i++) {
            if (array[i].period.Type == ref) {
                current_pos = i;
            }
        }
        switch (position) {
            //previous year
            case "before":
                current_pos -= 1;
                return current_pos;
                //current year (to date)
            case "after":
                current_pos += 1;
                return current_pos;
                //current year projection
            default:
                return current_pos;
        }

        return false;

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

        var groupList = this.fileGroups;
        var budgetBalances = true;
        var budgetToDate = false;
        var currentProjection = false;

        for (var key in dialogparam) {
            this.loadData_Param(dialogparam[key], groupList, currentProjection, budgetBalances, budgetToDate, _banDocument);
        }
        dialogparam.isBudget = true;
        dialogparam.period = {};
        dialogparam.period.StartDate = "Budget";
        dialogparam.period.EndDate = "Budget";
        dialogparam.period.Type = "B";
        return dialogparam;
    }

    loadData_Budget_ToDate(_banDocument) {
        if (!this.banDocument || !_banDocument) {
            return;
        }

        var dialogparam = JSON.stringify(this.dialogparam);
        dialogparam = JSON.parse(dialogparam);

        var groupList = this.fileGroups;

        var budgetBalances = true;
        var budgetToDate = true;
        var currentProjection = false;

        for (var key in dialogparam) {
            this.loadData_Param(dialogparam[key], groupList, currentProjection, budgetBalances, budgetToDate, _banDocument);
        }
        dialogparam.isBudget = true;
        dialogparam.period = {};
        dialogparam.period.StartDate = "Budget";
        dialogparam.period.EndDate = "Budget";
        dialogparam.period.Type = "BTD";
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
    loadData_Year(_banDocument, index) {
        if (!this.banDocument || !_banDocument) {
            return;
        }
        var dialogparam = JSON.stringify(this.dialogparam);
        dialogparam = JSON.parse(dialogparam);

        var budgetBalances = false;
        var budgetToDate = false;
        var currentProjection = false;

        var groupList = this.fileGroups;

        for (var key in dialogparam) {
            this.loadData_Param(dialogparam[key], groupList, currentProjection, budgetBalances, budgetToDate, _banDocument);
        }
        dialogparam.isBudget = false;
        dialogparam.period = {};
        dialogparam.period.StartDate = _banDocument.info("AccountingDataBase", "OpeningDate");
        dialogparam.period.EndDate = _banDocument.info("AccountingDataBase", "ClosureDate");
        //CY=current year, PY=previous year, mi serve riconoscerlo per generare gli header giusti per l'anno corrente
        if (index == 0) {
            dialogparam.period.Type = "CY";
        } else {
            dialogparam.period.Type = "PY";
        }
        return dialogparam;
    }

    loadData_Year_Projection(_banDocument) {
        if (!this.banDocument || !_banDocument) {
            return;
        }

        var dialogparam = JSON.stringify(this.dialogparam);
        dialogparam = JSON.parse(dialogparam);

        var budgetBalances = false;
        var budgetToDate = false;
        var currentProjection = true;

        var groupList = this.fileGroups;

        for (var key in dialogparam) {
            this.loadData_Param(dialogparam[key], groupList, currentProjection, budgetBalances, budgetToDate, _banDocument);
        }
        dialogparam.isBudget = false;
        dialogparam.period = {};
        dialogparam.period.StartDate = _banDocument.info("AccountingDataBase", "OpeningDate");
        dialogparam.period.EndDate = Banana.Converter.toInternalDateFormat(this.dialogparam.currentdate, 'yyyymmdd');
        //CYP=CURRENT YEAR PROJECTION
        dialogparam.period.Type = "CYP";

        return dialogparam;
    }

    loadData_Param(dialogparam, groupList, currentProjection, budgetBalances, budgetToDate, _banDocument) {
        for (var key in dialogparam) {
            if (dialogparam[key] && dialogparam[key].gr) {
                var value = dialogparam[key].gr.toString();
                var valuelist = value.split(";");
                value = "";
                var isAccount = true;
                for (var token in valuelist) {
                    var token = valuelist[token];
                    if (value.length > 0) {
                        value += "|";
                    }
                    if (groupList.indexOf(token) >= 0) {
                        token = token;
                        isAccount = false;
                    }
                    value += token;
                }
                if (!isAccount)
                    value = "Gr=" + value;
                var bal;
                var transactions;
                if (budgetBalances) {
                    var current_date = "";
                    if (budgetToDate) {
                        current_date = Banana.Converter.toInternalDateFormat(this.dialogparam.currentdate, 'yyyymmdd');
                    }
                    bal = _banDocument.budgetBalance(value, "", current_date, null);
                    transactions = _banDocument.budgetCard(value, "", current_date, null);
                } else {
                    var projectionStartDate = "";
                    var endDate = Banana.Converter.toInternalDateFormat(this.dialogparam.currentdate, 'yyyymmdd');
                    if (currentProjection) {
                        projectionStartDate = new Date(Banana.Converter.toInternalDateFormat(this.dialogparam.currentdate, 'yyyymmdd'));
                        //la proiezione la faccio partire dal giorno dopo la data corrente
                        projectionStartDate.setDate(projectionStartDate.getDate() + 1);
                        projectionStartDate = Banana.Converter.toInternalDateFormat(projectionStartDate, 'yyyy-mm-dd');
                        endDate = "";
                    }
                    bal = _banDocument.projectionBalance(value, projectionStartDate, "", endDate, null);
                    transactions = _banDocument.projectionCard(value, projectionStartDate, "", endDate, null);
                }
                var mult = -1;
                if (bal) {
                    //save the balance
                    if (dialogparam[key].bclass === "1") {
                        dialogparam[key].balance = bal.balance;
                        dialogparam[key].opening = bal.opening;
                    } else if (dialogparam[key].bclass === "2") {
                        dialogparam[key].balance = Banana.SDecimal.multiply(bal.balance, mult);
                        dialogparam[key].opening = Banana.SDecimal.multiply(bal.opening, mult);
                    } else if (dialogparam[key].bclass === "3") {
                        dialogparam[key].balance = bal.total;
                    } else if (dialogparam[key].bclass === "4" || !dialogparam[key].bclass) {
                        dialogparam[key].balance = Banana.SDecimal.multiply(bal.total, mult);
                    } else {
                        dialogparam[key].balance = bal.balance;
                    }
                    //finds delta for every element
                    dialogparam[key].delta = Banana.SDecimal.subtract(dialogparam[key].balance, dialogparam[key].opening);
                    //the sign is set to minus for elements of the Assets (to calculate the cashflow);
                    if (dialogparam[key].bclass === "1" && dialogparam[key].acronym !== "liqu") {
                        dialogparam[key].delta = Banana.SDecimal.multiply(dialogparam[key].delta, mult);
                    }
                }

                /**
                 * In questa sezione, se un raggruppamento corrisponde ai criteri, all'oggetto gli aggiungo una proprietà contenente la somma delle registrazioni specifiche trovare
                 */
                if (transactions) {
                    for (var i = 0; i < transactions.rowCount; i++) {
                        let tRow = transactions.row(i);
                        let description = tRow.value('JDescription');
                        description = description.toLowerCase();

                        //find the Disinvestmenst
                        /**
                         * La registrazione di un disinvestimento comporta la diminuzione di un attivo fisso (tangibile, non tangibile o finanziario).
                         */
                        if (description.indexOf("#disinvest") >= 0 && (dialogparam[key].acronym == 'tanfix' || dialogparam[key].acronym == 'finfix' || dialogparam[key].acronym == 'intfix')) {
                            var jAmount = tRow.value('JAmount');
                            if (Banana.SDecimal.sign(jAmount) < 0) {
                                jAmount = Banana.SDecimal.abs(jAmount);
                                dialogparam[key].disinvestments = Banana.SDecimal.add(dialogparam[key].disinvestments, jAmount);
                            }
                        }

                        //find the gain on the sales
                        /**
                         * Le rivalutazioni sono fatte sull'attivo fisso tangibile, e vanno ad aumentare il suo valore inserendo il conto in dare.
                         * -Deve essere registrato utilizzando un gruppo appartenente ai gruppi del campo: Tangible Fixed Assets.
                         */

                        if (description.indexOf("#revaluation") >= 0 && (dialogparam[key].acronym == 'tanfix' || dialogparam[key].acronym == 'finfix' || dialogparam[key].acronym == 'intfix')) {
                            var jAmount = tRow.value('JAmount');
                            if (Banana.SDecimal.sign(jAmount) > 0) {
                                jAmount = Banana.SDecimal.abs(jAmount);
                                dialogparam[key].gain = Banana.SDecimal.add(dialogparam[key].gain, jAmount);
                            }
                        }
                        //find the loss on the sales
                        /**
                         * Le svalutazioni sono fatte sull'attivo fisso tangibile, e va a diminuire il suo valore inserendo il conto in avere.
                         * -Deve essere registrato utilizzando un gruppo appartenente ai gruppi del campo: Tangible Fixed Assets.
                         */
                        if (description.indexOf("#devaluation") >= 0 && (dialogparam[key].acronym == 'tanfix' || dialogparam[key].acronym == 'finfix' || dialogparam[key].acronym == 'intfix')) {
                            var jAmount = tRow.value('JAmount');
                            if (Banana.SDecimal.sign(jAmount) < 0) {
                                jAmount = Banana.SDecimal.abs(jAmount);
                                dialogparam[key].loss = Banana.SDecimal.add(dialogparam[key].loss, jAmount);
                            }
                        }
                        //find the Dividends
                        /**
                         * Il versamento dei dividendi viene registrato facendo diminuire il conto degli utile e perdite, quindi il conto è messo in dare.
                         *-Deve essere registrato utilizzando un gruppo appartenente ai gruppi del campo: Profit / Loss from Balance Sheet
                         */
                        if (description.indexOf("#dividends") >= 0)
                            if (description.indexOf("#dividends") >= 0 && dialogparam[key].acronym == 'balp') {
                                //Banana.console.debug(JSON.stringify(description+", "+dialogparam[key].acronym))
                                var jAmount = tRow.value('JAmount');
                                dialogparam[key].dividends = Banana.SDecimal.add(dialogparam[key].dividends, jAmount);
                            }

                    }
                }
            } else {
                if (typeof(dialogparam[key]) === "object")
                    this.loadData_Param(dialogparam[key], groupList, currentProjection, budgetBalances, budgetToDate, _banDocument);
            }
        }
    }

    getCurrAndBudgDiff(data_current_year, data_budget) {

        var difference = {};
        var texts = this.getFinancialAnalysisTexts();
        //balance
        var balance_current_data = data_current_year.balance;
        var balance_budget_data = data_budget.balance;
        //profit and loss
        var profitandloss_current_data = data_current_year.profitandloss;
        var profitandloss_budget_data = data_budget.profitandloss;
        //final result
        var finalresult_current_data = data_current_year.finalresult;
        var finalresult_budget_data = data_budget.finalresult;
        //totals calculated data
        var totals_current_calculated_data = data_current_year.calculated_data;
        var totals_budget_calculated_data = data_budget.calculated_data;
        // totals cashflow
        var totals_cashflow_current_data = data_current_year.cashflowData;
        var totals_cashflow_budget_data = data_budget.cashflowData;
        //retained earnings statement
        var retained_earnings_current_data = data_current_year.retEarningsData;
        var retained_earnings_budget_data = data_budget.retEarningsData;
        //DupontData
        var dupont_current_data = data_current_year.dupont_data;
        var dupont_budget_data = data_budget.dupont_data;
        //Ratios
        var ratios_current_data = data_current_year.index;
        var ratios_dupont_budget_data = data_budget.index;
        var ratios_param = data_current_year.ratios;
        //Cashflow Ratios
        var cashflow_ratios_current_data = data_current_year.cashflow_index;
        var cashflow_ratios_budget_data = data_budget.cashflow_index;
        //Altman index
        var altman_index_current_data = data_current_year.altman_index;
        var altman_index_budget_data = data_budget.altman_index;
        //Altman index private companies
        var altman_index_pc_current_data = data_current_year.altman_index_pc;
        var altman_index_pc_budget_data = data_budget.altman_index_pc;



        //calculate differences for: balance,profit and loss and their totals
        difference.balance = this.getCurrAndBudgDiff_balance(balance_current_data, balance_budget_data, texts);
        difference.profitandloss = this.getCurrAndBudgDiff_profitandloss(profitandloss_current_data, profitandloss_budget_data, texts);
        difference.finalresult = this.getFinalResult_difference(finalresult_current_data, finalresult_budget_data, texts);
        difference.calculated_data = this.getCalculatedData_difference(totals_current_calculated_data, totals_budget_calculated_data, texts);
        difference.totals = this.getCurrAndBudgDiff_totals(totals_current_calculated_data, totals_budget_calculated_data, texts);

        //calculate differences for: cashflow data
        difference.cashflowData = this.getCurrAndBudgDiff_cashflowData(totals_cashflow_current_data, totals_cashflow_budget_data, texts);

        //calculate the differences for retained earnings
        difference.retEarningsData = this.getCurrAndBudgDiff_retained_earnings(retained_earnings_current_data, retained_earnings_budget_data, texts);

        //calculate differences for dupont
        difference.dupont_data = this.getCurrAndBudgDiff_dupont(dupont_current_data, dupont_budget_data, texts);

        //calculate the differences for ratios
        difference.index = this.getCurrAndBudgDiff_ratios(ratios_current_data, ratios_dupont_budget_data, ratios_param, texts);

        //calculate the differences for cashflow ratios
        difference.cashflow_index = this.getCurrAndBudgDiff_cashflow_ratios(cashflow_ratios_current_data, cashflow_ratios_budget_data, ratios_param, texts);

        //calculate the difference for the altman z score
        difference.altman_index = this.getCurrAndBudgDiff_altmanIndex(altman_index_current_data, altman_index_budget_data, texts);

        //calculate the difference for the altman z score for companies
        difference.altman_index_pc = this.getCurrAndBudgDiff_altmanIndexPC(altman_index_pc_current_data, altman_index_pc_budget_data, texts);



        return difference;


    }
    getCurrAndBudgDiff_retained_earnings(retained_earnings_current_data, retained_earnings_budget_data, texts) {
        let retEarningsData = {};

        retEarningsData.balanceProfitCarriedForward = {};
        retEarningsData.balanceProfitCarriedForward.amountStyle = 'styleNormalAmount'; //define the amount style in the report.
        retEarningsData.balanceProfitCarriedForward.textStyle = 'styleTablRows'; //define the description style in the report.
        retEarningsData.balanceProfitCarriedForward.description = texts.balanceProfitCarriedForward;
        retEarningsData.balanceProfitCarriedForward.amount = Banana.SDecimal.subtract(retained_earnings_current_data.balanceProfitCarriedForward.amount, retained_earnings_budget_data.balanceProfitCarriedForward.amount);


        retEarningsData.annualResult = {};
        retEarningsData.annualResult.amountStyle = 'styleNormalAmount';
        retEarningsData.annualResult.textStyle = 'styleTablRows';
        retEarningsData.annualResult.description = texts.annualResult_retEarnings;
        retEarningsData.annualResult.amount = Banana.SDecimal.subtract(retained_earnings_current_data.annualResult.amount, retained_earnings_budget_data.annualResult.amount);

        retEarningsData.dividends = {};
        retEarningsData.dividends.amountStyle = 'styleNormalAmount';
        retEarningsData.dividends.textStyle = 'styleTablRows';
        retEarningsData.dividends.description = texts.dividends;
        retEarningsData.dividends.amount = Banana.SDecimal.subtract(retained_earnings_current_data.dividends.amount, retained_earnings_budget_data.dividends.amount);

        retEarningsData.reserves = {};
        retEarningsData.reserves.amountStyle = 'styleNormalAmount';
        retEarningsData.reserves.textStyle = 'styleTablRows';
        retEarningsData.reserves.description = texts.reservesVariation;
        retEarningsData.reserves.amount = Banana.SDecimal.subtract(retained_earnings_current_data.reserves.amount, retained_earnings_budget_data.reserves.amount);

        retEarningsData.calcTotal = function() {
            let total = "";
            total = Banana.SDecimal.add(total, this.balanceProfitCarriedForward.amount);
            total = Banana.SDecimal.add(total, this.annualResult.amount);
            total = Banana.SDecimal.subtract(total, this.dividends.amount);
            total = Banana.SDecimal.subtract(total, this.reserves.amount);
            return total;
        }

        retEarningsData.totalRetainedEarning = {};
        retEarningsData.totalRetainedEarning.amountStyle = 'styleMidTotalAmount';
        retEarningsData.totalRetainedEarning.textStyle = 'styleUnderGroupTitles';
        retEarningsData.totalRetainedEarning.description = texts.totalRetainedEarning;
        retEarningsData.totalRetainedEarning.amount = Banana.SDecimal.subtract(retained_earnings_current_data.totalRetainedEarning.amount, retained_earnings_budget_data.totalRetainedEarning.amount);

        retEarningsData.currentYearRetainedEarning = {};
        retEarningsData.currentYearRetainedEarning.amountStyle = 'styleMidTotalAmount';
        retEarningsData.currentYearRetainedEarning.textStyle = 'styleUnderGroupTitles';
        retEarningsData.currentYearRetainedEarning.description = texts.currentYearRetainedEarning;
        retEarningsData.currentYearRetainedEarning.amount = Banana.SDecimal.subtract(retained_earnings_current_data.currentYearRetainedEarning.amount, retained_earnings_current_data.currentYearRetainedEarning.amount);

        return retEarningsData;

    }

    getCurrAndBudgDiff_altmanIndex(altman_index_current_data, altman_index_budget_data, texts) {

        let altmanIndexObj = {};
        let finalScore = "";

        //Ponderazioni.
        let pondA = 1.2;
        let pondB = 1.4;
        let pondC = 3.3;
        let pondD = 0.6;
        let pondE = 0.999;
        let pondZScore = 1; //da aggiungere con stile bold centrato.

        //A
        altmanIndexObj.ratioA = {};
        altmanIndexObj.ratioA.text = {};
        altmanIndexObj.ratioA.text.descr = texts.altmanRatioADescription;
        altmanIndexObj.ratioA.text.style = "";
        altmanIndexObj.ratioA.formula = {};
        altmanIndexObj.ratioA.formula.descr = texts.altmanFormulaA;
        altmanIndexObj.ratioA.formula.style = "";
        altmanIndexObj.ratioA.weighting = {};
        altmanIndexObj.ratioA.weighting.descr = pondA.toString();
        altmanIndexObj.ratioA.weighting.style = "styleCentralText";
        altmanIndexObj.ratioA.amount = {};
        altmanIndexObj.ratioA.amount.value = Banana.SDecimal.subtract(altman_index_current_data.ratioA.amount.value, altman_index_budget_data.ratioA.amount.value, { 'decimals': this.dialogparam.numberofdecimals });
        altmanIndexObj.ratioA.amount.style = "styleNormalAmount";
        //B
        altmanIndexObj.ratioB = {};
        altmanIndexObj.ratioB.text = {};
        altmanIndexObj.ratioB.text.descr = texts.altmanRatioBDescription;
        altmanIndexObj.ratioB.text.style = "";
        altmanIndexObj.ratioB.formula = {};
        altmanIndexObj.ratioB.formula.descr = texts.altmanFormulaB;
        altmanIndexObj.ratioB.formula.style = "";
        altmanIndexObj.ratioB.weighting = {};
        altmanIndexObj.ratioB.weighting.descr = pondB.toString();
        altmanIndexObj.ratioB.weighting.style = "styleCentralText";
        altmanIndexObj.ratioB.amount = {};
        altmanIndexObj.ratioB.amount.value = Banana.SDecimal.subtract(altman_index_current_data.ratioB.amount.value, altman_index_budget_data.ratioB.amount.value, { 'decimals': this.dialogparam.numberofdecimals });
        altmanIndexObj.ratioB.amount.style = "styleNormalAmount";
        //C
        altmanIndexObj.ratioC = {};
        altmanIndexObj.ratioC.text = {};
        altmanIndexObj.ratioC.text.descr = texts.altmanRatioCDescription;
        altmanIndexObj.ratioC.text.style = "";
        altmanIndexObj.ratioC.formula = {};
        altmanIndexObj.ratioC.formula.descr = texts.altmanFormulaC;
        altmanIndexObj.ratioC.formula.style = "";
        altmanIndexObj.ratioC.weighting = {};
        altmanIndexObj.ratioC.weighting.descr = pondC.toString();
        altmanIndexObj.ratioC.weighting.style = "styleCentralText";
        altmanIndexObj.ratioC.amount = {};
        altmanIndexObj.ratioC.amount.value = Banana.SDecimal.subtract(altman_index_current_data.ratioC.amount.value, altman_index_budget_data.ratioC.amount.value, { 'decimals': this.dialogparam.numberofdecimals });
        altmanIndexObj.ratioC.amount.style = "styleNormalAmount";
        //D
        altmanIndexObj.ratioD = {};
        altmanIndexObj.ratioD.text = {};
        altmanIndexObj.ratioD.text.descr = texts.altmanRatioDDescription;
        altmanIndexObj.ratioD.text.style = "";
        altmanIndexObj.ratioD.formula = {};
        altmanIndexObj.ratioD.formula.descr = texts.altmanFormulaD;
        altmanIndexObj.ratioD.formula.style = "";
        altmanIndexObj.ratioD.weighting = {};
        altmanIndexObj.ratioD.weighting.descr = pondD.toString();
        altmanIndexObj.ratioD.weighting.style = "styleCentralText";
        altmanIndexObj.ratioD.amount = {};
        altmanIndexObj.ratioD.amount.value = Banana.SDecimal.subtract(altman_index_current_data.ratioD.amount.value, altman_index_budget_data.ratioD.amount.value, { 'decimals': this.dialogparam.numberofdecimals });
        altmanIndexObj.ratioD.amount.style = "styleNormalAmount";

        //E
        altmanIndexObj.ratioE = {};
        altmanIndexObj.ratioE.text = {};
        altmanIndexObj.ratioE.text.descr = texts.altmanRatioEDescription;
        altmanIndexObj.ratioE.text.style = "";
        altmanIndexObj.ratioE.formula = {};
        altmanIndexObj.ratioE.formula.descr = texts.altmanFormulaE;
        altmanIndexObj.ratioE.formula.style = "";
        altmanIndexObj.ratioE.weighting = {};
        altmanIndexObj.ratioE.weighting.descr = pondE.toString();
        altmanIndexObj.ratioE.weighting.style = "styleCentralText";
        altmanIndexObj.ratioE.amount = {};
        altmanIndexObj.ratioE.amount.value = Banana.SDecimal.subtract(altman_index_current_data.ratioE.amount.value, altman_index_budget_data.ratioE.amount.value, { 'decimals': this.dialogparam.numberofdecimals });
        altmanIndexObj.ratioE.amount.style = "styleNormalAmount";

        //Final Result
        if (altmanIndexObj) {
            for (var key in altmanIndexObj) {
                finalScore = Banana.SDecimal.add(altmanIndexObj[key].amount.value, finalScore, { 'decimals': this.dialogparam.numberofdecimals });
            }
        }
        altmanIndexObj.finalScore = {};
        altmanIndexObj.finalScore.text = {};
        altmanIndexObj.finalScore.text.descr = texts.altmanFinalZScore;
        altmanIndexObj.finalScore.text.style = "styleUnderGroupTitles";
        altmanIndexObj.finalScore.formula = {};
        altmanIndexObj.finalScore.formula.descr = texts.altmanZScoreFormula;
        altmanIndexObj.finalScore.formula.style = "styleUnderGroupTitles";
        altmanIndexObj.finalScore.weighting = {};
        altmanIndexObj.finalScore.weighting.descr = ""
        altmanIndexObj.finalScore.weighting.style = "";
        altmanIndexObj.finalScore.amount = {};
        altmanIndexObj.finalScore.amount.value = finalScore;
        altmanIndexObj.finalScore.amount.style = "styleMidTotalAmount";

        return altmanIndexObj;

    }

    getCurrAndBudgDiff_altmanIndexPC(altman_index_current_data, altman_index_budget_data, texts) {

        let altmanIndexObj = {};
        let finalScore = "";
        //Ponderazioni.
        let pondA = 0.717;
        let pondB = 0.847;
        let pondC = 3.107;
        let pondD = 0.420;
        let pondE = 0.998;
        let pondZScore = 1; //da aggiungere con stile bold centrato.

        //A
        altmanIndexObj.ratioA = {};
        altmanIndexObj.ratioA.text = {};
        altmanIndexObj.ratioA.text.descr = texts.altmanRatioADescriptionPC;
        altmanIndexObj.ratioA.text.style = "";
        altmanIndexObj.ratioA.formula = {};
        altmanIndexObj.ratioA.formula.descr = texts.altmanFormulaA;
        altmanIndexObj.ratioA.formula.style = "";
        altmanIndexObj.ratioA.weighting = {};
        altmanIndexObj.ratioA.weighting.descr = pondA.toString();
        altmanIndexObj.ratioA.weighting.style = "styleCentralText";
        altmanIndexObj.ratioA.amount = {};
        altmanIndexObj.ratioA.amount.value = Banana.SDecimal.subtract(altman_index_current_data.ratioA.amount.value, altman_index_budget_data.ratioA.amount.value, { 'decimals': this.dialogparam.numberofdecimals });
        altmanIndexObj.ratioA.amount.style = "styleNormalAmount";
        //B
        altmanIndexObj.ratioB = {};
        altmanIndexObj.ratioB.text = {};
        altmanIndexObj.ratioB.text.descr = texts.altmanRatioBDescription;
        altmanIndexObj.ratioB.text.style = "";
        altmanIndexObj.ratioB.formula = {};
        altmanIndexObj.ratioB.formula.descr = texts.altmanFormulaB;
        altmanIndexObj.ratioB.formula.style = "";
        altmanIndexObj.ratioB.weighting = {};
        altmanIndexObj.ratioB.weighting.descr = pondB.toString();
        altmanIndexObj.ratioB.weighting.style = "styleCentralText";
        altmanIndexObj.ratioB.amount = {};
        altmanIndexObj.ratioB.amount.value = Banana.SDecimal.subtract(altman_index_current_data.ratioB.amount.value, altman_index_budget_data.ratioB.amount.value, { 'decimals': this.dialogparam.numberofdecimals });
        altmanIndexObj.ratioB.amount.style = "styleNormalAmount";
        //C
        altmanIndexObj.ratioC = {};
        altmanIndexObj.ratioC.text = {};
        altmanIndexObj.ratioC.text.descr = texts.altmanRatioCDescription;
        altmanIndexObj.ratioC.text.style = "";
        altmanIndexObj.ratioC.formula = {};
        altmanIndexObj.ratioC.formula.descr = texts.altmanFormulaC;
        altmanIndexObj.ratioC.formula.style = "";
        altmanIndexObj.ratioC.weighting = {};
        altmanIndexObj.ratioC.weighting.descr = pondC.toString();
        altmanIndexObj.ratioC.weighting.style = "styleCentralText";
        altmanIndexObj.ratioC.amount = {};
        altmanIndexObj.ratioC.amount.value = Banana.SDecimal.subtract(altman_index_current_data.ratioC.amount.value, altman_index_budget_data.ratioC.amount.value, { 'decimals': this.dialogparam.numberofdecimals });
        altmanIndexObj.ratioC.amount.style = "styleNormalAmount";
        //D
        altmanIndexObj.ratioD = {};
        altmanIndexObj.ratioD.text = {};
        altmanIndexObj.ratioD.text.descr = texts.altmanRatioDDescriptionPC;
        altmanIndexObj.ratioD.text.style = "";
        altmanIndexObj.ratioD.formula = {};
        altmanIndexObj.ratioD.formula.descr = texts.altmanFormulaD;
        altmanIndexObj.ratioD.formula.style = "";
        altmanIndexObj.ratioD.weighting = {};
        altmanIndexObj.ratioD.weighting.descr = pondD.toString();
        altmanIndexObj.ratioD.weighting.style = "styleCentralText";
        altmanIndexObj.ratioD.amount = {};
        altmanIndexObj.ratioD.amount.value = Banana.SDecimal.subtract(altman_index_current_data.ratioD.amount.value, altman_index_budget_data.ratioD.amount.value, { 'decimals': this.dialogparam.numberofdecimals });
        altmanIndexObj.ratioD.amount.style = "styleNormalAmount";

        //E
        altmanIndexObj.ratioE = {};
        altmanIndexObj.ratioE.text = {};
        altmanIndexObj.ratioE.text.descr = texts.altmanRatioEDescription;
        altmanIndexObj.ratioE.text.style = "";
        altmanIndexObj.ratioE.formula = {};
        altmanIndexObj.ratioE.formula.descr = texts.altmanFormulaE;
        altmanIndexObj.ratioE.formula.style = "";
        altmanIndexObj.ratioE.weighting = {};
        altmanIndexObj.ratioE.weighting.descr = pondE.toString();
        altmanIndexObj.ratioE.weighting.style = "styleCentralText";
        altmanIndexObj.ratioE.amount = {};
        altmanIndexObj.ratioE.amount.value = Banana.SDecimal.subtract(altman_index_current_data.ratioE.amount.value, altman_index_budget_data.ratioE.amount.value, { 'decimals': this.dialogparam.numberofdecimals });
        altmanIndexObj.ratioE.amount.style = "styleNormalAmount";

        //Final Result
        if (altmanIndexObj) {
            for (var key in altmanIndexObj) {
                finalScore = Banana.SDecimal.add(altmanIndexObj[key].amount.value, finalScore, { 'decimals': this.dialogparam.numberofdecimals });
            }
        }
        altmanIndexObj.finalScore = {};
        altmanIndexObj.finalScore.text = {};
        altmanIndexObj.finalScore.text.descr = texts.altmanFinalZScore;
        altmanIndexObj.finalScore.text.style = "styleUnderGroupTitles";
        altmanIndexObj.finalScore.formula = {};
        altmanIndexObj.finalScore.formula.descr = texts.altmanZScoreFormulaPC;
        altmanIndexObj.finalScore.formula.style = "styleUnderGroupTitles";
        altmanIndexObj.finalScore.weighting = {};
        altmanIndexObj.finalScore.weighting.descr = ""
        altmanIndexObj.finalScore.weighting.style = "";
        altmanIndexObj.finalScore.amount = {};
        altmanIndexObj.finalScore.amount.value = finalScore;
        altmanIndexObj.finalScore.amount.style = "styleMidTotalAmount";

        return altmanIndexObj;

    }

    getCurrAndBudgDiff_cashflow_ratios(cashflow_ratios_current_data, cashflow_ratios_budget_data, ratios_param, texts) {
        var cashflow_ratios = {};

        cashflow_ratios.cashflow_margin = {};
        cashflow_ratios.cashflow_margin.description = texts.cashflow_margin;
        cashflow_ratios.cashflow_margin.formula = "cashflow(A)/satu";
        cashflow_ratios.cashflow_margin.amount = Banana.SDecimal.subtract(cashflow_ratios_current_data.cashflow_margin.amount, cashflow_ratios_budget_data.cashflow_margin.amount);
        cashflow_ratios.cashflow_margin.type = "perc";
        cashflow_ratios.cashflow_margin.benchmark = ratios_param.cashflowratios.cashflow_margin.value;

        cashflow_ratios.cashflow_asset_efficiency = {};
        cashflow_ratios.cashflow_asset_efficiency.description = texts.cashflow_asset_efficiency;
        cashflow_ratios.cashflow_asset_efficiency.formula = "cashflow(A)/fixa";
        cashflow_ratios.cashflow_asset_efficiency.amount = Banana.SDecimal.subtract(cashflow_ratios_current_data.cashflow_asset_efficiency.amount, cashflow_ratios_budget_data.cashflow_asset_efficiency.amount);
        cashflow_ratios.cashflow_asset_efficiency.benchmark = ratios_param.cashflowratios.cashflow_asset_efficiency.value;
        cashflow_ratios.cashflow_asset_efficiency.type = "prec";

        cashflow_ratios.cashflow_current_liabilities = {};
        cashflow_ratios.cashflow_current_liabilities.formula = "cashflow(A)/stdc";
        cashflow_ratios.cashflow_current_liabilities.description = texts.cashflow_current_liabilities;
        cashflow_ratios.cashflow_current_liabilities.amount = Banana.SDecimal.subtract(cashflow_ratios_current_data.cashflow_current_liabilities.amount, cashflow_ratios_budget_data.cashflow_current_liabilities.amount);
        cashflow_ratios.cashflow_current_liabilities.benchmark = ratios_param.cashflowratios.cashflow_current_liabilities.value;
        cashflow_ratios.cashflow_current_liabilities.type = "perc";

        cashflow_ratios.cashflow_liabilities = {};
        cashflow_ratios.cashflow_liabilities.description = texts.cashflow_liabilities;
        cashflow_ratios.cashflow_liabilities.formula = "cashflow(A)/deca";
        cashflow_ratios.cashflow_liabilities.amount = Banana.SDecimal.subtract(cashflow_ratios_current_data.cashflow_liabilities.amount, cashflow_ratios_budget_data.cashflow_liabilities.amount);
        cashflow_ratios.cashflow_liabilities.benchmark = ratios_param.cashflowratios.cashflow_liabilities.value;
        cashflow_ratios.cashflow_liabilities.type = "perc";

        cashflow_ratios.cashflow_to_investments = {};
        cashflow_ratios.cashflow_to_investments.formula = "cashflow(A)/inve";
        cashflow_ratios.cashflow_to_investments.description = texts.cashflow_to_investments;
        cashflow_ratios.cashflow_to_investments.amount = Banana.SDecimal.subtract(cashflow_ratios_current_data.cashflow_to_investments.amount, cashflow_ratios_budget_data.cashflow_to_investments.amount);
        cashflow_ratios.cashflow_to_investments.benchmark = ratios_param.cashflowratios.cashflow_to_investments.value;
        cashflow_ratios.cashflow_to_investments.type = "perc";


        return cashflow_ratios;

    }

    getCurrAndBudgDiff_ratios(ratios_current_data, ratios_budget_data, ratios_param, text) {

        var ratios = {};
        var texts = text;
        var ratios_data = ratios_param;

        ratios.liqu = this.getCurrAndBudgDiff_ratio_liqu(ratios_current_data.liqu, ratios_budget_data.liqu, ratios_data, texts);
        ratios.lev = this.getCurrAndBudgDiff_ratios_lev(ratios_current_data.lev, ratios_budget_data.lev, ratios_data, texts);
        ratios.red = this.getCurrAndBudgDiff_ratios_red(ratios_current_data.red, ratios_budget_data.red, ratios_data, texts);
        ratios.eff = this.getCurrAndBudgDiff_ratios_eff(ratios_current_data.eff, ratios_budget_data.eff, ratios_data, texts);

        return ratios;

    }

    getCurrAndBudgDiff_ratio_liqu(ratios_current_liqu_data, ratios_budget_liqu_data, ratios_data, texts) {

        var liqu = {};

        //i need to kwnow for this ratios if it's a decimal type or percentage

        liqu.doflone = {};
        liqu.doflone.description = texts.cashratio;
        liqu.doflone.type = "perc";
        liqu.doflone.formula = "liqu / stdc";
        liqu.doflone.benchmark = ratios_data.liquidityratios.cashratio.value;
        liqu.doflone.amount = Banana.SDecimal.subtract(ratios_current_liqu_data.doflone.amount, ratios_budget_liqu_data.doflone.amount);

        liqu.dofltwo = {};
        liqu.dofltwo.description = texts.quickratio;
        liqu.dofltwo.type = "perc";
        liqu.dofltwo.formula = "(liqu + cred) / stdc";
        liqu.dofltwo.benchmark = ratios_data.liquidityratios.quickratio.value;
        liqu.dofltwo.amount = Banana.SDecimal.subtract(ratios_current_liqu_data.dofltwo.amount, ratios_budget_liqu_data.dofltwo.amount);

        liqu.doflthree = {};
        liqu.doflthree.description = texts.currentratio;
        liqu.doflthree.type = "perc";
        liqu.doflthree.formula = "cuas / stdc";
        liqu.doflthree.benchmark = ratios_data.liquidityratios.currentratio.value;
        liqu.doflthree.amount = Banana.SDecimal.subtract(ratios_current_liqu_data.doflthree.amount, ratios_budget_liqu_data.doflthree.amount);

        liqu.netcuas = {};
        liqu.netcuas.description = texts.netcurrentasset;
        liqu.netcuas.type = "dec";
        liqu.netcuas.formula = "cuas-stdc";
        liqu.netcuas.benchmark = ratios_data.liquidityratios.netcurrentasset.value;
        liqu.netcuas.amount = Banana.SDecimal.subtract(ratios_current_liqu_data.netcuas.amount, ratios_budget_liqu_data.netcuas.amount);

        return liqu;
    }

    getCurrAndBudgDiff_ratios_lev(ratios_current_lev_data, ratios_budget_lev_data, ratios_data, texts) {

        var lev = {};

        lev.grcuas = {};
        lev.grcuas.description = texts.degreecirculatingasset;
        lev.grcuas.amount = Banana.SDecimal.subtract(ratios_current_lev_data.grcuas.amount, ratios_budget_lev_data.grcuas.amount);
        lev.grcuas.formula = "cuas / tota";
        lev.grcuas.benchmark = ratios_data.leverageratios.degreecirculatingasset.value;
        lev.grcuas.type = "perc";

        lev.grfixa = {};
        lev.grfixa.description = texts.percentagefixedasset;
        lev.grfixa.amount = Banana.SDecimal.subtract(ratios_current_lev_data.grfixa.amount, ratios_budget_lev_data.grfixa.amount);
        lev.grfixa.formula = "fixa / tota";
        lev.grfixa.benchmark = ratios_data.leverageratios.percentagefixedasset.value;
        lev.grfixa.type = "perc";

        lev.gdin = {};
        lev.gdin.description = texts.debtratio;
        lev.gdin.amount = Banana.SDecimal.subtract(ratios_current_lev_data.gdin.amount, ratios_budget_lev_data.gdin.amount);
        lev.gdin.formula = "(stdc+ltdc) / totle";
        lev.gdin.benchmark = ratios_data.leverageratios.debtratio.value;
        lev.gdin.type = "perc";

        lev.gfcp = {};
        lev.gfcp.description = texts.equityratio;
        lev.gfcp.amount = Banana.SDecimal.subtract(ratios_current_lev_data.gfcp.amount, ratios_budget_lev_data.gfcp.amount);
        lev.gfcp.formula = "owca / totle";
        lev.gfcp.benchmark = ratios_data.leverageratios.equityratio.value;
        lev.gfcp.type = "perc";

        lev.gdau = {};
        lev.gdau.description = texts.selfinancingratio;
        lev.gdau.amount = Banana.SDecimal.subtract(ratios_current_lev_data.gdau.amount, ratios_budget_lev_data.gdau.amount);
        lev.gdau.formula = "rese / owca";
        lev.gdau.benchmark = ratios_data.leverageratios.selfinancingratio.value;
        lev.gdau.type = "perc";

        lev.fixaco = {};
        lev.fixaco.description = texts.fixedassetcoverage;
        lev.fixaco.amount = Banana.SDecimal.subtract(ratios_current_lev_data.fixaco.amount, ratios_budget_lev_data.fixaco.amount);
        lev.fixaco.formula = "(owca + ltdc) / fixa";
        lev.fixaco.benchmark = ratios_data.leverageratios.fixedassetcoverage.value;
        lev.fixaco.type = "perc";

        return lev;

    }

    getCurrAndBudgDiff_ratios_red(ratios_current_red_data, ratios_budget_red_data, ratios_data, texts) {

        var red = {};

        red.roe = {};
        red.roe.description = texts.roe;
        red.roe.formula = "profit / owca";
        red.roe.amount = Banana.SDecimal.subtract(ratios_current_red_data.roe.amount, ratios_budget_red_data.roe.amount);
        red.roe.benchmark = ratios_data.profitabilityratios.profroe.value;
        red.roe.type = "perc";

        red.roi = {};
        red.roi.description = texts.roi;
        red.roi.formula = "EBIT / tota  ";
        red.roi.amount = Banana.SDecimal.subtract(ratios_current_red_data.roi.amount, ratios_budget_red_data.roi.amount);
        red.roi.benchmark = ratios_data.profitabilityratios.profroi.value;
        red.roi.type = "perc";

        red.ros = {};
        red.ros.description = texts.ros;
        red.ros.formula = "EBIT / satu";
        red.ros.amount = Banana.SDecimal.subtract(ratios_current_red_data.ros.amount, ratios_budget_red_data.ros.amount);
        red.ros.benchmark = ratios_data.profitabilityratios.profros.value;
        red.ros.type = "perc";

        red.mol = {};
        red.mol.description = texts.mol;
        red.mol.formula = "EBITDA / satu";
        red.mol.amount = Banana.SDecimal.subtract(ratios_current_red_data.mol.amount, ratios_budget_red_data.mol.amount);
        red.mol.benchmark = ratios_data.profitabilityratios.profmol.value;
        red.mol.type = "perc";

        red.ebm = {};
        red.ebm.description = texts.ebtmargin;
        red.ebm.formula = "EBT / satu";
        red.ebm.amount = Banana.SDecimal.subtract(ratios_current_red_data.ebm.amount, ratios_budget_red_data.ebm.amount);
        red.ebm.benchmark = ratios_data.profitabilityratios.profebm.value;
        red.ebm.type = "perc";

        red.mon = {};
        red.mon.description = texts.profitmargin;
        red.mon.formula = "net profit / satu";
        red.mon.amount = Banana.SDecimal.subtract(ratios_current_red_data.mon.amount, ratios_budget_red_data.mon.amount);
        red.mon.benchmark = ratios_data.profitabilityratios.profmon.value;;
        red.mon.type = "perc";

        return red;
    }

    getCurrAndBudgDiff_ratios_eff(ratios_current_eff_data, ratios_budget_eff_data, ratios_data, texts) {

        var eff = {};

        eff.rpe = {};
        eff.rpe.description = texts.revenueperemployee;
        eff.rpe.formula = texts.efficiencyRPE;
        eff.rpe.amount = Banana.SDecimal.subtract(ratios_current_eff_data.rpe.amount, ratios_budget_eff_data.rpe.amount);
        eff.rpe.benchmark = ratios_data.efficiencyratios.revenueperemployee.value;
        eff.rpe.type = "dec"

        eff.ape = {};
        eff.ape.description = texts.addedvalueperemployee;
        eff.ape.formula = texts.efficiencyAVE;
        eff.ape.amount = Banana.SDecimal.subtract(ratios_current_eff_data.ape.amount, ratios_budget_eff_data.ape.amount);
        eff.ape.benchmark = ratios_data.efficiencyratios.addedvalueperemployee.value;
        eff.ape.type = "dec";

        eff.emp = {};
        eff.emp.description = texts.personnelcostperemployee;
        eff.emp.formula = texts.efficiencyPCE;
        eff.emp.amount = Banana.SDecimal.subtract(ratios_current_eff_data.emp.amount, ratios_budget_eff_data.emp.amount);
        eff.emp.benchmark = ratios_data.efficiencyratios.personnelcostperemployee.value;
        eff.emp.type = "dec";

        return eff;
    }

    getCurrAndBudgDiff_balance(current_balance_data, budget_balance_data, text) {

        var balance = {};
        var texts = text;

        balance.ca = this.getCurrAndBudgDiff_balance_ca(current_balance_data.ca, budget_balance_data.ca, texts);
        balance.fa = this.getCurrAndBudgDiff_balance_fa(current_balance_data.fa, budget_balance_data.fa, texts);
        balance.stdc = this.getCurrAndBudgDiff_balance_stdc(current_balance_data.stdc, budget_balance_data.stdc, texts);
        balance.ltdc = this.getCurrAndBudgDiff_balance_ltdc(current_balance_data.ltdc, budget_balance_data.ltdc, texts);
        balance.oc = this.getCurrAndBudgDiff_balance_oc(current_balance_data.oc, budget_balance_data.oc, texts);

        return balance;
    }

    getCurrAndBudgDiff_balance_ca(current_balance_ca_data, budget_balance_ca_data, texts) {
        var currentAssets = {};

        currentAssets.liquidity = {};
        currentAssets.liquidity.acronym = texts.liquidity_acronym;
        currentAssets.liquidity.balance = Banana.SDecimal.subtract(current_balance_ca_data.liquidity.balance, budget_balance_ca_data.liquidity.balance);

        currentAssets.credits = {};
        currentAssets.credits.acronym = texts.credits_acronym;
        currentAssets.credits.balance = Banana.SDecimal.subtract(current_balance_ca_data.credits.balance, budget_balance_ca_data.credits.balance);
        currentAssets.credits.delta = Banana.SDecimal.subtract(current_balance_ca_data.credits.delta, budget_balance_ca_data.credits.delta);

        currentAssets.stocks = {};
        currentAssets.stocks.acronym = texts.stocks_acronym;
        currentAssets.stocks.balance = Banana.SDecimal.subtract(current_balance_ca_data.stocks.balance, budget_balance_ca_data.stocks.balance);
        currentAssets.stocks.delta = Banana.SDecimal.subtract(current_balance_ca_data.stocks.delta, budget_balance_ca_data.stocks.delta);

        currentAssets.prepaid_expenses = {};
        currentAssets.prepaid_expenses.acronym = texts.prepaid_expenses_acronym;
        currentAssets.prepaid_expenses.balance = Banana.SDecimal.subtract(current_balance_ca_data.prepaid_expenses.balance, budget_balance_ca_data.prepaid_expenses.balance);
        currentAssets.prepaid_expenses.delta = Banana.SDecimal.subtract(current_balance_ca_data.prepaid_expenses.delta, budget_balance_ca_data.prepaid_expenses.delta);

        return currentAssets;


    }
    getCurrAndBudgDiff_balance_fa(current_balance_fa_data, budget_balance_fa_data, texts) {
        var fixedAssets = {};

        fixedAssets.financial_fixedassets = {};
        fixedAssets.financial_fixedassets.acronym = texts.financial_fixedassets_acronym;
        fixedAssets.financial_fixedassets.balance = Banana.SDecimal.subtract(current_balance_fa_data.financial_fixedassets.balance, budget_balance_fa_data.financial_fixedassets.balance);

        fixedAssets.tangible_fixedassets = {};
        fixedAssets.tangible_fixedassets.acronym = texts.tangible_fixedassets_acronym;
        fixedAssets.tangible_fixedassets.balance = Banana.SDecimal.subtract(current_balance_fa_data.tangible_fixedassets.balance, budget_balance_fa_data.tangible_fixedassets.balance);

        fixedAssets.intangible_fixedassets = {};
        fixedAssets.intangible_fixedassets.acronym = texts.intangible_fixedassets_acronym;
        fixedAssets.intangible_fixedassets.balance = Banana.SDecimal.subtract(current_balance_fa_data.intangible_fixedassets.balance, budget_balance_fa_data.intangible_fixedassets.balance);

        return fixedAssets;

    }
    getCurrAndBudgDiff_balance_stdc(current_balance_stdc_data, budget_balance_stdc_data, texts) {
        var shortTermDebtCapital = {};

        shortTermDebtCapital.debts = {};
        shortTermDebtCapital.debts.acronym = texts.debts_acronym;
        shortTermDebtCapital.debts.balance = Banana.SDecimal.subtract(current_balance_stdc_data.debts.balance, budget_balance_stdc_data.debts.balance);
        shortTermDebtCapital.debts.delta = Banana.SDecimal.subtract(current_balance_stdc_data.debts.delta, budget_balance_stdc_data.debts.delta);

        shortTermDebtCapital.accruals_and_deferred_income = {};
        shortTermDebtCapital.accruals_and_deferred_income.acronym = texts.accruals_and_deferred_income_acronym;
        shortTermDebtCapital.accruals_and_deferred_income.balance = Banana.SDecimal.subtract(current_balance_stdc_data.accruals_and_deferred_income.balance, budget_balance_stdc_data.accruals_and_deferred_income.balance);
        shortTermDebtCapital.accruals_and_deferred_income.delta = Banana.SDecimal.subtract(current_balance_stdc_data.accruals_and_deferred_income.delta, budget_balance_stdc_data.accruals_and_deferred_income.delta);

        return shortTermDebtCapital;

    }
    getCurrAndBudgDiff_balance_ltdc(current_balance_ltdc_data, budget_balance_ltdc_data, texts) {
        var longTermDebtCapital = {};

        longTermDebtCapital.longter_debts = {};
        longTermDebtCapital.longter_debts.acronym = texts.longter_debts_acronym;
        longTermDebtCapital.longter_debts.balance = Banana.SDecimal.subtract(current_balance_ltdc_data.longter_debts.balance, budget_balance_ltdc_data.longter_debts.balance);
        longTermDebtCapital.longter_debts.delta = Banana.SDecimal.subtract(current_balance_ltdc_data.longter_debts.delta, budget_balance_ltdc_data.longter_debts.delta);

        longTermDebtCapital.provisionsandsimilar = {};
        longTermDebtCapital.provisionsandsimilar.acronym = texts.provisionsandsimilar_acronym;
        longTermDebtCapital.provisionsandsimilar.balance = Banana.SDecimal.subtract(current_balance_ltdc_data.provisionsandsimilar.balance, budget_balance_ltdc_data.provisionsandsimilar.balance);

        return longTermDebtCapital;

    }

    getCurrAndBudgDiff_balance_oc(current_balance_oc_data, budget_balance_oc_data, texts) {
        var ownCapital = {};

        ownCapital.ownbasecapital = {};
        ownCapital.ownbasecapital.acronym = texts.ownbasecapital_acronym;
        ownCapital.ownbasecapital.balance = Banana.SDecimal.subtract(current_balance_oc_data.ownbasecapital.balance, budget_balance_oc_data.ownbasecapital.balance);
        ownCapital.ownbasecapital.delta = Banana.SDecimal.subtract(current_balance_oc_data.ownbasecapital.delta, budget_balance_oc_data.ownbasecapital.delta);

        ownCapital.reserves = {};
        ownCapital.reserves.acronym = texts.reserves_acronym;
        ownCapital.reserves.balance = Banana.SDecimal.subtract(current_balance_oc_data.reserves.balance, budget_balance_oc_data.reserves.balance);

        ownCapital.balanceProfits = {};
        ownCapital.balanceProfits.acronym = texts.balanceProfits_acronym;
        ownCapital.balanceProfits.balance = Banana.SDecimal.subtract(current_balance_oc_data.balanceProfits.balance, budget_balance_oc_data.balanceProfits.balance);

        return ownCapital;

    }


    getCurrAndBudgDiff_profitandloss(current_profitandloss_data, budget_profitandloss_data, texts) {
        var profitandloss = {};

        profitandloss.salesturnover = {};
        profitandloss.salesturnover.acronym = texts.salesturnover_acronym;
        profitandloss.salesturnover.balance = Banana.SDecimal.subtract(current_profitandloss_data.salesturnover.balance, budget_profitandloss_data.salesturnover.balance);

        profitandloss.costofmerchandservices = {};
        profitandloss.costofmerchandservices.acronym = texts.costofmerchandservices_acronym;
        profitandloss.costofmerchandservices.balance = Banana.SDecimal.subtract(current_profitandloss_data.costofmerchandservices.balance, budget_profitandloss_data.costofmerchandservices.balance);

        profitandloss.personnelcosts = {};
        profitandloss.personnelcosts.acronym = texts.personnelcosts_acronym;
        profitandloss.personnelcosts.balance = Banana.SDecimal.subtract(current_profitandloss_data.personnelcosts.balance, budget_profitandloss_data.personnelcosts.balance);

        profitandloss.differentcosts = {};
        profitandloss.differentcosts.acronym = texts.differentcosts_acronym;
        profitandloss.differentcosts.balance = Banana.SDecimal.subtract(current_profitandloss_data.differentcosts.balance, budget_profitandloss_data.differentcosts.balance);

        profitandloss.depreandadjust = {};
        profitandloss.depreandadjust.acronym = texts.depreandadjust_acronym;
        profitandloss.depreandadjust.balance = Banana.SDecimal.subtract(current_profitandloss_data.depreandadjust.balance, budget_profitandloss_data.depreandadjust.balance);

        profitandloss.interests = {};
        profitandloss.interests.acronym = texts.interests_acronym;
        profitandloss.interests.balance = Banana.SDecimal.subtract(current_profitandloss_data.interests.balance, budget_profitandloss_data.interests.balance);

        profitandloss.directtaxes = {};
        profitandloss.directtaxes.acronym = texts.directtaxes_acronym;
        profitandloss.directtaxes.balance = Banana.SDecimal.subtract(current_profitandloss_data.directtaxes.balance, budget_profitandloss_data.directtaxes.balance);

        return profitandloss;

    }

    getCurrAndBudgDiff_dupont(current_dupont_data, budget_dupont_data, texts) {

        //amount e type
        var dupont_data = {};
        var texts = this.getFinancialAnalysisTexts();

        dupont_data.ebt = {};
        dupont_data.ebt.description = texts.ebt;
        dupont_data.ebt.amount = Banana.SDecimal.subtract(current_dupont_data.ebt.amount, budget_dupont_data.ebt.amount);
        dupont_data.ebt.type = "dec";

        dupont_data.ebtmarginsales = {};
        dupont_data.ebtmarginsales.description = texts.salesturnover;
        dupont_data.ebtmarginsales.amount = Banana.SDecimal.subtract(current_dupont_data.ebtmarginsales.amount, budget_dupont_data.ebtmarginsales.amount);
        dupont_data.ebtmarginsales.type = "dec";

        dupont_data.ebtmargin = {};
        dupont_data.ebtmargin.description = texts.ebtmargin;
        dupont_data.ebtmargin.amount = Banana.SDecimal.subtract(current_dupont_data.ebtmargin.amount, budget_dupont_data.ebtmargin.amount);
        dupont_data.ebtmargin.type = "perc";

        dupont_data.assetturnoversales = {};
        dupont_data.assetturnoversales.description = texts.salesturnover;
        dupont_data.assetturnoversales.amount = Banana.SDecimal.subtract(current_dupont_data.assetturnoversales.amount, budget_dupont_data.assetturnoversales.amount);
        dupont_data.assetturnoversales.type = "dec";

        dupont_data.totalasset = {};
        dupont_data.totalasset.description = texts.totalasset;
        dupont_data.totalasset.amount = Banana.SDecimal.subtract(current_dupont_data.totalasset.amount, budget_dupont_data.totalasset.amount);
        dupont_data.totalasset.type = "dec";

        dupont_data.assetturnover = {};
        dupont_data.assetturnover.description = texts.assetturnover;
        dupont_data.assetturnover.amount = Banana.SDecimal.subtract(current_dupont_data.assetturnover.amount, budget_dupont_data.assetturnover.amount);
        dupont_data.assetturnover.type = "dec";

        dupont_data.roi = {};
        dupont_data.roi.description = texts.roi;
        dupont_data.roi.amount = Banana.SDecimal.subtract(current_dupont_data.roi.amount, budget_dupont_data.roi.amount);
        dupont_data.roi.type = "perc";

        return dupont_data;
    }

    getFinalResult_difference(current_finalresult, budget_finalresult, texts) {

        var finalresult = {};

        finalresult.finalresult = {};
        finalresult.finalresult.balance = Banana.SDecimal.subtract(current_finalresult.finalresult.balance, budget_finalresult.finalresult.balance);

        return finalresult;
    }

    getCalculatedData_difference(current_calculatedData, budget_calculatedData, texts) {

        var calcdata = {};

        calcdata.fixedassets_gain = Banana.SDecimal.subtract(current_calculatedData.fixedassets_gain, budget_calculatedData.fixedassets_gain);
        calcdata.fixedassets_loss = Banana.SDecimal.subtract(current_calculatedData.fixedassets_loss, budget_calculatedData.fixedassets_loss);
        calcdata.currentassets = Banana.SDecimal.subtract(current_calculatedData.currentassets, budget_calculatedData.currentassets);
        calcdata.fixedassets = Banana.SDecimal.subtract(current_calculatedData.fixedassets, budget_calculatedData.fixedassets);
        calcdata.totalassets = Banana.SDecimal.subtract(current_calculatedData.totalassets, budget_calculatedData.totalassets);
        calcdata.shorttermdebtcapital = Banana.SDecimal.subtract(current_calculatedData.shorttermdebtcapital, budget_calculatedData.shorttermdebtcapital);
        calcdata.longtermdebtcapital = Banana.SDecimal.subtract(current_calculatedData.longtermdebtcapital, budget_calculatedData.longtermdebtcapital);
        calcdata.debtcapital = Banana.SDecimal.subtract(current_calculatedData.debtcapital, budget_calculatedData.debtcapital);
        calcdata.owncapital = Banana.SDecimal.subtract(current_calculatedData.owncapital, budget_calculatedData.owncapital);
        calcdata.totalliabilitiesandequity = Banana.SDecimal.subtract(current_calculatedData.totalliabilitiesandequity, budget_calculatedData.totalliabilitiesandequity);
        calcdata.addedvalue = Banana.SDecimal.subtract(current_calculatedData.addedvalue, budget_calculatedData.addedvalue);
        calcdata.ebitda = Banana.SDecimal.subtract(current_calculatedData.ebitda, budget_calculatedData.ebitda);
        calcdata.ebit = Banana.SDecimal.subtract(current_calculatedData.ebit, budget_calculatedData.ebit);
        calcdata.ebt = Banana.SDecimal.subtract(current_calculatedData.ebt, budget_calculatedData.ebt);
        calcdata.annualresult = Banana.SDecimal.subtract(current_calculatedData.annualresult, budget_calculatedData.annualresult);
        calcdata.annualresult = Banana.SDecimal.subtract(current_calculatedData.annualresult, budget_calculatedData.annualresult);
        calcdata.reserves_variation = Banana.SDecimal.subtract(current_calculatedData.reserves_variation, budget_calculatedData.reserves_variation);


        return calcdata;

    }

    getCurrAndBudgDiff_totals(current_calculated_data, budget_calculated_data, texts) {

        var totals = {};

        //balance totals
        totals.currentassets = Banana.SDecimal.subtract(current_calculated_data.currentassets, budget_calculated_data.currentassets);
        totals.fixedassets = Banana.SDecimal.subtract(current_calculated_data.fixedassets, budget_calculated_data.fixedassets);
        totals.totalassets = Banana.SDecimal.subtract(current_calculated_data.totalassets, budget_calculated_data.totalassets);
        totals.shorttermdebtcapital = Banana.SDecimal.subtract(current_calculated_data.shorttermdebtcapital, budget_calculated_data.shorttermdebtcapital);
        totals.longtermdebtcapital = Banana.SDecimal.subtract(current_calculated_data.longtermdebtcapital, budget_calculated_data.longtermdebtcapital);
        totals.debtcapital = Banana.SDecimal.subtract(current_calculated_data.debtcapital, budget_calculated_data.debtcapital);
        totals.owncapital = Banana.SDecimal.subtract(current_calculated_data.owncapital, budget_calculated_data.owncapital);
        totals.totalliabilitiesandequity = Banana.SDecimal.subtract(current_calculated_data.totalliabilitiesandequity, budget_calculated_data.totalliabilitiesandequity);

        //profit and loss totals
        totals.addedvalue = Banana.SDecimal.subtract(current_calculated_data.addedvalue, budget_calculated_data.addedvalue);
        totals.ebitda = Banana.SDecimal.subtract(current_calculated_data.ebitda, budget_calculated_data.ebitda);
        totals.ebit = Banana.SDecimal.subtract(current_calculated_data.ebit, budget_calculated_data.ebit);
        totals.ebt = Banana.SDecimal.subtract(current_calculated_data.ebt, budget_calculated_data.ebt);
        totals.annualresult = Banana.SDecimal.subtract(current_calculated_data.annualresult, budget_calculated_data.annualresult);


        return totals;

    }
    getCurrAndBudgDiff_cashflowData(current_calculated_data, budget_calculated_data, texts) {

        let cashflow = {};

        cashflow.operatingCashflow = {};

        cashflow.operatingCashflow.finalResult = {};
        cashflow.operatingCashflow.finalResult.description = {};
        cashflow.operatingCashflow.finalResult.description.text = texts.annualresult;
        cashflow.operatingCashflow.finalResult.description.style = "styleTablRows";
        cashflow.operatingCashflow.finalResult.acronym = {};
        cashflow.operatingCashflow.finalResult.acronym.text = texts.finalresult_acronym;
        cashflow.operatingCashflow.finalResult.acronym.style = "styleTablRows";
        cashflow.operatingCashflow.finalResult.amount = {};
        cashflow.operatingCashflow.finalResult.amount.value = Banana.SDecimal.subtract(current_calculated_data.operatingCashflow.finalResult.amount.value, budget_calculated_data.operatingCashflow.finalResult.amount.value);
        cashflow.operatingCashflow.finalResult.amount.style = "styleNormalAmount";

        cashflow.operatingCashflow.fixedAssetsGain = {};
        cashflow.operatingCashflow.fixedAssetsGain.description = {};
        cashflow.operatingCashflow.fixedAssetsGain.description.text = texts.gain_on_sales;
        cashflow.operatingCashflow.fixedAssetsGain.description.style = "styleTablRows";
        cashflow.operatingCashflow.fixedAssetsGain.acronym = {};
        cashflow.operatingCashflow.fixedAssetsGain.acronym.text = texts.revaluationPrefix_acronym;
        cashflow.operatingCashflow.fixedAssetsGain.acronym.style = "styleTablRows";
        cashflow.operatingCashflow.fixedAssetsGain.amount = {};
        cashflow.operatingCashflow.fixedAssetsGain.amount.value = Banana.SDecimal.subtract(current_calculated_data.operatingCashflow.fixedAssetsGain.amount.value, budget_calculated_data.operatingCashflow.fixedAssetsGain.amount.value);
        cashflow.operatingCashflow.fixedAssetsGain.amount.style = "styleNormalAmount";

        cashflow.operatingCashflow.fixedAssetsLoss = {};
        cashflow.operatingCashflow.fixedAssetsLoss.description = {};
        cashflow.operatingCashflow.fixedAssetsLoss.description.text = texts.loss_on_sales;
        cashflow.operatingCashflow.fixedAssetsLoss.description.style = "styleTablRows";
        cashflow.operatingCashflow.fixedAssetsLoss.acronym = {};
        cashflow.operatingCashflow.fixedAssetsLoss.acronym.text = texts.devaluationPrefix_acronym;
        cashflow.operatingCashflow.fixedAssetsLoss.acronym.style = "styleTablRows";
        cashflow.operatingCashflow.fixedAssetsLoss.amount = {};
        cashflow.operatingCashflow.fixedAssetsLoss.amount.value = Banana.SDecimal.subtract(current_calculated_data.operatingCashflow.fixedAssetsLoss.amount.value, budget_calculated_data.operatingCashflow.fixedAssetsLoss.amount.value);
        cashflow.operatingCashflow.fixedAssetsLoss.amount.style = "styleNormalAmount";

        cashflow.operatingCashflow.depreAndAdjust = {};
        cashflow.operatingCashflow.depreAndAdjust.description = {};
        cashflow.operatingCashflow.depreAndAdjust.description.text = texts.depreandadjust;
        cashflow.operatingCashflow.depreAndAdjust.description.style = "styleTablRows";
        cashflow.operatingCashflow.depreAndAdjust.acronym = {};
        cashflow.operatingCashflow.depreAndAdjust.acronym.text = texts.depreandadjust_acronym;
        cashflow.operatingCashflow.depreAndAdjust.acronym.style = "styleTablRows";
        cashflow.operatingCashflow.depreAndAdjust.amount = {};
        cashflow.operatingCashflow.depreAndAdjust.amount.value = Banana.SDecimal.subtract(current_calculated_data.operatingCashflow.depreAndAdjust.amount.value, budget_calculated_data.operatingCashflow.depreAndAdjust.amount.value);
        cashflow.operatingCashflow.depreAndAdjust.amount.style = "styleNormalAmount";

        cashflow.operatingCashflow.provsionsAndSimilar = {};
        cashflow.operatingCashflow.provsionsAndSimilar.description = {};
        cashflow.operatingCashflow.provsionsAndSimilar.description.text = texts.provisionsandsimilar_cashflow;
        cashflow.operatingCashflow.provsionsAndSimilar.description.style = "styleTablRows";
        cashflow.operatingCashflow.provsionsAndSimilar.acronym = {};
        cashflow.operatingCashflow.provsionsAndSimilar.acronym.text = texts.provisionsandsimilar_acronym;
        cashflow.operatingCashflow.provsionsAndSimilar.acronym.style = "styleTablRows";
        cashflow.operatingCashflow.provsionsAndSimilar.amount = {};
        cashflow.operatingCashflow.provsionsAndSimilar.amount.value = Banana.SDecimal.subtract(current_calculated_data.operatingCashflow.provsionsAndSimilar.amount.value, budget_calculated_data.operatingCashflow.provsionsAndSimilar.amount.value);
        cashflow.operatingCashflow.provsionsAndSimilar.amount.style = "styleNormalAmount";

        cashflow.operatingCashflow.credits = {};
        cashflow.operatingCashflow.credits.description = {};
        cashflow.operatingCashflow.credits.description.text = texts.credits_cashflow;
        cashflow.operatingCashflow.credits.description.style = "styleTablRows";
        cashflow.operatingCashflow.credits.acronym = {};
        cashflow.operatingCashflow.credits.acronym.text = texts.credits_acronym;
        cashflow.operatingCashflow.credits.acronym.style = "styleTablRows";
        cashflow.operatingCashflow.credits.amount = {};
        cashflow.operatingCashflow.credits.amount.value = Banana.SDecimal.subtract(current_calculated_data.operatingCashflow.credits.amount.value, budget_calculated_data.operatingCashflow.credits.amount.value);
        cashflow.operatingCashflow.credits.amount.style = "styleNormalAmount";

        cashflow.operatingCashflow.stocks = {};
        cashflow.operatingCashflow.stocks.description = {};
        cashflow.operatingCashflow.stocks.description.text = texts.stocks_cashflow;
        cashflow.operatingCashflow.stocks.description.style = "styleTablRows";
        cashflow.operatingCashflow.stocks.acronym = {};
        cashflow.operatingCashflow.stocks.acronym.text = texts.stocks_acronym;
        cashflow.operatingCashflow.stocks.acronym.style = "styleTablRows";
        cashflow.operatingCashflow.stocks.amount = {};
        cashflow.operatingCashflow.stocks.amount.value = Banana.SDecimal.subtract(current_calculated_data.operatingCashflow.stocks.amount.value, budget_calculated_data.operatingCashflow.stocks.amount.value);
        cashflow.operatingCashflow.stocks.amount.style = "styleNormalAmount";

        cashflow.operatingCashflow.prepaidExpenses = {};
        cashflow.operatingCashflow.prepaidExpenses.description = {};
        cashflow.operatingCashflow.prepaidExpenses.description.text = texts.prepaid_expenses_cashflow;
        cashflow.operatingCashflow.prepaidExpenses.description.style = "styleTablRows";
        cashflow.operatingCashflow.prepaidExpenses.acronym = {};
        cashflow.operatingCashflow.prepaidExpenses.acronym.text = texts.prepaid_expenses_acronym;
        cashflow.operatingCashflow.prepaidExpenses.acronym.style = "styleTablRows";
        cashflow.operatingCashflow.prepaidExpenses.amount = {};
        cashflow.operatingCashflow.prepaidExpenses.amount.value = Banana.SDecimal.subtract(current_calculated_data.operatingCashflow.prepaidExpenses.amount.value, budget_calculated_data.operatingCashflow.prepaidExpenses.amount.value);
        cashflow.operatingCashflow.prepaidExpenses.amount.style = "styleNormalAmount";

        cashflow.operatingCashflow.debts = {};
        cashflow.operatingCashflow.debts.description = {};
        cashflow.operatingCashflow.debts.description.text = texts.liabilities_cashflow;
        cashflow.operatingCashflow.debts.description.style = "styleTablRows";
        cashflow.operatingCashflow.debts.acronym = {};
        cashflow.operatingCashflow.debts.acronym.text = texts.shorttermdebtcapital_acronym;
        cashflow.operatingCashflow.debts.acronym.style = "styleTablRows";
        cashflow.operatingCashflow.debts.amount = {}
        cashflow.operatingCashflow.debts.amount.value = Banana.SDecimal.subtract(current_calculated_data.operatingCashflow.debts.amount.value, budget_calculated_data.operatingCashflow.debts.amount.value);
        cashflow.operatingCashflow.debts.amount.style = "styleNormalAmount";

        cashflow.operatingCashflow.accrualsAndDefIncome = {};
        cashflow.operatingCashflow.accrualsAndDefIncome.description = {};
        cashflow.operatingCashflow.accrualsAndDefIncome.description.text = texts.accruals_and_deferred_income_cashflow;
        cashflow.operatingCashflow.accrualsAndDefIncome.description.style = "styleTablRows";
        cashflow.operatingCashflow.accrualsAndDefIncome.acronym = {};
        cashflow.operatingCashflow.accrualsAndDefIncome.acronym.text = texts.accruals_and_deferred_income_acronym;
        cashflow.operatingCashflow.accrualsAndDefIncome.acronym.style = "styleTablRows";
        cashflow.operatingCashflow.accrualsAndDefIncome.amount = {};
        cashflow.operatingCashflow.accrualsAndDefIncome.amount.value = Banana.SDecimal.subtract(current_calculated_data.operatingCashflow.accrualsAndDefIncome.amount.value, budget_calculated_data.operatingCashflow.accrualsAndDefIncome.amount.value);
        cashflow.operatingCashflow.accrualsAndDefIncome.amount.style = "styleNormalAmount";

        cashflow.operatingCashflow.total = {};
        cashflow.operatingCashflow.total.description = {};
        cashflow.operatingCashflow.total.description.text = texts.cashflow_from_operations;
        cashflow.operatingCashflow.total.description.style = "styleUnderGroupTitles";
        cashflow.operatingCashflow.total.acronym = {};
        cashflow.operatingCashflow.total.acronym.text = texts.cashflowFromOperations_acronym;
        cashflow.operatingCashflow.total.acronym.style = "styleUnderGroupTitles";
        cashflow.operatingCashflow.total.amount = {};
        cashflow.operatingCashflow.total.amount.value = Banana.SDecimal.subtract(current_calculated_data.operatingCashflow.total.amount.value, budget_calculated_data.operatingCashflow.total.amount.value);
        cashflow.operatingCashflow.total.amount.style = "styleMidTotalAmount";

        //cashflow from investing section

        cashflow.cashflowFromInvesting = {};

        cashflow.cashflowFromInvesting.disinvestments = {};
        cashflow.cashflowFromInvesting.disinvestments.description = {};
        cashflow.cashflowFromInvesting.disinvestments.description.text = texts.disinvestments_cashflow;
        cashflow.cashflowFromInvesting.disinvestments.description.style = "styleTablRows";
        cashflow.cashflowFromInvesting.disinvestments.acronym = {};
        cashflow.cashflowFromInvesting.disinvestments.acronym.text = texts.disinvestmentsPrefix_acronym;
        cashflow.cashflowFromInvesting.disinvestments.acronym.style = "styleTablRows";
        cashflow.cashflowFromInvesting.disinvestments.amount = {};
        cashflow.cashflowFromInvesting.disinvestments.amount.value = Banana.SDecimal.subtract(current_calculated_data.cashflowFromInvesting.disinvestments.amount.value, budget_calculated_data.cashflowFromInvesting.disinvestments.amount.value);
        cashflow.cashflowFromInvesting.disinvestments.amount.style = "styleNormalAmount";

        cashflow.cashflowFromInvesting.investments = {};
        cashflow.cashflowFromInvesting.investments.description = {};
        cashflow.cashflowFromInvesting.investments.description.text = texts.investments_cashflow;
        cashflow.cashflowFromInvesting.investments.description.style = "styleTablRows";
        cashflow.cashflowFromInvesting.investments.acronym = {};
        cashflow.cashflowFromInvesting.investments.acronym.text = texts.investments_acronym;
        cashflow.cashflowFromInvesting.investments.acronym.style = "styleTablRows";
        cashflow.cashflowFromInvesting.investments.amount = {};
        cashflow.cashflowFromInvesting.investments.amount.value = Banana.SDecimal.subtract(current_calculated_data.cashflowFromInvesting.investments.amount.value, budget_calculated_data.cashflowFromInvesting.investments.amount.value);
        cashflow.cashflowFromInvesting.investments.amount.style = "styleNormalAmount";


        cashflow.cashflowFromInvesting.total = {};
        cashflow.cashflowFromInvesting.total.description = {};
        cashflow.cashflowFromInvesting.total.description.text = texts.cashflow_from_investing;
        cashflow.cashflowFromInvesting.total.description.style = "styleUnderGroupTitles";
        cashflow.cashflowFromInvesting.total.acronym = {};
        cashflow.cashflowFromInvesting.total.acronym.text = texts.cashflowFromInvesting_acronym;
        cashflow.cashflowFromInvesting.total.acronym.style = "styleUnderGroupTitles";
        cashflow.cashflowFromInvesting.total.amount = {};
        cashflow.cashflowFromInvesting.total.amount.value = Banana.SDecimal.subtract(current_calculated_data.cashflowFromInvesting.total.amount.value, budget_calculated_data.cashflowFromInvesting.total.amount.value);
        cashflow.cashflowFromInvesting.total.amount.style = "styleMidTotalAmount";

        //cashflow from financing section

        cashflow.cashflowFromFinancing = {};

        cashflow.cashflowFromFinancing.longTermDebts = {};
        cashflow.cashflowFromFinancing.longTermDebts.description = {};
        cashflow.cashflowFromFinancing.longTermDebts.description.text = texts.longtermdebtcapital_cashflow;
        cashflow.cashflowFromFinancing.longTermDebts.description.style = "styleTablRows";
        cashflow.cashflowFromFinancing.longTermDebts.acronym = {};
        cashflow.cashflowFromFinancing.longTermDebts.acronym.text = texts.longtermdebtcapital_acronym;
        cashflow.cashflowFromFinancing.longTermDebts.acronym.style = "styleTablRows";
        cashflow.cashflowFromFinancing.longTermDebts.amount = {};
        cashflow.cashflowFromFinancing.longTermDebts.amount.value = Banana.SDecimal.subtract(current_calculated_data.cashflowFromFinancing.longTermDebts.amount.value, budget_calculated_data.cashflowFromFinancing.longTermDebts.amount.value);
        cashflow.cashflowFromFinancing.longTermDebts.amount.style = "styleNormalAmount";

        cashflow.cashflowFromFinancing.dividends = {};
        cashflow.cashflowFromFinancing.dividends.description = {};
        cashflow.cashflowFromFinancing.dividends.description.text = texts.dividends;
        cashflow.cashflowFromFinancing.dividends.description.style = "styleTablRows"
        cashflow.cashflowFromFinancing.dividends.acronym = {};
        cashflow.cashflowFromFinancing.dividends.acronym.text = texts.dividends_acronym;
        cashflow.cashflowFromFinancing.dividends.acronym.style = "styleTablRows";
        cashflow.cashflowFromFinancing.dividends.amount = {};
        cashflow.cashflowFromFinancing.dividends.amount.value = Banana.SDecimal.subtract(current_calculated_data.cashflowFromFinancing.dividends.amount.value, budget_calculated_data.cashflowFromFinancing.dividends.amount.value);
        cashflow.cashflowFromFinancing.dividends.amount.style = "styleNormalAmount";

        cashflow.cashflowFromFinancing.ownBaseCapital = {};
        cashflow.cashflowFromFinancing.ownBaseCapital.description = {};
        cashflow.cashflowFromFinancing.ownBaseCapital.description.text = texts.ownbasecapital_cashflow;
        cashflow.cashflowFromFinancing.ownBaseCapital.description.style = "styleTablRows";
        cashflow.cashflowFromFinancing.ownBaseCapital.acronym = {};
        cashflow.cashflowFromFinancing.ownBaseCapital.acronym.text = texts.ownbasecapital_acronym;
        cashflow.cashflowFromFinancing.ownBaseCapital.acronym.style = "styleTablRows";
        cashflow.cashflowFromFinancing.ownBaseCapital.amount = {};
        cashflow.cashflowFromFinancing.ownBaseCapital.amount.value = Banana.SDecimal.subtract(current_calculated_data.cashflowFromFinancing.ownBaseCapital.amount.value, budget_calculated_data.cashflowFromFinancing.ownBaseCapital.amount.value);
        cashflow.cashflowFromFinancing.ownBaseCapital.amount.style = "styleNormalAmount";

        cashflow.cashflowFromFinancing.total = {};
        cashflow.cashflowFromFinancing.total.description = {};
        cashflow.cashflowFromFinancing.total.description.text = texts.cashflow_from_financing;
        cashflow.cashflowFromFinancing.total.description.style = "styleUnderGroupTitles";
        cashflow.cashflowFromFinancing.total.acronym = {};
        cashflow.cashflowFromFinancing.total.acronym.text = texts.cashflowFromFinancing_acronym;
        cashflow.cashflowFromFinancing.total.acronym.style = "styleUnderGroupTitles";
        cashflow.cashflowFromFinancing.total.amount = {};
        cashflow.cashflowFromFinancing.total.amount.value = Banana.SDecimal.subtract(current_calculated_data.cashflowFromFinancing.total.amount.value, budget_calculated_data.cashflowFromFinancing.total.amount.value);
        cashflow.cashflowFromFinancing.total.amount.style = "styleMidTotalAmount";

        // final cashflow sections

        cashflow.finalCashflow = {};
        cashflow.finalCashflow.description = {};
        cashflow.finalCashflow.description.text = texts.final_cashflow;
        cashflow.finalCashflow.description.style = this.getColorStyle("styleTitlesTotalAmount");
        cashflow.finalCashflow.acronym = {};
        cashflow.finalCashflow.acronym.text = texts.finalCashflow_acronym;
        cashflow.finalCashflow.acronym.style = this.getColorStyle("styleTitlesTotalAmount");
        cashflow.finalCashflow.amount = {};
        cashflow.finalCashflow.amount.value = Banana.SDecimal.subtract(current_calculated_data.finalCashflow.amount.value, budget_calculated_data.finalCashflow.amount.value);
        cashflow.finalCashflow.amount.style = this.getColorStyle("styleTotalAmount");

        //verification section
        cashflow.verifData = {};

        cashflow.verifData.openingLiqu = {};
        cashflow.verifData.openingLiqu.description = {};
        cashflow.verifData.openingLiqu.description.text = texts.opening_liquidity;
        cashflow.verifData.openingLiqu.description.style = "styleTablRows";
        cashflow.verifData.openingLiqu.acronym = {};
        cashflow.verifData.openingLiqu.acronym.text = texts.liquidity_acronym;
        cashflow.verifData.openingLiqu.acronym.style = "styleTablRows";
        cashflow.verifData.openingLiqu.amount = {};
        cashflow.verifData.openingLiqu.amount.value = Banana.SDecimal.subtract(current_calculated_data.verifData.openingLiqu.amount.value, budget_calculated_data.verifData.openingLiqu.amount.value);
        cashflow.verifData.openingLiqu.amount.style = "styleNormalAmount";

        //cashflow final result reported for verification
        cashflow.verifData.changeInLiquidity = {};
        cashflow.verifData.changeInLiquidity.description = {};
        cashflow.verifData.changeInLiquidity.description.text = texts.cashflowFinal;
        cashflow.verifData.changeInLiquidity.description.style = "styleTablRows";
        cashflow.verifData.changeInLiquidity.acronym = {};
        cashflow.verifData.changeInLiquidity.acronym.text = texts.finalCashflow_acronym;
        cashflow.verifData.changeInLiquidity.acronym.style = "styleTablRows";
        cashflow.verifData.changeInLiquidity.amount = {};
        cashflow.verifData.changeInLiquidity.amount.value = Banana.SDecimal.subtract(current_calculated_data.verifData.changeInLiquidity.amount.value, budget_calculated_data.verifData.changeInLiquidity.amount.value);
        cashflow.verifData.changeInLiquidity.amount.style = "styleNormalAmount";

        cashflow.verifData.colosingLiqu_calc = {};
        cashflow.verifData.colosingLiqu_calc.description = {};
        cashflow.verifData.colosingLiqu_calc.description.text = texts.closing_liquidity;
        cashflow.verifData.colosingLiqu_calc.description.style = "styleTablRows";
        cashflow.verifData.colosingLiqu_calc.acronym = {};
        cashflow.verifData.colosingLiqu_calc.acronym.text = texts.liquidity_acronym;
        cashflow.verifData.colosingLiqu_calc.acronym.style = "styleTablRows";
        cashflow.verifData.colosingLiqu_calc.amount = {};
        cashflow.verifData.colosingLiqu_calc.amount.value = Banana.SDecimal.subtract(current_calculated_data.verifData.colosingLiqu_calc.amount.value, budget_calculated_data.verifData.colosingLiqu_calc.amount.value);
        cashflow.verifData.colosingLiqu_calc.amount.style = "styleNormalAmount";

        //save the difference
        cashflow.difference = {};
        cashflow.difference.description = {};
        cashflow.difference.description.text = texts.differenceWrn;
        cashflow.difference.description.style = "styleWarningText";
        cashflow.difference.amount = {};
        cashflow.difference.amount.value = Banana.SDecimal.subtract(current_calculated_data.difference.amount.value, budget_calculated_data.difference.amount.value);
        cashflow.difference.amount.getStyle = function() {
            if (this.value == "0")
                return "styleNormalAmount";
            else
                return "styleWarningAmount";
        }

        return cashflow;
    }

    getAccountingSheetValue(_banDocument, periodType, grType, multiplier) {
        var accountingValue = "";
        if (periodType == "CY" || periodType == "PY") {
            accountingValue = _banDocument.projectionBalance(grType, "", "", Banana.Converter.toInternalDateFormat(this.dialogparam.currentdate, 'yyyymmdd'), null);
            accountingValue = accountingValue.balance;
            accountingValue = Banana.SDecimal.multiply(accountingValue, multiplier);
            return accountingValue;
        } else {
            return false;
        }
    }


    /**
     * @description This method is used for the calculation of total or reclassification elements, more precisely:
     * Instantiate a *calculated_data= {}* object that will contain all the calculated data.
     * Calculate the various elements.
     * @Param {object} data: the data object created thanks to loadData methods, containing the values and the sums of the paramters recovered from the dialog
     * @Param {object} _banDocument: the startDate of the document, wich is located in the File Info.
     * @returns an object containing the calculated values
     */
    calculateData(data, _banDocument) {
        if (!data || !_banDocument) {
            return null;
        }
        var calcdata = {};

        /*******************************************************************************************************************
         * Calculation of total Asset (with the total of current asset and fixed assets), and checking that they coincide
         *********************************************************************************************************************/
        calcdata.totalassets = {};

        var liquidtiy = data.balance.ca.liquidity.balance;
        var credits = data.balance.ca.credits.balance;
        var stocks = data.balance.ca.stocks.balance;
        var prepaid_expenses = data.balance.ca.prepaid_expenses.balance;

        //Current Assets
        var currentassets = Banana.SDecimal.add(liquidtiy, credits);
        currentassets = Banana.SDecimal.add(currentassets, stocks);
        currentassets = Banana.SDecimal.add(currentassets, prepaid_expenses);
        calcdata.currentassets = currentassets;

        //Fixed Assets (final balance)
        var fixedassets = Banana.SDecimal.add(data.balance.fa.financial_fixedassets.balance, data.balance.fa.tangible_fixedassets.balance);
        fixedassets = Banana.SDecimal.add(fixedassets, data.balance.fa.intangible_fixedassets.balance);
        calcdata.fixedassets = fixedassets;
        //Fixed Asssets (opening)
        var fixedassets_opening = Banana.SDecimal.add(data.balance.fa.financial_fixedassets.opening, data.balance.fa.tangible_fixedassets.opening);
        fixedassets_opening = Banana.SDecimal.add(fixedassets_opening, data.balance.fa.intangible_fixedassets.opening);
        calcdata.fixedassets_opening = fixedassets_opening;

        calcdata.totalassets = Banana.SDecimal.add(currentassets, fixedassets);

        //Fixed Assets gain
        var fixedassets_gain = Banana.SDecimal.add(data.balance.fa.financial_fixedassets.gain, data.balance.fa.tangible_fixedassets.gain);
        fixedassets = Banana.SDecimal.add(fixedassets, data.balance.fa.intangible_fixedassets.gain);
        calcdata.fixedassets_gain = fixedassets_gain;

        //Fixed Assets losses
        var fixedassets_loss = Banana.SDecimal.add(data.balance.fa.financial_fixedassets.loss, data.balance.fa.tangible_fixedassets.loss);
        fixedassets = Banana.SDecimal.add(fixedassets, data.balance.fa.intangible_fixedassets.loss);
        calcdata.fixedassets_loss = fixedassets_loss;


        /************************************************************************************************
         * Calculate the total assets resulting from the accounting sheet and then use it for controls
         ************************************************************************************************/
        calcdata.totalassets_sheet = this.getAccountingSheetValue(_banDocument, data.period.Type, 'Gr=1', 1);

        /******************************************************************************************************
         * Calculation of total liabilities and equity (with the total of debt capital and the own capital
         ******************************************************************************************************/
        calcdata.totalliabilitiesandequity = {};

        //short term debt capital
        var shorttermdebtcapital = Banana.SDecimal.add(data.balance.stdc.debts.balance, data.balance.stdc.accruals_and_deferred_income.balance);
        calcdata.shorttermdebtcapital = shorttermdebtcapital;
        //long term debt capital
        var longtermdebtcapital = Banana.SDecimal.add(data.balance.ltdc.longter_debts.balance, data.balance.ltdc.provisionsandsimilar.balance);
        calcdata.longtermdebtcapital = longtermdebtcapital;
        //Total debt capital
        var debtcapital = Banana.SDecimal.add(shorttermdebtcapital, longtermdebtcapital);
        calcdata.debtcapital = debtcapital;
        //Own capital
        var owncapital = Banana.SDecimal.add(data.balance.oc.ownbasecapital.balance, Banana.SDecimal.add(data.balance.oc.reserves.balance, data.balance.oc.balanceProfits.balance));
        calcdata.owncapital = owncapital;

        calcdata.totalliabilitiesandequity = Banana.SDecimal.add(debtcapital, owncapital);;

        /*********************************************************************************************
         * Calculation of the total liabilities and equity resulting from the accounting sheet
         *********************************************************************************************/
        calcdata.totalliabilitiesandequity_sheet = this.getAccountingSheetValue(_banDocument, data.period.Type, 'Gr=2', -1);

        /*********************************************************
         * Calculation of the Annual Result (profit)
         **********************************************************/

        calcdata.annualresult_before_directtaxes = {};
        calcdata.annualresult = {};
        calcdata.salesturnover = {};


        var salesturnover = data.profitandloss.salesturnover.balance;
        //for the dupont
        calcdata.salesturnover = salesturnover;

        var costofmerchandservices = data.profitandloss.costofmerchandservices.balance;
        var personnelcosts = data.profitandloss.personnelcosts.balance;
        var differentcosts = data.profitandloss.differentcosts.balance;
        var depreandadjust = data.profitandloss.depreandadjust.balance;
        var interests = data.profitandloss.interests.balance;
        let directtaxes = data.profitandloss.directtaxes.balance;


        //I need to save each total and then reuse it in other calculations later (ebit, ebitda...).
        var totce1 = Banana.SDecimal.subtract(salesturnover, costofmerchandservices);
        var totce2 = Banana.SDecimal.subtract(totce1, personnelcosts);
        var totce3 = Banana.SDecimal.subtract(totce2, differentcosts);
        var totce4 = Banana.SDecimal.subtract(totce3, depreandadjust);
        var totce5 = Banana.SDecimal.subtract(totce4, interests);
        let totce6 = Banana.SDecimal.subtract(totce5, directtaxes);
        calcdata.annualresult_before_directtaxes = totce5;
        calcdata.annualresult = totce6;

        /************************************************************************
         * Calculation of the Annual Result (profit) from the accounting sheet
         ************************************************************************/
        calcdata.annualresult_sheet = data.finalresult.finalresult.balance;

        /*******************************************************************************************************
         * Calculation of the Added Value
         *******************************************************************************************************/
        calcdata.addedvalue = {};
        calcdata.addedvalue = Banana.SDecimal.subtract(salesturnover, costofmerchandservices);
        /*******************************************************************************************************
         * Calculation of the EBIT-DA
         *******************************************************************************************************/
        calcdata.ebitda = totce3;
        /*******************************************************************************************************
         * Calculation of the EBIT
         *******************************************************************************************************/
        calcdata.ebit = totce4;
        /*******************************************************************************************************
         * Calculation of the EBT
         *******************************************************************************************************/
        calcdata.ebt = totce5;

        return calcdata;
    }

    /**
     * Calcola la differenza tra gli importi caricati dalla contabilità e quelli calcolati.
     * Esegue il calcolo per:
     *  -Il totale degli attivi.
     * - Il totale dei passivi.
     * - Il risultato annuale.
     * 
     * @param {*} data_budget 
     * @param {*} calculated_data 
     * @returns 
     */
    getControlSumsData(calculated_data) {
        let controlSumsData = {};
        let texts = this.getFinancialAnalysisTexts();

        controlSumsData.totalAssets = {};
        controlSumsData.totalAssets.id = "assets";
        controlSumsData.totalAssets.description = texts.assets;
        controlSumsData.totalAssets.calc = calculated_data.totalassets;
        controlSumsData.totalAssets.sheet = calculated_data.totalassets_sheet;
        controlSumsData.totalAssets.difference = Banana.SDecimal.abs(Banana.SDecimal.subtract(controlSumsData.totalAssets.calc, controlSumsData.totalAssets.sheet));
        controlSumsData.totalAssets.hasDifference = function() {
            if (!Banana.SDecimal.isZero(this.difference))
                return true;
            else
                return false;
        }
        controlSumsData.totalAssets.getStyle = function() {
            let style = "styleNormalAmount";
            if (this.hasDifference())
                style = "styleDifferenceFoundAmount";

            return style;
        }

        controlSumsData.totalliabilitiesandequity = {};
        controlSumsData.totalliabilitiesandequity.id = "liabilitieasandequity";
        controlSumsData.totalliabilitiesandequity.description = texts.liabilitiesandequity;
        controlSumsData.totalliabilitiesandequity.calc = calculated_data.totalliabilitiesandequity;
        controlSumsData.totalliabilitiesandequity.sheet = calculated_data.totalliabilitiesandequity_sheet;
        controlSumsData.totalliabilitiesandequity.difference = Banana.SDecimal.abs(Banana.SDecimal.subtract(controlSumsData.totalliabilitiesandequity.calc, controlSumsData.totalliabilitiesandequity.sheet));
        controlSumsData.totalliabilitiesandequity.style = "styleNormalAmount";
        controlSumsData.totalliabilitiesandequity.hasDifference = function() {
            if (!Banana.SDecimal.isZero(this.difference))
                return true;
            else
                return false;
        }
        controlSumsData.totalliabilitiesandequity.getStyle = function() {
            let style = "styleNormalAmount";
            if (this.hasDifference())
                style = "styleDifferenceFoundAmount";

            return style;
        }

        controlSumsData.annualresult = {};
        controlSumsData.annualresult.id = "annualresult";
        controlSumsData.annualresult.description = texts.profitandloss;
        controlSumsData.annualresult.calc = calculated_data.annualresult;
        controlSumsData.annualresult.sheet = calculated_data.annualresult_sheet;
        controlSumsData.annualresult.difference = Banana.SDecimal.abs(Banana.SDecimal.subtract(controlSumsData.annualresult.calc, controlSumsData.annualresult.sheet));
        controlSumsData.annualresult.hasDifference = function() {
            if (!Banana.SDecimal.isZero(this.difference))
                return true;
            else
                return false;
        }
        controlSumsData.annualresult.getStyle = function() {
            let style = "styleNormalAmount";
            if (this.hasDifference())
                style = "styleDifferenceFoundAmount";

            return style;
        }

        controlSumsData.hasDifferences = function() {
            for (var key in this) {
                let type = typeof(this[key])
                if (type == "object") {
                    if (this[key].hasDifference())
                        return true;
                }
            }
            return false;
        }

        return controlSumsData;
    }
    getControlSumsTitlesData(texts) {
        let data = [];

        //first section title: Assets
        let first = {};
        first.id = "assets";
        first.description = texts.assets;
        data.push(first);

        //second section title: Liabilities and equity
        let second = {};
        second.id = "liabilitieasandequity";
        second.description = texts.liabilitiesandequity;
        data.push(second);

        //third section title: Annual result
        let third = {};
        third.id = "annualresult";
        third.description = texts.profitandloss;
        data.push(third);

        return data;

    }

    controlSumsWithDifferences(data) {
            for (var i = data.length - 1; i >= 0; i--) {
                if (data[i].period.Type == "CY" || data[i].period.Type == "PY") {
                    if (data[i].controlSumsData.hasDifferences())
                        return true;
                    else
                        continue;
                }
            }
            return false;
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
     * Calculates the amounts for the retained earnings statement.
     * @param {*} data 
     * @param {*} calculated_data
     */
    setRetainedEarningsData(data, calculated_data) {

        //performs the calculations only if the annual result is positive.

        let retEarningsData = {};


        let texts = this.getFinancialAnalysisTexts();

        retEarningsData.balanceProfitCarriedForward = {};
        retEarningsData.balanceProfitCarriedForward.amountStyle = 'styleNormalAmount'; //define the amount style in the report.
        retEarningsData.balanceProfitCarriedForward.textStyle = 'styleTablRows'; //define the description style in the report.
        retEarningsData.balanceProfitCarriedForward.description = texts.balanceProfitCarriedForward;
        retEarningsData.balanceProfitCarriedForward.amount = data.balance.oc.balanceProfits.opening;

        retEarningsData.annualResult = {};
        retEarningsData.annualResult.amountStyle = 'styleNormalAmount';
        retEarningsData.annualResult.textStyle = 'styleTablRows';
        retEarningsData.annualResult.description = texts.annualResult_retEarnings;
        retEarningsData.annualResult.amount = calculated_data.annualresult;

        retEarningsData.dividends = {};
        retEarningsData.dividends.amountStyle = 'styleNormalAmount';
        retEarningsData.dividends.textStyle = 'styleTablRows';
        retEarningsData.dividends.description = texts.dividends;
        retEarningsData.dividends.amount = data.balance.oc.balanceProfits.dividends;

        retEarningsData.reserves = {};
        retEarningsData.reserves.amountStyle = 'styleNormalAmount';
        retEarningsData.reserves.textStyle = 'styleTablRows';
        retEarningsData.reserves.description = texts.reservesVariation;
        retEarningsData.reserves.amount = data.balance.oc.reserves.delta;

        retEarningsData.calcTotal = function() {
            let total = "";
            total = Banana.SDecimal.add(total, this.balanceProfitCarriedForward.amount);
            total = Banana.SDecimal.add(total, this.annualResult.amount);
            total = Banana.SDecimal.subtract(total, this.dividends.amount);
            total = Banana.SDecimal.subtract(total, this.reserves.amount);
            return total;
        }

        retEarningsData.totalRetainedEarning = {};
        retEarningsData.totalRetainedEarning.amountStyle = 'styleMidTotalAmount';
        retEarningsData.totalRetainedEarning.textStyle = 'styleUnderGroupTitles';
        retEarningsData.totalRetainedEarning.description = texts.totalRetainedEarning;
        retEarningsData.totalRetainedEarning.amount = retEarningsData.calcTotal();

        retEarningsData.currentYearRetainedEarning = {};
        retEarningsData.currentYearRetainedEarning.amountStyle = 'styleMidTotalAmount';
        retEarningsData.currentYearRetainedEarning.textStyle = 'styleUnderGroupTitles';
        retEarningsData.currentYearRetainedEarning.description = texts.currentYearRetainedEarning;
        retEarningsData.currentYearRetainedEarning.amount = Banana.SDecimal.subtract(retEarningsData.totalRetainedEarning.amount, retEarningsData.balanceProfitCarriedForward.amount);

        return retEarningsData;
    }

    calculateCashflowData(data, calcData) {
        let cashflow = {};
        let texts = this.getFinancialAnalysisTexts();

        //cashflow from operation section

        cashflow.operatingCashflow = {};

        cashflow.operatingCashflow.finalResult = {};
        cashflow.operatingCashflow.finalResult.description = {};
        cashflow.operatingCashflow.finalResult.description.text = texts.annualresult;
        cashflow.operatingCashflow.finalResult.description.style = "styleTablRows";
        cashflow.operatingCashflow.finalResult.acronym = {};
        cashflow.operatingCashflow.finalResult.acronym.text = texts.finalresult_acronym;
        cashflow.operatingCashflow.finalResult.acronym.style = "styleTablRows";
        cashflow.operatingCashflow.finalResult.amount = {};
        cashflow.operatingCashflow.finalResult.amount.value = data.finalresult.finalresult.balance;
        cashflow.operatingCashflow.finalResult.amount.style = "styleNormalAmount";

        cashflow.operatingCashflow.fixedAssetsGain = {};
        cashflow.operatingCashflow.fixedAssetsGain.description = {};
        cashflow.operatingCashflow.fixedAssetsGain.description.text = texts.gain_on_sales;
        cashflow.operatingCashflow.fixedAssetsGain.description.style = "styleTablRows";
        cashflow.operatingCashflow.fixedAssetsGain.acronym = {};
        cashflow.operatingCashflow.fixedAssetsGain.acronym.text = texts.revaluationPrefix_acronym;
        cashflow.operatingCashflow.fixedAssetsGain.acronym.style = "styleTablRows";
        cashflow.operatingCashflow.fixedAssetsGain.amount = {};
        cashflow.operatingCashflow.fixedAssetsGain.amount.value = calcData.fixedassets_gain;
        cashflow.operatingCashflow.fixedAssetsGain.amount.style = "styleNormalAmount";

        cashflow.operatingCashflow.fixedAssetsLoss = {};
        cashflow.operatingCashflow.fixedAssetsLoss.description = {};
        cashflow.operatingCashflow.fixedAssetsLoss.description.text = texts.loss_on_sales;
        cashflow.operatingCashflow.fixedAssetsLoss.description.style = "styleTablRows";
        cashflow.operatingCashflow.fixedAssetsLoss.acronym = {};
        cashflow.operatingCashflow.fixedAssetsLoss.acronym.text = texts.devaluationPrefix_acronym;
        cashflow.operatingCashflow.fixedAssetsLoss.acronym.style = "styleTablRows";
        cashflow.operatingCashflow.fixedAssetsLoss.amount = {};
        cashflow.operatingCashflow.fixedAssetsLoss.amount.value = calcData.fixedassets_loss;
        cashflow.operatingCashflow.fixedAssetsLoss.amount.style = "styleNormalAmount";

        cashflow.operatingCashflow.depreAndAdjust = {};
        cashflow.operatingCashflow.depreAndAdjust.description = {};
        cashflow.operatingCashflow.depreAndAdjust.description.text = texts.depreandadjust;
        cashflow.operatingCashflow.depreAndAdjust.description.style = "styleTablRows";
        cashflow.operatingCashflow.depreAndAdjust.acronym = {};
        cashflow.operatingCashflow.depreAndAdjust.acronym.text = texts.depreandadjust_acronym;
        cashflow.operatingCashflow.depreAndAdjust.acronym.style = "styleTablRows";
        cashflow.operatingCashflow.depreAndAdjust.amount = {};
        cashflow.operatingCashflow.depreAndAdjust.amount.value = data.profitandloss.depreandadjust.balance;
        cashflow.operatingCashflow.depreAndAdjust.amount.style = "styleNormalAmount";

        cashflow.operatingCashflow.provsionsAndSimilar = {};
        cashflow.operatingCashflow.provsionsAndSimilar.description = {};
        cashflow.operatingCashflow.provsionsAndSimilar.description.text = texts.provisionsandsimilar_cashflow;
        cashflow.operatingCashflow.provsionsAndSimilar.description.style = "styleTablRows";
        cashflow.operatingCashflow.provsionsAndSimilar.acronym = {};
        cashflow.operatingCashflow.provsionsAndSimilar.acronym.text = texts.provisionsandsimilar_acronym;
        cashflow.operatingCashflow.provsionsAndSimilar.acronym.style = "styleTablRows";
        cashflow.operatingCashflow.provsionsAndSimilar.amount = {};
        cashflow.operatingCashflow.provsionsAndSimilar.amount.value = data.balance.ltdc.provisionsandsimilar.delta;
        cashflow.operatingCashflow.provsionsAndSimilar.amount.style = "styleNormalAmount";

        cashflow.operatingCashflow.credits = {};
        cashflow.operatingCashflow.credits.description = {};
        cashflow.operatingCashflow.credits.description.text = texts.credits_cashflow;
        cashflow.operatingCashflow.credits.description.style = "styleTablRows";
        cashflow.operatingCashflow.credits.acronym = {};
        cashflow.operatingCashflow.credits.acronym.text = texts.credits_acronym;
        cashflow.operatingCashflow.credits.acronym.style = "styleTablRows";
        cashflow.operatingCashflow.credits.amount = {};
        cashflow.operatingCashflow.credits.amount.value = data.balance.ca.credits.delta;
        cashflow.operatingCashflow.credits.amount.style = "styleNormalAmount";

        cashflow.operatingCashflow.stocks = {};
        cashflow.operatingCashflow.stocks.description = {};
        cashflow.operatingCashflow.stocks.description.text = texts.stocks_cashflow;
        cashflow.operatingCashflow.stocks.description.style = "styleTablRows";
        cashflow.operatingCashflow.stocks.acronym = {};
        cashflow.operatingCashflow.stocks.acronym.text = texts.stocks_acronym;
        cashflow.operatingCashflow.stocks.acronym.style = "styleTablRows";
        cashflow.operatingCashflow.stocks.amount = {};
        cashflow.operatingCashflow.stocks.amount.value = data.balance.ca.stocks.delta;
        cashflow.operatingCashflow.stocks.amount.style = "styleNormalAmount";

        cashflow.operatingCashflow.prepaidExpenses = {};
        cashflow.operatingCashflow.prepaidExpenses.description = {};
        cashflow.operatingCashflow.prepaidExpenses.description.text = texts.prepaid_expenses_cashflow;
        cashflow.operatingCashflow.prepaidExpenses.description.style = "styleTablRows";
        cashflow.operatingCashflow.prepaidExpenses.acronym = {};
        cashflow.operatingCashflow.prepaidExpenses.acronym.text = texts.prepaid_expenses_acronym;
        cashflow.operatingCashflow.prepaidExpenses.acronym.style = "styleTablRows";
        cashflow.operatingCashflow.prepaidExpenses.amount = {};
        cashflow.operatingCashflow.prepaidExpenses.amount.value = data.balance.ca.prepaid_expenses.delta;
        cashflow.operatingCashflow.prepaidExpenses.amount.style = "styleNormalAmount";

        cashflow.operatingCashflow.debts = {};
        cashflow.operatingCashflow.debts.description = {};
        cashflow.operatingCashflow.debts.description.text = texts.liabilities_cashflow;
        cashflow.operatingCashflow.debts.description.style = "styleTablRows";
        cashflow.operatingCashflow.debts.acronym = {};
        cashflow.operatingCashflow.debts.acronym.text = texts.shorttermdebtcapital_acronym;
        cashflow.operatingCashflow.debts.acronym.style = "styleTablRows";
        cashflow.operatingCashflow.debts.amount = {};
        cashflow.operatingCashflow.debts.amount.value = data.balance.stdc.debts.delta;
        cashflow.operatingCashflow.debts.amount.style = "styleNormalAmount";

        cashflow.operatingCashflow.accrualsAndDefIncome = {};
        cashflow.operatingCashflow.accrualsAndDefIncome.description = {};
        cashflow.operatingCashflow.accrualsAndDefIncome.description.text = texts.accruals_and_deferred_income_cashflow;
        cashflow.operatingCashflow.accrualsAndDefIncome.description.style = "styleTablRows";
        cashflow.operatingCashflow.accrualsAndDefIncome.acronym = {};
        cashflow.operatingCashflow.accrualsAndDefIncome.acronym.text = texts.accruals_and_deferred_income_acronym;
        cashflow.operatingCashflow.accrualsAndDefIncome.acronym.style = "styleTablRows";
        cashflow.operatingCashflow.accrualsAndDefIncome.amount = {};
        cashflow.operatingCashflow.accrualsAndDefIncome.amount.value = data.balance.stdc.accruals_and_deferred_income.delta;
        cashflow.operatingCashflow.accrualsAndDefIncome.amount.style = "styleNormalAmount";

        //calculate cashflow from operations

        cashflow.operatingCashflow.calcOperationsCashFlow = function() {
            let operatingCashflow = "";
            operatingCashflow = this.finalResult.amount.value;
            operatingCashflow = Banana.SDecimal.subtract(operatingCashflow, this.fixedAssetsGain.amount.value);
            operatingCashflow = Banana.SDecimal.add(operatingCashflow, this.fixedAssetsLoss.amount.value);
            operatingCashflow = Banana.SDecimal.add(operatingCashflow, this.depreAndAdjust.amount.value);
            operatingCashflow = Banana.SDecimal.add(operatingCashflow, this.provsionsAndSimilar.amount.value);
            operatingCashflow = Banana.SDecimal.add(operatingCashflow, this.credits.amount.value);
            operatingCashflow = Banana.SDecimal.add(operatingCashflow, this.stocks.amount.value);
            operatingCashflow = Banana.SDecimal.add(operatingCashflow, this.prepaidExpenses.amount.value);
            operatingCashflow = Banana.SDecimal.add(operatingCashflow, this.debts.amount.value);
            operatingCashflow = Banana.SDecimal.add(operatingCashflow, this.accrualsAndDefIncome.amount.value);

            return operatingCashflow;
        }

        cashflow.operatingCashflow.total = {};
        cashflow.operatingCashflow.total.description = {};
        cashflow.operatingCashflow.total.description.text = texts.cashflow_from_operations;
        cashflow.operatingCashflow.total.description.style = "styleUnderGroupTitles";
        cashflow.operatingCashflow.total.acronym = {};
        cashflow.operatingCashflow.total.acronym.text = texts.cashflowFromOperations_acronym;
        cashflow.operatingCashflow.total.acronym.style = "styleUnderGroupTitles";
        cashflow.operatingCashflow.total.amount = {};
        cashflow.operatingCashflow.total.amount.value = cashflow.operatingCashflow.calcOperationsCashFlow();
        cashflow.operatingCashflow.total.amount.style = "styleMidTotalAmount";

        //cashflow from investing section

        cashflow.cashflowFromInvesting = {};

        cashflow.cashflowFromInvesting.disinvestments = {};
        cashflow.cashflowFromInvesting.disinvestments.description = {};
        cashflow.cashflowFromInvesting.disinvestments.description.text = texts.disinvestments_cashflow;
        cashflow.cashflowFromInvesting.disinvestments.description.style = "styleTablRows";
        cashflow.cashflowFromInvesting.disinvestments.acronym = {};
        cashflow.cashflowFromInvesting.disinvestments.acronym.text = texts.disinvestmentsPrefix_acronym;
        cashflow.cashflowFromInvesting.disinvestments.acronym.style = "styleTablRows";
        cashflow.cashflowFromInvesting.disinvestments.amount = {};
        cashflow.cashflowFromInvesting.disinvestments.amount.value = Banana.SDecimal.add(data.balance.fa.intangible_fixedassets.disinvestments, Banana.SDecimal.add(data.balance.fa.financial_fixedassets.disinvestments, data.balance.fa.tangible_fixedassets.disinvestments));
        cashflow.cashflowFromInvesting.disinvestments.amount.style = "styleNormalAmount";

        cashflow.cashflowFromInvesting.investments = {};
        cashflow.cashflowFromInvesting.investments.description = {};
        cashflow.cashflowFromInvesting.investments.description.text = texts.investments_cashflow;
        cashflow.cashflowFromInvesting.investments.description.style = "styleTablRows";
        cashflow.cashflowFromInvesting.investments.acronym = {};
        cashflow.cashflowFromInvesting.investments.acronym.text = texts.investments_acronym;
        cashflow.cashflowFromInvesting.investments.acronym.style = "styleTablRows";
        cashflow.cashflowFromInvesting.investments.amount = {};
        cashflow.cashflowFromInvesting.investments.amount.value = this.getTotalInvestments(data, calcData, cashflow);
        cashflow.cashflowFromInvesting.investments.amount.style = "styleNormalAmount";

        //calculate cashflow from investing activities

        cashflow.cashflowFromInvesting.calcCashFlowFromInvesting = function() {
            let cashflowFromInvesting = "";
            cashflowFromInvesting = Banana.SDecimal.subtract(cashflowFromInvesting, this.investments.amount.value);
            cashflowFromInvesting = Banana.SDecimal.add(cashflowFromInvesting, this.disinvestments.amount.value);
            return cashflowFromInvesting;
        }

        cashflow.cashflowFromInvesting.total = {};
        cashflow.cashflowFromInvesting.total.description = {};
        cashflow.cashflowFromInvesting.total.description.text = texts.cashflow_from_investing;
        cashflow.cashflowFromInvesting.total.description.style = "styleUnderGroupTitles";
        cashflow.cashflowFromInvesting.total.acronym = {};
        cashflow.cashflowFromInvesting.total.acronym.text = texts.cashflowFromInvesting_acronym;
        cashflow.cashflowFromInvesting.total.acronym.style = "styleUnderGroupTitles";
        cashflow.cashflowFromInvesting.total.amount = {};
        cashflow.cashflowFromInvesting.total.amount.value = cashflow.cashflowFromInvesting.calcCashFlowFromInvesting();
        cashflow.cashflowFromInvesting.total.amount.style = "styleMidTotalAmount";

        //cashflow from financing section

        cashflow.cashflowFromFinancing = {};

        cashflow.cashflowFromFinancing.longTermDebts = {};
        cashflow.cashflowFromFinancing.longTermDebts.description = {};
        cashflow.cashflowFromFinancing.longTermDebts.description.text = texts.longtermdebtcapital_cashflow;
        cashflow.cashflowFromFinancing.longTermDebts.description.style = "styleTablRows";
        cashflow.cashflowFromFinancing.longTermDebts.acronym = {}
        cashflow.cashflowFromFinancing.longTermDebts.acronym.text = texts.longtermdebtcapital_acronym;
        cashflow.cashflowFromFinancing.longTermDebts.acronym.style = "styleTablRows";
        cashflow.cashflowFromFinancing.longTermDebts.amount = {};
        cashflow.cashflowFromFinancing.longTermDebts.amount.value = data.balance.ltdc.longter_debts.delta;
        cashflow.cashflowFromFinancing.longTermDebts.amount.style = "styleNormalAmount";

        cashflow.cashflowFromFinancing.dividends = {};
        cashflow.cashflowFromFinancing.dividends.description = {};
        cashflow.cashflowFromFinancing.dividends.description.text = texts.dividends;
        cashflow.cashflowFromFinancing.dividends.description.style = "styleTablRows"
        cashflow.cashflowFromFinancing.dividends.acronym = {}
        cashflow.cashflowFromFinancing.dividends.acronym.text = texts.dividends_acronym;
        cashflow.cashflowFromFinancing.dividends.acronym.style = "styleTablRows";
        cashflow.cashflowFromFinancing.dividends.amount = {};
        cashflow.cashflowFromFinancing.dividends.amount.value = data.balance.oc.balanceProfits.dividends;
        cashflow.cashflowFromFinancing.dividends.amount.style = "styleNormalAmount";

        cashflow.cashflowFromFinancing.ownBaseCapital = {};
        cashflow.cashflowFromFinancing.ownBaseCapital.description = {};
        cashflow.cashflowFromFinancing.ownBaseCapital.description.text = texts.ownbasecapital_cashflow;
        cashflow.cashflowFromFinancing.ownBaseCapital.description.style = "styleTablRows";
        cashflow.cashflowFromFinancing.ownBaseCapital.acronym = {}
        cashflow.cashflowFromFinancing.ownBaseCapital.acronym.text = texts.ownbasecapital_acronym;
        cashflow.cashflowFromFinancing.ownBaseCapital.acronym.style = "styleTablRows";
        cashflow.cashflowFromFinancing.ownBaseCapital.amount = {};
        cashflow.cashflowFromFinancing.ownBaseCapital.amount.value = data.balance.oc.ownbasecapital.delta;
        cashflow.cashflowFromFinancing.ownBaseCapital.amount.style = "styleNormalAmount";


        //calculate cash flow from financing activities
        cashflow.cashflowFromFinancing.calcCashFlowFromFinancing = function() {
            let cashflowFromFinancing = "";
            cashflowFromFinancing = Banana.SDecimal.add(cashflowFromFinancing, this.longTermDebts.amount.value);
            cashflowFromFinancing = Banana.SDecimal.subtract(cashflowFromFinancing, this.dividends.amount.value);
            cashflowFromFinancing = Banana.SDecimal.add(cashflowFromFinancing, this.ownBaseCapital.amount.value);

            return cashflowFromFinancing;
        }

        cashflow.cashflowFromFinancing.total = {};
        cashflow.cashflowFromFinancing.total.description = {};
        cashflow.cashflowFromFinancing.total.description.text = texts.cashflow_from_financing;
        cashflow.cashflowFromFinancing.total.description.style = "styleUnderGroupTitles";
        cashflow.cashflowFromFinancing.total.acronym = {}
        cashflow.cashflowFromFinancing.total.acronym.text = texts.cashflowFromFinancing_acronym;
        cashflow.cashflowFromFinancing.total.acronym.style = "styleUnderGroupTitles";
        cashflow.cashflowFromFinancing.total.amount = {};
        cashflow.cashflowFromFinancing.total.amount.value = cashflow.cashflowFromFinancing.calcCashFlowFromFinancing();
        cashflow.cashflowFromFinancing.total.amount.style = "styleMidTotalAmount";

        // final cashflow sections


        cashflow.calcFinalCashFlow = function() {
            let finalCashFlow = "";
            finalCashFlow = Banana.SDecimal.add(this.operatingCashflow.total.amount.value, this.cashflowFromInvesting.total.amount.value);
            finalCashFlow = Banana.SDecimal.add(finalCashFlow, this.cashflowFromFinancing.total.amount.value);

            return finalCashFlow;
        }

        cashflow.finalCashflow = {};
        cashflow.finalCashflow.description = {};
        cashflow.finalCashflow.description.text = texts.final_cashflow;
        cashflow.finalCashflow.description.style = this.getColorStyle("styleTitlesTotalAmount");
        cashflow.finalCashflow.acronym = {};
        cashflow.finalCashflow.acronym.text = texts.finalCashflow_acronym;
        cashflow.finalCashflow.acronym.style = this.getColorStyle("styleTitlesTotalAmount");
        cashflow.finalCashflow.amount = {};
        cashflow.finalCashflow.amount.value = cashflow.calcFinalCashFlow();
        cashflow.finalCashflow.amount.style = this.getColorStyle("styleTotalAmount");

        //verification section
        cashflow.verifData = {};

        cashflow.verifData.openingLiqu = {};
        cashflow.verifData.openingLiqu.description = {};
        cashflow.verifData.openingLiqu.description.text = texts.opening_liquidity;
        cashflow.verifData.openingLiqu.description.style = "styleTablRows";
        cashflow.verifData.openingLiqu.acronym = {};
        cashflow.verifData.openingLiqu.acronym.text = texts.liquidity_acronym;
        cashflow.verifData.openingLiqu.acronym.style = "styleTablRows";
        cashflow.verifData.openingLiqu.amount = {};
        cashflow.verifData.openingLiqu.amount.value = data.balance.ca.liquidity.opening;
        cashflow.verifData.openingLiqu.amount.style = "styleNormalAmount";

        //cashflow final result reported for verification
        cashflow.verifData.changeInLiquidity = {};
        cashflow.verifData.changeInLiquidity.description = {};
        cashflow.verifData.changeInLiquidity.description.text = texts.cashflowFinal;
        cashflow.verifData.changeInLiquidity.description.style = "styleTablRows";
        cashflow.verifData.changeInLiquidity.acronym = {};
        cashflow.verifData.changeInLiquidity.acronym.text = texts.finalCashflow_acronym;
        cashflow.verifData.changeInLiquidity.acronym.style = "styleTablRows"
        cashflow.verifData.changeInLiquidity.amount = {};
        cashflow.verifData.changeInLiquidity.amount.value = cashflow.finalCashflow.amount.value;
        cashflow.verifData.changeInLiquidity.amount.style = "styleNormalAmount";

        cashflow.verifData.colosingLiqu_calc = {};
        cashflow.verifData.colosingLiqu_calc.description = {};
        cashflow.verifData.colosingLiqu_calc.description.text = texts.closing_liquidity;
        cashflow.verifData.colosingLiqu_calc.description.style = "styleTablRows";
        cashflow.verifData.colosingLiqu_calc.acronym = {};
        cashflow.verifData.colosingLiqu_calc.acronym.text = texts.liquidity_acronym;
        cashflow.verifData.colosingLiqu_calc.acronym.style = "styleTablRows"
        cashflow.verifData.colosingLiqu_calc.amount = {};
        cashflow.verifData.colosingLiqu_calc.amount.value = Banana.SDecimal.add(cashflow.verifData.openingLiqu.amount.value, cashflow.verifData.changeInLiquidity.amount.value);
        cashflow.verifData.colosingLiqu_calc.amount.style = "styleNormalAmount";

        //save the difference
        cashflow.difference = {};
        cashflow.difference.description = {};
        cashflow.difference.description.text = texts.differenceWrn;
        cashflow.difference.description.style = "styleWarningText";
        cashflow.difference.amount = {};
        cashflow.difference.amount.value = Banana.SDecimal.subtract(data.balance.ca.liquidity.balance, cashflow.verifData.colosingLiqu_calc.amount.value);
        cashflow.difference.amount.getStyle = function() {
            if (Banana.SDecimal.isZero(this.value))
                return "styleNormalAmount";
            else
                return "styleWarningAmount";
        }

        return cashflow;

    }
    getTotalInvestments(data, calcData, cashflow) {
        let investments = "";
        investments = Banana.SDecimal.add(investments, data.profitandloss.depreandadjust.balance);
        investments = Banana.SDecimal.add(investments, cashflow.cashflowFromInvesting.disinvestments.amount.value);
        //Fixed assets opening amount
        let fixedassets_opening = Banana.SDecimal.abs(calcData.fixedassets_opening);
        let fixedassets_balance = Banana.SDecimal.abs(calcData.fixedassets);
        investments = Banana.SDecimal.add(investments, fixedassets_balance);
        investments = Banana.SDecimal.subtract(investments, fixedassets_opening);
        //Adjusting the calculation with capital gain and loss
        investments = Banana.SDecimal.subtract(investments, calcData.fixedassets_gain);
        investments = Banana.SDecimal.add(investments, calcData.fixedassets_loss);

        return investments;
    }

    /**
     * @description Instantiate an *index= {}* object that will contain all the calculated ratios.
     * retrieve the values of the calculated parameters and data.
     * divide the indexes by type thanks to the properties of the objects.
     * assign a value to each index property. (description, benchmark...).
     * calculate the ratios.
     * the values of the benchmarks are set taking the parameters from the dialog
     * @Param {object} data: the data object created thanks to loadData methods, containing the values and the sums of the paramters recovered from the dialog.
     * @Param {object} calculated_data: the object returned by the CalculateData method containing the values of the calculated elements.
     * @returns an object containing the calulated ratios.
     */
    calculateIndex(data, calculated_data) {
        var texts = this.getFinancialAnalysisTexts();
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
        var liquidity = data.balance.ca.liquidity.balance;
        var shorttermdebtcapital = calculated_data.shorttermdebtcapital;
        var lcalc1 = Banana.SDecimal.divide(liquidity, shorttermdebtcapital);
        var lcalc2 = Banana.SDecimal.multiply(lcalc1, 100, { 'decimals': this.dialogparam.numberofdecimals });
        var lris = lcalc2.toString();
        index.liqu.doflone.amount = lris;
        index.liqu.doflone.benchmark = data.ratios.liquidityratios.cashratio.value;

        //degree of liquidity 2
        index.liqu.dofltwo = {};
        index.liqu.dofltwo.description = texts.quickratio;
        index.liqu.dofltwo.type = "perc";
        index.liqu.dofltwo.formula = "(liqu + cred) / stdc";
        var credits = data.balance.ca.credits.balance;
        var lcalc3 = Banana.SDecimal.add(liquidity, credits);
        var lcalc4 = Banana.SDecimal.divide(lcalc3, shorttermdebtcapital);
        var lcalc4m = Banana.SDecimal.multiply(lcalc4, 100, { 'decimals': this.dialogparam.numberofdecimals });
        var lris2 = lcalc4m.toString();
        index.liqu.dofltwo.amount = lris2;
        index.liqu.dofltwo.benchmark = data.ratios.liquidityratios.quickratio.value;

        //degree of liquidity 3
        index.liqu.doflthree = {};
        index.liqu.doflthree.description = texts.currentratio;
        index.liqu.doflthree.type = "perc";
        index.liqu.doflthree.formula = "cuas / stdc";
        var currentassets = calculated_data.currentassets;
        var lcalc5 = Banana.SDecimal.divide(currentassets, shorttermdebtcapital);
        var lcalc6 = Banana.SDecimal.multiply(lcalc5, 100, { 'decimals': this.dialogparam.numberofdecimals });
        var lris3 = lcalc6.toString();
        index.liqu.doflthree.amount = lris3;
        index.liqu.doflthree.benchmark = data.ratios.liquidityratios.currentratio.value;

        // net current assets
        index.liqu.netcuas = {};
        index.liqu.netcuas.description = texts.netcurrentasset;
        index.liqu.netcuas.type = "dec";
        index.liqu.netcuas.formula = "cuas-stdc";
        var lcalc7 = Banana.SDecimal.subtract(currentassets, shorttermdebtcapital, { 'decimals': this.dialogparam.numberofdecimals });
        var lris4 = lcalc7.toString();
        lris4 = this.setIndexToZero(lris4);
        index.liqu.netcuas.amount = lris4;
        index.liqu.netcuas.benchmark = data.ratios.liquidityratios.netcurrentasset.value;


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
        var totalassets = calculated_data.totalassets;
        var fcalc = Banana.SDecimal.divide(currentassets, totalassets);
        var fcalc = Banana.SDecimal.multiply(fcalc, 100, { 'decimals': this.dialogparam.numberofdecimals });
        var fris = fcalc.toString();
        index.lev.grcuas.amount = fris;
        index.lev.grcuas.benchmark = data.ratios.leverageratios.degreecirculatingasset.value;

        //degree of fixed assets
        index.lev.grfixa = {};
        index.lev.grfixa.description = texts.percentagefixedasset;
        index.lev.grfixa.type = "perc";
        index.lev.grfixa.formula = "fixa / tota";
        var fixedassets = calculated_data.fixedassets;
        var fcalc1 = Banana.SDecimal.divide(fixedassets, totalassets);
        var fcalc1 = Banana.SDecimal.multiply(fcalc1, 100, { 'decimals': this.dialogparam.numberofdecimals });
        var fris1 = fcalc1.toString();
        index.lev.grfixa.amount = fris1;
        index.lev.grfixa.benchmark = data.ratios.leverageratios.percentagefixedasset.value;



        //Level of debt
        index.lev.gdin = {};
        index.lev.gdin.description = texts.debtratio;
        index.lev.gdin.type = "perc";
        index.lev.gdin.formula = "(stdc+ltdc) / totle";
        var debtcapital = calculated_data.debtcapital;
        var liabilitiesandequity = calculated_data.totalliabilitiesandequity;
        var fcalc2 = Banana.SDecimal.divide(debtcapital, liabilitiesandequity);
        var fcalc3 = Banana.SDecimal.multiply(fcalc2, 100, { 'decimals': this.dialogparam.numberofdecimals });
        var fris2 = fcalc3.toString();
        index.lev.gdin.amount = fris2;
        index.lev.gdin.benchmark = data.ratios.leverageratios.debtratio.value;


        //Level of equity finance
        index.lev.gfcp = {};
        index.lev.gfcp.description = texts.equityratio;
        index.lev.gfcp.type = "perc";
        index.lev.gfcp.formula = "owca / totle";
        var owncapital = calculated_data.owncapital;
        var fcalc4 = Banana.SDecimal.divide(owncapital, liabilitiesandequity);
        var fcalc5 = Banana.SDecimal.multiply(fcalc4, 100, { 'decimals': this.dialogparam.numberofdecimals });
        var fris3 = fcalc5.toString();
        index.lev.gfcp.amount = fris3;
        index.lev.gfcp.benchmark = data.ratios.leverageratios.equityratio.value;

        //Level of self-leverage
        index.lev.gdau = {};
        index.lev.gdau.description = texts.selfinancingratio;
        index.lev.gdau.type = "perc";
        index.lev.gdau.formula = "rese / owca";
        var reserves = data.balance.oc.reserves.balance;
        var fcalc6 = Banana.SDecimal.divide(reserves, owncapital);
        var fcalc7 = Banana.SDecimal.multiply(fcalc6, 100, { 'decimals': this.dialogparam.numberofdecimals });
        var fris4 = fcalc7.toString();
        index.lev.gdau.amount = fris4;
        index.lev.gdau.benchmark = data.ratios.leverageratios.selfinancingratio.value;

        //degree of coverage of fixed assets
        index.lev.fixaco = {};
        index.lev.fixaco.description = texts.fixedassetcoverage;
        index.lev.fixaco.type = "perc";
        index.lev.fixaco.formula = "(owca + ltdc) / fixa";
        var longtermdebtcapital = calculated_data.longtermdebtcapital;
        var fcalc8 = Banana.SDecimal.add(owncapital, longtermdebtcapital);
        var fcalc9 = Banana.SDecimal.divide(fcalc8, fixedassets);
        var fcalc9 = Banana.SDecimal.multiply(fcalc9, 100, { 'decimals': this.dialogparam.numberofdecimals });
        var fris5 = fcalc9.toString();
        index.lev.fixaco.amount = fris5;
        index.lev.fixaco.benchmark = data.ratios.leverageratios.fixedassetcoverage.value;


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
        index.red.roe.description = texts.roe;
        index.red.roe.type = "perc";
        index.red.roe.formula = "profit / owca";
        var rcalc1 = Banana.SDecimal.divide(calculated_data.annualresult, owncapital);
        var rcalc2 = Banana.SDecimal.multiply(rcalc1, 100, { 'decimals': this.dialogparam.numberofdecimals });
        var rris = rcalc2.toString();
        index.red.roe.amount = rris;
        index.red.roe.benchmark = data.ratios.profitabilityratios.profroe.value;


        //return on investment(ROI)
        index.red.roi = {};
        index.red.roi.description = texts.roi;
        index.red.roi.type = "perc";
        index.red.roi.formula = "EBIT / tota  ";
        var rcalc3 = Banana.SDecimal.divide(calculated_data.ebit, totalassets);
        var rcalc4 = Banana.SDecimal.multiply(rcalc3, 100, { 'decimals': this.dialogparam.numberofdecimals });
        var rris2 = rcalc4.toString();
        index.red.roi.amount = rris2;
        index.red.roi.benchmark = data.ratios.profitabilityratios.profroi.value;

        //Return on sales (ROS)
        index.red.ros = {};
        index.red.ros.description = texts.ros;
        index.red.ros.type = "perc";
        index.red.ros.formula = "EBIT / satu";
        var salesturnover = data.profitandloss.salesturnover.balance;
        var rcalc5 = Banana.SDecimal.divide(calculated_data.ebit, salesturnover);
        var rcalc6 = Banana.SDecimal.multiply(rcalc5, 100, { 'decimals': this.dialogparam.numberofdecimals });
        var rris3 = rcalc6.toString();
        index.red.ros.amount = rris3;
        index.red.ros.benchmark = data.ratios.profitabilityratios.profros.value;

        // MOL (Gross profit Margin)
        index.red.mol = {};
        index.red.mol.description = texts.mol;
        index.red.mol.type = "perc";
        index.red.mol.formula = "ebitda / satu";
        var ebitda = calculated_data.ebitda;
        var rcalc7 = Banana.SDecimal.divide(ebitda, salesturnover);
        var rcalc8 = Banana.SDecimal.multiply(rcalc7, 100, { 'decimals': this.dialogparam.numberofdecimals });
        var rris4 = rcalc8.toString();
        index.red.mol.amount = rris4;
        index.red.mol.benchmark = data.ratios.profitabilityratios.profmol.value;

        //Ebt Margin
        index.red.ebm = {};
        index.red.ebm.description = texts.ebtmargin;
        index.red.ebm.type = "perc";
        index.red.ebm.formula = "EBT / satu";
        var rcalc9 = Banana.SDecimal.divide(calculated_data.ebt, salesturnover);
        var rcalc10 = Banana.SDecimal.multiply(rcalc9, 100, { 'decimals': this.dialogparam.numberofdecimals });
        var rris5 = rcalc10.toString();
        index.red.ebm.amount = rris5;
        index.red.ebm.benchmark = data.ratios.profitabilityratios.profebm.value;

        //MON (Profit Margin)
        index.red.mon = {};
        index.red.mon.description = texts.profitmargin;
        index.red.mon.type = "perc";
        index.red.mon.formula = "net profit / satu";
        var rcalc11 = Banana.SDecimal.divide(calculated_data.annualresult, salesturnover);
        var rcalc12 = Banana.SDecimal.multiply(rcalc11, 100, { 'decimals': this.dialogparam.numberofdecimals });
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
        index.eff.rpe.type = "perc";
        index.eff.rpe.formula = texts.efficiencyRPE;
        var ecalc1 = Banana.SDecimal.divide(salesturnover, this.dialogparam.numberofemployees, { 'decimals': this.dialogparam.numberofdecimals });
        var eris1 = ecalc1.toString();
        eris1 = this.setIndexToZero(eris1);
        index.eff.rpe.amount = eris1;
        index.eff.rpe.benchmark = data.ratios.efficiencyratios.revenueperemployee.value;

        //Added value per Employee

        index.eff.ape = {};
        index.eff.ape.description = texts.addedvalueperemployee;
        index.eff.ape.type = "dec";
        index.eff.ape.formula = texts.efficiencyAVE;
        var adva = calculated_data.addedvalue
        var ecalc2 = Banana.SDecimal.divide(adva, this.dialogparam.numberofemployees, { 'decimals': this.dialogparam.numberofdecimals });
        var eris2 = ecalc2.toString();
        eris2 = this.setIndexToZero(eris2);
        index.eff.ape.amount = eris2;
        index.eff.ape.benchmark = data.ratios.efficiencyratios.addedvalueperemployee.value;

        //Employees performance

        index.eff.emp = {};
        index.eff.emp.description = texts.personnelcostperemployee;
        index.eff.emp.type = "dec";
        index.eff.emp.formula = texts.efficiencyPCE;
        var ecalc3 = Banana.SDecimal.divide(data.profitandloss.personnelcosts.balance, this.dialogparam.numberofemployees, { 'decimals': this.dialogparam.numberofdecimals });
        var eris3 = ecalc3.toString();
        eris3 = this.setIndexToZero(eris3);
        index.eff.emp.amount = eris3;
        index.eff.emp.benchmark = data.ratios.efficiencyratios.personnelcostperemployee.value;


        return index;

    }

    /**
     * Calculate the Cashflow ratios.
     * @param {*} freecashflow the free Cashflow (array)
     * @param {*} investments the investments (array)
     */
    calculateCashflowIndex(data, calculated_data, cashflow) {

        let texts = this.getFinancialAnalysisTexts();

        let index = {};

        /*******************************************************
         * Cash Flow Margin (performed over the Cashflow from Operations)
         *****************************************************/

        index.cashflow_margin = {};
        index.cashflow_margin.description = texts.cashflow_margin;
        index.cashflow_margin.type = "perc";
        index.cashflow_margin.formula = "cashflow(A)/satu";
        index.cashflow_margin.amount = Banana.SDecimal.divide(cashflow.operatingCashflow.total.amount.value, data.profitandloss.salesturnover.balance);
        index.cashflow_margin.amount = Banana.SDecimal.multiply(index.cashflow_margin.amount, 100, { 'decimals': this.dialogparam.numberofdecimals });
        index.cashflow_margin.benchmark = data.ratios.cashflowratios.cashflow_margin.value;

        /*******************************************************
         * Asset efficiency
         *****************************************************/

        index.cashflow_asset_efficiency = {};
        index.cashflow_asset_efficiency.description = texts.cashflow_asset_efficiency;
        index.cashflow_asset_efficiency.type = "perc";
        index.cashflow_asset_efficiency.formula = "cashflow(A)/fixa";
        index.cashflow_asset_efficiency.amount = Banana.SDecimal.divide(cashflow.operatingCashflow.total.amount.value, calculated_data.fixedassets);
        index.cashflow_asset_efficiency.amount = Banana.SDecimal.multiply(index.cashflow_asset_efficiency.amount, 100, { 'decimals': this.dialogparam.numberofdecimals });
        index.cashflow_asset_efficiency.benchmark = data.ratios.cashflowratios.cashflow_asset_efficiency.value;

        /*******************************************************
         * Cashflow to current Liabilities
         *****************************************************/

        index.cashflow_current_liabilities = {};
        index.cashflow_current_liabilities.description = texts.cashflow_current_liabilities;
        index.cashflow_current_liabilities.type = "perc";
        index.cashflow_current_liabilities.formula = "cashflow(A)/stdc";
        index.cashflow_current_liabilities.amount = Banana.SDecimal.divide(cashflow.operatingCashflow.total.amount.value, calculated_data.shorttermdebtcapital);
        index.cashflow_current_liabilities.amount = Banana.SDecimal.multiply(index.cashflow_current_liabilities.amount, 100, { 'decimals': this.dialogparam.numberofdecimals });
        index.cashflow_current_liabilities.benchmark = data.ratios.cashflowratios.cashflow_current_liabilities.value;

        /*******************************************************
         * Cashflow to Liabilities
         *****************************************************/

        index.cashflow_liabilities = {};
        index.cashflow_liabilities.description = texts.cashflow_liabilities;
        index.cashflow_liabilities.type = "perc";
        index.cashflow_liabilities.formula = "cashflow(A)/deca";
        index.cashflow_liabilities.amount = Banana.SDecimal.divide(cashflow.operatingCashflow.total.amount.value, calculated_data.debtcapital);
        index.cashflow_liabilities.amount = Banana.SDecimal.multiply(index.cashflow_liabilities.amount, 100, { 'decimals': this.dialogparam.numberofdecimals });
        index.cashflow_liabilities.benchmark = data.ratios.cashflowratios.cashflow_liabilities.value;

        /*******************************************************
         * Cashflow-to-Investments
         * Financial indicator expressing the degree to which capital expenditure was financed from the cash flow generated (similar to the self-financing ratio)
         *****************************************************/

        index.cashflow_to_investments = {};
        index.cashflow_to_investments.description = texts.cashflow_to_investments;
        index.cashflow_to_investments.type = "perc";
        index.cashflow_to_investments.formula = "cashflow(A)/inve";
        index.cashflow_to_investments.amount = Banana.SDecimal.divide(cashflow.operatingCashflow.total.amount.value, cashflow.cashflowFromInvesting.investments.amount.value);
        index.cashflow_to_investments.amount = Banana.SDecimal.multiply(index.cashflow_to_investments.amount, 100, { 'decimals': this.dialogparam.numberofdecimals });
        index.cashflow_to_investments.benchmark = data.ratios.cashflowratios.cashflow_to_investments.value;


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
        var texts = this.getFinancialAnalysisTexts();
        /*array dei parametri dello script*/
        convertedParam.data = [];


        //I create group of preferences
        var currentParam = {};
        currentParam.name = 'Preferences';
        currentParam.title = texts.preferences;
        currentParam.editable = false;

        convertedParam.data.push(currentParam);


        //I create the balance sheet grouping
        var currentParam = {};
        currentParam.name = 'Grouping';
        currentParam.title = texts.grouping;
        currentParam.editable = false;

        convertedParam.data.push(currentParam);


        //I create the balance group
        var currentParam = {};
        currentParam.name = 'Balance';
        currentParam.title = texts.balance;
        currentParam.editable = false;
        currentParam.parentObject = 'Grouping';


        convertedParam.data.push(currentParam);

        //Assets subgroup
        var currentParam = {};
        currentParam.name = 'Assets';
        currentParam.title = texts.assets;
        currentParam.editable = false;
        currentParam.parentObject = 'Balance';

        convertedParam.data.push(currentParam);

        //Current Assets
        var currentParam = {};
        currentParam.name = 'Current Assets';
        currentParam.title = texts.currentassets;
        currentParam.editable = false;
        currentParam.parentObject = 'Assets';

        convertedParam.data.push(currentParam);

        //Fixed Assets
        var currentParam = {};
        currentParam.name = 'Fixed Assets';
        currentParam.title = texts.fixedassets;
        currentParam.editable = false;
        currentParam.parentObject = 'Assets';

        convertedParam.data.push(currentParam);

        // subgroup Liabilities and Equity
        var currentParam = {};
        currentParam.name = 'Liabilities and Equity';
        currentParam.title = texts.liabilitiesandequity;
        currentParam.editable = false;
        currentParam.parentObject = 'Balance';

        convertedParam.data.push(currentParam);

        var currentParam = {};
        currentParam.name = 'Short term Debt Capital';
        currentParam.title = texts.shorttermdebtcapital;
        currentParam.editable = false;
        currentParam.parentObject = 'Liabilities and Equity';

        convertedParam.data.push(currentParam);

        var currentParam = {};
        currentParam.name = 'Long term Debt Capital';
        currentParam.title = texts.longtermdebtcapital;
        currentParam.editable = false;
        currentParam.parentObject = 'Liabilities and Equity';

        convertedParam.data.push(currentParam);


        var currentParam = {};
        currentParam.name = 'Own Capital';
        currentParam.title = texts.owncapital;
        currentParam.editable = false;
        currentParam.parentObject = 'Liabilities and Equity';

        convertedParam.data.push(currentParam);


        // Profit and Loss grouping
        var currentParam = {};
        currentParam.name = 'Profit and Loss';
        currentParam.title = texts.profitandloss;
        currentParam.editable = false;
        currentParam.parentObject = 'Grouping';

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

        //I create an undergroup for the preferences, the Analysis Period
        var currentParam = {};
        currentParam.name = 'Analysis Details';
        currentParam.title = texts.analysisdetails;
        currentParam.editable = false;
        currentParam.parentObject = 'Preferences';

        convertedParam.data.push(currentParam);

        //I create an undergroup for the preferences, the Print Details
        var currentParam = {};
        currentParam.name = 'Print Details';
        currentParam.title = texts.printdetails;
        currentParam.editable = false;
        currentParam.parentObject = 'Preferences';

        convertedParam.data.push(currentParam);



        //we put inside the Texts section, the customizable banchmarks
        var currentParam = {};
        currentParam.name = 'Benchmarks';
        currentParam.title = texts.benchmarks;
        currentParam.editable = false;
        currentParam.collapse = true;

        convertedParam.data.push(currentParam);

        /**
         * under the benchmarks group, we separate the ratios by type: liquidity, leverage and profitability.
         */

        // liquidity ratios
        var currentParam = {};
        currentParam.name = 'Liquidity';
        currentParam.title = texts.liquidity;
        currentParam.editable = false;
        currentParam.parentObject = 'Benchmarks';
        convertedParam.data.push(currentParam);

        // leverage ratios
        var currentParam = {};
        currentParam.name = 'Leverage';
        currentParam.title = texts.leverage;
        currentParam.editable = false;
        currentParam.parentObject = 'Benchmarks';
        convertedParam.data.push(currentParam);

        // profitability ratios
        var currentParam = {};
        currentParam.name = 'Profitability';
        currentParam.title = texts.profitability;
        currentParam.editable = false;
        currentParam.parentObject = 'Benchmarks';
        convertedParam.data.push(currentParam);

        // efficiency ratios
        var currentParam = {};
        currentParam.name = 'Efficiency';
        currentParam.title = texts.efficiency;
        currentParam.editable = false;
        currentParam.parentObject = 'Benchmarks';
        convertedParam.data.push(currentParam);

        // Cashflow ratios
        var currentParam = {};
        currentParam.name = 'CashflowRatios';
        currentParam.title = texts.cashflow;
        currentParam.editable = false;
        currentParam.parentObject = 'Benchmarks';
        convertedParam.data.push(currentParam);


        var currentParam = {};
        currentParam.name = 'liqu';
        currentParam.group = 'balance';
        currentParam.title = defaultParam.balance.ca.liquidity.description;
        currentParam.type = 'string';
        currentParam.value = userParam.balance.ca.liquidity.gr ? userParam.balance.ca.liquidity.gr : '';
        currentParam.defaultvalue = defaultParam.balance.ca.liquidity.gr;
        currentParam.tooltip = texts.groups_tooltip;
        currentParam.parentObject = 'Current Assets';
        currentParam.readValue = function() {
            userParam.balance.ca.liquidity.gr = this.value;
        }

        convertedParam.data.push(currentParam);

        var currentParam = {};
        currentParam.name = 'cred';
        currentParam.group = 'balance';
        currentParam.title = defaultParam.balance.ca.credits.description;
        currentParam.type = 'string';
        currentParam.value = userParam.balance.ca.credits.gr ? userParam.balance.ca.credits.gr : '';
        currentParam.defaultvalue = defaultParam.balance.ca.credits.gr;
        currentParam.tooltip = texts.groups_tooltip;
        currentParam.parentObject = 'Current Assets';
        currentParam.readValue = function() {
            userParam.balance.ca.credits.gr = this.value;
        }
        convertedParam.data.push(currentParam);

        var currentParam = {};
        currentParam.name = 'stoc';
        currentParam.group = 'balance';
        currentParam.title = defaultParam.balance.ca.stocks.description;
        currentParam.type = 'string';
        currentParam.value = userParam.balance.ca.stocks.gr ? userParam.balance.ca.stocks.gr : '';
        currentParam.defaultvalue = defaultParam.balance.ca.stocks.gr;
        currentParam.tooltip = texts.groups_tooltip;
        currentParam.parentObject = 'Current Assets';
        currentParam.readValue = function() {
            userParam.balance.ca.stocks.gr = this.value;
        }
        convertedParam.data.push(currentParam);

        //Prepaid expenses
        var currentParam = {};
        currentParam.name = 'prep';
        currentParam.group = 'balance';
        currentParam.title = defaultParam.balance.ca.prepaid_expenses.description;
        currentParam.type = 'string';
        currentParam.value = userParam.balance.ca.prepaid_expenses.gr ? userParam.balance.ca.prepaid_expenses.gr : '';
        currentParam.defaultvalue = defaultParam.balance.ca.prepaid_expenses.gr;
        currentParam.tooltip = texts.groups_tooltip;
        currentParam.parentObject = 'Current Assets';
        currentParam.readValue = function() {
            userParam.balance.ca.prepaid_expenses.gr = this.value;
        }
        convertedParam.data.push(currentParam);

        var currentParam = {};
        currentParam.name = 'fin_fixa';
        currentParam.group = 'balance';
        currentParam.title = defaultParam.balance.fa.financial_fixedassets.description;
        currentParam.type = 'string';
        currentParam.value = userParam.balance.fa.financial_fixedassets.gr ? userParam.balance.fa.financial_fixedassets.gr : '';
        currentParam.defaultvalue = defaultParam.balance.fa.financial_fixedassets.gr;
        currentParam.tooltip = texts.groups_tooltip;
        currentParam.parentObject = 'Fixed Assets';
        currentParam.readValue = function() {
            userParam.balance.fa.financial_fixedassets.gr = this.value;
        }
        convertedParam.data.push(currentParam);

        var currentParam = {};
        currentParam.name = 'tan_fixa';
        currentParam.group = 'balance';
        currentParam.title = defaultParam.balance.fa.tangible_fixedassets.description;
        currentParam.type = 'string';
        currentParam.value = userParam.balance.fa.tangible_fixedassets.gr ? userParam.balance.fa.tangible_fixedassets.gr : '';
        currentParam.defaultvalue = defaultParam.balance.fa.tangible_fixedassets.gr;
        currentParam.tooltip = texts.groups_tooltip;
        currentParam.parentObject = 'Fixed Assets';
        currentParam.readValue = function() {
            userParam.balance.fa.tangible_fixedassets.gr = this.value;
        }
        convertedParam.data.push(currentParam);

        var currentParam = {};
        currentParam.name = 'intan_fixa';
        currentParam.group = 'balance';
        currentParam.title = defaultParam.balance.fa.intangible_fixedassets.description;
        currentParam.type = 'string';
        currentParam.value = userParam.balance.fa.intangible_fixedassets.gr ? userParam.balance.fa.intangible_fixedassets.gr : '';
        currentParam.defaultvalue = defaultParam.balance.fa.intangible_fixedassets.gr;
        currentParam.tooltip = texts.groups_tooltip;
        currentParam.parentObject = 'Fixed Assets';
        currentParam.readValue = function() {
            userParam.balance.fa.intangible_fixedassets.gr = this.value;
        }
        convertedParam.data.push(currentParam);

        var currentParam = {};
        currentParam.name = 'debts';
        currentParam.group = 'balance';
        currentParam.title = defaultParam.balance.stdc.debts.description;
        currentParam.type = 'string';
        currentParam.value = userParam.balance.stdc.debts.gr ? userParam.balance.stdc.debts.gr : '';
        currentParam.defaultvalue = defaultParam.balance.stdc.debts.gr;
        currentParam.tooltip = texts.groups_tooltip;
        currentParam.parentObject = 'Short term Debt Capital';
        currentParam.readValue = function() {
            userParam.balance.stdc.debts.gr = this.value;
        }
        convertedParam.data.push(currentParam);

        //accrualsanddeferredincome
        var currentParam = {};
        currentParam.name = 'accruals';
        currentParam.group = 'balance';
        currentParam.title = defaultParam.balance.stdc.accruals_and_deferred_income.description;
        currentParam.type = 'string';
        currentParam.value = userParam.balance.stdc.accruals_and_deferred_income.gr ? userParam.balance.stdc.accruals_and_deferred_income.gr : '';
        currentParam.defaultvalue = defaultParam.balance.stdc.accruals_and_deferred_income.gr;
        currentParam.tooltip = texts.amounts_tooltip;
        currentParam.parentObject = 'Short term Debt Capital';
        currentParam.readValue = function() {
            userParam.balance.stdc.accruals_and_deferred_income.gr = this.value;
        }
        convertedParam.data.push(currentParam);

        var currentParam = {};
        currentParam.name = 'longter_debts';
        currentParam.group = 'balance';
        currentParam.title = defaultParam.balance.ltdc.longter_debts.description;
        currentParam.type = 'string';
        currentParam.value = userParam.balance.ltdc.longter_debts.gr ? userParam.balance.ltdc.longter_debts.gr : '';
        currentParam.defaultvalue = defaultParam.balance.ltdc.longter_debts.gr;
        currentParam.tooltip = texts.groups_tooltip;
        currentParam.parentObject = 'Long term Debt Capital';
        currentParam.readValue = function() {
            userParam.balance.ltdc.longter_debts.gr = this.value;
        }
        convertedParam.data.push(currentParam);

        //Provisions and Similar
        var currentParam = {};
        currentParam.name = 'prov';
        currentParam.group = 'balance';
        currentParam.title = defaultParam.balance.ltdc.provisionsandsimilar.description;
        currentParam.type = 'string';
        currentParam.value = userParam.balance.ltdc.provisionsandsimilar.gr ? userParam.balance.ltdc.provisionsandsimilar.gr : '';
        currentParam.defaultvalue = defaultParam.balance.ltdc.provisionsandsimilar.gr;
        currentParam.tooltip = texts.groups_tooltip;
        currentParam.parentObject = 'Long term Debt Capital';
        currentParam.readValue = function() {
            userParam.balance.ltdc.provisionsandsimilar.gr = this.value;
        }
        convertedParam.data.push(currentParam);

        var currentParam = {};
        currentParam.name = 'obca';
        currentParam.group = 'balance';
        currentParam.title = defaultParam.balance.oc.ownbasecapital.description;
        currentParam.type = 'string';
        currentParam.value = userParam.balance.oc.ownbasecapital.gr ? userParam.balance.oc.ownbasecapital.gr : '';
        currentParam.defaultvalue = defaultParam.balance.oc.ownbasecapital.gr;
        currentParam.tooltip = texts.groups_tooltip;
        currentParam.parentObject = 'Own Capital';
        currentParam.readValue = function() {
            userParam.balance.oc.ownbasecapital.gr = this.value;
        }
        convertedParam.data.push(currentParam);

        var currentParam = {};
        currentParam.name = 'rese';
        currentParam.group = 'balance';
        currentParam.title = defaultParam.balance.oc.reserves.description;
        currentParam.type = 'string';
        currentParam.value = userParam.balance.oc.reserves.gr ? userParam.balance.oc.reserves.gr : '';
        currentParam.defaultvalue = defaultParam.balance.oc.reserves.gr;
        currentParam.tooltip = texts.groups_tooltip;
        currentParam.parentObject = 'Own Capital';
        currentParam.readValue = function() {
            userParam.balance.oc.reserves.gr = this.value;
        }
        convertedParam.data.push(currentParam);


        var currentParam = {};
        currentParam.name = 'balp';
        currentParam.group = 'balance';
        currentParam.title = defaultParam.balance.oc.balanceProfits.description;
        currentParam.type = 'string';
        currentParam.value = userParam.balance.oc.balanceProfits.gr ? userParam.balance.oc.balanceProfits.gr : '';
        currentParam.defaultvalue = defaultParam.balance.oc.balanceProfits.gr;
        currentParam.tooltip = texts.groups_tooltip;
        currentParam.parentObject = 'Own Capital';
        currentParam.readValue = function() {
            userParam.balance.oc.balanceProfits.gr = this.value;
        }
        convertedParam.data.push(currentParam);

        var currentParam = {};
        currentParam.name = 'satu';
        currentParam.group = 'profitandloss';
        currentParam.title = defaultParam.profitandloss.salesturnover.description;
        currentParam.type = 'string';
        currentParam.value = userParam.profitandloss.salesturnover.gr ? userParam.profitandloss.salesturnover.gr : '';
        currentParam.defaultvalue = defaultParam.profitandloss.salesturnover.gr;
        currentParam.tooltip = texts.groups_tooltip;
        currentParam.parentObject = 'Revenues';
        currentParam.readValue = function() {
            userParam.profitandloss.salesturnover.gr = this.value;
        }
        convertedParam.data.push(currentParam);

        var currentParam = {};
        currentParam.name = 'cofm';
        currentParam.group = 'profitandloss';
        currentParam.title = defaultParam.profitandloss.costofmerchandservices.description;
        currentParam.type = 'string';
        currentParam.value = userParam.profitandloss.costofmerchandservices.gr ? userParam.profitandloss.costofmerchandservices.gr : '';
        currentParam.defaultvalue = defaultParam.profitandloss.costofmerchandservices.gr;
        currentParam.tooltip = texts.groups_tooltip;
        currentParam.parentObject = 'Costs';
        currentParam.readValue = function() {
            userParam.profitandloss.costofmerchandservices.gr = this.value;
        }
        convertedParam.data.push(currentParam);

        var currentParam = {};
        currentParam.name = 'cope';
        currentParam.group = 'profitandloss';
        currentParam.title = defaultParam.profitandloss.personnelcosts.description;
        currentParam.type = 'string';
        currentParam.value = userParam.profitandloss.personnelcosts.gr ? userParam.profitandloss.personnelcosts.gr : '';
        currentParam.defaultvalue = defaultParam.profitandloss.personnelcosts.gr;
        currentParam.tooltip = texts.groups_tooltip;
        currentParam.parentObject = 'Costs';
        currentParam.readValue = function() {
            userParam.profitandloss.personnelcosts.gr = this.value;
        }
        convertedParam.data.push(currentParam);

        var currentParam = {};
        currentParam.name = 'codi';
        currentParam.group = 'profitandloss';
        currentParam.title = defaultParam.profitandloss.differentcosts.description;
        currentParam.type = 'string';
        currentParam.value = userParam.profitandloss.differentcosts.gr ? userParam.profitandloss.differentcosts.gr : '';
        currentParam.defaultvalue = defaultParam.profitandloss.differentcosts.gr;
        currentParam.tooltip = texts.groups_tooltip;
        currentParam.parentObject = 'Costs';
        currentParam.readValue = function() {
            userParam.profitandloss.differentcosts.gr = this.value;
        }
        convertedParam.data.push(currentParam);

        var currentParam = {};
        currentParam.name = 'amre';
        currentParam.group = 'profitandloss';
        currentParam.title = defaultParam.profitandloss.depreandadjust.description;
        currentParam.type = 'string';
        currentParam.value = userParam.profitandloss.depreandadjust.gr ? userParam.profitandloss.depreandadjust.gr : '';
        currentParam.defaultvalue = defaultParam.profitandloss.depreandadjust.gr;
        currentParam.tooltip = texts.groups_tooltip;
        currentParam.parentObject = 'Costs';
        currentParam.readValue = function() {
            userParam.profitandloss.depreandadjust.gr = this.value;
        }
        convertedParam.data.push(currentParam);

        var currentParam = {};
        currentParam.name = 'inte';
        currentParam.group = 'profitandloss';
        currentParam.title = defaultParam.profitandloss.interests.description;
        currentParam.type = 'string';
        currentParam.value = userParam.profitandloss.interests.gr ? userParam.profitandloss.interests.gr : '';
        currentParam.defaultvalue = defaultParam.profitandloss.interests.gr;
        currentParam.tooltip = texts.groups_tooltip;
        currentParam.parentObject = 'Costs';
        currentParam.readValue = function() {
            userParam.profitandloss.interests.gr = this.value;
        }
        convertedParam.data.push(currentParam);

        var currentParam = {};
        currentParam.name = 'dite';
        currentParam.group = 'profitandloss';
        currentParam.title = defaultParam.profitandloss.directtaxes.description;
        currentParam.type = 'string';
        currentParam.value = userParam.profitandloss.directtaxes.gr ? userParam.profitandloss.directtaxes.gr : '';
        currentParam.defaultvalue = defaultParam.profitandloss.directtaxes.gr;
        currentParam.tooltip = texts.groups_tooltip;
        currentParam.parentObject = 'Costs';
        currentParam.readValue = function() {
            userParam.profitandloss.directtaxes.gr = this.value;
        }
        convertedParam.data.push(currentParam);


        //final result
        var currentParam = {};
        currentParam.name = 'fire';
        currentParam.group = 'profitandloss';
        currentParam.title = defaultParam.finalresult.finalresult.description;
        currentParam.type = 'string';
        currentParam.value = userParam.finalresult.finalresult.gr ? userParam.finalresult.finalresult.gr : '';
        currentParam.defaultvalue = defaultParam.finalresult.finalresult.gr;
        currentParam.tooltip = texts.groups_tooltip;
        currentParam.parentObject = 'Final Result';
        currentParam.readValue = function() {
            userParam.finalresult.finalresult.gr = this.value;
        }
        convertedParam.data.push(currentParam);

        //Page Header
        var currentParam = {};
        currentParam.name = 'pageheader';
        currentParam.group = 'preferences';
        currentParam.title = texts.pageheader;
        currentParam.type = 'bool';
        currentParam.value = userParam.pageheader ? userParam.pageheader : userParam.pageheader;
        currentParam.defaultvalue = defaultParam.pageheader;
        currentParam.tooltip = texts.logo_tooltip;
        currentParam.parentObject = 'Print Details';
        currentParam.readValue = function() {
            userParam.pageheader = this.value;
        }
        convertedParam.data.push(currentParam);

        //Print Logo
        var currentParam = {};
        currentParam.name = 'printlogo';
        currentParam.group = 'preferences';
        currentParam.title = texts.printlogo;
        currentParam.type = 'bool';
        currentParam.value = userParam.printlogo ? userParam.printlogo : userParam.printlogo;
        currentParam.defaultvalue = defaultParam.printlogo;
        currentParam.tooltip = texts.logo_tooltip;
        currentParam.parentObject = 'Print Details';
        currentParam.readValue = function() {
            userParam.printlogo = this.value;
        }
        convertedParam.data.push(currentParam);

        //Logo name
        var currentParam = {};
        currentParam.name = 'logoname';
        currentParam.group = 'preferences';
        currentParam.title = texts.logoname;
        currentParam.type = 'string';
        currentParam.value = userParam.logoname ? userParam.logoname : userParam.logoname;
        currentParam.defaultvalue = defaultParam.logoname;
        currentParam.tooltip = texts.logoname_tooltip;
        currentParam.parentObject = 'Print Details';
        currentParam.readValue = function() {
            userParam.logoname = this.value;
        }
        convertedParam.data.push(currentParam);

        //Header background color
        var currentParam = {};
        currentParam.name = 'headerbackgroundcolor';
        currentParam.group = 'preferences';
        currentParam.title = texts.headers_background_color;
        currentParam.type = 'color';
        currentParam.value = userParam.headers_background_color ? userParam.headers_background_color : userParam.headers_background_color;
        currentParam.defaultvalue = defaultParam.headers_background_color;
        currentParam.tooltip = texts.headers_background_color_tooltip;
        currentParam.parentObject = 'Print Details';
        currentParam.readValue = function() {
            userParam.headers_background_color = this.value;
        }
        convertedParam.data.push(currentParam);

        //Header texts color
        var currentParam = {};
        currentParam.name = 'headertextscolor';
        currentParam.group = 'preferences';
        currentParam.title = texts.headers_texts_color;
        currentParam.type = 'color';
        currentParam.value = userParam.headers_texts_color ? userParam.headers_texts_color : userParam.headers_texts_color;
        currentParam.defaultvalue = defaultParam.headers_texts_color;
        currentParam.tooltip = texts.headers_texts_color_tooltip;
        currentParam.parentObject = 'Print Details';
        currentParam.readValue = function() {
            userParam.headers_texts_color = this.value;
        }
        convertedParam.data.push(currentParam);

        //Without colors
        var currentParam = {};
        currentParam.name = 'withoutcolors';
        currentParam.group = 'preferences';
        currentParam.title = texts.without_colors;
        currentParam.type = 'bool';
        currentParam.value = userParam.without_colors ? userParam.without_colors : userParam.without_colors;
        currentParam.defaultvalue = defaultParam.without_colors;
        currentParam.tooltip = texts.without_colors_tooltip;
        currentParam.parentObject = 'Print Details';
        currentParam.readValue = function() {
            userParam.without_colors = this.value;
        }
        convertedParam.data.push(currentParam);


        //Number of previous years
        var currentParam = {};
        currentParam.name = 'maxpreviousyears';
        currentParam.group = 'preferences';
        currentParam.title = texts.numberofpreviousyear;
        currentParam.type = 'string';
        currentParam.value = userParam.maxpreviousyears ? userParam.maxpreviousyears : '2';
        currentParam.defaultvalue = defaultParam.maxpreviousyears;
        currentParam.tooltip = texts.numberofpreviousyear_tooltip;
        currentParam.parentObject = 'Analysis Details';
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
        currentParam.tooltip = texts.numberofdecimals_tooltip;
        currentParam.parentObject = 'Analysis Details';
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
        currentParam.tooltip = texts.includebudget_tooltip;
        currentParam.parentObject = 'Analysis Details';
        currentParam.readValue = function() {
            userParam.includebudgettable = this.value;
        }

        convertedParam.data.push(currentParam);

        //Include the Budget to date
        var currentParam = {};
        currentParam.name = 'includebudgetdodate';
        currentParam.group = 'preferences';
        currentParam.title = texts.includebudget_todate;
        currentParam.type = 'bool';
        currentParam.value = userParam.includebudget_todate ? userParam.includebudget_todate : userParam.includebudget_todate;
        currentParam.defaultvalue = defaultParam.includebudget_todate;
        currentParam.tooltip = texts.includebudget_todate_tooltip;
        currentParam.parentObject = 'Analysis Details';
        currentParam.readValue = function() {
            userParam.includebudget_todate = this.value;
        }

        convertedParam.data.push(currentParam);

        //Include  current year projection 
        var currentParam = {};
        currentParam.name = 'currentyearprojection';
        currentParam.group = 'preferences';
        currentParam.title = texts.includecurrentyear_projection;
        currentParam.type = 'bool';
        currentParam.value = userParam.includecurrentyear_projection ? userParam.includecurrentyear_projection : userParam.includecurrentyear_projection;
        currentParam.defaultvalue = defaultParam.includecurrentyear_projection;
        currentParam.tooltip = texts.includecurrentyear_projection_tooltip;
        currentParam.parentObject = 'Analysis Details';
        currentParam.readValue = function() {
            userParam.includecurrentyear_projection = this.value;
        }

        convertedParam.data.push(currentParam);

        //Enter the current date
        //Calendar date is displayed in the local format. returns and accept format "yyyymmdd"
        let yearToDate = this.getCurrentDate();
        currentParam = {};
        currentParam.name = 'currentdate';
        currentParam.group = 'preferences';
        currentParam.title = texts.currentdate;
        currentParam.type = 'date';
        currentParam.parentObject = 'Analysis Details';
        currentParam.value = userParam.currentdate ? userParam.currentdate : yearToDate;
        /*Banana.console.debug("current param: " + currentParam.value);
        Banana.console.debug("user param: " + userParam.currentdate);
        Banana.console.debug("yeartodate: " + yearToDate);*/
        //Default value is red differently so we have to use the local format.
        currentParam.defaultvalue = Banana.Converter.toLocaleDateFormat(yearToDate);
        currentParam.readValue = function() {
            userParam.currentdate = this.value;
            //Banana.console.debug("read value: " + yearToDate); //vedere se forse il formato locale viene impostato in c++, e quindi devo re impostare quello corretto.
        }
        convertedParam.data.push(currentParam);

        //Include the Dupont analysis table in the analysis
        var currentParam = {};
        currentParam.name = 'includedupontanalysis';
        currentParam.group = 'preferences';
        currentParam.title = texts.includedupontanalysis;
        currentParam.type = 'bool';
        currentParam.value = userParam.includedupontanalysis ? userParam.includedupontanalysis : userParam.includedupontanalysis;
        currentParam.defaultvalue = defaultParam.includedupontanalysis;
        currentParam.tooltip = texts.includedupontanalysis_tooltip;
        currentParam.parentObject = 'Analysis Details';
        currentParam.readValue = function() {
            userParam.includedupontanalysis = this.value;
        }

        convertedParam.data.push(currentParam);

        //Include the control sums table
        var currentParam = {};
        currentParam.name = 'includecontrolsums';
        currentParam.group = 'preferences';
        currentParam.title = texts.includecontrolsums;
        currentParam.type = 'bool';
        currentParam.value = userParam.includecontrolsums ? userParam.includecontrolsums : userParam.includecontrolsums;
        currentParam.defaultvalue = defaultParam.includecontrolsums;
        currentParam.tooltip = texts.includecontrolsums_tooltip;
        currentParam.parentObject = 'Analysis Details';
        currentParam.readValue = function() {
            userParam.includecontrolsums = this.value;
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
        currentParam.tooltip = texts.showacronymcolumn_tooltip;
        currentParam.parentObject = 'Analysis Details';
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
        currentParam.tooltip = texts.showformulascolumn_tooltip;
        currentParam.parentObject = 'Analysis Details';
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
        currentParam.tooltip = texts.averagenumberofemployee_tooltip;
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
        currentParam.title = defaultParam.ratios.liquidityratios.cashratio.description;
        currentParam.type = 'string';
        currentParam.value = userParam.ratios.liquidityratios.cashratio.value ? userParam.ratios.liquidityratios.cashratio.value : '';
        currentParam.defaultvalue = defaultParam.ratios.liquidityratios.cashratio.value;
        currentParam.tooltip = texts.benchmarks_tooltip;
        currentParam.parentObject = 'Liquidity';
        currentParam.readValue = function() {
            userParam.ratios.liquidityratios.cashratio.value = this.value;
        }
        convertedParam.data.push(currentParam);

        // liquidity 2 benchmark
        var currentParam = {};
        currentParam.name = 'liq2benchmark';
        currentParam.group = 'benchmarks';
        currentParam.title = defaultParam.ratios.liquidityratios.quickratio.description;
        currentParam.type = 'string';
        currentParam.value = userParam.ratios.liquidityratios.quickratio.value ? userParam.ratios.liquidityratios.quickratio.value : '';
        currentParam.defaultvalue = defaultParam.ratios.liquidityratios.quickratio.value;
        currentParam.tooltip = texts.benchmarks_tooltip;
        currentParam.parentObject = 'Liquidity';
        currentParam.readValue = function() {
            userParam.ratios.liquidityratios.quickratio.value = this.value;
        }
        convertedParam.data.push(currentParam);

        // liquidity 3 benchmark
        var currentParam = {};
        currentParam.name = 'liq3benchmark';
        currentParam.group = 'benchmarks';
        currentParam.title = defaultParam.ratios.liquidityratios.currentratio.description;
        currentParam.type = 'string';
        currentParam.value = userParam.ratios.liquidityratios.currentratio.value ? userParam.ratios.liquidityratios.currentratio.value : '';
        currentParam.defaultvalue = defaultParam.ratios.liquidityratios.currentratio.value;
        currentParam.tooltip = texts.benchmarks_tooltip;
        currentParam.parentObject = 'Liquidity';
        currentParam.readValue = function() {
            userParam.ratios.liquidityratios.currentratio.value = this.value;
        }
        convertedParam.data.push(currentParam);

        // net current asset benchmark
        var currentParam = {};
        currentParam.name = 'netcurrassbenchmark';
        currentParam.group = 'benchmarks';
        currentParam.title = defaultParam.ratios.liquidityratios.netcurrentasset.description;
        currentParam.type = 'string';
        currentParam.value = userParam.ratios.liquidityratios.netcurrentasset.value ? userParam.ratios.liquidityratios.netcurrentasset.value : '';
        currentParam.defaultvalue = defaultParam.ratios.liquidityratios.netcurrentasset.value;
        currentParam.tooltip = texts.benchmarks_tooltip;
        currentParam.parentObject = 'Liquidity';
        currentParam.readValue = function() {
            userParam.ratios.liquidityratios.netcurrentasset.value = this.value;
        }
        convertedParam.data.push(currentParam);

        // degree of circulating assets benchmark
        var currentParam = {};
        currentParam.name = 'cirractbenchmark';
        currentParam.group = 'benchmarks';
        currentParam.title = defaultParam.ratios.leverageratios.degreecirculatingasset.description;
        currentParam.type = 'string';
        currentParam.value = userParam.ratios.leverageratios.degreecirculatingasset.value ? userParam.ratios.leverageratios.degreecirculatingasset.value : '';
        currentParam.defaultvalue = defaultParam.ratios.leverageratios.degreecirculatingasset.value;
        currentParam.tooltip = texts.benchmarks_tooltip;
        currentParam.parentObject = 'Leverage';
        currentParam.readValue = function() {
            userParam.ratios.leverageratios.degreecirculatingasset.value = this.value;
        }
        convertedParam.data.push(currentParam);

        // degree of fixed asset benchmark
        var currentParam = {};
        currentParam.name = 'fixassbenchmark';
        currentParam.group = 'benchmarks';
        currentParam.title = defaultParam.ratios.leverageratios.percentagefixedasset.description;
        currentParam.type = 'string';
        currentParam.value = userParam.ratios.leverageratios.percentagefixedasset.value ? userParam.ratios.leverageratios.percentagefixedasset.value : '';
        currentParam.defaultvalue = defaultParam.ratios.leverageratios.percentagefixedasset.value;
        currentParam.tooltip = texts.benchmarks_tooltip;
        currentParam.parentObject = 'Leverage';
        currentParam.readValue = function() {
            userParam.ratios.leverageratios.percentagefixedasset.value = this.value;
        }
        convertedParam.data.push(currentParam);

        // level of debt benchmark
        var currentParam = {};
        currentParam.name = 'lvldebbenchmark';
        currentParam.group = 'benchmarks';
        currentParam.title = defaultParam.ratios.leverageratios.debtratio.description;
        currentParam.type = 'string';
        currentParam.value = userParam.ratios.leverageratios.debtratio.value ? userParam.ratios.leverageratios.debtratio.value : '';
        currentParam.defaultvalue = defaultParam.ratios.leverageratios.debtratio.value;
        currentParam.tooltip = texts.benchmarks_tooltip;
        currentParam.parentObject = 'Leverage';
        currentParam.readValue = function() {
            userParam.ratios.leverageratios.debtratio.value = this.value;
        }
        convertedParam.data.push(currentParam);

        // level of equity finance benchmark
        var currentParam = {};
        currentParam.name = 'lvlequbenchmark';
        currentParam.group = 'benchmarks';
        currentParam.title = defaultParam.ratios.leverageratios.equityratio.description;
        currentParam.type = 'string';
        currentParam.value = userParam.ratios.leverageratios.equityratio.value ? userParam.ratios.leverageratios.equityratio.value : '';
        currentParam.defaultvalue = defaultParam.ratios.leverageratios.equityratio.value;
        currentParam.tooltip = texts.benchmarks_tooltip;
        currentParam.parentObject = 'Leverage';
        currentParam.readValue = function() {
            userParam.ratios.leverageratios.equityratio.value = this.value;
        }
        convertedParam.data.push(currentParam);

        // level of self leverage benchmark
        var currentParam = {};
        currentParam.name = 'lvlselbenchmark';
        currentParam.group = 'benchmarks';
        currentParam.title = defaultParam.ratios.leverageratios.selfinancingratio.description;
        currentParam.type = 'string';
        currentParam.value = userParam.ratios.leverageratios.selfinancingratio.value ? userParam.ratios.leverageratios.selfinancingratio.value : '';
        currentParam.defaultvalue = defaultParam.ratios.leverageratios.selfinancingratio.value;
        currentParam.tooltip = texts.benchmarks_tooltip;
        currentParam.parentObject = 'Leverage';
        currentParam.readValue = function() {
            userParam.ratios.leverageratios.selfinancingratio.value = this.value;
        }
        convertedParam.data.push(currentParam);

        // coverage of fixed assets benchmark
        var currentParam = {};
        currentParam.name = 'covfixbenchmark';
        currentParam.group = 'benchmarks';
        currentParam.title = defaultParam.ratios.leverageratios.fixedassetcoverage.description;
        currentParam.type = 'string';
        currentParam.value = userParam.ratios.leverageratios.fixedassetcoverage.value ? userParam.ratios.leverageratios.fixedassetcoverage.value : '';
        currentParam.defaultvalue = defaultParam.ratios.leverageratios.fixedassetcoverage.value;
        currentParam.tooltip = texts.benchmarks_tooltip;
        currentParam.parentObject = 'Leverage';
        currentParam.readValue = function() {
            userParam.ratios.leverageratios.fixedassetcoverage.value = this.value;
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
        currentParam.tooltip = texts.benchmarks_tooltip;
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
        currentParam.tooltip = texts.benchmarks_tooltip;
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
        currentParam.tooltip = texts.benchmarks_tooltip;
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
        currentParam.tooltip = texts.benchmarks_tooltip;
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
        currentParam.tooltip = texts.benchmarks_tooltip;
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
        currentParam.tooltip = texts.benchmarks_tooltip;
        currentParam.parentObject = 'Profitability';
        currentParam.readValue = function() {
            userParam.ratios.profitabilityratios.profmon.value = this.value;
        }
        convertedParam.data.push(currentParam)

        // Revenue per Employee Benchmark
        var currentParam = {};
        currentParam.name = 'revperemployee';
        currentParam.group = 'benchmarks';
        currentParam.title = defaultParam.ratios.efficiencyratios.revenueperemployee.description;
        currentParam.type = 'string';
        currentParam.value = userParam.ratios.efficiencyratios.revenueperemployee.value ? userParam.ratios.efficiencyratios.revenueperemployee.value : '';
        currentParam.defaultvalue = defaultParam.ratios.efficiencyratios.revenueperemployee.value;
        currentParam.tooltip = texts.benchmarks_tooltip;
        currentParam.parentObject = 'Efficiency';
        currentParam.readValue = function() {
            userParam.ratios.efficiencyratios.revenueperemployee.value = this.value;
        }
        convertedParam.data.push(currentParam)

        // Added Value per Employee Benchmark
        var currentParam = {};
        currentParam.name = 'addvalperemployee';
        currentParam.group = 'benchmarks';
        currentParam.title = defaultParam.ratios.efficiencyratios.addedvalueperemployee.description;
        currentParam.type = 'string';
        currentParam.value = userParam.ratios.efficiencyratios.addedvalueperemployee.value ? userParam.ratios.efficiencyratios.addedvalueperemployee.value : '';
        currentParam.defaultvalue = defaultParam.ratios.efficiencyratios.addedvalueperemployee.value;
        currentParam.tooltip = texts.benchmarks_tooltip;
        currentParam.parentObject = 'Efficiency';
        currentParam.readValue = function() {
            userParam.ratios.efficiencyratios.addedvalueperemployee.value = this.value;
        }
        convertedParam.data.push(currentParam)

        // Personal cost per Employee Benchmark
        var currentParam = {};
        currentParam.name = 'perscostperemployee';
        currentParam.group = 'benchmarks';
        currentParam.title = defaultParam.ratios.efficiencyratios.personnelcostperemployee.description;
        currentParam.type = 'string';
        currentParam.value = userParam.ratios.efficiencyratios.personnelcostperemployee.value ? userParam.ratios.efficiencyratios.personnelcostperemployee.value : '';
        currentParam.defaultvalue = defaultParam.ratios.efficiencyratios.personnelcostperemployee.value;
        currentParam.tooltip = texts.benchmarks_tooltip;
        currentParam.parentObject = 'Efficiency';
        currentParam.readValue = function() {
            userParam.ratios.efficiencyratios.personnelcostperemployee.value = this.value;
        }
        convertedParam.data.push(currentParam)

        // Cashflow margin
        var currentParam = {};
        currentParam.name = 'cashflowmargin';
        currentParam.group = 'benchmarks';
        currentParam.title = defaultParam.ratios.cashflowratios.cashflow_margin.description;
        currentParam.type = 'string';
        currentParam.value = userParam.ratios.cashflowratios.cashflow_margin.value ? userParam.ratios.cashflowratios.cashflow_margin.value : '';
        currentParam.defaultvalue = defaultParam.ratios.cashflowratios.cashflow_margin.value;
        currentParam.tooltip = texts.benchmarks_tooltip;
        currentParam.parentObject = 'CashflowRatios';
        currentParam.readValue = function() {
            userParam.ratios.cashflowratios.cashflow_margin.value = this.value;
        }
        convertedParam.data.push(currentParam)

        // Cashflow asset Efficiency
        var currentParam = {};
        currentParam.name = 'cashflowassetefficiency';
        currentParam.group = 'benchmarks';
        currentParam.title = defaultParam.ratios.cashflowratios.cashflow_asset_efficiency.description;
        currentParam.type = 'string';
        currentParam.value = userParam.ratios.cashflowratios.cashflow_asset_efficiency.value ? userParam.ratios.cashflowratios.cashflow_asset_efficiency.value : '';
        currentParam.defaultvalue = defaultParam.ratios.cashflowratios.cashflow_asset_efficiency.value;
        currentParam.tooltip = texts.benchmarks_tooltip;
        currentParam.parentObject = 'CashflowRatios';
        currentParam.readValue = function() {
            userParam.ratios.cashflowratios.cashflow_asset_efficiency.value = this.value;
        }
        convertedParam.data.push(currentParam)

        // Cashflow current Liabilities
        var currentParam = {};
        currentParam.name = 'cashflowcurrentliabilities';
        currentParam.group = 'benchmarks';
        currentParam.title = defaultParam.ratios.cashflowratios.cashflow_current_liabilities.description;
        currentParam.type = 'string';
        currentParam.value = userParam.ratios.cashflowratios.cashflow_current_liabilities.value ? userParam.ratios.cashflowratios.cashflow_current_liabilities.value : '';
        currentParam.defaultvalue = defaultParam.ratios.cashflowratios.cashflow_current_liabilities.value;
        currentParam.tooltip = texts.benchmarks_tooltip;
        currentParam.parentObject = 'CashflowRatios';
        currentParam.readValue = function() {
            userParam.ratios.cashflowratios.cashflow_current_liabilities.value = this.value;
        }
        convertedParam.data.push(currentParam)

        // Cashflow Liabilities
        var currentParam = {};
        currentParam.name = 'cashflowliabilities';
        currentParam.group = 'benchmarks';
        currentParam.title = defaultParam.ratios.cashflowratios.cashflow_liabilities.description;
        currentParam.type = 'string';
        currentParam.value = userParam.ratios.cashflowratios.cashflow_liabilities.value ? userParam.ratios.cashflowratios.cashflow_liabilities.value : '';
        currentParam.defaultvalue = defaultParam.ratios.cashflowratios.cashflow_liabilities.value;
        currentParam.tooltip = texts.benchmarks_tooltip;
        currentParam.parentObject = 'CashflowRatios';
        currentParam.readValue = function() {
            userParam.ratios.cashflowratios.cashflow_liabilities.value = this.value;
        }
        convertedParam.data.push(currentParam)

        // Cashflow to Investments
        var currentParam = {};
        currentParam.name = 'cashflowtoinvestments';
        currentParam.group = 'benchmarks';
        currentParam.title = defaultParam.ratios.cashflowratios.cashflow_to_investments.description;
        currentParam.type = 'string';
        currentParam.value = userParam.ratios.cashflowratios.cashflow_to_investments.value ? userParam.ratios.cashflowratios.cashflow_to_investments.value : '';
        currentParam.defaultvalue = defaultParam.ratios.cashflowratios.cashflow_to_investments.value;
        currentParam.tooltip = texts.benchmarks_tooltip;
        currentParam.parentObject = 'CashflowRatios';
        currentParam.readValue = function() {
            userParam.ratios.cashflowratios.cashflow_to_investments.value = this.value;
        }
        convertedParam.data.push(currentParam)

        return convertedParam;
    }

    /**
     * This method returns the current date. If the current date is higher than the accounting closing date, the
     * accounting closing date is returned
     * @returns the date of the day in format: 'yyyymmdd'.
     */
    getCurrentDate() {
        let currentDate = "";
        let today = new Date();
        let closingDate = new Date(this.docInfo.EndPeriod);
        if (today && closingDate) {
            if (closingDate.getTime() < today.getTime()) {
                currentDate = this.getCurrentDate_Formatted(closingDate);
            } else {
                currentDate = this.getCurrentDate_Formatted(today);
            }
        }
        return currentDate;
    }

    getCurrentDate_Formatted(formattedDate) {
        let dd = String(formattedDate.getDate()).padStart(2, '0');
        let mm = String(formattedDate.getMonth() + 1).padStart(2, '0'); //January is 0!
        let yyyy = formattedDate.getFullYear();
        formattedDate = yyyy + mm + dd;
        return formattedDate;
    }

    /**
     * @description With the following method we calculate, starting from the base, the elements necessary for the creation of the dupont scheme, in particular:
     * instantiates a *Dupont= {}* object which will contain all the calculated indices.
     * retrieve the values of the calculated indices, parameters and data.
     * calculate the elements.
     * The type is for set the correct stile for the totals (nrm=normal, titl=title)
     * check that the values coincide with others previously calculated in other methods.
     * @Param {object} data: the data object created thanks to loadData methods, containing the values and the sums of the paramters recovered from the dialog.
     * @Param {object} calculated_data: the object returned by the CalculateData method containing the values of the calculated elements.
     * @Param {object} index: the object returned by the CalculateIndex method containing the values of the calculated indexes.
     * @returns an object containing the data for the dupont table
     */
    createdupont_data(data, calculated_data, index) {
        var texts = this.getFinancialAnalysisTexts();

        var Dupont = {};
        var totalassets = calculated_data.totalassets;
        var sales = data.profitandloss.salesturnover.balance;
        var ebt = calculated_data.ebt;
        var roi = index.red.roi.amount;

        /*EBT
         */
        Dupont.ebt = {};
        Dupont.ebt.description = texts.ebt;
        Dupont.ebt.style = "nrm";
        Dupont.ebt.type = "dec";
        Dupont.ebt.amount = ebt;

        //sales (ebt)
        Dupont.ebtmarginsales = {};
        Dupont.ebtmarginsales.description = texts.salesturnover;
        Dupont.ebtmarginsales.style = "nrm";
        Dupont.ebtmarginsales.type = "dec";
        Dupont.ebtmarginsales.amount = sales;

        //EBT MARGIN
        Dupont.ebtmargin = {};
        Dupont.ebtmargin.description = texts.ebtmargin;
        Dupont.ebtmargin.style = "titl";
        Dupont.ebtmargin.type = "perc";
        Dupont.ebtmargin.amount = Banana.SDecimal.divide(Dupont.ebt.amount, Dupont.ebtmarginsales.amount);
        Dupont.ebtmargin.amount = Banana.SDecimal.multiply(Dupont.ebtmargin.amount, 100, { 'decimals': this.dialogparam.numberofdecimals });

        //sales
        Dupont.assetturnoversales = {};
        Dupont.assetturnoversales.description = texts.salesturnover;
        Dupont.assetturnoversales.style = "nrm";
        Dupont.assetturnoversales.type = "dec";
        Dupont.assetturnoversales.amount = sales;

        //Total Asset
        Dupont.totalasset = {};
        Dupont.totalasset.description = texts.totalasset;
        Dupont.totalasset.style = "nrm";
        Dupont.totalasset.type = "dec";
        Dupont.totalasset.amount = totalassets;

        //Asset turnover
        Dupont.assetturnover = {};
        Dupont.assetturnover.description = texts.assetturnover;
        Dupont.assetturnover.style = "titl";
        Dupont.assetturnover.type = "dec";
        Dupont.assetturnover.amount = Banana.SDecimal.divide(Dupont.assetturnoversales.amount, totalassets, { 'decimals': this.dialogparam.numberofdecimals });

        //  ROI
        Dupont.roi = {};
        Dupont.roi.description = texts.roi;
        Dupont.roi.style = "titl";
        Dupont.roi.type = "perc";
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
            type = 'styleNormalAmount';
        }
        return type;

    }

    /**
     * @description this method calculate the altman Z- Score index.
     * @returns an object containing the Altman index elements
     */
    calculateAltmanZScoreIndex(data, calculatedData, retEarningsData) {

        /*Z-SCORE Altman standard formula = (1.2 x A) + (1.4 x B) + (3.3 x C) + (0.6 x D) + (0.999 x E)
         * A	Working capital / total assets
         * B	Retained earnings / total assets
         * C	Earnings before interest and task payment /total assets
         * D	Book Value of Equity / total liabilities
         * E	Total sales / total assets
         * Source: https://www.wallstreetmojo.com/altman-z-score/
         */

        let altmanIndexObj = {};
        let totalAssets = calculatedData.totalassets;
        let shortTermDebtCapital = calculatedData.shorttermdebtcapital;
        let totalLiabilities = calculatedData.debtcapital;
        let currentAssets = calculatedData.currentassets;
        let workingCapital = Banana.SDecimal.subtract(currentAssets, shortTermDebtCapital);
        let totalRetEarnings = retEarningsData.totalRetainedEarning.amount;
        let ebit = calculatedData.ebit;
        let bookValueOfEquity = Banana.SDecimal.subtract(totalAssets, totalLiabilities);
        let salesTurnover = data.profitandloss.salesturnover.balance;
        let finalScore = "";
        var texts = this.getFinancialAnalysisTexts();

        //Ponderazioni.
        let pondA = 1.2;
        let pondB = 1.4;
        let pondC = 3.3;
        let pondD = 0.6;
        let pondE = 0.999;
        let pondZScore = 1; //da aggiungere con stile bold centrato.

        //A
        altmanIndexObj.ratioA = {};
        altmanIndexObj.ratioA.text = {};
        altmanIndexObj.ratioA.text.descr = texts.altmanRatioADescription;
        altmanIndexObj.ratioA.text.style = "";
        altmanIndexObj.ratioA.formula = {};
        altmanIndexObj.ratioA.formula.descr = texts.altmanFormulaA;
        altmanIndexObj.ratioA.formula.style = "";
        altmanIndexObj.ratioA.weighting = {};
        altmanIndexObj.ratioA.weighting.descr = pondA.toString();
        altmanIndexObj.ratioA.weighting.style = "styleCentralText";
        altmanIndexObj.ratioA.amount = {};
        altmanIndexObj.ratioA.amount.value = Banana.SDecimal.multiply(Banana.SDecimal.divide(workingCapital, totalAssets), pondA, { 'decimals': this.dialogparam.numberofdecimals });
        altmanIndexObj.ratioA.amount.style = "styleNormalAmount";
        //B
        altmanIndexObj.ratioB = {};
        altmanIndexObj.ratioB.text = {};
        altmanIndexObj.ratioB.text.descr = texts.altmanRatioBDescription;
        altmanIndexObj.ratioB.text.style = "";
        altmanIndexObj.ratioB.formula = {};
        altmanIndexObj.ratioB.formula.descr = texts.altmanFormulaB;
        altmanIndexObj.ratioB.formula.style = "";
        altmanIndexObj.ratioB.weighting = {};
        altmanIndexObj.ratioB.weighting.descr = pondB.toString();
        altmanIndexObj.ratioB.weighting.style = "styleCentralText";
        altmanIndexObj.ratioB.amount = {};
        altmanIndexObj.ratioB.amount.value = Banana.SDecimal.multiply(Banana.SDecimal.divide(totalRetEarnings, totalAssets), pondB, { 'decimals': this.dialogparam.numberofdecimals });
        altmanIndexObj.ratioB.amount.style = "styleNormalAmount";
        //C
        altmanIndexObj.ratioC = {};
        altmanIndexObj.ratioC.text = {};
        altmanIndexObj.ratioC.text.descr = texts.altmanRatioCDescription;
        altmanIndexObj.ratioC.text.style = "";
        altmanIndexObj.ratioC.formula = {};
        altmanIndexObj.ratioC.formula.descr = texts.altmanFormulaC;
        altmanIndexObj.ratioC.formula.style = "";
        altmanIndexObj.ratioC.weighting = {};
        altmanIndexObj.ratioC.weighting.descr = pondC.toString();
        altmanIndexObj.ratioC.weighting.style = "styleCentralText";
        altmanIndexObj.ratioC.amount = {};
        altmanIndexObj.ratioC.amount.value = Banana.SDecimal.multiply(Banana.SDecimal.divide(ebit, totalAssets), pondC, { 'decimals': this.dialogparam.numberofdecimals });
        altmanIndexObj.ratioC.amount.style = "styleNormalAmount";
        //D
        altmanIndexObj.ratioD = {};
        altmanIndexObj.ratioD.text = {};
        altmanIndexObj.ratioD.text.descr = texts.altmanRatioDDescription;
        altmanIndexObj.ratioD.text.style = "";
        altmanIndexObj.ratioD.formula = {};
        altmanIndexObj.ratioD.formula.descr = texts.altmanFormulaD;
        altmanIndexObj.ratioD.formula.style = "";
        altmanIndexObj.ratioD.weighting = {};
        altmanIndexObj.ratioD.weighting.descr = pondD.toString();
        altmanIndexObj.ratioD.weighting.style = "styleCentralText";
        altmanIndexObj.ratioD.amount = {};
        altmanIndexObj.ratioD.amount.value = Banana.SDecimal.multiply(Banana.SDecimal.divide(bookValueOfEquity, totalLiabilities), pondD, { 'decimals': this.dialogparam.numberofdecimals });
        altmanIndexObj.ratioD.amount.style = "styleNormalAmount";

        //E
        altmanIndexObj.ratioE = {};
        altmanIndexObj.ratioE.text = {};
        altmanIndexObj.ratioE.text.descr = texts.altmanRatioEDescription;
        altmanIndexObj.ratioE.text.style = "";
        altmanIndexObj.ratioE.formula = {};
        altmanIndexObj.ratioE.formula.descr = texts.altmanFormulaE;
        altmanIndexObj.ratioE.formula.style = "";
        altmanIndexObj.ratioE.weighting = {};
        altmanIndexObj.ratioE.weighting.descr = pondE.toString();
        altmanIndexObj.ratioE.weighting.style = "styleCentralText";
        altmanIndexObj.ratioE.amount = {};
        altmanIndexObj.ratioE.amount.value = Banana.SDecimal.multiply(Banana.SDecimal.divide(salesTurnover, totalAssets), pondE, { 'decimals': this.dialogparam.numberofdecimals });
        altmanIndexObj.ratioE.amount.style = "styleNormalAmount";

        //Final Result
        if (altmanIndexObj) {
            for (var key in altmanIndexObj) {
                finalScore = Banana.SDecimal.add(altmanIndexObj[key].amount.value, finalScore, { 'decimals': this.dialogparam.numberofdecimals });
            }
        }
        altmanIndexObj.finalScore = {};
        altmanIndexObj.finalScore.text = {};
        altmanIndexObj.finalScore.text.descr = texts.altmanFinalZScore;
        altmanIndexObj.finalScore.text.style = "styleUnderGroupTitles";
        altmanIndexObj.finalScore.formula = {};
        altmanIndexObj.finalScore.formula.descr = texts.altmanZScoreFormula;
        altmanIndexObj.finalScore.formula.style = "styleUnderGroupTitles";
        altmanIndexObj.finalScore.weighting = {};
        altmanIndexObj.finalScore.weighting.descr = ""
        altmanIndexObj.finalScore.weighting.style = "";
        altmanIndexObj.finalScore.amount = {};
        altmanIndexObj.finalScore.amount.value = finalScore;
        altmanIndexObj.finalScore.amount.style = "styleMidTotalAmount";

        //Banana.Ui.showText(JSON.stringify(altmanIndexObj));


        return altmanIndexObj;

    }

    /**
     * @description this method calculate the altman Z- Score index for private Companies
     * @returns an object containing the Altman index elements
     */
    calculateAltmanZScoreIndexPC(data, calculatedData, retEarningsData) {

        /*Z-SCORE Altman standard formula = (0.717 x A) + (0.847 x B) + (3.107 x C) + (0.420 x D) + (0.998 x E)
         * A	( Current Assets − Current Liabilities )/Total Assets
         * B	Retained Earnings/Total Assets
         * C	Earnings Before Interest and Taxes/Total Assets
         * D	Book Value of Equity/Total Liabilities
         * E	Sales/Total Assets
         * Source: https://www.wallstreetmojo.com/altman-z-score/
         */

        let altmanIndexObj = {};
        let totalAssets = calculatedData.totalassets;
        let shortTermDebtCapital = calculatedData.shorttermdebtcapital;
        let totalLiabilities = calculatedData.debtcapital;
        let currentAssets = calculatedData.currentassets;
        let workingCapital = Banana.SDecimal.subtract(currentAssets, shortTermDebtCapital);
        let totalRetEarnings = retEarningsData.totalRetainedEarning.amount;
        let ebit = calculatedData.ebit;
        let bookValueOfEquity = Banana.SDecimal.subtract(totalAssets, totalLiabilities);
        let salesTurnover = data.profitandloss.salesturnover.balance;
        let finalScore = "";
        var texts = this.getFinancialAnalysisTexts();

        //Ponderazioni.
        let pondA = 0.717;
        let pondB = 0.847;
        let pondC = 3.107;
        let pondD = 0.420;
        let pondE = 0.998;
        let pondZScore = 1; //da aggiungere con stile bold centrato.

        //A
        altmanIndexObj.ratioA = {};
        altmanIndexObj.ratioA.text = {};
        altmanIndexObj.ratioA.text.descr = texts.altmanRatioADescriptionPC;
        altmanIndexObj.ratioA.text.style = "";
        altmanIndexObj.ratioA.formula = {};
        altmanIndexObj.ratioA.formula.descr = texts.altmanFormulaA;
        altmanIndexObj.ratioA.formula.style = "";
        altmanIndexObj.ratioA.weighting = {};
        altmanIndexObj.ratioA.weighting.descr = pondA.toString();
        altmanIndexObj.ratioA.weighting.style = "styleCentralText";
        altmanIndexObj.ratioA.amount = {};
        altmanIndexObj.ratioA.amount.value = Banana.SDecimal.multiply(Banana.SDecimal.divide(workingCapital, totalAssets), pondA, { 'decimals': this.dialogparam.numberofdecimals });
        altmanIndexObj.ratioA.amount.style = "styleNormalAmount";
        //B
        altmanIndexObj.ratioB = {};
        altmanIndexObj.ratioB.text = {};
        altmanIndexObj.ratioB.text.descr = texts.altmanRatioBDescription;
        altmanIndexObj.ratioB.text.style = "";
        altmanIndexObj.ratioB.formula = {};
        altmanIndexObj.ratioB.formula.descr = texts.altmanFormulaB;
        altmanIndexObj.ratioB.formula.style = "";
        altmanIndexObj.ratioB.weighting = {};
        altmanIndexObj.ratioB.weighting.descr = pondB.toString();
        altmanIndexObj.ratioB.weighting.style = "styleCentralText";
        altmanIndexObj.ratioB.amount = {};
        altmanIndexObj.ratioB.amount.value = Banana.SDecimal.multiply(Banana.SDecimal.divide(totalRetEarnings, totalAssets), pondB, { 'decimals': this.dialogparam.numberofdecimals });
        altmanIndexObj.ratioB.amount.style = "styleNormalAmount";
        //C
        altmanIndexObj.ratioC = {};
        altmanIndexObj.ratioC.text = {};
        altmanIndexObj.ratioC.text.descr = texts.altmanRatioCDescription;
        altmanIndexObj.ratioC.text.style = "";
        altmanIndexObj.ratioC.formula = {};
        altmanIndexObj.ratioC.formula.descr = texts.altmanFormulaC;
        altmanIndexObj.ratioC.formula.style = "";
        altmanIndexObj.ratioC.weighting = {};
        altmanIndexObj.ratioC.weighting.descr = pondC.toString();
        altmanIndexObj.ratioC.weighting.style = "styleCentralText";
        altmanIndexObj.ratioC.amount = {};
        altmanIndexObj.ratioC.amount.value = Banana.SDecimal.multiply(Banana.SDecimal.divide(ebit, totalAssets), pondC, { 'decimals': this.dialogparam.numberofdecimals });
        altmanIndexObj.ratioC.amount.style = "styleNormalAmount";
        //D
        altmanIndexObj.ratioD = {};
        altmanIndexObj.ratioD.text = {};
        altmanIndexObj.ratioD.text.descr = texts.altmanRatioDDescriptionPC;
        altmanIndexObj.ratioD.text.style = "";
        altmanIndexObj.ratioD.formula = {};
        altmanIndexObj.ratioD.formula.descr = texts.altmanFormulaD;
        altmanIndexObj.ratioD.formula.style = "";
        altmanIndexObj.ratioD.weighting = {};
        altmanIndexObj.ratioD.weighting.descr = pondD.toString();
        altmanIndexObj.ratioD.weighting.style = "styleCentralText";
        altmanIndexObj.ratioD.amount = {};
        altmanIndexObj.ratioD.amount.value = Banana.SDecimal.multiply(Banana.SDecimal.divide(bookValueOfEquity, totalLiabilities), pondD, { 'decimals': this.dialogparam.numberofdecimals });
        altmanIndexObj.ratioD.amount.style = "styleNormalAmount";

        //E
        altmanIndexObj.ratioE = {};
        altmanIndexObj.ratioE.text = {};
        altmanIndexObj.ratioE.text.descr = texts.altmanRatioEDescription;
        altmanIndexObj.ratioE.text.style = "";
        altmanIndexObj.ratioE.formula = {};
        altmanIndexObj.ratioE.formula.descr = texts.altmanFormulaE;
        altmanIndexObj.ratioE.formula.style = "";
        altmanIndexObj.ratioE.weighting = {};
        altmanIndexObj.ratioE.weighting.descr = pondE.toString();
        altmanIndexObj.ratioE.weighting.style = "styleCentralText";
        altmanIndexObj.ratioE.amount = {};
        altmanIndexObj.ratioE.amount.value = Banana.SDecimal.multiply(Banana.SDecimal.divide(salesTurnover, totalAssets), pondE, { 'decimals': this.dialogparam.numberofdecimals });
        altmanIndexObj.ratioE.amount.style = "styleNormalAmount";

        //Final Result
        if (altmanIndexObj) {
            for (var key in altmanIndexObj) {
                finalScore = Banana.SDecimal.add(altmanIndexObj[key].amount.value, finalScore, { 'decimals': this.dialogparam.numberofdecimals });
            }
        }
        altmanIndexObj.finalScore = {};
        altmanIndexObj.finalScore.text = {};
        altmanIndexObj.finalScore.text.descr = texts.altmanFinalZScore;
        altmanIndexObj.finalScore.text.style = "styleUnderGroupTitles";
        altmanIndexObj.finalScore.formula = {};
        altmanIndexObj.finalScore.formula.descr = texts.altmanZScoreFormulaPC;
        altmanIndexObj.finalScore.formula.style = "styleUnderGroupTitles";
        altmanIndexObj.finalScore.weighting = {};
        altmanIndexObj.finalScore.weighting.descr = ""
        altmanIndexObj.finalScore.weighting.style = "";
        altmanIndexObj.finalScore.amount = {};
        altmanIndexObj.finalScore.amount.value = finalScore;
        altmanIndexObj.finalScore.amount.style = "styleMidTotalAmount";

        //Banana.Ui.showText(JSON.stringify(altmanIndexObj));


        return altmanIndexObj;
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
        documentInfo.headerLeft = "";
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
        documentInfo.City = "";


        if (this.banDocument) {
            var fileGroup = this.banDocument.info("Base", "FileTypeGroup");
            var fileNumber = this.banDocument.info("Base", "FileTypeNumber");

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
            if (this.banDocument.info("Base", "HeaderLeft"))
                documentInfo.headerLeft =
                this.banDocument.info("Base", "HeaderLeft");

            if (this.banDocument.info("AccountingDataBase", "ClosureDate"))
                documentInfo.EndPeriod =
                this.banDocument.info("AccountingDataBase", "ClosureDate")

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

            if (this.banDocument.info("AccountingDataBase", "City"))
                documentInfo.City =
                this.banDocument.info("AccountingDataBase", "City");
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
            value = "0";
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
     * @description checks the software version, only works with the latest version: 10.0.7, if the version is not the latest
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

        if (!CURR_VERSION) {
            var msg = this.getErrorMessage(this.ID_ERR_VERSION_NOTSUPPORTED, lang);
            msg = msg.replace("%1", BAN_VERSION_MIN);
            this.banDocument.addMessage(msg, this.ID_ERR_VERSION_NOTSUPPORTED);
            return false;
        }
        /*if (!Banana.application.isExperimental) {
            var msg = this.getErrorMessage(this.ID_ERR_EXPERIMENTAL_REQUIRED, lang);
            this.banDocument.addMessage(msg, this.ID_ERR_EXPERIMENTAL_REQUIRED);
            return false;
        }*/
        if (!CURR_LICENSE) {
            var msg = this.getErrorMessage(this.ID_ERR_LICENSE_NOTVALID, lang);
            this.banDocument.addMessage(msg, this.ID_ERR_LICENSE_NOTVALID);
            return false;
        }
        return true;
    }

    /**
     * @description Verify the User Params
     * @Param {object} dialogparam: an object containing the parameters recovered from the dialog setting
     */
    verifyParam() {

        var defaultParam = this.initDialogParam();
        var userParam = this.dialogparam;

        //Verify the reference date
        if (!userParam.currentdate)
            userParam.currentdate = defaultParam.currentdate;

        //Verify if the User param 'number of previous years entered' is valid, otherwise I reset it to the maximum number or zero if is NAN or >0
        if (userParam.maxpreviousyears > 3)
            userParam.maxpreviousyears = 3;
        if (isNaN(userParam.maxpreviousyears) || userParam.maxpreviousyears < 0) {
            userParam.maxpreviousyears = 0;
        }
        //Verify if the User param 'number of decimals' is valid, otherwise I reset it to the maximum number
        if (userParam.numberofdecimals > 2)
            userParam.numberofdecimals = 2;

        /******************************************************************************************************************
         * Verify the user parameters of the settings dialog, if a parameter does not exist, is set with the default value.
         *******************************************************************************************************************/
        //Balance
        //first level
        if (!userParam.balance) {
            userParam.balance = defaultParam.balance;
        }
        //second level
        if (!userParam.balance.ca) {
            userParam.balance.ca = defaultParam.balance.ca;
        }
        if (!userParam.balance.fa) {
            userParam.balance.fa = defaultParam.balance.fa;
        }
        if (!userParam.balance.stdc) {
            userParam.balance.stdc = defaultParam.balance.stdc;
        }
        if (!userParam.balance.ltdc) {
            userParam.balance.ltdc = defaultParam.balance.ltdc;
        }
        if (!userParam.balance.oc) {
            userParam.balance.oc = defaultParam.balance.oc;
        }
        //third level
        if (!userParam.balance.ca.liquidity) {
            userParam.balance.ca.liquidity = defaultParam.balance.ca.liquidity;
        }
        if (!userParam.balance.ca.credits) {
            userParam.balance.ca.credits = defaultParam.balance.ca.credits;
        }
        if (!userParam.balance.ca.stocks) {
            userParam.balance.ca.stocks = defaultParam.balance.ca.stocks;
        }
        if (!userParam.balance.ca.prepaid_expenses) {
            userParam.balance.ca.prepaid_expenses = defaultParam.balance.ca.prepaid_expenses;
        }
        if (!userParam.balance.fa.financial_fixedassets) {
            userParam.balance.fa.financial_fixedassets = defaultParam.balance.fa.financial_fixedassets;
        }
        if (!userParam.balance.fa.tangible_fixedassets) {
            userParam.balance.fa.tangible_fixedassets = defaultParam.balance.fa.tangible_fixedassets;
        }
        if (!userParam.balance.fa.intangible_fixedassets) {
            userParam.balance.fa.intangible_fixedassets = defaultParam.balance.fa.intangible_fixedassets;
        }
        if (!userParam.balance.stdc.debts) {
            userParam.balance.stdc.debts = defaultParam.balance.stdc.debts;
        }
        if (!userParam.balance.stdc.accruals_and_deferred_income) {
            userParam.balance.stdc.accruals_and_deferred_income = defaultParam.balance.stdc.accruals_and_deferred_income;
        }
        if (!userParam.balance.ltdc.longter_debts) {
            userParam.balance.ltdc.longter_debts = defaultParam.balance.ltdc.longter_debts;
        }
        if (!userParam.balance.ltdc.provisionsandsimilar) {
            userParam.balance.ltdc.provisionsandsimilar = defaultParam.balance.ltdc.provisionsandsimilar;
        }
        if (!userParam.balance.oc.ownbasecapital) {
            userParam.balance.oc.ownbasecapital = userParam.balance.oc.ownbasecapital;
        }
        if (!userParam.balance.oc.reserves) {
            userParam.balance.oc.reserves = defaultParam.balance.oc.reserves;
        }
        if (!userParam.balance.oc.balanceProfits) {
            userParam.balance.oc.balanceProfits = defaultParam.balance.oc.balanceProfits;
        }

        //Profit and loss
        if (!userParam.profitandloss) {
            userParam.profitandloss = defaultParam.profitandloss;
        }
        if (!userParam.profitandloss.salesturnover) {
            userParam.profitandloss.salesturnovers = defaultParam.profitandloss.salesturnovers;
        }
        if (!userParam.profitandloss.costofmerchandservices) {
            userParam.profitandloss.costofmerchandservices = defaultParam.profitandloss.costofmerchandservices;
        }
        if (!userParam.profitandloss.personnelcosts) {
            userParam.profitandloss.personnelcosts = userParam.profitandloss.personnelcosts;
        }
        if (!userParam.profitandloss.differentcosts) {
            userParam.profitandloss.differentcosts = userParam.profitandloss.differentcosts;
        }
        if (!userParam.profitandloss.depreandadjust) {
            userParam.profitandloss.depreandadjust = defaultParam.profitandloss.depreandadjust;
        }
        if (!userParam.profitandloss.interests) {
            userParam.profitandloss.interests = defaultParam.profitandloss.interests;
        }
        if (!userParam.profitandloss.directtaxes) {
            userParam.profitandloss.directtaxes = defaultParam.profitandloss.directtaxes;
        }

        //final result
        if (!userParam.finalresult) {
            userParam.finalresult = defaultParam.finalresult;
        }
        //ratios benchmark
        if (!userParam.ratios) {
            userParam.ratios = defaultParam.ratios;
        }
        //liquidity
        if (!userParam.ratios.liquidityratios) {
            userParam.ratios.liquidityratios = defaultParam.ratios.liquidityratios;
        }
        //leverage
        if (!userParam.ratios.leverageratios) {
            userParam.ratios.leverageratios = defaultParam.ratios.leverageratios;
        }
        //profitability
        if (!userParam.ratios.profitabilityratios) {
            userParam.ratios.profitabilityratios = defaultParam.ratios.profitabilityratios;
        }
        //efficiency
        if (!userParam.ratios.efficiencyratios) {
            userParam.ratios.efficiencyratios = defaultParam.ratios.efficiencyratios;
        }
        //efficiency
        if (!userParam.ratios.cashflowratios) {
            userParam.ratios.cashflowratios = defaultParam.ratios.cashflowratios;
        }
        //liquidity
        if (!userParam.ratios.liquidityratios.cashratio) {
            userParam.ratios.liquidityratios.cashratio = defaultParam.ratios.liquidityratios.cashratio;
        }
        if (!userParam.ratios.liquidityratios.quickratio) {
            userParam.ratios.liquidityratios.quickratio = defaultParam.ratios.liquidityratios.quickratio;
        }
        if (!userParam.ratios.liquidityratios.currentratio) {
            userParam.ratios.liquidityratios.currentratio = defaultParam.ratios.liquidityratios.currentratio;
        }
        if (!userParam.ratios.liquidityratios.netcurrentasset) {
            userParam.ratios.liquidityratios.netcurrentasset = defaultParam.ratios.liquidityratios.netcurrentasset;
        }
        //leverage
        if (!userParam.ratios.leverageratios.degreecirculatingasset) {
            userParam.ratios.leverageratios.degreecirculatingasset = defaultParam.ratios.leverageratios.degreecirculatingasset;
        }
        if (!userParam.ratios.leverageratios.percentagefixedasset) {
            userParam.ratios.leverageratios.percentagefixedasset = defaultParam.ratios.leverageratios.percentagefixedasset;
        }
        if (!userParam.ratios.leverageratios.debtratio) {
            userParam.ratios.leverageratios.debtratio = defaultParam.ratios.leverageratios.debtratio;
        }
        if (!userParam.ratios.leverageratios.equityratio) {
            userParam.ratios.leverageratios.equityratio = defaultParam.ratios.leverageratios.equityratio;
        }
        if (!userParam.ratios.leverageratios.selfinancingratio) {
            userParam.ratios.leverageratios.selfinancingratio = defaultParam.ratios.leverageratios.selfinancingratio;
        }
        if (!userParam.ratios.leverageratios.fixedassetcoverage) {
            userParam.ratios.leverageratios.fixedassetcoverage = defaultParam.ratios.leverageratios.fixedassetcoverage;
        }

        //profitability
        if (!userParam.ratios.profitabilityratios.profroe) {
            userParam.ratios.profitabilityratios.profroe = defaultParam.ratios.profitabilityratios.profroe;
        }
        if (!userParam.ratios.profitabilityratios.profroi) {
            userParam.ratios.profitabilityratios.profroi = defaultParam.ratios.profitabilityratios.profroi;
        }
        if (!userParam.ratios.profitabilityratios.profros) {
            userParam.ratios.profitabilityratios.profros = defaultParam.ratios.profitabilityratios.profros;
        }
        if (!userParam.ratios.profitabilityratios.profmol) {
            userParam.ratios.profitabilityratios.profmol = defaultParam.ratios.profitabilityratios.profmol;
        }
        if (!userParam.ratios.profitabilityratios.profebm) {
            userParam.ratios.profitabilityratios.profebm = defaultParam.ratios.profitabilityratios.profebm;
        }
        if (!userParam.ratios.profitabilityratios.profmon) {
            userParam.ratios.profitabilityratios.profmon = defaultParam.ratios.profitabilityratios.profmon;
        }
        //Efficiency
        if (!userParam.ratios.efficiencyratios.addedvalueperemployee) {
            userParam.ratios.efficiencyratios.addedvalueperemployee = defaultParam.ratios.efficiencyratios.addedvalueperemployee;
        }
        if (!userParam.ratios.efficiencyratios.revenueperemployee) {
            userParam.ratios.efficiencyratios.revenueperemployee = defaultParam.ratios.efficiencyratios.revenueperemployee;
        }
        if (!userParam.ratios.efficiencyratios.personnelcostperemployee) {
            userParam.ratios.efficiencyratios.personnelcostperemployee = defaultParam.ratios.efficiencyratios.personnelcostperemployee;
        }
        //Cashflow
        if (!userParam.ratios.cashflowratios.cashflow_margin) {
            userParam.ratios.cashflowratios.cashflow_margin = defaultParam.ratios.efficiencyratios.cashflow_margin;
        }
        if (!userParam.ratios.cashflowratios.cashflow_asset_efficiency) {
            userParam.ratios.cashflowratios.cashflow_asset_efficiency = defaultParam.ratios.efficiencyratios.cashflow_asset_efficiency;
        }
        if (!userParam.ratios.cashflowratios.cashflow_current_liabilities) {
            userParam.ratios.cashflowratios.cashflow_current_liabilities = defaultParam.ratios.efficiencyratios.cashflow_current_liabilities;
        }
        if (!userParam.ratios.cashflowratios.cashflow_liabilities) {
            userParam.ratios.cashflowratios.cashflow_liabilities = defaultParam.ratios.efficiencyratios.cashflow_liabilities;
        }
        if (!userParam.ratios.cashflowratios.cashflow_to_investments) {
            userParam.ratios.cashflowratios.cashflow_to_investments = defaultParam.ratios.efficiencyratios.cashflow_to_investments;
        }

        //if the version is not the same, apply the changes
        if (userParam.version !== defaultParam.version) {
            /*before last update 29.04.2022
                delete reservesandprofit old object, as is replaced with the 2 new fields with the standard group.
                if the user use personalized groups need to replace the standard group with his own groups.
            */
            if (userParam.version === "v1.2") {
                if (userParam.balance.oc.reservesandprofits)
                    delete userParam.balance.oc.reservesandprofits;
                //update the version
                userParam.version = defaultParam.version;
            } //else (older versions)
            else {
                this.dialogparam = defaultParam;
            }

        }

        return true;
    }

    /**
     * This method check if the parameters are presents in the chart of accounts of the document.
     * We cotrol only the balance and profit and loss groups, identified by the "".group" parameter.
     * If an element is not a valid account or a valid group, is inserted within a string, every element is divided by a semicolon;
     * If a Field has at least one missing element, for this section is set an error EMssage (.errorMsg)
     * for every missing element, a counter is increased, if the counter is greater than 0, so the method return false.
     * This method is called by the validateParams() function.
     * @Param {*} convertedParam : the parameters in the setting dialog
     */
    checkNonExistentGroupsOrAccounts(convertedParam) {
        var Docgroups = this.fileGroups;
        let texts = this.getFinancialAnalysisTexts()
        var Docaccounts = this.fileAccounts;
        var nonExistentElements = "";
        var everyGroupExist = true;
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
                        convertedParam.data[i].errorMsg = texts.errorMsg + nonExistentElements;
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
    //Banana.Ui.showText(JSON.stringify(params));
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
    var styleSheet = financialStatementAnalysis.getReportStyle();
    financialStatementAnalysis.loadData();
    var report = financialStatementAnalysis.printReport(styleSheet);
    Banana.Report.preview(report, styleSheet);

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
        var parsed_data = JSON.parse(savedParam);
        if (parsed_data) {
            financialStatementAnalysis.setParam(parsed_data);
        }
    }

    //settings dialog
    var dialogTitle = 'Settings';
    var pageAnchor = 'financialStatementAnalysis';
    var convertedParam = financialStatementAnalysis.convertParam();
    let settingsDialog = Banana.Ui.createPropertyEditor(dialogTitle, convertedParam, pageAnchor);
    //settingsDialog.addImportCommand(); //non importa correttamente a causa del problema con l'id, lo disabilitiamo attualmente.
    if (!settingsDialog.exec())
        return false;
    for (var i = 0; i < convertedParam.data.length; i++) {
        // Read values to dialogparam (through the readValue function)
        if (typeof(convertedParam.data[i].readValue) == "function")
            convertedParam.data[i].readValue();
    }

    //set the parameters
    var paramToString = JSON.stringify(financialStatementAnalysis.dialogparam);
    Banana.document.setScriptSettings("financialStatementAnalysis", paramToString);
    return true;
}