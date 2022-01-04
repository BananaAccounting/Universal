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
// @id = ch.banana.audit.report
// @api = 1.0
// @pubdate = 2021-12-03
// @publisher = Banana.ch SA
// @description = Journal
// @task = app.command
// @doctype = 100.*
// @docproperties =
// @outputformat = none
// @inputdatasource = none
// @timeout = -1
// @includejs= ch.banana.audit.settings.js


//errors
var DEBIT_CREDIT_DIFFERENTS = "DEBIT_CREDIT_DIFFERENTS";

//Main function
function exec() {

    var banDoc = Banana.document;

    if (!banDoc) {
        return;
    }

    //get user parameters
    var userParam=initDialogParam();
    var savedParam = banDoc.getScriptSettings("ch.banana.audit.settings");
    if (savedParam.length>0)
    userParam = getParamObj(userParam,savedParam);

    var dateform = getPeriodSettings(banDoc);
    var report = "";
    if (dateform) {
        report = printReport(dateform.selectionStartDate, dateform.selectionEndDate, userParam, banDoc);
    }

    //print the report
    var stylesheet = getReportStyle();
    Banana.Report.preview(report, stylesheet);
}

/**
 * Format the parameters defined by the user.
 * @param {*} userParam 
 * @param {*} savedParam 
 * @returns 
 */
function getParamObj(userParam,savedParam) {
    userParam = JSON.parse(savedParam);
    userParam=verifyParam(userParam);

    //Only call the split method if the string is not empty.
    if (userParam.journal.xmlColumnsName)
        userParam.journal.xmlColumnsName = userParam.journal.xmlColumnsName.split(";");

    return userParam;
}

function getJournalTable(report,userParam) {
    var journalTable = report.addTable('journalTable');
    //columns
    journalTable.addColumn("Date").setStyleAttributes("width:10%", "tableHeaders");
    journalTable.addColumn("Doc").setStyleAttributes("width:10%", "tableHeaders");
    journalTable.addColumn("Description").setStyleAttributes("width:50%", "tableHeaders");
    journalTable.addColumn("Account").setStyleAttributes("width:20%", "tableHeaders");
    journalTable.addColumn("Debit").setStyleAttributes("width:15%", "tableHeaders");
    journalTable.addColumn("Credit").setStyleAttributes("width:15%", "tableHeaders");
    journalTable.addColumn("Amount").setStyleAttributes("width:15%", "tableHeaders");
    //add the additional columns inserted by the user in the settings dialog
    for (var i = 0; i < userParam.journal.xmlColumnsName.length; i++) {
        journalTable.addColumn(userParam.journal.xmlColumnsName[i]).setStyleAttributes("width:15%", "tableHeaders");
    }

    //header
    var tableHeader = journalTable.getHeader();
    var tableRow = tableHeader.addRow();
    tableRow.addCell("Date", "tableHeaders");
    tableRow.addCell("Doc", "tableHeaders");
    tableRow.addCell("Description", "tableHeaders");
    tableRow.addCell("Account", "tableHeaders");
    tableRow.addCell("Debit", "tableHeaders");
    tableRow.addCell("Credit", "tableHeaders");
    tableRow.addCell("Amount", "tableHeaders");
    //add the additional columns inserted by the user in the settings dialog
    for (var i = 0; i < userParam.journal.xmlColumnsName.length; i++) {
        tableRow.addCell(userParam.journal.xmlColumnsName[i], "tableHeaders");
    }


    return journalTable;
}


//Function that creates and prints the report
function printReport(startDate, endDate, userParam, banDoc) {

    //Add a name to the report
    var report = Banana.Report.newReport("Journal Balance");

    //Add a title
    addHeader(report,banDoc,startDate, endDate);

    //Create a table for the report
    var table = getJournalTable(report, userParam);

    /* 1. Print the Jorunal with the totals */
    printJournal(table, startDate, endDate, userParam, banDoc);

    //Add a footer to the report
    addFooter(report);

    //Print the report
    return report;

}

