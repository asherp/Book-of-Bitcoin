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
import { readFile } from 'node:fs/promises';
import { parseEnvelopes, tapscriptOf, inscriptionInTx, parseCollection, sniffAsset, witnessAsset,
  inscriptionIdFrom, decodeCbor } from '../web/btc-inscriptions.js';

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
  assert.deepEqual(found.members.map((m) => [m.txid, m.index]), [[a, 0], [b, 2]]);
  assert.deepEqual(found.members[0].attributes, { artist: 'MVR' });
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

test("a member carries the manifest's caption for it — its name and its attributes", () => {
  const a = 'a'.repeat(64);
  const found = parseCollection(utf8(JSON.stringify({
    data: [{ id: `${a}i0`, meta: { name: 'SAHK (114', attributes: { number: 172265, artist: 'MVR', location: 'Hong Kong' } } }],
  })));
  assert.deepEqual(found.members[0], {
    txid: a, index: 0, name: 'SAHK (114',
    attributes: { number: '172265', artist: 'MVR', location: 'Hong Kong' },
  });
});

test('a member with no caption is still a member', () => {
  const a = 'a'.repeat(64);
  const found = parseCollection(utf8(`{"data":[{"id":"${a}i0"}]}`));
  assert.deepEqual(found.members[0], { txid: a, index: 0 });
});

