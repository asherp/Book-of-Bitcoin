// SPDX-License-Identifier: MIT OR Apache-2.0
//
// btc-mempool.js — the queue of transactions no block has yet recorded, read
// as the chapters it is about to become. Shared by the two places that set
// it: the table of contents, where it is Appendix I's rows continuing the
// list past the chain tip, and the appendix's own page, where it is the
// whole leaf.
//
// The queue is ordered the way a miner would take it (highest package fee
// rate first), so it reads as provisional chapters at heights tip+1, tip+2,
// … with an expected arrival instead of a recorded date. Three sources, each
// optional, degrading gracefully:
//   /mempool                    (any Esplora) -- totals + fee histogram: how
//                               far the contents extend (vsize ÷ 1 MvB) and
//                               where the eviction floor sits;
//   /v1/fees/mempool-blocks     (mempool.space backend only) -- the queue cut
//                               into template-sized projected blocks, CPFP-
//                               aware, each with tx count and fee figures;
//   /v1/fees/recommended        (mempool.space backend only) -- minimumFee,
//                               the purge floor.
// Only the first projected chapter is a real forecast; each one deeper is
// more a statement about the queue now than about any future block -- so
// everything past the detailed entries collapses into one backlog row, and
// each row's hover title carries its caveats.
//
// The rows are dressed in the contents' own classes (.toc-entry.projected and
// friends): both pages carry that stylesheet, and a projected chapter should
// look the same wherever it is read.

import { blocksEta, entryHref } from './btc-contents.js';
import { volumeBookChapter, toRoman, expectedReference } from './btc-citation.js';

export const MVB = 1_000_000;   // one block's worth of virtual bytes
export const MEMPOOL_MIRRORS = ['https://blockstream.info/api', 'https://mempool.space/api'];

// Try a path against each mirror in turn (the v1 paths only answer on a
// mempool.space-backed mirror; vanilla Esplora 404s and the loop moves on).
async function anyMirror(mirrors, path) {
  for (const base of mirrors) {
    try {
      const res = await fetch(`${base}${path}`);
      if (res.ok) return { data: await res.json(), base };
    } catch { /* try the next mirror */ }
  }
  return null;
}

// The chain tip, for a caller that has not already fetched one.
export async function chainTip(mirrors = MEMPOOL_MIRRORS) {
  for (const base of mirrors) {
    try {
      const res = await fetch(`${base}/blocks/tip/height`);
      if (res.ok) return Number((await res.text()).trim());
    } catch { /* try the next mirror */ }
  }
  return null;
}

// One reading of the queue, or null when nowhere could answer -- in which
// case the contents simply end at the tip, and the appendix's page says so.
// Each answer is checked for the figures it is read for, not merely for
// having arrived: a mirror that serves something else at these paths (a
// proxy's error page, an unrelated API) would otherwise be set as a queue
// of undefined transactions. A source that does not hold up is dropped, and
// a reading with nothing left in it is no reading at all.
export async function readQueue(tip, mirrors = MEMPOOL_MIRRORS) {
  if (tip == null) return null;
  const [sum, blocks, rec] = await Promise.all([
    anyMirror(mirrors, '/mempool'),
    anyMirror(mirrors, '/v1/fees/mempool-blocks'),
    anyMirror(mirrors, '/v1/fees/recommended'),
  ]);
  const num = (v) => typeof v === 'number' && Number.isFinite(v);
  const summary = sum && num(sum.data?.count) && num(sum.data?.vsize) ? sum.data : null;
  const queued = blocks && Array.isArray(blocks.data) && blocks.data.length
    && blocks.data.every((b) => num(b?.blockVSize) && num(b?.nTx) && num(b?.medianFee))
    ? blocks.data : null;
  if (!summary && !queued) return null;
  return {
    tip,
    summary,
    blocks: queued,
    minFee: rec && num(rec.data?.minimumFee) ? rec.data.minimumFee : null,
    srcBase: (queued ? blocks : sum).base,
  };
}

const hostOf = (url) => { try { return new URL(url).host; } catch { return url; } };
// Fee rates arrive as floats; one decimal under 10 sat/vB, whole above.
const fmtFee = (f) => f >= 10 ? String(Math.round(f)) : String(Math.round(f * 10) / 10);

// Which node's queue this is, and when it was read. Every node's mempool
// differs, and none of this survives the next block, so the reading is
// stamped wherever it is shown.
export function sourceLine(srcBase) {
  const src = document.createElement('span');
  src.className = 'toc-proj-src';
  const at = new Date();
  const hh = String(at.getUTCHours()).padStart(2, '0'), mm = String(at.getUTCMinutes()).padStart(2, '0');
  src.textContent = `as seen from ${hostOf(srcBase)} · ${hh}:${mm} UTC`;
  src.title = 'a mempool is one node’s view of the queue — every node’s differs, and this page is a snapshot';
  return src;
}

// The provisional reference for a not-yet-mined height: the expected-chapter
// mark □ where a mined chapter's reference wears ■ -- the number holds only
// if the queue does. The volume is left off while it is the tip's own, as a
// row under a Volume heading leaves it off.
function projRef(height, tipVolume) {
  const p = volumeBookChapter(height);
  const vol = p.volume === tipVolume ? '' : `${toRoman(p.volume)} `;
  return `${vol}β${p.book} □${p.chapter}`;
}
// A span of projected chapters -- the backlog's rows. Within one book the
// book is named once and the marks run on, the book's own idiom for a range
// (a volume leaf reads ■1 – ■2,016); across a book boundary each end is
// cited in full, since the second names a book the first did not.
function projRange(from, to, tipVolume) {
  const a = volumeBookChapter(from), b = volumeBookChapter(to);
  const sameBook = a.volume === b.volume && a.book === b.book;
  return `${projRef(from, tipVolume)} – ${sameBook ? `□${b.chapter}` : projRef(to, tipVolume)}`;
}

