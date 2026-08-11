// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/address-form.test.mjs — the book's address format, and the one property
// the whole of it rests on.
//
//   node --test tools/address-form.test.mjs
//
// The claim is that a script spelled in sigla resolves to Script and to nothing
// else. That is only true while the alphabet is a bijection whose marks cannot
// be mistaken for prose, so the first test checks exactly that, over the whole
// table rather than over a sample: 110 opcodes, 110 distinct glyphs, no ASCII
// letter and no space in any of them. Everything below is downstream of it.
//
// The datum's leg is Glossia's own and needs the WASM build, which a bare
// checkout has not got. So the tests inject a stand-in codec: the structure --
// which marks, which lengths, which push forms, and that a mistyped datum is
// refused rather than read as another output -- is entirely testable without an
// engine, and it is the structure this module is responsible for.

import test from 'node:test';
import assert from 'node:assert/strict';

import { OPCODE_SYMBOLS, OPCODE_NAMES } from '../web/btc-sigla.js';
import { addressScriptHex } from '../web/btc-index.js';
import { spell, spellHtml, read, scan, looksSpelled, isWholeScript, scriptFault,
         parseMark, OPCODE_OF_GLYPH } from '../web/btc-address-form.js';

// A stand-in for Glossia: each byte becomes one word carrying it. Nothing about
// the real prose is being tested here -- only that the format hands the engine a
// byte count and gets that many bytes back.
const WORDS = 'alpha bravo charlie delta echo foxtrot golf hotel india juliet'.split(' ');
const say = (hex) => hex.match(/../g).map((b) => `${WORDS[parseInt(b, 16) % 10]}-${b}`).join(' ');
const hear = (prose, n) => {
  const hex = prose.split(/\s+/).map((w) => w.split('-')[1] ?? '').join('');
  return hex.length === n * 2 ? hex : null;
};

test('the alphabet is a bijection, and none of it can pass for prose', () => {
  const glyphs = Object.values(OPCODE_SYMBOLS);
  assert.equal(glyphs.length, 110, 'the opcode table changed size');
  assert.equal(new Set(glyphs).size, glyphs.length, 'two opcodes share a glyph');
  assert.equal(OPCODE_OF_GLYPH.size, glyphs.length, 'the inverse lost an entry');
  assert.equal(Object.keys(OPCODE_NAMES).length, glyphs.length, 'a named opcode has no glyph');
  for (const g of glyphs) {
    assert.ok(!/[A-Za-z]/.test(g), `${g} holds an ASCII letter, which prose is made of`);
    assert.ok(!/\s/.test(g), `${g} holds a space, so it is not one token`);
    assert.equal(parseMark(g), null, `${g} reads as a push mark`);
  }
});

test('every opcode spells and reads back', () => {
  for (const [code, glyph] of Object.entries(OPCODE_SYMBOLS)) {
    const hex = Number(code).toString(16).padStart(2, '0');
    const spelled = spell(hex, { say });
    assert.equal(spelled.text, glyph, `${OPCODE_NAMES[code]} spells wrong`);
    assert.equal(spelled.complete, true);
    assert.equal(read(spelled.text, { hear }), hex, `${OPCODE_NAMES[code]} does not read back`);
  }
});

test('every address form spells and resolves to the very bytes it decodes to', () => {
  const addresses = [
    '1Ross5Np5doy4ajF9iGXzgKaC2Q3Pwwxv',
    '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy',
    'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4',
    'bc1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3qccfmv3',
    'bc1p5d7rjq7g6rdk2yhzks9smlaqtedr4dekq08ge8ztwac72sfr9rusxg3297',
  ];
  for (const address of addresses) {
    const script = addressScriptHex(address);
    const spelled = spell(script, { say });
    assert.ok(spelled.complete, `${address} spells incompletely`);
    assert.ok(looksSpelled(spelled.text), `${address}'s spelling is not recognised as one`);
    assert.equal(read(spelled.text, { hear }), script, `${address} does not resolve`);
  }
  // The mark leads with the datum's letter and its count, which is what the
  // decoder is told; the letter is legibility and the count is the length field.
  assert.match(spell(addressScriptHex(addresses[0]), { say }).text, /^⧉ ⌖ h²⁰ /);
  assert.match(spell(addressScriptHex(addresses[4]), { say }).text, /^① p³² /);
});

