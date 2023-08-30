// @id = ch.banana.app/rentsdetailed
// @api = 1.0
// @pubdate = 2023-08-23
// @publisher = Banana.ch SA
// @description = Detailed report
// @description.it = Report dettagliato
// @description.fr = Rapport détaillé
// @description.de = Detaillierter Bericht
// @description.en = Detailed report
// @task = app.command
// @doctype = *.*
// @docproperties =
// @outputformat = none
// @inputdataform = none
// @timeout = -1


// SUMMARY //

// Function that prints a detailed report regarding rent payments, expense advances, and accounting shortfalls made by tenants for a rental property or apartment.

//Check if the version of Banana Accounting is compatible
function verifyBananaAdvancedVersion() {
  if (!this.banDocument)
      return false;


  if (!Banana.application.license || Banana.application.license.licenseType !== "advanced") {
      var lang = this.getLang();
      var msg = "This extension requires Banana Accounting+ Advanced";
      this.banDocument.addMessage(msg, "ID_ERR_LICENSE_NOTVALID");
      return false;
  }



  return true;
}


var reportlanguage = {};
var lan;

function exec() {

  verifyBananaAdvancedVersion();

  //Check if a document is opened
  if (!Banana.document) { return; }

  var printreport = new PrintReport(Banana.document);

  return printreport.report();

}

/**
 * Questa classe gestisce la logica ed i metodi per la creazione del report 
 * @param {*} banDocument 
 */

