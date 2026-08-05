// SPDX-License-Identifier: MIT OR Apache-2.0
//
// btc-mines.js — the mines, and how much of the hashing each is doing.
//
// Appendix I gathers the two ends of mining the chain will talk about: the
// queue a block is taken from (btc-mempool.js) and the hands that take it.
// This module is the second. It reads the last difficulty window — 2,016
// blocks, which is one β of the book and about a fortnight — attributes each
// chapter to a pool, and orders the pools by how many they won.
//
// ── Why the window is counted here rather than asked for ──────────────────
//
// mempool.space publishes a ranking at /v1/mining/pools/<period>, and it
// would be one call instead of a hundred and thirty-five. It is not used for
// the ordering, for a reason worth writing down: **the period is not
// validated.** `2w` returns HTTP 200 and the ALL-TIME distribution — byte for
// byte the same payload as `all`, and as `nonsense` — where 1w and 1m return
// what they say. A page that asked for two weeks would print the whole
// chain's history under a two-week heading and never know. (Checked against
// the live API; 2w, all and nonsense agreed to the byte, top pool "Unknown"
// with 220,594 blocks against 1w's Foundry USA with 271.)
//
// So the window is counted from the blocks themselves. That also makes it
// exactly the window the book already reads in — a difficulty epoch, the span
// a β names — rather than a rounded number of days, and it is the window
// Appendix I's own commentary argues for: long enough that a 30% pool's
// sampling error is under a point and a half, short enough to still be about
// the distribution that exists now.
//
// ── Whose reading says which pool ─────────────────────────────────────────
//
// mempool.space's, credited, and the book says so wherever a name is printed.
// Attribution is an inference from an unauthenticated tag — anyone may write
// /Foundry USA Pool/ into a coinbase — so it is a claim, and the book's rule
// for claims is that they carry a name. The bytes the claim rests on are
// printed beside it: each block's own coinbase signature, which IS the record.
//
// (The book's own table, web/btc-pools.js, reads 95% of a sampled fortnight
// and agreed with mempool on every block where both named a pool — 114 of
// 114. It is not what orders this shelf only because one source naming every
// block beats two sources naming most of it; the disagreement to worry about
// turned out not to exist.)
//
// ── What is banked ────────────────────────────────────────────────────────
//
// A mined block never changes, so each one's record is kept for good in the
// archive (btc-store.js, the `mined` store) and a later visit fetches only
// what is new — the same bargain the chapters strike. Only blocks six deep or
// more are banked, the depth the archive already treats as settled; the tip's
// own neighbourhood is re-read every time, because it can still move.

import { storePutMany, storeEntries } from './btc-store.js';
import { findSignature } from './btc-pools.js';

// The pool's own writing, cut to its own extent -- and nothing else.
//
// mempool's `coinbaseSignatureAscii` is not a signature. It is the WHOLE
// scriptSig decoded as latin1: the BIP34 height push, the extranonce, any
// merged-mining commitment and every run of padding, rendered as whatever
// characters those bytes happen to spell. A real one reads
//   \x03\xb0\xaa\x0e\x05s\xdf\xb9\x00/Foundry USA Pool #dropgold/"\x09\xbc\x0a\x00\x00\xbe!2\x0c\x07\x00
// and printing that as a pool's signature says a person wrote bytes nobody
// wrote -- the exact error tools/coinbase-formats.md records under "what may
// be quoted", where a page once printed seven bytes of F2Pool's counter as
// though they were writing.
//
// So the book's own table decides where the quotation closes: findSignature
// (web/btc-pools.js) matches the pool's tag and returns its bounds, and only
// what it matched is ever printed. Which is the division of labour the two
// readings were always owed -- mempool says WHOSE block it is, the book's
// table says WHICH BYTES the pool actually wrote. A tag the table cannot
// name yields null, and the leaf prints nothing rather than guessing:
// under-claiming costs a signature its line, over-claiming puts words in a
// pool's mouth.
//
// Idempotent, so it can be applied on the way in and again on the way out --
// which is what repairs a record banked before this cut existed.
export const signatureOf = (text) => {
  if (!text) return null;
  const hit = findSignature(String(text));
  return hit ? hit.text : null;
};

