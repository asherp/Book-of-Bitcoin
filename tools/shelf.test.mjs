// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/shelf.test.mjs — the reader's shelf, filed. A slash in a kept
// ledger's title makes a hierarchy of accounts, and the question the shape
// turns on is whether a parent is a heading or a ledger. It is a ledger: its
// account is every member beneath it, its children partition it, and the
// Coldcard hack is the argument — 221 vaults whose real structure is seven
// shared and 214 not, two tables that answer different questions while the
// parent still totals the figure the incident is quoted by.
//
// Pure set arithmetic over what localStorage holds, so it pins offline.
//
//   node --test tools/shelf.test.mjs

import test from 'node:test';
import assert from 'node:assert/strict';

// btc-index.js reads localStorage at import time through keptLedgers(); the
// shelf functions take the kept list as an argument, so nothing here needs a
// store — but the module's top level still wants the global to exist.
globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
globalThis.window = globalThis;

const { shelfLedgers, shelfLedgerFor } = await import('../web/btc-index.js');

// Members are checked for membership, so they must read as addresses.
const A = (n) => `1${'A'.repeat(9)}${String(n).padStart(24, '1')}`;
const kept = (...pairs) => pairs.map(([title, addresses]) => ({ title, addresses }));
const shape = (list) => list.map((l) => `${'  '.repeat(l.depth)}${l.leaf} (${l.addresses.length})`);

test('a flat shelf is untouched: every kept ledger stands as it was kept', () => {
  const shelf = shelfLedgers(kept(['Donations', [A(1)]], ['My cold wallet', [A(2), A(3)]]));
  assert.deepEqual(shape(shelf), ['Donations (1)', 'My cold wallet (2)']);
  assert.equal(shelf.every((l) => l.parent === false), true);
});

test('a parent is a ledger of everything beneath it, its children partitioning it', () => {
  const shelf = shelfLedgers(kept(
    ['Coldcard hack/waves 1–2', [A(1), A(2)]],
    ['Coldcard hack/wave 3', [A(3), A(4), A(5)]],
  ));
  assert.deepEqual(shape(shelf), ['Coldcard hack (5)', '  waves 1–2 (2)', '  wave 3 (3)']);
  const parent = shelf[0];
  assert.equal(parent.parent, true);
  assert.equal(parent.title, 'Coldcard hack');
  assert.equal(parent.name, 'Coldcard hack');
  // The parent's account is the union, in shelf order — the figure the whole
  // incident is quoted by, which neither child can state.
  assert.deepEqual(parent.addresses, [A(1), A(2), A(3), A(4), A(5)]);
});

test('a member held by two children is one member of their parent', () => {
  const shelf = shelfLedgers(kept(['h/a', [A(1), A(2)]], ['h/b', [A(2), A(3)]]));
  assert.deepEqual(shelf[0].addresses, [A(1), A(2), A(3)]);
});

test('keeps sharing a full path are one ledger, not two of a name', () => {
  const shelf = shelfLedgers(kept(['Thefts/Mt. Gox', [A(1)]], ['Thefts/Mt. Gox', [A(2)]], ['Thefts/other', [A(3)]]));
  assert.deepEqual(shape(shelf), ['Thefts (3)', '  Mt. Gox (2)', '  other (1)']);
  assert.deepEqual(shelf[1].addresses, [A(1), A(2)]);
});

test('a parent kept in its own right holds its own members and its children’s', () => {
  const shelf = shelfLedgers(kept(['h', [A(9)]], ['h/a', [A(1)]], ['h/b', [A(2)]]));
  assert.deepEqual(shape(shelf), ['h (3)', '  a (1)', '  b (1)']);
  assert.deepEqual(shelf[0].addresses, [A(9), A(1), A(2)]);
});

test('a parent that would open its one child’s account is not shelved twice', () => {
  const shelf = shelfLedgers(kept(['Thefts/Mt. Gox', [A(1), A(2)]]));
  // The survivor steps up to the level the skipped parent would have stood
  // at, and carries the whole name that parent would have said — dropping a
  // heading must not drop what the heading was saying.
  assert.deepEqual(shape(shelf), ['Thefts / Mt. Gox (2)']);
  assert.equal(shelf[0].title, 'Thefts/Mt. Gox');   // it is still filed there
  assert.equal(shelf[0].name, 'Thefts / Mt. Gox');
  assert.equal(shelf[0].depth, 0);
});

