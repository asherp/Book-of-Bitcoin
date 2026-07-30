// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/passage-page.mjs — a passage as a page at its own address, with its
// own card.
//
// The book's reading pages take a passage as a query string
// (`bitcoin-book.html?block=0&index=0`), which is fine for an app and
// useless for sharing: static hosting serves one file for every query, so
// every passage on the chain has the same <head> and therefore the same
// Open Graph image. A link to the genesis coinbase and a link to a random
// 2019 sweep preview identically.
//
// So each curated passage also gets a real path — its citation, written as
// one:
//
//   III β2 ■5 §1   ->   /III/2/5/1/
//
// which is a directory with an index.html of its own: per-passage title,
// description, and og:image (the passage rendered as a card by the same
// renderer the reply bot uses), plus the passage set out in readable HTML
// underneath. Volume in Roman, then book, chapter and section as numerals —
// the reference format the book already prints, with the sigla implied by
// position. The path is invertible: heightOf(volume, book, chapter) gives
// the height back, so the URL grammar and the citation scheme are the same
// scheme. That is what makes it extend past the curated set later — a
// renderer at the edge can answer any /V/B/C/S the same way, because
// nothing about the path depends on the passage having been pre-rendered.
//
// A section defaults to 1, so /III/2/5/ is the chapter's opening section —
// the same default the bot's citation parser applies.
//
// This runs at deploy time from tools/prerender-passages.mjs, which already
// fetches and composes every curated passage; this module only turns what it
// has into a page and a card.

import { volumeBookChapter, toRoman, reference } from '../web/btc-citation.js';
import { passageCss, txFlowHtml, htmlToText } from './twitter-bot/quote.mjs';

// Cards are 1200x630 (1.91:1) — the shape the site's existing og:image
// declares, and what a large-image card wants. The passage is fitted to it
// by the renderer, so a short section sets large and a long one small.
export const CARD_WIDTH = 1200;
export const CARD_HEIGHT = 630;

const escapeHtml = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

// A height and section -> the passage's path, '/III/2/5/1/'. Section is
// always written even when 1: a citation names a passage, and the URL
// should read as the citation does.
export function passagePath(height, section) {
  const { volume, book, chapter } = volumeBookChapter(height);
  return `/${toRoman(volume)}/${book}/${chapter}/${section}/`;
}

// Where the card for that passage lives. Kept flat and keyed by the same
// coordinates, so a path and its card are trivially derivable from each
// other — no manifest to keep in step.
export function cardPath(height, section) {
  const { volume, book, chapter } = volumeBookChapter(height);
  return `/cards/${toRoman(volume)}-${book}-${chapter}-${section}.png`;
}

// One page per passage, not per contents row. Two curated entries can name
// the same passage -- block 0's chapter entry and its coinbase's txid entry
// are the same section -- and a passage has a single address, so they must
// collapse to one page. The txid entry wins the title: it names the
// transaction, which is what a section page is (the same precedence
// titleFor applies in the reply bot).
export function passagesByPath(rendered) {
  const byPath = new Map();
  for (const r of rendered) {
    const key = passagePath(r.height, r.index + 1);
    const held = byPath.get(key);
    if (!held || (r.fromTxid && !held.fromTxid)) byPath.set(key, r);
  }
  return [...byPath.values()];
}

// The card's alt text, and the page's og:description: what this passage is,
// in one sentence a reader gets nothing else from.
export function passageDescription({ height, section, title, txCount }) {
  const { volume, book, chapter } = volumeBookChapter(height);
  const where = `Volume ${toRoman(volume)}, book ${book}, chapter ${chapter}, section ${section}`;
  const of = txCount ? ` of ${txCount.toLocaleString('en-US')}` : '';
  return `${title ? `${title}. ` : ''}Block ${height.toLocaleString('en-US')} read as a chapter, ` +
    `its transaction ${section}${of} read as a section of Glossia prose — every byte of the ` +
    `transaction carried in the words, and decodable back out. ${where}.`;
}

// The page. `section` is the composed section (fields + witness HTML + text
// forms) that prerender-passages.mjs already has; `cardUrl` may be null when
// the renderer was unavailable, in which case the page falls back to the
// site's standing card rather than declaring one that does not exist.
export function passagePageHtml({
  site, height, sectionNum, title, txidProse, section, txCount, blockHash, txid,
  cardUrl = null, slug = null,
}) {
  const cite = `${reference(height)} §${sectionNum}`;
  const path = passagePath(height, sectionNum);
  const url = `${site}${path}`;
  const card = cardUrl || `${site}/og-glossia.png`;
  const description = passageDescription({ height, section: sectionNum, title, txCount });
  const appUrl = `${site}/bitcoin-book.html?block=${height}&index=${sectionNum - 1}`;
  const pageTitle = `${cite}${title ? ` — ${title}` : ''} · The βook of βitcoin`;

  const flow = section
    ? txFlowHtml(section.fields, section.footnotesHtml || [], section.citations || [])
    : '';

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(pageTitle)}</title>
<link rel="canonical" href="${escapeHtml(url)}">
<meta name="description" content="${escapeHtml(description)}">

