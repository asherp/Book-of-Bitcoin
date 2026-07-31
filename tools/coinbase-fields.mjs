// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/coinbase-fields.mjs — read a coinbase scriptSig as the fields the
// pool that wrote it actually put there.
//
// A coinbase scriptSig is not a script. One rule binds it (BIP34's height
// push) and one bound holds it (2-100 bytes, consensus); everything between
// is whatever the pool's template builder wrote, and what it wrote is a
// house style rather than a format. This module reads those house styles
// without pretending they are grammar: it recognizes the fields that CAN be
// recognized -- the height, a template timestamp, the merged-mining
// commitments that carry their own magic bytes, the readable pool tag -- and
// hands back everything else as the bytes it is.
//
// Byte-exact, like the book itself: the fields concatenate back to the input,
// so nothing is dropped and nothing is invented. See tools/coinbase-formats.md
// for what the fields mean per pool, and tools/coinbase-survey.mjs for the
// instrument that samples the chain and reports what the pools are doing now.
//
// Deliberately NOT wired into the book's own rendering. web/btc-prose.js
// stops reading at the BIP34 height on purpose -- past it there is no rule to
// read by, and a guess printed flush against the record borrows the record's
// authority. What this module produces is evidence about the margin, which is
// commentary; whether any of it earns a mark on the page is an editorial
// decision, not a parsing one.

import { splitReadableRuns } from '../web/btc-tx.js';

const hexToBytes = (hex) => Uint8Array.from(hex.match(/../g) || [], (b) => parseInt(b, 16));

// A little-endian hex word -> its value. Coinbase fields are small enough that
// Number holds them exactly (the widest is an 8-byte extranonce, which is read
// as bytes, not as a number).
const leValue = (hex) => Number(BigInt('0x' + ((hex.match(/../g) || []).reverse().join('') || '0')));

// ─── the bounds the chain itself sets ──────────────────────────────────

// Consensus: a coinbase input's scriptSig is 2-100 bytes (Bitcoin Core,
// src/consensus/tx_check.cpp, "bad-cb-length"). Every house style below is
// squeezed into that hundred bytes, which is why pools truncate their own tags.
export const CB_SCRIPTSIG_MIN = 2;
export const CB_SCRIPTSIG_MAX = 100;

export const BIP34_ACTIVATION = 227931;      // Bitcoin Core's BIP34Height
const MAX_PLAUSIBLE_HEIGHT = 10_000_000;     // ~year 2200, well past any sampled block
const GENESIS_TIME = 1231006505;             // block 0's nTime -- no template predates it
const FUTURE_SLACK = 31_536_000;             // a year, so a clock-skewed template still reads

// ─── the one field a rule constrains ───────────────────────────────────

// The BIP34 height push: a direct push of 1-5 bytes, minimally encoded, whose
// little-endian value is the block's own height. When the caller knows the
// height (the survey does -- it asked for the block) the value must equal it,
// which turns a guess into a check; without one, a plausibility window stands
// in. Wider than web/btc-prose.js's bip34HeightPush, which takes 3-byte pushes
// only: the book's window is drawn to be unmistakable on the page, this one is
// drawn to survey what pools actually write, including the 4-byte pushes that
// arrive when the height crosses 8,388,607 and the odd non-minimal encoding.
export function readHeightPush(hex, expected = null) {
  const op = parseInt(hex.slice(0, 2), 16);
  if (!(op >= 0x01 && op <= 0x05)) return null;
  const end = 2 + op * 2;
  if (hex.length < end) return null;
  const height = leValue(hex.slice(2, end));
  if (expected !== null ? height !== expected
    : !(height >= BIP34_ACTIVATION && height <= MAX_PLAUSIBLE_HEIGHT)) return null;
  return { height, hex: hex.slice(0, end), restHex: hex.slice(end) };
}

