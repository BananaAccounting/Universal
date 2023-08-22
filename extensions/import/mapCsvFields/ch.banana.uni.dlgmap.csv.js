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
        this.dialogParam = "";
    }

    settingsDialog() {
        let savedParam = Banana.document.getScriptSettings("csvFieldsParams1");
        if (savedParam.length > 0) {
            let parsedParam = JSON.parse(savedParam);
            if (parsedParam) {
                this.dialogParam = parsedParam;
            }
        }

        //Settings dialog
        var dialogTitle = 'Settings';
        var pageAnchor = 'csvFieldsParams1';

        var convertedParam = this.convertParam();

        let dlgEditor = Banana.Ui.createPropertyEditor(dialogTitle, convertedParam, pageAnchor);

        let rtnValue = dlgEditor.exec();
        if (parseInt(rtnValue) === 1) {
            for (var i = 0; i < convertedParam.length; i++) {
                // Read values to dialogparam (through the readValue function)
                if (typeof (convertedParam.data[i].readValue) == "function")
                    convertedParam.data[i].readValue();
            }

            //Set the parameters
            var paramToString = JSON.stringify(this.dialogparam);
            Banana.document.setScriptSettings("csvFieldsParams1", paramToString);
            return true;
        }

        return false;
    }

    convertParam() {
        var paramList = {};
        let userParam = this.dialogParam;
        paramList.version = '1.0';
        paramList.data = [];

        //Csv Parameters group
        var param = {};
        param.name = 'CsvParameters';
        param.title = "CSV Parameters";
        param.editable = false;

        paramList.data.push(param);

        var param = {};
        param.name = 'Csvfields';
        param.title = "CSV Fields";
        param.editable = false;

        paramList.data.push(param);

        // CSV PARAMETERS

        // Mapping Preferences Name.
        var param = {};
        param.name = 'MappingPrefrencesName';
        param.group = "CsvParameters";
        param.title = 'Mapping Preferences Name';
        param.type = 'string';
        param.value = userParam.preferencesName;
        param.readValue = function () {
            param.preferencesName = this.value;
        }
        paramList.data.push(param);

        // Fields Delimiter.
        var param = {};
        param.name = 'FieldsDelimiter';
        param.group = "CsvParameters";
        param.title = 'Fields Delimiter';
        param.type = 'string';
        param.value = userParam.fieldsDelimiter;
        param.readValue = function () {
            param.fieldsDelimiter = this.value;
        }
        paramList.data.push(param);

        // Text Delimiter.
        var param = {};
        param.name = 'TextDelimiter';
        param.group = "CsvParameters";
        param.title = 'Text Delimiter';
        param.type = 'string';
        param.value = userParam.textDelimiter;
        param.readValue = function () {
            param.textDelimiter = this.value;
        }
        paramList.data.push(param);

        // Date format
        var param = {};
        param.name = 'DateFormat';
        param.group = "CsvParameters";
        param.title = 'Date Format';
        param.type = 'string'; //example: example dd.mm.yyyy
        param.value = userParam.dateFormat;
        param.readValue = function () {
            param.dateFormat = this.value;
        }
        paramList.data.push(param);

        // Decimal separator
        var param = {};
        param.name = 'AmountFormat';
        param.group = "CsvParameters";
        param.title = 'Amount Format';
        param.type = 'string'; //example: example dd.mm.yyyy
        param.value = userParam.dateFormat;
        param.readValue = function () {
            param.dateFormat = this.value;
        }
        paramList.data.push(param);

        //CSV FIELDS

        /** We work with columns position */

        // Date Column
        var param = {};
        param.name = 'DateColumn';
        param.group = "Csvfields";
        param.title = 'Date Column';
        param.type = 'string'; // for example if the date is in the first colum, the user should put "1"
        param.value = userParam.dateColumn;
        param.readValue = function () {
            param.dateColumn = this.value;
        }
        paramList.data.push(param);

        // Description Column
        var param = {};
        param.name = 'DescriptionColumn';
        param.group = "Csvfields";
        param.title = 'Description Column';
        param.type = 'string'; // for example if the date is in the first colum, the user should put "1"
        param.value = userParam.descriptionColumn;
        param.readValue = function () {
            param.descriptionColumn = this.value;
        }
        paramList.data.push(param);

        /** Amount/s Column
         * If there are two columns with for example debit and credit amounts, 
         * the user should indicate both in this field separated by a semicolon: ";".
        */
        var param = {};
        param.name = 'AmountColumn';
        param.group = "Csvfields";
        param.title = 'Amount Column';
        param.type = 'string'; // One amount column: "1", more amounts columns: "1;2"
        param.value = userParam.amountColumn;
        param.readValue = function () {
            param.amountColumn = this.value;
        }
        paramList.data.push(param);

        return paramList;
    }
}