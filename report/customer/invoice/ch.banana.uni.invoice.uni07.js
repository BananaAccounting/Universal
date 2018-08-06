// Copyright [2018] [Banana.ch SA - Lugano Switzerland]
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
// @id = ch.banana.uni.invoice.uni07
// @api = 1.0
// @pubdate = 2018-08-06
// @publisher = Banana.ch SA
// @description = Style 7: Invoice with net amounts, quantity column, 2 colours
// @description.it = Stile 7: Fattura con importi netti, colonna quantità, 2 colori
// @description.de = Stil 7: Rechnung mit Nettobeträgen, Mengenspalte, 2 Farben
// @description.fr = Style 7: Facture avec montants nets, colonne quantité, 2 couleurs
// @description.nl = Stijl 7: Factuur met netto bedragen, hoeveelheid kolom, 2 kleuren
// @description.en = Style 7: Invoice with net amounts, quantity column, 2 colours
// @description.zh = 样式 7: 发票与净额, 数量列, 2 颜色
// @doctype = *
// @task = report.customer.invoice

var detailsTableStart = "";
var docTableStart = "";

/*Update script's parameters*/
function settingsDialog() {
   var param = initParam();
   var savedParam = Banana.document.scriptReadSettings();
   if (savedParam.length > 0) {
      param = JSON.parse(savedParam);
   }   
   param = verifyParam(param);

   if (typeof (Banana.Ui.openPropertyEditor) !== 'undefined') {
      var dialogTitle = 'Settings';
      var convertedParam = convertParam(param);
      var pageAnchor = 'dlgSettings';
      if (!Banana.Ui.openPropertyEditor(dialogTitle, convertedParam, pageAnchor))
         return;
      for (var i = 0; i < convertedParam.data.length; i++) {
         // Read values to param (through the readValue function)
         convertedParam.data[i].readValue();
      }
   }
   else {
     var lang = Banana.document.locale;
     if (lang.length>2)
        lang = lang.substr(0,2);
     var texts = setInvoiceTexts(lang);
     
     param.print_header = Banana.Ui.getInt('Settings', texts.param_print_header, param.print_header);
     if (param.print_header === undefined)
        return;

     param.color_1 = Banana.Ui.getText('Settings', texts.param_color_1, param.color_1);
     if (param.color_1 === undefined)
        return;

     param.color_2 = Banana.Ui.getText('Settings', texts.param_color_2, param.color_2);
     if (param.color_2 === undefined)
        return;
   }
   
   var paramToString = JSON.stringify(param);
   var value = Banana.document.scriptSaveSettings(paramToString);
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
   
   var currentParam = {};
   currentParam.name = 'print_header';
   currentParam.title = texts.param_print_header;
   currentParam.type = 'bool';
   currentParam.value = param.print_header ? true : false;
   currentParam.readValue = function() {
     param.print_header = this.value;
   }
   convertedParam.data.push(currentParam);
   
   currentParam = {};
   currentParam.name = 'font_family';
   currentParam.title = texts.param_font_family;
   currentParam.type = 'string';
   currentParam.value = param.font_family ? param.font_family : '';
   currentParam.readValue = function() {
     param.font_family = this.value;
   }
   convertedParam.data.push(currentParam);

   currentParam = {};
   currentParam.name = 'color_1';
   currentParam.title = texts.param_color_1;
   currentParam.type = 'string';
   currentParam.value = param.color_1 ? param.color_1 : '#666666';
   currentParam.readValue = function() {
     param.color_1 = this.value;
   }
   convertedParam.data.push(currentParam);

   currentParam = {};
   currentParam.name = 'color_2';
   currentParam.title = texts.param_color_2;
   currentParam.type = 'string';
   currentParam.value = param.color_2 ? param.color_2 : '#ffffff';
   currentParam.readValue = function() {
     param.color_2 = this.value;
   }
   convertedParam.data.push(currentParam);

   return convertedParam;
}

function initParam() {
   var param = {};
   param.print_header = true;
   param.font_family = '';
   param.color_1 = '#666666';
   param.color_2 = '#ffffff';
   param.color_3 = '';
   param.color_4 = '';
   param.color_5 = '';
   return param;
}

