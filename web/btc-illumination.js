// SPDX-License-Identifier: MIT OR Apache-2.0
//
// btc-illumination.js — the book's side of the illumination layer: it
// MEASURES the page and DRAWS the result, and does nothing else.
//
// Everything that decides what grows lives in the `scriptorium` crate (see
// build_scriptorium.sh), which is host-agnostic Rust compiled to WASM: the
// L-system and its cached derivations, the turtle walk and its wall-following,
// the glyph-contour sampling a vine rides, the leash, the leaf shapes, the
// path data. None of that ever needed a browser — it is arithmetic over
// strings and rectangles — and having it here meant it could only be checked
// by eye in a screenshot. It now has its own tests, its own version, and no
// dependency on this book at all.
//
// What is left here is the half that genuinely does need a DOM, and it splits
// in two:
//
//   MEASURING — Range.getClientRects() for the obstacle field and for a mark's
//     own box, canvas text metrics for where a glyph actually puts ink, a
//     TreeWalker to find which text is a mark at all. Only the browser knows
//     these, and only for the very font and size the element is rendered in.
//   DRAWING — building the <svg> overlay with plain DOM calls and styling it
//     with inline attributes on currentColor, exactly as the bookmark ribbon
//     and printer mark are (see ribbonOf / printerOf in bitcoin-book.html): no
//     new stylesheet, no new font, nothing fetched.
//
// This module reads the DOM the rest of the book already produced (see
// btc-prose.js / bitcoin-book.html) and touches none of Glossia's output.
//
// The one piece of authored data still on this side is sigla-outlines.js, a
// generated table of path strings extracted offline from the vendored Book
// Sigla font files themselves (tools/sigla-outlines/extract.mjs). It stays
// because it describes THIS book's notation in THIS book's font; the engine
// takes an outline table from its host rather than knowing any notation of its
// own. See init() below, which registers it.
import { SIGLA_OUTLINES } from './sigla-outlines.js';

// ─── the engine ───────────────────────────────────────────────────────────
// Loaded once, lazily, and awaited before anything else here will work --
// same shape as glossia-msg.js's own init(), and for the same reason: the
// WASM artifact is built at deploy time (build_scriptorium.sh) rather than
// committed, so a caller has to be able to see the failure.
let engine = null;
let readyP = null;

/// Every knob the L-system and its turtle answer to, live.
///
/// The DEFAULTS come from the engine, so there is exactly one definition of
/// what a knob starts at rather than a copy here drifting from the crate's.
/// This object is then the live one: a tuning widget mutates it directly (see
/// illumination-controls.js) and it is handed to the engine on every single
/// layout pass, so a change takes effect on the very next one with no other
/// plumbing.
//
// Two kinds of knob, and they clear differently:
//   - GRAMMAR knobs (productions, the branchiness ramp, maxSizeBoost) shape
//     the SYMBOLIC derivation the engine caches. Changing one needs
//     resetDerivations() as well, or a block keeps answering with generations
//     grown under the OLD rules forever.
//   - TURTLE knobs (everything else) only affect the geometric walk, which is
//     never cached; a plain refresh() is enough.
export const params = {};

// Age: confirmation count -> discrete growth stage. Buckets, not a continuous
// function of depth (see issue #73) -- a stage is a cache key, and a smooth
// mapping would mean nothing is ever settled enough to cache or to stop
// re-animating. Filled from the engine by init(), and mutable in place for
// the same reason `params` is.
export const GROWTH_STAGES = [];

// Resolves once the WASM module is up and the book's own notation is
// registered with it. Idempotent: every caller awaits the same promise.
export function init() {
  readyP = readyP || (async () => {
    const mod = await import('./scriptorium.js');
    await mod.default();
    mod.initPanicHook();
    // Which characters a vine can trace is a property of this book's notation
    // and this book's font, not of the engine -- so the table is handed over
    // rather than baked in.
    mod.setOutlines(SIGLA_OUTLINES);
    Object.assign(params, mod.defaultParams());
    GROWTH_STAGES.length = 0;
    GROWTH_STAGES.push(...mod.defaultGrowthStages());
    engine = mod;
    return mod;
  })();
  return readyP;
}

