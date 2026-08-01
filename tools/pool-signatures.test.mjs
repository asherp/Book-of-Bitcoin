// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/pool-signatures.test.mjs — the table of pool signatures, and the
// boundary it exists to draw.
//
//   node --test tools/pool-signatures.test.mjs
//
// Two things are under test, and they are different in kind. That a pattern
// finds its pool's tag is a fact about strings. That it stops where the pool
// stopped writing -- excluding the counter byte that leaned on it -- is the
// whole point of keeping a table rather than quoting whatever looks printable,
// so every observed case of leaning is pinned here by the block it came from.
//
// The composition checks import btc-prose.js, which pulls in the Glossia WASM
// bundle, so they skip until web/glossia.js is built.

import test from 'node:test';
import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';

import { POOL_SIGNATURES, findSignature, splitOnSignature, poolOf } from '../web/btc-pools.js';
import { primeFactors } from '../web/btc-tx.js';

const engineBuilt = await access(new URL('../web/glossia.js', import.meta.url)).then(() => true, () => false);
const skipNoEngine = !engineBuilt && 'web/glossia.js not built';

const utf8Hex = (s) => Buffer.from(s, 'utf8').toString('hex');
const heightPush = (h) => '03' + Buffer.from([h & 0xff, (h >> 8) & 0xff, (h >> 16) & 0xff]).toString('hex');

// A number as the page writes it beside η: primes on the line, powers raised.
const superscript = (s) => String(s).replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[+d]);
const factorProse = (n) => primeFactors(n)
  .map(([p, k]) => String(p) + (k === 1 ? '' : superscript(k))).join('·');

// The margins as the chain wrote them, and as the book's own pages showed them
// (blocks 960,463–469 read directly; 960,281 from coinbase-notation.test.mjs).
// Each case: the readable run the scanner finds, and the part of it the pool
// actually wrote. The difference between the two columns is the leaning.
const OBSERVED = [
  { height: 960468, pool: 'Foundry USA', run: '/Foundry USA Pool #dropgold/`', wrote: '/Foundry USA Pool #dropgold/' },
  { height: 960463, pool: 'Foundry USA', run: '/Foundry USA Pool #dropgold/', wrote: '/Foundry USA Pool #dropgold/' },
  { height: 960464, pool: 'AntPool', run: 'Mined by AntPool960x', wrote: 'Mined by AntPool' },
  { height: 960465, pool: 'AntPool', run: 'Mined by AntPool ', wrote: 'Mined by AntPool' },
  { height: 960466, pool: 'SECPOOL', run: ' Mined by Secpool v', wrote: 'Mined by Secpool' },
  { height: 960467, pool: 'F2Pool', run: '\u{1F41F}       /F2Pool/f', wrote: '\u{1F41F}       /F2Pool/' },
  { height: 960469, pool: 'F2Pool', run: '\u{1F41F}       /F2Pool/g', wrote: '\u{1F41F}       /F2Pool/' },
  { height: 960281, pool: 'MARA Pool', run: '| MARA Made in USA \u{1F1FA}\u{1F1F8} |v05', wrote: '| MARA Made in USA \u{1F1FA}\u{1F1F8} |v05' },
];

test('the table is well formed', () => {
  const names = new Set();
  for (const pool of POOL_SIGNATURES) {
    assert.ok(pool.name, 'every entry is named');
    assert.ok(!names.has(pool.name), `${pool.name} is listed once`);
    names.add(pool.name);
    assert.ok(Array.isArray(pool.patterns) && pool.patterns.length, `${pool.name} has patterns`);
    for (const p of pool.patterns) {
      assert.ok(p instanceof RegExp, `${pool.name}: a pattern is a regular expression`);
      assert.ok(!p.global, `${pool.name}: no /g — exec must not carry state between calls`);
      // A pattern that can match nothing would claim a zero-width signature at
      // the front of every run.
      assert.ok(!p.test(''), `${pool.name}: a pattern matches the empty string`);
    }
  }
});

test('a signature is cut where the pool stopped writing', () => {
  for (const c of OBSERVED) {
    const hit = findSignature(c.run);
    assert.ok(hit, `block ${c.height}: ${c.run} should be signed`);
    assert.equal(hit.pool, c.pool, `block ${c.height}: whose hand`);
    assert.equal(hit.text, c.wrote, `block ${c.height}: the extent of the signature`);
    assert.equal(c.run.slice(hit.start, hit.end), c.wrote, 'the bounds address the same characters');
  }
});

test('splitting a run keeps every character, in order', () => {
  for (const c of OBSERVED) {
    const parts = splitOnSignature(c.run);
    assert.equal(parts.map((p) => p.text).join(''), c.run, `block ${c.height}: nothing lost`);
    const signed = parts.filter((p) => p.pool);
    assert.equal(signed.length, 1, 'one signature per run here');
    assert.equal(signed[0].text, c.wrote);
  }
  // A run nobody signed comes back whole, so a caller has one shape to handle.
  assert.deepEqual(splitOnSignature('nothing anybody signed'), [{ text: 'nothing anybody signed' }]);
});

