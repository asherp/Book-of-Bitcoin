// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/fetch-epoch-work-testnet4.mjs — vendor testnet4's retarget history,
// so the book can weigh a testnet4 book the way it weighs a mainnet one
// (web/btc-chainwork-testnet4.js; mainnet's is tools/fetch-epoch-bits.mjs).
//
// Each row is an epoch's nBits and how many of its 2016 blocks were mined at
// the minimum difficulty instead, which the twenty-minute rule allows there.
// Two ways to learn the count, and the tool uses whichever it can reach:
//
//   A testnet4 Bitcoin Core node, named by BITCOIN_TESTNET4_RPC
//   (http://user:pass@host:48332). getblockheader reports chainwork, and an
//   epoch's chainwork is (2016 - n) blocks at its own nBits plus n at the
//   minimum, so n comes out of one subtraction and one division -- and has to
//   come out a whole number between 0 and 2015, or the node's answer and this
//   reading of the rule disagree and the run stops.
//
//   mempool.space, which lists every height where testnet4's difficulty
//   changed. A block's difficulty is the last change at or before it, so the
//   count is the blocks whose difficulty is 1. Its difficulties are floats
//   and are used only to tell the minimum from not; the nBits are read from
//   the epochs' first headers, and a sample of other headers is checked
//   against what the count assumed about them.
//
// With both, both are read and every row must agree. Epochs already vendored
// are re-read and checked rather than trusted, as the mainnet tool does:
// history does not change, so a mismatch stops the run before it can write.
//
//   node tools/fetch-epoch-work-testnet4.mjs             # extend the table
//   node tools/fetch-epoch-work-testnet4.mjs --dry-run   # report, write nothing

import { readFile, writeFile } from 'node:fs/promises';
import { RETARGET_INTERVAL, MIN_BITS, blockWork, chainWorkIn } from '../web/btc-chainwork.js';
import { TESTNET4_EPOCHS } from '../web/btc-chainwork-testnet4.js';

const MEMPOOL = 'https://mempool.space/testnet4/api';
const DATA = new URL('../web/btc-chainwork-testnet4.js', import.meta.url);
const DRY = process.argv.includes('--dry-run');
// Only epochs this deep are vendored: the archive's own settled depth.
const SETTLED = 6;
// Headers checked against the mempool reading, fifteen at a time.
const SAMPLES = 40;

const hex8 = (n) => Number(n).toString(16).padStart(8, '0');
const epochsUpTo = (tip) => Math.max(0, Math.floor((tip - SETTLED + 1) / RETARGET_INTERVAL));

// ─── a Bitcoin Core node ────────────────────────────────────────────────

// fetch refuses a URL that carries credentials, so they move to a header.
function rpcTarget(raw) {
  const u = new URL(raw);
  const auth = u.username
    ? 'Basic ' + Buffer.from(`${decodeURIComponent(u.username)}:${decodeURIComponent(u.password)}`).toString('base64')
    : null;
  u.username = '';
  u.password = '';
  return { url: u.toString(), auth };
}

