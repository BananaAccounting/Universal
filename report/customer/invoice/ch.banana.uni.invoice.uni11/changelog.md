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
