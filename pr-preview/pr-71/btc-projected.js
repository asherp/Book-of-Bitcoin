// SPDX-License-Identifier: MIT OR Apache-2.0
//
// btc-projected.js — what is actually inside the next chapter, if the queue
// holds.
//
// Appendix I's book level reads the alpha block three ways: as itself, as its
// transactions ordered by what they move, and as its transactions ordered by
// what they weigh. The first two figures come off the REST API for nothing;
// the last two need the transactions themselves, and no HTTP endpoint on
// either mirror will give them:
//
//   /mempool/recent      txid, fee, vsize, value — and exactly TEN of them,
//                        the most recent. `?count=` is ignored. Same on
//                        mempool.space and on blockstream's Esplora.
//   /mempool/txids       every id in the queue — 90,413 of them, six
//                        megabytes, and not one amount or vsize attached.
//   POST /txs            no batch lookup exists (404).
//
// So ranking the queue over HTTP would mean six megabytes of ids and then
// ninety thousand lookups, which is not a page load; it is a crawl.
//
// The websocket has it. mempool.space's own block visualization asks for a
// projected block's contents over wss://mempool.space/api/v1/ws, and the
// answer is one message holding every transaction in it, each a compact
// array:
//
//   ["8ead41ea…fd", 42300, 140.25, 4943138300, 301.6, …]
//      txid          fee   vsize      value     rate
//
// (Checked against its own arithmetic rather than assumed: fee ÷ vsize
// reproduces the rate field on every transaction sampled.)
//
// ── Why only the alpha block ──────────────────────────────────────────────
//
// Each projected block runs 5,200–5,700 transactions and 580–640 KB on the
// wire; all eight would be four to five megabytes. Only the first of them is
// a real forecast anyway — btc-mempool.js says so where it names them, and
// everything deeper is a statement about the queue now rather than about any
// block that will exist. So this asks for block 0 and nothing else.
//
// ── Why the socket stays open ─────────────────────────────────────────────
//
// Because a leaf prints references, and a reference has to be true when it is
// read. A transaction's seat in the manifest is its §section of the draft
// chapter, and the queue renumbers constantly: anything arriving that pays
// better takes a seat in front and moves everything behind it back one. So
// the subscription is held — one full listing establishes template order, and
// the deltas that follow maintain it (removals and rate changes exactly,
// insertions seated by effective rate) — and the leaf renumbers as they land.
// The half-megabyte is paid once; a delta is a few hundred bytes.
//
// ── What is kept ──────────────────────────────────────────────────────────
//
// Only the heads of the two lists, a few kilobytes in sessionStorage, written
// when a full listing arrives. It buys the first paint on a sideways turn
// between the rankings — rows on screen while the socket opens — and nothing
// else; the live feed replaces it within a second or two.
//
// Every reduction carries the moment it was made, and every surface prints
// it. A queue is a fact about a moment.

export const WS_URL = 'wss://mempool.space/api/v1/ws';
// How many of each ranking a leaf shows. The rest are counted, never dropped
// silently -- the block holds thousands, and a list that stopped without
// saying so would read as the whole of it.
export const TOP = 100;
// How long a snapshot stands before it is asked for again. Long enough to
// turn between the two leaves and back; short enough that nobody reads a
// stale queue as the present one.
const KEEP_MS = 120_000;
const CACHE_KEY = 'glossia-btc-alpha';

// One transaction of a projected block, out of the compact array the socket
// sends. Anything malformed is dropped rather than guessed at: a row with no
// txid is not a transaction, and a value that will not parse is not a value.
export function txOf(row) {
  if (!Array.isArray(row) || typeof row[0] !== 'string' || row[0].length !== 64) return null;
  const [txid, fee, vsize, value, rate] = row;
  const n = (v) => (Number.isFinite(Number(v)) ? Number(v) : null);
  const out = { txid, fee: n(fee), vsize: n(vsize), value: n(value), rate: n(rate) ?? 0 };
  return out.vsize == null || out.value == null ? null : out;
}

