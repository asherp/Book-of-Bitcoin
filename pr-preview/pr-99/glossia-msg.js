// SPDX-License-Identifier: MIT OR Apache-2.0
//
// glossia-msg.js — message → encrypted Glossia artifact, as an ES module.
//
// Shared content pipeline for the demo panel (index.html) and the bulletin
// board (compose.html / bulletin.html):
//
//   encode: message + credential -> reduce -> AES-256-GCM -> "<prose> — <attribution>"
//   decode: "<prose> — <attribution>" + credential -> verify + decrypt -> message
//
// The CREDENTIAL is polymorphic:
//   • a passphrase string  -> key+nonce via PBKDF2-SHA-256 (200k) — the demo's
//     human-typed symmetric password.
//   • a 32-byte Uint8Array -> key+nonce via HKDF-SHA-256 — the board "read key"
//     (derived from the signing key in glossia-nostr.js); already high-entropy,
//     so no slow stretching is needed.
// The on-the-wire format is identical either way; the derivation is chosen by
// credential type, and each flow uses one type consistently, so decoding never
// needs to record which was used.
//
// With NO credential the bytes are compressed and encoded but not encrypted; a
// [flag][len] header rides inside the prose and the artifact is bare prose,
// readable by anyone. AES-256-GCM is authenticated: a wrong credential or any
// tampering fails cleanly.
//
// The glossia WASM (encode_raw_base_n / decode_raw_base_n) is loaded from the
// same ./glossia.js bundle; call init() once first.

import init, {
  encode_raw_base_n as wasmEncodeRawBaseN,
  encode_raw_base_n_best_of as wasmEncodeRawBaseNBestOf,
  decode_raw_base_n as wasmDecodeRawBaseN,
  detect_dialect_from_text as wasmDetectDialect,
  canonical_encode_fixed_traced as wasmCanonicalEncodeTraced,
  canonical_decode_fixed as wasmCanonicalDecode,
  canonical_decode as wasmCanonicalDecodeSelf,
} from './glossia.js';

export { init };

const SEED = 42n;               // fixed seed -> deterministic prose

// Languages this pipeline can render into / detect from. Labels are
// endonyms -- each language names itself, so a reader finds their own
// tongue without first reading English.
export const MSG_LANGS = [
  { id: 'english', label: 'English',  language: 'english', wordlist: 'bip39',   dialect: 'body' },
  { id: 'latin',   label: 'Latina',   language: 'latin',   wordlist: 'default', dialect: 'body' },
  { id: 'czech',   label: 'Čeština',  language: 'czech',   wordlist: 'default', dialect: 'body' },
  { id: 'german',  label: 'Deutsch',  language: 'german',  wordlist: 'default', dialect: 'body' },
];
// The tongue the book is set in for a reader who has not chosen one. Latin: the
// book is a record first and a reading second, and Latin says so — it is nobody's
// native tongue now, so its prose reads as what it is, a notation, rather than as
// a claim about the bytes in a language someone might mistake for commentary.
// (It is also the shortest: the Latin payload wordlist is 32768 words, 15 bits
// to English's 11, so the same hash lands in about a quarter fewer words.)
// Named rather than taken from MSG_LANGS[0], so the menu's display order and the
// default are separate decisions.
export const DEFAULT_LANG_ID = 'latin';
export function msgLangById(id) {
  return MSG_LANGS.find(l => l.id === id)
    || MSG_LANGS.find(l => l.id === DEFAULT_LANG_ID);
}

