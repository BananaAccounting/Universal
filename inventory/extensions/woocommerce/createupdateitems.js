// @id = ch.banana.apps.createwoocommerceitems
// @api = 1.0
// @pubdate = 2023-08-23
// @publisher = Banana.ch SA
// @doctype = 400.500
// @docproperties =
// @description = Create/Update Products from WooCommerce
// @task = import.file
// @outputformat = transactions.simple
// @outputformat = tablewithheaders
// @inputdatasource = openfiledialog
// @inputencoding = utf-8
// @inputfilefilter = *.csv
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

function exec(inText) {

    if (!verifyBananaAdvancedVersion()) {
        return "@Cancel";
    }

    //Check if a document is opened
    if (!Banana.document) { return; }

    var csvFile = Banana.Converter.csvToArray(inText, ',', '"');

    //Check if the csv file is empty
    if (csvFile.length <= 1) {
        Banana.document.addMessage("The file is empty.");
        return;
    }

    var create_update = new CreateUpdate(Banana.document);

    let jsonDoc;

    rows = create_update.getUpdatedItemsRows(csvFile);
    jsonDoc = create_update.getJsonDocument(rows);

    let documentChange = { "format": "documentChange", "error": "", "data": [] };
    documentChange["data"].push(jsonDoc);

    // return the updated items table
    return documentChange;

}

/**
 * Questa classe gestisce la logica ed i metodi per la creazione 
 * @param {*} banDocument 
 */
var CreateUpdate = class CreateUpdate {

    constructor(banDocument) {
        this.banDoc = banDocument;
    }

    getCurrentDate() {
        var d = new Date();
        var datestring = d.getFullYear() + ("0" + (d.getMonth() + 1)).slice(-2) + ("0" + d.getDate()).slice(-2);
        return Banana.Converter.toInternalDateFormat(datestring, "yyyymmdd");
    }

    getCurrentTime() {
        var d = new Date();
        var timestring = ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
        return Banana.Converter.toInternalTimeFormat(timestring);
    }

    initDocument() {
        var jsonDoc = {};
        jsonDoc.document = {};
        jsonDoc.document.fileVersion = "1.0.0";
        jsonDoc.document.dataUnits = [];
        jsonDoc.creator = {};
        jsonDoc.creator.executionDate = this.getCurrentDate();
        jsonDoc.creator.executionTime = this.getCurrentTime();
        jsonDoc.creator.name = Banana.script.getParamValue("id");
        jsonDoc.creator.version = "1.0";
        return jsonDoc;
    }

    getUpdatedItemsRows(csvFile) {

        var rows = [];
        var producttocreate = [];
        var index = 0;
        var flag = true;

        //Check if there is the Items table
        if (!this.banDoc.table("Items")) { return; }

        var items = this.banDoc.table("Items");

        // update the items table with the data from the csv file
        for (var i = 1; i < csvFile.length; i++) {
            for (var k = 0; k < items.rowCount; k++) {

                if (items.row(k).value("RowId") === csvFile[i][2] && items.row(k).value("RowId") != "") {
                    //row operation
                    var row = {};
                    row.operation = {};
                    row.operation.name = 'modify';
                    row.operation.sequence = k.toString();

                    //row fields
                    row.fields = {};
                    row.fields["RowId"] = csvFile[i][2];
                    row.fields["Description"] = csvFile[i][3];
                    row.fields["ReferenceUnit"] = items.row(k).value("ReferenceUnit");
                    row.fields["QuantityBegin"] = csvFile[i][14];
                    row.fields["UnitPrice"] = csvFile[i][25];
                    row.fields["UnitPriceBegin"] = items.row(k).value("UnitPriceBegin");

                    //rows 
                    rows.push(row);
                    flag = false;
                }
            }
            if (flag) {
                producttocreate[index] = i;
                index++;
            }
            flag = true;
        }


        for (var i = 0; i < producttocreate.length; i++) {
            //row operation
            var row = {};
            row.operation = {};
            row.operation.name = 'add';

            //row fields
            row.fields = {};
            row.fields["RowId"] = csvFile[producttocreate[i]][2];
            row.fields["Description"] = csvFile[producttocreate[i]][3];
            row.fields["ReferenceUnit"] = 'pcs';
            row.fields["QuantityBegin"] = csvFile[producttocreate[i]][14];
            row.fields["UnitPrice"] = csvFile[producttocreate[i]][25];
            row.fields["UnitPriceBegin"] = csvFile[producttocreate[i]][25];

            //rows 
            rows.push(row);
        }
        return rows;
    }

    getJsonDocument(rows) {
        //table
        var dataUnitTransactions = {};
        dataUnitTransactions.nameXml = 'Items';
        dataUnitTransactions.data = {};
        dataUnitTransactions.data.rowLists = [];
        dataUnitTransactions.data.rowLists.push({ 'rows': rows });
        //document
        var jsonDoc = this.initDocument();
        jsonDoc.document.dataUnits.push(dataUnitTransactions);
        return jsonDoc;

    }
}