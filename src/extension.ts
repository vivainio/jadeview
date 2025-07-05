import * as vscode from 'vscode';
import * as tmp from 'tmp';
import * as fs from 'fs';
const html2jade = require('html2jade');

export function activate(context: vscode.ExtensionContext) {
    let tempFile: string | null = null;
    
    function getTempFile() {
        if (!tempFile) {
            tempFile = tmp.tmpNameSync({
                postfix: '.jade'
            });
        }
        return tempFile;
    }

    const disposable = vscode.commands.registerCommand('extension.jadeView', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }

        const selection = editor.selection;
        const range = new vscode.Range(selection.start, selection.end);

        let text = editor.document.getText(range);
        if (text.length === 0) {
            text = editor.document.getText();
        }

        const options = {
            noemptypipe: true,
            bodyless: true,
            nspaces: 2,
            noattrcomma: true,
        };

        html2jade.convertHtml(text, options, (err: any, jade: string) => {
            if (err) {
                vscode.window.showErrorMessage('Failed to convert to JADE: ' + err.message);
                return;
            }
            
            const fname = getTempFile();
            fs.writeFileSync(fname, jade);
            
            vscode.workspace.openTextDocument(fname).then((doc: vscode.TextDocument) => {
                vscode.window.showTextDocument(doc);
            });
        });
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {
    // Clean up any resources if needed
}