// The listing as the socket sent it, in the order it sent it. Every row is
// kept, holes included: a seat is a position in THIS array, and the block the
// book pages counts a transaction whether or not this page could parse it. A
// hole reads as null, is ranked nowhere, and shifts nothing behind it.
export function manifestOf(rows) {
  return (Array.isArray(rows) ? rows : []).map(txOf);
}

// The manifest maintained in place, the way the backend maintains it: a
// removal drops its row, a change restates a rate, an addition is seated by
// effective rate -- the template's own ordering rule, up to package
// adjacency. The same arithmetic the book runs on its own projected feed
// (bitcoin-book.html, applyManifestMsg), and for the same reason: a seat is a
// §section, and a §section that lags is wrong rather than merely old. Pure,
// so the maintenance can be checked without a socket.
export function applyDelta(manifest, delta) {
  if (!Array.isArray(manifest)) return [];
  if (!delta) return manifest;
  const removed = new Set(delta.removed || []);
  let out = removed.size ? manifest.filter((t) => !(t && removed.has(t.txid))) : manifest.slice();
  if (Array.isArray(delta.changed) && delta.changed.length) {
    const changes = new Map(delta.changed.map((c) => [c[0], Number(c[1])]));
    out = out.map((t) => (t && changes.has(t.txid) ? { ...t, rate: changes.get(t.txid) } : t));
  }
  for (const row of (Array.isArray(delta.added) ? delta.added : [])) {
    const t = txOf(row);
    if (!t) continue;
    if (out.some((x) => x && x.txid === t.txid)) continue;   // already seated
    let i = out.findIndex((x) => x && x.rate < t.rate);
    if (i < 0) i = out.length;
    out.splice(i, 0, t);
  }
  return out;
}

// The two rankings a manifest is reduced to, largest first, and what each
// leaves behind. Pure, so the reduction can be checked without a socket.
//
// Each transaction carries its seat: its place in the manifest, which is
// template order -- the order a miner writing this block would write them in
// -- so seat + 1 is its §section of the draft chapter. It is taken here,
// before either ranking reorders anything, because a row's rank is not its
// seat and nothing downstream could recover one from the other.
export function rankSeated(manifest, top = TOP) {
  const txs = [];
  (Array.isArray(manifest) ? manifest : []).forEach((t, seat) => { if (t) txs.push({ ...t, seat }); });
  const by = (key) => [...txs].sort((a, b) => b[key] - a[key] || a.txid.localeCompare(b.txid));
  return {
    n: txs.length,
    // Totals over the WHOLE block, not over the hundred shown: a leaf that
    // summed its own rows would be describing its own cap.
    value: txs.reduce((s, t) => s + t.value, 0),
    vsize: txs.reduce((s, t) => s + t.vsize, 0),
    byAmount: by('value').slice(0, top),
    bySize: by('vsize').slice(0, top),
  };
}
// The same, from the wire rows a full listing arrives as.
export const rankTransactions = (rows, top = TOP) => rankSeated(manifestOf(rows), top);

const now = () => Math.floor(Date.now() / 1000);

// The snapshot kept from a previous leaf, if it is still fresh enough to be
// about the same queue. What it buys is the first paint: a sideways turn
// between the two rankings shows its rows at once instead of a blank leaf
// while the socket opens. The live feed replaces it within a second or two,
// so nothing is read off it for long. Null on anything unreadable -- a broken
// cache costs one more socket and nothing else.
export function keptAlpha() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const snap = JSON.parse(raw);
    if (!snap || !Array.isArray(snap.byAmount)) return null;
    // A snapshot kept by an older build has no seats, and a row without one
    // has no reference to print. Treated as stale rather than repaired: it
    // costs one socket, once, at the version boundary.
    if (snap.byAmount.length && !Number.isFinite(snap.byAmount[0].seat)) return null;
    return (Date.now() - snap.readAt * 1000) < KEEP_MS ? snap : null;
  } catch { return null; }
}

