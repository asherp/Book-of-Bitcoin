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
    // eyebrow crumbs
    'Volume': 'Svazek',
    'Book': 'Kniha',
    'Appendix I': 'Dodatek I',
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
    // eyebrow crumbs
    'Volume': 'Band',
    'Book': 'Buch',
    'Appendix I': 'Anhang I',
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

// The masthead's home row, for every page that carries one: each link's text
// is a word the table knows (Search, Contents, Read, Preface, Citations,
// Settings, Language). One call after the DOM is up localizes the row; pages
// with no further chrome need nothing else.
export function localizeHome() {
  for (const a of document.querySelectorAll('.masthead .home a')) localizeText(a);
}
