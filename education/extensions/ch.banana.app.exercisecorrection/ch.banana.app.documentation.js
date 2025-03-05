// @id = ch.banana.app.documentation
// @api = 1.0
// @pubdate = 2025-02-26
// @publisher = Banana.ch SA
// @description = 5. Documentation
// @description.it = 5. Documentazione
// @description.de = 5. Dokumentation
// @description.fr = 5. Documentation
// @description.en = 5. Documentation
// @doctype = 100
// @docproperties =
// @task = app.command
// @timeout = -1
// @includejs = ch.banana.app.functions.js
// @includejs = ch.banana.app.settings.js

function exec() {

    //Check if we are on an opened document
    if (!Banana.document) { return; }

    //Check if the table exist: if not, the script's execution will stop
    if (!Banana.document.table('Transactions')) {
        return;
    }

    let printdoc = new PrintDoc(Banana.document, false);
    let doc = printdoc.documentation();

    return doc;
}

/**
 * Questa classe gestisce la logica ed i metodi per la creazione del report 
 * @param {*} banDocument 
 */

var PrintDoc = class PrintDoc {
    constructor(banDocument, isTest) {
        this.banDoc = banDocument;
        this.isTest = isTest;
    }

    documentation() {

        let lang = this.banDoc.info("Base", "Language");

        let printsettings = new PrintSettings(this.banDoc1, this.isTest);
        // Load the texts based on the language code
        let texts = printsettings.loadTexts(lang);

        Banana.Ui.showHelp('ch.banana.app.exercisecorrection');
        return;
    }
}