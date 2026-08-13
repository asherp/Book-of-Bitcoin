// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/term.test.mjs — a lock as a term, and the one claim that rests on it.
//
//   node --test tools/term.test.mjs
//
// The notation key asserts two things in prose. Scripts as terms says that
// reducing a lock's term gives the scriptPubKey the chain holds; Addresses says
// an address carries that term's argument and a tag naming the term. Both are
// checkable, and this file checks them rather than believing the tables: a term
// is built from an address, reduced, and the bytes compared against what the
// address really decodes to.
//
// The second half pins the module to the key. btc-term.js and the terms table
// draw the same terms in the same marks, from two hand-written sources -- so
// they are compared character for character, and a change to either that the
// other did not follow fails here rather than reaching a reader as two books
// disagreeing about what P2SH is.

import test from 'node:test';
import assert from 'node:assert/strict';

import { addressScriptHex } from '../web/btc-index.js';
import { NOTATION_HTML } from '../web/btc-notation.js';
import { OPCODE_SYMBOLS, OPCODE_NAMES, toSuperscript } from '../web/btc-sigla.js';
import { TERMS, termOfScript, addressable, reduce, spendMarks, pathTaken, suppliedNames, suppliedHtml, abstractionText, applicationText, normalFormText,
         pureForm, reducePure, pureText, pureApplicationText,
         lockText, lockApplicationText, demandsOf, addressText, addressHtml,
         lockedText, lockedHtml, lockedMarks, spendText } from '../web/btc-term.js';

