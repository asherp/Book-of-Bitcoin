// SPDX-License-Identifier: MIT OR Apache-2.0
//
// btc-price.js — the day's market price of a bitcoin, asked of a source the
// reader chose. The chain knows no dollars: a price is a market's valuation,
// true of one venue at one moment, so the book never bundles or asserts one.
// What it offers instead is the asking — the reader picks whose record of the
// market to consult (the settings' price-source select), the answer is keyed
// to the day of the block being read, and everything printed with it wears ≈
// and names its source in the hover (see btc-prose.js's amount notation).
//
// Each source answers one question — what did a bitcoin trade at, in USD, on
// this UTC day — and answers null where its record has nothing: days before
// the source's series begins (before mid-2010 no market existed at all), or a
// source that cannot be reached. Null renders as the record's own ₿, never as
// a guessed figure.
//
// Answers cache in localStorage by source and day. A day's close does not
// change after the fact, so the cache never expires — which also keeps a
// re-read offline-capable and spares the sources repeat questions. Only
// "no answer for this day" from a reachable source is cached (that too is
// permanent); a failed fetch is not, so a flaky network heals on the next ask.

// A unix time -> its UTC calendar day, 'YYYY-MM-DD' — the key a daily series
// answers by. (Block timestamps drift hours from wall time; at day precision
// that drift is the valuation's problem, not ours to correct.)
export const utcDateOf = (ts) => new Date(ts * 1000).toISOString().slice(0, 10);

// ─── the figures ───────────────────────────────────────────────────────
// A satoshi amount at a rate: { label, perBtc }. ≈ because the figure is
// rounded, and more to the point because it is a valuation. Two decimals in
// the money manner, stretched only as far as keeps a small amount from
// rounding to nothing — a dust output should never print as ≈ 0.00. Zero
// alone drops the ≈: nothing is exact at any rate. Number arithmetic is
// fine here — the record stays exact wherever the caller keeps it (a hover,
// a neighbouring column); this figure is a reading, read at rate precision.
// Lives here rather than btc-prose.js so the ledger surfaces can dress a
// valuation without dragging in the WASM engine the prose module rides on;
// btc-prose re-exports it (as formatOwnAmount) for the book.
export function formatValuation(sats, { label, perBtc }) {
  const v = Number(sats) * perBtc / 1e8;
  if (v === 0) return `0 ${label}`;
  const digits = v < 0.01 ? Math.min(10, 1 - Math.floor(Math.log10(v))) : 2;
  const figure = v.toLocaleString('en-US', { minimumFractionDigits: Math.min(digits, 2), maximumFractionDigits: digits });
  return `≈ ${figure} ${label}`;
}

// The same, signed, for a ledger's net movements (btc-index.js's
// formatNetBtc manner): what a chapter paid an address (+) or spent from
// it (−), valued at a day's rate.
export function formatNetValuation(sats, unit) {
  const n = Number(sats);
  if (!n) return formatValuation(0, unit);
  return formatValuation(Math.abs(n), unit).replace('≈ ', n < 0 ? '≈ −' : '≈ +');
}

// Whether the reader reads amounts in USD — btc-prose.js's amount-notation
// choice, mirrored here by its bare key so a ledger page can follow the
// book's setting without importing the prose module. The key and its
// values are btc-prose.js's to define; this is a read-only mirror of one
// of them.
export function usdChosen() {
  try { return localStorage.getItem('glossia-btc-amount-unit') === 'usd'; } catch { return false; }
}

// ─── the sources ───────────────────────────────────────────────────────
// Each parses its own wire shape into { perBtc, date } or null. The parsers
// are pure and exported for the test suite; the fetchers around them are not.

// mempool.space /api/v1/historical-price?currency=USD&timestamp=N — answers
// the price point nearest the asked time, from their aggregate of several
// exchanges. Days before their series answer USD: 0, which is their spelling
// of "no price"; the returned time names the day the answer is actually of,
// which for sparse early data can sit a day or two from the day asked.
export function parseMempoolPrice(json) {
  const p = json && json.prices && json.prices[0];
  if (!p || !Number.isFinite(p.USD) || p.USD <= 0) return null;
  return { perBtc: p.USD, date: utcDateOf(p.time) };
}

