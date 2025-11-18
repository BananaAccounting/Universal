// Copyright [2025] [Banana.ch SA - Lugano Switzerland]
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
// @id = ch.banana.uni.app.quicksum.capitolato
// @api = 1.0
// @pubdate = 2025-11-17
// @publisher = Banana.ch SA
// @description = QuickSum Bid Specification
// @description.de = QuickSum Angebotsspezifikationen
// @description.it = QuickSum Capitolato d’offerta
// @description.fr = QuickSum Spécifications de l’offre
// @description.en = QuickSum Bid Specification
// @doctype = 400.100
// @task = app.command
// @timeout = -1





//===========================================================================
// PARAMETERS
//===========================================================================
/* Function that converts parameters of the dialog */
function convertParam(userParam) {

  var lang = getLang(Banana.document);
  var texts = loadTexts(Banana.document,lang);

  var convertedParam = {};
  convertedParam.version = '1.0';
  convertedParam.data = [];

  var currentParam = {};
  currentParam.name = 'param_1';
  currentParam.parentObject = '';
  currentParam.title = texts.param_report_name;
  currentParam.type = 'string';
  currentParam.value = userParam.param_1 ? userParam.param_1 : '';
  currentParam.defaultvalue = '';
  currentParam.readValue = function () {
    userParam.param_1 = this.value;
  }
  convertedParam.data.push(currentParam);

  var currentParam = {};
  currentParam.name = 'param_print_header_logo';
  currentParam.parentObject = '';
  currentParam.title = texts.param_print_header_logo;
  currentParam.type = 'bool';
  currentParam.value = userParam.param_print_header_logo ? true : false;
  currentParam.defaultvalue = false;
  currentParam.readValue = function() {
    userParam.param_print_header_logo = this.value;
  }
  convertedParam.data.push(currentParam);

  var currentParam = {};
  currentParam.name = 'param_header_logo_name';
  currentParam.parentObject = ''
  currentParam.title = texts.param_header_logo_name;
  currentParam.type = 'string';
  currentParam.value = userParam.param_header_logo_name ? userParam.param_header_logo_name : 'Logo';
  currentParam.defaultvalue = 'Logo';
  currentParam.readValue = function() {
    userParam.param_header_logo_name = this.value;
  }
  convertedParam.data.push(currentParam);

  var currentParam = {};
  currentParam.name = 'param_print_header_address';
  currentParam.parentObject = '';
  currentParam.title = texts.param_print_header_address;
  currentParam.type = 'bool';
  currentParam.value = userParam.param_print_header_address ? true : false;
  currentParam.defaultvalue = false;
  currentParam.readValue = function() {
    userParam.param_print_header_address = this.value;
  }
  convertedParam.data.push(currentParam);

  var currentParam = {};
  currentParam.name = 'param_quantity_decimals';
  currentParam.parentObject = '';
  currentParam.title = texts.param_quantity_decimals;
  currentParam.type = 'string';
  currentParam.value = userParam.param_quantity_decimals ? userParam.param_quantity_decimals : '2';
  currentParam.defaultvalue = '2';
  currentParam.readValue = function () {
    userParam.param_quantity_decimals = this.value;
  }
  convertedParam.data.push(currentParam);

  var currentParam = {};
  currentParam.name = 'param_print_summary';
  currentParam.parentObject = '';
  currentParam.title = texts.param_print_summary;
  currentParam.type = 'bool';
  currentParam.value = userParam.param_print_summary ? true : false;
  currentParam.defaultvalue = true;
  currentParam.readValue = function() {
    userParam.param_print_summary = this.value;
  }
  convertedParam.data.push(currentParam);

  return convertedParam;
}

/* Function that initializes the user parameters */
function initUserParam() {
  var userParam = {};
  userParam.version = '1.0';
  userParam.param_1 = '';
  userParam.param_print_header_logo = false;
  userParam.param_header_logo_name = 'Logo';
  userParam.param_print_header_address = false;
  userParam.param_quantity_decimals = '2';
  userParam.param_print_summary = true;
  return userParam;
}

