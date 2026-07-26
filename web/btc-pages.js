// btc-pages.js — the book's page numbers. One transaction is one page: page N
// is the chain's Nth transaction in block order, counted from the genesis
// coinbase (page 1). A section's folio is therefore
//
//   page = anchor(height) + §section
//
// where anchor(height) is the running count of transactions in every block
// before `height`. Positions are what's counted, not distinct txids: the two
// coinbases BIP30 grandfathered (see btc-contents.js) were each confirmed
// twice, so each owns two pages and the chain's page count runs exactly two
// past its distinct-txid count.
//
// Esplora has no running-total endpoint, so a fresh anchor comes from a census
// endpoint that can sum per-block transaction counts over a height range in
// one call — Blockchair's aggregation API (`?a=sum(transaction_count)`). Any
// endpoint answering "total transactions in blocks 0..h-1" can stand in. An
// anchor over buried blocks is immutable, so each height is asked of the
// census at most once per device — banked in the archive ('pages',
// btc-store.js) — and neighbouring anchors are derived for free from the
// block tx_counts the reading pages already fetch (bankAnchor):
//
//   anchor(h+1) = anchor(h) + tx_count(h)
//   anchor(h-1) = anchor(h) - tx_count(h-1)
//
// so reading onward (or backward) from an anchored chapter never re-asks.
// When no census endpoint answers, the folio simply stays absent — page
// numbers are an annotation over the chain, never a gate on reading it.

import { storeGet, storePut } from './btc-store.js';

const CENSUS_MIRRORS = ['https://api.blockchair.com/bitcoin/blocks'];

const anchorCache = new Map();   // height -> Promise<number> (in flight or settled)
const resolvedAnchors = new Map();   // height -> number (settled only; peekAnchor's view)

async function fetchAnchor(height) {
  for (const base of CENSUS_MIRRORS) {
    try {
      const res = await fetch(`${base}?a=sum(transaction_count)&q=id(0..${height - 1})`);
      if (!res.ok) continue;
      const j = await res.json();
      const row = Array.isArray(j?.data) ? j.data[0] : null;
      const v = row == null ? NaN : Number(row['sum(transaction_count)'] ?? Object.values(row)[0]);
      // Every block carries at least its coinbase, so a sane sum over `height`
      // blocks is never below `height`. Anything else is a malformed answer.
      if (Number.isFinite(v) && v >= height) return v;
    } catch { /* try the next census mirror */ }
  }
  return null;
}

// The running count of transactions in blocks 0..height-1. `final` marks the
// height as safely buried (six confirmations or more), letting the answer be
// banked in the archive; a near-tip anchor is held in memory only, the same
// six-confirmation rule the height→hash archive keeps. Rejects when no census
// endpoint answers, so a caller can leave the folio blank and try again on the
// next visit.
export function pageAnchor(height, final = false) {
  if (height <= 0) return Promise.resolve(0);
  if (!anchorCache.has(height)) {
    anchorCache.set(height, (async () => {
      const kept = await storeGet('pages', height);   // banked anchors are final by construction
      if (kept != null) { resolvedAnchors.set(height, kept); return kept; }
      const v = await fetchAnchor(height);
      if (v == null) throw new Error('No census endpoint answered.');
      resolvedAnchors.set(height, v);
      if (final) storePut('pages', height, v);
      return v;
    })().catch((e) => { anchorCache.delete(height); throw e; }));
  }
  return anchorCache.get(height);
}

// Bank an anchor derived by neighbour arithmetic rather than the census. Same
// `final` rule as pageAnchor: only a safely-buried derivation reaches the
// archive. A height already known (in flight or settled) is left alone.
export function bankAnchor(height, anchor, final = false) {
  if (!Number.isFinite(anchor) || height <= 0 || anchorCache.has(height)) return;
  anchorCache.set(height, Promise.resolve(anchor));
  resolvedAnchors.set(height, anchor);
  if (final) storePut('pages', height, anchor);
}

// The already-settled anchor for a height, or null — never triggers a fetch.
// Lets nav-time code derive a neighbour's anchor only when this block's is
// in hand.
export const peekAnchor = (height) => (height <= 0 ? 0 : (resolvedAnchors.get(height) ?? null));

// Folios print with thousands separators, the way a billion-page book must.
export const formatPage = (n) => n.toLocaleString('en-US');
