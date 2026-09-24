// SPDX-License-Identifier: MIT OR Apache-2.0
//
// btc-citation.js — the book's three-tier block numbering. Volume = a
// halving era (210,000 blocks -- the block subsidy halves at each
// boundary). Book = a difficulty-adjustment window (2016 blocks -- Bitcoin
// retargets every 2016 blocks) within that era. Chapter = a block's
// position within its book.
//
// 210000 isn't a multiple of 2016 (210000/2016 ~= 104.17), so book
// numbering restarts at 1 with each volume rather than counting real global
// difficulty periods -- the last book of every era is a shorter, truncated
// one (336 blocks instead of 2016).
//
// So a book coincides with a real retarget window only in Volume I. Each era
// after that opens 336 blocks further into a live window (336, 672, 1008,
// 1344, 1680), and a book of 2016 blocks straddles a retarget rather than
// naming one. The grids realign at Volume VII: 6 * 210000 = 1260000 = 625
// windows exactly. See web/preface.md, "Why it is arranged this way".
//
// Used by bitcoin-book.html to place each block within the volume/book/chapter
// scheme.

const ERA_BLOCKS = 210000;
const DIFFICULTY_BLOCKS = 2016;

// The inverse of volumeBookChapter: the block height at volume V, book B,
// chapter C (all 1-based). Chapter 1 is a book's first block, so a partial
// reference like "III 2" (era 3, book 2) resolves here with chapter defaulting
// to 1. Not clamped to a book's real length -- a chapter past the book's end
// spills into the following book, exactly as the forward formula implies.
export function heightOf(volume, book, chapter) {
  return (volume - 1) * ERA_BLOCKS + (book - 1) * DIFFICULTY_BLOCKS + (chapter - 1);
}

export function volumeBookChapter(height) {
  const volumeIndex = Math.floor(height / ERA_BLOCKS);
  const eraStart = volumeIndex * ERA_BLOCKS;
  const offsetInEra = height - eraStart;
  const bookIndex = Math.floor(offsetInEra / DIFFICULTY_BLOCKS);
  const bookStart = eraStart + bookIndex * DIFFICULTY_BLOCKS;
  const bookLength = Math.min(DIFFICULTY_BLOCKS, ERA_BLOCKS - bookIndex * DIFFICULTY_BLOCKS);
  return {
    volume: volumeIndex + 1,
    book: bookIndex + 1,
    chapter: height - bookStart + 1,
    chapterCount: bookLength,
  };
}

// The coinage schedule: the subsidy a coinbase at this height may claim, in
// satoshis -- 50 ₿ through Volume I, halved at each volume boundary (a
// volume IS a halving era). The right-shift floors where an era's figure
// falls below the satoshi's grain (the tenth halving onward), exactly as
// consensus does, and from the 64th halving on the schedule mints nothing.
export function subsidyAt(height) {
  const halvings = Math.floor(height / ERA_BLOCKS);
  return halvings >= 64 ? 0 : Number(5000000000n >> BigInt(halvings));
}

// The start of the real difficulty window a height sits in -- the retarget
// grid, which runs on from the genesis block and knows nothing about the
// halvings the book grid restarts at.
export const windowStartOf = (height) => height - (height % DIFFICULTY_BLOCKS);

// The one retarget a book can contain: the height inside it where a second
// difficulty target binds, or null where the book is a whole window and was
// mined under one target throughout.
//
// Never more than one. A retarget falls every 2,016 blocks and a book is at
// most 2,016 blocks, so at most one boundary can land strictly inside -- a
// book states two targets or one, never three. It is null for the whole of
// Volume I, whose books open on retargets, and for every volume's truncated
// last book: those 336 blocks begin at most 1,680 into a window, so they stop
// exactly at the next boundary at the latest, never past it.
export function retargetInside(start, chapterCount) {
  const offset = start % DIFFICULTY_BLOCKS;
  if (offset === 0) return null;
  const cut = start + (DIFFICULTY_BLOCKS - offset);
  return cut <= start + chapterCount - 1 ? cut : null;
}

