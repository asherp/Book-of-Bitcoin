// SPDX-License-Identifier: MIT OR Apache-2.0
//
// btc-prose.js — compose a Bitcoin transaction's Glossia prose, field by
// field, in wire order: small structural integers (version, counts, an
// input's referenced output index and sequence, an output's value,
// locktime) are spliced in as literal numerals -- they're small fixed-width
// integers, not entropy, and routing them through the wordlist is exactly
// what produces long zero-byte word runs (a version of 1 is stored as
// 01 00 00 00; locktime is 0 in the overwhelming majority of transactions;
// output values sit nowhere near the 8-byte field's ceiling). Only the
// genuinely opaque bytes -- prevout txid, scriptSig, scriptPubKey, the
// witness stack -- are still Glossia-encoded.
//
// The timelock fields -- an input's sequence and the transaction's locktime --
// are rendered as a small symbol grammar rather than raw numerals; see the
// helpers below.
//
// Consumed by bitcoin-book.html, which renders each field into its manuscript
// margin layout.

import { encodeCanonical, bookLang } from './glossia-msg.js';
import { findTextRuns, splitReadableRuns, looksLikeWriting, readableUtf8Text, tokenizeScript, bitsToTargetHex, bitsToDifficulty, bitsToMantissaFactors, primeFactors } from './btc-tx.js';
import { splitOnSignature, poolOf } from './btc-pools.js';
import { volumeBookChapter } from './btc-citation.js';
import { plausibleBlockTime, utcMinute } from './btc-chaintime.js';
import { BIP39, HP_SPELLS } from './btc-wordlists.js';

const ROMAN = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
function toRoman(n) {
  let out = '';
  for (const [v, s] of ROMAN) while (n >= v) { out += s; n -= v; }
  return out || '0';
}

// The timelock fields get symbols rather than digit strings, on a small grammar
// that separates the whole transaction's status (nLockTime) from each input's
// (nSequence), sharing ■ (block) / Τ (temporal) for the block/time distinction.
// ■ is also the chapter sigil in references, so an absolute block-height lock is
// written as the chapter reference it names rather than a leading ■n:
//   Transaction (nLockTime):  □ none · v βb ■c absolute block (a chapter) · Τn absolute unix time
//   Input (nSequence):        ○ final · † replaceable (opt-in RBF) ·
//                             ■n relative block delay (a count of chapters) · Τn relative time delay
// The square reads as the whole document, the circle as one input. A coinbase's
// null prevout is flagged with isNullPrevout so the renderer can mark it (∅);
// other prevouts are carried as references and resolved to a citation
// downstream, not encoded here.
const LOCKTIME_THRESHOLD = 500000000;   // nLockTime below this is a block height, at/above a unix timestamp

// A relative time delay (n × 512 s) -> an exact physical duration: 512 s
// decomposes cleanly into d h m s (144 units = 73 728 s = 20h28m48s), so
// the physical form loses nothing against the wire value.
function durationFrom512s(n) {
  let s = n * 512;
  const parts = [];
  const d = Math.floor(s / 86400); if (d) parts.push(d + 'd'); s %= 86400;
  const h = Math.floor(s / 3600); if (h) parts.push(h + 'h'); s %= 3600;
  const m = Math.floor(s / 60); if (m) parts.push(m + 'm'); s %= 60;
  if (s || !parts.length) parts.push(s + 's');
  return parts.join('');
}

// nLockTime -> { mark, title }: □ (none), a chapter reference for an absolute
// block height (the block is a chapter, cited as volume book ■chapter rather than
// a bare height -- the chapter's own ■ block-mark carries the "block" sense the
// leading ■ used to, so no separate operator is needed), Τ + UTC date for an
// absolute time (rendered physically, the raw unix value in the hover).
function locktimeInfo(locktime) {
  if (locktime === 0) return { mark: '□', title: 'no locktime — final with respect to time' };
  if (locktime < LOCKTIME_THRESHOLD) {
    const { volume, book, chapter } = volumeBookChapter(locktime);
    return { mark: `${toRoman(volume)} β${book} ■${chapter}`, title: `locktime: not before block ${locktime} — volume ${volume}, book ${book}, chapter ${chapter}` };
  }
  const date = new Date(locktime * 1000).toISOString().slice(0, 16).replace('T', ' ');
  return { mark: `Τ${date}`, title: `locktime: not before ${date} UTC (unix ${locktime})` };
}

// nSequence -> { rbf, mark, kind, title }. BIP68 relative locktime is enabled
// when bit 31 is clear; bit 22 then selects time (512 s units) over blocks, with
// the value in the low 16 bits -- and since such a value is always < 0xfffffffe
// it ALSO signals opt-in RBF, so it's shown as two marks, † then the delay
// (e.g. "† ■144"). Otherwise: ● final (0xffffffff, disables the transaction
// locktime for this input), ○ non-replaceable but respecting the locktime
// (0xfffffffe), or a bare † replaceable (< 0xfffffffe, opt-in RBF).
function sequenceInfo(seq) {
  if ((seq & 0x80000000) === 0) {
    const n = seq & 0x0000ffff;
    // A relative block delay counts chapters, so it reads as a decimal count
    // (■144 = 144 blocks) -- chapters are numbered in decimal, only volumes in
    // Roman; a time delay is physical time, so it reads as an exact duration
    // (Τ20h28m48s), the wire units kept in the hover.
    return (seq & 0x00400000)
      ? { rbf: true, mark: `Τ${durationFrom512s(n)}`, kind: 'time', title: `replaceable; relative locktime ${durationFrom512s(n)} (${n} × 512 s) after the input's confirmation` }
      : { rbf: true, mark: `■${n}`, kind: 'block', title: `replaceable; relative locktime ${n} block${n === 1 ? '' : 's'} after the input's confirmation` };
  }
  if (seq === 0xffffffff) return { rbf: false, mark: '●', kind: 'final', title: 'final — disables the transaction locktime for this input' };
  if (seq === 0xfffffffe) return { rbf: false, mark: '○', kind: 'locktime', title: 'not replaceable, but respects the transaction locktime' };
  return { rbf: true, mark: '', kind: 'rbf', title: 'replaceable — signals opt-in RBF' };
}

// The sub- and superscript digits live with the sigla, where a page that wants
// the notation without the engine can reach them; toSuperscript is re-exported
// so importers of the composer still find it here.
export { toSuperscript };

// A factorization as the notation writes it: primes ascending, a centred dot
// between them, a power only where a prime repeats -- 2²⁰⁸·3·5·17·257,
// 2¹⁷²·3²·5·7·19². The dot is the mathematician's own multiplication sign and
// the quietest one available: it separates the factors without reading as an
// instruction the way × would, and × is already a Script opcode in this book.
// (The dot also groups the digits of a satoshi amount, but only ever inside a
// hover title -- no printed mark carries both senses.)
//
// One register, everywhere: primes on the line, powers raised above it. A
// product is the same object wherever the book states one, and the marks that
// carry values as subscripts (η's counter) drop the subscript rather than
// lower a whole factorization into it -- a product written small enough to
// ride a glyph is a product nobody can read.
const factorProse = (factors) => factors
  .map(([p, power]) => (power === 1 ? String(p) : `${p}${toSuperscript(power)}`))
  .join('·');

// ─── the mantissa, written as short as it goes ─────────────────────────
//
// A factorization is worth printing when it says something the figure does
// not, and costs the reader nothing. On a target's mantissa it often says
// less: 3·5·17·257 is ten characters where 65535 is five, and both are the
// same twenty-three bits of the wire word. So the mantissa is minimized
// before it is printed, by a rule that decides each part on its own length.
//
//   1. Factor it.
//   2. Every term goes to whichever is shorter, its power or its decimal --
//      the decimal on a tie, since a figure a reader can read at sight beats
//      one they have to raise to a power. 2⁵ and 32 are both two characters,
//      so 32; 2¹⁰ is three against 1024's four, so 2¹⁰ stands.
//   3. Then adjacent terms merge, left to right, wherever the product writes
//      in no more characters than the pair did. Repeat until nothing more
//      merges.
//
// A decimal product is never longer than its factors' decimals, so this
// collapses most mantissas to the plain figure -- which is the honest result:
// for a number of six or seven digits the factorization was never buying the
// reader anything. What survives it is a term whose power genuinely earns its
// place, and the whole factorization stays in the hover for the reader who
// wants it (genesis' 65535 is 2¹⁶−1, and its primes are the Fermat ones --
// worth knowing, and not worth five extra characters on every chapter head).
//
// Only the mantissa is written this way. A nonce and a counter keep their full
// factorization: there the shapelessness of the product IS the reading -- a
// place in the search, arrived at by counting -- and shortening it to a figure
// would take that away.
const termProse = (p, power) => {
  const decimal = String(p ** BigInt(power));
  if (power === 1) return decimal;
  const raised = `${p}${toSuperscript(power)}`;
  return [...raised].length >= [...decimal].length ? decimal : raised;
};

export function mantissaProse(factors) {
  const terms = factors.map(([p, power]) => ({ value: p ** BigInt(power), text: termProse(p, power) }));
  for (let merging = true; merging && terms.length > 1;) {
    merging = false;
    for (let i = 0; i + 1 < terms.length; i++) {
      const value = terms[i].value * terms[i + 1].value;
      const text = String(value);
      if ([...text].length <= [...terms[i].text].length + [...terms[i + 1].text].length) {
        terms.splice(i, 2, { value, text });
        merging = true;                 // a merged term may merge again
        break;
      }
    }
  }
  return terms.map((t) => t.text).join('·');
}

// Any number the book states as a product: its factorization, or the figure
// itself where there is no factorization to write. 0 and 1 are the whole of
// that exception -- neither is a product of primes, and an early miner's
// first extranonce is exactly η1. A prime stands alone, no dot and no power:
// a nonce of 2147483647 is written η2147483647, which is the truth about it.
const productProse = (value) => factorProse(primeFactors(value)) || String(value);

