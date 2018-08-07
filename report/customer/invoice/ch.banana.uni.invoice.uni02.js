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
// @id = ch.banana.uni.invoice.uni02
// @api = 1.0
// @pubdate = 2018-08-06
// @publisher = Banana.ch SA
// @description = Style 2: Invoice with net amounts, quantity column, 3 colours
// @description.it = Stile 2: Fattura con importi netti, colonna quantità, 3 colori
// @description.de = Stil 2: Rechnung mit Nettobeträgen, Mengenspalte, 3 Farben
// @description.fr = Style 2: Facture avec montants nets, colonne quantité, 3 couleurs
// @description.nl = Stijl 2: Factuur met netto bedragen, hoeveelheid kolom, 3 kleuren
// @description.en = Style 2: Invoice with net amounts, quantity column, 3 colours
// @description.zh = 样式 2: 发票与净额, 数量专栏, 3 颜色
// @doctype = *
// @task = report.customer.invoice


/*Update script's parameters*/
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

     param.font_family = Banana.Ui.getText('Settings', texts.param_font_family, param.font_family);
     if (param.font_family === undefined)
        return;

     param.color_1 = Banana.Ui.getText('Settings', texts.param_color_1, param.color_1);
     if (param.color_1 === undefined)
        return;
    
     param.color_2 = Banana.Ui.getText('Settings', texts.param_color_2, param.color_2);
     if (param.color_2 === undefined)
        return;
     
     param.color_3 = Banana.Ui.getText('Settings', texts.param_color_3, param.color_3);
     if (param.color_3 === undefined)
        return;
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
   currentParam.value = param.color_1 ? param.color_1 : '#0066CC';
   currentParam.readValue = function() {
     param.color_1 = this.value;
   }
   convertedParam.data.push(currentParam);

   currentParam = {};
   currentParam.name = 'color_2';
   currentParam.title = texts.param_color_2;
   currentParam.type = 'string';
   currentParam.value = param.color_2 ? param.color_2 : '#FFD100';
   currentParam.readValue = function() {
     param.color_2 = this.value;
   }
   convertedParam.data.push(currentParam);

   currentParam = {};
   currentParam.name = 'color_3';
   currentParam.title = texts.param_color_3;
   currentParam.type = 'string';
   currentParam.value = param.color_3 ? param.color_3 : '#F0F8FF';
   currentParam.readValue = function() {
     param.color_3 = this.value;
   }
   convertedParam.data.push(currentParam);

   return convertedParam;
}

function initParam() {
   var param = {};
   param.print_header = true;
   param.font_family = '';
   param.color_1 = '#0066CC';
   param.color_2 = '#FFD100';
   param.color_3 = '#F0F8FF';
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
     param.color_1 = '#0066CC';
   if (!param.color_2)
     param.color_2 = '#FFD100';
   if (!param.color_3)
     param.color_3 = '#F0F8FF';
   if (!param.color_4)
     param.color_4 = '';
   if (!param.color_5)
     param.color_5 = '';
   
   return param;
}

