// SPDX-License-Identifier: MIT OR Apache-2.0
//
// btc-illumination.js — a procedural decoration layer, prototype stage (see
// issue #73): vines grown from the sigla the way a scribe's marginalia grows
// from a manuscript's initials, deeper the longer a chapter has stood
// confirmed. This module only ever reads the DOM the rest of the book already
// produced (see btc-prose.js / bitcoin-book.html) — it has no dependency on
// Glossia or any engine output, and touches none of it.
//
// Two things are cached separately, on purpose:
//   - the L-SYSTEM'S SYMBOLIC OUTPUT (which branches exist, how the grammar
//     unfolded) is a pure function of (block hash, growth stage) and is
//     cached forever — a viewport never re-rolls it.
//   - the TURTLE INTERPRETATION (where those branches land in pixels, which
//     ones got redirected or cut short by a line of prose) is recomputed on
//     every layout pass, cheaply, from the DOM's own measured rectangles.
// A resize, an orientation change, a font finishing its load — none of that
// changes what grew, only where it fits. See the design note on issue #73.
//
// Deliberately dependency-free and framework-agnostic: an <svg> is built and
// attached with plain DOM calls, styled with inline attributes on
// currentColor exactly as the bookmark ribbon and printer mark are (see
// ribbonOf / printerOf in bitcoin-book.html) — no new stylesheet, no new
// font, nothing fetched.
//
// The one exception is sigla-outlines.js, a same-origin, dependency-free
// data module of its own (a plain object of path strings, generated offline
// by tools/sigla-outlines/extract.mjs from the vendored Book Sigla font
// files themselves) -- see measureAnchors' glyphTangent for what it's for.
import { SIGLA_OUTLINES } from './sigla-outlines.js';

