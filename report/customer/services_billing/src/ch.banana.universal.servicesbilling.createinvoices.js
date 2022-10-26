// Copyright [2022] [Banana.ch SA - Lugano Switzerland]
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
//
// @id = ch.banana.universal.servicesbilling.createinvoices.js
// @api = 1.0
// @pubdate = 2021-10-06
// @publisher = Banana.ch SA
// @description = Create invoices
// @description.it = Crea fatture
// @description.fr = Créer factures
// @description.de = Rechnungen erstellen
// @doctype = 400.400
// @encoding = utf-8
// @task = app.command
// @timeout = -1

/*
 *   SUMMARY
 *   Create invoices from services table
 */

function exec() {

    var banDoc = Banana.document;

    if (!banDoc)
        return "@Cancel";

    if (!verifyBananaVersion())
        return "@Cancel";

    let invoicesRows = [];
    let servicesRows = [];
    let invoiceObj = createDocChangeRows(invoicesRows, servicesRows);

    var docChange = {
        format: "documentChange",
        error: "",
        data:[
            {
                document: {
                    dataUnits: [
                        {
                            nameXml: "Invoices",
                            data: {
                                rowLists: [
                                    {
                                        rows: invoicesRows
                                    }

                                ]
                            }
                        },
                        {
                            nameXml: "Services",
                            data: {
                                rowLists: [
                                    {
                                        rows: servicesRows
                                    }

                                ]
                            }
                        }
                    ],
                    creator: {
                        executionDate: new Date().toISOString(),
                        name: Banana.script.getParamValue("id"),
                        version: "1.0"
                    }
                }
            }
        ]
    };


    return docChange;
}

function createDocChangeRows(invoicesRows, servicesRows) {
    let invoiceObj = createInvoiceObj();
    invoicesRows.push(
                {
                    fields: {
                        Id: "1033",
                        Description: "Invoice xyz",
                        InvoiceData: {"invoice_json": invoiceObj}
                    },
                    operation: {
                        name: "add"
                    }
                });

    servicesRows.push(
                {
                    fields: {
                        DocInvoice: "1033"
                    },
                    operation: {
                        name: "modify",
                        sequence: "1"
                    }
                });

}

