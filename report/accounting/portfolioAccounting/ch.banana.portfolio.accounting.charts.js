// @api = 1.0
// @id = ch.banana.portfolio.accounting.dashboard
// @description = Portfolio Dashboard
// @task = app.command
// @doctype = 100.*
// @publisher = Aaron Ploszaj
// @pubdate = 2026-05-14
// @inputdatasource = none
// @timeout = -1
// @includejs = ch.banana.portfolio.accounting.calculation.methods.js

/**
 * Entry point registered in Banana. It opens the QML dashboard dialog.
 */
function exec() {
    Banana.console.debug("exec called");
    var dialog = Banana.Ui.createQml("Portfolio dashboard", "qml/main.qml");
    dialog.exec();
}

/**
 * Builds the printable dashboard report and opens the Banana report preview.
 * From the preview the user can print or export the report as PDF.
 */
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

/**
 * Adds a compact title row with report date and base currency.
 */
function addDashboardReportTitle(report, dashboard) {
    let table = report.addTable("dashboardTitleTable");
    table.addColumn("Title");
    let row = table.addRow();
    row.addCell("Portfolio dashboard - " + dashboard.asOfDate + " - " + dashboard.baseCurrency, "styleDashboardTitle");
}

/**
 * Adds the main KPI grid: market value, book value, G/L, counts and missing prices.
 */
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

/**
 * Adds either the currency or account allocation table.
 */
function addDashboardAllocationReportTable(report, data, title) {
    let table = report.addTable(title.replace(/\s/g, ""));
    table.getCaption().addText(title, "styleTitles");
    table.addColumn("Name").setStyleAttributes("width:25%");
    table.addColumn("Weight").setStyleAttributes("width:15%");
    table.addColumn("Market value").setStyleAttributes("width:30%");
    table.addColumn("Unrealized G/L").setStyleAttributes("width:30%");

    addDashboardReportHeaderRow(table, ["Name", "Weight", "Market value", "Unrealized G/L"]);

    for (let i = 0; i < data.length; i++) {
        const rowData = data[i];
        addDashboardReportRow(table, [
            rowData.name,
            rowData.weightPercentFmt,
            rowData.marketValueFmt,
            rowData.unrealizedGainLossFmt + " (" + rowData.gainLossPercentFmt + ")"
        ]);
    }
}

/**
 * Adds the largest holdings currently shown in the QML dashboard.
 */
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

/**
 * Adds the printable average-cost history for a single security.
 * The visual chart is inserted above this table as an SVG image.
 */
function addAverageCostHistoryReportTable(report, history) {
    let chartImage = getAverageCostHistorySvgDataUri(history, 900, 360);
    if (chartImage) {
        report.addImage(chartImage, "18cm", "7.2cm", "styleDashboardChart");
    }

    let table = report.addTable("avgCostHistory_" + history.item);
    table.getCaption().addText("Average cost history - " + history.description + " (" + history.item + ")", "styleTitles");
    table.addColumn("Date").setStyleAttributes("width:20%");
    table.addColumn("Average cost").setStyleAttributes("width:20%");
    table.addColumn("Quantity").setStyleAttributes("width:20%");
    table.addColumn("Description").setStyleAttributes("width:40%");

    addDashboardReportHeaderRow(table, ["Date", "Average cost", "Quantity", "Description"]);

    for (let i = 0; i < history.points.length; i++) {
        const point = history.points[i];
        addDashboardReportRow(table, [
            point.dateFmt,
            point.valueFmt + " " + history.currency,
            point.quantityFmt,
            point.description
        ]);
    }
}

/**
 * Creates an inline SVG data URI with the average-cost line chart.
 * Banana.Report.addImage() can embed svg images from data URI strings.
 */
function getAverageCostHistorySvgDataUri(history, width, height) {
    if (!history || !history.points || history.points.length < 1)
        return "";

    let svg = getAverageCostHistorySvg(history, width, height);
    return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}

/**
 * Builds the SVG markup for the average-cost line chart.
 */