// ─── deterministic RNG, seeded from a hex string (a block hash, a txid) ────
// splitmix32: small, fast, good enough scatter for cover-word/branch choice —
// not cryptographic, and doesn't need to be. The same hash always yields the
// same stream, which is the whole point: two readers looking at the same
// block see the same illumination.
function rngFromHex(hex) {
  let seed = 0x9e3779b9 >>> 0;
  const clean = String(hex || '').replace(/[^0-9a-f]/gi, '') || '0';
  for (let i = 0; i < clean.length; i++) {
    seed = (Math.imul(seed ^ clean.charCodeAt(i), 0x01000193)) >>> 0;
  }
  let state = seed >>> 0;
  return function rng() {
    state = (state + 0x6D2B79F5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1) >>> 0;
    t = (t ^ (t + Math.imul(t ^ (t >>> 7), t | 61))) >>> 0;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── tunable parameters, all in one place, all live ────────────────────────
// Every knob the L-system and its turtle answer to, gathered so a caller (a
// tuning widget, in particular -- see illumination-lab.html) can mutate them
// directly and re-render: `params.step = 10; illum.refresh()`. Nothing here
// is read into a local at module load and forgotten; every consumer below
// reads `params.*` at the moment it's used, so a change takes effect on the
// very next symbol/layout it touches.
//
// Two kinds of knob, and they clear differently:
//   - GRAMMAR knobs (productions, the branchiness ramp, maxSizeBoost) shape
//     the SYMBOLIC derivation cached in derivationCache (see passesFor).
//     Changing one without clearing that cache would mix generations grown
//     under different rules -- call resetDerivations() after touching any of
//     them (the widget does this on every control's `input` event).
//   - TURTLE knobs (step, turnDeg, jitterDeg, maxDeflectTries, leafDedupPx,
//     overflow, maxReachFloor, maxReachMul) only affect the geometric walk,
//     which is never cached -- calling illuminate()'s `refresh()` (a plain
//     re-layout) is enough.
export const params = {
  // grammar
  productions: [
    { weight: 3, to: 'F' },              // plain growth
    { weight: 3, to: 'FL' },             // growth capped with a leaf
    { weight: 2, to: 'F[+F]F' },         // a side branch, trunk continues
    { weight: 2, to: 'F[-FL]F' },
    { weight: 1, to: 'F[+FL][-FL]F', reserved: true }, // a fuller fork, deep stages only
  ],
  branchinessPerGen: 0.14,      // how fast branchiness ramps up per generation
  branchinessCap: 0.8,          // the ramp's ceiling
  branchinessForkThreshold: 0.6, // branchiness needed before `reserved` productions can be picked
  maxSizeBoost: 6,               // sizeBoost's own ceiling, in generations
  // turtle
  step: 7,                 // px per F
  turnDeg: 24,              // base turn angle, in degrees ('+'/'-')
  jitterDeg: 10,            // random wobble added to every F's heading, in degrees
  maxDeflectTries: 6,       // how hard a blocked step tries to dodge before giving up
  leafDedupPx: 3,           // leaves within this many px of one already placed collapse
  overflow: 48,             // how far past hostEl's own box a vine may still roam (illuminate())
  maxReachFloor: 80,        // the leash's minimum radius from an anchor (illuminate())
  maxReachMul: 1.8,         // the leash's radius per px of the anchor's own size (illuminate())
  // the body-text size step/leaf drawing were tuned at. illuminate() scales
  // step, leaf size, overflow and maxReachFloor by (the reader's current
  // body size / this) -- see geometryScale below -- so the decoration stays
  // in proportion to the letters when a reader scales the type up or down
  // (see btc-fontscale.js), rather than staying a fixed pixel size while
  // everything around it grows or shrinks.
  referenceFontSize: 16,
};

// ─── age: confirmation count → discrete growth stage ───────────────────────
// Buckets, not a continuous function of depth — see issue #73. A stage is a
// cache key; a smooth mapping would mean nothing is ever settled enough to
// cache or to stop re-animating.
export const GROWTH_STAGES = [
  { min: 0,    max: 0,        name: 'bare',      iterations: 0 },
  { min: 1,    max: 5,        name: 'curl',      iterations: 1 },
  { min: 6,    max: 143,      name: 'vine',      iterations: 3 },
  { min: 144,  max: 4031,     name: 'bordered',  iterations: 4 },
  { min: 4032, max: Infinity, name: 'illuminated', iterations: 6 },
];
export function growthStage(confirmations) {
  const n = Math.max(0, Number(confirmations) || 0);
  const idx = GROWTH_STAGES.findIndex((s) => n >= s.min && n <= s.max);
  return idx < 0 ? GROWTH_STAGES.length - 1 : idx;
}

// ─── the grammar: a stochastic vine/flower L-system (Prusinkiewicz-style) ──
// Alphabet: F = grow one step and draw it, L = put out a leaf here (no
// movement), + / - = turn, [ / ] = push/pop a branch point. Angles carry a
// small jitter (from the seeded RNG, not Math.random) so a run of F's doesn't
// read as a ruler-straight line. The rule table itself lives in params.productions.
function pickProduction(rng, branchiness) {
  // Bias toward the branchier rules as `branchiness` (pass-driven) rises, by
  // discarding `reserved` options outright below a threshold — simpler than
  // re-weighting the whole table per pass, and easy to reason about.
  const all = params.productions;
  const pool = branchiness > params.branchinessForkThreshold ? all : all.filter((p) => !p.reserved);
  const total = pool.reduce((s, p) => s + p.weight, 0);
  let r = rng() * total;
  for (const p of pool) { r -= p.weight; if (r <= 0) return p.to; }
  return pool[pool.length - 1].to;
}

// blockHash -> { rng, passes } — passes[i] is the symbol string after i
// rewriting generations, one continuous derivation per block rather than an
// independent roll per stage. This is the point, not just an optimization:
// every production keeps at least one F, so a later generation can only
// elaborate an earlier one, never come out sparser — stage N's shape is
// always stage (N-1)'s shape grown one step further, for a given block, the
// way real growth accumulates rather than getting re-decided from scratch
// each time a reader checks back on a deeper-confirmed chapter.
const derivationCache = new Map();
function passesFor(blockHash) {
  let rec = derivationCache.get(blockHash);
  if (!rec) {
    rec = { rng: rngFromHex(blockHash), passes: ['F'] };
    derivationCache.set(blockHash, rec);
  }
  return rec;
}
// Grammar knobs (params.productions, the branchiness ramp, maxSizeBoost) all
// shape what's cached here. Call this after changing any of them -- the
// tuning widget does, on every control's `input` event -- or a block would
// keep answering with generations grown under the OLD rules forever.
export function resetDerivations() { derivationCache.clear(); }

// A sigil's own rendered size earns it extra rewriting generations on top of
// what confirmation depth alone would give it -- the book's illuminated
// initials (a drop cap at 3.4em, say) are meant to outgrow an inline opcode
// glyph at body size, the way a real manuscript's decoration answers to the
// letter it grows from as much as to the page's age. `baseSize` is the
// "ordinary sigil" reference (a body-text line height); ratios at or below
// that earn no boost at all -- most marks on a page are exactly that
// ordinary, and shouldn't all be growing extra generations by default.
// log2-scaled so a 2x mark and a 4x mark are visibly different without a
// merely-larger mark blowing past the cap (params.maxSizeBoost).
export function sizeBoost(size, baseSize = 16) {
  if (!size || size <= baseSize) return 0;
  return Math.max(0, Math.min(params.maxSizeBoost, Math.round(Math.log2(size / baseSize) * 2)));
}

// (blockHash, stage) -> symbol string after that stage's total iteration
// count (plus any size-driven boost -- see sizeBoost), derived and cached
// incrementally from generation 0 up. Cached forever per (blockHash,
// generation) — this is the part that must NOT change across a reflow, a
// resize, or an orientation flip. `boost` extends the SAME continuous
// derivation further rather than rolling a separate one, so a large sigil's
// vine is this block's shape grown a few generations past where a small
// sigil's stops, never a different shape entirely.
function maxGeneration() { return GROWTH_STAGES[GROWTH_STAGES.length - 1].iterations + params.maxSizeBoost; }
export function generateSymbol(blockHash, stage, boost = 0) {
  const spec = GROWTH_STAGES[stage] || GROWTH_STAGES[0];
  const target = Math.min(maxGeneration(), spec.iterations + Math.max(0, boost));
  const rec = passesFor(blockHash);
  while (rec.passes.length - 1 < target) {
    const passIndex = rec.passes.length; // the generation about to be produced
    const branchiness = Math.min(params.branchinessCap, passIndex * params.branchinessPerGen);
    const prev = rec.passes[rec.passes.length - 1];
    rec.passes.push(prev.replace(/F/g, () => pickProduction(rec.rng, branchiness)));
  }
  return rec.passes[target];
}

// ─── turtle interpretation: symbol string + obstacles -> SVG path data ────
// Reads params.step/turnDeg/jitterDeg/maxDeflectTries/leafDedupPx live, at
// the moment each is used, rather than capturing them once -- see the
// params comment up top.

function pointInRect(x, y, r) { return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h; }
// Segment/segment intersection (standard orientation test) -- used to check
// a growth step against a rectangle's four edges, not just its endpoints, so
// a step that jumps clean over a thin obstacle can't sneak through undetected.
function segmentsCross(p1, p2, p3, p4) {
  const d = (a, b, c) => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
  const d1 = d(p3, p4, p1), d2 = d(p3, p4, p2), d3 = d(p1, p2, p3), d4 = d(p1, p2, p4);
  return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0));
}
function segmentHitsRect(x1, y1, x2, y2, r) {
  const p1 = { x: x1, y: y1 }, p2 = { x: x2, y: y2 };
  if (pointInRect(x1, y1, r) || pointInRect(x2, y2, r)) return true;
  const tl = { x: r.x, y: r.y }, tr = { x: r.x + r.w, y: r.y }, bl = { x: r.x, y: r.y + r.h }, br = { x: r.x + r.w, y: r.y + r.h };
  return segmentsCross(p1, p2, tl, tr) || segmentsCross(p1, p2, tr, br)
    || segmentsCross(p1, p2, br, bl) || segmentsCross(p1, p2, bl, tl);
}
function outOfBounds(x, y, bounds) {
  return !!bounds && (x < bounds.x || x > bounds.x + bounds.w || y < bounds.y || y > bounds.y + bounds.h);
}
function firstBlockingRect(x1, y1, x2, y2, obstacles) {
  for (const r of obstacles) if (segmentHitsRect(x1, y1, x2, y2, r)) return r;
  return null;
}
function stepBlocked(x1, y1, x2, y2, obstacles, bounds) {
  return outOfBounds(x2, y2, bounds) || !!firstBlockingRect(x1, y1, x2, y2, obstacles);
}

