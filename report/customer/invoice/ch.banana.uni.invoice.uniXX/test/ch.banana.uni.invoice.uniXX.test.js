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


// @id = ch.banana.uni.invoice.uniXX.test
// @api = 1.2
// @pubdate = 2022-06-08
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.uni.invoice.uniXX.js>
// @task = app.command
// @doctype = *.*
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @includejs = ../ch.banana.uni.invoice.uniXX.js
// @timeout = -1


/*
  SUMMARY
  -------
  Javascript test
  1. Open the .ac2 file
  2. Execute the .js script
  3. Save the report
**/





// Register test case to be executed
Test.registerTestCase(new ReportInvoiceUniXX());

// Here we define the class, the name of the class is not important
function ReportInvoiceUniXX() {

}

// This method will be called at the beginning of the test case
ReportInvoiceUniXX.prototype.initTestCase = function() {

}

// This method will be called at the end of the test case
ReportInvoiceUniXX.prototype.cleanupTestCase = function() {

}

// This method will be called before every test method is executed
ReportInvoiceUniXX.prototype.init = function() {

}

// This method will be called after every test method is executed
ReportInvoiceUniXX.prototype.cleanup = function() {

}

//
// Tests for INTEGRATED INVOICES
//
ReportInvoiceUniXX.prototype.test_IntegratedInvoice_1 = function() {
  var fileAC2 = "file:script/../test/testcases/invoice_development_file.ac2";
  var banDoc = Banana.application.openDocument(fileAC2);
  if (!banDoc) {
    return;
  }
  //
  IS_INTEGRATED_INVOICE = true;
  var texts = setTexts('en');
  var userParam = setUserParam(texts);
  var variables = setVariables();
  //
  var jsonInvoices = getJsonInvoices(banDoc);
  for (var i = 0; i < jsonInvoices.length; i++) {
    this.addReport(banDoc, texts, userParam, jsonInvoices[i], variables);
  }
}

ReportInvoiceUniXX.prototype.test_IntegratedInvoice_2 = function() {
  var fileAC2 = "file:script/../test/testcases/invoice_development_chf.ac2";
  var banDoc = Banana.application.openDocument(fileAC2);
  if (!banDoc) {
    return;
  }
  //
  IS_INTEGRATED_INVOICE = true;
  var texts = setTexts('en');
  var userParam = setUserParam(texts);
  // userParam.qr_code_qriban = 'CH09 3000 0001 6525 0122 4';
  // userParam.qr_code_iban = '';
  // userParam.qr_code_isr_id = '113456';
  // userParam.qr_code_reference_type = 'QRR'
  // userParam.qr_code_additional_information = 'Notes';
  // userParam.qr_code_billing_information = true;
  var variables = setVariables();
  //
  var jsonInvoices = getJsonInvoices(banDoc);
  for (var i = 0; i < jsonInvoices.length; i++) {
    this.addReport(banDoc, texts, userParam, jsonInvoices[i], variables);
  }
}

ReportInvoiceUniXX.prototype.test_IntegratedInvoice_3 = function() {
  var fileAC2 = "file:script/../test/testcases/invoice_development_chf.ac2";
  var banDoc = Banana.application.openDocument(fileAC2);
  if (!banDoc) {
    return;
  }
  //
  IS_INTEGRATED_INVOICE = true;
  var texts = setTexts('en');
  var userParam = setUserParam(texts);
  // userParam.qr_code_qriban = 'CH09 3000 0001 6525 0122 4';
  // userParam.qr_code_iban = '';
  // userParam.qr_code_isr_id = '113456';
  // userParam.qr_code_reference_type = 'QRR'
  // userParam.qr_code_additional_information = 'Notes';
  // userParam.qr_code_billing_information = true;
  // userParam.qr_code_empty_address = true;
  // userParam.qr_code_empty_amount = true;
  var variables = setVariables();
  //
  var jsonInvoices = getJsonInvoices(banDoc);
  for (var i = 0; i < jsonInvoices.length; i++) {
    this.addReport(banDoc, texts, userParam, jsonInvoices[i], variables);
  }
}

ReportInvoiceUniXX.prototype.test_IntegratedInvoice_4 = function() {
  var fileAC2 = "file:script/../test/testcases/invoice_development_chf.ac2";
  var banDoc = Banana.application.openDocument(fileAC2);
  if (!banDoc) {
    return;
  }
  //
  IS_INTEGRATED_INVOICE = true;
  var texts = setTexts('en');
  var userParam = setUserParam(texts);
  // userParam.qr_code_add = true;
  // userParam.qr_code_qriban = 'CH58 0900 0000 6525 0122 4'; // WRONG! not a QR-IBAN!
  // userParam.qr_code_iban = '';
  // userParam.qr_code_isr_id = '';
  // userParam.qr_code_reference_type = 'QRR'
  // userParam.qr_code_additional_information = 'Notes';
  // userParam.qr_code_billing_information = true;
  var variables = setVariables();
  //
  var jsonInvoices = getJsonInvoices(banDoc);
  for (var i = 0; i < jsonInvoices.length; i++) {
    this.addReport(banDoc, texts, userParam, jsonInvoices[i], variables);
  }
}

