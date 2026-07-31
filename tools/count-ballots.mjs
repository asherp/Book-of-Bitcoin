// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/count-ballots.mjs — count the closed signaling windows from the chain
// itself, and check web/appendix.yaml against them.
//
//   node tools/count-ballots.mjs            all closed ballots
//   node tools/count-ballots.mjs --bip 341  one fork
//
// The Consensus appendix's fork leaves close with a tally: how many blocks of
// the fork's window said yes. For a window that has closed, that number is a
// plain fact of the chain — every block's version is on the record — but it
// is a fact nobody serves in aggregate, so the book carries it as an
// editorial entry: `signals:` on the fork's group in appendix.yaml. This
// script is where that entry comes from, and how anyone checks it. It reads
// the appendix with the same parser the site uses, fetches every block of
// each closed window off the public mirrors (ten a call), counts the yeses by
// the same rule the leaf's table applies (a version bit set, or a minimum
// version), and then:
//
//   - where the group already carries `signals:`, verifies it — a mismatch
//     is reported and the run exits non-zero;
//   - where it carries none, prints the counted line, ready to paste.
//
// Nothing is written; an editorial file is edited by hands. The run costs
// one request per ten blocks (a full sweep of the bundled forks is ~950
// requests), which is why the count is carried in the file rather than made
// by every reader: counted once, checkable by anyone, this script being the
// check.
//
// BALLOT_MIRRORS overrides the esplora mirrors (comma-separated), and
// BALLOT_FILE the appendix read — both for tests, or a mirror of your own.

import { readFile } from 'node:fs/promises';
import { parseAppendix } from '../web/btc-notables.js';

const MIRRORS = (process.env.BALLOT_MIRRORS || 'https://blockstream.info/api,https://mempool.space/api')
  .split(',').map((s) => s.trim()).filter(Boolean);
const FILE = process.env.BALLOT_FILE || new URL('../web/appendix.yaml', import.meta.url);

const only = (() => {
  const i = process.argv.indexOf('--bip');
  return i >= 0 ? String(process.argv[i + 1] ?? '') : null;
})();

const parts = parseAppendix(await readFile(FILE, 'utf8'));
const bips = parts.filter((p) => p.kind === 'consensus')
  .flatMap((p) => p.bips)
  .filter((b) => Number.isFinite(b.ballot) && Number.isFinite(b.window) && (b.bit != null || b.version != null))
  .filter((b) => !only || b.key === only);
if (!bips.length) {
  console.error(only ? `no closed ballot for --bip ${only}` : 'no closed ballots in the appendix');
  process.exit(1);
}

// One page of ten blocks, tried across the mirrors; a page that no mirror
// serves fails the fork's count — a partial count is not a count.
async function page(height) {
  for (const base of MIRRORS) {
    try {
      const res = await fetch(`${base}/blocks/${height}`);
      if (res.ok) return await res.json();
    } catch { /* try the next mirror */ }
  }
  throw new Error(`no mirror would serve blocks at ${height}`);
}

let failed = false;
for (const bip of bips) {
  const floor = bip.ballot - bip.window + 1;
  const yes = (v) => (bip.bit != null ? ((v >>> bip.bit) & 1) === 1 : (v >>> 0) >= bip.version);
  const rule = bip.bit != null ? `bit ${bip.bit}` : `version ≥ ${bip.version}`;
  process.stdout.write(`BIP ${bip.bip} — ${bip.name}: blocks ${floor.toLocaleString('en-US')}–${bip.ballot.toLocaleString('en-US')} (${rule}) `);
  const starts = [];
  for (let h = bip.ballot; h >= floor; h -= 10) starts.push(h);
  // Each height must be seen exactly once: the Set is what makes the count a
  // count rather than a sum of whatever arrived.
  const seen = new Set();
  let count = 0;
  try {
    const FLIGHT = 4;
    for (let i = 0; i < starts.length; i += FLIGHT) {
      const pages = await Promise.all(starts.slice(i, i + FLIGHT).map(page));
      for (const blocks of pages) {
        for (const b of blocks) {
          if (b.height < floor || b.height > bip.ballot || seen.has(b.height)) continue;
          seen.add(b.height);
          if (yes(b.version)) count++;
        }
      }
      process.stdout.write('.');
    }
  } catch (e) {
    console.log('');
    console.error(`  FAILED: ${e.message} — nothing counted for this fork`);
    failed = true;
    continue;
  }
  console.log('');
  if (seen.size !== bip.window) {
    console.error(`  FAILED: saw ${seen.size} distinct blocks of a ${bip.window}-block window`);
    failed = true;
    continue;
  }
  const pct = (100 * count / bip.window).toFixed(2);
  if (Number.isFinite(bip.signals)) {
    if (bip.signals === count) {
      console.log(`  ok — ${count.toLocaleString('en-US')} of ${bip.window.toLocaleString('en-US')} signaling (${pct}%), as appendix.yaml records`);
    } else {
      console.error(`  MISMATCH — the chain counts ${count.toLocaleString('en-US')}, appendix.yaml records ${bip.signals.toLocaleString('en-US')}`);
      failed = true;
    }
  } else {
    console.log(`  counted ${count.toLocaleString('en-US')} of ${bip.window.toLocaleString('en-US')} signaling (${pct}%) — add to its group in web/appendix.yaml:`);
    console.log(`      signals: ${count}`);
  }
}
if (failed) {
  console.error('\nThe appendix and the chain disagree (or the chain could not be read).');
  process.exit(1);
}
console.log('\nEvery counted window agrees with the chain.');