// The two directions a turtle can travel while staying parallel to a
// rectangle's nearest edge -- i.e. tracing its silhouette rather than
// bouncing off it. Whichever of the two the caller ends up choosing (see
// angleDiff below) is what makes a blocked vine curl along a paragraph's
// margin instead of deflecting away from it at a random angle.
function angleDiff(a, b) {
  let d = (a - b) % (2 * Math.PI);
  if (d > Math.PI) d -= 2 * Math.PI;
  if (d < -Math.PI) d += 2 * Math.PI;
  return Math.abs(d);
}
function tangentAngles(px, py, rect) {
  const distTop = Math.abs(py - rect.y);
  const distBottom = Math.abs(py - (rect.y + rect.h));
  const distLeft = Math.abs(px - rect.x);
  const distRight = Math.abs(px - (rect.x + rect.w));
  const horizontal = Math.min(distTop, distBottom) <= Math.min(distLeft, distRight);
  const axis = horizontal ? 0 : Math.PI / 2;
  return [axis, axis + Math.PI];
}

// The direction an SVG path is running in wherever it passes closest to
// (x, y) -- both in whatever coordinate space `d`'s own numbers are in.
// Sampled with the browser's own path geometry (getPointAtLength) rather
// than parsed by hand, on a <path> that is never attached to the document;
// that works in every engine this app targets, so there's no DOM cost to
// pay for an answer only measureAnchors' glyphTangent (below) needs once
// per anchor, at layout time.
function tangentAlongPath(d, x, y) {
  const path = svgEl('path', { d });
  const len = path.getTotalLength();
  if (!(len > 0)) return null;
  const SAMPLES = 48;
  let bestT = 0, bestDist = Infinity;
  for (let i = 0; i <= SAMPLES; i++) {
    const t = (i / SAMPLES) * len;
    const p = path.getPointAtLength(t);
    const dist = (p.x - x) ** 2 + (p.y - y) ** 2;
    if (dist < bestDist) { bestDist = dist; bestT = t; }
  }
  const eps = Math.max(len / 500, 0.001);
  const p0 = path.getPointAtLength(Math.max(0, bestT - eps));
  const p1 = path.getPointAtLength(Math.min(len, bestT + eps));
  if (p0.x === p1.x && p0.y === p1.y) return null;   // a single-point path -- no direction to read
  return Math.atan2(p1.y - p0.y, p1.x - p0.x);
}

// Where a seed element's FIRST glyph actually puts ink, in host space.
//
// Not the same box as the element's own -- and the difference is not small.
// A mark's span is an inline box: it carries the line's leading above and
// below the letter (~19% of its height here), and it spans every character
// in the mark, so a composite like "β₃₂" measures the subscript digits too
// and comes out about 2.5x wider than the β itself. sigla-outlines.js's
// entries are normalized to the glyph's own tight ink box, so mapping one
// through the span's box would stretch and slide it off the letter it
// describes, and the tangent read from it would be the direction of some
// other part of the glyph entirely.
//
// The browser's own text metrics answer this exactly, for the very font and
// size the element is rendered in: actualBoundingBox* is the glyph's ink
// box relative to the text origin, and fontBoundingBox* locates the
// baseline within the inline box (half-leading split evenly above and
// below). Returns null where an engine doesn't report them, so the caller
// falls back rather than trusting a half-measured box.
let inkCtx = null;
function glyphInkBox(el, r) {
  const ch = Array.from(el.textContent || '')[0];
  if (!ch) return null;
  try {
    inkCtx = inkCtx || document.createElement('canvas').getContext('2d');
    if (!inkCtx) return null;
    const cs = getComputedStyle(el);
    inkCtx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    const m = inkCtx.measureText(ch);
    const { actualBoundingBoxLeft: aL, actualBoundingBoxRight: aR,
            actualBoundingBoxAscent: aA, actualBoundingBoxDescent: aD,
            fontBoundingBoxAscent: fA, fontBoundingBoxDescent: fD } = m;
    if (![aL, aR, aA, aD, fA, fD].every(Number.isFinite)) return null;
    const w = aL + aR, h = aA + aD;
    if (!(w > 0) || !(h > 0)) return null;
    const baseline = r.y + (r.h - (fA + fD)) / 2 + fA;
    return { x: r.x - aL, y: baseline - aA, w, h };
  } catch (_) { return null; }
}

