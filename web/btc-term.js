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
// This module is that sentence as code. It reads a term off any script it can
// tokenize — every push a binder, every opcode where it stands — renders both
// sides of the reduction, and reduces; so the claim the key makes in prose is
// one the suite can check: reduce(term, arguments) is the scriptPubKey, byte
// for byte, for the six tabled forms and for everything else alike.
//
// Curried, because a script is: bare multisig binds three keys, a revealed
// redeem script binds whatever it holds, and one hole is not what makes a term
// but what makes an ADDRESS — see `addressable`. The names are the calculus's
// (a repeated letter gets a subscript, p₁ p₂ p₃) and the marks are the wire's,
// which is why the spelled form below a term carries no subscripts: it is a
// serialization, and the search box has to read it back.
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
import { dataLetter } from './btc-address-form.js';

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

// A scriptPubKey -> the term it is, with its arguments bound:
//
//   { id, label, holes: [{ name, title, bytes, argument }], body, script }
//
// The term is not looked up, it is READ: every push in the script becomes a
// hole, every opcode stays where it stands, and what falls out is a curried
// function of as many arguments as the script has pushes. So the six tabled
// forms are derived rather than tabled -- the letters agree with TERMS because
// both take them from the same reading of the bytes -- and the shapes with no
// table entry come out too. Bare multisig binds three keys, a data output its
// blob, and a redeem script revealed by a spend binds whatever it holds.
//
// That is a widening, and the claim it used to enforce moves rather than dies:
// one hole is what an ADDRESS can carry, not what a term can have. `addressable`
// says which, and rung one shows the rest their own refusal -- three arguments
// after the parens where an address has one.
//
// Null only when there is no term to read: bytes that are not a whole script,
// a push that claims more than remains, an opcode consensus never defined (the
// alphabet has no mark for it, so no line could be drawn), or a script with no
// push at all, which abstracts over nothing.
const TITLES = { h: 'hash', p: 'public key', d: 'data' };

export function termOfScript(scriptHex) {
  let toks;
  try { toks = tokenizeScript(scriptHex); } catch { return null; }
  if (!toks.length || toks.some((tk) => tk.trunc !== undefined)) return null;
  if (toks.some((tk) => tk.op !== undefined && OPCODE_SYMBOLS[tk.op] === undefined)) return null;
  const body = [], holes = [];
  let prevOp = null;
  for (const tk of toks) {
    if (tk.op !== undefined) { body.push(tk.op); prevOp = tk.op; continue; }
    // The letter is the book's own reading of the push (btc-address-form's
    // dataLetter, which the chapter renderer shares): h a committed hash, p a
    // key, and d for bytes that are neither and are simply data.
    holes.push({ letter: dataLetter(tk.push, prevOp) || 'd',
      bytes: tk.push.length / 2, argument: tk.push });
    body.push(null);
    prevOp = null;
  }
  if (!holes.length) return null;
  // A letter used twice is two variables, so it is numbered -- p₁ p₂ p₃, the
  // way the key's own multisig row writes them. Used once it stands bare.
  const seen = new Map();
  for (const hole of holes) seen.set(hole.letter, (seen.get(hole.letter) ?? 0) + 1);
  const nth = new Map();
  for (const hole of holes) {
    const n = seen.get(hole.letter);
    if (n === 1) { hole.name = hole.letter; continue; }
    nth.set(hole.letter, (nth.get(hole.letter) ?? 0) + 1);
    hole.name = hole.letter + toSubscript(nth.get(hole.letter));
  }
  const rows = outputTemplates(scriptHex);
  const id = rows.map((r) => TERM_OF_ROW[r] ?? r).find((r) => TERMS[r]) ?? null;
  // A tabled form takes its letter and title from the table rather than from
  // the bytes. The classifier has already said what this push IS by where it
  // stands -- P2PK's argument is a public key however unkeylike its bytes look
  // -- and a position beats a shape heuristic. Taproot gains by it too: its
  // datum is an output key, which no reading of 32 bytes could have told.
  for (const hole of holes) hole.title = TITLES[hole.letter] ?? 'data';
  if (id && holes.length === 1) {
    holes[0].letter = holes[0].name = TERMS[id].binder;
    holes[0].title = TERMS[id].title;
  }
  return {
    id, label: TERMS[id]?.label ?? rows[0] ?? 'Script', holes, body, script: scriptHex,
    // The single-datum case, named as it always was: an address has exactly one
    // argument, so everything that reads an address reads these.
    binder: holes[0].name, bytes: holes[0].bytes, argument: holes[0].argument,
  };
}

