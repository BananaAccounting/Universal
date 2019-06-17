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
// @pubdate = 2019-06-17
// @publisher = Banana.ch SA
// @description = Style 10: Fully customizable invoice template
// @description.it = Stile 10: Template fattura completamente personalizzabile
// @description.de = Stil 10: Fully customizable invoice template
// @description.fr = Style 10: Fully customizable invoice template
// @description.nl = Stijl 10: Fully customizable invoice template
// @description.en = Style 10: Fully customizable invoice template
// @description.zh = Style 10: Fully customizable invoice template
// @doctype = *
// @task = report.customer.invoice




/*
  SUMMARY
  =======
  Fully customizable invoice template.

  Invoice zones:
  - header
  - info
  - address
  - shipping address
  - begin text (title and begin text)
  - details
  - final texts
  - footer

*/


var _columns_number = 0;








//====================================================================//
// INVOICE PARAMETERS
//====================================================================//
/* Update script's parameters */
function settingsDialog() {
  var userParam = initParam();
  var savedParam = Banana.document.getScriptSettings();
  if (savedParam.length > 0) {
    userParam = JSON.parse(savedParam);
  }   
  userParam = verifyParam(userParam);
  if (typeof (Banana.Ui.openPropertyEditor) !== 'undefined') {
    var dialogTitle = 'Settings';
    var convertedParam = convertParam(userParam);
    var pageAnchor = 'dlgSettings';
    if (!Banana.Ui.openPropertyEditor(dialogTitle, convertedParam, pageAnchor)) {
      return;
    }
    for (var i = 0; i < convertedParam.data.length; i++) {
      // Read values to param (through the readValue function)
      convertedParam.data[i].readValue();
    }
  }
  var paramToString = JSON.stringify(userParam);
  var value = Banana.document.setScriptSettings(paramToString);
}

