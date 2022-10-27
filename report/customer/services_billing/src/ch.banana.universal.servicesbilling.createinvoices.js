// Copyright [2022] [Banana.ch SA - Lugano Switzerland]
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
//
// @id = ch.banana.universal.servicesbilling.createinvoices.js
// @api = 1.2.0
// @pubdate = 2022-10-24
// @publisher = Banana.ch SA
// @description = Create invoices
// @description.it = Crea fatture
// @description.fr = Créer factures
// @description.de = Rechnungen erstellen
// @doctype = 400.400
// @encoding = utf-8
// @task = app.command
// @timeout = -1
// @includejs = servicesbillingclass.js

/*
 *   SUMMARY
 *   Create invoices from services table
 */

function exec() {
    if (!Banana.document) {
        return null;
    }

    // include services until last day of previous months
    var today = new Date();
    var lastDayPreviousMonth = new Date(today.getFullYear(), today.getMonth(), 0, 12);
    let includeUntil = lastDayPreviousMonth.toISOString().substring(0,10);
    includeUntil = Banana.Ui.getText("Periodo di fatturazione", "Includi prestazioni fino al (vuoto = tutte):", includeUntil);
    if (typeof includeUntil === "undefined") {
        return null;
    }

    // Create invoices
    let servicesBilling = new ServicesBilling(Banana.document);
    let docChange = servicesBilling.createInvoices(null, includeUntil);

    // Return document change
    return docChange;
}