function printJournal(table, startDate, endDate, userParam, banDoc) {

    var journalOp = getJournalOperations(startDate, endDate, userParam, banDoc);
    var sumDebit = "";
    var sumCredit = "";
    //get the span for the empty rows.
    var span=7;
    span=span+userParam.journal.xmlColumnsName.length;

    for (var op in journalOp) {
        var operation = journalOp[op];
        var opDebit = "";
        var firstRow = true; //to fix with a better method

        var opCredit = "";
        tableRow = table.addRow();
        tableRow.addCell(Banana.Converter.toLocaleDateFormat(operation.date), "centredStyle");
        tableRow.addCell(operation.doc, "centredStyle");
        for (var row in operation.rows) {
            var opRow = operation.rows[row];
            //we want the first row on the same line
            if (!firstRow) {
                tableRow = table.addRow();
                tableRow.addCell("", "", 2);
            }
            tableRow.addCell(opRow.description, "textStyle");
            tableRow.addCell(opRow.account, "centredStyle");
            tableRow.addCell(Banana.Converter.toLocaleNumberFormat(opRow.debitAmount, "2", false), "amountStyle");
            opDebit = Banana.SDecimal.add(opDebit, opRow.debitAmount);
            tableRow.addCell(Banana.Converter.toLocaleNumberFormat(opRow.creditAmount, "2", false), "amountStyle");
            opCredit = Banana.SDecimal.add(opCredit, opRow.creditAmount);
            tableRow.addCell(Banana.Converter.toLocaleNumberFormat(opRow.amount, "2", false), "amountStyle");
            //add the additional columns inserted by the user in the settings dialog
            for (var i = 0; i < userParam.journal.xmlColumnsName.length; i++) {
                tableRow.addCell(opRow[userParam.journal.xmlColumnsName[i]], "centredStyle");
            }
            firstRow = false;
        }
        //add the total debit and credit
        tableRow = table.addRow();
        tableRow.addCell("", "centredStyle", 4);
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(opDebit, "2", false), "totalTransactionsStyle");
        sumDebit = Banana.SDecimal.add(sumDebit, opDebit);
        tableRow.addCell(Banana.Converter.toLocaleNumberFormat(opCredit, "2", false), "totalTransactionsStyle");
        sumCredit = Banana.SDecimal.add(sumCredit, opCredit);
        tableRow.addCell(" ", "centredStyle");

        //put some space for a better visibility 
        tableRow = table.addRow();
        tableRow.addCell(" ", "centredStyle",span);



    }

    //check if sum of debit and sum of credit are equals
    //if are not equals a message is displayed
    checkDebitCredit(sumDebit, sumCredit, banDoc);
    //add totals
    tableRow = table.addRow();
    tableRow.addCell("Total", "sumStyle");
    tableRow.addCell("", "", 3);
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(sumDebit, "2", false), "sumStyle");
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(sumCredit, "2", false), "sumStyle");


}

//Function that load the jorunal rows
function getJournalRows(startDate, endDate, userParam, banDoc) {

    //array with the journal transactions
    var journalRows = [];
    //Get the Journal
    var journal = banDoc.journal(banDoc.ORIGINTYPE_CURRENT, banDoc.ACCOUNTTYPE_NORMAL);
    // Read the table row by row and save some values
    for (var i = 0; i < journal.rowCount; i++) {
        var tRow = journal.row(i);
        // From the journal table we take only the transactions rows
        if (tRow.value('JOperationType') == banDoc.OPERATIONTYPE_TRANSACTION && dateWithinTheRange(tRow.value('JDate'), startDate, endDate)) {
            var trRow = {};
            trRow.id = tRow.value('JContraAccountGroup');
            trRow.jDate = tRow.value('JDate');
            trRow.jOperationType = tRow.value('JOperationType'); //0=OPERATIONTYPE_NONE,1=OPERATIONTYPE_OPENING,2=OPERATIONTYPE_CARRYFORWARD,3=OPERATIONTYPE_TRANSACTION, 21=OPERATIONTYPE_INVOICESETTLEMENT
            trRow.trDoc = tRow.value('Doc');
            trRow.trDescription = tRow.value('Description');
            trRow.jAccount = tRow.value('JAccount');
            trRow.jDebitAmount = tRow.value('JDebitAmount');
            trRow.jCreditAmount = tRow.value('JCreditAmount');
            trRow.JAmount = tRow.value('JAmount');

            //we save also the values of additional columns
            for (var j = 0; j < userParam.journal.xmlColumnsName.length; j++) {
                var index = userParam.journal.xmlColumnsName[j];
                trRow[index] = tRow.value(userParam.journal.xmlColumnsName[j]);
            }

            if (trRow)
                journalRows.push(trRow);
        }
    }

    return journalRows;

}

