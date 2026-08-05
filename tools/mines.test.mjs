// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/mines.test.mjs — the mines, tallied. What Appendix I's shelf is
// ordered by, and what each mine's leaf states about its own share, is
// arithmetic over a window of blocks; this pins that arithmetic offline, with
// no chain and no browser in the loop.
//
// The fetching half (minedWindow) is not exercised here — it is network and
// IndexedDB, and neither belongs in a bare checkout's test run. What is
// exercised is everything a reader actually reads: who is on the shelf, in
// what order, holding what share, with what error bar.
//
//   node --test tools/mines.test.mjs

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  tallyMines, shareError, shareSay, largestMines,
  UNATTRIBUTED, MINE_WINDOW, CONTENTS_FLOOR,
} from '../web/btc-mines.js';

// A window built to order: `spec` is slug -> how many blocks it won, laid
// down newest-first from `tip` so the heights are real and contiguous.
function windowOf(spec, tip = 900_000) {
  const blocks = new Map();
  let h = tip;
  for (const [slug, n] of Object.entries(spec)) {
    for (let i = 0; i < n; i++, h--) {
      blocks.set(h, slug === UNATTRIBUTED
        ? { s: null, n: null, l: null, t: 1_700_000_000 + h, tx: 2000, w: 3_993_000, sig: null }
        : { s: slug, n: slug.toUpperCase(), l: `https://${slug}.example`, t: 1_700_000_000 + h, tx: 2000, w: 3_993_000, sig: `/${slug}/` });
    }
  }
  return { blocks, tip, from: h + 1 };
}

test('the window is one difficulty epoch — the book\'s own unit, not a round number of days', () => {
  assert.equal(MINE_WINDOW, 2016);
});

test('mines are ordered by chapters won, which is what dominance means', () => {
  const { mines, counted } = tallyMines(windowOf({ small: 10, big: 100, middling: 50 }));
  assert.deepEqual(mines.map((m) => m.slug), ['big', 'middling', 'small']);
  assert.equal(counted, 160);
  assert.equal(mines[0].won, 100);
  assert.ok(Math.abs(mines[0].share - 100 / 160) < 1e-12);
});

test('a tie breaks by name, so the shelf does not reshuffle between readings', () => {
  const first = tallyMines(windowOf({ zulu: 20, alpha: 20 })).mines.map((m) => m.slug);
  const again = tallyMines(windowOf({ alpha: 20, zulu: 20 })).mines.map((m) => m.slug);
  assert.deepEqual(first, ['alpha', 'zulu']);
  assert.deepEqual(first, again);
});

test('the unattributed are counted and kept, and stand last however much they hold', () => {
  // More unattributed than anyone else: still last, because a residue is not
  // a mine. Dropping them instead would leave a distribution that does not
  // sum to the chain, which is the one thing it must do.
  const { mines, counted } = tallyMines(windowOf({ [UNATTRIBUTED]: 90, real: 10 }));
  assert.equal(counted, 100);
  assert.deepEqual(mines.map((m) => m.slug), ['real', UNATTRIBUTED]);
  assert.equal(mines.at(-1).named, false);
  assert.equal(mines.at(-1).won, 90);
  assert.ok(Math.abs(mines.reduce((s, m) => s + m.share, 0) - 1) < 1e-12);
});

test('every block lands in exactly one mine, and each mine keeps its chapters newest first', () => {
  const { mines, counted } = tallyMines(windowOf({ a: 5, b: 7 }));
  assert.equal(mines.reduce((s, m) => s + m.blocks.length, 0), counted);
  for (const m of mines) {
    const heights = m.blocks.map((b) => b.height);
    assert.deepEqual(heights, [...heights].sort((x, y) => y - x), `${m.slug} is not newest-first`);
  }
});

test('the error bar is the binomial standard error the commentary argues for', () => {
  // A 30% pool over a day of blocks: the ±3.8 points Appendix I's reading
  // opens with, which is the whole reason the window is a fortnight and not
  // a day.
  assert.ok(Math.abs(100 * shareError(43, 144) - 3.8) < 0.1);
  // The same pool over one difficulty window: under a point and a half.
  assert.ok(100 * shareError(605, 2016) < 1.5);
  // A share of everything, or of nothing, is not uncertain at all.
  assert.equal(shareError(0, 2016), 0);
  assert.equal(shareError(2016, 2016), 0);
  assert.equal(shareError(1, 0), 0);            // nothing counted: no claim to make
});

test('a share is never printed without the uncertainty beside it', () => {
  const { mines } = tallyMines(windowOf({ big: 605, rest: 1411 }));
  const said = shareSay(mines.find((m) => m.slug === 'big'));
  assert.match(said, /^\d+\.\d% ± \d+\.\d$/);
  assert.ok(said.startsWith('30.0%'), said);
});

test('the contents names the largest mines and counts the rest, never hiding them', () => {
  // 2,016 chapters: three mines well clear of the floor, three under it.
  const read = tallyMines(windowOf({
    big: 700, mid: 600, small: 656, tiny: 10, tinier: 10, [UNATTRIBUTED]: 40,
  }));
  const { mines, rest } = largestMines(read);
  const named = mines.map((m) => m.slug);
  assert.ok(named.includes('big') && named.includes('mid') && named.includes('small'));
  assert.ok(!named.includes('tiny') && !named.includes('tinier'), 'a mine under the floor is left to the shelf');
  assert.equal(rest, 2, 'and the ones left out are counted, so the cap is never silent');
});

test('the unattributed row survives the floor whatever its size', () => {
  // Below one per cent, but it is the remainder rather than a mine competing
  // for rank -- dropping it would quietly overstate everyone above it.
  const read = tallyMines(windowOf({ big: 2000, [UNATTRIBUTED]: 16 }));
  const { mines, rest } = largestMines(read);
  assert.ok(16 / 2016 < CONTENTS_FLOOR);
  assert.deepEqual(mines.map((m) => m.slug), ['big', UNATTRIBUTED]);
  assert.equal(rest, 0);
});

test('the floor is a share, so it holds over a ranking counted on a different span', () => {
  // The cold path counts about 1,060 blocks, not 2,016; the cut has to be a
  // proportion or it would keep a different set of mines on each path.
  const read = { counted: 1060, mines: [
    { slug: 'a', name: 'A', named: true, won: 270 },
    { slug: 'b', name: 'B', named: true, won: 11 },   // 1.04% — kept
    { slug: 'c', name: 'C', named: true, won: 9 },    // 0.85% — left to the shelf
  ] };
  const { mines, rest } = largestMines(read);
  assert.deepEqual(mines.map((m) => m.slug), ['a', 'b']);
  assert.equal(rest, 1);
});

test('an empty window claims nothing rather than dividing by zero', () => {
  const { mines, counted } = tallyMines({ blocks: new Map(), tip: 900_000, from: 897_985 });
  assert.equal(counted, 0);
  assert.deepEqual(mines, []);
});
