// Renders preview.html: a mock VS Code window per theme, painted with the generated colors.
// It's a quick look only; press F5 in VS Code to see the real thing.

const SAMPLE = `import { readFile } from 'node:fs/promises';

/** A dish that takes time to cook. */
export interface Recipe {
  name: string;
  minutes: number;
  tags?: string[];
}

const MAX_HEAT = 220;

@injectable()
export class Kitchen {
  private cache = new Map<string, Recipe>();

  async simmer(path: string, heat = 180): Promise<Recipe> {
    if (heat > MAX_HEAT) throw new Error(\`Too hot: \${heat}°\`);

    const raw = await readFile(path, 'utf8');
    const recipe: Recipe = JSON.parse(raw);
    this.cache.set(path, recipe);
    return /slow/i.test(recipe.name) ? { ...recipe, minutes: 90 } : recipe;
  }
}`;

const CURRENT_LINE = 19;
const GUTTER = { 10: 'added', 21: 'modified', 22: 'modified' };
const ACTIVE_GUIDE = { column: 2, lines: [17, 18, 19, 20, 21, 22] };

// Mirrors how the TypeScript grammar scopes these words (storage.* vs keyword.control.*).
const KEYWORDS = new Set(['const', 'let', 'function', 'class', 'interface', 'async', 'new', 'private', 'readonly', 'extends', 'typeof']);
const CONTROL = new Set(['import', 'export', 'from', 'return', 'if', 'else', 'throw', 'await', 'for', 'while']);
const CONSTANTS = new Set(['true', 'false', 'null', 'undefined']);
const PRIMITIVES = new Set(['string', 'number', 'boolean', 'void']);
// Names in the sample that a language server would report as parameters / properties.
const PARAMS = new Set(['path', 'heat']);
const PROPS = new Set(['name', 'minutes', 'tags', 'cache']);

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const span = (role, text) => `<span class="t-${role}">${esc(text)}</span>`;

function classify(word, prev, next) {
  if (CONTROL.has(word)) return 'control';
  if (KEYWORDS.has(word)) return 'keyword';
  if (CONSTANTS.has(word)) return 'constant';
  if (word === 'this') return 'language';
  if (PRIMITIVES.has(word)) return 'type';
  if (next === '(') return 'function';
  if (PARAMS.has(word)) return 'parameter';
  if (prev === '.' || PROPS.has(word)) return 'property';
  if (/^[A-Z][A-Z0-9_]+$/.test(word) && word !== 'JSON') return 'constant';
  if (/^[A-Z]/.test(word)) return 'type';
  return 'variable';
}

function highlightLine(line) {
  const re = /(\/\/.*|\/\*.*?\*\/)|('(?:[^'\\]|\\.)*')|(`(?:[^`\\]|\\.)*`)|(\/(?![/*])(?:[^/\\]|\\.)+\/[gimsuy]*)|(\b\d+\b)|(@\w+)|([A-Za-z_$][\w$]*)|(\s+)|(\.\.\.|=>|[=<>!?:+\-*&|]+)|(.)/g;
  let out = '';
  let prev = '';
  let m;
  while ((m = re.exec(line))) {
    const [text, comment, str, tmpl, regexp, num, deco, word, space, op] = m;
    if (comment) out += span('comment', text);
    else if (str) out += span('string', text);
    else if (tmpl) {
      out += tmpl
        .split(/(\$\{[^}]*\})/)
        .map((part) =>
          part.startsWith('${')
            ? span('keyword', '${') + span(classify(part.slice(2, -1), '', ''), part.slice(2, -1)) + span('keyword', '}')
            : part && span('string', part)
        )
        .join('');
    } else if (regexp) out += span('regexp', text);
    else if (num) out += span('number', text);
    else if (deco) out += span('decorator', text);
    else if (word) out += span(classify(word, prev, line.slice(re.lastIndex).trimStart()[0]), text);
    else if (space) out += text;
    else if (op) out += span('operator', text);
    else out += span(/[{}()[\];,.]/.test(text) ? 'punctuation' : 'variable', text);
    if (!space) prev = text;
  }
  return out;
}

// Leading spaces drawn the way `editor.renderWhitespace: "boundary"` shows them: faint dots,
// with an indent guide line at each level (the one around the cursor's block highlighted).
function indentHtml(count, lineNumber) {
  let out = '';
  for (let col = 0; col < count; col++) {
    const guide = col % 2 === 0 ? (col === ACTIVE_GUIDE.column && ACTIVE_GUIDE.lines.includes(lineNumber) ? ' guide active' : ' guide') : '';
    out += `<span class="ws${guide}">·</span>`;
  }
  return out;
}

