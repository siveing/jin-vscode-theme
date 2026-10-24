// Generates ./themes/*-color-theme.json and ./preview.html from ./src/palette.js.
//   node src/build.js           build once
//   node src/build.js --watch   rebuild whenever palette.js changes
const fs = require('fs');
const path = require('path');
const { renderPreview } = require('./preview');

const ROOT = path.join(__dirname, '..');
const PALETTE = path.join(__dirname, 'palette.js');
const THEMES_DIR = path.join(ROOT, 'themes');

// ---------- color helpers ----------

const rgb = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const toHex = (channels) =>
  '#' + channels.map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('');

// alpha('#f2a53e', 0.2) → '#f2a53e33' (VS Code accepts #RRGGBBAA)
const alpha = (c, a) => c.slice(0, 7) + Math.round(a * 255).toString(16).padStart(2, '0');

// mix('#000000', '#ffffff', 0.25) → 25% of the way from the first color to the second
const mix = (a, b, t) => {
  const x = rgb(a);
  const y = rgb(b);
  return toHex(x.map((v, i) => v + (y[i] - v) * t));
};

const luminance = (c) =>
  rgb(c)
    .map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    })
    .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);

const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

function validate(palette) {
  const walk = (obj, trail) => {
    for (const [key, value] of Object.entries(obj)) {
      const at = `${trail}.${key}`;
      if (value && typeof value === 'object') walk(value, at);
      else if (!['name', 'type'].includes(key) && !/^#[0-9a-f]{6}$/i.test(value)) {
        throw new Error(`${at} = ${JSON.stringify(value)} is not a 6-digit hex color like "#f2a53e"`);
      }
    }
  };
  walk(palette, 'palette');
}

// ---------- workbench (UI) colors ----------