function verifyParam(param) {
   if (!param.print_header)
     param.print_header = false;
   if (!param.font_family)
     param.font_family = '';
   if (!param.color_1)
     param.color_1 = '#666666';
   if (!param.color_2)
     param.color_2 = '#ffffff';
   if (!param.color_3)
     param.color_3 = '';
   if (!param.color_4)
     param.color_4 = '';
   if (!param.color_5)
     param.color_5 = '';
   
   return param;
}

function printDocument(jsonInvoice, repDocObj, repStyleObj) {
  var param = initParam();
  var savedParam = Banana.document.scriptReadSettings();
  if (savedParam.length > 0) {
    param = JSON.parse(savedParam);
    param = verifyParam(param);
  }
  repDocObj = printInvoice(jsonInvoice, repDocObj, param);
  setInvoiceStyle(repDocObj, repStyleObj, param);
}

function printInvoice(jsonInvoice, repDocObj, param) {
  // jsonInvoice can be a json string or a js object
  
  var invoiceObj = null;
  if (typeof(jsonInvoice) === 'object') {
    invoiceObj = jsonInvoice;
  } else if (typeof(jsonInvoice) === 'string') {
    invoiceObj = JSON.parse(jsonInvoice)
  }

  // Invoice texts which need translation
  var langDoc = '';
  if (invoiceObj.customer_info.lang )
    langDoc = invoiceObj.customer_info.lang;
  if (langDoc.length <= 0)
    langDoc = invoiceObj.document_info.locale;
  var texts = setInvoiceTexts(langDoc);

  // Invoice document
  var reportObj = Banana.Report;
  
  if (!repDocObj) {
    repDocObj = reportObj.newReport(getTitle(invoiceObj, texts) + " " + invoiceObj.document_info.number);
  } else {
    var pageBreak = repDocObj.addPageBreak();
    pageBreak.addClass("pageReset");
  }


  /***********
    1. HEADER
  ***********/
  if (param.print_header) {

    var tab = repDocObj.addTable("header_table");
    var col1 = tab.addColumn("col1");
    var col2 = tab.addColumn("col2");
    
    tableRow = tab.addRow();

    var business_name = '';
    if (invoiceObj.supplier_info.business_name) {
      business_name = invoiceObj.supplier_info.business_name;
    }
    if (business_name.length<=0) {
      if (invoiceObj.supplier_info.first_name) {
        business_name = invoiceObj.supplier_info.first_name + " ";
      }
      if (invoiceObj.supplier_info.last_name) {
        business_name += invoiceObj.supplier_info.last_name;
      }
    }
    var cell = tableRow.addCell("", "border-bottom left bold", 1);
    cell.addParagraph(business_name.toUpperCase(), "logo");

    var supplierLines = getInvoiceSupplier(invoiceObj.supplier_info).split('\n');
    var supplierLinesContacts = getInvoiceSupplierContacts(invoiceObj.supplier_info).split('\n');
    cell = tableRow.addCell("", "border-bottom", 1);
    for (var i=0; i < supplierLines.length; i++) {
      cell.addParagraph(supplierLines[i], "", 1);
    }
    for (var i=0; i < supplierLinesContacts.length; i++) {
      cell.addParagraph(supplierLinesContacts[i], "", 1);
    }
  }

  /**********************
    2. TITLE
  **********************/
  var titleTable = repDocObj.addTable("title_table");
  tableRow = titleTable.addRow();
  tableRow.addCell(getTitle(invoiceObj, texts), "bold title padding-left");



  /**********************
    3. ADDRESSES
  **********************/
  var addressTable = repDocObj.addTable("address_table");
  var addressCol1 = addressTable.addColumn("addressCol1");
  var addressCol2 = addressTable.addColumn("addressCol2");

  tableRow = addressTable.addRow();
  var c1 = tableRow.addCell("", "bold padding-left", 1);

  var c2 = tableRow.addCell("", "bold padding-left", 1);
  c2.addParagraph("", "");

  tableRow = addressTable.addRow();
  c1 = tableRow.addCell("", "padding-left", 1);
  
  c2 = tableRow.addCell("","padding-left",1); 
  var addressLines = getInvoiceAddress(invoiceObj.customer_info).split('\n');
  for (var i=0; i < addressLines.length; i++) {
    c2.addParagraph(addressLines[i], "");
  }
  
  //Text begin
  if (invoiceObj.document_info.text_begin) {
    detailsTableStart = "125mm";
    docTableStart = "165mm";
    repDocObj.addParagraph(invoiceObj.document_info.text_begin, "begin_text");
  } 
  else {
    detailsTableStart = "100mm";
    docTableStart = "140mm";
  }

 /*********************
    4. INVOICE DETAILS
  ********************/
  var invoiceDetails = repDocObj.addTable("invoice_details");
  var invoiceDetCol1 = invoiceDetails.addColumn("invoiceDetCol1");
  var invoiceDetCol2 = invoiceDetails.addColumn("invoiceDetCol2");
  var invoiceDetCol3 = invoiceDetails.addColumn("invoiceDetCol3");
  var invoiceDate = Banana.Converter.toLocaleDateFormat(invoiceObj.document_info.date);

  tableRow = invoiceDetails.addRow();
  tableRow.addCell("", "details_header border-top border-left border-bottom", 1);
  tableRow.addCell("", "details_header border-top  border-bottom", 1);
  tableRow.addCell("", "details_header border-right border-top  border-bottom", 1);

  tableRow = invoiceDetails.addRow();
  tableRow.addCell("", "", 1);
  tableRow.addCell(getTitle(invoiceObj, texts) + " ", "padding-left border-left border-right", 1);
  tableRow.addCell(invoiceObj.document_info.number, "padding-left border-right", 1);

  tableRow = invoiceDetails.addRow();
  tableRow.addCell("", "", 1);
  tableRow.addCell(texts.date, "padding-left border-right", 1);
  tableRow.addCell(invoiceDate, "padding-left border-right", 1);

  tableRow = invoiceDetails.addRow();
  tableRow.addCell("", "", 1);
  tableRow.addCell(texts.customer, "padding-left border-right", 1);
  tableRow.addCell(invoiceObj.customer_info.number, "padding-left border-right", 1);

  var payment_terms_label = texts.payment_terms_label;
  var payment_terms = '';
  if (invoiceObj.billing_info.payment_term) {
    payment_terms = invoiceObj.billing_info.payment_term;
  }
  else if (invoiceObj.payment_info.due_date) {
    payment_terms_label = texts.payment_due_date_label
    payment_terms = Banana.Converter.toLocaleDateFormat(invoiceObj.payment_info.due_date);
  }
  tableRow = invoiceDetails.addRow();
  tableRow.addCell("", "", 1);
  tableRow.addCell(payment_terms_label, "padding-left border-right", 1);
  tableRow.addCell(payment_terms, "padding-left border-right", 1);

  tableRow = invoiceDetails.addRow();
  tableRow.addCell("", "", 1);
  tableRow.addCell(texts.page, "padding-left border-right  border-bottom", 1);
  tableRow.addCell("", "padding-left border-right border-bottom", 1).addFieldPageNr();  

  printInvoiceDetails(invoiceObj, repDocObj.getHeader(), param, texts);

  /***************
    5. TABLE ITEMS
  ***************/
  var repTableObj = repDocObj.addTable("doc_table");
  var repTableCol1 = repTableObj.addColumn("repTableCol1");
  var repTableCol2 = repTableObj.addColumn("repTableCol2");
  var repTableCol3 = repTableObj.addColumn("repTableCol3");
  var repTableCol4 = repTableObj.addColumn("repTableCol4");

  var dd = repTableObj.getHeader().addRow();
  dd.addCell(texts.description, "padding-left items_table_header border-left border-top", 1);
  dd.addCell(texts.qty, "padding-right items_table_header amount border-top", 1);
  dd.addCell(texts.unit_price, "padding-right items_table_header amount border-top", 1);
  dd.addCell(texts.total + " " + invoiceObj.document_info.currency, "padding-right items_table_header amount border-top border-right", 1);

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
    var descriptionCell = tableRow.addCell("", "padding-left border-left " + className, 1);
    descriptionCell.addParagraph(item.description);
    descriptionCell.addParagraph(item.description2);
  	
    if (className == "note_cell") {
        tableRow.addCell("", "padding-right border-left amount " + className, 1);
        tableRow.addCell("", "padding-right border-left amount " + className, 1);
        tableRow.addCell("", "padding-right amount border-left border-right " + className, 1);  
  	}
  	else if (className == "subtotal_cell") {
        tableRow.addCell("", "padding-right border-left amount " + className, 1);
        tableRow.addCell("", "padding-right border-left amount " + className, 1);
        tableRow.addCell(toInvoiceAmountFormat(invoiceObj, item.total_amount_vat_exclusive), "padding-right amount border-left border-right " + className, 1);  
  	}
  	else {
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(item.quantity), "padding-right border-left amount " + className, 1);
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(item.unit_price.calculated_amount_vat_exclusive), "padding-right border-left amount " + className, 1);
        tableRow.addCell(toInvoiceAmountFormat(invoiceObj, item.total_amount_vat_exclusive), "padding-right amount border-left border-right " + className, 1);  
  	}
  }

  tableRow = repTableObj.addRow();
  tableRow.addCell("", "border-top", 4);


  //TOTAL NET
  if (invoiceObj.billing_info.total_vat_rates.length > 0)
  {
    tableRow = repTableObj.addRow();
    tableRow.addCell(texts.totalnet, "padding-left", 1);
    tableRow.addCell("", "", 2);
    tableRow.addCell(toInvoiceAmountFormat(invoiceObj, invoiceObj.billing_info.total_amount_vat_exclusive), "padding-right amount", 1);

    //VAT
    for (var i = 0; i < invoiceObj.billing_info.total_vat_rates.length; i++) 
    {
      tableRow = repTableObj.addRow(); 
      tableRow.addCell(texts.vat + " " + invoiceObj.billing_info.total_vat_rates[i].vat_rate + "%", "padding-left", 1);
      tableRow.addCell("", "", 1);
      tableRow.addCell(toInvoiceAmountFormat(invoiceObj, invoiceObj.billing_info.total_vat_rates[i].total_amount_vat_exclusive), "amount", 1);
      tableRow.addCell(toInvoiceAmountFormat(invoiceObj, invoiceObj.billing_info.total_vat_rates[i].total_vat_amount), "padding-right amount", 1);
    }
  }


  //TOTAL ROUNDING DIFFERENCE
  if (invoiceObj.billing_info.total_rounding_difference) 
  {
    tableRow = repTableObj.addRow();
    tableRow.addCell(texts.rounding, "padding-left ", 1);
    tableRow.addCell("", "", 2);
    tableRow.addCell(toInvoiceAmountFormat(invoiceObj, invoiceObj.billing_info.total_rounding_difference), "padding-right amount", 1);
  }

  tableRow = repTableObj.addRow();
  tableRow.addCell("", "", 4);


  //FINAL TOTAL
  tableRow = repTableObj.addRow();

  tableRow.addCell(texts.total.toUpperCase() + " " + invoiceObj.document_info.currency, "padding-left bold border-bottom border-top total", 1);
  tableRow.addCell("", "border-bottom border-top", 2);  
  tableRow.addCell(toInvoiceAmountFormat(invoiceObj, invoiceObj.billing_info.total_to_pay), "padding-right bold amount border-bottom border-top total", 1);


  //Notes
  for (var i = 0; i < invoiceObj.note.length; i++) 
  {
    if (invoiceObj.note[i].description) 
    {
      tableRow = repTableObj.addRow();
      tableRow.addCell(invoiceObj.note[i].description,"",4);
    }
  }

  //Greetings
  if (invoiceObj.document_info.greetings) 
  {
      tableRow = repTableObj.addRow();
      tableRow.addCell(invoiceObj.document_info.greetings, "", 4);
  }

  //Template params
  //Default text starts with "(" and ends with ")" (default), (Vorderfiniert)
  if (invoiceObj.template_parameters && invoiceObj.template_parameters.footer_texts) {
    var lang = '';
    if (invoiceObj.customer_info.lang )
      lang = invoiceObj.customer_info.lang;
    if (lang.length <= 0 && invoiceObj.document_info.locale)
      lang = invoiceObj.document_info.locale;
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
    if (text.join().length <= 0)
      text = textDefault;
    for (var i=0; i < text.length; i++) {
      tableRow = repTableObj.addRow();
      tableRow.addCell(text[i], "", 4);
    }
  }

  return repDocObj;
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

