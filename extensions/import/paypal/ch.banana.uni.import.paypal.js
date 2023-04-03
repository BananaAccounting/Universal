// Copyright [2021] [Banana.ch SA - Lugano Switzerland]
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
// @id = ch.banana.uni.import.paypal
// @api = 1.0
// @pubdate = 2021-03-24
// @publisher = Banana.ch SA
// @description = PayPal Import (*.csv)
// @doctype = *
// @docproperties =
// @task = import.transactions
// @outputformat = tablewithheaders
// @inputdatasource = openfiledialog
// @inputfilefilter = Text files (*.txt *.csv);;All files (*.*)
// @timeout = -1


/**
 * Parse the paypal file and and return a string in with data in tab separated
 */
function exec(string) {

	if (!verifyBananaVersion()) {
        return String();
    }

	var userParam = initUserParam();
	// include all data read and other
	
	var fileData = {};

	if (Banana.document && Banana.document.getScriptSettings()) {
		var savedParam = Banana.document.getScriptSettings();
		if (savedParam && savedParam.length > 0) {
			userParam = JSON.parse(savedParam);
			userParam = verifyUserParam(userParam);
		}
	}
	
	if (!readTransactions(userParam, string, fileData)) {
		return String();
	}
	
	if (Banana.document) {

		// If needed show the settings dialog to the user
		if (!options || !options.useLastSettings) {
			userParam = settingsDialog(userParam, fileData); // From properties
			if (!userParam)
				return String();
		}

		// Verify params
		if (!Param_Verify(userParam, fileData)) {
			return String();
		}
	}
	else {
		// assume we are in test mode or script has been started
		// with no file open
		Banana_GetValuesForTest(userParam, fileData);
	}

	// Verify paypal account
	if (!Param_Verify_PaypalAccount(userParam, fileData)) {
		return String();
	}

	// Amount conversion
	if (!CreateAmountsInBasicCurrency(userParam, fileData)) {
		return String();
	}

	// Create accounting transactions
	var exportArray = ProcessTransactions(userParam, fileData);
	// Own change to export data should be insert here
	// OwnFunction(param, exportArray);
    // export the data
	return ExportTransactions(userParam, fileData, exportArray);
}

function verifyBananaVersion() {
	var BAN_VERSION_MIN = "10.0.5";

	var supportedVersion = false;
	if (Banana.compareVersion && Banana.compareVersion(Banana.application.version, BAN_VERSION_MIN) >= 0) {
		supportedVersion = true;
	}

	if (!supportedVersion) {
		var lang = 'en';
		if (Banana.document) {
			if (Banana.document.locale)
				lang = Banana.document.locale;
			if (lang.length > 2)
				lang = lang.substr(0, 2);
		}
		var msg = "This script does not run with your current version of Banana Accounting.\nMinimum version required: %1.\nTo update or for more information click on Help";
		if (lang == 'it')
			msg = "Lo script non funziona con la vostra attuale versione di Banana Contabilità.\nVersione minimina richiesta: %1.\nPer aggiornare o per maggiori informazioni cliccare su Aiuto";
		else if (lang == 'fr')
			msg = "Ce script ne s'exécute pas avec votre version actuelle de Banana Comptabilité.\nVersion minimale requise: %1.\nPour mettre à jour ou pour plus d'informations, cliquez sur Aide";
		else if (lang == 'de')
			msg = "Das Skript wird mit Ihrer aktuellen Version von Banana Buchhaltung nicht ausgeführt.\nMindestversion erforderlich: %1.\nKlicken Sie auf Hilfe, um zu aktualisieren oder weitere Informationen zu bekommen";

		msg = msg.replace("%1", BAN_VERSION_MIN);
		if (Banana.document)
			Banana.document.addMessage(msg, this.ID_ERR_VERSION_NOTSUPPORTED);
		return false;
	}
	return true;
}

function Param_DialogDateFormat(param) {
	var savedParam = {};
	if (Banana.document && Banana.document.getScriptSettings())
		savedParam = JSON.parse(Banana.document.getScriptSettings());
	savedParam = verifyUserParam(savedParam);

	var values = ['Computer default', 'dd.mm.yyyy', 'mm.dd.yyyy', 'yyyy.mm.dd'];
	var index = values.indexOf(savedParam.dateFormat);
	if (index == -1) {
		if (!savedParam.dateFormat) {
			index = 0;
		} else {
			values.push(savedParam.dateFormat);
			index = 4;
		}
	}
	var dateFormat = Banana.Ui.getItem('Paypal date format', 'Choose a value', values, index, true);
	if (!dateFormat)
		return false;
	if (dateFormat == 'Computer default') {
		param.dateFormat = '';
	} else {
		param.dateFormat = dateFormat;
	}
	savedParam.dateFormat = param.dateFormat;

	var paramToString = JSON.stringify(savedParam);
	if (Banana.document)
		Banana.document.setScriptSettings(paramToString);

	return true;
}

function Param_Dialog(param, fileData) {
	var savedParam = {};
	if (Banana.document && Banana.document.getScriptSettings())
		savedParam = JSON.parse(Banana.document.getScriptSettings());
	savedParam = verifyUserParam(savedParam);

	var inputText;
	// see if paypal account has been defined
	var paypalAccountDefined = Boolean(param.AccountList[param.BasicCurrency]);
	if (!paypalAccountDefined) {
		//maybe a currency account has been defined
		for (var prop in fileData.BalanceList) {
			if (param.AccountList[prop] !== undefined) {
				paypalAccountDefined = true;
				break;
			}
		}
	}
	if (!paypalAccountDefined
		 && Number(param.AccountType) != 130) {
		// not cash book
		inputText = savedParam.PaypalAccount ? savedParam.PaypalAccount : '';
		inputText = Banana.Ui.getText('Paypal Import', 'Account paypal [Paypal Account] (Empty text = exit)', inputText);
		if (!inputText)
			return false;
		savedParam.PaypalAccount = inputText;
		param.AccountList[param.BasicCurrency] = inputText;
	}
	if (!param.AccountList.PaypalIn) {
		inputText = savedParam.PaypalIn ? savedParam.PaypalIn : '';
		inputText = Banana.Ui.getText('Paypal Import', 'Account for Income [Paypal In] (Empty text = exit)', inputText);
		if (!inputText)
			return false;
		savedParam.PaypalIn = inputText;
		param.AccountList.PaypalIn = inputText;
	}
	if (!param.AccountList.PaypalOut) {
		inputText = savedParam.PaypalOut ? savedParam.PaypalOut : '';
		inputText = Banana.Ui.getText('Paypal Import', 'Account for Expenses [Paypal Out] (Empty text = exit)', inputText);
		if (!inputText)
			return false;
		savedParam.PaypalOut = inputText;
		param.AccountList.PaypalOut = inputText;
	}
	if (!param.AccountList.PaypalFee) {
		inputText = savedParam.PaypalFee ? savedParam.PaypalFee : '';
		inputText = Banana.Ui.getText('Paypal Import', 'Account for paypal Feed [Paypal Fee] (Empty text = exit)', inputText);
		if (!inputText)
			return false;
		savedParam.PaypalFee = inputText;
		param.AccountList.PaypalFee = inputText;
	}
	// Dialog  could also ask if to import account balance, currencyConversion

	var paramToString = JSON.stringify(savedParam);
	if (Banana.document)
		Banana.document.setScriptSettings(paramToString);

	return true;
}

function Param_Verify(param, fileData) {
	// Basic currency not defined
	if (!param.BasicCurrency) {
		AddMessage('Error: Basic currency (File properties) not defined');
		return false;
	}
	/* else if (!param.isMultiCurrency && !fileData.BalanceList[param.BasicCurrency]) {
	// Basic currency different from paypal currencies
	AddMessage('Error: Basic currency (File properties) different from paypal used currencies ');
	return false;
	} */
    // Assign account if not defined
    param.AccountList[param.BasicCurrency] = param.PaypalAccount;
    param.AccountList['PaypalIn'] = param.PaypalIn;
    param.AccountList['PaypalOut'] = param.PaypalOut;
    param.AccountList['PaypalFee'] = param.PaypalFee;

	if (!param.AccountList['PaypalIn']) {
		AddMessage('Account PaypalIn not defined in accounting plan: using PaypalIn');
		param.AccountList['PaypalIn'] = 'PaypalIn';
	}
	if (!param.AccountList['PaypalOut']) {
		AddMessage('Account PaypalOut not defined using PaypalOut');
		param.AccountList['PaypalOut'] = 'PaypalOut';
	}
	if (!param.AccountList['PaypalFee']) {
		AddMessage('PaypalFee not defined using PaypalFee');
		param.AccountList['PaypalFee'] = 'PaypalFee';
	}
	return true;
}

function Param_Verify_PaypalAccount(param, fileData) {
	if (!param.BasicCurrency || !param.AccountList || !param.AccountType)
		return false;

	// check if PaypalAccount has been defined
	var paypalAccountDefined = Boolean(param.AccountList[param.BasicCurrency]);
	if (!paypalAccountDefined) {
		//maybe a currency account has been defined
		for (var prop in fileData.BalanceList) {
			if (param.AccountList[prop] !== undefined) {
				paypalAccountDefined = true;
				break;
			}
		}
	}
	// no PaypalAccount and no account defined for currency
	if (!paypalAccountDefined
		 && Number(param.AccountType) != 130) {
		// not cash book
		AddMessage('PaypalAccount not defined using PaypalAccount');
		param.AccountList[param.BasicCurrency] = 'PaypalAccount';
	}
	
	return true;
}

