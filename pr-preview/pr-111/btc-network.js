// SPDX-License-Identifier: MIT OR Apache-2.0
//
// btc-network.js — which chain the book reads, and everything that differs by
// it. Every module that fetches from an explorer, keeps chain data, decodes an
// address or leans on a chain constant takes its answer from here, so the
// choice is made in one place and read the same way everywhere.
//
// The choice is made once per page load: `?network=testnet4` in the URL sets
// it (and keeps it), otherwise the reader's kept choice, otherwise mainnet.
// Changing it means reloading -- the masthead toggle (btc-chrome.js) writes
// the key and reloads -- so no fetch, archive handle or socket is ever open
// against one chain while the page believes it is reading another.
//
// Mainnet's storage suffix is empty, so every key and database a reader
// already holds keeps its name; only testnet4's are new. Chain data is kept
// apart by that suffix because a height or a key means a different block on
// each chain, and a testnet answer must never overwrite a mainnet one.
//
// Safe to import where there is no browser (the tools/ tests): no
// localStorage and no location reads as mainnet.

// The key the choice is kept under. btc-chrome.js is a classic script and
// cannot import this module, so it names the same key itself -- change one,
// change the other.
export const NETWORK_KEY = 'glossia-btc-network';

export const NETWORKS = {
  mainnet: {
    id: 'mainnet',
    label: 'Mainnet',
    // Esplora mirrors, the one that answers first used; a vanilla Esplora
    // serves the /blocks and /tx paths, only mempool.space the /v1 ones.
    esplora: ['https://blockstream.info/api', 'https://mempool.space/api'],
    mempool: 'https://mempool.space/api',
    mempoolWs: 'wss://mempool.space/api/v1/ws',
    // Blockchair's path segment for this chain, or null where it has none.
    blockchair: 'bitcoin',
    // A market prices mainnet coins and nothing else.
    hasPrice: true,
    // The curated layer -- notables, the appendix's citations, commentary, the
    // named ledgers -- is written about mainnet's passages.
    curated: true,
    // Address encoding: the bech32 human-readable part, the base58 version
    // bytes for P2PKH and P2SH, and the leading characters those bytes spell.
    hrp: 'bc',
    p2pkh: 0x00,
    p2sh: 0x05,
    base58Lead: '13',
    genesisCoinbase: '4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b',
    // [height, nTime] pairs the chain clock interpolates between; null keeps
    // btc-chaintime.js's own halving table.
    anchors: null,
    suffix: '',
  },
  testnet4: {
    id: 'testnet4',
    label: 'Testnet4',
    // Blockstream serves no testnet4 API (its /testnet4/api path answers with
    // an HTML page), so mempool.space is the only mirror.
    esplora: ['https://mempool.space/testnet4/api'],
    mempool: 'https://mempool.space/testnet4/api',
    mempoolWs: 'wss://mempool.space/testnet4/api/v1/ws',
    blockchair: null,
    hasPrice: false,
    curated: false,
    hrp: 'tb',
    p2pkh: 0x6f,
    p2sh: 0xc4,
    base58Lead: 'mn2',
    genesisCoinbase: '7aa0a7ae1e223414cb807e40cd57e667b718e42aaf9306db9102fe28912b7b4e',
    // No halving yet, and the twenty-minute rule lets blocks come faster than
    // ten minutes, so genesis alone puts block 153,726 some 195 days late --
    // past the clock's plausibility window. The second anchor is that block's
    // own nTime; past it the clock extrapolates at ten minutes again, and a
    // newer anchor belongs here as the chain moves on.
    anchors: [[0, 1714777860], [153726, 1790197567]],
    suffix: '-testnet4',
  },
};

export const DEFAULT_NETWORK = 'mainnet';

// The network a page reads, from the URL, then the kept choice, then the
// default. A URL choice is kept, so the links a reader follows stay on it.
export function chosenNetwork() {
  try {
    if (typeof location !== 'undefined') {
      const asked = new URLSearchParams(location.search).get('network');
      if (asked && NETWORKS[asked]) {
        try { localStorage.setItem(NETWORK_KEY, asked); } catch (_) { /* not kept */ }
        return asked;
      }
    }
  } catch (_) { /* no URL to read */ }
  try {
    const kept = typeof localStorage !== 'undefined' ? localStorage.getItem(NETWORK_KEY) : null;
    if (kept && NETWORKS[kept]) return kept;
  } catch (_) { /* storage unavailable */ }
  return DEFAULT_NETWORK;
}

export const NET = NETWORKS[chosenNetwork()];

// Change the chain the book reads. The page reopens bare: its address names a
// place on the chain being left, which on the other is a different block or
// none at all, and a bare page reads its own chain's place (the book resumes
// where the reader last stopped on that chain). Where storage will not keep
// the choice, the URL carries it instead.
export function switchNetwork(id) {
  if (!NETWORKS[id] || id === NET.id) return;
  let kept = false;
  try { localStorage.setItem(NETWORK_KEY, id); kept = true; } catch (_) { /* carried by the URL */ }
  location.assign(location.pathname + (kept ? '' : `?network=${id}`));
}

// A storage key or database name for chain data on the chosen network.
export const nsKey = (key, net = NET) => key + net.suffix;

// The shape of an address on a network: base58 by its leading characters,
// bech32/bech32m by its human-readable part. Shape only, no checksum. `bech32`
// is the length range of the data part after the separator. Built once per
// network and range: it is asked on every keystroke and every ledger member.
const shapes = new Map();
export function addressShape(net = NET, bech32 = '11,87') {
  const key = `${net.id}:${bech32}`;
  if (!shapes.has(key)) {
    shapes.set(key, new RegExp(`^(?:[${net.base58Lead}][1-9A-HJ-NP-Za-km-z]{25,34}|${net.hrp}1[02-9ac-hj-np-z]{${bech32}})$`));
  }
  return shapes.get(key);
}
