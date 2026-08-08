// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/viewport.test.mjs — the screen the book is using, and the edges of
// it. Two rules, and the second is the one that is easy to forget:
//
//   1. Every page that declares a viewport declares `viewport-fit=cover`.
//      A page without it is letterboxed beside a display cutout — the system
//      draws a black band down that edge, status bar included — so a book
//      whose pages disagree changes the width of the screen at a page turn.
//
//   2. A page that renders under the cutout pads itself back out of the way.
//      Opting in without padding moves the defect rather than fixing it: the
//      camera lands on the text instead of beside it. The gutters live in
//      btc-chrome.css (`--gutter-l` / `--gutter-r`), and both edges are read,
//      because the cutout swaps sides between the two landscape rotations.
//
// Neither is visible on a desk, and a phone in portrait passes both while
// broken — which is why they are asserted here rather than looked at.
//
//   node --test tools/viewport.test.mjs

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';

const WEB = new URL('../web/', import.meta.url);
// Every page under web/, the standing addresses in their own directories
// included (/latest is a page a reader opens, whatever it forwards to).
const pages = (await readdir(WEB, { recursive: true })).filter((f) => f.endsWith('.html'));
const read = (name) => readFile(new URL(name, WEB), 'utf8');

test('every page that declares a viewport renders under the cutout', async () => {
  let declared = 0;
  for (const name of pages) {
    const meta = (await read(name)).match(/<meta name="viewport" content="([^"]*)">/);
    if (!meta) continue;               // the two refresh stubs that set no viewport
    declared++;
    assert.match(meta[1], /viewport-fit=cover/,
      `${name} declines the cutout — it will read in a letterboxed window beside a page that doesn't`);
  }
  assert.ok(declared >= 9, `only ${declared} pages declare a viewport — did one lose its meta?`);
});

test('btc-chrome.css reads both horizontal insets, with a fallback', async () => {
  const css = await readFile(new URL('btc-chrome.css', WEB), 'utf8');
  for (const [prop, inset] of [['--gutter-l', 'left'], ['--gutter-r', 'right']]) {
    const decl = css.match(new RegExp(`${prop}:([^;]*);`));
    assert.ok(decl, `btc-chrome.css defines no ${prop}`);
    assert.match(decl[1], new RegExp(`env\\(safe-area-inset-${inset},\\s*0px\\)`),
      `${prop} must read safe-area-inset-${inset} with a 0px fallback — a bare env() in a browser ` +
      'without safe areas invalidates the declaration, and the padding falls to nothing');
    assert.match(decl[1], /max\(/, `${prop} must keep the book's own margin as its floor`);
  }
});

test("no page's column pads its edges with a bare constant", async () => {
  // Only the shorthand is checked: a `padding-top`/`padding-bottom` longhand
  // (the title leaf flattens both) says nothing about the horizontal axis.
  let checked = 0;
  for (const name of pages) {
    const html = await read(name);
    if (!html.includes('btc-chrome.css')) continue;   // the stubs write their own insets
    for (const rule of html.matchAll(/(^|[};])\s*([^{}@]*\.wrap[^{}]*)\{([^{}]*)\}/g)) {
      for (const decl of rule[3].matchAll(/(?:^|;)\s*padding\s*:([^;]*)/g)) {
        checked++;
        for (const gutter of ['--gutter-l', '--gutter-r']) {
          assert.ok(decl[1].includes(gutter),
            `${name}: \`.wrap\` sets padding:${decl[1].trim()} — the horizontal axis must read ${gutter}, ` +
            'or the column lands under the display cutout in one of the two landscape rotations');
        }
      }
    }
  }
  assert.ok(checked >= 7, `only ${checked} column paddings found — did a page's .wrap rule move?`);
});
