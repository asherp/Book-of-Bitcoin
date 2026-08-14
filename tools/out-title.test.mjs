// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/out-title.test.mjs — the title a locking script has before anyone
// names it.
//
//   node --test tools/out-title.test.mjs
//
// A paragraph in this book is titled the way a book titles anything: somebody
// decided what it was and wrote it down. The reader's keep does it, and the
// curated shelf does it, and between them they name a vanishing fraction of
// the outputs on chain — so the line above nearly every paragraph stood empty,
// waiting for a name that was never coming.
//
// The term is the name it already had. Every lock is an abstraction over its
// own datum, derivable from the bytes with no reader, no shelf and no network,
// and writing it there is an editorial decision rather than a discovery: the
// book says what the paragraph IS where nobody has said whose it is. What that
// buys is checked here — that the six forms all title, that the shapes with
// nothing tabled decline rather than guess, and that a filed name still wins.
//
// Source-level, because the title is painted by an inline module in
// bitcoin-book.html and the page needs the WASM engine to draw a chapter at
// all — the same way the hash menu is checked in hash-menu.test.mjs.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { addressScriptHex } from '../web/btc-index.js';
import { termOfScript, lockedHtml } from '../web/btc-term.js';

const bookPage = () => readFile(new URL('../web/bitcoin-book.html', import.meta.url), 'utf8');

// The page's own painter, lifted out and run against a DOM stub small enough
// to be obviously right: a span that remembers what was set on it, and an
// element that remembers what was appended. Everything termTitle touches
// beyond those is imported above, from the module the page imports it from --
// so this exercises the page's decision rather than a copy of it.
function fakeDoc() {
  const make = () => ({ className: '', innerHTML: '', title: '', children: [],
    append(kid) { this.children.push(kid); } });
  return { document: { createElement: make }, make };
}

async function painter() {
  const page = await bookPage();
  const m = /function termTitle\(el\) \{[\s\S]*?\n\}/.exec(page);
  assert.ok(m, 'the page no longer paints a term title');
  const { document, make } = fakeDoc();
  const fn = Function('document', 'termOfScript', 'lockedHtml',
    `${m[0]}\nreturn termTitle;`)(document, termOfScript, lockedHtml);
  // The keep line as the page builds it: the script's bytes on the dataset,
  // which is the whole of what a title needs.
  return (spk) => {
    const el = { ...make(), dataset: spk === null ? {} : { spk } };
    return { drew: fn(el), lines: el.children };
  };
}

const ADDRESSES = [
  ['P2PKH',  '1Ross5Np5doy4ajF9iGXzgKaC2Q3Pwwxv', 1],
  ['P2SH',   '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy', 1],
  ['P2WPKH', 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4', 1],
  ['P2WSH',  'bc1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3qccfmv3', 1],
  // Taproot titles twice, because an unspent taproot output really can be
  // opened two ways and a title that named one would be choosing for the
  // chain. The alternatives stack; they are not a sequence.
  ['P2TR',   'bc1p5d7rjq7g6rdk2yhzks9smlaqtedr4dekq08ge8ztwac72sfr9rusxg3297', 2],
];

test('every address form titles its paragraph, and taproot titles it twice', async () => {
  const paint = await painter();
  for (const [what, address, lines] of ADDRESSES) {
    const got = paint(addressScriptHex(address));
    assert.equal(got.drew, true, `${what} draws no title`);
    assert.equal(got.lines.length, lines, `${what} draws the wrong number of titles`);
    for (const line of got.lines) {
      assert.equal(line.className, 'out-term');
      assert.ok(line.innerHTML.startsWith('<span class="lam">λ'), `${what}: the binders lead`);
      assert.ok(line.title, `${what}: a title with no hover explains nothing`);
    }
    // The title is the demand, which is the point of choosing that rung: it
    // says what a spend must bring rather than restating the opcodes the
    // paragraph below already prints.
    assert.deepEqual(got.lines.map((l) => l.innerHTML), lockedHtml(termOfScript(addressScriptHex(address))));
  }
});

test('a shape with nothing tabled goes untitled rather than guessed at', async () => {
  const paint = await painter();
  // A data output binds its blob and has no demand written down: nothing opens
  // it, so there is nothing to say a spend must bring.
  assert.equal(paint('6a' + '04' + 'ab'.repeat(4)).drew, false, 'a data output');
  // A well-formed script no template claims -- the bytes are known, what opens
  // them is not.
  assert.equal(paint('76a914' + 'ab'.repeat(20)).drew, false, 'an unclassified script');
  // Bytes that are not a script at all, and no bytes at all.
  assert.equal(paint('deadbeef').drew, false, 'undefined opcodes');
  assert.equal(paint('').drew, false);
  assert.equal(paint(null).drew, false, 'a line with no script on it');
});

test('a filed name wins, and the term returns when it is removed', async () => {
  // The precedence the page keeps, read out of the page: the term is painted in
  // the branch where no name was found, never beside one. A name says whose
  // this is; the term only says what it is.
  const page = await bookPage();
  const fn = /function syncScriptKeeps\(\) \{[\s\S]*?\n\}/.exec(page);
  assert.ok(fn, 'the page no longer paints its keep lines');
  const src = fn[0];
  // `if (name) { ... } else { termTitle(el); }` -- the term is the else, so a
  // reader's keep or a curated shelf title displaces it, and removing the keep
  // brings it back because the whole line repaints from scratch each time.
  assert.match(src, /if \(name\) \{[\s\S]*?\} else \{[\s\S]*?termTitle\(el\);[\s\S]*?\}/,
    'the term is no longer the fallback under a filed name');
  assert.match(src, /el\.textContent = '';/, 'the line no longer repaints from scratch');
  // …and a script with no address of its own still gets one: an OP_RETURN has
  // no ledger to keep, which is a reason to offer no ribbon, not a reason to
  // say nothing about the paragraph.
  assert.match(src, /if \(!address\) \{ termTitle\(el\); continue; \}/,
    'a script with no address is titled too');
});

test('every mark the title sets is a mark the reading styles', async () => {
  // The real risk of borrowing another leaf's rendering: a class that leaf
  // styles and this one does not, which renders as unmarked prose in the middle
  // of a paragraph rather than failing anywhere. So every class the term emits
  // is required to be styled on the page that now prints it.
  const page = await bookPage();
  const css = page.slice(0, page.indexOf('</style>'));
  const classes = new Set();
  for (const [, address] of ADDRESSES) {
    for (const line of lockedHtml(termOfScript(addressScriptHex(address)))) {
      for (const m of line.matchAll(/class="([^"]+)"/g)) m[1].split(/\s+/).forEach((c) => classes.add(c));
    }
  }
  assert.ok(classes.size >= 4, 'the term stopped setting marks at all');
  for (const c of classes) {
    assert.match(css, new RegExp(`\\.${c}[\\s,{:]`), `.${c} is set by the title and styled nowhere`);
  }
  // The two the reading did not already have are styled where the title uses
  // them, scoped to it rather than loosed on the whole page: .lam and .aw mean
  // something on the search leaf, and a chapter is not that leaf.
  for (const c of ['lam', 'aw']) {
    assert.match(css, new RegExp(`\\.out-term \\.${c} \\{`), `.${c} is styled unscoped`);
  }
});