// ─── the book's language ──────────────────────────────────────────────
// Which of MSG_LANGS the book's prose is set in, chosen by the reader and
// persisted across pages and visits. The bytes are the record and never
// change; the language is typography -- any choice decodes back to the same
// transaction (decodeCanonical detects the language from the prose itself).
// Kept here beside MSG_LANGS so every page that encodes reads one source of
// truth. Guarded for non-browser callers (the node test suite imports this
// module transitively): no localStorage, no persistence, DEFAULT_LANG_ID.
const BOOK_LANG_KEY = 'glossia-btc-lang';
let bookLangId = (() => {
  try { return msgLangById(localStorage.getItem(BOOK_LANG_KEY)).id; }
  catch { return DEFAULT_LANG_ID; }
})();
export function bookLang() { return bookLangId; }
export function setBookLang(id) {
  bookLangId = msgLangById(id).id;
  try {
    localStorage.setItem(BOOK_LANG_KEY, bookLangId);
    // The chrome follows the prose except into Latin: Latin prose is a real
    // choice, a Latin chrome would be an affectation, so the UI keeps the
    // last modern tongue chosen (btc-strings.js reads this key). Latin
    // simply doesn't write it.
    if (bookLangId !== 'latin') localStorage.setItem('glossia-btc-ui-lang', bookLangId);
  } catch { /* private mode etc. -- the choice still holds for this page */ }
  return bookLangId;
}

const TE = new TextEncoder();
const TD = new TextDecoder();

function toHex(bytes) { return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join(''); }
function fromHex(h) {
  const clean = h.trim().toLowerCase().replace(/[^0-9a-f]/g, '');
  const out = new Uint8Array(clean.length >> 1);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(clean.substr(i * 2, 2), 16);
  return out;
}

