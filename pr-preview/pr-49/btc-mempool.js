// SPDX-License-Identifier: MIT OR Apache-2.0
//
// btc-mempool.js — the queue of transactions no block has yet recorded, read
// as the chapters it is about to become. Where it is set is Appendix I's
// contents leaf, continuing the list past the chain tip; the appendix's own
// page names the part and descends into the first draft chapter rather than
// listing them, listing being the contents' business.
//
// And it is listed the way a volume's contents lists the chapters kept from
// it: a Book heading over the rows that share one, each row citing only what
// the heading has not already named. A projected chapter belongs to a book
// the same way a mined one does — the arithmetic knows nothing about mining —
// so the queue's rows are set by the same rules, in the □ the expected
// chapter wears instead of the ■ it has not earned.
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
// friends, from btc-toc.css): a projected chapter should look like the mined
// ones it is queued behind, in the pencil rather than the ink.

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
// if the queue does. Each level a heading above the row has already named is
// left off, as it is on a volume's leaf; the volume goes unwritten while it
// is the tip's own, no head here having named one.
function projRef(height, tipVolume, underBook = false) {
  const p = volumeBookChapter(height);
  // Under a Book heading only the chapter is left to cite, exactly as in a
  // volume's contents.
  if (underBook) return `□${p.chapter}`;
  const vol = p.volume === tipVolume ? '' : `${toRoman(p.volume)} `;
  return `${vol}β${p.book} □${p.chapter}`;
}
// A span of projected chapters -- the backlog's rows. Within one book the
// book is named once and the marks run on, the book's own idiom for a range
// (a volume leaf reads ■1 – ■2,016); across a book boundary each end is
// cited in full, since the second names a book the first did not.
function projRange(from, to, tipVolume, underBook = false) {
  const a = volumeBookChapter(from), b = volumeBookChapter(to);
  const sameBook = a.volume === b.volume && a.book === b.book;
  // A range reaching past the heading's own book still cites its far end in
  // full: the heading did not name that book.
  return `${projRef(from, tipVolume, underBook)} – ${sameBook ? `□${b.chapter}` : projRef(to, tipVolume)}`;
}

// The heading a run of projected chapters sits under, set as a volume's
// contents sets one: the book spelled out, no β -- that sigil rides the
// compact tail references alone. The volume joins it only where the queue has
// crossed out of the tip's own, since no head above these rows names one.
function bookHead(height, tipVolume) {
  const p = volumeBookChapter(height);
  const d = document.createElement('div');
  d.className = 'toc-book';
  d.textContent = p.volume === tipVolume ? `Book ${p.book}` : `Volume ${toRoman(p.volume)} · Book ${p.book}`;
  return d;
}

// One projected row, set like every other row in the contents: a name on the
// left, its reference on the right. A projected chapter's name is its place
// in the queue -- alpha, then the ones behind it -- because that is
// the only thing about it that is settled. Nothing hangs beneath the name on
// hover either: a figure whispered is still a figure printed. The reference
// keeps its note, which says only that the number is provisional. The whole
// row opens the book at that height.
function projEntryEl({ height, text, ref, refTitle, underBook }) {
  const row = document.createElement('a');
  row.className = 'toc-entry projected' + (underBook ? ' under-book' : '');
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

  // What the rows are, before deciding how they are grouped: a row is a
  // height, the name it carries, and how far it reaches (`to`, for the
  // backlog's span).
  const rows = [];
  if (blocks && blocks.length) {
    // A real projected block never exceeds 1 MvB of vsize; a bigger final
    // entry is the backend's own aggregate of everything deeper.
    blocks.forEach((b, i) => {
      const height = tip + 1 + i;
      const isAggregate = i === blocks.length - 1 && b.blockVSize > 1.05 * MVB;
      if (!isAggregate) {
        rows.push({
          height,
          text: queueLabel(i + 1),
          refTitle: `provisional — block ${height.toLocaleString()} (${expectedReference(height)}) if the queue holds; every block mined ahead of it renumbers the rest`,
        });
      } else {
        // The backlog: everything past the detailed entries, one fading row.
        const span = Math.max(1, Math.round(b.blockVSize / MVB));
        rows.push({
          height,
          to: height + span - 1,
          text: BACKLOG,
          refTitle: 'the deep queue has no reliable ordering — these chapters are a guess about the queue today, not about any future block',
        });
      }
    });
  } else if (summary) {
    // No mempool.space backend reachable: the depth alone, from any Esplora.
    // One row for the whole queue, and the whole queue is a backlog until
    // something can cut it into blocks.
    rows.push({
      height: tip + 1,
      to: tip + chapters,
      text: BACKLOG,
      refTitle: 'provisional — the chapters the current queue would fill',
    });
  }

  // And how they are grouped: by the book they fall in, which is how a
  // volume's contents groups the chapters kept from it -- a Book heading
  // wherever two or more consecutive rows share one, and then each row cites
  // only what that heading has not already said. The queue is a run of
  // consecutive heights, so a book's rows are contiguous by construction, and
  // the heading changes exactly where the queue crosses a retarget. One row
  // alone keeps its book in its own reference rather than earning a heading
  // for itself, the same rule and for the same reason: a heading over a
  // single row says nothing the row does not.
  const bookOf = (h) => { const p = volumeBookChapter(h); return `${p.volume}.${p.book}`; };
  for (let i = 0; i < rows.length;) {
    let j = i + 1;
    while (j < rows.length && bookOf(rows[j].height) === bookOf(rows[i].height)) j++;
    const underBook = j - i >= 2;
    if (underBook) wrap.append(bookHead(rows[i].height, tipVolume));
    for (let k = i; k < j; k++) {
      const row = rows[k];
      wrap.append(projEntryEl({
        ...row,
        underBook,
        ref: row.to == null
          ? projRef(row.height, tipVolume, underBook)
          : projRange(row.height, row.to, tipVolume, underBook),
      }));
    }
    i = j;
  }
  return wrap;
}
