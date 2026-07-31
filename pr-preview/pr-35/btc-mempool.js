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
// … Two sources, each optional, degrading gracefully:
//   /mempool                    (any Esplora) -- totals: how far the contents
//                               extend (vsize ÷ 1 MvB);
//   /v1/fees/mempool-blocks     (mempool.space backend only) -- the queue cut
//                               into template-sized projected blocks, CPFP-
//                               aware, which is how many rows there are.
// Only the first projected chapter is a real forecast; each one deeper is
// more a statement about the queue now than about any future block -- so
// everything past the detailed entries collapses into one backlog row.
//
// What a row says is its place in the queue and nothing else. The counts,
// vsizes, fee ranges and etas the sources also carry are true of one node at
// one moment and of no block that will ever exist; a contents that printed
// them -- on the page or under the cursor -- would be lending the queue the
// authority of the record it sits beneath. The chapters this is about to
// become are worth listing. Their contents are not yet anything.
//
// The rows are dressed in the contents' own classes (.toc-entry.projected and
// friends): both pages carry that stylesheet, and a projected chapter should
// look the same wherever it is read.

import { entryHref } from './btc-contents.js';
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
// Each answer is checked for the whole shape of a mempool reading, not merely
// for having arrived: a mirror that serves something else at these paths (a
// proxy's error page, an unrelated API) would otherwise be set as a queue of
// undefined chapters. Only the vsizes are read from here, but a payload
// missing the rest is not a mempool answer, and is dropped whole. A reading
// with nothing left in it is no reading at all.
export async function readQueue(tip, mirrors = MEMPOOL_MIRRORS) {
  if (tip == null) return null;
  const [sum, blocks] = await Promise.all([
    anyMirror(mirrors, '/mempool'),
    anyMirror(mirrors, '/v1/fees/mempool-blocks'),
  ]);
  const num = (v) => typeof v === 'number' && Number.isFinite(v);
  const summary = sum && num(sum.data?.count) && num(sum.data?.vsize) ? sum.data : null;
  const queued = blocks && Array.isArray(blocks.data) && blocks.data.length
    && blocks.data.every((b) => num(b?.blockVSize) && num(b?.nTx) && num(b?.medianFee))
    ? blocks.data : null;
  if (!summary && !queued) return null;
  return { tip, summary, blocks: queued };
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

// One projected row, set like every other row in the contents: a name on the
// left, its reference on the right. A projected chapter's name is its place
// in the queue -- alpha, then the ones behind it -- because that is
// the only thing about it that is settled. Nothing hangs beneath the name on
// hover either: a figure whispered is still a figure printed. The reference
// keeps its note, which says only that the number is provisional. The whole
// row opens the book at that height.
function projEntryEl({ height, text, ref, refTitle }) {
  const row = document.createElement('a');
  row.className = 'toc-entry under-book projected';
  row.href = entryHref(String(height));
  const t = document.createElement('span');
  t.className = 'toc-title';
  t.textContent = text;
  const r = document.createElement('span');
  r.className = 'toc-ref';
  r.textContent = ref;
  if (refTitle) r.title = refTitle;
  row.append(t, r);
  return row;
}

// What to call the k-th chapter ahead of the tip. A letter, and only a
// letter: a number there reads as a quantity, and there is no quantity here
// to be had -- these are places in a line, lettered the way a proof letters
// its cases. Nor "block alpha": every row under this heading is a block, and
// the heading has said so. The Greek alphabet, since the book's own sigla are
// Greek, and it runs far past any queue depth a mirror will ever hand back;
// anything deeper falls back to the bare ordinal rather than an invented
// letter.
//
// Exported, because the book page names the same chapter when a reader opens
// one -- the row in the contents and the head of the draft it opens should
// call it the same thing.
const GREEK = ['alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'eta', 'theta',
  'iota', 'kappa', 'lambda', 'mu', 'nu', 'xi', 'omicron', 'pi', 'rho', 'sigma',
  'tau', 'upsilon', 'phi', 'chi', 'psi', 'omega'];
export const queueLabel = (k) => String(GREEK[k - 1] || k);

// And what closes them: not a figure, not a count of what is left, just the
// mark that a list has been cut short.
const BACKLOG = 'etcetera';

// The whole section from one reading: whatever the caller leads with (the
// contents hands in its appendix heading; the page's own header has already
// named it), the detailed projected chapters, and the backlog row that closes
// them. Nothing else. The figures the sources carry are read for two things
// only -- how many rows there are, and how far the last one reaches -- and
// then set aside.
export function buildQueue({ tip, summary, blocks }, lead = null) {
  const tipVolume = volumeBookChapter(tip).volume;
  const wrap = document.createElement('div');
  if (lead) wrap.append(lead);

  // Total queue depth in chapters: from the summary's vsize when we have it,
  // else from the projected blocks alone.
  const projVsize = blocks ? blocks.reduce((s, b) => s + b.blockVSize, 0) : 0;
  const chapters = Math.max(1, Math.ceil((summary ? summary.vsize : projVsize) / MVB));

  if (blocks && blocks.length) {
    // A real projected block never exceeds 1 MvB of vsize; a bigger final
    // entry is the backend's own aggregate of everything deeper.
    blocks.forEach((b, i) => {
      const height = tip + 1 + i;
      const isAggregate = i === blocks.length - 1 && b.blockVSize > 1.05 * MVB;
      if (!isAggregate) {
        wrap.append(projEntryEl({
          height,
          text: queueLabel(i + 1),
          ref: projRef(height, tipVolume),
          refTitle: `provisional — block ${height.toLocaleString()} (${expectedReference(height)}) if the queue holds; every block mined ahead of it renumbers the rest`,
        }));
      } else {
        // The backlog: everything past the detailed entries, one fading row.
        const span = Math.max(1, Math.round(b.blockVSize / MVB));
        wrap.append(projEntryEl({
          height,
          text: BACKLOG,
          ref: projRange(height, height + span - 1, tipVolume),
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
      text: BACKLOG,
      ref: projRange(tip + 1, tip + chapters, tipVolume),
      refTitle: 'provisional — the chapters the current queue would fill',
    }));
  }
  return wrap;
}
