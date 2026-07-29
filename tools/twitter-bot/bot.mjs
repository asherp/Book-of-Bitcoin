#!/usr/bin/env node
// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/twitter-bot/bot.mjs — the βook of βitcoin's reply bot: watch a
// hashtag on X for citations and answer each with chapter and verse.
//
// Someone tweets "#bookofbitcoin III β2 ■5 §1" (or the ascii "III b2 c5 s1",
// a packed "#IIIb2c5s1", "block 170 §2", or a bare txid) and the bot replies
// with the passage's canonical citation, its curated title if the table of
// contents names it, and the section itself quoted in the book's notation —
// scripts as opcode sigla, amounts in ₿, witness footnotes, the txid as
// decodable Glossia prose — with a deep link into the live book. A section
// too long for the tweet (nearly all of them) is ellipsized in text and
// rides whole as an attached image, a rendered page of the book.
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
//   BOT_ESPLORA       chain source(s), comma-separated — your own node, or a
//                     local stand-in for testing (default: the public mirrors)
//   BOT_DEBUG         set to 1 to print a stack on failure, not just the message
//   BOT_IMAGE_WIDTH / BOT_IMAGE_HEIGHT
//                     the passage image's size (default 1200x1500, 4:5)
//   BOT_SITE          the book's origin (default https://bookofbitcoin.io)
//   BOT_STATE         state file path (default tools/twitter-bot/state.json)
//
// The Glossia engine (web/glossia.js + glossia_bg.wasm) is a build artifact;
// if it is missing the bot fetches it from the deployed site, so running the
// bot needs Node and nothing else — no Rust toolchain.

import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

import { reference } from '../../web/btc-citation.js';

import { parseCitation } from './citation.mjs';
import {
  resolveCitation, composeReply, composeUnwritten, composeNoSection,
  sectionParts, passageAltText, PAGE_WIDTH, PAGE_HEIGHT,
} from './quote.mjs';
import { loadRenderer } from './image.mjs';
import { searchRecent, postTweet, uploadMedia, setAltText, XApiError } from './x-api.mjs';

const SITE = process.env.BOT_SITE || 'https://bookofbitcoin.io';
const HASHTAG = process.env.BOT_HASHTAG || '#bookofbitcoin';
const MAX_REPLIES = parseInt(process.env.BOT_MAX_REPLIES || '5', 10);
const REPLY_UNWRITTEN = process.env.BOT_REPLY_UNWRITTEN !== '0';
const STATE_PATH = process.env.BOT_STATE || new URL('./state.json', import.meta.url).pathname;

// The passage image's size. The page is set from one root font size and
// every measure is an em off it, so the renderer fits any passage to
// whatever geometry is asked for here (see image.mjs). The default 4:5 is
// the tallest portrait X shows uncropped in a timeline.
const IMAGE = {
  width: parseInt(process.env.BOT_IMAGE_WIDTH || '', 10) || PAGE_WIDTH,
  height: parseInt(process.env.BOT_IMAGE_HEIGHT || '', 10) || PAGE_HEIGHT,
};

// Match the book's rendering choices exactly (bitcoin-book.html /
// tools/prerender-passages.mjs).
const BEST_OF = 5;

// A witness push or OP_RETURN payload beyond this many bytes is summarized
// instead of encoded — a data carrier (an inscription) can run to megabytes
// of prose, which belongs on the live page, not in a reply. Same cap as the
// prerenderer's.
const MAX_ENCODE_BYTES = 8192;

// The chain sources, tried in order. The public mirrors by default — the
// same two the reading pages and the prerenderer use — or any
// Esplora-compatible endpoint(s) you point BOT_ESPLORA at, comma-separated:
// your own node, or a local stand-in when testing the bot offline.
const ESPLORA_MIRRORS = (process.env.BOT_ESPLORA || '')
  .split(',').map((s) => s.trim().replace(/\/$/, '')).filter(Boolean);
if (!ESPLORA_MIRRORS.length) {
  ESPLORA_MIRRORS.push('https://blockstream.info/api', 'https://mempool.space/api');
}

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
// glossia-msg.js (and btc-prose.js, which encodes through it) import
// ./glossia.js statically, so the artifacts must be in place before either
// module is; hence the dynamic imports after the check.
//
// Returns { proseOf, sectionOf }: hex -> Glossia prose, and raw tx hex ->
// the section's composed fields as sectionParts (quote.mjs) lays them out.

