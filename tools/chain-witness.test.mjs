// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/chain-witness.test.mjs — the check that keeps the book honest about a
// script it derived.
//
//   node --test tools/chain-witness.test.mjs
//
// addressScriptHex turns an address into a scriptPubKey by arithmetic, and the
// search leaf then shows that script reduced from a term. Both roads start at
// the same decode, so agreeing with each other proves nothing: the page has to
// ask the chain for an output that really carries the bytes. What is testable
// without a network is the reading of the answer -- which record on a page, and
// where on that record the script is -- and the four verdicts, which must stay
// distinct: an unreachable chain has not said yes.

import test from 'node:test';
import assert from 'node:assert/strict';

import { readWitness, witnessVerdict, witnessDisagreement } from '../web/btc-index.js';

const ADDR = '1Ross5Np5doy4ajF9iGXzgKaC2Q3Pwwxv';
const SPK = '76a91404b11d2eb716291f33be29210ee5b2a161c071af88ac';
const paid = (height, txid, extraOuts = 0) => ({
  txid, status: { confirmed: true, block_height: height },
  vout: [...Array(extraOuts).fill({ scriptpubkey: 'ff', scriptpubkey_address: 'someone-else' }),
    { scriptpubkey: SPK, scriptpubkey_address: ADDR }],
  vin: [],
});

test('the oldest record on a newest-first page is the one read', () => {
  // esplora returns newest first, so the reference the page reaches back to is
  // its last record -- the earliest this one request can see.
  const page = [paid(800000, 'c'), paid(700000, 'b'), paid(600000, 'a')];
  const w = readWitness(page, ADDR);
  assert.equal(w.found, true);
  assert.equal(w.txid, 'a');
  assert.equal(w.height, 600000);
  assert.equal(w.script, SPK);
  assert.equal(w.out, 0);
});

test('a short page is the whole confirmed history, and says so', () => {
  // Fewer than a full page means esplora had no more to give, so the oldest
  // record on it really is the first reference -- the one claim worth making.
  assert.equal(readWitness([paid(600000, 'a')], ADDR).whole, true);
  const full = Array.from({ length: 25 }, (_, i) => paid(600000 + i, `t${i}`));
  assert.equal(readWitness(full, ADDR).whole, false, 'a full page may have more behind it');
});

test('the output index is the one that pays, not the first output', () => {
  const w = readWitness([paid(600000, 'a', 2)], ADDR);
  assert.equal(w.out, 2);
  assert.equal(w.script, SPK);
});

test('a record that only drew from the member answers with its prevout', () => {
  // Spending carries the same bytes: the prevout being consumed is the output
  // the chain wrote, so it is the chain's copy exactly as a payment is.
  const spendOnly = {
    txid: 'd', status: { confirmed: true, block_height: 650000 },
    vout: [{ scriptpubkey: 'ff', scriptpubkey_address: 'elsewhere' }],
    vin: [{ prevout: { scriptpubkey: SPK, scriptpubkey_address: ADDR } }],
  };
  const w = readWitness([spendOnly], ADDR);
  assert.equal(w.found, true);
  assert.equal(w.script, SPK);
  assert.equal(w.out, null, 'a spend cites no output of its own');
  assert.equal(w.outputs, 0);
  assert.equal(w.prevouts, 1);
});

test('unconfirmed records are not the chain saying anything', () => {
  const pending = { txid: 'p', status: { confirmed: false }, vout: [{ scriptpubkey: SPK, scriptpubkey_address: ADDR }], vin: [] };
  assert.deepEqual(readWitness([pending], ADDR), { found: false, whole: true, outputs: 0, prevouts: 0, scripts: [] });
  assert.equal(readWitness([], ADDR).found, false);
  // A page whose records never touch the member (esplora would not serve one,
  // but a mirror is not a promise) reads as nothing found rather than as bytes.
  assert.equal(readWitness([paid(600000, 'a')], 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4').found, false);
});

test('a script member matches by its bytes, since it has no name to match by', () => {
  // The Mt. Gox void's shape: a member spelled as raw scriptPubKey hex, which
  // esplora prints no address beside.
  const odd = '76a90088ac';
  const page = [{
    txid: 'x', status: { confirmed: true, block_height: 71036 },
    vout: [{ scriptpubkey: odd }], vin: [],
  }];
  const w = readWitness(page, odd);
  assert.equal(w.found, true);
  assert.equal(w.script, odd);
});

test('every reference on the page is counted, not just the one cited', () => {
  // An address is a name for ONE script, so the check is not a sample: each
  // output paying it and each prevout its spends consumed must carry the same
  // bytes, and the page is already fetched, so all of them are read.
  const spend = (height, txid) => ({
    txid, status: { confirmed: true, block_height: height },
    vout: [{ scriptpubkey: 'ff', scriptpubkey_address: 'elsewhere' }],
    vin: [{ prevout: { scriptpubkey: SPK, scriptpubkey_address: ADDR } },
          { prevout: { scriptpubkey: SPK, scriptpubkey_address: ADDR } }],
  });
  const w = readWitness([spend(800000, 'c'), paid(700000, 'b'), paid(600000, 'a')], ADDR);
  assert.equal(w.outputs, 2, 'two outputs pay it');
  assert.equal(w.prevouts, 2, 'and two spends drew from it');
  assert.deepEqual(w.scripts, [SPK], 'one script, everywhere it is named');
  assert.equal(w.txid, 'a', 'still cited at the earliest reference');
  assert.equal(witnessVerdict(SPK, w), 'agrees');
});

test('one odd output among many is a mismatch, which a sample would miss', () => {
  // The case the widening exists for: the cited reference agrees, and a later
  // one does not. Reading only the first would call this page clean.
  const ODD = '0014' + 'ab'.repeat(20);
  const wrong = {
    txid: 'z', status: { confirmed: true, block_height: 900000 },
    vout: [{ scriptpubkey: ODD, scriptpubkey_address: ADDR }], vin: [],
  };
  const w = readWitness([wrong, paid(600000, 'a')], ADDR);
  assert.equal(w.script, SPK, 'the earliest reference agrees on its own');
  assert.equal(w.scripts.length, 2, 'but the page holds two');
  assert.equal(witnessVerdict(SPK, w), 'differs');
  assert.equal(witnessDisagreement(SPK, w), ODD, 'and the leaf can name the one that does not');
});

test('the four verdicts stay apart, and silence is never assent', () => {
  assert.equal(witnessVerdict(SPK, { found: true, scripts: [SPK] }), 'agrees');
  assert.equal(witnessVerdict(SPK.toUpperCase(), { found: true, scripts: [SPK] }), 'agrees', 'case is not a difference');
  assert.equal(witnessVerdict(SPK, { found: true, scripts: ['0014' + 'ab'.repeat(20)] }), 'differs');
  assert.equal(witnessVerdict(SPK, { found: false }), 'absent', 'no output yet is not a mismatch');
  // The one that matters: a chain nobody could reach has not agreed.
  assert.equal(witnessVerdict(SPK, null), 'unreachable');
  assert.equal(witnessVerdict(SPK, undefined), 'unreachable');
});
