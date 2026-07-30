// SPDX-License-Identifier: MIT OR Apache-2.0
//
// btc-notables.js — the loader for the editorial layer: it reads
// web/notables.yaml (the curated table of contents) and the Markdown files in
// web/commentary/ that the entries reference, and hands the pages a plain list
// of entries. The authored matter itself is CC BY 4.0 and lives in those files;
// this is the machinery, on the usual dual terms. Licence boundary, file
// boundary.
//
// Two shapes of loading, because the two things are wanted at different moments:
//
//   the index    every page that names or lists a passage needs it before it
//                can render, so it is loaded once at start-up and then read
//                synchronously through notables()
//   a reading    wanted only when a reader opens the commentary sheet, so each
//                Markdown file is fetched on demand and kept for the session
//
// Which also means the contents page can say "commentary by so-and-so" without
// fetching a word of it: the credits live in the index, the prose in the files.
//
// Reading is injectable (`read`) rather than hardwired to fetch, so the same
// code path serves the browser and the deploy-time pre-renderer running in Node
// against the files on disk (tools/prerender-passages.mjs). One parser, one
// normalizer, one set of rules about what an entry means.

import { parseYamlSequence } from './btc-yaml.js';
import { parseLookup, looksLikeAddress } from './btc-lookup.js';

export const NOTABLES_FILE = 'notables.yaml';
export const COMMENTARY_DIR = 'commentary/';

// In the browser, paths are relative to the page (all reading pages sit beside
// these files); Node passes its own reader.
const fetchRead = async (path) => {
  const res = await fetch(`./${path}`);
  if (!res.ok) throw new Error(`${res.status} fetching ${path}`);
  return res.text();
};

// An entry is a THING THE BOOK KEEPS, and its places are where that thing is
// found. Usually one -- a chapter, a section, an address -- but not always: the
// two coinbases BIP30 grandfathered were each confirmed twice, and the four
// printings are one thing worth reading about, in four places. So an entry may
// write `id:` for its one place, or `ids:` for several, and the readings
// beneath belong to the entry rather than to any one of them.
//
//   - title: Bitcoin Pizza Day        - title: The twice-confirmed coinbases
//     id: 57043                         ids:
//     commentary:                         - id: 91722
//       - file: pizza-day.md                index: 0
//                                           as: e3bf…468, first printing
//                                         - id: 91880
//                                           index: 0
//                                           as: e3bf…468, second printing
//                                       commentary:
//                                         - file: bip30-duplicates.md
//
// `as` names what THIS place is within the entry -- the contents prints it
// after the title, so four rows sharing one name still say which is which, and
// a reading written once serves all four.
//
// A place's id takes every form the search box takes (btc-lookup.js): a height,
// a tip-relative height, a 64-hex transaction id or block hash, a reference in
// either spelling ("I β29 ■596 §85" and "v1b29c596s85" name the same passage as
// `id: 57043` with `index: 84`), or an address. A reference is resolved here, by
// arithmetic alone, into exactly the height / index / page a place would
// otherwise carry by hand, so nothing downstream learns a new shape:
//
//   III                 volume III's leaf          page: volume
//   III β2              book 2's leaf              page: book
//   III β2 ■5           that chapter               (a place's default)
//   I β29 ■596 §85      that section               index: 84
//   I β29 ■596 §85.4    that section's 4th output  index: 84, out: 4
//
// Ids stay strings, because they are compared against String(height) and
// against txids -- so `id: 57043` unquoted in YAML still matches -- and a
// 64-hex id is lowercased for the same reason: the comparison is the point, not
// the spelling.
function normalizePlace(raw, title) {
  const written = String(raw.id ?? '').trim();
  if (!written) throw new Error(`btc-notables: "${title}" has a place with no id`);
  const found = parseLookup(written, { isAddress: looksLikeAddress });
  if (!found.kind) {
    throw new Error(`btc-notables: "${title}" has an id that is neither a height, a 64-hex id, a reference, nor an address: ${written}`);
  }
  const place = {};
  if (raw.as !== undefined) place.as = String(raw.as);
  // An address is kept the way the search box treats one: not a place in the
  // chain but a name, so it reads in the Ledger rather than as a chapter. It is
  // still curated, and still carries readings -- which is how commentary comes
  // to be attached to a particular ledger.
  if (found.kind === 'address') {
    for (const field of ['index', 'page', 'out']) {
      if (raw[field] !== undefined) {
        throw new Error(`btc-notables: "${title}" is an address, so it has no ${field} — that names a position within a chapter`);
      }
    }
    return Object.assign(place, { id: found.address, address: found.address });
  }
  const ref = found.kind === 'reference' ? found.reference : null;
  place.id = ref ? String(ref.height) : (found.kind === 'hex' ? found.hex : written);
  if (raw.index !== undefined) place.index = Number(raw.index);
  if (raw.page !== undefined) place.page = String(raw.page);
  if (ref) {
    // A reference already says which page it means; a second, conflicting
    // statement of that is a mistake worth naming rather than silently ranking.
    const depth = ref.index >= 0 ? { index: ref.index }
      : ref.index === -2 ? { page: 'book' }
      : ref.index === -3 ? { page: 'volume' }
      : {};
    for (const [k, v] of Object.entries(depth)) {
      if (place[k] !== undefined && place[k] !== v) {
        throw new Error(`btc-notables: "${title}" says ${k}: ${place[k]}, but its reference ${written} says ${k}: ${v}`);
      }
      place[k] = v;
    }
    if (ref.index === -1 && (place.index !== undefined || place.page !== undefined)) {
      throw new Error(`btc-notables: "${title}" carries an index or page beside a chapter reference (${written}) — name the section in the reference instead`);
    }
    if (ref.out !== null) place.out = ref.out;
  }
  if (raw.out !== undefined) place.out = Number(raw.out);
  return place;
}

