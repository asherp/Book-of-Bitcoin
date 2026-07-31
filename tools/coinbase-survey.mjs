// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/coinbase-survey.mjs — sample coinbases off the chain and report what
// each pool is actually writing into them.
//
// The question this answers: how does each pool format its coinbase, precisely
// enough to parse? Most of the answer cannot be read out of a specification,
// because past BIP34's height push there is no specification -- three of the
// four largest pools run closed template builders, and the house styles below
// are visible only in the bytes they leave behind. So this samples the bytes.
//
// It reads blocks from any Esplora-compatible mirror, decomposes each coinbase
// scriptSig with tools/coinbase-fields.mjs, groups the readings by pool and by
// structural shape, and prints what it found. Findings that have already been
// written up live in tools/coinbase-formats.md; this is the instrument that
// produced them and the one that will contradict them when a pool changes.
//
//   node tools/coinbase-survey.mjs                        # the last 144 blocks
//   node tools/coinbase-survey.mjs --blocks 1000
//   node tools/coinbase-survey.mjs --from 900000 --to 900500
//   node tools/coinbase-survey.mjs --blocks 500 --save samples.json
//   node tools/coinbase-survey.mjs --samples samples.json  # re-read, offline
//   node tools/coinbase-survey.mjs --hex 03d9a80e…         # one scriptSig, offline
//   node tools/coinbase-survey.mjs --blocks 200 --json > survey.json
//
// SURVEY_ESPLORA (comma-separated endpoints) points it at a local node or a
// mirror of your choosing; it defaults to the same public pair the book uses.
// Saved samples make a run reproducible: the analysis re-runs offline against
// exactly the blocks that were fetched, which is what lets a finding be
// re-checked rather than re-believed.

import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

import { decodeCoinbaseScriptSig, shapeOf, identifyPool, literalSignature, POOL_SIGNATURES } from './coinbase-fields.mjs';

const ESPLORA_MIRRORS = (process.env.SURVEY_ESPLORA || '')
  .split(',').map((s) => s.trim().replace(/\/$/, '')).filter(Boolean);
if (!ESPLORA_MIRRORS.length) {
  ESPLORA_MIRRORS.push('https://blockstream.info/api', 'https://mempool.space/api');
}

// mempool's pool list -- the same table the explorers identify blocks with,
// fetched rather than vendored, and used to widen the book's own signatures
// (web/btc-pools.js) rather than to replace them: the book's patterns know
// where a tag ends, a substring only knows that one occurred.
const POOLS_URL = 'https://raw.githubusercontent.com/mempool/mining-pools/master/pools-v2.json';

async function esplora(path, kind = 'text') {
  let lastErr;
  for (const base of ESPLORA_MIRRORS) {
    try {
      const res = await fetch(base + path);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`${res.status} on ${base + path}`);
      return kind === 'json' ? await res.json() : (await res.text()).trim();
    } catch (e) { lastErr = e; }
  }
  throw lastErr || new Error(`all mirrors failed for ${path}`);
}

// The pool table, or the fallback when the network says no. Tolerant of both
// shapes the file has worn: a bare array of entries, or an object wrapping one.
async function loadPools() {
  try {
    const res = await fetch(POOLS_URL);
    if (!res.ok) throw new Error(String(res.status));
    const raw = await res.json();
    const list = Array.isArray(raw) ? raw : (raw.pools || Object.values(raw));
    const fetched = list
      .filter((p) => p && p.name && (p.tags || p.regexes || []).length)
      .map((p) => literalSignature(p.name, p.tags || p.regexes, p.link || null));
    if (!fetched.length) return { pools: POOL_SIGNATURES, source: "the book's own table" };
    // The book's signatures first -- they are the ones that know where a tag
    // ends -- then every pool the fetched list names that the book does not.
    const known = new Set(POOL_SIGNATURES.map((p) => p.name.toLowerCase()));
    return {
      pools: [...POOL_SIGNATURES, ...fetched.filter((p) => !known.has(p.name.toLowerCase()))],
      source: `the book's own table + ${POOLS_URL}`,
    };
  } catch {
    return { pools: POOL_SIGNATURES, source: "the book's own table (pool list unreachable)" };
  }
}

// ─── sampling ──────────────────────────────────────────────────────────

// One block -> { height, scriptsig }. Two calls: the height's hash, then the
// block's first transaction, which is the coinbase by definition.
async function sampleAt(height) {
  const hash = await esplora(`/block-height/${height}`);
  if (!hash) return null;
  const txs = await esplora(`/block/${hash}/txs/0`, 'json');
  const cb = txs && txs[0];
  if (!cb || !cb.vin || !cb.vin[0]) return null;
  return { height, hash, scriptsig: cb.vin[0].scriptsig || '', outputs: cb.vout ? cb.vout.length : null };
}

