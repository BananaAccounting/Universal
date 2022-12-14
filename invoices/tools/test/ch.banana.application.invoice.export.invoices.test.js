// @id = ch.banana.application.invoice.export.invoices.test
// @api = 1.0
// @pubdate = 2022-11-26
// @publisher = Banana.ch SA
// @description = Export invoices
// @description.de = Rechnungen exportieren
// @description.fr = Exporter factures
// @description.it = Esporta fatture
// @doctype = 400.400
// @docproperties =
// @task = export.file
// @exportfiletype = csv
// @exportfilename = invoices
// @outputformat = tablewithheaders
// @outputencoding = utf8
// @inputfilefilter = Text file (*.csv);;All files (*.*)
// @inputfilefilter.de = Text datei (*.csv);;All files (*.*)
// @inputfilefilter.fr = Fichier text(*.csv);;All files (*.*)
// @inputfilefilter.it = File testo (*.csv);;All files (*.*)


// Register test case to be executed
Test.registerTestCase(new ExportInvoices());

// Here we define the class, the name of the class is not important
function ExportInvoices() {

}

// This method will be called at the beginning of the test case
ExportInvoices.prototype.initTestCase = function() {

}

// This method will be called at the end of the test case
ExportInvoices.prototype.cleanupTestCase = function() {

}

// This method will be called before every test method is executed
ExportInvoices.prototype.init = function() {

}

// This method will be called after every test method is executed
ExportInvoices.prototype.cleanup = function() {

}

ExportInvoices.prototype.testBananaExtension = function() {

	let banDoc = Banana.application.openDocument("file:script/../test/testcases/invoices_excl_vat.ac2");
	Test.assert(banDoc);

	let invoicesTable = banDoc.table("Invoices");

    if (!invoicesTable) {
        return
    }

	let csv = "InvoiceNumber,InvoiceDate,InvoiceDueDate,InvoiceDescription,InvoiceDiscount,InvoiceCurrency, \
               InvoiceAmountType,CustomerNumber,CustomerName,ItemNumber,ItemDescription,ItemQuantity, \
               ItemUnitPrice,ItemUnit,ItemVatRate,ItemVatCode,ItemDiscount,ItemTotal,ItemVatTotal\n";

    for (let i = 0; i < invoicesTable.rowCount; i++) {
        let row = invoicesTable.row(i);
        if (row) {
            try {
                let invoiceFieldObj = JSON.parse(row.value("InvoiceData"));
                let invoiceObj = JSON.parse(invoiceFieldObj.invoice_json);
                csv += `${invoiceObj.document_info.number},${invoiceObj.document_info.date},${invoiceObj.document_info.description},${invoiceObj.customer_info.number},${invoiceObj.billing_info.total_to_pay}\n`;
            }
            catch(e) {
                return null;
            }
        }
      }
    
	Test.logger.addCsv("Test 'Invoices'", csv);


}