// The seed's own glyph, traced where growth is about to start from it. The
// outline is a unit square (see sigla-outlines.js) and the glyph's measured
// ink box (above) is the map back to host space -- no font-size factor to
// carry separately, since that box is already the size the browser rendered
// this exact character at. An anchor sitting outside the ink box (the edge
// point is taken on the span's larger box, so it can land in the leading)
// simply reads the tangent at the nearest point of the letter to it, which
// is the same question asked from slightly further away.
//
// Returns null -- for measureAnchors to fall back to the sigil's plain
// bounding-box edge -- when the character has no outline (not every mark in
// the notation does, and none of the composite marks' non-leading
// codepoints do; see extract.mjs) or its ink can't be measured.
function glyphTangent(el, r, hostX, hostY) {
  if (!(r.w > 0) || !(r.h > 0)) return null;
  const ch = Array.from(el.textContent || '')[0];
  const d = ch && SIGLA_OUTLINES[ch];
  if (!d) return null;
  const box = glyphInkBox(el, r);
  if (!box) return null;
  const u = (hostX - box.x) / box.w, v = (hostY - box.y) / box.h;
  return tangentAlongPath(d, u, v);
}

// One anchor -> a list of finished polylines ({points, leaves}) grown from it.
// `obstacles` and `bounds` are already in the same coordinate space as the
// anchor (host-relative pixels) — see measureObstacles/measureAnchors below.
// Exported (it's plain geometry, no DOM) so the wall-following behaviour can
// be checked directly against synthetic rectangles -- see
// tools/illumination.test.mjs -- rather than only eyeballed in a browser.
//
// The book's real sigla sit flush against the prose, not out in a margin --
// an opcode mark opens directly against its script's first letter, a
// citation mark closes directly against the last one, no gap either side.
// So the anchor point itself is very often already INSIDE the padded
// rectangle of the very line it marks -- sometimes more than one at once:
// a floated CSS drop cap can make a single text line report as two
// overlapping client rects (the glyph's own box, and the line box the
// float sits in), both containing the anchor. No amount of steering
// escapes an obstacle you start inside of -- that is a geometric
// impossibility, not a pathfinding failure -- so this carves one exception:
// EVERY obstacle that contains the anchor at the start (its "home" rects,
// plural) is ignored while the walk is still inside that specific one, and
// becomes a normal obstacle again the first time the walk is found
// outside it -- independently per rect, and one-way (re-entering a rect
// already left does not re-exempt it). An anchor that starts in the clear
// (every worked example before the drop cap) sees no change at all -- the
// home-rect set is empty and the walk behaves exactly as before.
export function interpretFrom(symbol, anchor, obstacles, bounds, rng, maxReach = Infinity, geometryScale = 1) {
  // Read live at the top of each call, not once at module load -- exactly
  // what lets the tuning widget change these between one refresh() and the
  // next with no other plumbing. `geometryScale` (see illuminate()) keeps
  // step and leaf size in proportion to the reader's current body text size
  // rather than a fixed pixel count regardless of it -- angles (TURN,
  // JITTER) need no such scaling, only distances do.
  const STEP = params.step * geometryScale;
  const TURN = (params.turnDeg * Math.PI) / 180;
  const JITTER = (params.jitterDeg * Math.PI) / 180;
  const MAX_DEFLECT_TRIES = params.maxDeflectTries;
  let state = { x: anchor.x, y: anchor.y, angle: anchor.angle };
  const stack = [];
  const segments = [];
  let cur = { points: [{ x: state.x, y: state.y }], leaves: [] };
  const homeRects = new Set(obstacles.filter((r) => pointInRect(anchor.x, anchor.y, r)));
  const active = () => (homeRects.size === 0 ? obstacles : obstacles.filter((r) => !homeRects.has(r)));
  const pruneHomeRects = () => { for (const r of homeRects) if (!pointInRect(state.x, state.y, r)) homeRects.delete(r); };
  // A leash on top of the obstacle/bounds checks: no step, of any kind, may
  // land further than `maxReach` from where this anchor's walk actually
  // started. `bounds` alone doesn't bound this -- it's as wide as the
  // viewport, so once wall-following turns a step to run parallel to it,
  // that direction is no longer "blocked" at all and a long straight run in
  // the derivation just keeps going, reading as a separate flourish smeared
  // across the page rather than something that grew from its anchor
  // (confirmed against a real mobile screenshot on issue #73). The leash
  // catches that regardless of which mechanism produced the drift.
  const withinReach = (x, y) => {
    const dx = x - anchor.x, dy = y - anchor.y;
    return dx * dx + dy * dy <= maxReach * maxReach;
  };

  const finish = () => { if (cur.points.length > 1 || cur.leaves.length) segments.push(cur); };

  for (const ch of symbol) {
    if (ch === 'F') {
      const obs = active();
      const jitter = (rng() - 0.5) * 2 * JITTER;
      const a = state.angle + jitter;
      const nx = state.x + Math.cos(a) * STEP;
      const ny = state.y + Math.sin(a) * STEP;
      // Leaving `bounds` gets the exact same tangent treatment as meeting an
      // obstacle -- "move parallel to the nearest edge" is direction-
      // agnostic, it doesn't care whether that edge is a paragraph's outline
      // being avoided from outside or the host's own boundary being hugged
      // from inside. Without this, an anchor near an edge (a drop cap
      // opening a section, sitting right at the top of it) would fall
      // straight to the crude deflection fallback on every single step
      // instead of flowing smoothly around it the way it does around a real
      // obstacle -- wasting a large sigil's whole size-boosted generation
      // budget on a cramped, scraggly tuft.
      const hitRect = (outOfBounds(nx, ny, bounds) || !withinReach(nx, ny)) ? bounds : firstBlockingRect(state.x, state.y, nx, ny, obs);
      if (hitRect) {
        let placed = false;
        // Wall-follow first: steer along whichever of the blocking box's two
        // tangent directions is closest to where the vine was already
        // heading. This is what makes growth trace a paragraph's silhouette
        // -- climbing along its edge and turning its corners -- instead of
        // bouncing off it at a random angle. (When the leash itself is what
        // triggered this -- `hitRect` fell back to `bounds` because no real
        // rect was hit -- there's no meaningful edge to trace; the tangent
        // candidates will fail the reach check below and fall straight
        // through to the deflection fallback.)
        const tangents = tangentAngles(state.x, state.y, hitRect).sort((t1, t2) => angleDiff(a, t1) - angleDiff(a, t2));
        for (const ta of tangents) {
          const tx = state.x + Math.cos(ta) * STEP;
          const ty = state.y + Math.sin(ta) * STEP;
          if (!outOfBounds(tx, ty, bounds) && withinReach(tx, ty) && !firstBlockingRect(state.x, state.y, tx, ty, obs)) {
            state = { x: tx, y: ty, angle: ta };
            cur.points.push({ x: tx, y: ty });
            placed = true;
            break;
          }
        }
        // Fallback: the corner case -- two obstacles meet, an obstacle sits
        // flush against the host bounds, or the leash itself is the limit --
        // where no tangent direction is free either. Widening, increasing
        // deflections either side is a last resort rather than the first
        // move, and is what typically turns growth back toward its own
        // anchor once the leash is what's binding.
        for (let t = 1; t <= MAX_DEFLECT_TRIES && !placed; t++) {
          for (const sign of [1, -1]) {
            const da = state.angle + sign * t * (TURN / 2);
            const dx = state.x + Math.cos(da) * STEP;
            const dy = state.y + Math.sin(da) * STEP;
            if (!stepBlocked(state.x, state.y, dx, dy, obs, bounds) && withinReach(dx, dy)) {
              state = { x: dx, y: dy, angle: da };
              cur.points.push({ x: dx, y: dy });
              placed = true;
              break;
            }
          }
        }
        if (!placed) { finish(); cur = { points: [{ x: state.x, y: state.y }], leaves: [] }; }
      } else {
        state = { x: nx, y: ny, angle: a };
        cur.points.push({ x: nx, y: ny });
      }
      if (homeRects.size) pruneHomeRects();
    } else if (ch === 'L') {
      // A heavily size-boosted symbol forks far more branches than a
      // cramped spot has room for; most die on their very first step and
      // land their leaf right back at the SAME unmoved point (cur resets to
      // the current, never-advanced state each time a branch fails outright
      // -- see the F/'[' handling above). Left alone, hundreds of those
      // stack into one dark blob instead of reading as more decoration.
      // Skip a leaf that would land within a couple pixels of one already
      // placed on this anchor's walk -- distinct nearby leaves still show
      // (a real cluster), only true near-duplicates collapse.
      const near = (p) => Math.abs(p.x - state.x) < params.leafDedupPx && Math.abs(p.y - state.y) < params.leafDedupPx;
      if (!cur.leaves.some(near) && !segments.some((s) => s.leaves.some(near))) {
        // A real vine's leaves don't all point straight along the stem or
        // come out the same size (see the reference photos on issue #73) --
        // each one splays to one side at its own angle off the vine's
        // heading, and varies a little in size. Drawn from the same seeded
        // rng as everything else, so it's still deterministic per anchor.
        const side = rng() < 0.5 ? -1 : 1;
        const splay = side * ((40 + rng() * 55) * Math.PI) / 180;
        const scale = (0.75 + rng() * 0.7) * geometryScale;
        cur.leaves.push({ x: state.x, y: state.y, angle: state.angle + splay, scale });
      }
    } else if (ch === '+') {
      state = { ...state, angle: state.angle + TURN };
    } else if (ch === '-') {
      state = { ...state, angle: state.angle - TURN };
    } else if (ch === '[') {
      stack.push({ state: { ...state }, cur });
      cur = { points: [{ x: state.x, y: state.y }], leaves: [] };
    } else if (ch === ']') {
      finish();
      const popped = stack.pop();
      if (!popped) continue;
      state = popped.state;
      cur = popped.cur;
    }
  }
  finish();
  return segments;
}