const need = () => {
  if (!engine) throw new Error('btc-illumination: await init() before use');
  return engine;
};

// ─── the engine's own vocabulary, for callers that want it without geometry ─
export function growthStage(confirmations) { return need().growthStage(confirmations, GROWTH_STAGES); }
export function sizeBoost(size, baseSize = 16) { return need().sizeBoost(size, baseSize, params); }
export function generateSymbol(blockHash, stage, boost = 0) {
  return need().generateSymbol(blockHash, stage, boost, params, GROWTH_STAGES);
}
export function resetDerivations() { if (engine) engine.resetDerivations(); }

// How much of a seed's text is the mark itself, rather than the count riding
// it or the rest of the line a container seed holds. The rule is the engine's
// (a leading run of characters that are neither space nor figure); this is the
// door to it, and everything on this side that has to slice a text node --
// siglaSpans, markRect -- goes through here so there is one answer.
export function markLeadLength(text, override = null) {
  return need().markLeadLength(text, Number.isFinite(override) ? override : null);
}

// ─── measuring the DOM: obstacles (prose) and marks (sigla) ────────────────
// Everything here is expressed relative to `hostEl`'s own box, which is also
// where the SVG overlay is positioned -- so a rectangle measured here can be
// drawn there with no further transform.
function toHostSpace(rect, hostRect) {
  return { x: rect.left - hostRect.left, y: rect.top - hostRect.top, w: rect.width, h: rect.height };
}

function firstTextNode(el) {
  if (!el || !el.nodeType) return null;
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) if ((n.nodeValue || '').trim()) return n;
  return null;
}

// text node -> how many of its leading characters are sigil rather than prose,
// for every seed on the page. This is the whole of what the obstacle field and
// the anchors need to know about "which ink is a mark": measureObstacles skips
// exactly this much of exactly these nodes, and markRect measures exactly it.
export function siglaSpans(seedEls, markLengthOf = null) {
  const spans = new Map();
  for (const el of seedEls || []) {
    const node = firstTextNode(el);
    if (!node) continue;                       // a mark with no text of its own -- the bookmark ribbon is an SVG
    const text = node.nodeValue;
    const lead = text.length - text.trimStart().length;
    const end = lead + markLeadLength(text.slice(lead), markLengthOf && markLengthOf(el));
    if (end > lead) spans.set(node, Math.max(spans.get(node) || 0, end));
  }
  return spans;
}

// The obstacle field: one rectangle per TERM of rendered text -- every run of
// non-space characters the page actually laid out -- with the sigla themselves
// left out of it. Handed over UNPADDED; the halo is params.obstaclePad, which
// the engine applies along with everything else it scales.
//
// Per term, not per line, and that is the point. A line rectangle spans the
// full measure whether or not the text reaches the end of it, and stands as
// tall as the line box including its leading, so a field made of them leaves a
// vine nowhere to be except outside the paragraph altogether. Term boxes leave
// the page as it actually reads: the channel between two lines, the ragged end
// of a short line, the gutter beside a margin citation -- room to grow through
// without a letter of the prose being touched. That is what lets growth roam
// as far as the page's own edge (see illuminate's boundsEl) while still
// obscuring nothing.
//
// The marks are excluded because a vine grows OFF its own sigil and along its
// outline -- it is inside that box by construction, and an obstacle you start
// inside of is a trap, not a boundary. Only the mark itself is excluded,
// though: the count riding it, and the rest of the line a container seed
// holds, stay in the field like any other text.
export function measureObstacles(rootEl, hostRect, opts = {}) {
  const spans = (opts && opts.siglaSpans) || new Map();
  const out = [];
  if (!rootEl) return out;
  const range = document.createRange();
  const emit = (node, start, end) => {
    range.setStart(node, start);
    range.setEnd(node, end);
    for (const r of range.getClientRects()) {
      if (!(r.width > 0) || !(r.height > 0)) continue;
      out.push(toHostSpace(r, hostRect));
    }
  };
  const walker = document.createTreeWalker(rootEl, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node.nodeValue || '';
    if (!text.trim()) continue;
    let start = -1;
    for (let i = spans.get(node) || 0; i <= text.length; i++) {
      const isTerm = i < text.length && !/\s/.test(text[i]);
      if (isTerm && start < 0) start = i;
      else if (!isTerm && start >= 0) { emit(node, start, i); start = -1; }
    }
  }
  return out;
}

