// SPDX-License-Identifier: MIT OR Apache-2.0
//
// btc-strings.js — the chrome's words, in the reader's language.
//
// The prose language (glossia-msg.js, bookLang) is the engine's affair; this
// module carries the far smaller vocabulary of the chrome around the prose:
// nav items, panel titles, buttons, status lines, the section's meta lines.
// English is the source text and the fallback — a key a language has not
// covered yet simply reads in English, so coverage can grow string by string
// without ever leaving a page half-broken.
//
// The UI language is NOT always the prose language. Latin prose is a real
// choice; a Latin chrome would be an affectation, so choosing Latina leaves
// the chrome in the last modern tongue chosen (English at first). That rule
// lives in the stored key: glossia-msg.js's setBookLang writes the UI key
// only for non-Latin choices, and uiLang() below falls back through the book
// language for readers who chose one before this key existed.
//
// Deliberately dependency-free (no glossia-msg import): light pages localize
// their masthead without pulling in the engine's module. The two storage keys
// are shared constants by convention — see glossia-msg.js.

const UI_LANG_KEY = 'glossia-btc-ui-lang';    // written by setBookLang, non-Latin choices only
const BOOK_LANG_KEY = 'glossia-btc-lang';     // the prose language (glossia-msg.js)

// Which languages carry a table here. Latin is deliberately absent — see above.
const STRINGS = {
  czech: {
    // masthead + nav
    'Search': 'Hledat',
    'Contents': 'Obsah',
    'Language': 'Jazyk',
    'Settings': 'Nastavení',
    'Read': 'Číst',
    'Preface': 'Předmluva',
    'Citations': 'Citace',
    // panels
    'Prose language': 'Jazyk prózy',
    'Text size': 'Velikost písma',
    'Amounts': 'Částky',
    'Data source': 'Zdroj dat',
    'Body': 'Text',
    'Sigla': 'Sigla',
    'Margins': 'Marginálie',
    'Notation': 'Notace',
    'Commentary': 'Komentář',
    'Reset': 'Obnovit',
    '+ Add': '+ Přidat',
    'Remove': 'Odebrat',
    'Save': 'Uložit',
    'Cancel': 'Zrušit',
    'Label (optional)': 'Označení (nepovinné)',
    'Title for contents': 'Název pro obsah',
    // the hash menu
    'Copy hex': 'Kopírovat hex',
    'Copy text': 'Kopírovat text',
    'Ledger entry': 'Záznam v účetní knize',
    'Bookmark': 'Záložka',
    // the notation key's scope line
    'the marks on this page': 'značky na této stránce',
    'The sigla →': 'Sigla →',
    // eyebrow crumbs + leaf and chapter titles
    'Volume': 'Svazek',
    'Book': 'Kniha',
    'Chapter': 'Kapitola',
    'Appendix I': 'Dodatek I',
    'Appendix': 'Dodatek',
    'The Genesis Block': 'Blok genesis',
    // page-turn hover labels (the visible text is notation — §, β, ■, Roman)
    'Chapter page': 'Stránka kapitoly',
    'Projected chapter page': 'Stránka očekávané kapitoly',
    'Book page': 'Stránka knihy',
    'Volume page': 'Stránka svazku',
    'First section': 'První oddíl',
    'Next chapter — projected': 'Další kapitola — očekávaná',
    'Previous book': 'Předchozí kniha',
    'Next book': 'Další kniha',
    'Previous volume': 'Předchozí svazek',
    'Next volume': 'Další svazek',
    'Previous section (end of {ref})': 'Předchozí oddíl (konec {ref})',
    'Its successor — the current holder of §{n}': 'Jeho nástupce — současný držitel §{n}',
    "Open this chapter's own page ({ref})": 'Otevřít stránku této kapitoly ({ref})',
    "Open this projected chapter's own page ({ref})": 'Otevřít stránku této očekávané kapitoly ({ref})',
    'Back to the front matter (the sigla)': 'Zpět k úvodním listům (sigla)',
    'On to the appendices (I — the mempool)': 'Dál k dodatkům (I — mempool)',
    // status lines
    'fetching latest block…': 'načítání nejnovějšího bloku…',
    'fetching block…': 'načítání bloku…',
    'fetching transaction…': 'načítání transakce…',
    'locating transaction…': 'hledání transakce…',
    'reading the mempool…': 'čtení mempoolu…',
    'loading next block…': 'načítání dalšího bloku…',
    'loading previous block…': 'načítání předchozího bloku…',
    'encoding the witness…': 'kódování witnessu…',
    // the section's meta lines
    'confirmation': 'potvrzení',
    'confirmations': 'potvrzení',   // 1 potvrzení, 2 potvrzení, 5 potvrzení — the form does not bend
    "the containing block's header time, the miner's own clock when the chapter was sealed":
      'čas v hlavičce bloku, který oddíl nese — minerovy vlastní hodiny ve chvíli, kdy byla kapitola zapečetěna',
    'blocks from this one to the chain tip, both counted — tip {tip} − height {h} + 1':
      'bloky od tohoto po vrchol řetězce, oba započítány — vrchol {tip} − výška {h} + 1',
    'Commentary on this passage — a reading of the record, credited to whoever wrote it':
      'Komentář k této pasáži — čtení záznamu, připsané tomu, kdo je napsal',
    'translation: {name}': 'překlad: {name}',
    'commentary by {names}': 'komentář od {names}',
    'the latest block': 'nejnovější blok',
  },
  german: {
    // masthead + nav
    'Search': 'Suche',
    'Contents': 'Inhalt',
    'Language': 'Sprache',
    'Settings': 'Einstellungen',
    'Read': 'Lesen',
    'Preface': 'Vorwort',
    'Citations': 'Zitate',
    // panels
    'Prose language': 'Prosasprache',
    'Text size': 'Textgröße',
    'Amounts': 'Beträge',
    'Data source': 'Datenquelle',
    'Body': 'Fließtext',
    'Sigla': 'Sigla',
    'Margins': 'Marginalien',
    'Notation': 'Notation',
    'Commentary': 'Kommentar',
    'Reset': 'Zurücksetzen',
    '+ Add': '+ Hinzufügen',
    'Remove': 'Entfernen',
    'Save': 'Speichern',
    'Cancel': 'Abbrechen',
    'Label (optional)': 'Bezeichnung (optional)',
    'Title for contents': 'Titel für den Inhalt',
    // the hash menu
    'Copy hex': 'Hex kopieren',
    'Copy text': 'Text kopieren',
    'Ledger entry': 'Hauptbucheintrag',
    'Bookmark': 'Lesezeichen',
    // the notation key's scope line
    'the marks on this page': 'die Zeichen auf dieser Seite',
    'The sigla →': 'Die Sigla →',
    // eyebrow crumbs + leaf and chapter titles
    'Volume': 'Band',
    'Book': 'Buch',
    'Chapter': 'Kapitel',
    'Appendix I': 'Anhang I',
    'Appendix': 'Anhang',
    'The Genesis Block': 'Der Genesis-Block',
    // page-turn hover labels (the visible text is notation — §, β, ■, Roman)
    'Chapter page': 'Kapitelseite',
    'Projected chapter page': 'Seite des erwarteten Kapitels',
    'Book page': 'Buchseite',
    'Volume page': 'Bandseite',
    'First section': 'Erster Abschnitt',
    'Next chapter — projected': 'Nächstes Kapitel — erwartet',
    'Previous book': 'Voriges Buch',
    'Next book': 'Nächstes Buch',
    'Previous volume': 'Voriger Band',
    'Next volume': 'Nächster Band',
    'Previous section (end of {ref})': 'Voriger Abschnitt (Ende von {ref})',
    'Its successor — the current holder of §{n}': 'Sein Nachfolger — der jetzige Inhaber von §{n}',
    "Open this chapter's own page ({ref})": 'Die Seite dieses Kapitels öffnen ({ref})',
    "Open this projected chapter's own page ({ref})": 'Die Seite dieses erwarteten Kapitels öffnen ({ref})',
    'Back to the front matter (the sigla)': 'Zurück zur Titelei (die Sigla)',
    'On to the appendices (I — the mempool)': 'Weiter zu den Anhängen (I — der Mempool)',
    // status lines
    'fetching latest block…': 'neuester Block wird geladen…',
    'fetching block…': 'Block wird geladen…',
    'fetching transaction…': 'Transaktion wird geladen…',
    'locating transaction…': 'Transaktion wird gesucht…',
    'reading the mempool…': 'der Mempool wird gelesen…',
    'loading next block…': 'nächster Block wird geladen…',
    'loading previous block…': 'voriger Block wird geladen…',
    'encoding the witness…': 'der Witness wird kodiert…',
    // the section's meta lines
    'confirmation': 'Bestätigung',
    'confirmations': 'Bestätigungen',
    "the containing block's header time, the miner's own clock when the chapter was sealed":
      'die Header-Zeit des umgebenden Blocks — die eigene Uhr des Miners, als das Kapitel versiegelt wurde',
    'blocks from this one to the chain tip, both counted — tip {tip} − height {h} + 1':
      'Blöcke von diesem bis zur Spitze der Kette, beide mitgezählt — Spitze {tip} − Höhe {h} + 1',
    'Commentary on this passage — a reading of the record, credited to whoever wrote it':
      'Kommentar zu dieser Passage — eine Lesart der Aufzeichnung, dem zugeschrieben, der sie verfasst hat',
    'translation: {name}': 'Übersetzung: {name}',
    'commentary by {names}': 'Kommentar von {names}',
    'the latest block': 'der neueste Block',
  },
};

