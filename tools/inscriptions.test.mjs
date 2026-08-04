// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/inscriptions.test.mjs — the envelope reader (web/btc-inscriptions.js):
// an ord inscription read out of a witness's tapscript, and nothing invented
// where the branch breaks its own grammar.
//
//   node --test tools/
//
// Pure byte-work — no WASM, no network: every witness here is composed in the
// test, byte by byte, the way ord composes one.

import test from 'node:test';
import assert from 'node:assert/strict';
import { parseEnvelopes, tapscriptOf, inscriptionInTx, parseCollection } from '../web/btc-inscriptions.js';

const hex = (bytes) => bytes.map((b) => b.toString(16).padStart(2, '0')).join('');
const ascii = (s) => [...s].map((c) => c.charCodeAt(0));
const push = (data) => {
  if (data.length === 0) return [0x00];
  if (data.length <= 0x4b) return [data.length, ...data];
  if (data.length <= 0xff) return [0x4c, data.length, ...data];
  return [0x4d, data.length & 0xff, data.length >> 8, ...data];
};

// The usual reveal script: a key, OP_CHECKSIG, then the envelope riding the
// unexecuted branch behind it.
const KEY = Array.from({ length: 32 }, (_, i) => i);
const scriptWith = (...envelope) => hex([...push(KEY), 0xac, ...envelope.flat()]);
const envelope = ({ fields = [], body = null } = {}) => [
  0x00, 0x63, ...push(ascii('ord')),
  ...fields.flatMap(([tag, value]) => [...push([tag]), ...push(value)]),
  ...(body === null ? [] : [0x00, ...body.flatMap((chunk) => push(chunk))]),
  0x68,
];
const bytes = (hexStr) => Uint8Array.from(hexStr.match(/../g).map((x) => parseInt(x, 16)));

test('a plain envelope reads back: content type, body, in one piece', () => {
  const script = scriptWith(envelope({
    fields: [[1, ascii('text/plain;charset=utf-8')]],
    body: [ascii('Hello, world!')],
  }));
  const envs = parseEnvelopes(bytes(script));
  assert.equal(envs.length, 1);
  assert.equal(envs[0].contentType, 'text/plain;charset=utf-8');
  assert.equal(new TextDecoder().decode(envs[0].body), 'Hello, world!');
});

test('a body of many chunks concatenates in order — a push carries at most 520 bytes, so any real body is many', () => {
  const a = Array.from({ length: 520 }, () => 0x61);
  const b = Array.from({ length: 300 }, () => 0x62);
  const script = scriptWith(envelope({ fields: [[1, ascii('application/octet-stream')]], body: [a, b, ascii('!')] }));
  const [env] = parseEnvelopes(bytes(script));
  assert.equal(env.body.length, 821);
  assert.equal(env.body[0], 0x61);
  assert.equal(env.body[520], 0x62);
  assert.equal(env.body[820], 0x21);
});

test('OP_PUSHDATA1 and OP_PUSHDATA2 spellings read the same as direct pushes', () => {
  // The same 5-byte body pushed three ways; ord writes whichever fits, and
  // the reader must not care.
  const body = ascii('bytes');
  const spellings = [
    [body.length, ...body],
    [0x4c, body.length, ...body],
    [0x4d, body.length, 0x00, ...body],
  ];
  for (const spelled of spellings) {
    const script = hex([...push(KEY), 0xac, 0x00, 0x63, ...push(ascii('ord')),
      ...push([1]), ...push(ascii('text/plain')), 0x00, ...spelled, 0x68]);
    const [env] = parseEnvelopes(bytes(script));
    assert.equal(new TextDecoder().decode(env.body), 'bytes');
  }
});

test('no content type is null, not an empty pretence of one', () => {
  const script = scriptWith(envelope({ body: [ascii('bare')] }));
  const [env] = parseEnvelopes(bytes(script));
  assert.equal(env.contentType, null);
  assert.equal(new TextDecoder().decode(env.body), 'bare');
});

test('a content-encoding field rides tag 9', () => {
  const script = scriptWith(envelope({
    fields: [[1, ascii('text/plain')], [9, ascii('br')]],
    body: [ascii('compressed')],
  }));
  const [env] = parseEnvelopes(bytes(script));
  assert.equal(env.contentEncoding, 'br');
});

test('a script with no envelope reads as nothing — an ordinary spend is not half an inscription', () => {
  assert.equal(parseEnvelopes(bytes(hex([...push(KEY), 0xac]))).length, 0);
  // OP_FALSE OP_IF around something that is not "ord" is somebody else's branch.
  assert.equal(parseEnvelopes(bytes(scriptWith([0x00, 0x63, ...push(ascii('cbrc')), 0x68]))).length, 0);
});

test('a branch that breaks the grammar reads as nothing rather than as half of something', () => {
  // A non-push opcode where a push must stand (OP_DUP amid the body)…
  const broken = hex([0x00, 0x63, ...push(ascii('ord')), ...push([1]), ...push(ascii('text/plain')), 0x00, 0x76, 0x68]);
  assert.equal(parseEnvelopes(bytes(broken)).length, 0);
  // …and an envelope no OP_ENDIF ever closes.
  const unclosed = hex([0x00, 0x63, ...push(ascii('ord')), 0x00, ...push(ascii('body'))]);
  assert.equal(parseEnvelopes(bytes(unclosed)).length, 0);
});

