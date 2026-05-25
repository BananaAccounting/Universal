// @api = 1.0
// @id = ch.banana.uni.investment.accounting.chart
// @description = Charts
// @task = app.command
// @doctype = 100.*
// @publisher = Aaron Ploszaj
// @pubdate = 2026-05-14
// @inputdatasource = none
// @timeout = -1
// @includejs = ch.banana.portfolio.accounting.calculation.methods.js

function exec() {
    Banana.console.debug("exec called");
    var dialog = Banana.Ui.createQml("Portfolio dashboard", "qml/main.qml");
    dialog.exec();
}
