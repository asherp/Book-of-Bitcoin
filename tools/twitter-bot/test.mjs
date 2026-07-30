// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/twitter-bot/test.mjs — the bot's offline test suite. Everything runs
// without network or credentials: citation parsing, tweet weighing, reply
// composition (against a stub encoder), citation resolution (against a stub
// explorer), and the OAuth 1.0a signature against the vector published in
// X's "Creating a signature" guide. The final test renders a real verse
// through the WASM engine when web/glossia.js is built, and skips when it
// isn't — so `node --test tools/twitter-bot/` passes on a bare checkout.
//
//   node --test tools/twitter-bot/

import test from 'node:test';
import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';

import { fromRoman, parseCitation } from './citation.mjs';
import {
  weighText, composeReply, composeUnwritten, composeNoSection,
  resolveCitation, titleFor, sectionParts, passageHtml, passageCss, passageAltText,
  TWEET_WEIGHT_BUDGET, FONT_MIN,
} from './quote.mjs';
import { loadRenderer } from './image.mjs';
import { oauth1Header } from './x-api.mjs';
import { replyFor, ensureEngine } from './bot.mjs';

const SITE = 'https://bookofbitcoin.io';

// ─── citation parsing ───────────────────────────────────────────────────

test('roman numerals parse strictly', () => {
  assert.equal(fromRoman('III'), 3);
  assert.equal(fromRoman('IV'), 4);
  assert.equal(fromRoman('XIV'), 14);
  assert.equal(fromRoman('i'), 1);
  assert.equal(fromRoman('IIII'), null);   // malformed
  assert.equal(fromRoman('VX'), null);
  assert.equal(fromRoman(''), null);
  assert.equal(fromRoman('BC'), null);
});

test('the sigla form parses, § optional', () => {
  // I β1 ■1 is height 0; III β2 ■5 is (3-1)*210000 + (2-1)*2016 + (5-1).
  assert.deepEqual(parseCitation('quote me III β2 ■5 §3 please'), { height: 422020, section: 3 });
  assert.deepEqual(parseCitation('I β1 ■1'), { height: 0, section: 1 });
});

test('the ascii and packed-hashtag forms parse', () => {
  assert.deepEqual(parseCitation('III b2 c5 s3'), { height: 422020, section: 3 });
  assert.deepEqual(parseCitation('III book 2 chapter 5 section 3'), { height: 422020, section: 3 });
  assert.deepEqual(parseCitation('#IIIb2c5s3'), { height: 422020, section: 3 });
  assert.deepEqual(parseCitation('#Ib1c1'), { height: 0, section: 1 });
});

test('block and txid forms parse', () => {
  assert.deepEqual(parseCitation('block 170 §2'), { height: 170, section: 2 });
  assert.deepEqual(parseCitation('Block #170 s2'), { height: 170, section: 2 });
  assert.deepEqual(parseCitation('block 57043'), { height: 57043, section: 1 });
  const txid = 'f4184fc596403b9d638783cf57adfe4c75c605f6356fbc91338530e9831e9e16';
  assert.deepEqual(parseCitation(`what does ${txid} say?`), { txid, section: null });
});

test('ordinary prose is not a citation', () => {
  assert.equal(parseCitation('I love this book, can I block you?'), null);
  assert.equal(parseCitation('big if true #bookofbitcoin'), null);
  assert.equal(parseCitation(''), null);
});

// ─── tweet weighing ─────────────────────────────────────────────────────

test('weighing matches X: latin 1, ■ 2, β and § 1', () => {
  assert.equal(weighText('abc'), 3);
  assert.equal(weighText('β'), 1);    // U+03B2, light
  assert.equal(weighText('§'), 1);    // U+00A7, light
  assert.equal(weighText('■'), 2);    // U+25A0, heavy
  assert.equal(weighText('“”—'), 3);  // general punctuation, light
});

// ─── reply composition ──────────────────────────────────────────────────

const PIZZA_TXID = 'a1075db55d416d3ca199f55b6084e2115b9345e16c5cf302fc80e9d5fbf5d48d';

test('a fitting verse rides whole in text, with no passage image', () => {
  const proseOf = () => ({ prose: 'A short verse of prose.' });
  const { text, passage } = composeReply({ height: 57043, index: 0, txid: 'ab'.repeat(32), site: SITE, proseOf });
  assert.match(text, /^I β29 ■596 §1 — Bitcoin Pizza Day\n/);
  assert.match(text, /“A short verse of prose\.”/);
  assert.ok(text.endsWith(`${SITE}/bitcoin-book.html?block=57043&index=0`));
  assert.ok(weighText(text) <= TWEET_WEIGHT_BUDGET);
  assert.equal(passage, null);
});

