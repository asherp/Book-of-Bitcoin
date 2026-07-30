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
// numerals the prose is full of (push counts, amounts, indices). The
// alphabet omits q: at superscript size, and in the serif the book sets, a
// q is too near a g, and a footnote mark is the one glyph a reader must
// identify at a glance to find its note.
//
// That leaves 25 letters, and the run continues in bijective base-25 —
// aa after z, aaa after zz — the same scheme a spreadsheet letters its
// columns in. So single letters cover 1–25, doubles 26–650 (25 × 25 = 625
// of them, starting at 26), triples 651 upward. The doubles' span is what
// puts the third letter at 651 rather than 626.
const FOOTNOTE_ALPHABET = 'abcdefghijklmnoprstuvwxyz';   // no q
export const FOOTNOTE_BASE = FOOTNOTE_ALPHABET.length;   // 25

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

// The inverse: a mark -> its 1-based index, or null if it isn't one (an
// unknown letter, a q, anything else). Lets a lettered address be read back
// to the footnote it names.
export function footnoteIndexOf(mark) {
  const s = String(mark || '').toLowerCase();
  if (!s || !/^[a-z]+$/.test(s)) return null;
  let n = 0;
  for (const ch of s) {
    const i = FOOTNOTE_ALPHABET.indexOf(ch);
    if (i < 0) return null;                  // a q, or not a letter of the run
    n = n * FOOTNOTE_BASE + (i + 1);
  }
  return n || null;
}