const WEB = new URL('../../web/', import.meta.url);

export async function ensureEngine() {
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

  const { parseTransaction } = await import('../../web/btc-tx.js');
  const { composeTransactionFields, renderWitness } = await import('../../web/btc-prose.js');

  // Real prose for reasonable payloads, an honest placeholder beyond the
  // cap — mirrors the prerenderer's treatment of data carriers.
  const encodeCapped = (hex, lang = 'english', bestOf = BEST_OF) => {
    const bytes = hex.length / 2;
    if (bytes > MAX_ENCODE_BYTES) {
      const note = `⟨${bytes.toLocaleString('en-US')} bytes of data — the live page renders it in full⟩`;
      return { prose: note, payloadWords: [] };
    }
    return encodeSeedPhrase(hex, lang, bestOf);
  };
  const proseWithCap = (hex) => encodeCapped(hex).prose;

  return {
    proseOf: (hex) => encodeSeedPhrase(hex, 'english', BEST_OF),
    // The section, in both registers the reply needs: the composed fields
    // and rendered witness HTML (which the passage image sets as a
    // manuscript page), and the flattened text forms (which the tweet and
    // the alt text quote).
    sectionOf: (hex) => {
      const fields = composeTransactionFields(parseTransaction(hex), BEST_OF, proseWithCap, encodeCapped);
      const witnessOf = (inp) =>
        (inp.witnessItems.length ? (inp.witnessZero ? '∅' : renderWitness(inp.witnessItems, proseWithCap)) : null);
      const footnotesHtml = fields.inputs.map(witnessOf).filter((w) => w !== null);
      return { ...sectionParts(fields, witnessOf), fields, footnotesHtml };
    },
  };
}

// The left margin's provenance: each input's prevout resolved to its
// volume·book·chapter·section, the way the book resolves it (a merkle-proof
// lookup per prevout). Bounded and best-effort — this runs only on the
// image path, an unresolved input keeps its short txid, and a failure costs
// the margin one reference, never the reply.
const MAX_CITE_LOOKUPS = 8;

