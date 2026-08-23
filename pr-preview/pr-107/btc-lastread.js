// SPDX-License-Identifier: MIT OR Apache-2.0
//
// btc-lastread.js — where the reader stopped. A book left face-down on a
// table opens where it was left, and until now this one did not: the place
// survived only as long as the tab and its URL did, so a reader who closed
// the app and came back through the home screen or the bare address started
// at the front however far in they had read.
//
// What is kept is a *query*, not a coordinate — the very string the reading
// page writes into its own address bar (`block=…&index=…`). That has two
// properties worth having. The page already decides what its location is,
// down to a §section or a volume leaf, so nothing here has to model a
// position the page could then disagree with; and a grammar that grows —
// another parameter, another kind of leaf — rides along without this file
// learning about it.
//
// The record is versioned and self-checking, because it outlives the build
// that wrote it: a reader who takes an update must not lose their place, and
// a record whose shape is not this one is discarded rather than obeyed. It
// is a place in a book, so it is kept in localStorage beside the reader's
// bookmarks, and it never leaves the machine.
//
// The reading page reads and writes this; the root (index.html) reads the
// same key inline, having to decide where to go before a module could load —
// tools/lastread.test.mjs keeps that copy in step with this one.

const KEY = 'glossia-btc-last-read';
const VERSION = 1;

// What a kept query may look like: the characters a URL query is written in,
// and short enough that no runaway string can be mistaken for a place. The
// point is not to validate the grammar — the reading page does that when it
// reads the parameters back — but to refuse anything that plainly is not one.
const QUERY = /^[\w=&%.,:+-]{1,300}$/;

/** Keep the reader's place. Silent on a private-mode or full localStorage:
 *  losing a bookmark's worth of convenience is not worth an exception in the
 *  middle of a page turn. */
export function keepPlace(query) {
  if (typeof query !== 'string' || !QUERY.test(query)) return;
  try {
    const rec = JSON.stringify({ v: VERSION, q: query });
    if (rec !== localStorage.getItem(KEY)) localStorage.setItem(KEY, rec);
  } catch { /* no storage, no memory — the book still reads */ }
}

/** The kept place as a query string, or null if there is none to resume.
 *  A record of an unrecognized shape is cleared as it is refused, so a
 *  reader coming from a future build (or a corrupted write) starts clean
 *  rather than being asked the same unanswerable question every open. */
export function lastPlace() {
  let raw = null;
  try { raw = localStorage.getItem(KEY); } catch { return null; }
  if (raw == null) return null;
  let rec = null;
  try { rec = JSON.parse(raw); } catch { /* falls through to the reset */ }
  if (rec && rec.v === VERSION && typeof rec.q === 'string' && QUERY.test(rec.q)) return rec.q;
  forgetPlace();
  return null;
}

/** Forget it — for a reader clearing their traces, and for a record that
 *  turned out not to be one. */
export function forgetPlace() {
  try { localStorage.removeItem(KEY); } catch { /* nothing to forget */ }
}