test('an overflowing verse keeps its cover words: ellipsized in text, whole in the passage', () => {
  // No section (the bytes couldn't be fetched): the verse falls back to the
  // txid as prose, still quoted whole in the passage.
  const longProse = Array.from({ length: 120 }, (_, i) => `word${i}`).join(' ');
  const proseOf = () => ({ prose: longProse });
  const { text, passage } = composeReply({ height: 422020, index: 4, txid: 'cd'.repeat(32), site: SITE, proseOf });

  assert.match(text, /“word0 word1 /);            // the verse itself, from its first word
  assert.match(text, /…”/);                       // trimmed at a word boundary, marked honestly
  const urlWeight = 23;
  assert.ok(weighText(text.slice(0, text.lastIndexOf('https://'))) + urlWeight <= TWEET_WEIGHT_BUDGET);

  assert.ok(passage, 'expected a passage for the image');
  assert.equal(passage.txidProse, longProse);     // unabridged — cover words never stripped
  assert.equal(passage.section, null);
  assert.equal(passage.cite, 'III β2 ■5 §5');
  assert.ok(passageHtml({ ...passage, site: SITE }).includes('word119'), 'the page carries the verse whole');
});

test('a section that fits still rides in text; footnotes force the image', () => {
  const short = { rows: [{ label: 'version', text: '1' }], footnotes: [], flat: 'version 1 · out 0 ₿ ∇' };
  const proseOf = () => ({ prose: 'unused fallback' });
  const inText = composeReply({ height: 170, index: 1, txid: 'ab'.repeat(32), site: SITE, proseOf, section: short });
  assert.equal(inText.passage, null);
  assert.match(inText.text, /“version 1 · out 0 ₿ ∇”/);

  const withNotes = composeReply({
    height: 170, index: 1, txid: 'ab'.repeat(32), site: SITE, proseOf,
    section: { ...short, footnotes: ['φ sig'] },
  });
  assert.ok(withNotes.passage, 'witness footnotes belong on the page, not flattened into a tweet');
});

test('a section lays out in wire order with its sigla, witness as footnotes', () => {
  const fields = {
    version: '1',
    inputs: [{
      isNullPrevout: false, prevTxid: 'ee'.repeat(32), prevVout: 1,
      script: '<span title="OP_DUP">⧉</span> some prose', sequence: '<span title="final">∞</span>',
      witnessItems: ['aa'], witnessZero: false,
    }],
    outputs: [{ value: '50.00000000 ₿', script: '<span title="OP_HASH160">⌗</span> prose <span title="OP_CHECKSIG">∇</span>' }],
    locktime: '<span title="none">⊘</span>',
  };
  const s = sectionParts(fields, (inp) => (inp.witnessItems.length ? 'φ sig ρ key' : null));

  assert.deepEqual(s.rows.map((r) => r.label), ['version', 'input', 'output', 'locktime']);
  // The footnote marker is a letter, matching the page and the live app.
  assert.match(s.rows[1].text, /^spends eeeeeeee…:1 — ⧉ some prose · ∞ ⁽a⁾$/);
  assert.equal(s.rows[2].text, '50.00000000 ₿ — ⌗ prose ∇');
  assert.deepEqual(s.footnotes, ['φ sig ρ key']);
  assert.match(s.flat, /version 1\ninput spends/);   // the tweet's flowing form, sigla intact
});

// A minimal composeTransactionFields-shaped object: one spend, one output.
const stubFields = (over = {}) => ({
  version: '1',
  inputs: [{
    isNullPrevout: false, prevTxid: 'ee'.repeat(32), prevVout: 1,
    script: '<span class="op">⧉</span> some prose', scriptAscii: null,
    sequence: '●', sequenceKind: 'final', sequenceTitle: 'final', sequenceRbf: false,
    witnessItems: [], witnessZero: false, witnessHex: '',
  }],
  outputs: [{ value: '50.00000000 ₿', scriptAscii: null, script: '<span class="op">⌗</span> prose <span class="op">∇</span>' }],
  locktime: '□',
  ...over,
});

