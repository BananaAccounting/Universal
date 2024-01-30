// Copyright [2024] [Banana.ch SA - Lugano Switzerland]
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//  http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// @api = 1.0
// @id = ch.banana.uni.bank.data.sync
// @description = Synchronisation of Bank data
// @task = app.command
// @publisher = Banana.ch SA
// @pubdate = 2024-01-30
// @inputdatasource = none

/**
* This extension receives the contents of a file from Banana and checks what type of file it is
 * according to those defined for the synchronisation of accounting with bank data.
 * If the file is found to be valid, then it returns the file data in JSON format with the following structure:
 * {
 * - File Name
 * - File Params
 * - File Rows (Actual transactions)
 * }
 * Depending on the file format, this extension will call specific data conversion classes.
 */

function exec(fileContent) {
    Banana.console.debug("exec() called from: ch.banana.switzerland.synchronize.bank.data");
    return "";
}