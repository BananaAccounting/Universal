// Copyright [2021] [Banana.ch SA - Lugano Switzerland]
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
// @id = ch.banana.audit.report.general.ledger
// @api = 1.0
// @pubdate = 2021-12-13
// @publisher = Banana.ch SA
// @description = General Ledger
// @task = app.command
// @doctype = *;*
// @docproperties =
// @outputformat = none
// @inputdatasource = none
// @timeout = -1
// @includejs= ch.banana.audit.settings.js


//errors
var DEBIT_CREDIT_DIFFERENTS = "DEBIT_CREDIT_DIFFERENTS";


//Main function
function exec() {

    var banDoc=Banana.document;

    //Check if we are on an opened document
    if (!banDoc) {
        return;
    }

    //get the additional columns
    var savedScriptSettings = banDoc.getScriptSettings("ch.banana.audit.settings");
    var additionalColumnsList = [];
    if (savedScriptSettings)
    additionalColumnsList = getAdditionalColumns(savedScriptSettings);

    var dateform = getPeriodSettings(banDoc);
    if (dateform) {
        printReport(dateform.selectionStartDate, dateform.selectionEndDate,additionalColumnsList,banDoc);
    }
}

/**
 * Takes the string with the name of the columns and transforms it into an array
 * @param {*} getAdditionalColumns_formatted 
 * @returns an array with the additionalcolumns
 */
 function getAdditionalColumns(savedScriptSettings) {
    var strColumns = "";
    var columnsList = [];
    savedScriptSettings = JSON.parse(savedScriptSettings);

    //take the columns defined for the general ledger
    strColumns = savedScriptSettings.generalLedger_xmlColumnsName;

    //Only call the split method if the string is not empty.
    if (strColumns)
        columnsList = strColumns.split(";");

    return columnsList
}

function getGeneralLedgerTable(report, startDate, endDate,additionalColumnsList) {
    var generalLedgerTable = report.addTable('generalLedger');
    //title table
    generalLedgerTable.getCaption().addText("General Ledger for the period " + Banana.Converter.toLocaleDateFormat(startDate) + " - " + Banana.Converter.toLocaleDateFormat(endDate), "dateIndicator");
    //columns
    generalLedgerTable.addColumn("Date").setStyleAttributes("width:10%", "tableHeaders");
    generalLedgerTable.addColumn("Transaction Type").setStyleAttributes("width:15%", "tableHeaders");
    generalLedgerTable.addColumn("Doc").setStyleAttributes("width:10%", "tableHeaders");
    generalLedgerTable.addColumn("Description").setStyleAttributes("width:50%", "tableHeaders");
    generalLedgerTable.addColumn("Account").setStyleAttributes("width:20%", "tableHeaders");
    generalLedgerTable.addColumn("Debit").setStyleAttributes("width:15%", "tableHeaders");
    generalLedgerTable.addColumn("Credit").setStyleAttributes("width:15%", "tableHeaders");
    generalLedgerTable.addColumn("Balance").setStyleAttributes("width:15%", "tableHeaders");
    //add the additional columns inserted by the user in the settings dialog
    for (var i = 0; i < additionalColumnsList.length; i++) {
        generalLedgerTable.addColumn(additionalColumnsList[i]).setStyleAttributes("width:15%", "tableHeaders");
    }

    //header
    var tableHeader = generalLedgerTable.getHeader();
    var tableRow = tableHeader.addRow();
    tableRow.addCell("Date", "tableHeaders");
    tableRow.addCell("Transaction Type", "tableHeaders");
    tableRow.addCell("Doc", "tableHeaders");
    tableRow.addCell("Description", "tableHeaders");
    tableRow.addCell("Account", "tableHeaders");
    tableRow.addCell("Debit", "tableHeaders");
    tableRow.addCell("Credit", "tableHeaders");
    tableRow.addCell("Balance", "tableHeaders");
    //add the additional columns inserted by the user in the settings dialog
    for (var i = 0; i < additionalColumnsList.length; i++) {
        tableRow.addCell(additionalColumnsList[i], "tableHeaders");
    }


    return generalLedgerTable;
}


//Function that creates and prints the report
function printReport(startDate, endDate,additionalColumnsList,banDoc) {

    //Add a name to the report
    var report = Banana.Report.newReport("General Ledger");

    //Add a header to the report
    addHeader(report,banDoc);

    //Create a table for the report
    var table = getGeneralLedgerTable(report, startDate, endDate,additionalColumnsList);

    if(!table){
        Banana.console.debug("no obj table");
    }

    /* 1. Print the Journal with the totals */
    printGeneralLedger(table, startDate, endDate,additionalColumnsList,banDoc);

    //Add a footer to the report
    addFooter(report);

    //Print the report
    var stylesheet = getReportStyle();
    Banana.Report.preview(report, stylesheet);
}

