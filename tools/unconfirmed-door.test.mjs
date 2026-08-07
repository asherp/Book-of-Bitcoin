// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/unconfirmed-door.test.mjs — the door from the queue's rankings into
// the book (web/bitcoin-appendix.html), and the landing behind it
// (web/bitcoin-book.html).
//
// A transaction no block has recorded still has a page: the queue seats it in
// a projected chapter, and that seat is a §section like any other. Both ends
// of that are wiring in two large documents with no module seam to import, so
// these are static assertions over their source — the same stance
// export-passage.test.mjs takes, and for the same reason: every way this can
// break is silent. A row that stops being an anchor still renders. A lookup
// that stops rerouting still prints a sentence. Neither throws.
//
//   node --test tools/unconfirmed-door.test.mjs

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const book = await readFile(new URL('../web/bitcoin-book.html', import.meta.url), 'utf8');
const appendix = await readFile(new URL('../web/bitcoin-appendix.html', import.meta.url), 'utf8');

test('a ranked transaction is a door, and it reads as a reference', () => {
  const rows = appendix.slice(appendix.indexOf('const byValue = QUEUE ==='),
    appendix.indexOf("el.classList.remove('hidden')", appendix.indexOf('const byValue = QUEUE ===')));
  assert.match(rows, /createElement\('a'\)/, 'the reference cell is an anchor, not a dead span');
  assert.match(rows, /id\.href = `\.\/bitcoin-book\.html\?txid=\$\{t\.txid\}`/,
    'the whole txid travels — a shortened one addresses nothing');
  // The book prints no txid a reader would have to squint at. The chapter is
  // named and the transaction is seated, so the cell reads like every other
  // citation in the book: a place, not an identifier.
  assert.match(rows, /id\.textContent = `\$\{alpha\} §\$\{\(t\.seat \+ 1\)/,
    'the cell reads chapter and §section');
  assert.match(rows, /const alpha = queueLabel\(1\)/,
    'and the chapter is named where the book names it, not spelled again here');
  assert.doesNotMatch(rows, /t\.txid\.slice/, 'no part of a txid is shown');
  assert.doesNotMatch(rows, /id\.title = `\$\{t\.txid\}/, 'nor hidden in the hover');
  assert.match(appendix, /a\.bb-ref:hover/, 'and the cell reads as something to press');
});

test('an unconfirmed transaction is rerouted, not dead-ended', () => {
  // The throw is marked so the lookup can tell this failure from every other
  // one: a 404 or a mirror error must still surface as itself.
  assert.match(book, /e\.unconfirmed = true;/, 'the unconfirmed case names itself on the error');
  const lookup = book.slice(book.indexOf('async function openLookup'),
    book.indexOf('async function futureCommentary'));
  assert.match(lookup, /if \(!e\.unconfirmed\) throw e;/, 'only that case is rerouted');
  assert.match(lookup, /if \(await stepUnconfirmed\(hex\)\) return;/, 'and it is rerouted to the queue');
  assert.match(lookup, /await tipP;\s*\/\/ stepUnconfirmed counts from the tip/,
    'the tip is known before a height past it is computed');
  // The message that remains is the one for a transaction the projection
  // cannot seat -- it must not still promise a chapter the reader was just
  // refused.
  const msg = /const e = new Error\('([^']+)'\);/.exec(book.slice(book.indexOf('if (!tx.status || !tx.status.confirmed)')));
  assert.ok(msg, 'the unconfirmed throw carries a sentence');
  assert.doesNotMatch(msg[1], /it sits in one of the projected chapters/,
    'the fallback no longer points at a chapter the landing already tried');
});

test('the landing asks the two questions a seat is made of', () => {
  const step = book.slice(book.indexOf('async function stepUnconfirmed'),
    book.indexOf('// ── Live frontage'));
  // Which projected block, then where in it. Order matters: loadProjection is
  // what learns the backend host the position question is asked over.
  assert.ok(step.indexOf('loadProjection()') < step.indexOf('fetchTxProjection(txid)'),
    'the projection is read first, so the feed has a host to ask');
  assert.match(step, /k < 0 \|\| k >= proj\.blocks\.length/, 'a block past the projection\'s reach is no seat');
  assert.match(step, /manifest\.findIndex\(\(t\) => t\.txid === txid\)/, 'the seat is found by name, never guessed');
  assert.match(step, /if \(i < 0\) return false;/, 'a transaction the manifest does not list has no page here');
  assert.match(step, /return stepProjected\(tipHeight \+ 1 \+ k, i\)/,
    'the seat opens as the section it is, in the chapter that holds it');
});

test('the position feed answers or lets go — it never hangs the lookup', () => {
  const feed = book.slice(book.indexOf('function fetchTxProjection'),
    book.indexOf('function projectedManifest'));
  assert.match(feed, /'track-tx': txid/, 'the backend is asked where the transaction sits');
  assert.match(feed, /tp\.txid !== txid/, 'and an answer about another transaction is not taken for ours');
  assert.match(feed, /setTimeout\(\(\) => done\(null\), TX_POSITION_WAIT\)/, 'a silent pool costs a wait, not the page');
  for (const ev of ['error', 'close']) {
    assert.match(feed, new RegExp(`addEventListener\\('${ev}', \\(\\) => done\\(null\\)\\)`),
      `a feed that ${ev}s resolves rather than leaving the promise open`);
  }
  assert.match(feed, /if \(!mempoolBackendBase\) \{ resolve\(null\); return; \}/,
    'no backend, no question — the caller says so instead of waiting');
});