// The alpha block's transactions, kept in step rather than read once.
//
// A seat is a §section, and the queue renumbers its sections constantly: a
// transaction that arrives paying better than yours takes a seat in front of
// yours and moves you back one. A leaf printing a reference has to say where
// the transaction sits NOW, so this holds the subscription open -- one full
// listing to establish template order, then the deltas that maintain it --
// and hands the caller a fresh reduction on every frame.
//
// onReading is called with a reduction, or with null once if the socket will
// not answer at all (the leaf says so, rather than showing an empty ranking,
// which would read as a queue with nothing in it). onTip, where given, is
// called with each mined height the socket announces: the block the seats
// belong to is the one past the tip, so the tip moving renames the chapter
// they are cited in.
//
// Returns a stop(): the leaf calls it when the page goes, and nothing is left
// holding a socket open behind it.
export function watchAlpha({ url = WS_URL, timeout = 20_000, onReading = () => {}, onTip = null } = {}) {
  if (typeof WebSocket === 'undefined') { onReading(null); return () => {}; }
  let ws = null, stopped = false, manifest = null, expectedSeq = null;
  let timer = null, retry = null, answered = false;

  const emit = ({ cache = false } = {}) => {
    if (!manifest) return;
    answered = true;
    if (timer) { clearTimeout(timer); timer = null; }
    const snap = { ...rankSeated(manifest), readAt: now() };
    // Kept on the full listing only. The deltas arrive every few seconds and
    // the cache exists for a first paint, not for freshness -- rewriting tens
    // of kilobytes on every frame would buy nothing and cost the main thread.
    if (cache) { try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(snap)); } catch { /* the next leaf re-reads */ } }
    onReading(snap);
  };

  const subscribe = () => {
    try {
      ws.send(JSON.stringify({ action: 'init' }));
      // The blocks feed too: a mined block renames the chapter these seats
      // are cited in, and the listing that follows renumbers them.
      if (onTip) ws.send(JSON.stringify({ action: 'want', data: ['blocks'] }));
      // The one projected block worth reading: alpha, the next chapter.
      ws.send(JSON.stringify({ 'track-mempool-block': 0 }));
      expectedSeq = null;
    } catch { /* the close handler retries */ }
  };

  const onMessage = (ev) => {
    let msg;
    try { msg = JSON.parse(ev.data); } catch { return; }
    if (onTip && msg.block && Number.isFinite(Number(msg.block.height))) onTip(Number(msg.block.height));
    const p = msg['projected-block-transactions'];
    if (!p) return;
    const rows = Array.isArray(p) ? p : p.blockTransactions;
    if (Array.isArray(rows)) {
      if (!Array.isArray(p) && p.index !== 0) return;
      if (!rows.length) return;
      manifest = manifestOf(rows);
      expectedSeq = Number.isFinite(p.sequence) ? p.sequence + 1 : null;
      emit({ cache: true });
      return;
    }
    if (!p.delta || p.index !== 0 || !manifest) return;
    // A missed frame means the order this page holds is no longer the order
    // the backend holds, and every seat after the gap could be wrong. Ask for
    // the listing again rather than renumber from a manifest that has drifted.
    if (expectedSeq !== null && Number.isFinite(p.sequence) && p.sequence !== expectedSeq) { subscribe(); return; }
    expectedSeq = Number.isFinite(p.sequence) ? p.sequence + 1 : expectedSeq;
    manifest = applyDelta(manifest, p.delta);
    emit();
  };

  const connect = () => {
    if (stopped) return;
    try { ws = new WebSocket(url); } catch { ws = null; if (!answered) onReading(null); return; }
    ws.onopen = subscribe;
    ws.onmessage = onMessage;
    ws.onerror = () => { try { ws.close(); } catch { /* already gone */ } };
    ws.onclose = () => {
      ws = null;
      if (stopped) return;
      // A feed that drops mid-reading leaves the rows on screen and comes
      // back for them; one that never answered at all is reported once, so
      // the leaf can say what it could not read.
      if (!answered) { onReading(null); return; }
      if (!retry) retry = setTimeout(() => { retry = null; connect(); }, 5_000);
    };
  };

  timer = setTimeout(() => { if (!answered) onReading(null); }, timeout);
  connect();
  return () => {
    stopped = true;
    if (timer) clearTimeout(timer);
    if (retry) clearTimeout(retry);
    try { ws?.close(); } catch { /* already gone */ }
    ws = null;
  };
}
