// Copyright [2026] [Banana.ch SA - Lugano Switzerland]
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
// @id = ch.banana.uni.import.invoices.transactions
// @api = 1.0
// @pubdate = 2026-07-24
// @publisher = Banana.ch SA
// @description = [DEV] Import invoices from CSV
// @description.en = [DEV] Import invoices from CSV
// @description.it = [DEV] Importa fatture da CSV
// @description.fr = [DEV] Importer des factures depuis un fichier CSV
// @description.de = [DEV] Rechnungen aus CSV importieren
// @task = import.transactions
// @doctype = 100.*;110.*
// @docproperties =
// @outputformat = transactions.simple
// @inputdatasource = openfiledialog
// @inputfilefilter = CSV files (*.csv);;All files (*.*)
// @inputencoding = utf-8
// @timeout = -1

/**
 * Import extension entry point.
 * Receives the raw content of the file chosen by the user (via the
 * "Import to accounting > Transactions" dialog) and converts it from the
 * CSV produced by the companion export extension (comma-separated,
 * quoted fields, columns: Date, DocInvoice, Description, Amount, VatCode,
 * VatAmountType, IsDetail) into the tab-separated "transactions.simple"
 * format Banana expects. The single signed Amount column from the CSV is
 * split by sign into Income (Amount >= 0) and Expenses (Amount < 0,
 * written as a positive value) — matching the convention used by
 * Banana's own official import extensions (e.g. the UBS one). No account
 * columns (Account/ContraAccount) are produced: account assignment is
 * left entirely to Banana / to a manual step after import.
 * IsDetail is written out as-is: unlike a plain "tablewithheaders" import
 * (where IsDetail is inert, just along for the ride since that format
 * doesn't recognize the column), here Banana actually reads it to know
 * which row is the invoice's summary/total ("S") and which rows are its
 * detail lines ("D"), grouping them into one composed transaction.
 * Column names are read from the header row, so the exact column order
 * in the source file does not matter.
 */
function exec(inText) {

   if (!inText || !inText.length)
      return "";

   var separator = findSeparator(inText);
   var rows = Banana.Converter.csvToArray(inText, separator, '"');
   if (!rows || rows.length < 2)
      return "";

   var header = rows[0];
   var idx = mapHeaderIndex(header);

   if (idx.Date < 0 || idx.Description < 0 || idx.Amount < 0) {
      // Required columns missing: nothing usable to import.
      if (typeof Banana !== "undefined" && Banana.application && Banana.application.addMessage) {
         Banana.application.addMessage("Import invoices: required column(s) missing in the source file " +
            "(Date, Description and Amount are mandatory).");
      }
      return "";
   }

   var outColumns = ["Date", "DocInvoice", "Description", "Income", "Expenses", "VatCode", "VatAmountType", "IsDetail"];
   var outLines = [];
   outLines.push(outColumns.join("\t"));

   for (var i = 1; i < rows.length; i++) {
      var r = rows[i];
      if (!r || r.length === 0)
         continue;

      var amount = toInternalAmount(tabSafe(getValue(r, idx.Amount)));
      var amountNum = parseFloat(amount) || 0;

      var rowValues = {
         "Date": toInternalDate(tabSafe(getValue(r, idx.Date))),
         "DocInvoice": tabSafe(getValue(r, idx.DocInvoice)),
         "Description": tabSafe(getValue(r, idx.Description)),
         "Income": amount && amountNum >= 0 ? amount : "",
         "Expenses": amount && amountNum < 0 ? negateAmountString(amount) : "",
         "VatCode": tabSafe(getValue(r, idx.VatCode)),
         "VatAmountType": tabSafe(getValue(r, idx.VatAmountType)),
         "IsDetail": tabSafe(getValue(r, idx.IsDetail))
      };

      // Skip fully empty lines
      if (!rowValues["Date"] && !rowValues["Description"] && !rowValues["Income"] && !rowValues["Expenses"])
         continue;

      var outValues = [];
      for (var c = 0; c < outColumns.length; c++) {
         outValues.push(rowValues[outColumns[c]]);
      }
      outLines.push(outValues.join("\t"));
   }

   return outLines.join("\n");
}

/**
 * Returns the cell value at column index in the given row.
 * Returns an empty string if the index is negative, the row is null
 * or the index is out of range.
 */
function getValue(row, index) {
   if (index < 0 || !row || index >= row.length)
      return "";
   return row[index] ? row[index] : "";
}

/**
 * Negates an already-internal-format (dot decimal) amount string, used to
 * turn a negative Amount into a positive Expenses value.
 */
function negateAmountString(amountStr) {
   var n = parseFloat(("" + amountStr).replace(",", ".")) || 0;
   return (-n).toString();
}

