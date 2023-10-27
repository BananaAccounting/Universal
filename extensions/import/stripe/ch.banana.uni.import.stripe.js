// Copyright [2023] [Banana.ch SA - Lugano Switzerland]
//
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
//
// @id = ch.banana.uni.import.stripe
// @api = 1.0
// @pubdate = 2023-10-27
// @publisher = Banana.ch SA
// @description = Stripe - Import movements .csv (Banana+ Advanced)
// @doctype = 100.*; 110.*; 130.*
// @docproperties =
// @task = import.transactions
// @outputformat = tablewithheaders
// @inputdatasource = openfiledialog
// @inputfilefilter = Text files (*.txt *.csv);;All files (*.*)
// @timeout = -1
// @includejs = import.utilities.js


//Transactions types.
const PAYOUT_MOV = "payout";
const CHARGE_MOV = "charge";
const PAYMENT_MOV = "payment";
const RES_FUNDS_MOV = "reserved_funds";
const DOUBLE_ENTRY_TYPE = "100";
const INCOME_EXPENSES_TYPE = "110";
// AccountsNames
const STRIPE_ACCOUNT = "stripeaccount"
const STRIPE_IN = "stripein"
const STRIPE_FUNDS = "stripefunds"
const STRIPE_FEE = "stripefee"
// Tables
const ACCOUNTS_TABLE = "Accounts"
const CATEGORIES_TABLE = "Categories"
//Columns
const CATEGORY_COLUMN = "Category"
const ACCOUNT_COLUMN = "Account"
//Others
const CONTRA_ACCOUNT = "[CA]"

/**
 *  Documentation of the extension available in the readme.md file present in this project.
 */

function exec(inData) {

    let importUtilities = new ImportUtilities(Banana.document);
    let userParam = {};
    let banDoc = Banana.document;

    if (!inData)
        return "";

    if (!importUtilities.verifyBananaAdvancedVersion())
        return "";

    userParam = settingsDialog();
    if (!userParam) {
        return "";
    }

    let transactions = processStripeTransactions(inData, userParam, banDoc);
    if (!transactions)
        importUtilities.getUnknownFormatError();

    return transactions;
}

/**
 * CSV  structure details: (Insert example rows)
 */
