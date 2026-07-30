// SPDX-License-Identifier: MIT OR Apache-2.0
//
// btc-proofs.js — Appendix IV's contents: the files whose existence this chain
// attests, and where each one's proof lands.
//
// A timestamped file is not a passage. It is not on the chain at all — what is
// on the chain is a commitment its proof reduces to, sitting in one transaction
// of one block. So an entry here is a file's name and a citation: the chapter
// and §section its proof lands in, which the proof states by itself, offline,
// with nothing asked of the chain (btc-ots.js).
//
// Two sources, listed as one:
//
//   the bundled proofs — shipped with the app and named in appendix.yaml, so
//   the appendix reads as an appendix on a first visit rather than as an empty
//   invitation. They are editorial in the same sense the contents is: someone
//   chose them.
//
//   the reader's own — a proof dropped on Appendix IV's leaf, kept in
//   localStorage the way a bookmark is, and listed beside the bundled ones with
//   the same ribbon a bookmark flies. The book's own list is short by nature;
//   the reader's is the one that grows.
//
// What is stored is the proof itself, base64'd, not merely its verdict. A proof
// is small (a few hundred bytes), it is the whole evidence, and keeping it means
// a kept entry can be re-read, re-checked and handed back to its owner later —
// storing only "block 358391 §1352" would keep the conclusion and throw away the
// argument, which is the one thing this book will not do.

import { parseOtsProof, earliestBitcoin, digestOf } from './btc-ots.js';
import { volumeBookChapter, reference, latinRefOf } from './btc-citation.js';

const KEPT_KEY = 'glossia-btc-proofs';
export const PROOF_DIR = './proofs/';

// localStorage carries text, a proof carries bytes.
const toBase64 = (bytes) => btoa(String.fromCharCode(...bytes));
const fromBase64 = (text) => Uint8Array.from(atob(text), (c) => c.charCodeAt(0));

// A proof, read: what it commits to, and where that commitment sits. `place` is
// null when the proof reaches no Bitcoin block — a pending proof is a promise,
// not a citation, and Appendix IV lists chapters.
export async function readProof(bytes) {
  const parsed = await parseOtsProof(bytes);
  const att = earliestBitcoin(parsed.attestations);
  return {
    digest: parsed.digest,
    hash: parsed.hash,
    pending: parsed.attestations.filter((a) => a.kind === 'pending').map((a) => a.uri),
    place: att && {
      height: att.height,
      index: att.index,
      section: att.index === null ? null : att.index + 1,
      txid: att.txid,
      merkleRoot: att.merkleRoot,
    },
  };
}

// Does this proof attest THIS file? The digest is the whole of the question,
// and the answer is arithmetic — no chain, no calendar, no author.
export const attests = async (proof, subjectBytes) =>
  (await digestOf(subjectBytes, proof.hash)) === proof.digest;

// The citation a place reads as, and the link that opens it. A proof always
// names a chapter; whether it names a §section depends on its merkle path being
// readable (btc-ots.js says so by leaving `index` null), so both forms are here.
export const citeOf = (place) => reference(place.height) + (place.section ? ` §${place.section}` : '');
export const hrefOf = (place) => (place.section
  ? `./bitcoin-book.html?ref=${latinRefOf(place.height, place.section)}`
  : `./bitcoin-book.html?block=${place.height}`);
// Reading order, the same order the book itself is in: by chapter, then by
// section within it. A file's own date has nothing to do with it — where a
// proof landed is the only order the chain knows.
export const inReadingOrder = (a, b) =>
  (a.place.height - b.place.height) || ((a.place.section ?? 0) - (b.place.section ?? 0));
export const volumeOf = (place) => volumeBookChapter(place.height);

// ─── the bundled proofs ─────────────────────────────────────────────────

