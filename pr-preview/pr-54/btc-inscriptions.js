// SPDX-License-Identifier: MIT OR Apache-2.0
//
// btc-inscriptions.js — reading an ord envelope out of a witness.
//
// The chain never says "inscription": it says which bytes a witness carried
// and which script they satisfied. What ord adds is a place to look — an
// unexecuted branch, OP_FALSE OP_IF … OP_ENDIF, inside a tapscript: pushes
// carrying the string "ord", a few tagged fields (a content type, mainly),
// and the body, skipped by every validating node precisely because the IF is
// false. Consensus checks the script spends; it never reads the branch. This
// module reads the branch, and nothing more: no numbering, no sat tracking,
// no collections — those are further conventions, held elsewhere, and a page
// that states them must credit them (see tools/ordinals-appendix.md). What
// is here is checkable against the witness bytes alone, which is the book's
// kind of claim.
//
// Dependency-free, and injectable nowhere: the caller hands in the witness
// items (the hex strings an Esplora /tx answer carries per input) and gets
// the envelope back as data. Node tests read it directly
// (tools/inscriptions.test.mjs).

const hexToBytes = (hex) => {
  const m = String(hex || '').match(/../g) || [];
  const out = new Uint8Array(m.length);
  for (let i = 0; i < m.length; i++) out[i] = parseInt(m[i], 16);
  return out;
};

// ── The script, read as instructions ──────────────────────────────────────
// A tapscript is a run of operations: pushes (0x00 carries nothing,
// 0x01–0x4b carry their own count, 0x4c/0x4d/0x4e carry a 1/2/4-byte count
// after them) and everything else, which the envelope grammar forbids inside
// itself and this reader only needs to recognize at the boundaries (OP_IF
// 0x63, OP_ENDIF 0x68). A push running past the script's end is a script
// that cannot be read further; the operations up to it stand.
function decodeOps(bytes) {
  const ops = [];
  let i = 0;
  while (i < bytes.length) {
    const code = bytes[i++];
    if (code === 0x00) { ops.push({ code, data: new Uint8Array(0) }); continue; }
    if (code >= 0x01 && code <= 0x4e) {
      let n = code;
      if (code === 0x4c) { if (i + 1 > bytes.length) break; n = bytes[i]; i += 1; }
      else if (code === 0x4d) { if (i + 2 > bytes.length) break; n = bytes[i] | (bytes[i + 1] << 8); i += 2; }
      else if (code === 0x4e) {
        if (i + 4 > bytes.length) break;
        n = bytes[i] | (bytes[i + 1] << 8) | (bytes[i + 2] << 16) | (bytes[i + 3] * 0x1000000);
        i += 4;
      }
      if (i + n > bytes.length) break;
      ops.push({ code, data: bytes.slice(i, i + n) });
      i += n;
      continue;
    }
    ops.push({ code });
  }
  return ops;
}
const isPush = (op) => op && op.data !== undefined;

// ── The envelope ──────────────────────────────────────────────────────────
// OP_FALSE OP_IF "ord", then tagged fields — a tag push and a value push,
// pair by pair — until the empty push that opens the body, whose chunks run
// to OP_ENDIF and concatenate (a tapscript push carries at most 520 bytes,
// so any real body is many). A branch that breaks the grammar — a non-push
// where a push must stand, no OP_ENDIF to close — is not an envelope, and
// reads as nothing rather than as half of something.
const ORD = [0x6f, 0x72, 0x64];   // "ord"
const utf8 = (bytes) => { try { return new TextDecoder().decode(bytes); } catch { return ''; } };