var ImportPaymentsTransactionsFormat1 = class ImportPaymentsTransactionsFormat1 extends ImportUtilities {
    constructor(banDocument, userParam) {
        super(banDocument, userParam);

        this.decimalSeparator = ".";
        this.param = userParam;
        this.texts = getTexts(banDocument);
    }

    match(transactionsData) {

        if (transactionsData.length === 0)
            return false;

        for (var i = 0; i < transactionsData.length; i++) {
            var transaction = transactionsData[i];

            var formatMatched = true;

            if (formatMatched && transaction["balance_transaction_id"] && transaction["balance_transaction_id"] !== "")
                formatMatched = true;
            else
                formatMatched = false;

            if (formatMatched && transaction["automatic_payout_effective_at"] && transaction["automatic_payout_effective_at"].length >= 16 &&
                transaction["automatic_payout_effective_at"].match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/))
                formatMatched = true;
            else
                formatMatched = false;

            if (formatMatched && transaction["available_on"] && transaction["available_on"].length >= 16 &&
                transaction["available_on"].match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/))
                formatMatched = true;
            else
                formatMatched = false;

            if (formatMatched)
                return true;
        }

        return false;
    }

    processTransactions(transactions, banDoc) {

        let accoutingType = banDoc.info("Base", "FileTypeGroup");
        let headers = [];
        let objectArrayToCsv = [];
        let processedTrans = {};

        if (accoutingType == INCOME_EXPENSES_TYPE) {
            processedTrans = this.processTransactions_IncomeExpenses(transactions);
            headers = ["Date", "ExternalReference", "Description", "Income", "Expenses", "Account", "Category"];
        } else if (accoutingType == DOUBLE_ENTRY_TYPE) {
            processedTrans = this.processTransactions_DoubleEntry(transactions);
            headers = ["Date", "ExternalReference", "Description", "AccountDebit", "AccountCredit", "Amount"];
        }

        objectArrayToCsv = Banana.Converter.objectArrayToCsv(headers, processedTrans, ";");

        return objectArrayToCsv;
    }
    /**
     * 
     * * In Banana we create the following structured transaction:
     * 
     * DATE         DESCRIPTION              INCOME   EXPENSES   ACCOUNT           CATEGORY
     * 07.11.2023	payment description 	 24.60               StripeAccount     [CA]
     * 
     */

    processTransactions_IncomeExpenses(transactions) {
        // Filter and map rows
        let transactionsObjs = [];
        for (let i = 0; i < transactions.length; i++) {
            var transaction = transactions[i];
            let trType = transaction["reporting_category"];
            this.decimalSeparator = getDecimalSeparator(transaction["net"]);
            switch (trType) {
                case CHARGE_MOV:
                    let trRow = initTrRowObjectStructure_IncomeExpenses();
                    trRow.Date = Banana.Converter.toInternalDateFormat(transaction["available_on"], this.param.dateFormat);
                    trRow.ExternalReference = transaction["balance_transaction_id"];
                    let description = this.getDescription(transaction, transaction["reporting_category"]); // Put the type in the description for the Rules !!!!
                    trRow.Description = description;
                    let amount = transaction["net"];
                    if (amount.length > 0) {
                        trRow.Income = Banana.Converter.toInternalNumberFormat(amount, this.decimalSeparator);
                    }
                    trRow.Expenses = CONTRA_ACCOUNT;
                    trRow.Account = this.param.stripeAccount;
                    trRow.Category = this.param.stripeIn;

                    transactionsObjs.push(trRow);
                    break;
            }
        }
        return transactionsObjs;
    }
    /**
    * 
    * * In Banana we create the following structured transaction:
    * 
    * DATE         DESCRIPTION                  DEBIT    CREDIT    AMOUNT
    * 07.11.2023	Payment description 	     0870       [CA]     24.60
    * 
    */
    processTransactions_DoubleEntry(transactions) {
        // Filter and map rows
        let transactionsObjs = [];
        for (let i = 0; i < transactions.length; i++) {
            var transaction = transactions[i];
            let trType = transaction["reporting_category"];
            this.decimalSeparator = getDecimalSeparator(transaction["net"]);
            switch (trType) {
                case CHARGE_MOV:
                    let trRow = initTrRowObjectStructure_DoubleEntry();
                    trRow.Date = Banana.Converter.toInternalDateFormat(transaction["available_on"], this.param.dateFormat);
                    trRow.ExternalReference = transaction["balance_transaction_id"];
                    let description = this.getDescription(transaction, this.texts.net); // Put the type in the description for the Rules !!!!
                    trRow.Description = description;
                    trRow.AccountDebit = this.param.stripeAccount;
                    trRow.AccountCredit = this.param.stripeIn;
                    let amount = transaction["net"];
                    if (amount.length > 0) {
                        trRow.Amount = Banana.Converter.toInternalNumberFormat(amount, this.decimalSeparator);
                    }

                    transactionsObjs.push(trRow);
                    break;
            }
        }
        return transactionsObjs;
    }

    getDescription(element, trType) {
        let description = "";

        description = element["description"];


        if (description !== "" && trType !== "") {
            description += ", " + trType;
        } else if (description == "") {
            description = trType;
        }
        return description;
    }

}

/**
 * CSV  structure details: (Insert example rows)
 * @param {*} banDocument 
 */
