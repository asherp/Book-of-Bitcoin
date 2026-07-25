// btc-index.js — the ledgers of the Bitcoin Book: notable addresses, each a
// view of the manuscript focused on amounts. Shared by bitcoin-ledgers.html
// (the shelf), bitcoin-ledger.html (one address's ledger), and
// bitcoin-search.html (which routes an address query to its ledger). Besides
// the curated data, this module carries the machinery the ledger pages
// share: the mapping that discovers an address's chapters, the store that
// remembers them, and the renderers that lay them out. (The filename keeps
// its index-era name so cached module graphs never mix builds.)

import { volumeBookChapter, toRoman } from './btc-citation.js';

// The table of contents and the index are inverses. The contents is a curated
// list of *places* -- each entry names one block or transaction and cites it
// once. The index is a curated list of *names* -- each entry is an address,
// and its citations are discovered from the chain at read time: every
// transaction that touches the address becomes a chapter citation, the way a
// name in a book's index trails the run of pages it appears on. So where a
// contents entry's id resolves to one citation, an index entry's address
// resolves to many -- an open-ended list that grows as the address is used.
//
// The curated set is donation addresses: causes the community has paid, so
// every citation is a gift and each entry's nested listing reads as a ledger
// of giving. Ordered by the address's famous moment (reading order), like the
// contents -- not alphabetically; the list is short enough to scan whole.

export const INDEXED = [
  // WikiLeaks' public donation address, opened June 14, 2011, after the
  // banking blockade -- Visa, Mastercard, PayPal, and the banks cut the
  // organization off, and bitcoin became the way through. The donation stream
  // Satoshi asked to hold off ("the heat you would bring") in one of his last
  // posts; it arrived anyway, six months later, and has run ever since --
  // thousands of gifts deep, the shelf's longest anthology.
  { title: 'WikiLeaks', address: '1HB5XMLmzFVj8ALj6mfBsbifRoD4miY36v' },
  // The Free Ross campaign's vanity donation address (the name is mined into
  // the base58), collecting for Ross Ulbricht's defense and advocacy from the
  // Silk Road trial era (2014) through freeross.org, until the January 2025
  // pardon turned the cause from clemency to gratitude -- donations kept
  // arriving after it.
  { title: 'Free Ross — Ross Ulbricht defense fund', address: '1Ross5Np5doy4ajF9iGXzgKaC2Q3Pwwxv' },
  // The Hal Finney Bitcoin Fund for ALS research, opened as Hal died (August
  // 2014, the ice-bucket summer) after five years with the disease. The first
  // transaction's recipient, remembered in donations toward its cure; the
  // Bitcoin Foundation gave first. The annual Running Bitcoin Challenge
  // (January 1-10, closing on the "Running bitcoin" tweet's anniversary)
  // donates through processor pages with no fixed address, so this fund is
  // the tribute's citable line.
  { title: 'Hal Finney Bitcoin Fund — ALS research', address: '1JsnZLEGgLJY7rbDdaKTzC2JyvfaKUpF5p' },
  // The EFF's standing bitcoin address, published on its "Other Ways to
  // Give" page. The foundation's bitcoin story runs the currency's whole
  // arc of respectability: an early 2011 acceptance, withdrawn the same
  // year over legal uncertainty, resumed for good in May 2013 -- and now a
  // plain address on the donations page, listed among the checks and wire
  // transfers.
  { title: 'Electronic Frontier Foundation', address: '3LTu6uavQ4A3kgDauZipyGqcHQEUSVe2so' },
  // The Tor Project's donation wallet, from the standing addresses page it
  // has kept since 2019 (donate.torproject.org/cryptocurrency). The same
  // address answers on tails.net/donate: Tails joined the Tor Project in
  // 2024, and the anonymity network and its amnesic operating system share
  // the one wallet.
  { title: 'Tor Project', address: 'bc1qtt04zfgjxg7lpqhk9vk8hnmnwf88ucwww5arsd' },
  // The donation address Keonne Rodriguez, Samourai Wallet's co-founder,
  // published from federal prison (2026), appealing to the Bitcoin community
  // for help with the legal debt of the Samourai prosecution: arrested April
  // 2024 over the privacy wallet, a 2025 guilty plea to operating an
  // unlicensed money-transmitting business. An open appeal, so its index
  // line is still being written.
  { title: 'Free Samourai — Keonne Rodriguez', address: 'bc1qtjjcvn98wh7dfd55m8kxhjcfexanttwt8gtan8' },
];