function printGeneralLedger(table, startDate, endDate,additionalColumnsList,banDoc) {

    var accountData = setAccountData(startDate, endDate,additionalColumnsList,banDoc);
    var sumDebit = "";
    var sumCredit = "";
    var amountStyle = "";

    for (var a in accountData) {
        for (var t in accountData[a].transactions) {
            var transaction = accountData[a].transactions[t];
            if (transaction.type == "6" && transaction.debitAmount && transaction.creditAmount) //if it is a total row and if debit and credit amounts are present
                amountStyle = "operationTotalsStyle";
            else
                amountStyle = "amountStyle";

            tableRow = table.addRow();
            tableRow.addCell(transaction.date, "centredStyle");
            tableRow.addCell(transaction.type, "centredStyle");
            tableRow.addCell(transaction.doc, "centredStyle");
            tableRow.addCell(transaction.description, "textStyle");
            tableRow.addCell(accountData[a].accountNr, "centredStyle");
            tableRow.addCell(Banana.Converter.toLocaleNumberFormat(transaction.debitAmount, "2", false), amountStyle);
            sumDebit = Banana.SDecimal.add(sumDebit, transaction.debitAmount);
            tableRow.addCell(Banana.Converter.toLocaleNumberFormat(transaction.creditAmount, "2", false), amountStyle);
            sumCredit = Banana.SDecimal.add(sumCredit, transaction.creditAmount);
            tableRow.addCell(Banana.Converter.toLocaleNumberFormat(transaction.balance, "2", false), "amountStyle");
            //add the additional columns inserted by the user in the settings dialog
            for (var i = 0; i < additionalColumnsList.length; i++) {
                tableRow.addCell(transaction[additionalColumnsList[i]], "centredStyle");
            }
        }

        //put some space for a better visibility 
        tableRow = table.addRow();
        tableRow.addCell("", "centredStyle");

    }

}
/**
 * Create an object with the account cards data
 * @param {*} startDate 
 * @param {*} endDate 
 * @returns 
 */
function setAccountData(startDate, endDate,additionalColumnsList,banDoc) {
    /**
     * Ex structure:
     * {
     *  accountNumber=1000
     *  transactions[
     *      {date:...,doc...,},
     *      {date:...,doc...,},
     *  ]
     * 
     * }
     * 
     */
    var accountCardList = [];
    var accountsList = getAccountsList(banDoc);
    for (var i = 0; i < accountsList.length; i++) {
        var accountData = {};
        accountData.accountNr = accountsList[i];
        accountData.transactions = getAccountTransactions(accountsList[i], startDate, endDate,additionalColumnsList,banDoc);
        //If the account has been used during the year, or at least has an opening balance, I will add it to the list.
        if (hasTransactions(accountData.transactions))
            accountCardList.push(accountData);
    }

    return accountCardList;

}

/**
 *Check that there have been movements on that account, if there is only a closing total then it returns false.
 */
function hasTransactions(transactions) {

    for (var t in transactions) {
        if (transactions[t].type !== "6")
            return true; //to the first element we find that does not equal 6, we can already deduce that there is at least one registration or the opening balance
        else
            return false;
    }
}

/**
 * @param {*} account account id
 * @param {*} startDate 
 * @param {*} endDate 
 * @returns the transactions list for the given account
 */
function getAccountTransactions(account, startDate, endDate,additionalColumnsList,banDoc) {

    var accountCardTable = banDoc.currentCard(account, startDate, endDate);
    var accountTransactions = [];
    for (var i = 0; i < accountCardTable.rowCount; i++) {
        var tRow = accountCardTable.row(i);
        var trans = {};
        trans.date = tRow.value('JDate');
        trans.type = tRow.value('JOperationType');
        trans.account = tRow.value('JAccount');
        trans.doc = tRow.value('Doc');
        trans.description = tRow.value('JDescription');
        trans.debitAmount = tRow.value('JDebitAmount');
        trans.creditAmount = tRow.value('JCreditAmount');
        trans.balance = tRow.value('JBalance');

        //we save also the values of additional columns
        for (var j = 0; j < additionalColumnsList.length; j++) {
            var index = additionalColumnsList[j];
            trans[index] = tRow.value(additionalColumnsList[j]);
        }

        accountTransactions.push(trans);

    }

    return accountTransactions;

}

/**
 * Get the list of the accounts form the Accounts table
 * @returns the list of the accounts found
 */
function getAccountsList(banDoc) {
    var accountsList = [];
    var accountsTable = banDoc.table("Accounts");

    if(accountsTable){
        for (var i = 0; i < accountsTable.rowCount; i++) {
            var tRow = accountsTable.row(i);
            var bClass = tRow.value("BClass");
            var accountNr = tRow.value("Account");

            if (bClass == "1" || bClass == "2" || bClass == "3" || bClass == "4") {
                accountsList.push(accountNr);
            }
        }
    }else(Banana.console.debug("no accounts table"));
    
    return accountsList;
}