function workbenchColors(p) {
  const { ui, accent, onAccent, pink, hues: h } = p;
  const isDark = p.type === 'dark';
  const shadow = isDark ? '#00000066' : alpha(ui.fg2, 0.18);
  const selection = alpha(accent, isDark ? 0.28 : 0.24);
  const activeItem = alpha(accent, isDark ? 0.16 : 0.18);
  const widget = isDark ? ui.bg3 : mix(ui.bg2, '#ffffff', 0.5);
  const input = isDark ? ui.bg2 : mix(ui.bg2, '#ffffff', 0.7);
  const bright = (c) => mix(c, ui.fg0, 0.25);

  return {
    // Base
    focusBorder: alpha(accent, 0.6),
    foreground: ui.fg1,
    descriptionForeground: ui.fg2,
    disabledForeground: ui.fg4,
    errorForeground: h.red,
    'icon.foreground': ui.fg2,
    'widget.shadow': shadow,
    'widget.border': ui.border,
    'selection.background': selection,
    'sash.hoverBorder': accent,
    'textLink.foreground': h.pink,
    'textLink.activeForeground': pink,
    'textPreformat.foreground': h.amber,
    'textPreformat.background': alpha(ui.bg4, 0.5),
    'textBlockQuote.background': ui.bg1,
    'textBlockQuote.border': accent,
    'textCodeBlock.background': ui.bg1,
    'textSeparator.foreground': ui.border,

    // Title bar & command center
    'titleBar.activeBackground': ui.bg0,
    'titleBar.activeForeground': ui.fg1,
    'titleBar.inactiveBackground': ui.bg0,
    'titleBar.inactiveForeground': ui.fg3,
    'titleBar.border': ui.border,
    'commandCenter.background': ui.bg1,
    'commandCenter.foreground': ui.fg2,
    'commandCenter.border': ui.border,
    'commandCenter.activeBackground': ui.bg3,
    'commandCenter.activeForeground': ui.fg0,
    'commandCenter.activeBorder': alpha(accent, 0.5),

    // Activity bar
    'activityBar.background': ui.bg0,
    'activityBar.foreground': accent,
    'activityBar.inactiveForeground': ui.fg3,
    'activityBar.border': ui.border,
    'activityBar.activeBorder': accent,
    'activityBar.activeBackground': alpha(accent, 0.08),
    'activityBarBadge.background': accent,
    'activityBarBadge.foreground': onAccent,
    'activityBarTop.foreground': accent,
    'activityBarTop.inactiveForeground': ui.fg3,
    'activityBarTop.activeBorder': accent,

    // Side bar
    'sideBar.background': ui.bg1,
    'sideBar.foreground': ui.fg2,
    'sideBar.border': ui.border,
    'sideBarTitle.foreground': ui.fg1,
    'sideBarSectionHeader.background': ui.bg1,
    'sideBarSectionHeader.foreground': ui.fg1,
    'sideBarSectionHeader.border': ui.border,

    // Lists & trees
    'list.activeSelectionBackground': activeItem,
    'list.activeSelectionForeground': ui.fg0,
    'list.activeSelectionIconForeground': ui.fg0,
    'list.inactiveSelectionBackground': alpha(ui.bg4, 0.6),
    'list.inactiveSelectionForeground': ui.fg1,
    'list.hoverBackground': alpha(ui.bg4, 0.45),
    'list.hoverForeground': ui.fg1,
    'list.focusBackground': activeItem,
    'list.focusOutline': alpha(accent, 0.5),
    'list.highlightForeground': accent,
    'list.focusHighlightForeground': accent,
    'list.errorForeground': h.red,
    'list.warningForeground': h.yellow,
    'list.dropBackground': alpha(accent, 0.15),
    'list.deemphasizedForeground': ui.fg3,
    'tree.indentGuidesStroke': ui.fg4,
    'tree.inactiveIndentGuidesStroke': alpha(ui.fg4, 0.5),

    // Editor groups & tabs
    'editorGroup.border': ui.border,
    'editorGroup.dropBackground': alpha(accent, 0.12),
    'editorGroupHeader.tabsBackground': ui.bg1,
    'editorGroupHeader.tabsBorder': ui.border,
    'editorGroupHeader.noTabsBackground': ui.bg2,
    'tab.activeBackground': ui.bg2,
    'tab.activeForeground': ui.fg0,
    'tab.activeBorder': ui.bg2,
    'tab.activeBorderTop': accent,
    'tab.inactiveBackground': ui.bg1,
    'tab.inactiveForeground': ui.fg3,
    'tab.hoverBackground': ui.bg2,
    'tab.hoverForeground': ui.fg1,
    'tab.border': ui.border,
    'tab.unfocusedActiveForeground': ui.fg2,
    'tab.unfocusedInactiveForeground': ui.fg3,
    'tab.unfocusedActiveBorderTop': alpha(accent, 0.4),
    'tab.unfocusedHoverBackground': ui.bg2,
    'tab.activeModifiedBorder': accent,
    'tab.inactiveModifiedBorder': alpha(accent, 0.5),
    'tab.lastPinnedBorder': ui.fg4,
    'breadcrumb.foreground': ui.fg3,
    'breadcrumb.focusForeground': ui.fg1,
    'breadcrumb.activeSelectionForeground': accent,
    'breadcrumb.background': ui.bg2,
    'breadcrumbPicker.background': widget,

    // Editor
    'editor.background': ui.bg2,
    'editor.foreground': ui.fg1,
    'editorLineNumber.foreground': ui.fg4,
    'editorLineNumber.activeForeground': pink,
    'editorCursor.foreground': pink,
    'editorCursor.background': onAccent,
    'editor.selectionBackground': selection,
    'editor.inactiveSelectionBackground': alpha(accent, 0.12),
    'editor.selectionHighlightBackground': alpha(accent, 0.14),
    'editor.wordHighlightBackground': alpha(h.blue, 0.16),
    'editor.wordHighlightStrongBackground': alpha(h.green, 0.16),
    'editor.findMatchBackground': alpha(h.yellow, 0.4),
    'editor.findMatchBorder': h.yellow,
    'editor.findMatchHighlightBackground': alpha(h.yellow, 0.18),
    'editor.findRangeHighlightBackground': alpha(accent, 0.06),
    'editor.lineHighlightBackground': alpha(ui.bg4, isDark ? 0.35 : 0.3),
    'editor.lineHighlightBorder': '#00000000',
    'editor.rangeHighlightBackground': alpha(accent, 0.07),
    'editor.foldBackground': alpha(accent, 0.06),
    'editorWhitespace.foreground': alpha(pink, isDark ? 0.3 : 0.35), // the · and → dots in indentation
    'editorIndentGuide.background1': alpha(ui.fg4, 0.45),
    'editorIndentGuide.activeBackground1': alpha(pink, 0.55),
    'editorRuler.foreground': alpha(ui.fg4, 0.5),
    'editorCodeLens.foreground': ui.fg3,
    'editorLink.activeForeground': h.blue,
    'editorBracketMatch.background': alpha(pink, 0.14),
    'editorBracketMatch.border': alpha(pink, 0.7),
    'editorBracketHighlight.foreground1': h.pink,
    'editorBracketHighlight.foreground2': h.amber,
    'editorBracketHighlight.foreground3': h.teal,
    'editorBracketHighlight.foreground4': h.purple,
    'editorBracketHighlight.foreground5': h.blue,
    'editorBracketHighlight.foreground6': h.green,
    'editorBracketHighlight.unexpectedBracket.foreground': h.red,
    'editorBracketPairGuide.activeBackground1': alpha(pink, 0.7),
    'editorBracketPairGuide.activeBackground2': alpha(pink, 0.7),
    'editorBracketPairGuide.activeBackground3': alpha(pink, 0.7),
    'editorBracketPairGuide.activeBackground4': alpha(pink, 0.7),
    'editorBracketPairGuide.activeBackground5': alpha(pink, 0.7),
    'editorBracketPairGuide.activeBackground6': alpha(pink, 0.7),
    'editorInlayHint.foreground': ui.fg3,
    'editorInlayHint.background': alpha(ui.bg4, 0.5),
    'editorGhostText.foreground': ui.fg3,
    'editorError.foreground': h.red,
    'editorWarning.foreground': h.yellow,
    'editorInfo.foreground': h.blue,
    'editorHint.foreground': h.teal,
    'editorLightBulb.foreground': h.yellow,
    'editorGutter.background': ui.bg2,
    'editorGutter.addedBackground': h.green,
    'editorGutter.modifiedBackground': h.blue,
    'editorGutter.deletedBackground': h.red,
    'editorGutter.foldingControlForeground': ui.fg3,
    'editorOverviewRuler.border': '#00000000',
    'editorOverviewRuler.errorForeground': h.red,
    'editorOverviewRuler.warningForeground': h.yellow,
    'editorOverviewRuler.infoForeground': h.blue,
    'editorOverviewRuler.addedForeground': alpha(h.green, 0.7),
    'editorOverviewRuler.modifiedForeground': alpha(h.blue, 0.7),
    'editorOverviewRuler.deletedForeground': alpha(h.red, 0.7),
    'editorOverviewRuler.findMatchForeground': alpha(h.yellow, 0.8),
    'editorOverviewRuler.selectionHighlightForeground': alpha(accent, 0.6),
    'editorStickyScroll.background': ui.bg2,
    'editorStickyScroll.shadow': shadow,
    'editorStickyScrollHover.background': ui.bg3,

    // Editor widgets (find, hover, suggest)
    'editorWidget.background': widget,
    'editorWidget.foreground': ui.fg1,
    'editorWidget.border': ui.border,
    'editorWidget.resizeBorder': accent,
    'editorSuggestWidget.background': widget,
    'editorSuggestWidget.border': ui.border,
    'editorSuggestWidget.foreground': ui.fg1,
    'editorSuggestWidget.highlightForeground': accent,
    'editorSuggestWidget.focusHighlightForeground': accent,
    'editorSuggestWidget.selectedBackground': activeItem,
    'editorSuggestWidget.selectedForeground': ui.fg0,
    'editorHoverWidget.background': widget,
    'editorHoverWidget.border': ui.border,

    // Peek view
    'peekView.border': accent,
    'peekViewTitle.background': ui.bg1,
    'peekViewTitleLabel.foreground': ui.fg0,
    'peekViewTitleDescription.foreground': ui.fg3,
    'peekViewEditor.background': ui.bg1,
    'peekViewEditorGutter.background': ui.bg1,
    'peekViewEditor.matchHighlightBackground': alpha(h.yellow, 0.25),
    'peekViewResult.background': ui.bg1,
    'peekViewResult.fileForeground': ui.fg1,
    'peekViewResult.lineForeground': ui.fg2,
    'peekViewResult.matchHighlightBackground': alpha(h.yellow, 0.25),
    'peekViewResult.selectionBackground': activeItem,
    'peekViewResult.selectionForeground': ui.fg0,

    // Diff & merge
    'diffEditor.insertedTextBackground': alpha(h.green, 0.18),
    'diffEditor.removedTextBackground': alpha(h.red, 0.18),
    'diffEditor.insertedLineBackground': alpha(h.green, 0.08),
    'diffEditor.removedLineBackground': alpha(h.red, 0.08),
    'diffEditor.diagonalFill': alpha(ui.fg4, 0.4),
    'merge.currentHeaderBackground': alpha(h.green, 0.35),
    'merge.currentContentBackground': alpha(h.green, 0.12),
    'merge.incomingHeaderBackground': alpha(h.blue, 0.35),
    'merge.incomingContentBackground': alpha(h.blue, 0.12),

    // Inputs & dropdowns
    'input.background': input,
    'input.foreground': ui.fg1,
    'input.border': ui.border,
    'input.placeholderForeground': ui.fg3,
    'inputOption.activeBackground': alpha(accent, 0.2),
    'inputOption.activeBorder': alpha(accent, 0.6),
    'inputOption.activeForeground': ui.fg0,
    'inputValidation.errorBackground': widget,
    'inputValidation.errorBorder': h.red,
    'inputValidation.warningBackground': widget,
    'inputValidation.warningBorder': h.yellow,
    'inputValidation.infoBackground': widget,
    'inputValidation.infoBorder': h.blue,
    'dropdown.background': input,
    'dropdown.listBackground': widget,
    'dropdown.border': ui.border,
    'dropdown.foreground': ui.fg1,
    'checkbox.background': input,
    'checkbox.border': ui.border,
    'checkbox.foreground': accent,
    'checkbox.selectBackground': widget,

    // Buttons, badges, progress
    'button.background': accent,
    'button.foreground': onAccent,
    'button.hoverBackground': mix(accent, isDark ? '#ffffff' : '#000000', 0.12),
    'button.separator': alpha(onAccent, 0.4),
    'button.secondaryBackground': ui.bg4,
    'button.secondaryForeground': ui.fg1,
    'button.secondaryHoverBackground': mix(ui.bg4, ui.fg1, 0.1),
    'badge.background': ui.bg4,
    'badge.foreground': ui.fg0,
    'progressBar.background': accent,

    // Scrollbars & minimap
    'scrollbar.shadow': shadow,
    'scrollbarSlider.background': alpha(ui.fg3, 0.2),
    'scrollbarSlider.hoverBackground': alpha(ui.fg3, 0.35),
    'scrollbarSlider.activeBackground': alpha(pink, 0.45),
    'minimap.selectionHighlight': alpha(accent, 0.45),
    'minimap.findMatchHighlight': alpha(h.yellow, 0.6),
    'minimap.errorHighlight': alpha(h.red, 0.7),
    'minimap.warningHighlight': alpha(h.yellow, 0.7),
    'minimapSlider.background': alpha(ui.fg3, 0.12),
    'minimapSlider.hoverBackground': alpha(ui.fg3, 0.2),
    'minimapSlider.activeBackground': alpha(ui.fg3, 0.28),
    'minimapGutter.addedBackground': h.green,
    'minimapGutter.modifiedBackground': h.blue,
    'minimapGutter.deletedBackground': h.red,

    // Panel (terminal, problems, output)
    'panel.background': ui.bg1,
    'panel.border': ui.border,
    'panelTitle.activeBorder': accent,
    'panelTitle.activeForeground': ui.fg0,
    'panelTitle.inactiveForeground': ui.fg3,
    'panelInput.border': ui.border,
    'panelSection.border': ui.border,
    'panelSectionHeader.background': ui.bg1,

    // Status bar
    'statusBar.background': ui.bg0,
    'statusBar.foreground': ui.fg2,
    'statusBar.border': ui.border,
    'statusBar.noFolderBackground': ui.bg0,
    'statusBar.debuggingBackground': h.orange,
    'statusBar.debuggingForeground': onAccent,
    'statusBarItem.hoverBackground': alpha(ui.fg1, 0.08),
    'statusBarItem.activeBackground': alpha(ui.fg1, 0.14),
    'statusBarItem.remoteBackground': accent,
    'statusBarItem.remoteForeground': onAccent,
    'statusBarItem.prominentBackground': alpha(accent, 0.2),
    'statusBarItem.prominentForeground': ui.fg0,
    'statusBarItem.errorBackground': h.red,
    'statusBarItem.errorForeground': onAccent,

    // Integrated terminal
    'terminal.background': ui.bg1,
    'terminal.foreground': ui.fg1,
    'terminal.border': ui.border,
    'terminal.selectionBackground': selection,
    'terminalCursor.foreground': pink,
    'terminal.ansiBlack': isDark ? ui.bg4 : ui.fg1,
    'terminal.ansiRed': h.red,
    'terminal.ansiGreen': h.green,
    'terminal.ansiYellow': h.yellow,
    'terminal.ansiBlue': h.blue,
    'terminal.ansiMagenta': h.pink,
    'terminal.ansiCyan': h.teal,
    'terminal.ansiWhite': isDark ? ui.fg1 : ui.fg3,
    'terminal.ansiBrightBlack': ui.fg3,
    'terminal.ansiBrightRed': bright(h.red),
    'terminal.ansiBrightGreen': bright(h.green),
    'terminal.ansiBrightYellow': bright(h.yellow),
    'terminal.ansiBrightBlue': bright(h.blue),
    'terminal.ansiBrightMagenta': bright(h.pink),
    'terminal.ansiBrightCyan': bright(h.teal),
    'terminal.ansiBrightWhite': isDark ? ui.fg0 : ui.fg2,

    // Git decorations in the explorer
    'gitDecoration.addedResourceForeground': h.green,
    'gitDecoration.modifiedResourceForeground': h.yellow,
    'gitDecoration.deletedResourceForeground': h.red,
    'gitDecoration.untrackedResourceForeground': h.teal,
    'gitDecoration.ignoredResourceForeground': ui.fg3,
    'gitDecoration.conflictingResourceForeground': h.hotPink,
    'gitDecoration.stageModifiedResourceForeground': h.yellow,
    'gitDecoration.stageDeletedResourceForeground': h.red,
    'gitDecoration.submoduleResourceForeground': h.blue,

    // Notifications
    'notifications.background': widget,
    'notifications.foreground': ui.fg1,
    'notifications.border': ui.border,
    'notificationCenterHeader.background': widget,
    'notificationCenterHeader.foreground': ui.fg1,
    'notificationToast.border': ui.border,
    'notificationsErrorIcon.foreground': h.red,
    'notificationsWarningIcon.foreground': h.yellow,
    'notificationsInfoIcon.foreground': h.blue,
    'notificationLink.foreground': h.pink,

    // Command palette & quick pick
    'quickInput.background': widget,
    'quickInput.foreground': ui.fg1,
    'quickInputTitle.background': ui.bg1,
    'quickInputList.focusBackground': activeItem,
    'quickInputList.focusForeground': ui.fg0,
    'quickInputList.focusIconForeground': ui.fg0,
    'pickerGroup.foreground': accent,
    'pickerGroup.border': ui.border,

    // Menus
    'menu.background': widget,
    'menu.foreground': ui.fg1,
    'menu.border': ui.border,
    'menu.selectionBackground': activeItem,
    'menu.selectionForeground': ui.fg0,
    'menu.separatorBackground': ui.border,
    'menubar.selectionBackground': alpha(ui.fg1, 0.08),
    'menubar.selectionForeground': ui.fg0,

    // Keybinding labels, settings editor
    'keybindingLabel.background': alpha(ui.fg3, 0.12),
    'keybindingLabel.foreground': ui.fg1,
    'keybindingLabel.border': ui.border,
    'keybindingLabel.bottomBorder': ui.border,
    'settings.headerForeground': ui.fg0,
    'settings.modifiedItemIndicator': accent,
    'settings.focusedRowBackground': alpha(ui.bg4, 0.3),
    'settings.rowHoverBackground': alpha(ui.bg4, 0.2),

    // Debugging
    'debugToolBar.background': widget,
    'debugToolBar.border': ui.border,
    'debugIcon.breakpointForeground': h.red,
    'editor.stackFrameHighlightBackground': alpha(h.yellow, 0.15),
    'editor.focusedStackFrameHighlightBackground': alpha(h.green, 0.15),

    // Welcome page, charts
    'welcomePage.tileBackground': ui.bg1,
    'welcomePage.tileHoverBackground': ui.bg3,
    'welcomePage.tileBorder': ui.border,
    'walkThrough.embeddedEditorBackground': ui.bg1,
    'charts.foreground': ui.fg1,
    'charts.lines': ui.fg3,
    'charts.red': h.red,
    'charts.blue': h.blue,
    'charts.yellow': h.yellow,
    'charts.orange': h.orange,
    'charts.green': h.green,
    'charts.purple': h.purple,
  };
}