function createInvoiceObj() {
    return {
        "billing_info": {
            "discount": {
                "amount_vat_exclusive": "2.20"
            },
            "due_date": "2020-06-17",
            "total_advance_payment": "",
            "total_amount_vat_exclusive": "122.15",
            "total_amount_vat_exclusive_before_discount": "124.35",
            "total_amount_vat_inclusive": "131.56",
            "total_amount_vat_inclusive_before_discount": "133.93",
            "total_categories": [],
            "total_discount_percent": "1.8",
            "total_discount_vat_exclusive": "2.20",
            "total_discount_vat_inclusive": "2.37",
            "total_rounding_difference": "",
            "total_to_pay": "131.56",
            "total_vat_amount": "9.41",
            "total_vat_amount_before_discount": "9.58",
            "total_vat_codes": [
                {
                    "total_amount_vat_exclusive": "122.15",
                    "total_amount_vat_inclusive": "131.56",
                    "total_vat_amount": "9.41",
                    "vat_code": "V77"
                }
            ],
            "total_vat_rates": [
                {
                    "total_amount_vat_exclusive": "122.15",
                    "total_amount_vat_inclusive": "131.56",
                    "total_vat_amount": "9.41",
                    "vat_rate": "7.70"
                }
            ]
        },
        "creator_info": {
            "name": "ch.banana.application.invoice.default",
            "pubdate": "2021-09-24",
            "publisher": "Banana.ch SA",
            "version": ""
        },
        "customer_info": {
            "address1": "Via ai Salici 12",
            "address2": "",
            "address3": "",
            "business_name": "La stanza del Te SA",
            "city": "Lugano",
            "country": "",
            "country_code": "CH",
            "courtesy": "",
            "email": "",
            "first_name": "pinco",
            "iban": "",
            "last_name": "",
            "mobile": "",
            "number": "1",
            "phone": "",
            "postal_code": "6900",
            "web": ""
        },
        "document_info": {
            "currency": "CHF",
            "customer_reference": "asdf",
            "date": "2020-06-17",
            "decimals_amounts": 2,
            "description": "Fornitura merce (esempio iva esclusa)",
            "doc_type": "10",
            "locale": "it",
            "number": "3",
            "rounding_totals": "0.05",
            "text_begin": "",
            "title": "Fornitura merce (esempio iva esclusa)",
            "vat_mode": "vat_excl",
            "custom_info": [
                {
                    "id": "custom_field_1",
                    "title": "Weight",
                    "value": "45 kg"
                },
                {
                    "id": "custom_field_2",
                    "title": "Packages",
                    "value": "3"
                }
            ]
        },
        "items": [
            {
                "description": "Te\n1\n2\n3",
                "item_type": "item",
                "mesure_unit": "pz",
                "number": "1000",
                "price": "",
                "quantity": "4.00",
                "total": "",
                "total_amount_vat_exclusive": "19.68",
                "total_amount_vat_inclusive": "21.20",
                "total_vat_amount": "1.52",
                "unit_price": {
                    "amount_vat_exclusive": null,
                    "amount_vat_inclusive": "5.30",
                    "calculated_amount_vat_exclusive": "4.92",
                    "calculated_amount_vat_inclusive": "5.30",
                    "calculated_vat_amount": "0.38",
                    "vat_code": "V77",
                    "vat_rate": "7.70"
                },
                "vat_code": "",
                "vat_rate": ""
            },
            {
                "description": "Te",
                "discount": {
                    "percent": "30."
                },
                "item_type": "item",
                "mesure_unit": "pz",
                "number": "1000",
                "quantity": "4.00",
                "total": "",
                "total_amount_vat_exclusive": "13.78",
                "total_amount_vat_inclusive": "14.84",
                "total_vat_amount": "1.06",
                "unit_price": {
                    "amount_vat_exclusive": null,
                    "amount_vat_inclusive": "5.30",
                    "calculated_amount_vat_exclusive": "4.92",
                    "calculated_amount_vat_inclusive": "5.30",
                    "calculated_vat_amount": "0.38",
                    "discounted_amount_vat_exclusive": "3.44",
                    "discounted_amount_vat_inclusive": "3.71",
                    "discounted_vat_amount": "0.27",
                    "vat_code": "V77",
                    "vat_rate": "7.70"
                }
            },
            {
                "description": "Te",
                "discount": {
                    "amount": "1.60"
                },
                "item_type": "item",
                "mesure_unit": "pz",
                "number": "1000",
                "quantity": "4.00",
                "total": "",
                "total_amount_vat_exclusive": "13.74",
                "total_amount_vat_inclusive": "14.80",
                "total_vat_amount": "1.06",
                "unit_price": {
                    "amount_vat_exclusive": null,
                    "amount_vat_inclusive": "5.30",
                    "calculated_amount_vat_exclusive": "4.92",
                    "calculated_amount_vat_inclusive": "5.30",
                    "calculated_vat_amount": "0.38",
                    "discounted_amount_vat_exclusive": "3.44",
                    "discounted_amount_vat_inclusive": "3.70",
                    "discounted_vat_amount": "0.26",
                    "vat_code": "V77",
                    "vat_rate": "7.70"
                }
            },
            {
                "description": "Te",
                "item_type": "item",
                "mesure_unit": "pz",
                "number": "",
                "quantity": "10000",
                "total_amount_vat_exclusive": "17.18",
                "total_amount_vat_inclusive": "18.50",
                "total_vat_amount": "1.32",
                "unit_price": {
                    "amount_vat_exclusive": null,
                    "amount_vat_inclusive": "0.00185",
                    "calculated_amount_vat_exclusive": "0.00172",
                    "calculated_amount_vat_inclusive": "0.00185",
                    "calculated_vat_amount": "0.00013",
                    "vat_code": "V77",
                    "vat_rate": "7.70"
                }
            },
            {
                "description": "Te",
                "discount": {
                    "amount": "0.00035"
                },
                "item_type": "item",
                "mesure_unit": "pz",
                "number": "1000",
                "quantity": "10000",
                "total": "",
                "total_amount_vat_exclusive": "13.93",
                "total_amount_vat_inclusive": "15.00",
                "total_vat_amount": "1.07",
                "unit_price": {
                    "amount_vat_exclusive": null,
                    "amount_vat_inclusive": "0.00185",
                    "calculated_amount_vat_exclusive": "0.00172",
                    "calculated_amount_vat_inclusive": "0.00185",
                    "calculated_vat_amount": "0.00013",
                    "discounted_amount_vat_exclusive": "0.00139",
                    "discounted_amount_vat_inclusive": "0.00150",
                    "discounted_vat_amount": "0.00011",
                    "vat_code": "V77",
                    "vat_rate": "7.70"
                }
            },
            {
                "description": "Te",
                "discount": {
                    "percent": "3."
                },
                "item_type": "item",
                "mesure_unit": "pz",
                "number": "1000",
                "quantity": "10000",
                "total": "",
                "total_amount_vat_exclusive": "16.67",
                "total_amount_vat_inclusive": "17.95",
                "total_vat_amount": "1.28",
                "unit_price": {
                    "amount_vat_exclusive": null,
                    "amount_vat_inclusive": "0.00185",
                    "calculated_amount_vat_exclusive": "0.00172",
                    "calculated_amount_vat_inclusive": "0.00185",
                    "calculated_vat_amount": "0.00013",
                    "discounted_amount_vat_exclusive": "0.00167",
                    "discounted_amount_vat_inclusive": "0.00179",
                    "discounted_vat_amount": "0.00013",
                    "vat_code": "V77",
                    "vat_rate": "7.70"
                }
            },
            {
                "description": "Te",
                "item_type": "item",
                "mesure_unit": "pz",
                "number": "",
                "quantity": "0.00025",
                "total_amount_vat_exclusive": "9.33",
                "total_amount_vat_inclusive": "10.05",
                "total_vat_amount": "0.72",
                "unit_price": {
                    "amount_vat_exclusive": null,
                    "amount_vat_inclusive": "40200.00",
                    "calculated_amount_vat_exclusive": "37325.91",
                    "calculated_amount_vat_inclusive": "40200.00",
                    "calculated_vat_amount": "2874.09",
                    "vat_code": "V77",
                    "vat_rate": "7.70"
                }
            },
            {
                "description": "Te",
                "discount": {
                    "amount": "8000"
                },
                "item_type": "item",
                "mesure_unit": "pz",
                "number": "1000",
                "quantity": "0.00025",
                "total": "",
                "total_amount_vat_exclusive": "7.47",
                "total_amount_vat_inclusive": "8.05",
                "total_vat_amount": "0.58",
                "unit_price": {
                    "amount_vat_exclusive": null,
                    "amount_vat_inclusive": "40200.00",
                    "calculated_amount_vat_exclusive": "37325.91",
                    "calculated_amount_vat_inclusive": "40200.00",
                    "calculated_vat_amount": "2874.09",
                    "discounted_amount_vat_exclusive": "29897.86",
                    "discounted_amount_vat_inclusive": "32200.00",
                    "discounted_vat_amount": "2302.14",
                    "vat_code": "V77",
                    "vat_rate": "7.70"
                }
            },
            {
                "description": "Te",
                "discount": {
                    "percent": "25."
                },
                "item_type": "item",
                "mesure_unit": "pz",
                "number": "1000",
                "quantity": "0.00025",
                "total": "",
                "total_amount_vat_exclusive": "7.00",
                "total_amount_vat_inclusive": "7.54",
                "total_vat_amount": "0.54",
                "unit_price": {
                    "amount_vat_exclusive": null,
                    "amount_vat_inclusive": "40200.00",
                    "calculated_amount_vat_exclusive": "37325.91",
                    "calculated_amount_vat_inclusive": "40200.00",
                    "calculated_vat_amount": "2874.09",
                    "discounted_amount_vat_exclusive": "27994.43",
                    "discounted_amount_vat_inclusive": "30150.00",
                    "discounted_vat_amount": "2155.57",
                    "vat_code": "V77",
                    "vat_rate": "7.70"
                }
            },
            {
                "description": "Spese di spedizione",
                "item_type": "item",
                "mesure_unit": "",
                "number": "4000",
                "price": "",
                "quantity": "1.00",
                "total": "",
                "total_amount_vat_exclusive": "5.57",
                "total_amount_vat_inclusive": "6.00",
                "total_vat_amount": "0.43",
                "unit_price": {
                    "amount_vat_exclusive": null,
                    "amount_vat_inclusive": "6.00",
                    "calculated_amount_vat_exclusive": "5.57",
                    "calculated_amount_vat_inclusive": "6.00",
                    "calculated_vat_amount": "0.43",
                    "vat_code": "V77",
                    "vat_rate": "7.70"
                },
                "vat_code": "",
                "vat_rate": ""
            }
        ],
        "note": [
            {
                "date": null,
                "description": "aFASD\nF AS\nDF\n AS\nDF ASDF"
            }
        ],
        "payment_info": {
            "due_date": "2020-07-17"
        },
        "supplier_info": {
            "address1": "VIa alle colline 12",
            "address2": "",
            "address3": "",
            "business_name": "My Company",
            "city": "Lugano",
            "country": "Svizzera",
            "country_code": "CH",
            "courtesy": "",
            "email": "info@mycompany.zz",
            "first_name": "",
            "fiscal_number": "",
            "iban_number": "CH93 0076 2011 6238 5295 7",
            "last_name": "",
            "mobile": "",
            "phone": "+41 56 777 999",
            "postal_code": "600",
            "vat_number": "CHE-111.333.999 IVA",
            "web": "https://www.mycompany.zz"
        },
        "type": "invoice",
        "version": "1.0"
    }
}