// A direct push of 1-8 bytes -> its value and bytes. The generic reader behind
// both the template timestamp and the counters: what a push means depends on
// where it sits, so meaning is decided by the caller.
export function readNumberPush(hex) {
  const op = parseInt(hex.slice(0, 2), 16);
  if (!(op >= 0x01 && op <= 0x08)) return null;
  const end = 2 + op * 2;
  if (hex.length < end) return null;
  return { value: leValue(hex.slice(2, end)), bytes: op, hex: hex.slice(0, end), restHex: hex.slice(end) };
}

// ─── the commitments that carry their own magic ────────────────────────
//
// Three foreign chains ask a Bitcoin miner to carry a hash for them, and each
// says in its own specification exactly what bytes to look for. These are the
// only structures in the margin that identify themselves, which makes them the
// only ones a parser may claim to have found rather than guessed at.

// A hash is dense; a tag is not. Used to keep a short ASCII magic ('Hath')
// from matching inside ordinary prose that happens to be followed by text.
function looksBinary(hex) {
  const bytes = hexToBytes(hex);
  let odd = 0;
  for (const b of bytes) if (b < 0x20 || b > 0x7e) odd++;
  return odd * 4 >= bytes.length;      // at least a quarter of it unprintable
}

export const COMMITMENTS = [
  {
    id: 'auxpow',
    label: 'merged mining (AuxPoW)',
    magic: 'fabe6d6d',                 // 0xfa 0xbe 'm' 'm'
    bytes: 4 + 32 + 4 + 4,
    // Namecoin/Dogecoin's CAuxPow::check: the magic may appear only once, the
    // aux chain merkle root must start immediately after it, and eight bytes
    // follow -- the merkle tree size and the nonce, both u32 little-endian.
    decode: (body) => ({
      root: body.slice(8, 8 + 64),
      merkleSize: leValue(body.slice(72, 80)),
      merkleNonce: leValue(body.slice(80, 88)),
    }),
  },
  {
    id: 'rsk',
    label: 'Rootstock merge mining',
    magic: '52534b424c4f434b3a',       // "RSKBLOCK:"
    bytes: 9 + 32,
    // RSKIP110: the 32 bytes are a 20-byte prefix of the RSK block's
    // hash-for-merge-mining, a 7-byte commit-to-parents vector, an uncle
    // count, and the RSK block number -- big-endian, unlike everything
    // Bitcoin writes beside it.
    decode: (body) => ({
      rskHashPrefix: body.slice(18, 18 + 40),
      cpv: body.slice(58, 58 + 14),
      uncles: parseInt(body.slice(72, 74), 16),
      rskBlockNumber: parseInt(body.slice(74, 82), 16),
    }),
  },
  {
    id: 'hathor',
    label: 'Hathor merged mining',
    magic: '48617468',                 // "Hath"
    bytes: 4 + 32,
    verify: (body) => looksBinary(body.slice(8)),
    decode: (body) => ({ auxBlockHash: body.slice(8) }),
  },
];

// Every commitment in a byte string, in order, non-overlapping. A magic whose
// declared body runs off the end of the script is not a commitment: the bytes
// are there by chance, or the pool wrote a prefix of one, and either way there
// is nothing to read.
export function findCommitments(hex) {
  const found = [];
  for (const c of COMMITMENTS) {
    for (let i = 0; ;) {
      const at = hex.indexOf(c.magic, i);
      if (at < 0) break;
      i = at + 2;
      if (at % 2) continue;                                  // not byte-aligned
      const end = at + c.bytes * 2;
      if (end > hex.length) continue;                        // truncated
      const body = hex.slice(at, end);
      if (c.verify && !c.verify(body)) continue;
      found.push({ at, end, spec: c, body });
      i = end;
    }
  }
  found.sort((a, b) => a.at - b.at);
  const kept = [];
  for (const f of found) if (!kept.length || f.at >= kept[kept.length - 1].end) kept.push(f);
  return kept;
}

// ─── the whole scriptSig, field by field ───────────────────────────────