// nBits (a compact difficulty target) -> { sym, expr, title }. The target is
// rendered as the thing it is -- the ceiling a mined hash must dip under --
// in two faces that together account for all 256 of its bits. β's subscript
// is the demand in its physical unit: the number of leading zero BITS a
// valid hash must open with (genesis, difficulty 1, is β₃₂; each +1 is a
// doubling of the work). `expr` is the target written exactly, in the two
// parts the wire word is actually made of: the mantissa, factored into primes,
// times the whole-byte shift it rides on -- 3·5·17·257×256²⁶ for genesis.
//
// The pair rather than one product, because nBits IS a pair. A retargeting
// node computes a mantissa and a byte count and writes both; 256ᵉ is the
// second of them and reads as itself, a scale in the units the header keeps
// it in. Folded together the target factors to 2²⁰⁸·3·5·17·257, which is the
// same number and a worse reading of it: nothing in that says 208 is 26 bytes
// of shift while the odd part is the 65535 the wire word carries.
//
// What factoring the mantissa buys is the part a retarget can actually move.
// A window's work is chosen from those twenty-odd bits and nothing else, and
// genesis says it plainest: 65535 is 2¹⁶−1, so it is 3·5·17·257, the Fermat
// primes.
//
// The subscript states the target's leading zero run, the expression the
// number in full; leading zeros stay on β because they are not legible from a
// product at a glance (they are 256 − bitlen). Nothing of the wire word is
// lost in the reading: mantissa and shift are what nBits packs, and the
// expression states both -- with the compact nBits, the full 256-bit target
// and the difficulty ratio in the hover title besides. A target looser than the genesis baseline (never on
// mainnet) falls back to the raw compact hex, with no expression.
// Exported because a book leaf renders targets that are not its own block's:
// a book from Volume II on straddles a retarget and states both of them, and
// the second comes from the retarget block's nBits alone, with no header of
// its own parsed. composeBlockHeaderFields below is the header-shaped caller.
export function bitsInfo(bits) {
  const targetHex = bitsToTargetHex(bits);
  const difficulty = bitsToDifficulty(bits);
  const diffStr = difficulty.toLocaleString(undefined, { maximumFractionDigits: difficulty < 1000 ? 2 : 0 });
  const compact = bits.toString(16).padStart(8, '0');
  const zeros = targetHex.length - targetHex.replace(/^0+/, '').length;
  const tail = `difficulty ${diffStr} (relative to the genesis block)`;
  if (zeros < 8) return { sym: compact, expr: '', title: `nBits ${compact} — a valid block hash must read below ${targetHex} — ${tail}` };
  // Zero bits inside the first significant hex digit: 1 -> 3, 2-3 -> 2, 4-7 -> 1, 8-f -> 0.
  const first = parseInt(targetHex[zeros], 16);
  const lz = zeros * 4 + (first >= 8 ? 0 : first >= 4 ? 1 : first >= 2 ? 2 : 3);
  const exponent = bits >>> 24;
  const mantissa = bits & 0x007fffff;   // top mantissa bit is a sign flag, masked off
  const { factors, shift } = bitsToMantissaFactors(bits);
  const written = mantissaProse(factors);
  const expr = shift > 0 ? `${written}×256${toSuperscript(shift)}` : written;
  return {
    sym: `β${toSubscript(lz)}`, expr,
    title: `nBits ${compact} — mantissa ${mantissa}${factorProse(factors) === String(mantissa) ? '' : ` (${factorProse(factors)})`} shifted up ${exponent - 3} bytes: the target ${targetHex}, which a valid block hash must read below (${lz} leading zero bits) — ${tail}`,
  };
}

// ─── block version notation: <hp> <english> <signals> ──────────────────
//
// A block's nVersion splits, under BIP9, into three fields: a 3-bit marker
// (001), 16 bits of version-rolling scratch entropy (BIP320, bits 28-13,
// spun by ASICs for extra nonce space), and 13 soft-fork signaling bits
// (bits 12-0). The notation renders each field as the thing it is:
//
//   accio library 100
//   └────┬─────┘ └┬┘
//   rolling bits  signaling bits, plain binary (leading zeros dropped,
//   as two words  omitted when zero) -- bit 0 CSV, 1 SegWit, 2 Taproot
//
// The word pair carries the 16 rolling bits plus a parity checksum: the pair
// spans 6 + 11 = 17 bits, one more than the field, and the spare bit is even
// parity over the rolling bits -- so any single-bit transcription error is
// caught, and a random wrong word is caught half the time. English is the
// high digit, the HP spell the low digit (C = en·64 + hp, parity in bit 16),
// but the spell is written first -- the two lists are disjoint, so each word
// identifies its own list and the display order is free. The pair is always
// present in marker form, so BIP9 form needs no prefix at all -- it opens
// with a word -- while a pre-BIP9 integer version keeps the traditional v
// prefix (v1 .. v4). accio abandon -- both index 0, parity 0 -- is the
// idiom for "no version rolling".
const SIGNAL_BIT_NAMES = { 0: 'CSV (BIP68/112/113)', 1: 'SegWit (BIP141)', 2: 'Taproot (BIP341)' };
const popcount16 = (x) => x.toString(2).split('1').length - 1;

export function formatBlockVersion(version) {
  const v = version >>> 0;
  const hex = '0x' + v.toString(16).padStart(8, '0');
  if ((v >>> 29) !== 0b001) {
    // Signed for display: nVersion is an int32 on the wire, and the early
    // versions (1-4) read as themselves.
    return { text: `v${v | 0}`, title: `block version ${v | 0} (${hex}) — pre-BIP9 integer form` };
  }
  const R = (v >>> 13) & 0xffff;                      // BIP320 version-rolling bits
  const S = v & 0x1fff;                               // BIP9 signaling bits
  const C = ((popcount16(R) & 1) << 16) | R;          // 17-bit codeword: parity | rolling
  const pair = `${HP_SPELLS[C & 63]} ${BIP39[C >>> 6]}`;
  const rolling = R
    ? `version-rolling bits 0x${R.toString(16).padStart(4, '0')} (BIP320 scratch entropy) as ${pair}`
    : `${pair} — no version rolling`;
  const signals = S
    ? 'signaling ' + [...Array(13).keys()].filter((b) => S & (1 << b))
        .map((b) => `bit ${b}${SIGNAL_BIT_NAMES[b] ? ' — ' + SIGNAL_BIT_NAMES[b] : ''}`).join(', ')
    : 'no soft-fork signals';
  return {
    text: `${pair}${S ? ' ' + S.toString(2) : ''}`,
    title: `block version ${hex} — BIP9 version-bits form; ${rolling}; ${signals}`,
  };
}

// The inverse: notation text back to the nVersion integer, or null if the
// text is not a well-formed version (unknown word, failed parity, oversized
// signaling run). Word order in the pair is not significant on input -- list
// membership disambiguates -- only the rendering above fixes spell-first.
let WORD_INDEX = null;   // lazily built word -> { list, index } map
export function parseBlockVersion(text) {
  const t = String(text).trim();
  const legacy = t.match(/^v(-?\d+)$/i);
  if (legacy) {
    const n = parseInt(legacy[1], 10) | 0;
    return ((n >>> 29) & 0b111) === 0b001 ? null : n >>> 0;   // marker form never renders as an integer
  }
  // Fields separate on spaces (as rendered) -- dots accepted on input for
  // the older notation.
  const parts = t.split(/[.\s]+/);
  if (!WORD_INDEX) {
    WORD_INDEX = new Map();
    BIP39.forEach((w, i) => WORD_INDEX.set(w, { en: i }));
    HP_SPELLS.forEach((w, i) => WORD_INDEX.set(w, { hp: i }));
  }
  const a = WORD_INDEX.get(parts[0]), b = WORD_INDEX.get(parts[1]);
  if (!a || !b) return null;
  const en = a.en ?? b.en, hp = a.hp ?? b.hp;
  if (en === undefined || hp === undefined) return null;      // two words from the same list
  const C = en * 64 + hp;
  if ((C >>> 16) !== (popcount16(C & 0xffff) & 1)) return null;   // parity checksum
  let S = 0;
  if (parts.length === 3) {
    if (!/^[01]{1,13}$/.test(parts[2])) return null;
    S = parseInt(parts[2], 2);
  } else if (parts.length !== 2) return null;
  return ((0b001 << 29) | ((C & 0xffff) << 13) | S) >>> 0;
}

// A block header's nTime -> { mark, title }: the mark is the human date --
// the interpreted, legible form -- since unlike nonce there's nothing more
// "raw" a reader would want at a glance; the title carries the literal unix
// value for verification against the wire bytes.
export function timestampInfo(timestamp) {
  const date = new Date(timestamp * 1000).toISOString().slice(0, 16).replace('T', ' ');
  return { mark: `${date} UTC`, title: `unix ${timestamp}` };
}

// A parsed block header (btc-tx.js's parseBlockHeader) -> its rendered
// fields. timestamp, bits and nonce are small structural numbers -- never
// entropy -- so they're rendered literally/decoded rather than
// Glossia-encoded, mirroring how composeTransactionFields treats a
// transaction's version and locktime. The block version is the one field
// that mixes entropy with structure, so it gets the ver notation above. The
// nonce is decoded no further than the target beside it: both are written as
// the primes they are made of, which is the number itself and not a reading
// of it. Set against the target's colossal power of two, the nonce's two or
// three arbitrary primes are the plainest statement the page can make that a
// nonce carries no structure at all -- it is a number a miner arrived at by
// counting, and it factors like one.
// The previous-block hash and merkle root are genuinely opaque 32-byte hashes --
// callers Glossia-encode those themselves (as bitcoin-book.html already does
// for the block/txid hashes), not here.
export function composeBlockHeaderFields(header) {
  const time = timestampInfo(header.timestamp);
  const bits = bitsInfo(header.bits);
  const ver = formatBlockVersion(header.version);
  return {
    // The renderer prefixes the bold-gold v mark itself (both the integer and
    // BIP9 word-pair forms wear it), so the text here carries no prefix.
    version: ver.text.replace(/^v/, ''), versionTitle: ver.title,
    timestamp: time.mark, timestampTitle: time.title,
    bits: bits.sym, bitsExpr: bits.expr, bitsTitle: bits.title,
    // The renderer leads the nonce with the bold-gold η mark (like v for the
    // version), the product itself unstyled. Its decimal stays in the title,
    // where the target's compact nBits is: the figure a miner would recognise
    // is never further away than the hover.
    nonce: productProse(header.nonce),
    nonceTitle: `nonce ${header.nonce} — the value the miner incremented while searching for a hash below the difficulty target`,
  };
}

