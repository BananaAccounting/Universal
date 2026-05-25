// @api = 1.0
// @id = ch.banana.uni.investment.accounting.chart
// @description = Charts
// @task = app.command
// @doctype = 100.*
// @publisher = Aaron Ploszaj
// @pubdate = 2026-05-14
// @inputdatasource = none
// @timeout = -1
// @includejs = ch.banana.portfolio.accounting.calculation.methods.js

function exec() {
    Banana.console.debug("exec called");
    var dialog = Banana.Ui.createQml("Portfolio dashboard", "qml/main.qml");
    dialog.exec();
}

function previewPortfolioDashboardReport(banDoc) {
    if (!banDoc)
        return;

    let dashboard = getPortfolioDashboardData(banDoc);
    let report = Banana.Report.newReport("Portfolio dashboard");
    getReportHeader(report, getDocumentInfo(banDoc));

    addDashboardReportTitle(report, dashboard);
    addDashboardKpiReportTable(report, dashboard);
    addDashboardAllocationReportTable(report, dashboard.currencies, "Currency allocation");
    addDashboardAllocationReportTable(report, dashboard.accounts, "Account allocation");
    addDashboardTopHoldingsReportTable(report, dashboard);

    for (let i = 0; i < dashboard.topHoldings.length; i++) {
        let holding = dashboard.topHoldings[i];
        let history = getSecurityAverageCostHistory(banDoc, holding.item);
        if (history && history.hasData) {
            report.addPageBreak();
            addAverageCostHistoryReportTable(report, history);
        }
    }

    Banana.Report.preview(report, getDashboardReportStyle());
}

function addDashboardReportTitle(report, dashboard) {
    let table = report.addTable("dashboardTitleTable");
    table.addColumn("Title");
    let row = table.addRow();
    row.addCell("Portfolio dashboard - " + dashboard.asOfDate + " - " + dashboard.baseCurrency, "styleDashboardTitle");
}

function addDashboardKpiReportTable(report, dashboard) {
    let table = report.addTable("dashboardKpiTable");
    table.addColumn("Metric").setStyleAttributes("width:25%");
    table.addColumn("Value").setStyleAttributes("width:25%");
    table.addColumn("Metric").setStyleAttributes("width:25%");
    table.addColumn("Value").setStyleAttributes("width:25%");

    addDashboardReportHeaderRow(table, ["Metric", "Value", "Metric", "Value"]);
    addDashboardReportRow(table, ["Market value", dashboard.totals.marketValueFmt, "Book value", dashboard.totals.bookValueFmt]);
    addDashboardReportRow(table, ["Unrealized G/L", dashboard.totals.unrealizedGainLossFmt, "Unrealized G/L %", dashboard.totals.unrealizedGainLossPercentFmt]);
    addDashboardReportRow(table, ["Securities", String(dashboard.totals.securitiesCount), "Missing prices", String(dashboard.totals.missingPricesCount)]);
    addDashboardReportRow(table, ["Currencies", String(dashboard.totals.currenciesCount), "Accounts", String(dashboard.totals.accountsCount)]);
}

function addDashboardAllocationReportTable(report, data, title) {
    let table = report.addTable(title.replace(/\s/g, ""));
    table.getCaption().addText(title, "styleTitles");
    table.addColumn("Name").setStyleAttributes("width:20%");
    table.addColumn("Weight").setStyleAttributes("width:12%");
    table.addColumn("Chart").setStyleAttributes("width:28%");
    table.addColumn("Market value").setStyleAttributes("width:20%");
    table.addColumn("Unrealized G/L").setStyleAttributes("width:20%");

    addDashboardReportHeaderRow(table, ["Name", "Weight", "Chart", "Market value", "Unrealized G/L"]);

    for (let i = 0; i < data.length; i++) {
        const rowData = data[i];
        addDashboardReportRow(table, [
            rowData.name,
            rowData.weightPercentFmt,
            getDashboardAsciiBar(rowData.weightPercent, 24),
            rowData.marketValueFmt,
            rowData.unrealizedGainLossFmt + " (" + rowData.gainLossPercentFmt + ")"
        ]);
    }
}