function editorHtml() {
  return SAMPLE.split('\n')
    .map((line, i) => {
      const n = i + 1;
      const indent = line.length - line.trimStart().length;
      const classes = ['ln', n === CURRENT_LINE && 'current', GUTTER[n] && `g-${GUTTER[n]}`].filter(Boolean).join(' ');
      const cursor = n === CURRENT_LINE ? '<span class="cursor"></span>' : '';
      const code = indentHtml(indent, n) + highlightLine(line.slice(indent));
      return `<div class="${classes}"><span class="num">${n}</span><span class="code">${code}${cursor}</span></div>`;
    })
    .join('');
}

const ICONS = {
  files: '<path d="M6 3h7l5 5v13H6z M13 3v5h5"/>',
  search: '<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5 5"/>',
  git: '<circle cx="7" cy="5" r="2"/><circle cx="7" cy="19" r="2"/><circle cx="17" cy="9" r="2"/><path d="M7 7v10 M17 11c0 4-10 2-10 6"/>',
  debug: '<path d="M8 5l11 7-11 7z"/>',
  ext: '<path d="M4 4h7v7H4z M13 13h7v7h-7z M4 13h7v7H4z M14.5 3.5l5 5-5 5-5-5z"/>',
};
const icon = (name) =>
  `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round">${ICONS[name]}</svg>`;

function windowHtml(theme, variant) {
  const c = theme.colors;
  const vars = {
    ...Object.fromEntries(Object.entries(c).map(([k, v]) => [`--${k.replace(/\./g, '-')}`, v])),
    ...Object.fromEntries(Object.entries(variant.syntax).map(([k, v]) => [`--syn-${k}`, v])),
  };
  const style = Object.entries(vars)
    .map(([k, v]) => `${k}:${v}`)
    .join(';');
  const chips = Object.entries(variant.hues)
    .map(([name, hex]) => `<li><i style="background:${hex}"></i><b>${name}</b><code>${hex}</code></li>`)
    .join('');

  return `
<section class="theme">
  <h2>${esc(theme.name)}</h2>
  <div class="win" style="${style}">
    <header class="titlebar"><span class="dots"><i></i><i></i><i></i></span><span class="cc">jin-cute-theme</span><span></span></header>
    <div class="body">
      <nav class="activity">
        <span class="active">${icon('files')}</span><span>${icon('search')}</span>
        <span class="has-badge">${icon('git')}<em>2</em></span><span>${icon('debug')}</span><span>${icon('ext')}</span>
      </nav>
      <aside class="sidebar">
        <div class="sb-title">EXPLORER</div>
        <div class="sb-section">⌄ JIN-CUTE-THEME</div>
        <ul>
          <li class="dir">⌄ src</li>
          <li class="in sel">kitchen.ts</li>
          <li class="in mod">palette.js<span>M</span></li>
          <li class="in">preview.js</li>
          <li class="new">recipe.py<span>U</span></li>
          <li>package.json</li>
          <li class="ign">node_modules</li>
        </ul>
      </aside>
      <main>
        <div class="tabs"><span class="tab active">kitchen.ts</span><span class="tab">palette.js <b>●</b></span></div>
        <div class="crumbs">src › kitchen.ts › <span>Kitchen</span> › simmer</div>
        <div class="editor">${editorHtml()}</div>
        <div class="panel">
          <div class="ptabs"><span>PROBLEMS</span><span>OUTPUT</span><span class="active">TERMINAL</span></div>
          <pre class="term"><span class="a-green">❯</span> npm run build
Building Jin Cute theme…
  <span class="a-cyan">Jin Cute Dark</span>: 22/22 colors readable <span class="a-green">✓</span>
  <span class="a-bblack">wrote themes/jin-cute-dark-color-theme.json</span>
<span class="a-green">❯</span> git status --short
 <span class="a-yellow">M</span> src/palette.js
<span class="a-red">??</span> samples/recipe.py</pre>
        </div>
      </main>
    </div>
    <footer class="status"><span class="remote">⌁ local</span><span>⎇ main</span><span class="err">⊗ 0 ⚠ 1</span><span class="grow"></span><span>Ln ${CURRENT_LINE}, Col 46</span><span>UTF-8</span><span>TypeScript</span></footer>
  </div>
  <ul class="chips">${chips}</ul>
</section>`;
}