// A decimal integer string with a middle-dot every three digits (an output
// amount, in satoshis): "407621551" -> "407·621·551". Operates on the string to
// avoid any precision loss on large values.
export function groupDigits(s) {
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, '·');
}

// A satoshi amount -> its value in bitcoin, with the ₿ sign trailing the figure
// and exact to the satoshi. English number formatting: the whole-bitcoin part is
// comma-grouped, and the fraction is always the full eight decimal places, so a
// right-aligned column of amounts aligns on the point. 50 BTC reads 50.00000000 ₿,
// a lone satoshi 0.00000001 ₿. An exactly-zero amount (e.g. an OP_RETURN data
// carrier) reads as a bare 0 ₿ rather than a row of zeros. BigInt keeps large sat
// counts exact.
export function formatBtc(sats) {
  const s = BigInt(sats);
  if (s === 0n) return '0 ₿';
  const whole = (s / 100000000n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const frac = (s % 100000000n).toString().padStart(8, '0');
  return `${whole}.${frac} ₿`;
}

// ─── amount notation ───────────────────────────────────────────────────
// How the reader prints an amount is a choice, like the prose language:
//   'btc'   1.23456789 ₿      bitcoin, the ₿ sign trailing (formatBtc above)
//   'sats'  123·456·789 sats  satoshis, the book's middle-dot grouping
//   'raw'   123456789         the bare satoshi integer — no marker, no separator
//   'usd'   ≈ 123,456.79 USD  the day's market price, per a source the reader chose
//   'own'   ≈ 123,456.79 USD  the reader's own unit, at a rate the reader set
// The first three are renderings of the record: one integer, dressed three
// ways, each recoverable from the others. The last two are not, and the
// record offers no help drawing the line — the chain knows no dollars, and
// strictly no bitcoins either: the field is an integer, ₿'s decimal point a
// convention, and even "one sat is one sat" is a reading (freshly minted
// coins have traded at a premium, ordinal sats at a fancy). So the book
// supplies no rate of its own. 'usd' asks a market's record, from a source
// the reader selected (btc-price.js), at the day of the block being read —
// the page sets that rate here (setDayPrice) before it prints, and where the
// source's record has nothing the figure falls back to the record's ₿.
// 'own' is a unit the reader names and prices themself. Either way the
// figure wears ≈, and the hover keeps the on-chain amount and the rate's
// author — a market's valuation or the reader's, never the book's.
// Each choice persists in localStorage under its own key and is read at
// format time, so a page re-render is all a switch needs. 'btc' is the
// default and is stored as an absent key, so a reader who never chose
// reads the book as it has always been set.
const AMOUNT_UNIT_KEY = 'glossia-btc-amount-unit';
const OWN_UNIT_KEY = 'glossia-btc-own-unit';

// The reader's own unit, where one is set: { label, perBtc } — the unit's
// name as the reader spelled it, and their price of one ₿ in it. Null until
// the reader defines one, and null again on anything malformed, so callers
// can trust what they get.
export function ownUnit() {
  try {
    const o = JSON.parse(localStorage.getItem(OWN_UNIT_KEY));
    if (o && typeof o.label === 'string' && o.label.trim()
        && Number.isFinite(o.perBtc) && o.perBtc > 0) {
      return { label: o.label.trim(), perBtc: o.perBtc };
    }
  } catch { /* unset, malformed, or storage unavailable */ }
  return null;
}
export function setOwnUnit(u) {
  try {
    if (u) localStorage.setItem(OWN_UNIT_KEY, JSON.stringify({ label: u.label, perBtc: u.perBtc }));
    else localStorage.removeItem(OWN_UNIT_KEY);
  } catch { /* storage unavailable: the unit just doesn't persist */ }
}

export function amountUnit() {
  try {
    const v = localStorage.getItem(AMOUNT_UNIT_KEY);
    if (v === 'own') return ownUnit() ? 'own' : 'btc';
    return v === 'sats' || v === 'raw' || v === 'usd' ? v : 'btc';
  } catch { return 'btc'; }
}
export function setAmountUnit(u) {
  try {
    if (u === 'sats' || u === 'raw' || u === 'usd' || u === 'own') localStorage.setItem(AMOUNT_UNIT_KEY, u);
    else localStorage.removeItem(AMOUNT_UNIT_KEY);
  } catch { /* storage unavailable: the choice just doesn't persist */ }
}

// The day's price for the page in hand: { perBtc, date, source, href } from
// btc-price.js's usdOn, or null where no source answered. The page sets it
// for the block being read before printing and clears it after; holding it
// here keeps formatAmount a one-argument call at every site while the rate
// stays one page-wide fact with one owner. Null prints as ₿ — the record —
// never as a stale or guessed figure.
let DAY_PRICE = null;
export function setDayPrice(p) { DAY_PRICE = p; }
export function dayPrice() { return DAY_PRICE; }

// A satoshi amount in the reader's own unit. ≈ because the figure is rounded,
// and more to the point because it is a valuation. Two decimals in the money
// manner, stretched only as far as keeps a small amount from rounding to
// nothing — a dust output should never print as ≈ 0.00. Zero alone drops the
// ≈: nothing is exact at any rate. Number arithmetic is fine here — the
// record stays exact in the hover; this figure is a reading, read at rate
// precision.
export function formatOwnAmount(sats, { label, perBtc }) {
  const v = Number(sats) * perBtc / 1e8;
  if (v === 0) return `0 ${label}`;
  const digits = v < 0.01 ? Math.min(10, 1 - Math.floor(Math.log10(v))) : 2;
  const figure = v.toLocaleString('en-US', { minimumFractionDigits: Math.min(digits, 2), maximumFractionDigits: digits });
  return `≈ ${figure} ${label}`;
}

// A satoshi amount in a named notation — the settings rows print one sample
// amount in each, so the choice shows itself. 'usd' with no day price and
// 'own' without a stored unit both fall back to the record's ₿, like
// everything else unrecognised.
export function formatAmountAs(sats, unit) {
  if (unit === 'sats') return `${groupDigits(BigInt(sats).toString())} sats`;
  if (unit === 'raw') return BigInt(sats).toString();
  if (unit === 'usd' && DAY_PRICE) return formatOwnAmount(sats, { label: 'USD', perBtc: DAY_PRICE.perBtc });
  if (unit === 'own') {
    const o = ownUnit();
    if (o) return formatOwnAmount(sats, o);
  }
  return formatBtc(sats);
}
// …and in the notation currently chosen: the one call every amount the
// reader page prints goes through.
export const formatAmount = (sats) => formatAmountAs(sats, amountUnit());

// Quoted script text comes directly from raw blockchain data -- a miner's
// coinbase tag, an OP_RETURN message -- not our own wordlist, so unlike the
// Glossia-generated prose it's untrusted content and must be escaped before
// it's spliced into a string callers render via innerHTML.
function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// A decoded text run, escaped for HTML with its whitespace rendered: a CR, LF or
// CRLF each become a <br>, and a tab becomes a fixed-width gap, so a multi-line
// or column-aligned embedded message keeps its shape instead of collapsing to a
// single line of single spaces. Escapes first, so the only tags are the ones
// added here.
const quoteText = (s) => escapeHtml(s)
  .replace(/\r\n?|\n/g, '<br>')
  .replace(/\t/g, '<span class="tab"></span>');

// ─── script → opcode notation ──────────────────────────────────────────
//
// A scriptSig / scriptPubKey is rendered as its sequence of opcodes and data
// pushes. An opcode we've given a Glossia glyph renders as that glyph; every
// other opcode falls back to Bitcoin Core's OP_* name. Data pushes stay
// Glossia prose (or, for an OP_RETURN payload, inline-quoted when they're
// legible ASCII) -- exactly what carried the whole script before opcodes had
// their own marks.

import { OPCODE_SYMBOLS, OPCODE_NAMES, toSuperscript, toSubscript } from './btc-sigla.js';

// One opcode -> its HTML: the glyph (accent-styled, canonical OP_* name as
// its hover title), or the bare OP_* name for a byte with no glyph. The
// glyph is escaped -- a few marks (< > ≤-family) are HTML-significant.
function opToken(code) {
  const sym = OPCODE_SYMBOLS[code];
  const name = OPCODE_NAMES[code] || 'OP_UNKNOWN';
  if (sym) return `<span class="op" title="${name}">${escapeHtml(sym)}</span>`;
  return `<span class="op-name">${name}</span>`;
}

// A push opcode's mark. A direct push (OP_PUSHBYTES_n) is the quietest
// instruction in the set, so its mark is the quietest possible: the bare
// superscript byte count, ⁿ. (Superscripts count bytes; subscripts index an
// opcode family's variants -- ⧉₂, °₄, β₀.) The arrows are reserved for
// OP_PUSHDATA1/2/4, whose length rides in a separate prefix -- arrow weight
// matching prefix width: ↧ⁿ (1-byte), ⇊ⁿ (2-byte), ⤋ⁿ (4-byte). The pushed data itself
// follows the mark, as prose or an inline quote. (The coinbase preamble's
// βₙ 2ᵏ·p… and ηn marks fold their push opcode in -- what the mark writes
// out determines the exact bytes, the push width included.)
const PUSH_GLYPHS = { 0: '', 1: '↧', 2: '⇊', 4: '⤋' };
function pushToken(form, byteLen) {
  const title = form
    ? `OP_PUSHDATA${form} — push ${byteLen} bytes, the length in a ${form}-byte prefix`
    : `OP_PUSHBYTES_${byteLen} — push the next ${byteLen} bytes`;
  // A direct push carries no glyph: its mark IS the byte count, a superscript
  // numeral saying how much of the prose after it the push holds -- data
  // annotation rather than an operation. Marked op-count so it reads at the
  // prose's own size (see bitcoin-book.html), which also keeps the count
  // riding a data mark (p⁶⁵, h³²) matched to the letter it follows. The
  // PUSHDATA arrows are opcode marks, and keep their count with them.
  const glyph = PUSH_GLYPHS[form] || '';
  return `<span class="op op-push${glyph ? '' : ' op-count'}" title="${title}">${glyph}${toSuperscript(byteLen)}</span>`;
}

// ─── DER signature compaction ──────────────────────────────────────────
//
// A legacy / segwit-v0 ECDSA signature push is a DER envelope -- SEQUENCE and
// INTEGER tags, length bytes, canonical leading-zero padding -- wrapped around
// two 32-byte scalars, plus a trailing sighash byte. Only r, s and the sighash
// carry information; the ~7 envelope bytes are pure framing. derToCompact
// strips it to a fixed 65-byte r‖s‖sighash -- but ONLY when re-encoding those
// scalars reproduces the input byte-for-byte. That guard leaves every
// non-canonical signature (pre-BIP66 blocks) and every non-signature push
// untouched, so the compact form is always a faithful stand-in.

const SIGHASH_TYPES = new Set([0x01, 0x02, 0x03, 0x81, 0x82, 0x83]);
const byteAt = (hex, i) => parseInt(hex.substr(i * 2, 2), 16);

// Strip leading 0x00 bytes from a hex value, keeping at least one byte.
function stripLeadZeros(h) {
  let i = 0;
  while (i + 2 < h.length && h.substr(i, 2) === '00') i += 2;
  return h.slice(i);
}
// The canonical DER INTEGER *content* for a big-endian value: minimal length,
// with a single 0x00 prepended when the top bit would otherwise read negative.
function derInt(valHex) {
  const v = stripLeadZeros(valHex);
  return (byteAt(v, 0) & 0x80) ? '00' + v : v;
}
const lenByte = (h) => (h.length / 2).toString(16).padStart(2, '0');

// A signature push (DER sig + sighash byte) -> 65-byte r‖s‖sighash, or null when
// the bytes are not a strictly-canonical signature (so the caller keeps them).
function derToCompact(hex) {
  const n = hex.length / 2;
  if (n < 9 || n > 73 || byteAt(hex, 0) !== 0x30) return null;         // SEQUENCE
  if (2 + byteAt(hex, 1) + 1 !== n) return null;                       // header + body + sighash
  if (byteAt(hex, 2) !== 0x02) return null;                           // INTEGER r
  const rLen = byteAt(hex, 3);
  if (rLen < 1 || 6 + rLen > n || byteAt(hex, 4 + rLen) !== 0x02) return null;   // INTEGER s
  const sLen = byteAt(hex, 5 + rLen);
  if (sLen < 1 || 7 + rLen + sLen !== n) return null;
  const sighash = hex.substr((n - 1) * 2, 2);
  if (!SIGHASH_TYPES.has(parseInt(sighash, 16))) return null;
  const rVal = stripLeadZeros(hex.substr(8, rLen * 2));
  const sVal = stripLeadZeros(hex.substr((6 + rLen) * 2, sLen * 2));
  if (rVal.length > 64 || sVal.length > 64) return null;              // a scalar wider than 32 bytes
  const r32 = rVal.padStart(64, '0'), s32 = sVal.padStart(64, '0');
  // Re-encode the scalars as canonical DER and require an exact match -- the
  // fidelity guard that rejects non-canonical framing.
  const body = '02' + lenByte(derInt(r32)) + derInt(r32) + '02' + lenByte(derInt(s32)) + derInt(s32);
  const rebuilt = '30' + lenByte(body) + body + sighash;
  return rebuilt.toLowerCase() === hex.toLowerCase() ? r32 + s32 + sighash : null;
}

// A script (hex) -> its opcode-notation display string. `collect` encodes a
// ─── the early coinbase mining preamble ────────────────────────────────
//
// For the chain's first years, a coinbase scriptSig opened not with
// arbitrary tag data but with a small mining preamble: a 4-byte push
// restating the block's compact difficulty target (the header's nBits,
// byte for byte), then a small-integer push -- the extranonce, the counter
// a miner rolled once the header's 32-bit nonce was exhausted. Both are
// numbers, not entropy, so they render as decoded marks (βₙ 2ᵏ·p…, ηn)
// rather than payload words -- which also lets embedded text (the genesis
// headline) stand as the coinbase's first words instead of trailing runs
// of bytes-as-prose.
//
// The target takes the frontispiece's full notation, mark and expression
// both, not β alone: β's subscript is a leading-zero-BIT count, and many
// distinct nBits share one count, so the mark by itself names the demand
// without fixing the bytes that stated it. The product is the target's exact
// value, whose compact form is the pushed word, so the pair reconstructs the
// push -- the same standard every other mark in the notation holds to. (The
// literal 4 bytes are in the mark's title either way, as they are on the
// chapter head.)

const reverseHexStr = (hex) => (hex.match(/../g) || []).reverse().join('');

// A 4-byte push -> its u32le value, when that value is a plausible compact
// difficulty target: a byte-length exponent in the range real targets
// occupy, and a positive nonzero mantissa. The exponent is the push's LAST
// byte, so printable-ASCII tag data (every byte ≥ 0x20) can never match;
// nor can a BIP34 height push, whose most-significant byte is far below
// 0x03 for any realistic height. Fixed-width, so the mark reconstructs the
// wire bytes exactly.
function compactBitsFromPush(push) {
  if (push.length !== 8) return null;
  const bits = parseInt(reverseHexStr(push), 16);
  const exponent = bits >>> 24, mantissa = bits & 0x00ffffff;
  if (exponent < 0x03 || exponent > 0x20 || mantissa === 0 || (mantissa & 0x800000) !== 0) return null;
  return bits;
}

// An extranonce push -> its decimal string: up to 8 little-endian bytes,
// minimally encoded (no most-significant zero byte), so the number alone
// reconstructs the exact bytes. A non-minimal encoding falls back to prose
// rather than risk a lossy round trip.
function extranonceFromPush(push) {
  if (push.length < 2 || push.length > 16 || push.slice(-2) === '00') return null;
  return BigInt('0x' + reverseHexStr(push)).toString();
}

// A decoded mark: a glyph carrying an explanatory title. Any quantity the mark
// summarizes (β's leading-zero count, η's nonce/extranonce) rides the glyph as a
// subscript, baked in by the caller, so the mark reads as one unit.
const markToken = (glyph, title) => `<span class="op" title="${title}">${glyph}</span>`;

// ─── the BIP34 height, and the miner's margin after it ─────────────────
//
// From BIP34 on, a coinbase scriptSig opens with a push of the block's own
// height, minimally encoded -- the block stating its place, which is what
// made every coinbase txid distinct and retired BIP30's duplicate check.
// That push is the ONLY part of a coinbase scriptSig any rule constrains.
// Everything after it is the miner's own margin: a pool tag, an extranonce,
// a merged-mining commitment, arbitrary bytes in no format at all.
//
// So the height push is where the book stops parsing. Past it there are no
// opcodes to find -- a coinbase scriptSig is never executed, and reading it
// as script invents structure that isn't there. The evidence is on the page:
// a pool writing "| MARA…" puts 0x7c and 0x20 on the chain, and a script
// tokenizer reads them as OP_SWAP and a 32-byte push, swallowing the tag
// behind an instruction nobody wrote. isCleanScript cannot tell a script
// from bytes that merely tokenize without complaint; BIP34 can, because it
// is a rule rather than a guess.
//
// The height is written raw, not as a chapter: ■ counts chapters everywhere
// else in the book, but here the mark reports a number the miner actually
// wrote into the bytes, and the chain's own units are what it wrote.

const BIP34_HEIGHT = 227931;         // BIP34's 95% activation -- Bitcoin Core's BIP34Height
const BIP34_MAX_3BYTE = 0x7fffff;    // 8,388,607: the last height a 3-byte CScriptNum holds

// A coinbase scriptSig -> { height, restHex } when it opens with a BIP34
// height push, else null.
//
// Deliberately narrow: a DIRECT push of exactly 3 bytes, decoding to a height
// at or past activation. That window (227,931 – 8,388,607) is every block from
// the day the rule bound until roughly the year 2168, and its edges do the
// verifying that a caller-supplied height otherwise would. Three bytes can't
// collide with the pre-BIP34 preamble's 4-byte nBits push -- which is why the
// window is not widened to the 4-byte heights a distant future will need, since
// those decode into exactly the range real nBits values occupy. The range also
// forces minimality on its own: at or above 0x010000 the top byte is nonzero,
// at or below 0x7fffff it never sets the sign bit, so no shorter or unpadded
// encoding of the same number exists and the decimal reconstructs the bytes.
export function bip34HeightPush(hex) {
  if (hex.slice(0, 2) !== '03') return null;                  // OP_PUSHBYTES_3
  const push = hex.slice(2, 8);
  if (push.length !== 6) return null;
  const height = parseInt(reverseHexStr(push), 16);
  if (height < BIP34_HEIGHT || height > BIP34_MAX_3BYTE) return null;
  return { height, restHex: hex.slice(8) };
}

// ─── the clock some pools write next, and the counters after it ────────
//
// The slot behind the height does not hold one field. Under Stratum a pool
// sends its coinbase in two halves and the miner fills the gap between them
// (coinb1 ‖ extranonce1 ‖ extranonce2 ‖ coinb2), and where a pool leaves that
// gap is house style, not rule. Two customs share the chain:
//
//   gap second   the counters land directly behind the height, and the pool's
//                writing comes after them (ckpool, and the solo miners and
//                small pools built on it)
//   gap fourth   the pool writes the moment it assembled the template, then
//                its tag, then leaves the gap (btccom's server, which pushes
//                CScriptNum(time(nullptr)) as the second field, and the pools
//                descended from it)
//
// So a number in that slot is a clock about as often as it is a counter, and
// the book called all of them counters until block 960,281's ostensible
// extranonce 1,785,429,755 was read as what it is: 2026-07-30 16:42 UTC, the
// day the block itself was mined. See tools/coinbase-formats.md.
//
// Nothing in the bytes distinguishes the two. What distinguishes them is the
// height already standing beside them: a clock agrees with it, a counter has
// no reason to (see btc-chaintime.js, and PLAUSIBLE_WINDOW for what agreement
// is worth here). The evidence and the claim are then in the same hundred
// bytes, which is the standard every other mark on the page is held to.

// The template timestamp -> its value, and what's left. A direct push of four
// bytes, or of five where CScriptNum's sign padding will widen it after 2038,
// whose value dates to the block's own era.
export function templateTimePush(hex, height) {
  const op = parseInt(hex.slice(0, 2), 16);
  if (op !== 4 && op !== 5) return null;
  const end = 2 + op * 2;
  if (hex.length < end) return null;
  const push = hex.slice(2, end);
  if (op === 5 && push.slice(8) !== '00') return null;      // five bytes only to clear the sign bit
  const unix = parseInt(reverseHexStr(push.slice(0, 8)), 16);
  if (!plausibleBlockTime(unix, height)) return null;
  return { unix, hex: hex.slice(0, end), restHex: hex.slice(end) };
}

// The timestamp mark: the UTC date and minute, as the chapter head prints the
// block's own nTime. No glyph of its own -- Τ is the timelock grammar's, and
// this constrains nothing; it is a miner's clock reading, the same kind of
// thing the header states, so it reads the same way and a reader can set the
// two side by side.
// Marked op-tpltime so the notation key can find it: the mark is a date, which
// is different in every block that carries one, so no literal in the key could
// name it (see collectMarks in btc-key-filter.js).
const templateTimeMark = (unix) => `<span class="op op-tpltime" title="the moment this block's template was assembled, as the pool's software wrote it into the coinbase (unix ${unix}) — a clock reading, not a counter: the pools built on btccom's server push it directly behind the height. It is here because it agrees with the height beside it; nothing in the bytes declares it">${utcMinute(unix)}</span>`;

// The counters that follow -> their decimals, and what's left.
//
// Where the gap is second the counter sits right behind the height, exactly
// where the pre-BIP34 preamble's η sat: same field, same mark, one rule later
// -- the search space beyond the header's 32-bit nonce, which the miner rolls
// when that one is exhausted.
//
// Reading it as the number it is matters twice over. It is a tally, so a
// tally is what it should say. And a counter is entropy: at any moment ~37%
// of its bytes are printable ASCII by pure chance, so left in the margin its
// tail leans against whatever the miner wrote next and joins the quotation --
// three characters one block, none the next, as the counter rolls. Taking it
// under η removes that, not by guessing where a tag begins, but by consuming
// the bytes that were never text before anything looks for text in them.
//
// Bounded by extranonceFromPush's own ceiling: a direct push of 1-8 bytes,
// minimally encoded, so the decimal reconstructs the bytes exactly. A pool tag
// can't be caught by it -- a tag opens with a printable byte (0x2f '/', 0x4d
// 'M'), which reads as a push far longer than eight and fails the test.
const EXTRANONCE_MAX_BYTES = 8;
export function peelExtranonces(hex) {
  const values = [];
  let rest = hex;
  for (;;) {
    const op = parseInt(rest.slice(0, 2), 16);
    if (!(op >= 1 && op <= EXTRANONCE_MAX_BYTES)) break;
    const end = 2 + op * 2;
    if (rest.length < end) break;
    const n = extranonceFromPush(rest.slice(2, end));
    if (n === null) break;
    values.push(n);
    rest = rest.slice(end);
  }
  return { values, restHex: rest };
}

// The height mark: ■ with the raw height, carrying the push's whole meaning.
// Marked op-blockmark to name the span for what it is -- and this is the one
// mark that WANTS the drop cap. ::first-letter takes the ■ and leaves the
// height whole and at one size, so the block's own sigil is illuminated on the
// block's own first page, with the number it states reading straight on from
// it. (A bare push count can't do that: its cap would eat a digit and leave
// the rest of the numeral behind. See bitcoin-book.html's addLine.)
const blockHeightMark = (height) => `<span class="op op-blockmark" title="BIP34 — the block writes its own height, ${groupDigits(String(height))}, into the coinbase: the push that makes every coinbase distinct. Everything after it is the miner's own margin, under no rule">■${height}</span>`;

// The miner's margin -> its display: readable runs quoted, everything between
// them as Glossia prose. No opcodes, no push counts -- there are no pushes --
// and no gaps: splitReadableRuns accounts for every byte, so what the tail
// renders is what the tail holds. A pool tag reads as the sentence the pool
// wrote, pipes and spaces included, instead of arriving pre-cut by a tokenizer
// that mistook its punctuation for instructions.
// The extranonce mark: η and its value, in both eras. One field gets one form
// -- an early block's η2² and a modern eight-byte counter are the same counter
// under the same rule, and a mark that changed shape with the size of its
// number would be two marks wearing one glyph. Both call sites come here so
// they cannot drift apart again.
//
// The value is a product, as the header's own nonce is, and written the same
// way: primes on the line, powers raised. It rode as a subscript while it was
// a single figure; a factorization is too much to lower, and the counter is
// better served reading at the size of the numbers it is made of than sitting
// small beside its glyph. The decimal keeps the title, which is where a
// counter is legible as a count.
//
// What this mark must NOT wear is a clock. It said "counter" over block
// 960,281's template timestamp for as long as the timestamp went unrecognized,
// which is the failure a mark this confident is capable of: the glyph asserts
// a meaning the bytes never stated -- and factoring the number does not make
// the claim any truer, only more elaborate (that block's 5·839·425609 is a
// date). templateTimePush takes such a number first, and this stays what its
// name says.
const extranonceMark = (n) => markToken(`η${productProse(n)}`, `extranonce ${n} — the counter the miner rolled once the header's 32-bit nonce (η) was exhausted. A tally, not text: it is read as the number it is, so its bytes never pass for writing`);

// ─── the counter nobody pushed ─────────────────────────────────────────
//
// η reads a counter that arrived as a push, which is how the pools built on
// ckpool and btccom write theirs -- the push states its own width, so the
// number alone restores the bytes and the mark needs nothing else.
//
// Most pools do not push it. F2Pool, AntPool and SECPOOL write the counter as
// raw bytes in the margin, where the book rendered it as payload prose: a
// dozen words of wordlist standing for a number nobody meant as language. It
// is the same field under the same rule as the pushed one, and it should read
// the same way.
//
// One field, one mark, and no superscript on either: the counter reads as its
// number wherever it was written, exactly as the header's own nonce does.
//
// What a push gave for free was the width. Little-endian, a run's LOW bytes
// are its least significant, so 00 12 34 and its number are the same thing --
// the leading zero is in the figure. What is lost is a zero at the far end,
// where the number's most significant byte would be: d9 0f 1a 00 and d9 0f 1a
// are one number and different bytes.
//
// So those come off as what they are. A zero byte closing a counter is a byte
// the pool left empty, which is what ⓪ says, and once it is out the number is
// minimally encoded and restores its own bytes without help. It costs a second
// mark where the chain happens to write one -- about one counter in 256 -- and
// it keeps every counter reading as a counter and every byte on the page.
//
// Bounded at eight bytes, the same ceiling the pushed counters take: past that
// a run in the margin is not a counter but a commitment or a datum -- a
// merged-mining root, a pool's own structure -- and it stays prose rather than
// being flattened into a hundred-digit figure that says nothing about what it
// holds. Such a run keeps its trailing zeros too: prose is exact whatever the
// bytes are, so there is nothing there to peel them for.
const RAW_COUNTER_MAX_BYTES = 8;

const rawCounterMark = (hex) => {
  const bytes = hex.length / 2;
  const value = BigInt('0x' + ((hex.match(/../g) || []).reverse().join('') || '0'));
  return markToken(`η${productProse(value)}`,
    `${value} — ${bytes} bytes of the miner's margin, read as the number they are, little-endian as the chain writes its numbers. In this position that is the extranonce, the counter rolled once the header's 32-bit nonce (η) was exhausted, which is what a pool leaves room for here; a pool may also write a small number of its own (a version, a separator), and the bytes do not distinguish them. Minimally encoded, so the figure restores these bytes and no others`);
};

// A run of bytes -> the pieces it renders as. A counter closing on zero bytes
// gives them up to ⓪ so the figure that remains is minimal; anything too long
// to be a counter is left exactly as it is, for the prose to carry whole.
function counterPieces(hex) {
  let end = hex.length;
  while (end >= 2 && hex.slice(end - 2, end) === '00') end -= 2;
  const head = hex.slice(0, end);
  const zeros = (hex.length - end) / 2;
  if (!head || head.length / 2 > RAW_COUNTER_MAX_BYTES) return [{ hex }];
  return zeros ? [{ counter: head }, { zeros }] : [{ counter: head }];
}

// ─── the zeros ─────────────────────────────────────────────────────────
//
// A pool lays out its coinbase at a fixed size and leaves room in it -- for
// the counter the miner rolls, for a commitment it is not carrying today --
// and what sits in that room is nothing: a run of 0x00. Rendered as payload
// the run is a word repeated, because zero is the first word of the wordlist,
// so a padded coinbase spends two thirds of its paragraph saying "abandon".
// Which is true, invertible, and no way to read a book.
//
// So a run of zeros takes the mark it already has. ⓪ is OP_0 in the sigla
// (0x00, the byte itself), and a superscript counts bytes everywhere in the
// script register -- p⁶⁵, h³², a bare push's ²⁰ -- so ⓪²⁰ says twenty zero
// bytes in notation the reader already holds. Nothing is claimed by it that
// the bytes do not state, and the count restores them exactly: this is the
// same trade as ∅ for an all-zero witness, one register down.
//
// (In the chapter head ⓪ⁿ counts zero BITS, of the block hash. Same glyph,
// different unit, and the units are the registers': a hash is measured in
// bits because its leading zeros are the proof of work, and a margin is
// measured in bytes because bytes are what the miner left. The key says so
// on both rows.)
//
// The floor is four bytes. Below it a zero is just a small number inside a
// counter, and interrupting the prose to mark one would cost more than it
// saves; at four the run is the pool's layout showing through, and the prose
// would otherwise be three words of nothing.
const ZERO_MIN_RUN = 4;

// A byte string -> its runs of zeros and the spans between them, in order,
// every byte in exactly one part: { zeros: n } or { hex }. Byte-aligned by
// construction -- a hex string can spell 0000 across a byte boundary, and a
// regular expression over it would find zeros nobody wrote.
export function splitZeroRuns(hex, min = ZERO_MIN_RUN) {
  const parts = [];
  const bytes = hex.length / 2;
  const at = (k) => hex.slice(k * 2, k * 2 + 2);
  let i = 0, spanStart = 0;
  while (i < bytes) {
    if (at(i) !== '00') { i++; continue; }
    let j = i;
    while (j < bytes && at(j) === '00') j++;
    if (j - i >= min) {
      if (i > spanStart) parts.push({ hex: hex.slice(spanStart * 2, i * 2) });
      parts.push({ zeros: j - i });
      spanStart = j;
    }
    i = j;
  }
  if (spanStart < bytes) parts.push({ hex: hex.slice(spanStart * 2) });
  return parts;
}

const zeroRunMark = (n) => `<span class="op op-zeros" title="${n} zero bytes — the space the pool's template left and nothing filled: room for a counter, or for a commitment this block is not carrying. Written as the zero opcode with its byte count, because ${n} words saying nothing is not a reading of it. The count restores the bytes exactly">⓪${toSuperscript(n)}</span>`;

// The signature mark: the pool's own name, quoted to its exact extent, with
// who wrote it riding the mark rather than printed in the passage. The name is
// a reading -- a tag is unauthenticated and copyable -- and the book keeps
// readings off the record's own line. What the passage gains is the boundary:
// the quotation closes where the pool's writing closes, not wherever the
// counter's bytes stopped being printable.
const signatureMark = (part) => `<span class="pool-sig" title="${escapeHtml(part.pool)} — the pool's own signature, matched against the book's table (web/btc-pools.js). That these bytes are in the coinbase is the record; that ${escapeHtml(part.pool)} mined the block is a reading of it, since a tag is unauthenticated and anyone may copy one">“${quoteText(part.text)}”</span>`;

// The miner's margin -> its display. A run the scanner found is cut at the
// signature inside it, if any: the pool's writing is quoted under its mark,
// and whatever leaned against it either side is put back to the test every
// other run faces -- writing gets its own quotation, bytes go to prose. Every
// byte still reaches the page exactly once; the cuts only decide the register
// it reaches it in.
function renderMinerMargin(hex, collect) {
  if (!hex) return '';
  const utf8Hex = (s) => Array.from(new TextEncoder().encode(s), (b) => b.toString(16).padStart(2, '0')).join('');

  // First decide what each stretch of the margin is, in order, without
  // rendering any of it: the signature, the writing around it, the bytes.
  const pieces = [];
  for (const seg of splitReadableRuns(hex)) {
    if (seg.text === undefined) { pieces.push({ hex: seg.hex }); continue; }
    for (const part of splitOnSignature(seg.text)) {
      if (part.pool) pieces.push(part);
      else if (looksLikeWriting(part.text)) pieces.push({ text: part.text });
      else pieces.push({ hex: utf8Hex(part.text) });   // the byte that leaned on a signature, put back
    }
  }
  // Then join the bytes that ended up neighbours -- the tail of a counter and
  // the character of it that leaned on the tag are one run of bytes, and read
  // as one passage of prose rather than two. Only the register was ever in
  // question; the order and the count of the bytes never were.
  const merged = [];
  for (const p of pieces) {
    const last = merged[merged.length - 1];
    if (p.hex !== undefined && last && last.hex !== undefined) last.hex += p.hex;
    else merged.push({ ...p });
  }
  // Bytes last, and by then there are only three things left they can be: a
  // run the pool left empty, which takes ⓪ and its count; a counter short
  // enough to be one, which reads as the number it is; and everything longer,
  // which is a commitment or a datum and stays prose.
  return merged
    .flatMap((p) => (p.hex === undefined ? [p] : splitZeroRuns(p.hex)))
    .flatMap((p) => (p.hex === undefined ? [p] : counterPieces(p.hex)))
    .map((p) => (p.zeros !== undefined ? zeroRunMark(p.zeros)
      : p.counter !== undefined ? rawCounterMark(p.counter)
        : p.hex !== undefined ? collect(p.hex)
          : p.pool ? signatureMark(p) : `“${quoteText(p.text)}”`))
    .filter(Boolean)
    .join(' ');
}

// ─── data type marks ───────────────────────────────────────────────────
//
// A pushed datum whose kind is recognizable carries its type mark from the
// Notation key -- p public key, s signature, h hash, r redeem script,
// w witness script, t tapscript -- set just before its prose, with the push's
// byte count riding on the mark itself as a superscript that follows it, so a
// script reads as its pattern (p⁶⁵ ∇) without consulting the key. (A bare,
// untyped push keeps its superscript leading, before the prose.) Classification
// is display-only annotation: it never changes what gets encoded.
const dataMark = (sym, title) => `<span class="dt" title="${title}">${sym}</span>`;

// Classify a script push -> a type mark, or '' when its kind isn't evident.
// `compact` is derToCompact's verdict (a canonical DER signature). A 20-byte
// push in script context is a HASH160; a 32-byte one is a hash -- except
// directly after ① (a witness-v1 program: Taproot's tweaked output key), or
// directly before a signature check (an x-only key inside a tapscript).
// Non-canonical DER (0x30-led, signature-sized) still marks s.
const SIG_CHECK_OPS = new Set([0xac, 0xad, 0xba]);
function scriptDataMark(push, compact, prevOp, nextOp) {
  const n = push.length / 2;
  if (compact || (push.slice(0, 2) === '30' && n >= 68 && n <= 73)) return dataMark('s', 'signature');
  if (isPubkey(push)) return dataMark('p', 'public key');
  if (n === 32 && prevOp === 0x51) return dataMark('p', 'public key — Taproot tweaked output key');
  if (n === 32 && SIG_CHECK_OPS.has(nextOp)) return dataMark('p', 'public key — x-only');
  if (n === 20 || n === 32) return dataMark('h', 'hash');
  return '';
}

// A data push that is valid UTF-8 and wholly human-readable (an Ordinals
// inscription's "ord" tag, its content type or a text body, an embedded message)
// -> its decoded string, else null. Non-English text and emoji come through;
// binary (keys, hashes, sigs, images -- all ≥ 20 bytes and dense) fails UTF-8
// validation or trips a control byte and stays prose. The floor is 3 so a short
// protocol tag like Ordinals' "ord" is caught while a 1-2 byte push falls to
// numberPush; the whole-push requirement lives in readableUtf8Text.
const TEXT_PUSH_MIN = 3;
function textPush(hex) {
  if (!hex || hex.length / 2 < TEXT_PUSH_MIN) return null;
  return readableUtf8Text(hex);
}

// A short data push (1-4 bytes) minimally encoding a number -> its decimal, else
// null. An Ordinals field tag (content type = 1, body = 0) is a small number
// pushed as data, not an OP_N, so it would otherwise fall through to cover prose
// -- a single byte becoming an absurd little sentence. Minimal (no trailing zero
// byte), so the decimal alone reconstructs the wire bytes. Keys, hashes and
// signatures are all ≥ 20 bytes, well past this window.
function numberPush(hex) {
  const n = hex.length / 2;
  if (n < 1 || n > 4 || hex.slice(-2) === '00') return null;
  return BigInt('0x' + reverseHexStr(hex)).toString();
}

// The little-endian value a short push encodes (1-5 bytes, per CScriptNum), for
// reading a CLTV/CSV threshold; null if it isn't a plausible script number. The
// operands are positive, so unsigned LE reads them exactly (a sign byte is 0x00).
function scriptNumValue(hex) {
  const n = hex.length / 2;
  if (n < 1 || n > 5) return null;
  return Number(BigInt('0x' + reverseHexStr(hex)));
}

// A CSV (OP_CHECKSEQUENCEVERIFY) operand -> its relative-timelock mark in the
// same ■(block, a count of chapters) / Τ(time, a duration) grammar an input's
// nSequence uses; null when the disable bit is set (not a relative timelock).
function csvMark(value) {
  if (value & 0x80000000) return null;
  const n = value & 0xffff;
  return (value & 0x00400000)
    ? { mark: `Τ${durationFrom512s(n)}`, title: `relative locktime — at least ${durationFrom512s(n)} (${n} × 512 s) after this coin was confirmed` }
    : { mark: `■${n}`, title: `relative locktime — at least ${n} block${n === 1 ? '' : 's'} after this coin was confirmed` };
}

// data push to Glossia prose. Options: `eligible` (an OP_RETURN payload, or a
// coinbase) turns on inline ASCII quoting for legible pushes; `nested` reveals a
// script pushed as data -- a P2SH redeemScript, always the final push -- by
// rendering it as opcodes in turn; `preamble` (a coinbase) decodes the early
// mining preamble's leading pushes into β/η marks. Opcode glyphs, OP_* names
// and the preamble marks are the only HTML added here; pushed data is Glossia
// prose (safe) and quoted ASCII is escaped, so the result is safe to render
// via innerHTML like before. Exported for the anthology title page, which
// reads an address as its scriptPubKey in this same notation.
export function renderScript(hex, collect, { eligible = false, nested = false, preamble = false, coinbase = false } = {}) {
  const toks = tokenizeScript(hex);
  // A P2SH scriptSig ends with its redeemScript, pushed as data; reveal that
  // final push as opcodes when it parses as a genuine script.
  const redeemIdx = nested ? toks.map((t) => t.push !== undefined).lastIndexOf(true) : -1;
  const parts = [];
  // The preamble is strictly positional -- the target must open the script,
  // the extranonce must directly follow it; anything else ends the hunt and
  // the push falls through to the ordinary treatment.
  let pre = preamble ? 'target' : 'done';
  // The preamble sits on its own line: it is the miner's own bookkeeping,
  // not the coinbase's message, so the break after its last mark lets what
  // the miner actually wrote (the genesis headline, a tag) open a line of
  // its own. Recorded as an index rather than pushed as a part, so a
  // scriptSig that is preamble and nothing else ends without a stray break.
  let breakAfter = -1;
  let prevOp = null;   // the opcode preceding a push -- context for its type mark
  toks.forEach((t, i) => {
    if (t.op !== undefined) {
      pre = 'done';
      prevOp = t.op;
      parts.push(opToken(t.op));
    } else if (t.push !== undefined) {
      if (pre === 'target') {
        pre = 'done';
        const bits = compactBitsFromPush(t.push);
        if (bits !== null) {
          const info = bitsInfo(bits);
          // The same two faces the frontispiece gives the header's nBits: β's
          // demand (the leading zero bits a valid hash must open with) and,
          // beside it, the target written exactly as its primes. No <
          // between them -- the frontispiece's sign binds the chapter hash
          // above it to the target, and no hash stands on this line; here the
          // mark names the target and the expression writes it out.
          parts.push(markToken(info.expr ? `${info.sym} ${info.expr}` : info.sym,
            `the difficulty target this block was mined against — ${info.title}`));
          breakAfter = parts.length - 1;
          pre = 'extranonce';
          return;
        }
      } else if (pre === 'extranonce') {
        pre = 'done';
        const n = extranonceFromPush(t.push);
        if (n !== null) {
          parts.push(extranonceMark(n));
          breakAfter = parts.length - 1;
          return;
        }
      }
      const mark = pushToken(t.pushForm || 0, t.push.length / 2);
      if (!t.push) { parts.push(mark); return; }              // a zero-length extended push -- the mark alone
      // The witness commitment (BIP141): in a coinbase, an OP_RETURN whose
      // 36-byte push opens with the aa21a9ed marker carries
      // ⌘(witness-tree root ‖ reserved value) -- the testimony binding
      // every witness (every footnote) in this block to the chain, through
      // this one output. The marker reads as its own ⋔𝑤 mark and the 32
      // committed bytes as a gold on-chain datum; the root itself is the
      // preimage -- committed here, never written anywhere.
      if (coinbase && prevOp === 0x6a && t.push.length === 72 && t.push.slice(0, 8).toLowerCase() === 'aa21a9ed') {
        parts.push(
          markToken('⋔<sub>w</sub>', 'witness commitment (BIP141 marker aa21a9ed) — ⌘(witness-tree root ‖ reserved value), the identity hash: every witness in this block, bound to the chain through this coinbase. The root is the preimage — committed here, never written on chain'),
          // The ⋔w mark alone names the tree; how the digest was made
          // (⌘ over root ‖ reserved) lives in the titles and the Notation
          // key rather than crowding the line.
          dataMark('h', 'the 32 committed bytes — ⌘(witness-tree root ‖ reserved value); the root is the preimage, never written on chain') + pushToken(0, 32),
          collect(t.push.slice(8)),
        );
        return;
      }
      if (i === redeemIdx && looksLikeScript(t.push)) {
        // reveal the redeemScript, typed r
        parts.push(dataMark('r', 'redeem script — revealed as opcodes') + mark, renderScript(t.push, collect));
        return;
      }
      // A push directly before OP_CLTV (τ) or OP_CSV (Δ) is a timelock threshold,
      // not opaque data: decode it to the same ■(block)/Τ(time) mark the margin
      // gives an nLockTime (absolute) or nSequence (relative), so a script's
      // timelock reads in the book's own grammar rather than a bare number.
      const nextOp = toks[i + 1]?.op;
      if (nextOp === 0xb1 || nextOp === 0xb2) {
        const v = scriptNumValue(t.push);
        const info = v === null ? null : (nextOp === 0xb1 ? locktimeInfo(v) : csvMark(v));
        if (info && info.mark) { parts.push(`<span class="op" title="${escapeHtml(info.title)}">${info.mark}</span>`); return; }
      }
      if (eligible) {
        const found = findTextRuns(t.push, { segment: false });   // t.push is a payload, not a script
        if (found.length) { parts.push(mark, found.map((s) => `“${quoteText(s)}”`).join(' ')); return; }
      }
      // A wholly-readable push (an inscription's content type, a text body, an
      // embedded UTF-8 message) reads as its own quoted text rather than cover prose.
      const text = textPush(t.push);
      if (text !== null) { parts.push(mark, `“${quoteText(text)}”`); return; }
      // A short number pushed as data (an Ordinals field tag, a script number)
      // reads as its literal digits, like the book's other structural numbers.
      const num = numberPush(t.push);
      if (num !== null) { parts.push(`<span class="op" title="pushed number — ${num}">${num}</span>`); return; }
      const compact = derToCompact(t.push);                   // a DER signature is stripped to r‖s‖sighash
      // A typed push carries its byte-count superscript on the type mark itself
      // (p⁶⁵), so the datum's kind leads and its length rides after it; a bare
      // push keeps the superscript leading, before its prose.
      const dtMark = scriptDataMark(t.push, compact, prevOp, toks[i + 1]?.op);
      parts.push(dtMark ? dtMark + mark : mark, collect(compact || t.push));
    } else {
      pre = 'done';
      parts.push(collect(t.trunc));                           // malformed tail -- carry it as prose
    }
  });
  // The break rides on the last preamble mark rather than standing as its own
  // part, so a plain-text rendering (which drops the tag) keeps single spaces.
  if (breakAfter >= 0 && breakAfter < parts.length - 1) parts[breakAfter] += '<br>';
  return parts.join(' ');
}

// Every token is a data push or a defined opcode, with no malformed tail -- the
// test for whether a coinbase scriptSig (otherwise arbitrary miner data) is a
// clean script worth rendering as opcodes, as the earliest blocks' are.
const isDefinedOp = (code) => OPCODE_SYMBOLS[code] !== undefined || OPCODE_NAMES[code] !== undefined;
function isCleanScript(hex) {
  const toks = tokenizeScript(hex);
  return toks.length > 0 && toks.every((t) =>
    t.trunc === undefined && (t.push !== undefined || isDefinedOp(t.op)));
}

// ─── witness → per-item rendering ──────────────────────────────────────
//
// An input's witness is a stack of items. Rendering them individually (rather
// than as one blob) lets a signature, a key and a script read as distinct
// stack elements -- and the one item that is a script (a P2WSH witnessScript or
// a Taproot tapscript) is rendered in opcode notation like any other script.

const witHexLen = (h) => h.length / 2;
const witFirst = (h) => parseInt(h.slice(0, 2), 16);

// A witness item that is plainly data, never a script:
function isPubkey(h) {
  const n = witHexLen(h), b = witFirst(h);
  return (n === 33 && (b === 0x02 || b === 0x03)) || (n === 65 && b === 0x04);
}
function isSignature(h) {
  const n = witHexLen(h), b = witFirst(h);
  return n === 64 || n === 65 || (b === 0x30 && n >= 68 && n <= 73);   // Schnorr, or DER (+sighash byte)
}
// A Taproot script-path control block: a 0xc0/0xc1 leaf byte, then a 32-byte
// internal key and a merkle path of 32-byte hashes.
function isControlBlock(h) {
  const n = witHexLen(h);
  return n >= 33 && (n - 33) % 32 === 0 && (witFirst(h) & 0xfe) === 0xc0;
}
// A signature check or a timelock is the hallmark of a spending script and
// essentially never turns up by chance in a data item, so its presence (in an
// item that parses cleanly as script) marks the item as a witnessScript.
const SCRIPT_SIGNAL = new Set([0xac, 0xad, 0xae, 0xaf, 0xba, 0xb1, 0xb2]);
function looksLikeScript(h) {
  if (!h || isPubkey(h) || isSignature(h)) return false;
  const toks = tokenizeScript(h);
  if (!toks.length || toks.some((t) => t.trunc !== undefined)) return false;
  return toks.some((t) => t.op !== undefined && SCRIPT_SIGNAL.has(t.op));
}

// A Taproot annex's index in the stack, or -1. Per BIP341 the annex is an
// optional final item, present only when the stack holds ≥2 items and the last
// one begins with 0x50. It is passed to validation but is neither script nor
// signature data, so it reads under its own mark rather than as a script.
function annexIndex(items) {
  const n = items.length;
  return (n >= 2 && witFirst(items[n - 1]) === 0x50) ? n - 1 : -1;
}

// Which witness items are scripts to render as opcodes. A witness can carry more
// than one -- a Taproot tapscript sits just below a control block (and a witness
// may reveal several), a P2WSH witnessScript is the last item -- so return the
// full set, not a single index. An item counts as a script if it either sits
// directly below a control block, or parses cleanly as one on its own (a clean
// opcode stream with a signature check or timelock). Control blocks, signatures
// and keys are never scripts, so they are excluded. Empty for an all-data
// witness -- P2WPKH, a key-path spend, a bare signature.
function witnessScriptIndices(items) {
  const idxs = new Set();
  const n = items.length;
  if (n === 0) return idxs;
  let last = n - 1;
  if (annexIndex(items) === last) last -= 1;                  // strip an optional annex
  for (let i = 0; i <= last; i++) {
    if (i + 1 <= last && isControlBlock(items[i + 1])) { idxs.add(i); continue; }  // a tapscript, below its control block
    if (!isControlBlock(items[i]) && looksLikeScript(items[i])) idxs.add(i);       // a witnessScript, or a reveal
  }
  return idxs;
}

// The witness-item separator, setting each stack element apart in the footnote.
const WIT_SEP = '<span class="wit-sep"> · </span>';

// A Taproot control block -> its footnote form, decomposed into its three
// components. The leading byte splits into its top 7 bits -- the tapleaf version,
// read as v<n> -- and its low bit, the output-key parity, read as a subscript;
// the 32-byte internal key reads under a p mark; and the trailing 32-byte sibling
// hashes -- the merkle path proving the revealed leaf is committed in the taptree
// -- read under a pitchfork ⋔ as a merkle proof. The three parts are fixed-width
// (1 byte, then 32, then 32 per sibling), so splitting the one item this way stays
// exactly reconstructable: the leading byte is (version << 1) | parity. A
// single-leaf taptree has an empty path, so its control block ends at the key.
function renderControlBlock(hex, encode) {
  const b = witFirst(hex);                                    // tapleaf version (top 7 bits) | output-key parity (low bit)
  const leafVer = b >> 1, parity = b & 1;
  const ctrlByte = `<span class="op" title="control byte — tapleaf version ${leafVer} (top 7 bits; 0x${b.toString(16).padStart(2, '0')}), output-key parity ${parity}">v${leafVer}${parity ? '₁' : '₀'}</span>`;
  const parts = [
    dataMark('c', 'control block — a Taproot script-path reveal') + ' ' + ctrlByte,
    dataMark('p', 'public key — the Taproot internal key') + ' ' + encode(hex.slice(2, 66)),
  ];
  const path = hex.slice(66);                                 // zero or more 32-byte sibling hashes
  if (path) parts.push(dataMark('⋔', 'merkle proof — the sibling hashes proving the revealed leaf is committed in the taptree') + ' ' + encode(path));
  return parts.join(' ');
}

// An input's witness stack (hex items) -> its footnote display. `encode` turns
// a data item's hex into Glossia prose; every script item becomes opcode
// notation, typed w (a P2WSH witnessScript) or t (a Taproot tapscript, identified
// by the control block above it). Data items carry their own type marks -- s a
// signature, p a key, c a control block (its merkle proof split off under ⋔), a
// an annex -- and items are separated so each reads as its own element.
export function renderWitness(items, encode) {
  if (!items || !items.length) return '∅';
  const scriptIdxs = witnessScriptIndices(items);
  const annexIdx = annexIndex(items);
  return items
    .map((hex, i) => {
      if (!hex) return '<span class="wit-empty">∅</span>';    // an empty stack item
      if (i === annexIdx) return dataMark('a', 'annex — reserved Taproot spend data (BIP341)') + ' ' + encode(hex);
      if (scriptIdxs.has(i)) {
        const isTapscript = i + 1 < items.length && isControlBlock(items[i + 1]);
        return (isTapscript ? dataMark('t', 'tapscript — a Taproot leaf, revealed as opcodes') : dataMark('w', 'witness script — revealed as opcodes'))
          + ' ' + renderScript(hex, encode);
      }
      if (isControlBlock(hex)) return renderControlBlock(hex, encode);
      const compact = derToCompact(hex);                      // a DER signature is stripped to r‖s‖sighash
      const dm = (compact || isSignature(hex)) ? dataMark('s', 'signature')
        : isPubkey(hex) ? dataMark('p', 'public key') : '';
      return (dm ? dm + ' ' : '') + encode(compact || hex);
    })
    .join(WIT_SEP);
}

// A parsed transaction (btc-tx.js's parseTransaction) -> a structured
// breakdown of every field's rendered text, in wire order, plus the payload
// words consumed. bitcoin-book.html's margin layout is built from this, each
// field Glossia-encoded exactly once.
// `bestOf` forwards to encodeCanonical, which since glossia 0.3.0 renders the
// canonical encoding and ignores it — the canonical version pins the fluency
// budget. The parameter stays so custom `encoder` implementations (which share
// encodeCanonical's signature) keep working.
// `lazyData`, when supplied, is an alternative encoder (hex -> HTML) used for an
// OP_RETURN payload only: OP_RETURN is the one body field that can carry a bulky
// data-carrier blob, so the caller can pass a placeholder emitter to defer its
// encoding until it scrolls into view, exactly as witness pushes are deferred.
// `encoder`, when supplied, stands in for encodeCanonical itself (same
// signature and result shape) -- a caller can record the exact pushes a
// section will encode (a dry run) or serve them from its own store, so a
// giant section can be encoded in yielded chunks rather than one long pass.
export function composeTransactionFields(parsed, bestOf = 1, lazyData = null, encoder = null) {
  const payloadWords = [];
  const enc = encoder || encodeCanonical;
  const collect = (hex) => {
    if (!hex) return '';
    const r = enc(hex, bookLang(), bestOf);   // the reader's saved book language
    payloadWords.push(...r.payloadWords);
    return r.prose;
  };
  const inputs = parsed.vin.map((v) => {
    const isNullPrevout = v.txid === '00'.repeat(32);
    // A coinbase scriptSig is arbitrary miner data, and the chain gives it
    // three readings, in this order. From BIP34 on it opens with the block's
    // own height: the one part a rule constrains, taken under ■ with the rest
    // left as the miner's margin. Before that rule, the earliest blocks' are
    // clean push-scripts, so render those in opcode notation, with the mining
    // preamble (restated difficulty target + extranonce) decoded to marks and
    // embedded text like the genesis headline quoted inline. Messier ones keep
    // the plain treatment, where a mining-pool tag is surfaced as a quote block
    // (`scriptAscii`). Every other scriptSig is genuine script (with a P2SH
    // redeemScript revealed as opcodes via `nested`).
    let script, scriptAscii = null, signature = null;
    if (isNullPrevout) {
      // Who signed the margin, if the table knows the hand: carried beside the
      // fields rather than set in the passage, because the passage is the
      // transaction and this is a reading of it. The annotation layer, a
      // running head, a reply from the bot -- whatever wants to say the name
      // out loud takes it from here (see web/btc-pools.js).
      signature = poolOf(findTextRuns(v.scriptSig, { segment: false }));
      const bip34 = bip34HeightPush(v.scriptSig);
      if (bip34) {
        // The rule's own boundary, then the miner's bookkeeping, then a break:
        // the height under ■, the template's clock and the counters after it,
        // and the margin below -- the same shape the preamble takes (β η, break,
        // the writing), and for the same reason. What the miner wrote opens a
        // line of its own, with nothing mechanical left on it.
        const stamp = templateTimePush(bip34.restHex, bip34.height);
        const { values, restHex } = peelExtranonces(stamp ? stamp.restHex : bip34.restHex);
        const preamble = [
          blockHeightMark(bip34.height),
          ...(stamp ? [templateTimeMark(stamp.unix)] : []),
          ...values.map(extranonceMark),
        ].join(' ');
        const margin = renderMinerMargin(restHex, collect);
        script = preamble + (margin ? '<br>' + margin : '');
      } else if (isCleanScript(v.scriptSig)) {
        script = renderScript(v.scriptSig, collect, { eligible: true, preamble: true });
      } else {
        const found = findTextRuns(v.scriptSig);
        if (found.length) {
          scriptAscii = found.map((s) => quoteText(s)).join(' ');
          script = found.map((s) => `“${quoteText(s)}”`).join(' ');
        } else {
          script = collect(v.scriptSig);
        }
      }
    } else {
      script = renderScript(v.scriptSig, collect, { nested: true });
    }
    const seq = sequenceInfo(v.sequence);
    // The prevout is carried as a reference (txid + output index), not encoded:
    // the book resolves it to a volume/book/chapter/section citation for the left
    // margin. A coinbase has none. Raw per-input witness bytes (segwit only) ride
    // along so each input's witness can become its own footnote.
    return {
      isNullPrevout,
      prevTxid: isNullPrevout ? '' : v.txid,
      prevVout: v.vout,
      script, scriptAscii,
      // The signature the margin carries, as { pool, link, text }, or null --
      // a reading, kept out of the passage and available beside it.
      signature,
      sequence: seq.mark, sequenceKind: seq.kind, sequenceTitle: seq.title, sequenceRbf: seq.rbf,
      witnessHex: v.witnessHex || '',
      witnessItems: v.witness || [],
      // An all-zero witness (a coinbase's reserved value, or an empty stack) is
      // shown as ∅ rather than encoded to a run of zero-words.
      witnessZero: (v.witness || []).every((it) => /^0*$/.test(it)),
    };
  });

  // A coinbase's outputs carry one script no other transaction may: the
  // witness commitment -- recognized by renderScript only under this flag,
  // so an OP_RETURN that merely mimics the marker elsewhere stays plain data.
  const isCoinbaseTx = parsed.vin.length === 1 && parsed.vin[0].txid === '00'.repeat(32);
  const outputs = parsed.vout.map((o) => {
    // A scriptPubKey is always genuine script, rendered in opcode notation. An
    // OP_RETURN (¶) payload is `eligible` for inline ASCII quoting, so an
    // embedded message reads verbatim rather than as prose.
    const isOpReturn = o.scriptPubKey.slice(0, 2).toLowerCase() === '6a';
    // A large OP_RETURN payload (a data carrier) is encoded lazily when the
    // caller supplies `lazyData`; an ASCII payload is still quoted inline by
    // `eligible` before either encoder is reached, so only opaque bytes defer.
    const encodeData = (isOpReturn && lazyData) ? lazyData : collect;
    // sats rides along raw so the renderer can total the outputs (the
    // closing balance line) without unformatting the display value; spkHex
    // is the locking script verbatim, so the renderer can derive the
    // script's address (its keep on the ledger shelf) without re-parsing.
    return { script: renderScript(o.scriptPubKey, encodeData, { eligible: isOpReturn, coinbase: isCoinbaseTx }), scriptAscii: null, value: formatBtc(o.value), valueTitle: `${groupDigits(String(o.value))} satoshis`, sats: o.value, spkHex: o.scriptPubKey };
  });

  const lock = locktimeInfo(parsed.locktime);
  // Serialization framing is never encoded -- the input/output counts, the
  // witness item count and its per-item length prefixes, and a script's push
  // length prefixes are all structural and reconstructable from the parse, so
  // only genuine payload bytes become prose. (The counts are implicit in the
  // number of input/output rows; witness items render individually.)
  return {
    version: String(parsed.version),
    inputs,
    outputs,
    locktime: lock.mark, locktimeTitle: lock.title,
    payloadWords,
  };
}
