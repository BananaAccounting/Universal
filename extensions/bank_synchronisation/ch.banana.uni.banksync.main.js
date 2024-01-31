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
// @id = ch.banana.uni.bank.data.sync
// @description = Synchronisation of Bank data
// @task = app.command
// @publisher = Banana.ch SA
// @pubdate = 2024-01-30
// @inputdatasource = none

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

/**
 * Main function.
 * Takes as parameter the content of a file, the content is given as a string.
 * @param {*} fileContent 
 * @returns 
 */
function exec(fileContent, fileName) {

    if (fileContent.length < 0)
        return;

    let iso20022_swiss = new ISO20022_Swiss_JSONConverter();
    if (iso20022_swiss.match(fileContent)) {
        let jsonData = iso20022_swiss.convertToJson(fileContent, fileName);
        if (jsonData.length > 0)
            return jsonData;
    }

    let iso20022_general = new ISO20022_General_JSONConverter();
    if (iso20022_general.match(fileContent)) {
        let jsonData = iso20022_general.convertToJson(fileContent, fileName);
        if (jsonData.length > 0)
            return jsonData;
    }

    let json_thinker = new JSON_Thinker_JSONConverter();
    if (json_thinker.match(fileContent)) {
        let jsonData = json_thinker.convertToJson(fileContent, fileName);
        if (jsonData.length > 0)
            return jsonData;
    }

    return "";
}

/**
 * This class takes the data from a file ISO 20022 Camt052/53/54 with Swiss specifics
 * and returns a JSON with the file data.
 */
