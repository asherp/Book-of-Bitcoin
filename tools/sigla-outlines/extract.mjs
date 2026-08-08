// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/sigla-outlines/extract.mjs — a dev-only, offline build step: pulls
// the real glyph outline for every Book Sigla character btc-illumination.js
// can seed a vine from (an opcode mark, a superscript/subscript digit, the
// difficulty-target mark β), normalizes each to a unit square, and writes
// the result to web/sigla-outlines.js -- the data module the app actually
// ships and imports at runtime.
//
// Why offline rather than in the browser: the app has no build step and no
// third-party runtime dependency (see README's License section on why the
// fonts are vendored at all); a glyph-outline PARSER is a much heavier
// thing to ship to every reader than five small woff2 files already are.
// Doing it once here, into a plain data module, keeps the app's own runtime
// exactly as dependency-free as before -- this tool and its one dependency
// (fontkit, for WOFF2's brotli-compressed glyf/cff tables) live in this
// isolated package, the same way tools/twitter-bot isolates Playwright.
//
// Run: cd tools/sigla-outlines && npm install && node extract.mjs
//
//   node tools/sigla-outlines/extract.mjs   (from the repo root, once installed)

import { openSync } from 'fontkit';
import { writeFile } from 'node:fs/promises';
import { OPCODE_SYMBOLS, toSuperscript, toSubscript } from '../../web/btc-sigla.js';
import { FONT_FACES } from '../twitter-bot/quote.mjs';
const FONTS_DIR = new URL('../../web/fonts/', import.meta.url);
const OUT_FILE = new URL('../../web/sigla-outlines.js', import.meta.url);

// ─── which characters need an outline ──────────────────────────────────
// Every codepoint that can appear as the FIRST character of a .op or
// .cfx-gold seed's textContent (see measureAnchors in btc-illumination.js) --
// not just each mark's own base glyph, since a two-codepoint mark like
// '¬⟨' or '⊘ᵛ' is still keyed by its actual first codepoint at render time.
//
// NUMERALS ARE NOT SIGLA, and none are carried. A count riding a mark is
// apparatus, not notation -- β's subscript says how many leading zero bits,
// ⧉₂'s says which DUP -- and a vine has no business tracing the shape of a
// figure. The marks themselves are what a scribe would have illuminated.
// (bitcoin-book.html drops count-only marks from its seed list for the same
// reason; see isCountOnly there.) The enclosed digits ⓪ ①–⑯ stay: those are
// not numerals riding a mark, they ARE the marks for OP_0..OP_16, a single
// glyph each, and the notation has no other way to write them.
const DIGIT_FORMS = /[0-9²³¹⁰-⁹₀-₉]/;
// The notation's marks that are not opcodes, and so are in none of the tables
// btc-sigla.js exports -- but which a passage seeds vines from just the same:
// an input's sequence mark and a locktime's (btc-prose.js's seqInfo and
// locktimeInfo), the empty-list mark, the reference marks a citation is built
// from, the merkle-proof mark, the header's nonce, and the dagger a superseded
// draft wears. Without these the very marks a margin citation or a locktime
// line grows from had no letterform to trace and fell back to their bounding
// box, quietly, while the opcodes beside them traced properly.
const NOTATION_MARKS = ['β', '∅', '●', '○', '□', '■', '§', '‡', '⋔', 'η', '†'];
function targetChars() {
  const chars = new Set();
  for (const sym of Object.values(OPCODE_SYMBOLS)) for (const ch of sym) chars.add(ch);
  for (const ch of NOTATION_MARKS) chars.add(ch);
  return [...chars].filter((ch) => !DIGIT_FORMS.test(ch));
}

// ─── unicode-range membership, the same ranges fonts.css declares ──────
// "U+0041-005A, U+0061" -> [[0x41,0x5A], [0x61,0x61]]
function parseRange(range) {
  return range.split(',').map((part) => {
    const m = part.trim().match(/^U\+([0-9A-Fa-f]+)(?:-([0-9A-Fa-f]+))?$/);
    if (!m) throw new Error(`unparseable unicode-range segment: "${part}"`);
    const lo = parseInt(m[1], 16);
    return [lo, m[2] ? parseInt(m[2], 16) : lo];
  });
}
function fileForCodePoint(cp, faces) {
  for (const face of faces) {
    if (face.intervals.some(([lo, hi]) => cp >= lo && cp <= hi)) return face.file;
  }
  return null;
}

// Book Sigla only carries the codepoints no OTHER face in the stack already
// has -- an ASCII/Latin-1 mark an opcode reuses (+, −, ×, ÷, <, >, =, %, ¬,
// °, ¶, the legacy ¹²³ superscripts, …) never reaches it at all, since
// whichever real-text face leads the stack (IBM Plex Mono in a script/
// citation context, Newsreader in the hash-prose one) claims it first. Of
// the two, Plex Mono is the closer match to how an opcode mark actually
// reads on the page -- monospace, upright -- so it's the one used here for
// this leftover handful. The weight is cosmetic for outline-tracing
// purposes; 500 is arbitrary among the three vendored weights.
const FALLBACK_FACE = { file: 'plexmono-500-latin.woff2', family: 'IBM Plex Mono' };

