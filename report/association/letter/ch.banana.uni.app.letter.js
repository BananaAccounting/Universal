// Copyright [2023] [Banana.ch SA - Lugano Switzerland]
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
// @pubdate = 2023-04-21
// @publisher = Banana.ch SA
// @description = Letter (Banana+)
// @description.de = Brief (Banana+)
// @description.it = Lettera (Banana+)
// @description.fr = Lettre (Banana+)
// @description.en = Letter (Banana+)
// @description.nl = Brief (Banana+)
// @doctype = 100.*;110.*;130.*
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





//===========================================================================
// PARAMETERS
//===========================================================================
/* Function that converts parameters of the dialog */
function convertParam(userParam) {

    var convertedParam = {};
    convertedParam.version = '1.0';
    convertedParam.data = []; /* array dei parametri dello script */

    /**
     * ADDRESS GROUP
     */
    var currentParam = {};
    currentParam.name = 'accountsToPrint';
    currentParam.title = texts.accountsToPrint;
    currentParam.type = 'string';
    currentParam.value = '';
    currentParam.editable = false;
    currentParam.readValue = function() {
        userParam.accountsToPrint = this.value;
    }
    convertedParam.data.push(currentParam);

    //Cc3 (donor)
    var currentParam = {};
    currentParam.name = 'costcenter';
    currentParam.parentObject = 'accountsToPrint';
    currentParam.title = texts.accountNumber;
    currentParam.type = 'string';
    currentParam.value = userParam.costcenter ? userParam.costcenter : '';
    currentParam.defaultvalue = '';
    currentParam.readValue = function() {
        userParam.costcenter = this.value;
    }
    convertedParam.data.push(currentParam);

    // Use Extract table
    var currentParam = {};
    currentParam.name = 'useExtractTable';
    currentParam.parentObject = 'accountsToPrint';
    currentParam.title = texts.useExtractTable;
    currentParam.type = 'bool';
    currentParam.value = userParam.useExtractTable ? true : false;
    currentParam.defaultvalue = false;
    currentParam.readValue = function() {
        userParam.useExtractTable = this.value;
    }
    convertedParam.data.push(currentParam);


    /**
     * BEGIN GROUP
     */
    var currentParam = {};
    currentParam.name = 'begin';
    currentParam.title = texts.begin;
    currentParam.type = 'string';
    currentParam.value = '';
    currentParam.editable = false;
    currentParam.readValue = function() {
        userParam.begin = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = 'printHeaderLogo';
    currentParam.parentObject = 'begin';
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
    currentParam.parentObject = 'begin'
    currentParam.title = texts.headerLogoName;
    currentParam.type = 'string';
    currentParam.value = userParam.headerLogoName ? userParam.headerLogoName : 'Logo';
    currentParam.defaultvalue = 'Logo';
    currentParam.readValue = function() {
        userParam.headerLogoName = this.value;
    }
    convertedParam.data.push(currentParam);

    // locality and date
    var currentParam = {};
    currentParam.name = 'localityAndDate';
    currentParam.parentObject = 'begin';
    currentParam.title = texts.localityAndDate;
    currentParam.type = 'string';
    currentParam.value = userParam.localityAndDate ? userParam.localityAndDate : '';
    currentParam.defaultvalue = texts.localityAndDate;
    currentParam.readValue = function() {
        userParam.localityAndDate = this.value;
    }
    convertedParam.data.push(currentParam);


    /**
     * PRINT TEXT GROUP
     */
    var currentParam = {};
    currentParam.name = 'printText';
    currentParam.title = texts.printText;
    currentParam.type = 'string';
    currentParam.value = '';
    currentParam.editable = false;
    currentParam.readValue = function() {
        userParam.printText = this.value;
    }
    convertedParam.data.push(currentParam);


    var textChoices = [];
    textChoices.push(texts.text1);
    textChoices.push(texts.text2);
    textChoices.push(texts.text3);
    textChoices.push(texts.text4);
    textChoices.push(texts.textEmbedded);
    var currentParam = {};
    currentParam.name = 'textToUse';
    currentParam.parentObject = 'printText';
    currentParam.title = texts.textToUse;
    currentParam.type = 'combobox';
    currentParam.items = textChoices;
    currentParam.value = userParam.textToUse ? userParam.textToUse : texts.text1;
    currentParam.defaultvalue = texts.text1;
    currentParam.readValue = function () {
        userParam.textToUse = this.value;
    }
    convertedParam.data.push(currentParam);

    // Use Markdown
    var currentParam = {};
    currentParam.name = 'useMarkdown';
    currentParam.parentObject = 'printText';
    currentParam.title = texts.useMarkdown;
    currentParam.type = 'bool';
    currentParam.value = userParam.useMarkdown ? true : false;
    currentParam.defaultvalue = false;
    currentParam.readValue = function() {
        userParam.useMarkdown = this.value;
    }
    convertedParam.data.push(currentParam);


    /**
     * SIGNATURE GROUP
     */
    var currentParam = {};
    currentParam.name = 'signature';
    currentParam.title = texts.signature;
    currentParam.type = 'string';
    currentParam.value = '';
    currentParam.editable = false;
    currentParam.defaultvalue = '';
    currentParam.readValue = function() {
        userParam.signature = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.name = 'textSignature';
    currentParam.parentObject = 'signature';
    currentParam.title = texts.textSignature;
    currentParam.type = 'string';
    currentParam.value = userParam.textSignature ? userParam.textSignature : '';
    currentParam.defaultvalue = '';
    currentParam.readValue = function() {
        userParam.textSignature = this.value;
    }
    convertedParam.data.push(currentParam);

    // image for signature
    var currentParam = {};
    currentParam.name = 'printSignatureImage';
    currentParam.parentObject = 'signature';
    currentParam.title = texts.printSignatureImage;
    currentParam.type = 'bool';
    currentParam.value = userParam.printSignatureImage ? true : false;
    currentParam.defaultvalue = false;
    currentParam.readValue = function() {
     userParam.printSignatureImage = this.value;
    }
    convertedParam.data.push(currentParam);

    // image for signature
    var currentParam = {};
    currentParam.name = 'nameSignatureImage';
    currentParam.parentObject = 'signature';
    currentParam.title = texts.nameSignatureImage;
    currentParam.type = 'string';
    currentParam.value = userParam.nameSignatureImage ? userParam.nameSignatureImage : 'documents:<image_id>';
    currentParam.defaultvalue = 'documents:<image_id>';
    currentParam.readValue = function() {
     userParam.nameSignatureImage = this.value;
    }
    convertedParam.data.push(currentParam);


    /**
     * TEXTS GROUP
     */
    var currentParam = {};
    currentParam.name = 'texts';
    currentParam.title = texts.textsGroup;
    currentParam.type = 'string';
    currentParam.value = '';
    currentParam.editable = false;
    currentParam.readValue = function() {
        userParam.texts = this.value;
    }
    convertedParam.data.push(currentParam);

    //Free text 1
    var currentParam = {};
    currentParam.name = 'text1';
    currentParam.parentObject = 'texts';
    currentParam.title = texts.text1;
    currentParam.type = 'multilinestring';
    currentParam.value = userParam.text1 ? userParam.text1 : '';
    currentParam.defaultvalue = '';
    currentParam.readValue = function() {
        userParam.text1 = this.value;
    }
    convertedParam.data.push(currentParam);

    //Free text 2
    var currentParam = {};
    currentParam.name = 'text2';
    currentParam.parentObject = 'texts';
    currentParam.title = texts.text2;
    currentParam.type = 'multilinestring';
    currentParam.value = userParam.text2 ? userParam.text2 : '';
    currentParam.defaultvalue = '';
    currentParam.readValue = function() {
        userParam.text2 = this.value;
    }
    convertedParam.data.push(currentParam);

    //Free text 3
    var currentParam = {};
    currentParam.name = 'text3';
    currentParam.parentObject = 'texts';
    currentParam.title = texts.text3;
    currentParam.type = 'multilinestring';
    currentParam.value = userParam.text3 ? userParam.text3 : '';
    currentParam.defaultvalue = '';
    currentParam.readValue = function() {
        userParam.text3 = this.value;
    }
    convertedParam.data.push(currentParam);

    //Free text 4
    var currentParam = {};
    currentParam.name = 'text4';
    currentParam.parentObject = 'texts';
    currentParam.title = texts.text4;
    currentParam.type = 'multilinestring';
    currentParam.value = userParam.text4 ? userParam.text4 : '';
    currentParam.defaultvalue = '';
    currentParam.readValue = function() {
        userParam.text4 = this.value;
    }
    convertedParam.data.push(currentParam);

    //Free text Document table
    var currentParam = {};
    currentParam.name = 'embeddedTextFile';
    currentParam.parentObject = 'texts';
    currentParam.title = texts.embeddedTextFile;
    currentParam.type = 'string';
    currentParam.value = userParam.embeddedTextFile ? userParam.embeddedTextFile : '';
    currentParam.defaultvalue = '';
    currentParam.readValue = function() {
        userParam.embeddedTextFile = this.value;
    }
    convertedParam.data.push(currentParam);


    /**
     * STYLES GROUP
     */
    var currentParam = {};
    currentParam.name = 'styles';
    currentParam.title = texts.styles;
    currentParam.type = 'string';
    currentParam.value = '';
    currentParam.editable = false;
    currentParam.readValue = function() {
        userParam.styles = this.value;
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

    currentParam = {};
    currentParam.name = 'css';
    currentParam.parentObject = 'styles';
    currentParam.title = texts.css;
    currentParam.type = 'multilinestring';
    currentParam.value = userParam.css ? userParam.css : '';
    currentParam.defaultvalue = '';
    currentParam.readValue = function() {
        userParam.css = this.value;
    }
    convertedParam.data.push(currentParam);

    return convertedParam;
}

/* Function that initializes the user parameters */
function initUserParam() {
    var texts = loadTexts();
    var userParam = {};
    userParam.version = '1.0';
    userParam.costcenter = '';
    userParam.useExtractTable = false;
    userParam.textToUse = texts.text1;
    userParam.text1 = '';
    userParam.text2 = '';
    userParam.text3 = '';
    userParam.text4 = '';
    userParam.embeddedTextFile = '';
    userParam.useMarkdown = false;
    userParam.textSignature = '';
    userParam.localityAndDate = texts.localityAndDate;
    userParam.printSignatureImage = false;
    userParam.nameSignatureImage = '';
    userParam.printHeaderLogo = false;
    userParam.headerLogoName = 'Logo';
    userParam.fontFamily = 'Helvetica';
    userParam.fontSize = '10';
    userParam.css = '';
    return userParam;
}

/* Function that shows the dialog window and let user to modify the parameters */
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

/* Function that shows a dialog window for the period and let user to modify the parameters */
function settingsDialog() {

    var lang = getLang(Banana.document);
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



//===========================================================================
// PRINT REPORT
//===========================================================================
function exec(inData, options) {
    
    if (!Banana.document) {
        return "@Cancel";
    }

    //Checks Banana version and license
    var isCurrentBananaVersionSupported = bananaRequiredVersion("10.1.0.23068");
    if (!isCurrentBananaVersionSupported) {
        return "@Cancel";
    }

    var lang = getLang(Banana.document);
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
        var report = printReport(Banana.document, userParam, accounts, texts, stylesheet);
        
        setCss(Banana.document, stylesheet, userParam, variables);
        Banana.Report.preview(report, stylesheet);
    } else {
        return "@Cancel";
    }
}

/* Function that prints the report */
function printReport(banDoc, userParam, accounts, texts, stylesheet) {

    var report = Banana.Report.newReport(texts.reportTitle);
    
    printReportHeader(report, banDoc, userParam, stylesheet);
    
    for (var k = 0; k < accounts.length; k++) {
        
        printReportAddress(report, banDoc, accounts[k]);
        printReportLetter(report, banDoc, userParam, accounts[k], texts);
        printReportSignature(report, banDoc, userParam);
        
        if (k < accounts.length-1) {
            report.addPageBreak(); // Page break at the end of all the pages (not last one)
        }
    }

    return report;
}

/* Function that prints the header of the report */
function printReportHeader(report, banDoc, userParam, stylesheet) {

    // Logo
    var headerParagraph = report.getHeader().addSection();
    if (userParam.printHeaderLogo) {
        headerParagraph = report.addSection("");
        var logoFormat = Banana.Report.logoFormat(userParam.headerLogoName); //Logo
        if (logoFormat) {
            var logoElement = logoFormat.createDocNode(headerParagraph, stylesheet, "logo");
            report.getHeader().addChild(logoElement);
        } else {
            headerParagraph.addClass("header_text");
        }
    } else {
        headerParagraph.addClass("header_text");
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
        headerParagraph.addParagraph(company, "header_address");
    }
    if (name && familyName) {
        headerParagraph.addParagraph(name + " " + familyName, "header_address");
    } else if (!name && familyName) {
        headerParagraph.addParagraph(familyName, "header_address");
    } else if (name && !familyName) {
        headerParagraph.addParagraph(name, "header_address");
    }
    if (address1) {
        headerParagraph.addParagraph(address1, "header_address");
    }
    if (address2) {
        headerParagraph.addParagraph(address2, "header_address");
    }
    if (zip && city) {
        headerParagraph.addParagraph(zip + " " + city, "header_address");
    }

    var paragraph = headerParagraph.addParagraph("","header_address");
    if (phone) {
        paragraph.addText("Tel. " + phone);
    }
    if (web) {
        if (phone) {
            paragraph.addText(", ");
        } 
        paragraph.addText(web);
    }
    if (email) {
        if (phone || web) {
            paragraph.addText(", ");
        }
        paragraph.addText(email);
    }
}

/* Function that prints the address of the report */
function printReportAddress(report, banDoc, account) {

    /**
     * Print the address of the membership (CC3 account)
     */

    var address = getAddress(banDoc, account);
    var tableAddress = report.addTable("address");
    var row;

    if (address.nameprefix) {
        row = tableAddress.addRow();
        row.addCell(address.nameprefix, "", 1);
    }
    if (address.firstname && address.familyname) {
        row = tableAddress.addRow();
        row.addCell(address.firstname + " " + address.familyname, "", 1);
    } else if (!address.firstname && address.familyname) {
        row = tableAddress.addRow();
        row.addCell(address.familyname, "", 1);
    }
    if (address.street) {
        row = tableAddress.addRow();
        row.addCell(address.street, "", 1);
    }
    if (address.addressextra) {
        row = tableAddress.addRow();
        row.addCell(address.addressextra, "", 1);
    }
    if (address.pobox) {
        row = tableAddress.addRow();
        row.addCell(address.pobox, "", 1);
    }
    if (address.postalcode && address.locality) {
        row = tableAddress.addRow();
        row.addCell(address.postalcode + " " + address.locality, "", 1);
    }
}

/* Function that prints the letter of the report */
function printReportLetter(report, banDoc, userParam, account, texts) {

    /**
     * Print the text of the letter
     */

    var text = "";
    var address = getAddress(banDoc, account);


    // Locality and date
    if (userParam.localityAndDate) {
        report.addParagraph(userParam.localityAndDate, "date");
    }

    var sectionText = report.addSection("text");

    // Text of the letter
    var textselected = "";
    var usemarkdown = userParam.useMarkdown;
    if (userParam.textToUse === texts.text1) {
        textselected = userParam.text1;
    }
    else if (userParam.textToUse === texts.text2) {
        textselected = userParam.text2;
    } 
    else if (userParam.textToUse === texts.text3) {
        textselected = userParam.text3;
    } 
    else if (userParam.textToUse === texts.text4) {
        textselected = userParam.text4;
    } 
    else if (userParam.textToUse === texts.textEmbedded) {
        usemarkdown = false;
        if (userParam.embeddedTextFile.indexOf(".md") > -1) {
            usemarkdown = true;
        }
        var embeddedText = getEmbeddedTextFile(banDoc, userParam);
        textselected = embeddedText;
    }

    // Print
    if (usemarkdown) {
        var format = "md"; //md,html,text
        text = convertFieldsMarkdown(banDoc, textselected, address, account);
        sectionText.addStructuredText(text, format, ""); // "" = stylesheet
    }
    else {
        // var format = "text"; //md,html,text
        text = convertFields(banDoc, textselected, address, account);
        addNewLine(sectionText, text);
        sectionText.addParagraph(" ", "");
    }
}

/* Function that prints the signature part of the report */
function printReportSignature(report, banDoc, userParam) {

    /**
     * Print the signature of the letter
     */

    var paragraph = report.addParagraph("","signature");
    if (userParam.textSignature) {
        paragraph.addText(userParam.textSignature);
    }

    var company = banDoc.info("AccountingDataBase","Company");
    if (company) {
        paragraph.addText("\n"+company);
    }

    if (userParam.printSignatureImage && userParam.nameSignatureImage) {
        report.addImage(userParam.nameSignatureImage, "image-signature");
    }
}












/* Function that add a new line to the paragraph */
function addNewLine(reportElement, text) {

    var str = text.split('\n');
    
    for (var i = 0; i < str.length; i++) {
        if (str[i]) {
            addMdParagraph(reportElement, str[i]);
        }
        else {
            addMdParagraph(reportElement, " "); //empty lines
        }
    }
}

/* Function that add bold style to the text between '**' */
function addMdParagraph(reportElement, text) {
    
    /*
    * BOLD TEXT STYLE
    *
    * Use '**' characters where the bold starts and ends.
    *
    * - set bold all the paragraph => **This is bold text
    *                              => **This is bold text**
    *
    * - set bold single/multiple words => This is **bold** text
    *                                  => This **is bold** text
    *                                  => **This** is **bold** text
    */

    var p = reportElement.addParagraph();
    var printBold = false;
    var startPosition = 0;
    var endPosition = -1;

    do {
        endPosition = text.indexOf("**", startPosition);
        var charCount = endPosition === -1 ? text.length - startPosition : endPosition - startPosition;
        if (charCount > 0) {
            //Banana.console.log(text.substr(startPosition, charCount) + ", " + printBold);
            var span = p.addText(text.substr(startPosition, charCount), "");
            if (printBold)
                span.setStyleAttribute("font-weight", "bold");
        }
        printBold = !printBold;
        startPosition = endPosition >= 0 ? endPosition + 2 : text.length;
    } while (startPosition < text.length && endPosition >= 0);
}

/* Function that replaces the tags with the respective data */
function convertFields(banDoc, text, address, account) {

    if (text.indexOf("<Account>") > -1) {
        text = text.replace(/<Account>/g,account);
    }
    if (text.indexOf("<FirstName>") > -1) {
        var firstname = address.firstname;
        text = text.replace(/<FirstName>/g,firstname);
    }
    if (text.indexOf("<FamilyName>") > -1) {
        var familyname = address.familyname;
        text = text.replace(/<FamilyName>/g,familyname);
    }    
    if (text.indexOf("<Address>") > -1) {
        var addressstring = address.street + ", " + address.postalcode + " " + address.locality;
        text = text.replace(/<Address>/g,addressstring);
    }
    if (text.indexOf("<Currency>") > -1) {
        var currency = banDoc.info("AccountingDataBase", "BasicCurrency");
        text = text.replace(/<Currency>/g,currency);
    }
    if (text.indexOf("<Amount>") > -1) {
        var amount = Banana.Converter.toLocaleNumberFormat(totalOfDonations);
        text = text.replace(/<Amount>/g,amount);
    }
    if (text.indexOf("<NamePrefix>") > -1) {
        text = text.replace(/<NamePrefix>/g,address.nameprefix);
    }
    if (text.indexOf("<OrganisationName>") > -1) {
        text = text.replace(/<OrganisationName>/g,address.organisationname);
    }
    if (text.indexOf("<AddressExtra>") > -1) {
        text = text.replace(/<AddressExtra>/g,address.addressextra);
    }
    if (text.indexOf("<POBox>") > -1) {
        text = text.replace(/<POBox>/g,address.pobox);
    }
    if (text.indexOf("<Region>") > -1) {
        text = text.replace(/<Region>/g,address.region);
    }
    if (text.indexOf("<Country>") > -1) {
        text = text.replace(/<Country>/g,address.country);
    }
    return text;
}

/* Function that replaces the tags with the respective data */
function convertFieldsMarkdown(banDoc, text, address, account) {

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
    if (text.indexOf("{{Amount}}") > -1) {
        var amount = Banana.Converter.toLocaleNumberFormat(totalOfDonations);
        text = text.replace(/{{Amount}}/g,amount);
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





//===========================================================================
// GET DATA FROM ACCOUNTING
//===========================================================================
/* Function that retrieves the donors account to print.
   As default, accounts with donation amount 0 are not taken.
   User can choose to include them or not */
function getAccountsToPrint(banDoc, userParam, texts) {

    // Get the list of all the donors (CC3)
    var membershipList = getCC3Accounts(banDoc, userParam, texts);
    var accounts = [];
    
    if (userParam.useExtractTable) {
        for (var i = 0; i < membershipList.length; i++) {
            accounts.push(membershipList[i]);
        }
    }
    else {
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
    }

    return accounts;
}

/* Function that retrieves in a list all the CC3 accounts */
function getCC3Accounts(banDoc, userParam, texts) {
    
    var membershipList = [];
    var tableName = "Accounts";
    
    // When the Extract Rows is used, we take all the cc3 accounts from the extracted rows only => table Extract
    if (userParam.useExtractTable) {
        
        tableName = "Extract";
        
        // If the Extract table doesnt exist, use the Accounts table
        if (!banDoc.table("Extract")) {
            Banana.document.addMessage(texts.warningMessageExtractTable);
            tableName = "Accounts"; //if table Extract does not exists, use table Accounts instead
        }
    }

    var bantable = banDoc.table(tableName);
    for (var i = 0; i < bantable.rowCount; i++) {
        var tRow = bantable.row(i);
        var account = tRow.value("Account");
        if (account.substring(0,1) === ";" && account.substring(1,2)) {
            membershipList.push(account);
        }
    }

    return membershipList;
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

/* Function that takes the locale language of Banana */
function getLang(banDoc) {
    var lang = "";
    if (banDoc.locale) {
        lang = banDoc.locale;
    }
    if (lang && lang.length > 2) {
        lang = lang.substr(0, 2);
    }
    return lang;
}

/* Function that takes the content of the embedded text file in table Documents*/
function getEmbeddedTextFile(banDoc, userParam) {

    /**
     * Include the embedded text defined in the Document table as 'text file' type.
     * ID name must always finish with ".txt" or ".doc"
    */

    var text = "";
    var documentsTable = banDoc.table("Documents");
    if (documentsTable) {
        for (var i = 0; i < documentsTable.rowCount; i++) {
            var tRow = documentsTable.row(i);
            var id = tRow.value("RowId");
            if (id === userParam.embeddedTextFile) {
                // The text file name entered by user exists on Documents table
                text = banDoc.table("Documents").findRowByValue("RowId",userParam.embeddedTextFile).value("Attachments");
            }
        }
    }
    return text;
}



//===========================================================================
// STYLESHEET
//===========================================================================
/* Sets all the variables values */
function set_variables(variables, userParam) {
    if (!userParam.fontFamily) {
        userParam.fontFamily = "Helvetica";
    }

    if (!userParam.fontSize) {
        userParam.fontSize = "10";
    }

    variables.$font_family = userParam.fontFamily;
    variables.$font_size = userParam.fontSize+"pt";
}

/* Function that replaces all the css variables inside of the given cssText with their values.
   All the css variables start with "$" (i.e. $font_size, $margin_top) */
function replaceVariables(cssText, variables) {

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

/* Function that set the CSS used to print the report */
function setCss(banDoc, repStyleObj, userParam, variables) {

  var textCSS = "";

  //Default CSS file
  var file = Banana.IO.getLocalFile("file:script/ch.banana.uni.app.letter.css");
  var fileContent = file.read();
  if (!file.errorString) {
    Banana.IO.openPath(fileContent);
    //Banana.console.log(fileContent);
    textCSS = fileContent;
  } else {
    Banana.console.log(file.errorString);
  }

  // User defined CSS in parameters
  if (userParam.css) {
    textCSS += userParam.css;
  }

  // Replace all the "$xxx" variables with the real value
  textCSS = replaceVariables(textCSS, variables);

  // Parse the CSS text
  repStyleObj.parse(textCSS);
}




//===========================================================================
// TEXTS
//===========================================================================
/* Function that loads all the default texts used for the dialog and the report  */
function loadTexts(banDoc,lang) {

    var texts = {};

    if (lang === "de") {
        texts.reportTitle = "Brief";
        texts.dialogTitle = "Einstellungen";
        texts.warningMessage = "Ungültiges Mitgliedkonto Konto";
        texts.accountNumber = "Mitgliedskonto eingeben (leer = alle ausdrucken)";
        texts.localityAndDate = "Ort und Datum";
        texts.signature = "Unterschrift";
        texts.printSignatureImage = "Digitale Unterschrift";
        texts.nameSignatureImage = "Bild mit Unterschrift";
        texts.memberAccount = "Mitgliedskonto";
        texts.text1 = "Text 1";
        texts.text2 = "Text 2";
        texts.text3 = "Text 3";
        texts.text4 = "Text 4";
        texts.textsGroup = "Texte";
        texts.styles = "Stilarten";
        texts.fontFamily = "Schriftarttyp";
        texts.fontSize = "Schriftgrad";
        texts.printHeaderLogo = "Logo";
        texts.headerLogoName = "Logo-Name";
        texts.useMarkdown = "Markdown verwenden";
        texts.useExtractTable = "Tabelle Extraktion verwenden";
        texts.warningMessageExtractTable = "Verwenden Sie den Befehl Daten > Zeilen extrahieren und sortieren";
        texts.embeddedTextFile = "Text Tabelle Dokumente (.txt / .md)";
        texts.css = "CSS";
        texts.textSignature = "Text Unterschrift";
        texts.textToUse = "Text auswählen";
        texts.textEmbedded = "Text Tabelle Dokumente (.txt / .md)";
        texts.accountsToPrint = "Adressen für den Ausdruck auswählen";
        texts.printText = "Text ausdrucken";
        texts.begin = "Beginn";
    }
    else if (lang === "fr") {
        texts.reportTitle = "Lettre";
        texts.dialogTitle = "Paramètres";
        texts.warningMessage = "Compte de membre non valide";
        texts.accountNumber = "Entrer le compte du membre (vide = imprimer tout)";
        texts.localityAndDate = "Lieu et date";
        texts.signature = "Signature";
        texts.printSignatureImage = "Signature digitale";
        texts.nameSignatureImage = "Image avec signature";
        texts.memberAccount = "Compte de membre";
        texts.text1 = "Texte 1";
        texts.text2 = "Texte 2";
        texts.text3 = "Texte 3";
        texts.text4 = "Texte 4";
        texts.textsGroup = "Textes";
        texts.styles = "Styles";
        texts.fontFamily = "Type de police";
        texts.fontSize = "Taille de police";
        texts.printHeaderLogo = "Logo";
        texts.headerLogoName = "Logo nom";
        texts.useMarkdown = "Utiliser Markdown";
        texts.useExtractTable = "Utiliser le tableau Extraire";
        texts.warningMessageExtractTable = "Utilisez la commande Données > Extraire et trier lignes";
        texts.embeddedTextFile = "Texte tableau Documents (.txt / .md)";
        texts.css = "CSS";
        texts.textSignature = "Texte de signature";
        texts.textToUse = "Sélectionner le texte";
        texts.textEmbedded = "Texte tableau Documents (.txt / .md)";
        texts.accountsToPrint = "Sélectionner les adresses à imprimer";
        texts.printText = "Imprimer le texte";
        texts.begin = "Début";
    }
    else if (lang === "it") {
        texts.reportTitle = "Lettera";
        texts.dialogTitle = "Impostazioni";
        texts.warningMessage = "Conto membro non valido";
        texts.accountNumber = "Indica il conto del membro (vuoto = stampa tutti)";
        texts.localityAndDate = "Località e data";
        texts.signature = "Firma";
        texts.printSignatureImage = "Firma digitale";
        texts.nameSignatureImage = "Immagine con firma";
        texts.memberAccount = "Conto del membro";
        texts.text1 = "Testo 1";
        texts.text2 = "Testo 2";
        texts.text3 = "Testo 3";
        texts.text4 = "Testo 4";
        texts.textsGroup = "Testi";
        texts.styles = "Stili";
        texts.fontFamily = "Tipo di carattere";
        texts.fontSize = "Dimensione carattere";
        texts.printHeaderLogo = "Logo";
        texts.headerLogoName = "Nome logo";
        texts.useMarkdown = "Usa Markdown";
        texts.useExtractTable = "Usa tabella Estrai";
        texts.warningMessageExtractTable = "Usa il comando Dati > Estrai righe";
        texts.embeddedTextFile = "Testo tabella Documenti (.txt / .md)";
        texts.css = "CSS";
        texts.textSignature = "Testo firma";
        texts.textToUse = "Seleziona testo"
        texts.textEmbedded = "Testo tabella Documenti (.txt / .md)";
        texts.accountsToPrint = "Seleziona gli indirizzi da stampare";
        texts.printText = "Stampa testo";
        texts.begin = "Inizio";
    }
    else if (lang === "nl") {
        texts.reportTitle = "Brief";
        texts.dialogTitle = "Instellingen";
        texts.warningMessage = "Ongeldige rekening gever";
        texts.accountNumber = "Rekening gever invoeren (leeg = alles afdrukken)";
        texts.localityAndDate = "Plaats en datum";
        texts.signature = "Handtekening";
        texts.printSignatureImage = "Handtekening met afbeelding";
        texts.nameSignatureImage = "Afbeelding";
        texts.memberAccount = "Rekening gever";
        texts.text1 = "Tekst 1";
        texts.text2 = "Tekst 2";
        texts.text3 = "Tekst 3";
        texts.text4 = "Tekst 4";
        texts.textsGroup = "Teksten";
        texts.styles = "Stijl";
        texts.fontFamily = "Type lettertype";
        texts.fontSize = "Lettergrootte";
        texts.printHeaderLogo = "Logo";
        texts.headerLogoName = "Logo naam";
        texts.useMarkdown = "Gebruik Markdown";
        texts.useExtractTable = "Gebruik tabel Extract";
        texts.warningMessageExtractTable = "Gebruik het commando Gegevens > Rijen ophalen en sorteren";
        texts.embeddedTextFile = "Teksttabel Documenten (.txt / .md)";
        texts.css = "CSS";
        texts.textSignature = "Tekst handtekening";
        texts.textToUse = "Selecteer tekst";
        texts.textEmbedded = "Teksttabel Documenten (.txt / .md)";
        texts.accountsToPrint = "Selecteer adressen om af te drukken";
        texts.printText = "Tekst afdrukken";
        texts.begin = "Start";
    }
    else { //lang == en
        texts.reportTitle = "Letter";
        texts.dialogTitle = "Settings";
        texts.warningMessage = "Invalid member account";
        texts.accountNumber = "Enter member's account (empty = print all)";
        texts.localityAndDate = "Place and date";
        texts.signature = "Signature";
        texts.printSignatureImage = "Digital signature";
        texts.nameSignatureImage = "Image with signature";
        texts.memberAccount = "Member account";
        texts.text1 = "Text 1";
        texts.text2 = "Text 2";
        texts.text3 = "Text 3";
        texts.text4 = "Text 4";
        texts.textsGroup = "Texts";
        texts.styles = "Styles";
        texts.fontFamily = "Font type";
        texts.fontSize = "Font size";
        texts.printHeaderLogo = "Logo";
        texts.headerLogoName = "Logo name";
        texts.useMarkdown = "Use Markdown";
        texts.useExtractTable = "Use table Extract";
        texts.warningMessageExtractTable = "Use the command Data > Extract and sort rows";
        texts.embeddedTextFile = "Text from Documents table (.txt / .md)";
        texts.css = "CSS";
        texts.textSignature = "Text signature";
        texts.textToUse = "Select text";
        texts.textEmbedded = "Text from Documents table (.txt / .md)";
        texts.accountsToPrint = "Select addresses to print";
        texts.printText = "Print text";
        texts.begin = "Start";
    }

    return texts;
}






//===========================================================================
// OTHER
//===========================================================================
/* Function that checks Banana version and license type */
function bananaRequiredVersion(requiredVersion) {
    
    var language = "";
    if (Banana.document.locale) {
        language = Banana.document.locale;
    }
    if (language && language.length > 2) {
        language = language.substr(0, 2);
    }

    var msg = "";
    if (Banana.compareVersion && Banana.compareVersion(Banana.application.version, requiredVersion) < 0 || Banana.application.license.licenseType !== "advanced") {
        switch(language) {
            case "en":
                msg = "The extension requires Banana Accounting Plus (version "+ requiredVersion + " or later) and the Advanced plan";
                break;

            case "it":
                msg = "L'estensione richiede Banana Contabilità Plus (versione "+ requiredVersion + " o successiva) e il piano Advanced";
                break;

            case "fr":
                msg = "L'extension nécessite de Banana Comptabilité Plus (version "+ requiredVersion + " ou plus récente) et le plan Advanced.";
                break;

            case "de":
                msg = "Die Erweiterung erfordert Banana Buchhaltung Plus (Version "+ requiredVersion + " oder neuer) und den Advanced-Plan";
                break;

            case "nl":
                msg = "De extensie vereist Banana Boekhouding Plus (versie "+ requiredVersion + " of meer recent) en het Advanced plan.";
                break;

            case "pt":
                msg = "A extensão requer Banana Contabilidade Plus (versão "+ requiredVersion + " ou posterior) e o plano Advanced";
                break;

            default:
                msg = "The extension requires Banana Accounting Plus (version "+ requiredVersion + " or later) and the Advanced plan";
                break;
        }
        Banana.application.showMessages();
        Banana.document.addMessage(msg);
        return false;
    }
    return true;
}

