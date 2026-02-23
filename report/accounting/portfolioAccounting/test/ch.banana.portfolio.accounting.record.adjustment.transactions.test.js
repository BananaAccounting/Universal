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
//

// @id = ch.banana.portfolio.accounting.record.adjustment.transactions.test
// @api = 1.0
// @pubdate = 2025-01-22
// @publisher = Banana.ch SA
// @description = <TEST ch.banana.portfolio.accounting.record.adjustment.transactions.test>
// @task = app.command
// @doctype = *.*
// @docproperties = 
// @outputformat = none
// @inputdataform = none
// @includejs = ../ch.banana.portfolio.accounting.calculation.methods.js
// @includejs = ../ch.banana.portfolio.accounting.record.adjustment.transactions.js
// @includejs = ../ch.banana.portfolio.accounting.accounts.dialog.js
// @timeout = -1

// Register test case to be executed
Test.registerTestCase(new TestAdjustmentTransactions());

// Here we define the class, the name of the class is not important
function TestAdjustmentTransactions() {
}

// This method will be called at the beginning of the test case
TestAdjustmentTransactions.prototype.initTestCase = function () {
    this.testLogger = Test.logger;
    this.progressBar = Banana.application.progressBar;

    let fileName = "file:script/../test/testcases/portfolio_accounting_double_entry_multi_currency_tutorial_adjustmenttest_2024.ac2";
    this.banDoc = Banana.application.openDocument(fileName);
    if (!this.banDoc) {
        this.testLogger.addFatalError("File not found: " + fileName);
        return;
    }

}

// This method will be called at the end of the test case
TestAdjustmentTransactions.prototype.cleanupTestCase = function () {

}

// This method will be called before every test method is executed
TestAdjustmentTransactions.prototype.init = function () {

}

// This method will be called after every test method is executed
TestAdjustmentTransactions.prototype.cleanup = function () {

}

TestAdjustmentTransactions.prototype.testRecordSalesTransactions = function () {

    let docChange = {}
    docChange = getTestData(this.banDoc);
    this.testLogger.addSection("Adjustment transactions document change.");
    this.testLogger.addJson("Doc Change object", JSON.stringify(docChange));
}

/**
 * Generate adjustment transactions. 
 * In this test case, are always used the same exchange rate for each transaction, that means,
 * adjustment are created only for the price.
 * The current data is:
 * - CH003886335: Book value: 12.8226, Market value: 12.8001, Qt 200 -> cost
 * - CH002775224: Book value: 5.9876, Market value: 5.9998, Qt 250 -> income
 * - IT0005239360: Book value: 10.0000, Market value: 9.50, Qt 100 -> cost
 * - US123456789: Book value: 11.0000, Market value: 11.5562, Qt 100 -> income
 * - IT000792468: Book value: 0.9800, Market value: 1.025, Qt 5000 -> income
 */
function getTestData(banDoc) {
    let dlgAccountsSettingsId = "ch.banana.portfolio.accounting.accounts.dialog";
    const docInfo = getDocumentInfo(banDoc);

    let itemsData = getItemsTableData(banDoc);

    let savedAccountsParams = getFormattedSavedParams(banDoc, dlgAccountsSettingsId);
    savedAccountsParams = verifyAccountsParams(banDoc, savedAccountsParams);

    let savedMarketValuesParams = initAdjustmentDialogParams(banDoc, docInfo, itemsData);
    savedMarketValuesParams.date = ""; // we dont want to test the date as would change each time.

    const adjustmentTransactionsManager = new AdjustmentTransactionsManager(banDoc, docInfo, itemsData,
        savedMarketValuesParams, savedAccountsParams);

    const docObj = adjustmentTransactionsManager.getDocumentChangeObject();

    /** Prima controlliamo la correttezza degli assestamenti generati calcolando
     * il totale dei saldi dei conti e confrontandoli con i valori attuali presenti nella
     * tabella Items */
    checkAssetAccountBalances(banDoc, docInfo, docObj);

    // Ritorniamo l'oggetto
    return docObj;
}

/** 
 * Ritorna il bilancio totale di tutti i titoli che usano un certo Asset Account.
*/
function getItemsAssAccCurrBal(banDoc, itemAssetAcc, inItemCurr) {
    let itemTableData = getItemsTableData(banDoc);
    if (!itemTableData)
        return "";
    let totBalance = "";
    for (const item of itemTableData) {
        if (item.account == itemAssetAcc) {
            if (inItemCurr) { // lavoriamo con il bilancio in moneta del conto.
                totBalance = Banana.SDecimal.add(totBalance, item.valueCurrentCurrency);
            } else { // lavoriamo con il bilancio in moneta base.
                totBalance = Banana.SDecimal.add(totBalance, item.valueCurrent);
            }
        }
    }
    return totBalance;
}

/** Viene passato l'oggetto del document change con tutte le registrazioni che verranno applicate.
 * Utilizziamo gli importi da registrare, per controllare se sommandoli al saldo corrente del Asset Account,
 * il saldo è uguale al saldo del conto, in pratica simuliamo la registrazione senza andare a modificare
 * il file con i dati di test originali.
 */