// Further campaigns join the same way each of these did: the address
// confirmed from the campaign's own publications -- never from memory --
// and its checksum verified before it is written down.

// A loose shape test for the address forms the chain has used: base58 P2PKH
// ('1…') and P2SH ('3…'), and bech32/bech32m ('bc1…', matched lowercase --
// the all-uppercase QR form is normalized by the caller). Shape only, no
// checksum: its job is routing a query to the index page, whose chain lookup
// is the real validator.
export const isAddress = (s) =>
  /^([13][1-9A-HJ-NP-Za-km-z]{25,34}|bc1[02-9ac-hj-np-z]{11,87})$/.test(s);

// A citation link into the book for one appearance: the transaction's chapter
// opens by txid, and the book resolves its exact §section itself -- the index,
// like a book's, cites pages (chapters), not lines.
export const citeHref = (txid) => `bitcoin-book.html?txid=${txid}`;

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
// An address's *map* is the complete list of its entries -- every movement
// of value it was party to. Blockbook instances (Trezor's indexer) feed it,
// and only they. Because past blocks are closed -- a transaction can never
// be inserted into mined history -- the map is built durable-first: a
// checkpointed walk (mapWhole) banks closed stretches of history as it
// descends, so found data survives any interruption and resyncs resume
// rather than restart; and a later top-up asks only for blocks above the
// mapped frontier (&from=), which cannot overlap what's banked. Unreachable
// mirrors leave the stored state standing -- complete, or a checkpoint to
// resume -- or, with nothing stored, the syncing gate.

// --- Where and how the chain is asked: the reader's to set (the Ledgers
// page's Settings), stored in localStorage and read at call time, so a
// change applies from the very next fetch. `Where`: the Blockbook instances
// tried, in order, the selected one first -- Trezor's public pair by
// default, a self-hosted node by choice. `How`: the page size, i.e. how
// much history each height-range ask carries -- smaller bites are gentler
// on public instances and checkpoint more often; bigger ones finish sooner.
export const DEFAULT_BLOCKBOOK = ['https://btc1.trezor.io/api/v2', 'https://btc2.trezor.io/api/v2'];
const BB_CUSTOM_KEY = 'glossia-btc-blockbook-custom';
const BB_SELECTED_KEY = 'glossia-btc-blockbook-selected';
const BB_PAGESIZE_KEY = 'glossia-btc-blockbook-pagesize';
const BLOCKBOOK_PAGE_DEFAULT = 1000;
const BLOCKBOOK_CONCURRENCY = 4;
export function blockbookCustom() {
  try { const v = JSON.parse(localStorage.getItem(BB_CUSTOM_KEY)); return Array.isArray(v) ? v.filter((u) => typeof u === 'string') : []; }
  catch { return []; }
}
function blockbookMirrors() {
  const all = [...DEFAULT_BLOCKBOOK, ...blockbookCustom()];
  let sel = null;
  try { sel = localStorage.getItem(BB_SELECTED_KEY); } catch { /* unavailable */ }
  return sel && all.includes(sel) ? [sel, ...all.filter((u) => u !== sel)] : all;
}
export const blockbookSelected = () => blockbookMirrors()[0];
export function blockbookPageSize() {
  let v = NaN;
  try { v = Number(localStorage.getItem(BB_PAGESIZE_KEY)); } catch { /* unavailable */ }
  return v >= 25 && v <= 1000 ? Math.floor(v) : BLOCKBOOK_PAGE_DEFAULT;
}
// The settings writer: pass only what changes; null restores a default.
export function setBlockbookSettings({ custom, selected, pageSize } = {}) {
  try {
    if (custom !== undefined) localStorage.setItem(BB_CUSTOM_KEY, JSON.stringify(custom));
    if (selected !== undefined) {
      if (selected === null) localStorage.removeItem(BB_SELECTED_KEY);
      else localStorage.setItem(BB_SELECTED_KEY, selected);
    }
    if (pageSize !== undefined) {
      if (pageSize === null) localStorage.removeItem(BB_PAGESIZE_KEY);
      else localStorage.setItem(BB_PAGESIZE_KEY, String(pageSize));
    }
  } catch { /* unavailable; settings just don't stick */ }
}