// ─── measuring the DOM: obstacles (prose) and anchors (sigla/marks) ────────
// Everything here is expressed relative to `hostEl`'s own box, which is also
// where the SVG overlay is positioned -- so a rectangle measured here can be
// drawn there with no further transform.
function toHostSpace(rect, hostRect) {
  return { x: rect.left - hostRect.left, y: rect.top - hostRect.top, w: rect.width, h: rect.height };
}

// Per-line rectangles for a prose element's actual rendered text -- handles
// wrapping, font metrics, zoom, all of it, because it comes straight from
// layout rather than being calculated. A small pad keeps vines from hugging
// letterforms.
export function measureObstacles(proseEl, hostRect, pad = 3) {
  if (!proseEl) return [];
  const range = document.createRange();
  range.selectNodeContents(proseEl);
  const rects = Array.from(range.getClientRects());
  return rects.map((r) => {
    const h = toHostSpace(r, hostRect);
    return { x: h.x - pad, y: h.y - pad, w: h.w + pad * 2, h: h.h + pad * 2 };
  });
}

// Where a ray from a rectangle's own center, heading in `angle`, crosses the
// rectangle's boundary -- the standard center-to-edge intersection, taking
// whichever of the two axis distances the ray reaches first.
function edgePoint(r, angle) {
  const cx = r.x + r.w / 2, cy = r.y + r.h / 2;
  const dx = Math.cos(angle), dy = Math.sin(angle);
  const tx = dx !== 0 ? (r.w / 2) / Math.abs(dx) : Infinity;
  const ty = dy !== 0 ? (r.h / 2) / Math.abs(dy) : Infinity;
  const t = Math.min(tx, ty);
  return { x: cx + dx * t, y: cy + dy * t };
}