// A coinbase scriptSig (hex) -> its fields, in order, every byte in exactly
// one of them. Each field is { kind, hex, offset } plus whatever its kind
// carries:
//
//   height     BIP34's push               { height }
//   time       the template's timestamp    { unix }        (only where it can sit)
//   auxpow     44 bytes under 0xfabe6d6d   { root, merkleSize, merkleNonce }
//   rsk        41 bytes under RSKBLOCK:    { rskHashPrefix, cpv, uncles, rskBlockNumber }
//   hathor     36 bytes under Hath         { auxBlockHash }
//   text       a readable run              { text }
//   bytes      everything else             { }
//
// Written for the coinbases pools write now. A pre-BIP34 one has no height to
// find and is a clean push-script besides, which the book already reads as
// opcodes (web/btc-prose.js, renderScript with `preamble`); this reads it as a
// margin, which is the wrong reading for it and an honest one -- `bip34` comes
// back false and the caller knows which era it is holding.
//
// `height` verifies BIP34's push against the height the block was fetched at;
// `now` bounds the timestamp window (pass a fixed value for a reproducible
// reading of an old sample); `minRun` is the floor on a readable run, the
// book's own (see TEXT_MIN_RUN in web/btc-tx.js).
export function decodeCoinbaseScriptSig(hex, { height = null, now = null, minRun = 5 } = {}) {
  const clean = String(hex || '').toLowerCase().replace(/[^0-9a-f]/g, '');
  const nowSec = now === null ? Math.floor(Date.now() / 1000) : now;
  const fields = [];
  let offset = 0;
  const add = (f) => { fields.push({ ...f, offset }); offset += f.hex.length / 2; };

  let rest = clean;
  const h = readHeightPush(rest, height);
  if (h) { add({ kind: 'height', hex: h.hex, height: h.height }); rest = h.restHex; }

  // The template timestamp, and only here. btcpool writes the height and then
  // the moment the template was built (src/bitcoin/StratumBitcoin.cc pushes
  // time(nullptr) as the second field), so a plausible unix time in exactly
  // that slot is a timestamp; the same four bytes anywhere else are a counter
  // that happens to fall in the window. Reading it in place matters because a
  // timestamp is not entropy: it is the same number in every block of a run,
  // it advances with the clock, and it dates the template rather than counting
  // anything.
  if (h) {
    const t = readNumberPush(rest);
    if (t && (t.bytes === 4 || t.bytes === 5) && t.value >= GENESIS_TIME && t.value <= nowSec + FUTURE_SLACK) {
      add({ kind: 'time', hex: t.hex, unix: t.value });
      rest = t.restHex;
    }
  }

  // What is left is the margin: commitments where they announce themselves,
  // readable runs where the pool wrote words, raw bytes everywhere else.
  const marks = findCommitments(rest);
  let cur = 0;
  const gap = (from, to) => {
    if (to <= from) return;
    for (const seg of splitReadableRuns(rest.slice(from, to), { minRun })) {
      if (seg.text !== undefined) {
        const bytes = Buffer.from(seg.text, 'utf8').toString('hex');
        add({ kind: 'text', hex: bytes, text: seg.text });
      } else {
        add({ kind: 'bytes', hex: seg.hex });
      }
    }
  };
  for (const m of marks) {
    gap(cur, m.at);
    add({ kind: m.spec.id, hex: m.body, label: m.spec.label, ...m.spec.decode(m.body) });
    cur = m.end;
  }
  gap(cur, rest.length);

  const rebuilt = fields.map((f) => f.hex).join('');
  return {
    hex: clean,
    length: clean.length / 2,
    fields,
    // The guarantee, checked rather than asserted: the reading reproduces the
    // bytes it read. A caller can trust the fields only as far as this holds.
    exact: rebuilt === clean,
    // The two things the reading itself can be wrong about, surfaced rather
    // than buried: no height where BIP34 requires one, and a length outside
    // what consensus allows -- both of which mean the sample, not the pool,
    // is what wants looking at.
    bip34: Boolean(h),
    withinConsensusBounds: clean.length / 2 >= CB_SCRIPTSIG_MIN && clean.length / 2 <= CB_SCRIPTSIG_MAX,
  };
}

