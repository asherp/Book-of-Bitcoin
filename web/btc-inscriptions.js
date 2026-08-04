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

// The tapscript within one input's witness, per BIP341: the last item is the
// control block, the one before it the script — after the annex, if any, is
// set aside (with two or more items, a last item opening 0x50 is the annex).
// A witness too short to carry a script path carries no envelope either.
export function tapscriptOf(witnessItems) {
  const items = (witnessItems || []).slice();
  if (items.length >= 2 && /^50/i.test(items[items.length - 1] || '')) items.pop();
  if (items.length < 2) return null;
  return hexToBytes(items[items.length - 2]);
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
// The per-member editorial matter (an artist, a city, a date) is deliberately
// NOT read. It is a claim about a particular photograph, and the photograph
// itself is one fetch away -- so the book shows the work rather than the
// caption somebody wrote for it.
//
// Null for any body that is not a manifest, a plain JSON inscription being
// its own content.
export function parseCollection(body) {
  let doc;
  try { doc = JSON.parse(new TextDecoder().decode(body)); }
  catch { return null; }
  if (!doc || !Array.isArray(doc.data)) return null;
  const members = [];
  for (const row of doc.data) {
    const m = /^([0-9a-f]{64})i(\d+)$/i.exec(String((row && row.id) || '').trim());
    if (m) members.push({ txid: m[1].toLowerCase(), index: Number(m[2]) });
  }
  if (!members.length) return null;
  // Scalar fields only, and as written: a manifest is somebody's JSON, so
  // anything nested is theirs to mean and not this reader's to flatten.
  const meta = {};
  for (const [k, v] of Object.entries((doc.meta && typeof doc.meta === 'object') ? doc.meta : {})) {
    if (v !== null && typeof v !== 'object') meta[k] = String(v);
  }
  return { meta, members };
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
