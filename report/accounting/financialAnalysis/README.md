

## FINANCIAL ANALYSIS, UPDATES LOG (since march 2023)

### 15.03.2023

#### Changes

- Change the field for choosing colours to 'colour'type, now the user can display a table with the colours to be chosen.
- the field "Include control sums" becomes "Include always counter sums", this is because control sums are shown even when there are no errors.
- The acronym "totp" (total liabilities) becomes "totle" (total liabilities and equity).
- Fixes bug with logo and header positioning.
- Fixes bug in the balance sheet with non-tangible fixed assets that were not calculated correctly.
- Resolves bug with #revaluation and #devaluation tags, the check on the tags was not being carried out correctly, and in some cases some unnecessary entries were being taken into account.
- Modified styles in the report, more specifically:
  * Move cashflow analysis just after the balance sheet and the Profit and Loss
  * Applies the same style to all elements in a row.
  * Removes the coloured style from the asset and equity adjustment rows from the cashflow.
- Removes charts, the library used is incompatible with Qt6, the 'QtCharts' library can be used instead.
- Fixed some problems with the date field, if the user did not click inside the field with the mouse, the field would remain empty and the data in the report would come out wrong, more precisely:
  * In c++ it has been corrected that the dialogue can take dates in both "yyyymmdd" and local format, previously this was not possible and when trying to set the date automatically, in some cases the local format would come up which was not considered valid.
  * In Javscript we currently work with the local date format, you pass it already formatted to the dialogue, it also returns it already formatted, to use it in the report we convert again the data to the internal format.
- Modifies the Z-Score analysis. more precisely:
  * Corrects the formula
  * Modifies the existing table
  * Adds a new table with the analysis for normal companies (quoted ones).
- Refactoring the code
- Modified the testcases so as to have a file with at least one year (or period) with all amounts.


#### Notes
- Tried to insert a button to import settings from another file, the problem is that this is a shared extension and saved the settings using its own id, the functionality works with the script id.
- It has been discussed that it would be convenient if the dialogue could move to the background of the account file to allow those who insert groups into the dialogue to have an open view of their chart of accounts, unfortunately this is currently not possible.

### Pending
- Allow only the estimate column to be displayed.
- Increase the date automatically in the dialogue.
