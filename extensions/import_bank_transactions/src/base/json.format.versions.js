/*Json structure: (Version 2.0, 10.04.2024).
 * Fields were named in a manner to follow the notation used for xml column names in banana and to keep
 * the notation the same throughout the JSON.
 * This format saves all the file and statement information at the same level as the transaction data, this way 
 * it's easier to manage the processed files (SQLite Database) in relation to the transactions actually imported.
 * If for a file, it results in transactions that have not been imported, this file is not saved as "processed" in the db.
 * */
let fileStatementData = {};

fileStatementData.TransactionsList = [
    {
        "FileId": "6e340b9cffb37a989ca6095ba428fbee5fcb6ceb5e79eabe3291d143177af8c8",
        "FileName": "C:/ P / Universal Images / Universal / extensions / bank_synchronisation / test / testcases /1284_test_Bank1 - B.xml",
        "FileType": "CAMT.053",
        "FileCreationDate": "Wed Jun 26 11:02:45 2024",
        "StatementIban": "CHXXXXXXXXXXXXXXX",
        "StatementCreationDate": "2024-02-02",
        "StatementOwner": "Happy Deer Group",
        "StatementCurrency": "CHF",
        "StatementInitialBalance": "1235.40",
        "StatementFinalBalance": "2100.20",
        "TransactionDate": "2024-04-21",
        "TransactionDateValue": "2024-04-21",
        "TransactionDescription": "Transfert",
        "TransactionIncome": "77.66",
        "TransactionExpenses": "",
        "TransactionExternalReference": "15324748436",
        "TransactionContraAccount": "",
        "TransactionCc1": "",
        "TransactionCc2": "",
        "TransactionCc3": "",
        "TransactionIsDetail": ""
    },
    {                  // second transaction
        "FileId": "6e340b9cffb37a989ca6095ba428fbee5fcb6ceb5e79eabe3291d143177af8c8",
        "FileName": "C:/ P / Universal Images / Universal / extensions / bank_synchronisation / test / testcases /1284_test_Bank1 - B.xml",
        "FileType": "CAMT.053",
        "FileCreationDate": "Wed Jun 26 11:02:45 2024",
        "StatementIban": "CHXXXXXXXXXXXXXXX",
        "StatementCreationDate": "2024-02-02",
        "StatementOwner": "Happy Deer Group",
        "StatementCurrency": "CHF",
        "StatementInitialBalance": "1235.40",
        "StatementFinalBalance": "2100.20",
        "TransactionDate": "2024-04-22",
        "TransactionDateValue": "2024-04-22",
        "TransactionDescription": "Transfert",
        "TransactionIncome": "16.00",
        "TransactionExpenses": "",
        "TransactionExternalReference": "987654321",
        "TransactionContraAccount": "",
        "TransactionCc1": "",
        "TransactionCc2": "",
        "TransactionCc3": "",
        "TransactionIsDetail": ""
    },
    {                // second statement data ...
        "FileId": "6e340b9cffb37a989ca6095ba428fbee5fcb6ceb5e79eabe3291d143177af8c8",
        "FileName": "C:/ P / Universal Images / Universal / extensions / bank_synchronisation / test / testcases /1284_test_Bank1 - B.xml",
        "FileType": "CAMT.053",
        "FileCreationDate": "Wed Jun 26 11:02:45 2024",
        "StatementIban": "CH111111111111111",
        "StatementCreationDate": "2024-02-02",
        "StatementParamOwner": "Sad Deer Group",
        "StatementCurrency": "CHF",
        "StatementInitialBalance": "123.00",
        "StatementFinalBalance": "650.75",
        "TransactionDate": "2024-04-22",
        "TransactionDateValue": "2024-04-22",
        "TransactionDescription": "Transfert",
        "TransactionIncome": "24.00",
        "TransactionExpenses": "",
        "TransactionExternalReference": "12123441242",
        "TransactionContraAccount": "",
        "TransactionCc1": "",
        "TransactionCc2": "",
        "TransactionCc3": "",
        "TransactionIsDetail": ""
    },
    {
        "FileId": "6e340b9cffb37a989ca6095ba428fbee5fcb6ceb5e79eabe3291d143177af8c8",
        "FileName": "C: / P / Universal Images / Universal / extensions / bank_synchronisation / test / testcases /1284_test_Bank1 - B.xml",
        "FileType": "CAMT.053",
        "FileCreationDate": "Wed Jun 26 11:02:45 2024",
        "StatementIban": "CH111111111111111",
        "StatementCreationDate": "2024-02-02",
        "StatementOwner": "Sad Deer Group",
        "StatementCurrency": "CHF",
        "StatementInitialBalance": "123.00",
        "StatementFinalBalance": "650.75",
        "TransactionDate": "2024-04-23",
        "TransactionDateValue": "2024-04-23",
        "TransactionDescription": "Transfert",
        "TransactionIncome": "",
        "TransactionExpenses": "7.00",
        "TransactionExternalReference": "45673412134",
        "TransactionContraAccount": "",
        "TransactionCc1": "",
        "TransactionCc2": "",
        "TransactionCc3": "",
        "TransactionIsDetail": ""
    },
    // other statements and other transactions
];

