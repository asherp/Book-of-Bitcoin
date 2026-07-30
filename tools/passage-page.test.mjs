// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/passage-page.test.mjs — the citation-path pages: that a path is the
// citation and inverts back to it, that a passage cited twice collapses to
// one page, and that the page declares its own card.
//
//   node --test tools/

import test from 'node:test';
import assert from 'node:assert/strict';

import { heightOf, volumeBookChapter, reference } from '../web/btc-citation.js';
import {
  passagePath, cardPath, passagePageHtml, chapterPageHtml, passageDescription,
  chapterDescription, passagesByPath, CARD_WIDTH, CARD_HEIGHT,
} from './passage-page.mjs';

const SITE = 'https://bookofbitcoin.io';

const section = () => ({
  fields: {
    version: '1',
    inputs: [{
      isNullPrevout: true, prevTxid: '', prevVout: 0,
      script: '<span class="op">β</span> prose', scriptAscii: null,
      sequence: '●', sequenceKind: 'final', sequenceTitle: 'final', sequenceRbf: false,
      witnessItems: [], witnessZero: false, witnessHex: '',
    }],
    outputs: [{ value: '50.00000000 ₿', scriptAscii: null, script: '<span class="op">∇</span>' }],
    locktime: '□',
  },
  footnotesHtml: [],
  flat: 'version 1 · input ∅ coinbase',
});

// ─── the path is the citation ───────────────────────────────────────────

test('a path names the level its citation names', () => {
  // A chapter is cited "I β1 ■1" and stops at three segments; a section adds
  // its §, and so does the path.
  assert.equal(passagePath(0), '/I/1/1/');
  assert.equal(passagePath(0, null), '/I/1/1/');
  assert.equal(passagePath(0, 1), '/I/1/1/1/');
});

test('a passage path is its citation, and inverts back to the height', () => {
  assert.equal(passagePath(0, 1), '/I/1/1/1/');
  // III β2 ■5 — the reference the book prints for this height.
  const h = heightOf(3, 2, 5);
  assert.equal(reference(h), 'III β2 ■5');
  assert.equal(passagePath(h, 1), '/III/2/5/1/');

  // The grammar is invertible: the path's three numbers are exactly what
  // heightOf takes, which is what lets it extend past the curated set.
  for (const height of [0, 1, 170, 57043, 210000, 419328, 840000]) {
    const { volume, book, chapter } = volumeBookChapter(height);
    const [, vol, bk, ch, sec] = passagePath(height, 4).split('/');
    assert.equal(bk, String(book));
    assert.equal(ch, String(chapter));
    assert.equal(sec, '4');
    assert.equal(heightOf(volume, Number(bk), Number(ch)), height, `round trip at ${height}`);
    assert.ok(/^[MDCLXVI]+$/.test(vol), 'the volume is Roman, as the book prints it');
  }
});

test('a card is keyed by the same coordinates as its page, at either level', () => {
  assert.equal(cardPath(0, 1), '/cards/I-1-1-1.png');
  assert.equal(cardPath(heightOf(3, 2, 5), 2), '/cards/III-2-5-2.png');
  assert.equal(cardPath(0), '/cards/I-1-1.png');            // the chapter's own card
  assert.equal(cardPath(heightOf(3, 2, 5)), '/cards/III-2-5.png');
});

// ─── one passage, one page ──────────────────────────────────────────────

test('a chapter entry and a section entry are two pages, not one', () => {
  // The genesis case in the real contents: "The Genesis Block" names the
  // block (a chapter), and "The Times 03/Jan/2009 …" names the coinbase
  // transaction it opens (a section). Different levels, different addresses.
  const rendered = [
    { title: 'The Genesis Block', height: 0, index: 0, fromTxid: false, isChapter: true },
    { title: 'The Times 03/Jan/2009…', height: 0, index: 0, fromTxid: true, isChapter: false },
    { title: 'Bitcoin Pizza Day', height: 57043, index: 0, fromTxid: true, isChapter: false },
  ];
  const kept = passagesByPath(rendered);
  assert.equal(kept.length, 3, 'nothing collapses — they name different things');

  const at = (path) => kept.find((r) => passagePath(r.height, r.isChapter ? null : r.index + 1) === path);
  assert.equal(at('/I/1/1/').title, 'The Genesis Block', 'the chapter is the block');
  assert.equal(at('/I/1/1/1/').title, 'The Times 03/Jan/2009…', 'the section is its coinbase');
});

test('two rows naming one address keep the more specific entry', () => {
  // The guard that remains: a height entry with an explicit index and a txid
  // entry can land on the same section.
  const same = [
    { title: 'By height and index', height: 74421, index: 2, fromTxid: false, isChapter: false },
    { title: 'By transaction id', height: 74421, index: 2, fromTxid: true, isChapter: false },
  ];
  assert.equal(passagesByPath(same).length, 1);
  assert.equal(passagesByPath(same)[0].title, 'By transaction id');
  assert.equal(passagesByPath([same[1], same[0]])[0].title, 'By transaction id',
    'order-independent');
});

// ─── the page declares its own card ─────────────────────────────────────

const page = (over = {}) => passagePageHtml({
  site: SITE, height: 0, sectionNum: 1, title: 'The Genesis Block',
  txidProse: 'Its desert buyer leg visual.', section: section(), txCount: 1,
  blockHash: '00'.repeat(32), txid: 'ab'.repeat(32),
  cardUrl: `${SITE}/cards/I-1-1-1.png`, slug: 'the-genesis-block',
  ...over,
});