var ISO20022_Swiss_JSONConverter = class ISO20022_Swiss_JSONConverter {
    constructor() {
        this.camtType = "";
    }

    /**
     * Check if the file is a ISO20022 Camt 052/053/054 with Swiss specifics.
     * @param {*} fileContent 
     */
    match(fileContent) {
        let xmlDoc = Banana.Xml.parse(fileContent);
        if (!xmlDoc)
            return false;
        let root = xmlDoc.firstChildElement(); // Document
        if (!root)
            return false;
        let docNs = root.attribute('xmlns');
        let rootFirstChildNodeName = root.firstChildElement().nodeName;
        // Check for CAMT.052
        if ((rootFirstChildNodeName.indexOf('BkToCstmrAcctRpt') >= 0)
            && docNs.indexOf('camt.052') >= 0) {
            this.camtType = "CAMT.052";
            return true;
        }

        // Check for CAMT.053
        if ((rootFirstChildNodeName.indexOf('BkToCstmrStmt') >= 0)
            && docNs.indexOf('camt.053') >= 0) {
            this.camtType = "CAMT.053";
            return true;
        }

        // Check for CAMT.054
        if ((rootFirstChildNodeName.indexOf('BkToCstmrDbtCdtNtfctn') >= 0)
            && docNs.indexOf('camt.054') >= 0) {
            this.camtType = "CAMT.054";
            return true;
        }
        return false
    }

    convertToJson(fileContent, fileName) {
        let xmlDoc = Banana.Xml.parse(fileContent);
        let docNode = xmlDoc.firstChildElement(); // Document
        if (!docNode)
            return xmlTransactions
        switch (this.camtType) {
            case "CAMT.052":
                return this.convertToJson_fromCamt052(docNode, fileName);
            case "CAMT.053":
                return this.convertToJson_fromCamt053(docNode, fileName);
            case "CAMT.054":
                return this.convertToJson_fromCamt054(docNode, fileName);
            default:
                return jsonDoc;
        }
    }

    convertToJson_fromCamt052(docNode, fileName) {
        let jsonDoc = {};
        let statementsNode = getStatementsNode_camt052(docNode);
        jsonDoc = this.readXmlData(statementsNode, jsonDoc, fileName);
        return jsonDoc;
    }
    convertToJson_fromCamt053(docNode, fileName) {
        let jsonDoc = {};
        let statementsNode = getStatementsNode_camt053(docNode);
        jsonDoc = this.readXmlData(statementsNode, jsonDoc, fileName);
        return jsonDoc;

    }
    convertToJson_fromCamt054(docNode, fileName) {
        let jsonDoc = {};
        let statementsNode = getStatementsNode_camt054(docNode);
        jsonDoc = this.readXmlData(statementsNode, jsonDoc, fileName);
        return jsonDoc;
    }

    getStatementsNode_camt052() {
        let statementsNode = [];
        statementNode = firstGrandChildElement(docNode, ['BkToCstmrAcctRpt', 'Rpt']);
        while (statementNode) {
            statementsNode.push(statementNode)
            statementNode = statementNode.nextSiblingElement('Rpt');
        }

        return statementsNode;
    }

    getStatementsNode_camt053() {
        let statementsNode = [];
        statementNode = firstGrandChildElement(docNode, ['BkToCstmrStmt', 'Stmt']);
        while (statementNode) {
            statementsNode.push(statementNode)
            statementNode = statementNode.nextSiblingElement('Stmt');
        }

        return statementsNode;
    }

    getStatementsNode_camt054() {
        let statementsNode = [];
        statementNode = firstGrandChildElement(docNode, ['BkToCstmrDbtCdtNtfctn', 'Ntfctn']);
        while (statementNode) {
            statementsNode.push(statementNode)
            statementNode = statementNode.nextSiblingElement('Ntfctn');
        }

        return statementsNode;
    }

    /**
     * Saves the xml file parameters into a json object.
     * @param {*} fileContent 
     */
    getXmlParams(statementNode, fileName) {
        /**
         * The data we want to save:
         * - File Name.
         * - Account IBAN
         * - Data di creazione del file
         * - Bilancio iniziale
         * - Bilancio finale
         * - Totale movimenti
         * - Possessore del rendiconto 
         */
        let xmlParams = {};

        let name = fileName;
        let iban = getStatementIban(docNode);
        Banana.console.debug(iban);


        xmlParams.fileName = name;
    }

    /**
     * read the transactions in the file and returns an array of objects.
     * @param {*} fileContent 
     * @returns 
     */
    readXmlData(statementsNode, jsonDoc, fileName) {
        /**
         * ****** NOTES ***************
         * Se un file XML ha piu statement,li ritorno nello stesso "jsonDoc", definire poi che struttura
         * dovrà avere il tutto. (31.01.2024)
         */
        jsonDoc.statementData = [];
        if (statementsNode.length >= 0) {
            /** We have to get the data for each statement, wich could have a different account (IBAN) */
            for (var i = 0; i < statementsNode.length; i++) {
                let statementData = {};
                let xmlTransactions = [];
                let xmlParams = [];

                xmlParams = getXmlParams(statementNodes[i], fileName);
                xmlTransactions = xmlTransactions.concat(this.readStatementEntries(statementNodes[i]));

                statementData.params = xmlParams;
                statementData.transactions = xmlTransactions;

                jsonDoc.statementData.push(statementData);
            }
        }
        return jsonDoc;
    }

    readStatementEntries(statementNode) {
        if (!statementNode)
            return;

        var transactions = [];
        var entryNode = statementNode.firstChildElement('Ntry');
        while (entryNode) {
            transactions = transactions.concat(this.readStatementEntry(entryNode));
            entryNode = entryNode.nextSiblingElement('Ntry'); // next account movement
        }
        return transactions;
    }

    readStatementEntry(entryNode) {
        var transaction = null;
        var transactions = [];

        var entryBookingDate = entryNode.hasChildElements('BookgDt') ? entryNode.firstChildElement('BookgDt').text.substr(0, 10) : '';
        var entryValutaDate = entryNode.hasChildElements('ValDt') ? entryNode.firstChildElement('ValDt').text.substr(0, 10) : '';
        var entryIsCredit = entryNode.firstChildElement('CdtDbtInd').text === 'CRDT';
        var entryAmount = entryNode.firstChildElement('Amt').text;
        var entryDescription = entryNode.hasChildElements('AddtlNtryInf') ? entryNode.firstChildElement('AddtlNtryInf').text : '';
        var entryExternalReference = entryNode.hasChildElements('AcctSvcrRef') ? entryNode.firstChildElement('AcctSvcrRef').text : '';

        if (entryNode.hasChildElements('NtryDtls')) {
            var detailsNode = entryNode.firstChildElement('NtryDtls');
            while (detailsNode) {
                // Count text elements
                var txDtlsCount = 0;
                var textDetailsNode = detailsNode.firstChildElement('TxDtls');
                while (textDetailsNode) {
                    txDtlsCount++;
                    textDetailsNode = textDetailsNode.nextSiblingElement('TxDtls'); // next movement detail
                }

                var entryDetailsBatchMsgId = readStatementEntryDetailsMatchMsgId(detailsNode);

                if (txDtlsCount > 1) {
                    // Insert counterpart transaction
                    transaction = {
                        'Date': entryBookingDate,
                        'DateValue': entryValutaDate,
                        'DocInvoice': '',
                        'Description': joinNotEmpty([entryDescription, entryDetailsBatchMsgId], " / "),
                        'Income': entryIsCredit ? entryAmount : '',
                        'Expenses': entryIsCredit ? '' : entryAmount,
                        'ExternalReference': entryExternalReference,
                        'IsDetail': 'S'
                    };
                    transactions.push(transaction);
                }

                // Text elements (Details transactions)
                if (detailsNode.hasChildElements('TxDtls')) {
                    textDetailsNode = detailsNode.firstChildElement('TxDtls');
                    while (textDetailsNode) {
                        var cdtDbtIndNode = textDetailsNode.firstChildElement('CdtDbtInd');
                        var deatailsIsCredit = cdtDbtIndNode && cdtDbtIndNode.text === 'CRDT' ? true : entryIsCredit;
                        var deatailAmount = readStatementEntryDetailsAmount(textDetailsNode);
                        var acctSvcrRefNode = firstGrandChildElement(textDetailsNode, ['Refs', 'AcctSvcrRef']);
                        var detailExternalReference = acctSvcrRefNode ? acctSvcrRefNode.text : '';
                        var rmtInfRefNode = firstGrandChildElement(textDetailsNode, ['RmtInf', 'Strd', 'CdtrRefInf', 'Ref']);
                        var detailEsrReference = rmtInfRefNode ? rmtInfRefNode.text : '';
                        var instrIdNode = firstGrandChildElement(textDetailsNode, ['Refs', 'InstrId']);

                        //var invoiceNumber = extractInvoiceNumber(detailEsrReference); // Da valutare.

                        // Build description
                        var detailDescription = readStatementEntryDetailsDescription(textDetailsNode, deatailsIsCredit);
                        if (detailDescription.length === 0 && instrIdNode)
                            detailDescription = instrIdNode.text;

                        if (txDtlsCount === 1) {
                            deatailAmount = entryAmount;
                            detailExternalReference = entryExternalReference;
                            detailDescription = joinNotEmpty([detailDescription, entryDetailsBatchMsgId, entryDescription], ' / ');
                        }

                        transaction = {
                            'Date': entryBookingDate,
                            'DateValue': entryValutaDate,
                            //'DocInvoice': invoiceNumber,
                            'Description': detailDescription,
                            'Income': deatailsIsCredit ? deatailAmount : '',
                            'Expenses': deatailsIsCredit ? '' : deatailAmount,
                            'ExternalReference': detailExternalReference,
                            'ContraAccount': '',
                            'Cc1': '',
                            'Cc2': '',
                            'Cc3': '',
                            'IsDetail': txDtlsCount > 1 ? 'D' : ''
                        };

                        /*if (this.params.customer_no && this.params.customer_no.extract) { // Set customer number
                            var customerNumber = extractCustomerNumber(detailEsrReference);
                            var ccPrefix = deatailsIsCredit ? '-' : '';
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
                        'Date': entryBookingDate,
                        'DateValue': entryValutaDate,
                        'DocInvoice': '',
                        'Description': joinNotEmpty([entryDescription, entryDetailsBatchMsgId], " / "),
                        'Income': entryIsCredit ? entryAmount : '',
                        'Expenses': entryIsCredit ? '' : entryAmount,
                        'ExternalReference': entryExternalReference,
                        'ContraAccount': '',
                        'Cc1': '',
                        'Cc2': '',
                        'Cc3': '',
                        'IsDetail': ''
                    };
                    transactions.push(transaction);

                }

                detailsNode = detailsNode.nextSiblingElement('NtryDtls'); // next movement detail
            }

        } else { // No entry details
            transaction = {
                'Date': entryBookingDate,
                'DateValue': entryValutaDate,
                'DocInvoice': '',
                'Description': entryDescription,
                'Income': entryIsCredit ? entryAmount : '',
                'Expenses': entryIsCredit ? '' : entryAmount,
                'ExternalReference': entryExternalReference,
                'ContraAccount': '',
                'Cc1': '',
                'Cc2': '',
                'Cc3': '',
                'IsDetail': ''
            };
            transactions.push(transaction);

        }

        return transactions;
    }
}

/**
 * This class takes the data from a file ISO 20022 Camt052/53/54 with general specifics
 * and returns a JSON with the file data.
 */
var ISO20022_General_JSONConverter = class ISO20022_General_JSONConverter {
    constructor() {
        //...
    }

    /**
    * Check if the file is a ISO20022 Camt 052/053/054 with General specifics.
    * @param {*} fileContent 
   */
    match(fileContent) {
        let xmlDoc = Banana.Xml.parse(fileContent);
        if (!xmlDoc)
            return false;
        let root = xmlDoc.firstChildElement();
        if (!root)
            return false;
        // Check for CAMT.052
        if (root.firstChildElement() === 'BkToCstmrAcctRpt' && root.namespaceURI().includes('camt.052')) {
            this.camtType = "CAMT.052";
            Banana.console.debug(this.camtType);
            return true;
        }

        // Check for CAMT.053
        if (root.firstChildElement() === 'BkToCstmrStmt' && root.namespaceURI().includes('camt.053')) {
            this.camtType = "CAMT.053";
            Banana.console.debug(this.camtType);
            return true;
        }

        // Check for CAMT.054
        if (root.firstChildElement() === 'BkToCstmrDbtCdtNtfctn' && root.namespaceURI().includes('camt.054')) {
            this.camtType = "CAMT.054";
            Banana.console.debug(this.camtType);
            return true;
        }
        return false
    }

    convertToJson() {
        let jsonDoc = {};
        return jsonDoc;
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

// ******** XML PROCESSING UTILITIES FUNCTIONS **********

function getStatementIban(statementNode) {
    var node = firstGrandChildElement(statementNode, ['Acct', 'Id', 'IBAN']);
    if (node)
        return node.text;
    return '';

}
function firstGrandChildElement(node, childs) {
    if (!node)
        return null;
    var grandChildNode = node;
    for (var i = 0; i < childs.length; i++) {
        grandChildNode = grandChildNode.firstChildElement(childs[i]);
        if (!grandChildNode)
            break;
    }

    return grandChildNode;
}

function readStatementEntryDetailsMatchMsgId(detailsNode) {
    var batchMsgIdNode = firstGrandChildElement(detailsNode, ['Btch', 'MsgId']);
    return batchMsgIdNode ? batchMsgIdNode.text : '';
}

function readStatementEntryDetailsAmount(detailsNode) {
    if (!detailsNode)
        return '';

    var amtNode = detailsNode.firstChildElement('Amt');
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
function extractCustomerNumber(esrNumber) {
    if (!esrNumber || esrNumber.length <= 0)
        return '';

    var customerNumber = esrNumber;

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
            var invLen = customerNumber.substr(4, 1);
            var cust = customerNumber.substr(5, invLen);
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
            var cust = customerNumber.substr(11, 7);
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
                var customerMethod = eval(this.params.customer_no.method);
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

function extractInvoiceNumber(esrNumber) {
    if (!esrNumber || esrNumber.length <= 0)
        return '';

    var invoiceNumber = esrNumber;

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
            var invLen = invoiceNumber.substr(4, 1);
            var inv = invoiceNumber.substr(5, invLen);
            var invNoBegin = 5 + Number(invLen);
            var invNoLen = invoiceNumber.substr(invNoBegin, 1);
            var invNo = invoiceNumber.substr(invNoBegin + 1, invNoLen);
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
            var inv = invoiceNumber.substr(18, 7);
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
            var invoiceMethod = eval(this.params.invoice_no.method);
            if (typeof (invoiceMethod) === 'function') {
                invoiceNumber = invoiceMethod(invoiceNumber);
            }
        }

        // Remove traling zeros
        invoiceNumber = invoiceNumber.replace(/^0+/, '')
    }

    return invoiceNumber;
}

function readStatementEntryDetailsDescription(detailsNode, isCredit) {
    var detailsDescriptionTexts = [];

    detailsDescriptionTexts.push(readStatementEntryDetailsAddress(detailsNode, isCredit));

    if (detailsNode.hasChildElements('RmtInf')) {
        var ustrdNode = detailsNode.firstChildElement('RmtInf').firstChildElement('Ustrd');
        while (ustrdNode) {
            var ustrdString = ustrdNode.text.trim();
            if (ustrdString === '?REJECT?0') {
                ustrdString = '';
            }
            if (ustrdString.length === 0)
                break;
            detailsDescriptionTexts.push(ustrdString);
            ustrdNode = ustrdNode.nextSiblingElement('Ustrd');
        }
    } else if (detailsNode.hasChildElements('AddtlTxInf')) {
        var addtlTxInfString = detailsNode.firstChildElement('AddtlTxInf').text.trim();
        if (addtlTxInfString.length > 0)
            detailsDescriptionTexts.push(addtlTxInfString);
    }

    var rmtInfRefNode = firstGrandChildElement(detailsNode, ['RmtInf', 'Strd', 'CdtrRefInf', 'Ref']);
    var detailEsrReference = rmtInfRefNode ? rmtInfRefNode.text.trim() : '';
    if (detailEsrReference.length > 0)
        detailsDescriptionTexts.push(detailEsrReference); // removed lang param.

    return this.joinNotEmpty(detailsDescriptionTexts, ' / ');
}

function readStatementEntryDetailsAddress(detailsNode, isCredit) {
    var rltdPtiesNode = detailsNode.firstChildElement('RltdPties');
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

function joinNotEmpty(texts, separator) {
    var cleanTexts = texts.filter(function (n) { return n && n.trim().length });
    return cleanTexts.join(separator);
}