// The chrome's language: the stored UI choice when there is one, else the
// prose language (for readers who chose before the UI key existed), else
// English. Latin never reaches here — setBookLang does not write it, and a
// stored book language of latin falls through to English.
export function uiLang() {
  try {
    const ui = localStorage.getItem(UI_LANG_KEY);
    if (ui === 'english' || STRINGS[ui]) return ui;
    const book = localStorage.getItem(BOOK_LANG_KEY);
    if (STRINGS[book]) return book;
  } catch { /* no storage — English */ }
  return 'english';
}

// A chrome string in the UI language. `subs` fills {token} placeholders —
// in the English source text too, so a call site reads the same either way.
export function t(en, subs) {
  const table = STRINGS[uiLang()];
  let s = (table && table[en]) || en;
  if (subs) for (const [k, v] of Object.entries(subs)) s = s.replaceAll(`{${k}}`, String(v));
  return s;
}

// Re-translate an element's text in place, remembering the English source on
// the element so the pass is idempotent — chrome can move english → czech →
// german → english and always translate from the original.
export function localizeText(el) {
  if (!el) return;
  if (el.dataset.en === undefined) el.dataset.en = el.textContent;
  el.textContent = t(el.dataset.en);
}

// Same, for a named attribute (title, placeholder, aria-label). Originals are
// kept off the DOM so attribute names need no dataset-mangling.
const EN_ATTRS = new WeakMap();   // el -> { attr: original }
export function localizeAttr(el, attr) {
  if (!el) return;
  let m = EN_ATTRS.get(el);
  if (!m) { m = {}; EN_ATTRS.set(el, m); }
  if (m[attr] === undefined) m[attr] = el.getAttribute(attr) || '';
  if (m[attr]) el.setAttribute(attr, t(m[attr]));
}

