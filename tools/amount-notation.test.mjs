// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/amount-notation.test.mjs — the amounts' dresses, and in particular
// the one the reader authors: a unit of their own naming, at a rate of their
// own setting. The record's three notations are lossless spellings of one
// integer; the own-unit figure is a valuation, so it wears ≈, keeps a dust
// output from rounding to nothing, and falls back to the record's ₿ whenever
// no unit is stored (which is also what these tests see: node has no
// localStorage, so ownUnit() is null here by construction).
//
//   node --test tools/
//
// Imports btc-prose.js, which pulls in the Glossia WASM bundle, so the suite
// skips until web/glossia.js is built (same convention as the coinbase
// notation suite).

import test from 'node:test';
import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';

const engineBuilt = await access(new URL('../web/glossia.js', import.meta.url)).then(() => true, () => false);
const skip = engineBuilt ? false : 'web/glossia.js not built (see build_web.sh)';

test('an own-unit figure is a valuation: ≈, money decimals, the unit as spelled', { skip }, async () => {
  const { formatOwnAmount } = await import('../web/btc-prose.js');
  const usd = { label: 'USD', perBtc: 100000 };
  // 1.23456789 ₿ at 100,000 per ₿ — two decimals, comma-grouped, ≈-marked.
  assert.equal(formatOwnAmount(123456789, usd), '≈ 123,456.79 USD');
  // The label prints as the reader spelled it, whatever they named.
  assert.equal(formatOwnAmount(123456789, { label: 'slices', perBtc: 0.0002 }), '≈ 0.00025 slices');
});

test('small amounts survive the rounding: dust never prints as ≈ 0.00', { skip }, async () => {
  const { formatOwnAmount } = await import('../web/btc-prose.js');
  const usd = { label: 'USD', perBtc: 100000 };
  // One satoshi at 100,000 per ₿ is a thousandth — the decimals stretch to say so.
  assert.equal(formatOwnAmount(1, usd), '≈ 0.001 USD');
  assert.equal(formatOwnAmount(546, usd), '≈ 0.55 USD');
  // Exactly zero is exact at any rate, so it alone drops the ≈.
  assert.equal(formatOwnAmount(0, usd), '0 USD');
});

test("without a stored unit, 'own' falls back to the record's ₿", { skip }, async () => {
  const { formatAmountAs, amountUnit } = await import('../web/btc-prose.js');
  assert.equal(formatAmountAs(123456789, 'own'), '1.23456789 ₿');
  // …and the chosen unit can never read 'own' with nothing behind it.
  assert.notEqual(amountUnit(), 'own');
});
