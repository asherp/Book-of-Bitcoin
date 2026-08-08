// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/projected.test.mjs — the alpha block's transactions, as the websocket
// sends them and as the two rankings reduce them. The socket itself is not
// exercised here (it is network, and belongs to no bare checkout's test run);
// what is pinned is the parsing and the ranking, which is everything a reader
// actually reads.
//
//   node --test tools/projected.test.mjs

import test from 'node:test';
import assert from 'node:assert/strict';

import { txOf, rankTransactions, rankSeated, manifestOf, applyDelta, TOP } from '../web/btc-projected.js';

// A row exactly as mempool.space sends one, read off the live socket:
//   txid, fee, vsize, value, rate
const REAL = ['8ead41ea64406e50c860f0fa38b689092556b8cce751bc85addf06d98d1d42fd',
  42300, 140.25, 4943138300, 301.6, 1099511631881, 1785988078];

const row = (i, { value = 1000, vsize = 200 } = {}) =>
  [String(i).padStart(64, 'a'), 500, vsize, value, 2.5];

test('a transaction is read out of the compact array the socket sends', () => {
  const t = txOf(REAL);
  assert.equal(t.txid, REAL[0]);
  assert.equal(t.fee, 42300);
  assert.equal(t.vsize, 140.25);
  assert.equal(t.value, 4943138300);
  // The field mapping is the one claim here that could be wrong in a way no
  // type check would catch, so it is pinned against the payload's own
  // arithmetic: the rate field is fee over vsize.
  assert.ok(Math.abs(t.fee / t.vsize - REAL[4]) < 0.5, 'fee ÷ vsize should reproduce the rate field');
});

test('a row that is not a transaction is dropped, never guessed at', () => {
  assert.equal(txOf(null), null);
  assert.equal(txOf([]), null);
  assert.equal(txOf(['too short', 1, 2, 3]), null);          // not a 64-hex id
  assert.equal(txOf([REAL[0], 1, 'nonsense', 3]), null);      // no vsize
  assert.equal(txOf([REAL[0], 1, 200, undefined]), null);     // no value
  // A malformed row among good ones costs itself and nothing else -- and, in
  // particular, does not shift the seats behind it. The seat is a place in
  // the manifest, which is the block the book will page; a dropped row still
  // occupies its place there.
  const r = rankTransactions([row(1), null, ['bad'], row(2)]);
  assert.equal(r.n, 2);
  assert.deepEqual(r.byAmount.map((t) => t.seat), [0, 3]);
});

test('a transaction carries its seat, which is its §section of the draft', () => {
  // The reference a leaf prints is the chapter's name and this number: the
  // manifest is template order, so the k-th row is the k-th section a miner
  // writing this block would write. Rank is not seat -- the largest by amount
  // is wherever the fee market put it -- so the seat has to survive the sort.
  const rows = [
    row(1, { value: 5 }),
    row(2, { value: 900 }),
    row(3, { value: 50 }),
  ];
  const r = rankTransactions(rows);
  assert.deepEqual(r.byAmount.map((t) => t.seat), [1, 2, 0], 'seats follow their transactions through the ranking');
  assert.deepEqual(r.byAmount.map((t) => t.value), [900, 50, 5]);
  // Seat 0 is §1: the manifest is 0-based and the book's sections are not.
  assert.equal(Math.min(...r.byAmount.map((t) => t.seat)), 0);
});

test('the rankings are largest first, by what they move and by what they weigh', () => {
  const rows = [
    row(1, { value: 5, vsize: 900 }),
    row(2, { value: 900, vsize: 5 }),
    row(3, { value: 50, vsize: 50 }),
  ];
  const r = rankTransactions(rows);
  assert.deepEqual(r.byAmount.map((t) => t.value), [900, 50, 5]);
  assert.deepEqual(r.bySize.map((t) => t.vsize), [900, 50, 5]);
});

test('a tie breaks by txid, so a ranking does not reshuffle between readings', () => {
  const same = [row(3, { value: 100 }), row(1, { value: 100 }), row(2, { value: 100 })];
  const first = rankTransactions(same).byAmount.map((t) => t.txid);
  const again = rankTransactions([...same].reverse()).byAmount.map((t) => t.txid);
  assert.deepEqual(first, again);
});

