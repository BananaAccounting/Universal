// @id = ch.banana.uni.stockohada.cump.endperiod
// @api = 1.0
// @pubdate = 2026-05-19
// @publisher = KIKSOFT ONLINE ACADEMY
// @description = 4. Gestion de stock OHADA - CUMP fin de période
// @description.en = 4. OHADA inventory management - Weighted average end of period
// @description.fr = 4. Gestion de stock OHADA - CUMP fin de période
// @description.it = 4. Gestione magazzino OHADA - CUMP a fine periodo
// @task = app.command
// @doctype = *

/*
========================================================
KIKSOFT ERP OHADA PRO
CUMP FIN DE PERIODE
VERSION STABLE BANANAPLUS
========================================================
*/

/*
========================================================
PARAMETRES
========================================================
*/

var param = JSON.parse(
    Banana.document.getScriptSettings() || "{}"
);

var company =
    param.company || "KIKSOFT ONLINE ACADEMY";

var currency =
    param.currency || "FCFA";

var reportTitle =
    param.reportTitle || "RAPPORT DE STOCK OHADA";

var STOCK_METHOD = "CUMP FIN PERIODE";

/*
========================================================
EXECUTION PRINCIPALE
========================================================
*/
function exec() {

    var doc = Banana.document;

    if (!doc)
        return;

    var param = JSON.parse(
        Banana.document.getScriptSettings() || "{}"
    );

    company =
        param.company || "KIKSOFT ONLINE ACADEMY";

    currency =
        param.currency || "FCFA";

    reportTitle =
        param.reportTitle || "RAPPORT DE STOCK OHADA";

    var report = createReport(doc);

    var stylesheet = createStyleSheet();

    Banana.Report.preview(report, stylesheet);
}
/*
========================================================
FENETRE PARAMETRES
========================================================
*/
function settingsDialog() {

    /*
    ================================================
    LIRE PARAMETRES ACTUELS
    ================================================
    */

    var currentParam = JSON.parse(
        Banana.document.getScriptSettings() || "{}"
    );

    /*
    ================================================
    NOM ENTREPRISE
    ================================================
    */

    var companyInput = Banana.Ui.getText(
        "Paramètres Rapport",
        "Nom de l'entreprise",
        currentParam.company || "KIKSOFT ONLINE ACADEMY"
    );

    if (companyInput === null)
        return;

    /*
    ================================================
    DEVISE
    ================================================
    */

    var currencyInput = Banana.Ui.getText(
        "Paramètres Rapport",
        "Devise",
        currentParam.currency || "FCFA"
    );

    if (currencyInput === null)
        return;

    /*
    ================================================
    TITRE RAPPORT
    ================================================
    */

    var titleInput = Banana.Ui.getText(
        "Paramètres Rapport",
        "Titre du rapport",
        currentParam.reportTitle || "RAPPORT DE STOCK OHADA"
    );

    if (titleInput === null)
        return;

    /*
    ================================================
    SAUVEGARDE
    ================================================
    */

    var paramToSave = {
        company: companyInput,
        currency: currencyInput,
        reportTitle: titleInput
    };

    Banana.document.setScriptSettings(
        JSON.stringify(paramToSave)
    );
}

/*
========================================================
CREATION RAPPORT
========================================================
*/

function createReport(doc) {

    var report = Banana.Report.newReport(
        "KIKSOFT ERP OHADA PRO"
    );

    addHeader(report);

    var data = calculateData(doc);

    addMainTable(report, data);

    addSummary(report, data);

    addFooter(report);

    return report;
}

/*
========================================================
EN-TETE
========================================================
*/

function addHeader(report) {

    var header = report.addTable("headerTable");

    var row = header.addRow();

    row.addCell(
        company,
        "logo"
    );

    row.addCell(
        reportTitle +
        "\nMETHODE " + STOCK_METHOD +
        "\nConforme aux normes OHADA",
        "title"
    );

    row.addCell(
        "Date : " +
        Banana.Converter.toLocaleDateFormat(new Date()) +
        "\nMéthode : " + STOCK_METHOD +
        "\nDevise : " + currency,
        "info"
    );

    report.addParagraph(" ", "normal");
}

/*
========================================================
CALCUL DONNEES
========================================================
*/

