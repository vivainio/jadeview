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

        const cursor = editor.selection.active;
        const anchor = editor.selection.anchor;
        const range = new vscode.Range(anchor, cursor);

        let text  = editor.document.getText(range);
        if (text.length === 0) {
            text = editor.document.getText();
        }

        const options = {
            noemptypipe: true,
            bodyless: true,
            nspaces: 2,
            noattrcomma: true,

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