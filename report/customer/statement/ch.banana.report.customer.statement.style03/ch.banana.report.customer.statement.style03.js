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
// @id = ch.banana.report.customer.statement.style03.js
// @api = 1.0
// @pubdate = 2023-09-13
// @publisher = Banana.ch SA
// @description = Customer Statement (Banana+)
// @description.it = Estratto cliente (Banana+)
// @description.de = Kundenauszug (Banana+)
// @description.fr = Extrait de compte client (Banana+)
// @description.nl = Rekeninguittreksel klant (Banana+)
// @description.en = Customer statement (Banana+)
// @doctype = *
// @task = report.customer.statement

var repTableObj = "";
var rowNumber = 0;
var pageNr = 1;

//====================================================================//
// PARAMETERS
//====================================================================//
function settingsDialog() {
  var param = initParam();
  var savedParam = Banana.document.getScriptSettings();
  if (savedParam.length > 0) {
     param = JSON.parse(savedParam);
  }
  param = verifyParam(param);

  if (typeof(Banana.Ui.openPropertyEditor) !== 'undefined') {
     var dialogTitle = 'Settings';
     var convertedParam = convertParam(param);
     var pageAnchor = 'dlgSettings';
     if (!Banana.Ui.openPropertyEditor(dialogTitle, convertedParam, pageAnchor)) {
        return;
     }
     for (var i = 0; i < convertedParam.data.length; i++) {
        // Read values to param (through the readValue function)
        convertedParam.data[i].readValue();
     }
  }
  var paramToString = JSON.stringify(param);
  var value = Banana.document.setScriptSettings(paramToString);
}