function getInvoiceSupplier(invoiceSupplier) {
  
  var supplierAddress = "";

  // if (invoiceSupplier.business_name) {
  //   supplierAddress = invoiceSupplier.business_name + " - ";
  // }

  if (invoiceSupplier.first_name) {
    supplierAddress = invoiceSupplier.first_name + " ";
  }

  if (invoiceSupplier.last_name) {
    supplierAddress = supplierAddress + invoiceSupplier.last_name;
  }

  if (supplierAddress.length > 0) {
    supplierAddress += "\n";
  }

  if (invoiceSupplier.address1) {
    supplierAddress = supplierAddress + invoiceSupplier.address1;
  }

  supplierAddress += "\n";
  
  if (invoiceSupplier.address2) {
    supplierAddress = supplierAddress + invoiceSupplier.address2;
  }

  supplierAddress += "\n";

  if (invoiceSupplier.postal_code) {
    supplierAddress = supplierAddress + invoiceSupplier.postal_code + " ";
  }
  
  if (invoiceSupplier.city) {
    supplierAddress = supplierAddress + invoiceSupplier.city + "\n";
  }

  return supplierAddress;
}

function getInvoiceSupplierContacts(invoiceSupplier) {
  
  var supplierAddress = "";

  if (invoiceSupplier.phone) {
    supplierAddress = supplierAddress + "Tel: "+ invoiceSupplier.phone + " ";
  }
  
  if (invoiceSupplier.fax) {
    supplierAddress = supplierAddress + "Fax: "+ invoiceSupplier.fax + " ";
  }

  if (supplierAddress.length > 0) {
    supplierAddress += "\n";
  }
  
  if (invoiceSupplier.email) {
    supplierAddress = supplierAddress + invoiceSupplier.email + " ";
  }
 
  if (invoiceSupplier.web) {
    supplierAddress = supplierAddress + invoiceSupplier.web;
  }
 
  // if (invoiceSupplier.vat_number) {
  //   supplierAddress = supplierAddress + "\n";
  //   supplierAddress = supplierAddress + invoiceSupplier.vat_number;
  // }

  return supplierAddress;
}

