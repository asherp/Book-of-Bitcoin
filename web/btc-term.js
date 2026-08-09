// SPDX-License-Identifier: MIT OR Apache-2.0
//
// btc-term.js — a lock written as the term it is, and an address's datum
// bound into it.
//
// The notation key's Scripts as terms group says every common lock is one
// abstraction over one committed datum: λh. ⟦ ⧉ ⌖ h ≡ ∇ ⟧, and reducing it
// gives the scriptPubKey the chain holds. Its Addresses group says an address
// carries that datum and a tag naming which abstraction to put it in. Put the
// two together and an address is an application waiting to be written down:
// the term, the argument, and a β between them.
//
// This module is that sentence as code. It knows five terms (six with P2PK,
// which takes an argument like the rest and simply never got an address), it
// binds an argument into one, it renders both sides of the reduction, and it
// reduces — so the claim the key makes in prose is one the suite can check:
// reduce(term, argument) is the scriptPubKey, byte for byte.
//
// Deliberately light. It imports the opcode alphabet, the classifier and the
// tokenizer, and nothing that reaches the Glossia engine — a page can write a
// term without the WASM build, which is what lets the search page draw one the
// moment a reader stops typing. The argument's prose is passed *in* by whoever
// has the engine (see `prose` below); with no engine the datum stays behind its
// mark, unsaid, which is what the book does everywhere else rather than fall
// back to hex.

import { OPCODE_SYMBOLS, OPCODE_NAMES, toSuperscript } from './btc-sigla.js';
import { outputTemplates } from './btc-templates.js';
import { tokenizeScript } from './btc-tx.js';

const OP_0 = 0x00, OP_1 = 0x51;
const OP_DUP = 0x76, OP_HASH160 = 0xa9;
const OP_EQUAL = 0x87, OP_EQUALVERIFY = 0x88, OP_CHECKSIG = 0xac;

// The terms, exactly as the key's terms table draws them: the binder's letter,
// the body it abstracts over, and null standing where the bound variable goes.
//
// The body is opcodes rather than glyphs on purpose. The marks come from
// btc-sigla.js when a term is written out, so this table can never drift from
// the alphabet the rest of the book sets scripts in, and the same table both
// draws the term and reduces it.
//
// `bytes` is what the argument must measure, which is also the length the
// address format fixes; null takes a push of any length (P2PK's key, 33 bytes
// compressed or 65 uncompressed). The binder's letter is the one the book's own
// renderer would give the same push (scriptDataMark in btc-prose.js): h for a
// committed hash, p for a key — Taproot's argument is a tweaked output key and
// takes p, which is why its row says p and not h.
export const TERMS = {
  p2pk:   { label: 'P2PK',   binder: 'p', title: 'public key', bytes: null,
            body: [null, OP_CHECKSIG] },
  p2pkh:  { label: 'P2PKH',  binder: 'h', title: 'hash', bytes: 20,
            body: [OP_DUP, OP_HASH160, null, OP_EQUALVERIFY, OP_CHECKSIG] },
  p2sh:   { label: 'P2SH',   binder: 'h', title: 'hash', bytes: 20,
            body: [OP_HASH160, null, OP_EQUAL] },
  p2wpkh: { label: 'P2WPKH', binder: 'h', title: 'hash', bytes: 20,
            body: [OP_0, null] },
  p2wsh:  { label: 'P2WSH',  binder: 'h', title: 'hash', bytes: 32,
            body: [OP_0, null] },
  p2tr:   { label: 'P2TR',   binder: 'p', title: 'public key — Taproot tweaked output key', bytes: 32,
            body: [OP_1, null] },
};

// The classifier answers with the key's row ids, and Taproot's two rows share
// one term: which path opens the output is not written until it is spent, and
// the term is the same either way.
const TERM_OF_ROW = { 'p2tr-key': 'p2tr', 'p2tr-script': 'p2tr' };

// ─── binding ─────────────────────────────────────────────────────────────

// A scriptPubKey -> the term it is, with its argument bound:
//
//   { id, label, binder, bytes, argument, script, term }
//
// Null for a script that is not one abstraction over one datum. Bare multisig
// is the interesting refusal: its λ takes m, n and n keys, so there is no
// single argument to bind and no address that could carry one — which is the
// whole of what P2SH is for. A data output and anything the classifier does
// not recognise are refused for the same kind of reason.
export function termOfScript(scriptHex) {
  const rows = outputTemplates(scriptHex);
  const id = rows.map((r) => TERM_OF_ROW[r] ?? r).find((r) => TERMS[r]);
  if (id === undefined) return null;
  const term = TERMS[id];
  // One abstraction, one datum: the body has exactly one hole, so the script
  // must carry exactly one push to fill it.
  const pushes = tokenizeScript(scriptHex).filter((t) => t.push !== undefined);
  if (pushes.length !== 1) return null;
  const argument = pushes[0].push;
  const bytes = argument.length / 2;
  if (term.bytes !== null && bytes !== term.bytes) return null;
  return { id, label: term.label, binder: term.binder, bytes, argument, script: scriptHex, term };
}