// One projected row: expected wait, then the row's text, then its
// provisional reference; the whole row opens the book at that height, which
// answers with the chapter's place in the queue.
function projEntryEl({ height, eta, etaTitle, text, textTitle, ref, refTitle }) {
  const row = document.createElement('a');
  row.className = 'toc-entry under-book projected';
  row.href = entryHref(String(height));
  const etaEl = document.createElement('span');
  etaEl.className = 'toc-proj-eta';
  etaEl.textContent = eta;
  if (etaTitle) etaEl.title = etaTitle;
  const t = document.createElement('span');
  t.className = 'toc-title';
  t.textContent = text;
  if (textTitle) t.title = textTitle;
  const r = document.createElement('span');
  r.className = 'toc-ref';
  r.textContent = ref;
  if (refTitle) r.title = refTitle;
  row.append(etaEl, t, r);
  return row;
}

// The whole section from one reading: whatever the caller leads with (the
// contents hands in its appendix heading; the page's own header has already
// named it), the detailed projected chapters, the backlog row, and the
// closing figures.
export function buildQueue({ tip, summary, blocks, minFee }, lead = null) {
  const tipVolume = volumeBookChapter(tip).volume;
  const wrap = document.createElement('div');
  if (lead) wrap.append(lead);

  // Total queue depth in chapters: from the summary's vsize when we have it,
  // else from the projected blocks alone.
  const projVsize = blocks ? blocks.reduce((s, b) => s + b.blockVSize, 0) : 0;
  const chapters = Math.max(1, Math.ceil((summary ? summary.vsize : projVsize) / MVB));

  const etaTitleFor = (k) => {
    const spread = Math.round(10 * Math.sqrt(k));
    return `eta about ${k * 10} min, give or take ${spread} — block arrivals average one per ten minutes`;
  };

  if (blocks && blocks.length) {
    // A real projected block never exceeds 1 MvB of vsize; a bigger final
    // entry is the backend's own aggregate of everything deeper.
    blocks.forEach((b, i) => {
      const height = tip + 1 + i;
      const isAggregate = i === blocks.length - 1 && b.blockVSize > 1.05 * MVB;
      if (!isAggregate) {
        const lo = fmtFee(b.feeRange[0] ?? b.medianFee), hi = fmtFee(b.feeRange[b.feeRange.length - 1] ?? b.medianFee);
        wrap.append(projEntryEl({
          height,
          eta: blocksEta(i + 1), etaTitle: etaTitleFor(i + 1),
          text: `${b.nTx.toLocaleString()} § · ~${fmtFee(b.medianFee)} sat/vB`,
          textTitle: `${b.nTx.toLocaleString()} transactions, ${(b.blockVSize / MVB).toFixed(2)} MvB — fees ${lo}–${hi} sat/vB, ${(b.totalFees / 1e8).toFixed(3)} BTC in total`,
          ref: projRef(height, tipVolume),
          refTitle: `provisional — block ${height.toLocaleString()} (${expectedReference(height)}) if the queue holds; every block mined ahead of it renumbers the rest`,
        }));
      } else {
        // The backlog: everything past the detailed entries, one fading row.
        const span = Math.max(1, Math.round(b.blockVSize / MVB));
        const last = height + span - 1;
        wrap.append(projEntryEl({
          height,
          eta: '⋯', etaTitle: `clearing ${blocksEta(i + span)} from now at current throughput — if nothing better-paying arrives first`,
          text: `the backlog — ${b.nTx.toLocaleString()} § across ≈ ${span} more chapters`,
          textTitle: `${(b.blockVSize / MVB).toFixed(1)} MvB of queued transactions below ~${fmtFee(b.medianFee)} sat/vB`,
          ref: projRange(height, last, tipVolume),
          refTitle: 'the deep queue has no reliable ordering — these chapters are a guess about the queue today, not about any future block',
        }));
      }
    });
  } else if (summary) {
    // No mempool.space backend reachable: the depth alone, from any Esplora.
    wrap.append(projEntryEl({
      height: tip + 1,
      eta: blocksEta(1), etaTitle: etaTitleFor(1),
      text: `${summary.count.toLocaleString()} § waiting across ≈ ${chapters} chapters`,
      textTitle: 'this mirror serves only mempool totals — a mempool.space-backed source adds per-chapter projections',
      ref: projRange(tip + 1, tip + chapters, tipVolume),
      refTitle: 'provisional — the chapters the current queue would fill',
    }));
  }

  // The closing figures: how much is waiting, and the floor beneath which
  // the pool sheds transactions when it fills.
  if (summary) {
    const note = document.createElement('div');
    note.className = 'toc-proj-note';
    let s = `${(summary.vsize / MVB).toFixed(1)} MvB waiting · ${summary.count.toLocaleString()} transactions · ≈ ${chapters} chapters at ~10 min each`;
    if (minFee != null && minFee > 1) {
      // The histogram is (feerate, vsize) bins, highest first; what sits at
      // or below the purge floor is the first to be forgotten.
      const atRisk = (summary.fee_histogram || []).reduce((s2, [r, v]) => r <= minFee ? s2 + v : s2, 0);
      s += ` · eviction floor ≈ ${fmtFee(minFee)} sat/vB`;
      if (atRisk > MVB / 20) s += ` — the ${(atRisk / MVB).toFixed(1)} MvB at it first to be forgotten`;
    }
    note.textContent = s;
    note.title = 'transactions the network holds but no block has recorded; a full mempool evicts from the bottom of the fee range, and everything here expires if unmined for two weeks';
    wrap.append(note);
  }
  return wrap;
}
