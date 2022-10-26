# Services billing extension

The aim of this extension is to simplify the creationg of invoices from a log of services and costs. 

The idea is to register for every provided service and every incurred cost an entry in the a "Services" table, the transaction is then linked to a customer and if desired to a project too. The extension will then group those entry and create one or more invoices.

For this purpouse a "Services" table will be added (for the moment manually) to an Estimate and Invoice file.
The user insert a new row in the "Services" table for each service he provided or cost he incurred.
The sequnence or the grouping of those transactions is not important.
When the extension is executed the user select the period, the cusotmer and the project for which he want to create the invoice. He can select if he want to create a separated invoice for each project. The extension collect all entries that are not yet inserted in an invoice, filter them by the selection done by the user, and then create the invoices. To the used entries the corresponding invoice number is attributed.