ReportInvoiceUniXX.prototype.test_IntegratedInvoice_5 = function() {
  var fileAC2 = "file:script/../test/testcases/invoice_development_chf.ac2";
  var banDoc = Banana.application.openDocument(fileAC2);
  if (!banDoc) {
    return;
  }
  //
  IS_INTEGRATED_INVOICE = true;
  var texts = setTexts('en');
  var userParam = setUserParam(texts);
  // userParam.qr_code_add = true;
  // userParam.qr_code_qriban = 'CH09 3000 0001 6525 0122 4'; // QR-IBAN is OK
  // userParam.qr_code_iban = '';
  // userParam.qr_code_isr_id = ''; //No isr, use only WRONG invoice nr. "F001-20" (only numbers allowed)
  // userParam.qr_code_reference_type = 'QRR'
  // userParam.qr_code_additional_information = '';
  // userParam.qr_code_billing_information = true;
  var variables = setVariables();
  //
  var jsonInvoices = getJsonInvoices(banDoc);
  for (var i = 0; i < jsonInvoices.length; i++) {
    this.addReport(banDoc, texts, userParam, jsonInvoices[i], variables);
  }
}

ReportInvoiceUniXX.prototype.test_IntegratedInvoice_6 = function() {
  var fileAC2 = "file:script/../test/testcases/invoice_development_chf.ac2";
  var banDoc = Banana.application.openDocument(fileAC2);
  if (!banDoc) {
    return;
  }
  //
  IS_INTEGRATED_INVOICE = true;
  var texts = setTexts('en');
  var userParam = setUserParam(texts);
  // userParam.qr_code_add = true;
  // userParam.qr_code_qriban = '';
  // userParam.qr_code_iban = 'CH58 0079 1123 0008 8901 2';
  // userParam.qr_code_iban_eur = '';
  // userParam.qr_code_isr_id = '';
  // userParam.qr_code_reference_type = 'SCOR'
  // userParam.qr_code_additional_information = 'Notes';
  // userParam.qr_code_billing_information = true;
  var variables = setVariables();
  //
  var jsonInvoices = getJsonInvoices(banDoc);
  for (var i = 0; i < jsonInvoices.length; i++) {
    this.addReport(banDoc, texts, userParam, jsonInvoices[i], variables);
  }
}

ReportInvoiceUniXX.prototype.test_IntegratedInvoice_7 = function() {
  var fileAC2 = "file:script/../test/testcases/invoice_development_chf.ac2";
  var banDoc = Banana.application.openDocument(fileAC2);
  if (!banDoc) {
    return;
  }
  //
  IS_INTEGRATED_INVOICE = true;
  var texts = setTexts('en');
  var userParam = setUserParam(texts);
  // userParam.qr_code_add = true;
  // userParam.qr_code_qriban = '';
  // userParam.qr_code_iban = 'CH58 0079 1123 0008 8901 2';
  // userParam.qr_code_iban_eur = '';
  // userParam.qr_code_isr_id = '';
  // userParam.qr_code_reference_type = 'SCOR'
  // userParam.qr_code_additional_information = 'Notes';
  // userParam.qr_code_billing_information = true;
  // userParam.qr_code_empty_amount = true;
  var variables = setVariables();
  //
  var jsonInvoices = getJsonInvoices(banDoc);
  for (var i = 0; i < jsonInvoices.length; i++) {
    this.addReport(banDoc, texts, userParam, jsonInvoices[i], variables);
  }
}

ReportInvoiceUniXX.prototype.test_IntegratedInvoice_8 = function() {
  var fileAC2 = "file:script/../test/testcases/invoice_development_chf.ac2";
  var banDoc = Banana.application.openDocument(fileAC2);
  if (!banDoc) {
    return;
  }
  //
  IS_INTEGRATED_INVOICE = true;
  var texts = setTexts('en');
  var userParam = setUserParam(texts);
  // userParam.qr_code_add = true;
  // userParam.qr_code_qriban = '';
  // userParam.qr_code_iban = 'CH09 3000 0001 6525 0122 4'; // WRONG! This is a QR-IBAN
  // userParam.qr_code_iban_eur = '';
  // userParam.qr_code_isr_id = '';
  // userParam.qr_code_reference_type = 'SCOR'
  // userParam.qr_code_additional_information = 'Notes';
  // userParam.qr_code_billing_information = true;
  var variables = setVariables();
  //
  var jsonInvoices = getJsonInvoices(banDoc);
  for (var i = 0; i < jsonInvoices.length; i++) {
    this.addReport(banDoc, texts, userParam, jsonInvoices[i], variables);
  }
}

ReportInvoiceUniXX.prototype.test_IntegratedInvoice_9 = function() {
  var fileAC2 = "file:script/../test/testcases/invoice_development_chf.ac2";
  var banDoc = Banana.application.openDocument(fileAC2);
  if (!banDoc) {
    return;
  }
  //
  IS_INTEGRATED_INVOICE = true;
  var texts = setTexts('en');
  var userParam = setUserParam(texts);
  userParam.qr_code_add = true;
  userParam.qr_code_qriban = '';
  userParam.qr_code_iban = '';
  userParam.qr_code_iban_eur = 'CH58 0079 1123 0008 8901 2';
  userParam.qr_code_isr_id = '';
  userParam.qr_code_reference_type = 'SCOR'
  userParam.qr_code_additional_information = '';
  userParam.qr_code_billing_information = false;
  var variables = setVariables();
  //
  var jsonInvoices = getJsonInvoices(banDoc);
  for (var i = 0; i < jsonInvoices.length; i++) {
    this.addReport(banDoc, texts, userParam, jsonInvoices[i], variables);
  }
}