// ─── compression (CompressionStream) ──────────────────────────────────
async function gzipBytes(bytes) {
  const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream('gzip'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}
async function gunzipBytes(bytes) {
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}
// Pack pure-ASCII bytes 7-bits-wide: [charCount:u16 BE][7-bit packed stream].
function asciiPack7(bytes) {
  const L = bytes.length;
  if (L > 0xffff) return null;
  for (let i = 0; i < L; i++) if (bytes[i] > 0x7f) return null;
  const out = new Uint8Array(2 + Math.ceil(L * 7 / 8));
  out[0] = (L >> 8) & 0xff; out[1] = L & 0xff;
  let acc = 0, bits = 0, pos = 2;
  for (let i = 0; i < L; i++) {
    acc = (acc << 7) | bytes[i];
    bits += 7;
    while (bits >= 8) { bits -= 8; out[pos++] = (acc >> bits) & 0xff; }
  }
  if (bits > 0) out[pos++] = (acc << (8 - bits)) & 0xff;
  return out;
}
function asciiUnpack7(packed) {
  const L = (packed[0] << 8) | packed[1];
  const out = new Uint8Array(L);
  let acc = 0, bits = 0, pos = 2, n = 0;
  while (n < L) {
    acc = (acc << 8) | (packed[pos++] || 0);
    bits += 8;
    while (bits >= 7 && n < L) { bits -= 7; out[n++] = (acc >> bits) & 0x7f; }
  }
  return out;
}
// Pick the smallest representation; flag records it: 0=raw 1=gzip 2=7-bit pack.
async function maybeReduce(bytes) {
  let best = { data: bytes, flag: 0 };
  const a7 = asciiPack7(bytes);
  if (a7 && a7.length < best.data.length) best = { data: a7, flag: 2 };
  if (typeof CompressionStream !== 'undefined') {
    try {
      const gz = await gzipBytes(bytes);
      if (gz.length < best.data.length) best = { data: gz, flag: 1 };
    } catch (e) { /* keep current best */ }
  }
  return best;
}
async function expand(bytes, flag) {
  if (flag === 1) return gunzipBytes(bytes);
  if (flag === 2) return asciiUnpack7(bytes);
  return bytes;
}

// ─── per-message AES-256-GCM key + nonce, from a credential + salt ─────
// Both key and nonce are derived (so the nonce is never transmitted); a fresh
// random salt per message keeps every (key, nonce) unique. A passphrase string
// is stretched with PBKDF2; a 32-byte key is expanded with HKDF (no stretching
// needed — it is already high-entropy).
function hasCred(c) { return (typeof c === 'string' && c.length > 0) || (c instanceof Uint8Array && c.length > 0); }

async function deriveKeyNonce(cred, salt) {
  let bits;
  if (cred instanceof Uint8Array) {
    const base = await crypto.subtle.importKey('raw', cred, 'HKDF', false, ['deriveBits']);
    bits = new Uint8Array(await crypto.subtle.deriveBits(
      { name: 'HKDF', hash: 'SHA-256', salt, info: TE.encode('glossia/aead/v1') }, base, (32 + 12) * 8));
  } else {
    const base = await crypto.subtle.importKey('raw', TE.encode(cred), 'PBKDF2', false, ['deriveBits']);
    bits = new Uint8Array(await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt, iterations: 200000, hash: 'SHA-256' }, base, (32 + 12) * 8));
  }
  const key = await crypto.subtle.importKey('raw', bits.subarray(0, 32), { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
  return { key, nonce: bits.subarray(32, 44) };
}

// ─── varint + embedded header (unencrypted path) ──────────────────────
function varintEncode(n) {
  const out = [];
  do { let b = n % 128; n = Math.floor(n / 128); if (n > 0) b |= 0x80; out.push(b); } while (n > 0);
  return new Uint8Array(out);
}
function varintDecode(bytes, pos) {
  let value = 0, mult = 1, p = pos, b;
  do { b = bytes[p++]; value += (b & 0x7f) * mult; mult *= 128; } while (b & 0x80);
  return { value, next: p };
}
function buildEmbedded(flag, data) {
  const lp = varintEncode(data.length);
  const out = new Uint8Array(1 + lp.length + data.length);
  out[0] = flag & 0x7f;
  out.set(lp, 1);
  out.set(data, 1 + lp.length);
  return out;
}
function parseEmbedded(bytes) {
  if (bytes.length < 2) throw new Error('bad payload');
  const flag = bytes[0] & 0x7f;
  const { value: len, next } = varintDecode(bytes, 1);
  return { flag, data: bytes.subarray(next, next + len) };
}

// ─── authenticated artifact: "<prose> — <latin attribution>" ──────────
//
// The encrypted artifact reads as a quote with an attribution. The prose IS the
// AES-256-GCM ciphertext; the em-dash trailer is the plumbing — flag + length +
// salt + 96-bit auth tag — rendered as ~11 Latin payload words, so it scans like
// "— Cornelius Vanto Brixia". GCM authenticates: a wrong credential or a tampered
// message fails cleanly instead of yielding garbage.
//
//   trailer bytes: [flag:2b | length:14b : 2 BE][salt : 6][GCM tag : 12] = 20
//
// The top 2 bits of the length field carry the reduction method; the em-dash
// never appears in encoded prose, so it alone signals the format.
const AEAD_SALT_LEN = 6;
const AEAD_TAG_BITS = 96;
const AEAD_TAG_LEN = AEAD_TAG_BITS / 8;     // 12 bytes
const AEAD_MAX_CTLEN = 0x3fff;              // 14-bit length
const AEAD_TRAILER_LEN = 2 + AEAD_SALT_LEN + AEAD_TAG_LEN;   // 20 bytes -> ~11 Latin words
export const EMDASH = ' — ';

function capWords(s) { return s.replace(/(^|\s)(\p{L})/gu, (_, sp, c) => sp + c.toUpperCase()); }

// Slim a body's prose down to just its payload words, in order — dropping the
// cover words. The decoder filters prose against the wordlist, so the result
// still decodes to the same bytes; payload words are lowercased to their
// canonical wordlist form. Used for the cover-off view (see renderArtifact).
function payloadOnlyProse(prose, words) {
  const set = new Set((words || []).map(w => w.toLowerCase()));
  return prose.split(/\s+/)
    .map(t => t.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, ''))
    .filter(t => t && set.has(t.toLowerCase()))
    .map(t => t.toLowerCase())
    .join(' ');
}

// ─── public API ───────────────────────────────────────────────────────