// One blockbook request, with patience: a throttle (429) or a server-side
// stumble (5xx) gets brief backed-off retries before the mirror is given up
// on -- public instances rate-limit, and one refused page must not fail a
// whole 27-page map. A definitive refusal (404 and kin) returns at once.
async function blockbookJson(mirror, path) {
  for (let attempt = 0; ; attempt++) {
    try {
      const res = await fetch(mirror + path);
      if (res.ok) return await res.json();
      if (res.status < 500 && res.status !== 429) return null;
    } catch { /* unreachable or CORS-refused */ }
    if (attempt >= 2) return null;
    await new Promise((r) => setTimeout(r, 400 * 2 ** attempt + Math.random() * 200));
  }
}

// One blockbook address page: `txslight` detail carries each transaction's
// height and its in/out values inline (values are decimal-sats strings), so
// a page of a thousand transactions is one request. `from` filters to blocks
// at or above a height (the top-up primitive); `to` filters to blocks at or
// below one (the checkpointed walk's cursor -- that set is closed history,
// immutable, so its pagination never shifts).
const blockbookPath = (address, page, from, to) =>
  `/address/${address}?details=txslight&pageSize=${blockbookPageSize()}&page=${page}` +
  (from ? `&from=${from}` : '') + (to != null ? `&to=${to}` : '');

// A blockbook transaction's touches on the address: what its outputs paid
// in (credit) and its inputs drew out (debit), kept apart -- a ledger does
// not net within a transaction, let alone within a block. One record per
// transaction; the entries derive from it. Mempool transactions ride with a
// non-positive height and are left out -- the map holds mined history only.
function blockbookTouches(txs, address) {
  const out = [];
  for (const t of txs || []) {
    if (!(t.blockHeight > 0)) continue;
    let credit = 0, debit = 0;
    for (const o of t.vout || []) if (o.addresses?.includes(address)) credit += Number(o.value || 0);
    for (const i of t.vin || []) if (i.addresses?.includes(address)) debit += Number(i.value || 0);
    out.push({ height: t.blockHeight, txid: t.txid, time: t.blockTime || null, credit, debit });
  }
  return out;
}

