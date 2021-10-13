// Copyright [2021] [Banana.ch SA - Lugano Switzerland]
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//     http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// @id = ch.banana.uni.app.letter.js
// @api = 1.0
// @pubdate = 2021-10-11
// @publisher = Banana.ch SA
// @description = [DEV] Letter
// @description.de = [DEV] Letter
// @description.it = [DEV] Letter
// @description.fr = [DEV] Letter
// @description.en = [DEV] Letter
// @description.nl = [DEV] Letter
// @description.pt = [DEV] Letter
// @doctype = *
// @task = app.command
// @timeout = -1

/*
*   This Extension prints a letter for the selected member:
*   - a single member ("10011" or  ";10011")
*   - more members separated by "," ("10001,10011,10012" or ";10001,;10011,;10012")
*   - all the memebers empty field
*   
*   It works for simple and double accounting files.
*/



// https://www.bigomega.dev/markdown-parser





function exec(inData, options) {
    
    if (!Banana.document) {
        return "@Cancel";
    }

    var lang = getLang(Banana.document);
    if (!lang) {
        lang = "en";
    }

    var texts = loadTexts(Banana.document,lang);
    var userParam = initUserParam();

    // Retrieve saved param
    var savedParam = Banana.document.getScriptSettings();
    if (savedParam && savedParam.length > 0) {
        userParam = JSON.parse(savedParam);
    }

    // If needed show the settings dialog to the user
    if (!options || !options.useLastSettings) {
        userParam = settingsDialog(); // From properties
    }

    if (!userParam) {
        return "@Cancel";
    }

    // Retrieves all the donors to print
    var accounts = getAccountsToPrint(Banana.document, userParam, texts);

    // Creates the report
    if (accounts.length > 0) {

        // CSS variable starts with $
        var variables = {};
        set_variables(variables, userParam);

    	var stylesheet = Banana.Report.newStyleSheet();
        var report = print_report(Banana.document, userParam, accounts, texts, stylesheet, variables);

        if (userParam.useMarkdown) {
            // ???
        }
        else {
            setCss(Banana.document, stylesheet, userParam, variables);
        }

        Banana.Report.preview(report, stylesheet);
    }
    else {
        return "@Cancel";
    }
}

function print_report(banDoc, userParam, accounts, texts, stylesheet) {

    var report = Banana.Report.newReport(texts.reportTitle);

    print_header(report, banDoc, userParam, stylesheet);
    
    // Create the report for each cc3
    for (var k = 0; k < accounts.length; k++) {

        print_address(report, banDoc, userParam, accounts[k]);
        print_letter(report, banDoc, userParam, accounts[k]);
        print_signature(report, banDoc, userParam);
        
        // Page break at the end of all the pages (except the last)
        if (k < accounts.length-1) {
            report.addPageBreak();
        }
    }

    return report;
}

function print_header(report, banDoc, userParam, stylesheet) {
    
    // Logo
    var headerParagraph = report.getHeader().addSection();
    if (userParam.printHeaderLogo) {
        headerParagraph = report.addSection("");
        var logoFormat = Banana.Report.logoFormat(userParam.headerLogoName);
        if (logoFormat) {
            var logoElement = logoFormat.createDocNode(headerParagraph, stylesheet, "logo");
            report.getHeader().addChild(logoElement);
        }
    }

    // Address of the sender (Organization)
    var company = banDoc.info("AccountingDataBase","Company");
    var name = banDoc.info("AccountingDataBase","Name");
    var familyName = banDoc.info("AccountingDataBase","FamilyName");
    var address1 = banDoc.info("AccountingDataBase","Address1");
    var address2 = banDoc.info("AccountingDataBase","Address2");
    var zip = banDoc.info("AccountingDataBase","Zip");
    var city = banDoc.info("AccountingDataBase","City");
    var country = banDoc.info("AccountingDataBase","Country");
    var phone = banDoc.info("AccountingDataBase","Phone");
    var web = banDoc.info("AccountingDataBase","Web");
    var email = banDoc.info("AccountingDataBase","Email");

    if (company) {
        headerParagraph.addParagraph(company, "address");
    }
    if (name && familyName) {
        headerParagraph.addParagraph(name + " " + familyName, "address");
    } else if (!name && familyName) {
        headerParagraph.addParagraph(familyName, "address");
    } else if (name && !familyName) {
        headerParagraph.addParagraph(name, "address");
    }

    if (address1) {
        headerParagraph.addParagraph(address1, "address");
    }
    if (address2) {
        headerParagraph.addParagraph(address2, "address");
    }

    if (zip && city) {
        headerParagraph.addParagraph(zip + " " + city, "address");
    }

    if (phone) {
        headerParagraph.addParagraph("Tel. " + phone, "address");
    }

    if (web) {
        headerParagraph.addParagraph("Web: " + web, "address");
    }

    if (email) {
        headerParagraph.addParagraph("Email: " + email, "address");
    }
}