test('a run of counter bytes is signed by nobody', () => {
  // Block 960,467's junk, and other printable entropy: the table must not find
  // a hand in it. (The margin no longer quotes such a run at all -- see
  // looksLikeWriting -- but the table is asked directly here.)
  for (const junk of ['KXG&`WY', 'n8*P2q', '\\|4vRt}', '0x0F2b']) {
    assert.equal(findSignature(junk), null, `${junk} is nobody's signature`);
  }
});

test('the earliest hand wins, and the fullest form of it', () => {
  // ViaBTC writes the miner's account inside its own tag; the fuller pattern is
  // the one that should be quoted.
  const hit = findSignature('/ViaBTC/Mined by carbon/');
  assert.equal(hit.pool, 'ViaBTC');
  assert.equal(hit.text, '/ViaBTC/Mined by carbon/');
  // Where two pools' strings sit in one run -- a relayed or copied tag -- the
  // one that comes first is the one the run is cut at, and the other stays in
  // the text either side rather than being silently dropped.
  const both = splitOnSignature('/slush/ and /F2Pool/');
  assert.equal(both[0].pool, 'Braiins Pool');
  assert.equal(both.map((p) => p.text).join(''), '/slush/ and /F2Pool/');
});

test('poolOf reads the runs, never the bytes', () => {
  assert.equal(poolOf(['nothing here', '/Foundry USA Pool #dropgold/']).pool, 'Foundry USA');
  assert.equal(poolOf(['nothing here', 'nor here']), null);
  assert.equal(poolOf([]), null);
});

test('the margin quotes the signature and puts the leaning byte back', { skip: skipNoEngine }, async () => {
  const { composeTransactionFields } = await import('../web/btc-prose.js');
  const { parseTransaction } = await import('../web/btc-tx.js');
  const mark = (hex) => ({ prose: `‹${hex}›`, payloadWords: [] });
  const coinbaseTx = (scriptSig) => '01000000' + '01' + '00'.repeat(32) + 'ffffffff'
    + (scriptSig.length / 2).toString(16).padStart(2, '0') + scriptSig
    + '00000000' + '01' + '0000000000000000' + '0151' + '00000000';

  // Block 960,468's shape: counter, tag, and the counter byte (0x60, a
  // backtick) that the page had been printing inside the quotation marks.
  const scriptSig = heightPush(960468) + '04338b34c2'
    + utf8Hex('/Foundry USA Pool #dropgold/`') + 'd90f1a00';
  const input = composeTransactionFields(parseTransaction(coinbaseTx(scriptSig)), 1, null, mark).inputs[0];
  const script = input.script;

  const quoted = [...script.matchAll(/“([^”]*)”/g)].map((m) => m[1]);
  assert.deepEqual(quoted, ['/Foundry USA Pool #dropgold/'], 'the quotation closes with the pool');
  assert.ok(script.includes('class="pool-sig"'), 'and is marked as a signature');
  assert.ok(script.includes('Foundry USA —'), 'whose hand rides the mark, not the page');

  // The backtick is back among the bytes, and joined to the counter it came
  // from rather than stranded on its own: five bytes, read as the number they
  // are (0x60 then the counter's own d9 0f 1a 00, little-endian).
  const counter = BigInt('0x' + '00' + '1a' + '0f' + 'd9' + '60');
  assert.ok(script.includes(`η⁵ ${factorProse(counter)}`), 'the leaning byte reads as part of the number it came from');
  assert.ok(!/“[^”]*`/.test(script), 'and no longer inside the quotation');

  // Still nothing added and nothing lost: the signature's own text, plus the
  // bytes every mark stands for, is the scriptSig.
  assert.equal(
    heightPush(960468) + '04338b34c2' + utf8Hex(quoted.join('')) + '60d90f1a00',
    scriptSig,
    'the marks, the signature and the margin reconstruct the whole scriptSig',
  );

  // And the reading rides beside the fields, where the annotation layer can
  // take it: the name is available, and it is not in the passage.
  assert.equal(input.signature.pool, 'Foundry USA');
  assert.equal(input.signature.text, '/Foundry USA Pool #dropgold/');
});

test('a margin nobody signed reads exactly as it did before', { skip: skipNoEngine }, async () => {
  const { composeTransactionFields } = await import('../web/btc-prose.js');
  const { parseTransaction } = await import('../web/btc-tx.js');
  const mark = (hex) => ({ prose: `‹${hex}›`, payloadWords: [] });
  // High bytes throughout: nothing here is even printable, let alone a word.
  const scriptSig = heightPush(960470) + 'aabbccddeeff90a1b2c3d4e5f6871f80';
  const tx = '01000000' + '01' + '00'.repeat(32) + 'ffffffff'
    + (scriptSig.length / 2).toString(16).padStart(2, '0') + scriptSig
    + '00000000' + '01' + '0000000000000000' + '0151' + '00000000';
  const input = composeTransactionFields(parseTransaction(tx), 1, null, mark).inputs[0];
  assert.equal(input.signature, null, 'no hand claimed');
  assert.ok(!input.script.includes('pool-sig'));
  // Sixteen bytes is past what a counter can be, so the margin stays one
  // passage of prose rather than becoming a forty-digit figure.
  assert.ok(input.script.includes('‹aabbccddeeff90a1b2c3d4e5f6871f80›'), 'the margin is one passage of prose');
});
