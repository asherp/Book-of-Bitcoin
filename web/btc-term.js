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

import { OPCODE_SYMBOLS, OPCODE_NAMES, toSuperscript, toSubscript } from './btc-sigla.js';
import { outputTemplates } from './btc-templates.js';
import { tokenizeScript } from './btc-tx.js';

// The length variable's mark, on the datum's shoulder where every byte count in
// this book rides. U+207F, the superscript n -- a variable where a figure
// usually stands.
const SUPERSCRIPT_N = 'ⁿ';

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

// ─── the address, as the partial application it is ───────────────────────
//
// The other reading, and the one an address is actually FOR. Above, the λ binds
// what the address carries -- its own committed datum, supplied when the
// address was written -- and reducing gives the lock alone. Here the same term
// is opened far enough to hold BOTH parties' key material: the payee's datum,
// which the address already has, and the payer's, which nobody has yet.
//
//   (λh s p. ⟦ s p ⟧ ⟦ ⧉ ⌖ h ≡ ∇ ⟧) h²⁰ ridge amused garment … inmate
//
// An address is that expression with exactly one argument supplied. The λ is
// the shape; the prose after it is the argument -- the high-entropy half a
// base58 or bech32 string carries, said in the book's own tongue; and s and p
// stay bound, which is precisely what makes the thing an address rather than an
// output. It is a partial application, and it wants more before anything can be
// written down.
//
// Everything inside ⟦ ⟧ is what the wire will hold, so nothing may stand there
// that consensus does not define. That is why the demands are written as the
// two scripts a validator actually runs end to end -- ⟦spend⟧ then ⟦lock⟧, the
// key's own reading of the validator column -- and not as a predicate over
// them. A conjunction between clauses would have been the one mark on the line
// that no β could ever remove, and in this book's alphabet it would have been
// ∧: the glyph OP_AND wears, an opcode consensus disabled. Supply s and p and
// this line is a spend, mark for mark; supply nothing more and its right-hand
// bracket is already the scriptPubKey the chain is asked about below.
//
// Two things fall out that the committed-datum reading hides. P2PKH and P2WPKH
// ask for the same key material in the same order -- segwit moved where a
// witness rides, not what is asked for -- while the locks it rides against are
// not the same script at all. And P2SH and P2WSH cannot say what they want: the
// spend group opens on `…`, whatever the redeem script requires, which the
// address does not know and cannot know. Not a datum hidden behind a hash, but
// a REQUIREMENT hidden behind one.
//
// A reading, not an encoding. These are written down per term, because deriving
// them from arbitrary bytes is symbolic execution and undecidable in general;
// the sigla spelling stays the invertible form. `brings` is the spend in the
// order the spender pushes it -- a wrapped form's script rides on top, so it
// comes last -- and `runs` is the term that bracket then hands back, which is
// the one step ( ) exists for.
const DEMANDS = {
  p2pk:   [{ brings: 's' }],
  p2pkh:  [{ brings: 's p' }],
  p2sh:   [{ brings: '… r', runs: 'r' }],
  p2wpkh: [{ brings: 's p' }],
  p2wsh:  [{ brings: '… w', runs: 'w' }],
  // Taproot asks for one of two things, which is the whole of what a taptree
  // buys: a signature under the output key, or a leaf that proves to it.
  p2tr:   [{ brings: 's' },
           { brings: 's t c', runs: 't' }],
};

// The alternatives an address admits, or null for a term with none written
// down. Each is { binders: [names], brings: [names], runs: name|null } -- the
// datum's binder heads the list, since that is the one argument an address
// supplies, and everything after it is what a spend must still bring.
export function demandsOf(t) {
  const alts = DEMANDS[t.id];
  if (!alts) return null;
  return alts.map((alt) => {
    const brings = alt.brings.split(' ');
    return { binders: [t.binder, ...brings], brings, runs: alt.runs ?? null };
  });
}

const demandText = (t, alt) => `(λ${alt.binders.join(' ')}. `
  + `⟦ ${alt.brings.join(' ')} ⟧ ⟦ ${bodyText(t, false)} ⟧`
  + (alt.runs ? ` ( ${alt.runs} )` : '')
  + `) ${t.binder}${toSuperscript(t.bytes)}`;

