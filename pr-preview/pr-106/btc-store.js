// SPDX-License-Identifier: MIT OR Apache-2.0
//
// btc-store.js — the book's archive: immutable chain data, kept. Everything
// the reader has already fetched of the closed past -- a block's info and
// header, its txid list, a transaction's bytes, a citation's placement -- is
// determined forever by its key (a hash, a txid, a safely-deep height), so
// it is kept in IndexedDB and never refetched: a revisited chapter renders
// from the archive, and reads offline. Mutable state (the chain tip,
// near-tip height→hash mappings) is never stored here. The address maps
// keep their own store (btc-index.js); this one serves the reading pages --
// bitcoin-book.html's loaders and bitcoin-contents.html's placements.
//
// A tiny promise-wrapped key-value layer over one database. Each store is
// capped and pruned oldest-first (an 'at' index over write time), so the
// archive stays a bounded working set, not an unbounded chain mirror.

// Ask the browser to treat this origin's storage as persistent -- installed
// apps are usually granted it silently -- so what is kept here survives
// storage pressure instead of standing in the "best effort" eviction line.
try { navigator.storage?.persist?.().catch(() => { /* denied: merely evictable */ }); } catch (_) { /* unavailable */ }
const DB_NAME = 'glossia-btc-archive';
const STORES = {
  placements: 4000,   // txid / block hash -> { height, pos }   (contents page)
  citations: 4000,    // txid -> { height, pos, outputs }       (book references)
  blocks: 400,        // block hash -> { block, headerHex }
  txids: 120,         // block hash -> [txid…]  (a big block's list runs to ~100s of KB)
  tx: 4000,           // txid -> raw hex
  heights: 8000,      // height -> block hash   (six confirmations deep or more)
  pages: 8000,        // height -> running tx count before it (six confirmations deep or more; btc-pages.js)
  mined: 4000,        // height -> who mempool says mined it, and the coinbase signature it read that from (six deep or more; btc-mines.js)
};

// How long the archive gets to open before the reader stops waiting on it.
// Every caller treats a null database as "fetch it", so the cost of giving up
// is one network trip; the cost of NOT giving up is a page that hangs, which
// is worse than a page with no archive.
const OPEN_PATIENCE = 3000;

let dbPromise = null;
function db() {
  if (!dbPromise) dbPromise = new Promise((resolve) => {
    // Settle exactly once, however the attempt ends -- and always settle.
    let done = false;
    const settle = (v) => { if (!done) { done = true; resolve(v); } };
    // A version change cannot complete while another tab still holds the old
    // one open, and IndexedDB signals that with `blocked` and then simply
    // waits. Without this the promise never resolves and EVERY archive call
    // on the page awaits it forever -- not a slow archive but a stuck one,
    // and every read that would have been served from disk hangs instead of
    // falling back to the network. So a blocked upgrade degrades to no
    // archive, and the timeout catches the case where not even `blocked`
    // fires.
    const timer = setTimeout(() => settle(null), OPEN_PATIENCE);
    const finish = (v) => { clearTimeout(timer); settle(v); };
    try {
      const req = indexedDB.open(DB_NAME, 3);   // v2 added 'pages'; v3 'mined'
      req.onupgradeneeded = () => {
        // Create whatever stores this version knows and the database doesn't --
        // a fresh install builds them all, an upgrade only the newcomers.
        for (const name of Object.keys(STORES)) {
          if (!req.result.objectStoreNames.contains(name)) {
            req.result.createObjectStore(name).createIndex('at', 'at');
          }
        }
      };
      req.onsuccess = () => {
        // An older tab may force this connection closed later to let ITS
        // upgrade through; drop the memo so the next call reopens rather
        // than handing out a dead handle.
        req.result.onversionchange = () => { try { req.result.close(); } catch (_) {} dbPromise = null; };
        finish(req.result);
      };
      req.onerror = () => finish(null);
      req.onblocked = () => finish(null);
    } catch { finish(null); }
  });
  return dbPromise;
}

