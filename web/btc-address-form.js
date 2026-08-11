// SPDX-License-Identifier: MIT OR Apache-2.0
//
// btc-address-form.js — the book's own address format: a scriptPubKey spelled
// in sigla, and read back to the bytes it spells.
//
// The alphabet is a bijection. Every one of the 110 defined opcodes has a
// glyph, no two share one, and not one of them contains an ASCII letter or a
// space (checked in tools/address-form.test.mjs, because the whole of this
// module rests on it). So a script written in sigla, with its data pushes as
// Glossia prose, resolves to Script and to nothing else -- no version byte, no
// table of known patterns, no registry to extend. Which makes it an address
// format, and a stricter one than the formats it stands beside: it can name a
// script no address can write, and it never had to be told what P2SH is.
//
//   ⧉ ⌖ h²⁰ ridge amused garment … inmate ≡ ∇
//
// The mark before the prose is what makes the prose readable: Glossia's
// canonical decode has to be told the payload's byte count, because the fixed
// packing does not carry one. The book has been printing that count on the mark
// all along -- h²⁰, p³² -- so the count that made the notation legible is the
// same count that makes it invertible. A superscript is not decoration here; it
// is the length field, and it is the only one the format has.
//
// The letter in front of it (h, p) is the other way round: pure legibility, and
// the parser reads straight past it. What the letter says -- this datum is a
// hash, that one a key -- is a reading of the bytes, not a fact the bytes carry,
// so it can never be load-bearing.
//
// The engine is injected, never imported. `say` turns a push's bytes into prose
// and `hear` turns prose back into bytes; both are Glossia's (encodeCanonical /
// decodeCanonical in glossia-msg.js), and both are the caller's to supply. So
// this module loads without the WASM build, tokenizes and classifies without
// it, and only the datum itself needs it -- which is the same division the rest
// of the book keeps.

import { OPCODE_SYMBOLS, OPCODE_NAMES, toSuperscript } from './btc-sigla.js';
import { tokenizeScript } from './btc-tx.js';

// The alphabet, inverted once. Its injectivity is the format's whole warrant,
// so a collision would quietly cost a byte its only spelling -- the test pins
// that this map has exactly as many entries as the table it was built from.
export const OPCODE_OF_GLYPH = new Map(
  Object.entries(OPCODE_SYMBOLS).map(([code, glyph]) => [glyph, Number(code)]));

const SUPERSCRIPTS = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const fromSuperscript = (s) => {
  let n = 0;
  for (const c of s) {
    const d = SUPERSCRIPTS.indexOf(c);
    if (d < 0) return null;
    n = n * 10 + d;
  }
  return s.length ? n : null;
};

// The push forms, as the notation writes them: a bare count is a direct push
// (OP_PUSHBYTES_n, the length in the opcode itself), and an arrow is
// OP_PUSHDATA1/2/4 -- arrow weight matching the width of the length prefix. The
// distinction is not cosmetic: 20 bytes pushed directly and 20 bytes pushed
// through PUSHDATA1 are different scripts, and a format that lost the
// difference would not resolve.
const PUSH_ARROWS = { '↧': 1, '⇊': 2, '⤋': 4 };
const ARROW_OF_FORM = { 1: '↧', 2: '⇊', 4: '⤋' };

// A push mark: an optional data letter, an optional arrow, and the byte count.
// Returns { form, bytes } or null.
const MARK = new RegExp(`^[a-z]?([${Object.keys(PUSH_ARROWS).join('')}]?)([${SUPERSCRIPTS}]+)$`);
export function parseMark(token) {
  const m = MARK.exec(token);
  if (!m) return null;
  const bytes = fromSuperscript(m[2]);
  if (bytes === null) return null;
  return { form: m[1] ? PUSH_ARROWS[m[1]] : 0, bytes };
}

// ─── spelling ────────────────────────────────────────────────────────────

// The datum's letter, which is legibility rather than information: the book
// gives a hash-sized push h and a key-shaped one p, and Taproot's argument is
// an output key though it is 32 bytes like a hash. Kept deliberately narrow --
// this is a scriptPubKey, where a signature never appears, so the renderer's
// fuller reading (btc-prose.js) has nothing here to disagree with.
const isKeyShaped = (hex) => (hex.length / 2 === 33 && /^0[23]/.test(hex))
  || (hex.length / 2 === 65 && hex.startsWith('04'));
function dataLetter(pushHex, prevOp) {
  const n = pushHex.length / 2;
  if (isKeyShaped(pushHex)) return 'p';
  if (n === 32 && prevOp === 0x51) return 'p';   // a Taproot output key
  if (n === 20 || n === 32) return 'h';
  return '';
}

