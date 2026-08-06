// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/path.test.mjs — the slash in a name the reader typed. Pure string
// work, so what a reader's filing does to their contents can be pinned
// offline, the way tools/ledger-marks.test.mjs pins which marks an account
// may wear.
//
// The rules under test are the ones a reader will feel: an old flat name
// keeps working untouched, a group stands where its earliest member stood,
// a row prints only its leaf, and the two restraints — a lone row is not a
// group, and two headings with nothing between them are one heading.
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
  // The title this rule must never be let near, kept here as the reason the
  // callers pass only the reader's own names: an editor's slash is punctuation.
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

test('a lone row is not a group, and keeps its whole name', () => {
  // Dropping the heading must not drop what the heading was saying.
  assert.deepEqual(of('Coldcard hack/wave 1', 'Pizza day'), ['Coldcard hack / wave 1', 'Pizza day']);
  assert.deepEqual(of('a/b/c'), ['a / b / c']);
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

test('the contents files the reader\'s names, and only theirs', async () => {
  const { readFile } = await import('node:fs/promises');
  const toc = await readFile(new URL('../web/bitcoin-contents.html', import.meta.url), 'utf8');
  // Curated entries must never be handed to the forest — see the masthead
  // date above. The titleOf passed in is what enforces it.
  assert.match(toc, /pathForest\(nodes, \(n\) => \(n\.entry\.bookmark \? n\.entry\.title : null\)\)/,
    'the contents files titles that are not the reader\'s own');
  // And filing is the outer axis: a filed keep is not absorbed as the
  // citation-child of a row outside its group, or a group loses a member to
  // an accident of which block the passage sits in.
  assert.match(toc, /const isChildOf = \(p, c\) => fileOf\(p\) === fileOf\(c\)/,
    'citation nesting no longer defers to the reader\'s filing');
});

test('a title that is only slashes is a title of nothing, and still prints', () => {
  // It cannot be filed and it cannot be lost: the row stands, empty-named,
  // exactly as an untitled keep does today.
  const rows = forestRows(pathForest([{ title: '///' }, { title: 'kept' }]));
  assert.equal(rows.length, 2);
  assert.equal(rows[0].title, '');
});