test('the page sets the transaction in the book\'s manuscript grid', () => {
  const html = passageHtml({
    cite: 'I β1 ■1 §1', title: 'A <title> & "quotes"', sectionNum: 1,
    txidProse: 'The txid as prose.',
    section: { fields: stubFields(), footnotesHtml: ['φ sig <b>ρ</b> key'], citations: ['I β1 ■1 §2.0'] },
    site: SITE,
  });

  // The book's own class names and bands.
  for (const cls of ['tx-flow', 'tx-inputs', 'tx-in-cite', 'tx-in-script', 'tx-outputs',
    'tx-out-value', 'tx-locktime', 'section-title', 'section-hash', 'colophon']) {
    assert.ok(html.includes(cls), `expected the ${cls} band`);
  }
  assert.ok(html.includes('tx-body-lead'), 'the opening line takes the illuminated initial');
  assert.ok(html.includes('I β1 ■1 §2.0'), 'the resolved citation stands in the left margin');
  assert.ok(html.includes('50.00000000 ₿'));
  assert.ok(html.includes('φ sig <b>ρ</b> key'), 'witness markup rides through as markup');

  // Composed field fragments are markup and stay markup; strings this
  // module owns are escaped.
  assert.ok(html.includes('<span class="op">∇</span>'));
  assert.ok(html.includes('A &lt;title&gt; &amp; &quot;quotes&quot;'));
  assert.ok(!html.includes('A <title>'));
});

test('the page falls back to the short prevout when no citation resolved', () => {
  const html = passageHtml({
    cite: 'I β1 ■1 §1', title: null, sectionNum: 1, txidProse: 'p',
    section: { fields: stubFields(), footnotesHtml: [] }, site: SITE,
  });
  assert.ok(html.includes('eeeeee…:1'), 'an unresolved input still names what it spends');
});

test('a coinbase reads ∅, and a clipped passage says it continues', () => {
  const coinbase = stubFields({
    inputs: [{
      isNullPrevout: true, prevTxid: '', prevVout: 0,
      script: '<span class="op">β</span> prose', scriptAscii: null,
      sequence: '●', sequenceKind: 'final', sequenceTitle: 'final', sequenceRbf: false,
      witnessItems: [], witnessZero: false, witnessHex: '',
    }],
  });
  const section = { fields: coinbase, footnotesHtml: [] };
  const plain = passageHtml({ cite: 'I β1 ■1 §1', sectionNum: 1, txidProse: 'p', section, site: SITE });
  assert.ok(plain.includes('>∅<'), 'a coinbase spends nothing');
  assert.ok(!plain.includes('class="continues"'));

  const cut = passageHtml({ cite: 'I β1 ■1 §1', sectionNum: 1, txidProse: 'p', section, site: SITE, clipped: true });
  assert.ok(cut.includes('class="continues"'), 'a clipped passage marks that it continues');
});

test('the page carries the requested geometry and root size', () => {
  const html = passageHtml({
    cite: 'I β1 ■1 §1', sectionNum: 1, txidProse: 'p', section: null, site: SITE,
    fontSize: 12.5, width: 900, height: 1600,
  });
  assert.match(html, /width: 900px; height: 1600px;/);
  assert.match(html, /font-size: 12\.5px;/);
  assert.match(html, /overflow: hidden;/, 'a fixed card clips a passage that overruns it');

  // The same stylesheet, unpinned: a responsive page grows instead.
  const page = passageCss({ fontSize: 19, fixed: false });
  assert.ok(!page.includes('height: 1500px'), 'a responsive page takes no fixed height');
  assert.match(page, /max-width: 54rem/);
  assert.ok(page.includes('.tx-flow'), 'and still sets the manuscript grid identically');
});

test('alt text carries the passage within X\'s cap', () => {
  const alt = passageAltText({
    cite: 'I β1 ■1 §1', title: 'T', txidProse: 'p',
    section: { flat: 'v '.repeat(600).trim(), footnotes: [] },
  });
  assert.ok(alt.length <= 1000);
  assert.ok(alt.endsWith('…'));
});

test('titles resolve txid-first, then height, never book leaves', () => {
  assert.equal(titleFor(57043, 0, PIZZA_TXID), 'Bitcoin Pizza Day');
  assert.equal(
    titleFor(0, 0, '4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b'),
    'The Times 03/Jan/2009 Chancellor on brink of second bailout for banks');
  assert.equal(titleFor(123456, 3, 'ff'.repeat(32)), null);
});

