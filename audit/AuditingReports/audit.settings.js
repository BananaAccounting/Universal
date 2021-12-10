// Copyright [2021] [Banana.ch SA - Lugano Switzerland]
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
// @id = ch.banana.audit.settings
// @api = 1.0
// @pubdate = 2021-12-10
// @publisher = Banana.ch SA
// @description = Settings
// @task = app.command
// @doctype = *;*
// @docproperties =
// @outputformat = none
// @inputdatasource = none
// @timeout = -1

function exec() {
    if (!settingsDialog())
        return "@Cancel";
}

function initDialogParam() {

}

function convertParam() {
    var convertedParam = {};
    convertedParam.version = '1.0';
    convertedParam.data = [];

    //create the Journal section
    var currentParam = {};
    currentParam.name = 'journal';
    currentParam.title = "Journal";
    currentParam.editable = false;

    //create the VAT Journal section
    var currentParam = {};
    currentParam.name = 'vatJournal';
    currentParam.title = "VAT Journal";
    currentParam.editable = false;

    //create the Customer and Suppliers Journal section
    var currentParam = {};
    currentParam.name = 'cutAndSup';
    currentParam.title = "Customer and Suppliers";
    currentParam.editable = false;

    //(..other sections...)

    //JOURNAL COLUMNS
    var currentParam = {};
    currentParam.name = 'pageheader';
    currentParam.group = 'preferences';
    currentParam.title = texts.pageheader;
    currentParam.type = 'bool';
    currentParam.value = userParam.pageheader ? userParam.pageheader : userParam.pageheader;
    currentParam.defaultvalue = defaultParam.pageheader;
    currentParam.tooltip = texts.logo_tooltip;
    currentParam.parentObject = 'Print Details';
    currentParam.readValue = function() {
        userParam.pageheader = this.value;
    }
    convertedParam.data.push(currentParam);
}

function settingsDialog() {
    var savedParam = Banana.document.getScriptSettings("");
    if (savedParam.length > 0) {
        var parsed_data = JSON.parse(savedParam);
        if (parsed_data) {
            setParam(parsed_data);
        }
    }
    //settings dialog
    var dialogTitle = 'Settings';
    var pageAnchor = 'financialStatementAnalysis';
    var convertedParam = financialStatementAnalysis.convertParam();
    if (!Banana.Ui.openPropertyEditor(dialogTitle, convertedParam, pageAnchor))
        return false;
    for (var i = 0; i < convertedParam.data.length; i++) {
        // Read values to dialogparam (through the readValue function)
        if (typeof(convertedParam.data[i].readValue) == "function")
            convertedParam.data[i].readValue();
    }

    //set the parameters (both dialogs)
    var paramToString = JSON.stringify(financialStatementAnalysis.dialogparam);
    Banana.document.setScriptSettings("financialStatementAnalysis", paramToString);
    return true;
}