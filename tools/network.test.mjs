// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/network.test.mjs — the chain the book reads, and everything that
// follows the choice (web/btc-network.js).
//
//   node --test tools/network.test.mjs
//
// Three things are under test. The table: every network says everything the
// modules ask of it, and mainnet's storage suffix is empty, so no reader's
// kept data changes its name. The decode: an address on each chain reads to
// the script that chain's explorer reports for it, and a network refuses the
// other's. And the copies: btc-chrome.js and index.html are classic scripts
// that name the key and the networks themselves, and must not drift from the
// module.
//
// A module reads the choice once, when it is imported, and this process has
// already imported them as mainnet. So what the book does on testnet4 is read
// in a child process whose localStorage holds the choice before anything loads.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';

import { NETWORKS, NETWORK_KEY, DEFAULT_NETWORK, NET, nsKey, chosenNetwork } from '../web/btc-network.js';
import { isAddress, addressScriptHex } from '../web/btc-index.js';
import { looksLikeAddress } from '../web/btc-lookup.js';
import { expectedBlockTime, PLAUSIBLE_WINDOW } from '../web/btc-chaintime.js';

const WEB = new URL('../web/', import.meta.url);

// Outputs as each chain's explorer reported them (mempool.space, read
// 2026-09-23/24): the address, and the scriptPubKey it names.
const VECTORS = {
  mainnet: [
    ['189AdBAwD7caWUsgfyJfm623Qo7e6pPKS', '76a9140159ba72274e281289526bae1fbd828870b9102188ac'],
    ['3AfXoLtpBEfbiAkPPQnnGKHKaDznbVVdPQ', 'a91462713d3f27319ea8bf6dd8a151be26ad4edfe6ec87'],
    ['bc1qprmsjdgq9zzvy5rfws7rnkcq5wm8t9wtvwtrjk', '001408f70935002884c25069743c39db00a3b67595cb'],
    ['bc1p6m7r5x5jflvpmn90tgzqs35cv9dwvdcck8c0dy3jmlew7lvrvs9q9h5s4z', '5120d6fc3a1a924fd81dccaf5a04084698615ae63718b1f0f69232dff2ef7d83640a'],
  ],
  testnet4: [
    ['mjjYfspSJKDkGQndBdun92APSjSWgfiv5X', '76a9142e4230c6af0307ee36d828f2d38f13a638d7eef088ac'],
    ['2N45GTzpN4ucaz3o9FXHrsbv3AZfcj3LQoV', 'a91476c74ad9c9c663ade036c2f7a5c0fc1328e4fa0d87'],
    ['tb1q93k8n2snvqau488v5mxv0ycm0atsw5xwae0w74', '00142c6c79aa13603bca9ceca6ccc7931b7f570750ce'],
    ['tb1qjhmw5p0987uwghy2646q5zeptruyjqz5kdrdag33f9xdyndk4auqzaeuf6', '002095f6ea05e53fb8e45c8ad5740a0b2158f8490054b346dea231494cd24db6af78'],
    ['tb1p8a80xj9g32c3zv2mex63fhkkr84ht6jr9vfgk9gzxujq8e423hrscrpj2d', '51203f4ef348a88ab111315bc9b514ded619eb75ea432b128b1502372403e6aa8dc7'],
  ],
};

test('every network says everything the modules ask of it', () => {
  const fields = ['id', 'label', 'esplora', 'mempool', 'mempoolWs', 'blockchair', 'hasPrice', 'curated',
    'hrp', 'p2pkh', 'p2sh', 'base58Lead', 'genesisCoinbase', 'anchors', 'suffix'];
  const suffixes = new Set();
  for (const [id, net] of Object.entries(NETWORKS)) {
    for (const f of fields) assert.ok(f in net, `${id} says nothing about ${f}`);
    assert.equal(net.id, id, `${id} names itself`);
    assert.ok(Array.isArray(net.esplora) && net.esplora.length, `${id} has a mirror to ask`);
    assert.match(net.genesisCoinbase, /^[0-9a-f]{64}$/, `${id}'s genesis coinbase is a txid`);
    assert.ok(!suffixes.has(net.suffix), `${id}'s storage suffix is its own`);
    suffixes.add(net.suffix);
  }
  // Every key and database a mainnet reader already holds keeps its name.
  assert.equal(NETWORKS.mainnet.suffix, '');
  assert.equal(DEFAULT_NETWORK, 'mainnet');
});

