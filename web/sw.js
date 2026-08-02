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
const CACHE = 'bitcoin-book-shell-v36';

// App shell, relative to the SW scope. glossia.js / glossia_bg.wasm are
// gitignored build artifacts — present after a build/deploy, possibly absent in
// a bare checkout — so precaching tolerates their absence (see install below).
const SHELL = [
  './',
  './index.html',
  './latest/index.html',   // /latest — the stable address of the tip's chapter
  './bitcoin-book.html',
  './bitcoin-anthology.html',
  './bitcoin-contents.html',
  './bitcoin-appendix.html',
  './bitcoin-proof.html',
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
  './btc-templates.js',
  './btc-key-filter.js',
  './btc-commentary.js',
  './btc-notables.js',
  './btc-yaml.js',
  './btc-markdown.js',
  './btc-lookup.js',
  './notables.yaml',   // the curated contents, read at runtime (its commentary files ride along; see shellUrls)
  './appendix.yaml',   // …and what it gathers after the volumes
  './notation.css',
  './commentary.css',
  './btc-chrome.js',
  './btc-chrome.css',
  './btc-strings.js',
  './btc-wordlists.js',
  './btc-citation.js',
  './btc-contents.js',
  './btc-mempool.js',
  './btc-toc.css',
  './btc-pages.js',
  './btc-index.js',
  './btc-index-data.js',
  './btc-store.js',
  './btc-ots.js',
  './btc-proofs.js',
  './btc-fontscale.js',
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
  './btc-seed.js',
  './passages/seed.json',   // deploy artifact like the WASM: absent in a bare checkout, tolerated
  './version.json',         // deploy artifact: the CalVer release stamp, absent in a bare checkout
];

// The shell, plus the commentary files web/notables.yaml points at. The
// editorial layer is authored as loose Markdown and referenced from that file,
// so the list is data rather than something to keep in step by hand: read the
// index and take its `file:` lines. Only filenames are wanted, so a regex is
// enough (btc-yaml.js is an ES module and a classic worker cannot import it) --
// and a miss costs one file its precache, nothing more: the runtime's
// stale-while-revalidate caches it the first time it is opened.
async function shellUrls() {
  try {
    const res = await fetch('./notables.yaml', { cache: 'reload' });
    if (!res.ok) throw new Error(String(res.status));
    const files = [...(await res.text()).matchAll(/^\s*-?\s*file(?:-[a-z]{2})?:\s*(\S+)\s*$/gm)].map((m) => m[1]);
    const commentary = [...new Set(files)].map((f) => `./commentary/${f}`);
    // Appendix IV's bundled proofs ride along the same way, off appendix.yaml:
    // a `proof:` is the .ots itself and a `subject:` the file it stamps, both
    // wanted offline, since an appendix that cannot read its own proofs lists
    // nothing at all.
    let proofs = [];
    try {
      const back = await fetch('./appendix.yaml', { cache: 'reload' });
      if (back.ok) {
        const backText = await back.text();
        const named = [...backText.matchAll(/^\s*-?\s*(?:proof|subject):\s*(\S+)\s*$/gm)].map((m) => m[1]);
        proofs = [...new Set(named)].map((f) => `./proofs/${f}`);
        // …and the readings the appendix itself references, which the index's
        // own sweep above never sees.
        const backFiles = [...backText.matchAll(/^\s*-?\s*file(?:-[a-z]{2})?:\s*(\S+)\s*$/gm)].map((m) => m[1]);
        for (const f of new Set(backFiles)) if (!commentary.includes(`./commentary/${f}`)) commentary.push(`./commentary/${f}`);
      }
    } catch (_) { /* no appendix: the bundled proofs cache as they are read */ }
    return SHELL.concat(commentary, proofs);
  } catch (_) {
    return SHELL;   // no index: the shell alone, and commentary caches as it is read
  }
}

// The cached version.json is the release stamp of the build the reader is
// running, so it must only ever change in lockstep with the rest of the shell
// (install / refreshShell) — never by runtime revalidation, which would
// restamp an old build with a new version. Read it to tell an update's
// recipient how far behind they are.
const VERSION_URL = './version.json';
async function cachedVersion(cache) {
  try {
    const res = await cache.match(VERSION_URL);
    return res ? ((await res.json()).version || null) : null;
  } catch (_) { return null; }
}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // Add entries individually so one 404 (e.g. an unbuilt artifact) doesn't
    // reject the whole install — anything missing is filled in at runtime.
    const urls = await shellUrls();
    await Promise.allSettled(urls.map((url) => cache.add(new Request(url, { cache: 'reload' }))));
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
    shellRefresh = shellUrls()
      .then((urls) => Promise.allSettled(urls.map((url) => cache.add(new Request(url, { cache: 'reload' })))))
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
    const shellish = /\.(html|js|css|wasm|webmanifest)$|\/$/.test(url.pathname);
    const network = fetch(req).then(async (res) => {
      // Only cache complete, same-origin OK responses — and never version.json,
      // whose cached copy must stay in lockstep with the shell build it stamps
      // (it updates via install/refreshShell only; see cachedVersion above).
      if (res && res.ok && res.type === 'basic' && !url.pathname.endsWith('/version.json')) {
        const fresher = !!(cached && shellish && validator(cached) && validator(res) &&
                           validator(cached) !== validator(res));
        await cache.put(req, res.clone());
        if (fresher) {
          // Read the release stamp before the sweep replaces it and after,
          // so pages can say how far behind the running build is.
          const current = await cachedVersion(cache);
          await refreshShell(cache);
          const latest = await cachedVersion(cache);
          const pages = await self.clients.matchAll({ type: 'window' });
          for (const page of pages) page.postMessage({ type: 'update-available', current, latest });
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
      // A page is addressed by query string here -- ?block= for a chapter,
      // ?volume= / ?part= for a contents leaf -- and the shell is cached
      // under the bare URL, so match the path and let the page read its own
      // search. Without this, every deep link is an offline miss that lands
      // the reader on the book's front page instead of the page they asked
      // for, which the shell could have served.
      return (await cache.match(req, { ignoreSearch: true })) ||
             (await cache.match('./bitcoin-book.html')) ||
             (await cache.match('./')) ||
             Response.error();
    }
    return Response.error();
  })());
});
