// @id = ch.banana.app.correctexercises
// @api = 1.0
// @pubdate = 2025-02-06
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
    return execute.deletecorrections();
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

    deletecorrections() {

        let documentChange = { "format": "documentChange", "error": "", "data": [] };
        let jsonDocRowsDelete = initDocument(this.isTest);
        let jsonDocRowsModify = initDocument(this.isTest);

        //rows
        let row = {};
        let rowsdelete = [];
        let rowsmodify = [];

        for (let i = 0; i < this.banDoc1.table("Transactions").rowCount; i++) {

            //row operation
            row = {};
            row.operation = {};


            if (this.banDoc1.table("Transactions").row(i).value("Section") === "teachingassistant") {

                // delete row to add the score and the maxscore to the transactions

                row.operation.name = 'delete';
                row.operation.sequence = i.toString();

                rowsdelete.push(row);
            }
            else {
                if (this.banDoc1.table("Transactions").row(i).value("Doc") !== "Student") {
                row.style = { "fontSize": 0, "bold": false, "background-color": "#ffffff" };
                }
                row.operation.name = 'modify';
                row.operation.sequence = i.toString();
                row.fields = {};
                row.fields["Section"] = this.banDoc1.table("Transactions").row(i).value("Section");
                row.fields["Date"] = this.banDoc1.table("Transactions").row(i).value("Date");
                row.fields["Doc"] = this.banDoc1.table("Transactions").row(i).value("Doc");
                row.fields["Description"] = this.banDoc1.table("Transactions").row(i).value("Description");
                row.fields["AccountDebit"] = this.banDoc1.table("Transactions").row(i).value("AccountDebit");
                row.fields["AccountCredit"] = this.banDoc1.table("Transactions").row(i).value("AccountCredit");
                row.fields["Amount"] = this.banDoc1.table("Transactions").row(i).value("Amount");
                row.fields["MaxScore"] = "";
                row.fields["AutoScore"] = "";
                row.fields["AdjustedScore"] = "";
                row.fields["CorrectionsNotes"] = "";


                rowsmodify.push(row);
            }
            Banana.console.log(JSON.stringify(row));
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

}