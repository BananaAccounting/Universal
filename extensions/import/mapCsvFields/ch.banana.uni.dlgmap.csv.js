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
    // Aggiungo comando per salvare una nuova configurazione o modificarlo sovrascrivendo i valori esistenti.
    editorDlg.addCustomCommand("saveConfiguration", "Save Configuration");
    // Aggiungo comando per eliminare una configurazione dalla lista delle configurazioni salvate.
    editorDlg.addCustomCommand("deleteConfiguration", "Delete Configuration");
    //Aggiungo comando per importare nel dialogo i dati della configurazione correntemente selezionata.
    editorDlg.addCustomCommand("selectConfiguration", "Select Configuration");
    // Poi riproporre le configurazioni in un comboBox.

    let rtnValue = editorDlg.exec();
    if (parseInt(rtnValue) === 1) {
      let modifiedParams = editorDlg.getParams();
      this.saveParams(modifiedParams);
      /** Aggiorno i parametri con quelli nuovi, devo farlo qui e non nei comandi per avere un solo set dei
       * csvFieldsParams ed evitare che le modifiche si sovrascrivano a vicenda.
       */
      this.updateConfigurationsList();
      var paramToString = JSON.stringify(this.dialogParam);
      Banana.document.setScriptSettings("csvFieldsParams", paramToString);
      return true;
    }

    return "@Cancel";
  }

  saveParams(modifiedParams) {
    if (modifiedParams && modifiedParams.data &&
      modifiedParams.data.length > 0) {
      let arrayData = modifiedParams.data;
      let object = {};

      object = arrayData.find(obj => obj.name === "MapConfigurationName");
      if (object && object.value) {
        this.dialogParam.newConfiguration = object.value;
      }
      object = arrayData.find(obj => obj.name === "ConfigurationsList");
      if (object && object.value) {
        this.dialogParam.configurationsList = object.value;
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
 * Aggiorna la lista delle configurazioni in csvFieldsParams con le ultime salvate o rimosse in csvFieldsParams_Configurations tramite i comandi.
 * passo tutti gli elementi presenti nelle configurazioni: "csvFieldsParams_Configurations" (che viene modificato tramite i comandi nel button) e passo tutti gli elementi, se nei 
 * "csvFieldsParams" manca un oggetto, allora lo aggiungo, viceversa se ce un oggetto di troppo, allora lo rimuovo.
 * Uso come riferimento csvFieldsParams_Configurations perche l'oggetto che viene modificato solo dai comandi in basso (aggiungere rimuovere configurazioni) e in base a
 * quello che rimane poi quando chiudo il dialogo, aggiorno le configurazioni generali con quello che risulta in csvFieldsParams_Configurations.
 */
  updateConfigurationsList() {
    let csvFieldsParams_configurations = Banana.document.getScriptSettings("csvFieldsParams_Configurations");
    if (csvFieldsParams_configurations) {
      let parsedParam_configurations = JSON.parse(csvFieldsParams_configurations);
      let confData = parsedParam_configurations.configurationsListData; // Array of objects.
      let paramData = this.dialogParam.configurationsList;
      if (!this.containsSameObjects(confData, paramData)) {
        //Banana.console.debug("diversi"); //ok
        this.dialogParam.configurationsList = confData; // sincronizzo i due array.
      }
    }
  }
  containsSameObjects(confData, paramData) {
    //The lenght of the arrays initally is the same, thats why we do not check it.
    if (JSON.stringify(confData) !== JSON.stringify(paramData)) { //Controllo da cambiare in futuro.
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

    // Mapping Configuration Name.
    var param = {};
    param.name = 'MapConfigurationName';
    param.parentObject = 'CsvParameters';
    param.title = 'Configuration Name';
    param.type = 'string';
    param.value = userParam.newConfiguration ? userParam.newConfiguration : '';
    param.defaultvalue = defaultParam.newConfiguration;
    param.readValue = function () {
      userParam.newConfiguration = this.value;
    }
    paramList.data.push(param);

    // Configurations List (list of Banks).
    let confList = []; // Prendo i valori salvati nelle configurazioni
    confList = initConfigurationsList();
    let configurationsNameList = Banana.document.getScriptSettings("csvFieldsParams_configurationsNameList");
    if (configurationsNameList.length > 0) {
      let parsedConfigurationsNameList = JSON.parse(configurationsNameList);
      if (parsedConfigurationsNameList) {
        confList = parsedConfigurationsNameList;
      }
    }
    var param = {};
    param.name = 'ConfigurationsList';
    param.parentObject = 'CsvParameters';
    param.title = 'Configurations List';
    param.type = 'combobox';
    param.items = confList;
    param.value = userParam.lastConfigurationSelected ? userParam.lastConfigurationSelected : '';
    param.defaultvalue = defaultParam.lastConfigurationSelected;
    param.readValue = function () {
      userParam.lastConfigurationSelected = this.value;
      userParam.configurationsList = confList;
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

    params.newConfiguration = '';
    params.lastConfigurationSelected = '';
    params.configurationsList = [];
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

    if (!this.dialogParam.newConfiguration) {
      this.dialogParam.newConfiguration = defaultParam.newConfiguration;
    }
    if (!this.dialogParam.configurationsList) {
      this.dialogParam.configurationsList = defaultParam.configurationsList;
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

function selectConfiguration(currentParams) {
  /** Questo comando imposta nel dialogo i parametri in base al campo correntemente selezionato del comboBox */
  if (currentParams) {
    let selectedConfiguration = currentParams.data.find(item => item.name === "ConfigurationsList").value;
    let csvFieldsParams_configurations = Banana.document.getScriptSettings("csvFieldsParams_Configurations");
    if (selectedConfiguration && csvFieldsParams_configurations) {
      let configurationsParams = JSON.parse(csvFieldsParams_configurations);
      let configurationsList = configurationsParams.configurationsListData;
      for (const item of configurationsList) {
        /** This line extracts the keys of the current object in the loop  using Object.keys(item).
         * As we have only one key for each object (e.g., "Bank1" or "Bank2") we dont need to specifiy the first element.
        */
        const confName = Object.keys(item);
        if (confName.toString() === selectedConfiguration.toString()) {
          return item[confName];
        }
      }

    }
  }

  return currentParams;
}

function saveConfiguration(currentDlgParams) {
  //Salvo solo queste configurazioni qui, e poi controllo le altre che coincidano, caso le aggiorno.
  let configurationsParam = initParam_Configurations();
  let savedConfigurationsParam = Banana.document.getScriptSettings("csvFieldsParams_Configurations");
  if (savedConfigurationsParam.length > 0) {
    configurationsParam = JSON.parse(savedConfigurationsParam);
  }
  let currentConfiguration = getCurrentConfiguration(currentDlgParams);
  let configurationToModify = false;
  if (configurationExists(configurationsParam, currentConfiguration)) {
    configurationToModify = true;
  }
  saveNewConfigurationData(configurationsParam, currentDlgParams, currentConfiguration, configurationToModify);
  let paramToString = JSON.stringify(configurationsParam);
  Banana.document.setScriptSettings("csvFieldsParams_Configurations", paramToString);

  return currentDlgParams;
}


function deleteConfiguration(currentDlgParams) {
  /**- Come per il save configurations, il comando funziona in base al valore inserito nel campo "Map New Configuration.
   * - Una volta premuto il comando viene chiesta la conferma della cancellazione della configurazione.
   * - La configurazione viene cancellata da tutti gli oggetti nella syskey
   * - vengono ritornati gli stessi parametri ma con la lista delle configurazioni aggiornata. (forse da migliorare la metodologia)
   *  */
  let currentConfiguration = getCurrentConfiguration(currentDlgParams);
  if (Banana.Ui.showQuestion("Delete", "Are you sure to delete the following configuration: " + currentConfiguration)) {
    let configurationsParam = initParam_Configurations();
    let savedConfigurationsParam = Banana.document.getScriptSettings("csvFieldsParams_Configurations");
    if (savedConfigurationsParam.length > 0) {
      configurationsParam = JSON.parse(savedConfigurationsParam);
    }

    deleteConfigurationData(configurationsParam, currentDlgParams, currentConfiguration);
    let paramToString = JSON.stringify(configurationsParam);
    Banana.document.setScriptSettings("csvFieldsParams_Configurations", paramToString);
  }

  return currentDlgParams;
}

function getCurrentConfiguration(currentDlgParams) {
  //Recupero la configurazione inserita, Ad esempio bancastato, raiffeisen, ecc, formato nome consigliato: MyBankName_31122023
  let currentConfiguration = "";
  if (currentDlgParams && currentDlgParams.data.find(item => item.name === "MapConfigurationName").value) {
    currentConfiguration = currentDlgParams.data.find(item => item.name === "MapConfigurationName").value;
  }
  return currentConfiguration;
}

function configurationExists(configurationsParam, currentConfiguration) {
  //Controllo se la configurazione esiste già nella lista delle configurazioni.
  if (configurationsParam && configurationsParam.configurationsListData) {
    for (const obj in configurationsParam.configurationsListData) {
      let object = configurationsParam.configurationsListData[obj];
      for (const key in object) {
        if (key == currentConfiguration)
          return true;
      }
    }
  }
  return false;
}

function deleteConfigurationData(configurationsParam, currentDlgParams, currentConfiguration) {
  //Cancello l'elemento da l'oggetto: csvFieldsParams_Configurations.
  const newData = configurationsParam.configurationsListData.filter(item => {
    // Check if the item key is not equal to the element i want to remove
    return !item.hasOwnProperty(currentConfiguration);
  });
  if (newData.length > 0) {
    configurationsParam.configurationsListData = newData;
  }
  //Cancello l'elemento dalle lista con i nomi delle configurazioni: csvFieldsParams_ConfigurationsNames
  if (DeleteConfigurationsNameList(currentDlgParams, currentConfiguration)) {
    //Aggiorno la lista con i nomi delle configurazioni nell oggetto: csvFieldsParams_Configurations
    UpdatedConfigurationsObjectListOfNames(configurationsParam);
  }
}

function saveNewConfigurationData(configurationsParam, currentDlgParams, currentConfiguration, configurationToModify) {
  if (configurationToModify) { // Modifico quello esistente.
    for (const obj in configurationsParam.configurationsListData) {
      let object = configurationsParam.configurationsListData[obj];
      for (const key in object) {
        if (key == currentConfiguration) {
          let newConfObject = { [currentConfiguration]: currentDlgParams };
          configurationsParam.configurationsListData[obj] = newConfObject;
        }
      }
    }
    Banana.document.addMessage("Configuration: " + " \"" + currentConfiguration + "\" " + " has been modified");
  } else {
    /** 
     * 1) Aggiungo il nuovo oggetto alla lista: csvFieldsParams_Configurations
     * 2) Aggiorno la lista con il nome delle configurazioni: csvFieldsParams_ConfigurationsNames
     * 3) Aggiorno la lista di nomi delle configurazioni (campo "items") in ogni oggetto esistente (csvFieldsParams_Configurations).
     */
    let newConfObject = { [currentConfiguration]: currentDlgParams };
    configurationsParam.configurationsListData.push(newConfObject);
    if (AddConfigurationsNameList(currentDlgParams, currentConfiguration)) {
      UpdatedConfigurationsObjectListOfNames(configurationsParam);
    }
  }
}

/**
 * Aggiorno la lista di nomi delle configurazioni in ogni oggetto, in maniera di averli sempre aggiornati appena cambia qualcosa.
 * Questo metodo deve essere chiamato SEMPRE dopo aver aggiunto o rimosso degli elementi dalla lista con i nomi delle configurazioni.
 */
function UpdatedConfigurationsObjectListOfNames(configurationsParam) {
  let configurationsNameList = getConfigurationsNameList(configurationsParam);
  if (configurationsParam && configurationsParam.configurationsListData) {
    for (var item of configurationsParam.configurationsListData) {
      var bankKey = Object.keys(item);
      var configurationData = item[bankKey].data;

      // Find the object with the "items" property and update its value
      for (var subItem of configurationData) {
        if (subItem.hasOwnProperty("items") && configurationsNameList.length > 0) {
          subItem.items = configurationsNameList; // Imposto i valori aggiornati.
        }
      }
    }
  }
}

function AddConfigurationsNameList(currentDlgParams, currentConfiguration) {
  let configurationsNameList = getConfigurationsNameList();
  if (configurationsNameList.length > 0) {
    configurationsNameList.push(currentConfiguration);
    // aggiorno il comboBox nel dialogo attuale.
    currentDlgParams.data.find(item => item.name === "ConfigurationsList")["items"] = configurationsNameList;
    let namesListToString = JSON.stringify(configurationsNameList);
    Banana.document.setScriptSettings("csvFieldsParams_ConfigurationsNames", namesListToString);
  } else {
    let csvFieldsParams_ConfigurationsNames = initConfigurationsList();
    csvFieldsParams_ConfigurationsNames.push(currentConfiguration);
    let paramsToString = JSON.stringify(csvFieldsParams_ConfigurationsNames);
    Banana.document.setScriptSettings("csvFieldsParams_ConfigurationsNames", paramsToString);
  }
  return true;
}

function DeleteConfigurationsNameList(currentDlgParams, currentConfiguration) {
  //Delete the element from the configurations list
  let configurationsNameList = getConfigurationsNameList();
  if (configurationsNameList.length > 0) {
    let confIndex = configurationsNameList.indexOf(currentConfiguration);
    if (confIndex > -1) {
      configurationsNameList.splice(confIndex);
    }
    // aggiorno il comboBox nel dialogo attuale.
    currentDlgParams.data.find(item => item.name === "ConfigurationsList")["items"] = configurationsNameList;
    let namesListToString = JSON.stringify(configurationsNameList);
    Banana.document.setScriptSettings("csvFieldsParams_ConfigurationsNames", namesListToString);
    return true;
  }
}

/**
 * Ritorna la lista con i nomi delle configurazioni salvate nella lista delle configurazioni: id = csvFieldsParams_ConfigurationsNames.
 */
function getConfigurationsNameList() {
  let configurationsNamesList = Banana.document.getScriptSettings("csvFieldsParams_ConfigurationsNames");
  let parsedNamesList = [];
  if (configurationsNamesList.length > 0) {
    let parsedConfigurationsName = JSON.parse(configurationsNamesList);
    if (parsedConfigurationsName) {
      parsedNamesList = parsedConfigurationsName;
    }
  }
  return parsedNamesList;
}


function initParam_Configurations() {
  let params = {};
  params.configurationsListData = [];

  return params;
}

function initConfigurationsList() {
  let configurationsList = [];
  return configurationsList;
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

csvFieldsParams_ConfigurationsNames:["Postfinance","SwissCard"]

csvFieldsParams_Configurations: 

{
  "configurationsListData": [
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
            "name": "MapConfigurationName",
            "parentObject": "CsvParameters",
            "title": "Map New Configuration",
            "type": "string",
            "value": "Postfinance"
          },
          {
            "defaultvalue": "",
            "items": [
              "Postfinance",
              "Swisscard"
            ],
            "name": "ConfigurationsList",
            "parentObject": "CsvParameters",
            "title": "Configurations List",
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
            "name": "MapConfigurationName",
            "parentObject": "CsvParameters",
            "title": "Map New Configuration",
            "type": "string",
            "value": "Swisscard"
          },
          {
            "defaultvalue": "",
            "items": [
              "Postfinance",
              "Swisscard"
            ],
            "name": "ConfigurationsList",
            "parentObject": "CsvParameters",
            "title": "Configurations List",
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
  "lastConfigurationSelected": "",
  "newConfiguration": "Swisscard",
  "configurationsList": [
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
            "name": "MapConfigurationName",
            "parentObject": "CsvParameters",
            "title": "Map New Configuration",
            "type": "string",
            "value": "Postfinance"
          },
          {
            "defaultvalue": "",
            "items": [
              "Postfinance",
              "Swisscard"
            ],
            "name": "ConfigurationsList",
            "parentObject": "CsvParameters",
            "title": "Configurations List",
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
            "name": "MapConfigurationName",
            "parentObject": "CsvParameters",
            "title": "Map New Configuration",
            "type": "string",
            "value": "Swisscard"
          },
          {
            "defaultvalue": "",
            "items": [
              "Postfinance",
              "Swisscard"
            ],
            "name": "ConfigurationsList",
            "parentObject": "CsvParameters",
            "title": "Configurations List",
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
