// @id = ch.banana.application.invoice.export.items
// @api = 1.0
// @pubdate = 2022-10-24
// @publisher = Banana.ch SA
// @description = Export items
// @description.de = Artikeln exportieren
// @description.fr = Exporter articles
// @description.it = Esporta articoli
// @doctype = 400.400
// @docproperties =
// @task = export.file
// @exportfiletype = csv
// @exportfilename = items
// @outputformat = tablewithheaders
// @outputencoding = utf8
// @inputfilefilter = Text file (*.csv);;All files (*.*)
// @inputfilefilter.de = Text datei (*.csv);;All files (*.*)
// @inputfilefilter.fr = Fichier text(*.csv);;All files (*.*)
// @inputfilefilter.it = File testo (*.csv);;All files (*.*)

/**
 * Parse the file and create a document change document to import the imvoices.
 */
function exec() {
    let csv = "exported items";
    return csv;
}
