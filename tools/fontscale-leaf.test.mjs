// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/fontscale-leaf.test.mjs — the search leaf's type sizes, and the pinch
// that sets them.
//
// The scales are global and stored (btc-fontscale.js): a page opts a size in
// by writing calc(Npx * var(--scale-<region>, 1)), and a page that never does
// simply reads at 100% forever. So the failure mode here is silence — the
// gesture fires, the variable is written, and nothing on the page moves,
// because the rules never asked for it. That is what these assert.
//
//   node --test tools/fontscale-leaf.test.mjs

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const leaf = () => readFile(new URL('../web/bitcoin-search.html', import.meta.url), 'utf8');
const styleOf = (page) => page.slice(0, page.indexOf('</style>'));

test('the card reads at the reader\'s size, and its spacing does not', async () => {
  const css = styleOf(await leaf());
  // Every type size inside the card takes the body scale. The list is the
  // card's own rules -- the head and the lines under it, the spend section's
  // attributions, the message footnote's rows, and the copyable hex.
  const SIZED = ['term-kind', 'term-title', 'term-addr', 'term-line', 'term-note',
    'term-attrib', 'term-said', 'term-fn-digest', 'term-fn-name', 'term-fn-bytes',
    'term-hex'];
  for (const cls of SIZED) {
    const rule = new RegExp(`\\.${cls}[^{]*\\{[^}]*\\}`).exec(css);
    assert.ok(rule, `.${cls} is no longer styled here`);
    assert.match(rule[0], /calc\(\d+(\.\d+)?px \* var\(--scale-body, 1\)\)/,
      `.${cls} reads at a fixed size whatever the reader chose`);
  }
  // …and the marks that size themselves against the line they sit in are left
  // in em, so they follow it without being scaled twice.
  for (const [cls, unit] of [['term-check', '1.1em'], ['term-fn-mark', '.8em'],
    ['term-fn-ref', '.72em']]) {
    const rule = new RegExp(`\\.${cls}[^{]*\\{[^}]*\\}`).exec(css);
    assert.ok(rule && rule[0].includes(unit), `.${cls} stopped sizing against its line`);
    assert.ok(!/--scale-body/.test(rule[0]), `.${cls} is scaled twice`);
  }
  // Spacing is not type. A card whose margins grew with its text would set the
  // reader's choice against the leaf's layout at every step.
  const card = /\.term \{[^}]*\}/.exec(css);
  assert.ok(card, 'the card is no longer styled here');
  assert.ok(!/--scale-body/.test(card[0]), 'the card scales its own padding');
});

test('the passage takes the sigla scale and the title does not', async () => {
  const css = styleOf(await leaf());
  // A passage is prose with marks set inline in it, exactly as a chapter is,
  // so the marks take the sigla scale there and a reader who diverged the
  // glyphs in the book meets the same glyphs here.
  assert.match(css, /\.term-line \.op \{ font-size: calc\(1em \* var\(--scale-sigla-ratio, 1\)\); \}/,
    'the passage no longer follows the sigla scale');
  // The title is a heading of nothing but marks: the ratio would size the whole
  // line rather than the sigla within a sentence, so it stays on the body scale
  // with the head it sits in. It is left out by construction -- the rule above
  // names .term-line alone -- and this is what would catch it being loosened to
  // cover both.
  const sized = [...css.matchAll(/([^{}]*)\{[^}]*--scale-sigla-ratio[^}]*\}/g)].map((m) => m[1]);
  assert.ok(sized.length, 'nothing on the leaf reads the sigla ratio');
  for (const sel of sized) {
    assert.ok(!/term-title/.test(sel), `the title rides the sigla ratio: ${sel.trim()}`);
  }
  // A bare byte count measures the data rather than operating on it, and holds
  // at the prose's own size as it does in the book. revealedHtml emits it, so
  // this rule is reached.
  assert.match(css, /\.term-line \.op\.op-count \{ font-size: 1em; \}/,
    'a push count is scaled as though it were an opcode');
});

test('two fingers on the card are the leaf\'s gesture, not the browser\'s', async () => {
  const page = await leaf();
  const css = styleOf(page);
  // touch-action has to be in place before a gesture starts: without it the
  // browser has already begun a viewport zoom by the time the handler runs.
  const card = /\.term \{[^}]*\}/.exec(css);
  assert.match(card[0], /touch-action: pan-x pan-y;/, 'the card leaves pinch to the browser');
  // The gesture writes through the shared module, so the leaf and the book set
  // one stored scale rather than two.
  assert.match(page, /import \{ fontScale, setFontScale \} from '\.\/btc-fontscale\.js';/,
    'the leaf keeps its own idea of the reader\'s size');
  assert.match(page, /setFontScale\('body', want\)/, 'the pinch sets no scale');
  // Quantized, or the card reflows once per frame.
  assert.match(page, /\* 20\) \/ 20;/, 'the pinch reflows on every frame');
  // Scoped to the card: a pinch anywhere else on the leaf is still the
  // browser's own, as it is on the chrome around the book's frame.
  assert.match(page, /closest\('#term'\)/, 'the gesture is no longer scoped to the card');
  // Safari zooms the viewport through gesture events that touch-action does
  // not govern, so those are cancelled on the same surface.
  for (const type of ['gesturestart', 'gesturechange']) {
    assert.ok(page.includes(`'${type}'`), `${type} is left to zoom the viewport`);
  }
  // The readout exists and is styled, or the pinch resizes in silence.
  assert.match(page, /id="fontscale-toast"/, 'the pinch shows no readout');
  assert.match(css, /\.fontscale-toast \{/, 'the readout is styled nowhere');
});
