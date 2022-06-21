/* User parameters update: 2022-06-07 */


function settingsDialog() {

  /*
    Update script's parameters
  */

  // Verify the banana version when user clicks on settings buttons
  var isCurrentBananaVersionSupported = bananaRequiredVersion(BAN_VERSION);
  if (isCurrentBananaVersionSupported) {

    isIntegratedInvoice();

    var userParam = initParam();
    var savedParam = Banana.document.getScriptSettings();
    if (savedParam.length > 0) {
      userParam = JSON.parse(savedParam);
    }
    userParam = verifyParam(userParam);
    if (typeof (Banana.Ui.openPropertyEditor) !== 'undefined') {
      var dialogTitle = 'Settings';
      var convertedParam = convertParam(userParam);
      var pageAnchor = 'dlgSettings';
      if (!Banana.Ui.openPropertyEditor(dialogTitle, convertedParam, pageAnchor)) {
        return;
      }
      for (var i = 0; i < convertedParam.data.length; i++) {
        // Read values to param (through the readValue function)
        if (!convertedParam.data[i].language) {
          convertedParam.data[i].readValue();
        }
        else {
          // For param with property "language" pass this language as parameter
          convertedParam.data[i].readValueLang(convertedParam.data[i].language);
        }
      }
    }
    var paramToString = JSON.stringify(userParam);
    var value = Banana.document.setScriptSettings(paramToString);
  }
}