function readEnvelope(ops, at) {
  let j = at + 3;
  const fields = new Map();   // tag byte -> value bytes (first appearance wins, as ord reads)
  const chunks = [];
  let inBody = false;
  while (j < ops.length) {
    const op = ops[j];
    if (op.code === 0x68) break;   // OP_ENDIF — with no body yet, the fields stand alone
    if (!isPush(op)) return null;
    if (inBody) { chunks.push(op.data); j += 1; continue; }
    if (op.data.length === 0) { inBody = true; j += 1; continue; }
    const value = ops[j + 1];
    if (!isPush(value)) return null;
    const tag = op.data[0];
    if (!fields.has(tag)) fields.set(tag, value.data);
    j += 2;
  }
  if (j >= ops.length) return null;   // ran out before OP_ENDIF
  let length = 0;
  for (const c of chunks) length += c.length;
  const body = new Uint8Array(length);
  for (let o = 0, k = 0; k < chunks.length; k++) { body.set(chunks[k], o); o += chunks[k].length; }
  const ct = fields.get(1);
  return {
    contentType: ct ? utf8(ct) : null,
    contentEncoding: fields.has(9) ? utf8(fields.get(9)) : null,
    body,
    fields,
    end: j,
  };
}

// Every envelope a script carries, in script order. The branch may stand
// anywhere in the script — after the key and OP_CHECKSIG that actually
// spend it is the usual place — so the whole run is scanned.
export function parseEnvelopes(scriptBytes) {
  const ops = decodeOps(scriptBytes);
  const found = [];
  for (let i = 0; i + 2 < ops.length; i++) {
    if (!(isPush(ops[i]) && ops[i].data.length === 0)) continue;
    if (ops[i + 1].code !== 0x63) continue;   // OP_IF
    const name = ops[i + 2];
    if (!(isPush(name) && name.data.length === 3 && ORD.every((b, k) => name.data[k] === b))) continue;
    const env = readEnvelope(ops, i);
    if (env) { found.push(env); i = env.end; }
  }
  return found.map(({ end, ...e }) => e);
}

// A control block, per BIP341: 33 bytes plus a whole number of 32-byte path
// elements, opening with the leaf version in its top seven bits. It is what
// marks the item before it as a tapscript, so a witness that ends in one is
// a script-path spend and every other witness is not.
const isControlBlock = (hex) => {
  const n = (hex || '').length / 2;
  return n >= 33 && (n - 33) % 32 === 0 && (parseInt((hex || '').slice(0, 2), 16) & 0xfe) === 0xc0;
};

// The tapscript within one input's witness, per BIP341: the last item is the
// control block, the one before it the script — after the annex, if any, is
// set aside (with two or more items, a last item opening 0x50 is the annex).
// A witness that does not end in a control block is not a script-path spend
// at all (a key-path spend, a P2WPKH pair), and carries no tapscript to read.
export function tapscriptOf(witnessItems) {
  const items = (witnessItems || []).slice();
  if (items.length >= 2 && /^50/i.test(items[items.length - 1] || '')) items.pop();
  if (items.length < 2) return null;
  if (!isControlBlock(items[items.length - 1])) return null;
  return hexToBytes(items[items.length - 2]);
}