ReportInvoiceUniXX.prototype.test_IntegratedInvoice_10 = function() {
  var fileAC2 = "file:script/../test/testcases/invoice_development_chf.ac2";
  var banDoc = Banana.application.openDocument(fileAC2);
  if (!banDoc) {
    return;
  }
  //
  IS_INTEGRATED_INVOICE = true;
  var texts = setTexts('en');
  var userParam = setUserParam(texts);
  userParam.details_columns = 'Description;T.Des2;Quantity;ReferenceUnit;UnitPrice;Amount';
  userParam.details_columns_widths = '30%;20%;10%;10%;15%;15%';
  userParam.details_columns_titles_alignment = 'left;left;right;center;right;right';
  userParam.details_columns_alignment = 'left;left;right;center;right;right';
  userParam.details_gross_amounts = false;
  userParam.en_text_details_columns = 'DES;DES2;QTY;UNIT;UNIT P.;AMOUNT';
  userParam.en_text_final = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\nCurabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris. Integer in mauris eu nibh euismod gravida. Duis ac tellus et risus vulputate vehicula. Donec lobortis risus a elit. Etiam tempor. Ut ullamcorper, ligula eu tempor congue, eros est euismod turpis, id tincidunt sapien risus a quam. Maecenas fermentum consequat mi. Donec fermentum. Pellentesque malesuada nulla a mi. Duis sapien sem, aliquet nec, commodo eget, consequat quis, neque. Aliquam faucibus, elit ut dictum aliquet, felis nisl adipiscing sapien, sed malesuada diam lacus eget erat. Cras mollis scelerisque nunc. Nullam arcu. Aliquam consequat. Curabitur augue lorem, dapibus quis, laoreet et, pretium ac, nisi. Aenean magna nisl, mollis quis, molestie eu, feugiat in, orci. In hac habitasse platea dictumst.';
  // userParam.qr_code_add = true;
  // userParam.qr_code_qriban = '';
  // userParam.qr_code_iban = 'CH58 0079 1123 0008 8901 2';
  // userParam.qr_code_iban_eur = '';
  // userParam.qr_code_isr_id = '';
  // userParam.qr_code_reference_type = 'SCOR'
  // userParam.qr_code_additional_information = 'Notes';
  // userParam.qr_code_billing_information = true;
  var variables = setVariables();
  //
  var jsonInvoices = getJsonInvoices(banDoc);
  for (var i = 0; i < jsonInvoices.length; i++) {
    this.addReport(banDoc, texts, userParam, jsonInvoices[i], variables);
  }
}

ReportInvoiceUniXX.prototype.test_IntegratedInvoice_11 = function() {
  var fileAC2 = "file:script/../test/testcases/invoice_development_chf.ac2";
  var banDoc = Banana.application.openDocument(fileAC2);
  if (!banDoc) {
    return;
  }
  //
  IS_INTEGRATED_INVOICE = true;
  var texts = setTexts('en');
  var userParam = setUserParam(texts);
  userParam.details_columns = 'Description;T.Des2;Amount';
  userParam.details_columns_widths = '50%;20%;30%';
  userParam.details_columns_titles_alignment = 'left;left;right';
  userParam.details_columns_alignment = 'left;left;right';
  userParam.details_gross_amounts = false;
  userParam.en_text_details_columns = 'Description;Des2;Amount';
  userParam.en_text_final = '';
  // userParam.qr_code_add = true;
  // userParam.qr_code_qriban = '';
  // userParam.qr_code_iban = ''; // No IBAN, we take the one defined on File->properties->Address (we use banana iban, so it is not valid)
  // userParam.qr_code_iban_eur = '';
  // userParam.qr_code_isr_id = '';
  // userParam.qr_code_reference_type = 'SCOR'
  // userParam.qr_code_additional_information = 'Notes';
  // userParam.qr_code_billing_information = true;
  var variables = setVariables();
  //
  var jsonInvoices = getJsonInvoices(banDoc);
  for (var i = 0; i < jsonInvoices.length; i++) {
    this.addReport(banDoc, texts, userParam, jsonInvoices[i], variables);
  }
}

ReportInvoiceUniXX.prototype.test_IntegratedInvoice_12 = function() {
  var fileAC2 = "file:script/../test/testcases/invoice_development_chf.ac2";
  var banDoc = Banana.application.openDocument(fileAC2);
  if (!banDoc) {
    return;
  }
  //
  IS_INTEGRATED_INVOICE = true;
  var texts = setTexts('en');
  var userParam = setUserParam(texts);
  // userParam.qr_code_add = true;
  // userParam.qr_code_qriban = '';
  // userParam.qr_code_iban = 'CH58 0079 1123 0008 8901 2';
  // userParam.qr_code_isr_id = '';
  // userParam.qr_code_reference_type = 'NON'
  // userParam.qr_code_additional_information = 'Notes';
  // userParam.qr_code_billing_information = true;
  var variables = setVariables();
  //
  var jsonInvoices = getJsonInvoices(banDoc);
  for (var i = 0; i < jsonInvoices.length; i++) {
    this.addReport(banDoc, texts, userParam, jsonInvoices[i], variables);
  }
}