// Seed points vines grow from -- the sigla already on the page. Each
// anchor's POSITION sits just past the sigil's own boundary (see edgePoint),
// not at its centroid -- a vine reads as growing OFF the glyph's edge, not
// sprouting out of its middle -- on whichever side faces away from the
// host's own center, which in practice aims a mark near the text column out
// toward the gutter/margin rather than back across the prose.
//
// The anchor's initial growth TANGENT is a different question, and answered
// separately: not which side of the glyph to start from, but which way to
// head once there. Given a real outline to trace (glyphTangent, for a .op
// or .cfx-gold mark whose own character sigla-outlines.js has), growth
// starts running along the letter's own silhouette, the way it will trace
// any OTHER obstacle's edge once under way (see interpretFrom's wall-
// following) -- rather than launching straight off it. Lacking one (every
// other seed kind: a margin citation, the drop cap, an unlisted character),
// the sigil's plain bounding-box edge stands in, via the same tangentAngles
// helper interpretFrom itself falls back on. Either way the two candidate
// directions along that edge/outline are resolved toward whichever one
// continues most nearly the outward-from-center heading above, so growth
// still generally trends toward the margin rather than back into the prose.
//
// `opts.sizeOf(el)` overrides the default bbox-derived size (used to scale
// growth -- see sizeBoost); `opts.pointOf(el)` can force 'center' or
// 'top-left' instead of the default 'edge', for a caller with no real
// element to measure (a CSS ::first-letter drop cap has no box of its own --
// see bitcoin-book.html's illuminateSection for exactly that case). Neither
// of those two carries a real silhouette, so both keep the plain outward
// angle as their initial tangent too.
export function measureAnchors(seedEls, hostRect, opts = {}) {
  const cx = hostRect.width / 2, cy = hostRect.height / 2;
  const sizeOf = opts.sizeOf || (() => null);
  const pointOf = opts.pointOf || (() => 'edge');
  return Array.from(seedEls || []).map((el) => {
    const r = toHostSpace(el.getBoundingClientRect(), hostRect);
    const rcx = r.x + r.w / 2, rcy = r.y + r.h / 2;
    const angle = Math.atan2(rcy - cy, rcx - cx) || 0;
    const mode = pointOf(el);
    // Height, not the larger of width/height: an inline mark's rendered
    // SIZE is its glyph height (~ font-size); its width is mostly a
    // function of how many characters happen to be in the span, which says
    // nothing about how big it looks. Using width would boost a long but
    // ordinary-height mark ("β₃₂ 65535×256²⁶") well past a genuinely large
    // one-character mark, backwards from the intent. Computed before
    // positioning below -- 'top-left' uses it too.
    const size = sizeOf(el) || r.h;
    let x, y;
    if (mode === 'top-left') {
      // Right at the corner, not pushed out past it: the vine has to read
      // as growing FROM the initial, touching it, the way real marginalia
      // is physically continuous with the letter it decorates. (An earlier
      // version pushed this out by a fraction of the sigil's own size to
      // give it more initial clearance -- but that reads as a flourish
      // floating apart from the letter rather than growing out of it, which
      // is the whole point of an illuminated initial. The clearance a large
      // mark needs comes from its size-driven generation budget and from
      // wall-following once it's under way, not from starting detached.)
      x = r.x; y = r.y;
    } else if (mode === 'center') {
      x = rcx; y = rcy;
    } else {
      const p = edgePoint(r, angle);
      x = p.x + Math.cos(angle) * 1.5;
      y = p.y + Math.sin(angle) * 1.5;
    }
    let growthAngle = angle;
    if (mode !== 'top-left' && mode !== 'center') {
      const outward = (candidates) => angleDiff(candidates[0], angle) <= angleDiff(candidates[1], angle)
        ? candidates[0] : candidates[1];
      const t = glyphTangent(el, r, x, y);
      growthAngle = t !== null ? outward([t, t + Math.PI]) : outward(tangentAngles(x, y, r));
    }
    return { x, y, angle: growthAngle, size, el };
  });
}

// ─── SVG building ───────────────────────────────────────────────────────
const SVGNS = 'http://www.w3.org/2000/svg';
function svgEl(tag, attrs) {
  const el = document.createElementNS(SVGNS, tag);
  for (const k in attrs) el.setAttribute(k, attrs[k]);
  return el;
}
function pathD(points) {
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
}
// A small heart/arrowhead leaf, attached at the vine by its base (the local
// origin) and pointing along `leaf.angle` -- two rounded lobes bulging out
// near the attachment point, tapering to a single tip, the shape common to
// the vine genus that prompted this (bindweed/morning-glory-style cordate
// leaves; see the reference photos on issue #73). A faint midrib is drawn
// as a second, thinner stroke down the same shape, since every leaf in
// those photos shows one. `leaf.scale` (set per-leaf in the 'L' handling
// above, from the same seeded rng as everything else) varies each leaf's
// size a little, the way real leaves along one vine aren't all identical.
function leafD(leaf) {
  const deg = (leaf.angle * 180) / Math.PI;
  const transform = `translate(${leaf.x.toFixed(1)},${leaf.y.toFixed(1)}) rotate(${deg.toFixed(1)}) scale(${(leaf.scale || 1).toFixed(2)})`;
  const blade = 'M0,0 C1.5,-2.8 5,-3.8 7,-2 Q9,-0.4 9.4,0 Q9,0.4 7,2 C5,3.8 1.5,2.8 0,0 Z';
  const vein = 'M0.6,0 Q5,0 8.6,0';
  return { blade, vein, transform };
}