// scriptPubKey hex -> the address, spelled. `say(hex)` is the engine's prose for
// a push's bytes; without it the data pushes stand as their marks alone, which
// is legible but no longer resolves -- `complete` says which it is, so a caller
// never offers a half-spelling as an address.
//
// Null when the bytes are not a whole script: a truncated push has no spelling,
// and inventing one would be inventing a script.
export function spell(scriptHex, { say = null } = {}) {
  let toks;
  try { toks = tokenizeScript(scriptHex); } catch { return null; }
  if (!toks.length || toks.some((t) => t.trunc !== undefined)) return null;
  const parts = [];
  let complete = true;
  let prevOp = null;
  for (const t of toks) {
    if (t.op !== undefined) {
      const glyph = OPCODE_SYMBOLS[t.op];
      if (glyph === undefined) return null;      // an undefined byte is not a mark
      prevOp = t.op;
      parts.push(glyph);
      continue;
    }
    const bytes = t.push.length / 2;
    parts.push(dataLetter(t.push, prevOp) + (ARROW_OF_FORM[t.pushForm] || '') + toSuperscript(bytes));
    prevOp = null;
    if (!bytes) continue;                        // a zero-length push says itself
    const prose = say ? say(t.push) : null;
    if (prose) parts.push(prose);
    else complete = false;
  }
  return { text: parts.join(' '), complete };
}

// ─── reading it back ─────────────────────────────────────────────────────

// The tokens of a spelled script, classified without reading any datum: each is
// an opcode, a push mark, or a word belonging to the prose of the mark before
// it. Null the moment one is none of those -- a word where no push is open is
// not prose, it is not a script, and the book does not guess.
//
// This is what makes classification free of the engine: the shape of a spelled
// script is decidable from the alphabet alone, so a page can tell that a reader
// pasted one before it has any way to read what it says.
export function scan(text) {
  const tokens = String(text ?? '').trim().split(/\s+/).filter(Boolean);
  if (!tokens.length) return null;
  const out = [];
  let open = null;                                // the push still gathering prose
  for (const token of tokens) {
    const code = OPCODE_OF_GLYPH.get(token);
    if (code !== undefined) { open = null; out.push({ op: code }); continue; }
    const mark = parseMark(token);
    if (mark) {
      open = mark.bytes ? { ...mark, words: [] } : null;
      out.push(mark.bytes ? open : { ...mark, words: [] });
      continue;
    }
    if (open) { open.words.push(token); continue; }
    return null;
  }
  // Every push that opened must have been given something to say.
  if (out.some((t) => t.bytes && !t.words.length)) return null;
  return out;
}

// Bare hex read as a locking script. Any byte string is a scriptPubKey by
// consensus, so what this excludes is not "not a script" but "already
// something else in this grammar", and there are exactly two of those:
//
//   · all-digit hex, which is how a height is written. This is the one that
//     matters, and not for the toy cases: 840000 is even-length hex and
//     tokenizes cleanly (OP_AND OP_0 OP_0), as do 500000 and 630000. A rule
//     that took every clean script would swallow the halving.
//   · exactly 64 characters, which is a transaction id or a block hash. It
//     costs nothing to give up: no term is 32 bytes, so nothing addressable
//     is lost, and only a nonstandard lock of that exact size is excluded.
//
// Everything else the grammar takes is ASCII, base58 or bech32 and cannot read
// as hex at all -- a relative height wears a sign, a citation its sigla or its
// leading v, base58 spells no 0 and bech32 opens bc1. So those two shapes are
// the whole of what the script: prefix is still for, and every script the book
// actually shelves passes here bare, its Mt. Gox void (76a90088ac) included.
export function isWholeScript(hex) {
  if (!/^(?:[0-9a-fA-F]{2})+$/.test(hex)) return false;
  if (/^[0-9]+$/.test(hex)) return false;
  if (hex.length === 64) return false;
  try {
    const toks = tokenizeScript(hex);
    return toks.length > 0 && toks.every((t) => t.trunc === undefined);
  } catch { return false; }
}

// Is this string a spelled script? Shape only, and no datum is read -- enough
// to route a query, never enough to accept one. A spelled script holds at least
// one mark of the alphabet, which is what keeps every other form the search box
// takes (heights, hashes, citations, addresses) from answering to this one:
// none of them can contain a glyph or a push mark at all.
export const looksSpelled = (s) => scan(s) !== null;

// A spelled script -> the scriptPubKey it spells, as hex. `hear(prose, bytes)`
// is the engine's decode, told the byte count the mark carries; null when it
// cannot be had, or when the prose does not decode to exactly that many bytes,
// which is the one check that keeps a mistyped word from becoming a different
// output rather than an error.
export function read(text, { hear = null } = {}) {
  const scanned = scan(text);
  if (!scanned) return null;
  const parts = [];
  for (const t of scanned) {
    if (t.op !== undefined) { parts.push(t.op.toString(16).padStart(2, '0')); continue; }
    let payload = '';
    if (t.bytes) {
      if (!hear) return null;
      payload = hear(t.words.join(' '), t.bytes);
      if (typeof payload !== 'string' || payload.length !== t.bytes * 2) return null;
    }
    // The mark's own form, restored: a bare count is the push opcode itself, an
    // arrow is a PUSHDATA with its length in a prefix, little-endian.
    if (t.form === 0) {
      if (t.bytes > 75) return null;
      parts.push(t.bytes.toString(16).padStart(2, '0'));
    } else {
      parts.push((0x4b + t.form).toString(16));
      let n = t.bytes;
      for (let i = 0; i < t.form; i++) { parts.push((n & 0xff).toString(16).padStart(2, '0')); n >>= 8; }
    }
    parts.push(payload.toLowerCase());
  }
  return parts.join('');
}

// The name behind a glyph, for a page that wants to say what a mark is without
// pulling in the whole opcode table.
export const nameOfGlyph = (glyph) => OPCODE_NAMES[OPCODE_OF_GLYPH.get(glyph)] ?? null;