// Phase 1 — encrypt (or just pack, with no credential) into an opaque, language-
// independent cipher state. Render it into any language with renderArtifact, as
// often as you like, without re-encrypting. `cred` is a passphrase string or a
// 32-byte key (Uint8Array); falsy/empty means do not encrypt.
//
// `salt` (optional) supplies the 6-byte AEAD salt instead of drawing one at random.
// The salt seeds both key and nonce, so a caller can make the whole seal
// reproducible (a "payload variant") by deriving the salt deterministically — as
// long as it never repeats the salt for two DIFFERENT plaintexts under one key
// (the AES-GCM nonce-reuse hazard). Omit it (or pass a wrong length) for the
// default fresh-random salt. Salt is public: it rides in the trailer.
// Returns { encrypted, ctHex, trailerHex }.
export async function sealMessage(message, cred, salt = null) {
  const { data: reduced, flag } = await maybeReduce(TE.encode(message));
  if (!hasCred(cred)) {
    return { encrypted: false, ctHex: toHex(buildEmbedded(flag, reduced)), trailerHex: null };
  }
  if (!(salt instanceof Uint8Array && salt.length === AEAD_SALT_LEN)) {
    salt = crypto.getRandomValues(new Uint8Array(AEAD_SALT_LEN));
  }
  const { key, nonce } = await deriveKeyNonce(cred, salt);
  const sealed = new Uint8Array(await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: nonce, tagLength: AEAD_TAG_BITS }, key, reduced));
  const ct = sealed.subarray(0, sealed.length - AEAD_TAG_LEN);
  const tag = sealed.subarray(sealed.length - AEAD_TAG_LEN);
  if (ct.length > AEAD_MAX_CTLEN) throw new Error('message too long');
  // trailer = [flag:2b | length:14b][salt][tag]
  const tb = new Uint8Array(AEAD_TRAILER_LEN);
  const field0 = ((flag & 0x03) << 14) | ct.length;
  tb[0] = (field0 >> 8) & 0xff;
  tb[1] = field0 & 0xff;
  tb.set(salt, 2);
  tb.set(tag, 2 + AEAD_SALT_LEN);
  return { encrypted: true, ctHex: toHex(ct), trailerHex: toHex(tb) };
}

// Phase 2 — render a sealed state into prose in the chosen language. Encrypted
// states become "<body> — <latin attribution>"; unencrypted ones are bare prose.
// The body and trailer are returned split out (with their payload words) so
// callers can style and underline each independently.
//
// `cover` (default true) fills the body's grammar with cover words for natural
// prose. Set it false to emit only the payload words — a much shorter body that
// still decodes (the decoder filters prose against the wordlist either way), so
// a bulletin can be slimmed to fit tight length limits. The Latin trailer is
// already just its payload words, so it is unaffected.
//
// The body is ALWAYS encoded with the full grammar (lang.dialect): the base-n
// codec is grammar-controlled (payload words differ per dialect, and the decoder
// always decodes with the "body" grammar), so re-encoding with a bare dialect
// would change the payload words. Instead, cover-off just drops the cover words
// from the already-generated prose — the payload words are byte-identical either
// way (mirrors index.html's cover toggle, which re-renders rather than re-encodes).
//
// `seed` (default SEED) picks a deterministic cover variation: the RNG only drives
// cover-word choice and sentence shape, NOT the payload words (those come from the
// ciphertext bytes via the grammar codec), so changing it re-wraps the SAME payload
// in different prose. Same seed + same state always yields identical prose, so a
// "cover variant" is a stable, reproducible parameter. The trailer stays on the base
// SEED so the Latin attribution doesn't shift as the body variant changes.
// splitmix64 finalizer: spread a small counter across the whole u64 range so
// consecutive cover-variant numbers map to bases that are far apart.
const U64 = (1n << 64n) - 1n;
function mix64(x) {
  let z = (BigInt(x) + 0x9E3779B97F4A7C15n) & U64;
  z = ((z ^ (z >> 30n)) * 0xBF58476D1CE4E5B9n) & U64;
  z = ((z ^ (z >> 27n)) * 0x94D049BB133111EBn) & U64;
  return (z ^ (z >> 31n)) & U64;
}

