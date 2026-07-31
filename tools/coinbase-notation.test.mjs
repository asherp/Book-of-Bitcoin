// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/coinbase-notation.test.mjs — the coinbase scriptSig's three readings,
// and the guarantee under the newest one: that a post-BIP34 coinbase opens
// with its own height under ■, that nothing after the mark is read as an
// opcode, and that every byte of the miner's margin reaches the page.
//
//   node --test tools/
//
// The byte-level checks run on a bare checkout; the composition checks import
// btc-prose.js, which pulls in the Glossia WASM bundle, so they skip until
// web/glossia.js is built (same convention as the bot's suite).

import test from 'node:test';
import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';

import { splitReadableRuns, findTextRuns, bitsToPrimeFactors, bitsToTargetHex } from '../web/btc-tx.js';

// The counter as it sits on the chain in block 960,281: pushed, four bytes,
// minimal little-endian -- and with three of those four bytes (7e 6b 6a) in
// the printable range, which is what made it lean on the tag beside it.
const EXTRANONCE_PUSH = '04fb7e6b6a';
const EXTRANONCE_VALUE = '1785429755';

const engineBuilt = await access(new URL('../web/glossia.js', import.meta.url)).then(() => true, () => false);
const skipNoEngine = !engineBuilt && 'web/glossia.js not built';

const utf8Hex = (s) => Buffer.from(s, 'utf8').toString('hex');
const joinSegments = (segs) => segs.map((s) => (s.text !== undefined ? utf8Hex(s.text) : s.hex)).join('');

// MARA's tag as it actually sits on the chain: a pipe and a space the pool
// wrote as punctuation (0x7c, 0x20 -- the two bytes a script tokenizer reads
// as OP_SWAP and a 32-byte push), the tag, then binary extranonce.
const MARA_TAG = '| MARA Made in USA \u{1F1FA}\u{1F1F8} |v05';
const MARA_TAIL = utf8Hex(MARA_TAG) + 'a31f' + '636787' + '0000000000' + 'ffffffff';

test('splitReadableRuns accounts for every byte', () => {
  const cases = [
    MARA_TAIL,
    '',
    'ffffffff',                                  // all binary
    utf8Hex('plain readable text'),              // all text
    'ff' + utf8Hex('/slush/') + 'ff',            // text between binary
    utf8Hex('ab') + 'ff' + utf8Hex('cd'),        // runs too short to count as text
    '00'.repeat(64),
  ];
  for (const hex of cases) {
    assert.equal(joinSegments(splitReadableRuns(hex)), hex, `round trip failed for ${hex.slice(0, 24)}…`);
  }
});

test('splitReadableRuns keeps a pool tag whole, punctuation included', () => {
  const segs = splitReadableRuns(MARA_TAIL);
  const texts = segs.filter((s) => s.text !== undefined).map((s) => s.text);
  // The leading pipe and space belong to the tag the pool wrote, not to an
  // instruction: one run, opening at the pipe.
  assert.equal(texts[0], MARA_TAG);
  assert.equal(joinSegments(segs), MARA_TAIL);
});

test('a run shorter than the floor stays in the binary span, not dropped', () => {
  const hex = 'ff' + utf8Hex('ab') + 'ff';       // "ab" is 2 chars, under the 5-char floor
  const segs = splitReadableRuns(hex);
  assert.equal(segs.length, 1);
  assert.equal(segs[0].hex, hex);
  assert.equal(joinSegments(segs), hex);
});

test('findTextRuns still answers what text is in here', () => {
  // The lossy reading is unchanged: the runs, and only the runs.
  assert.deepEqual(findTextRuns(utf8Hex('/slush/') + 'ff'.repeat(8), { segment: false }), ['/slush/']);
});

// ─── the target the preamble restates ──────────────────────────────────

// nBits the chain has actually mined under: genesis, the first adjustment,
// and a spread of later windows down to a recent one.
const REAL_NBITS = [0x1d00ffff, 0x1d00d86a, 0x1c654657, 0x1b04864c, 0x1a05db8b,
  0x181bc330, 0x190fcc72, 0x1715a35c, 0x170355f0, 0x17028c61];

