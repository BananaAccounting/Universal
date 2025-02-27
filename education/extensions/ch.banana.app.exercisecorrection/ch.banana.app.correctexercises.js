// @id = ch.banana.app.correctexercises
// @api = 1.0
// @pubdate = 2025-02-26
// @publisher = Banana.ch SA
// @description = 1. Correct the exercises
// @description.it = 1. Correggi gli esercizi
// @description.de = 1. Korrigieren Sie die Übungen
// @description.fr = 1. Corriger les exercices
// @description.en = 1. Correct the exercises
// @doctype = 100
// @docproperties =
// @task = app.command
// @timeout = -1
// @includejs = ch.banana.app.functions.js
// @includejs = ch.banana.app.settings.js


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

  let printreport = new CorrectDoc(Banana.document, Banana.document, false);

  return printreport.result();
}

/**
 * Questa classe gestisce la logica ed i metodi per la creazione del report 
 * @param {*} banDocument 
 */

var CorrectDoc = class CorrectDoc {
  constructor(banDocument1, banDocument2, isTest) {
    this.studentDoc = banDocument1;
    this.teacherDoc = banDocument2;
    this.isTest = isTest;
  }

  result(param) {

    let lang = this.studentDoc.info("Base", "Language");

    let printsettings = new PrintSettings(this.studentDoc, this.isTest);
    // Load the texts based on the language code
    let texts = printsettings.loadTexts(lang);
    
    let studenttransactions = this.studentDoc.table("Transactions");
    let teacherfile;
    let teachertransactions;
    let paramcorrections = {};

    if (this.isTest) {
      teacherfile = this.teacherDoc;
      paramcorrections = param;
    }

    else {

      let studentrow = this.studentDoc.table("Transactions").findRowByValue("Doc", "Student");
      // if the import file is not a teacher file, show a error message
      if (studentrow === "undefined" || !studentrow) {
        Banana.application.addMessage(texts.isnotstudentfile);
        return;
      }

      //Open the file
      teacherfile = Banana.application.openDocument("*.*");
      if (!teacherfile) {
        return;
      }
      // Readscript settings
      paramcorrections = this.result_readsettings(teacherfile);

      // Verify the settings
      let printsettings = new PrintSettings(Banana.document, false);

      printsettings.verifyparam(paramcorrections);

    }

    // this.teacherDoc = teacherfile;
    teachertransactions = teacherfile.table('Transactions');

    let teacherrowvalue = this.result_readproperty(teacherfile);

    if (!this.isTest) {

      // if the import file is not a teacher file, show a error message
      if (teacherrowvalue !== "teacherfile") {
        Banana.application.addMessage(texts.isnotteacherfile);
        return;
      }

    }

    let fullscore = 0;

    if (paramcorrections.datescore !== '0' && paramcorrections.amountscore !== '0') {
      fullscore = Number(paramcorrections.debitaccountscore) + Number(paramcorrections.creditaccountscore) + Number(paramcorrections.amountscore) + Number(paramcorrections.datescore);
    }
    else if (paramcorrections.datescore !== '0' && paramcorrections.amountscore === '0') {
      fullscore = Number(paramcorrections.debitaccountscore) + Number(paramcorrections.creditaccountscore) + Number(paramcorrections.datescore);
    }
    else if (paramcorrections.datescore === '0' && paramcorrections.amountscore !== '0') {
      fullscore = Number(paramcorrections.debitaccountscore) + Number(paramcorrections.creditaccountscore) + Number(paramcorrections.amountscore);
    }
    else {
      fullscore = Number(paramcorrections.debitaccountscore) + Number(paramcorrections.creditaccountscore);
    }

    // Check if the Student file has all the exercise numbers
    this.result_check(studenttransactions, teachertransactions);
    let teacherarray = this.result_createarrayteacher(teachertransactions, fullscore);
    let teachertransactionsArray = teacherarray[0];
    let docArray = teacherarray[1];
    let studenttransactionsArray = this.result_createarraystudent(studenttransactions, docArray, fullscore);
    let transactions = new CorrectDoc(this.studentDoc, this.teacherDoc, this.isTest);
    transactions.result_calculatescore(studenttransactionsArray, teachertransactionsArray, paramcorrections, fullscore);
    let jsonDoc = transactions.result_inserttransactions(studenttransactionsArray, teachertransactionsArray, paramcorrections, fullscore);

    return jsonDoc;
  }

  result_readsettings(teacherfile) {

    let paramcorrections = {};

    // Read the settings
    let strData = teacherfile.getScriptSettings("paramcorrections");

    if (strData.length > 0) {
      var objData = JSON.parse(strData);
      if (objData) {
        paramcorrections = objData;
      }
    }
    return paramcorrections;
  }

  result_readproperty(teacherfile) {

    let teacherrow = teacherfile.table("Transactions").findRowByValue("Doc", "#")
    if (!teacherrow) {
      return;
    }
    let teacherrowvalue = teacherrow.value("Description");

    return teacherrowvalue;

  }

  result_calculatescore(studenttransactionsArray, teachertransactionsArray, paramcorrections, fullscore) {

    for (let i = 0; i < studenttransactionsArray.length; i++) {

      let n = 0;
      let bestscore = [];
      let textscore = [];

      for (let k = 0; k < teachertransactionsArray.length; k++) {

        if (studenttransactionsArray[i].doc !== teachertransactionsArray[k].doc) {
          studenttransactionsArray[i].automaticscore = fullscore;
          studenttransactionsArray[i].scoreinfo = "Exercise rows number doesn't match";
          continue;
        }

        else {
          studenttransactionsArray[i].automaticscore = fullscore;
          bestscore[n] = fullscore;
          textscore[n] = { "debit": "", "credit": "", "amount": "", "date": "" };

          if (paramcorrections.debitcreditaccountsscore === false && (studenttransactionsArray[i].accountdebit !== teachertransactionsArray[k].accountdebit || studenttransactionsArray[i].accountcredit !== teachertransactionsArray[k].accountcredit)) {
            bestscore[n] = Number(bestscore[n]) - Number(paramcorrections.debitaccountscore) - Number(paramcorrections.creditaccountscore);
            studenttransactionsArray[i].automaticscore = bestscore[n];
            textscore[n].debit = "Debit and/or Credit Account; ";
          }
          else {

            if (studenttransactionsArray[i].accountdebit !== teachertransactionsArray[k].accountdebit) {
              if (paramcorrections.debitcreditaccountsscore) {
                bestscore[n] = Number(bestscore[n]) - Number(paramcorrections.debitaccountscore);
              }
              else {
                bestscore[n] = Number(bestscore[n]) - Number(paramcorrections.debitaccountscore) - Number(paramcorrections.creditaccountscore);
              }
              studenttransactionsArray[i].automaticscore = bestscore[n];
              textscore[n].debit = "Debit Account; ";
            }
            if (studenttransactionsArray[i].accountcredit !== teachertransactionsArray[k].accountcredit) {
              if (paramcorrections.debitcreditaccountsscore) {
                bestscore[n] = Number(bestscore[n]) - Number(paramcorrections.creditaccountscore);
              }
              else {
                bestscore[n] = Number(bestscore[n]) - Number(paramcorrections.debitaccountscore) - Number(paramcorrections.creditaccountscore);
              }
              studenttransactionsArray[i].automaticscore = bestscore[n];
              textscore[n].credit = "Credit Account; ";
            }
          }
          if (studenttransactionsArray[i].amount !== teachertransactionsArray[k].amount && paramcorrections.amountscore !== '0') {
            bestscore[n] = Number(bestscore[n]) - Number(paramcorrections.amountscore);
            studenttransactionsArray[i].automaticscore = bestscore[n];
            textscore[n].amount = "Amount; ";
          }
          if (studenttransactionsArray[i].date !== teachertransactionsArray[k].date && paramcorrections.datescore !== '0') {
            bestscore[n] = Number(bestscore[n]) - Number(paramcorrections.datescore);
            studenttransactionsArray[i].automaticscore = bestscore[n];
            textscore[n].date = "Date; ";
          }
          n++;
        }

      }
      // find out the higher number in the array bestscore
      studenttransactionsArray[i].automaticscore = Math.max(...bestscore);
      // find out first n index of the minimum number in the array bestscore
      let index = bestscore.indexOf(Math.max(...bestscore));
      // Concatenate the textscore[index] to the scoreinfo and trim the string
      studenttransactionsArray[i].scoreinfo = textscore[index].debit + textscore[index].credit + textscore[index].amount + textscore[index].date;
      studenttransactionsArray[i].scoreinfo = studenttransactionsArray[i].scoreinfo.trim();
    }

    return studenttransactionsArray;
  }

  //Function to write the ac2 file
  result_inserttransactions(studenttransactionsArray, teachertransactionsArray, paramcorrections, fullscore) {

    let documentChange = { "format": "documentChange", "error": "", "data": [] };

    let jsonDocRows = initDocument(this.isTest);

    //row operation
    let row = {};
    //rows
    let rows = [];

    for (let i = 0; i < this.studentDoc.table("Transactions").rowCount; i++) {
      if (this.studentDoc.table("Transactions").row(i).value("TAuto") === "automaticcorrection") {
        return;
      }
    }

    for (let i = 0; i < studenttransactionsArray.length; i++) {
      // modify row to add the score and the maxscore to the transactions
      row = {};
      row.operation = {};
      row.operation.name = 'modify';
      row.operation.sequence = (studenttransactionsArray[i].position).toString();

      //row fields
      row.fields = {};

      // row style
      row.style = {};
      if (studenttransactionsArray[i].automaticscore === fullscore) {
        // green
        row.style = { "background-color": "#afffaf" };
        row.fields["TCorrectionsNotes"] = "";
      }
      else {
        // red
        row.style = { "background-color": "#ff8198" };
        if (!paramcorrections.noscore) {
          row.fields["TCorrectionsNotes"] = "Wrong: ";
        }
      }

      row.fields["Date"] = studenttransactionsArray[i].date;
      row.fields["Doc"] = studenttransactionsArray[i].doc;
      row.fields["Description"] = studenttransactionsArray[i].description;
      row.fields["AccountDebit"] = studenttransactionsArray[i].accountdebit;
      row.fields["AccountCredit"] = studenttransactionsArray[i].accountcredit;
      row.fields["Amount"] = studenttransactionsArray[i].amount;
      if (!paramcorrections.noscore) {
        row.fields["TAutoScore"] = Banana.Converter.toInternalNumberFormat(studenttransactionsArray[i].automaticscore);
        row.fields["TMaxScore"] = Banana.Converter.toInternalNumberFormat(studenttransactionsArray[i].maxscore);
        row.fields["TAdjustedScore"] = Banana.Converter.toInternalNumberFormat(studenttransactionsArray[i].automaticscore);
        row.fields["TCorrectionsNotes"] = row.fields["TCorrectionsNotes"] + studenttransactionsArray[i].scoreinfo;
      }
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
      row.fields["TAuto"] = "automaticcorrection";
      rows.push(row);

      //row operation for the exercise number title
      row = {};
      row.operation = {};
      row.operation.name = 'add';
      row.style = { "fontSize": 0, "bold": true };
      row.operation.sequence = (studenttransactionsArray[i].position - 1).toString() + '.0';
      row.fields = {};
      row.fields["TAuto"] = "automaticcorrection";
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
          row.fields["TAuto"] = "automaticcorrection";
          row.fields["Doc"] = teachertransactionsArray[k].doc;
          row.fields["Description"] = teachertransactionsArray[k].description;
          row.fields["AccountDebit"] = "[" + teachertransactionsArray[k].accountdebit + "]";
          row.fields["AccountCredit"] = "[" + teachertransactionsArray[k].accountcredit + "]";
          row.fields["Amount"] = teachertransactionsArray[k].amount;
          rows.push(row);
        }
      }
    }

    if (!paramcorrections.noscore) {
      // Sum all the scores array
      let score = 0;
      for (let i = 0; i < studenttransactionsArray.length; i++) {
        score += studenttransactionsArray[i].automaticscore;
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
      row.fields["TAuto"] = "automaticcorrection";
      rows.push(row);

      // row for the total score
      row = {};
      row.operation = {};
      row.operation.name = 'add';
      row.style = { "fontSize": 0, "bold": true };
      //row fields
      row.fields = {};
      row.fields["TAuto"] = "automaticcorrection";
      row.fields["Description"] = "Total score: ";
      row.fields["TAutoScore"] = Banana.Converter.toInternalNumberFormat(score);
      row.fields["TAdjustedScore"] = Banana.Converter.toInternalNumberFormat(score);
      row.fields["TMaxScore"] = Banana.Converter.toInternalNumberFormat(maxScore);
      rows.push(row);
    }

    //table for the operations
    let dataUnitTransactions = {};
    dataUnitTransactions.nameXml = 'Transactions';

    //data for rows
    dataUnitTransactions.data = {};
    dataUnitTransactions.data.rowLists = [];
    dataUnitTransactions.data.rowLists.push({ 'rows': rows });
    jsonDocRows.document.dataUnits.push(dataUnitTransactions);
    documentChange["data"].push(jsonDocRows);

    return documentChange;
  }

  result_check(studenttransactions, teachertransactions) {

    // Check if the Student file has all the exercise numbers
    for (let i = 0; i < studenttransactions.rowCount; i++) {
      if (studenttransactions.row(i).value("Doc") === "" && (studenttransactions.row(i).value("AccountDebit") != "" || studenttransactions.row(i).value("AccountCredit") != "" || (studenttransactions.row(i).value("AccountDebit") != "" && studenttransactions.row(i).value("AccountCredit") != ""))) {
        this.studentDoc.addMessage("The initial file doesn't have all the exercise numbers. The exercise numbers must match.");
        return;
      }
    }

    // Check if the Teacher file has all the exercise numbers
    for (let i = 0; i < teachertransactions.rowCount; i++) {
      if (teachertransactions.row(i).value("Doc") === "" && (teachertransactions.row(i).value("AccountDebit") != "" || teachertransactions.row(i).value("AccountCredit") != "")) {
        this.teacherDoc.addMessage("The file to be imported doesn't have all the exercise numbers. The exercise numbers must match.");
        return;
      }
    }
  }

  result_createarrayteacher(teachertransactions, fullscore) {

    let teachertransactionsArray = [];
    let docArray = [];
    let k = 0;
    let j = 0;
    let n;

    // Filter the Teacher transactions rows if they have a Doc and AccountDebit or AccountCredit
    for (let i = 0; i < teachertransactions.rowCount; i++) {
      if (teachertransactions.row(i).value("Doc") !== "" && teachertransactions.row(i).value("Doc") !== "#" && (teachertransactions.row(i).value("AccountDebit") != "" || teachertransactions.row(i).value("AccountCredit") != "")) {
        teachertransactionsArray[k] = {
          "position": i,
          "date": teachertransactions.row(i).value("Date"),
          "doc": teachertransactions.row(i).value("Doc"),
          "description": teachertransactions.row(i).value("Description"),
          "accountdebit": teachertransactions.row(i).value("AccountDebit"),
          "accountcredit": teachertransactions.row(i).value("AccountCredit"),
          "amount": teachertransactions.row(i).value("Amount"),
          "maxscore": fullscore
        };

        // Manage the max rows allowed for each exercise number
        n = i + 1;
        if (n >= teachertransactions.rowCount) {
          docArray[j] = teachertransactionsArray[k].doc;
          break;
        }
        else if (n < teachertransactions.rowCount && teachertransactionsArray[k].doc === teachertransactions.row(n).value("Doc")) {
          docArray[j] = teachertransactionsArray[k].doc;
        }
        else {
          docArray[j] = teachertransactionsArray[k].doc;
        }
        // End of the management of the max rows allowed for each exercise number
        j++;
        k++;
      }
    }
    return [teachertransactionsArray, docArray];
  }

  result_createarraystudent(studenttransactions, docArray, fullscore) {

    let studenttransactionsArray = [];
    let k = 0;
    let j = 0;

    for (let i = 0; i < studenttransactions.rowCount; i++) {
      if (studenttransactions.row(i).value("Doc") === docArray[j] && j < docArray.length) {
        studenttransactionsArray[k] = {
          "position": i,
          "date": studenttransactions.row(i).value("Date"),
          "doc": studenttransactions.row(i).value("Doc"),
          "description": studenttransactions.row(i).value("Description"),
          "accountdebit": studenttransactions.row(i).value("AccountDebit"),
          "accountcredit": studenttransactions.row(i).value("AccountCredit"),
          "amount": studenttransactions.row(i).value("Amount"),
          "automaticscore": fullscore,
          "maxscore": fullscore,
          "CorrectionsNotes": ""
        };
        k++;
        j++;
      }
    }
    return studenttransactionsArray;
  }

}