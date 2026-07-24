// btc-index.js — the curated back-of-book index for the Bitcoin Book: notable
// addresses, each listing every chapter where it appears. Shared by
// bitcoin-index.html (the index page — the shelf), bitcoin-anthology.html
// (one address's own anthology), and bitcoin-search.html (which routes an
// address query to its anthology). Besides the curated data, this module
// carries the machinery the index-family pages share: the chain walk that
// discovers an address's chapters, the cache that remembers them, and the
// renderer that lays them out as nested contents.

import { volumeBookChapter, toRoman } from './btc-citation.js';
//
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
  // thousands of gifts deep, so its listing leans hardest on the walk cap's
  // "latest N of M" tail.
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
// The chain walk, cache, and renderer shared by the index-family pages.

// Citations are discovered the way the reader resolves one: from the chain,
// tried across the same public mirrors the book uses. An address's history
// comes from /address/<addr> (its confirmed transaction count) and
// /address/<addr>/txs/chain (its confirmed transactions, newest first,
// paginated by last-seen txid).
const ESPLORA_MIRRORS = ['https://blockstream.info/api', 'https://mempool.space/api'];

async function fetchJson(path) {
  for (const base of ESPLORA_MIRRORS) {
    try {
      const res = await fetch(base + path);
      if (res.ok) return await res.json();
    } catch { /* try the next mirror */ }
  }
  return null;
}

// Up to maxPages pages of the address's confirmed transactions, newest first.
// Pagination is by last-seen txid, so pages compose across mirrors. A famous
// address accumulates history without end, so every walk is capped; the walk
// runs newest-first -- the only direction the API pages -- so a capped line
// holds the address's *latest* appearances and knows how many it stands among.
async function walkChain(address, txCount, maxPages) {
  const txs = [];
  let lastSeen = '';
  for (let page = 0; page < maxPages && txs.length < txCount; page++) {
    const batch = await fetchJson(`/address/${address}/txs/chain${lastSeen}`);
    const confirmed = (batch || []).filter((t) => t.status?.confirmed);
    if (!confirmed.length) break;
    txs.push(...confirmed);
    lastSeen = `/${confirmed[confirmed.length - 1].txid}`;
  }
  return txs;
}

// The chapters where the address appears, ascending: one row per chapter, the
// way a book's index lists a page once however often the name recurs on it --
// its amount the *net* of every touch in that chapter. The walk arrives
// newest-first, so the last write per height keeps the earliest transaction
// there; that's the one the row opens.
function chapterize(txs, address) {
  const byHeight = new Map();
  for (const t of txs) {
    const h = t.status.block_height;
    byHeight.set(h, { txid: t.txid, sats: (byHeight.get(h)?.sats ?? 0) + netSats(t, address) });
  }
  return [...byHeight.entries()]
    .map(([height, v]) => ({ height, ...v }))
    .sort((a, b) => a.height - b.height);
}

// Each address's resolved line is cached, so a revisit renders whole from
// storage -- offline too -- and revalidates with a single request: the
// confirmed tx count only ever grows, so an unchanged count means the cached
// chapters are still the address's story to the depth already walked. A line
// records how many pages walked it (the index skims, an anthology goes deep);
// a request wanting more depth re-walks, and the deeper line serves both
// pages after. Bounded to the most recently used addresses so ad-hoc queries
// can't grow the cache without end.
const CACHE_KEY = 'glossia-btc-index-cache';
const CACHE_MAX_ADDRESSES = 12;
const readCache = () => {
  try { const v = JSON.parse(localStorage.getItem(CACHE_KEY)); return v && typeof v === 'object' ? v : {}; }
  catch { return {}; }
};
const cache = readCache();
function saveCache() {
  const keep = Object.entries(cache).sort((a, b) => b[1].at - a[1].at).slice(0, CACHE_MAX_ADDRESSES);
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(Object.fromEntries(keep))); } catch { /* full or unavailable */ }
}

// The cached line for an address, if any -- render it instantly, then let
// resolveLine confirm or deepen it.
export const cachedLine = (address) => cache[address] ?? null;

// Resolve an address's line to at least maxPages of depth: cached line first
// if it's current and deep enough, else a fresh walk. Returns the cached line
// unchanged when the chain is unreachable (offline reads still work), null
// when there's nothing at all to show.
export async function resolveLine(address, maxPages) {
  const cached = cache[address];
  const info = await fetchJson(`/address/${address}`);
  if (!info) return cached ?? null;
  const txCount = info.chain_stats.tx_count;
  if (cached && cached.txCount === txCount &&
      (cached.walked >= txCount || (cached.pages ?? 0) >= maxPages)) return cached;
  const txs = await walkChain(address, txCount, maxPages);
  // A walk that returned nothing for a non-empty address failed mid-flight:
  // keep whatever the cache already tells, rather than caching the failure.
  if (!txs.length && txCount > 0) return cached ?? null;
  const data = { at: Date.now(), txCount, walked: txs.length, pages: maxPages, chapters: chapterize(txs, address) };
  cache[address] = data;
  saveCache();
  return data;
}

// Render a resolved line the way the contents page nests its own: a Volume
// part header, then a Book sub-header wherever two or more consecutive
// chapters share one, each row citing only the portion of its reference the
// headings haven't named -- mirrored, with the reference leading the row and
// the chapter's net amount closing it. The pages that call this share the
// idx-* styles the classes name. DOM-building lives here rather than in each
// page so the index and an anthology stay the same reading, at different
// depths.
export function renderLine(el, data) {
  el.replaceChildren();
  if (!data) { lineNote(el, '—'); return; }
  const rows = data.chapters.map((c) => ({ ...c, place: volumeBookChapter(c.height) }));
  if (!rows.length) { lineNote(el, 'no appearances yet'); return; }
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
  // A capped walk names what it left behind; the count is of transactions,
  // which is what the chain counts (several may share a chapter above).
  if (data.walked < data.txCount) {
    lineNote(el, `… the latest ${data.walked.toLocaleString('en-US')} of ${data.txCount.toLocaleString('en-US')} appearances`);
  }
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
