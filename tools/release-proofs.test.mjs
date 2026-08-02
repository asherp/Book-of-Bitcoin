// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/release-proofs.test.mjs — the vendored Bitcoin Core release proofs,
// re-read: that each one still parses with the book's own reader, reaches a
// Bitcoin block, and is a proof of the checksum file shipped beside it — and
// that a pending attestation carries what an upgrade needs to finish it,
// which is how tools/fetch-release-proofs.mjs finished these.
//
//   node --test tools/release-proofs.test.mjs

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';

import { parseOtsProof, digestOf, earliestBitcoin } from '../web/btc-ots.js';

const PROOFS = new URL('../web/proofs/', import.meta.url);
const releases = (await readdir(PROOFS)).filter((f) => /^bitcoin-core-.*\.ots$/.test(f)).sort();

test('the register vendors release proofs at all', () => {
  assert.ok(releases.length >= 32, `only ${releases.length} release proofs in web/proofs/`);
});

test('every release proof reads, reaches a block, and attests its own subject', async () => {
  for (const file of releases) {
    const proof = await parseOtsProof(new Uint8Array(await readFile(new URL(file, PROOFS))));
    const att = earliestBitcoin(proof.attestations);
    assert.ok(att, `${file} reaches no Bitcoin block`);
    assert.ok(att.index !== null, `${file}: the merkle path did not read as a §section`);
    const subject = new Uint8Array(await readFile(new URL(file.replace(/\.ots$/, ''), PROOFS)));
    assert.equal(await digestOf(subject, proof.hash), proof.digest,
      `${file} is not a proof of the checksum file beside it`);
  }
});

test('the first stamped release lands where it shipped', async () => {
  // 22.0 went up on 13 September 2021; block 700,347 was mined that week.
  // A change in this height means the vendored proof changed, which nothing
  // should ever do -- a timestamp that moves is no timestamp.
  const bytes = new Uint8Array(await readFile(new URL('bitcoin-core-22.0-SHA256SUMS.ots', PROOFS)));
  const att = earliestBitcoin((await parseOtsProof(bytes)).attestations);
  assert.equal(att.height, 700347);
});

test('a pending attestation carries the question an upgrade asks', async () => {
  // The vendored proofs have none left -- upgrading replaced every calendar
  // branch with its answer, which is the point -- so the pending shape is
  // exercised on a proof assembled here: the smallest file the format
  // allows, one digest committed to one calendar, exactly what
  // bitcoincore.org serves on release day.
  const bytes = Uint8Array.from([
    ...'\x00OpenTimestamps\x00\x00Proof\x00\xbf\x89\xe2\xe8\x84\xe8\x92\x94', // magic
    '\x01',                                                    // version
    '\x08', ...'\x11'.repeat(32),                              // sha256, the digest
    '\x00',                                                    // an attestation
    ...'\x83\xdf\xe3\x0d\x2e\xf9\x0c\x8e',                     // …pending
    String.fromCharCode(21), String.fromCharCode(20), ...'https://cal.example/', // payload: varbytes uri
  ].flatMap((s) => [...s].map((c) => c.charCodeAt(0))));
  const { attestations } = await parseOtsProof(bytes);
  assert.equal(attestations.length, 1);
  const [p] = attestations;
  assert.equal(p.kind, 'pending');
  assert.equal(p.uri, 'https://cal.example/', 'a pending attestation names its calendar');
  assert.equal(p.commitment, '11'.repeat(32), 'the commitment is the digest as the branch left it');
  const [from, to] = p.span;
  assert.equal(bytes[from], 0x00, 'the span opens on the attestation record');
  assert.equal(to, bytes.length, 'the span closes where the record does');
});
