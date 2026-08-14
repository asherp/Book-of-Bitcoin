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
import { TERMS, termOfScript, addressable, reduce, spendHtml, pathTaken, suppliedNames, suppliedHtml, abstractionText, applicationText, normalFormText,
         pureForm, reducePure, pureText, pureApplicationText,
         lockText, lockApplicationText, demandsOf, addressText, addressHtml,
         lockedText, lockedHtml, spendText,
         revealedOf, revealedText, revealedHtml,
         titleText, titleHtml } from '../web/btc-term.js';

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
  assert.deepEqual(of('1Ross5Np5doy4ajF9iGXzgKaC2Q3Pwwxv'), ['λs p. ( ⌖ p ≡ h²⁰ ) ∧ ∇ s p ( ⌘ … )']);
  // …and the same program one wire down, in the ( ) that says consensus wrote
  // it rather than the output. A v0 key-hash output carries a version byte and
  // a hash and nothing that hashes, compares or verifies; BIP141 runs it as the
  // P2PKH template, which is the line above, mark for mark.
  assert.deepEqual(of('bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4'),
    ['λs p. ( ⌖ p ≡ h²⁰ ) ∧ ∇ s p ( ⌘ … )']);
  // An output with two ways to open it is one lock and two λ over it. Both end
  // on something run: a leaf the spender reveals, or the check consensus makes
  // itself where no script is revealed at all.
  assert.deepEqual(of('bc1p5d7rjq7g6rdk2yhzks9smlaqtedr4dekq08ge8ztwac72sfr9rusxg3297'),
    ['λs. ∇ s p³² ( ⌘ … )', 'λ… t c. ( ⋔ t c ≡ p³² ) ∧ ( t )']);
  // Rung two no longer restates the script -- that is set below it, quoted,
  // under a citation -- so what it must carry instead is the datum, which is
  // the one thing tying the demand to THIS output rather than to the form.
  for (const [, address] of ADDRESSES) {
    const t = termOfScript(addressScriptHex(address));
    assert.equal(reduce(t, t.argument), addressScriptHex(address), address);
    const datum = t.binder + toSuperscript(t.bytes);
    for (const line of lockedText(t)) {
      assert.ok(line.includes(datum), `${address}: rung two names no datum`);
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
    ['(λs p. ( ⌖ p ≡ h²⁰ ) ∧ ∇ s p ( ⌘ … )) s p']);
  assert.deepEqual(spendText(termOfScript(addressScriptHex('3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy'))),
    ['(λ… r. ( ⌖ r ≡ h²⁰ ) ∧ ( r )) … r']);
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
  assert.deepEqual(spendHtml(t).map(strip), spendText(t), 'the two renderings drift');
  // The application's parentheses are apparatus, not bytes: they never take the
  // gold, which is the rule the whole leaf is styled by.
  assert.match(spendHtml(t)[0], /class="lam">\(λ/);
  // …and neither does the conjunction, which shares a glyph with a live opcode
  // and is kept apart from it by exactly this.
  assert.match(spendHtml(t)[0], /class="lam"[^>]*>∧/);
  // Taproot has two, and a spend took one: the leaf draws the alternative
  // pathTaken names and no other, because which path was taken is in the
  // witness and guessing is the thing this page exists not to do.
  const tr = termOfScript(addressScriptHex(
    'bc1p5d7rjq7g6rdk2yhzks9smlaqtedr4dekq08ge8ztwac72sfr9rusxg3297'));
  assert.equal(spendHtml(tr).length, 2);
  assert.deepEqual(spendHtml(tr).map(strip), spendText(tr));
  // A term with nothing written down about what it awaits has no rung three.
  assert.equal(spendHtml(termOfScript('76a914' + 'ab'.repeat(20))), null);
});