// Read from the archive; null on a miss or an unavailable database. Callers
// treat null as "fetch it", so a storage failure only costs the network trip
// it would have cost anyway.
export async function storeGet(store, key) {
  const d = await db();
  if (!d) return null;
  return new Promise((resolve) => {
    try {
      const req = d.transaction(store, 'readonly').objectStore(store).get(key);
      req.onsuccess = () => resolve(req.result ? req.result.v : null);
      req.onerror = () => resolve(null);
    } catch { resolve(null); }
  });
}

// Everything a store holds, as [key, value] pairs, in one cursor pass. For a
// caller that wants the shape of what has already been banked rather than one
// value it can name -- the contents' list of mines, which is whatever the
// archive learned when the appendix last counted, and costs no network at
// all. Empty on a cold or unavailable archive, which reads as "nothing has
// been explored yet" and never as an error.
export async function storeEntries(store) {
  const d = await db();
  if (!d) return [];
  return new Promise((resolve) => {
    const out = [];
    try {
      const cur = d.transaction(store, 'readonly').objectStore(store).openCursor();
      cur.onsuccess = () => {
        const c = cur.result;
        if (!c) { resolve(out); return; }
        out.push([c.key, c.value ? c.value.v : null]);
        c.continue();
      };
      cur.onerror = () => resolve(out);
    } catch { resolve(out); }
  });
}

// Keep many values at once, in ONE transaction, and say when they have
// landed. storePut below is right for the one-value-at-a-time case the
// reading pages have -- a transaction each, pruned each time, and nobody
// waiting. A caller banking a whole difficulty window (btc-mines.js: 2,016
// blocks) would pay 2,016 transactions and 2,016 counts for that convenience,
// and would lose whatever had not committed when the reader turned the leaf.
// So: one transaction, one prune at the end, and a promise a caller may
// await before it navigates. Resolves either way -- an archive that will not
// write costs the next visit a fetch and nothing else.
export function storePutMany(store, entries) {
  return (async () => {
    const d = await db();
    if (!d || !entries.length) return;
    try {
      await new Promise((resolve) => {
        const tx = d.transaction(store, 'readwrite');
        const os = tx.objectStore(store);
        const at = Date.now();
        for (const [key, v] of entries) os.put({ at, v }, key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
        tx.onabort = () => resolve();
      });
      // One prune for the batch, rather than one per value.
      const tx = d.transaction(store, 'readwrite');
      const os = tx.objectStore(store);
      const count = await new Promise((res) => {
        const c = os.count();
        c.onsuccess = () => res(c.result);
        c.onerror = () => res(0);
      });
      let over = count - (STORES[store] || 1000);
      if (over > 0) {
        const cur = os.index('at').openCursor();
        cur.onsuccess = () => {
          const c = cur.result;
          if (c && over-- > 0) { c.delete(); c.continue(); }
        };
      }
    } catch { /* archive unavailable; the network still serves */ }
  })();
}

// Keep a value. Fire-and-forget: the reader never waits on the archive, and
// a failed write only means the next visit fetches again. Each write prunes
// the store's oldest entries past its cap.
export function storePut(store, key, value) {
  (async () => {
    const d = await db();
    if (!d) return;
    try {
      const tx = d.transaction(store, 'readwrite');
      const os = tx.objectStore(store);
      os.put({ at: Date.now(), v: value }, key);
      const count = await new Promise((res) => {
        const c = os.count();
        c.onsuccess = () => res(c.result);
        c.onerror = () => res(0);
      });
      let over = count - (STORES[store] || 1000);
      if (over > 0) {
        const cur = os.index('at').openCursor();
        cur.onsuccess = () => {
          const c = cur.result;
          if (c && over-- > 0) { c.delete(); c.continue(); }
        };
      }
    } catch { /* archive unavailable; the network still serves */ }
  })();
}