function buildOverlaySvg(width, height) {
  return svgEl('svg', {
    class: 'illum-overlay',
    viewBox: `0 0 ${width} ${height}`,
    width: String(width),
    height: String(height),
    'aria-hidden': 'true',
    focusable: 'false',
    style: 'position:absolute;inset:0;pointer-events:none;overflow:visible;z-index:0;color:inherit;',
  });
}

// Debug aid, off by default: draws the obstacle rectangles a vine is
// steering around, so the wall-following behaviour above -- climbing along
// an edge, turning its corners -- can actually be seen rather than taken on
// faith. Never intended for the reader-facing render.
function renderObstacleDebug(svg, obstacles) {
  const group = svgEl('g', { class: 'illum-debug-obstacles' });
  for (const r of obstacles) {
    group.appendChild(svgEl('rect', {
      x: r.x.toFixed(1), y: r.y.toFixed(1), width: r.w.toFixed(1), height: r.h.toFixed(1),
      fill: 'none', stroke: 'currentColor', 'stroke-width': '1', 'stroke-dasharray': '3,3', opacity: '0.35',
    }));
  }
  svg.appendChild(group);
}

function renderSegments(svg, segmentsByAnchor, { animate, obstacles, debug }) {
  while (svg.firstChild) svg.removeChild(svg.firstChild);
  if (debug && obstacles) renderObstacleDebug(svg, obstacles);
  const group = svgEl('g', { class: 'illum-vines', 'stroke-linecap': 'round' });
  svg.appendChild(group);
  for (const segments of segmentsByAnchor) {
    for (const seg of segments) {
      if (seg.points.length > 1) {
        const path = svgEl('path', {
          d: pathD(seg.points), fill: 'none', stroke: 'currentColor',
          'stroke-width': '1.1', opacity: '0.55', class: 'illum-vine',
        });
        group.appendChild(path);
        if (animate) primeGrowIn(path);
      }
      for (const leaf of seg.leaves) {
        const { blade, vein, transform } = leafD(leaf);
        group.appendChild(svgEl('path', {
          d: blade, transform, fill: 'currentColor', opacity: '0.55', class: 'illum-leaf',
        }));
        group.appendChild(svgEl('path', {
          d: vein, transform, fill: 'none', stroke: 'currentColor', 'stroke-width': '0.6', opacity: '0.4', class: 'illum-leaf-vein',
        }));
      }
    }
  }
}

// Grow-in via the standard dasharray/dashoffset trick: only ever primed on a
// FIRST render (see illuminate() below) -- a reflow re-lays-out the same
// settled shape and must not replay this.
function primeGrowIn(pathEl) {
  requestAnimationFrame(() => {
    const len = pathEl.getTotalLength();
    pathEl.style.strokeDasharray = String(len);
    pathEl.style.strokeDashoffset = String(len);
    pathEl.style.transition = 'stroke-dashoffset 900ms ease-out';
    requestAnimationFrame(() => { pathEl.style.strokeDashoffset = '0'; });
  });
}

const reducedMotion = () => {
  try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
  catch { return false; }
};

