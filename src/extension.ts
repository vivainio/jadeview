'use strict';
import * as vscode from 'vscode';


const html2jade = require('html2jade');
const tmp = require('tmp');

import path = require('path');
import fs = require('fs');

export function activate(context: vscode.ExtensionContext) {

    let disposable = vscode.commands.registerCommand('extension.jadeView', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        const text = editor.document.getText();

        html2jade.convertHtml(text, {}, (err, jade) => {
            const fname = path.basename(editor.document.fileName);
            const {fd, name} = tmp.fileSync({
                prefix: fname + '.',
                postfix:'.jade'
            });

            fs.write(fd, jade);
            fs.close(fd, (err) => {
                vscode.workspace.openTextDocument(name).then((doc) => {
                    vscode.window.showTextDocument(doc);
                });
            });
        });
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {
}