// ─── font-space path -> a 'd' string in a unit square, Y flipped to the
// screen's down-is-positive convention (fonts run Y up from the baseline).
// A caller with the character's own measured rect maps straight in --
// hostX = r.x + u*r.w, hostY = r.y + v*r.h -- so no separate font-size
// scale factor needs to travel with this at all. ───────────────────────
function normalizeToUnitSquare(path) {
  const { minX, minY, maxX, maxY } = path.bbox;
  const w = maxX - minX, h = maxY - minY;
  if (!(w > 0) || !(h > 0)) return null;   // a blank/notdef glyph -- nothing to trace
  const u = (x) => ((x - minX) / w).toFixed(4);
  const v = (y) => ((maxY - y) / h).toFixed(4);
  const parts = [];
  for (const { command, args } of path.commands) {
    if (command === 'closePath') { parts.push('Z'); continue; }
    const pts = [];
    for (let i = 0; i < args.length; i += 2) pts.push(`${u(args[i])},${v(args[i + 1])}`);
    const letter = { moveTo: 'M', lineTo: 'L', quadraticCurveTo: 'Q', bezierCurveTo: 'C' }[command];
    if (!letter) throw new Error(`unhandled path command: ${command}`);
    parts.push(`${letter}${pts.join(' ')}`);
  }
  return parts.join('');
}

async function main() {
  const siglaFaces = FONT_FACES
    .filter((f) => f.family === 'Book Sigla')
    .map((f) => ({ file: f.file, intervals: parseRange(f.range) }));
  const fallbackFace = FONT_FACES.find((f) => f.file === FALLBACK_FACE.file);
  if (!fallbackFace) throw new Error(`${FALLBACK_FACE.file} is not in FONT_FACES`);
  const fallbackIntervals = parseRange(fallbackFace.range);

  const fonts = new Map();   // file -> opened fontkit font
  const outlines = {};
  const skipped = [];

  for (const ch of targetChars()) {
    const cp = ch.codePointAt(0);
    const file = fileForCodePoint(cp, siglaFaces)
      || (fallbackIntervals.some(([lo, hi]) => cp >= lo && cp <= hi) ? FALLBACK_FACE.file : null);
    if (!file) { skipped.push([ch, 'no vendored face covers U+' + cp.toString(16).toUpperCase()]); continue; }
    if (!fonts.has(file)) fonts.set(file, openSync(new URL(file, FONTS_DIR).pathname));
    const font = fonts.get(file);
    const glyph = font.glyphForCodePoint(cp);
    if (!glyph || glyph.id === 0) { skipped.push([ch, `${file} has no glyph for U+${cp.toString(16).toUpperCase()}`]); continue; }
    const d = normalizeToUnitSquare(glyph.path);
    if (!d) { skipped.push([ch, 'degenerate/blank outline']); continue; }
    outlines[ch] = d;
  }

  const entries = Object.entries(outlines)
    .map(([ch, d]) => `  ${JSON.stringify(ch)}: ${JSON.stringify(d)},`)
    .join('\n');
  const banner = `// SPDX-License-Identifier: MIT OR Apache-2.0
//
// web/sigla-outlines.js — GENERATED by tools/sigla-outlines/extract.mjs.
// Do not hand-edit; regenerate with:
//   cd tools/sigla-outlines && npm install && node extract.mjs
//
// One normalized outline per Book Sigla character btc-illumination.js's
// seed marks (.op, .cfx-gold) can carry -- an SVG path 'd' string in a
// UNIT SQUARE (x: 0..1 left-to-right, y: 0..1 top-to-bottom, the screen's
// own convention rather than the font's own Y-up one). A caller holding
// the character's own measured rect \`r\` maps straight into it:
//   hostX = r.x + u*r.w, hostY = r.y + v*r.h
// -- no separate font-size scale factor travels with this at all, since
// the outline is already proportioned to whatever box the browser actually
// rendered that glyph into.
//
// A character not listed here (a Latin letter, the drop cap, anything the
// notation doesn't use as a seed) has no entry; callers fall back to the
// sigil's own bounding-box edge -- see btc-illumination.js's measureAnchors.
export const SIGLA_OUTLINES = {
${entries}
};
`;
  await writeFile(OUT_FILE, banner, 'utf8');
  console.log(`wrote ${Object.keys(outlines).length} outlines to ${OUT_FILE.pathname}`);
  if (skipped.length) {
    console.log(`skipped ${skipped.length} character(s) (falls back to bbox-edge tangent at runtime):`);
    for (const [ch, why] of skipped) console.log(`  ${JSON.stringify(ch)} — ${why}`);
  }
}

await main();
