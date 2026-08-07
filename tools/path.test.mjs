// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/path.test.mjs — the slash in a name, read as a path. Pure string
// work, so what a filing does to the contents can be pinned offline, the way
// tools/ledger-marks.test.mjs pins which marks an account may wear.
//
// The rules under test are the ones a reader will feel: an old flat name
// keeps working untouched, a group stands where its earliest member stood,
// a row prints only its leaf, and the two restraints — a lone name is not a
// group (and prints exactly as written, which is what makes the rule safe
// over an editor's prose), and two headings with nothing between them are
// one heading. The last two tests read the real editorial layer.
//
//   node --test tools/path.test.mjs

import test from 'node:test';
import assert from 'node:assert/strict';

import { pathSegments, pathLeaf, pathLabel, isPath, pathForest, forestRows } from '../web/btc-path.js';

// A plan, written the way it prints: headings indented, rows by their title.
const plan = (nodes, depth = 0) => nodes.flatMap((n) => (n.kind === 'row'
  ? [`${'  '.repeat(depth)}${n.title}`]
  : [`${'  '.repeat(depth)}[${n.label}]`, ...plan(n.nodes, depth + 1)]));
const of = (...titles) => plan(pathForest(titles.map((title) => ({ title }))));

test('the grammar: trimmed, empties dropped, no escape', () => {
  assert.deepEqual(pathSegments('Coldcard hack/wave 1'), ['Coldcard hack', 'wave 1']);
  assert.deepEqual(pathSegments(' a / b '), ['a', 'b']);
  assert.deepEqual(pathSegments('a//b'), ['a', 'b']);
  assert.deepEqual(pathSegments('/a/'), ['a']);
  assert.deepEqual(pathSegments('Pizza day'), ['Pizza day']);
  assert.deepEqual(pathSegments(''), []);
  assert.deepEqual(pathSegments(null), []);
  assert.equal(pathLeaf('a/b/c'), 'c');
  assert.equal(pathLeaf('Pizza day'), 'Pizza day');
  assert.equal(pathLabel(['a', 'b']), 'a / b');
  assert.equal(isPath('Pizza day'), false);
  assert.equal(isPath('a/b'), true);
  // The grammar itself has no opinion about prose -- the masthead date does
  // split into three segments here. What keeps it whole is the collapse rule
  // below, not an exception: it stands alone, so it is never filed.
  assert.equal(pathSegments('The Times 03/Jan/2009 Chancellor on brink').length, 3);
});

test('a flat name is a path of one, and prints exactly as before', () => {
  assert.deepEqual(of('Pizza day', 'Genesis', 'Taproot'), ['Pizza day', 'Genesis', 'Taproot']);
});

test('a group is a heading, and its rows print their leaf alone', () => {
  assert.deepEqual(of('Coldcard hack/wave 1', 'Coldcard hack/wave 2', 'Coldcard hack/wave 3'), [
    '[Coldcard hack]', '  wave 1', '  wave 2', '  wave 3',
  ]);
});

test('a group stands where its earliest member stood', () => {
  // The contents reads in chain order; a group takes the position of its
  // first row, and its later members come to it rather than the reverse.
  assert.deepEqual(of('Pizza day', 'hack/wave 1', 'Genesis', 'hack/wave 2'), [
    'Pizza day', '[hack]', '  wave 1', '  wave 2', 'Genesis',
  ]);
});

test('any depth, because the rule is recursive', () => {
  assert.deepEqual(of('h/w1/a', 'h/w1/b', 'h/w2/a', 'h/w2/b', 'h/loose'), [
    '[h]', '  [w1]', '    a', '    b', '  [w2]', '    a', '    b', '  loose',
  ]);
});

test('a lone name is not a group, and prints exactly as it was written', () => {
  // Nothing above it has said any part of it, so nothing is respelled --
  // which is what lets an editor's prose carry a slash safely.
  assert.deepEqual(of('Coldcard hack/wave 1', 'Pizza day'), ['Coldcard hack/wave 1', 'Pizza day']);
  assert.deepEqual(of('a/b/c'), ['a/b/c']);
  assert.deepEqual(of('The Times 03/Jan/2009 Chancellor on brink'), ['The Times 03/Jan/2009 Chancellor on brink']);
});

test('two headings with nothing between them are one heading', () => {
  assert.deepEqual(of('h/w1/a', 'h/w1/b'), ['[h / w1]', '  a', '  b']);
  assert.deepEqual(of('h/w1/a', 'h/w1/b', 'h/w2/only'), [
    '[h]', '  [w1]', '    a', '    b', '  w2 / only',
  ]);
});

test('a group can hold both rows and groups, in the order they arrived', () => {
  assert.deepEqual(of('h/loose', 'h/w/a', 'h/w/b', 'h/later'), [
    '[h]', '  loose', '  [w]', '    a', '    b', '  later',
  ]);
});