// The delta fetch, for top-ups: everything from a height upward. The page
// count is NOT trusted from totalPages -- live instances report it -1
// (unknown) -- so a filtered ask (whose set size the reported total doesn't
// describe) pages forward until a short page says done. All pages or
// nothing here: a delta with a hole would corrupt the banked map, so any
// unrecoverable page fails the attempt and the caller keeps what it had.
// (The whole-history walk lives in mapWhole, which banks as it goes.)
async function blockbookMap(address, from, onProgress) {
  outer: for (const mirror of blockbookMirrors()) {
    const first = await blockbookJson(mirror, blockbookPath(address, 1, from));
    if (!first || typeof first.txs !== 'number') continue;
    const chunks = [blockbookTouches(first.transactions, address)];
    // The page size actually served (the instance may cap the request's).
    const size = Number(first.itemsOnPage) > 0 ? Number(first.itemsOnPage) : blockbookPageSize();
    const firstLen = (first.transactions || []).length;
    const reported = Number(first.totalPages);
    // Live sync state for whoever is watching: transactions gathered so far
    // against the address's total, ticked as each page lands.
    let gathered = firstLen;
    const tick = () => { try { onProgress?.(gathered, first.txs); } catch (_) { /* a watcher's error is not the map's */ } };
    tick();
    if (!from || firstLen >= size) {
      if (reported > 0 || !from) {
        const pages = reported > 0 ? reported : Math.max(1, Math.ceil(first.txs / size));
        let failed = false;
        let next = 2;
        const worker = async () => {
          while (!failed) {
            const p = next++;
            if (p > pages) return;
            const j = await blockbookJson(mirror, blockbookPath(address, p, from)) ??
                      await blockbookJson(mirror, blockbookPath(address, p, from));   // one retry
            if (!j) { failed = true; return; }
            chunks[p - 1] = blockbookTouches(j.transactions, address);
            gathered += (j.transactions || []).length;
            tick();
          }
        };
        await Promise.all(Array.from({ length: Math.min(BLOCKBOOK_CONCURRENCY, Math.max(pages - 1, 0)) }, worker));
        if (failed) continue;
      } else {
        // Filtered, size unknown: read forward until a page comes up short.
        for (let p = 2; p <= 1000; p++) {
          const j = await blockbookJson(mirror, blockbookPath(address, p, from)) ??
                    await blockbookJson(mirror, blockbookPath(address, p, from));   // one retry
          if (!j) continue outer;
          const batch = j.transactions || [];
          chunks.push(blockbookTouches(batch, address));
          gathered += batch.length;
          tick();
          if (batch.length < size) break;
        }
      }
    }
    // `balance` is the address's whole confirmed balance regardless of any
    // from-filter -- an address property, not a page one.
    return { txCount: first.txs, balance: Number(first.balance ?? 0), touches: chunks.flat() };
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
    if (r.credit > 0) entries.push({ height: r.height, txid: r.txid, time: r.time, sats: r.credit });
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
// resolveLine confirm or extend it. Lines are versioned: the schema moved
// from per-block chapters to per-side entries, and a line from before the
// move reads as absent, so the next resolution remaps it whole.
const LINE_V = 2;
export async function cachedLine(address) {
  const line = await idb('readonly', (s) => s.get(address));
  return line && line.v === LINE_V ? line : null;
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

// A complete cached map tops up from its frontier: new appearances can only
// live in blocks above the highest mapped one, so a single from-filtered
// page both checks freshness (the total is unchanged -> nothing new) and
// carries whatever is. Heights above the frontier are disjoint from the map
// by construction, so merging is concatenation. Unreachable mirrors leave
// the stored map standing, complete as of its writing.
async function topUp(address, cached, onProgress) {
  const frontier = (cached.entries[cached.entries.length - 1]?.height ?? 0) + 1;
  const bb = await blockbookMap(address, frontier, onProgress);
  if (!bb) return cached;
  // The from-filter is re-applied locally: a mirror that ignored it (or
  // answered with overlap) must not double-count the mapped history.
  const fresh = bb.touches.filter((t) => t.height >= frontier);
  if (bb.txCount === cached.txCount && !fresh.length && cached.balance === bb.balance) return cached;
  const entries = cached.entries.concat(buildEntries(fresh));
  const data = { v: LINE_V, at: Date.now(), txCount: bb.txCount, balance: bb.balance, walked: cached.walked + fresh.length, complete: true, entries };
  await saveLine(address, data);
  return data;
}

// The whole map, gathered newest-to-oldest by a height cursor and BANKED as
// it goes. Each iteration asks for everything at or below the cursor -- an
// immutable set, those blocks being closed -- keeps the entries strictly
// above the page's lowest height (a page may split a block, so the boundary
// block is left for the next iteration to fetch whole), persists the
// checkpoint, and steps the cursor down. An interrupted run -- a throttled
// mirror, a closed tab -- therefore loses at most one page of work, and a
// resume continues from the banked low, independent of mirror and page
// size: closed periods, once found, are kept. The final short page banks
// everything and marks the line complete.
async function mapWhole(address, resume, onProgress) {
  let ceil = resume?.ceil ?? null;
  let cursor = resume?.low ?? null;
  let entries = resume ? resume.entries : [];
  let walked = resume?.walked ?? 0;
  let txCount = resume?.txCount ?? 0;
  let balance = resume?.balance ?? 0;
  const tick = () => { try { onProgress?.(walked, txCount); } catch (_) { /* a watcher's error is not the map's */ } };
  if (resume) tick();
  let madeProgress = false;
  mirrors: for (const mirror of blockbookMirrors()) {
    for (;;) {
      // A fresh run's first ask is unfiltered -- it learns the set's ceiling
      // and the address totals; every later ask is ≤ cursor.
      const j = await blockbookJson(mirror, blockbookPath(address, 1, undefined, cursor));
      if (!j || typeof j.txs !== 'number') continue mirrors;
      const size = Number(j.itemsOnPage) > 0 ? Number(j.itemsOnPage) : blockbookPageSize();
      if (ceil === null) { txCount = j.txs; balance = Number(j.balance ?? 0); }
      let recs = blockbookTouches(j.transactions, address);
      if (ceil === null) ceil = recs[0]?.height ?? 0;
      let short = (j.transactions || []).length < size;
      // A single block wider than a page: keep paging the same cursor until
      // the height breaks or the set ends, so the block can bank whole.
      for (let p = 2; !short && recs.length && recs.every((r) => r.height === recs[0].height); p++) {
        const j2 = await blockbookJson(mirror, blockbookPath(address, p, undefined, cursor));
        if (!j2) continue mirrors;
        recs = recs.concat(blockbookTouches(j2.transactions, address));
        short = (j2.transactions || []).length < size;
      }
      if (short) {
        entries = buildEntries(recs).concat(entries);
        walked += recs.length;
        const data = { v: LINE_V, at: Date.now(), txCount, balance, walked, complete: true, entries };
        await saveLine(address, data);
        tick();
        return data;
      }
      const low = recs[recs.length - 1].height;
      const bank = recs.filter((r) => r.height > low);
      entries = buildEntries(bank).concat(entries);
      walked += bank.length;
      cursor = low;
      madeProgress = true;
      await saveLine(address, { v: LINE_V, at: Date.now(), txCount, balance, walked, complete: false, ceil, low, entries });
      tick();
    }
  }
  // Mirrors exhausted mid-run: whatever was banked is the result -- the next
  // visit resumes from it rather than starting over.
  if (madeProgress || resume) return { v: LINE_V, at: Date.now(), txCount, balance, walked, complete: false, ceil, low: cursor, entries };
  return null;
}

// Resolve an address's map: the stored one confirmed-or-topped-up when it's
// complete; a banked checkpoint resumed and finished (then topped up for
// anything above its ceiling); a fresh checkpointed walk otherwise. Returns
// the stored state unchanged when the mirrors are unreachable (offline
// reads still work), null when there's nothing at all to show.
// `onProgress(gathered, total)` ticks as pages land, so a page can show the
// sync live.
export async function resolveLine(address, onProgress) {
  const cached = await cachedLine(address);
  if (cached?.complete) return topUp(address, cached, onProgress);
  const resume = cached && cached.low != null ? cached : null;
  const line = await mapWhole(address, resume, onProgress);
  if (!line) return cached ?? null;
  return line.complete ? topUp(address, line, onProgress) : line;
}

// The lightest possible ask: the address's chain state -- balance and
// confirmed transaction count -- one basic-details request, no transaction
// pages. The shelf shows balances with this alone, starting nobody's sync;
// the mapping begins only when a reader steps into the ledger itself.
export async function addressState(address) {
  for (const mirror of blockbookMirrors()) {
    const j = await blockbookJson(mirror, `/address/${address}?details=basic`);
    if (j && typeof j.txs === 'number') return { balance: Number(j.balance ?? 0), txCount: j.txs };
  }
  return null;
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
  for (const mirror of blockbookMirrors()) {
    const utxos = await blockbookJson(mirror, `/utxo/${address}?confirmed=true`);
    if (!Array.isArray(utxos)) continue;
    const byTxid = new Map();
    let sum = 0;
    for (const u of utxos) {
      const sats = Number(u.value || 0);
      sum += sats;
      byTxid.set(u.txid, (byTxid.get(u.txid) ?? 0) + sats);
    }
    return { sum, count: utxos.length, byTxid };
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
export function renderLine(el, data, maxRows = Infinity) {
  el.replaceChildren();
  if (!data) { lineNote(el, '—'); return; }
  let rows = data.entries.map((c) => ({ ...c, place: volumeBookChapter(c.height) }));
  if (!rows.length) { lineNote(el, 'no appearances yet'); return; }
  if (rows.length > maxRows) {
    lineNote(el, `… ${(rows.length - maxRows).toLocaleString('en-US')} earlier entries, collected in the ledger`);
    rows = rows.slice(rows.length - maxRows);
  }
  for (let i = 0; i < rows.length;) {
    const vol = rows[i].place.volume;
    let jv = i + 1; while (jv < rows.length && rows[jv].place.volume === vol) jv++;
    el.append(lineHead('idx-vol', `Volume ${toRoman(vol)}`));
    for (let k = i; k < jv;) {
      const bk = rows[k].place.book;
      let jb = k + 1; while (jb < jv && rows[jb].place.book === bk) jb++;
      if (jb - k >= 2) {
        el.append(lineHead('idx-book', `Book ${bk}`));
        for (let m = k; m < jb; m++) el.append(lineRow(rows[m], true));
      } else {
        el.append(lineRow(rows[k], false));
      }
      k = jb;
    }
    i = jv;
  }
  // An incomplete map names what it left behind; the count is of
  // transactions, which is what the chain counts (several may share a
  // chapter above).
  if (data.walked < data.txCount) {
    lineNote(el, `… the latest ${data.walked.toLocaleString('en-US')} of ${data.txCount.toLocaleString('en-US')} transactions`);
  }
}

// The ledger rendering: a summary leaf first -- years then quarters, one
// row per quarter with its entry count and net, each an anchor into the
// entries below; the reader's bookmarked references sit inline beneath the
// quarters that hold them, flying the same ribbon they fly in the book; and
// the summary closes on the closing balance, the way a ledger rules off.
// Then the entries themselves: date, the citation into the manuscript (the
// folio reference, compressed against the previous entry's -- volume and
// book named only when they change), the entry's net, and the running
// balance -- which, posted in height order over a reconciled map, lands its
// final row exactly on the chain's balance. Every entry opens
// bitcoin-book.html at its transaction; entry rows attach in
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

  const toc = document.createElement('div'); toc.className = 'sp-toc';
  const summaryHead = lineHead('sp-eyebrow', 'Summary');
  summaryHead.id = 'anth-contents';
  toc.append(summaryHead);
  for (const y of years) {
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
      // The reader's own bookmarks that fall in this quarter's blocks, in
      // height order, each opening the book at its reference.
      const heights = new Set(qt.entries.map((c) => c.height));
      for (const bm of bookmarks.filter((m) => heights.has(m.height)).sort((a, z) => a.height - z.height)) {
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
  for (const y of years) {
    nodes.push(lineHead('idx-vol', String(y.year)));
    for (const qt of y.quarters) {
      const h = lineHead('idx-book', `Q${qt.q} ${qt.year}`);
      h.id = anchor(qt.year, qt.q);
      nodes.push(h);
      let lastVol = 0, lastBook = 0;
      for (const c of qt.entries) {
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

function lineRow({ height, txid, sats, place }, underBook, held) {
  const row = document.createElement('a');
  row.className = 'idx-row' + (underBook ? ' under-book' : '');
  row.href = citeHref(txid);
  if (held) {
    const resting = sats > 0 ? held.get(txid) ?? 0 : 0;
    if (resting > 0) row.title = `still held: ${formatBalanceBtc(resting)}`;
    else row.classList.add('spent');
  }
  const r = document.createElement('span'); r.className = 'idx-ref';
  r.textContent = underBook ? `■${place.chapter}` : `β${place.book} ■${place.chapter}`;
  const amt = document.createElement('span'); amt.className = 'idx-amt';
  amt.textContent = formatNetBtc(sats);
  row.append(r, amt);
  return row;
}
function lineHead(cls, label) { const d = document.createElement('div'); d.className = cls; d.textContent = label; return d; }
export function lineNote(el, text) {
  const s = document.createElement('span');
  s.className = 'idx-note';
  s.textContent = text;
  el.append(s);
}