var ImportStripeAllTransactionsFormat1 = class ImportStripeAllTransactionsFormat1 extends ImportUtilities {
    constructor(banDocument, userParam) {
        super(banDocument, userParam);

        this.decimalSeparator = ".";
        this.param = userParam;
        this.texts = getTexts(banDocument);
    }

    match(transactionsData) {

        if (transactionsData.length === 0)
            return false;

        for (var i = 0; i < transactionsData.length; i++) {
            var transaction = transactionsData[i];

            var formatMatched = true;

            if (formatMatched && transaction["id"] && transaction["id"] !== "")
                formatMatched = true;
            else
                formatMatched = false;

            if (formatMatched && transaction["Created (UTC)"] && transaction["Created (UTC)"].length >= 16 &&
                transaction["Created (UTC)"].match(/^\d{2,4}[-.]\d{2}[-.]\d{2} \d{2}:\d{2}$/))
                formatMatched = true;
            else
                formatMatched = false;

            if (formatMatched && transaction["Available On (UTC)"] && transaction["Available On (UTC)"].length >= 16 &&
                transaction["Available On (UTC)"].match(/^\d{2,4}[-.]\d{2}[-.]\d{2} \d{2}:\d{2}$/))
                formatMatched = true;
            else
                formatMatched = false;

            if (formatMatched)
                return true;
        }

        return false;
    }

    processTransactions(transactions, banDoc) {

        let accoutingType = banDoc.info("Base", "FileTypeGroup");
        let headers = [];
        let objectArrayToCsv = [];
        let processedTrans = {};

        if (accoutingType == INCOME_EXPENSES_TYPE) {
            processedTrans = this.processTransactions_IncomeExpenses(transactions);
            headers = ["Date", "ExternalReference", "Description", "Income", "Expenses", "Account", "Category", "Notes"];
        } else if (accoutingType == DOUBLE_ENTRY_TYPE) {
            processedTrans = this.processTransactions_DoubleEntry(transactions);
            headers = ["Date", "ExternalReference", "Description", "AccountDebit", "AccountCredit", "Amount", "Notes"];
        }

        objectArrayToCsv = Banana.Converter.objectArrayToCsv(headers, processedTrans, ";");

        return objectArrayToCsv;
    }

    /**
     * 
     * * In Banana we create the following structured transaction:
     * 
     * DATE         DESCRIPTION             DEBIT    CREDIT    AMOUNT
     * 07.11.2023	payment description 	         3220      25.59
     * 07.11.2023	Net 	                0870               24.60
     * 07.11.2023	Fee 	                2901                0.99
     * 07.11.2023	Reserved Funds 	        1220	0870        6.15
     * 13.11.2023	Reserved Funds 	        0870	1220        6.15
     * 
     */
    processTransactions_DoubleEntry(transactions) {
        // Filter and map rows
        let transactionID = "";
        let transactionsObjs = [];
        for (let i = 0; i < transactions.length; i++) {
            var transaction = transactions[i];
            let trType = transaction["Type"];
            this.decimalSeparator = getDecimalSeparator(transaction["Amount"]);
            switch (trType) {
                case PAYOUT_MOV:
                    transactionID = transaction["Transfer"];
                    /** We do not need to take this amount directly but it is visible in the
                     * account card.
                    */
                    break;
                case CHARGE_MOV:
                case PAYMENT_MOV:
                    if (transactionID == transaction["Transfer"]) { // Has a payout.
                        transactionsObjs.push(this.mapTransaction_Payment_Gross_DoubleEntry(transaction));
                        transactionsObjs.push(this.mapTransaction_Payment_Net_DoubleEntry(transaction));
                        transactionsObjs.push(this.mapTransaction_Payment_Fee_DoubleEntry(transaction));
                    }
                    break;
                case RES_FUNDS_MOV:
                    /**
                     * When the reimbursement amount is returned, the row does not have an id, 
                     * in that case I check if the id is empty, if it is, we assume is related to the previous id
                     * operations.
                     */
                    if (transactionID == transaction["Transfer"] || transaction["Transfer"] == "") { // Ref
                        transactionsObjs.push(this.mapTransaction_Refund_DoubleEntry(transaction));
                    }
                    break;
            }
        }

        return transactionsObjs;

    }

    /**
     * 
     * * In Banana we create the following structured transaction:
     * 
     * DATE         DESCRIPTION              INCOME   EXPENSES   ACCOUNT     CATEGORY
     * 07.11.2023	payment description 	 25.59                           StripeIn
     * 07.11.2023	Net 	                 24.60               StripeAcc
     * 07.11.2023	Fee 	                          0.99                   StripeFee
     * 07.11.2023	Reserved Funds 	                  6.15       StripeAcc   StripeFunds
     * 13.11.2023	Reserved Funds 	         6.15                StripeAcc   StripeFunds
     * 
     */

    processTransactions_IncomeExpenses(transactions) {
        // Filter and map rows
        let transactionID = "";
        let transactionsObjs = [];
        for (let i = 0; i < transactions.length; i++) {
            var transaction = transactions[i];
            let trType = transaction["Type"];
            this.decimalSeparator = getDecimalSeparator(transaction["Amount"]);
            switch (trType) {
                case PAYOUT_MOV:
                    transactionID = transaction["Transfer"];
                    /** We do not need to take this amount directly but it is visible in the
                     * account card.
                    */
                    break;
                case CHARGE_MOV:
                case PAYMENT_MOV:
                    if (transactionID == transaction["Transfer"]) { // Has a payout.
                        transactionsObjs.push(this.mapTransaction_Payment_Gross_IncomeExpenses(transaction));
                        transactionsObjs.push(this.mapTransaction_Payment_Net_IncomeExpenses(transaction));
                        transactionsObjs.push(this.mapTransaction_Payment_Fee_IncomeExpenses(transaction));
                    } else {
                        continue;
                    }
                    break;
                case RES_FUNDS_MOV:
                    /**
                     * When the reimbursement amount is returned, the row does not have an id, 
                     * in that case I check if the id is empty, if it is, we assume is related to the previous id
                     * operations.
                     */
                    if (transactionID == transaction["Transfer"] || transaction["Transfer"] == "") { // Ref
                        transactionsObjs.push(this.mapTransaction_Refund_IncomeExpenses(transaction));
                    }
                    break;
            }
        }

        return transactionsObjs;
    }

    /**
     * Payments - Transactions received from paying customers (Gross Amount) for Income and expenses accounting.
     */
    mapTransaction_Payment_Gross_IncomeExpenses(transaction) {
        let trRow = initTrRowObjectStructure_IncomeExpenses();
        trRow.Date = Banana.Converter.toInternalDateFormat(transaction["Available On (UTC)"], this.param.dateFormat);
        trRow.ExternalReference = transaction["id"]; // Balance id
        let description = this.getDescription(transaction, transaction["Type"]); // Put the type in the description for the Rules !!!!
        trRow.Description = description;
        let amount = transaction["Amount"];
        if (amount.length > 0) {
            trRow.Income = Banana.Converter.toInternalNumberFormat(amount, this.decimalSeparator);
        }
        trRow.Expenses = "";
        trRow.Account = "";
        trRow.Category = this.param.stripeIn;
        trRow.Notes = transaction["Transfer"];

        return trRow;
    }

    /**
    * Payments - Transactions received from paying customers (Gross Amount) for Double entry accounting.
    */
    mapTransaction_Payment_Gross_DoubleEntry(transaction) {
        let trRow = initTrRowObjectStructure_DoubleEntry();
        trRow.Date = Banana.Converter.toInternalDateFormat(transaction["Available On (UTC)"], this.param.dateFormat);
        trRow.ExternalReference = transaction["id"];
        let description = this.getDescription(transaction, transaction["Type"]); // Put the type in the description for the Rules !!!!
        trRow.Description = description;
        trRow.AccountDebit = CONTRA_ACCOUNT;
        trRow.AccountCredit = this.param.stripeIn;
        let amount = transaction["Amount"];
        if (amount.length > 0) {
            trRow.Amount = Banana.Converter.toInternalNumberFormat(amount, this.decimalSeparator);
        }
        trRow.Notes = transaction["Transfer"];

        return trRow;
    }

    /**
     * Payments - Transactions received from paying customers (Net Amount) for Income and Expenses accounting
     */
    mapTransaction_Payment_Net_IncomeExpenses(transaction) {
        let trRow = initTrRowObjectStructure_IncomeExpenses();
        trRow.Date = Banana.Converter.toInternalDateFormat(transaction["Available On (UTC)"], this.param.dateFormat);
        trRow.ExternalReference = transaction["id"];
        let description = this.getDescription(transaction, this.texts.net); // Put the type in the description for the Rules !!!!
        trRow.Description = description;
        let amount = transaction["Net"];
        if (amount.length > 0) {
            trRow.Income = Banana.Converter.toInternalNumberFormat(amount, this.decimalSeparator);
        }

        trRow.Expenses = "";
        trRow.Account = this.param.stripeAccount;
        trRow.Category = "";
        trRow.Notes = transaction["Transfer"];

        return trRow;
    }

    /**
    * Payments - Transactions received from paying customers (Net Amount) for Double entry accounting
    */
    mapTransaction_Payment_Net_DoubleEntry(transaction) {
        let trRow = initTrRowObjectStructure_DoubleEntry();
        trRow.Date = Banana.Converter.toInternalDateFormat(transaction["Available On (UTC)"], this.param.dateFormat);
        trRow.ExternalReference = transaction["id"];
        let description = this.getDescription(transaction, this.texts.net); // Put the type in the description for the Rules !!!!
        trRow.Description = description;
        trRow.AccountDebit = this.param.stripeAccount;
        trRow.AccountCredit = CONTRA_ACCOUNT;
        let amount = transaction["Net"];
        if (amount.length > 0) {
            trRow.Amount = Banana.Converter.toInternalNumberFormat(amount, this.decimalSeparator);
        }
        trRow.Notes = transaction["Transfer"];

        return trRow;
    }

    /**
     * Payments - Transactions received from paying customers (Fee Amount) for Income and expenses accounting.
     */
    mapTransaction_Payment_Fee_IncomeExpenses(transaction) {
        let trRow = initTrRowObjectStructure_IncomeExpenses();
        trRow.Date = Banana.Converter.toInternalDateFormat(transaction["Available On (UTC)"], this.param.dateFormat);
        trRow.ExternalReference = transaction["id"];
        let description = this.getDescription(transaction, this.texts.fee); // Put the type in the description for the Rules !!!!
        trRow.Description = description;
        let amount = transaction["Fee"];
        trRow.Income = "";
        if (amount.length > 0) {
            trRow.Expenses = Banana.Converter.toInternalNumberFormat(amount, this.decimalSeparator);
        }
        trRow.Account = "";
        trRow.Category = this.param.stripeFee;
        trRow.Notes = transaction["Transfer"];

        return trRow;
    }

    /**
     * Payments - Transactions received from paying customers (Fee Amount) for Double entry accounting.
     */
    mapTransaction_Payment_Fee_DoubleEntry(transaction) {
        let trRow = initTrRowObjectStructure_DoubleEntry();
        trRow.Date = Banana.Converter.toInternalDateFormat(transaction["Available On (UTC)"], this.param.dateFormat);
        trRow.ExternalReference = transaction["id"];
        let description = this.getDescription(transaction, this.texts.fee); // Put the type in the description for the Rules !!!!
        trRow.Description = description;
        trRow.AccountDebit = this.param.stripeFee;
        trRow.AccountCredit = CONTRA_ACCOUNT;
        let feeAmount = transaction["Fee"];
        if (feeAmount.length > 0) {
            trRow.Amount = Banana.Converter.toInternalNumberFormat(feeAmount, this.decimalSeparator);
        }
        trRow.Notes = transaction["Transfer"];

        return trRow;
    }

    /**
    * Refunds - Funds returned to customers for Income and Expenses accounting.
    */
    mapTransaction_Refund_IncomeExpenses(transaction) {
        let trRow = initTrRowObjectStructure_IncomeExpenses();
        trRow.Date = Banana.Converter.toInternalDateFormat(transaction["Available On (UTC)"], this.param.dateFormat);
        trRow.ExternalReference = transaction["id"];
        let description = this.getDescription(transaction, ""); // Put the type in the description for the Rules !!!!
        trRow.Description = description;
        let amount = transaction["Amount"];
        if (amount.length > 0) {
            if (amount[0] === "-") {
                amount = amount.replace(/-/g, ''); //remove minus sign
                trRow.Income = "";
                trRow.Expenses = Banana.Converter.toInternalNumberFormat(amount, this.decimalSeparator);
            } else {
                trRow.Income = Banana.Converter.toInternalNumberFormat(amount, this.decimalSeparator);
                trRow.Expenses = "";
            }
        }

        trRow.Account = this.param.stripeAccount;
        trRow.Category = this.param.stripeFunds;
        trRow.Notes = transaction["Transfer"];

        return trRow;
    }

    /**
    * Reserved Funds - returned to customers for Income and Expenses accounting.
    * */
    mapTransaction_Refund_DoubleEntry(transaction) {
        let trRow = initTrRowObjectStructure_DoubleEntry();
        trRow.Date = Banana.Converter.toInternalDateFormat(transaction["Available On (UTC)"], this.param.dateFormat);
        trRow.ExternalReference = transaction["id"];
        let description = this.getDescription(transaction, ""); // Put the type in the description for the Rules !!!!
        trRow.Description = description;
        let amount = transaction["Amount"];
        if (amount.length > 0) {
            if (amount[0] === "-") {
                trRow.AccountDebit = this.param.stripeFunds;
                trRow.AccountCredit = this.param.stripeAccount;
                amount = amount.replace(/-/g, ''); //remove minus sign
                trRow.Amount = Banana.Converter.toInternalNumberFormat(amount, this.decimalSeparator);
            } else {
                trRow.AccountDebit = this.param.stripeAccount;
                trRow.AccountCredit = this.param.stripeFunds;
                trRow.Amount = Banana.Converter.toInternalNumberFormat(amount, this.decimalSeparator);
            }
        }
        trRow.Notes = transaction["Transfer"];

        return trRow;
    }

    getDescription(element, trType) {
        let description = "";

        description = element["Description"];

        if (description !== "" && trType !== "") {
            description += ", " + trType;
        } else if (description == "") {
            description = trType;
        }
        return description;
    }
}

