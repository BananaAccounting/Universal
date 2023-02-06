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


// @id = ch.banana.report.customer.reminder.style03.test
// @api = 1.0
// @pubdate = 2023-01-27
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.report.customer.reminder.style03.js>
// @task = app.command
// @doctype = *.*
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @includejs = ../ch.banana.report.customer.reminder.style03.js
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
Test.registerTestCase(new ReportReminderStyle03());

// Here we define the class, the name of the class is not important
function ReportReminderStyle03() {

}

// This method will be called at the beginning of the test case
ReportReminderStyle03.prototype.initTestCase = function() {

}

// This method will be called at the end of the test case
ReportReminderStyle03.prototype.cleanupTestCase = function() {

}

// This method will be called before every test method is executed
ReportReminderStyle03.prototype.init = function() {

}

// This method will be called after every test method is executed
ReportReminderStyle03.prototype.cleanup = function() {

}

ReportReminderStyle03.prototype.testReport = function() {

  Test.logger.addComment("Test Report Reminder Style03");
  
  //Test print reminder by customers
  this.add_test_reminder_by_customer('jsonReminder_rossi.json'); //it
  this.add_test_reminder_by_customer('jsonReminder_schwartz.json'); //de
  this.add_test_reminder_by_customer('jsonReminder_smith.json'); //en
  this.add_test_reminder_by_customer('jsonReminder_camus.json'); //fr

  //Test print reminder by invoice
  this.add_test_reminder_by_invoice('jsonReminder_invoice10_reminder1.json'); // it, 1st reminder
  this.add_test_reminder_by_invoice('jsonReminder_invoice10_reminder2.json'); // it, 2nd reminder
  this.add_test_reminder_by_invoice('jsonReminder_invoice10_reminder3.json'); // it, 3rd reminder
}

ReportReminderStyle03.prototype.add_test_reminder_by_customer = function(jsonName) {
  var fileAC2 = "file:script/../test/testcases/reminder-test.ac2";
  var banDoc = Banana.application.openDocument(fileAC2);
  var jsonReminder = getJsonReminder(jsonName);
  var reminderObj = JSON.parse(jsonReminder);
  var langDoc = getLangDoc(reminderObj);
  var texts = setTexts(langDoc);
  var param = setParam(texts);  
  var reportReminder = printReminder(banDoc, reminderObj, reportReminder, '', param, texts);
  Test.logger.addReport("Report Reminder Test", reportReminder);
}

ReportReminderStyle03.prototype.add_test_reminder_by_invoice = function(jsonName) {
  var fileAC2 = "file:script/../test/testcases/reminder-test2.ac2";
  var banDoc = Banana.application.openDocument(fileAC2);
  var jsonReminder = getJsonReminder(jsonName);
  var reminderObj = JSON.parse(jsonReminder);
  var langDoc = getLangDoc(reminderObj);
  var texts = setTexts(langDoc);
  var param = setParam(texts);  
  var reportReminder = printReminder(banDoc, reminderObj, reportReminder, '', param, texts);
  Test.logger.addReport("Report Reminder Test", reportReminder);
}

function getLangDoc(reminderObj) {
  var langDoc = '';
  if (reminderObj.customer_info.lang) {
    langDoc = reminderObj.customer_info.lang;
  }
  if (langDoc.length <= 0) {
    langDoc = reminderObj.document_info.locale;
  }
  return langDoc;
}

function setParam(texts) {
  var param = {};
  param.print_header = true;
  param.print_logo = false;
  param.logo_name = 'Logo';
  param.text_title_it = 'Titolo';
  param.text_begin_it = 'Testo iniziale';
  param.text_final_it = 'Testo finale';
  param.text_title_fr = ''; //empty = use default text
  param.text_begin_fr = 'Texte de début';
  param.text_final_fr = 'Texte final';
  param.text_title_de = ''; //empty = use default text
  param.text_begin_de = 'Anfangstext';
  param.text_final_de = 'Text am Ende';
  param.text_title_en = 'Title';
  param.text_begin_en = 'Begin text';
  param.text_final_en = 'Final text';
  param.text_title_nl = ''; //empty = use default text
  param.text_begin_nl = 'Begintekst';
  param.text_final_nl = 'Eindtekst';
  param.font_family = 'Helvetica';
  param.color_2 = '#000000';
  return param;
}

function getJsonReminder(jsonName) {
  var file = Banana.IO.getLocalFile("file:script/../test/testcases/"+jsonName);
  var parsedfile = JSON.stringify(file.read(), "", "");
  var jsonReminder = JSON.parse(parsedfile);
  // Banana.console.log(jsonReminder);
  return jsonReminder;
}

