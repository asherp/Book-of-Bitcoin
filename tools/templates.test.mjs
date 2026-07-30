// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/templates.test.mjs — the notation key's pattern rows against real
// script shapes.
//
//   node --test tools/templates.test.mjs
//
// The filter's failure direction matters more than its hit rate: a script the
// classifier does not recognise must name no row (the reader opens the whole
// key and finds it), and must never name the wrong one. These cases pin both
// ends — the shapes that should be recognised, and the near-misses that must
// not be.

import test from 'node:test';
import assert from 'node:assert/strict';

import { outputTemplates, inputTemplates, transactionTemplates } from '../web/btc-templates.js';

const hex = (...parts) => parts.join('');
const push = (n) => (n <= 0x4b ? n.toString(16).padStart(2, '0') : `4c${n.toString(16).padStart(2, '0')}`);
const data = (n) => 'ab'.repeat(n);
const P = (n) => push(n) + data(n);            // a push of n bytes of filler
const KEY = P(33), KEY65 = P(65), SIG = P(72), H20 = P(20), H32 = P(32);

test('the locks a scriptPubKey carries', () => {
  assert.deepEqual(outputTemplates(hex('76', 'a9', H20, '88', 'ac')), ['p2pkh']);
  assert.deepEqual(outputTemplates(hex('a9', H20, '87')), ['p2sh']);
  assert.deepEqual(outputTemplates(hex('00', H20)), ['p2wpkh']);
  assert.deepEqual(outputTemplates(hex('00', H32)), ['p2wsh']);
  assert.deepEqual(outputTemplates(hex(KEY, 'ac')), ['p2pk']);
  assert.deepEqual(outputTemplates(hex(KEY65, 'ac')), ['p2pk']);
  assert.deepEqual(outputTemplates(hex('6a', P(8))), ['data']);
  // 2-of-3 bare multisig: OP_2 <key><key><key> OP_3 OP_CHECKMULTISIG
  assert.deepEqual(outputTemplates(hex('52', KEY, KEY, KEY, '53', 'ae')), ['multisig']);
  // A Taproot lock is the one cell both Taproot rows share; which path opens
  // it is not written until it is spent, so it names both.
  assert.deepEqual(outputTemplates(hex('51', H32)), ['p2tr-key', 'p2tr-script']);
});

test('a shape the key does not draw names no row', () => {
  assert.deepEqual(outputTemplates(''), []);
  assert.deepEqual(outputTemplates('76a914'), []);                     // truncated push
  assert.deepEqual(outputTemplates(hex('76', 'a9', H32, '88', 'ac')), []);  // P2PKH with a 32-byte hash
  assert.deepEqual(outputTemplates(hex(P(20), 'ac')), []);             // CHECKSIG on a non-key push
  assert.deepEqual(outputTemplates(hex('53', KEY, KEY, '52', 'ae')), []);   // 3-of-2 is not a multisig
  assert.deepEqual(outputTemplates(hex('52', KEY, H20, KEY, '53', 'ae')), []);  // a non-key among the keys
});

test('the spends an input reveals', () => {
  const spend = (o) => inputTemplates({ txid: 'ff'.repeat(32), vout: 0, scriptSig: '', witness: [], ...o });
  assert.deepEqual(spend({ scriptSig: hex(SIG, KEY) }), ['p2pkh']);
  assert.deepEqual(spend({ scriptSig: SIG }), ['p2pk']);
  // P2SH revealing a 2-of-3 redeem script names the plain row and the 2-of-3 one.
  const redeem = hex('52', KEY, KEY, KEY, '53', 'ae');
  assert.deepEqual(spend({ scriptSig: hex('00', SIG, SIG, push(redeem.length / 2), redeem) }),
    ['p2sh', 'p2sh-multisig']);
  // P2SH revealing something else stays on the plain row.
  assert.deepEqual(spend({ scriptSig: hex(SIG, push(5), data(5)) }), ['p2sh']);
  // Witness spends.
  assert.deepEqual(spend({ witness: [data(72), data(33)] }), ['p2wpkh']);
  assert.deepEqual(spend({ witness: [data(64)] }), ['p2tr-key']);
  assert.deepEqual(spend({ witness: [data(65)] }), ['p2tr-key']);
  assert.deepEqual(spend({ witness: [data(72), 'c0' + data(32) + data(32)] }), ['p2tr-script']);   // control block, one level
  assert.deepEqual(spend({ witness: [data(72), 'c1' + data(32)] }), ['p2tr-script']);          // single-leaf tree, odd parity
  assert.deepEqual(spend({ witness: ['', data(72), data(72), redeem] }), ['p2wsh']);
  // A coinbase unlocks nothing -- there is no prevout to open.
  assert.deepEqual(inputTemplates({ txid: '0'.repeat(64), vout: 0xffffffff, scriptSig: '03abcdef', witness: [] }), []);
});

test('Lightning answers as a table, and only for a shape that is its own', () => {
  const witnessSpend = (script) => transactionTemplates({
    vin: [{ txid: 'ff'.repeat(32), vout: 0, scriptSig: '', witness: [data(72), script] }], vout: [],
  });
  // to_remote: <key> CHECKSIGVERIFY 1 CSV
  const toRemote = hex(KEY, 'ad', '51', 'b2');
  assert.ok(witnessSpend(toRemote).has('lightning'), 'to_remote should open the table');
  assert.ok(witnessSpend(toRemote).has('ln-to-remote'));
  // to_local: IF <revocation> ELSE <delay> CSV DROP <local> ENDIF CHECKSIG
  const toLocal = hex('63', KEY, '67', P(2), 'b2', '75', KEY, '68', 'ac');
  assert.ok(witnessSpend(toLocal).has('lightning'), 'to_local should open the table');
  // anchor: <key> CHECKSIG IFDUP NOTIF 16 CSV ENDIF
  const anchor = hex(KEY, 'ac', '73', '64', '60', 'b2', '68');
  assert.ok(witnessSpend(anchor).has('lightning'), 'anchor should open the table');
  // A funding 2-of-2 is a shape that belongs to no protocol in particular: it
  // reads as P2WSH and claims no channel.
  const funding = hex('52', KEY, KEY, '52', 'ae');
  const f = witnessSpend(funding);
  assert.ok(f.has('p2wsh'));
  assert.ok(!f.has('lightning'), 'a bare 2-of-2 must not be read as a channel');
});

test('a transaction names every template it puts on the page', () => {
  const t = transactionTemplates({
    vin: [{ txid: 'ff'.repeat(32), vout: 0, scriptSig: hex(SIG, KEY), witness: [] }],
    vout: [{ scriptPubKey: hex('00', H20) }, { scriptPubKey: hex('6a', P(8)) }],
  });
  assert.deepEqual([...t].sort(), ['data', 'p2pkh', 'p2wpkh']);
  // The genesis coinbase: one P2PK output, and an input that opens nothing.
  const genesis = transactionTemplates({
    vin: [{ txid: '0'.repeat(64), vout: 0xffffffff, scriptSig: '04ffff001d0104', witness: [] }],
    vout: [{ scriptPubKey: hex(KEY65, 'ac') }],
  });
  assert.deepEqual([...genesis], ['p2pk']);
});
