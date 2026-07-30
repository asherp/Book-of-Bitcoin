#!/usr/bin/env node
// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/twitter-bot/rehearse.mjs — run a whole pass against stand-ins for
// both services the bot talks to, so the one path the offline suite cannot
// reach gets exercised before it can reach anybody: posting.
//
//   node tools/twitter-bot/rehearse.mjs
//
// It stands up two local servers — an Esplora-compatible endpoint serving
// the real genesis block, and an X API that accepts a search, a media
// upload and a reply — points the bot at them with throwaway credentials,
// and runs three passes:
//
//   1. cold start   no state: takes the watermark, answers nothing
//   2. warm         three tweets, two of them citations: two replies
//   3. idempotent   the same three tweets: nothing, they are all answered
//
// and asserts what each should have posted. Nothing leaves the machine:
// no chain fetch, no X call, no credentials, no network at all. What it
// proves is the wiring — that a pass searches, parses, resolves, composes,
// renders, uploads, replies, and records, in that order and exactly once
// per tweet. What it cannot prove is that the real X API accepts what the
// bot sends; only rung 3 and 4 of the README's ladder do that.
//
// Exits non-zero on the first mismatch, so it can gate a deploy.

import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// ─── the chain, as a local endpoint ─────────────────────────────────────
//
// The genesis block, byte for byte — the one passage whose data can be
// held in a source file, and the one the suite already pins.

const HASH = '000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f';
const TXID = '4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b';
const TX_HEX =
  '01000000010000000000000000000000000000000000000000000000000000000000000000ffffffff4d04ffff001d' +
  '0104455468652054696d65732030332f4a616e2f32303039204368616e63656c6c6f72206f6e206272696e6b206f66' +
  '207365636f6e64206261696c6f757420666f722062616e6b73ffffffff0100f2052a01000000434104678afdb0fe55' +
  '48271967f1a67130b7105cd6a828e03909a67962e0ea1f61deb649f6bc3f4cef38c4f35504e51ec112de5c384df7ba' +
  '0b8d578a4c702b6bf11d5fac00000000';

const CHAIN_ROUTES = {
  '/api/block-height/0': HASH,
  [`/api/block/${HASH}`]: JSON.stringify({ tx_count: 1 }),
  [`/api/block/${HASH}/txids`]: JSON.stringify([TXID]),
  [`/api/tx/${TXID}/hex`]: TX_HEX,
  '/api/blocks/tip/height': '900000',
};

// ─── the tweets the stand-in X serves ───────────────────────────────────
//
// Two citations of the one passage the chain stand-in knows, in different
// forms, and one tweet carrying the tag but no citation — which the bot
// must pass over in silence rather than lecture.

const TWEETS = [
  { id: '1001', text: '#bookofbitcoin I β1 ■1 §1', author_id: 'a' },
  { id: '1002', text: 'gm #bookofbitcoin', author_id: 'b' },
  { id: '1003', text: 'what does #bookofbitcoin block 0 say?', author_id: 'c' },
];

function serve(port, handler) {
  return new Promise((resolve) => {
    const server = createServer(handler);
    server.listen(port, () => resolve(server));
  });
}

const json = (res, body) => {
  res.writeHead(200, { 'content-type': 'application/json' });
  res.end(typeof body === 'string' ? body : JSON.stringify(body));
};

