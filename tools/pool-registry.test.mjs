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

import { MEMPOOL_POOLS, MEMPOOL_POOLS_SOURCE, registryPoolOf, registryPool, asciiOf, payoutPool, poolLedgers, POOL_SHELF } from '../web/btc-pool-registry.js';
import { POOL_SIGNATURES } from '../web/btc-pools.js';
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

const out = (address, sats = 0) => ({ address, sats });

test("a coinbase payout is titled by its pool only where it can be said which output is the pool's", () => {
  const pools = [
    { id: 1, name: 'Paid Pool', addresses: ['bc1qpool'], tags: ['/paid/'], link: '' },
    { id: 2, name: 'Tagged Pool', addresses: [], tags: ['/tagged/'], link: '' },
  ];
  // The registry names the pool by an address the coinbase pays: that output,
  // however many others the coinbase pays and whatever they carry.
  assert.deepEqual(payoutPool({ scriptSig: hex('/paid/'), outputs: [out('bc1qminer', 9e8), out(null), out('bc1qpool', 1)] }, pools),
    { output: 2, name: 'Paid Pool', from: 'registry-address' });
  // By a tag: the lone paying output, past the witness commitment.
  assert.deepEqual(payoutPool({ scriptSig: hex('/tagged/'), outputs: [out('bc1qonly', 3e8), out(null)] }, pools),
    { output: 0, name: 'Tagged Pool', from: 'registry-tag' });
  // By a tag with the value shared out -- miners paid from the coinbase, or a
  // split between payees: the tag says who mined, not which output is theirs.
  assert.equal(payoutPool({ scriptSig: hex('/tagged/'), outputs: [out('bc1qa', 2e8), out('bc1qb', 1e8), out(null)] }, pools), null);
  assert.equal(payoutPool({ scriptSig: hex('/tagged/'), outputs: [out('bc1qa', 98e6), out('bc1qb', 2e6)] }, pools), null, 'short of the share');
  // The same address paid twice is still one payee.
  assert.equal(payoutPool({ scriptSig: hex('/tagged/'), outputs: [out('bc1qa', 1), out('bc1qa', 1)] }, pools)?.output, 0);
  // Nothing either source reads: nothing offered.
  assert.equal(payoutPool({ scriptSig: hex('nobody'), outputs: [out('bc1qa', 1)] }, pools), null);
});

test("AntPool's payout carries the reward beside a marker, and is named", () => {
  // Mainnet block 968,448, as mempool.space served it: the reward to
  // 39C7fx… beside 546 satoshis to 37jKPS… and five OP_RETURNs. The registry
  // lists neither address; its AntPool tag is in the coinbase.
  const antpool = registryPool('AntPool');
  const tag = antpool.tags.find((t) => /^Mined by AntPool$/.test(t)) ?? antpool.tags[0];
  const outputs = [out('37jKPSmbEGwgfacCr2nayn1wTaqMAbA94Z', 546), out('39C7fxSzEACPjM78Z7xdPxhf7mKxJwvfMJ', 313867032),
    out(null), out(null), out(null), out(null), out(null)];
  // The book's table lists the payout, so its address names it; the marker
  // is nobody's payout. (Naming it by the tag and the reward alone, as before
  // the table read the address, is the rule the synthetic cases above hold.)
  assert.deepEqual(payoutPool({ scriptSig: heightPush + hex(tag + ' x6mm0Uwq'), outputs }),
    { output: 1, name: 'AntPool', from: 'table-address' });
});

test("a pool the registry does not know is named by the book's table: Samaritan's payout", () => {
  // Block 153,726 on testnet4: Samaritan's coinbase, its payout, and the
  // witness commitment (no address). The registry has no Samaritan; the
  // book's table read "Samaritan mining" in the same bytes.
  const scriptSig = '037e58020004f33db46a048515aa0a0c5806b46a3b000000000000000a636b706f6f6c1053616d61726974616e206d696e696e67';
  const payout = 'tb1q93k8n2snvqau488v5mxv0ycm0atsw5xwae0w74';
  assert.equal(registryPoolOf({ scriptSig, addresses: [payout] }), null, 'mempool calls it Unknown');
  // The book's table lists this payout, so its address names it.
  assert.deepEqual(payoutPool({ scriptSig, outputs: [out(payout, 5002671077), out(null)], tablePool: 'Samaritan mining' }),
    { output: 0, name: 'Samaritan mining', from: 'table-address' });
  // A payout the table has not read is named by the tag and the reward…
  assert.deepEqual(payoutPool({ scriptSig, outputs: [out('tb1qnew', 5e9), out(null)], tablePool: 'Samaritan mining' }),
    { output: 0, name: 'Samaritan mining', from: 'table' });
  // …and not where the value is shared between two payees.
  assert.equal(payoutPool({ scriptSig, outputs: [out('tb1qnew', 25e8), out('tb1qother', 25e8)], tablePool: 'Samaritan mining' }), null);
});

test("the book's table lists only addresses a chain can hold", () => {
  for (const p of POOL_SIGNATURES) {
    for (const a of p.addresses ?? []) {
      assert.ok(Object.values(NETWORKS).some((net) => addressShape(net).test(a)), `${p.name}: ${a} is an address`);
    }
  }
});

test('the mining pools stand on the shelf as ledgers, per chain, under one heading', () => {
  const mainnet = poolLedgers(NETWORKS.mainnet);
  const testnet4 = poolLedgers(NETWORKS.testnet4);
  for (const [id, shelf] of [['mainnet', mainnet], ['testnet4', testnet4]]) {
    const shape = addressShape(NETWORKS[id]);
    assert.ok(shelf.length, `${id} has pool ledgers`);
    for (const l of shelf) {
      assert.equal(l.shelf, POOL_SHELF);
      assert.ok(l.title && l.addresses.length, `${id}: ${l.title} is named and holds an address`);
      assert.ok(l.addresses.every((a) => shape.test(a)), `${id}: ${l.title} holds only ${id} addresses`);
      assert.match(l.said, /^payout addresses, per /, 'whose reading it is');
    }
    const titles = shelf.map((l) => l.title);
    assert.deepEqual(titles, [...titles].sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' })), `${id}: alphabetical`);
  }
  // AntPool: the registry's addresses and the one the book read, as one ledger.
  const antpool = mainnet.find((l) => l.title === 'AntPool');
  assert.ok(antpool.addresses.includes('39C7fxSzEACPjM78Z7xdPxhf7mKxJwvfMJ'));
  assert.ok(registryPool('AntPool').addresses.every((a) => antpool.addresses.includes(a)));
  assert.match(antpool.said, /registry and the book/);
  // Samaritan: known to the book only, and only on testnet4.
  assert.deepEqual(testnet4.find((l) => l.title === 'Samaritan mining')?.addresses, ['tb1q93k8n2snvqau488v5mxv0ycm0atsw5xwae0w74']);
  assert.equal(mainnet.find((l) => l.title === 'Samaritan mining'), undefined);
});
