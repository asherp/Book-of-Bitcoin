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
import { POOL_SIGNATURES } from './btc-pools.js';
import { NET, addressShape } from './btc-network.js';

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
//   outputs     each output in order, as { address, sats }: address null
//               where it has none (the witness commitment, any other
//               OP_RETURN)
//   tablePool   the pool the book's own table reads in the scriptSig
//               (btc-pools.js poolOf), for pools the registry does not know
//
// Returns { output, name, from }, `from` being 'registry-address',
// 'table-address', 'registry-tag' or 'table' -- whose reading it is and what
// it rests on.
//
// The registry is asked first, by mempool's rule. Where it names the pool by
// an address the coinbase pays, that output is the payout; so too where the
// book's own table lists the address (btc-pools.js). Where it names the
// pool by a tag, or only the book's table does, the tag says who mined the
// block and nothing about which output is theirs -- so the payout is the
// output that carries the block's reward: the lone paid address, or the one
// output holding at least PAYOUT_SHARE of the value paid to addresses. That
// is AntPool's shape, the reward to one address beside a 546-sat marker to
// another. A coinbase that shares its value out (a pool paying its miners
// from the coinbase directly, or a split between payees) is left unnamed
// rather than guessed at.
export const PAYOUT_SHARE = 0.99;

export function payoutPool({ scriptSig = '', outputs = [], tablePool = null } = {}, pools = MEMPOOL_POOLS) {
  const addresses = outputs.map((o) => o?.address || null);
  const paid = [...new Set(addresses.filter(Boolean))];
  const hit = registryPoolOf({ scriptSig, addresses: paid }, pools);
  if (hit?.by === 'address') return { output: addresses.indexOf(hit.matched), name: hit.name, from: 'registry-address' };
  const known = POOL_SIGNATURES.find((p) => p.addresses?.some((a) => paid.includes(a)));
  if (known) return { output: addresses.findIndex((a) => known.addresses.includes(a)), name: known.name, from: 'table-address' };
  const name = hit ? hit.name : tablePool;
  if (!name) return null;
  const output = rewardOutput(outputs);
  return output < 0 ? null : { output, name, from: hit ? 'registry-tag' : 'table' };
}

// The output carrying a coinbase's reward, by index, or -1: the lone paid
// address, or the one paid output holding PAYOUT_SHARE of what addresses are
// paid. The same address paid twice is one payee, and counts as the first.
function rewardOutput(outputs) {
  const byAddress = new Map();
  outputs.forEach((o, i) => {
    if (!o?.address) return;
    const was = byAddress.get(o.address);
    byAddress.set(o.address, { index: was ? was.index : i, sats: (was ? was.sats : 0) + (Number(o.sats) || 0) });
  });
  const payees = [...byAddress.values()];
  if (payees.length === 1) return payees[0].index;
  const total = payees.reduce((n, p) => n + p.sats, 0);
  if (!(total > 0)) return -1;
  const top = payees.reduce((a, b) => (b.sats > a.sats ? b : a));
  return top.sats >= PAYOUT_SHARE * total ? top.index : -1;
}

// The mining pools as ledgers on the curated shelf, each titled by its pool
// and filed under one heading (`shelf`) in the contents. A pool's ledger
// holds the payout addresses mempool.space's registry lists for it and the
// ones the book's own table has read (btc-pools.js), merged where the two
// name the same pool, case aside -- and only the addresses the chain being
// read can hold (btc-network.js), so a pool with none there has no ledger
// there. Alphabetical: a shelf this long is scanned for a name, not read in
// order. `said` credits whose reading each ledger is.
export const POOL_SHELF = 'Mining pools';
export function poolLedgers(net = NET, pools = MEMPOOL_POOLS, table = POOL_SIGNATURES) {
  const shape = addressShape(net);
  const byName = new Map();
  const add = (name, addresses, source) => {
    const key = name.trim().toLowerCase();
    if (!byName.has(key)) byName.set(key, { title: name, addresses: [], sources: new Set() });
    const ledger = byName.get(key);
    for (const a of addresses) {
      if (!shape.test(a) || ledger.addresses.includes(a)) continue;
      ledger.addresses.push(a);
      ledger.sources.add(source);
    }
  };
  for (const p of pools) add(p.name, p.addresses, 'registry');
  for (const p of table) if (p.addresses?.length) add(p.name, p.addresses, 'table');
  const SAID = { registry: "mempool.space's pool registry", table: "the book's reading of the pool's coinbases" };
  return [...byName.values()]
    .filter((l) => l.addresses.length)
    .sort((a, b) => a.title.localeCompare(b.title, 'en', { sensitivity: 'base' }))
    .map(({ title, addresses, sources }) => ({
      title, addresses, shelf: POOL_SHELF,
      said: `payout addresses, per ${[...sources].map((s) => SAID[s]).join(' and ')}`,
    }));
}

// One pool's entry by its registry id or its name (case aside), or null --
// where a pool's own addresses are read from, to shelve them as its ledger.
export function registryPool(idOrName, pools = MEMPOOL_POOLS) {
  if (Number.isInteger(idOrName)) return pools.find((p) => p.id === idOrName) ?? null;
  const name = String(idOrName ?? '').trim().toLowerCase();
  return name ? pools.find((p) => p.name.toLowerCase() === name) ?? null : null;
}
