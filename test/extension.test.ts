// 
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as myExtension from '../src/extension';

// Defines a Mocha test suite to group tests of similar kind together
suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Extension should be present', () => {
		assert.ok(vscode.extensions.getExtension('vivainio.jadeview'));
	});

	test('Extension should activate', async () => {
		const extension = vscode.extensions.getExtension('vivainio.jadeview');
		assert.ok(extension);
		
		if (!extension!.isActive) {
			await extension!.activate();
		}
		
		assert.ok(extension!.isActive);
	});

	test('Jade View command should be available', async () => {
		const commands = await vscode.commands.getCommands();
		assert.ok(commands.includes('extension.jadeView'));
	});
});