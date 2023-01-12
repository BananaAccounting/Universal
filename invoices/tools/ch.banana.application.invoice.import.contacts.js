// @id = ch.banana.application.invoice.import.contacts
// @api = 1.0
// @pubdate = 2022-10-24
// @publisher = Banana.ch SA
// @description = Import contacts
// @description.de = Kontakte importieren
// @description.fr = Importer contacts
// @description.it = Importa contatti
// @doctype = 400.400
// @docproperties =
// @task = import.rows
// @outputformat = transactions.simple
// @inputdatasource = openfiledialog
// @inputencoding = utf8
// @inputfilefilter = Text file (*.csv);;All files (*.*)
// @inputfilefilter.de = Text datei (*.csv);;All files (*.*)
// @inputfilefilter.fr = Fichier text(*.csv);;All files (*.*)
// @inputfilefilter.it = File testo (*.csv);;All files (*.*)

/**
 * Parse the file and create a document change document to import the imvoices.
 */
function exec(string) {
    let banDoc = Banana.document;

    if (!banDoc || string.length <= 0) 
        return "@Cancel";

    if (!verifyBananaVersion()) 
        return "@Cancel";

    let jsonDocArray = {};
    let initJsonDoc = initDocument();
    let fieldSeparator = findSeparator(string);
    let transactions = Banana.Converter.csvToArray(string, fieldSeparator, '"');
    let transactionsHeader = transactions[0];
    transactions.splice(0, 1);
    let transactionsObjs = Banana.Converter.arrayToObject(transactionsHeader,transactions,true);

    // Import Contacts
    let formatCnt = new FormatCnt();
    if (formatCnt.match(transactionsObjs)) {
        let format = formatCnt.convertInDocChange(transactionsObjs, initJsonDoc);
        jsonDocArray = format;
    }

    var documentChange = { "format": "documentChange", "error": "","data":[]};
    documentChange["data"].push(jsonDocArray);

    return documentChange; 
}

function initDocument() {
    let jsonDoc = {};
    jsonDoc.document = {};
    jsonDoc.document.dataUnits = [];

    jsonDoc.creator = {};
    jsonDoc.creator.executionDate = getCurrentDate();
    jsonDoc.creator.name = Banana.script.getParamValue('id');
    jsonDoc.creator.version = "1.0";

    return jsonDoc;
}

function getCurrentDate() {
    let date = new Date();
    let dateString = date.getFullYear() + ("0" + (date.getMonth() + 1)).slice(-2) + ("0" + date.getDate()).slice(-2);
    return Banana.Converter.toInternalDateFormat(dateString, "yyyymmdd");
}
