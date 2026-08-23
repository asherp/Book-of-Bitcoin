// SPDX-License-Identifier: MIT OR Apache-2.0
//
// The service worker's cache name (web/sw.js). It is derived from the shell
// list rather than bumped by hand, and the whole point of the derivation is
// that nobody has to think about it — which is exactly the kind of thing that
// rots unnoticed. So the test does not check that the code is present; it
// changes the shell list and checks that the name follows.
//
// sw.js is a classic worker script, not a module: it is loaded here by
// evaluating it with `self` and the fetch/caches globals stubbed, which is all
// the top level of it touches.

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const SW = new URL('../web/sw.js', import.meta.url);
const SOURCE = fs.readFileSync(SW, 'utf8');

// Evaluate a (possibly edited) copy of the worker and hand back the values its
// top level settled on.
const load = (src = SOURCE) => new Function('self', 'caches', 'fetch',
  `${src}\nreturn { CACHE, EPOCH, SHELL, fnv1a };`)(
  { addEventListener() {}, skipWaiting() {}, clients: { claim() {} }, location: { origin: 'https://book.test' } },
  { open() {}, keys: async () => [], delete() {} },
  async () => { throw new Error('the top level fetches nothing'); },
);

test('the cache name carries the epoch and a hash of the shell', () => {
  const { CACHE, EPOCH, SHELL, fnv1a } = load();
  assert.equal(CACHE, `bitcoin-book-shell-${EPOCH}-${fnv1a(SHELL.join('\n'))}`);
  assert.match(CACHE, /^bitcoin-book-shell-v\d+-[0-9a-z]+$/);
});

// Every module the pages actually pull in has to BE in the shell. The cache
// name is derived, so adding a module and forgetting the list renames nothing
// and breaks nothing that a test or a browser online would notice -- the page
// simply fetches the missing file from the network every time, and offline it
// fetches nothing at all and the leaf that imports it stops working. That is
// the failure this guards: shell membership, not the file's existence (the
// engine is a build artifact and absent from a bare checkout).
test('every module the pages import is carried in the shell', () => {
  const { SHELL } = load();
  const carried = new Set(SHELL);
  const dir = new URL('../web/', import.meta.url);
  const seen = new Map();   // specifier -> the files asking for it
  for (const name of fs.readdirSync(dir)) {
    if (!/\.(html|js)$/.test(name)) continue;
    const src = fs.readFileSync(new URL(name, dir), 'utf8');
    // Both ways a page reaches a module: the static form at the top of a
    // leaf, and the lazy `import('./x.js')` a page defers behind a click.
    for (const m of src.matchAll(/(?:from|import)\s*\(?\s*'(\.\/[A-Za-z0-9._/-]+\.js)'/g)) {
      if (!seen.has(m[1])) seen.set(m[1], new Set());
      seen.get(m[1]).add(name);
    }
  }
  assert.ok(seen.size > 20, `the scan found only ${seen.size} imports — it has stopped reading the pages`);
  const missing = [...seen].filter(([spec]) => !carried.has(spec))
    .map(([spec, who]) => `${spec} (imported by ${[...who].sort().join(', ')})`);
  assert.deepEqual(missing, [], 'these are imported but not in the shell, so they are unavailable offline');
});

test('a file joining the shell renames the cache', () => {
  // The case the derivation exists for: two branches each adding a file used
  // to bump the same counter to the same number and merge without a conflict.
  const added = SOURCE.replace("  './version.json',", "  './btc-newcomer.js',\n  './version.json',");
  assert.notEqual(added, SOURCE, 'the shell list still holds the line this edit keys on');
  assert.notEqual(load(added).CACHE, load().CACHE);
});

test('a file leaving the shell renames the cache', () => {
  // The direction that actually matters: an entry nobody serves any more has
  // to stop being served, and a new cache name is what forgets it.
  const dropped = SOURCE.replace("  './btc-commentary.js',\n", '');
  assert.notEqual(dropped, SOURCE, 'the shell list still holds the line this edit keys on');
  assert.notEqual(load(dropped).CACHE, load().CACHE);
});

test('the epoch remains a lever of its own', () => {
  const { EPOCH } = load();
  const bumped = SOURCE.replace(`const EPOCH = '${EPOCH}';`, "const EPOCH = 'v999';");
  assert.notEqual(bumped, SOURCE, 'EPOCH is still declared as a plain literal');
  assert.notEqual(load(bumped).CACHE, load().CACHE);
});

test('the hash is stable, and stable across runs', () => {
  const { fnv1a } = load();
  // Fixed vectors: a change in the derivation that silently renamed every
  // reader's cache would pass every test above and fail here.
  assert.equal(fnv1a(''), (0x811c9dc5).toString(36));
  assert.equal(fnv1a('a'), fnv1a('a'));
  assert.notEqual(fnv1a('./a.js\n./b.js'), fnv1a('./b.js\n./a.js'));
});
