// Copyright [2025] [Banana.ch SA - Lugano Switzerland]
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

/**********************************************************
 * 
 * INVESTMENT ACCOUNTING ERROR MESSAGES HANDLER
 * 
 *********************************************************/

/**
 * 
 * @param {*} errorId 
 * @returns 
 */
function getErrorMessage(errorId) {
    lang = 'en';
    switch (errorId) {
        case "ID_ERR_VERSION_NOTSUPPORTED":
            return "This script is not compatible with your current version of Banana Accounting.\nPlease update to the latest version.";
        case "ID_ERR_LICENSE_NOTVALID":
            return "This extension requires Banana Accounting+ Advanced";
        case "NOT_AVAILABLE_WITH_MULTI_CURRENCY":
            return "This report is only available for accounting files without multi-currency"
    }
    return '';
}

/**
 * 
 * @param {*} errorId 
 * @param {*} missingElement 
 * @param {*} refTable 
 * @returns 
 */
function getErrorMessage_MissingElements(errorId, missingElement) {
    lang = 'en';
    switch (errorId) {
        case "NO_ITEMS_TABLE":
            return "Items table not found";
        case "ITEM_NOT_FOUND":
            return "Item: " + missingElement + " not found";
        case "ACCOUNT_NOT_FOUND":
            return "Account: " + missingElement + " not found";
        case "ITEM_WITHOUT_ACCOUNT":
            return "Item: " + missingElement + " without assigned account";
        case "NO_INVESTMENTS_ACCOUNTS_FOUND":
            return "No securities account found in the Items table";
        case "NO_SECURITIES_FOUND":
            return "No securities found in the Items table";
        case "SELECTED_ROW_NOT_VALID":
            return "The selected row in the Transactions table is not valid";
        case "CHILD_ROW_SELECTED":
            return "The selected row in the Transactions table is not correct"
        case "ITEM_ID_MISSING_IN_ROW":
            return "The selected row does not contain the Security ID";
        case "QTY_MISSING_IN_ROW":
            return "The selected row does not contain a valid sales Quantity";
        case "UNITPRICE_MISSING_IN_ROW":
            return "The selected row does not contain a valid Unit Price";
        case "AMOUNT_MISSING_IN_ROW":
            return "The selected row does not contain a valid Amount";
        case "ITEM_WITHOUT_TYPE":
            return "Item: " + missingElement + " without assigned type. Define the type in the Items table";
    }
}

// Add functions for transactions.