# Jin Cute Tools

A personal companion to Jin Cute Theme. It isn't published. Install it from the repository root with `npm run install-tools`.

## Sublime Text style shortcuts

| Mac | Windows/Linux | What it does |
| --- | --- | --- |
| Cmd+R | Ctrl+R | **Go to Function**: lists only the functions, methods and constructors in the current file. Type to filter, ↑/↓ to preview, Enter to jump, Esc to go back. |
| Cmd+Shift+R | Ctrl+Shift+R | Go to symbol in the whole project |
| Cmd+I | Ctrl+I | **Go to Implementation**, or to the definition when the language can't find implementations |
| Cmd+Alt+↓ | F12 | Go to definition |
| Cmd+Ctrl+G | Alt+F3 | Select all occurrences of the current word |
| Cmd+Shift+L | Ctrl+Shift+L | Split a selection into one cursor per line |
| Ctrl+Shift+↑ / ↓ | Ctrl+Alt+↑ / ↓ | Add a cursor on the line above / below |
| Cmd+Shift+Space | Ctrl+Shift+Space | Expand the selection to the enclosing scope |
| Cmd+Shift+D | Ctrl+Shift+D | Duplicate line |
| Ctrl+Shift+K | Ctrl+Shift+K | Delete line |
| Cmd+Ctrl+↑ / ↓ | Ctrl+Shift+↑ / ↓ | Move line up / down |
| Cmd+J | Ctrl+J | Join lines |
| Cmd+K Cmd+U / Cmd+K Cmd+L | Ctrl+K Ctrl+U / Ctrl+K Ctrl+L | Upper case / lower case |
| Cmd+K Cmd+K / Cmd+K Cmd+⌫ | Ctrl+K Ctrl+K / Ctrl+K Ctrl+⌫ | Delete to end / start of line |
| Cmd+K Cmd+B | Ctrl+K Ctrl+B | Toggle the side bar |
| Cmd+Ctrl+P | Ctrl+Alt+P | Switch project (open recent) |
| Cmd+Alt+1 / 2 / 3 | Alt+Shift+1 / 2 / 3 | One, two or three editor columns |

Shortcuts VS Code already shares with Sublime (Cmd+P, Cmd+Shift+P, Cmd+D, Cmd+L, Ctrl+G, Cmd+/, Cmd+Enter, Cmd+Shift+Enter, Ctrl+-) are left as they are.

These replace VS Code's own meaning of a few keys while you're typing in an editor: Cmd+J (toggle panel), Cmd+Shift+D (Run and Debug), Cmd+Shift+L (select all occurrences, now Cmd+Ctrl+G), and Cmd+K Cmd+U / Cmd+K Cmd+L (uncomment, fold). Change any of them in **Preferences: Open Keyboard Shortcuts**.

## Editor defaults

- Fira Code with ligatures in the editor and terminal
- A thin line cursor that glides and pulses
- Smooth scrolling
- Indentation shown as faint dots (`renderWhitespace: "boundary"`)
- Bracket pair guide lines

Your own settings always win over these.
