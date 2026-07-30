// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/check-editorial.mjs — read the editorial layer the way the browser
// will, and fail loudly if it would not read.
//
//   node tools/check-editorial.mjs
//
// The curated contents and its commentary are hand-authored files with nothing
// generated from them (web/notables.yaml, web/commentary/*.md), which is what
// makes them pleasant to write and also what makes a typo shippable: a mangled
// line, a renamed file, a reading nothing points at. This is the check that
// stands in for a build step. It parses the index with the same reader the
// pages use and then verifies every claim the index makes about the filesystem.
//
// Exits non-zero on anything that would reach a reader as a missing reading or
// an empty contents. Run it before opening a pull request; the deploy runs it
// too, ahead of everything expensive.

import { readdir, readFile } from 'node:fs/promises';
import { parseNotables } from '../web/btc-notables.js';
import { readingsOf } from '../web/btc-commentary.js';
import { markdownParagraphs } from '../web/btc-markdown.js';

const WEB = new URL('../web/', import.meta.url);
const problems = [];
const notes = [];

const entries = parseNotables(await readFile(new URL('notables.yaml', WEB), 'utf8'));
if (!entries.length) problems.push('notables.yaml parsed to no entries at all');

// Ids must be unique: the pages key placements, bookmarks and seeds by id, so a
// duplicate silently shadows an entry. A height+index pair is the exception —
// the BIP30 coinbases share a txid and are told apart by their index.
const seen = new Map();
for (const e of entries) {
  const key = `${e.id}#${e.index ?? ''}`;
  if (seen.has(key)) problems.push(`duplicate entry: "${e.title}" repeats the id of "${seen.get(key)}"`);
  seen.set(key, e.title);
  if (!/^-?[0-9]+$/.test(e.id) && !/^[0-9a-f]{64}$/.test(e.id)) {
    problems.push(`"${e.title}": id "${e.id}" is neither a block height nor a 64-hex id`);
  }
  if (e.page !== undefined && e.page !== 'book') {
    problems.push(`"${e.title}": page: ${e.page} — only "book" is understood`);
  }
  if (e.index !== undefined && !Number.isInteger(e.index)) {
    problems.push(`"${e.title}": index must be a whole number, got ${e.index}`);
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

const credited = entries.flatMap((e) => readingsOf(e).filter((r) => r.by).map((r) => r.by));
console.log(`notables.yaml: ${entries.length} entries, ${referenced.size} readings`
  + `${credited.length ? `, credited to ${[...new Set(credited)].join(', ')}` : ''}`);
for (const n of notes) console.warn(`  note: ${n}`);
for (const p of problems) console.error(`  error: ${p}`);
if (problems.length) {
  console.error(`\n${problems.length} problem${problems.length > 1 ? 's' : ''} in the editorial layer.`);
  process.exit(1);
}
console.log('The editorial layer reads.');
