// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/leaf-pushes.test.mjs — how the search leaf sets a script's pushes.
//
// Two rules, both borrowed from the reading rather than invented here, which
// is the point: one script met in a chapter and met on the leaf should read
// the same. A wholly readable push is the text it is; a push too big to be a
// value waits behind a ⋯ until somebody asks for it.
//
// The threshold is testable without the engine — it is arithmetic on a length
// — so most of this runs in a bare checkout. What needs Glossia to say a push
// skips, by the same convention the rest of the suite keeps.
//
//   node --test tools/leaf-pushes.test.mjs

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';

const leaf = () => readFile(new URL('../web/bitcoin-search.html', import.meta.url), 'utf8');
const engineBuilt = await access(new URL('../web/glossia.js', import.meta.url)).then(() => true, () => false);
const skipNoEngine = !engineBuilt && 'web/glossia.js not built';

// lazySay lifted out of the page: it closes over nothing but escapeHtml, so it
// can be run here without a browser or a WASM build.
const lazySayOf = (page) => {
  const m = /const LAZY_BYTES = 100;[\s\S]*?\n};/.exec(page);
  assert.ok(m, 'the leaf no longer defers a push');
  return new Function('escapeHtml', `${m[0]}\nreturn lazySay;`)((s) => String(s));
};

test('a value is said where it stands; a payload waits behind a ⋯', async () => {
  const lazySay = lazySayOf(await leaf());
  const said = (h) => `«${h.length / 2}»`;
  const enc = lazySay(said);
  // What a script carries as values, all said where they stand: a hash is 20
  // or 32 bytes, a key 32 or 33 or 65, a signature 64 to 72. A card that
  // deferred these would defer nearly every push it ever draws.
  for (const n of [1, 20, 32, 33, 64, 65, 72, 100]) {
    assert.equal(enc('ab'.repeat(n)), `«${n}»`, `${n} bytes should be said outright`);
  }
  // Above that it is a blob somebody stored — an inscription's body, an
  // OP_RETURN's cargo — and several hundred bytes of prose would bury the line
  // it belongs to.
  for (const n of [101, 273, 520]) {
    const out = enc('ab'.repeat(n));
    assert.match(out, /class="glossia-lazy"/, `${n} bytes should wait`);
    assert.match(out, /⋯</, 'the mark is not the one that stands for prose not yet set');
    assert.ok(out.includes(`data-hex="${'ab'.repeat(n)}"`), 'the bytes do not ride on the element');
    assert.ok(!out.includes(`«${n}»`), 'the payload was said anyway');
  }
  // The bytes ride on the element, where a click can reach them and a reader
  // cannot read them: never set in type, which is the rule everywhere else.
  const big = enc('ab'.repeat(520));
  assert.ok(!/>[0-9a-f]{8,}</.test(big), 'the payload is printed as hex');
  // With no engine there is nothing to defer TO, so the ordinary refusal
  // stands rather than a mark promising prose that will never come.
  assert.equal(lazySay(null)('ab'.repeat(520)), '');
  assert.equal(enc(''), '');
});

test('the leaf sets a script the way a chapter sets one', async () => {
  const page = await leaf();
  // The reading's own renderer, so its rules — a readable push quoted as the
  // text it is, a redeem script revealed as opcodes — reach the leaf without
  // being restated here. spellHtml stands in only until btc-prose arrives.
  assert.match(page, /reader\.renderScript\(hex, lazySay\(sayFn\)\)/,
    'the quotation no longer takes the reading’s rules');
  assert.match(page, /read \|\| spellHtml\(hex, \{ say: sayFn \}\) \|\| ''/,
    'the spelled form no longer stands in while the module loads');
  // The witness takes the same encoder, so a payload defers wherever it sits.
  assert.match(page, /const encode = lazySay\(sayFn\);/, 'the spend says its payloads outright');
  // A ⋯ inside the quotation has to claim the click before the copy menu that
  // wraps it, or asking for a push would open a menu instead.
  const handler = /document\.addEventListener\('click',[\s\S]*?\n\}\);/.exec(page);
  assert.ok(handler, 'the leaf no longer delegates clicks');
  assert.ok(handler[0].indexOf('glossia-lazy') < handler[0].indexOf('hash-copy'),
    'the copy menu takes the click before the push does');
  // …and it is reachable from a keyboard, being a control.
  const keys = /document\.addEventListener\('keydown',[\s\S]*?\n\}\);/.exec(page);
  assert.match(keys[0], /glossia-lazy/, 'a held-back push cannot be opened without a pointer');
  assert.match(page, /\.glossia-lazy \{[^}]*\}/, 'the placeholder is styled nowhere');
});

test('a readable push reads as its text, deferral and all', { skip: skipNoEngine }, async () => {
  const { renderScript } = await import('../web/btc-prose.js');
  const lazySay = lazySayOf(await leaf());
  const said = (h) => `«${h.length / 2}»`;
  const push = (h) => {
    const n = h.length / 2;
    if (n <= 75) return n.toString(16).padStart(2, '0') + h;
    if (n <= 255) return `4c${n.toString(16).padStart(2, '0')}${h}`;
    return `4d${(n & 0xff).toString(16).padStart(2, '0')}${(n >> 8).toString(16).padStart(2, '0')}${h}`;
  };
  const ascii = (s) => [...s].map((c) => c.charCodeAt(0).toString(16).padStart(2, '0')).join('');
  // An OP_RETURN carrying a readable line and a blob: the first is quoted as
  // what it says, the second held back. Both rules on one script.
  const script = `6a${push(ascii('hello world'))}${push('cd'.repeat(300))}`;
  const out = renderScript(script, lazySay(said));
  assert.match(out, /hello world/, 'a readable push is not set as the text it is');
  assert.match(out, /class="glossia-lazy"/, 'the blob beside it was said anyway');
  assert.ok(!out.includes('«300»'), 'the blob was said anyway');
});