test('the demand is what a spend must make true, form by form', () => {
  // Rung two states a predicate now, and the reason it can is that it no longer
  // claims to reduce to anything: the script is quoted below it under a
  // citation, so the line is free to say what a reader can actually evaluate.
  //
  // What that buys shows up first on the witness forms. A witness scriptPubKey
  // is a version byte and a commitment -- ⟦ ⓪ h²⁰ ⟧ hashes nothing, compares
  // nothing, verifies nothing -- so a line that restated it said only what was
  // already quoted underneath. The demand says what consensus does with it.
  const of = (address) => lockedText(termOfScript(addressScriptHex(address)));
  assert.deepEqual(of('bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4'),
    ['λs p. ( ⌖ p ≡ h²⁰ ) ∧ ∇ s p ( ⌘ … )']);
  assert.deepEqual(of('bc1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3qccfmv3'),
    ['λ… w. ( Σ w ≡ h³² ) ∧ ( w )']);
  assert.deepEqual(of('3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy'), ['λ… r. ( ⌖ r ≡ h²⁰ ) ∧ ( r )']);
  // Taproot's two paths are two demands, and they share no clause: one is a
  // signature under the output key, the other a leaf that tweaks back to it.
  const tr = termOfScript(addressScriptHex(TR));
  assert.deepEqual(lockedText(tr),
    ['λs. ∇ s p³² ( ⌘ … )', 'λ… t c. ( ⋔ t c ≡ p³² ) ∧ ( t )']);

  // Every clause is over something on the line. A demand naming a value no
  // binder brings and the datum does not supply would be unevaluable, which is
  // the one thing a predicate must never be.
  for (const [, address] of ADDRESSES) {
    const t = termOfScript(addressScriptHex(address));
    demandsOf(t).forEach((alt) => {
      const named = new Set([...alt.brings, t.binder]);
      for (const tok of alt.demand) {
        if (typeof tok !== 'string' || !/^[a-z]$/.test(tok)) continue;
        assert.ok(named.has(tok), `${address} demands ${tok}, which nothing supplies`);
      }
    });
  }
  // A wrapped form hands the rest of its demand over rather than inventing it:
  // ( r ) is exactly as much as an output that committed to a hash can say.
  for (const [, address] of ADDRESSES) {
    const t = termOfScript(addressScriptHex(address));
    demandsOf(t).forEach((alt, i) => {
      assert.equal(lockedText(t)[i].includes(`( ${alt.runs} )`), Boolean(alt.runs), address);
    });
  }
});