/**
 * Removes tabs/newlines from a value, since the output is tab-separated.
 */
function tabSafe(value) {
   if (!value)
      return "";
   return ("" + value).replace(/[\t\r\n]+/g, " ").trim();
}

/**
 * Converts a date value to Banana's internal date format (yyyy-mm-dd).
 * If the value already looks like an ISO date, it is returned unchanged
 * (avoids passing an already-correct value through a guessed format,
 * which could otherwise corrupt it). Otherwise the most likely source
 * format is detected (dd.mm.yyyy or dd/mm/yyyy) and Banana's own
 * converter is used, exactly like the official PayPal import extension
 * does with Banana.Converter.toInternalDateFormat.
 */
function toInternalDate(value) {
   if (!value)
      return "";
   if (/^\d{4}-\d{2}-\d{2}$/.test(value))
      return value; // already internal format
   if (typeof Banana === "undefined" || !Banana.Converter || !Banana.Converter.toInternalDateFormat)
      return value; // defensive: keep working outside Banana (e.g. unit tests)

   var dateFormat = "";
   if (/^\d{2}\.\d{2}\.\d{4}$/.test(value))
      dateFormat = "dd.mm.yyyy";
   else if (/^\d{2}\/\d{2}\/\d{4}$/.test(value))
      dateFormat = "dd/mm/yyyy";

   var converted = Banana.Converter.toInternalDateFormat(value, dateFormat);
   return converted ? converted : value;
}

/**
 * Converts an amount value to Banana's internal number format (dot as
 * decimal separator). If the value already looks like a plain
 * dot-decimal number, it is returned unchanged. Otherwise the decimal
 * separator is detected (comma vs. dot) and Banana's own converter is
 * used, exactly like the official PayPal import extension does with
 * Banana.Converter.toInternalNumberFormat.
 */
function toInternalAmount(value) {
   if (!value)
      return "";
   if (/^-?\d+(\.\d+)?$/.test(value))
      return value; // already internal format
   if (typeof Banana === "undefined" || !Banana.Converter || !Banana.Converter.toInternalNumberFormat)
      return value; // defensive: keep working outside Banana (e.g. unit tests)

   var decimalSeparator = ".";
   var lastComma = value.lastIndexOf(",");
   var lastDot = value.lastIndexOf(".");
   if (lastComma > lastDot)
      decimalSeparator = ",";

   var converted = Banana.Converter.toInternalNumberFormat(value, decimalSeparator);
   return converted ? converted : value;
}

/**
 * Normalizes a CSV header string by removing the leading BOM,
 * whitespace and converting to lowercase, for robust comparison.
 */
function normalizeHeader(s) {
   if (!s)
      return "";
   var t = "" + s;
   t = t.replace(/^\uFEFF/, ""); // BOM
   t = t.replace(/\s+/g, "");
   t = t.toLowerCase();
   return t;
}

/**
 * Maps CSV header names to their corresponding column indices.
 * Returns an object with field names as keys and indices as values.
 * Fields not found have value -1.
 */
function mapHeaderIndex(headerRow) {
   var idx = {
      Date: -1,
      DocInvoice: -1,
      Description: -1,
      Amount: -1,
      VatCode: -1,
      VatAmountType: -1,
      IsDetail: -1
   };

   for (var i = 0; i < headerRow.length; i++) {
      var h = normalizeHeader(headerRow[i]);

      if (h === "date")
         idx.Date = i;
      else if (h === "docinvoice")
         idx.DocInvoice = i;
      else if (h === "description")
         idx.Description = i;
      else if (h === "amount")
         idx.Amount = i;
      else if (h === "vatcode")
         idx.VatCode = i;
      else if (h === "vatamounttype")
         idx.VatAmountType = i;
      else if (h === "isdetail")
         idx.IsDetail = i;
   }

   return idx;
}

/**
 * Automatically detects the CSV separator (tab, semicolon or comma)
 * by analyzing the first line of the text.
 */
function findSeparator(text) {
   var lines = text.split(/\r\n|\n|\r/);
   var firstLine = lines.length > 0 ? lines[0] : "";

   var commaCount = 0;
   var semicolonCount = 0;
   var tabCount = 0;

   for (var i = 0; i < firstLine.length; i++) {
      var c = firstLine.charAt(i);
      if (c === ",")
         commaCount++;
      else if (c === ";")
         semicolonCount++;
      else if (c === "\t")
         tabCount++;
   }

   if (tabCount >= commaCount && tabCount >= semicolonCount)
      return "\t";
   if (semicolonCount > commaCount)
      return ";";
   return ",";
}
