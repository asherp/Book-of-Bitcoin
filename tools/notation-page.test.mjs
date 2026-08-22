// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/notation-page.test.mjs — the static notation key, and the brief.
//
//   node --test tools/notation-page.test.mjs
//
// Two documents exist for a reader who cannot run the page: notation.md, the
// alphabet generated out of the book's own tables, and brief.md, the whole
// book written out in one file. The first cannot drift, being derived. The
// second is prose somebody wrote, and prose about a moving codebase goes
// stale silently -- so the claims in it that ARE checkable are checked here,
// against the same tables the pages read.
//
// Nothing here needs the engine or the network: the sigla and the terms are
// notation, not prose.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { OPCODE_SYMBOLS, OPCODE_NAMES } from '../web/btc-sigla.js';
import { TERMS, termOfScript, demandsOf } from '../web/btc-term.js';
import { parseAppendix, partLabel } from '../web/btc-notables.js';
import { alphabet, forms, notationMd, LETTERS, MARKS } from './prerender-notation.mjs';

const web = (name) => readFile(new URL(`../web/${name}`, import.meta.url), 'utf8');

// ── the alphabet ──────────────────────────────────────────────────────────

test('every opcode the book knows has a mark, a name and exactly one family', () => {
  const seen = new Map();
  for (const group of alphabet()) {
    assert.ok(group.rows.length, `${group.title} is an empty family`);
    for (const row of group.rows) {
      assert.ok(row.mark, `${row.name} rendered with no mark`);
      assert.ok(row.name.startsWith('OP_'), `${row.byte} rendered without its OP_ name`);
      assert.equal(seen.has(row.name), false, `${row.name} appears in two families`);
      seen.set(row.name, group.title);
    }
  }
  // The point of the file: nothing consensus defines is missing from it.
  for (const name of Object.values(OPCODE_NAMES)) {
    assert.ok(seen.has(name), `${name} is in the book's tables but not in the key`);
  }
  assert.equal(seen.size, Object.keys(OPCODE_NAMES).length);
});

test('the rendered key prints every mark and every name', () => {
  const md = notationMd();
  for (const [byte, name] of Object.entries(OPCODE_NAMES)) {
    assert.ok(md.includes(name), `${name} is missing from notation.md`);
    assert.ok(md.includes(OPCODE_SYMBOLS[byte]), `the mark for ${name} is missing from notation.md`);
  }
});

// ── the letters, and the marks around them ────────────────────────────────

test('every letter a tabled form binds or demands is glossed', () => {
  const glossed = new Set(LETTERS.map(([letter]) => letter));
  for (const form of forms()) {
    for (const binder of form.binder.split(' ')) {
      // The binder carries its byte count as a superscript; the letter is what
      // the gloss is keyed by.
      const letter = binder[0];
      assert.ok(glossed.has(letter), `${form.label} binds "${letter}", which nothing glosses`);
    }
    for (const alt of form.brings) {
      for (const letter of alt.split(' ')) {
        assert.ok(glossed.has(letter), `a spend of ${form.label} brings "${letter}", which nothing glosses`);
      }
    }
  }
});

test('every mark the key names is one the book actually writes', async () => {
  const sources = (await Promise.all([
    'bitcoin-book.html', 'btc-prose.js', 'btc-citation.js', 'btc-sigla.js',
    'btc-term.js', 'btc-proofs.js', 'btc-tx.js',
  ].map(web))).join('\n');
  for (const [marks, gloss] of MARKS) {
    // Roman numerals and the version's v are ordinary letters; what wants
    // checking is the sigla, which are not.
    for (const ch of [...marks].filter((c) => c.codePointAt(0) > 0x7f)) {
      assert.ok(sources.includes(ch), `the key glosses "${ch}" (${gloss}) but no source writes it`);
    }
  }
});

// ── the brief ─────────────────────────────────────────────────────────────

test('the brief states the terms the term module derives', async () => {
  const brief = await web('brief.md');
  const stated = [...brief.matchAll(/^(P2\w+)\s+:= (.+)$/gm)]
    .map(([, label, term]) => `${label} := ${term.trim()}`).sort();
  const derived = forms().map((f) => `${f.label} := ${f.title}`).sort();
  assert.deepEqual(stated, derived,
    'brief.md and btc-term.js disagree about what the tabled forms are');
});

test('the brief names the back matter as the appendix itself numbers it', async () => {
  const parts = parseAppendix(await web('appendix.yaml'));
  const brief = await web('brief.md');
  for (const part of parts) {
    const label = partLabel(parts, part);
    assert.ok(brief.includes(label), `brief.md does not name "${label}"`);
  }
});

test('the brief carries its licence, and says where the text lives', async () => {
  const brief = await web('brief.md');
  assert.match(brief, /SPDX-License-Identifier: CC-BY-4\.0/,
    'brief.md is editorial matter and must carry the CC BY header');
  for (const path of ['/passages/index.md', '/notation.md', '/preface.md', '/llms.txt']) {
    assert.ok(brief.includes(path), `brief.md does not point a reader at ${path}`);
  }
});

// ── the wiring ────────────────────────────────────────────────────────────

test('both documents are in the sitemap and reachable without JavaScript', async () => {
  const prerender = await readFile(new URL('./prerender-passages.mjs', import.meta.url), 'utf8');
  const index = await web('index.html');
  const llms = await web('llms.txt');
  for (const name of ['brief.md', 'notation.md']) {
    assert.ok(prerender.includes(`'${name}'`), `${name} is not listed in the sitemap`);
    assert.ok(index.includes(`./${name}`), `the landing page does not link ${name}`);
    assert.ok(llms.includes(`/${name}`), `llms.txt does not point a machine reader at ${name}`);
  }
});
