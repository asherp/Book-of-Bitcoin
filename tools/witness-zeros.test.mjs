// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/witness-zeros.test.mjs — the ⓪ⁿ mark one register down from the miner's
// margin: in a witness item, in a Taproot control block, and in a data push
// inside a script. The margin's own case lives in coinbase-notation.test.mjs;
// what is checked here is that the same trade holds where the zeros are not a
// pool's unfilled template, and that it stays exactly reconstructable.
//
//   node --test tools/
//
// Imports btc-prose.js, which pulls in the Glossia WASM bundle, so the suite
// skips until web/glossia.js is built. Nothing here calls the engine: every
// case passes its own recording encoder, so what is under test is which bytes
// the book decides to say, not what it says them as.

import test from 'node:test';
import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';

const engineBuilt = await access(new URL('../web/glossia.js', import.meta.url)).then(() => true, () => false);
const skipNoEngine = !engineBuilt && 'web/glossia.js not built';

// The encoder stands in for Glossia and records what it was handed, so a byte
// that reached the page as prose is distinguishable from one that reached it as
// a mark.
const say = (hex) => `‹${hex}›`;

// Rendered HTML -> the bytes it carries as data, in the order it carries them:
// a prose span is the hex it was handed, a ⓪ⁿ mark is n zero bytes. This is the
// book's promise performed on its own output — whatever register a datum
// reached the page in, it comes back, and in its place. (Opcodes and push
// prefixes are notation, not data, and are not counted here.)
const SUPERSCRIPTS = '⁰¹²³⁴⁵⁶⁷⁸⁹';
function dataOf(html) {
  const out = [];
  for (const m of html.matchAll(new RegExp(`‹([0-9a-f]*)›|⓪([${SUPERSCRIPTS}]+)`, 'g'))) {
    if (m[1] !== undefined) out.push(m[1]);
    else out.push('00'.repeat(Number([...m[2]].map((c) => SUPERSCRIPTS.indexOf(c)).join(''))));
  }
  return out.join('');
}

// The activation-day script-path spend in block 709,635 (§103.b), whose control
// block names an internal key of x = 1 — a nothing-up-my-sleeve value, and 31
// zero bytes ahead of the one byte that carries anything.
const NUMS_KEY = '00'.repeat(31) + '01';
const CONTROL = 'c0' + NUMS_KEY;
const KEY_A = 'c13e6d193f5d04506723bd67abcc5d31b610395c445ac6744cb0a1846b3aabae';
const KEY_B = 'b0e2e48ad7c3d776cf6f2395c504dc19551268ea7429496726c5d5bf72f9333c';
// λh₁ h₂. h₁ ∇ h₂ ∇₊ ① ≐ — a one-of-two leaf: CHECKSIG, CHECKSIGADD, 1 NUMEQUAL.
const TAPSCRIPT = `20${KEY_A}ac20${KEY_B}ba519c`;
const SIGNATURE = '0adf90fd381d4a13c3e73740b337b230701189ed94abcb4030781635f035e6d3b'
  + '50b8506470a68292a2bc74745b7a5732a28254b5f766f09e495929ec308090b01';
const WITNESS = [SIGNATURE, '', TAPSCRIPT, CONTROL];

test('a control block’s internal key reads its zeros as a count', { skip: skipNoEngine }, async () => {
  const { renderWitness } = await import('../web/btc-prose.js');
  const html = renderWitness(WITNESS, say);

  assert.match(html, /⓪³¹/, 'thirty-one zero bytes take the mark');
  assert.ok(html.includes('‹01›'), 'and the byte that carries something is still said');
  assert.ok(!html.includes(`‹${NUMS_KEY}›`), 'the key is no longer said whole');
  // The mark stands under p, where the key is — the control byte still opens
  // the item and the decomposition is unchanged.
  assert.match(html, /vc0₀.*⓪³¹/s, 'the control byte still opens the item');
  // Nothing was lost. Every datum comes back in place: the signature, the
  // leaf's two keys, then the internal key with its zeros restored.
  assert.equal(dataOf(html), SIGNATURE + KEY_A + KEY_B + NUMS_KEY, 'the reading is its own witness');
});

test('the mark claims a pool’s template only in the margin', { skip: skipNoEngine }, async () => {
  const { renderWitness } = await import('../web/btc-prose.js');
  const html = renderWitness(WITNESS, say);
  const title = /<span class="op op-zeros" title="([^"]*)"/.exec(html)?.[1];
  assert.ok(title, 'the mark carries a hover');
  assert.equal(title, '31 zero bytes. The count restores the bytes exactly',
    'outside a coinbase the bytes state only that they are zero');
});

test('a wholly zero data item is the mark and nothing else', { skip: skipNoEngine }, async () => {
  const { renderWitness } = await import('../web/btc-prose.js');
  // Not a coinbase's reserved value — an all-zero witness reads ∅ a level up,
  // via witnessZero — but a zero item standing beside a live one.
  const html = renderWitness(['aa'.repeat(20), '00'.repeat(8)], say);
  assert.match(html, /⓪⁸/);
  assert.ok(!html.includes('‹›'), 'no empty prose span is emitted beside it');
  assert.equal(dataOf(html), 'aa'.repeat(20) + '00'.repeat(8));
});

test('under the floor a zero stays prose, in the witness as in the margin', { skip: skipNoEngine }, async () => {
  const { renderWitness } = await import('../web/btc-prose.js');
  const item = 'aa' + '00'.repeat(3) + 'bb';
  const html = renderWitness([item], say);
  assert.ok(!html.includes('⓪'), 'three zero bytes are a small number, not a run');
  assert.ok(html.includes(`‹${item}›`), 'so the item is said whole');
});

test('a data push inside a script takes the mark too', { skip: skipNoEngine }, async () => {
  const { renderScript } = await import('../web/btc-prose.js');
  // The shape an inscription's payload has: image bytes with the padding of
  // whatever was encoded sitting in the middle of one push. This is where
  // nearly every long run in witness prose actually lives.
  const payload = 'aa'.repeat(10) + '00'.repeat(20) + 'bb'.repeat(50);
  const html = renderScript(`4c50${payload}`, say);
  assert.match(html, /⓪²⁰/, 'the padding reads as its count');
  assert.ok(html.includes(`‹${'aa'.repeat(10)}›`) && html.includes(`‹${'bb'.repeat(50)}›`),
    'and the bytes either side are said as themselves');
  assert.equal(dataOf(html), payload, 'the push rejoins exactly');
});

test('the engine is called once per surviving span, never for a run of zeros', { skip: skipNoEngine }, async () => {
  const { renderWitness } = await import('../web/btc-prose.js');
  const calls = [];
  renderWitness([CONTROL], (hex) => { calls.push(hex); return `‹${hex}›`; });
  assert.deepEqual(calls, ['01'], 'only the byte that carries something is encoded');
});