// One difficulty window: the book's own unit, and about a fortnight.
export const MINE_WINDOW = 2016;
// What the chain may still take back. Blocks shallower than this are re-read
// on every visit rather than banked -- the archive's own settled depth.
const UNSETTLED = 6;
// /v1/blocks/<height> answers with this many blocks, descending.
const PER_CALL = 15;
// Only a mempool.space-backed mirror serves the v1 block pages; a vanilla
// Esplora 404s them. Ordered so the one that can answer is asked first.
export const MINES_MIRRORS = ['https://mempool.space/api'];

// How many calls are in flight at once. The window is 135 calls on a cold
// archive; a handful at a time reads it in a few seconds without leaning on
// anyone's API.
const LANES = 6;

// The fees a chapter carried, in satoshis, or null where the source did not
// say -- which is not zero and must never print as zero.
export const feesOf = (b) => {
  const n = Number(b.extras?.totalFees);
  return Number.isFinite(n) ? n : null;
};

// A block's record, as small as it can be and still set a row: who mempool
// says mined it, when, how big it was, the coinbase's own signature -- the
// bytes the attribution is an inference FROM, so a reader can weigh the claim
// against the thing it reads -- and what the chapter paid in fees.
const recordOf = (b) => ({
  s: b.extras?.pool?.slug ?? null,
  n: b.extras?.pool?.name ?? null,
  l: b.extras?.pool?.link ?? null,
  t: b.timestamp,
  tx: b.tx_count,
  w: b.weight,
  sig: signatureOf(b.extras?.coinbaseSignatureAscii),
  // The fees the chapter carried, in satoshis -- what the mine collected
  // over and above the subsidy, which is the same for everyone and so says
  // nothing about the mine. Null where the source did not state it, which is
  // not zero and must not print as zero. Always DEFINED, so a record banked
  // before fees were kept -- where the field is missing outright -- can be
  // told apart from one whose fees the source would not state.
  f: feesOf(b),
});

// One page of the chain, from whichever mirror serves v1. Null when none
// will: the caller degrades to what it already has rather than inventing.
async function page(top, mirrors) {
  for (const base of mirrors) {
    try {
      const res = await fetch(`${base}/v1/blocks/${top}`);
      if (!res.ok) continue;
      const data = await res.json();
      if (Array.isArray(data) && data.length) return data;
    } catch { /* try the next mirror */ }
  }
  return null;
}