function normalize(raw, i) {
  const title = String(raw.title ?? '').trim();
  if (!title) throw new Error(`btc-notables: entry ${i + 1} needs a title`);
  if (raw.id !== undefined && raw.ids !== undefined) {
    throw new Error(`btc-notables: "${title}" has both id and ids — write one place as id, several as ids`);
  }
  const written = raw.ids ?? (raw.id !== undefined ? [raw] : null);
  if (!written) throw new Error(`btc-notables: "${title}" needs an id (or ids)`);
  if (!Array.isArray(written) || !written.length) {
    throw new Error(`btc-notables: "${title}" has an ids that is not a list of places`);
  }
  const entry = { title, places: written.map((p) => normalizePlace(p, title)) };
  return withCommentary(entry, raw);
}

// The readings an entry carries, whatever its places name: a chapter, a section,
// an address. Each is a Markdown file in commentary/ (or a short note written
// inline), and a `by` makes it somebody's rather than the book's. They hang on
// the ENTRY, not on any one place -- one thing, one reading, however many places
// it is found in.
function withCommentary(entry, raw) {
  if (raw.commentary) {
    entry.commentary = raw.commentary.map((c) => {
      if (!c.file && !c.note) throw new Error(`btc-notables: a reading of "${entry.title}" has neither file nor note`);
      const r = {};
      if (c.file) r.file = String(c.file);
      if (c.note) r.note = String(c.note);            // a one-line reading, inline in the index
      if (c.by) r.by = String(c.by);
      if (c.href) r.href = String(c.href);
      return r;
    });
  }
  return entry;
}

export function parseNotables(yamlText) {
  return parseYamlSequence(yamlText).map(normalize);
}

let entries = [];
let loading = null;

// Load the index once. Resolves to the entries; on failure resolves to an empty
// list rather than rejecting, so a page renders the chain either way -- the
// curation is an annotation on the record, never a gate on reading it. The
// failure is reported through loadNotables().error for surfaces that want to
// say so out loud (the table of contents does; the book page does not need to).
export function loadNotables({ read = fetchRead } = {}) {
  if (!loading) {
    loading = read(NOTABLES_FILE)
      .then((text) => { entries = parseNotables(text); return entries; })
      .catch((e) => {
        loadNotables.error = e;
        console.warn('btc-notables: could not read the curated contents —', e.message);
        return entries;
      });
  }
  return loading;
}

// The loaded index, synchronously. Empty until loadNotables() resolves, which
// every page awaits before its first render.
export const notables = () => entries;

// The same index seen as PLACES rather than as things: one row per place, each
// carrying its entry's title (and its own `as`, where an entry keeps several).
// This is what the surfaces that name or list a passage read -- the book's
// titles, the table of contents -- because those are about where you are; the
// readings are read off the entries themselves, because a reading belongs to the
// thing, not to each of its places.
export const places = () => entries.flatMap((entry) =>
  entry.places.map((place) => ({ ...place, title: entry.title, entry })));

// A place's own name: the entry's title, and what this place is within it.
// "The twice-confirmed coinbases — e3bf…468, first printing".
export const placeTitle = (place) => (place.as ? `${place.title} — ${place.as}` : place.title);

// Seed the index directly, for a caller that already has the file in hand
// (Node reading it off disk, a test). Marks the load as done, so nothing
// fetches afterwards.
export function setNotables(list) {
  entries = list;
  loading = Promise.resolve(entries);
  return entries;
}

const files = new Map();   // file name -> Promise<markdown source>

// One reading's Markdown, fetched at most once per session. The rejection is
// the caller's to handle: a sheet that cannot load its prose says so, the way
// the preface leaf does.
export function loadCommentaryFile(file, { read = fetchRead } = {}) {
  if (!files.has(file)) files.set(file, read(COMMENTARY_DIR + file));
  return files.get(file);
}
