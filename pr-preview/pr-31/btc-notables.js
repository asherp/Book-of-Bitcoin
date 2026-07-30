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

// An entry as the rest of the book expects it.
//
// `id` takes every form the search box takes (btc-lookup.js): a height, a
// tip-relative height, a 64-hex transaction id or block hash, or a reference in
// either spelling -- "I β29 ■596 §85" and "v1b29c596s85" name the same passage
// as `id: 57043` with `index: 84`, and an author may write whichever reads
// better where they are working. A reference is resolved here, by arithmetic
// alone, into exactly the height / index / page an entry would otherwise carry
// by hand, so nothing downstream learns a new shape:
//
//   III                 volume III's leaf          page: volume
//   III β2              book 2's leaf              page: book
//   III β2 ■5           that chapter               (an entry's default)
//   I β29 ■596 §85      that section               index: 84
//   I β29 ■596 §85.4    that section's 4th output  index: 84, out: 4
//
// Ids stay strings, because they are compared against String(height) and
// against txids -- so `id: 57043` unquoted in YAML still matches -- and a
// 64-hex id is lowercased for the same reason: the comparison is the point, not
// the spelling.
function normalize(raw, i) {
  const written = String(raw.id ?? '').trim();
  if (!raw.title || !written) throw new Error(`btc-notables: entry ${i + 1} needs a title and an id`);
  const title = String(raw.title);
  const found = parseLookup(written, { isAddress: looksLikeAddress });
  if (found.kind === 'address') {
    // The contents lists places; an address is a name, and names are the
    // ledgers' index (btc-index-data.js). Saying so beats resolving to nothing.
    throw new Error(`btc-notables: "${title}" has an address as its id — an address is a ledger entry (btc-index-data.js), not a chapter`);
  }
  if (!found.kind) {
    throw new Error(`btc-notables: "${title}" has an id that is neither a height, a 64-hex id, nor a reference: ${written}`);
  }
  const ref = found.kind === 'reference' ? found.reference : null;
  const id = ref ? String(ref.height) : (found.kind === 'hex' ? found.hex : written);
  const entry = { title, id };
  if (raw.index !== undefined) entry.index = Number(raw.index);
  if (raw.page !== undefined) entry.page = String(raw.page);
  if (ref) {
    // A reference already says which page it means; a second, conflicting
    // statement of that is a mistake worth naming rather than silently ranking.
    const depth = ref.index >= 0 ? { index: ref.index }
      : ref.index === -2 ? { page: 'book' }
      : ref.index === -3 ? { page: 'volume' }
      : {};
    for (const [k, v] of Object.entries(depth)) {
      if (entry[k] !== undefined && entry[k] !== v) {
        throw new Error(`btc-notables: "${title}" says ${k}: ${entry[k]}, but its reference ${written} says ${k}: ${v}`);
      }
      entry[k] = v;
    }
    if (ref.index === -1 && (entry.index !== undefined || entry.page !== undefined)) {
      throw new Error(`btc-notables: "${title}" carries an index or page beside a chapter reference (${written}) — name the section in the reference instead`);
    }
    if (ref.out !== null) entry.out = ref.out;
  }
  if (raw.out !== undefined) entry.out = Number(raw.out);
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
