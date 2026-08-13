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

import { reference, inputMark, parseReference } from '../web/btc-citation.js';

const bookPage = () => readFile(new URL('../web/bitcoin-book.html', import.meta.url), 'utf8');

// The menu's own decision, lifted out of the page and run. These few functions
// are pure -- a label and a chapter's state in, an item name and a string out --
// so they can be exercised for real rather than matched as text, which is the
// difference between checking that the page says something and checking that
// it does it. Everything they touch beyond `state` is imported above, from the
// same module the page imports it from.
async function menuLogic(state) {
  const page = await bookPage();
  const grab = (re) => {
    const m = re.exec(page);
    assert.ok(m, `the page no longer holds ${re}`);
    return m[0];
  };
  const src = [
    grab(/const COPIES = \{[\s\S]*?\n\};/),
    grab(/const copyItem = [^\n]*\n/),
    grab(/const REFERENCED = new Set\([^\n]*\n/),
    grab(/function entryPlacement\(entry\) \{[\s\S]*?\n\}/),
    grab(/function entryRef\(entry\) \{[\s\S]*?\n\}/),
    grab(/function menuCopy\(entry\) \{[\s\S]*?\n\}/),
  ].join('\n');
  return Function('state', 'reference', 'inputMark',
    `${src}\nreturn { menuCopy, entryRef };`)(state, reference, inputMark);
}

// §2053 of ■1749, which is IV β68 — a settled chapter, and a draft of the same.
const SETTLED = { height: 766820, index: 2052, projected: false };
const DRAFT = { height: 766820, index: 2052, projected: true };
const TXID = 'b38a88b073743bcc84170071cff4b68dec6fb5dc0bc8ffcb3d4ca632c2c78255';

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
    'merkle root', 'nonce', 'output', 'previous block hash', 'script sig',
    'transaction id', 'witness',
  ]);
  const COPIES = await copiesTable();
  // The four whose hex is a transaction id, whatever their head says. Three of
  // them only fall back to it -- see the reference test below -- but a draft
  // section has no settled citation, and the fallback has to be honest there.
  for (const label of ['transaction id', 'output', 'witness', 'script sig']) {
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
  assert.match(page, /menuCopyBtn\.textContent = tr\(copy\.item\);/,
    'the menu still names its item from the entry it was opened with');
  // One function decides both, so the name on the button and the string in the
  // clipboard cannot drift apart -- which is the failure the whole change is
  // about, one level up.
  assert.match(page, /navigator\.clipboard\.writeText\(menuCopy\(menuEntry\)\.text\)/);
  assert.match(page, /return ref \? \{ item: 'Copy reference', text: ref \}\s*\n\s*: \{ item: copyItem\(entry\.label\), text: entry\.hex \};/);
});

test('a part of a section is named by its citation, not by the whole', async () => {
  // An output, a witness and a scriptSig are PARTS: no chain identifier reaches
  // them, and the txid their menus carry names the transaction they sit in --
  // so a reader who copied it out of an output got a string that opens the
  // section they were already reading. The citation scheme spells all three,
  // the search box takes it, and ?ref= lands on the line it names.
  const { menuCopy } = await menuLogic(SETTLED);
  assert.deepEqual(menuCopy({ label: 'output', hex: TXID, vout: 0 }),
    { item: 'Copy reference', text: 'IV β68 ■1749 §2053.0' });
  assert.deepEqual(menuCopy({ label: 'witness', hex: TXID, vin: 2, wn: 3 }),
    { item: 'Copy reference', text: 'IV β68 ■1749 §2053.c' });
  assert.deepEqual(menuCopy({ label: 'script sig', hex: TXID, vin: 0, wn: 1 }),
    { item: 'Copy reference', text: 'IV β68 ■1749 §2053.A' });
  // Lowercase and uppercase are the same input's letter under two carriages,
  // which is the whole of the scheme's distinction between them.
  assert.equal(menuCopy({ label: 'witness', hex: TXID, vin: 2, wn: 3 }).text.slice(-1), 'c');
  assert.equal(menuCopy({ label: 'script sig', hex: TXID, vin: 2, wn: 3 }).text.slice(-1), 'C');

  // A transaction is not a part, and keeps its id: a txid is what a transaction
  // is called everywhere outside this book, and the section's own reference is
  // one item down as the link. Nor is a chapter, nor a header field.
  for (const [entry, expected] of [
    [{ label: 'transaction id', hex: TXID }, { item: 'Copy transaction id', text: TXID }],
    [{ label: 'block hash', hex: '00'.repeat(32) }, { item: 'Copy block hash', text: '00'.repeat(32) }],
    [{ label: 'merkle root', hex: 'ab'.repeat(32) }, { item: 'Copy merkle root', text: 'ab'.repeat(32) }],
    [{ label: 'nonce', hex: 'deadbeef' }, { item: 'Copy hex', text: 'deadbeef' }],
  ]) assert.deepEqual(menuCopy(entry), expected, entry.label);
});

