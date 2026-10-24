# Jin Cute Theme

A cute pink color theme for VS Code, in two flavors:

- **Jin Cute Dark**: true black backgrounds with pink accents
- **Jin Cute Light**: a soft blush background with deeper pinks

![Jin Cute Dark](images/dark.png)

![Jin Cute Light](images/light.png)

## Highlights

- **Black, not brown or blue-gray.** The dark editor is `#131315`, and the title and activity bars are a deeper `#09090a`.
- **Pink where it counts.** The active tab, activity bar, selections, badges, status bar, cursor and keywords are pink. Functions are blue and arguments are italic (butter yellow in dark, magenta in light), so calls and their arguments never blur together. Strings are green and types teal, with no brown or orange anywhere in your code.
- **Readable.** Every code color meets a 4.5:1 contrast ratio against the editor background, and comments meet at least 3.5:1.
- **Complete.** Covers the whole workbench, the integrated terminal's 16 colors, git decorations, diff and merge views, bracket pair colors and semantic highlighting from language servers (TypeScript, Python, Rust and more).

## Install

1. Open the Extensions view (Cmd+Shift+X on Mac, Ctrl+Shift+X on Windows/Linux).
2. Search for **Jin Cute Theme** and click **Install**.
3. Open the Command Palette (Cmd+Shift+P / Ctrl+Shift+P), run **Preferences: Color Theme**, and pick **Jin Cute Dark** or **Jin Cute Light**.

Or install from the command line:

```bash
code --install-extension siveing.jin-cute-theme
```

## Recommended settings (optional)

The screenshots use [Fira Code](https://github.com/tonsky/FiraCode) with ligatures. The theme is designed for a thin pink line cursor that glides and pulses, faint dots in the indentation, and a pink line joining the brackets around the cursor. To get that look, add these to your `settings.json`:

```json
{
  "editor.fontFamily": "'Fira Code', Menlo, monospace",
  "editor.fontLigatures": true,
  "editor.cursorStyle": "line",
  "editor.cursorWidth": 2,
  "editor.cursorBlinking": "expand",
  "editor.cursorSmoothCaretAnimation": "on",
  "editor.smoothScrolling": true,
  "editor.renderWhitespace": "boundary",
  "editor.guides.bracketPairs": "active",
  "editor.guides.bracketPairsHorizontal": "active",
  "editor.bracketPairColorization.enabled": true
}
```

## Rounded corners (optional)

VS Code themes can only change colors. If you'd like rounded tabs, pill-shaped file selections and rounder popups, there's a companion stylesheet, [`ui/rounded.css`](https://github.com/siveing/jin-vscode-theme/blob/HEAD/ui/rounded.css), that you can load with the [Custom CSS and JS Loader](https://marketplace.visualstudio.com/items?itemName=be5invis.vscode-custom-css) extension. The loader edits VS Code's own files, so VS Code will show an "installation appears to be corrupt" notice, and you'll need to reload the CSS after each VS Code update. Setup steps are in [DEVELOPMENT.md](https://github.com/siveing/jin-vscode-theme/blob/HEAD/DEVELOPMENT.md#rounded-corners).

## Palette

| Role | Dark | Light |
| --- | --- | --- |
| Editor background | `#131315` | `#fff8f9` |
| Text | `#e6e0e3` | `#3b2530` |
| Accent (pink) | `#ff8fc8` | `#c4367a` |
| Cursor and control flow (hot pink) | `#ff6fa8` | `#c41a5c` |
| Functions (sky / azure blue) | `#82c4f5` | `#1f5fbf` |
| Parameters, in italics (butter / magenta) | `#d8cb8e` | `#a03ab8` |
| Strings (green) | `#a6e3a1` | `#2e7d32` |
| Types (teal) | `#7fd1c0` | `#1c7465` |
| Properties (lavender / cyan) | `#c3b6f5` | `#0e7490` |
| Numbers and constants (coral / crimson) | `#f2707a` | `#b8323c` |

## Feedback

Found a color that's hard to read, or a language that doesn't look right? [Open an issue](https://github.com/siveing/jin-vscode-theme/issues). A screenshot and the output of **Developer: Inspect Editor Tokens and Scopes** help a lot.

## License

[MIT](https://github.com/siveing/jin-vscode-theme/blob/HEAD/LICENSE)