test('the page carries per-passage Open Graph tags', () => {
  const html = page();
  assert.match(html, /<meta property="og:url" content="https:\/\/bookofbitcoin\.io\/I\/1\/1\/1\/">/);
  assert.match(html, /<meta property="og:image" content="https:\/\/bookofbitcoin\.io\/cards\/I-1-1-1\.png">/);
  assert.match(html, new RegExp(`<meta property="og:image:width" content="${CARD_WIDTH}">`));
  assert.match(html, new RegExp(`<meta property="og:image:height" content="${CARD_HEIGHT}">`));
  assert.match(html, /<meta name="twitter:card" content="summary_large_image">/);
  assert.match(html, /<link rel="canonical" href="https:\/\/bookofbitcoin\.io\/I\/1\/1\/1\/">/);
  // The title is the citation — which is the whole point of the address.
  assert.match(html, /<meta property="og:title" content="I β1 ■1 §1 — The Genesis Block">/);
  assert.match(html, /<title>I β1 ■1 §1 — The Genesis Block · The βook of βitcoin<\/title>/);
});

test('a page without a rendered card falls back to the standing one', () => {
  const html = page({ cardUrl: null });
  assert.match(html, /<meta property="og:image" content="https:\/\/bookofbitcoin\.io\/og-glossia\.png">/);
  assert.ok(!html.includes('/cards/'), 'it never declares a card that was not written');
});

test('the page sets the passage in the book\'s grid, responsively', () => {
  const html = page();
  for (const cls of ['tx-flow', 'tx-inputs', 'tx-out-value', 'tx-locktime', 'section-title', 'colophon']) {
    assert.ok(html.includes(cls), `expected the ${cls} band`);
  }
  assert.ok(html.includes('max-width: 54rem'), 'the page is responsive, not a fixed card');
  assert.ok(!html.includes('height: 630px'), 'and takes no card geometry');
  assert.match(html, /<meta name="viewport"/);
  // A link back into the app, at this passage. The ampersand is escaped,
  // as an HTML attribute requires.
  assert.ok(html.includes('bitcoin-book.html?block=0&amp;index=0'));
});

test('the description says what the passage is, and escapes what it quotes', () => {
  const d = passageDescription({ height: 57043, section: 2, title: 'A "quoted" & <odd> title', txCount: 4 });
  assert.match(d, /Block 57,043 read as a chapter/);
  assert.match(d, /transaction 2 of 4/);
  assert.match(d, /Volume I, book 29, chapter 596, section 2/);
  // The raw description carries the title verbatim; the page escapes it.
  const html = page({ title: 'A "quoted" & <odd> title' });
  assert.ok(html.includes('&quot;quoted&quot; &amp; &lt;odd&gt;'));
  assert.ok(!html.includes('<odd>'));
});

// ─── the chapter page ───────────────────────────────────────────────────

const chapterPage = (over = {}) => chapterPageHtml({
  site: SITE, height: 0, title: 'The Genesis Block',
  blockProse: 'Husband behave actor to hospital.',
  blockHashNotation: '<span class="cfx-gold">⓪</span><span class="op op-push">⁴³</span>',
  frontispieceRows: [
    { mark: 'v', text: '1' },
    { text: 'no earlier block' },
    { mark: '⋔', text: 'Its desert buyer leg visual.', gap: true },
  ],
  txCount: 1, blockHash: '00'.repeat(32),
  cardUrl: `${SITE}/cards/I-1-1.png`, slug: 'the-genesis-block',
  sections: [{ num: 1, title: 'The Times 03/Jan/2009…' }],
  ...over,
});

test('a chapter page is addressed and titled as a chapter', () => {
  const html = chapterPage();
  assert.match(html, /<meta property="og:url" content="https:\/\/bookofbitcoin\.io\/I\/1\/1\/">/);
  assert.match(html, /<meta property="og:image" content="https:\/\/bookofbitcoin\.io\/cards\/I-1-1\.png">/);
  // The citation stops at the chapter — no § in the title.
  assert.match(html, /<meta property="og:title" content="I β1 ■1 — The Genesis Block">/);
  assert.ok(!html.includes('§1 —'), 'a chapter is not cited with a section');
  // It opens the block in the app, not one of its transactions.
  assert.ok(html.includes('bitcoin-book.html?block=0"'), 'links the chapter, with no index');
});

test('a chapter page sets its frontispiece and leads to its sections', () => {
  const html = chapterPage();
  assert.ok(html.includes('chapter-title'));
  assert.ok(html.includes('chapter-frontispiece'));
  assert.match(html, /<span class="fx-mark">v<\/span>1/, 'a numeral sits tight against its mark');
  assert.match(html, /<span class="fx-mark">⋔<\/span> Its desert/, 'a word form takes a space');
  // The curated sections inside this block, as the chapter's own contents.
  assert.ok(html.includes('/I/1/1/1/'), 'the chapter leads to its section');
  assert.ok(html.includes('§1 The Times'));
});

test('a chapter description counts its sections, and agrees with itself', () => {
  assert.match(chapterDescription({ height: 170, txCount: 2 }), /its 2 transactions read as sections/);
  const d = chapterDescription({ height: 0, title: 'The Genesis Block', txCount: 1 });
  assert.match(d, /Block 0 read as a chapter/);
  assert.match(d, /its one transaction read as its only section/);
  assert.match(d, /Volume I, book 1, chapter 1\./);
  assert.ok(!d.includes('section 1.'), 'a chapter names no section');
});