/**
 * "number";"client_name";"client_number";"client_groups";"date";"period";"due";"period_from";"period_to";"total";"total_exclvat";"total_exclvat_afterdiscount";"total_vat";"currency";"status";"paid_date";"paid_amount";"esr_number";"cash_discount_date";"cash_discount_value";"service_total";"service_exclvat";"service_vat";"service_vat_split";"product_total";"product_exclvat";"product_vat";"product_vat_split";"rounding_difference";"payments"
 * "10002";"Garage Zylinder AG";"1000";"B-Kunde";"09.08.2021";"";"08.09.2021";"";"";"1079.27";"1002.11";"1002.11";"77.16";"CHF";"1° sollecito";"";"0.00";"000000000000000000000001029";"";"";"1077.00";"1000.00";"77.00";"7.70:77.00";"2.27";"2.11";"0.16";"7.70:0.16";"0";""
 * "10001";"Garage Zylinder AG";"1000";"B-Kunde";"09.08.2021";"";"08.09.2021";"";"";"647.93";"601.61";"601.61";"46.32";"CHF";"Inviato";"";"0.00";"000000000000000000000001013";"";"";"646.20";"600.00";"46.20";7."70:46.20";"1.73";"1.61";"0.12";"7.70:0.12";"-0";""
 * "10000";"Garage Zylinder AG";"1000";"B-Kunde";"09.08.2021";"";"08.09.2021";"";"";"431.53";"400.68";"400.68";"30.85";"CHF";"Bozza";"";"0.00";"000000000000000000000001008";"";"";"430.80";"400.00";"30.80";"7.70:30.80";"0.73";"0.68";"0.05";"7.70:0.05";"-0";""
 * struttura file fatture(singola riga)
 */