/**
 * Method created to access the data correctly trough the tests.
 */
function processStripeTransactions(inData, userParam, banDoc) {
    let convertionParam = defineConversionParam(inData);
    let csvData = "";

    if (!banDoc)
        return "";

    csvData = Banana.Converter.csvToArray(inData, convertionParam.separator, convertionParam.textDelim);
    transactionsData = getformattedData(csvData, convertionParam);

    let stripeAllTransactionsFormat1 = new ImportStripeAllTransactionsFormat1(banDoc, userParam);
    if (stripeAllTransactionsFormat1.match(transactionsData)) {
        return stripeAllTransactionsFormat1.processTransactions(transactionsData, banDoc);
    }

    let stripeBalanceChangeFormat1 = new ImportPaymentsTransactionsFormat1(banDoc, userParam);
    if (stripeBalanceChangeFormat1.match(transactionsData)) {
        return stripeBalanceChangeFormat1.processTransactions(transactionsData, banDoc);
    }

    return "";
}
function getTexts(banDocument) {

    let lang = getLang(banDocument);

    if (lang == "")
        return lang;

    switch (lang) {
        case 'de':
            return getTextsDe();
        case 'it':
            return getTextsIt();
        case 'fr':
            return getTextsFr();
        case 'en':
        default:
            return getTextsEn();
    }
}

