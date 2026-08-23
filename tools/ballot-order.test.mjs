// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/ballot-order.test.mjs — the orders the consensus table can be read in
// (web/btc-ballot.js).
//
// The comparator is the part of the sort controls that has a right answer, so
// it is the part that is pinned here rather than asserted over the leaf's
// source. Three things it must get right, and each is silent when wrong: a
// version word is unsigned and sorting it signed looks merely odd; a block's
// timestamp may precede its parent's and ordering by the clock looks merely
// out of order; and a ballot's verdict has to lead the version order or the
// signallers do not gather at all, which looks like a table that sorted.
//
//   node --test tools/ballot-order.test.mjs

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  BALLOT_ORDERS, DEFAULT_SORT, parseBallotSort, ballotSortQuery,
  toggleBallotDir, ballotComparator, orderBallot, isReplay,
} from '../web/btc-ballot.js';

// A block as the table banks one: the height it stands at, the word it was
// written with, and -- on the one ballot read outside that word -- the line
// its miner put in the coinbase.
const blk = (height, version, say) => ({ height, version, say, timestamp: 1_700_000_000 + height * 600 });

// The three readings of a yes, exactly as the leaf derives them.
const bitYes = (bit) => (b) => ((b.version >>> bit) & 1) === 1;
const minYes = (min) => (b) => (b.version >>> 0) >= min;
const coinYes = (text) => (b) => b.say != null && b.say.includes(text);

const heights = (rows) => rows.map((r) => r.height);

test('an unreadable order is the replay, not an error', () => {
  assert.deepEqual(parseBallotSort(''), { by: 'time', dir: 'old' });
  assert.deepEqual(parseBallotSort('sort=sideways'), DEFAULT_SORT);
  assert.deepEqual(parseBallotSort('sort=version&dir=upside-down'), { by: 'version', dir: 'yes' },
    'an unreadable direction falls back within the order the reader did name');
  assert.deepEqual(parseBallotSort(new URLSearchParams('sort=time&dir=new')), { by: 'time', dir: 'new' });
});

test('the order travels in the address, and the replay writes nothing', () => {
  assert.equal(ballotSortQuery(DEFAULT_SORT), '', 'the plain address is already the replay');
  assert.equal(ballotSortQuery({ by: 'version', dir: 'no' }), '&sort=version&dir=no');
  for (const by of Object.keys(BALLOT_ORDERS)) {
    for (const dir of BALLOT_ORDERS[by].dirs) {
      assert.deepEqual(parseBallotSort(ballotSortQuery({ by, dir }).replace(/^&/, '')), { by, dir },
        `${by}/${dir} survives the round trip`);
    }
  }
});

test('a head turns to the other of its two directions', () => {
  assert.equal(toggleBallotDir({ by: 'time', dir: 'old' }), 'new');
  assert.equal(toggleBallotDir({ by: 'time', dir: 'new' }), 'old');
  assert.equal(toggleBallotDir({ by: 'version', dir: 'yes' }), 'no');
  assert.equal(toggleBallotDir({ by: 'version', dir: 'no' }), 'yes');
});

test('time is the order the blocks were written in, which is height and not the clock', () => {
  // A block's timestamp is only loosely bound by consensus: 833 was mined
  // with a clock behind its own parent's. Ordering by it would step the
  // replay backwards.
  const rows = [blk(831, 0x20000000), blk(832, 0x20000000), blk(833, 0x20000000)];
  rows[2].timestamp = rows[1].timestamp - 900;
  const yes = bitYes(1);
  assert.deepEqual(heights(orderBallot(rows, { by: 'time', dir: 'old' }, { yes })), [831, 832, 833]);
  assert.deepEqual(heights(orderBallot(rows, { by: 'time', dir: 'new' }, { yes })), [833, 832, 831]);
});

test('version order gathers the signallers at one end, and the direction says which', () => {
  const bit = 1;
  const rows = [
    blk(10, 0x20000000),          // no
    blk(11, 0x20000002),          // yes
    blk(12, 0x20000000),          // no
    blk(13, 0x20000002),          // yes
  ];
  const opts = { yes: bitYes(bit) };
  assert.deepEqual(heights(orderBallot(rows, { by: 'version', dir: 'yes' }, opts)), [11, 13, 10, 12],
    'signallers first');
  assert.deepEqual(heights(orderBallot(rows, { by: 'version', dir: 'no' }, opts)), [10, 12, 11, 13],
    'holdouts first');
});