var formatInvS =class formatInvS {

    constructor(banDocument){
        this.placeHolder="";
        this.invoiceNetTotal="";
        this.invoiceNetTotalAfterDisc="";
        this.invoiceVatTotal="";
        this.NetTotalIsOk=false;
        this.VatTotalIsOk=false;
        this.discountTotal="";
        this.lang=getLang();
        this.banDoc=banDocument;

        //error messages
        this.ID_ERR_AMOUNTS_WITH_DIFFERENCES="ID_ERR_AMOUNTS_WITH_DIFFERENCES";
        this.ID_ERR_COSTUMERID_NOT_FOUND="ID_ERR_COSTUMERID_NOT_FOUND";
        this.ID_ERR_WRONG_INVOICE_TYPE="ID_ERR_WRONG_INVOICE_TYPE";
    }

    /** Return true if the transactions match this format */
    match(transactions) {
        if ( transactions.length === 0)
        return false;

        var formatMatched = false;

        if (transactions[0]["client_number"] && transactions[0]["client_number"].match(/[0-9\.]+/g))
        formatMatched = true;
        else
        formatMatched = false;

        if (formatMatched && transactions[0]["number"].match(/[0-9\.]+/g)){
            formatMatched = true;
        }
        else
        formatMatched = false;

        if (formatMatched && transactions[0]["date"].match(/[0-9\.]+/g) && transactions[0]["date"].length==10)
        formatMatched = true;
        else
        formatMatched = false;

        if (formatMatched)
        return true;
        else
        return false;
    }

    convertInDocChange(transactionsObjs,initJsonDoc){
        var jsonDoc=[];
        var docInfo=getDocumentInfo();
        var rows=[];
        var invoiceObj={};

        /**
       * ciclo le righe e creo gli oggetti
       *
       */
        for (var trRow in transactionsObjs){
            var invoiceTransaction=transactionsObjs[trRow];


            if(this.placeHolder!==invoiceTransaction["number"]){
                invoiceObj=this.setInvoiceStructure(invoiceTransaction,docInfo);
                invoiceObj.items=this.setInvoiceStructure_items(transactionsObjs,invoiceTransaction["number"]);

                // Recalculate invoice
                if(!invoiceObj.billing_info)
                invoiceObj.billing_info={};

                invoiceObj.billing_info.discount={};
                if(this.discountTotal=="0"){
                    this.discountTotal=null;
                }
                invoiceObj.billing_info.discount.amount_vat_exclusive=this.discountTotal;
                invoiceObj = JSON.parse(this.banDoc.calculateInvoice(JSON.stringify(invoiceObj)));

                //controllo che le informazioni nella proprietà billing info coincidano con i totali presi dalle righe della fattura
                this.checkCalculatedAmounts(invoiceObj);


                let row = {};
                row.operation = {};
                row.operation.name = "add";
                row.fields={};

                row.fields["InvoiceData"]={"invoice_json":JSON.stringify(invoiceObj)};

                rows.push(row);

                this.invoiceNetTotal="";
                this.invoiceVatTotal="";
                this.discountTotal="";

            }

            this.placeHolder=invoiceTransaction["number"];
        }

        var dataUnitTransactions = {};
        dataUnitTransactions.nameXml = "Invoices";
        dataUnitTransactions.data = {};
        dataUnitTransactions.data.rowLists = [];
        dataUnitTransactions.data.rowLists.push({ "rows": rows });

        var jsonDoc=initJsonDoc;


        //Banana.console.debug(JSON.stringify(dataUnitTransactions));


        jsonDoc.document.dataUnits.push(dataUnitTransactions);


        return jsonDoc;
    }

    checkCalculatedAmounts(invoiceObj){

        var msg=this.getInvoiceErrorMessage(this.ID_ERR_AMOUNTS_WITH_DIFFERENCES,this.lang,invoiceObj.document_info.number);

        if(invoiceObj.billing_info.total_amount_vat_exclusive_before_discount==this.invoiceNetTotal){
            this.NetTotalIsOk=true;
        }else{
            Banana.application.addMessage(msg,this.ID_ERR_AMOUNTS_WITH_DIFFERENCES);
            /*Banana.console.debug("excl vat file"+this.invoiceNetTotal);
         Banana.console.debug("excl vat calculated"+invoiceObj.billing_info.total_amount_vat_exclusive_before_discount);*/
        }
        if(invoiceObj.billing_info.total_amount_vat_inclusive==this.invoiceVatTotal){
            this.VatTotalIsOk=true;
        }else{
            Banana.application.addMessage(msg,this.ID_ERR_AMOUNTS_WITH_DIFFERENCES);
            /* Banana.console.debug("incl vat file"+this.invoiceVatTotal);
         Banana.console.debug("incl vat calculated"+invoiceObj.billing_info.total_amount_vat_inclusive);*/
        }

        return true;
    }

    getTranslateWords(language){
        var transWords={};

        if (language.length > 2) {
            language = language.substr(0, 2);
        }

        switch(language){
            case  'it':
            transWords.invoice="Fattura";
            transWords.reference="N. di riferimento: ";
            break;
            case 'fr':
            transWords.invoice="Facture";
            transWords.reference="N.de la facture: ";
            break;
            case 'de':
            transWords.invoice="Rechnung";
            transWords.reference="Rechnungsnummer: ";
            break;
            default:
            transWords.invoice="Invoice";
            transWords.reference="Reference nr: ";
            break;
        }

        return transWords;



    }

    //questo metodo dovrò richiamarlo per ogni riga di fattura presente, gli passo una transazione
    setInvoiceStructure(transaction,docInfo){

        var invoiceObj={};
        var invoiceTransaction=transaction;
        var supInfo=docInfo
        var transWord=this.getTranslateWords(this.lang)

        invoiceObj.creator_info=this.setInvoiceStructure_creatorInfo();
        invoiceObj.author_info={};
        invoiceObj.customer_info=this.setInvoiceStructure_customerInfo(invoiceTransaction);
        invoiceObj.document_info=this.setInvoiceStructure_documentInfo(invoiceTransaction,transWord);
        invoiceObj.note={};
        invoiceObj.parameters={};
        invoiceObj.payment_info=this.setInvoiceStructure_paymentInfo(invoiceTransaction);
        invoiceObj.shipping_info=this.setInvoiceStructure_shippingInfo(invoiceTransaction);
        invoiceObj.supplier_info=this.setInvoiceStructure_supplierInfo(supInfo);
        invoiceObj.type="invoice";
        invoiceObj.version="1.0";


        return invoiceObj;
    }


    setInvoiceStructure_creatorInfo(){
        var invoiceObj_creatorInfo={};

        invoiceObj_creatorInfo.name=Banana.script.getParamValue('id');
        invoiceObj_creatorInfo.pubblisher="Banana.ch SA";
        invoiceObj_creatorInfo.version="";
        invoiceObj_creatorInfo.pubdate=Banana.script.getParamValue('pubdate');

        return invoiceObj_creatorInfo;

    }

    setInvoiceStructure_customerInfo(invoiceTransaction){
        var invoiceObj_customerInfo={};

        var customer_info=this.getContactAddress(invoiceTransaction["client_number"],invoiceTransaction["client_name"]);

        invoiceObj_customerInfo.address1=customer_info.address1;
        invoiceObj_customerInfo.address2=customer_info.address2;
        invoiceObj_customerInfo.address3="";
        invoiceObj_customerInfo.balance="";
        invoiceObj_customerInfo.balance_base_currency="";
        invoiceObj_customerInfo.business_name=customer_info.business_name;
        invoiceObj_customerInfo.city=customer_info.city;
        invoiceObj_customerInfo.country=customer_info.country;
        invoiceObj_customerInfo.country_code=customer_info.country_code;
        invoiceObj_customerInfo.courtesy="";
        invoiceObj_customerInfo.currency="";
        invoiceObj_customerInfo.date_birth="";
        invoiceObj_customerInfo.email=customer_info.email;
        invoiceObj_customerInfo.phone=customer_info.phone;
        invoiceObj_customerInfo.first_name=customer_info.first_name;
        invoiceObj_customerInfo.lang=customer_info.lang;
        invoiceObj_customerInfo.last_name=customer_info.last_name;
        invoiceObj_customerInfo.mobile=customer_info.mobile;
        invoiceObj_customerInfo.number=invoiceTransaction["client_number"];
        invoiceObj_customerInfo.origin_row="";
        invoiceObj_customerInfo.origin_table="";
        invoiceObj_customerInfo.postal_code=customer_info.postal_code;
        invoiceObj_customerInfo.vat_number="";


        return invoiceObj_customerInfo;

    }

    getContactAddress(id,name) {
        var tableContacts = this.banDoc.table("Contacts");
        var customer_info = {
            'number': id,
            'business_name': '',
            'first_name': '',
            'last_name': '',
            'address1': '',
            'address2': '',
            'address3': '',
            'postal_code': '',
            'city': '',
            'country_code': '',
            'country': '',
            'phone': '',
            'email': '',
            'web': ''
        };
        if (tableContacts) {
            var contactRow = tableContacts.findRowByValue("RowId", id);
            if (contactRow) {
                customer_info.courtesy = contactRow.value('NamePrefix');
                customer_info.business_name = contactRow.value('OrganisationName');
                customer_info.first_name = contactRow.value('FirstName');
                customer_info.last_name = contactRow.value('FamilyName');
                customer_info.address1 = contactRow.value('Street');
                customer_info.address2 = contactRow.value('AddressExtra');
                customer_info.address3 = "";
                customer_info.postal_code = contactRow.value('PostalCode');
                customer_info.city = contactRow.value('Locality');
                customer_info.country = contactRow.value('Country');
                customer_info.country_code = contactRow.value('CountryCode');
                customer_info.web = contactRow.value('Website');
                customer_info.email = contactRow.value('EmailWork');
                customer_info.phone = contactRow.value('PhoneWork');
                customer_info.mobile = contactRow.value('PhoneMobile');
                return customer_info;
            }
            let table = this.banDoc.table("Invoices");
            var rowNumber = -1;
            var msg=this.getInvoiceErrorMessage(this.ID_ERR_COSTUMERID_NOT_FOUND,this.lang,id);
            table.addMessage(msg, rowNumber, "ContactId",this.ID_ERR_COSTUMERID_NOT_FOUND);
            customer_info.first_name=name;
            return customer_info;
        }
        return;
    }


    setInvoiceStructure_documentInfo(invoiceTransaction,transWord){
        var invoiceObj_documentInfo={};


        invoiceObj_documentInfo.currency=invoiceTransaction["currency"];
        invoiceObj_documentInfo.date=Banana.Converter.toInternalDateFormat(invoiceTransaction["date"]);
        invoiceObj_documentInfo.decimals_amounts=2;
        invoiceObj_documentInfo.description=transWord.invoice;
        invoiceObj_documentInfo.doc_type="";
        invoiceObj_documentInfo.locale="";
        invoiceObj_documentInfo.number=invoiceTransaction["number"];
        invoiceObj_documentInfo.origin_row="";
        invoiceObj_documentInfo.origin_table="";
        invoiceObj_documentInfo.printed="";
        invoiceObj_documentInfo.rounding_total="";
        invoiceObj_documentInfo.type="";
        invoiceObj_documentInfo.text_begin=transWord.reference+ invoiceTransaction["esr_number"];
        invoiceObj_documentInfo.vat_mode="vat_excl";


        return invoiceObj_documentInfo;

    }

    setInvoiceStructure_items(invoiceTransactions,ref_number){
        var invoiceArr_items=[];
        for(var row in invoiceTransactions){
            var invTransaction=invoiceTransactions[row];
            if(invTransaction["number"]==ref_number){
                var invoiceObj_items={};
                var itemDescription=this.replaceNewLine(invTransaction["position_description"]);
                invoiceObj_items.account_assignment="";
                invoiceObj_items.description=invTransaction["position_name"]+itemDescription;
                invoiceObj_items.details=invTransaction["position_category"];
                invoiceObj_items.index="";
                invoiceObj_items.item_type=invTransaction["type"];
                invoiceObj_items.mesure_unit="";
                invoiceObj_items.number=invTransaction["position_number"];
                invoiceObj_items.quantity=invTransaction["position_amount"];
                invoiceObj_items.unit_price=this.setInvoiceStructure_items_unitPrice(invTransaction);


                invoiceArr_items.push(invoiceObj_items);
            }
        }
        return invoiceArr_items;
    }

    setInvoiceStructure_items_unitPrice(invoiceTransaction){
        var unitPrice={};

        unitPrice.amount_vat_inclusive=null;
        //arrotondare a 4 dec
        unitPrice.amount_vat_exclusive=Banana.SDecimal.divide(invoiceTransaction["position_nettotal"],invoiceTransaction["position_amount"],{'decimals':4});
        //Banana.console.debug(unitPrice.amount_vat_exclusive);
        unitPrice.currency=invoiceTransaction["currency"];
        unitPrice.discount={};
        unitPrice.discount.amount=null;
        unitPrice.discount.percent=null;
        unitPrice.vat_code="";
        unitPrice.vat_rate=invoiceTransaction["position_vat"];

        //salvo i valori per confrontarli con quelli calcolati
        this.invoiceNetTotal=Banana.SDecimal.add(this.invoiceNetTotal,invoiceTransaction["position_nettotal"],{'decimals':2});
        this.invoiceVatTotal=Banana.SDecimal.add(this.invoiceVatTotal,invoiceTransaction["position_total"],{'decimals':2});

        this.discountTotal=Banana.SDecimal.add(this.discountTotal,Banana.SDecimal.subtract(invoiceTransaction["position_nettotal"],invoiceTransaction["position_nettotal_afterdiscount"]));




        return unitPrice;

    }

    setInvoiceStructure_paymentInfo(invoiceTransaction){
        var invoiceObj_paymentInfo={};

        invoiceObj_paymentInfo.due_date=Banana.Converter.toInternalDateFormat(invoiceTransaction["due"]);
        invoiceObj_paymentInfo.due_days="";
        invoiceObj_paymentInfo.payment_date=Banana.Converter.toInternalDateFormat(invoiceTransaction["paid_date"]);

        return invoiceObj_paymentInfo;

    }

    setInvoiceStructure_shippingInfo(invoiceTransaction){
        var invoiceObj_shippingInfo={};

        invoiceObj_shippingInfo.different_shipping_address=false;

        return invoiceObj_shippingInfo={};
    }

    setInvoiceStructure_supplierInfo(supInfo){
        var invoiceObj_supplierInfo={};


        invoiceObj_supplierInfo.address1=supInfo.address1;
        invoiceObj_supplierInfo.address2=supInfo.address2;
        invoiceObj_supplierInfo.business_name=supInfo.business_name;
        invoiceObj_supplierInfo.city=supInfo.city;
        invoiceObj_supplierInfo.courtesy=supInfo.courtesy;
        invoiceObj_supplierInfo.email=supInfo.email;
        invoiceObj_supplierInfo.fax=supInfo.fax;
        invoiceObj_supplierInfo.first_name=supInfo.first_name;
        invoiceObj_supplierInfo.fiscal_number=supInfo.fiscal_number;
        invoiceObj_supplierInfo.last_name=supInfo.last_name;
        invoiceObj_supplierInfo.phone=supInfo.phone;
        invoiceObj_supplierInfo.postal_code=supInfo.postal_code;
        invoiceObj_supplierInfo.state=supInfo.state;
        invoiceObj_supplierInfo.vat_number=supInfo.vat_number;
        invoiceObj_supplierInfo.web=supInfo.web;

        return invoiceObj_supplierInfo;

    }

    replaceNewLine(itemDescription){
        var newItemDescription="";
        if(itemDescription && itemDescription.indexOf("<br>")!==0){
            newItemDescription=itemDescription.replace("<br>","\n");
            newItemDescription="\n"+newItemDescription;
            return newItemDescription;
        }
        return newItemDescription;
    }

    getInvoiceErrorMessage(errorId,lang,refNr){
        if (!lang)
        lang = 'en';
        switch (errorId) {
            case this.ID_ERR_COSTUMERID_NOT_FOUND:
            if (lang == 'it')
            return "Id del contatto: "+refNr+" non trovato nella tabella dei contatti. Hai importato i contatti?";
            else if (lang == 'de')
            return "Kontakt-ID: "+refNr+" wurde nicht in der Kontakt-Tabelle gefunden. Haben Sie Ihre Kontakte schon importiert? ";
            else if (lang=='fr')
            return "Contact id: "+refNr+" not found in contact table. Did you import the contacts?";
            else
            return "Contact id: "+refNr+" not found in contact table. Did you import the contacts?";
            case this.ID_ERR_AMOUNTS_WITH_DIFFERENCES:
            if (lang == 'it')
            return "L'importo calcolato è diverso da quello presente del tuo file, fattura nr"+": "+refNr;
            else if (lang == 'de')
            return "Der berechnete Betrag entspricht nicht demjenigen Ihrer Datei, Rechnungsnummer"+": "+refNr;
            else if (lang=='fr')
            return "The calculated amount is different from the amount in your file, invoice nr"+": "+refNr;
            else
            return "The calculated amount is different from the amount in your file, invoice nr"+": "+refNr;
            case this.ID_ERR_WRONG_INVOICE_TYPE:
            if (lang == 'it')
            return "Stai provando ad importare una fattura tipo 'Singola riga',importa invece una fattura tipo 'Dettagliata'";
            else if (lang == 'de')
            return "Sie versuchen, eine 'einzeilige' Rechnung zu importieren, importieren Sie stattdessen eine 'detaillierte' Rechnung.";
            else if (lang=='fr')
            return "You are trying to import a 'Single line' invoice, import a 'Detailed' invoice instead.";
            else
            return "You are trying to import a 'Single line' invoice, import a 'Detailed' invoice instead.";
        }
        return '';
    }

}