var PrintReport = class PrintReport {

  constructor(banDocument) {
    this.banDoc = banDocument;
  }

  report() {

  setlanguage(lan);

  //Check if there is the Accounts table
  if (!this.banDoc.table("Accounts")) { return; }

  var today = new Date();
  var accounts = this.banDoc.table("Accounts");
  var recurringtransactions = this.banDoc.table("RecurringTransactions");
  
  if (!accounts) {
    return;
  }
  if (!recurringtransactions) {
    console.debug("Tabella Registrazioni ricorrenti non aperta.");
    return;
  }


  /*
      List of accounting overdrafts
  */

  // Create the report

  var report = Banana.Report.newReport(reportlanguage.uncoveredrents);
  var stylesheet = createStyleSheet(); // create the first stylesheet
  var currency = Banana.document.info("AccountingDataBase", "BasicCurrency");
  var tenants = Banana.document.info("AccountingDataBase", "CustomersGroup");

  if (tenants === undefined) {
    Banana.document.addMessage(reportlanguage.settenants);
    return;
  }

  // Function to get the month from the date format "YYYY-MM-DD" and return the month in the language selected by the user (italian, english, french, german) 
  function getMonth(date) {
    var month = date.substr(5, 2);
    if (month === "01") {
      return reportlanguage.january;
    } else if (month === "02") {
      return reportlanguage.february;
    } else if (month === "03") {
      return reportlanguage.march;
    } else if (month === "04") {
      return reportlanguage.april;
    } else if (month === "05") {
      return reportlanguage.may;
    } else if (month === "06") {
      return reportlanguage.june;
    } else if (month === "07") {
      return reportlanguage.july;
    } else if (month === "08") {
      return reportlanguage.august;
    } else if (month === "09") {
      return reportlanguage.september;
    } else if (month === "10") {
      return reportlanguage.october;
    } else if (month === "11") {
      return reportlanguage.november;
    } else if (month === "12") {
      return reportlanguage.december;
    }
  }

  // Add the header to the report
  addHeader(report, stylesheet);

  // Add paragraph with the title and the date of the report
  report.addParagraph(reportlanguage.uncoveredrents, "heading");
  report.addParagraph(today.toLocaleString(), "heading");


  var table = report.addTable("internalTable");
  var tableRow = table.addRow();

  // Add the table column titles
  tableRow = table.addRow();
  tableRow.addCell(reportlanguage.account, "border-bottom left bold");
  tableRow.addCell(reportlanguage.debtor, "border-bottom left bold");
  tableRow.addCell(reportlanguage.debit, "border-bottom left bold");
  tableRow.addCell(reportlanguage.currency, "border-bottom center bold");
  tableRow.addCell(reportlanguage.startbalance, "border-bottom right bold");
  tableRow.addCell(getMonth(Banana.document.startPeriod("M")), "border-bottom right bold january");
  tableRow.addCell(getMonth(Banana.document.startPeriod("2M")), "border-bottom right bold february");
  tableRow.addCell(getMonth(Banana.document.startPeriod("3M")), "border-bottom right bold march");
  tableRow.addCell(getMonth(Banana.document.startPeriod("4M")), "border-bottom right bold april");
  tableRow.addCell(getMonth(Banana.document.startPeriod("5M")), "border-bottom right bold may");
  tableRow.addCell(getMonth(Banana.document.startPeriod("6M")), "border-bottom right bold june");
  tableRow.addCell(getMonth(Banana.document.startPeriod("7M")), "border-bottom right bold july");
  tableRow.addCell(getMonth(Banana.document.startPeriod("8M")), "border-bottom right bold august");
  tableRow.addCell(getMonth(Banana.document.startPeriod("9M")), "border-bottom right bold september");
  tableRow.addCell(getMonth(Banana.document.startPeriod("10M")), "border-bottom right bold october");
  tableRow.addCell(getMonth(Banana.document.startPeriod("11M")), "border-bottom right bold november");
  tableRow.addCell(getMonth(Banana.document.startPeriod("12M")), "border-bottom right bold december");
  tableRow.addCell(reportlanguage.total, "border-bottom right bold");
  tableRow = table.addRow();

  var currentbalance;
  var debit = 0.00;
  var credit = 0.00;
  var balance = 0.00;

  // Function to print in green the credit and in red the debit over 0 CHF

  var classNameAmount = "";

  function CreditAmountColor(number) {
    if (number > 0.00) {
      classNameAmount = "green";
      return Banana.Converter.toLocaleNumberFormat(number, 2, true);
    }
    else {
      classNameAmount = "";
      return Banana.Converter.toLocaleNumberFormat(number, 2, true);
    }
  }

  function BalanceAmountColor(number) {

    if (number > 0.00) {
      classNameAmount = "red";
      return Banana.Converter.toLocaleNumberFormat(number, 2, true);
    }
    else {
      classNameAmount = "";
      return Banana.Converter.toLocaleNumberFormat(number, 2, true);
    }

  }

  function FormatNumber(number) {
    return Banana.Converter.toLocaleNumberFormat(number, 2, true);
  }
  var j = 1;
  function classNameEvenRow() {
    if (j % 2 === 0) {
      return "even_rows_background_color";
    }
    else {
      return;
    }
  }

  function TodayMonth() {
    var month = today.getMonth() + 1;
    // if column is the current month, return "yellow"
    if (month === 1) {
      return stylesheet.addStyle(".january", "background-color:#FFFF8A");
    } else if (month === 2) {
      stylesheet.addStyle(".february", "background-color:#FFFF8A");
    } else if (month === 3) {
      stylesheet.addStyle(".march", "background-color:#FFFF8A");
    } else if (month === 4) {
      stylesheet.addStyle(".april", "background-color:#FFFF8A");
    } else if (month === 5) {
      stylesheet.addStyle(".may", "background-color:#FFFF8A");
    } else if (month === 6) {
      stylesheet.addStyle(".june", "background-color:#FFFF8A");
    } else if (month === 7) {
      stylesheet.addStyle(".july", "background-color:#FFFF8A");
    } else if (month === 8) {
      stylesheet.addStyle(".august", "background-color:#FFFF8A");
    } else if (month === 9) {
      stylesheet.addStyle(".september", "background-color:#FFFF8A");
    } else if (month === 10) {
      stylesheet.addStyle(".october", "background-color:#FFFF8A");
    } else if (month === 11) {
      stylesheet.addStyle(".november", "background-color:#FFFF8A");
    } else if (month === 12) {
      stylesheet.addStyle(".december", "background-color:#FFFF8A");
    }
  }

  function NextDate(startmonth, repeat) {
    var startmonth = new Date(startmonth);
    var nextdate;
    if (repeat === "M") {
      nextdate = new Date(startmonth.getFullYear(), startmonth.getMonth() + 1, startmonth.getDate());
    }
    else if (repeat === "3M") {
      nextdate = new Date(startmonth.getFullYear(), startmonth.getMonth() + 3, startmonth.getDate());
    }
    else if (repeat === "6M") {
      nextdate = new Date(startmonth.getFullYear(), startmonth.getMonth() + 6, startmonth.getDate());
    }
    else if (repeat === "Y") {
      nextdate = new Date(startmonth.getFullYear() + 1, startmonth.getMonth(), startmonth.getDate());
    }
    else if (repeat === "") {
      nextdate = startmonth;
    }
    else {
      nextdate = startmonth;
      Banana.document.addMessage(reportlanguage.repeatwarning);
    }
 
    return Banana.Converter.toInternalDateFormat(nextdate);
  }


  for (var i = 0; i < accounts.rowCount; i++) {

    if (accounts.row(i).value("Gr") === tenants) {

      var debtorAccount = accounts.row(i).value("Account");

      var accountdescription = false;
      for (var k = 0; k < recurringtransactions.rowCount; k++) {

        var monthnumber = 0;

        var cc1debit = recurringtransactions.row(k).value("Cc1");
        var accountdebit = recurringtransactions.row(k).value("AccountDebit");
        var account = recurringtransactions.row(k).value("Account");
        var startdate = new Date(recurringtransactions.row(k).value("Date"));
        var startmonth = Banana.Converter.toInternalDateFormat(new Date(startdate.getFullYear(), startdate.getMonth(), 1));
        var finaldate = recurringtransactions.row(k).value("DateEnd");
        var repeat = recurringtransactions.row(k).value("Repeat");

          if (debtorAccount === accountdebit | debtorAccount === "." + cc1debit | debtorAccount === account) {
            j = j + 1;

            if (accountdescription === false) {
              tableRow.addCell(debtorAccount, "border-bottom border-left left " + classNameEvenRow());
              tableRow.addCell(accounts.row(i).value("Description"), "border-bottom left bold " + classNameEvenRow());
              accountdescription = true;
            }
            else {
              tableRow.addCell("", "border-bottom border-left left " + classNameEvenRow());
              tableRow.addCell("", "border-bottom " + classNameEvenRow());
            }

            if (Banana.document.table("Categories") === undefined) {
              debit = recurringtransactions.row(k).value("Amount");
            }
            else if (Banana.document.table("Categories")) {
              debit = recurringtransactions.row(k).value("Income");
            }


            tableRow.addCell(recurringtransactions.row(k).value("Description"), "border-bottom left bold " + classNameEvenRow());
            tableRow.addCell(currency, "border-bottom center " + classNameEvenRow());
            tableRow.addCell(Banana.Converter.toLocaleNumberFormat(0, 2, true), "border-bottom right " + classNameEvenRow());

            if ( (finaldate === "" || finaldate > Banana.document.startPeriod("M")) && Banana.document.startPeriod("M") === startmonth )  {
            tableRow.addCell(FormatNumber(debit), "border-bottom right january " + classNameEvenRow() + " " + TodayMonth());
            startmonth = NextDate(startmonth, repeat);
            monthnumber = monthnumber + 1;
          }
            else {      
              tableRow.addCell(FormatNumber(0), "border-bottom right january " + classNameEvenRow() + " " + TodayMonth());
            }
            
            if ( (finaldate === "" || finaldate > Banana.document.startPeriod("2M"))  && Banana.document.startPeriod("2M") === startmonth ) {
            tableRow.addCell(FormatNumber(debit), "border-bottom right february " + classNameEvenRow() + " " + TodayMonth());
            startmonth = NextDate(startmonth, repeat);
            monthnumber = monthnumber + 1;
          }
            else {     
              tableRow.addCell(FormatNumber(0), "border-bottom right february " + classNameEvenRow() + " " + TodayMonth());
            }
            
            if ( (finaldate === "" || finaldate > Banana.document.startPeriod("3M"))  && Banana.document.startPeriod("3M") === startmonth ) {
            tableRow.addCell(FormatNumber(debit), "border-bottom right march " + classNameEvenRow() + " " + TodayMonth());
            startmonth = NextDate(startmonth, repeat);
            monthnumber = monthnumber + 1;
          }
            else {    
              tableRow.addCell(FormatNumber(0), "border-bottom right march " + classNameEvenRow() + " " + TodayMonth());
            }
            
            if ( (finaldate === "" || finaldate > Banana.document.startPeriod("4M"))  && Banana.document.startPeriod("4M") === startmonth ) {
            tableRow.addCell(FormatNumber(debit), "border-bottom right april " + classNameEvenRow() + " " + TodayMonth());
            startmonth = NextDate(startmonth, repeat);
            monthnumber = monthnumber + 1;
          }
            else {     
              tableRow.addCell(FormatNumber(0), "border-bottom right april " + classNameEvenRow() + " " + TodayMonth());
            }
            
            if ( (finaldate === "" || finaldate > Banana.document.startPeriod("5M"))  && Banana.document.startPeriod("5M") === startmonth ) {
            tableRow.addCell(FormatNumber(debit), "border-bottom right may " + classNameEvenRow() + " " + TodayMonth());
            startmonth = NextDate(startmonth, repeat);
            monthnumber = monthnumber + 1;
          }
            else {  
              tableRow.addCell(FormatNumber(0), "border-bottom right may " + classNameEvenRow() + " " + TodayMonth());
            }
            
            if ( (finaldate === "" || finaldate > Banana.document.startPeriod("6M"))  && Banana.document.startPeriod("6M") === startmonth ) {
            tableRow.addCell(FormatNumber(debit), "border-bottom right june " + classNameEvenRow() + " " + TodayMonth());
            startmonth = NextDate(startmonth, repeat);
            monthnumber = monthnumber + 1;
          }
            else {    
              tableRow.addCell(FormatNumber(0), "border-bottom right june " + classNameEvenRow() + " " + TodayMonth());
            }
            
            if ( (finaldate === "" || finaldate > Banana.document.startPeriod("7M"))  && Banana.document.startPeriod("7M") === startmonth ) {
            tableRow.addCell(FormatNumber(debit), "border-bottom right july " + classNameEvenRow() + " " + TodayMonth());
            startmonth = NextDate(startmonth, repeat);
            monthnumber = monthnumber + 1;
          }
            else {  
              tableRow.addCell(FormatNumber(0), "border-bottom right july " + classNameEvenRow() + " " + TodayMonth());
            }
            
            if ( (finaldate === "" || finaldate > Banana.document.startPeriod("8M"))  && Banana.document.startPeriod("8M") === startmonth ) {
            tableRow.addCell(FormatNumber(debit), "border-bottom right august " + classNameEvenRow() + " " + TodayMonth());
            startmonth = NextDate(startmonth, repeat);
            monthnumber = monthnumber + 1;
          }
            else {   
              tableRow.addCell(FormatNumber(0), "border-bottom right august " + classNameEvenRow() + " " + TodayMonth());
            }
            
            if ( (finaldate === "" || finaldate > Banana.document.startPeriod("9M"))  && Banana.document.startPeriod("9M") === startmonth ) {
            tableRow.addCell(FormatNumber(debit), "border-bottom right september " + classNameEvenRow() + " " + TodayMonth());
            startmonth = NextDate(startmonth, repeat);
            monthnumber = monthnumber + 1;
          }
            else {
              
              tableRow.addCell(FormatNumber(0), "border-bottom right september " + classNameEvenRow() + " " + TodayMonth());
            }
            
            if ( (finaldate === "" || finaldate > Banana.document.startPeriod("10M"))  && Banana.document.startPeriod("10M") === startmonth ) {
            tableRow.addCell(FormatNumber(debit), "border-bottom right october " + classNameEvenRow() + " " + TodayMonth());
            startmonth = NextDate(startmonth, repeat);
            monthnumber = monthnumber + 1;
          }
            else {  
              tableRow.addCell(FormatNumber(0), "border-bottom right october " + classNameEvenRow() + " " + TodayMonth());
            }
            
            if ( (finaldate === "" || finaldate > Banana.document.startPeriod("11M"))  && Banana.document.startPeriod("11M") === startmonth ) {
            tableRow.addCell(FormatNumber(debit), "border-bottom right november " + classNameEvenRow() + " " + TodayMonth());
            startmonth = NextDate(startmonth, repeat);
            monthnumber = monthnumber + 1;  
          }
            else { 
              tableRow.addCell(FormatNumber(0), "border-bottom right november " + classNameEvenRow() + " " + TodayMonth());
            }
            
            if ( (finaldate === "" || finaldate > Banana.document.startPeriod("12M"))  && Banana.document.startPeriod("12M") === startmonth ) {
            tableRow.addCell(FormatNumber(debit), "border-bottom right december " + classNameEvenRow() + " " + TodayMonth());
            startmonth = NextDate(startmonth, repeat);
            monthnumber = monthnumber + 1;
          }
            else {   
              tableRow.addCell(FormatNumber(0), "border-bottom right december " + classNameEvenRow() + " " + TodayMonth());
            }
            tableRow.addCell(FormatNumber(debit * monthnumber), "border-bottom border-right right " + classNameEvenRow());
          tableRow = table.addRow();
          }
        }

        // Calculate the monthly debit of the debtor accounts
        j = j + 1;
        tableRow.addCell("", "border-bottom border-left left " + classNameEvenRow());
        tableRow.addCell("", "border-bottom left " + classNameEvenRow());
        tableRow.addCell(reportlanguage.charged, "border-bottom left bold " + classNameEvenRow());

        tableRow.addCell(currency, "border-bottom center " + classNameEvenRow());

        debit = 0.00;

        tableRow.addCell(FormatNumber(debit), "border-bottom right " + classNameEvenRow());
        currentbalance = Banana.document.currentBalance(debtorAccount, Banana.document.startPeriod("M"), Banana.document.endPeriod("M"));
        debit = currentbalance.debit;

        tableRow.addCell(FormatNumber(debit), "border-bottom right january " + classNameEvenRow() + " " + TodayMonth());
        currentbalance = Banana.document.currentBalance(debtorAccount, Banana.document.startPeriod("2M"), Banana.document.endPeriod("2M"));
        debit = currentbalance.debit;

        tableRow.addCell(FormatNumber(debit), "border-bottom right february " + classNameEvenRow() + " " + TodayMonth());
        currentbalance = Banana.document.currentBalance(debtorAccount, Banana.document.startPeriod("3M"), Banana.document.endPeriod("3M"));
        debit = currentbalance.debit;

        tableRow.addCell(FormatNumber(debit), "border-bottom right march " + classNameEvenRow() + " " + TodayMonth());
        currentbalance = Banana.document.currentBalance(debtorAccount, Banana.document.startPeriod("4M"), Banana.document.endPeriod("4M"));
        debit = currentbalance.debit;

        tableRow.addCell(FormatNumber(debit), "border-bottom right april " + classNameEvenRow() + " " + TodayMonth());
        currentbalance = Banana.document.currentBalance(debtorAccount, Banana.document.startPeriod("5M"), Banana.document.endPeriod("5M"));
        debit = currentbalance.debit;

        tableRow.addCell(FormatNumber(debit), "border-bottom right may " + classNameEvenRow() + " " + TodayMonth());
        currentbalance = Banana.document.currentBalance(debtorAccount, Banana.document.startPeriod("6M"), Banana.document.endPeriod("6M"));
        debit = currentbalance.debit;

        tableRow.addCell(FormatNumber(debit), "border-bottom right june " + classNameEvenRow() + " " + TodayMonth());
        currentbalance = Banana.document.currentBalance(debtorAccount, Banana.document.startPeriod("7M"), Banana.document.endPeriod("7M"));
        debit = currentbalance.debit;

        tableRow.addCell(FormatNumber(debit), "border-bottom right july " + classNameEvenRow() + " " + TodayMonth());
        currentbalance = Banana.document.currentBalance(debtorAccount, Banana.document.startPeriod("8M"), Banana.document.endPeriod("8M"));
        debit = currentbalance.debit;

        tableRow.addCell(FormatNumber(debit), "border-bottom right august " + classNameEvenRow() + " " + TodayMonth());
        currentbalance = Banana.document.currentBalance(debtorAccount, Banana.document.startPeriod("9M"), Banana.document.endPeriod("9M"));
        debit = currentbalance.debit;

        tableRow.addCell(FormatNumber(debit), "border-bottom right september " + classNameEvenRow() + " " + TodayMonth());
        currentbalance = Banana.document.currentBalance(debtorAccount, Banana.document.startPeriod("10M"), Banana.document.endPeriod("10M"));
        debit = currentbalance.debit;

        tableRow.addCell(FormatNumber(debit), "border-bottom right october " + classNameEvenRow() + " " + TodayMonth());
        currentbalance = Banana.document.currentBalance(debtorAccount, Banana.document.startPeriod("11M"), Banana.document.endPeriod("11M"));
        debit = currentbalance.debit;

        tableRow.addCell(FormatNumber(debit), "border-bottom right november " + classNameEvenRow() + " " + TodayMonth());
        currentbalance = Banana.document.currentBalance(debtorAccount, Banana.document.startPeriod("12M"), Banana.document.endPeriod("12M"));
        debit = currentbalance.debit;

        tableRow.addCell(FormatNumber(debit), "border-bottom right december " + classNameEvenRow() + " " + TodayMonth());
        currentbalance = Banana.document.currentBalance(debtorAccount, Banana.document.startPeriod(), Banana.document.endPeriod());
        debit = currentbalance.debit;

        tableRow.addCell(FormatNumber(debit), "border-bottom border-right right " + classNameEvenRow());
        tableRow = table.addRow();

        // Add the credit of the debtor accounts
        j = j + 1;
        tableRow.addCell("", "border-bottom border-left left " + classNameEvenRow());
        tableRow.addCell("", "border-bottom left " + classNameEvenRow());
        tableRow.addCell(reportlanguage.paid, "border-bottom left bold " + classNameEvenRow());

        tableRow.addCell(currency, "border-bottom center " + classNameEvenRow());

        credit = 0.00;
        tableRow.addCell(CreditAmountColor(credit), "border-bottom right " + classNameEvenRow() + " " + classNameAmount);
        currentbalance = Banana.document.currentBalance(debtorAccount, Banana.document.startPeriod("M"), Banana.document.endPeriod("M"));
        credit = currentbalance.credit;

        tableRow.addCell(CreditAmountColor(credit), "border-bottom right january " + classNameEvenRow() + " " + classNameAmount + " " + TodayMonth());
        currentbalance = Banana.document.currentBalance(debtorAccount, Banana.document.startPeriod("2M"), Banana.document.endPeriod("2M"));
        credit = currentbalance.credit;

        tableRow.addCell(CreditAmountColor(credit), "border-bottom right february " + classNameEvenRow() + " " + classNameAmount + " " + TodayMonth());
        currentbalance = Banana.document.currentBalance(debtorAccount, Banana.document.startPeriod("3M"), Banana.document.endPeriod("3M"));
        credit = currentbalance.credit;

        tableRow.addCell(CreditAmountColor(credit), "border-bottom right march " + classNameEvenRow() + " " + classNameAmount + " " + TodayMonth());
        currentbalance = Banana.document.currentBalance(debtorAccount, Banana.document.startPeriod("4M"), Banana.document.endPeriod("4M"));
        credit = currentbalance.credit;

        tableRow.addCell(CreditAmountColor(credit), "border-bottom right april " + classNameEvenRow() + " " + classNameAmount + " " + TodayMonth());
        currentbalance = Banana.document.currentBalance(debtorAccount, Banana.document.startPeriod("5M"), Banana.document.endPeriod("5M"));
        credit = currentbalance.credit;

        tableRow.addCell(CreditAmountColor(credit), "border-bottom right may " + classNameEvenRow() + " " + classNameAmount + " " + TodayMonth());
        currentbalance = Banana.document.currentBalance(debtorAccount, Banana.document.startPeriod("6M"), Banana.document.endPeriod("6M"));
        credit = currentbalance.credit;

        tableRow.addCell(CreditAmountColor(credit), "border-bottom right june " + classNameEvenRow() + " " + classNameAmount + " " + TodayMonth());
        currentbalance = Banana.document.currentBalance(debtorAccount, Banana.document.startPeriod("7M"), Banana.document.endPeriod("7M"));
        credit = currentbalance.credit;

        tableRow.addCell(CreditAmountColor(credit), "border-bottom right july " + classNameEvenRow() + " " + classNameAmount + " " + TodayMonth());
        currentbalance = Banana.document.currentBalance(debtorAccount, Banana.document.startPeriod("8M"), Banana.document.endPeriod("8M"));
        credit = currentbalance.credit;

        tableRow.addCell(CreditAmountColor(credit), "border-bottom right august " + classNameEvenRow() + " " + classNameAmount + " " + TodayMonth());
        currentbalance = Banana.document.currentBalance(debtorAccount, Banana.document.startPeriod("9M"), Banana.document.endPeriod("9M"));
        credit = currentbalance.credit;

        tableRow.addCell(CreditAmountColor(credit), "border-bottom right september " + classNameEvenRow() + " " + classNameAmount + " " + TodayMonth());
        currentbalance = Banana.document.currentBalance(debtorAccount, Banana.document.startPeriod("10M"), Banana.document.endPeriod("10M"));
        credit = currentbalance.credit;

        tableRow.addCell(CreditAmountColor(credit), "border-bottom right october " + classNameEvenRow() + " " + classNameAmount + " " + TodayMonth());
        currentbalance = Banana.document.currentBalance(debtorAccount, Banana.document.startPeriod("11M"), Banana.document.endPeriod("11M"));
        credit = currentbalance.credit;

        tableRow.addCell(CreditAmountColor(credit), "border-bottom right november " + classNameEvenRow() + " " + classNameAmount + " " + TodayMonth());
        currentbalance = Banana.document.currentBalance(debtorAccount, Banana.document.startPeriod("12M"), Banana.document.endPeriod("12M"));
        credit = currentbalance.credit;

        tableRow.addCell(CreditAmountColor(credit), "border-bottom right december " + classNameEvenRow() + " " + classNameAmount + " " + TodayMonth());
        currentbalance = Banana.document.currentBalance(debtorAccount, Banana.document.startPeriod(), Banana.document.endPeriod());
        credit = currentbalance.credit;

        tableRow.addCell(CreditAmountColor(credit), "border-bottom border-right right " + classNameEvenRow() + " " + classNameAmount);
        tableRow = table.addRow();

        // Add the total of the debtor accounts
        j = j + 1;
        tableRow.addCell("", "border-bottom border-left left " + classNameEvenRow());
        tableRow.addCell("", "border-bottom left " + classNameEvenRow());
        tableRow.addCell(reportlanguage.uncovered, "border-bottom left bold " + classNameEvenRow());

        tableRow.addCell(currency, "border-bottom center " + classNameEvenRow());

        currentbalance = Banana.document.currentBalance(debtorAccount, Banana.document.startPeriod(""));
        balance = currentbalance.opening;

        tableRow.addCell(BalanceAmountColor(balance), "border-bottom right " + classNameEvenRow() + " " + classNameAmount);
        currentbalance = Banana.document.currentBalance(debtorAccount, Banana.document.startPeriod("M"), Banana.document.endPeriod("M"));
        balance = currentbalance.balance;

        tableRow.addCell(BalanceAmountColor(balance), "border-bottom right january " + classNameEvenRow() + " " + classNameAmount + " " + TodayMonth());
        currentbalance = Banana.document.currentBalance(debtorAccount, Banana.document.startPeriod("2M"), Banana.document.endPeriod("2M"));
        balance = currentbalance.balance;

        tableRow.addCell(BalanceAmountColor(balance), "border-bottom right february " + classNameEvenRow() + " " + classNameAmount + " " + TodayMonth());
        currentbalance = Banana.document.currentBalance(debtorAccount, Banana.document.startPeriod("3M"), Banana.document.endPeriod("3M"));
        balance = currentbalance.balance;

        tableRow.addCell(BalanceAmountColor(balance), "border-bottom right march " + classNameEvenRow() + " " + classNameAmount + " " + TodayMonth());
        currentbalance = Banana.document.currentBalance(debtorAccount, Banana.document.startPeriod("4M"), Banana.document.endPeriod("4M"));
        balance = currentbalance.balance;

        tableRow.addCell(BalanceAmountColor(balance), "border-bottom right april " + classNameEvenRow() + " " + classNameAmount + " " + TodayMonth());
        currentbalance = Banana.document.currentBalance(debtorAccount, Banana.document.startPeriod("5M"), Banana.document.endPeriod("5M"));
        balance = currentbalance.balance;

        tableRow.addCell(BalanceAmountColor(balance), "border-bottom right may " + classNameEvenRow() + " " + classNameAmount + " " + TodayMonth());
        currentbalance = Banana.document.currentBalance(debtorAccount, Banana.document.startPeriod("6M"), Banana.document.endPeriod("6M"));
        balance = currentbalance.balance;

        tableRow.addCell(BalanceAmountColor(balance), "border-bottom right june " + classNameEvenRow() + " " + classNameAmount + " " + TodayMonth());
        currentbalance = Banana.document.currentBalance(debtorAccount, Banana.document.startPeriod("7M"), Banana.document.endPeriod("7M"));
        balance = currentbalance.balance;

        tableRow.addCell(BalanceAmountColor(balance), "border-bottom right july " + classNameEvenRow() + " " + classNameAmount + " " + TodayMonth());
        currentbalance = Banana.document.currentBalance(debtorAccount, Banana.document.startPeriod("8M"), Banana.document.endPeriod("8M"));
        balance = currentbalance.balance;

        tableRow.addCell(BalanceAmountColor(balance), "border-bottom right august " + classNameEvenRow() + " " + classNameAmount + " " + TodayMonth());
        currentbalance = Banana.document.currentBalance(debtorAccount, Banana.document.startPeriod("9M"), Banana.document.endPeriod("9M"));
        balance = currentbalance.balance;

        tableRow.addCell(BalanceAmountColor(balance), "border-bottom right september " + classNameEvenRow() + " " + classNameAmount + " " + TodayMonth());
        currentbalance = Banana.document.currentBalance(debtorAccount, Banana.document.startPeriod("10M"), Banana.document.endPeriod("10M"));
        balance = currentbalance.balance;

        tableRow.addCell(BalanceAmountColor(balance), "border-bottom right october " + classNameEvenRow() + " " + classNameAmount + " " + TodayMonth());
        currentbalance = Banana.document.currentBalance(debtorAccount, Banana.document.startPeriod("11M"), Banana.document.endPeriod("11M"));
        balance = currentbalance.balance;

        tableRow.addCell(BalanceAmountColor(balance), "border-bottom right november " + classNameEvenRow() + " " + classNameAmount + " " + TodayMonth());
        currentbalance = Banana.document.currentBalance(debtorAccount, Banana.document.startPeriod("12M"), Banana.document.endPeriod("12M"));
        balance = currentbalance.balance;

        tableRow.addCell(BalanceAmountColor(balance), "border-bottom right december " + classNameEvenRow() + " " + classNameAmount + " " + TodayMonth());
        currentbalance = Banana.document.currentBalance(debtorAccount, Banana.document.startPeriod(), Banana.document.endPeriod());
        balance = currentbalance.balance;

        tableRow.addCell(BalanceAmountColor(balance), "border-bottom border-right right " + classNameEvenRow() + " " + classNameAmount);
        tableRow = table.addRow();
      }
    }

    // Add the footer to the report
    addFooter(report);

    Banana.Report.preview(report, stylesheet);

  }
}


  function setlanguage(lan) {

    if (Banana.document) {

      lan = Banana.document.locale.substring(0, 2);

    }

    if (lan.substring(0, 2) === "it") {

      reportlanguage.rents = "Affitti";
      reportlanguage.uncoveredrents = "Lista degli affitti scoperti";
      reportlanguage.account = "Conto";
      reportlanguage.debtor = "Debitore";
      reportlanguage.debtors = "Gr Debitori (Somma in)";
      reportlanguage.startbalance = "Saldo iniziale";
      reportlanguage.charged = "Addebitato";
      reportlanguage.advances = "Acconti spese";
      reportlanguage.adjustments = "Conguaglio spese";
      reportlanguage.endbalance = "Saldo finale";
      reportlanguage.date = "Data";
      reportlanguage.paid = "Pagato";
      reportlanguage.uncovered = "Scoperto";
      reportlanguage.input = "Inserisci";
      reportlanguage.choose = "Scegli";
      reportlanguage.debit = "Debito";
      reportlanguage.january = "Gennaio";
      reportlanguage.february = "Febbraio";
      reportlanguage.march = "Marzo";
      reportlanguage.april = "Aprile";
      reportlanguage.may = "Maggio";
      reportlanguage.june = "Giugno";
      reportlanguage.july = "Luglio";
      reportlanguage.august = "Agosto";
      reportlanguage.september = "Settembre";
      reportlanguage.october = "Ottobre";
      reportlanguage.november = "Novembre";
      reportlanguage.december = "Dicembre";
      reportlanguage.phone = "Telefono";
      reportlanguage.email = "E-mail";
      reportlanguage.total = "Totale";
      reportlanguage.repeatwarning = "Avviso: valore della colonna Ripeti non supportato.";
      reportlanguage.settenants = "Impostare il Gruppo dei clienti dal menu Report > Clienti > Impostazioni.";
      reportlanguage.currency = "Valuta";

    }

    else if (lan.substring(0, 2) === "en") {

      reportlanguage.rents = "Rents";
      reportlanguage.uncoveredrents = "List of uncovered rents";
      reportlanguage.account = "Account";
      reportlanguage.debtor = "Debtor";
      reportlanguage.debtors = "Gr Debtor (Sum in)";
      reportlanguage.startbalance = "Start balance";
      reportlanguage.charged = "Charged";
      reportlanguage.advances = "Advances";
      reportlanguage.adjustments = "Adjustments";
      reportlanguage.endbalance = "End balance";
      reportlanguage.date = "Date";
      reportlanguage.paid = "Paid";
      reportlanguage.uncovered = "Uncovered";
      reportlanguage.input = "Input";
      reportlanguage.choose = "Choose";
      reportlanguage.debit = "Debit";
      reportlanguage.january = "January";
      reportlanguage.february = "February";
      reportlanguage.march = "March";
      reportlanguage.april = "April";
      reportlanguage.may = "May";
      reportlanguage.june = "June";
      reportlanguage.july = "July";
      reportlanguage.august = "August";
      reportlanguage.september = "September";
      reportlanguage.october = "October";
      reportlanguage.november = "November";
      reportlanguage.december = "December";
      reportlanguage.phone = "Phone";
      reportlanguage.email = "E-mail";
      reportlanguage.total = "Total";
      reportlanguage.repeatwarning = "Warning: value of the Repeat column is not supported.";
      reportlanguage.settenants = "Set the Group of customers from the menu Report > Customers > Settings.";
      reportlanguage.currency = "Currency";

    }

    else if (lan.substring(0, 2) === "fr") {

      reportlanguage.rents = "Loyers";
      reportlanguage.uncoveredrents = "Liste des locations découvertes";
      reportlanguage.account = "Compte";
      reportlanguage.debtor = "Débiteur";
      reportlanguage.debtors = "Gr Débiteurs (Somme en)";
      reportlanguage.startbalance = "Solde initial";
      reportlanguage.charged = "Facturé";
      reportlanguage.advances = "Avances";
      reportlanguage.adjustments = "Ajustements";
      reportlanguage.endbalance = "Solde final";
      reportlanguage.date = "Date";
      reportlanguage.paid = "Payé";
      reportlanguage.uncovered = "Non couvert";
      reportlanguage.input = "Entrée";
      reportlanguage.choose = "Choisir";
      reportlanguage.debit = "Débit";
      reportlanguage.january = "Janvier";
      reportlanguage.february = "Février";
      reportlanguage.march = "Mars";
      reportlanguage.april = "Avril";
      reportlanguage.may = "Mai";
      reportlanguage.june = "Juin";
      reportlanguage.july = "Juillet";
      reportlanguage.august = "Août";
      reportlanguage.september = "Septembre";
      reportlanguage.october = "Octobre";
      reportlanguage.november = "Novembre";
      reportlanguage.december = "Décembre";
      reportlanguage.phone = "Téléphone";
      reportlanguage.email = "E-mail";
      reportlanguage.total = "Total";
      reportlanguage.repeatwarning = "Avertissement: la valeur de la colonne Répéter n'est pas prise en charge.";
      reportlanguage.settenants = "Définir le Groupe de clients dans le menu Rapport > Clients > Paramètres.";
      reportlanguage.currency = "Devise";

    }

    else if (lan.substring(0, 2) === "de") {

      reportlanguage.rents = "Mieten";
      reportlanguage.uncoveredrents = "Liste der ungedeckten Mieten";
      reportlanguage.account = "Konto";
      reportlanguage.debtor = "Schuldner";
      reportlanguage.debtors = "Gr Schuldner (Summe in)";
      reportlanguage.startbalance = "Anfangsbestand";
      reportlanguage.charged = "Belastet";
      reportlanguage.advances = "Vorauszahlungen";
      reportlanguage.adjustments = "Anpassungen";
      reportlanguage.endbalance = "Endbestand";
      reportlanguage.date = "Datum";
      reportlanguage.paid = "Bezahlt";
      reportlanguage.uncovered = "Nicht gedeckt";
      reportlanguage.input = "Eingabe";
      reportlanguage.choose = "Wählen";
      reportlanguage.debit = "Debit";
      reportlanguage.january = "Januar";
      reportlanguage.february = "Februar";
      reportlanguage.march = "März";
      reportlanguage.april = "April";
      reportlanguage.may = "Mai";
      reportlanguage.june = "Juni";
      reportlanguage.july = "Juli";
      reportlanguage.august = "August";
      reportlanguage.september = "September";
      reportlanguage.october = "Oktober";
      reportlanguage.november = "November";
      reportlanguage.december = "Dezember";
      reportlanguage.phone = "Telefon";
      reportlanguage.email = "E-mail";
      reportlanguage.total = "Gesamt";
      reportlanguage.repeatwarning = "Warnung: Wert der Spalte Wiederholen wird nicht unterstützt.";
      reportlanguage.settenants = "Setzen Sie die Gruppe der Kunden aus dem Menü Bericht > Kunden > Einstellungen.";
      reportlanguage.currency = "Währung";

    }

  }

  /* Function that prints the header */
  function addHeader(report, stylesheet) {

    var tableRow = report.addSection("header");
    var company = Banana.document.info("AccountingDataBase", "Company");
    var address1 = Banana.document.info("AccountingDataBase", "Address1");
    var zip = Banana.document.info("AccountingDataBase", "Zip");
    var city = Banana.document.info("AccountingDataBase", "City");
    var email = Banana.document.info("AccountingDataBase", "Email");
    var phone = Banana.document.info("AccountingDataBase", "Phone");
    var logoFormat = Banana.Report.logoFormat("Logo");
    var headerLogoSection = tableRow.addCell("", "");
    if (logoFormat != null) {
      var logoElement = logoFormat.createDocNode(headerLogoSection, stylesheet, "logo");
      report.addChild(logoElement);
    }

    report.addParagraph(company, "left");
    report.addParagraph(address1, "left");
    report.addParagraph(zip + " " + city, "left");
    if (phone != "") {
      report.addParagraph(reportlanguage.phone + phone, "left");
    }
    if (email != "") {
      report.addParagraph(reportlanguage.email + email, "left");
    }
    report.addParagraph(" ", "left");
    report.addParagraph(" ", "left");
  }


  /* Function that prints the footer */
  function addFooter(report) {
    var footer = report.getFooter();
    footer.addText(Banana.Converter.toLocaleDateFormat(new Date()) + "" + "");
  }

  /* Function that adds styles for the report print */
  function createStyleSheet() {

    var stylesheet = Banana.Report.newStyleSheet();
    var pageStyle = stylesheet.addStyle("@page");
    pageStyle.setAttribute("margin", "20mm 10mm 10mm 10mm");
    pageStyle.setAttribute("size", "landscape");

    var headerStyle = stylesheet.addStyle(".header");
    headerStyle.setAttribute("width", "100%");

    var titleStyle = stylesheet.addStyle(".title");
    titleStyle.setAttribute("font-size", "20");
    titleStyle.setAttribute("text-align", "center");
    titleStyle.setAttribute("font-weight", "bold");
    titleStyle.setAttribute("margin-bottom", "0.5em");

    var headerTableStyle = stylesheet.addStyle(".headerTable");
    headerTableStyle.setAttribute("background-color", "#E0E0E0");
    headerTableStyle.setAttribute("color", "black");

    var tableStyle = stylesheet.addStyle(".infoTable");
    tableStyle.setAttribute("width", "50%");
    stylesheet.addStyle("table.infoTable td", "border: thin solid black;");

    var tableStyle = stylesheet.addStyle(".internalTable");
    tableStyle.setAttribute("width", "100%");

    stylesheet.addStyle("body", "font-family:Helvetica; font-size:6pt");
    stylesheet.addStyle(".italic", "font-style:italic;");
    stylesheet.addStyle(".bold", "font-weight:bold");
    stylesheet.addStyle(".left", "text-align:left");
    stylesheet.addStyle(".center", "text-align:center");
    stylesheet.addStyle(".right", "text-align:right");
    stylesheet.addStyle(".warning", "color:red");
    stylesheet.addStyle(".warningOK", "color:green");
    stylesheet.addStyle(".border-top", "border-top:thin solid black");
    stylesheet.addStyle(".border-right", "border-right:thin solid black");
    stylesheet.addStyle(".border-bottom", "border-bottom:thin solid black");
    stylesheet.addStyle(".border-left", "border-left:thin solid black");
    stylesheet.addStyle(".headerCol1", "width:20pt");
    stylesheet.addStyle(".headerCol2", "width:65pt");
    stylesheet.addStyle(".heading", "font-size: 7pt");
    stylesheet.addStyle(".bigLogo", "font-size: 35");
    stylesheet.addStyle(".logo", "width: 200pt");
    stylesheet.addStyle(".img", "height:50%;width:50%;padding-bottom:20pt");
    stylesheet.addStyle(".padding-top", "padding-top:6pt");
    stylesheet.addStyle(".padding-bottom", "padding-bottom:3pt");
    stylesheet.addStyle(".green", "font-weight: bold; color:#00B000");
    stylesheet.addStyle(".red", "font-weight: bold; color:#FF0000");

    /* Even rows style of the invoice details.
  
     Sets the background color for even rows. */

    stylesheet.addStyle(".even_rows_background_color", "background-color:#f5f5f5");

    return stylesheet;

  }