// `bestOf` (default 1) samples that many cover realizations of the SAME payload
// and keeps the densest / most semantically coherent one. It only changes cover
// words and sentence shape, never the payload, so the artifact still decodes
// identically. English only; ignored for other languages.
//
// Each cover variant is anchored to a hashed base `mix64(seed)`, and best-of-N
// samples the contiguous block [base .. base + N-1]. Because the hash scatters
// consecutive variants across u64, different variants don't overlap at any N,
// and for a fixed variant growing N just extends its own block from the same
// base (the smaller set nests in the larger) — so varying sample size never
// jumps to unrelated prose. bestOf=1 uses the same hashed base (candidate 0).
export function renderArtifact(state, langId = 'english', { cover = true, seed = SEED, bestOf = 1 } = {}) {
  const lang = msgLangById(langId);
  const bodySeed = typeof seed === 'bigint' ? seed : BigInt(seed);
  const base = mix64(bodySeed);
  const n = Math.max(1, Math.floor(bestOf));
  const bodyR = JSON.parse(
    n > 1
      ? wasmEncodeRawBaseNBestOf(state.ctHex, lang.language, lang.wordlist, lang.dialect, base, n)
      : wasmEncodeRawBaseN(state.ctHex, lang.language, lang.wordlist, lang.dialect, base));
  if (bodyR.error) throw new Error(bodyR.error);
  const bodyWords = bodyR.payload_words || [];
  const body = cover ? (bodyR.encoded_text || '').trim() : payloadOnlyProse(bodyR.encoded_text || '', bodyWords);
  if (!state.encrypted) {
    return { artifact: body, prose: body, body, trailer: '', bodyWords, trailerWords: [], payloadWords: bodyWords, langId: lang.id, encrypted: false };
  }
  // trailer plumbing -> Latin payload words (capitalized, attribution-like)
  const trR = JSON.parse(wasmEncodeRawBaseN(state.trailerHex, 'latin', 'default', 'body', SEED));
  if (trR.error) throw new Error(trR.error);
  const trailerWords = trR.payload_words || [];
  const trailer = capWords(trailerWords.join(' '));
  const artifact = body + EMDASH + trailer;
  return { artifact, prose: artifact, body, trailer, bodyWords, trailerWords, payloadWords: bodyWords.concat(trailerWords), langId: lang.id, encrypted: true, authenticated: true };
}

// Convenience: seal + render in one step. `opts` is forwarded to renderArtifact
// (e.g. { cover: false } to publish a slimmed, payload-only body).
export async function encodeMessage(message, cred, langId = 'english', opts = {}) {
  return renderArtifact(await sealMessage(message, cred), langId, opts);
}

// Detect the language of some prose, restricted to MSG_LANGS. Prose the
// detector cannot place falls back to DEFAULT_LANG_ID -- the tongue the book
// writes in, and so the likeliest thing an unplaceable paragraph is.
export function detectLang(prose) {
  try {
    const matches = JSON.parse(wasmDetectDialect(prose));
    if (Array.isArray(matches)) {
      const best = matches.find(m => MSG_LANGS.some(l => l.language === m.language));
      if (best) return (MSG_LANGS.find(l => l.language === best.language) || {}).id || DEFAULT_LANG_ID;
    }
  } catch (e) { /* fall through */ }
  return DEFAULT_LANG_ID;
}

