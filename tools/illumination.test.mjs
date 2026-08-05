// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/illumination.test.mjs — the pure, DOM-free half of btc-illumination.js:
// the confirmation-count -> growth-stage buckets, the L-system's symbolic
// output, and the turtle's wall-following against synthetic obstacles.
// All three are plain geometry/math with no DOM dependency, which is what
// makes them checkable here instead of only eyeballed in a browser screenshot.
//
// The stage/symbol tests guard stability (see issue #73): same inputs, same
// stage, same grown string, every time -- and DIFFERENT blockHash/stage
// inputs must not collide on the same cached string. The wall-following
// tests guard the actual point of this feature: a vine that meets a
// rectangle of prose must trace along its edge -- never cross into it --
// rather than just deflecting away at a random angle.
//
//   node --test tools/illumination.test.mjs

import test from 'node:test';
import assert from 'node:assert/strict';

import { growthStage, GROWTH_STAGES, generateSymbol, interpretFrom } from '../web/btc-illumination.js';

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

// ─── wall-following: a vine that meets a rectangle traces its edge ────────
// A fixed (non-hex-seeded) rng with no jitter, so these tests are about the
// geometry of the collision response, not about a particular random draw.
const noJitterRng = () => 0.5; // JITTER/deflection center exactly on the unturned heading

function pointInRect(x, y, r) { return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h; }

test('a vine heading straight into a rectangle turns to follow its edge rather than stopping', () => {
  const symbol = 'F'.repeat(40); // one long, unbranched trunk
  const anchor = { x: 0, y: 50, angle: 0 }; // heading due east
  const rect = { x: 20, y: 0, w: 60, h: 100 }; // spans the anchor's whole path ahead
  const segments = interpretFrom(symbol, anchor, [rect], null, noJitterRng);
  const points = segments.flatMap((s) => s.points);

  assert.ok(points.length > 10, 'the trunk should keep advancing along the edge, not die on first contact');
  for (const p of points) {
    assert.ok(!pointInRect(p.x, p.y, rect), `point (${p.x},${p.y}) fell inside the rectangle it should be tracing around`);
  }
});

test('wall-following runs a stretch of edge-parallel steps, not a single deflection', () => {
  const symbol = 'F'.repeat(40);
  const anchor = { x: 0, y: 50, angle: 0 };
  const rect = { x: 20, y: 0, w: 60, h: 100 };
  const points = interpretFrom(symbol, anchor, [rect], null, noJitterRng).flatMap((s) => s.points);

  // Once the trunk meets the rectangle's left edge (x ~ 20) it should run
  // several consecutive steps that stay close to that x while y keeps
  // changing monotonically -- i.e. it climbs the edge, corner included,
  // rather than bouncing off at one random angle and drifting away.
  const nearEdge = points.filter((p) => Math.abs(p.x - rect.x) < 8);
  assert.ok(nearEdge.length >= 6, `expected a real run of edge-hugging points, got ${nearEdge.length}`);
  let monotonic = 0;
  for (let i = 1; i < nearEdge.length; i++) if (nearEdge[i].y > nearEdge[i - 1].y) monotonic++;
  assert.ok(monotonic >= nearEdge.length - 2, 'the edge-hugging run should climb steadily in one direction, not oscillate');
});

test('a vine with room to spare never touches a rectangle nowhere near its path', () => {
  const symbol = 'F'.repeat(10);
  const anchor = { x: 0, y: 0, angle: 0 };
  const farRect = { x: 500, y: 500, w: 50, h: 50 };
  const points = interpretFrom(symbol, anchor, [farRect], null, noJitterRng).flatMap((s) => s.points);
  assert.equal(points.length, 11, 'an unobstructed trunk should just walk straight, one point per F plus the anchor');
});