// Heights in descending order, sampled with a small amount of concurrency --
// enough to be quick over a few hundred blocks, little enough to be a polite
// guest on a public mirror.
async function sampleRange(heights, concurrency = 4, log = () => {}) {
  const out = [];
  let next = 0, done = 0;
  const worker = async () => {
    for (;;) {
      const i = next++;
      if (i >= heights.length) return;
      try {
        const s = await sampleAt(heights[i]);
        if (s) out.push(s);
      } catch (e) {
        log(`  block ${heights[i]}: ${e.message}`);
      }
      if (++done % 50 === 0) log(`  …${done}/${heights.length}`);
    }
  };
  await Promise.all(Array.from({ length: Math.min(concurrency, heights.length) }, worker));
  out.sort((a, b) => b.height - a.height);
  return out;
}

// ─── analysis ──────────────────────────────────────────────────────────

// The readings, grouped by the pool that signed them and then by shape. A pool
// with one shape has one template builder; a pool with several is either
// rolling a change or running more than one.
export function analyse(samples, pools = POOL_SIGNATURES, { now = null } = {}) {
  const byPool = new Map();
  const readings = [];
  for (const s of samples) {
    const decoded = decodeCoinbaseScriptSig(s.scriptsig, { height: s.height, now });
    const who = identifyPool(decoded, pools);
    const name = who ? who.pool : 'unidentified';
    const shape = shapeOf(decoded);
    readings.push({ height: s.height, pool: name, tag: who ? who.text : null, shape, decoded });

    if (!byPool.has(name)) {
      byPool.set(name, {
        pool: name, blocks: 0, shapes: new Map(), texts: new Map(),
        commitments: new Map(), lengths: [], heights: [],
        timestamped: 0, noHeight: 0, inexact: 0, outOfBounds: 0,
      });
    }
    const g = byPool.get(name);
    g.blocks++;
    g.shapes.set(shape, (g.shapes.get(shape) || 0) + 1);
    g.lengths.push(decoded.length);
    g.heights.push(s.height);
    if (!decoded.bip34) g.noHeight++;
    if (!decoded.exact) g.inexact++;
    if (!decoded.withinConsensusBounds) g.outOfBounds++;
    for (const f of decoded.fields) {
      if (f.kind === 'time') g.timestamped++;
      if (f.kind === 'text') g.texts.set(f.text, (g.texts.get(f.text) || 0) + 1);
      if (f.kind === 'auxpow' || f.kind === 'rsk' || f.kind === 'hathor') {
        g.commitments.set(f.kind, (g.commitments.get(f.kind) || 0) + 1);
      }
    }
  }
  const groups = [...byPool.values()].sort((a, b) => b.blocks - a.blocks);
  for (const g of groups) {
    g.minLength = Math.min(...g.lengths);
    g.maxLength = Math.max(...g.lengths);
    g.exampleHeight = Math.max(...g.heights);
  }
  return { blocks: samples.length, groups, readings };
}

const top = (map, n) => [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);
const pct = (part, whole) => `${Math.round((part / whole) * 100)}%`;

function report(analysis, { poolSource }) {
  const lines = [];
  lines.push(`${analysis.blocks} coinbases read — pool names from ${poolSource}`);
  lines.push('');
  for (const g of analysis.groups) {
    lines.push(`── ${g.pool} — ${g.blocks} block${g.blocks === 1 ? '' : 's'} (e.g. ${g.exampleHeight}), scriptSig ${g.minLength}–${g.maxLength} bytes`);
    for (const [shape, n] of top(g.shapes, 4)) lines.push(`   ${String(n).padStart(4)}×  ${shape}`);
    const texts = top(g.texts, 4);
    if (texts.length) lines.push(`   writes:  ${texts.map(([t, n]) => `${JSON.stringify(t)}×${n}`).join('  ')}`);
    if (g.commitments.size) {
      lines.push(`   carries: ${[...g.commitments].map(([k, n]) => `${k} in ${pct(n, g.blocks)}`).join(', ')}`);
    }
    if (g.timestamped) lines.push(`   template timestamp in second position: ${pct(g.timestamped, g.blocks)}`);
    if (g.noHeight) lines.push(`   ! no BIP34 height read in ${g.noHeight} block(s)`);
    if (g.inexact) lines.push(`   ! reading did not reproduce the bytes in ${g.inexact} block(s)`);
    if (g.outOfBounds) lines.push(`   ! scriptSig outside the 2–100 byte consensus bounds in ${g.outOfBounds} block(s)`);
    lines.push('');
  }
  return lines.join('\n');
}