// The mark's OWN rectangle: the box its sigil characters (see markLeadLength)
// actually occupy, measured from layout, rather than the box of the element
// carrying them.
//
// The difference is not small. A composite like "β₃₂" measures about 2.5x
// wider as a span than the β itself, so an edge point taken on the span sits
// off the subscript rather than off the letter, and the outward direction is
// read from a center pulled sideways by figures. A container seed is worse: a
// citation line, or the paragraph a drop cap opens, is a whole block box whose
// corner has nothing to do with where the mark is. Both resolve the same way
// -- ask layout for the rectangle of just those characters.
//
// Returns null for a seed with no text at all (the bookmark ribbon is an SVG),
// or one that is all figures, for the engine to fall back on the element's own
// box.
function markRect(el, hostRect, markLengthOf = null) {
  const node = firstTextNode(el);
  if (!node) return null;
  const text = node.nodeValue;
  const lead = text.length - text.trimStart().length;
  const len = markLeadLength(text.slice(lead), markLengthOf && markLengthOf(el));
  if (!len) return null;
  const range = document.createRange();
  range.setStart(node, lead);
  range.setEnd(node, lead + len);
  let left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity;
  for (const r of range.getClientRects()) {
    if (!(r.width > 0) || !(r.height > 0)) continue;
    left = Math.min(left, r.left); top = Math.min(top, r.top);
    right = Math.max(right, r.right); bottom = Math.max(bottom, r.bottom);
  }
  if (!(right > left) || !(bottom > top)) return null;
  return toHostSpace({ left, top, width: right - left, height: bottom - top }, hostRect);
}

// Where a seed element's FIRST glyph actually puts ink, in host space -- what
// the engine maps a unit-square outline onto.
//
// Not the same box as the element's own, and the difference is not small. A
// mark's span is an inline box: it carries the line's leading above and below
// the letter (~19% of its height here), and it spans every character in the
// mark, so a composite like "β₃₂" measures the subscript digits too. The
// outline entries are normalized to the glyph's own tight ink box, so mapping
// one through the span's box would stretch and slide it off the letter it
// describes, and the tangent read from it would be the direction of some other
// part of the glyph entirely.
//
// The browser's own text metrics answer this exactly, for the very font and
// size the element is rendered in: actualBoundingBox* is the glyph's ink box
// relative to the text origin, and fontBoundingBox* locates the baseline
// within the inline box (half-leading split evenly above and below). Returns
// null where an engine doesn't report them, so the vine falls back to the
// mark's plain bounding-box edge rather than riding a half-measured box.
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

// One seed element, as the engine sees it: the boxes layout reports, which of
// its characters are the mark, and where that mark's first glyph puts ink.
// Nothing here decides anything -- where the anchor lands on the mark, which
// way growth sets off, whether there is a contour to ride, are all the
// engine's (see the crate's `resolve_anchors`).
function describeSeed(el, hostRect, opts) {
  const mode = (opts.pointOf && opts.pointOf(el)) || 'edge';
  const box = toHostSpace(el.getBoundingClientRect(), hostRect);
  const mark = mode === 'edge' ? markRect(el, hostRect, opts.markLengthOf) : null;
  const r = mark || box;
  const first = Array.from(el.textContent || '')[0] || null;
  return {
    box,
    markRect: mark,
    mode,
    size: (opts.sizeOf && opts.sizeOf(el)) || null,
    // Only an 'edge' anchor rides a contour, so only it needs its ink
    // measured -- and measureText is not free.
    ch: mode === 'edge' ? first : null,
    inkBox: mode === 'edge' ? glyphInkBox(el, r) : null,
  };
}