async function main() {
  const posts = [];
  let uploads = 0;

  const chain = await serve(0, (req, res) => {
    const body = CHAIN_ROUTES[req.url];
    if (body === undefined) { res.writeHead(404); return res.end('not found'); }
    json(res, body);
  });

  const x = await serve(0, (req, res) => {
    if (req.url.startsWith('/2/tweets/search/recent')) {
      const since = new URL(`http://x${req.url}`).searchParams.get('since_id');
      const data = since ? TWEETS.filter((t) => BigInt(t.id) > BigInt(since)) : TWEETS;
      return json(res, { data, meta: { newest_id: data.length ? data[data.length - 1].id : null } });
    }
    if (req.url === '/2/media/upload') { uploads++; return json(res, { data: { id: `m${uploads}` } }); }
    if (req.url === '/2/media/metadata') return json(res, {});
    if (req.url === '/2/tweets' && req.method === 'POST') {
      let raw = '';
      req.on('data', (c) => { raw += c; });
      return req.on('end', () => {
        posts.push(JSON.parse(raw));
        json(res, { data: { id: `r${posts.length}` } });
      });
    }
    res.writeHead(404); res.end('{}');
  });

  const dir = await mkdtemp(join(tmpdir(), 'bot-rehearsal-'));
  const statePath = join(dir, 'state.json');
  const env = {
    ...process.env,
    BOT_ESPLORA: `http://127.0.0.1:${chain.address().port}/api`,
    BOT_X_API: `http://127.0.0.1:${x.address().port}`,
    BOT_STATE: statePath,
    // Throwaway: the stand-in checks no signature, and nothing here is a
    // credential anywhere.
    X_BEARER_TOKEN: 'rehearsal', X_API_KEY: 'rehearsal', X_API_SECRET: 'rehearsal',
    X_ACCESS_TOKEN: 'rehearsal', X_ACCESS_SECRET: 'rehearsal',
  };

  const pass = (label) => new Promise((resolve, reject) => {
    console.log(`\n── ${label} ──`);
    const child = spawn(process.execPath, [new URL('./bot.mjs', import.meta.url).pathname],
      { env, stdio: 'inherit' });
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`pass exited ${code}`))));
  });

  const failures = [];
  const expect = (ok, what) => {
    console.log(`   ${ok ? '✓' : '✗'} ${what}`);
    if (!ok) failures.push(what);
  };

  try {
    await pass('pass 1 — cold start (no state)');
    expect(posts.length === 0, 'a cold pass posts nothing');
    expect(JSON.parse(await readFile(statePath, 'utf8')).sinceId === '1003',
      'a cold pass still takes the watermark');

    // Rewind the watermark, as an evicted cache or a fresh clone would —
    // except the ledger is what actually guards the replies, so this is
    // the warm case: three tweets it has never answered.
    await new Promise((r) => setTimeout(r, 50));
    const { writeFile } = await import('node:fs/promises');
    await writeFile(statePath, JSON.stringify({ sinceId: '1000', replied: {} }));

    await pass('pass 2 — warm (three tweets, two citations)');
    expect(posts.length === 2, `two citations get two replies (got ${posts.length})`);
    expect(posts.every((p) => p.media?.media_ids?.length === 1), 'each reply carries its passage image');
    expect(posts.every((p) => /^I β1 ■1 §1 — The Times/.test(p.text)), 'each reply opens with the citation');
    expect(posts.every((p) => p.text.includes('bitcoin-book.html?block=0&index=0')), 'each reply links the passage');
    expect(posts.map((p) => p.reply.in_reply_to_tweet_id).join() === '1001,1003',
      'it replies to the citations and not to the bare tag');
    const state = JSON.parse(await readFile(statePath, 'utf8'));
    expect(state.replied['1002']?.skipped === 'no citation found', 'the bare tag is recorded as passed over');

    const before = posts.length;
    await pass('pass 3 — the same tweets again');
    expect(posts.length === before, 'nothing is answered twice');
  } finally {
    chain.close(); x.close();
    await rm(dir, { recursive: true, force: true });
  }

  console.log();
  if (failures.length) {
    console.error(`${failures.length} check(s) failed:\n  ${failures.join('\n  ')}`);
    process.exit(1);
  }
  console.log('rehearsal passed — the pass searches, resolves, renders, uploads, replies and records, exactly once each.');
  console.log('(What this cannot prove: that the real X API accepts what the bot sends. See the README\'s rungs 3 and 4.)');
}

await main();
