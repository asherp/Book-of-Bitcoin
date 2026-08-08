// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/lastread.test.mjs — the reader's place: kept, refused, and read back
// by the two readers that have to agree about it.
//
// The record outlives the build that wrote it — that is the whole point of it,
// since a reader who takes an update must not lose their page — so what is
// tested here is mostly the refusals: an older shape, a newer one, and a
// corrupted write all have to read as "nothing kept", never as a place.
//
// The second half is a copy check. The root (web/index.html) reads the same
// key with its own inline copy of the shape, because it has to choose between
// the cover and the reader's chapter before a module could load. Two readers
// of one record drift, so the drift is asserted rather than hoped for.
//
//   node --test tools/lastread.test.mjs

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const WEB = new URL('../web/', import.meta.url);

// A localStorage the module can write to, installed before it is imported.
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => void store.set(k, String(v)),
  removeItem: (k) => void store.delete(k),
};
const KEY = 'glossia-btc-last-read';

const { keepPlace, lastPlace, forgetPlace } = await import('../web/btc-lastread.js');

test('a place is kept and read back as the query it was', () => {
  store.clear();
  assert.equal(lastPlace(), null, 'a machine with nothing kept resumes nothing');
  keepPlace('block=848000&index=42');
  assert.equal(lastPlace(), 'block=848000&index=42');
  keepPlace('block=-1');                       // the reader who stopped at the tip
  assert.equal(lastPlace(), 'block=-1');
  forgetPlace();
  assert.equal(lastPlace(), null);
});

test('a record this build does not understand is refused, and cleared as it is', () => {
  for (const written of [
    JSON.stringify({ v: 0, q: 'block=1' }),          // an older schema
    JSON.stringify({ v: 2, q: 'block=1' }),          // a newer one, from a build ahead of this
    JSON.stringify({ v: 1, q: { block: 1 } }),       // a place that is not a query
    JSON.stringify({ v: 1 }),                        // half a record
    'block=1',                                       // the bare query, unwrapped
    '{"v":1,"q":"block=1"',                          // a write cut off midway
  ]) {
    store.set(KEY, written);
    assert.equal(lastPlace(), null, `resumed on ${written}`);
    assert.equal(store.has(KEY), false, `left ${written} behind to be re-refused every open`);
  }
});

test('nothing that is not a query is kept', () => {
  store.clear();
  for (const junk of ['', ' ', 'block=1 index=2', 'javascript:alert(1)', '../bitcoin-front.html',
    'block=' + '1'.repeat(400), null, undefined, 42, { q: 'block=1' }]) {
    keepPlace(junk);
    assert.equal(lastPlace(), null, `kept ${JSON.stringify(junk)} as a place`);
  }
});

test('a full or absent localStorage costs the reader their place, not the page', () => {
  const real = globalThis.localStorage;
  globalThis.localStorage = {
    getItem() { throw new Error('SecurityError'); },
    setItem() { throw new Error('QuotaExceededError'); },
    removeItem() { throw new Error('SecurityError'); },
  };
  assert.doesNotThrow(() => keepPlace('block=1'));
  assert.equal(lastPlace(), null);
  assert.doesNotThrow(() => forgetPlace());
  globalThis.localStorage = real;
});

test('the root reads the record the module writes', async () => {
  // index.html carries its own copy of the shape. It must name the same key,
  // check the same version, and test the query with the same expression —
  // a copy that drifts either resumes nothing or forwards to a place the
  // module never wrote.
  const root = await readFile(new URL('index.html', WEB), 'utf8');
  const mod = await readFile(new URL('btc-lastread.js', WEB), 'utf8');

  assert.ok(root.includes(`'${KEY}'`), 'index.html reads some other key');
  assert.ok(mod.includes(`'${KEY}'`), 'btc-lastread.js writes some other key');

  const version = mod.match(/const VERSION = (\d+);/)?.[1];
  assert.ok(version, 'btc-lastread.js states no version');
  assert.ok(root.includes(`rec.v === ${version}`), `index.html does not check v === ${version}`);

  const shape = mod.match(/const QUERY = (\/.*\/);/)?.[1];
  assert.ok(shape, 'btc-lastread.js states no query shape');
  assert.ok(root.includes(shape), `index.html does not test the kept query with ${shape}`);

  // And where each answer goes: the kept chapter, or the cover.
  assert.match(root, /location\.replace\(to \+ location\.hash\)/);
  assert.match(root, /var to = '\.\/bitcoin-front\.html'/, 'the root no longer falls back to the cover');
  assert.match(root, /'\.\/bitcoin-book\.html\?' \+ rec\.q/, 'the root no longer resumes into the book');
});

test('the reading page keeps the place, and the shell carries the module offline', async () => {
  const book = await readFile(new URL('bitcoin-book.html', WEB), 'utf8');
  assert.match(book, /import \{ keepPlace, lastPlace \} from '\.\/btc-lastread\.js'/);
  // Written where the page decides what its own address is, so the record and
  // the address bar cannot disagree.
  assert.match(book, /history\.replaceState\([^]*?keepPlace\(/, 'updateUrl no longer keeps the place');
  // …and read only where nothing was asked for: an explicit target always wins,
  // or a shared link would open on the recipient's own chapter.
  assert.match(book, /\[\.\.\.params\.keys\(\)\]\.length \? null : lastPlace\(\)/,
    'the resume no longer defers to an explicit target');

  const sw = await readFile(new URL('sw.js', WEB), 'utf8');
  assert.ok(sw.includes(`'./btc-lastread.js'`), 'sw.js does not precache btc-lastread.js');
});
