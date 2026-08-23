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

test('every reading page preloads the four faces all of them set text in', async () => {
  // Measured, not guessed: these are the files every page fetches on a cold
  // visit (the rest are gated by unicode-range and asked for only where their
  // glyphs appear — the sigla leaf pulls the whole alphabet, a chapter these
  // four). Preloading them starts the fetch alongside fonts.css instead of
  // after it, worth ~one round trip on a slow connection.
  //
  // `crossorigin` is the load-bearing attribute: a font is fetched
  // CORS-anonymous even same-origin, so a preload without it matches no
  // request and silently downloads the file a second time.
  const UNIVERSAL = ['newsreader-latin.woff2', 'plexmono-500-latin.woff2',
    'plexmono-600-latin.woff2', 'sigla-dejavu.woff2'];
  const pages = (await readdir(WEB)).filter((f) => f.endsWith('.html'));
  for (const name of pages) {
    const html = await readFile(new URL(name, WEB), 'utf8');
    if (!html.includes('./fonts/fonts.css')) continue;      // the redirect leaf sets no text
    for (const f of UNIVERSAL) {
      const tag = new RegExp(`<link rel="preload" as="font" type="font/woff2" href="\\./fonts/${f.replace('.', '\\.')}" crossorigin>`);
      assert.match(html, tag, `${name} does not preload ${f} (with crossorigin)`);
    }
    // A preload the page never uses is wasted bytes, so the set stays exactly
    // the universal four — the browser warns about the rest, and so does this.
    const preloaded = [...html.matchAll(/rel="preload" as="font"[^>]*href="\.\/fonts\/([\w.-]+)"/g)].map((m) => m[1]);
    assert.deepEqual(preloaded.sort(), [...UNIVERSAL].sort(),
      `${name} preloads something outside the universal set`);
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

test('fonts.css declares every siglum the app writes, opcode or not', async () => {
  // The other half of the vendoring guarantee, and the half nobody was
  // watching. The renderer's suite checks the faces a *card* sets, off a list
  // of the modules that compose a passage. Nothing checked the app's own
  // stylesheet against the modules that write the book's notation -- so a mark
  // could join the alphabet, reach a reader, and fall to whatever face the
  // reader's machine happened to have.
  //
  // It matters most for the marks that are notation without being opcodes. λ is
  // the case in point, and now the only one: no chain has ever carried one, so
  // no rendering of a transaction could have caught it -- and the first
  // OP_RETURN that carries a term will put it in front of a reader. It is
  // vendored (U+03BB), and this is what keeps it so.
  const SOURCES = ['btc-sigla.js', 'btc-notation.js', 'btc-term.js', 'btc-address-form.js'];
  const LIT = /'(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"|`(?:[^`\\]|\\.)*`/gs;

  const declared = new Set();
  for (const m of fontsCss.matchAll(/unicode-range:\s*([^;]+);/g)) {
    for (const part of m[1].split(',')) {
      const [a, b] = part.trim().slice(2).split('-');
      const lo = parseInt(a, 16), hi = b ? parseInt(b, 16) : lo;
      for (let cp = lo; cp <= hi; cp++) declared.add(cp);
    }
  }

  // Four marks the key prints that no vendored face declares, so they fall to
  // a system face today. Named rather than waved through: each is real debt,
  // the fix is a re-vendor rather than an edit here, and naming them is what
  // lets the fifth one fail this test instead of joining them quietly.
  const UNVENDORED = new Set([
    0x207f,   // ⁿ  — a push of n bytes, in the key's Data row and Pushes group
    0x2099,   // ₙ  — the cited-work mark's subscript, ‡ₙ
    0x2248,   // ≈  — a projected chapter's expected wait
    0x221a,   // √  — the same gloss's spread, ±10·√k minutes
  ]);

  const missing = new Set();
  for (const name of SOURCES) {
    let text = await readFile(new URL(name, WEB), 'utf8');
    text = text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    for (const lit of text.match(LIT) || []) {
      for (const ch of lit) {
        const cp = ch.codePointAt(0);
        if (cp > 0x7f && !declared.has(cp) && !UNVENDORED.has(cp)) missing.add(cp);
      }
    }
  }
  assert.deepEqual([...missing].map((cp) => `U+${cp.toString(16).toUpperCase().padStart(4, '0')} ${String.fromCodePoint(cp)}`),
    [], 'sigla no @font-face in fonts.css declares — re-vendor the fonts');

  // And the mark of the calculus is vendored, which is the claim this test
  // exists to keep true rather than merely to have checked once.
  for (const [cp, mark] of [[0x03bb, 'λ']]) {
    assert.ok(declared.has(cp), `${mark} is not declared by any face`);
  }
});