// ─── spelled chapter numbers ──────────────────────────────────────────
// "Chapter One" through "Chapter One Hundred", in the UI language. English is
// the reader's original spelling (the arrays that lived in bitcoin-book.html,
// verbatim); German compounds with und; Czech counts the way chapters are
// read aloud (kapitola dvacet jedna), lowercase as Czech titles are. Numbers
// past 100 are the caller's affair — null says "use the numeral".
const NUM_WORDS = {
  english: {
    ones: ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight',
      'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
      'Seventeen', 'Eighteen', 'Nineteen'],
    tens: ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'],
    hundred: 'One Hundred',
    compose: (tens, one) => one ? `${tens}-${one}` : tens,
  },
  czech: {
    ones: ['', 'jedna', 'dva', 'tři', 'čtyři', 'pět', 'šest', 'sedm', 'osm',
      'devět', 'deset', 'jedenáct', 'dvanáct', 'třináct', 'čtrnáct', 'patnáct', 'šestnáct',
      'sedmnáct', 'osmnáct', 'devatenáct'],
    tens: ['', '', 'dvacet', 'třicet', 'čtyřicet', 'padesát', 'šedesát', 'sedmdesát', 'osmdesát', 'devadesát'],
    hundred: 'sto',
    compose: (tens, one) => one ? `${tens} ${one}` : tens,
  },
  german: {
    ones: ['', 'Eins', 'Zwei', 'Drei', 'Vier', 'Fünf', 'Sechs', 'Sieben', 'Acht',
      'Neun', 'Zehn', 'Elf', 'Zwölf', 'Dreizehn', 'Vierzehn', 'Fünfzehn', 'Sechzehn',
      'Siebzehn', 'Achtzehn', 'Neunzehn'],
    tens: ['', '', 'zwanzig', 'dreißig', 'vierzig', 'fünfzig', 'sechzig', 'siebzig', 'achtzig', 'neunzig'],
    hundred: 'Hundert',
    // einundzwanzig — the unit leads (as "ein", never "eins"), und binds, and
    // the compound is capitalized whole since it stands as a title.
    compose: (tens, one) => {
      if (!one) return tens[0].toUpperCase() + tens.slice(1);
      const unit = one === 'Eins' ? 'ein' : one.toLowerCase();
      const word = `${unit}und${tens}`;
      return word[0].toUpperCase() + word.slice(1);
    },
  },
};
export function numberName(n) {
  if (!Number.isInteger(n) || n < 1 || n > 100) return null;
  const w = NUM_WORDS[uiLang()] || NUM_WORDS.english;
  if (n === 100) return w.hundred;
  if (n < 20) return w.ones[n];
  return w.compose(w.tens[Math.floor(n / 10)], w.ones[n % 10]);
}

