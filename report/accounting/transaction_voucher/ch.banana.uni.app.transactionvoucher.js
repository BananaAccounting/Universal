// Copyright [2022] [Banana.ch SA - Lugano Switzerland]
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
// @id = ch.banana.uni.app.transactionvoucher
// @api = 1.0
// @pubdate = 2022-04-20
// @publisher = Banana.ch SA
// @description = Transaction Voucher (Banana+)
// @task = app.command
// @doctype = *.*
// @outputformat = none
// @inputdatasource = none
// @timeout = -1
// @includejs = written-number.min.js


/**
    The BananaApp creates a voucher of the transactions for the selected Doc number.
    A dialog is used to let the user insert all the required settings.
    The settings are then saved and used as default settings for the future times.

    To Convert numbers to words we use the "written-number.min.js" distributed under The MIT License (MIT)
    Source of the repository on github: https://github.com/yamadapc/js-written-number
    Source of the .js on github: https://raw.githubusercontent.com/yamadapc/js-written-number/master/dist/written-number.min.js

    We use the function writtenNumber(1234, { lang: 'en' });
*/
function exec(string) {

    if (!Banana.document) {
        return "@Cancel";
    }

    var isCurrentBananaVersionSupported = bananaRequiredVersion("10.0.0", ""); // banana version, banana dev channel version
    if (isCurrentBananaVersionSupported) {

        /* 1. Initialize user parameters */
        var userParam = initUserParam();
        var savedParam = Banana.document.getScriptSettings();
        if (savedParam && savedParam.length > 0) {
            userParam = JSON.parse(savedParam);
        }
        if (!options || !options.useLastSettings) {
            userParam = settingsDialog();
        }
        if (!userParam) {
            return "@Cancel";
        }
        if (!userParam.voucherNumber) {
            return "@Cancel";
        }

        var stylesheet = createStyleSheet(userParam);
        var report = createReport(userParam, Banana.document, stylesheet);
        Banana.Report.preview(report, stylesheet);
    }
}


/**
    Using the given docNumber and all the parameters inserted in the dialog,
    read the journal and take all the data, and at the end creates the report
*/    
function createReport(userParam, banDoc, stylesheet) {

    /* Print the report */
    var report = Banana.Report.newReport("Transaction Voucher");

    // Logo
	var headerLogoSection = report.getHeader().addSection();
	if (userParam.printHeaderLogo) {
		headerLogoSection = report.addSection("");
		var logoFormat = Banana.Report.logoFormat(userParam.headerLogoName);
		if (logoFormat) {
			var logoElement = logoFormat.createDocNode(headerLogoSection, stylesheet, "logo");
			report.getHeader().addChild(logoElement);
		} else {
            headerLogoSection.addClass("header_text");
        }
	} else {
        headerLogoSection.addClass("header_text");
    }

    printReport_title(report, userParam);
    printReport_information(report, banDoc, userParam);
    printReport_transaction(report, banDoc, userParam);
    printReport_signature(report, userParam);
    printReport_footer(report);

    return report;
}

function printReport_title(report, userParam) {
    if (userParam.title) {
        report.addParagraph(userParam.title, "alignCenter heading1");
    }
}