ReportInvoiceUniXX.prototype.test_IntegratedInvoice_13 = function() {
  var fileAC2 = "file:script/../test/testcases/invoice_development_chf.ac2";
  var banDoc = Banana.application.openDocument(fileAC2);
  if (!banDoc) {
    return;
  }
  //
  IS_INTEGRATED_INVOICE = true;
  var texts = setTexts('en');
  var userParam = setUserParam(texts);
  // userParam.qr_code_add = true;
  // userParam.qr_code_qriban = '';
  // userParam.qr_code_iban = 'CH09 3000 0001 6525 0122 4'; // WRONG! This is a QR-IBAN!
  // userParam.qr_code_isr_id = '';
  // userParam.qr_code_reference_type = 'NON' // NON with QR-IBAN not allowed
  // userParam.qr_code_additional_information = 'Notes';
  // userParam.qr_code_billing_information = true;
  var variables = setVariables();
  //
  var jsonInvoices = getJsonInvoices(banDoc);
  for (var i = 0; i < jsonInvoices.length; i++) {
    this.addReport(banDoc, texts, userParam, jsonInvoices[i], variables);
  }
}

ReportInvoiceUniXX.prototype.test_IntegratedInvoice_14 = function() {
  var fileAC2 = "file:script/../test/testcases/invoice_development_chf.ac2";
  var banDoc = Banana.application.openDocument(fileAC2);
  if (!banDoc) {
    return;
  }
  //
  IS_INTEGRATED_INVOICE = true;
  var texts = setTexts('en');
  var userParam = setUserParam(texts);
  userParam.details_columns = 'Description;T.DateWork;Quantity;ReferenceUnit;UnitPrice;Amount';
  userParam.details_columns_widths = '30%;20%;10%;10%;15%;15%';
  userParam.details_columns_titles_alignment = 'left;center;center;center;center;right';
  userParam.details_columns_alignment = 'left;center;center;center;center;right';
  userParam.details_gross_amounts = true;
  userParam.en_text_details_columns = 'Description;Date Work;Quantity;Unit;Unit Price;Amount';
  // userParam.qr_code_add = true;
  // userParam.qr_code_qriban = '';
  // userParam.qr_code_iban = 'CH58 0079 1123 0008 8901 2';
  // userParam.qr_code_iban_eur = '';
  // userParam.qr_code_isr_id = '';
  // userParam.qr_code_reference_type = 'SCOR'
  // userParam.qr_code_additional_information = '';
  // userParam.qr_code_billing_information = true;
  var variables = setVariables();
  //
  var jsonInvoices = getJsonInvoices(banDoc);
  for (var i = 0; i < jsonInvoices.length; i++) {
    this.addReport(banDoc, texts, userParam, jsonInvoices[i], variables);
  }
}

ReportInvoiceUniXX.prototype.test_IntegratedInvoice_15 = function() {
  var fileAC2 = "file:script/../test/testcases/invoice_development_chf.ac2";
  var banDoc = Banana.application.openDocument(fileAC2);
  if (!banDoc) {
    return;
  }
  //
  IS_INTEGRATED_INVOICE = true;
  var texts = setTexts('en');
  var userParam = setUserParam(texts);
  userParam.info_customer_vat_number = false;
  userParam.info_customer_fiscal_number = false;
  // userParam.qr_code_add = true;
  // userParam.qr_code_qriban = '';
  // userParam.qr_code_iban = 'CH58 0079 1123 0008 8901 2';
  // userParam.qr_code_iban_eur = '';
  // userParam.qr_code_isr_id = '';
  // userParam.qr_code_reference_type = 'SCOR'
  // userParam.qr_code_additional_information = '';
  // userParam.qr_code_billing_information = false;
  var variables = setVariables();
  //
  var jsonInvoices = getJsonInvoices(banDoc);
  for (var i = 0; i < jsonInvoices.length; i++) {
    this.addReport(banDoc, texts, userParam, jsonInvoices[i], variables);
  }
}

ReportInvoiceUniXX.prototype.test_IntegratedInvoice_16 = function() {
  var fileAC2 = "file:script/../test/testcases/invoice_development_chf.ac2";
  var banDoc = Banana.application.openDocument(fileAC2);
  if (!banDoc) {
    return;
  }
  //
  IS_INTEGRATED_INVOICE = true;
  var texts = setTexts('en');
  var userParam = setUserParam(texts);
  userParam.details_gross_amounts = true;
  userParam.shipping_address = false;
  userParam.info_customer_vat_number = false;
  userParam.info_customer_fiscal_number = false;
  // userParam.qr_code_add = true;
  // userParam.qr_code_qriban = '';
  // userParam.qr_code_iban = 'CH58 0079 1123 0008 8901 2';
  // userParam.qr_code_iban_eur = '';
  // userParam.qr_code_isr_id = '';
  // userParam.qr_code_reference_type = 'SCOR'
  // userParam.qr_code_additional_information = '';
  // userParam.qr_code_billing_information = false;
  // userParam.qr_code_empty_address = false; // false = print customer address on QR
  // userParam.qr_code_empty_amount = false;
  var variables = setVariables();
  //
  var jsonInvoices = getJsonInvoices(banDoc);
  for (var i = 0; i < jsonInvoices.length; i++) {
    this.addReport(banDoc, texts, userParam, jsonInvoices[i], variables);
  }
}

