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
// @pubdate = 2025-12-12
// @publisher = Banana.ch SA
// @description = QuickSum Technical Proposal
// @description.de = QuickSum Technisches Angebot
// @description.it = QuickSum Capitolato d’offerta
// @description.fr = QuickSum Offre technique
// @description.en = QuickSum Technical Proposal
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
  currentParam.name = 'param_print_technical_proposal';
  currentParam.parentObject = '';
  currentParam.title = texts.param_print_technical_proposal;
  currentParam.type = 'bool';
  currentParam.value = userParam.param_print_technical_proposal ? true : false;
  currentParam.defaultvalue = true;
  currentParam.tooltip = texts.tooltip_param_print_technical_proposal;
  currentParam.readValue = function() {
    userParam.param_print_technical_proposal = this.value;
  }
  convertedParam.data.push(currentParam);

  var currentParam = {};
  currentParam.name = 'param_print_summary';
  currentParam.parentObject = '';
  currentParam.title = texts.param_print_summary;
  currentParam.type = 'bool';
  currentParam.value = userParam.param_print_summary ? true : false;
  currentParam.defaultvalue = true;
  currentParam.tooltip = texts.tooltip_param_print_summary;
  currentParam.readValue = function() {
    userParam.param_print_summary = this.value;
  }
  convertedParam.data.push(currentParam);

  var currentParam = {};
  currentParam.name = 'param_report_name';
  currentParam.parentObject = '';
  currentParam.title = texts.param_report_name;
  currentParam.type = 'string';
  currentParam.value = userParam.param_report_name ? userParam.param_report_name : '';
  currentParam.defaultvalue = '';
  currentParam.tooltip = texts.tooltip_param_report_name;
  currentParam.readValue = function () {
    userParam.param_report_name = this.value;
  }
  convertedParam.data.push(currentParam);

  var currentParam = {};
  currentParam.name = 'param_print_header_logo';
  currentParam.parentObject = '';
  currentParam.title = texts.param_print_header_logo;
  currentParam.type = 'bool';
  currentParam.value = userParam.param_print_header_logo ? true : false;
  currentParam.defaultvalue = false;
  currentParam.tooltip = texts.tooltip_param_print_header_logo;
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
  currentParam.tooltip = texts.tooltip_param_header_logo_name;
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
  currentParam.tooltip = texts.tooltip_param_print_header_address;
  currentParam.readValue = function() {
    userParam.param_print_header_address = this.value;
  }
  convertedParam.data.push(currentParam);

  var currentParam = {};
  currentParam.name = 'param_regex_exclude_itemid_cell';
  currentParam.parentObject = '';
  currentParam.title = texts.param_regex_exclude_itemid_cell;
  currentParam.type = 'string';
  currentParam.value = userParam.param_regex_exclude_itemid_cell ? userParam.param_regex_exclude_itemid_cell : '';
  currentParam.defaultvalue = '';
  currentParam.tooltip = texts.tooltip_param_regex_exclude_itemid_cell;
  currentParam.readValue = function () {
    userParam.param_regex_exclude_itemid_cell = this.value;
  }
  convertedParam.data.push(currentParam);

  var currentParam = {};
  currentParam.name = 'param_max_description_lenght';
  currentParam.parentObject = '';
  currentParam.title = texts.param_max_description_lenght;
  currentParam.type = 'string';
  currentParam.value = userParam.param_max_description_lenght ? userParam.param_max_description_lenght : '58';
  currentParam.defaultvalue = '58';
  currentParam.tooltip = texts.tooltip_param_max_description_lenght;
  currentParam.readValue = function () {
    userParam.param_max_description_lenght = this.value;
  }
  convertedParam.data.push(currentParam);

  var currentParam = {};
  currentParam.name = 'param_quantity_decimals';
  currentParam.parentObject = '';
  currentParam.title = texts.param_quantity_decimals;
  currentParam.type = 'string';
  currentParam.value = userParam.param_quantity_decimals ? userParam.param_quantity_decimals : '2';
  currentParam.defaultvalue = '2';
  currentParam.tooltip = texts.tooltip_param_quantity_decimals;
  currentParam.readValue = function () {
    userParam.param_quantity_decimals = this.value;
  }
  convertedParam.data.push(currentParam);

  var currentParam = {};
  currentParam.name = 'param_print_carryforward';
  currentParam.parentObject = '';
  currentParam.title = texts.param_print_carryforward;
  currentParam.type = 'bool';
  currentParam.value = userParam.param_print_carryforward ? true : false;
  currentParam.defaultvalue = true;
  currentParam.tooltip = texts.tooltip_param_print_carryforward;
  currentParam.readValue = function() {
    userParam.param_print_carryforward = this.value;
  }
  convertedParam.data.push(currentParam);

  return convertedParam;
}

