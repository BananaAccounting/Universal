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
// @api = 1.0
// @pubdate = 2021-12-10
// @publisher = Banana.ch SA
// @description = ch.banana.new.items.dialog
// @timeout = -1

/**
 * This script defines the dialog   
 */
/*******************************************
 * 
 * DIALOG SETUP
 * 
 *******************************************/

/** Dialog's functions declaration */
dialog=Banana.Ui.createUi("ch.banana.portfolio.management.new.items.dialog.ui");

//sales data section objects
var itemId = dialog.findChild('item_label_value');
var itemCurrency = dialog.findChild('item_currency_label_value');
var itemBankAccount = dialog.findChild('bank_account_label_value');
var itemGroupComboBox = dialog.findChild('groups_comboBox');
var itemAccount = dialog.findChild('account_lineEdit');

/**
 * Read the params from the dialog
 */
function readDialogParams(){
    var userParam={};

    userParam.itemGroupComboBox=itemGroupComboBox.currentText;
    userParam.itemAccount=itemAccount.text;

    return userParam;
}

/**
 * This function sets the known values of the item in the dialogue, 
 * these values serve as a reference for the user to understand which 
 * item it is when he adds the missing information.
 */
function setDialogParams(importsTableRow){
    //fill the combobox.
    insertComboBoxElements();
    //set the labels
    itemId.setText(importsTableRow.itemId+", "+importsTableRow.description);
    itemCurrency.setText(importsTableRow.currency);
    itemBankAccount.setText(importsTableRow.bankAccount);
}

/**
 * Fills the dialogue combobox with the items found in the item table
 * @param {*} itemGroupComboBox 
 */
function insertComboBoxElements(){
    //First set the editable attribute to true,in this way the user can also enter the text.
    itemGroupComboBox.editable=true;

    const groupList=new Set();
    var itemsData=getItemsTableData("false"); //I give as parameter "false" as I only need the list of items

    //fill the listString with the existing items
    for(var r in itemsData){
        if(itemsData[r].group){
            groupList.add(itemsData[r].group);
        }
    }

    var groupList_array=Array.from(groupList); //convert the set into an array.
    
    if(itemGroupComboBox)
        itemGroupComboBox.insertItems(1, groupList_array);
}


function dialogExec(importsTableRow){

    //fill the combobox with the existent groups and fill the labelw with the known data
    setDialogParams(importsTableRow);
    Banana.application.progressBar.pause();
    var dlgResult = dialog.exec();
    Banana.application.progressBar.resume();

    if (dlgResult !== 1)
        return false;
    else
        return true;


}