function calculateData(doc) {

    var table = doc.table("Transactions");

    if (!table)
        return [];

    var rows = table.rows;

    var result = [];

    /*
    =================================================
    STOCK GLOBAL (CUMP FIN DE PERIODE)
    =================================================
    */

    var totalQty = 0;
    var totalValue = 0;
    var cump = 0;

    /*
    =================================================
    PRE-CALCUL : CUMP FIN DE PERIODE
    =================================================
    */

    for (var i = 0; i < rows.length; i++) {

        var row = rows[i];

        var qtyIn = parseFloat(
            row.value("Quant Plus") ||
            row.value("QuantityPlus") ||
            row.value("QtyPlus") ||
            row.value("In") ||
            0
        );

        var unitPrice = parseFloat(
            row.value("Prix Unitaire") ||
            row.value("UnitPrice") ||
            row.value("Price") ||
            row.value("PU") ||
            0
        );

        if (qtyIn > 0) {
            totalQty += qtyIn;
            totalValue += qtyIn * unitPrice;
        }
    }

    /*
    =================================================
    CUMP FINAL
    =================================================
    */

    if (totalQty > 0) {
        cump = totalValue / totalQty;
    }

    /*
    =================================================
    RELECTURE POUR AFFICHAGE
    =================================================
    */

    var stockQty = 0;
    var stockValue = 0;

    for (var i = 0; i < rows.length; i++) {

        var row = rows[i];

        var date = row.value("Date");

        var description =
            row.value("Libellé") ||
            row.value("Description") ||
            "";

        var qtyIn = parseFloat(
            row.value("Quant Plus") ||
            row.value("QuantityPlus") ||
            row.value("QtyPlus") ||
            row.value("In") ||
            0
        );

        var qtyOut = parseFloat(
            row.value("Quant Minus") ||
            row.value("QuantityMinus") ||
            row.value("QtyMinus") ||
            row.value("Out") ||
            0
        );

        var entryQty = 0;
        var entryPU = 0;
        var entryTotal = 0;

        var exitQty = 0;
        var exitPU = 0;
        var exitTotal = 0;

        /*
        =================================================
        ENTREES
        =================================================
        */

        if (qtyIn > 0) {

            entryQty = qtyIn;

            entryPU = parseFloat(
                row.value("Prix Unitaire") ||
                row.value("UnitPrice") ||
                row.value("Price") ||
                row.value("PU") ||
                0
            );

            entryTotal = entryQty * entryPU;

            stockQty += qtyIn;
            stockValue += entryTotal;
        }

        /*
        =================================================
        SORTIES
        =================================================
        */

        if (qtyOut > 0) {

            exitQty = qtyOut;
            exitPU = cump;
            exitTotal = exitQty * cump;

            stockQty -= exitQty;
            stockValue -= exitTotal;
        }

        /*
        =================================================
        STOCK
        =================================================
        */

        var avgCost = cump;

        result.push({

            date: date,
            label: description,

            entryQty: entryQty,
            entryPU: entryPU,
            entryTotal: entryTotal,

            exitQty: exitQty,
            exitPU: exitPU,
            exitTotal: exitTotal,

            stockQty: stockQty,
            avgCost: avgCost,
            stockValue: stockQty * cump
        });
    }

    return result;
}

/*
========================================================
TABLEAU PRINCIPAL
========================================================
*/

function addMainTable(report, data) {

    var table = report.addTable("mainTable");

    /*
    ================================================
    EN-TETES
    ================================================
    */

    var row1 = table.addRow();

    row1.addCell("Date", "th");
    row1.addCell("Libellé", "th");

    row1.addCell("ENTREE\nQté", "th");
    row1.addCell("CU", "th");
    row1.addCell("Total", "th");

    row1.addCell("SORTIE\nQté", "th");
    row1.addCell("CU", "th");
    row1.addCell("Total", "th");

    row1.addCell("STOCK\nQté", "th");
    row1.addCell("CU Moyen", "th");
    row1.addCell("Valeur", "th");

    /*
    ================================================
    DONNEES
    ================================================
    */

    var totalEntry = 0;
    var totalExit = 0;
    var finalValue = 0;

    for (var i = 0; i < data.length; i++) {

        var d = data[i];

        var row = table.addRow();

        row.addCell(d.date, "td");
        row.addCell(d.label, "td");

        row.addCell(format(d.entryQty), "tdn");
        row.addCell(format(d.entryPU), "tdn");
        row.addCell(format(d.entryTotal), "tdn");

        row.addCell(format(d.exitQty), "tdn");
        row.addCell(format(d.exitPU), "tdn");
        row.addCell(format(d.exitTotal), "tdn");

        row.addCell(format(d.stockQty), "tdn");
        row.addCell(format(d.avgCost), "tdn");
        row.addCell(format(d.stockValue), "tdn");

        totalEntry += d.entryTotal;
        totalExit += d.exitTotal;
        finalValue = d.stockValue;
    }

    /*
    ================================================
    TOTAL GENERAL
    ================================================
    */

    var totalRow = table.addRow();

    totalRow.addCell(
        "TOTAL GENERAL",
        "total"
    );

    totalRow.addCell("", "total");

    totalRow.addCell("", "total");
    totalRow.addCell("", "total");

    totalRow.addCell(
        format(totalEntry),
        "total"
    );

    totalRow.addCell("", "total");
    totalRow.addCell("", "total");

    totalRow.addCell(
        format(totalExit),
        "total"
    );

    totalRow.addCell("", "total");
    totalRow.addCell("", "total");

    totalRow.addCell(
        format(finalValue),
        "total"
    );
}

