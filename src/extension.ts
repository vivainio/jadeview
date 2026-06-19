import * as vscode from 'vscode';
import * as tmp from 'tmp';
import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';
const html2pug = require('html2pug');

export function activate(context: vscode.ExtensionContext) {
    // One reusable output temp file per extension, so repeated runs replace the
    // same tab. unxml output uses .unxml (highlighted by the grammar this
    // extension bundles); html2pug output uses .pug.
    const tempFiles = new Map<string, string>();

    function getTempFile(postfix: string) {
        let file = tempFiles.get(postfix);
        if (!file) {
            file = tmp.tmpNameSync({ postfix });
            tempFiles.set(postfix, file);
        }
        return file;
    }

    // The active editor's text (selection if any, else the whole document) and
    // the extension to give the temp input file. The extension matters: unxml's
    // --auto mode picks its formatter (xsd/xslt/schematron) from it, so we
    // mirror the source document instead of always pretending it's HTML.
    function getEditorPayload(): { text: string; ext: string } | null {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return null;
        }

        const range = new vscode.Range(editor.selection.start, editor.selection.end);
        let text = editor.document.getText(range);
        if (text.length === 0) {
            text = editor.document.getText();
        }

        return { text, ext: sourceExtension(editor.document) };
    }

    // Derive a sensible input-file extension from the document. Prefer the real
    // file extension; for unsaved buffers, map the language id to one unxml
    // recognises, defaulting to .xml.
    function sourceExtension(doc: vscode.TextDocument): string {
        const ext = path.extname(doc.fileName).toLowerCase();
        if (ext) {
            return ext;
        }
        const byLang: Record<string, string> = {
            xml: '.xml',
            xsl: '.xsl',
            xslt: '.xsl',
            xsd: '.xsd',
            html: '.html',
            schematron: '.sch',
        };
        return byLang[doc.languageId] ?? '.xml';
    }

    // Spawn unxml with the given args, feeding it `text` via a temp file whose
    // extension mirrors the source. Output is shown in a temp .pug document.
    function runUnxml(text: string, ext: string, args: string[]) {
        const config = vscode.workspace.getConfiguration('jadeview');
        const extraArgs = config.get<string[]>('unxmlExtraArgs', []);

        const inputFile = tmp.tmpNameSync({ postfix: ext });
        fs.writeFileSync(inputFile, text);

        // unxml is always expected on PATH.
        const child = spawn('unxml', [...args, ...extraArgs, inputFile]);
        let output = '';
        let errorOutput = '';

        child.stdout.on('data', (data: Buffer) => {
            output += data.toString();
        });

        child.stderr.on('data', (data: Buffer) => {
            errorOutput += data.toString();
        });

        child.on('close', (code: number) => {
            try {
                fs.unlinkSync(inputFile);
            } catch (err) {
                // Ignore cleanup errors
            }

            if (code !== 0) {
                vscode.window.showErrorMessage(`unxml exited with code ${code}: ${errorOutput}`);
                return;
            }

            const fname = getTempFile('.unxml');
            fs.writeFileSync(fname, output);

            vscode.workspace.openTextDocument(fname).then((doc: vscode.TextDocument) => {
                vscode.window.showTextDocument(doc);
            });
        });

        child.on('error', (error: Error) => {
            try {
                fs.unlinkSync(inputFile);
            } catch (err) {
                // Ignore cleanup errors
            }
            vscode.window.showErrorMessage(`Failed to execute unxml: ${error.message}`);
        });
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

            const fname = getTempFile('.pug');
            fs.writeFileSync(fname, pug);
            
            vscode.workspace.openTextDocument(fname).then((doc: vscode.TextDocument) => {
                vscode.window.showTextDocument(doc);
            });
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            vscode.window.showErrorMessage('Failed to convert to PUG: ' + errorMessage);
        }
    });

    // Default render: --auto picks the formatter (xml/xslt/xsd/schematron) from
    // the file extension and hides well-known namespaces (e.g. UBL cbc:/cac:).
    const unxmlDisposable = vscode.commands.registerCommand('extension.unxml', () => {
        const payload = getEditorPayload();
        if (payload) {
            runUnxml(payload.text, payload.ext, ['--auto']);
        }
    });

    // Render only the subtrees whose tag matches a name the user types. A bare
    // name matches the local name (ignoring namespace prefixes); a prefixed
    // name like cac:InvoiceLine matches the full name.
    const unxmlSelectDisposable = vscode.commands.registerCommand('extension.unxmlSelect', async () => {
        const payload = getEditorPayload();
        if (!payload) {
            return;
        }

        const tag = await vscode.window.showInputBox({
            title: 'Unxml: Select Tag',
            prompt: 'Element name to render (e.g. InvoiceLine or cac:InvoiceLine)',
            placeHolder: 'tag name',
        });
        if (!tag) {
            return;
        }

        runUnxml(payload.text, payload.ext, ['--auto', '--select', tag]);
    });

    // Proprietary business-element transformation rules.
    const unxmlSpecialDisposable = vscode.commands.registerCommand('extension.unxmlSpecial', () => {
        const payload = getEditorPayload();
        if (payload) {
            runUnxml(payload.text, payload.ext, ['--special']);
        }
    });

    context.subscriptions.push(disposable);
    context.subscriptions.push(unxmlDisposable);
    context.subscriptions.push(unxmlSelectDisposable);
    context.subscriptions.push(unxmlSpecialDisposable);
}

export function deactivate() {
    // Clean up any resources if needed
}