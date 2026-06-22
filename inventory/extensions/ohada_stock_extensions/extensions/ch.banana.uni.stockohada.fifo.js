// @id = ch.banana.uni.stockohada.fifo
// @api = 1.0
// @pubdate = 2026-05-19
// @publisher = KIKSOFT ONLINE ACADEMY
// @description = 1. Fiche de stock OHADA - FIFO
// @description.en = 1. OHADA stock card - FIFO
// @description.fr = 1. Fiche de stock OHADA - FIFO
// @description.it = 1. Scheda magazzino OHADA - FIFO
// @task = app.command
// @doctype = *

var STOCK_METHOD = "FIFO";

function exec() {

    var doc = Banana.document;

    if (!doc)
        return;

    var report = createReport(doc);

    var stylesheet = createStyleSheet();

    Banana.Report.preview(report, stylesheet);
}

/*
==================================================
REPORT
==================================================
*/

function createReport(doc) {

    var report = Banana.Report.newReport(
        "KIKSOFT ERP OHADA PRO"
    );

    addHeader(report);

    var data = calculateData(doc);

    addMainTable(report, data);

    addSummary(report, data);

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

        "METHODE FIFO\n" +

        "Conforme aux normes OHADA",

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
        "\nMéthode : FIFO";

    rightText +=
        "\nDevise : FCFA";

    row.addCell(
        rightText,
        "info"
    );

    report.addParagraph(" ");
}
/*
==================================================
CALCUL FIFO PAR LOTS
==================================================
*/

function calculateData(doc) {

    var table = doc.table("Transactions");

    if (!table)
        return [];

    var rows = table.rows;

    var result = [];

    var fifoLayers = [];

    var lotIndex = 1;

    for (var i = 0; i < rows.length; i++) {

        var row = rows[i];

        var date =
            row.value("Date");

        var description =
            row.value("Libellé") ||
            row.value("Description") ||
            "";

        /*
        ==============================================
        QUANTITE ENTREE
        ==============================================
        */

        var qtyIn = parseFloat(

            row.value("Quant Plus") ||

            row.value("QuantityPlus") ||

            row.value("QtyPlus") ||

            row.value("In") ||

            0
        );

        /*
        ==============================================
        QUANTITE SORTIE
        ==============================================
        */

        var qtyOut = parseFloat(

            row.value("Quant Minus") ||

            row.value("QuantityMinus") ||

            row.value("QtyMinus") ||

            row.value("Out") ||

            0
        );

        /*
        ==============================================
        PRIX UNITAIRE
        ==============================================
        */

        var unitPrice = parseFloat(

            row.value("Prix Unitaire") ||

            row.value("UnitPrice") ||

            row.value("Price") ||

            row.value("PU") ||

            0
        );

        /*
        ==========================================================
        ENTREE FIFO
        ==========================================================
        */

        if (qtyIn > 0) {

            var lotName =
                "Lot " +
                String.fromCharCode(64 + lotIndex);

            fifoLayers.push({

                lot: lotName,
                qty: qtyIn,
                price: unitPrice
            });

            /*
            ==========================================
            AFFICHER TOUS LES LOTS
            ==========================================
            */

            for (var j = 0; j < fifoLayers.length; j++) {

                var layer = fifoLayers[j];

                var currentStockPU =
                    layer.price;

                var currentStockValue =
                    layer.qty * layer.price;

                result.push({

                    date: date,

                    label:
                        (j === fifoLayers.length - 1)
                        ? description
                        : "",

                    lot: layer.lot,

                    entryQty:
                        (j === fifoLayers.length - 1)
                        ? qtyIn
                        : 0,

                    entryPU:
                        (j === fifoLayers.length - 1)
                        ? unitPrice
                        : 0,

                    entryTotal:
                        (j === fifoLayers.length - 1)
                        ? qtyIn * unitPrice
                        : 0,

                    exitQty: 0,
                    exitPU: 0,
                    exitTotal: 0,

                    stockQty: layer.qty,

                    stockPU: currentStockPU,

                    stockValue: currentStockValue
                });
            }

            lotIndex++;
        }

        /*
        ==========================================================
        SORTIE FIFO
        ==========================================================
        */

        if (qtyOut > 0) {

            var qtyToConsume = qtyOut;

            while (
                qtyToConsume > 0 &&
                fifoLayers.length > 0
            ) {

                var layer = fifoLayers[0];

                var consumedQty = 0;

                /*
                ======================================
                LOT VIDE COMPLETEMENT
                ======================================
                */

                if (
                    layer.qty <= qtyToConsume
                ) {

                    consumedQty = layer.qty;

                    qtyToConsume -= layer.qty;

                    layer.qty = 0;
                }

                /*
                ======================================
                SORTIE PARTIELLE
                ======================================
                */

                else {

                    consumedQty = qtyToConsume;

                    layer.qty -= qtyToConsume;

                    qtyToConsume = 0;
                }

                var exitTotal =
                    consumedQty * layer.price;

                /*
                ======================================
                CU STOCK = 0 SI LOT VIDE
                ======================================
                */

                var currentStockPU =
                    layer.price;

                if (layer.qty <= 0) {

                    currentStockPU = 0;
                }

                /*
                ======================================
                VALEUR STOCK
                ======================================
                */

                var currentStockValue =
                    layer.qty * currentStockPU;

                /*
                ======================================
                AJOUT LIGNE SORTIE
                ======================================
                */

                result.push({

                    date: date,

                    label: description,

                    lot: layer.lot,

                    entryQty: 0,
                    entryPU: 0,
                    entryTotal: 0,

                    exitQty: consumedQty,
                    exitPU: layer.price,
                    exitTotal: exitTotal,

                    stockQty: layer.qty,

                    stockPU: currentStockPU,

                    stockValue: currentStockValue
                });

                /*
                ======================================
                SUPPRESSION LOT VIDE
                ======================================
                */

                if (layer.qty <= 0) {

                    fifoLayers.shift();
                }
            }
        }
    }

    return result;
}

