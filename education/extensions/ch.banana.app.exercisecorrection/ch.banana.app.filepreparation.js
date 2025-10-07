// @id = ch.banana.app.filepreparation
// @api = 1.0
// @pubdate = 2025-02-26
// @publisher = Banana.ch SA
// @description = 0. File Preparation
// @description.it = 0. Preparazione file
// @description.de = 0. Datei vorbereiten
// @description.fr = 0. Préparation du fichier
// @description.en = 0. File Preparation
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

  let createdoc = new CreateDoc(Banana.document, false);
  let doc = createdoc.result();

  return doc;
}

/**
 * This class handles the logic and methods required to generate reports.
 * @param {*} banDocument 
 */

var CreateDoc = class CreateDoc {
  constructor(banDocument, isTest) {
    this.banDoc = banDocument;
    this.isTest = isTest;
  }

  result() {

    let lang = this.banDoc.info("Base", "Language");

    let printsettings = new PrintSettings(this.banDoc, this.isTest);

    // Load the texts based on the language code
    let texts = printsettings.loadTexts(lang);

    let documentChange = { "format": "documentChange", "error": "", "data": [] };

    let jsonDocColumns = initDocument(this.isTest);
    let jsonDocRows = initDocument(this.isTest);

    //column operation
    let column = {};
    // row operation
    let row = {};
    //columns
    let columns = [];
    // rows
    let rows = [];
    let rowDocteacher = false;
    let rowDocstudent = false;
    let rowData = '';
    let rowDescription = '';
    let filetype = '';

    // Ask to the user if he wants to add the rows for the teacher or student

    if (this.isTest) {
      // For testing purposes, we can simulate the user input
      filetype = texts.teacher; // Simulating teacher selection
    } else {
      filetype = Banana.Ui.getItem(texts.preparefile, texts.choosefile, [texts.teacher, texts.student]);
    }
    if (filetype === texts.teacher) {

      for (let i = 0; i < this.banDoc.table('Transactions').rowCount; i++) {
        rowData = this.banDoc.table('Transactions').row(i).value('Doc');
        rowDescription = this.banDoc.table('Transactions').row(i).value('Description');
        if (rowData === '#' && rowDescription === 'teacherfile') {
          rowDocteacher = true;
          break;
        }
      }

      for (let i = 0; i < this.banDoc.table('Transactions').rowCount; i++) {
        rowData = this.banDoc.table('Transactions').row(i).value('Doc');
        if (rowData === 'Student') {
          rowDocstudent = true;
          break;
        }
      }

      if (!rowDocteacher && !rowDocstudent) {
        row = {};
        row.operation = {};
        row.operation.name = 'add';
        row.operation.sequence = '-1';
        row.style = { "color": "#FFFFFF", "background-color": "#0055ff", "bold": true };
        row.fields = {};
        row.fields['Doc'] = '#';
        row.fields['Description'] = 'teacherfile';
        //row parameters
        rows.push(row);
      }

    } else {
      for (let i = 0; i < this.banDoc.table('Transactions').rowCount; i++) {
        rowData = this.banDoc.table('Transactions').row(i).value('Doc');
        rowDescription = this.banDoc.table('Transactions').row(i).value('Description');
        if (rowData === '#' && rowDescription === 'teacherfile') {
          rowDocteacher = true;
          break;
        }
      }

      for (let i = 0; i < this.banDoc.table('Transactions').rowCount; i++) {
        rowData = this.banDoc.table('Transactions').row(i).value('Doc');
        if (rowData === 'Student') {
          rowDocstudent = true;
          break;
        }
      }

      if (!rowDocteacher && !rowDocstudent) {
        row = {};
        row.operation = {};
        row.operation.name = 'add';
        row.style = { "color": "#FFFFFF", "background-color": "#0055ff", "bold": true };
        row.operation.sequence = '-1';
        row.fields = {};
        row.fields['Doc'] = 'Student';
        row.fields['Description'] = 'Student Name-Family Name';
        rows.push(row);
      }
    }

    if (!this.banDoc.table('Transactions').column('TAuto')) {
      //column operation
      column = {};
      //column parameters
      column.name = texts.auto;
      column.nameXml = 'TAuto';
      column.width = '200';
      column.description = texts.auto;
      column.header1 = texts.auto;
      column.definition = { "type": "text" };
      column.operation = { "name": "add", "sequence": '0' };
      columns.push(column);
    }

    if (!this.banDoc.table('Transactions').column('TMaxScore')) {
      //column operation
      column = {};
      //column parameters
      column.name = texts.maxscore;
      column.nameXml = 'TMaxScore';
      column.width = '200';
      column.description = texts.maxscore;
      column.header1 = texts.maxscore;
      column.definition = { "type": "number", "decimals": '2' };
      column.operation = { "name": "add" };
      columns.push(column);
    }

    if (!this.banDoc.table('Transactions').column('TAutoScore')) {
      //column operation
      column = {};
      //column parameters
      column.name = texts.autoscore;
      column.nameXml = 'TAutoScore';
      column.width = '200';
      column.description = texts.autoscore;
      column.header1 = texts.autoscore;
      column.definition = { "type": "number", "decimals": '2' };
      column.operation = { "name": "add" };
      columns.push(column);
    }

    if (!this.banDoc.table('Transactions').column('TAdjustedScore')) {
      //column operation
      column = {};
      //column parameters
      column.name = texts.adjustedscore;
      column.nameXml = 'TAdjustedScore';
      column.width = '200';
      column.description = texts.adjustedscore;
      column.header1 = texts.adjustedscore;
      column.definition = { "type": "number", "decimals": '2' };
      column.operation = { "name": "add" };
      columns.push(column);
    }

    if (!this.banDoc.table('Transactions').column('TCorrectionsNotes')) {
      //column operation
      column = {};
      //column parameters
      column.name = texts.correctionsnotes;
      column.nameXml = 'TCorrectionsNotes';
      column.width = '200';
      column.description = texts.correctionsnotes;
      column.header1 = texts.correctionsnotes;
      column.definition = { "type": "text" };
      column.operation = { "name": "add" };
      columns.push(column);
    }


    if (rows.length > 0 || columns.length > 0) {

      if (rows.length > 0) {
        //table for the operations
        let dataUnitTransactionsRows = {};
        dataUnitTransactionsRows.nameXml = 'Transactions';
        dataUnitTransactionsRows.data = {};
        //data for rows
        dataUnitTransactionsRows.data.rowLists = [];
        dataUnitTransactionsRows.data.rowLists.push({ 'rows': rows });
        jsonDocRows.document.dataUnits.push(dataUnitTransactionsRows);
        Banana.console.log("jsonDocRows: " + JSON.stringify(jsonDocRows));
        documentChange["data"].push(jsonDocRows);
      }

      if (columns.length > 0) {
        //table for the operations
        let dataUnitTransactionsColumns = {};
        dataUnitTransactionsColumns.nameXml = 'Transactions';
        dataUnitTransactionsColumns.data = {};
        //data for columns
        dataUnitTransactionsColumns.data.viewList = {};
        dataUnitTransactionsColumns.data.viewList.views = [];
        dataUnitTransactionsColumns.data.viewList.views.push({ 'columns': columns });
        jsonDocColumns.document.dataUnits.push(dataUnitTransactionsColumns);
        documentChange["data"].push(jsonDocColumns);
      }

      return documentChange;
    }
    else {
      return Banana.application.addMessage(texts.nochanges);
    }
  }
}