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

// The rankings' row-building block, from where the leaf decides which
// ranking it is showing to where it hands the list to the screen.
const RANK_END = 'addEventListener(\'pagehide\', stop)';
const rankRows = appendix.slice(appendix.indexOf('const byValue = QUEUE ==='),
  appendix.indexOf(RANK_END) + RANK_END.length);

test('a ranked transaction is a door, and it reads as a reference', () => {
  assert.match(rankRows, /createElement\('a'\)/, 'the reference cell is an anchor, not a dead span');
  assert.match(rankRows, /id\.href = `\.\/bitcoin-book\.html\?txid=\$\{t\.txid\}`/,
    'the whole txid travels — a shortened one addresses nothing');
  // The book prints no txid a reader would have to squint at. The chapter is
  // cited as the chapter view's own eyebrow cites it and the transaction is
  // seated, so the cell reads like every other citation in the book: a place,
  // not an identifier.
  assert.match(rankRows, /□\$\{chapter\.toLocaleString\('en-US'\)\} `\}§\$\{\(t\.seat \+ 1\)/,
    'the cell reads □chapter §section');
  assert.match(rankRows, /chapter == null \? '' :/,
    'and prints half a reference rather than a wrong one while the tip is unknown');
  assert.doesNotMatch(rankRows, /t\.txid\.slice/, 'no part of a txid is shown');
  assert.doesNotMatch(rankRows, /title = `\$\{t\.txid\}/, 'nor hidden in the hover');
  assert.match(appendix, /a\.bb-ref:hover/, 'and the cell reads as something to press');
});

test('the seats are kept in step with the queue, not printed once', () => {
  // A §section number is a claim about where a transaction sits now. The
  // queue reseats constantly, so the feed is held open and every frame
  // repaints — otherwise the leaf would be citing a seat the book has
  // already moved.
  assert.match(rankRows, /const stop = watchAlpha\(\{/, 'the feed is watched, not read once');
  assert.match(rankRows, /onReading: \(snap\) => \{/, 'and each frame comes back to the leaf');
  assert.match(rankRows, /addEventListener\('pagehide', stop\)/, 'and the socket goes when the page does');
  // Reordering by moving the existing nodes, not rebuilding them: a renumber
  // every few seconds must not blink the table or drop a hover.
  assert.match(rankRows, /const seats = new Map\(\);/, 'rows are held by txid');
  assert.match(rankRows, /el\.append\(row\.node\);/, 'and moved into place rather than recreated');
  assert.match(rankRows, /if \(row\.id\.textContent !== ref\)/, 'a seat that did not move is not rewritten');
  // A dropped feed must not blank rows that are still on screen.
  assert.match(rankRows, /if \(last\) return;\s*\/\/ the feed dropped mid-reading/,
    'a mid-reading failure leaves the table standing');
});

test('the chapter the seats are cited in follows the tip', () => {
  assert.match(rankRows, /volumeBookChapter\(tip \+ 1\)\.chapter/,
    'the draft is the chapter past the tip');
  assert.match(rankRows, /onTip: setTip/, 'and a mined block renames it without a reload');
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

test('a coin spent into the queue is cited there, not left blank', () => {
  // The two margins are meant to mirror each other -- the left says where
  // value came from, the right where it went next -- and the left has cited
  // unmined prevouts all along (projectedCitation). The right used to drop
  // them, so a coin already spent read as unspent until a miner agreed.
  const fwd = book.slice(book.indexOf('async function resolveForwardCitations'),
    book.indexOf('// Populate a citation cell with the scripture-style reference'));
  assert.match(fwd, /if \(!sp \|\| !sp\.spent \|\| !sp\.txid\) return;/,
    'an unspent output is still the only one with nothing to say');
  assert.match(fwd, /if \(!sp\.status \|\| !sp\.status\.confirmed\) \{ await citeDraftSpender/,
    'an unmined spender is cited rather than dropped');
  const draft = book.slice(book.indexOf('async function citeDraftSpender'),
    book.indexOf('// Populate a citation cell with the scripture-style reference'));
  // □ over ■, from the same helper the chapter's own reference uses, so a
  // provisional citation differs from a settled one by one glyph.
  assert.match(draft, /referenceOf\(place\.height\)/, 'cited with the expected mark');
  assert.match(draft, /place\.pos === null/, 'and with the seat only when the seat is known');
  // The door is the txid: a seat printed a moment ago may have moved, the
  // transaction has not.
  assert.match(draft, /link\.href = `\?txid=\$\{sp\.txid\}`/, 'the door is the name that does not move');
  assert.match(draft, /goToTransaction\(sp\.txid, `in-\$\{sp\.vin\}`\)/,
    'and it lands on the input that took the coin, as the mined form does');
});

test('placing a draft costs the manifests in hand first, and is bounded after', () => {
  const place = book.slice(book.indexOf('async function draftPlace'),
    book.indexOf('// An amount\'s hover'));
  assert.ok(place.indexOf('projectedCitation(txid)') < place.indexOf('fetchTxProjection(txid)'),
    'what is already in hand is free, and answers exactly — it is asked first');
  assert.ok(place.indexOf('loadProjection()') < place.indexOf('fetchTxProjection(txid)'),
    'and the projection is read before the feed, so the feed has a host to ask');
  assert.match(place, /if \(draftAsked >= DRAFT_PLACES\) return null;/,
    'a page stops asking: a citation is an annotation, not a reason to hold the network open');
  assert.match(place, /draftRenderGen !== renderGen/, 'and the count is per page, not per session');
  // The backend keeps ONE tracked transaction per client, so two questions
  // asked at once would answer each other's.
  assert.match(place, /draftChain = next\.then/, 'the questions are asked one at a time');
  assert.match(place, /gen === renderGen \? fetchTxProjection\(txid\) : null/,
    'and a question queued for a page the reader has left is not asked at all');
});
