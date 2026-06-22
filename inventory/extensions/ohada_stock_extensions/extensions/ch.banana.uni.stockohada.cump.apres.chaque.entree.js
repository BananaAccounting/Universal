// @id = ch.banana.uni.stockohada.cump.afterentry
// @api = 1.0
// @pubdate = 2026-05-19
// @publisher = KIKSOFT ONLINE ACADEMY
// @description = 3. Gestion de stock OHADA - CUMP après chaque entrée
// @description.en = 3. OHADA inventory management - Weighted average after each entry
// @description.fr = 3. Gestion de stock OHADA - CUMP après chaque entrée
// @description.it = 3. Gestione magazzino OHADA - CUMP dopo ogni entrata
// @task = app.command
// @doctype = *

/*
========================================================
KIKSOFT ERP OHADA PRO
METHODE CUMP MOBILE
(COUT UNITAIRE MOYEN PONDERE APRES CHAQUE ENTREE)
========================================================
*/

var STOCK_METHOD = "CUMP MOBILE";

function exec() {

    var doc = Banana.document;

    if (!doc)
        return;

    var report = createReport(doc);

    var stylesheet = createStyleSheet();

    Banana.Report.preview(report, stylesheet);
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
==================================================
HEADER DYNAMIQUE COMPLET BANANA
==================================================
*/

function addHeader(report) {

    /*
    ==========================================
    DONNEES BASE FICHIER
    ==========================================
    */

    var company =
        Banana.document.info(
            "Base",
            "Company"
        );

    var headerLeft =
        Banana.document.info(
            "Base",
            "HeaderLeft"
        );

    var headerRight =
        Banana.document.info(
            "Base",
            "HeaderRight"
        );

    /*
    ==========================================
    DONNEES ADRESSE
    ==========================================
    */

    var courtesy =
        Banana.document.info(
            "Address",
            "Courtesy"
        );

    var address1 =
        Banana.document.info(
            "Address",
            "Address1"
        );

    var address2 =
        Banana.document.info(
            "Address",
            "Address2"
        );

    var city =
        Banana.document.info(
            "Address",
            "Locality"
        );

    var region =
        Banana.document.info(
            "Address",
            "Region"
        );

    var country =
        Banana.document.info(
            "Address",
            "Country"
        );

    var phone =
        Banana.document.info(
            "Address",
            "Phone"
        );

    var email =
        Banana.document.info(
            "Address",
            "Email"
        );

    var web =
        Banana.document.info(
            "Address",
            "Web"
        );

    /*
    ==========================================
    VALEURS PAR DEFAUT
    ==========================================
    */

    if (!company)
        company = "KIKSOFT";

    if (!headerLeft)
        headerLeft = company;

    if (!headerRight)
        headerRight = "STOCK OHADA";

    /*
    ==========================================
    TABLE HEADER
    ==========================================
    */

    var header = report.addTable(
        "headerTable"
    );

    var row = header.addRow();

    /*
    ==========================================
    COLONNE GAUCHE
    ==========================================
    */

    var leftText = "";

    leftText += headerLeft;

    if (courtesy)
        leftText += "\n" + courtesy;

    if (phone)
        leftText += "\nTél : " + phone;

    if (email)
        leftText += "\nEmail : " + email;

    row.addCell(
        leftText,
        "logo"
    );

    /*
    ==========================================
    COLONNE CENTRALE
    ==========================================
    */

    row.addCell(

        "RAPPORT DE STOCK OHADA\n" +

        "METHODE CUMP\n" +

        "Après chaque entrée",

        "title"
    );

    /*
    ==========================================
    COLONNE DROITE
    ==========================================
    */

    var rightText = "";

    rightText += headerRight;

    if (address1)
        rightText += "\n" + address1;

    if (address2)
        rightText += "\n" + address2;

    if (city)
        rightText += "\n" + city;

    if (region)
        rightText += "\n" + region;

    if (country)
        rightText += "\n" + country;

    if (web)
        rightText += "\n" + web;

    rightText +=
        "\nMéthode : CUMP Mobile";

    rightText +=
        "\nDevise : FCFA";

    row.addCell(
        rightText,
        "info"
    );

    report.addParagraph(" ");
}

/*
========================================================
CALCUL DONNEES CUMP MOBILE
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
    VARIABLES STOCK
    =================================================
    */

    var stockQty = 0;
    var stockValue = 0;
    var avgCost = 0;

    for (var i = 0; i < rows.length; i++) {

        var row = rows[i];

        /*
        =================================================
        RECUPERATION FLEXIBLE DES COLONNES BANANA
        =================================================
        */

        var date =
            row.value("Date");

        var description =
            row.value("Libellé") ||
            row.value("Description") ||
            row.value("Descrizione") ||
            "";

        /*
        -------------------------------------------------
        QUANTITE ENTREE
        -------------------------------------------------
        */

        var qtyIn = parseFloat(

            row.value("Quant Plus") ||

            row.value("QuantityPlus") ||

            row.value("QtyPlus") ||

            row.value("In") ||

            0
        );

        /*
        -------------------------------------------------
        QUANTITE SORTIE
        -------------------------------------------------
        */

        var qtyOut = parseFloat(

            row.value("Quant Minus") ||

            row.value("QuantityMinus") ||

            row.value("QtyMinus") ||

            row.value("Out") ||

            0
        );

        /*
        -------------------------------------------------
        PRIX UNITAIRE
        -------------------------------------------------
        */

        var unitPrice = parseFloat(

            row.value("Prix Unitaire") ||

            row.value("UnitPrice") ||

            row.value("Price") ||

            row.value("PU") ||

            0
        );

        /*
        =================================================
        VARIABLES MOUVEMENT
        =================================================
        */

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

            entryPU = unitPrice;

            entryTotal =
                qtyIn * unitPrice;

            /*
            =============================================
            MISE A JOUR STOCK
            =============================================
            */

            stockQty += qtyIn;

            stockValue += entryTotal;

            /*
            =============================================
            NOUVEAU CUMP APRES ENTREE
            =============================================
            */

            if (stockQty > 0) {

                avgCost =
                    stockValue / stockQty;
            }
        }

        /*
        =================================================
        SORTIES
        =================================================
        */

        if (qtyOut > 0) {

            exitQty = qtyOut;

            /*
            =============================================
            SORTIE AU CUMP COURANT
            =============================================
            */

            exitPU = avgCost;

            exitTotal =
                exitQty * exitPU;

            /*
            =============================================
            MISE A JOUR STOCK
            =============================================
            */

            stockQty -= exitQty;

            stockValue -= exitTotal;

            /*
            =============================================
            RECALCUL CUMP
            =============================================
            */

            if (stockQty > 0) {

                avgCost =
                    stockValue / stockQty;
            }
            else {

                avgCost = 0;
            }
        }

        /*
        =================================================
        AJOUT RESULTAT
        =================================================
        */

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
            stockValue: stockValue
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
        "Méthode appliquée : " +
        STOCK_METHOD,
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
