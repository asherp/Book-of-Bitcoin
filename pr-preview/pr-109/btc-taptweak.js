// SPDX-License-Identifier: MIT OR Apache-2.0
//
// btc-taptweak.js — BIP341's output key, recomputed from the spend.
//
// A taproot output publishes one 32-byte key and says nothing about what
// opens it. A script-path spend hands over two things — the leaf it ran and
// the control block — and the claim binding them to that output is that the
// leaf, hashed up its branch and added to the internal key, IS the key the
// output published. Every other check on a search card is a hash the page can
// take; this one ends in a point addition, which is why it was stated and not
// taken until now.
//
// Four steps, three of them hashing:
//
//   1. the leaf hash   TapLeaf(version ‖ compact_size(script) ‖ script)
//   2. the merkle root TapBranch(min ‖ max), folded over the control block's
//                      32-byte siblings — none for a single-leaf tree, whose
//                      root simply is its leaf
//   3. the tweak       t = TapTweak(internal key ‖ root)
//   4. the point       Q = P + tG, and Q is the output key if its x matches
//                      and its y's parity is the bit the control block wrote
//
// Step 4 is the whole reason a library is vendored here (see web/vendor). The
// arithmetic is not this book's to invent, and every input is public — a
// script, a control block, a key the chain already published — so nothing
// secret passes through and the timing of any of it is nobody's business.
//
// Async because the tagged hashes are: SHA-256 arrives through WebCrypto, the
// same road the sighash digests take.

import { Point } from './vendor/noble-secp256k1.js';
import { taggedHash } from './btc-sighash.js';

const bytesOf = (h) => Uint8Array.from((String(h).match(/../g) || []).map((b) => parseInt(b, 16)));

// A script's length as the wire writes it before the script itself. Only the
// first two forms can arise: a tapscript over 0xffff bytes exceeds what a
// witness item may carry.
const compactSize = (n) => {
  if (n < 0xfd) return n.toString(16).padStart(2, '0');
  if (n <= 0xffff) return `fd${(n & 0xff).toString(16).padStart(2, '0')}${(n >> 8).toString(16).padStart(2, '0')}`;
  return null;
};

// BIP341's control block: the leaf version with the output key's y-parity in
// its low bit, the 32-byte internal key, then a whole number of 32-byte
// siblings. Null for anything else — a witness item that is not a control
// block proves nothing, and reading one out of it would be inventing a proof.
export function controlBlockOf(hex) {
  const h = String(hex || '').toLowerCase();
  const n = h.length / 2;
  if (n < 33 || (n - 33) % 32 !== 0) return null;
  const lead = parseInt(h.slice(0, 2), 16);
  if (Number.isNaN(lead)) return null;
  const path = [];
  for (let i = 66; i < h.length; i += 64) path.push(h.slice(i, i + 64));
  return { version: lead & 0xfe, parity: lead & 1, internal: h.slice(2, 66), path };
}

// The leaf, hashed as consensus hashes it.
export async function tapLeafHash(scriptHex, version) {
  const size = compactSize(String(scriptHex).length / 2);
  if (size === null) return null;
  return taggedHash('TapLeaf', version.toString(16).padStart(2, '0') + size + String(scriptHex).toLowerCase());
}

// …and folded up its branch. The pair is ordered by value at every step, which
// is what lets one path prove a leaf without saying which side it sat on.
export async function tapRoot(leafHash, path) {
  let k = leafHash;
  for (const sib of path) {
    k = await taggedHash('TapBranch', k <= sib ? k + sib : sib + k);
  }
  return k;
}

// The whole check: does this leaf, under this control block, give the key the
// output published?
//
// Null where it cannot be taken at all — bytes that are not a control block,
// an internal key that is not a point on the curve — and never false, because
// a check nobody could carry out is not a check that failed. Callers draw a
// verdict on true and false and no mark on null, which is the same rule the
// rest of this book keeps for a value it cannot compute honestly.
// The key this spend's own bytes give, and the root it passed through on the
// way. Returned rather than only compared, so a reader can be shown the
// working: the leaf, what it folded to, and the key that came out.
export async function tweakedKeyOf(scriptHex, controlHex) {
  const cb = controlBlockOf(controlHex);
  if (!cb || !scriptHex) return null;
  try {
    const leaf = await tapLeafHash(scriptHex, cb.version);
    if (!leaf) return null;
    const root = await tapRoot(leaf, cb.path);
    const t = await taggedHash('TapTweak', cb.internal + root);
    // The x-only internal key, lifted to its even-y point: that is what an
    // x-only key means, and a 02-prefixed compressed key is how the public API
    // says it. A key off the curve throws, and throwing is a null below.
    const P = Point.fromBytes(bytesOf(`02${cb.internal}`));
    const a = P.add(Point.BASE.multiply(BigInt(`0x${t}`))).toAffine();
    return { leaf, root, tweak: t, key: a.x.toString(16).padStart(64, '0'), evenY: a.y % 2n === 0n };
  } catch { return null; }
}

export async function tweakHolds(scriptHex, controlHex, outputKeyHex) {
  if (!outputKeyHex) return null;
  const got = await tweakedKeyOf(scriptHex, controlHex);
  if (!got) return null;
  // Both halves, because the x alone does not name a point: the control block
  // wrote which of the two y's consensus meant, and a spend that got that bit
  // wrong is not this output's.
  return got.key === String(outputKeyHex).toLowerCase()
    && got.evenY === (controlBlockOf(controlHex).parity === 0);
}
