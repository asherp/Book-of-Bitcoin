// btc-index.js — the curated back-of-book index for the Bitcoin Book: notable
// addresses, each listing every chapter where it appears. Shared by
// bitcoin-index.html (the index page — the shelf), bitcoin-anthology.html
// (one address's own anthology), and bitcoin-search.html (which routes an
// address query to its anthology). Besides the curated data, this module
// carries the machinery the index-family pages share: the mapping that
// discovers an address's chapters, the store that remembers them, and the
// renderers that lay them out.

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

// The net effect of one transaction on the address, in satoshis: outputs
// paying the address minus inputs spending from it. Local arithmetic -- the
// explorer's tx JSON carries each input's prevout, so no further lookups.
// Amounts stay well inside Number's exact-integer range (all 21M BTC is
// 2.1e15 sats, under 2^53).
export function netSats(tx, address) {
  let n = 0;
  for (const o of tx.vout) if (o.scriptpubkey_address === address) n += o.value;
  for (const i of tx.vin) if (i.prevout?.scriptpubkey_address === address) n -= i.prevout.value;
  return n;
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

// ---------------------------------------------------------------------------
// The mapping, the store, and the renderers shared by the index-family pages.
//
// An address's *map* is the complete list of its chapters -- every block it
// appears in, with the net of its touches there. Two sources feed it.
// Blockbook instances (Trezor's indexer) serve big random-access pages, so a
// complete map arrives as a handful of parallel requests; and because past
// blocks are closed -- a transaction can never be inserted into mined
// history -- a later top-up asks only for blocks above the mapped frontier
// (&from=), which cannot overlap what's mapped. Esplora mirrors (the book's
// own) are the fallback: their address walk is a sequential linked list,
// newest-first, capped at ESPLORA_MAX_PAGES -- so a fallback map of a busy
// address may be incomplete, marked so, and rendered with the "latest N of M"
// tail instead of the anthology spine.

const BLOCKBOOK_MIRRORS = ['https://btc1.trezor.io/api/v2', 'https://btc2.trezor.io/api/v2'];
const BLOCKBOOK_PAGE = 1000;
const BLOCKBOOK_CONCURRENCY = 4;
const ESPLORA_MIRRORS = ['https://blockstream.info/api', 'https://mempool.space/api'];
const ESPLORA_MAX_PAGES = 40;

async function esploraJson(path) {
  for (const base of ESPLORA_MIRRORS) {
    try {
      const res = await fetch(base + path);
      if (res.ok) return await res.json();
    } catch { /* try the next mirror */ }
  }
  return null;
}

async function blockbookJson(mirror, path) {
  try {
    const res = await fetch(mirror + path);
    if (res.ok) return await res.json();
  } catch { /* unreachable or CORS-refused */ }
  return null;
}

// One blockbook address page: `txslight` detail carries each transaction's
// height and its in/out values inline (values are decimal-sats strings), so
// a page of a thousand transactions is one request. `from` filters to blocks
// at or above a height -- the top-up primitive.
const blockbookPath = (address, page, from) =>
  `/address/${address}?details=txslight&pageSize=${BLOCKBOOK_PAGE}&page=${page}` +
  (from ? `&from=${from}` : '');

// A blockbook transaction's touches on the address, as {height, txid, sats}.
// Mempool transactions ride with a non-positive height and are left out --
// the map holds mined history only.
function blockbookTouches(txs, address) {
  const out = [];
  for (const t of txs || []) {
    if (!(t.blockHeight > 0)) continue;
    let sats = 0;
    for (const o of t.vout || []) if (o.addresses?.includes(address)) sats += Number(o.value || 0);
    for (const i of t.vin || []) if (i.addresses?.includes(address)) sats -= Number(i.value || 0);
    out.push({ height: t.blockHeight, txid: t.txid, sats });
  }
  return out;
}

// The map via blockbook: page 1 reports the page count and the address's
// confirmed transaction total, the remaining pages arrive in parallel (page
// N is addressable directly -- no linked-list walk). All pages or nothing: a
// map with a hole in the middle is worse than no map, so any unrecoverable
// page fails the whole attempt and the caller falls back to esplora.
async function blockbookMap(address, from) {
  for (const mirror of BLOCKBOOK_MIRRORS) {
    const first = await blockbookJson(mirror, blockbookPath(address, 1, from));
    if (!first || typeof first.txs !== 'number') continue;
    const pages = first.totalPages > 0 ? first.totalPages : 1;
    const chunks = [blockbookTouches(first.transactions, address)];
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
      }
    };
    await Promise.all(Array.from({ length: Math.min(BLOCKBOOK_CONCURRENCY, Math.max(pages - 1, 0)) }, worker));
    if (failed) continue;
    return { txCount: first.txs, touches: chunks.flat() };
  }
  return null;
}

