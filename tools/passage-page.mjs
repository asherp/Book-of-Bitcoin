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
// So each curated entry also gets a real path — its citation, written as
// one, at the level the citation actually names:
//
//   III β2 ■5 §1   ->   /III/2/5/1/     a section: one transaction
//   III β2 ■5      ->   /III/2/5/       a chapter: one block
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

// A height, and a section or null -> the citation's path. A section names a
// transaction and gets four segments; null names the chapter itself — the
// block — and stops at three, exactly as the printed reference does (a
// chapter is cited "III β2 ■5", a section "III β2 ■5 §1"). The URL should
// read as the citation reads, and name the same thing.
export function passagePath(height, section = null) {
  const { volume, book, chapter } = volumeBookChapter(height);
  const base = `/${toRoman(volume)}/${book}/${chapter}/`;
  return section === null ? base : `${base}${section}/`;
}

// Where the card for that address lives. Keyed by the same coordinates, so a
// path and its card are trivially derivable from each other — no manifest to
// keep in step. A chapter's card carries no section segment, like its path.
export function cardPath(height, section = null) {
  const { volume, book, chapter } = volumeBookChapter(height);
  const base = `${toRoman(volume)}-${book}-${chapter}`;
  return `/cards/${section === null ? base : `${base}-${section}`}.png`;
}

