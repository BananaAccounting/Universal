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
// @id = portfolio_management_report.js
// @description = Portfolio Management Report
// @task = app.command
// @doctype = 100.*
// @publisher = Banana.ch SA
// @pubdate = 2021-04-14
// @inputdatasource = none
// @timeout = -1

/**
 * This extension generates a report that allows you to see the movements of bonds and stocks held in the accounts and details
 * acronym bas= bonds and stocks
 */

var PortfolioManagement=class  PortfolioManagement{

    constructor(){
        this.QtCurrent="";
        this.info=this.getDocumentInfo();
        this.NewItem=false;
    }

    addTableBaSAppraisal(report) {
        let current_date=new Date()
        current_date=Banana.Converter.toInternalDateFormat(current_date);
        var table_bas_appraisal = report.addTable('table_bas_appraisal');
        table_bas_appraisal.setStyleAttributes("width:100%;");
        table_bas_appraisal.getCaption().addText(qsTr("Appraisal Report \n Holdings as of: "+current_date), "styleTitles");
        var tableHeader = table_bas_appraisal.getHeader();
        var tableRow = tableHeader.addRow();
        tableRow.addCell("Type/Security", "styleTablesHeaderText");
        tableRow.addCell("Quantity", "styleTablesHeaderText");
        tableRow.addCell("Unit Cost", "styleTablesHeaderText");
        if(this.info.multiCurrency)
            tableRow.addCell("Currency", "styleTablesHeaderText");
        tableRow.addCell("Total Cost", "styleTablesHeaderText");
        tableRow.addCell("Market Price ", "styleTablesHeaderText");
        tableRow.addCell("Market Value", "styleTablesHeaderText");
        tableRow.addCell("% of Port", "styleTablesHeaderText");
        tableRow.addCell("Un. Gain or Loss", "styleTablesHeaderText");
        tableRow.addCell("% G/L", "styleTablesHeaderText");
        //this.generateHeaderColumns(tableRow);
        return table_bas_appraisal;
    }

    addTableBaSTransactionsDetails(report) {
        let current_date=new Date()
        current_date=Banana.Converter.toInternalDateFormat(current_date);
        var table_bas_transactions_details = report.addTable('table_bas_transactions_details');
        table_bas_transactions_details.setStyleAttributes("width:100%;");
        table_bas_transactions_details.getCaption().addText(qsTr("Portfolio Transactions \n Transactions as of: "+current_date), "styleTitles");
        var tableHeader = table_bas_transactions_details.getHeader();
        var tableRow = tableHeader.addRow();
        tableRow.addCell("Date", "styleTablesHeaderText");
        tableRow.addCell("Type", "styleTablesHeaderText");
        tableRow.addCell("Description", "styleTablesHeaderText");
        tableRow.addCell("Debit", "styleTablesHeaderText");
        tableRow.addCell("Credit", "styleTablesHeaderText");
        tableRow.addCell("Quantity", "styleTablesHeaderText");
        tableRow.addCell("Qt.Balance", "styleTablesHeaderText");
        tableRow.addCell("Unit/Price", "styleTablesHeaderText");
        tableRow.addCell("Amount", "styleTablesHeaderText");
        //this.generateHeaderColumns(tableRow);
        return table_bas_transactions_details;
    }

    printReport() {

        /**********************************************************
         * create the report
         **********************************************************/
        var report = Banana.Report.newReport("Portfolio management");

        /***********************************************************
         * Add the appraisal report table
         **********************************************************/

        var table_bas_appraisal = this.addTableBaSAppraisal(report);
        this.addHeader(report);
        this.addFooter(report);
        var items = this.getReportRows();
        items.sort(compare);
        var items_total = this.getReportRows_GroupTotals();
        var final_total=this.getReportRows_FinalTotal();

        var style_market_value=this.setSortedColumnStyle('Market Value');
        var style_percentage_of_portfolio=this.setSortedColumnStyle('Percentage of Portfolio');
        var style_market_quantity=this.setSortedColumnStyle('Quantity');

        for (var row_total in items_total) {
            var tableRow = table_bas_appraisal.addRow("styleTableRows");
            tableRow.addCell(items_total[row_total].name, 'styleTablesBasNames_totals',9);
            for (var row in items) {
                if (items[row].gr === items_total[row_total].name) {
                    let tableRow = table_bas_appraisal.addRow("styleTableRows");
                    tableRow.addCell(items[row].name, 'styleTablesBasNames');
                    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(items[row].quantity,"0",true), style_market_quantity);
                    tableRow.addCell(this.toLocaleAmountFormat(items[row].unit_cost), 'styleTablesBasResults');
                    if(this.info.multiCurrency)
                        tableRow.addCell(items[row].currency, 'styleTablesBasNames');
                    tableRow.addCell(this.toLocaleAmountFormat(items[row].total_cost), 'styleTablesBasResults');
                    tableRow.addCell(this.toLocaleAmountFormat(items[row].market_price), 'styleTablesBasResults');
                    tableRow.addCell(this.toLocaleAmountFormat(items[row].market_value), style_market_value);
                    tableRow.addCell(this.toLocaleAmountFormat(items[row].perc_of_port), style_percentage_of_portfolio);
                    var style=this.setNegativeStyle(items[row].unrealized_gain_loss);
                    tableRow.addCell(this.toLocaleAmountFormat(items[row].unrealized_gain_loss),style);
                    var style=this.setNegativeStyle(items[row].perc_g_l);
                    tableRow.addCell(this.toLocaleAmountFormat(items[row].perc_g_l), style);
                }
            }
            var tableRow = table_bas_appraisal.addRow("styleTableRows");
            var spanTotals=3
            if(this.info.multiCurrency)
                spanTotals=4
            tableRow.addCell("", 'styleTablesBasResults', spanTotals);
            tableRow.addCell(this.toLocaleAmountFormat(items_total[row_total].total_cost), 'styleTablesBasResults_totals');
            tableRow.addCell(this.toLocaleAmountFormat(items_total[row_total].market_value), 'styleTablesBasResults_totals',2);
            tableRow.addCell(this.toLocaleAmountFormat(items_total[row_total].perc_of_port), 'styleTablesBasResults_totals');
            var style=this.setNegativeStyle(items_total[row_total].unrealized_gain_loss,true);
            tableRow.addCell(this.toLocaleAmountFormat(items_total[row_total].unrealized_gain_loss),style);
            var style=this.setNegativeStyle(items_total[row_total].perc_g_l,true);
            tableRow.addCell(this.toLocaleAmountFormat(items_total[row_total].perc_g_l),style);

        }
        var spanFinalTotal=2
        if(this.info.multiCurrency)
        spanFinalTotal=3
        var tableRow = table_bas_appraisal.addRow("styleTableRows");
        tableRow.addCell(final_total.name, 'styleTablesBasNames_totals');
        tableRow.addCell("", 'styleTablesBasResults', spanFinalTotal);
        tableRow.addCell(this.toLocaleAmountFormat(final_total.total_cost), 'styleTablesBasResults_final_totals');
        tableRow.addCell(this.toLocaleAmountFormat(final_total.market_value), 'styleTablesBasResults_final_totals',2);
        tableRow.addCell(this.toLocaleAmountFormat(final_total.perc_of_port), 'styleTablesBasResults_final_totals');
        tableRow.addCell(this.toLocaleAmountFormat(final_total.unrealized_gain_loss),"styleTablesBasResults_final_totals");
        tableRow.addCell(this.toLocaleAmountFormat(final_total.perc_g_l),"styleTablesBasResults_final_totals");

        report.addPageBreak();
        
        
        /***********************************************************
         * Add the Portfolio transactions details table
         *********************************************************
        var style_market_value=setSortedColumnStyle('Market Value');
        var style_percentage_of_portfolio=setSortedColumnStyle('Percentage of Portfolio');
        var style_market_quantity=setSortedColumnStyle('Quantity');*/

        var table_bas_trans_details = this.addTableBaSTransactionsDetails(report);
        var transactionsDetails=this.setTransactionsDetails();
        var ItemList = this.getTableValues("Items", "ItemsId");
        for (var i = 0; i < ItemList.length; i++) {
            let tableRow = table_bas_trans_details.addRow("styleTableRows");
            tableRow.addCell(ItemList[i], 'styleTablesBasNames_totals',10);
            //nuovo item, quindi andrò a prendere la qt iniziale (se ce)
            this.NewItem=true;
            for (var row in transactionsDetails) {
                if(ItemList[i]==transactionsDetails[row].items){
                    let tableRow = table_bas_trans_details.addRow("styleTableRows");
                    tableRow.addCell(transactionsDetails[row].date, 'styleTablesBasResults');
                    tableRow.addCell(transactionsDetails[row].type,'styleTablesBasNames');
                    tableRow.addCell(transactionsDetails[row].descr, '');
                    tableRow.addCell(transactionsDetails[row].debit, 'styleTablesBasResults');
                    tableRow.addCell(transactionsDetails[row].credit, 'styleTablesBasResults');
                    var qtStyle=this.getQtStyle(transactionsDetails[row].qt);
                    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(transactionsDetails[row].qt,"0",false),qtStyle);
                    var beginQuantity=this.getBeginQt(ItemList[i]);
                    var quantityCurrent=this.getQtCurrent(beginQuantity,transactionsDetails[row].qt);
                    tableRow.addCell(Banana.Converter.toLocaleNumberFormat(quantityCurrent,"0",false),'styleTablesBasResults');
                    tableRow.addCell(this.toLocaleAmountFormat(transactionsDetails[row].price), 'styleTablesBasResults');
                    tableRow.addCell(this.toLocaleAmountFormat(transactionsDetails[row].amount), 'styleTablesBasResults');
                }
            }
            this.QtCurrent="";
        }

        return report;

    }
    getQtStyle(qt){
        var style="";
        var sign=Banana.SDecimal.sign(qt);

        if(sign==-1)
            style='styleNegativeAmount';
        else
            style='styleTablesBasResults';

        return style;
    }
    getQtCurrent(beginqt,qt){
        //sommo la quantità che prendo come parametro a quella corrente(this.QtCurrent)
        this.QtCurrent=Banana.SDecimal.add(this.QtCurrent,beginqt);
        this.QtCurrent=Banana.SDecimal.add(this.QtCurrent,qt);
        return this.QtCurrent
    }

    getBeginQt(item){
        var qtBegin = "";
        if(this.NewItem==true){
            if (!Banana.document) {
                return qtBegin;
            }
            var table = Banana.document.table("Items");
            if (!table) {
                return values;
            }
            for (var i = 0; i < table.rowCount; i++) {
                var tRow = table.row(i);

                if(tRow.value("ItemsId")==item){
                    qtBegin = tRow.value("QuantityBegin");
                }
            }
        }
        this.NewItem=false;
        return qtBegin;
    }

    setSortedColumnStyle(value){
        var savedParam = Banana.document.getScriptSettings();
        var userParam="";
        if (savedParam.length > 0) {
            userParam = JSON.parse(savedParam);
        }
        if(userParam){
            var style="";
            if(userParam===value){
                style="styleSortedByColumn";
                return style;
            }else{
                style="styleTablesBasResults";
                return style;
            }
        }else
            return 'styleTablesBasResults';
    }

    setNegativeStyle(value,isTotal){
        var style="";
        var sign=Banana.SDecimal.sign(value);
        var normal_style="";
        var negative_style="";

        if(isTotal){
            normal_style="styleTablesBasResults_totals";
            negative_style="styleTotalNegativeAmount";
        }else{
            normal_style="styleTablesBasResults";
            negative_style="styleNegativeAmount";
        }

        if(sign==-1){
            style=negative_style;
        }else{
            style=normal_style;
        }

        return style;
    }

    getReportStyle() {
        //CREATE THE STYLE FOR THE REPORT
        //create the style
        var textCSS = "";
        var file = Banana.IO.getLocalFile("file:script/portfolio_management_report.css");
        var fileContent = file.read();
        if (!file.errorString) {
            Banana.IO.openPath(fileContent);
            //Banana.console.log(fileContent);
            textCSS = fileContent;
        } else {
            Banana.console.log(file.errorString);
        }

        var stylesheet = Banana.Report.newStyleSheet();
        // Parse the CSS text
        stylesheet.parse(textCSS);

        var style = stylesheet;


        //Create a table style adding the border
        style = stylesheet.addStyle("table_bas_transactions");

        return stylesheet;
    }

    /**
     * 
     * @param {*} report 
     */
    addHeader(report) {

        var headerParagraph = report.getHeader().addSection();
        headerParagraph.addParagraph(this.info.company, "header_row_company");
        headerParagraph.addParagraph(this.info.Firstname+" "+this.info.Lastname, "header_row_normal");
        headerParagraph.addParagraph(this.info.address1+", "+this.info.Zip+" "+this.info.City, "header_row_normal");
        headerParagraph.addParagraph(this.info.Email, "header_row_normal");
        headerParagraph.excludeFromTest();
    }

    getDocumentInfo() {
        var documentInfo = {};
        documentInfo.isDoubleEntry = false;
        documentInfo.isIncomeExpenses = false;
        documentInfo.isCashBook = false;
        documentInfo.decimalsAmounts = 2;
        documentInfo.multiCurrency = false;
        documentInfo.withVat = false;
        documentInfo.vatAccount = "";
        documentInfo.customersGroup = "";
        documentInfo.suppliersGroup = "";
        documentInfo.basicCurrency = "";
        documentInfo.company = "";
        documentInfo.name = "";
        documentInfo.familyName = "";
        documentInfo.StartPeriod = "";
        documentInfo.EndPeriod = "";
        documentInfo.Company = "";
        documentInfo.address1 = "";
        documentInfo.City = "";
        documentInfo.Firstname="";
        documentInfo.Lastname="";
        documentInfo.Zip="";
        documentInfo.Email="";


        if (Banana.document) {
            if (Banana.document.info("AccountingDataBase", "Company"))
                documentInfo.company =
                Banana.document.info("AccountingDataBase", "Company");

            if (Banana.document.info("AccountingDataBase", "Name"))
                documentInfo.Firstname =
                Banana.document.info("AccountingDataBase", "Name");

            if (Banana.document.info("AccountingDataBase", "FamilyName"))
                documentInfo.Lastname =
                Banana.document.info("AccountingDataBase", "FamilyName");

            if (Banana.document.info("AccountingDataBase", "Zip"))
                documentInfo.Zip =
                Banana.document.info("AccountingDataBase", "Zip");

            if (Banana.document.info("AccountingDataBase", "Address1"))
                documentInfo.address1 =
                Banana.document.info("AccountingDataBase", "Address1");

            if (Banana.document.info("AccountingDataBase", "City"))
                documentInfo.City =
                Banana.document.info("AccountingDataBase", "City");

                
            if (Banana.document.info("AccountingDataBase", "Email"))
                documentInfo.Email =
                Banana.document.info("AccountingDataBase", "Email");

            if (Banana.document.info("Base", "FileTypeNumber"))
                var docType = Banana.document.info("Base", "FileTypeNumber");
            if(docType=="120" ||docType=="130" ){
                documentInfo.multiCurrency=true;
            }
                

            
        }
        return documentInfo;
    }


    /**
     * @description set the footer of the report.
     * @param {object} report: the report created
     */
    addFooter(report) {
        var currentDate = new Date();
        report.getFooter().addClass("footer");
        report.getFooter().addText(Banana.Converter.toLocaleDateFormat(currentDate));

    }

    /**
     * This function, given a certain table and column, looks for values and saves them in an array. 
     * @param {*} table the table where to look for it 
     * @param {*} column the column where to look for it 
     * @returns  array of values
     */
    getTableValues(table, column) {
        var values = [];
        if (!Banana.document) {
            return values;
        }
        var table = Banana.document.table(table);
        if (!table) {
            return values;
        }
        for (var i = 0; i < table.rowCount; i++) {
            var tRow = table.row(i);
            //I do not take the last total
            if(tRow.value("Gr")!==""){
                var value = tRow.value(column);

                if (value.length > 0) {
                    values.push(value);
                }
            }
        }
        return values;
    }

    /**
     * get the list of transactions from the transactions table
     * @returns a list of transactions
     */
    getTransactionsRows(){
        var transactionsRows = [];
        if (!Banana.document) {
            return transactionsRows;
        }

        var table = Banana.document.table("Transactions");
        if (!table) {
            return transactionsRows;
        }
        for (var i = 0; i < table.rowCount; i++) {
            var tRow = table.row(i);
            var transactionRow={};

            transactionRow.rowDate = tRow.value('Date');
            transactionRow.rowType = tRow.value('DocType');
            transactionRow.rowItem = tRow.value('ItemsId');
            transactionRow.rowDescr = tRow.value('Description');
            transactionRow.rowDebit = tRow.value('AccountDebit');
            transactionRow.rowCredit = tRow.value('AccountCredit');
            transactionRow.rowQt = tRow.value('Quantity');
            transactionRow.rowUnitPrice = tRow.value('UnitPrice');
            transactionRow.rowAmount = tRow.value('AmountCurrency');

            if(transactionRow.rowItem!=="")
                transactionsRows.push(transactionRow);

        }

        return transactionsRows;
    }

    setTransactionsDetails(){

        var transDetails=[];
        var transactionsRows=this.getTransactionsRows();

        for (var row in transactionsRows){

            var transactionDetails={};

            transactionDetails.date=transactionsRows[row].rowDate;
            transactionDetails.type=transactionsRows[row].rowType;
            transactionDetails.items=transactionsRows[row].rowItem;
            transactionDetails.descr=transactionsRows[row].rowDescr;
            transactionDetails.debit=transactionsRows[row].rowDebit;
            transactionDetails.credit=transactionsRows[row].rowCredit;
            transactionDetails.qt=transactionsRows[row].rowQt;
            transactionDetails.price=transactionsRows[row].rowUnitPrice;
            transactionDetails.amount=transactionsRows[row].rowAmount;

            transDetails.push(transactionDetails);
        }

        return transDetails;


    }

    sumArrayEelements(array){
        var sum="";
        for(var i=0;i<array.length;i++){
            sum=Banana.SDecimal.add(sum,array[i]);
        }
        return sum;
    }


    /**
     * this function searches for the item passed, the value contained in the items table in the column 
     * @param {*} item reference item 
     * @param {*} column the column where to look for it 
     * @returns the value at that specific position
     */
    getItemColumnValue(item, column) {
        let table = Banana.document.table("Items");
        let value = "";
        if (!table) {
            return value;
        }
        for (var i = 0; i < table.rowCount; i++) {
            var tRow = table.row(i);
            if (item === tRow.value("ItemsId") || item === tRow.value("Group")) {
                value = tRow.value(column);
                if (value) {
                    return value;
                }
            }
        }
    }

    /**
     * for a certain item, it searches in the journal the purchase records and saves in an array its cost. 
     * it makes the average of all the items found and returns the average purchase price.
     * @param {*} item 
     * @returns the average purchase price.
     */
    getItemUnitCost(item) {
        let table = Banana.document.table("Transactions");
        let unit_price = "";
        // il costo unitario è rappresentato dal costo medio di acquisto
        let unit_cost = "";
        let n_elements = [];

        for (var i = 0; i < table.rowCount; i++) {
            var tRow = table.row(i);
            if (tRow.value("ItemsId") === item && tRow.value("DocType") === "buy") {
                unit_price = tRow.value("UnitPrice");
                if (unit_price.length > 0) {
                    n_elements.push(unit_price);
                }
            }
        }

        /************************************
         * calcolo costo medio di acquisto 
         ***********************************/

        //trovo la somma di tutti i tassi
        for (var i = 0; i < n_elements.length; i++) {
            unit_cost = Banana.SDecimal.add(unit_cost, n_elements[i]);
        }
        //divido la somma per il numero di elementi.

        unit_cost = Banana.SDecimal.divide(unit_cost, n_elements.length);


        return unit_cost;

    }

    /**
     * this function calculates what percentage the amount represents with respect to the total of the portfolio 
     * @param {*} amount market value of the item
     * @param {*} group_name grouping item where I find the total of the portfolio 
     * @returns percentage of the portfolio represented by a given item
     */
    getItemPercOfPort(amount, group_name,market_value_ref_column) {
        let table = Banana.document.table("Items");
        let result = "";
        let group_total = "";
        if (!table) {
            return result;
        }
        for (var i = 0; i < table.rowCount; i++) {
            var tRow = table.row(i);
            if (tRow.value("Group") === group_name) {
                group_total = tRow.value(market_value_ref_column);
                if (group_total) {
                    /************************************************************************************
                     *calcolo che percentuale l'importo rappresenta rispetto al totale del portafoglio
                    formula: (ammontare (amount) currency current value /totale colonna currency current value)*100
                    ************************************************************************************/
                    result = Banana.SDecimal.divide(amount, group_total);
                    result = Banana.SDecimal.multiply(result, 100);

                    return result;
                }
            }
        }
    }

    getmarketVReferenceColumn(){
        let itemsColumn="";
        if(this.info.multiCurrency)
            itemsColumn="CurrencyCurrentValue";
        else
            itemsColumn="ValueCurrent";

        return itemsColumn;
    }

    /**
     * this function for each item calculates and returns the percentage that represents the gain/loss ratio
     * @param {*} market_value the item market value
     * @param {*} total_cost the item cost
     * @returns the percentage that represents the gain/loss ratio
     */
    getItemGLPerc(market_value, total_cost) {
        let perc_g_l = Banana.SDecimal.subtract(market_value, total_cost);
        perc_g_l = Banana.SDecimal.divide(perc_g_l, market_value);
        perc_g_l = Banana.SDecimal.multiply(perc_g_l, 100);

        return perc_g_l;

    }
    /**
     * this function for each total returns the sum of the percentages of the portfolios. 
     * @param {*} items array of items
     * @param {*} column_total_name the reference column for searching values 
     * @returns for each group returns the sum of the portfolio percentages of the various items
     */
    getPercOfPortfolioSum(items,column_total_name){
        let sum="";

        for (var key in items){
            if(items[key].gr===column_total_name){
                sum=Banana.SDecimal.add(sum,Banana.SDecimal.abs(items[key].perc_of_port));
            }
        }

        return sum;
    }

    /**
     * this function returns for every grouping the sum of the total cost
     * @param {*} items array of items
     * @param {*} column_total_name the reference column for searching values 
     * @returns the total cost sum
     */
    getTotalCostSum(items,column_total_name){
        let sum="";

        for (var key in items){
            if(items[key].gr===column_total_name){
                sum=Banana.SDecimal.add(sum,items[key].total_cost);
            }
        }

        return sum;
    }

    /**
     * this function returns for each grouping of unrealized profit/losses 
     * @param {*} items array of items
     * @param {*} column_total_name the reference column for searching values 
     * @returns  the unr gain/loss sum
     */
    getUnrealizedGainOrLossSum(items,column_total_name){
        let sum="";
        for (var key in items){
            if(items[key].gr===column_total_name){
                sum=Banana.SDecimal.add(sum,items[key].unrealized_gain_loss);
            }
        }

        return sum;
    }

    /**
     * this function calculates for each item the average of the G/L field %
     * @param {*} items array of items
     * @param {*} column_total_name 
     * @returns the g/l % average
     */
    getGLAverage(items,column_total_name){
        let average="";
        let number_of_elements=0;

        for (var key in items){
            if(items[key].gr===column_total_name){
                average=Banana.SDecimal.add(average,items[key].perc_g_l);
                number_of_elements++;
            }
        }
        average=Banana.SDecimal.divide(average,number_of_elements);


        return average;
    }
    /**
     * this function creates for each item an object and assigns values to each of its properties, each item is then inserted into an array.
     * @returns returns an array of items.
     */
    getReportRows() {
        let items = [];
        //get the list of the items in the Item table
        var marketVReferenceColumn=this.getmarketVReferenceColumn();
        var items_list = this.getTableValues("Items", "ItemsId");
        for (var i = 0; i < items_list.length; i++) {
            let item_data = {};
            item_data.name = items_list[i];
            item_data.quantity = this.getItemColumnValue(items_list[i], "QuantityCurrent");
            item_data.unit_cost = this.getItemUnitCost(items_list[i]);
            if(this.info.multiCurrency)
                item_data.currency=this.getItemColumnValue(items_list[i],"Currency");
            item_data.total_cost = Banana.SDecimal.multiply(item_data.quantity, item_data.unit_cost);
            item_data.market_price = this.getItemColumnValue(items_list[i], "UnitPriceCurrent");
            item_data.market_value = this.getItemColumnValue(items_list[i], marketVReferenceColumn);
            item_data.unrealized_gain_loss = Banana.SDecimal.subtract(item_data.market_value,item_data.total_cost);
            //è possibile fare in modo che l'utente inserisca il gruppo del totale, se personalizzato
            item_data.perc_of_port = this.getItemPercOfPort(item_data.market_value, "Total",marketVReferenceColumn);
            item_data.perc_g_l = this.getItemGLPerc(item_data.market_value, item_data.total_cost);

            //il gr lo uso solo come riferimento per quando ciclo i dati nel print report
            item_data.gr = this.getItemColumnValue(items_list[i], "Gr");

            items.push(item_data);

            //Banana.console.debug(item_data.perc_of_port);
        }

        return items
    }

    /**
     * this function creates for each grouping total of items an object and assigns values to each of its properties, each total is then inserted into an array.
     * @returns 
     */
    getReportRows_GroupTotals() {
        let items=this.getReportRows();
        var marketVReferenceColumn=this.getmarketVReferenceColumn();

        let items_total = [];
        var items_list_total = this.getTableValues("Items", "Group");
        for (var i = 0; i <= items_list_total.length - 1; i++) {
            let item_data_group_total = {};
            item_data_group_total.name = this.getItemColumnValue(items_list_total[i], "Group", true);
            item_data_group_total.total_cost = this.getTotalCostSum(items,item_data_group_total.name);
            item_data_group_total.market_value = this.getItemColumnValue(items_list_total[i], marketVReferenceColumn, true);
            item_data_group_total.unrealized_gain_loss = this.getUnrealizedGainOrLossSum(items,item_data_group_total.name);
            item_data_group_total.perc_of_port = this.getPercOfPortfolioSum(items,item_data_group_total.name);
            item_data_group_total.perc_g_l = this.getGLAverage(items,item_data_group_total.name);

            items_total.push(item_data_group_total);

        }

        return items_total;
    }


    getReportRows_FinalTotal(){
        let total={};
        let items_total=this.getReportRows_GroupTotals();

        for (var key in items_total) {
            total.name=qsTr("Totals: ");
            total.total_cost=Banana.SDecimal.add(total.total_cost,items_total[key].total_cost);
            total.market_value=Banana.SDecimal.add(total.market_value,items_total[key].market_value);
            total.perc_of_port=Banana.SDecimal.add(total.perc_of_port,items_total[key].perc_of_port);
            total.unrealized_gain_loss=Banana.SDecimal.add(total.unrealized_gain_loss,items_total[key].unrealized_gain_loss);
            total.perc_g_l=Banana.SDecimal.add(total.perc_g_l,items_total[key].perc_g_l);
        }

        return total;
    }


    toLocaleAmountFormat(value) {
        return Banana.Converter.toLocaleNumberFormat(value, 2, true);
    }


    /**
     *  Create the parameters of the settings dialog
     */
    convertParam(userParam) {

        var convertedParam = {};
        convertedParam.version = '1.0';
        /* array of script's parameters */
        convertedParam.data = [];

        var currentParam = {};
        currentParam.name = 'sort_items_by';
        currentParam.title = 'Sort Holdings by';
        currentParam.type = 'combobox';
        currentParam.items = ['Market Value','Percentage of Portfolio','Quantity'];
        currentParam.value = userParam.sort_items_by ? userParam.sort_items_by : userParam.sort_items_by;
        currentParam.editable = true;
        currentParam.readValue = function() {
            userParam.sort_items_by = this.value;
        }
        convertedParam.data.push(currentParam);

        return convertedParam;

    }

    getErrorMessage(errorId, lang) {
        if (!lang)
            lang = 'en';
        switch (errorId) {
            case this.ID_ERR_EXPERIMENTAL_REQUIRED:
                return "The Experimental version is required";
            case this.ID_ERR_LICENSE_NOTVALID:
                return "This extension requires Banana Accounting+ Advanced";
            case this.ID_ERR_VERSION_NOTSUPPORTED:
                if (lang == 'it')
                    return "Lo script non funziona con la vostra attuale versione di Banana Contabilità.\nVersione minimina richiesta: %1.\nPer aggiornare o per maggiori informazioni cliccare su Aiuto";
                else if (lang == 'fr')
                    return "Ce script ne s'exécute pas avec votre version actuelle de Banana Comptabilité.\nVersion minimale requise: %1.\nPour mettre à jour ou pour plus d'informations, cliquez sur Aide";
                else if (lang == 'de')
                    return "Das Skript wird mit Ihrer aktuellen Version von Banana Buchhaltung nicht ausgeführt.\nMindestversion erforderlich: %1.\nKlicken Sie auf Hilfe, um zu aktualisieren oder weitere Informationen zu bekommen";
                else
                    return "This script does not run with your current version of Banana Accounting.\nMinimum version required: %1.\nTo update or for more information click on Help";
        }
        return '';
    }

    getLang() {
        var lang = 'en';
        if (this.banDocument)
            lang = this.banDocument.locale;
        else if (Banana.application.locale)
            lang = Banana.application.locale;
        if (lang.length > 2)
            lang = lang.substr(0, 2);
        return lang;
    }

    isBananaAdvanced() {
        // Starting from version 10.0.7 it is possible to read the property Banana.application.license.isWithinMaxRowLimits 
        // to check if all application functionalities are permitted
        // the version Advanced returns isWithinMaxRowLimits always false
        // other versions return isWithinMaxRowLimits true if the limit of transactions number has not been reached

        if (Banana.compareVersion && Banana.compareVersion(Banana.application.version, "10.0.9") >= 0) {
            var license = Banana.application.license;
            if (license.licenseType === "advanced" || license.isWithinMaxFreeLines) {
                return true;
            }
        }

        return false;
    }

    bananaRequiredVersion(requiredVersion, expmVersion) {
        /**
         * Check Banana version
         */
        if (expmVersion) {
            requiredVersion = requiredVersion + "." + expmVersion;
        }
        if (Banana.compareVersion && Banana.compareVersion(Banana.application.version, requiredVersion) >= 0) {
            return true;
        }
        return false;
    }

    verifyBananaVersion() {
        if (!Banana.document)
            return false;

        var lang = this.getLang();

        var ban_version_min = "10.0.9";
        var ban_dev_version_min = "";
        var curr_version = this.bananaRequiredVersion(ban_version_min, ban_dev_version_min);
        var curr_license = this.isBananaAdvanced();

        if (!curr_version) {
            var msg = this.getErrorMessage(this.ID_ERR_VERSION_NOTSUPPORTED, lang);
            msg = msg.replace("%1", BAN_VERSION_MIN);
            Banana.document.addMessage(msg, this.ID_ERR_VERSION_NOTSUPPORTED);
            return false;
        }
        if (!curr_license) {
            var msg = getErrorMessage(this.ID_ERR_LICENSE_NOTVALID, lang);
            Banana.document.addMessage(msg, this.ID_ERR_LICENSE_NOTVALID);
            return false;
        }
        return true;
    }
}
/**
 * this function sorts the items according to what the user has chosen in the dialog 
 * @param {*} a 
 * @param {*} b 
 * @returns items ordered 
 */
    function compare(a,b){
    var savedParam = Banana.document.getScriptSettings();
    var userParam="";
    if (savedParam.length > 0) {
        userParam = JSON.parse(savedParam);
    }
    if(userParam){
        switch(userParam){
            case "Market Value":
                return b.market_value-a.market_value;
                break;
            case "Percentage of Portfolio":
                return b.perc_of_port-a.perc_of_port;
                break;
            case "Quantity":
                return b.quantity-a.quantity;
                break;
        }
    }
    else 
        return false;
}
function getComboBoxElement() {

    var market_value=qsTr("Market Value");
    var quantity=qsTr("Quantity");
    var perc_of_port=qsTr("Percentage of Portfolio");

    //The formeters of the period that we need

    var combobox_value = "";
    //Read script settings
    var data = Banana.document.getScriptSettings();

    //Check if there are previously saved settings and read them
    if (data.length > 0) {
        var readSettings = JSON.parse(data);
        //We check if "readSettings" is not null, then we fill the formeters with the values just read
        if (readSettings) {
            combobox_value = readSettings;
        }
    }
    //A dialog window is opened asking the user to insert the desired period. By default is the accounting period

    var selected_value = Banana.Ui.getItem("Sort by", "Choose a value", [market_value,quantity,perc_of_port], combobox_value, false);

    //We take the values entered by the user and save them as "new default" values.
    //This because the next time the script will be executed, the dialog window will contains the new values.
    if (selected_value) {
        combobox_value=selected_value;
        //Save script settings
        var valueToString = JSON.stringify(combobox_value);
        Banana.document.setScriptSettings(valueToString);
    } else {
        //User clicked cancel
        return;
    }
    return combobox_value;
}

function sumQt(cumulatedQuantity, quantity) {
    return Banana.SDecimal.add(quantity, cumulatedQuantity);
}

function exec(inData, options) {

    if (!Banana.document)
        return "@Cancel";

    var comboboxForm = getComboBoxElement();
    if (!comboboxForm)
        return;

    var portfolioManagement=new PortfolioManagement();

    if (!portfolioManagement.verifyBananaVersion()) {
        return "@Cancel";
    }

    var report = portfolioManagement.printReport();
    var stylesheet = portfolioManagement.getReportStyle();
    Banana.Report.preview(report, stylesheet);


}