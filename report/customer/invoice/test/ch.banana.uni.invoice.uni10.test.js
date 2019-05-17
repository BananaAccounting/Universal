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


// @id = ch.banana.uni.invoice.uni10.test
// @api = 1.0
// @pubdate = 2019-05-13
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.uni.invoice.uni10.js>
// @task = app.command
// @doctype = *.*
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @includejs = ../ch.banana.uni.invoice.uni10.js
// @timeout = -1


/*

  SUMMARY
  -------
  Javascript test
  1. Open the .ac2 file
  2. Execute the .js script
  3. Save the report



  virtual void addTestBegin(const QString& key, const QString& comment = QString());
  virtual void addTestEnd();

  virtual void addSection(const QString& key);
  virtual void addSubSection(const QString& key);
  virtual void addSubSubSection(const QString& key);

  virtual void addComment(const QString& comment);
  virtual void addInfo(const QString& key, const QString& value1, const QString& value2 = QString(), const QString& value3 = QString());
  virtual void addFatalError(const QString& error);
  virtual void addKeyValue(const QString& key, const QString& value, const QString& comment = QString());
  virtual void addReport(const QString& key, QJSValue report, const QString& comment = QString());
  virtual void addTable(const QString& key, QJSValue table, QStringList colXmlNames = QStringList(), const QString& comment = QString());

**/

// Register test case to be executed
Test.registerTestCase(new ReportInvoiceTemplate10());

// Here we define the class, the name of the class is not important
function ReportInvoiceTemplate10() {

}

// This method will be called at the beginning of the test case
ReportInvoiceTemplate10.prototype.initTestCase = function() {

}

// This method will be called at the end of the test case
ReportInvoiceTemplate10.prototype.cleanupTestCase = function() {

}

// This method will be called before every test method is executed
ReportInvoiceTemplate10.prototype.init = function() {

}

// This method will be called after every test method is executed
ReportInvoiceTemplate10.prototype.cleanup = function() {

}

ReportInvoiceTemplate10.prototype.testReport = function() {
   
  Test.logger.addComment("Test ch.banana.uni.invoice.uni10.js");

  var fileAC2 = "file:script/../test/testcases/invoices_universal.ac2";
  var banDoc = Banana.application.openDocument(fileAC2);
  
  //Banana.console.log("bandoc : " + banDoc);
  if (!banDoc) {return;}

  Test.logger.addSection("Invoice tests");

  //Invoice 35
  Test.logger.addSubSection("Test Invoice 35");
  aggiungiReport(banDoc, "35", "Test Invoice 35");
  
  //Invoice 36
  Test.logger.addSubSection("Test Invoice 36");
  aggiungiReport(banDoc, "36", "Test Invoice 36");

  //Invoice 37
  Test.logger.addSubSection("Test Invoice 37");
  aggiungiReport(banDoc, "37", "Test Invoice 37");

  //Invoice 47
  Test.logger.addSubSection("Test Invoice 47");
  aggiungiReport(banDoc, "47", "Test Invoice 47");
}

//Function that creates the report for the test
function aggiungiReport(banDoc, invoiceNumber, reportName) {
  
  var lang = 'en';
  if (banDoc.locale)
    lang = banDoc.locale;
  if (lang.length > 2)
    lang = lang.substr(0, 2);
  var texts = setInvoiceTexts(lang);

  //Set params (normally are taken from settings)
  var param = {};

  //Include
  param.print_header = true;
  param.print_logo = true;
  param.info_invoice_number = true;
  param.info_date = true;
  param.info_customer = true;
  param.info_due_date = true;
  param.info_page = true;
  param.items_description = true;
  param.items_quantity = true;
  param.items_unit_price = true;
  param.items_total = true;
  
  //Texts
  param.header_row_1 = "";
  param.header_row_2 = "";
  param.header_row_3 = "";
  param.header_row_4 = "";
  param.header_row_5 = "";
  param.info_invoice_number_text = texts.invoice;
  param.info_date_text = texts.date;
  param.info_customer_text = texts.customer;
  param.info_due_date_text = texts.payment_terms_label;
  param.info_page_text = texts.page;
  param.items_description_text = texts.description;
  param.items_quantity_text = texts.qty;
  param.items_unit_price_text = texts.unit_price;
  param.items_total_text = texts.total;

  //Styles
  param.color_1 = '#337ab7';
  param.color_2 = '#ffffff';
  param.color_3 = '';
  param.color_4 = '';
  param.font_family = 'Helvetica';

  //Invoice elements
  param.small_address_line = '';
  param.address_left = false;
  param.invoice_details_iva_netto = false;
  param.invoice_details_iva_lordo = false;
  param.invoice_details_senza_iva = false;
  param_footer = '';

  //Embedded JavaScript file
  param.custom_javascript_filename = '';




  //Banana.console.log(JSON.stringify(jsonInvoice, "", ""));

  var jsonInvoice = getJsonInvoice(invoiceNumber);
  var invoiceReport = printInvoice(jsonInvoice, invoiceReport, param);

  Test.logger.addReport(reportName, invoiceReport);
}


function getJsonInvoice(invoiceNumber) {
  var file;
  var parsedfile;
  var jsonInvoice;
  
  if (invoiceNumber === "35") {
    file = Banana.IO.getLocalFile("file:script/../test/testcases/json_invoice_35.json");
    parsedfile = JSON.stringify(file.read(), "", "");
    jsonInvoice = JSON.parse(parsedfile);
    // Banana.console.log(jsonInvoice);
  }
  else if (invoiceNumber === "36") {
    file = Banana.IO.getLocalFile("file:script/../test/testcases/json_invoice_36.json");
    parsedfile = JSON.stringify(file.read(), "", "");
    jsonInvoice = JSON.parse(parsedfile);
    // Banana.console.log(jsonInvoice);
  }
  else if (invoiceNumber === "37") {
    file = Banana.IO.getLocalFile("file:script/../test/testcases/json_invoice_37.json");
    parsedfile = JSON.stringify(file.read(), "", "");
    jsonInvoice = JSON.parse(parsedfile);
    // Banana.console.log(jsonInvoice);
  }
  else if (invoiceNumber === "47") {
    file = Banana.IO.getLocalFile("file:script/../test/testcases/json_invoice_47.json");
    parsedfile = JSON.stringify(file.read(), "", "");
    jsonInvoice = JSON.parse(parsedfile);
    // Banana.console.log(jsonInvoice);
  }

  return jsonInvoice;
}