function print_address(report, banDoc, userParam, account) {

    var titleText = "";
    var text = "";
    var address = getAddress(banDoc, account);

    // Address of the membership (donor)
    var tableAddress = "";
    if (userParam.addressPositionDX != 0 || userParam.addressPositionDY != 0) {
        if (userParam.alignleft) {
            tableAddress = report.addTable("custom_tableAddress_left");
        } else {
            tableAddress = report.addTable("custom_tableAddress_right");
        }
    }
    else {
        if (userParam.alignleft) {
            tableAddress = report.addTable("tableAddress_left");
        } else {
            tableAddress = report.addTable("tableAddress_right");
        }
    }
    
    if (address.nameprefix) {
        var row = tableAddress.addRow();
        row.addCell(address.nameprefix, "address", 1);
    }

    if (address.firstname && address.familyname) {
        var row = tableAddress.addRow();
        row.addCell(address.firstname + " " + address.familyname, "address", 1);
    } else if (!address.firstname && address.familyname) {
        var row = tableAddress.addRow();
        row.addCell(address.familyname, "address", 1);
    }

    if (address.street) {
        var row = tableAddress.addRow();
        row.addCell(address.street, "address", 1);
    }

    if (address.postalcode && address.locality) {
        var row = tableAddress.addRow();
        row.addCell(address.postalcode + " " + address.locality, "address", 1);
    }
}

function print_letter(report, banDoc, userParam, account) {
    var text = "";
    var address = getAddress(banDoc, account);
    if (userParam.letterText) {
        text = convertFields(banDoc, userParam.letterText, address, account);
        report.addParagraph(text, "textLetter");
    }
}

function print_signature(report, banDoc, userParam) {

    var company = banDoc.info("AccountingDataBase","Company");

    // Signature
    report.addParagraph(" ", "");
    report.addParagraph(" ", "");
    report.addParagraph(" ", "");
    
    var tableSignature = report.addTable("table04");
    tableSignature.setStyleAttributes("width:100%");
    var col1 = tableSignature.addColumn("col1").setStyleAttributes("width:60%");
    var col2 = tableSignature.addColumn("col2").setStyleAttributes("width:40%");

    tableRow = tableSignature.addRow();
    tableRow.addCell(userParam.localityAndDate, "bold", 1);
    tableRow.addCell(userParam.signature, "bold", 1);
    tableRow = tableSignature.addRow();
    tableRow.addCell();
    tableRow.addCell(company, "");

    if (userParam.printLogo) {
        tableRow = tableSignature.addRow();
        tableRow.addCell();
        tableRow.addCell().addImage(userParam.signatureImage, "imgSignature");
    }
}


/**
 * UTILITIES
 */

/* Function that retrieves the donors account to print.
   As default, accounts with donation amount 0 are not taken.
   User can choose to include them or not */
