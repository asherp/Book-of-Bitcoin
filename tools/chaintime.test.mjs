// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/chaintime.test.mjs — the estimate a coinbase's clock is checked
// against: that it dates a height closely enough for the window around it to
// mean something, and that the window still turns away what it must.
//
//   node --test tools/chaintime.test.mjs

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  expectedBlockTime, plausibleBlockTime, utcMinute,
  HALVING_ANCHORS, PLAUSIBLE_WINDOW,
} from '../web/btc-chaintime.js';

const DAY = 86400;
const days = (a, b) => Math.abs(a - b) / DAY;

test('the estimate is exact at the anchors', () => {
  for (const [height, time] of HALVING_ANCHORS) {
    assert.equal(expectedBlockTime(height), time, `height ${height}`);
  }
});

test('the estimate dates real blocks to within days, not months', () => {
  // Heights whose block times are public record, one per era the book reads
  // in. The estimate interpolates between halvings and walks forward at ten
  // minutes past the last one; what is claimed here is only that it lands
  // near enough for PLAUSIBLE_WINDOW to be a real test.
  const known = [
    [500000, 1513622125],   // 2017-12-18
    [700000, 1631333672],   // 2021-09-11
    [960281, 1785429755],   // 2026-07-30 — the block that started all this
  ];
  for (const [height, actual] of known) {
    const off = days(expectedBlockTime(height), actual);
    assert.ok(off < 30, `height ${height} estimated ${off.toFixed(1)} days out`);
    assert.ok(plausibleBlockTime(actual, height), `height ${height} should read as its own era`);
  }
});

test('the window turns away what does not belong to the height', () => {
  const TIME_960281 = 1785429755;
  assert.ok(plausibleBlockTime(TIME_960281, 960281));
  assert.ok(!plausibleBlockTime(TIME_960281, 250000), 'a 2026 clock over a 2013 block');
  assert.ok(!plausibleBlockTime(TIME_960281, 500000), 'or over a 2017 one');
  assert.ok(!plausibleBlockTime(67305985, 960281), 'a counter that decodes to 1972');
  assert.ok(!plausibleBlockTime(0, 960281), 'or to before the chain existed');
  assert.ok(!plausibleBlockTime(NaN, 960281), 'or to nothing at all');

  // The window's own edges, either side.
  const at = expectedBlockTime(960281);
  assert.ok(plausibleBlockTime(at + PLAUSIBLE_WINDOW, 960281), 'inclusive above');
  assert.ok(plausibleBlockTime(at - PLAUSIBLE_WINDOW, 960281), 'inclusive below');
  assert.ok(!plausibleBlockTime(at + PLAUSIBLE_WINDOW + 1, 960281));
});

test('a future height keeps walking forward rather than stopping', () => {
  const last = HALVING_ANCHORS[HALVING_ANCHORS.length - 1];
  assert.equal(expectedBlockTime(last[0] + 1000), last[1] + 600_000);
  assert.ok(expectedBlockTime(2_000_000) > expectedBlockTime(1_000_000));
});

test('a timestamp prints as the chapter head prints one', () => {
  assert.equal(utcMinute(1785429755), '2026-07-30 16:42');
  assert.equal(utcMinute(HALVING_ANCHORS[0][1]), '2009-01-03 18:15');
});