async function fromNode(raw) {
  const { url, auth } = rpcTarget(raw);
  const call = async (batch) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...(auth ? { authorization: auth } : {}) },
      body: JSON.stringify(batch),
    });
    if (!res.ok) throw new Error(`node answered ${res.status}`);
    const out = await res.json();
    if (!Array.isArray(out) || out.length !== batch.length) throw new Error('node answered part of a batch');
    const bad = out.find((r) => r.error || r.result == null);
    if (bad) throw new Error(`node refused: ${JSON.stringify(bad.error)}`);
    const byId = new Map(out.map((r) => [r.id, r.result]));
    return batch.map((b) => byId.get(b.id));
  };
  const inChunks = async (method, paramsList) => {
    const out = [];
    for (let i = 0; i < paramsList.length; i += 100) {
      const chunk = paramsList.slice(i, i + 100);
      out.push(...await call(chunk.map((params, j) => ({ jsonrpc: '1.0', id: j, method, params }))));
    }
    return out;
  };

  const [info] = await call([{ jsonrpc: '1.0', id: 0, method: 'getblockchaininfo', params: [] }]);
  if (info.chain !== 'testnet4') throw new Error(`the node is on ${info.chain}, not testnet4`);
  const epochs = epochsUpTo(info.blocks);

  // Each epoch's first header (its nBits) and last header (the chainwork it
  // closed on).
  const heights = [];
  for (let e = 0; e < epochs; e++) heights.push(e * RETARGET_INTERVAL, e * RETARGET_INTERVAL + RETARGET_INTERVAL - 1);
  const hashes = await inChunks('getblockhash', heights.map((h) => [h]));
  const headers = await inChunks('getblockheader', hashes.map((h) => [h]));

  const floor = blockWork(MIN_BITS);
  const rows = [];
  const closedOn = [];
  let before = 0n;
  for (let e = 0; e < epochs; e++) {
    const bits = headers[2 * e].bits;
    const after = BigInt(`0x${headers[2 * e + 1].chainwork}`);
    const work = blockWork(bits);
    const added = after - before;
    let low;
    if (work === floor) {
      if (added !== BigInt(RETARGET_INTERVAL) * work) throw new Error(`epoch ${e}: a minimum-difficulty epoch added ${added}, not 2016 blocks' worth`);
      low = 0;
    } else {
      // added = (2016 - low) * work + low * floor
      const excess = BigInt(RETARGET_INTERVAL) * work - added;
      const step = work - floor;
      if (excess < 0n || excess % step !== 0n || excess / step > BigInt(RETARGET_INTERVAL - 1)) {
        throw new Error(`epoch ${e}: its chainwork is not 2016 blocks split between ${bits} and the minimum`);
      }
      low = Number(excess / step);
    }
    rows.push([bits, low]);
    closedOn.push(after);
    before = after;
  }
  // And the book's own arithmetic, over the rows just derived, lands on every
  // chainwork the node reported.
  for (let e = 0; e < epochs; e++) {
    if (chainWorkIn(rows, e * RETARGET_INTERVAL + RETARGET_INTERVAL - 1) !== closedOn[e]) {
      throw new Error(`epoch ${e}: web/btc-chainwork.js sums to something other than the node's chainwork`);
    }
  }
  return { tip: info.blocks, rows };
}

// ─── mempool.space ──────────────────────────────────────────────────────

const getJson = async (path) => {
  const res = await fetch(MEMPOOL + path);
  if (!res.ok) throw new Error(`${path} answered ${res.status}`);
  return res.json();
};