/**
 * Check if the transaction date is within the range defined by the user
 */
function dateWithinTheRange(trDate, pStartDate, pEndDate) {
    isWithinTheRange = false;

    //compare the dates
    var date = new Date(trDate);
    var startDate = new Date(pStartDate);
    var endDate = new Date(pEndDate);

    if (date >= startDate && date <= endDate)
        isWithinTheRange = true;


    return isWithinTheRange;

}

/**
 * creates a structure with the journnal operations
 * @param {*} startDate 
 * @param {*} endDate 
 * @returns an object eith the journal operations
 */
function getJournalOperations(startDate, endDate, userParam, banDoc) {
    //if (tRow.value('JContraAccountGroup') !== previous_contraAccountGroup) {
    var jRows = getJournalRows(startDate, endDate, userParam, banDoc);
    var jOperations = [];

    /**
     * example obj structure
     * {
     * 	"id"=0 //JContraAccountGroup
     * 	"date"=01.01.2022 //JDate
     * 	"type"=3
     * 	"rows"[
     * 		{
     * 			description="Sell" //Description
     * 			account="1000"
     * 			debit=2000.00
     * 			credit=""
     * 		}
     * 	]
     * }
     */

    var opIdList = getIdList(jRows);

    //for each
    for (var i = 0; i < opIdList.length; i++) {
        var jOp = {};
        jOp = setOperationData(opIdList[i], jRows);
        var opRows = setOperationData_rows(opIdList[i], jRows, userParam);
        jOp.rows = opRows;

        jOperations.push(jOp);

    }

    return jOperations;

}

/**
 * Get the list of every transactions' id
 * @param {*} jRows the journal rows
 * @returns 
 */
function getIdList(jRows) {
    var opIdList = [];
    var id = "";

    for (var row in jRows) {
        if (jRows[row].id !== id) {
            opIdList.push(jRows[row].id);
            id = jRows[row].id;
        }
    }
    return opIdList;
}

/**
 * Creates an object containing the v of the operation, this values shared by each record line:
 * For example the Date, the transactions type or the operation number.
 * @param {*} id the operation id
 * @param {*} jRows journal rows
 * @returns 
 */
function setOperationData(id, jRows) {
    var jOp = {};
    for (var row in jRows) {
        if (jRows[row].id == id) {
            jOp.id = jRows[row].id;
            jOp.date = jRows[row].jDate;
            jOp.type = jRows[row].jOperationType;
            jOp.doc = jRows[row].trDoc;
            return jOp;
        }
    }

}

/**
 * Creates an object containing the information of the operation, these values are different for each line of the operation.
 * For Example the account or the debit and credit that changes for each record line in the operation
 * @param {*} id the operation id
 * @param {*} jRows journal rows
 * @returns 
 */