/***********************
* MANAGE USER PARAMETERS 
***********************/
function convertParam(userParam, fileData) {
	var lang = 'en';
	
	if (Banana.document.locale) {
		lang = Banana.document.locale;
	}
	if (lang.length > 2) {
		lang = lang.substr(0, 2);
	}

	var texts = setTexts(lang);

	var convertedParam = {};
	convertedParam.version = '1.0';
	convertedParam.data = [];

	var currentParam = {};
	currentParam.name = 'date_format';
	currentParam.title = 'Date Format';
	currentParam.type = 'combobox';
	currentParam.items = ["dd.mm.yyyy", "mm.dd.yyyy", "yyyy.mm.dd"];
	currentParam.value = userParam.date_format ? userParam.date_format : '';
	currentParam.readValue = function () {
		userParam.date_format = this.value;
	}
	convertedParam.data.push(currentParam);

	currentParam = {};
	currentParam.name = 'PaypalAccount';
	currentParam.title = texts.param_paypal_account;
	currentParam.type = 'string';
	currentParam.value = userParam.PaypalAccount ? userParam.PaypalAccount : '';
	currentParam.defaultvalue = '';
	currentParam.readValue = function () {
		userParam.PaypalAccount = this.value;
	}
	convertedParam.data.push(currentParam);

	currentParam = {};
	currentParam.name = 'PaypalIn';
	currentParam.title = texts.param_paypal_in;
	currentParam.type = 'string';
	currentParam.value = userParam.PaypalIn ? userParam.PaypalIn : '';
	currentParam.defaultvalue = '';
	currentParam.readValue = function () {
		userParam.PaypalIn = this.value;
	}
	convertedParam.data.push(currentParam);

	currentParam = {};
	currentParam.name = 'PaypalOut';
	currentParam.title = texts.param_paypal_out;
	currentParam.type = 'string';
	currentParam.value = userParam.PaypalOut ? userParam.PaypalOut : '';
	currentParam.defaultvalue = '';
	currentParam.readValue = function () {
		userParam.PaypalOut = this.value;
	}
	convertedParam.data.push(currentParam);

	currentParam = {};
	currentParam.name = 'PaypalFee';
	currentParam.title = texts.param_paypal_fee;
	currentParam.type = 'string';
	currentParam.value = userParam.PaypalFee ? userParam.PaypalFee : '';
	currentParam.defaultvalue = '';
	currentParam.readValue = function () {
		userParam.PaypalFee = this.value;
	}
	convertedParam.data.push(currentParam);

	var currencies = [];
	for (var currency in userParam.ExchangeRateList) {
		currencies.push(currency);
	}

	if (currencies.length > 0) {
		var currentParam = {};
		currentParam.name = 'filter';
		currentParam.title = 'Exchange Rate';
		currentParam.editable = false;
		convertedParam.data.push(currentParam);

		for (var i = 0; i < currencies.length; i++) {
			var currentParam = {};
			currentParam.name = currencies[i];
			currentParam.title = currencies[i] + ' to ' + userParam.BasicCurrency;
			currentParam.parentObject = 'filter';
			currentParam.type = 'string';
			currentParam.value = userParam.ExchangeRateList[currencies[i]] ? userParam.ExchangeRateList[currencies[i]] : "0.00";
			currentParam.readValue = function () {
				userParam.ExchangeRateList[this.name] = this.value;
			}
			convertedParam.data.push(currentParam);
		}
	}    	

	return convertedParam;
}

function initUserParam () {
	var userParam = {};

	userParam.PaypalAccount = '';
	userParam.PaypalIn = "";
	userParam.PaypalOut = "";
	userParam.PaypalFee = "";
	userParam.Exchange = [];

	// the paypal date input format
	userParam.dateFormat = "dd.mm.yyyy";

	// does not import transactions that have
	// TransactionId == ExternalReference (field in BananaAccounting)
	userParam.IncludeExistingTransactions = false;
	// for Cash Book and Income and expense accounting
	// if true use column income in negative
	userParam.IncomeExpensesSingleColumn = false;
	// export row with currency conversion transactions
	// even when the account is converted to BasicCurrency
	userParam.IncludeCurrencyConversions = false;
	// if true add a row with the Paypal Balance
	userParam.IncludeLastBalance = true;
	// if true convert using the last exchange rates found
	userParam.UseCollectedExchangeRates = true;
	// if true display an input box to ask for a failing exchange rate
	userParam.AskForFailingExchangeRates = true;
	// add the currency info in description for all transactions
	userParam.SetCurrencyInDesctriptionAlways = false;
	// add the currency info in description only for transactions in basic currency
	userParam.SetCurrencyInDesctriptionNotBasicCurrency = true;
	// the currency of the accounting file
	// this value need to be automatically read from BananaAccounting
	userParam.BasicCurrency = ''
		// if the accounting file is double entry
		// this value need to be automatically read from BananaAccounting
		userParam.AccountType = 100;
	// if the accounting file is multi currency
	// this value need to be automatically read from BananaAccounting
	userParam.IsMultiCurrency = false;

	// contains the account number
	// the order in witch the account number is choosed
	// for the specified transaction
	// 1. AccountList[exportRow.Currency]
	// 2. AccountList.PayPalAcount
	// 3. AccountList[param.BasicCurrency]
	//
	userParam.AccountList = {};
	// Contra account for Income (selling account)
	userParam.AccountList.PaypalIn = '';
	// Contra account for Expenses (cost  account)
	userParam.AccountList.PaypalOut = '';
	// Contra account for Paypal fee
	userParam.AccountList.PaypalFee = '';

	userParam.ExchangeRateList = {};

	userParam.SupplementaryColumns = {};

	return userParam;	
}

function verifyUserParam(userParam) {
	if (!userParam)
		userParam = {};
	if (!userParam.PaypalAccount)
		userParam.PaypalAccount = '';
	if (!userParam.PaypalIn)
		userParam.PaypalIn = "";
	if (!userParam.PaypalOut)
		userParam.PaypalOut = "";
	if (!userParam.PaypalFee)
		userParam.PaypalFee = "";
	if (!userParam.Exchange)
		userParam.Exchange = [];
	if (!userParam.dateFormat)
		userParam.dateFormat = "dd.mm.yyyy";
	if (!userParam.IncludeExistingTransactions)
		userParam.IncludeExistingTransactions = false;
	if (!userParam.IncomeExpensesSingleColumn)
		userParam.IncomeExpensesSingleColumn = false;
	if (!userParam.IncludeCurrencyConversions)
		userParam.IncludeCurrencyConversions = false;
	if (!userParam.SetCurrencyInDesctriptionAlways)
		userParam.SetCurrencyInDesctriptionAlways = false;
	if (!userParam.SetCurrencyInDesctriptionNotBasicCurrency)
		userParam.SetCurrencyInDesctriptionNotBasicCurrency = true;
	if (!userParam.BasicCurrency)
		userParam.BasicCurrency = ''
	if (!userParam.AccountType)
		userParam.AccountType = 100;
	if (!userParam.IsMultiCurrency)
		userParam.IsMultiCurrency = false;
	if (!userParam.AccountList)
		userParam.AccountList = {};
	if (!userParam.AccountList.PaypalIn)
		userParam.AccountList.PaypalIn = '';
	if (!userParam.AccountList.PaypalOut)
		userParam.AccountList.PaypalOut = '';
	if (!userParam.AccountList.PaypalFee)
		userParam.AccountList.PaypalFee = '';
	if (!userParam.ExchangeRateList)
		userParam.ExchangeRateList = {};
	if (!userParam.SupplementaryColumns)
		userParam.SupplementaryColumns = {};
	return userParam;
}

function paramatersDialog (userParam, fileData) {

	if (typeof(Banana.Ui.openPropertyEditor) !== 'undefined') {
		var dialogTitle = "";
		var convertedParam = convertParam(userParam, fileData);
		var pageAnchor = 'dlgSettings';
		if (!Banana.Ui.openPropertyEditor(dialogTitle, convertedParam, pageAnchor)) {
			return null;
		}

		for (var i = 0; i < convertedParam.data.length; i++) {
			// Read values to userParam (through the readValue function)
			if (typeof (convertedParam.data[i].readValue) !== 'undefined') {
				convertedParam.data[i].readValue();
			}
		}
		
		//  Reset reset default values
		userParam.useDefaultTexts = false;
	}

	return userParam;
}

function settingsDialog(userParam, fileData) {

	// Retrieve saved param
	if (Banana.document && Banana.document.getScriptSettings()) {
		var savedParam = Banana.document.getScriptSettings();
		if (savedParam && savedParam.length > 0) {
			userParam = JSON.parse(savedParam);
		}
	}
	userParam = verifyUserParam(userParam);

	// Retrieve data from file
	if (fileData) {
		if (!Banana_GetAccountData(userParam, fileData)) {
			return String();
		}
		readCurrencies(userParam, fileData);
	}

	// see if paypal account has been defined
	var paypalAccountDefined = Boolean(userParam.AccountList[userParam.BasicCurrency]);
	if (!paypalAccountDefined && fileData) {
		//maybe a currency account has been defined
		for (var prop in fileData.BalanceList) {
			if (userParam.AccountList[prop] !== undefined) {
				paypalAccountDefined = true;
				break;
			}
		}
	}
	
	if (!paypalAccountDefined
		&& Number(userParam.AccountType) != 130) {
		userParam.AccountList[userParam.BasicCurrency] = userParam.PaypalAccount;
	}

	if (!userParam.AccountList.PaypalIn) {
		userParam.AccountList.PaypalIn = userParam.PaypalIn;
	}
	if (!userParam.AccountList.PaypalOut) {
		userParam.AccountList.PaypalOut = userParam.PaypalOut;
	}
	if (!userParam.AccountList.PaypalFee) {
		userParam.AccountList.PaypalFee = userParam.PaypalFee;
	}

	userParam = paramatersDialog(userParam, fileData);

	if (userParam && Banana.document) {
		var paramToString = JSON.stringify(userParam);
		Banana.document.setScriptSettings(paramToString);
	}
	// if (userParam.Exchange[0])
	// 	Banana.console.log(userParam.Exchange[0]);

	return userParam;
}

/***********************
* TEXTS
***********************/
function setTexts(language) {
	var texts = {};

	if (language === 'it') {
		texts.param_paypal_account = "Account Paypal";
		texts.param_paypal_in = "Paypal In";
		texts.param_paypal_out = "Paypal Out";
		texts.param_paypal_fee = "Paypal Fee";
	}
	else if (language === 'de') {
		texts.param_paypal_account = "Paypal-Konto";
		texts.param_paypal_in = "Paypal In";
		texts.param_paypal_out = "Paypal Out";
		texts.param_paypal_fee = "Paypal Fee";
	}
	else if (language === 'fr') {
		texts.param_paypal_account = "Compte Paypal";
		texts.param_paypal_in = "Paypal In";
		texts.param_paypal_out = "Paypal Out";
		texts.param_paypal_fee = "Paypal Fee";
		texts.param_exchange_rate = "Taux de Change";
	}
	else if (language === 'nl') {
		texts.param_paypal_account = "Paypal Account";
		texts.param_paypal_in = "Paypal In";
		texts.param_paypal_out = "Paypal Out";
		texts.param_paypal_fee = "Paypal Fee";
	}
	else {
		texts.param_paypal_account = "Paypal Account";
		texts.param_paypal_in = "Paypal In";
		texts.param_paypal_out = "Paypal Out";
		texts.param_paypal_fee = "Paypal Fee";
		texts.param_exchange_rate = "Exchange Rate";
	}

	return texts;
}

function CompareForImportedRow(a, b) {
	if (a.Date < b.Date)
		return -1;
	if (a.Date > b.Date)
		return 1;
	if (a.OriginalSequence > b.OriginalSequence)
		return -1;
	if (a.OriginalSequence < b.OriginalSequence)
		return 1;
	return 0;
}

// if Banana.document sent message to Banana.document
// Add help info
function AddMessage(messageText, helpTag) {
	if (!helpTag) {
		helpTag = 'PaypalImport';
	}
	if (Banana.document) {
		Banana.document.addMessage(messageText, helpTag);
	} else {
		Banana.application.addMessage(messageText, helpTag);
	}

}