test('any depth, depth-first, in the order the reader kept things', () => {
  const shelf = shelfLedgers(kept(
    ['h/w1/x', [A(1)]], ['h/w1/y', [A(2)]], ['h/w2', [A(3)]], ['later', [A(4)]],
  ));
  assert.deepEqual(shape(shelf), [
    'h (3)', '  w1 (2)', '    x (1)', '    y (1)', '  w2 (1)', 'later (1)',
  ]);
});

test('an untitled keep still shelves, as it always did', () => {
  const shelf = shelfLedgers(kept(['', [A(1)]]));
  assert.equal(shelf.length, 1);
  assert.equal(shelf[0].title, '');
  assert.deepEqual(shelf[0].addresses, [A(1)]);
});

test('a path names a ledger — which is what a URL can carry instead of 221 addresses', () => {
  const list = kept(['Coldcard hack/wave 3', [A(3)]], ['Coldcard hack/waves 1–2', [A(1)]]);
  assert.equal(shelfLedgerFor('Coldcard hack', list).addresses.length, 2);
  assert.equal(shelfLedgerFor('Coldcard hack/wave 3', list).addresses[0], A(3));
  assert.equal(shelfLedgerFor(' Coldcard hack / wave 3 ', list).title, 'Coldcard hack/wave 3');
  assert.equal(shelfLedgerFor('nothing kept here', list), null);
  assert.equal(shelfLedgerFor('', list), null);
});

// ── One name, however it is cased ─────────────────────────────────────────
// Names fold (nameKey, btc-keepname.js), so two keeps differing only in case
// are one ledger. The alternative was a silently SPLIT record whose parent no
// longer totalled the incident, which is the one thing a ledger is for — and
// nobody means a capital as a distinction the way they mean a slash.

test('keeps differing only in case are one ledger, not two', () => {
  const shelf = shelfLedgers(kept(
    ['Coldcard hack/wave 3', [A(1)]],
    ['Coldcard Hack/Wave 3', [A(2)]],
  ));
  assert.equal(shelf.length, 1, 'one row, not two');
  assert.equal(shelf[0].addresses.length, 2, 'and it holds both keeps’ members');
});

test('the first spelling kept is the one the shelf prints', () => {
  // The reader chose it; a later capital is a typing accident, and re-spelling
  // the row under them would be the shelf editing their name.
  const shelf = shelfLedgers(kept(
    ['Coldcard hack/wave 3', [A(1)]],
    ['COLDCARD HACK/WAVE 3', [A(2)]],
  ));
  assert.equal(shelf[0].title, 'Coldcard hack/wave 3');
  assert.equal(shelf[0].name, 'Coldcard hack / wave 3');
});

test('a parent and its children are spelled alike, however each was kept', () => {
  // The walk matches children to parents by segment, so a parent spelled from
  // one keep and a child from another would leave the child orphaned — it
  // would stand as its own top-level row and the parent would not total it.
  const shelf = shelfLedgers(kept(
    ['Coldcard hack/waves 1–2', [A(1), A(2)]],
    ['coldcard hack/wave 3', [A(3)]],
  ));
  assert.deepEqual(shape(shelf), [
    'Coldcard hack (3)',
    '  waves 1–2 (2)',
    '  wave 3 (1)',
  ]);
  // …and the parent totals every member beneath it, which is the figure the
  // incident is quoted by.
  assert.equal(shelf[0].addresses.length, 3);
});

test('a folded name still opens the ledger it names', () => {
  // A link shared with a capital the shelf has none of must still resolve, or
  // the fold would join records while splitting the ways in to them.
  const list = kept(['Coldcard hack/wave 3', [A(1)]]);
  for (const asked of ['Coldcard hack/wave 3', 'coldcard hack/wave 3', 'COLDCARD HACK / WAVE 3']) {
    assert.equal(shelfLedgerFor(asked, list)?.title, 'Coldcard hack/wave 3', `${asked} resolves`);
  }
  assert.equal(shelfLedgerFor('Coldcard hack/wave 4', list), null, 'a name nobody kept resolves to nothing');
});
