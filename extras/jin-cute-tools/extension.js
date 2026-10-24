// Jin Cute's one command: a Sublime Text style "Goto Symbol" (Cmd+R) that lists only functions and methods.
// Typing filters the list, moving through it previews each function in the editor,
// Enter jumps there, and Escape returns to where you were.
const vscode = require('vscode');

const FUNCTION_KINDS = new Set([vscode.SymbolKind.Function, vscode.SymbolKind.Method, vscode.SymbolKind.Constructor]);

const ICONS = {
  [vscode.SymbolKind.Function]: '$(symbol-function)',
  [vscode.SymbolKind.Method]: '$(symbol-method)',
  [vscode.SymbolKind.Constructor]: '$(symbol-method)',
};

// Language servers return either a DocumentSymbol tree or a flat SymbolInformation list.
function collectFunctions(symbols, container = '') {
  const found = [];
  for (const symbol of symbols || []) {
    const range = symbol.selectionRange || symbol.range || symbol.location.range;
    if (FUNCTION_KINDS.has(symbol.kind)) {
      found.push({ name: symbol.name, kind: symbol.kind, container: symbol.containerName || container, range });
    }
    if (symbol.children) found.push(...collectFunctions(symbol.children, symbol.name));
  }
  return found.sort((a, b) => a.range.start.line - b.range.start.line || a.range.start.character - b.range.start.character);
}

async function goToFunction() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;

  const symbols = await vscode.commands.executeCommand('vscode.executeDocumentSymbolProvider', editor.document.uri);
  const functions = collectFunctions(symbols);
  if (functions.length === 0) {
    vscode.window.setStatusBarMessage('No functions found in this file', 3000);
    return;
  }

  const original = { selections: editor.selections, visible: editor.visibleRanges[0] };
  const highlight = vscode.window.createTextEditorDecorationType({
    isWholeLine: true,
    backgroundColor: new vscode.ThemeColor('editor.rangeHighlightBackground'),
  });

  const picker = vscode.window.createQuickPick();
  picker.placeholder = 'Go to function';
  picker.matchOnDescription = true;
  picker.items = functions.map((fn) => ({
    label: `${ICONS[fn.kind]} ${fn.name}`,
    description: fn.container,
    fn,
  }));

  const preview = (item) => {
    if (!item) return;
    editor.revealRange(item.fn.range, vscode.TextEditorRevealType.InCenterIfOutsideViewport);
    editor.setDecorations(highlight, [item.fn.range]);
  };

  let accepted = false;
  picker.onDidChangeActive(([item]) => preview(item));
  picker.onDidAccept(() => {
    const item = picker.activeItems[0];
    if (item) {
      accepted = true;
      const pos = item.fn.range.start;
      editor.selection = new vscode.Selection(pos, pos);
      editor.revealRange(item.fn.range, vscode.TextEditorRevealType.InCenterIfOutsideViewport);
    }
    picker.hide();
  });
  picker.onDidHide(() => {
    highlight.dispose();
    picker.dispose();
    if (!accepted) {
      editor.selections = original.selections;
      if (original.visible) editor.revealRange(original.visible, vscode.TextEditorRevealType.AtTop);
    }
  });

  // Start on the function the cursor is in (or the nearest one above it).
  const cursorLine = editor.selection.active.line;
  const current = [...picker.items].reverse().find((item) => item.fn.range.start.line <= cursorLine);
  if (current) picker.activeItems = [current];

  picker.show();
}

function activate(context) {
  context.subscriptions.push(vscode.commands.registerCommand('jinCute.goToFunction', goToFunction));
}

module.exports = { activate, deactivate() {}, collectFunctions };