/* Json structure: (Version 1.0, 02.02.2024).
         * Fields were named in a manner to follow the notation used for xml column names in banana and to keep
         * the notation the same throughout the JSON.
         * {
         *   "FileName": C:/P/Universal Images/Universal/extensions/bank_synchronisation/test/testcases/1284_test_Bank1 - B.xml,
         *   "FileType": "CAMT.053"
         *   "FileCreationDate": 2024-02-02
         *   "FileStatementsData":[       // each element correspond to a statement (statement Node)
         *      {                   // first statement data ...
         *         "StatementParams":{      // params of the statement like iban, inital balance, final balance
         *                "StatementParamIban": "CHXXXXXXXXXXXXXXX",
         *                "StatementParamOwner": "Happy Deer Group"
         *                "StatementParamCurrency": "CHF"
         *                "StatementParamInitialBalance": "1235.40",
         *                "StatementParamFinalBalance"  : "2100.20",
         *           },
         *          StatementTransactions: [
         *              {                    // first transaction
         *                 "Date": "2024-04-21",
         *                 "DateValue": "2024-04-21",
         *                 "Description": "Transfert",
         *                 "Income": "77.66",
         *                 "Expenses": "",
         *                 "ExternalReference": "15324748436",
         *                 "ContraAccount": "",
         *                 "Cc1": "",
         *                 "Cc2": "",
         *                 "Cc3": "",
         *                 "IsDetail": ""
         *              },
         *              {                  // second transaction
         *                 "Date": "2024-04-22",
         *                 "DateValue": "2023-04-22",
         *                 "Description": "Payment",
         *                 "Income": "",
         *                 "Expenses": "34.25",
         *                 "ExternalReference": "19257246225",
         *                 "ContraAccount": "",
         *                 "Cc1": "",
         *                 "Cc2": "",
         *                 "Cc3": "",
         *                 "IsDetail": ""
         *              }
         *          ]
         *      },
         *      {                  // second statement data ...
         *         "StatementParams":{ 
         *                "StatementParamIban": "CH1111111111111111",
         *                "StatementParamOwner": "Sad Deer Group"
         *                "StatementParamCurrency": "EUR"
         *                "StatementParamInitialBalance": "4500.00",
         *                "StatementParamFinalBalance"  : "6200.20",
         *           },
         *          StatementTransactions: [
         *              {
         *                 "Date": "2024-05-19",
         *                 "DateValue": "2024-05-19",
         *                 "Description": "Payment",
         *                 "Income": "12.44",
         *                 "Expenses": "",
         *                 "ExternalReference": "15324748436",
         *                 "ContraAccount": "",
         *                 "Cc1": "",
         *                 "Cc2": "",
         *                 "Cc3": "",
         *                 "IsDetail": ""
         *              },
         *              {
         *                 "Date": "2023-04-22",
         *                 "DateValue": "2023-04-22",
         *                 "Description": "Transfer",
         *                 "Income": "",
         *                 "Expenses": "34.25",
         *                 "ExternalReference": "19257246225",
         *                 "ContraAccount": "",
         *                 "Cc1": "",
         *                 "Cc2": "",
         *                 "Cc3": "",
         *                 "IsDetail": ""
         *              },
         *                  // other transactions
         *          ]
         *      },
         *          // other statemens ....
         *   ]
         * }
         */