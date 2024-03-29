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
// @description = VAT Journal
// @task = app.command
// @doctype = 100.*
// @docproperties =
// @outputformat = none
// @inputdatasource = none
// @timeout = -1
// @includejs= ch.banana.audit.settings.js


//Main function
function exec(string) {

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

    //Print the report
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
    if (userParam.vatJournal.xmlColumnsName)
        userParam.vatJournal.xmlColumnsName = userParam.vatJournal.xmlColumnsName.split(";");

    return userParam;
}

function getVatJournalTable(report, userParam) {
    var vatJournalTable = report.addTable('journalTable');
    //columns
    vatJournalTable.addColumn("Date").setStyleAttributes("width:10%", "tableHeaders");
    vatJournalTable.addColumn("Doc").setStyleAttributes("width:10%", "tableHeaders");
    vatJournalTable.addColumn("Description").setStyleAttributes("width:50%", "tableHeaders");
    vatJournalTable.addColumn("Vat Code").setStyleAttributes("width:15%", "tableHeaders");
    vatJournalTable.addColumn("Debit").setStyleAttributes("width:15%", "tableHeaders");
    vatJournalTable.addColumn("Credit").setStyleAttributes("width:15%", "tableHeaders");
    vatJournalTable.addColumn("Vat Taxable").setStyleAttributes("width:15%", "tableHeaders");
    vatJournalTable.addColumn("Vat Amount").setStyleAttributes("width:15%", "tableHeaders");
    //add the additional columns inserted by the user in the settings dialog
    for (var i = 0; i < userParam.vatJournal.xmlColumnsName.length; i++) {
        vatJournalTable.addColumn(userParam.vatJournal.xmlColumnsName[i]).setStyleAttributes("width:15%", "tableHeaders");
    }

    //header
    var tableHeader = vatJournalTable.getHeader();
    var tableRow = tableHeader.addRow();
    tableRow.addCell("Date", "tableHeaders");
    tableRow.addCell("Doc", "tableHeaders");
    tableRow.addCell("Description", "tableHeaders"); //description of the vat code 
    tableRow.addCell("Vat Code", "tableHeaders");
    tableRow.addCell("Debit", "tableHeaders");
    tableRow.addCell("Credit", "tableHeaders");
    tableRow.addCell("Vat Taxable", "tableHeaders");
    tableRow.addCell("Vat Amount", "tableHeaders");
    //add the additional columns inserted by the user in the settings dialog
    for (var i = 0; i < userParam.vatJournal.xmlColumnsName.length; i++) {
        tableRow.addCell(userParam.vatJournal.xmlColumnsName[i], "tableHeaders");
    }

    return vatJournalTable;
}


//Function that creates and prints the report
function printReport(startDate, endDate, userParam, banDoc) {

    //Add a name to the report
    var report = Banana.Report.newReport("Vat Journal");

    //Add a title
    addHeader(report,banDoc,startDate, endDate);

    //Create a table for the report
    var table = getVatJournalTable(report, userParam);

    // Print the Journal
    printJournal(table, startDate, endDate, userParam, banDoc);

    //Add a footer to the report
    addFooter(report);

    return report;
}

function printJournal(table, startDate, endDate, userParam, banDoc) {

    var journalOp = getJournalOperations(startDate, endDate, userParam, banDoc);
    var sumVatAmount = "";
        //get the span for the empty rows.
        var span=6;
        span=span+userParam.vatJournal.xmlColumnsName.length;

    for (var op in journalOp) {
        var operation = journalOp[op];
        var firstRow = true; //to fix with a better method

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
            tableRow.addCell(opRow.vatCode, "centredStyle");
            tableRow.addCell(Banana.Converter.toLocaleNumberFormat(opRow.debitAmount, "2", false), "amountStyle");
            tableRow.addCell(Banana.Converter.toLocaleNumberFormat(opRow.creditAmount, "2", false), "amountStyle");
            tableRow.addCell(Banana.Converter.toLocaleNumberFormat(opRow.vatTaxable, "2", false), "amountStyle");
            tableRow.addCell(Banana.Converter.toLocaleNumberFormat(opRow.vatAmount, "2", false), "amountStyle");
            sumVatAmount = Banana.SDecimal.add(sumVatAmount, opRow.vatAmount);
            for (var i = 0; i < userParam.vatJournal.xmlColumnsName.length; i++) {
                tableRow.addCell(opRow[userParam.vatJournal.xmlColumnsName[i]], "centredStyle");
            }

            firstRow = false;
        }
    }

    //add totals
    tableRow = table.addRow();
    tableRow.addCell("Total", "sumStyle");
    tableRow.addCell("", "", 6);
    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(sumVatAmount, "2", false), "sumStyle");


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
        if (tRow.value('JOperationType') == banDoc.OPERATIONTYPE_TRANSACTION &&
            dateWithinTheRange(tRow.value('JDate'), startDate, endDate) &&
            tRow.value('JVatIsVatOperation')) {
            var trRow = {};
            trRow.id = tRow.value('JContraAccountGroup');
            trRow.jDate = tRow.value('JDate');
            trRow.jOperationType = tRow.value('JOperationType'); //0=OPERATIONTYPE_NONE,1=OPERATIONTYPE_OPENING,2=OPERATIONTYPE_CARRYFORWARD,3=OPERATIONTYPE_TRANSACTION, 21=OPERATIONTYPE_INVOICESETTLEMENT
            trRow.trDoc = tRow.value('Doc');
            trRow.vatDescription = tRow.value('JVatCodeDescription');
            trRow.vatCode = tRow.value('JVatCodeWithoutSign');
            trRow.jDebitAmount = tRow.value('JDebitAmount');
            trRow.jCreditAmount = tRow.value('JCreditAmount');
            trRow.jVatTaxable = tRow.value('JVatTaxable');
            trRow.jVatAmount = tRow.value('JAmount');//correspond to vatAmount
            //we save also the values of additional columns
            for (var j = 0; j < userParam.vatJournal.xmlColumnsName.length; j++) {
                var index = userParam.vatJournal.xmlColumnsName[j];
                trRow[index] = tRow.value(userParam.vatJournal.xmlColumnsName[j]);
            }

            if (trRow)
                journalRows.push(trRow);
        }
    }

    //Banana.Ui.showText(JSON.stringify(journalRows));
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

function getJournalOperations(startDate, endDate, userParam, banDoc) {
    //if (tRow.value('JContraAccountGroup') !== previous_contraAccountGroup) {
    var jRows = getJournalRows(startDate, endDate, userParam, banDoc);
    var jOperations = [];

    /**
     * Structure example:
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

    for (var row in jRows) {
        if (jRows[row].id == id) {
            var trRow = {};
            trRow.description = jRows[row].vatDescription;
            trRow.vatCode = jRows[row].vatCode;
            trRow.debitAmount = jRows[row].jDebitAmount;
            trRow.creditAmount = jRows[row].jCreditAmount;
            trRow.vatTaxable = jRows[row].jVatTaxable;
            trRow.vatAmount = jRows[row].jVatAmount;
            for (var j = 0; j < userParam.vatJournal.xmlColumnsName.length; j++) {
                var index = userParam.vatJournal.xmlColumnsName[j];
                trRow[index] = jRows[row][userParam.vatJournal.xmlColumnsName[j]];
            }
            rows.push(trRow);

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
    headerParagraph.addParagraph("VAT Journal", "heading1");
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
    var data = Banana.document.getScriptSettings();

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
        var value = Banana.document.setScriptSettings(formToString);
    } else {
        //User clicked cancel
        return;
    }
    return scriptform;
}