function getTextsDe() {
    let texts = {};

    texts.dateFormat = "Datum Format";
    texts.stripeAccount = "Stripe Account";
    texts.stripeIn = "Stripe In";
    texts.stripeResFunds = "Stripe Reserved funds";
    texts.stripeFee = "Stripe Fee";
    texts.accountMissing = "Fehlendes Konto";
    texts.accountErrorMsg = "Dieses Konto existiert nicht in Ihrem Kontenplan";
    texts.net = "Net";
    texts.fee = "Fee";

    return texts;
}

function getTextsIt() {
    let texts = {};

    texts.dateFormat = "Formato Data";
    texts.stripeAccount = "Stripe Account";
    texts.stripeIn = "Stripe In";
    texts.stripeResFunds = "Stripe Reserved funds";
    texts.stripeFee = "Stripe Fee";
    texts.accountMissing = "Conto mancante";
    texts.accountErrorMsg = "Questo conto non esiste nel piano dei conti";
    texts.net = "Net";
    texts.fee = "Fee";

    return texts;
}

function getTextsFr() {
    let texts = {};

    texts.dateFormat = "Format de date";
    texts.stripeAccount = "Stripe Account";
    texts.stripeIn = "Stripe In";
    texts.stripeResFunds = "Stripe Reserved funds";
    texts.stripeFee = "Stripe Fee";
    texts.accountMissing = "Compte manquant";
    texts.accountErrorMsg = "Ce compte n'existe pas dans le plan comptable";
    texts.net = "Net";
    texts.fee = "Fee";

    return texts;
}

