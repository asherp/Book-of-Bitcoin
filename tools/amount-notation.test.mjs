// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/amount-notation.test.mjs — the amounts' dresses (btc-amounts.js):
// the record's three lossless spellings of one integer, and the valuations
// beside them. A valuation keeps a dust output from rounding to nothing,
// and falls back to the record's ₿ wherever there is no rate to
// read it at — which is also what these tests see: node has no localStorage,
// so the stored unit and the reader's own rate are absent by construction.
//
//   node --test tools/
//
// btc-amounts.js is dependency-free, so most of this runs on a bare
// checkout. The last test touches btc-prose.js — the book page's facade over
// the same machinery — which pulls in the Glossia WASM bundle, so it skips
// until web/glossia.js is built (same convention as the coinbase suite).

import test from 'node:test';
import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';

import { formatValuation, formatAmountAs, amountUnit, setDayPrice, dayPrice }
  from '../web/btc-amounts.js';

test('a valuation: money decimals, and dust never rounds to nothing', () => {
  const usd = { label: 'USD', perBtc: 100000 };
  // 1.23456789 ₿ at 100,000 per ₿ — two decimals, comma-grouped.
  assert.equal(formatValuation(123456789, usd), '123,456.79 USD');
  assert.equal(formatValuation(546, usd), '0.55 USD');
  assert.equal(formatValuation(1, usd), '0.001 USD');   // decimals stretch past 0.00
  assert.equal(formatValuation(0, usd), '0 USD');
  // The label prints as the reader spelled it, whatever they named.
  assert.equal(formatValuation(123456789, { label: 'slices', perBtc: 0.0002 }), '0.00025 slices');
});

test("'usd' reads at the day price the page set, and at ₿ where none is", () => {
  // No day settled: the record's ₿, never a stale or guessed figure.
  assert.equal(formatAmountAs(123456789, 'usd'), '1.23456789 ₿');
  setDayPrice({ perBtc: 1119.52, date: '2013-11-30', source: 'Bitstamp' });
  assert.equal(formatAmountAs(123456789, 'usd'), '1,382.12 USD');
  setDayPrice(null);
  assert.equal(dayPrice(), null);
  assert.equal(formatAmountAs(123456789, 'usd'), '1.23456789 ₿');
});

test("without a stored unit, 'own' falls back to the record's ₿ — and the choice can never read as a unit with nothing behind it", () => {
  assert.equal(formatAmountAs(123456789, 'own'), '1.23456789 ₿');
  assert.equal(amountUnit(), 'btc');   // no localStorage: the default, not 'usd' or 'own'
});

test('the record notations are the same integer, dressed', () => {
  assert.equal(formatAmountAs(123456789, 'btc'), '1.23456789 ₿');
  assert.equal(formatAmountAs(123456789, 'sats'), '123·456·789 sats');
  assert.equal(formatAmountAs(123456789, 'raw'), '123456789');
  assert.equal(formatAmountAs(0, 'btc'), '0 ₿');
});

const engineBuilt = await access(new URL('../web/glossia.js', import.meta.url)).then(() => true, () => false);
test("btc-prose re-exports the same machinery for the book page", { skip: engineBuilt ? false : 'web/glossia.js not built (see build_web.sh)' }, async () => {
  const prose = await import('../web/btc-prose.js');
  const amounts = await import('../web/btc-amounts.js');
  assert.equal(prose.formatOwnAmount, amounts.formatValuation);
  assert.equal(prose.formatAmount, amounts.formatAmount);
  assert.equal(prose.setDayPrice, amounts.setDayPrice);
});