// ─── canonical prose: raw bytes ⇆ readable Glossia prose ──────────────
// Any hex value — a txid, a merkle root, a hash160, a private key — rendered
// as natural-language prose whose payload words carry the bytes. This is
// glossia's CANONICAL encoding (0.5.0+, format version 3): the payload is
// followed by a version byte and a crc32, and the cover prose is seeded from a
// checksum of the bytes, so one payload has exactly one prose form, the wording
// itself is checkable, and an artifact keeps verifying under future engine
// versions (decode dispatches on the version byte, not the current rules).
// Decoding still just filters the prose against the wordlist, so bytes
// round-trip exactly.
//
// Since format version 3 a passage also carries Reed-Solomon parity over its
// payload words -- one symbol per eight, never fewer than four -- so a word
// mistranscribed on its way back is repaired rather than only refused. The
// parity words ride after the payload, which is why a v3 passage runs longer
// than the v2 one for the same bytes. Older artifacts are unaffected: decode
// dispatches on the version byte, so v1 and v2 prose still reads exactly as it
// always did.
//
// The book uses the FIXED pair — canonical_encode_fixed / canonical_decode_fixed
// — rather than the self-describing one. The self-describing packing spends a
// word stating the payload's length, and this book never needs it told: every
// value it encodes is a field whose width the notation already prints on the
// page (⌘²²⁴ for a hash's remaining bits, h³² for a 32-byte push, p⁶⁵ for a
// key). So the count is passed to the decoder instead of carried in the prose,
// which is one word shorter and — because that word's index was the padding
// count, a function of length alone — stops every 32-byte hash from opening on
// the same word. Under 0.3.0 the whole book read "abandon" first.
//
// A caller that appends its own checksum to the bytes before encoding still
// can: the envelope's crc32 covers payload and version, not whatever framing a
// caller wrapped around them first.

// hex string (any byte length) -> { prose, payloadWords, langId, version }.
// The language defaults to the reader's saved book language (bookLang above),
// so every page that omits it follows the one choice; pass a langId to pin.
// `bestOf` is kept for caller compatibility but no longer does anything: the
// canonical version's frozen rules pin the fluency budget (v2 is best-of-4),
// which is what makes the rendering reproducible by a verifier.
// Deterministic for a given (hex, language), so results are memoized (LRU,
// keyed by language too): a caller can warm an encode ahead of time (the
// Bitcoin book prefetches its swipe neighbours) and the eventual render is a
// lookup instead of a WASM pass.
const canonicalMemo = new Map();
const CANONICAL_MEMO_MAX = 400;
export function encodeCanonical(hex, langId = bookLang(), _bestOf = 1) {
  const lang = msgLangById(langId);
  const key = `${lang.id}|${hex}`;
  const hit = canonicalMemo.get(key);
  if (hit) {
    canonicalMemo.delete(key);   // move to the most-recently-used end
    canonicalMemo.set(key, hit);
    return hit;
  }
  const r = JSON.parse(wasmCanonicalEncodeTraced(hex, lang.language, lang.wordlist));
  if (r.error) throw new Error(r.error);
  const result = {
    prose: (r.encoded_text || '').trim(),
    payloadWords: (r.placements || []).map((p) => p.word),
    langId: lang.id,
    version: r.version,
  };
  canonicalMemo.set(key, result);
  while (canonicalMemo.size > CANONICAL_MEMO_MAX) canonicalMemo.delete(canonicalMemo.keys().next().value);
  return result;
}

