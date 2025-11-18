// @id = ch.banana.app.correctexercises
// @api = 1.0
// @pubdate = 2025-10-07
// @publisher = Banana.ch SA
// @description = 3. Delete the corrections
// @description.it = 3. Elimina le correzioni
// @description.de = 3. Löschen Sie die Korrekturen
// @description.fr = 3. Supprimer les corrections
// @description.en = 3. Delete the corrections
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

    let execute = new DeleteCorrections(Banana.document, false, printsettings);

    return execute.deletecorrections();
}

/**
 * This class handles the logic and methods required to generate reports.
 * @param {*} banDocument 
 */

var DeleteCorrections = class DeleteCorrections {
    constructor(banDocument, isTest, printsettings) {
        this.banDoc = banDocument;
        this.isTest = isTest;
        this.printsettings = printsettings;
    }

    deletecorrections() {

        let lang;
        lang = this.banDoc.info("Base", "Language");


        // Load the texts based on the language code
        let texts = this.printsettings.loadTexts(lang);

        let flag = false;
        let studentfile = this.banDoc;

        // if the file is not a test, check if it is a student file

        var studentrow = studentfile.table("Transactions").findRowByValue("Doc", "Student");

        // if the import file is not a teacher file, show a error message
        if (studentrow === "undefined" || !studentrow) {
            Banana.application.addMessage(texts.isnotstudentfile);
            return;
        }

        // check if there are corrections to delete

        for (let i = 0; i < studentfile.table("Transactions").rowCount; i++) {
            if (studentfile.table("Transactions").row(i).value("TAuto") === "automaticcorrection") {
                flag = true;
                continue;
            }
        }

        if (flag) {

            let documentChange = { "format": "documentChange", "error": "", "data": [] };
            let jsonDocRowsDelete = initDocument(this.isTest);
            let jsonDocRowsModify = initDocument(this.isTest);

            //rows
            let row = {};
            let rowsdelete = [];
            let rowsmodify = [];

            for (let i = 0; i < studentfile.table("Transactions").rowCount; i++) {

                //row operation
                row = {};
                row.operation = {};


                if (studentfile.table("Transactions").row(i).value("TAuto") === "automaticcorrection") {

                    // delete row to add the score and the maxscore to the transactions

                    row.operation.name = 'delete';
                    row.operation.sequence = i.toString();

                    rowsdelete.push(row);
                }
                else {
                    if (studentfile.table("Transactions").row(i).value("Doc") !== "Student") {
                        row.style = { "fontSize": 0, "bold": false, "background-color": "#ffffff" };
                    }
                    row.operation.name = 'modify';
                    row.operation.sequence = i.toString();
                    row.fields = {};
                    row.fields["TAuto"] = studentfile.table("Transactions").row(i).value("TAuto");
                    row.fields["Date"] = studentfile.table("Transactions").row(i).value("Date");
                    row.fields["Doc"] = studentfile.table("Transactions").row(i).value("Doc");
                    row.fields["Description"] = studentfile.table("Transactions").row(i).value("Description");
                    row.fields["AccountDebit"] = studentfile.table("Transactions").row(i).value("AccountDebit");
                    row.fields["AccountCredit"] = studentfile.table("Transactions").row(i).value("AccountCredit");
                    row.fields["Amount"] = studentfile.table("Transactions").row(i).value("Amount");
                    row.fields["TMaxScore"] = "";
                    row.fields["TAutoScore"] = "";
                    row.fields["TAdjustedScore"] = "";
                    row.fields["TCorrectionsNotes"] = "";


                    rowsmodify.push(row);
                }
            }


            //table for the operations
            let dataUnitTransactions = {};
            dataUnitTransactions.nameXml = 'Transactions';
            dataUnitTransactions.data = {};
            dataUnitTransactions.data.rowLists = [];
            dataUnitTransactions.data.rowLists.push({ 'rows': rowsdelete });
            jsonDocRowsDelete.document.dataUnits.push(dataUnitTransactions);
            documentChange["data"].push(jsonDocRowsDelete);

            //table for the operations
            dataUnitTransactions = {};
            dataUnitTransactions.nameXml = 'Transactions';
            dataUnitTransactions.data = {};
            dataUnitTransactions.data.rowLists = [];
            dataUnitTransactions.data.rowLists.push({ 'rows': rowsmodify });
            jsonDocRowsModify.document.dataUnits.push(dataUnitTransactions);
            documentChange["data"].push(jsonDocRowsModify);

            return documentChange;
        }

        else {
            return Banana.application.addMessage(texts.nocorrections);
        }
    }
}