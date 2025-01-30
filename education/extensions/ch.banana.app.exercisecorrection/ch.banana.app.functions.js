
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

//Functions to write the ac2 file

function getCurrentDate(isTest) {
    if (!isTest) {
        let d = new Date();
        let datestring = d.getFullYear() + ("0" + (d.getMonth() + 1)).slice(-2) + ("0" + d.getDate()).slice(-2);
        return Banana.Converter.toInternalDateFormat(datestring, "yyyymmdd");
    }
    else {
        return "";
    }
}

function getCurrentTime(isTest) {
    if (!isTest) {
        let d = new Date();
        let timestring = ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
        return Banana.Converter.toInternalTimeFormat(timestring);
    }
    else {
        return "";
    }
}

function initDocument(isTest) {
    let jsonDoc = {};
    jsonDoc.document = {};
    jsonDoc.document.fileVersion = "1.0.0";
    jsonDoc.document.dataUnits = [];
    jsonDoc.creator = {};
    jsonDoc.creator.executionDate = getCurrentDate(isTest);
    jsonDoc.creator.executionTime = getCurrentTime(isTest);
    jsonDoc.creator.name = Banana.script.getParamValue("id");
    jsonDoc.creator.version = "1.0";
    return jsonDoc;
}