function getTextsEn() {
    let texts = {};

    texts.dateFormat = "Date Format";
    texts.stripeAccount = "Stripe Account";
    texts.stripeIn = "Stripe In";
    texts.stripeResFunds = "Stripe Reserved funds";
    texts.stripeFee = "Stripe Fee";
    texts.accountMissing = "Missing account";
    texts.accountErrorMsg = "This account does not exists in your chart of accounts";
    texts.net = "Net";
    texts.fee = "Fee";

    return texts;
}

function getLang(banDocument) {
    let lang = 'en';
    if (banDocument)
        lang = banDocument.locale;
    else if (Banana.application.locale)
        lang = Banana.application.locale;
    if (lang.length > 2)
        lang = lang.substr(0, 2);
    return lang;
}

function initTrRowObjectStructure_IncomeExpenses() {
    let trRow = {};

    trRow.Date = "";
    trRow.ExternalReference = "";
    trRow.Description = "";
    trRow.Income = "";
    trRow.Expenses = "";
    trRow.Account = "";
    trRow.Category = "";
    trRow.Notes = "";

    return trRow;
}

function initTrRowObjectStructure_DoubleEntry() {
    let trRow = {};

    trRow.Date = "";
    trRow.ExternalReference = "";
    trRow.Description = "";
    trRow.AccountDebit = "";
    trRow.AccountCredit = "";
    trRow.Amount = "";
    trRow.Notes = "";

    return trRow;
}