// One address of every form that has one, which is every row of the key's
// Addresses group: the book's own Ross Ulbricht ledger, a P2SH, and the BIP173
// and BIP350 witness vectors.
const ADDRESSES = [
  ['p2pkh',  '1Ross5Np5doy4ajF9iGXzgKaC2Q3Pwwxv'],
  ['p2sh',   '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy'],
  ['p2wpkh', 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4'],
  ['p2wsh',  'bc1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3qccfmv3'],
  ['p2tr',   'bc1p5d7rjq7g6rdk2yhzks9smlaqtedr4dekq08ge8ztwac72sfr9rusxg3297'],
];

test('every address form binds its term, and β gives back the script', () => {
  for (const [id, address] of ADDRESSES) {
    const script = addressScriptHex(address);
    assert.ok(script, `${address} does not decode`);
    const t = termOfScript(script);
    assert.ok(t, `${address} binds no term`);
    assert.equal(t.id, id, address);
    // The claim: the term applied to the datum the address carries reduces to
    // the very bytes the address decodes to. Nothing about the string survives
    // the reduction -- base58 or bech32, the normal form is the same kind of
    // thing -- which is why the book prints this and not that.
    assert.equal(reduce(t, t.argument), script, `${id} does not reduce to its script`);
  }
});

test('the argument is the datum the address carries, and nothing else', () => {
  // BIP173's own vector: the witness program is the whole of what bc1qw508… has
  // to say, and it is exactly what lands under the binder.
  const t = termOfScript(addressScriptHex('bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4'));
  assert.equal(t.argument, '751e76e8199196d454941c45d1b3a323f1433bd6');
  assert.equal(t.bytes, 20);
  assert.equal(t.binder, 'h');
  assert.equal(applicationText(t), '(λh. ⟦ ⓪ h ⟧) h²⁰');
  assert.equal(normalFormText(t), '⟦ ⓪ h²⁰ ⟧');
  // Taproot's argument is an output key rather than a hash, and takes the
  // letter the book's own renderer would give the same push.
  const tr = termOfScript(addressScriptHex('bc1p5d7rjq7g6rdk2yhzks9smlaqtedr4dekq08ge8ztwac72sfr9rusxg3297'));
  assert.equal(tr.binder, 'p');
  assert.equal(applicationText(tr), '(λp. ⟦ ① p ⟧) p³²');
});

test('a term is read off the script, however many holes it has', () => {
  const P = (n) => n.toString(16).padStart(2, '0') + 'ab'.repeat(n);
  // A compressed key, shaped like one: the letter a push gets is the book's own
  // reading of its bytes, so a test that fed it filler would be asking the
  // renderer to guess.
  const K = () => '21' + '02' + 'ab'.repeat(32);
  // Bare multisig binds, and binds three keys -- the key's own terms table has
  // always had a multisig row, and refusing it here made the module disagree
  // with the book. What multisig has no business being is an ADDRESS, and that
  // is a different predicate: one hole, not one term.
  const ms = termOfScript('52' + K() + K() + K() + '53ae');
  assert.equal(ms.holes.length, 3, 'three keys, three binders');
  assert.deepEqual(ms.holes.map((h) => h.name), ['p₁', 'p₂', 'p₃'], 'a repeated letter is numbered');
  assert.equal(addressText(ms), '(λp₁ p₂ p₃. ② p₁ p₂ p₃ ③ ◇) p₁³³ p₂³³ p₃³³');
  assert.equal(addressable(ms), false, 'no address could carry three arguments');
  // …and it reduces back, which is the whole warrant for reading a term off
  // bytes rather than looking one up.
  assert.equal(reduce(ms, ms.holes.map((h) => h.argument)), ms.script);
  // A data output binds its blob. Its letter is d: neither a hash nor a key.
  const data = termOfScript('6a' + P(8));
  assert.equal(addressText(data), '(λd. ¶ d) d⁸');
  assert.equal(addressable(data), true, 'one hole, though no address form takes it');
  // A well-formed script the classifier does not know binds all the same: the
  // term is read off the bytes, so recognition is not what makes one. What it
  // lacks is a name, and it says so by having no id.
  const odd = termOfScript('76a914' + 'ab'.repeat(20));
  assert.equal(odd.id, null, 'no template claims these bytes');
  assert.equal(addressText(odd), '(λh. ⧉ ⌖ h) h²⁰');
  assert.equal(reduce(odd, odd.argument), odd.script);
  assert.equal(lockedText(odd), null, 'and nothing is written down about what it awaits');
  // What is still refused is what cannot be read at all.
  assert.equal(termOfScript(''), null);
  assert.equal(termOfScript('76a914' + 'ab'.repeat(19)), null, 'a truncated push is not a term');
  assert.equal(termOfScript('deadbeef'), null, 'nor bytes consensus never defined');
  assert.equal(termOfScript('76a988ac'), null, 'nor a script with nothing to abstract over');
});

test('every address is one hole, and that is what makes it one', () => {
  for (const [, address] of ADDRESSES) {
    const t = termOfScript(addressScriptHex(address));
    assert.equal(t.holes.length, 1, address);
    assert.ok(addressable(t), address);
    // The derived letter is the tabled one: both read the same bytes.
    assert.equal(t.binder, TERMS[t.id].binder, `${address}'s binder`);
  }
});

test('a bare key is a term too, and the reason it has no address is not that', () => {
  // P2PK takes one argument of fixed length like the rest; what it never got
  // was a version byte. So it binds and reduces here, and simply has no row in
  // the key's Addresses group.
  const key = '04' + 'ab'.repeat(64);
  const t = termOfScript(reduce(TERMS.p2pk, key));
  assert.equal(t.id, 'p2pk');
  assert.equal(t.argument, key);
  assert.equal(abstractionText(t), 'λp. ⟦ p ∇ ⟧');
  assert.equal(normalFormText(t), '⟦ p⁶⁵ ∇ ⟧');
});

// ─── the pure form ───────────────────────────────────────────────────────

test('the pure form reduces to the same script, through its own names', () => {
  for (const [id, address] of ADDRESSES) {
    const script = addressScriptHex(address);
    const pure = pureForm(termOfScript(script));
    // Substituted back through the binders the form is written with -- so a
    // body naming something the λ never bound fails here, rather than merely
    // reading oddly on the page.
    assert.equal(reducePure(pure), script, `${id} does not reduce purely`);
    // Opcodes, then the push as a pair: its length, then the datum. Every
    // constant is an argument now, so the arity is fixed by the body alone.
    assert.equal(pure.binders.length, pure.opcodes.length + 2, `${id}'s arity`);
    assert.deepEqual(pure.binders.slice(-2), [pure.lenName, pure.datumName],
      `${id} does not end on its push, length first`);
    // The body spends every binder: the opcode names stand where their marks
    // will, and the hole is the other two written as one mark -- the datum with
    // its count on its shoulder, which is how the book writes a push and how
    // the wire prints one.
    assert.equal(pure.body.filter((n) => n === pure.hole).length, 1, `${id}'s push`);
    assert.equal(pure.hole, pure.datumName + 'ⁿ', `${id}'s push mark`);
    for (const name of pure.binders.slice(0, -2)) {
      assert.ok(pure.body.includes(name), `${id} never uses ${name}`);
    }
  }
});

test('the length is an argument, and the pair is checked against itself', () => {
  const pure = pureForm(termOfScript(addressScriptHex('bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4')));
  assert.equal(pureText(pure), 'λo₁ n h. ⟦ o₁ hⁿ ⟧');
  // The argument list is the wire's own order: the count, then the bytes it
  // measures. On chain a direct push opcode IS its count, so 14 <20 bytes>
  // and 20 h are the same statement.
  assert.equal(pureApplicationText(pure), '(λo₁ n h. ⟦ o₁ hⁿ ⟧) ⓪ 20 h');
  assert.equal(lockApplicationText(pure), '(λn h. ⟦ ⓪ hⁿ ⟧) 20 h');
  // n reaches the push, rather than the reduction quietly measuring the datum
  // for itself: a length that does not match the bytes beside it spells no
  // script at all.
  assert.equal(reducePure({ ...pure, bytes: 19 }), null, 'a mismatched pair should not reduce');
  assert.equal(reducePure({ ...pure, bytes: 0 }), null);
  const p2pkh = pureForm(termOfScript(addressScriptHex('1Ross5Np5doy4ajF9iGXzgKaC2Q3Pwwxv')));
  assert.equal(pureApplicationText(p2pkh), '(λo₁ o₂ o₃ o₄ n h. ⟦ o₁ o₂ hⁿ o₃ o₄ ⟧) ⧉ ⌖ ≡ ∇ 20 h');
});

test('the witness forms are one term, and only their arguments differ', () => {
  // The Addresses group says this in prose. With the length abstracted it is no
  // longer a resemblance to be argued for, nor even a shape that matches once
  // the type is forgotten: the three terms are α-equivalent outright -- rename
  // the datum's binder and they are the same string -- and everything that
  // distinguishes P2WPKH from P2WSH from P2TR has moved into the arguments,
  // the byte count among them.
  const alpha = (address) => {
    const pure = pureForm(termOfScript(addressScriptHex(address)));
    return pureText(pure).split(pure.datumName).join('x');
  };
  const args = (address) => {
    const pure = pureForm(termOfScript(addressScriptHex(address)));
    return `${pure.opcodes.map((c) => c.toString(16)).join(' ')} ${pure.bytes}`;
  };
  const witness = ['bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4',
    'bc1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3qccfmv3',
    'bc1p5d7rjq7g6rdk2yhzks9smlaqtedr4dekq08ge8ztwac72sfr9rusxg3297'];
  assert.deepEqual(witness.map(alpha), Array(3).fill('λo₁ n x. ⟦ o₁ xⁿ ⟧'));
  assert.deepEqual(witness.map(args), ['0 20', '0 32', '51 32'], 'all three differ, and only here');
  // The legacy pair do not join them: a different body apiece, and neither is
  // the witness body. Which is what segwit's one term was the answer to.
  const legacy = ['1Ross5Np5doy4ajF9iGXzgKaC2Q3Pwwxv', '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy'].map(alpha);
  assert.deepEqual(legacy, ['λo₁ o₂ o₃ o₄ n x. ⟦ o₁ o₂ xⁿ o₃ o₄ ⟧', 'λo₁ o₂ n x. ⟦ o₁ xⁿ o₂ ⟧']);
  assert.equal(new Set([...witness.map(alpha), ...legacy]).size, 3);
});

test('bare hex is a lock when the bytes settle it, and otherwise is not', () => {
  // The recognizer the search box injects: hex that binds a term is a locking
  // script and can be nothing else, so a reader pastes bytes and gets a term.
  // What makes that safe is arithmetic rather than optimism -- the shortest
  // term is 23 bytes and none is the 32 a transaction id takes, so no term's
  // bytes can be read as an id, and none is short enough to pass for a height.
  const isLockingScript = (h) => /^(?:[0-9a-fA-F]{2})+$/.test(h) && termOfScript(h.toLowerCase()) !== null;
  for (const [, address] of ADDRESSES) {
    const script = addressScriptHex(address);
    assert.ok(isLockingScript(script), `${script} should be read as a lock`);
    assert.notEqual(script.length, 64, 'no term may be as long as a transaction id');
    assert.ok(/[a-f]/i.test(script), 'nor spell a height');
  }
  // And the forms it must never take from the rest of the grammar.
  for (const q of ['0', '57043', '-1', 'a'.repeat(64), '0'.repeat(64), 'III β2 ■5',
    'v1b29c596s85', '1Ross5Np5doy4ajF9iGXzgKaC2Q3Pwwxv', 'script:76a90088ac', 'deadbeef', '']) {
    assert.equal(isLockingScript(q), false, `${q} should not be read as a lock`);
  }
  // A nonstandard lock binds no term, so it settles nothing by itself and keeps
  // the script: prefix -- which is exactly what the prefix is for.
  assert.equal(isLockingScript('76a90088ac'), false, 'a malformed lock needs the prefix');
});

// ─── the ladder: address, lock, spend ────────────────────────────────────

test('an address is its term with one argument supplied', () => {
  const of = (address) => addressText(termOfScript(addressScriptHex(address)));
  // Rung one. The λ takes the image the address carries -- one argument, and
  // the only one an address has -- and what follows the term is that image:
  // the half of a base58 or bech32 string that is entropy rather than tag.
  assert.equal(of('1Ross5Np5doy4ajF9iGXzgKaC2Q3Pwwxv'), '(λh. ⧉ ⌖ h ≡ ∇) h²⁰');
  assert.equal(of('bc1p5d7rjq7g6rdk2yhzks9smlaqtedr4dekq08ge8ztwac72sfr9rusxg3297'),
    '(λp. ① p) p³²');
  assert.equal(addressText(termOfScript(reduce(TERMS.p2pk, '04' + 'ab'.repeat(64)))),
    '(λp. p ∇) p⁶⁵');
  // One argument on every rung-one line, whatever the term: that is what makes
  // an address an address, and it is why multisig has none.
  for (const [, address] of ADDRESSES) {
    const t = termOfScript(addressScriptHex(address));
    assert.equal(addressText(t).split(') ')[1], t.binder + toSuperscript(t.bytes), address);
  }
});

test('what the address hands back is another λ, not a fragment', () => {
  // Rung two, and the claim the two-paragraph leaf rests on: applying the
  // datum does not leave a piece of syntax, it leaves the scriptPubKey -- which
  // is itself a function of what a spend will bring.
  const of = (address) => lockedText(termOfScript(addressScriptHex(address)));
  assert.deepEqual(of('1Ross5Np5doy4ajF9iGXzgKaC2Q3Pwwxv'), ['λs p. ⧉ ⌖ h²⁰ ≡ ∇']);
  assert.deepEqual(of('bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4'), ['λs p. ⓪ h²⁰']);
  // An output with two ways to open it is one lock and two λ over it. Both end
  // on something run: a leaf the spender reveals, or the check consensus makes
  // itself where no script is revealed at all.
  assert.deepEqual(of('bc1p5d7rjq7g6rdk2yhzks9smlaqtedr4dekq08ge8ztwac72sfr9rusxg3297'),
    ['λs. ① p³² ( ∇ )', 'λ… t c. ① p³² ( t )']);
  // Every rung-two line is the rung above it with the argument gone in: the
  // body is the same marks, and only the datum's count has arrived.
  for (const [, address] of ADDRESSES) {
    const t = termOfScript(addressScriptHex(address));
    const script = addressScriptHex(address);
    assert.equal(reduce(t, t.argument), script, address);
    for (const line of lockedText(t)) {
      assert.ok(line.includes(bodyOf(t, true)), `${address}: rung two is not the lock`);
    }
  }
});

test('the rung below the wire is the spend, and it is rung two applied', () => {
  // Rung three, which the address leaf does not draw -- an address has no spend
  // yet. Written as every application in this book is written: the abstraction
  // in parentheses, and what goes into it after. Not a mark of its own. ⧺ stood
  // here once, OP_CAT's glyph, on the reading that concatenation is application
  // on a concatenative machine -- an opcode doing a calculus's work, on a line
  // already written in the calculus, beside parentheses that had meant exactly
  // this two rungs up.
  assert.deepEqual(spendText(termOfScript(addressScriptHex('1Ross5Np5doy4ajF9iGXzgKaC2Q3Pwwxv'))),
    ['(λs p. ⧉ ⌖ h²⁰ ≡ ∇) s p']);
  assert.deepEqual(spendText(termOfScript(addressScriptHex('3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy'))),
    ['(λ… r. ⌖ h²⁰ = ( r )) … r']);
  // The abstraction inside the parentheses is rung two, mark for mark: applying
  // a term is not rewriting it, and a rung that drifted from the one above
  // would be a different lock claiming to be this one.
  for (const [, address] of ADDRESSES) {
    const t = termOfScript(addressScriptHex(address));
    lockedText(t).forEach((line, i) => {
      assert.ok(spendText(t)[i].startsWith(`(${line})`), `${address}: rung three left rung two behind`);
    });
  }
  // The wire's order is not lost with the joint: it never lived there. λ… r.
  // says which push comes first, and the values a spend rung quotes beneath are
  // in that same order.
  for (const line of spendText(termOfScript(addressScriptHex('3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy')))) {
    assert.match(line, /^\(λ… r\./, 'the uncounted arguments are still pushed first');
  }
});

test('the spend rung is marks and a citation, because it cannot be computed', () => {
  // The one rung whose content no page can derive: s and p are not in the
  // address and no reduction reaches them. So the marks say the shape and the
  // citation beside them says where to read what was actually brought -- which
  // is why the leaf draws this rung only when the chain reports a spend.
  const strip = (html) => html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  const t = termOfScript(addressScriptHex('1Ross5Np5doy4ajF9iGXzgKaC2Q3Pwwxv'));
  const [m] = spendMarks(t);
  assert.equal(strip(`${m.prefix} X${m.suffix}`), '(λs p. X) s p');
  // The application's parentheses are apparatus, not bytes: they never take the
  // gold, which is the rule the whole leaf is styled by.
  assert.match(m.prefix, /class="lam">\(λ/);
  assert.match(m.suffix, /class="lam">\)/);
  // A wrapped form carries its eval step into the suffix too, inside the close:
  // what the lock hands back is part of the function, not part of the argument.
  const [sh] = spendMarks(termOfScript(addressScriptHex('3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy')));
  assert.equal(strip(`${sh.prefix} X${sh.suffix}`), '(λ… r. X ( r )) … r');
  // Taproot has two, and a spend took one: the leaf draws the alternative
  // pathTaken names and no other, because which path was taken is in the
  // witness and guessing is the thing this page exists not to do.
  const [key, script] = spendMarks(termOfScript(addressScriptHex(
    'bc1p5d7rjq7g6rdk2yhzks9smlaqtedr4dekq08ge8ztwac72sfr9rusxg3297')));
  assert.equal(strip(`${key.prefix} X${key.suffix}`), '(λs. X ( ∇ )) s');
  assert.equal(strip(`${script.prefix} X${script.suffix}`), '(λ… t c. X ( t )) … t c');
  // A term with nothing written down about what it awaits has no rung three.
  assert.equal(spendMarks(termOfScript('76a914' + 'ab'.repeat(20))), null);
});

test('what a key-path spend runs is consensus’s own, and the term says so', () => {
  // The one operation on any of these lines that is not a byte in the output.
  // A key-path taproot spend runs no script at all -- consensus verifies the
  // witness's single item against the output key as if by OP_CHECKSIG -- so ∇
  // is nowhere in ⟦ ① p³² ⟧ and no reduction could ever put it there. Without
  // it the key path's term said a lock wanted a signature and never said what
  // became of it: a demand with no verdict.
  const tr = termOfScript(addressScriptHex(TR));
  const [key, script] = demandsOf(tr);
  assert.equal(key.checks, 0xac, 'the key path is checked, not run');
  assert.equal(OPCODE_NAMES[key.checks], 'OP_CHECKSIG');
  assert.equal(key.runs, null, 'and reveals no script to run');
  assert.equal(script.checks, null, 'the script path runs a leaf instead');
  // It rides in the same ( ) a revealed script does, because the reader's
  // question is the same one: after the marks the chain holds, what runs?
  assert.match(lockedText(tr)[0], / \( ∇ \)$/);
  // …and it stays inside the application's own parentheses on rung three: what
  // the lock hands back is part of the function, not part of the argument.
  assert.match(spendText(tr)[0], / \( ∇ \)\) s$/);
  // …and it brings no ellipsis with it. … is the notation admitting binders it
  // cannot write, and this alternative can write them: one signature, named.
  assert.ok(!lockedText(tr)[0].includes('…'), 'the key path counts its argument');
  // Marked as an operation, not as apparatus: the check really happens. What
  // makes it implicit is that it stands outside the marks the chain holds.
  const [m] = lockedMarks(tr);
  assert.match(m.suffix, /class="op"[^>]*OP_CHECKSIG[^>]*>∇/);
  assert.match(m.suffix, /class="lam">\(/, 'the eval step is still apparatus');
  // Every other tabled form does its own checking, in bytes of its own.
  for (const id of Object.keys(TERMS)) {
    if (id === 'p2tr') continue;
    const bytes = TERMS[id].bytes ?? 65;
    const t = termOfScript(reduce(TERMS[id], 'ab'.repeat(bytes)));
    for (const alt of demandsOf(t)) assert.equal(alt.checks, null, id);
  }
});

test('no rung writes an opcode the lock does not own', () => {
  // The bug the ladder was written to close. A demand set as a predicate needs
  // a conjunction between its clauses, and the mark that printed was ∧ --
  // OP_BOOLAND, which is not disabled at all: a live opcode that pops two
  // numbers, standing on a line that claimed to reduce to a script. The same
  // failure took a second scalp on rung three, where ⧺ stood for application:
  // OP_CAT is disabled, so nothing could run, but an opcode was still doing a
  // calculus's work on a line written in the calculus. Parentheses do it now,
  // and they are apparatus rather than an instruction.
  //
  // So one exception is left, and it is declared rather than assumed: the
  // opcode an alternative names as consensus's own, which is true of a spend
  // without being a byte of the output. Each line is checked against what ITS
  // alternative declares, so rung one can never carry one and neither can a
  // sibling path.
  const CAT = OPCODE_SYMBOLS[0x7e];
  assert.equal(OPCODE_NAMES[0x7e], 'OP_CAT');
  for (const id of Object.keys(TERMS)) {
    const bytes = TERMS[id].bytes ?? 65;
    const t = termOfScript(reduce(TERMS[id], 'ab'.repeat(bytes)));
    const own = t.body.filter((c) => c !== null).map((c) => OPCODE_SYMBOLS[c]);
    // Every rung this time, rung three included: there is no longer a line with
    // a licence to write an opcode of its own.
    const checks = demandsOf(t).map((alt) => alt.checks);
    const rungs = [[addressText(t), null],
      ...lockedText(t).map((line, i) => [line, checks[i]]),
      ...spendText(t).map((line, i) => [line, checks[i]])];
    for (const [line, check] of rungs) {
      assert.ok(!line.includes(CAT), `${id} still joins with an opcode on this rung`);
      const allowed = new Set(check === null ? own : [...own, OPCODE_SYMBOLS[check]]);
      for (const [code, glyph] of Object.entries(OPCODE_SYMBOLS)) {
        if (allowed.has(glyph)) continue;
        assert.ok(!line.includes(glyph),
          `${id} writes ${glyph} (${OPCODE_NAMES[code]}), which its lock never does`);
      }
    }
  }
});

// The lock body as the rungs write it, from the term's own opcodes: bare on
// rung one, where the count has not arrived, and counted below that.
const bodyOf = (t, counted) => t.body
  .map((code) => (code === null ? t.binder + (counted ? toSuperscript(t.bytes) : '')
    : OPCODE_SYMBOLS[code])).join(' ');

test('P2PKH and P2WPKH ask for the same key material', () => {
  // The committed-datum reading makes these different objects. Read as demands
  // they want the same two things in the same order: segwit moved where a
  // witness rides, not what is asked for.
  const brings = (address) => demandsOf(termOfScript(addressScriptHex(address)))
    .map((alt) => alt.brings.join(' '));
  assert.deepEqual(brings('1Ross5Np5doy4ajF9iGXzgKaC2Q3Pwwxv'), ['s p']);
  assert.deepEqual(brings('1Ross5Np5doy4ajF9iGXzgKaC2Q3Pwwxv'),
    brings('bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4'));
  // …and the locks that key material rides against are not the same script at
  // all, which is the other half of the point: one demand, two wires.
  assert.notEqual(addressScriptHex('1Ross5Np5doy4ajF9iGXzgKaC2Q3Pwwxv'),
    addressScriptHex('bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4'));
  assert.notDeepEqual(lockedText(termOfScript(addressScriptHex('1Ross5Np5doy4ajF9iGXzgKaC2Q3Pwwxv'))),
    lockedText(termOfScript(addressScriptHex('bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4'))));
});

test('the wrapped forms cannot say what they will ask for', () => {
  // P2SH, P2WSH and taproot's script path all end on a function they hand back
  // rather than on a value: ( r ) awaits arguments of its own, and how many is
  // a property of a script the address has never seen. That is the whole of
  // "cannot say" -- an unapplied function is already unable to promise an
  // arity, so nothing needs to stand in for the missing binders.
  for (const [address, expected] of [
    ['3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy', ['λ… r. ⌖ h²⁰ = ( r )']],
    ['bc1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3qccfmv3', ['λ… w. ⓪ h³² ( w )']],
  ]) {
    const t = termOfScript(addressScriptHex(address));
    assert.deepEqual(lockedText(t), expected);
    assert.ok(demandsOf(t).every((alt) => alt.runs), `${address} should hand something back`);
    // …and rung one is unaffected: an address says what it holds either way.
    assert.equal(addressText(t), `(λh. ${bodyOf(t, false)}) h${toSuperscript(t.bytes)}`);
  }
  // The forms that can say hand nothing back: every binder is a value, and the
  // lock is a function of exactly those.
  for (const address of ['1Ross5Np5doy4ajF9iGXzgKaC2Q3Pwwxv',
    'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4']) {
    const t = termOfScript(addressScriptHex(address));
    for (const alt of demandsOf(t)) assert.equal(alt.runs, null, address);
  }
  // Taproot is both at once, one path apiece -- which is what a taptree is.
  const tr = termOfScript(addressScriptHex('bc1p5d7rjq7g6rdk2yhzks9smlaqtedr4dekq08ge8ztwac72sfr9rusxg3297'));
  assert.deepEqual(demandsOf(tr).map((alt) => alt.runs), [null, 't']);
});

test('no binder stands for something the address cannot count', () => {
  // A binder is a value a spend supplies, so a mark meaning "and however many
  // more" is not one. That rule stands, and the ellipsis does not break it: …
  // is written from `runs` and never enters `brings`, so every binder the term
  // names is still one letter and one value. What the rule really bought was
  // the death of an invented binder -- taproot's script path once bound an `s`,
  // as if every leaf wanted a signature, which no address can know.
  for (const id of Object.keys(TERMS)) {
    const bytes = TERMS[id].bytes ?? 65;
    const t = termOfScript(reduce(TERMS[id], 'ab'.repeat(bytes)));
    for (const alt of demandsOf(t)) {
      for (const name of alt.brings) {
        assert.match(name, /^[a-z]$/, `${id} binds ${name}, which is not a value`);
      }
    }
    // Rung one is the address, which counts its own arguments exactly: whatever
    // a revealed script wants is not this rung's business, and never was.
    assert.ok(!addressText(t).includes('…'), `${id} writes an ellipsis on rung one`);
  }
  // Taproot's script path binds the leaf and its proof, and nothing else. An
  // `s` here would be the page inventing a demand out of what leaves usually
  // hold, which is the failure the rule above exists to catch.
  const tr = termOfScript(addressScriptHex('bc1p5d7rjq7g6rdk2yhzks9smlaqtedr4dekq08ge8ztwac72sfr9rusxg3297'));
  assert.deepEqual(demandsOf(tr).map((alt) => alt.brings), [['s'], ['t', 'c']]);
});

test('a wrapped form writes the arguments it cannot count, and only it does', () => {
  // What the ellipsis says, and why it belongs on the line. A revealed script
  // runs on the same stack as any other -- a tapscript leaf is not a special
  // machine, and Bitcoin executes it the way it executes a scriptPubKey -- so
  // its arguments are certainly there, beneath it, in the order the spender
  // pushed them. The output cannot say how many, because it committed to a hash
  // and not to a script. Writing … is that sentence: they exist, uncounted.
  const of = (address) => lockedText(termOfScript(addressScriptHex(address)));
  assert.deepEqual(of('3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy'), ['λ… r. ⌖ h²⁰ = ( r )']);
  assert.deepEqual(of('bc1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3qccfmv3'),
    ['λ… w. ⓪ h³² ( w )']);
  // Taproot, both paths at once: the key path counts its one argument exactly,
  // and only the script path reveals a script with an arity of its own. The key
  // path ends on a ( ) all the same, and takes no ellipsis with it -- what runs
  // there is consensus's own check, whose arity is the one binder already named.
  assert.deepEqual(of('bc1p5d7rjq7g6rdk2yhzks9smlaqtedr4dekq08ge8ztwac72sfr9rusxg3297'),
    ['λs. ① p³² ( ∇ )', 'λ… t c. ① p³² ( t )']);
  // It leads, because that is where the arguments go: pushed first, with the
  // revealed script on top of them.
  for (const line of of('3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy')) {
    assert.match(line, /^λ… /, 'the uncounted arguments are pushed first');
  }
  // One claim, one field. The … and the ( ) are both read off `runs`, so a term
  // can never promise a script and then decline to admit its arguments.
  for (const [, address] of ADDRESSES) {
    const t = termOfScript(addressScriptHex(address));
    demandsOf(t).forEach((alt, i) => {
      assert.equal(lockedText(t)[i].includes('…'), Boolean(alt.runs), address);
      assert.equal(spendText(t)[i].includes('…'), Boolean(alt.runs), address);
    });
  }
});

test('the two renderings of a rung never drift', () => {
  const strip = (html) => html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  for (const [, address] of ADDRESSES) {
    const t = termOfScript(addressScriptHex(address));
    assert.equal(strip(addressHtml(t)), addressText(t), address);
    assert.deepEqual(lockedHtml(t).map(strip), lockedText(t), address);
  }
  // Every term the module knows says what it awaits; a new one that did not
  // would draw a blank line on the page rather than fail here.
  for (const id of Object.keys(TERMS)) {
    const bytes = TERMS[id].bytes ?? 65;
    assert.ok(demandsOf(termOfScript(reduce(TERMS[id], 'ab'.repeat(bytes)))), `${id} awaits nothing`);
  }
});

test('the datum is said where an address keeps its payload', () => {
  // The prose follows the term, behind the mark that gives its length -- the
  // same pairing the sigla address format uses, and the same place base58 and
  // bech32 put their entropy. Rung two never carries it: the leaf sets the
  // spelled script there, which says the datum in its own right.
  const t = termOfScript(addressScriptHex('1Ross5Np5doy4ajF9iGXzgKaC2Q3Pwwxv'));
  const strip = (html) => html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  assert.equal(strip(addressHtml(t, { prose: 'ridge amused garment inmate' })),
    '(λh. ⧉ ⌖ h ≡ ∇) h²⁰ ridge amused garment inmate');
  assert.equal(strip(addressHtml(t, {})), strip(addressHtml(t)));
  // The lock line's binders stay outside the script, so a click on the copyable
  // span takes bare bytes and the search box can read them back.
  for (const m of lockedMarks(t)) {
    assert.ok(!m.prefix.includes('term-onchain') && !m.suffix.includes('term-onchain'));
    assert.ok(m.prefix.startsWith('<span class="lam">λ'), 'the binders lead the line');
  }
});

// ─── the key's own tables, read back ─────────────────────────────────────

// The terms table's rows, as { ids, cells } -- the cells are grid children, so
// they are walked with a depth counter rather than matched, nested spans and
// all, and read down to their text the way a reader sees them.
function termsTableRows() {
  const table = NOTATION_HTML.split('<div class="pattern-table terms">')[1].split('\n            </div>')[0];
  const cells = [];
  let depth = 0, start = 0;
  for (const m of table.matchAll(/<span[^>]*>|<\/span>/g)) {
    if (m[0] === '</span>') {
      if (--depth === 0) cells.push(table.slice(start, m.index + m[0].length));
    } else {
      if (depth === 0) start = m.index;
      depth++;
    }
  }
  const text = (cell) => cell.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  const rows = [];
  for (const cell of cells) {
    if (/class="phead"/.test(cell)) continue;
    if (/class="pname"/.test(cell)) {
      rows.push({ ids: cell.match(/data-row="([^"]+)"/)[1].split(/\s+/), cells: [] });
    } else if (rows.length) {
      rows[rows.length - 1].cells.push(text(cell));
    }
  }
  return rows;
}

test('the module draws the terms the notation key draws', () => {
  const rows = termsTableRows();
  assert.equal(rows.length, 8, 'the terms table lost or gained a row');
  const seen = new Set();
  for (const { ids, cells } of rows) {
    // The key gives Taproot's two rows one term, as this module does.
    const id = ids.map((r) => (r.startsWith('p2tr') ? 'p2tr' : r)).find((r) => TERMS[r]);
    if (id === undefined) continue;   // multisig and data abstract over more, or over anything
    seen.add(id);
    const term = TERMS[id];
    // Built from the key's own Reduces-to column: the byte count it prints is
    // the length that row's argument takes, so the term is bound to a datum of
    // exactly that size and written out for comparison.
    const bytes = term.bytes ?? 65;
    const t = termOfScript(reduce(term, 'ab'.repeat(bytes)));
    assert.ok(t, `${id} does not bind`);
    assert.equal(abstractionText(t), cells[0], `${id}'s term`);
    assert.equal(normalFormText(t), cells[1], `${id}'s normal form`);
  }
  assert.deepEqual([...seen].sort(), Object.keys(TERMS).sort(),
    'every term the module knows should have a row in the key, and vice versa');
});

// ─── which path a spend took ─────────────────────────────────────────────

const TR = 'bc1p5d7rjq7g6rdk2yhzks9smlaqtedr4dekq08ge8ztwac72sfr9rusxg3297';
const SIG = '30' + '44'.repeat(70);            // 71 bytes, DER-shaped
const KEY = '02' + 'ab'.repeat(32);            // 33 bytes, compressed
const SCHNORR = 'ab'.repeat(64);

test('the term keeps every way in; the spend quotes the one taken', () => {
  // An unspent taproot output really can be opened either way, so rung two
  // keeps both. What the chain has a record of is one of them, and which is
  // read off the count rather than guessed: consensus's own rule is that
  // exactly one witness item is the key path.
  const tr = termOfScript(addressScriptHex(TR));
  assert.equal(lockedText(tr).length, 2, 'the lock admits two paths');
  assert.equal(pathTaken(tr, [SCHNORR]), 0, 'one item is the key path');
  assert.equal(pathTaken(tr, [SIG, '51' + KEY + 'ac', 'c0' + 'ab'.repeat(32)]), 1,
    'a leaf and its proof is the script path');
  // The wrapped forms generalize it: an alternative handing a script back takes
  // at least its binders and however many more that script wants.
  const sh = termOfScript(addressScriptHex('3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy'));
  assert.equal(pathTaken(sh, [SIG, SIG, '52' + KEY + '51ae']), 0, 'the only path, at any depth');
  // Nothing brought is nothing to read.
  assert.equal(pathTaken(termOfScript(addressScriptHex(TR)), []), null);
  assert.equal(pathTaken(termOfScript('76a914' + 'ab'.repeat(20)), [SIG]), null,
    'a term with nothing written down about its paths chooses none');
});

test('the values a spend brought are named by the term, from the top down', () => {
  const p2pkh = termOfScript(addressScriptHex('1Ross5Np5doy4ajF9iGXzgKaC2Q3Pwwxv'));
  assert.deepEqual(suppliedNames(demandsOf(p2pkh)[0], [SIG, KEY]), ['s', 'p']);
  // A wrapped form's script rides on top, so its binder names the LAST item and
  // what stands before it is whatever that script wanted -- which the term
  // above never knew, so those keep the book's ordinary reading of a push.
  const sh = termOfScript(addressScriptHex('3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy'));
  assert.deepEqual(suppliedNames(demandsOf(sh)[0], [SIG, SIG, '52' + KEY + '51ae']),
    ['s', 's', 'r'], 'the redeem script is r; its own arguments are read as what they look like');
  // Taproot's script path names the last two, leaf then proof.
  const tr = termOfScript(addressScriptHex(TR));
  assert.deepEqual(suppliedNames(demandsOf(tr)[1], [SIG, '51' + KEY + 'ac', 'c0' + 'ab'.repeat(32)]),
    ['s', 't', 'c']);
});

test('the spend rung is written from the chain, marks counts and prose', () => {
  const strip = (html) => html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  const t = termOfScript(addressScriptHex('1Ross5Np5doy4ajF9iGXzgKaC2Q3Pwwxv'));
  const got = suppliedHtml(t, [SIG, KEY]);
  assert.equal(got.which, 0);
  // Everything on this line was read off the input the citation names, and
  // nothing else is on it. These values are the ARGUMENT of the application
  // spendMarks writes above: the abstraction, its parentheses and the lock
  // inside them all belong to the OUTPUT, cited a rung further up, and a line
  // that carried any of it would put two transactions' marks under an
  // attribution that names one.
  assert.equal(strip(got.html), 's⁷¹ p³³');
  assert.ok(!/[()λ⧺]/.test(strip(got.html)), 'no apparatus rides into the quotation');
  // The prose rides behind each mark, as a push's prose does in every chapter.
  const said = suppliedHtml(t, [SIG, KEY], { say: (hex) => (hex === KEY ? 'ridge amused' : 'sworn') });
  assert.equal(strip(said.html), 's⁷¹ sworn p³³ ridge amused');
  // Taproot writes whichever path it was, and says which.
  const tr = termOfScript(addressScriptHex(TR));
  assert.equal(strip(suppliedHtml(tr, [SCHNORR]).html), 's⁶⁴');
  const leaf = suppliedHtml(tr, [SIG, '51' + KEY + 'ac', 'c0' + 'ab'.repeat(32)]);
  assert.equal(leaf.which, 1);
  assert.equal(strip(leaf.html), 's⁷¹ t³⁵ c³³');
  assert.equal(suppliedHtml(t, []), null, 'nothing brought, nothing to write');
});
