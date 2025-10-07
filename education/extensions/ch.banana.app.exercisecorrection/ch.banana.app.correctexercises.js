// @id = ch.banana.app.correctexercises
// @api = 1.0
// @pubdate = 2025-07-29
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
 * This class manages the logic and methods for exercise correction.
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
    let FileNumberStudent = this.studentDoc.info("Base", "FileTypeNumber");
    // Save updated script's parameters
    let printsettings = new PrintSettings(this.studentDoc, this.isTest);
    // Load the texts based on the language code
    let texts = printsettings.loadTexts(lang);

    let studenttransactions = this.studentDoc.table("Transactions");
    let teacherfile;
    let teachertransactions;
    let paramcorrections = {};

    if (this.isTest === true) {
      teacherfile = this.teacherDoc;
      paramcorrections = param;
    }

    else {

      let studentrow = this.studentDoc.table("Transactions").findRowByValue("Doc", "Student");
      // if the import file is not a teacher file, show a error message
      if (!studentrow) {
        Banana.application.addMessage(texts.isnotstudentfile);
        return;
      }

      let flag = false;

      for (let i = 0; i < this.studentDoc.table("Transactions").rowCount; i++) {
        if (this.studentDoc.table("Transactions").row(i).value("TAuto") === "automaticcorrection") {
          flag = true;
          continue;
        }
      }

      if (!flag) {

        //Open the file
        teacherfile = Banana.application.openDocument("*.*");
        if (!teacherfile) {
          return;
        }

        // Readscript settings
        paramcorrections = this.result_readsettings(teacherfile);

        let FileNumberTeacher = teacherfile.info("Base", "FileTypeNumber");

        if (FileNumberStudent !== FileNumberTeacher) {
          return Banana.application.addMessage(texts.filenumbermismatch);
        }
        // Verify the settings
        let printsettings = new PrintSettings(this.studentDoc, this.isTest);

        printsettings.verifyparam(paramcorrections);
      }

      else {
        return Banana.application.addMessage(texts.alreadycorrected);
      }

    }

    // this.teacherDoc = teacherfile;
    teachertransactions = teacherfile.table('Transactions');

    let vatcodeflag = false;
    // let vatcodeflag if there is the VatCode column in the Teacher transactions table
    if (teachertransactions.column("VatCode")) {
      vatcodeflag = true;
    }

    let multicurrencyflag = false;
    if (teachertransactions.column("AmountCurrency")) {
      multicurrencyflag = true;
    }

    let teacherrowvalue = this.result_readproperty(teacherfile);

    if (!this.isTest) {

      // if the import file is not a teacher file, show a error message
      if (teacherrowvalue !== "teacherfile") {
        Banana.application.addMessage(texts.isnotteacherfile);
        return;
      }

    }

    let fullscore = 0;

    // Leggo i parametri di correzione
    const {
      datescore,
      amountscore,
      vatcodescore,
      amountcurrencyscore,
      exchangeratescore,
      exchangecurrencyscore,
      debitaccountscore,
      creditaccountscore
    } = paramcorrections;

    // Converto in numeri e applico i flag
    const d = Number(debitaccountscore);
    const c = Number(creditaccountscore);
    const ds = Number(datescore);
    const as = multicurrencyflag ? 0 : Number(amountscore);
    const vs = vatcodeflag ? Number(vatcodescore) : 0;
    const amcs = Number(amountcurrencyscore);
    const ers = Number(exchangeratescore);
    const ecs = Number(exchangecurrencyscore);

    // Somma base
    fullscore = d + c;

    // Aggiungo i valori se sono attivi
    if (ds !== 0) fullscore += ds;
    if (as !== 0) fullscore += as;
    if (vs !== 0) fullscore += vs;
    if (amcs !== 0) fullscore += amcs;
    if (ers !== 0) fullscore += ers;
    if (ecs !== 0) fullscore += ecs;



    if (paramcorrections.score === false) {
      fullscore = 0;
    }

    // Check if the Student file has all the exercise numbers
    this.result_check(studenttransactions, teachertransactions);
    // Check if the Teacher file has accounts present in the Accounts table
    if (!this.result_checkaccounts(teachertransactions)) {
      return;
    }
    // Create the arrays for the transactions
    let teacherarray = this.result_createarrayteacher(teachertransactions, fullscore);
    let teachertransactionsArray = teacherarray[0];
    let docArray = teacherarray[1];
    let studenttransactionsArray = this.result_createarraystudent(studenttransactions, docArray, fullscore);
    // Calculate the score and insert the transactions
    let transactions = new CorrectDoc(this.studentDoc, this.teacherDoc, this.isTest);
    transactions.result_calculatescore(teachertransactions, studenttransactionsArray, teachertransactionsArray, paramcorrections, fullscore);
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

  getNextPositionForDoc(doc) {
    let max = 0;

    const transactions = this.studentDoc.table("Transactions");
    for (let i = 0; i < transactions.rowCount; i++) {
      const row = transactions.row(i);

      if (row.value("Doc") === doc &&
        row.value("TAuto") !== "automaticcorrection" &&
        (row.value("AccountDebit") || row.value("AccountCredit"))) {
        if (i > max) {
          max = i;
        }
      }
    }

    return max + 1;
  }



  result_calculatescore(
    teachertransactions,
    studenttransactionsArray,
    teachertransactionsArray,
    paramcorrections,
    fullscore
  ) {
    this._studenttransactionsArray = studenttransactionsArray;

    // Flag di presenza colonne
    const vatcodeflag = !!teachertransactions.column("VatCode", "Base");
    const multicurrencyflag = !!teachertransactions.column("AmountCurrency", "Base");

    // Helper: sottrae in modo sicuro un numero (stringhe accettate)
    function subNum(fromValue, maybeNumberLike) {
      return fromValue - Number(maybeNumberLike);
    }

    // Precompute: conteggio righe del teacher per doc (O(n))
    const teacherDocCount = {};
    for (let i = 0; i < teachertransactionsArray.length; i++) {
      const doc = teachertransactionsArray[i].doc;
      if (!teacherDocCount[doc]) teacherDocCount[doc] = 0;
      teacherDocCount[doc]++;
    }

    // Precompute: conteggio righe dello studente per doc (O(n))
    const studentDocCount = {};
    for (let i = 0; i < studenttransactionsArray.length; i++) {
      const doc = studenttransactionsArray[i].doc;
      if (!studentDocCount[doc]) studentDocCount[doc] = 0;
      studentDocCount[doc]++;
    }

    const matches = [];

    // Step 1: genera tutte le coppie possibili con stesso Doc
    for (let sIndex = 0; sIndex < studenttransactionsArray.length; sIndex++) {
      const s = studenttransactionsArray[sIndex];

      for (let tIndex = 0; tIndex < teachertransactionsArray.length; tIndex++) {
        const t = teachertransactionsArray[tIndex];

        if (s.doc !== t.doc) continue; // vincolo di Doc

        let score = fullscore;
        const scoreinfo = [];

        // 1) Debit/Credit: gestione distinta e “solo if”, niente ternari
        const sameDebit = (s.accountdebit === t.accountdebit);
        const sameCredit = (s.accountcredit === t.accountcredit);
        const bothSame = (sameDebit && sameCredit);

        if (paramcorrections.debitcreditaccountsscore === false && !bothSame) {
          // penalità per entrambi i conti
          score = subNum(score, paramcorrections.debitaccountscore);
          score = subNum(score, paramcorrections.creditaccountscore);
          scoreinfo.push("Debit and/or Credit Account");
        } else {
          if (!sameDebit && !sameCredit) {
            score = subNum(score, paramcorrections.debitaccountscore);
            score = subNum(score, paramcorrections.creditaccountscore);
            scoreinfo.push("Debit and Credit Account");
          }
          // penalità debit isolata
          if (!sameDebit && sameCredit) {
            if (paramcorrections.debitcreditaccountsscore) {
              score = subNum(score, paramcorrections.debitaccountscore);
            } else {
              score = subNum(score, paramcorrections.debitaccountscore);
              score = subNum(score, paramcorrections.creditaccountscore);
            }
            scoreinfo.push("Debit Account");
          }
          // penalità credit isolata
          if (!sameCredit && sameDebit) {
            if (paramcorrections.debitcreditaccountsscore) {
              score = subNum(score, paramcorrections.creditaccountscore);
            } else {
              score = subNum(score, paramcorrections.debitaccountscore);
              score = subNum(score, paramcorrections.creditaccountscore);
            }
            scoreinfo.push("Credit Account");
          }
        }

        // 2) Date
        if (s.date !== t.date) {
          if (paramcorrections.datescore !== '0') {
            score = subNum(score, paramcorrections.datescore);
            scoreinfo.push("Date");
          }
        }

        // 3) Multicurrency: amountcurrency, exchangecurrency, exchangerate
        if (multicurrencyflag) {
          if (s.amountcurrency !== t.amountcurrency) {
            if (paramcorrections.amountcurrencyscore !== '0') {
              score = subNum(score, paramcorrections.amountcurrencyscore);
              scoreinfo.push("Amount Currency");
            }
          }
          if (s.exchangecurrency !== t.exchangecurrency) {
            if (paramcorrections.exchangecurrencyscore !== '0') {
              score = subNum(score, paramcorrections.exchangecurrencyscore);
              scoreinfo.push("Exchange Currency");
            }
          }
          if (s.exchangerate !== t.exchangerate) {
            if (paramcorrections.exchangeratescore !== '0') {
              score = subNum(score, paramcorrections.exchangeratescore);
              scoreinfo.push("Exchange Rate");
            }
          }
        } else {
          // 4) Amount (solo se NON multicurrency)
          if (s.amount !== t.amount) {
            if (paramcorrections.amountscore !== '0') {
              score = subNum(score, paramcorrections.amountscore);
              scoreinfo.push("Amount");
            }
          }
        }

        // 5) VAT
        if (vatcodeflag) {
          if (s.vatcode !== t.vatcode) {
            if (paramcorrections.vatcodescore !== '0') {
              score = subNum(score, paramcorrections.vatcodescore);
              scoreinfo.push("VAT Code");
            }
          }
        }

        // Priority (1=match, 0=no match)
        const priority = [];

        // 1) accountdebit
        if (s.accountdebit === t.accountdebit) {
          priority.push(1);
        } else {
          priority.push(0);
        }

        // 2) accountcredit
        if (s.accountcredit === t.accountcredit) {
          priority.push(1);
        } else {
          priority.push(0);
        }

        // 3) amount (se multicurrency → amountcurrency, altrimenti amount)
        if (multicurrencyflag) {
          if (s.amountcurrency === t.amountcurrency) {
            priority.push(1);
          } else {
            priority.push(0);
          }
        } else {
          if (s.amount === t.amount) {
            priority.push(1);
          } else {
            priority.push(0);
          }
        }

        // 4) exchangerate (solo se multicurrency attivo)
        if (multicurrencyflag) {
          if (s.exchangerate === t.exchangerate) {
            priority.push(1);
          } else {
            priority.push(0);
          }
        } else {
          priority.push(0);
        }

        // 5) exchangecurrency (solo se multicurrency attivo)
        if (multicurrencyflag) {
          if (s.exchangecurrency === t.exchangecurrency) {
            priority.push(1);
          } else {
            priority.push(0);
          }
        } else {
          priority.push(0);
        }

        // 6) vatcode (solo se flag attivo)
        if (vatcodeflag) {
          if (s.vatcode === t.vatcode) {
            priority.push(1);
          } else {
            priority.push(0);
          }
        } else {
          priority.push(0);
        }

        // 7) date
        if (s.date === t.date) {
          priority.push(1);
        } else {
          priority.push(0);
        }


        // Aggiunge la coppia candidata
        matches.push({
          studentIndex: sIndex,
          teacherIndex: tIndex,
          doc: s.doc,
          score,
          scoreinfo: scoreinfo.join("; "),
          priority
        });
      }
    }

    // Step 2: ordina per score e poi per priority
    matches.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      for (let i = 0; i < a.priority.length; i++) {
        if (b.priority[i] !== a.priority[i]) return b.priority[i] - a.priority[i];
      }
      return 0;
    });

    const matchedStudents = new Set();
    const matchedTeachers = new Set();

    // Conteggio match per doc (lato teacher) ottenuti
    const matchedTeacherByDoc = {};

    // Step 3: scegli le migliori coppie non ancora usate
    for (let i = 0; i < matches.length; i++) {
      const { studentIndex, teacherIndex, doc, score, scoreinfo } = matches[i];

      if (matchedStudents.has(studentIndex)) continue;
      if (matchedTeachers.has(teacherIndex)) continue;

      if (!matchedTeacherByDoc[doc]) matchedTeacherByDoc[doc] = 0;

      const sCount = studentDocCount[doc] || 0;
      const tCount = teacherDocCount[doc] || 0;

      // Se lo studente ha più righe del teacher, limita i match al numero del teacher
      if (sCount > tCount && matchedTeacherByDoc[doc] >= tCount) continue;

      matchedStudents.add(studentIndex);
      matchedTeachers.add(teacherIndex);
      matchedTeacherByDoc[doc]++;

      studenttransactionsArray[studentIndex].automaticscore = score;
      studenttransactionsArray[studentIndex].scoreinfo = scoreinfo ? ("Wrong: " + scoreinfo) : "";
    }

    // Step 3B: righe studente rimaste senza match ⇒ errore
    for (let sIndex = 0; sIndex < studenttransactionsArray.length; sIndex++) {
      if (!matchedStudents.has(sIndex)) {
        studenttransactionsArray[sIndex].automaticscore = 0;
        studenttransactionsArray[sIndex].scoreinfo = "Extra or unmatched transaction from student";
      }
    }

    // Step 4: se il teacher ha più righe senza nessun possibile match ⇒ aggiungi errori allo studente
    for (let tIndex = 0; tIndex < teachertransactionsArray.length; tIndex++) {
      const t = teachertransactionsArray[tIndex];

      // “possibile match” = esiste almeno una candidate pair per quel teacherIndex
      let hasMatch = false;
      for (let i = 0; i < matches.length; i++) {
        if (matches[i].teacherIndex === tIndex) {
          hasMatch = true;
          break;
        }
      }

      const wasMatched = matchedTeachers.has(tIndex);

      if (!wasMatched && !hasMatch) {
        const newEntry = {
          auto: "automaticcorrection",
          position: this.getNextPositionForDoc(t.doc),
          date: t.date,
          doc: t.doc,
          description: t.description,
          accountdebit: t.accountdebit,
          accountcredit: t.accountcredit,
          amountcurrency: t.amountcurrency,
          exchangecurrency: t.exchangecurrency,
          exchangerate: t.exchangerate,
          vatcode: t.vatcode,
          automaticscore: 0,
          maxscore: fullscore,
          scoreinfo: "Missing transaction for teacher row"
        };

        const FileNumber = this.studentDoc.info("Base", "FileTypeNumber");

        if (FileNumber === "110" || FileNumber === "100") {
          newEntry.amount = t.amount;
        }
        if (FileNumber === "110") {
          delete newEntry.amountcurrency;
          delete newEntry.exchangecurrency;
          delete newEntry.exchangerate;
        }
        if (FileNumber === "120") {
          delete newEntry.amount;
          delete newEntry.vatcode;
        }

        studenttransactionsArray.push(newEntry);
      }
    }

    return studenttransactionsArray;
  }


  //Function to write the ac2 file
  result_inserttransactions(studenttransactionsArray, teachertransactionsArray, paramcorrections, fullscore) {

    let FileNumber = this.studentDoc.info("Base", "FileTypeNumber");

    let documentChange = { "format": "documentChange", "error": "", "data": [] };

    let jsonDocRows = initDocument(this.isTest);

    //row operation
    let row = {};
    //rows
    let rows = [];

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
        row.fields["TCorrectionsNotes"] = "";
      }

      if (FileNumber === "130") {
        row.fields["Date"] = studenttransactionsArray[i].date;
        row.fields["Doc"] = studenttransactionsArray[i].doc;
        row.fields["Description"] = studenttransactionsArray[i].description;
        row.fields["AccountDebit"] = studenttransactionsArray[i].accountdebit;
        row.fields["AccountCredit"] = studenttransactionsArray[i].accountcredit;
        row.fields["AmountCurrency"] = studenttransactionsArray[i].amountcurrency;
        row.fields["ExchangeCurrency"] = studenttransactionsArray[i].exchangecurrency;
        row.fields["ExchangeRate"] = studenttransactionsArray[i].exchangerate;
        row.fields["VatCode"] = studenttransactionsArray[i].vatcode;
        if (paramcorrections.score) {
          row.fields["TAutoScore"] = Banana.Converter.toInternalNumberFormat(studenttransactionsArray[i].automaticscore);
          row.fields["TMaxScore"] = Banana.Converter.toInternalNumberFormat(studenttransactionsArray[i].maxscore);
          row.fields["TAdjustedScore"] = Banana.Converter.toInternalNumberFormat(studenttransactionsArray[i].automaticscore);
        }
        row.fields["TCorrectionsNotes"] = row.fields["TCorrectionsNotes"] + studenttransactionsArray[i].scoreinfo;
      }
      else if (FileNumber === "110") {
        row.fields["Date"] = studenttransactionsArray[i].date;
        row.fields["Doc"] = studenttransactionsArray[i].doc;
        row.fields["Description"] = studenttransactionsArray[i].description;
        row.fields["AccountDebit"] = studenttransactionsArray[i].accountdebit;
        row.fields["AccountCredit"] = studenttransactionsArray[i].accountcredit;
        row.fields["Amount"] = studenttransactionsArray[i].amount;
        row.fields["VatCode"] = studenttransactionsArray[i].vatcode;
        if (paramcorrections.score) {
          row.fields["TAutoScore"] = Banana.Converter.toInternalNumberFormat(studenttransactionsArray[i].automaticscore);
          row.fields["TMaxScore"] = Banana.Converter.toInternalNumberFormat(studenttransactionsArray[i].maxscore);
          row.fields["TAdjustedScore"] = Banana.Converter.toInternalNumberFormat(studenttransactionsArray[i].automaticscore);
        }
        row.fields["TCorrectionsNotes"] = row.fields["TCorrectionsNotes"] + studenttransactionsArray[i].scoreinfo;
      }
      else if (FileNumber === "120") {
        row.fields["Date"] = studenttransactionsArray[i].date;
        row.fields["Doc"] = studenttransactionsArray[i].doc;
        row.fields["Description"] = studenttransactionsArray[i].description;
        row.fields["AccountDebit"] = studenttransactionsArray[i].accountdebit;
        row.fields["AccountCredit"] = studenttransactionsArray[i].accountcredit;
        row.fields["AmountCurrency"] = studenttransactionsArray[i].amountcurrency;
        row.fields["ExchangeCurrency"] = studenttransactionsArray[i].exchangecurrency;
        row.fields["ExchangeRate"] = studenttransactionsArray[i].exchangerate;
        if (paramcorrections.score) {
          row.fields["TAutoScore"] = Banana.Converter.toInternalNumberFormat(studenttransactionsArray[i].automaticscore);
          row.fields["TMaxScore"] = Banana.Converter.toInternalNumberFormat(studenttransactionsArray[i].maxscore);
          row.fields["TAdjustedScore"] = Banana.Converter.toInternalNumberFormat(studenttransactionsArray[i].automaticscore);
        }
        row.fields["TCorrectionsNotes"] = row.fields["TCorrectionsNotes"] + studenttransactionsArray[i].scoreinfo;
      }
      else {
        row.fields["Date"] = studenttransactionsArray[i].date;
        row.fields["Doc"] = studenttransactionsArray[i].doc;
        row.fields["Description"] = studenttransactionsArray[i].description;
        row.fields["AccountDebit"] = studenttransactionsArray[i].accountdebit;
        row.fields["AccountCredit"] = studenttransactionsArray[i].accountcredit;
        row.fields["Amount"] = studenttransactionsArray[i].amount;
        if (paramcorrections.score) {
          row.fields["TAutoScore"] = Banana.Converter.toInternalNumberFormat(studenttransactionsArray[i].automaticscore);
          row.fields["TMaxScore"] = Banana.Converter.toInternalNumberFormat(studenttransactionsArray[i].maxscore);
          row.fields["TAdjustedScore"] = Banana.Converter.toInternalNumberFormat(studenttransactionsArray[i].automaticscore);
        }
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
          if (FileNumber === "130") {
            row.fields["Date"] = teachertransactionsArray[k].date;
            row.fields["TAuto"] = "automaticcorrection";
            row.fields["Doc"] = teachertransactionsArray[k].doc;
            row.fields["Description"] = teachertransactionsArray[k].description;
            row.fields["AccountDebit"] = "[" + teachertransactionsArray[k].accountdebit + "]";
            row.fields["AccountCredit"] = "[" + teachertransactionsArray[k].accountcredit + "]";
            row.fields["AmountCurrency"] = teachertransactionsArray[k].amountcurrency;
            row.fields["ExchangeCurrency"] = teachertransactionsArray[k].exchangecurrency;
            row.fields["ExchangeRate"] = teachertransactionsArray[k].exchangerate;
            row.fields["VatCode"] = "[" + teachertransactionsArray[k].vatcode + "]";
          }
          else if (FileNumber === "110") {
            row.fields["Date"] = teachertransactionsArray[k].date;
            row.fields["TAuto"] = "automaticcorrection";
            row.fields["Doc"] = teachertransactionsArray[k].doc;
            row.fields["Description"] = teachertransactionsArray[k].description;
            row.fields["AccountDebit"] = "[" + teachertransactionsArray[k].accountdebit + "]";
            row.fields["AccountCredit"] = "[" + teachertransactionsArray[k].accountcredit + "]";
            row.fields["Amount"] = teachertransactionsArray[k].amount;
            row.fields["VatCode"] = "[" + teachertransactionsArray[k].vatcode + "]";
          }
          else if (FileNumber === "120") {
            row.fields["Date"] = teachertransactionsArray[k].date;
            row.fields["TAuto"] = "automaticcorrection";
            row.fields["Doc"] = teachertransactionsArray[k].doc;
            row.fields["Description"] = teachertransactionsArray[k].description;
            row.fields["AccountDebit"] = "[" + teachertransactionsArray[k].accountdebit + "]";
            row.fields["AccountCredit"] = "[" + teachertransactionsArray[k].accountcredit + "]";
            row.fields["AmountCurrency"] = teachertransactionsArray[k].amountcurrency;
            row.fields["ExchangeCurrency"] = teachertransactionsArray[k].exchangecurrency;
            row.fields["ExchangeRate"] = teachertransactionsArray[k].exchangerate;
          }
          else {
            row.fields["Date"] = teachertransactionsArray[k].date;
            row.fields["TAuto"] = "automaticcorrection";
            row.fields["Doc"] = teachertransactionsArray[k].doc;
            row.fields["Description"] = teachertransactionsArray[k].description;
            row.fields["AccountDebit"] = "[" + teachertransactionsArray[k].accountdebit + "]";
            row.fields["AccountCredit"] = "[" + teachertransactionsArray[k].accountcredit + "]";
            row.fields["Amount"] = teachertransactionsArray[k].amount;
          }
          rows.push(row);
        }
      }
    }


    if (paramcorrections.score) {
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
    let FileNumber = this.studentDoc.info("Base", "FileTypeNumber");

    // Filter the Teacher transactions rows if they have a Doc and AccountDebit or AccountCredit
    for (let i = 0; i < teachertransactions.rowCount; i++) {
      if (teachertransactions.row(i).value("Doc") !== "" && teachertransactions.row(i).value("Doc") !== "#" && (teachertransactions.row(i).value("AccountDebit") != "" || teachertransactions.row(i).value("AccountCredit") != "")) {

        if (FileNumber === "130") {
          teachertransactionsArray[k] = {
            "position": i,
            "date": teachertransactions.row(i).value("Date"),
            "doc": teachertransactions.row(i).value("Doc"),
            "description": teachertransactions.row(i).value("Description"),
            "accountdebit": teachertransactions.row(i).value("AccountDebit"),
            "accountcredit": teachertransactions.row(i).value("AccountCredit"),
            "amountcurrency": teachertransactions.row(i).value("AmountCurrency"),
            "exchangecurrency": teachertransactions.row(i).value("ExchangeCurrency"),
            "exchangerate": Number(teachertransactions.row(i).value("ExchangeRate")).toFixed(12),
            "amount": teachertransactions.row(i).value("Amount"),
            "vatcode": teachertransactions.row(i).value("VatCode"),
            "maxscore": fullscore
          };

        }
        else if (FileNumber === "110") {
          teachertransactionsArray[k] = {
            "position": i,
            "date": teachertransactions.row(i).value("Date"),
            "doc": teachertransactions.row(i).value("Doc"),
            "description": teachertransactions.row(i).value("Description"),
            "accountdebit": teachertransactions.row(i).value("AccountDebit"),
            "accountcredit": teachertransactions.row(i).value("AccountCredit"),
            "amount": teachertransactions.row(i).value("Amount"),
            "vatcode": teachertransactions.row(i).value("VatCode"),
            "maxscore": fullscore
          };
        }
        else if (FileNumber === "120") {
          teachertransactionsArray[k] = {
            "position": i,
            "date": teachertransactions.row(i).value("Date"),
            "doc": teachertransactions.row(i).value("Doc"),
            "description": teachertransactions.row(i).value("Description"),
            "accountdebit": teachertransactions.row(i).value("AccountDebit"),
            "accountcredit": teachertransactions.row(i).value("AccountCredit"),
            "amountcurrency": teachertransactions.row(i).value("AmountCurrency"),
            "exchangecurrency": teachertransactions.row(i).value("ExchangeCurrency"),
            "exchangerate": Number(teachertransactions.row(i).value("ExchangeRate")).toFixed(12),
            "amount": teachertransactions.row(i).value("Amount"),
            "maxscore": fullscore
          };
        }
        else {
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
        }

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
    let FileNumber = this.studentDoc.info("Base", "FileTypeNumber");

    for (let i = 0; i < studenttransactions.rowCount; i++) {
      const doc = studenttransactions.row(i).value("Doc");

      if (!docArray.includes(doc)) continue; // Considera solo Doc presenti nel docente
      if (doc === "" || doc === "#") continue;

      let entry = {
        "position": i,
        "date": studenttransactions.row(i).value("Date"),
        "doc": doc,
        "description": studenttransactions.row(i).value("Description"),
        "accountdebit": studenttransactions.row(i).value("AccountDebit"),
        "accountcredit": studenttransactions.row(i).value("AccountCredit"),
        "automaticscore": fullscore,
        "maxscore": fullscore,
        "CorrectionsNotes": ""
      };

      if (FileNumber === "130" || FileNumber === "120") {
        entry.amountcurrency = studenttransactions.row(i).value("AmountCurrency");
        entry.exchangecurrency = studenttransactions.row(i).value("ExchangeCurrency");
        entry.exchangerate = Number(studenttransactions.row(i).value("ExchangeRate")).toFixed(12);
      }

      if (FileNumber === "110" || FileNumber === "130" || FileNumber === "100") {
        entry.amount = studenttransactions.row(i).value("Amount");
      }

      if (FileNumber === "110" || FileNumber === "130") {
        entry.vatcode = studenttransactions.row(i).value("VatCode");
      }

      studenttransactionsArray[k++] = entry;
    }

    return studenttransactionsArray;
  }


  result_checkaccounts(teachertransactions) {
    // Check if the Teacher transactions table has the correct accounts present in the Accounts table
    let accounts = this.teacherDoc.table("Accounts");
    let accountsArray = [];
    for (let i = 0; i < accounts.rowCount; i++) {
      accountsArray.push(accounts.row(i).value("Account"));
    }
    for (let i = 0; i < teachertransactions.rowCount; i++) {
      if (!accountsArray.includes(teachertransactions.row(i).value("AccountDebit"))) {
        this.teacherDoc.addMessage("The account " + teachertransactions.row(i).value("AccountDebit") + " is not present in the Accounts table of the Teacher File.");
        return false;
      }
      if (!accountsArray.includes(teachertransactions.row(i).value("AccountCredit"))) {
        this.teacherDoc.addMessage("The account " + teachertransactions.row(i).value("AccountCredit") + " is not present in the Accounts table of the Teacher File.");
        return false;
      }
    }
    return true;
  }

}
