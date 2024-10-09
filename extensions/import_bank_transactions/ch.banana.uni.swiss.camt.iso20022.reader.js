// Copyright [2024] [Banana.ch SA - Lugano Switzerland]
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//  http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// @api = 1.0
// @id = ch.banana.uni.swiss.camt.iso20022.reader
// @description = Swiss Camt ISO20022 Reader
// @task = app.command
// @publisher = Banana.ch SA
// @pubdate = 2024-10-09
// @inputdatasource = none
// @doctype = *
// @docproperties =
// @inputencoding = utf-8
// @timeout = -1
// @visibility = never
// @includejs = src/csv_import_extensions/postfinance_sync_csv/ch.banana.sync.postfinance.js

/**
* This extension receives the contents of a file from Banana and checks what type of file it is
 * according to those defined for the synchronisation of accounting with bank data.
 * If the file is found to be valid, then it returns the file data in JSON format with the following structure:
 * {
 * - File Name
 * - File Params
 * - File Rows (Actual transactions)
 * }
 * Depending on the file format, this extension will call specific data conversion classes.
 */

const CSV_FILE_SUFFIX = "csv";
const XML_FILE_SUFFIX = "xml";
const TXT_FILE_SUFFIX = "txt";

/**
 * Main function.
 * Takes as parameter the content of a file, the content is given as a string.
 * @param {*} fileContent 
 * @returns 
 */
function exec(fileContent, fileId, filePath, fileName, fileDateTime, fileSuffix, isTest) {

    if (!fileContent)
        return;

    switch (fileSuffix.toLowerCase()) {
        case CSV_FILE_SUFFIX:
            return processCsvFile(fileId, filePath, fileName, fileDateTime, fileContent);
        case XML_FILE_SUFFIX:
            return processXmlFile(fileId, filePath, fileDateTime, fileContent, isTest);
        case TXT_FILE_SUFFIX:
            return processTxtFile(fileId, filePath, fileName, fileDateTime, fileContent);
        default:
            return "";
    }
}

function processXmlFile(fileId, filePath, fileDateTime, fileContent, isTest) {
    let iso20022_swiss = new ISO20022_Swiss_JSONConverter();
    if (iso20022_swiss.match(fileContent, isTest)) {
        //Banana.console.debug("match swiss format: " + filePath);
        let jsonData = iso20022_swiss.convertToJson(fileContent, fileId, filePath, fileDateTime);
        if (jsonData) {
            return jsonData;
        }
    }

    let iso20022_universal = new ISO20022_Universal_JSONConverter();
    if (iso20022_universal.match(fileContent, isTest)) {
        //Banana.console.debug("match universal format: " + filePath);
        let jsonData = iso20022_universal.convertToJson(fileContent, fileId, filePath, fileDateTime);
        if (jsonData) {
            return jsonData;
        }
    }

    let json_thinker = new JSON_Thinker_JSONConverter();
    if (json_thinker.match(fileContent)) {
        let jsonData = json_thinker.convertToJson(fileContent, fileId, filePath, fileDateTime);
        if (jsonData) {
            return jsonData;
        }
    }
}

function processTxtFile(fileId, filePath, fileName, fileContent) {
    //for the JSON format data...?
}

function processCsvFile(fileId, filePath, fileName, fileDateTime, fileContent) {

    /**
     * Each csv file must begin with a specific prefix (bank name) --> bank_name_*.csv (all in lower case), e.g:
     * postfinance_money.csv
     * With each prefix we have associated an extension that will be called upon to read the data from the file.
     */
    //Get the prefix
    let jsonData = {};
    let csv_jsonConverter = new CSV_JSONConverter(fileId, fileName, filePath, fileDateTime, fileContent);
    if (csv_jsonConverter.match()) {
        jsonData = csv_jsonConverter.convertToJson_fromCsv();
    }
    return jsonData;
}

var CSV_JSONConverter = class CSV_JSONConverter {
    constructor(fileId, fileName, filePath, fileDateTime, fileContent) {
        this.fileId = fileId;
        this.fileName = fileName;
        this.filePath = filePath;
        this.fileDateTime = fileDateTime;
        this.fileContent = fileContent;
        let elements = fileName.split("_");
        this.filePrefix = elements.shift();
        this.banksList = getCsvBanksList();
    }

    /**
     * Check if we have the extension in our list.
     */
    match() {
        if (this.filePrefix.length > 0 && this.filePrefix in this.banksList) {
            return true;
        }
    }

    convertToJson_fromCsv() {
        let jsonDoc = {};
        let fileParams = {};
        fileParams = this.readFileParams();
        this.setData(jsonDoc, fileParams);
        return jsonDoc;
    }

    readFileParams() {
        let id = this.fileId;
        let name = this.filePath;
        let type = "CSV";

        let fileParams = {};

        fileParams.FileId = id;
        fileParams.FileName = name;
        fileParams.FileType = type;
        fileParams.FileSchema = "" //Only for camt files
        fileParams.FileCreationDate = this.fileDateTime;

        return fileParams;
    }

    setData(jsonDoc, fileParams) {
        jsonDoc.TransactionsList = [];
        let fileStatementData = [];
        /**
        * "eval()" method could execute any javascript code, is important to not
        * use this method in situations where the string comes from an uncontrolled source.
        * Thats why use "Object.freeze()" once we have defined the extensions list of the banks (and the related data) we want
        * to work with.
        */
        let scriptSyncUtilities = eval(`new ${this.banksList[this.filePrefix].referenceClass}`);
        if (typeof scriptSyncUtilities.getStatementData === 'function') {//check if class intance is valid.
            fileStatementData = scriptSyncUtilities.getStatementData(this.fileContent, fileParams);
            if (fileStatementData.length < 0)
                Banana.console.debug("csv format not recognised: " + this.fileName);
        }

        jsonDoc.TransactionsList = fileStatementData;
    }
}

/**
 * This class takes the data from a file ISO 20022 Camt052/53/54 with Swiss specifics
 * and returns a JSON with the file data.
 */
