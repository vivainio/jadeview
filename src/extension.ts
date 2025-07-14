import * as vscode from 'vscode';
import * as tmp from 'tmp';
import * as fs from 'fs';
import { spawn } from 'child_process';
const html2pug = require('html2pug');

export function activate(context: vscode.ExtensionContext) {
    let tempFile: string | null = null;
    
    function getTempFile() {
        if (!tempFile) {
            tempFile = tmp.tmpNameSync({
                postfix: '.pug'
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
            tabs: false,
            fragment: true
        };

        try {
            const pug = html2pug(text, options);
            
            const fname = getTempFile();
            fs.writeFileSync(fname, pug);
            
            vscode.workspace.openTextDocument(fname).then((doc: vscode.TextDocument) => {
                vscode.window.showTextDocument(doc);
            });
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            vscode.window.showErrorMessage('Failed to convert to PUG: ' + errorMessage);
        }
    });

    const unxmlDisposable = vscode.commands.registerCommand('extension.unxml', () => {
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

        // Create a temporary file for the HTML content
        const inputFile = tmp.tmpNameSync({ postfix: '.html' });
        fs.writeFileSync(inputFile, text);
        
        // Execute the external unxml application
        const child = spawn('unxml', ["--special", inputFile]);
        let output = '';
        let errorOutput = '';
        
        child.stdout.on('data', (data: Buffer) => {
            output += data.toString();
        });
        
        child.stderr.on('data', (data: Buffer) => {
            errorOutput += data.toString();
        });
        
        child.on('close', (code: number) => {
            // Clean up the temporary input file
            try {
                fs.unlinkSync(inputFile);
            } catch (err) {
                // Ignore cleanup errors
            }
            
            if (code !== 0) {
                vscode.window.showErrorMessage(`unxml exited with code ${code}: ${errorOutput}`);
                return;
            }
            
            const fname = getTempFile();
            fs.writeFileSync(fname, output);
            
            vscode.workspace.openTextDocument(fname).then((doc: vscode.TextDocument) => {
                vscode.window.showTextDocument(doc);
            });
        });
        
        child.on('error', (error: Error) => {
            // Clean up the temporary input file on error
            try {
                fs.unlinkSync(inputFile);
            } catch (err) {
                // Ignore cleanup errors
            }
            vscode.window.showErrorMessage('Failed to execute unxml: ' + error.message);
        });
    });

    context.subscriptions.push(disposable);
    context.subscriptions.push(unxmlDisposable);
}

export function deactivate() {
    // Clean up any resources if needed
}