test('two envelopes in one script both read, in script order', () => {
  const script = scriptWith(
    envelope({ fields: [[1, ascii('text/plain')]], body: [ascii('first')] }),
    envelope({ fields: [[1, ascii('text/plain')]], body: [ascii('second')] }),
  );
  const envs = parseEnvelopes(bytes(script));
  assert.equal(envs.length, 2);
  assert.equal(new TextDecoder().decode(envs[0].body), 'first');
  assert.equal(new TextDecoder().decode(envs[1].body), 'second');
});

test('the tapscript is the item before the control block, and the annex is set aside first', () => {
  const script = scriptWith(envelope({ fields: [[1, ascii('text/plain')]], body: [ascii('hi')] }));
  const control = 'c0' + '11'.repeat(32);
  const annex = '50ff';
  assert.equal(hex([...tapscriptOf(['aa'.repeat(64), script, control])]), script);
  assert.equal(hex([...tapscriptOf(['aa'.repeat(64), script, control, annex])]), script);
  // A key-path spend (one item, the signature) carries no script at all.
  assert.equal(tapscriptOf(['aa'.repeat(64)]), null);
  assert.equal(tapscriptOf([]), null);
});

const utf8 = (s) => new TextEncoder().encode(s);

test('a manifest reads out the members it names, in its own order', () => {
  const a = 'a'.repeat(64), b = 'b'.repeat(64);
  const found = parseCollection(utf8(JSON.stringify({
    meta: { name: 'Museum Outdoor', supply: '100' },
    data: [{ id: `${a}i0`, meta: { attributes: { artist: 'MVR' } } }, { id: `${b}i2` }],
  })));
  assert.deepEqual(found.members, [{ txid: a, index: 0 }, { txid: b, index: 2 }]);
});

test("the collection's own words come back apart from the ids it names", () => {
  const a = 'a'.repeat(64);
  const found = parseCollection(utf8(JSON.stringify({
    meta: { name: 'Museum Outdoor', supply: '100', description: 'a claim about the members' },
    data: [{ id: `${a}i0` }],
  })));
  assert.deepEqual(found.meta, { name: 'Museum Outdoor', supply: '100', description: 'a claim about the members' });
  assert.deepEqual(found.members, [{ txid: a, index: 0 }]);
});

test("a member's own editorial matter is not read — the photograph is one fetch away", () => {
  const a = 'a'.repeat(64);
  const found = parseCollection(utf8(JSON.stringify({
    data: [{ id: `${a}i0`, meta: { name: 'SAHK (114', attributes: { artist: 'MVR', location: 'Hong Kong' } } }],
  })));
  assert.deepEqual(Object.keys(found.members[0]), ['txid', 'index']);
});

test('a manifest with no meta reads as one all the same, with nothing to say for itself', () => {
  const a = 'a'.repeat(64);
  assert.deepEqual(parseCollection(utf8(`{"data":[{"id":"${a}i0"}]}`)).meta, {});
});

test('nested meta fields are left to whoever wrote them', () => {
  const a = 'a'.repeat(64);
  const found = parseCollection(utf8(JSON.stringify({
    meta: { name: 'A collection', supply: 100, extra: { nested: 'thing' }, list: [1, 2], nothing: null },
    data: [{ id: `${a}i0` }],
  })));
  // Numbers read as written; objects, arrays and nulls are not flattened.
  assert.deepEqual(found.meta, { name: 'A collection', supply: '100' });
});

test('a body that is not a manifest reads as none — plain JSON is its own content', () => {
  assert.equal(parseCollection(utf8('{"p":"brc-20","op":"deploy","tick":"ordi"}')), null);
  assert.equal(parseCollection(utf8('not json at all')), null);
  assert.equal(parseCollection(utf8('{"data":"not a list"}')), null);
  assert.equal(parseCollection(utf8('{"data":[]}')), null);
  // A data array naming nothing that looks like an inscription id is not one.
  assert.equal(parseCollection(utf8('{"data":[{"id":"nope"},{"id":"beef"}]}')), null);
  assert.equal(parseCollection(Uint8Array.from([0x89, 0x50, 0x4e, 0x47])), null);
});

test('a manifest keeps only the ids it can read, and drops the rest', () => {
  const a = 'a'.repeat(64);
  const found = parseCollection(utf8(JSON.stringify({
    data: [{ id: `${a}i0` }, { id: 'malformed' }, { note: 'no id at all' }],
  })));
  assert.equal(found.members.length, 1);
  assert.equal(found.members[0].txid, a);
});

test('inscriptionInTx walks the inputs and answers with the first envelope and its input', () => {
  const script = scriptWith(envelope({ fields: [[1, ascii('image/png')]], body: [[0x89, 0x50]] }));
  const control = 'c0' + '11'.repeat(32);
  const tx = {
    vin: [
      { witness: ['aa'.repeat(64)] },                    // key path: nothing to read
      { witness: ['aa'.repeat(64), script, control] },   // the reveal
    ],
  };
  const found = inscriptionInTx(tx);
  assert.equal(found.vin, 1);
  assert.equal(found.contentType, 'image/png');
  assert.equal(found.body.length, 2);
  assert.equal(inscriptionInTx({ vin: [{ witness: ['aa'.repeat(64)] }] }), null);
});