// The esplora fallback: the capped newest-first walk. Complete only when the
// cap outlasts the history.
async function esploraMap(address) {
  const info = await esploraJson(`/address/${address}`);
  if (!info) return null;
  const txCount = info.chain_stats.tx_count;
  const touches = [];
  let lastSeen = '';
  for (let page = 0; page < ESPLORA_MAX_PAGES && touches.length < txCount; page++) {
    const batch = await esploraJson(`/address/${address}/txs/chain${lastSeen}`);
    const confirmed = (batch || []).filter((t) => t.status?.confirmed);
    if (!confirmed.length) break;
    for (const t of confirmed) touches.push({ height: t.status.block_height, txid: t.txid, sats: netSats(t, address) });
    lastSeen = `/${confirmed[confirmed.length - 1].txid}`;
  }
  if (!touches.length && txCount > 0) return null;   // failed mid-flight, not empty
  return { txCount, touches };
}

// Touches grouped into chapters, ascending: one row per block, the way a
// book's index lists a page once however often the name recurs on it -- its
// amount the *net* of every touch there. Sources list newest-first, so the
// last write per height keeps the earliest transaction; that's the one the
// chapter's row opens.
function groupChapters(touches) {
  const byHeight = new Map();
  for (const t of touches) {
    byHeight.set(t.height, { txid: t.txid, sats: (byHeight.get(t.height)?.sats ?? 0) + t.sats });
  }
  return [...byHeight.entries()]
    .map(([height, v]) => ({ height, ...v }))
    .sort((a, b) => a.height - b.height);
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
// resolveLine confirm or extend it.
export async function cachedLine(address) {
  return (await idb('readonly', (s) => s.get(address))) || null;
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
// by construction, so merging is concatenation.
async function topUp(address, cached) {
  const frontier = (cached.chapters[cached.chapters.length - 1]?.height ?? 0) + 1;
  const bb = await blockbookMap(address, frontier);
  if (bb) {
    if (bb.txCount === cached.txCount && !bb.touches.length) return cached;
    const chapters = cached.chapters.concat(groupChapters(bb.touches));
    const data = { at: Date.now(), txCount: bb.txCount, walked: cached.walked + bb.touches.length, complete: true, chapters };
    await saveLine(address, data);
    return data;
  }
  // Blockbook unreachable: one esplora request settles freshness; if grown,
  // walk the head down to the frontier (new history is a suffix from the
  // tip). If the cap strikes before the frontier, keep the cached map --
  // complete as of its writing beats a hole.
  const info = await esploraJson(`/address/${address}`);
  if (!info || info.chain_stats.tx_count === cached.txCount) return cached;
  const txCount = info.chain_stats.tx_count;
  const touches = [];
  let lastSeen = '';
  for (let page = 0; page < ESPLORA_MAX_PAGES; page++) {
    const batch = await esploraJson(`/address/${address}/txs/chain${lastSeen}`);
    const confirmed = (batch || []).filter((t) => t.status?.confirmed);
    if (!confirmed.length) break;
    for (const t of confirmed) {
      if (t.status.block_height >= frontier) touches.push({ height: t.status.block_height, txid: t.txid, sats: netSats(t, address) });
    }
    if (confirmed.some((t) => t.status.block_height < frontier)) {
      const chapters = cached.chapters.concat(groupChapters(touches));
      const data = { at: Date.now(), txCount, walked: cached.walked + touches.length, complete: true, chapters };
      await saveLine(address, data);
      return data;
    }
    lastSeen = `/${confirmed[confirmed.length - 1].txid}`;
  }
  return cached;
}

// Resolve an address's map: the stored one confirmed-or-topped-up when it's
// complete, else a fresh mapping -- blockbook first (parallel, complete),
// esplora as the capped fallback. Returns the stored map unchanged when the
// chain is unreachable (offline reads still work), null when there's nothing
// at all to show.
export async function resolveLine(address) {
  const cached = await cachedLine(address);
  if (cached?.complete) return topUp(address, cached);
  const bb = await blockbookMap(address);
  const map = bb ?? await esploraMap(address);
  if (!map) return cached ?? null;
  const data = {
    at: Date.now(), txCount: map.txCount, walked: map.touches.length,
    complete: map.touches.length >= map.txCount, chapters: groupChapters(map.touches),
  };
  await saveLine(address, data);
  return data;
}

// --- The anthology spine: the map's chapters bucketed into their canonical
// books, empty books and volumes left out, the survivors renumbered
// consecutively -- anthology numbers are arabic and its own, the canonical
// designation rides alongside. The numbering is permanent: past blocks are
// closed, so a book empty once its window is mined stays empty forever, and
// new books can only append to the spine's end. Book numbers restart within
// each anthology volume, mirroring the canonical scheme (β restarts each
// era). Only a complete map may be spined: consecutive numbers computed from
// partial history would shift as the map deepened, which is exactly the
// instability completeness forbids.
export function spine(data) {
  if (!data?.complete || !data.chapters.length) return null;
  const volumes = [];
  let vol = null, book = null;
  for (const c of data.chapters) {
    const place = volumeBookChapter(c.height);
    if (!vol || vol.volume !== place.volume) {
      vol = { n: volumes.length + 1, volume: place.volume, books: [], sats: 0, count: 0 };
      volumes.push(vol);
      book = null;
    }
    if (!book || book.book !== place.book) {
      book = { n: vol.books.length + 1, book: place.book, chapters: [], sats: 0 };
      vol.books.push(book);
    }
    book.chapters.push({ ...c, place });
    book.sats += c.sats;
    vol.sats += c.sats;
    vol.count += 1;
  }
  return volumes;
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
  let rows = data.chapters.map((c) => ({ ...c, place: volumeBookChapter(c.height) }));
  if (!rows.length) { lineNote(el, 'no appearances yet'); return; }
  if (rows.length > maxRows) {
    lineNote(el, `… ${(rows.length - maxRows).toLocaleString('en-US')} earlier chapters, collected in the anthology`);
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
    lineNote(el, `… the latest ${data.walked.toLocaleString('en-US')} of ${data.txCount.toLocaleString('en-US')} appearances`);
  }
}

// The anthology rendering: a contents leaf first -- the spine at a glance,
// one row per book with its chapter count and net, each row an anchor into
// the ledger -- then the ledger itself, every chapter row under the same
// dual-numbered headers. Chapter rows keep their canonical ■ marks and open
// the book proper, so an anthology is navigated the same way as the book it
// excerpts. Ledger rows attach in animation-frame chunks so a giant
// anthology doesn't jank its first paint. Falls back to the flat line (and
// returns false) when the map is incomplete and no spine may be drawn.
export function renderAnthology(el, data) {
  const vols = spine(data);
  if (!vols) { renderLine(el, data); return false; }
  el.replaceChildren();
  const anchor = (v, b) => `v${v.volume}b${b.book}`;   // canonical, hence permanent

  const toc = document.createElement('div'); toc.className = 'sp-toc';
  toc.append(lineHead('sp-eyebrow', 'Contents'));
  for (const v of vols) {
    toc.append(lineHead('idx-vol', `Volume ${v.n} · ${toRoman(v.volume)}`));
    for (const b of v.books) {
      const row = document.createElement('a');
      row.className = 'sp-row';
      row.href = `#${anchor(v, b)}`;
      const label = document.createElement('span'); label.className = 'sp-label';
      label.textContent = `Book ${b.n} · β${b.book}`;
      const count = document.createElement('span'); count.className = 'sp-count';
      count.textContent = `${b.chapters.length.toLocaleString('en-US')} ■`;
      const amt = document.createElement('span'); amt.className = 'idx-amt sp-amt';
      amt.textContent = formatNetBtc(b.sats);
      row.append(label, count, amt);
      toc.append(row);
    }
  }
  el.append(toc);

  el.append(lineHead('sp-eyebrow', 'Ledger'));
  const nodes = [];
  for (const v of vols) {
    nodes.push(lineHead('idx-vol', `Volume ${v.n} · ${toRoman(v.volume)}`));
    for (const b of v.books) {
      // The canonical designation rides in a transform-exempt span: the
      // headers set in small caps, but β is a sigil, not a letter to case.
      const h = lineHead('idx-book', `Book ${b.n} · `);
      const sig = document.createElement('span');
      sig.className = 'no-tt';
      sig.textContent = `β${b.book}`;
      h.append(sig);
      h.id = anchor(v, b);
      nodes.push(h);
      for (const c of b.chapters) nodes.push(lineRow(c, true));
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

function lineRow({ txid, sats, place }, underBook) {
  const row = document.createElement('a');
  row.className = 'idx-row' + (underBook ? ' under-book' : '');
  row.href = citeHref(txid);
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
