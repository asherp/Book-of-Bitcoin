// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/lazy-scroll.test.mjs — what the reading defers, and how it comes back.
//
//   node --test tools/lazy-scroll.test.mjs
//
// A push too big to be a value waits behind a ⋯ until the reader scrolls to
// it. That much was already true. What it did not do was cost anything like
// what it was about to: an unfilled placeholder is one glyph, so a witness
// split across eighty pushes collapsed to a single line, sat entirely inside
// the observer's margin, and filled every chunk in one synchronous callback —
// the whole run's encoding, at once, the moment the reader arrived. The
// streaming undid itself exactly where it was needed.
//
// Two things fix it and are pinned here: a run reserves the height it is about
// to take, so the observer meets its chunks a few at a time; and the fills go
// through a queue that yields, so a burst is a progressive fill rather than a
// frozen page. The reserved box is sized from a measured word count per
// language, so the table that sizes it must cover every language the book
// offers — a new tongue with no row would silently reserve by Latin's measure.
//
// Source-text assertions, like the rest of the reading's tests: the page is one
// inline module and there is no DOM here to run it in.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const book = await readFile(new URL('../web/bitcoin-book.html', import.meta.url), 'utf8');
const msg = await readFile(new URL('../web/glossia-msg.js', import.meta.url), 'utf8');

// The lazyEncode closure, lifted out by its own boundaries.
const lazy = (() => {
  const start = book.indexOf('const lazyEncode = (() => {');
  assert.ok(start > 0, 'the reading no longer defers a push');
  const end = book.indexOf('\n})();\n', start);
  return book.slice(start, end);
})();

test('the word table covers every language the book offers', () => {
  const ids = [...msg.matchAll(/\{ id: '([a-z]+)',/g)].map((m) => m[1]);
  assert.ok(ids.length >= 4, 'MSG_LANGS no longer reads as a table of ids');
  const table = /const WORDS = \{([\s\S]*?)\n  \};/.exec(lazy);
  assert.ok(table, 'nothing sizes the reserved box');
  for (const id of ids) {
    assert.match(table[1], new RegExp(`\\b${id}:\\s*\\{ per: [\\d.]+, base: [\\d.]+ \\}`),
      `${id} is offered to the reader but has no measured word count`);
  }
});

test('an intersecting placeholder is queued, not filled where it is found', () => {
  const cb = /new IntersectionObserver\(\(entries, obs\) => \{([\s\S]*?)\}, \{ rootMargin/.exec(lazy);
  assert.ok(cb, 'the observer no longer takes a callback this shape');
  assert.match(cb[1], /queue\.push\(e\.target\)/, 'the callback does not queue');
  assert.doesNotMatch(cb[1], /fill\(e\.target\)/,
    'the callback fills where it stands — a run of chunks is a frozen page again');
});

test('the drain yields between chunks', () => {
  const drain = /const drain = async \(\) => \{([\s\S]*?)\n  \};/.exec(lazy);
  assert.ok(drain, 'there is no drain');
  assert.match(drain[1], /await new Promise\(\(r\) => setTimeout\(r, 0\)\)/,
    'the drain never yields to the event loop');
  assert.match(drain[1], /if \(draining\) return/, 'two drains can run at once');
  assert.match(drain[1], /el\.isConnected/,
    'a chunk queued before the section turned is encoded into a detached node');
});

test('a turned section drops what it had queued', () => {
  assert.match(lazy, /reset: \(\) => \{ queue\.length = 0;/,
    'reset leaves the previous section\'s chunks in the queue');
});

test('print still fills synchronously', () => {
  const all = /fillAll: \(root\) => \{([\s\S]*?)\n    \},/.exec(lazy);
  assert.ok(all, 'the force-encode pass is gone');
  assert.doesNotMatch(all[1], /await|async/,
    'fillAll yields — a passage would print its ⋯ instead of its prose');
});

test('a placeholder carries the byte count that sizes its box', () => {
  assert.match(lazy, /data-bytes="\$\{hex\.length >> 1\}"/, 'the byte count does not ride along');
  assert.match(lazy, /class="glossia-lazy"/, 'the placeholder lost the class everything hangs on');
});

test('only a push whose prose runs past a line reserves a box', () => {
  const res = /const reserve = \(root, pending\) => \{([\s\S]*?)\n  \};/.exec(lazy);
  assert.ok(res, 'nothing reserves the room a run will take');
  assert.match(res[1], /if \(lines < 2\) continue/,
    'a one-line push is boxed — the inline ⋯ reads better and needs no room');
  assert.match(res[1], /root\.clientWidth/, 'the measure is not read from the page');
});

test('the reserved box is dropped when the prose lands', () => {
  // The rule is compound on .glossia-lazy, which fill removes — so the box
  // cannot outlive the placeholder even if the other class were left behind.
  assert.match(book, /\.glossia-lazy\.lazy-block \{[^}]*\}/, 'the reserved box is styled nowhere');
  assert.match(lazy, /el\.classList\.remove\('glossia-lazy', 'lazy-block'\)/,
    'fill leaves the placeholder classed');
  assert.match(lazy, /el\.style\.removeProperty\('--lazy-lines'\)/,
    'fill leaves the reserved height on the element');
});
