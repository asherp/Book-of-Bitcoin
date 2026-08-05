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

test('the mark flies at the section title, and only a section gets one', () => {
  // It lives inside #section-title rather than in the running head, which is
  // what makes it level with the bookmark ribbon by construction: one
  // positioned host, a mark at each corner, nothing measured.
  assert.match(page, /function printMarkOf\(el\) \{/, 'find-or-create, as ribbonOf is');
  assert.match(page, /el\.querySelector\(':scope > #page-export'\)/,
    'found as a child of its host, so a re-render cannot leave two');
  assert.match(page, /#page-export \{[^}]*position: absolute;[^}]*left: 0;/,
    'flown at the left corner');
  // The ribbon's own offsets, so "level with the bookmark" is a shared fact
  // rather than two numbers that could drift apart.
  const boxOf = (sel) => (page.match(new RegExp(`\\${sel} \\{([^}]*)\\}`)) || [])[1] || '';
  const ribTop = /top: (-?\d+px)/.exec(boxOf('.hash-bookmark'))?.[1];
  const markTop = /top: (-?\d+px)/.exec(boxOf('#page-export'))?.[1];
  assert.ok(ribTop && markTop, 'both marks state a top offset');
  assert.equal(markTop, ribTop, 'the printer sits level with the ribbon');

  // Attached from exactly one render path -- the section's. A leaf and a
  // tombstone rebuild the title from scratch, which is how they come to have
  // no offer to print; an explicit hide would be a second thing to keep right.
  const attaches = page.match(/setPrintMark\(sectionTitle\)/g) || [];
  assert.equal(attaches.length, 1, 'one render path flies the mark');
  assert.ok(!/\$\('page-export'\)\.classList\.(add|remove)\('hidden'\)/.test(page),
    'nothing hides it by hand -- it exists only where it belongs');
});

test('the mark is drawn, and nothing writes text over it', () => {
  // A printer as inline SVG on currentColor. Not a typed glyph: no font the
  // book carries has one (web/fonts/ covers the sigla and the text faces), so
  // a ⎙ would fall to whatever the reader's machine owns -- or to a colour
  // emoji -- which is the drift the vendored fonts exist to prevent.
  const svg = page.slice(page.indexOf('const PRINTER_SVG'), page.indexOf('function printMarkOf'));
  assert.ok(svg.includes('<svg'), 'the mark is drawn');
  assert.ok(svg.includes('currentColor'), 'and inherits the colour, so hover and print need no special case');
  // …and no typed glyph in what the mark actually renders. (The characters
  // appear in the comment above it, which is where they belong: saying why
  // they are not used.)
  assert.ok(!/[⎙🖨]/.test(svg), 'the mark renders no typed printer glyph');
  assert.match(page, /mark\.setAttribute\('aria-label'/, 'a symbol carries its name in the label');

  // It answers the same faded gold the unkept ribbon offers -- the accent at
  // the ribbon's own opacity, so the two corners read as one pair.
  const boxOf = (sel) => (page.match(new RegExp(`\\${sel} \\{([^}]*)\\}`)) || [])[1] || '';
  const rib = boxOf('.hash-bookmark'), mark = boxOf('#page-export');
  assert.match(mark, /color: var\(--accent\)/, 'gold, as the ribbon is');
  assert.equal(/opacity: ([.\d]+)/.exec(mark)?.[1], /opacity: ([.\d]+)/.exec(rib)?.[1],
    'and faded to the same weight as an unbookmarked passage');

  // The busy state must not write into this button: textContent would delete
  // the SVG and leave an empty box that never comes back. Dimming is CSS.
  assert.ok(!/\$\('page-export'\)\.textContent\s*=/.test(page) && !/btn\.textContent\s*=/.test(page),
    'nothing assigns text to the export button -- that would destroy the mark');
  assert.match(page, /#page-export:disabled \{[^}]*opacity/, 'the busy state is fading, not relabelling');
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

test('the file is named by the address, the page by the citation', () => {
  // Browsers take a PDF's filename from document.title, and the book's own
  // citation is not a filename: §, β and ■ get sanitized, and a reference a
  // filesystem has rewritten is no longer the reference. The link spelling
  // (latinRefOf — v1b29c596s2) is plain ascii and round-trips through ?ref=.
  assert.match(page, /const fileRef = latinRefOf\(state\.height, state\.index \+ 1\)/,
    'the name is the passage address in the spelling a link carries');
  assert.match(page, /document\.title = fileRef;/, 'and that is what the file is named');
  assert.ok(!/document\.title = .*cite/.test(page),
    'the sigla citation never becomes a filename');

  // …while the leaf itself still carries the citation as the book prints it.
  const colophon = page.slice(page.indexOf('const colophon = $(\'print-colophon\')'),
    page.indexOf('document.title = fileRef'));
  assert.match(colophon, /citeEl\.textContent = cite/, 'the printed colophon keeps the book’s own form');
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