function convertParam(userParam) {

  /*
    Create the parameters of the settings dialog
  */

  if (Banana.document.locale) {
    lang = Banana.document.locale;
  }
  if (lang.length > 2) {
    lang = lang.substr(0, 2);
  }
  var texts = setTexts(lang);

  var convertedParam = {};
  convertedParam.version = '1.0';
  convertedParam.data = [];

  var lengthDetailsColumns = "";
  var lengthDetailsTexts = "";


  /*******************************************************************************************
  * INCLUDE
  *******************************************************************************************/
  var currentParam = {};
  currentParam.name = 'include';
  currentParam.title = texts.include;
  currentParam.type = 'string';
  currentParam.value = '';
  currentParam.editable = false;
  currentParam.readValue = function() {
    userParam.include = this.value;
  }
  convertedParam.data.push(currentParam);



  /*******************************************************************************************
  * HEADER OF THE PAGE (LOGO + ADDRESS)
  *******************************************************************************************/
  currentParam = {};
  currentParam.name = 'header_include';
  currentParam.parentObject = 'include';
  currentParam.title = texts.header_include;
  currentParam.type = 'string';
  currentParam.value = '';
  currentParam.editable = false;
  currentParam.readValue = function() {
    userParam.header_include = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'header_print';
  currentParam.parentObject = 'header_include';
  currentParam.title = texts.header_print;
  currentParam.type = 'bool';
  currentParam.value = userParam.header_print ? true : false;
  currentParam.defaultvalue = true;
  currentParam.readValue = function() {
    userParam.header_print = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'header_address_from_accounting';
  currentParam.parentObject = 'header_include';
  currentParam.title = texts.header_address_from_accounting;
  currentParam.type = 'bool';
  currentParam.value = userParam.header_address_from_accounting ? true : false;
  currentParam.defaultvalue = true;
  currentParam.readValue = function() {
    userParam.header_address_from_accounting = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'header_row_1';
  currentParam.parentObject = 'header_include';
  currentParam.title = texts.header_row_1;
  currentParam.type = 'string';
  currentParam.value = userParam.header_row_1 ? userParam.header_row_1 : '';
  currentParam.defaultvalue = "";
  currentParam.readValue = function() {
    userParam.header_row_1 = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'header_row_2';
  currentParam.parentObject = 'header_include';
  currentParam.title = texts.header_row_2;
  currentParam.type = 'string';
  currentParam.value = userParam.header_row_2 ? userParam.header_row_2 : '';
  currentParam.defaultvalue = "";
  currentParam.readValue = function() {
    userParam.header_row_2 = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'header_row_3';
  currentParam.parentObject = 'header_include';
  currentParam.title = texts.header_row_3;
  currentParam.type = 'string';
  currentParam.value = userParam.header_row_3 ? userParam.header_row_3 : '';
  currentParam.defaultvalue = "";
  currentParam.readValue = function() {
    userParam.header_row_3 = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'header_row_4';
  currentParam.parentObject = 'header_include';
  currentParam.title = texts.header_row_4;
  currentParam.type = 'string';
  currentParam.value = userParam.header_row_4 ? userParam.header_row_4 : '';
  currentParam.defaultvalue = "";
  currentParam.readValue = function() {
    userParam.header_row_4 = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'header_row_5';
  currentParam.parentObject = 'header_include';
  currentParam.title = texts.header_row_5;
  currentParam.type = 'string';
  currentParam.value = userParam.header_row_5 ? userParam.header_row_5 : '';
  currentParam.defaultvalue = "";
  currentParam.readValue = function() {
    userParam.header_row_5 = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'logo_print';
  currentParam.parentObject = 'header_include';
  currentParam.title = texts.logo_print;
  currentParam.type = 'bool';
  currentParam.value = userParam.logo_print ? true : false;
  currentParam.defaultvalue = false;
  currentParam.readValue = function() {
    userParam.logo_print = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'logo_name';
  currentParam.parentObject = 'header_include';
  currentParam.title = texts.logo_name;
  currentParam.type = 'string';
  currentParam.value = userParam.logo_name ? userParam.logo_name : '';
  currentParam.defaultvalue = "Logo";
  currentParam.readValue = function() {
    userParam.logo_name = this.value;
  }
  convertedParam.data.push(currentParam);






  /*******************************************************************************************
  * CUSTOMER ADDRESS
  *******************************************************************************************/
  currentParam = {};
  currentParam.name = 'address_include';
  currentParam.parentObject = 'include';
  currentParam.title = texts.address_include;
  currentParam.type = 'string';
  currentParam.value = '';
  currentParam.editable = false;
  currentParam.readValue = function() {
    userParam.address_include = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'address_small_line';
  currentParam.parentObject = 'address_include';
  currentParam.title = texts.address_small_line;
  currentParam.type = 'string';
  currentParam.value = userParam.address_small_line ? userParam.address_small_line : '';
  currentParam.defaultvalue = '<none>';
  // currentParam.tooltip = // texts.tooltip_address_small_line;
  currentParam.readValue = function() {
   userParam.address_small_line = this.value;
  }
  convertedParam.data.push(currentParam);
  
  currentParam = {};
  currentParam.name = 'address_composition';
  currentParam.parentObject = 'address_include';
  currentParam.title = texts.address_composition;
  currentParam.type = 'multilinestring';
  currentParam.value = userParam.address_composition ? userParam.address_composition : '';
  currentParam.defaultvalue = '<OrganisationName>\n<NamePrefix>\n<FirstName> <FamilyName>\n<Street> <AddressExtra>\n<POBox>\n<PostalCode> <Locality>';
  // currentParam.tooltip = // texts.tooltip_address_composition;
  currentParam.readValue = function() {
    userParam.address_composition = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'address_left';
  currentParam.parentObject = 'address_include';
  currentParam.title = texts.address_left;
  currentParam.type = 'bool';
  currentParam.value = userParam.address_left ? true : false;
  currentParam.defaultvalue = false;
  // currentParam.tooltip = // texts.tooltip_address_left;
  currentParam.readValue = function() {
   userParam.address_left = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'address_position_dX';
  currentParam.parentObject = 'address_include';
  currentParam.title = texts.address_position_dX;
  currentParam.type = 'number';
  currentParam.value = userParam.address_position_dX ? userParam.address_position_dX : '0';
  currentParam.defaultvalue = '0';
  currentParam.readValue = function() {
    userParam.address_position_dX = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'address_position_dY';
  currentParam.parentObject = 'address_include';
  currentParam.title = texts.address_position_dY;
  currentParam.type = 'number';
  currentParam.value = userParam.address_position_dY ? userParam.address_position_dY : '0';
  currentParam.defaultvalue = '0';
  currentParam.readValue = function() {
    userParam.address_position_dY = this.value;
  }
  convertedParam.data.push(currentParam);

  if (IS_INTEGRATED_INVOICE) {
    currentParam = {};
    currentParam.name = 'shipping_address';
    currentParam.parentObject = 'address_include';
    currentParam.title = texts.shipping_address;
    currentParam.type = 'bool';
    currentParam.value = userParam.shipping_address ? true : false;
    currentParam.defaultvalue = false;
    // currentParam.tooltip = // texts.tooltip_shipping_address;
    currentParam.readValue = function() {
      userParam.shipping_address = this.value;
    }
    convertedParam.data.push(currentParam);
  }






  /*******************************************************************************************
  * INFORMATION
  *******************************************************************************************/
  currentParam = {};
  currentParam.name = 'info_include';
  currentParam.parentObject = 'include';
  currentParam.title = texts.info_include;
  currentParam.type = 'string';
  currentParam.value = '';
  currentParam.editable = false;
  currentParam.readValue = function() {
    userParam.info_include = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'info_invoice_number';
  currentParam.parentObject = 'info_include';
  currentParam.title = texts.info_invoice_number;
  currentParam.type = 'bool';
  currentParam.value = userParam.info_invoice_number ? true : false;
  currentParam.defaultvalue = true;
  // currentParam.tooltip = // texts.tooltip_info_invoice_number;
  currentParam.readValue = function() {
    userParam.info_invoice_number = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'info_date';
  currentParam.parentObject = 'info_include';
  currentParam.title = texts.info_date;
  currentParam.type = 'bool';
  currentParam.value = userParam.info_date ? true : false;
  currentParam.defaultvalue = true;
  // currentParam.tooltip = // texts.tooltip_info_date;
  currentParam.readValue = function() {
    userParam.info_date = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'info_order_number';
  currentParam.parentObject = 'info_include';
  currentParam.title = texts.info_order_number;
  currentParam.type = 'bool';
  currentParam.value = userParam.info_order_number ? true : false;
  currentParam.defaultvalue = false;
  // currentParam.tooltip = // texts.tooltip_info_order_number;
  currentParam.readValue = function() {
    userParam.info_order_number = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'info_order_date';
  currentParam.parentObject = 'info_include';
  currentParam.title = texts.info_order_date;
  currentParam.type = 'bool';
  currentParam.value = userParam.info_order_date ? true : false;
  currentParam.defaultvalue = false;
  // currentParam.tooltip = // texts.tooltip_info_order_date;
  currentParam.readValue = function() {
    userParam.info_order_date = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'info_customer';
  currentParam.parentObject = 'info_include';
  currentParam.title = texts.info_customer;
  currentParam.type = 'bool';
  currentParam.value = userParam.info_customer ? true : false;
  currentParam.defaultvalue = true;
  // currentParam.tooltip = // texts.tooltip_info_customer;
  currentParam.readValue = function() {
    userParam.info_customer = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'info_customer_vat_number';
  currentParam.parentObject = 'info_include';
  currentParam.title = texts.info_customer_vat_number;
  currentParam.type = 'bool';
  currentParam.value = userParam.info_customer_vat_number ? true : false;
  currentParam.defaultvalue = false;
  // currentParam.tooltip = // texts.tooltip_info_customer_vat_number;
  currentParam.readValue = function() {
    userParam.info_customer_vat_number = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'info_customer_fiscal_number';
  currentParam.parentObject = 'info_include';
  currentParam.title = texts.info_customer_fiscal_number;
  currentParam.type = 'bool';
  currentParam.value = userParam.info_customer_fiscal_number ? true : false;
  currentParam.defaultvalue = false;
  // currentParam.tooltip = // texts.tooltip_info_customer_fiscal_number;
  currentParam.readValue = function() {
    userParam.info_customer_fiscal_number = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'info_due_date';
  currentParam.parentObject = 'info_include';
  currentParam.title = texts.info_due_date;
  currentParam.type = 'bool';
  currentParam.value = userParam.info_due_date ? true : false;
  currentParam.defaultvalue = true;
  // currentParam.tooltip = // texts.tooltip_info_due_date;
  currentParam.readValue = function() {
    userParam.info_due_date = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'info_page';
  currentParam.parentObject = 'info_include';
  currentParam.title = texts.info_page;
  currentParam.type = 'bool';
  currentParam.value = userParam.info_page ? true : false;
  currentParam.defaultvalue = true;
  // currentParam.tooltip = // texts.tooltip_info_page;
  currentParam.readValue = function() {
    userParam.info_page = this.value;
  }
  convertedParam.data.push(currentParam);

  if (!IS_INTEGRATED_INVOICE) {
    currentParam = {};
    currentParam.name = 'info_custom_fields';
    currentParam.parentObject = 'info_include';
    currentParam.title = texts.info_custom_fields;
    currentParam.type = 'bool';
    currentParam.value = userParam.info_custom_fields ? true : false;
    currentParam.defaultvalue = false;
    // currentParam.tooltip = // texts.tooltip_info_custom_fields;
    currentParam.readValue = function() {
      userParam.info_custom_fields = this.value;
    }
    convertedParam.data.push(currentParam);
  } else {
    userParam.info_custom_fields = false;
  }




  /*******************************************************************************************
  * DETAILS
  *******************************************************************************************/
  currentParam = {};
  currentParam.name = 'details_include';
  currentParam.parentObject = 'include';
  currentParam.title = texts.details_include;
  currentParam.type = 'string';
  currentParam.value = '';
  currentParam.editable = false;
  currentParam.readValue = function() {
    userParam.details_include = this.value;
  }
  convertedParam.data.push(currentParam);


  if (Banana.compareVersion && Banana.compareVersion(Banana.application.version, "10.0.10.21348") >= 0) {
    /**
      Predefined columns.

      Integrated invoices and Estimates-Invoices:
        1. Description;Amount
        2. Description;Quantity;ReferenceUnit;UnitPrice;Amount
        3. Number;Description;Amount
        4. Number;Description;Quantity;ReferenceUnit;UnitPrice;Amount
        5. I.Links;Number;Description;Quantity;ReferenceUnit;UnitPrice;Amount (ADVANCED)
      Estimates-Invoices only:
        6. Description;Discount;Amount (ADVANCED)
        7. Description;Quantity;ReferenceUnit;UnitPrice;Discount;Amount (ADVANCED)
        8. Number;Date;Description;Quantity;ReferenceUnit;UnitPrice;Discount;Amount (ADVANCED)
     */
    var predefinedColumns = [];
    predefinedColumns.push(texts.predefined_columns_0);
    predefinedColumns.push(texts.predefined_columns_1);
    predefinedColumns.push(texts.predefined_columns_2);
    predefinedColumns.push(texts.predefined_columns_3);
    predefinedColumns.push(texts.predefined_columns_4);
    predefinedColumns.push(texts.predefined_columns_5);

    var predefinedColumnsEstInv = [];
    predefinedColumnsEstInv.push(texts.predefined_columns_6);
    predefinedColumnsEstInv.push(texts.predefined_columns_7);
    predefinedColumnsEstInv.push(texts.predefined_columns_8);

    var currentParam = {};
    currentParam.name = 'details_columns_predefined';
    currentParam.parentObject = 'details_include';
    currentParam.title = texts.details_columns_predefined;
    currentParam.type = 'combobox';
    if (IS_INTEGRATED_INVOICE) {
      currentParam.items = predefinedColumns;
    } else {
      currentParam.items = predefinedColumns.concat(predefinedColumnsEstInv);
    }
    currentParam.value = userParam.details_columns_predefined ? userParam.details_columns_predefined : '';
    currentParam.defaultvalue = texts.predefined_columns_0;
    // currentParam.tooltip = // texts.tooltip_details_columns_predefined;
    currentParam.readValue = function () {
      userParam.details_columns_predefined = this.value;
    }
    convertedParam.data.push(currentParam);
  }


  currentParam = {};
  currentParam.name = 'details_columns';
  currentParam.parentObject = 'details_include';
  currentParam.title = texts.details_columns;
  currentParam.type = 'string';
  currentParam.value = userParam.details_columns ? userParam.details_columns : '';
  currentParam.defaultvalue = 'Description;Quantity;ReferenceUnit;UnitPrice;Amount';
  // currentParam.tooltip = // texts.tooltip_details_columns;
  //take the number of columns
  lengthDetailsColumns = userParam.details_columns.split(";").length;
  currentParam.readValue = function() {
    userParam.details_columns = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'details_columns_widths';
  currentParam.parentObject = 'details_include';
  currentParam.title = texts.details_columns_widths;
  currentParam.type = 'string';
  currentParam.value = userParam.details_columns_widths ? userParam.details_columns_widths : '';
  currentParam.defaultvalue = '45%;10%;10%;20%;15%';
  // currentParam.tooltip = // texts.tooltip_details_columns_widths;
  currentParam.readValue = function() {
    userParam.details_columns_widths = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'details_columns_titles_alignment';
  currentParam.parentObject = 'details_include';
  currentParam.title = texts.details_columns_titles_alignment;
  currentParam.type = 'string';
  currentParam.value = userParam.details_columns_titles_alignment ? userParam.details_columns_titles_alignment : '';
  currentParam.defaultvalue = 'left;center;center;right;right';
  // currentParam.tooltip = // texts.tooltip_details_columns_titles_alignment;
  currentParam.readValue = function() {
    userParam.details_columns_titles_alignment = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'details_columns_alignment';
  currentParam.parentObject = 'details_include';
  currentParam.title = texts.details_columns_alignment;
  currentParam.type = 'string';
  currentParam.value = userParam.details_columns_alignment ? userParam.details_columns_alignment : '';
  currentParam.defaultvalue = 'left;right;center;right;right';
  // currentParam.tooltip = // texts.tooltip_details_columns_alignment;
  currentParam.readValue = function() {
    userParam.details_columns_alignment = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'details_gross_amounts';
  currentParam.parentObject = 'details_include';
  currentParam.title = texts.details_gross_amounts;
  currentParam.type = 'bool';
  currentParam.value = userParam.details_gross_amounts ? true : false;
  currentParam.defaultvalue = false;
  // currentParam.tooltip = // texts.tooltip_details_gross_amounts;
  currentParam.readValue = function() {
   userParam.details_gross_amounts = this.value;
  }
  convertedParam.data.push(currentParam);

  if (IS_INTEGRATED_INVOICE) {
    currentParam = {};
    currentParam.name = 'details_additional_descriptions';
    currentParam.parentObject = 'details_include';
    currentParam.title = texts.details_additional_descriptions;
    currentParam.type = 'bool';
    currentParam.value = userParam.details_additional_descriptions ? true : false;
    currentParam.defaultvalue = false;
    // currentParam.tooltip = // texts.tooltip_details_additional_descriptions;
    currentParam.readValue = function() {
     userParam.details_additional_descriptions = this.value;
    }
    convertedParam.data.push(currentParam);
  } else {
    userParam.details_additional_descriptions = false;
  }



  /*******************************************************************************************
  * FOOTER
  ********************************************************************************************/
  currentParam = {};
  currentParam.name = 'footer';
  currentParam.parentObject = 'include';
  currentParam.title = texts.footer;
  currentParam.type = 'string';
  currentParam.value = '';
  currentParam.editable = false;
  currentParam.readValue = function() {
    userParam.footer = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'footer_add';
  currentParam.parentObject = 'footer';
  currentParam.title = texts.footer_add;
  currentParam.type = 'bool';
  currentParam.value = userParam.footer_add ? true : false;
  currentParam.defaultvalue = false;
  currentParam.readValue = function() {
   userParam.footer_add = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'footer_horizontal_line';
  currentParam.parentObject = 'footer';
  currentParam.title = texts.footer_horizontal_line;
  currentParam.type = 'bool';
  currentParam.value = userParam.footer_horizontal_line ? true : false;
  currentParam.defaultvalue = true;
  currentParam.readValue = function() {
   userParam.footer_horizontal_line = this.value;
  }
  convertedParam.data.push(currentParam);
  




  /*******************************************************************************************
  * TEXTS
  ********************************************************************************************/
  currentParam = {};
  currentParam.name = 'texts';
  currentParam.title = texts.texts;
  currentParam.type = 'string';
  currentParam.value = '';
  currentParam.editable = false;
  currentParam.readValue = function() {
    userParam.texts = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'languages';
  currentParam.parentObject = 'texts';
  currentParam.title = texts.languages;
  currentParam.type = 'string';
  currentParam.value = userParam.languages ? userParam.languages : '';
  currentParam.defaultvalue = 'de;en;fr;it;nl;zh';
  // currentParam.tooltip = // texts.tooltip_languages;
  currentParam.readValue = function() {

    this.value = this.value.replace(/^\;|\;$/g,''); //removes ";" at the beginning/end of the string (i.e. ";de;en;it;" => "de;en;it")
    var before = userParam.languages; //languages before remove
    userParam.languages = this.value;
    var after = userParam.languages; //languages after remove
    if (before.length > after.length) { //one or more languages has been removed, ask to user to confirm
      var res = arrayDifferences(before,after);
      var answer = Banana.Ui.showQuestion("", texts.languages_remove.replace(/<removedLanguages>/g,res));
      if (!answer) {
        userParam.languages = before;
      }
    }
  }
  convertedParam.data.push(currentParam);


  // Parameters for each language
  langCodes = userParam.languages.toString().split(";");

  // removes the current lang from the position it is in, and then readds in front
  // the current document language is always on top
  if (langCodes.includes(lang)) {
    langCodes.splice(langCodes.indexOf(lang),1);
    langCodes.unshift(lang);
  } else { // the language of the document is not included in languages parameter, so english is used
    lang = 'en';
    langCodes.splice(langCodes.indexOf('en'),1);
    langCodes.unshift('en');
  }

  for (var i = 0; i < langCodes.length; i++) {
    var langCode = langCodes[i];
    if (langCode === "it" || langCode === "fr" || langCode === "de" || langCode === "nl" || langCode === "zh") {
      var langCodeTitle = langCode;
      var langTexts = setTexts(langCode);
    }
    else {
      var langCodeTitle = 'en';
      var langTexts = setTexts('en');
    }

    currentParam = {};
    currentParam.name = langCode;
    currentParam.parentObject = 'texts';
    currentParam.title = langCode;
    currentParam.type = 'string';
    currentParam.value = '';
    currentParam.editable = false;
    //Collapse when the language is not the same of the document language
    if (langCode === lang) {
      currentParam.collapse = false;
    } else {
      currentParam.collapse = true;
    }
    currentParam.readValue = function() {
      userParam['text_language_code'] = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = langCode+'_text_info_invoice_number';
    currentParam.parentObject = langCode;
    currentParam.title = langTexts[langCodeTitle+'_param_text_info_invoice_number'];
    currentParam.type = 'string';
    currentParam.value = userParam[langCode+'_text_info_invoice_number'] ? userParam[langCode+'_text_info_invoice_number'] : '';
    currentParam.defaultvalue = langTexts.invoice;
    // currentParam.tooltip = langTexts['param_tooltip_text_info_invoice_number'];
    currentParam.language = langCode;
    currentParam.readValueLang = function(langCode) {
      userParam[langCode+'_text_info_invoice_number'] = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = langCode+'_text_info_date';
    currentParam.parentObject = langCode;
    currentParam.title = langTexts[langCodeTitle+'_param_text_info_date'];
    currentParam.type = 'string';
    currentParam.value = userParam[langCode+'_text_info_date'] ? userParam[langCode+'_text_info_date'] : '';
    currentParam.defaultvalue = langTexts.date;
    // currentParam.tooltip = langTexts['param_tooltip_text_info_date'];
    currentParam.language = langCode;
    currentParam.readValueLang = function(langCode) {
      userParam[langCode+'_text_info_date'] = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = langCode+'_text_info_order_number';
    currentParam.parentObject = langCode;
    currentParam.title = langTexts[langCodeTitle+'_param_text_info_order_number'];
    currentParam.type = 'string';
    currentParam.value = userParam[langCode+'_text_info_order_number'] ? userParam[langCode+'_text_info_order_number'] : '';
    currentParam.defaultvalue = langTexts.order_number;
    // currentParam.tooltip = langTexts['param_tooltip_text_info_order_number'];
    currentParam.language = langCode;
    currentParam.readValueLang = function(langCode) {
      userParam[langCode+'_text_info_order_number'] = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = langCode+'_text_info_order_date';
    currentParam.parentObject = langCode;
    currentParam.title = langTexts[langCodeTitle+'_param_text_info_order_date'];
    currentParam.type = 'string';
    currentParam.value = userParam[langCode+'_text_info_order_date'] ? userParam[langCode+'_text_info_order_date'] : '';
    currentParam.defaultvalue = langTexts.order_date;
    // currentParam.tooltip = langTexts['param_tooltip_text_info_order_date'];
    currentParam.language = langCode;
    currentParam.readValueLang = function(langCode) {
      userParam[langCode+'_text_info_order_date'] = this.value;
    }
    convertedParam.data.push(currentParam);
    
    currentParam = {};
    currentParam.name = langCode+'_text_info_customer';
    currentParam.parentObject = langCode;
    currentParam.title = langTexts[langCodeTitle+'_param_text_info_customer'];
    currentParam.type = 'string';
    currentParam.value = userParam[langCode+'_text_info_customer'] ? userParam[langCode+'_text_info_customer'] : '';
    currentParam.defaultvalue = langTexts.customer;
    // currentParam.tooltip = langTexts['param_tooltip_text_info_customer'];
    currentParam.language = langCode;
    currentParam.readValueLang = function(langCode) {
      userParam[langCode+'_text_info_customer'] = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = langCode+'_text_info_customer_vat_number';
    currentParam.parentObject = langCode;
    currentParam.title = langTexts[langCodeTitle+'_param_text_info_customer_vat_number'];
    currentParam.type = 'string';
    currentParam.value = userParam[langCode+'_text_info_customer_vat_number'] ? userParam[langCode+'_text_info_customer_vat_number'] : '';
    currentParam.defaultvalue = langTexts.vat_number;
    // currentParam.tooltip = langTexts['param_tooltip_text_info_customer_vat_number'];
    currentParam.language = langCode;
    currentParam.readValueLang = function(langCode) {
      userParam[langCode+'_text_info_customer_vat_number'] = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = langCode+'_text_info_customer_fiscal_number';
    currentParam.parentObject = langCode;
    currentParam.title = langTexts[langCodeTitle+'_param_text_info_customer_fiscal_number'];
    currentParam.type = 'string';
    currentParam.value = userParam[langCode+'_text_info_customer_fiscal_number'] ? userParam[langCode+'_text_info_customer_fiscal_number'] : '';
    currentParam.defaultvalue = langTexts.fiscal_number;
    // currentParam.tooltip = langTexts['param_tooltip_text_info_customer_fiscal_number'];
    currentParam.language = langCode;
    currentParam.readValueLang = function(langCode) {
      userParam[langCode+'_text_info_customer_fiscal_number'] = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = langCode+'_text_info_due_date';
    currentParam.parentObject = langCode;
    currentParam.title = langTexts[langCodeTitle+'_param_text_info_due_date'];
    currentParam.type = 'string';
    currentParam.value = userParam[langCode+'_text_info_due_date'] ? userParam[langCode+'_text_info_due_date'] : '';
    currentParam.defaultvalue = langTexts.payment_terms_label;
    // currentParam.tooltip = langTexts['param_tooltip_text_payment_terms_label'];
    currentParam.language = langCode;
    currentParam.readValueLang = function(langCode) {
      userParam[langCode+'_text_info_due_date'] = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = langCode+'_text_info_page';
    currentParam.parentObject = langCode;
    currentParam.title = langTexts[langCodeTitle+'_param_text_info_page'];
    currentParam.type = 'string';
    currentParam.value = userParam[langCode+'_text_info_page'] ? userParam[langCode+'_text_info_page'] : '';
    currentParam.defaultvalue = langTexts.page;
    // currentParam.tooltip = langTexts['param_tooltip_text_info_page'];
    currentParam.language = langCode;
    currentParam.readValueLang = function(langCode) {
      userParam[langCode+'_text_info_page'] = this.value;
    }
    convertedParam.data.push(currentParam);

    if (IS_INTEGRATED_INVOICE) {
      currentParam = {};
      currentParam.name = langCode+'_text_shipping_address';
      currentParam.parentObject = langCode;
      currentParam.title = langTexts[langCodeTitle+'_param_text_shipping_address'];
      currentParam.type = 'string';
      currentParam.value = userParam[langCode+'_text_shipping_address'] ? userParam[langCode+'_text_shipping_address'] : '';
      currentParam.defaultvalue = langTexts.shipping_address;
      // currentParam.tooltip = langTexts['param_tooltip_text_shipping_address'];
      currentParam.language = langCode;
      currentParam.readValueLang = function(langCode) {
        userParam[langCode+'_text_shipping_address'] = this.value;
      }
      convertedParam.data.push(currentParam);
    }

    currentParam = {};
    currentParam.name = langCode+'_title_doctype_10';
    currentParam.parentObject = langCode;
    currentParam.title = langTexts[langCodeTitle+'_param_text_title_doctype_10'];
    currentParam.type = 'string';
    currentParam.value = userParam[langCode+'_title_doctype_10'] ? userParam[langCode+'_title_doctype_10'] : '';
    currentParam.defaultvalue = langTexts.invoice + " <DocInvoice>";
    // currentParam.tooltip = langTexts['param_tooltip_title_doctype_10'];
    currentParam.language = langCode;
    currentParam.readValueLang = function(langCode) {
      userParam[langCode+'_title_doctype_10'] = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = langCode+'_title_doctype_12';
    currentParam.parentObject = langCode;
    currentParam.title = langTexts[langCodeTitle+'_param_text_title_doctype_12'];
    currentParam.type = 'string';
    currentParam.value = userParam[langCode+'_title_doctype_12'] ? userParam[langCode+'_title_doctype_12'] : '';
    currentParam.defaultvalue = langTexts.credit_note  + " <DocInvoice>";
    // currentParam.tooltip = langTexts['param_tooltip_title_doctype_12'];
    currentParam.language = langCode;
    currentParam.readValueLang = function(langCode) {
      userParam[langCode+'_title_doctype_12'] = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = langCode+'_text_begin';
    currentParam.parentObject = langCode;
    currentParam.title = langTexts[langCodeTitle+'_param_text_begin'];
    currentParam.type = 'multilinestring';
    currentParam.value = userParam[langCode+'_text_begin'] ? userParam[langCode+'_text_begin'] : '';
    currentParam.defaultvalue = '';
    // currentParam.tooltip = langTexts['param_tooltip_text_begin'];
    currentParam.language = langCode;
    currentParam.readValueLang = function(langCode) {
      userParam[langCode+'_text_begin'] = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = langCode+'_text_details_columns';
    currentParam.parentObject = langCode;
    currentParam.title = langTexts[langCodeTitle+'_param_text_details_columns'];
    currentParam.type = 'string';
    currentParam.value = userParam[langCode+'_text_details_columns'] ? userParam[langCode+'_text_details_columns'] : '';
    currentParam.defaultvalue = langTexts.description+";"+langTexts.quantity+";"+langTexts.reference_unit+";"+langTexts.unit_price+";"+langTexts.amount;
    // currentParam.tooltip = langTexts['param_tooltip_text_details_columns'];
    currentParam.language = langCode;    
    // take the number of titles
    lengthDetailsTexts = userParam[langCode+'_text_details_columns'].split(";").length;
    if (lengthDetailsColumns != lengthDetailsTexts) {
      currentParam.errorMsg = "@error "+langTexts[langCodeTitle+'_error1_msg'];
    }

    currentParam.readValueLang = function(langCode) {
      userParam[langCode+'_text_details_columns'] = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = langCode+'_text_totalnet';
    currentParam.parentObject = langCode;
    currentParam.title = langTexts[langCodeTitle+'_param_text_totalnet'];
    currentParam.type = 'string';
    currentParam.value = userParam[langCode+'_text_totalnet'] ? userParam[langCode+'_text_totalnet'] : '';
    currentParam.defaultvalue = langTexts.totalnet;
    // currentParam.tooltip = langTexts['param_tooltip_text_totalnet'];
    currentParam.language = langCode;
    currentParam.readValueLang = function(langCode) {
      userParam[langCode+'_text_totalnet'] = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = langCode+'_text_vat';
    currentParam.parentObject = langCode;
    currentParam.title = langTexts[langCodeTitle+'_param_text_vat'];
    currentParam.type = 'string';
    currentParam.value = userParam[langCode+'_text_vat'] ? userParam[langCode+'_text_vat'] : '';
    currentParam.defaultvalue = langTexts.vat;
    // currentParam.tooltip = langTexts['param_tooltip_text_vat'];
    currentParam.language = langCode;
    currentParam.readValueLang = function(langCode) {
      userParam[langCode+'_text_vat'] = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = langCode+'_text_total';
    currentParam.parentObject = langCode;
    currentParam.title = langTexts[langCodeTitle+'_param_text_total'];
    currentParam.type = 'string';
    currentParam.value = userParam[langCode+'_text_total'] ? userParam[langCode+'_text_total'] : '';
    currentParam.defaultvalue = langTexts.total;
    // currentParam.tooltip = langTexts['param_tooltip_text_total'];
    currentParam.language = langCode;
    currentParam.readValueLang = function(langCode) {
      userParam[langCode+'_text_total'] = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = langCode+'_text_payment';
    currentParam.parentObject = langCode;
    currentParam.title = langTexts[langCodeTitle+'_param_text_payment'];
    currentParam.type = 'multilinestring';
    currentParam.value = userParam[langCode+'_text_payment'] ? userParam[langCode+'_text_payment'] : '';
    currentParam.defaultvalue = '';
    // currentParam.tooltip = langTexts['param_tooltip_text_payment'];
    currentParam.language = langCode;
    currentParam.readValueLang = function(langCode) {
      userParam[langCode+'_text_payment'] = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = langCode+'_text_final';
    currentParam.parentObject = langCode;
    currentParam.title = langTexts[langCodeTitle+'_param_text_final'];
    currentParam.type = 'multilinestring';
    currentParam.value = userParam[langCode+'_text_final'] ? userParam[langCode+'_text_final'] : '';
    currentParam.defaultvalue = '';
    // currentParam.tooltip = langTexts['param_tooltip_text_final'];
    currentParam.language = langCode;
    currentParam.readValueLang = function(langCode) {
      userParam[langCode+'_text_final'] = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = langCode+'_footer_left';
    currentParam.parentObject = langCode;
    currentParam.title = langTexts[langCodeTitle+'_param_footer_left'];
    currentParam.type = 'multilinestring';
    currentParam.value = userParam[langCode+'_footer_left'] ? userParam[langCode+'_footer_left'] : '';
    currentParam.defaultvalue = langTexts.invoice;
    // currentParam.tooltip = langTexts['param_tooltip_footer'];
    currentParam.language = langCode;
    currentParam.readValueLang = function(langCode) {
     userParam[langCode+'_footer_left'] = this.value;
    }
    convertedParam.data.push(currentParam);

    currentParam = {};
    currentParam.name = langCode+'_footer_center';
    currentParam.parentObject = langCode;
    currentParam.title = langTexts[langCodeTitle+'_param_footer_center'];
    currentParam.type = 'multilinestring';
    currentParam.value = userParam[langCode+'_footer_center'] ? userParam[langCode+'_footer_center'] : '';
    currentParam.defaultvalue = '';
    // currentParam.tooltip = langTexts['param_tooltip_footer'];
    currentParam.language = langCode;
    currentParam.readValueLang = function(langCode) {
     userParam[langCode+'_footer_center'] = this.value;
    }
    convertedParam.data.push(currentParam); 

    currentParam = {};
    currentParam.name = langCode+'_footer_right';
    currentParam.parentObject = langCode;
    currentParam.title = langTexts[langCodeTitle+'_param_footer_right'];
    currentParam.type = 'multilinestring';
    currentParam.value = userParam[langCode+'_footer_right'] ? userParam[langCode+'_footer_right'] : '';
    currentParam.defaultvalue = langTexts.page+' <'+langTexts.page+'>'
    // currentParam.tooltip = langTexts['param_tooltip_footer'];
    currentParam.language = langCode;
    currentParam.readValueLang = function(langCode) {
     userParam[langCode+'_footer_right'] = this.value;
    }
    convertedParam.data.push(currentParam);
  

    /*******************************************************************************************
    * ESTIMATE PARAMETERS
    ********************************************************************************************/
    if (!IS_INTEGRATED_INVOICE) {

      var currentParam = {};
      currentParam.name = langCode+'_offer';
      currentParam.parentObject = langCode;
      currentParam.title = langTexts.offer;
      currentParam.type = 'string';
      currentParam.value = '';
      currentParam.editable = false;
      currentParam.language = langCode;
      currentParam.readValueLang = function(langCode) {
      userParam.texts = this.value;
      }
      convertedParam.data.push(currentParam);

      currentParam = {};
      currentParam.name = langCode+'_text_info_offer_number';
      currentParam.parentObject = langCode+'_offer';
      currentParam.title = langTexts[langCodeTitle+'_param_text_info_offer_number'];
      currentParam.type = 'string';
      currentParam.value = userParam[langCode+'_text_info_offer_number'] ? userParam[langCode+'_text_info_offer_number'] : '';
      currentParam.defaultvalue = langTexts.offer;
      // currentParam.tooltip = langTexts['param_tooltip_text_info_offer_number'];
      currentParam.language = langCode;
      currentParam.readValueLang = function(langCode) {
      userParam[langCode+'_text_info_offer_number'] = this.value;
      }
      convertedParam.data.push(currentParam);

      currentParam = {};
      currentParam.name = langCode+'_text_info_date_offer';
      currentParam.parentObject = langCode+'_offer';
      currentParam.title = langTexts[langCodeTitle+'_param_text_info_date_offer'];
      currentParam.type = 'string';
      currentParam.value = userParam[langCode+'_text_info_date_offer'] ? userParam[langCode+'_text_info_date_offer'] : '';
      currentParam.defaultvalue = langTexts.date;
      // currentParam.tooltip = langTexts['param_tooltip_text_info_date_offer'];
      currentParam.language = langCode;
      currentParam.readValueLang = function(langCode) {
      userParam[langCode+'_text_info_date_offer'] = this.value;
      }
      convertedParam.data.push(currentParam);

      currentParam = {};
      currentParam.name = langCode+'_text_info_validity_date_offer';
      currentParam.parentObject = langCode+'_offer';
      currentParam.title = langTexts[langCodeTitle+'_param_text_info_validity_date_offer'];
      currentParam.type = 'string';
      currentParam.value = userParam[langCode+'_text_info_validity_date_offer'] ? userParam[langCode+'_text_info_validity_date_offer'] : '';
      currentParam.defaultvalue = langTexts.validity_terms_label;
      // currentParam.tooltip = langTexts['param_tooltip_text_info_validity_date_offer'];
      currentParam.language = langCode;
      currentParam.readValueLang = function(langCode) {
      userParam[langCode+'_text_info_validity_date_offer'] = this.value;
      }
      convertedParam.data.push(currentParam);

      currentParam = {};
      currentParam.name = langCode+'_title_doctype_17';
      currentParam.parentObject = langCode+'_offer';
      currentParam.title = langTexts[langCodeTitle+'_param_text_title_doctype_17'];
      currentParam.type = 'string';
      currentParam.value = userParam[langCode+'_title_doctype_17'] ? userParam[langCode+'_title_doctype_17'] : '';
      currentParam.defaultvalue = langTexts.offer  + " <DocInvoice>";
      // currentParam.tooltip = langTexts['param_tooltip_title_doctype_17'];
      currentParam.language = langCode;
      currentParam.readValueLang = function(langCode) {
      userParam[langCode+'_title_doctype_17'] = this.value;
      }
      convertedParam.data.push(currentParam);

      currentParam = {};
      currentParam.name = langCode+'_text_begin_offer';
      currentParam.parentObject = langCode+'_offer';
      currentParam.title = langTexts[langCodeTitle+'_param_text_begin_offer'];
      currentParam.type = 'multilinestring';
      currentParam.value = userParam[langCode+'_text_begin_offer'] ? userParam[langCode+'_text_begin_offer'] : '';
      currentParam.defaultvalue = '';
      // currentParam.tooltip = langTexts['param_tooltip_text_begin_offer'];
      currentParam.language = langCode;
      currentParam.readValueLang = function(langCode) {
      userParam[langCode+'_text_begin_offer'] = this.value;
      }
      convertedParam.data.push(currentParam);

      currentParam = {};
      currentParam.name = langCode+'_text_final_offer';
      currentParam.parentObject = langCode+'_offer';
      currentParam.title = langTexts[langCodeTitle+'_param_text_final_offer'];
      currentParam.type = 'multilinestring';
      currentParam.value = userParam[langCode+'_text_final_offer'] ? userParam[langCode+'_text_final_offer'] : '';
      currentParam.defaultvalue = '';
      // currentParam.tooltip = langTexts['param_tooltip_text_final_offer'];
      currentParam.language = langCode;
      currentParam.readValueLang = function(langCode) {
      userParam[langCode+'_text_final_offer'] = this.value;
      }
      convertedParam.data.push(currentParam);
    }

  }


  /*******************************************************************************************
  * STYLES
  *******************************************************************************************/
  currentParam = {};
  currentParam.name = 'styles';
  currentParam.title = texts.styles;
  currentParam.type = 'string';
  currentParam.value = '';
  currentParam.editable = false;
  currentParam.readValue = function() {
    userParam.styles = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'font_family';
  currentParam.parentObject = 'styles';
  currentParam.title = texts.font_family;
  currentParam.type = 'font';
  currentParam.value = userParam.font_family ? userParam.font_family : 'Helvetica';
  currentParam.defaultvalue = 'Helvetica';
  currentParam.readValue = function() {
   userParam.font_family = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'font_size';
  currentParam.parentObject = 'styles';
  currentParam.title = texts.font_size;
  currentParam.type = 'string';
  currentParam.value = userParam.font_size ? userParam.font_size : '10';
  currentParam.defaultvalue = '10';
  currentParam.readValue = function() {
   userParam.font_size = this.value;
  }
  convertedParam.data.push(currentParam);



  /*******************************************************************************************
  * COLORS
  *******************************************************************************************/
  currentParam = {};
  currentParam.name = 'colors';
  currentParam.title = texts.colors;
  currentParam.parentObject = '';
  currentParam.type = 'string';
  currentParam.value = '';
  currentParam.editable = false;
  currentParam.readValue = function() {
    userParam.colors = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'color_theme';
  currentParam.parentObject = 'colors';
  currentParam.title = texts.color_theme;
  currentParam.type = 'combobox';
  let colors = [];
  colors.push(texts.themecolor1);
  colors.push(texts.themecolor2);
  colors.push(texts.themecolor3);
  colors.push(texts.themecolor4);
  colors.push(texts.themecolor5);
  colors.push(texts.themecolor6);
  colors.push(texts.themecolor7);
  colors.push(texts.themecolor8);
  colors.push(texts.themecolor9);
  colors.push(texts.themecolor10);
  colors.push(texts.themecolor11);
  colors.push(texts.themecolor12);
  colors.push(texts.themecolor13);
  colors.push(texts.themecolorcustom);
  currentParam.items = colors;
  currentParam.value = userParam.color_theme ? userParam.color_theme : '';
  currentParam.defaultvalue = texts.themecolor1;
  currentParam.readValue = function() {
   userParam.color_theme = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'color_theme_custom';
  currentParam.parentObject = 'colors';
  currentParam.title = texts.color_theme_custom;
  currentParam.type = 'color';
  currentParam.value = userParam.color_theme_custom ? userParam.color_theme_custom : '#000000';
  //currentParam.defaultvalue = '#000000';
  currentParam.readValue = function() {
   userParam.color_theme_custom = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'color_header_text';
  currentParam.parentObject = 'colors';
  currentParam.title = texts.color_header_text;
  currentParam.type = 'color';
  currentParam.value = userParam.color_header_text ? userParam.color_header_text : '#000000';
  currentParam.defaultvalue = '#000000';
  currentParam.readValue = function() {
   userParam.color_header_text = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'color_label_text';
  currentParam.parentObject = 'colors';
  currentParam.title = texts.color_label_text;
  currentParam.type = 'color';
  currentParam.value = userParam.color_label_text ? userParam.color_label_text : '#000000';
  currentParam.defaultvalue = '#000000';
  currentParam.readValue = function() {
   userParam.color_label_text = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'color_title_text';
  currentParam.parentObject = 'colors';
  currentParam.title = texts.color_title_text;
  currentParam.type = 'color';
  currentParam.value = userParam.color_title_text ? userParam.color_title_text : '#000000';
  currentParam.defaultvalue = '#000000';
  currentParam.readValue = function() {
   userParam.color_title_text = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'color_background_details_header';
  currentParam.parentObject = 'colors';
  currentParam.title = texts.color_background_details_header;
  currentParam.type = 'color';
  currentParam.value = userParam.color_background_details_header ? userParam.color_background_details_header : '#FFFFFF';
  currentParam.defaultvalue = '#FFFFFF';
  currentParam.readValue = function() {
   userParam.color_background_details_header = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'color_details_header_text';
  currentParam.parentObject = 'colors';
  currentParam.title = texts.color_details_header_text;
  currentParam.type = 'color';
  currentParam.value = userParam.color_details_header_text ? userParam.color_details_header_text : '#000000';
  currentParam.defaultvalue = '#000000';
  currentParam.readValue = function() {
   userParam.color_details_header_text = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'color_background_alternate_lines';
  currentParam.parentObject = 'colors';
  currentParam.title = texts.color_background_alternate_lines;
  currentParam.type = 'color';
  currentParam.value = userParam.color_background_alternate_lines ? userParam.color_background_alternate_lines : '#FFFFFF';
  let hslColor = hexToHSL('#000000','','','95');
  let hexColor = HSLToHex(hslColor);
  currentParam.defaultvalue = hexColor
  currentParam.readValue = function() {
   userParam.color_background_alternate_lines = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'color_total_text';
  currentParam.parentObject = 'colors';
  currentParam.title = texts.color_total_text;
  currentParam.type = 'color';
  currentParam.value = userParam.color_total_text ? userParam.color_total_text : '#000000';
  currentParam.defaultvalue = '#000000';
  currentParam.readValue = function() {
   userParam.color_total_text = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'color_lines';
  currentParam.parentObject = 'colors';
  currentParam.title = texts.color_lines;
  currentParam.type = 'color';
  currentParam.value = userParam.color_lines ? userParam.color_lines : '#000000';
  currentParam.defaultvalue = '#000000';
  currentParam.readValue = function() {
   userParam.color_lines = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'color_total_line';
  currentParam.parentObject = 'colors';
  currentParam.title = texts.color_total_line;
  currentParam.type = 'color';
  currentParam.value = userParam.color_total_line ? userParam.color_total_line : '#000000';
  currentParam.defaultvalue = '#000000';
  currentParam.readValue = function() {
   userParam.color_total_line = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'color_text';
  currentParam.parentObject = 'colors';
  currentParam.title = texts.color_text;
  currentParam.type = 'color';
  currentParam.value = userParam.color_text ? userParam.color_text : '#000000';
  currentParam.defaultvalue = '#000000';
  currentParam.readValue = function() {
   userParam.color_text = this.value;
  }
  convertedParam.data.push(currentParam);



  /*******************************************************************************************
  * EMBEDDED JAVASCRIPT FILEE
  *******************************************************************************************/
  currentParam = {};
  currentParam.name = 'embedded_javascript';
  currentParam.title = texts.embedded_javascript;
  currentParam.type = 'string';
  currentParam.value = '';
  currentParam.editable = false;
  currentParam.readValue = function() {
    userParam.embedded_javascript = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'embedded_javascript_filename';
  currentParam.parentObject = 'embedded_javascript';
  currentParam.title = texts.embedded_javascript_filename;
  currentParam.type = 'string';
  currentParam.value = userParam.embedded_javascript_filename ? userParam.embedded_javascript_filename : '';
  currentParam.defaultvalue = '';
  // currentParam.tooltip = // texts.tooltip_javascript_filename;
  currentParam.readValue = function() {
   userParam.embedded_javascript_filename = this.value;
  }
  convertedParam.data.push(currentParam);

  currentParam = {};
  currentParam.name = 'css_code';
  currentParam.parentObject = 'embedded_javascript';
  currentParam.title = texts.css_code;
  currentParam.type = 'multilinestring';
  currentParam.value = userParam.css_code ? userParam.css_code : '';
  currentParam.defaultvalue = '';
  // currentParam.tooltip = // texts.tooltip_javascript_filename;
  currentParam.readValue = function() {
   userParam.css_code = this.value;
  }
  convertedParam.data.push(currentParam);


  return convertedParam;
}

function initParam() {

  /*
    Initialize the user parameters of the settings dialog
  */

  var userParam = {};

  if (Banana.document.locale) {
    lang = Banana.document.locale;
  }
  if (lang.length > 2) {
    lang = lang.substr(0, 2);
  }
  var texts = setTexts(lang);

  //Include
  userParam.header_print = true;
  userParam.header_row_1 = "";
  userParam.header_row_2 = "";
  userParam.header_row_3 = "";
  userParam.header_row_4 = "";
  userParam.header_row_5 = "";
  userParam.logo_print = false;
  userParam.logo_name = 'Logo';
  userParam.address_small_line = '<none>';
  userParam.address_left = false;
  userParam.address_composition = '<OrganisationName>\n<NamePrefix>\n<FirstName> <FamilyName>\n<Street> <AddressExtra>\n<POBox>\n<PostalCode> <Locality>';
  userParam.address_position_dX = '0';
  userParam.address_position_dY = '0';
  userParam.shipping_address = false;
  userParam.info_invoice_number = true;
  userParam.info_date = true;
  userParam.info_order_number = false;
  userParam.info_order_date = false;
  userParam.info_customer = true;
  userParam.info_customer_vat_number = false;
  userParam.info_customer_fiscal_number = false;
  userParam.info_due_date = true;
  userParam.info_page = true;
  userParam.info_custom_fields = false;
  userParam.details_columns_predefined = texts.predefined_columns_0;
  userParam.details_columns = 'Description;Quantity;ReferenceUnit;UnitPrice;Amount';
  userParam.details_columns_widths = '45%;10%;10%;20%;15%';
  userParam.details_columns_titles_alignment = 'left;right;center;right;right';
  userParam.details_columns_alignment = 'left;right;center;right;right';
  userParam.details_gross_amounts = false;
  userParam.details_additional_descriptions = false;
  userParam.footer_add = false;
  userParam.footer_horizontal_line = true;


  //Texts
  userParam.languages = 'de;en;fr;it;nl;zh';
  var langCodes = userParam.languages.toString().split(";");

  // Initialize the parameter for each language
  for (var i = 0; i < langCodes.length; i++) {

    // Use texts translations
    if (langCodes[i] === "it" || langCodes[i] === "fr" || langCodes[i] === "de" || langCodes[i] === "nl" || langCodes[i] === "zh") {
      var langTexts = setTexts(langCodes[i]);
    }
    else {
      var langTexts = setTexts('en');
    }
    userParam[langCodes[i]+'_text_info_invoice_number'] = langTexts.invoice;
    userParam[langCodes[i]+'_text_info_date'] = langTexts.date;
    userParam[langCodes[i]+'_text_info_order_number'] = langTexts.order_number;
    userParam[langCodes[i]+'_text_info_order_date'] = langTexts.order_date;
    userParam[langCodes[i]+'_text_info_customer'] = langTexts.customer;
    userParam[langCodes[i]+'_text_info_customer_vat_number'] = langTexts.vat_number;
    userParam[langCodes[i]+'_text_info_customer_fiscal_number'] = langTexts.fiscal_number;
    userParam[langCodes[i]+'_text_info_due_date'] = langTexts.payment_terms_label;
    userParam[langCodes[i]+'_text_info_page'] = langTexts.page;
    userParam[langCodes[i]+'_text_shipping_address'] = langTexts.shipping_address;
    userParam[langCodes[i]+'_title_doctype_10'] = langTexts.invoice + " <DocInvoice>";
    userParam[langCodes[i]+'_title_doctype_12'] = langTexts.credit_note + " <DocInvoice>";
    userParam[langCodes[i]+'_text_begin'] = '';
    userParam[langCodes[i]+'_text_details_columns'] = langTexts.description+";"+langTexts.quantity+";"+langTexts.reference_unit+";"+langTexts.unit_price+";"+langTexts.amount;
    userParam[langCodes[i]+'_text_totalnet'] = langTexts.totalnet;
    userParam[langCodes[i]+'_text_vat'] = langTexts.vat;
    userParam[langCodes[i]+'_text_total'] = langTexts.total;
    userParam[langCodes[i]+'_text_final'] = '';
    userParam[langCodes[i]+'_text_payment'] = '';
    userParam[langCodes[i]+'_footer_left'] = langTexts.invoice;
    userParam[langCodes[i]+'_footer_center'] = '';
    userParam[langCodes[i]+'_footer_right'] = langTexts.page+' <'+langTexts.page+'>';

    //Estimate parameters
    userParam[langCodes[i]+'_text_info_offer_number'] = langTexts.offer;
    userParam[langCodes[i]+'_text_info_date_offer'] = langTexts.date;
    userParam[langCodes[i]+'_text_info_validity_date_offer'] = langTexts.validity_terms_label;
    userParam[langCodes[i]+'_title_doctype_17'] = langTexts.offer + " <DocInvoice>";
    userParam[langCodes[i]+'_text_begin_offer'] = '';
    userParam[langCodes[i]+'_text_final_offer'] = '';

  }

  //Styles
  userParam.color_theme = texts.themecolor1;
  userParam.color_theme_custom = '#000000';
  userParam.color_header_text = '#000000';
  userParam.color_label_text = '#000000';
  userParam.color_title_text = '#000000';
  userParam.color_background_details_header = '#FFFFFF';
  userParam.color_details_header_text = '#000000';

  let hslColor = hexToHSL('#000000','','','95');
  let hexColor = HSLToHex(hslColor);
  userParam.color_background_alternate_lines = hexColor;
  
  userParam.color_total_text = '#000000';
  userParam.color_lines = '#000000';
  userParam.color_total_line = '#000000';
  userParam.color_text = '#000000';



  userParam.font_family = 'Helvetica';
  userParam.font_size = '10';

  //Embedded JavaScript/css file
  userParam.embedded_javascript_filename = '';
  userParam.css_code = '';

  return userParam;
}

function verifyParam(userParam) {

  /*
    Verify the user parameters of the settings dialog
  */

  if (Banana.document.locale) {
    lang = Banana.document.locale;
  }
  if (lang.length > 2) {
    lang = lang.substr(0, 2);
  }
  var texts = setTexts(lang);

  //Include
  if (!userParam.header_print) {
    userParam.header_print = false;
  }
  if(!userParam.header_row_1) {
    userParam.header_row_1 = '';
  }
  if(!userParam.header_row_2) {
    userParam.header_row_2 = '';
  }
  if(!userParam.header_row_3) {
    userParam.header_row_3 = '';
  }
  if(!userParam.header_row_4) {
    userParam.header_row_4 = '';
  }
  if(!userParam.header_row_5) {
    userParam.header_row_5 = '';
  }
  if (!userParam.logo_print) {
    userParam.logo_print = false;
  }
  if (!userParam.logo_name) {
    userParam.logo_name = 'Logo';
  }
  if (!userParam.address_small_line) {
    userParam.address_small_line = '';
  }
  if (!userParam.address_left) {
    userParam.address_left = false;
  }
  if (!userParam.address_composition) {
    userParam.address_composition = '<OrganisationName>\n<NamePrefix>\n<FirstName> <FamilyName>\n<Street> <AddressExtra>\n<POBox>\n<PostalCode> <Locality>';
  }
  if (!userParam.address_position_dX) {
    userParam.address_position_dX = '0';
  }
  if (!userParam.address_position_dY) {
    userParam.address_position_dY = '0';
  }
  if (!userParam.shipping_address) {
    userParam.shipping_address = false;
  }
  if (!userParam.info_invoice_number) {
    userParam.info_invoice_number = false;
  }
  if (!userParam.info_date) {
    userParam.info_date = false;
  }
  if (!userParam.info_order_number) {
    userParam.info_order_number = false;
  }
  if (!userParam.info_order_date) {
    userParam.info_order_date = false;
  }
  if (!userParam.info_customer) {
    userParam.info_customer = false;
  }
  if (!userParam.info_customer_vat_number) {
    userParam.info_customer_vat_number = false;
  }
  if (!userParam.info_customer_fiscal_number) {
    userParam.info_customer_fiscal_number = false;
  }
  if (!userParam.info_due_date) {
    userParam.info_due_date = false;
  }
  if (!userParam.info_page) {
    userParam.info_page = false;
  }
  if (!userParam.info_custom_fields) {
    userParam.info_custom_fields = false;
  }
  if (!userParam.details_columns_predefined) {
    userParam.details_columns_predefined = texts.predefined_columns_0;
  }
  if (!userParam.details_columns) {
    userParam.details_columns = 'Description;Quantity;ReferenceUnit;UnitPrice;Amount';
  }
  if (!userParam.details_columns_widths) {
    userParam.details_columns_widths = '45%;10%;10%;20%;15%';
  }
  if (!userParam.details_columns_titles_alignment) {
    userParam.details_columns_titles_alignment = 'left;right;center;right;right';
  }
  if (!userParam.details_columns_alignment) {
    userParam.details_columns_alignment = 'left;right;center;right;right';
  }
  if (!userParam.details_gross_amounts) {
    userParam.details_gross_amounts = false;
  }
  if (!userParam.details_additional_descriptions) {
    userParam.details_additional_descriptions = false;
  }
  if (!userParam.footer_add) {
    userParam.footer_add = false;
  }
  if (!userParam.footer_horizontal_line) {
    userParam.footer_horizontal_line = false;
  }

  //Texts
  if (!userParam.languages) {
    userParam.languages = 'de;en;fr;it;nl;zh';
  }

  // Verify the parameter for each language
  var langCodes = userParam.languages.toString().split(";");
  for (var i = 0; i < langCodes.length; i++) {
    var langTexts = setTexts(langCodes[i]);
        
    if (!userParam[langCodes[i]+'_text_info_invoice_number']) {
      userParam[langCodes[i]+'_text_info_invoice_number'] = langTexts.invoice;
    }
    if (!userParam[langCodes[i]+'_text_info_date']) {
      userParam[langCodes[i]+'_text_info_date'] = langTexts.date;
    }
    if (!userParam[langCodes[i]+'_text_info_order_number']) {
      userParam[langCodes[i]+'_text_info_order_number'] = langTexts.order_number;
    }
    if (!userParam[langCodes[i]+'_text_info_order_date']) {
      userParam[langCodes[i]+'_text_info_order_date'] = langTexts.order_date;
    }
    if (!userParam[langCodes[i]+'_text_info_customer']) {
      userParam[langCodes[i]+'_text_info_customer'] = langTexts.customer;
    }
    if (!userParam[langCodes[i]+'_text_info_customer_vat_number']) {
      userParam[langCodes[i]+'_text_info_customer_vat_number'] = langTexts.vat_number;
    }
    if (!userParam[langCodes[i]+'_text_info_customer_fiscal_number']) {
      userParam[langCodes[i]+'_text_info_customer_fiscal_number'] = langTexts.fiscal_number;
    }
    if (!userParam[langCodes[i]+'_text_info_due_date']) {
      userParam[langCodes[i]+'_text_info_due_date'] = langTexts.payment_terms_label;
    }
    if (!userParam[langCodes[i]+'_text_info_page']) {
      userParam[langCodes[i]+'_text_info_page'] = langTexts.page;
    }
    if (!userParam[langCodes[i]+'_text_shipping_address']) {
      userParam[langCodes[i]+'_text_shipping_address'] = langTexts.shipping_address;
    }
    if (!userParam[langCodes[i]+'_title_doctype_10']) {
      userParam[langCodes[i]+'_title_doctype_10'] = langTexts.invoice + " <DocInvoice>";
    }
    if (!userParam[langCodes[i]+'_title_doctype_12']) {
      userParam[langCodes[i]+'_title_doctype_12'] = langTexts.credit_note + " <DocInvoice>";
    }
    if (!userParam[langCodes[i]+'_text_begin']) {
      userParam[langCodes[i]+'_text_begin'] = "";
    }
    if (!userParam[langCodes[i]+'_text_details_columns']) {
      userParam[langCodes[i]+'_text_details_columns'] = langTexts.description+";"+langTexts.quantity+";"+langTexts.reference_unit+";"+langTexts.unit_price+";"+langTexts.amount;
    }
    if (!userParam[langCodes[i]+'_text_totalnet']) {
      userParam[langCodes[i]+'_text_totalnet'] = langTexts.totalnet;
    }
    if (!userParam[langCodes[i]+'_text_vat']) {
      userParam[langCodes[i]+'_text_vat'] = langTexts.vat;
    }
    if (!userParam[langCodes[i]+'_text_total']) {
      userParam[langCodes[i]+'_text_total'] = langTexts.total;
    }
    if (!userParam[langCodes[i]+'_text_final']) {
      userParam[langCodes[i]+'_text_final'] = "";
    }
    if (!userParam[langCodes[i]+'_text_payment']) {
      userParam[langCodes[i]+'_text_payment'] = "";
    }
    if (!userParam[langCodes[i]+'_footer_left']) {
      userParam[langCodes[i]+'_footer_left'] = langTexts.invoice;
    }
    if (!userParam[langCodes[i]+'_footer_center']) {
      userParam[langCodes[i]+'_footer_center'] = '';
    }
    if (!userParam[langCodes[i]+'_footer_right']) {
      userParam[langCodes[i]+'_footer_right'] = langTexts.page+' <'+langTexts.page+'>';
    }


    //Estimate parameters
    if (!userParam[langCodes[i]+'_text_info_offer_number']) {
      userParam[langCodes[i]+'_text_info_offer_number'] = langTexts.offer;
    }
    if (!userParam[langCodes[i]+'_text_info_date_offer']) {
      userParam[langCodes[i]+'_text_info_date_offer'] = langTexts.date;
    }
    if (!userParam[langCodes[i]+'_text_info_validity_date_offer']) {
      userParam[langCodes[i]+'_text_info_validity_date_offer'] = langTexts.validity_terms_label;
    }
    if (!userParam[langCodes[i]+'_title_doctype_17']) {
      userParam[langCodes[i]+'_title_doctype_17'] = langTexts.offer + " <DocInvoice>";
    }
    if (!userParam[langCodes[i]+'_text_begin_offer']) {
      userParam[langCodes[i]+'_text_begin_offer'] = "";
    }
    if (!userParam[langCodes[i]+'_text_final_offer']) {
      userParam[langCodes[i]+'_text_final_offer'] = "";
    }

  }


  // Styles
  if (!userParam.font_family) {
    userParam.font_family = 'Helvetica';
  }
  if (!userParam.font_size) {
    userParam.font_size = '10';
  }


  // Colors
  if (!userParam.color_theme) {
    userParam.color_theme = texts.themecolor1;
  }
  if (!userParam.color_theme_custom) {
    userParam.color_theme_custom = '#000000';
  }
  if (!userParam.color_header_text) {
    userParam.color_header_text = '#000000';
  }
  if (!userParam.color_label_text) {
    userParam.color_label_text = '#000000';
  }
  if (!userParam.color_title_text) {
    userParam.color_title_text = '#000000';
  }
  if (!userParam.color_background_details_header) { 
    userParam.color_background_details_header = '#FFFFFF';
  }
  if (!userParam.color_details_header_text) { 
    userParam.color_details_header_text = '#000000';
  }
  if (!userParam.color_background_alternate_lines) { 
    let hslColor = hexToHSL('#000000','','','95');
    let hexColor = HSLToHex(hslColor);
    userParam.color_background_alternate_lines = hexColor;
  }
  if (!userParam.color_total_text) { 
    userParam.color_total_text = '#000000';
  }
  if (!userParam.color_lines) { 
    userParam.color_lines = '#000000';
  }
  if (!userParam.color_total_line) { 
    userParam.color_total_line = '#000000';
  }
  if (!userParam.color_text) {
    userParam.color_text = '#000000';
  }


  //Embedded JavaScript files
  if (!userParam.embedded_javascript_filename) {
    userParam.embedded_javascript_filename = '';
  }
  if (!userParam.css_code) {
    userParam.css_code = '';
  }

  return userParam;
}









//====================================================================//
// Change parameters according to specific events
//====================================================================//

function onCurrentIndexChanged_details_columns_predefined(index, value, userParam) {
  /**
  * function called by combobox 'details_columns_predefined', event currentIndexChanged
  */
  
  // 1. Description;Amount
  // 2. Description;Quantity;ReferenceUnit;UnitPrice;Amount
  // 3. Number;Description;Amount
  // 4. Number;Description;Quantity;ReferenceUnit;UnitPrice;Amount
  // 5. I.Links;Number;Description;Quantity;ReferenceUnit;UnitPrice;Amount (ADVANCED)
  // 6. Description;Discount;Amount (ADVANCED)
  // 7. Description;Quantity;ReferenceUnit;UnitPrice;Discount;Amount (ADVANCED)
  // 8. Number;Date;Description;Quantity;ReferenceUnit;UnitPrice;Discount;Amount (ADVANCED)

  let texts = setTexts(lang);

  if (parseInt(index) == 1) {
    let answer = Banana.Ui.showQuestion(texts.style_change_confirm_title, texts.style_change_confirm_msg.replace("%1",texts.predefined_columns_1));
    if (!answer) {
      for (let i = 0; i < userParam.data.length; i++) {
        if (userParam.data[i].name === 'details_columns_predefined') {
          userParam.data[i].value = userParam.data[i].items[0];
        }
      }
      return userParam;
    }
    for (let i = 0; i < userParam.data.length; i++) {
      if (userParam.data[i].name === 'details_columns') {
        userParam.data[i].value = 'Description;Amount';
      }
      else if (userParam.data[i].name === 'details_columns_widths') {
        userParam.data[i].value = '80%;20%';
      }
      else if (userParam.data[i].name === 'details_columns_titles_alignment') {
        userParam.data[i].value = 'left;right';
      }
      else if (userParam.data[i].name === 'details_columns_alignment') {
        userParam.data[i].value = 'left;right';
      }
      else if (userParam.data[i].name === 'en_text_details_columns') {
        userParam.data[i].value = 'Description;Amount';
      }
      else if (userParam.data[i].name === 'it_text_details_columns') {
        userParam.data[i].value = 'Descrizione;Importo';
      }
      else if (userParam.data[i].name === 'de_text_details_columns') {
        userParam.data[i].value = 'Beschreibung;Betrag';
      }
      else if (userParam.data[i].name === 'fr_text_details_columns') {
        userParam.data[i].value = 'Libellé;Montant';
      }
      else if (userParam.data[i].name === 'nl_text_details_columns') {
        userParam.data[i].value = 'Beschrijving;Bedrag';
      }
      else if (userParam.data[i].name === 'zh_text_details_columns') {
        userParam.data[i].value = '摘要;金额';
      }
    }
  }
  else if (parseInt(index) == 2) {
    let answer = Banana.Ui.showQuestion(texts.style_change_confirm_title, texts.style_change_confirm_msg.replace("%1",texts.predefined_columns_2));
    if (!answer) {
      for (let i = 0; i < userParam.data.length; i++) {
        if (userParam.data[i].name === 'details_columns_predefined') {
          userParam.data[i].value = userParam.data[i].items[0];
        }
      }
      return userParam;
    }
    for (let i = 0; i < userParam.data.length; i++) {
      if (userParam.data[i].name === 'details_columns') {
        userParam.data[i].value = 'Description;Quantity;ReferenceUnit;UnitPrice;Amount';
      }
      else if (userParam.data[i].name === 'details_columns_widths') {
        userParam.data[i].value = '40%;15%;10%;20%;15%';
      }
      else if (userParam.data[i].name === 'details_columns_titles_alignment') {
        userParam.data[i].value = 'left;center;center;right;right';
      }
      else if (userParam.data[i].name === 'details_columns_alignment') {
        userParam.data[i].value = 'left;center;center;right;right';
      }
      else if (userParam.data[i].name === 'en_text_details_columns') {
        userParam.data[i].value = 'Description;Quantity;Unit;UnitPrice;Amount';
      }
      else if (userParam.data[i].name === 'it_text_details_columns') {
        userParam.data[i].value = 'Descrizione;Quantità;Unità;Prezzo Unità;Importo';
      }
      else if (userParam.data[i].name === 'de_text_details_columns') {
        userParam.data[i].value = 'Beschreibung;Menge;Einheit;Preiseinheit;Betrag';
      }
      else if (userParam.data[i].name === 'fr_text_details_columns') {
        userParam.data[i].value = 'Libellé;Quantité;Unité;Prix Unitaire;Montant';
      }
      else if (userParam.data[i].name === 'nl_text_details_columns') {
        userParam.data[i].value = 'Beschrijving;Hoeveelheid;Eenheid;Eenheidsprijs;Bedrag';
      }
      else if (userParam.data[i].name === 'zh_text_details_columns') {
        userParam.data[i].value = '摘要;数量;单位;单价;金额';
      }
    }
  }
  else if (parseInt(index) == 3) {
    let answer = Banana.Ui.showQuestion(texts.style_change_confirm_title, texts.style_change_confirm_msg.replace("%1",texts.predefined_columns_3));
    if (!answer) {
      for (let i = 0; i < userParam.data.length; i++) {
        if (userParam.data[i].name === 'details_columns_predefined') {
          userParam.data[i].value = userParam.data[i].items[0];
        }
      }
      return userParam;
    }
    for (let i = 0; i < userParam.data.length; i++) {
      if (userParam.data[i].name === 'details_columns') {
        userParam.data[i].value = 'Number;Description;Amount';
      }
      else if (userParam.data[i].name === 'details_columns_widths') {
        userParam.data[i].value = '20%;60%;20%';
      }
      else if (userParam.data[i].name === 'details_columns_titles_alignment') {
        userParam.data[i].value = 'left;left;right';
      }
      else if (userParam.data[i].name === 'details_columns_alignment') {
        userParam.data[i].value = 'left;left;right';
      }
      else if (userParam.data[i].name === 'en_text_details_columns') {
        userParam.data[i].value = 'Item;Description;Amount';
      }
      else if (userParam.data[i].name === 'it_text_details_columns') {
        userParam.data[i].value = 'Articolo;Descrizione;Importo';
      }
      else if (userParam.data[i].name === 'de_text_details_columns') {
        userParam.data[i].value = 'Artikel;Beschreibung;Betrag';
      }
      else if (userParam.data[i].name === 'fr_text_details_columns') {
        userParam.data[i].value = 'Article;Libellé;Montant';
      }
      else if (userParam.data[i].name === 'nl_text_details_columns') {
        userParam.data[i].value = 'Item;Beschrijving;Bedrag';
      }
      else if (userParam.data[i].name === 'zh_text_details_columns') {
        userParam.data[i].value = '物品;摘要;金额';
      }
    }
  }
  else if (parseInt(index) == 4) {
    let answer = Banana.Ui.showQuestion(texts.style_change_confirm_title, texts.style_change_confirm_msg.replace("%1",texts.predefined_columns_4));
    if (!answer) {
      for (let i = 0; i < userParam.data.length; i++) {
        if (userParam.data[i].name === 'details_columns_predefined') {
          userParam.data[i].value = userParam.data[i].items[0];
        }
      }
      return userParam;
    }
    for (let i = 0; i < userParam.data.length; i++) {
      if (userParam.data[i].name === 'details_columns') {
        userParam.data[i].value = 'Number;Description;Quantity;ReferenceUnit;UnitPrice;Amount';
      }
      else if (userParam.data[i].name === 'details_columns_widths') {
        userParam.data[i].value = '10%;30%;15%;10%;20%;15%';
      }
      else if (userParam.data[i].name === 'details_columns_titles_alignment') {
        userParam.data[i].value = 'left;left;center;center;right;right';
      }
      else if (userParam.data[i].name === 'details_columns_alignment') {
        userParam.data[i].value = 'left;left;center;center;right;right';
      }
      else if (userParam.data[i].name === 'en_text_details_columns') {
        userParam.data[i].value = 'Item;Description;Quantity;Unit;UnitPrice;Amount';
      }
      else if (userParam.data[i].name === 'it_text_details_columns') {
        userParam.data[i].value = 'Articolo;Descrizione;Quantità;Unità;Prezzo Unità;Importo';
      }
      else if (userParam.data[i].name === 'de_text_details_columns') {
        userParam.data[i].value = 'Artikel;Beschreibung;Menge;Einheit;Preiseinheit;Betrag';
      }
      else if (userParam.data[i].name === 'fr_text_details_columns') {
        userParam.data[i].value = 'Article;Libellé;Quantité;Unité;Prix Unitaire;Montant';
      }
      else if (userParam.data[i].name === 'nl_text_details_columns') {
        userParam.data[i].value = 'Item;Beschrijving;Hoeveelheid;Eenheid;Eenheidsprijs;Bedrag';
      }
      else if (userParam.data[i].name === 'zh_text_details_columns') {
        userParam.data[i].value = '物品;摘要;数量;单位;单价;金额';
      }
    }
  }
  else if (parseInt(index) == 5) {
    let answer = Banana.Ui.showQuestion(texts.style_change_confirm_title, texts.style_change_confirm_msg.replace("%1",texts.predefined_columns_5).replace(" (ADVANCED)",""));
    if (!answer) {
      for (let i = 0; i < userParam.data.length; i++) {
        if (userParam.data[i].name === 'details_columns_predefined') {
          userParam.data[i].value = userParam.data[i].items[0];
        }
      }
      return userParam;
    }
    for (let i = 0; i < userParam.data.length; i++) {
      if (userParam.data[i].name === 'details_columns') {
        userParam.data[i].value = 'I.Links;Number;Description;Quantity;ReferenceUnit;UnitPrice;Amount';
      }
      else if (userParam.data[i].name === 'details_columns_widths') {
        userParam.data[i].value = '12%;10%;23%;10%;10%;20%;15%';
      }
      else if (userParam.data[i].name === 'details_columns_titles_alignment') {
        userParam.data[i].value = 'left;left;left;right;center;right;right';
      }
      else if (userParam.data[i].name === 'details_columns_alignment') {
        userParam.data[i].value = 'left;left;left;right;center;right;right';
      }
      else if (userParam.data[i].name === 'en_text_details_columns') {
        userParam.data[i].value = 'Image;Item;Description;Quantity;Unit;Unit Price;Amount';
      }
      else if (userParam.data[i].name === 'it_text_details_columns') {
        userParam.data[i].value = 'Immagine;Articolo;Descrizione;Quantità;Unità;Prezzo Unità;Importo';
      }
      else if (userParam.data[i].name === 'de_text_details_columns') {
        userParam.data[i].value = 'Bild;Artikel;Beschreibung;Menge;Einheit;Preiseinheit;Betrag';
      }
      else if (userParam.data[i].name === 'fr_text_details_columns') {
        userParam.data[i].value = 'Image;Article;Libellé;Quantité;Unité;Prix Unitaire;Montant';
      }
      else if (userParam.data[i].name === 'nl_text_details_columns') {
        userParam.data[i].value = 'Afbeelding Item;Item;Beschrijving;Hoeveelheid;Eenheid;Eenheidsprijs;Bedrag';
      }
      else if (userParam.data[i].name === 'zh_text_details_columns') {
        userParam.data[i].value = '物品图片;物品;摘要;数量;单位;单价;金额';
      }
    }
  }
  else if (parseInt(index) == 6 && !IS_INTEGRATED_INVOICE) {
    let answer = Banana.Ui.showQuestion(texts.style_change_confirm_title, texts.style_change_confirm_msg.replace("%1",texts.predefined_columns_6).replace(" (ADVANCED)",""));
    if (!answer) {
      for (let i = 0; i < userParam.data.length; i++) {
        if (userParam.data[i].name === 'details_columns_predefined') {
          userParam.data[i].value = userParam.data[i].items[0];
        }
      }
      return userParam;
    }
    for (let i = 0; i < userParam.data.length; i++) {
      if (userParam.data[i].name === 'details_columns') {
        userParam.data[i].value = 'Description;Discount;Amount';
      }
      else if (userParam.data[i].name === 'details_columns_widths') {
        userParam.data[i].value = '60%;20%;20%';
      }
      else if (userParam.data[i].name === 'details_columns_titles_alignment') {
        userParam.data[i].value = 'left;right;right';
      }
      else if (userParam.data[i].name === 'details_columns_alignment') {
        userParam.data[i].value = 'left;right;right';
      }
      else if (userParam.data[i].name === 'en_text_details_columns') {
        userParam.data[i].value = 'Description;Discount;Amount';
      }
      else if (userParam.data[i].name === 'it_text_details_columns') {
        userParam.data[i].value = 'Descrizione;Sconto;Importo';
      }
      else if (userParam.data[i].name === 'de_text_details_columns') {
        userParam.data[i].value = 'Beschreibung;Rabatt;Betrag';
      }
      else if (userParam.data[i].name === 'fr_text_details_columns') {
        userParam.data[i].value = 'Libellé;Rabais;Montant';
      }
      else if (userParam.data[i].name === 'nl_text_details_columns') {
        userParam.data[i].value = 'Beschrijving;Korting;Bedrag';
      }
      else if (userParam.data[i].name === 'zh_text_details_columns') {
        userParam.data[i].value = '摘要;折扣;金额';
      }
    }
  }
  else if (parseInt(index) == 7 && !IS_INTEGRATED_INVOICE) {
    let answer = Banana.Ui.showQuestion(texts.style_change_confirm_title, texts.style_change_confirm_msg.replace("%1",texts.predefined_columns_7).replace(" (ADVANCED)",""));
    if (!answer) {
      for (let i = 0; i < userParam.data.length; i++) {
        if (userParam.data[i].name === 'details_columns_predefined') {
          userParam.data[i].value = userParam.data[i].items[0];
        }
      }
      return userParam;
    }
    for (let i = 0; i < userParam.data.length; i++) {
      if (userParam.data[i].name === 'details_columns') {
        userParam.data[i].value = 'Description;Quantity;ReferenceUnit;UnitPrice;Discount;Amount';
      }
      else if (userParam.data[i].name === 'details_columns_widths') {
        userParam.data[i].value = '30%;10%;10%;20%;15%;15%';
      }
      else if (userParam.data[i].name === 'details_columns_titles_alignment') {
        userParam.data[i].value = 'left;center;center;right;right;right';
      }
      else if (userParam.data[i].name === 'details_columns_alignment') {
        userParam.data[i].value = 'left;center;center;right;right;right';
      }
      else if (userParam.data[i].name === 'en_text_details_columns') {
        userParam.data[i].value = 'Description;Quantity;Unit;Unit Price;Discount;Amount';
      }
      else if (userParam.data[i].name === 'it_text_details_columns') {
        userParam.data[i].value = 'Descrizione;Quantità;Unità;Prezzo Unità;Sconto;Importo';
      }
      else if (userParam.data[i].name === 'de_text_details_columns') {
        userParam.data[i].value = 'Beschreibung;Menge;Einheit;Preiseinheit;Rabatt;Betrag';
      }
      else if (userParam.data[i].name === 'fr_text_details_columns') {
        userParam.data[i].value = 'Libellé;Quantité;Unité;Prix Unitaire;Rabais;Montant';
      }
      else if (userParam.data[i].name === 'nl_text_details_columns') {
        userParam.data[i].value = 'Beschrijving;Hoeveelheid;Eenheid;Eenheidsprijs;Korting;Bedrag';
      }
      else if (userParam.data[i].name === 'zh_text_details_columns') {
        userParam.data[i].value = '摘要;数量;单位;单价;折扣;金额';
      }
    }
  }
  else if (parseInt(index) == 8 && !IS_INTEGRATED_INVOICE) {
    let answer = Banana.Ui.showQuestion(texts.style_change_confirm_title, texts.style_change_confirm_msg.replace("%1",texts.predefined_columns_8).replace(" (ADVANCED)",""));
    if (!answer) {
      for (let i = 0; i < userParam.data.length; i++) {
        if (userParam.data[i].name === 'details_columns_predefined') {
          userParam.data[i].value = userParam.data[i].items[0];
        }
      }
      return userParam;
    }
    for (let i = 0; i < userParam.data.length; i++) {
      if (userParam.data[i].name === 'details_columns') {
        userParam.data[i].value = 'Number;Date;Description;Quantity;ReferenceUnit;UnitPrice;Discount;Amount';
      }
      else if (userParam.data[i].name === 'details_columns_widths') {
        userParam.data[i].value = '8%;12%;20%;10%;8%;20%;10%;12%';
      }
      else if (userParam.data[i].name === 'details_columns_titles_alignment') {
        userParam.data[i].value = 'left;center;left;right;center;right;right;right';
      }
      else if (userParam.data[i].name === 'details_columns_alignment') {
        userParam.data[i].value = 'left;center;left;right;center;right;right;right';
      }
      else if (userParam.data[i].name === 'en_text_details_columns') {
        userParam.data[i].value = 'Item;Date;Description;Quantity;Unit;Unit Price;Discount;Amount';
      }
      else if (userParam.data[i].name === 'it_text_details_columns') {
        userParam.data[i].value = 'Articolo;Data;Descrizione;Quantità;Unità;Prezzo Unità;Sconto;Importo';
      }
      else if (userParam.data[i].name === 'de_text_details_columns') {
        userParam.data[i].value = 'Artikel;Datum;Beschreibung;Menge;Einheit;Preiseinheit;Rabatt;Betrag';
      }
      else if (userParam.data[i].name === 'fr_text_details_columns') {
        userParam.data[i].value = 'Article;Date;Libellé;Quantité;Unité;Prix Unitaire;Rabais;Montant';
      }
      else if (userParam.data[i].name === 'nl_text_details_columns') {
        userParam.data[i].value = 'Item;Datum;Beschrijving;Hoeveelheid;Eenheid;Eenheidsprijs;Korting;Bedrag';
      }
      else if (userParam.data[i].name === 'zh_text_details_columns') {
        userParam.data[i].value = '物品;日期;摘要;数量;单位;单价;折扣;金额';
      }
    }
  }

  return userParam;
}

function onCurrentIndexChanged_color_theme(index, value, userParam) {

  /**
   * 
   * When a theme color is selected, we change all the colors in the parameters
   * 
   */

  let black = '#000000';
  let blue = '#3081b6';
  let green = '#2fae63';
  let orange = '#fa6f56';
  let red = '#bd3a31';
  let teal = '#0e685c';
  let purple = '#795a9d';
  let lightblue = '#3c8fea';
  let indigo = '#124a9e';
  let pink = '#cd3c5a';
  let brown = '#895a48';
  let bluegray = '#4d5972';
  let greensea = '#23a084';
  // let banana = '#354894'; // #FFE01B




  let color = "";

  // Black
  if (parseInt(index) == 0) {
    color = black;
  }

  // Blue
  else if (parseInt(index) == 1) {
    color = blue;
  }

  // Green
  else if (parseInt(index) == 2) {
    color = green;
  }

  // Orange
  else if (parseInt(index) == 3) {
    color = orange;
  }

  // Red
  else if (parseInt(index) == 4) {
    color = red;
  }

  // Teal
  else if (parseInt(index) == 5) {
    color = teal;
  }

  // Purple
  else if (parseInt(index) == 6) {
    color = purple;
  }

  // Light blue
  else if (parseInt(index) == 7) {
    color = lightblue;
  }

  // Indigo
  else if (parseInt(index) == 8) {
    color = indigo;
  }

  // Pink
  else if (parseInt(index) == 9) {
    color = pink;
  }

  // Brown
  else if (parseInt(index) == 10) {
    color = brown;
  }

  // Blue gray
  else if (parseInt(index) == 11) {
    color = bluegray;
  }

  // Green sea
  else if (parseInt(index) == 12) {
    color = greensea;
  }

  // Custom color
  // Always last choice in combobox
  else if (parseInt(index) == 13) {

    for (let i = 0; i < userParam.data.length; i++) {
      if (userParam.data[i].name === 'color_theme_custom') {
        color = userParam.data[i].value;
      }
    }
  }

  // Set the color
  for (let i = 0; i < userParam.data.length; i++) {

    if (userParam.data[i].name === 'color_theme_custom') {
      userParam.data[i].value = color;
    }
    else if (userParam.data[i].name === 'color_header_text') {
      userParam.data[i].value = '#000000';
    }
    else if (userParam.data[i].name === 'color_label_text') {
      userParam.data[i].value = '#000000';
    }
    else if(userParam.data[i].name === 'color_title_text') {
      userParam.data[i].value = color;
    }
    else if(userParam.data[i].name === 'color_background_details_header') {
      // userParam.data[i].value = color;
      userParam.data[i].value = '#FFFFFF';
    }
    else if(userParam.data[i].name === 'color_details_header_text') {
      // userParam.data[i].value = getContrast(color);
      userParam.data[i].value = color;
    }
    else if(userParam.data[i].name === 'color_background_alternate_lines') {
      let hslColor = hexToHSL(color,'','','95');
      let hexColor = HSLToHex(hslColor);
      userParam.data[i].value = hexColor;
    }
    else if(userParam.data[i].name === 'color_total_text') {
      userParam.data[i].value = '#000000';
    }
    else if(userParam.data[i].name === 'color_lines') {
      userParam.data[i].value = color;
    }
    else if(userParam.data[i].name === 'color_total_line') {
      userParam.data[i].value = '#000000';
    }
    else if(userParam.data[i].name === 'color_text') {
      userParam.data[i].value = '#000000';
    }
  }

  return userParam;
}

function onCurrentIndexChanged_color_theme_custom(index, value, userParam) {
  /**
   * When the custom color is changed, we change all the colors in the parameters
   * 
   * Only when the "Custom" color option is selected in the combobox.
   */

  let texts = setTexts(lang);
  let colorTheme = "";
  let color = "";

  for (let i = 0; i < userParam.data.length; i++) {
    if (userParam.data[i].name === 'color_theme') {
      colorTheme = userParam.data[i].value;
    }
  }

  for (let i = 0; i < userParam.data.length; i++) {
    if (userParam.data[i].name === 'color_theme_custom') {
      color = userParam.data[i].value;
    }
  }

  if (colorTheme === texts.themecolorcustom) {

    for (let i = 0; i < userParam.data.length; i++) {

      if (userParam.data[i].name === 'color_header_text') {
        userParam.data[i].value = '#000000';
      }
      else if (userParam.data[i].name === 'color_label_text') {
        userParam.data[i].value = color;
      }
      else if(userParam.data[i].name === 'color_title_text') {
        userParam.data[i].value = color;
      }
      else if(userParam.data[i].name === 'color_background_details_header') {
        userParam.data[i].value = '#FFFFFF';
      }
      else if(userParam.data[i].name === 'color_details_header_text') {
        userParam.data[i].value = color;
      }
      else if(userParam.data[i].name === 'color_background_alternate_lines') {
        let hslColor = hexToHSL(color,'','','95');
        let hexColor = HSLToHex(hslColor);
        userParam.data[i].value = hexColor;
      }
      else if(userParam.data[i].name === 'color_total_text') {
        userParam.data[i].value = color;
      }
      else if(userParam.data[i].name === 'color_lines') {
        userParam.data[i].value = color;
      }
      else if(userParam.data[i].name === 'color_total_line') {
        userParam.data[i].value = '#000000';
      }
      else if(userParam.data[i].name === 'color_text') {
        userParam.data[i].value = '#000000';
      }
    }
  }

  return userParam;
}

function onCurrentIndexChanged_color_header_text(index, value, userParam) {

  /**
   * When the predefined color is changed, change the combobox item to "Custom"
   */

  let texts = setTexts(lang);

  for (let i = 0; i < userParam.data.length; i++) {

    if (userParam.data[i].name === 'color_theme') {
      userParam.data[i].value = texts.themecolorcustom;
    }
  }

  return userParam;
}

function onCurrentIndexChanged_color_label_text(index, value, userParam) {

  /**
   * When the predefined color is changed, change the combobox item to "Custom"
   */

  let texts = setTexts(lang);

  for (let i = 0; i < userParam.data.length; i++) {

    if (userParam.data[i].name === 'color_theme') {
      userParam.data[i].value = texts.themecolorcustom;
    }
  }

  return userParam;
}

function onCurrentIndexChanged_color_title_text(index, value, userParam) {

  /**
   * When the predefined color is changed, change the combobox item to "Custom"
   */

  let texts = setTexts(lang);

  for (let i = 0; i < userParam.data.length; i++) {

    if (userParam.data[i].name === 'color_theme') {
      userParam.data[i].value = texts.themecolorcustom;
    }
  }

  return userParam;
}

function onCurrentIndexChanged_color_background_details_header(index, value, userParam) {

  /**
   * When the predefined color is changed, change the combobox item to "Custom"
   */

  let texts = setTexts(lang);

  for (let i = 0; i < userParam.data.length; i++) {

    if (userParam.data[i].name === 'color_theme') {
      userParam.data[i].value = texts.themecolorcustom;
    }
  }

  return userParam;
}

function onCurrentIndexChanged_color_details_header_text(index, value, userParam) {

  /**
   * When the predefined color is changed, change the combobox item to "Custom"
   */

  let texts = setTexts(lang);

  for (let i = 0; i < userParam.data.length; i++) {

    if (userParam.data[i].name === 'color_theme') {
      userParam.data[i].value = texts.themecolorcustom;
    }
  }

  return userParam;
}

function onCurrentIndexChanged_color_background_alternate_lines(index, value, userParam) {

  /**
   * When the predefined color is changed, change the combobox item to "Custom"
   */

  let texts = setTexts(lang);

  for (let i = 0; i < userParam.data.length; i++) {

    if (userParam.data[i].name === 'color_theme') {
      userParam.data[i].value = texts.themecolorcustom;
    }
  }

  return userParam;
}

function onCurrentIndexChanged_color_lines(index, value, userParam) {

  /**
   * When the predefined color is changed, change the combobox item to "Custom"
   */

  let texts = setTexts(lang);

  for (let i = 0; i < userParam.data.length; i++) {

    if (userParam.data[i].name === 'color_theme') {
      userParam.data[i].value = texts.themecolorcustom;
    }
  }

  return userParam;
}

function onCurrentIndexChanged_color_total_line(index, value, userParam) {

  /**
   * When the predefined color is changed, change the combobox item to "Custom"
   */

  let texts = setTexts(lang);

  for (let i = 0; i < userParam.data.length; i++) {

    if (userParam.data[i].name === 'color_theme') {
      userParam.data[i].value = texts.themecolorcustom;
    }
  }

  return userParam;
}

function onCurrentIndexChanged_color_total_text(index, value, userParam) {

  /**
   * When the predefined color is changed, change the combobox item to "Custom"
   */

  let texts = setTexts(lang);

  for (let i = 0; i < userParam.data.length; i++) {

    if (userParam.data[i].name === 'color_theme') {
      userParam.data[i].value = texts.themecolorcustom;
    }
  }

  return userParam;
}

function onCurrentIndexChanged_color_text(index, value, userParam) {

  /**
   * When the predefined color is changed, change the combobox item to "Custom"
   */

  let texts = setTexts(lang);

  for (let i = 0; i < userParam.data.length; i++) {

    if (userParam.data[i].name === 'color_theme') {
      userParam.data[i].value = texts.themecolorcustom;
    }
  }

  return userParam;
}




