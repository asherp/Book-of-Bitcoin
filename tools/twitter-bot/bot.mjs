#!/usr/bin/env node
// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/twitter-bot/bot.mjs — the βook of βitcoin's reply bot: watch a
// hashtag on X for citations and answer each with chapter and verse.
//
// Someone tweets "#bookofbitcoin III β2 ■5 §1" (or the ascii "III b2 c5 s1",
// a packed "#IIIb2c5s1", "block 170 §2", or a bare txid) and the bot replies
// with the passage's canonical citation, its curated title if the table of
// contents names it, the section's transaction id quoted as Glossia prose —
// a verse that decodes back to the txid — and a deep link into the live book.
//
// One pass per invocation: search since the last seen tweet, reply to what
// parses, save state, exit. Run it from cron (or the twitter-bot.yml
// workflow); it keeps its own since_id watermark and a replied-to ledger in
// state.json, so overlapping or repeated runs never double-reply.
//
//   node tools/twitter-bot/bot.mjs                  # one pass
//   node tools/twitter-bot/bot.mjs --dry-run        # search + render, post nothing
//   node tools/twitter-bot/bot.mjs --render "III β2 ■5 §1"   # no X at all:
//       parse + render the reply for the given text to stdout (needs no
//       credentials — the way to try the bot before creating any)
//
// Credentials (environment):
//   X_BEARER_TOKEN    app-only bearer, for recent search
//   X_API_KEY / X_API_SECRET / X_ACCESS_TOKEN / X_ACCESS_SECRET
//                     OAuth 1.0a user context, for posting replies
// Tuning (environment, all optional):
//   BOT_HASHTAG       the tag watched (default #bookofbitcoin)
//   BOT_HANDLE        the bot's own @handle, excluded from search results
//   BOT_MAX_REPLIES   replies per pass (default 5)
//   BOT_REPLY_UNWRITTEN  set to 0 to skip, rather than answer, citations of
//                     chapters the chain has not reached
//   BOT_SITE          the book's origin (default https://bookofbitcoin.io)
//   BOT_STATE         state file path (default tools/twitter-bot/state.json)
//
// The Glossia engine (web/glossia.js + glossia_bg.wasm) is a build artifact;
// if it is missing the bot fetches it from the deployed site, so running the
// bot needs Node and nothing else — no Rust toolchain.

import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

import { parseCitation } from './citation.mjs';
import { resolveCitation, composeReply, composeUnwritten, composeNoSection } from './quote.mjs';
import { searchRecent, postTweet, XApiError } from './x-api.mjs';

const SITE = process.env.BOT_SITE || 'https://bookofbitcoin.io';
const HASHTAG = process.env.BOT_HASHTAG || '#bookofbitcoin';
const MAX_REPLIES = parseInt(process.env.BOT_MAX_REPLIES || '5', 10);
const REPLY_UNWRITTEN = process.env.BOT_REPLY_UNWRITTEN !== '0';
const STATE_PATH = process.env.BOT_STATE || new URL('./state.json', import.meta.url).pathname;

// Match the book's rendering choices exactly (bitcoin-book.html /
// tools/prerender-passages.mjs).
const BEST_OF = 5;

const ESPLORA_MIRRORS = ['https://blockstream.info/api', 'https://mempool.space/api'];