test('a signature’s clause names the message, and says when it cannot', () => {
  // ⌘ … is the honest form of "not known": no spend has been reached, so there
  // is no serialization to set and nothing a reader could hash. Given one, the
  // mark becomes a letter and the letter a footnote — which is the difference
  // between a demand a reader can read and one they can carry out.
  const t = termOfScript(addressScriptHex('bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4'));
  assert.match(lockedText(t)[0], /\( ⌘ … \)$/);
  assert.match(spendText(t, '※')[0], /\( ⌘ ※ \)\) s p$/);
  // …and only the forms that check a signature name a message at all. P2SH and
  // P2WSH hand the signature check over with the script they reveal, so ⌘
  // appears nowhere on their lines: the output never knew there would be one.
  const wrapped = (a) => lockedText(termOfScript(addressScriptHex(a)))[0];
  assert.ok(!wrapped('3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy').includes('⌘'));
  assert.ok(!wrapped('bc1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3qccfmv3').includes('⌘'));
  assert.ok(lockedText(termOfScript(addressScriptHex(TR)))[0].includes('⌘'), 'a key path does');
  assert.ok(!lockedText(termOfScript(addressScriptHex(TR)))[1].includes('⌘'), 'a leaf does not');
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
  // program an alternative names as consensus's own, whose marks are true of a
  // spend without being bytes of the output. Each line is checked against what
  // ITS alternative declares, so rung one can never carry one of those marks
  // and neither can a sibling path -- taproot's script path may not borrow the
  // key path's ∇, and no line may write an opcode that is nowhere at all.
  const CAT = OPCODE_SYMBOLS[0x7e];
  assert.equal(OPCODE_NAMES[0x7e], 'OP_CAT');
  for (const id of Object.keys(TERMS)) {
    const bytes = TERMS[id].bytes ?? 65;
    const t = termOfScript(reduce(TERMS[id], 'ab'.repeat(bytes)));
    const own = t.body.filter((c) => c !== null).map((c) => OPCODE_SYMBOLS[c]);
    // Rungs one and two of the OLD ladder are gone; what is left is rung one,
    // which still claims to be the script with its argument in, and the two
    // predicate rungs, which do not. So the rule splits where the claim does.
    // Rung one may write only what the lock owns. A demand may also write the
    // marks ITS OWN alternative declares -- and nothing else, so a sibling path
    // cannot borrow a clause and no line can reach for an opcode that is
    // nowhere at all.
    const demands = demandsOf(t).map((alt) => alt.marks.map((c) => OPCODE_SYMBOLS[c]));
    const rungs = [[addressText(t), []],
      ...lockedText(t).map((line, i) => [line, demands[i]]),
      ...spendText(t).map((line, i) => [line, demands[i]])];
    for (const [line, supplied] of rungs) {
      assert.ok(!line.includes(CAT), `${id} still joins with an opcode on this rung`);
      // ∧ is the one mark that is not an operation at all. It shares a glyph
      // with OP_BOOLAND and is the notation's conjunction, and what keeps the
      // two apart is not the alphabet but the ink: gold is a byte or an
      // operation, and the conjunction takes the apparatus colour. Checked as
      // such below rather than waved through here.
      const allowed = new Set([...own, ...supplied, ...(supplied.length ? ['∧'] : [])]);
      for (const [code, glyph] of Object.entries(OPCODE_SYMBOLS)) {
        if (allowed.has(glyph)) continue;
        assert.ok(!line.includes(glyph),
          `${id} writes ${glyph} (${OPCODE_NAMES[code]}), which its lock never does`);
      }
    }
  }
});

test('the conjunction is never set as an operation', () => {
  // The whole warrant for writing ∧ on a line at all. A reader who takes the
  // ink seriously -- and this leaf gives them nothing else to take -- must never
  // see the conjunction claim to be OP_BOOLAND, so it takes the quiet colour on
  // every rung that carries one, and the marks beside it take the gold.
  for (const [, address] of ADDRESSES) {
    const t = termOfScript(addressScriptHex(address));
    for (const line of [...lockedHtml(t), ...spendHtml(t)]) {
      if (!line.includes('∧')) continue;
      assert.match(line, /class="lam"[^>]*>∧<\/span>/, `${address} sets ∧ as something else`);
      assert.ok(!/class="op"[^>]*>∧/.test(line), `${address} sets ∧ as an operation`);
    }
  }
  // …and it says so when asked, since a glyph shared with a live opcode is
  // exactly the kind of claim this book puts in a hover.
  const t = termOfScript(addressScriptHex('1Ross5Np5doy4ajF9iGXzgKaC2Q3Pwwxv'));
  assert.match(lockedHtml(t)[0], /title="[^"]*OP_BOOLAND[^"]*"[^>]*>∧/);
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
  // Written as demands they are not merely alike, they are the same sentence.
  // The committed-datum reading made these two different objects and the
  // predicate makes them one, which is the truth of it: a P2WPKH output asks
  // for a key that hashes to h and a signature under it, and so does a P2PKH
  // output, and every remaining difference between them is the wire.
  assert.deepEqual(lockedText(termOfScript(addressScriptHex('1Ross5Np5doy4ajF9iGXzgKaC2Q3Pwwxv'))),
    lockedText(termOfScript(addressScriptHex('bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4'))));
  // The rung that still tells them apart is the one that is about bytes.
  assert.notEqual(normalFormText(termOfScript(addressScriptHex('1Ross5Np5doy4ajF9iGXzgKaC2Q3Pwwxv'))),
    normalFormText(termOfScript(addressScriptHex('bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4'))));
});

