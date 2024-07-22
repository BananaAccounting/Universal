# Changelog

All notable changes to the [[UNI11] Layout 11 Programmable Invoice](https://www.banana.ch/apps/en/node/9423) extension will be documented in this file.

* 2021-06-16
	* Added Chinese translations for texts and parameters dialog  
* 2021-10-12
	* print order number and order date in the information section. Can be activated/deactivated in the layout parameters. For integrated invoices can be added in Transaction table, column DocType (10:ordd / 10: ordn).
	* print begin text of the invoice on several lines. Text can also be defined in layout parameters, section Texts->Text begin.
	* print begin text of the estimate on several lines. Text can also be defined in Layout parameters, section Texts->Estimate->Text begin estimate.
	* add the subtotal for invoice with gross amounts in case of discount, deposit or rounding.
	* Specific changes for Integrated invoice:
		* print additional descriptions on several lines using custom columns “Description2”, “Description3",… in Transactions table. Can be activated/deactivated in the layout parameters, section Print->Invoice details.   
	* Specific changes for Estimates and Invoices application:
		* print columns “Item”, “Date” and “Discount”. Columns can be added in layout parameters, section Print->Invoice Details->Column names
		* print custom columns of Items table. The syntax is “I.ColumnName”, where ColumnName is the XML name of a column (Advanced plan required).  
* 2022-05-30
	* Fix print column Item  
	* Removed 'shipping address' from invoice parameters when using Estimates-Invoices application  
* 2022-08-04
    * Print custom columns of invoice item objects (i.e.: unit_price.calculated_amount_vat_exclusive, ...)  
* 2023-01-09
	* Added Delivery Notes and Reminders as print options (Advanced plan required).
	* Added a new color for 'Title and Total' in parameters settings.  
* 2023-03-10
	* Added Proforma Invoice and Estimate as print options (Advanced plan required).  
* 2024-07-22
	* Integrated invoice: Added reminders date and remiders due date when dates are set via the Report > Customers > Print reminders function.
	* Integrated invoice: Added for proforma invoice the possibility to set the title and final notes/greetings using the column DocType of Transactions table.
	* Integrated invoice: The content of the column Quantity is always printed when used.
	* Integrated invoice: The format number of Quantity column in Transactions table can be modified to print decimals on the invoice (0,1,2,3,4 decimals).
	* Estimates and Invoices Application: discount and deposit now appear with negative sings on the invoice.
	* Added new parameters in layout options to view the invoice JSONs (useful for development, Advanced plan required).  
