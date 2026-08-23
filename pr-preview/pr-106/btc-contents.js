// SPDX-License-Identifier: MIT OR Apache-2.0
//
// btc-contents.js — the machinery behind the Book of Bitcoin's table of
// contents: the id/reference helpers and deep links the contents pages share. Used by
// bitcoin-book.html (which names a curated section beneath its § number) and
// bitcoin-contents.html (the table-of-contents page).
//
// The curated entries themselves -- which blocks and transactions are notable,
// what they are called, and what the appendices gather after them -- are
// editorial work and live in notables.yaml and appendix.yaml, with their
// commentary in commentary/*.md, all CC BY 4.0; the loader for them is
// btc-notables.js and is re-exported here so importers see one module. See the
// README's License section.
//
// They arrive asynchronously, being read from files rather than baked into a
// script: a page awaits loadNotables() once before its first render, and reads
// notables() / places() / appendix() synchronously from then on.

import { reference } from './btc-citation.js';
import { looksLikeAddress } from './btc-lookup.js';

export { loadNotables, notables, places, placeTitle, placeFiling, appendix } from './btc-notables.js';

// A bare non-negative integer is an absolute block height. A negative integer is
// a height relative to the chain tip (-1 = latest block), resolved online.
export const isBlockId = (id) => /^[0-9]+$/.test(id);
export const isRelativeBlockId = (id) => /^-[0-9]+$/.test(id);

// The expected wait for k more blocks, at one block per ten minutes on
// average, as compact text ("40 min", "6 h 30 min", "2 d 4 h").
// Block arrivals are memoryless, so the clock starts at "now" no matter how
// long the current block has been brewing -- and an estimate k blocks out
// carries a spread of about ±10·√k minutes, so deeper figures are read as
// order-of-magnitude, not appointments.
//
// The duration only; how it is hedged belongs to the caller, which knows what
// it is setting it beside -- "ETA 40 min" on a draft chapter's head, "come
// back in about 40 min" in a sentence. A figure that carried its own ≈ would
// double the hedge wherever the surrounding words already said it.
export function blocksEta(k) {
  const mins = k * 10;
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60), m = mins % 60;
  if (h < 24) return m ? `${h} h ${m} min` : `${h} h`;
  const d = Math.floor(h / 24), hr = h % 24;
  return hr ? `${d} d ${hr} h` : `${d} d`;
}

// The offline reference for a block id (volume·book·chapter). A transaction id
// has no offline height, so it returns '' and must be resolved at read time.
export function blockRef(id) {
  return isBlockId(id) ? reference(Number(id)) : '';
}

// Format a resolved citation -- a block height and the transaction's index
// within it -- as a full volume·book·chapter·§section reference.
export function refFromProof(height, pos) {
  return reference(height) + (pos != null ? ` §${pos + 1}` : '');
}

// A deep link for a contents entry. An address opens its ledger; an absolute or
// relative block id opens as ?block= (with an optional ?index= selecting a
// transaction within the block); a 64-hex value (block hash or txid) opens as
// ?txid=, which the book resolves as a block first and a transaction second. A
// `page` of 'book' or 'volume' opens that leaf (?page=…) instead of a chapter,
// and an output -- a bookmarked one, or the one a §section.output reference
// names -- lands on that output within the section rather than on the section
// alone, exactly as a citation carrying one does.
export function entryHref(id, index, page, vout = null, vin = null) {
  // An address is a name, not a place: it has no chapter to open, and reads in
  // the Ledger -- the same hand-off the search box makes.
  if (looksLikeAddress(id)) return `bitcoin-ledger.html?address=${id}`;
  const isBlock = isBlockId(id) || isRelativeBlockId(id);
  const q = isBlock ? `block=${id}` : `txid=${id}`;
  if (isBlock && (page === 'book' || page === 'volume')) return `bitcoin-book.html?${q}&page=${page}`;
  const idx = isBlock && index != null ? `&index=${index}` : '';
  const out = vout == null ? '' : `&out=${vout}`;
  // A witness bookmark lands on its footnote: &wit names the input whose
  // witness leads the page.
  const wit = vin == null ? '' : `&wit=${vin}`;
  return `bitcoin-book.html?${q}${idx}${out}${wit}`;
}
