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
    this.bananaDoc = banDocument;
    this.isTest = isTest;
  }

  result() {

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

    if (!this.bananaDoc.table('Transactions').column('TAuto')) {
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

    if (!this.bananaDoc.table('Transactions').column('TMaxScore')) {
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

    if (!this.bananaDoc.table('Transactions').column('TAutoScore')) {
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

    if (!this.bananaDoc.table('Transactions').column('TAdjustedScore')) {
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

    if (!this.bananaDoc.table('Transactions').column('TCorrectionsNotes')) {
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
      return;
    }
  }
}