var ISO20022_Swiss_JSONConverter = class ISO20022_Swiss_JSONConverter {
    constructor() {
        this.camtType = "";
        this.schema = "";
        this.schemaNr = "";
        // Base schemes 04.version
        this.schemaFileName_05204 = "src/camt_schemes/ch/schema_04/camt.052.001.04.xsd";
        this.schemaFileName_05304 = "src/camt_schemes/ch/schema_04/camt.053.001.04.xsd";
        this.schemaFileName_05404 = "src/camt_schemes/ch/schema_04/camt.054.001.04.xsd";
        // Base schemes 08.version
        this.schemaFileName_05208 = "src/camt_schemes/ch/schema_08/camt.052.001.08.xsd";
        this.schemaFileName_05308 = "src/camt_schemes/ch/schema_08/camt.053.001.08.xsd";
        this.schemaFileName_05408 = "src/camt_schemes/ch/schema_08/camt.054.001.08.xsd";
    }

    /**
     * Check if the file is a ISO20022 Camt 052/053/054 with Swiss specifics.
     * @param {*} fileContent 
     */
    match(fileContent, isTest) {
        let xmlDoc = Banana.Xml.parse(fileContent);
        if (!xmlDoc)
            return false;

        /** We do not do pattern validation during tests for convenience, 
        * otherwise an alternative relative path to the patterns would 
        * have to be defined in the tests. We use already validated schemes in the tests */

        let docNode = xmlDoc.firstChildElement(); // 'Document'
        this.schema = docNode.attribute('xmlns');
        this.schemaNr = extractSchemaNumber(this.schema);
        if (this.schema.indexOf('camt.052') >= 0) {         // Check for CAMT.052
            this.camtType = "CAMT.052";
            let isValid = this.isValidCamt052Schema(xmlDoc, isTest);
            return isValid;
        } else if (this.schema.indexOf('camt.053') >= 0) { // Check for CAMT.053
            this.camtType = "CAMT.053";
            let isValid = this.isValidCamt053Schema(xmlDoc, isTest);
            return isValid;
        } else if (this.schema.indexOf('camt.054') >= 0) { // Check for CAMT.054
            this.camtType = "CAMT.054";
            let isValid = this.isValidCamt054Schema(xmlDoc, isTest);
            return isValid;
        } else {
            return false;
        }
    }

    /** This function tests wether the xml stucture is valid */
    isValidCamt052Schema(xmlDoc, isTest) {
        /** we do not perform validation during test*/
        if (isTest)
            return true;
        if (Banana.Xml.validate(xmlDoc, this.schemaFileName_05204)) // Check old schema.
            return true;
        if (Banana.Xml.validate(xmlDoc, this.schemaFileName_05208)) // Check new schema
            return true;
        return false;
    }

    isValidCamt053Schema(xmlDoc, isTest) {
        if (isTest)
            return true;
        if (Banana.Xml.validate(xmlDoc, this.schemaFileName_05304)) // Check old schema.
            return true;
        if (Banana.Xml.validate(xmlDoc, this.schemaFileName_05308)) // Check new schema
            return true;
        return false;
    }

    isValidCamt054Schema(xmlDoc, isTest) {
        if (isTest)
            return true;
        if (Banana.Xml.validate(xmlDoc, this.schemaFileName_05404)) // Check old schema.
            return true;
        if (Banana.Xml.validate(xmlDoc, this.schemaFileName_05408)) // Check new schema
            return true;
        return false;
    }

    convertToJson(fileContent, fileId, filePath, fileDateTime) {
        let xmlDoc = Banana.Xml.parse(fileContent);
        let docNode = xmlDoc.firstChildElement(); // Document
        if (!docNode)
            return xmlTransactions
        switch (this.camtType) {
            case "CAMT.052":
                return this.convertToJson_fromCamt052(docNode, fileId, filePath, fileDateTime);
            case "CAMT.053":
                return this.convertToJson_fromCamt053(docNode, fileId, filePath, fileDateTime);
            case "CAMT.054":
                return this.convertToJson_fromCamt054(docNode, fileId, filePath, fileDateTime);
            default:
                return jsonDoc;
        }
    }

    convertToJson_fromCamt052(docNode, fileId, filePath, fileDateTime) {
        let jsonDoc = {};
        jsonDoc.version = "1.0";
        let fileParams = {};
        fileParams = this.readFileParams(docNode, fileId, filePath, fileDateTime);
        let statementsNode = this.getStatementsNode_camt052(docNode);
        this.setData(statementsNode, jsonDoc, fileParams);
        return jsonDoc;
    }
    convertToJson_fromCamt053(docNode, fileId, filePath, fileDateTime) {
        let jsonDoc = {};
        jsonDoc.version = "1.0";
        let fileParams = {};
        fileParams = this.readFileParams(docNode, fileId, filePath, fileDateTime);
        let statementsNode = this.getStatementsNode_camt053(docNode);
        this.setData(statementsNode, jsonDoc, fileParams);
        return jsonDoc;

    }
    convertToJson_fromCamt054(docNode, fileId, filePath, fileDateTime) {
        let jsonDoc = {};
        jsonDoc.version = "1.0";
        let fileParams = {};
        fileParams = this.readFileParams(docNode, fileId, filePath, fileDateTime);
        let statementsNode = this.getStatementsNode_camt054(docNode);
        this.setData(statementsNode, jsonDoc, fileParams);
        return jsonDoc;
    }

    getStatementsNode_camt052(docNode) {
        let statementsNode = [];
        let statementNode = firstGrandChildElement(docNode, ['BkToCstmrAcctRpt', 'Rpt']);
        while (statementNode) {
            statementsNode.push(statementNode)
            statementNode = statementNode.nextSiblingElement('Rpt');
        }

        return statementsNode;
    }

    getStatementsNode_camt053(docNode) {
        let statementsNode = [];
        let statementNode = firstGrandChildElement(docNode, ['BkToCstmrStmt', 'Stmt']);
        while (statementNode) {
            statementsNode.push(statementNode)
            statementNode = statementNode.nextSiblingElement('Stmt');
        }

        return statementsNode;
    }

    getStatementsNode_camt054(docNode) {
        let statementsNode = [];
        let statementNode = firstGrandChildElement(docNode, ['BkToCstmrDbtCdtNtfctn', 'Ntfctn']);
        while (statementNode) {
            statementsNode.push(statementNode)
            statementNode = statementNode.nextSiblingElement('Ntfctn');
        }

        return statementsNode;
    }

    /**
     * Saves the file data into a json object: jsonDoc
     * @param {*} jsonDoc 
     * @param {*} filePath 
     */
    readFileParams(docNode, fileId, filePath, fileDateTime) {
        /**
         * The data we want to save:
         * - File Name (Path)
         * - File Type
         * - Creation Date
         */

        let fileParams = {};

        let id = fileId;
        let name = filePath;
        let type = this.camtType;
        let creationDate = fileDateTime;

        fileParams.FileId = id;
        fileParams.FileName = name;
        fileParams.FileType = type;
        fileParams.FileSchema = this.schemaNr;
        fileParams.FileCreationDate = creationDate;

        return fileParams;
    }

    /**
     * Saves the statement parameters into a json object.
     * @param {*} fileContent 
     */
    readStatementParams(statementNode) {
        /**
         * The data we want to save:
         * - IBAN
         * - Statement owner
         * - Initial balance
         * - Final balance
         */

        let statementParams = {};

        let iban = this.getStatementIban(statementNode);
        let id = this.getStatementId(statementNode); // Sobstitute to the IBAN, we use this only if the IBAN is not present.
        let statementCreationDate = this.getStatementCreationDate(statementNode)
        let statementOwner = this.getStatementOwner(statementNode);
        let statementCurrency = this.getStatementCurrency(statementNode);
        let initialBalance = this.getStatementBeginBalance(statementNode);
        let finalBalance = this.getStatementEndBalance(statementNode);

        statementParams.StatementIban = iban == "" ? id : iban;
        statementParams.StatementCreationDate = statementCreationDate;
        statementParams.StatementOwner = statementOwner;
        statementParams.StatementCurrency = statementCurrency;
        statementParams.StatementInitialBalance = initialBalance;
        statementParams.StatementFinalBalance = finalBalance;

        return statementParams;

    }

    /**
     * Read the transactions in the file and returns an array of objects.
     * works with the V2 of the json structure, sobstitutes "setStatementData()".
     * For each transaction we set also the fileParams and the statementParams.
     */
    setData(statementsNode, jsonDoc, fileParams) {
        let trData = [];
        if (statementsNode.length >= 0) {
            /** We have to get the data for each statement, wich could have a different account (IBAN) */
            for (let i = 0; i < statementsNode.length; i++) {
                let statementParams = {};
                statementParams = this.readStatementParams(statementsNode[i]);
                let entryNode = statementsNode[i].firstChildElement('Ntry');
                while (entryNode) { // concat each statement array to have one general
                    trData = trData.concat((this.readStatementEntry(entryNode, fileParams, statementParams)));
                    entryNode = entryNode.nextSiblingElement('Ntry'); // next account movement
                }
            }
        }
        jsonDoc.TransactionsList = trData;
    }

    readStatementEntry(entryNode, fileParams, statementParams) {
        let transaction = null;
        let transactions = [];

        let entryBookingDate = entryNode.hasChildElements('BookgDt') ? entryNode.firstChildElement('BookgDt').text.substr(0, 10) : '';
        let entryValutaDate = entryNode.hasChildElements('ValDt') ? entryNode.firstChildElement('ValDt').text.substr(0, 10) : '';
        let entryIsCredit = entryNode.firstChildElement('CdtDbtInd').text === 'CRDT';
        let entryAmount = entryNode.firstChildElement('Amt').text;
        let entryDescription = entryNode.hasChildElements('AddtlNtryInf') ? entryNode.firstChildElement('AddtlNtryInf').text : '';
        let entryTexts = entryBookingDate + entryValutaDate + entryAmount + entryDescription;
        let entryExternalReference = entryNode.hasChildElements('AcctSvcrRef') && entryNode.firstChildElement('AcctSvcrRef').text.length >= 0 ?
            entryNode.firstChildElement('AcctSvcrRef').text : getHash(entryTexts, statementParams);

        if (entryNode.hasChildElements('NtryDtls')) {
            let detailsNode = entryNode.firstChildElement('NtryDtls');
            while (detailsNode) {
                // Count text elements
                let txDtlsCount = 0;
                let textDetailsNode = detailsNode.firstChildElement('TxDtls');
                while (textDetailsNode) {
                    txDtlsCount++;
                    textDetailsNode = textDetailsNode.nextSiblingElement('TxDtls'); // next movement detail
                }

                let entryDetailsBatchMsgId = this.readStatementEntryDetailsMatchMsgId(detailsNode);

                if (txDtlsCount > 1) {
                    // Insert counterpart transaction
                    transaction = {
                        'FileId': fileParams.FileId,
                        'FileName': fileParams.FileName,
                        'FileType': fileParams.FileType,
                        'FileSchema': fileParams.FileSchema,
                        'FileCreationDate': fileParams.FileCreationDate,
                        'StatementIban': statementParams.StatementIban,
                        'StatementCreationDate': statementParams.StatementCreationDate,
                        'StatementOwner': statementParams.StatementOwner,
                        'StatementCurrency': statementParams.StatementCurrency,
                        'StatementInitialBalance': statementParams.StatementInitialBalance,
                        'StatementFinalBalance': statementParams.StatementFinalBalance,
                        'TransactionDate': entryBookingDate,
                        'TransactionDateValue': entryValutaDate,
                        'TransactionDocInvoice': '',
                        'TransactionDescription': this.joinNotEmpty([entryDescription, entryDetailsBatchMsgId], " / "),
                        'TransactionIncome': entryIsCredit ? entryAmount : '',
                        'TransactionExpenses': entryIsCredit ? '' : entryAmount,
                        'TransactionExternalReference': entryExternalReference,
                        'TransactionIsDetail': 'S'
                    };
                    transactions.push(transaction);
                }

                // Text elements (Details transactions)
                if (detailsNode.hasChildElements('TxDtls')) {
                    textDetailsNode = detailsNode.firstChildElement('TxDtls');
                    while (textDetailsNode) {
                        let cdtDbtIndNode = textDetailsNode.firstChildElement('CdtDbtInd');
                        let deatailsIsCredit = cdtDbtIndNode && cdtDbtIndNode.text === 'CRDT' ? true : entryIsCredit;
                        let deatailAmount = this.readStatementEntryDetailsAmount(textDetailsNode);
                        let acctSvcrRefNode = firstGrandChildElement(textDetailsNode, ['Refs', 'AcctSvcrRef']);
                        let instrIdNode = firstGrandChildElement(textDetailsNode, ['Refs', 'InstrId']);
                        // Build description
                        let detailDescription = this.readStatementEntryDetailsDescription(textDetailsNode, deatailsIsCredit);
                        if (detailDescription.length === 0 && instrIdNode)
                            detailDescription = instrIdNode.text;
                        // Set External reference
                        let entryDetailTexts = entryBookingDate + entryValutaDate + deatailAmount + detailDescription;
                        let detailExternalReference = acctSvcrRefNode && acctSvcrRefNode.text.length >= 0 ? acctSvcrRefNode.text : getHash(entryDetailTexts, statementParams);

                        //let invoiceNumber = this.extractInvoiceNumber(detailEsrReference); // Da valutare.

                        if (txDtlsCount === 1) {
                            deatailAmount = entryAmount;
                            detailExternalReference = entryExternalReference;
                            detailDescription = this.joinNotEmpty([detailDescription, entryDetailsBatchMsgId, entryDescription], ' / ');
                        }

                        transaction = {
                            'FileId': fileParams.FileId,
                            'FileName': fileParams.FileName,
                            'FileType': fileParams.FileType,
                            'FileSchema': fileParams.FileSchema,
                            'FileCreationDate': fileParams.FileCreationDate,
                            'StatementIban': statementParams.StatementIban,
                            'StatementCreationDate': statementParams.StatementCreationDate,
                            'StatementOwner': statementParams.StatementOwner,
                            'StatementCurrency': statementParams.StatementCurrency,
                            'StatementInitialBalance': statementParams.StatementInitialBalance,
                            'StatementFinalBalance': statementParams.StatementFinalBalance,
                            'TransactionDate': entryBookingDate,
                            'TransactionDateValue': entryValutaDate,
                            //'DocInvoice': invoiceNumber,
                            'TransactionDescription': detailDescription,
                            'TransactionIncome': deatailsIsCredit ? deatailAmount : '',
                            'TransactionExpenses': deatailsIsCredit ? '' : deatailAmount,
                            'TransactionExternalReference': detailExternalReference,
                            'TransactionContraAccount': '',
                            'TransactionCc1': '',
                            'TransactionCc2': '',
                            'TransactionCc3': '',
                            'TransactionIsDetail': txDtlsCount > 1 ? 'D' : ''
                        };

                        /*if (this.params.customer_no && this.params.customer_no.extract) { // Set customer number
                            let customerNumber = this.extractCustomerNumber(detailEsrReference);
                            let ccPrefix = deatailsIsCredit ? '-' : '';
                            if (this.params.customer_no.use_cc && this.params.customer_no.use_cc.trim().toUpperCase() === 'CC1') {
                                if (customerNumber)
                                    transaction.Cc1 = ccPrefix + customerNumber;
                            } else if (this.params.customer_no.use_cc && this.params.customer_no.use_cc.trim().toUpperCase() === 'CC2') {
                                if (customerNumber)
                                    transaction.Cc2 = ccPrefix + customerNumber;
                            } else if (this.params.customer_no.use_cc && this.params.customer_no.use_cc.trim().toUpperCase() === 'CC3') {
                                if (customerNumber)
                                    transaction.Cc3 = ccPrefix + customerNumber;
                            } else {
                                transaction.ContraAccount = customerNumber;
                            }
                        }*/

                        transactions.push(transaction);
                        txDtlsCount++;

                        textDetailsNode = textDetailsNode.nextSiblingElement('TxDtls'); // next movement detail
                    }
                } else { // No entry text details elements
                    transaction = {
                        'FileId': fileParams.FileId,
                        'FileName': fileParams.FileName,
                        'FileType': fileParams.FileType,
                        'FileSchema': fileParams.FileSchema,
                        'FileCreationDate': fileParams.FileCreationDate,
                        'StatementIban': statementParams.StatementIban,
                        'StatementCreationDate': statementParams.StatementCreationDate,
                        'StatementOwner': statementParams.StatementOwner,
                        'StatementCurrency': statementParams.StatementCurrency,
                        'StatementInitialBalance': statementParams.StatementInitialBalance,
                        'StatementFinalBalance': statementParams.StatementFinalBalance,
                        'TransactionDate': entryBookingDate,
                        'TransactionDateValue': entryValutaDate,
                        'TransactionDocInvoice': '',
                        'TransactionDescription': this.joinNotEmpty([entryDescription, entryDetailsBatchMsgId], " / "),
                        'TransactionIncome': entryIsCredit ? entryAmount : '',
                        'TransactionExpenses': entryIsCredit ? '' : entryAmount,
                        'TransactionExternalReference': entryExternalReference,
                        'TransactionContraAccount': '',
                        'TransactionCc1': '',
                        'TransactionCc2': '',
                        'TransactionCc3': '',
                        'TransactionIsDetail': ''
                    };
                    transactions.push(transaction);

                }

                detailsNode = detailsNode.nextSiblingElement('NtryDtls'); // next movement detail
            }

        } else { // No entry details
            transaction = {
                'FileId': fileParams.FileId,
                'FileName': fileParams.FileName,
                'FileType': fileParams.FileType,
                'FileSchema': fileParams.FileSchema,
                'FileCreationDate': fileParams.FileCreationDate,
                'StatementIban': statementParams.StatementIban,
                'StatementCreationDate': statementParams.StatementCreationDate,
                'StatementOwner': statementParams.StatementOwner,
                'StatementCurrency': statementParams.StatementCurrency,
                'StatementInitialBalance': statementParams.StatementInitialBalance,
                'StatementFinalBalance': statementParams.StatementFinalBalance,
                'TransactionDate': entryBookingDate,
                'TransactionDateValue': entryValutaDate,
                'TransactionDocInvoice': '',
                'TransactionDescription': entryDescription,
                'TransactionIncome': entryIsCredit ? entryAmount : '',
                'TransactionExpenses': entryIsCredit ? '' : entryAmount,
                'TransactionExternalReference': entryExternalReference,
                'TransactionContraAccount': '',
                'TransactionCc1': '',
                'TransactionCc2': '',
                'TransactionCc3': '',
                'TransactionIsDetail': ''
            };
            transactions.push(transaction);

        }

        return transactions;
    }

    getStatementEndBalance(statementNode) {
        if (!statementNode)
            return '';

        var balNode = statementNode.firstChildElement('Bal');
        while (balNode) {
            var tpNode = balNode.firstChildElement('Tp');
            if (tpNode) {
                var cdOrPrtryNode = tpNode.firstChildElement('CdOrPrtry');
                if (cdOrPrtryNode && (cdOrPrtryNode.text === 'CLBD' || cdOrPrtryNode.text === 'CLAV')) {
                    var amtNode = balNode.firstChildElement('Amt');
                    if (amtNode) {
                        var amount = amtNode.text;
                        if (balNode.hasChildElements('CdtDbtInd') && balNode.hasChildElements('CdtDbtInd').text === 'DBIT') {
                            amount = Banana.SDecimal.invert(amount);
                        }
                        return amount;
                    }
                }
            }
            balNode = balNode.nextSiblingElement();
        }
        return '';
    }

    getStatementBeginBalance(statementNode) {
        if (!statementNode)
            return '';

        var balNode = statementNode.firstChildElement('Bal');
        while (balNode) {
            var tpNode = balNode.firstChildElement('Tp');
            if (tpNode) {
                var cdOrPrtryNode = tpNode.firstChildElement('CdOrPrtry');
                if (cdOrPrtryNode && cdOrPrtryNode.text === 'OPBD') {
                    var amtNode = balNode.firstChildElement('Amt');
                    if (amtNode) {
                        var amount = amtNode.text;
                        if (balNode.hasChildElements('CdtDbtInd') && balNode.hasChildElements('CdtDbtInd').text === 'DBIT') {
                            amount = Banana.SDecimal.invert(amount);
                        }
                        return amount;
                    }
                }
            }
            balNode = balNode.nextSiblingElement();
        }
        return '';
    }

    formatDate(dateString) {
        let date = new Date(dateString);

        //Get the date.
        let year = date.getFullYear();
        let month = (date.getMonth() + 1).toString().padStart(2, '0');
        let day = date.getDate().toString().padStart(2, '0');
        let formattedDate = year + "-" + month + "-" + day;
        // Get also the time... ?

        return formattedDate;
    }

    getStatementCurrency(statementNode) {
        let node = firstGrandChildElement(statementNode, ['Acct', 'Ccy']);
        if (node)
            return node.text;
        return '';
    }

    getStatementOwner(statementNode) {
        let node = firstGrandChildElement(statementNode, ['Acct', 'Ownr', 'Nm']);
        if (node)
            return node.text;
        return '';
    }

    getStatementIban(statementNode) {
        let node = firstGrandChildElement(statementNode, ['Acct', 'Id', 'IBAN']);
        if (node)
            return node.text;
        return '';

    }
    getStatementId(statementNode) {
        let node = firstGrandChildElement(statementNode, ['Acct', 'Id', 'Othr', 'Id']);
        if (node)
            return node.text;
        return '';
    }

    getStatementCreationDate(statementNode) {
        if (!statementNode)
            return null;
        let dateNode = statementNode.firstChildElement('CreDtTm');
        if (dateNode)
            return this.formatDate(dateNode.text);
        return '';
    }

    readStatementEntryDetailsMatchMsgId(detailsNode) {
        let batchMsgIdNode = firstGrandChildElement(detailsNode, ['Btch', 'MsgId']);
        return batchMsgIdNode ? batchMsgIdNode.text : '';
    }

    readStatementEntryDetailsAmount(detailsNode) {
        if (!detailsNode)
            return '';

        let amtNode = detailsNode.firstChildElement('Amt');
        if (amtNode)
            return amtNode.text;

        amtNode = firstGrandChildElement(detailsNode, ['AmtDtls', 'TxAmt', 'Amt'])
        if (amtNode)
            return amtNode.text;

        amtNode = firstGrandChildElement(detailsNode, ['AmtDtls', 'InstdAmt'])
        if (amtNode)
            return amtNode.text;

        amtNode = firstGrandChildElement(detailsNode, ['AmtDtls', 'CntrValAmt'])
        if (amtNode)
            return amtNode.text;

        return '';
    }
    extractCustomerNumber(esrNumber) {
        if (!esrNumber || esrNumber.length <= 0)
            return '';

        let customerNumber = esrNumber;

        // Use Banana format for PVR and QR
        if (this.params.customer_no.banana_format) {

            // Extract customer number from QR reference
            if (customerNumber.startsWith("RF")) {

                /*
                  - RF
                  - 2 control digits
                  - customer no. length (min 1, max 7), hexadecimal string
                  - customer no.
                  - invoice no. length (min 1, max 7), hexadecimal string
                  - invoice no.
                  When account/invoice numbers doesn't exist we use "0" as value
               */

                ///////////////////////////////////////
                // TEST
                //   reference number = RF02411003101
                //   ref+control digits = RF02
                //   customer length = 4
                //   customer = 1100
                //   invoice length = 3
                //   invoice = 101 */
                //customerNumber = "RF02411003101";
                ///////////////////////////////////////
                let invLen = customerNumber.substr(4, 1);
                let cust = customerNumber.substr(5, invLen);
                customerNumber = cust;
            }
            else {
                // Extract customer number from PVR reference

                /////////////////////////////////////////////////////////
                // TEST
                //   reference number = 00 00000 00007 65432 11234 56700
                //   customer = 7654321
                //   invoice =  1234567*/
                //customerNumber = "00 00000 00007 65432 11234 56700";
                /////////////////////////////////////////////////////////
                let cust = customerNumber.substr(11, 7);
                customerNumber = cust;

                // Remove traling zeros
                if (!this.params.customer_no.keep_initial_zeros) {
                    customerNumber = customerNumber.replace(/^0+/, '');
                }
            }
        }
        else {
            if (this.params.customer_no) {
                // First apply start / length extraction
                if (this.params.customer_no.start !== "0" || this.params.customer_no.count !== "-1") {
                    if (this.params.customer_no.count === "-1")
                        customerNumber = customerNumber.substr(this.params.customer_no.start);
                    else
                        customerNumber = customerNumber.substr(this.params.customer_no.start, this.params.customer_no.count);
                }

                // Second apply method if defined
                if (this.params.customer_no.method.length > "0") {
                    let customerMethod = eval(this.params.customer_no.method);
                    if (typeof (customerMethod) === 'function') {
                        customerNumber = customerMethod(customerNumber);
                    }
                }

                // Remove traling zeros
                if (!this.params.customer_no.keep_initial_zeros) {
                    customerNumber = customerNumber.replace(/^0+/, '');
                }
            }
        }

        return customerNumber;
    }

    extractInvoiceNumber(esrNumber) {
        if (!esrNumber || esrNumber.length <= 0)
            return '';

        let invoiceNumber = esrNumber;

        // Use Banana format for PVR and QR
        if (this.params.invoice_no.banana_format) {

            // Extract invoice number from QR reference
            if (invoiceNumber.startsWith("RF")) {

                /*
                   - RF
                   - 2 control digits
                   - customer no. length (min 1, max 7), hexadecimal string
                   - customer no.
                   - invoice no. length (min 1, max 7), hexadecimal string
                   - invoice no.
                   When account/invoice numbers doesn't exist we use "0" as value
                */

                ///////////////////////////////////////
                // TEST
                //   reference number = RF02411003101
                //   ref+control digits = RF02
                //   customer length = 4
                //   customer = 1100
                //   invoice length = 3
                //   invoice = 101 */
                //invoiceNumber = "RF02411003101";
                ///////////////////////////////////////
                let invLen = invoiceNumber.substr(4, 1);
                let inv = invoiceNumber.substr(5, invLen);
                let invNoBegin = 5 + Number(invLen);
                let invNoLen = invoiceNumber.substr(invNoBegin, 1);
                let invNo = invoiceNumber.substr(invNoBegin + 1, invNoLen);
                invoiceNumber = invNo;
            }
            else {

                // Extract invoice number from PVR reference

                /////////////////////////////////////////////////////////
                // TEST
                //   reference number = 00 00000 00007 65432 11234 56700
                //   customer = 7654321
                //   invoice =  1234567*/
                //invoiceNumber = "00 00000 00007 65432 11234 56700";
                /////////////////////////////////////////////////////////
                let inv = invoiceNumber.substr(18, 7);
                invoiceNumber = inv;

                // Remove traling zeros
                invoiceNumber = invoiceNumber.replace(/^0+/, '')
            }
        }
        else {

            // First apply start / length extraction
            if (this.params.invoice_no.start !== "0" || this.params.invoice_no.count !== "-1") {
                if (this.params.invoice_no.count === "-1") {
                    invoiceNumber = invoiceNumber.substr(this.params.invoice_no.start);
                }
                else {
                    invoiceNumber = invoiceNumber.substr(this.params.invoice_no.start, this.params.invoice_no.count);
                }
            }

            // Second apply method if defined
            if (this.params.invoice_no.method.length > 0) {
                let invoiceMethod = eval(this.params.invoice_no.method);
                if (typeof (invoiceMethod) === 'function') {
                    invoiceNumber = invoiceMethod(invoiceNumber);
                }
            }

            // Remove traling zeros
            invoiceNumber = invoiceNumber.replace(/^0+/, '')
        }

        return invoiceNumber;
    }

    readStatementEntryDetailsDescription(detailsNode, isCredit) {
        let detailsDescriptionTexts = [];

        detailsDescriptionTexts.push(this.readStatementEntryDetailsAddress(detailsNode, isCredit));

        if (detailsNode.hasChildElements('RmtInf')) {
            let ustrdNode = detailsNode.firstChildElement('RmtInf').firstChildElement('Ustrd');
            while (ustrdNode) {
                let ustrdString = ustrdNode.text.trim();
                if (ustrdString === '?REJECT?0') {
                    ustrdString = '';
                }
                if (ustrdString.length === 0)
                    break;
                detailsDescriptionTexts.push(ustrdString);
                ustrdNode = ustrdNode.nextSiblingElement('Ustrd');
            }
        } else if (detailsNode.hasChildElements('AddtlTxInf')) {
            let addtlTxInfString = detailsNode.firstChildElement('AddtlTxInf').text.trim();
            if (addtlTxInfString.length > 0)
                detailsDescriptionTexts.push(addtlTxInfString);
        }

        let rmtInfRefNode = firstGrandChildElement(detailsNode, ['RmtInf', 'Strd', 'CdtrRefInf', 'Ref']);
        let detailEsrReference = rmtInfRefNode ? rmtInfRefNode.text.trim() : '';
        if (detailEsrReference.length > 0)
            detailsDescriptionTexts.push(detailEsrReference); // removed lang param.

        return this.joinNotEmpty(detailsDescriptionTexts, ' / ');
    }

    /** Xml versions older than .08 (.04 or minor) */
    readStatementEntryDetailsAddress_oldVersion(detailsNode, isCredit) {
        let rltdPtiesNode = detailsNode.firstChildElement('RltdPties');
        if (!rltdPtiesNode)
            return '';

        let addressNode = null;
        if (isCredit) {
            if (rltdPtiesNode.hasChildElements('UltmtDbtr'))
                addressNode = rltdPtiesNode.firstChildElement('UltmtDbtr')
            else if (rltdPtiesNode.hasChildElements('Dbtr'))
                addressNode = rltdPtiesNode.firstChildElement('Dbtr')
            else if (rltdPtiesNode.hasChildElements('UltmtCdtr'))
                addressNode = rltdPtiesNode.firstChildElement('UltmtCdtr')
            else if (rltdPtiesNode.hasChildElements('Cdtr'))
                addressNode = rltdPtiesNode.firstChildElement('Cdtr')
        } else {
            if (rltdPtiesNode.hasChildElements('UltmtCdtr'))
                addressNode = rltdPtiesNode.firstChildElement('UltmtCdtr')
            else if (rltdPtiesNode.hasChildElements('Cdtr'))
                addressNode = rltdPtiesNode.firstChildElement('Cdtr')
            else if (rltdPtiesNode.hasChildElements('UltmtDbtr'))
                addressNode = rltdPtiesNode.firstChildElement('UltmtDbtr')
            else if (rltdPtiesNode.hasChildElements('Dbtr'))
                addressNode = rltdPtiesNode.firstChildElement('Dbtr')
        }

        if (!addressNode)
            return '';

        let addressStrings = [];
        if (addressNode.firstChildElement('Nm'))
            addressStrings.push(addressNode.firstChildElement('Nm').text);
        let pstlAdrNode = addressNode.firstChildElement('PstlAdr');
        if (pstlAdrNode) {
            if (pstlAdrNode.hasChildElements('AdrLine')) {
                let adrLineNode = pstlAdrNode.firstChildElement('AdrLine');
                while (adrLineNode) {
                    addressStrings.push(adrLineNode.text);
                    adrLineNode = adrLineNode.nextSiblingElement('AdrLine');
                }
            }
            if (pstlAdrNode.hasChildElements('TwnNm'))
                addressStrings.push(pstlAdrNode.firstChildElement('TwnNm').text);
            if (pstlAdrNode.hasChildElements('Ctry'))
                addressStrings.push(pstlAdrNode.firstChildElement('Ctry').text);
        }

        return addressStrings.join(', ');
    }

    readStatementEntryDetailsAddress(detailsNode, isCredit) {

        if (!this.schema.endsWith(".08")) {
            return this.readStatementEntryDetailsAddress_oldVersion(detailsNode, isCredit);
        }

        var rltdPtiesNode = detailsNode.firstChildElement('RltdPties'); //Optional
        if (!rltdPtiesNode)
            return '';

        var addressNode = null;
        if (isCredit) {
            if (rltdPtiesNode.hasChildElements('UltmtDbtr'))
                addressNode = rltdPtiesNode.firstChildElement('UltmtDbtr')
            else if (rltdPtiesNode.hasChildElements('Dbtr'))
                addressNode = rltdPtiesNode.firstChildElement('Dbtr')
            else if (rltdPtiesNode.hasChildElements('UltmtCdtr'))
                addressNode = rltdPtiesNode.firstChildElement('UltmtCdtr')
            else if (rltdPtiesNode.hasChildElements('Cdtr'))
                addressNode = rltdPtiesNode.firstChildElement('Cdtr')
            else
                return ''; // No childs found
        } else {
            if (rltdPtiesNode.hasChildElements('UltmtCdtr'))
                addressNode = rltdPtiesNode.firstChildElement('UltmtCdtr')
            else if (rltdPtiesNode.hasChildElements('Cdtr'))
                addressNode = rltdPtiesNode.firstChildElement('Cdtr')
            else if (rltdPtiesNode.hasChildElements('UltmtDbtr'))
                addressNode = rltdPtiesNode.firstChildElement('UltmtDbtr')
            else if (rltdPtiesNode.hasChildElements('Dbtr'))
                addressNode = rltdPtiesNode.firstChildElement('Dbtr')
            else
                return ''; // No childs found
        }

        // 'Pty' new element not present in the previous version SPS2021
        if (addressNode.hasChildElements('Pty')) {
            addressNode = addressNode.firstChildElement('Pty');
        }

        var addressStrings = [];
        if (addressNode.firstChildElement('Nm'))
            addressStrings.push(addressNode.firstChildElement('Nm').text);
        var pstlAdrNode = addressNode.firstChildElement('PstlAdr');
        if (pstlAdrNode) {
            if (pstlAdrNode.hasChildElements('AdrLine')) {
                var adrLineNode = pstlAdrNode.firstChildElement('AdrLine');
                while (adrLineNode) {
                    addressStrings.push(adrLineNode.text);
                    adrLineNode = adrLineNode.nextSiblingElement('AdrLine');
                }
            }
            if (pstlAdrNode.hasChildElements('TwnNm'))
                addressStrings.push(pstlAdrNode.firstChildElement('TwnNm').text);
            if (pstlAdrNode.hasChildElements('Ctry'))
                addressStrings.push(pstlAdrNode.firstChildElement('Ctry').text);
        }

        return addressStrings.join(', ');
    }

    joinNotEmpty(texts, separator) {
        let cleanTexts = texts.filter(function (n) { return n && n.trim().length });
        return cleanTexts.join(separator);
    }
}