function printReport_information(report, banDoc, userParam) {

    //Table Journal
    var journal = banDoc.journal(banDoc.ORIGINTYPE_CURRENT, banDoc.ACCOUNTTYPE_NORMAL);
    var date = "";
    var description = "";
    var docoriginal = "";
    
    report.addParagraph(" ", "");

    //Create the table that will be printed on the report
    var table = report.addTable("table");
    var col1 = table.addColumn("col1");
    var col2 = table.addColumn("col2");
    var col3 = table.addColumn("col3");
    var col4 = table.addColumn("col4");
    var col5 = table.addColumn("col5");
    var col6 = table.addColumn("col6");

    //Takes data of the selected doc number transaction
    for (i = 0; i < journal.rowCount; i++) {
        var tRow = journal.row(i);
        if (userParam.voucherNumber && tRow.value('Doc') === userParam.voucherNumber) {
            date = tRow.value("Date");
            description = tRow.value("Description");
            docoriginal = tRow.value("DocOriginal");
        }
    }

    tableRow = table.addRow();
    tableRow.addCell("Date", "styleTitle ", 2);
    tableRow.addCell(Banana.Converter.toLocaleDateFormat(date), "", 4);

    tableRow = table.addRow();
    tableRow.addCell("Voucher No.", "styleTitle ", 2);
    tableRow.addCell(userParam.voucherNumber, "", 4);

    tableRow = table.addRow();
    tableRow.addCell("Description", "styleTitle ", 2);
    tableRow.addCell(description, "", 4);

    // Project No.
    if (banDoc.info("Base","HeaderLeft")) {
        tableRow = table.addRow();
        tableRow.addCell("Project No.", "styleTitle ", 2);
        tableRow.addCell(banDoc.info("Base","HeaderLeft"), "", 4);
    }

    // Currency
    if (banDoc.info("AccountingDataBase","BasicCurrency")) {
        tableRow = table.addRow();
        tableRow.addCell("Currency", "styleTitle ", 2);
        tableRow.addCell(banDoc.info("AccountingDataBase","BasicCurrency"), "", 4);
    }

    // Paid to
    if (userParam.paidTo) {
        tableRow = table.addRow();
        tableRow.addCell("Paid to", "styleTitle ", 2);
        tableRow.addCell(userParam.paidTo, "", 4);
    }

    // Paid in
    if (userParam.paidIn) {
        tableRow = table.addRow();
        tableRow.addCell("Paid In", "styleTitle ", 2);
        tableRow.addCell(userParam.paidIn, "", 4);

        if (userParam.paidIn === "Cheque" && userParam.chequeNumber) {
            tableRow = table.addRow();
            tableRow.addCell("Cheque No.", "styleTitle ", 2);
            tableRow.addCell(userParam.chequeNumber, "", 4);
        }
    }

    // Payment received by
    if (userParam.paymentReceivedBy) {
        tableRow = table.addRow();
        tableRow.addCell("Payment Received by", "styleTitle", 2);
        tableRow.addCell(userParam.paymentReceivedBy, "", 4);
    }

    // Paid by
    if (userParam.paidBy) {
        tableRow = table.addRow();
        tableRow.addCell("Paid by", "styleTitle", 2);
        tableRow.addCell(userParam.paidBy, "", 4);
    }
}