function checkAssetAccountBalances(banDoc, docInfo, docChangeObj) {
    let assetAccounts = getAssetAccountsFormatted(banDoc).split(";");
    assetAccounts.forEach(acc => {
        const tableRow = banDoc.table('Accounts').findRowByValue('Account', acc);
        const accBalanceCurrBeforeAdj = tableRow.value("BalanceCurrency");
        const accBalanceBaseBeforeAdj = tableRow.value("Balance");

        /** Controlliamo prima i bilanci in base all'assestamento del prezzo.
         * L'assestamento del prezzo aggiorna i bilanci in entrambe le monete, del titolo
         * e base.
        */
        checkAssetAccountBalances_PriceAdjustment(accBalanceCurrBeforeAdj, accBalanceBaseBeforeAdj, docChangeObj, acc);


        /** Se la moneta del conto è diversa dalla moneta base, controlliamo
         * i bilanci in moneta base sulla base dell'assestamento del tasso di cambio.
         * Se la moneta del conto è la stessa della moneta base, allora il bilancio base
         * deve essere uguale al bilancio della moneta del titolo, dovrebbe essere
         * corretto ma per sicurezza controlliamo comunque.
         */
        const accCurrency = tableRow.value("Currency");
        const adjAmtExRate = getAdjAmounts(docChangeObj, acc, "Amount");
        // Calcoliamo il bilancio attuale.
        let calculatedBalanceBase = Banana.SDecimal.add(accBalanceBaseBeforeAdj, adjAmtExRate);
        // Recuperiamo il valore attuale dalla tabella Items.
        let itemBalanceBase = getItemsAssAccCurrBal(banDoc, acc, false);
        if (accCurrency && accCurrency != docInfo.baseCurrency) {
            Banana.console.debug("adj prices: " + adjAmtExRate);
            Banana.console.debug("bilancio item base: " + itemBalanceBase);
            Banana.console.debug("bilancio calcolato base: " + calculatedBalanceBase);
            // Controlliamo il valore
            Test.assertIsEqual(calculatedBalanceBase, itemBalanceBase);
        } else {
            Test.assertIsEqual(calculatedBalanceBase, itemBalanceBase);
        }
    });
}

checkAssetAccountBalances_PriceAdjustment(accBalanceCurrBeforeAdj, accBalanceBaseBeforeAdj, docChangeObj, accountRef){
    //1) Controlliamo che il saldo in moneta del titolo combacia.
    const adjAmtPrice = getAdjAmounts(docChangeObj, acc, "AmountCurrency");
    // Calcoliamo il bilancio attuale.
    let calculatedBalanceCurr = Banana.SDecimal.add(accBalanceCurrBeforeAdj, adjAmtPrice);
    // Recuperiamo il valore attuale dalla tabella Items.
    let itemBalanceCurr = getItemsAssAccCurrBal(banDoc, acc, true);
    Banana.console.debug("adj prices: " + adjAmtPrice);
    Banana.console.debug("bilancio item curr: " + itemBalanceCurr);
    Banana.console.debug("bilancio calcolato curr: " + calculatedBalanceCurr);
    // Controlliamo i valori in moneta del titolo
    Test.assertIsEqual(itemBalanceCurr, calculatedBalanceCurr);
}

/**Ritorna la somma degli assestamenti del prezzo o del tasso di cambio registrati per un certo 
 * asset account. I Prezzi vengono sempre espressi in moneta del conto mentre l'assestamento
 * del tasso di cambio sempre in moneta base. */
function getAdjAmounts(docChangeObj, assetAccount, columnRef) {
    if (!docChangeObj || !assetAccount) return 0;

    const dataEntries = Array.isArray(docChangeObj.data) ? docChangeObj.data : [];
    let sum = "0";

    for (const entry of dataEntries) {
        const dataUnits = entry?.document?.dataUnits;
        if (!Array.isArray(dataUnits)) continue;

        const transactionsUnit = dataUnits.find(u => u?.nameXml === "Transactions");
        const rowLists = transactionsUnit?.data?.rowLists;
        if (!Array.isArray(rowLists)) continue;

        for (const rl of rowLists) {
            const rows = rl?.rows;
            if (!Array.isArray(rows)) continue;

            for (const row of rows) {
                const fields = row?.fields;
                if (!fields) continue;

                const isMatch =
                    fields.AccountDebit === assetAccount ||
                    fields.AccountCredit === assetAccount;

                if (!isMatch) continue;

                if (columnRef == "AmountCurrency") {
                    sum = Banana.SDecimal.add(fields.AmountCurrency, sum, { 'decimals': 2 });
                } else if (columnRef == "Amount") {
                    Banana.console.debug(sum);
                    sum = Banana.SDecimal.add(fields.Amount, sum, { 'decimals': 2 });
                }
            }
        }
    }

    return sum;
}