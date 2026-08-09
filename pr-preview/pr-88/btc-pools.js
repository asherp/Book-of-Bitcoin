// SPDX-License-Identifier: MIT OR Apache-2.0
//
// btc-pools.js — the table of pool signatures, and what it is for.
//
// A coinbase's margin is the one place on the chain where somebody signs their
// work. Past BIP34's height push no rule holds, and what pools put there is a
// name: /Foundry USA Pool #dropgold/, Mined by AntPool, 🐟 /F2Pool/, /slush/.
// This table says, pool by pool, exactly what that signature looks like — and
// exactly where it ends, which is the part a parser needs and a reader is
// owed.
//
// Two things it buys, and they are different in kind.
//
// The first is a parse, and it is a fact about the bytes. Without the table,
// the book quotes whatever printable run it finds, so a byte of the counter
// leaning on the tag reads as though the pool wrote it — “/Foundry USA Pool
// #dropgold/`” in block 960,468, where that final backtick is the miner's
// counter and not the pool's punctuation. With the table, the quotation stops
// where the signature stops, and the leaning byte goes back to being what it
// is. Nothing about that is a claim: it is the difference between reading the
// bytes and guessing at them.
//
// The second is an identification, and it IS a claim. That the string
// /Foundry USA Pool #dropgold/ is in the coinbase is a fact; that Foundry
// mined the block is an inference from an unauthenticated tag anyone could
// copy. So the passage prints the signature and nothing else — the name rides
// the mark, in the hover and in the composed field, where the annotation layer
// can carry it and a reader can weigh it. The record and the reading of it,
// kept in different registers, which is the whole argument of the book.
//
// A signature is a pattern rather than a string because pools write around
// their own names: MARA appends a version, ViaBTC embeds an account, F2Pool
// pads with spaces. The pattern's job is to cover what the pool wrote and stop
// there. Where the boundary is genuinely unknown — AntPool's digits after
// "Mined by AntPool" could be the pool's or the counter's — the pattern claims
// the part that is certain and leaves the rest to the margin. Under-claiming
// costs a few bytes their quotation marks; over-claiming puts words in a
// pool's mouth.
//
// Sources: the tags themselves, as they sit on the chain (blocks 960,463–469
// were read directly; see tools/coinbase-formats.md), cross-checked against
// mempool's published pool list — https://github.com/mempool/mining-pools.
// Hand-authored rather than vendored: a name a pool writes into a block is a
// fact off a public ledger, and this table is the book's own reading of which
// bytes belong to it.

