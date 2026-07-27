// SPDX-License-Identifier: MIT OR Apache-2.0
//
// btc-index.js — the ledgers of the Bitcoin Book: notable addresses, each a
// view of the manuscript focused on amounts. Shared by bitcoin-ledgers.html
// (the shelf), bitcoin-ledger.html (one ledger, turned address by address), and
// bitcoin-search.html (which routes an address query to its ledger). This
// module is the machinery the ledger pages share: the mapping that discovers
// an address's chapters, the store that remembers them, and the renderers that
// lay them out. (The filename keeps its index-era name so cached module graphs
// never mix builds.)
//
// The curated ledgers themselves -- which addresses the book keeps, and the
// story behind each -- are editorial work and live in btc-index-data.js under
// CC BY 4.0; they are re-exported here so importers see one module. See the
// README's License section.

import { volumeBookChapter, toRoman } from './btc-citation.js';
import { storeGet, storePut } from './btc-store.js';

export { INDEXED } from './btc-index-data.js';

// A loose shape test for the address forms the chain has used: base58 P2PKH
// ('1…') and P2SH ('3…'), and bech32/bech32m ('bc1…', matched lowercase --
// the all-uppercase QR form is normalized by the caller). Shape only, no
// checksum: its job is routing a query to the index page, whose chain lookup
// is the real validator.
export const isAddress = (s) =>
  /^([13][1-9A-HJ-NP-Za-km-z]{25,34}|bc1[02-9ac-hj-np-z]{11,87})$/.test(s);

// ── The kept-ledger registry ──────────────────────────────────────────────
// The reader's own shelf: ledgers kept from their pages, each a titled set
// of addresses. Older entries kept a single `address`; they read back as
// one-address ledgers, so nothing already kept is lost to the shape change.
const KEPT_KEY = 'glossia-btc-ledgers';
export function keptLedgers() {
  try {
    const v = JSON.parse(localStorage.getItem(KEPT_KEY));
    if (!Array.isArray(v)) return [];
    return v
      .map((k) => ({
        title: typeof k?.title === 'string' ? k.title : '',
        addresses: (Array.isArray(k?.addresses) ? k.addresses : [k?.address]).filter(isAddress),
      }))
      .filter((k) => k.addresses.length);
  } catch { return []; }
}
export function saveKeptLedgers(list) {
  try { localStorage.setItem(KEPT_KEY, JSON.stringify(list)); } catch (_) { /* unavailable */ }
}

// Two ledgers are the same when they hold the same addresses, in any order.
export const sameAddresses = (a, b) => a.length === b.length && a.every((x) => b.includes(x));

// Resolve the ledger a URL names from its address list. One address that
// belongs to a curated or kept ledger opens that whole ledger, positioned
// on the named address; a list is matched as a set; anything unrecognized
// opens as its own unkept ledger of exactly the addresses given.
export function ledgerFor(list) {
  for (const [pool, curated] of [[INDEXED, true], [keptLedgers(), false]]) {
    const hit = pool.find((e) => (list.length === 1
      ? e.addresses.includes(list[0])
      : sameAddresses(e.addresses, list)));
    if (hit) {
      return { title: hit.title, addresses: hit.addresses, curated,
               at: Math.max(0, hit.addresses.indexOf(list[0])) };
    }
  }
  return { title: '', addresses: list, curated: false, at: 0 };
}

// A citation link into the book for one appearance: the transaction's chapter
// opens by txid, and the book resolves its exact §section itself. An output
// index deepens the landing (&out=N): the book brings that output to the
// top, the same landing its own marginalia make.
export const citeHref = (txid, out) =>
  `bitcoin-book.html?txid=${txid}${out != null ? `&out=${out}` : ''}`;

// The address's scriptPubKey, as hex: its on-chain identity, and the exact
// bytes the book Glossia-encodes wherever a chapter pays this address -- so a
// title page that encodes these bytes reads the same prose the chapters do.
// Handles the shapes isAddress admits: base58 P2PKH/P2SH (decoded without the
// checksum pass -- shape plus the chain's own answer already validate an
// address this module is asked about) and bech32/bech32m v0/v1 witness forms
// (whose checksum is pure arithmetic, so it *is* checked). Null when the form
// doesn't decode.
const B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const B32 = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
const toHex = (bytes) => bytes.map((b) => b.toString(16).padStart(2, '0')).join('');
function base58Payload(s) {
  let n = 0n;
  for (const c of s) {
    const i = B58.indexOf(c);
    if (i < 0) return null;
    n = n * 58n + BigInt(i);
  }
  const bytes = [];
  for (; n > 0n; n /= 256n) bytes.unshift(Number(n % 256n));
  for (const c of s) { if (c !== '1') break; bytes.unshift(0); }
  if (bytes.length !== 25) return null;               // version + hash160 + checksum
  return { version: bytes[0], hash: bytes.slice(1, 21) };
}
function bech32Polymod(values) {
  const GEN = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
  let chk = 1;
  for (const v of values) {
    const b = chk >> 25;
    chk = ((chk & 0x1ffffff) << 5) ^ v;
    for (let i = 0; i < 5; i++) if ((b >> i) & 1) chk ^= GEN[i];
  }
  return chk;
}
function bech32Witness(addr) {
  const data = [...addr.slice(3)].map((c) => B32.indexOf(c));   // past the 'bc1' hrp+separator
  if (data.includes(-1) || data.length < 7) return null;
  const hrpExpand = [3, 3, 0, 2, 3];                  // 'bc' expanded, per BIP173
  const version = data[0];
  const constant = version === 0 ? 1 : 0x2bc830a3;    // bech32 for v0, bech32m above
  if (bech32Polymod(hrpExpand.concat(data)) !== constant) return null;
  const program = [];
  let acc = 0, bits = 0;
  for (const v of data.slice(1, -6)) {
    acc = (acc << 5) | v;
    bits += 5;
    if (bits >= 8) { bits -= 8; program.push((acc >> bits) & 0xff); }
  }
  return { version, program };
}
export function addressScriptHex(address) {
  if (address.startsWith('bc1')) {
    const w = bech32Witness(address);
    if (!w || !w.program.length) return null;
    const op = w.version === 0 ? '00' : (0x50 + w.version).toString(16);
    return op + w.program.length.toString(16).padStart(2, '0') + toHex(w.program);
  }
  const p = base58Payload(address);
  if (!p) return null;
  if (p.version === 0x00) return '76a914' + toHex(p.hash) + '88ac';   // P2PKH
  if (p.version === 0x05) return 'a914' + toHex(p.hash) + '87';       // P2SH
  return null;
}

