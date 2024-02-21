const vscode = require('vscode');
const path = require('path')

function getRelativeParts(activeEditor) {
	
	const relative = vscode.workspace.asRelativePath(activeEditor.document.uri.path);
	const relative_parts = relative.split('/');
	
	// Strip the file extension from the individual parts and push them to the
	// list.
	var parts = [];
	for (part of relative_parts) {
		parts.push(path.parse(part).name);
	}
	
	// Return the parts separated by a `.`
	return parts.join('.');
}

function getLevels(symbols, currentLine, levels) {
	
	for (var child of symbols) {
		
		if (
			child.location.range.start.line <= currentLine && 
			child.location.range.end.line >= currentLine &&
			(
				child.kind == vscode.SymbolKind.Class || 
				child.kind == vscode.SymbolKind.Method || 
				child.kind == vscode.SymbolKind.Function
			)
		)
		{	
			levels.push(child.name);
			getLevels(child.children, currentLine, levels);
			break;
		}	
	}
	
	return levels;
}

function getSymbols(activeEditor, currentLine) {
	
	return new Promise((resolve, reject) => {
		vscode.commands.executeCommand('vscode.executeDocumentSymbolProvider', activeEditor.document.uri).then(
			symbols => {
				
				if (symbols) {
					resolve(getLevels(symbols, currentLine, []));
				}
				else {
					resolve([]);
				}
			}
		);	
	});
	
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	let disposable = vscode.commands.registerCommand('copy-breadcrumbs.copy', function () {
		
		var activeEditor = vscode.window.activeTextEditor;
		const config = vscode.workspace.getConfiguration('copy-breadcrumbs');
		
		if (activeEditor) {
			
			const currentLine = activeEditor.selection.active.line;
			const relative = getRelativeParts(activeEditor);
			
			getSymbols(activeEditor, currentLine).then((symbols) => {
				
				let breadcrumbs;
				
				if (symbols.length === 0)
					breadcrumbs = relative;
				else
					breadcrumbs = `${relative}.${symbols.join('.')}`
				
				const activeTerminal = vscode.window.activeTerminal;
				if (config.pasteToTerminal && activeTerminal)
					activeTerminal.sendText(breadcrumbs, false);
				
				if (config.copyToClipboard)
				{
					vscode.env.clipboard.writeText(breadcrumbs);

					if (config.showAlert)
						vscode.window.showInformationMessage(`Copied "${breadcrumbs}" to clipboard.`);
				}
			});
		}
		else {
			vscode.window.showErrorMessage('No active editor open.');
		}
	});

	context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
	activate,
	deactivate
}