function getExistingItemsFromTable(tableName,rowId){

    var table = Banana.document.table(tableName);
    var existingElements=[];

    if (!table) {
        return "";
    }

    for (var i = 1; i < table.rowCount; i++) {
        var rowObj={};
        var tRow = table.row(i);

        rowObj.field_1= tRow.value(rowId);

        existingElements.push(rowObj);
    }

    return existingElements;
}

function verifyIfExist(existingElements,newEelements_id){

    if (!Banana.document)
        return "";
    for(var row in existingElements){
        if(existingElements[row].field_1==newEelements_id){
            return true;
        }
    }return false;
}

function getDocumentInfo(){
    var docInfo={};
    if (Banana.document){
        docInfo.address1=Banana.document.info("AccountingDataBase","Address1");
        docInfo.address2=Banana.document.info("AccountingDataBase","Address2");
        docInfo.business_name=Banana.document.info("AccountingDataBase","Company");
        docInfo.city=Banana.document.info("AccountingDataBase","City");
        docInfo.courtesy=Banana.document.info("AccountingDataBase","Courtesy");
        docInfo.email=Banana.document.info("AccountingDataBase","Email");
        docInfo.fax="";
        docInfo.first_name=Banana.document.info("AccountingDataBase","Name");
        docInfo.fiscal_number=Banana.document.info("AccountingDataBase","FiscalNumber");
        docInfo.last_name=Banana.document.info("AccountingDataBase","LastName");
        docInfo.phone=Banana.document.info("AccountingDataBase","Phone");
        docInfo.postal_code=Banana.document.info("AccountingDataBase","Zip");
        docInfo.state=Banana.document.info("AccountingDataBase","State");
        docInfo.vat_number=Banana.document.info("AccountingDataBase","VatNumber");
        docInfo.web=Banana.document.info("AccountingDataBase","Web");
    }

    return docInfo;
}

