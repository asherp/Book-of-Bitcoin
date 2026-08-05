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

import { growthStage, GROWTH_STAGES, generateSymbol, interpretFrom, sizeBoost } from '../web/btc-illumination.js';

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

// ─── the real case: an anchor flush against the prose it marks ────────────
// The book's actual sigla open directly against a script's first letter and
// close directly against its last, no gap either side (confirmed against a
// live screenshot) -- so the anchor is very often already INSIDE the padded
// rectangle of the line it sits on. No steering escapes an obstacle you
// start inside of; interpretFrom carves one exception for exactly this
// (see homeRect in the source) rather than dying on the first step.
test('an anchor embedded in its own text line still escapes and grows', () => {
  const symbol = 'F'.repeat(30);
  const homeLine = { x: -50, y: -4, w: 400, h: 8 }; // the very line the mark sits on
  const anchor = { x: 0, y: 0, angle: -Math.PI / 2 }; // heading straight up, out of the line
  const points = interpretFrom(symbol, anchor, [homeLine], null, noJitterRng).flatMap((s) => s.points);

  assert.ok(pointInRect(anchor.x, anchor.y, homeLine), 'test is only meaningful if the anchor truly starts inside its own line');
  assert.ok(points.length > 10, 'an embedded anchor must still be able to grow once it clears its own line');
});

test('once clear of its home line, the SAME rect blocks it again -- escape is one-way, not a standing exemption', () => {
  // Straight up and out, a clean 180 (7 * 24 degrees is just past 168, near
  // enough to a U-turn for this check), then a long run aimed back down at
  // the very line it started on.
  const symbol = 'F'.repeat(3) + '-'.repeat(7) + 'F'.repeat(25);
  const homeLine = { x: -50, y: -6, w: 400, h: 16 }; // a realistic line height, not a sliver
  const anchor = { x: 0, y: 0, angle: -Math.PI / 2 };
  const points = interpretFrom(symbol, anchor, [homeLine], null, noJitterRng).flatMap((s) => s.points);

  // Touching the near edge while wall-following is expected and fine (that
  // IS the intended behaviour); what "resumes blocking" actually rules out
  // is coming back out the OTHER side, i.e. deep penetration clear through
  // the rectangle it just escaped.
  // Skip the very first point: it's the anchor itself, which starts deep
  // inside its home line by construction (see the preceding test) -- that
  // is expected and not what this test is checking.
  const deepMargin = 4;
  const deepInside = points.slice(1).filter((p) =>
    p.x > homeLine.x + deepMargin && p.x < homeLine.x + homeLine.w - deepMargin
    && p.y > homeLine.y + deepMargin && p.y < homeLine.y + homeLine.h - deepMargin);
  assert.equal(deepInside.length, 0, 'the home line must resume blocking once the vine has left it, not stay punched through');
});

// ─── size-scaled growth: a big sigil earns more generations, not a re-roll ─
test('sizeBoost is zero at or below the baseline -- most sigla are ordinary', () => {
  assert.equal(sizeBoost(16, 16), 0);
  assert.equal(sizeBoost(10, 16), 0);
  assert.equal(sizeBoost(0, 16), 0);
});

test('sizeBoost grows monotonically with size and is capped', () => {
  const small = sizeBoost(16, 16);
  const medium = sizeBoost(32, 16);   // a 2x mark, e.g. a larger citation glyph
  const large = sizeBoost(54, 16);    // ~3.4em against a 16px body -- the drop cap's own ratio
  const huge = sizeBoost(100000, 16); // absurdly large, must still be capped
  assert.ok(small < medium, 'a 2x mark should out-boost the baseline');
  assert.ok(medium < large, 'the drop cap ratio should out-boost a merely-larger mark');
  assert.ok(large <= huge && huge <= 6, 'boost must saturate rather than growing without bound');
});

test('repeated leaves at the same unmoved point collapse instead of stacking into a blob', () => {
  // A heavily branched symbol forks far more attempts than a cramped spot
  // has room for; most die on step one and would otherwise land a leaf
  // right back at the exact same point every time (see the 'L' handling's
  // comment). Simulate the worst case directly: fifty leaf-only branches,
  // none of which ever move at all.
  const symbol = '[L]'.repeat(50);
  const anchor = { x: 0, y: 0, angle: 0 };
  const segments = interpretFrom(symbol, anchor, [], null, noJitterRng);
  const totalLeaves = segments.reduce((n, s) => n + s.leaves.length, 0);
  assert.equal(totalLeaves, 1, 'fifty leaves at the identical point should collapse to one, not stack');
});

test('generateSymbol\'s boost extends the SAME per-block derivation, capped, and caches correctly', () => {
  const hash = 'illuminated-initial-test'.padEnd(64, '0');
  const base = generateSymbol(hash, 2, 0);
  const boosted = generateSymbol(hash, 2, 4);
  assert.notEqual(base, boosted, 'a boosted anchor should read further into the derivation, not stop at the same generation');
  // Asking again for the unboosted generation must return exactly what it did
  // before -- computing the boosted (later) generation must not retroactively
  // change an earlier one that's already been read and cached.
  assert.equal(generateSymbol(hash, 2, 0), base);
  // An outlandish boost is clamped by MAX_GENERATION rather than growing the
  // derivation without bound.
  const capped1 = generateSymbol(hash, 4, 1000);
  const capped2 = generateSymbol(hash, 4, 1000);
  assert.equal(capped1, capped2, 'a capped boost must still be deterministic/cached, not recomputed differently');
});