// One abstraction over one datum -- which is what an address can carry, and the
// whole of what the key's Addresses group is about.
export const addressable = (t) => !!t && t.holes.length === 1;

// ─── reduction ───────────────────────────────────────────────────────────

// The term applied to its argument, reduced: the scriptPubKey, as hex.
//
// This is the key's claim in one function -- "reduce, and what falls out is the
// UTXO column" -- so the suite checks it against the script the address really
// decodes to rather than taking the tables' word for it. Every argument these
// terms take is 20 to 65 bytes, well inside a direct push, so the length byte
// is the push opcode and no PUSHDATA prefix arises.
// Curried, so the arguments are a list and they fill the holes in order. One
// hex string is accepted for the single-datum case, which is every address.
export function reduce(term, args) {
  const list = typeof args === 'string' ? [args] : [...args];
  if (list.length !== term.body.filter((code) => code === null).length) return null;
  let next = 0;
  const parts = term.body.map((code) => {
    if (code !== null) return code.toString(16).padStart(2, '0');
    const arg = list[next++];
    const n = arg.length / 2;
    if (n < 1 || n > 75) return null;
    return n.toString(16).padStart(2, '0') + arg.toLowerCase();
  });
  return parts.includes(null) ? null : parts.join('');
}

// ─── the address, as the partial application it is ───────────────────────
//
// The other reading, and the one an address is actually FOR. Above, the λ binds
// what the address carries -- its own committed datum, supplied when the
// address was written -- and reducing gives the lock alone. Here the same term
// is opened far enough to hold one party's key material at BOTH its moments:
// the image the address publishes now, and the preimage and signature only its
// author can produce later.
//
//   (λh. ⧉ ⌖ h ≡ ∇) h²⁰ ridge amused garment … inmate
//         λs p. ⧉ ⌖ h²⁰ ≡ ∇
//
// One party, not two. h is ⌖p, and the lock's whole content is that the p a
// spend brings is the p behind h (⌖ … ≡) and that the spender holds the scalar
// behind it (∇) -- two clauses about one person. The payer never appears: they
// transcribe someone else's h into an output and supply nothing to it, their
// own keys going to their own inputs against their own prior locks. So an
// address demands of its author alone, and ⧉ is there because no name survives
// from the writing to the spending: the identity has to be re-established from
// bytes.
//
// Two lines because there are two λ, and applying the first is what hands back
// the second. An address is a combinator over one argument -- closed, since its
// only other marks are opcodes -- and what it returns when that argument goes
// in is not a fragment but another abstraction: the scriptPubKey, which is
// itself a function of what a spend will bring. So the leaf's two paragraphs
// are two rungs of one descent, and the reduction between them is the payer's
// whole contribution.
//
// The descent is longer than these two, and the rest of it is already in this
// module: pureForm lifts the opcodes and the push's length out as arguments
// too, lockText applies the opcodes back, abstractionText applies the length,
// and this is what applying the datum gives. Every rung is the one above it
// with one more argument supplied, and the chain stores the rung where the
// arguments run out -- everything below that is a spend, and a spend is a
// transaction, not an output.
//
// The rung below the wire is spendText: the arguments applied, written the way
// a stack machine writes an application, which is the arguments' pushes ahead
// of the function's code. ⧺ is that application -- OP_CAT's mark, disabled and
// chosen anyway, since concatenating the two byte strings is exactly what
// applying a function is on a concatenative machine. It is not drawn on the
// leaf: the leaf is showing an address, and no spend has happened.
//
// What all of this replaced was a demand written as a predicate, which needed a
// conjunction between its clauses that no β could ever have removed. It printed
// as ∧ -- OP_BOOLAND, an opcode that is not disabled at all, and that pops two
// numbers off a stack. A live opcode standing in for a connective is the worse
// failure of the two: nothing marked the line as unreducible, it simply was not.
//
// Two things fall out that the committed-datum reading hides. P2PKH and P2WPKH
// ask for the same key material in the same order -- segwit moved where a
// witness rides, not what is asked for -- while the locks it rides against are
// not the same script at all. And the wrapped forms cannot say what they want,
// which the structure now states rather than gestures at: a lock ending in
// ( r ) hands back a function, and how many arguments THAT one takes is a
// property of a script the address has never seen. Not a datum hidden behind a
// hash, but a REQUIREMENT hidden behind one -- and an arity is exactly the
// thing an unapplied function is already unable to promise. An earlier draft
// wrote a `…` binder for this. It was a hand-wave where the term was already
// telling the truth, and it cost taproot's script path an invented `s`, as if
// every leaf wanted a signature.
//
// A reading, not an encoding. These are written down per term, because deriving
// them from arbitrary bytes is symbolic execution and undecidable in general;
// the sigla spelling stays the invertible form. `brings` is what the lock is a
// function of, in the order the spender pushes it -- a wrapped form's script
// rides on top, so it comes last -- and `runs` is what the lock then hands back
// to be run, the one step ( ) exists for and the only thing on a line that is
// neither a spend nor a lock.
const DEMANDS = {
  p2pk:   [{ brings: 's' }],
  p2pkh:  [{ brings: 's p' }],
  p2sh:   [{ brings: 'r', runs: 'r' }],
  p2wpkh: [{ brings: 's p' }],
  p2wsh:  [{ brings: 'w', runs: 'w' }],
  // Taproot asks for one of two things, which is the whole of what a taptree
  // buys: a signature under the output key, or a leaf that proves to it.
  p2tr:   [{ brings: 's' },
           { brings: 't c', runs: 't' }],
};

