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
// @pubdate = 2019-05-28
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




  /*

  
  1) Funzione "print_info()"  e   print_begin_text()

    Come fare per il TITOLO? 
    Di default usiamo "Invoice" e poi l'utente può cambiarlo manualmente?
    getTitle(invoiceObj, texts)


  2) Indirizzo spedizione

      "shipping_info":{
         "address1":"Via Cccccc 7",
         "city":"Paese xx",
         "courtesy":"Sig.",
         "different_shipping_address":true,
         "first_name":"Aaaa",
         "last_name":"Bbbb",
         "postal_code":"9999"
      },

  3) Logo
     vedere se inserire nei parametri il nome del logo


  */







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
  /* array of script's parameters */
  convertedParam.data = [];


  /*
  * INCLUDE
  */
  var currentParam = {};
  currentParam.name = 'include';
  currentParam.title = texts.param_include;
  currentParam.type = 'string';
  currentParam.value = '';
  currentParam.editable = false;
  currentParam.readValue = function() {
    param.include = this.value;
  }
  convertedParam.data.push(currentParam);

  var currentParam = {};
  currentParam.name = 'include_header';
  currentParam.parentObject = 'include';
  currentParam.title = texts.param_include_header;
  currentParam.type = 'string';
  currentParam.value = '';
  currentParam.editable = false;
  currentParam.readValue = function() {
    param.include_header = this.value;
  }
  convertedParam.data.push(currentParam);

  var currentParam = {};
  currentParam.name = 'print_header';
  currentParam.parentObject = 'include_header';
  currentParam.title = texts.param_print_header;
  currentParam.type = 'bool';
  currentParam.value = param.print_header ? true : false;
  currentParam.defaultvalue = true;
  currentParam.tooltip = texts.param_tooltip_print_header;
  currentParam.readValue = function() {
    param.print_header = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'header_row_1';
  currentParam.parentObject = 'include_header';
  currentParam.title = texts.param_header_row_1;
  currentParam.type = 'string';
  currentParam.value = param.header_row_1 ? param.header_row_1 : '';
  currentParam.defaultvalue = "";
  currentParam.tooltip = texts.param_tooltip_header_row_1;
  currentParam.readValue = function() {
    param.header_row_1 = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'header_row_2';
  currentParam.parentObject = 'include_header';
  currentParam.title = texts.param_header_row_2;
  currentParam.type = 'string';
  currentParam.value = param.header_row_2 ? param.header_row_2 : '';
  currentParam.defaultvalue = "";
  currentParam.tooltip = texts.param_tooltip_header_row_2;
  currentParam.readValue = function() {
    param.header_row_2 = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'header_row_3';
  currentParam.parentObject = 'include_header';
  currentParam.title = texts.param_header_row_3;
  currentParam.type = 'string';
  currentParam.value = param.header_row_3 ? param.header_row_3 : '';
  currentParam.defaultvalue = "";
  currentParam.tooltip = texts.param_tooltip_header_row_3;
  currentParam.readValue = function() {
    param.header_row_3 = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'header_row_4';
  currentParam.parentObject = 'include_header';
  currentParam.title = texts.param_header_row_4;
  currentParam.type = 'string';
  currentParam.value = param.header_row_4 ? param.header_row_4 : '';
  currentParam.defaultvalue = "";
  currentParam.tooltip = texts.param_tooltip_header_row_4;
  currentParam.readValue = function() {
    param.header_row_4 = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'header_row_5';
  currentParam.parentObject = 'include_header';
  currentParam.title = texts.param_header_row_5;
  currentParam.type = 'string';
  currentParam.value = param.header_row_5 ? param.header_row_5 : '';
  currentParam.defaultvalue = "";
  currentParam.tooltip = texts.param_tooltip_header_row_5;
  currentParam.readValue = function() {
    param.header_row_5 = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'print_logo';
  currentParam.parentObject = 'include_header';
  currentParam.title = texts.param_print_logo;
  currentParam.type = 'bool';
  currentParam.value = param.print_logo ? true : false;
  currentParam.defaultvalue = false;
  currentParam.tooltip = texts.param_tooltip_print_logo;
  currentParam.readValue = function() {
    param.print_logo = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'logo_name';
  currentParam.parentObject = 'include_header';
  currentParam.title = texts.param_logo_name;
  currentParam.type = 'string';
  currentParam.value = param.logo_name ? param.logo_name : '';
  currentParam.defaultvalue = "Logo";
  currentParam.tooltip = texts.param_tooltip_logo_name;
  currentParam.readValue = function() {
    param.logo_name = this.value;
  }
  convertedParam.data.push(currentParam);

  var currentParam = {};
  currentParam.name = 'include_address';
  currentParam.parentObject = 'include';
  currentParam.title = texts.param_include_address;
  currentParam.type = 'string';
  currentParam.value = '';
  currentParam.editable = false;
  currentParam.readValue = function() {
    param.include_address = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'small_address_line';
  currentParam.parentObject = 'include_address';
  currentParam.title = texts.param_small_address_line;
  currentParam.type = 'string';
  currentParam.value = param.small_address_line ? param.small_address_line : '';
  currentParam.defaultvalue = '';
  currentParam.tooltip = texts.param_tooltip_small_address_line;
  currentParam.readValue = function() {
   param.small_address_line = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'address_left';
  currentParam.parentObject = 'include_address';
  currentParam.title = texts.param_address_left;
  currentParam.type = 'bool';
  currentParam.value = param.address_left ? true : false;
  currentParam.defaultvalue = false;
  currentParam.tooltip = texts.param_tooltip_address_left;
  currentParam.readValue = function() {
   param.address_left = this.value;
  }
  convertedParam.data.push(currentParam);
  
  var currentParam = {};
  currentParam.name = 'include_info';
  currentParam.parentObject = 'include';
  currentParam.title = texts.param_include_info;
  currentParam.type = 'string';
  currentParam.value = '';
  currentParam.editable = false;
  currentParam.readValue = function() {
    param.include_info = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'info_invoice_number';
  currentParam.parentObject = 'include_info';
  currentParam.title = texts.param_info_invoice_number;
  currentParam.type = 'bool';
  currentParam.value = param.info_invoice_number ? true : false;
  currentParam.defaultvalue = true;
  currentParam.tooltip = texts.param_tooltip_info_invoice_number;
  currentParam.readValue = function() {
    param.info_invoice_number = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'info_date';
  currentParam.parentObject = 'include_info';
  currentParam.title = texts.param_info_date;
  currentParam.type = 'bool';
  currentParam.value = param.info_date ? true : false;
  currentParam.defaultvalue = true;
  currentParam.tooltip = texts.param_tooltip_info_date;
  currentParam.readValue = function() {
    param.info_date = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'info_customer';
  currentParam.parentObject = 'include_info';
  currentParam.title = texts.param_info_customer;
  currentParam.type = 'bool';
  currentParam.value = param.info_customer ? true : false;
  currentParam.defaultvalue = true;
  currentParam.tooltip = texts.param_tooltip_info_customer;
  currentParam.readValue = function() {
    param.info_customer = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'info_due_date';
  currentParam.parentObject = 'include_info';
  currentParam.title = texts.param_info_due_date;
  currentParam.type = 'bool';
  currentParam.value = param.info_due_date ? true : false;
  currentParam.defaultvalue = true;
  currentParam.tooltip = texts.param_tooltip_info_due_date;
  currentParam.readValue = function() {
    param.info_due_date = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'info_page';
  currentParam.parentObject = 'include_info';
  currentParam.title = texts.param_info_page;
  currentParam.type = 'bool';
  currentParam.value = param.info_page ? true : false;
  currentParam.defaultvalue = true;
  currentParam.tooltip = texts.param_tooltip_info_page;
  currentParam.readValue = function() {
    param.info_page = this.value;
  }
  convertedParam.data.push(currentParam);


  var currentParam = {};
  currentParam.name = 'include_details';
  currentParam.parentObject = 'include';
  currentParam.title = texts.param_include_details;
  currentParam.type = 'string';
  currentParam.value = '';
  currentParam.editable = false;
  currentParam.readValue = function() {
    param.include_details = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'items_invoice_details';
  currentParam.parentObject = 'include_details';
  currentParam.title = texts.param_items_invoice_details;
  currentParam.type = 'string';
  currentParam.value = param.items_invoice_details ? param.items_invoice_details : '';
  currentParam.defaultvalue = texts.description+";"+texts.quantity+";"+texts.reference_unit+";"+texts.unit_price+";"+texts.amount;
  currentParam.tooltip = texts.param_tooltip_items_invoice_details;
  currentParam.readValue = function() {
    param.items_invoice_details = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'items_invoice_details_dimensions';
  currentParam.parentObject = 'include_details';
  currentParam.title = texts.param_items_invoice_details_dimensions;
  currentParam.type = 'string';
  currentParam.value = param.items_invoice_details_dimensions ? param.items_invoice_details_dimensions : '';
  currentParam.defaultvalue = '50%;10%;10%;15%;15%';
  currentParam.tooltip = texts.param_tooltip_items_invoice_details_dimensions;
  currentParam.readValue = function() {
    param.items_invoice_details_dimensions = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'details_net_amounts';
  currentParam.parentObject = 'include_details';
  currentParam.title = texts.param_details_net_amounts;
  currentParam.type = 'bool';
  currentParam.value = param.details_net_amounts ? true : false;
  currentParam.defaultvalue = false;
  currentParam.tooltip = texts.param_tooltip_details_net_amounts;
  currentParam.readValue = function() {
   param.details_net_amounts = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'details_gross_amounts';
  currentParam.parentObject = 'include_details';
  currentParam.title = texts.param_details_gross_amounts;
  currentParam.type = 'bool';
  currentParam.value = param.details_gross_amounts ? true : false;
  currentParam.defaultvalue = false;
  currentParam.tooltip = texts.param_tooltip_details_gross_amounts;
  currentParam.readValue = function() {
   param.details_gross_amounts = this.value;
  }
  convertedParam.data.push(currentParam);

  // currentParam = {};
  // currentParam.name = 'invoice_details_without_vat';
  // currentParam.parentObject = 'include_details';
  // currentParam.title = texts.param_invoice_details_without_vat;
  // currentParam.type = 'bool';
  // currentParam.value = param.invoice_details_without_vat ? true : false;
  // currentParam.defaultvalue = false;
  // currentParam.tooltip = texts.param_tooltip_invoice_details_without_vat;
  // currentParam.readValue = function() {
  //  param.invoice_details_without_vat = this.value;
  // }
  // convertedParam.data.push(currentParam);

  var currentParam = {};
  currentParam.name = 'include_footer';
  currentParam.parentObject = 'include';
  currentParam.title = texts.param_include_footer;
  currentParam.type = 'string';
  currentParam.value = '';
  currentParam.editable = false;
  currentParam.readValue = function() {
    param.include_footer = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'add_footer';
  currentParam.parentObject = 'include_footer';
  currentParam.title = texts.param_add_footer;
  currentParam.type = 'bool';
  currentParam.value = param.add_footer ? true : false;
  currentParam.defaultvalue = false;
  currentParam.tooltip = texts.add_footer;
  currentParam.readValue = function() {
   param.add_footer = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'footer_left';
  currentParam.parentObject = 'include_footer';
  currentParam.title = texts.param_footer_left;
  currentParam.type = 'string';
  currentParam.value = param.footer_left ? param.footer_left : '';
  currentParam.defaultvalue = '';
  currentParam.tooltip = texts.param_tooltip_footer;
  currentParam.readValue = function() {
   param.footer_left = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'footer_center';
  currentParam.parentObject = 'include_footer';
  currentParam.title = texts.param_footer_center;
  currentParam.type = 'string';
  currentParam.value = param.footer_center ? param.footer_center : '';
  currentParam.defaultvalue = '';
  currentParam.tooltip = texts.param_tooltip_footer;
  currentParam.readValue = function() {
   param.footer_center = this.value;
  }
  convertedParam.data.push(currentParam); 

  currentParam = {};
  currentParam.name = 'footer_right';
  currentParam.parentObject = 'include_footer';
  currentParam.title = texts.param_footer_right;
  currentParam.type = 'string';
  currentParam.value = param.footer_right ? param.footer_right : '';
  currentParam.defaultvalue = '';
  currentParam.tooltip = texts.param_tooltip_footer;
  currentParam.readValue = function() {
   param.footer_right = this.value;
  }
  convertedParam.data.push(currentParam);



  /*
  * TEXTS
  */
  var currentParam = {};
  currentParam.name = 'texts';
  currentParam.title = texts.param_texts;
  currentParam.type = 'string';
  currentParam.value = '';
  currentParam.editable = false;
  currentParam.readValue = function() {
    param.texts = this.value;
  }
  convertedParam.data.push(currentParam);

  var currentParam = {};
  currentParam.name = 'texts_language';
  currentParam.parentObject = 'texts';
  currentParam.title = texts.param_texts_language;
  currentParam.type = 'string';
  currentParam.value = '';
  currentParam.editable = false;
  currentParam.readValue = function() {
    param.texts_language = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'texts_info_invoice_number_text';
  currentParam.parentObject = 'texts_language';
  currentParam.title = texts.param_texts_info_invoice_number_text;
  currentParam.type = 'string';
  currentParam.value = param.texts_info_invoice_number_text ? param.texts_info_invoice_number_text : '';
  currentParam.defaultvalue = texts.invoice;
  currentParam.tooltip = texts.param_tooltip_texts_info_invoice_number_text;
  currentParam.readValue = function() {
    param.texts_info_invoice_number_text = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'texts_info_date_text';
  currentParam.parentObject = 'texts_language';
  currentParam.title = texts.param_texts_info_date_text;
  currentParam.type = 'string';
  currentParam.value = param.texts_info_date_text ? param.texts_info_date_text : '';
  currentParam.defaultvalue = texts.date;
  currentParam.tooltip = texts.param_tooltip_texts_info_date_text;
  currentParam.readValue = function() {
    param.texts_info_date_text = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'texts_info_customer_text';
  currentParam.parentObject = 'texts_language';
  currentParam.title = texts.param_texts_info_customer_text;
  currentParam.type = 'string';
  currentParam.value = param.texts_info_customer_text ? param.texts_info_customer_text : '';
  currentParam.defaultvalue = texts.customer;
  currentParam.tooltip = texts.param_tooltip_texts_info_customer_text;
  currentParam.readValue = function() {
    param.texts_info_customer_text = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'texts_info_due_date_text';
  currentParam.parentObject = 'texts_language';
  currentParam.title = texts.param_texts_info_due_date_text;
  currentParam.type = 'string';
  currentParam.value = param.texts_info_due_date_text ? param.texts_info_due_date_text : '';
  currentParam.defaultvalue = texts.payment_terms_label;
  currentParam.tooltip = texts.param_tooltip_texts_payment_terms_label;
  currentParam.readValue = function() {
    param.texts_info_due_date_text = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'texts_info_page_text';
  currentParam.parentObject = 'texts_language';
  currentParam.title = texts.param_texts_info_page_text;
  currentParam.type = 'string';
  currentParam.value = param.texts_info_page_text ? param.texts_info_page_text : '';
  currentParam.defaultvalue = texts.page;
  currentParam.tooltip = texts.param_tooltip_texts_info_page_text;
  currentParam.readValue = function() {
    param.texts_info_page_text = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'title';
  currentParam.parentObject = 'texts_language';
  currentParam.title = texts.param_title;
  currentParam.type = 'string';
  currentParam.value = param.title ? param.title : '';
  currentParam.defaultvalue = texts.invoice;
  currentParam.tooltip = texts.param_tooltip_title;
  currentParam.readValue = function() {
    param.title = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'texts_items_details_columns';
  currentParam.parentObject = 'texts_language';
  currentParam.title = texts.param_texts_items_details_columns;
  currentParam.type = 'string';
  currentParam.value = param.texts_items_details_columns ? param.texts_items_details_columns : '';
  currentParam.defaultvalue = texts.description+";"+texts.quantity+";"+texts.reference_unit+";"+texts.unit_price+";"+texts.amount;
  currentParam.tooltip = texts.param_tooltip_texts_items_details_columns;
  currentParam.readValue = function() {
    param.texts_items_details_columns = this.value;
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
  currentParam.value = param.font_family ? param.font_family : 'Helvetica';
  currentParam.defaultvalue = 'Helvetica';
  currentParam.tooltip = texts.param_tooltip_font_family;
  currentParam.readValue = function() {
   param.font_family = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'font_size';
  currentParam.parentObject = 'styles';
  currentParam.title = texts.param_font_size;
  currentParam.type = 'string';
  currentParam.value = param.font_size ? param.font_size : '10';
  currentParam.defaultvalue = '10';
  currentParam.tooltip = texts.param_tooltip_font_size;
  currentParam.readValue = function() {
   param.font_size = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'color_1';
  currentParam.parentObject = 'styles';
  currentParam.title = texts.param_color_1;
  currentParam.type = 'string';
  currentParam.value = param.color_1 ? param.color_1 : '#337ab7';
  currentParam.defaultvalue = '#337ab7';
  currentParam.tooltip = texts.param_tooltip_color_1;
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
  currentParam.defaultvalue = '#ffffff';
  currentParam.tooltip = texts.param_tooltip_color_2;
  currentParam.readValue = function() {
   param.color_2 = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'color_3';
  currentParam.parentObject = 'styles';
  currentParam.title = texts.param_color_3;
  currentParam.type = 'string';
  currentParam.value = param.color_3 ? param.color_3 : '#F0F8FF';
  currentParam.defaultvalue = '#F0F8FF';
  currentParam.tooltip = texts.param_tooltip_color_3;
  currentParam.readValue = function() {
   param.color_3 = this.value;
  }
  convertedParam.data.push(currentParam);

  var currentParam = {};
  currentParam.name = 'styles_margins';
  currentParam.parentObject = 'styles';
  currentParam.title = texts.param_styles_margins;
  currentParam.type = 'string';
  currentParam.value = '';
  currentParam.editable = false;
  currentParam.readValue = function() {
    param.styles_margins = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'address_margin_left';
  currentParam.parentObject = 'styles_margins';
  currentParam.title = texts.param_address_margin_left;
  currentParam.type = 'string';
  currentParam.value = param.address_margin_left ? param.address_margin_left : '113';
  currentParam.defaultvalue = '113';
  currentParam.tooltip = texts.param_tooltip_address_margin_left;
  currentParam.readValue = function() {
   param.address_margin_left = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'address_margin_top';
  currentParam.parentObject = 'styles_margins';
  currentParam.title = texts.param_address_margin_top;
  currentParam.type = 'string';
  currentParam.value = param.address_margin_top ? param.address_margin_top : '45';
  currentParam.defaultvalue = '45';
  currentParam.tooltip = texts.param_tooltip_address_margin_top;
  currentParam.readValue = function() {
   param.address_margin_top = this.value;
  }
  convertedParam.data.push(currentParam);


  /*
  * EMBEDDED JAVASCRIPT FILEE
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
  currentParam.defaultvalue = '';
  currentParam.tooltip = texts.param_tooltip_javascript_filename;
  currentParam.readValue = function() {
   param.custom_javascript_filename = this.value;
  }
  convertedParam.data.push(currentParam);


  /*
  * LANGUAGE
  */
  // var currentParam = {};
  // currentParam.name = 'language';
  // currentParam.title = texts.param_language;
  // currentParam.type = 'string';
  // currentParam.value = '';
  // currentParam.editable = false;
  // currentParam.readValue = function() {
  //   param.param_language = this.value;
  // }
  // convertedParam.data.push(currentParam);

  // currentParam = {};
  // currentParam.name = 'language_new';
  // currentParam.parentObject = 'language';
  // currentParam.title = texts.param_language_new;
  // currentParam.type = 'string';
  // currentParam.value = param.language_new ? param.language_new : '';
  // currentParam.readValue = function() {
  //   param.language_new = this.value;
  // }
  // convertedParam.data.push(currentParam);


  var currentParam = {};
  currentParam.name = 'qr_code';
  currentParam.title = texts.param_qr_code;
  currentParam.type = 'string';
  currentParam.value = '';
  currentParam.editable = false;
  currentParam.readValue = function() {
    param.qr_code = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'add_qr_code';
  currentParam.parentObject = 'qr_code';
  currentParam.title = texts.param_add_qr_code;
  currentParam.type = 'bool';
  currentParam.value = param.add_qr_code ? true : false;
  currentParam.defaultvalue = false;
  currentParam.tooltip = texts.param_tooltip_add_qr_code;
  currentParam.readValue = function() {
   param.add_qr_code = this.value;
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

  //Include
  param.print_header = true;
  param.print_logo = true;
  param.logo_name = 'Logo';
  param.small_address_line = '';
  param.address_left = false;
  param.info_invoice_number = true;
  param.info_date = true;
  param.info_customer = true;
  param.info_due_date = true;
  param.info_page = true;
  param.items_invoice_details = texts.description+";"+texts.qty+";"+texts.unit+";"+texts.unit_price+";"+texts.total;
  param.items_invoice_details_dimensions = '50%;10%;10%;15%;15%';
  param.details_net_amounts = false;
  param.details_gross_amounts = false;
  // param.invoice_details_without_vat = false;
  param_add_footer = false;
  param_footer_left = '';
  param_footer_center = '';
  param_footer_right = '';

  //Texts
  param.header_row_1 = "";
  param.header_row_2 = "";
  param.header_row_3 = "";
  param.header_row_4 = "";
  param.header_row_5 = "";
  param.texts_info_invoice_number_text = texts.invoice;
  param.texts_info_date_text = texts.date;
  param.texts_info_customer_text = texts.customer;
  param.texts_info_due_date_text = texts.payment_terms_label;
  param.texts_info_page_text = texts.page;
  param.title = texts.invoice;
  param.texts_items_details_columns = texts.description+";"+texts.qty+";"+texts.unit+";"+texts.unit_price+";"+texts.total;

  //Styles
  param.color_1 = '#337ab7';
  param.color_2 = '#ffffff';
  param.color_3 = '#F0F8FF';
  param.color_4 = '';
  param.font_family = 'Helvetica';
  param.font_size = '10';
  param.address_margin_left = '113';
  param.address_margin_top = '45';

  //Embedded JavaScript file
  param.custom_javascript_filename = '';

  //QR Code
  param.add_qr_code = false;

  //Language
  //param.language_new = '';

  return param;
}

function verifyParam(param) {

  var lang = 'en';
  if (Banana.document.locale)
    lang = Banana.document.locale;
  if (lang.length > 2)
    lang = lang.substr(0, 2);
  var texts = setInvoiceTexts(lang);

  //Include
  if (!param.print_header) {
    param.print_header = false;
  }
  if (!param.print_logo) {
    param.print_logo = false;
  }
  if (!param.logo_name) {
    param.logo_name = 'Logo';
  }
  if (!param.small_address_line) {
    param.small_address_line = '';
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
  if (!param.items_invoice_details) {
    param.items_invoice_details = texts.description+";"+texts.quantity+";"+texts.reference_unit+";"+texts.unit_price+";"+texts.amount;
  }
  if (!param.items_invoice_details_dimensions) {
    param.items_invoice_details_dimensions = '50%;10%;10%;15%;15%';
  }
  if (!param.details_net_amounts) {
    param.details_net_amounts = false;
  }
  if (!param.details_gross_amounts) {
    param.details_gross_amounts = false;
  }
  if (param.details_net_amounts && param.details_gross_amounts) {
    param.details_net_amounts = false;
    param.details_gross_amounts = true;
  }
  if (!param.details_net_amounts && !param.details_gross_amounts) {
    param.details_net_amounts = false;
    param.details_gross_amounts = true;
  }
  // if (!param.invoice_details_without_vat) {
  //   param.invoice_details_without_vat = false;
  // }
  if (!param.add_footer) {
    param.add_footer = false;
  }
  if (!param.footer_left) {
    param.footer_left = '';
  }
  if (!param.footer_center) {
    param.footer_center = '';
  }
  if (!param.footer_right) {
    param.footer_right = '';
  }



  //Texts
  if(!param.header_row_1) {
    param.header_row_1 = '';
  }
  if(!param.header_row_2) {
    param.header_row_2 = '';
  }
  if(!param.header_row_3) {
    param.header_row_3 = '';
  }
  if(!param.header_row_4) {
    param.header_row_4 = '';
  }
  if(!param.header_row_5) {
    param.header_row_5 = '';
  }
  if (!param.texts_info_invoice_number_text) {
    param.texts_info_invoice_number_text = texts.invoice;
  }
  if (!param.texts_info_date_text) {
    param.texts_info_date_text = texts.date;
  }
  if (!param.texts_info_customer_text) {
    param.texts_info_customer_text = texts.customer;
  }
  if (!param.texts_info_due_date_text) {
    param.texts_info_due_date_text = texts.payment_terms_label;
  }
  if (!param.texts_info_page_text) {
    param.texts_info_page_text = texts.page;
  }
  if (!param.title) {
    param.title = '';
  }
  if (!param.texts_items_details_columns) {
    param.texts_items_details_columns = texts.description+";"+texts.quantity+";"+texts.reference_unit+";"+texts.unit_price+";"+texts.amount;
  }



  // Styles
  if (!param.color_1) {
    param.color_1 = '#337ab7';
  }
  if (!param.color_2) {
    param.color_2 = '#ffffff';
  }
  if (!param.color_3) {
    param.color_3 = '#F0F8FF';
  }
  if (!param.color_4) {
    param.color_4 = '';
  }
  if (!param.font_family) {
    param.font_family = 'Helvetica';
  }
  if (!param.font_size) {
    param.font_size = '10';
  }
  if (!param.address_margin_left) {
    param.address_margin_left = '113';
  }
  if (!param.address_margin_top) {
    param.address_margin_top = '45';
  }

  //Embedded JavaScript files
  if (!param.custom_javascript_filename) {
    param.custom_javascript_filename = '';
  }

  //Language
  // if (!param.language_new) {
  //   param.language_new = '';
  // }

  //QR Code
  if(!param.add_qr_code) {
    param.add_qr_code = false;
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
          print_info(repDocObj, invoiceObj, texts, param, "");
          print_customer_address(repDocObj, invoiceObj, param);
          print_text_begin(repDocObj, invoiceObj, param);
          print_info(repDocObj.getHeader(), invoiceObj, texts, "info_table_row0");

          if (param.details_net_amounts) {
            print_details_net_amounts(repDocObj, invoiceObj, texts, param);
            print_details_net_amounts_totals(repDocObj, invoiceObj, texts, param);
          }
          else if (param.details_gross_amounts) {
            print_details_gross_amounts(repDocObj, invoiceObj, texts, param);
            print_details_gross_amounts_totals(repDocObj, invoiceObj, texts, param);
          }
          // else if (param.invoice_details_without_vat) {
          //   print_details_without_vat(repDocObj, invoiceObj, texts, param);
          //   print_details_total_without_vat(repDocObj, invoiceObj, texts, param);
          // }

          if (param.add_qr_code) {
            print_qr_code(repDocObj, invoiceObj, texts, param);
          }

          print_final_text(repDocObj, invoiceObj);
          print_notes(repDocObj, invoiceObj);
          print_greetings(repDocObj, invoiceObj);
          if (param.add_footer) {
            print_footer(repDocObj, param);
          }
        }
      }
    }
  }

  /* Header */
  if (typeof(hook_print_header) === typeof(Function)) {
    hook_print_header(repDocObj);
  } else {
    print_header(repDocObj, param, repStyleObj, invoiceObj);
  }

  /* Invoice texts info */
  if (typeof(hook_print_info) === typeof(Function)) {
    hook_print_info(repDocObj, invoiceObj, texts, param);
  } else {
    print_info(repDocObj, invoiceObj, texts, param);
  }

  /* Customer address */
  if (typeof(hook_print_customer_address) === typeof(Function)) {
    hook_print_customer_address(repDocObj, invoiceObj, param);
  } else {
    print_customer_address(repDocObj, invoiceObj, param);
  }

  /* Begin text (before invoice details table) */
  if (typeof(hook_print_text_begin) === typeof(Function)) {
    hook_print_text_begin(repDocObj, invoiceObj, param);
  } else {
    print_text_begin(repDocObj, invoiceObj, param);
  }

  /* Invoice texts info for pages 2+ */
  if (typeof(hook_print_info) === typeof(Function)) {
    hook_print_info(repDocObj.getHeader(), invoiceObj, texts, param, "info_table_row0");
  } else {
    print_info(repDocObj.getHeader(), invoiceObj, texts, param, "info_table_row0");
  }

  /* Invoice details with all the items and amounts */
  /* Invoice details total rows */
  if (param.details_net_amounts) {  
    if (typeof(hook_print_details_net_amounts) === typeof(Function)) {
      hook_print_details_net_amounts(repDocObj, invoiceObj, texts, param);
    } else {
      print_details_net_amounts(repDocObj, invoiceObj, texts, param);
    }
    if (typeof(hook_print_details_net_amounts_totals) === typeof(Function)) {
      hook_print_details_net_amounts_totals(repDocObj, invoiceObj, texts, param);
    } else {
      print_details_net_amounts_totals(repDocObj, invoiceObj, texts, param);
    }
  }
  else if (param.details_gross_amounts) {
    if (typeof(hook_print_details_gross_amounts) === typeof(Function)) {
      hook_print_details_gross_amounts(repDocObj, invoiceObj, texts, param);
    } else {
      print_details_gross_amounts(repDocObj, invoiceObj, texts, param);
    }
    if (typeof(hook_print_details_gross_amounts_totals) === typeof(Function)) {
      hook_print_details_gross_amounts_totals(repDocObj, invoiceObj, texts, param);
    } else {
      print_details_gross_amounts_totals(repDocObj, invoiceObj, texts, param);
    }
  }
  // else if (param.invoice_details_without_vat) {
  //   if (typeof(hook_print_details_without_vat) === typeof(Function)) {
  //     hook_print_details_without_vat(repDocObj, invoiceObj, texts, param);
  //   } else {
  //     print_details_without_vat(repDocObj, invoiceObj, texts, param);
  //   }
  //   if (typeof(hook_print_details_total_without_vat) === typeof(Function)) {
  //     hook_print_details_total_without_vat(repDocObj, invoiceObj, texts, param);
  //   } else {
  //     print_details_total_without_vat(repDocObj, invoiceObj, texts, param);
  //   }
  // }



  /* Print the QR Code after invoice details table */
  if (param.add_qr_code) {
    if (typeof(hook_print_qr_code) === typeof(Function)) {
      hook_print_qr_code(repDocObj, invoiceObj, texts, param);
    } else {
      print_qr_code(repDocObj, invoiceObj, texts, param);
    }
  }

  /* Final text (after invoice details table) */
  if (typeof(hook_print_final_text) === typeof(Function)) {
    hook_print_final_text(repDocObj, invoiceObj);
  } else {
    print_final_text(repDocObj, invoiceObj);
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

  /* Footer */
  if (param.add_footer) {
    if (typeof(hook_print_footer) === typeof(Function)) {
      hook_print_footer(repDocObj, param);
    } else {
      print_footer(repDocObj, param);
    }
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
    var logoFormat = Banana.Report.logoFormat(param.logo_name); //Logo
    if (logoFormat) {
      var logoElement = logoFormat.createDocNode(headerLogoSection, repStyleObj, "logo");
      repDocObj.getHeader().addChild(logoElement);
    }
  }

  if (param.print_header) {
    tableRow = tab.addRow();
    var cell1 = tableRow.addCell("", "", 1);
    var cell2 = tableRow.addCell("", "amount", 1);
    
    if (param.header_row_1) {
      if (param.header_row_1.length > 0) {
        cell2.addParagraph(param.header_row_1, "headerRow1");
      }
      if (param.header_row_2.length > 0) {
        cell2.addParagraph(param.header_row_2, "headerRow2");
      }
      if (param.header_row_3.length > 0) {
        cell2.addParagraph(param.header_row_3, "headerRow3");
      }
      if (param.header_row_4.length > 0) {
        cell2.addParagraph(param.header_row_4, "headerRow4");
      }
      if (param.header_row_5.length > 0) {
        cell2.addParagraph(param.header_row_5, "headerRow5");
      }
    }
    else {
      var supplierNameLines = getInvoiceSupplierName(invoiceObj.supplier_info).split('\n');
      for (var i = 0; i < supplierNameLines.length; i++) {
        cell2.addParagraph(supplierNameLines[i], "headerRow1");
      }
      var supplierLines = getInvoiceSupplier(invoiceObj.supplier_info).split('\n');
      for (var i = 0; i < supplierLines.length; i++) {
        cell2.addParagraph(supplierLines[i], "headerRow2");
      }      
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

function print_info(repDocObj, invoiceObj, texts, param, tableStyleRow0) {

  var infoTable = "";

  // info table that starts at row 0, for pages 2+
  if (tableStyleRow0) {
    infoTable = repDocObj.addTable(tableStyleRow0);
  }
  else {
    if (param.address_left) {
      infoTable = repDocObj.addTable("info_table_right");
    } else {
      infoTable = repDocObj.addTable("info_table_left");
    }
  }

  tableRow = infoTable.addRow();
  tableRow.addCell(" ", "", 1);
  tableRow.addCell(" ", "", 1);

  if (param.info_invoice_number) {
    tableRow = infoTable.addRow();
    tableRow.addCell(param.texts_info_invoice_number_text + ":","",1);
    tableRow.addCell(invoiceObj.document_info.number,"",1);
  }
  if (param.info_date) {
    tableRow = infoTable.addRow();
    tableRow.addCell(param.texts_info_date_text + ":","",1);
    tableRow.addCell(Banana.Converter.toLocaleDateFormat(invoiceObj.document_info.date),"",1);    
  }
  if (param.info_customer) {
    tableRow = infoTable.addRow();
    tableRow.addCell(param.texts_info_customer_text + ":","",1);
    tableRow.addCell(invoiceObj.customer_info.number,"",1);    
  }
  if (param.info_due_date) {
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
    tableRow.addCell(param.texts_info_due_date_text + ":","",1);
    tableRow.addCell(payment_terms,"",1);    
  }
  if (param.info_page) {
    tableRow = infoTable.addRow();
    tableRow.addCell(param.texts_info_page_text + ":","",1);
    tableRow.addCell("","",1).addFieldPageNr();    
  }
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
  var cell = tableRow.addCell("", "", 1);
  if (param.small_address_line) {
    cell.addText(param.small_address_line, "small_address");
  }
  else {
    var supplierNameLines = getInvoiceSupplierName(invoiceObj.supplier_info).split('\n');
    cell.addText(supplierNameLines[0], "small_address");
    var supplierLines = getInvoiceSupplier(invoiceObj.supplier_info).split('\n');
    cell.addText(" - " + supplierLines[0] + " - " + supplierLines[1], "small_address");
  }
  // Customer address
  tableRow = customerAddressTable.addRow();
  var cell = tableRow.addCell("", "", 1);
  var addressLines = getInvoiceAddress(invoiceObj.customer_info).split('\n');
  for (var i=0; i < addressLines.length; i++) {
    cell.addParagraph(addressLines[i]);
  }
}

// print befor details
function print_text_begin(repDocObj, invoiceObj, param) {
  if (param.title) {
    repDocObj.addParagraph(param.title, "title_text");
    repDocObj.addParagraph(" ", "");
    repDocObj.addParagraph(" ", "");
  }
  if (invoiceObj.document_info.text_begin) {
    repDocObj.addParagraph(invoiceObj.document_info.text_begin, "begin_text");
    repDocObj.addParagraph(" ", "");
    repDocObj.addParagraph(" ", "");
  }
}




/* Amounts net (VAT excluded) */
function print_details_net_amounts(repDocObj, invoiceObj, texts, param) {

  var _columns_number = 0;
  var columnsDimension = param.items_invoice_details_dimensions.split(";");

  var repTableObj = repDocObj.addTable("doc_table");
  var repTableCol1 = repTableObj.addColumn().setStyleAttributes("width:"+columnsDimension[0]);
  var repTableCol2 = repTableObj.addColumn().setStyleAttributes("width:"+columnsDimension[1]);
  var repTableCol3 = repTableObj.addColumn().setStyleAttributes("width:"+columnsDimension[2]);
  var repTableCol4 = repTableObj.addColumn().setStyleAttributes("width:"+columnsDimension[3]);
  var repTableCol5 = repTableObj.addColumn().setStyleAttributes("width:"+columnsDimension[4]);
  var repTableCol6 = repTableObj.addColumn().setStyleAttributes("width:"+columnsDimension[5]);
  var repTableCol7 = repTableObj.addColumn().setStyleAttributes("width:"+columnsDimension[6]);
  var repTableCol8 = repTableObj.addColumn().setStyleAttributes("width:"+columnsDimension[7]);
  var repTableCol9 = repTableObj.addColumn().setStyleAttributes("width:"+columnsDimension[8]);
  var repTableCol10 = repTableObj.addColumn().setStyleAttributes("width:"+columnsDimension[9]);

  var header = repTableObj.getHeader().addRow();

  // Creates the header with the parameter's values
  // If user insert other columns names we use them,
  // otherwise we use the XmlValue inserted when choosing the columns to display
  var columnsSelected = param.items_invoice_details.split(";");
  var columnsNames = param.texts_items_details_columns.split(";");

  if (param.texts_items_details_columns) {
    for (var i = 0; i < columnsNames.length; i++) {
      columnsNames[i] = columnsNames[i].trim();
      header.addCell(columnsNames[i], "doc_table_header center", 1);
      _columns_number ++
    }
  }
  else {
    for (var i = 0; i < columnsSelected.length; i++) {
      columnsSelected[i] = columnsSelected[i].trim();
      header.addCell(columnsSelected[i], "doc_table_header center", 1);
      _columns_number ++;
    }
  }

  //ITEMS
  for (var i = 0; i < invoiceObj.items.length; i++) {

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

    for (var j = 0; j < columnsSelected.length; j++) {
      if (columnsSelected[j] === "Description") {
        var descriptionCell = tableRow.addCell("", classNameEvenRow + " padding-left padding-right " + className, 1);
        descriptionCell.addParagraph(item.description);
        descriptionCell.addParagraph(item.description2);
      }
      else if (columnsSelected[j] === "Quantity" || columnsSelected[j] === "quantity") {
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(item.quantity), classNameEvenRow + " center padding-left padding-right " + className, 1);
      }
      else if (columnsSelected[j] === "ReferenceUnit" || columnsSelected[j] === "referenceunit" || columnsSelected[j] === "mesure_unit") {
        tableRow.addCell(item.mesure_unit, classNameEvenRow + " center padding-left padding-right " + className, 1);
      }
      else if (columnsSelected[j] === "UnitPrice" || columnsSelected[j] === "unitprice" || columnsSelected[j] === "unit_price") {
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(item.unit_price.calculated_amount_vat_exclusive), classNameEvenRow + " amount padding-left padding-right " + className, 1);
      }
      else if (columnsSelected[j] === "Amount" || columnsSelected[j] === "amount" || columnsSelected[j] === "total_amount_vat_exclusive") {
        tableRow.addCell(toInvoiceAmountFormat(invoiceObj, item.total_amount_vat_exclusive), classNameEvenRow + " amount padding-left padding-right " + className, 1);
      }
      else {
        var userColumnValue = "";
        userColumnValue = getUserColumnValue(invoiceObj.document_info.number, item.origin_row, columnsSelected[j]);
        tableRow.addCell(userColumnValue, classNameEvenRow + " padding-left padding-right " + className, 1);
      }
    }
  }

  tableRow = repTableObj.addRow();
  tableRow.addCell("", "thin-border-top", _columns_number);
}
function print_details_net_amounts_totals(repDocObj, invoiceObj, texts, param) {
  var repTableObj = repDocObj.addTable("doc_table_total");
  var totalCol1 = repTableObj.addColumn().setStyleAttributes("width:55%");
  var totalCol2 = repTableObj.addColumn().setStyleAttributes("width:15%");
  var totalCol3 = repTableObj.addColumn().setStyleAttributes("width:15%");
  var totalCol4 = repTableObj.addColumn().setStyleAttributes("width:15%");
  var tableRow;

  //TOTAL NET
  if (invoiceObj.billing_info.total_vat_rates.length > 0) {
    tableRow = repTableObj.addRow();
    tableRow.addCell("","padding-left padding-right",1);
    tableRow.addCell(texts.totalnet, "padding-left padding-right", 1);
    tableRow.addCell("", "padding-left padding-right", 1);
    tableRow.addCell(toInvoiceAmountFormat(invoiceObj, invoiceObj.billing_info.total_amount_vat_exclusive), "amount padding-left padding-right", 1);

    for (var i = 0; i < invoiceObj.billing_info.total_vat_rates.length; i++) {
      tableRow = repTableObj.addRow();
      tableRow.addCell(" ","padding-left padding-right",1);
      tableRow.addCell(texts.vat + " " + invoiceObj.billing_info.total_vat_rates[i].vat_rate + "%", "padding-left padding-right", 1);
      tableRow.addCell(toInvoiceAmountFormat(invoiceObj, invoiceObj.billing_info.total_vat_rates[i].total_amount_vat_exclusive), "amount padding-left padding-right", 1);
      tableRow.addCell(toInvoiceAmountFormat(invoiceObj, invoiceObj.billing_info.total_vat_rates[i].total_vat_amount), "amount padding-left padding-right", 1);
    }
  }

  //TOTAL ROUNDING DIFFERENCE
  if (invoiceObj.billing_info.total_rounding_difference.length) {
    tableRow = repTableObj.addRow();
    tableRow.addCell("","padding-left padding-right",1);
    tableRow.addCell(texts.rounding, "padding-left padding-right", 1);
    tableRow.addCell("", "padding-left padding-right", 1)
    tableRow.addCell(toInvoiceAmountFormat(invoiceObj, invoiceObj.billing_info.total_rounding_difference), "amount padding-left padding-right", 1);
  }
  tableRow = repTableObj.addRow();
  tableRow.addCell("","",1);
  tableRow.addCell("", "thin-border-top", 3);

  //FINAL TOTAL
  tableRow = repTableObj.addRow();
  tableRow.addCell("","padding-left padding-right",1);
  tableRow.addCell(texts.total.toUpperCase() + " " + invoiceObj.document_info.currency, "total_cell", 1);
  tableRow.addCell("", "total_cell", 1);
  tableRow.addCell(toInvoiceAmountFormat(invoiceObj, invoiceObj.billing_info.total_to_pay), "total_cell amount", 1);
  
  tableRow = repTableObj.addRow();
  tableRow.addCell("", "", 4);
}

/* Amount gross (VAT included) */
function print_details_gross_amounts(repDocObj, invoiceObj, texts, param) {

  var _columns_number = 0;
  var columnsDimension = param.items_invoice_details_dimensions.split(";");

  var repTableObj = repDocObj.addTable("doc_table");
  var repTableCol1 = repTableObj.addColumn().setStyleAttributes("width:"+columnsDimension[0]);
  var repTableCol2 = repTableObj.addColumn().setStyleAttributes("width:"+columnsDimension[1]);
  var repTableCol3 = repTableObj.addColumn().setStyleAttributes("width:"+columnsDimension[2]);
  var repTableCol4 = repTableObj.addColumn().setStyleAttributes("width:"+columnsDimension[3]);
  var repTableCol5 = repTableObj.addColumn().setStyleAttributes("width:"+columnsDimension[4]);
  var repTableCol6 = repTableObj.addColumn().setStyleAttributes("width:"+columnsDimension[5]);
  var repTableCol7 = repTableObj.addColumn().setStyleAttributes("width:"+columnsDimension[6]);
  var repTableCol8 = repTableObj.addColumn().setStyleAttributes("width:"+columnsDimension[7]);
  var repTableCol9 = repTableObj.addColumn().setStyleAttributes("width:"+columnsDimension[8]);
  var repTableCol10 = repTableObj.addColumn().setStyleAttributes("width:"+columnsDimension[9]);

  var header = repTableObj.getHeader().addRow();

  // Creates the header with the parameter's values
  // If user insert other columns names we use them,
  // otherwise we use the XmlValue inserted when choosing the columns to display
  var columnsSelected = param.items_invoice_details.split(";");
  var columnsNames = param.texts_items_details_columns.split(";");

  if (param.texts_items_details_columns) {
    for (var i = 0; i < columnsNames.length; i++) {
      columnsNames[i] = columnsNames[i].trim();
      header.addCell(columnsNames[i], "doc_table_header center", 1);
      _columns_number ++
    }
  }
  else {
    for (var i = 0; i < columnsSelected.length; i++) {
      columnsSelected[i] = columnsSelected[i].trim();
      header.addCell(columnsSelected[i], "doc_table_header center", 1);
      _columns_number ++;
    }
  }

  //ITEMS
  for (var i = 0; i < invoiceObj.items.length; i++) {

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

    for (var j = 0; j < columnsSelected.length; j++) {
      if (columnsSelected[j] === "Description") {
        var descriptionCell = tableRow.addCell("", classNameEvenRow + " padding-left padding-right " + className, 1);
        descriptionCell.addParagraph(item.description);
        descriptionCell.addParagraph(item.description2);
      }
      else if (columnsSelected[j] === "Quantity" || columnsSelected[j] === "quantity") {
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(item.quantity), classNameEvenRow + " center padding-left padding-right " + className, 1);
      }
      else if (columnsSelected[j] === "ReferenceUnit" || columnsSelected[j] === "referenceunit" || columnsSelected[j] === "mesure_unit") {
        tableRow.addCell(item.mesure_unit, classNameEvenRow + " center padding-left padding-right " + className, 1);
      }
      else if (columnsSelected[j] === "UnitPrice" || columnsSelected[j] === "unitprice" || columnsSelected[j] === "unit_price") {
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(item.unit_price.calculated_amount_vat_inclusive), classNameEvenRow + " amount padding-left padding-right " + className, 1);
      }
      else if (columnsSelected[j] === "Amount" || columnsSelected[j] === "amount" || columnsSelected[j] === "total_amount_vat_inclusive") {
        tableRow.addCell(toInvoiceAmountFormat(invoiceObj, item.total_amount_vat_inclusive), classNameEvenRow + " amount padding-left padding-right " + className, 1);
      }
      else {
        var userColumnValue = "";
        userColumnValue = getUserColumnValue(invoiceObj.document_info.number, item.origin_row, columnsSelected[j]);
        tableRow.addCell(userColumnValue, classNameEvenRow + " padding-left padding-right " + className, 1);
      }
    }
  }

  tableRow = repTableObj.addRow();
  tableRow.addCell("", "thin-border-top", _columns_number);
}
function print_details_gross_amounts_totals(repDocObj, invoiceObj, texts, param) {
  var repTableObj = repDocObj.addTable("doc_table_total");
  var totalCol1 = repTableObj.addColumn().setStyleAttributes("width:55%");
  var totalCol2 = repTableObj.addColumn().setStyleAttributes("width:15%");
  var totalCol3 = repTableObj.addColumn().setStyleAttributes("width:15%");
  var totalCol4 = repTableObj.addColumn().setStyleAttributes("width:15%");
  var tableRow;

  //TOTAL ROUNDING DIFFERENCE
  if (invoiceObj.billing_info.total_rounding_difference.length) {
    tableRow = repTableObj.addRow();
    tableRow.addCell("","padding-left padding-right",1);
    tableRow.addCell(texts.rounding, "padding-left padding-right", 1);
    tableRow.addCell("", "padding-left padding-right", 1)
    tableRow.addCell(toInvoiceAmountFormat(invoiceObj, invoiceObj.billing_info.total_rounding_difference), "amount padding-left padding-right", 1);
  }
  tableRow = repTableObj.addRow();
  tableRow.addCell("", "", 4);

  //FINAL TOTAL
  tableRow = repTableObj.addRow();
  tableRow.addCell("","padding-left padding-right",1);
  tableRow.addCell(texts.total.toUpperCase() + " " + invoiceObj.document_info.currency, "total_cell", 1);
  tableRow.addCell("", "total_cell", 1);
  tableRow.addCell(toInvoiceAmountFormat(invoiceObj, invoiceObj.billing_info.total_to_pay), "total_cell amount", 1);
  
  tableRow = repTableObj.addRow();
  tableRow.addCell("", "", 4);

  //VAT INFO
  tableRow = repTableObj.addRow();
  var cellVatInfo = tableRow.addCell("", "padding-right amount vatInfo", 4);
  for (var i = 0; i < invoiceObj.billing_info.total_vat_rates.length; i++) {
    var vatInfo = texts.vat + " " + invoiceObj.billing_info.total_vat_rates[i].vat_rate + "%";
    vatInfo += " = " + toInvoiceAmountFormat(invoiceObj, invoiceObj.billing_info.total_vat_rates[i].total_vat_amount) + " " + invoiceObj.document_info.currency;
    cellVatInfo.addParagraph(vatInfo);
  }
  
  tableRow = repTableObj.addRow();
  tableRow.addCell("", "", 4);
}

function print_qr_code(repDocObj, invoiceObj, texts, param) {
  var text = '';
  text += 'Currency:\n';
  text += 'CHF\n';
  text += 'Amount:\n';
  text += '3500.00\n';
  text += 'Account/Payable to:\n';
  text += '1234567890\n';
  text += 'Banana.ch SA\n';
  text += 'Via alla Santa 7\n';
  text += '6962 Viganello\n';
  text += 'Reference:\n';
  text += '12 00000 00001 12345 67890 09876\n';
  text += 'Addidtional information:\n';
  text += '35/20180129/100002/30 days\n';
  text += 'Sales merchandise/2000.00/Sales merchandise/1000.00/Sales merchandise/500.00/\n';
  text += 'VAT 8.00% included/259.26\n';
  text += 'Payable by:\n';
  text += 'Mario Bianchi\n';
  text += 'Via Trevano\n';
  text += '6963 Pregassona\n';

  var qrCodeParam = {};
  qrCodeParam.errorCorrectionLevel = 'M';
  qrCodeParam.binaryCodingVersion = 25;
  qrCodeParam.border = 0;

  var qrCodeSvgImage = Banana.Report.qrCodeImage(text, qrCodeParam);
  if (qrCodeParam.errorMsg && qrCodeParam.errorMsg.length>0) {
    Banana.document.addMessage(qrCodeParam.errorMsg);
  }
  if (qrCodeSvgImage) {
    repDocObj.addParagraph(" ","");
    repDocObj.addImage(qrCodeSvgImage, 'qr_code');
    repDocObj.addParagraph(" ","");
    repDocObj.addParagraph(" ","");
  }
}











// print final text after details table
function print_final_text(repDocObj, invoiceObj) {
  //Template params
  //Default text starts with "(" and ends with ")" (default), (Vorderfiniert)
  if (invoiceObj.template_parameters && invoiceObj.template_parameters.footer_texts) {
    repDocObj.addParagraph(" ", "final_text");
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
      repDocObj.addParagraph(text[i], "final_text");
    }
  }
}

// print notes after final text
function print_notes(repDocObj, invoiceObj) {
  repDocObj.addParagraph(" ","notes_text");
  for (var i = 0; i < invoiceObj.note.length; i++) {
    if (invoiceObj.note[i].description) {
      repDocObj.addParagraph(invoiceObj.note[i].description, "notes_text");
    }
  }
}

// print greetings after notes, before the footer
function print_greetings(repDocObj, invoiceObj) {
  repDocObj.addParagraph(" ", "greetings_text");
  if (invoiceObj.document_info.greetings) {
      repDocObj.addParagraph(invoiceObj.document_info.greetings, "greetings_text");
  }
}

// print the footer at the bottom of the page
function print_footer(repDocObj, param) {
  
  var paragraph = repDocObj.getFooter().addParagraph("","footer_line");
  var tabFooter = repDocObj.getFooter().addTable("footer_table");
  var col1 = tabFooter.addColumn().setStyleAttributes("width:33%");
  var col2 = tabFooter.addColumn().setStyleAttributes("width:33%");
  var col3 = tabFooter.addColumn().setStyleAttributes("width:33%");

  var tableRow = tabFooter.addRow();
  var cell1 = tableRow.addCell("","",1);
  var cell2 = tableRow.addCell("","",1);
  var cell3 = tableRow.addCell("","",1);

  // footer left
  if (param.footer_left && param.footer_left.length > 0) {
    var lines = param.footer_left.split("\n");
    for (var i = 0; i < lines.length; i++) {
      cell1.addParagraph(lines[i], "");
    }
  }
  // footer center
  if (param.footer_center && param.footer_center.length > 0) {
    var lines = param.footer_center.split("\n");
    for (var i = 0; i < lines.length; i++) {
      cell2.addParagraph(lines[i], "");
    }
  }
  // footer right
  if (param.footer_right && param.footer_right.length > 0) {
    var lines = param.footer_right.split("\n");
    for (var i = 0; i < lines.length; i++) {
      cell3.addParagraph(lines[i], "");
    }
  }
}












//====================================================================//
// OTHER UTILITIES FUNCTIONS
//====================================================================//

// Get the value from a custom user column
function getUserColumnValue(docInvoice, originRow, column) {
  var table = Banana.document.table('Transactions');
  var values = [];
  for (var i = 0; i < table.rowCount; i++) {
    var tRow = table.row(i);
    if (tRow.value('DocInvoice') === docInvoice && tRow.value(column)) {
      var rowNr = tRow.rowNr;
      if (rowNr.toString() === originRow.toString()) {
        values.push(tRow.value(column));
      }
    }
  }
  return values;
}

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
  repStyleObj.addStyle("body", "font-size: "+ param.font_size + "pt; font-family:" + param.font_family);
  repStyleObj.addStyle(".amount", "text-align:right");
  repStyleObj.addStyle(".center", "text-align:center");
  repStyleObj.addStyle(".bold", "font-weight: bold");
  repStyleObj.addStyle(".doc_table_header", "font-weight:bold; background-color:" + param.color_1 + "; color:" + param.color_2);
  repStyleObj.addStyle(".doc_table_header td", "padding:5px;");
  //repStyleObj.addStyle(".total_cell", "font-weight:bold; background-color:" + param.color_1 + "; color: " + param.color_2 + "; padding:5px");
  repStyleObj.addStyle(".total_cell", "font-weight:bold; color: " + param.color_1 + "; border-bottom:1px double " + param.color_1 + "; font-size:"+(parseInt(param.font_size)+2)+"pt");
  repStyleObj.addStyle(".subtotal_cell", "font-weight:bold; background-color:" + param.color_1 + "; color: " + param.color_2 + "; padding:5px");
  repStyleObj.addStyle(".vatInfo", "font-size: "+ param.font_size + "pt");
  repStyleObj.addStyle(".evenRowsBackgroundColor", "background-color: " + param.color_3);

  // Header rows
  repStyleObj.addStyle(".headerRow1", "font-weight:bold; font-size:20pt; color:" + param.color_1);
  repStyleObj.addStyle(".headerRow2", "font-weight:bold; font-size:12pt;");
  repStyleObj.addStyle(".headerRow3", "font-weight:bold; font-size:12pt;");
  repStyleObj.addStyle(".headerRow4", "font-weight:bold; font-size:12pt;");
  repStyleObj.addStyle(".headerRow5", "font-weight:bold; font-size:12pt;");

  repStyleObj.addStyle(".border-bottom", "border-bottom:2px solid " + param.color_1);
  repStyleObj.addStyle(".thin-border-top", "border-top:thin solid " + param.color_1);
  repStyleObj.addStyle(".padding-right", "padding-right:5px");
  repStyleObj.addStyle(".padding-left", "padding-left:5px");


  /* Title */
  var titleStyle = repStyleObj.addStyle(".title_text");
  titleStyle.setAttribute("position", "absolute");
  titleStyle.setAttribute("top", "90mm");
  titleStyle.setAttribute("left", "20mm");
  titleStyle.setAttribute("right", "10mm");
  titleStyle.setAttribute("font-size", (parseInt(param.font_size)+4) +"pt");
  titleStyle.setAttribute("font-weight", "bold");
  titleStyle.setAttribute("color", param.color_1);

  /* Text begin */
  var beginStyle = repStyleObj.addStyle(".begin_text");
  beginStyle.setAttribute("position", "absolute");
  beginStyle.setAttribute("top", "100mm");
  beginStyle.setAttribute("left", "20mm");
  beginStyle.setAttribute("right", "10mm");
  beginStyle.setAttribute("font-size", param.font_size + "pt");

  /* Logo */
  var logoStyle = repStyleObj.addStyle(".logo");
  logoStyle.setAttribute("position", "absolute");
  logoStyle.setAttribute("margin-top", "10mm");
  logoStyle.setAttribute("margin-left", "20mm");
  logoStyle.setAttribute("margin-right", "10mm");

  /* Final text */
  var finalTextStyle = repStyleObj.addStyle(".final_text");
  finalTextStyle.setAttribute("margin-left", "20mm");
  finalTextStyle.setAttribute("margin-right", "10mm");
  finalTextStyle.setAttribute("font-size", param.font_size + "pt");

  /* Notes text */
  var notesStyle = repStyleObj.addStyle(".notes_text");
  notesStyle.setAttribute("margin-left", "20mm");
  notesStyle.setAttribute("margin-right", "10mm");
  notesStyle.setAttribute("font-size", param.font_size + "pt");

  /* Greetings */
  var greetingsStyle = repStyleObj.addStyle(".greetings_text");
  greetingsStyle.setAttribute("margin-left", "20mm");
  greetingsStyle.setAttribute("margin-right", "10mm");
  greetingsStyle.setAttribute("font-size", param.font_size + "pt");









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
  infoStyle.setAttribute("font-size", param.font_size + "pt");
  repStyleObj.addStyle("table.info_table_left td", "padding-top:0px; padding-bottom:0px");
  //repStyleObj.addStyle("table.info_table_left td", "border: thin solid black;");

  var infoStyle = repStyleObj.addStyle(".info_table_right");
  infoStyle.setAttribute("position", "absolute");
  infoStyle.setAttribute("margin-top", "45mm");
  infoStyle.setAttribute("margin-left", "113mm");
  infoStyle.setAttribute("margin-right", "10mm");
  infoStyle.setAttribute("font-size", param.font_size + "pt");
  repStyleObj.addStyle("table.info_table_right td", "padding-top:0px; padding-bottom:0px");
  //repStyleObj.addStyle("table.info_table_right td", "border: thin solid black");

  var infoStyle = repStyleObj.addStyle(".info_table_row0");
  infoStyle.setAttribute("position", "absolute");
  infoStyle.setAttribute("margin-top", "45mm");
  infoStyle.setAttribute("margin-left", "20mm");
  infoStyle.setAttribute("margin-right", "10mm");
  infoStyle.setAttribute("font-size", param.font_size + "pt");
  repStyleObj.addStyle("table.info_table_row0 td", "padding-top:0px; padding-bottom:0px");
  //repStyleObj.addStyle("table.info_table_row0 td", "border: thin solid black");

  var infoStyle = repStyleObj.addStyle("@page:first-view table.info_table_row0");
  infoStyle.setAttribute("display", "none");

  var infoStyle = repStyleObj.addStyle(".address_table_right");
  infoStyle.setAttribute("position", "absolute");
  infoStyle.setAttribute("margin-top", param.address_margin_top + "mm"); //45mm
  infoStyle.setAttribute("margin-left", param.address_margin_left + "mm"); //113mm
  infoStyle.setAttribute("margin-right", "10mm");
  infoStyle.setAttribute("font-size", param.font_size + "pt");
  //repStyleObj.addStyle("table.address_table_right td", "border: thin solid black");

  var infoStyle = repStyleObj.addStyle(".address_table_left");
  infoStyle.setAttribute("position", "absolute");
  infoStyle.setAttribute("margin-top", "45mm");
  infoStyle.setAttribute("margin-left", "20mm");
  infoStyle.setAttribute("margin-right", "10mm");
  //repStyleObj.addStyle("table.address_table_left td", "border: thin solid black");

  var infoStyle = repStyleObj.addStyle(".small_address");
  infoStyle.setAttribute("text-align", "center");
  infoStyle.setAttribute("font-size", "7pt");
  infoStyle.setAttribute("border-bottom", "solid 1px black");

  var itemsStyle = repStyleObj.addStyle(".doc_table");
  itemsStyle.setAttribute("margin-top", docTableStart);
  itemsStyle.setAttribute("margin-left", "23mm")
  itemsStyle.setAttribute("margin-right", "10mm");
  itemsStyle.setAttribute("width", "100%");
  //repStyleObj.addStyle("table.doc_table td", "border: thin solid black; padding: 3px;");

  var itemsStyle = repStyleObj.addStyle(".doc_table_total");
  itemsStyle.setAttribute("margin-left", "23mm")
  itemsStyle.setAttribute("margin-right", "10mm");
  itemsStyle.setAttribute("width", "100%");
  //repStyleObj.addStyle("table.doc_table_total td", "border: thin solid black; padding: 3px;");


  var qr_codeStyle = repStyleObj.addStyle(".qr_code");
  qr_codeStyle.setAttribute("margin-left", "20mm");
  qr_codeStyle.setAttribute("margin-right", "10mm");
  qr_codeStyle.setAttribute("text-align", "right");


  var footerLine = repStyleObj.addStyle(".footer_line");
  footerLine.setAttribute("margin-left", "20mm");
  footerLine.setAttribute("margin-right", "10mm");
  footerLine.setAttribute("border-top", "thin solid " + param.color_1);

  var footerStyle = repStyleObj.addStyle(".footer_table");
  footerStyle.setAttribute("margin-bottom", "20mm");
  //footerStyle.setAttribute("margin-top", "10mm");
  footerStyle.setAttribute("margin-left", "23mm");
  footerStyle.setAttribute("margin-right", "10mm");
  footerStyle.setAttribute("width", "100%");
  footerStyle.setAttribute("font-size", "8pt");
  //repStyleObj.addStyle("table.footer_table td", "border: thin solid black");
}


//====================================================================//
// TEXTS
//====================================================================//
function setInvoiceTexts(language) {
  var texts = {};
  if (language == 'it') {
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
    // texts.vat_number = 'Partita IVA: ';
    // texts.bill_to = 'Indirizzo fatturazione';
    // texts.shipping_to = 'Indirizzo spedizione';
    // texts.from = 'DA:';
    // texts.to = 'A:';
    texts.param_color_1 = 'Colore sfondo';
    texts.param_color_2 = 'Colore testo';
    texts.param_font_family = 'Tipo carattere';
    // texts.param_image_height = 'Altezza immagine (mm)';
    texts.param_print_header = 'Includi intestazione pagina';
    texts.param_print_logo = 'Stampa logo';
    texts.payment_due_date_label = 'Scadenza';
    texts.payment_terms_label = 'Pagamento';
    //texts.param_max_items_per_page = 'Numero di linee su ogni fattura';
  }
  else if (language == 'de') {
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
    // texts.vat_number = 'Mehrwertsteuernummer: ';
    // texts.bill_to = 'Rechnungsadresse';
    // texts.shipping_to = 'Lieferadresse';
    // texts.from = 'VON:';
    // texts.to = 'ZU:';
    texts.param_color_1 = 'Hintergrundfarbe';
    texts.param_color_2 = 'Textfarbe';
    texts.param_font_family = 'Typ Schriftzeichen';
    // texts.param_image_height = 'Bildhöhe (mm)';
    texts.param_print_header = 'Seitenüberschrift einschliessen';
    texts.param_print_logo = 'Logo ausdrucken';
    texts.payment_due_date_label = 'Fälligkeitsdatum';
    texts.payment_terms_label = 'Zahlungsfrist';
    //texts.param_max_items_per_page = 'Anzahl der Zeilen auf jeder Rechnung';
  }
  else if (language == 'fr') {
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
    // texts.vat_number = 'Numéro de TVA: ';
    // texts.bill_to = 'Adresse de facturation';
    // texts.shipping_to = 'Adresse de livraison';
    // texts.from = 'DE:';
    // texts.to = 'À:';
    texts.param_color_1 = 'Couleur de fond';
    texts.param_color_2 = 'Couleur du texte';
    texts.param_font_family = 'Police de caractère';
    // texts.param_image_height = "Hauteur de l'image (mm)";
    texts.param_print_header = 'Inclure en-tête de page';
    texts.param_print_logo = 'Imprimer logo';
    texts.payment_due_date_label = 'Echéance';
    texts.payment_terms_label = 'Paiement';
    //texts.param_max_items_per_page = 'Nombre d’éléments sur chaque facture';
  }
  else if (language == 'zh') {
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
    // texts.vat_number = '增值税号: ';
    // texts.bill_to = '账单地址';
    // texts.shipping_to = '邮寄地址';
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
  else if (language == 'nl') {
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
    // texts.vat_number = 'BTW-nummer: ';
    // texts.bill_to = 'Factuuradres';
    // texts.shipping_to = 'Leveringsadres';
    // texts.from = 'VAN:';
    // texts.to = 'TOT:';
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
  else {

    texts.param_logo = 'Logo';
    texts.param_address = 'Address';
    texts.param_info_invoice = 'Invoice information';
    texts.param_items_table = 'Invoice details';


    // texts.vat_number = 'VAT Number: ';
    // texts.bill_to = 'Billing address';
    // texts.shipping_to = 'Shipping address';
    // texts.param_image_height = 'Image height (mm)';

    //////////////////////////////////////////////////////////////////////////////////




    //Info
    texts.invoice = 'Invoice';
    texts.date = 'Date';
    texts.customer = 'Customer No';
    texts.payment_due_date_label = 'Due date';
    texts.payment_terms_label = 'Payment';
    texts.page = 'Page';

    //Details
    texts.description = 'Description';
    texts.quantity = 'Quantity';
    texts.reference_unit = 'ReferenceUnit';
    texts.unit_price = 'UnitPrice';
    texts.amount = 'Amount';
    texts.total = 'Total';

    texts.rounding = 'Rounding';
    texts.totalnet = 'Total net';
    texts.vat = 'VAT';
    texts.unit_ref = 'Unit';
    
    //Include
    texts.param_include = "Include";
    texts.param_include_header = "Header";
    texts.param_print_header = 'Page header';
    texts.param_header_row_1 = "Header row 1";
    texts.param_header_row_2 = "Header row 2";
    texts.param_header_row_3 = "Header row 3";
    texts.param_header_row_4 = "Header row 4";
    texts.param_header_row_5 = "Header row 5";
    texts.param_print_logo = 'Header logo';
    texts.param_logo_name = 'Logo name';
    texts.param_include_address = "Customer address";
    texts.param_small_address_line = "Small supplier address line";
    texts.param_address_left = 'Address on left position';
    texts.param_include_info = 'Info';
    texts.param_info_invoice_number = 'Invoice number';
    texts.param_info_date = 'Invoice date';
    texts.param_info_customer = 'Invoice customer number';
    texts.param_info_due_date = 'Invoice due date';
    texts.param_info_page = 'Invoice page number';
    texts.param_include_details = "Details";
    texts.param_title = "Title";
    texts.param_items_invoice_details = "Invoice details columns";
    texts.param_items_invoice_details_dimensions = "Invoice details columns width";
    texts.param_details_net_amounts = "Details with net amounts (VAT excluded)";
    texts.param_details_gross_amounts = "Details with gross amounts (VAT included)";
    texts.param_invoice_details_without_vat = "Details without VAT";
    texts.param_include_footer = 'Footer';
    texts.param_add_footer = 'Print footer';
    texts.param_footer_left = "Left footer at the bottom of the page";
    texts.param_footer_center = "Center footer at the bottom of the page";
    texts.param_footer_right = "Right footer at the bottom of the page";


    //Texts
    texts.param_texts = "Texts (empty = default values)";
    texts.param_texts_language = "en";
    texts.param_texts_info_invoice_number_text = 'Invoice number';
    texts.param_texts_info_date_text = 'Invoice date';
    texts.param_texts_info_customer_text = 'Invoice customer number';
    texts.param_texts_info_due_date_text = 'Invoice due date';
    texts.param_texts_info_page_text = 'Invoice page number';
    texts.param_texts_items_details_columns = 'Invoice details columns names';


    //Styles
    texts.param_styles = "Styles";
    texts.param_color_1 = 'Background Color';
    texts.param_color_2 = 'Text Color';
    texts.param_color_3 = 'Rows background color';
    texts.param_font_family = 'Font type';
    texts.param_font_size = 'Font size';
    texts.param_styles_margins = 'Margins';
    texts.param_address_margin_top = 'Address margin top (mm)';
    texts.param_address_margin_left = 'Address margin left (mm)';

    //Embedded JavaScript file
    texts.param_custom_javascript = "Custom JavaScript file";
    texts.param_custom_javascript_filename = "Insert the file name ('ID' column of the 'Documents' table)";

    // //Language
    // texts.param_lang = "Language";
    // texts.param_lang_new = "Add new";


    // qr_code
    texts.param_qr_code = "QR Code";
    texts.param_add_qr_code = "Print the QR Code";



    //Tooltips for the parameters
    texts.param_tooltip_print_header = "Check to include the page header";
    texts.param_tooltip_print_logo = "Check to include the logo";
    texts.param_tooltip_logo_name = "Enter the name of the logo";
    texts.param_tooltip_info_invoice_number = "Check to include the invoice number";
    texts.param_tooltip_info_date = "Check to include the invoice date";
    texts.param_tooltip_info_customer = "Check to include the invoice customer number";
    texts.param_tooltip_info_due_date = "Check to include the invoice due date";
    texts.param_tooltip_info_page = "Check to include the page invoice number";
    texts.param_tooltip_texts_info_invoice_number_text = "Enter a text to replace the default one";
    texts.param_tooltip_texts_info_date_text = "Enter a text to replace the default one";
    texts.param_tooltip_texts_info_customer_text = "Enter a text to replace the default one";
    texts.param_tooltip_texts_payment_terms_label = "Enter a text to replace the default one";
    texts.param_tooltip_texts_info_page_text = "Enter a text to replace the default one";
    texts.param_tooltip_title = "Enter a text to replace the default one";
    texts.param_tooltip_texts_items_details_columns = "Enter the names of the invoice details columns";
    texts.param_tooltip_items_invoice_details = "Enter the names of the columns in the order you prefer";
    texts.param_tooltip_items_invoice_details_dimensions = "Enter the width of the columns in % (sum = 100%)";
    texts.param_tooltip_header_row_1 = "Enter a text to replace the default one";
    texts.param_tooltip_header_row_2 = "Enter a text to replace the default one";
    texts.param_tooltip_header_row_3 = "Enter a text to replace the default one";
    texts.param_tooltip_header_row_4 = "Enter a text to replace the default one";
    texts.param_tooltip_header_row_5 = "Enter a text to replace the default one";
    texts.param_tooltip_small_address_line = "Enter supplier address line above the customer address";
    texts.param_tooltip_address_left = "Check to print the customer address on left position";
    texts.param_tooltip_details_net_amounts = "Check to print the invoice details with net VAT";
    texts.param_tooltip_details_gross_amounts = "Check to print the invoice details with gross VAT";
    texts.param_tooltip_invoice_details_without_vat = "Check to print the invoice details without VAT";
    texts.param_tooltip_add_footer = "Check to print the footer at the bottom of the page";
    texts.param_tooltip_footer = "Enter a footer text";
    texts.param_tooltip_font_family = "Enter the font type";
    texts.param_tooltip_color_1 = "Enter the background color";
    texts.param_tooltip_color_2 = "Enter the text color";
    texts.param_tooltip_color_3 = "Enter the color for the rows background";
    texts.param_tooltip_address_margin_left = "Enter the address margin left (mm)";
    texts.param_tooltip_address_margin_top = "Enter the address margin top (mm)";
    texts.param_tooltip_javascript_filename = "Enter the name of the javascript file taken from the 'ID' column of the table 'Documents' (i.e. file.js)";
    texts.param_tooltip_add_qr_code = "Check to print the QR Code"; 
  }
  return texts;
}