function bananaRequiredVersion(requiredVersion, expmVersion) {
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

function verifyBananaVersion() {

    if (!Banana.document)
        return false;

    var lang = getLang();

    var ban_version_min = "10.0.9";
    var ban_dev_version_min = "";
    var curr_version = bananaRequiredVersion(ban_version_min, ban_dev_version_min);

    if (!curr_version) {
        var msg = this.getErrorMessage("ID_ERR_VERSION_NOTSUPPORTED", lang);
        msg = msg.replace("%1", ban_version_min);
        Banana.document.addMessage(msg,"ID_ERR_VERSION_NOTSUPPORTED");
        return false;
    }

    return true;
}

function getLang() {
    var lang = 'en';
    if (this.banDocument)
        lang = this.banDocument.locale;
    else if (Banana.application.locale)
        lang = Banana.application.locale;
    if (lang.length > 2)
        lang = lang.substr(0, 2);
    return lang;
}

function getErrorMessage(errorId, lang) {
    if (!lang)
        lang = 'en';
    switch (errorId) {
    case "ID_ERR_EXPERIMENTAL_REQUIRED":
        return "The Experimental version is required";
    case "ID_ERR_LICENSE_NOTVALID":
        return "This extension requires Banana Accounting+ Advanced";
    case "ID_ERR_VERSION_NOTSUPPORTED":
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
