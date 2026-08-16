// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/taptweak.test.mjs — BIP341's output key, against BIP341's own vectors.
//
// The one check on a search card that ends in a point addition rather than a
// digest, so the one that needed a curve vendored for it (web/vendor). What is
// pinned here is the whole of what the ⋔ line claims: this leaf, under this
// control block, gives the key that output published — and, as much to the
// point, does NOT give it for a leaf or a proof that was altered.
//
// The vectors are the BIP's own (bip-0341/wallet-test-vectors.json), which
// carry the intermediate values as well as the answers: a leaf hash, a merkle
// root and a tweak scalar each, so a failure says which of the four steps went
// wrong instead of only that the last one did. Their control blocks come with
// the parity bit already set, which is what lets the point step be checked
// against something other than this module's own opinion of it.
//
//   node --test tools/taptweak.test.mjs

import test from 'node:test';
import assert from 'node:assert/strict';
import { controlBlockOf, tapLeafHash, tapRoot, tweakHolds } from '../web/btc-taptweak.js';

// One leaf, whose root is itself — the shape an inscription's commit-and-reveal
// tooling builds, there being no second path to hide.
const ONE = {
  script: '20d85a959b0290bf19bb89ed43c916be835475d013da4b362117393e25a48229b8ac',
  leaf: '5b75adecf53548f3ec6ad7d78383bf84cc57b55a3127c72b9a2481752dd88b21',
  control: 'c1187791b6f712a8ea41c8ecdd0ee77fab3e85263b37e1ec18a3651926b3a6cf27',
  output: '147c9c57132f6e7ecddba9800bb0c4449251c92a1e60371ee77557b6620f3ea3',
};
// Three leaves, so the fold runs twice and the ordering rule is exercised: the
// pair is sorted at every step, which is what lets one path prove a leaf
// without saying which side of the branch it sat on.
const THREE = {
  script: '202352d137f2f3ab38d1eaa976758873377fa5ebb817372c71e2c542313d4abda8ac',
  leaf: 'ba982a91d4fc552163cb1c0da03676102d5b7a014304c01f0c77b2b8e888de1c',
  root: 'ccbd66c6f7e8fdab47b3a486f59d28262be857f30d4773f2d5ea47f7761ce0e2',
  control: 'c0e0dfe2300b0dd746a3f8674dfd4525623639042569d829c7f0eed9602d263e6f'
    + '9e31407bffa15fefbf5090b149d53959ecdf3f62b1246780238c24501d5ceaf6'
    + '2645a02e0aac1fe69d69755733a9b7621b694bb5b5cde2bbfc94066ed62b9817',
  output: '91b64d5324723a985170e4dc5a0f84c041804f2cd12660fa5dec09fc21783605',
};

test('a control block is read as BIP341 lays one out', () => {
  const one = controlBlockOf(ONE.control);
  assert.equal(one.version, 0xc0, 'the version is not the byte with its parity masked off');
  assert.equal(one.parity, 1, 'the parity bit is not the low one');
  assert.deepEqual(one.path, [], 'a single-leaf tree has an empty path');
  const three = controlBlockOf(THREE.control);
  assert.equal(three.path.length, 2, 'two siblings prove a leaf of three');
  assert.equal(three.parity, 0);
  // 33 + 32m, or it is not a control block and proves nothing. Reading one out
  // of bytes that are not one would be inventing a proof.
  assert.equal(controlBlockOf('c0' + 'ab'.repeat(31)), null, 'too short');
  assert.equal(controlBlockOf('c0' + 'ab'.repeat(32) + 'cd'.repeat(16)), null, 'a half sibling');
  assert.equal(controlBlockOf(''), null);
  assert.equal(controlBlockOf(null), null);
});

test('the leaf hash and the merkle root are the BIP’s own', async () => {
  // Step one, and the version is hashed with the script: two leaves differing
  // only in version are different leaves.
  assert.equal(await tapLeafHash(ONE.script, 0xc0), ONE.leaf);
  assert.equal(await tapLeafHash(THREE.script, 0xc0), THREE.leaf);
  assert.notEqual(await tapLeafHash(ONE.script, 0xc2), ONE.leaf, 'the version is not hashed in');
  // Step two. With no siblings the root is the leaf; with two the fold runs
  // twice, sorting each pair.
  assert.equal(await tapRoot(ONE.leaf, []), ONE.leaf);
  assert.equal(await tapRoot(THREE.leaf, controlBlockOf(THREE.control).path), THREE.root);
});

test('the tweak holds for the BIP’s vectors, and not for an altered spend', async () => {
  // The whole check, end to end, including the point addition and the parity
  // bit — which is why these two cases are worth having: ONE's control block
  // writes parity 1 and THREE's writes 0, so a check that ignored the bit
  // would pass one and fail the other rather than passing both.
  assert.equal(await tweakHolds(ONE.script, ONE.control, ONE.output), true, 'one leaf');
  assert.equal(await tweakHolds(THREE.script, THREE.control, THREE.output), true, 'three leaves');

  // …and false where it should be false. Each of these is a spend that would
  // not have been accepted, so a check answering true to any of them would be
  // worse than no check at all.
  const flip = (h, i) => h.slice(0, i) + (h[i] === 'a' ? 'b' : 'a') + h.slice(i + 1);
  assert.equal(await tweakHolds(flip(ONE.script, 10), ONE.control, ONE.output), false,
    'another leaf passes this output’s check');
  assert.equal(await tweakHolds(ONE.script, ONE.control, flip(ONE.output, 10)), false,
    'this leaf proves another output');
  assert.equal(await tweakHolds(ONE.script, 'c0' + ONE.control.slice(2), ONE.output), false,
    'the parity bit is not checked');
  assert.equal(await tweakHolds(THREE.script, ONE.control, THREE.output), false,
    'a proof from another tree');
  // A sibling reordered inside the path: the fold sorts each pair, so swapping
  // the two changes which branch is claimed and must not still verify.
  const p = controlBlockOf(THREE.control).path;
  assert.equal(await tweakHolds(THREE.script,
    THREE.control.slice(0, 66) + p[1] + p[0], THREE.output), false, 'the path’s order is ignored');

  // Null, never false, where the check cannot be taken at all: a claim nobody
  // could settle is not one that failed, and the page draws no mark on null
  // where it draws ☒ on false.
  assert.equal(await tweakHolds(ONE.script, 'aabb', ONE.output), null, 'not a control block');
  assert.equal(await tweakHolds(ONE.script, ONE.control, null), null, 'no output key');
  assert.equal(await tweakHolds(null, ONE.control, ONE.output), null, 'no leaf');
  // An internal key that is not a point on the curve cannot be lifted, so
  // there is nothing to add the tweak to.
  assert.equal(await tweakHolds(ONE.script, 'c1' + 'ff'.repeat(32), ONE.output), null,
    'a key off the curve is reported as a failed check');
});