function getDecimalSeparator(amount) {
    /** As far as we know the decimal separator could be: ',' or '.' and there is no thousand divisor  */
    if (amount !== "") {
        const parts = amount.split('.');
        if (parts.length === 1) {
            const commaParts = amount.split(',');
            if (commaParts.length === 2 && !isNaN(commaParts[1])) {
                return ',';
            }
        } else if (parts.length === 2 && !isNaN(parts[1])) {
            return '.';
        }
    }
}
/** 
 * Set headers to English.
*/
function getformattedData(csvData, convertionParam) {
    let columns = this.getHeaderData(csvData, convertionParam); //array
    let rows = this.getRowData(csvData, convertionParam); //array of array
    let form = [];

    //We pass them all so as not to have to guess the language of the header.
    columns = this.convertHeaderIt(columns); // Convert headers from italian to english.
    columns = this.convertHeaderDe(columns); // Convert headers from german to english.
    columns = this.convertHeaderFr(columns); // Convert headers from french to english.

    //Load the form with data taken from the array. Create objects
    this.loadForm(form, columns, rows);
    return form;
}

function convertHeaderIt(columns) {
    for (var i = 0; i < columns.length; i++) {
        // Convert headers...
    }

    return columns;
}

function convertHeaderDe(columns) {
    for (var i = 0; i < columns.length; i++) {
        // Convert headers...
    }

    return columns;
}

function convertHeaderFr(columns) {
    for (var i = 0; i < columns.length; i++) {
        // Convert headers...
    }

    return columns;
}

function getHeaderData(csvData, convertionParam) {
    var headerData = csvData[convertionParam.headerLineStart];
    for (var i = 0; i < headerData.length; i++) {

        headerData[i] = headerData[i].trim();

        if (!headerData[i]) {
            headerData[i] = i;
        }
    }
    return headerData;
}

function getRowData(csvData, convertionParam) {
    var rowData = [];
    for (var i = convertionParam.dataLineStart; i < csvData.length; i++) {
        rowData.push(csvData[i]);
    }
    return rowData;
}

//The purpose of this function is to load all the data (titles of the columns and rows) and create a list of objects.
//Each object represents a row of the csv file
function loadForm(form, columns, rows) {
    var obj = new Object;

    for (var j = 0; j < rows.length; j++) {
        var obj = {};

        for (var i = 0; i < columns.length; i++) {
            obj[columns[i]] = rows[j][i];
        }
        form.push(obj);
    }
}

function settingsDialog() {

    let dialogParam = {};
    let savedDlgParam = Banana.document.getScriptSettings("stripeImportDlgParams"); //Parametri per struttura dialogo.
    if (savedDlgParam.length > 0) {
        let parsedParam = JSON.parse(savedDlgParam);
        if (parsedParam) {
            dialogParam = parsedParam;
        }
    }

    //Verify Params.
    verifyParam(dialogParam);
    //Settings dialog
    var dialogTitle = 'Settings';
    var pageAnchor = 'stripeImportDlgParams';
    var convertedParam = {};

    convertedParam = convertParam(dialogParam);
    if (!Banana.Ui.openPropertyEditor(dialogTitle, convertedParam, pageAnchor))
        return false;
    for (var i = 0; i < convertedParam.data.length; i++) {
        // Read values to dialogparam (through the readValue function)
        if (typeof (convertedParam.data[i].readValue) == "function")
            convertedParam.data[i].readValue();
    }
    //set the parameters
    let paramToString = JSON.stringify(dialogParam);
    Banana.document.setScriptSettings("stripeImportDlgParams", paramToString);
    return dialogParam;
}


function initParam() {
    var params = {};

    params.dateFormat = "yyyy-mm-dd";
    params.stripeAccount = ""; // Bank account
    params.stripeIn = ""; // Revenues account.
    params.stripeFunds = ""; // Costs account.
    params.stripeFee = ""; // Costs account.

    return params;

}

function convertParam(userParam) {
    var paramList = {};
    let texts = getTexts();
    var defaultParam = initParam();
    paramList.version = '1.0';
    paramList.data = [];

    var param = {};
    param.name = 'dateformat';
    param.title = texts.dateFormat;
    param.type = 'string';
    param.value = userParam.dateFormat ? userParam.dateFormat : '';
    param.defaultvalue = defaultParam.dateFormat;
    param.readValue = function () {
        userParam.dateFormat = this.value;
    }
    paramList.data.push(param);

    var param = {};
    param.name = STRIPE_ACCOUNT;
    param.title = texts.stripeAccount;
    param.type = 'string';
    param.value = userParam.stripeAccount ? userParam.stripeAccount : '';
    param.defaultvalue = defaultParam.stripeAccount;
    param.readValue = function () {
        userParam.stripeAccount = this.value;
    }
    paramList.data.push(param);

    var param = {};
    param.name = STRIPE_IN;
    param.title = texts.stripeIn;
    param.type = 'string';
    param.value = userParam.stripeIn ? userParam.stripeIn : '';
    param.defaultvalue = defaultParam.stripeIn;
    param.readValue = function () {
        userParam.stripeIn = this.value;
    }
    paramList.data.push(param);

    var param = {};
    param.name = STRIPE_FUNDS;
    param.title = texts.stripeResFunds;
    param.type = 'string';
    param.value = userParam.stripeFunds ? userParam.stripeFunds : '';
    param.defaultvalue = defaultParam.stripeFunds;
    param.readValue = function () {
        userParam.stripeFunds = this.value;
    }
    paramList.data.push(param);

    var param = {};
    param.name = STRIPE_FEE;
    param.title = texts.stripeFee;
    param.type = 'string';
    param.value = userParam.stripeFee ? userParam.stripeFee : '';
    param.defaultvalue = defaultParam.stripeFee;
    param.readValue = function () {
        userParam.stripeFee = this.value;
    }
    paramList.data.push(param);

    return paramList;
}