// The structural signature of a reading -- kinds and widths, with the words
// left out. Two blocks from one pool share a shape while their tags differ by
// a worker name and their counters differ by a roll, so this is what groups a
// sample into house styles.
export function shapeOf(decoded) {
  return decoded.fields.map((f) => {
    if (f.kind === 'height') return '■';
    if (f.kind === 'time') return 'time';
    if (f.kind === 'text') return `"…"${f.hex.length / 2}`;
    if (f.kind === 'bytes') return `bytes${f.hex.length / 2}`;
    return f.kind;
  }).join(' · ');
}

// ─── who wrote it ──────────────────────────────────────────────────────
//
// A pool is identified by a string it chose to write, which is a claim and not
// a fact: tags are unauthenticated, copyable, and occasionally borrowed. The
// survey reports them as what they are -- what the coinbase says about itself.
// The full list lives in mempool's pools-v2.json, fetched at run time; this is
// the fallback, the pools that carried most of the hashrate when it was
// written, so the tool still says something useful offline.
export const FALLBACK_POOL_TAGS = [
  { name: 'Foundry USA', tags: ['/Foundry USA Pool', 'Foundry USA Pool', '/2cDw/'] },
  { name: 'AntPool', tags: ['/AntPool/', 'Mined by AntPool', 'Mined By AntPool'] },
  { name: 'ViaBTC', tags: ['/ViaBTC/', 'viabtc.com deploy'] },
  { name: 'F2Pool', tags: ['/F2Pool/', 'F2Pool', '七彩神仙鱼', '🐟'] },
  { name: 'MARA Pool', tags: ['MARA Pool', 'MARA Made in USA'] },
  { name: 'SpiderPool', tags: ['SpiderPool'] },
  { name: 'Luxor', tags: ['/LUXOR/', 'Luxor Tech'] },
  { name: 'SECPOOL', tags: ['SecPool'] },
  { name: 'Binance Pool', tags: ['/Binance/', 'binance'] },
  { name: 'Braiins Pool', tags: ['/slush/'] },
  { name: 'OCEAN', tags: ['OCEAN.XYZ'] },
  { name: 'SBI Crypto', tags: ['/SBICrypto.com Pool/', 'SBI Crypto', 'SBICrypto'] },
  { name: 'ULTIMUSPOOL', tags: ['/ultimus/'] },
  { name: 'WhitePool', tags: ['WhitePool'] },
  { name: 'Poolin', tags: ['/poolin.com', '/poolin/'] },
  { name: 'BTC.com', tags: ['/BTC.COM/', '/BTC.com/', 'btccom'] },
  { name: 'KuCoinPool', tags: ['KuCoinPool'] },
  { name: 'Titan', tags: ['Titan.io'] },
  { name: 'Terra Pool', tags: ['terrapool.io', 'Validated with Clean Energy'] },
  { name: 'ckpool', tags: ['/ckpool/', 'ckpool'] },
];

// The pool a reading names, by its own tags, or null. Matching is against the
// readable runs the decoder found rather than the raw hex, so a tag can never
// be "found" inside a counter that happened to spell it.
export function identifyPool(decoded, pools = FALLBACK_POOL_TAGS) {
  const text = decoded.fields.filter((f) => f.kind === 'text').map((f) => f.text).join(' ');
  if (!text) return null;
  const hay = text.toLowerCase();
  let best = null;
  for (const p of pools) {
    for (const tag of p.tags || []) {
      if (!tag) continue;
      if (hay.includes(String(tag).toLowerCase()) && (!best || tag.length > best.tag.length)) {
        best = { name: p.name, tag };
      }
    }
  }
  return best;
}
