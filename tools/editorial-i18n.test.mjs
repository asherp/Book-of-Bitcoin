// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/editorial-i18n.test.mjs — translations of the editorial layer: a
// curated title or a reading may carry language-suffixed variants
// (title-cs, file-de, note-cs, translator-cs) beside the English original,
// which is the fallback. The UI language (btc-strings.js) picks the variant;
// Latin never reaches here, since it writes no UI language.
//
//   node --test tools/
//
// Pure parsing and selection — no WASM, no network: the injected `read`
// stands in for the commentary directory.

import test from 'node:test';
import assert from 'node:assert/strict';

// The UI language is read from localStorage per call, so a mutable stub is a
// language switch. Must be installed before btc-strings is first imported by
// the modules under test.
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};
const setUiLang = (l) => store.set('glossia-btc-ui-lang', l);

const { parseNotables, setNotables, places, placeTitle } = await import('../web/btc-notables.js');
const { commentaryFor, resolveCommentary, commentaryHtml, commentaryLines } = await import('../web/btc-commentary.js');

const YAML = `
- title: The Genesis Block
  title-cs: Blok genesis
  title-de: Der Genesis-Block
  id: '0'
  commentary:
    - file: the-genesis-block.md
      file-cs: the-genesis-block.cs.md
      translator-cs: Jana Nováková
- title: An untranslated entry
  id: '170'
`;

const SOURCES = {
  'the-genesis-block.md': '<!-- SPDX-License-Identifier: CC-BY-4.0 -->\n\nThe chain begins.\n',
  'the-genesis-block.cs.md': '<!-- SPDX-License-Identifier: CC-BY-4.0 -->\n\nŘetězec začíná.\n',
};
const read = async (path) => {
  const file = path.replace(/^commentary\//, '');
  if (!(file in SOURCES)) throw new Error(`no such fixture: ${path}`);
  return SOURCES[file];
};

test('titles: the variant is picked by UI language, the original is the fallback', () => {
  setNotables(parseNotables(YAML), []);
  const at = (h) => places().find((p) => p.id === String(h));
  setUiLang('english');
  assert.equal(placeTitle(at(0)), 'The Genesis Block');
  setUiLang('czech');
  assert.equal(placeTitle(at(0)), 'Blok genesis');
  assert.equal(placeTitle(at(170)), 'An untranslated entry');   // no variant: the original
  setUiLang('german');
  assert.equal(placeTitle(at(0)), 'Der Genesis-Block');
});

test('readings: the variant file is resolved, re-resolved on switch, and its translator credited', async () => {
  setNotables(parseNotables(YAML), []);
  setUiLang('english');
  let items = await resolveCommentary(commentaryFor({ height: 0, index: -1 }), { read });
  assert.match(commentaryHtml(items), /The chain begins\./);
  assert.doesNotMatch(commentaryHtml(items), /překlad|translation:/);   // the original credits no translator

  setUiLang('czech');
  items = await resolveCommentary(items, { read });                    // same items, new language
  const html = commentaryHtml(items);
  assert.match(html, /Řetězec začíná\./);
  assert.match(html, /překlad: Jana Nováková/);                         // translator, in the UI language
  assert.match(html, /Blok genesis/);                                  // the sheet's own title follows too
  assert.match(commentaryLines(items).join('\n'), /překlad: Jana Nováková/);

  setUiLang('german');                                                  // no German file: back to the original
  items = await resolveCommentary(items, { read });
  assert.match(commentaryHtml(items), /The chain begins\./);
  assert.doesNotMatch(commentaryHtml(items), /Übersetzung:/);          // the original is not a translation
});

test('a translation with no original to fall back from is an error', () => {
  assert.throws(() => parseNotables(`
- title: A title with a floating translation
  title-cs: Název
  id: '0'
  commentary:
    - note: fine
      file-cs: floating.cs.md
`), /file-cs with no file/);
  assert.throws(() => parseNotables(`
- title: A translator with nothing translated
  id: '0'
  commentary:
    - file: x.md
      translator-de: Niemand
`), /credits a german translator/);
});