ReportInvoiceUniXX.prototype.test_IntegratedInvoice_17 = function() {
  var fileAC2 = "file:script/../test/testcases/invoice_development_chf.ac2";
  var banDoc = Banana.application.openDocument(fileAC2);
  if (!banDoc) {
    return;
  }
  //
  IS_INTEGRATED_INVOICE = true;
  var texts = setTexts('en');
  var userParam = setUserParam(texts);
  userParam.details_gross_amounts = true;
  userParam.shipping_address = false;
  userParam.info_customer_vat_number = false;
  userParam.info_customer_fiscal_number = false;
  // userParam.qr_code_add = true;
  // userParam.qr_code_qriban = '';
  // userParam.qr_code_iban = 'CH58 0079 1123 0008 8901 2';
  // userParam.qr_code_iban_eur = '';
  // userParam.qr_code_isr_id = '';
  // userParam.qr_code_reference_type = 'SCOR'
  // userParam.qr_code_additional_information = '';
  // userParam.qr_code_billing_information = false;
  // userParam.qr_code_empty_address = true; // true = print empty box instead of address on QR
  // userParam.qr_code_empty_amount = false;
  var variables = setVariables();
  //
  var jsonInvoices = getJsonInvoices(banDoc);
  for (var i = 0; i < jsonInvoices.length; i++) {
    this.addReport(banDoc, texts, userParam, jsonInvoices[i], variables);
  }
}

ReportInvoiceUniXX.prototype.test_IntegratedInvoice_18 = function() {
  var fileAC2 = "file:script/../test/testcases/invoice_integrated_items_images.ac2";
  var banDoc = Banana.application.openDocument(fileAC2);
  if (!banDoc) {
    return;
  }
  //
  IS_INTEGRATED_INVOICE = true;
  var texts = setTexts('en');
  var userParam = setUserParam(texts);
  userParam.shipping_address = false;
  userParam.info_order_number = true;
  userParam.info_order_date = true;
  userParam.info_customer_vat_number = false;
  userParam.info_customer_fiscal_number = false;
  userParam.details_columns = 'I.Links;Number;Description;Quantity;ReferenceUnit;UnitPrice;Amount';
  userParam.details_columns_widths = '12%;10%;28%;10%;10%;15%;15%';
  userParam.details_columns_titles_alignment = 'left;left;left;right;center;right;right';
  userParam.details_columns_alignment = 'left;left;left;right;center;right;right';
  userParam.details_gross_amounts = false;
  userParam.details_additional_descriptions = true;
  userParam.en_text_details_columns = 'Image;Item;Description;Quantity;Unit;Unit Price;Amount';
  // userParam.qr_code_add = true;
  // userParam.qr_code_qriban = '';
  // userParam.qr_code_iban = 'CH58 0079 1123 0008 8901 2';
  // userParam.qr_code_iban_eur = '';
  // userParam.qr_code_isr_id = '';
  // userParam.qr_code_reference_type = 'SCOR'
  // userParam.qr_code_additional_information = '';
  // userParam.qr_code_billing_information = false;
  userParam.embedded_javascript_filename = "itemsImages.js";
  var variables = setVariables();
  //
  var jsonInvoices = getJsonInvoices(banDoc);
  for (var i = 0; i < jsonInvoices.length; i++) {
    this.addReport(banDoc, texts, userParam, jsonInvoices[i], variables);
  }
}

ReportInvoiceUniXX.prototype.test_IntegratedInvoice_19 = function() {
  var fileAC2 = "file:script/../test/testcases/v0_integrated_test.ac2";
  var banDoc = Banana.application.openDocument(fileAC2);
  if (!banDoc) {
    return;
  }
  //
  IS_INTEGRATED_INVOICE = true;
  var texts = setTexts('en');
  var userParam = setUserParam(texts);
  userParam.shipping_address = false;
  userParam.info_order_number = false;
  userParam.info_order_date = false;
  userParam.info_customer_vat_number = false;
  userParam.info_customer_fiscal_number = false;
  userParam.details_columns = 'Description;Quantity;ReferenceUnit;UnitPrice;Amount';
  userParam.details_columns_widths = '50%;10%;10%;15%;15%';
  userParam.details_columns_titles_alignment = 'eft;center;center;right;right';
  userParam.details_columns_alignment = 'eft;center;center;right;right';
  userParam.details_gross_amounts = false;
  userParam.details_additional_descriptions = false;
  userParam.en_text_details_columns = 'Description;Quantity;Unit;Unit Price;Amount';
  // userParam.qr_code_add = true;
  // userParam.qr_code_qriban = '';
  // userParam.qr_code_iban = 'CH58 0079 1123 0008 8901 2';
  // userParam.qr_code_iban_eur = '';
  // userParam.qr_code_isr_id = '';
  // userParam.qr_code_reference_type = 'SCOR'
  // userParam.qr_code_additional_information = '';
  // userParam.qr_code_billing_information = true;
  var variables = setVariables();
  //
  var jsonInvoices = getJsonInvoices(banDoc);
  for (var i = 0; i < jsonInvoices.length; i++) {
    this.addReport(banDoc, texts, userParam, jsonInvoices[i], variables);
  }
}



//
// Tests for APPLICATION ESTIMATES AND INVOICES
//
ReportInvoiceUniXX.prototype.test_AppEstimatesInvoices_1 = function() {
  var fileAC2 = "file:script/../test/testcases/invoice_deposit_test.ac2";
  var banDoc = Banana.application.openDocument(fileAC2);
  if (!banDoc) {
    return;
  }
  //
  IS_INTEGRATED_INVOICE = true;
  var texts = setTexts('en');
  var userParam = setUserParam(texts);
  userParam.details_gross_amounts = false;
  userParam.shipping_address = false;
  userParam.info_customer_vat_number = false;
  userParam.info_customer_fiscal_number = false;
  // userParam.qr_code_add = true;
  // userParam.qr_code_qriban = '';
  // userParam.qr_code_iban = 'CH58 0079 1123 0008 8901 2';
  // userParam.qr_code_iban_eur = '';
  // userParam.qr_code_isr_id = '';
  // userParam.qr_code_reference_type = 'SCOR'
  // userParam.qr_code_additional_information = '';
  // userParam.qr_code_billing_information = false;
  var variables = setVariables();
  //
  var invoices = ['401', '402', '403'];
  for (var i = 0; i < invoices.length; i++) {
    var jsonInvoice = JSON.parse(getJsonInvoice(invoices[i]));
    this.addReport(banDoc, texts, userParam, jsonInvoice, variables);
  }
}