function getAverageCostHistorySvg(history, width, height) {
    const points = history.points || [];
    const leftPad = 70;
    const rightPad = 28;
    const topPad = 44;
    const bottomPad = 54;
    const chartW = width - leftPad - rightPad;
    const chartH = height - topPad - bottomPad;
    let minValue = parseFloat(history.minValue || "0");
    let maxValue = parseFloat(history.maxValue || "0");

    if (maxValue === minValue) {
        maxValue = maxValue + 1;
        minValue = Math.max(0, minValue - 1);
    }

    const yPadding = (maxValue - minValue) * 0.12;
    const axisYMin = Math.max(0, minValue - yPadding);
    const axisYMax = maxValue + yPadding;
    const axisXMin = 1;
    const axisXMax = Math.max(points.length, 2);

    let polyline = "";
    let yGrid = "";
    let circles = "";
    let valueLabels = "";

    for (let g = 0; g <= 4; g++) {
        const y = topPad + chartH * g / 4;
        const value = axisYMax - ((axisYMax - axisYMin) * g / 4);
        yGrid += "<line x1=\"" + leftPad + "\" y1=\"" + y + "\" x2=\"" + (leftPad + chartW) + "\" y2=\"" + y + "\" stroke=\"#d8dee6\" stroke-width=\"1\" opacity=\"0.65\"/>";
        yGrid += "<text x=\"" + (leftPad - 10) + "\" y=\"" + (y + 4) + "\" font-family=\"Arial, sans-serif\" font-size=\"10\" text-anchor=\"end\" fill=\"#687385\">" + escapeSvgText(formatAverageCostChartAxisValue(value)) + "</text>";
    }

    for (let i = 0; i < points.length; i++) {
        const x = getAverageCostChartX(i, points.length, leftPad, chartW, axisXMin, axisXMax);
        const y = getAverageCostChartY(points[i].value, axisYMin, axisYMax, topPad, chartH);
        const label = points[i].valueFmt || String(points[i].value || "0");
        let labelY = y - 10;
        if (labelY < topPad + 10)
            labelY = y + 18;
        labelY = Math.min(topPad + chartH - 4, labelY);

        polyline += x + "," + y + " ";
        circles += "<circle cx=\"" + x + "\" cy=\"" + y + "\" r=\"3.5\" fill=\"#147d7e\" stroke=\"#ffffff\" stroke-width=\"1\"/>";
        valueLabels += "<text x=\"" + x + "\" y=\"" + labelY + "\" font-family=\"Arial, sans-serif\" font-size=\"10\" text-anchor=\"middle\" fill=\"#17202a\">" + escapeSvgText(label) + "</text>";
    }

    const first = points[0];
    const last = points[points.length - 1];
    const title = "Average cost history - " + history.description + " (" + history.item + ")";
    const latest = "Latest: " + history.latestValueFmt + " - Qty " + history.latestQuantityFmt;

    return "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"" + width + "\" height=\"" + height + "\" viewBox=\"0 0 " + width + " " + height + "\">"
        + "<text x=\"" + leftPad + "\" y=\"24\" font-family=\"Arial, sans-serif\" font-size=\"18\" font-weight=\"700\" fill=\"#17202a\">" + escapeSvgText(title) + "</text>"
        + "<text x=\"" + leftPad + "\" y=\"40\" font-family=\"Arial, sans-serif\" font-size=\"12\" fill=\"#687385\">" + escapeSvgText(latest) + "</text>"
        + yGrid
        + "<line x1=\"" + leftPad + "\" y1=\"" + topPad + "\" x2=\"" + leftPad + "\" y2=\"" + (topPad + chartH) + "\" stroke=\"#d8dee6\" stroke-width=\"1\"/>"
        + "<line x1=\"" + leftPad + "\" y1=\"" + (topPad + chartH) + "\" x2=\"" + (leftPad + chartW) + "\" y2=\"" + (topPad + chartH) + "\" stroke=\"#d8dee6\" stroke-width=\"1\"/>"
        + "<polyline points=\"" + polyline + "\" fill=\"none\" stroke=\"#147d7e\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/>"
        + circles
        + valueLabels
        + "<text x=\"" + leftPad + "\" y=\"" + (height - 18) + "\" font-family=\"Arial, sans-serif\" font-size=\"11\" fill=\"#687385\">" + escapeSvgText(first.dateFmt || "") + "</text>"
        + "<text x=\"" + (leftPad + chartW) + "\" y=\"" + (height - 18) + "\" font-family=\"Arial, sans-serif\" font-size=\"11\" text-anchor=\"end\" fill=\"#687385\">" + escapeSvgText(last.dateFmt || "") + "</text>"
        + "</svg>";
}

/**
 * Calculates the x coordinate using the same ordinal x-axis used by the QML chart.
 */
function getAverageCostChartX(index, pointsCount, leftPad, chartW, axisMin, axisMax) {
    const xValue = index + 1;
    if (axisMax <= axisMin)
        return leftPad + chartW / 2;
    return leftPad + ((xValue - axisMin) / (axisMax - axisMin)) * chartW;
}

/**
 * Formats y-axis values similarly to the QML chart labels.
 */
function formatAverageCostChartAxisValue(value) {
    return Banana.Converter.toLocaleNumberFormat(String(value || "0"), 2, true);
}

/**
 * Calculates the y coordinate for one chart point.
 */
function getAverageCostChartY(value, minValue, maxValue, topPad, chartH) {
    return topPad + chartH - ((parseFloat(value || "0") - minValue) / (maxValue - minValue)) * chartH;
}

/**
 * Escapes values written into SVG text nodes.
 */
function escapeSvgText(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

/**
 * Adds a standard report header row with the extension table header style.
 */
function addDashboardReportHeaderRow(table, labels) {
    let row = table.getHeader().addRow();
    for (let i = 0; i < labels.length; i++)
        row.addCell(labels[i], "styleTablesHeaderText");
}

/**
 * Adds a standard report data row and right-aligns value columns.
 */
function addDashboardReportRow(table, values) {
    let row = table.addRow();
    for (let i = 0; i < values.length; i++)
        row.addCell(values[i] || "", i > 0 ? "styleNormalAmount" : "");
}

/**
 * Extends the shared report stylesheet with styles specific to the dashboard PDF.
 */
function getDashboardReportStyle() {
    let stylesheet = getReportStyle();
    stylesheet.addStyle(".styleDashboardTitle").setAttribute("font-weight", "bold");
    stylesheet.addStyle(".styleDashboardTitle").setAttribute("font-size", "14pt");
    stylesheet.addStyle(".styleDashboardTitle").setAttribute("color", "#17313b");
    stylesheet.addStyle(".styleDashboardTitle").setAttribute("padding-bottom", "6px");
    stylesheet.addStyle(".styleDashboardChart").setAttribute("margin-bottom", "6px");
    stylesheet.addStyle("table.dashboardKpiTable").setAttribute("padding-bottom", "8px");
    return stylesheet;
}
