// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/ledger-touches.test.mjs — a ledger entry carries the amount that moved.
//
//   node --test tools/ledger-touches.test.mjs
//
// An esplora input has no value of its own; what it spends is on its prevout.
// A transaction that only spends from the address must post a debit, or the
// map posts a bare 0 and stops reconciling with the chain balance.

import test from 'node:test';
import assert from 'node:assert/strict';

import { esploraTouches, buildEntries } from '../web/btc-index.js';

const ADDR = '1Ross5Np5doy4ajF9iGXzgKaC2Q3Pwwxv';
const SPK = '76a91404b11d2eb716291f33be29210ee5b2a161c071af88ac';
const confirmed = { confirmed: true, block_height: 100, block_time: 1 };

test('a spend-only transaction posts its debit, not a bare 0', () => {
  const tx = {
    txid: 'aa', status: confirmed,
    vin: [{ txid: 'bb', vout: 0, prevout: { scriptpubkey: SPK, scriptpubkey_address: ADDR, value: 5000 } }],
    vout: [{ scriptpubkey: 'ff', scriptpubkey_address: 'someone-else', value: 4000 }],
  };
  const entries = buildEntries(esploraTouches([tx], ADDR));
  assert.deepEqual(entries.map((e) => e.sats), [-5000]);
});

test('a receive-and-spend transaction posts credit then debit', () => {
  const tx = {
    txid: 'cc', status: confirmed,
    vin: [{ txid: 'dd', vout: 1, prevout: { scriptpubkey: SPK, scriptpubkey_address: ADDR, value: 7000 } }],
    vout: [{ scriptpubkey: SPK, scriptpubkey_address: ADDR, value: 2000 }],
  };
  const entries = buildEntries(esploraTouches([tx], ADDR));
  assert.deepEqual(entries.map((e) => e.sats), [2000, -7000]);
});
