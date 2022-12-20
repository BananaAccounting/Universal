// @id = ch.banana.application.invoice.import.invoices
// @api = 1.0
// @pubdate = 2022-10-24
// @publisher = Banana.ch SA
// @description = Import invoices
// @description.de = Rechnungen importieren
// @description.fr = Importer factures
// @description.it = Importa fatture
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
    let transactionsObjs = Banana.Converter.arrayToObject(transactionsHeader, transactions, true);
    
    var documentChange = { "format": "documentChange", "error": "","data":[]};
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
    let dateString = date.getFullYear() + ("0" + (date.getMonth() + 1)).slice(-2) + ("0" + (date.getDate()).slice(-2));
    return Banana.Converter.toInternalDateFormat(dateString, "yyyymmdd");
}

let formatInvoices = class formatInvoices {

    constructor(banDocument) {
        this.placeholder = "";
        this.invoiceNetTotal = "";
        this.invoiceNetTotalAfterDisc = "";
        this.invoiceVatTotal = "";
        this.NetTotalIsOk = false;
        this.VatTotalIsOk = false;
        this.discountTotal = "";
        this.lang = getLang();
        this.banDoc = banDocument;

        //error messages
        this.ID_ERR_AMOUNTS_WITH_DIFFERENCES = "ID_ERR_AMOUNTS_WITH_DIFFERENCES";
        this.ID_ERR_COSTUMERID_NOT_FOUND = "ID_ERR_COSTUMERID_NOT_FOUND";
        this.ID_ERR_WRONG_INVOICE_TYPE = "ID_ERR_WRONG_INVOICE_TYPE";
    }

    /** Return true if the transactions match this format */
    match(transactions) {
        if ( transactions.length === 0)
            return false;

        let formatMatched = false;
    }

    convertInDocChange(transactionsObjs, initJsonDoc) {
        let jsonDoc = [];
        let docInfo = getDocumentInfo();
        let rows = [];
        let invoiceObj = {};

        /* Iterate over the rows and create object */
        for (let trRow in transactionsObjs) {
            let invoiceTransaction = transactionsObjs[trRow];

            if (this.placeholder !== invoiceTransaction["number"]) {
                invoiceObj = this.setInvoiceStructure(invoiceTransaction. docInfo);
                invoiceObj.items = this.setInvoiceStructure_items(transactionsObjs, invoiceTransaction["number"]);

                // Recalculate invoice
                if(!invoiceObj.billing_info)
                invoiceObj.billing_info={};

                invoiceObj.billing_info.discount={};
                if(this.discountTotal=="0"){
                this.discountTotal=null;
                }
                invoiceObj.billing_info.discount.amount_vat_exclusive=this.discountTotal;
                invoiceObj = JSON.parse(this.banDoc.calculateInvoice(JSON.stringify(invoiceObj)));

                // check that the information in the billing info property coincides with the totals taken from the invoice lines
                this.checkCalculatedAmounts(invoiceObj);

                let row = {};
                row.operation = {};
                row.operation.name = "add";
                row.fields={};
            }
        }
    }
}