function convertParam(userParam) {
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


  /*******************************************************************************************
  * INCLUDE
  *******************************************************************************************/
  var currentParam = {};
  currentParam.name = 'include';
  currentParam.title = texts.param_include;
  currentParam.type = 'string';
  currentParam.value = '';
  currentParam.editable = false;
  currentParam.readValue = function() {
    userParam.include = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'include_header';
  currentParam.parentObject = 'include';
  currentParam.title = texts.param_include_header;
  currentParam.type = 'string';
  currentParam.value = '';
  currentParam.editable = false;
  currentParam.readValue = function() {
    userParam.include_header = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'print_header';
  currentParam.parentObject = 'include_header';
  currentParam.title = texts.param_print_header;
  currentParam.type = 'bool';
  currentParam.value = userParam.print_header ? true : false;
  currentParam.defaultvalue = true;
  currentParam.tooltip = texts.param_tooltip_print_header;
  currentParam.readValue = function() {
    userParam.print_header = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'header_left';
  currentParam.parentObject = 'include_header';
  currentParam.title = texts.param_header_left;
  currentParam.type = 'bool';
  currentParam.value = userParam.header_left ? true : false;
  currentParam.defaultvalue = false;
  currentParam.tooltip = texts.param_tooltip_header_left;
  currentParam.readValue = function() {
    userParam.header_left = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'header_row_1';
  currentParam.parentObject = 'include_header';
  currentParam.title = texts.param_header_row_1;
  currentParam.type = 'string';
  currentParam.value = userParam.header_row_1 ? userParam.header_row_1 : '';
  currentParam.defaultvalue = "";
  currentParam.tooltip = texts.param_tooltip_header_row_1;
  currentParam.readValue = function() {
    userParam.header_row_1 = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'header_row_2';
  currentParam.parentObject = 'include_header';
  currentParam.title = texts.param_header_row_2;
  currentParam.type = 'string';
  currentParam.value = userParam.header_row_2 ? userParam.header_row_2 : '';
  currentParam.defaultvalue = "";
  currentParam.tooltip = texts.param_tooltip_header_row_2;
  currentParam.readValue = function() {
    userParam.header_row_2 = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'header_row_3';
  currentParam.parentObject = 'include_header';
  currentParam.title = texts.param_header_row_3;
  currentParam.type = 'string';
  currentParam.value = userParam.header_row_3 ? userParam.header_row_3 : '';
  currentParam.defaultvalue = "";
  currentParam.tooltip = texts.param_tooltip_header_row_3;
  currentParam.readValue = function() {
    userParam.header_row_3 = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'header_row_4';
  currentParam.parentObject = 'include_header';
  currentParam.title = texts.param_header_row_4;
  currentParam.type = 'string';
  currentParam.value = userParam.header_row_4 ? userParam.header_row_4 : '';
  currentParam.defaultvalue = "";
  currentParam.tooltip = texts.param_tooltip_header_row_4;
  currentParam.readValue = function() {
    userParam.header_row_4 = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'header_row_5';
  currentParam.parentObject = 'include_header';
  currentParam.title = texts.param_header_row_5;
  currentParam.type = 'string';
  currentParam.value = userParam.header_row_5 ? userParam.header_row_5 : '';
  currentParam.defaultvalue = "";
  currentParam.tooltip = texts.param_tooltip_header_row_5;
  currentParam.readValue = function() {
    userParam.header_row_5 = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'print_logo';
  currentParam.parentObject = 'include_header';
  currentParam.title = texts.param_print_logo;
  currentParam.type = 'bool';
  currentParam.value = userParam.print_logo ? true : false;
  currentParam.defaultvalue = false;
  currentParam.tooltip = texts.param_tooltip_print_logo;
  currentParam.readValue = function() {
    userParam.print_logo = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'logo_name';
  currentParam.parentObject = 'include_header';
  currentParam.title = texts.param_logo_name;
  currentParam.type = 'string';
  currentParam.value = userParam.logo_name ? userParam.logo_name : '';
  currentParam.defaultvalue = "Logo";
  currentParam.tooltip = texts.param_tooltip_logo_name;
  currentParam.readValue = function() {
    userParam.logo_name = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'include_address';
  currentParam.parentObject = 'include';
  currentParam.title = texts.param_include_address;
  currentParam.type = 'string';
  currentParam.value = '';
  currentParam.editable = false;
  currentParam.readValue = function() {
    userParam.include_address = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'small_address_line';
  currentParam.parentObject = 'include_address';
  currentParam.title = texts.param_small_address_line;
  currentParam.type = 'string';
  currentParam.value = userParam.small_address_line ? userParam.small_address_line : '';
  currentParam.defaultvalue = '<none>';
  currentParam.tooltip = texts.param_tooltip_small_address_line;
  currentParam.readValue = function() {
   userParam.small_address_line = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'address_left';
  currentParam.parentObject = 'include_address';
  currentParam.title = texts.param_address_left;
  currentParam.type = 'bool';
  currentParam.value = userParam.address_left ? true : false;
  currentParam.defaultvalue = false;
  currentParam.tooltip = texts.param_tooltip_address_left;
  currentParam.readValue = function() {
   userParam.address_left = this.value;
  }
  convertedParam.data.push(currentParam);
  
  currentParam = {};
  currentParam.name = 'shipping_address';
  currentParam.parentObject = 'include_address';
  currentParam.title = texts.param_shipping_address;
  currentParam.type = 'bool';
  currentParam.value = userParam.shipping_address ? true : false;
  currentParam.defaultvalue = false;
  currentParam.tooltip = texts.param_tooltip_shipping_address;
  currentParam.readValue = function() {
    userParam.shipping_address = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'include_info';
  currentParam.parentObject = 'include';
  currentParam.title = texts.param_include_info;
  currentParam.type = 'string';
  currentParam.value = '';
  currentParam.editable = false;
  currentParam.readValue = function() {
    userParam.include_info = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'info_invoice_number';
  currentParam.parentObject = 'include_info';
  currentParam.title = texts.param_info_invoice_number;
  currentParam.type = 'bool';
  currentParam.value = userParam.info_invoice_number ? true : false;
  currentParam.defaultvalue = true;
  currentParam.tooltip = texts.param_tooltip_info_invoice_number;
  currentParam.readValue = function() {
    userParam.info_invoice_number = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'info_date';
  currentParam.parentObject = 'include_info';
  currentParam.title = texts.param_info_date;
  currentParam.type = 'bool';
  currentParam.value = userParam.info_date ? true : false;
  currentParam.defaultvalue = true;
  currentParam.tooltip = texts.param_tooltip_info_date;
  currentParam.readValue = function() {
    userParam.info_date = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'info_customer';
  currentParam.parentObject = 'include_info';
  currentParam.title = texts.param_info_customer;
  currentParam.type = 'bool';
  currentParam.value = userParam.info_customer ? true : false;
  currentParam.defaultvalue = true;
  currentParam.tooltip = texts.param_tooltip_info_customer;
  currentParam.readValue = function() {
    userParam.info_customer = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'info_customer_vat_number';
  currentParam.parentObject = 'include_info';
  currentParam.title = texts.param_info_customer_vat_number;
  currentParam.type = 'bool';
  currentParam.value = userParam.info_customer_vat_number ? true : false;
  currentParam.defaultvalue = false;
  currentParam.tooltip = texts.param_tooltip_info_customer_vat_number;
  currentParam.readValue = function() {
    userParam.info_customer_vat_number = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'info_customer_fiscal_number';
  currentParam.parentObject = 'include_info';
  currentParam.title = texts.param_info_customer_fiscal_number;
  currentParam.type = 'bool';
  currentParam.value = userParam.info_customer_fiscal_number ? true : false;
  currentParam.defaultvalue = false;
  currentParam.tooltip = texts.param_tooltip_info_customer_fiscal_number;
  currentParam.readValue = function() {
    userParam.info_customer_fiscal_number = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'info_due_date';
  currentParam.parentObject = 'include_info';
  currentParam.title = texts.param_info_due_date;
  currentParam.type = 'bool';
  currentParam.value = userParam.info_due_date ? true : false;
  currentParam.defaultvalue = true;
  currentParam.tooltip = texts.param_tooltip_info_due_date;
  currentParam.readValue = function() {
    userParam.info_due_date = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'info_page';
  currentParam.parentObject = 'include_info';
  currentParam.title = texts.param_info_page;
  currentParam.type = 'bool';
  currentParam.value = userParam.info_page ? true : false;
  currentParam.defaultvalue = true;
  currentParam.tooltip = texts.param_tooltip_info_page;
  currentParam.readValue = function() {
    userParam.info_page = this.value;
  }
  convertedParam.data.push(currentParam);


  currentParam = {};
  currentParam.name = 'include_details';
  currentParam.parentObject = 'include';
  currentParam.title = texts.param_include_details;
  currentParam.type = 'string';
  currentParam.value = '';
  currentParam.editable = false;
  currentParam.readValue = function() {
    userParam.include_details = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'items_invoice_details';
  currentParam.parentObject = 'include_details';
  currentParam.title = texts.param_items_invoice_details;
  currentParam.type = 'string';
  currentParam.value = userParam.items_invoice_details ? userParam.items_invoice_details : '';
  currentParam.defaultvalue = texts.description+";"+texts.quantity+";"+texts.reference_unit+";"+texts.unit_price+";"+texts.amount;
  currentParam.tooltip = texts.param_tooltip_items_invoice_details;
  currentParam.readValue = function() {
    userParam.items_invoice_details = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'items_invoice_details_dimensions';
  currentParam.parentObject = 'include_details';
  currentParam.title = texts.param_items_invoice_details_dimensions;
  currentParam.type = 'string';
  currentParam.value = userParam.items_invoice_details_dimensions ? userParam.items_invoice_details_dimensions : '';
  currentParam.defaultvalue = '50%;10%;10%;15%;15%';
  currentParam.tooltip = texts.param_tooltip_items_invoice_details_dimensions;
  currentParam.readValue = function() {
    userParam.items_invoice_details_dimensions = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'details_gross_amounts';
  currentParam.parentObject = 'include_details';
  currentParam.title = texts.param_details_gross_amounts;
  currentParam.type = 'bool';
  currentParam.value = userParam.details_gross_amounts ? true : false;
  currentParam.defaultvalue = false;
  currentParam.tooltip = texts.param_tooltip_details_gross_amounts;
  currentParam.readValue = function() {
   userParam.details_gross_amounts = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'include_footer';
  currentParam.parentObject = 'include';
  currentParam.title = texts.param_include_footer;
  currentParam.type = 'string';
  currentParam.value = '';
  currentParam.editable = false;
  currentParam.readValue = function() {
    userParam.include_footer = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'add_footer';
  currentParam.parentObject = 'include_footer';
  currentParam.title = texts.param_add_footer;
  currentParam.type = 'bool';
  currentParam.value = userParam.add_footer ? true : false;
  currentParam.defaultvalue = false;
  currentParam.tooltip = texts.add_footer;
  currentParam.readValue = function() {
   userParam.add_footer = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'footer_left';
  currentParam.parentObject = 'include_footer';
  currentParam.title = texts.param_footer_left;
  currentParam.type = 'string';
  currentParam.value = userParam.footer_left ? userParam.footer_left : '';
  currentParam.defaultvalue = '';
  currentParam.tooltip = texts.param_tooltip_footer;
  currentParam.readValue = function() {
   userParam.footer_left = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'footer_center';
  currentParam.parentObject = 'include_footer';
  currentParam.title = texts.param_footer_center;
  currentParam.type = 'string';
  currentParam.value = userParam.footer_center ? userParam.footer_center : '';
  currentParam.defaultvalue = '';
  currentParam.tooltip = texts.param_tooltip_footer;
  currentParam.readValue = function() {
   userParam.footer_center = this.value;
  }
  convertedParam.data.push(currentParam); 

  currentParam = {};
  currentParam.name = 'footer_right';
  currentParam.parentObject = 'include_footer';
  currentParam.title = texts.param_footer_right;
  currentParam.type = 'string';
  currentParam.value = userParam.footer_right ? userParam.footer_right : '';
  currentParam.defaultvalue = texts.page+' &['+texts.page+']';
  currentParam.tooltip = texts.param_tooltip_footer;
  currentParam.readValue = function() {
   userParam.footer_right = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'qr_code';
  currentParam.parentObject = 'include';
  currentParam.title = texts.param_qr_code;
  currentParam.type = 'string';
  currentParam.value = '';
  currentParam.editable = false;
  currentParam.readValue = function() {
    userParam.qr_code = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'add_qr_code';
  currentParam.parentObject = 'qr_code';
  currentParam.title = texts.param_add_qr_code;
  currentParam.type = 'bool';
  currentParam.value = userParam.add_qr_code ? true : false;
  currentParam.defaultvalue = false;
  currentParam.tooltip = texts.param_tooltip_add_qr_code;
  currentParam.readValue = function() {
   userParam.add_qr_code = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'use_different_address';
  currentParam.parentObject = 'qr_code';
  currentParam.title = texts.param_use_different_address;
  currentParam.type = 'bool';
  currentParam.value = userParam.use_different_address ? true : false;
  currentParam.defaultvalue = false;
  currentParam.tooltip = texts.param_tooltip_use_different_address;
  currentParam.readValue = function() {
   userParam.use_different_address = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'address_row_1';
  currentParam.parentObject = 'qr_code';
  currentParam.title = texts.param_address_row_1;
  currentParam.type = 'string';
  currentParam.value = userParam.address_row_1 ? userParam.address_row_1 : '';
  currentParam.defaultvalue = '';
  currentParam.tooltip = '';
  currentParam.readValue = function() {
    userParam.address_row_1 = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'address_row_2';
  currentParam.parentObject = 'qr_code';
  currentParam.title = texts.param_address_row_2;
  currentParam.type = 'string';
  currentParam.value = userParam.address_row_2 ? userParam.address_row_2 : '';
  currentParam.defaultvalue = '';
  currentParam.tooltip = '';
  currentParam.readValue = function() {
    userParam.address_row_2 = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'address_row_3';
  currentParam.parentObject = 'qr_code';
  currentParam.title = texts.param_address_row_3;
  currentParam.type = 'string';
  currentParam.value = userParam.address_row_3 ? userParam.address_row_3 : '';
  currentParam.defaultvalue = '';
  currentParam.tooltip = '';
  currentParam.readValue = function() {
    userParam.address_row_3 = this.value;
  }
  convertedParam.data.push(currentParam);



  /*******************************************************************************************
  * TEXTS
  ********************************************************************************************/
  currentParam = {};
  currentParam.name = 'texts';
  currentParam.title = texts.param_texts;
  currentParam.type = 'string';
  currentParam.value = '';
  currentParam.editable = false;
  currentParam.readValue = function() {
    userParam.texts = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'add_language';
  currentParam.parentObject = 'texts';
  currentParam.title = texts.param_add_language;
  currentParam.type = 'string';
  currentParam.value = userParam.add_language ? userParam.add_language : '';
  currentParam.defaultvalue = '';
  currentParam.tooltip = texts.param_tooltip_add_language;
  currentParam.readValue = function() {
    userParam.add_language = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'texts_language_en';
  currentParam.parentObject = 'texts';
  currentParam.title = texts.param_texts_language_en;
  currentParam.type = 'string';
  currentParam.value = '';
  currentParam.editable = false;
  currentParam.readValue = function() {
    userParam.texts_language_en = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'texts_info_invoice_number_text';
  currentParam.parentObject = 'texts_language_en';
  currentParam.title = texts.param_texts_info_invoice_number_text;
  currentParam.type = 'string';
  currentParam.value = userParam.texts_info_invoice_number_text ? userParam.texts_info_invoice_number_text : '';
  currentParam.defaultvalue = texts.invoice;
  currentParam.tooltip = texts.param_tooltip_texts_info_invoice_number_text;
  currentParam.readValue = function() {
    userParam.texts_info_invoice_number_text = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'texts_info_date_text';
  currentParam.parentObject = 'texts_language_en';
  currentParam.title = texts.param_texts_info_date_text;
  currentParam.type = 'string';
  currentParam.value = userParam.texts_info_date_text ? userParam.texts_info_date_text : '';
  currentParam.defaultvalue = texts.date;
  currentParam.tooltip = texts.param_tooltip_texts_info_date_text;
  currentParam.readValue = function() {
    userParam.texts_info_date_text = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'texts_info_customer_text';
  currentParam.parentObject = 'texts_language_en';
  currentParam.title = texts.param_texts_info_customer_text;
  currentParam.type = 'string';
  currentParam.value = userParam.texts_info_customer_text ? userParam.texts_info_customer_text : '';
  currentParam.defaultvalue = texts.customer;
  currentParam.tooltip = texts.param_tooltip_texts_info_customer_text;
  currentParam.readValue = function() {
    userParam.texts_info_customer_text = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'texts_info_customer_vat_number';
  currentParam.parentObject = 'texts_language_en';
  currentParam.title = texts.param_texts_info_customer_vat_number;
  currentParam.type = 'string';
  currentParam.value = userParam.texts_info_customer_vat_number ? userParam.texts_info_customer_vat_number : '';
  currentParam.defaultvalue = texts.vat_number;
  currentParam.tooltip = texts.param_tooltip_texts_info_customer_vat_number_text;
  currentParam.readValue = function() {
    userParam.texts_info_customer_vat_number = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'texts_info_customer_fiscal_number';
  currentParam.parentObject = 'texts_language_en';
  currentParam.title = texts.param_texts_info_customer_fiscal_number;
  currentParam.type = 'string';
  currentParam.value = userParam.texts_info_customer_fiscal_number ? userParam.texts_info_customer_fiscal_number : '';
  currentParam.defaultvalue = texts.fiscal_number;
  currentParam.tooltip = texts.param_tooltip_texts_info_customer_fiscal_number;
  currentParam.readValue = function() {
    userParam.texts_info_customer_fiscal_number = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'texts_info_due_date_text';
  currentParam.parentObject = 'texts_language_en';
  currentParam.title = texts.param_texts_info_due_date_text;
  currentParam.type = 'string';
  currentParam.value = userParam.texts_info_due_date_text ? userParam.texts_info_due_date_text : '';
  currentParam.defaultvalue = texts.payment_terms_label;
  currentParam.tooltip = texts.param_tooltip_texts_payment_terms_label;
  currentParam.readValue = function() {
    userParam.texts_info_due_date_text = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'texts_info_page_text';
  currentParam.parentObject = 'texts_language_en';
  currentParam.title = texts.param_texts_info_page_text;
  currentParam.type = 'string';
  currentParam.value = userParam.texts_info_page_text ? userParam.texts_info_page_text : '';
  currentParam.defaultvalue = texts.page;
  currentParam.tooltip = texts.param_tooltip_texts_info_page_text;
  currentParam.readValue = function() {
    userParam.texts_info_page_text = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'texts_shipping_address';
  currentParam.parentObject = 'texts_language_en';
  currentParam.title = texts.param_texts_shipping_address;
  currentParam.type = 'string';
  currentParam.value = userParam.texts_shipping_address ? userParam.texts_shipping_address : '';
  currentParam.defaultvalue = texts.shipping_address;
  currentParam.tooltip = texts.param_tooltip_texts_shipping_address;
  currentParam.readValue = function() {
    userParam.texts_shipping_address = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'title_doctype_10';
  currentParam.parentObject = 'texts_language_en';
  currentParam.title = texts.param_title_doctype_10;
  currentParam.type = 'string';
  currentParam.value = userParam.title_doctype_10 ? userParam.title_doctype_10 : '';
  currentParam.defaultvalue = texts.invoice + " <DocInvoice>";
  currentParam.tooltip = texts.param_tooltip_title_doctype_10;
  currentParam.readValue = function() {
    userParam.title_doctype_10 = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'title_doctype_12';
  currentParam.parentObject = 'texts_language_en';
  currentParam.title = texts.param_title_doctype_12;
  currentParam.type = 'string';
  currentParam.value = userParam.title_doctype_12 ? userParam.title_doctype_12 : '';
  currentParam.defaultvalue = texts.credit_note  + " <DocInvoice>";
  currentParam.tooltip = texts.param_tooltip_title_doctype_12;
  currentParam.readValue = function() {
    userParam.title_doctype_12 = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'texts_items_details_columns';
  currentParam.parentObject = 'texts_language_en';
  currentParam.title = texts.param_texts_items_details_columns;
  currentParam.type = 'string';
  currentParam.value = userParam.texts_items_details_columns ? userParam.texts_items_details_columns : '';
  currentParam.defaultvalue = texts.description+";"+texts.quantity+";"+texts.reference_unit+";"+texts.unit_price+";"+texts.amount;
  currentParam.tooltip = texts.param_tooltip_texts_items_details_columns;
  currentParam.readValue = function() {
    userParam.texts_items_details_columns = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'texts_total';
  currentParam.parentObject = 'texts_language_en';
  currentParam.title = texts.param_texts_total;
  currentParam.type = 'string';
  currentParam.value = userParam.texts_total ? userParam.texts_total : '';
  currentParam.defaultvalue = texts.total;
  currentParam.tooltip = texts.param_tooltip_texts_total;
  currentParam.readValue = function() {
    userParam.texts_total = this.value;
  }
  convertedParam.data.push(currentParam);






  /*******************************************************************************************
  * STYLES
  *******************************************************************************************/
  currentParam = {};
  currentParam.name = 'styles';
  currentParam.title = texts.param_styles;
  currentParam.type = 'string';
  currentParam.value = '';
  currentParam.editable = false;
  currentParam.readValue = function() {
    userParam.param_styles = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'font_family';
  currentParam.parentObject = 'styles';
  currentParam.title = texts.param_font_family;
  currentParam.type = 'string';
  currentParam.value = userParam.font_family ? userParam.font_family : 'Helvetica';
  currentParam.defaultvalue = 'Helvetica';
  currentParam.tooltip = texts.param_tooltip_font_family;
  currentParam.readValue = function() {
   userParam.font_family = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'font_size';
  currentParam.parentObject = 'styles';
  currentParam.title = texts.param_font_size;
  currentParam.type = 'string';
  currentParam.value = userParam.font_size ? userParam.font_size : '10';
  currentParam.defaultvalue = '10';
  currentParam.tooltip = texts.param_tooltip_font_size;
  currentParam.readValue = function() {
   userParam.font_size = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'background_color_1';
  currentParam.parentObject = 'styles';
  currentParam.title = texts.param_background_color_1;
  currentParam.type = 'string';
  currentParam.value = userParam.background_color_1 ? userParam.background_color_1 : '#337ab7';
  currentParam.defaultvalue = '#337ab7';
  currentParam.tooltip = texts.param_tooltip_background_color_1;
  currentParam.readValue = function() {
   userParam.background_color_1 = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'color';
  currentParam.parentObject = 'styles';
  currentParam.title = texts.param_color;
  currentParam.type = 'string';
  currentParam.value = userParam.color ? userParam.color : '#ffffff';
  currentParam.defaultvalue = '#ffffff';
  currentParam.tooltip = texts.param_tooltip_color;
  currentParam.readValue = function() {
   userParam.color = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'background_color_2';
  currentParam.parentObject = 'styles';
  currentParam.title = texts.param_background_color_2;
  currentParam.type = 'string';
  currentParam.value = userParam.background_color_2 ? userParam.background_color_2 : '#F0F8FF';
  currentParam.defaultvalue = '#F0F8FF';
  currentParam.tooltip = texts.param_tooltip_background_color_2;
  currentParam.readValue = function() {
   userParam.background_color_2 = this.value;
  }
  convertedParam.data.push(currentParam);



  /*******************************************************************************************
  * EMBEDDED JAVASCRIPT FILEE
  *******************************************************************************************/
  currentParam = {};
  currentParam.name = 'embedded_javascript';
  currentParam.title = texts.param_embedded_javascript;
  currentParam.type = 'string';
  currentParam.value = '';
  currentParam.editable = false;
  currentParam.readValue = function() {
    userParam.embedded_javascript = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'embedded_javascript_filename';
  currentParam.parentObject = 'embedded_javascript';
  currentParam.title = texts.param_embedded_javascript_filename;
  currentParam.type = 'string';
  currentParam.value = userParam.embedded_javascript_filename ? userParam.embedded_javascript_filename : '';
  currentParam.defaultvalue = '';
  currentParam.tooltip = texts.param_tooltip_javascript_filename;
  currentParam.readValue = function() {
   userParam.embedded_javascript_filename = this.value;
  }
  convertedParam.data.push(currentParam);



  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // ADD A NEW LANGUAGE
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  /* 
  if (userParam.add_language) {

    var languageCode = userParam.add_language;

    //if (convertedParam.added_languages.indexOf(languageCode) < 0) {

      Banana.console.log("New language: " + languageCode);
      added_languages.push(languageCode);


      currentParam = {};
      currentParam.name = languageCode;
      currentParam.parentObject = 'texts';
      currentParam.title = texts.languageCode;
      currentParam.type = 'string';
      currentParam.value = '';
      currentParam.editable = false;
      currentParam.readValue = function() {
        userParam.languageCode = this.value;
      }
      convertedParam.data.push(currentParam);

      currentParam = {};
      currentParam.name = languageCode+'_texts_info_invoice_number_text';
      currentParam.parentObject = languageCode;
      currentParam.title = texts.param_texts_info_invoice_number_text;
      currentParam.type = 'string';
      currentParam.value = userParam[languageCode+'_texts_info_invoice_number_text'] ? userParam[languageCode+'_texts_info_invoice_number_text'] : ''; //param.xxx ? param.xxx : ''
      currentParam.defaultvalue = '';
      currentParam.tooltip = texts.param_tooltip_texts_info_invoice_number_text;
      currentParam.readValue = function() {
        userParam[languageCode+'_texts_info_invoice_number_text'] = this.value;
      }
      convertedParam.data.push(currentParam);

    //}

  }

  */

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  return convertedParam;
}

function initParam() {
  var userParam = {};

  var lang = 'en';
  if (Banana.document.locale)
    lang = Banana.document.locale;
  if (lang.length > 2)
    lang = lang.substr(0, 2);
  var texts = setInvoiceTexts(lang);

  //Include
  userParam.print_header = true;
  userParam.header_left = false;
  userParam.header_row_1 = "";
  userParam.header_row_2 = "";
  userParam.header_row_3 = "";
  userParam.header_row_4 = "";
  userParam.header_row_5 = "";
  userParam.print_logo = true;
  userParam.logo_name = 'Logo';
  userParam.small_address_line = '<none>';
  userParam.address_left = false;
  userParam.shipping_address = false;
  userParam.info_invoice_number = true;
  userParam.info_date = true;
  userParam.info_customer = true;
  userParam.info_customer_vat_number = false;
  userParam.info_customer_fiscal_number = false
  userParam.info_due_date = true;
  userParam.info_page = true;
  userParam.items_invoice_details = texts.description+";"+texts.qty+";"+texts.unit+";"+texts.unit_price+";"+texts.amount;
  userParam.items_invoice_details_dimensions = '50%;10%;10%;15%;15%';
  userParam.details_gross_amounts = false;
  userParam.add_footer = false;
  userParam.footer_left = texts.invoice;
  userParam.footer_center = '';
  userParam.footer_right = texts.page+' &['+texts.page+']';
  userParam.add_qr_code = false;
  userParam.use_different_address = false;
  userParam.address_row_1 = '';
  userParam.address_row_2 = '';
  userParam.address_row_3 = '';

  //Texts
  userParam.add_language = "";
  userParam.texts_info_invoice_number_text = texts.invoice;
  userParam.texts_info_date_text = texts.date;
  userParam.texts_info_customer_text = texts.customer;
  userParam.texts_info_customer_vat_number = texts.vat_number;
  userParam.texts_info_customer_fiscal_number = texts.fiscal_number;
  userParam.texts_info_due_date_text = texts.payment_terms_label;
  userParam.texts_info_page_text = texts.page;
  userParam.texts_shipping_address = texts.shipping_address;
  userParam.title_doctype_10 = texts.invoice + " <DocInvoice>";
  userParam.title_doctype_12 = texts.credit_note + " <DocInvoice>";
  userParam.texts_items_details_columns = texts.description+";"+texts.qty+";"+texts.unit+";"+texts.unit_price+";"+texts.amount;
  userParam.texts_total = texts.total;

  //Styles
  userParam.background_color_1 = '#337ab7';
  userParam.color = '#ffffff';
  userParam.background_color_2 = '#F0F8FF';
  userParam.color_4 = '';
  userParam.font_family = 'Helvetica';
  userParam.font_size = '10';
  userParam.address_margin_left = '113';
  userParam.address_margin_top = '45';

  //Embedded JavaScript file
  userParam.embedded_javascript_filename = '';

  return userParam;
}

function verifyParam(userParam) {

  var lang = 'en';
  if (Banana.document.locale)
    lang = Banana.document.locale;
  if (lang.length > 2)
    lang = lang.substr(0, 2);
  var texts = setInvoiceTexts(lang);

  //Include
  if (!userParam.print_header) {
    userParam.print_header = false;
  }
  if (!userParam.header_left) {
    userParam.header_left = false;
  }
  if(!userParam.header_row_1) {
    userParam.header_row_1 = '';
  }
  if(!userParam.header_row_2) {
    userParam.header_row_2 = '';
  }
  if(!userParam.header_row_3) {
    userParam.header_row_3 = '';
  }
  if(!userParam.header_row_4) {
    userParam.header_row_4 = '';
  }
  if(!userParam.header_row_5) {
    userParam.header_row_5 = '';
  }
  if (!userParam.print_logo) {
    userParam.print_logo = false;
  }
  if (!userParam.logo_name) {
    userParam.logo_name = 'Logo';
  }
  if (!userParam.small_address_line) {
    userParam.small_address_line = '';
  }
  if (!userParam.address_left) {
    userParam.address_left = false;
  }
  if (!userParam.shipping_address) {
    userParam.shipping_address = false;
  }
  if (!userParam.info_invoice_number) {
    userParam.info_invoice_number = false;
  }
  if (!userParam.info_date) {
    userParam.info_date = false;
  }
  if (!userParam.info_customer) {
    userParam.info_customer = false;
  }
  if (!userParam.info_customer_vat_number) {
    userParam.info_customer_vat_number = false;
  }
  if (!userParam.info_customer_fiscal_number) {
    userParam.info_customer_fiscal_number = false;
  }
  if (!userParam.info_due_date) {
    userParam.info_due_date = false;
  }
  if (!userParam.info_page) {
    userParam.info_page = false;
  }
  if (!userParam.items_invoice_details) {
    userParam.items_invoice_details = texts.description+";"+texts.quantity+";"+texts.reference_unit+";"+texts.unit_price+";"+texts.amount;
  }
  if (!userParam.items_invoice_details_dimensions) {
    userParam.items_invoice_details_dimensions = '50%;10%;10%;15%;15%';
  }
  if (!userParam.details_gross_amounts) {
    userParam.details_gross_amounts = false;
  }
  if (!userParam.add_footer) {
    userParam.add_footer = false;
  }
  if (!userParam.footer_left) {
    userParam.footer_left = texts.invoice;
  }
  if (!userParam.footer_center) {
    userParam.footer_center = '';
  }
  if (!userParam.footer_right) {
    userParam.footer_right = texts.page+' &['+texts.page+']';
  }
  if (!userParam.add_qr_code) {
    userParam.add_qr_code = false;
  }
  if (!userParam.use_different_address) {
    userParam.use_different_address = false;
  }
  if (!userParam.address_row_1) {
    userParam.address_row_1 = '';
  }
  if (!userParam.address_row_2) {
    userParam.address_row_2 = '';
  }
  if (!userParam.address_row_3) {
    userParam.address_row_3 = '';
  }


  //Texts
  if (!userParam.add_language) {
    userParam.add_language = '';
  }
  if (!userParam.texts_info_invoice_number_text) {
    userParam.texts_info_invoice_number_text = texts.invoice;
  }
  if (!userParam.texts_info_date_text) {
    userParam.texts_info_date_text = texts.date;
  }
  if (!userParam.texts_info_customer_text) {
    userParam.texts_info_customer_text = texts.customer;
  }
  if (!userParam.texts_info_customer_vat_number) {
    userParam.texts_info_customer_vat_number = texts.vat_number;
  }
  if (!userParam.texts_info_customer_fiscal_number) {
    userParam.texts_info_customer_fiscal_number = texts.fiscal_number;
  }
  if (!userParam.texts_info_due_date_text) {
    userParam.texts_info_due_date_text = texts.payment_terms_label;
  }
  if (!userParam.texts_info_page_text) {
    userParam.texts_info_page_text = texts.page;
  }
  if (!userParam.texts_shipping_address) {
    userParam.texts_shipping_address = texts.shipping_address;
  }
  if (!userParam.title_doctype_10) {
    userParam.title_doctype_10 = texts.invoice + " <DocInvoice>";
  }
  if (!userParam.title_doctype_12) {
    userParam.title_doctype_12 = texts.credit_note + " <DocInvoice>";
  }
  if (!userParam.texts_items_details_columns) {
    userParam.texts_items_details_columns = texts.description+";"+texts.quantity+";"+texts.reference_unit+";"+texts.unit_price+";"+texts.amount;
  }
  if (!userParam.texts_total) {
    userParam.texts_total = texts.total;
  }


  // Styles
  if (!userParam.background_color_1) {
    userParam.background_color_1 = '#337ab7';
  }
  if (!userParam.color) {
    userParam.color = '#ffffff';
  }
  if (!userParam.background_color_2) {
    userParam.background_color_2 = '#F0F8FF';
  }
  if (!userParam.color_4) {
    userParam.color_4 = '';
  }
  if (!userParam.font_family) {
    userParam.font_family = 'Helvetica';
  }
  if (!userParam.font_size) {
    userParam.font_size = '10';
  }
  if (!userParam.address_margin_left) {
    userParam.address_margin_left = '113';
  }
  if (!userParam.address_margin_top) {
    userParam.address_margin_top = '45';
  }

  //Embedded JavaScript files
  if (!userParam.embedded_javascript_filename) {
    userParam.embedded_javascript_filename = '';
  }

  return userParam;
}

/* Check if there are javascript (.js) files in the table Documents */
function includeEmbeddedJavascriptFile(texts, userParam) {

  // User entered a javascript file name
  // Take from the table documents all the javascript file names
  if (userParam.embedded_javascript_filename) {
    
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

    // Table documents contains javascript files
    if (jsFiles.length > 0) {

      // The javascript file name entered by user exists on documents table. Include this file
      if (jsFiles.indexOf(userParam.embedded_javascript_filename) > -1) {
        try {
          Banana.include("documents:" + userParam.embedded_javascript_filename);
        }
        catch(error) {
          Banana.document.addMessage(texts.embedded_javascript_file_not_found);
        }
      }
    }
  }
}


//====================================================================//
// MAIN FUNCTIONS THAT PRINT THE INVOICE
//====================================================================//
function printDocument(jsonInvoice, repDocObj, repStyleObj) {
  var userParam = initParam();
  var savedParam = Banana.document.getScriptSettings();
  if (savedParam.length > 0) {
    userParam = JSON.parse(savedParam);
    userParam = verifyParam(userParam);
  }

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

  // Include the embedded javascript file entered by the user
  includeEmbeddedJavascriptFile(texts, userParam);

  // Set the stylesheet
  if (!repStyleObj) {
    repStyleObj = reportObj.newStyleSheet();
  }

  /*
    variable starts with $
  */
  var cssVariables = {};
  set_css_variables(repStyleObj, cssVariables, userParam);
  set_invoice_style(repStyleObj, cssVariables, userParam);
  
  // Print the invoice document
  repDocObj = printInvoice(jsonInvoice, repDocObj, texts, userParam, repStyleObj, invoiceObj);
}

function printInvoice(jsonInvoice, repDocObj, texts, userParam, repStyleObj, invoiceObj) {
  
  // Invoice document
  var reportObj = Banana.Report;
  if (!repDocObj) {
    repDocObj = reportObj.newReport(getTitle(invoiceObj, texts, userParam) + " " + invoiceObj.document_info.number);
  } else {
    var pageBreak = repDocObj.addPageBreak();
    //pageBreak.addClass("pageReset");
  }

  /* Header */
  if (typeof(hook_print_header) === typeof(Function)) {
    hook_print_header(repDocObj);
  } else {
    print_header(repDocObj, userParam, repStyleObj, invoiceObj);
  }

  /* Invoice texts info */
  if (typeof(hook_print_info) === typeof(Function)) {
    hook_print_info(repDocObj, invoiceObj, texts, userParam);
  } else {
    print_info(repDocObj, invoiceObj, texts, userParam);
  }

  /* Customer address */
  if (typeof(hook_print_customer_address) === typeof(Function)) {
    hook_print_customer_address(repDocObj, invoiceObj, userParam);
  } else {
    print_customer_address(repDocObj, invoiceObj, userParam);
  }

  /* Billing/Shipping addresses */
  if (userParam.shipping_address) {
    if (typeof(hook_print_shipping_address) === typeof(Function)) {
      hook_print_shipping_address(repDocObj, invoiceObj, texts, userParam);
    } else {
      print_shipping_address(repDocObj, invoiceObj, texts, userParam);
    }
  }

  /* Begin text (before invoice details table) */
  if (typeof(hook_print_text_begin) === typeof(Function)) {
    hook_print_text_begin(repDocObj, invoiceObj, texts, userParam);
  } else {
    print_text_begin(repDocObj, invoiceObj, texts, userParam);
  }

  /* Invoice texts info for pages 2+ */
  if (typeof(hook_print_info) === typeof(Function)) {
    hook_print_info(repDocObj.getHeader(), invoiceObj, texts, userParam, "info_table_row0");
  } else {
    print_info(repDocObj.getHeader(), invoiceObj, texts, userParam, "info_table_row0");
  }

  /* Invoice details */
  var detailsTable = repDocObj.addTable("doc_table");
  if (userParam.details_gross_amounts) {
    if (typeof(hook_print_details_gross_amounts) === typeof(Function)) {
      hook_print_details_gross_amounts(repDocObj, invoiceObj, texts, userParam, detailsTable);
    } else {
      print_details_gross_amounts(repDocObj, invoiceObj, texts, userParam, detailsTable);
    }
  }
  else {
    if (typeof(hook_print_details_net_amounts) === typeof(Function)) {
      hook_print_details_net_amounts(repDocObj, invoiceObj, texts, userParam, detailsTable);
    } else {
      print_details_net_amounts(repDocObj, invoiceObj, texts, userParam, detailsTable);
    }
  }

  /* Final texts  (after invoice details table) */
  if (typeof(hook_print_final_texts) === typeof(Function)) {
    hook_print_final_texts(repDocObj, invoiceObj, detailsTable);
  } else {
    print_final_texts(repDocObj, invoiceObj, detailsTable);
  }

  /* Footer */
  if (typeof(hook_print_footer) === typeof(Function)) {
    hook_print_footer(repDocObj, texts, userParam);
  } else {
    print_footer(repDocObj, texts, userParam);
  }




  var d = new Date();
  Banana.console.log("PrintInvoice() FINISHED... " + d);




  return repDocObj;
}






//====================================================================//
// FUNCTIONS THAT PRINT ALL THE DIFFERENT PARTS OF THE INVOICE.
// USER CAN REPLACE THEM WITH 'HOOK' FUNCTIONS DEFINED ON EMBEDDED 
// JAVASCRIPT FILES OF THE DOCUMENTS TABLE
//====================================================================//
function print_header(repDocObj, userParam, repStyleObj, invoiceObj) {
  var headerLogoSection = repDocObj.addSection("");
  if (userParam.print_logo) {
    var logoFormat = Banana.Report.logoFormat(userParam.logo_name); //Logo
    if (logoFormat) {
      var logoElement = logoFormat.createDocNode(headerLogoSection, repStyleObj, "logo");
      repDocObj.getHeader().addChild(logoElement);
    }
  }

  if (userParam.print_header) {

    if (userParam.header_left) {
      var headerParagraph = repDocObj.getHeader().addSection("header_left_text");
    } else {
      var headerParagraph = repDocObj.getHeader().addSection("header_right_text");
    }

    if (userParam.header_row_1) {
      if (userParam.header_row_1.length > 0) {
        headerParagraph.addParagraph(userParam.header_row_1, "").setStyleAttributes("font-weight:bold; font-size:16pt; color:" + userParam.background_color_1);
      }
      if (userParam.header_row_2.length > 0) {
        headerParagraph.addParagraph(userParam.header_row_2, "").setStyleAttributes("font-weight:bold; font-size:10pt;");
      }
      if (userParam.header_row_3.length > 0) {
        headerParagraph.addParagraph(userParam.header_row_3, "").setStyleAttributes("font-weight:bold; font-size:10pt;");
      }
      if (userParam.header_row_4.length > 0) {
        headerParagraph.addParagraph(userParam.header_row_4, "").setStyleAttributes("font-weight:bold; font-size:10pt;");
      }
      if (userParam.header_row_5.length > 0) {
        headerParagraph.addParagraph(userParam.header_row_5, "").setStyleAttributes("font-weight:bold; font-size:10pt;");
      }
    }
    else {
      var supplierNameLines = getInvoiceSupplierName(invoiceObj.supplier_info).split('\n');
      for (var i = 0; i < supplierNameLines.length; i++) {
        headerParagraph.addParagraph(supplierNameLines[i], "").setStyleAttributes("font-weight:bold; font-size:16pt; color:" + userParam.background_color_1);
      }
      var supplierLines = getInvoiceSupplier(invoiceObj.supplier_info).split('\n');
      for (var i = 0; i < supplierLines.length; i++) {
        headerParagraph.addParagraph(supplierLines[i], "").setStyleAttributes("font-weight:bold; font-size:10pt;");
      }      
    }
  }
}

function print_info(repDocObj, invoiceObj, texts, userParam, tableStyleRow0) {

  var infoTable = "";

  // info table that starts at row 0, for pages 2+
  if (tableStyleRow0) {
    infoTable = repDocObj.addTable(tableStyleRow0);
  }
  else {
    if (userParam.address_left) {
      infoTable = repDocObj.addTable("info_table_right");
    } else {
      infoTable = repDocObj.addTable("info_table_left");
    }
  }

  if (userParam.info_invoice_number) {
    tableRow = infoTable.addRow();
    tableRow.addCell(userParam.texts_info_invoice_number_text + ":","",1);
    tableRow.addCell(invoiceObj.document_info.number,"",1);
  }
  if (userParam.info_date) {
    tableRow = infoTable.addRow();
    tableRow.addCell(userParam.texts_info_date_text + ":","",1);
    tableRow.addCell(Banana.Converter.toLocaleDateFormat(invoiceObj.document_info.date),"",1);    
  }
  if (userParam.info_customer) {
    tableRow = infoTable.addRow();
    tableRow.addCell(userParam.texts_info_customer_text + ":","",1);
    tableRow.addCell(invoiceObj.customer_info.number,"",1);    
  }
  if (userParam.info_customer_vat_number) {
    tableRow = infoTable.addRow();
    tableRow.addCell(userParam.texts_info_customer_vat_number + ":","",1);
    tableRow.addCell(invoiceObj.customer_info.vat_number);
  }
  if (userParam.info_customer_fiscal_number) {
    tableRow = infoTable.addRow();
    tableRow.addCell(userParam.texts_info_customer_fiscal_number + ":","",1);
    tableRow.addCell(invoiceObj.customer_info.fiscal_number);
  }
  if (userParam.info_due_date) {
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
    tableRow.addCell(userParam.texts_info_due_date_text + ":","",1);
    tableRow.addCell(payment_terms,"",1);    
  }
  if (userParam.info_page) {
    tableRow = infoTable.addRow();
    tableRow.addCell(userParam.texts_info_page_text + ":","",1);
    tableRow.addCell("","",1).addFieldPageNr();    
  }
}

function print_customer_address(repDocObj, invoiceObj, userParam) {
  var customerAddressTable = "";
  if (userParam.address_left) {
    customerAddressTable = repDocObj.addTable("address_table_left");
  } else {
    customerAddressTable = repDocObj.addTable("address_table_right");
  }
  //Small line of the supplier address
  tableRow = customerAddressTable.addRow();
  var cell = tableRow.addCell("", "", 1);
  if (userParam.small_address_line) {
    if (userParam.small_address_line === "<none>") {
      cell.addText("","");
    } else {
      cell.addText(userParam.small_address_line, "small_address");
    }
  }
  else {
    var supplierNameLines = getInvoiceSupplierName(invoiceObj.supplier_info).split('\n');
    cell.addText(supplierNameLines[0], "small_address");
    var supplierLines = getInvoiceSupplier(invoiceObj.supplier_info).split('\n');
    cell.addText(" - " + supplierLines[0] + " - " + supplierLines[1], "small_address");
  }
  
  // Invoice address / shipping address
  tableRow = customerAddressTable.addRow();
  var cell = tableRow.addCell("", "", 1);

  // Customer address
  var customerAddress = getInvoiceAddress(invoiceObj.customer_info).split('\n');
  for (var i = 0; i < customerAddress.length; i++) {
    cell.addParagraph(customerAddress[i]);
  }
}

function print_shipping_address(repDocObj, invoiceObj, texts, userParam) {

  var billingAndShippingAddress = repDocObj.addTable("shipping_address");
  var tableRow;

  tableRow = billingAndShippingAddress.addRow();
  var shippingCell = tableRow.addCell("","",1);

  // Shipping address
  if (invoiceObj.shipping_info.different_shipping_address) {
    if (userParam.texts_shipping_address) {
      shippingCell.addParagraph(userParam.texts_shipping_address,"").setStyleAttributes("font-weight:bold;color:"+userParam.background_color_1+";");
    } else {
      shippingCell.addParagraph(texts.shipping_address, "").setStyleAttributes("font-weight:bold;color:"+userParam.background_color_1+";");
    }
    var shippingAddress = getInvoiceAddress(invoiceObj.shipping_info).split('\n');
    for (var i = 0; i < shippingAddress.length; i++) {
      shippingCell.addParagraph(shippingAddress[i]);
    }
  }
}

// print befor details
function print_text_begin(repDocObj, invoiceObj, texts, userParam) {
  var docTypeTitle = getTitle(invoiceObj, texts, userParam);
  var table = repDocObj.addTable("begin_text_table");
  var tableRow;

  if (docTypeTitle) {
    tableRow = table.addRow();
    var titleCell = tableRow.addCell("","",1);
    titleCell.addParagraph(docTypeTitle.replace(/<DocInvoice>/g,invoiceObj.document_info.number), "title_text");
    titleCell.addParagraph("", "");
    titleCell.addParagraph("", "");
  }
  if (invoiceObj.document_info.text_begin) {
    tableRow = table.addRow();
    var textCell = tableRow.addCell("","begin_text",1);
    addMdBoldText(textCell, invoiceObj.document_info.text_begin);
    textCell.addParagraph(" ", "");
    textCell.addParagraph(" ", "");  
  }
}

/* Amounts net (VAT excluded) */
function print_details_net_amounts(repDocObj, invoiceObj, texts, userParam, detailsTable) {

  var columnsDimension = userParam.items_invoice_details_dimensions.split(";");

  //var repTableObj = repDocObj.addTable("doc_table");
  var repTableObj = detailsTable;
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
  var columnsSelected = userParam.items_invoice_details.split(";");
  var columnsNames = userParam.texts_items_details_columns.split(";");

  // remove all empty values ("", null, undefined): 
  columnsSelected = columnsSelected.filter(function(e){return e});
  columnsNames = columnsNames.filter(function(e){return e});

  if (userParam.texts_items_details_columns) {
    for (var i = 0; i < columnsNames.length; i++) {
      columnsNames[i] = columnsNames[i].trim();
      if (columnsNames[i] === "<none>") {
        header.addCell("", "doc_table_header", 1);
      } else {
        header.addCell(columnsNames[i], "doc_table_header center", 1);
      }
      _columns_number ++;
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
      classNameEvenRow = "even_rows_background_color";
    }

    tableRow = repTableObj.addRow();

    for (var j = 0; j < columnsSelected.length; j++) {
      if (columnsSelected[j] === "Description") {
        var descriptionCell = tableRow.addCell("", classNameEvenRow + " padding-left padding-right " + className, 1);
        descriptionCell.addParagraph(item.description);
        descriptionCell.addParagraph(item.description2);
      }
      else if (columnsSelected[j] === "Quantity" || columnsSelected[j] === "quantity") {
        // If referenceUnit is empty we do not print the quantity.
        // With this we can avoit to print the quantity "1.00" for transactions that do not have  quantity,unit,unitprice.
        // Default quantity uses 2 decimals. We check if there is a quantity with 4 decimals and in case we use it.
        if (item.mesure_unit) {
          var decimals = 2;
          var res = item.quantity.split(".");
          if (res[1].length == 4 && res[1] !== "0000") {
            decimals = 4;
          }
          tableRow.addCell(Banana.Converter.toLocaleNumberFormat(item.quantity,decimals), classNameEvenRow + " right padding-left padding-right " + className, 1);
        } else {
          tableRow.addCell("", classNameEvenRow + " right padding-left padding-right " + className, 1);
        }
      }
      else if (columnsSelected[j] === "ReferenceUnit" || columnsSelected[j] === "referenceunit" || columnsSelected[j] === "mesure_unit") {
        tableRow.addCell(item.mesure_unit, classNameEvenRow + " center padding-left padding-right " + className, 1);
      }
      else if (columnsSelected[j] === "UnitPrice" || columnsSelected[j] === "unitprice" || columnsSelected[j] === "unit_price") {
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(item.unit_price.calculated_amount_vat_exclusive), classNameEvenRow + " amount padding-left padding-right " + className, 1);
      }
      else if (columnsSelected[j] === "Amount" || columnsSelected[j] === "amount" || columnsSelected[j] === "total_amount_vat_exclusive") {
        tableRow.addCell(toInvoiceAmountFormat(invoiceObj, item.total_amount_vat_exclusive), classNameEvenRow + " right padding-left padding-right " + className, 1);
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

  //TOTAL NET
  if (invoiceObj.billing_info.total_vat_rates.length > 0) {
    tableRow = repTableObj.addRow();
    tableRow.addCell(texts.totalnet, "padding-left padding-right", _columns_number-1);
    tableRow.addCell(toInvoiceAmountFormat(invoiceObj, invoiceObj.billing_info.total_amount_vat_exclusive), "right padding-left padding-right", 1);

    for (var i = 0; i < invoiceObj.billing_info.total_vat_rates.length; i++) {
      tableRow = repTableObj.addRow();
      tableRow.addCell(texts.vat + " " + invoiceObj.billing_info.total_vat_rates[i].vat_rate + "% (" + toInvoiceAmountFormat(invoiceObj, invoiceObj.billing_info.total_vat_rates[i].total_amount_vat_exclusive) + ")", "padding-left padding-right", _columns_number-1);
      tableRow.addCell(toInvoiceAmountFormat(invoiceObj, invoiceObj.billing_info.total_vat_rates[i].total_vat_amount), "right padding-left padding-right", 1);
    }
  }

  //TOTAL ROUNDING DIFFERENCE
  if (invoiceObj.billing_info.total_rounding_difference.length) {
    tableRow = repTableObj.addRow();
    tableRow.addCell(texts.rounding, "padding-left padding-right", _columns_number-1);
    tableRow.addCell(toInvoiceAmountFormat(invoiceObj, invoiceObj.billing_info.total_rounding_difference), "right padding-left padding-right", 1);
  }
  tableRow = repTableObj.addRow();
  tableRow.addCell("", "thin-border-top", _columns_number);

  //FINAL TOTAL
  tableRow = repTableObj.addRow();
  tableRow.addCell(userParam.texts_total + " " + invoiceObj.document_info.currency, "total_cell", _columns_number-1);
  tableRow.addCell(toInvoiceAmountFormat(invoiceObj, invoiceObj.billing_info.total_to_pay), "total_cell right", 1);
  
  tableRow = repTableObj.addRow();
  tableRow.addCell("", "", _columns_number);


  // Print QR Code
  if (userParam.add_qr_code) {
    print_qr_code(invoiceObj, texts, userParam, repTableObj);
  }
}

/* Amount gross (VAT included) */
function print_details_gross_amounts(repDocObj, invoiceObj, texts, userParam, detailsTable) {

  var columnsDimension = userParam.items_invoice_details_dimensions.split(";");

  //var repTableObj = repDocObj.addTable("doc_table");
  var repTableObj = detailsTable;
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
  var columnsSelected = userParam.items_invoice_details.split(";");
  var columnsNames = userParam.texts_items_details_columns.split(";");

  // remove all empty values ("", null, undefined): 
  columnsSelected = columnsSelected.filter(function(e){return e});
  columnsNames = columnsNames.filter(function(e){return e});

  if (userParam.texts_items_details_columns) {
    for (var i = 0; i < columnsNames.length; i++) {
      columnsNames[i] = columnsNames[i].trim();
      if (columnsNames[i] === "<none>") {
        header.addCell("", "doc_table_header", 1);
      } else {
        header.addCell(columnsNames[i], "doc_table_header center", 1);
      }
      _columns_number ++;
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
      classNameEvenRow = "even_rows_background_color";
    }

    tableRow = repTableObj.addRow();

    for (var j = 0; j < columnsSelected.length; j++) {
      if (columnsSelected[j] === "Description") {
        var descriptionCell = tableRow.addCell("", classNameEvenRow + " padding-left padding-right " + className, 1);
        descriptionCell.addParagraph(item.description);
        descriptionCell.addParagraph(item.description2);
      }
      else if (columnsSelected[j] === "Quantity" || columnsSelected[j] === "quantity") {
        // If referenceUnit is empty we do not print the quantity.
        // With this we can avoit to print the quantity "1.00" for transactions that do not have  quantity,unit,unitprice.
        // Default quantity uses 2 decimals. We check if there is a quantity with 4 decimals and in case we use it.
        if (item.mesure_unit) {
          var decimals = 2;
          var res = item.quantity.split(".");
          if (res[1].length == 4 && res[1] !== "0000") {
            decimals = 4;
          }
          tableRow.addCell(Banana.Converter.toLocaleNumberFormat(item.quantity,decimals), classNameEvenRow + " right padding-left padding-right " + className, 1);
        } else {
          tableRow.addCell("", classNameEvenRow + " right padding-left padding-right " + className, 1);
        }
      }
      else if (columnsSelected[j] === "ReferenceUnit" || columnsSelected[j] === "referenceunit" || columnsSelected[j] === "mesure_unit") {
        tableRow.addCell(item.mesure_unit, classNameEvenRow + " center padding-left padding-right " + className, 1);
      }
      else if (columnsSelected[j] === "UnitPrice" || columnsSelected[j] === "unitprice" || columnsSelected[j] === "unit_price") {
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(item.unit_price.calculated_amount_vat_inclusive), classNameEvenRow + " right padding-left padding-right " + className, 1);
      }
      else if (columnsSelected[j] === "Amount" || columnsSelected[j] === "amount" || columnsSelected[j] === "total_amount_vat_inclusive") {
        tableRow.addCell(toInvoiceAmountFormat(invoiceObj, item.total_amount_vat_inclusive), classNameEvenRow + " right padding-left padding-right " + className, 1);
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

  //TOTAL ROUNDING DIFFERENCE
  if (invoiceObj.billing_info.total_rounding_difference.length) {
    tableRow = repTableObj.addRow();
    tableRow.addCell(texts.rounding, "padding-left padding-right", _columns_number-1);
    tableRow.addCell(toInvoiceAmountFormat(invoiceObj, invoiceObj.billing_info.total_rounding_difference), "right padding-left padding-right", 1);
  }
  tableRow = repTableObj.addRow();
  tableRow.addCell("", "", _columns_number);

  //FINAL TOTAL
  tableRow = repTableObj.addRow();
  tableRow.addCell(userParam.texts_total + " " + invoiceObj.document_info.currency, "total_cell", _columns_number-1);
  tableRow.addCell(toInvoiceAmountFormat(invoiceObj, invoiceObj.billing_info.total_to_pay), "total_cell right", 1);
  
  tableRow = repTableObj.addRow();
  tableRow.addCell("", "", _columns_number);

  //VAT INFO
  tableRow = repTableObj.addRow();
  var cellVatInfo = tableRow.addCell("", "padding-right right vat_info", _columns_number);
  for (var i = 0; i < invoiceObj.billing_info.total_vat_rates.length; i++) {
    var vatInfo = texts.vat + " " + invoiceObj.billing_info.total_vat_rates[i].vat_rate + "%";
    vatInfo += " = " + toInvoiceAmountFormat(invoiceObj, invoiceObj.billing_info.total_vat_rates[i].total_vat_amount) + " " + invoiceObj.document_info.currency;
    cellVatInfo.addParagraph(vatInfo);
  }
  
  tableRow = repTableObj.addRow();
  tableRow.addCell("", "", _columns_number);


  // Print QR Code
  if (userParam.add_qr_code) {
    print_qr_code(invoiceObj, texts, userParam, repTableObj);
  }
}

function print_qr_code(invoiceObj, texts, userParam, detailsTable) {
  var repTableObj = detailsTable;
  var text = '';
  text += 'Currency:\n';
  text += invoiceObj.document_info.currency+'\n';
  text += 'Amount:\n';
  text += invoiceObj.billing_info.total_amount_vat_inclusive+'\n';
  text += 'VAT amount:\n';
  text += invoiceObj.billing_info.total_vat_amount+'\n';
  text += 'Account/Payable to:\n';
  text += invoiceObj.supplier_info.business_name+'\n';
  text += invoiceObj.supplier_info.address1+'\n';
  text += invoiceObj.supplier_info.postal_code+" "+invoiceObj.supplier_info.city+'\n';
  text += 'Reference:\n';
  text += '12 00000 00001 12345 67890 09876\n';
  text += 'Addidtional information:\n';
  text += 'Invoice:'+invoiceObj.document_info.number+"/Date:"+invoiceObj.document_info.date+"/Customer number:"+invoiceObj.customer_info.number+"/Payment:"+invoiceObj.billing_info.payment_term+'\n';
  // for (var i = 0; i < invoiceObj.items.length; i++) {
  //   text += 'Description:'+invoiceObj.items[i].description+'/Amount:'+invoiceObj.items[i].total_amount_vat_inclusive+'\n';
  // }
  text += 'Payable by:\n';

  // User has checked to use another address
  if (userParam.use_different_address) {
    if (userParam.address_row_1) {
      text += userParam.address_row_1 + '\n';
    }
    if (userParam.address_row_2) {
      text += userParam.address_row_2 + '\n';
    }
    if (userParam.address_row_3) {
      text += userParam.address_row_3 + '\n';
    }
  }
  else {
    // Invoice address is used
    text += invoiceObj.customer_info.first_name+ ' '+invoiceObj.customer_info.last_name+'\n';
    text += invoiceObj.customer_info.address1+'\n';
    text += invoiceObj.customer_info.postal_code+ ' '+invoiceObj.customer_info.city+'\n';
  }

  var qrCodeParam = {};
  qrCodeParam.errorCorrectionLevel = 'M';
  qrCodeParam.binaryCodingVersion = 25;
  qrCodeParam.border = 0;

  var qrCodeSvgImage = Banana.Report.qrCodeImage(text, qrCodeParam);
  if (qrCodeParam.errorMsg && qrCodeParam.errorMsg.length>0) {
    Banana.document.addMessage(qrCodeParam.errorMsg);
  }
  if (qrCodeSvgImage) {
    tableRow = repTableObj.addRow();
    var qrCodeCell = tableRow.addCell("","",_columns_number);
    qrCodeCell.addParagraph(" ","");
    qrCodeCell.addImage(qrCodeSvgImage, 'qr_code');
    qrCodeCell.addParagraph(" ","");
    qrCodeCell.addParagraph(" ","");
  }
}

function print_final_texts(repDocObj, invoiceObj, detailsTable) {

  //var textsTable = repDocObj.addTable("table_texts");

  tableRow = detailsTable.addRow();
  tableRow.addCell(" ", "", _columns_number);

  // Template params, default text starts with "(" and ends with ")" (default), (Vorderfiniert)
  if (invoiceObj.template_parameters && invoiceObj.template_parameters.footer_texts) {
    repDocObj.addParagraph(" ", "");
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
      tableRow = detailsTable.addRow();
      var cellText = tableRow.addCell("","",_columns_number);
      addMdBoldText(cellText, text[i]);
    }
  }

  // Notes
  repDocObj.addParagraph(" ","");
  for (var i = 0; i < invoiceObj.note.length; i++) {
    if (invoiceObj.note[i].description) {
      tableRow = detailsTable.addRow();
      var cellText = tableRow.addCell("","", _columns_number);
      addMdBoldText(cellText, invoiceObj.note[i].description);
    }
  }

  // Greetings
  repDocObj.addParagraph(" ", "");
  if (invoiceObj.document_info.greetings) {
    tableRow = detailsTable.addRow();
    var cellText = tableRow.addCell("","",_columns_number);
    addMdBoldText(cellText, invoiceObj.document_info.greetings);
  }
}

/* print the footer at the bottom of the page */
function print_footer(repDocObj, texts, userParam) {

  /*
    Values "&[Page]", "&[Pagina]", "&[Seite]",.. are replaced with the page number.
    Values "&[Date]", "&[Data]", "&[Datum]",.. are replaced with the current day date.
    It is possible to add only one value in a row.
    It is possible to add more values on multiple rows.
    For empty value insert <none>.
  */

  if (userParam.add_footer) {
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
    if (userParam.footer_left && userParam.footer_left.length > 0) {
      var lines = userParam.footer_left.split("\n");
      for (var i = 0; i < lines.length; i++) {
        if (lines[i].indexOf("&["+texts.page+"]") > -1) {
          cell1.addParagraph(lines[i].replace("&["+texts.page+"]",""), "").addFieldPageNr();
        }
        else if (lines[i].indexOf("&["+texts.date+"]") > -1) {
          var date = new Date();
          date = Banana.Converter.toLocaleDateFormat(date);
          cell1.addParagraph(lines[i].replace("&["+texts.date+"]",date), "");
        }
        else {
          cell1.addParagraph(lines[i], "");
        }
      }
    }
    // footer center
    if (userParam.footer_center && userParam.footer_center.length > 0) {
      var lines = userParam.footer_center.split("\n");
      for (var i = 0; i < lines.length; i++) {
        if (lines[i].indexOf("&["+texts.page+"]") > -1) {
          cell2.addParagraph(lines[i].replace("&["+texts.page+"]",""), "center").addFieldPageNr();
        }
        else if (lines[i].indexOf("&["+texts.date+"]") > -1) {
          var date = new Date();
          date = Banana.Converter.toLocaleDateFormat(date);
          cell2.addParagraph(lines[i].replace("&["+texts.date+"]",date), "center");
        }
        else {
          cell2.addParagraph(lines[i], "center");
        }
      }
    }
    // footer right
    if (userParam.footer_right && userParam.footer_right.length > 0) {
      var lines = userParam.footer_right.split("\n");
      for (var i = 0; i < lines.length; i++) {
        if (lines[i].indexOf("&["+texts.page+"]") > -1) {
          cell3.addParagraph(lines[i].replace("&["+texts.page+"]",""), "right").addFieldPageNr();
        }
        else if (lines[i].indexOf("&["+texts.date+"]") > -1) {
          var date = new Date();
          date = Banana.Converter.toLocaleDateFormat(date);
          cell3.addParagraph(lines[i].replace("&["+texts.date+"]",date), "right");
        }
        else {
          cell3.addParagraph(lines[i], "right");
        }
      }
    }
  }
  else {
    var tabFooter = repDocObj.getFooter().addTable("footer_table");
    var tableRow = tabFooter.addRow();
    tableRow.addCell("","",1);
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

function getTitle(invoiceObj, texts, userParam) {

  /*
    Return the title based on the DocType value (10="Invoice", 12="Credit note")
    By default are used these values.
    If user enter a different text we use it.
    If user enter "<none>", none title is printed.
  */

  var documentTitle = "";
  if (invoiceObj.document_info.doc_type && invoiceObj.document_info.doc_type === "10") {
    documentTitle = texts.invoice;
    if (userParam.title_doctype_10 && userParam.title_doctype_10 !== "<none>") {
      documentTitle = userParam.title_doctype_10;
    } else {
      documentTitle = "";
    }
  }
  if (invoiceObj.document_info.doc_type && invoiceObj.document_info.doc_type === "12") {
    documentTitle = texts.credit_note;
    if (userParam.title_doctype_12 && userParam.title_doctype_12 !== "<none>") {
      documentTitle = userParam.title_doctype_12;
    } else {
      documentTitle = "";
    }
  }
  return documentTitle;
}

/* Function that add bold style to the text between '**' */
function addMdBoldText(reportElement, text) {
    
    /*
    * BOLD TEXT STYLE
    *
    * Use '**' characters where the bold starts and ends.
    *
    * - set bold all the paragraph => **This is bold paragraph
    *                              => **This is bold paragraph**
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
            var span = p.addText(text.substr(startPosition, charCount), "");
            if (printBold)
                span.setStyleAttribute("font-weight", "bold");
        }
        printBold = !printBold;
        startPosition = endPosition >= 0 ? endPosition + 2 : text.length;
    } while (startPosition < text.length && endPosition >= 0);
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
    texts.param_background_color_1 = 'Colore sfondo';
    texts.param_color = 'Colore testo';
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
    texts.param_background_color_1 = 'Hintergrundfarbe';
    texts.param_color = 'Textfarbe';
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
    texts.param_background_color_1 = 'Couleur de fond';
    texts.param_color = 'Couleur du texte';
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
    texts.param_background_color_1 = '背景色';
    texts.param_color = '文本颜色';
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
    texts.param_background_color_1 = 'Achtergrond kleur';
    texts.param_color = 'tekstkleur';
    texts.param_font_family = 'Lettertype';
    texts.param_image_height = 'Beeldhoogte (mm)';
    texts.param_print_header = 'Pagina-koptekst opnemen';
    texts.param_print_logo = 'Druklogo';
    texts.payment_due_date_label = 'Vervaldatum';
    texts.payment_terms_label = 'Betaling';
    //texts.param_max_items_per_page = 'Aantal artikelen op iedere pagina';
  }
  else {

    //Address
    texts.shipping_address = "Shipping address";

    //Info
    texts.invoice = 'Invoice';
    texts.date = 'Date';
    texts.customer = 'Customer No';
    texts.vat_number = 'VAT number';
    texts.fiscal_number = 'Fiscal number';
    texts.payment_due_date_label = 'Due date';
    texts.payment_terms_label = 'Payment';
    texts.page = 'Page';
    texts.credit_note = 'Credit note';

    //Details
    texts.description = 'Description';
    texts.quantity = 'Quantity';
    texts.reference_unit = 'ReferenceUnit';
    texts.unit_price = 'UnitPrice';
    texts.amount = 'Amount';
    texts.totalnet = 'Total net';
    texts.vat = 'VAT';
    texts.rounding = 'Rounding';
    texts.total = 'TOTAL';
    
    //Include
    texts.param_include = "Print";
    texts.param_include_header = "Header";
    texts.param_header_left = "Header on left position";
    texts.param_print_header = 'Page header';
    texts.param_header_row_1 = "Header row 1";
    texts.param_header_row_2 = "Header row 2";
    texts.param_header_row_3 = "Header row 3";
    texts.param_header_row_4 = "Header row 4";
    texts.param_header_row_5 = "Header row 5";
    texts.param_print_logo = 'Logo';
    texts.param_logo_name = 'Logo name';
    texts.param_include_address = "Customer address";
    texts.param_small_address_line = "Sender address line";
    texts.param_address_left = 'Address on left position';
    texts.param_shipping_address = 'Shipping address';
    texts.param_include_info = 'Info';
    texts.param_info_invoice_number = 'Invoice number';
    texts.param_info_date = 'Invoice date';
    texts.param_info_customer = 'Invoice customer number';
    texts.param_info_customer_vat_number = 'Customer VAT number';
    texts.param_info_customer_fiscal_number = 'Customer fiscal number';
    texts.param_info_due_date = 'Invoice due date';
    texts.param_info_page = 'Invoice page number';
    texts.param_include_details = "Details";
    texts.param_title_doctype_10 = "Title invoice (DocType=10)";
    texts.param_title_doctype_12 = "Title credit note (DocType=12)";
    texts.param_items_invoice_details = "Invoice details columns";
    texts.param_items_invoice_details_dimensions = "Invoice details columns width";
    texts.param_details_gross_amounts = "Details with gross amounts (VAT included)";
    texts.param_invoice_details_without_vat = "Details without VAT";
    texts.param_include_footer = 'Footer';
    texts.param_add_footer = 'Print footer';
    texts.param_footer_left = "Left footer at the bottom of the page";
    texts.param_footer_center = "Center footer at the bottom of the page";
    texts.param_footer_right = "Right footer at the bottom of the page";
    texts.param_qr_code = "QR Code";
    texts.param_add_qr_code = "Print the QR Code";
    texts.param_use_different_address = "Use a different address";
    texts.param_address_row_1 = "Address row 1";
    texts.param_address_row_2 = "Address row 2";
    texts.param_address_row_3 = "Address row 3";

    //Texts
    texts.param_texts = "Texts (empty = default values)";
    texts.param_add_language = "Add a new language";
    texts.param_texts_language_en = "en";
    texts.param_texts_info_invoice_number_text = 'Invoice number';
    texts.param_texts_info_date_text = 'Invoice date';
    texts.param_texts_info_customer_text = 'Invoice customer number';
    texts.param_texts_info_customer_vat_number = 'Customer VAT number';
    texts.param_texts_info_customer_fiscal_number = 'Customer fiscal number';
    texts.param_texts_info_due_date_text = 'Invoice due date';
    texts.param_texts_info_page_text = 'Invoice page number';
    texts.param_texts_shipping_address = 'Shipping address';
    texts.param_texts_items_details_columns = 'Invoice details columns names';
    texts.param_texts_total = 'Invoice total';

    //Styles
    texts.param_styles = "Styles";
    texts.param_background_color_1 = 'Background Color';
    texts.param_color = 'Text Color';
    texts.param_background_color_2 = 'Rows background color';
    texts.param_font_family = 'Font type';
    texts.param_font_size = 'Font size';

    //Embedded JavaScript file
    texts.embedded_javascript_file_not_found = "Custom Javascript file not found or not valid";
    texts.param_embedded_javascript = "Custom JavaScript file";
    texts.param_embedded_javascript_filename = "Insert the file name ('ID' column of the 'Documents' table)";

    //Tooltips for the parameters
    texts.param_tooltip_print_header = "Check to include the page header";
    texts.param_tooltip_header_left = "Check to print the header on left position";
    texts.param_tooltip_print_logo = "Check to include the logo";
    texts.param_tooltip_logo_name = "Enter the name of the logo";
    texts.param_tooltip_info_invoice_number = "Check to include the invoice number";
    texts.param_tooltip_info_date = "Check to include the invoice date";
    texts.param_tooltip_info_customer = "Check to include the invoice customer number";
    texts.param_tooltip_info_customer_vat_number = "Check to include the customer VAT number";
    texts.param_tooltip_info_customer_fiscal_number = "Check to include the customer fiscal number";
    texts.param_tooltip_info_due_date = "Check to include the invoice due date";
    texts.param_tooltip_info_page = "Check to include the page invoice number";
    texts.param_tooltip_add_language = "Enter a new language (i.e. 'es' for spanish)";
    texts.param_tooltip_texts_info_invoice_number_text = "Enter a text to replace the default one";
    texts.param_tooltip_texts_info_date_text = "Enter a text to replace the default one";
    texts.param_tooltip_texts_info_customer_text = "Enter a text to replace the default one";
    texts.param_tooltip_texts_payment_terms_label = "Enter a text to replace the default one";
    texts.param_tooltip_texts_info_page_text = "Enter a text to replace the default one";
    texts.param_tooltip_title_doctype_10 = "Enter a text to replace the default one";
    texts.param_tooltip_title_doctype_12 = "Enter a text to replace the default one";
    texts.param_tooltip_texts_total = "Enter a text to replace the default one";
    texts.param_tooltip_texts_items_details_columns = "Enter the names of the invoice details columns";
    texts.param_tooltip_items_invoice_details = "Enter the names of the columns in the order you prefer";
    texts.param_tooltip_items_invoice_details_dimensions = "Enter the width of the columns in % (sum = 100%)";
    texts.param_tooltip_header_row_1 = "Enter a text to replace the default one";
    texts.param_tooltip_header_row_2 = "Enter a text to replace the default one";
    texts.param_tooltip_header_row_3 = "Enter a text to replace the default one";
    texts.param_tooltip_header_row_4 = "Enter a text to replace the default one";
    texts.param_tooltip_header_row_5 = "Enter a text to replace the default one";
    texts.param_tooltip_small_address_line = "Enter supplier address line above the customer address";
    texts.param_tooltip_shipping_address = "Check to print billing and shipping addresses";
    texts.param_tooltip_address_left = "Check to print the customer address on left position";
    texts.param_tooltip_details_gross_amounts = "Check to print the invoice details with gross amounts with the VAT included";
    texts.param_tooltip_invoice_details_without_vat = "Check to print the invoice details without VAT";
    texts.param_tooltip_add_footer = "Check to print the footer at the bottom of the page";
    texts.param_tooltip_footer = "Enter a footer text";
    texts.param_tooltip_font_family = "Enter the font type";
    texts.param_tooltip_background_color_1 = "Enter the background color";
    texts.param_tooltip_color = "Enter the text color";
    texts.param_tooltip_background_color_2 = "Enter the color for the rows background";
    texts.param_tooltip_javascript_filename = "Enter the name of the javascript file taken from the 'ID' column of the table 'Documents' (i.e. file.js)";
    texts.param_tooltip_add_qr_code = "Check to print the QR Code";
    texts.param_tooltip_use_different_address = "Check to use a different address for the QR Code";
    texts.param_tooltip_address_row1 = "Enter the row 1 text";
    texts.param_tooltip_address_row2 = "Enter the row 2 text";
    texts.param_tooltip_address_row3 = "Enter the row 3 text";
  }
  return texts;
}










//====================================================================//
// STYLES
//====================================================================//

/* Function that replaces all the css variables inside of the given cssText with their values*/
function replaceVariable(cssText, cssVariables) {

  var result = "";
  var varName = "";
  var insideVariable = false;
  var variablesNotFound = [];

  Banana.console.log(">>STRING TO REPLACE: " + cssText);
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
        
        if (!(varName in cssVariables)) {
          variablesNotFound.push(varName);
          result += varName;
        }
        else {
          result += cssVariables[varName];
        }
        
        result += currentChar;
        insideVariable = false;
        Banana.console.log(">>VARNAME (A): " + varName);
        varName = "";
      }
    }
    else {
      result += currentChar;
    }
  }

  if (insideVariable) {
    // end of text, end of variable

    if (!(varName in cssVariables)) {
      variablesNotFound.push(varName);
      result += varName;
    }
    else {
      result += cssVariables[varName];
    }

    insideVariable = false;
    Banana.console.log(">>VARNAME (B): " + varName);
  }

  if (variablesNotFound.length > 0) {
    Banana.console.log(">>VARIABLESNOTFOUND :" + variablesNotFound);
  }

  Banana.console.log(">>RESULT: " + result+ "\n");
  return result;
}

/* Function that sets the values of all the css variables */
function set_css_variables(repStyleObj, cssVariables, userParam) {

  cssVariables.$font_size = userParam.font_size+"pt";
  cssVariables.$font_family = userParam.font_family;
  cssVariables.$background_color_1 = userParam.background_color_1;
  cssVariables.$background_color_2 = userParam.background_color_2;
  cssVariables.$color = userParam.color;
  cssVariables.$margin_top = "10mm";
  cssVariables.$margin_right = "10mm";
  cssVariables.$margin_bottom = "20mm";
  cssVariables.$margin_left = "20mm";
  cssVariables.$margin_top_info = "45mm";
  cssVariables.$margin_left_info = "113mm";
  cssVariables.$margin_top_shipping_address = "75mm";
  cssVariables.$margin_top_begin_text = "120mm";
  cssVariables.$margin_left_table = "23mm";
  cssVariables.$margin_top_details = "140mm";
  cssVariables.$padding_right = "5px";
  cssVariables.$padding_left = "5px";
  cssVariables.$padding_top = "0px";
  cssVariables.$padding_bottom = "0px";
  cssVariables.$padding = "5px";
  cssVariables.$qr_code_align = "right";
  cssVariables.$header_text_align = "right";
  cssVariables.$small_address_text_align = "center";
  cssVariables.$small_address_font_size = "7pt";
  cssVariables.$small_address_border_bottom = "1px solid black";
  cssVariables.$total_border_bottom = "1px double";
  cssVariables.$footer_border_top = "thin solid";
  cssVariables.$footer_font_size = "8pt";


  /* If exists use the function defined by the user */
  if (typeof(hook_set_css_variables) === typeof(Function)) {
    hook_set_css_variables(repStyleObj, cssVariables, userParam);
  }
}

/* Function that sets the invice style using the css variables */
function set_invoice_style(repStyleObj, cssVariables, userParam) {

  var tmp = "";

  // tmp = "counter-reset: page";
  // add_style(repStyleObj, ".pageReset", tmp, cssVariables);


  tmp = "font-size:$font_size; font-family:$font_family";
  add_style(repStyleObj, "body", tmp, cssVariables);

  tmp = "text-align:right";
  add_style(repStyleObj, ".right", tmp, cssVariables);

  tmp = "text-align:center";
  add_style(repStyleObj, ".center", tmp, cssVariables);

  tmp = "font-weight:bold";
  add_style(repStyleObj, ".bold", tmp, cssVariables);

  tmp = "font-weight:bold; color:$background_color_1; border-bottom:$total_border_bottom $background_color_1; font-size:$font_size";
  add_style(repStyleObj, ".total_cell", tmp, cssVariables);

  tmp = "font-weight:bold; background-color:$background_color_1; color:$color; padding:5px";
  add_style(repStyleObj, ".subtotal_cell",tmp, cssVariables);

  tmp = "font-size:$font_size";
  add_style(repStyleObj, ".vat_info", tmp, cssVariables);

  tmp = "background-color:$background_color_2";
  add_style(repStyleObj, ".even_rows_background_color", tmp, cssVariables);

  tmp = "border-bottom:2px solid $background_color_1";
  add_style(repStyleObj, ".border-bottom", tmp, cssVariables);

  tmp = "border-top:thin solid $background_color_1";
  add_style(repStyleObj, ".thin-border-top", tmp, cssVariables);

  tmp = "padding-right:$padding_right";
  add_style(repStyleObj, ".padding-right", tmp, cssVariables);

  tmp = "padding-left:$padding_left";
  add_style(repStyleObj, ".padding-left", tmp, cssVariables);

  tmp = "position:absolute; margin-top:$margin_top; margin-left:$margin_left; margin-right:$margin_right";
  add_style(repStyleObj, ".header_left_text", tmp, cssVariables);

  tmp = "position:absolute; margin-top:$margin_top; margin-left:$margin_left; margin-right:$margin_right; text-align:$header_text_align";
  add_style(repStyleObj, ".header_right_text", tmp, cssVariables);

  tmp = "position:absolute; margin-top:$margin_top; margin-left:$margin_left; margin-right:$margin_right";
  add_style(repStyleObj, ".logo", tmp, cssVariables);

  tmp = "position:absolute; margin-top:$margin_top_info; margin-left:$margin_left; margin-right:$margin_right; font-size:$font_size";
  add_style(repStyleObj, ".info_table_left", tmp, cssVariables);

  tmp = "padding-top:$padding_top; padding-bottom:$padding_bottom";
  add_style(repStyleObj, "table.info_table_left td", tmp, cssVariables);

  tmp = "position:absolute; margin-top:$margin_top_info; margin-left:$margin_left_info; margin-right:$margin_right; font-size:$font_size";
  add_style(repStyleObj, ".info_table_right", tmp, cssVariables);

  tmp = "padding-top:$padding_top; padding-bottom:$padding_bottom";
  add_style(repStyleObj, "table.info_table_right td", tmp, cssVariables);

  tmp = "position:absolute; margin-top:$margin_top_info; margin-left:$margin_left; margin-right:$margin_right; font-size:$font_size";
  add_style(repStyleObj, ".info_table_row0", tmp, cssVariables);

  tmp = "padding-top:$padding_top; padding-bottom:$padding_bottom";
  add_style(repStyleObj, "table.info_table_row0 td", tmp, cssVariables);

  tmp = "display:none";
  add_style(repStyleObj, "@page:first-view table.info_table_row0", tmp, cssVariables);

  tmp = "position:absolute; margin-top:$margin_top_info; margin-left:$margin_left_info; margin-right:$margin_right; font-size:$font_size";
  add_style(repStyleObj, ".address_table_right", tmp, cssVariables);

  tmp = "position:absolute; margin-top:$margin_top_info; margin-left:$margin_left; margin-right:$margin_right";
  add_style(repStyleObj, ".address_table_left", tmp, cssVariables);

  tmp = "text-align:$small_address_text_align; font-size:$small_address_font_size; border-bottom:$small_address_border_bottom"; 
  add_style(repStyleObj, ".small_address", tmp, cssVariables);

  tmp = "position:absolute; margin-top:$margin_top_shipping_address; margin-left:$margin_left; margin-right:$margin_right; font-size:$font_size";
  add_style(repStyleObj, ".shipping_address", tmp, cssVariables);

  tmp = "font-size:$font_size; font-weight:bold; color:$background_color_1";
  add_style(repStyleObj, ".title_text", tmp, cssVariables);

  tmp = "position:absolute; margin-top:$margin_top_begin_text; margin-left:$margin_left_table; margin-right:$margin_right; width:100%;";
  add_style(repStyleObj, ".begin_text_table", tmp, cssVariables);

  tmp = "font-size:$font_size"; 
  add_style(repStyleObj, ".begin_text", tmp, cssVariables);

  tmp = "margin-top:$margin_top_details; margin-left:$margin_left_table; margin-right:$margin_right; font-size:$font_size; width:100%";
  add_style(repStyleObj, ".doc_table", tmp, cssVariables);

  tmp = "font-weight:bold; background-color:$background_color_1; color:$color";
  add_style(repStyleObj, ".doc_table_header", tmp, cssVariables);

  tmp = "padding:$padding";
  add_style(repStyleObj, ".doc_table_header td", tmp, cssVariables);

  tmp = "text-align:$qr_code_align";
  add_style(repStyleObj, ".qr_code", tmp, cssVariables);

  tmp = "margin-left:$margin_left; margin-right:$margin_right; border-top:$footer_border_top $background_color_1";
  add_style(repStyleObj, ".footer_line", tmp, cssVariables);

  tmp = "margin-bottom:$margin_bottom; margin-left:$margin_left; margin-right:$margin_right; width:100%; font-size:$footer_font_size";
  add_style(repStyleObj, ".footer_table", tmp, cssVariables);


  /* Uncomment to show all the borders of the tables */

  /*
    repStyleObj.addStyle("table.info_table_left td", "border: thin solid black;");
    repStyleObj.addStyle("table.info_table_right td", "border: thin solid black");
    repStyleObj.addStyle("table.info_table_row0 td", "border: thin solid black");
    repStyleObj.addStyle("table.address_table_right td", "border: thin solid black");
    repStyleObj.addStyle("table.address_table_left td", "border: thin solid black");
    repStyleObj.addStyle("table.shipping_address td", "border: thin solid black;");
    repStyleObj.addStyle("table.begin_text_table td", "border: thin solid black;");
    repStyleObj.addStyle("table.doc_table td", "border: thin solid black;");
    repStyleObj.addStyle("table.footer_table td", "border: thin solid black");
  */


  /* If exists use the function defined by the user */
  if (typeof(hook_set_invoice_style) === typeof(Function)) {
    hook_set_invoice_style(repStyleObj, cssVariables, userParam);
  }
}

/* Function that adds the style to the report invoice object */
function add_style(repStyleObj, styleName, style, cssVariables) {

  repStyleObj.addStyle(styleName, replaceVariable(style, cssVariables));
}



