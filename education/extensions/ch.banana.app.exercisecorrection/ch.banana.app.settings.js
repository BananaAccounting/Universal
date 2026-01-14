// @id = ch.banana.app.settings
// @api = 1.0
// @pubdate = 2025-10-07
// @publisher = Banana.ch SA
// @description = 4. Settings
// @description.it = 4. Impostazioni
// @description.de = 4. Einstellungen
// @description.fr = 4. Paramètres
// @description.en = 4. Settings
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

    let printsettings = new PrintSettings(Banana.document, false);

    return printsettings.result();
}

/**
 * This class handles the logic and methods required to generate reports.
 * @param {*} banDocument 
 */

var PrintSettings = class PrintSettings {
    constructor(banDocument, isTest) {
        this.banDoc = banDocument;
        this.isTest = isTest;
    }

    result() {

        let lang = this.banDoc.info("Base", "Language");

        // Load the texts based on the language code
        let texts = this.loadTexts(lang);

        let teacherrow = this.banDoc.table("Transactions").findRowByValue("Doc", "#");
        let teacherrowdescription = "";
        if (teacherrow) {
            teacherrowdescription = teacherrow.value("Description");
        }

        if (teacherrow === "undefined" || teacherrowdescription !== "teacherfile") {
            return Banana.application.addMessage(texts.changesettingsteacherfile);
        }


        let paramcorrections = {};
        this.initParam(paramcorrections);
        this.verifyparam(paramcorrections);

        if (!this.isTest) {
            // Open the dialog and read the user parameters
            this.settingsDialog(texts, paramcorrections);
        }

        return;

    }

    verifyparam(userParam) {

        if (typeof userParam.score === undefined) {
            userParam.score = true;
        }
        if (!userParam.datescore) {
            userParam.datescore = '1';
        }
        // Verify that the value is a number
        if (!userParam.datescore.match(/^\d+(\.\d+)?$/)) {
            userParam.datescore = '1';
        }
        if (!userParam.debitaccountscore) {
            userParam.debitaccountscore = '1';
        }
        if (!userParam.debitaccountscore.match(/^\d+(\.\d+)?$/)) {
            userParam.debitaccountscore = '1';
        }
        if (!userParam.creditaccountscore) {
            userParam.creditaccountscore = '1';
        }
        if (!userParam.creditaccountscore.match(/^\d+(\.\d+)?$/)) {
            userParam.creditaccountscore = '1';
        }
        if (typeof userParam.debitcreditaccountsscore === undefined) {
            userParam.debitcreditaccountsscore = false;
        }
        if (!userParam.amountscore) {
            userParam.amountscore = '1';
        }
        if (!userParam.amountscore.match(/^\d+(\.\d+)?$/)) {
            userParam.amountscore = '1';
        }
        if (!userParam.vatcodescore) {
            userParam.vatcodescore = '0';
        }
        if (!userParam.vatcodescore.match(/^\d+(\.\d+)?$/)) {
            userParam.vatcodescore = '0';
        }
        if (!userParam.amountcurrencyscore) {
            userParam.amountcurrencyscore = '0';
        }
        if (!userParam.amountcurrencyscore.match(/^\d+(\.\d+)?$/)) {
            userParam.amountcurrencyscore = '0';
        }
        if (!userParam.exchangecurrencyscore) {
            userParam.exchangecurrencyscore = '0';
        }
        if (!userParam.exchangecurrencyscore.match(/^\d+(\.\d+)?$/)) {
            userParam.exchangecurrencyscore = '0';
        }
        if (!userParam.exchangeratescore) {
            userParam.exchangeratescore = '0';
        }
        if (!userParam.exchangeratescore.match(/^\d+(\.\d+)?$/)) {
            userParam.exchangeratescore = '0';
        }
        if (typeof userParam.amountonlyifaccountsok === undefined) {
            userParam.amountonlyifaccountsok = false;
        }

        return userParam;
    }

    /* Function that converts parameters of the dialog */
    convertParam(userParam, texts) {

        let convertedParam = {};
        convertedParam.version = '1.0';
        convertedParam.data = []; /* Array containing the script parameters */

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

        //Amount Score
        currentParam = {};
        currentParam.name = 'amountscore';
        currentParam.title = texts.amountscore;
        currentParam.type = 'string';
        currentParam.value = userParam.amountscore ? userParam.amountscore : '1';
        currentParam.defaultvalue = '1';
        currentParam.readValue = function () {
            userParam.amountscore = this.value;
        }
        convertedParam.data.push(currentParam);

        //VAT Code Score
        currentParam = {};
        currentParam.name = 'vatcodescore';
        currentParam.title = texts.vatcodescore;
        currentParam.type = 'string';
        currentParam.value = userParam.vatcodescore ? userParam.vatcodescore : '0';
        currentParam.defaultvalue = '0';
        currentParam.readValue = function () {
            userParam.vatcodescore = this.value;
        }
        convertedParam.data.push(currentParam);

        //Amount Currency Score
        currentParam = {};
        currentParam.name = 'amountcurrencyscore';
        currentParam.title = texts.amountcurrencyscore;
        currentParam.type = 'string';
        currentParam.value = userParam.amountcurrencyscore ? userParam.amountcurrencyscore : '0';
        currentParam.defaultvalue = '0';
        currentParam.readValue = function () {
            userParam.amountcurrencyscore = this.value;
        }
        convertedParam.data.push(currentParam);

        //Exchange Currency Score
        currentParam = {};
        currentParam.name = 'exchangecurrencyscore';
        currentParam.title = texts.exchangecurrencyscore;
        currentParam.type = 'string';
        currentParam.value = userParam.exchangecurrencyscore ? userParam.exchangecurrencyscore : '0';
        currentParam.defaultvalue = '0';
        currentParam.readValue = function () {
            userParam.exchangecurrencyscore = this.value;
        }
        convertedParam.data.push(currentParam);

        //Exchange Rate Score
        currentParam = {};
        currentParam.name = 'exchangeratescore';
        currentParam.title = texts.exchangeratescore;
        currentParam.type = 'string';
        currentParam.value = userParam.exchangeratescore ? userParam.exchangeratescore : '0';
        currentParam.defaultvalue = '0';
        currentParam.readValue = function () {
            userParam.exchangeratescore = this.value;
        }
        convertedParam.data.push(currentParam);

        //Amount only if Debit e Credit accounts are correct
        currentParam = {};
        currentParam.name = 'amountonlyifaccountsok';
        currentParam.title = texts.amountonlyifaccountsok;
        currentParam.type = 'bool';
        currentParam.value = userParam.amountonlyifaccountsok ? true : false;
        currentParam.defaultvalue = false;
        currentParam.readValue = function () {
            userParam.amountonlyifaccountsok = this.value;
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
        userParam.debitcreditaccountsscore = true;
        userParam.amountscore = '1';
        userParam.vatcodescore = '0';
        userParam.amountcurrencyscore = '0';
        userParam.exchangecurrencyscore = '0';
        userParam.exchangeratescore = '0';
        userParam.amountonlyifaccountsok = false;

        return userParam;
    }

    /*Update script's parameters*/
    settingsDialog(texts, paramcorrections) {

        let userParam = this.initParam(paramcorrections);

        let savedParam = this.banDoc.getScriptSettings("paramcorrections");
        if (savedParam.length > 0) {
            userParam = JSON.parse(savedParam);
        }
        userParam = this.verifyparam(userParam);

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

    /* Function that loads all the default texts used for the dialog and the report  */
    loadTexts(lang) {

        let texts = {};

        if (lang === "deu") {
            texts.language = "Sprache";
            texts.datescore = "Punkte für korrektes Datum";
            texts.debitaccountscore = "Punkte für korrektes Sollkonto";
            texts.creditaccountscore = "Punkte für korrektes Habenkonto";
            texts.amountscore = "Punkte für korrekten Betrag";
            texts.debitcreditaccountsscore = "Falls Soll- oder Habenkonto nicht korrekt keine Punkte vergeben";
            texts.noscore = "Punktebewertung aktivieren";
            texts.changesettingsteacherfile = "Dieser Befehl kann nur in der Lehrerdatei verwendet werden.";
            texts.isnotteacherfile = "Die zu importierende Datei ist keine Lehrerdatei. Bitte wählen Sie für den Import in die Schülerdatei eine Lehrdatei aus.";
            texts.isnotstudentfile = "Die Ausgangsdatei ist keine Schülerdatei. Bitte öffnen Sie eine Schülerdatei.";
            texts.isnotfile = "Die Datei wurde noch nicht angepasst. Bitte öffnen Sie eine bereits angepasste Datei.";
            texts.nocorrections = "Es gibt keine Korrekturen zum Löschen";
            texts.noautomaticcorrection = "Es gibt keine automatischen Korrekturen zum Neuberechnen";
            texts.nochanges = "Die Datei ist bereits für einen bestimmten Zweck konfiguriert.";
            texts.alreadycorrected = "Die Datei wurde bereits korrigiert";
            texts.vatcodescore = "MwSt. Code Punkte";
            texts.filenumbermismatch = "Die Dateitypen des Lehrer- und Schülerdokuments stimmen nicht überein (MwSt., Mehrwährung). Bitte verwenden Sie die gleichen Dateitypen.";
            texts.exchangeratescore = "Wechselkurs Punkte";
            texts.amountcurrencyscore = "Betrag Währung Punkte";
            texts.exchangecurrencyscore = "Währung Punkte";
            texts.student = "Schüler";
            texts.teacher = "Lehrer";
            texts.preparefile = "Datei Vorbereitung";
            texts.choosefile = "Datei zum Vorbereiten auswählen";
            texts.auto = "Auto";
            texts.maxscore = "Maximale Punktzahl";
            texts.autoscore = "Automatische Punktzahl";
            texts.adjustedscore = "Angepasste Punktzahl";
            texts.correctionsnotes = "Korrekturanmerkungen";
            texts.nototalscore = "Die Datei enthält keine Punkte.";
            texts.amountonlyifaccountsok = "Der Strafbetrag wird nur dann erhoben, wenn Soll und Haben korrekt sind.";
        }
        else if (lang === "fra") {
            texts.language = "Langue";
            texts.datescore = "Points pour la date correcte";
            texts.debitaccountscore = "Points pour le compte débité correct";
            texts.creditaccountscore = "Points pour le compte crédité correct";
            texts.amountscore = "Points pour le montant correct";
            texts.debitcreditaccountsscore = "Comptes débité et crédité séparés ?";
            texts.noscore = "Évaluation par points";
            texts.changesettingsteacherfile = "Cette commande ne peut être utilisée que dans le fichier enseignant.";
            texts.isnotteacherfile = "Le fichier à importer n'est pas un fichier enseignant. Veuillez sélectionner un fichier enseignant pour l'importation dans le fichier étudiant.";
            texts.isnotstudentfile = "Le fichier source n'est pas un fichier étudiant. Veuillez ouvrir un fichier étudiant.";
            texts.isnotfile = "Le fichier n'a pas encore été adapté. Veuillez ouvrir un fichier déjà adapté.";
            texts.nocorrections = "Il n'y a pas de corrections à supprimer";
            texts.noautomaticcorrection = "Il n'y a pas de corrections automatiques à recalculer";
            texts.nochanges = "Le fichier est déjà configuré pour un usage spécifique.";
            texts.alreadycorrected = "Le fichier a déjà été corrigé";
            texts.vatcodescore = "Points pour le code TVA";
            texts.filenumbermismatch = "Les types de fichiers des documents enseignant et étudiant ne correspondent pas (TVA, multi-devises). Veuillez utiliser les mêmes types de fichiers.";
            texts.exchangeratescore = "Points pour le taux de change";
            texts.amountcurrencyscore = "Points pour le montant de la devise";
            texts.exchangecurrencyscore = "Points pour la devise";
            texts.student = "Étudiant";
            texts.teacher = "Enseignant";
            texts.preparefile = "Préparation du fichier";
            texts.choosefile = "Choisir le fichier à préparer";
            texts.auto = "Auto";
            texts.maxscore = "Score Maximal";
            texts.autoscore = "Score Automatique";
            texts.adjustedscore = "Score Ajusté";
            texts.correctionsnotes = "Notes Corrections";
            texts.nototalscore = "Le fichier ne contient pas de scores";
            texts.amountonlyifaccountsok ="N'appliquez une pénalité que si le débit et le crédit sont corrects.";

        }
        else if (lang === "ita") {
            texts.language = "Lingua";
            texts.datescore = "Punti per la data corretta";
            texts.debitaccountscore = "Punti per il conto addebitato corretto";
            texts.creditaccountscore = "Punti per il conto accreditato corretto";
            texts.amountscore = "Punti per l'importo corretto";
            texts.debitcreditaccountsscore = "Conti debitati e accreditati separati?";
            texts.noscore = "Valutazione per punti";
            texts.changesettingsteacherfile = "Questo comando può essere utilizzato solo nel file dell'insegnante.";
            texts.isnotteacherfile = "Il file da importare non è un file dell'insegnante. Selezionare un file dell'insegnante per l'importazione nel file dello studente.";
            texts.isnotstudentfile = "Il file sorgente non è un file dello studente. Aprire un file dello studente.";
            texts.isnotfile = "Il file non è ancora stato adattato. Aprire un file già adattato.";
            texts.nocorrections = "Non ci sono correzioni da eliminare";
            texts.noautomaticcorrection = "Non ci sono correzioni automatiche da ricalcolare";
            texts.nochanges = "Il file è già stato settato per un uso specifico.";
            texts.alreadycorrected = "Il file è già stato corretto";
            texts.vatcodescore = "Punti per il codice IVA";
            texts.filenumbermismatch = "I tipi di file dei documenti dell'insegnante e dello studente non corrispondono (IVA, multi-valuta). Utilizzare gli stessi tipi di file.";
            texts.exchangeratescore = "Punti per il tasso di cambio";
            texts.amountcurrencyscore = "Punti per l'importo della valuta";
            texts.exchangecurrencyscore = "Punti per la valuta";
            texts.student = "Studente";
            texts.teacher = "Insegnante";
            texts.preparefile = "Preparazione del file";
            texts.choosefile = "Scegliere il file da preparare";
            texts.auto = "Auto";
            texts.maxscore = "Punteggio Massimo";
            texts.autoscore = "Punteggio Automatico";
            texts.adjustedscore = "Punteggio Rettificato";
            texts.correctionsnotes = "Note Correzioni";
            texts.nototalscore = "Il file non contiene punteggi";
            texts.amountonlyifaccountsok ="Penalizza l’importo solo se Dare e Avere sono corretti";
        }
        else { //lang === enu
            texts.language = "Language";
            texts.datescore = "Points for correct date";
            texts.debitaccountscore = "Points for correct debit account";
            texts.creditaccountscore = "Points for correct credit account";
            texts.amountscore = "Points for correct amount";
            texts.debitcreditaccountsscore = "Separate debit and credit accounts?";
            texts.noscore = "Point-based assessment";
            texts.changesettingsteacherfile = "This command can only be used in the teacher file.";
            texts.isnotteacherfile = "The file to import is not a teacher file. Please select a teacher file for import into the student file.";
            texts.isnotstudentfile = "The source file is not a student file. Please open a student file.";
            texts.isnotfile = "The file has not yet been adapted. Please open an already adapted file.";
            texts.nocorrections = "There are no corrections to delete";
            texts.noautomaticcorrection = "There are no automatic corrections to recalculate";
            texts.nochanges = "The file has already been set for a specific use.";
            texts.alreadycorrected = "The file has already been corrected";
            texts.vatcodescore = "Points for VAT code";
            texts.filenumbermismatch = "The file types of the teacher and student documents do not match (VAT, multi-currency). Please use the same file types.";
            texts.exchangeratescore = "Points for exchange rate";
            texts.amountcurrencyscore = "Points for currency amount";
            texts.exchangecurrencyscore = "Points for currency";
            texts.student = "Student";
            texts.teacher = "Teacher";
            texts.preparefile = "Preparing file";
            texts.choosefile = "Choose file to prepare";
            texts.auto = "Auto";
            texts.maxscore = "Max Score";
            texts.autoscore = "Auto Score";
            texts.adjustedscore = "Adjusted Score";
            texts.correctionsnotes = "Corrections Notes";
            texts.nototalscore = "The file does not contain scores";
            texts.amountonlyifaccountsok ="Penalize the amount only if Debit and Credit are correct";
        }

        return texts;
    }
}