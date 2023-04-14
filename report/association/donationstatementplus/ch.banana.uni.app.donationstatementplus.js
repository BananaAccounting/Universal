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
// @id = ch.banana.uni.app.donationstatementplus.js
// @api = 1.0
// @pubdate = 2023-03-14
// @publisher = Banana.ch SA
// @description = Donation Statement for Associations (Banana+)
// @description.de = Spendenbescheinigung für Vereine (Banana+)
// @description.it = Attestato di donazione per Associazioni (Banana+)
// @description.fr = Certificat de don pour Associations (Banana+)
// @description.en = Donation Statement for Associations (Banana+)
// @description.nl = Kwitantie voor giften (Banana+)
// @doctype = 100.*;110.*;130.*
// @task = app.command
// @timeout = -1

/*
*   This extension prints a donation statement for all the selected donators and period.
*   Donators can be:
*   - a single donator (with or without ";") => (i.e. "10001" or  ";10011")
*   - more donators (with or without ";") separated by "," => (i.e. "10001, ;10011,;10012")
*   - all the donators (empty field) => (i.e. "")
*   
*   It works for a single donation or multiple donations during the selected period.
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

    // minimun amount for cc3
    var currentParam = {};
    currentParam.name = 'minimumAmount';
    currentParam.parentObject = 'accountsToPrint';
    currentParam.title = texts.minimumAmount;
    currentParam.type = 'string';
    currentParam.value = userParam.minimumAmount ? userParam.minimumAmount : '1.00';
    currentParam.defaultvalue = '1.00';
    currentParam.readValue = function() {
     userParam.minimumAmount = this.value;
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

    // donation details
    var currentParam = {};
    currentParam.name = 'details';
    currentParam.parentObject = 'printText';
    currentParam.title = texts.details;
    currentParam.type = 'bool';
    currentParam.value = userParam.details ? true : false;
    currentParam.defaultvalue = false;
    currentParam.readValue = function() {
     userParam.details = this.value;
    }
    convertedParam.data.push(currentParam);

    // donation details - description of transaction
    var currentParam = {};
    currentParam.name = 'description';
    currentParam.parentObject = 'printText';
    currentParam.title = texts.description;
    currentParam.type = 'bool';
    currentParam.value = userParam.description ? true : false;
    currentParam.defaultvalue = false;
    currentParam.readValue = function() {
     userParam.description = this.value;
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
    currentParam.value = userParam.text1 ? userParam.text1 : texts.predefinedText;
    currentParam.defaultvalue = texts.predefinedText;
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
function initUserParam(banDoc, lang) {
    var texts = loadTexts(banDoc, lang);
    var userParam = {};
    userParam.version = '1.0';
    userParam.costcenter = '';
    userParam.minimumAmount = '1.00';
    userParam.useExtractTable = false;
    userParam.textToUse = texts.text1;
    userParam.text1 = texts.predefinedText;
    userParam.text2 = '';
    userParam.text3 = '';
    userParam.text4 = '';
    userParam.embeddedTextFile = '';
    userParam.useMarkdown = false;
    userParam.details = false;
    userParam.textSignature = '';
    userParam.localityAndDate = texts.localityAndDate;
    userParam.printSignatureImage = false;
    userParam.nameSignatureImage = '';
    userParam.description = false;
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
    var scriptform = initUserParam(Banana.document,lang);
    
    // Retrieve saved param
    var savedParam = Banana.document.getScriptSettings();
    if (savedParam && savedParam.length > 0) {
        scriptform = JSON.parse(savedParam);
    }

    //We take the accounting "starting date" and "ending date" from the document. These will be used as default dates
    var docStartDate = Banana.document.startPeriod();
    var docEndDate = Banana.document.endPeriod();   
    
    //A dialog window is opened asking the user to insert the desired period. By default is the accounting period
    var selectedDates = Banana.Ui.getPeriod(texts.reportTitle, docStartDate, docEndDate, 
        scriptform.selectionStartDate, scriptform.selectionEndDate, scriptform.selectionChecked);
        
    //We take the values entered by the user and save them as "new default" values.
    //This because the next time the script will be executed, the dialog window will contains the new values.
    if (selectedDates) {
        scriptform["selectionStartDate"] = selectedDates.startDate;
        scriptform["selectionEndDate"] = selectedDates.endDate;
        scriptform["selectionChecked"] = selectedDates.hasSelection;    
    } else {
        //User clicked cancel
        return null;
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
    
    var userParam = initUserParam(Banana.document,lang);
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
        printReportDetailsTransaction(report, banDoc, userParam, accounts[k], texts);
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

    var startDate = userParam.selectionStartDate;
    var endDate = userParam.selectionEndDate;
    var transactionsObj = calculateTotalTransactions(banDoc, account, startDate, endDate);
    var totalOfDonations = transactionsObj.total;
    var numberOfDonations = transactionsObj.numberOfTransactions;
    var trDate = getTransactionDate(banDoc, account, startDate, endDate);
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
        //available with advanced plan
        var format = "md"; //md,html,text
        text = convertFieldsMarkdown(banDoc, textselected, address, trDate, startDate, endDate, totalOfDonations, account);
        sectionText.addStructuredText(text, format, ""); // "" = stylesheet
    }
    else {
        // var format = "text"; //md,html,text
        text = convertFields(banDoc, textselected, address, trDate, startDate, endDate, totalOfDonations, account);
        addNewLine(sectionText, text);
        sectionText.addParagraph(" ", "");
    }
}

/* Function that prints the transactions details of the donations */
function printReportDetailsTransaction(report, banDoc, userParam, account, texts) {

    /**
     * Prints the details transaction table after the text
     */

    if (userParam.details) {
        var startDate = userParam.selectionStartDate;
        var endDate = userParam.selectionEndDate;
        var total = "";
        var rowCnt = 0;
        account = account.substring(1); //remove first character ";"

        var table = report.addTable("transactions_details");
        var transTab = banDoc.table("Transactions");

        for (var i = 0; i < transTab.rowCount; i++) {
            var tRow = transTab.row(i);
            var date = tRow.value("Date");
            var cc3 = tRow.value("Cc3");
            var desc = tRow.value("Description");

            if (date >= startDate && date <= endDate) {

                if (account && account === cc3) {

                    /*  If simple accounting, amount=Income column of transaction
                        If double accounting, amount=Amount column of transaction */
                    if (banDoc.table('Categories')) {
                        var amount = tRow.value("Income");
                    } else {
                        var amount = tRow.value("Amount");
                    }

                    rowCnt++;
                    tableRow = table.addRow();
                    tableRow.addCell(rowCnt, "transactions_rows", 1); //sequencial numbers
                    tableRow.addCell(" ", "transactions_rows");
                    tableRow.addCell(Banana.Converter.toLocaleDateFormat(tRow.value("Date")), "transactions_rows", 1);
                    tableRow.addCell(" ", "transactions_rows");
                    tableRow.addCell(banDoc.info("AccountingDataBase", "BasicCurrency"), "transactions_rows", 1);
                    tableRow.addCell(" ", "transactions_rows");
                    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(amount), "right transactions_rows", 1);
                    tableRow.addCell(" ", "transactions_rows");
                    if (userParam.description) {
                        tableRow.addCell(desc, " right transactions_rows", 1);
                    }
                    total = Banana.SDecimal.add(total, amount);
                }
            }
        }

        if (total > 0) {
            tableRow = table.addRow();
            tableRow.addCell("", "transactions_total", 1);
            tableRow.addCell(" ", "transactions_total", 1);
            tableRow.addCell(texts.total, "transactions_total", 1);
            tableRow.addCell(" ", "transactions_total", 1);
            tableRow.addCell(banDoc.info("AccountingDataBase", "BasicCurrency"), "transactions_total", 1);
            tableRow.addCell(" ", "transactions_total", 1);
            tableRow.addCell(Banana.Converter.toLocaleNumberFormat(total), "transactions_total", 1);
            tableRow.addCell(" ", "transactions_total", 1);
            if (userParam.description) {
                tableRow.addCell("", "transactions_total", 1);
            }
            
        }
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
function convertFields(banDoc, text, address, trDate, startDate, endDate, totalOfDonations, account) {

    if (text.indexOf("<Period>") > -1) {
        var period = getPeriod(banDoc, startDate, endDate);
        text = text.replace(/<Period>/g,period);
    }
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
    if (text.indexOf("<TrDate>") > -1) {
        var trdate = Banana.Converter.toLocaleDateFormat(trDate);
        text = text.replace(/<TrDate>/g,trdate);
    }
    if (text.indexOf("<StartDate>") > -1) {
        var startdate = Banana.Converter.toLocaleDateFormat(startDate);
        text = text.replace(/<StartDate>/g,startdate);
    }
    if (text.indexOf("<EndDate>") > -1) {
        var enddate = Banana.Converter.toLocaleDateFormat(endDate);
        text = text.replace(/<EndDate>/g,enddate);
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
function convertFieldsMarkdown(banDoc, text, address, trDate, startDate, endDate, totalOfDonations, account) {

    if (text.indexOf("{{Period}}") > -1) {
        var period = getPeriod(banDoc, startDate, endDate);
        text = text.replace(/{{Period}}/g,period);
    }
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
    if (text.indexOf("{{TrDate}}") > -1) {
        var trdate = Banana.Converter.toLocaleDateFormat(trDate);
        text = text.replace(/{{TrDate}}/g,trdate);
    }
    if (text.indexOf("{{StartDate}}") > -1) {
        var startdate = Banana.Converter.toLocaleDateFormat(startDate);
        text = text.replace(/{{StartDate}}/g,startdate);
    }
    if (text.indexOf("{{EndDate}}") > -1) {
        var enddate = Banana.Converter.toLocaleDateFormat(endDate);
        text = text.replace(/{{EndDate}}/g,enddate);
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
    var transactionsObj = "";
    var totalOfDonations = "";
    var startDate = userParam.selectionStartDate;
    var endDate = userParam.selectionEndDate;

    
    if (userParam.useExtractTable) {
        for (var i = 0; i < membershipList.length; i++) {
            transactionsObj = calculateTotalTransactions(banDoc, membershipList[i], startDate, endDate);
            totalOfDonations = transactionsObj.total;
            if (Banana.SDecimal.compare(totalOfDonations, userParam.minimumAmount) > -1) { //totalOfDonation >= mimimunAmount
                accounts.push(membershipList[i]);
            }
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
                // Check the minimum amount of the donation
                if (membershipList.indexOf(list[i]) > -1) {
                    transactionsObj = calculateTotalTransactions(banDoc, list[i], startDate, endDate);
                    totalOfDonations = transactionsObj.total;
                    if (Banana.SDecimal.compare(totalOfDonations, userParam.minimumAmount) > -1) { //totalOfDonation >= mimimunAmount
                        accounts.push(list[i]);
                    }
                }
                else { // The inserted Cc3 does not exists
                    Banana.document.addMessage(texts.warningMessage + ": <" + list[i] + ">");              
                }
            }
        }
        // Empty field = take all the Cc3
        // Check the mimimun amount of the donation
        else if (!userParam.costcenter || userParam.costcenter === "" || userParam.costcenter === undefined) {
            for (var i = 0; i < membershipList.length; i++) {
                transactionsObj = calculateTotalTransactions(banDoc, membershipList[i], startDate, endDate);
                totalOfDonations = transactionsObj.total;
                if (Banana.SDecimal.compare(totalOfDonations, userParam.minimumAmount) > -1) { //totalOfDonation >= mimimunAmount
                    accounts.push(membershipList[i]);
                }
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

/* Function that converts a month to a readable string */
function getMonthText(date, lang) {
    var month = "";
    if (lang === "de") {
        switch (date.getMonth()) {
            case 0:
                month = "Januar";
                break;
            case 1:
                month = "Februar";
                break;
            case 2:
                month = "März";
                break;
            case 3:
                month = "April";
                break;
            case 4:
                month = "Mai";
                break;
            case 5:
                month = "Juni";
                break;
            case 6:
                month = "Juli";
                break;
            case 7:
                month = "August";
                break;
            case 8:
                month = "September";
                break;
            case 9:
                month = "Oktober";
                break;
            case 10:
                month = "November";
                break;
            case 11:
                month = "Dezember";
        }
    }
    else if (lang === "it") {
        switch (date.getMonth()) {
            case 0:
                month = "Gennaio";
                break;
            case 1:
                month = "Febbraio";
                break;
            case 2:
                month = "Marzo";
                break;
            case 3:
                month = "Aprile";
                break;
            case 4:
                month = "Maggio";
                break;
            case 5:
                month = "Giugno";
                break;
            case 6:
                month = "Luglio";
                break;
            case 7:
                month = "Agosto";
                break;
            case 8:
                month = "Settembre";
                break;
            case 9:
                month = "Ottobre";
                break;
            case 10:
                month = "Novembre";
                break;
            case 11:
                month = "Dicembre";
        }
    }
    else if (lang === "fr") {
        switch (date.getMonth()) {
            case 0:
                month = "Janvier";
                break;
            case 1:
                month = "Février";
                break;
            case 2:
                month = "Mars";
                break;
            case 3:
                month = "Avril";
                break;
            case 4:
                month = "Mai";
                break;
            case 5:
                month = "Juin";
                break;
            case 6:
                month = "Juillet";
                break;
            case 7:
                month = "Août";
                break;
            case 8:
                month = "Septembre";
                break;
            case 9:
                month = "Octobre";
                break;
            case 10:
                month = "Novembre";
                break;
            case 11:
                month = "Décembre";
        }
    }
    else if (lang === "nl") {
        switch (date.getMonth()) {
            case 0:
                month = "januari";
                break;
            case 1:
                month = "februari";
                break;
            case 2:
                month = "maart";
                break;
            case 3:
                month = "april";
                break;
            case 4:
                month = "mei";
                break;
            case 5:
                month = "juni";
                break;
            case 6:
                month = "juli";
                break;
            case 7:
                month = "augustus";
                break;
            case 8:
                month = "september";
                break;
            case 9:
                month = "oktober";
                break;
            case 10:
                month = "november";
                break;
            case 11:
                month = "december";
        }
    }
    else if (lang === "pt") {
        switch (date.getMonth()) {
            case 0:
                month = "Janeiro";
                break;
            case 1:
                month = "Fevereiro";
                break;
            case 2:
                month = "Março";
                break;
            case 3:
                month = "Abril";
                break;
            case 4:
                month = "Maio";
                break;
            case 5:
                month = "Junho";
                break;
            case 6:
                month = "Julho";
                break;
            case 7:
                month = "Agosto";
                break;
            case 8:
                month = "Setembro";
                break;
            case 9:
                month = "Outubro";
                break;
            case 10:
                month = "Novembro";
                break;
            case 11:
                month = "Dezembro";
        }
    }
    else { // lang == en
        switch (date.getMonth()) {
            case 0:
                month = "January";
                break;
            case 1:
                month = "February";
                break;
            case 2:
                month = "March";
                break;
            case 3:
                month = "April";
                break;
            case 4:
                month = "May";
                break;
            case 5:
                month = "June";
                break;
            case 6:
                month = "July";
                break;
            case 7:
                month = "August";
                break;
            case 8:
                month = "September";
                break;
            case 9:
                month = "October";
                break;
            case 10:
                month = "November";
                break;
            case 11:
                month = "December";
        }
    }
    return month;
}

/* Function that converts quarters and semesters to a readable string */
function getPeriodText(period, lang) {
    var periodText = "";
    if (lang === "de") {
        switch (period) {
            case "Q1":
                periodText = "1. Quartal";
                break;
            case "Q2":
                periodText = "2. Quartal";
                break;
            case "Q3":
                periodText = "3. Quartal";
                break;
            case "Q4":
                periodText = "4. Quartal";
                break;
            case "S1":
                periodText = "1. Semester";
                break;
            case "S2":
                periodText = "2. Semester";
        }
    }
    else if (lang === "it") {
        switch (period) {
            case "Q1":
                periodText = "1. Trimestre";
                break;
            case "Q2":
                periodText = "2. Trimestre";
                break;
            case "Q3":
                periodText = "3. Trimestre";
                break;
            case "Q4":
                periodText = "4. Trimestre";
                break;
            case "S1":
                periodText = "1. Semestre";
                break;
            case "S2":
                periodText = "2. Semestre";
        }
    }
    else if (lang === "fr") {
        switch (period) {
            case "Q1":
                periodText = "1. Trimestre";
                break;
            case "Q2":
                periodText = "2. Trimestre";
                break;
            case "Q3":
                periodText = "3. Trimestre";
                break;
            case "Q4":
                periodText = "4. Trimestre";
                break;
            case "S1":
                periodText = "1. Semestre";
                break;
            case "S2":
                periodText = "2. Semestre";
        }
    }
    else if (lang === "nl") {
        switch (period) {
            case "Q1":
                periodText = "1ste kwartaal";
                break;
            case "Q2":
                periodText = "2e kwartaal";
                break;
            case "Q3":
                periodText = "3e kwartaal";
                break;
            case "Q4":
                periodText = "4e kwartaal";
                break;
            case "S1":
                periodText = "1ste semester";
                break;
            case "S2":
                periodText = "2e semester";
        }
    }
    else if (lang === "pt") {
        switch (period) {
            case "Q1":
                periodText = "1. Trimestre";
                break;
            case "Q2":
                periodText = "2. Trimestre";
                break;
            case "Q3":
                periodText = "3. Trimestre";
                break;
            case "Q4":
                periodText = "4. Trimestre";
                break;
            case "S1":
                periodText = "1. Semestre";
                break;
            case "S2":
                periodText = "2. Semestre";
        }
    }
    else { // lang == en
        switch (period) {
            case "Q1":
                periodText = "1. Quarter";
                break;
            case "Q2":
                periodText = "2. Quarter";
                break;
            case "Q3":
                periodText = "3. Quarter";
                break;
            case "Q4":
                periodText = "4. Quarter";
                break;
            case "S1":
                periodText = "1. Semester";
                break;
            case "S2":
                periodText = "2. Semester";
        }
    }
    return periodText;
}

/* Function that converts a period defined by startDate and endDate to a readable string */
function getPeriod(banDoc, startDate, endDate) {

    var lang = getLang(banDoc);

    var res = "";
    var year = Banana.Converter.toDate(startDate).getFullYear();
    var startDateDay = Banana.Converter.toDate(startDate).getDate(); //1-31
    var endDateDay = Banana.Converter.toDate(endDate).getDate(); //1-31
    var startDateMonth = Banana.Converter.toDate(startDate).getMonth(); //0=january ... 11=december
    var endDateMonth = Banana.Converter.toDate(endDate).getMonth(); //0=january ... 11=december

    /*
        CASE 1: all the year yyyy-01-01 - yyyy-12-31(i.e. "2018")
    */
    if (startDateMonth == 0 && startDateDay == 1 && endDateMonth == 11 && endDateDay == 31) {
        res = year;
    }

    /*
        CASE 2: single month (i.e. "January 2018")
    */
    else if (startDateMonth == endDateMonth) {
        res = getMonthText(Banana.Converter.toDate(startDate), lang);
        res += " " + year;
    }

    /* 
        CASE 3: period in the year (i.e. "First quarter 2018", "Second semester 2018")
    */
    else if (startDateMonth != endDateMonth) {

        //1. Quarter (1.1 - 31.3)
        if (startDateMonth == 0 && endDateMonth == 2) {
            res = getPeriodText("Q1",lang);
            res += " " + year;
        }   

        //2. Quarter (1.4 - 30.6)
        else if (startDateMonth == 3 && endDateMonth == 5) {
            res = getPeriodText("Q2",lang);
            res += " " + year;          
        }

        //3. Quarter (1.7 - 30.9)
        else if (startDateMonth == 6 && endDateMonth == 8) {
            res = getPeriodText("Q3",lang);
            res += " " + year;
        }

        //4. Quarter (1.10- 31.12)
        else if (startDateMonth == 9 && endDateMonth == 11) {
            res = getPeriodText("Q4",lang);
            res += " " + year;
        }

        //1. Semester (1.1 - 30.6)
        else if (startDateMonth == 0 && endDateMonth == 5) {
            res = getPeriodText("S1",lang);
            res += " " + year;
        }
        //2. Semester (1.7 - 31.12)
        else if (startDateMonth == 6 && endDateMonth == 11) {
            res = getPeriodText("S2",lang);
            res += " " + year;
        }

        /* 
            CASE 4: other periods
        */
        else {
            res = Banana.Converter.toLocaleDateFormat(startDate) + " - " + Banana.Converter.toLocaleDateFormat(endDate);
        }
    }

    return res;
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

/* Function that retrieves the transaction date */
function getTransactionDate(banDoc, costcenter, startDate, endDate) {
    var transTab = banDoc.table("Transactions");
    costcenter = costcenter.substring(1); //remove first character ;
    
    for (var i = 0; i < transTab.rowCount; i++) {
        var tRow = transTab.row(i);
        var date = tRow.value("Date");
        var cc3 = tRow.value("Cc3");

        if (date >= startDate && date <= endDate) {
            if (costcenter && costcenter === cc3) {
                return date;
            }
        }
    }
}

/* Function that calculates the total of the transactions for the given account and period */
function calculateTotalTransactions(banDoc, costcenter, startDate, endDate) {
    var transTab = banDoc.table("Transactions");
    var date = "";
    var total = "";
    var numberOfTransactions = 0;
    var transactionsObj = {};
    costcenter = costcenter.substring(1); //remove first character ;

    for (var i = 0; i < transTab.rowCount; i++) {
        var tRow = transTab.row(i);
        date = tRow.value("Date");
        transactionsObj.date = date;
        var cc3 = tRow.value("Cc3");

        if (date >= startDate && date <= endDate) {

            if (costcenter && costcenter === cc3) {

                /*  If simple accounting, amount=Income column of transaction
                    If double accounting, amount=Amount column of transaction */
                if (banDoc.table('Categories')) {
                    var amount = tRow.value("Income");
                } else {
                    var amount = tRow.value("Amount");
                }

                total = Banana.SDecimal.add(total, amount);
                numberOfTransactions++;
            }
        }
    }

    transactionsObj.total = total;
    transactionsObj.numberOfTransactions = numberOfTransactions;
    
    return transactionsObj;
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
                Banana.console.log(text);
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
  var file = Banana.IO.getLocalFile("file:script/ch.banana.uni.app.donationstatementplus.css");
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
        texts.reportTitle = "Spendenbescheinigung";
        texts.dialogTitle = "Einstellungen";
        texts.warningMessage = "Ungültiges Mitgliedkonto Konto";
        texts.accountNumber = "Mitgliedskonto eingeben (leer = alle ausdrucken)";
        texts.localityAndDate = "Ort und Datum";
        texts.signature = "Unterschrift";
        texts.printSignatureImage = "Unterschrift Bild";
        texts.nameSignatureImage = "Bild";
        texts.memberAccount = "Mitgliedskonto";
        texts.donationDate = "Periode";
        texts.text1 = "Text 1";
        texts.text2 = "Text 2";
        texts.text3 = "Text 3";
        texts.text4 = "Text 4";
        texts.predefinedText = "**Spendenbescheinigung <Period>**\n\nHiermit bestätigen wir, dass **<FirstName> <FamilyName>, <Address>** in der Zeit vom **<StartDate> - <EndDate>** **<Currency> <Amount>** unserem Verein gespendet hat.";
        texts.textsGroup = "Texte";
        texts.minimumAmount = "Mindestspendenbetrag";
        texts.styles = "Stilarten";
        texts.fontFamily = "Schriftarttyp";
        texts.fontSize = "Schriftgrad";
		texts.printHeaderLogo = "Logo";
		texts.headerLogoName = "Logo-Name";
        texts.total = 'Total';
        texts.useMarkdown = "Markdown verwenden";
        texts.details = "Buchungen der Spenden einbeziehen";
        texts.useExtractTable = "Tabelle Extraktion verwenden";
        texts.warningMessageExtractTable = "Verwenden Sie den Befehl Daten > Zeilen extrahieren und sortieren";
        texts.embeddedTextFile = "Text Tabelle Dokumente (.txt / .md)";
        texts.css = "CSS";
        texts.textSignature = "Text Unterschrift";
        texts.description = "Spalte Beschreibung einbeziehen";
        texts.textToUse = "Text auswählen";
        texts.textEmbedded = "Text Tabelle Dokumente (.txt / .md)";
        texts.accountsToPrint = "Adressen für den Ausdruck auswählen";
        texts.printText = "Text ausdrucken";
        texts.begin = "Beginn";
    }
    else if (lang === "fr") {
        texts.reportTitle = "Certificat de don";
        texts.dialogTitle = "Paramètres";
        texts.warningMessage = "Compte de membre non valide";
        texts.accountNumber = "Entrer le compte du membre (vide = imprimer tout)";
        texts.localityAndDate = "Lieu et date";
        texts.signature = "Signature";
        texts.printSignatureImage = "Signature avec image";
        texts.nameSignatureImage = "Image";
        texts.memberAccount = "Compte de membre";
        texts.donationDate = "Période";
        texts.text1 = "Texte 1";
        texts.text2 = "Texte 2";
        texts.text3 = "Texte 3";
        texts.text4 = "Texte 4";
        texts.predefinedText = "**Certificat de don <Period>**\n\nNous déclarons par la présente que **<FirstName> <FamilyName>, <Address>** dans la période **<StartDate> - <EndDate>** a fait don de **<Currency> <Amount>** à notre Association.";
        texts.textsGroup = "Textes";
        texts.minimumAmount = "Montant minimum du don";
        texts.styles = "Styles";
        texts.fontFamily = "Type de police";
        texts.fontSize = "Taille de police";
		texts.printHeaderLogo = "Logo";
		texts.headerLogoName = "Logo nom";
        texts.total = 'Total';
        texts.useMarkdown = "Utiliser Markdown";
        texts.details = "Inclure les écritures de dons";        
        texts.useExtractTable = "Utiliser le tableau Extraire";
        texts.warningMessageExtractTable = "Utilisez la commande Données > Extraire et trier lignes";
        texts.embeddedTextFile = "Texte tableau Documents (.txt / .md)";
        texts.css = "CSS";
        texts.textSignature = "Texte de signature";
        texts.description = "Inclure la colonne Libellé";
        texts.textToUse = "Sélectionner le texte";
        texts.textEmbedded = "Texte tableau Documents (.txt / .md)";
        texts.accountsToPrint = "Sélectionner les adresses à imprimer";
        texts.printText = "Imprimer le texte";
        texts.begin = "Début";
    }
    else if (lang === "it") {
        texts.reportTitle = "Attestato di donazione";
        texts.dialogTitle = "Impostazioni";
        texts.warningMessage = "Conto membro non valido";
        texts.accountNumber = "Indicare il conto del membro (vuoto = stampa tutti)";
        texts.localityAndDate = "Località e data";
        texts.signature = "Firma";
        texts.printSignatureImage = "Firma con immagine";
        texts.nameSignatureImage = "Immagine";
        texts.memberAccount = "Conto del membro";
        texts.donationDate = "Periodo";
        texts.text1 = "Testo 1";
        texts.text2 = "Testo 2";
        texts.text3 = "Testo 3";
        texts.text4 = "Testo 4";
        texts.predefinedText = "**Attestato di donazione <Period>**\n\nCon la presente dichiariamo che **<FirstName> <FamilyName>, <Address>** nel periodo **<StartDate> - <EndDate>** ha donato **<Currency> <Amount>** alla nostra Associazione.";
        texts.textsGroup = "Testi";
        texts.minimumAmount = "Importo minimo della donazione";
        texts.styles = "Stili";
        texts.fontFamily = "Tipo di carattere";
        texts.fontSize = "Dimensione carattere";
		texts.printHeaderLogo = "Logo";
		texts.headerLogoName = "Nome logo";
        texts.total = 'Totale';
        texts.useMarkdown = "Usa Markdown";
        texts.details = "Includi registrazioni donazioni";
        texts.useExtractTable = "Usa tabella Estrai";
        texts.warningMessageExtractTable = "Usa il comando Dati > Estrai righe";
        texts.embeddedTextFile = "Testo tabella Documenti (.txt / .md)";
        texts.css = "CSS";
        texts.textSignature = "Testo firma";
        texts.description = "Includi colonna descrizione";
        texts.textToUse = "Seleziona testo";
        texts.textEmbedded = "Testo tabella Documenti (.txt / .md)";
        texts.accountsToPrint = "Seleziona gli indirizzi da stampare";
        texts.printText = "Stampa testo";
        texts.begin = "Inizio";
    }
    else if (lang === "nl") {
        texts.reportTitle = "Kwitantie voor giften";
        texts.dialogTitle = "Instellingen";
        texts.warningMessage = "Ongeldige rekening gever";
        texts.accountNumber = "Rekening gever invoeren (leeg = alles afdrukken)";
        texts.localityAndDate = "Plaats en datum";
        texts.signature = "Handtekening";
        texts.printSignatureImage = "Handtekening met afbeelding";
        texts.nameSignatureImage = "Afbeelding";
        texts.memberAccount = "Rekening gever";
        texts.donationDate = "Periode";
        texts.text1 = "Tekst 1";
        texts.text2 = "Tekst 2";
        texts.text3 = "Tekst 3";
        texts.text4 = "Tekst 4";
        texts.predefinedText = "**Kwitantie voor giften <Period>**\n\nWij verklaren hierbij dat **<FirstName> <FamilyName>, <Address>** tussen **<StartDate>** en **<EndDate>** het bedrag van **<Currency> <Amount>** geschonken heeft aan onze instelling.";
        texts.textsGroup = "Teksten";
        texts.minimumAmount = "Minimumbedrag van de gift";
        texts.styles = "Stijl";
        texts.fontFamily = "Type lettertype";
        texts.fontSize = "Lettergrootte";
		texts.printHeaderLogo = "Logo";
		texts.headerLogoName = "Logo naam";
        texts.total = 'Totaal';
        texts.useMarkdown = "Gebruik Markdown";
        texts.details = "Neem donatietransacties op";
        texts.useExtractTable = "Gebruik tabel Extract";
        texts.warningMessageExtractTable = "Gebruik het commando Gegevens > Rijen ophalen en sorteren";
        texts.embeddedTextFile = "Teksttabel Documenten (.txt / .md)";
        texts.css = "CSS";
        texts.textSignature = "Tekst handtekening";
        texts.description = "Beschrijvingskolom opnemen";
        texts.textToUse = "Selecteer tekst";
        texts.textEmbedded = "Teksttabel Documenten (.txt / .md)";
        texts.accountsToPrint = "Selecteer adressen om af te drukken";
        texts.printText = "Tekst afdrukken";
        texts.begin = "Start";
    }
    else { //lang == en
        texts.reportTitle = "Donation Statement";
        texts.dialogTitle = "Settings";
        texts.warningMessage = "Invalid member account";
        texts.accountNumber = "Insert account member (empty = print all)";
        texts.localityAndDate = "Place and date";
        texts.signature = "Signature";
        texts.printSignatureImage = "Signature with image";
        texts.nameSignatureImage = "Image";
        texts.memberAccount = "Member account";
        texts.donationDate = "Period";
        texts.text1 = "Text 1";
        texts.text2 = "Text 2";
        texts.text3 = "Text 3";
        texts.text4 = "Text 4";
        texts.predefinedText = "**Statement of donation <Period>**\n\nWe hereby declare that **<FirstName> <FamilyName>, <Address>** between **<StartDate>** and **<EndDate>**donated **<Currency> <Amount>** to our Association.";
        texts.textsGroup = "Texts";
        texts.minimumAmount = "Donation minimum amount";
        texts.styles = "Styles";
        texts.fontFamily = "Font type";
        texts.fontSize = "Font size";
		texts.printHeaderLogo = "Logo";
		texts.headerLogoName = "Logo name";
        texts.total = 'Total';
        texts.useMarkdown = "Use Markdown";
        texts.details = "Include donation transactions";
        texts.useExtractTable = "Use table Extract";
        texts.warningMessageExtractTable = "Use the command Data > Extract and sort rows";
        texts.embeddedTextFile = "Text table Documents (.txt / .md)";
        texts.css = "CSS";
        texts.textSignature = "Text signature";
        texts.description = "Include description column";
        texts.textToUse = "Select text";
        texts.textEmbedded = "Text table Documents (.txt / .md)";
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
    if (Banana.compareVersion && Banana.compareVersion(Banana.application.version, requiredVersion) < 0) {
        switch(language) {
            case "en":
                msg = "The extension requires Banana Accounting Plus (version "+ requiredVersion + " or later)";
                break;

            case "it":
                msg = "L'estensione richiede Banana Contabilità Plus (versione "+ requiredVersion + " o successiva)";
                break;

            case "fr":
                msg = "L'extension nécessite de Banana Comptabilité Plus (version "+ requiredVersion + " ou plus récente)";
                break;

            case "de":
                msg = "Die Erweiterung erfordert Banana Buchhaltung Plus (Version "+ requiredVersion + " oder neuer)";
                break;

            case "nl":
                msg = "De extensie vereist Banana Boekhouding Plus (versie "+ requiredVersion + " of meer recent)";
                break;

            case "pt":
                msg = "A extensão requer Banana Contabilidade Plus (versão "+ requiredVersion + " ou posterior)";
                break;

            default:
                msg = "The extension requires Banana Accounting Plus (version "+ requiredVersion + " or later)";
                break;
        }
        Banana.application.showMessages();
        Banana.document.addMessage(msg);
        return false;
    }
    return true;
}