// A volume number as a Roman numeral (the book cites volumes in Roman).
export function toRoman(n) {
  const map = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
  let out = '';
  for (const [v, s] of map) while (n >= v) { out += s; n -= v; }
  return out || '0';
}

// The scripture-style reference for a block height: Roman volume, the book
// marked with β, the chapter with ■ (e.g. "III β2 ■5"). Each level below the
// volume carries the sigil of what it is: β is the difficulty mark, and a book
// is a difficulty-adjustment window; ■ is the block mark (the timelock glyph),
// and a chapter is a block. A transaction adds a §section to this.
export function reference(height) {
  const { volume, book, chapter } = volumeBookChapter(height);
  return `${toRoman(volume)} β${book} ■${chapter}`;
}

// ── Reading a reference back ──────────────────────────────────────────────
// The inverse of the above, and the one parser for it: the search box, the
// book's own ?block= / ?ref= lookups, and the curated contents all read a
// reference through this, so a citation that resolves in one place resolves in
// every place. (It lives here rather than in a page because a spelling of the
// citation scheme IS the citation scheme.)

// Parse a Roman numeral (a volume) -- the inverse of toRoman. Returns NaN on
// any non-Roman character, so a malformed token is rejected, not misread.
export function fromRoman(s) {
  const val = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  let total = 0, prev = 0;
  for (let i = s.length - 1; i >= 0; i--) {
    const v = val[s[i].toUpperCase()];
    if (!v) return NaN;
    if (v < prev) total -= v; else { total += v; prev = v; }
  }
  return total;
}

// Both spellings a reference is written in:
//
//   the quoted form, as the book prints it and a reader would say it --
//   "III β2 ■5", "I β29 ■596 §85", "βoβ I β50 ■1807 §85.4"; the β ■ § sigils
//   are optional on input, so a bare "III 2 5" resolves the same way, and □
//   reads wherever ■ does (a height's place is fixed by consensus, not by
//   mining -- see expectedReference below, which prints the same difference)
//   the URL form, as a citation travels in a link -- "v3b2c5", "v1b29c596s85",
//   "v1b50c1807s85o4"
//
// After the point, digits and letters name two different coordinates: §85.4
// is the section's output 4, and §85.a its witness footnote a -- the alphabet
// index the page prints on the footnote's mark. The URL form spells the two
// apart, o4 against wa.
//
// Every level below the volume may be omitted, and the depth is the point: the
// finest level named is the page meant. Returns
//
//   { volume, book, chapter, section, out, wit, height, index }
//
// with section/out/wit null when unnamed (`wit` the 1-based footnote number a
// letter mark resolves to), `height` the first block of the finest
// named span, and `index` the book's own page convention -- 0-based section, or
// -1 a chapter's own page, -2 a book's leaf, -3 a volume's leaf. Null when the
// input is not a reference at all, which is how callers tell a citation from a
// height or a hash -- and null too for a lettered mark that isn't one (a q):
// the reference fails whole rather than resolving to a guess.
// Both spellings carry depth the same way: a level left unwritten is a level
// not named, so "III" and "v3" are a volume's leaf, "III β2" and "v3b2" a
// book's. (Every ?ref= link the pages generate is chapter-deep or finer, so
// nothing that already exists reads differently for the shorter forms being
// admitted here.)
const QUOTED_REF = /^(?:βoβ\s+)?([ivxlcdm]+)(?:[\s]+β?\s*(\d+))?(?:[\s]+[■□]?\s*(\d+))?(?:[\s]+§?\s*(\d+)(?:\.(\d+|[a-z]+))?)?$/i;
const URL_REF = /^v(\d+)(?:b(\d+))?(?:c(\d+))?(?:s(\d+))?(?:o(\d+)|w([a-z]+))?$/i;

