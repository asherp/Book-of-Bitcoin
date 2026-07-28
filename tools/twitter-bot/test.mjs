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
  resolveCitation, titleFor, passageHtml, passageAltText, TWEET_WEIGHT_BUDGET,
} from './quote.mjs';
import { loadRenderer } from './image.mjs';
import { oauth1Header } from './x-api.mjs';
import { replyFor } from './bot.mjs';

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
  const longProse = Array.from({ length: 120 }, (_, i) => `word${i}`).join(' ');
  const proseOf = () => ({ prose: longProse });
  const { text, passage } = composeReply({ height: 422020, index: 4, txid: 'cd'.repeat(32), site: SITE, proseOf });

  assert.match(text, /“word0 word1 /);            // the verse itself, from its first word
  assert.match(text, /…”/);                       // trimmed at a word boundary, marked honestly
  const urlWeight = 23;
  assert.ok(weighText(text.slice(0, text.lastIndexOf('https://'))) + urlWeight <= TWEET_WEIGHT_BUDGET);

  assert.ok(passage, 'expected a passage for the image');
  assert.equal(passage.verse, longProse);         // unabridged — cover words never stripped
  assert.equal(passage.cite, 'III β2 ■5 §5');
});

test('the passage page escapes its text and carries the whole verse', () => {
  const html = passageHtml({
    cite: 'I β1 ■1 §1',
    title: 'A <title> & "quotes"',
    verse: 'A verse with <angle> brackets & ampersands.',
    site: SITE,
  });
  assert.ok(html.includes('A &lt;title&gt; &amp; &quot;quotes&quot;'));
  assert.ok(html.includes('A verse with &lt;angle&gt; brackets &amp; ampersands.'));
  assert.ok(!html.includes('<angle>'));
  assert.ok(html.includes('bookofbitcoin.io'));

  const alt = passageAltText({ cite: 'I β1 ■1 §1', title: 'T', verse: 'v '.repeat(600).trim() });
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
};

test('a height citation resolves to its section txid', async () => {
  const r = await resolveCitation({ height: 0, section: 1 }, stubEsplora(genesisRoutes));
  assert.deepEqual(r, { status: 'ok', height: 0, index: 0, txid: GENESIS_TXID, txCount: 1 });
});

test('a txid citation resolves through its merkle proof', async () => {
  const r = await resolveCitation({ txid: GENESIS_TXID, section: null }, stubEsplora({
    [`/tx/${GENESIS_TXID}/merkle-proof`]: { block_height: 0, pos: 0 },
  }));
  assert.equal(r.status, 'ok');
  assert.equal(r.height, 0);
  assert.equal(r.index, 0);
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

test('a genesis citation renders a decodable verse', { skip: !engineBuilt && 'web/glossia.js not built' }, async () => {
  const { init, encodeSeedPhrase, decodeSeedPhrase } = await import('../../web/glossia-msg.js');
  const { readFile } = await import('node:fs/promises');
  const wasmBytes = await readFile(new URL('../../web/glossia_bg.wasm', import.meta.url));
  try { await init({ module_or_path: wasmBytes }); }
  catch { await init(wasmBytes); }
  const proseOf = (hex) => encodeSeedPhrase(hex, 'english', 5);

  const r = await replyFor('#bookofbitcoin I β1 ■1 §1', { esplora: stubEsplora(genesisRoutes), proseOf });
  assert.ok(r.text, 'expected a reply');
  assert.match(r.text, /^I β1 ■1 §1 — The Times 03\/Jan\/2009/);
  assert.ok(r.text.includes(`${SITE}/bitcoin-book.html?block=0&index=0`));
  assert.ok(weighText(r.text.slice(0, r.text.lastIndexOf('https://'))) + 23 <= TWEET_WEIGHT_BUDGET);

  // The genesis verse (with its long curated title) outweighs a tweet, so
  // the full passage rides as an image: the tweet's excerpt ends in an
  // ellipsis, and the passage's verse — cover words and all — must decode
  // back to the txid, the book's core promise held at full length. (The
  // decoder filters prose against the wordlist, so cover words pass through.)
  assert.ok(r.passage, 'expected the verse to overflow into a passage image');
  assert.match(r.text, /…”/);
  const reversed = decodeSeedPhrase(r.passage.verse, 32, 'english').hex;
  const txid = (reversed.match(/../g) || []).reverse().join('');
  assert.equal(txid, GENESIS_TXID);
});

// ─── the passage image, when Playwright is installed ────────────────────

const renderer = await loadRenderer();

test('the passage page renders to a PNG', { skip: !renderer && 'playwright not installed' }, async () => {
  const png = await renderer.render(passageHtml({
    cite: 'I β1 ■1 §1', title: 'The Genesis Block', verse: 'A verse.', site: SITE,
  }));
  await renderer.close();
  assert.ok(png.length > 1000, 'expected a real image');
  assert.deepEqual([...png.subarray(0, 8)], [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
});

test('a tweet with the hashtag but no citation is passed over', async () => {
  const r = await replyFor('gm #bookofbitcoin', { esplora: stubEsplora({}), proseOf: () => ({}) });
  assert.equal(r.skip, 'no citation found');
});
