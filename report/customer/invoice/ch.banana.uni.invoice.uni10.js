// Copyright [2019] [Banana.ch SA - Lugano Switzerland]
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
// @id = ch.banana.uni.invoice.uni10
// @api = 1.0
// @pubdate = 2019-05-13
// @publisher = Banana.ch SA
// @description = Style 10: Total column, logo, 2 colors
// @description.it = Stile 10: colonna totale, logo, 2 colori
// @description.de = Stil 10: Summenspalte, Logo, 2 Farben
// @description.fr = Style 10: colonne Total, logo, 2 couleurs
// @description.nl = Stijl 10: kolom Totaal, logo, 2 kleuren
// @description.en = Style 10: Total column, logo, 2 colors
// @description.zh = 样式 10: 总列, 标志, 2 颜色
// @doctype = *
// @task = report.customer.invoice


var docTableStart = "110mm";



//====================================================================//
// INVOICE PARAMETERS
//====================================================================//
/* Update script's parameters */
function settingsDialog() {

  var param = initParam();
  var savedParam = Banana.document.getScriptSettings();

  if (savedParam.length > 0) {
    param = JSON.parse(savedParam);
  }   

  param = verifyParam(param);

  if (typeof (Banana.Ui.openPropertyEditor) !== 'undefined') {
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
  var lang = 'en';
  if (Banana.document.locale)
    lang = Banana.document.locale;
  if (lang.length > 2)
    lang = lang.substr(0, 2);
  var texts = setInvoiceTexts(lang);

  var convertedParam = {};
  convertedParam.version = '1.0';
  /*array dei parametri dello script*/
  convertedParam.data = [];


  /*
  * HEADER
  */
  var currentParam = {};
  currentParam.name = 'header';
  currentParam.title = texts.param_header;
  currentParam.type = 'string';
  currentParam.value = '';
  currentParam.editable = false;
  currentParam.readValue = function() {
    param.header = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'print_logo';
  currentParam.parentObject = 'header';
  currentParam.title = texts.param_print_logo;
  currentParam.type = 'bool';
  currentParam.value = param.print_logo ? true : false;
  currentParam.readValue = function() {
    param.print_logo = this.value;
  }
  convertedParam.data.push(currentParam);

  var currentParam = {};
  currentParam.name = 'print_header';
  currentParam.parentObject = 'header';
  currentParam.title = texts.param_print_header;
  currentParam.type = 'bool';
  currentParam.value = param.print_header ? true : false;
  currentParam.readValue = function() {
    param.print_header = this.value;
  }
  convertedParam.data.push(currentParam);
  
  currentParam = {};
  currentParam.name = 'header_left';
  currentParam.parentObject = 'header';
  currentParam.title = texts.param_header_left;
  currentParam.type = 'bool';
  currentParam.value = param.header_left ? true : false;
  currentParam.readValue = function() {
   param.header_left = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'header_right';
  currentParam.parentObject = 'header';
  currentParam.title = texts.param_header_right;
  currentParam.type = 'bool';
  currentParam.value = param.header_right ? true : false;
  currentParam.readValue = function() {
   param.header_right = this.value;
  }
  convertedParam.data.push(currentParam);



  /*
  * ADDRESS
  */

  var currentParam = {};
  currentParam.name = 'address';
  currentParam.title = texts.param_address;
  currentParam.type = 'string';
  currentParam.value = '';
  currentParam.editable = false;
  currentParam.readValue = function() {
    param.param_address = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'address_left';
  currentParam.parentObject = 'address';
  currentParam.title = texts.param_address_left;
  currentParam.type = 'bool';
  currentParam.value = param.address_left ? true : false;
  currentParam.readValue = function() {
   param.address_left = this.value;
  }
  convertedParam.data.push(currentParam);


  /*
  * INFO INVOICE
  */

  var currentParam = {};
  currentParam.name = 'info_invoice';
  currentParam.title = texts.param_info_invoice;
  currentParam.type = 'string';
  currentParam.value = '';
  currentParam.editable = false;
  currentParam.readValue = function() {
    param.info_invoice = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'info_invoice_number';
  currentParam.parentObject = 'info_invoice';
  currentParam.title = texts.param_info_invoice_number;
  currentParam.type = 'bool';
  currentParam.value = param.info_invoice_number ? true : false;
  currentParam.readValue = function() {
    param.info_invoice_number = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'info_date';
  currentParam.parentObject = 'info_invoice';
  currentParam.title = texts.param_info_date;
  currentParam.type = 'bool';
  currentParam.value = param.info_date ? true : false;
  currentParam.readValue = function() {
    param.info_date = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'info_customer';
  currentParam.parentObject = 'info_invoice';
  currentParam.title = texts.param_info_customer;
  currentParam.type = 'bool';
  currentParam.value = param.info_customer ? true : false;
  currentParam.readValue = function() {
    param.info_customer = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'info_due_date';
  currentParam.parentObject = 'info_invoice';
  currentParam.title = texts.param_info_due_date;
  currentParam.type = 'bool';
  currentParam.value = param.info_due_date ? true : false;
  currentParam.readValue = function() {
    param.info_due_date = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'info_page';
  currentParam.parentObject = 'info_invoice';
  currentParam.title = texts.param_info_page;
  currentParam.type = 'bool';
  currentParam.value = param.info_page ? true : false;
  currentParam.readValue = function() {
    param.info_page = this.value;
  }
  convertedParam.data.push(currentParam);



  /*
  * ITEMS TABLE
  */
  var currentParam = {};
  currentParam.name = 'items_table';
  currentParam.title = texts.param_items_table;
  currentParam.type = 'string';
  currentParam.value = '';
  currentParam.editable = false;
  currentParam.readValue = function() {
    param.items_table = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'items_description';
  currentParam.parentObject = 'items_table';
  currentParam.title = texts.param_items_description;
  currentParam.type = 'bool';
  currentParam.value = param.items_description ? true : false;
  currentParam.readValue = function() {
    param.items_description = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'items_description_rename';
  currentParam.parentObject = 'items_table';
  currentParam.title = texts.param_items_description_rename;
  currentParam.type = 'string';
  currentParam.value = param.items_description_rename ? param.items_description_rename : texts.description;
  currentParam.readValue = function() {
    param.items_description_rename = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'items_quantity';
  currentParam.parentObject = 'items_table';
  currentParam.title = texts.param_items_quantity;
  currentParam.type = 'bool';
  currentParam.value = param.items_quantity ? true : false;
  currentParam.readValue = function() {
    param.items_quantity = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'items_quantity_rename';
  currentParam.parentObject = 'items_table';
  currentParam.title = texts.param_items_quantity_rename;
  currentParam.type = 'string';
  currentParam.value = param.items_quantity_rename ? param.items_quantity_rename : texts.description;
  currentParam.readValue = function() {
    param.items_quantity_rename = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'items_unit_price';
  currentParam.parentObject = 'items_table';
  currentParam.title = texts.param_items_unit_price;
  currentParam.type = 'bool';
  currentParam.value = param.items_unit_price ? true : false;
  currentParam.readValue = function() {
    param.items_unit_price = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'items_unit_price_rename';
  currentParam.parentObject = 'items_table';
  currentParam.title = texts.param_items_unit_price_rename;
  currentParam.type = 'string';
  currentParam.value = param.items_unit_price_rename ? param.items_unit_price_rename : texts.description;
  currentParam.readValue = function() {
    param.items_unit_price_rename = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'items_total';
  currentParam.parentObject = 'items_table';
  currentParam.title = texts.param_items_total;
  currentParam.type = 'bool';
  currentParam.value = param.items_total ? true : false;
  currentParam.readValue = function() {
    param.items_total = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'items_total_rename';
  currentParam.parentObject = 'items_table';
  currentParam.title = texts.param_items_total_rename;
  currentParam.type = 'string';
  currentParam.value = param.items_total_rename ? param.items_total_rename : texts.description;
  currentParam.readValue = function() {
    param.items_total_rename = this.value;
  }
  convertedParam.data.push(currentParam);




  /*
  * LANGUAGE
  */
  var currentParam = {};
  currentParam.name = 'language';
  currentParam.title = texts.param_language;
  currentParam.type = 'string';
  currentParam.value = '';
  currentParam.editable = false;
  currentParam.readValue = function() {
    param.param_language = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'language_new';
  currentParam.parentObject = 'language';
  currentParam.title = texts.param_language_new;
  currentParam.type = 'string';
  currentParam.value = param.language_new ? param.language_new : '';
  currentParam.readValue = function() {
    param.language_new = this.value;
  }
  convertedParam.data.push(currentParam);






  /*
  * STYLES
  */
  var currentParam = {};
  currentParam.name = 'styles';
  currentParam.title = texts.param_styles;
  currentParam.type = 'string';
  currentParam.value = '';
  currentParam.editable = false;
  currentParam.readValue = function() {
    param.param_styles = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'font_family';
  currentParam.parentObject = 'styles';
  currentParam.title = texts.param_font_family;
  currentParam.type = 'string';
  currentParam.value = param.font_family ? param.font_family : '';
  currentParam.readValue = function() {
   param.font_family = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'color_1';
  currentParam.parentObject = 'styles';
  currentParam.title = texts.param_color_1;
  currentParam.type = 'string';
  currentParam.value = param.color_1 ? param.color_1 : '#337ab7';
  currentParam.readValue = function() {
   param.color_1 = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'color_2';
  currentParam.parentObject = 'styles';
  currentParam.title = texts.param_color_2;
  currentParam.type = 'string';
  currentParam.value = param.color_2 ? param.color_2 : '#ffffff';
  currentParam.readValue = function() {
   param.color_2 = this.value;
  }
  convertedParam.data.push(currentParam);

  


  /*
  * Embedded JavaScript file
  */
  var currentParam = {};
  currentParam.name = 'custom_javascript';
  currentParam.title = texts.param_custom_javascript;
  currentParam.type = 'string';
  currentParam.value = '';
  currentParam.editable = false;
  currentParam.readValue = function() {
    param.custom_javascript = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'custom_javascript_filename';
  currentParam.parentObject = 'custom_javascript';
  currentParam.title = texts.param_custom_javascript_filename;
  currentParam.type = 'string';
  currentParam.value = param.custom_javascript_filename ? param.custom_javascript_filename : '';
  currentParam.readValue = function() {
   param.custom_javascript_filename = this.value;
  }
  convertedParam.data.push(currentParam);


  

  return convertedParam;
}

function initParam() {
  var param = {};

  var lang = 'en';
  if (Banana.document.locale)
    lang = Banana.document.locale;
  if (lang.length > 2)
    lang = lang.substr(0, 2);
  var texts = setInvoiceTexts(lang);

  param.print_header = true;
  param.print_logo = true;
  param.address_left = false;
  param.header_left = false;
  param.header_right = true;
  param.info_invoice_number = true;
  param.info_date = true;
  param.info_customer = true;
  param.info_due_date = true;
  param.info_page = true;
  param.items_description = true;
  param.items_quantity = true;
  param.items_unit_price = true;
  param.items_total = true;
  param.items_description_rename = texts.description;
  param.items_quantity_rename = texts.qty;
  param.items_unit_price_rename = texts.unit_price;
  param.items_total_rename = texts.total;

  param.language_new = '';

  param.color_1 = '#337ab7';
  param.color_2 = '#ffffff';
  param.color_3 = '';
  param.color_4 = '';
  param.font_family = 'Helvetica';

  param.custom_javascript_filename = '';


  return param;
}

function verifyParam(param) {

  var lang = 'en';
  if (Banana.document.locale)
    lang = Banana.document.locale;
  if (lang.length > 2)
    lang = lang.substr(0, 2);
  var texts = setInvoiceTexts(lang);


  if (!param.print_header) {
    param.print_header = false;
  }
  if (!param.header_left && !param.header_right) {
    param.header_left = false;
    param.header_right = true;
  }
  if (param.header_left && param.header_right) {
    param.header_left = false;
    param.header_right = true;
  }
  if (!param.print_logo) {
    param.print_logo = false;
  }
  if (!param.address_left) {
    param.address_left = false;
  }
  if (!param.info_invoice_number) {
    param.info_invoice_number = false;
  }
  if (!param.info_date) {
    param.info_date = false;
  }
  if (!param.info_customer) {
    param.info_customer = false;
  }
  if (!param.info_due_date) {
    param.info_due_date = false;
  }
  if (!param.info_page) {
    param.info_page = false;
  }
  if (!param.items_description) {
    param.items_description = false;
  }
  if (!param.items_quantity) {
    param.items_quantity = false;
  }
  if (!param.items_unit_price) {
    param.items_unit_price = false;
  }
  if (!param.items_total) {
    param.items_total = false;
  }
  if (!param.items_description && !param.items_quantity && !param.items_unit_price && !param.items_total) {
    param.items_description = true;
    param.items_quantity = true;
    param.items_unit_price = true;
    param.items_total = true;    
  }
  if (!param.items_description_rename) {
      param.items_description_rename = texts.description;
  }
  if (!param.items_quantity_rename) {
    param.items_quantity_rename = texts.qty;
  }
  if (!param.items_unit_price_rename) {
    param.items_unit_price_rename = texts.unit_price;
  }
  if (!param.items_total_rename) {
    param.items_total_rename = texts.total;
  }
  if (!param.language_new) {
    param.language_new = '';
  }





  if (!param.color_1) {
    param.color_1 = '#337ab7';
  }
  if (!param.color_2) {
    param.color_2 = '#ffffff';
  }
  if (!param.color_3) {
    param.color_3 = '';
  }
  if (!param.color_4) {
    param.color_4 = '';
  }
  if (!param.font_family) {
    param.font_family = 'Helvetica';
  }


  if (!param.custom_javascript_filename) {
    param.custom_javascript_filename = '';
  }



  return param;
}


//====================================================================//
// MAIN FUNCTIONS THAT PRINT THE INVOICE
//====================================================================//
function printDocument(jsonInvoice, repDocObj, repStyleObj) {
  var param = initParam();
  var savedParam = Banana.document.getScriptSettings();
  if (savedParam.length > 0) {
    param = JSON.parse(savedParam);
    param = verifyParam(param);
  }
  repDocObj = printInvoice(jsonInvoice, repDocObj, param, repStyleObj);
  setInvoiceStyle(repDocObj, repStyleObj, param);
}

function printInvoice(jsonInvoice, repDocObj, param, repStyleObj) {
  
  // jsonInvoice can be a json string or a js object
  var invoiceObj = null;
  if (typeof(jsonInvoice) === 'object') {
    invoiceObj = jsonInvoice;
  } else if (typeof(jsonInvoice) === 'string') {
    invoiceObj = JSON.parse(jsonInvoice)
  }

  // Invoice texts which need translation
  var langDoc = '';
  if (invoiceObj.customer_info.lang) {
    langDoc = invoiceObj.customer_info.lang;
  }
  if (langDoc.length <= 0) {
    langDoc = invoiceObj.document_info.locale;
  }
  var texts = setInvoiceTexts(langDoc);

  // Invoice document
  var reportObj = Banana.Report;
  if (!repDocObj) {
    repDocObj = reportObj.newReport(getTitle(invoiceObj, texts) + " " + invoiceObj.document_info.number);
  } else {
    var pageBreak = repDocObj.addPageBreak();
    pageBreak.addClass("pageReset");
  }

 

 //"_customer.invoice.js"
 // Se c'e' quel file js includo anche quello (oltre a quell'altro)
 // dopo l'include chiudo l'if e le chiamate alle funzioni le lascio fuori

 /*
    DA CHIEDERE A DOMENICO:
    Non ho capito in che modo deve essere INCLUSO anche il file _customer_invoice.js".
    a) se esiste un parametro (es. file1.js), includo cmq il _customer_invoice.js?
       => dopo come faccio a capire da quale js leggere le funzioni?
    b) se esiste un parametro, allora non includo il _customer_invoice.js?
       => le funzioni le leggo solo dal parametro.
    c) se NON esiste il parametro, allora includo il _customer_invoice.js?
       => le funzioni le leggo solo dal _customer_invoice.js.
  */


  // User entered a javascript file name
  if (param.custom_javascript_filename) {
    Banana.console.log(" ");
    Banana.console.log("'" + param.custom_javascript_filename + "' inserito nei parametri.");

    // Take from the table documents all the javascript file names
    var jsFiles = [];
    jsFiles = getJsFilesFromDocumentsTable();

    // Table documents contains javascript files
    if (jsFiles.length > 0) {
      Banana.console.log("Tabella documenti contiene uno o più file javascript => " + jsFiles);
      
      // The javascript file name entered by user exists on documents table. Include this file
      if (jsFiles.indexOf(param.custom_javascript_filename) > -1) {
        Banana.console.log("'" + param.custom_javascript_filename + "' esiste nella tabella documenti.");
        try {
          Banana.include("documents:" + param.custom_javascript_filename);
          Banana.console.log("'" + param.custom_javascript_filename + "' incluso nello script.");
        }
        catch(error) {
          Banana.console.log("Table Documents: JavaScript file '" + param.custom_javascript_filename + "' not found or not valid. Default functions are used.");
          print_header(repDocObj, param, repStyleObj, invoiceObj);
          print_info_invoice(repDocObj, invoiceObj, texts, param);
          print_customer_address(repDocObj, invoiceObj, param);
          print_text_begin(repDocObj, invoiceObj);
          print_info_invoice_multiple_pages(repDocObj.getHeader(), invoiceObj, texts);
          print_invoice_details(repDocObj, invoiceObj, texts);
          print_notes(repDocObj, invoiceObj);
          print_greetings(repDocObj, invoiceObj);
        }
      }

      // // Include the _customer.invoice.js in case it exists
      // else if (jsFiles.indexOf("_customer.invoice.js") > -1) {
      //   try {
      //     Banana.include("documents:_customer.invoice.js");
      //     Banana.console.log("'_customer.invoice.js' incluso nello script.");
      //   }
      //   catch(error) {
      //     Banana.console.log("Table Documents: JavaScript file '_customer.invoice.js' not found or not valid. Default functions are used.");
      //   }        
      // }


    }
  }

  /* Header */
  if (typeof(hook_print_header) === typeof(Function)) {
    hook_print_header(repDocObj);
  } else {
    print_header(repDocObj, param, repStyleObj, invoiceObj);
  }

  /* Invoice texts info */
  if (typeof(hook_print_info_invoice) === typeof(Function)) {
    hook_print_info_invoice(repDocObj, invoiceObj, texts, param);
  } else {
    print_info_invoice(repDocObj, invoiceObj, texts, param);
  }

  /* Customer address */
  if (typeof(hook_print_customer_address) === typeof(Function)) {
    hook_print_customer_address(repDocObj, invoiceObj, param);
  } else {
    print_customer_address(repDocObj, invoiceObj, param);
  }

  /* Begin text (before invoice details table) */
  if (typeof(hook_print_text_begin) === typeof(Function)) {
    hook_print_text_begin(repDocObj, invoiceObj);
  } else {
    print_text_begin(repDocObj, invoiceObj);
  }

  /* Invoice texts info for pages 2+ */
  if (typeof(hook_print_info_invoice_multiple_pages) === typeof(Function)) {
    hook_print_info_invoice_multiple_pages(repDocObj.getHeader(), invoiceObj, texts);
  } else {
    print_info_invoice_multiple_pages(repDocObj.getHeader(), invoiceObj, texts);
  }

  /* Invoice details with all the items and amounts */
  if (typeof(hook_print_invoice_details) === typeof(Function)) {
    hook_print_invoice_details(repDocObj, invoiceObj, texts);
  } else {
    print_invoice_details(repDocObj, invoiceObj, texts);
  }

  /* Notes */
  if (typeof(hook_print_notes) === typeof(Function)) {
    hook_print_notes(repDocObj, invoiceObj);
  } else {
    print_notes(repDocObj, invoiceObj);
  }

  /* Greetings */
  if (typeof(hook_print_greetings) === typeof(Function)) {
    hook_print_greetings(repDocObj, invoiceObj);
  } else {
    print_greetings(repDocObj, invoiceObj);
  }  
  

  return repDocObj;
}






//====================================================================//
// FUNCTIONS THAT PRINT ALL THE DIFFERENT PARTS OF THE INVOICE.
// USER CAN REPLACE THEM WITH 'HOOK' FUNCTIONS DEFINED ON EMBEDDED 
// JAVASCRIPT FILES OF THE DOCUMENTS TABLE
//====================================================================//
function print_header(repDocObj, param, repStyleObj, invoiceObj) {
  var tab = repDocObj.getHeader().addTable("header_table");
  var col1 = tab.addColumn("col1");
  var col2 = tab.addColumn("col2");
  var headerLogoSection = repDocObj.addSection("");

  if (param.print_logo) {
    var logoFormat = Banana.Report.logoFormat("Logo");
    if (logoFormat) {
      var logoElement = logoFormat.createDocNode(headerLogoSection, repStyleObj, "logo");
      repDocObj.getHeader().addChild(logoElement);
    }
  }

  if (param.print_header) {
    tableRow = tab.addRow();
    var cell1 = tableRow.addCell("", "");
    var cell2 = tableRow.addCell("", "amount");
    var supplierNameLines = getInvoiceSupplierName(invoiceObj.supplier_info).split('\n');
    for (var i=0; i < supplierNameLines.length; i++) {
      cell2.addParagraph(supplierNameLines[i], "bold", 1);
    }
    var supplierLines = getInvoiceSupplier(invoiceObj.supplier_info).split('\n');
    for (var i=0; i < supplierLines.length; i++) {
      cell2.addParagraph(supplierLines[i], "", 1);
    }
  }
  else {
    tableRow = tab.addRow();
    var cell1 = tableRow.addCell("", "");
    var cell2 = tableRow.addCell("", "");
    cell2.addParagraph(" ");
    cell2.addParagraph(" ");
    cell2.addParagraph(" ");
    cell2.addParagraph(" ");
  }
}

function print_info_invoice(repDocObj, invoiceObj, texts, param) {

  var infoTable = "";
  if (param.address_left) {
    infoTable = repDocObj.addTable("info_table_right");
  } else {
    infoTable = repDocObj.addTable("info_table_left");
  }

  tableRow = infoTable.addRow();
  tableRow.addCell(" ", "", 1);
  tableRow.addCell(" ", "", 1);

  tableRow = infoTable.addRow();
  var cell1 = tableRow.addCell("","",1);
  var cell2 = tableRow.addCell("", "bold", 1);

  var invoiceDate = Banana.Converter.toLocaleDateFormat(invoiceObj.document_info.date);
  cell1.addParagraph(getTitle(invoiceObj, texts) + ":", "");
  cell1.addParagraph(texts.date + ":", "");
  cell1.addParagraph(texts.customer + ":", "");
  
  //Payment Terms
  var payment_terms_label = texts.payment_terms_label;
  var payment_terms = '';
  if (invoiceObj.billing_info.payment_term) {
    payment_terms = invoiceObj.billing_info.payment_term;
  }
  else if (invoiceObj.payment_info.due_date) {
    payment_terms_label = texts.payment_due_date_label
    payment_terms = Banana.Converter.toLocaleDateFormat(invoiceObj.payment_info.due_date);
  }
  cell1.addParagraph(payment_terms_label + ":", "");
  cell1.addParagraph(texts.page + ":", "");

  cell2.addParagraph(invoiceObj.document_info.number, "");
  cell2.addParagraph(invoiceDate, "");
  cell2.addParagraph(invoiceObj.customer_info.number, "");
  cell2.addParagraph(payment_terms, "");
  cell2.addParagraph("", "").addFieldPageNr();
}

function print_info_invoice_multiple_pages(repDocObj, invoiceObj, texts) {

  var infoTable = repDocObj.addTable("info_table_row0");
  tableRow = infoTable.addRow();
  tableRow.addCell(" ", "", 1);
  tableRow.addCell(" ", "", 1);

  tableRow = infoTable.addRow();
  var cell1 = tableRow.addCell("", "", 1);
  var cell2 = tableRow.addCell("", "bold", 1);
  
  var invoiceDate = Banana.Converter.toLocaleDateFormat(invoiceObj.document_info.date);
  cell1.addParagraph(getTitle(invoiceObj, texts) + ":", "");
  cell1.addParagraph(texts.date + ":", "");
  cell1.addParagraph(texts.customer + ":", "");
  
  //Payment Terms
  var payment_terms_label = texts.payment_terms_label;
  var payment_terms = '';
  if (invoiceObj.billing_info.payment_term) {
    payment_terms = invoiceObj.billing_info.payment_term;
  }
  else if (invoiceObj.payment_info.due_date) {
    payment_terms_label = texts.payment_due_date_label
    payment_terms = Banana.Converter.toLocaleDateFormat(invoiceObj.payment_info.due_date);
  }
  cell1.addParagraph(payment_terms_label + ":", "");
  cell1.addParagraph(texts.page + ":", "");

  cell2.addParagraph(invoiceObj.document_info.number, "");
  cell2.addParagraph(invoiceDate, "");
  cell2.addParagraph(invoiceObj.customer_info.number, "");
  cell2.addParagraph(payment_terms, "");
  cell2.addParagraph("", "").addFieldPageNr();
}

function print_customer_address(repDocObj, invoiceObj, param) {

  var customerAddressTable = "";
  if (param.address_left) {
    customerAddressTable = repDocObj.addTable("address_table_left");
  } else {
    customerAddressTable = repDocObj.addTable("address_table_right");
  }

  //Small line of the supplier address
  tableRow = customerAddressTable.addRow();
  var cell1 = tableRow.addCell("", "", 1);
  var supplierNameLines = getInvoiceSupplierName(invoiceObj.supplier_info).split('\n');
  cell1.addText(supplierNameLines[0], "small_address");
  var supplierLines = getInvoiceSupplier(invoiceObj.supplier_info).split('\n');
  cell1.addText(" - " + supplierLines[0] + " - " + supplierLines[1], "small_address");

  // Customer address
  tableRow = customerAddressTable.addRow();
  var cell2 = tableRow.addCell("", "", 1);
  var addressLines = getInvoiceAddress(invoiceObj.customer_info).split('\n');
  for (var i=0; i < addressLines.length; i++) {
    cell2.addParagraph(addressLines[i]);
  }
}

function print_text_begin(repDocObj, invoiceObj) {
  if (invoiceObj.document_info.text_begin) {
    docTableStart = "125mm";
    repDocObj.addParagraph(invoiceObj.document_info.text_begin, "begin_text");
  }
}

function print_invoice_details(repDocObj, invoiceObj, texts) {

  var repTableObj = repDocObj.addTable("doc_table");
  var repTableCol1 = repTableObj.addColumn("repTableCol1");
  var repTableCol2 = repTableObj.addColumn("repTableCol2");
  var repTableCol3 = repTableObj.addColumn("repTableCol3");
  var repTableCol4 = repTableObj.addColumn("repTableCol4");

  var dd = repTableObj.getHeader().addRow();
  dd.addCell(texts.description, "doc_table_header", 1);
  dd.addCell("", "doc_table_header", 1); //dd.addCell(texts.qty, "doc_table_header amount", 1);
  dd.addCell("", "doc_table_header", 1); //dd.addCell(texts.unit_price, "doc_table_header amount", 1);
  dd.addCell(texts.total + " " + invoiceObj.document_info.currency, "doc_table_header amount", 1);

  //ITEMS
  for (var i = 0; i < invoiceObj.items.length; i++)
  {
    var item = invoiceObj.items[i];

    var className = "item_cell";
    if (item.item_type && item.item_type.indexOf("total") === 0) {
      className = "subtotal_cell";
    }
    if (item.item_type && item.item_type.indexOf("note") === 0) {
      className = "note_cell";
    }
  
    tableRow = repTableObj.addRow();
    var descriptionCell = tableRow.addCell("", "padding-left padding-right thin-border-top " + className, 1);
    descriptionCell.addParagraph(item.description);
    descriptionCell.addParagraph(item.description2);
  
    if (className == "note_cell") {
      tableRow.addCell("", "padding-left padding-right thin-border-top " + className, 3);
    }
    else if (className == "subtotal_cell") {
        tableRow.addCell("", "amount padding-left padding-right thin-border-top " + className, 2);
        tableRow.addCell(toInvoiceAmountFormat(invoiceObj, item.total_amount_vat_exclusive), "amount padding-left padding-right thin-border-top " + className, 1);
    }
    else {
        //tableRow.addCell(Banana.Converter.toLocaleNumberFormat(item.quantity), "amount padding-left padding-right thin-border-top " + className, 1);
        //tableRow.addCell(Banana.Converter.toLocaleNumberFormat(item.unit_price.calculated_amount_vat_exclusive), "amount padding-left padding-right thin-border-top " + className, 1);
        tableRow.addCell("", "padding-left padding-right thin-border-top " + className, 1);
        tableRow.addCell("", "padding-left padding-right thin-border-top " + className, 1);
        tableRow.addCell(toInvoiceAmountFormat(invoiceObj, item.total_amount_vat_exclusive), "amount padding-left padding-right thin-border-top " + className, 1);
    }
  }

  tableRow = repTableObj.addRow();
  tableRow.addCell("", "border-bottom", 4);

  tableRow = repTableObj.addRow();
  tableRow.addCell("", "", 4);


  //TOTAL NET
  if (invoiceObj.billing_info.total_vat_rates.length > 0)
  {
    tableRow = repTableObj.addRow();   
    tableRow.addCell(" ", "padding-left padding-right", 1)
    tableRow.addCell(texts.totalnet, "padding-left padding-right", 1);
    tableRow.addCell(" ", "padding-left padding-right", 1)
    tableRow.addCell(toInvoiceAmountFormat(invoiceObj, invoiceObj.billing_info.total_amount_vat_exclusive), "amount padding-left padding-right", 1);

    for (var i = 0; i < invoiceObj.billing_info.total_vat_rates.length; i++) 
    {
      tableRow = repTableObj.addRow();
      tableRow.addCell("", "padding-left padding-right", 1);
      tableRow.addCell(texts.vat + " " + invoiceObj.billing_info.total_vat_rates[i].vat_rate + "%", "padding-left padding-right", 1);
      //tableRow.addCell(toInvoiceAmountFormat(invoiceObj, invoiceObj.billing_info.total_vat_rates[i].total_amount_vat_exclusive), "amount padding-left padding-right", 1);
      tableRow.addCell("", "amount padding-left padding-right", 1);
      tableRow.addCell(toInvoiceAmountFormat(invoiceObj, invoiceObj.billing_info.total_vat_rates[i].total_vat_amount), "amount padding-left padding-right", 1);
    }
  }


  //TOTAL ROUNDING DIFFERENCE
  if (invoiceObj.billing_info.total_rounding_difference.length) 
  {
    tableRow = repTableObj.addRow();
    tableRow.addCell(" ", "padding-left padding-right", 1);
    tableRow.addCell(texts.rounding, "padding-left padding-right", 1);
    tableRow.addCell(" ", "padding-left padding-right", 1)
    tableRow.addCell(toInvoiceAmountFormat(invoiceObj, invoiceObj.billing_info.total_rounding_difference), "amount padding-left padding-right", 1);
  }

  tableRow = repTableObj.addRow();
  tableRow.addCell("", "", 4);


  //FINAL TOTAL
  tableRow = repTableObj.addRow();
  tableRow.addCell("", "", 1)
  tableRow.addCell(texts.total.toUpperCase() + " " + invoiceObj.document_info.currency, "total_cell", 2);
  //tableRow.addCell(" ", "total_cell", 1);
  tableRow.addCell(toInvoiceAmountFormat(invoiceObj, invoiceObj.billing_info.total_to_pay), "total_cell amount", 1);

  tableRow = repTableObj.addRow();
  tableRow.addCell("", "", 4);


  //Template params
  //Default text starts with "(" and ends with ")" (default), (Vorderfiniert)
  if (invoiceObj.template_parameters && invoiceObj.template_parameters.footer_texts) {
    var lang = '';
    if (invoiceObj.customer_info.lang) {
      lang = invoiceObj.customer_info.lang;
    }
    if (lang.length <= 0 && invoiceObj.document_info.locale) {
      lang = invoiceObj.document_info.locale;
    }
    var textDefault = [];
    var text = [];
    for (var i = 0; i < invoiceObj.template_parameters.footer_texts.length; i++) {
      var textLang = invoiceObj.template_parameters.footer_texts[i].lang;
      if (textLang.indexOf('(') === 0 && textLang.indexOf(')') === textLang.length-1) {
        textDefault = invoiceObj.template_parameters.footer_texts[i].text;
      }
      else if (textLang == lang) {
        text = invoiceObj.template_parameters.footer_texts[i].text;
      }
    }
    if (text.join().length <= 0) {
      text = textDefault;
    }
    for (var i=0; i < text.length; i++) {
      tableRow = repTableObj.addRow();
      tableRow.addCell(text[i], "", 4);
    }
  }
}

function print_notes(repDocObj, invoiceObj) {
  var repTableObj = repDocObj.addTable("notes_table");
  for (var i = 0; i < invoiceObj.note.length; i++) {
    if (invoiceObj.note[i].description) {
      tableRow = repTableObj.addRow();
      tableRow.addCell(invoiceObj.note[i].description, "", 4);
    }
  }
}

function print_greetings(repDocObj, invoiceObj) {
  var repTableObj = repDocObj.addTable("greetings_table");
  if (invoiceObj.document_info.greetings) {
      tableRow = repTableObj.addRow();
      tableRow.addCell(invoiceObj.document_info.greetings, "", 4);
  }
}





//====================================================================//
// OTHER UTILITIES FUNCTIONS
//====================================================================//

/* Check if there are javascript with hook functions on the table Documents */
function getJsFilesFromDocumentsTable() {

  var jsFiles = [];

  // If Documents table exists, take all the ".js" file names
  var documentsTable = Banana.document.table("Documents");
  if (documentsTable) {
    for (var i = 0; i < documentsTable.rowCount; i++) {
      var tRow = documentsTable.row(i);
      var id = tRow.value("RowId");
      if (id.indexOf(".js") > -1) {
        jsFiles.push(id);
      }
    }
  }
  return jsFiles;
}

function toInvoiceAmountFormat(invoice, value) {

    return Banana.Converter.toLocaleNumberFormat(value, invoice.document_info.decimals_amounts, true);
}

function getInvoiceAddress(invoiceAddress) {

  var address = "";
  
  if (invoiceAddress.courtesy) {
      address = invoiceAddress.courtesy + "\n";
  }
  
  if (invoiceAddress.first_name || invoiceAddress.last_name) {
    if (invoiceAddress.first_name) {
      address = address + invoiceAddress.first_name + " ";
    }
    if (invoiceAddress.last_name) {
      address = address + invoiceAddress.last_name;
    }
    address = address + "\n";
  }

  if (invoiceAddress.business_name) {
    address = address + invoiceAddress.business_name + "\n";
  }
  
  if (invoiceAddress.address1) {
    address = address + invoiceAddress.address1 + "\n";
  }
  
  if (invoiceAddress.address2) {
    address = address + invoiceAddress.address2 + "\n";
  }
  
  if (invoiceAddress.address3) {
    address = address + invoiceAddress.address3 + "\n";
  }
  
  if (invoiceAddress.postal_code) {
    address = address + invoiceAddress.postal_code + " ";
  }
  
  if (invoiceAddress.city) {
    address = address + invoiceAddress.city + "\n";
  }
  
  if (invoiceAddress.country) {
    address = address + invoiceAddress.country;
  }

  return address;
}

function getInvoiceSupplierName(invoiceSupplier) {
  
  var supplierName = "";

  if (invoiceSupplier.business_name) {
    supplierName = invoiceSupplier.business_name + "\n";
  }
  
  if (supplierName.length<=0)
  {
    if (invoiceSupplier.first_name) {
      supplierName = invoiceSupplier.first_name + " ";
    }
  
    if (invoiceSupplier.last_name) {
      supplierName = supplierName + invoiceSupplier.last_name + "\n";
    }
  }
  return supplierName;
}

function getInvoiceSupplier(invoiceSupplier) {
  
  var supplierAddress = "";

  if (invoiceSupplier.address1) {
    supplierAddress = supplierAddress + invoiceSupplier.address1 + "\n";
  }
  
  if (invoiceSupplier.address2) {
    supplierAddress = supplierAddress + invoiceSupplier.address2 + "\n";
  }

  if (invoiceSupplier.postal_code) {
    supplierAddress = supplierAddress + invoiceSupplier.postal_code + " ";
  }
  
  if (invoiceSupplier.city) {
    supplierAddress = supplierAddress + invoiceSupplier.city + "\n";
  }
  
  if (invoiceSupplier.phone) {
    supplierAddress = supplierAddress + "Tel: " + invoiceSupplier.phone + "\n";
  }
  
  if (invoiceSupplier.fax) {
    supplierAddress = supplierAddress + "Fax: " + invoiceSupplier.fax + "\n";
  }
  
  if (invoiceSupplier.email) {
    supplierAddress = supplierAddress + invoiceSupplier.email + "\n";
  }
  
  if (invoiceSupplier.web) {
    supplierAddress = supplierAddress + invoiceSupplier.web + "\n";
  }
 
  if (invoiceSupplier.vat_number) {
    supplierAddress = supplierAddress + invoiceSupplier.vat_number;
  }

  return supplierAddress;
}

//The purpose of this function is return a complete address
function getAddressLines(jsonAddress, fullAddress) {

   var address = [];
   address.push(jsonAddress["business_name"]);

   var addressName = [jsonAddress["first_name"], jsonAddress["last_name"]];
   addressName = addressName.filter(function(n){return n}); // remove empty items
   address.push(addressName.join(" "));

   address.push(jsonAddress["address1"]);
   if (fullAddress) {
      address.push(jsonAddress["address2"]);
      address.push(jsonAddress["address3"]);
   }

   var addressCity = [jsonAddress["postal_code"], jsonAddress["city"]].join(" ");
   if (jsonAddress["country_code"] && jsonAddress["country_code"] !== "CH")
      addressCity = [jsonAddress["country_code"], addressCity].join(" - ");
   address.push(addressCity);

   address = address.filter(function(n){return n}); // remove empty items

   return address;
}

function getTitle(invoiceObj, texts) {
  var documentTitle = texts.invoice;
  if (invoiceObj.document_info.title) {  
    documentTitle = invoiceObj.document_info.title;
  }
  return documentTitle;
}










//====================================================================//
// STYLES
//====================================================================//
function setInvoiceStyle(reportObj, repStyleObj, param) {

    if (!repStyleObj) {
        repStyleObj = reportObj.newStyleSheet();
    }

    //====================================================================//
    // GENERAL
    //====================================================================//
    repStyleObj.addStyle(".pageReset", "counter-reset: page");
    repStyleObj.addStyle("body", "font-size: 11pt; font-family:" + param.font_family);
    repStyleObj.addStyle(".amount", "text-align:right");
    repStyleObj.addStyle(".bold", "font-weight: bold");
    repStyleObj.addStyle(".doc_table_header", "font-weight:bold; background-color:" + param.color_1 + "; color:" + param.color_2);
    repStyleObj.addStyle(".doc_table_header td", "padding:5px;");
    repStyleObj.addStyle(".total_cell", "font-weight:bold; background-color:" + param.color_1 + "; color: " + param.color_2 + "; padding:5px");
    repStyleObj.addStyle(".subtotal_cell", "font-weight:bold; background-color:" + param.color_1 + "; color: " + param.color_2 + "; padding:5px");
    repStyleObj.addStyle(".col1","width:50%");
    repStyleObj.addStyle(".col2","width:49%");
    
    repStyleObj.addStyle(".border-bottom", "border-bottom:2px solid " + param.color_1);
    repStyleObj.addStyle(".thin-border-top", "border-top:thin solid " + param.color_1);
    repStyleObj.addStyle(".padding-right", "padding-right:5px");
    repStyleObj.addStyle(".padding-left", "padding-left:5px");

    repStyleObj.addStyle(".repTableCol1","width:45%");
    repStyleObj.addStyle(".repTableCol2","width:15%");
    repStyleObj.addStyle(".repTableCol3","width:20%");
    repStyleObj.addStyle(".repTableCol4","width:20%");

    /* 
      Text begin
    */
    var beginStyle = repStyleObj.addStyle(".begin_text");
    beginStyle.setAttribute("position", "absolute");
    beginStyle.setAttribute("top", "90mm");
    beginStyle.setAttribute("left", "20mm");
    beginStyle.setAttribute("right", "10mm");
    beginStyle.setAttribute("font-size", "10px");

    //====================================================================//
    // LOGO
    //====================================================================//
    var logoStyle = repStyleObj.addStyle(".logoStyle");
    logoStyle.setAttribute("position", "absolute");
    logoStyle.setAttribute("margin-top", "10mm");
    logoStyle.setAttribute("margin-left", "20mm");
    logoStyle.setAttribute("height", param.image_height + "mm"); 

    var logoStyle = repStyleObj.addStyle(".logo");
    logoStyle.setAttribute("position", "absolute");
    logoStyle.setAttribute("margin-top", "10mm");
    logoStyle.setAttribute("margin-left", "20mm");

    //====================================================================//
    // TABLES
    //====================================================================//
    var headerStyle = repStyleObj.addStyle(".header_table");
    headerStyle.setAttribute("position", "absolute");
    headerStyle.setAttribute("margin-top", "10mm");
    headerStyle.setAttribute("margin-left", "22mm");
    headerStyle.setAttribute("margin-right", "10mm");
    headerStyle.setAttribute("width", "100%");
    //repStyleObj.addStyle("table.header_table td", "border: thin solid black");
    

    var infoStyle = repStyleObj.addStyle(".info_table_left");
    infoStyle.setAttribute("position", "absolute");
    infoStyle.setAttribute("margin-top", "45mm");
    infoStyle.setAttribute("margin-left", "20mm");
    infoStyle.setAttribute("margin-right", "10mm");
    //repStyleObj.addStyle("table.info_table_left td", "border: thin solid black");

    var infoStyle = repStyleObj.addStyle(".info_table_right");
    infoStyle.setAttribute("position", "absolute");
    infoStyle.setAttribute("margin-top", "45mm");
    infoStyle.setAttribute("margin-left", "113mm");
    infoStyle.setAttribute("margin-right", "10mm");
    //repStyleObj.addStyle("table.info_table_right td", "border: thin solid black");







    var infoStyle = repStyleObj.addStyle(".info_table_row0");
    infoStyle.setAttribute("position", "absolute");
    infoStyle.setAttribute("margin-top", "45mm");
    infoStyle.setAttribute("margin-left", "20mm");
    infoStyle.setAttribute("margin-right", "10mm");
    //repStyleObj.addStyle("table.info_table_row0 td", "border: thin solid black");

    var infoStyle = repStyleObj.addStyle("@page:first-view table.info_table_row0");
    infoStyle.setAttribute("display", "none");


    var infoStyle = repStyleObj.addStyle(".address_table_right");
    infoStyle.setAttribute("position", "absolute");
    infoStyle.setAttribute("margin-top", "45mm");
    infoStyle.setAttribute("margin-left", "113mm");
    infoStyle.setAttribute("margin-right", "10mm");
    //repStyleObj.addStyle("table.address_table_right td", "border: thin solid black");
    
    var infoStyle = repStyleObj.addStyle(".address_table_left");
    infoStyle.setAttribute("position", "absolute");
    infoStyle.setAttribute("margin-top", "45mm");
    infoStyle.setAttribute("margin-left", "20mm");
    infoStyle.setAttribute("margin-right", "10mm");
    //repStyleObj.addStyle("table.address_table_left td", "border: thin solid black");

    var infoStyle = repStyleObj.addStyle(".small_address");
    infoStyle.setAttribute("text-align", "center");
    infoStyle.setAttribute("font-size", "7");
    infoStyle.setAttribute("border-bottom", "solid 1px black");


    //var itemsStyle = repStyleObj.addStyle(".doc_table:first-view");
    //itemsStyle.setAttribute("margin-top", docTableStart);

    var itemsStyle = repStyleObj.addStyle(".doc_table");
    itemsStyle.setAttribute("margin-top", docTableStart); //106
    itemsStyle.setAttribute("margin-left", "23mm"); //20
    itemsStyle.setAttribute("margin-right", "10mm");
    itemsStyle.setAttribute("width", "100%");
    //repStyleObj.addStyle("table.doc_table td", "border: thin solid black; padding: 3px;");
    



    var itemsStyle = repStyleObj.addStyle(".notes_table");
    itemsStyle.setAttribute("margin-left", "23mm");
    itemsStyle.setAttribute("margin-right", "10mm");
    itemsStyle.setAttribute("width", "100%");
    //repStyleObj.addStyle("table.notes_table td", "border: thin solid black; padding: 3px;");
    



    var itemsStyle = repStyleObj.addStyle(".greetings_table");
    itemsStyle.setAttribute("margin-left", "23mm");
    itemsStyle.setAttribute("margin-right", "10mm");
    itemsStyle.setAttribute("width", "100%");
    //repStyleObj.addStyle("table.greetings_table td", "border: thin solid black; padding: 3px;");
    

}


//====================================================================//
// TEXTS
//====================================================================//
function setInvoiceTexts(language) {
  var texts = {};
  if (language == 'it')
  {
    texts.customer = 'No Cliente';
    texts.date = 'Data';
    texts.description = 'Descrizione';
    texts.invoice = 'Fattura';
    texts.page = 'Pagina';
    texts.rounding = 'Arrotondamento';
    texts.total = 'Totale';
    texts.totalnet = 'Totale netto';
    texts.vat = 'IVA';
    texts.qty = 'Quantità';
    texts.unit_ref = 'Unità';
    texts.unit_price = 'Prezzo unità';
    texts.vat_number = 'Partita IVA: ';
    texts.bill_to = 'Indirizzo fatturazione';
    texts.shipping_to = 'Indirizzo spedizione';
    texts.from = 'DA:';
    texts.to = 'A:';
    texts.param_color_1 = 'Colore sfondo';
    texts.param_color_2 = 'Colore testo';
    texts.param_font_family = 'Tipo carattere';
    texts.param_image_height = 'Altezza immagine (mm)';
    texts.param_print_header = 'Includi intestazione pagina';
    texts.param_print_logo = 'Stampa logo';
    texts.payment_due_date_label = 'Scadenza';
    texts.payment_terms_label = 'Pagamento';
    //texts.param_max_items_per_page = 'Numero di linee su ogni fattura';
    texts.param_header = 'Intestazione';
    texts.param_header_left = 'Posizione testo a sinistra';
    texts.param_header_right = 'Posizione testo a destra';
    texts.param_logo = 'Logo';
    texts.param_address = 'Indirizzo';
    texts.param_address_left = 'Stampa indirizzo a sinistra';
    texts.param_address_right = 'Stampa indirizzo a destra';
    texts.param_info_invoice = 'Informazioni fattura';
    texts.param_info_invoice_number = 'Includi numero fattura';
    texts.param_info_date = 'Includi data fattura';
    texts.param_info_customer = 'Includi numero cliente';
    texts.param_info_due_date = 'Includi data scadenza fattura';
    texts.param_info_page = 'Includi numero di pagina';
    texts.param_items_table = 'Tabella articoli';
    texts.param_items_description = "Includi colonna 'Descrizione'";
    texts.param_items_quantity = "Includi colonna 'Quantità'";
    texts.param_items_unit_price = "Includi colonna 'Prezzo unità'";
    texts.param_items_total = "Includi colonna 'Totale'";
    texts.param_items_description_rename = "Rinomina la colonna 'Descrizione'";
    texts.param_items_quantity_rename = "Rinomina la colonna 'Quantità'";
    texts.param_items_unit_price_rename = "Rinomina la colonna 'Prezzo unità'";
    texts.param_items_total_rename = "Rinomina la colonna 'Totale'";
    texts.param_language = "Lingua";
    texts.param_language_new = "Aggiungi nuova lingua";
    texts.param_styles = "Stili";

    texts.param_custom_javascript = "File JavaScript personale";
    texts.param_custom_javascript_filename = "Inserisci nome file (colonna 'ID' tabella 'Documenti')";

  }
  else if (language == 'de')
  {
    texts.customer = 'Kunden-Nr';
    texts.date = 'Datum';
    texts.description = 'Beschreibung';
    texts.invoice = 'Rechnung';
    texts.page = 'Seite';
    texts.rounding = 'Rundung';
    texts.total = 'Total';
    texts.totalnet = 'Netto-Betrag';
    texts.vat = 'MwSt.';
    texts.qty = 'Menge';
    texts.unit_ref = 'Einheit';
    texts.unit_price = 'Preiseinheit';
    texts.vat_number = 'Mehrwertsteuernummer: ';
    texts.bill_to = 'Rechnungsadresse';
    texts.shipping_to = 'Lieferadresse';
    texts.from = 'VON:';
    texts.to = 'ZU:';
    texts.param_color_1 = 'Hintergrundfarbe';
    texts.param_color_2 = 'Textfarbe';
    texts.param_font_family = 'Typ Schriftzeichen';
    texts.param_image_height = 'Bildhöhe (mm)';
    texts.param_print_header = 'Seitenüberschrift einschliessen';
    texts.param_print_logo = 'Logo ausdrucken';
    texts.payment_due_date_label = 'Fälligkeitsdatum';
    texts.payment_terms_label = 'Zahlungsfrist';
    //texts.param_max_items_per_page = 'Anzahl der Zeilen auf jeder Rechnung';
  }
  else if (language == 'fr')
  {
    texts.customer = 'No Client';
    texts.date = 'Date';
    texts.description = 'Description';
    texts.invoice = 'Facture';
    texts.page = 'Page';
    texts.rounding = 'Arrondi';
    texts.total = 'Total';
    texts.totalnet = 'Total net';
    texts.vat = 'TVA';
    texts.qty = 'Quantité';
    texts.unit_ref = 'Unité';
    texts.unit_price = 'Prix unité';
    texts.vat_number = 'Numéro de TVA: ';
    texts.bill_to = 'Adresse de facturation';
    texts.shipping_to = 'Adresse de livraison';
    texts.from = 'DE:';
    texts.to = 'À:';
    texts.param_color_1 = 'Couleur de fond';
    texts.param_color_2 = 'Couleur du texte';
    texts.param_font_family = 'Police de caractère';
    texts.param_image_height = "Hauteur de l'image (mm)";
    texts.param_print_header = 'Inclure en-tête de page';
    texts.param_print_logo = 'Imprimer logo';
    texts.payment_due_date_label = 'Echéance';
    texts.payment_terms_label = 'Paiement';
    //texts.param_max_items_per_page = 'Nombre d’éléments sur chaque facture';
  }
  else if (language == 'zh')
  {
    texts.customer = '客户编号';
    texts.date = '日期';
    texts.description = '摘要';
    texts.invoice = '发票';
    texts.page = '页数';
    texts.rounding = '四舍五入';
    texts.total = '总计';
    texts.totalnet = '总净值';
    texts.vat = '增值税';
    texts.qty = '数量';
    texts.unit_ref = '单位';
    texts.unit_price = '单价';
    texts.vat_number = '增值税号: ';
    texts.bill_to = '账单地址';
    texts.shipping_to = '邮寄地址';
    texts.from = '来自:';
    texts.to = '至:';
    texts.param_color_1 = '背景色';
    texts.param_color_2 = '文本颜色';
    texts.param_font_family = '字体类型';
    texts.param_image_height = '图像高度 (mm)';
    texts.param_print_header = '包括页眉';
    texts.param_print_logo = '打印徽标';
    texts.payment_due_date_label = '截止日期';
    texts.payment_terms_label = '付款';
    //texts.param_max_items_per_page = '每页上的项目数';
  }
  else if (language == 'nl')
  {
    texts.customer = 'Klantennummer';
    texts.date = 'Datum';
    texts.description = 'Beschrijving';
    texts.invoice = 'Factuur';
    texts.page = 'Pagina';
    texts.rounding = 'Afronding';
    texts.total = 'Totaal';
    texts.totalnet = 'Totaal netto';
    texts.vat = 'BTW';
    texts.qty = 'Hoeveelheid';
    texts.unit_ref = 'Eenheid';
    texts.unit_price = 'Eenheidsprijs';
    texts.vat_number = 'BTW-nummer: ';
    texts.bill_to = 'Factuuradres';
    texts.shipping_to = 'Leveringsadres';
    texts.from = 'VAN:';
    texts.to = 'TOT:';
    texts.param_color_1 = 'Achtergrond kleur';
    texts.param_color_2 = 'tekstkleur';
    texts.param_font_family = 'Lettertype';
    texts.param_image_height = 'Beeldhoogte (mm)';
    texts.param_print_header = 'Pagina-koptekst opnemen';
    texts.param_print_logo = 'Druklogo';
    texts.payment_due_date_label = 'Vervaldatum';
    texts.payment_terms_label = 'Betaling';
    //texts.param_max_items_per_page = 'Aantal artikelen op iedere pagina';
  }
  else
  {
    texts.customer = 'Customer No';
    texts.date = 'Date';
    texts.description = 'Description';
    texts.invoice = 'Invoice';
    texts.page = 'Page';
    texts.rounding = 'Rounding';
    texts.total = 'Total';
    texts.totalnet = 'Total net';
    texts.vat = 'VAT';
    texts.qty = 'Quantity';
    texts.unit_ref = 'Unit';
    texts.unit_price = 'Unit price';
    texts.vat_number = 'VAT Number: ';
    texts.bill_to = 'Billing address';
    texts.shipping_to = 'Shipping address';
    texts.from = 'FROM:';
    texts.to = 'TO:';
    texts.param_color_1 = 'Background Color';
    texts.param_color_2 = 'Text Color';
    texts.param_font_family = 'Font type';
    texts.param_image_height = 'Image height (mm)';
    texts.param_print_header = 'Include page header';
    texts.param_print_logo = 'Print logo';
    texts.payment_due_date_label = 'Due date';
    texts.payment_terms_label = 'Payment';
    //texts.param_max_items_per_page = 'Number of items on each page';
    texts.param_header = 'Header';
    texts.param_header_left = 'Header on left position';
    texts.param_header_right = 'Header on right position';
    texts.param_logo = 'Logo';
    texts.param_address = 'Address';
    texts.param_address_left = 'Address on left position';
    texts.param_info_invoice = 'Invoice information';
    texts.param_info_invoice_number = 'Include invoice number';
    texts.param_info_date = 'Include invoice date';
    texts.param_info_customer = 'Include customer number';
    texts.param_info_due_date = 'Include invoice due date';
    texts.param_info_page = 'Include page number';
    texts.param_items_table = 'Invoice details';
    texts.param_items_description = "Include column 'Description'";
    texts.param_items_quantity = "Include column 'Quantity'";
    texts.param_items_unit_price = "Include column 'Unit price'";
    texts.param_items_total = "Include column 'Total'";
    texts.param_items_description_rename = "Rename column 'Description'";
    texts.param_items_quantity_rename = "Rename column 'Quantity'";
    texts.param_items_unit_price_rename = "Rename column 'Unit price'";
    texts.param_items_total_rename = "Rename column 'Total'";
    texts.param_language = "Language";
    texts.param_language_new = "Add new";
    texts.param_styles = "Styles";

    texts.param_custom_javascript = "Custom JavaScript file";
    texts.param_custom_javascript_filename = "Insert the file name ('ID' column of the 'Documents' table)";

  }
  return texts;
}