export function parseReference(input) {
  const s = String(input ?? '').trim().replace(/\s+/g, ' ');
  const url = URL_REF.exec(s);
  const m = url || QUOTED_REF.exec(s);
  if (!m) return null;
  const volume = url ? parseInt(m[1], 10) : fromRoman(m[1]);
  if (!Number.isFinite(volume) || volume < 1) return null;
  const book = m[2] ? parseInt(m[2], 10) : null;
  const chapter = m[3] ? parseInt(m[3], 10) : null;
  const section = m[4] ? parseInt(m[4], 10) : null;
  // The coordinate after the point: the URL form spells output and witness
  // apart (o4 / wa, groups 5 and 6); the quoted form's one group is told
  // apart by what it's made of -- digits are an output, letters a footnote
  // mark, read back to its number (null for a non-mark, failing the whole
  // reference).
  let out = null, wit = null, sig = false;
  // A lettered mark names an input, and its CASE says what that input carried:
  // lowercase a witness, uppercase a scriptSig. One mark, two facts -- and the
  // letter alone still names the right input, so a citation that loses its case
  // in transit loses the carriage and not the target. Mixed case is neither,
  // and a coordinate that could be read two ways is not one.
  const readMark = (mark) => {
    const lower = /^[a-z]+$/.test(mark), upper = /^[A-Z]+$/.test(mark);
    if (!lower && !upper) return false;
    sig = upper;
    wit = footnoteIndexOf(mark);
    return wit != null;
  };
  if (url) {
    out = m[5] ? parseInt(m[5], 10) : null;
    if (m[6] != null && !readMark(m[6])) return null;
  } else if (m[5] != null) {
    if (/^\d+$/.test(m[5])) out = parseInt(m[5], 10);
    else if (!readMark(m[5])) return null;
  }
  if ((book !== null && book < 1) || (chapter !== null && chapter < 1)
    || (section !== null && section < 1) || (out !== null && out < 0)) return null;
  return {
    volume, book, chapter, section, out, wit, sig,
    height: heightOf(volume, book ?? 1, chapter ?? 1),
    index: section !== null ? section - 1 : chapter !== null ? -1 : book !== null ? -2 : -3,
  };
}

// A reference in the URL spelling, whichever spelling it arrived in -- what a
// ?ref= link carries, carrying exactly the depth it was given. Null for
// anything that is not a reference.
export function latinReference(input) {
  const r = parseReference(input);
  if (!r) return null;
  return `v${r.volume}`
    + (r.book !== null ? `b${r.book}` : '')
    + (r.chapter !== null ? `c${r.chapter}` : '')
    + (r.section !== null ? `s${r.section}` : '')
    + (r.out !== null ? `o${r.out}` : '')
    + (r.wit != null ? `w${inputMark(r.wit, r.sig)}` : '');
}

// The URL spelling built from a height (which always names a chapter), plus the
// section and output where they are known -- what a ledger row's citation links
// to, and the inverse of parseReference's `height`.
export function latinRefOf(height, section = null, out = null, wit = null, sig = false) {
  const { volume, book, chapter } = volumeBookChapter(height);
  return `v${volume}b${book}c${chapter}`
    + (section != null ? `s${section}` : '')
    + (out != null ? `o${out}` : '')
    + (wit != null ? `w${inputMark(wit, sig)}` : '');
}

// The same reference for a height no block has reached: the expected-chapter
// mark □ where a mined chapter wears ■ (e.g. "LXV β1 □1"). The arithmetic is
// identical -- a height's place is fixed by consensus, not by mining -- so
// only the mark differs, and it differs to say the block is still owed. Read
// by the mempool's projections and the contents' Appendix II.
export function expectedReference(height) {
  return reference(height).replace('■', '□');
}

