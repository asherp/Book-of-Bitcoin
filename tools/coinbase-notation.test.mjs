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

import { splitReadableRuns, findTextRuns, looksLikeWriting, bitsToMantissaFactors, bitsToTargetHex, primeFactors } from '../web/btc-tx.js';

// The number as it sits on the chain in block 960,281: pushed, four bytes,
// minimal little-endian -- and with three of those four bytes (7e 6b 6a) in
// the printable range, which is what made it lean on the tag beside it.
//
// The book read it as an extranonce, 1,785,429,755, until the pool template
// builders were read: btccom's server pushes the moment it assembled the
// template directly behind the height, and that number is 2026-07-30 16:42
// UTC -- the day block 960,281 was mined. A counter has no reason to agree
// with the height standing next to it. See tools/coinbase-formats.md.
const TEMPLATE_TIME_PUSH = '04fb7e6b6a';
const TEMPLATE_TIME_VALUE = 1785429755;
const TEMPLATE_TIME_MARK = '2026-07-30 16:42';

// A counter that is plainly a counter: four bytes whose value dates to 1972,
// which no block's clock can be.
const COUNTER_PUSH = '0401020304';
const COUNTER_VALUE = '67305985';

const engineBuilt = await access(new URL('../web/glossia.js', import.meta.url)).then(() => true, () => false);
const skipNoEngine = !engineBuilt && 'web/glossia.js not built';

const utf8Hex = (s) => Buffer.from(s, 'utf8').toString('hex');
const joinSegments = (segs) => segs.map((s) => (s.text !== undefined ? utf8Hex(s.text) : s.hex)).join('');

// A number as the page writes it beside η: primes on the line, powers raised.
const superscript = (s) => String(s).replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[+d]);
const factorProse = (n) => primeFactors(n)
  .map(([p, k]) => String(p) + (k === 1 ? '' : superscript(k))).join('·');

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

// ─── what may be quoted ────────────────────────────────────────────────
//
// A quotation is the book saying someone wrote this. Printable is not enough
// for that -- a counter's bytes are printable better than a third of the time
// -- so a run has to hold a word before it may be quoted.

test('a run of printable entropy is not writing, and is not quoted', () => {
  // Block 960,467, F2Pool: seven printable bytes out of the counter, which the
  // page set in quotation marks as though the pool had written them.
  const junk = 'KXG&`WY';
  assert.ok(!looksLikeWriting(junk), 'no word in it');
  const hex = 'ff' + utf8Hex(junk) + 'ff';
  const segs = splitReadableRuns(hex);
  assert.deepEqual(segs, [{ hex }], 'it stays in the binary span, whole');
  assert.equal(joinSegments(segs), hex, 'and every byte still reaches the page');
  assert.deepEqual(findTextRuns(utf8Hex(junk), { segment: false }), [], 'nor is it text to be found');
});

test('the tags pools actually write are writing', () => {
  // Every tag here is one the chain carries. Four letters together is the bar;
  // three where the run is long enough to be unlikely on its own terms, which
  // is what keeps the all-capital tags.
  for (const tag of ['/Foundry USA Pool #dropgold/', 'Mined by AntPool', ' Mined by Secpool v',
    '/F2Pool/', '/slush/', '/ckpool/', 'OCEAN.XYZ', '/BTC.COM/', '/SBICrypto.com Pool/',
    'viabtc.com deploy', '七彩神仙鱼', MARA_TAG]) {
    assert.ok(looksLikeWriting(tag), `${tag} should read as writing`);
  }
  // And what the rule costs: a tag with no word in it at all reads as prose
  // instead. Nothing is lost but the quotation marks -- the bytes still print.
  assert.ok(!looksLikeWriting('/2cDw/'), 'a wordless tag is not quotable, and says so');
});