/*
========================================================
RESUME
========================================================
*/

function addSummary(report, data) {

    if (data.length <= 0)
        return;

    var last = data[data.length - 1];

    report.addParagraph(" ", "normal");

    report.addParagraph(
        "RÉSUMÉ GÉNÉRAL",
        "summaryTitle"
    );

    report.addParagraph(
        "Stock Final Quantité : " +
        format(last.stockQty),
        "summary"
    );

    report.addParagraph(
        "Valeur Finale Stock : " +
        format(last.stockValue),
        "summary"
    );
}

/*
========================================================
PIED DE PAGE
========================================================
*/

function addFooter(report) {

    report.addParagraph(" ", "normal");

    report.addParagraph(
        "Méthode appliquée : " + STOCK_METHOD,
        "footer"
    );

    report.addParagraph(
        "Rapport conforme aux normes OHADA",
        "footer"
    );
}

/*
========================================================
FORMATAGE
========================================================
*/

function format(value) {

    return Banana.Converter.toLocaleNumberFormat(
        Number(value).toFixed(2)
    );
}

/*
========================================================
STYLE SHEET
========================================================
*/

function createStyleSheet() {

    var stylesheet = Banana.Report.newStyleSheet();

    /*
    ================================================
    TABLEAU PRINCIPAL
    ================================================
    */

    stylesheet.addStyle(
        ".mainTable",
        "width:100%; font-size:9pt;"
    );

    stylesheet.addStyle(
        ".mainTable td",
        "border:1px solid black; padding:4px;"
    );

    stylesheet.addStyle(
        ".mainTable th",
        "border:1px solid black;" +
        "background-color:#d9e1f2;" +
        "font-weight:bold;" +
        "text-align:center;" +
        "padding:4px;"
    );

    /*
    ================================================
    CELLULES
    ================================================
    */

    stylesheet.addStyle(
        ".td",
        "border:1px solid black;"
    );

    stylesheet.addStyle(
        ".tdn",
        "border:1px solid black; text-align:right;"
    );

    stylesheet.addStyle(
        ".total",
        "border:1px solid black;" +
        "font-weight:bold;" +
        "background-color:#eeeeee;"
    );

    /*
    ================================================
    HEADER
    ================================================
    */

    stylesheet.addStyle(
        ".headerTable",
        "width:100%; border:1px solid black;"
    );

    stylesheet.addStyle(
        ".headerTable td",
        "border:1px solid black; padding:8px;"
    );

    stylesheet.addStyle(
        ".logo",
        "font-size:16pt; font-weight:bold;"
    );

    stylesheet.addStyle(
        ".title",
        "font-size:18pt;" +
        "font-weight:bold;" +
        "text-align:center;"
    );

    stylesheet.addStyle(
        ".info",
        "font-size:10pt;"
    );

    /*
    ================================================
    RESUME
    ================================================
    */

    stylesheet.addStyle(
        ".summaryTitle",
        "font-size:14pt; font-weight:bold;"
    );

    stylesheet.addStyle(
        ".summary",
        "font-size:11pt;"
    );

    stylesheet.addStyle(
        ".footer",
        "font-size:9pt; font-style:italic;"
    );

    return stylesheet;
}
function settings() {

    settingsDialog();
}
