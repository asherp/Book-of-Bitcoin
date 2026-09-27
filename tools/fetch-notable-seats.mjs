// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/fetch-notable-seats.mjs — vendor where every curated section sits, so
// the book opens one from the contents the way it follows a citation.
//
// A citation in the margin already knows the transaction it names, so the
// reader opens its block by hash with the txid seated and asks for the block
// and the bytes together. A contents row mostly does not: the editorial layer
// names most sections by position (`id: '91722'` with `index: 0`, or `I β37
// ■1846 §3`), which left the reader to ask height -> hash -> block -> the txid
// at that seat -> the bytes, one after another. What a curated section's
// position resolves to never changes once it is buried, so it is resolved
// here once, for every section the contents and its appendix can open:
//
//   [height, index, txid, block hash]
//
// A place named by txid is placed by its merkle proof; a place named by
// position asks the block's hash and the txid at that seat. Chapters and
// leaves need nothing (they open a block, and the block is the page), and a
// consensus height no block has reached is left out until one has.
//
//   node tools/fetch-notable-seats.mjs            # write web/btc-notable-seats.js
//   node tools/fetch-notable-seats.mjs --check    # verify the file, write nothing
//
// Rows already vendored are re-fetched and compared, not trusted: history
// this deep does not change, so a mismatch means the source is wrong or the
// file was edited, and the run stops rather than writing. Mainnet only -- the
// curated layer is (btc-network.js NET.curated).

import { readFile, writeFile } from 'node:fs/promises';
import { parseNotables, parseAppendix, setNotables, places, appendix } from '../web/btc-notables.js';
import { NOTABLE_SEATS } from '../web/btc-notable-seats.js';

const MIRRORS = ['https://mempool.space/api', 'https://blockstream.info/api'];
const WEB = new URL('../web/', import.meta.url);
const DATA = new URL('btc-notable-seats.js', WEB);
const CHECK = process.argv.includes('--check');
// A seat within this many blocks of the tip could still be reorganized away.
const DEPTH = 6;

async function get(path, as = 'text') {
  let last = null;
  for (const base of MIRRORS) {
    try {
      const res = await fetch(`${base}${path}`);
      if (res.ok) return as === 'json' ? res.json() : (await res.text()).trim();
      last = new Error(`${base}${path} answered ${res.status}`);
      if (res.status === 404) break;   // not there, on any mirror
    } catch (e) { last = e; }
  }
  throw last;
}

const parts = parseAppendix(await readFile(new URL('appendix.yaml', WEB), 'utf8'));
setNotables(parseNotables(await readFile(new URL('notables.yaml', WEB), 'utf8')), parts);

// Every place a contents row or an appendix door opens as a section: the
// curated entries, the consensus register's (mined) places, and the
// inscriptions' reveals.
const candidates = [
  ...places(),
  ...appendix().filter((p) => p.kind === 'consensus').flatMap((p) => p.bips).flatMap((b) => b.entries).filter((e) => !e.expected),
  ...appendix().filter((p) => p.kind === 'inscriptions').flatMap((p) => p.entries),
].filter((p) => !p.address && !p.script && !p.page);

const seatKeyOf = (p) => (/^[0-9a-f]{64}$/i.test(p.id) ? p.id.toLowerCase()
  : /^\d+$/.test(p.id) && (p.index ?? -1) >= 0 ? `${p.id}:${p.index}` : null);

const tip = Number(await get('/blocks/tip/height'));
const wanted = [...new Set(candidates.map(seatKeyOf).filter(Boolean))];
const rows = [];
const skipped = [];
for (const key of wanted) {
  let row;
  if (key.includes(':')) {
    const [height, index] = key.split(':').map(Number);
    if (height > tip - DEPTH) { skipped.push(`${key} (not yet ${DEPTH} deep)`); continue; }
    const hash = await get(`/block-height/${height}`);
    const txid = await get(`/block/${hash}/txid/${index}`);
    row = [height, index, txid, hash];
  } else {
    const [mp, st] = await Promise.all([get(`/tx/${key}/merkle-proof`, 'json'), get(`/tx/${key}/status`, 'json')]);
    if (!st.confirmed || st.block_height !== mp.block_height || mp.block_height > tip - DEPTH) {
      skipped.push(`${key} (unconfirmed or not yet ${DEPTH} deep)`);
      continue;
    }
    row = [mp.block_height, mp.pos, key, st.block_hash];
  }
  if (!/^[0-9a-f]{64}$/.test(row[2]) || !/^[0-9a-f]{64}$/.test(row[3])) throw new Error(`${key}: malformed answer ${JSON.stringify(row)}`);
  rows.push(row);
}
rows.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
const seen = new Set();
const unique = rows.filter((r) => { const k = `${r[0]}:${r[1]}`; if (seen.has(k)) return false; seen.add(k); return true; });

// The vendored rows are history: any that disagree with the chain stop the run.
const fresh = new Map(unique.map((r) => [`${r[0]}:${r[1]}`, r]));
const drift = NOTABLE_SEATS.filter((r) => fresh.has(`${r[0]}:${r[1]}`)
  && JSON.stringify(fresh.get(`${r[0]}:${r[1]}`)) !== JSON.stringify(r));
if (drift.length) {
  console.error(`The chain disagrees with ${drift.length} vendored seat(s):`);
  for (const r of drift) console.error(`  ${JSON.stringify(r)} -> ${JSON.stringify(fresh.get(`${r[0]}:${r[1]}`))}`);
  process.exit(1);
}
for (const s of skipped) console.log(`skipped ${s}`);

const body = `// SPDX-License-Identifier: MIT OR Apache-2.0
//
// btc-notable-seats.js — where every curated section sits: its height, its
// index in that block, its txid and the block's hash. Machine-written;
// regenerate with \`node tools/fetch-notable-seats.mjs\` whenever
// notables.yaml or appendix.yaml gains a section.
//
// The chain's record rather than anyone's reading of it, and read only on
// mainnet (the curated layer is). With it the book opens a curated section as
// it follows a citation -- the block by hash with the txid seated, the block
// and the bytes asked for together -- and the contents places a txid entry
// without asking for its merkle proof.

export const NOTABLE_SEATS = [
${unique.map((r) => `  [${r[0]}, ${r[1]}, '${r[2]}', '${r[3]}'],`).join('\n')}
];
`;
const current = await readFile(DATA, 'utf8');
if (current === body) { console.log(`${unique.length} seats, unchanged.`); process.exit(0); }
if (CHECK) { console.error(`web/btc-notable-seats.js is stale: ${unique.length} seats resolved, run without --check.`); process.exit(1); }
await writeFile(DATA, body);
console.log(`wrote ${unique.length} seats.`);
