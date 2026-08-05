// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/illumination.test.mjs — the pure, DOM-free half of btc-illumination.js:
// the confirmation-count -> growth-stage buckets, and the L-system's symbolic
// output. Both are meant to be stable regardless of viewport (see issue #73),
// so what this guards is exactly that stability: same inputs, same stage,
// same grown string, every time -- and DIFFERENT blockHash/stage inputs must
// not collide on the same cached string.
//
//   node --test tools/illumination.test.mjs

import test from 'node:test';
import assert from 'node:assert/strict';

import { growthStage, GROWTH_STAGES, generateSymbol } from '../web/btc-illumination.js';

test('growthStage buckets confirmation count, not a continuous scale', () => {
  assert.equal(growthStage(0), 0, 'unconfirmed is stage 0 (bare)');
  assert.equal(growthStage(1), 1);
  assert.equal(growthStage(5), 1);
  assert.equal(growthStage(6), 2);
  assert.equal(growthStage(143), 2);
  assert.equal(growthStage(144), 3);
  assert.equal(growthStage(4031), 3);
  assert.equal(growthStage(4032), 4);
  assert.equal(growthStage(1_000_000), 4, 'stage saturates rather than growing without bound');
});

test('GROWTH_STAGES bucket edges are contiguous (no confirmation count falls through)', () => {
  for (let i = 1; i < GROWTH_STAGES.length; i++) {
    assert.equal(GROWTH_STAGES[i].min, GROWTH_STAGES[i - 1].max + 1,
      `gap between stage ${i - 1} and stage ${i}`);
  }
});

test('generateSymbol is deterministic for the same (blockHash, stage)', () => {
  const hash = '00000000000000000009a5b2b9c4de6c9c1c9b3e9e9a5b2b9c4de6c9c1c9b3e';
  const a = generateSymbol(hash, 3);
  const b = generateSymbol(hash, 3);
  assert.equal(a, b, 'same block + stage must read the same to every visitor');
});

test('generateSymbol differs across stages of the same block', () => {
  const hash = 'cafebabe'.repeat(8);
  const stages = GROWTH_STAGES.map((_, i) => generateSymbol(hash, i));
  assert.equal(stages[0], 'F', 'stage 0 has no iterations -- the bare axiom');
  const unique = new Set(stages);
  assert.ok(unique.size > 1, 'deeper stages should not all collapse to the same growth');
});

test('generateSymbol differs across two different block hashes at the same stage', () => {
  const a = generateSymbol('1111111111111111111111111111111111111111111111111111111111111111', 3);
  const b = generateSymbol('2222222222222222222222222222222222222222222222222222222222222222', 3);
  assert.notEqual(a, b, 'two different blocks should not illuminate identically');
});

test('generateSymbol only ever grows F -- L/+/-/[/] are terminal under this grammar', () => {
  const sym = generateSymbol('deadbeef'.repeat(8), 4);
  assert.match(sym, /^[FL+\-\[\]]+$/, 'symbol string must stay within the L-system alphabet');
});