function getAccountsToPrint(banDoc, userParam, texts) {

    // Get the list of all the donors (CC3)
    var membershipList = getCC3Accounts(banDoc);
    var accounts = [];

    if (userParam.costcenter) {
        var list = userParam.costcenter.split(",");
        for (var i = 0; i < list.length; i++) {
            list[i] = list[i].trim();
            
            // If user insert the Cc3 account without ";" we add it
            if (list[i].substring(0,1) !== ";") {
                list[i] = ";"+list[i];
            }

            // The inserted Cc3 exists
            if (membershipList.indexOf(list[i]) > -1) {
                accounts.push(list[i]);
            }
            else { // The inserted Cc3 does not exists
                Banana.document.addMessage(texts.warningMessage + ": <" + list[i] + ">");              
            }
        }
    }
    // Empty field = take all the Cc3
    else if (!userParam.costcenter || userParam.costcenter === "" || userParam.costcenter === undefined) {
        for (var i = 0; i < membershipList.length; i++) {
            accounts.push(membershipList[i]);
        }
    }
    return accounts;
}

/* Function that retrieves the address of the given account */
function getAddress(banDoc, accountNumber) {
    var address = {};
    var table = banDoc.table("Accounts");
    for (var i = 0; i < table.rowCount; i++) {
        var tRow = table.row(i);
        var account = tRow.value("Account");

        if (accountNumber === account) {

            address.nameprefix = tRow.value("NamePrefix");
            address.firstname = tRow.value("FirstName");
            address.familyname = tRow.value("FamilyName");
            address.street = tRow.value("Street");
            address.postalcode = tRow.value("PostalCode");
            address.locality = tRow.value("Locality");
            address.organisationname = tRow.value("OrganisationName");
            address.addressextra = tRow.value("AddressExtra");
            address.pobox = tRow.value("POBox");
            address.region = tRow.value("Region");
            address.country = tRow.value("Country");
        }
    }
    return address;
}

/* Function that retrieves in a list all the CC3 accounts */
function getCC3Accounts(banDoc) {
    var membershipList = [];
    var accountsTable = banDoc.table("Accounts");
    for (var i = 0; i < accountsTable.rowCount; i++) {
        var tRow = accountsTable.row(i);
        var account = tRow.value("Account");
        if (account.substring(0,1) === ";" && account.substring(1,2) !== "") {
            membershipList.push(account);
        }
    }
    return membershipList;
}

/* Function that replaces the tags with the respective data */
function convertFields(banDoc, text, address, account) {

    if (text.indexOf("{{Account}}") > -1) {
        text = text.replace(/{{Account}}/g,account);
    }
    if (text.indexOf("{{FirstName}}") > -1) {
        var firstname = address.firstname;
        text = text.replace(/{{FirstName}}/g,firstname);
    }
    if (text.indexOf("{{FamilyName}}") > -1) {
        var familyname = address.familyname;
        text = text.replace(/{{FamilyName}}/g,familyname);
    }    
    if (text.indexOf("{{Address}}") > -1) {
        var addressstring = address.street + ", " + address.postalcode + " " + address.locality;
        text = text.replace(/{{Address}}/g,addressstring);
    }
    if (text.indexOf("{{Currency}}") > -1) {
        var currency = banDoc.info("AccountingDataBase", "BasicCurrency");
        text = text.replace(/{{Currency}}/g,currency);
    }
    if (text.indexOf("{{NamePrefix}}") > -1) {
        text = text.replace(/{{NamePrefix}}/g,address.nameprefix);
    }
    if (text.indexOf("{{OrganisationName}}") > -1) {
        text = text.replace(/{{OrganisationName}}/g,address.organisationname);
    }
    if (text.indexOf("{{AddressExtra}}") > -1) {
        text = text.replace(/{{AddressExtra}}/g,address.addressextra);
    }
    if (text.indexOf("{{POBox}}") > -1) {
        text = text.replace(/{{POBox}}/g,address.pobox);
    }
    if (text.indexOf("{{Region}}") > -1) {
        text = text.replace(/{{Region}}/g,address.region);
    }
    if (text.indexOf("{{Country}}") > -1) {
        text = text.replace(/{{Country}}/g,address.country);
    }
    return text;
}


/**
 * PARAMETERS
 */