test('the unwritten and no-section replies read gently', () => {
  const t = composeUnwritten({ height: 2100000, tip: 908000, site: SITE });
  assert.match(t, /not yet written/);
  assert.match(t, /block 2,100,000/);
  assert.match(t, /908,000/);
  const n = composeNoSection({ height: 170, section: 9, txCount: 2, site: SITE });
  assert.match(n, /2 sections/);
  assert.match(n, /no §9/);
});

// ─── citation resolution, against a stub explorer ───────────────────────

const GENESIS_HASH = '000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f';
const GENESIS_TXID = '4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b';

// The genesis coinbase, byte for byte: v1, one null-prevout input whose
// scriptSig carries the restated target, the extranonce, and the Times
// headline; one 50 ₿ P2PK output; locktime 0.
const GENESIS_TX_HEX =
  '01000000010000000000000000000000000000000000000000000000000000000000000000ffffffff4d04ffff001d' +
  '0104455468652054696d65732030332f4a616e2f32303039204368616e63656c6c6f72206f6e206272696e6b206f66' +
  '207365636f6e64206261696c6f757420666f722062616e6b73ffffffff0100f2052a01000000434104678afdb0fe55' +
  '48271967f1a67130b7105cd6a828e03909a67962e0ea1f61deb649f6bc3f4cef38c4f35504e51ec112de5c384df7ba' +
  '0b8d578a4c702b6bf11d5fac00000000';

function stubEsplora(routes) {
  return async (path) => {
    if (path in routes) return routes[path];
    throw new Error(`unexpected fetch: ${path}`);
  };
}

const genesisRoutes = {
  '/block-height/0': GENESIS_HASH,
  [`/block/${GENESIS_HASH}`]: { tx_count: 1 },
  [`/block/${GENESIS_HASH}/txids`]: [GENESIS_TXID],
  [`/tx/${GENESIS_TXID}/hex`]: GENESIS_TX_HEX,
};

test('a height citation resolves to its section txid and bytes', async () => {
  const r = await resolveCitation({ height: 0, section: 1 }, stubEsplora(genesisRoutes));
  assert.deepEqual(r, { status: 'ok', height: 0, index: 0, txid: GENESIS_TXID, txCount: 1, hex: GENESIS_TX_HEX });
});

test('a txid citation resolves through its merkle proof; missing bytes cost only the hex', async () => {
  const r = await resolveCitation({ txid: GENESIS_TXID, section: null }, stubEsplora({
    [`/tx/${GENESIS_TXID}/merkle-proof`]: { block_height: 0, pos: 0 },
  }));
  assert.equal(r.status, 'ok');
  assert.equal(r.height, 0);
  assert.equal(r.index, 0);
  assert.equal(r.hex, null);                        // the stub has no hex route — best-effort, not fatal
});

test('future chapters and absent sections come back named', async () => {
  const r = await resolveCitation({ height: 99999999, section: 1 }, stubEsplora({
    '/block-height/99999999': null,
    '/blocks/tip/height': '908123',
  }));
  assert.deepEqual(r, { status: 'unwritten', height: 99999999, tip: 908123 });

  const s = await resolveCitation({ height: 0, section: 5 }, stubEsplora(genesisRoutes));
  assert.deepEqual(s, { status: 'no-section', height: 0, section: 5, txCount: 1 });

  const t = await resolveCitation({ txid: 'ee'.repeat(32), section: null }, stubEsplora({
    [`/tx/${'ee'.repeat(32)}/merkle-proof`]: null,
  }));
  assert.equal(t.status, 'not-found');
});

// ─── OAuth 1.0a, against X's published vector ───────────────────────────

test('the OAuth 1.0a signature matches the documented example', () => {
  // The worked example from X's "Creating a signature" developer guide
  // (its URL is the v1 API's — what matters is that the signature matches).
  const header = oauth1Header({
    method: 'POST',
    url: 'https://api.twitter.com/1/statuses/update.json',
    consumerKey: 'xvz1evFS4wEEPTGEFPHBog',
    consumerSecret: 'kAcSOqF21Fu85e7zjz7ZN2U4ZRhfV3WpwPAoE3Z7kBw',
    accessToken: '370773112-GmHxMAgYyLbNEtIKZeRNFsMKPR9EyMZeS9weJAEb',
    accessSecret: 'LswwdoUaIvS8ltyTt5jkRh4J50vUPVVHtR2YPi5kE',
    params: {
      status: 'Hello Ladies + Gentlemen, a signed OAuth request!',
      include_entities: 'true',
    },
    nonce: 'kYjzVBB8Y0ZFabxSWbWovY3uYSQ2pTgmZeNu2VS4cg',
    timestamp: 1318622958,
  });
  const sig = decodeURIComponent(header.match(/oauth_signature="([^"]+)"/)[1]);
  assert.equal(sig, 'tnnArxj06cWHq44gCs1OSKk/jLY=');
});

