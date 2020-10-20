// Copyright [2020] [Banana.ch SA - Lugano Switzerland]
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//     http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// @id = charts.js
// @api = 1.0
// @pubdate = 2020-09-01
// @publisher = Banana.ch SA
// @description = Financial Charts
// @task = app.command
// @doctype = 100.*
// @timeout = -1
// @includejs = financialStatementAnalysis.js

function exec(inData, options) {
    var dialog = Banana.Ui.createQml("Financing Charts", "charts.qml");
    Banana.application.progressBar.pause(); 
    dialog.exec();
    Banana.application.progressBar.resume();
}