test('every entry printed exactly once, whatever the filing', () => {
  const titles = ['a', 'b/1', 'b/2', 'c/x/i', 'c/x/ii', 'c/y', 'd/only', 'e'];
  const rows = forestRows(pathForest(titles.map((title) => ({ title }))));
  assert.equal(rows.length, titles.length);
  assert.deepEqual(rows.map((r) => r.entry.title).sort(), [...titles].sort());
});

test('the curated contents files where an editor filed it, and nowhere else', async () => {
  // The real editorial layer, read as the contents reads it. Two claims: the
  // masthead date is never filed, and the only group the curated titles form
  // is the one an editor wrote deliberately. This fails loudly the day a
  // title with a slash lands beside another sharing its first segment.
  const { readFile } = await import('node:fs/promises');
  const yaml = await readFile(new URL('../web/notables.yaml', import.meta.url), 'utf8');
  const titles = [...yaml.matchAll(/^-\s+title:\s*(.+?)\s*$/gm)].map((m) => m[1]);
  assert.ok(titles.length > 50, 'the curated titles did not read');

  const groups = [];
  const walk = (nodes) => nodes.forEach((n) => { if (n.kind === 'group') { groups.push(n.label); walk(n.nodes); } });
  walk(pathForest(titles.map((title) => ({ title }))));
  assert.deepEqual(groups, ['BIP91', 'SegWit', 'Cold Card Attack'],
    'a curated title filed itself by accident — a slash in prose is punctuation, not a path');

  const rows = forestRows(pathForest(titles.map((title) => ({ title }))));
  const masthead = rows.find((r) => r.entry.title.startsWith('The Times'));
  assert.equal(masthead.title, masthead.entry.title, 'the masthead date was respelled');
  assert.match(masthead.title, /^The Times 03\/Jan\/2009 /);
  // …and the three that ARE filed print their leaf under one heading.
  assert.deepEqual(rows.filter((r) => r.entry.title.startsWith('Cold Card Attack')).map((r) => r.title),
    ['wave 1', 'wave 2', 'wave 3']);
});

test('the contents nests first and files the whole listing', async () => {
  const { readFile } = await import('node:fs/promises');
  const toc = await readFile(new URL('../web/bitcoin-contents.html', import.meta.url), 'utf8');
  // A parent travels into its filing with its children attached…
  assert.match(toc, /const filed = pathForest\(nodes, \(n\) => n\.entry\.title\);/,
    'the contents no longer files its listings');
  // …and where the axes meet, filing decides for an entry that has one: a
  // child filed elsewhere is never absorbed, a child filed nowhere follows
  // the entry it cites.
  assert.match(toc, /isChildOf = \(p, c\) => \(fileOf\(c\) === '' \|\| fileOf\(c\) === fileOf\(p\)\)/,
    'citation nesting no longer defers to a filing');
});

test('a name that is also an entry heads its own filing', () => {
  // `SegWit` beside `SegWit/activation`: the entry's own row stands where a
  // bare heading would, and what is filed under it indents beneath — one
  // child is enough, a parent and its child being no kind of heading.
  const forest = pathForest([{ title: 'SegWit' }, { title: 'SegWit/activation' }]);
  assert.equal(forest.length, 1);
  assert.equal(forest[0].kind, 'group');
  assert.equal(forest[0].head.entry.title, 'SegWit');
  assert.equal(forest[0].head.title, 'SegWit');
  assert.deepEqual(forest[0].nodes.map((n) => n.title), ['activation']);
  // Every entry still prints exactly once, the head included.
  assert.deepEqual(forestRows(forest).map((r) => r.entry.title), ['SegWit', 'SegWit/activation']);
});

test('a filing takes the earlier position of its head and its first member', () => {
  // Either may have been written first; the filing stands where the earlier
  // of them stood, so the leaf still reads in chain order.
  const before = pathForest([{ title: 'a' }, { title: 'SegWit/x' }, { title: 'SegWit' }, { title: 'z' }]);
  assert.deepEqual(before.map((n) => n.head?.entry.title ?? n.entry?.title ?? n.label), ['a', 'SegWit', 'z']);
  const after = pathForest([{ title: 'a' }, { title: 'SegWit' }, { title: 'SegWit/x' }, { title: 'z' }]);
  assert.deepEqual(after.map((n) => n.head?.entry.title ?? n.entry?.title ?? n.label), ['a', 'SegWit', 'z']);
});

test('a title that is only slashes is a title of nothing, and still prints', () => {
  // It cannot be filed and it cannot be lost: the row stands, empty-named,
  // exactly as an untitled keep does today.
  const rows = forestRows(pathForest([{ title: '///' }, { title: 'kept' }]));
  assert.equal(rows.length, 2);
  assert.equal(rows[0].title, '');
});
