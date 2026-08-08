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

import { growthStage, GROWTH_STAGES, generateSymbol, interpretFrom, sizeBoost, params, resetDerivations } from '../web/btc-illumination.js';

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

test('a leash keeps growth near its own anchor, however long the F budget or however wide bounds is', () => {
  // A viewport-wide `bounds` has no natural corner the way a real obstacle
  // does: once wall-following turns a step to run parallel to it, that
  // direction stops being "blocked" at all, and a long unbroken run in the
  // derivation just keeps going -- reading as a separate flourish smeared
  // across the page rather than something that grew from its anchor
  // (confirmed against a real mobile screenshot on issue #73, where the
  // drop cap's growth rode the top edge across most of the viewport's
  // width). A long unbranched run starting right at the edge is the worst
  // case: a hundred F's of budget, nothing else in its way, free to run
  // parallel to the edge indefinitely once turned onto it.
  const symbol = 'F'.repeat(100);
  const anchor = { x: 0, y: 2, angle: -Math.PI / 2 }; // just inside, heading straight up into the top edge
  const bounds = { x: -1000, y: 0, w: 2000, h: 500 };
  const maxReach = 60;
  const points = interpretFrom(symbol, anchor, [], bounds, noJitterRng, maxReach).flatMap((s) => s.points);
  for (const p of points) {
    const dist = Math.hypot(p.x - anchor.x, p.y - anchor.y);
    assert.ok(dist <= maxReach + 1, `point at distance ${dist.toFixed(1)} exceeds the leash (${maxReach})`);
  }
});

test('with no leash given (maxReach omitted), growth is unbounded -- existing callers see no change', () => {
  const symbol = 'F'.repeat(20);
  const anchor = { x: 0, y: 0, angle: 0 };
  const points = interpretFrom(symbol, anchor, [], null, noJitterRng).flatMap((s) => s.points);
  const last = points[points.length - 1];
  assert.ok(Math.hypot(last.x - anchor.x, last.y - anchor.y) > 100, 'an unleashed walk should travel freely, same as before this option existed');
});

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

