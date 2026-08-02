// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/fetch-release-proofs.mjs — bring the Bitcoin Core releases' own
// timestamps into the book's Citations register.
//
// Since 22.0 (September 2021), every release directory on bitcoincore.org has
// carried an OpenTimestamps proof of its checksum file: SHA256SUMS names every
// binary the release shipped as, and SHA256SUMS.ots commits that file to the
// chain the software runs. Which makes a release date the one kind of software
// date this book can cite rather than repeat -- the client, dated by its own
// chain, at the chapter its proof lands in.
//
// The server publishes each proof as it was stamped: pending, naming calendar
// servers rather than a block, because the aggregating transaction had not
// confirmed when the file went up. A pending proof cites no chapter, so this
// tool finishes the argument before vendoring it -- for each pending branch it
// asks the calendar the proof itself names (GET <uri>/timestamp/<commitment>)
// and splices the reply over the pending record's own bytes, which is all an
// OpenTimestamps upgrade is. The reply continues the proof in the same grammar
// it interrupted, so the file stays a well-formed proof, now reaching a block.
//
// Everything vendored is re-read before it is written: the proof must parse
// with the book's own reader (web/btc-ots.js), reach a Bitcoin block, and be a
// proof OF the checksum file beside it. What is not checked here is the merkle
// root against a block header -- the same division check-editorial draws: the
// book asks the chain when a reader opens the page.
//
//   node tools/fetch-release-proofs.mjs             # fetch what web/proofs/ lacks
//   node tools/fetch-release-proofs.mjs --dry-run   # report, write nothing
//
// Idempotent: a release already vendored is left alone, so a run after a new
// Bitcoin Core release fetches that release and nothing else. New entries are
// printed in appendix.yaml's own form -- the register is editorial and written
// by hand, so the tool suggests; it does not edit.

import { readFile, writeFile, readdir } from 'node:fs/promises';
import { parseOtsProof, digestOf, earliestBitcoin } from '../web/btc-ots.js';

const BIN = 'https://bitcoincore.org/bin/';
const PROOFS = new URL('../web/proofs/', import.meta.url);
const DRY = process.argv.includes('--dry-run');

// ── what the server offers ──────────────────────────────────────────────
// The release directories, as the server lists them. Versions are compared
// numerically part by part; the .0-prefixed series (0.9.5 … 0.21.2) predate
// the stamping practice and carry no proofs, so nothing below 22 is asked for.
const listing = await (await fetch(BIN)).text();
const versions = [...listing.matchAll(/href="bitcoin-core-([0-9.]+)\/"/g)]
  .map((m) => m[1])
  .filter((v) => Number(v.split('.')[0]) >= 22)
  .sort(byVersion);

function byVersion(a, b) {
  const pa = a.split('.').map(Number), pb = b.split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    if ((pa[i] || 0) !== (pb[i] || 0)) return (pa[i] || 0) - (pb[i] || 0);
  }
  return 0;
}

// ── the upgrade ─────────────────────────────────────────────────────────
// A pending attestation's record is `0x00`, the pending tag, and a varbytes
// payload naming the calendar -- and the reader reports exactly where those
// bytes sit (`span`) and the digest the calendar was handed (`commitment`).
// The calendar's answer to /timestamp/<commitment> is the rest of that branch,
// serialized in the proof's own grammar: operations and attestations from the
// commitment on. Substituting it for the pending record is therefore closed
// under the format -- where a record ended a branch, a continuation now does.
//
// Branches are spliced back to front so earlier spans stay true, and a
// calendar that will not answer costs only its own branch: the record stays
// pending there, and the proof is judged afterwards by whether any branch
// reached a block.
async function upgraded(bytes) {
  const { attestations } = await parseOtsProof(bytes);
  const pendings = attestations
    .filter((a) => a.kind === 'pending' && a.uri && a.span)
    .sort((a, b) => b.span[0] - a.span[0]);
  let out = bytes;
  for (const p of pendings) {
    try {
      const res = await fetch(`${p.uri.replace(/\/$/, '')}/timestamp/${p.commitment}`);
      if (!res.ok) throw new Error(`answered ${res.status}`);
      const reply = new Uint8Array(await res.arrayBuffer());
      if (!reply.length) throw new Error('answered nothing');
      const next = new Uint8Array(out.length - (p.span[1] - p.span[0]) + reply.length);
      next.set(out.subarray(0, p.span[0]));
      next.set(reply, p.span[0]);
      next.set(out.subarray(p.span[1]), p.span[0] + reply.length);
      await parseOtsProof(next);         // a reply that breaks the grammar is refused whole
      out = next;
    } catch (err) {
      console.warn(`   calendar ${p.uri}: ${err.message} — that branch stays pending`);
    }
  }
  return out;
}

// ── the run ─────────────────────────────────────────────────────────────
const have = new Set(await readdir(PROOFS));
const added = [];
for (const v of versions) {
  const subject = `bitcoin-core-${v}-SHA256SUMS`;
  if (have.has(`${subject}.ots`)) continue;

  const dir = `${BIN}bitcoin-core-${v}/`;
  const sumsRes = await fetch(`${dir}SHA256SUMS`);
  const otsRes = sumsRes.ok ? await fetch(`${dir}SHA256SUMS.ots`) : null;
  if (!sumsRes.ok || !otsRes.ok) {
    console.warn(`${v}: no stamped checksum file on the server — skipped`);
    continue;
  }
  const sums = new Uint8Array(await sumsRes.arrayBuffer());
  let ots = new Uint8Array(await otsRes.arrayBuffer());

  // The proof must be about the file in hand before any calendar is asked.
  const parsed = await parseOtsProof(ots);
  if ((await digestOf(sums, parsed.hash)) !== parsed.digest) {
    console.warn(`${v}: SHA256SUMS.ots does not attest SHA256SUMS — skipped`);
    continue;
  }
  if (!earliestBitcoin(parsed.attestations)) ots = await upgraded(ots);

  const att = earliestBitcoin((await parseOtsProof(ots)).attestations);
  if (!att) {
    console.warn(`${v}: still pending at every calendar — nothing to cite yet, not vendored`);
    continue;
  }
  if (!DRY) {
    await writeFile(new URL(subject, PROOFS), sums);
    await writeFile(new URL(`${subject}.ots`, PROOFS), ots);
  }
  added.push({ v, subject, height: att.height });
  console.log(`${v}: block ${att.height.toLocaleString()}${DRY ? ' (dry run — not written)' : ''}`);
}

if (!added.length) {
  console.log('Nothing to fetch — every stamped release on the server is already vendored.');
} else {
  console.log('\nEntries for the Citations part of web/appendix.yaml:\n');
  for (const { v, subject } of added) {
    console.log(`    - title: Bitcoin Core ${v}`);
    console.log(`      proof: ${subject}.ots`);
    console.log(`      subject: ${subject}`);
    console.log(`      source: ${BIN}bitcoin-core-${v}/`);
  }
}
