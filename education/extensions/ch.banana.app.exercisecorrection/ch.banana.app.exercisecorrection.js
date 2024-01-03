// @id = ch.banana.app.exercisecorrection
// @api = 1.0
// @pubdate = 2023-12-14
// @publisher = Banana.ch SA
// @description = Correction of exercises
// @description.it = Correzione degli esercizi
// @description.de = Berichtigung von Übungen
// @description.fr = Correction d'exercices
// @description.en = Correction of exercises
// @doctype = *
// @docproperties =
// @task = app.command
// @timeout = -1

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


function exec() {

  verifyBananaAdvancedVersion();

  //Check if we are on an opened document
  if (!Banana.document) { return; }

  //Check if the table exist: if not, the script's execution will stop
  if (!Banana.document.table('Transactions')) {
    return;
  }

  let printreport = new PrintReport(Banana.document, Banana.document, false);
  return printreport.result();

}

/**
 * Questa classe gestisce la logica ed i metodi per la creazione del report 
 * @param {*} banDocument 
 */

var PrintReport = class PrintReport {
  constructor(banDocument1, banDocument2, isTest) {
    this.banDoc1 = banDocument1;
    this.banDoc2 = banDocument2;
    this.isTest = isTest;
  }

  result() {

    let documentChange = { "format": "documentChange", "error": "", "data": [] };

    let studenttransactions = this.banDoc1.table("Transactions");

    for (let i = 0; i < studenttransactions.rowCount; i++) {
      if (studenttransactions.row(i).value("Doc") === "" && (studenttransactions.row(i).value("AccountDebit") != "" || studenttransactions.row(i).value("AccountCredit") != "")) {
        this.banDoc1.addMessage("Il documento iniziale non ha tutti i numeri di esercizio. I numeri di esercizio devono corrispondere.");
        return;
      }
    }


    let teachertransactions;

    if (this.isTest) {
      teachertransactions = this.banDoc2.table('Transactions');
    }

    else {
      //Open the file
      let teacherfile = Banana.application.openDocument("*.*");
      if (!teacherfile) {
        return;
      }
      teachertransactions = teacherfile.table('Transactions');
    }

    for (let i = 0; i < teachertransactions.rowCount; i++) {
      if (teachertransactions.row(i).value("Doc") === "" && (teachertransactions.row(i).value("AccountDebit") != "" || teachertransactions.row(i).value("AccountCredit") != "")) {
        this.banDoc2.addMessage("Il documento da importare non ha tutti i numeri di esercizio. I numeri di esercizio devono corrispondere.");
        return;
      }
    }

    let transactions = new PrintReport(Banana.document, Banana.document, this.isTest);
    let jsonDoc = transactions.inserttransactions(teachertransactions, studenttransactions);

    documentChange["data"].push(jsonDoc);

    return documentChange;
  }

  inserttransactions(teachertransactions, studenttransactions) {

    //rows
    let rows = [];
    let flagrow = false;

    for (let k = 0; k < teachertransactions.rowCount; k++) {

      if (teachertransactions.row(k).value("AccountDebit") === "" && teachertransactions.row(k).value("AccountCredit") === "") {
        k++;
      }

      //row operation
      let row = {};
      let rowsequence = 0;
      let rowstart = 0;
      row.operation = {};
      row.operation.name = 'add';
      row.style = { "fontSize": 0, "bold": true };

      for (let i = 0; i < studenttransactions.rowCount; i++) {

        if (studenttransactions.row(i).value("Doc") === teachertransactions.row(k).value("Doc")) {
          if (!flagrow) {
            rowstart = i;
            flagrow = true;
          }
          rowsequence = i;
        }
        else if (studenttransactions.row(i).value("Doc") > teachertransactions.row(k).value("Doc")) {
          flagrow = false;
          break;
        }
        else {
          continue;
        }
      }

      row.operation.sequence = rowsequence.toString() + '.1';

      //campi riga
      row.fields = {};
      row.fields["Date"] = teachertransactions.row(k).value("Date");
      row.fields["Doc"] = teachertransactions.row(k).value("Doc");
      row.fields["Description"] = teachertransactions.row(k).value("Description");
      row.fields["AccountDebit"] = "[" + teachertransactions.row(k).value("AccountDebit") + "]";
      row.fields["AccountCredit"] = "[" + teachertransactions.row(k).value("AccountCredit") + "]";
      row.fields["Amount"] = teachertransactions.row(k).value("Amount");

      rows.push(row);

      if (teachertransactions.row(k).value("Doc") !== teachertransactions.row(k - 1).value("Doc")) {
        //row operation
        row = {};
        row.operation = {};
        row.operation.name = 'add';
        row.style = { "fontSize": 0, "bold": true };
        row.operation.sequence = (rowstart - 1).toString() + '.1';
        row.fields = {};
        rows.push(row);
        //row operation
        row = {};
        row.operation = {};
        row.operation.name = 'add';
        row.style = { "fontSize": 0, "bold": true };
        row.operation.sequence = (rowstart - 1).toString() + '.2';
        row.fields = {};
        row.fields["Doc"] = teachertransactions.row(rowstart + 1).value("Doc");
        row.fields["Description"] = "# " + teachertransactions.row(rowstart + 1).value("Doc");
        rows.push(row);
      }
    }

    //table
    let dataUnitTransactions = {};
    dataUnitTransactions.nameXml = 'Transactions';
    dataUnitTransactions.data = {};

    dataUnitTransactions.data.rowLists = [];
    dataUnitTransactions.data.rowLists.push({ 'rows': rows });

    //document
    let document = new PrintReport(this.banDoc1, this.banDoc2, this.isTest);
    let jsonDoc = document.initDocument();
    jsonDoc.document.dataUnits.push(dataUnitTransactions);

    return jsonDoc;

  }

  //Funzioni per scrivere nei file ac2

  getCurrentDate() {
    if (!this.isTest) {
      let d = new Date();
      let datestring = d.getFullYear() + ("0" + (d.getMonth() + 1)).slice(-2) + ("0" + d.getDate()).slice(-2);
      return Banana.Converter.toInternalDateFormat(datestring, "yyyymmdd");
    }
  }

  getCurrentTime() {
    if (!this.isTest) {
      let d = new Date();
      let timestring = ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
      return Banana.Converter.toInternalTimeFormat(timestring);
    }
  }

  initDocument() {
    let jsonDoc = {};
    jsonDoc.document = {};
    jsonDoc.document.fileVersion = "1.0.0";
    jsonDoc.document.dataUnits = [];
    jsonDoc.creator = {};
    let currentdate = new PrintReport(this.banDoc1, this.banDoc2, this.isTest);
    jsonDoc.creator.executionDate = currentdate.getCurrentDate();
    let currenttime = new PrintReport(this.banDoc1, this.banDoc2, this.isTest);
    jsonDoc.creator.executionTime = currenttime.getCurrentTime();
    jsonDoc.creator.name = Banana.script.getParamValue("id");
    jsonDoc.creator.version = "1.0";
    return jsonDoc;
  }

}