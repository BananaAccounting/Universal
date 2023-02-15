// @id = export_contacts
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

    let contactsData = generateCsvContacts(contactsTable, false);

    if (!contactsData) 
        return "";
    
    csv += contactsData;
      
    return csv;
}

function getValue(column) {
    // Check if a column is empty 
    return column ? column : ''
}

function generateCsvContacts(contactsTable, isTest) {
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
                    if (!isTest)
                        row.addMessage(qsTr("RowId is a required field"), id);
                    else    
                        Test.logger.addText("RowId is a required field");
                    rowMatched = false;
                } 
                if (!organisation && !first_name && !last_name) {
                    if (!isTest) {
                        row.addMessage(qsTr("Organisation name is a required field"), organisation);
                    
                        row.addMessage(qsTr("FirstName is a required field"), first_name);
                    
                        row.addMessage(qsTr("LastName is a required field"), last_name);
                    } else {
                        Test.logger.addText("Organisation name is a required field");

                        Test.logger.addText("FirstName is a required field");

                        Test.logger.addText("LastName is a required field");
                    }
                    
                    rowMatched = false;
                } 
                if ((!organisation && first_name && !last_name) || (!organisation && !first_name && last_name)) {
                    if (!organisation) {
                        if (!isTest)
                            row.addMessage(qsTr("Organisation name is a required field"), organisation);
                        else 
                        Test.logger.addText("Organisation name is a required field");
                    }
                        
                    
                    if (!first_name) {
                        if (!isTest)
                            row.addMessage(qsTr("FirstName is a required field"), first_name);
                        else
                            Test.logger.addText("FirstName is a required field");
                    }
                        
                    
                    if (!last_name) {
                        if (!isTest)
                            row.addMessage(qsTr("LastName is a required field"), last_name);
                        else 
                            Test.logger.addText("LastName is a required field");
                    }
                        

                    rowMatched = false;
                }
                 
                if (!street) {
                    if (!isTest)
                        row.addMessage(qsTr("Street is a required field"), street);
                    else 
                        Test.logger.addText("Street is a required field");
                    rowMatched = false;
                } 
                if (!postalCode) {
                    if (!isTest)
                        row.addMessage(qsTr("PostalCode is a required field"), postalCode);
                    else
                        Test.logger.addText("PostalCode is a required field");
                    rowMatched = false;
                } 
                if (!locality) {
                    if (!isTest)
                        row.addMessage(qsTr("Locality is a required field"), locality);
                    else
                        Test.logger.addText("Locality is a required field");
                    rowMatched = false;
                } 
                if (!countryCode) {
                    if (!isTest)
                        row.addMessage(qsTr("CountryCode is a required field"), countryCode);
                    else
                        Test.logger.addText("CountryCode is a required field");
                    rowMatched = false;
                }
                csv += `${getValue(id)},${getValue(organisation)},${getValue(organisationUnit)},${getValue(namePrefix)},${getValue(first_name)},${getValue(last_name)},${getValue(street)},${getValue(extraAddress)},${getValue(poBox)},${getValue(postalCode)},${getValue(locality)},${getValue(countryCode)},${getValue(languageCode)},${getValue(workEmail)},${getValue(discount)} \n`;
            }
            catch(e) {
                Banana.document.addMessage(qsTr("An error occured while exporting the csv contacts! ") + "\n" + qsTr("Error Description: ") + e);
            }
        }
    }
    
    if (rowMatched) {
        return header + csv;
    } else {
        if (!isTest)
            Banana.document.addMessage(qsTr("Complete the missing details first, as listed in the message pane below."));
        else
            Test.logger.addText("Complete the missing details first, as listed in the message pane below.");
        return "";
    }
}
