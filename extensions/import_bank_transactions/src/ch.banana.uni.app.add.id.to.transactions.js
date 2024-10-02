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
//
// @id = ch.banana.uni.app.add.id.to.transactions
// @api = 1.0
// @pubdate = 2024-04-28
// @publisher = Banana.ch SA
// @description = Add id to transactions
// @task = app.command
// @doctype = *.*
// @outputformat = none
// @inputdatasource = none
// @timeout = -1
// @includejs = base/documentchange.js

/**
 * Questa estensione si occupa di attribuire un id creato con l'API Banana.Converter.textToHash() a tutte quelle
 * transazioni che non ne hanno uno.
 * L'idea di questa estensione è nata dal bisogno di avere un id per ogni movimento per poter iniziare ad usare 
 * la sincronizzazione dei dati bancari, rimanendo comunque sicuri di non importare transazioni che già esistono.
 * L'estensione ritorna un DocumentChange con le modifiche da apportare alla contabilità.
 */

function exec() {

    /** 1. Salvo un array di oggetti, ogni oggetto contiene i dati relativi ad una certa riga per la quale non è stato trovato 
     * nessun id.
     * 2. Sulla base dei dati delle riga, creo un hash univoco e lo assegno.
     * 3. Creo un document change con le modifiche e lo ritorno.
     */
    let docChange = new DocumentChange();
    let transactionsData = getTrWithoutIdData();
    setIdToTransactions(transactionsData);
    setChangesObj(docChange, transactionsData);
    Banana.Ui.showText(JSON.stringify(docChange.getDocChange()));
    return docChange.getDocChange();
}

function getTrWithoutIdData() {
    let trData = [];
    let FileType = Banana.document.info("Base", "FileType");
    let trTable = Banana.document.table("Transactions");
    if (!trTable) {
        return trData;
    }

    for (var i = 0; i < trTable.rowCount; i++) {
        var tRow = trTable.row(i);
        var rowData = {};
        let trId = tRow.value("ExternalReference");
        if (trId.length == "") { // id empty
            rowData["RowNumber"] = tRow.rowNr;
            rowData["Date"] = tRow.value("Date");
            rowData["Description"] = tRow.value("Description");
            /** Uso campi differenti a dipendenza del tipo di contabilità, non importa, successivamente
             *  ogni campo viene utilizzato per creare l'hash.
             */
            if (FileType == "100") { // Double entry accounting.
                rowData["Debit"] = tRow.value("AccountDebit");
                rowData["Credit"] = tRow.value("AccountCredit");
                rowData["Amount"] = tRow.value("Amount");
            } else if (FileType == "110") { // Income & Expenses.
                rowData["Income"] = tRow.value("Expenses");
                rowData["Expenses"] = tRow.value("Income");
                rowData["Account"] = tRow.value("Account");
            }
            rowData["ExternalReference"] = "";

            if (rowData)
                trData.push(rowData);
        }
    }

    return trData;
}

function setIdToTransactions(transactionsData) {
    if (transactionsData.length < 0)
        return transactionsData;

    for (let trObj of transactionsData) {
        if (trObj["ExternalReference"] == "") {
            let textToHash = trObj["Date"] + trObj["Description"] + trObj["Debit"] + trObj["Credit"] +
                trObj["Amount"] + trObj["Income"] + trObj["Expenses"] + trObj["Account"];
            let newExtRef = Banana.Converter.textToHash(textToHash, "Sha256");
            if (newExtRef !== "")
                trObj["ExternalReference"] = newExtRef;
        }
    }
}

function setChangesObj(docChange, transactionsData) {
    let tableName = "Transactions";
    for (let trObj of transactionsData) {
        let rowNr = trObj["RowNumber"];
        let fields = { "ExternalReference": trObj["ExternalReference"] }
        docChange.addOperationRowModify(tableName, rowNr, fields);
    }
    return docChange;
}