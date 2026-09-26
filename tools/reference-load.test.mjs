// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/reference-load.test.mjs — what following a reference asks of Esplora.
//
// A citation already knows the transaction it names, so opening it must not
// rediscover that txid from the block's whole list: the reader seats it and
// asks for the block and the transaction together. Stepping through a block
// asks for one seat at a time (/block/:hash/txid/:index), never the list. A
// margin that is already priced resolves its references by place alone, and
// a forward citation asks for its spender's whole record only where the spent
// script cannot say whether the spending input carries a witness.
//
// The page script is not a module, so the rules are pinned against its
// source, and the one pure function is lifted out and run.
//
//   node --test tools/reference-load.test.mjs

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const book = await readFile(new URL('../web/bitcoin-book.html', import.meta.url), 'utf8');
const store = await readFile(new URL('../web/btc-store.js', import.meta.url), 'utf8');

const spendCarriesWitness = (() => {
  const m = /function spendCarriesWitness\(spkHex\) \{[\s\S]*?\n\}/.exec(book);
  assert.ok(m, 'the reader no longer decides a spend\'s witness from its script');
  return new Function(`${m[0]}\nreturn spendCarriesWitness;`)();
})();

test('the spent script settles the witness where consensus does, and defers where it does not', () => {
  const h = (n) => 'ab'.repeat(n);
  assert.equal(spendCarriesWitness(`0014${h(20)}`), true, 'P2WPKH');
  assert.equal(spendCarriesWitness(`0020${h(32)}`), true, 'P2WSH');
  assert.equal(spendCarriesWitness(`5120${h(32)}`), true, 'P2TR');
  assert.equal(spendCarriesWitness(`a914${h(20)}87`), null, 'P2SH may wrap a witness program or not');
  assert.equal(spendCarriesWitness('51024e73'), null, 'pay-to-anchor spends with an empty witness');
  assert.equal(spendCarriesWitness(`5220${h(32)}`), null, 'an unassigned witness version');
  assert.equal(spendCarriesWitness(`76a914${h(20)}88ac`), false, 'P2PKH');
  assert.equal(spendCarriesWitness(`21${h(33)}ac`), false, 'P2PK');
  assert.equal(spendCarriesWitness(`6a04${h(4)}`), false, 'OP_RETURN');
  assert.equal(spendCarriesWitness(`5121${h(33)}51ae`), false, 'bare multisig');
});

test('a forward citation letters the footnote by the input\'s own number', () => {
  // The spender's page letters each witness by its input number
  // (btc-citation.js inputMarkOf), so the citation must do the same.
  assert.match(book, /footnoteMark\(sp\.vin \+ 1\)/);
  assert.doesNotMatch(book, /wits\.slice\(0, sp\.vin \+ 1\)/, 'a rank among witness inputs shifts with a neighbour\'s legacy spend');
});

test('no navigation asks for a block\'s whole txid list', () => {
  assert.doesNotMatch(book, /withTxids: true/);
  assert.doesNotMatch(book, /withTxids: (index|direction)/);
  // ensureTxids survives only for a projected chapter, whose list is its
  // manifest, and inside txidAt for the same case.
  const calls = [...book.matchAll(/await ensureTxids\((\w+)\)/g)].map((m) => m[1]);
  assert.deepEqual(calls.sort(), ['st', 'state'], `ensureTxids is called from ${calls.length} places`);
  assert.match(book, /\/block\/\$\{st\.hash\}\/txid\/\$\{index\}/, 'one seat is asked for alone');
});

test('a citation link opens its section with the txid it already knows', () => {
  assert.match(book, /goToSection\(height, pos, `out-\$\{vout\}`, txid\)/, 'backward citation');
  assert.match(book, /goToSection\(height, pos, `in-\$\{sp\.vin\}`, sp\.txid\)/, 'forward citation');
  assert.match(book, /async function goToSection\(height, index, scrollId, txid = null\)/);
  // A priced margin needs only the place: merkle proof and status, not /tx.
  assert.match(book, /priced \? resolvePlacement\(txid\) : resolveCitation\(txid\)/);
  assert.match(book, /\/tx\/\$\{txid\}\/status/);
});

test('the archive banks seats', () => {
  assert.match(store, /seats: \d+,/);
  assert.match(store, /indexedDB\.open\(DB_NAME, 4\)/);
});

test('a contents row naming a transaction opens the way a citation does', async () => {
  const contents = await readFile(new URL('../web/bitcoin-contents.html', import.meta.url), 'utf8');
  // Any 64-hex lookup (?txid=, the search box, a draft that confirms) asks
  // for the transaction's place beside the block probe, and a placed
  // transaction opens seated, as a citation does.
  assert.match(book, /Promise\.resolve\(openLookup\(txidParam\)\)/);
  assert.match(book, /const placeP = blockCoreCache\.has\(hex\) \? null : resolvePlacement\(hex\)/);
  assert.match(book, /await goToSection\(place\.height, place\.pos, null, hex\)/);
  // The contents page banks the confirming block's hash with the place it
  // prints, where resolvePlacement reads it.
  assert.match(contents, /\/tx\/\$\{id\}\/status/);
  assert.match(contents, /storePut\('placements', id, entry\)/);
  assert.doesNotMatch(contents, /storePut\('placements', \w+(\.hex)?, \{ height: mp\.block_height, pos: mp\.pos \}\)/, 'a txid placement banked without its hash');
});

test('the prev/next contents walk opens a txid stop seated', () => {
  const step = /async function contentsStep\(direction\) \{[\s\S]*?\n\}/.exec(book);
  assert.ok(step, 'contentsStep is gone');
  assert.match(step[0], /goToSection\(t\.height, index, null, txid\)/);
  const kick = /function kickTxPlacements\(\) \{[\s\S]*?\n\}/.exec(book);
  assert.ok(kick, 'kickTxPlacements is gone');
  assert.match(kick[0], /resolvePlacement\(id\)/, 'the walk places txids with their block hash');
  assert.doesNotMatch(kick[0], /merkle-proof/);
});

test('a section landing asks for its seat beside the block, not after it', () => {
  const m = /async function loadHeightOrProjected\(height, index, tipP\) \{[\s\S]*?\n\}/.exec(book);
  assert.ok(m, 'loadHeightOrProjected is gone');
  assert.match(m[0], /if \(index >= 0\) txidAt\(\{ hash \}, index\)\.then\(loadTxHex\)/);
});