test('the totals are over the whole block, not over the hundred shown', () => {
  // A leaf that summed its own rows would be describing its own cap. The
  // block here holds 250 transactions; the lists hold TOP of them.
  const rows = Array.from({ length: 250 }, (_, i) => row(i, { value: 1000, vsize: 200 }));
  const r = rankTransactions(rows);
  assert.equal(r.n, 250);
  assert.equal(r.value, 250 * 1000);
  assert.equal(r.vsize, 250 * 200);
  assert.equal(r.byAmount.length, TOP);
  assert.equal(r.bySize.length, TOP);
});

test('a block smaller than the cap is shown whole', () => {
  const r = rankTransactions(Array.from({ length: 7 }, (_, i) => row(i)));
  assert.equal(r.byAmount.length, 7);
  assert.equal(r.bySize.length, 7);
});

test('nothing to read is a block of nothing, not a crash', () => {
  const r = rankTransactions([]);
  assert.deepEqual(r, { n: 0, value: 0, vsize: 0, byAmount: [], bySize: [] });
  assert.equal(rankTransactions(null).n, 0);
});

// ── The manifest, maintained ──────────────────────────────────────────────
//
// The seats are what the leaf prints, so the arithmetic that moves them is
// the arithmetic worth pinning: a removal ahead of a transaction moves it
// forward, an arrival ahead of it moves it back, and a reference that did not
// move with them would be a wrong citation rather than a stale one.

const rate = (i, r) => [String(i).padStart(64, 'a'), 500, 200, 1000, r];
const ids = (m) => m.map((t) => (t ? Number(t.txid.replace(/^a+/, '') || 0) : null));

test('a removal moves everything behind it one seat forward', () => {
  const m = manifestOf([rate(1, 30), rate(2, 20), rate(3, 10)]);
  const after = applyDelta(m, { removed: [m[0].txid] });
  assert.deepEqual(ids(after), [2, 3]);
  assert.equal(rankTransactions([rate(2, 20), rate(3, 10)]).byAmount[0].seat, 0);
  // §2 became §1: the leaf that printed §2 a moment ago is now printing a
  // number the book would disagree with, which is the whole reason the feed
  // is held open.
  assert.equal(after.findIndex((t) => t.txid === m[1].txid), 0);
});

test('an arrival is seated by what it pays, and pushes the rest back', () => {
  const m = manifestOf([rate(1, 30), rate(2, 10)]);
  const after = applyDelta(m, { added: [rate(9, 20)] });
  assert.deepEqual(ids(after), [1, 9, 2], 'seated between the two it outbids and underbids');
  const tail = applyDelta(m, { added: [rate(9, 5)] });
  assert.deepEqual(ids(tail), [1, 2, 9], 'a transaction paying less than any of them goes last');
});

test('a rate change restates a rate without reseating anything', () => {
  // The backend reseats by sending its own listing; a change frame says only
  // what a transaction now pays, and guessing a new order from it would put
  // this page's seats out of step with the book's.
  const m = manifestOf([rate(1, 30), rate(2, 20)]);
  const after = applyDelta(m, { changed: [[m[1].txid, 99]] });
  assert.deepEqual(ids(after), [1, 2]);
  assert.equal(after[1].rate, 99);
});

test('a transaction already seated is not seated twice', () => {
  const m = manifestOf([rate(1, 30), rate(2, 20)]);
  assert.deepEqual(ids(applyDelta(m, { added: [rate(2, 20)] })), [1, 2]);
});

test('a hole in the listing holds its seat', () => {
  // The book's manifest counts every row the socket listed, so a row this
  // page cannot parse still occupies a §section. It ranks nowhere and shifts
  // nothing behind it.
  const m = manifestOf([rate(1, 30), null, rate(3, 10)]);
  assert.deepEqual(ids(m), [1, null, 3]);
  const r = rankSeated(m);
  assert.equal(r.n, 2, 'the hole is ranked nowhere');
  assert.deepEqual([...r.byAmount].map((t) => t.seat).sort(), [0, 2], 'and the seat behind it is 2, not 1');
  // And it survives maintenance: the delta neither removes nor counts it.
  assert.deepEqual(ids(applyDelta(m, { added: [rate(9, 20)] })), [1, null, 9, 3]);
});

test('an empty or absent delta leaves the manifest exactly as it was', () => {
  const m = manifestOf([rate(1, 30), rate(2, 20)]);
  assert.equal(applyDelta(m, null), m);
  assert.deepEqual(ids(applyDelta(m, {})), [1, 2]);
  assert.deepEqual(applyDelta(null, { added: [rate(1, 5)] }), []);
});