function readCurrencies(param, fileData) {
	
	param.ExchangeRateList = {};
	CreateAmountsInBasicCurrency_BasicCurrency(param, fileData);
	CreateAmountsInBasicCurrency_CurrencyConversion(param, fileData);
	// repeat while there is no more conversion in BasicCurrency
	while (CreateAmountsInBasicCurrency_ConvertAmounts(param, fileData)) {
		;
	}
	CreateAmountsInBasicCurrency_CreateListUnconvertedExchangeRates(param, fileData);

	var savedParam = {};
	if (Banana.document && Banana.document.getScriptSettings())
		savedParam = JSON.parse(Banana.document.getScriptSettings());
	savedParam = verifyUserParam(savedParam);

	var unconvertedCurrencies = Object.keys(fileData.listUnconvertedCurrencies).length;
	if (unconvertedCurrencies) {
		for (var currency in fileData.listUnconvertedCurrencies) {
			var exchangeRate = 0;
			if (savedParam.ExchangeRateList[currency])
				exchangeRate = savedParam.ExchangeRateList[currency];
			param.ExchangeRateList[currency] = Banana.Converter.toInternalNumberFormat(exchangeRate);
		}
	}

	if (Banana.document) {
		savedParam.ExchangeRateList = param.ExchangeRateList;
		Banana.document.setScriptSettings(JSON.stringify(savedParam));
	}
}

function CreateAmountsInBasicCurrency(param, fileData) {
	param.ExchangeRateList = {};
	CreateAmountsInBasicCurrency_BasicCurrency(param, fileData);
	CreateAmountsInBasicCurrency_CurrencyConversion(param, fileData);
	// repeat while there is no more conversion in BasicCurrency
	while (CreateAmountsInBasicCurrency_ConvertAmounts(param, fileData)) { ;
	}
	CreateAmountsInBasicCurrency_CreateListUnconvertedExchangeRates(param, fileData);
	var unconvertedCurrencies = Object.keys(fileData.listUnconvertedCurrencies).length;
	var message = '';
	if (!param.AskForFailingExchangeRates && unconvertedCurrencies) {
		// Display
		for (var prop in fileData.listUnconvertedCurrencies) {
			if (message) {
				message += ', ';
			}
			message += prop + ' (' + fileData.listUnconvertedCurrencies[prop] + ')';
		}
		if (message) {
			AddMessage('Unconverted Currency: ' + message);
		}
	} else if (unconvertedCurrencies) {
		var savedParam = {};
		if (Banana.document && Banana.document.getScriptSettings())
			savedParam = JSON.parse(Banana.document.getScriptSettings());
		savedParam = verifyUserParam(savedParam);

		for (var currency in fileData.listUnconvertedCurrencies) {
			// message = 'Insert Exchange rate for : ' + currency + ' to ' + param.BasicCurrency;
			// message += ' (' + param.BasicCurrency + ' = ' + currency + ' * Exchange Rate)';
			// var inputText = savedParam[currency] ? savedParam[currency] : '';
			// inputText = Banana.Converter.toLocaleNumberFormat(inputText);
			// inputText = Banana.Ui.getText('Paypal Import', message, inputText);
			// if (!inputText)
			//  	return false;
			var exchangeRate = 0;
			if (savedParam.ExchangeRateList[currency])
				exchangeRate = savedParam.ExchangeRateList[currency];
			param.ExchangeRateList[currency] = Banana.Converter.toInternalNumberFormat(exchangeRate);
		}

		if (Banana.document) {
			savedParam.ExchangeRateList = param.ExchangeRateList;
			Banana.document.setScriptSettings(JSON.stringify(savedParam));
		}

		// repeat while there is no more conversion in BasicCurrency
		while (CreateAmountsInBasicCurrency_ConvertAmounts(param, fileData)) { ;
		}
		// recreate list unconverted exchange rates
		CreateAmountsInBasicCurrency_CreateListUnconvertedExchangeRates(param, fileData);
	}
	// now convert the other amounts  in basic currency
	CreateAmountsInBasicCurrency_GrossAndFee(param, fileData);
	return true;
}

function CreateAmountsInBasicCurrency_CreateListUnconvertedExchangeRates(param, fileData) {
	// create list of unconvertedCurrency
	// key = currency
	//  value = count of unconverted currencies
	fileData.listUnconvertedCurrencies = {};
	for (var rowIndex = 0; rowIndex < fileData.paypalTransactions.length; ++rowIndex) {
		var ppRow = fileData.paypalTransactions[rowIndex];
		if (ppRow.Currency !== param.BasicCurrency && !ppRow.CurrencyConversionType
			 && Number(ppRow.Net)
			 && (ppRow.BalanceImpactInternal === 'Debit' || ppRow.BalanceImpactInternal === 'Credit')) {
			if (ppRow.Currency in fileData.listUnconvertedCurrencies) {
				fileData.listUnconvertedCurrencies[ppRow.Currency] += 1;
			} else {
				fileData.listUnconvertedCurrencies[ppRow.Currency] = 0;
			}
		}
	}

}
// Add the basic currency amounts to the payPalTransactions
function CreateAmountsInBasicCurrency_BasicCurrency(param, fileData) {

	for (var rowIndex = 0; rowIndex < fileData.paypalTransactions.length; ++rowIndex) {
		var ppRow = fileData.paypalTransactions[rowIndex];
		ppRow.ExchangeCurrency = ppRow.Currency;
		ppRow.CurrencyConversionType = 0;
		// Create amount for basic Currency if currency is the same
		if (ppRow.Currency === param.BasicCurrency) {
			ppRow.CurrencyConversionType = 1;
			ppRow.NetBasicCurrency = ppRow.Net;
			ppRow.FeeBasicCurrency = ppRow.Fee;
			ppRow.GrossBasicCurrency = ppRow.Gross;
		}
	}
}

// Create the counterpart for currency conversion
// Write the CurrencyTo and CurrencyToAmount for
// currency conversion transactions (suppose always on two consecutive lines)
function CreateAmountsInBasicCurrency_CurrencyConversion(param, fileData) {

	for (var rowIndex = 0; rowIndex < fileData.paypalTransactions.length; ++rowIndex) {
		var ppRow = fileData.paypalTransactions[rowIndex];
		// Second line of CurrencyTo already completed
		if (ppRow.Type === 'Currency Conversion' && !ppRow.CurrencyTo) {
			var rowIndexNext = rowIndex + 1;
			if (rowIndexNext < fileData.paypalTransactions.length
				 && fileData.paypalTransactions[rowIndexNext].Type === 'Currency Conversion') {
				var ppRowNext = fileData.paypalTransactions[rowIndexNext];
				ppRow.CurrencyTo = ppRowNext.Currency;
				ppRow.CurrencyToAmount = ppRowNext.Net;
				ppRowNext.CurrencyTo = ppRow.Currency;
				ppRowNext.CurrencyToAmount = ppRow.Net;
				if (ppRow.Currency === param.BasicCurrency) {
					ppRowNext.CurrencyConversionType = 2;
					ppRowNext.NetBasicCurrency = Math.abs(ppRow.Net);
					if (Number(ppRowNext.Net) < 0) {
						ppRowNext.NetBasicCurrency *= -1;
					}
				}
				// If next row is basic currency set current line basic  currency amount
				else if (ppRowNext.Currency === param.BasicCurrency) {
					ppRow.CurrencyConversionType = 2;
					ppRow.NetBasicCurrency = Math.abs(ppRowNext.NetBasicCurrency);
					if (Number(ppRow.Net) < 0) {
						ppRow.NetBasicCurrency *= -1;
					}
				}
			} else if (rowIndex + 1 >= fileData.paypalTransactions.length) {
				var message = 'Error no currency conversion counterpart  ';
				message += ' (TransactionId:' + ppRow.TransactionId + ')';
				AddMessage(message);
			}
		}
	}
}

function CreateAmountsInBasicCurrency_ConvertAmounts(param, fileData, messageDisplay) {
	// Calculate the NetBasicCurrency based on
	// - Same value of the currency transaction
	// - Same amounts
	// - Same date
	// - Same days
	// This function need to be called many times up there are no more currency conversion
	// and the return value is false

	// Return value set to true if there have been currency conversions
	var currencyConversion = false;
	// type of currency conversion
	var CurrencyConversionType = 0;
	// where we save the key and amounts in basic currency
	var amountsNetBasicCurrency = {};
	// we collect the lastExchange rate
	// will be used if param.UseCollectedExchangeRates == true
	var lastExchangeRate = {};
	// create a map where the key is the date, transactionId, currency and amount
	// and the value is the amount in basicCurrency
	// we will use this data to convert the same amounts in basicCurrency
	for (var rowIndex = 0; rowIndex < fileData.paypalTransactions.length; ++rowIndex) {
		var ppRow = fileData.paypalTransactions[rowIndex];
		var TransactionGroupId = ppRow.TransactionGroupId;
		var CurrencyConversionType = 0;
		let keyAmount = "";
		let keyTransactionId = "";
		let keyDate = "";
		if (ppRow.Currency && ppRow.Currency != param.BasicCurrency && ppRow.CurrencyConversionType) {
			var currency = ppRow.Currency;
			keyAmount = ppRow.Date + '$' + TransactionGroupId + '$' + currency + '$' + Math.abs(ppRow.Net);
			keyTransactionId = ppRow.Date + '$' + TransactionGroupId + '$' + currency;
			keyDate = ppRow.Date + '$' + currency;
			// Save the exact amount
			amountsNetBasicCurrency[keyAmount] = Math.abs(ppRow.NetBasicCurrency);
			// Save the exchange rate for this TransactionGroupId
			amountsNetBasicCurrency[keyTransactionId] = ppRow.NetBasicCurrency / ppRow.Net;
			// Save the exchange rate for this date
			amountsNetBasicCurrency[keyDate] = ppRow.NetBasicCurrency / ppRow.Net;
		}
		if (ppRow.CurrencyTo && ppRow.currencyTo != param.BasicCurrency && ppRow.CurrencyConversionType) {
			var currency = ppRow.CurrencyTo;
			keyAmount = ppRow.Date + '$' + TransactionGroupId + '$' + currency + '$' + Math.abs(ppRow.CurrencyToAmount);
			keyTransactionId = ppRow.Date + '$' + TransactionGroupId + '$' + currency;
			keyDate = ppRow.Date + '$' + currency;
			// Save the exact amount
			amountsNetBasicCurrency[keyAmount] = Math.abs(ppRow.NetBasicCurrency);
			// Save the exchange rate for this TransactionGroupId
			amountsNetBasicCurrency[keyTransactionId] = ppRow.NetBasicCurrency / ppRow.CurrencyToAmount;
			// Save the exchange rate for this date
			amountsNetBasicCurrency[keyDate] = ppRow.NetBasicCurrency / ppRow.CurrencyToAmount;
		}
	}
	// Complete the BasicCurrency amount with the one saved in the amountsNetBasicCurrency
	// or the one of the ExchangeRateList or lastExchangeRate
	for (var rowIndex = 0; rowIndex < fileData.paypalTransactions.length; ++rowIndex) {
		var ppRow = fileData.paypalTransactions[rowIndex];
		var TransactionGroupId = ppRow.TransactionGroupId;
		var currency = ppRow.Currency;
		var keyAmount = ppRow.Date + '$' + TransactionGroupId + '$' + currency + '$' + Math.abs(ppRow.Net);
		var keyTransactionId = ppRow.Date + '$' + TransactionGroupId + '$' + currency;
		var keyDate = ppRow.Date + '$' + currency;
		if (currency !== param.BasicCurrency && !ppRow.CurrencyConversionType) {
			var netBasicCurrency = undefined;
			// Math.sign() function not available
			if (amountsNetBasicCurrency[keyAmount]) {
				netBasicCurrency = amountsNetBasicCurrency[keyAmount];
				CurrencyConversionType = 3;
			} else if (amountsNetBasicCurrency[keyTransactionId]) {
				netBasicCurrency = Number((ppRow.Net * amountsNetBasicCurrency[keyTransactionId]).toFixed(2));
				CurrencyConversionType = 4;
			} else if (amountsNetBasicCurrency[keyDate]) {
				netBasicCurrency = Number((ppRow.Net * amountsNetBasicCurrency[keyDate]).toFixed(2));
				CurrencyConversionType = 5;
			} else if (param.ExchangeRateList[currency]) {
				netBasicCurrency = Number((ppRow.Net * param.ExchangeRateList[currency]).toFixed(2));
				CurrencyConversionType = 6;
			} else if (param.UseCollectedExchangeRates && lastExchangeRate[currency]) {
				netBasicCurrency = Number((ppRow.Net * lastExchangeRate[currency]).toFixed(2));
				CurrencyConversionType = 7;
			}
			if (netBasicCurrency) {
				currencyConversion = true;
				ppRow.CurrencyConversionType = CurrencyConversionType;
				ppRow.NetBasicCurrency = Math.abs(netBasicCurrency);
				if (Number(ppRow.Net) < 0) {
					ppRow.NetBasicCurrency *= -1;
				}
				// Make next currency conversion
				var rowIndexNext = rowIndex + 1;
				var rowIndexPrev = rowIndex - 1;
				if (ppRow.Type === 'Currency Conversion' && rowIndexNext < fileData.paypalTransactions.length
					 && fileData.paypalTransactions[rowIndexNext].TransactionGroupId === ppRow.TransactionGroupId
					 && fileData.paypalTransactions[rowIndexNext].Type === 'Currency Conversion') {
					fileData.paypalTransactions[rowIndexNext].CurrencyConversionType = CurrencyConversionType;
					fileData.paypalTransactions[rowIndexNext].NetBasicCurrency = Math.abs(netBasicCurrency);
					if (Number(fileData.paypalTransactions[rowIndexNext].Net) < 0) {
						fileData.paypalTransactions[rowIndexNext].NetBasicCurrency *= -1;
					}
				} else if (ppRow.Type === 'Currency Conversion' && rowIndexPrev > 0
					 && fileData.paypalTransactions[rowIndexPrev].TransactionGroupId === ppRow.TransactionGroupId
					 && fileData.paypalTransactions[rowIndexPrev].Type === 'Currency Conversion') {
					fileData.paypalTransactions[rowIndexPrev].CurrencyConversionType = CurrencyConversionType;
					fileData.paypalTransactions[rowIndexPrev].NetBasicCurrency = Math.abs(netBasicCurrency);
					if (Number(fileData.paypalTransactions[rowIndexPrev].Net) < 0) {
						fileData.paypalTransactions[rowIndexPrev].NetBasicCurrency *= -1;
					}
				}
			}
		}
		// add to exchange rate list
		if (currency !== param.BasicCurrency && ppRow.CurrencyConversionType) {
			lastExchangeRate[currency] = ppRow.NetBasicCurrency / ppRow.Net;
		}
	}
	return currencyConversion;
}