// One entry of appendix.yaml's proofs part, read from the files beside it. The
// proof is fetched and parsed rather than believed: what the index carries is a
// title and a filename, and everything cited comes out of the bytes.
export async function loadBundled(entry, base = PROOF_DIR) {
  const res = await fetch(base + entry.proof);
  if (!res.ok) throw new Error(`proof ${entry.proof}: ${res.status}`);
  const bytes = new Uint8Array(await res.arrayBuffer());
  const proof = await readProof(bytes);
  let checked = null;
  if (entry.subject) {
    const sub = await fetch(base + entry.subject);
    if (sub.ok) checked = await attests(proof, new Uint8Array(await sub.arrayBuffer()));
  }
  return { ...proof, title: entry.title, file: entry.subject || entry.proof, note: entry.note, checked, bundled: true };
}

// Every bundled proof that reaches a block, in reading order. One that cannot be
// read or has not confirmed is dropped rather than shown broken: the appendix
// lists what the chain attests, and a proof that names no chapter names nothing.
export async function bundledProofs(part, base = PROOF_DIR) {
  if (!part?.entries?.length) return [];
  const read = await Promise.all(part.entries.map((e) => loadBundled(e, base).catch(() => null)));
  return read.filter((p) => p && p.place).sort(inReadingOrder);
}

// ─── the reader's own ───────────────────────────────────────────────────

// Kept proofs, newest first as stored, each carrying its own bytes. A record
// that will not parse is dropped on the way out -- storage that has been edited
// by hand, or written by a future version, must never break the page reading it.
export function keptProofs() {
  try {
    const v = JSON.parse(localStorage.getItem(KEPT_KEY));
    return Array.isArray(v) ? v.filter((p) => p && typeof p.ots === 'string' && p.file) : [];
  } catch { return []; }
}

// A kept record, read back into the same shape a bundled proof takes -- so the
// contents and the leaf can list both without asking which is which.
export async function keptPlaces() {
  const out = [];
  for (const rec of keptProofs()) {
    try {
      const proof = await readProof(fromBase64(rec.ots));
      if (proof.place) {
        out.push({ ...proof, title: rec.title || rec.file, file: rec.file, kept: true,
          added: rec.added, verified: rec.verified ?? null, checked: rec.checked ?? null });
      }
    } catch { /* an unreadable record simply isn't listed */ }
  }
  return out.sort(inReadingOrder);
}

// Keep a proof, keyed by its digest: the same file stamped twice is one entry,
// and re-dropping a proof updates it rather than doubling it.
// `verified` records whether the proof's root was matched against the block's
// own header at the moment it was kept, and `checked` whether the stamped file
// was in hand to match the digest against. Both are remembered rather than
// assumed: an entry added offline is still an entry, but it says of itself that
// nobody has been asked yet.
export function keepProof({ file, title, bytes, digest, verified = null, checked = null }) {
  const rec = { file, title: title || file, digest, ots: toBase64(bytes), verified, checked,
    added: Math.floor(Date.now() / 1000) };
  const kept = keptProofs().filter((p) => p.digest !== digest);
  kept.unshift(rec);
  try { localStorage.setItem(KEPT_KEY, JSON.stringify(kept)); } catch { return false; }
  return true;
}

export function dropProof(digest) {
  try { localStorage.setItem(KEPT_KEY, JSON.stringify(keptProofs().filter((p) => p.digest !== digest))); }
  catch { /* nothing kept, nothing to drop */ }
}

export const isKept = (digest) => keptProofs().some((p) => p.digest === digest);

// The whole appendix, bundled and kept together in reading order -- what the
// contents lists under Appendix IV and what its leaf shows above the picker.
export async function allProofs(part, base = PROOF_DIR) {
  const [bundled, kept] = await Promise.all([bundledProofs(part, base), keptPlaces()]);
  const seen = new Set(bundled.map((p) => p.digest));
  return [...bundled, ...kept.filter((p) => !seen.has(p.digest))].sort(inReadingOrder);
}
