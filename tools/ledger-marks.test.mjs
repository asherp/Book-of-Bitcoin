// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/ledger-marks.test.mjs — whose marks a ledger's table may wear.
//
//   node --test tools/ledger-marks.test.mjs
//
// A ledger's account is its OWN transactions. The reader's bookmarks are kept
// across the whole book, so the account has to decide which of them it may
// show — and the answer is exactly the ones kept ON a transaction the ledger
// has an entry for. The rule this pins is the one the account got wrong: a
// mark used to qualify by sharing a BLOCK with an entry, and a block holds
// thousands of transactions, so readers saw marks in the table that had
// nothing to do with the ledger they were reading.
//
// markIndex is the whole decision, and it is pure: what it does not index
// can never label a row.

import test from 'node:test';
import assert from 'node:assert/strict';

import { markIndex } from '../web/btc-index.js';

const TXID = '14edd9ee8445793c320e92e3b50365a0e18b8b25f424044bce337463f007fdd2';

// One of the ledger's own transactions, kept by its transaction id.
const ON_TXID = { hex: TXID, label: 'transaction id', title: 'The 491-input consolidation',
                  height: 960190, pos: 7 };
// A different transaction in the SAME block — somebody else's passage.
const SAME_BLOCK = { hex: 'a'.repeat(64), label: 'transaction id', title: 'not this ledger’s',
                     height: 960190, pos: 1900 };
// The chapter itself: a block hash carries no section, so it names no
// transaction at all.
const CHAPTER = { hex: 'b'.repeat(64), label: 'block hash', title: 'the chapter', height: 960190, pos: null };
// An output of one of the ledger's transactions: its hex is the script's
// bytes, not a txid, so only its place can name it.
const ON_OUTPUT = { hex: '76a914' + '00'.repeat(20) + '88ac', label: 'output', title: 'the swept output',
                    height: 960190, pos: 7, vout: 0 };

test('a mark kept on the transaction is indexed by its txid', () => {
  const { byTxid } = markIndex([ON_TXID]);
  assert.equal(byTxid.get(TXID)?.title, 'The 491-input consolidation');
});

test('a mark on another transaction in the same block is not the ledger’s', () => {
  const { byTxid, byPlace } = markIndex([ON_TXID, SAME_BLOCK]);
  // The account looks a row up by ITS txid, and by ITS own place. The
  // stranger answers to neither, however close it sits.
  assert.equal(byTxid.get(TXID)?.title, 'The 491-input consolidation');
  assert.equal(byPlace.get('960190:7')?.title, 'The 491-input consolidation');
  assert.notEqual(byPlace.get('960190:1900')?.title, 'The 491-input consolidation');
  assert.equal(byTxid.has('a'.repeat(64)), true);        // indexed, but under its own name
  assert.equal(byPlace.has('960190:1900'), true);        // …and its own place, which no row of this ledger has
});

test('a chapter mark names no transaction, so it is indexed nowhere', () => {
  const { byTxid, byPlace } = markIndex([CHAPTER]);
  assert.equal(byTxid.size, 0);
  assert.equal(byPlace.size, 0);
});

test('an output’s mark is found by place, since its hex is a script', () => {
  const { byTxid, byPlace } = markIndex([ON_OUTPUT]);
  assert.equal(byPlace.get('960190:7')?.title, 'the swept output');
  assert.equal(byTxid.size, 0, 'a script’s bytes must never be read as a txid');
});

test('only 64-hex names are read as transaction ids', () => {
  const { byTxid } = markIndex([
    { hex: 'DEADBEEF', label: 'transaction id', title: 'shouty', height: 1, pos: 0 },
    { hex: 'zz'.repeat(32), label: 'transaction id', title: 'not hex', height: 2, pos: 0 },
  ]);
  assert.equal(byTxid.size, 0);
});