function CreateAmountsInBasicCurrency_GrossAndFee(param, fileData) {
	// set amount GrossBasicCurrency and FeeBasicCurrency
	for (var rowIndex = 0; rowIndex < fileData.paypalTransactions.length; ++rowIndex) {
		var ppRow = fileData.paypalTransactions[rowIndex];
		if (ppRow.Currency !== param.BasicCurrency && ppRow.CurrencyConversionType) {
			var exchangeRate = Number(ppRow.NetBasicCurrency) / Number(ppRow.Net);
			var grossBasicCurrency = Number(ppRow.Gross) * exchangeRate;
			ppRow.GrossBasicCurrency = Number(grossBasicCurrency.toFixed(2));
			ppRow.FeeBasicCurrency = Number(ppRow.GrossBasicCurrency) - Number(ppRow.NetBasicCurrency);
			ppRow.FeeBasicCurrency = Number(ppRow.FeeBasicCurrency.toFixed(2));
		}
	}
}

// Create a list of transactions already imported
function ProcessTransactions_Banana_SetAlreadyImported(param, fileData) {
	var transactions = Banana.document.table('Transactions');
	if (!transactions)
		return;
	var transactionsIdImported = [];
	// create the object with key  = ExternalReference and Date
	for (var rowIndex = 0; rowIndex < fileData.paypalTransactions.length; ++rowIndex) {
		var ppRow = fileData.paypalTransactions[rowIndex];
		var key = ppRow['ExternalReference'] + '$' + ppRow['Date'];
		transactionsIdImported[key] = rowIndex;
		ppRow.AlreadyImported = false;
	}
	// if transactions already present in accounting file set AlreadyImported = true
	for (var rowNumber = 0; rowNumber < transactions.rowCount; rowNumber++) {
		var key = transactions.value(rowNumber, 'ExternalReference') + '$' + transactions.value(rowNumber, 'Date');
		if (transactionsIdImported[key]) {
			fileData.paypalTransactions[transactionsIdImported[key]].AlreadyImported = true;
		}
	}
}

function ProcessTransactions(param, fileData) {
	ProcessTransactions_CreateAccountingFields(param, fileData);
	if (Banana.document) {
		ProcessTransactions_Banana_SetAlreadyImported(param, fileData);
	}
	var exportArray = ProcessTransactions_CreateRows(param, fileData);
	if (param.AccountType == 100) {
		ProcessTransactions_DoubleEntry(param, fileData, exportArray);
	} else {
		ProcessTransactions_IncomeExpenses(param, fileData, exportArray);
	}
	ProcessTransactions_AddLastBalance(param, fileData, exportArray);
	ProcessTransactions_SetDescription(param, fileData, exportArray)
	return exportArray;
}

// Add field for accounting
function ProcessTransactions_CreateAccountingFields(param, fileData) {
	// we define all fields necessary
	for (var rowIndex = 0; rowIndex < fileData.paypalTransactions.length; ++rowIndex) {
		var ppRow = fileData.paypalTransactions[rowIndex];
		if (param.AccountType == 100) {
			ppRow.AccountDebit = '';
			ppRow.AccountCredit = '';
		} else {
			ppRow.Income = '';
			ppRow.Expenses = '';
			ppRow.Category = '';
		}
	}
}

// Create and return the exportArray where each transaction is an object
// For each paypal transaction more then one row can be created
// for AmountNet, AmountGross, AmountFee
// Assign the Account and ContraAccount values
function ProcessTransactions_CreateRows(param, fileData) {
	var exportArray = [];
	var countExported = 0;
	// create the export transactions
	for (var rowIndex = 0; rowIndex < fileData.paypalTransactions.length; ++rowIndex) {
		var ppRow = fileData.paypalTransactions[rowIndex];
		// Skip transactions that are already imported
		if (!param.IncludeExistingTransactions && ppRow.AlreadyImported === true)
			continue;
		if (!param.IncludeCurrencyConversions && ppRow.Type === 'Currency Conversion')
			continue;
		// void line
		if (ppRow['Date'].length === 0)
			continue;
		var exportRow = JSON.parse(JSON.stringify(ppRow));
		// Use this value for calculation
		// If multicurrency and no account use basic currency
		var currencyAmounts = {};
		currencyAmounts.Net = exportRow.Net;
		currencyAmounts.Fee = exportRow.Fee;
		currencyAmounts.Gross = exportRow.Gross;
		// Set the AccountId
		exportRow.Account = '[Account]';
		if (param.AccountList[exportRow.Currency]) {
			exportRow.Account = param.AccountList[exportRow.Currency];
		} else if (param.AccountList[param.BasicCurrency]) {
			// no account for this currency found we use the Basic Currency
			exportRow.Account = param.AccountList[param.BasicCurrency];
			exportRow.ExchangeCurrency = param.BasicCurrency;
			currencyAmounts.Net = exportRow.NetBasicCurrency;
			currencyAmounts.Fee = exportRow.FeeBasicCurrency;
			currencyAmounts.Gross = exportRow.GrossBasicCurrency;
		}
		exportRow.Amount = Math.abs(exportRow.NetBasicCurrency).toFixed(2);
		exportRow.AmountCurrency = Math.abs(currencyAmounts.Net).toFixed(2);
		exportRow.AmountTransactionCurrency = Math.abs(currencyAmounts.Net).toFixed(2);
		//
		if (exportRow.BalanceImpactInternal === 'Debit') {
			exportRow.AccountImpact = 'Debit';
			if (exportRow.Type !== 'Currency Conversion') {
				if (param.AccountList['PaypalOut']) {
					exportRow.ContraAccount = param.AccountList['PaypalOut'];
				} else {
					exportRow.ContraAccount = '[Out]';
				}
			}
		} else if (exportRow.BalanceImpactInternal === 'Credit') {
			exportRow.AccountImpact = 'Credit';
			if (exportRow.Type !== 'Currency Conversion') {
				if (param.AccountList['PaypalIn']) {
					exportRow.ContraAccount = param.AccountList['PaypalIn'];
				} else {
					exportRow.ContraAccount = '[In]';
				}
			}
		} else if (exportRow.BalanceImpactInternal === 'Memo') {
			// No account
			exportRow.Account = '';
			exportRow.ContraAccount = '';
		}

		if (Number(exportRow.Fee) === 0) {
			exportArray[countExported++] = exportRow;
		} else {
			// amounts out of the paypal account
			// for moment fee is only debit
			// we have to check if fee is positive or negative
			// create row for Gross amount
			var exportRowGross = JSON.parse(JSON.stringify(exportRow));
			var exportRowFee = JSON.parse(JSON.stringify(exportRow));
			var exportRowNet = JSON.parse(JSON.stringify(exportRow));

			// paypal account amount
			exportRowNet.Type = 'Payment Net';
			exportRowNet.ContraAccount = '';
			exportRowNet.AmountCurrency = Math.abs(currencyAmounts.Net).toFixed(2);
			exportRowNet.AmountTransactionCurrency = Math.abs(exportRowNet.Net).toFixed(2);
			exportRowNet.Amount = Math.abs(exportRowNet.NetBasicCurrency).toFixed(2);
			exportArray[countExported++] = exportRowNet;
			// the sell amount
			exportRowGross.PaypalBalance = '';
			exportRowGross.Account = '';
			exportRowGross.AmountCurrency = Math.abs(currencyAmounts.Gross).toFixed(2);
			exportRowGross.AmountTransactionCurrency = Math.abs(exportRowGross.Gross).toFixed(2);
			exportRowGross.Amount = Math.abs(exportRowGross.GrossBasicCurrency).toFixed(2);
			exportArray[countExported++] = exportRowGross;

			// create row for Expenses
			exportRowFee.Type = 'Paypal Fee';
			exportRowFee.PaypalBalance = '';
			exportRowFee.Account = '';
			exportRowFee.AmountCurrency = Math.abs(currencyAmounts.Fee).toFixed(2);
			exportRowFee.AmountTransactionCurrency = Math.abs(exportRowFee.Fee).toFixed(2);
			exportRowFee.Amount = Math.abs(exportRowFee.FeeBasicCurrency).toFixed(2);
			if (param.AccountList['PaypalFee']) {
				exportRowFee.ContraAccount = param.AccountList['PaypalFee'];
			} else {
				exportRowFee.ContraAccount = '[Fee]';
			}
			if (exportRowFee.BalanceImpactInternal === 'Debit') {
				exportRowFee.AccountImpact = 'Credit';
				if (Number(exportRowFee.Fee) < 0) {
					exportRowFee.AccountImpact = 'Debit';
				}
			} else if (exportRowFee.BalanceImpactInternal === 'Credit') {
				exportRowFee.AccountImpact = 'Debit';
				if (Number(exportRowFee.Fee) > 0) {
					exportRowFee.AccountImpact = 'Credit';
				}
			}
			exportArray[countExported++] = exportRowFee;
		}
	}
	return exportArray;
}

