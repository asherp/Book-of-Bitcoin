// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/coinbase-fields.test.mjs — the coinbase reader's two promises: that it
// reproduces the bytes it read, and that it only claims to have found what
// something in the bytes actually announces.
//
//   node --test tools/
//
// The vectors are assembled here rather than copied off the chain, so each one
// states exactly which rule it exercises. The one piece of real chain data is
// MARA's tag, which arrives from tools/coinbase-notation.test.mjs's record of
// block 960,281 — the case that taught the book a counter's bytes lean on the
// tag beside them.

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  decodeCoinbaseScriptSig, readHeightPush, findCommitments, shapeOf, identifyPool,
  CB_SCRIPTSIG_MAX,
} from './coinbase-fields.mjs';

const utf8Hex = (s) => Buffer.from(s, 'utf8').toString('hex');
const le = (n, bytes) => Array.from({ length: bytes }, (_, i) => Number((BigInt(n) >> BigInt(8 * i)) & 0xffn).toString(16).padStart(2, '0')).join('');
const push = (hex) => (hex.length / 2).toString(16).padStart(2, '0') + hex;

// Block 960,281's height and the four-byte push that follows it there.
const HEIGHT = 960281;
const HEIGHT_PUSH = push(le(HEIGHT, 3));                  // 0319a70e
const TIME_VALUE = 1785429755;                            // ~2026-07-30, and 0x6a6b7efb
const TIME_PUSH = push(le(TIME_VALUE, 4));                // 04fb7e6b6a
const MARA_TAG = '| MARA Made in USA \u{1F1FA}\u{1F1F8} |v05';

const ROOT = 'ab'.repeat(32);
const AUXPOW = 'fabe6d6d' + ROOT + le(4, 4) + le(7, 4);
const RSK = utf8Hex('RSKBLOCK:') + 'cd'.repeat(32);
const HATHOR = utf8Hex('Hath') + 'ef'.repeat(32);

// Every field kind at once, in the order a btcpool-derived template writes
// them: height, template time, pool tag, a merged-mining commitment, then the
// extranonce the miner rolled.
const KITCHEN_SINK = HEIGHT_PUSH + TIME_PUSH + utf8Hex('/BTC.com/') + AUXPOW + 'deadbeef01020304';

test('the fields reproduce the bytes they read', () => {
  const cases = [
    KITCHEN_SINK,
    HEIGHT_PUSH + TIME_PUSH + utf8Hex(MARA_TAG) + 'a31f6367870000000000ffffffff',
    HEIGHT_PUSH + '08' + 'ff'.repeat(8) + utf8Hex('/ckpool/') + 'de',
    HEIGHT_PUSH + RSK + HATHOR,
    HEIGHT_PUSH,
    '',                                   // nothing at all is still nothing lost
    '00',
  ];
  for (const hex of cases) {
    const d = decodeCoinbaseScriptSig(hex, { now: TIME_VALUE });
    assert.equal(d.fields.map((f) => f.hex).join(''), hex, `round trip: ${hex}`);
    assert.ok(d.exact, `exact: ${hex}`);
    let off = 0;
    for (const f of d.fields) { assert.equal(f.offset, off, 'offsets are contiguous'); off += f.hex.length / 2; }
  }
});

test('the height is read as BIP34 writes it, and checked when the height is known', () => {
  assert.equal(readHeightPush(HEIGHT_PUSH).height, HEIGHT);
  assert.equal(readHeightPush(HEIGHT_PUSH, HEIGHT).height, HEIGHT);
  assert.equal(readHeightPush(HEIGHT_PUSH, HEIGHT + 1), null, 'a height that is not the block\'s own is not a height');
  // Past 8,388,607 the push widens to four bytes -- the case the book's own
  // three-byte window deliberately does not take, and this one does.
  assert.equal(readHeightPush(push(le(9_000_000, 4))).height, 9_000_000);
  assert.equal(readHeightPush(utf8Hex('/F2Pool/')), null, 'a tag is not a height');
  assert.equal(readHeightPush('4c05' + le(HEIGHT, 3) + '0000'), null, 'OP_PUSHDATA1 is not BIP34\'s direct push');
});

test('a plausible unix time is a template timestamp only in second position', () => {
  const second = decodeCoinbaseScriptSig(HEIGHT_PUSH + TIME_PUSH + utf8Hex('/BTC.com/'), { now: TIME_VALUE });
  assert.deepEqual(second.fields.map((f) => f.kind), ['height', 'time', 'text']);
  assert.equal(second.fields[1].unix, TIME_VALUE);

  // The same four bytes further along are a counter that happens to fall in the
  // window -- entropy, not a clock, and nothing here may say otherwise.
  const later = decodeCoinbaseScriptSig(HEIGHT_PUSH + utf8Hex('/slush/') + TIME_PUSH, { now: TIME_VALUE });
  assert.ok(!later.fields.some((f) => f.kind === 'time'), 'no timestamp outside the slot that means one');

  // And a counter in the slot whose value predates the genesis block is not a
  // timestamp either.
  const small = decodeCoinbaseScriptSig(HEIGHT_PUSH + push(le(12345, 4)), { now: TIME_VALUE });
  assert.ok(!small.fields.some((f) => f.kind === 'time'));
});