/*
==================================================
TABLEAU
==================================================
*/

function addMainTable(report, data) {

    var table = report.addTable("mainTable");

    var row = table.addRow();

    row.addCell("Date", "th");
    row.addCell("Libellé", "th");
    row.addCell("Lot", "th");

    row.addCell("ENTREE Qté", "th");
    row.addCell("CU", "th");
    row.addCell("Total", "th");

    row.addCell("SORTIE Qté", "th");
    row.addCell("CU", "th");
    row.addCell("Total", "th");

    row.addCell("STOCK Qté", "th");
    row.addCell("CU Stock", "th");
    row.addCell("Valeur", "th");

    var totalEntry = 0;
    var totalExit = 0;

    for (var i = 0; i < data.length; i++) {

        var d = data[i];

        var r = table.addRow();

        r.addCell(d.date, "td");
        r.addCell(d.label, "td");
        r.addCell(d.lot, "td");

        r.addCell(format(d.entryQty), "tdn");
        r.addCell(format(d.entryPU), "tdn");
        r.addCell(format(d.entryTotal), "tdn");

        r.addCell(format(d.exitQty), "tdn");
        r.addCell(format(d.exitPU), "tdn");
        r.addCell(format(d.exitTotal), "tdn");

        r.addCell(format(d.stockQty), "tdn");

        r.addCell(
            d.stockPU > 0
            ? format(d.stockPU)
            : "",
            "tdn"
        );

        r.addCell(format(d.stockValue), "tdn");

        totalEntry += d.entryTotal;
        totalExit += d.exitTotal;
    }

    /*
    ==============================================
    TOTAL GENERAL FIFO MULTI-LOTS
    CORRECTION :
    PRENDRE UNIQUEMENT LES DERNIERS LOTS
    EN STOCK
    ==============================================
    */

    var finalStockQty = 0;
    var finalStockValue = 0;

    /*
    ----------------------------------------------
    IDENTIFIER LA DERNIERE DATE
    ----------------------------------------------
    */

    var lastDate = "";

    for (var x = data.length - 1; x >= 0; x--) {

        if (data[x].stockQty > 0) {

            lastDate = data[x].date;
            break;
        }
    }

    /*
    ----------------------------------------------
    ADDITIONNER UNIQUEMENT
    LES LOTS DE LA DERNIERE DATE
    ----------------------------------------------
    */

    for (var k = 0; k < data.length; k++) {

        var line = data[k];

        if (
            line.date === lastDate &&
            line.stockQty > 0
        ) {

            finalStockQty += line.stockQty;

            finalStockValue += line.stockValue;
        }
    }

    /*
    ----------------------------------------------
    CREATION LIGNE TOTAL
    ----------------------------------------------
    */

    var totalRow = table.addRow();

    totalRow.addCell(
        "TOTAL GENERAL",
        "total"
    );

    totalRow.addCell("", "total");
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

    /*
    ----------------------------------------------
    STOCK FINAL
    ----------------------------------------------
    */

    totalRow.addCell(
        format(finalStockQty),
        "total"
    );

    /*
    PAS DE CU TOTAL FIFO
    */

    totalRow.addCell(
        "",
        "total"
    );

    totalRow.addCell(
        format(finalStockValue),
        "total"
    );
}