// prose paragraph + known byte length -> { hex, payloadWords, langId, and for
// canonical artifacts verified + version }. Decodes in the given language, or
// the one auto-detected from the prose. Canonical artifacts (0.4.0+) are tried
// first — `verified` reports whether the wording matches the canonical
// re-render, i.e. the prose really is that payload's one form. Anything that
// fails the canonical shape falls through to the legacy fixed-seed decode,
// which is what pre-0.3.0 prose needs and, since the envelope moved, what
// 0.3.0's own version-1 prose gets too.
//
// `byteCount` is REQUIRED for the canonical path: the fixed packing does not
// carry the payload's length, so the decoder has to be told it. Without one
// there is nothing to try but the legacy decode. Every caller in this book has
// the count to hand — it is the field width the page is already printing.
//
// Three decoders are tried, narrowest first:
//
//   1. the fixed canonical decode, which is what this book writes;
//   2. the self-describing canonical decode, which reads the padding word out
//      of the prose and so covers BOTH framings — including format version 1,
//      the self-describing form glossia 0.3.0 wrote;
//   3. the legacy fixed-seed raw decode, for prose older than the canonical
//      encoding altogether.
//
// Step 2 is what makes a 0.3.0 artifact still readable here. It cannot be
// merged into step 1: the fixed packing spends no word on the payload's length,
// which is exactly why v1 — whose version byte leads — has no fixed form.
//
// The fallthrough is guarded by the engine's error `kind`, because "this is not
// canonical prose" and "this is canonical prose and it is damaged" both fail
// the canonical decode and must not be treated alike. Prose of another shape is
// refused on shape (`decode`) and falls through; a canonical artifact with a
// word swapped has the right shape and fails its checksum, and falling through
// there would quietly hand back bytes read under a different codec — a wrong
// answer wearing the manner of a right one. So checksum_mismatch throws.
export function decodeCanonical(prose, byteCount, langId) {
  const text = (prose || '').trim();
  if (!text) throw new Error('empty prose');
  const lang = msgLangById(langId || detectLang(text));
  const asCanonical = (c) =>
    ({ hex: c.payload_hex, payloadWords: [], langId: lang.id, verified: c.verified, version: c.version });

  if (byteCount) {
    const c = JSON.parse(wasmCanonicalDecode(text, lang.language, lang.wordlist, byteCount));
    if (!c.error) return asCanonical(c);
    if (c.kind === 'checksum_mismatch') throw new Error(c.error);
  }
  const s = JSON.parse(wasmCanonicalDecodeSelf(text, lang.language, lang.wordlist));
  if (!s.error && (!byteCount || s.payload_hex.length === byteCount * 2)) return asCanonical(s);
  if (s.kind === 'checksum_mismatch') throw new Error(s.error);

  const r = JSON.parse(wasmDecodeRawBaseN(text, lang.language, lang.wordlist, byteCount));
  if (r.error) throw new Error(r.error);
  return { hex: r.decoded_hex || '', payloadWords: r.payload_words || [], langId: lang.id };
}

// artifact string + credential -> { message, prose, payloadWords, langId,
// encrypted, authenticated }. Throws on malformed input; for the authenticated
// form a wrong credential or tampering throws cleanly.
export async function decodeMessage(artifact, cred) {
  const text = (artifact || '').trim();

  // Authenticated form: "<prose> — <latin attribution>".
  const di = text.lastIndexOf(EMDASH);
  if (di > 0) return aeadDecodeMessage(text.slice(0, di).trim(), text.slice(di + EMDASH.length).trim(), cred);

  // Unencrypted bare prose: the [flag][len] header rides inside the payload.
  if (!text) throw new Error('empty artifact');
  const lang = msgLangById(detectLang(text));
  const r = JSON.parse(wasmDecodeRawBaseN(text, lang.language, lang.wordlist, 0));
  if (r.error) throw new Error(r.error);
  const bytes = fromHex(r.decoded_hex || '');
  if (!bytes.length) throw new Error('empty payload');
  const { flag, data } = parseEmbedded(bytes);
  const message = TD.decode(await expand(data, flag));
  return { message, prose: text, header: null, payloadWords: r.payload_words || [], langId: lang.id, encrypted: false };
}