export const demandsText = (t) => {
  const alts = demandsOf(t);
  return alts ? alts.map((alt) => demandText(t, alt)).join(' · ') : null;
};

// Set as marks, with one distinction doing real work: what the address already
// holds takes the gold, and what it is still waiting for does not. The same
// split the key's validator column keeps, and here it means a reader can see at
// a glance which half of the line is a fact and which is a demand.
const awaited = (name) => `<span class="aw">${escapeHtml(name)}</span>`;

const boundHtml = (t, name) => (name === '…' ? lam('…')
  : name === t.binder ? dt(t)
  : awaited(name));

// `prose` is the argument's bytes said in the book's own tongue, and it lands
// where an address keeps its payload: after the term, behind the mark that
// gives its length. Withheld, the datum stays behind that mark -- the line is
// still the right shape, it simply cannot be read back.
export function demandsHtml(t, { prose = '' } = {}) {
  const alts = demandsOf(t);
  if (!alts) return null;
  const name = (n) => boundHtml(t, n);
  const line = (alt) => `${lam('(λ')}${alt.binders.map(name).join(' ')}${lam('.')} `
    + `${lam('⟦')} ${alt.brings.map(name).join(' ')} ${lam('⟧')} `
    + `${lam('⟦')} ${bodyHtml(t, false)} ${lam('⟧')}`
    + (alt.runs ? ` ${lam('(')} ${name(alt.runs)} ${lam(')')}` : '')
    + `${lam(')')} ${dt(t)}${count(t)}${prose ? ` ${prose}` : ''}`;
  return alts.map(line).join(` ${lam('·')} `);
}

// ─── the pure form ───────────────────────────────────────────────────────
//
// The terms above still hold their opcodes: λh. ⟦ ⧉ ⌖ h ≡ ∇ ⟧ has ⧉ and ⌖
// baked into it, so P2PKH's abstraction is a different object from P2WPKH's
// and a reader has to be told which is which. Lift out everything that is not
// structure -- the opcodes, and the push's length with them -- and what is left
// is shape alone:
//
//   (λo₁ o₂ o₃ o₄ n h. ⟦ o₁ o₂ hⁿ o₃ o₄ ⟧) ⧉ ⌖ ≡ ∇ 20 h
//
// The binders run opcodes first, then each push as a PAIR: its length, then the
// datum it measures. That is the wire's own order -- a direct push opcode IS
// its byte count, so the chain writes 14 <20 bytes> and the term writes 20 h --
// and pairing is what keeps a length beside the bytes it governs when a script
// carries more than one push. It costs a little of the entropy ordering, since
// a low-entropy count now sits between the opcodes and the datum rather than
// ahead of both; it buys a term that says on its face exactly how many bytes of
// key material the lock requires, which is the thing anyone making an output of
// this kind actually needs to know.
//
// Self-describing, and now completely: the term states which operations, in
// which order, over a push of what length, so nothing indexes a table of known
// patterns -- the one thing base58's version byte could never stop doing.
//
// What falls out is the Addresses group's claim, structurally. P2WPKH, P2WSH
// and P2TR do not merely resemble one another under this form -- they are one
// term, λo n x. ⟦ o xⁿ ⟧, at three arguments, the length among them.
// term.test.mjs checks that.
//
// One binder per position rather than per distinct opcode: none of these terms
// uses the same mark twice, and a term that did would be saying something
// (this operation, again) that the positional reading does not.
export function pureForm(t) {
  const opcodes = t.term.body.filter((code) => code !== null);
  const lenName = 'n';
  const datumName = t.binder;
  const opNames = opcodes.map((_, i) => `o${toSubscript(i + 1)}`);
  let next = 0;
  // In the body the push is one mark, as the book always writes it: the datum
  // with its count on its shoulder. The count is a bound variable here, so what
  // rides there is the variable's own superscript rather than a figure.
  const hole = datumName + SUPERSCRIPT_N;
  const body = t.term.body.map((code) => (code === null ? hole : opNames[next++]));
  return {
    binders: [...opNames, lenName, datumName], body, opcodes, lenName, datumName, hole,
    bytes: t.bytes, datum: t.argument, term: t,
  };
}

