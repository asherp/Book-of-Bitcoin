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
    'hrp', 'p2pkh', 'p2sh', 'base58Lead', 'genesisCoinbase', 'bip34Height', 'anchors', 'suffix'];
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

// What the book does on a page whose address reads `search`, in a fresh
// process (the modules read the address once, when they are imported).
function onPage(search, script) {
  const prelude = `
    const kept = new Map();
    globalThis.localStorage = {
      getItem: (k) => (kept.has(k) ? kept.get(k) : null),
      setItem: (k, v) => kept.set(k, String(v)),
      removeItem: (k) => kept.delete(k),
    };
    globalThis.location = { search: ${JSON.stringify(search)}, pathname: '/bitcoin-book.html', hash: '', assign() {} };
  `;
  const out = execFileSync(process.execPath, ['--input-type=module', '-e', prelude + script], {
    cwd: new URL('..', WEB), encoding: 'utf8',
  });
  return JSON.parse(out);
}
const onTestnet4 = (script) => onPage('?network=testnet4', script);

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
      curated: INDEXED.filter((e) => !e.shelf).length, pools: INDEXED.filter((e) => e.shelf).map((e) => e.title), anchors: HALVING_ANCHORS,
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
  assert.ok(got.pools.includes('Samaritan mining'), "the mining pools' testnet4 payouts are shelved there");
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

