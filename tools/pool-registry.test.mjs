// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/pool-registry.test.mjs — mempool.space's registry of mining pools as
// the book vendors it (web/btc-mempool-pools.js) and reads it
// (web/btc-pool-registry.js).
//
//   node --test tools/pool-registry.test.mjs
//
// The copy is refreshed on a schedule (tools/fetch-mining-pools.mjs), so the
// tests hold it to what the book relies on -- its shape, its license, its
// agreement with itself -- rather than to any pool's addresses on the day it
// was read. The rule is tested on small registries written here, where the
// answer is known.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { MEMPOOL_POOLS, MEMPOOL_POOLS_SOURCE, registryPoolOf, registryPool, asciiOf } from '../web/btc-pool-registry.js';
import { NETWORKS, addressShape } from '../web/btc-network.js';

const hex = (s) => Buffer.from(s, 'latin1').toString('hex');
const heightPush = '037e5802';   // BIP34's height, ahead of whatever a pool writes

test('the vendored registry is one the book can read', () => {
  assert.ok(MEMPOOL_POOLS.length > 50, `only ${MEMPOOL_POOLS.length} pools`);
  const ids = new Set();
  for (const p of MEMPOOL_POOLS) {
    assert.ok(Number.isInteger(p.id) && !ids.has(p.id), `${p.name}: a unique id`);
    ids.add(p.id);
    assert.ok(typeof p.name === 'string' && p.name.trim(), 'every pool is named');
    for (const tag of p.tags) assert.doesNotThrow(() => new RegExp(tag, 'i'), `${p.name}: ${tag} compiles`);
    // An address the book could not decode on either chain would name no
    // ledger; the registry holds mainnet addresses and a few testnet ones.
    for (const a of p.addresses) {
      assert.ok(Object.values(NETWORKS).some((net) => addressShape(net).test(a)), `${p.name}: ${a} is an address`);
    }
  }
});

test('the copy says where it came from, and carries the license it came under', async () => {
  assert.equal(MEMPOOL_POOLS_SOURCE.repo, 'mempool/mining-pools');
  assert.equal(MEMPOOL_POOLS_SOURCE.path, 'pools-v2.json');
  assert.match(MEMPOOL_POOLS_SOURCE.fetched, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(MEMPOOL_POOLS_SOURCE.commit === null || /^[0-9a-f]{40}$/.test(MEMPOOL_POOLS_SOURCE.commit));
  const file = await readFile(new URL('../web/btc-mempool-pools.js', import.meta.url), 'utf8');
  assert.match(file, /^\/\/ SPDX-License-Identifier: MIT$/m);
  assert.match(file, /\/\/ Copyright \(c\) 2019 btc\.com/, 'the upstream copyright notice is kept');
  assert.match(file, /\/\/ The above copyright notice and this permission notice shall be included/);
});

test('the registry agrees with itself: a pool is found by its own address and its own tag', () => {
  for (const p of MEMPOOL_POOLS) {
    if (p.addresses.length) {
      const hit = registryPoolOf({ addresses: [p.addresses[0]] });
      // An earlier pool may list the same address; mempool takes the first.
      const first = MEMPOOL_POOLS.find((q) => q.addresses.includes(p.addresses[0]));
      assert.equal(hit?.id, first.id, `${p.name}: its address leads back to the first pool listing it`);
      assert.equal(hit.by, 'address');
    }
  }
});

test("a pool's tag in a coinbase names it, as mempool reads the bytes", () => {
  const pools = [
    { id: 1, name: 'Early', addresses: [], tags: ['/early/'], link: '' },
    { id: 2, name: 'Foundry USA', addresses: ['1FFxkVijzvUPUeHgkFjBk2Qw8j3wQY2cDw'], tags: ['/2cDw/', 'Foundry USA Pool'], link: 'x' },
  ];
  const scriptSig = heightPush + '04338b34c2' + hex('/Foundry USA Pool #dropgold/`') + 'd90f1a00';
  assert.deepEqual(registryPoolOf({ scriptSig }, pools),
    { id: 2, name: 'Foundry USA', link: 'x', by: 'tag', matched: 'Foundry USA Pool' });
  // Case aside, as mempool matches.
  assert.equal(registryPoolOf({ scriptSig: hex('foundry usa pool') }, pools)?.name, 'Foundry USA');
  // Nothing the registry knows: null, which mempool calls Unknown.
  assert.equal(registryPoolOf({ scriptSig: hex('nobody wrote this') }, pools), null);
  assert.equal(registryPoolOf({}, pools), null);
});

test("an address the coinbase pays names its pool, and any output counts", () => {
  const pools = [{ id: 7, name: 'Paid', addresses: ['bc1qpaid'], tags: [], link: '' }];
  assert.deepEqual(registryPoolOf({ addresses: ['bc1qother', 'bc1qpaid'] }, pools),
    { id: 7, name: 'Paid', link: '', by: 'address', matched: 'bc1qpaid' });
});

test('mempool\'s order decides: pool by pool, and within one, its addresses first', () => {
  const pools = [
    { id: 1, name: 'Tagged', addresses: [], tags: ['samaritan'], link: '' },
    { id: 2, name: 'Paid', addresses: ['tb1qpaid'], tags: [], link: '' },
    { id: 3, name: 'Both', addresses: ['tb1qboth'], tags: ['both'], link: '' },
  ];
  // The first pool to answer is the pool, even where a later one is paid.
  assert.equal(registryPoolOf({ scriptSig: hex('Samaritan mining'), addresses: ['tb1qpaid'] }, pools).name, 'Tagged');
  // Within a pool the address is asked before the tags.
  assert.equal(registryPoolOf({ scriptSig: hex('both'), addresses: ['tb1qboth'] }, pools).by, 'address');
});

test('a scriptSig is read one byte to a character, printable or not', () => {
  assert.equal(asciiOf('0a636b706f6f6c10'), '\nckpool\x10');
  assert.equal(asciiOf('ff'), 'ÿ');
  assert.equal(asciiOf(''), '');
});

test("a pool's entry is found by id or by name, for its ledger", () => {
  const first = MEMPOOL_POOLS[0];
  assert.equal(registryPool(first.id)?.name, first.name);
  assert.equal(registryPool(first.name.toUpperCase())?.id, first.id);
  assert.equal(registryPool('no such pool'), null);
  assert.equal(registryPool(''), null);
});
