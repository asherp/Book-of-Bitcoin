// SPDX-License-Identifier: MIT OR Apache-2.0
//
// btc-chaintime.js — roughly when a block of a given height was mined, and
// whether a number found beside that height could be a clock reading from the
// same day.
//
// This exists for one reading. A coinbase from BIP34 on opens with the block's
// own height, and the pools built on btccom's server write the moment the
// template was assembled directly after it -- so the second field is often a
// timestamp rather than the counter the book used to call it. Nothing in the
// bytes says which. What decides it is whether the number agrees with the
// height beside it: a clock lands on the block's own day, a counter lands
// anywhere in four billion.
//
// So: no chain state, no header, no network. The coinbase states its height,
// and the height dates itself -- the whole test reads out of the same hundred
// bytes the mark will be printed on.
//
// The estimate anchors on the halvings, whose heights and times are fixed and
// public, and interpolates between them; past the last one it walks forward at
// the ten minutes a retarget aims for. Between anchors the error is days, not
// months: the epochs since BIP34 activated land within a day or two of the
// real block, the early ones (hashrate doubling every few months) within about
// six weeks. PLAUSIBLE_WINDOW is set well past the worst of that.

// [height, the block's nTime]. Every entry a halving, so the table needs a new
// line roughly once every four years and never a correction.
export const HALVING_ANCHORS = [
  [0, 1231006505],        // 2009-01-03 — genesis
  [210000, 1354116278],   // 2012-11-28
  [420000, 1468082773],   // 2016-07-09
  [630000, 1589225023],   // 2020-05-11
  [840000, 1713571767],   // 2024-04-20
];

export const BLOCK_INTERVAL = 600;        // the cadence difficulty retargets toward

// How far from the estimate a number may sit and still be read as a clock.
// Three months: an order of magnitude past the estimate's own error, so a real
// timestamp is never turned away, at the cost of admitting a random four-byte
// counter about four times in a thousand. The asymmetry is deliberate -- the
// book would rather print a counter's value under a date it cannot support
// than deny a clock that is plainly a clock, since both readings write the
// same bytes back and only the hover text differs.
export const PLAUSIBLE_WINDOW = 90 * 86400;

// A height -> about when it was mined (unix seconds).
export function expectedBlockTime(height) {
  const h = Math.max(0, Math.floor(Number(height) || 0));
  for (let i = 1; i < HALVING_ANCHORS.length; i++) {
    const [h0, t0] = HALVING_ANCHORS[i - 1];
    const [h1, t1] = HALVING_ANCHORS[i];
    if (h <= h1) return Math.round(t0 + ((h - h0) / (h1 - h0)) * (t1 - t0));
  }
  const [hLast, tLast] = HALVING_ANCHORS[HALVING_ANCHORS.length - 1];
  return tLast + (h - hLast) * BLOCK_INTERVAL;
}

// Could `unix` be a clock reading taken while block `height` was being mined?
// A block's own nTime is allowed two hours ahead of the network's by consensus
// and a template is built before the block it goes into, so the window is
// symmetric and generous either way.
export function plausibleBlockTime(unix, height, window = PLAUSIBLE_WINDOW) {
  if (!Number.isFinite(unix) || unix < HALVING_ANCHORS[0][1]) return false;
  return Math.abs(unix - expectedBlockTime(height)) <= window;
}

// The form a timestamp takes on the page: the same UTC date and minute the
// chapter head prints for the block's own nTime (see timestampInfo in
// btc-prose.js). One kind of thing, one form -- a reader comparing the two
// numbers should not have to convert between notations to do it.
export function utcMinute(unix) {
  return new Date(unix * 1000).toISOString().slice(0, 16).replace('T', ' ');
}
