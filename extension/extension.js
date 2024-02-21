const vscode = require("vscode");
const path = require("path");

/**
 * Grabs the path of the active editor
 * @param {*} activeEditor 
 * @returns The paths 
 */
function getRelativeParts(activeEditor) {
  const relative = vscode.workspace.asRelativePath(
    activeEditor.document.uri.path
  );
  const relative_parts = relative.split("/");

  // Strip the file extension from the individual parts and push them to the
  // list.
  let parts = [];
  for (const part of relative_parts) {
    parts.push(path.parse(part).name);
  }

  // Return the parts separated by a `.`
  return parts.join(".");
}

/**
 * recursively descent 
 * @param {*} symbols - an array of SymbolInformation and DocumentSymbol instances
 * @param {number} currentLine 
 * @param {string[]} levels - an array of parent symbols
 * @returns 
 */
function getLevels(symbols, currentLine, levels) {
  for (let child of symbols) {
    if (
      child.location.range.start.line <= currentLine &&
      child.location.range.end.line >= currentLine &&
      (child.kind == vscode.SymbolKind.Class ||
        child.kind == vscode.SymbolKind.Method ||
        child.kind == vscode.SymbolKind.Function)
    ) {
      levels.push(child.name);
      getLevels(child.children, currentLine, levels);
      break;
    }
  }

  return levels;
}

/**
 * This actually gets the breadcrumbs for the current editor and line from VSCode
 * @param {TextEditor} activeEditor 
 * @param {number} currentLine 
 * @returns an array of 
 */
function getSymbols(activeEditor, currentLine) {
  return new Promise((resolve, reject) => {
    vscode.commands
      .executeCommand(
        "vscode.executeDocumentSymbolProvider",
        activeEditor.document.uri
      )
      .then((symbols) => {
        if (symbols) {
          resolve(getLevels(symbols, currentLine, []));
        } else {
          resolve([]);
        }
      });
  });
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  let disposable = vscode.commands.registerCommand(
    "cunneen-copy-breadcrumbs.copy",
    function () {
      let activeEditor = vscode.window.activeTextEditor;
      const config = vscode.workspace.getConfiguration(
        "cunneen-copy-breadcrumbs"
      );

      if (activeEditor) {
        const currentLine = activeEditor.selection.active.line;
        const relative = getRelativeParts(activeEditor);

        getSymbols(activeEditor, currentLine).then((symbols) => {
          performActionWithBreadcrumbSymbols(config, symbols, relative);
        });
      } else {
        vscode.window.showErrorMessage("No active editor open.");
      }
    }
  );

  context.subscriptions.push(disposable);
}

/**
 * Perform the configured action, either pasting to the active terminal or copying to the clipboard.
 * @param {*} config
 * @param {*} symbols
 * @param {*} relative
 */
function performActionWithBreadcrumbSymbols(config, symbols, relative) {
  let breadcrumbs;
  const separationString = config.separationString ?? ".";

  if (symbols.length === 0) breadcrumbs = relative;
  else breadcrumbs = `${relative}.${symbols.join(separationString)}`;

  const activeTerminal = vscode.window.activeTerminal;
  if (config.pasteToTerminal && activeTerminal)
    activeTerminal.sendText(breadcrumbs, false);

  if (config.copyToClipboard) {
    vscode.env.clipboard.writeText(breadcrumbs);

    if (config.showAlert)
      vscode.window.showInformationMessage(
        `Copied "${breadcrumbs}" to clipboard.`
      );
  }
}

function deactivate() {
  /* no actions necessary upon deactivate. */
}

module.exports = {
  activate,
  deactivate,
};
