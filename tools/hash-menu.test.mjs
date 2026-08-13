// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/hash-menu.test.mjs — the copy item says what comes back.
//
//   node --test tools/hash-menu.test.mjs
//
// Every hash on a chapter opens the same menu, and its first item used to be
// called "Copy hex" for all ten things the menu is attached to. That names the
// encoding, which is the one thing about a copied value nobody needs told, and
// leaves the reader to find out what they are holding by pasting it somewhere.
// Three of the labels make it worse than vague: an output's menu and a
// witness's both carry their TRANSACTION's id, so a reader who read the head
// ("output") and the item ("Copy hex") had two true words and no way to guess
// they were about to hold a txid.
//
// Source-level, because the menu is an inline module in bitcoin-book.html and
// the page needs the WASM engine to draw a chapter at all — the same way the
// search leaf is checked in chain-witness.test.mjs.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const bookPage = () => readFile(new URL('../web/bitcoin-book.html', import.meta.url), 'utf8');

// The table as the page actually holds it, read out of the source rather than
// copied here: a test that kept its own copy would pass while the page said
// something else.
async function copiesTable() {
  const page = await bookPage();
  const literal = /const COPIES = (\{[\s\S]*?\n\});/.exec(page);
  assert.ok(literal, 'the page no longer names its copy items');
  return Function(`return ${literal[1]}`)();
}

// Every label the hash menu is ever opened with. Three shapes reach it: a
// literal third argument to attachHashCopy, a header field's { menu } or
// { copy }, and the locking script's entry built by hand.
async function menuLabels() {
  const page = await bookPage();
  return new Set([
    ...[...page.matchAll(/attachHashCopy\([^;]*?,\s*'([a-z ]+)'/g)].map((m) => m[1]),
    ...[...page.matchAll(/\{[^{}]*hex:[^{}]*label:\s*'([^']+)'/g)].map((m) => m[1]),
  ]);
}

test('every hash the menu opens on has a copy item that names its value', async () => {
  const labels = await menuLabels();
  // Pinned, so a new hash added to a chapter has to decide what its copy item
  // says rather than inheriting "Copy hex" by silence.
  assert.deepEqual([...labels].sort(), [
    'block hash', 'block version', 'difficulty target', 'locking script',
    'merkle root', 'nonce', 'output', 'previous block hash', 'transaction id',
    'witness',
  ]);
  const COPIES = await copiesTable();
  // The three that carry a transaction id, whatever their head says. This is
  // the one the reader hit: a txid copied out of a section, pasted into the
  // search box, and nothing on the way said what it was.
  for (const label of ['transaction id', 'output', 'witness']) {
    assert.equal(COPIES[label], 'Copy transaction id', `${label} carries a txid`);
  }
  // …and the two that carry a block hash, under two different heads.
  assert.equal(COPIES['block hash'], 'Copy block hash');
  assert.equal(COPIES['previous block hash'], 'Copy block hash');
  assert.equal(COPIES['merkle root'], 'Copy merkle root');
  assert.equal(COPIES['locking script'], 'Copy script');
  // The header's four-byte fields keep the old name. They name no place, can be
  // looked up nowhere, and hex is the truest thing to call them — which is what
  // makes the fallback a reading and not an oversight.
  for (const label of ['block version', 'difficulty target', 'nonce']) {
    assert.equal(COPIES[label], undefined, `${label} is hex and nothing else`);
  }
  // Nothing in the table that no menu opens with.
  for (const label of Object.keys(COPIES)) {
    assert.ok(labels.has(label), `COPIES names ${label}, which no menu carries`);
  }
});

test('the menu asks the table, and the fallback is the old name', async () => {
  const page = await bookPage();
  assert.match(page, /const copyItem = \(label\) => COPIES\[label\] \|\| 'Copy hex';/);
  assert.match(page, /menuCopyBtn\.textContent = tr\(copyItem\(entry\.label\)\);/,
    'the menu still names its item from the entry it was opened with');
  // The copied value itself is untouched: the item's name is a name, and a
  // reader who learned to trust this button gets the same string back.
  assert.match(page, /navigator\.clipboard\.writeText\(menuEntry\.hex\)/);
});

test('a chrome string carried in one language is carried in all of them', async () => {
  const strings = await readFile(new URL('../web/btc-strings.js', import.meta.url), 'utf8');
  const COPIES = await copiesTable();
  // English is the source and the fallback, so a missing key is never a broken
  // page — but these three items sit in one menu, and one of them dropping into
  // English beside two translated neighbours reads as a bug to everyone who
  // sees it. The tables that carry 'Copy hex' carry the rest.
  const tables = [...strings.matchAll(/^  (\w+): \{$/gm)].map((m) => m[1]);
  assert.ok(tables.length >= 2, 'the chrome has no language tables to check');
  for (const table of tables) {
    const body = strings.split(`  ${table}: {`)[1].split('\n  },')[0];
    if (!body.includes("'Copy hex'")) continue;      // a table that has not reached the menu yet
    for (const item of new Set(Object.values(COPIES))) {
      assert.ok(body.includes(`'${item}':`), `${table} carries 'Copy hex' but not '${item}'`);
    }
  }
});