function printReport_transaction(report, banDoc, userParam) {

    //Table Journal
    var journal = banDoc.journal(banDoc.ORIGINTYPE_CURRENT, banDoc.ACCOUNTTYPE_NORMAL);
    var totDebit = "";
    var totCredit = "";

    report.addParagraph(" ", "");
    report.addParagraph(" ", "");

    // Column header
    var table = report.addTable("table");
    var col1 = table.addColumn("col1d");
    var col2 = table.addColumn("col2d");
    var col3 = table.addColumn("col3d");
    var col4 = table.addColumn("col4d");
    var col5 = table.addColumn("col5d");
    var col6 = table.addColumn("col6d");
    var col7 = table.addColumn("col7d");
    var tableHeader = table.getHeader();
    tableRow = tableHeader.addRow();  

    //tableRow = table.addRow(); 
    tableRow.addCell("Date", "styleTitle alignCenter", 1);
    tableRow.addCell("Doc", "styleTitle alignCenter", 1);
    tableRow.addCell("Description", "styleTitle alignCenter", 1);
    tableRow.addCell("Account", "styleTitle alignCenter", 1);
    tableRow.addCell("Account Description", "styleTitle alignCenter", 1);
    tableRow.addCell("Debit", "styleTitle alignCenter", 1);
    tableRow.addCell("Credit", "styleTitle alignCenter", 1);

    var jRowOrigin = "";
    var doc = "";
    var description = ""; //jDescription
    var jAccount = "";
    var jAccountDescription = "";

    //Print transactions row
    for (i = 0; i < journal.rowCount; i++) {
        var tRow = journal.row(i);

        doc = tRow.value('Doc');

        if (doc === userParam.voucherNumber) {

            jRowOrigin = tRow.value('JRowOrigin');
            description = tRow.value('Description'); // jDescription = tRow.value('JDescription');
            jAccount = tRow.value('JAccount');;
            jAccountDescription = tRow.value('JAccountDescription');
            jAmount = tRow.value('JAmount');

            tableRow = table.addRow();
            tableRow.addCell(Banana.Converter.toLocaleDateFormat(tRow.value('Date')), "", 1);
            tableRow.addCell(doc, "", 1);
            tableRow.addCell(description, "", 1);
            tableRow.addCell(jAccount, "", 1);
            tableRow.addCell(jAccountDescription, "", 1);
            
            var amount = Banana.SDecimal.abs(tRow.value('JAmount'));

            if (Banana.SDecimal.sign(tRow.value('JAmount')) > 0 ) { //Debit
                totDebit = Banana.SDecimal.add(totDebit, tRow.value('JDebitAmount'), {'decimals':2});
                tableRow.addCell(Banana.Converter.toLocaleNumberFormat(amount), "alignRight", 1);
                tableRow.addCell("", "alignRight", 1);
            } else { //Credit
                totCredit = Banana.SDecimal.add(totCredit, tRow.value('JCreditAmount'), {'decimals':2});
                tableRow.addCell("", "alignRight", 1);
                tableRow.addCell(Banana.Converter.toLocaleNumberFormat(amount), "alignRight", 1);
            }
        }
    }

    //Total Line
    tableRow = table.addRow();
    tableRow.addCell("Total Amount","bold styleTitle", 2);
    tableRow.addCell("","", 3);
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(totDebit), "bold alignRight", 1);
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(totCredit), "bold alignRight", 1);

    var amountToTranslate = Banana.Converter.toInternalNumberFormat(totDebit);
    var amountToTranslateInt = amountToTranslate.split('.')[0];
    var amountToTranslateCents = amountToTranslate.split('.')[1];

    var cents = "";
    if (parseInt(amountToTranslateCents) > 0 && parseInt(amountToTranslateCents) < 10) {
        cents = " point zero " + writtenNumber(amountToTranslateCents, { lang: 'en' });
    }
    else if (parseInt(amountToTranslateCents) >= 10) {
        cents = " point " + writtenNumber(amountToTranslateCents, { lang: 'en' });
    }
    else {
        cents = " only";
    }

    tableRow = table.addRow();
    tableRow.addCell("In Words", "bold styleTitle", 2);
    tableRow.addCell(writtenNumber(amountToTranslateInt, { lang: 'en' }) + cents, "alignRight", 5);
}

function printReport_signature(report, userParam) {

    report.addParagraph(" ", "");
    report.addParagraph(" ", "");

    var table = report.addTable("table");
    var col1 = table.addColumn("col1b");
    var col2 = table.addColumn("col2b");
    var col3 = table.addColumn("col3b");
    var col4 = table.addColumn("col4b");
    var col5 = table.addColumn("col5b");
    var col6 = table.addColumn("col6b");

    tableRow = table.addRow();
    tableRow.addCell("Name and Signature", "styleTitle alignCenter", 3);
    tableRow.addCell("Designation", "styleTitle", 3);

    tableRow = table.addRow();
    tableRow.addCell("Prepared by", "styleTitle", 1);
    tableRow.addCell(userParam.preparedBy, "", 2);
    tableRow.addCell("", "", 3);

    tableRow = table.addRow();
    tableRow.addCell("Verified by", "styleTitle", 1);
    tableRow.addCell(userParam.verifiedBy, "", 2);
    tableRow.addCell("", "", 3);

    tableRow = table.addRow();
    tableRow.addCell("Recommended by", "styleTitle", 1);
    tableRow.addCell(userParam.recommendedBy, "", 2);
    tableRow.addCell("", "", 3);

    tableRow = table.addRow();
    tableRow.addCell("Approved by", "styleTitle", 1);
    tableRow.addCell(userParam.approvedBy, "", 2);
    tableRow.addCell("", "", 3);
}

function printReport_footer(report) {
   report.getFooter().addClass("footer alignCenter");
   var versionLine = report.getFooter().addText("- ");
   report.getFooter().addFieldPageNr();
   report.getFooter().addText(" -");
}