// The window, height by height. Returns a Map of height -> record, holding
// whatever could be read: a mirror that stops answering leaves the map short
// rather than empty, and every surface above states what it actually counted
// instead of assuming 2,016.
//
// `onProgress(counted, wanted)` is called as pages land, so a leaf can say
// how far the reading has got rather than holding a blank page.
//
// `onBanked(reading)` is called ONCE, with whatever the archive already held,
// before a single page is asked for -- and it is what makes a revisit feel
// like a revisit. A reader coming back to this leaf is missing only the
// chapters mined since they last looked: a handful, against the two thousand
// already on disk. Waiting on that handful before showing any of the two
// thousand would hide a shelf that is all but complete behind a request for
// the last half per cent of it. So the leaf draws what is banked at once and
// redraws when the rest lands. Not called where the archive held nothing --
// a first visit has nothing to draw, and says so instead.
export async function minedWindow(tip, { onProgress = null, onBanked = null, mirrors = MINES_MIRRORS, window = MINE_WINDOW } = {}) {
  const from = Math.max(0, tip - window + 1);
  const found = new Map();

  // What the archive already holds, in ONE pass. Asking for 2,016 heights
  // one at a time is 2,016 read transactions against a database every other
  // page is also using, which does not merely make this leaf slow -- it
  // queues everyone else's chapter lookups behind it. A cursor reads the
  // whole store in a single transaction instead. A banked height is settled
  // by definition (nothing shallow was ever written), so a hit needs no
  // second thought; anything outside this window is simply not ours.
  const wanted = tip - from + 1;
  for (const [key, rec] of await storeEntries('mined')) {
    const h = Number(key);
    if (!Number.isFinite(h) || h < from || h > tip - UNSETTLED || !rec) continue;
    // A record banked before a field existed is a miss, not a hit. Blocks are
    // permanent, so a stale one would otherwise sit in the archive for good
    // and its column would read empty forever; treating it as absent re-reads
    // that page once and overwrites it. `f` is the marker because it is the
    // newest field and is always written, null included.
    if (rec.f === undefined) continue;
    found.set(h, rec);
  }
  onProgress?.(found.size, wanted);
  // What the archive alone can say, handed over before anything is fetched.
  // A copy of the map, so a caller that keeps it is not surprised when the
  // pages that follow fill the original in underneath them.
  if (found.size && onBanked) onBanked({ tip, from, blocks: new Map(found) });

  // The pages still to ask for: every 15-block page whose span holds a
  // height the archive did not have. Asked for by the top of the page, the
  // way the v1 endpoint addresses them.
  const tops = [];
  for (let top = tip; top >= from; top -= PER_CALL) {
    let missing = false;
    for (let h = top; h > top - PER_CALL && h >= from; h--) if (!found.has(h)) { missing = true; break; }
    if (missing) tops.push(top);
  }

  let at = 0;
  const lane = async () => {
    while (at < tops.length) {
      const top = tops[at++];
      const blocks = await page(top, mirrors);
      if (!blocks) continue;                       // this page is simply missing
      const bank = [];
      for (const b of blocks) {
        if (typeof b?.height !== 'number' || b.height < from || b.height > tip) continue;
        const rec = recordOf(b);
        found.set(b.height, rec);
        if (b.height <= tip - UNSETTLED) bank.push([String(b.height), rec]);
      }
      // Banked a page at a time, and waited on: a reader who turns the leaf
      // the moment it draws would otherwise leave most of the window
      // uncommitted and pay for it again on the next visit.
      await storePutMany('mined', bank);
      onProgress?.(found.size, wanted);
    }
  };
  await Promise.all(Array.from({ length: Math.min(LANES, tops.length) }, lane));
  return { tip, from, blocks: found };
}

// A pool's share, and how much of that share is the lottery rather than the
// pool. The standard error of a count of N draws at rate p is √(p(1−p)/N) --
// which is the whole argument of this appendix's commentary, so the number it
// argues for is the number the shelf prints.
export const shareError = (won, counted) => {
  if (!counted) return 0;
  const p = won / counted;
  return Math.sqrt((p * (1 - p)) / counted);
};

// The window tallied into mines, most blocks first. A pool mempool could not
// name gathers under one unattributed heading rather than being dropped: the
// blocks were mined by somebody, and a distribution that quietly omitted them
// would not sum to the chain.
//
// The slug is what the URL carries, so an unnamed pool needs one too; it gets
// the one mempool uses for it, and failing that the book's own word for not
// knowing.
export const UNATTRIBUTED = 'unattributed';

