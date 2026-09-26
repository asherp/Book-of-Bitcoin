// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/notable-seats.test.mjs — every curated section has a vendored seat.
//
// The contents names most sections by position, and the book opens them as it
// follows a citation only because web/btc-notable-seats.js already holds each
// one's txid and block hash. A section added to notables.yaml or appendix.yaml
// without re-running the tool would quietly open the slow way, so this fails
// instead, naming the tool.
//
//   node --test tools/notable-seats.test.mjs

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parseNotables, parseAppendix, setNotables, places, appendix } from '../web/btc-notables.js';
import { NOTABLE_SEATS } from '../web/btc-notable-seats.js';

const WEB = new URL('../web/', import.meta.url);
const read = (f) => readFile(new URL(f, WEB), 'utf8');
setNotables(parseNotables(await read('notables.yaml')), parseAppendix(await read('appendix.yaml')));

const hex64 = /^[0-9a-f]{64}$/;

test('the vendored rows are well formed and one per seat', () => {
  const seats = new Set();
  for (const r of NOTABLE_SEATS) {
    assert.equal(r.length, 4);
    assert.ok(Number.isInteger(r[0]) && r[0] >= 0 && Number.isInteger(r[1]) && r[1] >= 0, JSON.stringify(r));
    assert.match(r[2], hex64);
    assert.match(r[3], hex64);
    const k = `${r[0]}:${r[1]}`;
    assert.ok(!seats.has(k), `${k} is vendored twice`);
    seats.add(k);
  }
});

test('every curated section has its seat vendored', () => {
  const bySeat = new Set(NOTABLE_SEATS.map((r) => `${r[0]}:${r[1]}`));
  const byTxid = new Set(NOTABLE_SEATS.map((r) => r[2]));
  const reach = Math.max(...NOTABLE_SEATS.map((r) => r[0]));
  const candidates = [
    ...places(),
    ...appendix().filter((p) => p.kind === 'consensus').flatMap((p) => p.bips).flatMap((b) => b.entries).filter((e) => !e.expected),
    ...appendix().filter((p) => p.kind === 'inscriptions').flatMap((p) => p.entries),
  ].filter((p) => !p.address && !p.script && !p.page);
  const missing = [];
  for (const p of candidates) {
    if (hex64.test(p.id)) { if (!byTxid.has(p.id)) missing.push(p.id); continue; }
    // A height past the table's reach may simply not be buried yet.
    if (/^\d+$/.test(p.id) && (p.index ?? -1) >= 0 && Number(p.id) <= reach && !bySeat.has(`${p.id}:${p.index}`)) missing.push(`${p.id}:${p.index}`);
  }
  assert.deepEqual(missing, [], 'run `node tools/fetch-notable-seats.mjs`');
});

test('the book and the contents read the table', async () => {
  const book = await read('bitcoin-book.html');
  assert.match(book, /import \{ NOTABLE_SEATS \} from '\.\/btc-notable-seats\.js'/);
  // Seeded into the three memos a section's opening reads, in memory only.
  const seed = /if \(NET\.curated\) \{\n  for \(const \[height, index, txid, hash\] of NOTABLE_SEATS\) \{[\s\S]*?\n  \}\n\}/.exec(book);
  assert.ok(seed, 'the book no longer seeds its memos from the table');
  assert.match(seed[0], /hashByHeight\.set\(height, hash\)/);
  assert.match(seed[0], /seatCache\.set\(key, Promise\.resolve\(txid\)\)/);
  assert.match(seed[0], /curatedPlaceOf\.set/);
  assert.doesNotMatch(seed[0], /storePut/);
  assert.match(book, /curatedPlaceOf\.get\(txid\)\) placementCache\.set/);
  const contents = await read('bitcoin-contents.html');
  assert.match(contents, /NOTABLE_SEATS\.filter\(\(r\) => r\[2\] === id\)/);
  assert.match(await read('sw.js'), /'\.\/btc-notable-seats\.js'/);
});