// Skim an artifact WITHOUT a credential: recover the prose's payload words (and
// split the body from its attribution trailer) so a locked bulletin can still be
// rendered with its payload words highlighted. The prose→word mapping is
// deterministic from the wordlist and the public trailer, so no key is needed —
// only the final AES-GCM step (in decodeMessage) requires the credential.
// Returns { prose, body, trailer, payloadWords, encrypted, saltHex }. The saltHex
// is the encryption salt recovered from the public trailer (empty when unencrypted
// or unreadable) — callers can use it to detect/avoid nonce reuse without the key.
// Never throws.
export function skimArtifact(artifact) {
  const text = (artifact || '').trim();
  if (!text) return { prose: text, body: text, trailer: '', payloadWords: [], encrypted: false, saltHex: '' };

  // Authenticated form: "<body> — <latin attribution>".
  const di = text.lastIndexOf(EMDASH);
  if (di > 0) {
    const body = text.slice(0, di).trim();
    const trailer = text.slice(di + EMDASH.length).trim();
    try {
      const tR = JSON.parse(wasmDecodeRawBaseN(trailer.toLowerCase(), 'latin', 'default', AEAD_TRAILER_LEN));
      if (tR.error) throw new Error(tR.error);
      const tb = fromHex(tR.decoded_hex || '');
      if (tb.length < AEAD_TRAILER_LEN) throw new Error('bad trailer');
      const ctlen = ((tb[0] << 8) | tb[1]) & AEAD_MAX_CTLEN;
      const saltHex = toHex(tb.subarray(2, 2 + AEAD_SALT_LEN));
      const lang = msgLangById(detectLang(body));
      const bR = JSON.parse(wasmDecodeRawBaseN(body, lang.language, lang.wordlist, ctlen));
      const words = (bR.payload_words || []).concat(tR.payload_words || []);
      return { prose: text, body, trailer, payloadWords: words, encrypted: true, saltHex };
    } catch { return { prose: text, body, trailer, payloadWords: [], encrypted: true, saltHex: '' }; }
  }

  // Bare, unencrypted prose.
  try {
    const lang = msgLangById(detectLang(text));
    const r = JSON.parse(wasmDecodeRawBaseN(text, lang.language, lang.wordlist, 0));
    return { prose: text, body: text, trailer: '', payloadWords: r.payload_words || [], encrypted: false, saltHex: '' };
  } catch { return { prose: text, body: text, trailer: '', payloadWords: [], encrypted: false, saltHex: '' }; }
}

// Decode the authenticated "<body> — <attribution>" form. GCM verifies the tag,
// so a wrong credential or any tampering throws rather than returning garbage.
async function aeadDecodeMessage(body, trailer, cred) {
  // attribution (Latin) -> plumbing bytes (lowercased so capitalization is ignored)
  const tR = JSON.parse(wasmDecodeRawBaseN(trailer.toLowerCase(), 'latin', 'default', AEAD_TRAILER_LEN));
  if (tR.error) throw new Error(tR.error);
  const tb = fromHex(tR.decoded_hex || '');
  if (tb.length < AEAD_TRAILER_LEN) throw new Error('bad attribution trailer');
  const field0 = (tb[0] << 8) | tb[1];
  const flag = field0 >> 14;
  const ctlen = field0 & AEAD_MAX_CTLEN;
  const salt = tb.subarray(2, 2 + AEAD_SALT_LEN);
  const tag = tb.subarray(2 + AEAD_SALT_LEN, AEAD_TRAILER_LEN);

  // body prose -> ciphertext, in its detected language
  const lang = msgLangById(detectLang(body));
  const bR = JSON.parse(wasmDecodeRawBaseN(body, lang.language, lang.wordlist, ctlen));
  if (bR.error) throw new Error(bR.error);
  const ct = fromHex(bR.decoded_hex || '').subarray(0, ctlen);
  if (!ct.length) throw new Error('empty ciphertext');
  if (!hasCred(cred)) { const e = new Error('decryption key required'); e.needsKey = true; e.needsPassphrase = true; throw e; }

  const { key, nonce } = await deriveKeyNonce(cred, salt);
  const sealed = new Uint8Array(ct.length + AEAD_TAG_LEN);
  sealed.set(ct, 0);
  sealed.set(tag, ct.length);
  let message;
  try {
    const plain = new Uint8Array(await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: nonce, tagLength: AEAD_TAG_BITS }, key, sealed));
    message = TD.decode(await expand(plain, flag));
  } catch (e) {
    throw new Error('Could not decrypt — wrong key/passphrase, or the message was tampered with.');
  }
  return {
    message, prose: body + EMDASH + trailer, header: null,
    payloadWords: (bR.payload_words || []).concat(tR.payload_words || []),
    langId: lang.id, encrypted: true, authenticated: true,
  };
}
