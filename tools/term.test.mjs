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
import { TERMS, termOfScript, reduce, abstractionText, applicationText, normalFormText,
         pureForm, reducePure, pureText, pureApplicationText } from '../web/btc-term.js';

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
    // Every binder is used, and every one of them is bound: the arguments and
    // the holes are the same set.
    assert.deepEqual([...new Set(pure.body)].sort(), [...pure.binders].sort(), id);
    assert.equal(pure.binders.length, pure.opcodes.length + 1, `${id}'s arity`);
    // Opcodes first, datum last -- the whole ordering claim, which is what
    // makes the tail the only incompressible part.
    assert.equal(pure.binders[pure.binders.length - 1], pure.datumName, `${id} ends on its datum`);
  }
});

test('the byte count rides in the binder name, so the body fixes the push', () => {
  const p2wpkh = pureForm(termOfScript(addressScriptHex('bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4')));
  assert.equal(pureText(p2wpkh), 'λo₁ h²⁰. ⟦ o₁ h²⁰ ⟧');
  assert.equal(pureApplicationText(p2wpkh), '(λo₁ h²⁰. ⟦ o₁ h²⁰ ⟧) ⓪ h²⁰');
  const p2pkh = pureForm(termOfScript(addressScriptHex('1Ross5Np5doy4ajF9iGXzgKaC2Q3Pwwxv')));
  assert.equal(pureApplicationText(p2pkh), '(λo₁ o₂ o₃ o₄ h²⁰. ⟦ o₁ o₂ h²⁰ o₃ o₄ ⟧) ⧉ ⌖ ≡ ∇ h²⁰');
});

test('the witness forms are one body at three arguments, not three formats', () => {
  // The Addresses group says this in prose. Under the pure form it is not a
  // resemblance to be argued for: erase the datum's name -- the one place a
  // length or a letter could differ -- and the three bodies are the same string,
  // while the terms above them (which bake their opcode in) are not.
  const shape = (address) => {
    const pure = pureForm(termOfScript(addressScriptHex(address)));
    return pure.body.map((n) => (n === pure.datumName ? '·' : n)).join(' ');
  };
  const witness = ['bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4',
    'bc1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3qccfmv3',
    'bc1p5d7rjq7g6rdk2yhzks9smlaqtedr4dekq08ge8ztwac72sfr9rusxg3297'].map(shape);
  assert.deepEqual(witness, ['o₁ ·', 'o₁ ·', 'o₁ ·']);
  // And the legacy pair, which segwit's one term is the answer to, do not join
  // them: a different shape apiece, and neither is the witness shape.
  const legacy = ['1Ross5Np5doy4ajF9iGXzgKaC2Q3Pwwxv', '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy'].map(shape);
  assert.deepEqual(legacy, ['o₁ o₂ · o₃ o₄', 'o₁ · o₂']);
  assert.equal(new Set([...witness, ...legacy]).size, 3);
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