// What the lock, once written, is still a function of -- or null for a term
// with nothing written down. Each alternative is { brings: [names], runs }, and
// a term with two of them is an output with two ways to open it.
export function demandsOf(t) {
  const alts = DEMANDS[t.id];
  if (!alts) return null;
  return alts.map((alt) => ({ brings: alt.brings.split(' '), runs: alt.runs ?? null }));
}

// The joint, taken from the alphabet rather than written out, so the mark on
// the page is the one the book gives 0x7e and cannot drift from it.
const CAT = OPCODE_SYMBOLS[0x7e];

// ─── rung one: the address ───────────────────────────────────────────────
//
// The term applied to the data it carries, and nothing else supplied. Curried,
// so the binders run in the order the pushes do and the arguments follow in the
// same order -- one apiece for an address, three for a bare multisig, which is
// that form being shown its own refusal rather than told about it. The binders
// stand bare inside the body, because a count arrives with its argument.
export const addressText = (t) =>
  `(λ${t.holes.map((h) => h.name).join(' ')}. ${bodyText(t, false)}) `
  + t.holes.map((h) => h.name + toSuperscript(h.bytes)).join(' ');

// ─── rung two: what that hands back ──────────────────────────────────────
//
// Not a fragment: a λ of its own, over what a spend must bring. One line per
// alternative, since the lock is one script however many ways there are to
// satisfy it.
export const lockedText = (t) => {
  const alts = demandsOf(t);
  return alts ? alts.map((alt) => `λ${alt.brings.join(' ')}. ${bodyText(t, true)}`
    + (alt.runs ? ` ( ${alt.runs} )` : '')) : null;
};

// ─── rung three: the spend ───────────────────────────────────────────────
//
// The arguments applied, in the order a stack machine writes an application:
// the pushes ahead of the code. Not drawn on the leaf -- an address has no
// spend yet -- but it is the rung the two above are descending toward.
export const spendText = (t) => {
  const alts = demandsOf(t);
  return alts ? alts.map((alt) => `${alt.brings.join(' ')} ${CAT} ${bodyText(t, true)}`
    + (alt.runs ? ` ( ${alt.runs} )` : '')) : null;
};

// ─── the same, as marks ──────────────────────────────────────────────────
//
// One distinction does the work: what the address already holds takes the
// gold, and what it is still waiting for does not. The same split the key's
// validator column keeps, and here it means a reader sees at a glance which
// half of a line is a fact and which is a demand.
const awaited = (name) => `<span class="aw">${escapeHtml(name)}</span>`;

// `prose` is the argument's bytes said in the book's own tongue, and it lands
// where an address keeps its payload: after the term, behind the mark that
// gives its length. Withheld, the datum stays behind that mark -- the line is
// still the right shape, it simply cannot be read back.
export const addressHtml = (t, { prose = '' } = {}) =>
  `${lam('(λ')}${t.holes.map(dt).join(' ')}${lam('.')} ${bodyHtml(t, false)}${lam(')')} `
  + t.holes.map((h, i) => dt(h) + count(h)
    + (prose && i === 0 && t.holes.length === 1 ? ` ${prose}` : '')).join(' ');