// The masthead's home row, for every page that carries one: each link's text
// is a word the table knows (Search, Contents, Read, Preface, Citations,
// Settings, Language). One call after the DOM is up localizes the row; pages
// with no further chrome need nothing else.
export function localizeHome() {
  for (const a of document.querySelectorAll('.masthead .home a')) localizeText(a);
}

// ─── the Language menu ────────────────────────────────────────────────
// The masthead's Language item, one implementation for every page. The book
// page grew this first and keeps its own wiring (a switch there re-renders
// the open chapter in place); every other page mounts this one, which writes
// the same two keys and reloads -- a page's normal load path is already the
// correct renderer for a new language, and a reload is the one route that
// cannot miss a string.
//
// The roster mirrors glossia-msg.js's MSG_LANGS by id and label, kept here so
// a light page need not load the engine's module just to name the choices --
// the same shared-by-convention standing the storage keys have. Adding a
// language touches both lists (and, for the chrome, a STRINGS table above).
export const LANGS = [
  { id: 'english', label: 'English' },
  { id: 'latin', label: 'Latina' },
  { id: 'czech', label: 'Čeština' },
  { id: 'german', label: 'Deutsch' },
];
const langNow = () => {
  try { const l = localStorage.getItem(BOOK_LANG_KEY); return LANGS.some((x) => x.id === l) ? l : 'english'; }
  catch { return 'english'; }
};
// The same writes glossia-msg's setBookLang makes, restated for pages with no
// engine loaded: the prose key always, the UI key only for a modern tongue --
// Latin prose is a real choice, a Latin chrome would be an affectation.
export function setLang(id) {
  if (!LANGS.some((l) => l.id === id)) return;
  try {
    localStorage.setItem(BOOK_LANG_KEY, id);
    if (id !== 'latin') localStorage.setItem(UI_LANG_KEY, id);
  } catch { /* private mode: nothing persists, and a reload forgets the choice */ }
}

