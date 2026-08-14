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
import { termOfScript, titleHtml, titleText } from '../web/btc-term.js';

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
  const fn = Function('document', 'termOfScript', 'titleHtml',
    `${m[0]}\nreturn termTitle;`)(document, termOfScript, titleHtml);
  // The keep line as the page builds it: the script's bytes on the dataset,
  // which is the whole of what a title needs.
  return (spk) => {
    const el = { ...make(), dataset: spk === null ? {} : { spk } };
    return { drew: fn(el), lines: el.children };
  };
}

// One title apiece, and one line: a title names the abstraction, and every
// output of a shape shares it. The demand rung is what varies by how an output
// may be opened -- taproot has two -- and a title is not that rung.
const ADDRESSES = [
  ['P2PKH',  '1Ross5Np5doy4ajF9iGXzgKaC2Q3Pwwxv', 'λh. ⧉ ⌖ h ≡ ∇'],
  ['P2SH',   '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy', 'λh. ⌖ h ='],
  ['P2WPKH', 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4', 'λh. ⓪ h'],
  ['P2WSH',  'bc1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3qccfmv3', 'λh. ⓪ h'],
  ['P2TR',   'bc1p5d7rjq7g6rdk2yhzks9smlaqtedr4dekq08ge8ztwac72sfr9rusxg3297', 'λp. ① p'],
];

test('every form is titled by the anonymous λ it binds, on one line', async () => {
  const paint = await painter();
  const strip = (html) => html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  for (const [what, address, expected] of ADDRESSES) {
    const got = paint(addressScriptHex(address));
    assert.equal(got.drew, true, `${what} draws no title`);
    assert.equal(got.lines.length, 1, `${what} draws more than one title`);
    const [line] = got.lines;
    assert.equal(line.className, 'out-term');
    assert.ok(line.title, `${what}: a title with no hover explains nothing`);
    assert.equal(strip(line.innerHTML), expected, what);
    // Bare of what a title does not need: no ⟦ ⟧, which would claim the wire's
    // own bytes; no application and no parentheses, which would say what was
    // done to the term rather than what it is; and no count on the binder,
    // since every output of this shape carries the same title.
    assert.ok(!/[⟦⟧()]/.test(strip(line.innerHTML)), `${what}: a title carries no apparatus`);
    assert.ok(!/[⁰¹²³⁴⁵⁶⁷⁸⁹]/.test(strip(line.innerHTML)), `${what}: the binder stands bare`);
    assert.equal(strip(line.innerHTML), titleText(termOfScript(addressScriptHex(address))));
  }
});

test('anything that binds a term is titled, tabled or not', async () => {
  const paint = await painter();
  const strip = (html) => html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  // A title is read off the bytes, so it does not wait on the book having
  // written down what opens them. A data output binds its blob and no demand
  // is tabled for it -- it is titled all the same, because what it IS is a
  // question its own bytes answer.
  const data = paint('6a' + '04' + 'ab'.repeat(4));
  assert.equal(data.drew, true, 'a data output');
  assert.equal(strip(data.lines[0].innerHTML), 'λd. ¶ d');
  // …and a well-formed script no template claims.
  const odd = paint('76a914' + 'ab'.repeat(20));
  assert.equal(odd.drew, true, 'an unclassified script');
  assert.equal(strip(odd.lines[0].innerHTML), 'λh. ⧉ ⌖ h');
  // What goes untitled is what binds nothing: bytes that are not a script,
  // a push claiming more than remains, a script with nothing to abstract over.
  assert.equal(paint('deadbeef').drew, false, 'undefined opcodes');
  assert.equal(paint('76a914' + 'ab'.repeat(19)).drew, false, 'a truncated push');
  assert.equal(paint('76a988ac').drew, false, 'nothing to abstract over');
  assert.equal(paint('').drew, false);
  assert.equal(paint(null).drew, false, 'a line with no script on it');
});

test('the bookmark stands above the title, and neither displaces the other', async () => {
  const page = await bookPage();
  // Two lines, in that order: the keep -- a name somebody filed, and the ribbon
  // that files it -- and then the term below it. A bookmark goes above a title
  // because it answers the harder question (whose this is); the term answers
  // what it is, which the book can say without anyone's help.
  const keep = page.indexOf("outputsEl.append(outKeep);");
  const term = page.indexOf("outputsEl.append(outTerm);");
  assert.ok(keep > 0 && term > 0, 'the page no longer appends both lines');
  assert.ok(keep < term, 'the term is painted above the bookmark');
  // The term is painted once, where it is built, and never from the keep
  // painter -- so no name can displace it and none has to be removed to bring
  // it back. They are different lines saying different things.
  assert.match(page, /outTerm\.className = 'tx-out-term';[\s\S]{0,200}?termTitle\(outTerm\);/,
    'the term is no longer painted on its own line');
  const fn = /function syncScriptKeeps\(\) \{[\s\S]*?\n\}/.exec(page);
  assert.ok(fn, 'the page no longer paints its keep lines');
  assert.ok(!/termTitle\(/.test(fn[0]), 'the keep painter is writing titles again');
  // …and a script with no address still gets one: an OP_RETURN has no ledger
  // to keep, which is a reason to offer no ribbon, not a reason to leave the
  // paragraph untitled.
  assert.match(fn[0], /if \(!address\) continue;/, 'the keep line still needs an address');
  assert.match(page, /outTerm\.dataset\.spk = out\.spkHex;/, 'the term reads the bytes alone');
});

test('the title is sized by the sigla, and takes their scale once', async () => {
  const page = await bookPage();
  const css = page.slice(0, page.indexOf('</style>'));
  // Every other line on a section is prose with marks set into it, so the
  // marks ride --scale-sigla-ratio and the sentence keeps the body's size. A
  // title has no sentence around it -- it is notation end to end -- so the
  // whole line takes the sigla scale.
  assert.match(css, /\.tx-out-term \{ font-size: calc\(13\.5px \* var\(--scale-body, 1\) \* var\(--scale-sigla-ratio, 1\)\); \}/,
    'the title no longer scales with the sigla');
  // …once. #page-slide .op multiplies 1em by the same ratio, so a mark on a
  // line already carrying it would take the ratio twice; the page neutralizes
  // that here exactly as it does for .op-count.
  assert.match(css, /#page-slide \.tx-out-term \.op \{ font-size: 1em; \}/,
    'the opcodes in a title take the sigla ratio twice');
  // The neutralizer has to outrank the rule it neutralizes: an id and two
  // classes against an id and one, which is why it carries #page-slide too.
  const at = css.indexOf('#page-slide .tx-out-term .op');
  assert.ok(at > 0 && css.indexOf('#page-slide .op {') !== at, 'the two rules must be distinct');
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
    const line = titleHtml(termOfScript(addressScriptHex(address)));
    for (const m of line.matchAll(/class="([^"]+)"/g)) m[1].split(/\s+/).forEach((c) => classes.add(c));
  }
  assert.ok(classes.size >= 2, 'the term stopped setting marks at all');
  for (const c of classes) {
    assert.match(css, new RegExp(`\\.${c}[\\s,{:]`), `.${c} is set by the title and styled nowhere`);
  }
  // The one the reading did not already have is styled where the title uses
  // it, scoped to it rather than loosed on the whole page: .lam means
  // something on the search leaf, and a chapter is not that leaf.
  assert.ok(classes.has('lam'), 'the title stopped setting the calculus apart');
  assert.match(css, /\.out-term \.lam \{/, '.lam is styled unscoped');
  // …and the marks that were already the book's own are not redefined here:
  // an opcode reads in a title as it reads in the paragraph below it.
  for (const c of ['op', 'dt']) {
    assert.ok(!new RegExp(`\\.out-term \\.${c} \\{`).test(css), `.${c} is restyled for the title`);
  }
});
