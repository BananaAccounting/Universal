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
// @id = ch.banana.report.customer.reminder.style03.js
// @api = 1.0
// @pubdate = 2023-01-20
// @publisher = Banana.ch SA
// @description = Payment reminder
// @description.it = Richiamo di pagamento (banana+)
// @description.de = Zahlungserinnerung (banana+)
// @description.fr = Rappel de paiement (banana+)
// @description.nl = Betalingsherinnering (banana+)
// @description.en = Payment reminder (banana+)
// @doctype = *
// @task = report.customer.reminder



var repTableObj = "";
var pageNr = 1;
var rowNumber = 0;



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

   // //Document language
   // var lang = 'en';
   // if (Banana.document.locale) {
   //    lang = Banana.document.locale;
   // }
   // if (lang.length > 2) {
   //    lang = lang.substr(0, 2);
   // }
   // var texts = setTexts(lang);

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
   currentParam.defaultvalue = false;
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
   currentParam.name = 'color_2';
   currentParam.title = texts.param_color_2;
   currentParam.type = 'color';
   currentParam.value = param.color_2 ? param.color_2 : '#000000';
   currentParam.defaultvalue = '#000000';
   currentParam.readValue = function() {
      param.color_2 = this.value;
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
   param.text_begin_it = '';
   param.text_final_it = '';
   param.text_begin_fr = '';
   param.text_final_fr = '';
   param.text_begin_de = '';
   param.text_final_de = '';
   param.text_begin_en = '';
   param.text_final_en = '';
   param.text_begin_nl = '';
   param.text_final_nl = '';
   param.font_family = 'Helvetica';
   param.color_2 = '#000000';
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
   if (!param.text_begin_it) {
      param.text_begin_it = '';
   }
   if (!param.text_final_it) {
      param.text_final_it = '';
   }
   if (!param.text_begin_fr) {
      param.text_begin_fr = '';
   }
   if (!param.text_final_fr) {
      param.text_final_fr = '';
   }
   if (!param.text_begin_de) {
      param.text_begin_de = '';
   }
   if (!param.text_final_de) {
      param.text_final_de = '';
   }
   if (!param.text_final_en) {
      param.text_final_en = '';
   }
   if (!param.text_begin_en) {
      param.text_begin_en = '';
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
   if (!param.color_2) {
      param.color_2 = '#ffffff';
   }
   return param;
}



//====================================================================//
// PRINT REMINDER
//====================================================================//
function printDocument(jsonReminder, repDocObj, repStyleObj) {

   var param = initParam();
   var savedParam = Banana.document.getScriptSettings();
   if (savedParam.length > 0) {
      param = JSON.parse(savedParam);
      param = verifyParam(param);
   }

   // jsonReminder can be a json string or a js object
   var reminderObj = null;
   if (typeof(jsonReminder) === 'object') {
      reminderObj = jsonReminder;
   } else if (typeof(jsonReminder) === 'string') {
      reminderObj = JSON.parse(jsonReminder);
   }
   // Banana.console.log(JSON.stringify(jsonReminder, "", " "));

   var langDoc = getLangDoc(reminderObj);
   var texts = setTexts(langDoc);

   // Print reminder report
   printReminder(Banana.document, reminderObj, repDocObj, repStyleObj, param, texts);

   // Variable starts with $
   var variables = {};
   setVariables(variables, param);
   setCss(Banana.document, repStyleObj, variables, param);
}

function printReminder(banDoc, reminderObj, repDocObj, repStyleObj, param, texts) {

   // Reminder document
   var reportObj = Banana.Report;
   if (!repDocObj) {
      repDocObj = reportObj.newReport(texts.invoice + ": " + reminderObj.document_info.number);
   }
   else {
      var pageBreak = repDocObj.addPageBreak();
      pageBreak.addClass("pageReset");
   }

   printReminder_HeaderPage(reminderObj, repDocObj, repStyleObj, param);
   printReminder_Info(reminderObj, repDocObj, texts);
   printReminder_Address(reminderObj, repDocObj, texts);
   printReminder_Title(repDocObj, texts);

   repTableObj = repDocObj.addTable("doc_table");
   printReminder_BeginText(reminderObj, param);
   printReminder_Items(reminderObj, repDocObj, param, texts);
   printReminder_FinalText(reminderObj, param);

   return repDocObj;
}

function printReminder_HeaderPage(reminderObj, repDocObj, repStyleObj, param) {

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
      var supplierLines = getInvoiceSupplier(reminderObj.supplier_info).split('\n');
      for (var i = 0; i < supplierLines.length; i++) {
         headerLogoSection.addParagraph(supplierLines[i], "header_rows");
      }
   }
}

