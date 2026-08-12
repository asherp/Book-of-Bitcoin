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

import { footnoteMark } from '../web/btc-citation.js';
import { readWitness, witnessVerdict, witnessDisagreement, suppliedBy,
         citeHref, footnoteNumberOf } from '../web/btc-index.js';

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
  assert.deepEqual(readWitness([pending], ADDR),
    { found: false, whole: true, outputs: 0, prevouts: 0, scripts: [], opened: null });
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

test('a lock is cited where it was written; its arguments where they were supplied', () => {
  // Two different questions with two different answers. The bytes of a lock are
  // a thing the chain can be asked for, so the earliest output carrying them is
  // a citation. What satisfies that lock is not derivable from those bytes at
  // all -- s and p are not in the address, and no reduction reaches them -- so
  // the only way anyone knows them is that somebody supplied them, and where
  // they did is the only citation that half of the term can have.
  const spend = (height, txid, at = 0) => ({
    txid, status: { confirmed: true, block_height: height },
    vout: [{ scriptpubkey: 'ff', scriptpubkey_address: 'elsewhere' }],
    vin: [...Array(at).fill({ prevout: { scriptpubkey: 'ff', scriptpubkey_address: 'nobody' } }),
      { prevout: { scriptpubkey: SPK, scriptpubkey_address: ADDR } }],
  });
  // Newest first, as esplora serves it: paid at 600000, opened at 700000.
  const w = readWitness([spend(700000, 'open', 2), paid(600000, 'pay')], ADDR);
  assert.equal(w.txid, 'pay', 'the lock is cited where it was written');
  assert.equal(w.height, 600000);
  assert.deepEqual(w.opened, { txid: 'open', height: 700000, in: 2, wn: null, items: [] },
    'and its arguments where they were supplied, at the input that supplied them');
  // The first spend, not the last: a member opened twice is cited at the first.
  const twice = readWitness([spend(800000, 'later'), spend(700000, 'first'), paid(600000, 'pay')], ADDR);
  assert.equal(twice.opened.txid, 'first');
  assert.equal(twice.prevouts, 2, 'both are still counted');
  // Never opened is not the same as never written: a lock with no spend has a
  // citation for itself and none for its arguments, which is the ordinary
  // state of every unspent output on chain.
  assert.equal(readWitness([paid(600000, 'pay')], ADDR).opened, null);
});

test('what a spending input brought, whichever way it carried it', () => {
  const SIG = '30' + '44'.repeat(70);            // 71 bytes, DER-shaped
  const KEY = '02' + 'ab'.repeat(32);            // 33 bytes, compressed
  // Segwit carries the arguments as a stack…
  assert.deepEqual(suppliedBy({ witness: [SIG, KEY] }), [SIG, KEY]);
  // …legacy as a scriptSig, which for a spend is pushes end to end.
  assert.deepEqual(suppliedBy({ scriptsig: '47' + SIG + '21' + KEY }), [SIG, KEY]);
  // Taproot's annex rides last behind a 0x50 and is not an argument: keeping it
  // would make a key-path spend count as two items and read as a script path.
  assert.deepEqual(suppliedBy({ witness: [SIG, '50ff'] }), [SIG]);
  assert.deepEqual(suppliedBy({ witness: ['50ff'] }), ['50ff'], 'alone it is not an annex');
  // A scriptSig that is not pushes end to end brought no list this can name,
  // and guessing which tokens were arguments is not on offer.
  assert.deepEqual(suppliedBy({ scriptsig: '51' + '47' + SIG }), []);
  assert.deepEqual(suppliedBy({}), []);
  assert.deepEqual(suppliedBy({ scriptsig: '' }), []);
});

test('a citation names the coordinate it was read from, not just the page', () => {
  // The two halves of a term are quoted from two different places, and a spend
  // can draw from many inputs at once -- so a citation that stopped at the
  // transaction would send a reader to a page and leave them to find the line.
  // The book resolves an input by its plain vin number (landOnWitness), so
  // nothing here has to know which inputs got footnotes and which did not.
  assert.equal(citeHref('abc', 0), 'bitcoin-book.html?txid=abc&out=0');
  assert.equal(citeHref('abc', undefined, 2), 'bitcoin-book.html?txid=abc&wit=2');
  assert.equal(citeHref('abc'), 'bitcoin-book.html?txid=abc');
  // Zero is a coordinate, not an absence, on both sides.
  assert.match(citeHref('abc', 0, 0), /out=0&wit=0$/);
});

test('a witness reference is a letter, and only a witness has one', () => {
  // The book raises a footnote for an input that carries witness data and for
  // no other, numbered in input order — so the letter is read off the same vins
  // rather than guessed, and a legacy input has no letter because it has no
  // footnote. Not a gap in the citation: a coordinate that does not exist.
  const wit = (items) => ({ witness: items });
  const legacy = { scriptsig: '00' };
  //          0        1              2        3
  const vins = [legacy, wit(['aa']), legacy, wit(['bb'])];
  assert.equal(footnoteNumberOf(vins, 0), null, 'a legacy input raises no footnote');
  assert.equal(footnoteNumberOf(vins, 1), 1, 'the first witness is footnote a');
  assert.equal(footnoteNumberOf(vins, 2), null);
  assert.equal(footnoteNumberOf(vins, 3), 2, 'the second is b, counting footnotes not inputs');
  assert.equal(footnoteNumberOf(vins, 9), null, 'no such input');
  assert.equal(footnoteNumberOf(null, 0), null);
  assert.equal(footnoteNumberOf([wit([])], 0), null, 'an empty witness is not one');
  // The mark itself runs the book's own alphabet, which skips q and continues
  // in bijective base-25 — a, b, … z, aa, ab.
  assert.equal(footnoteMark(1), 'a');
  assert.equal(footnoteMark(25), 'z');
  assert.equal(footnoteMark(26), 'aa');
  assert.equal(footnoteMark(27), 'ab');
  assert.equal(footnoteMark(17), 'r', 'q is skipped, so the 17th letter is r');
});

test('the spend citation carries the footnote its witness raised', () => {
  const SIG = '30' + '44'.repeat(70);
  const opened = (vin) => readWitness([
    { txid: 'open', status: { confirmed: true, block_height: 700000 },
      vout: [{ scriptpubkey: 'ff', scriptpubkey_address: 'elsewhere' }], vin },
    paid(600000, 'pay'),
  ], ADDR).opened;
  // Segwit: our input is the second witness-bearing one, so it is footnote b.
  const w = opened([{ prevout: { scriptpubkey: 'ff' }, witness: [SIG] },
    { prevout: { scriptpubkey: SPK, scriptpubkey_address: ADDR }, witness: [SIG, '02' + 'ab'.repeat(32)] }]);
  assert.equal(w.in, 1);
  assert.equal(w.wn, 2, 'the second footnote, whose mark is b');
  assert.equal(footnoteMark(w.wn), 'b');
  // Legacy: the same spend with a scriptSig raises no footnote at all.
  const l = opened([{ prevout: { scriptpubkey: SPK, scriptpubkey_address: ADDR }, scriptsig: '47' + SIG }]);
  assert.equal(l.wn, null);
  assert.equal(l.items.length, 1, 'and its arguments are read all the same');
});
