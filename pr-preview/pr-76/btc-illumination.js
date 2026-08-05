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
// read as a ruler-straight line.
const PRODUCTIONS = [
  { weight: 3, to: 'F' },              // plain growth
  { weight: 3, to: 'FL' },             // growth capped with a leaf
  { weight: 2, to: 'F[+F]F' },         // a side branch, trunk continues
  { weight: 2, to: 'F[-FL]F' },
  { weight: 1, to: 'F[+FL][-FL]F' },   // a fuller fork, reserved for deep stages
];
function pickProduction(rng, branchiness) {
  // Bias toward the branchier rules as `branchiness` (pass-driven) rises, by
  // discarding the plainest option outright above a threshold — simpler than
  // re-weighting the whole table per pass, and easy to reason about.
  const pool = branchiness > 0.6 ? PRODUCTIONS : PRODUCTIONS.filter((p) => p.to !== 'F[+FL][-FL]F');
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

// A sigil's own rendered size earns it extra rewriting generations on top of
// what confirmation depth alone would give it -- the book's illuminated
// initials (a drop cap at 3.4em, say) are meant to outgrow an inline opcode
// glyph at body size, the way a real manuscript's decoration answers to the
// letter it grows from as much as to the page's age. `baseSize` is the
// "ordinary sigil" reference (a body-text line height); ratios at or below
// that earn no boost at all -- most marks on a page are exactly that
// ordinary, and shouldn't all be growing extra generations by default.
// log2-scaled so a 2x mark and a 4x mark are visibly different without a
// merely-larger mark blowing past the cap.
const MAX_SIZE_BOOST = 6;
export function sizeBoost(size, baseSize = 16) {
  if (!size || size <= baseSize) return 0;
  return Math.max(0, Math.min(MAX_SIZE_BOOST, Math.round(Math.log2(size / baseSize) * 2)));
}

// (blockHash, stage) -> symbol string after that stage's total iteration
// count (plus any size-driven boost -- see sizeBoost), derived and cached
// incrementally from generation 0 up. Cached forever per (blockHash,
// generation) — this is the part that must NOT change across a reflow, a
// resize, or an orientation flip. `boost` extends the SAME continuous
// derivation further rather than rolling a separate one, so a large sigil's
// vine is this block's shape grown a few generations past where a small
// sigil's stops, never a different shape entirely.
const MAX_GENERATION = GROWTH_STAGES[GROWTH_STAGES.length - 1].iterations + MAX_SIZE_BOOST;
export function generateSymbol(blockHash, stage, boost = 0) {
  const spec = GROWTH_STAGES[stage] || GROWTH_STAGES[0];
  const target = Math.min(MAX_GENERATION, spec.iterations + Math.max(0, boost));
  const rec = passesFor(blockHash);
  while (rec.passes.length - 1 < target) {
    const passIndex = rec.passes.length; // the generation about to be produced
    const branchiness = Math.min(0.8, passIndex * 0.14);
    const prev = rec.passes[rec.passes.length - 1];
    rec.passes.push(prev.replace(/F/g, () => pickProduction(rec.rng, branchiness)));
  }
  return rec.passes[target];
}

// ─── turtle interpretation: symbol string + obstacles -> SVG path data ────
const STEP = 7;                 // px per F
const TURN = (24 * Math.PI) / 180; // base turn angle
const JITTER = (10 * Math.PI) / 180;
const MAX_DEFLECT_TRIES = 6;     // how hard a blocked step tries to dodge

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
// rectangle of the very line it marks. No amount of steering escapes an
// obstacle you start inside of -- that is a geometric impossibility, not a
// pathfinding failure -- so this carves one exception: whichever obstacle
// contains the anchor (its "home" rect, if any) is ignored until the walk
// has actually left it, exactly once, and is a normal obstacle again from
// then on. Every other anchor (one that starts in the clear, as the
// worked examples so far all did) sees no change at all -- homeRect is null
// and the walk behaves exactly as before.
export function interpretFrom(symbol, anchor, obstacles, bounds, rng) {
  let state = { x: anchor.x, y: anchor.y, angle: anchor.angle };
  const stack = [];
  const segments = [];
  let cur = { points: [{ x: state.x, y: state.y }], leaves: [] };
  const homeRect = obstacles.find((r) => pointInRect(anchor.x, anchor.y, r)) || null;
  let escaped = !homeRect;
  const active = () => (escaped ? obstacles : obstacles.filter((r) => r !== homeRect));

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
      // instead of flowing smoothly along the boundary the way it does
      // around a real obstacle -- wasting a large sigil's whole size-boosted
      // generation budget on a cramped, scraggly tuft.
      const hitRect = outOfBounds(nx, ny, bounds) ? bounds : firstBlockingRect(state.x, state.y, nx, ny, obs);
      if (hitRect) {
        let placed = false;
        // Wall-follow first: steer along whichever of the blocking box's two
        // tangent directions is closest to where the vine was already
        // heading. This is what makes growth trace a paragraph's silhouette
        // -- climbing along its edge and turning its corners -- instead of
        // bouncing off it at a random angle.
        const tangents = tangentAngles(state.x, state.y, hitRect).sort((t1, t2) => angleDiff(a, t1) - angleDiff(a, t2));
        for (const ta of tangents) {
          const tx = state.x + Math.cos(ta) * STEP;
          const ty = state.y + Math.sin(ta) * STEP;
          if (!outOfBounds(tx, ty, bounds) && !firstBlockingRect(state.x, state.y, tx, ty, obs)) {
            state = { x: tx, y: ty, angle: ta };
            cur.points.push({ x: tx, y: ty });
            placed = true;
            break;
          }
        }
        // Fallback: the corner case -- two obstacles meet, or an obstacle
        // sits flush against the host bounds -- where neither tangent
        // direction is free either. Widening, increasing deflections either
        // side is a last resort rather than the first move.
        for (let t = 1; t <= MAX_DEFLECT_TRIES && !placed; t++) {
          for (const sign of [1, -1]) {
            const da = state.angle + sign * t * (TURN / 2);
            const dx = state.x + Math.cos(da) * STEP;
            const dy = state.y + Math.sin(da) * STEP;
            if (!stepBlocked(state.x, state.y, dx, dy, obs, bounds)) {
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
      if (!escaped && !pointInRect(state.x, state.y, homeRect)) escaped = true;
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
      const near = (p) => Math.abs(p.x - state.x) < 3 && Math.abs(p.y - state.y) < 3;
      if (!cur.leaves.some(near) && !segments.some((s) => s.leaves.some(near))) {
        cur.leaves.push({ x: state.x, y: state.y, angle: state.angle });
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

// Seed points vines grow from -- the sigla already on the page. Each anchor's
// outward angle points away from the host's own center, which in practice
// aims a mark near the text column out toward the gutter/margin rather than
// back across the prose. The anchor itself sits just past the sigil's own
// boundary in that direction (see edgePoint), not at its centroid -- a vine
// reads as growing OFF the glyph's edge, not sprouting out of its middle.
//
// `opts.sizeOf(el)` overrides the default bbox-derived size (used to scale
// growth -- see sizeBoost); `opts.pointOf(el)` can force 'center' or
// 'top-left' instead of the default 'edge', for a caller with no real
// element to measure (a CSS ::first-letter drop cap has no box of its own --
// see bitcoin-book.html's illuminateSection for exactly that case).
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
      // A drop cap's own corner is exactly where its paragraph's densest
      // text starts -- boxed in on every side by the very prose it opens,
      // with nowhere to go regardless of how many generations it earned.
      // Real marginalia doesn't start AT the initial's corner either; it
      // starts a little past it, already reaching for the margin the
      // decoration is actually going to occupy. Push out from the corner
      // by a fraction of the sigil's OWN size -- a bigger initial starts
      // its vine further into the clear rather than deeper in the crowd.
      x = r.x + Math.cos(angle) * size * 0.4;
      y = r.y + Math.sin(angle) * size * 0.4;
    } else if (mode === 'center') {
      x = rcx; y = rcy;
    } else {
      const p = edgePoint(r, angle);
      x = p.x + Math.cos(angle) * 1.5;
      y = p.y + Math.sin(angle) * 1.5;
    }
    return { x, y, angle, size, el };
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
// A small forked leaf glyph, drawn at a leaf point and turned to face the
// direction the vine was travelling when it put it out.
function leafD(leaf) {
  const deg = (leaf.angle * 180) / Math.PI;
  return { d: 'M0,0 Q3,-4 6,-1 Q3,1 0,0 Z', transform: `translate(${leaf.x.toFixed(1)},${leaf.y.toFixed(1)}) rotate(${deg.toFixed(1)})` };
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
        const { d, transform } = leafD(leaf);
        group.appendChild(svgEl('path', {
          d, transform, fill: 'currentColor', opacity: '0.55', class: 'illum-leaf',
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

    if (stage === 0 || !opts.blockHash) { renderSegments(svg, [], {}); return; }

    const proseEl = opts.proseEl || hostEl;
    const obstacles = measureObstacles(proseEl, hostRect);
    // A vine is allowed a little room past the host's own box, not just up
    // to its exact edge -- the overlay already paints there (the SVG root
    // is overflow:visible), and without it an anchor sitting right at an
    // edge (a drop cap opening a section, say) would have its whole boosted
    // generation budget wasted on being blocked at step one, however much
    // it earned from sizeBoost. Default is modest -- comparable to the gap
    // the book already leaves between one section and the next -- so a vine
    // can breathe into that margin without regularly reaching into a
    // neighboring section's own content.
    const overflow = opts.overflow ?? 48;
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
      const boost = sizeBoost(a.size, opts.baseSize);
      const symbol = generateSymbol(opts.blockHash, stage, boost);
      const rng = rngFromHex(`${opts.blockHash}:${stage}:${boost}:${a.x.toFixed(0)},${a.y.toFixed(0)}`);
      return interpretFrom(symbol, a, obstacles, bounds, rng);
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