function verifyParam(dialogParam) {

    let defaultParam = initParam();

    if (!dialogParam.dateFormat) {
        dialogParam.dateFormat = defaultParam.dateFormat;
    }
    if (!dialogParam.stripeAccount) {
        dialogParam.stripeAccount = defaultParam.stripeAccount;
    }
    if (!dialogParam.stripeIn) {
        dialogParam.stripeIn = defaultParam.stripeIn;
    }
    if (!dialogParam.stripeFunds) {
        dialogParam.stripeFunds = defaultParam.stripeFunds;
    }
    if (!dialogParam.stripeFee) {
        dialogParam.stripeFee = defaultParam.stripeFee;
    }
}

function validateParams(params) {
    const accountNames = [STRIPE_ACCOUNT, STRIPE_IN, STRIPE_FUNDS, STRIPE_FEE];
    const accountsList = [];
    let texts = getTexts();
    params.data.forEach(item => {
        if (accountNames.includes(item.name)) {
            accountsList.push(item.value);
        }
    });

    if (accountsList.length > 0) {
        for (var i = 0; i < params.data.length; i++) {
            account = params.data[i].value;
            if (accountsList.includes(account)) {
                if (account == "") {
                    params.data[i].errorMsg = texts.accountMissing;
                    return false;
                } else if (!AccountExists(account)) {
                    params.data[i].errorMsg = texts.accountErrorMsg;
                    return false;
                }
            }
        }
    }

    return true;
}

function AccountExists(account) {
    let banDoc = Banana.document;
    let accoutingType = banDoc.info("Base", "FileTypeGroup");

    if (banDoc && account) {
        let accountsTable = banDoc.table(ACCOUNTS_TABLE);
        if (!accountsTable)
            return false;
        //check in the chart of accounts.
        for (var i = 0; i < accountsTable.rowCount; i++) {
            var tRow = accountsTable.row(i);
            // Check if the account is present in the chart of accounts.
            if (account == tRow.value(ACCOUNT_COLUMN)) {
                return true;
            }
        }
        //check also in the category table
        if (accoutingType == INCOME_EXPENSES_TYPE) {
            let categoriesTable = banDoc.table(CATEGORIES_TABLE);
            for (var i = 0; i < categoriesTable.rowCount; i++) {
                var tRow = categoriesTable.row(i);
                // Check if the account is present in the chart of accounts.
                if (account == tRow.value(CATEGORY_COLUMN)) {
                    return true;
                }
            }
        }
    }
    return false;

}


function defineConversionParam(inData) {

    var csvData = Banana.Converter.csvToArray(inData);
    var header = String(csvData[0]);
    var convertionParam = {};
    /** SPECIFY THE SEPARATOR AND THE TEXT DELIMITER USED IN THE CSV FILE */
    convertionParam.format = "csv"; // available formats are "csv", "html"
    //get text delimiter
    convertionParam.textDelim = '';
    // get separator
    if (header.indexOf(';') >= 0) {
        convertionParam.separator = ';';
    } else {
        convertionParam.separator = ',';
    }

    /** SPECIFY AT WHICH ROW OF THE CSV FILE IS THE HEADER (COLUMN TITLES)
    We suppose the data will always begin right away after the header line */
    convertionParam.headerLineStart = 0;
    convertionParam.dataLineStart = 1;

    /** SPECIFY THE COLUMN TO USE FOR SORTING
    If sortColums is empty the data are not sorted */
    convertionParam.sortColums = ["Date", "Doc"];
    convertionParam.sortDescending = false;

    return convertionParam;
}