function printReminder_Info(reminderObj, repDocObj, texts) {

   // Info: date, customer No, page

   var infoTable = repDocObj.addTable("info_table");
   var tableRow = infoTable.addRow();
   var cellInfo = tableRow.addCell("", "", 1);
   cellInfo.addParagraph(texts.date + ": " + Banana.Converter.toLocaleDateFormat(reminderObj.document_info.date));
   cellInfo.addParagraph(texts.customer + ": " + reminderObj.customer_info.number);
   cellInfo.addParagraph(texts.page + ": " + pageNr);
}

function printReminder_Address(reminderObj, repDocObj, texts) {

   // Reminder address (customer address)

   var addressTable = repDocObj.addTable("address_table_right");
   var tableRow = addressTable.addRow();
   var cellAddress = tableRow.addCell("", "", 1);
   var addressLines = getInvoiceAddress(reminderObj.customer_info).split('\n');
   for (var i = 0; i < addressLines.length; i++) {
      cellAddress.addParagraph(addressLines[i], "");
   }
}

function printReminder_Title(repDocObj, texts) {

   // Title

   var titleTable = repDocObj.addTable("title_table");
   tableRow = titleTable.addRow();
   tableRow.addCell(texts.reminder, "bold title", 1);
}

function printReminder_BeginText(reminderObj, param) {

   // Begin text

   var langDoc = getLangDoc(reminderObj);

   var textBegin = param['text_begin_'+langDoc];
   if (textBegin) {
      tableRow = repTableObj.getHeader().addRow();
      var textCell = tableRow.addCell("", "text_begin", 7);
      var textBeginLines = textBegin.split('\n');
      for (var i = 0; i < textBeginLines.length; i++) {
         if (textBeginLines[i]) {
            textCell.addCell(textBeginLines[i], "", 7);
            rowNumber++;
         } else {
            textCell.addCell(" ", "", 7); //empty lines
            rowNumber++;
         }
      }
      tableRow = repTableObj.getHeader().addRow();
      tableRow.addCell(" ", "", 7);
   }
}

