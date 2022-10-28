var ServicesBilling = class ServicesBilling {

    constructor(doc) {
        this.banDoc = doc;
        this.tableInvoices = this.banDoc.table("Invoices");
        this.tableServices = this.banDoc.table("Services");
        this.tableContacts = this.banDoc.table("Contacts");
        this.tableProjects = this.banDoc.table("Projects");
    }

    createInvoices(fromDate, toDate, forCustomerId, forProjectId) {

        // Extract services to bill
        let servicesRowToBill = this.getServicesRowsToBill(fromDate, toDate, forCustomerId, forProjectId);
        if (!servicesRowToBill) {
            // no rows to bill
            return null;
        }

        // Group services
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

        // Create invoices and set invoice no to the services
        let docChangeInvoicesRows = [];
        let docChangeServicesRows = [];
        let invoiceNo = this.tableInvoices.progressiveNumber("RowId");
        //this.createDocChangeHeaderRow(toDate, docChangeInvoicesRows);
        for (let g = 0; g < grouppedServicesRows.length; g++) {
            this.createDocChangeRows(grouppedServicesRows[g], invoiceNo, docChangeInvoicesRows, docChangeServicesRows);
            invoiceNo = (Number(invoiceNo) + 1).toString();
        }
        let docChange = this.createDocChangeDocument(docChangeInvoicesRows, docChangeServicesRows);

        return docChange;
    }

    createDocChangeDocument(invoicesRows, servicesRows) {
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
                        cursorPosition: {
                            operation: "move",
                            tableName: "Invoices",
                            rowNr: -1
                        },
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

    createDocChangeHeaderRow(date, invoicesRows) {
        // Add empty row
        invoicesRows.push(
            {
                fields: {
                },
                operation: {
                    name: "add"
                }
            });
        // Add header row
        invoicesRows.push(
            {
                fields: {
                    Description: "** Prestazioni fino al " + date + " **",
                },
                operation: {
                    name: "add"
                }
            });
    }

    createDocChangeRows(serviceGroup, invoiceNo, invoicesRows, servicesRows) {
        if (!serviceGroup) {
            return;
        }

        let invoiceObj = this.createBaseInvoiceObj(invoiceNo);
        let invoiceDescr = this.getInvoiceDescription(serviceGroup.group.ProjectsId);
        invoiceObj.customer_info = this.getInvoiceCustomerInfo(serviceGroup.group.ContactsId);
        invoiceObj.document_info.description = invoiceDescr
        invoiceObj.document_info.text_begin = this.getInvoiceBeginText(serviceGroup.group.ProjectsId);

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
                    Description: invoiceDescr,
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

            let date = this.tableServices.value(r, "Date").trim();
            let customerId = this.tableServices.value(r, "ContactsId").trim();
            let projectId = this.tableServices.value(r, "ProjectsId").trim();
            let amount = this.tableServices.value(r, "Amount").trim();

            if (!date) {
                if (amount) {
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
        } else if (servicesRowsToBill.length === 0) {
            return null;
        }

        return servicesRowsToBill;
    }

    groupServicesRows(rows, groupping) {
        let groups = [];
        for (let i = 0; i < rows.length; ++i) {
            let row = rows[i];
            let rowGroup = {rows:[],group:{}};
            for (let g = 0; g < groupping.length; g++) {
                let columnName = groupping[g].column;
                let tableName = groupping[g].table;
                let value = this.tableServices.value(row, columnName);
                if (!value) {
                    // Should not happen at this point, but we still add a message
                    this.tableServices.addMessage(qsTr("Value %1 is undefined").arg(columnName), row, columnName);
                    continue;
                }
                rowGroup.group[columnName] = value;
            }

            // Find destination group, where to insert the row
            let destGroup = null;
            for (let gr = 0; gr < groups.length; gr++) {
                let match = true;
                for (let gs = 0; gs < groupping.length && match; gs++) {
                    let columnName = groupping[gs].column;
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
            destGroup.rows.push(row);
        }

        return groups;
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
                "locale": "it",
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
        let amount = this.tableServices.value(row, "Amount");
        let description = this.tableServices.value(row, "Description");
        let stop = this.tableServices.value(row, "Stop");
        if (stop) description = stop.substring(0,5) + " - " + description;
        let start = this.tableServices.value(row, "Start");
        if (start) description = start.substring(0,5) + " - " + description;

        let item = {
            'date': this.tableServices.value(row, "Date"),
            'description': description,
            'distance': this.tableServices.value(row, "Distance"),
            'item_type': amount ? "item" : "note",
            'number': "",
            'quantity': amount ? "1" : "0",
            'unit_price': {
                'amount_vat_exclusive': this.tableServices.value(row, "Amount"),
                'vat_code': 'V77',
                'vat_rate': '7.70'
            }
        };
        return item;
    }

    getInvoiceDescription(projectId) {
        let rowNr = this.findRow(this.tableProjects, "RowId", projectId);
        let name = this.tableProjects.value(rowNr, "Description");
        let birthDate = this.tableProjects.value(rowNr, "BirthDate");
        return "Servizio trasporti " + name + " " + Banana.Converter.toLocaleDateFormat(birthDate);
    }

    getInvoiceBeginText(projectId) {
        let rowNr = this.findRow(this.tableProjects, "RowId", projectId);
        let ahvNumber = this.tableProjects.value(rowNr, "AhvNumber");
        let reference = this.tableProjects.value(rowNr, "Reference");
        return "Rif.: " + reference + "  -  " + "N° AVS: " + ahvNumber;
    }

    getInvoiceCustomerInfo(id) {
        let row = this.findRow(this.tableContacts, "RowId", id);
        if (row >= 0) {
            var customer_info = {
                'number': id,
                'business_name': this.defaultValue(this.tableContacts.value(row, 'OrganisationName'), ""),
                'courtesy': this.defaultValue(this.tableContacts.value(row, 'NamePrefix'), ""),
                'first_name': this.defaultValue(this.tableContacts.value(row, 'FirstName'), ""),
                'last_name': this.defaultValue(this.tableContacts.value(row, 'FamilyName'), ""),
                'address1': this.defaultValue(this.tableContacts.value(row, 'Street'), ""),
                'address2': this.defaultValue(this.tableContacts.value(row, 'PostalCode'), ""),
                'address3': this.defaultValue(this.tableContacts.value(row, 'POBox'), ""),
                'postal_code': this.defaultValue(this.tableContacts.value(row, 'PostalCode'), ""),
                'city': this.defaultValue(this.tableContacts.value(row, 'Locality'), ""),
                'country_code': this.defaultValue(this.tableContacts.value(row, 'CountryCode'), ""),
                'country': this.defaultValue(this.tableContacts.value(row, 'Country'), ""),
                'phone': this.defaultValue(this.tableContacts.value(row, 'PhoneWork'), ""),
                'mobile': this.defaultValue(this.tableContacts.value(row, 'PhoneMobile'), ""),
                'email': this.defaultValue(this.tableContacts.value(row, 'EmailWork'), ""),
                'web': this.defaultValue(this.tableContacts.value(row, 'Website'), "")
            };
            return customer_info;
        }
        return {};
    }

    getInvoiceSupplierInfo() {
        var supplierInfo = {
            'address1': this.banDoc.info("AccountingDataBase", "Address1"),
            'address2': this.banDoc.info("AccountingDataBase", "Address2"),
            'business_name': this.banDoc.info("AccountingDataBase", "Company"),
            'city': this.banDoc.info("AccountingDataBase", "City"),
            'courtesy': this.banDoc.info("AccountingDataBase", "Courtesy"),
            'email': this.banDoc.info("AccountingDataBase", "Email"),
            'first_name': this.banDoc.info("AccountingDataBase", "Name"),
            'fiscal_number': this.banDoc.info("AccountingDataBase", "FiscalNumber"),
            'last_name': this.banDoc.info("AccountingDataBase", "LastName"),
            'phone': this.banDoc.info("AccountingDataBase", "Phone"),
            'postal_code': this.banDoc.info("AccountingDataBase", "Zip"),
            'state': this.banDoc.info("AccountingDataBase", "State"),
            'vat_number': this.banDoc.info("AccountingDataBase", "VatNumber"),
            'web': this.banDoc.info("AccountingDataBase", "Web")
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

    defaultValue(curValue, defaultValue) {
        if (curValue)
        return curValue;
        return defaultValue;
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
