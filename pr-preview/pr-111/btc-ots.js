// SPDX-License-Identifier: MIT OR Apache-2.0
//
// btc-ots.js — an OpenTimestamps proof reader: a .ots file in, the chapter
// and §section it was stamped into out.
//
// An OpenTimestamps proof is a list of commitment operations -- append,
// prepend, sha256, ripemd160 -- applied in order to a file's digest. Replay
// them and the 32 bytes left in hand are the merkle root of a Bitcoin block;
// the attestation the operations terminate in names that block by height.
// Which makes a proof a citation written in someone else's notation, and one
// this book can read: the height gives volume·book·chapter, and the merkle
// path gives the §section. Each step of that path either appends the sibling
// on the right (so the message is the left child) or prepends the sibling on
// the left (so it is the right child), and those directions, read from the
// bottom of the tree up, spell the transaction's position in its block in
// binary. A timestamp says when; read this way it also says where.
//
// Nothing here touches the network, and nothing here verifies anything: the
// reader returns what the proof claims -- a height, a merkle root, a position
// -- and the caller checks that root against the chain, which is the whole of
// OpenTimestamps verification. A proof that has not been checked against a
// block header is an assertion like any other.
//
// Format: opentimestamps/python-opentimestamps, opentimestamps/core.

// The magic the format opens with, chosen (per its own comment) to say what
// the file is in a hexdump while reading as data to file(1).
const MAGIC = Uint8Array.from('\x00OpenTimestamps\x00\x00Proof\x00\xbf\x89\xe2\xe8\x84\xe8\x92\x94',
  (c) => c.charCodeAt(0));

// The attestations a proof can terminate in, by their 8-byte tags. Bitcoin is
// the one this book can resolve; the others are named so a proof carrying them
// can be reported rather than rejected as unreadable.
const ATTESTATIONS = {
  '0588960d73d71901': 'bitcoin',
  '06869a0d73d71b45': 'litecoin',
  '30fe8087b5c7ead7': 'ethereum',
  '83dfe30d2ef90c8e': 'pending',
};

// The hash a proof's own digest was taken with, by op tag, and its length.
const FILE_HASHES = { 0x02: ['sha1', 20], 0x03: ['ripemd160', 20], 0x08: ['sha256', 32], 0x67: ['keccak256', 32] };

const bytesToHex = (b) => Array.from(b).map((x) => x.toString(16).padStart(2, '0')).join('');
const reversedHex = (b) => bytesToHex(Uint8Array.from(b).reverse());
const concat = (a, b) => { const out = new Uint8Array(a.length + b.length); out.set(a); out.set(b, a.length); return out; };

class Reader {
  constructor(bytes) { this.bytes = bytes; this.pos = 0; }
  get done() { return this.pos >= this.bytes.length; }
  raw(n) {
    if (this.pos + n > this.bytes.length) throw new Error('proof ends mid-value');
    const b = this.bytes.subarray(this.pos, this.pos + n);
    this.pos += n;
    return b;
  }
  u8() { return this.raw(1)[0]; }
  // Little-endian base128 (LEB128), the format's one integer encoding.
  varuint() {
    let value = 0, shift = 0;
    for (;;) {
      const b = this.u8();
      value += (b & 0x7f) * 2 ** shift;          // arithmetic, not <<: heights outstrip 32 bits eventually
      if (!(b & 0x80)) return value;
      shift += 7;
      if (shift > 63) throw new Error('varuint too long');
    }
  }
  varbytes() { return this.raw(this.varuint()); }
}

// ─── the hashes a proof may call for ────────────────────────────────────
//
// SHA-256 and SHA-1 come from WebCrypto. RIPEMD-160 does not -- no browser
// offers it -- and a proof from before the calendar servers needs it: those
// timestamps were committed as a hash160 sitting in a pay-to-pubkey-hash
// output, so the very first operation is a RIPEMD-160. It is 80 rounds of
// two parallel lines, and it is here for the same reason base58check is in
// btc-tx.js: the book carries its own arithmetic.

