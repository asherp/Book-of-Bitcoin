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

import { txOf, rankTransactions, TOP } from '../web/btc-projected.js';

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
  // A malformed row among good ones costs itself and nothing else.
  const { n } = rankTransactions([row(1), null, ['bad'], row(2)]);
  assert.equal(n, 2);
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