// ─── public entry point ────────────────────────────────────────────────
// illuminate(hostEl, { proseEl, seedEls, blockHash, confirmations }) ->
// { refresh(), destroy() }.
//
//   hostEl        the positioning context (given position:relative if it
//                 isn't already) -- e.g. bitcoin-book.html's `.tx-wrap`.
//   proseEl       the element whose rendered text is the obstacle field
//                 (defaults to hostEl).
//   seedEls       elements to grow from -- sigla marks, citation marks, the
//                 bookmark ribbon; falls back to hostEl's own corners if
//                 none are given, so the module still does something useful
//                 standing alone.
//   blockHash     seeds the grammar AND the RNG -- same hash, same reading,
//                 for every visitor.
//   confirmations drives growthStage(); stage 0 renders nothing at all.
//   enabled       a hard override, default true; false renders nothing
//                 regardless of stage (the illumination widget's on/off
//                 switch -- see bitcoin-book.html's currentIllumOpts).
//   sizeOf(el)    optional override for an anchor's size (see sizeBoost) --
//                 needed for a mark with no box of its own, e.g. a CSS
//                 ::first-letter drop cap (read its computed font-size
//                 instead). Omit it to just measure each seedEl's own bbox.
//   pointOf(el)   optional override for where on the anchor to start --
//                 'edge' (default), 'center', or 'top-left' (for that same
//                 drop-cap case: its containing element's box, not its own).
//   baseSize      the "ordinary sigil" reference size sizeBoost compares
//                 against; defaults to a typical body line height (16).
//
// Geometry (obstacles, anchors, the turtle walk) is recomputed on every
// refresh(); the symbol string is not -- see generateSymbol's cache.
export function illuminate(hostEl, opts = {}) {
  if (!hostEl) throw new Error('illuminate: hostEl is required');
  const cs = getComputedStyle(hostEl);
  if (cs.position === 'static') hostEl.style.position = 'relative';

  let svg = hostEl.querySelector(':scope > svg.illum-overlay');
  if (!svg) {
    svg = buildOverlaySvg(hostEl.clientWidth || 1, hostEl.clientHeight || 1);
    hostEl.insertBefore(svg, hostEl.firstChild);
  }

  let firstRender = true;
  function layout() {
    const stage = growthStage(opts.confirmations);
    const hostRect = hostEl.getBoundingClientRect();
    svg.setAttribute('viewBox', `0 0 ${hostRect.width} ${hostRect.height}`);
    svg.setAttribute('width', String(hostRect.width));
    svg.setAttribute('height', String(hostRect.height));

    if (opts.enabled === false || stage === 0 || !opts.blockHash) { renderSegments(svg, [], {}); return; }

    const proseEl = opts.proseEl || hostEl;
    const obstacles = measureObstacles(proseEl, hostRect);
    // The body text's OWN current size, measured fresh on every layout()
    // pass rather than once when illuminate() was first called -- a font-
    // scale change (btc-fontscale.js) reflows the text, which resizes
    // hostEl, which the ResizeObserver below already treats as a reason to
    // re-run layout(); measuring live here is what makes that re-run
    // actually pick up the NEW size instead of quietly redrawing at the
    // stale one. `opts.baseSize` remains available as an explicit override
    // for a caller with no representative element to measure (a synthetic
    // sample with no real body text, say -- see illumination-lab.html).
    const baseSize = opts.baseSize ?? (parseFloat(getComputedStyle(proseEl).fontSize) || params.referenceFontSize);
    // How far that size has drifted from the size step/leaf drawing were
    // tuned at (params.referenceFontSize) -- scales step, leaf size,
    // overflow and the leash's floor together, so the whole decoration
    // grows or shrinks along with the reader's font-scale setting instead
    // of staying a fixed pixel size while the letters around it do the
    // actual growing or shrinking.
    const geometryScale = baseSize / params.referenceFontSize;
    // A vine is allowed a little room past the host's own box, not just up
    // to its exact edge -- the overlay already paints there (the SVG root
    // is overflow:visible), and without it an anchor sitting right at an
    // edge (a drop cap opening a section, say) would have its whole boosted
    // generation budget wasted on being blocked at step one, however much
    // it earned from sizeBoost. Default is modest -- comparable to the gap
    // the book already leaves between one section and the next -- so a vine
    // can breathe into that margin without regularly reaching into a
    // neighboring section's own content.
    const overflow = (opts.overflow ?? params.overflow) * geometryScale;
    const bounds = { x: -overflow, y: -overflow, w: hostRect.width + overflow * 2, h: hostRect.height + overflow * 2 };
    const seedEls = (opts.seedEls && opts.seedEls.length) ? opts.seedEls : [];
    const anchors = seedEls.length
      ? measureAnchors(seedEls, hostRect, { sizeOf: opts.sizeOf, pointOf: opts.pointOf })
      : [
        { x: 2, y: hostRect.height / 2, angle: Math.PI },
        { x: hostRect.width - 2, y: hostRect.height / 2, angle: 0 },
      ];

    // Each anchor's own sigil size earns it extra generations on top of the
    // confirmation-driven stage (see sizeBoost) -- the SAME continuous
    // per-block derivation, just carried a few generations further for a
    // large mark than for an ordinary one, so a page's one illuminated
    // initial can visibly outgrow its opcode glyphs without becoming a
    // different grammar altogether.
    const segmentsByAnchor = anchors.map((a) => {
      const boost = sizeBoost(a.size, baseSize);
      const symbol = generateSymbol(opts.blockHash, stage, boost);
      const rng = rngFromHex(`${opts.blockHash}:${stage}:${boost}:${a.x.toFixed(0)},${a.y.toFixed(0)}`);
      // How far this anchor's own decoration may roam, leashed to the
      // sigil's own size (see interpretFrom's maxReach) -- generous enough
      // for a real flourish, but never so wide it reads as belonging to a
      // different part of the page than the mark that grew it.
      const maxReach = Math.max((opts.maxReachFloor ?? params.maxReachFloor) * geometryScale, (a.size || 16) * (opts.maxReachMul ?? params.maxReachMul));
      return interpretFrom(symbol, a, obstacles, bounds, rng, maxReach, geometryScale);
    });
    renderSegments(svg, segmentsByAnchor, { animate: firstRender && !reducedMotion(), obstacles, debug: !!opts.debug });
    firstRender = false;
  }

  layout();

  // Debounced reflow: mobile orientation events in particular can fire
  // before the browser has actually finished relaying out the page, so wait
  // a couple of frames before re-measuring rather than trusting the first
  // tick. See issue #73's note on orientation handling.
  let raf1 = null, raf2 = null;
  function scheduleRelayout() {
    if (raf1) cancelAnimationFrame(raf1);
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(layout);
    });
  }
  const ro = new ResizeObserver(scheduleRelayout);
  ro.observe(hostEl);
  let orientationTarget = null;
  if (window.screen && window.screen.orientation) {
    orientationTarget = window.screen.orientation;
    orientationTarget.addEventListener('change', scheduleRelayout);
  } else {
    window.addEventListener('orientationchange', scheduleRelayout);
  }

  return {
    refresh: layout,
    destroy() {
      ro.disconnect();
      if (orientationTarget) orientationTarget.removeEventListener('change', scheduleRelayout);
      else window.removeEventListener('orientationchange', scheduleRelayout);
      if (raf1) cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
      svg.remove();
    },
  };
}