/**
    This function creates styles for the print
*/
function createStyleSheet(userParam) {
    //Create stylesheet
    var stylesheet = Banana.Report.newStyleSheet();
    
    //Set page layout
    var pageStyle = stylesheet.addStyle("@page");

    //Set the margins
    pageStyle.setAttribute("margin", "20mm 10mm 10mm 20mm");

    if (userParam.printHeaderLogo) {
        stylesheet.addStyle("@page", "margin:10mm 10mm 10mm 20mm;");    	
    } else {
        stylesheet.addStyle("@page", "margin:20mm 10mm 10mm 20mm;");
    }

    //Set the page landscape
    //pageStyle.setAttribute("size", "landscape");
    
    //Set the font
    stylesheet.addStyle("body", "font-family : Helvetica");
   
    style = stylesheet.addStyle(".footer");
    style.setAttribute("text-align", "right");
    style.setAttribute("font-size", "8px");

    style = stylesheet.addStyle(".heading1");
    style.setAttribute("font-size", "14px");
    style.setAttribute("font-weight", "bold");

    style = stylesheet.addStyle(".img");
    style.setAttribute("height", "40");
    style.setAttribute("width", "120");
    
    //Set Table styles
    style = stylesheet.addStyle("table");
    style.setAttribute("width", "100%");
    style.setAttribute("font-size", "8px");
    stylesheet.addStyle("table.table td", "border: thin solid black; padding-bottom: 2px; padding-top: 5px");

    stylesheet.addStyle(".col1", "width:15%");
    stylesheet.addStyle(".col2", "width:10%");
    stylesheet.addStyle(".col3", "width:40%");
    stylesheet.addStyle(".col4", "width:12%");
    stylesheet.addStyle(".col5", "width:12%");
    stylesheet.addStyle(".col6", "width:12%");

    stylesheet.addStyle(".col1b", "width:15%");
    stylesheet.addStyle(".col2b", "width:10%");
    stylesheet.addStyle(".col3b", "width:40%");
    stylesheet.addStyle(".col4b", "width:12%");
    stylesheet.addStyle(".col5b", "width:12%");
    stylesheet.addStyle(".col6b", "width:12%");

    stylesheet.addStyle(".col1d", "width:");
    stylesheet.addStyle(".col2d", "width:");
    stylesheet.addStyle(".col3d", "width:");
    stylesheet.addStyle(".col4d", "width:");
    stylesheet.addStyle(".col5d", "width:");
    stylesheet.addStyle(".col6d", "width:");
    stylesheet.addStyle(".col7d", "width:");


    style = stylesheet.addStyle(".styleTableHeader");
    style.setAttribute("background-color", "#464e7e"); 
    style.setAttribute("border-bottom", "1px double black");
    style.setAttribute("color", "#fff");

    style = stylesheet.addStyle(".bold");
    style.setAttribute("font-weight", "bold");

    style = stylesheet.addStyle(".alignRight");
    style.setAttribute("text-align", "right");

    style = stylesheet.addStyle(".alignCenter");
    style.setAttribute("text-align", "center");

    style = stylesheet.addStyle(".styleTitle");
    style.setAttribute("font-weight", "bold");
    style.setAttribute("background-color", "lightgrey");
    style.setAttribute("color", "black");

    style = stylesheet.addStyle(".bordersLeftRight");
    style.setAttribute("border-left", "thin solid black");
    style.setAttribute("border-right", "thin solid black");
    style.setAttribute("padding", "2px");

    if (!userParam.addressPositionDX) {
        userParam.addressPositionDX = '0';
    }
    if (!userParam.addressPositionDY) {
        userParam.addressPositionDY = '0';
    }
    var addressMarginTop = parseFloat(2.0)+parseFloat(userParam.addressPositionDY);
    var addressMarginTopLogo = parseFloat(1.6)+parseFloat(userParam.addressPositionDY);
    var leftAddressMarginLeft = parseFloat(0.5)+parseFloat(userParam.addressPositionDX);
    var rightAddressMarginLeft = parseFloat(10.5)+parseFloat(userParam.addressPositionDX);

    if (userParam.printHeaderLogo) {
        if (userParam.alignleft) {
            stylesheet.addStyle(".tableAddress", "margin-top:"+addressMarginTop+"cm; margin-left:"+leftAddressMarginLeft+"cm");
        } else {
            stylesheet.addStyle(".tableAddress", "margin-top:"+addressMarginTop+"cm; margin-left:"+rightAddressMarginLeft+"cm");
        }
	} else {
        if (userParam.alignleft) {
            stylesheet.addStyle(".tableAddress", "margin-top:"+addressMarginTopLogo+"cm; margin-left:"+leftAddressMarginLeft+"cm");
        } else {
            stylesheet.addStyle(".tableAddress", "margin-top:"+addressMarginTopLogo+"cm; margin-left:"+rightAddressMarginLeft+"cm");
        }
	}
    
    return stylesheet;
}


