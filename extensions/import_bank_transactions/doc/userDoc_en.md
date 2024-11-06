# IMPORT BANK TRANSACTIONS (Camt ISO20022) [BETA]

With this functionality, you can import bank transactions into your accounting using files Camt ISO20022. By selecting a folder containing CAMT files, the program detects all transactions not yet recorded in the accounts and imports them. This feature helps you speed up the process and reduce the risk of errors or duplications.

## Prerequisites
- Using Banana Accounting Plus with the Advanced plan.
- Using a Double-Entry or Income and Expenses accounting.

## How to start
1) Open Banana Accounting Plus.
2) Open your accounting file or create a new one.
3) If not already present, in the ‘Accounts’ table enter the bank accounts you intend to manage. For each account, enter the iban in the 'BankIban' column. If you do not see the 'BankIban' column in the ‘Accounts’ table, you can add it from the menu ‘Tools-->Add/Remove functionalities and select ’Add address columns in Accounts table. Make sure that the iban is written correctly, all in uppercase and without any space or character between the characters.
4) Install the extension: "Swiss Camt ISO20022 Reader". This extension is mandatory to make the import work.
5) On menu 'Actions' click on command "Import bank transactions (Camt ISO20022)"
6) [Select the folder where your files are placed](##Folder-selection).
7) Visualize and manage the data inside the [dialog](##Import-bank-transactions-dialog).
8) Press OK.
 
Once you have imported the transactions, if you select againg the command "Import bank transactions", you should see that all the bank accounts up to date.

## Folder selection

Select the folder containing your files, once the folder is selected, the program reads the files and their contents. During the process, a dialog will show you the progress of the operation. The data reading is divided into two main steps:

1) **Reading the files in the folder**: The entire folder is scanned, and all new files are saved in the [Database](##File-Database).
2) **Reading the content of the files**: Only files with a creation date within the accounting period are opened and read. In the [dialog](##Dialog), you can also choose to include files created before the accounting opening date by simply adjusting the [Ignore files older than](##Dialog) field.

Clicking the ‘Cancel’ button during the data reading process will save and process the data read up to that point. To resume and complete the data reading, simply select the import command again and the program will finish processing, adding any new data to those already saved.

For convenience, the program automatically checks for new content in the folder every 24 hours. If you have added new files and want to force a read, you can do so by pressing the [Read all Files](##Dialog) button in the import dialog.

All files in the folder are saved, but only ISO20022 files (camt052, camt053, and camt054) are opened and read; everything else is stored. You can create as many sub-levels of folders as you wish, and the program will search for content in each folder and subfolder.

## Import bank transactions dialog

The dialog provides an overview of the processed files, the parameters used and of course the transactions to be imported. You can change the parameters in the dialog at any time, data are recalculated immediately.

### Folder Tab

Provides an overview of the import and the list of files containing transactions to be imported.

In the "Select Folder" box, you can see the path of the chosen folder, and you can change it at any time. Each time the reference folder is changed, the program immediately repeats the process of reading data from the new folder.

You can change the reference date for reading files; files with a creation date lower than the date entered in this field will not be read. By default, the date is equal to the date on which the accounts were opened, but you can change it at any time. This filter has been created for those cases where files relating to past accountings are present in a folder and you do not wish them to be taken into account.

![Folder tab](img/folder_tab.png)

### Bank accounts Tab

The accounts tab groups the list of bank accounts appearing in the accounting. For each account, the basic account data is shown, along with some information that may vary depending on the import:

* Accounting Balance: The current balance resulting in the accounting.
* Last Bank Balance: The most recent bank balance detected from the Camt files.
* New Transactions: The number of new transactions found.
* New Transactions Total: The total (balance) of the transactions to be imported.
* Last Import: The date of the last complete reading of the folder containing the files.
* Status: An account can have two statuses:
   - Up to date: No new transactions were found for this account.
   - New Transactions: Some transactions were found for this account that do not exist in the accounting.

![Accounts tab](img/bankaccounts_tab.png)

### Transactions details Tab

Shows,grouped by account, the data for all the transactions that need to be imported in the accounting. You have the option to exclude specific transactions or all transactions related to a certain account by using the checkboxes, these excluded transactions will then be proposed to you again the next time you display the dialog.

For the import process, you can choose to consider only incoming transactions after a certain date. This is useful when you are sure that all the transactions in the "Transactions" table are checked and correct, and you only want to consider those coming after this date. This can be particularly helpful when the transactions in the accounting do not have an ID (External Reference column), which is the primary value used to determine whether a transaction exists or not. By setting the filter date to the date of the last transaction in the accounting, the program will ignore all transactions with the same or older date.

![Transactions tab](img/transactionsdetails_tab.png)


### Settings Tab

Currently, here you only have the option to delete the data history of all imports saved in the database. Once the deletion is confirmed, you will be redirected to the [Folder Tab](##Folder-Tab) and by default, you will see all default values. At this point, if you want to perform a new import, just click the "Read All Files" button.

If you just wanted to delete the database data, at this point you still need to manually delete the "*.db" file.

The data saved in the database has nothing to do with the data saved in Banana, and deleting the database file will not modify any data in your accounting.

## Database file

The .db file that is created during the first import is simply a storage of all the data relating to the imports performed; its content is updated with each import, which helps to speed up the data reading process.

The name of the file is generated using the name of the selected folder. So, if your folder containing ISO20022 camt053 files is named, for example, myFiles, the database file will be named: **myFiles_importBankTransactions.db**.

This file must remain in its location and should not be moved, as the program will always look for it in the same place (at the level of the selected file folder). If you accidentally move or delete the .db file, it is not an issue; the program will create a new one. Each time the program creates a new .db file, it will need to read the entire contents of the file folder again.

Every time you select a different folder, a new .db file is created at the same level. If you realize that the selected folder is the wrong one, you can safely delete the .db file, and the program will create a new one at the level of the new folder.

## Log file

Banana also generates a log file during the import process. This file can be useful for developers in case problems occur with the import process, to understand what went wrong.

Take contact with our support and will help you to find the file in your active directory.

## Troubleshooting
- If you dont see any transaction to import but the selected folder is correct, please check:
 * If the bank accounts inserted in the Accounts table are correct.
 * If the accounting period include the transactions contained in the files (eventually check also the date filter "Consider only transactions from") in the transactions details tab.
 * The flag "Ingore files older than" date filter.