// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/citation-windows.test.mjs — the book grid against the retarget grid.
//
//   node --test tools/citation-windows.test.mjs
//
// A book is a difficulty window only in Volume I. Book numbering restarts at
// each halving and 210,000 is not a multiple of 2,016, so every era after the
// first opens further into a window already running, and a book straddles a
// retarget rather than naming one. The book leaf prints both of a straddling
// book's targets and the difficulty move between them, which is only ever
// two targets — the property this file pins down.

import test from 'node:test';
import assert from 'node:assert/strict';

import { heightOf, volumeBookChapter, windowStartOf, retargetInside } from '../web/btc-citation.js';

const RETARGET = 2016;
const ERA = 210000;
// Every book of the first eight volumes, as (volume, book, start, length).
const BOOKS = [];
for (let v = 1; v <= 8; v++) {
  for (let b = 1; b <= 105; b++) {
    const start = heightOf(v, b, 1);
    BOOKS.push({ v, b, start, len: volumeBookChapter(start).chapterCount });
  }
}

test('a book never holds more than one retarget', () => {
  for (const { v, b, start, len } of BOOKS) {
    const end = start + len - 1;
    // Count the boundaries strictly inside: the book's own opening target is
    // not a retarget it contains, it is the one it inherits.
    let inside = 0;
    for (let h = windowStartOf(start) + RETARGET; h <= end; h += RETARGET) inside++;
    assert.ok(inside <= 1, `Vol ${v} β${b} holds ${inside} retargets`);
    assert.equal(retargetInside(start, len), inside === 0 ? null : windowStartOf(start) + RETARGET,
      `Vol ${v} β${b}`);
  }
});

test('a retarget inside a book lands strictly inside it, on the real grid', () => {
  for (const { v, b, start, len } of BOOKS) {
    const cut = retargetInside(start, len);
    if (cut === null) continue;
    assert.ok(cut > start && cut <= start + len - 1, `Vol ${v} β${b}: ${cut} outside its book`);
    assert.equal(cut % RETARGET, 0, `Vol ${v} β${b}: ${cut} is not a retarget height`);
  }
});

test('only Volume I is single-target throughout, and Volume VII again', () => {
  const straddling = (v) => BOOKS.filter((x) => x.v === v && retargetInside(x.start, x.len) !== null).length;
  // Volume I's books open on retargets; so do Volume VII's, six eras being
  // 1,260,000 blocks and exactly 625 windows.
  assert.equal(1260000 / RETARGET, 625);
  assert.equal(straddling(1), 0);
  assert.equal(straddling(7), 0);
  // Everything between straddles on all 104 full books, the short one aside.
  for (const v of [2, 3, 4, 5, 6]) assert.equal(straddling(v), 104, `Volume ${v}`);
});

test("a volume's truncated last book is always one whole target", () => {
  for (const { v, start, len } of BOOKS.filter((x) => x.b === 105)) {
    assert.equal(len, ERA % RETARGET);   // 336
    assert.equal(retargetInside(start, len), null, `Volume ${v}'s last book straddles`);
  }
});

test('each era opens a further sixth of a book into a live window', () => {
  // 336, 672, 1008, 1344, 1680, then back in step — the drift the preface
  // states, and the reason a book stops being a window after Volume I.
  const offsets = [1, 2, 3, 4, 5, 6, 7].map((v) => heightOf(v, 1, 1) % RETARGET);
  assert.deepEqual(offsets, [0, 336, 672, 1008, 1344, 1680, 0]);
  assert.equal(ERA % RETARGET, 336);
});