export function tallyMines({ blocks, tip, from }) {
  const by = new Map();
  for (const [height, rec] of blocks) {
    const slug = rec.s || UNATTRIBUTED;
    let mine = by.get(slug);
    if (!mine) {
      mine = {
        slug,
        name: rec.n || 'Unattributed',
        link: rec.s ? rec.l : null,
        named: Boolean(rec.s),
        blocks: [],
      };
      by.set(slug, mine);
    }
    mine.blocks.push({ height, ...rec });
  }
  const counted = blocks.size;
  const mines = [...by.values()].map((m) => {
    m.blocks.sort((a, b) => b.height - a.height);   // newest first, as a record of recent work
    m.won = m.blocks.length;
    m.share = counted ? m.won / counted : 0;
    m.error = shareError(m.won, counted);
    return m;
  });
  // Dominance, which is what the shelf is ordered by; ties break by name so
  // the run is stable between readings, and the unattributed stand last
  // whatever they hold -- they are a residue, not a mine.
  mines.sort((a, b) => (a.named !== b.named ? (a.named ? -1 : 1)
    : b.won - a.won || a.name.localeCompare(b.name)));
  return { mines, counted, tip, from };
}

// The whole reading in one call, for a leaf that wants it that way.
export async function readMines(tip, opts = {}) {
  return tallyMines(await minedWindow(tip, opts));
}

// ── Naming the mines without counting them ────────────────────────────────
//
// The contents lists what the book holds; it does not measure. So it needs
// the mines' NAMES and their order, and never their shares -- and it should
// pay as little as possible for them. Two sources, in this order:
//
//   1. The archive, for nothing. Whatever the appendix banked when it last
//      counted is already on disk, so the contents tallies that and lists
//      exactly the mines that have leaves. Nothing backfills on its own --
//      exploration is the sync, as it is on the Ledger's own shelf.
//   2. One call, when the archive has nothing yet: mempool.space's ranking
//      over its 1w period, names and order only (~3.6 KB, 18 pools).
//
// The second is safe in the one direction that matters. Its period is about
// 1,060 blocks where the appendix's window is 2,016, so it reaches back half
// as far: every mine it names has certainly won a chapter inside the
// appendix's window, while a mine that won only in the older half goes
// unlisted. It can under-name the shelf and it cannot over-name it -- the
// same asymmetry the signature table keeps, where under-claiming costs a few
// bytes their quotation marks and over-claiming puts words in a mouth.

// The mines the archive already knows about, tallied from banked blocks and
// nothing else. Blocks outside the current window are ignored rather than
// pruned: the store holds a little more than a window, and a name that fell
// out of it is not a mine of this fortnight.
export async function bankedMines(tip, window = MINE_WINDOW) {
  const from = Math.max(0, tip - window + 1);
  const blocks = new Map();
  for (const [key, rec] of await storeEntries('mined')) {
    const h = Number(key);
    if (!Number.isFinite(h) || h < from || h > tip || !rec) continue;
    blocks.set(h, rec);
  }
  return tallyMines({ blocks, tip, from });
}

// The names alone, in one call. Returns the same shape the shelf is drawn
// from, with `won` carrying that ranking's own count -- which is over a
// different span and so is never printed as a share.
export async function rankedMines(mirrors = MINES_MIRRORS) {
  for (const base of mirrors) {
    try {
      const res = await fetch(`${base}/v1/mining/pools/1w`);
      if (!res.ok) continue;
      const data = await res.json();
      if (!Array.isArray(data?.pools) || !data.pools.length) continue;
      const mines = data.pools
        .filter((p) => p && p.slug)
        .map((p) => ({
          slug: p.slug,
          name: p.slug === 'unknown' ? 'Unattributed' : String(p.name || p.slug),
          link: p.link || null,
          named: p.slug !== 'unknown',
          won: Number(p.blockCount) || 0,
        }))
        .sort((a, b) => (a.named !== b.named ? (a.named ? -1 : 1)
          : b.won - a.won || a.name.localeCompare(b.name)));
      return { mines, counted: Number(data.blockCount) || 0, ranked: true };
    } catch { /* try the next mirror */ }
  }
  return null;
}