// The pure form's arguments substituted back through its binders -> the
// scriptPubKey. A second road to the same bytes, and it runs over the names
// the form is actually written with, so a body that named a binder the λ never
// bound would fail here rather than merely look wrong on the page. The length
// is an argument like any other now, so this reduction proves the pairing as
// well as the shape: a term whose n did not reach its own push would not
// normalize to the wire.
export function reducePure(pure) {
  const env = new Map(pure.opcodes.map((code, i) => [pure.binders[i], code]));
  env.set(pure.lenName, pure.bytes);
  env.set(pure.datumName, pure.datum);
  const parts = pure.body.map((name) => {
    if (name !== pure.hole) {
      const code = env.get(name);
      return typeof code === 'number' ? code.toString(16).padStart(2, '0') : null;
    }
    // The push, from its pair: n becomes the push opcode -- on the wire a
    // direct push IS its count -- and the datum follows it. The two are checked
    // against each other here, which is the pairing's whole content: a length
    // that did not measure the bytes beside it would spell a different script.
    const n = env.get(pure.lenName), datum = env.get(pure.datumName);
    if (typeof n !== 'number' || typeof datum !== 'string') return null;
    if (n < 1 || n > 75 || datum.length / 2 !== n) return null;
    return n.toString(16).padStart(2, '0') + datum.toLowerCase();
  });
  return parts.includes(null) ? null : parts.join('');
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

export const normalFormHtml = (t, { prose = '' } = {}) =>
  `${lam('⟦')} ${bodyHtml(t, true, prose)} ${lam('⟧')}`;

// The pure form, written out. Its binders and body are variables throughout --
// nothing here is on the wire yet, not even an operation or a length -- so the
// whole skeleton takes the quiet apparatus colour, and the arguments beside it
// are the first bright thing on the line. Reducing brightens the body, which is
// the reduction made visible: the marks move into the holes.
//
// The datum's argument stands as its name rather than its prose. It is the same
// datum on every line of a reduction, and saying it three times would bury the
// shape the form exists to show; the normal form is where it lands and where
// the book says what it is. Its length stands as a figure, because a figure is
// what is being supplied -- 20, not ²⁰. The superscript is what the count
// becomes once it has been applied.
const pureName = (pure, name) => (name === pure.hole
  ? dt(pure.term) + `<span class="op op-push">${SUPERSCRIPT_N}</span>`
  : `<span class="lam">${escapeHtml(name)}</span>`);

export const pureText = (pure) => `λ${pure.binders.join(' ')}. ⟦ ${pure.body.join(' ')} ⟧`;

export const pureApplicationText = (pure) =>
  `(${pureText(pure)}) ${pure.opcodes.map(glyph).join(' ')} ${pure.bytes} ${pure.datumName}`;

export const pureHtml = (pure) => `${lam('λ')}${pure.binders.map((n) => pureName(pure, n)).join(' ')}${lam('.')} `
  + `${lam('⟦')} ${pure.body.map((n) => pureName(pure, n)).join(' ')} ${lam('⟧')}`;

export const pureApplicationHtml = (pure) => `${lam('(')}${pureHtml(pure)}${lam(')')} `
  + `${pure.opcodes.map(op).join(' ')} <span class="op op-push">${pure.bytes}</span> ${dt(pure.term)}`;

// The lock, one β on: the opcodes are in the body now and what the term still
// wants is a push -- a length, and that many bytes. This is the line that says
// how much key material an output of this kind requires, which is the whole
// reason the length is an argument rather than an annotation.
const lockBody = (pure) => pure.term.term.body
  .map((code) => (code === null ? pure.hole : glyph(code))).join(' ');

export const lockText = (pure) =>
  `λ${pure.lenName} ${pure.datumName}. ⟦ ${lockBody(pure)} ⟧`;

export const lockApplicationText = (pure) =>
  `(${lockText(pure)}) ${pure.bytes} ${pure.datumName}`;
