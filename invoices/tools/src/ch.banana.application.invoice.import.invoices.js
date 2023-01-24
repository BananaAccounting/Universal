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
    // Banana.Ui.showText(JSON.stringify(transactionsObjs));

    let format_invs = createFormatInvs(banDoc);
    if (format_invs.match(transactionsObjs))
    {
        let format = {};
        // Check that this invoice is detailed, otherwise give a warning and return the empty docChange
        if(!transactionsObjs[0]["InvoiceDate"]) {
            var msg = format_invs.getInvoiceErrorMessage(format_invs.ID_ERR_WRONG_INVOICE_TYPE,format_invs.lang,"");
            banDoc.addMessage(msg,format_invs.ID_ERR_WRONG_INVOICE_TYPE);
        } else {
            format = format_invs.convertInDocChange(transactionsObjs,initJsonDoc);
        }
        jsonDocArray = format;
    }
    
    let documentChange = { "format": "documentChange", "error": "","data":[]};
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
    let dateString = date.getFullYear() + ("0" + (date.getMonth() + 1)).slice(-2) + ("0" + (date.getDate())).slice(-2);
    return Banana.Converter.toInternalDateFormat(dateString, "yyyymmdd");
}

function createFormatInvs(banDocument) {
    return new formatInvs(banDocument);
}

class formatInvs {

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
        
        if (transactions[0]["CustomerNumber"] && transactions[0]["CustomerNumber"].match(/[0-9\.]+/g))
            formatMatched = true;
        else
            formatMatched = false;

        if (formatMatched && transactions[0]["CustomerNumber"].match(/[0-9\.]+/g)){
            formatMatched = true;
        }
        else
            formatMatched = false;

        if (formatMatched && transactions[0]["InvoiceDate"].match(/[0-9\.]+/g))
            formatMatched = true;
        else
            formatMatched = false;

