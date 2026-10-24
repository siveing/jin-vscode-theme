# Jin Cute Theme

A cute pink color theme for VS Code: **Jin Cute Dark** (true black) and **Jin Cute Light** (soft blush).
Every color comes from one file, `src/palette.js`.

## Project layout

| Path | What it is |
| --- | --- |
| `src/palette.js` | **Edit this.** Backgrounds, text colors, accent, hues and syntax roles for both variants. |
| `src/build.js` | Turns the palette into full theme files and checks text contrast. |
| `src/preview.js` | Writes `preview.html`, a quick mock-up of both variants. |
| `themes/*.json` | Generated theme files. Don't edit them by hand, because the next build overwrites them. |
| `samples/` | TypeScript, Python and Markdown files for checking syntax colors. |

## Customize

1. Change colors in `src/palette.js`:
   - `ui.bg0`–`bg4`: backgrounds, from the most recessed (title bar) to the most raised (selections).
   - `ui.fg0`–`fg4`: text, from brightest to faintest.
   - `accent`: cursor, focus rings, active tab, buttons, badges.
   - `syntax`: which color each kind of code gets, for example `keyword: darkHues.red`.
2. Rebuild:

   ```bash
   npm run build
   ```

   The build prints a contrast check, so you know if a color became hard to read on the editor background.
3. Open `preview.html` in a browser for a quick look.

## Pink accents, cursor animation and dotted indentation

Pink is the main accent (`accent` in the palette). It colors the active tab, the activity bar, buttons, badges, the status bar, selections, links, keywords and HTML tags. A stronger hot pink (`pink` in the palette) is used for the text cursor, the active line number, the matching-bracket box, bracket guide lines, the active indent guide, the indentation dots and control-flow words like `import`, `return` and `await`. Function names stay amber, so code doesn't become all one color.

The extension also sets these editor defaults in `package.json` → `contributes.configurationDefaults`:

| Setting | Effect |
| --- | --- |
| `editor.cursorStyle: "line"`, `cursorWidth: 2` | Thin line cursor |
| `editor.cursorSmoothCaretAnimation: "on"` | The cursor glides to its new position instead of jumping |
| `editor.cursorBlinking: "expand"` | The cursor pulses (shrinks and grows) as it blinks |
| `editor.smoothScrolling`, `workbench.list.smoothScrolling` | Animated scrolling |
| `editor.renderWhitespace: "boundary"` | Indentation shows as faint `·` dots and tabs as `→` arrows |
| `editor.guides.bracketPairs: "active"` | A pink line joins the brackets around the cursor |

These apply while the extension is installed, whichever theme is active. Anything you set in your own settings wins. VS Code always draws indent guides as solid lines and the mouse pointer belongs to the operating system, so a theme can't change either one.

## Sublime Text style shortcuts

| Mac | Windows/Linux | What it does |
| --- | --- | --- |
| Cmd+R | Ctrl+R | **Go to Function**: lists only the functions, methods and constructors in the current file. Type to filter, use ↑/↓ to preview each one in the editor, press Enter to jump there, or press Esc to go back to where you were. |
| Cmd+I | Ctrl+I | **Go to Implementation**: jumps to where the interface, abstract method or function under the cursor is implemented, and opens a peek list if there are several. |

Notes:
- Go to Function lists what the language's extension reports as a function or method. In TypeScript and JavaScript, an arrow function stored in a `const` counts as a variable, so it isn't listed.
- These shortcuts replace VS Code's defaults for the same keys while the extension is installed (on Mac, Cmd+I normally starts inline chat). To change them, open **Preferences: Open Keyboard Shortcuts** and search for `jinCute.goToFunction` or `editor.action.goToImplementation`.
- The command is in the Command Palette as **Jin Cute: Go to Function in File**. The code is in `extension.js`.

## Rounded tabs and files (optional)

VS Code themes can only set colors, so the rounded corners live in a separate stylesheet, `ui/rounded.css`. It rounds:
- the top corners of editor tabs (12px)
- the selected, focused and hovered rows in the explorer, almost into pills (10px)
- the command palette, suggestions, hovers, menus and notifications (14px)
- buttons, inputs and dropdowns (8px), and text selections in the editor

To make things rounder or flatter, change the `--jc-radius-*` values at the top of the file.

To turn it on, use the **Custom CSS and JS Loader** extension (`be5invis.vscode-custom-css`):

1. Install it from the Extensions view.
2. Open your user `settings.json` (**Preferences: Open User Settings (JSON)**) and add the full path to the stylesheet:

   ```json
   "vscode_custom_css.imports": ["file:///FULL/PATH/TO/jin-cute-theme/ui/rounded.css"]
   ```

3. Run **Enable Custom CSS and JS** from the Command Palette, then restart VS Code.

Things to know:
- The loader works by editing VS Code's own files. VS Code will then say the installation "appears to be corrupt". That's expected; choose **Don't Show Again**.
- After every VS Code update, run **Reload Custom CSS and JS** again.
- To undo it, run **Disable Custom CSS and JS** and restart.
- Keep this project in a permanent folder, because the setting points at the file's path.
- These rules rely on VS Code's internal class names, so an update can occasionally break one. Colors are unaffected either way.

## Preview it in VS Code

1. Open this folder in VS Code.
2. Press **F5**. A second window (the Extension Development Host) opens with the `samples` folder.
3. In that window, open the Command Palette (Cmd+Shift+P), run **Preferences: Color Theme**, and pick **Jin Cute Dark** or **Jin Cute Light**.
4. In the first window's terminal, run `npm run watch`. Each time you save `palette.js`, the theme rebuilds and the preview window updates right away.

To find out which scope a token uses, run **Developer: Inspect Editor Tokens and Scopes** in the preview window and click on the code.

## Install it for everyday use

```bash
npm run install-theme
```

This builds the theme, packages it as `jin-cute-theme-0.1.0.vsix` (it uses `npx` to fetch `@vscode/vsce`), and installs it with `code --install-extension`. Run it again after any change, then choose the theme in **Preferences: Color Theme**.

To uninstall it:

```bash
code --uninstall-extension local.jin-cute-theme
```

## Publish (optional)

To share the theme on the Marketplace, change `publisher` in `package.json` to your own publisher ID, add a `repository`, `LICENSE` and icon, then follow the [publishing guide](https://code.visualstudio.com/api/working-with-extensions/publishing-extension).