function getInvoiceSupplierFooter(invoiceSupplier) {
  
  var supplierAddress = "";

  if (invoiceSupplier.business_name) {
    supplierAddress = invoiceSupplier.business_name + ", ";
  }

  if (invoiceSupplier.address1 || invoiceSupplier.address2) {
    //supplierAddress = supplierAddress + ", ";

    if (invoiceSupplier.address1) {
      supplierAddress = supplierAddress + invoiceSupplier.address1 + ", ";
    }
    
    if (invoiceSupplier.address2) {
      supplierAddress = supplierAddress + invoiceSupplier.address2 + ", ";
    }
  }
  
  if (invoiceSupplier.postal_code) {
    supplierAddress = supplierAddress + invoiceSupplier.postal_code + " ";
  }
  
  if (invoiceSupplier.city) {
    supplierAddress = supplierAddress + invoiceSupplier.city + ", ";
  }
  
  if (invoiceSupplier.phone) {
    supplierAddress = supplierAddress + "Tel: " + invoiceSupplier.phone + ", ";
  }
  
  if (invoiceSupplier.fax) {
    supplierAddress = supplierAddress + "Fax: " + invoiceSupplier.fax + ", ";
  }
  
  if (invoiceSupplier.email) {
    supplierAddress = supplierAddress + "email: " + invoiceSupplier.email + ", ";
  }
  
  if (invoiceSupplier.web) {
    supplierAddress = supplierAddress + invoiceSupplier.web;
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

function printInvoiceDetails(invoiceObj, repDocObj, param, texts, rowNumber) {
  //
  // INVOICE DETAILS
  //
  var invoiceDetails = repDocObj.addTable("invoice_details_row0");
  var invoiceDetCol1 = invoiceDetails.addColumn("invoiceDetCol1");
  var invoiceDetCol2 = invoiceDetails.addColumn("invoiceDetCol2");
  var invoiceDetCol3 = invoiceDetails.addColumn("invoiceDetCol3");
  var invoiceDate = Banana.Converter.toLocaleDateFormat(invoiceObj.document_info.date);

  tableRow = invoiceDetails.addRow();
  tableRow.addCell("", "details_header border-top border-left border-bottom", 1);
  tableRow.addCell("", "details_header border-top  border-bottom", 1);
  tableRow.addCell("", "details_header border-right border-top  border-bottom", 1);

  tableRow = invoiceDetails.addRow();
  tableRow.addCell("", "", 1);
  tableRow.addCell(getTitle(invoiceObj, texts) + " ", "padding-left border-left border-right", 1);
  tableRow.addCell(invoiceObj.document_info.number, "padding-left border-right", 1);

  tableRow = invoiceDetails.addRow();
  tableRow.addCell("", "", 1);
  tableRow.addCell(texts.date, "padding-left border-right", 1);
  tableRow.addCell(invoiceDate, "padding-left border-right", 1);

  tableRow = invoiceDetails.addRow();
  tableRow.addCell("", "", 1);
  tableRow.addCell(texts.customer, "padding-left border-right", 1);
  tableRow.addCell(invoiceObj.customer_info.number, "padding-left border-right", 1);

  var payment_terms_label = texts.payment_terms_label;
  var payment_terms = '';
  if (invoiceObj.billing_info.payment_term) {
    payment_terms = invoiceObj.billing_info.payment_term;
  }
  else if (invoiceObj.payment_info.due_date) {
	payment_terms_label = texts.payment_due_date_label
    payment_terms = Banana.Converter.toLocaleDateFormat(invoiceObj.payment_info.due_date);
  }
  tableRow = invoiceDetails.addRow();
  tableRow.addCell("", "", 1);
  tableRow.addCell(payment_terms_label, "padding-left border-right", 1);
  tableRow.addCell(payment_terms, "padding-left border-right", 1);
  
  tableRow = invoiceDetails.addRow();
  tableRow.addCell("", "", 1);
  tableRow.addCell(texts.page, "padding-left border-right  border-bottom", 1);
  tableRow.addCell("", "padding-left border-right border-bottom", 1).addFieldPageNr(); 
}


//====================================================================//
// STYLES
//====================================================================//
function setInvoiceStyle(reportObj, repStyleObj, param) {
    
  if (!repStyleObj) {
      repStyleObj = reportObj.newStyleSheet();
  }

  //Set default values
  if (!param.font_family) {
      param.font_family = "Calibri";
  }

  if (!param.color_1) {
      param.color_1 = "#666666";
  }

  if (!param.color_2) {
      param.color_2 = "#ffffff";
  }

  if (!param.color_3) {
      param.color_3 = "";
  }

  if (!param.color_4) {
      param.color_4 = "";
  }

  if (!param.color_5) {
      param.color_5 = "";
  }

  // repStyleObj.addStyle("@page", "margin: 0mm 0mm 0mm 0mm");
  // repStyleObj.addStyle("@page", "size: landscape");

  //====================================================================//
  // GENERAL
  //====================================================================//
  repStyleObj.addStyle(".pageReset", "counter-reset: page");
  repStyleObj.addStyle("body", "font-size: 12pt; font-family:" + param.font_family);
  repStyleObj.addStyle(".logo", "padding-top:-1px; font-size: 24pt; color:" + param.color_1);
  repStyleObj.addStyle(".headerAddress", "font-size:9pt");
  repStyleObj.addStyle(".amount", "text-align:right");
  repStyleObj.addStyle(".subtotal_cell", "font-weight:bold;");
  repStyleObj.addStyle(".center", "text-align:center");
  repStyleObj.addStyle(".left", "text-align:left");
  repStyleObj.addStyle(".bold", "font-weight: bold");
  repStyleObj.addStyle(".title", "font-size:24pt;");

  repStyleObj.addStyle(".details_header", "font-weight:bold; font-size:14pt; background-color:" + param.color_1 +"; color:" + param.color_2);
  repStyleObj.addStyle(".details_header td", "padding-top:5px; padding-bottom:4px; padding-left:5px");

  repStyleObj.addStyle(".border-left", "border-left:1px solid " + param.color_1);
  repStyleObj.addStyle(".border-right", "border-right:1px solid " + param.color_1);
  repStyleObj.addStyle(".border-bottom", "border-bottom:1px solid " + param.color_1);
  repStyleObj.addStyle(".border-top", "border-top:1px solid " + param.color_1);

  repStyleObj.addStyle(".items_table_header", "font-weight:bold; font-size:14pt; background-color:" + param.color_1 +"; color:" + param.color_2);
  repStyleObj.addStyle(".items_table_header td", "padding-top:5px; padding-bottom:5px;");

  repStyleObj.addStyle(".total", "font-size:16pt; color: " + param.color_1);

  repStyleObj.addStyle(".padding-right", "padding-right:5px");
  repStyleObj.addStyle(".padding-left", "padding-left:5px");

  repStyleObj.addStyle(".col1","width:43%;");
  repStyleObj.addStyle(".col2","width:56%");

  repStyleObj.addStyle(".addressCol1","width:43%");
  repStyleObj.addStyle(".addressCol2","width:43%");

  repStyleObj.addStyle(".invoiceDetCol1", "width:34%");
  repStyleObj.addStyle(".invoiceDetCol2", "width:33%");
  repStyleObj.addStyle(".invoiceDetCol3", "width:33%");

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
  // TABLES
  //====================================================================//
  var headerStyle = repStyleObj.addStyle(".header_table");
  headerStyle.setAttribute("position", "absolute");
  headerStyle.setAttribute("margin-top", "10mm"); //106
  headerStyle.setAttribute("margin-left", "20mm"); //20
  headerStyle.setAttribute("margin-right", "10mm");
  headerStyle.setAttribute("width", "100%");
  //repStyleObj.addStyle("table.header_table td", "border: thin solid black");

  var infoStyle = repStyleObj.addStyle(".title_table");
  infoStyle.setAttribute("position", "absolute");
  infoStyle.setAttribute("margin-top", "42mm");
  infoStyle.setAttribute("margin-left", "23mm");
  infoStyle.setAttribute("margin-right", "10mm");
  //repStyleObj.addStyle("table.info_table td", "border: thin solid black");
  infoStyle.setAttribute("width", "100%");

  var addressStyle = repStyleObj.addStyle(".address_table");
  addressStyle.setAttribute("position", "absolute");
  addressStyle.setAttribute("margin-top", "40mm");
  addressStyle.setAttribute("margin-left", "20mm");
  addressStyle.setAttribute("margin-right", "10mm");
  //repStyleObj.addStyle("table.address_table td", "border: thin solid #6959CD");
  //addressStyle.setAttribute("width", "100%");

  var detailsStyle = repStyleObj.addStyle(".invoice_details");
  detailsStyle.setAttribute("position", "absolute");
  detailsStyle.setAttribute("margin-top", detailsTableStart);
  detailsStyle.setAttribute("margin-left", "23mm");
  detailsStyle.setAttribute("margin-right", "10mm");
  detailsStyle.setAttribute("width", "100%");

  var detailsStyle = repStyleObj.addStyle(".invoice_details_row0");
  detailsStyle.setAttribute("position", "absolute");
  detailsStyle.setAttribute("margin-top", "10mm");
  detailsStyle.setAttribute("margin-left", "23mm");
  detailsStyle.setAttribute("margin-right", "10mm");
  detailsStyle.setAttribute("width", "100%");

  var infoStyle = repStyleObj.addStyle("@page:first-view table.invoice_details_row0");
  infoStyle.setAttribute("display", "none");

  var itemsStyle = repStyleObj.addStyle(".doc_table:first-view");
  itemsStyle.setAttribute("margin-top", docTableStart);

  var itemsStyle = repStyleObj.addStyle(".doc_table");
  itemsStyle.setAttribute("margin-top", "50mm"); //106
  itemsStyle.setAttribute("margin-left", "23mm"); //20
  itemsStyle.setAttribute("margin-right", "10mm");
  //repStyleObj.addStyle("table.doc_table td", "border: thin solid #6959CD;");
  itemsStyle.setAttribute("width", "100%");
}

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
    texts.from = 'DA';
    texts.to = 'A';
    texts.param_color_1 = 'Colore sfondo';
    texts.param_color_2 = 'Colore testo';
    texts.param_font_family = 'Tipo carattere';
    texts.param_print_header = 'Includi intestazione pagina (1=si, 0=no)';
    texts.param_personal_text_1 = 'Testo libero (riga 1)';
    texts.param_personal_text_2 = 'Testo libero (riga 2)';
    texts.payment_due_date_label = 'Scadenza';
    texts.payment_terms_label = 'Pagamento';
    //texts.param_max_items_per_page = 'Numero di linee su ogni fattura';
  }
  else if (language == 'de')
  {
    texts.customer = 'Kunde-Nr';
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
    texts.from = 'VON';
    texts.to = 'ZU';
    texts.param_color_1 = 'Hintergrundfarbe';
    texts.param_color_2 = 'Textfarbe';
    texts.param_font_family = 'Typ Schriftzeichen';
    texts.param_print_header = 'Seitenüberschrift einschliessen (1=ja, 0=nein)';
    texts.param_personal_text_1 = 'Freier Text (Zeile 1)';
    texts.param_personal_text_2 = 'Freier Text (Zeile 2)';
    texts.payment_due_date_label = 'Fälligkeitsdatum';
    texts.payment_terms_label = 'Zahlungsbedingungen';
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
    texts.from = 'DE';
    texts.to = 'À';
    texts.param_color_1 = 'Couleur de fond';
    texts.param_color_2 = 'Couleur du texte';
    texts.param_font_family = 'Police de caractère';
    texts.param_print_header = 'Inclure en-tête de page (1=oui, 0=non)';
    texts.param_personal_text_1 = 'Texte libre (ligne 1)';
    texts.param_personal_text_2 = 'Texte libre (ligne 2)';
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
    texts.from = '来自';
    texts.to = '至';
    texts.param_color_1 = '背景色';
    texts.param_color_2 = '文本颜色';
    texts.param_font_family = '字体类型';
    texts.param_print_header = '包括页眉 (1=是, 0=否)';
    texts.param_personal_text_1 = '个人文本 (行 1)';
    texts.param_personal_text_2 = '个人文本 (行 2)';
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
    texts.from = 'VAN';
    texts.to = 'TOT';
    texts.param_color_1 = 'Achtergrond kleur';
    texts.param_color_2 = 'Tekstkleur';
    texts.param_font_family = 'Lettertype';
    texts.param_print_header = 'Pagina-koptekst opnemen (1=ja, 0=nee)';  
    texts.param_personal_text_1 = 'Persoonlijke tekst (rij 1)';
    texts.param_personal_text_2 = 'Persoonlijke tekst (rij 2)';
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
    texts.from = 'FROM';
    texts.to = 'TO';
    texts.param_color_1 = 'Background Color';
    texts.param_color_2 = 'Text Color';
    texts.param_font_family = 'Font type';
    texts.param_print_header = 'Include page header (1=yes, 0=no)';
    texts.param_personal_text_1 = 'Personal text (row 1)';
    texts.param_personal_text_2 = 'Personal text (row 2)';
    texts.payment_due_date_label = 'Due date';
    texts.payment_terms_label = 'Payment';
    //texts.param_max_items_per_page = 'Number of items on each page';
  }
  return texts;
}

