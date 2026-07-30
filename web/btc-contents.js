// SPDX-License-Identifier: MIT OR Apache-2.0
//
// btc-contents.js — the machinery behind the Bitcoin Book's table of contents:
// the id/reference helpers and deep links the contents pages share. Used by
// bitcoin-book.html (which names a curated section beneath its § number) and
// bitcoin-contents.html (the table-of-contents page).
//
// The curated entries themselves -- which blocks and transactions are notable
// and what they are called -- are editorial work and live in notables.yaml,
// with their commentary in commentary/*.md, under CC BY 4.0; the loader for
// them is btc-notables.js and is re-exported here so importers see one module.
// See the README's License section.
//
// The entries arrive asynchronously, being read from a file rather than baked
// into a script: a page awaits loadNotables() once before its first render, and
// reads notables() synchronously from then on.

import { reference } from './btc-citation.js';

export { loadNotables, notables } from './btc-notables.js';

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
// book resolves as a block first and a transaction second. A `page` of 'book' or
// 'volume' opens that leaf (?page=…) instead of a chapter, and an `out` -- which
// only a §section.output reference gives an entry -- lands on that output within
// the section, exactly as a citation carrying one does.
export function entryHref(id, index, page, out) {
  const isBlock = isBlockId(id) || isRelativeBlockId(id);
  const q = isBlock ? `block=${id}` : `txid=${id}`;
  if (isBlock && (page === 'book' || page === 'volume')) return `bitcoin-book.html?${q}&page=${page}`;
  const idx = isBlock && index != null ? `&index=${index}` : '';
  const o = out != null ? `&out=${out}` : '';
  return `bitcoin-book.html?${q}${idx}${o}`;
}
