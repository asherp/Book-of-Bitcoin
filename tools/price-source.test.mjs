// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/price-source.test.mjs — the price sources' parsers: each source's
// wire shape read into { perBtc, date } or, just as deliberately, into null.
// A price is a market's valuation, so the rule under test is that no shape a
// source actually sends can ever be mistaken for an answer it did not give —
// a pre-market day, a clamped early candle, a malformed body all read as
// "no price", never as a figure.
//
//   node --test tools/
//
// The payloads are recordings of the real endpoints (August 2026), so the
// parsers are tested against what the sources say, not what their docs say.
// btc-price.js imports nothing heavy, so this suite runs on a bare checkout.

import test from 'node:test';
import assert from 'node:assert/strict';

import { parseMempoolPrice, parseBitstampDay, utcDateOf, PRICE_SOURCES } from '../web/btc-price.js';

test('a unix time keys the UTC day a daily series answers by', () => {
  assert.equal(utcDateOf(1385769600), '2013-11-30');       // midnight exactly
  assert.equal(utcDateOf(1385769600 + 86399), '2013-11-30'); // a second before the next
  assert.equal(utcDateOf(1231006505), '2009-01-03');       // the genesis block's stamp
});

test("mempool.space: an answer names the day it is actually of", () => {
  // As recorded: asked for 2013-11-30, their nearest point sits on 11-28.
  const wire = { prices: [{ time: 1385596800, USD: 1079.9 }], exchangeRates: { USDEUR: 0.86 } };
  assert.deepEqual(parseMempoolPrice(wire), { perBtc: 1079.9, date: '2013-11-28' });
});

test("mempool.space: USD 0 is their spelling of a pre-market day — null, not free coins", () => {
  // As recorded for the pizza-day ask: time clamped to their series start, USD 0.
  const wire = { prices: [{ time: 1279497600, USD: 0 }], exchangeRates: { USDEUR: 0.86 } };
  assert.equal(parseMempoolPrice(wire), null);
  assert.equal(parseMempoolPrice({ prices: [] }), null);
  assert.equal(parseMempoolPrice({}), null);
  assert.equal(parseMempoolPrice(null), null);
  assert.equal(parseMempoolPrice({ prices: [{ time: 1, USD: 'high' }] }), null);
});

test("Bitstamp: a daily candle answers with its close, only for the day asked", () => {
  // As recorded for 2013-11-30: their candle timestamps are strings.
  const wire = { data: { pair: 'BTC/USD', ohlc: [{ timestamp: '1385769600', open: '1131.99', close: '1119.52' }] } };
  assert.deepEqual(parseBitstampDay(wire, 1385769600), { perBtc: 1119.52, date: '2013-11-30' });
});

test("Bitstamp: asked before their record, the earliest candle comes back — not the day asked, so null", () => {
  const earliest = { data: { ohlc: [{ timestamp: '1313625600', close: '10.90' }] } };
  assert.equal(parseBitstampDay(earliest, 1274486400), null);   // pizza day predates the exchange
  assert.equal(parseBitstampDay({ data: { ohlc: [] } }, 1385769600), null);
  assert.equal(parseBitstampDay({}, 1385769600), null);
  assert.equal(parseBitstampDay({ data: { ohlc: [{ timestamp: '1385769600', close: '0' }] } }, 1385769600), null);
});

test('every source carries what the hover and the select need', () => {
  for (const s of PRICE_SOURCES) {
    assert.ok(s.id && s.label && s.href, `${s.id || '?'} is fully named`);
    assert.equal(typeof s.fetchDay, 'function');
  }
});