// The second rung, split so a caller can set the script between the marks: the
// leaf's lock line is also the copyable sigla address, and a λ inside that
// span would go into the clipboard and stop the search box reading it back.
// So the binders come out as a prefix and the eval step as a suffix, and what
// goes between them is the caller's -- spelled with its prose, or drawn from
// the term alone when there is no engine to say it.
export function lockedMarks(t) {
  const alts = demandsOf(t);
  if (!alts) return null;
  return alts.map((alt) => ({
    prefix: `${lam('λ')}${alt.brings.map(awaited).join(' ')}${lam('.')}`,
    suffix: alt.runs ? ` ${lam('(')} ${awaited(alt.runs)} ${lam(')')}` : '',
  }));
}

// The third rung as marks. It is drawn only where the chain says it happened,
// because that is the only way anyone can know it: s and p are not in the
// address and no reduction reaches them, so the shape is all this page can
// write and the citation beside it is what supplies the rest.
export function spendMarks(t) {
  const alts = demandsOf(t);
  if (!alts) return null;
  return alts.map((alt) => ({
    prefix: `${alt.brings.map(awaited).join(' ')} ${cat()}`,
    suffix: alt.runs ? ` ${lam('(')} ${awaited(alt.runs)} ${lam(')')}` : '',
  }));
}

// The joint takes the quiet colour, not the gold: it is the step between the
// two scripts and not a byte either of them holds -- which is also why it can
// be a disabled opcode's mark without the line claiming a disabled opcode.
const cat = () => `<span class="lam" title="${escapeHtml(OPCODE_NAMES[0x7e])} — the arguments `
  + `applied, which a stack machine writes as their pushes ahead of the code">${escapeHtml(CAT)}</span>`;

// The lock's own marks, with no prose and nothing copyable about them: what a
// second alternative shows, since the datum has already been said once above.
export const lockBodyHtml = (t) => bodyHtml(t, true);

export const lockedHtml = (t) => {
  const marks = lockedMarks(t);
  return marks ? marks.map((m) => `${m.prefix} ${lockBodyHtml(t)}${m.suffix}`) : null;
};

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
  if (!addressable(t)) return null;
  const opcodes = t.body.filter((code) => code !== null);
  const lenName = 'n';
  const datumName = t.binder;
  const opNames = opcodes.map((_, i) => `o${toSubscript(i + 1)}`);
  let next = 0;
  // In the body the push is one mark, as the book always writes it: the datum
  // with its count on its shoulder. The count is a bound variable here, so what
  // rides there is the variable's own superscript rather than a figure.
  const hole = datumName + SUPERSCRIPT_N;
  const body = t.body.map((code) => (code === null ? hole : opNames[next++]));
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
const bodyText = (t, counted) => {
  let next = 0;
  return t.body.map((code) => {
    if (code !== null) return glyph(code);
    const hole = t.holes[next++];
    return hole.name + (counted ? toSuperscript(hole.bytes) : '');
  }).join(' ');
};

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
const dt = (hole) => `<span class="dt" title="${escapeHtml(hole.title)}">${escapeHtml(hole.name)}</span>`;
const count = (hole) => `<span class="op op-push op-count" title="OP_PUSHBYTES_${hole.bytes} — push the next ${hole.bytes} bytes">${toSuperscript(hole.bytes)}</span>`;

const bodyHtml = (t, counted, prose) => {
  let next = 0;
  return t.body.map((code) => {
    if (code !== null) return op(code);
    const hole = t.holes[next++];
    return dt(hole) + (counted ? count(hole) + (prose ? ` ${prose}` : '') : '');
  }).join(' ');
};

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
  ? dt(pure.term.holes[0]) + `<span class="op op-push">${SUPERSCRIPT_N}</span>`
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
const lockBody = (pure) => pure.term.body
  .map((code) => (code === null ? pure.hole : glyph(code))).join(' ');

export const lockText = (pure) =>
  `λ${pure.lenName} ${pure.datumName}. ⟦ ${lockBody(pure)} ⟧`;

export const lockApplicationText = (pure) =>
  `(${lockText(pure)}) ${pure.bytes} ${pure.datumName}`;
