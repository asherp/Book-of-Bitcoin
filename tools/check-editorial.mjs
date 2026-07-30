// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/check-editorial.mjs — read the editorial layer the way the browser
// will, and fail loudly if it would not read.
//
//   node tools/check-editorial.mjs
//
// The curated contents, its appendix and its commentary are hand-authored files
// with nothing generated from them (web/notables.yaml, web/appendix.yaml,
// web/commentary/*.md), which is what
// makes them pleasant to write and also what makes a typo shippable: a mangled
// line, a renamed file, a reading nothing points at. This is the check that
// stands in for a build step. It parses the index with the same reader the
// pages use and then verifies every claim the index makes about the filesystem.
//
// Exits non-zero on anything that would reach a reader as a missing reading or
// an empty contents. Run it before opening a pull request; the deploy runs it
// too, ahead of everything expensive.

import { readdir, readFile } from 'node:fs/promises';
import { parseNotables, parseAppendix, setNotables, places, placeTitle } from '../web/btc-notables.js';
import { parseYamlSequence } from '../web/btc-yaml.js';
import { parseReference } from '../web/btc-citation.js';
import { looksLikeAddress } from '../web/btc-lookup.js';
import { INDEXED } from '../web/btc-index-data.js';
import { readingsOf } from '../web/btc-commentary.js';
import { markdownParagraphs } from '../web/btc-markdown.js';

const WEB = new URL('../web/', import.meta.url);
const problems = [];
const notes = [];

const source = await readFile(new URL('notables.yaml', WEB), 'utf8');
// The appendix is authored the same way and read by the same machinery: parts
// the contents gathers after the volumes, one of which lists places of its own.
const backSource = await readFile(new URL('appendix.yaml', WEB), 'utf8');
const parts = parseAppendix(backSource);
const entries = setNotables(parseNotables(source), parts);
if (!entries.length) problems.push('notables.yaml parsed to no entries at all');
// An entry may be found in several places; the checks below are per place,
// since a place is what a row, a title and a static passage are made of.
const allPlaces = places();

// An id may be written as a reference ("I β29 ■596 §85") and is resolved to a
// height by arithmetic; show the resolution, so an author can see that the
// citation they wrote points where they think it does.
for (const raw of parseYamlSequence(source)) {
  for (const p of raw.ids ?? [raw]) {
    const ref = parseReference(String(p.id ?? '').trim());
    if (!ref) continue;
    notes.push(`"${raw.title}"${p.as ? ` (${p.as})` : ''}: ${p.id} resolves to block ${ref.height}`
      + (ref.section !== null ? ` §${ref.section}` : ref.index === -2 ? " (its book's leaf)" : ref.index === -3 ? " (its volume's leaf)" : '')
      + (ref.out !== null ? `.${ref.out}` : ''));
  }
}

// Places must be unique: the pages key placements, bookmarks and seeds by id, so
// a duplicate silently shadows one. A height+index pair is what tells two places
// at one height apart — how the twice-confirmed BIP30 coinbases are cited.
const seen = new Map();
for (const e of allPlaces) {
  const name = placeTitle(e);
  const key = `${e.id}#${e.index ?? ''}`;
  if (seen.has(key)) problems.push(`duplicate place: "${name}" repeats the id of "${seen.get(key)}"`);
  seen.set(key, name);
  if (e.address) {
    // An address entry names a ledger, not a place. It needs no shelving here
    // (the Ledger opens any address, curated or not), but a reading kept on an
    // address nobody has shelved will only be met by a reader who goes looking
    // for that address — worth saying, never an error.
    if (!looksLikeAddress(e.address)) problems.push(`"${name}": id "${e.address}" does not look like an address`);
    else if (!INDEXED.some((l) => l.addresses.includes(e.address))) {
      notes.push(`"${name}": ${e.address} is not shelved in btc-index-data.js — its reading shows only on an ad-hoc ledger`);
    }
  } else if (!/^-?[0-9]+$/.test(e.id) && !/^[0-9a-f]{64}$/.test(e.id)) {
    problems.push(`"${name}": id "${e.id}" is neither a block height nor a 64-hex id`);
  }
  if (e.page !== undefined && e.page !== 'book' && e.page !== 'volume') {
    problems.push(`"${name}": page: ${e.page} — only "book" and "volume" are understood`);
  }
  if (e.out !== undefined && !(Number.isInteger(e.out) && e.out >= 0)) {
    problems.push(`"${name}": out must be a whole output number, got ${e.out}`);
  }
  if (e.out !== undefined && !(e.index >= 0)) {
    problems.push(`"${name}": out names an output within a section, so it needs a §section reference`);
  }
  if (e.index !== undefined && !Number.isInteger(e.index)) {
    problems.push(`"${name}": index must be a whole number, got ${e.index}`);
  }
}

// Every referenced reading must exist, say something, and carry its licence.
const referenced = new Set();
for (const e of entries) {
  for (const r of readingsOf(e)) {
    if (!r.file) continue;                        // an inline note: nothing on disk to check
    referenced.add(r.file);
    let src;
    try {
      src = await readFile(new URL(`commentary/${r.file}`, WEB), 'utf8');
    } catch {
      problems.push(`"${e.title}" references commentary/${r.file}, which does not exist`);
      continue;
    }
    if (!markdownParagraphs(src).length) problems.push(`commentary/${r.file} has no prose in it`);
    if (!src.includes('SPDX-License-Identifier: CC-BY-4.0')) {
      problems.push(`commentary/${r.file} is missing its SPDX line (<!-- SPDX-License-Identifier: CC-BY-4.0 -->)`);
    }
    // A credited reading is only credited if the name reaches the page.
    if (r.href && !/^https?:\/\//.test(r.href)) {
      problems.push(`commentary/${r.file}: href "${r.href}" is not an http(s) URL`);
    }
  }
}

// A file nothing points at is not an error — a reading can be written before
// its entry is settled — but it is silent, so it is worth saying out loud.
const onDisk = (await readdir(new URL('commentary/', WEB))).filter((f) => f.endsWith('.md'));
for (const f of onDisk) if (!referenced.has(f)) notes.push(`commentary/${f} is not referenced by any entry — nothing will show it`);

// The appendix's own places: each must resolve to a height like any other, and
// a part that lists none but says it will is a part that renders empty.
for (const part of parts) {
  if (part.kind !== 'entries') continue;
  for (const e of part.entries) {
    if (!/^-?[0-9]+$/.test(e.id) && !/^[0-9a-f]{64}$/.test(e.id)) {
      problems.push(`appendix "${part.title}": "${e.title}" has an id that is neither a block height nor a 64-hex id`);
    }
    if (!e.note) notes.push(`appendix "${part.title}": "${e.title}" carries no note — the row will have nothing to say on hover`);
  }
}

const credited = entries.flatMap((e) => readingsOf(e).filter((r) => r.by).map((r) => r.by));
console.log(`notables.yaml: ${entries.length} entries in ${allPlaces.length} places, ${referenced.size} readings`
  + `; appendix.yaml: ${parts.map((p) => p.title).join(', ')}`
  + `${credited.length ? `, credited to ${[...new Set(credited)].join(', ')}` : ''}`);
for (const n of notes) console.warn(`  note: ${n}`);
for (const p of problems) console.error(`  error: ${p}`);
if (problems.length) {
  console.error(`\n${problems.length} problem${problems.length > 1 ? 's' : ''} in the editorial layer.`);
  process.exit(1);
}
console.log('The editorial layer reads.');
