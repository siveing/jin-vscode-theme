// Jin Cute palette: the one file to edit when you want to change how the theme looks.
// Change a color here, run `npm run build` (or keep `npm run watch` running),
// and both theme files in ./themes are regenerated.
//
// ui     – backgrounds (bg0 darkest/most recessed → bg4 most raised) and text (fg0 strongest → fg4 faintest)
// hues   – the accent colors the theme is allowed to use
// syntax – which hue each kind of code gets (reassign freely, e.g. keyword: hues.red)

const darkHues = {
  red: '#f2707a',
  orange: '#f59a62',
  amber: '#f5b450',
  yellow: '#ecd27a',
  green: '#b5d07c',
  teal: '#7fd1c0',
  blue: '#8fb8e8',
  purple: '#c3a2f5',
  pink: '#ff8fc8',
  hotPink: '#ff6fa8',
};

const lightHues = {
  red: '#b23a3f',
  orange: '#b4531c',
  amber: '#975b00',
  yellow: '#7f6100',
  green: '#527118',
  teal: '#1c7465',
  blue: '#34608c',
  purple: '#7345ad',
  pink: '#b52f78',
  hotPink: '#c41a5c',
};

module.exports = {
  dark: {
    name: 'Jin Cute Dark',
    type: 'dark',
    ui: {
      bg0: '#09090a', // title bar, activity bar, status bar
      bg1: '#0e0e10', // side bar, panel, terminal
      bg2: '#131315', // editor
      bg3: '#1c1c1f', // inputs, widgets, hover
      bg4: '#2b2a2f', // selections, active list items
      border: '#232226',
      fg0: '#f7f2f4', // brightest text
      fg1: '#e6e0e3', // main text
      fg2: '#aba3a8', // secondary text
      fg3: '#7f777c', // muted text, line numbers
      fg4: '#4b464a', // faint: whitespace, indent guides
    },
    accent: darkHues.pink, // active tab, activity bar, buttons, badges, focus rings, selection
    onAccent: '#131315', // text drawn on top of the accent
    pink: darkHues.hotPink, // stronger pink: cursor, active line number, bracket guide lines
    hues: darkHues,
    syntax: {
      comment: '#878086',
      keyword: darkHues.pink,
      control: darkHues.hotPink,
      operator: '#dcb8cb',
      punctuation: '#a39aa0',
      function: darkHues.amber,
      string: darkHues.green,
      number: darkHues.purple,
      constant: darkHues.purple,
      type: darkHues.teal,
      variable: '#e6e0e3',
      property: darkHues.blue,
      parameter: darkHues.orange,
      namespace: darkHues.yellow,
      decorator: darkHues.yellow,
      tag: darkHues.hotPink,
      attribute: darkHues.amber,
      regexp: darkHues.teal,
      escape: darkHues.yellow,
      language: darkHues.hotPink, // this, self, super
    },
  },

  light: {
    name: 'Jin Cute Light',
    type: 'light',
    ui: {
      bg0: '#f2e3e8',
      bg1: '#f8ecf0',
      bg2: '#fff8f9',
      bg3: '#f5e7ec',
      bg4: '#ebd2dc',
      border: '#e6d0d9',
      fg0: '#28161e',
      fg1: '#3b2530',
      fg2: '#6c525e',
      fg3: '#8f7480',
      fg4: '#c8b0bb',
    },
    accent: '#c4367a',
    onAccent: '#ffffff',
    pink: lightHues.hotPink,
    hues: lightHues,
    syntax: {
      comment: '#8a7380',
      keyword: lightHues.pink,
      control: lightHues.hotPink,
      operator: '#5e4552',
      punctuation: '#6e5562',
      function: lightHues.amber,
      string: lightHues.green,
      number: lightHues.purple,
      constant: lightHues.purple,
      type: lightHues.teal,
      variable: '#3b2530',
      property: lightHues.blue,
      parameter: lightHues.orange,
      namespace: lightHues.yellow,
      decorator: lightHues.yellow,
      tag: lightHues.hotPink,
      attribute: lightHues.amber,
      regexp: lightHues.teal,
      escape: lightHues.yellow,
      language: lightHues.hotPink,
    },
  },
};