test('where nothing chooses, the book reads mainnet', () => {
  assert.equal(chosenNetwork(), 'mainnet');
  assert.equal(NET.id, 'mainnet');
  assert.equal(nsKey('glossia-btc-bookmarks'), 'glossia-btc-bookmarks');
  assert.equal(nsKey('glossia-btc-bookmarks', NETWORKS.testnet4), 'glossia-btc-bookmarks-testnet4');
});

test("an address reads to the script its chain's explorer reports", () => {
  for (const [id, vectors] of Object.entries(VECTORS)) {
    const net = NETWORKS[id];
    for (const [address, script] of vectors) {
      assert.ok(isAddress(address, net), `${address} is shaped like a ${id} address`);
      assert.equal(addressScriptHex(address, net), script, `${address} on ${id}`);
    }
  }
});

test("a network refuses the other's addresses", () => {
  for (const [id, vectors] of Object.entries(VECTORS)) {
    const other = NETWORKS[id === 'mainnet' ? 'testnet4' : 'mainnet'];
    for (const [address] of vectors) {
      assert.ok(!isAddress(address, other), `${address} is not a ${other.id} address`);
      assert.equal(addressScriptHex(address, other), null, `${address} does not decode on ${other.id}`);
    }
  }
  // The lookup's own shape test follows the chosen network, mainnet here.
  assert.ok(looksLikeAddress(VECTORS.mainnet[2][0]));
  assert.ok(!looksLikeAddress(VECTORS.testnet4[2][0]));
});

test("testnet4's clock needs its second anchor", () => {
  const [, [height, time]] = NETWORKS.testnet4.anchors;
  // Genesis alone puts the anchored block past the window a clock is read in:
  // the twenty-minute rule lets testnet4 run fast.
  const genesisOnly = NETWORKS.testnet4.anchors.slice(0, 1);
  assert.ok(Math.abs(expectedBlockTime(height, genesisOnly) - time) > PLAUSIBLE_WINDOW,
    'genesis alone would be close enough, and the second anchor would be unneeded');
  assert.equal(expectedBlockTime(height, NETWORKS.testnet4.anchors), time);
});

test('the classic scripts name the same key and networks as the module', async () => {
  const chrome = await readFile(new URL('btc-chrome.js', WEB), 'utf8');
  assert.ok(chrome.includes(`const NETWORK_KEY = '${NETWORK_KEY}'`), 'btc-chrome.js keeps the choice under another key');
  const listed = chrome.match(/const NETWORKS = (\[.*\]);/)?.[1];
  assert.ok(listed, 'btc-chrome.js no longer lists the networks');
  const ids = new Function(`return ${listed}`)().map(([id]) => id);
  assert.deepEqual(ids, Object.keys(NETWORKS), 'btc-chrome.js offers a different set of networks');

  const root = await readFile(new URL('index.html', WEB), 'utf8');
  assert.ok(root.includes(`'${NETWORK_KEY}'`), 'index.html reads another key');
  assert.ok(root.includes(`network=(${Object.keys(NETWORKS).join('|')})`), 'index.html admits a different set of networks');
  for (const net of Object.values(NETWORKS)) {
    if (net.suffix) assert.ok(root.includes(`'${net.suffix}'`), `index.html does not know ${net.id}'s suffix`);
  }
});

// What the book does when the choice is testnet4, read in a fresh process.
function onTestnet4(script) {
  const prelude = `
    const kept = new Map([['${NETWORK_KEY}', 'testnet4']]);
    globalThis.localStorage = {
      getItem: (k) => (kept.has(k) ? kept.get(k) : null),
      setItem: (k, v) => kept.set(k, String(v)),
      removeItem: (k) => kept.delete(k),
    };
  `;
  const out = execFileSync(process.execPath, ['--input-type=module', '-e', prelude + script], {
    cwd: new URL('..', WEB), encoding: 'utf8',
  });
  return JSON.parse(out);
}

