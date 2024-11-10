import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('fancy-comments.convertToFancyComment', async () => {
		try {
			const editor = vscode.window.activeTextEditor;
			if (!editor) {
				vscode.window.showErrorMessage('No active editor found');
				return;
			}

			const selection = editor.selection;
			if (selection.isEmpty) {
				vscode.window.showInformationMessage('Please select text to convert');
				return;
			}

			// Get selected text and trim whitespace
			const text = editor.document.getText(selection).trim();
			if (!text) {
				vscode.window.showWarningMessage('Selection is empty');
				return;
			}

			// Create comment with proper language syntax
			const fancyComment = createFancyComment(text);

			// Replace selection with fancy comment
			await editor.edit(editBuilder => {
				editBuilder.replace(selection, fancyComment);
			});

			// Move cursor to end of inserted comment
			const newPosition = editor.selection.end;
			editor.selection = new vscode.Selection(newPosition, newPosition);

		} catch (error) {
			vscode.window.showErrorMessage(`Error creating comment: ${error}`);
		}
	});

	context.subscriptions.push(disposable);
}

function createFancyComment(text: string): string {
	const lines = text.split('\n');
	const maxLength = Math.max(...lines.map(line => line.length));
	const width = Math.max(maxLength + 4, 40);

	let result = '';

	// Top border
	result += '/*\n';
	result += ' * ' + '╔' + '═'.repeat(width - 2) + '╗\n';

	// Empty line
	result += ' * ' + '║' + ' '.repeat(width - 2) + '║\n';

	// Content
	for (const line of lines) {
		const padding = Math.floor((width - line.length - 2) / 2);
		const extraSpace = (width - line.length - 2) % 2;
		result += ' * ' + '║' + ' '.repeat(padding) + line + ' '.repeat(padding + extraSpace) + '║\n';
	}

	// Empty line
	result += ' * ' + '║' + ' '.repeat(width - 2) + '║\n';

	// Bottom border
	result += ' * ' + '╚' + '═'.repeat(width - 2) + '╝\n';
	result += ' */\n';

	return result;
}

export function deactivate() { }