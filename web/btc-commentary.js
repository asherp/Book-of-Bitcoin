// SPDX-License-Identifier: MIT OR Apache-2.0
//
// btc-commentary.js — the machinery of the annotation layer: which curated
// reading applies to the page in front of the reader, and the markup that sets
// it. The readings themselves are authored matter — Markdown files in
// web/commentary/, referenced from web/notables.yaml, both CC BY 4.0; this file
// only finds and dresses them. The same split as btc-notation.js /
// btc-sigla.js: the machinery in one file, the authored matter in another, so a
// licence boundary stays a file boundary.
//
// A reading is never set flush against the record it annotates. That is the
// book's whole argument about attribution (see the README's License section),
// and it is why commentary opens as a sheet OVER the passage rather than a
// paragraph inside it: the prose on the page is the chain's own speech, no
// author, verifiable against the bytes; the sheet is somebody's account of why
// it is worth reading, with a name on it. A reader can always tell which they
// are looking at, because they are never looking at both at once -- and the
// preface, which is where the book makes this argument at length, says the rest.
//
// The work splits along what each surface needs (see btc-notables.js): the
// index says WHETHER a passage has a reading and WHOSE it is, and that is
// enough to show a key on the page and a credit in the contents. Only opening
// the sheet needs the prose, so only opening it fetches anything.

import { notables, loadCommentaryFile } from './btc-notables.js';
import { renderMarkdown, markdownParagraphs } from './btc-markdown.js';

// Every reading an entry carries, in the order they should be read: the book's
// own first (the house voice, unsigned -- the book is its author), then the
// credited ones. Each is a reference, not yet prose: { file } or { note }, plus
// { by, href } where somebody signs it.
export function readingsOf(entry) {
  const readings = (entry.commentary || []).filter((r) => r.file || r.note);
  return [...readings.filter((r) => !r.by), ...readings.filter((r) => r.by)];
}

export const hasCommentary = (entry) => readingsOf(entry).length > 0;

// A one-line credit for surfaces that LIST passages rather than open them --
// the table of contents, where a reader is deciding what to open and "commentary
// by so-and-so" is the kind of thing that decides it.
//
// Only a CREDITED reading earns the line. The book's own note gets none, for the
// same reason a printed anthology's contents does not mark the editor's own
// headnotes: the book is the voice you are already reading, so marking it would
// tag nearly every row and distinguish nothing. A name is news. Null where there
// is no name to print, which is the caller's cue to print nothing.
export function creditLine(entry) {
  const named = readingsOf(entry).filter((r) => r.by).map((r) => r.by);
  if (!named.length) return null;
  return {
    label: `commentary by ${named.join(' · ')}`,
    title: `${named.length > 1 ? 'readings' : 'a reading'} by ${named.join(', ')} — editorial, offered beside the passage and no more authoritative than its argument`,
  };
}

// The readings that belong to the page being read, matched exactly the way the
// page's own titles are matched in bitcoin-book.html -- so the sheet can never
// annotate something the page does not name:
//
//   index -3  a volume's leaf    the `page: volume` entry at this height
//   index -2  a book's leaf      the `page: book` entry at this height
//   index -1  a chapter's leaf   every entry at this height (the block's own
//                                readings, and those of the sections it names)
//   index ≥0  a section          the entry citing this txid, or this
//                                height+index (how the twice-confirmed BIP30
//                                coinbases are cited, their txid being shared)
//
// A projected chapter keeps no curated readings, and neither does a fee-replaced
// draft: callers pass what they are showing, and anything unmatched simply comes
// back empty. Synchronous, off the loaded index -- the prose arrives later,
// through resolveCommentary. Addresses are matched separately, below: they are
// names rather than places, and they read in the Ledger.
export function commentaryFor({ height = null, index = null, txid = null } = {}) {
  const h = height == null ? null : String(height);
  const i = Number.isInteger(index) ? index : null;
  const id = typeof txid === 'string' ? txid.toLowerCase() : null;
  // An entry is kept once however many places it is found in, so a match on any
  // of its places brings its readings -- written once, wherever they are met.
  const here = (p) => {
    if (p.address) return false;                    // a name, not a place: it reads in the Ledger
    if (i === -3) return p.page === 'volume' && p.id === h;
    if (i === -2) return p.page === 'book' && p.id === h;
    if (p.page) return false;                       // a leaf is the only place it speaks
    if (i === -1) return p.id === h;
    if (i !== null && i >= 0) return p.id === id || (p.id === h && p.index === i);
    return false;
  };
  return itemsOf(notables().filter((e) => e.places.some(here)));
}

