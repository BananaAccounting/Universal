var ServicesBilling = class ServicesBilling {

    constructor(doc) {
        this.banDoc = doc;
        this.tableServices = this.banDoc.table("Services");
        this.tableContacts = this.banDoc.table("Contacts");
        this.tableProjects = this.banDoc.table("Projects");
    }

    createInvoices(fromDate, toDate, forCustomerId, forProjectId) {
        let servicesRowToBill = this.getServicesRowsToBill();
        if (!servicesRowToBill) {
            console.log("no rows to bill");
            return null;
        }

        let servicesGrouping = [
            {
                column: "ContactsId",
                table: "Contacts"
            },
            {
                column: "ProjectsId",
                table: "Projects"
            }
        ];

        let grouppedServicesRows = this.groupServicesRows(servicesRowToBill, servicesGrouping);
        this.setGroupInvoiceNo(grouppedServicesRows);

        console.log(JSON.stringify(grouppedServicesRows, null, "   "));

        let docChangeInvoicesRows = [];
        let docChangeServicesRows = [];
        for (let g = 0; g < grouppedServicesRows.length; g++) {
            this.createDocChangeRow(grouppedServicesRows[g], docChangeInvoicesRows, docChangeServicesRows);
        }
        let docChange = this.createDocChange(docChangeInvoicesRows, docChangeServicesRows);

        return docChange;
    }

    createDocChange(invoicesRows, servicesRows) {
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

    createDocChangeRow(serviceGroup, invoicesRows, servicesRows) {
        if (!serviceGroup) {
            return;
        }

        let invoiceNo = serviceGroup.invoiceNo;
        let invoiceObj = this.createBaseInvoiceObj(invoiceNo);
        invoiceObj.customer_info = this.getInvoiceCustomerInfo(serviceGroup.group.ContactsId);

        // Add items
        for (let i = 0; i < serviceGroup.rows.length; i++) {
            invoiceObj.items.push(this.createInvoiceItem(serviceGroup.rows[i]));
        }

        // Recalculate invoice
        invoiceObj = JSON.parse(this.banDoc.calculateInvoice(JSON.stringify(invoiceObj)));

        // Add invoice
        invoicesRows.push(
            {
                fields: {
                    RowId: invoiceNo,
                    Description: "Invoice " + invoiceNo,
                    InvoiceTotalAmount: invoiceObj.billing_info.total_to_pay,
                    InvoiceData: {"invoice_json": JSON.stringify(invoiceObj)}
                },
                operation: {
                    name: "add"
                }
            });

        // Set invoice nr and invoice date to the service's row
        for (let j = 0; j < serviceGroup.rows.length; j++) {
            servicesRows.push(
                {
                    fields: {
                        DocInvoice: invoiceNo,
                        DateInvoice: invoiceObj.document_info.date
                    },
                    operation: {
                        name: "modify",
                        sequence: serviceGroup.rows[j].toString()
                    }
                });
        }

    }

    getServicesRowsToBill(fromDate, toDate, forCustomerId, forProjectId) {
        let error = false;
        let servicesRowsToBill = [];
        for (let r = 0; r < this.tableServices.rowCount; ++r) {
            let invoiceNo = this.tableServices.value(r, "DocInvoice");
            if (invoiceNo) {
                // If there is an invoice nr the service was already billed
                continue;
            }

            let date = this.tableServices.value(r, "Date");
            let customerId = this.tableServices.value(r, "ContactsId");
            let projectId = this.tableServices.value(r, "ProjectsId");
            let amount = this.tableServices.value(r, "Amount");

            if (!date) {
                if (customerId || amount) {
                    this.tableServices.addMessage(qsTr("Date is missing"), r, "Date");
                    error = true;
                } else {
                    // Empty or descriptions row
                    continue;
                }
            } else if (fromDate && (date < fromDate)) {
                // Date before specified period
                continue;
            } else if (toDate && (date > toDate)) {
                // Date after specified period
                continue;
            }

            if (!customerId) {
                this.tableServices.addMessage(qsTr("Contact is undefined"), r, "ContactsId");
                error = true;
            } else if (forCustomerId && forCustomerId !== customerId) {
                continue;
            } else if (this.findRow(this.tableContacts, "RowId", customerId) < 0) {
                this.tableServices.addMessage(qsTr("Contact not found: %1").arg(customerId), r, "ContactsId");
                error = true;
            }

            if (!projectId) {
                this.tableServices.addMessage(qsTr("Project is undefined"), r, "ProjectsId");
                error = true;
            } else if (forProjectId && forProjectId !== projectId) {
                continue;
            } else if (this.findRow(this.tableProjects, "RowId", projectId) < 0) {
                this.tableServices.addMessage(qsTr("Project not found: %1").arg(projectId), r, "ProjectsId");
                error = true;
            }

            if (error) {
                continue;
            }

            // This is service is to be billed
            servicesRowsToBill.push(r);
        }

        if (error) {
            return null;
        }

        return servicesRowsToBill;
    }

    groupServicesRows(rows, groupping) {
        let groups = [];
        for (let r in rows) {
            let rowGroup = {rows:[],group:{}};
            for (let g = 0; g < groupping.length; g++) {
                let columnName = groupping[g].column;
                let tableName = groupping[g].table;
                let value = this.tableServices.value(r, columnName);
                if (!value) {
                    // Should not happen at this point, but we still add a message
                    this.tableServices.addMessage(qsTr("Value %1 is undefined").arg(column), r, column);
                    continue;
                }
                rowGroup.group[columnName] = value;
            }

            // Find destination group, where to insert the row
            let destGroup = null;
            for (let gr = 0; gr < groups.length; gr++) {
                let match = true;
                for (let g = 0; g < groupping.length && match; g++) {
                    let columnName = groupping[g].column;
                    if (groups[gr].group[columnName] !== rowGroup.group[columnName]) {
                        match = false;
                    }
                }
                if (match) {
                    destGroup = groups[gr];
                }
            }

            if (!destGroup) {
                destGroup = rowGroup;
                groups.push(rowGroup);
            }
            destGroup.rows.push(r);
        }

        return groups;
    }

    setGroupInvoiceNo(servicesGroups) {
        let invoiceNo = 1;
        for (let g = 0; g < servicesGroups.length; g++) {
            servicesGroups[g].invoiceNo = invoiceNo.toString();
            ++invoiceNo;
        }
    }

    createBaseInvoiceObj(invoiceNo) {
        let date = new Date();
        let dueDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 30);
        let invoiceObj = {
            "billing_info": {
                "due_date": dueDate.toISOString().substring(0,10)
            },
            "creator_info": {
                "name": Banana.script.getParamValue("id"),
                "pubdate": Banana.script.getParamValue("pubdate"),
                "publisher": "Banana.ch SA",
                "version": ""
            },
            "customer_info": {},
            "document_info": {
                "currency": "CHF",
                "date": dueDate.toISOString().substring(0,10),
                "decimals_amounts": 2,
                "description": "Invoice " + invoiceNo,
                "locale": "en",
                "number": invoiceNo,
                "rounding_totals": "0.05",
                "text_begin": "",
                "title": "Invoice " + invoiceNo,
                "vat_mode": "vat_excl"
            },
            "items": [],
            "payment_info": {
                "due_date": dueDate.toISOString().substring(0,10)
            },
            "supplier_info": this.getInvoiceSupplierInfo(),
            "type": "invoice",
            "version": "1.0"
        }

        return invoiceObj;
    }

    createInvoiceItem(row) {
        let item = {
            'date': this.tableServices.value(row, "Date"),
            'start': this.tableServices.value(row, "Start"),
            'stop': this.tableServices.value(row, "Stop"),
            'duration': this.tableServices.value(row, "Duration"),
            'description': this.tableServices.value(row, "Description"),
            'distance': this.tableServices.value(row, "Distance"),
            'item_type': "item",
            'number': "",
            'quantity': "1",
            'unit_price': {
                'amount_vat_exclusive': this.tableServices.value(row, "Amount"),
                'vat_code': 'V77',
                'vat_rate': '7.70'
            }
        };
        return item;
    }

    getInvoiceCustomerInfo(id) {
        let row = this.findRow(this.tableContacts, "RowId", id);
        if (row > 0) {
            var customer_info = {
                'number': id,
                'business_name': this.tableContacts.value(row, 'OrganisationName'),
                'courtesy': this.tableContacts.value(row, 'NamePrefix'),
                'first_name': this.tableContacts.value(row, 'FirstName'),
                'last_name': this.tableContacts.value(row, 'FamilyName'),
                'address1': this.tableContacts.value(row, 'Street'),
                'address2': this.tableContacts.value(row, 'PostalCode'),
                'address3': this.tableContacts.value(row, 'POBox'),
                'postal_code': this.tableContacts.value(row, 'PostalCode'),
                'city': this.tableContacts.value(row, 'Locality'),
                'country_code': this.tableContacts.value(row, 'CountryCode'),
                'country': this.tableContacts.value(row, 'Country'),
                'phone': this.tableContacts.value(row, 'PhoneWork'),
                'mobile': this.tableContacts.value(row, 'PhoneMobile'),
                'email': this.tableContacts.value(row, 'EmailWork'),
                'web': this.tableContacts.value(row, 'Website'),
            };
            return customer_info;
        }
        return {};
    }

    getInvoiceSupplierInfo() {
        var supplierInfo = {
            'address1': this.banDoc.info("AccountingDataBase","Address1"),
            'address2': this.banDoc.info("AccountingDataBase","Address2"),
            'business_name': this.banDoc.info("AccountingDataBase","Company"),
            'city': this.banDoc.info("AccountingDataBase","City"),
            'courtesy': this.banDoc.info("AccountingDataBase","Courtesy"),
            'email': this.banDoc.info("AccountingDataBase","Email"),
            'first_name': this.banDoc.info("AccountingDataBase","Name"),
            'fiscal_number': this.banDoc.info("AccountingDataBase","FiscalNumber"),
            'last_name': this.banDoc.info("AccountingDataBase","LastName"),
            'phone': this.banDoc.info("AccountingDataBase","Phone"),
            'postal_code': this.banDoc.info("AccountingDataBase","Zip"),
            'state': this.banDoc.info("AccountingDataBase","State"),
            'vat_number': this.banDoc.info("AccountingDataBase","VatNumber"),
            'web': this.banDoc.info("AccountingDataBase","Web")
        }
        return supplierInfo;
    }

    findRow(table, column, value) {
        if (table && column) {
            for (let r = 0; r < table.rowCount; ++r) {
                if (table.value(r, column) === value) {
                    return r;
                }
            }
        }
        return -1;
    }

    getErrorMessage(errorId) {
        switch (errorId) {
            case this.ID_ERR_COSTUMERID_NOT_FOUND:
            return qsTr("Contact id: %1 not found in contact table. Did you import the contacts?");
            default:
            return errorId;
        }
    }

}