// ─── the whole pipeline, through the real engine ────────────────────────
//
// Skipped when the WASM artifacts aren't built (a bare checkout); run
// ./build_web.sh first to exercise it.

const engineBuilt = await access(new URL('../../web/glossia.js', import.meta.url)).then(() => true, () => false);

test('a genesis citation quotes the section — sigla, headline, amount — and decodes', { skip: !engineBuilt && 'web/glossia.js not built' }, async () => {
  const { proseOf, sectionOf } = await ensureEngine();

  const r = await replyFor('#bookofbitcoin I β1 ■1 §1', { esplora: stubEsplora(genesisRoutes), proseOf, sectionOf });
  assert.ok(r.text, 'expected a reply');
  assert.match(r.text, /^I β1 ■1 §1 — The Times 03\/Jan\/2009/);
  assert.ok(r.text.includes(`${SITE}/bitcoin-book.html?block=0&index=0`));
  assert.ok(weighText(r.text.slice(0, r.text.lastIndexOf('https://'))) + 23 <= TWEET_WEIGHT_BUDGET);

  // The section outweighs a tweet, so the full passage rides as an image:
  // the tweet's excerpt is ellipsized, and the passage carries the whole
  // section in the book's notation.
  assert.ok(r.passage, 'expected the section to overflow into a passage image');
  assert.match(r.text, /…”/);
  const { section, txidProse } = r.passage;
  assert.ok(section, 'expected the composed section');
  assert.match(section.flat, /version 1\n/);
  assert.ok(section.flat.includes('∅ coinbase'), 'the null prevout reads as coinbase');
  assert.ok(section.flat.includes('The Times 03/Jan/2009 Chancellor on brink of second bailout for banks'),
    'the headline rides verbatim in the scriptSig quote');
  assert.ok(section.flat.includes('50.00000000 ₿'), 'the subsidy reads in ₿');
  assert.ok(section.flat.includes('∇'), 'OP_CHECKSIG reads as its siglum');

  // And the opening verse — the txid as prose, cover words and all — must
  // still decode back to the txid: the book's core promise, held in the
  // quote. (The decoder filters prose against the wordlist, so cover words
  // pass through.)
  const { decodeSeedPhrase } = await import('../../web/glossia-msg.js');
  const reversed = decodeSeedPhrase(txidProse, 32, 'english').hex;
  const txid = (reversed.match(/../g) || []).reverse().join('');
  assert.equal(txid, GENESIS_TXID);
});

// ─── the passage image, when Playwright is installed ────────────────────

const renderer = await loadRenderer();

test('the renderer fits the root size to the page, and clips only when it must', { skip: !renderer && 'playwright not installed' }, async () => {
  const passage = {
    cite: 'I β1 ■1 §1', title: 'The Genesis Block', sectionNum: 1,
    txidProse: 'A short verse of prose.',
    section: { fields: stubFields(), footnotesHtml: [] },
  };

  const short = await renderer.render(passage, { site: SITE });
  assert.deepEqual([...short.png.subarray(0, 8)], [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  assert.ok(short.fitted, 'a one-line section fits');
  assert.ok(short.fontSize > 20, `a short passage is set large, got ${short.fontSize}`);

  // The same page, with a section far too long for it: the search bottoms
  // out at the floor and the passage is shown from its opening.
  const manyInputs = stubFields({
    inputs: Array.from({ length: 80 }, () => stubFields().inputs[0]),
    outputs: Array.from({ length: 80 }, () => stubFields().outputs[0]),
  });
  const long = await renderer.render(
    { ...passage, section: { fields: manyInputs, footnotesHtml: [] } }, { site: SITE });
  assert.equal(long.fontSize, FONT_MIN, 'a passage past the floor keeps the floor');
  assert.equal(long.fitted, false, 'and is clipped to its opening');
  assert.ok(long.fontSize < short.fontSize, 'a longer passage is set smaller');

  await renderer.close();
});

test('a tweet with the hashtag but no citation is passed over', async () => {
  const r = await replyFor('gm #bookofbitcoin', { esplora: stubEsplora({}), proseOf: () => ({}) });
  assert.equal(r.skip, 'no citation found');
});