// The readings kept for one or more addresses -- what a ledger is: a titled set
// of addresses, so its title leaf shows every reading its members carry, and an
// address's own leaf shows just that address's. Commentary on a ledger is
// commentary on the record of a name, which is exactly the kind of claim the
// book insists on crediting: that these coins are that party's is somebody's
// reading, however well evidenced, and it belongs beside the record rather than
// inside it.
export function commentaryForAddresses(addresses) {
  const wanted = (Array.isArray(addresses) ? addresses : [addresses]).filter(Boolean);
  if (!wanted.length) return [];
  // In the order the ledger holds its addresses, not the order the index does.
  return wanted.flatMap((a) => itemsOf(notables().filter((e) => e.places.some((p) => p.address === a))));
}

const itemsOf = (entries) => entries
  .map((e) => ({ title: e.title, readings: readingsOf(e) }))
  .filter((it) => it.readings.length);

// Fetch the prose for a set of matched entries and hand back items whose
// readings each carry their Markdown `source` -- or an `error`, which the
// renderers print as a missing reading rather than as silence. Idempotent and
// cheap to call again: btc-notables.js keeps each file for the session.
//
// `read` is passed through for Node (the deploy-time pre-renderer reads the
// files off disk); the browser needs nothing.
export async function resolveCommentary(items, { read } = {}) {
  await Promise.all(items.flatMap((it) => it.readings.map(async (r) => {
    if (r.source !== undefined || !r.file) return;
    try {
      r.source = await loadCommentaryFile(r.file, read ? { read } : undefined);
    } catch (e) {
      r.error = e.message || String(e);
    }
  })));
  return items;
}

// The Markdown behind one reading: an inline note is its own source; a file's
// is whatever resolveCommentary fetched.
const sourceOf = (r) => (r.note !== undefined ? r.note : r.source);

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// The book's own note carries no byline: publishing it is the signature, and a
// reader on the book's own page is already reading the book. A contributed
// reading wears
// its author's name, linked where they gave a link -- the name is the point, not
// decoration: it is what lets a reader weigh the claim and argue with the person
// who made it.
function readingHtml(r) {
  const src = sourceOf(r);
  // A reading whose file would not load says so, and says where it is. The
  // record on the page beneath is unaffected -- which is worth a reader knowing.
  if (src === undefined) {
    return `<p class="commentary-missing">This reading could not be loaded. It is in the repository, as
      <code>web/commentary/${esc(r.file || '')}</code>.</p>`;
  }
  return renderMarkdown(src)
    + (r.by
      ? `<p class="commentary-by">— ${r.href
          ? `<a href="${esc(r.href)}" target="_blank" rel="noopener noreferrer">${esc(r.by)}</a>`
          : esc(r.by)}</p>`
      : '');
}

// The sheet's markup for a set of resolved readings: one titled group per
// curated entry (a height can carry several), inside one measure. No terms at
// the foot -- the book states them where a reader meets them once rather than
// at the bottom of every sheet: the preface says what a reading is and whose,
// and the sheet itself says it by standing apart from the passage and carrying
// its author's name.
export function commentaryHtml(items) {
  if (!items.length) return '';
  const groups = items.map((it) => `
            <section class="commentary-entry">
              <h4 class="commentary-name">${esc(it.title)}</h4>
              ${it.readings.map(readingHtml).join('')}
            </section>`).join('');
  return `
          <div class="commentary-measure">${groups}
          </div>`;
}

// The same readings as plain paragraphs, for surfaces with no DOM: the static
// passages the deploy pre-renders for readers without JavaScript
// (tools/prerender-passages.mjs). Credits included, so the annotation layer
// reaches a crawler as something other than silence.
export function commentaryLines(items) {
  const out = [];
  for (const it of items) {
    for (const r of it.readings) {
      const src = sourceOf(r);
      if (src === undefined) continue;               // unreadable file: omitted, never guessed at
      out.push(...markdownParagraphs(src));
      if (r.by) out.push(`— ${r.by}${r.href ? ` (${r.href})` : ''}`);
    }
  }
  return out;
}