/**
    Parameters
*/
function convertParam(userParam) {

    //parameters
    var convertedParam = {};
    convertedParam.version = '1.0';
    convertedParam.data = [];

    /**
     * BEGIN GROUP
     */
    var currentParam = {};
    currentParam.name = 'begin';
    currentParam.title = "Start";
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
    currentParam.title = "Logo";
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
    currentParam.title = "Logo-Name";
    currentParam.type = 'string';
    currentParam.value = userParam.headerLogoName ? userParam.headerLogoName : 'Logo';
    currentParam.defaultvalue = 'Logo';
    currentParam.readValue = function() {
        userParam.headerLogoName = this.value;
    }
    convertedParam.data.push(currentParam);

    //
    // TITLE
    //
    var currentParam = {};
    currentParam.name = 'title';
    currentParam.parentObject = '';
    currentParam.title = 'Title';
    currentParam.type = 'string';
    currentParam.value = userParam.title ? userParam.title : '';
    currentParam.defaultvalue = 'Transaction Voucher';
    currentParam.readValue = function() {
        userParam.title = this.value;
    }
    convertedParam.data.push(currentParam);


    //
    // VOUCHER
    //
    var currentParam = {};
    currentParam.name = 'voucherNumber';
    currentParam.title = 'Voucher No.';
    currentParam.type = 'string';
    currentParam.value = userParam.voucherNumber ? userParam.voucherNumber : '';

    //If selected take the doc number from the table transactions
    var transactions = Banana.document.table('Transactions');
    if (transactions.row(Banana.document.cursor.rowNr).value('Doc')) {
        currentParam.value = transactions.row(Banana.document.cursor.rowNr).value('Doc');
    }
    else {
        currentParam.value = '';
    }

    currentParam.defaultvalue = '';
    currentParam.readValue = function() {
        userParam.voucherNumber = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.name = 'paidTo';
    currentParam.title = 'Paid to';
    currentParam.type = 'string';
    currentParam.value = userParam.paidTo ? userParam.paidTo : '';
    currentParam.defaultvalue = '';
    currentParam.readValue = function() {
        userParam.paidTo = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.name = 'paidIn';
    currentParam.title = 'Paid in';
    currentParam.type = 'combobox';
    currentParam.items = ["Cash", "Bank", "Cheque", "Non Cash or Bank"];
    currentParam.value = userParam.paidIn ? userParam.paidIn : '';
    currentParam.defaultvalue = "Cash";
    currentParam.readValue = function() {
        userParam.paidIn = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.name = 'chequeNumber';
    currentParam.title = 'Cheque No.';
    currentParam.type = 'string';
    currentParam.value = userParam.chequeNumber ? userParam.chequeNumber : '';
    currentParam.defaultvalue = '';
    currentParam.readValue = function() {
        userParam.chequeNumber = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.name = 'paymentReceivedBy';
    currentParam.title = 'Payment Received by';
    currentParam.type = 'string';
    currentParam.value = userParam.paymentReceivedBy ? userParam.paymentReceivedBy : '';
    currentParam.defaultvalue = '';
    currentParam.readValue = function() {
        userParam.paymentReceivedBy = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.name = 'paidBy';
    currentParam.title = 'Paid by';
    currentParam.type = 'string';
    currentParam.value = userParam.paidBy ? userParam.paidBy : '';
    currentParam.defaultvalue = '';
    currentParam.readValue = function() {
        userParam.paidBy = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.name = 'preparedBy';
    currentParam.title = 'Prepared by';
    currentParam.type = 'string';
    currentParam.value = userParam.preparedBy ? userParam.preparedBy : '';
    currentParam.defaultvalue = '';
    currentParam.readValue = function() {
        userParam.preparedBy = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.name = 'verifiedBy';
    currentParam.title = 'Verified by';
    currentParam.type = 'string';
    currentParam.value = userParam.verifiedBy ? userParam.verifiedBy : '';
    currentParam.defaultvalue = '';
    currentParam.readValue = function() {
        userParam.verifiedBy = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.name = 'recommendedBy';
    currentParam.title = 'Recommended by';
    currentParam.type = 'string';
    currentParam.value = userParam.recommendedBy ? userParam.recommendedBy : '';
    currentParam.defaultvalue = '';
    currentParam.readValue = function() {
        userParam.recommendedBy = this.value;
    }
    convertedParam.data.push(currentParam);

    var currentParam = {};
    currentParam.name = 'approvedBy';
    currentParam.title = 'Approved by';
    currentParam.type = 'string';
    currentParam.value = userParam.approvedBy ? userParam.approvedBy : '';
    currentParam.defaultvalue = '';
    currentParam.readValue = function() {
        userParam.approvedBy = this.value;
    }
    convertedParam.data.push(currentParam);

    return convertedParam;
}

function initUserParam() {

    var userParam = {};
    userParam.printHeaderLogo = false;
    userParam.headerLogoName = 'Logo';
    userParam.voucherNumber = "";
    userParam.paidTo = "";
    userParam.paidIn = "Cash";
    userParam.chequeNumber = "";
    userParam.paymentReceivedBy = "";
    userParam.paidBy = "";
    userParam.preparedBy = "";
    userParam.verifiedBy = "";
    userParam.recommendedBy = "";
    userParam.approvedBy = "";
    userParam.title = "Transaction Voucher";

    return userParam;
}

function parametersDialog(userParam) {

    if (typeof(Banana.Ui.openPropertyEditor) !== 'undefined') {

        var convertedParam = convertParam(userParam);
        var pageAnchor = 'dlgSettings';
        if (!Banana.Ui.openPropertyEditor('Settings', convertedParam, pageAnchor)) {
            return null;
        }

        for (var i = 0; i < convertedParam.data.length; i++) {
            // Read values to userParam (through the readValue function)
            convertedParam.data[i].readValue();
        }
    }

    return userParam;
}

function settingsDialog() {

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
    Other
*/
function bananaRequiredVersion(requiredVersion, expmVersion) {

  var language = "en";
  if (Banana.document.locale) {
    language = Banana.document.locale;
  }
  if (language.length > 2) {
    language = language.substr(0, 2);
  }
  if (expmVersion) {
    requiredVersion = requiredVersion + "." + expmVersion;
  }
  if (Banana.compareVersion && Banana.compareVersion(Banana.application.version, requiredVersion) < 0) {
    var msg = "";
    switch(language) {
      
      case "en":
        if (expmVersion) {
          msg = "This script does not run with this version of Banana Accounting. Please update to Banana+ Dev Channel (" + requiredVersion + ").";
        } else {
          msg = "This script does not run with this version of Banana Accounting. Please update to version " + requiredVersion + " or later.";
        }
        break;

      case "it":
        if (expmVersion) {
          msg = "Lo script non funziona con questa versione di Banana Contabilità. Aggiornare a Banana+ Dev Channel (" + requiredVersion + ").";
        } else {
          msg = "Lo script non funziona con questa versione di Banana Contabilità. Aggiornare alla versione " + requiredVersion + " o successiva.";
        }
        break;
      
      case "fr":
        if (expmVersion) {
          msg = "Le script ne fonctionne pas avec cette version de Banana Comptabilité. Faire la mise à jour vers Banana+ Dev Channel (" + requiredVersion + ")";
        } else {
          msg = "Le script ne fonctionne pas avec cette version de Banana Comptabilité. Faire la mise à jour à " + requiredVersion + " ou plus récente.";
        }
        break;
      
      case "de":
        if (expmVersion) {
          msg = "Das Skript funktioniert nicht mit dieser Version von Banana Buchhaltung. Auf Banana+ Dev Channel aktualisieren (" + requiredVersion + ").";
        } else {
          msg = "Das Skript funktioniert nicht mit dieser Version von Banana Buchhaltung. Auf Version " + requiredVersion + " oder neuer aktualisiern.";
        }
        break;
      
      default:
        if (expmVersion) {
          msg = "This script does not run with this version of Banana Accounting. Please update to Banana+ Dev Channel (" + requiredVersion + ").";
        } else {
          msg = "This script does not run with this version of Banana Accounting. Please update to version " + requiredVersion + " or later.";
        }
    }

    Banana.application.showMessages();
    Banana.document.addMessage(msg);

    return false;
  }
  return true;
}

