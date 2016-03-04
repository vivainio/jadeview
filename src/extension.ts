'use strict';
import * as vscode from 'vscode';


const html2jade = require('html2jade');
const tmp = require('tmp');

import path = require('path');
import fs = require('fs');

export function activate(context: vscode.ExtensionContext) {
    let _temp = null;
    function getTempFile() {
        if (!_temp) {
            _temp = tmp.tmpNameSync({
                postfix:'.jade'
            });
        }
        return _temp;
    }

    let disposable = vscode.commands.registerCommand('extension.jadeView', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        
        const text = editor.document.getText();
        const options = {
            noemptypipe: true,
            bodyless: true
        }
        html2jade.convertHtml(text, options, (err, jade) => {
            if (err) {
                vscode.window.showErrorMessage('Failed to convert to JADE');
                return;
            }
            const fname = getTempFile();
            fs.writeFileSync(fname, jade);
            vscode.workspace.openTextDocument(fname).then((doc) => {
                        vscode.window.showTextDocument(doc);
            });
        });
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {
}