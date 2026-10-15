// SPDX-License-Identifier: MIT OR Apache-2.0
//
// btc-templates.js — which of the notation key's script patterns a page
// actually puts in front of the reader.
//
// The key's pattern tables draw templates: P2PKH's lock and the spend that
// opens it, P2WSH's, Taproot's two paths. A reader looking at one transaction
// needs the rows that transaction uses and is not helped by the other nine.
// So the page classifies what it renders, and btc-key-filter.js keeps the rows
// that were named.
//
// Classification is from the bytes, not from the rendered marks: a script's
// shape is a fact about the transaction, while the marks are how this book
// chose to write it. A script that matches nothing returns null and names no
// row -- the filter's failure direction is to show less, never to assert a
// pattern the bytes do not carry, and the key's own control opens it in full.

import { tokenizeScript } from './btc-tx.js';

const OP_0 = 0x00, OP_1 = 0x51, OP_16 = 0x60;
const OP_IF = 0x63, OP_NOTIF = 0x64, OP_ELSE = 0x67, OP_ENDIF = 0x68;
const OP_DROP = 0x75, OP_IFDUP = 0x73;
const OP_EQUAL = 0x87, OP_EQUALVERIFY = 0x88;
const OP_DUP = 0x76, OP_HASH160 = 0xa9, OP_SHA256 = 0xa8;
const OP_CHECKSIG = 0xac, OP_CHECKSIGVERIFY = 0xad, OP_CHECKMULTISIG = 0xae;
const OP_RETURN = 0x6a, OP_CLTV = 0xb1, OP_CSV = 0xb2;

// A script reduced to its shape: an opcode stands for itself, a push for its
// byte length ('p20'). The data falls out and the template is what remains.
// Null where the bytes do not parse as a whole script -- a truncated push
// means the shape is not known, and an unknown shape names no row.
function skeleton(hex) {
  if (typeof hex !== 'string' || hex === '') return null;
  let toks;
  try { toks = tokenizeScript(hex); } catch { return null; }
  if (toks.some((t) => t.trunc !== undefined)) return null;
  return toks.map((t) => (t.op !== undefined ? t.op : `p${t.push.length / 2}`));
}

// A shape against a pattern of the same alphabet, where 'p*' takes a push of
// any length and '*' takes any one token.
function fits(skel, pattern) {
  if (skel === null || skel.length !== pattern.length) return false;
  return skel.every((t, i) => {
    const p = pattern[i];
    if (p === '*') return true;
    if (p === 'p*') return typeof t === 'string';
    return p === t;
  });
}

const isPush = (t) => typeof t === 'string';
const pushLen = (t) => (isPush(t) ? Number(t.slice(1)) : -1);
const isKey = (t) => pushLen(t) === 33 || pushLen(t) === 65;
const smallNum = (t) => (t >= OP_1 && t <= OP_16 ? t - OP_1 + 1 : null);

// OP_m <key>… OP_n OP_CHECKMULTISIG — the bare multisig lock, and the redeem
// script inside the P2SH row beneath it. Returns { m, n } or null.
function multisig(skel) {
  if (skel === null || skel.length < 4) return null;
  if (skel[skel.length - 1] !== OP_CHECKMULTISIG) return null;
  const m = smallNum(skel[0]), n = smallNum(skel[skel.length - 2]);
  if (m === null || n === null || n < m) return null;
  const keys = skel.slice(1, -2);
  if (keys.length !== n || !keys.every(isKey)) return null;
  return { m, n };
}

// A Taproot control block: the leaf-version/parity byte, the internal key,
// then one 32-byte sibling hash per level of the taptree.
//
// The length alone does not settle it -- 33 bytes is also a compressed public
// key, the last item of every P2WPKH witness -- so the opening byte has to
// agree too. Tapscript's one defined leaf version is 0xc0, and its low bit is
// the output key's parity, which is why the version is read through & 0xfe. A
// public key opens 0x02 or 0x03 and cannot be mistaken for it.
const isControlBlock = (hex) => typeof hex === 'string'
  && hex.length >= 66 && (hex.length / 2 - 33) % 32 === 0 && (hex.length / 2 - 33) / 32 <= 128
  && (parseInt(hex.slice(0, 2), 16) & 0xfe) === 0xc0;

// ─── the locks, from an output's scriptPubKey ────────────────────────────
//
// A Taproot output names both Taproot rows: its lock is the one cell the two
// rows share (① p³²), and which path will open it is not written until it is
// spent.
export function outputTemplates(scriptPubKeyHex) {
  const s = skeleton(scriptPubKeyHex);
  if (s === null) return [];
  if (s[0] === OP_RETURN) return ['data'];
  if (fits(s, ['p*', OP_CHECKSIG]) && isKey(s[0])) return ['p2pk'];
  if (fits(s, [OP_DUP, OP_HASH160, 'p20', OP_EQUALVERIFY, OP_CHECKSIG])) return ['p2pkh'];
  if (fits(s, [OP_HASH160, 'p20', OP_EQUAL])) return ['p2sh'];
  if (fits(s, [OP_0, 'p20'])) return ['p2wpkh'];
  if (fits(s, [OP_0, 'p32'])) return ['p2wsh'];
  if (fits(s, [OP_1, 'p32'])) return ['p2tr-key', 'p2tr-script'];
  if (multisig(s)) return ['multisig'];
  return [];
}