// A net satoshi amount in the book's own money notation (formatBtc in
// btc-prose.js -- not imported, since the prose module drags in the WASM
// engine): comma-grouped whole part, always the full eight decimal places so a
// right-aligned column aligns on the point, the ₿ sign trailing, a bare 0 ₿
// for nothing-net. Signed, since an index line reads as a ledger: what the
// chapter paid the address (+) or spent from it (−).
export function formatNetBtc(sats) {
  if (!sats) return '0 ₿';
  const sign = sats < 0 ? '−' : '+';
  const abs = Math.abs(sats);
  const whole = Math.floor(abs / 1e8).toLocaleString('en-US');
  const frac = String(abs % 1e8).padStart(8, '0');
  return `${sign}${whole}.${frac} ₿`;
}

// The same notation unsigned: a balance is what the address holds, not a
// ledger movement, so it carries no sign.
export const formatBalanceBtc = (sats) => formatNetBtc(sats).replace(/^[+−]/, '');

// The reconciliation test -- double-entry proof of a finished sync. Over a
// truly complete confirmed history, the ledger identity is exact: the sum of
// every entry (credits less debits) IS funded-minus-spent, the balance. So
// equality proves the map whole, and inequality names it still syncing -- a
// capped walk, a block that arrived mid-mapping, or a mirror that answered
// short. The pages gate a ledger behind this: nothing is displayed or
// entered until its numbers add up (the next revalidation converges it).
export const ledgerSum = (data) => data.entries.reduce((n, c) => n + c.sats, 0);
export const reconciled = (data) =>
  !!data && data.complete && data.balance != null && ledgerSum(data) === data.balance;

// ---------------------------------------------------------------------------
// The mapping, the store, and the renderers shared by the index-family pages.
//
// An address's *map* grows as the reader reads it. Esplora instances feed
// it, newest first: opening a ledger fetches the latest page (resolveLine),
// and each thumb deeper into the past fetches exactly one more
// (extendLine) -- there is no automatic backfill; exploration is the sync.
// Because past blocks are closed -- a transaction can never be inserted
// into mined history -- every page found is banked for good: found data
// survives any interruption, revisits resume at the banked cursor rather
// than restart, and a later top-up reads only above the banked frontier,
// which cannot overlap what's kept. Unreachable mirrors leave the stored
// state standing -- however deep it reaches -- or, with nothing stored,
// the syncing gate.

// --- Where the chain is asked: Esplora-compatible endpoints (Blockstream,
// mempool.space, or the reader's own node) -- the same API family, and the
// same stored settings, as the book's reading pages, so one Data source
// choice serves the whole app. Custom endpoints and the selected preference
// live in localStorage and are read at call time, so a change applies from
// the very next fetch. (The Blockbook pool served the mapping for a while;
// its rejections arrive without CORS headers, so from a browser every
// failure -- throttle, block, outage -- collapsed to a nameless
// "unreachable". Esplora's error responses keep their names, and its
// per-transaction pagination suits the newest-first backfill.)
export const DEFAULT_ESPLORA = ['https://blockstream.info/api', 'https://mempool.space/api'];
const ENDPOINTS_KEY = 'glossia-btc-endpoints';   // custom endpoints: [{label,url}] -- the book page's own store
const SELECTED_KEY = 'glossia-btc-endpoint';     // preferred endpoint url
export function esploraCustom() {
  try {
    const v = JSON.parse(localStorage.getItem(ENDPOINTS_KEY));
    return Array.isArray(v) ? v.map((m) => (m && typeof m.url === 'string' ? m.url : null)).filter(Boolean) : [];
  } catch { return []; }
}
function esploraMirrors() {
  const all = [...DEFAULT_ESPLORA, ...esploraCustom()];
  let sel = null;
  try { sel = localStorage.getItem(SELECTED_KEY); } catch { /* unavailable */ }
  return sel && all.includes(sel) ? [sel, ...all.filter((u) => u !== sel)] : all;
}
export const esploraSelected = () => esploraMirrors()[0];
// The settings writer: pass only what changes; null restores the default.
// Custom endpoints are written in the book page's {label, url} shape, so
// either page's picker reads the other's additions.
const hostOf = (url) => { try { return new URL(url).host; } catch { return url; } };
export function setEsploraSettings({ custom, selected } = {}) {
  try {
    if (custom !== undefined) localStorage.setItem(ENDPOINTS_KEY, JSON.stringify(custom.map((url) => ({ label: hostOf(url), url }))));
    if (selected !== undefined) {
      if (selected === null) localStorage.removeItem(SELECTED_KEY);
      else localStorage.setItem(SELECTED_KEY, selected);
    }
  } catch { /* unavailable; settings just don't stick */ }
}

