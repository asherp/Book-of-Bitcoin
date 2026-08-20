// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/ledger-filing.test.mjs — filing an address into a ledger from the
// reading page (web/bitcoin-book.html), and the store move it needs
// (web/btc-index.js).
//
// A locking script's copy menu could open the ledger an address is in, and
// nothing else. Filing the address was the ribbon's job, and the ribbon could
// only ever make the FIRST keep: once an address sat in one of the reader's
// ledgers, `saveTitle` guarded with
//
//   if (!keptLedgers().some((k) => k.addresses.includes(menuEntry.ledger)))
//
// so naming another ledger fell through and nothing happened — silently. The
// menu now carries the filing itself: Add where the address is in none of the
// reader's ledgers, Move where it is already in one, and a list of the shelf
// to press rather than a name to remember.
//
//   node --test tools/ledger-filing.test.mjs

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// A working store, not a stub: unkeepAddress reads the shelf, rewrites it and
// saves, so a no-op localStorage would test nothing.
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};
globalThis.window = globalThis;

const { keptLedgers, saveKeptLedgers, keepLedger, unkeepAddress } = await import('../web/btc-index.js');
const book = await readFile(new URL('../web/bitcoin-book.html', import.meta.url), 'utf8');

// Members are checked for membership, so they must read as addresses.
const A = (n) => `1${'A'.repeat(9)}${String(n).padStart(24, '1')}`;
const seed = (...pairs) => saveKeptLedgers(pairs.map(([title, addresses]) => ({ title, addresses })));
const shelf = () => keptLedgers().map((k) => `${k.title}: ${k.addresses.length}`);

test('unkeepAddress takes a member out of wherever it was', () => {
  seed(['Donations', [A(1), A(2)]], ['Thefts/Mt. Gox', [A(3)]]);
  unkeepAddress(A(1));
  assert.deepEqual(shelf(), ['Donations: 1', 'Thefts/Mt. Gox: 1']);
  assert.equal(keptLedgers()[0].addresses.includes(A(1)), false);
});

test('a ledger the removal empties is not left standing', () => {
  // A name over no account is not a ledger — and it would go on claiming its
  // name against every later keep.
  seed(['Donations', [A(1)]], ['Thefts/Mt. Gox', [A(3)]]);
  unkeepAddress(A(1));
  assert.deepEqual(shelf(), ['Thefts/Mt. Gox: 1'], 'the emptied ledger is gone');
});

test('a member in no ledger is removed from none of them', () => {
  seed(['Donations', [A(1)]]);
  unkeepAddress(A(9));
  assert.deepEqual(shelf(), ['Donations: 1']);
});

test('a move leaves nowhere behind, and lands in one place', () => {
  // The whole point: an address reading as though it were in two of the
  // reader's ledgers at once would make both accounts wrong.
  seed(['Donations', [A(1), A(2)]], ['Coldcard hack/wave 3', [A(5)]]);
  unkeepAddress(A(1));                       // …what the menu does for a move
  keepLedger('Coldcard hack/wave 3', [A(1)]);
  assert.deepEqual(shelf(), ['Donations: 1', 'Coldcard hack/wave 3: 2']);
  const holders = keptLedgers().filter((k) => k.addresses.includes(A(1)));
  assert.equal(holders.length, 1, 'exactly one ledger holds it');
  assert.equal(holders[0].title, 'Coldcard hack/wave 3');
});

test('a move into a ledger that does not exist yet shelves it', () => {
  seed(['Donations', [A(1), A(2)]]);
  unkeepAddress(A(1));
  keepLedger('My cold wallet', [A(1)]);
  assert.deepEqual(shelf(), ['Donations: 1', 'My cold wallet: 1']);
});

test('the menu opens a ledger and files into one, and says which it is doing', () => {
  // Two different things, so two items: one goes and looks, the other writes.
  assert.match(book, /data-act="ledger" role="menuitem">View ledger</,
    'the road to the record says it opens it');
  assert.doesNotMatch(book, /Ledger entry</, 'and no longer calls itself an entry');
  assert.match(book, /data-act="ledger-add" role="menuitem">Add to ledger</, 'filing is its own item');
  assert.match(book, /menuLedgerAddBtn\.textContent = tr\(keptLedgerOf\(entry\.ledger\) \? 'Move to ledger' : 'Add to ledger'\)/,
    'and names itself by which write it will make');
  // Only the reader's own shelf makes it a move: a curated ledger is not
  // theirs to move out of.
  assert.match(book, /const keptLedgerOf = \(address\) =>\s*\n\s*\(address \? keptLedgers\(\)/,
    'the question asked is whether THEY keep it');
});

test('the shelf is offered to press, with the address’s own ledger marked', () => {
  assert.match(book, /function openLedgerPicker\(\)/, 'the list is built from the shelf');
  assert.match(book, /for \(const l of shelfLedgers\(\)\)/, 'every ledger the reader can see');
  assert.match(book, /const here = home && nameKey\(home\.title\) === nameKey\(l\.title\);/,
    'the one it sits in now is found by the one comparison');
  assert.match(book, /row\.disabled = true;/, 'and is not pressable — a move to where it is is no move');
  assert.match(book, /fresh\.textContent = tr\('New ledger…'\);/, 'with a way out that needs typing');
});

test('filing goes through one function, whichever way the reader reached it', () => {
  // Naming a ledger and picking one off the list must do the same thing, or
  // the two paths drift and only one of them can move.
  assert.match(book, /function fileInto\(title\) \{[\s\S]{0,320}?if \(keptLedgerOf\(address\)\) unkeepAddress\(address\);[\s\S]{0,80}?keepLedger\(title, \[address\]\);/,
    'a move takes it out first, then folds it in');
  assert.match(book, /if \(!title\) \{ refreshTitleForm\(\); titleInput\.focus[\s\S]{0,40}?\}\s*\n\s*fileInto\(title\);/,
    'the naming form files through the same one');
  // The guard that made a move impossible is gone.
  assert.doesNotMatch(book, /if \(!keptLedgers\(\)\.some\(\(k\) => k\.addresses\.includes\(menuEntry\.ledger\)\)\)/,
    'nothing silently declines to file an address that is already kept');
});

test('cancelling the naming form hands back the list it was raised from', () => {
  assert.match(book, /else if \(fromPicker\) openLedgerPicker\(\);/,
    'a cancel returns to the shelf rather than the top of the menu');
  assert.match(book, /fromPicker = true; promptForTitle\(\);/, 'which is only where it came from');
});

test('the ledger list scrolls, and scrolling it does not dismiss the menu', () => {
  // The list is capped so a long shelf cannot outgrow the screen…
  assert.match(book, /\.hash-menu-ledgers \{ max-height: 46vh; overflow-y: auto; overscroll-behavior: contain; \}/,
    'the list is capped and scrolls itself');
  // …but the menu dismisses on scroll, and that listener is bound on the
  // CAPTURE phase — which is how it hears a scroll on an inner element at
  // all. Without this guard the first wheel over the list closed the very
  // menu it was scrolling, so the cap had nothing to scroll in.
  assert.match(book, /if \(ev && ev\.target instanceof Node && hashMenu\.contains\(ev\.target\)\) return;/,
    'a scroll inside the menu is the reader working it, not the viewport moving');
  assert.match(book, /const dismissOnViewportChange = \(ev\) =>/, 'so the handler takes the event');
});
