// @id = ch.banana.app.recalculatetotal
// @api = 1.0
// @pubdate = 2025-01-22
// @publisher = Banana.ch SA
// @description = 5. Documentation
// @description.it = 5. Documentazione
// @description.de = 5. Dokumentation
// @description.fr = 5. Documentation
// @description.en = 5. Documentation
// @doctype = 100
// @docproperties = accountingteachingassistant
// @task = app.command
// @timeout = -1

//Check if the version of Banana Accounting is compatible
function verifyBananaAdvancedVersion() {
    if (!Banana.document)
        return false;

    if (!Banana.application.license || Banana.application.license.licenseType !== "advanced") {
        var msg = "This extension requires Banana Accounting+ Advanced";
        Banana.document.addMessage(msg, "ID_ERR_LICENSE_NOTVALID");
        return false;
    }

    return true;
}

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

    let printdoc = new PrintDoc();
    let doc = printdoc.documentation();

    return doc;
}

/**
 * Questa classe gestisce la logica ed i metodi per la creazione del report 
 * @param {*} banDocument 
 */

var PrintDoc = class PrintDoc {
    constructor() {
    }

    documentation() {

        Banana.Ui.showHelp('ch.banana.app.exercisecorrection');
        return;
    }
}