ReportInvoiceUniXX.prototype.test_AppEstimatesInvoices_2 = function() {
  var fileAC2 = "file:script/../test/testcases/invoice_deposit_test.ac2";
  var banDoc = Banana.application.openDocument(fileAC2);
  if (!banDoc) {
    return;
  }
  //
  IS_INTEGRATED_INVOICE = true;
  var texts = setTexts('en');
  var userParam = setUserParam(texts);
  userParam.details_gross_amounts = true;
  userParam.shipping_address = false;
  userParam.info_customer_vat_number = false;
  userParam.info_customer_fiscal_number = false;
  // userParam.qr_code_add = true;
  // userParam.qr_code_qriban = '';
  // userParam.qr_code_iban = 'CH58 0079 1123 0008 8901 2';
  // userParam.qr_code_iban_eur = '';
  // userParam.qr_code_isr_id = '';
  // userParam.qr_code_reference_type = 'SCOR'
  // userParam.qr_code_additional_information = '';
  // userParam.qr_code_billing_information = false;
  var variables = setVariables();
  //
  var invoices = ['401', '402', '403'];
  for (var i = 0; i < invoices.length; i++) {
    var jsonInvoice = JSON.parse(getJsonInvoice(invoices[i]));
    this.addReport(banDoc, texts, userParam, jsonInvoice, variables);
  }
}

ReportInvoiceUniXX.prototype.test_AppEstimatesInvoices_3 = function() {
  var fileAC2 = "file:script/../test/testcases/invoice_deposit_test.ac2";
  var banDoc = Banana.application.openDocument(fileAC2);
  if (!banDoc) {
    return;
  }
  //
  IS_INTEGRATED_INVOICE = true;
  var texts = setTexts('en');
  var userParam = setUserParam(texts);
  userParam.details_gross_amounts = true;
  userParam.shipping_address = false;
  userParam.info_customer_vat_number = false;
  userParam.info_customer_fiscal_number = false;
  // userParam.qr_code_add = true;
  // userParam.qr_code_qriban = '';
  // userParam.qr_code_iban = 'CH58 0079 1123 0008 8901 2';
  // userParam.qr_code_iban_eur = '';
  // userParam.qr_code_isr_id = '';
  // userParam.qr_code_reference_type = 'SCOR'
  // userParam.qr_code_additional_information = '';
  // userParam.qr_code_billing_information = false;
  var variables = setVariables();
  //
  var invoices = ['5','6','7','8','9','10','11','12'];
  for (var i = 0; i < invoices.length; i++) {
    var jsonInvoice = JSON.parse(getJsonInvoice(invoices[i]));
    this.addReport(banDoc, texts, userParam, jsonInvoice, variables);
  }
}

ReportInvoiceUniXX.prototype.test_AppEstimatesInvoices_4 = function() {
  var fileAC2 = "file:script/../test/testcases/invoice_estimates_test.ac2";
  var banDoc = Banana.application.openDocument(fileAC2);
  if (!banDoc) {
    return;
  }
  //
  IS_INTEGRATED_INVOICE = true;
  var texts = setTexts('en');
  var userParam = setUserParam(texts);
  userParam.shipping_address = false;
  userParam.info_order_number = true;
  userParam.info_order_date = true;
  userParam.info_customer_vat_number = false;
  userParam.info_customer_fiscal_number = false;
  userParam.details_columns = 'Number;Date;Description;Quantity;ReferenceUnit;UnitPrice;Discount;Amount';
  userParam.details_columns_widths = '10%;10%;25%;10%;10%;10%;10%;15%';
  userParam.details_columns_titles_alignment = 'left;left;left;right;center;right;right;right';
  userParam.details_columns_alignment = 'left;left;left;right;center;right;right;right';
  userParam.details_gross_amounts = true;
  userParam.en_text_details_columns = 'Item;Date;Description;Quantity;Unit;Unit Price;Discount;Amount';
  // userParam.qr_code_add = true;
  // userParam.qr_code_qriban = '';
  // userParam.qr_code_iban = 'CH58 0079 1123 0008 8901 2';
  // userParam.qr_code_iban_eur = '';
  // userParam.qr_code_isr_id = '';
  // userParam.qr_code_reference_type = 'SCOR'
  // userParam.qr_code_additional_information = '';
  // userParam.qr_code_billing_information = false;
  var variables = setVariables();
  //
  var invoices = ['3'];
  for (var i = 0; i < invoices.length; i++) {
    var jsonInvoice = JSON.parse(getJsonInvoice(invoices[i]));
    this.addReport(banDoc, texts, userParam, jsonInvoice, variables);
  }
}

