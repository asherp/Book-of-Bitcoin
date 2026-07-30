// SPDX-License-Identifier: MIT OR Apache-2.0
//
// btc-commentary.js — the machinery of the annotation layer: which curated
// readings apply to the page in front of the reader, and the markup that sets
// them. The readings themselves are editorial work and travel with the entries
// they annotate, in btc-contents-data.js under CC BY 4.0; this file only finds
// and dresses them. The same split as btc-notation.js / btc-sigla.js: the
// machinery in one file, the authored matter in another, so a licence boundary
// stays a file boundary.
//
// A reading is never set flush against the record it annotates. That is the
// book's whole argument about attribution (see the README's License section),
// and it is why commentary opens as a sheet OVER the passage rather than a
// paragraph inside it: the prose on the page is the chain's own speech, no
// author, verifiable against the bytes; the sheet is somebody's account of why
// it is worth reading, with a name on it and its terms stated at the foot. A
// reader can always tell which they are looking at, because they are never
// looking at both at once.
//
// The shapes an entry may carry, both optional:
//
//   note: 'A paragraph.'            the book's own reading -- the house voice,
//   note: ['First.', 'Second.']     unsigned, because the book is its author
//   commentary: [                   readings by others, each credited: their
//     { note: '…', by: 'Name',      copyright, published here under CC BY 4.0
//       href: 'https://…' },        (CONTRIBUTING.md), never absorbed into the
//   ]                               book's voice
//
// An entry with neither is simply a place the book keeps without having said
// anything about it yet -- which is the normal case, and why every surface
// that shows commentary has to be able to show none.

import { NOTABLE } from './btc-contents-data.js';

// A note is one paragraph or a list of them; empty strings drop out, so a
// half-written note reads as no note rather than as a blank sheet.
const paragraphsOf = (note) => (Array.isArray(note) ? note : [note])
  .filter((p) => typeof p === 'string' && p.trim())
  .map((p) => p.trim());

// Every reading an entry carries, in the order they should be read: the book's
// own note first, then the credited ones. Each reading is { paragraphs, by,
// href } -- `by` null for the house voice, which the book signs by publishing.
export function readingsOf(entry) {
  const out = [];
  const own = paragraphsOf(entry.note);
  if (own.length) out.push({ paragraphs: own, by: null, href: null });
  for (const c of entry.commentary || []) {
    const paragraphs = paragraphsOf(c.note);
    if (paragraphs.length) out.push({ paragraphs, by: c.by || null, href: c.href || null });
  }
  return out;
}

export const hasCommentary = (entry) => readingsOf(entry).length > 0;

// The readings that belong to the page being read, matched exactly the way the
// page's own titles are matched in bitcoin-book.html -- so the sheet can never
// annotate something the page does not name:
//
//   index -2  a book's leaf      the `page: 'book'` entry at this height
//   index -1  a chapter's leaf   every entry at this height (the block's own
//                                readings, and those of the sections it names)
//   index ≥0  a section          the entry citing this txid, or this
//                                height+index (how the twice-confirmed BIP30
//                                coinbases are cited, their txid being shared)
//
// A volume leaf keeps no curated readings, and neither does a projected
// chapter or a fee-replaced draft: callers pass what they are showing, and
// anything unmatched simply comes back empty.
export function commentaryFor({ height = null, index = null, txid = null } = {}) {
  const h = height == null ? null : String(height);
  const i = Number.isInteger(index) ? index : null;
  const id = typeof txid === 'string' ? txid.toLowerCase() : null;
  return NOTABLE
    .filter((e) => {
      if (i === -2) return e.page === 'book' && e.id === h;
      if (e.page === 'book') return false;            // a book's leaf is the only place its entry speaks
      if (i === -1) return e.id === h;
      if (i !== null && i >= 0) return e.id === id || (e.id === h && e.index === i);
      return false;
    })
    .map((e) => ({ id: e.id, title: e.title, readings: readingsOf(e) }))
    .filter((it) => it.readings.length);
}

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// The book's own note carries no byline: publishing it is the signature, and
// the sheet's foot says whose editorial layer this is. A contributed reading
// wears its author's name, linked where they gave a link -- the name is the
// point, not decoration: it is what lets a reader weigh the claim and argue
// with the person who made it.
const readingHtml = (r) => r.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('')
  + (r.by
    ? `<p class="commentary-by">— ${r.href
        ? `<a href="${esc(r.href)}" target="_blank" rel="noopener noreferrer">${esc(r.by)}</a>`
        : esc(r.by)}</p>`
    : '');

// Stated at the foot of every sheet, because a sheet can be read in isolation
// and a claim of authority is exactly what commentary must not borrow from the
// record it sits over.
const TERMS_HTML = `
          <p class="commentary-terms">Commentary — a reading of the record, not the record.
            The passage beneath is the chain's own speech, verifiable byte for byte and in
            the public domain; this is somebody's account of why it is worth reading, and no
            more authoritative than the argument behind it.
            <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a>,
            credited to whoever wrote it.</p>`;

// The sheet's markup for a set of readings: one titled group per curated
// entry (a height can carry several -- the supply-cap fork carries two), then
// the terms. Empty for no readings, which is the caller's cue to show no
// toggle at all. Everything sits inside one measure, so the readings and the
// terms beneath them share a left edge whatever size each is set at.
export function commentaryHtml(items) {
  if (!items.length) return '';
  const groups = items.map((it) => `
            <section class="commentary-entry">
              <h4 class="commentary-name">${esc(it.title)}</h4>
              ${it.readings.map(readingHtml).join('')}
            </section>`).join('');
  return `
          <div class="commentary-measure">${groups}${TERMS_HTML}
          </div>`;
}

// The same readings as plain text, for surfaces with no DOM: the static
// passages the deploy pre-renders for readers without JavaScript
// (tools/prerender-passages.mjs). One string per paragraph, credits included,
// so the annotation layer reaches a crawler as something other than silence.
export function commentaryLines(items) {
  const out = [];
  for (const it of items) {
    for (const r of it.readings) {
      out.push(...r.paragraphs);
      if (r.by) out.push(`— ${r.by}${r.href ? ` (${r.href})` : ''}`);
    }
  }
  return out;
}
