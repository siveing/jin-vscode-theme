# Developing Jin Cute Theme

Every color comes from one file, `src/palette.js`. The build turns it into the two theme files VS Code reads.

## Project layout

| Path | What it is |
| --- | --- |
| `src/palette.js` | **Edit this.** Backgrounds, text colors, accents, hues and syntax roles for both variants. |
| `src/build.js` | Turns the palette into full theme files and checks text contrast. |
| `src/preview.js` | Writes `preview.html`, a quick mock-up of both variants. `preview.html#dark` and `#light` show one full-window theme, used for the README screenshots. |
| `themes/*.json` | Generated theme files. Don't edit them by hand, because the next build overwrites them. |
| `samples/` | TypeScript, Python and Markdown files for checking syntax colors. |
| `images/` | README screenshots and the icon source (`icon.svg`). `icon.png` at the root is the Marketplace icon. |
| `ui/rounded.css` | Optional rounded corners, loaded with a custom CSS extension (not part of the published theme). |
| `extras/jin-cute-tools/` | A personal, unpublished extension with the Cmd+R / Cmd+I shortcuts and cursor settings. |

## Customize

1. Change colors in `src/palette.js`:
   - `ui.bg0`–`bg4`: backgrounds, from the most recessed (title bar) to the most raised (selections).
   - `ui.fg0`–`fg4`: text, from brightest to faintest.
   - `accent`: the main pink (active tab, activity bar, buttons, badges, selections).
   - `pink`: the stronger hot pink (cursor, active line number, bracket guides, indentation dots).
   - `syntax`: which color each kind of code gets, for example `keyword: darkHues.red`.
2. Rebuild:

   ```bash
   npm run build
   ```

   The build prints a contrast check, so you know if a color became hard to read on the editor background.
3. Open `preview.html` in a browser for a quick look.

## Preview in VS Code

1. Open this folder in VS Code.
2. Press **F5**. A second window (the Extension Development Host) opens with the `samples` folder.
3. In that window, run **Preferences: Color Theme** and pick **Jin Cute Dark** or **Jin Cute Light**.
4. In the first window's terminal, run `npm run watch`. Each time you save `palette.js`, the theme rebuilds and the preview window updates right away.

To find out which scope a token uses, run **Developer: Inspect Editor Tokens and Scopes** in the preview window and click on the code.

## Install locally

```bash
npm run install-theme
```

This builds the theme, packages it as `jin-cute-theme.vsix` and installs it. Then run **Developer: Reload Window** in VS Code.

The personal shortcuts and cursor settings are a separate extension:

```bash
npm run install-tools
```

It adds Sublime Text style shortcuts (Cmd+R function list, Cmd+I implementation or definition, duplicate/delete/move lines, multi-cursor keys and more) and editor defaults (Fira Code with ligatures, a gliding and pulsing line cursor, dotted indentation, bracket guide lines). The full list is in `extras/jin-cute-tools/README.md`.

If `npm` fails with `EACCES` inside `~/.npm`, some cache files belong to root (usually from an old `sudo npm`). Fix it once with:

```bash
sudo chown -R $(id -u):$(id -g) ~/.npm
```

## Rounded corners

`ui/rounded.css` rounds the top corners of editor tabs (12px), the selected and hovered explorer rows (10px), popups such as the command palette and suggestions (14px), buttons and inputs (8px), and editor text selections. Change the `--jc-radius-*` values at the top of the file to adjust them.

To load it, use the **Custom CSS and JS Loader** extension (`be5invis.vscode-custom-css`):

1. Install it from the Extensions view.
2. In your user `settings.json`, add the full path to the stylesheet:

   ```json
   "vscode_custom_css.imports": ["file:///FULL/PATH/TO/jin-vscode-theme/ui/rounded.css"]
   ```

3. Run **Enable Custom CSS and JS**, then restart VS Code.

The loader edits VS Code's own files, so VS Code reports that the installation "appears to be corrupt"; choose **Don't Show Again**. Run **Reload Custom CSS and JS** after each VS Code update, and **Disable Custom CSS and JS** to undo it. The rules rely on VS Code's internal class names, so an update can occasionally break one. Colors are unaffected either way.

## Publish to the Marketplace

One-time setup:

1. Create the publisher **siveing** at https://marketplace.visualstudio.com/manage.
2. Create a publishing credential (an Azure DevOps Personal Access Token with the **Marketplace → Manage** scope; check the [publishing guide](https://code.visualstudio.com/api/working-with-extensions/publishing-extension) for current options).
3. Sign in:

   ```bash
   npx @vscode/vsce login siveing
   ```

Each release:

1. Push to GitHub first. The README screenshots are linked from the repository, so they must be on GitHub to show on the Marketplace page.
2. Add an entry to `CHANGELOG.md` and raise `version` in `package.json` (or let `vsce publish patch` raise it).
3. Publish:

   ```bash
   npm run publish
   ```

Only the theme is published: `.vscodeignore` leaves out the source, samples, screenshots, `ui/` and `extras/`. Run `npm run package` first to check exactly what goes into the package.

To also reach Cursor and VSCodium users, publish the same package to [Open VSX](https://open-vsx.org):

```bash
npx ovsx publish jin-cute-theme.vsix -p YOUR-OPEN-VSX-TOKEN
```
