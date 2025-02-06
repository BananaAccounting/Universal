// @id = ch.banana.app.recalculatetotal
// @api = 1.0
// @pubdate = 2025-02-06
// @publisher = Banana.ch SA
// @description = 2. Recalculate the total
// @description.it = 2. Ricalcola il totale
// @description.de = 2. Gesamtbetrag neu berechnen
// @description.fr = 2. Recalculer le total
// @description.en = 2. Recalculate the total
// @doctype = 100
// @docproperties = accountingteachingassistant
// @task = app.command
// @timeout = -1
// @includejs = ch.banana.app.functions.js


function exec() {

    if (!verifyBananaAdvancedVersion()) {
        return "@Cancel";
    }

    //Check if we are on an opened document
    if (!Banana.document) { return; }

    //Check if the table exist: if not, the script's execution will stop
    if (!Banana.document.table('Transactions')) {
        return;
    }

    let execute = new PrintReport(Banana.document, false);
    let jsonDoc = execute.recalculatetotal();

    return jsonDoc;
}

/**
 * Questa classe gestisce la logica ed i metodi per la creazione del report 
 * @param {*} banDocument 
 */

var PrintReport = class PrintReport {
    constructor(banDocument1, isTest) {
        this.banDoc1 = banDocument1;
        this.isTest = isTest;
    }

    recalculatetotal() {

        let documentChange = { "format": "documentChange", "error": "", "data": [] };
        let jsonDocRows = initDocument(this.isTest);

        // Sum all the scores in the transactions table
        let score = 0.0;
        for (let i = 0; i < this.banDoc1.table("Transactions").rowCount; i++) {
            if (this.banDoc1.table("Transactions").row(i).value("Description") === "Total score:") {
                continue;
            }
            score = Number(score) + Number(this.banDoc1.table("Transactions").row(i).value("AdjustedScore"));
        }

        //rows operation for adding the total of the scores at the end of the document

        let totalscorerow = this.banDoc1.table("Transactions").findRowByValue("Description", "Total score:");
        // save the row number of the total score
        let totalrow = totalscorerow.rowNr;

        // row for the total score
        let rows = [];
        let row = {};
        row.operation = {};
        row.operation.name = 'modify';
        row.operation.sequence = totalrow.toString();
        row.style = { "fontSize": 0, "bold": true };
        //row fields
        row.fields = {};
        row.fields["Section"] = "auto";
        row.fields["Description"] = "Total score: ";
        row.fields["AdjustedScore"] = Banana.Converter.toInternalNumberFormat(score);
        rows.push(row);

        //table for the operations
        let dataUnitTransactions = {};
        dataUnitTransactions.nameXml = 'Transactions';

        //data for rows
        dataUnitTransactions.data = {};
        dataUnitTransactions.data.rowLists = [];
        dataUnitTransactions.data.rowLists.push({ 'rows': rows });
        jsonDocRows.document.dataUnits.push(dataUnitTransactions);
        documentChange["data"].push(jsonDocRows);

        return documentChange;
    }
}