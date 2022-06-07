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
// @pubdate = 2022-04-26
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

ReportInvoiceUniXX.prototype.testReport = function() {
   
  Test.logger.addComment("Test ch.banana.uni.invoice.uniXX.js");

  var fileAC2 = "file:script/../test/testcases/invoice_development_file.ac2";
  var banDoc = Banana.application.openDocument(fileAC2);
  if (!banDoc) {
    return;
  }

  var jsonInvoices = getJsonInvoices(banDoc);

  Test.logger.addSubSection("Test layout uniXX");
  for (var i = 0; i < jsonInvoices.length; i++) {
    this.addReport(banDoc, jsonInvoices[i]);
  }
}

ReportInvoiceUniXX.prototype.addReport = function(banDoc, jsonInvoice) {
  IS_INTEGRATED_INVOICE = true;
  var variables = setVariables();
  var invoiceObj = jsonInvoice;
  var texts = setTexts('en');
  var userParam = setUserParam(texts);
  var reportTest = printInvoice(banDoc, reportTest, texts, userParam, "", invoiceObj, variables);
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