// Bitstamp /api/v2/ohlc/btcusd/?step=86400&limit=1&start=N — the exchange's
// own daily candle, from their first trade in August 2011. Asked for a day
// before their record, they answer their earliest candle instead, so an
// answer is only an answer when it is of the day asked.
export function parseBitstampDay(json, dayStart) {
  const c = json && json.data && json.data.ohlc && json.data.ohlc[0];
  if (!c || String(c.timestamp) !== String(dayStart)) return null;
  const close = Number(c.close);
  if (!Number.isFinite(close) || close <= 0) return null;
  return { perBtc: close, date: utcDateOf(dayStart) };
}

export const PRICE_SOURCES = [
  {
    id: 'mempool',
    label: 'mempool.space',
    href: 'https://mempool.space',
    fetchDay: async (ts) => {
      const res = await fetch(`https://mempool.space/api/v1/historical-price?currency=USD&timestamp=${ts}`);
      if (!res.ok) throw new Error(`historical-price ${res.status}`);
      return parseMempoolPrice(await res.json());
    },
  },
  {
    id: 'bitstamp',
    label: 'Bitstamp',
    href: 'https://www.bitstamp.net',
    fetchDay: async (ts) => {
      const dayStart = ts - (ts % 86400);
      const res = await fetch(`https://www.bitstamp.net/api/v2/ohlc/btcusd/?step=86400&limit=1&start=${dayStart}`);
      if (!res.ok) throw new Error(`ohlc ${res.status}`);
      return parseBitstampDay(await res.json(), dayStart);
    },
  },
];

// ─── the reader's choice of source ─────────────────────────────────────
// Persisted like the amount notation itself: absent key = the first source.
const PRICE_SOURCE_KEY = 'glossia-btc-price-source';
export function priceSource() {
  try {
    const id = localStorage.getItem(PRICE_SOURCE_KEY);
    return PRICE_SOURCES.find((s) => s.id === id) || PRICE_SOURCES[0];
  } catch { return PRICE_SOURCES[0]; }
}
export function setPriceSource(id) {
  try {
    if (PRICE_SOURCES.some((s) => s.id === id) && id !== PRICE_SOURCES[0].id) {
      localStorage.setItem(PRICE_SOURCE_KEY, id);
    } else localStorage.removeItem(PRICE_SOURCE_KEY);
  } catch { /* storage unavailable: the choice just doesn't persist */ }
}

// ─── the day cache ─────────────────────────────────────────────────────
// { 'mempool:2013-11-30': { perBtc, date } | 0, ... } — 0 spelling a
// reachable source's permanent "no price for this day". Kept small: past a
// generous cap the whole map resets rather than curating an eviction order
// (a re-ask is one cheap request).
const PRICE_CACHE_KEY = 'glossia-btc-usd-prices';
const PRICE_CACHE_CAP = 2000;
function readCache() {
  try { return JSON.parse(localStorage.getItem(PRICE_CACHE_KEY)) || {}; }
  catch { return {}; }
}
function writeCache(cache) {
  try {
    if (Object.keys(cache).length > PRICE_CACHE_CAP) cache = {};
    localStorage.setItem(PRICE_CACHE_KEY, JSON.stringify(cache));
  } catch { /* storage unavailable or full: answers just don't persist */ }
}

// ─── the one question ──────────────────────────────────────────────────
// The USD price of a bitcoin on the UTC day of a unix time, per the chosen
// source: { perBtc, date, source, href } — date being the day the source's
// answer is actually of — or null where its record has nothing. Throws
// nothing: an unreachable source is also null, just not remembered as one.
// Single-flight per source and day (btc-index.js's citePlaceInflight
// discipline): a screenful of ledger rows sharing a day must share one
// question, not race duplicates before the answer banks.
const usdInflight = new Map();
export function usdOn(ts) {
  const src = priceSource();
  const key = `${src.id}:${utcDateOf(ts)}`;
  const cache = readCache();
  if (key in cache) {
    const hit = cache[key];
    return Promise.resolve(hit ? { ...hit, source: src.label, href: src.href } : null);
  }
  if (!usdInflight.has(key)) {
    usdInflight.set(key, (async () => {
      let answer;
      try { answer = await src.fetchDay(ts); }
      catch { return null; }                  // unreachable: null, uncached
      const fresh = readCache();              // re-read: another day may have banked meanwhile
      fresh[key] = answer || 0;
      writeCache(fresh);
      return answer ? { ...answer, source: src.label, href: src.href } : null;
    })().finally(() => usdInflight.delete(key)));
  }
  return usdInflight.get(key);
}
