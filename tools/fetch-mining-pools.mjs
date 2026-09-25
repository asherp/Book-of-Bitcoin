// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/fetch-mining-pools.mjs — vendor mempool.space's registry of mining
// pools, so the book can name a block's pool the way mempool does without
// asking mempool, and read a pool's own addresses as a ledger.
//
// The registry is mempool/mining-pools' pools-v2.json: every pool mempool
// recognises, with the payout addresses and coinbase tags it is recognised
// by. It is MIT-licensed (Copyright (c) 2019 btc.com), so the copy carries
// that notice. What is written is web/btc-mempool-pools.js -- a module rather
// than a .json file, because the book's pages import modules and a license
// notice has nowhere to live in JSON -- holding the registry's own values,
// untouched, one pool per line so a refresh diffs pool by pool.
//
//   node tools/fetch-mining-pools.mjs                    # refresh the copy
//   node tools/fetch-mining-pools.mjs --dry-run          # report, write nothing
//   node tools/fetch-mining-pools.mjs --summary FILE     # also write the report
//
// The copy is pinned to the commit it came from when GitHub will say which
// that is (GITHUB_TOKEN is used where set, as in the scheduled workflow);
// otherwise the file on master is read and the commit is recorded as unknown
// rather than guessed. The registry is checked before anything is written:
// a shape the book cannot read stops the run. An unchanged registry writes
// nothing, not even a fresh date.

import { readFile, writeFile } from 'node:fs/promises';

const REPO = 'mempool/mining-pools';
const PATH = 'pools-v2.json';
const OUT = new URL('../web/btc-mempool-pools.js', import.meta.url);
const DRY = process.argv.includes('--dry-run');
const SUMMARY = process.argv.includes('--summary') ? process.argv[process.argv.indexOf('--summary') + 1] : null;

const raw = (ref, path) => `https://raw.githubusercontent.com/${REPO}/${ref}/${path}`;

async function text(url, headers = {}) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`${url} answered ${res.status}`);
  return res.text();
}

// The newest commit that touched the registry, or null where GitHub will not
// say (no network to its API, or a rate limit).
async function latestCommit() {
  const headers = { accept: 'application/vnd.github+json' };
  if (process.env.GITHUB_TOKEN) headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  try {
    const list = JSON.parse(await text(`https://api.github.com/repos/${REPO}/commits?path=${PATH}&per_page=1`, headers));
    const sha = Array.isArray(list) ? list[0]?.sha : null;
    return /^[0-9a-f]{40}$/.test(sha || '') ? sha : null;
  } catch { return null; }
}

// What the book reads of each pool, and nothing it does not: the check is on
// the fields every reader downstream relies on.
function check(pools) {
  if (!Array.isArray(pools) || !pools.length) throw new Error('the registry is not a list of pools');
  const ids = new Set();
  for (const [i, p] of pools.entries()) {
    const at = `pool ${i} (${p?.name ?? '?'})`;
    if (!p || typeof p !== 'object') throw new Error(`${at} is not an object`);
    if (!Number.isInteger(p.id)) throw new Error(`${at} has no whole-number id`);
    if (ids.has(p.id)) throw new Error(`${at} repeats id ${p.id}`);
    ids.add(p.id);
    if (typeof p.name !== 'string' || !p.name.trim()) throw new Error(`${at} has no name`);
    if (typeof p.link !== 'string') throw new Error(`${at} has no link`);
    for (const field of ['addresses', 'tags']) {
      if (!Array.isArray(p[field]) || p[field].some((v) => typeof v !== 'string' || !v)) {
        throw new Error(`${at}: ${field} is not a list of strings`);
      }
    }
    // mempool applies each tag as a case-insensitive regular expression; one
    // that does not compile is one mempool itself could not use.
    for (const tag of p.tags) {
      try { new RegExp(tag, 'i'); } catch { throw new Error(`${at}: tag ${JSON.stringify(tag)} is not a regular expression`); }
    }
  }
}

// Pool by pool, what a refresh changed -- the report a reviewer reads.
function compare(before, after) {
  const byId = (list) => new Map(list.map((p) => [p.id, p]));
  const old = byId(before);
  const now = byId(after);
  const added = after.filter((p) => !old.has(p.id)).map((p) => p.name);
  const removed = before.filter((p) => !now.has(p.id)).map((p) => p.name);
  const changed = after.filter((p) => old.has(p.id) && JSON.stringify(old.get(p.id)) !== JSON.stringify(p)).map((p) => {
    const was = old.get(p.id);
    const diff = (field) => {
      const plus = p[field].filter((v) => !was[field].includes(v)).length;
      const minus = was[field].filter((v) => !p[field].includes(v)).length;
      return plus || minus ? `${field} +${plus} −${minus}` : null;
    };
    const notes = [was.name !== p.name ? `renamed from ${was.name}` : null, was.link !== p.link ? 'link' : null,
      diff('addresses'), diff('tags')].filter(Boolean);
    return `${p.name} (${notes.join(', ')})`;
  });
  return { added, removed, changed };
}

const commit = await latestCommit();
const ref = commit ?? 'master';
const pools = JSON.parse(await text(raw(ref, PATH)));
check(pools);
const license = (await text(raw(ref, 'LICENSE'))).trim();
if (!/^MIT License/.test(license)) throw new Error('the registry is no longer MIT-licensed; refusing to copy it without reading the new terms');

let before = [];
try { ({ MEMPOOL_POOLS: before } = await import(OUT.href)); } catch { /* no copy yet */ }

const { added, removed, changed } = compare(before, pools);
const same = JSON.stringify(before) === JSON.stringify(pools);
const addresses = pools.reduce((n, p) => n + p.addresses.length, 0);
const tags = pools.reduce((n, p) => n + p.tags.length, 0);

const lines = [
  `Registry: ${REPO} ${PATH} @ ${commit ? commit.slice(0, 12) : 'master (commit unknown)'}`,
  `${pools.length} pools, ${addresses} addresses, ${tags} tags`,
  same ? 'Unchanged.' : `Added: ${added.length ? added.join(', ') : 'none'}`,
  ...(same ? [] : [`Removed: ${removed.length ? removed.join(', ') : 'none'}`,
    `Changed: ${changed.length ? changed.join('; ') : 'none'}`]),
];
const report = lines.join('\n');
console.log(report);
if (SUMMARY) await writeFile(SUMMARY, `${lines.map((l) => `- ${l}`).join('\n')}\n`);
if (same || DRY) process.exit(0);

const source = { repo: REPO, path: PATH, commit, fetched: new Date().toISOString().slice(0, 10) };
const header = `// SPDX-License-Identifier: MIT
//
// btc-mempool-pools.js — mempool.space's registry of mining pools: each pool
// with the payout addresses and coinbase tags mempool recognises it by.
// Machine-written by tools/fetch-mining-pools.mjs from
// ${REPO}/${PATH}; do not edit by hand, as the next refresh
// overwrites it. Read through web/btc-pool-registry.js.
//
// The registry is mempool's reading, not the chain's: a tag is unauthenticated
// and anyone may write one, so a pool named from it is a claim, credited to
// mempool.space wherever the book prints it.
//
// Copied under the registry's own license:
//
${license.split('\n').map((l) => `//${l ? ` ${l}` : ''}`).join('\n')}
`;
const body = `${header}
export const MEMPOOL_POOLS_SOURCE = ${JSON.stringify(source)};

export const MEMPOOL_POOLS = [
${pools.map((p) => `  ${JSON.stringify(p)},`).join('\n')}
];
`;
await writeFile(OUT, body);
console.log(`wrote ${pools.length} pools to web/btc-mempool-pools.js`);
