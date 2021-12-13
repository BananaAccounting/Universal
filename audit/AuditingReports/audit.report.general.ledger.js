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
// @includejs= audit.settings.js


//errors
var DEBIT_CREDIT_DIFFERENTS = "DEBIT_CREDIT_DIFFERENTS";

//Main function
function exec(string) {

    //Check if we are on an opened document
    if (!Banana.document) {
        return;
    }

    var dateform = getPeriodSettings();
    if (dateform) {
        printReport(dateform.selectionStartDate, dateform.selectionEndDate);
    }
}

function getGeneralLedgerTable(report, endDate) {
    var journalTable = report.addTable('generalLedger');
    //title table
    journalTable.getCaption().addText("General Ledger at " + Banana.Converter.toLocaleDateFormat(endDate), "dateIndicator");
    //columns
    journalTable.addColumn("Date").setStyleAttributes("width:10%", "tableHeaders");
    journalTable.addColumn("Transaction Type").setStyleAttributes("width:15%", "tableHeaders");
    journalTable.addColumn("Doc").setStyleAttributes("width:10%", "tableHeaders");
    journalTable.addColumn("Description").setStyleAttributes("width:50%", "tableHeaders");
    journalTable.addColumn("Account").setStyleAttributes("width:20%", "tableHeaders");
    journalTable.addColumn("Debit").setStyleAttributes("width:15%", "tableHeaders");
    journalTable.addColumn("Credit").setStyleAttributes("width:15%", "tableHeaders");
    journalTable.addColumn("Balance").setStyleAttributes("width:15%", "tableHeaders");

    //header
    var tableHeader = journalTable.getHeader();
    var tableRow = tableHeader.addRow();
    tableRow.addCell("Date", "tableHeaders");
    tableRow.addCell("Transaction Type", "tableHeaders");
    tableRow.addCell("Doc", "tableHeaders");
    tableRow.addCell("Description", "tableHeaders");
    tableRow.addCell("Account", "tableHeaders");
    tableRow.addCell("Debit", "tableHeaders");
    tableRow.addCell("Credit", "tableHeaders");
    tableRow.addCell("Balance", "tableHeaders");


    return journalTable;
}


//Function that creates and prints the report
function printReport(startDate, endDate) {

    //Add a name to the report
    var report = Banana.Report.newReport("General Ledger");

    //Add a title
    report.addParagraph("General Ledger", "heading1");
    report.addParagraph(" ", "");

    //Create a table for the report
    var table = getGeneralLedgerTable(report, endDate);

    /* 1. Print the Journal with the totals */
    printGeneralLedger(table, startDate, endDate);

    //Add a footer to the report
    addFooter(report);

    //Print the report
    var stylesheet = getReportStyle();
    Banana.Report.preview(report, stylesheet);
}

function printGeneralLedger(table, startDate, endDate) {

    var accountData = getAccountData(startDate, endDate);
    var sumDebit = "";
    var sumCredit = "";
    var amountStyle = "";

    for (var a in accountData) {
        for (var t in accountData[a].transactions) {
            var transaction = accountData.transactions[t]; //RIPRENDERE DALL ERRORE CHE DA QUIIIIIIII
            if (transaction.type == "6") //if total transaction
                amountStyle = "operationTotalsStyle";
            else
                amountStyle = "amountStyle";

            tableRow = table.addRow();
            tableRow.addCell(transaction.date, "centredStyle");
            tableRow.addCell(transaction.type, "centredStyle");
            tableRow.addCell(transaction.doc, "centredStyle");
            tableRow.addCell(transaction.description, "textStyle");
            tableRow.addCell(account.accountNr, "centredStyle");
            tableRow.addCell(Banana.Converter.toLocaleNumberFormat(transaction.debitAmount, "2", false), amountStyle);
            sumDebit = Banana.SDecimal.add(sumDebit, transaction.debitAmount);
            tableRow.addCell(Banana.Converter.toLocaleNumberFormat(transaction.creditAmount, "2", false), amountStyle);
            sumCredit = Banana.SDecimal.add(sumCredit, transaction.creditAmount);
            tableRow.addCell(Banana.Converter.toLocaleNumberFormat(transaction.balance, "2", false), "amountStyle");
        }

        //put some space for a better visibility 
        tableRow = table.addRow();
        tableRow.addCell("", "centredStyle");

    }

}
/**
 * 
 * @param {*} startDate 
 * @param {*} endDate 
 * @returns a list of objects containing an array with all transactions for those accounts
 */
