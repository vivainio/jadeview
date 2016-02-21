'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';


const html2jade = require('html2jade');
const tmp = require('tmp');

import path = require('path');
import fs = require('fs');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "jadeview" is now active!');
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.jadeView', () => {
        // The code you place here will be executed every time your command is executed

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

// this method is called when your extension is deactivated
export function deactivate() {
}