// One scriptSig, field by field -- the view for looking at a single block.
function detail(hex, height = null) {
  const d = decodeCoinbaseScriptSig(hex, { height });
  const lines = [`${d.length} bytes, ${d.exact ? 'read exactly' : 'READING LOST BYTES'}${d.bip34 ? '' : ', no BIP34 height'}`];
  for (const f of d.fields) {
    const what = f.kind === 'height' ? `height ${f.height}`
      : f.kind === 'time' ? `template time ${f.unix} (${new Date(f.unix * 1000).toISOString()})`
        : f.kind === 'text' ? JSON.stringify(f.text)
          : f.kind === 'auxpow' ? `aux root ${f.root.slice(0, 16)}… size ${f.merkleSize} nonce ${f.merkleNonce}`
            : f.kind === 'rsk' ? `RSK block ${f.rskBlockNumber}, ${f.uncles} uncle(s)`
              : f.kind === 'hathor' ? `Hathor block ${f.auxBlockHash.slice(0, 16)}…`
                : `${f.hex.length / 2} bytes`;
    lines.push(`  @${String(f.offset).padStart(3)}  ${f.kind.padEnd(7)} ${what}`);
    lines.push(`        ${f.hex}`);
  }
  lines.push('', `shape: ${shapeOf(d)}`);
  return lines.join('\n');
}

// ─── the command ───────────────────────────────────────────────────────

function parseArgs(argv) {
  const opts = { blocks: 144, concurrency: 4 };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const val = () => argv[++i];
    if (a === '--blocks') opts.blocks = Number(val());
    else if (a === '--from') opts.from = Number(val());
    else if (a === '--to') opts.to = Number(val());
    else if (a === '--save') opts.save = val();
    else if (a === '--samples') opts.samples = val();
    else if (a === '--hex') opts.hex = val();
    else if (a === '--concurrency') opts.concurrency = Number(val());
    else if (a === '--json') opts.json = true;
    else if (a === '--help' || a === '-h') opts.help = true;
    else throw new Error(`unknown argument ${a}`);
  }
  return opts;
}

const USAGE = `node tools/coinbase-survey.mjs [options]

  --blocks N        sample the last N blocks (default 144)
  --from H --to H   sample a height range instead
  --samples FILE    read samples from a file rather than the network
  --save FILE       write the fetched samples for a later offline run
  --hex HEX         decode one coinbase scriptSig and exit
  --concurrency N   parallel fetches (default 4)
  --json            machine-readable output
`;

export async function main(argv = process.argv.slice(2)) {
  const opts = parseArgs(argv);
  if (opts.help) { process.stdout.write(USAGE); return; }

  if (opts.hex) { process.stdout.write(detail(opts.hex) + '\n'); return; }

  const note = (s) => { if (!opts.json) process.stderr.write(s + '\n'); };

  let samples;
  if (opts.samples) {
    samples = JSON.parse(await readFile(opts.samples, 'utf8'));
    note(`${samples.length} samples read from ${opts.samples}`);
  } else {
    let heights;
    if (opts.from !== undefined && opts.to !== undefined) {
      const [lo, hi] = [Math.min(opts.from, opts.to), Math.max(opts.from, opts.to)];
      heights = Array.from({ length: hi - lo + 1 }, (_, i) => hi - i);
    } else {
      const tip = Number(await esplora('/blocks/tip/height'));
      heights = Array.from({ length: opts.blocks }, (_, i) => tip - i).filter((h) => h >= 0);
    }
    note(`fetching ${heights.length} blocks (${heights[heights.length - 1]}–${heights[0]})…`);
    samples = await sampleRange(heights, opts.concurrency, note);
    if (opts.save) { await writeFile(opts.save, JSON.stringify(samples, null, 1)); note(`samples written to ${opts.save}`); }
  }

  if (!samples.length) {
    process.stderr.write('no samples — check the mirror (SURVEY_ESPLORA) or the height range\n');
    process.exitCode = 1;
    return;
  }

  const { pools, source } = await loadPools();
  const analysis = analyse(samples, pools);
  if (opts.json) {
    process.stdout.write(JSON.stringify({
      blocks: analysis.blocks,
      poolSource: source,
      groups: analysis.groups.map((g) => ({
        pool: g.pool, blocks: g.blocks, minLength: g.minLength, maxLength: g.maxLength,
        exampleHeight: g.exampleHeight, timestamped: g.timestamped,
        shapes: Object.fromEntries(g.shapes), texts: Object.fromEntries(g.texts),
        commitments: Object.fromEntries(g.commitments),
        noHeight: g.noHeight, inexact: g.inexact, outOfBounds: g.outOfBounds,
      })),
      readings: analysis.readings.map((r) => ({
        height: r.height, pool: r.pool, tag: r.tag, shape: r.shape,
        fields: r.decoded.fields.map(({ kind, hex, offset, text, height, unix }) => ({ kind, offset, hex, text, height, unix })),
      })),
    }, null, 1) + '\n');
  } else {
    process.stdout.write(report(analysis, { poolSource: source }) + '\n');
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => { process.stderr.write(`${e.message}\n`); process.exitCode = 1; });
}