test('a script no address can write spells like any other', () => {
  // The format needs no version byte, so it has nothing to refuse. A bare
  // 2-of-3 multisig has no address at all, and a malformed lock -- the shape
  // the book shelves the Mt. Gox void by -- has no pattern either.
  const key = (b) => '21' + b.repeat(66);
  for (const script of ['52' + key('a') + key('b') + key('c') + '53ae', '76a90088ac', '6a0548656c6c6f']) {
    const spelled = spell(script, { say });
    assert.ok(spelled?.complete, script);
    assert.equal(read(spelled.text, { hear }), script, script);
  }
});

test('the push forms stay apart, since they are different scripts', () => {
  const data = 'ab'.repeat(20);
  const direct = '14' + data;                  // OP_PUSHBYTES_20
  const viaOne = '4c14' + data;                // OP_PUSHDATA1 20
  const viaTwo = '4d1400' + data;              // OP_PUSHDATA2 20, little-endian
  assert.equal(spell(direct, { say }).text.split(' ')[0], 'h²⁰');
  assert.equal(spell(viaOne, { say }).text.split(' ')[0], 'h↧²⁰');
  assert.equal(spell(viaTwo, { say }).text.split(' ')[0], 'h⇊²⁰');
  for (const script of [direct, viaOne, viaTwo]) {
    assert.equal(read(spell(script, { say }).text, { hear }), script, script);
  }
  // A zero-length push says itself and asks for no prose.
  assert.equal(spell('4c00', { say }).text, '↧⁰');
  assert.equal(read('↧⁰', { hear }), '4c00');
});

test('what has no spelling, and what does not read', () => {
  assert.equal(spell('76a914ab', { say }), null, 'a truncated push is not a script');
  assert.equal(spell('', { say }), null);
  // 0xbb and up are bytes consensus has never given a meaning, so the alphabet
  // has no mark for them and the format has nothing to write. (0xba is
  // OP_CHECKSIGADD and does: the line moves as tapscript defines opcodes.)
  assert.equal(spell('bb', { say }), null, 'an undefined byte is not a mark');
  assert.ok(spell('ba', { say }), 'but a defined one is');
  // Without the engine a datum cannot be said, and the half-spelling says so
  // rather than passing itself off as an address.
  const bare = spell('76a914' + 'ab'.repeat(20) + '88ac');
  assert.equal(bare.complete, false);
  assert.equal(bare.text, '⧉ ⌖ h²⁰ ≡ ∇');
  assert.equal(read(bare.text, { hear }), null, 'a mark with no prose resolves to nothing');
  // Prose where no push is open is not prose.
  assert.equal(scan('⧉ ⌖ garment ≡ ∇'), null);
  assert.equal(scan(''), null);
  // And a datum that decodes to the wrong length is an error, never another
  // output: the count on the mark is checked against what came back.
  const spelled = spell('14' + 'ab'.repeat(20), { say });
  const short = () => 'ab'.repeat(19);
  assert.equal(read(spelled.text, { hear: short }), null);
});

test('no other form the search box takes answers to this one', () => {
  // The grammar admits a spelled script beside heights, hashes, citations and
  // addresses, so the shapes have to stay disjoint -- none of the others can
  // hold a glyph or a push mark, which is what makes that free.
  for (const q of ['0', '840000', '-1', 'a'.repeat(64), 'III β2 ■5', 'I β29 ■596 §85',
    'v1b29c596s85', '1Ross5Np5doy4ajF9iGXzgKaC2Q3Pwwxv',
    'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4', 'script:76a90088ac', '']) {
    assert.equal(looksSpelled(q), false, `${q} reads as a spelled script`);
  }
});

