// @id = ch.banana.app.recalculatetotal
// @api = 1.0
// @pubdate = 2025-02-26
// @publisher = Banana.ch SA
// @description = 2. Recalculate the total
// @description.it = 2. Ricalcola il totale
// @description.de = 2. Gesamtbetrag neu berechnen
// @description.fr = 2. Recalculer le total
// @description.en = 2. Recalculate the total
// @doctype = 100
// @docproperties =
// @task = app.command
// @timeout = -1
// @includejs = ch.banana.app.functions.js
// @includejs = ch.banana.app.settings.js
// @includejs = ch.banana.app.correctexercises.js


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

    let printsettings = new PrintSettings(Banana.document, false);
    let correctdoc = new CorrectDoc(Banana.document, Banana.document, false);

    let execute = new PrintReport(Banana.document, false, correctdoc, printsettings);
    let jsonDoc = execute.recalculatetotal();

    return jsonDoc;
}

/**
 * This class handles the logic and methods required to generate reports.
 * @param {*} banDocument 
 */

var PrintReport = class PrintReport {
    constructor(banDocument1, isTest, correctdoc, printsettings) {
        this.banDoc = banDocument1;
        this.isTest = isTest;
        this.correctdoc = correctdoc;
        this.printsettings = printsettings
    }

    recalculatetotal() {

        let lang = this.banDoc.info("Base", "Language");

        // Load the texts based on the language code
        let texts = this.printsettings.loadTexts(lang);

        let studentrow = this.banDoc.table("Transactions").findRowByValue("Doc", "Student");
        // if the import file is not a teacher file, show a error message
        if (studentrow === "undefined" || !studentrow) {
            Banana.application.addMessage(texts.isnotstudentfile);
            return;
        }

        let flag = false;

        for (let i = 0; i < this.banDoc.table("Transactions").rowCount; i++) {
            if (this.banDoc.table("Transactions").row(i).value("TAuto") === "automaticcorrection") {
                flag = true;
                continue;
            }
        }

        if (flag) {

            let documentChange = { "format": "documentChange", "error": "", "data": [] };
            let jsonDocRows = initDocument(this.isTest);

            // Sum all the scores in the transactions table
            let score = 0.0;
            for (let i = 0; i < this.banDoc.table("Transactions").rowCount; i++) {
                if (this.banDoc.table("Transactions").row(i).value("Description") === "Total score:") {
                    continue;
                }
                if (this.banDoc.table("Transactions").row(i).value("TAdjustedScore") === "") {
                    continue;
                }
                score = Number(score) + Number(this.banDoc.table("Transactions").row(i).value("TAdjustedScore"));
            }

            //rows operation for adding the total of the scores at the end of the document

            let totalscorerow = this.banDoc.table("Transactions").findRowByValue("Description", "Total score:");
            if (!totalscorerow) {
                return Banana.application.addMessage(texts.nototalscore);
            }
            let totalrow;
            if (this.isTest) {
                totalrow = '0';
            }
            else {
                // save the row number of the total score
                totalrow = totalscorerow.rowNr;
            }

            // row for the total score
            let rows = [];
            let row = {};
            row.operation = {};
            row.operation.name = 'modify';
            row.operation.sequence = totalrow.toString();
            row.style = { "fontSize": 0, "bold": true };
            //row fields
            row.fields = {};
            row.fields["TAuto"] = "automaticcorrection";
            row.fields["Description"] = "Total score: ";
            row.fields["TAdjustedScore"] = Banana.Converter.toInternalNumberFormat(score);
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

        else {
            return Banana.application.addMessage(texts.noautomaticcorrection);
        }
    }
}