test('the word test is worth what it claims', () => {
  // The comment in btc-tx.js puts a number on this: about one random tail in
  // seven is quoted on the floor alone, about one in thirty-seven with the word
  // test. Cheap to check rather than assert, so it is checked -- loosely, since
  // it is a sample. Deterministic across runs: the bytes come from a counter,
  // not from Math.random.
  let seed = 0x9e3779b9;
  const byte = () => {
    seed = (Math.imul(seed ^ (seed >>> 15), 0x85ebca6b) + 0xc0ffee) >>> 0;
    return (seed >>> 24) & 0xff;
  };
  const TAILS = 4000, TAIL_BYTES = 25;
  let floorOnly = 0, withWord = 0;
  for (let i = 0; i < TAILS; i++) {
    let hex = '';
    for (let b = 0; b < TAIL_BYTES; b++) hex += byte().toString(16).padStart(2, '0');
    if (splitReadableRuns(hex, { requireWord: false }).some((s) => s.text !== undefined)) floorOnly++;
    if (splitReadableRuns(hex).some((s) => s.text !== undefined)) withWord++;
  }
  assert.ok(floorOnly > TAILS * 0.08, `floor alone quoted only ${floorOnly}/${TAILS}`);
  assert.ok(withWord * 3 < floorOnly, `the word test should cut it several-fold, got ${withWord}/${floorOnly}`);
});

// ─── the products the page writes: the target, and the nonces ──────────

// nBits the chain has actually mined under: genesis, the first adjustment,
// and a spread of later windows down to a recent one.
const REAL_NBITS = [0x1d00ffff, 0x1d00d86a, 0x1c654657, 0x1b04864c, 0x1a05db8b,
  0x181bc330, 0x190fcc72, 0x1715a35c, 0x170355f0, 0x17028c61];

const product = (factors) => factors.reduce((acc, [p, k]) => acc * p ** BigInt(k), 1n);

// A factorization the reader is owed: ascending, and no base hiding a factor
// of its own. Trial division is only affordable up to the small primes, so
// beyond them the exact factorizations below (each cross-checked against
// coreutils' factor) are what pins primality.
function assertCanonical(factors, what) {
  for (let i = 1; i < factors.length; i++) assert.ok(factors[i][0] > factors[i - 1][0], `primes ascend in ${what}`);
  for (const [p] of factors) {
    for (let d = 2n; d < 1000n && d * d <= p; d++) assert.notEqual(p % d, 0n, `${p} is not prime (${what})`);
  }
}

test('a target is its mantissa in primes, on the shift the header states', () => {
  // The notation writes the target as mantissa × 256ᵉ, so the pair has to BE
  // the target -- to the last of its 256 bits, not to a rounded scale.
  for (const bits of REAL_NBITS) {
    const { factors, shift } = bitsToMantissaFactors(bits);
    assert.equal(product(factors) * 256n ** BigInt(shift), BigInt('0x' + bitsToTargetHex(bits)), bits.toString(16));
    assertCanonical(factors, bits.toString(16));
    // The shift is the header's own byte count, not something derived from the
    // value: nBits' exponent less the three bytes the mantissa occupies.
    assert.equal(shift, (bits >>> 24) - 3, `${bits.toString(16)} shift`);
  }
  // Genesis states the shape plainest: 65535 is 2¹⁶−1, so its mantissa is the
  // Fermat primes, riding twenty-six whole bytes of shift.
  assert.deepEqual(bitsToMantissaFactors(0x1d00ffff), { factors: [[3n, 1], [5n, 1], [17n, 1], [257n, 1]], shift: 26 });
  // And the first adjustment moves the mantissa entire, 65535 → 55402.
  assert.deepEqual(bitsToMantissaFactors(0x1d00d86a), { factors: [[2n, 1], [27701n, 1]], shift: 26 });
});

