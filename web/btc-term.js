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
import { parseEnvelopes } from './btc-inscriptions.js';

// The length variable's mark, on the datum's shoulder where every byte count in
// this book rides. U+207F, the superscript n -- a variable where a figure
// usually stands.
const SUPERSCRIPT_N = 'ⁿ';

const OP_0 = 0x00, OP_1 = 0x51;
const OP_DUP = 0x76, OP_HASH160 = 0xa9, OP_SHA256 = 0xa8, OP_HASH256 = 0xaa;
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
const TITLES = { h: 'hash', p: 'public key', d: 'data',
  s: 'signature', r: 'redeem script', w: 'witness script', t: 'tapscript leaf',
  c: 'control block — the leaf’s proof to the output key' };

export function termOfScript(scriptHex) {
  // A form the book has a grammar for is named by it. Anything else falls
  // through to the anonymous reading below, which knows only pushes and
  // opcodes -- true of every script, and the less it can say.
  const ord = ordTermOf(scriptHex);
  if (ord) return ord;
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

// ─── the ord envelope, as the form it is ─────────────────────────────────
//
// An inscription is not a script consensus distinguishes: it is an unexecuted
// branch inside a tapscript, skipped by every validating node precisely
// because the IF is false. What ord fixes is the grammar -- OP_FALSE OP_IF
// "ord", tagged fields, an empty push, the body, OP_ENDIF -- so a term over
// these bytes binds what varies and prints what the format decides.
//
// "ord" and a field's tag number are the same in every inscription ever made.
// Binding them would parameterize two values that cannot differ, so they are
// constants of the form: written bytes, and they take the gold every written
// byte takes rather than a binder's ink.
//
// The body is one binder however many pushes carry it. A tapscript push holds
// at most 520 bytes and ord concatenates the chunks, so the split is an
// artefact of the cap rather than a field of the envelope; the hole keeps the
// chunks, so the bytes can still be counted and put back.
//
// The grammar is read by parseEnvelopes (btc-inscriptions.js), which is the
// book's one reader for it -- a second would be a second opinion about what an
// inscription is. Null for anything that is not exactly one envelope in the
// shape ord defines: declining beats guessing.
const ORD_TAGS = { 1: 'content type', 2: 'pointer', 3: 'parent', 5: 'metadata',
  7: 'metaprotocol', 9: 'content encoding', 11: 'delegate' };
const ORD_LETTER = { 1: 'y' };
const hexBytes = (hex) => {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
};
// A constant's own bytes, push opcode and all. Direct pushes only: every
// constant the grammar fixes is a few bytes, and a form whose constant needed
// OP_PUSHDATA is not one this table describes.
const pushOf = (hex) => {
  const n = hex.length / 2;
  return n >= 1 && n <= 75 ? n.toString(16).padStart(2, '0') + hex.toLowerCase() : null;
};

export function ordTermOf(scriptHex) {
  let toks;
  try { toks = tokenizeScript(scriptHex); } catch { return null; }
  if (!toks.length || toks.some((tk) => tk.trunc !== undefined)) return null;
  if (parseEnvelopes(hexBytes(scriptHex)).length !== 1) return null;
  const body = [], holes = [];
  let i = 0;
  // The key the tapscript actually spends by, standing before the branch that
  // nobody runs. Read by its place, not its shape: a 32-byte push under
  // OP_CHECKSIG is an x-only key whatever its bytes look like.
  if (toks[0]?.push?.length === 64 && toks[1]?.op === 0xac) {
    holes.push({ letter: 'p', name: 'p', bytes: 32, argument: toks[0].push,
      title: 'public key — the tapscript’s own' });
    body.push(null, 0xac);
    i = 2;
  }
  if (toks[i]?.op !== 0x00 || toks[i + 1]?.op !== 0x63) return null;
  body.push(0x00, 0x63);
  i += 2;
  const name = toks[i];
  if (name?.push !== '6f7264') return null;                       // "ord"
  const named = pushOf(name.push);
  if (!named) return null;
  body.push({ hex: named, mark: 'ord', said: 'ord — the tag every envelope opens with' });
  i += 1;
  // Tagged fields, pair by pair, until the empty push that opens the body.
  while (i < toks.length && toks[i]?.op !== 0x68) {
    if (toks[i].op === 0x00) { body.push(0x00); i += 1; break; }
    const tag = toks[i], value = toks[i + 1];
    if (tag.push === undefined || value?.push === undefined) return null;
    const n = parseInt(tag.push.slice(0, 2), 16);
    const encoded = pushOf(tag.push);
    if (!encoded) return null;
    const what = ORD_TAGS[n] ?? 'a field ord does not define';
    body.push({ hex: encoded, mark: String(n), said: `${what} — the tag it is written under` });
    const letter = ORD_LETTER[n] ?? 'd';
    holes.push({ letter, name: letter, bytes: value.push.length / 2,
      argument: value.push, title: what });
    body.push(null);
    i += 2;
  }
  const chunks = [];
  while (i < toks.length && toks[i]?.op !== 0x68) {
    if (toks[i].push === undefined) return null;
    chunks.push(toks[i].push);
    i += 1;
  }
  if (toks[i]?.op !== 0x68) return null;
  if (chunks.length) {
    const all = chunks.join('');
    holes.push({ letter: 'b', name: 'b', bytes: all.length / 2, argument: all, chunks,
      title: 'the inscription body' });
    body.push(null);
  }
  body.push(0x68);
  if (!holes.length) return null;
  return {
    id: 'ord', label: 'Ord', holes, body, script: scriptHex,
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
    // A constant of a form carries its own bytes, push opcode and all, since
    // nothing supplies it: it is what these bytes are rather than what varies.
    if (code !== null && typeof code === 'object') return code.hex;
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
// The rung below the wire is spendText, and it is rung two applied: the same
// abstraction in parentheses with what a spend brings written after it, which
// is how rung one already writes an application and how this book writes every
// other one. It is not drawn on the address leaf -- the leaf is showing an
// address, and no spend has happened.
//
// The joint used to be a mark of its own. ⧺ stood there, OP_CAT's glyph, on the
// reading that concatenating two byte strings is what applying a function is on
// a concatenative machine -- the arguments' pushes ahead of the function's code,
// which is the order the wire really uses. True about the machine, and wrong
// about the notation: an opcode was doing a calculus's work, on a line already
// written in the calculus, beside parentheses that meant application two rungs
// up. So the parentheses take it back. The wire's order is not lost by this and
// never lived in the joint anyway -- it is in the binder list, where λ… r. says
// which push comes first, and in the quoted values a spend rung sets beneath.
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
// not the same script at all. And the wrapped forms cannot say what they want:
// a lock ending in ( r ) hands back a function, and how many arguments THAT one
// takes is a property of a script the address has never seen. Not a datum
// hidden behind a hash, but a REQUIREMENT hidden behind one -- and an arity is
// exactly the thing an unapplied function is already unable to promise.
//
// What the wrapped forms DO say is that there are some. A revealed script is
// run the way every other script is run -- the machine is the same machine, and
// a tapscript leaf is not a special case of it: its arguments go on the stack
// beneath it and it consumes them in order. So the term writes … ahead of the
// binders it can name, and the reader is told an unknown number of arguments
// belongs there rather than left to infer it from the ( ) at the far end.
//
// An earlier draft dropped that mark entirely, on the ground that a binder
// names one value a spend supplies and … names no value at all. That much
// holds, and is why … stays OUT of `brings` and is written from `runs`: it is
// not a binder, it is the notation admitting the binders it cannot write. What
// the draft was really right about was the invented `s` it carried alongside --
// taproot's script path bound one, as if every leaf wanted a signature, which no
// address can know. That stays gone. `brings` is letters, one value apiece.
//
// A reading, not an encoding. These are written down per term, because deriving
// them from arbitrary bytes is symbolic execution and undecidable in general;
// the sigla spelling stays the invertible form. `brings` is what the lock is a
// function of, in the order the spender pushes it -- a wrapped form's script
// rides on top, so it comes last -- and `runs` is what the lock then hands back
// to be run, the one step ( ) exists for and the only thing on a line that is
// neither a spend nor a lock. `runs` is also what puts the … there, since a lock
// that hands back a script is exactly a lock whose arity it cannot state: the
// two can never disagree because there is only one field.
//
// `demand` is what a spend has to make true, which is a different question
// from what the output holds and the only one a reader can actually check. It
// is a PREDICATE, not a script: clauses joined by a conjunction, over the
// values a spend brings and the datum the output carries.
//
//   P2PKH · P2WPKH  ( ⌖ p ≡ h²⁰ ) ∧ ∇ s p ( ⌘ … )
//   P2SH            ( ⌖ r ≡ h²⁰ ) ∧ ( r )
//   P2WSH           ( Σ w ≡ h³² ) ∧ ( w )
//   P2TR key        ∇ s p³² ( ⌘ … )
//   P2TR script     ( ⋔ t c ≡ p³² ) ∧ ( t )
//
// This is a return, and the thing returned to was thrown out for a reason
// worth restating. A demand written as a predicate once stood on rung two, and
// its conjunction printed as ∧ -- OP_BOOLAND, a live opcode that pops two
// numbers off a stack -- on a line that claimed to reduce to a script. The
// claim was the fault, not the mark: nothing said the line was unreducible, so
// a reader had every reason to read ∧ as an instruction, and it simply was not
// one.
//
// What changed is that the claim is gone. Rung two no longer says it reduces to
// anything; the script it used to spell is set immediately below it, quoted,
// under a citation. So the line is free to say what only a predicate can, which
// is the whole point of writing one: a reader with the page in front of them
// can check the math. ⌖ p ≡ h is a hash they can take. ∇ s p ( ⌘ … ) is a
// signature they can verify, once ⌘'s message is a thing they can see -- which
// is what the footnote a spent output points them to is for.
//
// The ∧ stays quiet, in the apparatus colour, and that is what keeps it honest:
// on this leaf gold means a byte the chain holds or an operation being run, and
// the conjunction is neither. A reader who wonders is told in its hover.
//
// `runs` still carries the ellipsis, and now also a clause of its own -- ( r )
// says the revealed script's own demand stands here, uncounted and unread,
// which is exactly as much as an output that committed to a hash can say.
const D = Symbol('datum');       // the datum the output carries, with its count
const MSG = Symbol('message');   // ( ⌘ … ), the message a signature is over
const RUN = Symbol('runs');      // ( r ), whatever the revealed script demands
const AND = Symbol('and');       // ∧, the conjunction -- notation, not an opcode
const OPEN = Symbol('('), CLOSE = Symbol(')');
const TWEAK = '⋔';               // the taptweak, which no opcode spells

const SIGNED = (key) => [OP_CHECKSIG, 's', key, MSG];
const HASHED = (op, name) => [OPEN, op, name, OP_EQUALVERIFY, D, CLOSE, AND];

// `shown` is the demand with its commitment discharged: what is left to make
// true once the spend has disclosed the thing the output only committed to.
// A keyhash output holds ⌖p and nothing else, so the whole of what it says is
// "the p you bring hashes to this, and you can sign under it" -- and once the
// chain has shown the p, the hash clause is a question already answered. What
// remains is the signature, over a message the page can now name. That is the
// reveal's own title: not what the output demanded of an unknown spender, but
// what the spend that happened turned out to be.
//
// Every form that hides a VALUE has one, and the two kinds differ only in
// what the spend had to bring. A keyhash output hid the key, so the spend
// brought it and it stands as a binder; P2PK and taproot's key path carried
// their key in the output all along, so the spend brought only a signature and
// the key stays the datum it always was -- λs. ∇ s p³² ( ⌘ ※ ). Neither is the
// lock's demand any more: what a spend must make true is a question about a
// future, and these describe one that happened.
//
// The script-hash forms hide a whole SCRIPT rather than a value, so they have
// none of these: their reveal is titled by that script's own term, which the
// spend handed over in full (see revealedHtml).
const DEMANDS = {
  p2pk:   [{ brings: 's', demand: SIGNED(D), shown: SIGNED(D) }],
  p2pkh:  [{ brings: 's p', demand: [...HASHED(OP_HASH160, 'p'), ...SIGNED('p')],
             shown: SIGNED('p') }],
  p2sh:   [{ brings: 'r', runs: 'r', demand: [...HASHED(OP_HASH160, 'r'), RUN] }],
  p2wpkh: [{ brings: 's p', demand: [...HASHED(OP_HASH160, 'p'), ...SIGNED('p')],
             shown: SIGNED('p') }],
  p2wsh:  [{ brings: 'w', runs: 'w', demand: [...HASHED(OP_SHA256, 'w'), RUN] }],
  // Taproot asks for one of two things, which is the whole of what a taptree
  // buys: a signature under the output key, or a leaf that proves to it and is
  // then run like any other script -- the proof being the control block, which
  // tweaks the leaf back to the key the output committed to.
  p2tr:   [{ brings: 's', demand: SIGNED(D), shown: SIGNED(D) },
           { brings: 't c', runs: 't',
             demand: [OPEN, TWEAK, 't', 'c', OP_EQUALVERIFY, D, CLOSE, AND, RUN] }],
};

// What the lock, once written, is still a function of -- or null for a term
// with nothing written down. Each alternative is { brings: [names], runs,
// demand }, and a term with two of them is an output with two ways to open it.
export function demandsOf(t) {
  const alts = DEMANDS[t.id];
  if (!alts) return null;
  return alts.map((alt) => ({ brings: alt.brings.split(' '), runs: alt.runs ?? null,
    demand: alt.demand ?? null, shown: alt.shown ?? null,
    // Every opcode this alternative's demand writes, named so a caller can hold
    // the line to its own vocabulary rather than to the whole alphabet. ⌘ is in
    // it wherever a message is: the digest a signature is over is a hash being
    // taken, and the mark for it is the one the alphabet gives OP_HASH256.
    marks: (alt.demand ?? []).flatMap((tok) => (typeof tok === 'number' ? [tok]
      : tok === MSG ? [OP_HASH256] : [])) }));
}

// The mark for the binders a wrapped form cannot write: however many
// arguments the script it hands back will want, pushed beneath it. It leads,
// because that is where they go -- the spender pushes them first and the
// revealed script rides on top.
const UNDER = '…';
const UNDER_SAID = 'however many arguments the revealed script wants, pushed beneath it — '
  + 'uncountable until the script is revealed, since the output committed only to its hash';

// The binders of one alternative, in the order the spender pushes them. Read
// off `runs`, which is what makes the … and the ( ) one claim rather than two.
const binderText = (alt) => (alt.runs ? `${UNDER} ` : '') + alt.brings.join(' ');

// The demand, written out. One walk of the clause list serves both renderings,
// so the marks on the page and the marks in a test can never be two different
// readings of one table.
//
// `msg` is what the signature is over: … where nothing names it, and the letter
// of a footnote where the page has fetched the preimage and can set the bytes a
// reader would hash. That is the whole reason the message is a mark and not a
// word -- a demand nobody can evaluate is a demand nobody can check.
const datumText = (t) => t.holes[0].name + toSuperscript(t.holes[0].bytes);
const UNSAID = '…';

// `runs`, given, stands in for the binder the demand names as the script that
// still has to run: the revealed term written out where `( t )` stood, which
// is the committed→revealed transition drawn as the reduction it is.
const demandText = (t, alt, msg = UNSAID, runs = null) => alt.demand.map((tok) => {
  if (tok === D) return datumText(t);
  if (tok === MSG) return `( ⌘ ${msg} )`;
  if (tok === RUN) return `( ${runs ?? alt.runs} )`;
  if (tok === AND) return '∧';
  if (tok === OPEN) return '(';
  if (tok === CLOSE) return ')';
  return typeof tok === 'number' ? glyph(tok) : tok;
}).join(' ').replace(/\( /g, '( ').replace(/ \)/g, ' )');

// ─── the title: the anonymous λ a script is ──────────────────────────────
//
// What a lock is called when nobody has called it anything. Every script on
// chain binds an abstraction over its own pushes, and that abstraction is
// derivable from the bytes with no reader, no shelf and no network -- so a
// paragraph is never nameless for want of somebody having spoken first.
//
//   λh. ⓪ h        a P2WPKH output
//   λp₁ p₂ p₃. ② p₁ p₂ p₃ ③ ◇     a bare multisig, which no address can carry
//
// Bare of everything a title does not need. No ⟦ ⟧: the brackets say "this is
// the wire's own bytes", and a title is not a quotation of them -- the script
// itself stands below, set as the passage it is. No application and no
// parentheses either: a title says what a thing IS, and (λh. ⓪ h) h²⁰ says
// what was DONE to it, which is rung one's business and not a name. And the
// binder stands bare, without the count its argument would give it, because
// what is being named is the abstraction rather than any one output that
// instantiates it -- every P2WPKH on chain shares this title, which is the
// whole use of a title.
//
// The demand rung is not this. It says what a spend must bring, which is a
// truer thing to know and a worse thing to be called by: two outputs of
// different shapes can want the same key material (P2PKH and P2WPKH ask
// alike), so the demand does not distinguish what a name has to distinguish.
export const titleText = (t) => `λ${t.holes.map((h) => h.name).join(' ')}. ${bodyText(t, false)}`;

export const titleHtml = (t) =>
  `${lam('λ')}${t.holes.map(dt).join(' ')}${lam('.')} ${bodyHtml(t, false)}`;

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
// Not a fragment: a λ of its own, over what a spend must bring -- and what it
// wants of them, which is a predicate a reader can evaluate rather than a
// script they would have to run. One line per alternative, since the lock is
// one script however many ways there are to satisfy it.
//
// The script itself is not on this line and does not need to be: it is set
// immediately below, quoted, under a citation of its own. That is what frees
// the line to state the demand instead of restating the bytes.
export const lockedText = (t, msg) => {
  const alts = demandsOf(t);
  return alts ? alts.map((alt) => `λ${binderText(alt)}. ${demandText(t, alt, msg)}`) : null;
};

// ─── rung three: the spend ───────────────────────────────────────────────
//
// Rung two applied: the abstraction in parentheses, and what a spend brings
// written after it. Exactly the form rung one takes, one rung down -- there the
// parenthesized term takes the address's own datum, here it takes the values an
// input carried. Not drawn on the address leaf, since an address has no spend
// yet, but it is the rung the two above are descending toward.
//
// The arguments stand as their names and not as values: the counts and the
// bytes arrive from the chain, and this module is the one that cannot ask.
// Rung one writes h²⁰ there because an address really does hold its datum.
export const spendText = (t, msg) => {
  const alts = demandsOf(t);
  return alts ? alts.map((alt) =>
    `(λ${binderText(alt)}. ${demandText(t, alt, msg)}) ${binderText(alt)}`) : null;
};

// ─── the same, as marks ──────────────────────────────────────────────────
//
// One distinction does the work: what the address already holds takes the
// gold, and what it is still waiting for does not. The same split the key's
// validator column keeps, and here it means a reader sees at a glance which
// half of a line is a fact and which is a demand.
const awaited = (name) => `<span class="aw">${escapeHtml(name)}</span>`;

// The … is awaited too -- a spend really does have to bring those -- so it takes
// the same ink as the names beside it rather than the calculus's quiet. It is
// the one mark on the line that names no single value, so what it stands for is
// in its hover, which is where this book keeps a claim it cannot set in type.
const under = () => `<span class="aw" title="${escapeHtml(UNDER_SAID)}">${UNDER}</span>`;
const binderMarks = (alt) => (alt.runs ? `${under()} ` : '') + alt.brings.map(awaited).join(' ');

// The demand as marks. The colours carry the reading, and they are the ones the
// whole leaf is styled by: gold for what the chain holds and for an operation
// that really runs, plain ink for what a spend has still to bring, and the
// quiet apparatus colour for the notation's own marks.
//
// The conjunction is the one that has to be got right. ∧ is OP_BOOLAND's glyph,
// and this book threw it off this very rung once for exactly that: a live
// opcode standing in for a connective, on a line that claimed to be a script.
// The claim is gone now -- the script is quoted below, and this line states a
// predicate -- so the mark can come back, and what keeps it honest is the ink.
// It takes the apparatus colour, never the gold, so on a leaf where gold means
// "the chain wrote this or this runs" the conjunction is visibly neither. A
// reader who wonders is told so in its hover.
const AND_SAID = 'and — the notation’s conjunction, joining two things a spend must make true. '
  + 'Not OP_BOOLAND, which shares its glyph but is set in gold';
const andMark = () => `<span class="lam" title="${escapeHtml(AND_SAID)}">∧</span>`;

const MSG_SAID = 'the message the signature is over — the transaction serialized as its sighash '
  + 'flag says, then hashed: twice through SHA-256 before taproot, once under BIP341’s tag from '
  + 'it on';
const UNSAID_SAID = 'not named — no spend has been reached, so there is no serialization to set';
const msgMark = (msg) => `${lam('(')} <span class="op" title="${escapeHtml(MSG_SAID)}">`
  + `${escapeHtml(glyph(0xaa))}</span> ${msg || `<span class="aw" title="${escapeHtml(UNSAID_SAID)}">${UNSAID}</span>`} ${lam(')')}`;

// The tweak has no opcode behind it -- no script performs it, consensus does --
// so it is named rather than glossed from the alphabet.
const TWEAK_SAID = 'the taptweak — the leaf hashed up its branch and added to the internal key. '
  + 'No opcode does this; consensus does it before a leaf may run';
const opMark = (tok) => (tok === TWEAK
  ? `<span class="op" title="${escapeHtml(TWEAK_SAID)}">${escapeHtml(TWEAK)}</span>`
  : op(tok));

const demandHtml = (t, alt, msg, ref = null, runs = null) => alt.demand.map((tok) => {
  if (tok === D) return datumMark(t.holes[0], ref);
  if (tok === MSG) return msgMark(msg);
  if (tok === RUN) return `${lam('(')} ${runs ?? awaited(alt.runs)} ${lam(')')}`;
  if (tok === AND) return andMark();
  if (tok === OPEN) return lam('(');
  if (tok === CLOSE) return lam(')');
  return typeof tok === 'number' || tok === TWEAK ? opMark(tok) : awaited(tok);
}).join(' ');

// `prose` is the argument's bytes said in the book's own tongue, and it lands
// where an address keeps its payload: after the term, behind the mark that
// gives its length. Withheld, the datum stays behind that mark -- the line is
// still the right shape, it simply cannot be read back.
export const addressHtml = (t, { prose = '', ref = null } = {}) =>
  `${lam('(λ')}${t.holes.map(dt).join(' ')}${lam('.')} ${bodyHtml(t, false)}${lam(')')} `
  + t.holes.map((h, i) => datumMark(h, i === 0 && t.holes.length === 1 ? ref : null)
    + (prose && i === 0 && t.holes.length === 1 ? ` ${prose}` : '')).join(' ');

// The second rung as marks: the binders, and then what they have to make true.
// Nothing of the caller's goes between them any more -- the line used to be
// split so a page could set the spelled script in the middle, and the script
// now has a quoted line of its own below.
export function lockedHtml(t, msg) {
  const alts = demandsOf(t);
  if (!alts) return null;
  return alts.map((alt) =>
    `${lam('λ')}${binderMarks(alt)}${lam('.')} ${demandHtml(t, alt, msg)}`);
}

// ─── which path a spend took ─────────────────────────────────────────────
//
// A term encodes every way its output can be opened; a spend quotes one. Rung
// two keeps them all, because they are all still true of the lock -- an unspent
// taproot output really can be opened either way -- and rung three shows the
// one the chain has a record of.
//
// Which one is read off the count of what was brought, not guessed. Taproot's
// rule is consensus's own: exactly one witness item is the key path, and
// anything else is a leaf and its proof. The wrapped forms generalize it -- an
// alternative that hands a script back takes at least its own binders and
// however many more that script wants, so it matches on `at least`, while an
// alternative that hands nothing back must match exactly.
export function pathTaken(t, items) {
  const alts = demandsOf(t);
  if (!alts || !Array.isArray(items) || !items.length) return null;
  const exact = alts.findIndex((alt) => !alt.runs && alt.brings.length === items.length);
  if (exact >= 0) return exact;
  let best = -1;
  alts.forEach((alt, i) => {
    if (!alt.runs || alt.brings.length > items.length) return;
    if (best < 0 || alt.brings.length > alts[best].brings.length) best = i;
  });
  return best < 0 ? null : best;
}

// The values a spend brought, named by the term rather than by their bytes.
// The binders align to the END of the list, because a wrapped form's script
// rides on top and its own arguments go underneath: w names the last item, and
// what stands before it is whatever that script wanted, which the term above
// never knew. Those leading values keep the book's ordinary reading of a push.
const SIG_MIN = 68, SIG_MAX = 73;
const suppliedLetter = (hex) => {
  const shaped = dataLetter(hex, null);
  if (shaped === 'p') return 'p';
  const n = hex.length / 2;
  // A DER signature, or a Schnorr one with or without its sighash byte.
  if ((hex.startsWith('30') && n >= SIG_MIN && n <= SIG_MAX) || n === 64 || n === 65) return 's';
  return shaped || 'd';
};

export function suppliedNames(alt, items) {
  const names = items.map(suppliedLetter);
  const from = items.length - alt.brings.length;
  alt.brings.forEach((name, i) => { if (from + i >= 0) names[from + i] = name; });
  return names;
}

// The third rung as marks. It is drawn only where the chain says it happened,
// because that is the only way anyone can know it: s and p are not in the
// address and no reduction reaches them, so the shape is all this page can
// write and the citation beside it is what supplies the rest.
//
// Rung two in parentheses with its arguments after it -- and, where the page
// has fetched the spend, with ⌘'s message named: the letter of the footnote
// holding the bytes a reader would hash to check the signature themselves.
export function spendHtml(t, msg) {
  const alts = demandsOf(t);
  if (!alts) return null;
  return alts.map((alt) => `${lam('(λ')}${binderMarks(alt)}${lam('.')} `
    + `${demandHtml(t, alt, msg)}${lam(')')} ${binderMarks(alt)}`);
}

// …and with the values in hand, the same rung written out: each one a mark, its
// byte count and — where an engine has said it — its prose, exactly as a push
// is set everywhere else in the book. This is the one line on the leaf whose
// content came from the chain rather than from the bytes in the box, and it is
// nothing else: the lock the arguments went into is the OUTPUT's bytes, set one
// rung up under a citation of its own. Writing them here put two transactions'
// worth of marks on a line attributed to one input, which is a quotation that
// quotes more than it was given. So the line stops where the input stops, and
// the application lives on spendMarks, which no citation covers.
//
// These values ARE the arguments spendMarks writes after its parentheses --
// the same names, with the counts and the prose the chain supplies. Two lines,
// one redex: the abstraction above, quoted values below.
//
// `brought` is the line pre-rendered by whoever has a better renderer -- the
// reader's own renderWitness, which reveals a witness script as opcodes, strips
// a DER signature to its compact form before saying it, and knows an annex from
// an argument. Given none, the values are named from the term instead and set
// as marks with their counts, which is all this module can do without reaching
// for the engine.
export function suppliedHtml(t, items, { say = null, brought = null } = {}) {
  const which = pathTaken(t, items);
  if (which === null) return null;
  const alt = demandsOf(t)[which];
  const names = suppliedNames(alt, items);
  // These take the gold. On the rungs above, a name in plain ink is something
  // no one has brought yet; here the chain has a record of it, cited on the
  // line below, so it is as much a fact as the lock a rung above.
  const own = () => items.map((hex, i) => {
    const prose = say ? say(hex) || '' : '';
    return `<span class="dt" title="${escapeHtml(TITLES[names[i][0]] ?? 'data')}">`
      + `${escapeHtml(names[i])}</span>`
      + `<span class="op op-push" title="a push of ${hex.length / 2} bytes">`
      + `${toSuperscript(hex.length / 2)}</span>${prose ? ` ${prose}` : ''}`;
  }).join(' ');
  return { which, html: brought ?? own() };
}

// ─── the revealed script, and the title it gives a quotation ─────────────
//
// A wrapped form's lock ends in ( r ): a requirement hidden behind a hash,
// which the address could name and never write. The spend is where it stops
// being hidden -- the input disclosed the script itself -- and the spend
// quotation's title is that script read as the term it is (see CLAUDE.md,
// "Search page"). The lock quotation needs no counterpart: its title is the
// demand rung two derives from the address alone, already standing above it,
// and for a keyhash or visible type the two coincide because nothing was ever
// hidden to reveal.
//
// Which bytes were revealed is read the way the arguments are: by consensus's
// own placement, never by shape. P2WSH's script is the last witness item and a
// tapscript leaf rides just under its control block -- the binder named by
// `runs`, aligned to the end of the list exactly as suppliedNames aligns it.
// P2SH is the one form whose script does not ride with the arguments counted:
// its redeem script is the scriptSig's last push, and when the program it
// wraps is a witness program the arguments move to the stack while the redeem
// script stays behind in the scriptSig -- so it is read from the scriptSig or
// not at all, and a wrapped spend's witness items are never mistaken for it.
//
// No hash is re-taken here, and none is needed: the reveal is only ever read
// off a spend the chain confirmed, cited on the line below it, and consensus
// checked the script against the committed hash before that spend was allowed
// to exist. Witness-and-check -- the citation is the verification.
export function revealedOf(t, items, { scriptsig = null } = {}) {
  const which = pathTaken(t, items);
  if (which === null) return null;
  const alt = demandsOf(t)[which];
  if (!alt.runs) return null;                        // nothing was hidden: no reveal
  if (t.id === 'p2sh') {
    if (!scriptsig) return null;
    try {
      const pushes = tokenizeScript(scriptsig).filter((tk) => tk.push !== undefined);
      return pushes.length ? pushes[pushes.length - 1].push.toLowerCase() : null;
    } catch { return null; }
  }
  const at = items.length - alt.brings.length + alt.brings.indexOf(alt.runs);
  return at >= 0 && at < items.length ? String(items[at]).toLowerCase() : null;
}

// The title itself, and there are two kinds of reveal because there are two
// kinds of thing an output can hide.
//
// A script-hash form hides a SCRIPT, and the spend hands over its bytes -- so
// the title is that script's own title, the anonymous λ it binds, exactly as
// the lock a rung up is titled by its own. A P2SH wrapping a witness program
// is titled `λh. ⓪ h` there, which is the title that program would carry
// anywhere else, because it is the same script wherever it stands.
//
// Everything else hid a VALUE, or hid nothing at all, and either way there is
// no script to read -- so the title is the demand with its commitment
// discharged: the key is on the page now, the hash clause is a question
// already answered, and what the spend turned out to be is the signature over
// the message. `msg` is the footnote's letter where the page has one, which is
// the whole point of naming it here: a title a reader can check, and the only
// place ⌘ is written once the rungs that used to carry it are gone.
//
// A reveal that does not tokenize -- a leaf full of opcodes the alphabet has
// no mark for, a script with no push to bind -- titles nothing: the page knows
// the bytes and does not know what they are, and the quotation still stands.
const revealedTerm = (t, items, opts) => {
  const r = revealedOf(t, items, opts);
  return r ? termOfScript(r) : null;
};

// One walk for both renderings, as everywhere else in this module: the marks
// on the page and the marks in a test can never be two different readings.
// A reveal whose alternative also brings a control block is the one place a
// title of the script alone leaves a witness item unaccounted for: the block
// is what proves this script belongs to the output, and it is neither in the
// script nor anywhere else on the card. So that alternative composes -- the
// revealed term substituted into the demand's own `( t )`, which writes the
// proof and the payload as one statement and is the committed→revealed
// transition drawn as a reduction. The `…` goes with it: the arguments it
// stood for are the revealed term's own binders, and they are written now.
//
// Everything else keeps the script's own title. A P2SH or a P2WSH reveal hands
// over bytes and nothing more -- there is no third item to account for -- and
// a composed line there would restate a hash clause above a passage that is
// simply the script somebody wrote.
const CONTROL = 'c';
const revealed = (t, items, opts, write) => {
  const which = pathTaken(t, items);
  if (which === null) return null;
  const alt = demandsOf(t)[which];
  if (alt.runs) {
    const tr = revealedTerm(t, items, opts);
    if (!tr) return null;
    return [alt.brings.includes(CONTROL) ? write.reduced(alt, tr) : write.title(tr)];
  }
  return alt.shown ? [write.shown(alt)] : null;
};

export const revealedText = (t, items, opts = {}) => revealed(t, items, opts, {
  title: (tr) => titleText(tr),
  reduced: (alt, tr) => `λ${alt.brings.join(' ')}. `
    + `${demandText(t, alt, opts.msg ?? UNSAID, titleText(tr))}`,
  shown: (alt) => `λ${alt.brings.join(' ')}. `
    + `${demandText(t, { ...alt, demand: alt.shown }, opts.msg ?? UNSAID)}`,
});

// `ref` reaches the datum and nothing else, which is the distinction the token
// list already draws: D is the value the OUTPUT carries, and every other name
// on the line is something this spend brought and the passage below quotes. So
// the one mark that refers to another passage is the one that gets a road to
// it, and the marks a reader can see the bytes of right here do not.
export const revealedHtml = (t, items, opts = {}) => revealed(t, items, opts, {
  title: (tr) => titleHtml(tr),
  reduced: (alt, tr) => `${lam('λ')}${alt.brings.map(awaited).join(' ')}${lam('.')} `
    + `${demandHtml(t, alt, opts.msg ?? null, opts.ref ?? null, titleHtml(tr))}`,
  shown: (alt) => `${lam('λ')}${alt.brings.map(awaited).join(' ')}${lam('.')} `
    + `${demandHtml(t, { ...alt, demand: alt.shown }, opts.msg ?? null, opts.ref ?? null)}`,
});

// ─── the commitment, and whether it holds ────────────────────────────────
//
// The one claim on a search card that spans both passages, and the only one a
// reader can settle by hand with both in view: the value this spend revealed
// hashes to the datum that output published. `p` is quoted in the spend's own
// passage; `h²⁰` is written in the lock's, a section above. Take one hash and
// compare, and the two quotations are demonstrably about one coin.
//
// It used to be stated, as a clause of the demand, and stating it was the
// weaker thing to do -- a demand describes what a spender must make true,
// which is a claim about a future, while this is a fact about a spend that
// happened and the page holds both halves of it. So the page takes the hash
// itself and marks the result: witness-and-check, which is the model the whole
// notation rests on (see CLAUDE.md) and the same model Bitcoin uses.
//
// This module says WHAT to hash and against what; it does not hash. There is
// no digest here and there could not be -- ripemd160 is not in any browser and
// SHA-256 is async -- so the caller takes it, and this stays the light,
// synchronous, engine-free module a page can draw a term with.
//
// Null where nothing was committed to. P2PK and taproot's key path publish
// their key outright, so there is no preimage to reveal and nothing to check.
// Taproot's script path IS a commitment, and a hash alone will not settle it:
// the tweak adds a point to the internal key, which is elliptic-curve
// arithmetic and not a digest. Declining beats guessing, so it declines.
const COMMITS = { p2pkh: OP_HASH160, p2wpkh: OP_HASH160, p2sh: OP_HASH160, p2wsh: OP_SHA256 };

export function commitmentOf(t, items, { scriptsig = null } = {}) {
  const op = COMMITS[t.id];
  if (!op || !t.holes.length) return null;
  const which = pathTaken(t, items);
  if (which === null) return null;
  const alt = demandsOf(t)[which];
  // A script-hash form committed to a script, and the spend handed it over; a
  // keyhash form committed to a key, which stands among the values it brought.
  // Either way the thing hashed is read by consensus's own placement, never by
  // shape -- the same reading `revealedOf` and `suppliedNames` already make.
  const of = alt.runs ? revealedOf(t, items, { scriptsig })
    : items[suppliedNames(alt, items).indexOf('p')] ?? null;
  const name = alt.runs ?? 'p';
  if (!of) return null;
  return { op, of, name, hole: t.holes[0], against: t.holes[0].argument };
}

// The check, written out: the operation, what it is taken over, and the datum
// it must equal. The same marks the demand's own clause used, because it is
// the same claim -- only now it is one the page has carried out rather than
// one it is passing on.
export const commitmentText = (c) =>
  `${glyph(c.op)} ${c.name} ${glyph(OP_EQUALVERIFY)} ${datumText({ holes: [c.hole] })}`;

export const commitmentHtml = (c, { ref = null } = {}) =>
  `${op(c.op)} ${awaited(c.name)} ${op(OP_EQUALVERIFY)} ${datumMark(c.hole, ref)}`;

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
    if (code !== null) return typeof code === 'object' ? code.mark : glyph(code);
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
// A constant of a form: bytes the chain wrote and the format fixes, so it takes
// the gold every written byte takes rather than a binder's ink. It is not a
// hole -- two inscriptions differ in nothing here -- so nothing binds it.
const lit = (c) => `<span class="op" title="${escapeHtml(c.said)}">${escapeHtml(c.mark)}</span>`;
const count = (hole) => `<span class="op op-push op-count" title="OP_PUSHBYTES_${hole.bytes} — push the next ${hole.bytes} bytes">${toSuperscript(hole.bytes)}</span>`;

// The datum with its count, and -- where a caller has found the passage that
// holds it -- pointing at it. The same move ⌘ makes: a mark stops being a
// promise about bytes somewhere and becomes bytes a reader can go and read.
//
// The mark is not REPLACED by the reference, and cannot be. A citation names
// an output, which is the whole script -- the reduced form, `⓪ h²⁰` -- so
// writing it where the argument stands would say the term was applied to its
// own result. It would also throw away the two things the mark is for: which
// kind of datum this is, and how many bytes of it. So the reference goes
// behind the mark, as a link and a hover, and the attribution below the
// passage stays the one place it is set in type.
//
// `ref` is { href, said }, built by whoever asked the chain -- this module
// does not know what a citation is, exactly as it does not know what prose is.
const datumMark = (hole, ref) => {
  const mark = dt(hole) + count(hole);
  return ref ? `<a class="term-ref" href="${escapeHtml(ref.href)}" `
    + `title="${escapeHtml(ref.said)}">${mark}</a>` : mark;
};

const bodyHtml = (t, counted, prose) => {
  let next = 0;
  return t.body.map((code) => {
    if (code !== null) return typeof code === 'object' ? lit(code) : op(code);
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