/* Function that converts parameters of the dialog */
function convertParam(userParam) {

    var convertedParam = {};
    convertedParam.version = '1.0';
    convertedParam.data = []; /* array dei parametri dello script */

    //Cc3 (donor)
    var currentParam = {};
    currentParam.name = 'costcenter';
    currentParam.title = texts.accountNumber;
    currentParam.type = 'string';
    currentParam.value = userParam.costcenter ? userParam.costcenter : '';
    currentParam.defaultvalue = '';
    currentParam.readValue = function() {
        userParam.costcenter = this.value;
    }
    convertedParam.data.push(currentParam);

    //function
    var currentParam = {};
    currentParam.name = 'function';
    currentParam.title = texts.function;
    currentParam.type = 'multilinestring';
    currentParam.value = userParam.function ? userParam.function : '';
    currentParam.defaultvalue = '';
    currentParam.readValue = function() {
        userParam.function = this.value;
    }
    convertedParam.data.push(currentParam);

    // Group title - Address
    var currentParam = {};
    currentParam.name = 'address';
    currentParam.title = texts.address;
    currentParam.type = 'string';
    currentParam.value = userParam.address ? userParam.address : '';
    currentParam.readValue = function() {
        userParam.address = this.value;
    }
    convertedParam.data.push(currentParam);

    // Address align left
    var currentParam = {};
    currentParam.name = 'alignleft';
    currentParam.parentObject = 'address';
    currentParam.title = texts.alignleft;
    currentParam.type = 'bool';
    currentParam.value = userParam.alignleft ? true : false;
    currentParam.defaultvalue = false;
    currentParam.readValue = function() {
        userParam.alignleft = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.name = 'addressPositionDX';
    currentParam.parentObject = 'address';
    currentParam.title = texts.addressPositionDX;
    currentParam.type = 'number';
    currentParam.value = userParam.addressPositionDX ? userParam.addressPositionDX : '0';
    currentParam.defaultvalue = '0';
    currentParam.readValue = function() {
        userParam.addressPositionDX = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.name = 'addressPositionDY';
    currentParam.parentObject = 'address';
    currentParam.title = texts.addressPositionDY;
    currentParam.type = 'number';
    currentParam.value = userParam.addressPositionDY ? userParam.addressPositionDY : '0';
    currentParam.defaultvalue = '0';
    currentParam.readValue = function() {
        userParam.addressPositionDY = this.value;
    }
    convertedParam.data.push(currentParam);

    // Group title - Texts
    var currentParam = {};
    currentParam.name = 'texts';
    currentParam.title = texts.textsGroup;
    currentParam.type = 'string';
    currentParam.value = userParam.texts ? userParam.texts : '';
    currentParam.readValue = function() {
        userParam.texts = this.value;
    }
    convertedParam.data.push(currentParam);

    // Use Markdown
    var currentParam = {};
    currentParam.name = 'useMarkdown';
    currentParam.parentObject = 'texts';
    currentParam.title = texts.useMarkdown;
    currentParam.type = 'bool';
    currentParam.value = userParam.useMarkdown ? true : false;
    currentParam.defaultvalue = false;
    currentParam.readValue = function() {
        userParam.useMarkdown = this.value;
    }
    convertedParam.data.push(currentParam);

    //Free text
    var currentParam = {};
    currentParam.name = 'letterText';
    currentParam.parentObject = 'texts';
    currentParam.title = texts.letterText;
    currentParam.type = 'multilinestring';
    currentParam.value = userParam.letterText ? userParam.letterText : '';
    currentParam.defaultvalue = '';
    currentParam.readValue = function() {
        userParam.letterText = this.value;
    }
    convertedParam.data.push(currentParam);

    // Group title - Signature
    var currentParam = {};
    currentParam.name = 'signature';
    currentParam.title = texts.signature;
    currentParam.type = 'string';
    currentParam.value = userParam.signature ? userParam.signature : '';
    currentParam.readValue = function() {
        userParam.signature = this.value;
    }
    convertedParam.data.push(currentParam);

    // locality and date
    var currentParam = {};
    currentParam.name = 'localityAndDate';
    currentParam.parentObject = 'signature';
    currentParam.title = texts.localityAndDate;
    currentParam.type = 'string';
    currentParam.value = userParam.localityAndDate ? userParam.localityAndDate : '';
    currentParam.defaultvalue = '';
    currentParam.readValue = function() {
        userParam.localityAndDate = this.value;
    }
    convertedParam.data.push(currentParam);

    // image for signature
    var currentParam = {};
    currentParam.name = 'printLogo';
    currentParam.parentObject = 'signature';
    currentParam.title = texts.signature_image;
    currentParam.type = 'bool';
    currentParam.value = userParam.printLogo ? true : false;
    currentParam.defaultvalue = false;
    currentParam.readValue = function() {
     userParam.printLogo = this.value;
    }
    convertedParam.data.push(currentParam);

    // image for signature
    var currentParam = {};
    currentParam.name = 'signatureImage';
    currentParam.parentObject = 'signature';
    currentParam.title = texts.signatureImage;
    currentParam.type = 'string';
    currentParam.value = userParam.signatureImage ? userParam.signatureImage : 'documents:<image_id>';
    currentParam.defaultvalue = 'documents:<image_id>';
    currentParam.readValue = function() {
     userParam.signatureImage = this.value;
    }
    convertedParam.data.push(currentParam);

    // image height
    var currentParam = {};
    currentParam.name = 'imageHeight';
    currentParam.parentObject = 'signature';
    currentParam.title = texts.imageHeight;
    currentParam.type = 'number';
    currentParam.value = userParam.imageHeight ? userParam.imageHeight : '10';
    currentParam.defaultvalue = '';
    currentParam.readValue = function() {
     userParam.imageHeight = this.value;
    }
    convertedParam.data.push(currentParam);

    // Group title - Styles
    var currentParam = {};
    currentParam.name = 'styles';
    currentParam.title = texts.styles;
    currentParam.type = 'string';
    currentParam.value = userParam.styles ? userParam.styles : '';
    currentParam.readValue = function() {
        userParam.styles = this.value;
    }
    convertedParam.data.push(currentParam);

	currentParam = {};
	currentParam.name = 'printHeaderLogo';
	currentParam.parentObject = 'styles';
	currentParam.title = texts.printHeaderLogo;
	currentParam.type = 'bool';
	currentParam.value = userParam.printHeaderLogo ? true : false;
    currentParam.defaultvalue = false;
	currentParam.readValue = function() {
	userParam.printHeaderLogo = this.value;
	}
	convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.name = 'headerLogoName';
    currentParam.parentObject = 'styles'
    currentParam.title = texts.headerLogoName;
    currentParam.type = 'string';
    currentParam.value = userParam.headerLogoName ? userParam.headerLogoName : 'Logo';
    currentParam.defaultvalue = 'Logo';
    currentParam.readValue = function() {
        userParam.headerLogoName = this.value;
    }
    convertedParam.data.push(currentParam);

    // Font type
    var currentParam = {};
    currentParam.name = 'fontFamily';
    currentParam.parentObject = 'styles'
    currentParam.title = texts.fontFamily;
    currentParam.type = 'string';
    currentParam.value = userParam.fontFamily ? userParam.fontFamily : 'Helvetica';
    currentParam.defaultvalue = 'Helvetica';
    currentParam.readValue = function() {
        userParam.fontFamily = this.value;
    }
    convertedParam.data.push(currentParam);

    // Font size
    var currentParam = {};
    currentParam.name = 'fontSize';
    currentParam.parentObject = 'styles'
    currentParam.title = texts.fontSize;
    currentParam.type = 'string';
    currentParam.value = userParam.fontSize ? userParam.fontSize : '10';
    currentParam.defaultvalue = '10';
    currentParam.readValue = function() {
        userParam.fontSize = this.value;
    }
    convertedParam.data.push(currentParam);

    return convertedParam;
}

/* Function that initializes the user parameters */
function initUserParam() {
    var userParam = {};
    userParam.version = '1.0';
    userParam.costcenter = '';
    userParam.function = '';
    userParam.address = '';
    userParam.alignleft = false;
    userParam.addressPositionDX = '0';
    userParam.addressPositionDY = '0';
    userParam.texts = '';
    userParam.useMarkdown = false;
    userParam.letterText = '';
    userParam.signature = '';
    userParam.localityAndDate = '';
    userParam.printLogo = '';
    userParam.signatureImage = '';
    userParam.imageHeight = '';
    userParam.styles = '';
    userParam.printHeaderLogo = false;
    userParam.headerLogoName = 'Logo';
    userParam.fontFamily = '';
    userParam.fontSize = '';
    return userParam;
}

/* Function that shows the dialog window and var user to modify the parameters */
function parametersDialog(userParam) {

    if (typeof(Banana.Ui.openPropertyEditor) !== 'undefined') {
        var dialogTitle = texts.dialogTitle;
        var convertedParam = convertParam(userParam);
        var pageAnchor = 'dlgSettings';
        if (!Banana.Ui.openPropertyEditor(dialogTitle, convertedParam, pageAnchor)) {
            return null;
        }
        
        for (var i = 0; i < convertedParam.data.length; i++) {
            // Read values to userParam (through the readValue function)
            convertedParam.data[i].readValue();
        }
    }
    
    return userParam;
}

/* Function that shows a dialog window for the period and var user to modify the parameters */
function settingsDialog() {

    var lang = getLang(Banana.document);
    if (!lang) {
        lang = "en";
    }
    texts = loadTexts(Banana.document,lang);
    var scriptform = initUserParam();
    
    // Retrieve saved param
    var savedParam = Banana.document.getScriptSettings();
    if (savedParam && savedParam.length > 0) {
        scriptform = JSON.parse(savedParam);
    }

    scriptform = parametersDialog(scriptform); // From propertiess
    if (scriptform) {
        var paramToString = JSON.stringify(scriptform);
        Banana.document.setScriptSettings(paramToString);
    }

    return scriptform;
}



/**
 * LANG AND TEXTS
 */

/* Function that takes the locale language of Banana */
function getLang(banDoc) {
    var lang = banDoc.locale;
    if (lang && lang.length > 2)
        lang = lang.substr(0, 2);
    return lang;
}

/* Function that loads all the default texts used for the dialog and the report  */
function loadTexts(banDoc,lang) {

    var texts = {};

    if (lang === "de") {
        texts.reportTitle = "";
        texts.dialogTitle = "Einstellungen";
        texts.warningMessage = "Ungültiges Mitgliedkonto Konto";
        texts.accountNumber = "Mitgliedskonto eingeben (leer = alle ausdrucken)";
        texts.localityAndDate = "Ort und Datum";
        texts.signature = "Unterschrift";
        texts.signature_image = "Unterschrift mit Bild";
        texts.signatureImage = "Bild";
        texts.imageHeight = "Bildhöhe (mm)";
        texts.memberAccount = "Mitgliedskonto";
        texts.letterText = "Text";
        texts.useMarkdown = "Markdown verwenden";
        texts.multilineText = "";
        texts.textsGroup = "Texte";
        texts.styles = "Stilarten";
        texts.fontFamily = "Schriftarttyp";
        texts.fontSize = "Schriftgrad";
		texts.printHeaderLogo = "Logo";
		texts.headerLogoName = "Logo-Name";
        texts.address = "Adresse";
        texts.alignleft = "Adresse linksbündig";
        texts.addressPositionDX = 'Horizontal verschieben +/- (in cm, Voreinstellung 0)';
        texts.addressPositionDY = 'Vertikal verschieben +/- (in cm, Voreinstellung 0)';
        texts.function = "Function..."
    }
    else if (lang === "fr") {
        texts.reportTitle = "";
        texts.dialogTitle = "Paramètres";
        texts.warningMessage = "Compte de membre non valide";
        texts.accountNumber = "Entrer le compte du membre (vide = imprimer tout)";
        texts.localityAndDate = "Lieu et date";
        texts.signature = "Signature";
        texts.signature_image = "Signature avec image";
        texts.signatureImage = "Image";
        texts.imageHeight = "Hauteur de l'image (mm)";
        texts.memberAccount = "Compte de membre";
        texts.letterText = "Texte";
        texts.useMarkdown = "Utiliser Markdown";
        texts.multilineText = "";
        texts.textsGroup = "Textes";
        texts.styles = "Styles";
        texts.fontFamily = "Type de police";
        texts.fontSize = "Taille de police";
		texts.printHeaderLogo = "Logo";
		texts.headerLogoName = "Logo nom";
        texts.address = "Adresse";
        texts.alignleft = "Aligner à gauche";
        texts.addressPositionDX = 'Déplacer horizontalement +/- (en cm, défaut 0)';
        texts.addressPositionDY = 'Déplacer verticalement +/- (en cm, défaut 0)';
        texts.function = "Function..."
    }
    else if (lang === "it") {
        texts.reportTitle = "Lettera";
        texts.dialogTitle = "Impostazioni";
        texts.warningMessage = "Conto membro non valido";
        texts.accountNumber = "Indicare il conto del membro (vuoto = stampa tutti)";
        texts.localityAndDate = "Località e data";
        texts.signature = "Firma";
        texts.signature_image = "Firma con immagine";
        texts.signatureImage = "Immagine";
        texts.imageHeight = "Altezza immagine (mm)";
        texts.memberAccount = "Conto del membro";
        texts.letterText = "Testo";
        texts.useMarkdown = "Usa Markdown";
        texts.multilineText = "";
        texts.textsGroup = "Testi";
        texts.styles = "Stili";
        texts.fontFamily = "Tipo di carattere";
        texts.fontSize = "Dimensione carattere";
		texts.printHeaderLogo = "Logo";
		texts.headerLogoName = "Nome logo";
        texts.address = "Indirizzo";
        texts.alignleft = "Allinea a sinistra";
        texts.addressPositionDX = 'Sposta orizzontalmente +/- (in cm, default 0)';
        texts.addressPositionDY = 'Sposta verticalmente +/- (in cm, default 0)';
        texts.function = "Function..."
    }
    else if (lang === "nl") {
        texts.reportTitle = "";
        texts.dialogTitle = "Instellingen";
        texts.warningMessage = "Ongeldige rekening gever";
        texts.accountNumber = "Rekening gever invoeren (leeg = alles afdrukken)";
        texts.localityAndDate = "Plaats en datum";
        texts.signature = "Handtekening";
        texts.signature_image = "Handtekening met afbeelding";
        texts.signatureImage = "Afbeelding";
        texts.imageHeight = "Hoogte afbeelding (mm)";
        texts.memberAccount = "Rekening gever";
        texts.letterText = "Tekst";
        texts.useMarkdown = "Gebruik Markdown";
        texts.multilineText = "";
        texts.textsGroup = "Teksten";
        texts.styles = "Stijl";
        texts.fontFamily = "Type vartertype";
        texts.fontSize = "Lettergrootte";
		texts.printHeaderLogo = "Logo";
		texts.headerLogoName = "Logo naam";
        texts.address = "Adres";
        texts.alignleft = "Links uitlijnen";
        texts.addressPositionDX = 'Horizontaal verplaatsen +/- (in cm, standaard 0)';
        texts.addressPositionDY = 'Verplaats verticaal +/- (in cm, standaard 0)';
        texts.function = "Function..."
    }
    else if (lang === "pt") {
        texts.reportTitle = "";
        texts.dialogTitle = "Configurações";
        texts.warningMessage = "Conta de membro inválida";
        texts.accountNumber = "Inserir conta de membro (vazio = imprimir todos)";
        texts.localityAndDate = "Localidade e data";
        texts.signature = "Assinatura";
        texts.signature_image = "Assinatura com imagem";
        texts.signatureImage = "Imagem";
        texts.imageHeight = "Altura da imagem (mm)";
        texts.memberAccount = "Conta de membro";
        texts.letterText = "Texto";
        texts.useMarkdown = "Use Markdown";
        texts.multilineText = "";
        texts.textsGroup = "Textos";
        texts.styles = "Estilos";
        texts.fontFamily = "Tipo de varra";
        texts.fontSize = "Tamanho da varra";
        texts.printHeaderLogo = "Logo";
        texts.headerLogoName = "Nome logótipo";
        texts.address = "Endereço";
        texts.alignleft = "Alinhar à esquerda";
        texts.addressPositionDX = 'Mover horizontalmente +/- (em cm, por defeito 0)';
        texts.addressPositionDY = 'Mover verticalmente +/- (em cm, por defeito 0)';
        texts.function = "Function..."
    }
    else { //lang == en
        texts.reportTitle = "";
        texts.dialogTitle = "Settings";
        texts.warningMessage = "Invalid member account";
        texts.accountNumber = "Insert account member (empty = print all)";
        texts.localityAndDate = "Locality and date";
        texts.signature = "Signature";
        texts.signature_image = "Signature with image";
        texts.signatureImage = "Image";
        texts.imageHeight = "Image height (mm)";
        texts.memberAccount = "Member account";
        texts.letterText = "Text";
        texts.useMarkdown = "Use Markdown";
        texts.multilineText = "";
        texts.textsGroup = "Texts";
        texts.styles = "Styles";
        texts.fontFamily = "Font type";
        texts.fontSize = "Font size";
		texts.printHeaderLogo = "Logo";
		texts.headerLogoName = "Logo name";
        texts.address = "Address";
        texts.alignleft = "Align left";
        texts.addressPositionDX = 'Move horizontally +/- (in cm, default 0)';
        texts.addressPositionDY = 'Move vertically +/- (in cm, default 0)';
        texts.function = "Function..."
    }

    return texts;
}


/**
 * STYLESHEET
 */

function set_variables(variables, userParam) {
  /** 
    Sets all the variables values.
  */

  variables.$font_family = userParam.fontFamily;
  variables.$font_size = userParam.fontSize+"pt";
  
  /* Variables that set the position of the invoice address
   * Default margins when the address on right: 10.3cm margin left, 4.5cm margin top
   * Default margins when the address on left: 2.2cm margin left, 4.5cm margin top
   * Sum userParam DX and DY adjustments to default values */
  variables.$right_address_margin_left = parseFloat(10.3) + parseFloat(userParam.addressPositionDX)+"cm";
  variables.$right_address_margin_top = parseFloat(4.5) + parseFloat(userParam.addressPositionDY)+"cm";
  variables.$left_address_margin_left = parseFloat(2.2) + parseFloat(userParam.addressPositionDX)+"cm";
  variables.$left_address_margin_top = parseFloat(4.5) + parseFloat(userParam.addressPositionDY)+"cm";
}

function replaceVariables(cssText, variables) {

  /* 
    Function that replaces all the css variables inside of the given cssText with their values.
    All the css variables start with "$" (i.e. $font_size, $margin_top)
  */

  var result = "";
  var varName = "";
  var insideVariable = false;
  var variablesNotFound = [];

  for (var i = 0; i < cssText.length; i++) {
    var currentChar = cssText[i];
    if (currentChar === "$") {
      insideVariable = true;
      varName = currentChar;
    }
    else if (insideVariable) {
      if (currentChar.match(/^[0-9a-z]+$/) || currentChar === "_" || currentChar === "-") {
        // still a variable name
        varName += currentChar;
      } 
      else {
        // end variable, any other charcter
        if (!(varName in variables)) {
          variablesNotFound.push(varName);
          result += varName;
        }
        else {
          result += variables[varName];
        }
        result += currentChar;
        insideVariable = false;
        varName = "";
      }
    }
    else {
      result += currentChar;
    }
  }

  if (insideVariable) {
    // end of text, end of variable
    if (!(varName in variables)) {
      variablesNotFound.push(varName);
      result += varName;
    }
    else {
      result += variables[varName];
    }
    insideVariable = false;
  }

  if (variablesNotFound.length > 0) {
    //Banana.console.log(">>Variables not found: " + variablesNotFound);
  }
  return result;
}

function setCss(banDoc, repStyleObj, userParam, variables) {

  var textCSS = "";

  /**
    Default CSS file
  */
  var file = Banana.IO.getLocalFile("file:script/ch.banana.uni.app.letter.css");
  var fileContent = file.read();
  if (!file.errorString) {
    Banana.IO.openPath(fileContent);
    //Banana.console.log(fileContent);
    textCSS = fileContent;
  } else {
    Banana.console.log(file.errorString);
  }

  // Replace all the "$xxx" variables with the real value
  textCSS = replaceVariables(textCSS, variables);

  // Parse the CSS text
  repStyleObj.parse(textCSS);
}

