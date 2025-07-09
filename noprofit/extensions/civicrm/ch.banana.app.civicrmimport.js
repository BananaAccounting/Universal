// @id = ch.banana.app.civicrmimport
// @title = CiviCRM Import
// @api = 1.0
// @pubdate = 2025-07-08
// @publisher = Banana.ch SA
// @description = Import transactions from CiviCRM CSV file
// @description.en = Import transactions from CiviCRM CSV file
// @description.it = Importa transazioni da file CSV CiviCRM
// @description.fr = Importer des transactions à partir d'un fichier CSV CiviCRM
// @description.de = CiviCRM CSV-Datei-Import
// @task = import.transactions
// @doctype = 100.*; 110.*; 130.*
// @docproperties = 
// @outputformat = transactions.simple
// @inputdatasource = openfiledialog
// @timeout = -1
// @inputfilefilter = Text files (*.csv);;All files (*.*)
// @includejs = ch.banana.app.functions.js


function exec(inData) {

  //Check if we are on an opened document
  if (!Banana.document) { return; }

  //Check if the table exist: if not, the script's execution will stop
  if (!Banana.document.table('Transactions')) {
    return;
  }

  let importcsv = new ImportCSV(Banana.document, false);

  return importcsv.result(inData);
}

/**
 * Questa classe gestisce la logica ed i metodi per la correzione degli esercizi.
 * @param {*} banDocument 
 */

