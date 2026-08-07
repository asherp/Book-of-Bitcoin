// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/fetch-epoch-bits.mjs — vendor the chain's retarget history, so the
// book can weigh a chapter without asking anyone how heavy it is.
//
// Chainwork is the only number consensus arbitrates on, and no free explorer
// API publishes it (see #79). It does not have to: chainwork is a function of
// the header chain and nothing else, and within a retarget epoch the one field
// it reads -- nBits -- cannot change. So the whole history of the work behind
// the tip is 477 numbers and a multiplication, and this tool fetches the 477.
//
// What is vendored is the difficulty at each epoch's first block. Everything
// else (targets, per-block work, the running sum) is arithmetic the book does
// for itself in web/btc-chainwork.js, which is the point -- a reader watching
// the sum come out has watched the chain's security get counted, where a
// quoted hex blob would only have been believed.
//
//   node tools/fetch-epoch-bits.mjs             # extend the table to the tip
//   node tools/fetch-epoch-bits.mjs --dry-run   # report, write nothing
//
// Append-only and idempotent. Epochs already vendored are re-fetched and
// checked rather than trusted: history does not change, so a mismatch means
// the source is lying or the file has been edited, and either way the run
// stops rather than writing. A run against an unchanged chain writes nothing.
//
// Mainnet only. Testnet's twenty-minute rule lets nBits vary *within* an
// epoch, which would make the epoch table quietly wrong rather than absent.

import { readFile, writeFile } from 'node:fs/promises';
import { RETARGET_INTERVAL, EPOCH_BITS } from '../web/btc-chainwork.js';

// Bitcoin Core's own JSON-RPC, which is the only tier that answers without a
// token. Two of them, because this is a build-time tool and a provider that
// stops answering should cost a retry, not a release.
const NODES = [
  'https://bitcoin-rpc.publicnode.com',
  'https://bitcoin.drpc.org',
];

const DATA = new URL('../web/btc-chainwork-epochs.js', import.meta.url);
const DRY = process.argv.includes('--dry-run');

// One batch of JSON-RPC calls against the first node that answers all of it.
// Batching is what makes 954 calls a handful of round trips; a node that
// answers batches partially is treated as not answering.
async function rpc(batch) {
  for (const url of NODES) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(batch),
      });
      if (!res.ok) continue;
      const out = await res.json();
      if (!Array.isArray(out) || out.length !== batch.length) continue;
      if (out.some((r) => r.error || r.result == null)) continue;
      return out;
    } catch { /* try the next node */ }
  }
  throw new Error('no node answered the batch');
}

// Ask in chunks rather than all at once: a 477-call batch is a large enough
// request to be refused by something in the middle for reasons that have
// nothing to do with Bitcoin.
async function inChunks(items, size, build, read) {
  const out = [];
  for (let i = 0; i < items.length; i += size) {
    const chunk = items.slice(i, i + size);
    const answers = await rpc(chunk.map((item, j) => build(item, j)));
    const byId = new Map(answers.map((a) => [a.id, a.result]));
    out.push(...chunk.map((item, j) => read(byId.get(j), item)));
  }
  return out;
}

const tip = (await rpc([{ jsonrpc: '1.0', id: 0, method: 'getblockcount', params: [] }]))[0].result;
const epochs = Math.floor(tip / RETARGET_INTERVAL) + 1;
const heights = Array.from({ length: epochs }, (_, e) => e * RETARGET_INTERVAL);

console.log(`tip ${tip} — ${epochs} epochs, ${EPOCH_BITS.length} vendored`);

const hashes = await inChunks(heights, 100,
  (h, j) => ({ jsonrpc: '1.0', id: j, method: 'getblockhash', params: [h] }),
  (r) => r);
const bits = await inChunks(hashes, 50,
  (h, j) => ({ jsonrpc: '1.0', id: j, method: 'getblockheader', params: [h] }),
  (r) => r.bits);

// History does not change. Anything that says otherwise is a bad answer, not
// news, so it stops the run before it can be written.
for (let e = 0; e < EPOCH_BITS.length; e++) {
  if (bits[e] !== EPOCH_BITS[e]) {
    console.error(`epoch ${e} (height ${e * RETARGET_INTERVAL}) was ${EPOCH_BITS[e]}, ` +
                  `now reads ${bits[e]} — refusing to write`);
    process.exit(1);
  }
}

const added = bits.length - EPOCH_BITS.length;
if (added <= 0) {
  console.log('nothing to add');
  process.exit(0);
}
console.log(`+${added} epoch${added === 1 ? '' : 's'}, through height ${(bits.length - 1) * RETARGET_INTERVAL}`);
if (DRY) process.exit(0);

// Eight to a line, so appending an epoch changes one line rather than the
// whole table, and a diff shows which retarget arrived.
const rows = [];
for (let i = 0; i < bits.length; i += 8) {
  rows.push('  ' + bits.slice(i, i + 8).map((b) => `'${b}',`).join(' '));
}

const header = (await readFile(DATA, 'utf8')).split('\nexport const EPOCH_BITS')[0];
await writeFile(DATA, `${header}\nexport const EPOCH_BITS = [\n${rows.join('\n')}\n];\n`);
console.log(`wrote ${bits.length} epochs`);
