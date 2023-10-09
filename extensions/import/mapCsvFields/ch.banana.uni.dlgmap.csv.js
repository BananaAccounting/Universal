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
    /**Banana.document.setScriptSettings("csvFieldsParams", "");
     * Banana.document.setScriptSettings("csvFieldsParams_Preferences", "");
     * Banana.document.setScriptSettings("csvFieldsParams_PreferencesNames", "");
    return;*/
    let savedDlgParam = Banana.document.getScriptSettings("csvFieldsParams"); //Parametri per struttura dialogo.
    if (savedDlgParam.length > 0) {
      let parsedParam = JSON.parse(savedDlgParam);
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
    editorDlg.setParams(convertedParam);
    // Aggiungo comando per salvare un nuovo preferito o modificarlo sovrascrivendo i valori esistenti.
    editorDlg.addCustomCommand("savePreferences", "Save Preferences");
    // Aggiungo comando per eliminare un preferito dalla lista dei preferiti salvati.
    editorDlg.addCustomCommand("deletePreferences", "Delete Preferences");
    //Aggiungo comando per importare nel dialogo i dati della preferenza correntemente selezionata.
    editorDlg.addCustomCommand("importPreference", "Import Preference");
    // Poi riproporre i preferiti in un comboBox.

    let rtnValue = editorDlg.exec();
    if (parseInt(rtnValue) === 1) {
      let modifiedParams = editorDlg.getParams();
      this.saveParams(modifiedParams);
      // Aggiorno i parametri con quelli nuovi 
      this.updatePreferencesList(); //aggiornare la lista ad ogni salvataggio invece che qui ? è possibile ?
      var paramToString = JSON.stringify(this.dialogParam);
      Banana.document.setScriptSettings("csvFieldsParams", paramToString);
      return true;
    }

    return false;
  }

  saveParams(modifiedParams) {
    if (modifiedParams && modifiedParams.data &&
      modifiedParams.data.length > 0) {
      let arrayData = modifiedParams.data;
      let object = {};

      object = arrayData.find(obj => obj.name === "MappingPrefrencesName");
      if (object && object.value) {
        this.dialogParam.newPreference = object.value;
      }
      object = arrayData.find(obj => obj.name === "PreferencesList");
      if (object && object.value) {
        this.dialogParam.preferencesList = object.value;
      }
      object = arrayData.find(obj => obj.name === "FieldsDelimiter");
      if (object && object.value) {
        this.dialogParam.fieldsDelimiter = object.value;
      }
      object = arrayData.find(obj => obj.name === "TextDelimiter");
      if (object && object.value) {
        this.dialogParam.textDelimiter = object.value;
      }
      object = arrayData.find(obj => obj.name === "DateFormat");
      if (object && object.value) {
        this.dialogParam.dateFormat = object.value;
      }
      object = arrayData.find(obj => obj.name === "DecimalSeparator");
      if (object && object.value) {
        this.dialogParam.decimalSeparator = object.value;
      }
      object = arrayData.find(obj => obj.name === "DateColumn");
      if (object && object.value) {
        this.dialogParam.dateColumn = object.value;
      }
      object = arrayData.find(obj => obj.name === "DescriptionColumn");
      if (object && object.value) {
        this.dialogParam.descriptionColumn = object.value;
      }
      object = arrayData.find(obj => obj.name === "AmountColumn");
      if (object && object.value) {
        this.dialogParam.amountColumn = object.value;
      }
    }
  }

  /**
   * Aggiorna la lista delle preferenze in csvFieldsParams con le ultime salvate o rimosse in csvFieldsParams_Preferences tramite i comandi.
   * passo tutti gli elementi presenti nei preferiti: "csvFieldsParams_Preferences" (che viene modificato tramite i comandi nel button) e passo tutti gli elementi, se nei preferiti 
   * "csvFieldsParams" manca un oggetto, allora lo aggiungo, viceversa se ce un oggetto di troppo, allora lo rimuovo.
   * Uso come riferimento csvFieldsParams_Preferences perche l'oggetto che viene modificato solo dai comandi in basso (aggiungere rimuovere preferenze) e in base a
   * quello che rimane poi quando chiudo il dialogo, aggiorno le preferenze generali con quello che risulta in csvFieldsParams_Preferences.
   */
  updatePreferencesList() {
    let csvFieldsParams_preferences = Banana.document.getScriptSettings("csvFieldsParams_Preferences");
    if (csvFieldsParams_preferences) {
      let parsedParam_preferences = JSON.parse(csvFieldsParams_preferences);
      let prefData = parsedParam_preferences.preferencesListData; // Array of objects.
      let paramData = this.dialogParam.preferencesList;
      if (!this.containsSameObjects(prefData, paramData)) {
        //Banana.console.debug("diversi"); //ok
        this.dialogParam.preferencesList = prefData; // sincronizzo i due array.
      }
    }
  }
  containsSameObjects(prefData, paramData) {
    //The lenght of the arrays initally is the same, thats why we do not check it.
    if (JSON.stringify(prefData) !== JSON.stringify(paramData)) { //Controllo da cambiare in futuro.
      return false;
    }
    return true;
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
    param.title = 'Map New Preference';
    param.type = 'string';
    param.value = userParam.newPreference ? userParam.newPreference : '';
    param.defaultvalue = defaultParam.newPreference;
    param.readValue = function () {
      userParam.newPreference = this.value;
    }
    paramList.data.push(param);

    // Preferences List (list of Banks).
    let prefList = []; // Prendo i valori salvati nelle preferenze
    prefList = initPreferencesNamesList();
    let csvFieldsParams_PreferencesNames = Banana.document.getScriptSettings("csvFieldsParams_PreferencesNames");
    if (csvFieldsParams_PreferencesNames.length > 0) {
      let parsedPreferencesName = JSON.parse(csvFieldsParams_PreferencesNames);
      if (parsedPreferencesName) {
        prefList = parsedPreferencesName;
      }
    }
    var param = {};
    param.name = 'PreferencesList';
    param.parentObject = 'CsvParameters';
    param.title = 'Preferences List';
    param.type = 'combobox';
    param.items = prefList;
    param.value = userParam.lastPreferenceSelected ? userParam.lastPreferenceSelected : '';
    param.defaultvalue = defaultParam.lastPreferenceSelected;
    param.readValue = function () {
      userParam.lastPreferenceSelected = this.value;
      userParam.preferencesList = prefList;
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

    params.newPreference = '';
    params.lastPreferenceSelected = '';
    params.preferencesList = [];
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

    if (!this.dialogParam.newPreference) {
      this.dialogParam.newPreference = defaultParam.newPreference;
    }
    if (!this.dialogParam.preferencesList) {
      this.dialogParam.preferencesList = defaultParam.preferencesList;
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
function importPreference(currentParams) {
  /** Questo comando imposta nel dialogo i parametri in base al campo correntemente selezionato del comboBox */
  if (currentParams) {
    let selectedPreference = currentParams.data.find(item => item.name === "PreferencesList").value;
    let csvFieldsParams_preferences = Banana.document.getScriptSettings("csvFieldsParams_Preferences");
    if (selectedPreference && csvFieldsParams_preferences) {
      let preferencesParams = JSON.parse(csvFieldsParams_preferences);
      let preferencesList = preferencesParams.preferencesListData;
      for (const item of preferencesList) {
        /** This line extracts the keys of the current object in the loop  using Object.keys(item).
         * As we have only one key for each object (e.g., "Bank1" or "Bank2") we dont need to specifiy the first element.
        */
        const preferenceName = Object.keys(item);
        if (preferenceName.toString() === selectedPreference.toString()) {
          return item[preferenceName];
        }
      }

    }
  }

  return currentParams;
}

function savePreferences(currentDlgParams) {
  //Salvo solo queste preferenze qui, e poi controllo le altre che coincidano, caso le aggiorno.
  let preferencesParam = initParam_Preferences();
  let savedPreferencesParam = Banana.document.getScriptSettings("csvFieldsParams_Preferences");
  if (savedPreferencesParam.length > 0) {
    preferencesParam = JSON.parse(savedPreferencesParam);
  }
  let currentPreference = getCurrentPreference(currentDlgParams);
  let preferenceToModify = false;
  if (preferenceExists(preferencesParam, currentPreference)) {
    preferenceToModify = true;
  }
  saveNewPreferencesData(preferencesParam, currentDlgParams, currentPreference, preferenceToModify);
  let paramToString = JSON.stringify(preferencesParam);
  Banana.document.setScriptSettings("csvFieldsParams_Preferences", paramToString);

  return currentDlgParams;
}

function deletePreferences(currentDlgParams) {
  //Salvo solo queste preferenze qui, e poi controllo le altre che coincidano, caso le aggiorno.
  let preferencesParam = initParam_Preferences();
  let savedPreferencesParam = Banana.document.getScriptSettings("csvFieldsParams_Preferences");
  if (savedPreferencesParam.length > 0) {
    preferencesParam = JSON.parse(savedPreferencesParam);
  }
  let currentPreference = getCurrentPreference(currentDlgParams);

  deletePreferencesData(preferencesParam, currentPreference);
  let paramToString = JSON.stringify(preferencesParam);
  Banana.document.setScriptSettings("csvFieldsParams_Preferences", paramToString);

  return currentDlgParams;
}

function getCurrentPreference(currentDlgParams) {
  //Recupero la preferenza inserita, Ad esempio bancastato, raiffeisen, ecc, formato nome consigliato: MyBankName_31122023
  let currentPreference = "";
  if (currentDlgParams && currentDlgParams.data.find(item => item.name === "MappingPrefrencesName").value) {
    currentPreference = currentDlgParams.data.find(item => item.name === "MappingPrefrencesName").value;
  }
  return currentPreference;
}

function preferenceExists(preferencesParam, currentPreference) {
  //Controllo se la preferenza esiste già nei preferiti
  if (preferencesParam && preferencesParam.preferencesListData) {
    for (const obj in preferencesParam.preferencesListData) {
      let object = preferencesParam.preferencesListData[obj];
      for (const key in object) {
        if (key == currentPreference)
          return true;
      }
    }
  }
  return false;
}

function deletePreferencesData(preferencesParam, currentPreference) {
  DeletePreferencesNameList(currentPreference); // Inserire un nuovo parametro che permette di definire se aggiungere o togliere l'oggetto, o meglio fare due metodi, un add ad un remove.
  UpdatedPreferencesObjectListOfNames(preferencesParam);// Inserire un nuovo parametro che permette di definire se aggiungere o togliere l'oggetto.
}

function saveNewPreferencesData(preferencesParam, currentDlgParams, currentPreference, preferenceToModify) {
  if (preferenceToModify) { // Modifico quello esistente.
    for (const obj in preferencesParam.preferencesListData) {
      let object = preferencesParam.preferencesListData[obj];
      for (const key in object) {
        if (key == currentPreference) {
          let newPreferenceObject = { [currentPreference]: currentDlgParams };
          preferencesParam.preferencesListData[obj] = newPreferenceObject;
        }
      }
    }
    Banana.document.addMessage("Preference: " + " \"" + currentPreference + "\" " + " has been modified");
  } else {
    /** 
     * 1) Aggiungo il nuovo oggetto alla lista
     * 2) Aggiorno la lista con il nome delle preferenze
     * 3) Aggiorno la lista di nomi delle preferenze in ogni oggetto esistente (incluso quello nuovo appena aggiunto).
     */
    let newPreferenceObject = { [currentPreference]: currentDlgParams };
    preferencesParam.preferencesListData.push(newPreferenceObject);
    AddPreferencesNameList(currentPreference);
    UpdatedPreferencesObjectListOfNames(preferencesParam);
  }
}

/**
 * Aggiorno la lista di nomi delle preferenze in ogni oggetto, in maniera di averli sempre aggiornati appena cambia qualcosa.
 */
function UpdatedPreferencesObjectListOfNames(preferencesParam) {
  let preferencesNameList = getPreferencesNameList(preferencesParam);
  if (preferencesParam && preferencesParam.preferencesListData) {
    for (var item of preferencesParam.preferencesListData) {
      var bankKey = Object.keys(item);
      var preferenceData = item[bankKey].data;

      // Find the object with the "items" property and update its value
      for (var subItem of preferenceData) {
        if (subItem.hasOwnProperty("items") && preferencesNameList.length > 0) {
          subItem.items = preferencesNameList; // Imposto i valori aggiornati.
        }
      }
    }
  }
}

function AddPreferencesNameList(currentPreference) {
  let preferencesNameList = getPreferencesNameList();
  if (preferencesNameList.length > 0) {
    preferencesNameList.push(currentPreference);
    let namesListToString = JSON.stringify(preferencesNameList);
    Banana.document.setScriptSettings("csvFieldsParams_PreferencesNames", namesListToString);
  } else {
    let csvFieldsParams_PreferencesNames = initPreferencesNamesList();
    csvFieldsParams_PreferencesNames.push(currentPreference);
    let paramsToString = JSON.stringify(csvFieldsParams_PreferencesNames);
    Banana.document.setScriptSettings("csvFieldsParams_PreferencesNames", paramsToString);
  }
}

function DeletePreferencesNameList(currentPreference) {
  let preferencesNameList = getPreferencesNameList();
  if (preferencesNameList.length > 0) {
    preferencesNameList.push(currentPreference);
    let namesListToString = JSON.stringify(preferencesNameList);
    Banana.document.setScriptSettings("csvFieldsParams_PreferencesNames", namesListToString);
  } else {
    let csvFieldsParams_PreferencesNames = initPreferencesNamesList();
    csvFieldsParams_PreferencesNames.push(currentPreference);
    let paramsToString = JSON.stringify(csvFieldsParams_PreferencesNames);
    Banana.document.setScriptSettings("csvFieldsParams_PreferencesNames", paramsToString);
  }
}

/**
 * Ritorna la lista con i nomi delle preferenze salvate nei preferiti: id = csvFieldsParams_PreferencesNames.
 */
function getPreferencesNameList() {
  let preferencesNamesList = Banana.document.getScriptSettings("csvFieldsParams_PreferencesNames");
  let parsedNamesList = [];
  if (preferencesNamesList.length > 0) {
    let parsedPreferencesName = JSON.parse(preferencesNamesList);
    if (parsedPreferencesName) {
      parsedNamesList = parsedPreferencesName;
    }
  }
  return parsedNamesList;
}


function initParam_Preferences() {
  let params = {};
  params.preferencesListData = [];

  return params;
}

function initPreferencesNamesList() {
  let preferencesNamesList = [];
  return preferencesNamesList;
}

function getObjectKeysList(objectsList) {
  let keysList = [];
  if (objectsList.length > 0) {
    for (const obj in objectsList) {
      let object = objectsList[obj];
      for (const key in object) {
        keysList.push(key);
      }
    }
  }
  return keysList;
}

/* ******* EXAMPLE OF STRUCTURES SAVED INTO SYSKEY TABLE ************

csvFieldsParams_PreferencesNames:["Postfinance","SwissCard"]

csvFieldsParams_Preferences: 

{
  "preferencesListData": [
    {
      "Postfinance": {
        "data": [
          {
            "editable": false,
            "name": "CsvParameters",
            "title": "CSV Parameters",
            "value": ""
          },
          {
            "editable": false,
            "name": "CsvFields",
            "title": "CSV Fields",
            "value": ""
          },
          {
            "defaultvalue": "",
            "name": "MappingPrefrencesName",
            "parentObject": "CsvParameters",
            "title": "Map New Preference",
            "type": "string",
            "value": "Postfinance"
          },
          {
            "defaultvalue": "",
            "items": [
              "Postfinance",
              "Swisscard"
            ],
            "name": "PreferencesList",
            "parentObject": "CsvParameters",
            "title": "Preferences List",
            "type": "combobox",
            "value": ""
          },
          {
            "defaultvalue": ";",
            "name": "FieldsDelimiter",
            "parentObject": "CsvParameters",
            "title": "Fields Delimiter",
            "type": "string",
            "value": ";"
          },
          {
            "defaultvalue": "\"",
            "name": "TextDelimiter",
            "parentObject": "CsvParameters",
            "title": "Text Delimiter",
            "type": "string",
            "value": "\""
          },
          {
            "defaultvalue": "dd.mm.yyyy",
            "name": "DateFormat",
            "parentObject": "CsvParameters",
            "title": "Date Format",
            "type": "string",
            "value": "dd.mm.yyyy"
          },
          {
            "defaultvalue": ".",
            "name": "DecimalSeparator",
            "parentObject": "CsvParameters",
            "title": "Decimal Separator",
            "type": "string",
            "value": "."
          },
          {
            "defaultvalue": "",
            "name": "DateColumn",
            "parentObject": "CsvFields",
            "title": "Date Column",
            "type": "string",
            "value": "1"
          },
          {
            "defaultvalue": "",
            "name": "DescriptionColumn",
            "parentObject": "CsvFields",
            "title": "Description Column",
            "type": "string",
            "value": "2"
          },
          {
            "defaultvalue": "",
            "name": "AmountColumn",
            "parentObject": "CsvFields",
            "title": "Amount Column",
            "type": "string",
            "value": "4;5"
          }
        ],
        "version": "1.0"
      }
    },
    {
      "Swisscard": {
        "data": [
          {
            "editable": false,
            "name": "CsvParameters",
            "title": "CSV Parameters",
            "value": ""
          },
          {
            "editable": false,
            "name": "CsvFields",
            "title": "CSV Fields",
            "value": ""
          },
          {
            "defaultvalue": "",
            "name": "MappingPrefrencesName",
            "parentObject": "CsvParameters",
            "title": "Map New Preference",
            "type": "string",
            "value": "Swisscard"
          },
          {
            "defaultvalue": "",
            "items": [
              "Postfinance",
              "Swisscard"
            ],
            "name": "PreferencesList",
            "parentObject": "CsvParameters",
            "title": "Preferences List",
            "type": "combobox",
            "value": "Postfinance"
          },
          {
            "defaultvalue": ";",
            "name": "FieldsDelimiter",
            "parentObject": "CsvParameters",
            "title": "Fields Delimiter",
            "type": "string",
            "value": ","
          },
          {
            "defaultvalue": "\"",
            "name": "TextDelimiter",
            "parentObject": "CsvParameters",
            "title": "Text Delimiter",
            "type": "string",
            "value": "\""
          },
          {
            "defaultvalue": "dd.mm.yyyy",
            "name": "DateFormat",
            "parentObject": "CsvParameters",
            "title": "Date Format",
            "type": "string",
            "value": "dd.mm.yyyy"
          },
          {
            "defaultvalue": ".",
            "name": "DecimalSeparator",
            "parentObject": "CsvParameters",
            "title": "Decimal Separator",
            "type": "string",
            "value": "."
          },
          {
            "defaultvalue": "",
            "name": "DateColumn",
            "parentObject": "CsvFields",
            "title": "Date Column",
            "type": "string",
            "value": "1"
          },
          {
            "defaultvalue": "",
            "name": "DescriptionColumn",
            "parentObject": "CsvFields",
            "title": "Description Column",
            "type": "string",
            "value": "2"
          },
          {
            "defaultvalue": "",
            "name": "AmountColumn",
            "parentObject": "CsvFields",
            "title": "Amount Column",
            "type": "string",
            "value": "5"
          }
        ],
        "version": "1.0"
      }
    }
  ]
}

csvFieldsParams:

{
  "amountColumn": "5",
  "dateColumn": "1",
  "dateFormat": "dd.mm.yyyy",
  "decimalSeparator": ".",
  "descriptionColumn": "2",
  "fieldsDelimiter": ",",
  "lastPreferenceSelected": "",
  "newPreference": "Swisscard",
  "preferencesList": [
    {
      "Postfinance": {
        "data": [
          {
            "editable": false,
            "name": "CsvParameters",
            "title": "CSV Parameters",
            "value": ""
          },
          {
            "editable": false,
            "name": "CsvFields",
            "title": "CSV Fields",
            "value": ""
          },
          {
            "defaultvalue": "",
            "name": "MappingPrefrencesName",
            "parentObject": "CsvParameters",
            "title": "Map New Preference",
            "type": "string",
            "value": "Postfinance"
          },
          {
            "defaultvalue": "",
            "items": [
              "Postfinance",
              "Swisscard"
            ],
            "name": "PreferencesList",
            "parentObject": "CsvParameters",
            "title": "Preferences List",
            "type": "combobox",
            "value": ""
          },
          {
            "defaultvalue": ";",
            "name": "FieldsDelimiter",
            "parentObject": "CsvParameters",
            "title": "Fields Delimiter",
            "type": "string",
            "value": ";"
          },
          {
            "defaultvalue": "\"",
            "name": "TextDelimiter",
            "parentObject": "CsvParameters",
            "title": "Text Delimiter",
            "type": "string",
            "value": "\""
          },
          {
            "defaultvalue": "dd.mm.yyyy",
            "name": "DateFormat",
            "parentObject": "CsvParameters",
            "title": "Date Format",
            "type": "string",
            "value": "dd.mm.yyyy"
          },
          {
            "defaultvalue": ".",
            "name": "DecimalSeparator",
            "parentObject": "CsvParameters",
            "title": "Decimal Separator",
            "type": "string",
            "value": "."
          },
          {
            "defaultvalue": "",
            "name": "DateColumn",
            "parentObject": "CsvFields",
            "title": "Date Column",
            "type": "string",
            "value": "1"
          },
          {
            "defaultvalue": "",
            "name": "DescriptionColumn",
            "parentObject": "CsvFields",
            "title": "Description Column",
            "type": "string",
            "value": "2"
          },
          {
            "defaultvalue": "",
            "name": "AmountColumn",
            "parentObject": "CsvFields",
            "title": "Amount Column",
            "type": "string",
            "value": "4;5"
          }
        ],
        "version": "1.0"
      }
    },
    {
      "Swisscard": {
        "data": [
          {
            "editable": false,
            "name": "CsvParameters",
            "title": "CSV Parameters",
            "value": ""
          },
          {
            "editable": false,
            "name": "CsvFields",
            "title": "CSV Fields",
            "value": ""
          },
          {
            "defaultvalue": "",
            "name": "MappingPrefrencesName",
            "parentObject": "CsvParameters",
            "title": "Map New Preference",
            "type": "string",
            "value": "Swisscard"
          },
          {
            "defaultvalue": "",
            "items": [
              "Postfinance",
              "Swisscard"
            ],
            "name": "PreferencesList",
            "parentObject": "CsvParameters",
            "title": "Preferences List",
            "type": "combobox",
            "value": "Postfinance"
          },
          {
            "defaultvalue": ";",
            "name": "FieldsDelimiter",
            "parentObject": "CsvParameters",
            "title": "Fields Delimiter",
            "type": "string",
            "value": ","
          },
          {
            "defaultvalue": "\"",
            "name": "TextDelimiter",
            "parentObject": "CsvParameters",
            "title": "Text Delimiter",
            "type": "string",
            "value": "\""
          },
          {
            "defaultvalue": "dd.mm.yyyy",
            "name": "DateFormat",
            "parentObject": "CsvParameters",
            "title": "Date Format",
            "type": "string",
            "value": "dd.mm.yyyy"
          },
          {
            "defaultvalue": ".",
            "name": "DecimalSeparator",
            "parentObject": "CsvParameters",
            "title": "Decimal Separator",
            "type": "string",
            "value": "."
          },
          {
            "defaultvalue": "",
            "name": "DateColumn",
            "parentObject": "CsvFields",
            "title": "Date Column",
            "type": "string",
            "value": "1"
          },
          {
            "defaultvalue": "",
            "name": "DescriptionColumn",
            "parentObject": "CsvFields",
            "title": "Description Column",
            "type": "string",
            "value": "2"
          },
          {
            "defaultvalue": "",
            "name": "AmountColumn",
            "parentObject": "CsvFields",
            "title": "Amount Column",
            "type": "string",
            "value": "5"
          }
        ],
        "version": "1.0"
      }
    }
  ],
  "textDelimiter": "\""
}
*/