/* Function that initializes the user parameters */
function initUserParam() {
  var userParam = {};
  userParam.version = '1.0';
  userParam.param_print_technical_proposal = true;
  userParam.param_print_summary = true;
  userParam.param_report_name = '';
  userParam.param_print_header_logo = false;
  userParam.param_header_logo_name = 'Logo';
  userParam.param_print_header_address = false;
  userParam.param_regex_exclude_itemid_cell = '';
  userParam.param_max_description_lenght = '58';
  userParam.param_quantity_decimals = '2';
  userParam.param_print_carryforward = true;
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

  var report = Banana.Report.newReport(userParam.param_report_name || texts.reportTitle);
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

  if (!userParam.param_print_technical_proposal) {
    return;
  }

  var quicksumTable = banDoc.table("Quicksum");
  if (!quicksumTable) {
    return;
  }
  
  var lang = getLang(banDoc);
  var texts = loadTexts(banDoc,lang);

  /*
    Configuration variables.
    Defines the max rows allowed per page, used to print the total AmountCumulated carried over.
    Defines the max description characters allowed per row.
  */
  var rowsPerPageBase = 72; // without logo/address
  var tableClass = "table_quick_sum";
  if (userParam.param_print_header_address || userParam.param_print_header_logo) {
    rowsPerPageBase = 66; // with logo/address
    tableClass = "table_quick_sum_2";
  }
  var maxDescriptionLength = 58;
  if (userParam.param_max_description_lenght) {
    maxDescriptionLength = userParam.param_max_description_lenght;
  }


  var printedItemIdCalc = {}; // keep track of already printed ItemIdCalc
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
  var colCapitolato6 = table.addColumn("col_capitolato_6");

  var header = table.getHeader();
  var row = header.addRow();
  row.addCell(texts.itemId, "table_quick_sum_header", 1);
  row.addCell(texts.description, "table_quick_sum_header", 1);
  row.addCell(texts.quantity, "table_quick_sum_header right", 1);
  row.addCell(texts.unit, "table_quick_sum_header center", 1);
  row.addCell(texts.unitPrice, "table_quick_sum_header right", 1);
  row.addCell(texts.amountTotal, "table_quick_sum_header right", 1);
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
    if (userParam.param_print_carryforward && pageRowCount <= 1 && printedOnFirstPage) {
      var r = table.addRow();
      r.addCell(" ", "", 6);
      var r = table.addRow();
      if (lastAmountCumulated) {
        r.addCell("","",4);
        r.addCell(texts.carryforward + ": ", "carry_label",1);
        r.addCell(Banana.Converter.toLocaleNumberFormat(lastAmountCumulated, 2, true), "carry_label dashed");
      } else {
        r.addCell(" ", "",6);
      }
      //r.addCell(lastAmountCumulated ? texts.carryforward + ": " + Banana.Converter.toLocaleNumberFormat(lastAmountCumulated, 2, false) : " ", "right", 5);
      var r = table.addRow();
      r.addCell(" ", "", 6);
      pageRowCount += 3; // 1 empty row, 1 row with AmountCalculated, 1 empty row
    }

    /**
     * (2) Normal rows
     */
    var itemIdValue = quicksumRow.value("ItemIdCalc") || "";
    var cleanItemId = itemIdValue.replace(/^T:/, ""); //exclude prefix T: from the check

    // Regex to exclude ItemId cell
    var containsRegex = false;
    var regexString = String(userParam.param_regex_exclude_itemid_cell).trim();
    if (regexString) {
      regexString = regexString.replace(/^\/|\/$/g, ""); // remove first and last slash /.../
      var regexExclude = new RegExp(regexString);
      containsRegex = regexExclude.test(cleanItemId); //return TRUE if contains regex
    }

    var className = "";
    if (itemIdValue && itemIdValue.indexOf("T:") > -1) {
      className = "total";
    }

    // Skip total rows containing the regex
    if (className === "total" && containsRegex) {
      continue;
    }

    // If contains regex never register as printed
    var isFirstOccurrence = false;
    if (!containsRegex) {
      if (!printedItemIdCalc[itemIdValue]) { // itemIdValue NOT present in printedItemIdCalc
        isFirstOccurrence = true;
      }
    }
    
    // First row bold
    var rowClass = className;
    if (isFirstOccurrence) {
      rowClass += " bold";
    }

    var row = table.addRow();

    // ItemId
    if (containsRegex) {
        row.addCell(" ", className, 1); // never print letters
    } else {

        if (!printedItemIdCalc[itemIdValue]) {
            // first time, print
            row.addCell(formatItemId(itemIdValue), rowClass, 1);
            // Register only non-letter ItemIdCalc
            printedItemIdCalc[itemIdValue] = true;
        } else {
            // empty, already printed
            row.addCell(" ", className, 1);
        }
    }

    // Description (first line only)
    var description = quicksumRow.value("Description") || "";
    var descriptionLines = splitTextByLength(description, maxDescriptionLength);
    row.addCell(descriptionLines[0], rowClass + " description", 1);
    //Banana.console.log(descriptionLines[0] + " ==> " +  descriptionLines[0].length);

    // Quantity
    if (quicksumRow.value("Quantity")) {
      row.addCell(Banana.Converter.toLocaleNumberFormat(quicksumRow.value("Quantity"), userParam.param_quantity_decimals, false), className + " right", 1);
    } else {
      row.addCell(" ", className, 1);
    }

    // Unit
    if (quicksumRow.value("Unit")) {
      row.addCell(quicksumRow.value("Unit"), className + " center", 1);
    } else {
      row.addCell(" ", className, 1);
    }
  
    // UnitPrice
    if (quicksumRow.value("UnitPrice")) {
      row.addCell(Banana.Converter.toLocaleNumberFormat(quicksumRow.value("UnitPrice"), 2, false), className + " dashed right", 1);
    } else {
      row.addCell(" ", className, 1);
    }

    // AmountTotal
    if (quicksumRow.value("AmountTotal")) {

      if (className === "total") {
        row.addCell(Banana.Converter.toLocaleNumberFormat(quicksumRow.value("AmountTotal"), 2, true), className + " double right", 1);
      }
      else {
        row.addCell(Banana.Converter.toLocaleNumberFormat(quicksumRow.value("AmountTotal"), 2, false), className + " dashed right", 1);
      }
    }
    else {
      if (className === "total") {
        row.addCell(Banana.Converter.toLocaleNumberFormat(quicksumRow.value("AmountTotal"), 2, true), className + " double right", 1);
      }
      else {
        row.addCell(" ", className, 1);
      }
    }


    printedOnFirstPage = true;
    if (quicksumRow.value("AmountCumulated")) {
        lastAmountCumulated = quicksumRow.value("AmountCumulated");
    }
    pageRowCount += 1;



    // Additional description lines when description length > maxDescriptionLength
    if (descriptionLines.length > 1) {

      var extraLines = descriptionLines.length - 1;

      if (pageRowCount + extraLines > rowsPerPageBase) {

        // close current page
        if (userParam.param_print_carryforward) {
          var cf = table.addRow();
          cf.addCell(" ", "", 6);
          cf = table.addRow();
          cf.addCell("", "", 4);
          cf.addCell(texts.carryforward + ": ", "carry_label", 1);
          cf.addCell(Banana.Converter.toLocaleNumberFormat(lastAmountCumulated, 2, false), "carry_label dashed",1);
        }

        // new page
        pageRowCount = 0;
        printedOnFirstPage = true;
      }

      // Prints split rows
      for (var d = 1; d < descriptionLines.length; d++) {
        var r2 = table.addRow();
        r2.addCell(" ", className, 1);
        r2.addCell(descriptionLines[d], className + " description", 1);
        r2.addCell(" ", className, 1);
        r2.addCell(" ", className, 1);
        r2.addCell(" ", className, 1);
        r2.addCell(" ", className, 1);
        pageRowCount += 1;

        if (pageRowCount === rowsPerPageBase) {
          if (userParam.param_print_carryforward) {
            var c = table.addRow();
            c.addCell(" ", "", 6);
            c = table.addRow();
            c.addCell("", "", 4);
            c.addCell(texts.carryforward + ": ", "carry_label", 1);
            c.addCell(Banana.Converter.toLocaleNumberFormat(lastAmountCumulated, 2, false), "carry_label dashed",1);
          }
          pageRowCount = 0;
          printedOnFirstPage = true;
        }
      }
    }



    /**
     * (3) Row with AmountCalculated at the end of the page
     */
    if (pageRowCount === rowsPerPageBase) {
      if (userParam.param_print_carryforward) {
        var r = table.addRow();
        r.addCell(" ","",6);

        r = table.addRow();
        if (lastAmountCumulated) {
          r.addCell("","",4);
          r.addCell(texts.carryforward + ": ", "carry_label", 1);
          r.addCell(Banana.Converter.toLocaleNumberFormat(lastAmountCumulated, 2, false), "carry_label dashed", 1);
        } else {
          r.addCell(" ", "", 6);
        }
      }
      pageRowCount = 0;
      printedOnFirstPage = true;
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

    // // Regex to exclude row
    // var itemIdValue = quicksumRow.value("ItemIdCalc");
    // var regexString = String(userParam.param_regex_exclude_itemid_cell).trim();
    // var containsRegex = false;
    // if (regexString) {
    //   regexString = regexString.replace(/^\/|\/$/g, ""); // remove first and last slash /.../
    //   var regexExclude = new RegExp(regexString);
    //   containsRegex = regexExclude.test(itemIdValue); //return TRUE if contains regex
    // }
    // if (containsRegex) {
    //   continue;
    // }

    var className = "";
    if (quicksumRow.value("ItemIdCalc") === "T:00") {
      className = " total";
    }

    var row = table.addRow();
    row.addCell(formatItemIdTotals(quicksumRow.value("ItemIdCalc")), "" + className);
    row.addCell(quicksumRow.value("Description"), "" + className);
    row.addCell(Banana.Converter.toLocaleNumberFormat(quicksumRow.value("AmountTotal"),2,true), "dashed right" + className);
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
function formatItemId(str) {
  if (!str) {
    return "";
  }

  let cleanStr = str.trim();

  // Removes everything up to and including the last ":" (if present), i.e. T: S:
  cleanStr = cleanStr.replace(/^.*:/, "");
  
  // If "00" return empty string
  if (cleanStr === "00") {
    return "";
  }

  return cleanStr;
}

function formatItemIdTotals(str) {
  if (!str) {
    return "";
  }
  
  let cleanStr = str.trim();
  
  // Removes everything up to and including the last ":" (if present), i.e. T: S:
  cleanStr = cleanStr.replace(/^.*:/, "");
  
  return cleanStr;
}

/** Function that splits the text by the defined max length */
function splitTextByLength(text, maxLen) {
  var result = [];
  while (text.length > maxLen) {
    result.push(text.substring(0, maxLen));
    text = text.substring(maxLen).replace(/^\s+/, ""); // removes all blanc spaces at the beginning of the new line
  }
  result.push(text); //last piece of text
  return result;
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
    texts.reportTitle = "Technisches Angebot";
    texts.dialogTitle = "Einstellungen";
    texts.itemId = "Art.-Nr.";
    texts.description = "Beschreibung";
    texts.quantity = "Menge";
    texts.unit = "Einheit";
    texts.unitPrice = "Einheitsp.";
    texts.amountTotal = "Ges.-Betr.";
    texts.amountCumulated = "Kum.-Betr.";
    texts.carryforward = "Gesamtübertrag";
    texts.summary = "Zusammenfassung"; 
    texts.amount = "Betrag";

    texts.param_print_technical_proposal = "Technisches Angebot drucken";
    texts.param_print_summary = "Zusammenfassung drucken";
    texts.param_report_name = "Name des Berichts";
    texts.param_print_header_logo = "Logo in der Kopfzeile anzeigen";
    texts.param_header_logo_name = "Name der Logo-Anpassung";
    texts.param_print_header_address = "Adresse in der Kopfzeile anzeigen";    
    texts.param_regex_exclude_itemid_cell = "ItemId ausschließen (Regex)";
    texts.param_max_description_lenght = "Maximale Beschreibungslänge pro Zeile";
    texts.param_quantity_decimals = "Dezimalstellen in der Spalte Menge";
    texts.param_print_carryforward = "Kumulierte Summe auf den Seiten anzeigen";

    texts.tooltip_param_print_technical_proposal = "Schließt das technische Angebot in den Ausdruck ein";
    texts.tooltip_param_print_summary = "Schließt ein Übersichtsblatt mit allen Gesamtsummen in den Ausdruck ein";
    texts.tooltip_param_report_name = "Name, der für die Druckvorschau und für die gespeicherte Datei verwendet wird";
    texts.tooltip_param_print_header_logo = "Schließt das Logo in der Kopfzeile des Dokuments ein";
    texts.tooltip_param_header_logo_name = "Name der zu verwendenden Logo-Anpassung";
    texts.tooltip_param_print_header_address = "Schließt die Adresse in der Kopfzeile des Dokuments ein";    
    texts.tooltip_param_regex_exclude_itemid_cell = "Definiert eine Regel (Regex), um bestimmte Werte aus der Spalte ItemId auszuschließen";
    texts.tooltip_param_max_description_lenght = "Maximale Anzahl von Zeichen pro Beschreibungszeile";
    texts.tooltip_param_quantity_decimals = "Anzahl der in der Spalte „Menge“ angezeigten Dezimalstellen";
    texts.tooltip_param_print_carryforward = "Schließt die kumulierte Gesamtsumme am Seitenende und am Anfang der nächsten Seite ein";
  }
  else if (lang === "fr") {
    texts.reportTitle = "Offre technique";
    texts.dialogTitle = "Paramètres";
    texts.itemId = "No. art.";
    texts.description = "Libellé";
    texts.quantity = "Quantité";
    texts.unit = "Unité";
    texts.unitPrice = "Prix unit.";
    texts.amountTotal = "Total";
    texts.amountCumulated = "Total cumulé";
    texts.carryforward = "Total report";
    texts.summary = "Récapitulation"; 
    texts.amount = "Montant";

    texts.param_print_technical_proposal = "Imprimer l’offre technique";
    texts.param_print_summary = "Imprimer le récapitulatif";
    texts.param_report_name = "Nom du rapport";
    texts.param_print_header_logo = "Afficher le logo d’en-tête";
    texts.param_header_logo_name = "Nom de la personnalisation du logo";
    texts.param_print_header_address = "Afficher l’adresse d’en-tête";
    texts.param_regex_exclude_itemid_cell = "Exclure ItemId (regex)";
    texts.param_max_description_lenght = "Longueur maximale de la description par ligne";
    texts.param_quantity_decimals = "Décimales colonne Quantité";
    texts.param_print_carryforward = "Afficher le total cumulatif sur les pages";

    texts.tooltip_param_print_technical_proposal = "Inclut l’offre technique dans l’impression";
    texts.tooltip_param_print_summary = "Inclut une feuille de récapitulatif avec tous les totaux dans l’impression";
    texts.tooltip_param_report_name = "Nom utilisé pour l’aperçu avant impression et pour le fichier enregistré";
    texts.tooltip_param_print_header_logo = "Inclut le logo dans l’en-tête du document";
    texts.tooltip_param_header_logo_name = "Nom de la personnalisation du logo à utiliser";
    texts.tooltip_param_print_header_address = "Inclut l’adresse dans l’en-tête du document";    
    texts.tooltip_param_regex_exclude_itemid_cell = "Définit une règle (regex) pour exclure certaines valeurs de la colonne ItemId";
    texts.tooltip_param_max_description_lenght = "Nombre maximal de caractères par ligne de description";
    texts.tooltip_param_quantity_decimals = "Nombre de décimales affichées dans la colonne Quantité";
    texts.tooltip_param_print_carryforward = "Inclut le total cumulé en fin de page et au début de la page suivante";
  }
  else if (lang === "it") {
    texts.reportTitle = "Capitolato d'offerta";
    texts.dialogTitle = "Impostazioni";
    texts.itemId = "N. art.";
    texts.description = "Descrizione";
    texts.quantity = "Quantità";
    texts.unit = "Unità";
    texts.unitPrice = "Prezzo unit.";
    texts.amountTotal = "Totale";
    texts.amountCumulated = "Tot. cumul.";
    texts.carryforward = "Riporto totale";
    texts.summary = "Riepilogo"; 
    texts.amount = "Importo";

    texts.param_print_technical_proposal = "Stampa capitolato d'offerta";
    texts.param_print_summary = "Stampa riepilogo";
    texts.param_report_name = "Nome report";
    texts.param_print_header_logo = "Mostra logo intestazione";
    texts.param_header_logo_name = "Nome personalizzazione logo";
    texts.param_print_header_address = "Mostra Indirizzo intestazione";
    texts.param_regex_exclude_itemid_cell = "Escludi ItemId (regex)";
    texts.param_max_description_lenght = "Lunghezza massima descrizione per riga";
    texts.param_quantity_decimals = "Decimali colonna Quantità";
    texts.param_print_carryforward = "Mostra totale cumulativo sulle pagine";

    texts.tooltip_param_print_technical_proposal = "Include il capitolato d’offerta nella stampa";
    texts.tooltip_param_print_summary = "Include il foglio di riepilogo con tutti i totali nella stampa";
    texts.tooltip_param_report_name = "Nome utilizzato per l’anteprima di stampa e per il file salvato";
    texts.tooltip_param_print_header_logo = "Include il logo nell’intestazione del documento";
    texts.tooltip_param_header_logo_name = "Nome della personalizzazione del logo da utilizzare";
    texts.tooltip_param_print_header_address = "Include l’indirizzo nell’intestazione del documento";    
    texts.tooltip_param_regex_exclude_itemid_cell = "Definisce una regola (regex) per non stampare alcuni valori della colonna ItemId";
    texts.tooltip_param_max_description_lenght = "Numero massimo di caratteri per ogni riga di descrizione";
    texts.tooltip_param_quantity_decimals = "Numero di decimali visualizzati nella colonna Quantità";
    texts.tooltip_param_print_carryforward = "Include il totale cumulato a fine pagina e all’inizio della successiva";
  }
  else {
    texts.reportTitle = "Technical proposal";
    texts.dialogTitle = "Settings";
    texts.itemId = "Item No.";
    texts.description = "Description";
    texts.quantity = "Qty";
    texts.unit = "Unit";
    texts.unitPrice = "Unit price";
    texts.amountTotal = "Total";
    texts.amountCumulated = "Cum. total";
    texts.carryforward = "Carried forward total";
    texts.summary = "Summary";
    texts.amount = "Amount";

    texts.param_print_technical_proposal = "Print technical proposal";
    texts.param_print_summary = "Print summary";
    texts.param_report_name = "Nome report";
    texts.param_print_header_logo = "Show header logo";
    texts.param_header_logo_name = "Logo customization name";
    texts.param_print_header_address = "Show header address";
    texts.param_regex_exclude_itemid_cell = "Exclude ItemId (regex)";
    texts.param_max_description_lenght = "Maximum description length per line";
    texts.param_quantity_decimals = "Decimals Quantity column";
    texts.param_print_carryforward = "Show cumulative total on pages";

    texts.tooltip_param_print_technical_proposal = "Includes the technical proposal in the printout";
    texts.tooltip_param_print_summary = "Includes a summary sheet with all totals in the printout";
    texts.tooltip_param_report_name = "Name used for print preview and for the saved file.";
    texts.tooltip_param_print_header_logo = "Includes the logo in the document header";
    texts.tooltip_param_header_logo_name = "Name of the logo customization to use";
    texts.tooltip_param_print_header_address = "Includes the address in the document header";    
    texts.tooltip_param_regex_exclude_itemid_cell = "Defines a rule (regex) to exclude certain values from the ItemId column";
    texts.tooltip_param_max_description_lenght = "Maximum number of characters per description line";
    texts.tooltip_param_quantity_decimals = "Number of decimal places displayed in the Quantity column";
    texts.tooltip_param_print_carryforward = "Includes the cumulative total at the end of the page and at the beginning of the next one";
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