/**
 * This class takes the data from a file ISO 20022 Camt052/53/54 with universal specifics
 * and returns a JSON with the file data.
 */
var ISO20022_Universal_JSONConverter = class ISO20022_Universal_JSONConverter {
    constructor() {
        this.camtType = "";
        this.schema = "";
        this.schemaNr = "";
        // Base schemes 05.version
        this.schemaFileName_05205 = "src/camt_schemes/un/schema_05/camt.052.001.05.xsd";
        this.schemaFileName_05305 = "src/camt_schemes/un/schema_05/camt.053.001.05.xsd";
        this.schemaFileName_05405 = "src/camt_schemes/un/schema_05/camt.054.001.05.xsd";
        // Base schemes 08.version
        this.schemaFileName_05208 = "src/camt_schemes/un/schema_08/camt.052.001.08.xsd";
        this.schemaFileName_05308 = "src/camt_schemes/un/schema_08/camt.053.001.08.xsd";
        this.schemaFileName_05408 = "src/camt_schemes/un/schema_08/camt.054.001.08.xsd";
        // Base schemes 12.version
        this.schemaFileName_05208 = "src/camt_schemes/un/schema_12/camt.052.001.12.xsd";
        this.schemaFileName_05308 = "src/camt_schemes/un/schema_12/camt.053.001.12.xsd";
        this.schemaFileName_05408 = "src/camt_schemes/un/schema_12/camt.054.001.12.xsd";
    }

    /**
    * Check if the file is a ISO20022 Camt 052/053/054 with Universal specifics.
    * @param {*} fileContent 
   */
    match(fileContent, isTest) {
        let xmlDoc = Banana.Xml.parse(fileContent);
        //Banana.console.debug("error: " + Banana.Xml.errorString);
        if (!xmlDoc)
            return false;

        /** We do not do pattern validation during tests for convenience, 
         * otherwise an alternative relative path to the patterns would 
         * have to be defined in the tests. We use already validated schemes in the tests */

        let docNode = xmlDoc.firstChildElement(); // 'Document'
        this.schema = docNode.attribute('xmlns');
        this.schemaNr = extractSchemaNumber(this.schema);
        if (!docNode)
            return false;
        if (docNode.firstChildElement() === 'BkToCstmrAcctRpt' &&         // Check for CAMT.052
            docNode.namespaceURI().includes('camt.052')) {
            this.camtType = "CAMT.052";
            let isValid = this.isValidCamt052Schema(xmlDoc, isTest);
            return isValid;
        } else if (docNode.firstChildElement() === 'BkToCstmrStmt' &&         // Check for CAMT.053
            docNode.namespaceURI().includes('camt.053')) {
            this.camtType = "CAMT.053";
            let isValid = this.isValidCamt053Schema(xmlDoc, isTest);
            return isValid;
        } else if (docNode.firstChildElement() === 'BkToCstmrDbtCdtNtfctn' &&
            docNode.namespaceURI().includes('camt.054')) {         // Check for CAMT.054
            this.camtType = "CAMT.054";
            let isValid = this.isValidCamt054Schema(xmlDoc, isTest);
            return isValid;
        }
        return false
    }

    /** This function tests wether the xml stucture is valid */
    isValidCamt052Schema(xmlDoc, isTest) {
        if (isTest)
            return true;
        if (Banana.Xml.validate(xmlDoc, this.schemaFileName_05205))
            return true;
        if (Banana.Xml.validate(xmlDoc, this.schemaFileName_05208))
            return true;
        if (Banana.Xml.validate(xmlDoc, this.schemaFileName_05212))
            return true;
        return false;
    }

    isValidCamt053Schema(xmlDoc, isTest) {
        if (isTest)
            return true;
        if (Banana.Xml.validate(xmlDoc, this.schemaFileName_05305))
            return true;
        if (Banana.Xml.validate(xmlDoc, this.schemaFileName_05308))
            return true;
        if (Banana.Xml.validate(xmlDoc, this.schemaFileName_05312))
            return true;
        return false;
    }

    isValidCamt054Schema(xmlDoc, isTest) {
        if (isTest)
            return true;
        if (Banana.Xml.validate(xmlDoc, this.schemaFileName_05405))
            return true;
        if (Banana.Xml.validate(xmlDoc, this.schemaFileName_05408))
            return true;
        if (Banana.Xml.validate(xmlDoc, this.schemaFileName_05412))
            return true;
        return false;
    }

    convertToJson(fileContent, fileId, filePath, fileDateTime) {
        let xmlDoc = Banana.Xml.parse(fileContent);
        let jsonDoc = {};
        let fileParams = {};
        let statementNodes = [];
        let docNode = xmlDoc.firstChildElement(); // Document
        if (!docNode)
            return xmlTransactions;
        let baseNodeName = "";
        let statementNodeName = "";

        switch (this.camtType) {
            case "CAMT.052":
                baseNodeName = "BkToCstmrAcctRpt";
                statementNodeName = "Rpt";
            case "CAMT.053":
                baseNodeName = "BkToCstmrStmt";
                statementNodeName = "Stmt";
            case "CAMT.054":
                baseNodeName = "BkToCstmrDbtCdtNtfctn";
                statementNodeName = "Ntfctn";
            default:
                "";
        }

        if (!baseNodeName || !statementNodeName)
            return jsonDoc;

        //Get file params
        fileParams = this.readFileParams(fileId, filePath, fileDateTime);
        statementNodes = this.getStatementNodes(docNode, baseNodeName, statementNodeName);
        this.setData(statementNodes, jsonDoc, fileParams);
        return jsonDoc;
    }

    readFileParams() {
        let fileParams = {};

        let id = fileId;
        let name = filePath;
        let type = this.camtType;
        let creationDate = fileDateTime;

        fileParams.FileId = id;
        fileParams.FileName = name;
        fileParams.FileType = type;
        fileParams.FileSchema = this.schemaNr;
        fileParams.FileCreationDate = creationDate;

        return fileParams;
    }

    getStatementNodes(docNode, basNode, statementNode) {
        let statementsNodes = [];
        let node = firstGrandChildElement(docNode, [basNode, statementNode]);
        while (node) {
            statementsNodes.push(node)
            node = node.nextSiblingElement('Stmt');
        }
        return statementsNode;
    }

    setData(statementsNode, jsonDoc, fileParams) {
        let trData = [];
        if (statementsNode.length >= 0) {
            /** We have to get the data for each statement, wich could have a different account (IBAN) */
            for (let i = 0; i < statementsNode.length; i++) {
                let statementParams = {};
                statementParams = this.readStatementParams(statementsNode[i]);
                let entryNode = statementsNode[i].firstChildElement('Ntry');
                while (entryNode) { // concat each statement array to have one general
                    trData = trData.concat((this.readStatementEntry(entryNode, fileParams, statementParams)));
                    entryNode = entryNode.nextSiblingElement('Ntry'); // next account movement
                }
            }
        }
        jsonDoc.TransactionsList = trData;
    }

    readStatementParams(statementNode) {
        /**
         * The data we want to save:
         * - IBAN
         * - Statement owner
         * - Initial balance
         * - Final balance
         */

        let statementParams = {};

        let iban = this.getStatementIban(statementNode);
        let id = this.getStatementId(statementNode); // Sobstitute to the IBAN, we use this only if the IBAN is not present.
        let statementCreationDate = this.getStatementCreationDate(statementNode)
        let statementOwner = this.getStatementOwner(statementNode);
        let statementCurrency = this.getStatementCurrency(statementNode);
        let initialBalance = this.getStatementBeginBalance(statementNode);
        let finalBalance = this.getStatementEndBalance(statementNode);

        statementParams.StatementIban = iban == "" ? id : iban;
        statementParams.StatementCreationDate = statementCreationDate;
        statementParams.StatementOwner = statementOwner;
        statementParams.StatementCurrency = statementCurrency;
        statementParams.StatementInitialBalance = initialBalance;
        statementParams.StatementFinalBalance = finalBalance;

        return statementParams;

    }

    getStatementEndBalance(statementNode) {
        if (!statementNode)
            return '';

        var balNode = statementNode.firstChildElement('Bal');
        while (balNode) {
            var tpNode = balNode.firstChildElement('Tp');
            if (tpNode) {
                var cdOrPrtryNode = tpNode.firstChildElement('CdOrPrtry');
                if (cdOrPrtryNode && (cdOrPrtryNode.text === 'CLBD' || cdOrPrtryNode.text === 'CLAV')) {
                    var amtNode = balNode.firstChildElement('Amt');
                    if (amtNode) {
                        var amount = amtNode.text;
                        if (balNode.hasChildElements('CdtDbtInd') && balNode.hasChildElements('CdtDbtInd').text === 'DBIT') {
                            amount = Banana.SDecimal.invert(amount);
                        }
                        return amount;
                    }
                }
            }
            balNode = balNode.nextSiblingElement();
        }
        return '';
    }

    getStatementBeginBalance(statementNode) {
        if (!statementNode)
            return '';

        var balNode = statementNode.firstChildElement('Bal');
        while (balNode) {
            var tpNode = balNode.firstChildElement('Tp');
            if (tpNode) {
                var cdOrPrtryNode = tpNode.firstChildElement('CdOrPrtry');
                if (cdOrPrtryNode && cdOrPrtryNode.text === 'OPBD') {
                    var amtNode = balNode.firstChildElement('Amt');
                    if (amtNode) {
                        var amount = amtNode.text;
                        if (balNode.hasChildElements('CdtDbtInd') && balNode.hasChildElements('CdtDbtInd').text === 'DBIT') {
                            amount = Banana.SDecimal.invert(amount);
                        }
                        return amount;
                    }
                }
            }
            balNode = balNode.nextSiblingElement();
        }
        return '';
    }

    getStatementCurrency(statementNode) {
        let node = firstGrandChildElement(statementNode, ['Acct', 'Ccy']);
        if (node)
            return node.text;
        return '';
    }

    getStatementOwner(statementNode) {
        let node = firstGrandChildElement(statementNode, ['Acct', 'Ownr', 'Nm']);
        if (node)
            return node.text;
        return '';
    }

    getStatementIban(statementNode) {
        let node = firstGrandChildElement(statementNode, ['Acct', 'Id', 'IBAN']);
        if (node)
            return node.text;
        return '';

    }
    getStatementId(statementNode) {
        let node = firstGrandChildElement(statementNode, ['Acct', 'Id', 'Othr', 'Id']);
        if (node)
            return node.text;
        return '';
    }

    getStatementCreationDate(statementNode) {
        if (!statementNode)
            return null;
        let dateNode = statementNode.firstChildElement('CreDtTm');
        if (dateNode)
            return this.formatDate(dateNode.text);
        return '';
    }

    readStatementEntry(entryNode, fileParams, statementParams) {
        let transaction = null;
        let transactions = [];

        let entryBookingDate = entryNode.hasChildElements('BookgDt') ? entryNode.firstChildElement('BookgDt').text.substr(0, 10) : '';
        let entryValutaDate = entryNode.hasChildElements('ValDt') ? entryNode.firstChildElement('ValDt').text.substr(0, 10) : '';
        let entryIsCredit = entryNode.firstChildElement('CdtDbtInd').text === 'CRDT';
        let entryAmount = entryNode.firstChildElement('Amt').text;
        let entryDescription = entryNode.hasChildElements('AddtlNtryInf') ? entryNode.firstChildElement('AddtlNtryInf').text : '';
        let entryTexts = entryBookingDate + entryValutaDate + entryAmount + entryDescription;
        let entryExternalReference = entryNode.hasChildElements('AcctSvcrRef') && entryNode.firstChildElement('AcctSvcrRef').text.length >= 0 ?
            entryNode.firstChildElement('AcctSvcrRef').text : getHash(entryTexts, statementParams);

        if (entryNode.hasChildElements('NtryDtls')) {
            let detailsNode = entryNode.firstChildElement('NtryDtls');
            while (detailsNode) {
                // Count text elements
                let txDtlsCount = 0;
                let textDetailsNode = detailsNode.firstChildElement('TxDtls');
                while (textDetailsNode) {
                    txDtlsCount++;
                    textDetailsNode = textDetailsNode.nextSiblingElement('TxDtls'); // next movement detail
                }

                let entryDetailsBatchMsgId = this.readStatementEntryDetailsMatchMsgId(detailsNode);

                if (txDtlsCount > 1) {
                    // Insert counterpart transaction
                    transaction = {
                        'FileId': fileParams.FileId,
                        'FileName': fileParams.FileName,
                        'FileType': fileParams.FileType,
                        'FileSchema': fileParams.FileSchema,
                        'FileCreationDate': fileParams.FileCreationDate,
                        'StatementIban': statementParams.StatementIban,
                        'StatementCreationDate': statementParams.StatementCreationDate,
                        'StatementOwner': statementParams.StatementOwner,
                        'StatementCurrency': statementParams.StatementCurrency,
                        'StatementInitialBalance': statementParams.StatementInitialBalance,
                        'StatementFinalBalance': statementParams.StatementFinalBalance,
                        'TransactionDate': entryBookingDate,
                        'TransactionDateValue': entryValutaDate,
                        'TransactionDocInvoice': '',
                        'TransactionDescription': this.joinNotEmpty([entryDescription, entryDetailsBatchMsgId], " / "),
                        'TransactionIncome': entryIsCredit ? entryAmount : '',
                        'TransactionExpenses': entryIsCredit ? '' : entryAmount,
                        'TransactionExternalReference': entryExternalReference,
                        'TransactionIsDetail': 'S'
                    };
                    transactions.push(transaction);
                }

                // Text elements (Details transactions)
                if (detailsNode.hasChildElements('TxDtls')) {
                    textDetailsNode = detailsNode.firstChildElement('TxDtls');
                    while (textDetailsNode) {
                        let cdtDbtIndNode = textDetailsNode.firstChildElement('CdtDbtInd');
                        let deatailsIsCredit = cdtDbtIndNode && cdtDbtIndNode.text === 'CRDT' ? true : entryIsCredit;
                        let deatailAmount = this.readStatementEntryDetailsAmount(textDetailsNode);
                        let acctSvcrRefNode = firstGrandChildElement(textDetailsNode, ['Refs', 'AcctSvcrRef']);
                        let instrIdNode = firstGrandChildElement(textDetailsNode, ['Refs', 'InstrId']);
                        // Build description
                        let detailDescription = this.readStatementEntryDetailsDescription(textDetailsNode, deatailsIsCredit);
                        if (detailDescription.length === 0 && instrIdNode)
                            detailDescription = instrIdNode.text;
                        // Set External reference
                        let entryDetailTexts = entryBookingDate + entryValutaDate + deatailAmount + detailDescription;
                        let detailExternalReference = acctSvcrRefNode && acctSvcrRefNode.text.length >= 0 ? acctSvcrRefNode.text : getHash(entryDetailTexts, statementParams);

                        //let invoiceNumber = this.extractInvoiceNumber(detailEsrReference); // Da valutare.

                        if (txDtlsCount === 1) {
                            deatailAmount = entryAmount;
                            detailExternalReference = entryExternalReference;
                            detailDescription = this.joinNotEmpty([detailDescription, entryDetailsBatchMsgId, entryDescription], ' / ');
                        }

                        transaction = {
                            'FileId': fileParams.FileId,
                            'FileName': fileParams.FileName,
                            'FileType': fileParams.FileType,
                            'FileSchema': fileParams.FileSchema,
                            'FileCreationDate': fileParams.FileCreationDate,
                            'StatementIban': statementParams.StatementIban,
                            'StatementCreationDate': statementParams.StatementCreationDate,
                            'StatementOwner': statementParams.StatementOwner,
                            'StatementCurrency': statementParams.StatementCurrency,
                            'StatementInitialBalance': statementParams.StatementInitialBalance,
                            'StatementFinalBalance': statementParams.StatementFinalBalance,
                            'TransactionDate': entryBookingDate,
                            'TransactionDateValue': entryValutaDate,
                            //'DocInvoice': invoiceNumber,
                            'TransactionDescription': detailDescription,
                            'TransactionIncome': deatailsIsCredit ? deatailAmount : '',
                            'TransactionExpenses': deatailsIsCredit ? '' : deatailAmount,
                            'TransactionExternalReference': detailExternalReference,
                            'TransactionContraAccount': '',
                            'TransactionCc1': '',
                            'TransactionCc2': '',
                            'TransactionCc3': '',
                            'TransactionIsDetail': txDtlsCount > 1 ? 'D' : ''
                        };

                        /*if (this.params.customer_no && this.params.customer_no.extract) { // Set customer number
                            let customerNumber = this.extractCustomerNumber(detailEsrReference);
                            let ccPrefix = deatailsIsCredit ? '-' : '';
                            if (this.params.customer_no.use_cc && this.params.customer_no.use_cc.trim().toUpperCase() === 'CC1') {
                                if (customerNumber)
                                    transaction.Cc1 = ccPrefix + customerNumber;
                            } else if (this.params.customer_no.use_cc && this.params.customer_no.use_cc.trim().toUpperCase() === 'CC2') {
                                if (customerNumber)
                                    transaction.Cc2 = ccPrefix + customerNumber;
                            } else if (this.params.customer_no.use_cc && this.params.customer_no.use_cc.trim().toUpperCase() === 'CC3') {
                                if (customerNumber)
                                    transaction.Cc3 = ccPrefix + customerNumber;
                            } else {
                                transaction.ContraAccount = customerNumber;
                            }
                        }*/

                        transactions.push(transaction);
                        txDtlsCount++;

                        textDetailsNode = textDetailsNode.nextSiblingElement('TxDtls'); // next movement detail
                    }
                } else { // No entry text details elements
                    transaction = {
                        'FileId': fileParams.FileId,
                        'FileName': fileParams.FileName,
                        'FileType': fileParams.FileType,
                        'FileSchema': fileParams.FileSchema,
                        'FileCreationDate': fileParams.FileCreationDate,
                        'StatementIban': statementParams.StatementIban,
                        'StatementCreationDate': statementParams.StatementCreationDate,
                        'StatementOwner': statementParams.StatementOwner,
                        'StatementCurrency': statementParams.StatementCurrency,
                        'StatementInitialBalance': statementParams.StatementInitialBalance,
                        'StatementFinalBalance': statementParams.StatementFinalBalance,
                        'TransactionDate': entryBookingDate,
                        'TransactionDateValue': entryValutaDate,
                        'TransactionDocInvoice': '',
                        'TransactionDescription': this.joinNotEmpty([entryDescription, entryDetailsBatchMsgId], " / "),
                        'TransactionIncome': entryIsCredit ? entryAmount : '',
                        'TransactionExpenses': entryIsCredit ? '' : entryAmount,
                        'TransactionExternalReference': entryExternalReference,
                        'TransactionContraAccount': '',
                        'TransactionCc1': '',
                        'TransactionCc2': '',
                        'TransactionCc3': '',
                        'TransactionIsDetail': ''
                    };
                    transactions.push(transaction);

                }

                detailsNode = detailsNode.nextSiblingElement('NtryDtls'); // next movement detail
            }

        } else { // No entry details
            transaction = {
                'FileId': fileParams.FileId,
                'FileName': fileParams.FileName,
                'FileType': fileParams.FileType,
                'FileSchema': fileParams.FileSchema,
                'FileCreationDate': fileParams.FileCreationDate,
                'StatementIban': statementParams.StatementIban,
                'StatementCreationDate': statementParams.StatementCreationDate,
                'StatementOwner': statementParams.StatementOwner,
                'StatementCurrency': statementParams.StatementCurrency,
                'StatementInitialBalance': statementParams.StatementInitialBalance,
                'StatementFinalBalance': statementParams.StatementFinalBalance,
                'TransactionDate': entryBookingDate,
                'TransactionDateValue': entryValutaDate,
                'TransactionDocInvoice': '',
                'TransactionDescription': entryDescription,
                'TransactionIncome': entryIsCredit ? entryAmount : '',
                'TransactionExpenses': entryIsCredit ? '' : entryAmount,
                'TransactionExternalReference': entryExternalReference,
                'TransactionContraAccount': '',
                'TransactionCc1': '',
                'TransactionCc2': '',
                'TransactionCc3': '',
                'TransactionIsDetail': ''
            };
            transactions.push(transaction);

        }

        return transactions;
    }
}

