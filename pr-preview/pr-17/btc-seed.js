// SPDX-License-Identifier: MIT OR Apache-2.0
//
// btc-seed.js — first-visit provisioning for the archive (btc-store.js). The
// deploy carries the chain data behind the curated passages -- gathered by
// tools/prerender-passages.mjs into passages/seed.json, the same ingredients
// the pages' own loaders would fetch -- and this module imports it into
// IndexedDB once, at idle time. The table of contents is the book's front
// door: the passages a first-time reader is most likely to open, and every
// byte behind them immutable, so a first tap on a curated entry can render
// like a revisit -- from the archive, instantly, and offline.
//
// Strictly a bonus, on the archive's own terms: best-effort and fire-and-
// forget, deferred past first paint, and skipped entirely once done (a
// localStorage mark keeps the imported seed's stamp). A bare checkout has no
// seed file -- it is a deploy artifact, like the passages -- and any failure
// just leaves the network path in charge, as it always was.

import { storePut } from './btc-store.js';

const SEED_URL = './passages/seed.json';
const MARK = 'btc-archive-seeded';   // localStorage: the imported seed's stamp

export function seedArchive() {
  let done = null;
  try { done = localStorage.getItem(MARK); } catch { return; }   // no storage to mark: don't loop the import
  if (done) return;
  const run = async () => {
    try {
      const res = await fetch(SEED_URL);
      if (!res.ok) return;
      const seed = await res.json();
      if (seed?.v !== 1 || !seed.stamp) return;
      // Store -> key -> value, verbatim: the shapes are what the loaders
      // themselves write after the same fetches, asserted by nothing more
      // than the builder collecting them from the same responses. Only the
      // heights store keys by number -- JSON forced its keys to strings on
      // the way through.
      for (const [store, entries] of Object.entries({
        heights: seed.heights, blocks: seed.blocks, txids: seed.txids,
        tx: seed.tx, placements: seed.placements, citations: seed.citations,
      })) {
        for (const [k, v] of Object.entries(entries || {})) {
          storePut(store, store === 'heights' ? Number(k) : k, v);
        }
      }
      try { localStorage.setItem(MARK, seed.stamp); } catch { /* re-imports harmlessly */ }
    } catch { /* offline, or a checkout without the artifact: the network still serves */ }
  };
  // Past first paint and the page's entry animation; the timeout still runs
  // it on a reader who never goes idle.
  const idle = self.requestIdleCallback || ((f) => setTimeout(f, 2500));
  idle(run, { timeout: 10000 });
}