const RL = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
  7, 4, 13, 1, 10, 6, 15, 3, 12, 0, 9, 5, 2, 14, 11, 8,
  3, 10, 14, 4, 9, 15, 8, 1, 2, 7, 0, 6, 13, 11, 5, 12,
  1, 9, 11, 10, 0, 8, 12, 4, 13, 3, 7, 15, 14, 5, 6, 2,
  4, 0, 5, 9, 7, 12, 2, 10, 14, 1, 3, 8, 11, 6, 15, 13];
const RR = [
  5, 14, 7, 0, 9, 2, 11, 4, 13, 6, 15, 8, 1, 10, 3, 12,
  6, 11, 3, 7, 0, 13, 5, 10, 14, 15, 8, 12, 4, 9, 1, 2,
  15, 5, 1, 3, 7, 14, 6, 9, 11, 8, 12, 2, 10, 0, 4, 13,
  8, 6, 4, 1, 3, 11, 15, 0, 5, 12, 2, 13, 9, 7, 10, 14,
  12, 15, 10, 4, 1, 5, 8, 7, 6, 2, 13, 14, 0, 3, 9, 11];
const SL = [
  11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8,
  7, 6, 8, 13, 11, 9, 7, 15, 7, 12, 15, 9, 11, 7, 13, 12,
  11, 13, 6, 7, 14, 9, 13, 15, 14, 8, 13, 6, 5, 12, 7, 5,
  11, 12, 14, 15, 14, 15, 9, 8, 9, 14, 5, 6, 8, 6, 5, 12,
  9, 15, 5, 11, 6, 8, 13, 12, 5, 12, 13, 14, 11, 8, 5, 6];
const SR = [
  8, 9, 9, 11, 13, 15, 15, 5, 7, 7, 8, 11, 14, 14, 12, 6,
  9, 13, 15, 7, 12, 8, 9, 11, 7, 7, 12, 7, 6, 15, 13, 11,
  9, 7, 15, 11, 8, 6, 6, 14, 12, 13, 5, 14, 13, 13, 7, 5,
  15, 5, 8, 11, 14, 14, 6, 14, 6, 9, 12, 9, 12, 5, 15, 8,
  8, 5, 12, 9, 12, 5, 14, 6, 8, 13, 6, 5, 15, 13, 11, 11];
const KL = [0x00000000, 0x5a827999, 0x6ed9eba1, 0x8f1bbcdc, 0xa953fd4e];
const KR = [0x50a28be6, 0x5c4dd124, 0x6d703ef3, 0x7a6d76e9, 0x00000000];
const rol = (x, n) => ((x << n) | (x >>> (32 - n))) >>> 0;
const rmdF = (j, x, y, z) => (
  j < 16 ? x ^ y ^ z
    : j < 32 ? (x & y) | (~x & z)
      : j < 48 ? (x | ~y) ^ z
        : j < 64 ? (x & z) | (y & ~z)
          : x ^ (y | ~z)) >>> 0;

function ripemd160(msg) {
  const len = msg.length;
  const padded = new Uint8Array(((len + 8) >> 6) * 64 + 64);
  padded.set(msg);
  padded[len] = 0x80;
  new DataView(padded.buffer).setUint32(padded.length - 8, (len * 8) >>> 0, true);
  new DataView(padded.buffer).setUint32(padded.length - 4, Math.floor(len / 0x20000000), true);

  let h = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0];
  const view = new DataView(padded.buffer);
  const x = new Array(16);
  for (let off = 0; off < padded.length; off += 64) {
    for (let i = 0; i < 16; i++) x[i] = view.getUint32(off + i * 4, true);
    let [al, bl, cl, dl, el] = h;
    let [ar, br, cr, dr, er] = h;
    for (let j = 0; j < 80; j++) {
      const round = (j / 16) | 0;
      let t = (rol((al + rmdF(j, bl, cl, dl) + x[RL[j]] + KL[round]) >>> 0, SL[j]) + el) >>> 0;
      al = el; el = dl; dl = rol(cl, 10); cl = bl; bl = t;
      t = (rol((ar + rmdF(79 - j, br, cr, dr) + x[RR[j]] + KR[round]) >>> 0, SR[j]) + er) >>> 0;
      ar = er; er = dr; dr = rol(cr, 10); cr = br; br = t;
    }
    h = [(h[1] + cl + dr) >>> 0, (h[2] + dl + er) >>> 0, (h[3] + el + ar) >>> 0,
      (h[4] + al + br) >>> 0, (h[0] + bl + cr) >>> 0];
  }
  const out = new Uint8Array(20);
  const ov = new DataView(out.buffer);
  h.forEach((word, i) => ov.setUint32(i * 4, word, true));
  return out;
}