function printReminder_Items(reminderObj, repDocObj, param, texts) {

   // Details table

   var repTableCol1 = repTableObj.addColumn("repTableCol1");
   var repTableCol2 = repTableObj.addColumn("repTableCol2");
   var repTableCol3 = repTableObj.addColumn("repTableCol3");
   var repTableCol4 = repTableObj.addColumn("repTableCol4");
   var repTableCol5 = repTableObj.addColumn("repTableCol5");
   var repTableCol6 = repTableObj.addColumn("repTableCol6");
   var repTableCol7 = repTableObj.addColumn("repTableCol7");

   rowNumber = printReminder_checkFileLength(reminderObj, repDocObj, texts, rowNumber);
   var dd = repTableObj.getHeader().addRow();
   dd.addCell(texts.invoice_no, "items_table_header center", 1);
   dd.addCell(texts.invoice_date, "items_table_header center", 1);
   dd.addCell(texts.invoice_debit, "items_table_header center", 1);
   dd.addCell(texts.invoice_credit, "items_table_header center", 1);
   dd.addCell(texts.invoice_balance, "items_table_header center", 1);
   dd.addCell(texts.invoice_currency, "items_table_header center", 1);
   dd.addCell(texts.invoice_status, "items_table_header center", 1);

   // Items
   for (var i = 0; i < reminderObj.items.length; i++) {
      var item = reminderObj.items[i];
      var classRow = "item_row";
      if (item.item_type && item.item_type.indexOf("total") === 0) {
         classRow = "item_total";
      }
      var classTotal = "";
      if (i == reminderObj.items.length - 1) {
         classTotal = " bold total";
         rowNumber = printReminder_checkFileLength(reminderObj, repDocObj, texts, rowNumber);
         tableRow = repTableObj.addRow();
         tableRow.addCell("", "", 7);
      }
      rowNumber = printReminder_checkFileLength(reminderObj, repDocObj, texts, rowNumber);
      tableRow = repTableObj.addRow(classRow);
      tableRow.addCell(item.number, "center padding-left padding-right" + classTotal, 1);
      tableRow.addCell(Banana.Converter.toLocaleDateFormat(item.date), "padding-left padding-right" + classTotal, 1);
      tableRow.addCell(getFormattedAmount(reminderObj, item.debit), "padding-left padding-right amount" + classTotal, 1);
      tableRow.addCell(getFormattedAmount(reminderObj, item.credit), "padding-left padding-right amount" + classTotal, 1);
      tableRow.addCell(getFormattedAmount(reminderObj, item.balance), "padding-left padding-right amount" + classTotal, 1);
      tableRow.addCell(item.currency, "center padding-left padding-right" + classTotal, 1);
      
      var status = item.status;
      if (status && (status.startsWith("1.") || status.startsWith("2.") || status.startsWith("3.")) ) {
         status = status.substr(0,2) + " " + texts.statusreminder;
      }
      else if (status == 'paidInvoice') {
         status = texts.paidinvoice;
      }
      else if (status == 'openBalance') {
         status = texts.openBalance;
      }
      if (status && status.length > 13) {
         status = status.substr(0, 13) + ".";
      }
      tableRow.addCell(status, "status padding-left padding-right" + classTotal, 1);
   }
   tableRow = repTableObj.addRow();
   tableRow.addCell("", "border-bottom", 7);
}

function printReminder_FinalText(reminderObj, param) {
   
   // Final text

   var langDoc = getLangDoc(reminderObj);

   var textFinal = param['text_final_'+langDoc];
   if (textFinal) {
      tableRow = repTableObj.addRow();
      tableRow.addCell(" ", "", 7);
      rowNumber++;
      tableRow = repTableObj.addRow();
      var textCell = tableRow.addCell("", "text_final", 7);
      var textFinalLines = textFinal.split('\n');
      for (var i = 0; i < textFinalLines.length; i++) {
         if (textFinalLines[i]) {
            textCell.addCell(textFinalLines[i], "", 7);
            rowNumber++;
         } else {
            textCell.addCell(" ", "", 7); //empty lines
            rowNumber++;
         }
      }
   }
}

function printReminder_InfoOtherPages(reminderObj, repDocObj, texts) {

   // Info for pages 2+

   var infoTable = repDocObj.addTable("info_table_row0");
   var tableRow = infoTable.addRow();
   var cellInfo = tableRow.addCell("", "", 1);
   cellInfo.addParagraph(texts.date + ": " + Banana.Converter.toLocaleDateFormat(reminderObj.document_info.date), "");
   cellInfo.addParagraph(texts.customer + ": " + reminderObj.customer_info.number, "");
   cellInfo.addParagraph(texts.page + ": " + pageNr, "");
}

function printReminder_ItemsHeaderOtherPages(repDocObj, texts) {
   repTableObj = repDocObj.addTable("doc_table_row0");
   var repTableCol1 = repTableObj.addColumn("repTableCol1");
   var repTableCol2 = repTableObj.addColumn("repTableCol2");
   var repTableCol3 = repTableObj.addColumn("repTableCol3");
   var repTableCol4 = repTableObj.addColumn("repTableCol4");
   var repTableCol5 = repTableObj.addColumn("repTableCol5");
   var repTableCol6 = repTableObj.addColumn("repTableCol6");
   var repTableCol7 = repTableObj.addColumn("repTableCol7");

   var dd = repTableObj.getHeader().addRow();
   dd.addCell(texts.invoice_no, "items_table_header center", 1);
   dd.addCell(texts.invoice_date, "items_table_header center", 1);
   dd.addCell(texts.invoice_debit, "items_table_header center", 1);
   dd.addCell(texts.invoice_credit, "items_table_header center", 1);
   dd.addCell(texts.invoice_balance, "items_table_header center", 1);
   dd.addCell(texts.invoice_currency, "items_table_header center", 1);
   dd.addCell(texts.invoice_status, "items_table_header center", 1);
}