test('a target factors into primes that multiply back to it', () => {
  // The notation writes the target as a product, so the product has to BE the
  // target -- to the last of its 256 bits, not to a rounded scale.
  for (const bits of REAL_NBITS) {
    const factors = bitsToPrimeFactors(bits);
    const product = factors.reduce((acc, [p, k]) => acc * BigInt(p) ** BigInt(k), 1n);
    assert.equal(product, BigInt('0x' + bitsToTargetHex(bits)), bits.toString(16));
    // Ascending, and each factor prime: the reader is owed a canonical form.
    for (let i = 1; i < factors.length; i++) assert.ok(factors[i][0] > factors[i - 1][0], 'primes ascend');
    for (const [p] of factors) {
      for (let d = 2; d * d <= p; d++) assert.notEqual(p % d, 0, `${p} is not prime`);
    }
  }
  // Genesis states the shape plainest: 2²⁰⁸ × (2¹⁶−1), the Fermat primes.
  assert.deepEqual(bitsToPrimeFactors(0x1d00ffff), [[2, 208], [3, 1], [5, 1], [17, 1], [257, 1]]);
  // And the first adjustment moves the odd part entire, 3×5×17×257 → 27701.
  assert.deepEqual(bitsToPrimeFactors(0x1d00d86a), [[2, 209], [27701, 1]]);
});

// ─── composition ───────────────────────────────────────────────────────

// A raw coinbase transaction carrying `scriptSigHex`: one null-prevout input,
// one trivial output, no witness. Enough for composeTransactionFields; the
// amounts and scripts either side of the scriptSig are not what's under test.
function coinbaseTxHex(scriptSigHex) {
  const len = (scriptSigHex.length / 2).toString(16).padStart(2, '0');
  return '01000000'                                    // version
    + '01'                                             // one input
    + '00'.repeat(32) + 'ffffffff'                     // null prevout
    + len + scriptSigHex
    + '00000000'                                       // sequence
    + '01'                                             // one output
    + '0000000000000000'                               // value 0
    + '0151'                                           // scriptPubKey: OP_1
    + '00000000';                                      // locktime
}

// A stand-in encoder: prose that names the exact bytes it was handed, so a
// test can read back what reached the page without building the WASM engine.
const markEncoder = (hex) => ({ prose: `‹${hex}›`, payloadWords: [] });
const encodedHex = (html) => [...html.matchAll(/‹([0-9a-f]*)›/g)].map((m) => m[1]).join('');

// The height push as BIP34 writes it: OP_PUSHBYTES_3 then the height, LE.
const heightPush = (h) => '03' + Buffer.from([h & 0xff, (h >> 8) & 0xff, (h >> 16) & 0xff]).toString('hex');

test('a post-BIP34 coinbase opens with ■height and reads no opcodes after it', { skip: skipNoEngine }, async () => {
  const { composeTransactionFields } = await import('../web/btc-prose.js');
  const { parseTransaction } = await import('../web/btc-tx.js');

  const scriptSig = heightPush(960281) + MARA_TAIL;
  const fields = composeTransactionFields(parseTransaction(coinbaseTxHex(scriptSig)), 1, null, markEncoder);
  const script = fields.inputs[0].script;

  assert.match(script, /■960281/, 'the height is written raw, under its mark');
  // The mark opens the body, so the ■ takes the drop cap and the height reads
  // on from it at one size -- which only holds while the mark leads the line.
  assert.ok(script.startsWith('<span class="op op-blockmark"'), 'the mark leads the body line');
  assert.ok(script.includes('MARA Made in USA'), 'the pool tag is quoted');
  assert.ok(script.includes('|v05'), 'including the punctuation the pool wrote');

  // The bytes the old reading turned into instructions: OP_SWAP for the pipe,
  // a 32-byte push for the space, OP_IF / OP_ELSE / OP_EQUAL for extranonce.
  for (const glyph of ['⇄', '⟨', '│', '☒', '⓪']) {
    assert.ok(!script.includes(glyph), `no ${glyph} — the margin holds no opcodes`);
  }
  assert.ok(!/op-push/.test(script), 'and no push counts — there are no pushes');
});

test('every byte of the miner\'s margin reaches the page', { skip: skipNoEngine }, async () => {
  const { composeTransactionFields } = await import('../web/btc-prose.js');
  const { parseTransaction } = await import('../web/btc-tx.js');

  const scriptSig = heightPush(960281) + MARA_TAIL;
  const fields = composeTransactionFields(parseTransaction(coinbaseTxHex(scriptSig)), 1, null, markEncoder);
  const script = fields.inputs[0].script;

  // What the margin rendered, reassembled: the bytes of the quoted text plus
  // every span that went to prose, in order, is exactly the tail. This is the
  // guarantee the old reading broke -- it emitted a push count and the legible
  // run, and let the rest of that push fall off the page.
  const quoted = [...script.matchAll(/“([^”]*)”/g)].map((m) => m[1]).join('');
  assert.equal(quoted, MARA_TAG, 'the quoted run is the tag, whole');
  assert.equal(utf8Hex(quoted) + encodedHex(script), MARA_TAIL, 'quoted bytes + encoded bytes = the tail');
});