// ─── SVG building ───────────────────────────────────────────────────────
const SVGNS = 'http://www.w3.org/2000/svg';
function svgEl(tag, attrs) {
  const el = document.createElementNS(SVGNS, tag);
  for (const k in attrs) el.setAttribute(k, attrs[k]);
  return el;
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

// Debug aid, off by default: draws the obstacle rectangles a vine is steering
// around -- the padded ones the engine actually used, not the raw boxes handed
// to it -- so the wall-following behaviour can be seen rather than taken on
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

// The engine's path data -> elements. Every `d`, every leaf blade and vein and
// the transform that places them, arrives ready to set; nothing is computed
// here but the attributes the book paints them with.
function renderSegments(svg, anchors, { animate, obstacles, debug } = {}) {
  while (svg.firstChild) svg.removeChild(svg.firstChild);
  if (debug && obstacles) renderObstacleDebug(svg, obstacles);
  const group = svgEl('g', { class: 'illum-vines', 'stroke-linecap': 'round' });
  svg.appendChild(group);
  for (const anchor of anchors || []) {
    for (const seg of anchor.segments) {
      if (seg.d) {
        const path = svgEl('path', {
          d: seg.d, fill: 'none', stroke: 'currentColor',
          'stroke-width': '1.1', opacity: '0.55', class: 'illum-vine',
        });
        group.appendChild(path);
        if (animate) primeGrowIn(path);
      }
      for (const leaf of seg.leaves) {
        group.appendChild(svgEl('path', {
          d: leaf.blade, transform: leaf.transform,
          fill: 'currentColor', opacity: '0.55', class: 'illum-leaf',
        }));
        group.appendChild(svgEl('path', {
          d: leaf.vein, transform: leaf.transform,
          fill: 'none', stroke: 'currentColor', 'stroke-width': '0.6', opacity: '0.4', class: 'illum-leaf-vein',
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
// { refresh(), destroy() }. Call and await init() first.
//
//   hostEl        the positioning context (given position:relative if it
//                 isn't already) -- e.g. bitcoin-book.html's `.tx-wrap`.
//   proseEl       the element whose body-text size sets the scale the
//                 decoration is drawn at, and the default obstacle root
//                 (defaults to hostEl).
//   obstacleEl    the root whose rendered text is measured into the
//                 obstacle field (defaults to proseEl). Give it the whole
//                 PAGE where growth is allowed to leave the host's own box:
//                 a vine roaming the margin passes text -- a running head,
//                 a section title, a footnote -- that the host does not
//                 contain, and every word of it has to be in the field or
//                 the decoration will cover it.
//   boundsEl      the element whose box growth may not leave -- the page
//                 itself (bitcoin-book.html gives it #page-frame, which is
//                 also what clips). Given one, the margin between the host
//                 and the page's edge is open ground: a vine crosses it and
//                 then RUNS ALONG that edge, exactly as it traces any other
//                 boundary, which is what a manuscript's border does. What
//                 keeps the prose clear is the obstacle field, and what
//                 keeps a small mark from claiming the whole page is its own
//                 leash (params.maxReachMul). Omitted, growth is bounded the
//                 older way: the host's own box plus params.overflow.
//   seedEls       elements to grow from -- sigla marks, citation marks, the
//                 bookmark ribbon.
//   blockHash     seeds the grammar AND the RNG -- same hash, same reading,
//                 for every visitor.
//   confirmations drives the growth stage; stage 0 renders nothing at all.
//   enabled       a hard override, default true; false renders nothing
//                 regardless of stage (the illumination widget's on/off
//                 switch -- see bitcoin-book.html's currentIllumOpts).
//   sizeOf(el)    optional override for a mark's size -- needed for a mark
//                 with no box of its own, e.g. a CSS ::first-letter drop cap
//                 (read its computed font-size instead). Omit it to just
//                 measure each seedEl's own mark box.
//   markLengthOf(el)  optional override for HOW MUCH of a seed's text is
//                 the mark (default: its leading run of non-figure,
//                 non-space characters -- see markLeadLength). Needed for a
//                 seed whose mark is smaller than that rule assumes: a
//                 ::first-letter drop cap makes the whole paragraph the
//                 seed, and the cap is one letter, not the opening word.
//                 Return null to take the default.
//   pointOf(el)   optional override for where on the anchor to start --
//                 'edge' (default), 'center', or 'top-left' (for that same
//                 drop-cap case: its containing element's box, not its own).
//   baseSize      the "ordinary sigil" reference size a mark's boost is
//                 measured against, and the scale distances are drawn at;
//                 defaults to `proseEl`'s own live computed font-size.
//   debug         draw the obstacle field the walk steered around.
//
// Geometry (obstacles, marks, the turtle walk) is recomputed on every
// refresh(); the symbol string is not -- the engine caches that per block.
export function illuminate(hostEl, opts = {}) {
  if (!hostEl) throw new Error('illuminate: hostEl is required');
  const illum = need();
  const cs = getComputedStyle(hostEl);
  if (cs.position === 'static') hostEl.style.position = 'relative';

  let svg = hostEl.querySelector(':scope > svg.illum-overlay');
  if (!svg) {
    svg = buildOverlaySvg(hostEl.clientWidth || 1, hostEl.clientHeight || 1);
    hostEl.insertBefore(svg, hostEl.firstChild);
  }

  let firstRender = true;
  function layout() {
    const hostRect = hostEl.getBoundingClientRect();
    svg.setAttribute('viewBox', `0 0 ${hostRect.width} ${hostRect.height}`);
    svg.setAttribute('width', String(hostRect.width));
    svg.setAttribute('height', String(hostRect.height));

    if (opts.enabled === false || !opts.blockHash) { renderSegments(svg, []); return; }

    const proseEl = opts.proseEl || hostEl;
    const seedEls = (opts.seedEls && opts.seedEls.length) ? Array.from(opts.seedEls) : [];
    // The marks themselves are not obstacles to their own vines -- see
    // measureObstacles. Everything else under the obstacle root is,
    // including the counts riding those marks.
    const obstacles = measureObstacles(opts.obstacleEl || proseEl, hostRect,
      { siglaSpans: siglaSpans(seedEls, opts.markLengthOf) });
    // The body text's OWN current size, measured fresh on every layout()
    // pass rather than once when illuminate() was first called -- a
    // font-scale change (btc-fontscale.js) reflows the text, which resizes
    // hostEl, which the ResizeObserver below already treats as a reason to
    // re-run layout(); measuring live here is what makes that re-run
    // actually pick up the NEW size instead of quietly redrawing at the
    // stale one. `opts.baseSize` remains available as an explicit override
    // for a caller with no representative element to measure (a synthetic
    // sample with no real body text -- see illumination-lab.html).
    const baseSize = opts.baseSize ?? (parseFloat(getComputedStyle(proseEl).fontSize) || params.referenceFontSize);

    const out = illum.illuminate({
      seed: opts.blockHash,
      // The engine counts in whatever unit its stage ladder is written in and
      // attaches no meaning to the number; this book's ladder is written in
      // confirmations, so that is what goes across. The word stays `confirmations`
      // on THIS side, where it is the truth, and `time` on that side, where it
      // is anybody's.
      time: opts.confirmations ?? 0,
      host: { x: 0, y: 0, w: hostRect.width, h: hostRect.height },
      page: opts.boundsEl ? toHostSpace(opts.boundsEl.getBoundingClientRect(), hostRect) : null,
      obstacles,
      seeds: seedEls.map((el) => describeSeed(el, hostRect, opts)),
      baseSize,
      params,
      stages: GROWTH_STAGES,
    });

    renderSegments(svg, out.anchors, {
      animate: firstRender && !reducedMotion(),
      obstacles: out.obstacles,
      debug: !!opts.debug,
    });
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
