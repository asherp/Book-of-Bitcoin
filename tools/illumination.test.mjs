// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/illumination.test.mjs — the generated outline set (web/sigla-outlines.js).
//
// The engine that grows the decoration lives in the `scriptorium` crate now
// (see build_scriptorium.sh), and so do its tests: the growth-stage buckets,
// the L-system's symbolic output, the turtle's wall-following, the contour
// rules and the mark/apparatus split are all checked there, natively, against
// the same assertions that used to live here. `cargo test` in that repo is
// where they run; nothing about them ever needed a browser OR a book.
//
// What stays here is the one thing that is genuinely this book's: which of
// ITS marks, in ITS vendored font, carry an outline for a vine to trace. The
// engine takes that table from its host rather than knowing any notation of
// its own (see btc-illumination.js's init), so this file is what stands
// between a regenerated table and a silently plainer page.
//
//   node --test tools/illumination.test.mjs

import test from 'node:test';
import assert from 'node:assert/strict';

// The rule this guards lives in a build step nobody runs by hand
// (tools/sigla-outlines/extract.mjs), so a regenerate that quietly readmitted
// the numerals — or dropped a family of marks — would otherwise leave no
// trace at all.
const { SIGLA_OUTLINES } = await import('../web/sigla-outlines.js');

test('no numeral carries an outline -- a count is apparatus, not a mark', () => {
  // A count is not a mark: β's subscript says how many leading zero bits, a
  // direct push's superscript how many bytes. No figure gets an outline, and
  // no vine traces the shape of one.
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

test('every outline is path data the engine can actually sample', () => {
  // The engine parses these itself now rather than handing them to an
  // SVGPathElement, and it supports the command set a font outline is made of
  // — moves, lines, quadratics, cubics, closes. An arc would be dropped
  // silently at runtime, leaving the mark with no rail and no complaint, so
  // it is caught here instead.
  for (const [ch, d] of Object.entries(SIGLA_OUTLINES)) {
    assert.ok(d.startsWith('M'), `${ch}'s outline must open with a moveto`);
    const commands = new Set((d.match(/[A-Za-z]/g) || []));
    for (const c of commands) {
      assert.ok('MLQCZ'.includes(c), `${ch}'s outline uses an unsupported command "${c}"`);
    }
  }
});

test('every outline stays inside the unit square it is normalized to', () => {
  // A caller maps straight through a measured ink box with no separate scale
  // factor (hostX = r.x + u*r.w), so a coordinate outside 0..1 would put part
  // of the rail off the letter it describes.
  for (const [ch, d] of Object.entries(SIGLA_OUTLINES)) {
    for (const n of d.match(/-?\d+\.?\d*/g) || []) {
      const v = parseFloat(n);
      assert.ok(v >= -0.001 && v <= 1.001, `${ch}'s outline has a coordinate ${v} outside the unit square`);
    }
  }
});
