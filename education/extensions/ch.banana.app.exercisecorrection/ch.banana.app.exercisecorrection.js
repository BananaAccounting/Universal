// @id = ch.banana.app.exercisecorrection
// @api = 1.0
// @pubdate = 2024-02-21
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
  if (!Banana.document)
    return false;


  if (!Banana.application.license || Banana.application.license.licenseType !== "advanced") {
    var msg = "This extension requires Banana Accounting+ Advanced";
    Banana.document.addMessage(msg, "ID_ERR_LICENSE_NOTVALID");
    return false;
  }

  return true;
}


function exec() {

  if (!verifyBananaAdvancedVersion()) {
    return "@Cancel";
  }

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

    // Check if the Student file has all the exercise numbers
    for (let i = 0; i < studenttransactions.rowCount; i++) {
      if (studenttransactions.row(i).value("Doc") === "" && (studenttransactions.row(i).value("AccountDebit") != "" || studenttransactions.row(i).value("AccountCredit") != "" || (studenttransactions.row(i).value("AccountDebit") != "" && studenttransactions.row(i).value("AccountCredit") != ""))) {
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

    // Check if the Teacher file has all the exercise numbers
    for (let i = 0; i < teachertransactions.rowCount; i++) {
      if (teachertransactions.row(i).value("Doc") === "" && (teachertransactions.row(i).value("AccountDebit") != "" || teachertransactions.row(i).value("AccountCredit") != "")) {
        this.banDoc2.addMessage("Il documento da importare non ha tutti i numeri di esercizio. I numeri di esercizio devono corrispondere.");
        return;
      }
    }


    let studenttransactionsArray = [];
    let teachertransactionsArray = [];
    let k = 0;


    // Filter the Student transactions rows if they have a Doc and AccountDebit or AccountCredit

    for (let i = 0; i < studenttransactions.rowCount; i++) {
      if (studenttransactions.row(i).value("Doc") !== "" && (studenttransactions.row(i).value("AccountDebit") != "" || studenttransactions.row(i).value("AccountCredit") != "")) {
        studenttransactionsArray[k] = {
          "position": i,
          "doc": studenttransactions.row(i).value("Doc")
        };

        k++;
      }
    }

    // Filter the Teacher transactions rows if they have a Doc and AccountDebit or AccountCredit

    k = 0;
    for (let i = 0; i < teachertransactions.rowCount; i++) {
      if (teachertransactions.row(i).value("Doc") !== "" && (teachertransactions.row(i).value("AccountDebit") != "" || teachertransactions.row(i).value("AccountCredit") != "")) {
        teachertransactionsArray[k] = {
          "position": i,
          "doc": teachertransactions.row(i).value("Doc")
        };
        k++;
      }
    }

    let transactions = new PrintReport(Banana.document, Banana.document, this.isTest);
    let jsonDoc = transactions.inserttransactions(studenttransactionsArray, teachertransactions, teachertransactionsArray);

    documentChange["data"].push(jsonDoc);

    return documentChange;
  }

  inserttransactions(studenttransactionsArray, teachertransactions, teachertransactionsArray) {

    //row operation
    let row = {};
    //rows
    let rows = [];

    for (let i = 0; i < studenttransactionsArray.length; i++) {

      //row operation for a white row
      row = {};
      row.operation = {};
      row.operation.name = 'add';
      row.style = { "fontSize": 0, "bold": true };
      row.operation.sequence = (studenttransactionsArray[i].position - 1).toString() + '.0';
      row.fields = {};
      rows.push(row);

      //row operation for the exercise number title
      row = {};
      row.operation = {};
      row.operation.name = 'add';
      row.style = { "fontSize": 0, "bold": true };
      row.operation.sequence = (studenttransactionsArray[i].position - 1).toString() + '.0';
      row.fields = {};
      row.fields["Doc"] = studenttransactionsArray[i].doc;
      row.fields["Description"] = "# " + studenttransactionsArray[i].doc;
      rows.push(row);

      for (let k = 0; k < teachertransactionsArray.length; k++) {

        // Skip the same exercise number to write when the exercise is finished
        for (let j = i + 1; j < studenttransactionsArray.length; j++) {
          if (studenttransactionsArray[i].doc === studenttransactionsArray[j].doc) {
            i++;
          }
          else {
            break;
          }
        }

        if (studenttransactionsArray[i].doc === teachertransactionsArray[k].doc) {

          //row operation for adding the exercise transactions from the Teacher file
          row = {};
          row.operation = {};
          row.operation.name = 'add';
          row.style = { "fontSize": 0, "bold": true };
          row.operation.sequence = (studenttransactionsArray[i].position).toString() + '.0';

          //row fields
          row.fields = {};
          row.fields["Date"] = teachertransactions.row(teachertransactionsArray[k].position).value("Date");
          row.fields["Doc"] = teachertransactions.row(teachertransactionsArray[k].position).value("Doc");
          row.fields["Description"] = teachertransactions.row(teachertransactionsArray[k].position).value("Description");
          row.fields["AccountDebit"] = "[" + teachertransactions.row(teachertransactionsArray[k].position).value("AccountDebit") + "]";
          row.fields["AccountCredit"] = "[" + teachertransactions.row(teachertransactionsArray[k].position).value("AccountCredit") + "]";
          row.fields["Amount"] = teachertransactions.row(teachertransactionsArray[k].position).value("Amount");

          rows.push(row);
        }
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
    let jsonDoc = document.initDocument(this.isTest);
    jsonDoc.document.dataUnits.push(dataUnitTransactions);

    return jsonDoc;

  }

  //Functions to write the ac2 file

  getCurrentDate(isTest) {
    if (!isTest) {
      let d = new Date();
      let datestring = d.getFullYear() + ("0" + (d.getMonth() + 1)).slice(-2) + ("0" + d.getDate()).slice(-2);
      return Banana.Converter.toInternalDateFormat(datestring, "yyyymmdd");
    }
    else {
      return "";
    }
  }

  getCurrentTime(isTest) {
    if (!isTest) {
      let d = new Date();
      let timestring = ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
      return Banana.Converter.toInternalTimeFormat(timestring);
    }
    else {
      return "";
    }
  }

  initDocument(isTest) {
    let jsonDoc = {};
    jsonDoc.document = {};
    jsonDoc.document.fileVersion = "1.0.0";
    jsonDoc.document.dataUnits = [];
    jsonDoc.creator = {};
    let currentdate = new PrintReport(this.banDoc1, this.banDoc2, this.isTest);
    jsonDoc.creator.executionDate = currentdate.getCurrentDate(isTest);
    let currenttime = new PrintReport(this.banDoc1, this.banDoc2, this.isTest);
    jsonDoc.creator.executionTime = currenttime.getCurrentTime(isTest);
    jsonDoc.creator.name = Banana.script.getParamValue("id");
    jsonDoc.creator.version = "1.0";
    return jsonDoc;
  }

}