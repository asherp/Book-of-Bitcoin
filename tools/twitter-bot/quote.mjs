// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/twitter-bot/quote.mjs — resolve a citation against the chain and
// compose the reply tweet: chapter and verse, quoted.
//
// The verse quoted is the section's transaction id rendered as Glossia
// prose — the same line every passage opens with ("Transaction id, as
// prose: …"), a bounded, canonical sentence that identifies the section
// and decodes back to its txid. The reply carries the book's own citation
// (canonicalized through reference(height), so a spilled or ascii-form
// citation is answered under its true address), the curated title when the
// table of contents has one, and a deep link into the live book.
//
// Everything here is pure logic over two injected functions — `esplora`
// (fetch, with mirror fallback; see bot.mjs) and `proseOf` (hex -> Glossia
// prose, backed by the WASM engine) — so the whole module tests offline.

import { reference } from '../../web/btc-citation.js';
import { NOTABLE } from '../../web/btc-contents-data.js';

// ─── tweet length, as X counts it ───────────────────────────────────────
//
// X weighs characters, not counts them: code points in a handful of "light"
// ranges (Latin, general punctuation — where all of BIP39 English and most
// of the book's sigla live) weigh 1, everything else (CJK, emoji, ■) weighs
// 2, and any URL is a t.co link at a flat 23. The budget is 280.

export const TWEET_WEIGHT_BUDGET = 280;
export const URL_WEIGHT = 23;

const LIGHT_RANGES = [
  [0x0000, 0x10ff],
  [0x2000, 0x200d],
  [0x2010, 0x201f],
  [0x2032, 0x2037],
];

export function weighText(s) {
  let w = 0;
  for (const ch of String(s)) {
    const cp = ch.codePointAt(0);
    w += LIGHT_RANGES.some(([lo, hi]) => cp >= lo && cp <= hi) ? 1 : 2;
  }
  return w;
}

// ─── citation -> chain data ─────────────────────────────────────────────
//
// Resolve to the section's txid and its canonical address. Returns one of
//   { status: 'ok', height, index, txid, txCount }
//   { status: 'unwritten', height, tip }        — chapter not yet mined
//   { status: 'no-section', height, section, txCount }
//   { status: 'not-found' }                     — txid unknown to the chain
// `cit` is parseCitation's output; `esplora(path, kind)` fetches with the
// book's mirror fallback and returns null on a 404.

export async function resolveCitation(cit, esplora) {
  if (cit.txid) {
    const proof = await esplora(`/tx/${cit.txid}/merkle-proof`, 'json');
    if (!proof) return { status: 'not-found' };
    return { status: 'ok', height: proof.block_height, index: proof.pos, txid: cit.txid, txCount: null };
  }

  const { height, section } = cit;
  const blockHash = await esplora(`/block-height/${height}`);
  if (!blockHash) {
    const tip = parseInt(await esplora('/blocks/tip/height'), 10);
    return { status: 'unwritten', height, tip };
  }
  const meta = await esplora(`/block/${blockHash}`, 'json');
  const txCount = meta.tx_count;
  if (section > txCount) return { status: 'no-section', height, section, txCount };

  const txids = await esplora(`/block/${blockHash}/txids`, 'json');
  return { status: 'ok', height, index: section - 1, txid: txids[section - 1], txCount };
}

// The curated title for a passage, if the table of contents names it. A
// txid entry names the transaction itself and wins; a height entry names
// the chapter's section 1 (or its explicit `index`) and comes second. Book
// leaves name a difficulty window, not a passage, and are skipped.
export function titleFor(height, index, txid) {
  const passages = NOTABLE.filter((e) => e.page !== 'book');
  const hit = passages.find((e) => e.id === txid)
    || passages.find((e) => e.id === String(height) && (e.index ?? 0) === index);
  return hit ? hit.title : null;
}

// ─── the reply itself ───────────────────────────────────────────────────

const reverseHex = (hex) => (hex.match(/../g) || []).reverse().join('');

// Compose the reply for a resolved passage. The verse is the txid as prose;
// if the full cover prose outweighs the budget, fall back to the payload
// words alone — a slimmed quote that still decodes to the same txid (the
// decoder filters prose against the wordlist either way) — and only as a
// last resort trim words with an ellipsis, at which point the quote is an
// excerpt rather than a decodable verse.
export function composeReply({ height, index, txid, site, proseOf }) {
  const cite = `${reference(height)} §${index + 1}`;
  const title = titleFor(height, index, txid);
  const url = `${site}/bitcoin-book.html?block=${height}&index=${index}`;
  const head = title ? `${cite} — ${title}` : cite;

  const { prose, payloadWords } = proseOf(reverseHex(txid));
  const frame = (verse) => `${head}\n\n“${verse}”\n\n${url}`;
  const budget = TWEET_WEIGHT_BUDGET - URL_WEIGHT - weighText(frame('').replace(url, ''));

  let verse = prose.trim();
  if (weighText(verse) > budget) verse = payloadWords.join(' ');
  if (weighText(verse) > budget) {
    const words = verse.split(' ');
    while (words.length > 1 && weighText(words.join(' ') + '…') > budget) words.pop();
    verse = words.join(' ') + '…';
  }
  return frame(verse);
}

// Compose the gentle refusals: a chapter the chain has not reached, or a
// section a chapter does not have. Same register as the book's own voice.
export function composeUnwritten({ height, tip, site }) {
  const cite = reference(height);
  const ahead = height - tip;
  return `${cite} is not yet written — that chapter is block ${height.toLocaleString('en-US')}, ` +
    `and the chain has reached block ${tip.toLocaleString('en-US')} ` +
    `(${ahead.toLocaleString('en-US')} ${ahead === 1 ? 'block' : 'blocks'} to go). ` +
    `The book grows by one chapter roughly every ten minutes.\n\n${site}/bitcoin-contents.html`;
}

export function composeNoSection({ height, section, txCount, site }) {
  const cite = reference(height);
  return `${cite} has ${txCount.toLocaleString('en-US')} ${txCount === 1 ? 'section' : 'sections'} — ` +
    `there is no §${section.toLocaleString('en-US')} in that chapter.\n\n` +
    `${site}/bitcoin-book.html?block=${height}`;
}
