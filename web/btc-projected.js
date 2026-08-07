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
// block that will exist. So this asks for block 0 and closes the socket.
//
// ── What is kept ──────────────────────────────────────────────────────────
//
// Not the half-megabyte. The two leaves want the largest by each measure, so
// the ranking is done once on arrival and only the heads of the two lists are
// kept — a few kilobytes, in sessionStorage, for a couple of minutes. That is
// what makes the sideways turn between them free, where re-reading the socket
// would cost another 600 KB to answer the same question a different way.
//
// The snapshot carries the minute it was taken and every surface prints it. A
// queue is a fact about a moment, and one read two minutes ago is not the one
// in front of the reader now.

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
  const [txid, fee, vsize, value] = row;
  const n = (v) => (Number.isFinite(Number(v)) ? Number(v) : null);
  const out = { txid, fee: n(fee), vsize: n(vsize), value: n(value) };
  return out.vsize == null || out.value == null ? null : out;
}

// The two rankings a snapshot is reduced to, largest first, and what each
// leaves behind. Pure, so the reduction can be checked without a socket.
//
// Each transaction carries its seat: its place in the manifest the socket
// sent, which is template order -- the order a miner writing this block would
// write them in -- so seat + 1 is its §section of the draft chapter. It is
// taken here, before either ranking reorders anything, because a row's rank is
// not its seat and nothing downstream could recover one from the other. A
// malformed row is still dropped, but it does not shift the seats of the rows
// behind it: the seat counts the manifest, not the survivors.
export function rankTransactions(rows, top = TOP) {
  const txs = [];
  (Array.isArray(rows) ? rows : []).forEach((row, seat) => {
    const t = txOf(row);
    if (t) txs.push({ ...t, seat });
  });
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

const now = () => Math.floor(Date.now() / 1000);

// The snapshot kept from a previous leaf, if it is still fresh enough to be
// about the same queue. Null on anything unreadable -- a broken cache costs
// one more socket and nothing else.
function kept() {
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

// One reading of the alpha block's transactions, from the socket, reduced and
// kept. Null where the socket will not answer -- in which case the leaf says
// so rather than showing an empty ranking, which would read as a queue with
// nothing in it.
export function readAlpha({ url = WS_URL, timeout = 20_000, fresh = false } = {}) {
  if (!fresh) {
    const had = kept();
    if (had) return Promise.resolve(had);
  }
  if (typeof WebSocket === 'undefined') return Promise.resolve(null);
  return new Promise((resolve) => {
    let ws;
    let done = false;
    const settle = (v) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      try { ws?.close(); } catch { /* already gone */ }
      resolve(v);
    };
    const timer = setTimeout(() => settle(null), timeout);
    try { ws = new WebSocket(url); } catch { settle(null); return; }
    ws.onerror = () => settle(null);
    ws.onclose = () => settle(null);
    ws.onopen = () => {
      try {
        ws.send(JSON.stringify({ action: 'init' }));
        // The one projected block worth reading: alpha, the next chapter.
        ws.send(JSON.stringify({ 'track-mempool-block': 0 }));
      } catch { settle(null); }
    };
    ws.onmessage = (ev) => {
      let msg;
      try { msg = JSON.parse(ev.data); } catch { return; }
      const p = msg['projected-block-transactions'];
      if (!p) return;
      const rows = Array.isArray(p) ? p : (p.blockTransactions || p.transactions || p.added);
      if (!Array.isArray(rows) || !rows.length) return;
      const snap = { ...rankTransactions(rows), readAt: now() };
      try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(snap)); } catch { /* not kept; the next leaf re-reads */ }
      settle(snap);
    };
  });
}
