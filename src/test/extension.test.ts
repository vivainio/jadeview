// Note: leverages the Mocha test framework (TDD interface) via @vscode/test-cli.
// See https://mochajs.org/ for help.

import * as assert from 'assert';
import * as vscode from 'vscode';

const EXTENSION_ID = 'vivainio.jadeview';
const COMMANDS = [
	'extension.jadeView',
	'extension.unxml',
	'extension.unxmlSelect',
	'extension.unxmlSpecial',
];

async function activatedExtension() {
	const extension = vscode.extensions.getExtension(EXTENSION_ID);
	assert.ok(extension, 'extension not found');
	if (!extension.isActive) {
		await extension.activate();
	}
	return extension;
}

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Extension should be present', () => {
		assert.ok(vscode.extensions.getExtension(EXTENSION_ID));
	});

	test('Extension should activate', async () => {
		const extension = await activatedExtension();
		assert.ok(extension.isActive);
	});

	test('All commands should be registered', async () => {
		await activatedExtension();
		const commands = await vscode.commands.getCommands();
		for (const id of COMMANDS) {
			assert.ok(commands.includes(id), `missing command: ${id}`);
		}
	});
});
