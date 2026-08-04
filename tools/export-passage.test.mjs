// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/export-passage.test.mjs — the Export control on the reading page, and
// the print stylesheet behind it (web/bitcoin-book.html).
//
// The reading page is one large document with no module seam to import, so
// these are static assertions over its source: the wiring either reads
// correctly or it does not. They exist because every failure this feature can
// have is silent — a passage that prints ⋯ where its prose should be, a leaf
// of paper carrying the app's navigation, a colophon that never appears —
// and none of them would fail a build or throw in a console.
//
//   node --test tools/export-passage.test.mjs

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const page = await readFile(new URL('../web/bitcoin-book.html', import.meta.url), 'utf8');

test('the control is in the running head, and only sections show it', () => {
  assert.match(page, /<button type="button" id="page-export"[^>]*class="hidden"/,
    'the export control ships hidden — a leaf must not offer it before a section asks');
  assert.match(page, /#page-export \{[^}]*grid-column: 1;/,
    'it belongs in the cell the chapter stepper vacates on a section page');
  // Shown in exactly one place, hidden in the two that hold no transaction:
  // the leaf and the tombstone. Counted, because a new render path that
  // forgets the button would otherwise leave it showing from the last passage.
  const shows = page.match(/\$\('page-export'\)\.classList\.remove\('hidden'\)/g) || [];
  const hides = page.match(/\$\('page-export'\)\.classList\.add\('hidden'\)/g) || [];
  assert.equal(shows.length, 1, 'exactly one render path reveals the control');
  assert.equal(hides.length, 2, 'the leaf and the tombstone both hide it');
});

test('deferred prose is encoded before anything reaches paper', () => {
  // The one that actually matters. Script and witness pushes are encoded on
  // scroll, so a passage opened and printed straight away would set every
  // push the reader never reached as ⋯ — the mark for prose not yet encoded.
  assert.match(page, /fillAll: \(root\) => \{/, 'lazyEncode exposes a force-encode pass');
  assert.match(page, /lazyEncode\.fillAll\(\$\('page-slide'\)\)/,
    'and the export path calls it over the whole slide');
  // …and for a reader who never touches the button.
  assert.match(page, /addEventListener\('beforeprint'[\s\S]{0,400}lazyEncode\.fillAll/,
    'beforeprint encodes too, so ⌘P prints the same leaf the button does');
});

test('the print stylesheet hides the app and keeps the passage', () => {
  const block = page.slice(page.indexOf('@media print {'));
  assert.ok(block.startsWith('@media print {'), 'the page has a print stylesheet');
  for (const sel of ['.masthead', '.chapter-nav', '.section-nav', '.hash-menu',
    '#page-export', '.hash-bookmark', '.keep-rib']) {
    assert.ok(block.includes(sel), `print leaves ${sel} on the paper`);
  }
  // The carousel clips to one screen and the wrap pads to the viewport;
  // neither idea survives contact with paper, and both would silently
  // truncate or pad the exported passage.
  assert.match(block, /#page-frame \{[^}]*overflow: visible/, 'the carousel clip is released for print');
  assert.match(block, /#ch-totals \{ position: static/, 'the sticky balance line settles');
});

test('the colophon rule outranks the rule that hides it on screen', () => {
  // The bug this pins: #print-colophon is display:none for the screen and
  // display:block inside @media print. Both selectors have the same
  // specificity, so source order alone decides — with the base rule written
  // after the media block, the colophon stays hidden on paper too, and
  // nothing anywhere reports it.
  const base = page.indexOf('#print-colophon { display: none; }');
  const media = page.indexOf('@media print {');
  assert.ok(base !== -1 && media !== -1, 'both rules are present');
  assert.ok(base < media,
    'the screen rule must precede @media print, or it wins there too and the colophon never prints');
});
