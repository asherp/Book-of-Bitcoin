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
  resolveCitation, titleFor, TWEET_WEIGHT_BUDGET,
} from './quote.mjs';
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

test('a reply carries citation, title, verse, and link, within budget', () => {
  const proseOf = () => ({ prose: 'A short verse of prose.', payloadWords: ['short', 'verse', 'prose'] });
  const text = composeReply({ height: 57043, index: 0, txid: 'ab'.repeat(32), site: SITE, proseOf });
  assert.match(text, /^I β29 ■596 §1 — Bitcoin Pizza Day\n/);
  assert.match(text, /“A short verse of prose\.”/);
  assert.ok(text.endsWith(`${SITE}/bitcoin-book.html?block=57043&index=0`));
  assert.ok(weighText(text) <= TWEET_WEIGHT_BUDGET);
});

test('an overweight verse falls back to payload words, then an ellipsis', () => {
  const longProse = 'word '.repeat(120).trim();
  const payloadWords = Array.from({ length: 24 }, (_, i) => `w${i}`);
  const proseOf = () => ({ prose: longProse, payloadWords });
  const text = composeReply({ height: 422020, index: 4, txid: 'cd'.repeat(32), site: SITE, proseOf });
  assert.match(text, /“w0 w1 /);                  // slimmed to payload words
  assert.ok(!text.includes(longProse));
  const urlWeight = 23;
  assert.ok(weighText(text.slice(0, text.lastIndexOf('https://'))) + urlWeight <= TWEET_WEIGHT_BUDGET);

  const hugeWords = Array.from({ length: 80 }, () => 'juggernaut');
  const text2 = composeReply({
    height: 422020, index: 4, txid: 'cd'.repeat(32), site: SITE,
    proseOf: () => ({ prose: hugeWords.join(' '), payloadWords: hugeWords }),
  });
  assert.match(text2, /…”/);                      // last resort: a trimmed excerpt
  assert.ok(weighText(text2.slice(0, text2.lastIndexOf('https://'))) + urlWeight <= TWEET_WEIGHT_BUDGET);
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

  // The verse must decode back to the txid — the book's core promise, held
  // even in a tweet. (The quoted verse may be the slimmed payload-only form;
  // both decode identically.)
  const verse = r.text.match(/“([^”]+)”/)[1].replace(/…$/, '');
  const reversed = decodeSeedPhrase(verse, 32, 'english').hex;
  const txid = (reversed.match(/../g) || []).reverse().join('');
  assert.equal(txid, GENESIS_TXID);
});

test('a tweet with the hashtag but no citation is passed over', async () => {
  const r = await replyFor('gm #bookofbitcoin', { esplora: stubEsplora({}), proseOf: () => ({}) });
  assert.equal(r.skip, 'no citation found');
});
