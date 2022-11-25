// @id = ch.banana.application.invoice.export.invoices
// @api = 1.0
// @pubdate = 2022-10-24
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

/**
 * Parse the file and create a document change document to import the imvoices.
 */
function exec() {
    let invoicesTable = Banana.document.table("Invoices");

    if (!invoicesTable) {
        return
    }

    let csv = "InvoiceNumber,InvoiceDate,InvoiceDescription,CustomerNumber,ItemTotal\n";

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
      
    return csv;
}