// One esplora request, with patience: a throttle (429) honors its
// Retry-After (capped -- past a few seconds the UI state serves better than
// a hang) and a server-side stumble (5xx) gets brief backed-off retries
// before the mirror is given up on -- public instances rate-limit, and one
// refused page must not fail a whole walk. A definitive refusal (404 and
// kin) returns at once. The last failure's nature is kept so the pages can
// name it: a throttle reads differently from a refusal or a dead network.
let lastFailure = null;
export function chainFailureText() {
  if (lastFailure?.status === 429) return 'throttled (429)';
  if (lastFailure?.status) return `refused (${lastFailure.status})`;
  return typeof navigator !== 'undefined' && navigator.onLine === false ? 'offline' : 'unreachable';
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function esploraJson(mirror, path) {
  for (let attempt = 0; ; attempt++) {
    let delay = 400 * 2 ** attempt + Math.random() * 200;
    try {
      const res = await fetch(mirror + path);
      if (res.ok) { lastFailure = null; return await res.json(); }
      lastFailure = { status: res.status };
      if (res.status < 500 && res.status !== 429) return null;
      const ra = Number(res.headers.get('Retry-After'));
      if (res.status === 429 && ra > 0) delay = Math.min(ra * 1000, 5000);
    } catch { lastFailure = { network: true }; /* unreachable or CORS-refused */ }
    if (attempt >= 2) return null;
    await sleep(delay);
  }
}

// One page of an address's confirmed history, newest first: 25 transactions
// with their full inputs and outputs. The cursor is the last transaction
// already walked -- esplora resumes strictly after it, a bookmark into
// closed history that no new arrival can shift (and one that means the same
// thing on every mirror, so a resumed walk is free to switch).
const ESPLORA_PAGE = 25;
const chainPage = (address, lastSeen) =>
  `/address/${address}/txs/chain${lastSeen ? `/${lastSeen}` : ''}`;

// An esplora transaction's touches on the address: what its outputs paid
// in (credit) and its inputs drew out (debit), kept apart -- a ledger does
// not net within a transaction, let alone within a block. One record per
// transaction; the entries derive from it. Unconfirmed transactions are
// left out -- the map holds mined history only.
function esploraTouches(txs, address) {
  const recs = [];
  for (const t of txs || []) {
    if (!t.status?.confirmed || !(t.status.block_height > 0)) continue;
    let credit = 0, debit = 0, out = null;
    (t.vout || []).forEach((o, i) => {
      if (o.scriptpubkey_address === address) {
        credit += Number(o.value || 0);
        if (out === null) out = i;   // the first paying output: the citation's .index
      }
    });
    for (const i of t.vin || []) if (i.prevout?.scriptpubkey_address === address) debit += Number(i.value || 0);
    recs.push({ height: t.status.block_height, txid: t.txid, time: t.status.block_time || null, credit, debit, out });
  }
  return recs;
}

// The address's chain state -- confirmed balance and transaction count --
// straight from /address/:addr, no memory: the mapper reconciles against
// the chain's now, not a remembered figure.
async function chainState(address) {
  for (const mirror of esploraMirrors()) {
    const j = await esploraJson(mirror, `/address/${address}`);
    const c = j?.chain_stats;
    if (c && typeof c.tx_count === 'number') {
      return { balance: Number(c.funded_txo_sum) - Number(c.spent_txo_sum), txCount: c.tx_count };
    }
  }
  return null;
}

// Records -> ledger entries, ascending. Each entry is one *side* of one
// transaction: its outputs to the address (a credit, positive) or its inputs
// from it (a debit, negative) -- never a block's net: blocks hold many
// transactions, and an entry references what moved, not where it stood. A
// transaction that both receives and spends makes two entries, credit
// listed first; one that names the address without moving value posts a
// bare 0, so the map stays as complete as the count it reconciles against.
function buildEntries(records) {
  const entries = [];
  for (const r of records) {
    // A credit entry carries its output index -- the .index of a full
    // citation (§section.output) and the book's landing for it. Debits are
    // departures through inputs; their citation stops at the section.
    if (r.credit > 0) entries.push({ height: r.height, txid: r.txid, time: r.time, sats: r.credit, ...(r.out != null ? { out: r.out } : {}) });
    if (r.debit > 0) entries.push({ height: r.height, txid: r.txid, time: r.time, sats: -r.debit });
    if (!r.credit && !r.debit) entries.push({ height: r.height, txid: r.txid, time: r.time, sats: 0 });
  }
  return entries.sort((a, b) =>
    a.height - b.height || (a.txid < b.txid ? -1 : a.txid > b.txid ? 1 : b.sats - a.sats));
}


// --- The store: maps live in IndexedDB (a complete map of a busy address
// runs to megabytes -- past localStorage's means), with a small localStorage
// registry of last-use times so pruning never has to read the maps
// themselves. Bounded to the most recently used addresses so ad-hoc queries
// can't grow the store without end.

// Ask the browser to treat this origin's storage as persistent -- installed
// apps are usually granted it silently -- so what is kept here survives
// storage pressure instead of standing in the "best effort" eviction line.
try { navigator.storage?.persist?.().catch(() => { /* denied: merely evictable */ }); } catch (_) { /* unavailable */ }
const DB_NAME = 'glossia-btc-index';
const DB_STORE = 'lines';
const REGISTRY_KEY = 'glossia-btc-index-registry';
const STORE_MAX_ADDRESSES = 12;
// The pre-anthology localStorage cache is superseded; clear it once.
try { localStorage.removeItem('glossia-btc-index-cache'); } catch (_) { /* unavailable */ }

let dbPromise = null;
function db() {
  if (!dbPromise) dbPromise = new Promise((resolve) => {
    try {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(DB_STORE);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch { resolve(null); }
  });
  return dbPromise;
}
async function idb(mode, op) {
  const d = await db();
  if (!d) return null;
  return new Promise((resolve) => {
    try {
      const tx = d.transaction(DB_STORE, mode);
      const req = op(tx.objectStore(DB_STORE));
      // A get()'s value rides on the request; a put/delete has none to give.
      // A missing record resolves null, never a truthy sentinel -- callers
      // distinguish "no stored map" from a map by truthiness.
      tx.oncomplete = () => resolve(req ? req.result ?? null : null);
      tx.onerror = () => resolve(null);
    } catch { resolve(null); }
  });
}
const readRegistry = () => {
  try { const v = JSON.parse(localStorage.getItem(REGISTRY_KEY)); return v && typeof v === 'object' ? v : {}; }
  catch { return {}; }
};

// The stored map for an address, if any -- render it instantly, then let
// resolveLine confirm or extend it. Lines are versioned: v2 moved per-block
// chapters to per-side entries; v3 moved the backfill cursor from a
// blockbook height (`low`) to an esplora txid (`lastSeen`). A complete v2
// line carries no cursor and its entries are identical in shape, so it
// upgrades in place -- nothing already synced refetches. An incomplete v2
// checkpoint belongs to the old walk and reads as absent; the next
// resolution maps afresh, newest first.
const LINE_V = 3;
export async function cachedLine(address) {
  const line = await idb('readonly', (s) => s.get(address));
  if (!line) return null;
  if (line.v === LINE_V) return line;
  if (line.v === 2 && line.complete) return { ...line, v: LINE_V };
  return null;
}
async function saveLine(address, data) {
  await idb('readwrite', (s) => s.put(data, address));
  const reg = readRegistry();
  reg[address] = data.at;
  const keep = Object.entries(reg).sort((a, b) => b[1] - a[1]);
  for (const [addr] of keep.slice(STORE_MAX_ADDRESSES)) {
    await idb('readwrite', (s) => s.delete(addr));
  }
  try { localStorage.setItem(REGISTRY_KEY, JSON.stringify(Object.fromEntries(keep.slice(0, STORE_MAX_ADDRESSES)))); }
  catch (_) { /* unavailable; the store just prunes less precisely */ }
}

// --- Resolution: aim for the complete map, keep it current for pennies.

// A cached line -- complete or thumbed-partway -- tops up from the tip: new
// appearances can only lie in blocks above the highest banked one, so the
// walk reads newest pages until it steps below that frontier. The address
// totals are checked first, making the common case -- nothing new -- one
// small request; and the delta is all pages or nothing, since a delta with
// a hole would corrupt the map. Heights above the frontier are disjoint
// from what's banked by construction, so merging is concatenation, and the
// line's completeness (and its backfill cursor) ride through untouched.
// Unreachable mirrors leave the stored line standing, current as of its
// writing.
async function topUp(address, cached, onProgress) {
  const frontier = (cached.entries[cached.entries.length - 1]?.height ?? 0) + 1;
  outer: for (const mirror of esploraMirrors()) {
    const j = await esploraJson(mirror, `/address/${address}`);
    const cs = j?.chain_stats;
    if (!cs || typeof cs.tx_count !== 'number') continue;
    const txCount = cs.tx_count;
    const balance = Number(cs.funded_txo_sum) - Number(cs.spent_txo_sum);
    if (txCount === cached.txCount && balance === cached.balance) return cached;
    let cursor = null;
    const fresh = [];
    for (;;) {
      const page = await esploraJson(mirror, chainPage(address, cursor));
      if (!Array.isArray(page)) continue outer;
      const recs = esploraTouches(page, address);
      fresh.push(...recs.filter((r) => r.height >= frontier));
      try { onProgress?.(cached.walked + fresh.length, txCount); } catch (_) { /* a watcher's error is not the map's */ }
      if (page.length < ESPLORA_PAGE || recs.some((r) => r.height < frontier)) break;
      cursor = page[page.length - 1].txid;
    }
    const entries = cached.entries.concat(buildEntries(fresh));
    const data = { v: LINE_V, at: Date.now(), txCount, balance, walked: cached.walked + fresh.length, complete: !!cached.complete, entries };
    if (!data.complete) data.lastSeen = cached.lastSeen;
    await saveLine(address, data);
    return data;
  }
  return cached;
}

// One page deeper into the past: the next 25 confirmed transactions after
// the banked cursor (the last txid already walked -- closed history, so
// the pagination never shifts, and the cursor means the same thing on
// every mirror), banked and returned. This is the whole backfill now:
// nothing walks the history on its own -- the reader thumbing down the
// ledger's pages is what reaches deeper, one prefetched page at a time,
// and every page found is kept. The final short page marks the line
// complete: the record read to its beginning.
async function extendOnce(address) {
  const cached = await cachedLine(address);
  if (!cached || cached.complete || cached.lastSeen == null) return cached;
  for (const mirror of esploraMirrors()) {
    const page = await esploraJson(mirror, chainPage(address, cached.lastSeen));
    if (!Array.isArray(page)) continue;
    const recs = esploraTouches(page, address);
    const walked = cached.walked + recs.length;
    // A short page ends the record -- and so does the count: every known
    // transaction walked means nothing older remains, sparing the empty
    // probe a record sized an exact multiple of the page would otherwise
    // cost. (Arrivals since the count was taken land above the head; the
    // next visit's top-up carries them.)
    const complete = page.length < ESPLORA_PAGE || (cached.txCount > 0 && walked >= cached.txCount);
    const data = { v: LINE_V, at: Date.now(), txCount: cached.txCount, balance: cached.balance,
                   walked, complete, entries: buildEntries(recs).concat(cached.entries) };
    if (!complete) data.lastSeen = page[page.length - 1].txid;
    await saveLine(address, data);
    return data;
  }
  return cached;   // unreachable: the line stands as it was
}
// Single-flight per address: a reader's scroll and the fetch-ahead may ask
// together, and both must share one page rather than fetch it twice.
const extending = new Map();
export function extendLine(address) {
  if (!extending.has(address)) {
    extending.set(address, extendOnce(address).finally(() => extending.delete(address)));
  }
  return extending.get(address);
}

// Resolve an address's head: the stored line -- however deep the reader has
// thumbed it -- refreshed from the tip (new arrivals land above the banked
// frontier), or, with nothing stored, the first page of its history: the
// latest 25 transactions and the address totals. No backfill runs on its
// own; deeper pages arrive only as the reader thumbs down (extendLine).
// Returns the stored state unchanged when the mirrors are unreachable
// (offline reads still work), null when there's nothing at all to show.
// `onProgress(gathered, total)` ticks when the head lands.
export async function resolveLine(address, onProgress) {
  const cached = await cachedLine(address);
  if (cached) return topUp(address, cached, onProgress);
  for (const mirror of esploraMirrors()) {
    const j = await esploraJson(mirror, `/address/${address}`);
    const cs = j?.chain_stats;
    if (!cs || typeof cs.tx_count !== 'number') continue;
    const page = await esploraJson(mirror, chainPage(address, null));
    if (!Array.isArray(page)) continue;
    const recs = esploraTouches(page, address);
    // Short page or every known transaction walked: the record is whole.
    const complete = page.length < ESPLORA_PAGE || (cs.tx_count > 0 && recs.length >= cs.tx_count);
    const data = { v: LINE_V, at: Date.now(), txCount: cs.tx_count,
                   balance: Number(cs.funded_txo_sum) - Number(cs.spent_txo_sum),
                   walked: recs.length, complete, entries: buildEntries(recs) };
    if (!complete) data.lastSeen = page[page.length - 1].txid;
    await saveLine(address, data);
    try { onProgress?.(data.walked, data.txCount); } catch (_) { /* a watcher's error is not the map's */ }
    return data;
  }
  return null;
}

// The lightest possible ask: the address's chain state -- balance and
// confirmed transaction count -- one small request, no transaction pages.
// The shelf shows balances with this alone, starting nobody's sync; the
// mapping begins only when a reader steps into the ledger itself.
//
// The balance memory: a probe's answer is good for ten minutes -- balances
// move at chain speed, roughly a block, not at page-load speed -- so a
// shelf revisited within that window asks the network nothing. And the
// last answer is never thrown away: when every source fails, the state
// comes back marked `stale: true` -- last known, shown quietly -- rather
// than nothing at all. Kept in localStorage (a few dozen bytes per
// address), pruned oldest-first past a generous cap.
const BALANCE_KEY = 'glossia-btc-balances';
const BALANCE_TTL = 10 * 60 * 1000;
const BALANCE_MAX = 48;
const balanceCache = () => {
  try { const v = JSON.parse(localStorage.getItem(BALANCE_KEY)); return v && typeof v === 'object' ? v : {}; }
  catch { return {}; }
};
function keepBalance(address, state) {
  try {
    const all = balanceCache();
    all[address] = { balance: state.balance, txCount: state.txCount, at: Date.now() };
    const keys = Object.keys(all);
    if (keys.length > BALANCE_MAX) {
      keys.sort((a, b) => all[a].at - all[b].at);
      for (const k of keys.slice(0, keys.length - BALANCE_MAX)) delete all[k];
    }
    localStorage.setItem(BALANCE_KEY, JSON.stringify(all));
  } catch (_) { /* full or unavailable; the next probe asks again */ }
}
// The remembered state without any network: fresh within the window,
// `stale: true` past it, null if this address was never answered.
export function lastKnownState(address) {
  const e = balanceCache()[address];
  if (!e || typeof e.balance !== 'number') return null;
  return Date.now() - e.at < BALANCE_TTL
    ? { balance: e.balance, txCount: e.txCount }
    : { balance: e.balance, txCount: e.txCount, stale: true };
}

export async function addressState(address) {
  const known = lastKnownState(address);
  if (known && !known.stale) return known;
  const state = await chainState(address);
  if (state) { keepBalance(address, state); return state; }
  return known;   // every source failed: the last answer, marked stale -- or null
}

// The held view: the address's confirmed UTXOs -- the chain's own bookmarks,
// each unspent output resting where its transaction left it. This is the
// mutable complement of the map: spends shrink it, so it is a snapshot,
// fetched fresh beside every resolution and never stored. Returns the sum,
// the coin count, and sats-still-resting by txid (a UTXO belongs to a
// transaction's outputs, so the join to credit entries is exact), or null
// when the mirrors can't be had. Its sum is the third reconciliation
// identity (Σ held = balance = Σ entries); callers display the held view
// only when it agrees, the same discipline the gate keeps.
export async function heldCoins(address) {
  for (const mirror of esploraMirrors()) {
    const utxos = await esploraJson(mirror, `/address/${address}/utxo`);
    if (!Array.isArray(utxos)) continue;
    const byTxid = new Map();
    let sum = 0, count = 0;
    for (const u of utxos) {
      if (!u.status?.confirmed) continue;   // the held view is mined history only
      const sats = Number(u.value || 0);
      sum += sats;
      count++;
      byTxid.set(u.txid, (byTxid.get(u.txid) ?? 0) + sats);
    }
    return { sum, count, byTxid };
  }
  return null;
}

// --- The ledger's periods: entries bucketed by the calendar quarter of
// their block time -- the organization accountants keep, years then
// quarters, in place of the manuscript's own volumes and books (every entry
// still cites its canonical place in those; the citation is the folio
// reference, the period is just the filing). Buckets are keyed rather than
// run-length: block timestamps may wobble a couple of hours against height
// order near a boundary, and a keyed bucket absorbs the straggler instead
// of splitting the quarter in two. Only a complete map gets periods (the
// gate's rule); a closed quarter is as append-only as the chain that
// timestamps it.
export function periods(data) {
  if (!data?.complete || !data.entries.length) return null;
  const byKey = new Map();
  for (const c of data.entries) {
    const d = new Date((c.time ?? 0) * 1000);
    const year = d.getUTCFullYear();
    const q = Math.floor(d.getUTCMonth() / 3) + 1;
    const key = year * 10 + q;
    let b = byKey.get(key);
    if (!b) { b = { year, q, entries: [], sats: 0 }; byKey.set(key, b); }
    b.entries.push(c);
    b.sats += c.sats;
  }
  const quarters = [...byKey.values()].sort((a, b) => a.year - b.year || a.q - b.q);
  const years = [];
  for (const qt of quarters) {
    let y = years[years.length - 1];
    if (!y || y.year !== qt.year) { y = { year: qt.year, quarters: [], sats: 0, count: 0 }; years.push(y); }
    y.quarters.push(qt);
    y.sats += qt.sats;
    y.count += qt.entries.length;
  }
  return years;
}

// --- Renderers. The pages that call these share the idx-*/sp-* styles the
// class names refer to; DOM-building lives here rather than in each page so
// the index and the anthologies stay the same reading.

// The flat line: the map as one nested run under canonical headers -- the
// index's skim of an entry, and an incomplete anthology's honest rendering.
// maxRows keeps the most recent rows (the map is ascending, so the cut is
// the older head) with a leading note pointing at the anthology for the
// whole; the trailing note names what an incomplete map never walked.
// A run of entries, one line each, most recent first (the whole ledger
// reads newest-down, the direction the record is explored): the fully
// resolved reference leading (Roman volume, β book, ■ chapter -- the
// citation names every level itself, so the run needs no headers of any
// kind), then the bookkeeping columns -- debit, credit, status. APPENDED
// to el, so an endless scroll just keeps appending. Grouping, temporal or
// otherwise, lives on the ledger's entries leaf. `held` feeds the status
// column from the chain's own bookmarks. The callers own any clearing and
// any notes around the run.
export function renderRows(el, entries, held = null) {
  for (const c of [...entries].reverse()) {
    el.append(lineRow({ ...c, place: volumeBookChapter(c.height) }, held));
  }
}

export function renderLine(el, data, maxRows = Infinity) {
  el.replaceChildren();
  if (!data) { lineNote(el, '—'); return; }
  let rows = data.entries;
  if (!rows.length) { lineNote(el, 'no appearances yet'); return; }
  const cut = rows.length - maxRows;
  if (cut > 0) rows = rows.slice(cut);
  renderRows(el, rows);
  // Newest-first, so anything cut or never walked lies below the rows.
  if (cut > 0) lineNote(el, `… ${cut.toLocaleString('en-US')} earlier entries, collected in the ledger`);
  // An incomplete map names what it left behind; the count is of
  // transactions, which is what the chain counts (several may share a
  // chapter above).
  if (data.walked < data.txCount) {
    lineNote(el, `… the latest ${data.walked.toLocaleString('en-US')} of ${data.txCount.toLocaleString('en-US')} transactions`);
  }
}

// The ledger rendering: a summary leaf first -- years then quarters, the
// most recent first (the whole ledger reads newest-down, the direction the
// record is explored), one row per quarter with its entry count and net,
// each an anchor into the entries below; the reader's bookmarked
// references sit inline beneath the quarters that hold them, flying the
// same ribbon they fly in the book; and the summary rules off on the
// closing balance. Then the entries themselves, newest first: date, the
// citation into the manuscript (the folio reference, compressed against
// the previous entry's -- volume and book named only when they change),
// the entry's net, and the running balance -- posted in height order over
// a reconciled map, so the TOP row carries exactly the chain's current
// balance and the record drains back toward its beginning. Every entry
// opens bitcoin-book.html at its transaction; entry rows attach in
// animation-frame chunks so a giant ledger doesn't jank its first paint.
// Falls back to the flat line (and returns false) when the map is
// incomplete and no periods may be drawn.
// opts.held (heldCoins' byTxid map, verified against the balance by the
// caller) marks the entries with the chain's own bookmarks: a credit whose
// outputs have all moved on reads dimmed (debits, being departures, always
// do); where value still rests, full ink -- and a quarter dims likewise when
// nothing from it remains outstanding.
const BOOKMARK_RIBBON = '<svg viewBox="0 0 12 16"><path fill="currentColor" d="M0 0h12v16l-6-4-6 4z"/></svg>';
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export function renderLedger(el, data, { bookmarks = [], held = null } = {}) {
  // Running balances post in entry order -- the ledger's true posting order
  // -- so the final balance is exactly the one the gate proved. Two entries
  // can share a height and even a txid, so the balance rides on a copy of
  // each entry rather than keying a map.
  let bal = 0;
  const posted = data.entries.map((c) => ({ ...c, bal: (bal += c.sats) }));
  const years = periods({ ...data, entries: posted });
  if (!years) { renderLine(el, data); return false; }
  el.replaceChildren();
  const anchor = (y, q) => `y${y}q${q}`;
  // Balances post oldest-first (their true order); the reading runs
  // newest-first, so every listing below iterates the periods reversed.
  const recent = [...years].reverse().map((y) => ({ ...y, quarters: [...y.quarters].reverse() }));

  const toc = document.createElement('div'); toc.className = 'sp-toc';
  const summaryHead = lineHead('sp-eyebrow', 'Summary');
  summaryHead.id = 'anth-contents';
  toc.append(summaryHead);
  for (const y of recent) {
    toc.append(lineHead('idx-vol', String(y.year)));
    for (const qt of y.quarters) {
      const row = document.createElement('a');
      row.className = 'sp-row';
      if (held && !qt.entries.some((c) => c.sats > 0 && (held.get(c.txid) ?? 0) > 0)) row.classList.add('spent');
      row.href = `#${anchor(qt.year, qt.q)}`;
      const label = document.createElement('span'); label.className = 'sp-label';
      label.textContent = `Q${qt.q}`;
      const count = document.createElement('span'); count.className = 'sp-count';
      count.textContent = `${qt.entries.length.toLocaleString('en-US')} §`;
      const amt = document.createElement('span'); amt.className = 'idx-amt sp-amt';
      amt.textContent = formatNetBtc(qt.sats);
      row.append(label, count, amt);
      toc.append(row);
      // The reader's own bookmarks that fall in this quarter's blocks,
      // newest first like everything else, each opening the book at its
      // reference.
      const heights = new Set(qt.entries.map((c) => c.height));
      for (const bm of bookmarks.filter((m) => heights.has(m.height)).sort((a, z) => z.height - a.height)) {
        const bmRow = document.createElement('a');
        bmRow.className = 'sp-bm';
        bmRow.href = citeHref(bm.hex);
        const t = document.createElement('span'); t.className = 'sp-bm-title';
        const rib = document.createElement('span'); rib.className = 'toc-bm';
        rib.setAttribute('aria-label', 'your bookmark');
        rib.innerHTML = BOOKMARK_RIBBON;
        t.append(rib, document.createTextNode(bm.title));
        const ref = document.createElement('span'); ref.className = 'sp-bm-ref';
        ref.textContent = `■${volumeBookChapter(bm.height).chapter}` + (bm.pos != null ? ` §${bm.pos + 1}` : '');
        bmRow.append(t, ref);
        toc.append(bmRow);
      }
    }
  }
  // The summary rules off on the closing balance.
  const closeRow = document.createElement('a');
  closeRow.className = 'sp-row';
  closeRow.href = '#anth-index';
  const closeLabel = document.createElement('span'); closeLabel.className = 'sp-label';
  closeLabel.textContent = 'Closing balance';
  const closeCount = document.createElement('span'); closeCount.className = 'sp-count';
  closeCount.textContent = `${data.entries.length.toLocaleString('en-US')} §`;
  const closeAmt = document.createElement('span'); closeAmt.className = 'idx-amt sp-amt';
  closeAmt.textContent = formatBalanceBtc(data.balance ?? bal);
  closeRow.append(closeLabel, closeCount, closeAmt);
  toc.append(closeRow);
  el.append(toc);

  const entriesHead = lineHead('sp-eyebrow', 'Entries');
  entriesHead.id = 'anth-index';
  el.append(entriesHead);
  const nodes = [];
  for (const y of recent) {
    nodes.push(lineHead('idx-vol', String(y.year)));
    for (const qt of y.quarters) {
      const h = lineHead('idx-book', `Q${qt.q} ${qt.year}`);
      h.id = anchor(qt.year, qt.q);
      nodes.push(h);
      let lastVol = 0, lastBook = 0;
      for (const c of [...qt.entries].reverse()) {
        const place = volumeBookChapter(c.height);
        nodes.push(ledgerRow(c, place, c.bal, lastVol, lastBook, held));
        lastVol = place.volume; lastBook = place.book;
      }
    }
  }
  const CHUNK = 800;
  let i = 0;
  (function attach() {
    const frag = document.createDocumentFragment();
    for (const end = Math.min(i + CHUNK, nodes.length); i < end; i++) frag.append(nodes[i]);
    el.append(frag);
    if (i < nodes.length) requestAnimationFrame(attach);
  })();
  return true;
}

// One ledger entry: date · citation · net · running balance. The citation
// compresses against its predecessor -- Roman volume and β book named only
// when they change -- the tail-reference idiom carried into a date-ordered
// listing.
function ledgerRow(c, place, balance, lastVol, lastBook, held) {
  const row = document.createElement('a');
  row.className = 'idx-row entry';
  row.href = citeHref(c.txid);
  if (held) {
    // A UTXO belongs to a transaction's outputs, so only a credit entry can
    // still be held; a debit is a departure by nature and reads dimmed.
    const resting = c.sats > 0 ? held.get(c.txid) ?? 0 : 0;
    if (resting > 0) row.title = `still held: ${formatBalanceBtc(resting)}`;
    else row.classList.add('spent');
  }
  const when = document.createElement('span'); when.className = 'idx-when';
  const d = c.time ? new Date(c.time * 1000) : null;
  when.textContent = d ? `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}` : '—';
  const r = document.createElement('span'); r.className = 'idx-ref';
  const parts = [];
  if (place.volume !== lastVol) parts.push(toRoman(place.volume));
  if (place.book !== lastBook || place.volume !== lastVol) parts.push(`β${place.book}`);
  parts.push(`■${place.chapter}`);
  r.textContent = parts.join(' ');
  const amt = document.createElement('span'); amt.className = 'idx-amt';
  amt.textContent = formatNetBtc(c.sats);
  const rb = document.createElement('span'); rb.className = 'idx-bal';
  rb.textContent = formatBalanceBtc(balance);
  rb.title = 'balance after this chapter';
  row.append(when, r, amt, rb);
  return row;
}

// The section of a transaction within its chapter -- the § of a full
// citation -- read from the archive ALONE, never fetched: the book
// archives every placement it resolves (and the contents page its own),
// so sections fill in as the reader actually visits the cited paragraphs.
// The record makes no lookups of its own -- a thousand rows cost nothing
// -- and an unknown section simply waits to be read.
export async function sectionOf(txid) {
  const kept = await storeGet('citations', txid) ?? await storeGet('placements', txid);
  return kept && Number.isInteger(kept.pos) ? kept.pos : null;
}

// One record line: the citation whole, then debit, credit, status. An
// entry is one side of one transaction, so exactly one amount column
// carries ink (a zero-value touch posts a bare 0 credit). Status reads
// the chain's own bookmarks: `unspent` while any of a credit's coins
// still rest at the address, `spent` once the value has moved on (a debit
// being a departure by nature); it stays silent while the UTXO snapshot
// hasn't agreed with the chain -- the verdict waits, never guesses.
// (`pending` is reserved for mempool transactions, which the map doesn't
// carry yet.) A zero-value touch carries no coin to have a status.
function lineRow({ txid, sats, place, out }, held) {
  const row = document.createElement('a');
  row.className = 'idx-row acct';
  row.href = citeHref(txid, out);   // a credit lands the book on its output
  const resting = held && sats > 0 ? held.get(txid) ?? 0 : 0;
  if (held) {
    if (resting > 0) row.title = `still unspent: ${formatBalanceBtc(resting)}`;
    else row.classList.add('spent');
  }
  const r = document.createElement('span'); r.className = 'idx-ref';
  r.textContent = `${toRoman(place.volume)} β${place.book} ■${place.chapter}`;
  // The section joins the citation only once the archive knows it -- a
  // paragraph the reader has visited fills in (§section.output, as the
  // reader's marginalia print it); the rest wait to be read.
  const sec = document.createElement('span');
  r.append(sec);
  sectionOf(txid).then((pos) => {
    if (pos != null) sec.textContent = ` §${pos + 1}${out != null ? `.${out}` : ''}`;
  });
  const deb = document.createElement('span'); deb.className = 'idx-amt col-deb';
  deb.textContent = sats < 0 ? formatBalanceBtc(-sats) : '';
  const cred = document.createElement('span'); cred.className = 'idx-amt col-cred';
  cred.textContent = sats > 0 ? formatBalanceBtc(sats) : sats === 0 ? '0 ₿' : '';
  const st = document.createElement('span'); st.className = 'idx-status col-status';
  if (held && sats !== 0) {
    if (resting > 0) { st.textContent = 'unspent'; st.classList.add('unspent'); }
    else st.textContent = 'spent';
  }
  row.append(r, deb, cred, st);
  return row;
}
function lineHead(cls, label) { const d = document.createElement('div'); d.className = cls; d.textContent = label; return d; }
export function lineNote(el, text) {
  const s = document.createElement('span');
  s.className = 'idx-note';
  s.textContent = text;
  el.append(s);
}
