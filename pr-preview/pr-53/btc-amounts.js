// SPDX-License-Identifier: MIT OR Apache-2.0
//
// btc-amounts.js — how the book prints value: the record's notations, the
// valuations beside them, and the reader's one choice among them all.
//
// Split out of btc-prose.js so every surface can dress an amount: the prose
// module rides the Glossia WASM engine, and the ledger pages deliberately
// load without it (see btc-index.js's header). This module is dependency-
// free on purpose; btc-prose re-exports everything here, so the book page
// keeps its one import and nothing upstream moved.
//
// How the reader prints an amount is a choice, like the prose language:
//   'btc'   1.23456789 ₿      bitcoin, the ₿ sign trailing (formatBtc)
//   'sats'  123·456·789 sats  satoshis, the book's middle-dot grouping
//   'raw'   123456789         the bare satoshi integer — no marker, no separator
//   'usd'   123,456.79 USD    the day's market price, per a source the reader chose
//   'own'   123,456.79 USD    the reader's own unit, at a rate the reader set
// The first three are renderings of the record: one integer, dressed three
// ways, each recoverable from the others. The last two are not, and the
// record offers no help drawing the line — the chain knows no dollars, and
// strictly no bitcoins either: the field is an integer, ₿'s decimal point a
// convention, and even "one sat is one sat" is a reading (freshly minted
// coins have traded at a premium, ordinal sats at a fancy). So the book
// supplies no rate of its own. 'usd' asks a market's record, from a source
// the reader selected (btc-price.js), at the day of the block being read —
// the page sets that rate here (setDayPrice) before it prints, and where the
// source's record has nothing the figure falls back to the record's ₿.
// 'own' is a unit the reader names and prices themself. Either way the
// figure is set in the annotation's dress, and the hover keeps the on-chain
// amount and the rate's author — a market's valuation or the reader's,
// never the book's.
// Each choice persists in localStorage under its own key and is read at
// format time, so a page re-render is all a switch needs. 'btc' is the
// default and is stored as an absent key, so a reader who never chose
// reads the book as it has always been set.

// A decimal integer string with a middle-dot every three digits (an output
// amount, in satoshis): "407621551" -> "407·621·551". Operates on the string to
// avoid any precision loss on large values.
export function groupDigits(s) {
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, '·');
}

// A satoshi amount -> its value in bitcoin, with the ₿ sign trailing the figure
// and exact to the satoshi. English number formatting: the whole-bitcoin part is
// comma-grouped, and the fraction is always the full eight decimal places, so a
// right-aligned column of amounts aligns on the point. 50 BTC reads 50.00000000 ₿,
// a lone satoshi 0.00000001 ₿. An exactly-zero amount (e.g. an OP_RETURN data
// carrier) reads as a bare 0 ₿ rather than a row of zeros. BigInt keeps large sat
// counts exact.
export function formatBtc(sats) {
  const s = BigInt(sats);
  if (s === 0n) return '0 ₿';
  const whole = (s / 100000000n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const frac = (s % 100000000n).toString().padStart(8, '0');
  return `${whole}.${frac} ₿`;
}

const AMOUNT_UNIT_KEY = 'glossia-btc-amount-unit';
const OWN_UNIT_KEY = 'glossia-btc-own-unit';

// The reader's own unit, where one is set: { label, perBtc } — the unit's
// name as the reader spelled it, and their price of one ₿ in it. Null until
// the reader defines one, and null again on anything malformed, so callers
// can trust what they get.
export function ownUnit() {
  try {
    const o = JSON.parse(localStorage.getItem(OWN_UNIT_KEY));
    if (o && typeof o.label === 'string' && o.label.trim()
        && Number.isFinite(o.perBtc) && o.perBtc > 0) {
      return { label: o.label.trim(), perBtc: o.perBtc };
    }
  } catch { /* unset, malformed, or storage unavailable */ }
  return null;
}
export function setOwnUnit(u) {
  try {
    if (u) localStorage.setItem(OWN_UNIT_KEY, JSON.stringify({ label: u.label, perBtc: u.perBtc }));
    else localStorage.removeItem(OWN_UNIT_KEY);
  } catch { /* storage unavailable: the unit just doesn't persist */ }
}

export function amountUnit() {
  try {
    const v = localStorage.getItem(AMOUNT_UNIT_KEY);
    if (v === 'own') return ownUnit() ? 'own' : 'btc';
    return v === 'sats' || v === 'raw' || v === 'usd' ? v : 'btc';
  } catch { return 'btc'; }
}
export function setAmountUnit(u) {
  try {
    if (u === 'sats' || u === 'raw' || u === 'usd' || u === 'own') localStorage.setItem(AMOUNT_UNIT_KEY, u);
    else localStorage.removeItem(AMOUNT_UNIT_KEY);
  } catch { /* storage unavailable: the choice just doesn't persist */ }
}

// The day's price for the page in hand: { perBtc, date, source, href } from
// btc-price.js's usdOn, or null where no source answered. The page sets it
// for the block being read before printing and clears it after; holding it
// here keeps formatAmount a one-argument call at every site while the rate
// stays one page-wide fact with one owner. Null prints as ₿ — the record —
// never as a stale or guessed figure. (The Ledger does not use this: its
// entries each own a date, so it prices per row — see btc-index.js.)
let DAY_PRICE = null;
export function setDayPrice(p) { DAY_PRICE = p; }
export function dayPrice() { return DAY_PRICE; }

// A satoshi amount at a rate: { label, perBtc }. Two decimals in the money
// manner, stretched only as far as keeps a small amount from rounding to
// nothing — a dust output should never print as 0.00. What marks the figure
// as a valuation is where its callers set it (the annotation's dress) and
// what its hovers disclose, not a prefix on the figure itself. Number
// arithmetic is fine here — the record stays exact wherever the caller
// keeps it (a hover, a neighbouring column); this figure is a reading,
// read at rate precision.
export function formatValuation(sats, { label, perBtc }) {
  const v = Number(sats) * perBtc / 1e8;
  if (v === 0) return `0 ${label}`;
  const digits = v < 0.01 ? Math.min(10, 1 - Math.floor(Math.log10(v))) : 2;
  const figure = v.toLocaleString('en-US', { minimumFractionDigits: Math.min(digits, 2), maximumFractionDigits: digits });
  return `${figure} ${label}`;
}

// A satoshi amount in a named notation — the settings rows print one sample
// amount in each, so the choice shows itself. 'usd' with no day price and
// 'own' without a stored unit both fall back to the record's ₿, like
// everything else unrecognised.
export function formatAmountAs(sats, unit) {
  if (unit === 'sats') return `${groupDigits(BigInt(sats).toString())} sats`;
  if (unit === 'raw') return BigInt(sats).toString();
  if (unit === 'usd' && DAY_PRICE) return formatValuation(sats, { label: 'USD', perBtc: DAY_PRICE.perBtc });
  if (unit === 'own') {
    const o = ownUnit();
    if (o) return formatValuation(sats, o);
  }
  return formatBtc(sats);
}
// …and in the notation currently chosen: the one call every amount the
// reader page prints goes through.
export const formatAmount = (sats) => formatAmountAs(sats, amountUnit());