test('the wrapped forms cannot say what they will ask for', () => {
  // P2SH, P2WSH and taproot's script path all end on a function they hand back
  // rather than on a value: ( r ) awaits arguments of its own, and how many is
  // a property of a script the address has never seen. That is the whole of
  // "cannot say" -- an unapplied function is already unable to promise an
  // arity, so nothing needs to stand in for the missing binders.
  for (const [address, expected] of [
    ['3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy', ['λ… r. ( ⌖ r ≡ h²⁰ ) ∧ ( r )']],
    ['bc1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3qccfmv3',
      ['λ… w. ( Σ w ≡ h³² ) ∧ ( w )']],
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
  assert.deepEqual(of('3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy'), ['λ… r. ( ⌖ r ≡ h²⁰ ) ∧ ( r )']);
  assert.deepEqual(of('bc1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3qccfmv3'),
    ['λ… w. ( Σ w ≡ h³² ) ∧ ( w )']);
  // Taproot, both paths at once: the key path counts its one argument exactly,
  // and only the script path reveals a script with an arity of its own. The key
  // path ends on a ( ) all the same, and takes no ellipsis with it -- what runs
  // there is consensus's own check, whose arity is the one binder already named.
  assert.deepEqual(of('bc1p5d7rjq7g6rdk2yhzks9smlaqtedr4dekq08ge8ztwac72sfr9rusxg3297'),
    ['λs. ∇ s p³² ( ⌘ … )', 'λ… t c. ( ⋔ t c ≡ p³² ) ∧ ( t )']);
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
      // Read off the binder list, not off the whole line: ⌘ … carries the same
      // mark for the same reason -- something the notation cannot write down --
      // and the two never touch, one standing inside the λ and the other inside
      // a ( ). What `runs` governs is the one after the λ.
      const binders = (line) => line.slice(line.indexOf('λ'), line.indexOf('.'));
      assert.equal(binders(lockedText(t)[i]).includes('…'), Boolean(alt.runs), address);
      assert.equal(binders(spendText(t)[i]).includes('…'), Boolean(alt.runs), address);
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
  // Nothing on a demand line is copyable: the copyable form is the script, and
  // the script is quoted a line below under its own citation.
  for (const line of lockedHtml(t)) {
    assert.ok(!line.includes('term-onchain'), 'the demand is not the thing to copy');
    assert.ok(line.startsWith('<span class="lam">λ'), 'the binders lead the line');
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

test('the spend quotation is titled by what the chain revealed', () => {
  const strip = (html) => html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  // A push as the wire writes one: direct to 75 bytes, OP_PUSHDATA1 past it
  // -- which a three-key redeem script always is.
  const push = (h) => {
    const n = h.length / 2;
    return (n <= 75 ? '' : '4c') + n.toString(16).padStart(2, '0') + h;
  };
  // Two kinds of output hide two kinds of thing, so a reveal is titled two
  // ways. A script-hash form hid a SCRIPT: the spend hands over its bytes, and
  // the title is that script's own -- the anonymous λ it binds, exactly as the
  // lock a rung up is titled by its own.
  const sh = termOfScript(addressScriptHex('3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy'));
  const redeem = '52' + push(KEY) + push(KEY) + push(KEY) + '53ae';
  const scriptsig = '00' + push(SIG) + push(SIG) + push(redeem);
  const items = ['', SIG, SIG, redeem];
  assert.equal(revealedOf(sh, items, { scriptsig }), redeem);
  assert.deepEqual(revealedText(sh, items, { scriptsig }), ['λp₁ p₂ p₃. ② p₁ p₂ p₃ ③ ◇']);
  assert.deepEqual(revealedText(sh, items, { scriptsig }), [titleText(termOfScript(redeem))]);
  // …and the two renderings never drift, exactly as every other rung's do not.
  assert.deepEqual(revealedHtml(sh, items, { scriptsig }).map(strip),
    revealedText(sh, items, { scriptsig }));
  // A P2SH output wrapping a witness program: the arguments move to the stack
  // and the redeem script stays behind in the scriptSig, so it is read from
  // there. Its title is the title that program carries anywhere else, because
  // it is the same script wherever it stands.
  const program = '0014' + 'cd'.repeat(20);
  assert.deepEqual(revealedText(sh, [SIG, KEY], { scriptsig: push(program) }), ['λh. ⓪ h']);
  // Without the scriptSig there is no redeem script to read, and the last
  // witness item is never mistaken for one: null, not the pubkey.
  assert.equal(revealedOf(sh, [SIG, KEY]), null);
  // P2WSH reveals on the stack: the witness script is the last item.
  const wsh = termOfScript(addressScriptHex('bc1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3qccfmv3'));
  const witnessScript = push(KEY) + 'ac';
  assert.equal(revealedOf(wsh, [SIG, witnessScript]), witnessScript);
  assert.deepEqual(revealedText(wsh, [SIG, witnessScript]), ['λp. p ∇']);

  // The other kind: a keyhash form hid a VALUE, the key behind ⌖p. There is no
  // script to read, so the title is the demand with its commitment discharged
  // -- the p is on the page now, and what the spend turned out to be is the
  // signature over a message the page can name.
  const wpkh = termOfScript('00142b0a02e9917ef97e5b441b566fe671dcdf232dde');
  assert.equal(titleText(wpkh), 'λh. ⓪ h', 'the lock is titled by the λ it binds');
  assert.deepEqual(revealedText(wpkh, [SIG, KEY], { msg: '※' }), ['λs p. ∇ s p ( ⌘ ※ )']);
  assert.deepEqual(revealedHtml(wpkh, [SIG, KEY], { msg: '※' }).map(strip),
    revealedText(wpkh, [SIG, KEY], { msg: '※' }));
  // The hash clause is gone because it is a question already answered, and the
  // key stands bare: it came from the spend, not from the output.
  assert.ok(!/⌖|∧|²⁰/.test(revealedText(wpkh, [SIG, KEY], { msg: '※' })[0]));
  // Unnamed where the page has not fetched the preimage, said the way the
  // lock rung says it.
  assert.deepEqual(revealedText(wpkh, [SIG, KEY]), ['λs p. ∇ s p ( ⌘ … )']);
  // P2PKH hid the same value and is titled the same way on its reveal, though
  // its lock is a different script and carries a different title.
  const pkh = termOfScript(addressScriptHex('1Ross5Np5doy4ajF9iGXzgKaC2Q3Pwwxv'));
  assert.equal(titleText(pkh), 'λh. ⧉ ⌖ h ≡ ∇');
  assert.deepEqual(revealedText(pkh, [SIG, KEY], { msg: '※' }), ['λs p. ∇ s p ( ⌘ ※ )']);

  // The forms that hid nothing are titled too, and the difference shows in the
  // binders: their key was in the output from the first, so the spend brought
  // only a signature and the key stays the datum it always was -- p³² with its
  // count, where a keyhash reveal writes a bare p it had to be given.
  const tr = termOfScript(addressScriptHex(TR));
  assert.equal(revealedOf(tr, [SCHNORR]), null, 'no script was revealed');
  assert.deepEqual(revealedText(tr, [SCHNORR], { msg: '※' }), ['λs. ∇ s p³² ( ⌘ ※ )']);
  assert.deepEqual(revealedText(termOfScript(reduce(TERMS.p2pk, '04' + 'ab'.repeat(64))), [SIG],
    { msg: '※' }), ['λs. ∇ s p⁶⁵ ( ⌘ ※ )'], 'a bare key, at its own length');
  // Which is what keeps ⌘ anchored. The message footnote is drawn wherever the
  // page could serialize one, and with the application rung gone this title is
  // the only line that writes ⌘ -- a footnote whose mark appeared nowhere would
  // be a reference to nothing.
  assert.ok(revealedText(tr, [SCHNORR], { msg: '※' })[0].includes('⌘ ※'));
  // Taproot's script path hid a leaf, which is a script: titled by its own λ.
  const leaf = push(KEY) + 'ac';
  assert.equal(revealedOf(tr, [SIG, leaf, 'c0' + 'ab'.repeat(32)]), leaf);
  assert.deepEqual(revealedText(tr, [SIG, leaf, 'c0' + 'ab'.repeat(32)]), ['λp. p ∇']);
  // …and a reveal the alphabet cannot read titles nothing: the bytes are
  // known, what they are is not, and declining beats guessing.
  const unreadable = 'ba'.repeat(3);                // opcodes consensus never defined
  const bad = { scriptsig: '00' + push(SIG) + push(unreadable) };
  assert.equal(revealedText(sh, ['', SIG, unreadable], bad), null);
  assert.equal(revealedOf(sh, ['', SIG, unreadable], bad), unreadable,
    'the bytes themselves are still named');
});

test('the datum points at the passage that holds it; nothing else does', () => {
  const strip = (html) => html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  const linked = (html) => /<a class="term-ref"/.test(html);
  const ref = { href: './bitcoin-book.html?ref=v4b78c160s1250o0',
    said: 'written at IV β78 ■160 §1250.0' };
  const tr = termOfScript(addressScriptHex(TR));
  // A term line that writes the output's datum is naming ONE value however
  // many lines write it -- the bytes the locking script carries -- so the mark
  // carries a road to the passage that holds it.
  assert.ok(linked(addressHtml(tr, { ref })), 'the address rung’s argument');
  const key = revealedHtml(tr, [SCHNORR], { msg: '※', ref });
  assert.ok(linked(key[0]), 'and a spend title naming the key the OUTPUT published');
  // …which is the case the road exists for: p³² is bound a section above, in a
  // different transaction, while every other name on that line is something
  // this input brought and the passage below quotes. So a keyhash reveal, whose
  // p came from the spend itself, gets none.
  const wpkh = termOfScript('00142b0a02e9917ef97e5b441b566fe671dcdf232dde');
  const brought = revealedHtml(wpkh, [SIG, KEY], { msg: '※', ref });
  assert.equal(strip(brought[0]), 'λs p. ∇ s p ( ⌘ ※ )');
  assert.ok(!linked(brought[0]), 'a value the spend brought needs no road to another passage');
  // The mark is never replaced by the reference: a citation names an output,
  // which is the whole script -- the term's own reduced form -- so writing it
  // where the argument stands would apply the term to its own result, and
  // would throw away which datum this is and how many bytes of it.
  assert.equal(strip(addressHtml(tr, { ref })), addressText(tr));
  assert.match(addressHtml(tr, { ref }), /term-ref[^>]*>.*?class="dt".*?class="op op-push op-count"/);
  // And no road where the chain did not answer: under ⋯ ∅ ☒ there is no passage
  // to send anyone to, and the mark stands alone as it does before any fetch.
  assert.ok(!linked(addressHtml(tr)), 'unasked, the mark stands bare');
  assert.ok(!linked(revealedHtml(tr, [SCHNORR], { msg: '※' })[0]));
  // A term with more than one hole carries no address and no single datum, so
  // no hole is the one the chain cited: none of them takes the road.
  const ms = termOfScript('52' + '21' + KEY + '21' + KEY + '21' + KEY + '53ae');
  assert.equal(ms.holes.length, 3);
  assert.ok(!linked(addressHtml(ms, { ref })), 'three arguments name no one passage');
});