test('on testnet4 every module reads testnet4', () => {
  const got = onTestnet4(`
    const { NET, nsKey } = await import('./web/btc-network.js');
    const { MEMPOOL_MIRRORS } = await import('./web/btc-mempool.js');
    const { MINES_MIRRORS } = await import('./web/btc-mines.js');
    const { INDEXED, DEFAULT_ESPLORA } = await import('./web/btc-index.js');
    const { HALVING_ANCHORS } = await import('./web/btc-chaintime.js');
    const { LAST_HEIGHT, chainWork, workBetween, blockWork, MIN_BITS } = await import('./web/btc-chainwork.js');
    const { TESTNET4_EPOCHS } = await import('./web/btc-chainwork-testnet4.js');
    // The first epoch with minimum-difficulty blocks in it, read as a book.
    const e = TESTNET4_EPOCHS.findIndex(([bits, low]) => low > 0 && bits !== MIN_BITS);
    const [bits, low] = TESTNET4_EPOCHS[e];
    const expected = BigInt(2016 - low) * blockWork(bits) + BigInt(low) * blockWork(MIN_BITS);
    const { usdOn } = await import('./web/btc-price.js');
    const { WS_URL } = await import('./web/btc-projected.js');
    console.log(JSON.stringify({
      net: NET.id, key: nsKey('glossia-btc-bookmarks'),
      mempool: MEMPOOL_MIRRORS, mines: MINES_MIRRORS, esplora: DEFAULT_ESPLORA, ws: WS_URL,
      curated: INDEXED.length, anchors: HALVING_ANCHORS,
      lastHeight: LAST_HEIGHT, vendored: TESTNET4_EPOCHS.length,
      genesisEpoch: String(chainWork(1000)), genesisExpected: String(1001n * blockWork(MIN_BITS)),
      book: String(workBetween(e * 2016, e * 2016 + 2015)), bookExpected: String(expected),
      partOfBook: workBetween(e * 2016, e * 2016 + 100),
      usd: await usdOn(1790197567),
    }));
  `);
  assert.equal(got.net, 'testnet4');
  assert.equal(got.key, 'glossia-btc-bookmarks-testnet4', 'chain data is kept apart from mainnet');
  // Blockstream serves no testnet4 API: mempool.space alone.
  assert.deepEqual(got.mempool, ['https://mempool.space/testnet4/api']);
  assert.deepEqual(got.esplora, ['https://mempool.space/testnet4/api']);
  assert.deepEqual(got.mines, ['https://mempool.space/testnet4/api']);
  assert.equal(got.ws, 'wss://mempool.space/testnet4/api/v1/ws');
  assert.equal(got.curated, 0, 'no curated mainnet ledger is offered on a test chain');
  assert.deepEqual(got.anchors, NETWORKS.testnet4.anchors);
  // testnet4's own table, counted with its minimum-difficulty blocks.
  assert.ok(got.vendored > 0, 'no testnet4 epochs are vendored');
  assert.equal(got.lastHeight, got.vendored * 2016 - 1);
  assert.equal(got.genesisEpoch, got.genesisExpected, 'an epoch at the minimum difficulty sums at any height');
  assert.equal(got.book, got.bookExpected, 'a whole book sums its own blocks and its minimum-difficulty ones');
  assert.equal(got.partOfBook, null, 'part of a mixed epoch declines: the table says how many fell, not which');
  assert.equal(got.usd, null, 'a test chain has no market price, and none is asked for');
});

test('on testnet4 the contents is the bare chain', async () => {
  const appendixYaml = await readFile(new URL('appendix.yaml', WEB), 'utf8');
  const got = onTestnet4(`
    const { loadNotables, notables, appendix } = await import('./web/btc-notables.js');
    const asked = [];
    await loadNotables({ read: async (file) => { asked.push(file); return ${JSON.stringify(appendixYaml)}; } });
    console.log(JSON.stringify({ asked, entries: notables().length, kinds: appendix().map((p) => p.kind) }));
  `);
  assert.deepEqual(got.asked, ['appendix.yaml'], 'the curated index is not even read');
  assert.equal(got.entries, 0);
  // What the chain fills by itself, in the appendix's own order.
  assert.deepEqual(got.kinds, ['mempool', 'mines', 'ledgers']);
});

test('switching keeps the choice and reopens the page bare', () => {
  const got = onTestnet4(`
    const went = [];
    globalThis.location = { search: '', pathname: '/bitcoin-book.html', assign: (u) => went.push(u) };
    const { switchNetwork } = await import('./web/btc-network.js');
    switchNetwork('testnet4');     // already reading it: nothing happens
    switchNetwork('regtest');      // not a network the book reads: nothing happens
    switchNetwork('mainnet');
    console.log(JSON.stringify({ went, kept: localStorage.getItem('${NETWORK_KEY}') }));
  `);
  assert.deepEqual(got.went, ['/bitcoin-book.html'], 'the page reopens once, without its address');
  assert.equal(got.kept, 'mainnet');
});