// Each entry: the pool's name, where it can be read about, the patterns its
// signature takes (most specific first — the first to match wins), and what is
// known about where the signature sits in the scriptSig.
//
//   layout   the order of the fields the book can name, as observed or as read
//            out of the template builder's source
//   builder  whose template software writes it, where that is known
//   seen     heights this signature was read at, for anything claimed as
//            observed rather than cited
export const POOL_SIGNATURES = [
  {
    name: 'Foundry USA',
    link: 'https://foundrydigital.com/',
    patterns: [/\/Foundry USA Pool #dropgold\//],
    layout: 'height · counter · signature · bytes',
    seen: [960463, 960468],
  },
  {
    name: 'AntPool',
    link: 'https://www.antpool.com/',
    // The digits some blocks carry after the name may be AntPool's or may be
    // the counter leaning on it; the pattern takes only what is certain.
    patterns: [/Mined [Bb]y AntPool/, /\/AntPool\//],
    layout: 'height · bytes · signature · bytes',
    seen: [960464, 960465],
  },
  {
    name: 'F2Pool',
    link: 'https://www.f2pool.com/',
    // The fish and the padding are F2Pool's own; the single character after the
    // closing slash changes block to block and is left to the margin.
    patterns: [/\u{1F41F}[ \t]*\/F2Pool\//u, /\/F2Pool\//, /七彩神仙鱼/],
    layout: 'height · bytes · signature · bytes',
    seen: [960467, 960469],
  },
  {
    name: 'SECPOOL',
    link: 'https://www.secpool.com/',
    patterns: [/Mined [Bb]y Secpool/i],
    layout: 'height · bytes · signature · bytes',
    seen: [960466],
  },
  {
    name: 'MARA Pool',
    link: 'https://www.mara.com/',
    // "| MARA Made in USA 🇺🇸 |v05" — the flag and the version are the pool's.
    patterns: [/\| MARA Made in USA[^|]*\|v\d+/u, /MARA Made in USA/, /MARA Pool/],
    layout: 'height · template timestamp · signature · bytes',
    builder: 'btccom lineage (a template timestamp sits behind the height)',
    seen: [960281],
  },
  {
    name: 'ViaBTC',
    link: 'https://www.viabtc.com/',
    // The account name is the miner's, written by the pool at the miner's
    // request: part of the signature, and the reason two ViaBTC blocks rarely
    // carry the same one.
    patterns: [/\/ViaBTC\/Mined by [^/]*\//, /\/ViaBTC\//, /viabtc\.com deploy/],
    layout: 'height · counter · signature · bytes',
  },
  { name: 'Braiins Pool', link: 'https://braiins.com/pool', patterns: [/\/slush\//], layout: 'height · counter · signature', builder: 'ckpool lineage' },
  { name: 'ckpool', link: 'https://bitcointalk.org/index.php?topic=5296753', patterns: [/\/ckpool\//, /ckpool/], layout: 'height · counter · signature', builder: 'ckpool' },
  { name: 'OCEAN', link: 'https://ocean.xyz/', patterns: [/OCEAN\.XYZ/i], layout: 'height · signature · miner tag · counter', builder: 'DATUM Gateway' },
  { name: 'SpiderPool', link: 'https://www.spiderpool.com/', patterns: [/\/SpiderPool\//, /SpiderPool/] },
  { name: 'Luxor', link: 'https://luxor.tech/', patterns: [/\/LUXOR\//i, /Luxor Tech/] },
  { name: 'Binance Pool', link: 'https://pool.binance.com/', patterns: [/\/Binance\/?/] },
  { name: 'SBI Crypto', link: 'https://sbicrypto.com/', patterns: [/\/SBICrypto\.com Pool\//, /SBICrypto/] },
  { name: 'BTC.com', link: 'https://pool.btc.com/', patterns: [/\/BTC\.COM\//i], builder: 'btcpool (its own)' },
  { name: 'Poolin', link: 'https://www.poolin.com/', patterns: [/\/poolin\.com[^/]*\//i, /\/poolin\//i] },
  { name: 'ULTIMUSPOOL', link: 'https://www.ultimuspool.com/', patterns: [/\/ultimus\//i] },
  { name: 'WhitePool', link: 'https://whitepool.io/', patterns: [/WhitePool/i] },
  { name: 'KuCoinPool', link: 'https://www.kucoin.com/pool', patterns: [/KuCoinPool/i] },
  { name: 'Titan', link: 'https://titan.io/', patterns: [/Titan\.io/i] },
  { name: 'Terra Pool', link: 'https://terrapool.io/', patterns: [/terrapool\.io/i, /Validated with Clean Energy/i] },
  { name: 'Bitfury', link: 'https://bitfury.com/', patterns: [/\/BitFury\//i] },
];

// The signature inside a readable run, or null. Returns the pool, the matched
// text, and its bounds within the run -- which is what lets a caller quote
// exactly the pool's writing and no more.
//
// Earliest match wins, and a longer match beats a shorter one starting at the
// same place, so a pool whose patterns nest (/ViaBTC/Mined by x/ inside
// /ViaBTC/) is quoted at its fullest.
export function findSignature(text, table = POOL_SIGNATURES) {
  let best = null;
  for (const pool of table) {
    for (const pattern of pool.patterns) {
      const m = pattern.exec(text);
      if (!m || !m[0]) continue;
      const hit = { pool: pool.name, link: pool.link, text: m[0], start: m.index, end: m.index + m[0].length };
      if (!best || hit.start < best.start || (hit.start === best.start && hit.text.length > best.text.length)) best = hit;
      break;                                   // a pool's patterns are ordered; its first hit is its best
    }
  }
  return best;
}

// A readable run -> its parts, in order, with every character in exactly one:
//   { text }                 what the run holds either side of the signature
//   { text, pool, link }     the signature itself
// A run carrying no signature comes back as one part, unchanged, so a caller
// can treat the no-table case and the no-match case identically.
export function splitOnSignature(text, table = POOL_SIGNATURES) {
  const hit = findSignature(text, table);
  if (!hit) return [{ text }];
  const parts = [];
  if (hit.start > 0) parts.push({ text: text.slice(0, hit.start) });
  parts.push({ text: hit.text, pool: hit.pool, link: hit.link });
  if (hit.end < text.length) parts.push({ text: text.slice(hit.end) });
  return parts;
}

// The pool a whole scriptSig names, by the signatures in it -- the survey's
// question rather than the page's. Text is decoded by the caller (the book's
// readable-run scanner), so a signature can never be "found" inside bytes that
// merely spell it.
export function poolOf(texts, table = POOL_SIGNATURES) {
  for (const text of texts) {
    const hit = findSignature(text, table);
    if (hit) return hit;
  }
  return null;
}
