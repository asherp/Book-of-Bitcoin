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
  passagePath, cardPath, passagePageHtml, passageDescription, passagesByPath,
  CARD_WIDTH, CARD_HEIGHT,
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

test('a card is keyed by the same coordinates as its page', () => {
  assert.equal(cardPath(0, 1), '/cards/I-1-1-1.png');
  assert.equal(cardPath(heightOf(3, 2, 5), 2), '/cards/III-2-5-2.png');
});

// ─── one passage, one page ──────────────────────────────────────────────

test('a passage cited twice collapses to one page, titled by the txid entry', () => {
  // Exactly the genesis case in the real contents: a block entry and a txid
  // entry naming the same section.
  const rendered = [
    { title: 'The Genesis Block', height: 0, index: 0, fromTxid: false },
    { title: 'The Times 03/Jan/2009…', height: 0, index: 0, fromTxid: true },
    { title: 'Bitcoin Pizza Day', height: 57043, index: 0, fromTxid: true },
  ];
  const kept = passagesByPath(rendered);
  assert.equal(kept.length, 2, 'the duplicate collapses');
  assert.equal(kept.find((r) => r.height === 0).title, 'The Times 03/Jan/2009…',
    'the transaction entry names a section page, not the block entry');

  // Order-independent: the block entry arriving second must not win.
  const flipped = passagesByPath([rendered[1], rendered[0]]);
  assert.equal(flipped[0].title, 'The Times 03/Jan/2009…');
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