test('the verdict leads, so a higher unrelated bit never sorts a no above a yes', () => {
  // The trap the control exists to avoid: 0x30000000 is the larger word but
  // carries nothing at bit 1, and a numeric sort would rank it over a block
  // that actually signalled.
  const rows = [blk(20, 0x30000000), blk(21, 0x20000002)];
  const out = orderBallot(rows, { by: 'version', dir: 'yes' }, { yes: bitYes(1) });
  assert.deepEqual(heights(out), [21, 20], 'the block that said yes leads the one with the bigger word');
});

test('the version word sorts as the unsigned thirty-two bits it is', () => {
  // Bit 31 is set in every BIP9-era version. Compared signed, 0x80000002
  // is negative and would lead the whole side.
  const rows = [blk(30, 0x80000002), blk(31, 0x20000002)];
  const out = orderBallot(rows, { by: 'version', dir: 'yes' }, { yes: bitYes(1) });
  assert.deepEqual(heights(out), [31, 30], '0x20000002 is the smaller word and sorts first');
});

test('a minimum-version ballot reads its yes the same way', () => {
  const rows = [blk(40, 2), blk(41, 4), blk(42, 1), blk(43, 3)];
  const out = orderBallot(rows, { by: 'version', dir: 'yes' }, { yes: minYes(3) });
  assert.deepEqual(heights(out), [43, 41, 42, 40],
    'versions 3 and 4 lead, and each side then reads up its own words');
});

test('a coinbase ballot sorts on the line, and an unread one sorts last among the noes', () => {
  const rows = [
    blk(50, 0x20000000, '/Core/'),
    blk(51, 0x20000000, '/EB8/AD12/'),
    blk(52, 0x20000000, null),
    blk(53, 0x20000000, '/BTC.TOP/'),
  ];
  const out = orderBallot(rows, { by: 'version', dir: 'yes' },
    { yes: coinYes('/EB'), coinbase: true });
  assert.deepEqual(heights(out), [51, 53, 50, 52],
    'the signaller, then the holdouts by their lines, then the coinbase nobody could read');
});

test('every order is total, so choosing one twice never reshuffles a row', () => {
  // Four blocks that tie on the verdict and on the word: only the height
  // separates them, and it must separate them the same way every time.
  const rows = [blk(64, 0x20000002), blk(61, 0x20000002), blk(63, 0x20000002), blk(62, 0x20000002)];
  const opts = { yes: bitYes(1) };
  const once = orderBallot(rows, { by: 'version', dir: 'yes' }, opts);
  const twice = orderBallot(once, { by: 'version', dir: 'yes' }, opts);
  assert.deepEqual(heights(once), [61, 62, 63, 64], 'ties fall back to the height');
  assert.deepEqual(heights(twice), heights(once), 're-sorting a sorted window moves nothing');
});

test('ordering a window leaves the bank it was drawn from alone', () => {
  const rows = [blk(70, 0x20000000), blk(71, 0x20000002)];
  const before = heights(rows);
  orderBallot(rows, { by: 'version', dir: 'no' }, { yes: bitYes(1) });
  assert.deepEqual(heights(rows), before, 'the table banks in fetch order and draws from it repeatedly');
});

test('only the replay is the replay', () => {
  assert.equal(isReplay({ by: 'time', dir: 'old' }), true);
  assert.equal(isReplay({ by: 'time', dir: 'new' }), false, 'reversed, the day heads no longer rule runs');
  assert.equal(isReplay({ by: 'version', dir: 'yes' }), false);
});

test('the comparator is a comparator: it never reports a row unequal to itself', () => {
  const b = blk(80, 0x20000002, '/EB1/');
  for (const by of Object.keys(BALLOT_ORDERS)) {
    for (const dir of BALLOT_ORDERS[by].dirs) {
      const cmp = ballotComparator({ by, dir }, { yes: bitYes(1) });
      assert.equal(cmp(b, b), 0, `${by}/${dir} puts a block level with itself`);
    }
  }
});