// A floated CSS drop cap can make Range.getClientRects() report TWO
// overlapping rects for the same visual line -- the glyph's own box, and
// the line box the float sits in (confirmed against the real page: see
// issue #73's illuminated-initial work). Escaping only one of the two
// left the anchor still trapped in the other; both must be exempted.
test('an anchor embedded in TWO overlapping rects escapes both, not just the first found', () => {
  const symbol = 'F'.repeat(30);
  const glyphBox = { x: -5, y: -10, w: 20, h: 15 };     // the drop cap's own tight box
  const lineBox = { x: -50, y: -10, w: 500, h: 100 };    // the float's much larger line box
  const anchor = { x: 0, y: 0, angle: -Math.PI / 2 };    // heading straight up
  assert.ok(pointInRect(anchor.x, anchor.y, glyphBox) && pointInRect(anchor.x, anchor.y, lineBox),
    'test is only meaningful if the anchor starts inside both rects at once');

  const points = interpretFrom(symbol, anchor, [glyphBox, lineBox], null, noJitterRng).flatMap((s) => s.points);
  assert.ok(points.length > 10, 'an anchor embedded in two overlapping rects must still escape and grow, not stall on the second one');
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

// ─── live tuning: params is read at call time, not captured at module load ─
// This is what the whole point of exposing `params` depends on -- a tuning
// widget mutates it directly and expects the very next call to answer
// differently, with no other API. Each test restores what it changed so the
// rest of the suite (run in the same process) still sees the documented
// defaults.
test('params.step is read live -- changing it changes the turtle\'s own step length', () => {
  const original = params.step;
  try {
    const anchor = { x: 0, y: 0, angle: 0 };
    params.step = 20;
    const points = interpretFrom('FF', anchor, [], null, noJitterRng).flatMap((s) => s.points);
    assert.equal(points[1].x, 20, 'the first F should move by the CURRENT params.step, not a value fixed at module load');
  } finally { params.step = original; }
});

test('params.turnDeg is read live -- changing it changes how far "+"/"-" turn', () => {
  const original = params.turnDeg;
  try {
    const anchor = { x: 0, y: 0, angle: 0 };
    params.turnDeg = 90;
    const points = interpretFrom('F+F', anchor, [], null, noJitterRng).flatMap((s) => s.points);
    // After a 90 degree left turn from heading east, the second F should
    // move straight down (y increases, x barely changes) rather than the
    // ~24 degree default's much shallower turn.
    assert.ok(Math.abs(points[2].x - points[1].x) < 1, `a 90 degree turn should move nearly straight in y, got dx=${points[2].x - points[1].x}`);
  } finally { params.turnDeg = original; }
});

test('geometryScale scales step distance -- keeps decoration in proportion to font size', () => {
  const anchor = { x: 0, y: 0, angle: 0 };
  const unscaled = interpretFrom('FF', anchor, [], null, noJitterRng, Infinity, 1).flatMap((s) => s.points);
  const doubled = interpretFrom('FF', anchor, [], null, noJitterRng, Infinity, 2).flatMap((s) => s.points);
  assert.equal(doubled[1].x, unscaled[1].x * 2, 'doubling geometryScale should double each step\'s distance');
});

test('geometryScale defaults to 1 -- an unscaled caller sees no change', () => {
  const anchor = { x: 0, y: 0, angle: 0 };
  const withDefault = interpretFrom('FF', anchor, [], null, noJitterRng).flatMap((s) => s.points);
  const explicit1 = interpretFrom('FF', anchor, [], null, noJitterRng, Infinity, 1).flatMap((s) => s.points);
  assert.deepEqual(withDefault, explicit1);
});

test('resetDerivations() is required for a grammar change to actually take effect on an already-seen block', () => {
  const hash = 'params-live-tuning-test'.padEnd(64, '1');
  const before = generateSymbol(hash, 4, 0);
  const originalProductions = params.productions;
  try {
    // Force every production to the richest, always-branching rule -- a
    // maximally different grammar from the default table.
    params.productions = [{ weight: 1, to: 'F[+F][-F]F', reserved: false }];
    // Without clearing the cache, this block's already-computed passes are
    // still sitting in derivationCache and must be returned unchanged.
    assert.equal(generateSymbol(hash, 4, 0), before, 'a grammar change must not silently alter an already-cached derivation');
    resetDerivations();
    const after = generateSymbol(hash, 4, 0);
    assert.notEqual(after, before, 'after resetDerivations(), the SAME block should re-derive under the NEW grammar');
  } finally {
    params.productions = originalProductions;
    resetDerivations(); // leave no trace of the temporary grammar for later tests
  }
});

// ─── riding the sigil's own outline ───────────────────────────────────────
// The rail is plain geometry once measureAnchors has built it (a polyline in
// host space, a start index, a direction), so it can be handed to
// interpretFrom directly here -- no DOM, no font, no glyph parsing. A square
// contour stands in for a letterform: big enough to ride for several steps,
// and closed, so following it far enough necessarily returns to the start,
// which is the case the departure rule exists for.
function squareRail(size = 40, samplesPerSide = 40) {
  const pts = [];
  const push = (x, y) => pts.push({ x, y });
  for (let i = 0; i < samplesPerSide; i++) push(size * (i / samplesPerSide), 0);
  for (let i = 0; i < samplesPerSide; i++) push(size, size * (i / samplesPerSide));
  for (let i = 0; i < samplesPerSide; i++) push(size - size * (i / samplesPerSide), size);
  for (let i = 0; i < samplesPerSide; i++) push(0, size - size * (i / samplesPerSide));
  return { pts, startIdx: 0, dir: 1, tangent: 0, cx: size / 2, cy: size / 2 };
}

test('a railed anchor traces its glyph contour instead of striking out straight', () => {
  const rail = squareRail();
  const anchor = { x: 0, y: 0, angle: 0, rail };
  // Straight 'F's: with no rail this is a horizontal line; with one it has
  // to turn the contour's first corner.
  const points = interpretFrom('FFFFFFFFFF', anchor, [], null, noJitterRng, Infinity, 1)
    .flatMap((s) => s.points);
  const turned = points.some((p) => p.y > 5);
  assert.ok(turned, 'growth should have followed the contour around its corner, not run straight');
  // Every railed point sits on the contour itself (within a sample's width).
  const onRail = points.slice(0, 6).every((p) =>
    rail.pts.some((q) => Math.hypot(q.x - p.x, q.y - p.y) < 2));
  assert.ok(onRail, 'the opening run should lie on the contour');
});

test('the rail is abandoned before the contour closes back onto its own trail', () => {
  const rail = squareRail();
  const anchor = { x: 0, y: 0, angle: 0, rail };
  // Far more F's than the 160px contour has room for at a 7px step (~23),
  // so an unguarded rail would lap it and redraw its own opening.
  const points = interpretFrom('F'.repeat(120), anchor, [], null, noJitterRng, Infinity, 1)
    .flatMap((s) => s.points);
  // No point may come back onto the start after the walk has left it.
  const returned = points.slice(12).filter((p) => Math.hypot(p.x, p.y) < 4).length;
  assert.equal(returned, 0, 'the walk lapped the contour and closed back onto its own start');
});

test('params.glyphFollowMax caps the railed run, and 0 disables railing outright', () => {
  const rail = squareRail();
  const anchor = { x: 0, y: 0, angle: 0, rail };
  const original = params.glyphFollowMax;
  try {
    params.glyphFollowMax = 0;
    const free = interpretFrom('FFFFFF', anchor, [], null, noJitterRng, Infinity, 1)
      .flatMap((s) => s.points);
    // With no railed steps allowed the very first move is the ordinary one:
    // the departure turn off the contour, then a straight walk.
    assert.ok(free.every((p) => Math.abs(p.y) < 1e-9 || p.x !== 0),
      'with glyphFollowMax 0 the walk should not be tracing the contour');
    params.glyphFollowMax = 3;
    const capped = interpretFrom('F'.repeat(40), anchor, [], null, noJitterRng, Infinity, 1)
      .flatMap((s) => s.points);
    const onRail = capped.filter((p) => rail.pts.some((q) => Math.hypot(q.x - p.x, q.y - p.y) < 1.5));
    assert.ok(onRail.length <= 6, `expected the railed run capped near 3 steps, got ${onRail.length} on-contour points`);
  } finally {
    params.glyphFollowMax = original;
  }
});

test('an anchor with no rail behaves exactly as it did before', () => {
  const anchor = { x: 0, y: 0, angle: 0 };
  const points = interpretFrom('FFFFF', anchor, [], null, noJitterRng, Infinity, 1)
    .flatMap((s) => s.points);
  assert.ok(points.every((p) => Math.abs(p.y) < 1e-9), 'an unrailed straight run should stay straight');
});

// ─── numerals are not sigla ───────────────────────────────────────────────
// The generated outline set (web/sigla-outlines.js, from
// tools/sigla-outlines/extract.mjs) is what decides which marks a vine can
// trace. A count riding a mark is apparatus, not notation -- β's subscript
// says how many leading zero bits, a direct push's superscript how many
// bytes -- so no figure gets an outline, and no vine traces the shape of
// one. Guarded here because the rule lives in a build step nobody runs by
// hand, and a regenerate that quietly readmitted the numerals would leave
// no other trace.
const { SIGLA_OUTLINES } = await import('../web/sigla-outlines.js');

test('no numeral carries an outline -- a count is apparatus, not a mark', () => {
  const digits = Object.keys(SIGLA_OUTLINES).filter((ch) => /[0-9²³¹⁰-⁹₀-₉]/.test(ch));
  assert.deepEqual(digits, [], `numerals must not be sigla, found ${JSON.stringify(digits)}`);
});

test('the enclosed digits ⓪ ①–⑯ DO keep theirs -- they are the marks, not counts', () => {
  // OP_0..OP_16 are written as single enclosed glyphs; the notation has no
  // other way to write them, so the rule above must not sweep them up.
  for (const ch of '⓪①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯') {
    assert.ok(SIGLA_OUTLINES[ch], `${ch} is an opcode mark and needs its outline`);
  }
});

test('the marks a passage actually grows from still carry outlines', () => {
  // A spot check across the families, so a filter that went too wide shows up
  // as a missing letterform rather than as silently plainer decoration.
  for (const ch of ['β', '∇', '⧉', '⌘', '⌖', '◆', '▼', 'τ', 'Δ', 'σ', 'ρ', 'Σ', '∅', '●']) {
    assert.ok(SIGLA_OUTLINES[ch], `${ch} should have an outline`);
  }
});