function convertParam(param) {

  //Application language 
  var appLang = 'en';
  if (Banana.application.locale) {
     appLang = Banana.application.locale;
  }
  if (appLang.length > 2) {
     appLang = appLang.substr(0, 2);
  }
  var texts = setTexts(appLang);

  var convertedParam = {};
  convertedParam.version = '1.0';
  convertedParam.data = [];

  /**
   * Header
   */
  var currentParam = {};
  currentParam.name = 'print_header';
  currentParam.title = texts.param_print_header;
  currentParam.type = 'bool';
  currentParam.value = param.print_header ? true : false;
  currentParam.defaultvalue = true;
  currentParam.readValue = function() {
     param.print_header = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'print_logo';
  currentParam.title = texts.param_print_logo;
  currentParam.type = 'bool';
  currentParam.value = param.print_logo ? true : false;
  currentParam.defaultvalue = true;
  currentParam.readValue = function() {
     param.print_logo = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'logo_name';
  currentParam.title = texts.param_logo_name;
  currentParam.type = 'string';
  currentParam.value = param.logo_name ? param.logo_name : 'Logo';
  currentParam.defaultvalue = "Logo";
  currentParam.readValue = function() {
     param.logo_name = this.value;
  }
  convertedParam.data.push(currentParam);


  /**
   * Texts
   */
  currentParam = {};
  currentParam.name = 'texts';
  currentParam.title = texts.param_texts;
  currentParam.type = 'string';
  currentParam.value = '';
  currentParam.editable = false;
  currentParam.readValue = function() {
     param.texts = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'it';
  currentParam.parentObject = 'texts';
  currentParam.title = 'it';
  currentParam.type = 'string';
  currentParam.value = '';
  currentParam.editable = false;
  if (appLang !== currentParam.name) { //Collapse when it's not the document language
     currentParam.collapse = true;
  }
  currentParam.readValue = function() {
     param.it = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'text_title_it';
  currentParam.parentObject = 'it';
  currentParam.title = texts.param_text_title_it;
  currentParam.type = 'string';
  currentParam.value = param.text_title_it ? param.text_title_it : '';
  currentParam.readValue = function() {
     param.text_title_it = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'text_begin_it';
  currentParam.parentObject = 'it';
  currentParam.title = texts.param_text_begin_it;
  currentParam.type = 'multilinestring';
  currentParam.value = param.text_begin_it ? param.text_begin_it : '';
  currentParam.readValue = function() {
     param.text_begin_it = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'text_final_it';
  currentParam.parentObject = 'it';
  currentParam.title = texts.param_text_final_it;
  currentParam.type = 'multilinestring';
  currentParam.value = param.text_final_it ? param.text_final_it : '';
  currentParam.readValue = function() {
     param.text_final_it = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'fr';
  currentParam.parentObject = 'texts';
  currentParam.title = 'fr';
  currentParam.type = 'string';
  currentParam.value = '';
  currentParam.editable = false;
  if (appLang !== currentParam.name) { //Collapse when it's not the document language
     currentParam.collapse = true;
  }
  currentParam.readValue = function() {
     param.fr = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'text_title_fr';
  currentParam.parentObject = 'fr';
  currentParam.title = texts.param_text_title_fr;
  currentParam.type = 'string';
  currentParam.value = param.text_title_fr ? param.text_title_fr : '';
  currentParam.readValue = function() {
     param.text_title_fr = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'text_begin_fr';
  currentParam.parentObject = 'fr';
  currentParam.title = texts.param_text_begin_fr;
  currentParam.type = 'multilinestring';
  currentParam.value = param.text_begin_fr ? param.text_begin_fr : '';
  currentParam.readValue = function() {
     param.text_begin_fr = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'text_final_fr';
  currentParam.parentObject = 'fr';
  currentParam.title = texts.param_text_final_fr;
  currentParam.type = 'multilinestring';
  currentParam.value = param.text_final_fr ? param.text_final_fr : '';
  currentParam.readValue = function() {
     param.text_final_fr = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'de';
  currentParam.parentObject = 'texts';
  currentParam.title = 'de';
  currentParam.type = 'string';
  currentParam.value = '';
  currentParam.editable = false;
  if (appLang !== currentParam.name) { //Collapse when it's not the document language
     currentParam.collapse = true;
  }
  currentParam.readValue = function() {
     param.de = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'text_title_de';
  currentParam.parentObject = 'de';
  currentParam.title = texts.param_text_title_de;
  currentParam.type = 'string';
  currentParam.value = param.text_title_de ? param.text_title_de : '';
  currentParam.readValue = function() {
     param.text_title_de = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'text_begin_de';
  currentParam.parentObject = 'de';
  currentParam.title = texts.param_text_begin_de;
  currentParam.type = 'multilinestring';
  currentParam.value = param.text_begin_de ? param.text_begin_de : '';
  currentParam.readValue = function() {
     param.text_begin_de = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'text_final_de';
  currentParam.parentObject = 'de';
  currentParam.title = texts.param_text_final_de;
  currentParam.type = 'multilinestring';
  currentParam.value = param.text_final_de ? param.text_final_de : '';
  currentParam.readValue = function() {
     param.text_final_de = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'en';
  currentParam.parentObject = 'texts';
  currentParam.title = 'en';
  currentParam.type = 'string';
  currentParam.value = '';
  currentParam.editable = false;
  if (appLang !== currentParam.name) { //Collapse when it's not the document language
     currentParam.collapse = true;
  }
  currentParam.readValue = function() {
     param.en = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'text_title_en';
  currentParam.parentObject = 'en';
  currentParam.title = texts.param_text_title_en;
  currentParam.type = 'string';
  currentParam.value = param.text_title_en ? param.text_title_en : '';
  currentParam.readValue = function() {
     param.text_title_en = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'text_begin_en';
  currentParam.parentObject = 'en';
  currentParam.title = texts.param_text_begin_en;
  currentParam.type = 'multilinestring';
  currentParam.value = param.text_begin_en ? param.text_begin_en : '';
  currentParam.readValue = function() {
     param.text_begin_en = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'text_final_en';
  currentParam.parentObject = 'en';
  currentParam.title = texts.param_text_final_en;
  currentParam.type = 'multilinestring';
  currentParam.value = param.text_final_en ? param.text_final_en : '';
  currentParam.readValue = function() {
     param.text_final_en = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'nl';
  currentParam.parentObject = 'texts';
  currentParam.title = 'nl';
  currentParam.type = 'string';
  currentParam.value = '';
  currentParam.editable = false;
  if (appLang !== currentParam.name) { //Collapse when it's not the document language
     currentParam.collapse = true;
  }
  currentParam.readValue = function() {
     param.nl = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'text_title_nl';
  currentParam.parentObject = 'nl';
  currentParam.title = texts.param_text_title_nl;
  currentParam.type = 'string';
  currentParam.value = param.text_title_nl ? param.text_title_nl : '';
  currentParam.readValue = function() {
     param.text_title_nl = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'text_begin_nl';
  currentParam.parentObject = 'nl';
  currentParam.title = texts.param_text_begin_nl;
  currentParam.type = 'multilinestring';
  currentParam.value = param.text_begin_nl ? param.text_begin_nl : '';
  currentParam.readValue = function() {
     param.text_begin_nl = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'text_final_nl';
  currentParam.parentObject = 'nl';
  currentParam.title = texts.param_text_final_nl;
  currentParam.type = 'multilinestring';
  currentParam.value = param.text_final_nl ? param.text_final_nl : '';
  currentParam.readValue = function() {
     param.text_final_nl = this.value;
  }
  convertedParam.data.push(currentParam);



  /**
   * Styles
   */
  currentParam = {};
  currentParam.name = 'font_family';
  currentParam.title = texts.param_font_family;
  currentParam.type = 'string';
  currentParam.value = param.font_family ? param.font_family : '';
  currentParam.defaultvalue = 'Helvetica';
  currentParam.readValue = function() {
     param.font_family = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'color';
  currentParam.title = texts.param_color;
  currentParam.type = 'color';
  currentParam.value = param.color ? param.color : '#000000';
  currentParam.defaultvalue = '#000000';
  currentParam.readValue = function() {
     param.color = this.value;
  }
  convertedParam.data.push(currentParam);

  return convertedParam;
}

function initParam() {
  var param = {};
  param.print_header = true;
  param.print_logo = true;
  param.logo_name = 'Logo';
  param.texts = '';
  param.text_title_it = '';
  param.text_begin_it = '';
  param.text_final_it = '';
  param.text_title_fr = '';
  param.text_begin_fr = '';
  param.text_final_fr = '';
  param.text_title_de = '';
  param.text_begin_de = '';
  param.text_final_de = '';
  param.text_title_en = '';
  param.text_begin_en = '';
  param.text_final_en = '';
  param.text_title_nl = '';
  param.text_begin_nl = '';
  param.text_final_nl = '';
  param.font_family = 'Helvetica';
  param.color = '#000000';
  return param;
}

function verifyParam(param) {
  if (!param.print_header) {
     param.print_header = false;
  }
  if (!param.print_logo) {
     param.print_logo = false;
  }
  if (!param.logo_name) {
     param.logo_name = 'Logo';
  }
  if (!param.texts) {
     param.texts = '';
  }
  if (!param.text_title_it) {
     param.text_title_it = '';
  }
  if (!param.text_begin_it) {
     param.text_begin_it = '';
  }
  if (!param.text_final_it) {
     param.text_final_it = '';
  }
  if (!param.text_title_fr) {
     param.text_title_fr = '';
  }
  if (!param.text_begin_fr) {
     param.text_begin_fr = '';
  }
  if (!param.text_final_fr) {
     param.text_final_fr = '';
  }
  if (!param.text_title_de) {
     param.text_title_de = '';
  }
  if (!param.text_begin_de) {
     param.text_begin_de = '';
  }
  if (!param.text_final_de) {
     param.text_final_de = '';
  }
  if (!param.text_title_en) {
     param.text_title_en = '';
  }
  if (!param.text_final_en) {
     param.text_final_en = '';
  }
  if (!param.text_begin_en) {
     param.text_begin_en = '';
  }
  if (!param.text_title_nl) {
     param.text_title_nl = '';
  }
  if (!param.text_begin_nl) {
     param.text_begin_nl = '';
  }
  if (!param.text_final_nl) {
     param.text_final_nl = '';
  }
  if (!param.font_family) {
     param.font_family = '';
  }
  if (!param.color) {
     param.color = '#000000';
  }
  return param;
}



//====================================================================//
// PRINT STATEMENT
//====================================================================//
function printDocument(jsonStatement, repDocObj, repStyleObj) {

   var param = initParam();
   var savedParam = Banana.document.getScriptSettings();
   if (savedParam.length > 0) {
      param = JSON.parse(savedParam);
      param = verifyParam(param);
   }

   //jsonStatement can be a json string or a js object
   var statementObj = null;
   if (typeof(jsonStatement) === 'object') {
      statementObj = jsonStatement;
   } else if (typeof(jsonStatement) === 'string') {
      statementObj = JSON.parse(jsonStatement)
   }

   // Get the language
   var langDoc = getLangDoc(statementObj);

   // Statement texts which need translation
   var texts = setTexts(langDoc);

   // Print statement report
   printInvoiceStatement(Banana.document, statementObj, repDocObj, repStyleObj, param, texts);

   // Variable starts with $
   var variables = {};
   setVariables(variables, param);
   setCss(repStyleObj, variables);
}

function printInvoiceStatement(banDoc, statementObj, repDocObj, repStyleObj, param, texts) {
  
  // Document
  var reportObj = Banana.Report;
  if (!repDocObj) {
    repDocObj = reportObj.newReport(texts.statement + ": " + statementObj.document_info.number);
  } else {
    var pageBreak = repDocObj.addPageBreak();
    pageBreak.addClass("pageReset");
  }

  printInvoiceStatement_HeaderPage(statementObj, repDocObj, repStyleObj, param);
  printInvoiceStatement_Info(statementObj, repDocObj, texts);
  printInvoiceStatement_Address(banDoc, statementObj, repDocObj, texts);
  printInvoiceStatement_Title(statementObj, repDocObj, texts, param);
  repTableObj = repDocObj.addTable("doc_table");
  printInvoiceStatement_BeginText(statementObj, param);
  printInvoiceStatement_Items(statementObj, repDocObj, texts);
  printInvoiceStatement_FinalText(statementObj, param);
  
  return repDocObj;
}

function printInvoiceStatement_HeaderPage(statementObj, repDocObj, repStyleObj, param) {

  // Header page, logo and address

  var headerLogoSection = repDocObj.getHeader().addSection();
  if (param.print_logo) {
     headerLogoSection = repDocObj.addSection("");
     var logoFormat = Banana.Report.logoFormat(param.logo_name);
     if (logoFormat) {
        var logoElement = logoFormat.createDocNode(headerLogoSection, repStyleObj, "logo");
        repDocObj.getHeader().addChild(logoElement);
     } else {
        headerLogoSection.addClass("header_text");
     }
  } else {
     headerLogoSection.addClass("header_text");
  }
  if (param.print_header) {
     var supplierLines = getInvoiceSupplier(statementObj.supplier_info).split('\n');
     for (var i = 0; i < supplierLines.length; i++) {
        headerLogoSection.addParagraph(supplierLines[i], "header_rows");
     }
  }
}

function printInvoiceStatement_Info(statementObj, repDocObj, texts) {

  // Info: date, customer No, page

  var infoTable = repDocObj.addTable("info_table");
  var tableRow = infoTable.addRow();
  var cellInfo = tableRow.addCell("", "", 1);
  cellInfo.addParagraph(texts.date + ": " + Banana.Converter.toLocaleDateFormat(statementObj.document_info.date), "");
  cellInfo.addParagraph(texts.customer + ": " + statementObj.customer_info.number, "");
  cellInfo.addParagraph(texts.page + ": " + pageNr, "");
}

function printInvoiceStatement_InfoOtherPages(statementObj, repDocObj, texts) {

  // Info for pages 2+

  var infoTable = repDocObj.addTable("info_table_row0");
  var tableRow = infoTable.addRow();
  var cellInfo = tableRow.addCell("", "", 1);
  cellInfo.addParagraph(texts.date + ": " + Banana.Converter.toLocaleDateFormat(statementObj.document_info.date), "");
  cellInfo.addParagraph(texts.customer + ": " + statementObj.customer_info.number, "");
  cellInfo.addParagraph(texts.page + ": " + pageNr, "");
}

function printInvoiceStatement_Address(banDoc, statementObj, repDocObj, texts) {

  // Reminder address (customer address)

  var addressTable = repDocObj.addTable("address_table_right");
  var tableRow = addressTable.addRow();
  var cellAddress = tableRow.addCell("", "", 1);
  var addressLines = getInvoiceAddress(statementObj).split('\n');
  for (var i = 0; i < addressLines.length; i++) {
     cellAddress.addParagraph(addressLines[i], "");
  }
}

function printInvoiceStatement_Title(statementObj, repDocObj, texts, param) {

  // Title

  var langDoc = getLangDoc(statementObj);
  
  var titleText = texts.statement;
  var titleParam = param['text_title_'+langDoc];

  if (titleParam && titleParam.trim()) {
     titleText = titleParam.trim();
  }

  var titleTable = repDocObj.addTable("title_table");
  tableRow = titleTable.addRow();
  tableRow.addCell(titleText, "bold title", 1);
}

function printInvoiceStatement_BeginText(statementObj, param) {

  // Begin text

  var langDoc = getLangDoc(statementObj);

  var textBegin = param['text_begin_'+langDoc];
  if (textBegin) {
     tableRow = repTableObj.getHeader().addRow();
     var textCell = tableRow.addCell("", "begin_text", 10);
     var textBeginLines = textBegin.split('\n');
     for (var i = 0; i < textBeginLines.length; i++) {
        if (textBeginLines[i]) {
           textCell.addCell(textBeginLines[i], "", 10);
           rowNumber++;
        } else {
           textCell.addCell(" ", "", 10); //empty lines
           rowNumber++;
        }
     }
     tableRow = repTableObj.getHeader().addRow();
     tableRow.addCell(" ", "", 10);
  }
}

function printInvoiceStatement_Items(statementObj, repDocObj, texts) {

  // Details table

  var repTableCol1 = repTableObj.addColumn("repTableCol1");
  var repTableCol2 = repTableObj.addColumn("repTableCol2");
  var repTableCol3 = repTableObj.addColumn("repTableCol3");
  var repTableCol4 = repTableObj.addColumn("repTableCol4");
  var repTableCol5 = repTableObj.addColumn("repTableCol5");
  var repTableCol6 = repTableObj.addColumn("repTableCol6");
  var repTableCol7 = repTableObj.addColumn("repTableCol7");
  var repTableCol8 = repTableObj.addColumn("repTableCol8");
  var repTableCol9 = repTableObj.addColumn("repTableCol9");
  var repTableCol10 = repTableObj.addColumn("repTableCol10");

  var dd = repTableObj.getHeader().addRow();
  dd.addCell(texts.invoice_no, "items_table_header center", 1);
  dd.addCell(texts.invoice_date, "items_table_header center", 1);
  dd.addCell(texts.invoice_debit, "items_table_header right", 1);
  dd.addCell(texts.invoice_credit, "items_table_header right", 1);
  dd.addCell(texts.invoice_balance, "items_table_header right", 1);
  dd.addCell(texts.invoice_currency, "items_table_header center", 1);
  dd.addCell(texts.invoice_payment_date, "items_table_header center", 1);
  dd.addCell(texts.invoice_due_date, "items_table_header center", 1);
  dd.addCell(texts.invoice_due_days, "items_table_header center", 1);
  dd.addCell(texts.invoice_last_reminder, "items_table_header center", 1);

  //Items
  for (var i = 0; i < statementObj.items.length; i++) {

   rowNumber = printInvoiceStatement_checkFileLength(statementObj, repDocObj, texts);

   var item = statementObj.items[i];
   var classRow = "item_row";
   if (item.item_type && item.item_type.indexOf("total") === 0) {
      classRow = "item_total";
   }
   var classTotal = "";
   if (i == statementObj.items.length - 1) {
      classTotal = " bold total";
      tableRow = repTableObj.addRow();
      tableRow.addCell("", "", 10);
   }
   
   tableRow = repTableObj.addRow(classRow);
   tableRow.addCell(item.number, "center padding-left padding-right" + classTotal, 1);
   tableRow.addCell(Banana.Converter.toLocaleDateFormat(item.date), "padding-left padding-right" + classTotal, 1);
   tableRow.addCell(Banana.Converter.toLocaleNumberFormat(item.debit, statementObj.document_info.decimals_amounts, true), "padding-left padding-right amount" + classTotal, 1);
   tableRow.addCell(Banana.Converter.toLocaleNumberFormat(item.credit, statementObj.document_info.decimals_amounts, true), "padding-left padding-right amount" + classTotal, 1);
   tableRow.addCell(Banana.Converter.toLocaleNumberFormat(item.balance, statementObj.document_info.decimals_amounts, true), "padding-left padding-right amount" + classTotal, 1);
   tableRow.addCell(item.currency, "padding-left padding-right center" + classTotal, 1);
   tableRow.addCell(Banana.Converter.toLocaleDateFormat(item.payment_date), "padding-left padding-right" + classTotal, 1);
   tableRow.addCell(Banana.Converter.toLocaleDateFormat(item.due_date), "padding-left padding-right" + classTotal, 1);
   tableRow.addCell(item.due_days, "padding-left padding-right center" + classTotal, 1);

   var lastReminderDate = Banana.Converter.toLocaleDateFormat(item.last_reminder_date);
   if (lastReminderDate.length > 0) {
      lastReminderDate = lastReminderDate + " (" + item.last_reminder + ".)";
      tableRow.addCell(lastReminderDate, "padding-left padding-right" + classTotal, 1);
   }
   else {
      tableRow.addCell("", "padding-left padding-right" + classTotal, 1);
   }
  }
  tableRow = repTableObj.addRow();
  tableRow.addCell("", "border-bottom", 10);
}

function printInvoiceStatement_ItemsHeaderOtherPages(repDocObj, texts) {
  repTableObj = repDocObj.addTable("doc_table_row0");
  var repTableCol1 = repTableObj.addColumn("repTableCol1");
  var repTableCol2 = repTableObj.addColumn("repTableCol2");
  var repTableCol3 = repTableObj.addColumn("repTableCol3");
  var repTableCol4 = repTableObj.addColumn("repTableCol4");
  var repTableCol5 = repTableObj.addColumn("repTableCol5");
  var repTableCol6 = repTableObj.addColumn("repTableCol6");
  var repTableCol7 = repTableObj.addColumn("repTableCol7");
  var repTableCol8 = repTableObj.addColumn("repTableCol8");
  var repTableCol9 = repTableObj.addColumn("repTableCol9");
  var repTableCol10 = repTableObj.addColumn("repTableCol10");

  var dd = repTableObj.getHeader().addRow();
  dd.addCell(texts.invoice_no, "items_table_header center", 1);
  dd.addCell(texts.invoice_date, "items_table_header center", 1);
  dd.addCell(texts.invoice_debit, "items_table_header right", 1);
  dd.addCell(texts.invoice_credit, "items_table_header right", 1);
  dd.addCell(texts.invoice_balance, "items_table_header right", 1);
  dd.addCell(texts.invoice_currency, "items_table_header center", 1);
  dd.addCell(texts.invoice_payment_date, "items_table_header center", 1);
  dd.addCell(texts.invoice_due_date, "items_table_header center", 1);
  dd.addCell(texts.invoice_due_days, "items_table_header center", 1);
  dd.addCell(texts.invoice_last_reminder, "items_table_header center", 1);
}

function printInvoiceStatement_FinalText(statementObj, param) {
   
   // Final text
 
   var langDoc = getLangDoc(statementObj);
 
   var textFinal = param['text_final_'+langDoc];
   if (textFinal) {
      tableRow = repTableObj.addRow();
      tableRow.addCell(" ", "", 10);
      rowNumber++;
      tableRow = repTableObj.addRow();
      var textCell = tableRow.addCell("", "final_text", 10);
      var textFinalLines = textFinal.split('\n');
      for (var i = 0; i < textFinalLines.length; i++) {
         if (textFinalLines[i]) {
            textCell.addCell(textFinalLines[i], "", 10);
            rowNumber++;
         } else {
            textCell.addCell(" ", "", 10); //empty lines
            rowNumber++;
         }
      }
   }
}

function printInvoiceStatement_checkFileLength(statementObj, repDocObj, texts) {

   if (rowNumber >= 39 && pageNr == 1) {
      //first page of reminder, max 33 rows (items + begin text + final text)
      repDocObj.addPageBreak();
      pageNr++;
      printInvoiceStatement_InfoOtherPages(statementObj, repDocObj, texts);
      printInvoiceStatement_ItemsHeaderOtherPages(repDocObj, texts);
      return 0;
   }
   else if (rowNumber >= 47 && pageNr > 1) {
      //other pages of reminder (2+), max 38 rows (items + final text)
      repDocObj.addPageBreak();
      pageNr++;
      printInvoiceStatement_InfoOtherPages(statementObj, repDocObj, texts);
      printInvoiceStatement_ItemsHeaderOtherPages(repDocObj, texts);
      return 0;
   }

  rowNumber++;
  return rowNumber;
}




//====================================================================//
// UTILITIES
//====================================================================//
function getInvoiceSupplier(invoiceSupplier) {
 var supplierAddress = "";

 if (invoiceSupplier.business_name) {
   supplierAddress += invoiceSupplier.business_name + "\n";
 }
 if (invoiceSupplier.first_name) {
   supplierAddress += invoiceSupplier.first_name;
 }
 if (invoiceSupplier.last_name) {
   if (invoiceSupplier.first_name) {
     supplierAddress += " ";
   }
   supplierAddress += invoiceSupplier.last_name;
 }
 supplierAddress += "\n";

 if (invoiceSupplier.address1) {
   supplierAddress += invoiceSupplier.address1;
 }
 if (invoiceSupplier.address2) {
   if (invoiceSupplier.address1) {
     supplierAddress += ", ";
   }
   supplierAddress += invoiceSupplier.address2;
 }

 if (invoiceSupplier.postal_code) {
   if (invoiceSupplier.address1 || invoiceSupplier.address2) {
     supplierAddress += ", ";
   }
   supplierAddress += invoiceSupplier.postal_code;
 }
 if (invoiceSupplier.city) {
   if (invoiceSupplier.postal_code) {
     supplierAddress += " ";
   }
   supplierAddress += invoiceSupplier.city;
 }
 supplierAddress += "\n";

 if (invoiceSupplier.phone) {
   supplierAddress += "Tel: " + invoiceSupplier.phone;
 }
 if (invoiceSupplier.fax) {
   if (invoiceSupplier.phone) {
     supplierAddress += ", ";
   }
   supplierAddress += "Fax: " + invoiceSupplier.fax;
 }
 supplierAddress += "\n";

 if (invoiceSupplier.email) {
   supplierAddress += invoiceSupplier.email;
 }
 if (invoiceSupplier.web) {
   if (invoiceSupplier.email) {
     supplierAddress += ", ";
   }
   supplierAddress += invoiceSupplier.web;
 }
 if (invoiceSupplier.vat_number) {
   supplierAddress += "\n" + invoiceSupplier.vat_number;
 }

 return supplierAddress;
}

function getInvoiceAddress(statementObj) {

   // <OrganisationName>
   // <NamePrefix>
   // <FirstName> <FamilyName>
   // <Street> <AddressExtra>
   // <POBox>
   // <PostalCode> <Locality>

   var invoiceAddress = statementObj.customer_info;
   var address = "";

   // Banana.application.showMessages(false); //disable dialog message notifications; only show in Messages panel

   if (invoiceAddress.business_name) {
      address += invoiceAddress.business_name + "\n";
   }

   if (invoiceAddress.courtesy) {
      address += invoiceAddress.courtesy + "\n";
   }

   if (invoiceAddress.first_name) {
      address += invoiceAddress.first_name;
   }
   if (invoiceAddress.last_name) {
      if (invoiceAddress.first_name) {
         address += " ";
      }
      address += invoiceAddress.last_name;
   }
   if (invoiceAddress.first_name || invoiceAddress.last_name) {
      address += "\n";
   }

   // if (!invoiceAddress.business_name && !invoiceAddress.first_name && !invoiceAddress.last_name) {
   //    address += "@error"+" "+texts.error_address_name+"\n";
   //    var row = banDoc.table("Accounts").row(reminderObj.customer_info.origin_row);
   //    if (row) {
   //       row.addMessage(texts.error_address_name);
   //    }
   // }

   if (invoiceAddress.address1) {
      address += invoiceAddress.address1 + "\n";
   }

   if (invoiceAddress.address2) {
      address += invoiceAddress.address2 + "\n";
   }

   if (invoiceAddress.address3) {
      address += invoiceAddress.address3 + "\n";
   }

   if (invoiceAddress.postal_code) {
      address += invoiceAddress.postal_code;
   }
   // else {
   //    address += "@error"+" "+texts.error_address_zip+"\n";
   //    var row = banDoc.table("Accounts").row(reminderObj.customer_info.origin_row);
   //    if (row) {
   //       row.addMessage(texts.error_address_zip);
   //    }
   // }

   if (invoiceAddress.city) {
      if (invoiceAddress.postal_code) {
         address += " ";
      }
      address += invoiceAddress.city + "\n";
   }
   // else {
   //    address += "\n@error"+" "+texts.error_address_locality;
   //    var row = banDoc.table("Accounts").row(reminderObj.customer_info.origin_row);
   //    if (row) {
   //       row.addMessage(texts.error_address_locality);
   //    }
   // }

   if (invoiceAddress.country) {
      address += invoiceAddress.country;
   }

   return address;
}




//====================================================================//
// STYLES
//====================================================================//
function setCss(repStyleObj, variables) {

  var textCSS = "";

  /**
    Default CSS file
  */
  var file = Banana.IO.getLocalFile("file:script/ch.banana.report.customer.statement.style03.css");
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

function setVariables(variables, param) {
  /** 
    Sets all the variables values.
  */
  variables.$font_family = param.font_family;
  variables.$color = param.color;
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



//====================================================================//
// LANGUAGE AND TEXTS
//====================================================================//
function getLangDoc(statementObj) {
  var langDoc = '';
  if (statementObj.customer_info.lang) {
     langDoc = statementObj.customer_info.lang;
  }
  if (langDoc.length <= 0) {
     langDoc = statementObj.document_info.locale;
  }
  return langDoc;
}

function setTexts(language) {

  var texts = {};

  // Text for parameteres always displayed
  texts.param_text_title_it = 'Titolo';
  texts.param_text_begin_it = 'Testo iniziale';
  texts.param_text_final_it = 'Testo finale';
  texts.param_text_title_fr = 'Titre';
  texts.param_text_begin_fr = 'Texte de début';
  texts.param_text_final_fr = 'Texte final';
  texts.param_text_title_de = 'Titel';
  texts.param_text_begin_de = 'Anfangstext';
  texts.param_text_final_de = 'Text am Ende';
  texts.param_text_title_en = 'Title';
  texts.param_text_begin_en = 'Begin text';
  texts.param_text_final_en = 'Final text';
  texts.param_text_title_nl = 'Titel';
  texts.param_text_begin_nl = 'Begintekst';
  texts.param_text_final_nl = 'Eindtekst';

  if (language == 'it')
  {
    texts.customer = 'No Cliente';
    texts.date = 'Data';
    texts.invoice_no = 'No. fattura';
    texts.invoice_date = 'Data';
    texts.invoice_debit = 'Dare';
    texts.invoice_credit = 'Avere';
    texts.invoice_balance = 'Saldo';
    texts.invoice_currency = 'Divisa';
    texts.invoice_payment_date = 'Data pag.';
    texts.invoice_due_date = 'Data scad.';
    texts.invoice_due_days = 'Giorni scad.';
    texts.invoice_last_reminder = 'Richiamo';
    texts.page = 'Pagina';
    texts.total = 'Totale';
    texts.statement = 'Estratto conto';
    texts.param_color = 'Colore testo intestazione dettagli';
    texts.param_font_family = 'Tipo carattere';
    texts.param_print_header = 'Includi intestazione pagina';
    texts.param_print_logo = 'Stampa logo';
    texts.param_logo_name = 'Nome personalizzazione logo';
    texts.param_texts = 'Testi';
  }
  else if (language == 'de')
  {
    texts.customer = 'Kunde-Nr';
    texts.date = 'Datum';
    texts.invoice_no = 'Rg.-Nr.';
    texts.invoice_date = 'Datum';
    texts.invoice_debit = 'Soll';
    texts.invoice_credit = 'Haben';
    texts.invoice_balance = 'Saldo';
    texts.invoice_currency = 'Währung';
    texts.invoice_payment_date = 'Bezahlung';
    texts.invoice_due_date = 'Fälligkeit';
    texts.invoice_due_days = 'Überfälligkeit';
    texts.invoice_last_reminder = 'Mahnung';
    texts.page = 'Seite';
    texts.statement = 'Kontoauszug';
    texts.param_color = 'Farbtext Details-Kopfzeilen';
    texts.param_font_family = 'Typ Schriftzeichen';
    texts.param_print_header = 'Seitenüberschrift einschliessen';
    texts.param_print_logo = 'Logo ausdrucken';
    texts.param_logo_name = 'Name der Anpassung';
    texts.param_texts = 'Texte';
  }
  else if (language == 'fr')
  {
    texts.customer = 'No. client';
    texts.date = 'Date';
    texts.invoice_no = 'No.Facture';
    texts.invoice_date = 'Date';
    texts.invoice_debit = 'Débit';
    texts.invoice_credit = 'Crédit';
    texts.invoice_balance = 'Solde';
    texts.invoice_currency = 'Devise';
    texts.invoice_payment_date = 'Date paiement';
    texts.invoice_due_date = 'Date échéance';
    texts.invoice_due_days = 'Jours';
    texts.invoice_last_reminder = 'Rappel';
    texts.page = 'Page';
    texts.statement = 'Extrait client';
    texts.param_color = "Couleur de texte pour l'en-tête des détails";
    texts.param_font_family = 'Police de caractère';
    texts.param_print_header = 'Inclure en-tête de page';
    texts.param_print_logo = 'Imprimer logo';
    texts.param_logo_name = 'Nom personnalisation logo';
    texts.param_texts = 'Textes';
  }
  else if (language == 'nl')
  {
    texts.customer = 'Klantennummer';
    texts.date = 'Datum';
    texts.invoice_no = 'Factuurnummer';
    texts.invoice_date = 'Datum';
    texts.invoice_debit = 'Debit';
    texts.invoice_credit = 'Credit';
    texts.invoice_balance = 'Saldo';
    texts.invoice_currency = 'Valuta';
    texts.invoice_payment_date = 'Bet.datum';
    texts.invoice_due_date = 'Vervaldatum';
    texts.invoice_due_days = 'Dagen te laat';
    texts.invoice_last_reminder = 'Betalingsherinnering';
    texts.page = 'Pagina';
    texts.total = 'Totaal';
    texts.statement = 'Rekeninguittreksel klant';
    texts.param_color = 'Tekstkleur koptekst details';
    texts.param_font_family = 'Lettertype';
    texts.param_print_header = 'Pagina-koptekst opnemen';
    texts.param_print_logo = 'Druklogo';
    texts.param_logo_name = 'Naam logo aanpassing';
    texts.param_texts = 'Teksten';
  }
  else
  {
    texts.customer = 'Customer No';
    texts.date = 'Date';
    texts.invoice_no = 'Invoice Nr.';
    texts.invoice_date = 'Date';
    texts.invoice_debit = 'Debit';
    texts.invoice_credit = 'Credit';
    texts.invoice_balance = 'Balance';
    texts.invoice_currency = 'Currency';
    texts.invoice_payment_date = 'Paym. date';
    texts.invoice_due_date = 'Due date';
    texts.invoice_due_days = 'Due days';
    texts.invoice_last_reminder = 'Paym. Reminder';
    texts.page = 'Page';
    texts.total = 'Total';
    texts.statement = 'Customer statement';
    texts.param_color = 'Text color of details header';
    texts.param_font_family = 'Font type';
    texts.param_print_header = 'Include page header';
    texts.param_print_logo = 'Print logo';
    texts.param_logo_name = 'Name logo customization';
    texts.param_texts = 'Texts';
  }
  return texts;
}


