// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/fonts.test.mjs — the vendored fonts, kept in step across their
// three consumers: the renderer's FONT_FACES table (quote.mjs), the app's
// stylesheet (web/fonts/fonts.css), and the service worker's precache
// (web/sw.js). The renderer's own coverage test — that the faces declare
// the whole glyph inventory — lives with the renderer's suite in
// tools/twitter-bot/test.mjs; this file guards the app's side of the
// arrangement: no third-party font host anywhere, every declared file
// present and precached, and the sigla fallback riding every stack.
//
//   node --test tools/fonts.test.mjs

import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile, readdir } from 'node:fs/promises';

import { FONT_FACES } from './twitter-bot/quote.mjs';

const WEB = new URL('../web/', import.meta.url);
const fontsCss = await readFile(new URL('fonts/fonts.css', WEB), 'utf8');

test('fonts.css carries every face the renderer declares, ranges and all', () => {
  for (const { file, range } of FONT_FACES) {
    assert.ok(fontsCss.includes(`url(${file})`), `fonts.css lacks ${file}`);
    assert.ok(fontsCss.includes(range), `fonts.css lacks the range of ${file} — regenerate it from FONT_FACES`);
  }
});

test('every file fonts.css names exists, and the service worker precaches it', async () => {
  const files = [...fontsCss.matchAll(/url\(([\w.-]+\.woff2)\)/g)].map((m) => m[1]);
  assert.ok(files.length >= FONT_FACES.length, 'fonts.css names implausibly few files');
  const sw = await readFile(new URL('sw.js', WEB), 'utf8');
  assert.ok(sw.includes(`'./fonts/fonts.css'`), 'sw.js does not precache fonts.css');
  for (const f of files) {
    await access(new URL(`fonts/${f}`, WEB));
    assert.ok(sw.includes(`'./fonts/${f}'`), `sw.js does not precache fonts/${f}`);
  }
});

test('no page loads a font from a third party', async () => {
  const pages = (await readdir(WEB)).filter((f) => f.endsWith('.html'));
  for (const page of [...pages.map((p) => new URL(p, WEB)), new URL('og-card.html', import.meta.url)]) {
    const html = await readFile(page, 'utf8');
    assert.ok(!/fonts\.(googleapis|gstatic)\.com/.test(html),
      `${page.pathname} still points at Google Fonts`);
  }
});

test('the sigla fallback stands behind every stack that names a vendored face', async () => {
  // A stack naming Newsreader, IBM Plex Mono, or Public Sans without
  // 'Book Sigla' immediately after would let that context's sigla fall to
  // whatever the reader's machine has — the exact drift the vendoring
  // closed. New pages and stylesheets inherit the rule by failing here.
  const files = [...(await readdir(WEB)).filter((f) => f.endsWith('.html') || f.endsWith('.css'))
    .map((f) => new URL(f, WEB)), new URL('og-card.html', import.meta.url)];
  for (const file of files) {
    const text = await readFile(file, 'utf8');
    for (const fam of ['Newsreader', 'IBM Plex Mono', 'Public Sans']) {
      const bare = new RegExp(`'${fam}'\\s*,\\s*(?!'Book Sigla')`);
      assert.ok(!bare.test(text),
        `${file.pathname}: a '${fam}' stack without the 'Book Sigla' fallback behind it`);
    }
  }
});