// For double entry set AccountDebit and AccountCredit
function ProcessTransactions_DoubleEntry(param, fileData, exportArray) {
	// create the export transactions
	for (var rowIndex = 0; rowIndex < exportArray.length; ++rowIndex) {
		var ppRow = exportArray[rowIndex];
		if (!param.IsMultiCurrency) {
			ppRow.ExchangeCurrency = param.BasicCurrency;
		}
		if (ppRow.AccountImpact === 'Debit') {
			ppRow.AmountTransactionCurrency = -ppRow.AmountTransactionCurrency;
			ppRow.AccountDebit = ppRow.ContraAccount;
			ppRow.AccountCredit = ppRow.Account;
		} else if (ppRow.AccountImpact === 'Credit') {
			ppRow.AccountDebit = ppRow.Account;
			ppRow.AccountCredit = ppRow.ContraAccount;
		} else {
			ppRow.AccountDebit = '';
			ppRow.AccountCredit = '';
		}
	}
}

// For IncomeAndExpense set Income and Expenses amounts
function ProcessTransactions_IncomeExpenses(param, fileData, exportArray) {
	// create the export transactions
	for (var rowIndex = 0; rowIndex < exportArray.length; ++rowIndex) {
		var ppRow = exportArray[rowIndex];
		ppRow.ExchangeCurrency = param.BasicCurrency;
		ppRow.Category = ppRow.ContraAccount;
		if (ppRow.AccountImpact === 'Debit') {
			if (param.IncomeExpensesSingleColumn) {
				ppRow.Income = -ppRow.Amount;
			} else {
				ppRow.Expenses = ppRow.Amount;
			}
			ppRow.AmountTransactionCurrency = -ppRow.AmountTransactionCurrency;
		} else if (ppRow.AccountImpact === 'Credit') {
			ppRow.Income = ppRow.Amount;
		}
		if (param.AccountType == 130 && !ppRow.ContraAccount) {
			// cash book use only contra account and account is not exported
			ppRow.Income = 0;
			ppRow.Expenses = 0;
		}

	}
}

// the row with the final balance for each currency
function ProcessTransactions_AddLastBalance(param, fileData, exportArray) {

	if (!param.IncludeLastBalance) {
		return;
	}
	var accountObj = "Account";
	if (param.AccountType == 100) {
		accountObj = "AccountDebit";
	}
	var count = exportArray.length;
	for (var currency in fileData.BalanceList) {
		//if (Number(fileData.BalanceList[currency].Balance) !== 0) {
		exportArray[count++] = {};
		var ppRow1 = exportArray[count - 1];
		ppRow1.Date = fileData.BalanceList[currency].Date;
		ppRow1.BalanceImpactInternal = 'Memo';
		ppRow1.Description = 'Last Balance: ' + currency + ' ' + Number(fileData.BalanceList[currency].Balance).toFixed(2);
		if (param.AccountList[currency]) {
			ppRow1[accountObj] = param.AccountList[currency];
		} else if (param.AccountList[param.BasicCurrency]) {
			ppRow1[accountObj] = param.AccountList[param.BasicCurrency];
		}
		//}
	}
}

// Set the field Description
function ProcessTransactions_SetDescription(param, fileData, exportArray) {
	//
	for (var rowIndex = 0; rowIndex < exportArray.length; ++rowIndex) {
		var ppRow = exportArray[rowIndex];
		if (!ppRow.Description) {
			ppRow.Description = ppRow.Name;
			if (!ppRow.Description) {
				ppRow.Description = ppRow.Type;
			}
			if (ppRow.Note) {
				ppRow.Description += ' ' + ppRow.Note;
			}
			if (ppRow.BalanceImpactInternal == "Memo") {
				ppRow.Description += ' MEMO';
			}
			if (ppRow.Type === 'Currency Conversion') {
				// set the amount of the currency conversion
				if (ppRow.Description.indexOf(ppRow.CurrencyTo) < 0) {
					// in some currency conversion we already have the currency
					ppRow.Description += ' ' + ppRow.CurrencyTo;
				}
				ppRow.Description += ' ' + Banana.Converter.toLocaleNumberFormat(Math.abs(ppRow.CurrencyToAmount));
				var rowGroupId = fileData.IndexTransactionId[ppRow.TransactionGroupId];
				var rowReferenceId = fileData.IndexTransactionId[ppRow.ReferenceId];
				// now try to set the description as the Name of the first relevant transaction
				// that is at the base of the currency conversion
				if (rowGroupId && fileData.paypalTransactions[rowGroupId].Type !== 'Currency Conversion') {
					ppRow.Description += ' ' + fileData.paypalTransactions[rowGroupId].Name;
				} else if (rowReferenceId && fileData.paypalTransactions[rowReferenceId].Type !== 'Currency Conversion') {
					ppRow.Description += ' ' + fileData.paypalTransactions[rowReferenceId].Name;
				}
			} else if (ppRow.AccountImpact) {
				// Use the original amounnt and currency
				if (param.SetCurrencyInDesctriptionAlways
					 || (param.SetCurrencyInDesctriptionNotBasicCurrency && param.BasicCurrency != ppRow.Currency)) {
					// we could also test to ppRow.ExchangeCurrency != ppRow.Currency
					if (ppRow.Description.indexOf(ppRow.Currency) < 0) {
						ppRow.Description += ' ' + ppRow.Currency;
					}
					ppRow.Description += ' ' + Banana.Converter.toLocaleNumberFormat(Math.abs(ppRow.AmountTransactionCurrency));
				}
			}
		}
	}
}

// copy the paypal data in export row if the field exist in
// in the Banana Transactions table
// field name in Banana must be
// 'Paypal' followed by paypal field name without spaces
function Banana_GetOtherExportColumns(param) {
	var transactions = Banana.document.table('Transactions');
	if (!transactions)
		return transactionsIdImported;
	var columnsNamesBanana = transactions.columnNames;
	for (var i = 0; i < columnsNamesBanana.length; i++) {
		var bananaName = columnsNamesBanana[i];
		if (bananaName.indexOf('Paypal') === 0) {
			// Banana.Ui.showText("Not possible");
			var paypalName = bananaName.replace('Paypal', '');
			param.SupplementaryColumns[paypalName] = bananaName;
		}
	}
}

// Trasform exportArray in Csv with the necessary fields
function ExportTransactions(param, fileData, exportArray) {
	var exportHeaders = ['Date', 'ExternalReference', 'Description'];
	var headers2;
	if (param.AccountType == 100) {
		var headers2 = ['AccountDebit', 'AccountCredit', 'Amount'];
		exportHeaders = exportHeaders.concat(headers2);
		if (param.IsMultiCurrency) {
			headers2 = ['ExchangeCurrency', 'AmountCurrency'];
			exportHeaders = exportHeaders.concat(headers2);
		}
	} else if (param.AccountType == 110) {
		headers2 = ['Income', 'Expenses', 'Account', 'Category'];
		exportHeaders = exportHeaders.concat(headers2);
	} else if (param.AccountType == 130) {
		headers2 = ['Income', 'Expenses', 'Category'];
		exportHeaders = exportHeaders.concat(headers2);
	}
	for (var property in param.SupplementaryColumns) {
		exportHeaders.push(param.SupplementaryColumns[property]);
	}
	// create the export transactions
	for (var rowIndex = 0; rowIndex < exportArray.length; ++rowIndex) {
		var ppRow = exportArray[rowIndex];
		for (var property in param.SupplementaryColumns) {
			if (ppRow[property]) {
				ppRow[param.SupplementaryColumns[property]] = ppRow[property];
			}
		}
	}
	return Banana.Converter.objectArrayToCsv(exportHeaders, exportArray, '\t');
}

// Read the orginal paypal transactions
function readTransactions(param, string, fileData) {
	// var fileData = {};
	// user separator ,
	var ppData = Banana.Converter.csvToArray(string, ',');

	// different separator
	var header = String(ppData[0]);
	if (header.indexOf(';') >= 0) {
		ppData = Banana.Converter.csvToArray(string, ';');
	}
	// Banana.Ui.showText(JSON.stringify(ppData));	
	fileData.headers = ppData[0];
	if (!ReadTransactions_TranslateHeader(param, fileData)) {
		return false;
	}
	// Remove header
	ppData.splice(0, 1);
	fileData.paypalTransactions = Banana.Converter.arrayToObject(fileData.headers, ppData, true);
	ReadTransactions_ConvertImportedData(param, fileData);
	ReadTransactions_CreateGroups(param, fileData);
	ReadTransactions_CreateBalanceList(param, fileData);
	fileData.paypalTransactions.sort(CompareForImportedRow);
	// create an index by ppRow.TransactionId
	fileData.IndexTransactionId = {};
	for (var rowIndex = 0; rowIndex < fileData.paypalTransactions.length; ++rowIndex) {
		var ppRow = fileData.paypalTransactions[rowIndex];
		fileData.IndexTransactionId[ppRow.TransactionId] = rowIndex;
	}
	return true;
}

