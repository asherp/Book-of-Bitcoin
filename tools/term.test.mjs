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
import { OPCODE_SYMBOLS, OPCODE_NAMES } from '../web/btc-sigla.js';
import { TERMS, termOfScript, reduce, abstractionText, applicationText, normalFormText,
         pureForm, reducePure, pureText, pureApplicationText,
         lockText, lockApplicationText, demandsOf, demandsText, demandsHtml } from '../web/btc-term.js';

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
    assert.equal(reduce(t.term, t.argument), script, `${id} does not reduce to its script`);
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

test('a term is one abstraction over one datum, and refuses everything else', () => {
  const P = (n) => n.toString(16).padStart(2, '0') + 'ab'.repeat(n);
  // Bare multisig: its λ takes m, n and n keys, so there is no single argument
  // to bind -- the refusal the Addresses group turns into an argument for P2SH.
  assert.equal(termOfScript('52' + P(33) + P(33) + P(33) + '53ae'), null);
  assert.equal(termOfScript('6a' + P(8)), null, 'a data output binds nothing');
  assert.equal(termOfScript(''), null);
  assert.equal(termOfScript('76a914' + 'ab'.repeat(20)), null, 'a truncated lock is not a term');
  assert.equal(termOfScript('deadbeef'), null, 'nor an unrecognised one');
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

// ─── the address as a partial application ────────────────────────────────

test('an address is its term with one argument supplied', () => {
  const of = (address) => demandsText(termOfScript(addressScriptHex(address)));
  // The λ binds both parties' key material -- the payee's datum first, because
  // that is the one argument the address itself carries, and the payer's after
  // it, because nobody has it yet. What follows the term is the datum: the half
  // of a base58 or bech32 string that is entropy rather than tag.
  assert.equal(of('1Ross5Np5doy4ajF9iGXzgKaC2Q3Pwwxv'),
    '(λh s p. s p ⧺ ⧉ ⌖ h ≡ ∇) h²⁰');
  assert.equal(of('bc1p5d7rjq7g6rdk2yhzks9smlaqtedr4dekq08ge8ztwac72sfr9rusxg3297'),
    '(λp s. s ⧺ ① p) p³² · (λp s t c. s t c ⧺ ① p ( t )) p³²',
    'taproot asks for one of two things');
  // P2PK's key is the argument here too, and what it awaits is one signature.
  assert.equal(demandsText(termOfScript(reduce(TERMS.p2pk, '04' + 'ab'.repeat(64)))),
    '(λp s. s ⧺ p ∇) p⁶⁵');
});

test('the only opcode on the line the lock does not own is the joint', () => {
  // The point of the form, and the bug it was written to close. A demand set as
  // a predicate needs a conjunction between its clauses, and the mark that
  // printed was ∧ -- OP_BOOLAND, which is not disabled at all: a live opcode
  // that pops two numbers, standing on a line that claimed to reduce to a
  // script. Written as spend ⧺ lock there is no clause to join, so the only
  // mark that is not the lock's own is ⧺ itself, and every other is an opcode
  // the chain defines or a variable standing for a push.
  const CAT = OPCODE_SYMBOLS[0x7e];
  assert.equal(OPCODE_NAMES[0x7e], 'OP_CAT');
  for (const id of Object.keys(TERMS)) {
    const bytes = TERMS[id].bytes ?? 65;
    const t = termOfScript(reduce(TERMS[id], 'ab'.repeat(bytes)));
    const own = new Set(t.term.body.filter((c) => c !== null).map((c) => OPCODE_SYMBOLS[c]));
    for (const line of demandsText(t).split(' · ')) {
      assert.equal(line.split(CAT).length - 1, 1, `${id} should join its halves once`);
      // Every glyph of the alphabet, checked against this line: the lock's own
      // marks may stand, the joint may stand, and nothing else may.
      for (const [code, glyph] of Object.entries(OPCODE_SYMBOLS)) {
        if (own.has(glyph) || glyph === CAT) continue;
        assert.ok(!line.includes(glyph),
          `${id} writes ${glyph} (${OPCODE_NAMES[code]}), which its lock never does`);
      }
    }
  }
});

// The lock body as the demand line writes it, built from the term's own
// opcodes: the marks the notation key's Reduces-to column prints, with the
// datum's binder standing bare where the push will go.
const bodyOf = (t) => t.term.body
  .map((code) => (code === null ? t.binder : OPCODE_SYMBOLS[code])).join(' ');

test('the lock the address writes is the script the chain holds', () => {
  // The claim the form makes: what stands to the right of the joint is the
  // term's own body, so supplying the argument the address carries gives the
  // scriptPubKey -- the same bytes the leaf sets below it, and the same the
  // chain is asked about. The two lines of the search page are one β apart
  // rather than two readings that merely agree.
  for (const [, address] of ADDRESSES) {
    const script = addressScriptHex(address);
    const t = termOfScript(script);
    const line = demandsText(t);
    for (const alt of demandsOf(t)) {
      assert.ok(line.includes(`${alt.brings.join(' ')} ⧺ ${bodyOf(t)}`),
        `${address} does not write spend ⧺ lock`);
    }
    assert.equal(reduce(t.term, t.argument), script, address);
  }
});

test('P2PKH and P2WPKH ask for the same key material', () => {
  // The committed-datum reading makes these different objects. Read as demands
  // they want the same two things in the same order: segwit moved where a
  // witness rides, not what is asked for.
  const brings = (address) => demandsOf(termOfScript(addressScriptHex(address)))
    .map((alt) => alt.binders.join(' '));
  assert.deepEqual(brings('1Ross5Np5doy4ajF9iGXzgKaC2Q3Pwwxv'), ['h s p']);
  assert.deepEqual(brings('1Ross5Np5doy4ajF9iGXzgKaC2Q3Pwwxv'),
    brings('bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4'));
  // …and the locks that key material rides against are not the same script at
  // all, which is the other half of the point: one demand, two wires.
  assert.notEqual(addressScriptHex('1Ross5Np5doy4ajF9iGXzgKaC2Q3Pwwxv'),
    addressScriptHex('bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4'));
  assert.notEqual(demandsText(termOfScript(addressScriptHex('1Ross5Np5doy4ajF9iGXzgKaC2Q3Pwwxv'))),
    demandsText(termOfScript(addressScriptHex('bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4'))));
});

test('the wrapped forms cannot say what they will ask for', () => {
  // P2SH and P2WSH run out of binders: whatever the redeem script requires,
  // which the address does not know and cannot know, and then the script
  // itself, which rides on top because that is where the spender pushes it. The
  // ellipsis is load-bearing -- a requirement hidden behind a hash rather than
  // a datum -- and ( ) is what the lock hands back once the hash matches.
  for (const [address, expected] of [
    ['3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy', '(λh … r. … r ⧺ ⌖ h = ( r )) h²⁰'],
    ['bc1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3qccfmv3',
      '(λh … w. … w ⧺ ⓪ h ( w )) h³²'],
  ]) {
    const t = termOfScript(addressScriptHex(address));
    assert.equal(demandsText(t), expected);
    assert.ok(demandsOf(t)[0].brings.includes('…'), `${address} should admit it cannot say`);
  }
  // Every other form can say, in full.
  for (const address of ['1Ross5Np5doy4ajF9iGXzgKaC2Q3Pwwxv',
    'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4',
    'bc1p5d7rjq7g6rdk2yhzks9smlaqtedr4dekq08ge8ztwac72sfr9rusxg3297']) {
    const t = termOfScript(addressScriptHex(address));
    for (const alt of demandsOf(t)) assert.ok(!alt.brings.includes('…'), address);
  }
});

test('the two renderings of a demand never drift', () => {
  const strip = (html) => html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  for (const [, address] of ADDRESSES) {
    const t = termOfScript(addressScriptHex(address));
    assert.equal(strip(demandsHtml(t)), demandsText(t), address);
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
  // bech32 put their entropy. Given no engine there is no prose, and the line
  // keeps its shape rather than falling back to hex.
  const t = termOfScript(addressScriptHex('1Ross5Np5doy4ajF9iGXzgKaC2Q3Pwwxv'));
  const strip = (html) => html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  assert.equal(strip(demandsHtml(t, { prose: 'ridge amused garment inmate' })),
    '(λh s p. s p ⧺ ⧉ ⌖ h ≡ ∇) h²⁰ ridge amused garment inmate');
  assert.equal(strip(demandsHtml(t, {})), strip(demandsHtml(t)));
  // Taproot's two alternatives each carry it: either is a whole address.
  const tr = termOfScript(addressScriptHex('bc1p5d7rjq7g6rdk2yhzks9smlaqtedr4dekq08ge8ztwac72sfr9rusxg3297'));
  assert.equal(strip(demandsHtml(tr, { prose: 'said' })).match(/said/g).length, 2);
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