function printReminder_checkFileLength(reminderObj, repDocObj, texts, rowNumber) {

   if (rowNumber >= 33 && pageNr == 1) {
      //first page of reminder, max 33 rows (items + begin text + final text)
      repDocObj.addPageBreak();
      pageNr++;
      printReminder_InfoOtherPages(reminderObj, repDocObj, texts);
      printReminder_ItemsHeaderOtherPages(repDocObj, texts);
      return 0;
   }
   else if (rowNumber >= 39 && pageNr > 1) {
      //other pages of reminder (2+), max 38 rows (items + final text)
      repDocObj.addPageBreak();
      pageNr++;
      printReminder_InfoOtherPages(reminderObj, repDocObj, texts);
      printReminder_ItemsHeaderOtherPages(repDocObj, texts);
      return 0;
   }

   rowNumber++;
   return rowNumber;
}



//====================================================================//
// UTILITIES
//====================================================================//
function getFormattedAmount(reminderObj, value) {

   return Banana.Converter.toLocaleNumberFormat(value, reminderObj.document_info.decimals_amounts, true);
}

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

function getInvoiceAddress(invoiceAddress) {

   // <OrganisationName>
   // <NamePrefix>
   // <FirstName> <FamilyName>
   // <Street> <AddressExtra>
   // <POBox>
   // <PostalCode> <Locality>

   var address = "";

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
   address += "\n";

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
   if (invoiceAddress.city) {
      if (invoiceAddress.postal_code) {
         address += " ";
      }
      address += invoiceAddress.city;
   }
   address += "\n";

   if (invoiceAddress.country) {
      address += invoiceAddress.country;
   }

   return address;
}



