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
// @pubdate = 2021-04-20
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
        this.controlsums_differences = 0;
        this.cashflow_differences = 0;
        this.with_budget = this.banDocument.info("Budget", "TableNameXml");

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
        var texts = this.initFinancialAnalysisTexts();
        var tableBalance = report.addTable('myTableBalance');
        tableBalance.getCaption().addText(texts.upperbalance, "styleTitles");
        //columns
        tableBalance.addColumn("Description").setStyleAttributes("width:30%");
        if (this.dialogparam.acronymcolumn) {
            tableBalance.addColumn("formula").setStyleAttributes("width:10%");
        }
        this.setRatiosColumnsWidthDinamically(tableBalance);
        // header
        var tableHeader = tableBalance.getHeader();
        var tableRow = tableHeader.addRow();
        tableRow.addCell(texts.description, "styleTablesHeaderText");
        if (this.dialogparam.acronymcolumn) {
            tableRow.addCell(texts.acronym, "styleTablesHeaderText");
        }
        this.generateHeaderColumns(tableRow);
        return tableBalance;
    }

    printReportAdd_TableConCe(report) {
        var texts = this.initFinancialAnalysisTexts();
        var tableConCe = report.addTable('myConTableCe');
        tableConCe.getCaption().addText(texts.upperprofitandloss, "styleTitles");
        //columns
        tableConCe.addColumn("Description").setStyleAttributes("width:30%");
        if (this.dialogparam.acronymcolumn) {
            tableConCe.addColumn("formula").setStyleAttributes("width:10%");
        }
        this.setRatiosColumnsWidthDinamically(tableConCe);
        //header
        var tableHeader = tableConCe.getHeader();
        var tableRow = tableHeader.addRow();
        tableRow.addCell(texts.description, "styleTablesHeaderText");
        if (this.dialogparam.acronymcolumn) {
            tableRow.addCell(texts.acronym, "styleTablesHeaderText");
        }
        this.generateHeaderColumns(tableRow);
        return tableConCe;
    }

    printReportAdd_TableControlSums(report) {
        var texts = this.initFinancialAnalysisTexts();
        var tableBalanceSumsControl = report.addTable('myTableBalanceSumsControl');
        tableBalanceSumsControl.getCaption().addText(texts.controlsums, "styleTitles");
        // header
        var tableHeader = tableBalanceSumsControl.getHeader();
        var tableRow = tableHeader.addRow();
        tableRow.addCell(texts.year, "styleTablesHeaderText");
        tableRow.addCell(texts.accountingtotal, "styleTablesHeaderText");
        tableRow.addCell(texts.calculatedtotal, "styleTablesHeaderText");
        tableRow.addCell(texts.difference, "styleTablesHeaderText");
        return tableBalanceSumsControl;
    }

    printReportAdd_TableIndliq(report) {
        var texts = this.initFinancialAnalysisTexts();
        var tableIndliq = report.addTable('myIndliqTable');
        tableIndliq.getCaption().addText(texts.upperliquidityratios, "styleTitles");
        tableIndliq.addColumn("Description").setStyleAttributes("width:25%");
        tableIndliq.addColumn("formula").setStyleAttributes("width:15%");
        if (this.dialogparam.formulascolumn) {
            tableIndliq.addColumn("benchmark").setStyleAttributes("width:10%");
        }
        this.setRatiosColumnsWidthDinamically(tableIndliq);
        // header
        var tableHeader = tableIndliq.getHeader();
        var tableRow = tableHeader.addRow();
        tableRow.addCell(texts.description, "styleTablesHeaderText");
        if (this.dialogparam.formulascolumn) {
            tableRow.addCell(texts.formula, "styleTablesHeaderText");
        }
        tableRow.addCell(texts.benchmark, "styleTablesHeaderText");
        this.generateHeaderColumns(tableRow);
        return tableIndliq;
    }
    printReportAdd_TableIndlev(report) {
        var texts = this.initFinancialAnalysisTexts();
        var tableIndlev = report.addTable('myIndlevTable');
        tableIndlev.setStyleAttributes("width:100%");
        tableIndlev.getCaption().addText(texts.upperleverageratios, "styleTitles");
        tableIndlev.addColumn("Description").setStyleAttributes("width:25%");
        tableIndlev.addColumn("formula").setStyleAttributes("width:15%");
        if (this.dialogparam.formulascolumn) {
            tableIndlev.addColumn("benchmark").setStyleAttributes("width:10%");
        }
        this.setRatiosColumnsWidthDinamically(tableIndlev);
        // header
        var tableHeader = tableIndlev.getHeader();
        var tableRow = tableHeader.addRow();
        tableRow.addCell(texts.description, "styleTablesHeaderText");
        if (this.dialogparam.formulascolumn) {
            tableRow.addCell(texts.formula, "styleTablesHeaderText");
        }
        tableRow.addCell(texts.benchmark, "styleTablesHeaderText");
        this.generateHeaderColumns(tableRow);
        return tableIndlev;
    }
    printReportAdd_TableIndprof(report) {
        var texts = this.initFinancialAnalysisTexts();
        var tableIndprof = report.addTable('myIndprofTable');
        tableIndprof.setStyleAttributes("width:100%");
        tableIndprof.getCaption().addText(texts.upperprofitabilityratios, "styleTitles");
        tableIndprof.addColumn("Description").setStyleAttributes("width:25%");
        tableIndprof.addColumn("formula").setStyleAttributes("width:15%");
        if (this.dialogparam.formulascolumn) {
            tableIndprof.addColumn("benchmark").setStyleAttributes("width:10%");
        }
        this.setRatiosColumnsWidthDinamically(tableIndprof);
        // header
        var tableHeader = tableIndprof.getHeader();
        var tableRow = tableHeader.addRow();
        tableRow.addCell(texts.description, "styleTablesHeaderText");
        if (this.dialogparam.formulascolumn) {
            tableRow.addCell(texts.formula, "styleTablesHeaderText");
        }
        tableRow.addCell(texts.benchmark, "styleTablesHeaderText");
        this.generateHeaderColumns(tableRow);
        return tableIndprof;
    }

    printReportAdd_TableIndeff(report) {
        var texts = this.initFinancialAnalysisTexts();
        var tableIndeff = report.addTable('myIndeffTable');
        tableIndeff.setStyleAttributes("width:100%");
        tableIndeff.getCaption().addText(texts.upperefficiancyratios, "styleTitles");
        tableIndeff.addColumn("Description").setStyleAttributes("width:25%");
        tableIndeff.addColumn("formula").setStyleAttributes("width:15%");
        if (this.dialogparam.formulascolumn) {
            tableIndeff.addColumn("benchmark").setStyleAttributes("width:10%");
        }
        this.setRatiosColumnsWidthDinamically(tableIndeff);
        // header
        var tableHeader = tableIndeff.getHeader();
        var tableRow = tableHeader.addRow();
        tableRow.addCell(texts.description, "styleTablesHeaderText");
        if (this.dialogparam.formulascolumn) {
            tableRow.addCell(texts.formula, "styleTablesHeaderText");
        }
        tableRow.addCell(texts.benchmark, "styleTablesHeaderText");
        this.generateHeaderColumns(tableRow);
        return tableIndeff;
    }

    printReportAdd_TableCashflow(report) {
        var texts = this.initFinancialAnalysisTexts();
        var tableCashflow = report.addTable('myTableCashflow');
        tableCashflow.getCaption().addText(texts.uppercashflow, "styleTitles");
        //columns
        tableCashflow.addColumn("Description").setStyleAttributes("width:50%");
        this.setRatiosColumnsWidthDinamically(tableCashflow);
        // header
        var tableHeader = tableCashflow.getHeader();
        var tableRow = tableHeader.addRow();
        tableRow.addCell(texts.description, "styleTablesHeaderText");
        this.generateHeaderColumns(tableRow);
        return tableCashflow;
    }

    printReportAdd_TableIndCashflow(report) {
        var texts = this.initFinancialAnalysisTexts();
        var tableIndCashflow = report.addTable('myIndCashflowTable');
        tableIndCashflow.setStyleAttributes("width:100%");
        tableIndCashflow.getCaption().addText(texts.uppercashflowratios, "styleTitles");
        tableIndCashflow.addColumn("Description").setStyleAttributes("width:25%");
        tableIndCashflow.addColumn("formula").setStyleAttributes("width:15%");
        if (this.dialogparam.formulascolumn) {
            tableIndCashflow.addColumn("benchmark").setStyleAttributes("width:10%");
        }
        this.setRatiosColumnsWidthDinamically(tableIndCashflow);
        // header
        var tableHeader = tableIndCashflow.getHeader();
        var tableRow = tableHeader.addRow();
        tableRow.addCell(texts.description, "styleTablesHeaderText");
        if (this.dialogparam.formulascolumn) {
            tableRow.addCell(texts.formula, "styleTablesHeaderText");
        }
        tableRow.addCell(texts.benchmark, "styleTablesHeaderText");
        this.generateHeaderColumns(tableRow);
        return tableIndCashflow;
    }

    printReportAdd_TableDupont(report) {
        var texts = this.initFinancialAnalysisTexts();
        var tableDupont = report.addTable('myDupontTable');
        tableDupont.getCaption().addText(texts.upperdupontscheme, "styleTitles");
        tableDupont.addColumn("Description").setStyleAttributes("width:25%");
        this.setRatiosColumnsWidthDinamically(tableDupont);
        //header
        var tableHeader = tableDupont.getHeader();
        var tableRow = tableHeader.addRow();
        tableRow.addCell(texts.description, "styleTablesHeaderText");
        this.generateHeaderColumns(tableRow);
        return tableDupont;
    }

    printtableAltmanIndex(report) {
        var texts = this.initFinancialAnalysisTexts();
        var tableAltmanIndex = report.addTable('myTableAltmanIndex');
        tableAltmanIndex.getCaption().addText(texts.upperaltmanindex, "styleTitles");
        this.setRatiosColumnsWidthDinamically(tableAltmanIndex);
        // header
        var tableHeader = tableAltmanIndex.getHeader();
        var tableRow = tableHeader.addRow();
        this.generateHeaderColumns(tableRow);
        return tableAltmanIndex;

    }

    generateHeaderColumns(tableRow) {
        for (var i = this.data.length - 1; i >= 0; i--) {
            var year = this.data[i].period.EndDate;
            var elementType = this.data[i].period.Type;
            if (elementType === "Y") {
                year = year.substr(0, 4);
            }
            tableRow.addCell(year, "styleTablesHeaderText");
        }
    }
    setRatiosColumnsWidthDinamically(table) {
        var width = 60;
        if (this.data.length > 0)
            width = width / parseInt(this.data.length);
        for (var i = 0; i < this.data.length; i++) {
            table.addColumn("year").setStyleAttributes("width:" + width.toString() + "%");
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
        return;
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
        let span = 0;
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
    addHeader(report) {
        var stylesheet = this.getReportStyle();
        var headerParagraph = report.getHeader().addSection();
        if (this.dialogparam.printlogo) {
            var headerParagraph = report.addSection("");
            var logoFormat = Banana.Report.logoFormat(this.dialogparam.logoname); //Logo
            if (logoFormat) {
                var logoElement = logoFormat.createDocNode(headerParagraph, stylesheet, "logo");
                report.getHeader().addChild(logoElement);
            } else {
                headerParagraph.addClass("header_text");
            }

        } else {
            headerParagraph.addClass("header_text");
        }
        if (this.dialogparam.pageheader) {
            //var texts = this.initFinancialAnalysisTexts();
            var analsysisYears = this.data.length;
            analsysisYears -= 1;
            var docInfo = this.getDocumentInfo();
            var company = docInfo.company;
            var address1 = docInfo.address1;
            var city = docInfo.City;
            //headerParagraph.addParagraph(texts.financialstatementanalysis, "header_rows");
            headerParagraph.addParagraph(company, "header_row_company_name");
            headerParagraph.addParagraph(address1, "header_row_address");
            headerParagraph.addParagraph(city, "header_row_address");
        }
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
    printReport() {

        //Banana.console.debug(JSON.stringify(this.data));

        /******************************************************************************************
         * initialize the variables i will use frequently in this method
         * ***************************************************************************************/

        var texts = this.initFinancialAnalysisTexts();
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
        var warning_msg = this.showDifferencesWarning();
        var span = this.generateSpanForBalanceTitles();

        if (!this.data || this.data.length <= 0) {
            return report;
        }


        this.addHeader(report);
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
        tableRow.addCell(texts.assets, "styleAssetsAdjustments", span);

        /******************************************************************************************
         * Add the current asset to the  balance table
         * ***************************************************************************************/
        for (var key in this.data[0].balance.ca) {
            var tableRow = tableBalance.addRow("styleTablRows");

            description = this.data[0].balance.ca[key].description;
            if (texts[key])
                description = texts[key];
            //Banana.console.debug(JSON.stringify(this.data[0]balance.ca[key].description));
            acronym = this.data[0].balance.ca[key].acronym;

            tableRow.addCell(description);
            if (this.dialogparam.acronymcolumn) {
                tableRow.addCell(acronym);
            }
            for (var i = this.data.length - 1; i >= 0; i--) {
                amount = this.toLocaleAmountFormat(this.data[i].balance.ca[key].balance);
                tableRow.addCell(amount, "styleNormalAmount");
            }
        }
        tableRow = tableBalance.addRow("styleTablRows");
        tableRow.addCell(texts.totalcurrentasset, 'styleUnderGroupTitles');
        if (this.dialogparam.acronymcolumn) {
            tableRow.addCell(texts.currentassets_acronym);
        }
        for (var i = this.data.length - 1; i >= 0; i--) {
            tableRow.addCell(this.toLocaleAmountFormat(this.data[i].calculated_data.currentassets), "styleMidTotalAmount");
        }

        /******************************************************************************************
         * Add the fixed asset to the  balance table
         * ***************************************************************************************/
        for (var key in this.data[0].balance.fa) {
            var tableRow = tableBalance.addRow("styleTablRows");

            description = this.data[0].balance.fa[key].description;
            if (texts[key])
                description = texts[key];
            acronym = this.data[0].balance.fa[key].acronym;

            tableRow.addCell(description);
            if (this.dialogparam.acronymcolumn) {
                tableRow.addCell(acronym);
            }
            for (var i = this.data.length - 1; i >= 0; i--) {
                amount = this.toLocaleAmountFormat(this.data[i].balance.fa[key].balance);
                tableRow.addCell(amount, "styleNormalAmount");
            }
        }
        //add the total of fixed assets
        tableRow = tableBalance.addRow("styleTablRows");
        tableRow.addCell(texts.totalfixedasset, 'styleUnderGroupTitles');
        if (this.dialogparam.acronymcolumn) {
            tableRow.addCell(texts.fixedassets_acronym);
        }
        for (var i = this.data.length - 1; i >= 0; i--) {
            tableRow.addCell(this.toLocaleAmountFormat(this.data[i].calculated_data.fixedassets), "styleMidTotalAmount");
        }

        /******************************************************************************************
         * Add the total asset to the balance table
         * ***************************************************************************************/
        var tableRow = tableBalance.addRow("styleTablRows");
        tableRow.addCell(texts.totalasset, 'styleTitlesTotalAmount');
        if (this.dialogparam.acronymcolumn) {
            tableRow.addCell(texts.totassets_acronym);
        }
        for (var i = this.data.length - 1; i >= 0; i--) {
            tableRow.addCell(this.toLocaleAmountFormat(this.data[i].calculated_data.totalassets), "styleTotalAmount");
        }

        //Liabilities and Equity title
        var tableRow = tableBalance.addRow("styleTablRows");
        tableRow.addCell(texts.liabilitiesandequity, "styleLiabilitiesAdjustments", span);

        /******************************************************************************************
         * Add the Short term third capital to the balance table
         * ***************************************************************************************/
        for (var key in this.data[0].balance.stdc) {
            var tableRow = tableBalance.addRow("styleTablRows");

            description = this.data[0].balance.stdc[key].description;
            if (texts[key])
                description = texts[key];
            acronym = this.data[0].balance.stdc[key].acronym;

            tableRow.addCell(description);
            if (this.dialogparam.acronymcolumn) {
                tableRow.addCell(acronym);
            }
            for (var i = this.data.length - 1; i >= 0; i--) {
                amount = this.toLocaleAmountFormat(this.data[i].balance.stdc[key].balance);
                tableRow.addCell(amount, 'styleNormalAmount');
            }
        }
        //add the sum of the third capital (debt capital)
        tableRow = tableBalance.addRow("styleTablRows");
        tableRow.addCell(texts.total_shorttermdebtcapital, 'styleUnderGroupTitles');
        if (this.dialogparam.acronymcolumn) {
            tableRow.addCell(texts.shorttermdebtcapital_acronym);
        }
        for (var i = this.data.length - 1; i >= 0; i--) {
            tableRow.addCell(this.toLocaleAmountFormat(this.data[i].calculated_data.shorttermdebtcapital), "styleMidTotalAmount");
        }

        /******************************************************************************************
         * Add the Long term third capital to the balance table
         * ***************************************************************************************/
        for (var key in this.data[0].balance.ltdc) {
            var tableRow = tableBalance.addRow("styleTablRows");

            description = this.data[0].balance.ltdc[key].description;
            if (texts[key])
                description = texts[key];
            acronym = this.data[0].balance.ltdc[key].acronym;

            tableRow.addCell(description);
            if (this.dialogparam.acronymcolumn) {
                tableRow.addCell(acronym);
            }
            for (var i = this.data.length - 1; i >= 0; i--) {
                amount = this.toLocaleAmountFormat(this.data[i].balance.ltdc[key].balance);
                tableRow.addCell(amount, 'styleNormalAmount');
            }
        }
        //add the sum of the third capital (debt capital)
        tableRow = tableBalance.addRow("styleTablRows");
        tableRow.addCell(texts.total_longtermdebtcapital, 'styleUnderGroupTitles');
        if (this.dialogparam.acronymcolumn) {
            tableRow.addCell(texts.longtermdebtcapital_acronym);
        }
        for (var i = this.data.length - 1; i >= 0; i--) {
            tableRow.addCell(this.toLocaleAmountFormat(this.data[i].calculated_data.longtermdebtcapital), "styleMidTotalAmount");
        }

        /******************************************************************************************
         * Add the Long term third capital plus Short term debt capital (Debt Capital)
         * ***************************************************************************************/

        tableRow = tableBalance.addRow("styleTablRows");
        tableRow.addCell(texts.debtcapital, 'styleUnderGroupTitles');
        if (this.dialogparam.acronymcolumn) {
            tableRow.addCell(texts.debtcapital_acronym);
        }
        for (var i = this.data.length - 1; i >= 0; i--) {
            tableRow.addCell(this.toLocaleAmountFormat(this.data[i].calculated_data.debtcapital), "styleMidTotalAmount");
        }
        /******************************************************************************************
         * Add the own capital to the balance table
         * ***************************************************************************************/
        for (var key in this.data[0].balance.oc) {
            var tableRow = tableBalance.addRow("styleTablRows");

            description = this.data[0].balance.oc[key].description;
            if (texts[key])
                description = texts[key];
            acronym = this.data[0].balance.oc[key].acronym;

            tableRow.addCell(description);
            if (this.dialogparam.acronymcolumn) {
                tableRow.addCell(acronym);
            }
            for (var i = this.data.length - 1; i >= 0; i--) {
                amount = this.toLocaleAmountFormat(this.data[i].balance.oc[key].balance);
                tableRow.addCell(amount, "styleNormalAmount");
            }
        }
        //add the sum of the owned capital
        tableRow = tableBalance.addRow("styleTablRows");
        tableRow.addCell(texts.total_owncapital, 'styleUnderGroupTitles');
        if (this.dialogparam.acronymcolumn) {
            tableRow.addCell(texts.ownedcapital_acronym);
        }
        for (var i = this.data.length - 1; i >= 0; i--) {
            tableRow.addCell(this.toLocaleAmountFormat(this.data[i].calculated_data.owncapital), "styleMidTotalAmount");
        }

        /******************************************************************************************
         * Add the total liabilities and equity to the balance table
         * ***************************************************************************************/
        var tableRow = tableBalance.addRow("styleTablRows");
        tableRow.addCell(texts.totalliabilitiesandequity, 'styleTitlesTotalAmount');
        if (this.dialogparam.acronymcolumn) {
            tableRow.addCell(texts.liabilitiesandequity_acronym);
        }
        for (var i = this.data.length - 1; i >= 0; i--) {
            tableRow.addCell(this.toLocaleAmountFormat(this.data[i].calculated_data.totalliabilitiesandequity), "styleTotalAmount");
        }

        /******************************************************************************************
         * Add the profit and loss table
         * ***************************************************************************************/
        var tableCe = this.printReportAdd_TableConCe(report);
        for (var key in this.data[0].profitandloss) {

            var invertAmount = false;
            var description = this.data[0].profitandloss[key].description;
            if (texts[key])
                description = texts[key];
            var acronym = this.data[0].profitandloss[key].acronym

            if (key == "costofmerchandservices" || key == "personnelcosts" || key == "differentcosts" || key == "depreandadjust" || key == "directtaxes") {
                invertAmount = true;
                description = "- " + description;
            } else if (key == "interests") {
                invertAmount = true;
                description = "+/- " + description;
            } else {
                description = "+ " + description;
            }
            var tableRow = tableCe.addRow("styleTablRows");
            tableRow.addCell(qsTr(description));
            if (this.dialogparam.acronymcolumn) {
                tableRow.addCell(acronym);
            }
            for (var i = this.data.length - 1; i >= 0; i--) {
                amount = this.data[i].profitandloss[key].balance;
                if (invertAmount)
                    amount = Banana.SDecimal.invert(amount);
                tableRow.addCell(this.toLocaleAmountFormat(amount), "styleNormalAmount");
            }
            if (key === "costofmerchandservices") {
                var tableRow = tableCe.addRow("styleTablRows");
                tableRow.addCell(texts.addedvalue, "styleUnderGroupTitles");
                if (this.dialogparam.acronymcolumn) {
                    tableRow.addCell(texts.addedvalue_acronym);
                }
                for (var i = this.data.length - 1; i >= 0; i--) {
                    tableRow.addCell(this.toLocaleAmountFormat(this.data[i].calculated_data.addedvalue), "styleMidTotalAmount");
                }
            }
            if (key === "differentcosts") {
                var tableRow = tableCe.addRow("styleTablRows");
                tableRow.addCell("= EBITDA", "styleUnderGroupTitles");
                if (this.dialogparam.acronymcolumn) {
                    tableRow.addCell(texts.ebitda_acronym);
                }
                for (var i = this.data.length - 1; i >= 0; i--) {
                    tableRow.addCell(this.toLocaleAmountFormat(this.data[i].calculated_data.ebitda), "styleMidTotalAmount");
                }

            }
            if (key === "depreandadjust") {
                var tableRow = tableCe.addRow("styleTablRows");
                tableRow.addCell("= EBIT", "styleUnderGroupTitles");
                if (this.dialogparam.acronymcolumn) {
                    tableRow.addCell(texts.ebit_acronym);
                }
                for (var i = this.data.length - 1; i >= 0; i--) {
                    tableRow.addCell(this.toLocaleAmountFormat(this.data[i].calculated_data.ebit), "styleMidTotalAmount");
                }
            }
            if (key === "interests") {
                var tableRow = tableCe.addRow("styleTablRows");
                tableRow.addCell("= EBT", "styleUnderGroupTitles");
                if (this.dialogparam.acronymcolumn) {
                    tableRow.addCell(texts.ebt_acronym);
                }
                for (var i = this.data.length - 1; i >= 0; i--) {
                    tableRow.addCell(this.toLocaleAmountFormat(this.data[i].calculated_data.ebt), "styleMidTotalAmount");
                }
            }
        }
        var tableRow = tableCe.addRow("styleTablRows");
        tableRow.addCell(texts.annualresult, "styleTitlesTotalAmount");
        if (this.dialogparam.acronymcolumn) {
            tableRow.addCell(texts.finalresult_acronym);
        }
        for (var i = this.data.length - 1; i >= 0; i--) {
            tableRow.addCell(this.toLocaleAmountFormat(this.data[i].calculated_data.annualresult), "styleTotalAmount");
        }

        report.addPageBreak();



        /******************************************************************************************
         * Add the control sums table (could be done better with a method)
         * ***************************************************************************************/
        if (this.dialogparam.includecontrolsums) {
            var tableControlSums = this.printReportAdd_TableControlSums(report);
            var tableRow = tableControlSums.addRow("styleTablRows");
            tableRow.addCell(texts.assets, "styleUnderGroupTitles", 4);
            for (var i = this.data.length - 1; i >= 0; i--) {
                var tableRow = tableControlSums.addRow("styleTablRows");
                var period = this.data[i].period.EndDate;
                var element_type = this.data[i].period.Type;
                var year = period.substr(0, 4);
                if (element_type === "Y") {
                    tableRow.addCell(year);
                    //ADD THE ASSET SECTION
                    tableRow.addCell(this.toLocaleAmountFormat(this.data[i].calculated_data.totalassets_sheet), "styleNormalAmount");
                    tableRow.addCell(this.toLocaleAmountFormat(this.data[i].calculated_data.totalassets), "styleNormalAmount");
                    //check if the control sum i equal to 0, if is not, print a paragraf with a message error and the amount with the color red.
                    var differenceStyle = this.setDifferenceStyle(this.data[i].calculated_data.assets_difference);
                    tableRow.addCell(this.toLocaleAmountFormat(this.data[i].calculated_data.assets_difference), differenceStyle);
                }
            }
            //ADD THE LIABILITIES AND EQUITY SECTION
            var tableRow = tableControlSums.addRow("styleTablRows");
            tableRow.addCell(texts.liabilitiesandequity, "styleUnderGroupTitles", 4);
            for (var i = this.data.length - 1; i >= 0; i--) {
                var tableRow = tableControlSums.addRow("styleTablRows");
                var period = this.data[i].period.EndDate;
                var element_type = this.data[i].period.Type;
                var year = period.substr(0, 4);
                if (element_type === "Y") {
                    tableRow.addCell(year);
                    tableRow.addCell(this.toLocaleAmountFormat(this.data[i].calculated_data.totalliabilitiesandequity_sheet), "styleNormalAmount");
                    tableRow.addCell(this.toLocaleAmountFormat(this.data[i].calculated_data.totalliabilitiesandequity), "styleNormalAmount");
                    //check if the control sum i equal to 0, if is not, print a paragraf with a message error and the amount with the color red.
                    var differenceStyle = this.setDifferenceStyle(this.data[i].calculated_data.liabilitiesandequity_difference);
                    tableRow.addCell(this.toLocaleAmountFormat(this.data[i].calculated_data.liabilitiesandequity_difference), differenceStyle);
                }
            }
            //ADD THE PROFIT AND LOSS SECTION
            var tableRow = tableControlSums.addRow("styleTablRows");
            tableRow.addCell(texts.profitandloss, "styleUnderGroupTitles", 4);
            for (var i = this.data.length - 1; i >= 0; i--) {
                var tableRow = tableControlSums.addRow("styleTablRows");
                var period = this.data[i].period.EndDate;
                var element_type = this.data[i].period.Type;
                var year = period.substr(0, 4);
                if (element_type === "Y") {
                    tableRow.addCell(year);
                    tableRow.addCell(this.toLocaleAmountFormat(this.data[i].calculated_data.annualresult_sheet), "styleNormalAmount");
                    tableRow.addCell(this.toLocaleAmountFormat(this.data[i].calculated_data.annualresult), "styleNormalAmount");
                    //check if the control sum i equal to 0, if is not, print a paragraf with a message error and the amount with the color red.
                    var differenceStyle = this.setDifferenceStyle(this.data[i].calculated_data.annualresult_difference);
                    tableRow.addCell(this.toLocaleAmountFormat(this.data[i].calculated_data.annualresult_difference), differenceStyle);
                }
            }
            if (this.controlsums_differences > 0) {
                report.addParagraph(warning_msg.control_sums, "styleWarningParagraph");
            }

            report.addPageBreak();
        }


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
                    var indexT1 = this.data[i].index.liqu[key].amount;
                    var indexT2 = this.data[i + 1].index.liqu[key].amount;
                    this.setIndexEvolution(indexT1, indexT2, cell);
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
                    this.setIndexEvolution(indexT1, indexT2, cell);
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
                    this.setIndexEvolution(indexT1, indexT2, cell);
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

        /******************************************************************
         * Add the Cashflow table (only if we have at least 2yr of analysis)
         *****************************************************************/

        var tableCashflow = this.printReportAdd_TableCashflow(report);

        //Annual result
        var tableRow = tableCashflow.addRow("styleTablRows");
        tableRow.addCell(texts.annualresult, "styleTablRows");
        for (var i = this.data.length - 1; i >= 0; i--) {
            tableRow.addCell(this.toLocaleAmountFormat(this.data[i].finalresult.finalresult.balance), "styleNormalAmount");
        }

        //Gain on Sales
        var tableRow = tableCashflow.addRow("styleTablRows");
        tableRow.addCell(texts.gain_on_sales, "styleTablRows");
        for (var i = this.data.length - 1; i >= 0; i--) {
            tableRow.addCell(this.toLocaleAmountFormat(this.data[i].calculated_data.fixedassets_gain), "styleNormalAmount");
        }
        //Loss on Sales
        var tableRow = tableCashflow.addRow("styleTablRows");
        tableRow.addCell(texts.gain_on_loss, "styleTablRows");
        for (var i = this.data.length - 1; i >= 0; i--) {
            tableRow.addCell(this.toLocaleAmountFormat(this.data[i].calculated_data.fixedassets_loss), "styleNormalAmount");
        }
        //Depreciations and Adjustments
        var tableRow = tableCashflow.addRow("styleTablRows");
        tableRow.addCell("+ " + texts.depreandadjust, "styleTablRows");
        for (var i = this.data.length - 1; i >= 0; i--) {
            tableRow.addCell(this.toLocaleAmountFormat(this.data[i].profitandloss.depreandadjust.balance), "styleNormalAmount");
        }
        //Provisions and Similar
        var tableRow = tableCashflow.addRow("styleTablRows");
        tableRow.addCell(texts.provisionsandsimilar_cashflow, "styleTablRows");
        for (var i = this.data.length - 1; i >= 0; i--) {
            tableRow.addCell(this.toLocaleAmountFormat(this.data[i].balance.ltdc.provisionsandsimilar.delta), "styleNormalAmount");
        }
        //asset adjustments title
        var tableRow = tableCashflow.addRow("styleTablRows");
        tableRow.addCell(texts.adjusted_assets_cashflow, "styleAssetsAdjustments", this.data.length + 1);

        //Credits adjustments
        var tableRow = tableCashflow.addRow("styleTablRows");
        tableRow.addCell(texts.credits_cashflow, "styleTablRows");
        for (var i = this.data.length - 1; i >= 0; i--) {
            tableRow.addCell(this.toLocaleAmountFormat(this.data[i].balance.ca.credits.delta), "styleNormalAmount");
        }
        //Stocks adjustments
        var tableRow = tableCashflow.addRow("styleTablRows");
        tableRow.addCell(texts.stocks_cashflow, "styleTablRows");
        for (var i = this.data.length - 1; i >= 0; i--) {
            tableRow.addCell(this.toLocaleAmountFormat(this.data[i].balance.ca.stocks.delta), "styleNormalAmount");
        }
        //Prepaid and expenses
        var tableRow = tableCashflow.addRow("styleTablRows");
        tableRow.addCell(texts.prepaid_expenses_cashflow, "styleTablRows");
        for (var i = this.data.length - 1; i >= 0; i--) {
            tableRow.addCell(this.toLocaleAmountFormat(this.data[i].balance.ca.prepaid_expenses.delta), "styleNormalAmount");
        }

        //liability adjustments title
        var tableRow = tableCashflow.addRow("styleTablRows");
        tableRow.addCell(texts.adjusted_liabilities_cashflow, "styleLiabilitiesAdjustments", this.data.length + 1);

        //Liabilities
        var tableRow = tableCashflow.addRow("styleTablRows");
        tableRow.addCell(texts.liabilities_cashflow, "styleTablRows");
        for (var i = this.data.length - 1; i >= 0; i--) {
            tableRow.addCell(this.toLocaleAmountFormat(this.data[i].balance.stdc.debts.delta), "styleNormalAmount");
        }

        //Accruals and Deferrend Income
        var tableRow = tableCashflow.addRow("styleTablRows");
        tableRow.addCell(texts.accruals_and_deferred_income_cashflow, "styleTablRows");
        for (var i = this.data.length - 1; i >= 0; i--) {
            tableRow.addCell(this.toLocaleAmountFormat(this.data[i].balance.stdc.accruals_and_deferred_income.delta), "styleNormalAmount");
        }
        //Total Operating cashflow
        var tableRow = tableCashflow.addRow("styleTablRows");
        tableRow.addCell(texts.cashflow_from_operations + ' (A)', "styleTitlesTotalAmount");
        for (var i = this.data.length - 1; i >= 0; i--) {
            tableRow.addCell(this.toLocaleAmountFormat(this.data[i].cashflow.from_operations), "styleMidTotalAmount");
        }

        //Investments
        var tableRow = tableCashflow.addRow("styleTablRows");
        tableRow.addCell(texts.investments_cashflow, "styleTablRows");
        for (var i = this.data.length - 1; i >= 0; i--) {
            tableRow.addCell(this.toLocaleAmountFormat(this.data[i].cashflow.investments), "styleNormalAmount");
        }
        //Disinvestments
        var tableRow = tableCashflow.addRow("styleTablRows");
        tableRow.addCell(texts.disinvestments_cashflow, "styleTablRows");
        for (var i = this.data.length - 1; i >= 0; i--) {
            tableRow.addCell(this.toLocaleAmountFormat(this.data[i].cashflow.disinvestments), "styleNormalAmount");
        }

        //Cashflow from Investing
        var tableRow = tableCashflow.addRow("styleTablRows");
        tableRow.addCell(texts.cashflow_from_investing + ' (B)', "styleTitlesTotalAmount");
        for (var i = this.data.length - 1; i >= 0; i--) {
            tableRow.addCell(this.toLocaleAmountFormat(this.data[i].cashflow.from_investing), "styleMidTotalAmount");
        }

        //Long therm Debt Capital
        var tableRow = tableCashflow.addRow("styleTablRows");
        tableRow.addCell(texts.longtermdebtcapital_cashflow, "styleTablRows");
        for (var i = this.data.length - 1; i >= 0; i--) {
            tableRow.addCell(this.toLocaleAmountFormat(this.data[i].balance.ltdc.longter_debts.delta), "styleNormalAmount");
        }
        //Dividends
        var tableRow = tableCashflow.addRow("styleTablRows");
        tableRow.addCell(texts.dvidends, "styleTablRows");
        for (var i = this.data.length - 1; i >= 0; i--) {
            tableRow.addCell(this.toLocaleAmountFormat(this.data[i].balance.oc.reservesandprofits.dividends), "styleNormalAmount");
        }
        //Own Capital
        var tableRow = tableCashflow.addRow("styleTablRows");
        tableRow.addCell(texts.ownbasecapital_cashflow, "styleTablRows");
        for (var i = this.data.length - 1; i >= 0; i--) {
            tableRow.addCell(this.toLocaleAmountFormat(this.data[i].balance.oc.ownbasecapital.delta), "styleNormalAmount");
        }
        //Cashflow from Financing
        var tableRow = tableCashflow.addRow("styleTablRows");
        tableRow.addCell(texts.cashflow_from_financing + ' (C)', "styleTitlesTotalAmount");
        for (var i = this.data.length - 1; i >= 0; i--) {
            tableRow.addCell(this.toLocaleAmountFormat(this.data[i].cashflow.from_financing), "styleMidTotalAmount");
        }
        //Final Cashflow
        var tableRow = tableCashflow.addRow("styleTablRows");
        tableRow.addCell(texts.final_cashflow + ' (A+B+C)', "styleTitlesTotalAmount");
        for (var i = this.data.length - 1; i >= 0; i--) {
            tableRow.addCell(this.toLocaleAmountFormat(this.data[i].cashflow.cashflow), "styleTotalAmount");
        }
        //Opening Liquidity
        var tableRow = tableCashflow.addRow("styleTablRows");
        tableRow.addCell(texts.opening_liquidity, "styleTablRows");
        for (var i = this.data.length - 1; i >= 0; i--) {
            tableRow.addCell(this.toLocaleAmountFormat(this.data[i].cashflow.opening_liquidity), "styleNormalAmount");
        }
        //Closing Liquidity
        var tableRow = tableCashflow.addRow("styleTablRows");
        tableRow.addCell(texts.closing_liquidity, "styleTablRows");
        for (var i = this.data.length - 1; i >= 0; i--) {
            tableRow.addCell(this.toLocaleAmountFormat(this.data[i].cashflow.closing_liquidity), "styleNormalAmount");
        }
        //Liquidity Delta
        var tableRow = tableCashflow.addRow("styleTablRows");
        tableRow.addCell(texts.delta_liquidity, "styleTitlesTotalAmount");
        for (var i = this.data.length - 1; i >= 0; i--) {
            tableRow.addCell(this.toLocaleAmountFormat(this.data[i].cashflow.delta_liquidity), "styleTotalAmount");
        }
        if (this.cashflow_differences > 0)
            report.addParagraph(warning_msg.cashflow, "styleWarningParagraph");


        /**************************************************
         * Add the Cashflow ratios
         *************************************************/
        var tableIndCashflow = this.printReportAdd_TableIndCashflow(report);

        for (var key in this.data[0].cashflow_index) {
            var tableRow = tableIndCashflow.addRow("styleTablRows");
            tableRow.addCell(qsTr(this.data[0].cashflow_index[key].description), "styleTablRows");
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
                    this.setIndexEvolution(indexT1, indexT2, cell);
                }
            }
        }


        report.addPageBreak();

        /******************************************************************************************
         * Add the Dupont Analysis table, if the user included it
         * ***************************************************************************************/

        if (this.dialogparam.includedupontanalysis) {

            var tabledupont = this.printReportAdd_TableDupont(report);

            for (var key in this.data[0].dupont_data) {
                var tableRow = tabledupont.addRow("styleTablRows");
                if (this.data[0].dupont_data[key].style == "titl") {
                    textstyle = "styleTitlesTotalAmount";
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
                        this.setIndexEvolution(indexT1, indexT2, cell);
                    }
                }
            }
        }

        /******************************************************************************************
         * Add the Altman index Analysis
         * ***************************************************************************************/
        var tableAltmanIndex = this.printtableAltmanIndex(report);
        var yearcolumns = 0;
        var tableRow = tableAltmanIndex.addRow("styleTablRows");
        for (var i = this.data.length - 1; i >= 0; i--) {
            ratios = this.data[i].altman_index;
            tableRow.addCell(this.data[i].altman_index, this.altmanScoreType(this.data[i].altman_index));
        }
        if (this.dialogparam.formulascolumn) {

            var tableRow = tableAltmanIndex.addRow("styleTablRows");
            tableRow.addCell(texts.altmanformula, "styleCentralText", this.yearsColumnCount(yearcolumns));
            var tableRow = tableAltmanIndex.addRow("styleTablRows");
            tableRow.addCell("X1 = cuas / tota", "styleCentralText", this.yearsColumnCount(yearcolumns));
            var tableRow = tableAltmanIndex.addRow("styleTablRows");
            tableRow.addCell("X2 = reut / tota ", "styleCentralText", this.yearsColumnCount(yearcolumns));
            var tableRow = tableAltmanIndex.addRow("styleTablRows");
            tableRow.addCell("X3 = EBIT / tota ", "styleCentralText", this.yearsColumnCount(yearcolumns));
            var tableRow = tableAltmanIndex.addRow("styleTablRows");
            tableRow.addCell("X4 = pant / totp", "styleCentralText", this.yearsColumnCount(yearcolumns));
            var tableRow = tableAltmanIndex.addRow("styleTablRows");
            tableRow.addCell("X5 = sale / tota", "styleCentralText", this.yearsColumnCount(yearcolumns));
        }

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
            differenceStyle = "styleDifferenceFoundAmount";
        } else {
            differenceStyle = "styleNormalAmount";
        }
        return differenceStyle;
    }

    /**
     * if there are differences between the accounting total and the calculated total, the user is notified.
     */
    showDifferencesWarning() {
        var warning_message = {};
        warning_message.control_sums = qsTr("Warning: The difference between the 'Accounting total' and the 'Calculated total' columns should be 0.\n Check that the groups used are correct.");
        warning_message.cashflow = qsTr("Warning: The difference between the 'Increase/decrease in Liquidity' and the 'Cash difference' amounts should be 0.\n Check that the groups used are correct.");
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
        style = stylesheet.addStyle("tableCashflow");
        style = stylesheet.addStyle("tableIndCashflow");
        style = stylesheet.addStyle("tableDupont");
        style = stylesheet.addStyle("tableAltmanIndex");


        //Style for the tables header
        style = stylesheet.addStyle(".styleTablesHeaderText");

        //style for the group titles
        style = stylesheet.addStyle(".styleTitles");

        //style for the under-group titles
        style = stylesheet.addStyle(".styleUnderGroupTitles");

        //Style for the normal elements
        style = stylesheet.addStyle(".styleNormal");

        //Style for amounts
        style = stylesheet.addStyle(".styleNormalAmount");

        //style for the accounting mid totals
        style = stylesheet.addStyle(".styleMidTotalAmount");

        //style for the accounting totals Amount
        style = stylesheet.addStyle(".styleTotalAmount");

        //style for the titles of the totals
        style = stylesheet.addStyle(".styleTitlesTotalAmount");

        //style for the  header
        style = stylesheet.addStyle(".header");

        //style for the  footer
        style = stylesheet.addStyle(".footer");

        //style for the pharagraphs
        style = stylesheet.addStyle(".styleParagraphs");

        //style for the Z-score,low prob. of a financial crysis
        style = stylesheet.addStyle(".styleZIndexLow");

        //style for the Z-score,mid prob. of a financial crysis
        style = stylesheet.addStyle(".styleZIndexMid");

        //style for the Z-score,prob. of a financial crysis
        style = stylesheet.addStyle(".styleZIndexProb");



        return stylesheet;
    }

    /**
     * Define all the dialog texts
     */
    initFinancialAnalysisTexts() {

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
        texts.reservesandprofits_acronym = "reut";
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
        texts.liabilitiesandequity_acronym = "totp"
        texts.addedvalue_acronym = "adva";
        texts.ebitda_acronym = "EBIT-DA";
        texts.ebit_acronym = "EBIT";
        texts.ebt_acronym = "EBT";
        texts.prepaid_expenses_acronym = "prep";
        texts.accruals_and_deferred_income = "wown";
        texts.provisionsandsimilar_acronym = "prov";

        /******************************************************************************************
         * texts for tooltips
         ******************************************************************************************/
        texts.groups_tooltip = qsTr("Enter the groups, separated by a semicolon ';'");
        texts.amounts_tooltip = qsTr("Enter the amount");
        texts.logo_tooltip = qsTr("Check to include Logo");
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
        texts.reservesandprofits = qsTr("Reserves and profits");
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
        texts.longtermdebtcapital_cashflow = qsTr("Third parties capital (+) increases or (-) repayments");
        texts.ownbasecapital_cashflow = qsTr("Own capital (+) increases or (-) reductions ");
        texts.adjusted_assets_cashflow = qsTr("Adjustment with assets accounts ");
        texts.adjusted_liabilities_cashflow = qsTr("Adjustment with liabilities accounts ");
        texts.cashflow_from_operations = qsTr("= Cash Flow from operations");
        texts.cashflow_from_investing = qsTr("= Cash Flow from investing");
        texts.cashflow_from_financing = qsTr("=Cash Flow from financing")
        texts.final_cashflow = qsTr("Increase/decrease in liquidity");
        texts.opening_liquidity = qsTr("Liquidity at the beginning of the period");
        texts.closing_liquidity = qsTr("Liquidity at the end of the period");
        texts.delta_liquidity = qsTr("Difference");
        texts.gain_on_sales = qsTr("- Revaluations on Fixed Assets");
        texts.gain_on_loss = qsTr("+ Devaluations on Fixed Assets");
        texts.dvidends = qsTr("- Dividends");
        /******************************************************************************************
         * texts for titles,headers,..
         * ***************************************************************************************/
        texts.companyinfos = qsTr("COMPANY INFORMATION");
        texts.upperbalance = qsTr("BALANCE");
        texts.balance = qsTr('Balance');
        texts.totowncapital = qsTr("Owned Capital");
        texts.upperprofitandloss = qsTr("PROFIT AND LOSS");
        texts.description = qsTr("Description");
        texts.acronym = qsTr("Acronym");
        texts.formula = qsTr("formula");
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
        texts.uppercashflowratios = qsTr("CASH FLOW RATIOS");
        texts.benchmark = qsTr("Benchmark");
        texts.benchmarks = qsTr("Benchmarks");
        texts.upperaltmanindex = qsTr("ALTMAN INDEX Z-SCORE");
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
        texts.texts = qsTr('Texts');
        texts.benchmarktexts = qsTr('Benchmarks texts');
        texts.numberofpreviousyear = qsTr('Number of previous years');
        texts.numberofdecimals = qsTr('Number of decimals');
        texts.includebudget = qsTr('Include Budget');
        texts.includecontrolsums = qsTr('Include Control Sums');
        texts.includedupontanalysis = qsTr('Include DuPont Analysis')
        texts.showacronymcolumn = qsTr('Show Acronym column');
        texts.showformulascolumn = qsTr('Show Formulas column');
        texts.printlogo = 'Logo';
        texts.headers_background_color = qsTr("Background color of headers");
        texts.headers_texts_color = qsTr("Text color of headers");
        texts.pageheader = qsTr("Page header");
        texts.logoname = qsTr("Composition for logo and header alignment");
        texts.averageemployees = qsTr('Average number of employees');
        texts.leverage = qsTr('Leverage');
        texts.profitability = qsTr('Profitability');
        texts.efficiency = qsTr('Efficiency');
        texts.cashflow = qsTr("Cash Flow");
        texts.errorMsg = qsTr("Non-existent groups/accounts: ");


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
        texts.rot = "ROT";
        texts.mol = "MOL";
        texts.ebit = "EBIT";
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
        texts.ebitmargin = qsTr("EBIT margin");
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
        dialogparam.version = "v1.2";
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
        dialogparam.pageheader = true;
        dialogparam.logoname = "Logo";
        dialogparam.headers_background_color = "#337AB7";
        dialogparam.headers_texts_color = "#fff";

        return dialogparam;
    }

    initDialogParam_Balance() {
        var texts = this.initFinancialAnalysisTexts();
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
        dialogparam.reservesandprofits = {};
        dialogparam.reservesandprofits.gr = "290;295;296;297;298";
        dialogparam.reservesandprofits.description = texts.reservesandprofits;
        dialogparam.reservesandprofits.acronym = texts.reservesandprofits_acronym;
        dialogparam.reservesandprofits.bclass = "2";

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
        dialogparam.differentcosts.gr = "6";
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
        var texts = this.initFinancialAnalysisTexts();
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
        var isIncluded = this.dialogparam.includebudgettable;
        if (this.with_budget && isIncluded) {
            var data_budget = this.loadData_Budget(yeardocument);
            var calculated_data = this.calculateData(data_budget, yeardocument, isIncluded);
            var index = this.calculateIndex(data_budget, calculated_data);
            var dupont_data = this.createdupont_data(data_budget, calculated_data, index);
            var altman_index = this.calculateAltmanIndex(data_budget, calculated_data, index)
            var cashflow = this.calculateCashflowTotals(data_budget, calculated_data);
            var cashflow_index = this.calculateCashflowIndex(data_budget, calculated_data, cashflow);
            data_budget.calculated_data = calculated_data;
            data_budget.index = index;
            data_budget.dupont_data = dupont_data;
            data_budget.altman_index = altman_index;
            data_budget.cashflow = cashflow;
            data_budget.cashflow_index = cashflow_index;
            this.data.push(data_budget);
        }

        while (yeardocument && i <= this.dialogparam.maxpreviousyears) {
            var data_year = this.loadData_Year(yeardocument);
            var calculated_data = this.calculateData(data_year, yeardocument, false);
            var index = this.calculateIndex(data_year, calculated_data);
            var dupont_data = this.createdupont_data(data_year, calculated_data, index);
            var altman_index = this.calculateAltmanIndex(data_year, calculated_data, index);
            var cashflow = this.calculateCashflowTotals(data_year, calculated_data);
            var cashflow_index = this.calculateCashflowIndex(data_year, calculated_data, cashflow);
            data_year.calculated_data = calculated_data;
            data_year.index = index;
            data_year.dupont_data = dupont_data;
            data_year.altman_index = altman_index;
            data_year.cashflow = cashflow;
            data_year.cashflow_index = cashflow_index;
            this.data.push(data_year);
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
                var transactions;
                if (budgetBalances) {
                    bal = _banDocument.budgetBalance(value, '', '', null);
                    transactions = _banDocument.budgetCard(value, '', '', null);
                } else {
                    bal = _banDocument.currentBalance(value, '', '', null);
                    transactions = _banDocument.currentCard(value, '', '', null);
                    //Banana.console.debug(bal.amount);
                }
                //Banana.console.debug(JSON.stringify(bal.balance));
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
                    if (dialogparam[key].balance === "" || dialogparam[key].balance === " " || dialogparam[key].balance === null) {
                        dialogparam[key].balance += "0.00";
                    }
                    //delta
                    dialogparam[key].delta = Banana.SDecimal.subtract(dialogparam[key].balance, dialogparam[key].opening);
                    //the sign is set to minus for elements of the Assets (to calculate the cashflow);
                    if (dialogparam[key].bclass === "1" && dialogparam[key].acronym !== "liqu") {
                        dialogparam[key].delta = Banana.SDecimal.multiply(dialogparam[key].delta, mult);
                    }
                    //Banana.console.debug(JSON.stringify(dialogparam[key]));
                    //Banana.console.debug(JSON.stringify("********************************"));
                }
                if (transactions) {
                    for (var i = 0; i < transactions.rowCount; i++) {
                        let tRow = transactions.row(i);
                        let description = tRow.value('JDescription');
                        description = description.toLowerCase();

                        //find the Disinvestmenst
                        if (description.indexOf("#disinvest") >= 0) {
                            var jAmount = tRow.value('JAmount');
                            jAmount = Banana.SDecimal.abs(jAmount);

                            dialogparam[key].disinvestments = Banana.SDecimal.add(dialogparam[key].disinvestments, jAmount);
                        }
                        //find the gain on the sales
                        if (description.indexOf("#revaluation") >= 0) {
                            var jAmount = tRow.value('JAmount');
                            jAmount = Banana.SDecimal.abs(jAmount);

                            dialogparam[key].gain = Banana.SDecimal.add(dialogparam[key].gain, jAmount);
                        }
                        //find the loss on the sales
                        if (description.indexOf("#devaluation") >= 0) {
                            var jAmount = tRow.value('JAmount');
                            jAmount = Banana.SDecimal.abs(jAmount);

                            dialogparam[key].loss = Banana.SDecimal.add(dialogparam[key].loss, jAmount);
                        }
                        //find the Dividends
                        if (description.indexOf("#dividends") >= 0) {
                            var jAmount = tRow.value('JAmount');
                            jAmount = Banana.SDecimal.abs(jAmount);

                            dialogparam[key].dividends = Banana.SDecimal.add(dialogparam[key].dividends, jAmount);
                        }
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
     * Instantiate a *calculated_data= {}* object that will contain all the calculated data.
     * Calculate the various elements.
     * @Param {object} data: the data object created thanks to loadData methods, containing the values and the sums of the paramters recovered from the dialog
     * @Param {object} _banDocument: the startDate of the document, wich is located in the File Info.
     * @returns an object containing the calculated values
     */
    calculateData(data, _banDocument, budget_Isincluded) {
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


        //ottimizzare con ciclo for
        //Fixed Assets (final balance)
        var fixedassets = Banana.SDecimal.add(data.balance.fa.financial_fixedassets.balance, data.balance.fa.tangible_fixedassets.balance);
        fixedassets = Banana.SDecimal.add(fixedassets, data.balance.fa.intangible_fixedassets.balance);
        calcdata.fixedassets = fixedassets;
        //Fixed Asssets (opening)
        var fixedassets_opening = Banana.SDecimal.add(data.balance.fa.financial_fixedassets.opening, data.balance.fa.tangible_fixedassets.opening);
        fixedassets = Banana.SDecimal.add(fixedassets, data.balance.fa.intangible_fixedassets.opening);
        calcdata.fixedassets_opening = fixedassets_opening;

        var totalassets = Banana.SDecimal.add(currentassets, fixedassets);
        calcdata.totalassets = totalassets;

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
        calcdata.totalassets_sheet = {}
        var totalassets_sheet;
        if (budget_Isincluded) {
            totalassets_sheet = _banDocument.budgetBalance('Gr=1', '', '', null);
        } else {
            totalassets_sheet = _banDocument.currentBalance('Gr=1', '', '', null);
        }
        totalassets_sheet = totalassets_sheet.balance;
        calcdata.totalassets_sheet = totalassets_sheet;

        /********************************************************************************************************
         * Calculate the difference between Calculated Asset and the Asset amount found in the accountin sheet
         ********************************************************************************************************/
        calcdata.assets_difference = Banana.SDecimal.subtract(totalassets, totalassets_sheet);
        if (!Banana.SDecimal.isZero(calcdata.assets_difference)) {
            this.controlsums_differences++;
        }

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
        var owncapital = Banana.SDecimal.add(data.balance.oc.ownbasecapital.balance, data.balance.oc.reservesandprofits.balance);
        calcdata.owncapital = owncapital;

        var totalliabilitiesandequity = Banana.SDecimal.add(debtcapital, owncapital);
        calcdata.totalliabilitiesandequity = totalliabilitiesandequity;

        /*********************************************************************************************
         * Calculation of the total liabilities and equity resulting from the accounting sheet
         *********************************************************************************************/

        calcdata.totalliabilitiesandequity_sheet = {}
        var mult = -1;
        var totalliabilitiesandequity_sheet
        if (budget_Isincluded) {
            totalliabilitiesandequity_sheet = _banDocument.budgetBalance('Gr=2', '', '', null);
        } else {
            totalliabilitiesandequity_sheet = _banDocument.currentBalance('Gr=2', '', '', null);

        }
        totalliabilitiesandequity_sheet = Banana.SDecimal.multiply(totalliabilitiesandequity_sheet.balance, mult);
        calcdata.totalliabilitiesandequity_sheet = totalliabilitiesandequity_sheet;

        /**********************************************************************************************************************************
         * Calculate the difference between liabilities and equity and the liabilities and equit amount found in the accountin sheet
         **********************************************************************************************************************************/
        calcdata.liabilitiesandequity_difference = Banana.SDecimal.subtract(totalliabilitiesandequity, totalliabilitiesandequity_sheet);
        if (!Banana.SDecimal.isZero(calcdata.liabilitiesandequity_difference))
            this.controlsums_differences++;

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
         * Calculation of the difference between the calculated annual result and the accounting annual result
         *******************************************************************************************************/
        calcdata.annualresult_difference = Banana.SDecimal.subtract(calcdata.annualresult_sheet, calcdata.annualresult);
        if (!Banana.SDecimal.isZero(calcdata.annualresult_difference))
            this.controlsums_differences++;

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
     * @Param {object} calculated_data: the object returned by the CalculateData method containing the values of the calculated elements.
     * @returns an object containing the calulated ratios.
     */
    calculateIndex(data, calculated_data) {
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
        index.lev.gdin.formula = "(stdc+ltdc) / totp";
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
        index.lev.gfcp.formula = "owca / totp";
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
        index.lev.gdau.formula = "reut / owca";
        var reservesandprofits = data.balance.oc.reservesandprofits.balance;
        var fcalc6 = Banana.SDecimal.divide(reservesandprofits, owncapital);
        var fcalc7 = Banana.SDecimal.multiply(fcalc6, 100, { 'decimals': this.dialogparam.numberofdecimals });
        var fris4 = fcalc7.toString();
        index.lev.gdau.amount = fris4;
        index.lev.gdau.benchmark = data.ratios.leverageratios.selfinancingratio.value;

        //degree of coverage of fixed assets
        index.lev.fixaco = {};
        index.lev.fixaco.description = texts.fixedassetcoverage;
        index.lev.fixaco.type = "perc";
        index.lev.fixaco.formula = "(owca + ltdc) / tota";
        var longtermdebtcapital = calculated_data.longtermdebtcapital;
        var fcalc8 = Banana.SDecimal.add(owncapital, longtermdebtcapital);
        var fcalc9 = Banana.SDecimal.divide(fcalc8, totalassets);
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
        index.red.roe.description = "ROE";
        index.red.roe.type = "perc";
        index.red.roe.formula = "profit / owca";
        var rcalc1 = Banana.SDecimal.divide(calculated_data.annualresult, owncapital);
        var rcalc2 = Banana.SDecimal.multiply(rcalc1, 100, { 'decimals': this.dialogparam.numberofdecimals });
        var rris = rcalc2.toString();
        index.red.roe.amount = rris;
        index.red.roe.benchmark = data.ratios.profitabilityratios.profroe.value;


        //ROI
        index.red.roi = {};
        index.red.roi.description = "ROI";
        index.red.roi.type = "perc";
        index.red.roi.formula = "EBIT / tota  ";
        var rcalc3 = Banana.SDecimal.divide(calculated_data.ebit, totalassets);
        var rcalc4 = Banana.SDecimal.multiply(rcalc3, 100, { 'decimals': this.dialogparam.numberofdecimals });
        var rris2 = rcalc4.toString();
        index.red.roi.amount = rris2;
        index.red.roi.benchmark = data.ratios.profitabilityratios.profroi.value;

        //ROS
        index.red.ros = {};
        index.red.ros.description = "ROS";
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
        index.red.mol.description = "MOL";
        index.red.mol.type = "perc";
        index.red.mol.formula = "gross profit / satu";
        var ebitda = calculated_data.ebitda;
        var rcalc7 = Banana.SDecimal.divide(ebitda, salesturnover);
        var rcalc8 = Banana.SDecimal.multiply(rcalc7, 100, { 'decimals': this.dialogparam.numberofdecimals });
        var rris4 = rcalc8.toString();
        index.red.mol.amount = rris4;
        index.red.mol.benchmark = data.ratios.profitabilityratios.profmol.value;

        //Ebit Margin
        index.red.ebm = {};
        index.red.ebm.description = texts.ebitmargin;
        index.red.ebm.type = "perc";
        index.red.ebm.formula = "EBIT / satu";
        var rcalc9 = Banana.SDecimal.divide(calculated_data.ebit, salesturnover);
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
     * Calculate the Cash Flow.
     * @param {*} data 
     * @param {*} calculated_data 
     * @returns 
     */
    calculateCashflowTotals(data, calculated_data) {
        let cashflow = {};

        /****************************************************
         * calculate the Cash flow from operations
         ***************************************************/
        cashflow.from_operations = data.finalresult.finalresult.delta;
        cashflow.from_operations = Banana.SDecimal.subtract(cashflow.from_operations, calculated_data.fixedassets_gain);
        cashflow.from_operations = Banana.SDecimal.add(cashflow.from_operations, calculated_data.fixedassets_loss);
        cashflow.from_operations = Banana.SDecimal.add(cashflow.from_operations, data.profitandloss.depreandadjust.balance);
        cashflow.from_operations = Banana.SDecimal.add(cashflow.from_operations, calculated_data.fixedassets_gain_loss_delta);
        cashflow.from_operations = Banana.SDecimal.add(cashflow.from_operations, data.balance.ltdc.provisionsandsimilar.delta);
        cashflow.from_operations = Banana.SDecimal.add(cashflow.from_operations, data.balance.ca.credits.delta);
        cashflow.from_operations = Banana.SDecimal.add(cashflow.from_operations, data.balance.ca.stocks.delta);
        cashflow.from_operations = Banana.SDecimal.add(cashflow.from_operations, data.balance.ca.prepaid_expenses.delta);
        cashflow.from_operations = Banana.SDecimal.add(cashflow.from_operations, data.balance.stdc.debts.delta);
        cashflow.from_operations = Banana.SDecimal.add(cashflow.from_operations, data.balance.stdc.accruals_and_deferred_income.delta);

        /******************************************************
         * Calculate the Cashflow from Investing
         ******************************************************/
        //Find the investments with the following formula: Investments=Depreciations and Adjustments + Disinvestments + *Fixed Assets (Delta).
        //*Or use the opening and closing amounts.

        //First find the disinvestments
        var disinvestments = Banana.SDecimal.add(data.balance.fa.financial_fixedassets.disinvestments, data.balance.fa.tangible_fixedassets.disinvestments);
        disinvestments = Banana.SDecimal.add(disinvestments, data.balance.fa.intangible_fixedassets.disinvestments);
        cashflow.disinvestments = disinvestments;

        cashflow.investments = Banana.SDecimal.add(cashflow.investments, data.profitandloss.depreandadjust.balance);
        cashflow.investments = Banana.SDecimal.add(cashflow.investments, disinvestments);
        //Fixed assets opening amount
        let fixedassets_opening = Banana.SDecimal.abs(calculated_data.fixedassets_opening);
        let fixedassets_balance = Banana.SDecimal.abs(calculated_data.fixedassets);
        cashflow.investments = Banana.SDecimal.add(cashflow.investments, fixedassets_balance);
        cashflow.investments = Banana.SDecimal.subtract(cashflow.investments, fixedassets_opening);
        //Adjusting the calculation with capital gain and loss
        cashflow.investments = Banana.SDecimal.subtract(cashflow.investments, calculated_data.fixedassets_gain);
        cashflow.investments = Banana.SDecimal.add(cashflow.investments, calculated_data.fixedassets_loss);
        //then calculate the cashflow from Investing
        cashflow.from_investing = Banana.SDecimal.subtract(cashflow.from_investing, cashflow.investments);
        cashflow.from_investing = Banana.SDecimal.add(cashflow.from_investing, disinvestments);

        /***************************************************
         * Calculate the Cashflow from Financing  
         ***************************************************/
        //first find the long therm third capital without the provisions and similar
        cashflow.from_financing = Banana.SDecimal.add(cashflow.from_financing, data.balance.ltdc.longter_debts.delta);
        cashflow.from_financing = Banana.SDecimal.subtract(cashflow.from_financing, data.balance.oc.reservesandprofits.dividends);
        cashflow.from_financing = Banana.SDecimal.add(cashflow.from_financing, data.balance.oc.ownbasecapital.delta);


        /************************************************
         * Calculate the final Cashflow
         *********************************************/
        cashflow.cashflow = Banana.SDecimal.add(cashflow.from_operations, cashflow.from_investing);
        cashflow.cashflow = Banana.SDecimal.add(cashflow.cashflow, cashflow.from_financing);

        /********************************************************************************
         * Save the liquidity amount at the beginning and in the end of the period
         ******************************************************************************/
        cashflow.opening_liquidity = data.balance.ca.liquidity.opening;
        cashflow.closing_liquidity = data.balance.ca.liquidity.balance;
        cashflow.delta_liquidity = data.balance.ca.liquidity.delta;


        if (cashflow.delta_liquidity !== cashflow.cashflow)
            this.cashflow_differences++;



        return cashflow;


    }

    /**
     * Calculate the Cashflow ratios.
     * @param {*} freecashflow the free Cashflow (array)
     * @param {*} investments the investments (array)
     */
    calculateCashflowIndex(data, calculated_data, cashflow) {

        let texts = this.initFinancialAnalysisTexts();

        let index = {};

        /*******************************************************
         * Cash Flow Margin (performed over the Cashflow from Operations)
         *****************************************************/

        index.cashflow_margin = {};
        index.cashflow_margin.description = texts.cashflow_margin;
        index.cashflow_margin.type = "perc";
        index.cashflow_margin.formula = "cashflow(A)/satu";
        index.cashflow_margin.amount = Banana.SDecimal.divide(cashflow.from_operations, data.profitandloss.salesturnover.balance);
        index.cashflow_margin.amount = Banana.SDecimal.multiply(index.cashflow_margin.amount, 100, { 'decimals': this.dialogparam.numberofdecimals });
        index.cashflow_margin.benchmark = data.ratios.cashflowratios.cashflow_margin.value;

        /*******************************************************
         * Asset efficiency
         *****************************************************/

        index.cashflow_asset_efficiency = {};
        index.cashflow_asset_efficiency.description = texts.cashflow_asset_efficiency;
        index.cashflow_asset_efficiency.type = "perc";
        index.cashflow_asset_efficiency.formula = "cashflow(A)/tota";
        index.cashflow_asset_efficiency.amount = Banana.SDecimal.divide(cashflow.from_operations, calculated_data.totalassets);
        index.cashflow_asset_efficiency.amount = Banana.SDecimal.multiply(index.cashflow_asset_efficiency.amount, 100, { 'decimals': this.dialogparam.numberofdecimals });
        index.cashflow_asset_efficiency.benchmark = data.ratios.cashflowratios.cashflow_asset_efficiency.value;

        /*******************************************************
         * Cashflow to current Liabilities
         *****************************************************/

        index.cashflow_current_liabilities = {};
        index.cashflow_current_liabilities.description = texts.cashflow_current_liabilities;
        index.cashflow_current_liabilities.type = "perc";
        index.cashflow_current_liabilities.formula = "cashflow(A)/stdc";
        index.cashflow_current_liabilities.amount = Banana.SDecimal.divide(cashflow.from_operations, calculated_data.shorttermdebtcapital);
        index.cashflow_current_liabilities.amount = Banana.SDecimal.multiply(index.cashflow_current_liabilities.amount, 100, { 'decimals': this.dialogparam.numberofdecimals });
        index.cashflow_current_liabilities.benchmark = data.ratios.cashflowratios.cashflow_current_liabilities.value;

        /*******************************************************
         * Cashflow to Liabilities
         *****************************************************/

        index.cashflow_liabilities = {};
        index.cashflow_liabilities.description = texts.cashflow_liabilities;
        index.cashflow_liabilities.type = "perc";
        index.cashflow_liabilities.formula = "cashflow(A)/deca";
        index.cashflow_liabilities.amount = Banana.SDecimal.divide(cashflow.from_operations, calculated_data.debtcapital);
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
        index.cashflow_to_investments.amount = Banana.SDecimal.divide(cashflow.from_operations, cashflow.investments);
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
        var texts = this.initFinancialAnalysisTexts();
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

        //I create an undergroup for the preferences, the Analysis Details
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
        currentParam.name = 'pree';
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
        currentParam.name = 'reut';
        currentParam.group = 'balance';
        currentParam.title = defaultParam.balance.oc.reservesandprofits.description;
        currentParam.type = 'string';
        currentParam.value = userParam.balance.oc.reservesandprofits.gr ? userParam.balance.oc.reservesandprofits.gr : '';
        currentParam.defaultvalue = defaultParam.balance.oc.reservesandprofits.gr;
        currentParam.tooltip = texts.groups_tooltip;
        currentParam.parentObject = 'Own Capital';
        currentParam.readValue = function() {
            userParam.balance.oc.reservesandprofits.gr = this.value;
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
        currentParam.type = 'string';
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
        currentParam.type = 'string';
        currentParam.value = userParam.headers_texts_color ? userParam.headers_texts_color : userParam.headers_texts_color;
        currentParam.defaultvalue = defaultParam.headers_texts_color;
        currentParam.tooltip = texts.headers_texts_color_tooltip;
        currentParam.parentObject = 'Print Details';
        currentParam.readValue = function() {
            userParam.headers_texts_color = this.value;
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
        var texts = this.initFinancialAnalysisTexts();

        var Dupont = {};
        var totalassets = calculated_data.totalassets;
        var sales = data.profitandloss.salesturnover.balance;
        var ebit = calculated_data.ebit;
        var roi = index.red.roi.amount;

        /*profit or ebit (ebit is used for economic analysis)
         */
        Dupont.ebit = {};
        Dupont.ebit.description = texts.ebit;
        Dupont.ebit.style = "nrm";
        Dupont.ebit.type = "dec";
        Dupont.ebit.amount = ebit;

        //sales (for MOL)
        Dupont.ebitmarginsales = {};
        Dupont.ebitmarginsales.description = texts.salesturnover;
        Dupont.ebitmarginsales.style = "nrm";
        Dupont.ebitmarginsales.type = "dec";
        Dupont.ebitmarginsales.amount = sales;

        //EBIT MARGIN
        Dupont.ebitmargin = {};
        Dupont.ebitmargin.description = texts.ebitmargin;
        Dupont.ebitmargin.style = "titl";
        Dupont.ebitmargin.type = "perc";
        Dupont.ebitmargin.amount = Banana.SDecimal.divide(Dupont.ebit.amount, Dupont.ebitmarginsales.amount);
        Dupont.ebitmargin.amount = Banana.SDecimal.multiply(Dupont.ebitmargin.amount, 100, { 'decimals': this.dialogparam.numberofdecimals });

        //sales (for ROT)
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
     * @description this method calculate the altman Index.
     * @Param {object} data: the data object created thanks to loadData methods, containing the values and the sums of the paramters recovered from the dialog.
     * @Param {object} calculated_data: the object returned by the CalculateData method containing the values of the calculated elements.
     * @Param {object} index: the object returned by the CalculateIndex method containing the values of the calculated indexes.
     * @returns an object containing the Altman index elements
     */
    calculateAltmanIndex(data, calculated_data, index) {

        /*Z-SCORE = 0.717 X1 + 0.847 X2 +3.107 X3 +0.420 X4 + 0.998 X5
        X1 = Current Asset / Total Asset
        X2 = Reserves and Profit/ Total Asset
        X3 = EBIT / Total Asset
        X4 = Net Assets / Total liabilities and Equitiy
        X5 = Sales / Total Asset
        */

        var AltmanIndex = {};

        //X1
        var currentassets = calculated_data.currentassets;
        var totalassets = calculated_data.totalassets;
        var x1 = Banana.SDecimal.divide(currentassets, totalassets);
        AltmanIndex.x1 = Banana.SDecimal.multiply(x1, 0.717);

        //X2
        var reservesandprofits = data.balance.oc.reservesandprofits.balance;
        var x2 = Banana.SDecimal.divide(reservesandprofits, totalassets);
        AltmanIndex.x2 = Banana.SDecimal.multiply(x2, 0.847);

        //X3
        var x3 = Banana.SDecimal.divide(index.red.roi.amount, 100);
        AltmanIndex.x3 = Banana.SDecimal.multiply(x3, 3.107);

        //X4
        var pant = Banana.SDecimal.subtract(calculated_data.totalassets, calculated_data.totalliabilitiesandequity);
        var x4 = Banana.SDecimal.divide(pant, calculated_data.totalliabilitiesandequity);
        AltmanIndex.x4 = Banana.SDecimal.multiply(x4, 0.420);

        //X5
        var x5 = Banana.SDecimal.divide(data.profitandloss.salesturnover.balance, totalassets);
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
        documentInfo.City = "";


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
            return "";

        var dec = this.dialogparam.numberofdecimals
        return Banana.Converter.toLocaleNumberFormat(value, dec, true);
    }

    formatAllAmounts(data) {

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
     * In case of a new version of the parameters, retrieve the parameters that the user defined in the Dialog (if exists) otherwise
     * the parameter is set with the default value
     * from version 1.0 to version 1.1 (26.01.2020)
     * @param {*} defaultParam 
     * @param {*} userParam 
     */
    UpdateParamsData(defaultParam, userParam) {


        /**********************************************************
         * Set user Preferences Params
         *************************************************************/
        if (userParam.maxpreviousyears) {
            defaultParam.maxpreviousyears = userParam.maxpreviousyears;
        }
        if (userParam.numberofdecimals) {
            defaultParam.numberofdecimals = userParam.numberofdecimals;
        }
        if (userParam.numberofemployees) {
            defaultParam.numberofemployees = userParam.numberofemployees;
        }
        if (userParam.acronymcolumn) {
            defaultParam.acronymcolumn = userParam.acronymcolumn;
        }
        if (userParam.formulascolumn) {
            defaultParam.formulascolumn = userParam.formulascolumn;
        }
        if (userParam.includebudgettable) {
            defaultParam.includebudgettable = userParam.includebudgettable;
        }

        /**********************************************************
         * Set user Balance Params
         *************************************************************/
        if (userParam.bilancio) {
            if (userParam.bilancio.ac) {
                if (userParam.bilancio.ac.liqu) {
                    defaultParam.balance.ca.liquidity.gr = userParam.bilancio.ac.liqu.gr;
                }
                if (userParam.bilancio.ac.cred.gr) {
                    defaultParam.balance.ca.credits.gr = userParam.bilancio.ac.cred.gr;
                }
                if (userParam.bilancio.ac.stoc) {
                    defaultParam.balance.ca.stocks.gr = userParam.bilancio.ac.stoc.gr;
                }
            }
            if (userParam.bilancio.af) {
                if (userParam.bilancio.af.fixa) {
                    defaultParam.balance.fa.fixedassets.gr = userParam.bilancio.af.fixa.gr;
                }
            }
            if (userParam.bilancio.ct) {
                if (userParam.bilancio.ct.stdc) {
                    defaultParam.balance.dc.shorttermdebtcapital.gr = userParam.bilancio.ct.stdc.gr;
                }
                if (userParam.bilancio.ct.ltdc) {
                    defaultParam.balance.dc.longtermdebtcapital.gr = userParam.bilancio.ct.ltdc.gr;
                }
            }
            if (userParam.bilancio.cp) {
                if (userParam.bilancio.cp.obca) {
                    defaultParam.balance.oc.ownbasecapital.gr = userParam.bilancio.cp.obca.gr;
                }
                if (userParam.bilancio.cp.reut) {
                    defaultParam.balance.oc.reservesandprofits.gr = userParam.bilancio.cp.reut.gr;
                }
            }
        }

        /**********************************************************
         * Set user Profit and Loss Params
         *************************************************************/
        if (userParam.contoeconomico) {
            if (userParam.contoeconomico.satu) {
                defaultParam.profitandloss.salesturnover.gr = userParam.contoeconomico.satu.gr;
            }
            if (userParam.contoeconomico.cofm) {
                defaultParam.profitandloss.costofmerchandservices.gr = userParam.contoeconomico.cofm.gr;
            }
            if (userParam.contoeconomico.cope) {
                defaultParam.profitandloss.personnelcosts.gr = userParam.contoeconomico.cope.gr;
            }
            if (userParam.contoeconomico.codi) {
                defaultParam.profitandloss.differentcosts.gr = userParam.contoeconomico.codi.gr;
            }
            if (userParam.contoeconomico.amre) {
                defaultParam.profitandloss.depreandadjust.gr = userParam.contoeconomico.amre.gr;
            }
            if (userParam.contoeconomico.inte) {
                defaultParam.profitandloss.interests.gr = userParam.contoeconomico.inte.gr;
            }
        }

        /**********************************************************
         * Set user Final Result Param
         *************************************************************/
        if (userParam.finalresult) {
            if (userParam.finalresult.fire.gr) {
                defaultParam.finalresult.finalresult.gr = userParam.finalresult.fire.gr;
            }
        }

        /**********************************************************
         * Set user Benchmarks Params
         *************************************************************/
        if (userParam.ratios) {
            //liquidity ratios
            if (userParam.ratios.liquidityratios.liqu1) {
                if (userParam.ratios.liquidityratios.liqu1) {
                    defaultParam.ratios.liquidityratios.cashratio.value = userParam.ratios.liquidityratios.liqu1.value;
                }
                if (userParam.ratios.liquidityratios.liqu2) {
                    defaultParam.ratios.liquidityratios.quickratio.value = userParam.ratios.liquidityratios.liqu2.value;
                }
                if (userParam.ratios.liquidityratios.liqu3) {
                    defaultParam.ratios.liquidityratios.currentratio.value = userParam.ratios.liquidityratios.liqu3.value;
                }
                if (userParam.ratios.liquidityratios.liqu3) {
                    defaultParam.ratios.liquidityratios.netcurrentasset.value = userParam.ratios.liquidityratios.netcurrass.value;
                }
            }
            //leverage ratios
            if (userParam.ratios.financingratios) {
                if (userParam.ratios.financingratios.cirract) {
                    defaultParam.ratios.leverageratios.degreecirculatingasset.value = userParam.ratios.financingratios.cirract.value;
                }
                if (userParam.ratios.financingratios.fixass) {
                    defaultParam.ratios.leverageratios.percentagefixedasset.value = userParam.ratios.financingratios.fixass.value;
                }
                if (userParam.ratios.financingratios.lvldeb) {
                    defaultParam.ratios.leverageratios.debtratio.value = userParam.ratios.financingratios.lvldeb.value;
                }
                if (userParam.ratios.financingratios.lvlequ) {
                    defaultParam.ratios.leverageratios.equityratio.value = userParam.ratios.financingratios.lvlequ.value;
                }
                if (userParam.ratios.financingratios.lvlsel) {
                    defaultParam.ratios.leverageratios.selfinancingratio.value = userParam.ratios.financingratios.lvlsel.value;
                }
                if (userParam.ratios.financingratios.covfix) {
                    defaultParam.ratios.leverageratios.fixedassetcoverage.value = userParam.ratios.financingratios.covfix.value;
                }
            }
            //profitability ratios
            if (userParam.ratios.profitabilityratios) {
                if (userParam.ratios.profitabilityratios.profroi) {
                    defaultParam.ratios.profitabilityratios.profroi.value = userParam.ratios.profitabilityratios.profroi.value;
                }
                if (userParam.ratios.profitabilityratios.profroe) {
                    defaultParam.ratios.profitabilityratios.profroe.value = userParam.ratios.profitabilityratios.profroe.value;
                }
                if (userParam.ratios.profitabilityratios.profros) {
                    defaultParam.ratios.profitabilityratios.profros.value = userParam.ratios.profitabilityratios.profros.value;
                }
                if (userParam.ratios.profitabilityratios.profmol) {
                    defaultParam.ratios.profitabilityratios.profmol.value = userParam.ratios.profitabilityratios.profmol.value;
                }
                if (userParam.ratios.profitabilityratios.profebm) {
                    defaultParam.ratios.profitabilityratios.profebm.value = userParam.ratios.profitabilityratios.profebm.value;
                }
                if (userParam.ratios.profitabilityratios.profmon) {
                    defaultParam.ratios.profitabilityratios.profmon.value = userParam.ratios.profitabilityratios.profmon.value;
                }
            }
            //efficiency ratios
            if (userParam.ratios.efficiencyratios) {
                if (userParam.ratios.efficiencyratios.addedvalueperemployee) {
                    defaultParam.ratios.efficiencyratios.addedvalueperemployee.value = userParam.ratios.efficiencyratios.addedvalueperemployee.value;
                }
                if (userParam.ratios.efficiencyratios.revenueperemployee) {
                    defaultParam.ratios.efficiencyratios.revenueperemployee.value = userParam.ratios.efficiencyratios.revenueperemployee.value;
                }
                if (userParam.ratios.efficiencyratios.personnelcostperemployee) {
                    defaultParam.ratios.efficiencyratios.personnelcostperemployee.value = userParam.ratios.efficiencyratios.personnelcostperemployee.value;
                }
            }
        }

        return defaultParam;




    }

    /**
     * @description Verify the User Params
     * @Param {object} dialogparam: an object containing the parameters recovered from the dialog setting
     */
    verifyParam() {

        var defaultParam = this.initDialogParam();
        var userParam = this.dialogparam;

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
        if (userParam.version === defaultParam.version) {
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
            if (!userParam.balance.oc.reservesandprofits) {
                userParam.balance.oc.reservesandprofits = defaultParam.balance.oc.reservesandprofits;
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
        }

        if (userParam.version < defaultParam.version) {

            //Banana.console.debug(JSON.stringify(this.dialogparam));

            /*************************************************************************************
             * Change the parameters with those defined in the new version(26.01.2021: 1.0-->1.1)
             **************************************************************************************/

            //change the values with those defined ba the user, so the user dont lose the saved params
            //this.dialogparam = this.UpdateParamsData(defaultParam, userParam);

            /*************************************************************************************
             * Change the parameters with those defined in the new version(24.03.2021: 1.1-->1.2)
             **************************************************************************************/
            this.dialogparam = defaultParam;


            return true;
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
        let texts = this.initFinancialAnalysisTexts()
        var Docaccounts = this.loadAccounts();
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