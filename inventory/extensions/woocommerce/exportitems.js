// @id = ch.banana.apps.exportwoocommerce
// @api = 1.0
// @pubdate = 2023-08-09
// @publisher = Banana.ch SA
// @doctype = *.*
// @docproperties =
// @description = Export Products for WooCommerce
// @task = export.file
// @exportfiletype = csv
// @timeout = -1

//Check if the version of Banana Accounting is compatible
function verifyBananaAdvancedVersion() {
    if (!Banana.document)
        return false;


    if (!Banana.application.license || Banana.application.license.licenseType !== "advanced") {
        var msg = "This extension requires Banana Accounting+ Advanced";
        Banana.document.addMessage(msg, "ID_ERR_LICENSE_NOTVALID");
        return false;
    }



    return true;
}

function exec() {

    if ( isTest !== true && !verifyBananaAdvancedVersion() ) {
        return "@Cancel";
    }

    //Check if a document is opened
    if (!Banana.document) { return; }

    //Check if there is the Items table
    if (!Banana.document.table("Items")) { return; }
    var items = Banana.document.table("Items");

    var exportResult = '';

    exportResult += 'SKU,';
    exportResult += 'Name,';
    exportResult += 'Stock,';
    exportResult += 'Regular Price';
    exportResult += '\u000D';

    for (var i = 0; i < items.rowCount; i++) {
        if (items.row(i).value("RowId") != "") {
        var tRow = items.row(i);
        var sku = tRow.value("RowId");
        var name = tRow.value("Description");
        var stock = tRow.value("QuantityBalance");
        var price = tRow.value("UnitPrice");
        
        exportResult += sku + ',';
        exportResult += name + ',';
        exportResult += stock + ',';
        exportResult += price;
        exportResult += '\u000D';
        }
    }

    return exportResult;
}