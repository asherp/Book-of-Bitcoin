// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/revenue.test.mjs — what mining the queue is expected to pay, which
// Appendix I's title page prints as one figure. Subsidy plus fees over the
// chapters the queue would fill; the asking is network, the arithmetic is
// not, and this pins the arithmetic.
//
//   node --test tools/revenue.test.mjs

import test from 'node:test';
import assert from 'node:assert/strict';

import { revenueOf, MVB } from '../web/btc-mempool.js';
import { subsidyAt } from '../web/btc-citation.js';

const BTC = 100_000_000;
// A projected chapter as /v1/fees/mempool-blocks answers one.
const block = (totalFees, blockVSize = 997_990) => ({ blockVSize, nTx: 6000, medianFee: 2, totalFees });

test('revenue is the subsidy the schedule mints plus the fees the sections carry', () => {
  const tip = 961_200;                       // fifth era: 3.125 ₿ a chapter
  const r = revenueOf(tip, [block(845_912), block(447_522), block(416_553)]);
  assert.equal(r.chapters, 3);
  assert.equal(r.fees, 845_912 + 447_522 + 416_553);
  assert.equal(r.sats, 3 * subsidyAt(tip + 1) + r.fees);
  // The subsidy is much the larger part, which is the whole reason the row
  // does not print fees alone.
  assert.ok(r.sats - r.fees > 100 * r.fees);
});

test('the backend\'s aggregate tail stands for every chapter it spans', () => {
  // A last entry far over one block's vsize is everything deeper, rolled up.
  // Each chapter inside it is due a subsidy of its own; counting it as one
  // would understate the figure by the subsidy of all the rest.
  const tip = 961_200;
  const one = revenueOf(tip, [block(1000)]);
  const rolled = revenueOf(tip, [block(1000), block(2000, 5 * MVB)]);
  assert.equal(one.chapters, 1);
  assert.equal(rolled.chapters, 6);
  assert.equal(rolled.sats, 6 * subsidyAt(tip + 1) + 3000);
});

test('a queue that crosses a halving is counted on both sides of it', () => {
  // The last chapter of an era and the first of the next pay different
  // subsidies, and the schedule -- not this function -- decides which.
  // 1,050,000 opens the sixth era, so a tip of 1,049,998 leaves one chapter
  // either side of the boundary.
  const tip = 1_049_998;
  const r = revenueOf(tip, [block(0), block(0)]);
  assert.equal(subsidyAt(tip + 1), 312_500_000, 'the last chapter of the era');
  assert.equal(subsidyAt(tip + 2), 156_250_000, 'the first chapter of the next');
  assert.notEqual(r.sats, 2 * subsidyAt(tip + 1), 'the two chapters cannot pay the same');
  assert.equal(r.sats, subsidyAt(tip + 1) + subsidyAt(tip + 2));
});

test('past the last halving the schedule mints nothing and only fees remain', () => {
  const tip = 64 * 210_000;                  // BIP42's cap: no subsidy beyond here
  const r = revenueOf(tip, [block(7_777)]);
  assert.equal(r.sats, 7_777);
  assert.equal(r.fees, 7_777);
});

test('a chapter whose fees are unstated adds its subsidy and no invented fee', () => {
  const tip = 961_200;
  const r = revenueOf(tip, [block(undefined), block(500)]);
  assert.equal(r.fees, 500);
  assert.equal(r.sats, 2 * subsidyAt(tip + 1) + 500);
});

test('nothing to read is null, never a queue worth zero', () => {
  assert.equal(revenueOf(961_200, []), null);
  assert.equal(revenueOf(961_200, null), null);
  assert.equal(revenueOf(null, [block(1)]), null);
});

test('the figure is exact in satoshis — no float drift at bitcoin scale', () => {
  const tip = 961_200;
  const r = revenueOf(tip, [block(1)]);
  assert.equal(r.sats, 3.125 * BTC + 1);
  assert.equal(Number.isInteger(r.sats), true);
});