const webcrypto = (name, bytes) => crypto.subtle.digest(name, bytes).then((b) => new Uint8Array(b));

// One commitment operation applied to the message it commits. The four
// non-hashing ops are the format's way of writing "your data sat here, with
// this on either side of it" -- which is how a merkle path, and a raw
// transaction wrapped around its commitment, are both spelled.
async function applyOp(tag, arg, msg) {
  switch (tag) {
    case 0xf0: return concat(msg, arg);                          // append
    case 0xf1: return concat(arg, msg);                          // prepend
    case 0xf2: return Uint8Array.from(msg).reverse();            // reverse
    case 0xf3: return Uint8Array.from(bytesToHex(msg), (c) => c.charCodeAt(0));   // hexlify
    case 0x02: return webcrypto('SHA-1', msg);
    case 0x03: return ripemd160(msg);
    case 0x08: return webcrypto('SHA-256', msg);
    case 0x67: throw new Error('this proof uses KECCAK-256 (an Ethereum attestation), which the book does not read');
    default: throw new Error(`unknown commitment operation 0x${tag.toString(16)}`);
  }
}

// ─── reading the proof ──────────────────────────────────────────────────

// The book's reading of a completed merkle path: how deep the tree was, and
// where in it the transaction sat. Working back from the attestation, a
// Bitcoin merkle path is a run of [sibling, sha256, sha256] triples -- one
// per level -- and a prepended sibling means the message was the right child
// at that level. Bit 0 is the level nearest the transaction, so the
// directions read bottom-up are the position, in binary. The step before the
// lowest triple is the transaction itself, hashed: its txid.
//
// This is arithmetic on a well-formed path, not a guarantee -- a proof is
// free to carry operations in some other shape, in which case the position
// comes back null and only the height and the root are claimed.
function readMerklePath(steps) {
  const directions = [];
  let i = steps.length - 1;
  let txid = null;
  while (i >= 2) {
    const [sib, first, second] = [steps[i - 2], steps[i - 1], steps[i]];
    const sibling = (sib.op === 0xf0 || sib.op === 0xf1) && sib.arg.length === 32;
    if (!sibling || first.op !== 0x08 || second.op !== 0x08) break;
    directions.unshift(sib.op === 0xf1 ? 1 : 0);
    txid = i >= 3 ? steps[i - 3].result : null;
    i -= 3;
  }
  if (!directions.length) return { index: null, depth: 0, txid: null };
  // The walk runs from the top of the tree down, and each level found is
  // unshifted in front of the last -- so `directions` ends up ordered from the
  // bottom up, and its first entry is the bit worth one.
  let index = 0;
  directions.forEach((bit, level) => { if (bit) index += 2 ** level; });
  return { index, depth: directions.length, txid: txid && txid.length === 32 ? reversedHex(txid) : null };
}

// The operations themselves, in order, as hex -- the argument the proof makes,
// step by step, for a caller that wants to show the work rather than only its
// conclusion (the Citations register's leaf sets each rung as prose). Names, not tag
// bytes: the reading of a proof should not require the format's table.
const OP_NAMES = { 0xf0: 'append', 0xf1: 'prepend', 0xf2: 'reverse', 0xf3: 'hexlify',
  0x02: 'sha1', 0x03: 'ripemd160', 0x08: 'sha256' };
const asSteps = (steps) => steps.map((s) => ({
  op: OP_NAMES[s.op] || `op${s.op.toString(16)}`,
  arg: s.arg.length ? bytesToHex(s.arg) : '',
  result: bytesToHex(s.result),
}));