function getAccountData(startDate, endDate) {
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
    var accountsList = getAccountsList();
    for (var i = 0; i < accountsList.length; i++) {
        var accountData = {};
        accountData.accountNr = accountsList[i];
        accountData.transactions = getAccountTransactions(accountsList[i], startDate, endDate);
        //check that the transactions array contains transactions other than the total, i.e. other than operationType 6
        if (hasTransactions(accountData.transactions))
            accountCardList.push(accountData);
    }

    return accountCardList;

}

/**
 * 
 */
function hasTransactions(transactions) {

    for (var t in transactions) {
        if (transactions[t].type !== "6")
            return true; //to the first element we find that does not equal 6, we can already deduce that there is at least one registration
        else
            return false;
    }
}

/**
 * @param {*} account account id
 * @param {*} startDate 
 * @param {*} endDate 
 * @returns the transaction list for the given account
 */
function getAccountTransactions(account, startDate, endDate) {
    var accountCardTable = Banana.document.currentCard(account, startDate, endDate);
    var accountTransactions = [];
    for (var i = 0; i < accountCardTable.rowCount; i++) {
        var tRow = accountCardTable.row(i);
        var trans = {};
        trans = getTransactionFieldsByType(tRow);
        accountTransactions.push(trans);

    }

    return accountTransactions;

}

/**
 * @param {*} tRow 
 * @returns the transactions fields for the given row
 */
function getTransactionFieldsByType(tRow) {
    var trans = {};
    //operation type = total
    if (tRow.value('JOperationType') == "6") {
        trans.date = tRow.value('JDate');
        trans.type = tRow.value('JOperationType');
        trans.account = tRow.value('JAccount');
        trans.debitAmount = tRow.value('JDebitAmount');
        trans.creditAmount = tRow.value('JCreditAmount');
    } else {
        trans.date = tRow.value('JDate');
        trans.type = tRow.value('JOperationType'); //0=OPERATIONTYPE_NONE,1=OPERATIONTYPE_OPENING,2=OPERATIONTYPE_CARRYFORWARD,3=OPERATIONTYPE_TRANSACTION, 21=OPERATIONTYPE_INVOICESETTLEMENT
        trans.doc = tRow.value('Doc');
        trans.description = tRow.value('Description');
        trans.account = tRow.value('JAccount');
        trans.debitAmount = tRow.value('JDebitAmount');
        trans.creditAmount = tRow.value('JCreditAmount');
        trans.balance = tRow.value('JBalance');
    }

    return trans;
}

function getAccountsList() {
    var accountsList = [];
    var accountsTable = Banana.document.table("Accounts")

    for (var i = 0; i < accountsTable.rowCount; i++) {
        var tRow = accountsTable.row(i);
        var bClass = tRow.value("BClass");
        var accountNr = tRow.value("Account");

        if (bClass == "1" || bClass == "2" || bClass == "3" || bClass == "4") {
            accountsList.push(accountNr);
        }
    }
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


/**
 * Defines the style for the report
 * @returns 
 */
function getReportStyle() {
    var textCSS = "";
    var file = Banana.IO.getLocalFile("file:script/audit.report.css");
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



//The main purpose of this function is to allow the user to enter the accounting period desired and saving it for the next time the script is run.
//Every time the user runs of the script he has the possibility to change the date of the accounting period.
function getPeriodSettings() {

    //The formeters of the period that we need
    var scriptform = {
        "selectionStartDate": "",
        "selectionEndDate": "",
        "selectionChecked": "false"
    };

    //Read script settings
    var data = Banana.document.scriptReadSettings();

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
    var docStartDate = Banana.document.startPeriod();
    var docEndDate = Banana.document.endPeriod();

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
        var value = Banana.document.scriptSaveSettings(formToString);
    } else {
        //User clicked cancel
        return;
    }
    return scriptform;
}

function getErrorMessage(errorId, lang) {
    if (!lang)
        lang = 'en';
    switch (errorId) {
        case "DEBIT_CREDIT_DIFFERENTS":
            if (lang == 'it')
                return "Il totale in Dare e quello in Avere sono differenti";
            else if (lang == 'fr')
                return "Le débit total et le crédit total sont différents";
            else if (lang == 'de')
                return "Gesamtsoll und Gesamtguthaben sind unterschiedlich";
            else
                return "Total debit and total credit are different";
    }
    return '';
}

function checkDebitCredit(sumDebit, sumCredit) {
    var lan = getLang();
    var msg = getErrorMessage(DEBIT_CREDIT_DIFFERENTS, "");
    if (sumDebit, sumCredit) {
        Banana.document.addMessage(msg, DEBIT_CREDIT_DIFFERENTS);
    }
}

function getLang() {
    var lang = 'en';
    if (Banana.document)
        lang = Banana.document.locale;
    else if (Banana.application.locale)
        lang = Banana.application.locale;
    if (lang.length > 2)
        lang = lang.substring(0, 2);
    return lang;
}