function printDocument(jsonInvoice, repDocObj, repStyleObj) {
  var param = initParam();
  var savedParam = Banana.document.getScriptSettings();
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
		repDocObj = reportObj.newReport(getTitle(invoiceObj, texts) + ": " + invoiceObj.document_info.number);
	} else {
    var pageBreak = repDocObj.addPageBreak();
    pageBreak.addClass("pageReset");
  }


  /***********
    1. HEADER
	***********/
  if (param.print_header)
  {
    var tab = repDocObj.addTable("header_table");
    var col1 = tab.addColumn("headerCol1");
    var col2 = tab.addColumn("headerCol2");

    var h = tab.getHeader().addRow();
    h.addCell(">", "symbol", 1);
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
    h.addCell(business_name, "bigLogo timeNewRoman", 1);

    var x = tab.getHeader().addRow();
    x.addCell("", "", 2);

    var supplierLines = getInvoiceSupplier(invoiceObj.supplier_info).split('\n');
    for (var i=0; i < supplierLines.length; i++) {
      var t = tab.getHeader().addRow();
      t.addCell(supplierLines[i], "company_name", 2);
    }
  }


  /**********************
    2. INVOICE TEXTS INFO
  **********************/
  var infoTable = repDocObj.addTable("info_table");
  var col1 = infoTable.addColumn("infoCol1");
  var col2 = infoTable.addColumn("infoCol2");

  tableRow = infoTable.addRow();
  tableRow.addCell(getTitle(invoiceObj, texts), "", 1);
  tableRow.addCell(invoiceObj.document_info.number, "", 1);

  tableRow = infoTable.addRow();
  var invoiceDate = Banana.Converter.toLocaleDateFormat(invoiceObj.document_info.date);
  tableRow.addCell(texts.date, "", 1);
  tableRow.addCell(invoiceDate, "", 1);

  tableRow = infoTable.addRow();
  tableRow.addCell(texts.customer, "", 1);
  tableRow.addCell(invoiceObj.customer_info.number, "", 1);
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
  tableRow = infoTable.addRow();
  tableRow.addCell(payment_terms_label, "", 1);
  tableRow.addCell(payment_terms, "", 1);

  tableRow = infoTable.addRow();
  tableRow.addCell(texts.page, "", 1);
  tableRow.addCell("", "", 1).addFieldPageNr();



  /***********
    3. ADDRESS
  ***********/
  //invoice address
  var repAddressObj =  repDocObj.addSection("address_invoice");
  var addressLines = getInvoiceAddress(invoiceObj.customer_info).split('\n');
  if (invoiceObj.shipping_info && invoiceObj.shipping_info.different_shipping_address==true)
  {
    repAddressObj.addParagraph(texts.bill_to.toUpperCase(), "bold");
    for (var i=0; i < addressLines.length; i++) {
      repAddressObj.addParagraph(addressLines[i]);
    }
  }

  //shipping address
  var repShippingObj =  repDocObj.addSection("address_shipping");
  if (invoiceObj.shipping_info && invoiceObj.shipping_info.different_shipping_address==true)
    addressLines = getInvoiceAddress(invoiceObj.shipping_info).split('\n');
  //repShippingObj.addParagraph(texts.shipping_to.toUpperCase(), "bold");
  for (var i=0; i < addressLines.length; i++) {
    repShippingObj.addParagraph(addressLines[i]);
  }

  //Text begin
  if (invoiceObj.document_info.text_begin) {
    repDocObj.addParagraph(invoiceObj.document_info.text_begin, "begin_text");
  }

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
  dd.addCell(texts.description, "bold border-top-black border-bottom-black padding-top padding-bottom padding-left", 1);
  dd.addCell(texts.qty, "bold border-top-black border-bottom-black padding-top padding-bottom padding-right amount", 1);
  dd.addCell(texts.unit_price, "bold  border-top-black border-bottom-black amount padding-top padding-bottom padding-right", 1);
  dd.addCell(texts.total + " " + invoiceObj.document_info.currency, "bold border-top-black border-bottom-black amount padding-top padding-bottom padding-right", 1);


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

  	var classNameEvenRow = "";
    if (i % 2 == 0) {
  	  classNameEvenRow = "evenRowsBackgroundColor";
    }
  	
    tableRow = repTableObj.addRow();
    var descriptionCell = tableRow.addCell("", classNameEvenRow + " padding-left " + className, 1);
    descriptionCell.addParagraph(item.description);
    descriptionCell.addParagraph(item.description2);

  	if (className == "note_cell") {
  	  tableRow.addCell("", classNameEvenRow + " padding-left padding-right thin-border-top " + className, 3);
    }
  	else if (className == "subtotal_cell") {
        tableRow.addCell("", classNameEvenRow + " amount padding-right " + className, 2);
        tableRow.addCell(toInvoiceAmountFormat(invoiceObj, item.total_amount_vat_exclusive), classNameEvenRow + " amount padding-right " + className, 1);
  	}
  	else {
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(item.quantity), classNameEvenRow + " amount padding-right " + className, 1);
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(item.unit_price.calculated_amount_vat_exclusive), classNameEvenRow + " amount padding-right " + className, 1);
        tableRow.addCell(toInvoiceAmountFormat(invoiceObj, item.total_amount_vat_exclusive), classNameEvenRow + " amount padding-right " + className, 1);
  	}
  }


  //TOTAL NET
  if (invoiceObj.billing_info.total_vat_rates.length > 0)
  {
    tableRow = repTableObj.addRow();
    tableRow.addCell(" ", "horizontalLine-black", 1)
    tableRow.addCell(texts.totalnet, "horizontalLine-black", 1);
    tableRow.addCell(" ", "horizontalLine-black", 1)
    tableRow.addCell(toInvoiceAmountFormat(invoiceObj, invoiceObj.billing_info.total_amount_vat_exclusive), "horizontalLine-black amount padding-right", 1);

    for (var i = 0; i < invoiceObj.billing_info.total_vat_rates.length; i++) 
    {
      tableRow = repTableObj.addRow();
      tableRow.addCell("", "", 1);
      tableRow.addCell(texts.vat + " " + invoiceObj.billing_info.total_vat_rates[i].vat_rate + "%", " padding-right", 1);
      tableRow.addCell(toInvoiceAmountFormat(invoiceObj, invoiceObj.billing_info.total_vat_rates[i].total_amount_vat_exclusive), "amount padding-right", 1);
      tableRow.addCell(toInvoiceAmountFormat(invoiceObj, invoiceObj.billing_info.total_vat_rates[i].total_vat_amount), "amount vat_amount padding-right", 1);
    }
  }


  //TOTAL ROUNDING DIFFERENCE
  if (invoiceObj.billing_info.total_rounding_difference.length) 
  {
    tableRow = repTableObj.addRow();
    tableRow.addCell(" ", "", 1);
    tableRow.addCell(texts.rounding, "padding-right", 1);
    tableRow.addCell(" ", "", 1)
    tableRow.addCell(toInvoiceAmountFormat(invoiceObj, invoiceObj.billing_info.total_rounding_difference), "amount padding-right", 1);
  }


  //FINAL TOTAL
  tableRow = repTableObj.addRow();
  tableRow.addCell("", "", 1);
  tableRow.addCell(texts.total.toUpperCase() + " " + invoiceObj.document_info.currency, "bold horizontalLine-black horizontalLineTotal-black ", 1);
  tableRow.addCell(" ", "horizontalLine-black horizontalLineTotal-black", 1);
  tableRow.addCell(toInvoiceAmountFormat(invoiceObj, invoiceObj.billing_info.total_to_pay), "bold amount horizontalLine-black horizontalLineTotal-black padding-right", 1);


  //Notes
  for (var i = 0; i < invoiceObj.note.length; i++) 
  {
    if (invoiceObj.note[i].description) {
      tableRow = repTableObj.addRow();
      tableRow.addCell(invoiceObj.note[i].description, "", 4);
    }
  }

  //Greetings
  if (invoiceObj.document_info.greetings) {
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

   var supplierAddressRow1 = "";
   var supplierAddressRow2 = "";
   var supplierAddressRow3 = "";
   var supplierAddress = "";

   //Row 1
   if (invoiceSupplier.first_name) {
      supplierAddressRow1 = supplierAddressRow1 + invoiceSupplier.first_name + " ";
   }

   if (invoiceSupplier.last_name) {
      supplierAddressRow1 = supplierAddressRow1 + invoiceSupplier.last_name + ", ";
   }

   if (supplierAddressRow1.length <= 0) {
      if (invoiceSupplier.business_name) {
         supplierAddressRow1 = supplierAddressRow1 + invoiceSupplier.business_name + ", ";
      }
   }

   if (invoiceSupplier.address1) {
      supplierAddressRow1 = supplierAddressRow1 + invoiceSupplier.address1 + ", ";
   }

   if (invoiceSupplier.address2) {
      supplierAddressRow1 = supplierAddressRow1 + invoiceSupplier.address2 + ", ";
   }

   if (invoiceSupplier.postal_code) {
      supplierAddressRow1 = supplierAddressRow1 + invoiceSupplier.postal_code + " ";
   }

   if (invoiceSupplier.city) {
      supplierAddressRow1 = supplierAddressRow1 + invoiceSupplier.city + ", ";
   }

   if (invoiceSupplier.country) {
      supplierAddressRow1 = supplierAddressRow1 + invoiceSupplier.country;
   }

   //Remove last character if it is a ","
   var str = supplierAddressRow1.trim();
   var lastChar = str[str.length - 1];
   if (lastChar === ",") {
      supplierAddressRow1 = str.slice(0,-1);
   }

   //Row 2
   if (invoiceSupplier.phone) {
      supplierAddressRow2 = supplierAddressRow2 + "Tel: " + invoiceSupplier.phone + ", ";
   }

   if (invoiceSupplier.fax) {
      supplierAddressRow2 = supplierAddressRow2 + "Fax: " + invoiceSupplier.fax + ", ";
   }

   if (invoiceSupplier.email) {
      supplierAddressRow2 = supplierAddressRow2 + invoiceSupplier.email + ", ";
   }

   if (invoiceSupplier.web) {
      supplierAddressRow2 = supplierAddressRow2 + invoiceSupplier.web;
   }

   //Remove last character if it is a ","
   var str = supplierAddressRow2.trim();
   var lastChar = str[str.length - 1];
   if (lastChar === ",") {
      supplierAddressRow2 = str.slice(0,-1);
   }

   // //Row 3
   // if (invoiceSupplier.fiscal_number) {
   //    supplierAddressRow3 = supplierAddressRow3 + invoiceSupplier.fiscal_number + ", ";
   // }

   // if (invoiceSupplier.vat_number) {
   //    supplierAddressRow3 = supplierAddressRow3 + invoiceSupplier.vat_number;
   // }

   //Final address (row1 + row2 + row3)
   supplierAddress = supplierAddress + supplierAddressRow1 + "\n" + supplierAddressRow2; // + "\n" + supplierAddressRow3;
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

function printInvoiceDetails(invoiceObj, repDocObj, param, texts) {
  //
  // INVOICE DETAILS
  //
  var infoTable = repDocObj.addTable("info_table_row0");
  var col1 = infoTable.addColumn("infoCol1");
  var col2 = infoTable.addColumn("infoCol2");

  tableRow = infoTable.addRow();
  tableRow.addCell(getTitle(invoiceObj, texts), "", 1);
  tableRow.addCell(invoiceObj.document_info.number, "", 1);

  tableRow = infoTable.addRow();
  var invoiceDate = Banana.Converter.toLocaleDateFormat(invoiceObj.document_info.date);
  tableRow.addCell(texts.date, "", 1);
  tableRow.addCell(invoiceDate, "", 1);

  tableRow = infoTable.addRow();
  tableRow.addCell(texts.customer, "", 1);
  tableRow.addCell(invoiceObj.customer_info.number, "", 1);
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
  tableRow = infoTable.addRow();
  tableRow.addCell(payment_terms_label, "", 1);
  tableRow.addCell(payment_terms, "", 1);

  tableRow = infoTable.addRow();
  tableRow.addCell(texts.page, "", 1);
  tableRow.addCell("", "", 1).addFieldPageNr();
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
        param.font_family = "Helvetica";
    }

    if (!param.color_1) {
        param.color_1 = "#0066CC";
    }

    if (!param.color_2) {
        param.color_2 = "#FFD100";
    }

    if (!param.color_3) {
        param.color_3 = "#F0F8FF";
    }
    
    if (!param.color_4) {
        param.color_4 = "";
    }

    if (!param.color_5) {
        param.color_5 = "";
    }

    //====================================================================//
    // GENERAL
    //====================================================================//
    repStyleObj.addStyle(".pageReset", "counter-reset: page");
    repStyleObj.addStyle("body", "font-size: 12pt; font-family:" + param.font_family);
    repStyleObj.addStyle(".logo", "font-size: 24pt");
    repStyleObj.addStyle(".bigLogo", "font-size: 36pt; color:"  + param.color_1);
    repStyleObj.addStyle(".company_name", "font-size: 9pt");
    repStyleObj.addStyle(".info", "font-size: 10pt");
    repStyleObj.addStyle(".bold", "font-weight: bold");
 
    repStyleObj.addStyle(".horizontalLine-black", "border-top : thin solid #000000");
    repStyleObj.addStyle(".horizontalLineTotal-black", "border-bottom : 1px double #000000; padding-bottom:5px");

    repStyleObj.addStyle(".center", "text-align:center");
    repStyleObj.addStyle(".amount", "text-align:right");
    repStyleObj.addStyle(".description2", "font-size: 8pt;");
    repStyleObj.addStyle(".subtotal_cell", "font-weight:bold;");

    repStyleObj.addStyle(".border-left-black", "border-left:thin solid #000000");
    repStyleObj.addStyle(".border-right-black", "border-right:thin solid #000000");
    repStyleObj.addStyle(".border-top-black", "border-top:thin solid #000000");
    repStyleObj.addStyle(".border-bottom-black", "border-bottom:thin solid #000000");

    repStyleObj.addStyle(".fontSize17", "font-size:17pt");
    repStyleObj.addStyle(".padding-top", "padding-top:5px");
    repStyleObj.addStyle(".padding-right", "padding-right:5px");
    repStyleObj.addStyle(".padding-bottom", "padding-bottom:5px");
    repStyleObj.addStyle(".padding-left", "padding-left:5px");
    repStyleObj.addStyle(".timeNewRoman", "font-family:Times New Roman");
    repStyleObj.addStyle(".headerCol1", "width:35pt");
    repStyleObj.addStyle(".infoCol1", "width:129pt");
    repStyleObj.addStyle(".infoCol2", "width:129pt");
    repStyleObj.addStyle(".evenRowsBackgroundColor", "background-color: " + param.color_3);

    repStyleObj.addStyle(".repTableCol1","width:45%");
    repStyleObj.addStyle(".repTableCol2","width:15%");
    repStyleObj.addStyle(".repTableCol3","width:20%");
    repStyleObj.addStyle(".repTableCol4","width:20%");

    var resetCounterStyle = repStyleObj.addStyle(".reset-counter-page");
    resetCounterStyle.setAttribute("counter-reset", "page");

    var symbolStyle = repStyleObj.addStyle(".symbol")
    symbolStyle.setAttribute("font-size", "50pt");
    symbolStyle.setAttribute("font-family", "Californian FB");
    symbolStyle.setAttribute("text-align", "left");
    symbolStyle.setAttribute("color", param.color_1);
    symbolStyle.setAttribute("background-color", param.color_2);
    symbolStyle.setAttribute("font-weight", "bold");
    
    //Logo
    var logoStyle = repStyleObj.addStyle(".logoStyle");
    logoStyle.setAttribute("width", "100pt");
    logoStyle.setAttribute("height", "100pt");

    //Greetings 
    var bottomStyle = repStyleObj.addStyle(".bottom");
    bottomStyle.setAttribute("padding-top","2em");

    //Signature
    var signatureStyle = repStyleObj.addStyle(".signature");
    signatureStyle.setAttribute("padding-top","1.5em");


    //====================================================================//
    // 3. ADDRESS
    //====================================================================//

    /*
        Address 2: "BILL TO"
    */
    var addressStyle1 = repStyleObj.addStyle( ".address_invoice");
    addressStyle1.setAttribute("position", "absolute");
    addressStyle1.setAttribute("top", "85mm");
    addressStyle1.setAttribute("left", "20mm");
    addressStyle1.setAttribute("width", "80mm");
    addressStyle1.setAttribute("height", "30mm");
    //addressStyle1.setAttribute("overflow-shrink-max", "0.6");
    //addressStyle1.setAttribute("overflow", "shrink");
    addressStyle1.setAttribute("font-size", "10px");

    /*
        Address 3: "SHIPPING TO"
    */
    var addressStyle2 = repStyleObj.addStyle( ".address_shipping");
    addressStyle2.setAttribute("position", "absolute");
    addressStyle2.setAttribute("top", "50mm");
    addressStyle2.setAttribute("left", "20mm");
    addressStyle2.setAttribute("width", "80mm");
    addressStyle2.setAttribute("height", "30mm");
    //addressStyle2.setAttribute("overflow-shrink-max", "0.6");
    //addressStyle2.setAttribute("overflow", "shrink");
    addressStyle2.setAttribute("font-size", "10px");

    /* 
      Text begin
    */
    var beginStyle = repStyleObj.addStyle(".begin_text");
    beginStyle.setAttribute("position", "absolute");
    beginStyle.setAttribute("top", "100mm");
    beginStyle.setAttribute("left", "20mm");
    beginStyle.setAttribute("right", "10mm");
    beginStyle.setAttribute("font-size", "10px");

    //====================================================================//
    // 4. TABLE ITEMS
    //====================================================================//
    
    /*
        Table header
    */
    var headerStyle = repStyleObj.addStyle(".header_table");
    headerStyle.setAttribute("position", "absolute");
    headerStyle.setAttribute("margin-top", "4mm"); //106
    headerStyle.setAttribute("margin-left", "22mm"); //20
    headerStyle.setAttribute("margin-right", "10mm");
    //repStyleObj.addStyle("table.header_table td", "border: thin solid black");
    headerStyle.setAttribute("width", "100%");


    /*
        Table info invoice
    */
    var infoStyle = repStyleObj.addStyle(".info_table");
    infoStyle.setAttribute("position", "absolute");
    infoStyle.setAttribute("margin-top", "50mm");
    infoStyle.setAttribute("margin-left", "110mm");
    infoStyle.setAttribute("margin-right", "10mm");
    repStyleObj.addStyle("table.info_table td", "border: thin solid black");
    //infoStyle.setAttribute("width", "100%");
    infoStyle.setAttribute("font-size", "10pt");

    var infoStyle = repStyleObj.addStyle(".info_table_row0");
    infoStyle.setAttribute("position", "absolute");
    infoStyle.setAttribute("margin-top", "10mm");
    infoStyle.setAttribute("margin-left", "110mm");
    infoStyle.setAttribute("margin-right", "10mm");
    repStyleObj.addStyle("table.info_table_row0 td", "border: thin solid black");
    //infoStyle.setAttribute("width", "100%");
    infoStyle.setAttribute("font-size", "10pt");

    var infoStyle = repStyleObj.addStyle("@page:first-view table.info_table_row0");
    infoStyle.setAttribute("display", "none");

    /*
        Table 1: 
    */
    var itemsStyle = repStyleObj.addStyle(".doc_table:first-view");
    itemsStyle.setAttribute("margin-top", "135mm"); //106

    var itemsStyle = repStyleObj.addStyle(".doc_table");
    //itemsStyle.setAttribute("position", "absolute");
    itemsStyle.setAttribute("margin-top", "50mm"); //106
    itemsStyle.setAttribute("margin-left", "23mm"); //20
    itemsStyle.setAttribute("margin-right", "10mm");
    //itemsStyle.setAttribute("page-break-before", "avoid");
    //repStyleObj.addStyle("table.doc_table td", "padding: 3px;");
    // repStyleObj.addStyle("table.doc_table td", "border: thin solid black;");
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
    texts.param_color_1 = 'Colore testo intestazione';
    texts.param_color_2 = 'Colore sfondo intestazione';
    texts.param_color_3 = 'Colore sfondo righe';
    texts.param_font_family = 'Tipo carattere';
    texts.param_print_header = 'Includi intestazione pagina (1=si, 0=no)';
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
    texts.param_color_1 = 'Farbe des Kopfzeilentextes';
    texts.param_color_2 = 'Kopfzeile Hintergrundfarbe';
    texts.param_color_3 = 'Zeilen Hintergrundfarbe';
    texts.param_font_family = 'Typ Schriftzeichen';
    texts.param_print_header = 'Seitenüberschrift einschliessen (1=ja, 0=nein)';
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
    texts.param_color_1 = "Couleur du texte de l'en-tête";
    texts.param_color_2 = "Couleur de fond de l'en-tête";
    texts.param_color_3 = "Couleur de fond des lignes";
    texts.param_font_family = 'Type caractère';
    texts.param_print_header = 'Inclure en-tête de page (1=oui, 0=non)';
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
    texts.param_color_1 = '页眉文本颜色';
    texts.param_color_2 = '页眉背景色';
    texts.param_color_3 = '行背景色';
    texts.param_font_family = '字体类型';
    texts.param_print_header = '包括页眉 (1=是, 0=否)';
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
    texts.param_color_1 = 'Hoofdtekst kleur';
    texts.param_color_2 = 'Kopkop achtergrondkleur';
    texts.param_color_3 = 'Rijen achtergrondkleur';
    texts.param_font_family = 'Lettertype';
    texts.param_print_header = 'Pagina-koptekst opnemen (1=ja, 0=nee)';
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
    texts.param_color_1 = 'Header text color';
    texts.param_color_2 = 'Header background color';
    texts.param_color_3 = 'Rows background color';
    texts.param_font_family = 'Font type';
    texts.param_print_header = 'Include page header (1=yes, 0=no)';
    texts.payment_due_date_label = 'Due date';
    texts.payment_terms_label = 'Payment';
    //texts.param_max_items_per_page = 'Number of items on each page';
  }
  return texts;
}
