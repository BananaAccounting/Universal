// @id = ch.banana.application.invoice.tools
// @api = 1.0
// @pubdate = 2024-04-02
// @publisher = Banana.ch SA
// @description = Import estimates
// @description.de = Offerten importieren
// @description.fr = Importer offres
// @description.it = Importa offerte
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
 
     let format_ests = createFormatEsts(banDoc);
     if (format_ests.match(transactionsObjs))
     {
         let format = {};
         // Check that this invoice is detailed, otherwise give a warning and return the empty docChange
         if(!transactionsObjs[0]["InvoiceDate"]) {
             var msg = format_ests.getInvoiceErrorMessage(format_ests.ID_ERR_WRONG_INVOICE_TYPE,format_ests.lang,"");
             banDoc.addMessage(msg,format_ests.ID_ERR_WRONG_INVOICE_TYPE);
         } else {
             format = format_ests.convertInDocChange(transactionsObjs,initJsonDoc);
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
 
 function createFormatEsts(banDocument) {
     return new formatEsts(banDocument);
 }
 
 class formatEsts {
 
     constructor(banDocument) {
         this.placeholder = "";
         this.invoiceTotalToPay = "";
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
 
     isVatExcl(vat_mode) {
         if (!vat_mode) {
             return true;
         } else if (vat_mode === "vat_excl") {
             return true;
         } else if (vat_mode === "vat_none") {
             return false;
         } else if (vat_mode === "vat_incl") {
             return false;
         }
         return true; // default is vat excl
     }
 
     convertInDocChange(transactionsObjs, initJsonDoc) {
         let jsonDoc = [];
         let docInfo = getDocumentInfo();
         let rows = [];
         let invoiceObj = {};
         let rowMatched = true;
 
         /* Iterate over the rows and create object */
         for (let trRow in transactionsObjs) {
             let invoiceTransaction = transactionsObjs[trRow];
             
             if (this.placeholder !== invoiceTransaction["InvoiceNumber"]) {
                 invoiceObj = this.setInvoiceStructure(invoiceTransaction, docInfo);
                 invoiceObj.items = this.setInvoiceStructure_items(transactionsObjs, invoiceTransaction["InvoiceNumber"], rowMatched);
                 
                 if (invoiceTransaction["InvoiceDiscount"]) {
                     invoiceObj.billing_info.discount = {
                         amount_vat_exclusive: this.isVatExcl(invoiceTransaction["InvoiceAmountType"]) ? invoiceTransaction["InvoiceDiscount"] : null,
                         amount_vat_inclusive: this.isVatExcl(invoiceTransaction["InvoiceAmountType"]) ? null : invoiceTransaction["InvoiceDiscount"],
                     };
                 }
 
                 if (invoiceObj.items === null)
                    return null;
                 // Recalculate invoice
                 invoiceObj = JSON.parse(this.banDoc.calculateInvoice(JSON.stringify(invoiceObj)));
 
                 // check that the information in the billing info property coincides with the totals taken from the invoice lines
                 this.checkCalculatedAmounts(invoiceObj);
 
                 let row = {};
                 row.operation = {};
                 row.operation.name = "add";
                 row.fields = {};
 
                 row.fields["InvoiceData"] = {"invoice_json":JSON.stringify(invoiceObj)};
 
                 rows.push(row);
 
                 this.invoiceTotalToPay = "";
                 this.invoiceVatTotal = "";
                 this.discountTotal = "";
             }
             
             this.placeholder = invoiceTransaction["InvoiceNumber"];
         }
         let dataUnitTransactions = {};
         dataUnitTransactions.nameXml = "Estimates";
         dataUnitTransactions.data = {};
         dataUnitTransactions.data.rowLists = [];
         dataUnitTransactions.data.rowLists.push({ "rows": rows });
     
         jsonDoc = initJsonDoc;
 
         jsonDoc.document.dataUnits.push(dataUnitTransactions);
 
         return jsonDoc;
     }
 
     checkCalculatedAmounts(invoiceObj){
 
         let msg = this.getInvoiceErrorMessage(this.ID_ERR_AMOUNTS_WITH_DIFFERENCES,this.lang,invoiceObj.document_info.number);
   
        // Verifiy calculated total amount is the same as in the imported file.
        // Verification is done only when the invoiceTotalToPay is not 0 (when empty is always set to 0.00).
        // With this the invoiceTotalToPay field of the csv can be empty and no verification message is shown.
        if (this.invoiceTotalToPay && this.invoiceTotalToPay !== "0.00") {
             if (Banana.SDecimal.compare(invoiceObj.billing_info.total_to_pay, this.invoiceTotalToPay) === 0) {
                this.NetTotalIsOk=true;
             }else{
                Banana.application.addMessage(
                     qsTr("The calculated amount for invoice %1 is different from the amount in the imported file. Calculated amount %2, amount imported file: %3")
                         .arg(invoiceObj.document_info.number).arg(invoiceObj.billing_info.total_to_pay).arg(this.invoiceTotalToPay),
                     this.ID_ERR_AMOUNTS_WITH_DIFFERENCES);
             }
         }
 
        // Verification is done only when the invoiceVatTotal is not 0 (when empty is always set to 0.00).
        // With this the invoiceVatTotal field of the csv can be empty and no verification message is shown.
        if (this.invoiceVatTotal && this.invoiceVatTotal !== "0.00") {
             if (Banana.SDecimal.compare(invoiceObj.billing_info.total_vat_amount, this.invoiceVatTotal) === 0) {
                this.VatTotalIsOk=true;
             } else {
                 Banana.application.addMessage(
                      qsTr("The calculated vat amount for invoice %1 is different from the amount in the imported file. Calculated vat amount %2, amount imported file: %3")
                          .arg(invoiceObj.document_info.number).arg(invoiceObj.billing_info.total_vat_amount).arg(this.invoiceVatTotal),
                      this.ID_ERR_AMOUNTS_WITH_DIFFERENCES);
             }
         }
   
         return true;
     }
 
     getTranslateWords(){
         let transWords = {};
 
         transWords.invoice = qsTr("Estimate");
         transWords.reference = qsTr("Reference nr: ");
      
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
         invoiceObj.billing_info = {};
         invoiceObj.customer_info = this.setInvoiceStructure_customerInfo(invoiceTransaction);
         invoiceObj.document_info = this.setInvoiceStructure_documentInfo(invoiceTransaction, transWord);
         invoiceObj.note = {};
         invoiceObj.parameters = {};
         invoiceObj.payment_info = this.setInvoiceStructure_paymentInfo(invoiceTransaction);
         invoiceObj.shipping_info = this.setInvoiceStructure_shippingInfo(invoiceTransaction);
         invoiceObj.supplier_info = this.setInvoiceStructure_supplierInfo(supInfo);
         invoiceObj.type = "estimate";
         invoiceObj.version = "1.0";
 
         // save invoice's totals to verify that the totals match after recalculate
         this.invoiceTotalToPay = Banana.SDecimal.add(this.invoiceTotalToPay,invoiceTransaction["InvoiceTotalToPay"],{'decimals':2});
         this.invoiceVatTotal = Banana.SDecimal.add(this.invoiceVatTotal,invoiceTransaction["InvoiceVatTotal"],{'decimals':2});
         this.discountTotal = Banana.SDecimal.add(this.invoiceVatTotal,invoiceTransaction["InvoiceDiscount"],{'decimals':2});
 
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
            'web': '',
            'lang':''
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
                 customer_info.lang = contactRow.value('LanguageCode');
                 return customer_info;
             }
             let table = this.banDoc.table("Estimates");
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
         invoiceObj_documentInfo.date = invoiceTransaction["InvoiceDate"];
         invoiceObj_documentInfo.decimals_amounts = 2;
         invoiceObj_documentInfo.description = invoiceTransaction["InvoiceDescription"] ? invoiceTransaction["InvoiceDescription"] : qsTr("Estimate ") + invoiceTransaction["InvoiceNumber" ];
         invoiceObj_documentInfo.doc_type = "17";
         invoiceObj_documentInfo.locale = this.setInvoiceStructure_customerInfo(invoiceTransaction).lang;
         invoiceObj_documentInfo.number = invoiceTransaction["InvoiceNumber"];
         invoiceObj_documentInfo.origin_row = "";
         invoiceObj_documentInfo.origin_table = "";
         invoiceObj_documentInfo.printed = "";
         invoiceObj_documentInfo.rounding_total = invoiceTransaction["InvoiceRoundingTotal"];
         invoiceObj_documentInfo.type = "";
         invoiceObj_documentInfo.vat_mode = invoiceTransaction["InvoiceAmountType"] ? invoiceTransaction["InvoiceAmountType"] : "vat_excl";
   
         return invoiceObj_documentInfo;
     }
 
     setInvoiceStructure_items(invoiceTransactions, ref_number, rowMatched){
         let invoiceArr_items = [];
         for(let row in invoiceTransactions){
            let invTransaction = invoiceTransactions[row];
         
            if(invTransaction["InvoiceNumber"] == ref_number){
                 let invoiceObj_items = {};
                 let itemDescription = invTransaction["ItemDescription"];
                 invoiceObj_items.description = itemDescription;
                 invoiceObj_items.item_type = "";
                 invoiceObj_items.mesure_unit = invTransaction["ItemUnit"];
                 invoiceObj_items.number = invTransaction["ItemNumber"];
                 invoiceObj_items.quantity = invTransaction["ItemQuantity"];
                 invoiceObj_items.discount = {
                     amount: invTransaction["ItemDiscount"] ? invTransaction["ItemDiscount"] : null
                 };
                 invoiceObj_items.unit_price = {
                     amount_vat_exclusive: this.isVatExcl(invTransaction["InvoiceAmountType"]) ? invTransaction["ItemUnitPrice"] : null,
                     amount_vat_inclusive: this.isVatExcl(invTransaction["InvoiceAmountType"]) ? null : invTransaction["ItemUnitPrice"],
                     vat_code: invTransaction["ItemVatCode"] ? invTransaction["ItemVatCode"] : null,
                     vat_rate: invTransaction["ItemVatRate"] ? invTransaction["ItemVatRate"] : null
                 }
                 
                if (!invoiceObj_items.description) {
                    Banana.application.addMessage(qsTr("%1 is a required field").arg("ItemDescription"), "ItemDescription", "missing_field");
                    rowMatched = false;
                }
                if (!invoiceObj_items.quantity) {
                    Banana.application.addMessage(qsTr("%1 is a required field").arg("ItemQuantity"), "ItemQuantity", "missing_field");
                    rowMatched = false;
                }
                if (!invoiceObj_items.unit_price.amount_vat_exclusive && !invoiceObj_items.unit_price.amount_vat_inclusive) {
                    Banana.application.addMessage(qsTr("%1 is a required field").arg("ItemUnitPrice"), "ItemUnitPrice", "missing_field");
                    rowMatched = false;
                }
                invoiceArr_items.push(invoiceObj_items);
            }
        }
        if (!rowMatched) {
            rowMatched = true;
            return null;
        }

        return invoiceArr_items;
    }
 
    setInvoiceStructure_items_unitPrice(invoiceTransaction){
        let unitPrice = {};
   
         unitPrice.amount_vat_exclusive = this.isVatExcl(invTransaction["InvoiceAmountType"]) ? invTransaction["ItemUnitPrice"] : null;
         // round to 4 decimals
         // unitPrice.amount_vat_inclusive = Banana.SDecimal.divide(invoiceTransaction["position_nettotal"],invoiceTransaction["position_amount"],{'decimals':4});
         unitPrice.amount_vat_inclusive = this.isVatExcl(invTransaction["InvoiceAmountType"]) ? null : invTransaction["ItemUnitPrice"];
         
         unitPrice.currency = invoiceTransaction["currency"];
         
         unitPrice.vat_code = "";
         unitPrice.vat_rate = invoiceTransaction["ItemVatRate"];
   
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
     
     getInvoiceErrorMessage(errorId, lang, refNr){
         if (!lang)
         lang = 'en';
         switch (errorId) {
             case this.ID_ERR_COSTUMERID_NOT_FOUND:
                 return qsTr("Contact id '%1' not found in contact table. Did you import the contacts?").arg(refNr);
             case this.ID_ERR_AMOUNTS_WITH_DIFFERENCES:
                 return qsTr("The calculated amount is different from the amount in your file, invoice nr: %1").arg(refNr);
             case this.ID_ERR_WRONG_INVOICE_TYPE:
                 return qsTr("You are trying to import a 'Single line' invoice, import a 'Detailed' invoice instead.");
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
 
     
