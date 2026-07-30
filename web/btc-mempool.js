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
  };
}

// Fee rates arrive as floats; one decimal under 10 sat/vB, whole above.
const fmtFee = (f) => f >= 10 ? String(Math.round(f)) : String(Math.round(f * 10) / 10);

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

// One projected row, set like every other row in the contents: a name on the
// left, its reference on the right. A projected chapter's name is its place
// in the queue -- the next block, then the ones behind it -- because that is
// the only thing about it that is settled; its contents, its wait and its
// fees are all statements about the queue at the moment of reading, so they
// hang on the row as its hover rather than as figures on the page. The whole
// row opens the book at that height.
function projEntryEl({ height, text, textTitle, ref, refTitle }) {
  const row = document.createElement('a');
  row.className = 'toc-entry under-book projected';
  row.href = entryHref(String(height));
  const t = document.createElement('span');
  t.className = 'toc-title';
  t.textContent = text;
  if (textTitle) t.title = textTitle;
  const r = document.createElement('span');
  r.className = 'toc-ref';
  r.textContent = ref;
  if (refTitle) r.title = refTitle;
  row.append(t, r);
  return row;
}

// What to call the k-th chapter ahead of the tip. The first is the one a
// reader is actually waiting on, and it earns the plainer name.
const queueLabel = (k) => (k === 1 ? 'next block' : `mempool block ${k}`);

// The whole section from one reading: whatever the caller leads with (the
// contents hands in its appendix heading; the page's own header has already
// named it), the detailed projected chapters, and the backlog row that closes
// them. Nothing else -- the figures are the queue's, not the book's, and they
// are read off a row rather than printed beneath the list.
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

  // What the backlog row says on hover: the whole queue's depth, and the floor
  // beneath which a full pool sheds from the bottom. These used to close the
  // list as a line of figures; they belong to the row they describe.
  const backlogFigures = () => {
    if (!summary) return '';
    let s = `${(summary.vsize / MVB).toFixed(1)} MvB waiting in all · ${summary.count.toLocaleString()} transactions · ≈ ${chapters} chapters at ~10 min each`;
    if (minFee != null && minFee > 1) {
      // The histogram is (feerate, vsize) bins, highest first; what sits at
      // or below the purge floor is the first to be forgotten.
      const atRisk = (summary.fee_histogram || []).reduce((s2, [r, v]) => r <= minFee ? s2 + v : s2, 0);
      s += ` · eviction floor ≈ ${fmtFee(minFee)} sat/vB`;
      if (atRisk > MVB / 20) s += `, the ${(atRisk / MVB).toFixed(1)} MvB at it first to be forgotten`;
    }
    return `${s}. Everything here expires if unmined for two weeks`;
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
          text: queueLabel(i + 1),
          textTitle: `${b.nTx.toLocaleString()} transactions, ${(b.blockVSize / MVB).toFixed(2)} MvB — median ~${fmtFee(b.medianFee)} sat/vB, fees ${lo}–${hi} sat/vB, ${(b.totalFees / 1e8).toFixed(3)} BTC in total. ${etaTitleFor(i + 1)}`,
          ref: projRef(height, tipVolume),
          refTitle: `provisional — block ${height.toLocaleString()} (${expectedReference(height)}) if the queue holds; every block mined ahead of it renumbers the rest`,
        }));
      } else {
        // The backlog: everything past the detailed entries, one fading row.
        const span = Math.max(1, Math.round(b.blockVSize / MVB));
        const last = height + span - 1;
        wrap.append(projEntryEl({
          height,
          text: 'backlog',
          textTitle: `${b.nTx.toLocaleString()} transactions across ≈ ${span} more chapters, ${(b.blockVSize / MVB).toFixed(1)} MvB below ~${fmtFee(b.medianFee)} sat/vB`
            + `, clearing ${blocksEta(i + span)} from now at current throughput if nothing better-paying arrives first. ${backlogFigures()}`,
          ref: projRange(height, last, tipVolume),
          refTitle: 'the deep queue has no reliable ordering — these chapters are a guess about the queue today, not about any future block',
        }));
      }
    });
  } else if (summary) {
    // No mempool.space backend reachable: the depth alone, from any Esplora.
    // One row for the whole queue, and the whole queue is a backlog until
    // something can cut it into blocks.
    wrap.append(projEntryEl({
      height: tip + 1,
      text: 'backlog',
      textTitle: `${backlogFigures()}. This mirror serves only mempool totals — a mempool.space-backed source cuts the queue into projected blocks`,
      ref: projRange(tip + 1, tip + chapters, tipVolume),
      refTitle: 'provisional — the chapters the current queue would fill',
    }));
  }
  return wrap;
}