// ---------- syntax highlighting (TextMate scopes) ----------

function tokenColors(p) {
  const s = p.syntax;
  const h = p.hues;
  const rule = (name, scope, foreground, fontStyle) => ({
    name,
    scope,
    settings: { ...(foreground && { foreground }), ...(fontStyle !== undefined && { fontStyle }) },
  });

  return [
    rule('Comments', ['comment', 'punctuation.definition.comment', 'string.comment'], s.comment, 'italic'),
    rule('Doc comment tags', ['storage.type.class.jsdoc', 'punctuation.definition.block.tag.jsdoc', 'comment.block.documentation storage.type'], s.keyword, 'italic'),
    rule('Doc comment names', ['comment.block.documentation variable', 'comment.block.documentation entity.name.type', 'variable.other.jsdoc'], s.parameter, 'italic'),

    rule('Keywords', ['keyword', 'storage.type', 'storage.modifier', 'keyword.operator.new', 'keyword.operator.expression', 'keyword.operator.logical.python', 'keyword.operator.word'], s.keyword, ''),
    rule('Control flow & imports', ['keyword.control', 'keyword.operator.import', 'keyword.other.import', 'keyword.other.using'], s.control, ''),
    rule('Operators', ['keyword.operator', 'punctuation.accessor', 'punctuation.separator.key-value'], s.operator),
    rule('Punctuation', ['punctuation', 'meta.brace', 'punctuation.definition.tag'], s.punctuation),

    rule('Functions & methods', ['entity.name.function', 'support.function', 'meta.function-call.generic', 'variable.function', 'meta.require'], s.function),
    rule('Strings', ['string', 'punctuation.definition.string', 'markup.inline.raw', 'markup.raw'], s.string),
    rule('Template expressions', ['punctuation.definition.template-expression', 'punctuation.section.embedded', 'punctuation.section.interpolation'], s.keyword),
    rule('Embedded code', ['meta.template.expression', 'meta.embedded', 'meta.interpolation'], s.variable),
    rule('Escapes & placeholders', ['constant.character.escape', 'constant.other.placeholder', 'constant.character.format.placeholder'], s.escape),
    rule('Regular expressions', ['string.regexp', 'constant.other.character-class.regexp', 'keyword.operator.quantifier.regexp'], s.regexp),
    rule('Numbers & units', ['constant.numeric', 'keyword.other.unit'], s.number),
    rule('Constants', ['constant.language', 'constant.character', 'constant.other', 'variable.other.constant', 'variable.other.enummember', 'support.constant'], s.constant),

    rule('Types & classes', ['entity.name.type', 'entity.name.class', 'entity.other.inherited-class', 'support.type', 'support.class', 'storage.type.primitive', 'storage.type.built-in', 'entity.name.type.parameter'], s.type),
    rule('Namespaces & modules', ['entity.name.namespace', 'entity.name.module', 'entity.name.type.module', 'entity.name.package', 'storage.modifier.import.java'], s.namespace),
    rule('Decorators & macros', ['meta.decorator entity.name.function', 'entity.name.function.decorator', 'punctuation.decorator', 'punctuation.definition.decorator', 'storage.type.annotation', 'entity.name.function.macro', 'entity.name.function.preprocessor'], s.decorator),

    rule('Variables', ['variable', 'variable.other', 'variable.other.readwrite', 'meta.definition.variable'], s.variable),
    rule('Parameters', ['variable.parameter', 'meta.parameters variable.other'], s.parameter),
    rule('this / self', ['variable.language', 'variable.parameter.function.language.special.self', 'variable.parameter.function.language.special.cls'], s.language, 'italic'),
    rule('Properties & keys', ['variable.other.property', 'variable.other.object.property', 'support.variable.property', 'meta.object-literal.key', 'support.type.property-name', 'entity.name.tag.yaml', 'variable.other.member'], s.property),

    rule('Tags', ['entity.name.tag'], s.tag),
    rule('Components', ['support.class.component', 'entity.name.tag.component'], s.type),
    rule('Attributes', ['entity.other.attribute-name'], s.attribute),

    rule('Markdown headings', ['markup.heading', 'entity.name.section.markdown', 'punctuation.definition.heading.markdown'], s.function, 'bold'),
    rule('Markdown bold', ['markup.bold'], undefined, 'bold'),
    rule('Markdown italic', ['markup.italic'], undefined, 'italic'),
    rule('Markdown strikethrough', ['markup.strikethrough'], undefined, 'strikethrough'),
    rule('Markdown links', ['markup.underline.link', 'string.other.link'], s.property),
    rule('Markdown quotes', ['markup.quote'], s.comment, 'italic'),
    rule('Markdown lists', ['punctuation.definition.list.begin.markdown', 'beginning.punctuation.definition.list.markdown'], s.keyword),

    rule('Diff inserted', ['markup.inserted', 'punctuation.definition.inserted'], h.green),
    rule('Diff deleted', ['markup.deleted', 'punctuation.definition.deleted'], h.red),
    rule('Diff changed', ['markup.changed', 'punctuation.definition.changed'], h.yellow),
    rule('Invalid', ['invalid', 'invalid.illegal'], h.red),
    rule('Deprecated', ['invalid.deprecated'], s.comment, 'strikethrough'),
  ];
}