/* Function that shows the dialog window and let user to modify the parameters */
function parametersDialog(userParam) {

  var lang = getLang(Banana.document);
  var texts = loadTexts(Banana.document,lang);

  if (typeof (Banana.Ui.openPropertyEditor) !== 'undefined') {
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

  var isCurrentBananaVersionSupported = bananaRequiredVersion("10.2");
  if (!isCurrentBananaVersionSupported) {
    return "@Cancel";
  }

  var lang = getLang(Banana.document);
  var texts = loadTexts(Banana.document,lang);

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

  var report = Banana.Report.newReport(userParam.param_1 || texts.reportTitle);
  var stylesheet = Banana.Report.newStyleSheet();
  
  var variables = {};
  set_variables(variables, userParam);
  
  printReport(Banana.document, report, userParam, stylesheet);
  
  setCss(Banana.document, stylesheet, userParam, variables);
  Banana.Report.preview(report, stylesheet);

}

/** Function that prints the report */
function printReport(banDoc, report, userParam, stylesheet) {
  printReportHeader(banDoc, report, userParam, stylesheet);
  printReportTable(banDoc, report, userParam);
  printReportTotals(banDoc, report, userParam);
  printReportFooter(report);
}

/** Function that prints the header of the report (logo + address) */
function printReportHeader(banDoc, report, userParam, stylesheet) {

  var headerParagraph = report.getHeader().addSection()

  // Logo
  if (userParam.param_print_header_logo) {
    headerParagraph = report.addSection("");
    var logoFormat = Banana.Report.logoFormat(userParam.param_header_logo_name);
    if (logoFormat) {
      var logoElement = logoFormat.createDocNode(headerParagraph, stylesheet, "logo");
      report.getHeader().addChild(logoElement);
    } else {
      headerParagraph.addClass("header_text");
    }
  } else {
    headerParagraph.addClass("header_text");
  }

  // Address
  if (userParam.param_print_header_address) {
    var company = banDoc.info("AccountingDataBase","Company");
    var name = banDoc.info("AccountingDataBase","Name");
    var familyName = banDoc.info("AccountingDataBase","FamilyName");
    var address1 = banDoc.info("AccountingDataBase","Address1");
    var buildingnumber = banDoc.info("AccountingDataBase","BuildingNumber");
    var address2 = banDoc.info("AccountingDataBase","Address2");
    var zip = banDoc.info("AccountingDataBase","Zip");
    var city = banDoc.info("AccountingDataBase","City");
    var country = banDoc.info("AccountingDataBase","Country");
    var phone = banDoc.info("AccountingDataBase","Phone");
    var web = banDoc.info("AccountingDataBase","Web");
    var email = banDoc.info("AccountingDataBase","Email");

    // Row 1
    if (company) {
      headerParagraph.addParagraph(company, "header_address");
    }

    // Row 2
    if (name && familyName) {
      headerParagraph.addParagraph(name + " " + familyName, "header_address");
    } else if (!name && familyName) {
      headerParagraph.addParagraph(familyName, "header_address");
    } else if (name && !familyName) {
      headerParagraph.addParagraph(name, "header_address");
    }

    // Row 3
    if (address1 || buildingnumber || address2) {
      var addressLine = "";
      if (address1 && buildingnumber && address2) {
        addressLine = address1 + " " + buildingnumber + ", " + address2;
      } else if (address1 && buildingnumber && !address2) {
        addressLine = address1 + " " + buildingnumber;
      } else if (address1 && !buildingnumber && address2) {
        addressLine = address1 + ", " + address2;
      } else if (address1 && !buildingnumber && !address2) {
        addressLine = address1;
      } else if (!address1 && !buildingnumber && address2) {
        addressLine = address2;
      }
      if (addressLine) {
        headerParagraph.addParagraph(addressLine, "header_address");
      }
    }

    // Row 4
    if (zip && city) {
      headerParagraph.addParagraph(zip + " " + city, "header_address");
    }

    // Row 5
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
}

/** Function that prints the Quicksum table */
function printReportTable(banDoc, report, userParam) {

  var quicksumTable = banDoc.table("Quicksum");
  if (!quicksumTable) {
    return;
  }
  
  var lang = getLang(banDoc);
  var texts = loadTexts(banDoc,lang);

  // Defines the max rows allowed per page
  // Used to print the total AmountCumulated carried over
  var rowsPerPageBase = 72; // rows per page when no header logo/address is printed
  var tableClass = "table_quick_sum";
  if (userParam.param_print_header_address || userParam.param_print_header_logo) {
    rowsPerPageBase = 66; // rows per page when header logo/address is printed
    tableClass = "table_quick_sum_2";
  }

  var pageRowCount = 0; // counter to keep track of the lines printed on the page
  var printedOnFirstPage = false; // if first page or not
  var lastAmountCumulated = ""; // last AmountCumulated value

  // Define table columns and headers
  var table = report.addTable(tableClass);
  var colCapitolato1 = table.addColumn("col_capitolato_1");
  var colCapitolato2 = table.addColumn("col_capitolato_2");
  var colCapitolato3 = table.addColumn("col_capitolato_3");
  var colCapitolato4 = table.addColumn("col_capitolato_4");
  var colCapitolato5 = table.addColumn("col_capitolato_5");
  // var colCapitolato6 = table.addColumn("col_capitolato_6");

  var header = table.getHeader();
  var row = header.addRow();
  row.addCell(texts.itemId, "table_quick_sum_header");
  row.addCell(texts.description, "table_quick_sum_header");
  row.addCell(texts.quantity, "table_quick_sum_header right");
  row.addCell(texts.unitPrice, "table_quick_sum_header right");
  row.addCell(texts.amountTotal, "table_quick_sum_header right");
  // row.addCell(texts.amountCumulated, "table_quick_sum_header right");

  for (var i = 0; i < quicksumTable.rowCount; i++) {
    var quicksumRow = quicksumTable.row(i);

    // column ItemIdCalc: excludes rows starting with X, V, #
    // column Description: excludes comments rows starting with //
    if (!quicksumRow 
        || quicksumRow.value("ItemIdCalc").startsWith("X") 
        || quicksumRow.value("ItemIdCalc").startsWith("V")
        || quicksumRow.value("ItemIdCalc").startsWith("#")
        || quicksumRow.value("Description").startsWith("//")) {
      continue;
    }

    /**
     * (1) Row with AmountCalculated at the begin of the page (from second page only)
     */
    if (pageRowCount === 0 && printedOnFirstPage) {
      var r = table.addRow();
      r.addCell(" ", "", 5);
      var r = table.addRow();
      if (lastAmountCumulated) {
        r.addCell("","",3);
        r.addCell(texts.carryforward + ": ", "carry_label",1);
        r.addCell(Banana.Converter.toLocaleNumberFormat(lastAmountCumulated, 2, false), "carry_label dashed");
      } else {
        r.addCell(" ", "",5);
      }
      //r.addCell(lastAmountCumulated ? texts.carryforward + ": " + Banana.Converter.toLocaleNumberFormat(lastAmountCumulated, 2, false) : " ", "right", 5);
      var r = table.addRow();
      r.addCell(" ", "", 5);
      pageRowCount += 3; // 1 empty row, 1 row with AmountCalculated, 1 empty row
    }

    /**
     * (2) Normal rows of the table
     * Defines the rows css class names
     * Prints the rows
     */
    var className = "";
    // group rows
    if (quicksumRow.value("ItemId") && quicksumRow.value("ItemId").indexOf("T:") < 0) {
      className = "group";
    }
    // total rows
    if (quicksumRow.value("ItemId") && quicksumRow.value("ItemId").indexOf("T:") > -1) {
      className = "total";
    }

    var row = table.addRow();

    // ItemId
    if (quicksumRow.value("ItemId")) {
      row.addCell(extractNumbers(quicksumRow.value("ItemId"),true), className);
    } else {
      row.addCell(" ", className);
    }

    // Description
    if (quicksumRow.value("Description")) {
      row.addCell(quicksumRow.value("Description"), className);
    } else {
      row.addCell(" ", className);
    }

    // Quantity
    if (quicksumRow.value("Quantity")) {
      row.addCell(Banana.Converter.toLocaleNumberFormat(quicksumRow.value("Quantity"), userParam.param_quantity_decimals, false), className + " right");
    } else {
      row.addCell(" ", className);
    }
  
    // UnitPrice
    if (quicksumRow.value("UnitPrice")) {
      row.addCell(Banana.Converter.toLocaleNumberFormat(quicksumRow.value("UnitPrice"), 2, false), className + " dashed right");
    } else {
      row.addCell(" ", className);
    }

    // AmountTotal
    if (quicksumRow.value("AmountTotal")) {

      if (className === "total") {
        row.addCell(Banana.Converter.toLocaleNumberFormat(quicksumRow.value("AmountTotal"), 2, true), className + " double right");
      }
      else {
        row.addCell(Banana.Converter.toLocaleNumberFormat(quicksumRow.value("AmountTotal"), 2, false), className + " dashed right");
      }
    }
    else {
      if (className === "total") {
        row.addCell(Banana.Converter.toLocaleNumberFormat(quicksumRow.value("AmountTotal"), 2, true), className + " double right");
      }
      else {
        row.addCell(" ", className);
      }
    }


    printedOnFirstPage = true;
    lastAmountCumulated = quicksumRow.value("AmountCumulated") || lastAmountCumulated;
    pageRowCount += 1;

    /**
     * (3) Row with AmountCalculated at the end of the page
     */
    if (pageRowCount === rowsPerPageBase) {
      var r = table.addRow();
      r.addCell(" ","",5);
      r = table.addRow();
      if (lastAmountCumulated) {
        r.addCell("","",3);
        r.addCell(texts.carryforward + ": ", "carry_label", 1);
        r.addCell(Banana.Converter.toLocaleNumberFormat(lastAmountCumulated, 2, false), "carry_label dashed", 1);
      } else {
        r.addCell(" ", "", 5);
      }
      //r.addCell(lastAmountCumulated ? texts.carryforward + ": " + Banana.Converter.toLocaleNumberFormat(lastAmountCumulated, 2, false) : " ", "right", 5);
      pageRowCount = 0; // new page
    }
  }
}

/** Function that prints the summary with the totals */
function printReportTotals(banDoc, report, userParam) {

  if (!userParam.param_print_summary) {
    return;
  }

  var quicksumTable = banDoc.table("Quicksum");
  if (!quicksumTable) {
    return;
  }

  var lang = getLang(banDoc);
  var texts = loadTexts(banDoc,lang);

  // Defines the title class name and prints it
  report.addPageBreak();
  var className = "h2";
  if (userParam.param_print_header_logo || userParam.param_print_header_address) {
    className = "h2 margin_top";
  }
  report.addParagraph(texts.summary, className);
  report.addParagraph(" ","");

  // Defines table columns and headers
  var table = report.addTable("table_summary");
  var colSummary1 = table.addColumn("col_summary_1");
  var colSummary2 = table.addColumn("col_summary_2");
  var colSummary3 = table.addColumn("col_summary_3");
  // var colSummary4 = table.addColumn("col_summary_4");

  var header = table.getHeader();
  var row = header.addRow();
  row.addCell(texts.itemId, "table_summary_header");
  row.addCell(texts.description, "table_summary_header");
  row.addCell(texts.amount, "table_summary_header right");
  // row.addCell(texts.amount, "table_summary_header right");

  for (var i = 0; i < quicksumTable.rowCount; i++) {
    var quicksumRow = quicksumTable.row(i);
    
    //excludes rows not starting with T and S (totals and subtotal)
    if (!quicksumRow 
      || !quicksumRow.value("ItemIdCalc").startsWith("T") ) {
      continue;
    }

    var row = table.addRow();
    //row.addCell(quicksumRow.value("ItemId"), "");
    row.addCell(extractNumbers(quicksumRow.value("ItemId"),true), "");
    row.addCell(quicksumRow.value("Description"), "");
    row.addCell(Banana.Converter.toLocaleNumberFormat(quicksumRow.value("AmountTotal"),2,true), "dashed right");
    // row.addCell(Banana.Converter.toLocaleNumberFormat(quicksumRow.value("AmountTotal"),2,true), "right");
  }
}

/** Function that prints the footer */
function printReportFooter(report) {
  report.getFooter().addClass("footer");
  report.getFooter().addText("- ", "");
  report.getFooter().addFieldPageNr();
  report.getFooter().addText(" -", "");
}



//===========================================================================
// UTILITIES
//===========================================================================
/** Function that extracts the number from a string */
function extractNumbers(str, remove00) {
  if (!str) {
    return "";
  }

  // Remove spaces
  let cleanStr = str.trim();

  // Removes everything up to and including the last ":" (if present)
  cleanStr = cleanStr.replace(/^.*:/, "");

  if (remove00) {
    // If "00" return empty string
    if (cleanStr === "00") {
      return "";
    }
  }

  // If empty return empty string
  if (cleanStr.trim() === "") {
    return "";
  }

  return cleanStr;
}



//===========================================================================
// STYLESHEET
//===========================================================================
/* Sets all the variables values */
function set_variables(variables, userParam) {
  // variables.$font_family = "Arial, Helvetica, sans-serif";
  // variables.$font_size = "10pt";
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
  var file = Banana.IO.getLocalFile("file:script/ch.banana.uni.app.quicksum.capitolato.css");
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
/* Function that takes the document language */
function getLang(banDoc) {
    var lang = "en";
    if (banDoc.locale) {
        lang = banDoc.locale;
    }
    if (lang && lang.length > 2) {
        lang = lang.substr(0, 2);
    }
    return lang;
}

/* Function that loads all the default texts used for the dialog and the report  */
function loadTexts(banDoc,lang) {
  var texts = {};
  if (lang === "de") {
    texts.reportTitle = "Capitolato";
    texts.dialogTitle = "Einstellungen";
    texts.itemId = "Art.-Nr.";
    texts.description = "Beschreibung";
    texts.quantity = "Menge";
    texts.unitPrice = "Einheitsp.";
    texts.amountTotal = "Ges.-Betr.";
    texts.amountCumulated = "Kum.-Betr.";
    texts.carryforward = "Übertragung";
    texts.summary = "Zusammenfassung"; 
    texts.amount = "Betrag";

    texts.param_print_header_logo = "Logo in der Kopfzeile";
    texts.param_header_logo_name = "Logo-Name";
    texts.param_print_header_address = "Adresse in der Kopfzeile";    
    texts.param_report_name = "Name des Berichts";
    texts.param_quantity_decimals = "Dezimalstellen in der Spalte Menge";
    texts.param_print_summary = "Includi riepilogo";
    texts.param_print_summary = "Zusammenfassung einfügen";
  }
  else if (lang === "fr") {
    texts.reportTitle = "Capitolato";
    texts.dialogTitle = "Paramètres";
    texts.itemId = "No. art.";
    texts.description = "Libellé";
    texts.quantity = "Quantité";
    texts.unitPrice = "Prix unit.";
    texts.amountTotal = "Total";
    texts.amountCumulated = "Total cumulé";
    texts.carryforward = "Report";
    texts.summary = "Récapitulation"; 
    texts.amount = "Montant";

    texts.param_print_header_logo = "Logo en-tête";
    texts.param_header_logo_name = "Logo nom";
    texts.param_print_header_address = "Adresse en-tête";
    texts.param_report_name = "Nom du rapport";
    texts.param_quantity_decimals = "Décimales colonne Quantité";
    texts.param_print_summary = "Inclure le récapitulation";
  }
  else if (lang === "it") {
    texts.reportTitle = "Capitolato";
    texts.dialogTitle = "Impostazioni";
    texts.itemId = "N. art.";
    texts.description = "Descrizione";
    texts.quantity = "Quantità";
    texts.unitPrice = "Prezzo unit.";
    texts.amountTotal = "Totale";
    texts.amountCumulated = "Tot. cumul.";
    texts.carryforward = "Riporto";
    texts.summary = "Riepilogo"; 
    texts.amount = "Importo";

    texts.param_print_header_logo = "Logo intestazione";
    texts.param_header_logo_name = "Nome logo";
    texts.param_print_header_address = "Indirizzo intestazione";
    texts.param_report_name = "Nome report";
    texts.param_quantity_decimals = "Decimali colonna Quantità";
    texts.param_print_summary = "Includi riepilogo";
  }
  else {
    texts.reportTitle = "Capitolato";
    texts.dialogTitle = "Settings";
    texts.itemId = "Item No.";
    texts.description = "Description";
    texts.quantity = "Qty";
    texts.unitPrice = "Unit price";
    texts.amountTotal = "Total";
    texts.amountCumulated = "Cum. total";
    texts.carryforward = "Carry forward";
    texts.summary = "Summary";
    texts.amount = "Amount";

    texts.param_print_header_logo = "Header logo";
    texts.param_header_logo_name = "Logo name";
    texts.param_print_header_address = "Header address";
    texts.param_report_name = "Nome report";
    texts.param_quantity_decimals = "Decimals Quantity column";
    texts.param_print_summary = "Include summary";
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
    switch (language) {
      case "en":
        msg = "The extension requires Banana Accounting Plus (version " + requiredVersion + " or later)";
        break;

      case "it":
        msg = "L'estensione richiede Banana Contabilità Plus (versione " + requiredVersion + " o successiva)";
        break;

      case "fr":
        msg = "L'extension nécessite de Banana Comptabilité Plus (version " + requiredVersion + " ou plus récente)";
        break;

      case "de":
        msg = "Die Erweiterung erfordert Banana Buchhaltung Plus (Version " + requiredVersion + " oder neuer)";
        break;

      default:
        msg = "The extension requires Banana Accounting Plus (version " + requiredVersion + " or later)";
        break;
    }
    Banana.application.showMessages();
    Banana.document.addMessage(msg);
    return false;
  }
  return true;
}
