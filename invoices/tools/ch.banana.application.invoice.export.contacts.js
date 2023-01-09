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
    let csv = "";

    if (!contactsTable) {
        return
    }

    let contactsData = generateCsvContacts(contactsTable);

    if (!contactsData) 
        return "";
    
    csv += contactsData;
      
    return csv;
}

function getValue(column) {
    // Check if a column is empty 
    return column ? column : ''
}

function generateCsvContacts(contactsTable) {
    let csv = '';
    let header = "Number,OrganisationName,OrganisationUnit,NamePrefix,FirstName,LastName,Street,AddressExtra,POBox,PostalCode,Locality,CountryCode,LanguageCode,EmailWork,Discount \n";
    let rowMatched = true;
    for (let i = 0; i < contactsTable.rowCount; i++) {
        let row = contactsTable.row(i);
        if (!row.isEmpty) {
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
                    row.addMessage("Number is a required field", id);
                    rowMatched = false;
                } if (!organisation) {
                    row.addMessage("Organisation name is a required field", organisation);
                    rowMatched = false;
                } if (!first_name) {
                    row.addMessage("FirstName is a required field", first_name);
                    rowMatched = false;
                } if (!last_name) {
                    row.addMessage("LastName is a required field", last_name);
                    rowMatched = false;
                } if (!street) {
                    row.addMessage("Street is a required field", street);
                    rowMatched = false;
                } if (!postalCode) {
                    row.addMessage("PostalCode is a required field", postalCode);
                    rowMatched = false;
                } if (!locality) {
                    row.addMessage("Locality is a required field", locality);
                    rowMatched = false;
                } if (!countryCode) {
                    row.addMessage("CountryCode is a required field", countryCode);
                    rowMatched = false;
                }
                csv += `${getValue(id)},${getValue(organisation)},${getValue(organisationUnit)},${getValue(namePrefix)},${getValue(first_name)},${getValue(last_name)},${getValue(street)},${getValue(extraAddress)},${getValue(poBox)},${getValue(postalCode)},${getValue(locality)},${getValue(countryCode)},${getValue(languageCode)},${getValue(workEmail)},${getValue(discount)} \n`;
            }
            catch(e) {
                Banana.document.addMessage(`An error occured while exporting the csv invoice! \nError Description: ${e}`);
            }
        }
    }
    
    if (rowMatched) {
        return header + csv;
    } else {
        Banana.document.addMessage("Complete the missing details first, as listed in the message pane below.");
        return "";
    }
}