// Colors from language servers (TypeScript, Pylance, rust-analyzer, ...), layered over TextMate.
function semanticTokenColors(p) {
  const s = p.syntax;
  return {
    namespace: s.namespace,
    type: s.type,
    class: s.type,
    enum: s.type,
    interface: s.type,
    struct: s.type,
    typeParameter: s.type,
    'class.defaultLibrary': s.type,
    function: s.function,
    method: s.function,
    'function.defaultLibrary': s.function,
    macro: s.decorator,
    decorator: s.decorator,
    variable: s.variable,
    'variable.readonly': s.variable, // keeps every `const` from turning into a constant color
    parameter: s.parameter,
    property: s.property,
    enumMember: s.constant,
    selfParameter: { foreground: s.language, italic: true },
    clsParameter: { foreground: s.language, italic: true },
    operator: s.operator,
    '*.deprecated': { strikethrough: true },
  };
}

// ---------- build ----------

const slug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function contrastReport(p) {
  const bg = p.ui.bg2;
  const minimum = { comment: 3.5, punctuation: 3 };
  const rows = Object.entries({ text: p.ui.fg1, 'muted text': p.ui.fg3, ...p.syntax }).map(([role, color]) => {
    const ratio = contrast(color, bg);
    const need = minimum[role] ?? (role === 'muted text' ? 3 : 4.5);
    return { role, color, ratio, ok: ratio >= need, need };
  });
  const weak = rows.filter((r) => !r.ok);
  const lowest = rows.reduce((a, b) => (a.ratio < b.ratio ? a : b));
  console.log(
    `  ${p.name}: ${rows.length - weak.length}/${rows.length} colors readable on ${bg}` +
      ` (lowest: ${lowest.role} ${lowest.ratio.toFixed(2)}:1)`
  );
  for (const r of weak) {
    console.log(`    ⚠ ${r.role} ${r.color} is ${r.ratio.toFixed(2)}:1, aim for ${r.need}:1 or more`);
  }
}

