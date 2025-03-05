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
 * Questa classe gestisce la logica ed i metodi per la creazione del report 
 * @param {*} banDocument 
 */

var CreateDoc = class CreateDoc {
  constructor(banDocument, isTest) {
    this.banDoc = banDocument;
    this.isTest = isTest;
  }

  result() {

    let lang = this.banDoc.info("Base", "Language");

    let printsettings = new PrintSettings(this.banDoc1, this.isTest);

    // Load the texts based on the language code
    let texts = printsettings.loadTexts(lang);

    let documentChange = { "format": "documentChange", "error": "", "data": [] };

    let jsonDocColumns = initDocument(this.isTest);

    // Add the columns Score and MaxScore to the transactions if they don't exist

    //table for the operations
    let dataUnitTransactions = {};
    dataUnitTransactions.nameXml = 'Transactions';

    //data for columns
    dataUnitTransactions.data = {};
    dataUnitTransactions.data.viewList = {};
    dataUnitTransactions.data.viewList.views = [];

    //column operation
    let column = {};
    //columns
    let columns = [];

    if (!this.banDoc.table('Transactions').column('TAuto')) {
      //column operation
      column = {};
      column.operation = {};
      column.operation.name = 'add';
      //column parameters
      column.nameXml = 'TAuto';
      column.width = '200';
      column.description = 'Auto';
      column.header1 = 'Auto';
      column.definition = { "type": "text" };
      column.operation = { "name": "add" };
      column.operation.sequence = '0';
      columns.push(column);
    }

    if (!this.banDoc.table('Transactions').column('TMaxScore')) {
      //column operation
      column = {};
      column.operation = {};
      column.operation.name = 'add';
      //column parameters
      column.nameXml = 'TMaxScore';
      column.width = '200';
      column.description = 'Max Score';
      column.header1 = 'Max Score';
      column.definition = { "type": "number", "decimals": '2' };
      column.operation = { "name": "add" };
      columns.push(column);
    }

    if (!this.banDoc.table('Transactions').column('TAutoScore')) {
      //column operation
      column = {};
      column.operation = {};
      column.operation.name = 'add';
      //column parameters
      column.nameXml = 'TAutoScore';
      column.width = '200';
      column.description = 'Auto Score';
      column.header1 = 'Auto Score';
      column.definition = { "type": "number", "decimals": '2' };
      column.operation = { "name": "add" };
      columns.push(column);
    }

    if (!this.banDoc.table('Transactions').column('TAdjustedScore')) {
      //column operation
      column = {};
      column.operation = {};
      column.operation.name = 'add';
      //column parameters
      column.nameXml = 'TAdjustedScore';
      column.width = '200';
      column.description = 'Adjusted Score';
      column.header1 = 'Adjusted Score';
      column.definition = { "type": "number", "decimals": '2' };
      column.operation = { "name": "add" };
      columns.push(column);
    }

    if (!this.banDoc.table('Transactions').column('TCorrectionsNotes')) {
      //column operation
      column = {};
      column.operation = {};
      column.operation.name = 'add';
      //column parameters
      column.nameXml = 'TCorrectionsNotes';
      column.width = '200';
      column.description = 'Corrections Notes';
      column.header1 = 'Corrections Notes';
      column.definition = { "type": "text" };
      column.operation = { "name": "add" };
      columns.push(column);
    }

    if (columns.length > 0) {
      dataUnitTransactions.data.viewList.views.push({ 'columns': columns });
      jsonDocColumns.document.dataUnits.push(dataUnitTransactions);
      documentChange["data"].push(jsonDocColumns);

      return documentChange;
    }
    else {
      return Banana.application.addMessage(texts.nochanges);
    }
  }
}