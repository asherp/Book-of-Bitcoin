// SPDX-License-Identifier: MIT OR Apache-2.0
/* Bitcoin Book service worker — offline app shell.
 *
 * Strategy:
 *   - Precache the app shell on install (resilient: a missing entry, e.g. an
 *     unbuilt WASM artifact, does not abort the install).
 *   - Same-origin GET requests are served stale-while-revalidate: the cached
 *     copy answers instantly (offline-capable) while a background fetch refreshes
 *     the cache for next time. This lets rebuilt JS/WASM propagate on the next
 *     visit without any manual cache-busting.
 *   - Navigations fall back to the cached page, then to bitcoin-book.html, when
 *     offline.
 *   - Cross-origin requests (block explorers, fonts) are left untouched — the SW
 *     never intercepts them.
 *
 * Bump CACHE when the shell list changes or you want to force-evict old caches.
 * Everything here is scoped to the directory sw.js is served from, so it works
 * unchanged at the site root and under a per-PR preview subpath.
 */
const CACHE = 'bitcoin-book-shell-v16';

// App shell, relative to the SW scope. glossia.js / glossia_bg.wasm are
// gitignored build artifacts — present after a build/deploy, possibly absent in
// a bare checkout — so precaching tolerates their absence (see install below).
const SHELL = [
  './',
  './index.html',
  './bitcoin-book.html',
  './bitcoin-anthology.html',
  './bitcoin-contents.html',
  './bitcoin-front.html',
  './preface.md',
  './bitcoin-index.html',
  './bitcoin-ledger.html',
  './bitcoin-ledgers.html',
  './bitcoin-search.html',
  './btc-tx.js',
  './btc-prose.js',
  './btc-sigla.js',
  './btc-notation.js',
  './notation.css',
  './btc-wordlists.js',
  './btc-citation.js',
  './btc-contents.js',
  './btc-contents-data.js',
  './btc-index.js',
  './btc-index-data.js',
  './btc-store.js',
  './bitcoin-book.webmanifest',
  './icons/beta-icon.svg',
  './icons/beta-icon-16.png',
  './icons/beta-icon-32.png',
  './icons/beta-icon-180.png',
  './icons/beta-icon-192.png',
  './icons/beta-icon-512.png',
  './glossia.js',
  './glossia_bg.wasm',
  './glossia-msg.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // Add entries individually so one 404 (e.g. an unbuilt artifact) doesn't
    // reject the whole install — anything missing is filled in at runtime.
    await Promise.allSettled(SHELL.map((url) => cache.add(new Request(url, { cache: 'reload' }))));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

// Refetch the whole shell, cache-bypassing, one run at a time -- the same
// sweep a fresh install does, triggered when a new build is first noticed.
// The single in-flight promise coalesces concurrent triggers (several files
// of one deploy revalidating together); it resets on completion so the next
// deploy gets its own sweep.
let shellRefresh = null;
function refreshShell(cache) {
  if (!shellRefresh) {
    shellRefresh = Promise.allSettled(SHELL.map((url) => cache.add(new Request(url, { cache: 'reload' }))))
      .then(() => { shellRefresh = null; });
  }
  return shellRefresh;
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // don't touch cross-origin (explorers, fonts)

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(req);

    // A validator (ETag / Last-Modified) difference between the cached copy
    // and the fresh one means a newer build was published: a deploy replaces
    // the whole shell at once, so ONE fresher file proves a new build.
    // Refresh the entire shell before announcing, so the Update button on
    // any page delivers every page -- an update taken anywhere is taken
    // everywhere, and no later navigation can mix builds. Compared only for
    // app-shell file types, and only when both sides carry a validator, so
    // servers that send none never false-positive.
    const validator = (r) => r.headers.get('etag') || r.headers.get('last-modified') || '';
    const shellish = /\.(html|js|wasm|webmanifest)$|\/$/.test(url.pathname);
    const network = fetch(req).then(async (res) => {
      // Only cache complete, same-origin OK responses.
      if (res && res.ok && res.type === 'basic') {
        const fresher = !!(cached && shellish && validator(cached) && validator(res) &&
                           validator(cached) !== validator(res));
        await cache.put(req, res.clone());
        if (fresher) {
          await refreshShell(cache);
          const pages = await self.clients.matchAll({ type: 'window' });
          for (const page of pages) page.postMessage({ type: 'update-available' });
        }
      }
      return res;
    }).catch(() => null);

    // Stale-while-revalidate: cached copy now, refresh in the background.
    if (cached) {
      event.waitUntil(network);
      return cached;
    }

    const res = await network;
    if (res) return res;

    // Offline and uncached: fall back to a shell page for navigations.
    if (req.mode === 'navigate') {
      return (await cache.match(req)) ||
             (await cache.match('./bitcoin-book.html')) ||
             (await cache.match('./')) ||
             Response.error();
    }
    return Response.error();
  })());
});