test("switching opens the page on the other chain's address, and nothing more", () => {
  const switching = (search, to) => onPage(search, `
    const went = [];
    location.assign = (u) => went.push(u);
    const { switchNetwork, NET } = await import('./web/btc-network.js');
    switchNetwork(NET.id);          // already reading it: nothing happens
    switchNetwork('regtest');       // not a network the book reads: nothing happens
    switchNetwork(${JSON.stringify(to)});
    console.log(JSON.stringify({ went, kept: localStorage.getItem('${NETWORK_KEY}') }));
  `);
  // The rest of the address stays behind: it names a place on the chain being left.
  assert.deepEqual(switching('?block=153726&network=testnet4', 'mainnet').went, ['/bitcoin-book.html']);
  assert.deepEqual(switching('?block=800000', 'testnet4').went, ['/bitcoin-book.html?network=testnet4']);
  // The address carries the choice; nothing is stored for it.
  assert.equal(switching('?block=1', 'testnet4').kept, null);
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

test('the masthead reads the chain from the address alone, and remembers it for the front door', async () => {
  const { runInNewContext } = await import('node:vm');
  const chrome = await readFile(new URL('btc-chrome.js', WEB), 'utf8');
  const open = (saved, search) => {
    const written = [];
    let marked = null;
    const store = new Map(saved ? [[NETWORK_KEY, saved]] : []);
    runInNewContext(chrome, {
      URLSearchParams,
      location: { search, pathname: '/bitcoin-search.html', hash: '' },
      history: { state: null, replaceState: (_s, _t, url) => written.push(url) },
      localStorage: { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, v) },
      document: { readyState: 'complete', querySelector: () => null, querySelectorAll: () => [], addEventListener() {},
        documentElement: { setAttribute: (k, v) => { if (k === 'data-network') marked = v; } } },
      window: { addEventListener() {}, matchMedia: () => ({ matches: false }), navigator: {} },
      navigator: {},
      fetch: () => Promise.resolve({ ok: false }),
      setTimeout,
    });
    return { marked, saved: store.get(NETWORK_KEY), written };
  };
  // The address names testnet4: testnet4, whatever was read last.
  assert.deepEqual(open('mainnet', '?q=1&network=testnet4'), { marked: 'testnet4', saved: 'testnet4', written: [] });
  // A bare address is mainnet, even for a reader who last read testnet4 --
  // which is what lets a mainnet link open on mainnet for everyone.
  assert.deepEqual(open('testnet4', '?q=1'), { marked: 'mainnet', saved: 'mainnet', written: [] });
  // A chain the book does not read is no chain: mainnet.
  assert.equal(open(null, '?network=regtest').marked, 'mainnet');
});

test('every navigation a script makes keeps the chain', async () => {
  const { readdir } = await import('node:fs/promises');
  const files = (await readdir(WEB)).filter((f) => f.endsWith('.html') || f.endsWith('.js'));
  let navigations = 0;
  for (const file of files) {
    const src = await readFile(new URL(file, WEB), 'utf8');
    for (const m of src.matchAll(/location\.(?:href\s*=(?!=)|assign\(|replace\()\s*([^;\n]*)/g)) {
      navigations++;
      const target = m[1];
      // A redirect that forwards the whole query carries ?network= with it.
      if (target.includes('location.search')) continue;
      // switchNetwork and the front door build the chain into their target.
      if (file === 'btc-network.js' || (file === 'index.html' && target.startsWith('to '))) continue;
      assert.match(target, /^(?:withChain\(|window\.__bookChain)/, `${file}: a navigation without its chain — ${m[0].slice(0, 90)}`);
    }
  }
  assert.ok(navigations >= 20, `found only ${navigations} navigations — the scan has stopped reading the pages`);
});

test("the masthead script names the chain in every link to the book's pages", async () => {
  const { runInNewContext } = await import('node:vm');
  const { withChain } = await import('../web/btc-network.js');
  const chrome = await readFile(new URL('btc-chrome.js', WEB), 'utf8');
  const anchor = (href) => {
    const attrs = new Map([['href', href]]);
    return { nodeType: 1, tagName: 'A', querySelectorAll: () => [],
      getAttribute: (k) => attrs.get(k) ?? null, setAttribute: (k, v) => attrs.set(k, v) };
  };
  // A page that holds some links, then adds one and re-points another.
  const open = (kept) => {
    const links = [
      './bitcoin-book.html?block=153726&index=0', './bitcoin-appendix.html?part=mining#mines',
      './bitcoin-contents.html', './', '#', '#s3', 'https://github.com/asherp/book-of-bitcoin',
      './passages/index.md', './bitcoin-search.html?q=1&network=testnet4',
    ].map(anchor);
    let observer = null;
    const store = new Map([[NETWORK_KEY, kept]]);
    runInNewContext(chrome, {
      URL, URLSearchParams,
      location: { href: 'http://book.test/bitcoin-contents.html', origin: 'http://book.test',
        pathname: '/bitcoin-contents.html', search: `?network=${kept}`, hash: '' },
      history: { state: null, replaceState() {} },
      localStorage: { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, v) },
      document: { readyState: 'complete', querySelector: () => null, querySelectorAll: () => [], addEventListener() {},
        documentElement: { nodeType: 1, tagName: 'HTML', setAttribute() {}, querySelectorAll: () => links } },
      MutationObserver: class { constructor(cb) { observer = cb; } observe() {} },
      window: { addEventListener() {}, matchMedia: () => ({ matches: false }), navigator: {} },
      navigator: {}, fetch: () => Promise.resolve({ ok: false }), setTimeout,
    });
    return { links, observer };
  };

  const { links, observer } = open('testnet4');
  const hrefs = links.map((a) => a.getAttribute('href'));
  const t4 = NETWORKS.testnet4;
  // The book's pages are named, by the same rule as withChain.
  for (const i of [0, 1, 2, 3, 8]) {
    const before = ['./bitcoin-book.html?block=153726&index=0', './bitcoin-appendix.html?part=mining#mines',
      './bitcoin-contents.html', './', '', '', '', '', './bitcoin-search.html?q=1&network=testnet4'][i];
    assert.equal(hrefs[i], withChain(before, t4), `link ${i}`);
  }
  assert.equal(hrefs[1], './bitcoin-appendix.html?part=mining&network=testnet4#mines', 'the fragment stays last');
  // Nothing else is touched: a fragment on this page, another site, a file.
  assert.deepEqual(hrefs.slice(4, 8), ['#', '#s3', 'https://github.com/asherp/book-of-bitcoin', './passages/index.md']);

  // A link the page adds later, and one it re-points, are named as they happen.
  const added = anchor('./bitcoin-ledger.html?address=tb1qexample');
  observer([{ type: 'childList', addedNodes: [added] }]);
  assert.equal(added.getAttribute('href'), './bitcoin-ledger.html?address=tb1qexample&network=testnet4');
  links[4].setAttribute('href', './bitcoin-proof.html?digest=00');
  observer([{ type: 'attributes', target: links[4] }]);
  assert.equal(links[4].getAttribute('href'), './bitcoin-proof.html?digest=00&network=testnet4');

  // On mainnet, nothing is observed and no link changes.
  const main = open('mainnet');
  assert.equal(main.observer, null, 'mainnet installs no observer');
  assert.equal(main.links[0].getAttribute('href'), './bitcoin-book.html?block=153726&index=0');
});

test("the book's own Copy link names the chain", async () => {
  const book = await readFile(new URL('bitcoin-book.html', WEB), 'utf8');
  const share = book.slice(book.indexOf('function entryShareUrl'), book.indexOf("menuCopyLinkBtn.addEventListener('click'"));
  assert.ok(share.length > 0, 'entryShareUrl is gone');
  assert.match(share, /return withChain\(url\.href\);/, 'the copied link is built without its chain');
});

// Rendering a coinbase runs the Glossia engine, a build artifact a bare
// checkout lacks; the tests that need it skip without it, as elsewhere.
const engineBuilt = await readFile(new URL('glossia.js', WEB)).then(() => true, () => false);

test("testnet4's coinbases open with their height, so the miner's margin is read", { skip: !engineBuilt && 'web/glossia.js not built' }, () => {
  // Block 153,726's coinbase scriptSig, as the chain wrote it: Samaritan's.
  // BIP34 is active from block 1 on testnet4, where mainnet waited until
  // 227,931 -- read with mainnet's bound, every testnet4 coinbase was quoted
  // whole and nothing in it was marked.
  const scriptSig = '037e58020004f33db46a048515aa0a0c5806b46a3b000000000000000a636b706f6f6c1053616d61726974616e206d696e696e67';
  const got = onTestnet4(`
    const { composeTransactionFields, bip34HeightPush } = await import('./web/btc-prose.js');
    const { parseTransaction } = await import('./web/btc-tx.js');
    const ss = ${JSON.stringify(scriptSig)};
    const tx = '01000000' + '01' + '00'.repeat(32) + 'ffffffff' + (ss.length / 2).toString(16).padStart(2, '0') + ss
      + '00000000' + '01' + '0000000000000000' + '0151' + '00000000';
    const mark = (hex) => ({ prose: '‹' + hex + '›', payloadWords: [] });
    const input = composeTransactionFields(parseTransaction(tx), 1, null, mark).inputs[0];
    console.log(JSON.stringify({ height: bip34HeightPush(ss)?.height ?? null, script: input.script, pool: input.signature?.pool ?? null }));
  `);
  assert.equal(got.height, 153726, 'the height is read as a height');
  assert.equal(got.pool, 'Samaritan mining');
  const marked = [...got.script.matchAll(/class="pool-sig" title="([^"—]*) —[^"]*">“([^”]*)”/g)].map((m) => `${m[2]} [${m[1].trim()}]`);
  assert.deepEqual(marked, ['ckpool [ckpool]', 'Samaritan mining [Samaritan mining]'], 'both hands are marked in the margin');
});

test("a script is spelled as its chain's explorer spells its address", async () => {
  // The inverse of the decode above, over the same outputs: keeping a locking
  // script files the address this spells, and an address spelled for the
  // other chain is refused by every reader of this one -- the keep vanished.
  const { scriptToAddress } = await import('../web/btc-tx.js');
  for (const [id, vectors] of Object.entries(VECTORS)) {
    for (const [address, script] of vectors) {
      assert.equal((await scriptToAddress(script, NETWORKS[id])).address, address, `${script} on ${id}`);
    }
  }
  // Samaritan's payout at block 153,726, which a testnet4 keep once filed as bc1….
  assert.equal((await scriptToAddress('00142c6c79aa13603bca9ceca6ccc7931b7f570750ce', NETWORKS.testnet4)).address,
    'tb1q93k8n2snvqau488v5mxv0ycm0atsw5xwae0w74');
});