// ─── reduction ───────────────────────────────────────────────────────────

// The term applied to its argument, reduced: the scriptPubKey, as hex.
//
// This is the key's claim in one function -- "reduce, and what falls out is the
// UTXO column" -- so the suite checks it against the script the address really
// decodes to rather than taking the tables' word for it. Every argument these
// terms take is 20 to 65 bytes, well inside a direct push, so the length byte
// is the push opcode and no PUSHDATA prefix arises.
export function reduce(term, argumentHex) {
  const n = argumentHex.length / 2;
  if (n < 1 || n > 75) return null;
  return term.body.map((code) => (code === null
    ? n.toString(16).padStart(2, '0') + argumentHex.toLowerCase()
    : code.toString(16).padStart(2, '0'))).join('');
}

// ─── writing one down ────────────────────────────────────────────────────

const escapeHtml = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const glyph = (code) => OPCODE_SYMBOLS[code] ?? OPCODE_NAMES[code] ?? '?';

// The marks, as plain text. Two renderings ride on one walk of the body: which
// one comes out is whether the bound variable still stands bare (the term, its
// argument not yet supplied) or wears the byte count that says what filled it
// (the normal form, where the datum is on the wire and its length is a push).
const bodyText = (t, counted) => t.term.body
  .map((code) => (code === null
    ? t.binder + (counted ? toSuperscript(t.bytes) : '')
    : glyph(code))).join(' ');

// λh. ⟦ ⧉ ⌖ h ≡ ∇ ⟧ — the lock with nothing supplied.
export const abstractionText = (t) => `λ${t.binder}. ⟦ ${bodyText(t, false)} ⟧`;

// (λh. ⟦ ⧉ ⌖ h ≡ ∇ ⟧) h²⁰ — the same term with this address's datum handed to
// it. The parentheses are the application's, not the script's: nothing here is
// on chain yet, which is the point of writing it this way round.
export const applicationText = (t) => `(${abstractionText(t)}) ${t.binder}${toSuperscript(t.bytes)}`;

// ⟦ ⧉ ⌖ h²⁰ ≡ ∇ ⟧ — what β leaves, which is the scriptPubKey: the same marks
// the book sets this script in wherever a chapter pays this address.
export const normalFormText = (t) => `⟦ ${bodyText(t, true)} ⟧`;

// The same three as HTML, in the classes the rest of the book uses for marks:
// .op an operation, .dt the datum's type letter, .op-push its byte count. .lam
// is the calculus rather than the script -- λ, the dot, the brackets, the
// application's parentheses -- and takes the quiet colour the notation key
// gives it, so a reader can still tell at a glance what would be on the wire.
//
// `prose` is the argument's bytes said in the book's own tongue, which only a
// caller holding the Glossia engine can supply. Given, it follows the mark it
// belongs to, exactly as a push's prose does in every chapter; withheld, the
// datum stays behind its mark and is simply not said.
const lam = (s) => `<span class="lam">${escapeHtml(s)}</span>`;
const op = (code) => `<span class="op" title="${escapeHtml(OPCODE_NAMES[code] || 'OP_UNKNOWN')}">${escapeHtml(glyph(code))}</span>`;
const dt = (t) => `<span class="dt" title="${escapeHtml(t.term.title)}">${t.binder}</span>`;
const count = (t) => `<span class="op op-push op-count" title="OP_PUSHBYTES_${t.bytes} — push the next ${t.bytes} bytes">${toSuperscript(t.bytes)}</span>`;

const bodyHtml = (t, counted, prose) => t.term.body
  .map((code) => (code === null
    ? dt(t) + (counted ? count(t) + (prose ? ` ${prose}` : '') : '')
    : op(code))).join(' ');

export const abstractionHtml = (t) => `${lam('λ')}${dt(t)}${lam('.')} ${lam('⟦')} ${bodyHtml(t, false)} ${lam('⟧')}`;

export const applicationHtml = (t, { prose = '' } = {}) =>
  `${lam('(')}${abstractionHtml(t)}${lam(')')} ${dt(t)}${count(t)}${prose ? ` ${prose}` : ''}`;

export const normalFormHtml = (t, { prose = '' } = {}) =>
  `${lam('⟦')} ${bodyHtml(t, true, prose)} ${lam('⟧')}`;