//====================================================================//
// STYLES
//====================================================================//
function setCss(banDoc, repStyleObj, variables, userParam) {

  var textCSS = "";

  /**
    Default CSS file
  */
  var file = Banana.IO.getLocalFile("file:script/ch.banana.report.customer.reminder.style03.css");
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
  variables.$color_2 = param.color_2;
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
function getLangDoc(reminderObj) {
   var langDoc = 'en';
   if (reminderObj.customer_info.lang) {
      langDoc = reminderObj.customer_info.lang;
   }
   if (langDoc.length <= 0) {
      langDoc = reminderObj.document_info.locale;
   }
   return langDoc;
}

function setTexts(language) {
   
   var texts = {};

   // Text for parameteres always displayed
   texts.param_text_begin_it = 'Testo iniziale';
   texts.param_text_final_it = 'Testo finale';
   texts.param_text_begin_fr = 'Texte de début';
   texts.param_text_final_fr = 'Texte final';
   texts.param_text_begin_de = 'Anfangstext';
   texts.param_text_final_de = 'Text am Ende';
   texts.param_text_begin_en = 'Begin text';
   texts.param_text_final_en = 'Final text';
   texts.param_text_begin_nl = 'Begintekst';
   texts.param_text_final_nl = 'Eindtekst';

   if (language == 'it') {
      texts.customer = 'No Cliente';
      texts.date = 'Data';
      texts.page = 'Pagina';
      texts.invoice_no = 'No fattura';
      texts.invoice_date = 'Data';
      texts.invoice_debit = 'Importo';
      texts.invoice_credit = 'Pagamenti';
      texts.invoice_balance = 'Saldo';
      texts.invoice_currency = 'Divisa';
      texts.invoice_status = 'Situazione';
      // texts.param_color_1 = 'Colore sfondo';
      texts.param_color_2 = 'Colore testo intestazione dettagli';
      texts.param_font_family = 'Tipo carattere';
      texts.param_print_header = 'Includi intestazione pagina';
      texts.param_print_logo = 'Stampa logo';
      texts.param_logo_name = 'Nome personalizzazione logo';
      texts.openBalance = 'saldo apertura';
      texts.paidinvoice = 'pagato';
      texts.reminder = 'Richiamo di pagamento';
      texts.param_texts = 'Testi';
      texts.statusreminder = 'richiamo';
   } 
   else if (language == 'de') {
      texts.customer = 'Kunde-Nr';
      texts.date = 'Datum';
      texts.page = 'Seite';
      texts.invoice_no = 'Rg.-Nr';
      texts.invoice_date = 'Datum';
      texts.invoice_debit = 'Soll';
      texts.invoice_credit = 'Haben';
      texts.invoice_balance = 'Saldo';
      texts.invoice_currency = 'Währung';
      texts.invoice_status = 'Status';
      // texts.param_color_1 = 'Hintergrundfarbe';
      texts.param_color_2 = 'Farbtext Details-Kopfzeilen';
      texts.param_font_family = 'Typ Schriftzeichen';
      texts.param_print_header = 'Seitenüberschrift einschliessen';
      texts.param_print_logo = 'Logo ausdrucken';
      texts.param_logo_name = 'Name der Anpassung';
      texts.openBalance = 'Eröffnungssaldo';
      texts.paidinvoice = 'bezahlt';
      texts.reminder = 'Zahlungserinnerung';
      texts.param_texts = 'Texte';
      texts.statusreminder = 'Zahlungserinnerung';
   }
   else if (language == 'fr') {
      texts.customer = 'No Client';
      texts.date = 'Date';
      texts.page = 'Page';
      texts.invoice_no = 'No facture';
      texts.invoice_date = 'Date';
      texts.invoice_debit = 'Débit';
      texts.invoice_credit = 'Crédit';
      texts.invoice_balance = 'Solde';
      texts.invoice_currency = 'Devise';
      texts.invoice_status = 'Situation';
      // texts.param_color_1 = 'Couleur de fond';
      texts.param_color_2 = "Couleur de texte pour l'en-tête des détails";
      texts.param_font_family = 'Police de caractère';
      texts.param_print_header = 'Inclure en-tête de page';
      texts.param_print_logo = 'Imprimer logo';
      texts.param_logo_name = 'Nom personnalisation logo';
      texts.openBalance = 'solde ouvert';
      texts.paidinvoice = 'payé';
      texts.reminder = 'Rappel de paiement';
      texts.param_texts = 'Textes';
      texts.statusreminder = 'rappel';
   }
   else if (language == 'nl') {
      texts.customer = 'Klantennummer';
      texts.date = 'Datum';
      texts.page = 'Pagina';
      texts.invoice_no = 'Factuur nr.';
      texts.invoice_date = 'Datum';
      texts.invoice_debit = 'Debit';
      texts.invoice_credit = 'Credit';
      texts.invoice_balance = 'Saldo';
      texts.invoice_currency = 'Valuta';
      texts.invoice_status = 'Status';
      // texts.param_color_1 = 'Achtergrond kleur';
      texts.param_color_2 = 'Tekstkleur koptekst details';
      texts.param_font_family = 'Lettertype';
      texts.param_print_header = 'Pagina-koptekst opnemen';
      texts.param_print_logo = 'Druklogo';
      texts.param_logo_name = 'Naam logo aanpassing';
      texts.openBalance = 'open balance';
      texts.paidinvoice = 'paid';
      texts.reminder = 'Betalingsherinnering';
      texts.param_texts = 'Teksten';
      texts.statusreminder = 'Betalingsherinnering';
   } 
   else {
      texts.customer = 'Customer No';
      texts.date = 'Date';
      texts.page = 'Page';
      texts.invoice_no = 'Invoice Nr';
      texts.invoice_date = 'Date';
      texts.invoice_debit = 'Debit';
      texts.invoice_credit = 'Credit';
      texts.invoice_balance = 'Balance';
      texts.invoice_currency = 'Currency';
      texts.invoice_status = 'Status';
      // texts.param_color_1 = 'Background Color';
      texts.param_color_2 = 'Text color of details header';
      texts.param_font_family = 'Font type';
      texts.param_print_header = 'Include page header';
      texts.param_print_logo = 'Print logo';
      texts.param_logo_name = 'Name logo customization';
      texts.openBalance = 'open balance';
      texts.paidinvoice = 'paid';
      texts.reminder = 'Payment reminder';
      texts.param_texts = 'Texts';
      texts.statusreminder = 'reminder';
   }
   return texts;
}

