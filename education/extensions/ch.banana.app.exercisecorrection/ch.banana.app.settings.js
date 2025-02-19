// @id = ch.banana.app.settings
// @api = 1.0
// @pubdate = 2025-01-22
// @publisher = Banana.ch SA
// @description = 4. Settings
// @description.it = 4. Impostazioni
// @description.de = 4. Einstellungen
// @description.fr = 4. Paramètres
// @description.en = 4. Settings
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

    let printsettings = new PrintSettings(Banana.document, false);
    let lang = Banana.document.info("Base", "Language");

        if (!lang) {
            lang = "en";
        }

        // Load the texts based on the language code
        let texts = printsettings.loadTexts(lang);

    let teacherrow = Banana.document.table("Transactions").findRowByValue("Doc", "#");
    let teacherrowdescription = "";
    if (teacherrow) {
        teacherrowdescription = teacherrow.value("Description");
    }

        if (teacherrow === "undefined" || teacherrowdescription !== "teacherfile") {
            return Banana.application.addMessage(texts.changesettingsteacherfile);
        }

    
    return printsettings.result();
}

/**
 * Questa classe gestisce la logica ed i metodi per la creazione del report 
 * @param {*} banDocument 
 */

var PrintSettings = class PrintSettings {
    constructor(banDocument, isTest) {
        this.banDoc = banDocument;
        this.isTest = isTest;
    }

    result() {

        let lang = this.banDoc.info("Base", "Language");

        if (!lang) {
            lang = "en";
        }

        // Load the texts based on the language code
        let texts = this.loadTexts(lang);

        let paramcorrections = {};
        this.initParam(paramcorrections);
        this.verifyparam(paramcorrections);

        // Open the dialog and read the user parameters
        this.settingsDialog(texts, paramcorrections);

        return;

    }

    verifyparam(userParam) {

        if (!userParam.score) {
            userParam.score = true;
        }
        if (!userParam.datescore) {
            userParam.datescore = '1';
        }
        // verifica che è un numero
        if (!userParam.datescore.match(/^\d+$/)) {
            userParam.datescore = '1';
        }
        if (!userParam.debitaccountscore) {
            userParam.debitaccountscore = '1';
        }
        if (!userParam.debitaccountscore.match(/^\d+$/)) {
            userParam.debitaccountscore = '1';
        }
        if (!userParam.creditaccountscore) {
            userParam.creditaccountscore = '1';
        }
        if (!userParam.creditaccountscore.match(/^\d+$/)) {
            userParam.creditaccountscore = '1';
        }
        if (!userParam.amountscore) {
            userParam.amountscore = '1';
        }
        if (!userParam.amountscore.match(/^\d+$/)) {
            userParam.amountscore = '1';
        }
        if (!userParam.debitcreditaccountsscore) {
            userParam.debitcreditaccountsscore = false;
        }

        return userParam;
    }

    /* Function that converts parameters of the dialog */
    convertParam(userParam, texts) {

        let convertedParam = {};
        convertedParam.version = '1.0';
        convertedParam.data = []; /* array dei parametri dello script */

        //Score
        let currentParam = {};
        currentParam.name = 'score';
        currentParam.title = texts.noscore;
        currentParam.type = 'bool';
        currentParam.value = userParam.score ? true : false;
        currentParam.defaultvalue = true;
        currentParam.readValue = function () {
            userParam.score = this.value;
        }
        convertedParam.data.push(currentParam);

        //Date Score
        currentParam = {};
        currentParam.name = 'datescore';
        currentParam.title = texts.datescore;
        currentParam.type = 'string';
        currentParam.value = userParam.datescore ? userParam.datescore : '1';
        currentParam.defaultvalue = '1';
        currentParam.readValue = function () {
            userParam.datescore = this.value;
        }
        convertedParam.data.push(currentParam);

        //Credit Score
        currentParam = {};
        currentParam.name = 'debitaccountscore';
        currentParam.title = texts.debitaccountscore;
        currentParam.type = 'string';
        currentParam.value = userParam.debitaccountscore ? userParam.debitaccountscore : '1';
        currentParam.defaultvalue = '1';
        currentParam.readValue = function () {
            userParam.debitaccountscore = this.value;
        }
        convertedParam.data.push(currentParam);

        //Credit Score
        currentParam = {};
        currentParam.name = 'creditaccountscore';
        currentParam.title = texts.creditaccountscore;
        currentParam.type = 'string';
        currentParam.value = userParam.creditaccountscore ? userParam.creditaccountscore : '1';
        currentParam.defaultvalue = '1';
        currentParam.readValue = function () {
            userParam.creditaccountscore = this.value;
        }
        convertedParam.data.push(currentParam);

        //Amount Score
        currentParam = {};
        currentParam.name = 'amountpoints';
        currentParam.title = texts.amountscore;
        currentParam.type = 'string';
        currentParam.value = userParam.amountscore ? userParam.amountscore : '1';
        currentParam.defaultvalue = '1';
        currentParam.readValue = function () {
            userParam.amountscore = this.value;
        }
        convertedParam.data.push(currentParam);

        //Debit/Credit Score
        currentParam = {};
        currentParam.name = 'debitcreditaccountsscore';
        currentParam.title = texts.debitcreditaccountsscore;
        currentParam.type = 'bool';
        currentParam.value = userParam.debitcreditaccountsscore ? true : false;
        currentParam.defaultvalue = true;
        currentParam.readValue = function () {
            userParam.debitcreditaccountsscore = this.value;
        }
        convertedParam.data.push(currentParam);

        return convertedParam;
    }

    /* Function that initializes the user parameters */
    initParam(paramcorrections) {
        let userParam = {};
        userParam.score = true;
        userParam.datescore = '1';
        userParam.debitaccountscore = '1';
        userParam.creditaccountscore = '1';
        userParam.amountscore = '1';
        userParam.debitcreditaccountsscore = true;

        return userParam;
    }

    // AGGIUNTO PARTE PER IMPOSTAZIONI CON PROPERTY SHEET

    /*Update script's parameters*/
    settingsDialog(texts, paramcorrections) {

        let userParam = this.initParam(paramcorrections);

        let savedParam = this.banDoc.getScriptSettings("paramcorrections");
        if (savedParam.length > 0) {
            userParam = JSON.parse(savedParam);
        }
        userParam = this.verifyparam(userParam);

        Banana.console.log("paramcorrections: " + JSON.stringify(userParam, null, 2));

        // Open the dialog

        if (typeof (Banana.Ui.openPropertyEditor) !== 'undefined') {
            var dialogTitle = 'Settings';
            var convertedParam = this.convertParam(userParam, texts);
            var pageAnchor = 'dlgSettings';
            if (!Banana.Ui.openPropertyEditor(dialogTitle, convertedParam, pageAnchor))
                return;
            for (var i = 0; i < convertedParam.data.length; i++) {
                // Read values to param (through the readValue function)
                convertedParam.data[i].readValue();
            }
        }

        // Save updated script's parameters
        var paramToString = JSON.stringify(userParam);
        var value = this.banDoc.setScriptSettings("paramcorrections", paramToString);
    }

    // FINE PARTE PER IMPOSTAZIONI CON PROPERTY SHEET

    /* Function that loads all the default texts used for the dialog and the report  */
    loadTexts(lang) {

        let texts = {};

        if (lang === "de") {
            texts.language = "Sprache";
            texts.datescore = "Datum Punkte";
            texts.debitaccountscore = "Debitorenkonto Punkte";
            texts.creditaccountscore = "Kreditorenkonto Punkte";
            texts.amountscore = "Betrag Punkte";
            texts.debitcreditaccountsscore = "Debitoren-/Kreditorenkonto separat berechnen?";
            texts.noscore = "Punkte";
            texts.changesettingsteacherfile = "Dieser Befehl kann nur in der Lehrerdatei verwendet werden.";
            texts.isnotteacherfile = "Die zu importierende Datei ist keine Lehrerdatei. Bitte wählen Sie eine Lehrerdatei zum Importieren in die Schülerdatei.";
            texts.isnotstudentfile = "Die Ausgangsdatei ist keine Schülerdatei. Bitte öffnen Sie eine Schülerdatei.";
        }
        else if (lang === "fr") {
            texts.language = "Langue";
            texts.datescore = "Date Score";
            texts.debitaccountscore = "Compte débiteur Score";
            texts.creditaccountscore = "Compte créditeur Score";
            texts.amountscore = "Montant Score";
            texts.debitcreditaccountsscore = "Comptes débiteur/créditeur calculés séparément?";
            texts.noscore = "Score";
            texts.changesettingsteacherfile = "Cette commande ne peut être utilisée que dans le fichier enseignant.";
            texts.isnotteacherfile = "Le fichier à importer n'est pas un fichier enseignant. Veuillez sélectionner un fichier enseignant à importer dans le fichier étudiant";
            texts.isnotstudentfile = "Le fichier initial n'est pas le fichier de l'étudiant. Veuillez ouvrir un fichier d'étudiant.";
        }
        else if (lang === "it") {
            texts.language = "Lingua";
            texts.datescore = "Data Punteggio";
            texts.debitaccountscore = "Conto Debitore Punteggio";
            texts.creditaccountscore = "Conto Creditore Punteggio";
            texts.amountscore = "Importo Punteggio";
            texts.debitcreditaccountsscore = "Conti Debitore/Creditore calcolati separati?";
            texts.noscore = "Punteggio";
            texts.changesettingsteacherfile = "Questo comando può essere utilizzato solo nel file dell'insegnante.";
            texts.isnotteacherfile = "Il file da importare non è un file dell'insegnante. Selezionare un file dell'insegnante da importare nel file dello studente.";
            texts.isnotstudentfile = "Il file iniziale non è il file dello studente. Si prega di aprire un file studente.";
        }
        else { //lang === en
            texts.language = "Language";
            texts.datescore = "Date Score";
            texts.debitaccountscore = "Debit Account Score";
            texts.creditaccountscore = "Credit Account Score";
            texts.amountscore = "Amount Score";
            texts.debitcreditaccountsscore = "Debit/Credit Accounts calculated separately?";
            texts.noscore = "Score";
            texts.changesettingsteacherfile = "This command can only be used in the teacher file.";
            texts.isnotteacherfile = "The file to be imported is not a teacher file. Please select a teacher file to import in the student file.";
            texts.isnotstudentfile = "The initial file is not the student file. Please open a student file.";
        }

        return texts;
    }
}