// @id = ch.banana.application.invoice.import.invoices
// @api = 1.0
// @pubdate = 2022-10-24
// @publisher = Banana.ch SA
// @description = Export contacts
// @description.de = Kontakte exportieren
// @description.fr = Exporter contacts
// @description.it = Esporta contatti
// @doctype = 400.400
// @docproperties =
// @task = export.file
// @exportfiletype = csv
// @exportfilename = contacts
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
    let contactsTable = Banana.document.table("Contacts");

    if (!contactsTable) {
        return
    }
    let csv = "Number,OrganisationName,FirstName,LastName,OrganisationTitle\n";

    for (let i = 0; i < contactsTable.rowCount; i++) {
        let row = contactsTable.row(i);
        if (row) {
            try {
                let id = row.value("RowId");
                let organisation = row.value("OrganisationName");
                let first_name = row.value("FirstName");
                let last_name = row.value("FamilyName");
                let title = row.value("OrganisationTitle");
                csv += `${id},${organisation},${first_name},${last_name},${title}\n`;
            }
            catch(e) {
                return null;
            }
        }
      }
      
    return csv;
}