// Convert numbers and date
// Add the basic currency amounts to the payPalTransactions
function ReadTransactions_ConvertImportedData(param, fileData) {
	if (fileData.paypalTransactions.length === 0)
		return;
	var decimalSeparator = '';
	Banana.Converter.toInternalNumberFormat('...', '.');
	Banana.Converter.toInternalNumberFormat('-0.', '.');
	Banana.Converter.toInternalNumberFormat('0.', '.');
	// First make conversion and field translation
	for (var rowIndex = 0; rowIndex < fileData.paypalTransactions.length; ++rowIndex) {
		var ppRow = fileData.paypalTransactions[rowIndex];
		// set original sequence for successive sort
		ppRow.OriginalSequence = rowIndex;
		// Net or Gross may be a '...'
		if (ppRow.Balance === '...') {
			ppRow.Balance = '';
		}
		if (ppRow.Gross === '...') {
			ppRow.Gross = '';
		}
		if (ppRow.Net === '...') {
			ppRow.Net = '';
		}
		if (ppRow.Fee === '...') {
			ppRow.Fee = '';
		}
		var temp = ppRow.Net;
		// find decimal separator
		if (decimalSeparator.length === 0) {
			if (temp.length > 0) {
				decimalSeparator = temp.substring(temp.length - 3, temp.length - 2);
			} else {
				temp = ppRow.Gross;
				if (temp.length > 0) {
					decimalSeparator = temp.substring(temp.length - 3, temp.length - 2);
				}
			}
		}
		ppRow.Date = Banana.Converter.toInternalDateFormat(ppRow.Date, param.dateFormat);
		ppRow.ClosingDate = Banana.Converter.toInternalDateFormat(ppRow.ClosingDate, param.dateFormat);
		ppRow.Net = Number(Banana.Converter.toInternalNumberFormat(ppRow.Net, decimalSeparator));
		ppRow.Gross = Number(Banana.Converter.toInternalNumberFormat(ppRow.Gross, decimalSeparator));
		ppRow.Fee = Number(Banana.Converter.toInternalNumberFormat(ppRow.Fee, decimalSeparator));
		ppRow.Balance = Number(Banana.Converter.toInternalNumberFormat(ppRow.Balance, decimalSeparator));
		/* The field BalanceImpact is needed
		in order to distinguish row that have BalanceImpact "Memo"  but also have amounts
		It may be possible to understand if the transaction is a Memo but it is necessary
		to check the balance and the problem arise with different currencies
		Starting  Nov 2016 BalanceImpact field is no more available for download on the new versionn of Paypal
		But it is possible to select only transactions with balance Impact.
		So we use BalanceImpactInternal
		 */
		if (ppRow.BalanceImpact) {
			ppRow.BalanceImpactInternal = ppRow.BalanceImpact;
			if (ppRow.BalanceImpact === 'Gutschrift'
				 || ppRow.BalanceImpact === 'Gutschrift/ gutschreiben'
				 || ppRow.BalanceImpact === 'Haben'
				 || ppRow.BalanceImpact === 'Crédit') {
				ppRow.BalanceImpactInternal = 'Credit';
			}
			if (ppRow.BalanceImpact === 'Lastschrift' 
			|| ppRow.BalanceImpact === 'Soll'
			|| ppRow.BalanceImpact === 'Débit') {
				ppRow.BalanceImpactInternal = 'Debit';
			}
		} else {
			/* New verssion without BalanceImpact column,
			determine the BalanceImpactInternal based on the amount.
			In order to user file that have also non impact amounts (memo)
			the script should check the prior balance and see if there have been some changes.
			This only work if there is a previous transaction, but in most case it should work */

			if (ppRow.Net < 0) {
				ppRow.BalanceImpactInternal = 'Debit';
			} else if (ppRow.Net > 0) {
				ppRow.BalanceImpactInternal = 'Credit';
			} else {
				if (ppRow.Gross < 0) {
					ppRow.BalanceImpactInternal = 'Debit';
				} else if (ppRow.Gross > 0) {
					ppRow.BalanceImpactInternal = 'Credit';
				}
			}
		}
		/* Nov 2016 "General Currency  Conversion" instead of "Currency  Conversion" */
		if (ppRow.Type == "General Currency Conversion"
			 || ppRow.Type === 'Conversion de devise'
			 || ppRow.Type === 'Währungsumrechnung'
			 || ppRow.Type === 'Allgemeine Währungsumrechnung') {
			ppRow.Type = 'Currency Conversion';
		}
	}
}
// Assign to each paypal transaction the new fields
// and a TransactionGroupId that identify transactions that
// belong to the same operation
function ReadTransactions_CreateGroups(param, fileData) {
	// add the field we will use
	for (var rowIndex = 0; rowIndex < fileData.paypalTransactions.length; ++rowIndex) {
		var ppRow = fileData.paypalTransactions[rowIndex];
		// Unique transaction identifier
		ppRow.ExternalReference = ppRow.TransactionId;
		// We create a new referenceId
		ppRow.ReferenceId = ppRow.ReferenceTxnId;
		if (ppRow.ReferenceId.length === 0) {
			ppRow.ReferenceId = ppRow.TransactionId;
		}
		ppRow.AlreadyImported = false;
		// Currency for import in multicurrency
		// can be different from transaction currency when values are converted to basic currencies
		ppRow.ExchangeCurrency = '';
		// Net Amount  converted to BasicCurrency
		ppRow.NetBasicCurrency = 0;
		// Fee Amount converted to BasicCurrency
		ppRow.FeeBasicCurrency = 0;
		// Gross Amount converted to BasicCurrency
		ppRow.GrossBasicCurrency = 0;
		// for Currency Conversion the 'other' currency
		ppRow.CurrencyTo = '';
		// for Currency Conversion the 'other' amount
		ppRow.CurrencyToAmount = 0;
		// The type of the currency conversion
		// 1 = BasicCurrency
		// 2 = Paypal currency conversion operation
		// 3 = Same TransactionsId and amount
		// 4 = Same TransactionId
		// 5 = Same date
		// 6 = From ExchangeRateList (imported)
		// 7 = From collected Exchange
		ppRow.CurrencyConversionType = 0;
		// TransactionId of the first transaction with same date, time and same ReferenceId
		// it's used to group transactions that belong to the same operation
		ppRow.TransactionGroupId = '';
		// BalanceImpact (Debit or Credit) and without 'Memo'
		ppRow.AccountImpact = '';
		// The PaypalAccount or the account for the specific currency
		ppRow.Account = '';
		// The contra account (PaypalIn, PaypalOut, PaypalFee)
		ppRow.ContraAccount = '';
		// The amount in Basic Currency exported
		ppRow.Amount = 0;
		// the amount in Currency exported
		// can be different if account does not exist in multi currency
		ppRow.AmountCurrency = 0;
		// the amount in transaction currency
		ppRow.AmountTransactionCurrency = 0;
		// The description
		ppRow.Description = '';
	}
	//
	var lastTransaction = {};
	lastTransaction.Date = '';
	lastTransaction.Time = '';
	lastTransaction.TimeZone = '';
	lastTransaction.ReferenceId = '';
	lastTransaction.TransactionGroupId = '';
	lastTransaction.Currency = '';
	lastTransaction.Net = '';
	for (var rowIndex = 0; rowIndex < fileData.paypalTransactions.length; ++rowIndex) {
		var ppRow = fileData.paypalTransactions[rowIndex];
		// create field 'TransactionGroupId' to group same transactions
		// ReferenceTxnId refer also to transactions of prior date (refund etc.)
		if (lastTransaction.Date === ppRow.Date && lastTransaction.Time === ppRow.Time && lastTransaction.TimeZone === ppRow.TimeZone && lastTransaction.ReferenceId === ppRow.ReferenceId) {
			ppRow.TransactionGroupId = lastTransaction.TransactionGroupId;
		} else {
			lastTransaction.Date = ppRow.Date;
			lastTransaction.Time = ppRow.Time;
			lastTransaction.TimeZone = ppRow.TimeZone;
			lastTransaction.ReferenceId = ppRow.ReferenceId;
			lastTransaction.TransactionGroupId = ppRow.TransactionId;
			lastTransaction.Currency = ppRow.Currency;
			lastTransaction.Net = ppRow.Net;
			ppRow.TransactionGroupId = ppRow.TransactionId;
		}
	}
}

// Create an object with the end balance for each currency
function ReadTransactions_CreateBalanceList(param, fileData) {
	// Balance list key = Currency, value = last balance
	// same as fileData.BalanceList['EUR'] = 10.00
	fileData.BalanceList = {};

	for (var rowIndex = 0; rowIndex < fileData.paypalTransactions.length; ++rowIndex) {
		var ppRow = fileData.paypalTransactions[rowIndex];
		if (!fileData.BalanceList[ppRow.Currency]
			 && (ppRow.BalanceImpactInternal === 'Credit' || ppRow.BalanceImpactInternal === 'Debit')) {
			fileData.BalanceList[ppRow.Currency] = {};
			fileData.BalanceList[ppRow.Currency].Balance = ppRow.Balance;
			fileData.BalanceList[ppRow.Currency].Date = ppRow.Date;
		}
	}
	// fileData.singleCurrency contains the currency if only one has been found
	fileData.singleCurrency = "";
	if (fileData.BalanceList.length === 1) {
		fileData.singleCurrency = fileData.BalanceList[0];
	}
	// We create a list of Currency with Balance that does not goes to 0
	//
	// It does not work in all case, by Refund the TransactionId is not always the same
	// For this currency we need a conversion
	fileData.CurrencyListBalanceNotZero = {};
	var lastTransactionGroupId = '';
	// used to save the currency with the same transactionGroupId
	var currencyListGroupId = {};
	for (var rowIndex = 0; rowIndex < fileData.paypalTransactions.length; ++rowIndex) {
		var ppRow = fileData.paypalTransactions[rowIndex];
		if (lastTransactionGroupId !== ppRow.TransactionGroupId) {
			currencyListGroupId = {};
			lastTransactionGroupId = ppRow.TransactionGroupId;
		}
		if (!fileData.CurrencyListBalanceNotZero[ppRow.Currency]
			 && !currencyListGroupId[ppRow.Currency]
			 && (ppRow.BalanceImpactInternal === 'Credit' || ppRow.BalanceImpactInternal === 'Debit')) {
			currencyListGroupId[ppRow.Currency] = '';
			// the first row of this group with this currency is not zero
			if (Number(ppRow.Balance) !== 0) {
				fileData.CurrencyListBalanceNotZero[ppRow.Currency] = '';
			}
		}
	}
}

// Translate the header of the paypal file
function ReadTransactions_TranslateHeader(param, fileData) {
	//Need to remove spaces
	for (var i = 0; i < fileData.headers.length; ++i) {
		fileData.headers[i] = fileData.headers[i].trim();
	}
	//Translate the header
	var translated = false;
	for (var i = 0; i < fileData.headers.length; ++i) {
		if (fileData.headers[i] === 'Time') {
			fileData.language = 'en';
			translated = ReadTransactions_TranslateHeader_English(fileData.headers);
			break;
		}
		if (fileData.headers[i] === 'Zeit' || fileData.headers[i] === 'Uhrzeit') {
			fileData.language = 'de';
			translated = ReadTransactions_TranslateHeader_German(fileData.headers);
			break;
		}
		if (fileData.headers[i] === 'Heure') {
			fileData.language = 'fr';
			translated = ReadTransactions_TranslateHeader_French(fileData.headers);
			break;
		}
	}
	if (!translated) {
		AddMessage('Headers not in one of the expected language');
		return false;
	}
	// check if all fields exists
	var checkFields = ['Date', 'Time', 'Type', 'Status', 'Currency',
		'Gross', 'Fee', 'Net', 'ReferenceTxnId', 'Balance'];
	for (var i = 0; i < checkFields.length; i++) {
		if (fileData.headers.indexOf(checkFields[i]) < 0) {
			AddMessage('Field: "' + checkFields[i] + '" not found in headers.\n In Paypal download include all fields available');
			return false;
		}
	}
	return true;
}

