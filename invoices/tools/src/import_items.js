// @id = ch.banana.application.invoice.import.items
// @api = 1.0
// @pubdate = 2023-01-19
// @publisher = Banana.ch SA
// @description = Import items
// @description.de = Artikeln importieren
// @description.fr = Importer articles
// @description.it = Importa articoli
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

    // Import items
    let format_itm = createFormatItm();
    if (format_itm.match(transactionsObjs)) {
        let format = format_itm.convertInDocChange(transactionsObjs, initJsonDoc);
        jsonDocArray = format;
    }

    let documentChange = { "format": "documentChange", "error": "","data":[]};
    documentChange["data"].push(jsonDocArray);

    return documentChange; 
}

function createFormatItm() {
    return new formatItm();
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

class formatItm {
    match(transactions) {
        if (transactions.length === 0) 
            return false;

        let formatMatched = false;

        if (transactions[0]["RowId"] && transactions[0]["Description"] && transactions[0]["UnitPrice"]) 
            formatMatched = true;
            
        else
            formatMatched = false;

        if (formatMatched && transactions[0]["RowId"].match(/[0-9\.]+/g))
            formatMatched = true;
        else
            formatMatched = false;

        if (formatMatched)
            return true;
    
        return false;
    }

    convertInDocChange(transactionsObjs, initJsonDoc) {
        let existingElements = getExistingItemsFromTable("Items", "RowId");
        let rows = [];
        
        for (let trRow in transactionsObjs){
            let transaction = transactionsObjs[trRow];
            
            let row = {};
            row.operation = {};
            row.operation.name = "add";
            
            row.fields = {};
            row.fields["RowId"] = transaction["RowId"];
            row.fields["Description"] = transaction["Description"];
            row.fields["UnitPrice"] = transaction["UnitPrice"];
            row.fields["Unit"] = transaction["Unit"];
            if (tableHasField("Items", "AmountType"))
                row.fields["AmountType"] = transaction["AmountType"]
            if (tableHasField("Items", "VatCode"))
                row.fields["VatCode"] = transaction["VatCode"];
            if (tableHasField("Items", "VatRate"))
                row.fields["VatRate"] = transaction["VatRate"];
            if (tableHasField("Items", "Discount"))
                row.fields["Discount"] = transaction["Discount"];
            
            //carefully check the fields to be added 
            
            //check that the row does not already exist
            if(!verifyIfExist(existingElements, row.fields["RowId"])) {
                rows.push(row);
            }  
        }
        let dataUnitTransactions = {};
        dataUnitTransactions.nameXml = "Items";
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

function tableHasField(tableName, fieldName) {
    let table = Banana.document.table(tableName);
    if (table && table.columnNames.indexOf(fieldName) >= 0) {
        return true;
    }
    return false;
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