async function esplora(path, kind = 'text') {
  let lastErr;
  for (const base of ESPLORA_MIRRORS) {
    try {
      const res = await fetch(base + path);
      if (res.status === 404) return null;          // genuinely absent (a future block, an unknown txid)
      if (!res.ok) throw new Error(`${res.status} on ${base + path}`);
      return kind === 'json' ? await res.json() : (await res.text()).trim();
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error(`all mirrors failed for ${path}`);
}

// ─── the engine ─────────────────────────────────────────────────────────
//
// glossia-msg.js imports ./glossia.js statically, so the artifacts must be
// in place before the module is; hence the dynamic import after the check.

const WEB = new URL('../../web/', import.meta.url);

async function ensureEngine() {
  for (const name of ['glossia.js', 'glossia_bg.wasm']) {
    const dest = new URL(name, WEB);
    try { await readFile(dest); continue; } catch { /* missing — fetch it */ }
    const res = await fetch(`${SITE}/${name}`);
    if (!res.ok) {
      throw new Error(`engine artifact ${name} is missing and ${SITE}/${name} returned ` +
        `${res.status} — run ./build_web.sh, or set BOT_SITE to a deployment that serves it`);
    }
    await writeFile(dest, Buffer.from(await res.arrayBuffer()));
    console.log(`  fetched ${name} from ${SITE}`);
  }
  const { init, encodeSeedPhrase } = await import('../../web/glossia-msg.js');
  const wasmBytes = await readFile(new URL('glossia_bg.wasm', WEB));
  try { await init({ module_or_path: wasmBytes }); }
  catch { await init(wasmBytes); }
  return (hex) => encodeSeedPhrase(hex, 'english', BEST_OF);
}

// ─── state ──────────────────────────────────────────────────────────────
//
// sinceId is the search watermark; replied is the ledger of tweet ids
// already answered (or deliberately skipped), kept so a rewound watermark —
// a fresh cache, a hand-edited file — still never double-replies.

const REPLIED_KEEP = 1000;

async function loadState() {
  try { return JSON.parse(await readFile(STATE_PATH, 'utf8')); }
  catch { return { sinceId: null, replied: {} }; }
}

async function saveState(state) {
  const ids = Object.keys(state.replied);
  if (ids.length > REPLIED_KEEP) {
    ids.sort((a, b) => (BigInt(a) < BigInt(b) ? -1 : 1));
    for (const id of ids.slice(0, ids.length - REPLIED_KEEP)) delete state.replied[id];
  }
  await mkdir(new URL('.', pathToFileURL(STATE_PATH)), { recursive: true });
  const tmp = STATE_PATH + '.tmp';
  await writeFile(tmp, JSON.stringify(state, null, 2));
  await rename(tmp, STATE_PATH);
}

// ─── one tweet -> one reply (or a reason not to) ────────────────────────
//
// Returns { text } to post, or { skip: reason } to pass silently.

export async function replyFor(text, { esplora: fetchFn, proseOf, site = SITE, replyUnwritten = REPLY_UNWRITTEN } = {}) {
  const cit = parseCitation(text);
  if (!cit) return { skip: 'no citation found' };

  const r = await resolveCitation(cit, fetchFn);
  switch (r.status) {
    case 'ok':
      return { text: composeReply({ height: r.height, index: r.index, txid: r.txid, site, proseOf }) };
    case 'unwritten':
      return replyUnwritten
        ? { text: composeUnwritten({ height: r.height, tip: r.tip, site }) }
        : { skip: `chapter ${r.height} not yet mined` };
    case 'no-section':
      return { text: composeNoSection({ height: r.height, section: r.section, txCount: r.txCount, site }) };
    default:
      return { skip: 'txid not found on chain' };
  }
}

// ─── main ───────────────────────────────────────────────────────────────

function need(name) {
  const v = process.env[name];
  if (!v) { console.error(`missing ${name} in the environment`); process.exit(1); }
  return v;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const renderAt = args.indexOf('--render');

  const proseOf = await ensureEngine();

  // --render: the whole pipeline minus X — parse the given text, resolve it
  // against the chain, print the reply. The way to try the bot with no
  // developer account at all.
  if (renderAt !== -1) {
    const text = args[renderAt + 1];
    if (!text) { console.error('usage: bot.mjs --render "<tweet text>"'); process.exit(1); }
    const r = await replyFor(text, { esplora, proseOf });
    if (r.skip) { console.log(`(no reply: ${r.skip})`); return; }
    console.log(r.text);
    return;
  }

  const bearer = need('X_BEARER_TOKEN');
  const creds = dryRun ? null : {
    consumerKey: need('X_API_KEY'),
    consumerSecret: need('X_API_SECRET'),
    accessToken: need('X_ACCESS_TOKEN'),
    accessSecret: need('X_ACCESS_SECRET'),
  };

  const state = await loadState();
  const handle = (process.env.BOT_HANDLE || '').replace(/^@/, '');
  const query = `${HASHTAG} -is:retweet${handle ? ` -from:${handle}` : ''}`;

  let tweets, newestId;
  try {
    ({ tweets, newestId } = await searchRecent({ bearer, query, sinceId: state.sinceId }));
  } catch (e) {
    if (e instanceof XApiError && e.rateLimited) { console.warn('rate limited on search; next run will catch up'); return; }
    throw e;
  }
  console.log(`${tweets.length} tweet(s) for ${JSON.stringify(query)} since ${state.sinceId || 'the beginning'}`);

  let replies = 0;
  for (const tweet of tweets) {
    if (state.replied[tweet.id]) continue;
    if (replies >= MAX_REPLIES) break;             // watermark stays behind; the rest wait for the next pass

    let outcome;
    try {
      outcome = await replyFor(tweet.text, { esplora, proseOf });
    } catch (e) {
      console.warn(`  ${tweet.id}: resolve failed (${e.message}) — left for the next pass`);
      continue;                                    // transient (explorer outage); not marked, retried later
    }

    if (outcome.skip) {
      console.log(`  ${tweet.id}: skip — ${outcome.skip}`);
      state.replied[tweet.id] = { at: new Date().toISOString(), skipped: outcome.skip };
      continue;
    }

    if (dryRun) {
      console.log(`  ${tweet.id}: would reply:\n${outcome.text.replace(/^/gm, '    ')}`);
      replies++;
      continue;                                    // dry runs mark nothing: the real run answers these
    }

    try {
      const posted = await postTweet({ creds, text: outcome.text, inReplyTo: tweet.id });
      state.replied[tweet.id] = { at: new Date().toISOString(), replyId: posted.id };
      replies++;
      console.log(`  ${tweet.id}: replied ${posted.id}`);
    } catch (e) {
      if (e instanceof XApiError && e.rateLimited) { console.warn('rate limited on post; stopping this pass'); break; }
      console.warn(`  ${tweet.id}: post failed (${e.message}) — left for the next pass`);
    }
  }

  // Advance the watermark only past what this pass fully disposed of: if a
  // reply cap or rate limit left tweets unanswered, the next pass re-reads
  // them (the replied ledger absorbs the overlap).
  const pending = tweets.some((t) => !state.replied[t.id]);
  if (!dryRun) {
    if (!pending && newestId) state.sinceId = newestId;
    else if (tweets.length) {
      const answered = tweets.filter((t) => state.replied[t.id]).map((t) => BigInt(t.id));
      // The watermark may only move up to just below the oldest unanswered id.
      const oldestPending = tweets.filter((t) => !state.replied[t.id]).map((t) => BigInt(t.id)).sort((a, b) => (a < b ? -1 : 1))[0];
      const safe = answered.filter((id) => id < oldestPending).sort((a, b) => (a < b ? -1 : 1)).pop();
      if (safe !== undefined) state.sinceId = String(safe);
    }
    await saveState(state);
  }
  console.log(`${replies} repl${replies === 1 ? 'y' : 'ies'}${dryRun ? ' (dry run — nothing posted, nothing recorded)' : ''}.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
