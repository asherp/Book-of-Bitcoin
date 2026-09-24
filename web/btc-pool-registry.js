// SPDX-License-Identifier: MIT OR Apache-2.0
//
// btc-pool-registry.js — naming a block's pool the way mempool.space does,
// from mempool's own registry (btc-mempool-pools.js, vendored by
// tools/fetch-mining-pools.mjs), without asking mempool.
//
// This is a second reading beside the book's own table (btc-pools.js), and a
// different kind of thing. The book's table says which bytes of a coinbase a
// pool wrote, so the page can quote them to their exact extent. The registry
// says which pool mempool credits a block to -- by the addresses a pool is
// known to be paid at as well as by its tags -- and it is mempool's claim, to
// be credited to mempool wherever the book prints it.
//
// The rule is mempool's matchBlockMiner (backend/src/api/pools-parser.ts),
// kept step for step so the two cannot disagree about a block: the coinbase
// scriptSig read as one byte per character; then, pool by pool in the
// registry's order, a pool whose addresses include any address the coinbase
// pays, else one whose tags -- each a case-insensitive regular expression --
// match that text; the first pool to answer is the pool. Nothing answering is
// null, which mempool calls Unknown.

import { MEMPOOL_POOLS, MEMPOOL_POOLS_SOURCE } from './btc-mempool-pools.js';

export { MEMPOOL_POOLS, MEMPOOL_POOLS_SOURCE };

// A scriptSig as mempool reads it for tags: each byte a character (latin1),
// printable or not.
export function asciiOf(hex) {
  let text = '';
  for (let i = 0; i + 1 < hex.length; i += 2) text += String.fromCharCode(parseInt(hex.slice(i, i + 2), 16));
  return text;
}

// Each pool's tags compiled once, per registry.
const compiled = new WeakMap();
function tagsOf(pools) {
  if (!compiled.has(pools)) {
    compiled.set(pools, pools.map((p) => p.tags.map((tag) => {
      try { return new RegExp(tag, 'i'); } catch { return null; }   // one mempool could not use either
    }).filter(Boolean)));
  }
  return compiled.get(pools);
}

// The pool mempool credits a coinbase to, or null.
//
//   scriptSig   the coinbase input's scriptSig, hex
//   addresses   every address the coinbase pays, spelled for the chain it is on
//
// Returns { id, name, link, by, matched }: `by` says whether an address or a
// tag decided it, and `matched` is the address, or the text the tag matched.
export function registryPoolOf({ scriptSig = '', addresses = [] } = {}, pools = MEMPOOL_POOLS) {
  const text = asciiOf(scriptSig);
  const tags = tagsOf(pools);
  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];
    const paid = addresses.find((a) => pool.addresses.includes(a));
    if (paid) return { id: pool.id, name: pool.name, link: pool.link, by: 'address', matched: paid };
    for (const re of tags[i]) {
      const m = text.match(re);
      if (m) return { id: pool.id, name: pool.name, link: pool.link, by: 'tag', matched: m[0] };
    }
  }
  return null;
}

// Which of a coinbase's outputs is the pool's payout, and the pool's name for
// it -- the name a reader keeping that output's address is offered for the
// ledger it files. Null where that cannot be said without guessing.
//
//   scriptSig   the coinbase's scriptSig, hex
//   addresses   each output's address in output order, null where it has
//               none (the witness commitment, any other OP_RETURN)
//   tablePool   the pool the book's own table reads in the scriptSig
//               (btc-pools.js poolOf), for pools the registry does not know
//
// Returns { output, name, from }, `from` being 'registry-address',
// 'registry-tag' or 'table' -- whose reading it is and what it rests on.
//
// The registry is asked first, by mempool's rule. Where it names the pool by
// an address the coinbase pays, that output is the payout. Where it names the
// pool by a tag, or only the book's table does, the tag says who mined the
// block and nothing about which output is theirs -- so the name is given only
// where the coinbase pays exactly one address. A coinbase paying several (a
// pool that pays its miners from the coinbase directly) is left unnamed
// rather than guessed at.
export function payoutPool({ scriptSig = '', addresses = [], tablePool = null } = {}, pools = MEMPOOL_POOLS) {
  const paid = [...new Set(addresses.filter(Boolean))];
  const lone = paid.length === 1 ? addresses.indexOf(paid[0]) : -1;
  const hit = registryPoolOf({ scriptSig, addresses: paid }, pools);
  if (hit?.by === 'address') return { output: addresses.indexOf(hit.matched), name: hit.name, from: 'registry-address' };
  if (hit) return lone < 0 ? null : { output: lone, name: hit.name, from: 'registry-tag' };
  if (tablePool && lone >= 0) return { output: lone, name: tablePool, from: 'table' };
  return null;
}

// One pool's entry by its registry id or its name (case aside), or null --
// where a pool's own addresses are read from, to shelve them as its ledger.
export function registryPool(idOrName, pools = MEMPOOL_POOLS) {
  if (Number.isInteger(idOrName)) return pools.find((p) => p.id === idOrName) ?? null;
  const name = String(idOrName ?? '').trim().toLowerCase();
  return name ? pools.find((p) => p.name.toLowerCase() === name) ?? null : null;
}
