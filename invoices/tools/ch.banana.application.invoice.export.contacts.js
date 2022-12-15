// @id = ch.banana.application.invoice.export.contacts
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
    let csv = "Number,OrganisationName,OrganisationUnit,NamePrefix,FirstName,LastName, \
               Street,AddressExtra,POBox,PostalCode,Locality,CountryCode,LanguageCode, \
               EmailWork,Discount \n";

    csv += generateCsvContacts(contactsTable);
      
    return csv;
}

function getValue(column) {
    // Check if a column is empty 
    return column ? column : ''
}

function generateCsvContacts(contactsTable) {
    let csv = '';
    for (let i = 0; i < contactsTable.rowCount; i++) {
        let row = contactsTable.row(i);
        if (row) {
            try {
                let id = row.value("RowId");
                let organisation = row.value("OrganisationName");
                let organisationUnit = row.value("OrganisationUnit");
                let namePrefix = row.value("NamePrefix");
                let first_name = row.value("FirstName");
                let last_name = row.value("FamilyName");
                let street = row.value("Street");
                let extraAddress = row.value("AddressExtra");
                let poBox = row.value("POBox");
                let postalCode = row.value("PostalCode");
                let locality = row.value("Locality");
                let countryCode = row.value("CountryCode");
                let languageCode = row.value("LanguageCode");
                let workEmail = row.value("EmailWork");
                let discount = row.value("Discount");
                if (!id) {
                    Banana.document.addMessage("Number is a required field");
                    return;
                } else if (!organisation) {
                    Banana.document.addMessage("Organisation name is a required field");
                    return;
                } else if (!first_name) {
                    Banana.document.addMessage("FirstName is a required field");
                    return;
                } else if (!last_name) {
                    Banana.document.addMessage("LastName is a required field");
                    return;
                } else if (!street) {
                    Banana.document.addMessage("Street is a required field");
                    return;
                } else if (!postalCode) {
                    Banana.document.addMessage("PostalCode is a required field");
                    return;
                } else if (!locality) {
                    Banana.document.addMessage("Locality is a required field");
                    return;
                } else if (!countryCode) {
                    Banana.document.addMessage("CountryCode is a required field");
                    return;
                }
                csv += `${getValue(id)}, \
                        ${getValue(organisation)}, \
                        ${getValue(organisationUnit)}, \
                        ${getValue(namePrefix)}, \
                        ${getValue(first_name)}, \
                        ${getValue(last_name)}, \
                        ${getValue(street)}, \
                        ${getValue(extraAddress)}, \
                        ${getValue(poBox)}, \
                        ${getValue(postalCode)}, \
                        ${getValue(locality)}, \
                        ${getValue(countryCode)}, \
                        ${getValue(languageCode)}, \
                        ${getValue(workEmail)}, \
                        ${getValue(discount)} \n`;
            }
            catch(e) {
                Banana.document.addMessage(`An error occured while exporting the csv invoice! \nError Description: ${e}`);;
            }
        }
    }
    
    return csv;
}