//Function that adds a Footer to the report
function addFooter(report) {
    var date = new Date();
    var d = Banana.Converter.toLocaleDateFormat(date);
    report.getFooter().addClass("footerStyle");
    var versionLine = report.getFooter().addText(d + " - General Ledger - Page ", "description");
    report.getFooter().addFieldPageNr();
}

function addHeader(report,banDoc) {
    docInfo = getDocumentInfo(banDoc);
    var headerParagraph = report.getHeader().addSection();
    headerParagraph.addParagraph("General Ledger", "heading1");
    headerParagraph.addParagraph("", "");
    headerParagraph.addParagraph(docInfo.company, "");
    headerParagraph.addParagraph(docInfo.address, "");
    headerParagraph.addParagraph(docInfo.zip + " " + docInfo.city, "");
    headerParagraph.addParagraph(docInfo.vatNumber, "");
    headerParagraph.addParagraph("", "");
    headerParagraph.addParagraph("", "");
    headerParagraph.addParagraph("", "");
}


/**
 * Defines the style for the report
 * @returns 
 */
function getReportStyle() {
    var textCSS = "";
    var file = Banana.IO.getLocalFile("file:script/ch.banana.audit.report.css");
    var fileContent = file.read();
    if (!file.errorString) {
        Banana.IO.openPath(fileContent);
        //Banana.console.log(fileContent);
        textCSS = fileContent;
    } else {
        Banana.console.log(file.errorString);
    }

    var stylesheet = Banana.Report.newStyleSheet();
    // Parse the CSS text
    stylesheet.parse(textCSS);

    return stylesheet;
}

/**
 * return the document info
 * @returns 
 */
function getDocumentInfo(banDoc) {

    var documentInfo = {};
    documentInfo.company = "";
    documentInfo.address = "";
    documentInfo.zip = "";
    documentInfo.city = "";
    documentInfo.vatNumber = "";


    if (Banana.document) {
        if (Banana.document.info("AccountingDataBase", "Company"));
        documentInfo.company = Banana.document.info("AccountingDataBase", "Company");
        if (Banana.document.info("AccountingDataBase", "Address1"))
            documentInfo.address = Banana.document.info("AccountingDataBase", "Address1");
        if (Banana.document.info("AccountingDataBase", "Zip"))
            documentInfo.zip = Banana.document.info("AccountingDataBase", "Zip");
        if (Banana.document.info("AccountingDataBase", "City"))
            documentInfo.city = Banana.document.info("AccountingDataBase", "City");
        if (Banana.document.info("AccountingDataBase", "VatNumber"))
            documentInfo.vatNumber = Banana.document.info("AccountingDataBase", "VatNumber");
    }

    return documentInfo;
}


//The main purpose of this function is to allow the user to enter the accounting period desired and saving it for the next time the script is run.
//Every time the user runs of the script he has the possibility to change the date of the accounting period.
function getPeriodSettings(banDoc) {

    //The formeters of the period that we need
    var scriptform = {
        "selectionStartDate": "",
        "selectionEndDate": "",
        "selectionChecked": "false"
    };

    //Read script settings
    var data = banDoc.getScriptSettings("ch.banana.audit.report.general.ledger");

    //Check if there are previously saved settings and read them
    if (data.length > 0) {
        try {
            var readSettings = JSON.parse(data);

            //We check if "readSettings" is not null, then we fill the formeters with the values just read
            if (readSettings) {
                scriptform = readSettings;
            }
        } catch (e) {}
    }

    //We take the accounting "starting date" and "ending date" from the document. These will be used as default dates
    var docStartDate = banDoc.startPeriod();
    var docEndDate = banDoc.endPeriod();

    //A dialog window is opened asking the user to insert the desired period. By default is the accounting period
    var selectedDates = Banana.Ui.getPeriod("Period", docStartDate, docEndDate,
        scriptform.selectionStartDate, scriptform.selectionEndDate, scriptform.selectionChecked);

    //We take the values entered by the user and save them as "new default" values.
    //This because the next time the script will be executed, the dialog window will contains the new values.
    if (selectedDates) {
        scriptform["selectionStartDate"] = selectedDates.startDate;
        scriptform["selectionEndDate"] = selectedDates.endDate;
        scriptform["selectionChecked"] = selectedDates.hasSelection;

        //Save script settings
        var formToString = JSON.stringify(scriptform);
        banDoc.setScriptSettings("ch.banana.audit.report.general.ledger", formToString);
    } else {
        //User clicked cancel
        return;
    }
    return scriptform;
}