test('the mantissa is written as short as it goes', { skip: skipNoEngine }, async () => {
  const { mantissaProse } = await import('../web/btc-prose.js');

  // A term goes to whichever is shorter, and to the figure on a tie: 2⁵ and 32
  // are both two characters, so 32; 2¹⁰ is three against 1024's four, so it
  // stands.
  assert.equal(mantissaProse([[2n, 5]]), '32');
  assert.equal(mantissaProse([[3n, 2]]), '9');
  assert.equal(mantissaProse([[2n, 10]]), '2¹⁰');
  assert.equal(mantissaProse([[2n, 22]]), '2²²');

  // Then neighbours merge wherever the product is no longer than the pair. A
  // decimal product never is, so a factorization of plain figures collapses
  // entirely -- genesis' Fermat primes included.
  assert.equal(mantissaProse([[3n, 1], [5n, 1], [17n, 1], [257n, 1]]), '65535');
  assert.equal(mantissaProse([[2n, 1], [27701n, 1]]), '55402');
  assert.equal(mantissaProse([[2n, 4], [3n, 2], [5n, 1], [7n, 1], [19n, 2]]), '1819440');

  // What survives is a power that earns its place: 2²²·3 is four characters
  // against 12582912's eight, so the pair stays a pair.
  assert.equal(mantissaProse([[2n, 22], [3n, 1]]), '2²²·3');

  // And whatever it writes, it is the same number.
  for (const bits of REAL_NBITS) {
    const { factors } = bitsToMantissaFactors(bits);
    const written = mantissaProse(factors);
    const value = written.split('·').reduce((acc, term) => {
      const [base, power] = term.split(/(?=[⁰¹²³⁴⁵⁶⁷⁸⁹])/);
      const k = power ? Number([...power].map((c) => '⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(c)).join('')) : 1;
      return acc * BigInt(base) ** BigInt(k);
    }, 1n);
    assert.equal(value, product(factors), `${bits.toString(16)} writes its own mantissa`);
  }
});

test('a nonce factors too, at any size the chain can write', () => {
  // Nonces off the chain, and the extranonces beside them -- the second kind
  // runs to 8 bytes, past what a double holds, which is why the arithmetic is
  // BigInt throughout. Every expectation here matches `factor(1)`.
  const KNOWN = [
    ['2083236893', [[19n, 1], [97n, 1], [1130351n, 1]]],            // the genesis nonce
    ['2573394689', [[5171n, 1], [497659n, 1]]],                     // block 1
    ['3932395645', [[5n, 1], [19211n, 1], [40939n, 1]]],
    ['2147483647', [[2147483647n, 1]]],                             // a prime nonce stands alone
    ['1785429755', [[5n, 1], [839n, 1], [425609n, 1]]],             // an extranonce from block 960,281
    ['18446744073709551615', [[3n, 1], [5n, 1], [17n, 1], [257n, 1], [641n, 1], [65537n, 1], [6700417n, 1]]],
    ['4', [[2n, 2]]],                                               // an early miner's counter
  ];
  for (const [value, expected] of KNOWN) {
    assert.deepEqual(primeFactors(value), expected, value);
    assert.equal(product(primeFactors(value)), BigInt(value), value);
    assertCanonical(primeFactors(value), value);
  }
  // 0 and 1 are products of nothing, and say so: the mark falls back to the
  // figure rather than printing an empty space where a number belongs.
  assert.deepEqual(primeFactors(0), []);
  assert.deepEqual(primeFactors(1), []);
  // The worst an 8-byte extranonce can be -- two 32-bit primes, where trial
  // division would still be running -- and it still comes back exact.
  assert.deepEqual(primeFactors(4294967291n * 4294967279n), [[4294967279n, 1], [4294967291n, 1]]);
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

// The margin's bytes, read back off what was rendered, in the order it renders
// them: a quoted run is its own UTF-8, a ⓪ⁿ mark is n zero bytes, a prose span
// is the hex it was handed. This is the book's promise performed on its own
// output -- whatever register a byte reached the page in, it comes back.
const fromSuperscript = (s) => Number([...s].map((c) => '⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(c)).join(''));
// A product back to its number, and a number back to n little-endian bytes:
// what η<sup>n</sup> promises is that the pair restores exactly what was
// written, so the test performs the promise rather than trusting it.
const fromProduct = (s) => s.split('·').reduce((acc, term) => {
  const [base, power] = term.split(/(?=[⁰¹²³⁴⁵⁶⁷⁸⁹])/);
  const k = power ? fromSuperscript(power) : 1;
  return acc * BigInt(base) ** BigInt(k);
}, 1n);
// A number back to its bytes: little-endian, minimally encoded, which is what
// makes the figure alone enough. A zero byte closing the run is not in the
// figure -- it left under ⓪ -- so nothing here has to guess a width.
const leBytes = (value) => {
  const out = [];
  for (let v = value; v > 0n; v >>= 8n) out.push(Number(v & 0xffn).toString(16).padStart(2, '0'));
  return out.join('');
};
function marginBytes(html) {
  const out = [];
  const token = /“([^”]*)”|⓪([⁰¹²³⁴⁵⁶⁷⁸⁹]+)|η([0-9][0-9·⁰¹²³⁴⁵⁶⁷⁸⁹]*)|‹([0-9a-f]*)›/g;
  for (let m; (m = token.exec(html));) {
    if (m[1] !== undefined) out.push(utf8Hex(m[1]));
    else if (m[2] !== undefined) out.push('00'.repeat(fromSuperscript(m[2])));
    else if (m[3] !== undefined) out.push(leBytes(fromProduct(m[3])));
    else out.push(m[4]);
  }
  return out.join('');
}

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
  // a 32-byte push for the space, OP_IF / OP_ELSE for extranonce.
  for (const glyph of ['⇄', '⟨', '│', '☒']) {
    assert.ok(!script.includes(glyph), `no ${glyph} — the margin holds no opcodes`);
  }
  assert.ok(!/op-push/.test(script), 'and no push counts — there are no pushes');
  // ⓪ is the one glyph the margin may carry, and only as the zero-run mark:
  // a count of bytes the pool left empty, never an opcode read out of the tail.
  for (const at of [...script.matchAll(/⓪/g)].map((m) => m.index)) {
    assert.match(script.slice(0, at), /op-zeros[^>]*>$/, 'a ⓪ in the margin is the zero-run mark');
  }
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
  assert.equal(marginBytes(script), MARA_TAIL, 'quotation, zero marks and prose = the tail');
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
  assert.ok(script.includes('65535×256²⁶'), 'restated as the target it is: the mantissa, on its byte shift');
  assert.ok(script.includes('The Times 03/Jan/2009'), 'and the headline is still quoted');
  assert.ok(!script.includes('■'), 'no height mark — the rule had not been written yet');
});

test('the template\'s clock reads as the date it is, not as a counter', { skip: skipNoEngine }, async () => {
  const { composeTransactionFields } = await import('../web/btc-prose.js');
  const { parseTransaction } = await import('../web/btc-tx.js');

  const scriptSig = heightPush(960281) + TEMPLATE_TIME_PUSH + MARA_TAIL;
  const fields = composeTransactionFields(parseTransaction(coinbaseTxHex(scriptSig)), 1, null, markEncoder);
  const script = fields.inputs[0].script;

  // The date, in the chapter head's own form -- one kind of thing, one form.
  assert.ok(script.includes(TEMPLATE_TIME_MARK), 'the clock reads as a UTC date and minute');
  assert.ok(script.includes('op-tpltime'), 'and carries the class the notation key finds it by');
  // And nowhere does it claim to be the counter it is not -- neither as the
  // decimal η once carried nor as the product η carries now (1785429755 =
  // 5 · 839 · 425609, which is a date however it is written).
  assert.ok(!script.includes(`η${TEMPLATE_TIME_VALUE}`), 'no counter decimal');
  assert.ok(!script.includes(`η${factorProse(TEMPLATE_TIME_VALUE)}`), 'and no counter product');

  // Its printable tail (~kj) was joining the quotation as the number rolled.
  // Consumed under the mark, it can't reach the text scan at all.
  const quoted = [...script.matchAll(/“([^”]*)”/g)].map((m) => m[1]).join('');
  assert.equal(quoted, MARA_TAG, 'the quotation is the tag the pool wrote, and nothing else');
  assert.ok(!quoted.includes('~kj'), 'no clock bytes leaning on the tag');

  // Still nothing dropped: height push + time push + everything the margin
  // rendered, in whatever register it rendered it, = all of it.
  assert.equal(
    heightPush(960281) + TEMPLATE_TIME_PUSH + marginBytes(script),
    scriptSig,
    'the marks and the margin reconstruct the whole scriptSig',
  );
});

test('a counter still reads under η, before the clock and after it', { skip: skipNoEngine }, async () => {
  const { composeTransactionFields } = await import('../web/btc-prose.js');
  const { parseTransaction } = await import('../web/btc-tx.js');

  // Where a pool leaves the gap second, the counter lands there and there is
  // no clock at all: the reading is what it always was.
  const counterFirst = heightPush(960281) + COUNTER_PUSH + MARA_TAIL;
  const a = composeTransactionFields(parseTransaction(coinbaseTxHex(counterFirst)), 1, null, markEncoder).inputs[0].script;
  assert.ok(a.includes(`η${factorProse(COUNTER_VALUE)}`), 'a counter behind the height reads under η, as its product');
  assert.ok(!a.includes('op-tpltime'), 'and nothing here is a clock');

  // Where the clock comes first, the counter follows it and both marks stand.
  const both = heightPush(960281) + TEMPLATE_TIME_PUSH + COUNTER_PUSH + MARA_TAIL;
  const b = composeTransactionFields(parseTransaction(coinbaseTxHex(both)), 1, null, markEncoder).inputs[0].script;
  assert.ok(b.includes(TEMPLATE_TIME_MARK), 'the clock reads first');
  assert.ok(b.includes(`η${factorProse(COUNTER_VALUE)}`), 'the counter reads after it');
  assert.ok(b.indexOf(TEMPLATE_TIME_MARK) < b.indexOf('η'), 'in the order the bytes carry them');
});

test('a counter nobody pushed still reads as the number it is', { skip: skipNoEngine }, async () => {
  const { composeTransactionFields } = await import('../web/btc-prose.js');
  const { parseTransaction } = await import('../web/btc-tx.js');

  // F2Pool's shape: raw counter, tag, then a second raw counter. Neither is
  // pushed, so neither was ever peeled -- both read as prose until now.
  const counter = 'aa4b5847266057';                      // 7 bytes
  const tail = '070a0102';                               // 4 bytes
  const scriptSig = heightPush(960473) + counter + utf8Hex('\u{1F41F} /F2Pool/') + tail;
  const script = composeTransactionFields(parseTransaction(coinbaseTxHex(scriptSig)), 1, null, markEncoder).inputs[0].script;

  // η with its byte count, then the value as a product -- the same form the
  // header's nonce and the pushed counters take.
  const le = (hex) => BigInt('0x' + (hex.match(/../g).reverse().join('')));
  assert.ok(script.includes(`η${factorProse(le(counter))}`), 'the seven-byte counter reads as its number');
  assert.ok(script.includes(`η${factorProse(le(tail))}`), 'and so does the four-byte one');
  assert.ok(!/η[⁰¹²³⁴⁵⁶⁷⁸⁹]/.test(script), 'one mark for the field, and no width riding it');
  assert.ok(!script.includes('‹' + counter), 'neither reaches the encoder as payload');
  assert.equal(heightPush(960473) + marginBytes(script), scriptSig, 'and the bytes come back');

  // Past eight bytes a run is a commitment or a datum, not a counter, and is
  // left to the prose rather than flattened into a hundred-digit figure.
  const aux = 'fabe6d6d' + 'ab'.repeat(32) + '0400000007000000';
  const withAux = heightPush(960480) + aux + utf8Hex('/F2Pool/') + '1f2e3d4c';
  const auxScript = composeTransactionFields(parseTransaction(coinbaseTxHex(withAux)), 1, null, markEncoder).inputs[0].script;
  assert.ok(auxScript.includes(`‹${aux}›`), 'forty-four bytes stay prose');
  assert.ok(auxScript.includes('η7²·757·34483'), 'the counter after it does not');
  assert.ok(auxScript.includes('0400000007000000'), 'and the commitment keeps its own zero bytes');
  assert.equal(heightPush(960480) + marginBytes(auxScript), withAux);
});

test('a run of zeros reads as its count, not as a paragraph of nothing', { skip: skipNoEngine }, async () => {
  const { composeTransactionFields, splitZeroRuns } = await import('../web/btc-prose.js');
  const { parseTransaction } = await import('../web/btc-tx.js');

  // Byte-aligned by construction: a hex string spells 0000 across the boundary
  // of a0 and 0b, and a run found there would be zeros nobody wrote.
  assert.deepEqual(splitZeroRuns('a0000b'), [{ hex: 'a0000b' }], 'nibbles are not bytes');
  assert.deepEqual(splitZeroRuns('ff' + '00'.repeat(4) + 'ee'),
    [{ hex: 'ff' }, { zeros: 4 }, { hex: 'ee' }]);
  // Under the floor a zero is just a small number inside a counter.
  assert.deepEqual(splitZeroRuns('ff' + '00'.repeat(3) + 'ee'), [{ hex: 'ff000000ee' }]);
  // And the parts put the bytes back, whatever the shape.
  for (const hex of ['', '00'.repeat(8), 'ff' + '00'.repeat(9), '00'.repeat(5) + 'aa' + '00'.repeat(6), 'aabbcc']) {
    assert.equal(splitZeroRuns(hex).map((p) => (p.zeros ? '00'.repeat(p.zeros) : p.hex)).join(''), hex);
  }

  // Block 960,473's shape: F2Pool's tag, a live byte, then the padding that had
  // been reading as two dozen repetitions of the wordlist's first word.
  const scriptSig = heightPush(960473) + 'aa4b5847266057'
    + utf8Hex('\u{1F41F}       /F2Pool/') + '20' + '00'.repeat(30) + '070a0102';
  const script = composeTransactionFields(parseTransaction(coinbaseTxHex(scriptSig)), 1, null, markEncoder).inputs[0].script;

  assert.ok(script.includes('⓪³⁰'), 'thirty zero bytes, under the zero opcode with its count');
  assert.ok(script.includes('op-zeros'), 'and classed so the notation key can find it');
  assert.ok(!script.includes('‹' + '00'.repeat(30)), 'the run never reaches the encoder');
  // Every byte still accounted for: the marks say how many zeros, the quoted
  // signature says its own text, and the prose says the rest.
  assert.equal(
    heightPush(960473) + marginBytes(script),
    scriptSig,
    'marks, signature and prose reconstruct the whole scriptSig',
  );
});

test('a number that disagrees with the height beside it is no clock', { skip: skipNoEngine }, async () => {
  const { templateTimePush } = await import('../web/btc-prose.js');

  assert.equal(templateTimePush(TEMPLATE_TIME_PUSH, 960281).unix, TEMPLATE_TIME_VALUE);
  assert.equal(templateTimePush(TEMPLATE_TIME_PUSH, 960281).restHex, '', 'and the rest is what follows it');
  // The same four bytes under a block from 2013: a 2026 template cannot have
  // built it, so the number goes back to being a counter.
  assert.equal(templateTimePush(TEMPLATE_TIME_PUSH, 250000), null, 'a clock from the wrong era is not this block\'s');
  assert.equal(templateTimePush(COUNTER_PUSH, 960281), null, 'nor is a counter a clock');
  assert.equal(templateTimePush(utf8Hex('/F2Pool/'), 960281), null, 'nor is a tag');
  assert.equal(templateTimePush('04fb7e6b', 960281), null, 'a push claiming more bytes than remain');
});

test('peelExtranonces takes counters and declines tags', { skip: skipNoEngine }, async () => {
  const { peelExtranonces } = await import('../web/btc-prose.js');

  assert.deepEqual(peelExtranonces(COUNTER_PUSH).values, [COUNTER_VALUE]);
  assert.equal(peelExtranonces(COUNTER_PUSH).restHex, '');
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