function renderPreview(themes, variants) {
  const windows = themes.map((t, i) => windowHtml(t, variants[i])).join('\n');
  const roles = ['comment', 'keyword', 'control', 'operator', 'punctuation', 'function', 'string', 'number', 'constant', 'type', 'variable', 'property', 'parameter', 'decorator', 'regexp', 'language'];
  const roleCss = roles.map((r) => `.t-${r}{color:var(--syn-${r})}`).join('\n');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Jin Cute Theme Preview</title>
<style>
:root { --page: #e9e3db; --ink: #3a2c20; --ink-2: #7a6857; color-scheme: light; }
@media (prefers-color-scheme: dark) { :root { --page: #0e0b09; --ink: #e6d6c2; --ink-2: #9a8774; color-scheme: dark; } }
* { box-sizing: border-box; }
body { margin: 0; background: var(--page); color: var(--ink); font: 14px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif; }
.page { max-width: 1040px; margin: 0 auto; padding: 32px 16px 56px; }
.page > header h1 { margin: 0 0 4px; font-size: 22px; }
.page > header p { margin: 0 0 28px; color: var(--ink-2); }
.theme { margin-bottom: 40px; }
.theme h2 { font-size: 15px; font-weight: 600; margin: 0 0 10px; }
.win { border-radius: 10px; overflow: hidden; border: 1px solid var(--titleBar-border); box-shadow: 0 18px 40px -18px rgba(0,0,0,.45);
  font-size: 12px; color: var(--foreground); background: var(--editor-background); }
.titlebar { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; height: 34px; padding: 0 12px;
  background: var(--titleBar-activeBackground); color: var(--titleBar-activeForeground); border-bottom: 1px solid var(--titleBar-border); }
.dots i { display: inline-block; width: 11px; height: 11px; border-radius: 50%; margin-right: 7px; background: var(--terminal-ansiRed); }
.dots i:nth-child(2) { background: var(--terminal-ansiYellow); } .dots i:nth-child(3) { background: var(--terminal-ansiGreen); }
.cc { padding: 3px 60px; border-radius: 10px; background: var(--commandCenter-background); border: 1px solid var(--commandCenter-border); color: var(--commandCenter-foreground); }
.body { display: grid; grid-template-columns: 48px 200px minmax(0, 1fr); }
.activity { background: var(--activityBar-background); border-right: 1px solid var(--activityBar-border); padding-top: 4px; }
.activity span { position: relative; display: flex; justify-content: center; padding: 11px 0; color: var(--activityBar-inactiveForeground); }
.activity span.active { color: var(--activityBar-foreground); box-shadow: inset 2px 0 0 var(--activityBar-activeBorder); background: var(--activityBar-activeBackground); }
.activity em { position: absolute; right: 7px; bottom: 6px; min-width: 16px; height: 16px; border-radius: 8px; font: 600 9px/16px sans-serif; text-align: center;
  font-style: normal; background: var(--activityBarBadge-background); color: var(--activityBarBadge-foreground); }
.sidebar { background: var(--sideBar-background); color: var(--sideBar-foreground); border-right: 1px solid var(--sideBar-border); }
.sb-title { padding: 10px 16px; font-size: 11px; letter-spacing: .04em; color: var(--sideBarTitle-foreground); }
.sb-section { padding: 3px 8px; font-size: 11px; font-weight: 700; color: var(--sideBarSectionHeader-foreground); }
.sidebar ul { list-style: none; margin: 2px 0; padding: 0; }
.sidebar li { display: flex; padding: 2px 12px 2px 22px; }
.sidebar li.in { padding-left: 36px; }
.sidebar li span { margin-left: auto; }
.sidebar li.sel { border-radius: 10px; margin: 0 6px; padding-left: 30px; background: var(--list-activeSelectionBackground); color: var(--list-activeSelectionForeground); outline: 1px solid var(--list-focusOutline); outline-offset: -1px; }
.sidebar li.mod { color: var(--gitDecoration-modifiedResourceForeground); }
.sidebar li.new { color: var(--gitDecoration-untrackedResourceForeground); }
.sidebar li.ign { color: var(--gitDecoration-ignoredResourceForeground); }
main { display: flex; flex-direction: column; min-width: 0; }
.tabs { display: flex; background: var(--editorGroupHeader-tabsBackground); border-bottom: 1px solid var(--editorGroupHeader-tabsBorder); }
/* Rounded corners come from ui/rounded.css, loaded with a custom CSS extension. */
.tab { border-radius: 12px 12px 0 0; padding: 8px 16px; color: var(--tab-inactiveForeground); background: var(--tab-inactiveBackground); border-right: 1px solid var(--tab-border); }
.tab b { color: var(--tab-inactiveModifiedBorder); font-weight: 400; }
.tab.active { color: var(--tab-activeForeground); background: var(--tab-activeBackground); box-shadow: inset 0 2px 0 var(--tab-activeBorderTop); margin-bottom: -1px; }
.crumbs { padding: 3px 16px; color: var(--breadcrumb-foreground); background: var(--breadcrumb-background); }
.crumbs span { color: var(--breadcrumb-focusForeground); }
.editor { padding: 4px 0 10px; overflow-x: auto; background: var(--editor-background);
  font: 12.5px/1.6 ui-monospace, "SF Mono", Menlo, Consolas, monospace; color: var(--editor-foreground); }
.ln { display: flex; white-space: pre; min-width: max-content; }
.ln .num { width: 44px; flex: none; padding-right: 14px; text-align: right; color: var(--editorLineNumber-foreground); box-shadow: inset 3px 0 0 transparent; }
.ln.g-added .num { box-shadow: inset -3px 0 0 var(--editorGutter-addedBackground); }
.ln.g-modified .num { box-shadow: inset -3px 0 0 var(--editorGutter-modifiedBackground); }
.ln .code { padding-left: 10px; padding-right: 16px; }
.ln.current { background: var(--editor-lineHighlightBackground); }
.ln.current .num { color: var(--editorLineNumber-activeForeground); }
.cursor { display: inline-block; width: 2px; height: 1.25em; vertical-align: text-bottom; background: var(--editorCursor-foreground);
  animation: cursor-expand 1.1s ease-in-out infinite; }
@keyframes cursor-expand { 0%, 20% { transform: scaleY(1); opacity: 1; } 50% { transform: scaleY(.2); opacity: 0; } 80%, 100% { transform: scaleY(1); opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .cursor { animation: none; } }
.ws { color: var(--editorWhitespace-foreground); }
.ws.guide { box-shadow: inset 1px 0 0 var(--editorIndentGuide-background1); }
.ws.guide.active { box-shadow: inset 1px 0 0 var(--editorIndentGuide-activeBackground1); }
.t-comment, .t-language { font-style: italic; }
${roleCss}
.panel { border-top: 1px solid var(--panel-border); background: var(--panel-background); }
.ptabs { display: flex; gap: 18px; padding: 6px 16px 0; font-size: 11px; color: var(--panelTitle-inactiveForeground); }
.ptabs span { padding-bottom: 5px; }
.ptabs .active { color: var(--panelTitle-activeForeground); box-shadow: inset 0 -1px 0 var(--panelTitle-activeBorder); }
.term { margin: 0; padding: 8px 16px 12px; background: var(--terminal-background); color: var(--terminal-foreground); overflow-x: auto;
  font: 12px/1.55 ui-monospace, "SF Mono", Menlo, Consolas, monospace; }
.a-green { color: var(--terminal-ansiGreen); } .a-red { color: var(--terminal-ansiRed); } .a-yellow { color: var(--terminal-ansiYellow); }
.a-cyan { color: var(--terminal-ansiCyan); } .a-bblack { color: var(--terminal-ansiBrightBlack); }
.status { display: flex; gap: 14px; align-items: center; height: 24px; padding-right: 12px; white-space: nowrap; overflow: hidden;
  background: var(--statusBar-background); color: var(--statusBar-foreground); border-top: 1px solid var(--statusBar-border); font-size: 11.5px; }
.status .remote { align-self: stretch; display: flex; align-items: center; padding: 0 10px; background: var(--statusBarItem-remoteBackground); color: var(--statusBarItem-remoteForeground); }
.status .grow { flex: 1; }
.chips { display: flex; flex-wrap: wrap; gap: 8px 16px; list-style: none; padding: 0; margin: 12px 0 0; font-size: 12px; color: var(--ink-2); }
.chips li { display: flex; align-items: center; gap: 6px; }
.chips i { width: 14px; height: 14px; border-radius: 4px; box-shadow: inset 0 0 0 1px rgba(0,0,0,.15); }
.chips b { color: var(--ink); font-weight: 500; }
.chips code { font-size: 11px; }
@media (max-width: 760px) {
  .body { grid-template-columns: minmax(0, 1fr); }
  .activity, .sidebar { display: none; }
  .cc { padding: 3px 16px; }
}
</style>
</head>
<body>
<div class="page">
  <header>
    <h1>Jin Cute theme preview</h1>
    <p>A mock-up painted with the generated theme colors. Edit <code>src/palette.js</code>, run <code>npm run build</code>, and reload this page.</p>
  </header>
  ${windows}
</div>
</body>
</html>
`;
}

module.exports = { renderPreview };
