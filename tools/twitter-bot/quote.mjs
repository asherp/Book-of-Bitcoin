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

// Compose the reply for a resolved passage. The verse is the txid as prose —
// cover words and all: the cover is the grammar that makes the payload read
// as a sentence, and stripping it would quote the book in a voice it does
// not have. When the full verse fits the budget, the tweet carries it whole
// and decodes back to the txid. When it does not, the tweet carries an
// ellipsized excerpt (trimmed at a word boundary) and `passage` carries the
// full verse for rendering as an attached image — the passage as a page of
// the book, unabridged, with the excerpt as its caption.
//
// Returns { text, passage }; passage is null when the verse fit in text.
export function composeReply({ height, index, txid, site, proseOf }) {
  const cite = `${reference(height)} §${index + 1}`;
  const title = titleFor(height, index, txid);
  const url = `${site}/bitcoin-book.html?block=${height}&index=${index}`;
  const head = title ? `${cite} — ${title}` : cite;

  const verse = proseOf(reverseHex(txid)).prose.trim();
  const frame = (v) => `${head}\n\n“${v}”\n\n${url}`;
  const budget = TWEET_WEIGHT_BUDGET - URL_WEIGHT - weighText(frame('').replace(url, ''));

  if (weighText(verse) <= budget) return { text: frame(verse), passage: null };

  const words = verse.split(' ');
  while (words.length > 1 && weighText(words.join(' ') + '…') > budget) words.pop();
  return {
    text: frame(words.join(' ') + '…'),
    passage: { cite, title, verse, url, height, index, txid },
  };
}

// ─── the passage as a page ──────────────────────────────────────────────
//
// The overflow image: the full verse laid out as a page of the book — its
// dark paper, gold citation, Newsreader-style serif prose (system serif
// stands in where the webfont isn't installed). Self-contained HTML, no
// external resources; image.mjs screenshots the .card element.

const escapeHtml = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

export function passageHtml({ cite, title, verse, site }) {
  const host = String(site).replace(/^https?:\/\//, '');
  return `<!doctype html>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #08080a; }
  .card {
    width: 1200px; box-sizing: border-box; padding: 76px 88px 60px;
    background: #08080a; color: #cfcabf;
    font-family: 'Newsreader', Georgia, 'Times New Roman', serif;
  }
  .cite {
    font: 600 25px/1 'IBM Plex Mono', ui-monospace, Menlo, monospace;
    color: #c9a25f; letter-spacing: .08em; margin: 0 0 14px;
  }
  .title { font-weight: 500; font-size: 34px; line-height: 1.25; color: #e8e4da; margin: 0 0 40px; letter-spacing: -.01em; }
  .verse { font-style: italic; font-size: 34px; line-height: 1.65; color: #e8e4da; margin: 0; }
  .verse::before { content: '“'; color: #c9a25f; }
  .verse::after { content: '”'; color: #c9a25f; }
  .foot {
    margin-top: 52px; display: flex; justify-content: space-between; align-items: baseline;
    font: 400 19px/1 'IBM Plex Mono', ui-monospace, Menlo, monospace; color: #8f8a7e;
  }
  .foot .beta { color: #c9a25f; }
</style>
<body>
<div class="card">
  <p class="cite"${title ? '' : ' style="margin-bottom:40px"'}>${escapeHtml(cite)}</p>
  ${title ? `<p class="title">${escapeHtml(title)}</p>` : ''}
  <p class="verse">${escapeHtml(verse)}</p>
  <div class="foot">
    <span>${escapeHtml(host)}</span>
    <span>every <span class="beta">β</span>yte decodes back — the chain&#39;s own speech</span>
  </div>
</div>
</body>`;
}

// The image's alt text: the whole passage, for readers who won't see the
// page. X caps alt text at 1,000 characters; the verse nearly always fits.
export function passageAltText({ cite, title, verse }) {
  const full = `${cite}${title ? ` — ${title}` : ''} — “${verse}”`;
  return full.length <= 1000 ? full : full.slice(0, 999) + '…';
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