test('the chain is chosen first in Settings, and nowhere else', async () => {
  const book = await readFile(new URL('bitcoin-book.html', WEB), 'utf8');
  const panel = book.slice(book.indexOf('id="settings-panel"'));
  const firstTitle = panel.match(/<div class="settings-title">([^<]*)<\/div>/)?.[1];
  assert.equal(firstTitle, 'Chain', 'Chain is not the first section of Settings');
  assert.ok(panel.indexOf('id="network-select"') < panel.indexOf('>Text size<'), 'the chain select is not under its heading');
  assert.match(book, /networkSelect\.addEventListener\('change', \(\) => switchNetwork\(networkSelect\.value\)\)/);
  // The masthead only labels a test chain; it offers no control.
  const chrome = await readFile(new URL('btc-chrome.js', WEB), 'utf8');
  assert.ok(!/createElement\('select'\)/.test(chrome), 'the masthead still builds a chain control');
});

test('an address names its chain off mainnet, and only there', async () => {
  const { withChain } = await import('../web/btc-network.js');
  const t4 = NETWORKS.testnet4;
  // Mainnet: returned as it was, so no link already made changes.
  assert.equal(withChain('/bitcoin-book.html?block=153726', NETWORKS.mainnet), '/bitcoin-book.html?block=153726');
  assert.equal(withChain('/bitcoin-book.html?block=153726'), '/bitcoin-book.html?block=153726', 'this process reads mainnet');
  // Testnet4: appended, keeping the rest as written and the fragment last.
  assert.equal(withChain('/bitcoin-book.html?block=153726&index=0', t4), '/bitcoin-book.html?block=153726&index=0&network=testnet4');
  assert.equal(withChain('/bitcoin-appendix.html', t4), '/bitcoin-appendix.html?network=testnet4');
  assert.equal(withChain('/bitcoin-book.html?block=1#s3', t4), '/bitcoin-book.html?block=1&network=testnet4#s3');
  // Never twice.
  assert.equal(withChain('/x?network=testnet4&block=1', t4), '/x?network=testnet4&block=1');
});

test('every address a page writes for itself goes through withChain', async () => {
  const { readdir } = await import('node:fs/promises');
  const pages = (await readdir(WEB)).filter((f) => f.endsWith('.html'));
  let writes = 0;
  for (const page of pages) {
    const src = await readFile(new URL(page, WEB), 'utf8');
    for (const m of src.matchAll(/history\.(?:replaceState|pushState)\(\s*[^,]+,\s*[^,]+,\s*([^]{0,40})/g)) {
      writes++;
      assert.match(m[1], /^withChain\(/, `${page}: an address written without its chain — ${m[0].slice(0, 90)}`);
    }
  }
  assert.ok(writes >= 5, `found only ${writes} address writes — the scan has stopped reading the pages`);
});

test('the masthead script names the chain in the address the page opened on', async () => {
  const { runInNewContext } = await import('node:vm');
  const chrome = await readFile(new URL('btc-chrome.js', WEB), 'utf8');
  const open = (kept, search, hash = '') => {
    const written = [];
    const store = new Map(kept ? [[NETWORK_KEY, kept]] : []);
    runInNewContext(chrome, {
      URLSearchParams,
      location: { search, pathname: '/bitcoin-search.html', hash },
      history: { state: null, replaceState: (_s, _t, url) => written.push(url) },
      localStorage: { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, v) },
      document: { readyState: 'complete', documentElement: { setAttribute() {} }, querySelector: () => null, querySelectorAll: () => [], addEventListener() {} },
      window: { addEventListener() {}, matchMedia: () => ({ matches: false }), navigator: {} },
      navigator: {},
      fetch: () => Promise.resolve({ ok: false }),
      setTimeout,
    });
    return written;
  };
  assert.deepEqual(open('testnet4', '?q=153726', '#top'), ['/bitcoin-search.html?q=153726&network=testnet4#top']);
  assert.deepEqual(open('testnet4', '?q=1&network=testnet4'), [], 'an address that already names its chain is left alone');
  assert.deepEqual(open(null, '?q=1'), [], 'a mainnet address is left alone');
  assert.deepEqual(open('mainnet', '?q=1'), []);
});