// What the contents actually calls: the archive if it has anything, else the
// one call, else nothing at all -- in which case the leaf lists no mines and
// says nothing about them, the shelf being one turn down either way.
export async function minesForContents(tip) {
  if (tip != null) {
    const banked = await bankedMines(tip);
    if (banked.mines.length) return { ...banked, ranked: false };
  }
  return await rankedMines();
}

// The floor a mine has to clear to be named in the CONTENTS. A contents lists
// the large things and lets the leaf hold the rest -- and here "large" has a
// meaning the book can defend rather than a round number of rows: below one
// per cent, a window this long cannot tell one pool from another. Appendix
// I's own commentary does the arithmetic -- holding a share p to within a
// quarter of itself takes about 64·(1−p)/p blocks, which at p = 1% is more
// than six thousand, three times the window. So a 1% pool and a 0.4% pool are
// the same measurement here, and ranking them against each other in a table
// of contents would be printing noise as if it were an order.
//
// The shelf itself lists every mine, down to the one that won a single
// chapter. Nothing is hidden; it is one turn away, and the caller says so.
export const CONTENTS_FLOOR = 0.01;

// The mines a contents should name, and the count of those it left to the
// leaf. The unattributed row is kept whatever its size -- it is not a mine
// competing for rank but the remainder that makes the distribution sum to the
// chain, and dropping it would quietly overstate everyone above it.
export function largestMines(read, floor = CONTENTS_FLOOR) {
  if (!read || !read.mines.length) return { mines: [], rest: 0 };
  const counted = read.counted || read.mines.reduce((s, m) => s + m.won, 0);
  const big = read.mines.filter((m) => !m.named || (counted ? m.won / counted : 0) >= floor);
  return { mines: big, rest: read.mines.length - big.length };
}

// ── What the whole network is doing ───────────────────────────────────────
//
// The one figure about mining that is not a share: how fast the whole network
// is hashing. Nobody observes it. It is inferred from the difficulty and the
// rate blocks are arriving, which is why this appendix's own commentary
// singles it out -- a ratio of blocks won cancels the noise in that estimate,
// and an absolute figure in EH/s inherits it on top of everything else. So
// the leaf prints it as what it is: somebody's estimate, named.
export async function networkHashrate(mirrors = MINES_MIRRORS) {
  for (const base of mirrors) {
    try {
      const res = await fetch(`${base}/v1/mining/hashrate/3d`);
      if (!res.ok) continue;
      const d = await res.json();
      const hs = Number(d?.currentHashrate);
      if (Number.isFinite(hs) && hs > 0) return { hashrate: hs, difficulty: Number(d?.currentDifficulty) || null };
    } catch { /* try the next mirror */ }
  }
  return null;
}

// A hash rate in the largest unit that leaves a figure worth reading: three
// significant figures at the top of the scale, one decimal below a hundred.
// Null in, null out -- a leaf prints nothing rather than a zero it did not
// measure.
export function formatHashrate(hs) {
  const n = Number(hs);
  if (!Number.isFinite(n) || n <= 0) return null;
  const SCALE = [[1e21, 'ZH/s'], [1e18, 'EH/s'], [1e15, 'PH/s'], [1e12, 'TH/s'],
    [1e9, 'GH/s'], [1e6, 'MH/s'], [1e3, 'kH/s']];
  for (const [scale, label] of SCALE) {
    if (n >= scale) {
      const v = n / scale;
      return `${v >= 100 ? Math.round(v).toLocaleString('en-US') : v.toFixed(1)} ${label}`;
    }
  }
  return `${Math.round(n)} H/s`;
}

// A share as the shelf prints it: the figure and its own uncertainty, because
// a point estimate published bare is the thing this appendix exists to argue
// against. One decimal on both -- the error is rarely under a tenth of a
// point, and more digits would claim a precision the count does not have.
export const sharePct = (m) => `${(100 * m.share).toFixed(1)}%`;
export const shareSay = (m) => `${(100 * m.share).toFixed(1)}% ± ${(100 * m.error).toFixed(1)}`;