// ── What bytes say they are ───────────────────────────────────────────────
// A format announces itself in its first bytes, and those bytes are the
// chain's: a PNG opens \x89PNG\r\n\x1a\n whoever inscribed it and whatever
// they declared it to be. So this reads the format off the payload itself,
// which is a different kind of statement from the envelope's content-type
// field — that one is the inscriber's claim about the same bytes, and the
// two can disagree.
//
// Null when nothing announces itself. A guess is not worth the ink.
const ascii = (bytes, at, s) => s.split('').every((c, i) => bytes[at + i] === c.charCodeAt(0));
const MAGIC = [
  { label: 'PNG image', mime: 'image/png', test: (b) => b[0] === 0x89 && ascii(b, 1, 'PNG') },
  { label: 'JPEG image', mime: 'image/jpeg', test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { label: 'GIF image', mime: 'image/gif', test: (b) => ascii(b, 0, 'GIF8') },
  { label: 'WebP image', mime: 'image/webp', test: (b) => ascii(b, 0, 'RIFF') && ascii(b, 8, 'WEBP') },
  { label: 'BMP image', mime: 'image/bmp', test: (b) => ascii(b, 0, 'BM') },
  { label: 'AVIF image', mime: 'image/avif', test: (b) => ascii(b, 4, 'ftyp') && ascii(b, 8, 'avif') },
  { label: 'WAV audio', mime: 'audio/wav', test: (b) => ascii(b, 0, 'RIFF') && ascii(b, 8, 'WAVE') },
  { label: 'MP4 video', mime: 'video/mp4', test: (b) => ascii(b, 4, 'ftyp') },
  { label: 'WebM video', mime: 'video/webm', test: (b) => b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3 },
  { label: 'Ogg audio', mime: 'audio/ogg', test: (b) => ascii(b, 0, 'OggS') },
  { label: 'MP3 audio', mime: 'audio/mpeg', test: (b) => ascii(b, 0, 'ID3') || (b[0] === 0xff && (b[1] & 0xe0) === 0xe0) },
  { label: 'PDF document', mime: 'application/pdf', test: (b) => ascii(b, 0, '%PDF') },
  { label: 'ZIP archive', mime: 'application/zip', test: (b) => ascii(b, 0, 'PK') && (b[2] === 3 || b[2] === 5 || b[2] === 7) },
  { label: 'gzip data', mime: 'application/gzip', test: (b) => b[0] === 0x1f && b[1] === 0x8b },
];

// Text formats have no magic number, so they are recognized by reading: a
// body that decodes as UTF-8 without control junk is text, and what KIND of
// text is whatever its first non-blank characters open with.
const looksTextual = (bytes) => {
  if (!bytes.length) return false;
  let text;
  try { text = new TextDecoder('utf-8', { fatal: true }).decode(bytes); }
  catch { return false; }
  // Control characters other than tab, newline and return mark it as not-text.
  return !/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(text) && text;
};

export function sniffAsset(bytes) {
  if (!bytes || !bytes.length) return null;
  for (const m of MAGIC) {
    try { if (m.test(bytes)) return { label: m.label, mime: m.mime }; } catch { /* short buffer */ }
  }
  const text = looksTextual(bytes);
  if (text === false) return null;
  const head = text.replace(/^\s+/, '').slice(0, 400);
  if (/^<svg[\s>]/i.test(head) || (/^<\?xml/i.test(head) && /<svg[\s>]/i.test(head))) return { label: 'SVG image', mime: 'image/svg+xml' };
  if (/^<!doctype html/i.test(head) || /^<html[\s>]/i.test(head)) return { label: 'HTML', mime: 'text/html' };
  if (/^[{[]/.test(head)) {
    try { JSON.parse(text); return { label: 'JSON', mime: 'application/json' }; } catch { /* not JSON after all */ }
  }
  return { label: 'plain text', mime: 'text/plain' };
}

// The asset one input's witness carries, read as far as the bytes allow. An
// ord envelope names its own body, so that body is the asset and the
// envelope's declaration rides along beside it — `source` says which of the
// two the label came from, since one is the chain's reading and the other is
// somebody's word for it. A witness with no envelope is still read: a bare
// data item that announces a format is an asset too, whatever put it there.
export function assetOfEnvelope(env) {
  const declared = env.contentType || null;
  // A compressed body announces nothing until it is unpacked, and unpacking
  // is a reading; the declaration is all there is to go on.
  const sniffed = env.contentEncoding ? null : sniffAsset(env.body);
  // A manifest names itself, and its own name beats "JSON" for a body whose
  // whole business is to be a collection. That name is the collection's word
  // for itself rather than anything the bytes announce, so it is carried as
  // a third kind of source and reported as one.
  let named = null;
  if (sniffed && sniffed.mime === 'application/json') {
    const collection = parseCollection(env.body);
    const n = collection && (collection.meta.name || '').trim();
    if (n) named = n;
  }
  if (!sniffed && !declared) return null;
  return {
    label: named || (sniffed ? sniffed.label : declared),
    mime: sniffed ? sniffed.mime : declared,
    bytes: env.body.length,
    declared,
    encoding: env.contentEncoding || null,
    source: named ? 'manifest' : sniffed ? 'bytes' : 'declaration',
  };
}

export function witnessAsset(witnessItems) {
  const script = tapscriptOf(witnessItems);
  if (script) {
    const [env] = parseEnvelopes(script);
    if (env) return assetOfEnvelope(env);
  }
  // No envelope: the largest item that announces a format, if any does.
  let best = null;
  for (const hex of witnessItems || []) {
    if (!hex || isControlBlock(hex)) continue;
    const bytes = hexToBytes(hex);
    // Signatures and keys are the witness's furniture, never its payload,
    // and are far too short to be an asset worth naming.
    if (bytes.length < 16) continue;
    for (const m of MAGIC) {
      try {
        if (m.test(bytes) && (!best || bytes.length > best.bytes)) {
          best = { label: m.label, mime: m.mime, bytes: bytes.length, declared: null, encoding: null, source: 'bytes' };
        }
      } catch { /* short buffer */ }
    }
  }
  return best;
}

// ── A manifest, and what it names ─────────────────────────────────────────
// A collection manifest is not content the way an image is: it is a table of
// contents, and what it lists is elsewhere -- one further reveal per member,
// each named `<txid>i<n>` (a transaction and the index of the inscription
// within it). So a surface showing a manifest should show what it names
// rather than the naming, which is what this reads out: the members, in the
// order the manifest lists them.
//
// Two things come back, and they are of different kinds. The `members` are
// ids: they point at further witnesses the chain does hold, and each resolves
// to a passage the book can open. The `meta` is the collection speaking about
// itself -- its name, how many it claims to hold, what it is, a disclaimer
// about its own attributions -- written into the same breath as the ids and
// checkable against nothing. Both are worth showing and they are not the same
// register, so they are handed back apart and a surface that shows the meta
// shows it as what it is: the collection's own statement, in its own words.
//
// A member carries the same two registers in miniature: its `txid` and
// `index` are the id -- a witness the chain holds -- while its `name` and
// `attributes` are the manifest's caption for that work, an artist credited,
// a city, a date, sometimes a line quoted off the wall. Captions, not record:
// they are shown beside the work as the manifest's own words about it.
//
// Null for any body that is not a manifest, a plain JSON inscription being
// its own content.
export function parseCollection(body) {
  let doc;
  try { doc = JSON.parse(new TextDecoder().decode(body)); }
  catch { return null; }
  if (!doc || !Array.isArray(doc.data)) return null;
  // Scalar fields only, and as written: a manifest is somebody's JSON, so
  // anything nested is theirs to mean and not this reader's to flatten.
  const scalars = (o) => {
    const out = {};
    for (const [k, v] of Object.entries((o && typeof o === 'object' && !Array.isArray(o)) ? o : {})) {
      if (v !== null && typeof v !== 'object') out[k] = String(v);
    }
    return out;
  };
  const members = [];
  for (const row of doc.data) {
    const m = /^([0-9a-f]{64})i(\d+)$/i.exec(String((row && row.id) || '').trim());
    if (!m) continue;
    const member = { txid: m[1].toLowerCase(), index: Number(m[2]) };
    const rm = (row && row.meta && typeof row.meta === 'object') ? row.meta : {};
    if (rm.name != null && typeof rm.name !== 'object') member.name = String(rm.name);
    const attributes = scalars(rm.attributes);
    if (Object.keys(attributes).length) member.attributes = attributes;
    members.push(member);
  }
  if (!members.length) return null;
  return { meta: scalars(doc.meta), members };
}

// The first inscription a transaction reveals, walking its inputs in order
// (which is the order ord indexes them: i0 is the first envelope of the
// first input that carries one). `tx` is an Esplora /tx answer — each vin's
// witness rides it as an array of hex strings. Null when no input carries a
// well-formed envelope: the transaction may still be anything else a
// transaction is; it is simply not a reveal.
export function inscriptionInTx(tx) {
  for (let vin = 0; vin < (tx.vin || []).length; vin++) {
    const script = tapscriptOf(tx.vin[vin].witness);
    if (!script) continue;
    const envs = parseEnvelopes(script);
    if (envs.length) return { vin, ...envs[0] };
  }
  return null;
}