function build() {
  delete require.cache[require.resolve(PALETTE)];
  const palette = require(PALETTE);
  validate(palette);

  fs.mkdirSync(THEMES_DIR, { recursive: true });
  const written = [];
  const contributes = [];

  for (const variant of Object.values(palette)) {
    const theme = {
      $schema: 'vscode://schemas/color-theme',
      name: variant.name,
      type: variant.type,
      semanticHighlighting: true,
      colors: workbenchColors(variant),
      tokenColors: tokenColors(variant),
      semanticTokenColors: semanticTokenColors(variant),
    };
    const file = `${slug(variant.name)}-color-theme.json`;
    fs.writeFileSync(path.join(THEMES_DIR, file), JSON.stringify(theme, null, 2) + '\n');
    written.push(file);
    contributes.push({
      label: variant.name,
      uiTheme: variant.type === 'light' ? 'vs' : 'vs-dark',
      path: `./themes/${file}`,
    });
    contrastReport(variant);
  }

  // Remove theme files left over from a renamed variant.
  for (const file of fs.readdirSync(THEMES_DIR)) {
    if (file.endsWith('-color-theme.json') && !written.includes(file)) fs.unlinkSync(path.join(THEMES_DIR, file));
  }

  // Keep package.json's theme list in step with the palette.
  const pkgPath = path.join(ROOT, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  if (JSON.stringify(pkg.contributes.themes) !== JSON.stringify(contributes)) {
    pkg.contributes.themes = contributes;
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  }

  const themes = written.map((file) => JSON.parse(fs.readFileSync(path.join(THEMES_DIR, file), 'utf8')));
  fs.writeFileSync(path.join(ROOT, 'preview.html'), renderPreview(themes, Object.values(palette)));

  console.log(`  wrote ${written.map((f) => `themes/${f}`).join(', ')}, preview.html`);
}

function safeBuild() {
  try {
    build();
  } catch (err) {
    console.error(`  ✗ ${err.message}`);
    if (!process.argv.includes('--watch')) process.exit(1);
  }
}

console.log('Building Jin Cute theme…');
safeBuild();

if (process.argv.includes('--watch')) {
  let timer;
  console.log('Watching src/palette.js for changes (Ctrl+C to stop)…');
  fs.watch(PALETTE, () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      console.log(`\n[${new Date().toLocaleTimeString()}] palette changed`);
      safeBuild();
    }, 100);
  });
}
