// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/keep-reference.test.mjs — what a keep is called when the reader has
// not named it (web/btc-citation.js), and the two pages that print it
// (web/bitcoin-contents.html, web/bitcoin-ledger.html).
//
// A bookmark carries three possible names: the reader's own title, the prose
// its txid was said in, and — failing both — nothing the page may print as
// bytes. A txid is high-entropy data, so it reaches a reader through Glossia
// or not at all; and the contents states the rule for itself already ("Every
// entry is cited by its reference, never its raw id"). Both pages nonetheless
// fell back to a truncated hex id, and the contents named an unnamed ledger by
// a truncated address.
//
// The answer is that an unnamed keep has no name to print: the row it sits on
// already cites the place, so a name there could only be that same citation
// twice. What the reader loses is the way to tell one unnamed keep from
// another, and `keepReference` carries that in the hover and the ribbon's
// label instead. It can always answer: addBookmark refuses to store a keep
// whose place it could not resolve, so a stored keep always knows its height.
//
//   node --test tools/keep-reference.test.mjs

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { citation, keepReference, reference } from '../web/btc-citation.js';

const contents = await readFile(new URL('../web/bitcoin-contents.html', import.meta.url), 'utf8');
const ledger = await readFile(new URL('../web/bitcoin-ledger.html', import.meta.url), 'utf8');
const proofs = await readFile(new URL('../web/btc-proofs.js', import.meta.url), 'utf8');

test('a citation is the chapter, and what the place adds to it', () => {
  // A chapter alone, when nothing narrower is known.
  assert.equal(citation(170), reference(170));
  // The §section, 1-based as the book prints it.
  assert.equal(citation(170, 2), 'I β1 ■171 §2');
  // After the point: an output carries digits, a witness footnote letters.
  assert.equal(citation(170, 2, 0), 'I β1 ■171 §2.0');
  assert.equal(citation(500000, 23, null, 1), 'III β40 ■1377 §23.a');
  // A scriptSig is the same input, uppercased — the case is the tag.
  assert.equal(citation(500000, 23, null, 1, true), 'III β40 ■1377 §23.A');
  // An output wins the point: a place is one or the other, never both at once.
  assert.equal(citation(170, 2, 0, 1), 'I β1 ■171 §2.0');
});

test('a keep with no name of its own is called by its reference', () => {
  // pos is stored 0-based, as addBookmark writes it; the §section is 1-based.
  assert.equal(keepReference({ height: 170, pos: 1 }), 'I β1 ■171 §2');
  assert.equal(keepReference({ height: 170, pos: 1, vout: 0 }), 'I β1 ■171 §2.0');
  assert.equal(keepReference({ height: 500000, pos: 22, wn: 1 }), 'III β40 ■1377 §23.a');
  // A chapter keep names no section, and must not invent §1.
  assert.equal(keepReference({ height: 170 }), 'I β1 ■171');
  assert.equal(keepReference({ height: 170, pos: null }), 'I β1 ■171');
});

test('a leaf is named by the span it stands at, not the chapter that opens it', () => {
  // The whole reason bitcoin-ledger.html filters `b.page` out of its own
  // quarters: citing III β40 ■1377 for a volume would name a different keep.
  assert.equal(keepReference({ height: 500000, page: 'volume' }), 'III');
  assert.equal(keepReference({ height: 500000, page: 'book' }), 'III β40');
  // …and the span's own numerals, not the chapter's, whichever block of it
  // the reader happened to keep from.
  assert.equal(keepReference({ height: 500001, page: 'volume' }),
    keepReference({ height: 500000, page: 'volume' }));
});

test('a keep with no place at all is declined, not guessed', () => {
  // addBookmark will not store one, so this is the belt to that braces — but
  // a name invented from a height that is not there would be a false citation.
  assert.equal(keepReference({ height: null }), '');
  assert.equal(keepReference({}), '');
  assert.equal(keepReference({ height: 'nope' }), '');
});

test('neither page shortens an id or an address to name something', () => {
  for (const [name, src] of [['contents', contents], ['ledger', ledger]]) {
    assert.doesNotMatch(src, /shortHex/, `${name}: no txid shortener survives`);
    assert.doesNotMatch(src, /shortAddr/, `${name}: no address shortener survives`);
    assert.doesNotMatch(src, /hex\.slice\(0, 10\)/, `${name}: nor one spelled inline`);
  }
  // An unnamed keep prints no name at all: the row it sits on already cites
  // the place, so the only thing a name could add is that citation twice.
  for (const [name, src] of [['contents', contents], ['ledger', ledger]]) {
    assert.match(src, /title: b\.title \|\| b\.prose \|\| '',/, `${name}: an unnamed keep prints nothing`);
    assert.match(src, /said: keepReference\(b\)/, `${name}: and carries its reference in the hover`);
  }
});

test('an unnamed keep is still identifiable, in the hover rather than in type', () => {
  // The ribbon says a keep is the reader's; without a name, what it is has to
  // reach them some other way. Both pages put the reference there — and the
  // label the ribbon carries is the same string, so it reaches a screen
  // reader too.
  assert.match(contents, /row\.title = `your bookmark — \$\{entry\.said\}`/,
    'the contents row says which keep it is');
  assert.match(contents, /setAttribute\('aria-label', `your bookmark — \$\{entry\.said\}`\)/,
    'and says it to a screen reader');
  // The shared tag drops the text node entirely rather than appending ''.
  const index = readFileSync(new URL('../web/btc-index.js', import.meta.url), 'utf8');
  assert.match(index, /if \(bm\.title\) tag\.append\(document\.createTextNode\(bm\.title\)\);/,
    'the ledger tag wears the ribbon alone when there is no name');
  assert.match(index, /tag\.title = `your bookmark\$\{bm\.title \|\| bm\.said/,
    'and the hover carries the reference instead');
});

test('an unnamed ledger is called the same thing on both pages', () => {
  // The contents used to cite the Ledger page's rule in a comment and then
  // print a shortened address; the two now say the same words.
  assert.match(ledger, /\? `Unnamed ledger · \$\{l\.addresses\.length\} passages`\s*\n\s*: 'Unnamed ledger'/,
    'The Ledgers names its own');
  assert.match(contents, /\? `Unnamed ledger · \$\{ledger\.addresses\.length\} passages`\s*\n\s*: 'Unnamed ledger'/,
    'and the contents names it identically');
});

test('a citation is spelled in exactly one place', () => {
  // btc-proofs.js printed its own reference + §section + .out. Two spellings
  // of one scheme is two schemes, and they drift.
  assert.match(proofs, /export const citeOf = \(place\) => citation\(/,
    'the proofs register delegates to the citation scheme');
  assert.doesNotMatch(proofs, /reference\(place\.height\)/, 'and no longer spells it itself');
});