function setOperationData_rows(id, jRows, userParam) {
    var rows = [];
    var prDescription = "";

    for (var row in jRows) {
        if (jRows[row].id == id) {
            var trRow = {};
            //we do not repeat the description if is the same, as in the journal for each line of the same operation, the same description is repeated
            if (jRows[row].trDescription !== prDescription)
                trRow.description = jRows[row].trDescription;
            trRow.account = jRows[row].jAccount;
            trRow.debitAmount = jRows[row].jDebitAmount;
            trRow.creditAmount = jRows[row].jCreditAmount;
            trRow.amount = jRows[row].JAmount;
            for (var j = 0; j < userParam.journal.xmlColumnsName.length; j++) {
                var index = userParam.journal.xmlColumnsName[j];
                trRow[index] = jRows[row][userParam.journal.xmlColumnsName[j]];
            }
            rows.push(trRow);

            prDescription = jRows[row].trDescription;
        }
    }

    return rows;
}

/**
 * Check if the description is the same
 * @param {*} newDescr 
 * @param {*} oldDescr 
 * @returns 
 */
function checkIfSameDescription(newDescr, oldDescr) {
    var sameDescr = false;

    if (newDescr == oldDescr)
        sameDescr = true;

    return sameDescr;
}


//Function that adds a Footer to the report
function addFooter(report) {
    var date = new Date();
    var d = Banana.Converter.toLocaleDateFormat(date);
    report.getFooter().addClass("footerStyle");
    var versionLine = report.getFooter().addText(d + " - Journal - Page ", "description").excludeFromTest();
    report.getFooter().addFieldPageNr();
}

function addHeader(report, banDoc,startDate,endDate) {
    docInfo = getDocumentInfo(banDoc);

    //initialize values
    company="";
    address="";
    zip="";
    city="";
    vatNumber="";

    //give them a value, if it is present
    if(docInfo.company)
        company=docInfo.company;
    if(docInfo.address)
        address=docInfo.address;
    if(docInfo.zip)
        zip=docInfo.zip;
    if(docInfo.city)
        city=docInfo.city;
    if(docInfo.vatNumber)
        vatNumber=docInfo.vatNumber;

    var headerParagraph = report.getHeader().addSection("headerStyle");
    headerParagraph.addParagraph("Journal", "heading1");
    headerParagraph.addParagraph("", "");
    headerParagraph.addParagraph(company, "");
    headerParagraph.addParagraph(address, "");
    headerParagraph.addParagraph(zip + " " + city, "");
    headerParagraph.addParagraph(vatNumber, "");
    headerParagraph.addParagraph("Period " + Banana.Converter.toLocaleDateFormat(startDate) + " - " + Banana.Converter.toLocaleDateFormat(endDate));
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


    if (banDoc) {
        if (banDoc.info("AccountingDataBase", "Company"));
        documentInfo.company = banDoc.info("AccountingDataBase", "Company");
        if (banDoc.info("AccountingDataBase", "Address1"))
            documentInfo.address = banDoc.info("AccountingDataBase", "Address1");
        if (banDoc.info("AccountingDataBase", "Zip"))
            documentInfo.zip = banDoc.info("AccountingDataBase", "Zip");
        if (banDoc.info("AccountingDataBase", "City"))
            documentInfo.city = banDoc.info("AccountingDataBase", "City");
        if (banDoc.info("AccountingDataBase", "VatNumber"))
            documentInfo.vatNumber = banDoc.info("AccountingDataBase", "VatNumber");
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
    var data = banDoc.getScriptSettings();

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
        var value = banDoc.setScriptSettings(formToString);
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

/**
 * Check if the total debit and credit are equals, otherwise rise an an error message
 * @param {*} sumDebit 
 * @param {*} sumCredit 
 */
function checkDebitCredit(sumDebit, sumCredit, banDoc) {
    var lan = getLang(banDoc);
    var msg = getErrorMessage(DEBIT_CREDIT_DIFFERENTS, "");
    if (sumDebit != sumCredit) {
        banDoc.addMessage(msg, DEBIT_CREDIT_DIFFERENTS);
    }
}

function getLang(banDoc) {
    var lang = 'en';
    if (banDoc)
        lang = banDoc.locale;
    else if (Banana.application.locale)
        lang = Banana.application.locale;
    if (lang.length > 2)
        lang = lang.substring(0, 2);
    return lang;
}