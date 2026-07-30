// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/twitter-bot/citation.mjs — find a citation in free-form tweet text.
//
// The book cites a passage as volume·book·chapter·§section (see
// web/btc-citation.js): Roman volume, β the difficulty mark, ■ the block
// mark, § the section — "III β2 ■5 §1". A tweet rarely arrives that cleanly,
// so this parser accepts the citation in every form a phone keyboard can
// produce:
//
//   sigla     III β2 ■5 §1        (the book's own notation; § optional)
//   ascii     III b2 c5 s1        (b=book, c=chapter, s=section)
//   hashtag   #IIIb2c5s1          (the same, packed — hashtags carry no spaces)
//   block     block 170 §2        (a height directly; "block 170 s2" too)
//   txid      64 hex characters   (a transaction id, resolved via merkle proof)
//
// Section defaults to 1 (the coinbase — a chapter's opening section) when
// absent, mirroring how a partial reference resolves in the book. A chapter
// past its book's end spills into the following book exactly as heightOf
// implies; the reply always cites the canonical reference(height), so a
// spilled citation is answered under its true address.

import { heightOf, toRoman } from '../../web/btc-citation.js';

const ROMAN = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };

// Roman numeral -> integer, strictly: the value must re-render to the same
// numeral, so malformed sequences ("IIII", "VX") are rejected rather than
// guessed at.
export function fromRoman(s) {
  const up = String(s || '').toUpperCase();
  if (!up || [...up].some((c) => !(c in ROMAN))) return null;
  let total = 0;
  for (let i = 0; i < up.length; i++) {
    const v = ROMAN[up[i]];
    const next = ROMAN[up[i + 1]] || 0;
    total += v < next ? -v : v;
  }
  return toRoman(total) === up ? total : null;
}

// The forms, most specific first. The ascii/hashtag form requires the full
// b…c… skeleton so ordinary prose ("I b2 my time") can't satisfy it by
// accident; the sigla form's marks are unambiguous on their own.
const SIGLA = /\b([MDCLXVImdclxvi]+)\s*β\s*(\d+)\s*■\s*(\d+)(?:\s*§\s*(\d+))?/u;
const ASCII = /(?:^|[^0-9A-Za-z])([MDCLXVImdclxvi]+)[\s._-]*b(?:ook)?[\s._-]*(\d+)[\s._-]*c(?:h(?:apter)?)?[\s._-]*(\d+)(?:[\s._-]*s(?:ec(?:tion)?)?[\s._-]*(\d+))?(?![0-9A-Za-z])/i;
const BLOCK = /\bblock[\s#:]*(\d{1,9})(?:\s*(?:§|s(?:ec(?:tion)?)?[\s.]*)(\d+))?/iu;
const TXID = /\b([0-9a-fA-F]{64})\b/;

// Tweet text -> { height, section } | { txid, section: null } | null.
// `section` is 1-based, as the book prints it.
export function parseCitation(text) {
  const t = String(text || '');

  for (const re of [SIGLA, ASCII]) {
    const m = t.match(re);
    if (m) {
      const volume = fromRoman(m[1]);
      const book = parseInt(m[2], 10);
      const chapter = parseInt(m[3], 10);
      const section = m[4] ? parseInt(m[4], 10) : 1;
      if (volume && book >= 1 && chapter >= 1 && section >= 1) {
        return { height: heightOf(volume, book, chapter), section };
      }
    }
  }

  const tx = t.match(TXID);
  if (tx) return { txid: tx[1].toLowerCase(), section: null };

  const blk = t.match(BLOCK);
  if (blk) {
    const height = parseInt(blk[1], 10);
    const section = blk[2] ? parseInt(blk[2], 10) : 1;
    if (section >= 1) return { height, section };
  }

  return null;
}