ReportInvoiceUniXX.prototype.test_AppEstimatesInvoices_5 = function() {
  var fileAC2 = "file:script/../test/testcases/v0_estimates_invoices_test.ac2";
  var banDoc = Banana.application.openDocument(fileAC2);
  if (!banDoc) {
    return;
  }
  //
  IS_INTEGRATED_INVOICE = true;
  var texts = setTexts('en');
  var userParam = setUserParam(texts);
  userParam.shipping_address = false;
  userParam.info_order_number = false;
  userParam.info_order_date = false;
  userParam.info_customer_vat_number = false;
  userParam.info_customer_fiscal_number = false;
  userParam.details_columns = 'Description;Quantity;ReferenceUnit;UnitPrice;Amount';
  userParam.details_columns_widths = '50%;10%;10%;15%;15%';
  userParam.details_columns_titles_alignment = 'eft;center;center;right;right';
  userParam.details_columns_alignment = 'eft;center;center;right;right';
  userParam.details_gross_amounts = false;
  userParam.details_additional_descriptions = false;
  userParam.en_text_details_columns = 'Description;Quantity;Unit;Unit Price;Amount';
  // userParam.qr_code_add = true;
  // userParam.qr_code_qriban = '';
  // userParam.qr_code_iban = 'CH58 0079 1123 0008 8901 2';
  // userParam.qr_code_iban_eur = '';
  // userParam.qr_code_isr_id = '';
  // userParam.qr_code_reference_type = 'SCOR'
  // userParam.qr_code_additional_information = '';
  // userParam.qr_code_billing_information = true;
  var variables = setVariables();
  //
  var invoices = ['16','17','18'];
  for (var i = 0; i < invoices.length; i++) {
    var jsonInvoice = JSON.parse(getJsonInvoice(invoices[i]));
    this.addReport(banDoc, texts, userParam, jsonInvoice, variables);
  }
}




//Function that adds the report
ReportInvoiceUniXX.prototype.addReport = function(banDoc, texts, userParam, jsonInvoice, variables) {
  var reportTest = printInvoice(banDoc, reportTest, texts, userParam, "", jsonInvoice, variables);
  Test.logger.addReport("ReportTest", reportTest);
}

//Function used to set all the parameters
function setUserParam(texts) {
  
  var userParam = {};

  //Include
  userParam.header_print = true;
  userParam.header_row_1 = "Banana.ch SA";
  userParam.header_row_2 = "Via alla Santa 7 - 6962 Viganello";
  userParam.header_row_3 = "www.banana.ch - info@banana.ch";
  userParam.header_row_4 = "IVA 123 456 789";
  userParam.header_row_5 = "";
  userParam.logo_print = true;
  userParam.logo_name = 'Logo';
  userParam.address_small_line = 'Banana.ch SA - Via alla Santa 7 - 6962 Viganello';
  userParam.address_left = false;
  userParam.address_composition = '<OrganisationName>\n<NamePrefix>\n<FirstName> <FamilyName>\n<Street>\n<AddressExtra>\n<POBox>\n<PostalCode> <Locality>';
  userParam.shipping_address = true;
  userParam.info_invoice_number = true;
  userParam.info_date = true;
  userParam.info_customer = true;
  userParam.info_customer_vat_number = true;
  userParam.info_customer_fiscal_number = true;
  userParam.info_due_date = true;
  userParam.info_page = true;
  userParam.details_columns = 'Description;Quantity;ReferenceUnit;UnitPrice;Amount';
  userParam.details_columns_widths = '50%;10%;10%;15%;15%';
  userParam.details_columns_titles_alignment = 'center;center;center;center;center';
  userParam.details_columns_alignment = 'left;right;center;right;right';
  userParam.details_gross_amounts = false;
  userParam.footer_add = true;
  userParam.footer_left = texts.invoice;
  userParam.footer_center = '';
  userParam.footer_right = texts.page+' <'+texts.page+'>';
  userParam.footer_horizontal_line = true;

  //Texts
  userParam.languages = 'en;it;de;fr;nl;zh';
  userParam.en_text_info_invoice_number = texts.invoice;
  userParam.en_text_info_date = texts.date;
  userParam.en_text_info_customer = texts.customer;
  userParam.en_text_info_customer_vat_number = texts.vat_number;
  userParam.en_text_info_customer_fiscal_number = texts.fiscal_number;
  userParam.en_text_info_due_date = texts.payment_terms_label;
  userParam.en_text_info_page = texts.page;
  userParam.en_text_shipping_address = texts.shipping_address;
  userParam.en_title_doctype_10 = texts.invoice + " <DocInvoice>";
  userParam.en_title_doctype_12 = texts.credit_note + " <DocInvoice>";
  userParam.en_text_details_columns = texts.description+";"+texts.quantity+";"+texts.reference_unit+";"+texts.unit_price+";"+texts.amount;
  userParam.en_text_totalnet = texts.totalnet;
  userParam.en_text_vat = texts.vat;
  userParam.en_text_total = texts.total;
  userParam.en_text_final = '';
  userParam.en_footer_left = texts.invoice;
  userParam.en_footer_center = '';
  userParam.en_footer_right = texts.page+' <'+texts.page+'>';

  //Styles
  userParam.text_color = '#000000';
  userParam.background_color_details_header = '#337AB7';
  userParam.text_color_details_header = '#FFFFFF';
  userParam.background_color_alternate_lines = '#F0F8FF';
  userParam.font_family = 'Helvetica';
  userParam.font_size = '10';

  //Embedded JavaScript file
  userParam.embedded_javascript_filename = '';
  userParam.embedded_css_filename = '';

  return userParam;
}

function setVariables() {
  var variables = {};
  variables.decimals_quantity = 4;
  variables.decimals_unit_price = 2;
  variables.decimals_amounts = 2;
  return variables;
}

