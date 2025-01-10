// Copyright [2024] [Banana.ch SA - Lugano Switzerland]
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
 * PORTFOLIO ACCOUNTING ERROR MESSAGES HANDLER
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
            return "This script does not run with your current version of Banana Accounting.\nMinimum version required: %1.\nTo update or for more information click on Help";
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
        case "DLG_QUANTITY_MISSING":
            return "Enter the quantity of securities sold";
        case "DLG_MARKETPRICE_MISSING":
            return "Enter the current price of securities sold";
        case "DLG_EXCHANGERATE_MISSING":
            return "Enter the current exchange rate of securities sold";
    }
}