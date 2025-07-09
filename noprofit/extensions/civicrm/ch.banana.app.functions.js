
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