test('bare hex is a lock unless the grammar already spends that shape', () => {
  // Any byte string is a scriptPubKey by consensus, so the exclusions are not
  // "this is not a script" -- they are "this is already something else here",
  // and there are two.
  //
  // The one that matters is a height. Not the toy cases: these are the block
  // numbers a reader actually types, and every one of them is even-length hex
  // that tokenizes as a clean script.
  for (const height of ['840000', '500000', '630000', '210000', '0', '57043']) {
    assert.equal(isWholeScript(height), false, `${height} is a height, not a lock`);
  }
  // And an id, where the cost of giving it up is nothing: no term is 32 bytes,
  // so only a nonstandard lock of that exact size loses its bare spelling.
  assert.equal(isWholeScript('a'.repeat(64)), false);
  assert.equal(isWholeScript('6a1e' + 'ab'.repeat(30)), false, 'a 32-byte OP_RETURN keeps the prefix');

  // Everything else the grammar takes is ASCII, base58 or bech32, and cannot
  // read as hex at all.
  for (const q of ['-1', 'III β2 ■5', 'I β29 ■596 §85', 'v1b29c596s85',
    '1Ross5Np5doy4ajF9iGXzgKaC2Q3Pwwxv', 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4',
    'script:76a90088ac', '']) {
    assert.equal(isWholeScript(q), false, `${q} is not hex`);
  }

  // What it does take: every lock that binds a term, and the nonstandard ones
  // that do not -- including the book's own script member, the Mt. Gox void,
  // which is the whole reason a raw scriptPubKey is a name at all.
  assert.equal(isWholeScript('76a90088ac'), true, 'the Mt. Gox void reads bare');
  for (const address of ['1Ross5Np5doy4ajF9iGXzgKaC2Q3Pwwxv',
    'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4',
    'bc1p5d7rjq7g6rdk2yhzks9smlaqtedr4dekq08ge8ztwac72sfr9rusxg3297']) {
    assert.equal(isWholeScript(addressScriptHex(address)), true, address);
  }
  // Bytes that are not a whole script are still refused: a push claiming more
  // than remains is not a lock, whatever else it might be.
  assert.equal(isWholeScript('76a914ab'), false, 'a truncated push is not a script');
  assert.equal(isWholeScript('7'), false, 'nor half a byte');
  // But 76a9 is a whole script -- OP_DUP OP_HASH160, going nowhere. Nonsense is
  // not the test; a push claiming bytes that are not there is.
  assert.equal(isWholeScript('76a9'), true);
});

test('the two renderings of a spelling never drift', () => {
  // One walk over the tokens feeds both, so stripping the markup off the marks
  // must give back the string exactly. A page that set one and a test that
  // checked the other would be checking nothing.
  const strip = (html) => html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  for (const script of ['76a90088ac', '6a0548656c6c6f', '52' + '21' + 'ab'.repeat(33) + '52ae',
    addressScriptHex('1Ross5Np5doy4ajF9iGXzgKaC2Q3Pwwxv'),
    addressScriptHex('bc1p5d7rjq7g6rdk2yhzks9smlaqtedr4dekq08ge8ztwac72sfr9rusxg3297')]) {
    assert.equal(strip(spellHtml(script, { say })), spell(script, { say }).text, script);
    assert.equal(strip(spellHtml(script)), spell(script).text, `${script}, unsaid`);
  }
  assert.equal(spellHtml('76a914ab'), null, 'what has no spelling has no marks either');
});

test('hex that is not a script says where it stops being one', () => {
  // What a dev pasting bytes actually wants: not "invalid", but where.
  assert.equal(scriptFault(addressScriptHex('1Ross5Np5doy4ajF9iGXzgKaC2Q3Pwwxv')), null);
  assert.equal(scriptFault('76a90088ac'), null, 'the Mt. Gox void is well formed');
  assert.equal(scriptFault('51'), null, 'and so is a bare OP_1');

  // A push claiming more than remains: the bytes cannot be parsed at all.
  assert.deepEqual(scriptFault('76a914ab'), { reason: 'truncated', at: 2, remain: 2 });
  assert.deepEqual(scriptFault('4c'), { reason: 'truncated', at: 0, remain: 1 });

  // Well formed, but holding a byte consensus never defined -- it parses, and
  // no spend could satisfy it, which is a different answer and worth saying.
  assert.deepEqual(scriptFault('deadbeef'), { reason: 'undefined', at: 0, byte: 0xde });
  assert.deepEqual(scriptFault('76bb'), { reason: 'undefined', at: 1, byte: 0xbb },
    'the offset counts bytes, not tokens');
  // …and the offset counts a push's data too, not just its opcode.
  assert.deepEqual(scriptFault('0114bb'), { reason: 'undefined', at: 2, byte: 0xbb });

  assert.deepEqual(scriptFault(''), { reason: 'empty', at: 0 });
  assert.deepEqual(scriptFault('7'), { reason: 'not-bytes', at: 0 });
  assert.deepEqual(scriptFault('zz'), { reason: 'not-bytes', at: 0 });
});