// The menu carries its own dress, so a page needs no styles of its own to
// mount it. Set to the book page's settings-panel pattern, on the shared
// colour variables every page's root declares.
const LANGM_CSS = `
.langm { position:relative; }
.langm-panel { display:none; position:absolute; right:0; top:calc(100% + 10px); z-index:60; min-width:11em;
  padding:12px 14px 13px; background:var(--card); border:1px solid var(--card-bd); border-radius:8px;
  box-shadow:0 18px 44px -18px rgba(0,0,0,.8); text-align:left; }
.langm-panel.open { display:block; }
.langm-title { margin-bottom:8px; font:600 10px/1 'IBM Plex Mono',monospace; letter-spacing:.14em;
  text-transform:uppercase; color:var(--meta); }
.langm-rows { display:grid; gap:1px; }
.langm-row { display:flex; justify-content:space-between; align-items:baseline; gap:14px; width:100%;
  background:none; border:none; border-radius:4px; padding:7px 8px; cursor:pointer; text-align:left;
  font:500 12.5px/1.2 'IBM Plex Mono',monospace; color:var(--ink-soft); }
.langm-row:hover, .langm-row:focus-visible { background:var(--input-bg); color:var(--ink); outline:none; }
.langm-row .langm-mark { font:600 11px/1 'IBM Plex Mono',monospace; color:var(--accent); visibility:hidden; }
.langm-row.current { color:var(--ink); }
.langm-row.current .langm-mark { visibility:visible; }
`;

// Mount the Language item at the end of the masthead's home row. `onPick`
// replaces the default reload for a page that can re-render in place.
export function mountLangMenu(onPick = null) {
  const home = document.querySelector('.masthead .home');
  if (!home || home.querySelector('.langm')) return;
  if (!document.getElementById('langm-style')) {
    const st = document.createElement('style');
    st.id = 'langm-style';
    st.textContent = LANGM_CSS;
    document.head.append(st);
  }
  const wrap = document.createElement('span');
  wrap.className = 'langm';
  const link = document.createElement('a');
  link.href = '#';
  link.textContent = t('Language');
  link.setAttribute('role', 'button');
  link.setAttribute('aria-haspopup', 'dialog');
  link.setAttribute('aria-expanded', 'false');
  const panel = document.createElement('div');
  panel.className = 'langm-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', t('Language'));
  const title = document.createElement('div');
  title.className = 'langm-title';
  title.textContent = t('Language');
  const rows = document.createElement('div');
  rows.className = 'langm-rows';
  const close = () => { panel.classList.remove('open'); link.setAttribute('aria-expanded', 'false'); };
  for (const l of LANGS) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'langm-row' + (l.id === langNow() ? ' current' : '');
    btn.setAttribute('aria-pressed', l.id === langNow() ? 'true' : 'false');
    const name = document.createElement('span');
    name.textContent = l.label;
    const mark = document.createElement('span');
    mark.className = 'langm-mark';
    mark.textContent = '●';
    btn.append(name, mark);
    btn.addEventListener('click', () => {
      close();
      if (l.id === langNow()) return;
      setLang(l.id);
      if (onPick) onPick(l.id);
      else location.reload();
    });
    rows.append(btn);
  }
  panel.append(title, rows);
  wrap.append(link, panel);
  home.append(document.createTextNode(' · '), wrap);
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const open = panel.classList.toggle('open');
    link.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  document.addEventListener('click', (e) => {
    if (!panel.classList.contains('open')) return;
    if (panel.contains(e.target) || link.contains(e.target)) return;
    close();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
}
