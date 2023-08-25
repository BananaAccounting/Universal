// Copyright [2023] [Banana.ch SA - Lugano Switzerland]
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
// @pubdate = 2023-08-22
// @publisher = Banana.ch SA
// @timeout = -1


var DlgMapCsvFields = class DlgMapCsvFields {

    constructor() {
        this.dialogParam = this.initParam(); // Mi serve per accedere ai valori dal file "ch.banana.uni.import.csv.js".
    }

    settingsDialog() {
        /*Banana.document.setScriptSettings("csvFieldsParams", "");
        return;*/
        let savedParam = Banana.document.getScriptSettings("csvFieldsParams");
        if (savedParam.length > 0) {
            let parsedParam = JSON.parse(savedParam);
            if (parsedParam) {
                this.dialogParam = parsedParam;
            }
        }
        //Verify Params.
        this.verifyParam();

        //Settings dialog
        var dialogTitle = 'Settings';
        var pageAnchor = 'csvFieldsParams';
        var convertedParam = {};

        convertedParam = this.convertParam();

        let editorDlg = Banana.Ui.createPropertyEditor(dialogTitle, convertedParam, pageAnchor);

        //editorDlg.setParams(convertedParam);

        // AggiungO comando per salvare i preferiti nella tabella dei preferiti
        editorDlg.addCustomCommand("savePreferences", "Save Preferences");
        // Poi riproporre i preferiti in un comboBox.

        let rtnValue = editorDlg.exec();
        if (parseInt(rtnValue) === 1) {
            for (var i = 0; i < convertedParam.data.length; i++) {
                // Read values to dialogparam (through the readValue function)
                if (typeof (convertedParam.data[i].readValue) == "function")
                    convertedParam.data[i].readValue();
            }
            var paramToString = JSON.stringify(this.dialogParam);
            Banana.document.setScriptSettings("csvFieldsParams", paramToString);
            return true;
        }

        return false;
    }

    convertParam() {
        var paramList = {};
        var defaultParam = this.initParam();
        var userParam = this.dialogParam;
        paramList.version = '1.0';
        paramList.data = [];

        //Csv Parameters group
        var param = {};
        param.name = 'CsvParameters';
        param.title = "CSV Parameters";
        param.editable = false;

        paramList.data.push(param);

        // Csv Fields group
        var param = {};
        param.name = 'CsvFields';
        param.title = "CSV Fields";
        param.editable = false;

        paramList.data.push(param);

        // CSV PARAMETERS

        // Mapping Preferences Name.
        var param = {};
        param.name = 'MappingPrefrencesName';
        param.parentObject = 'CsvParameters';
        param.title = 'Mapping Preferences Name';
        param.type = 'string';
        param.value = userParam.preferencesName ? userParam.preferencesName : '';
        param.defaultvalue = defaultParam.preferencesName;
        param.readValue = function () {
            userParam.preferencesName = this.value;
        }
        paramList.data.push(param);

        // Fields Delimiter.
        var param = {};
        param.name = 'FieldsDelimiter';
        param.parentObject = 'CsvParameters';
        param.title = 'Fields Delimiter';
        param.type = 'string';
        param.value = userParam.fieldsDelimiter ? userParam.fieldsDelimiter : ',';
        param.defaultvalue = defaultParam.fieldsDelimiter;
        param.readValue = function () {
            userParam.fieldsDelimiter = this.value;
        }
        paramList.data.push(param);

        // Text Delimiter.
        var param = {};
        param.name = 'TextDelimiter';
        param.parentObject = 'CsvParameters';
        param.title = 'Text Delimiter';
        param.type = 'string';
        param.value = userParam.textDelimiter ? userParam.textDelimiter : '"';
        param.defaultvalue = defaultParam.textDelimiter;
        param.readValue = function () {
            userParam.textDelimiter = this.value;
        }
        paramList.data.push(param);

        // Date format
        var param = {};
        param.name = 'DateFormat';
        param.parentObject = 'CsvParameters';
        param.title = 'Date Format';
        param.type = 'string'; //example: dd.mm.yyyy
        param.value = userParam.dateFormat ? userParam.dateFormat : 'dd.mm.yyyy';
        param.defaultvalue = defaultParam.dateFormat;
        param.readValue = function () {
            userParam.dateFormat = this.value;
        }
        paramList.data.push(param);

        // Decimal separator
        var param = {};
        param.name = 'DecimalSeparator';
        param.parentObject = 'CsvParameters';
        param.title = 'Decimal Separator';
        param.type = 'string';
        param.value = userParam.decimalSeparator ? userParam.decimalSeparator : '.';
        param.defaultvalue = defaultParam.decimalSeparator;
        param.readValue = function () {
            userParam.decimalSeparator = this.value;
        }
        paramList.data.push(param);

        //CSV FIELDS

        /** We work with columns position */

        // Date Column
        var param = {};
        param.name = 'DateColumn';
        param.parentObject = 'CsvFields';
        param.title = 'Date Column';
        param.type = 'string'; // for example if the date is in the first colum, the user should put "1"
        param.value = userParam.dateColumn ? userParam.dateColumn : '';
        param.defaultvalue = defaultParam.dateColumn;
        param.readValue = function () {
            userParam.dateColumn = this.value;
        }
        paramList.data.push(param);

        // Description Column
        var param = {};
        param.name = 'DescriptionColumn';
        param.parentObject = 'CsvFields';
        param.title = 'Description Column';
        param.type = 'string'; // for example if the date is in the first colum, the user should put "1"
        param.value = userParam.descriptionColumn ? userParam.descriptionColumn : '';
        param.defaultvalue = defaultParam.descriptionColumn;
        param.readValue = function () {
            userParam.descriptionColumn = this.value;
        }
        paramList.data.push(param);

        /** Amount/s Column
         * If there are two columns with for example debit and credit amounts, 
         * the user should indicate both in this field separated by a semicolon: ";".
        */
        var param = {};
        param.name = 'AmountColumn';
        param.parentObject = 'CsvFields';
        param.title = 'Amount Column';
        param.type = 'string'; // One amount column: "1", more amounts columns: "1;2"
        param.value = userParam.amountColumn ? userParam.amountColumn : '';
        param.defaultvalue = defaultParam.amountColumn;
        param.readValue = function () {
            userParam.amountColumn = this.value;
        }
        paramList.data.push(param);

        return paramList;
    }

    initParam() {

        let params = {};

        params.preferencesName = '';
        params.fieldsDelimiter = ';';
        params.textDelimiter = '"';
        params.dateFormat = 'dd.mm.yyyy';
        params.decimalSeparator = '.';
        params.dateColumn = '';
        params.descriptionColumn = '';
        params.amountColumn = '';

        //Aggiungere anche gli altri.

        return params;

    }

    verifyParam() {
        let defaultParam = this.initParam();

        if (!this.dialogParam.preferencesName) {
            this.dialogParam.preferencesName = defaultParam.preferencesName;
        }
        if (!this.dialogParam.fieldsDelimiter) {
            this.dialogParam.fieldsDelimiter = defaultParam.fieldsDelimiter;
        }
        if (!this.dialogParam.textDelimiter) {
            this.dialogParam.textDelimiter = defaultParam.textDelimiter;
        }
        if (!this.dialogParam.dateFormat) {
            this.dialogParam.dateFormat = defaultParam.dateFormat;
        }
        if (!this.dialogParam.decimalSeparator) {
            this.dialogParam.decimalSeparator = defaultParam.decimalSeparator;
        }
        if (!this.dialogParam.dateColumn) {
            this.dialogParam.dateColumn = defaultParam.dateColumn;
        }
        if (!this.dialogParam.descriptionColumn) {
            this.dialogParam.descriptionColumn = defaultParam.descriptionColumn;
        }
        if (!this.dialogParam.amountColumn) {
            this.dialogParam.amountColumn = defaultParam.amountColumn;
        }
    }
}

function savePreferences() {
    Banana.console.debug("called savePreferences");
    //salvare i parametri.
    //come accedo alla tabella con i preferiti per salvarli ?
    return this.dialogParam;
}