test('a commitment is read only where it announces itself in full', () => {
  const d = decodeCoinbaseScriptSig(HEIGHT_PUSH + AUXPOW + RSK + HATHOR, { now: TIME_VALUE });
  const kinds = d.fields.map((f) => f.kind);
  assert.deepEqual(kinds, ['height', 'auxpow', 'rsk', 'hathor']);

  const aux = d.fields[1];
  assert.equal(aux.root, ROOT);
  assert.equal(aux.merkleSize, 4);
  assert.equal(aux.merkleNonce, 7);
  assert.equal(d.fields[2].rskHashPrefix.length, 40, 'RSKIP110\'s 20-byte hash prefix');
  assert.equal(d.fields[3].auxBlockHash, 'ef'.repeat(32));

  // A magic with its body cut off by the end of the script is not a commitment:
  // the pool wrote 44 bytes or it did not.
  const truncated = HEIGHT_PUSH + 'fabe6d6d' + 'ab'.repeat(20);
  assert.equal(findCommitments(truncated).length, 0);
  const t = decodeCoinbaseScriptSig(truncated, { now: TIME_VALUE });
  assert.ok(!t.fields.some((f) => f.kind === 'auxpow'));

  // 'Hath' is four printable bytes, so it turns up inside ordinary writing.
  // Only dense bytes after it make it Hathor's commitment.
  const prose = HEIGHT_PUSH + utf8Hex('Hathor is a word and so is everything else here!!');
  assert.ok(!decodeCoinbaseScriptSig(prose, { now: TIME_VALUE }).fields.some((f) => f.kind === 'hathor'));
});

test('a misaligned magic is not a magic', () => {
  // fabe6d6d shifted by one byte-half: the hex spells it, the bytes do not.
  assert.equal(findCommitments('00fabe6d6d' + 'ab'.repeat(40)).length, 1, 'byte-aligned at offset 1 is found');
  assert.equal(findCommitments('0fabe6d6d0' + 'ab'.repeat(40)).length, 0, 'nibble-shifted is not');
});

test('a pool is identified by what it wrote, not by bytes that spell it', () => {
  const pools = [{ name: 'ViaBTC', tags: ['/ViaBTC/'] }, { name: 'F2Pool', tags: ['/F2Pool/'] }];
  const tagged = decodeCoinbaseScriptSig(HEIGHT_PUSH + utf8Hex('/ViaBTC/Mined by someone/'), { now: TIME_VALUE });
  assert.equal(identifyPool(tagged, pools).name, 'ViaBTC');

  // The same characters buried in a run too short to be text stay bytes, and a
  // pool is not named by them.
  const buried = decodeCoinbaseScriptSig(HEIGHT_PUSH + '00' + utf8Hex('/Via') + '00', { now: TIME_VALUE });
  assert.equal(identifyPool(buried, pools), null);
  assert.equal(identifyPool(decodeCoinbaseScriptSig(HEIGHT_PUSH, { now: TIME_VALUE }), pools), null);
});

test('the reading reports the bounds it was read under', () => {
  const ok = decodeCoinbaseScriptSig(KITCHEN_SINK, { now: TIME_VALUE });
  assert.ok(ok.withinConsensusBounds, 'the sink fits the hundred bytes consensus allows');
  assert.ok(ok.bip34);

  const overlong = decodeCoinbaseScriptSig(HEIGHT_PUSH + 'ab'.repeat(CB_SCRIPTSIG_MAX), { now: TIME_VALUE });
  assert.ok(!overlong.withinConsensusBounds, 'past 100 bytes it says so rather than reading on');

  // A pre-BIP34 coinbase has no height to find, and the reading says that too
  // instead of taking the first push for one.
  const early = decodeCoinbaseScriptSig('04ffff001d' + '0102', { now: TIME_VALUE });
  assert.ok(!early.bip34);
  assert.ok(early.exact);
});

test('shape groups blocks by house style, not by what the tag says', () => {
  const a = decodeCoinbaseScriptSig(HEIGHT_PUSH + TIME_PUSH + utf8Hex('/ViaBTC/Mined by aaa/') + '01020304', { now: TIME_VALUE });
  const b = decodeCoinbaseScriptSig(HEIGHT_PUSH + TIME_PUSH + utf8Hex('/ViaBTC/Mined by bbb/') + 'aabbccdd', { now: TIME_VALUE });
  assert.equal(shapeOf(a), shapeOf(b), 'one builder, one shape, whoever the worker was');

  const other = decodeCoinbaseScriptSig(HEIGHT_PUSH + '08' + 'ff'.repeat(8) + utf8Hex('/ckpool/'), { now: TIME_VALUE });
  assert.notEqual(shapeOf(a), shapeOf(other), 'tag after the counter is a different house style');
});

test('MARA\'s tag survives the reading whole, punctuation and emoji included', () => {
  const hex = HEIGHT_PUSH + TIME_PUSH + utf8Hex(MARA_TAG) + 'a31f6367870000000000ffffffff';
  const d = decodeCoinbaseScriptSig(hex, { height: HEIGHT, now: TIME_VALUE });
  const text = d.fields.filter((f) => f.kind === 'text').map((f) => f.text).join('');
  assert.ok(text.includes('MARA Made in USA'), 'the pool tag reads as the pool wrote it');
  assert.equal(d.fields[0].height, HEIGHT);
  assert.equal(d.fields[1].unix, TIME_VALUE);
  assert.ok(d.exact);
});