/**
 * This class takes the data from a JSON file Provider for example from thinker)
 * and returns a new JSON with the file data....
 */
var JSON_Thinker_JSONConverter = class JSON_Thinker_JSONConverter {
    constructor() {
        //...
    }

    match(fileContent) {
        return false;
    }

    convertToJson() {
        let jsonDoc = {};
        return jsonDoc;
    }
}

function extractSchemaNumber(schemaString) {
    if (schemaString)
        return schemaString.split('.').pop();
}

function firstGrandChildElement(node, childs) {
    if (!node)
        return null;
    let grandChildNode = node;
    for (let i = 0; i < childs.length; i++) {
        grandChildNode = grandChildNode.firstChildElement(childs[i]);
        if (!grandChildNode)
            break;
    }

    return grandChildNode;
}



function getHash(entryTexts, statementParams) {

    let entryId = "";
    let textToHash = entryTexts +
        statementParams.StatementIban +
        statementParams.StatementCurrency;

    entryId = Banana.Converter.textToHash(textToHash, "Sha256");

    return entryId;

}

function getCsvBanksList() {

    /**
     * We associate each bank to the related extension and the main class with the method to manage the conversion.
     * This is the list of banks for which we currently have an import extension, 
     * currently the list is to be updated by hand, in the future the list could be retrieved dynamically.
     */
    let banksList = [];

    banksList.postfinance = {
        prefixName: "postfinance",
        scriptName: "ch.banana.sync.postfinance.js",
        referenceClass: "SyncPostFinanceData",
    };

    banksList.ubs = {
        prefixName: "ubs",
        scriptName: "ch.banana.sync.ubs.js",
        referenceClass: "SyncUbsData",
    };


    //Other banks...

    /*banksList.set('credisuisse', 'ch.banana.sync.credisuisse.js');
    banksList.set('bancastato', 'ch.banana.sync.bancastato.js');
    banksList.set('baslerkantonalbank', 'ch.banana.sync.baslerkantonalbank.js');
    banksList.set('cornerbank', 'ch.banana.sync.cornerbank.js');
    banksList.set('cornercard', 'ch.banana.sync.cornercard.js');
    banksList.set('luzernerkantonalbank', 'ch.banana.sync.luzernerkantonalbank.js');
    banksList.set('migrosbank', 'ch.banana.sync.migrosbank.js');
    banksList.set('neonbank', 'ch.banana.sync.neonbank.js');
    banksList.set('raiffeisen', 'ch.banana.sync.raiffeisen.js');
    banksList.set('valiant', 'ch.banana.sync.valiant.js');
    banksList.set('zurcherkantonalbank', 'ch.banana.sync.zurcherkantonalbank.js');*/

    return Object.freeze(banksList);
}