test('a draft has no settled citation, and the fallback says what it hands back', async () => {
  // The reference is not a promise the page can always keep: a projected
  // section's seat moves until the block is mined, so entryPlacement refuses
  // it. An item still reading "Copy reference" over a txid would be the exact
  // failure this whole change is about, one level down.
  const { menuCopy, entryRef } = await menuLogic(DRAFT);
  for (const entry of [{ label: 'output', hex: TXID, vout: 0 },
    { label: 'witness', hex: TXID, vin: 0, wn: 1 },
    { label: 'script sig', hex: TXID, vin: 0, wn: 1 }]) {
    assert.equal(entryRef(entry), null, `${entry.label} has no place to cite yet`);
    assert.deepEqual(menuCopy(entry), { item: 'Copy transaction id', text: TXID }, entry.label);
  }
});

test('the citation and the link name one place', async () => {
  const page = await bookPage();
  // Both are spelled off the same entryPlacement, in the book's hand and in
  // latin — so `sig` has to reach the link too, or a scriptSig's link would
  // open the witness that shares its input number.
  assert.match(page, /function entryRef\(entry\) \{\s*\n\s*const place = entryPlacement\(entry\);/);
  assert.match(page, /latinRefOf\(place\.height, [^)]*place\.wn \?\? null, Boolean\(place\.sig\)\)/);
  // …and it round-trips through the one parser every page reads a citation with.
  const { menuCopy } = await menuLogic(SETTLED);
  const cited = menuCopy({ label: 'script sig', hex: TXID, vin: 0, wn: 1 }).text;
  assert.deepEqual(parseReference(cited),
    parseReference('v4b68c1749s2053wA'), 'the two spellings are one place');
  assert.equal(parseReference(cited).sig, true, 'and it is read back as a scriptSig');

  // A witness's readable form IS its citation, so with the reference above it
  // Copy text would offer the same string twice.
  assert.match(page, /menuCopyTextBtn\.classList\.toggle\('hidden', !entry\.prose \|\| entry\.prose === copy\.text\);/);
});

test('a scriptSig input carries the mark the scheme always gave it', async () => {
  // Uppercase says scriptSig, lowercase says witness -- the scheme's one
  // distinction between the two carriages, and it round-trips.
  assert.equal(inputMark(3, true), 'C');
  assert.equal(inputMark(3), 'c');
  const sig = parseReference('IV β68 ■1749 §2053.A');
  assert.equal(sig.wit, 1);
  assert.equal(sig.sig, true, 'a raised capital reads back as a scriptSig');
  assert.equal(parseReference('IV β68 ■1749 §2053.a').sig, false);

  const page = await bookPage();
  // It had never been printed, so a reader could not cite the input they were
  // looking at. Now it is set beside the citation exactly where a witness's
  // letter sits — and only where there is no witness, since a witness makes
  // the letter lowercase whatever else the input brought.
  assert.match(page, /else if \(inp\.scriptAscii \|\| inp\.script\) \{\s*\n\s*const m = sigRef\(inputIndex\);/,
    'the mark is raised only on an input with no witness');
  assert.match(page, /attachHashCopy\(m, para\.txid, 'script sig',/);
  assert.match(page, /s\.textContent = inputMark\(n, true\);/, 'and it is the scheme’s own letter');
  // Not a link: a witness's mark leads to its footnote, a scriptSig is on the
  // line beneath its own mark.
  const sigRefFn = /const sigRef = \(n\) => \{[\s\S]*?\n  \};/.exec(page)[0];
  assert.ok(!/createElement\('a'\)|\.href/.test(sigRefFn), 'the scriptSig mark points at nothing');
  assert.match(page, /\.tx-sig-ref \{/, 'and it is raised the way its neighbour is');
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
