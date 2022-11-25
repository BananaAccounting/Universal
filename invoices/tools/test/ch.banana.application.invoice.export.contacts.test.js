// @id = ch.banana.application.invoice.export.contacts.test
// @api = 1.0
// @pubdate = 2022-11-24
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
Test.registerTestCase(new ExportContacts());

// Here we define the class, the name of the class is not important
function ExportContacts() {

}

// This method will be called at the beginning of the test case
ExportContacts.prototype.initTestCase = function() {

}

// This method will be called at the end of the test case
ExportContacts.prototype.cleanupTestCase = function() {

}

// This method will be called before every test method is executed
ExportContacts.prototype.init = function() {

}

// This method will be called after every test method is executed
ExportContacts.prototype.cleanup = function() {

}

ExportContacts.prototype.testBananaExtension = function() {

	let banDoc = Banana.application.openDocument("file:script/../test/testcases/invoices_excl_vat.ac2");
	Test.assert(banDoc);

	let contactsTable = banDoc.table("Contacts");

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
    
	Test.logger.addReport("Test 'Contacts'", csv);


}