function addDashboardTopHoldingsReportTable(report, dashboard) {
    let table = report.addTable("dashboardTopHoldingsTable");
    table.getCaption().addText("Top holdings", "styleTitles");
    table.addColumn("Security").setStyleAttributes("width:28%");
    table.addColumn("Currency").setStyleAttributes("width:10%");
    table.addColumn("Weight").setStyleAttributes("width:10%");
    table.addColumn("Market value").setStyleAttributes("width:18%");
    table.addColumn("Base value").setStyleAttributes("width:18%");
    table.addColumn("Unrealized G/L").setStyleAttributes("width:16%");

    addDashboardReportHeaderRow(table, ["Security", "Currency", "Weight", "Market value", "Base value", "Unrealized G/L"]);

    for (let i = 0; i < dashboard.topHoldings.length; i++) {
        const holding = dashboard.topHoldings[i];
        addDashboardReportRow(table, [
            holding.description + " (" + holding.item + ")",
            holding.currency,
            holding.weightPercentFmt,
            holding.marketValueCurrencyFmt,
            holding.marketValueBaseFmt,
            holding.unrealizedGainLossBaseFmt + " (" + holding.unrealizedGainLossPercentFmt + ")"
        ]);
    }
}

function addAverageCostHistoryReportTable(report, history) {
    let table = report.addTable("avgCostHistory_" + history.item);
    table.getCaption().addText("Average cost history - " + history.description + " (" + history.item + ")", "styleTitles");
    table.addColumn("Date").setStyleAttributes("width:15%");
    table.addColumn("Average cost").setStyleAttributes("width:15%");
    table.addColumn("Quantity").setStyleAttributes("width:15%");
    table.addColumn("Chart").setStyleAttributes("width:35%");
    table.addColumn("Description").setStyleAttributes("width:20%");

    addDashboardReportHeaderRow(table, ["Date", "Average cost", "Quantity", "Chart", "Description"]);

    for (let i = 0; i < history.points.length; i++) {
        const point = history.points[i];
        addDashboardReportRow(table, [
            point.dateFmt,
            point.valueFmt + " " + history.currency,
            point.quantityFmt,
            getDashboardValueBar(point.value, history.minValue, history.maxValue, 30),
            point.description
        ]);
    }
}

function addDashboardReportHeaderRow(table, labels) {
    let row = table.getHeader().addRow();
    for (let i = 0; i < labels.length; i++)
        row.addCell(labels[i], "styleTablesHeaderText");
}

function addDashboardReportRow(table, values) {
    let row = table.addRow();
    for (let i = 0; i < values.length; i++)
        row.addCell(values[i] || "", i > 0 ? "styleNormalAmount" : "");
}

function getDashboardAsciiBar(percent, length) {
    let value = parseFloat(percent || "0");
    if (value < 0)
        value = 0;
    if (value > 100)
        value = 100;

    let filled = Math.round(value * length / 100);
    let bar = "";
    for (let i = 0; i < length; i++)
        bar += i < filled ? "#" : ".";
    return bar;
}

function getDashboardValueBar(value, minValue, maxValue, length) {
    if (maxValue === minValue)
        return getDashboardAsciiBar(100, length);
    let percent = ((value - minValue) / (maxValue - minValue)) * 100;
    return getDashboardAsciiBar(percent, length);
}

function getDashboardReportStyle() {
    let stylesheet = getReportStyle();
    stylesheet.addStyle(".styleDashboardTitle").setAttribute("font-weight", "bold");
    stylesheet.addStyle(".styleDashboardTitle").setAttribute("font-size", "14pt");
    stylesheet.addStyle(".styleDashboardTitle").setAttribute("color", "#17313b");
    stylesheet.addStyle(".styleDashboardTitle").setAttribute("padding-bottom", "6px");
    stylesheet.addStyle("table.dashboardKpiTable").setAttribute("padding-bottom", "8px");
    return stylesheet;
}
