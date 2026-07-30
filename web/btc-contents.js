// SPDX-License-Identifier: MIT OR Apache-2.0
//
// btc-contents.js — the machinery behind the Bitcoin Book's table of contents:
// the id/reference helpers and deep links the contents pages share. Used by
// bitcoin-book.html (which names a curated section beneath its § number) and
// bitcoin-contents.html (the table-of-contents page).
//
// The curated entries themselves -- which blocks and transactions are notable
// and what they are called -- are editorial work and live in
// btc-contents-data.js under CC BY 4.0; they are re-exported here so importers
// see one module. See the README's License section.

import { reference } from './btc-citation.js';

export { NOTABLE } from './btc-contents-data.js';

// A bare non-negative integer is an absolute block height. A negative integer is
// a height relative to the chain tip (-1 = latest block), resolved online.
export const isBlockId = (id) => /^[0-9]+$/.test(id);
export const isRelativeBlockId = (id) => /^-[0-9]+$/.test(id);

// The expected wait for k more blocks, at one block per ten minutes on
// average, as compact text ("≈ 40 min", "≈ 6 h 30 min", "≈ 2 d 4 h").
// Block arrivals are memoryless, so the clock starts at "now" no matter how
// long the current block has been brewing -- and an estimate k blocks out
// carries a spread of about ±10·√k minutes, so deeper figures are read as
// order-of-magnitude, not appointments. Shared by the table of contents
// (projected chapters) and the book (the not-yet-mined chapter's message).
export function blocksEta(k) {
  const mins = k * 10;
  if (mins < 60) return `≈ ${mins} min`;
  const h = Math.floor(mins / 60), m = mins % 60;
  if (h < 24) return m ? `≈ ${h} h ${m} min` : `≈ ${h} h`;
  const d = Math.floor(h / 24), hr = h % 24;
  return hr ? `≈ ${d} d ${hr} h` : `≈ ${d} d`;
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

// A deep link into the book for a contents entry. An absolute or relative block
// id opens as ?block= (with an optional ?index= selecting a transaction within
// the block); a 64-hex value (block hash or txid) opens as ?txid=, which the
// book resolves as a block first and a transaction second. A `page: 'book'`
// entry opens its book's own leaf (?page=book) instead of a chapter.
export function entryHref(id, index, page, vout = null) {
  const isBlock = isBlockId(id) || isRelativeBlockId(id);
  const q = isBlock ? `block=${id}` : `txid=${id}`;
  if (isBlock && page === 'book') return `bitcoin-book.html?${q}&page=book`;
  const idx = isBlock && index != null ? `&index=${index}` : '';
  // A bookmarked output opens the book at that output, not just its section.
  const out = vout == null ? '' : `&out=${vout}`;
  return `bitcoin-book.html?${q}${idx}${out}`;
}