function ReadTransactions_TranslateHeader_English(headers) {
	// Internal use different names sot that if paypal change the header we only need
	// to modify here
	var textMap = {};
	textMap['Date'] = 'Date';
	textMap['Time'] = 'Time';
	textMap['Time Zone'] = 'TimeZone';
	textMap['Type'] = 'Type';
	textMap['Name'] = 'Name';
	textMap['Status'] = 'Status';
	textMap['Subject'] = 'Subject';
	textMap['Currency'] = 'Currency';
	textMap['Gross'] = 'Gross';
	textMap['Fee'] = 'Fee';
	textMap['Net'] = 'Net';
	textMap['Note'] = 'Note';
	textMap['From Email Address'] = 'FromEmailAddress';
	textMap['To Email Address'] = 'ToEmailAddress';
	textMap['Transaction ID'] = 'TransactionId';
	textMap['Payment Type'] = 'PaymentType';
	textMap['Counterparty Status'] = 'CounterpartyStatus';
	textMap['Shipping Address'] = 'ShippingAddress';
	textMap['Address Status'] = 'AddressStatus';
	textMap['Item Title'] = 'ItemTitle';
	textMap['Item ID'] = 'ItemId';
	textMap['Shipping and Handling Amount'] = 'ShippingAndHandlingAmount';
	textMap['Insurance Amount'] = 'InsuranceAmount';
	textMap['Sales Tax'] = 'SalesTax';
	textMap['Tip'] = 'Tip';
	textMap['Discount'] = 'Discount';
	textMap['Seller Id'] = 'SellerId';
	textMap['Option 1 Name'] = 'Option1Name';
	textMap['Option 1 Value'] = 'Option1Value';
	textMap['Option 2 Name'] = 'Option2Name';
	textMap['Option 2 Value'] = 'Option2Value';
	textMap['Auction Site'] = 'AuctionSite';
	textMap['Buyer ID'] = 'BuyerId';
	textMap['Item URL'] = 'ItemUrl';
	textMap['Closing Date'] = 'ClosingDate';
	textMap['Reference Txn ID'] = 'ReferenceTxnId';
	textMap['Invoice Number'] = 'InvoiceNumber';
	textMap['Subscription Number'] = 'SubscriptionNumber';
	textMap['Custom Number'] = 'CustomNumber';
	textMap['Receipt ID'] = 'ReceiptId';
	textMap['Guthaben'] = 'Balance';
	textMap['Contact Phone Number'] = 'ContactPhoneNumber';
	textMap['Balance Impact'] = 'BalanceImpact';
	textMap['Address Line 1'] = 'AddressLine1';
	textMap['Address Line 2/District/Neighborhood'] = 'AddressLine2';
	textMap['State/Province/Region/County/Territory/Prefecture/Republic'] = 'State';
	textMap['Town/City'] = 'Town';
	textMap['Zip/Postal Code'] = 'Zip';
	textMap['Country'] = 'Country';
	for (var i = 0; i < headers.length; i++) {
		if (textMap[headers[i]]) {
			headers[i] = textMap[headers[i]];
		}
	}
	return true;
}


function ReadTransactions_TranslateHeader_German(headers) {
	// field not found in English
	var textMap = {};
	textMap['Datum'] = 'Date';
	textMap['Zeit'] = 'Time';
	/* From November 2016 */
	textMap['Uhrzeit'] = 'Time';
	textMap['Zeitzone'] = 'TimeZone';
	textMap['Typ'] = 'Type';
	textMap['Name'] = 'Name';
	textMap['Status'] = 'Status';
	textMap['Beschreibung'] = 'Subject';
	textMap['Währung'] = 'Currency';
	textMap['Brutto'] = 'Gross';
	textMap['Gebühr'] = 'Fee';
	textMap['Netto'] = 'Net';
	textMap['Hinweis'] = 'Note';
	textMap['Absender E-Mail-Adresse'] = 'FromEmailAddress';
	textMap['An E-Mail-Adresse'] = 'ToEmailAddress';
	textMap['Transaktionscode'] = 'TransactionId';
	textMap['Zahlungsart'] = 'PaymentType';
	textMap['Status der Gegenpartei'] = 'CounterpartyStatus';
	textMap['Lieferadresse'] = 'ShippingAddress';
	textMap['Adressstatus'] = 'AddressStatus';
	textMap['Artikelbezeichnung'] = 'ItemTitle';
	textMap['Artikelnummer'] = 'ItemId';
	textMap['Versand- und Bearbeitungsgebühr'] = 'ShippingAndHandlingAmount';
	textMap['Versicherungsbetrag'] = 'InsuranceAmount';
	textMap['Umsatzsteuer'] = 'SalesTax';
	textMap['Trinkgeld'] = 'Tip';
	textMap['Rabatt'] = 'Discount';
	textMap['Mitgliedsname des Verkäufers'] = 'SellerId';
	textMap['Option 1 Name'] = 'Option1Name';
	textMap['Option 1 Wert'] = 'Option1Value';
	textMap['Option 2 Name'] = 'Option2Name';
	textMap['Option 2 Wert'] = 'Option2Value';
	textMap['Auktions-Site'] = 'AuctionSite';
	textMap['Käufer-ID'] = 'BuyerId';
	textMap['Artikel-URL'] = 'ItemUrl';
	textMap['Angebotsende'] = 'ClosingDate';
	textMap['Txn-Referenzkennung'] = 'ReferenceTxnId';
	/* From Nov 2016 */
	textMap['Zugehöriger Transaktionscode'] = 'ReferenceTxnId';
	textMap['Rechnungsnummer'] = 'InvoiceNumber';
	textMap['Abonnementnummer'] = 'SubscriptionNumber';
	textMap['Individuelle Nummer'] = 'CustomNumber';
	textMap['Bestätigungsnummer'] = 'ReceiptId';
	textMap['Guthaben'] = 'Balance';
	textMap['Telefonnummer der Kontaktperson'] = 'ContactPhoneNumber';
	textMap['Auswirkung auf Guthaben'] = 'BalanceImpact';
	textMap['Addresse'] = 'AddressLine1';
	textMap['Ort2'] = 'AddressLine2';
	textMap['Staat/Provinz/Region/Landkreis/Territorium/Präfektur/Republik'] = 'State';
	textMap['Town/City'] = 'Town';
	textMap['PLZ'] = 'Zip';
	textMap['Land'] = 'Country';
	for (var i = 0; i < headers.length; i++) {
		if (textMap[headers[i]]) {
			headers[i] = textMap[headers[i]];
		}
	}
	// check if the translation of accent is correct
	// there may be a problem if the file code page is different
	if (headers.indexOf('Currency') >= 0) {
		return true;
	}
	AddMessage('Impossible to translate German file header:\nConvert paypal file to code page Latin1 or use new version of Banana Accounting');
	return false;
}

function ReadTransactions_TranslateHeader_French(headers) {
	var textMap = {};
	textMap['Date'] = 'Date';
	textMap['Heure'] = 'Time';
	textMap['Fuseau horaire'] = 'TimeZone';
	textMap['Type'] = 'Type';
	textMap['Nom'] = 'Name';
	textMap['État'] = 'Status';
	textMap['Objet'] = 'Subject';
	textMap['Devise'] = 'Currency';
	textMap['Avant commission'] = 'Gross';
	textMap['Frais'] = 'Fee';
	textMap['Commission'] = 'Fee';
	textMap['Net'] = 'Net';
	textMap['Remarque'] = 'Note';
	textMap["De l'adresse email"] = 'FromEmailAddress';
	textMap["À l'adresse email"] = 'ToEmailAddress';
	textMap['Numéro de transaction'] = 'TransactionId';
	textMap['Type de paiement'] = 'PaymentType';
	textMap["Statut de l'autre partie"] = 'CounterpartyStatus';
	textMap['Adresse de livraison'] = 'ShippingAddress';
	textMap["État de l'adresse"] = 'AddressStatus';
	textMap["Titre de l'objet"] = 'ItemTitle';
	textMap["Numéro d'objet"] = 'ItemId';
	textMap['Montant de la livraison et du traitement'] = 'ShippingAndHandlingAmount';
	textMap["Montant de l'assurance"] = 'InsuranceAmount';
	textMap['TVA'] = 'SalesTax';
	textMap['Pourboire'] = 'Tip';
	textMap['Remise'] = 'Discount';
	textMap['Identifiant du vendeur'] = 'SellerId';
	textMap['Nom Option 1'] = 'Option1Name';
	textMap['Valeur Option 1'] = 'Option1Value';
	textMap['Nom Option 2'] = 'Option2Name';
	textMap['Valeur Option 2'] = 'Option2Value';
	textMap["Site d'enchères"] = 'AuctionSite';
	textMap["Pseudo de l'acheteur"] = 'BuyerId';
	textMap["URL de l'objet"] = 'ItemUrl';
	textMap['Date de clôture'] = 'ClosingDate';
	textMap['Nº de transaction de référence'] = 'ReferenceTxnId';
	textMap['Numéro de la transaction de référence'] = 'ReferenceTxnId';
	textMap['Nº de facture'] = 'InvoiceNumber';
	textMap["Nº d'abonnement"] = 'SubscriptionNumber';
	textMap['Nº de client'] = 'CustomNumber';
	textMap["Numéro de reçu"] = 'ReceiptId';
	textMap['Solde'] = 'Balance';
	textMap['N° de téléphone du contact'] = 'ContactPhoneNumber';
	textMap['Impact sur le solde'] = 'BalanceImpact';
	textMap['Adresse 1'] = 'AddressLine1';
	textMap['Adresse 2/district/quartier'] = 'AddressLine2';
	textMap['État/Province/Région/Comté/Territoire/Préfecture/République'] = 'State';
	textMap['Ville'] = 'Town';
	textMap['Code postal'] = 'Zip';
	textMap['Pays'] = 'Country';
	for (var i = 0; i < headers.length; i++) {
		if (textMap[headers[i]]) {
			headers[i] = textMap[headers[i]];
		}
	}
	// check if the translation of accent is correct
	// there may be a problem if the file code page is different
	if (headers.indexOf('Status') >= 0) {
		return true;
	}
	//Not translated due to accent conversion problems
	AddMessage('Impossible to translate French file header:\nConvert paypal file to code page Latin1 or use new version of Banana Accounting');
	return false;
}

