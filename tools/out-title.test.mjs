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
  ['P2PKH',  '1Ross5Np5doy4ajF9iGXzgKaC2Q3Pwwxv', 'P2PKH := λh. ⧉ ⌖ h ≡ ∇'],
  ['P2SH',   '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy', 'P2SH := λh. ⌖ h ='],
  ['P2WPKH', 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4', 'P2WPKH := λh. ⓪ h'],
  ['P2WSH',  'bc1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3qccfmv3', 'P2WSH := λh. ⓪ h'],
  ['P2TR',   'bc1p5d7rjq7g6rdk2yhzks9smlaqtedr4dekq08ge8ztwac72sfr9rusxg3297', 'P2TR := λp. ① p'],
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
    // The kind opens the line and := binds it to the term the module writes,
    // so the reading and the search leaf state one definition the same way.
    const t = termOfScript(addressScriptHex(address));
    assert.equal(strip(line.innerHTML), `${t.label} := ${titleText(t)}`);
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
  assert.equal(strip(data.lines[0].innerHTML), 'data := λd. ¶ d');
  // …and a well-formed script no template claims, which the kind names for
  // exactly what the page knows it to be.
  const odd = paint('76a914' + 'ab'.repeat(20));
  assert.equal(odd.drew, true, 'an unclassified script');
  assert.equal(strip(odd.lines[0].innerHTML), 'Script := λh. ⧉ ⌖ h');
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

test('the title is sized with the lines it is stacked with', async () => {
  const page = await bookPage();
  const css = page.slice(0, page.indexOf('</style>'));
  // The three lines above a paragraph -- the bookmark title, the keep, the
  // term -- are one group of headings over one paragraph, so they take one
  // scale. A title that sized itself from the sigla would fall out of step
  // with the two it is stacked under the moment a reader diverged them.
  const size = /calc\(13\.5px \* var\(--scale-body, 1\)\)/;
  for (const line of ['tx-out-title', 'tx-out-keep', 'tx-out-term']) {
    const rule = new RegExp(`\\.${line} \\{[^}]*\\}`).exec(css);
    assert.ok(rule, `.${line} is no longer sized here`);
    assert.match(rule[0], size, `.${line} left the body scale`);
    assert.ok(!/--scale-sigla-ratio/.test(rule[0]), `.${line} sizes itself from the sigla`);
  }
  // …and the marks inside it are proportional to the body too. The title is
  // nothing but marks, so leaving them on the inline ratio would size the whole
  // line by it and pull the heading out of step with the two it is stacked
  // under the moment a reader diverged the sigla. The ratio still reaches the
  // paragraph below, where the marks punctuate prose and the divergence is
  // what it is for.
  assert.match(css, /#page-slide \.tx-out-term \.op \{ font-size: 1em; \}/,
    'the title leaves its marks on the sigla ratio');
  assert.match(css, /#page-slide \.op \{ font-size: calc\(1em \* var\(--scale-sigla-ratio, 1\)\); \}/,
    'the rule the title neutralizes is gone');
  // The neutralizing follows the book's own precedent, and reads as one family
  // with it: a push count and a template timestamp are held at 1em for the
  // same reason, being measurements rather than operations.
  assert.match(css, /#page-slide \.op\.op-count, #page-slide \.op\.op-tpltime \{ font-size: 1em; \}/,
    'the precedent for holding a mark at the body size is gone');
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
  // …and the painter's own, which the module never emits: the kind and the :=
  // are written by the page, so nothing above would have caught them going
  // unstyled.
  for (const c of ['out-kind', 'out-def']) classes.add(c);
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

// ─── the rule: high entropy reaches a reader as prose or not at all ──────

const searchPage = () => readFile(new URL('../web/bitcoin-search.html', import.meta.url), 'utf8');

test('the message footnote is headed by its digest, said, and never by hex', async () => {
  const page = await searchPage();
  const foot = /const messageFoot = [\s\S]*?\n\};/.exec(page);
  assert.ok(foot, 'the leaf no longer sets a message footnote');
  const src = foot[0];
  // The digest leads, said in the book's own tongue. The fields below are the
  // metadata -- what went into the hash -- and this is what came out, which is
  // the one number a reader checks.
  assert.match(src, /const digest = sayFn \? sayFn\(message\.digest\)/, 'the digest is not said');
  assert.match(src, /term-fn-digest[\s\S]*?\$\{rows\}/, 'the digest no longer heads the fields');
  // And it heads them alone. A caption below it used to repeat the algorithm
  // and the sighash flavour; both are still available from the heading's hover
  // and the nHashType row.
  assert.ok(!/term-fn-head/.test(src), 'the footnote has grown a second heading again');
  // …and neither the digest nor the preimage is ever set in type. They ride on
  // the element, where they can be copied and cannot be read.
  assert.match(src, /data-hash="\$\{escapeHtml\(message\.digest\)\}"/);
  assert.match(src, /data-preimage="\$\{escapeHtml\(message\.preimage\)\}"/);
  for (const bad of [/>\$\{escapeHtml\(message\.digest\)\}</, />\$\{escapeHtml\(message\.preimage\)\}</]) {
    assert.ok(!bad.test(src), 'the footnote prints raw bytes as text');
  }
  // Two things are worth taking from a digest: the number, and the
  // serialization it was taken over, so a reader can hash it and compare
  // rather than take the page's word.
  assert.match(page, /\['Copy hash', host\.dataset\.hash\], \['Copy preimage', host\.dataset\.preimage\]/);
});

test('nothing high-entropy on the leaf falls back to hex', async () => {
  const page = await searchPage();
  // Every field of the message, and both sides of a disagreement, are said or
  // they show a mark. The engine is what says them, and a build without it
  // gets … with the claim in its hover -- never the bytes, which is the rule
  // this book keeps wherever it prints a hash.
  const values = /const fieldValue = [\s\S]*?\n\};/.exec(page);
  assert.ok(values, 'the leaf no longer sets message fields');
  assert.ok(!/escapeHtml\(f\.bytes\)/.test(values[0]), 'a field falls back to its own hex');
  assert.ok(!/escapeHtml\(f\.of\.txid\)/.test(values[0]), 'an outpoint falls back to its id');
  assert.match(values[0], /return said \|\| \(f\.bytes \? unsaid\(\) : '—'\)/);
  // The ☒ path is not an exception. A disagreement is where a reader most
  // needs to compare two scripts closely, and prose is what they compare.
  const mark = /const chainMark = [\s\S]*?\n\};/.exec(page);
  assert.ok(mark, 'the leaf no longer marks the chain’s answer');
  assert.ok(!/term-hex">\$\{escapeHtml\(theirs\)\}/.test(mark[0]),
    'the disagreement still prints scripts as hex');
  assert.match(mark[0], /spellHtml\(h, \{ say: sayFn \}\) \|\| unsaid\(\)/);
  // What may still be set as figures is what is not high entropy: a byte's
  // position in a script, and the one undefined byte at it. Those are a
  // diagnosis, and a diagnosis with no place in it is not much better than
  // silence.
  const fault = /const faultNote = [\s\S]*?\n\};/.exec(page);
  assert.match(fault[0], /byte \$\{f\.at\}/, 'a fault no longer says where it is');
});
