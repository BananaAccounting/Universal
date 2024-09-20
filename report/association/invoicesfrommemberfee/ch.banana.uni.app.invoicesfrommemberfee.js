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

// @id = ch.banana.uni.app.invoicesfrommemberfee
// @version = 1.0
// @pubdate = 2024-09-20
// @publisher = Banana.ch SA
// @description = Create invoice transactions, from account
// @task = import.transactions
// @xtask = app.command
// @outputformat = tablewithheaders
// @inputdatasource = none
// @doctype = 100.*
// @timeout = -1

/**
 * This script create invoice transactions 
 * for accounts that have an amount in MemberFee in the table account.
 * @param {*} banDocument accounting file, is present only in tests
 * @param {*} isTest define if it is a test or not.
 */
function exec(banDocument, isTest) {

	let banDoc;

	if (isTest.useLastSettings && !banDocument)
        return "";
    else if (isTest.useLastSettings && banDocument)
        banDoc = banDocument;
    else if (!isTest.useLastSettings)
        banDoc = Banana.document;
	
	var tableAccounts = banDoc.table('Accounts');
	
	var userParam = initUserParam();

	var options = {};
	options.useLastSettings = true;
	if (!options || !options.useLastSettings) {
		userParam = parametersDialog(userParam); // From properties
	}

	if (!userParam) {
		return;
	}

	var jsonDoc = { "format": "documentChange", "error": "" };

	jsonDoc["data"] = createInvoiceTransactions(tableAccounts, userParam.invoiceNumber, userParam.invoiceText);

	return jsonDoc;
}

/**
    * initialises the structure for document change.
    * @returns 
    */
function createJsonDocument_Init() {

	var jsonDoc = {};
	jsonDoc.document = {};
	jsonDoc.document.dataUnits = [];

	jsonDoc.creator = {};
	
	jsonDoc.creator.name = Banana.script.getParamValue('id');
	jsonDoc.creator.version = "1.0";

	return jsonDoc;

}

function createInvoiceTransactions(accounts_table, invoiceNumber, description) {
	let jsonDoc = this.createJsonDocument_Init();
    let rows = [];
	let currentDate = Banana.Converter.toInternalDateFormat(new Date());

	for (let i = 0; i < accounts_table.rowCount; i++) {
		let row = accounts_table.row(i);
		let memberFee = row.value('MemberFee');
		let account = row.value('Account');
		let namePrefix = row.value('NamePrefix');
		let firstName = row.value('FirstName');
		let familyName = row.value('FamilyName');
		
		if (memberFee && account) {
			let row = {};
			row.operation = {};
			row.operation.name = "add";
			row.operation.srcFile = "";
			row.fields = {};
			row.fields["Date"] = currentDate;
			row.fields["DocInvoice"] = invoiceNumber.toString();
			row.fields["Description"] = description + " " + namePrefix + " " + firstName + " " + familyName;
			if (account.startsWith(".")) 
				row.fields["Cc1"] = account;
			else if (account.startsWith(",")) 
				row.fields["Cc2"] = account;
			else
				row.fields["Cc3"] = account;
			
			// row.fields["AccountCredit"] = accountRevenue;
			row.fields["Amount"] = memberFee;
			rows.push(row);
			invoiceNumber = Number(invoiceNumber) + 1;
		}
	}

	let dataUnitTransactions = {};
	dataUnitTransactions.nameXml = "Transactions";	
	dataUnitTransactions.data = {};
	dataUnitTransactions.data.rowLists = [];
	dataUnitTransactions.data.rowLists.push({ "rows": rows });

	jsonDoc.document.dataUnits.push(dataUnitTransactions);

	return jsonDoc;
}

function convertParam(userParam) {
	var convertedParam = {};
	convertedParam.version = '1.0';
	convertedParam.data = [];

	var currentParam = {};
	currentParam.name = 'invoiceText';
	currentParam.title = 'Invoice Description';
	currentParam.type = 'string';
	currentParam.value = userParam.invoiceText ? userParam.invoiceText : '';
	currentParam.defaultvalue = 'Invoice issued to ';
	currentParam.readValue = function() {
		userParam.invoiceText = this.value;
	};
	convertedParam.data.push(currentParam);

	currentParam = {};
	currentParam.name = 'invoiceNumber';
	currentParam.title = 'Invoice Number';
	currentParam.type = 'string';
	currentParam.value = userParam.invoiceNumber ? userParam.invoiceNumber : '';
	currentParam.defaultvalue = '1';
	currentParam.readValue = function() {
		userParam.invoiceNumber = this.value;
	};
	convertedParam.data.push(currentParam);

	// currentParam = {};
	// currentParam.name = 'accountRevenue';
	// currentParam.title = 'Revenue Account';
	// currentParam.type = 'string';
	// currentParam.value = userParam.accountRevenue ? userParam.accountRevenue : '';
	// currentParam.defaultvalue = '1000';
	// currentParam.readValue = function() {
	// 	userParam.accountRevenue = this.value;
	// };
	// convertedParam.data.push(currentParam);

	return convertedParam;
}

function initUserParam() {
	var userParam = {};
	userParam.invoiceText = 'Invoice issued to ';
	userParam.invoiceNumber = '1';
	// userParam.accountRevenue = '1000';
	return userParam;
}

function verifyUserParam(userParam) {
	if (!userParam.invoiceText) {
		userParam.invoiceText = 'Invoice issued to ';
	}
	if (!userParam.invoiceNumber) {
		userParam.invoiceNumber = '1';
	}
	// if (!userParam.accountRevenue) {
	// 	userParam.accountRevenue = '1000';
	// }
	return userParam;
}

function parametersDialog(userParam) {
	userParam = verifyUserParam(userParam);
	
	if (typeof(Banana.Ui.openPropertyEditor) !== 'undefined') {
		var dialogTitle = 'Settings';
		var convertedParam = convertParam(userParam);
		var pageAnchor = 'dlgSettings';
		if (!Banana.Ui.openPropertyEditor(dialogTitle, convertedParam, pageAnchor)) {
			return null;
		}

		for (var i = 0; i < convertedParam.data.length; i++) {
			convertedParam.data[i].readValue();
		}
		
		userParam.useDefaultTexts = false;
	}
	
	return userParam;
}