// One page per address. A contents row names a chapter or a section --
// never both -- and the two live at different paths, so block 0's chapter
// entry ("The Genesis Block") and its coinbase's txid entry ("The Times
// 03/Jan/2009 ...") are two pages, not one overwriting the other: the
// chapter at /I/1/1/ and the section it opens at /I/1/1/1/.
//
// The dedup that remains is a guard, not a policy: should two rows ever
// name the same address, the more specific entry keeps it (a txid names a
// transaction outright; a height is resolved to one), and the first wins
// among equals so the contents' own order decides.
export function passagesByPath(rendered) {
  const byPath = new Map();
  for (const r of rendered) {
    const key = passagePath(r.height, r.isChapter ? null : r.index + 1);
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


// ─── a chapter: the block's own page ────────────────────────────────────
//
// A chapter's head, as bitcoin-book.html sets it: the title, the block hash
// as prose in the ⓪ⁿ⌘ᵐ notation, and the frontispiece — the header's six
// fields in wire order, each a .cfx row with its mark. The rows arrive
// already composed (the prerenderer has composeBlockHeaderFields and the
// hash notation), so this only sets them.
//
// `rows` is [{ mark, markClass, text, gap }]: `mark` leads the row in bold
// gold where the field has one (v, ⋔, β, η), and `gap` forces a space after
// it where the value is not a numeral it prefixes.
export function frontispieceHtml(rows) {
  return `<div class="chapter-frontispiece">${rows.map(({ mark, markClass = 'fx-mark', text, gap }) => {
    const lead = mark
      ? `<span class="${markClass}">${escapeHtml(mark)}</span>${gap || !/^\d/.test(text) ? ' ' : ''}`
      : '';
    return `<span class="cfx">${lead}${text}</span>`;
  }).join('')}</div>`;
}

// The chapter page: /III/2/5/. Its card shows the same head, so a shared
// chapter link previews as the block's title page rather than as one of its
// transactions. `sections` is [{ num, title }] — the curated sections of
// this block, listed as the chapter's own contents.
export function chapterPageHtml({
  site, height, title, blockProse, blockHashNotation, frontispieceRows,
  txCount, blockHash, cardUrl = null, slug = null, sections = [],
}) {
  const cite = reference(height);
  const url = `${site}${passagePath(height)}`;
  const card = cardUrl || `${site}/og-glossia.png`;
  const appUrl = `${site}/bitcoin-book.html?block=${height}`;
  const description = chapterDescription({ height, title, txCount });
  const pageTitle = `${cite}${title ? ` — ${title}` : ''} · The βook of βitcoin`;

  const contents = sections.length
    ? `<p>Sections of this chapter: ${sections.map((x) =>
        `<a href="${escapeHtml(`${site}${passagePath(height, x.num)}`)}">§${x.num}${x.title ? ` ${escapeHtml(x.title)}` : ''}</a>`
      ).join(' · ')}</p>`
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
<meta property="og:image:alt" content="${escapeHtml(`${cite} — the chapter's title page`)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(cite)}${title ? ` — ${escapeHtml(title)}` : ''}">
<meta name="twitter:description" content="${escapeHtml(description)}">
<meta name="twitter:image" content="${escapeHtml(card)}">
<style>${passageCss({ fontSize: 19, fixed: false })}${CHAPTER_CSS}
</style>
</head>
<body>
<nav class="nav">
  <a href="${escapeHtml(site)}/">The βook of βitcoin</a>
  <a href="${escapeHtml(site)}/bitcoin-contents.html">Contents</a>
  <a href="${escapeHtml(appUrl)}">Read this chapter in the book →</a>
</nav>
<div class="page">
  <div class="content chapter-head">
    <h1 class="chapter-title">${escapeHtml(title || `Chapter ${volumeBookChapter(height).chapter}`)}</h1>
    <div class="chapter-hash">${blockHashNotation} ${escapeHtml(blockProse)}</div>
    ${frontispieceHtml(frontispieceRows)}
  </div>
  <div class="colophon">
    <span>${escapeHtml(String(site).replace(/^https?:\/\//, ''))}</span>
    <span class="cite">${escapeHtml(cite)}</span>
  </div>
</div>
<div class="also">
  <p>This chapter is block ${height.toLocaleString('en-US')}, read as a chapter of the book:
  its header above, and its ${txCount ? txCount.toLocaleString('en-US') : ''} transaction${txCount === 1 ? '' : 's'}
  as the sections that follow. Each section is one transaction, rendered as a paragraph of
  prose that decodes back to its exact bytes.</p>
  ${contents}
  <p>Block hash <code>${escapeHtml(blockHash)}</code></p>
  <p><a href="${escapeHtml(appUrl)}">Read it in the book</a>${slug ? ` · <a href="${escapeHtml(`${site}/passages/${slug}.md`)}">as plain markdown</a>` : ''} · <a href="${escapeHtml(site)}/llms.txt">how to reconstruct any passage yourself</a></p>
</div>
</body>
</html>
`;
}

export function chapterDescription({ height, title, txCount }) {
  const { volume, book, chapter } = volumeBookChapter(height);
  const n = !txCount ? 'its transactions read as sections'
    : txCount === 1 ? 'its one transaction read as its only section'
      : `its ${txCount.toLocaleString('en-US')} transactions read as sections`;
  return `${title ? `${title}. ` : ''}Block ${height.toLocaleString('en-US')} read as a chapter of ` +
    `The βook of βitcoin — its header decoded, and ${n} of Glossia prose, each carrying its ` +
    `transaction's bytes losslessly. Volume ${toRoman(volume)}, book ${book}, chapter ${chapter}.`;
}

// The chapter head's own rules, from bitcoin-book.html. The centred title,
// the hash prose beneath it, and the frontispiece rows.
const CHAPTER_CSS = `
  .chapter-head { text-align: center; }
  .chapter-title {
    font: 500 1.95em/1.2 'Newsreader', Georgia, serif; color: #e8e4da;
    margin: 0 0 1.15em; letter-spacing: -.01em;
  }
  .chapter-hash {
    font: italic 400 .79em/1.5 'Newsreader', Georgia, serif; color: #8f8a7e;
    margin: 0 auto .85em; max-width: 46ch;
  }
  .chapter-hash .cfx-gold { color: #c9a25f; font-weight: 700; font-style: normal; }
  .chapter-frontispiece {
    margin: 0 auto; max-width: 46ch;
    font: 400 .76em/1.55 'Newsreader', Georgia, serif; color: #8f8a7e;
  }
  .chapter-frontispiece .cfx { display: block; }
  .chapter-frontispiece .cfx + .cfx { margin-top: .45em; }
  .fx-mark { color: #c9a25f; font-weight: 700; font-style: normal; }
`;

// The section page. `section` is the composed section (fields + witness HTML + text
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