        if (formatMatched)
            return true;
        else
            return false;
    }

    convertInDocChange(transactionsObjs, initJsonDoc) {
        let jsonDoc = [];
        let docInfo = getDocumentInfo();
        let rows = [];
        let invoiceObj = {};

        /* Iterate over the rows and create object */
        for (let trRow in transactionsObjs) {
            let invoiceTransaction = transactionsObjs[trRow];
            // Banana.Ui.showText(JSON.stringify(invoiceTransaction));
            
            if (this.placeholder !== invoiceTransaction["InvoiceNumber"]) {
                invoiceObj = this.setInvoiceStructure(invoiceTransaction, docInfo);
                invoiceObj.items = this.setInvoiceStructure_items(transactionsObjs, invoiceTransaction["InvoiceNumber"]);
                // Banana.Ui.showText(JSON.stringify(invoiceObj));

                // Recalculate invoice
                if(!invoiceObj.billing_info)
                    invoiceObj.billing_info = {};

                invoiceObj.billing_info.discount = {};
                if(this.discountTotal == "0"){
                    this.discountTotal = null;
                }
                invoiceObj.billing_info.discount.amount_vat_exclusive=this.discountTotal;
                invoiceObj = JSON.parse(this.banDoc.calculateInvoice(JSON.stringify(invoiceObj)));

                // check that the information in the billing info property coincides with the totals taken from the invoice lines
                this.checkCalculatedAmounts(invoiceObj);

                let row = {};
                row.operation = {};
                row.operation.name = "add";
                row.fields = {};

                row.fields["InvoiceData"] = {"invoice_json":JSON.stringify(invoiceObj)};

                rows.push(row);

                this.invoiceNetTotal = "";
                this.invoiceVatTotal = "";
                this.discountTotal = "";
            }
            this.placeHolder = invoiceTransaction["InvoiceNumber"];
        }
        let dataUnitTransactions = {};
        dataUnitTransactions.nameXml = "Invoices";
        dataUnitTransactions.data = {};
        dataUnitTransactions.data.rowLists = [];
        dataUnitTransactions.data.rowLists.push({ "rows": rows });
    
        jsonDoc = initJsonDoc;

        jsonDoc.document.dataUnits.push(dataUnitTransactions);

        return jsonDoc;
    }

    checkCalculatedAmounts(invoiceObj){

        let msg = this.getInvoiceErrorMessage(this.ID_ERR_AMOUNTS_WITH_DIFFERENCES,this.lang,invoiceObj.document_info.number);
  
        if(invoiceObj.billing_info.total_amount_vat_exclusive_before_discount==this.invoiceNetTotal){
           this.NetTotalIsOk=true;
        }else{
           Banana.application.addMessage(msg,this.ID_ERR_AMOUNTS_WITH_DIFFERENCES);
           /*Banana.console.debug("excl vat file"+this.invoiceNetTotal);
           Banana.console.debug("excl vat calculated"+invoiceObj.billing_info.total_amount_vat_exclusive_before_discount);*/
        }
        if(invoiceObj.billing_info.total_amount_vat_inclusive==this.invoiceVatTotal){
           this.VatTotalIsOk=true;
        }else{
           Banana.application.addMessage(msg,this.ID_ERR_AMOUNTS_WITH_DIFFERENCES);
          /* Banana.console.debug("incl vat file"+this.invoiceVatTotal);
           Banana.console.debug("incl vat calculated"+invoiceObj.billing_info.total_amount_vat_inclusive);*/
        }
  
        return true;
    }

    getTranslateWords(language){
        let transWords = {};
     
        if (language.length > 2) {
           language = language.substr(0, 2);
        }
     
        switch(language){
            case  'it':
              transWords.invoice = "Fattura";
              transWords.reference = "N. di riferimento: ";
              break;
           case 'fr':
              transWords.invoice = "Facture";
              transWords.reference = "N. de la facture: ";
              break;
           case 'de':
              transWords.invoice = "Rechnung";
              transWords.reference = "Rechnungsnummer: ";
              break;
           default:
              transWords.invoice = "Invoice";
              transWords.reference = "Reference nr: ";
              break;
        }
     
        return transWords;
    }

    // Call this method for each invoice line present, pass it a transaction
    setInvoiceStructure(transaction, docInfo){

        let invoiceObj = {};
        let invoiceTransaction = transaction;
        let supInfo = docInfo;
        let transWord = this.getTranslateWords(this.lang);
        
        invoiceObj.creator_info = this.setInvoiceStructure_creatorInfo();
        invoiceObj.author_info = {};
        invoiceObj.customer_info = this.setInvoiceStructure_customerInfo(invoiceTransaction);
        invoiceObj.document_info = this.setInvoiceStructure_documentInfo(invoiceTransaction, transWord);
        invoiceObj.note = {};
        invoiceObj.parameters = {};
        invoiceObj.payment_info = this.setInvoiceStructure_paymentInfo(invoiceTransaction);
        invoiceObj.shipping_info = this.setInvoiceStructure_shippingInfo(invoiceTransaction);
        invoiceObj.supplier_info = this.setInvoiceStructure_supplierInfo(supInfo);
        invoiceObj.type = "invoice";
        invoiceObj.version = "1.0";


        return invoiceObj;
    }

    setInvoiceStructure_creatorInfo(){
        let invoiceObj_creatorInfo = {};
  
        invoiceObj_creatorInfo.name = Banana.script.getParamValue('id');
        invoiceObj_creatorInfo.publisher = "Banana.ch SA";
        invoiceObj_creatorInfo.version = "";
        invoiceObj_creatorInfo.pubdate = Banana.script.getParamValue('pubdate');
  
        return invoiceObj_creatorInfo;
  
    }

    setInvoiceStructure_customerInfo(invoiceTransaction){
        let invoiceObj_customerInfo = {};
  
        let customer_info = this.getContactAddress(invoiceTransaction["CustomerNumber"], invoiceTransaction["CustomerName"]);
  
        invoiceObj_customerInfo.address1 = customer_info.address1;
        invoiceObj_customerInfo.address2 = customer_info.address2;
        invoiceObj_customerInfo.address3 = "";
        invoiceObj_customerInfo.balance = "";
        invoiceObj_customerInfo.balance_base_currency = "";
        invoiceObj_customerInfo.business_name = customer_info.business_name;
        invoiceObj_customerInfo.city = customer_info.city;
        invoiceObj_customerInfo.country = customer_info.country;
        invoiceObj_customerInfo.country_code = customer_info.country_code;
        invoiceObj_customerInfo.courtesy = "";
        invoiceObj_customerInfo.currency = "";
        invoiceObj_customerInfo.date_birth = "";
        invoiceObj_customerInfo.email = customer_info.email;
        invoiceObj_customerInfo.phone = customer_info.phone;
        invoiceObj_customerInfo.first_name = customer_info.first_name;
        invoiceObj_customerInfo.lang = customer_info.lang;
        invoiceObj_customerInfo.last_name = customer_info.last_name;
        invoiceObj_customerInfo.mobile = customer_info.mobile;
        invoiceObj_customerInfo.number = invoiceTransaction["CustomerNumber"];
        invoiceObj_customerInfo.origin_row = "";
        invoiceObj_customerInfo.origin_table = "";
        invoiceObj_customerInfo.postal_code = customer_info.postal_code;
        invoiceObj_customerInfo.vat_number = "";
  
        return invoiceObj_customerInfo;
  
    }

    getContactAddress(id, name) {
        let tableContacts = this.banDoc.table("Contacts");
        let customer_info = {
           'number': id,
           'business_name': '',
           'first_name': '',
           'last_name': '',
           'address1': '',
           'address2': '',
           'address3': '',
           'postal_code': '',
           'city': '',
           'country_code': '',
           'country': '',
           'phone': '',
           'email': '',
           'web': ''
       };
        if (tableContacts) {
            let contactRow = tableContacts.findRowByValue("RowId", id);
            if (contactRow) {
                customer_info.courtesy = contactRow.value('NamePrefix');
                customer_info.business_name = contactRow.value('OrganisationName');
                customer_info.first_name = contactRow.value('FirstName');
                customer_info.last_name = contactRow.value('FamilyName');
                customer_info.address1 = contactRow.value('Street');
                customer_info.address2 = contactRow.value('AddressExtra');
                customer_info.address3 = "";
                customer_info.postal_code = contactRow.value('PostalCode');
                customer_info.city = contactRow.value('Locality');
                customer_info.country = contactRow.value('Country');
                customer_info.country_code = contactRow.value('CountryCode');
                customer_info.web = contactRow.value('Website');
                customer_info.email = contactRow.value('EmailWork');
                customer_info.phone = contactRow.value('PhoneWork');
                customer_info.mobile = contactRow.value('PhoneMobile');
                return customer_info;
            }
            let table = this.banDoc.table("Invoices");
            let rowNumber = -1;
            let msg = this.getInvoiceErrorMessage(this.ID_ERR_COSTUMERID_NOT_FOUND, this.lang,id);
            table.addMessage(msg, rowNumber, "ContactsId", this.ID_ERR_COSTUMERID_NOT_FOUND);
            customer_info.first_name = name;
            return customer_info;
        }
        return;
    }

    setInvoiceStructure_documentInfo(invoiceTransaction, transWord){
        let invoiceObj_documentInfo = {};
  
        invoiceObj_documentInfo.currency = invoiceTransaction["InvoiceCurrency"];
        invoiceObj_documentInfo.date = Banana.Converter.toInternalDateFormat(invoiceTransaction["InvoiceDate"]);
        invoiceObj_documentInfo.decimals_amounts = 2;
        invoiceObj_documentInfo.description = transWord.invoice;
        invoiceObj_documentInfo.doc_type = "";
        invoiceObj_documentInfo.locale = "";
        invoiceObj_documentInfo.number = invoiceTransaction["InvoiceNumber"];
        invoiceObj_documentInfo.origin_row = "";
        invoiceObj_documentInfo.origin_table = "";
        invoiceObj_documentInfo.printed = "";
        invoiceObj_documentInfo.rounding_total = "";
        invoiceObj_documentInfo.type = "";
        // invoiceObj_documentInfo.text_begin = transWord.reference + invoiceTransaction["esr_number"];
        invoiceObj_documentInfo.vat_mode = "vat_excl";
  
  
        return invoiceObj_documentInfo;
  
    }

    setInvoiceStructure_items(invoiceTransactions, ref_number){
        let invoiceArr_items = [];
        for(let row in invoiceTransactions){
           let invTransaction = invoiceTransactions[row];
        //    Banana.Ui.showText(JSON.stringify(invTransaction));
           if(invTransaction["InvoiceNumber"] == ref_number){
                let invoiceObj_items = {};
                let itemDescription = invTransaction["ItemDescription"];
                invoiceObj_items.description = itemDescription;
                invoiceObj_items.item_type = "";
                invoiceObj_items.mesure_unit = invTransaction["ItemUnit"];
                invoiceObj_items.number = invTransaction["ItemNumber"];
                invoiceObj_items.quantity = invTransaction["ItemQuantity"];
                invoiceObj_items.total = "";
                invoiceObj_items.total_amount_vat_exclusive = invTransaction["ItemTotal"];
                invoiceObj_items.total_amount_vat_inclusive = invTransaction["ItemTotal"];
                // invoiceObj_items.unit_price = this.setInvoiceStructure_items_unitPrice(invTransaction);   
                
                invoiceArr_items.push(invoiceObj_items);
            }
        }
        return invoiceArr_items;
    }

    setInvoiceStructure_items_unitPrice(invoiceTransaction){
        let unitPrice = {};
  
        unitPrice.amount_vat_exclusive = null;
        //arrotondare a 4 dec
        unitPrice.amount_vat_inclusive = Banana.SDecimal.divide(invoiceTransaction["position_nettotal"],invoiceTransaction["position_amount"],{'decimals':4});
        
        unitPrice.currency = invoiceTransaction["currency"];
        unitPrice.discount = {};
        unitPrice.discount.amount = null;
        unitPrice.discount.percent = null;
        unitPrice.vat_code = "";
        unitPrice.vat_rate = invoiceTransaction["position_vat"];
  
        //salvo i valori per confrontarli con quelli calcolati
        this.invoiceNetTotal = Banana.SDecimal.add(this.invoiceNetTotal,invoiceTransaction["position_nettotal"],{'decimals':2});
        this.invoiceVatTotal = Banana.SDecimal.add(this.invoiceVatTotal,invoiceTransaction["position_total"],{'decimals':2});
  
        this.discountTotal = Banana.SDecimal.add(this.discountTotal,Banana.SDecimal.subtract(invoiceTransaction["position_nettotal"],invoiceTransaction["position_nettotal_afterdiscount"]));

  
        return unitPrice;
  
    }

    setInvoiceStructure_paymentInfo(invoiceTransaction){
        let invoiceObj_paymentInfo = {};
  
        invoiceObj_paymentInfo.due_date = Banana.Converter.toInternalDateFormat(invoiceTransaction["InvoiceDueDate"]);
        invoiceObj_paymentInfo.due_days = "";
        invoiceObj_paymentInfo.payment_date = Banana.Converter.toInternalDateFormat(invoiceTransaction["paid_date"]);
  
        return invoiceObj_paymentInfo;
  
    }
  
    setInvoiceStructure_shippingInfo(invoiceTransaction){
        var invoiceObj_shippingInfo = {};
  
        invoiceObj_shippingInfo.different_shipping_address = false;
  
        return invoiceObj_shippingInfo = {};
    }

    setInvoiceStructure_supplierInfo(supInfo){
        let invoiceObj_supplierInfo = {};
  
        invoiceObj_supplierInfo.address1 = supInfo.address1;
        invoiceObj_supplierInfo.address2 = supInfo.address2;
        invoiceObj_supplierInfo.business_name = supInfo.business_name;
        invoiceObj_supplierInfo.city = supInfo.city;
        invoiceObj_supplierInfo.courtesy = supInfo.courtesy;
        invoiceObj_supplierInfo.email = supInfo.email;
        invoiceObj_supplierInfo.fax = supInfo.fax;
        invoiceObj_supplierInfo.first_name = supInfo.first_name;
        invoiceObj_supplierInfo.fiscal_number = supInfo.fiscal_number;
        invoiceObj_supplierInfo.last_name = supInfo.last_name;
        invoiceObj_supplierInfo.phone = supInfo.phone;
        invoiceObj_supplierInfo.postal_code = supInfo.postal_code;
        invoiceObj_supplierInfo.state = supInfo.state;
        invoiceObj_supplierInfo.vat_number = supInfo.vat_number;
        invoiceObj_supplierInfo.web = supInfo.web;
  
        return invoiceObj_supplierInfo;
  
    }

    // replaceNewLine(itemDescription){
    //     let newItemDescription = "";
    //     if(itemDescription && itemDescription.indexOf("<br>") !== 0){
    //        newItemDescription = itemDescription.replace("<br>","\n");
    //        newItemDescription = "\n" + newItemDescription;
    //        return newItemDescription;
    //     }
    //     return newItemDescription;
    // }
    
    getInvoiceErrorMessage(errorId, lang, refNr){
        if (!lang)
        lang = 'en';
        switch (errorId) {
            case this.ID_ERR_COSTUMERID_NOT_FOUND:
            if (lang == 'it')
                return "Id del contatto: "+refNr+" non trovato nella tabella dei contatti. Hai importato i contatti?";
            else if (lang == 'de')
                return "Kontakt-ID: "+refNr+" wurde nicht in der Kontakt-Tabelle gefunden. Haben Sie Ihre Kontakte schon importiert? ";
            else if (lang == 'fr')
                return "Contact id: "+refNr+" not found in contact table. Did you import the contacts?";
            else
                return "Contact id: "+refNr+" not found in contact table. Did you import the contacts?";
            case this.ID_ERR_AMOUNTS_WITH_DIFFERENCES:
            if (lang == 'it')
                return "L'importo calcolato è diverso da quello presente del tuo file, fattura nr"+": "+refNr;
            else if (lang == 'de')
                return "Der berechnete Betrag entspricht nicht demjenigen Ihrer Datei, Rechnungsnummer"+": "+refNr;
            else if (lang == 'fr')
                return "The calculated amount is different from the amount in your file, invoice nr"+": "+refNr;
            else
                return "The calculated amount is different from the amount in your file, invoice nr"+": "+refNr;  
            case this.ID_ERR_WRONG_INVOICE_TYPE:
            if (lang == 'it')
                return "Stai provando ad importare una fattura tipo 'Singola riga',importa invece una fattura tipo 'Dettagliata'";
            else if (lang == 'de')
                return "Sie versuchen, eine 'einzeilige' Rechnung zu importieren, importieren Sie stattdessen eine 'detaillierte' Rechnung.";
            else if (lang == 'fr')
                return "You are trying to import a 'Single line' invoice, import a 'Detailed' invoice instead.";
            else
                return "You are trying to import a 'Single line' invoice, import a 'Detailed' invoice instead.";
        }
        return '';
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

function getDocumentInfo(){
    let docInfo = {};
    if (Banana.document){
       docInfo.address1 = Banana.document.info("AccountingDataBase","Address1");
       docInfo.address2 = Banana.document.info("AccountingDataBase","Address2");
       docInfo.business_name = Banana.document.info("AccountingDataBase","Company");
       docInfo.city = Banana.document.info("AccountingDataBase","City");
       docInfo.courtesy = Banana.document.info("AccountingDataBase","Courtesy");
       docInfo.email = Banana.document.info("AccountingDataBase","Email");
       docInfo.fax = "";
       docInfo.first_name = Banana.document.info("AccountingDataBase","Name");
       docInfo.fiscal_number = Banana.document.info("AccountingDataBase","FiscalNumber");
       docInfo.last_name = Banana.document.info("AccountingDataBase","LastName");
       docInfo.phone = Banana.document.info("AccountingDataBase","Phone");
       docInfo.postal_code = Banana.document.info("AccountingDataBase","Zip");
       docInfo.state = Banana.document.info("AccountingDataBase","State");
       docInfo.vat_number = Banana.document.info("AccountingDataBase","VatNumber");
       docInfo.web = Banana.document.info("AccountingDataBase","Web");
    }
 
    return docInfo;
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

    