// One attestation, as the book reports it. `height`, `merkleRoot`, `txid` and
// `index` are what the proof asserts; nothing here has been checked against a
// block.
function attestation(tag, payload, msg, steps) {
  const kind = ATTESTATIONS[tag] || 'unknown';
  if (kind === 'pending') {
    let uri = '';
    try { uri = new TextDecoder().decode(new Reader(payload).varbytes()); } catch { /* leave it unnamed */ }
    return { kind, uri };
  }
  if (kind === 'bitcoin' || kind === 'litecoin') {
    const height = new Reader(payload).varuint();
    const path = kind === 'bitcoin' ? readMerklePath(steps) : { index: null, depth: 0, txid: null };
    return { kind, height, merkleRoot: reversedHex(msg), ...path, steps: asSteps(steps) };
  }
  return { kind, tag, payload: bytesToHex(payload) };
}

// Walk one branch of the proof's tree, collecting every attestation it
// reaches. A proof forks (0xff) when one digest was committed more than once
// -- the usual reason being a pending calendar alongside a block that has
// already confirmed -- so a file can hold several attestations at once, and
// they are all worth reporting.
//
// A pending attestation is a question with an address on it: the calendar it
// names will answer /timestamp/<commitment> with the rest of the proof, once
// a block has confirmed it. So a pending record carries here the two things
// that answer needs -- `commitment`, the digest as it stood when the branch
// broke off, and `span`, where in the file the record's own bytes sit, which
// is exactly the stretch an upgrade replaces with the calendar's reply.
async function walk(r, msg, steps, found, depth) {
  if (depth > 256) throw new Error('proof nested too deeply');
  for (;;) {
    const tag = r.u8();
    if (tag === 0x00) {                                    // an attestation ends this branch
      const start = r.pos - 1;
      const att = attestation(bytesToHex(r.raw(8)), r.varbytes(), msg, steps);
      if (att.kind === 'pending') { att.commitment = bytesToHex(msg); att.span = [start, r.pos]; }
      found.push(att);
      return;
    }
    if (tag === 0xff) {                                    // a fork: one branch here, then carry on
      await walk(r, msg, steps.slice(), found, depth + 1);
      continue;
    }
    const arg = (tag === 0xf0 || tag === 0xf1) ? r.varbytes() : new Uint8Array(0);
    msg = await applyOp(tag, arg, msg);
    steps.push({ op: tag, arg, result: msg });
  }
}

// Does this look like an OpenTimestamps proof? Asked of the bytes rather than
// the file name, so a proof saved under any name is still recognized.
export function isOtsProof(bytes) {
  return bytes.length >= MAGIC.length && MAGIC.every((b, i) => bytes[i] === b);
}

// A .ots file -> { version, hash, digest, attestations }. `digest` is the
// digest of the timestamped file, in the proof's own hash (sha256 unless the
// stamper chose otherwise) -- compare it against the file to learn whether
// the proof is a proof *of that file*; the attestations say when and where it
// was stamped. Throws on anything that is not a well-formed proof.
export async function parseOtsProof(bytes) {
  const data = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  if (!isOtsProof(data)) throw new Error('not an OpenTimestamps proof');
  const r = new Reader(data);
  r.raw(MAGIC.length);
  const version = r.varuint();
  if (version !== 1) throw new Error(`unsupported proof version ${version}`);
  const named = FILE_HASHES[r.u8()];
  if (!named) throw new Error('proof was taken with a hash the book does not read');
  const [hash, length] = named;
  const digest = r.raw(length);
  const attestations = [];
  await walk(r, digest, [], attestations, 0);
  return { version, hash, digest: bytesToHex(digest), attestations };
}

// The digest of a file, in whichever hash a proof was taken with -- so a
// reader who has both can see for themselves that the proof is about the file
// in their hand and not some other one.
export async function digestOf(bytes, hash = 'sha256') {
  const data = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  if (hash === 'sha256') return bytesToHex(await webcrypto('SHA-256', data));
  if (hash === 'sha1') return bytesToHex(await webcrypto('SHA-1', data));
  if (hash === 'ripemd160') return bytesToHex(ripemd160(data));
  throw new Error(`cannot take a ${hash} digest here`);
}

// The earliest block a proof reaches: with several Bitcoin attestations, the
// lowest height is the strongest claim the proof makes, since existence at a
// block implies existence at every block after it.
export const earliestBitcoin = (attestations) =>
  attestations.filter((a) => a.kind === 'bitcoin').sort((a, b) => a.height - b.height)[0] || null;