// Initialize the values for test purpose
function Banana_GetValuesForTest(param, fileData) {
	// test case internal Banana.ch
	// should also test for single currency and Income and Expenses
	param.IncludeCurrencyConversions = true;
	param.IncludeLastBalance = true;
	param.IncludeExistingTransactions = false;
	param.IncomeExpensesSingleColumn = true;
	param.UseCollectedExchangeRates = true;
	param.SetCurrencyInDesctriptionAlways = false;
	param.SetCurrencyInDesctriptionNotBasicCurrency = true;
	if (fileData.paypalTransactions[0].Name === 'TestEUR') {
		param.BasicCurrency = 'EUR';
		param.ExchangeRateList['EUR'] = '0.82';
		param.AccountType = 100;
	} else if (fileData.paypalTransactions[0].Name === 'TestIncome') {
		// income and expenses
		param.BasicCurrency = 'CHF';
		param.SetCurrencyInDesctriptionAlways = true;
		param.IncomeExpensesSingleColumn = true;
		param.AccountType = 110;
		param.IsMultiCurrency = false;
		param.AccountList[param.BasicCurrency] = 'PaypalAccount';
	} else if (fileData.paypalTransactions[0].Name === 'TestCashBook') {
		// income and expenses
		param.BasicCurrency = 'CHF';
		param.SetCurrencyInDesctriptionAlways = true;
		param.IncomeExpensesSingleColumn = false;
		param.AccountType = 130;
		param.IsMultiCurrency = false;
	} else {
		// double entry accounting
		param.BasicCurrency = 'CHF';
		param.AccountType = 100;
		param.IsMultiCurrency = true;
		param.AccountList['CHF'] = 'AcctCHF'
		param.AccountList['EUR'] = 'AcctEUR'
		param.AccountList['USD'] = 'AcctUSD'
		param.AccountList['GBP'] = 'AcctGBP'
	}
	param.AccountList['PaypalIn'] = 'PaypalIn';
	param.AccountList['PaypalOut'] = 'PaypalOut';
	param.AccountList['PaypalFee'] = 'PaypalFee';

	// define columns to export
	param.SupplementaryColumns['Type'] = 'PaypalType';
	param.SupplementaryColumns['Status'] = 'PaypalStatus';
	param.SupplementaryColumns['TransactionGroupId'] = 'TransactionGroupId';
	param.SupplementaryColumns['NetBasicCurrency'] = 'NetBasicCurrency';
	param.SupplementaryColumns['FeeBasicCurrency'] = 'FeeBasicCurrency';
	param.SupplementaryColumns['GrossBasicCurrency'] = 'GrossBasicCurrency';
	param.SupplementaryColumns['Balance'] = 'PaypalBalance';
	param.SupplementaryColumns['CurrencyTo'] = 'CurrencyTo';
	param.SupplementaryColumns['CurrencyToAmount'] = 'CurrencyToAmount';
	param.SupplementaryColumns['ReferenceId'] = 'ReferenceId';
	param.SupplementaryColumns['AccountImpact'] = 'AccountImpact';
	param.SupplementaryColumns['AmountTransactionCurrency'] = 'AmountTransactionCurrency';
	param.SupplementaryColumns['CurrencyToAmount'] = 'CurrencyToAmount';
	param.SupplementaryColumns['Gross'] = 'Gross';
	param.SupplementaryColumns['Fee'] = 'Fee';
	param.SupplementaryColumns['Net'] = 'Net';
	param.SupplementaryColumns['OriginalSequence'] = 'OriginalSequence';
	param.SupplementaryColumns['CurrencyConversionType'] = 'CurrencyConversionType';

}

function Banana_GetAccountData(param, fileData) {

	if (!Banana.document)
		return false;
	Banana_GetAccountType(param);
	Banana_GetAccountsList(param, fileData);
	Banana_GetExhangeRates(param);
	Banana_GetOtherExportColumns(param);
	// By using more accounts need to have IncludeCurrencyConversions
	if (Object.keys(param.AccountList).length > 1) {
		param.IncludeCurrencyConversions = true;
	}
	return true;
}

// Retrieve from Banana the account type and other informations
function Banana_GetAccountType(param) {

	// Parameters taken from Banana.document
	param.BasicCurrency = Banana.document.info('AccountingDataBase', 'BasicCurrency');
	param.IsMultiCurrency = false;
	// If is not multi currency amount imported in Basic Currency
	var fileTypeGroup = Number(Banana.document.info('Base', 'FileTypeGroup'));
	var fileTypeNumber = Number(Banana.document.info('Base', 'FileTypeNumber'));
	// 100 Double entry
	// 110 Income and Expenses
	// 130 Cash book
	param.AccountType = fileTypeGroup;
	if (fileTypeGroup == 100) {
		if (fileTypeNumber == 120 || fileTypeNumber == 130) {
			param.IncludeCurrencyConversions = true;
			param.IsMultiCurrency = true;
		}
	}
}

// Create the param.AccountList
// Look in Banana if there are accounts with the description
// currency = Paypal Account
// PaypalIn = Paypal In
// PaypalOut = Paypal Out
// PaypalFee = Paypal Fee
//
function Banana_GetAccountsList(param, fileData) {

	var accounts = Banana.document.table('Accounts');
	if (!accounts)
		return;
	// PaypalAccount' for all account that
	var paypalOther = '';
	for (var rowNumber = 0; rowNumber < accounts.rowCount; rowNumber++) {
		var row = accounts.rows[rowNumber];
		var description = row.value('Description').toLowerCase().trim();
		if (description.substring(0, 6) == 'paypal') {
			var account = row.value('Account');
			if (('paypal in') == description) {
				param.AccountList['PaypalIn'] = account;
			} else if (('paypal out') == description) {
				param.AccountList['PaypalOut'] = account;
			} else if (('paypal fee') == description) {
				param.AccountList['PaypalFee'] = account;
			} else if ('paypal' == description) {
				paypalOther = row.value('Account');
			}
			if (param.IsMultiCurrency) {
				var accountCurrency = row.value('Currency');
				if ('paypal account' == description
					 && !param.AccountList[param.BasicCurrency]
					 && accountCurrency == param.BasicCurrency) {
					// probably just one account
					param.AccountList[param.BasicCurrency] = account;
				}
				if (description.substring(0, 14) == 'paypal account'
					 && !param.AccountList[accountCurrency]) {
					param.AccountList[accountCurrency] = account;
				}
			} else {	
				if (!param.AccountList[param.BasicCurrency]
					 && ('paypal account') == description) {
					param.AccountList[param.BasicCurrency] = account;
				}
				if (('paypal account ' + param.BasicCurrency.toLowerCase()) == description) {
					param.AccountList[param.BasicCurrency] = account;
				}
				for (var currency in fileData.BalanceList) {
					if (('paypal account ' + currency.toLowerCase()) == description
						 && !param.AccountList[currency]) {
						param.AccountList[currency] = account;
					}
				}
			}
		}
	}
	// we look also in table categories for income and expenses
	var categories = Banana.document.table('Categories');
	if (categories) {
		// Not multi currency account description = 'Paypal EUR'
		for (var rowNumber = 0; rowNumber < categories.rowCount; rowNumber++) {
			var row = categories.rows[rowNumber];
			var description = row.value('Description').toLowerCase().trim();
			var account = row.value('Category');
			if (description.substring(0, 6) == 'paypal') {
				if (('paypal in') == description) {
					param.AccountList['PaypalIn'] = account;
				} else if (('paypal out') == description) {
					param.AccountList['PaypalOut'] = account;
				} else if (('paypal fee') === description) {
					param.AccountList['PaypalFee'] = account;
				}
			}
		}
	}
}

// create a list of paypal currecny and exchange rate
// BasicCurrencyAmount = CurrencyAmount * exchangeRate
function Banana_GetExhangeRates(param) {

	if (!param.IsMultiCurrency) {
		return;
	}
	var exchangeRates = Banana.document.table('ExchangeRates');
	if (!exchangeRates) {
		return;
	}
	for (var rowNumber = 0; rowNumber < exchangeRates.rowCount; rowNumber++) {
		var row = exchangeRates.rows[rowNumber];
		var rowDate = row.value('Date');
		var currency = row.value('Currency');
		var refCurrency = row.value('CurrencyReference');
		var multiplier = row.value('Multiplier');
		var rate = row.value('Rate');
		var calculatedRate = 0;
		if (rowDate == '' && (refCurrency == param.BasicCurrency || refCurrency == '') && currency !== '') {
			if (Number(multiplier) === 0) {
				calculatedRate = 1 / rate;
			} else if (Number(multiplier) > 0) {
				calculatedRate = 1 / rate * multiplier;
			}
			if (Number(multiplier) < 0) {
				calculatedRate = rate * Math.abs(multiplier);
			}
			param.ExchangeRateList[currency] = calculatedRate;
		} else if (rowDate == '' && currency === param.BasicCurrency && refCurrency !== '') {
			if (Number(multiplier) === 0) {
				calculatedRate = rate;
			} else if (Number(multiplier) > 0) {
				calculatedRate = rate * multiplier;
			}
			if (Number(multiplier) < 0) {
				calculatedRate = 1 / rate * Math.abs(multiplier);
			}
			param.ExchangeRateList[refCurrency] = calculatedRate;
		}

	}
}

/**
 * Converts an array of array string to an array of objects
 * @param {Array} arrData An array of array strings
 * @param {Array} headers An array of strings that will become the properties
 * @param {string} skipVoid id true skip void lines
 * @return {string} the array of objects .
 */
if (Banana.Converter.arrayToObject === undefined) {
	Banana.Converter.arrayToObject = function (headers, arrData, skipVoid) {
		var result = [];
		if (skipVoid === undefined) {
			skipVoid = false;
		}
		var count = 0;
		for (var i = 0; i < arrData.length; i++) {
			var values = arrData[i];
			var resultLine = {};
			for (var j = 0; j < headers.length; ++j) {
				if (j < values.length) {
					resultLine[headers[j]] = values[j];
				} else {
					resultLine[headers[j]] = '';
				}
			}
			if (values.length > 0 || skipVoid === false) {
				result[count++] = resultLine;
			}
		}
		return result;
	}
}

if (Banana.Converter.objectArrayToCsv === undefined) {
	Banana.Converter.objectArrayToCsv = function (headers, objArray, separator) {
		var output = "";
		var row = "";
		// Initialize default parameters.
		if (typeof(separator) === "undefined" || separator === null) {
			separator = ",";
		}
		// headers
		for (var propIndex = 0; propIndex < headers.length; ++propIndex) {
			if (propIndex > 0) {
				row += separator;
			}
			row += headers[propIndex];
		}
		output += row + "\n";

		// Loop through  rows
		for (var rowIndex = 0; rowIndex < objArray.length; ++rowIndex) {
			var rowOject = objArray[rowIndex];
			var row = "";
			// Then iterate through the remaining properties and use the headers as keys
			for (var propIndex = 0; propIndex < headers.length; ++propIndex) {
				var propLabel = headers[propIndex];
				var propValue = "";
				if (rowOject[propLabel] !== undefined) {
					propValue = String(rowOject[propLabel]);
					propValue = propValue.replace(/"/g, '""');
					if (propValue.search(/("|\t|\n)/g) >= 0 || propValue.search(separator) >= 0) {
						propValue = '"' + propValue + '"';
					}
				}
				// don't write the first
				if (propIndex > 0) {
					row += separator;
				}
				row += propValue;
			}
			output += row + "\n";
		}
		return output;
	}
}