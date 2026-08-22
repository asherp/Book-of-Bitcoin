// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/passage-page.test.mjs — the citation-path pages: that a path is the
// citation and inverts back to it, that a passage cited twice collapses to
// one page, and that the page declares its own card.
//
//   node --test tools/

import test from 'node:test';
import assert from 'node:assert/strict';

import { heightOf, volumeBookChapter, reference, footnoteMark, footnoteIndexOf } from '../web/btc-citation.js';
import {
  passagePath, cardPath, citationOf, passagePageHtml, chapterPageHtml,
  outputPageHtml, witnessPageHtml, witnessSegment, partOfSegment,
  passagesByPath, CARD_WIDTH, CARD_HEIGHT,
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
  // Each level stops where the printed reference stops.
  assert.equal(passagePath(0), '/I/1/1/');           // I β1 ■1      a chapter
  assert.equal(passagePath(0, null), '/I/1/1/');
  assert.equal(passagePath(0, 1), '/I/1/1/1/');      // I β1 ■1 §1   a section
  assert.equal(passagePath(0, 1, 0), '/I/1/1/1/0/'); // I β1 ■1 §1.0 an output
  assert.equal(passagePath(0, 1, 7), '/I/1/1/1/7/');
});

test('a citation reads as its path does, at every level', () => {
  // The book's own notation: a 1-based section, a dot, a 0-based output
  // (renderCitation in bitcoin-book.html).
  assert.equal(citationOf(0), 'I β1 ■1');
  assert.equal(citationOf(0, 1), 'I β1 ■1 §1');
  assert.equal(citationOf(0, 1, 0), 'I β1 ■1 §1.0');
  assert.equal(citationOf(heightOf(3, 2, 5), 4, 2), 'III β2 ■5 §4.2');
});

