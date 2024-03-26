// @id = ch.banana.app.exercisecorrection
// @api = 1.0
// @pubdate = 2024-03-07
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
        this.banDoc1.addMessage("The initial file doesn't have all the exercise numbers. The exercise numbers must match.");
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
        this.banDoc2.addMessage("The file to be imported doesn't have all the exercise numbers. The exercise numbers must match.");
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
          "date": studenttransactions.row(i).value("Date"),
          "doc": studenttransactions.row(i).value("Doc"),
          "description": studenttransactions.row(i).value("Description"),
          "accountdebit": studenttransactions.row(i).value("AccountDebit"),
          "accountcredit": studenttransactions.row(i).value("AccountCredit"),
          "amount": studenttransactions.row(i).value("Amount"),
          "score": 3,
          "maxscore": 3
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
          "date": teachertransactions.row(i).value("Date"),
          "doc": teachertransactions.row(i).value("Doc"),
          "description": teachertransactions.row(i).value("Description"),
          "accountdebit": teachertransactions.row(i).value("AccountDebit"),
          "accountcredit": teachertransactions.row(i).value("AccountCredit"),
          "amount": teachertransactions.row(i).value("Amount"),
          "maxscore": 3
        };
        k++;
      }
    }

    let transactions = new PrintReport(Banana.document, Banana.document, this.isTest);
    transactions.calculatescore(studenttransactionsArray, teachertransactionsArray);
    let jsonDoc = transactions.inserttransactions(studenttransactionsArray, teachertransactionsArray);

    documentChange["data"].push(jsonDoc);

    return documentChange;
  }

  //Function to calculate the score of the student transactions
  calculatescore(studenttransactionsArray, teachertransactionsArray) {

    for (let i = 0; i < studenttransactionsArray.length; i++) {

      let bestscore = [];
      let n = 0;

      for (let k = 0; k < teachertransactionsArray.length; k++) {

        if (studenttransactionsArray[i].doc === teachertransactionsArray[k].doc) {

          studenttransactionsArray[i].score = 3;
          bestscore[n] = studenttransactionsArray[i].score;

          if (studenttransactionsArray[i].accountdebit !== teachertransactionsArray[k].accountdebit) {
            bestscore[n] = studenttransactionsArray[i].score - 1;
            studenttransactionsArray[i].score = bestscore[n];
          }
          if (studenttransactionsArray[i].accountcredit !== teachertransactionsArray[k].accountcredit) {
            bestscore[n] = studenttransactionsArray[i].score - 1;
            studenttransactionsArray[i].score = bestscore[n];
          }
          if (studenttransactionsArray[i].amount !== teachertransactionsArray[k].amount) {
            bestscore[n] = studenttransactionsArray[i].score - 1;
            studenttransactionsArray[i].score = bestscore[n];
          }
          /*
          if (studenttransactionsArray[i].date !== teachertransactionsArray[k].date) {
            bestscore[n] = studenttransactionsArray[i].score - 1;
            studenttransactionsArray[i].score = bestscore[n];
          }
          */

          n++;

        }
      }

      // find out the higher number in the array bestscore
      studenttransactionsArray[i].score = Math.max(...bestscore);

      // Banana.console.info("Score: " + studenttransactionsArray[i].score + " for the exercise number: " + studenttransactionsArray[i].doc)
    }

    return studenttransactionsArray;
  }

  //Function to write the ac2 file

  inserttransactions(studenttransactionsArray, teachertransactionsArray) {

    //row operation
    let row = {};
    //rows
    let rows = [];


    // Add the columns Score and MaxScore to the transactions if they don't exist

    if (!this.banDoc1.table('Transactions').column('Score') || !this.banDoc1.table('Transactions').column('MaxScore')) {

      //column operation
      let column = {};
      //columns
      let columns = [];

      if (!this.banDoc1.table('Transactions').column('Score')) {
        //column operation
        column = {};
        column.operation = {};
        column.operation.name = 'add';
        //column parameters
        column.nameXml = 'Score';
        column.width = '200';
        column.description = 'Score';
        column.definition = { "type": "number", "decimals": '2' };
        column.operation = { "name": "add" };
        columns.push(column);
      }

      if (!this.banDoc1.table('Transactions').column('MaxScore')) {
        //column operation
        column = {};
        column.operation = {};
        column.operation.name = 'add';
        //column parameters
        column.nameXml = 'MaxScore';
        column.width = '200';
        column.description = 'MaxScore';
        column.definition = { "type": "number", "decimals": '2' };
        column.operation = { "name": "add" };
        columns.push(column);
      }

      //table
      let dataUnitTransactions = {};
      dataUnitTransactions.nameXml = 'Transactions';
      dataUnitTransactions.data = {};

      dataUnitTransactions.data.viewList = {};
      dataUnitTransactions.data.viewList.views = [];
      dataUnitTransactions.data.viewList.views.push({ 'columns': columns });

      //document
      let document = new PrintReport(this.banDoc1, this.banDoc2, this.isTest);
      let jsonDoc = document.initDocument(this.isTest);
      jsonDoc.document.dataUnits.push(dataUnitTransactions);

      return jsonDoc;

    }

    else {

    for (let i = 0; i < studenttransactionsArray.length; i++) {
      // modify row to add the score and the maxscore to the transactions
      row = {};
      row.operation = {};
      row.operation.name = 'modify';
      row.operation.sequence = (studenttransactionsArray[i].position).toString();
      //row fields
      row.fields = {};
      row.fields["Date"] = studenttransactionsArray[i].date;
      row.fields["Doc"] = studenttransactionsArray[i].doc;
      row.fields["Description"] = studenttransactionsArray[i].description;
      row.fields["AccountDebit"] = studenttransactionsArray[i].accountdebit;
      row.fields["AccountCredit"] = studenttransactionsArray[i].accountcredit;
      row.fields["Amount"] = studenttransactionsArray[i].amount;
      row.fields["Score"] = Banana.Converter.toInternalNumberFormat(studenttransactionsArray[i].score);
      row.fields["MaxScore"] = Banana.Converter.toInternalNumberFormat(studenttransactionsArray[i].maxscore);
      rows.push(row);
    }

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
          row.fields["Date"] = teachertransactionsArray[k].date;
          row.fields["Doc"] = teachertransactionsArray[k].doc;
          row.fields["Description"] = teachertransactionsArray[k].description;
          row.fields["AccountDebit"] = "[" + teachertransactionsArray[k].accountdebit + "]";
          row.fields["AccountCredit"] = "[" + teachertransactionsArray[k].accountcredit + "]";
          row.fields["Amount"] = teachertransactionsArray[k].amount;
          rows.push(row);
        }
      }
    }

    // Sum all the scores array
    let score = 0;
    for (let i = 0; i < studenttransactionsArray.length; i++) {
      score += studenttransactionsArray[i].score;
    }

    // Sum all the MaxScore from the Teacher file
    let maxScore = 0;
    for (let i = 0; i < teachertransactionsArray.length; i++) {
      maxScore += teachertransactionsArray[i].maxscore;
    }

    //rows operation for adding the total of the scores at the end of the document

    //row operation for a white row
    row = {};
    row.operation = {};
    row.operation.name = 'add';
    row.style = { "fontSize": 0, "bold": true };
    row.fields = {};
    rows.push(row);

    // row for the total score
    row = {};
    row.operation = {};
    row.operation.name = 'add';
    row.style = { "fontSize": 0, "bold": true };
    //row fields
    row.fields = {};
    row.fields["Description"] = "Total score: ";
    row.fields["Score"] = Banana.Converter.toInternalNumberFormat(score);
    row.fields["MaxScore"] = Banana.Converter.toInternalNumberFormat(maxScore);
    rows.push(row);

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