// ─── footnote marks: letters, not numerals ──────────────────────────────
//
// A witness footnote is lettered the way a book letters its notes — a, b, c
// — not numbered, so a superscript mark never reads as arithmetic beside the
// numerals the prose is full of (push counts, amounts, indices).
//
// The run is the alphabet entire, and continues in bijective base-26 — aa
// after z, aaa after zz — the same scheme a spreadsheet letters its columns
// in. Single letters cover 1–26, doubles 27–702 (26 × 26 = 676 of them,
// starting at 27), triples 703 upward. The doubles' span is what puts the
// third letter at 703 rather than at 677.
//
// The letter is plain ASCII, raised by the stylesheet where a mark is set
// (.tx-witness-ref, .footnote-mark), so no letter has to exist in a raised
// form for a mark to be set in it. tools/chain-witness.test.mjs holds that.
const FOOTNOTE_ALPHABET = 'abcdefghijklmnopqrstuvwxyz';
export const FOOTNOTE_BASE = FOOTNOTE_ALPHABET.length;   // 26

// A 1-based footnote index -> its mark. 1 is 'a', 25 'z', 26 'aa', 651 'aaa'.
export function footnoteMark(n) {
  let i = Math.floor(n);
  if (!Number.isFinite(i) || i < 1) return '';
  let out = '';
  while (i > 0) {
    const r = (i - 1) % FOOTNOTE_BASE;
    out = FOOTNOTE_ALPHABET[r] + out;
    i = Math.floor((i - 1) / FOOTNOTE_BASE);
  }
  return out;
}

// An input's mark: the letter for its number, cased for what it carried --
// lowercase a witness, uppercase a scriptSig. The letter is positional, so it
// is the input's own number and needs no counting; the case is a tag on top of
// it, which is why lowercasing a citation still lands on the right input.
export const inputMark = (n, sig = false) =>
  (sig ? footnoteMark(n).toUpperCase() : footnoteMark(n));

// The inverse: a mark -> its 1-based index, or null if it isn't one. Lets a
// lettered address be read back to the footnote it names.
export function footnoteIndexOf(mark) {
  const s = String(mark || '').toLowerCase();
  if (!s || !/^[a-z]+$/.test(s)) return null;
  let n = 0;
  for (const ch of s) {
    const i = FOOTNOTE_ALPHABET.indexOf(ch);
    if (i < 0) return null;                  // not a letter of the run
    n = n * FOOTNOTE_BASE + (i + 1);
  }
  return n || null;
}

// ── A citation, whole ─────────────────────────────────────────────────────
// The book's own printed spelling, built from the parts a place is known by:
// the chapter's reference, the §section where one is named, and after the
// point the output or the witness footnote that names a part of it. This is
// latinRefOf's counterpart -- the same place, in the form the book prints
// rather than the form a URL carries -- and it lives here for the reason the
// parser does: a citation spelled two ways is two citation schemes.
export function citation(height, section = null, out = null, wit = null, sig = false) {
  const sec = section == null ? ''
    : ` §${section}${out != null ? `.${out}` : wit != null ? `.${inputMark(wit, sig)}` : ''}`;
  return reference(height) + sec;
}

// What a keep is called when it has neither the reader's own title nor prose
// to be said by. A txid is never the answer: it is high-entropy bytes, which
// reach a reader through Glossia or not at all, and the book has a name for
// this place already -- its reference. A LEAF is named by the span it stands
// at, a volume by its numeral and a book by the β mark, because the chapter
// reference would cite the block that opens the span: a different place, and
// a different keep.
export function keepReference({ height, pos = null, vout = null, wn = null, page = null }) {
  if (!Number.isInteger(height)) return '';
  const { volume, book } = volumeBookChapter(height);
  if (page === 'volume') return toRoman(volume);
  if (page === 'book') return `${toRoman(volume)} β${book}`;
  return citation(height, pos == null ? null : pos + 1, vout, wn);
}