<meta property="og:type" content="article">
<meta property="og:site_name" content="The βook of βitcoin">
<meta property="og:title" content="${escapeHtml(cite)}${title ? ` — ${escapeHtml(title)}` : ''}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:url" content="${escapeHtml(url)}">
<meta property="og:image" content="${escapeHtml(card)}">
<meta property="og:image:width" content="${CARD_WIDTH}">
<meta property="og:image:height" content="${CARD_HEIGHT}">
<meta property="og:image:alt" content="${escapeHtml(`${cite} — the passage, set as a page of the book`)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(cite)}${title ? ` — ${escapeHtml(title)}` : ''}">
<meta name="twitter:description" content="${escapeHtml(description)}">
<meta name="twitter:image" content="${escapeHtml(card)}">
<style>${passageCss({ fontSize: 19, fixed: false })}
  body { padding: 2rem 1rem 3rem; }
  .nav {
    max-width: 54rem; margin: 0 auto 1.5rem; display: flex; gap: 1.2em; flex-wrap: wrap;
    font: 400 13px/1.5 'IBM Plex Mono', ui-monospace, monospace; letter-spacing: .04em;
  }
  .nav a { color: #c9a25f; text-decoration: none; }
  .nav a:hover { text-decoration: underline; }
  .also {
    max-width: 54rem; margin: 1.6rem auto 0; padding-top: 1.2rem; border-top: 1px solid #232228;
    font: 400 14px/1.7 'Newsreader', Georgia, serif; color: #8f8a7e;
  }
  .also a { color: #c9a25f; text-decoration: none; }
  .also a:hover { text-decoration: underline; }
  .also code { font: 400 12.5px/1.5 'IBM Plex Mono', ui-monospace, monospace; overflow-wrap: anywhere; }
  /* The page is read, not screenshotted, so its type may scale with the
     viewport the way the reading pages' does. */
  @media (max-width: 640px) { .page { font-size: 16px; padding: 1.4em 1.2em; } }
</style>
</head>
<body>
<nav class="nav">
  <a href="${escapeHtml(site)}/">The βook of βitcoin</a>
  <a href="${escapeHtml(site)}/bitcoin-contents.html">Contents</a>
  <a href="${escapeHtml(appUrl)}">Read this in the book →</a>
</nav>
<div class="page">
  <div class="content">
    <h1 class="section-title">
      <span class="section-num">§ ${sectionNum}</span>
      ${title ? `<span class="section-event">${escapeHtml(title)}</span>` : ''}
    </h1>
    <div class="section-hash"><span class="cfx-gold">⌘</span><span class="op op-push">²⁵⁶</span> ${escapeHtml(txidProse)}</div>
    <hr class="rule">
    ${flow}
  </div>
  <div class="colophon">
    <span>${escapeHtml(String(site).replace(/^https?:\/\//, ''))}</span>
    <span class="cite">${escapeHtml(cite)}</span>
  </div>
</div>
<div class="also">
  <p>This passage is block ${height.toLocaleString('en-US')} read as a chapter, and its
  transaction ${sectionNum} read as a section. The prose is a lossless encoding of the
  transaction's bytes: filter it against the BIP39 English wordlist and the transaction
  returns, byte for byte. The connective grammar is the translator's; the content is the
  chain's.</p>
  <p>Block hash <code>${escapeHtml(blockHash)}</code><br>
  Transaction <code>${escapeHtml(txid)}</code></p>
  <p><a href="${escapeHtml(appUrl)}">Read it in the book</a>${slug ? ` · <a href="${escapeHtml(`${site}/passages/${slug}.md`)}">as plain markdown</a>` : ''} · <a href="${escapeHtml(site)}/llms.txt">how to reconstruct any passage yourself</a></p>
</div>
</body>
</html>
`;
}

// The passage's own text, for a card's alt attribute and for the sitemap's
// sake — the same flattened form the bot quotes in a tweet.
export function passageText(section, txidProse) {
  return section ? htmlToText(section.flat).replace(/\n/g, ' · ') : txidProse;
}