var ImportCSV = class ImportCSV {
  constructor(banDocument, isTest) {
    this.banDoc = banDocument;
    this.isTest = isTest;
  }

  // Main
  result(inData) {

     if (!verifyBananaAdvancedVersion() && !this.isTest) {
    return "@Cancel";
   }

    //1. Function call to define the conversion parameters
    var convertionParam = this.defineConversionParam();

    //2. we can eventually process the input text
    inData = this.preProcessInData(inData);

    //3. intermediaryData is an array of objects where the property is the banana column name
    var intermediaryData = this.convertToIntermediaryData(inData, convertionParam);

    //4. translate categories and Description 
    // can define as much postProcessIntermediaryData function as needed
    this.postProcessIntermediaryData(intermediaryData);

    //5. sort data
    intermediaryData = this.sortData(intermediaryData, convertionParam);

    //6. convert to banana format
    //column that start with "_" are not converted
    var text = this.convertToBananaFormat(intermediaryData);

    if (this.isTest) {
        // In test mode we return the intermediary data as JSON
        return text;
    }

    return text;

    }

//This function defines the parameters specific for the CSV Transactions file to be imported
getConversionParamUser(conversionParam) {
    conversionParam.column_separator = ",";
    conversionParam.text_delimiter = "\"";
    conversionParam.amounts_decimal_separator = ".";
    conversionParam.header_line_start = 0;
    conversionParam.data_line_start = 1;
    conversionParam.column_date_name = "Transaction Date";
    conversionParam.date_format = "yyyy-mm-dd";
    conversionParam.column_description_name = "Item Description";
    conversionParam.column_income_name = "Amount";
    conversionParam.column_expenses_name = "Amount";
    conversionParam.column_credit_account_name = "Credit Account";
    conversionParam.column_external_reference_name = "Transaction ID (Unsplit)";
    // This column is used to identify the type of transaction, e.g. EXP for expenses
    conversionParam.column_debit_account_type_name = "Debit Account Type";

    return conversionParam;
}

/**
 * DO NOT CHANGE THE FOLLOWING CODE
 */

//The purpose of this function is to let the users define the columns row to be converded
rowConverterUser(conversionParam, inputRow, convertedRow) {

    /**
     * MODIFY THE FIELDS NAME AND THE CONVERTION HERE 
     * The right part is a statements that is then executed for each inputRow
     * Field that start with the underscore "_" will not be exported 
     * Create this fields so that you can use it in the postprocessing function 
     * For a date type, use the Banana.Converter.toInternalDateFormat to convert to the appropriate date format
     * For an amount type, use the Banana.Converter.toInternalNumberFormat to convert to the appropriate number format
     */

    // convertedRow["ContraAccount"] = inputRow[conversionParam.column_credit_account_name];
    //convertedRow["_Description2"] = inputRow["Gruppe nach"];
    //convertedRow["VatCode"] = inputRow["MWST Code"];
    // convertedRow["ContraAccount"] = inputRow["Kategorie"];
    //convertedRow["Account"] = inputRow["Art"];
}

//The purpose of this function is to define the parameters for the conversion of the CSV file
defineConversionParam() {
    var convertionParam = {};
    convertionParam.format = "csv";
    convertionParam.column_separator = ';';
    convertionParam.text_delimiter = '"';
    convertionParam.amounts_decimal_separator = ',';
    convertionParam.header_line_start = 0;
    convertionParam.data_line_start = 1;
    convertionParam.column_date_name = '';
    convertionParam.date_format = '';
    convertionParam.column_description_name = '';
    convertionParam.column_income_name = '';
    convertionParam.column_expenses_name = '';
    convertionParam.column_credit_account_name = '';
    convertionParam.column_external_reference_name = '';

    /** IN CASE THERE IS NO HEADER 
     *   include the end of line */
    //convertionParam.header = "Date,Income,_None,Description,_Description2\n";

    /** SPECIFY THE COLUMN TO USE FOR SORTING
    If sortColums is empty the data are not sorted */
    convertionParam.sortColums = ["Date", "ExternalReference"];
    convertionParam.sortDescending = false;

    this.getConversionParamUser(convertionParam);

    return convertionParam;
}

rowConverter(convertionParam, inputRow) {

    var convertedRow = {};
    // Tronca la data al primo spazio e converte in formato data interno
    if (convertionParam.column_date_name) {
        var date = inputRow[convertionParam.column_date_name];
        if (date) {
            // If the date is in a format like "2023-01-01 12:00:00", we take only the date part
            if (date.indexOf(' ') !== -1) {
                date = date.split(' ')[0];
            }
        }
        // Convert the date to internal format
        if (date && date.length > 0) {
            // If the date is in a format like "01/01/2023", we convert it to "yyyy-mm-dd"
            if (date.indexOf('/') !== -1) {
                var dateParts = date.split('/');
                if (dateParts.length === 3) {
                    date = dateParts[2] + '-' + dateParts[1] + '-' + dateParts[0];
                }
            }
        }
        convertedRow["Date"] = Banana.Converter.toInternalDateFormat(date, convertionParam.date_format);
    } else {
        convertedRow["Date"] = '';
    }
    // Convert the description
    convertedRow["Description"] = inputRow[convertionParam.column_description_name];

    // if the column debit account type is EXP, we set the Expenses column
    if (convertionParam.column_debit_account_type_name && inputRow[convertionParam.column_debit_account_type_name] === "EXP") {
        convertedRow["Expenses"] = Banana.Converter.toInternalNumberFormat(inputRow[convertionParam.column_expenses_name], convertionParam.amounts_decimal_separator).replace(/-/g, '');
        convertedRow["Income"] = '';
    }
    // else we proceed with the normal conversion
    else if (convertionParam.column_income_name && convertionParam.column_expenses_name && convertionParam.column_income_name !== convertionParam.column_expenses_name) {
        convertedRow["Income"] = Banana.Converter.toInternalNumberFormat(inputRow[convertionParam.column_income_name], convertionParam.amounts_decimal_separator).replace(/-/g, '');
        convertedRow["Expenses"] = Banana.Converter.toInternalNumberFormat(inputRow[convertionParam.column_expenses_name], convertionParam.amounts_decimal_separator).replace(/-/g, '');
    }
    else {
        convertedRow["Income"] = Banana.Converter.toInternalNumberFormat(inputRow[convertionParam.column_income_name], convertionParam.amounts_decimal_separator);
        convertedRow["Expenses"] = '';
    }

    convertedRow["ExternalReference"] = inputRow[convertionParam.column_external_reference_name];

    // for now we don't convert the accounts imported
    // convertedRow["ContraAccount"] = inputRow[convertionParam.column_credit_account_name];

    this.rowConverterUser(convertionParam, inputRow, convertedRow);

    return convertedRow;
}

preProcessInData(inData) {
    return inData;
}

//The purpose of this function is to let the user specify how to convert the categories
postProcessIntermediaryData(intermediaryData) {

    var accounts = {};
    var categories = {};

    for (var i = 0; i < intermediaryData.length; i++) {
        var convertedData = intermediaryData[i];

        // if (convertedData["ContraAccount"]) {
        //   var cleanContraAccount = convertedData["ContraAccount"].replace(/\(.*/, '').trim();
        //  if (categories.hasOwnProperty(cleanContraAccount))
        //       convertedData["ContraAccount"] = categories[cleanContraAccount];
        // }


        if (convertedData["Account"]) {
            if (accounts.indexOf(convertedData["Account"]) > -1)
                convertedData["Account"] = accounts[convertedData["Account"]];
        }

        if (convertedData["_Description2"]) {
            convertedData["Description"] = convertedData["_Description2"] + ", " + convertedData["Description"];
        }
    }
}

convertToIntermediaryData(inData, convertionParam) {
    if (convertionParam.format === "html") {
        return this.convertHtmlToIntermediaryData(inData, convertionParam);
    } else {
        return this.convertCsvToIntermediaryData(inData, convertionParam);
    }
}

convertCsvToIntermediaryData(inData, convertionParam) {

    var form = [];
    var intermediaryData = [];

    if (convertionParam.header) {
        inData = convertionParam.header + inData;
    }

    var csvFile = Banana.Converter.csvToArray(inData, convertionParam.column_separator, convertionParam.text_delimiter);

    var columns = this.getHeaderData(csvFile, convertionParam.header_line_start);
    var rows = this.getRowData(csvFile, convertionParam.data_line_start);

    this.loadForm(form, columns, rows);

    for (var i = 0; i < form.length; i++) {
        var convertedRow = this.rowConverter(convertionParam, form[i]);
        intermediaryData.push(convertedRow);
    }

    return intermediaryData;
}

convertHtmlToIntermediaryData(inData, convertionParam) {

    var form = [];
    var intermediaryData = [];

    var htmlFile = [];
    var htmlRows = inData.match(/<tr[^>]*>.*?<\/tr>/gi);
    for (var rowNr = 0; rowNr < htmlRows.length; rowNr++) {
        var htmlRow = [];
        var htmlFields = htmlRows[rowNr].match(/<t(h|d)[^>]*>.*?<\/t(h|d)>/gi);
        for (var fieldNr = 0; fieldNr < htmlFields.length; fieldNr++) {
            var htmlFieldRe = />(.*)</g.exec(htmlFields[fieldNr]);
            htmlRow.push(htmlFieldRe.length > 1 ? htmlFieldRe[1] : "");
        }
        htmlFile.push(htmlRow);
    }

    var columns = this.getHeaderData(htmlFile, convertionParam.header_line_start);
    var rows = this.getRowData(htmlFile, convertionParam.data_line_start);

    for (var i = 0; i < columns.length; i++) {
        var convertedHeader = columns[i];
        convertedHeader = convertedHeader.toLowerCase();
        convertedHeader = convertedHeader.replace(" ", "_");
        var indexOfHeader = columns.indexOf(convertedHeader);
        if (indexOfHeader >= 0 && indexOfHeader < i) {
            var newIndex = 2;
            while (columns.indexOf(convertedHeader + newIndex.toString()) !== -1 && newIndex < 99)
                newIndex++;
            convertedHeader = convertedHeader + newIndex.toString()
        }
        columns[i] = convertedHeader;
    }

    this.loadForm(form, columns, rows);

    for (var i = 0; i < form.length; i++) {
        var convertedRow = this.rowConverter(convertionParam, form[i]);
        intermediaryData.push(convertedRow);
    }

    return intermediaryData;
}

sortData(intermediaryData, convertionParam) {
    if (convertionParam.sortColums && convertionParam.sortColums.length) {
        intermediaryData.sort(
            function (row1, row2) {
                for (var i = 0; i < convertionParam.sortColums.length; i++) {
                    var columnName = convertionParam.sortColums[i];
                    if (row1[columnName] > row2[columnName])
                        return 1;
                    else if (row1[columnName] < row2[columnName])
                        return -1;
                }
                return 0;
            });

        if (convertionParam.sortDescending)
            intermediaryData.reverse();
    }

    return intermediaryData;
}

convertToBananaFormat(intermediaryData) {

    var columnTitles = [];

    for (var name in intermediaryData[0]) {
        if (name.substring(0, 1) !== "_") {
            columnTitles.push(name);
        }
    }

    var convertedCsv = Banana.Converter.objectArrayToCsv(columnTitles, intermediaryData, "\t");

    return convertedCsv;
}

loadForm(form, columns, rows) {
    for (var j = 0; j < rows.length; j++) {
        var obj = {};
        for (var i = 0; i < columns.length; i++) {
            obj[columns[i]] = rows[j][i];
        }
        form.push(obj);
    }
}

getHeaderData(csvFile, startLineNumber) {
    if (!startLineNumber) {
        startLineNumber = 0;
    }
    var headerData = csvFile[startLineNumber];
    for (var i = 0; i < headerData.length; i++) {

        headerData[i] = headerData[i].trim();

        if (!headerData[i]) {
            headerData[i] = i;
        }

        var headerPos = headerData.indexOf(headerData[i]);
        if (headerPos >= 0 && headerPos < i) {
            var postfixIndex = 2;
            while (headerData.indexOf(headerData[i] + postfixIndex.toString()) !== -1 && postfixIndex <= 99)
                postfixIndex++;
            headerData[i] = headerData[i] + postfixIndex.toString()
        }

    }
    return headerData;
}

getRowData(csvFile, startLineNumber) {
    if (!startLineNumber) {
        startLineNumber = 1;
    }
    var rowData = [];
    for (var i = startLineNumber; i < csvFile.length; i++) {
        rowData.push(csvFile[i]);
    }
    return rowData;
}
}