test('no page carries a description tag', () => {
  // The card carries the passage and the title carries its address; a prose
  // gloss would be commentary sitting where the record belongs.
  for (const html of [page(), chapterPage(), outputPage()]) {
    assert.ok(!/<meta[^>]+name="description"/.test(html), 'no meta description');
    assert.ok(!/og:description/.test(html), 'no og:description');
    assert.ok(!/twitter:description/.test(html), 'no twitter:description');
  }
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

test('a card is keyed by the same coordinates as its page, at every level', () => {
  assert.equal(cardPath(0), '/cards/I-1-1.png');              // the chapter
  assert.equal(cardPath(0, 1), '/cards/I-1-1-1.png');         // the section
  assert.equal(cardPath(0, 1, 0), '/cards/I-1-1-1-0.png');    // the output
  assert.equal(cardPath(heightOf(3, 2, 5), 2), '/cards/III-2-5-2.png');
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
  assert.match(html, /<meta property="og:image" content="https:\/\/bookofbitcoin\.io\/og-bookofbitcoin\.png">/);
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


// ─── the output page ────────────────────────────────────────────────────

const outputPage = (over = {}) => outputPageHtml({
  site: SITE, height: 0, sectionNum: 1, outputNum: 0,
  title: 'The Genesis Block', section: section(), txid: 'ab'.repeat(32),
  cardUrl: `${SITE}/cards/I-1-1-1-0.png`, slug: 'the-genesis-block',
  ...over,
});

test('an output is addressed and cited as §N.M', () => {
  const html = outputPage();
  assert.match(html, /<meta property="og:url" content="https:\/\/bookofbitcoin\.io\/I\/1\/1\/1\/0\/">/);
  assert.match(html, /<meta property="og:image" content="https:\/\/bookofbitcoin\.io\/cards\/I-1-1-1-0\.png">/);
  assert.match(html, /<meta property="og:title" content="I β1 ■1 §1\.0 — The Genesis Block">/);
  assert.ok(html.includes('§ 1.0'), 'the heading is the output, not the section');
});

test('an output page carries its amount and its script, and leads back up', () => {
  const html = outputPage();
  assert.ok(html.includes('50.00000000 ₿'), 'the amount it holds');
  assert.ok(html.includes('∇'), 'the script that locks it, in opcode notation');
  assert.ok(html.includes('/I/1/1/1/'), 'a way back up to the whole section');
  // The app addresses an output by txid and out index, not by block+index.
  assert.ok(html.includes(`?txid=${'ab'.repeat(32)}&amp;out=0`));
});

test('an output that could not be composed says so rather than rendering blank', () => {
  const html = outputPage({ outputNum: 9 });    // no such output in the stub
  assert.ok(html.includes('could not be composed'));
});

test('a section page leads down to the outputs that were written', () => {
  const none = page();
  assert.ok(!none.includes('Outputs:'), 'no output pages, no list');
  const some = page({ outputs: 2 });
  assert.ok(some.includes('/I/1/1/1/0/'));
  assert.ok(some.includes('/I/1/1/1/1/'));
  assert.ok(some.includes('§1.0'));
});

// ─── footnote marks, and witness addresses ──────────────────────────────

test('footnote marks letter in bijective base-26', () => {
  assert.equal(footnoteMark(1), 'a');
  assert.equal(footnoteMark(16), 'p');
  assert.equal(footnoteMark(17), 'q', 'p is followed by q, no letter being skipped');
  assert.equal(footnoteMark(26), 'z');
  // Doubles begin after the 26 singles and cover 26×26 = 676 of them, so the
  // third letter arrives at 703 rather than 677.
  assert.equal(footnoteMark(27), 'aa');
  assert.equal(footnoteMark(702), 'zz');
  assert.equal(footnoteMark(703), 'aaa');
  assert.equal(footnoteMark(18278), 'zzz');
  assert.ok(Array.from({ length: 700 }, (_, i) => footnoteMark(i + 1)).join('').includes('q'),
    'and q is among them, as any letter is');
  // Out of range yields nothing rather than a bogus mark.
  assert.equal(footnoteMark(0), '');
  assert.equal(footnoteMark(-1), '');
});

test('a footnote mark reads back to its index', () => {
  for (const n of [1, 16, 17, 26, 27, 28, 702, 703, 18278]) {
    assert.equal(footnoteIndexOf(footnoteMark(n)), n, `round trip at ${n}`);
  }
  assert.equal(footnoteIndexOf('q'), 17, 'q reads back like any other letter');
  assert.equal(footnoteIndexOf('aq'), 43);
  assert.equal(footnoteIndexOf(''), null);
  assert.equal(footnoteIndexOf('a1'), null);
  assert.equal(footnoteIndexOf('AA'), 27, 'case-insensitive');
});

test('a witness is addressed by its letter, an output by its numeral', () => {
  assert.equal(passagePath(0, 1, 'a'), '/I/1/1/1/a/');
  assert.equal(passagePath(0, 1, 0), '/I/1/1/1/0/');
  assert.equal(citationOf(0, 1, 'a'), 'I β1 ■1 §1.a');
  assert.equal(cardPath(0, 1, 'a'), '/cards/I-1-1-1-a.png');
  assert.equal(witnessSegment(2), 'b');
});

test('a last segment says for itself what it names', () => {
  // The form discriminates, so no sixth level is needed and the two can
  // never collide.
  assert.deepEqual(partOfSegment('0'), { output: 0 });
  assert.deepEqual(partOfSegment('12'), { output: 12 });
  assert.deepEqual(partOfSegment('a'), { witness: 1 });
  assert.deepEqual(partOfSegment('aa'), { witness: 27 });
  assert.deepEqual(partOfSegment('q'), { witness: 17 });
  assert.equal(partOfSegment('-1'), null);
  assert.equal(partOfSegment(''), null);
});

// ─── the witness page ───────────────────────────────────────────────────

const witnessPage = (over = {}) => witnessPageHtml({
  site: SITE, height: 0, sectionNum: 1, footnoteIndex: 1, title: 'The Genesis Block',
  witnessHtml: '<span class="dt">s</span> a signature <span class="wit-sep">·</span> <span class="dt">p</span> a key',
  txid: 'ab'.repeat(32), cardUrl: `${SITE}/cards/I-1-1-1-a.png`, slug: 'the-genesis-block',
  ...over,
});

test('a witness page is addressed and cited by its footnote letter', () => {
  const html = witnessPage();
  assert.match(html, /<meta property="og:url" content="https:\/\/bookofbitcoin\.io\/I\/1\/1\/1\/a\/">/);
  assert.match(html, /<meta property="og:image" content="https:\/\/bookofbitcoin\.io\/cards\/I-1-1-1-a\.png">/);
  assert.match(html, /<meta property="og:title" content="I β1 ■1 §1\.a — The Genesis Block">/);
  // The letter is wrapped so the heading's uppercase transform cannot raise
  // it — an address is lowercase, and §1.A would name nothing.
  assert.ok(html.includes('§ 1.<span class="fn-mark">a</span>'));
  assert.match(html, /\.fn-mark \{ text-transform: none; \}/);
  assert.ok(html.includes('a signature'), 'the witness stack rides through as markup');
  assert.ok(html.includes('/I/1/1/1/'), 'a way back up to the whole section');
  assert.ok(html.includes('#fn-a'), 'and into the book at that footnote');
  assert.ok(!/description/.test(html), 'no description tag here either');
});

test('the second witness is b, the twenty-seventh aa', () => {
  assert.ok(witnessPage({ footnoteIndex: 2 }).includes('<span class="fn-mark">b</span>'));
  assert.match(witnessPage({ footnoteIndex: 27 }), /og:url" content="[^"]*\/1\/aa\//);
});

test('a section page leads down to its witnesses as well as its outputs', () => {
  const html = page({ outputs: 2, witnesses: 2 });
  assert.ok(html.includes('Outputs:'));
  assert.ok(html.includes('Witnesses:'));
  assert.ok(html.includes('/I/1/1/1/a/'));
  assert.ok(html.includes('§1.b'));
});

// ─── the app's deep link to a bookmarked output ──────────────────────────

test('a contents link opens the book at a bookmarked output', async () => {
  const { entryHref } = await import('../web/btc-contents.js');
  const txid = 'ab'.repeat(32);
  assert.equal(entryHref(txid), `bitcoin-book.html?txid=${txid}`);
  assert.equal(entryHref(txid, undefined, undefined, 1), `bitcoin-book.html?txid=${txid}&out=1`);
  assert.equal(entryHref(txid, undefined, undefined, 0), `bitcoin-book.html?txid=${txid}&out=0`,
    'output 0 is an address, not an absent one');
  // A block entry keeps its index, and a book leaf ignores the vout.
  assert.equal(entryHref('170', 2), 'bitcoin-book.html?block=170&index=2');
  assert.equal(entryHref('170', 2, 'book'), 'bitcoin-book.html?block=170&page=book');
});