test("a member's nested attributes are left to whoever wrote them", () => {
  const a = 'a'.repeat(64);
  const found = parseCollection(utf8(JSON.stringify({
    data: [{ id: `${a}i0`, meta: { name: { not: 'a string' }, attributes: { artist: 'ROA', tags: ['a', 'b'], deep: { x: 1 } } } }],
  })));
  assert.equal(found.members[0].name, undefined);
  assert.deepEqual(found.members[0].attributes, { artist: 'ROA' });
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

// ── What bytes say they are ───────────────────────────────────────────────

const bytesOf = (...parts) => Uint8Array.from(parts.flatMap((p) =>
  typeof p === 'string' ? [...p].map((c) => c.charCodeAt(0)) : [p]));

test('a format announces itself in its opening bytes', () => {
  for (const [bytes, label] of [
    [bytesOf(0x89, 'PNG\r\n', 0x1a, '\n'), 'PNG image'],
    [bytesOf(0xff, 0xd8, 0xff, 0xe0), 'JPEG image'],
    [bytesOf('GIF89a'), 'GIF image'],
    [bytesOf('RIFF', 0, 0, 0, 0, 'WEBP'), 'WebP image'],
    [bytesOf('RIFF', 0, 0, 0, 0, 'WAVE'), 'WAV audio'],
    [bytesOf('BM', 0, 0, 0, 0), 'BMP image'],
    [bytesOf(0, 0, 0, 0x18, 'ftypavif'), 'AVIF image'],
    [bytesOf(0, 0, 0, 0x18, 'ftypmp42'), 'MP4 video'],
    [bytesOf(0x1a, 0x45, 0xdf, 0xa3), 'WebM video'],
    [bytesOf('OggS'), 'Ogg audio'],
    [bytesOf('ID3', 4, 0), 'MP3 audio'],
    [bytesOf('%PDF-1.7'), 'PDF document'],
    [bytesOf('PK', 3, 4), 'ZIP archive'],
    [bytesOf(0x1f, 0x8b, 8), 'gzip data'],
  ]) {
    assert.equal(sniffAsset(bytes)?.label, label, label);
  }
});

test('text is recognized by reading it, since text has no magic number', () => {
  const u = (s) => new TextEncoder().encode(s);
  assert.equal(sniffAsset(u('<svg viewBox="0 0 1 1"></svg>')).label, 'SVG image');
  assert.equal(sniffAsset(u('<?xml version="1.0"?><svg xmlns="x"/>')).label, 'SVG image');
  assert.equal(sniffAsset(u('<!DOCTYPE html><html></html>')).label, 'HTML');
  assert.equal(sniffAsset(u('{"p":"brc-20","op":"deploy"}')).label, 'JSON');
  assert.equal(sniffAsset(u('  [1, 2, 3]')).label, 'JSON');
  assert.equal(sniffAsset(u('just some words')).label, 'plain text');
  // Braces that do not parse are not JSON, whatever they look like.
  assert.equal(sniffAsset(u('{not json at all')).label, 'plain text');
});

test('bytes that announce nothing are named nothing — a guess is not worth the ink', () => {
  assert.equal(sniffAsset(Uint8Array.from([0x00, 0x01, 0x02, 0x03, 0xfe])), null);
  assert.equal(sniffAsset(new Uint8Array(0)), null);
  assert.equal(sniffAsset(null), null);
});

test('a witness names its asset from the envelope body, with the declaration beside it', () => {
  const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  const script = scriptWith(envelope({ fields: [[1, ascii('image/png')]], body: [png] }));
  const control = 'c0' + '11'.repeat(32);
  const a = witnessAsset(['aa'.repeat(64), script, control]);
  assert.equal(a.label, 'PNG image');
  assert.equal(a.source, 'bytes');
  assert.equal(a.declared, 'image/png');
  assert.equal(a.bytes, 8);
});

test('when the bytes announce nothing the declaration stands, and says whose it is', () => {
  const opaque = [0x00, 0x01, 0x02, 0x03, 0xfe, 0xff];
  const script = scriptWith(envelope({ fields: [[1, ascii('model/gltf-binary')]], body: [opaque] }));
  const a = witnessAsset(['aa'.repeat(64), script, 'c0' + '11'.repeat(32)]);
  assert.equal(a.label, 'model/gltf-binary');
  assert.equal(a.source, 'declaration');
});

test('a declaration the bytes contradict does not overrule them', () => {
  const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  const script = scriptWith(envelope({ fields: [[1, ascii('text/plain')]], body: [png] }));
  const a = witnessAsset(['aa'.repeat(64), script, 'c0' + '11'.repeat(32)]);
  assert.equal(a.label, 'PNG image');       // what the bytes are
  assert.equal(a.declared, 'text/plain');   // what somebody said they are
});

test('an ordinary spend carries no asset — a signature and a key are furniture', () => {
  assert.equal(witnessAsset(['aa'.repeat(64)]), null);                    // key path
  assert.equal(witnessAsset(['30'.repeat(71), '02'.repeat(33)]), null);   // P2WPKH
  assert.equal(witnessAsset([]), null);
  assert.equal(witnessAsset(null), null);
});

test('a bare data item announces itself too, envelope or no envelope', () => {
  const gif = '474946383961' + '00'.repeat(30);   // GIF89a, long enough to be a payload
  assert.equal(witnessAsset(['aa'.repeat(64), gif]).label, 'GIF image');
  // …but not something too short to be one.
  assert.equal(witnessAsset(['aa'.repeat(64), '474946383961']), null);
});

test('a compressed body is not sniffed — unpacking it would be a reading', () => {
  const script = scriptWith(envelope({
    fields: [[1, ascii('text/html')], [9, ascii('br')]],
    body: [[0x1f, 0x8b, 0x08, 0x00, 0x00, 0x00]],
  }));
  const a = witnessAsset(['aa'.repeat(64), script, 'c0' + '11'.repeat(32)]);
  assert.equal(a.label, 'text/html');
  assert.equal(a.source, 'declaration');
  assert.equal(a.encoding, 'br');
});

const jsonWitness = (obj) => {
  const body = typeof obj === 'string' ? obj : JSON.stringify(obj);
  const script = scriptWith(envelope({
    fields: [[1, ascii('application/json')]],
    body: [[...new TextEncoder().encode(body)]],
  }));
  return ['aa'.repeat(64), script, 'c0' + '11'.repeat(32)];
};

test('JSON is called by the name it carries, wherever it carries it', () => {
  const a = 'a'.repeat(64);
  const asset = witnessAsset(jsonWitness({ meta: { name: 'Museum Outdoor' }, data: [{ id: `${a}i0` }] }));
  assert.equal(asset.label, 'Museum Outdoor');
  assert.equal(asset.source, 'name');   // the content's own word, not the bytes'
  assert.equal(asset.mime, 'application/json');
  // At the top, or buried — a name is a name.
  assert.equal(witnessAsset(jsonWitness({ name: 'At the top' })).label, 'At the top');
  assert.equal(witnessAsset(jsonWitness({ a: { b: { c: { name: 'Buried' } } } })).label, 'Buried');
  assert.equal(witnessAsset(jsonWitness({ list: [{ name: 'In a list' }] })).label, 'In a list');
});

test("a document's own name beats one belonging to something it lists", () => {
  // The manifest names itself AND every photograph in it; the shallower name
  // is the document's, and breadth-first is what guarantees it wins.
  const asset = witnessAsset(jsonWitness({
    data: [{ meta: { name: 'the first photograph' } }],
    meta: { name: 'the collection' },
  }));
  assert.equal(asset.label, 'the collection');
});

test('JSON that names nothing goes unnamed rather than being called JSON', () => {
  for (const body of ['{"p":"brc-20","op":"deploy"}', '{"data":[{"id":"nope"}]}', '{"meta":{"name":"  "}}', '[1,2,3]']) {
    const asset = witnessAsset(jsonWitness(body));
    assert.equal(asset.label, null, body);        // nothing to call it…
    assert.equal(asset.mime, 'application/json'); // …but still an asset, and still openable
  }
  // A name field holding a paragraph is not a name.
  assert.equal(witnessAsset(jsonWitness({ name: 'x'.repeat(201) })).label, null);
  // A non-string name is not one either.
  assert.equal(witnessAsset(jsonWitness({ name: 42 })).label, null);
});

test('only JSON is named this way — every other format is named by its bytes', () => {
  const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  const script = scriptWith(envelope({ fields: [[1, ascii('image/png')]], body: [png] }));
  const asset = witnessAsset(['aa'.repeat(64), script, 'c0' + '11'.repeat(32)]);
  assert.equal(asset.label, 'PNG image');
  assert.equal(asset.source, 'bytes');
});

// ── ord's own fields, beyond the content type ─────────────────────────────
// These are composed here byte by byte: no live inscription carrying tag 3 or
// tag 5 turned up in the blocks scanned for this file (95 envelopes in one
// 2023 block, tag 1 alone), so the encodings are exercised against the
// specification rather than against the chain. See tools/ordinals-appendix.md.

test('an inscription id is a reversed txid and a little-endian index', () => {
  const txid = Uint8Array.from(Array.from({ length: 32 }, (_, i) => i + 1));
  const asText = [...txid].reverse().map((b) => b.toString(16).padStart(2, '0')).join('');
  assert.equal(inscriptionIdFrom(txid), `${asText}i0`);                                  // no index bytes = i0
  assert.equal(inscriptionIdFrom(Uint8Array.from([...txid, 1])), `${asText}i1`);
  assert.equal(inscriptionIdFrom(Uint8Array.from([...txid, 0, 1])), `${asText}i256`);
  // Half an id is no id.
  assert.equal(inscriptionIdFrom(txid.slice(0, 31)), null);
  assert.equal(inscriptionIdFrom(Uint8Array.from([...txid, 0, 0, 0, 0, 0])), null);
  assert.equal(inscriptionIdFrom(null), null);
});

test('CBOR reads the shapes a metadata document is made of', () => {
  const b = (...xs) => Uint8Array.from(xs);
  assert.deepEqual(decodeCbor(b(0xa1, 0x64, 0x6e, 0x61, 0x6d, 0x65, 0x64, 0x57, 0x72, 0x65, 0x6e)), { name: 'Wren' });
  assert.equal(decodeCbor(b(0x18, 0x2a)), 42);
  assert.equal(decodeCbor(b(0x20)), -1);
  assert.deepEqual(decodeCbor(b(0x82, 0x01, 0x02)), [1, 2]);
  assert.equal(decodeCbor(b(0xf5)), true);
  assert.equal(decodeCbor(b(0xf4)), false);
  assert.equal(decodeCbor(b(0xf6)), null);
  // Trailing bytes mean this was not a document; a half-read one is no answer.
  assert.equal(decodeCbor(b(0x01, 0x02)), null);
  assert.equal(decodeCbor(b(0xa1, 0x64)), null);
});

test("ord's fields are read by name off the envelope", () => {
  const parent = Array.from({ length: 32 }, (_, i) => i + 1);
  const asText = [...parent].reverse().map((x) => x.toString(16).padStart(2, '0')).join('');
  const cbor = [0xa1, 0x64, 0x6e, 0x61, 0x6d, 0x65, 0x64, 0x57, 0x72, 0x65, 0x6e];   // {name:"Wren"}
  const script = scriptWith(envelope({
    fields: [[1, ascii('image/png')], [3, parent], [5, cbor], [7, ascii('brc-20')]],
    body: [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  }));
  const [env] = parseEnvelopes(bytes(script));
  assert.deepEqual(env.parents, [`${asText}i0`]);
  assert.deepEqual(env.metadata, { name: 'Wren' });
  assert.equal(env.metaprotocol, 'brc-20');
});

test('a child of several parents keeps every one, in the order written', () => {
  const p1 = Array.from({ length: 32 }, () => 0x11);
  const p2 = Array.from({ length: 32 }, () => 0x22);
  const script = scriptWith(envelope({ fields: [[1, ascii('text/plain')], [3, p1], [3, p2]], body: [ascii('hi')] }));
  const [env] = parseEnvelopes(bytes(script));
  assert.equal(env.parents.length, 2);
  assert.equal(env.parents[0], '11'.repeat(32) + 'i0');
  assert.equal(env.parents[1], '22'.repeat(32) + 'i0');
});

test("ord's own metadata outranks a name found inside the content", () => {
  const cbor = [0xa1, 0x64, 0x6e, 0x61, 0x6d, 0x65, 0x64, 0x57, 0x72, 0x65, 0x6e];   // {name:"Wren"}
  const body = [...new TextEncoder().encode(JSON.stringify({ name: 'from the content' }))];
  const script = scriptWith(envelope({ fields: [[1, ascii('application/json')], [5, cbor]], body: [body] }));
  const asset = witnessAsset(['aa'.repeat(64), script, 'c0' + '11'.repeat(32)]);
  assert.equal(asset.label, 'Wren');        // tag 5 is about the inscription…
  assert.equal(asset.source, 'metadata');   // …and says so
  assert.deepEqual(asset.metadata, { name: 'Wren' });
});

test("the handbook's own parent vectors decode to the ids it names", () => {
  // Ordinal Theory Handbook, "Provenance": the parent id is the 32-byte txid
  // followed by the four-byte little-endian index with trailing zeroes
  // omitted, and a txid's text form is its bytes reversed. These three are
  // the handbook's worked examples, verbatim.
  const id = '000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f';
  const serialized = '1f1e1d1c1b1a191817161514131211100f0e0d0c0b0a09080706050403020100';
  const b = (h) => Uint8Array.from(h.match(/../g).map((x) => parseInt(x, 16)));
  assert.equal(inscriptionIdFrom(b(serialized)), `${id}i0`);
  assert.equal(inscriptionIdFrom(b(serialized + 'ff')), `${id}i255`);
  assert.equal(inscriptionIdFrom(b(serialized + '0001')), `${id}i256`);
});

// ─── the control block, as the page sets it ──────────────────────────────

test('the control byte is set as the version BIP341 names, not a shifted one', async () => {
  // renderControlBlock is not exported and its module wants the Glossia WASM,
  // absent from a bare checkout — so the function is read out of the source
  // and run against stubs, the way the book's other page-source tests do.
  const src = await readFile(new URL('../web/btc-prose.js', import.meta.url), 'utf8');
  const fn = /function renderControlBlock\(hex, encode\) \{[\s\S]*?\n\}/.exec(src);
  assert.ok(fn, 'the page no longer renders a control block');
  const witFirst = (h) => parseInt(h.slice(0, 2), 16);
  const dataMark = (s, t) => `<span class="dt" title="${t}">${s}</span>`;
  const render = Function('witFirst', 'dataMark',
    `${fn[0]}\nreturn renderControlBlock;`)(witFirst, dataMark);
  const strip = (h) => h.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  const key = 'ab'.repeat(32);

  // BIP341's leading byte is the leaf version with the output-key parity in
  // its low bit. The version is the byte with that bit masked off — 0xc0 for
  // a tapscript leaf — and it is set in hex because the only reason it is on
  // the page is to be checked against the constant the BIP writes that way.
  assert.equal(strip(render('c0' + key, () => '…')), 'c vc0₀ p …');
  // The parity rides as a subscript and moves the version not at all.
  assert.equal(strip(render('c1' + key, () => '…')), 'c vc0₁ p …');
  // A future leaf version reads as itself rather than as a fraction of itself.
  assert.equal(strip(render('c2' + key, () => '…')), 'c vc2₀ p …');
  // What the render must never be: the top seven bits read as a number of
  // their own (0xc0 >> 1 = 96), which is a value no specification states and
  // nothing a reader could look up.
  assert.ok(!/v96/.test(render('c0' + key, () => '…')), 'the version is shifted right');

  // A single-leaf taptree has an empty path, so its control block ends at the
  // key and no merkle proof is drawn — there is none to draw.
  assert.ok(!/⋔/.test(render('c0' + key, () => '…')), 'a proof is drawn where there is none');
  assert.match(render('c0' + key + 'cd'.repeat(32), () => '…'), /⋔/, 'a sibling hash goes unmarked');
});