async function resolveInputCitations(fields, fetchFn) {
  const spends = fields.inputs
    .map((inp, i) => ({ inp, i }))
    .filter(({ inp }) => !inp.isNullPrevout);
  if (!spends.length || spends.length > MAX_CITE_LOOKUPS) return [];

  const citations = [];
  await Promise.all(spends.map(async ({ inp, i }) => {
    try {
      const proof = await fetchFn(`/tx/${inp.prevTxid}/merkle-proof`, 'json');
      if (proof) citations[i] = `${reference(proof.block_height)} §${proof.pos + 1} ⁄${inp.prevVout}`;
    } catch { /* the short txid stands in */ }
  }));
  return citations;
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
// Returns { text, passage } to post — `passage` non-null when the verse
// outgrew the tweet and should ride along as a rendered image — or
// { skip: reason } to pass silently.

export async function replyFor(text, { esplora: fetchFn, proseOf, sectionOf = null, site = SITE, replyUnwritten = REPLY_UNWRITTEN } = {}) {
  const cit = parseCitation(text);
  if (!cit) return { skip: 'no citation found' };

  const r = await resolveCitation(cit, fetchFn);
  switch (r.status) {
    case 'ok': {
      // The section itself — scripts in the sigla, amounts in ₿ — set from
      // the transaction's bytes. Best-effort: a missing hex or a compose
      // failure falls back to quoting the txid as prose.
      let section = null;
      if (r.hex && sectionOf) {
        try {
          section = sectionOf(r.hex);
          section.citations = await resolveInputCitations(section.fields, fetchFn);
        } catch (e) { console.warn(`  (section compose failed: ${e.message} — quoting the txid prose)`); }
      }
      return composeReply({ height: r.height, index: r.index, txid: r.txid, site, proseOf, section });
    }
    case 'unwritten':
      return replyUnwritten
        ? { text: composeUnwritten({ height: r.height, tip: r.tip, site }), passage: null }
        : { skip: `chapter ${r.height} not yet mined` };
    case 'no-section':
      return { text: composeNoSection({ height: r.height, section: r.section, txCount: r.txCount, site }), passage: null };
    default:
      return { skip: 'txid not found on chain' };
  }
}

// Render + upload the passage image for an overflowing reply. Best-effort
// end to end: no renderer, a render failure, or an upload failure each
// cost only the image — the ellipsized text still answers. Returns the
// media ids to attach ([] on any miss).
async function passageMedia(outcome, { renderer, creds, site }) {
  if (!outcome.passage || !renderer) return [];
  try {
    const { png, fontSize, fitted } = await renderer.render(outcome.passage, { site, ...IMAGE });
    console.log(`  (passage set at ${fontSize.toFixed(1)}px${fitted ? '' : ', clipped to its opening'})`);
    const mediaId = await uploadMedia({ creds, media: png });
    try { await setAltText({ creds, mediaId, text: passageAltText(outcome.passage) }); }
    catch (e) { console.warn(`  (alt text failed: ${e.message})`); }
    return [mediaId];
  } catch (e) {
    console.warn(`  (passage image failed: ${e.message} — replying with text alone)`);
    return [];
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

  const { proseOf, sectionOf } = await ensureEngine();

  // --render: the whole pipeline minus X — parse the given text, resolve it
  // against the chain, print the reply (and write the passage image beside
  // it when the verse overflows). The way to try the bot with no developer
  // account at all.
  if (renderAt !== -1) {
    const text = args[renderAt + 1];
    if (!text) { console.error('usage: bot.mjs --render "<tweet text>"'); process.exit(1); }
    const r = await replyFor(text, { esplora, proseOf, sectionOf });
    if (r.skip) { console.log(`(no reply: ${r.skip})`); return; }
    console.log(r.text);
    if (r.passage) {
      const renderer = await loadRenderer();
      if (renderer) {
        const { png, fontSize, fitted } = await renderer.render(r.passage, { site: SITE, ...IMAGE });
        await renderer.close();
        const out = 'passage.png';
        await writeFile(out, png);
        console.log(`\n(passage written to ${out} — set at ${fontSize.toFixed(1)}px` +
          `${fitted ? ', whole' : ', clipped to its opening'})`);
      } else {
        console.log('\n(passage overflows the tweet — with Playwright installed it would ride as an image; ' +
          'npm install in tools/twitter-bot/)');
      }
    }
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

  // The image renderer, for verses that outgrow the tweet. Optional: when
  // Playwright isn't installed the pass runs text-only.
  const renderer = await loadRenderer();
  if (!renderer) console.log('(no image renderer — overflowing verses will be ellipsized in text)');

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
      outcome = await replyFor(tweet.text, { esplora, proseOf, sectionOf });
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
      const note = outcome.passage ? (renderer ? ' [with passage image]' : ' [verse ellipsized — no renderer]') : '';
      console.log(`  ${tweet.id}: would reply${note}:\n${outcome.text.replace(/^/gm, '    ')}`);
      replies++;
      continue;                                    // dry runs mark nothing: the real run answers these
    }

    try {
      const mediaIds = await passageMedia(outcome, { renderer, creds, site: SITE });
      const posted = await postTweet({ creds, text: outcome.text, inReplyTo: tweet.id, mediaIds });
      state.replied[tweet.id] = { at: new Date().toISOString(), replyId: posted.id };
      replies++;
      console.log(`  ${tweet.id}: replied ${posted.id}${mediaIds.length ? ' (with passage image)' : ''}`);
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
  if (renderer) await renderer.close();
  console.log(`${replies} repl${replies === 1 ? 'y' : 'ies'}${dryRun ? ' (dry run — nothing posted, nothing recorded)' : ''}.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  // A pass that dies — an explorer outage, a missing engine, a bad
  // credential — says what went wrong in one line and exits non-zero. The
  // stack is behind BOT_DEBUG=1: a scheduled run's log should read as a
  // report, not a crash dump, and cron treats the exit code as the verdict.
  await main().catch((e) => {
    console.error(`error: ${e.message}`);
    if (process.env.BOT_DEBUG === '1') console.error(e);
    else console.error('(set BOT_DEBUG=1 for the stack)');
    process.exit(1);
  });
}