// ─── the Lightning shapes, from a revealed witness script ────────────────
//
// Matched against the shapes the key's own Lightning table draws. Those are
// drawn to teach the protocol's structure rather than to reproduce BOLT-3
// byte for byte, so a real commitment script that carries extra apparatus
// will not match and will name no row: the group stays shut rather than
// claim a channel from a script that merely resembles one.
const LIGHTNING = [
  // to_local: either the revocation key now, or the delay and then the local key.
  ['ln-to-local', [OP_IF, 'p*', OP_ELSE, 'p*', OP_CSV, OP_DROP, 'p*', OP_ENDIF, OP_CHECKSIG]],
  // to_remote: the remote key, after a one-block delay (anchor channels).
  ['ln-to-remote', ['p*', OP_CHECKSIGVERIFY, OP_1, OP_CSV]],
  // anchor: anyone may sweep it once sixteen blocks have passed.
  ['ln-anchor', ['p*', OP_CHECKSIG, OP_IFDUP, OP_NOTIF, OP_16, OP_CSV, OP_ENDIF]],
  // HTLC: revocation, else the preimage, else the timeout.
  ['ln-htlc', [OP_IF, 'p*', OP_ELSE, OP_IF, OP_SHA256, 'p32', OP_EQUALVERIFY, 'p*',
               OP_ELSE, 'p*', OP_CLTV, OP_DROP, 'p*', OP_ENDIF, OP_ENDIF, OP_CHECKSIG]],
];

// A funding spend is a plain 2-of-2, a shape that belongs to no protocol in
// particular. It names no Lightning row on its own: read as a channel it
// would be a claim about who wrote the transaction, which the bytes do not
// carry. Such a spend is a 2-of-2 P2WSH, and the key says so under P2WSH.
function lightningTemplate(witnessScriptHex) {
  const s = skeleton(witnessScriptHex);
  if (s === null) return null;
  for (const [id, pattern] of LIGHTNING) if (fits(s, pattern)) return id;
  return null;
}

// ─── the spends, from an input's scriptSig and witness ───────────────────
//
// What an input reveals is what the STXO and Witness columns of the key draw,
// so an input is classified by its own bytes rather than by a prevout the
// page may not have fetched.
export function inputTemplates(input) {
  const out = [];
  const witness = input.witness ?? [];
  const isCoinbase = /^0{64}$/.test(input.txid ?? '') && input.vout === 0xffffffff;
  if (isCoinbase) return out;   // a coinbase opens nothing: it has no prevout to unlock

  if (witness.length === 0) {
    const s = skeleton(input.scriptSig);
    if (s === null) return out;
    if (fits(s, ['p*'])) out.push('p2pk');                       // a lone signature
    else if (fits(s, ['p*', 'p*']) && isKey(s[1])) out.push('p2pkh');
    else if (s.length >= 1 && isPush(s[s.length - 1])) {
      // P2SH: the last push is the redeem script, revealed by the spend.
      const toks = tokenizeScript(input.scriptSig);
      const redeem = toks[toks.length - 1].push;
      out.push('p2sh');
      if (multisig(skeleton(redeem))) out.push('p2sh-multisig');
    }
    return out;
  }

  const last = witness[witness.length - 1];
  if (witness.length === 1) {
    // A key-path Taproot spend is one signature and nothing else.
    if (last.length / 2 === 64 || last.length / 2 === 65) out.push('p2tr-key');
    return out;
  }
  if (isControlBlock(last)) { out.push('p2tr-script'); return out; }
  if (witness.length === 2 && isKey(`p${witness[1].length / 2}`)) { out.push('p2wpkh'); return out; }
  // Anything else with a witness reveals a witness script as its last item.
  out.push('p2wsh');
  const ln = lightningTemplate(last);
  if (ln) out.push(ln);
  return out;
}

// ─── the page ────────────────────────────────────────────────────────────

// Every template a parsed transaction puts on the page, locks and spends
// together.
//
// The Lightning table answers as a whole rather than row by row, under the
// marker 'lightning'. Its rows are steps of one story and half of each row is
// off chain -- what a party computes, never written down -- so a transaction
// showing one step is a reader's way into the others, and the one step it
// shows is rarely the one its own row draws: a force close reveals the
// funding 2-of-2 and leaves its commitment outputs as bare hashes, and the
// scripts those hide only surface when they are swept, a transaction later.
export function transactionTemplates(tx) {
  const found = new Set();
  for (const o of tx.vout ?? []) for (const t of outputTemplates(o.scriptPubKey)) found.add(t);
  for (const i of tx.vin ?? []) for (const t of inputTemplates(i)) found.add(t);
  if ([...found].some((t) => t.startsWith('ln-'))) found.add('lightning');
  return found;
}