function getJsonInvoices(banDoc) {
  
  /* Used for integrated invoices */

  var invoicesCustomers = banDoc.invoicesCustomers();
  var jsonInvoices = [];

  var length = invoicesCustomers.rowCount;

  for (var i = 0; i < length; i++) {
    if (JSON.parse(invoicesCustomers.row(i).toJSON()).ObjectType === 'InvoiceDocument') {
      jsonInvoices.push(JSON.parse(JSON.parse(invoicesCustomers.row(i).toJSON()).ObjectJSonData).InvoiceDocument);
    }
  }

  return jsonInvoices;
}

function getJsonInvoice(invoiceNumber) {

  /* Used for Application Estimates and Invoices */

  var file;
  var parsedfile;
  var jsonInvoice;

  if (invoiceNumber === "3") {
    file = Banana.IO.getLocalFile("file:script/../test/testcases/json_invoice_3.json");
    parsedfile = JSON.stringify(file.read(), "", "");
    jsonInvoice = JSON.parse(parsedfile);
    //Banana.console.log(jsonInvoice);
  }
  else if (invoiceNumber === "5") {
    file = Banana.IO.getLocalFile("file:script/../test/testcases/json_invoice_5.json");
    parsedfile = JSON.stringify(file.read(), "", "");
    jsonInvoice = JSON.parse(parsedfile);
    //Banana.console.log(jsonInvoice);
  }
  else if (invoiceNumber === "6") {
    file = Banana.IO.getLocalFile("file:script/../test/testcases/json_invoice_6.json");
    parsedfile = JSON.stringify(file.read(), "", "");
    jsonInvoice = JSON.parse(parsedfile);
    //Banana.console.log(jsonInvoice);
  }
  else if (invoiceNumber === "7") {
    file = Banana.IO.getLocalFile("file:script/../test/testcases/json_invoice_7.json");
    parsedfile = JSON.stringify(file.read(), "", "");
    jsonInvoice = JSON.parse(parsedfile);
    //Banana.console.log(jsonInvoice);
  }
  else if (invoiceNumber === "8") {
    file = Banana.IO.getLocalFile("file:script/../test/testcases/json_invoice_8.json");
    parsedfile = JSON.stringify(file.read(), "", "");
    jsonInvoice = JSON.parse(parsedfile);
    //Banana.console.log(jsonInvoice);
  }
  else if (invoiceNumber === "9") {
    file = Banana.IO.getLocalFile("file:script/../test/testcases/json_invoice_9.json");
    parsedfile = JSON.stringify(file.read(), "", "");
    jsonInvoice = JSON.parse(parsedfile);
    //Banana.console.log(jsonInvoice);
  }
  else if (invoiceNumber === "10") {
    file = Banana.IO.getLocalFile("file:script/../test/testcases/json_invoice_10.json");
    parsedfile = JSON.stringify(file.read(), "", "");
    jsonInvoice = JSON.parse(parsedfile);
    //Banana.console.log(jsonInvoice);
  }
  else if (invoiceNumber === "11") {
    file = Banana.IO.getLocalFile("file:script/../test/testcases/json_invoice_11.json");
    parsedfile = JSON.stringify(file.read(), "", "");
    jsonInvoice = JSON.parse(parsedfile);
    //Banana.console.log(jsonInvoice);
  }
  else if (invoiceNumber === "12") {
    file = Banana.IO.getLocalFile("file:script/../test/testcases/json_invoice_12.json");
    parsedfile = JSON.stringify(file.read(), "", "");
    jsonInvoice = JSON.parse(parsedfile);
    //Banana.console.log(jsonInvoice);
  }
  else if (invoiceNumber === "16") {
    file = Banana.IO.getLocalFile("file:script/../test/testcases/json_invoice_16.json");
    parsedfile = JSON.stringify(file.read(), "", "");
    jsonInvoice = JSON.parse(parsedfile);
    //Banana.console.log(jsonInvoice);
  }
  else if (invoiceNumber === "17") {
    file = Banana.IO.getLocalFile("file:script/../test/testcases/json_invoice_17.json");
    parsedfile = JSON.stringify(file.read(), "", "");
    jsonInvoice = JSON.parse(parsedfile);
    //Banana.console.log(jsonInvoice);
  }
  else if (invoiceNumber === "18") {
    file = Banana.IO.getLocalFile("file:script/../test/testcases/json_invoice_18.json");
    parsedfile = JSON.stringify(file.read(), "", "");
    jsonInvoice = JSON.parse(parsedfile);
    //Banana.console.log(jsonInvoice);
  }
  else if (invoiceNumber === "401") {
    file = Banana.IO.getLocalFile("file:script/../test/testcases/json_invoice_401.json");
    parsedfile = JSON.stringify(file.read(), "", "");
    jsonInvoice = JSON.parse(parsedfile);
    //Banana.console.log(jsonInvoice);    
  }
  else if (invoiceNumber === "402") {
    file = Banana.IO.getLocalFile("file:script/../test/testcases/json_invoice_402.json");
    parsedfile = JSON.stringify(file.read(), "", "");
    jsonInvoice = JSON.parse(parsedfile);
    //Banana.console.log(jsonInvoice);    
  }
  else if (invoiceNumber === "403") {
    file = Banana.IO.getLocalFile("file:script/../test/testcases/json_invoice_403.json");
    parsedfile = JSON.stringify(file.read(), "", "");
    jsonInvoice = JSON.parse(parsedfile);
    //Banana.console.log(jsonInvoice);    
  }

  return jsonInvoice;
}