/*
==================================================
RESUME
==================================================
*/

function addSummary(report, data) {

    if (data.length <= 0)
        return;

    /*
    ==============================================
    CORRECTION RESUME FINAL
    ==============================================
    */

    var finalStockQty = 0;
    var finalStockValue = 0;

    var lastDate = "";

    for (var x = data.length - 1; x >= 0; x--) {

        if (data[x].stockQty > 0) {

            lastDate = data[x].date;
            break;
        }
    }

    for (var i = 0; i < data.length; i++) {

        if (
            data[i].date === lastDate &&
            data[i].stockQty > 0
        ) {

            finalStockQty += data[i].stockQty;

            finalStockValue += data[i].stockValue;
        }
    }

    report.addParagraph(" ");

    report.addParagraph(
        "RÉSUMÉ GÉNÉRAL",
        "summaryTitle"
    );

    report.addParagraph(
        "Stock Final Quantité : " +
        format(finalStockQty),
        "summary"
    );

    report.addParagraph(
        "Valeur Finale Stock : " +
        format(finalStockValue),
        "summary"
    );
}

/*
==================================================
FORMAT
==================================================
*/

function format(v) {

    return Banana.Converter.toLocaleNumberFormat(
        Number(v).toFixed(2)
    );
}

/*
==================================================
STYLE
==================================================
*/

function createStyleSheet() {

    var s = Banana.Report.newStyleSheet();

    s.addStyle(
        ".mainTable",
        "width:100%; font-size:9pt;"
    );

    s.addStyle(
        ".mainTable td",
        "border:1px solid black; padding:4px;"
    );

    s.addStyle(
        ".mainTable th",
        "border:1px solid black; background-color:#d9e1f2; font-weight:bold; text-align:center;"
    );

    s.addStyle(
        ".tdn",
        "text-align:right;"
    );

    s.addStyle(
        ".total",
        "font-weight:bold; background-color:#eeeeee;"
    );

    s.addStyle(
        ".headerTable",
        "width:100%; border:1px solid black;"
    );

    s.addStyle(
        ".headerTable td",
        "border:1px solid black; padding:8px;"
    );

    s.addStyle(
        ".logo",
        "font-size:16pt; font-weight:bold;"
    );

    s.addStyle(
        ".title",
        "font-size:18pt; font-weight:bold; text-align:center;"
    );

    s.addStyle(
        ".info",
        "font-size:10pt;"
    );

    s.addStyle(
        ".summaryTitle",
        "font-size:14pt; font-weight:bold;"
    );

    return s;
}
