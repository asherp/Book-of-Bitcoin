// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/chainwork.test.mjs — that the book's own sum is the number Bitcoin
// Core keeps, and that it says nothing where it knows nothing.
//
//   node --test tools/chainwork.test.mjs
//
// The expected values are getblockheader's `chainwork` at each height, copied
// from a node. That is the whole point of the file: the derivation in
// web/btc-chainwork.js takes a different route to the number than Core does --
// per epoch rather than per block, from vendored nBits rather than a validated
// index -- so agreeing to all 64 hex digits at seven heights across seventeen
// years is a real check on the arithmetic and on the table it reads.
//
// No network. A test that phones a node tests the node.

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  bitsToTarget, blockWork, difficultyOf, chainWork, formatWork,
  EPOCH_BITS, RETARGET_INTERVAL, LAST_HEIGHT,
  DIFFICULTY_1_TARGET, WORK_PER_DIFFICULTY,
} from '../web/btc-chainwork.js';

// height -> getblockheader(...).chainwork, from Bitcoin Core.
const KNOWN = [
  [0,      '0000000000000000000000000000000000000000000000000000000100010001'], // genesis
  [1,      '0000000000000000000000000000000000000000000000000000000200020002'],
  [2015,   '000000000000000000000000000000000000000000000000000007e007e007e0'], // last of epoch 0
  [2016,   '000000000000000000000000000000000000000000000000000007e107e107e1'], // first of epoch 1
  [210000, '00000000000000000000000000000000000000000000002218a01c35910b0060'], // first halving
  [500000, '000000000000000000000000000000000000000000cda532266f9147b519e933'],
  [900000, '0000000000000000000000000000000000000000c8bbeae4127a204b0317861c'],
];

test('the derived sum is the chainwork a node reports', () => {
  for (const [height, expected] of KNOWN) {
    assert.equal(formatWork(chainWork(height)), expected, `height ${height}`);
  }
});

test('genesis calibrates difficulty against work', () => {
  // Genesis is mined at exactly difficulty 1, so it fixes the constant the
  // whole file rests on -- and shows it is not 2^32.
  assert.equal(bitsToTarget('1d00ffff'), DIFFICULTY_1_TARGET);
  assert.equal(difficultyOf('1d00ffff'), 1);
  assert.equal(blockWork('1d00ffff'), 4295032833n);
  assert.equal(WORK_PER_DIFFICULTY, 4295032833n);
  assert.notEqual(WORK_PER_DIFFICULTY, 1n << 32n);

  // Difficulty 1 for one block IS the chainwork at genesis.
  assert.equal(chainWork(0), blockWork(EPOCH_BITS[0]));
});

test('work is a hash count, not the difficulty beside it', () => {
  // The two are proportional block by block, by that same constant, and the
  // 2^32 shortcut is low by about 1.5e-5 -- small, and not nothing.
  // Within difficultyOf's own precision: it rounds to six decimals, which at
  // low difficulty is the whole of the residual here.
  for (const bits of ['1d00ffff', '1c0d3142', '17023ad4']) {
    const ratio = Number(blockWork(bits)) / difficultyOf(bits);
    assert.ok(Math.abs(ratio / Number(WORK_PER_DIFFICULTY) - 1) < 1e-6, bits);
  }
  const shortcut = Number(1n << 32n) / Number(WORK_PER_DIFFICULTY);
  assert.ok(Math.abs(1 - shortcut - 1.526e-5) < 1e-7, 'the 2^32 shortcut is 1.5e-5 low');

  // A harder block is worth more work, so the relation inverts the target.
  assert.ok(blockWork('17023ad4') > blockWork('1d00ffff'));
  assert.ok(bitsToTarget('17023ad4') < bitsToTarget('1d00ffff'));
});

test('the sum runs over blocks, so an epoch is flat', () => {
  // Every block in an epoch is worth the same, which is what lets the sum
  // collapse. Across the boundary it steps, and only there.
  const w = blockWork(EPOCH_BITS[1]);
  assert.equal(chainWork(2017) - chainWork(2016), w);
  assert.equal(chainWork(4031) - chainWork(4030), w);
  assert.equal(chainWork(4032) - chainWork(4031), blockWork(EPOCH_BITS[2]));

  // An epoch's whole contribution is 2016 identical terms.
  assert.equal(chainWork(4031) - chainWork(2015), BigInt(RETARGET_INTERVAL) * w);
});

test('the table is a mainnet retarget history', () => {
  assert.equal(EPOCH_BITS[0], '1d00ffff', 'genesis epoch is difficulty 1');
  // The early chain sat at difficulty 1 until enough hashrate arrived to move
  // it; nothing after that ever returns to the floor.
  assert.ok(EPOCH_BITS.slice(0, 16).every((b) => b === '1d00ffff'));
  assert.ok(EPOCH_BITS.slice(16).every((b) => b !== '1d00ffff'));
  for (const bits of EPOCH_BITS) {
    assert.match(bits, /^[0-9a-f]{8}$/, bits);
    assert.ok(blockWork(bits) > 0n, bits);
  }
  assert.equal(LAST_HEIGHT, EPOCH_BITS.length * RETARGET_INTERVAL - 1);
});

test('a height the table cannot speak for gets no answer', () => {
  // Silence past the vendored epochs, rather than a sum that quietly stops
  // early and reads like a smaller chain.
  assert.equal(chainWork(LAST_HEIGHT + 1), null);
  assert.ok(chainWork(LAST_HEIGHT) > 0n);
  assert.equal(chainWork(-1), null);
  assert.equal(chainWork(NaN), null);
  assert.equal(chainWork('nonsense'), null);
  assert.equal(formatWork(null), null);
});

test('nBits that no header would carry are refused', () => {
  assert.equal(bitsToTarget('00000000'), null, 'a zero target');
  assert.equal(bitsToTarget('1d800000'), null, 'the sign bit set');
  assert.equal(bitsToTarget(-1), null);
  assert.equal(bitsToTarget('100000000'), null, 'wider than four bytes');
  assert.equal(blockWork('00000000'), null);

  // The compact form's small-exponent branch, which mainnet never uses and
  // which is easy to get backwards.
  assert.equal(bitsToTarget('03123456'), 0x123456n, 'exponent 3 is the mantissa itself');
  assert.equal(bitsToTarget('02123456'), 0x1234n, 'below 3 it shifts down, not up');
  assert.equal(bitsToTarget('0100ffff'), null, 'shifted away to nothing');
});

test('chainwork is what fork choice compares, so it only grows', () => {
  // Monotone across every retarget in the record -- a chain never gets lighter,
  // however far difficulty falls.
  let previous = 0n;
  for (let e = 0; e < EPOCH_BITS.length; e++) {
    const at = chainWork(e * RETARGET_INTERVAL);
    assert.ok(at > previous, `epoch ${e} did not add work`);
    previous = at;
  }
});
