// @id = ch.banana.application.invoice.tools
// @api = 1.0
// @pubdate = 2023-01-05
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
    let format_cnt = createFormatCnt();
    if (format_cnt.match(transactionsObjs)) {
        let format = format_cnt.convertInDocChange(transactionsObjs, initJsonDoc);
        jsonDocArray = format;
    }
    
    var documentChange = { "format": "documentChange", "error": "","data":[]};
    documentChange["data"].push(jsonDocArray);

    return documentChange; 
}

function createFormatCnt() {
    return new formatCnt();
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

class formatCnt {
    match(transactions) {
        if (transactions.length === 0)
            return false;

        let formatMatched = false;

        if ((transactions[0]["Number"] && transactions[0]["OrganisationName"]) || (transactions[0]["Number"] && transactions[0]["FirstName"] && transactions[0]["LastName"]))
            formatMatched = true;
        else
            formatMatched = false;

        if (formatMatched && transactions[0]["Number"].match(/[0-9\.]+/g))
            formatMatched = true;
        else
            formatMatched = false;

        if (formatMatched)
            return true;
    
        return false;
    }

    convertInDocChange(transactionsObjs, initJsonDoc) {
        let existingElements = getExistingItemsFromTable("Contacts", "RowId");
        let rows = [];
        
        for (let trRow in transactionsObjs){
            let transaction = transactionsObjs[trRow];
            
            let row = {};
            row.operation = {};
            row.operation.name = "add";
            
            row.fields = {};
            row.fields["RowId"] = transaction["Number"];
            row.fields["OrganisationName"] = transaction["OrganisationName"];
            row.fields["OrganisationUnit"] = transaction["OrganisationUnit"];
            row.fields["NamePrefix"] = transaction["NamePrefix"]
            row.fields["FirstName"] = transaction["FirstName"];
            row.fields["FamilyName"] = transaction["LastName"];
            row.fields["Street"] = transaction["Street"];
            row.fields["AddressExtra"] = transaction["AddressExtra"];
            row.fields["POBox"] = transaction["POBox"];
            row.fields["PostalCode"] = transaction["PostalCode"];
            row.fields["Locality"] = transaction["Locality"];
            row.fields["CountryCode"] = transaction["CountryCode"];
            row.fields["LanguageCode"] = transaction["LanguageCode"];
            row.fields["EmailWork"] = transaction["EmailWork"];
            
            //carefully check the fields to be added 
            
            //check that the row does not already exist
            if(!verifyIfExist(existingElements, row.fields["RowId"])) {
                rows.push(row);
            }  
        }
        let dataUnitTransactions = {};
        dataUnitTransactions.nameXml = "Contacts";
        dataUnitTransactions.data = {};
        dataUnitTransactions.data.rowLists = [];
        dataUnitTransactions.data.rowLists.push({ "rows": rows });
        
        let jsonDoc = initJsonDoc;
        
        jsonDoc.document.dataUnits.push(dataUnitTransactions);

        return jsonDoc;
    }
}

function getExistingItemsFromTable(tableName, rowId){

    let table = Banana.document.table(tableName);
    let existingElements = [];
    
    if (!table) {
        return "";
    }

    for (let i = 1; i < table.rowCount; i++) {
        let rowObj = {};
        let tRow = table.row(i);

        rowObj.field_1 = tRow.value(rowId);

        existingElements.push(rowObj);
    }

    return existingElements;
}

function verifyIfExist(existingElements, newElements_id){

    if (!Banana.document)
       return "";

    for(let row in existingElements) {
        
        if(existingElements[row].field_1 == newElements_id){
            return true;
        }
    }
    
    return false;
}

function bananaRequiredVersion(requiredVersion, expmVersion) {
    /**
     * Check Banana version
     */
    if (expmVersion) {
        requiredVersion = requiredVersion + "." + expmVersion;
    }
    if (Banana.compareVersion && Banana.compareVersion(Banana.application.version, requiredVersion) >= 0) {
        return true;
    }
    return false;
}

function verifyBananaVersion() {

    if (!Banana.document)
        return false;
 
    let lang = getLang();
 
    let ban_version_min = "10.0.9";
    let ban_dev_version_min = "";
    let curr_version = bananaRequiredVersion(ban_version_min, ban_dev_version_min);
 
    if (!curr_version) {
        var msg = this.getErrorMessage("ID_ERR_VERSION_NOTSUPPORTED", lang);
        msg = msg.replace("%1", ban_version_min);
        Banana.document.addMessage(msg, "ID_ERR_VERSION_NOTSUPPORTED");
        return false;
    }
 
    return true;
}

function getLang() {
    let lang = 'en';
    if (this.banDocument)
        lang = this.banDocument.locale;
    else if (Banana.application.locale)
        lang = Banana.application.locale;
    if (lang.length > 2)
        lang = lang.substr(0, 2);
    return lang;
 }

/**
 * The function findSeparator is used to find the field separator.
 */
function findSeparator(string) {

    let commaCount=0;
    let semicolonCount=0;
    let tabCount=0;
 
    for(let i = 0; i < 1000 && i < string.length; i++) {
        let c = string[i];
        if (c === ',')
            commaCount++;
        else if (c === ';')
            semicolonCount++;
        else if (c === '\t')
            tabCount++;
    }
 
    if (tabCount > commaCount && tabCount > semicolonCount)
    {
        return '\t';
    }
    else if (semicolonCount > commaCount)
    {
        return ';';
    }
 
    return ',';
}

