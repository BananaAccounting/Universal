// @id = ch.banana.application.invoice.tools
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

    let contactsData = generateCsvContacts(contactsTable);

    if (!contactsData) {
        Banana.application.showMessages(true); // Be sure the user is notified
        Banana.document.addMessage(qsTr("Fix errors first, as listed in the pane Messages."), "internal_error");
        return "";
    }
      
    return contactsData;
}

function getValue(column) {
    // Check if a column is empty 
    return column ? column : ''
}

function generateCsvContacts(contactsTable) {
    let csv = '';
    let header = "Number,OrganisationName,OrganisationUnit,NamePrefix,FirstName,LastName,Street,AddressExtra,POBox,PostalCode,Locality,CountryCode,LanguageCode,EmailWork,Discount\n";
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
                    row.addMessage(qsTr("%1 is a required field").arg("RowId"), "RowId", "missing_field");
                    rowMatched = false;
                } 
                if (!organisation && !first_name && !last_name) {
                    row.addMessage(qsTr("%1 is a required field").arg("OrganisationName"), "OrganisationName", "missing_field");
                    row.addMessage(qsTr("%1 is a required field").arg("FirstName"), "FirstName", "missing_field");
                    row.addMessage(qsTr("%1 is a required field").arg("LastName"), "LastName", "missing_field");
                    rowMatched = false;
                } 
                if ((!organisation && first_name && !last_name) || (!organisation && !first_name && last_name)) {
                    if (!organisation) {
                        row.addMessage(qsTr("%1 is a required field").arg("OrganisationName"), "OrganisationName", "missing_field");
                    }
                        
                    
                    if (!first_name) {
                        row.addMessage(qsTr("%1 is a required field").arg("FirstName"), "FirstName", "missing_field");
                    }
                        
                    
                    if (!last_name) {
                        row.addMessage(qsTr("%1 is a required field").arg("LastName"), "LastName", "missing_field");
                    }

                    rowMatched = false;
                }
                 
                if (!street) {
                    row.addMessage(qsTr("%1 is a required field").arg("Street"), "Street", "missing_field");
                    rowMatched = false;
                } 
                if (!postalCode) {
                    row.addMessage(qsTr("%1 is a required field").arg("PostalCode"), "PostalCode", "missing_field");
                    rowMatched = false;
                } 
                if (!locality) {
                    row.addMessage(qsTr("%1 is a required field").arg("Locality"), "Locality", "missing_field");
                    rowMatched = false;
                } 
                if (!countryCode) {
                    row.addMessage(qsTr("%1 is a required field").arg("CountryCode"), "CountryCode", "missing_field");
                    rowMatched = false;
                }
                csv += `${getValue(id)},${getValue(organisation)},${getValue(organisationUnit)},${getValue(namePrefix)},${getValue(first_name)},${getValue(last_name)},${getValue(street)},${getValue(extraAddress)},${getValue(poBox)},${getValue(postalCode)},${getValue(locality)},${getValue(countryCode)},${getValue(languageCode)},${getValue(workEmail)},${getValue(discount)} \n`;
            }
            catch(e) {
                row.addMessage(qsTr("Contact not valid.\nError: %1").arg(e), "RowId", "internal_error");
                rowMatched = false;
            }
        }
    }
    
    if (rowMatched) {
        return header + csv;
    } 
    return null;
}