async function fromMempool() {
  const tip = Number(await (await fetch(`${MEMPOOL}/blocks/tip/height`)).text());
  const epochs = epochsUpTo(tip);

  // [time, height, difficulty, …] at every height the difficulty changed.
  const changes = (await getJson('/v1/mining/difficulty-adjustments/all'))
    .map(([, height, difficulty]) => ({ height, low: difficulty === 1 }))
    .sort((a, b) => a.height - b.height);
  if (!changes.length || changes[0].height !== 0) throw new Error('the change list does not start at genesis');
  const lowAt = (height) => {
    let lo = 0, hi = changes.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (changes[mid].height <= height) lo = mid; else hi = mid - 1;
    }
    return changes[lo].low;
  };

  // Count each epoch's minimum-difficulty blocks run by run.
  const counts = new Array(epochs).fill(0);
  for (let i = 0; i < changes.length; i++) {
    if (!changes[i].low) continue;
    const from = changes[i].height;
    const to = (i + 1 < changes.length ? changes[i + 1].height : Infinity) - 1;
    for (let e = Math.floor(from / RETARGET_INTERVAL); e < epochs; e++) {
      const start = e * RETARGET_INTERVAL;
      const end = start + RETARGET_INTERVAL - 1;
      if (start > to) break;
      counts[e] += Math.max(0, Math.min(end, to) - Math.max(start, from) + 1);
    }
  }

  // /v1/blocks/<h> answers h and the fourteen below it, nBits included.
  const pageAt = (h) => getJson(`/v1/blocks/${h}`);
  const rows = [];
  for (let e = 0; e < epochs; e++) {
    const [first] = await pageAt(e * RETARGET_INTERVAL);
    if (first?.height !== e * RETARGET_INTERVAL) throw new Error(`epoch ${e}: no header at its first height`);
    const bits = hex8(first.bits);
    if (lowAt(first.height) && bits !== MIN_BITS) throw new Error(`epoch ${e}: its first block reads as a minimum-difficulty block`);
    // In an epoch whose own nBits is the minimum, no block weighs differently.
    rows.push([bits, bits === MIN_BITS ? 0 : counts[e]]);
  }

  // The count assumed every block carries its epoch's nBits or the minimum,
  // and read which from floats. Check both against headers.
  const lastVendored = epochs * RETARGET_INTERVAL - 1;
  for (let s = 0; s < SAMPLES; s++) {
    const top = 14 + Math.floor(Math.random() * (lastVendored - 14));
    for (const b of await pageAt(top)) {
      const bits = hex8(b.bits);
      const [own] = rows[Math.floor(b.height / RETARGET_INTERVAL)];
      const expected = lowAt(b.height) ? MIN_BITS : own;
      if (bits !== expected) throw new Error(`block ${b.height} carries ${bits}, where the reading expected ${expected}`);
    }
  }
  return { tip, rows };
}

// ─── the run ────────────────────────────────────────────────────────────

const readings = [];
if (process.env.BITCOIN_TESTNET4_RPC) {
  readings.push(['node', await fromNode(process.env.BITCOIN_TESTNET4_RPC)]);
}
try {
  readings.push(['mempool.space', await fromMempool()]);
} catch (e) {
  if (!readings.length) throw e;
  console.warn(`mempool.space could not be read (${e.message}); the node's reading stands alone`);
}

// Where two sources answered, every epoch both reach must agree.
const [[source, { tip, rows }]] = readings;
for (const [other, reading] of readings.slice(1)) {
  const n = Math.min(rows.length, reading.rows.length);
  for (let e = 0; e < n; e++) {
    if (rows[e][0] !== reading.rows[e][0] || rows[e][1] !== reading.rows[e][1]) {
      console.error(`epoch ${e}: ${source} reads ${rows[e]}, ${other} reads ${reading.rows[e]} — refusing to write`);
      process.exit(1);
    }
  }
  console.log(`${source} and ${other} agree on ${n} epochs`);
}

console.log(`tip ${tip} (${source}) — ${rows.length} settled epochs, ${TESTNET4_EPOCHS.length} vendored`);

// History does not change.
for (let e = 0; e < TESTNET4_EPOCHS.length; e++) {
  const [bits, low] = TESTNET4_EPOCHS[e];
  if (!rows[e] || rows[e][0] !== bits || rows[e][1] !== low) {
    console.error(`epoch ${e} was [${bits}, ${low}], now reads [${rows[e]}] — refusing to write`);
    process.exit(1);
  }
}

const added = rows.length - TESTNET4_EPOCHS.length;
if (added <= 0) {
  console.log('nothing to add');
  process.exit(0);
}
console.log(`+${added} epoch${added === 1 ? '' : 's'}, through height ${rows.length * RETARGET_INTERVAL - 1}`);
if (DRY) process.exit(0);

// Four to a line, so appending an epoch changes one line.
const lines = [];
for (let i = 0; i < rows.length; i += 4) {
  lines.push('  ' + rows.slice(i, i + 4).map(([b, n]) => `['${b}', ${n}],`).join(' '));
}
const header = (await readFile(DATA, 'utf8')).split('\nexport const TESTNET4_EPOCHS')[0];
await writeFile(DATA, `${header}\nexport const TESTNET4_EPOCHS = [\n${lines.join('\n')}\n];\n`);
console.log(`wrote ${rows.length} epochs`);