test('a pre-BIP34 coinbase keeps the preamble reading', { skip: skipNoEngine }, async () => {
  const { composeTransactionFields } = await import('../web/btc-prose.js');
  const { parseTransaction } = await import('../web/btc-tx.js');

  // The genesis coinbase: the nBits target push, the extranonce, the headline.
  const scriptSig = '04ffff001d0104455468652054696d65732030332f4a616e2f'
    + '32303039204368616e63656c6c6f72206f6e206272696e6b206f66207365636f6e64206261696c6f757420666f722062616e6b73';
  const fields = composeTransactionFields(parseTransaction(coinbaseTxHex(scriptSig)), 1, null, markEncoder);
  const script = fields.inputs[0].script;

  assert.match(script, /β/, 'the difficulty target still reads under β');
  assert.ok(script.includes('2²⁰⁸3¹5¹17¹257¹'), 'restated as the target it is, in primes');
  assert.ok(script.includes('The Times 03/Jan/2009'), 'and the headline is still quoted');
  assert.ok(!script.includes('■'), 'no height mark — the rule had not been written yet');
});

test('the extranonce reads as a number, and stops leaning on the tag', { skip: skipNoEngine }, async () => {
  const { composeTransactionFields } = await import('../web/btc-prose.js');
  const { parseTransaction } = await import('../web/btc-tx.js');

  const scriptSig = heightPush(960281) + EXTRANONCE_PUSH + MARA_TAIL;
  const fields = composeTransactionFields(parseTransaction(coinbaseTxHex(scriptSig)), 1, null, markEncoder);
  const script = fields.inputs[0].script;

  // η carries its value as a subscript, the one form the mark takes in either era.
  const subscript = EXTRANONCE_VALUE.replace(/\d/g, (d) => '₀₁₂₃₄₅₆₇₈₉'[+d]);
  assert.match(script, new RegExp(`η${subscript}`), 'the counter reads as its own number, subscript');
  // Its printable tail (~kj) was joining the quotation as the counter rolled.
  // Consumed under η, it can't reach the text scan at all.
  const quoted = [...script.matchAll(/“([^”]*)”/g)].map((m) => m[1]).join('');
  assert.equal(quoted, MARA_TAG, 'the quotation is the tag the pool wrote, and nothing else');
  assert.ok(!quoted.includes('~kj'), 'no counter bytes leaning on the tag');

  // Still nothing dropped: height push + extranonce push + tag + binary = all of it.
  assert.equal(
    heightPush(960281) + EXTRANONCE_PUSH + utf8Hex(quoted) + encodedHex(script),
    scriptSig,
    'the marks and the margin reconstruct the whole scriptSig',
  );
});

test('peelExtranonces takes counters and declines tags', { skip: skipNoEngine }, async () => {
  const { peelExtranonces } = await import('../web/btc-prose.js');

  assert.deepEqual(peelExtranonces(EXTRANONCE_PUSH).values, [EXTRANONCE_VALUE]);
  assert.equal(peelExtranonces(EXTRANONCE_PUSH).restHex, '');
  // Two counters in a row (extranonce1 then extranonce2) both come off.
  assert.deepEqual(peelExtranonces('01' + '2a' + '0401020304').values, ['42', '67305985']);
  // A tag opens with a printable byte, which reads as a push far too long.
  assert.deepEqual(peelExtranonces(utf8Hex('/F2Pool/')).values, [], 'a / tag is not a counter');
  assert.deepEqual(peelExtranonces(utf8Hex('MARA')).values, [], 'nor an M tag');
  // A non-minimal push would not reconstruct from its decimal, so it stays bytes.
  assert.deepEqual(peelExtranonces('04' + '01000000').values, [], 'trailing zero byte: not minimal');
  assert.deepEqual(peelExtranonces('04' + '0102').values, [], 'a push claiming more bytes than remain');
  assert.deepEqual(peelExtranonces('').values, []);
});

test('the height window excludes what it must', { skip: skipNoEngine }, async () => {
  const { bip34HeightPush } = await import('../web/btc-prose.js');

  assert.equal(bip34HeightPush(heightPush(960281)).height, 960281);
  assert.equal(bip34HeightPush(heightPush(227931)).height, 227931, 'activation itself');
  assert.equal(bip34HeightPush(heightPush(227930)), null, 'a height before the rule bound');
  assert.equal(bip34HeightPush('04ffff001d' + '0104'), null, 'the pre-BIP34 nBits push is 4 bytes, not 3');
  assert.equal(bip34HeightPush(''), null);
  assert.equal(bip34HeightPush('03'), null, 'a push claiming more bytes than remain');
  assert.equal(bip34HeightPush(heightPush(960281)).restHex, '', 'a height and nothing else');
});
