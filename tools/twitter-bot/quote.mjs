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
//   { status: 'ok', height, index, txid, txCount, hex }
//   { status: 'unwritten', height, tip }        — chapter not yet mined
//   { status: 'no-section', height, section, txCount }
//   { status: 'not-found' }                     — txid unknown to the chain
// `cit` is parseCitation's output; `esplora(path, kind)` fetches with the
// book's mirror fallback and returns null on a 404. The transaction's raw
// hex — the bytes the section quote is set from — is best-effort on its
// own: a miss costs the reply its section, never the citation.

export async function resolveCitation(cit, esplora) {
  const rawHex = async (txid) => {
    try { return await esplora(`/tx/${txid}/hex`); } catch { return null; }
  };

  if (cit.txid) {
    const proof = await esplora(`/tx/${cit.txid}/merkle-proof`, 'json');
    if (!proof) return { status: 'not-found' };
    return {
      status: 'ok', height: proof.block_height, index: proof.pos, txid: cit.txid,
      txCount: null, hex: await rawHex(cit.txid),
    };
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
  const txid = txids[section - 1];
  return { status: 'ok', height, index: section - 1, txid, txCount, hex: await rawHex(txid) };
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

// ─── the section, as the manuscript sets it ─────────────────────────────
//
// The quote is the passage itself, in the book's notation: scripts as
// opcode sigla (⧉ ⌗ ∇ …), amounts in ₿, the sequence and locktime marks,
// witness data as footnotes. btc-prose.js composes each field as an HTML
// fragment (glyphs ride in <span title=…> hover tokens); a tweet or an
// image keeps the visible text — exactly what a sighted reader of the
// page sees. Same treatment as tools/prerender-passages.mjs.

export function htmlToText(s) {
  return String(s)
    .replace(/<br\s*\/?>/g, '\n')
    .replace(/<span class="tab"><\/span>/g, '\t')
    .replace(/<sup[^>]*>([^<]*)<\/sup>/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

const shortId = (txid) => `${txid.slice(0, 8)}…`;

// composeTransactionFields output (plus a caller-supplied witness renderer:
// input -> HTML or null) -> the section as labeled rows and footnotes, all
// plain text with the sigla intact, in wire order.
//
//   rows:      [{ label, text }]           — the manuscript page's margin layout
//   footnotes: ['…']                       — witness data, numbered per input
//   flat:      'version 1\ninput: …'       — the rows as flowing text, for a tweet
export function sectionParts(fields, witnessHtml = () => null) {
  const rows = [];
  const footnotes = [];

  rows.push({ label: 'version', text: fields.version });
  fields.inputs.forEach((inp, i) => {
    const label = `input${fields.inputs.length > 1 ? ` ${i + 1}` : ''}`;
    const src = inp.isNullPrevout ? '∅ coinbase — new coin' : `spends ${shortId(inp.prevTxid)}:${inp.prevVout}`;
    const script = htmlToText(inp.script).trim();
    const seq = htmlToText(inp.sequence).trim();
    const wit = witnessHtml(inp, i);
    if (wit != null) footnotes.push(htmlToText(wit).trim());
    const foot = wit != null ? ` ⁽${footnotes.length}⁾` : '';
    rows.push({ label, text: `${src}${script ? ` — ${script}` : ''}${seq ? ` · ${seq}` : ''}${foot}` });
  });
  fields.outputs.forEach((o, i) => {
    const label = `output${fields.outputs.length > 1 ? ` ${i + 1}` : ''}`;
    rows.push({ label, text: `${htmlToText(o.value)} — ${htmlToText(o.script).trim()}` });
  });
  rows.push({ label: 'locktime', text: htmlToText(fields.locktime).trim() });

  const flat = rows.map((r) => `${r.label} ${r.text}`).join('\n');
  return { rows, footnotes, flat };
}

// ─── the reply itself ───────────────────────────────────────────────────

const reverseHex = (hex) => (hex.match(/../g) || []).reverse().join('');

// Compose the reply for a resolved passage. The verse quoted is the section
// itself in the book's notation — the sigla, the amounts, the marks — with
// its cover words intact everywhere prose appears: the cover is the grammar
// that makes the payload read as a sentence, and stripping it would quote
// the book in a voice it does not have. When the whole section fits the
// budget it rides in the tweet text; when it does not — nearly always — the
// tweet carries an ellipsized excerpt (trimmed at a word boundary) and
// `passage` carries the full section for rendering as an attached image:
// the passage as a page of the book, unabridged.
//
// `section` (sectionParts output) may be null when the transaction's bytes
// couldn't be fetched; the verse then falls back to the txid as prose — the
// line every passage opens with — so the reply still quotes something true.
//
// Returns { text, passage }; passage is null when the verse fit in text.
export function composeReply({ height, index, txid, site, proseOf, section = null }) {
  const cite = `${reference(height)} §${index + 1}`;
  const title = titleFor(height, index, txid);
  const url = `${site}/bitcoin-book.html?block=${height}&index=${index}`;
  const head = title ? `${cite} — ${title}` : cite;

  const txidProse = proseOf(reverseHex(txid)).prose.trim();
  const verse = section ? section.flat : txidProse;
  const frame = (v) => `${head}\n\n“${v}”\n\n${url}`;
  const budget = TWEET_WEIGHT_BUDGET - URL_WEIGHT - weighText(frame('').replace(url, ''));

  if (weighText(verse) <= budget && !(section && section.footnotes.length)) {
    return { text: frame(verse), passage: null };
  }

  const words = verse.split(/\s+/);
  while (words.length > 1 && weighText(words.join(' ') + '…') > budget) words.pop();
  return {
    text: frame(words.join(' ') + '…'),
    passage: { cite, title, txidProse, section, url, height, index, txid },
  };
}

// ─── the passage as a page ──────────────────────────────────────────────
//
// The overflow image: the passage laid out as a page of the book — its
// dark paper, gold citation, Newsreader-style serif prose (system serif
// stands in where the webfont isn't installed), the section's fields in
// the manuscript's margin layout with the sigla intact, witness data as
// footnotes. Self-contained HTML, no external resources; image.mjs
// screenshots the .card element.

// A grand section (hundreds of inputs, an inscription's footnotes) is cut
// honestly for the image: past these caps a rule line says what remains,
// and the live page carries the rest.
const IMAGE_MAX_ROWS = 24;
const IMAGE_MAX_FOOTNOTE_CHARS = 900;

const escapeHtml = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

export function passageHtml({ cite, title, txidProse, section, site }) {
  const host = String(site).replace(/^https?:\/\//, '');

  let body;
  if (section) {
    let rows = section.rows;
    let more = '';
    if (rows.length > IMAGE_MAX_ROWS) {
      // Keep the head of the page and its last row (the locktime), and say
      // how much the cut hides.
      const hidden = rows.length - IMAGE_MAX_ROWS;
      rows = [...rows.slice(0, IMAGE_MAX_ROWS - 1), rows[rows.length - 1]];
      more = `<p class="more">⋯ ${hidden.toLocaleString('en-US')} more field${hidden === 1 ? '' : 's'} — the live page carries the whole section</p>`;
    }
    const rowsHtml = rows.map((r) =>
      `<div class="row"><span class="label">${escapeHtml(r.label)}</span><span class="text">${escapeHtml(r.text)}</span></div>`
    ).join('\n');
    const notes = section.footnotes.map((f, i) => {
      const cut = f.length > IMAGE_MAX_FOOTNOTE_CHARS ? f.slice(0, IMAGE_MAX_FOOTNOTE_CHARS) + ' ⋯' : f;
      return `<div class="row note"><span class="label">${i + 1}</span><span class="text">${escapeHtml(cut)}</span></div>`;
    }).join('\n');
    body = `
  <p class="verse">${escapeHtml(txidProse)}</p>
  <div class="fields">
${rowsHtml}
  </div>
  ${more}
  ${notes ? `<div class="notes">${notes}</div>` : ''}`;
  } else {
    body = `
  <p class="verse big">${escapeHtml(txidProse)}</p>`;
  }

  return `<!doctype html>
<meta charset="utf-8">
<style>
  body { margin: 0; background: #08080a; }
  .card {
    width: 1200px; box-sizing: border-box; padding: 72px 84px 56px;
    background: #08080a; color: #cfcabf;
    font-family: 'Newsreader', Georgia, 'Times New Roman', serif;
  }
  .cite {
    font: 600 25px/1 'IBM Plex Mono', ui-monospace, Menlo, monospace;
    color: #c9a25f; letter-spacing: .08em; margin: 0 0 14px;
  }
  .title { font-weight: 500; font-size: 33px; line-height: 1.25; color: #e8e4da; margin: 0 0 30px; letter-spacing: -.01em; }
  .verse { font-style: italic; font-size: 27px; line-height: 1.6; color: #e8e4da; margin: 0 0 34px; }
  .verse.big { font-size: 34px; line-height: 1.65; margin-bottom: 0; }
  .verse::before { content: '“'; color: #c9a25f; }
  .verse::after { content: '”'; color: #c9a25f; }
  .fields, .notes { border-top: 1px solid #232228; padding-top: 26px; }
  .notes { margin-top: 26px; }
  .row { display: flex; gap: 26px; margin: 0 0 16px; }
  .row:last-child { margin-bottom: 0; }
  .label {
    flex: 0 0 128px; text-align: right;
    font: 500 17px/1.9 'IBM Plex Mono', ui-monospace, Menlo, monospace;
    color: #c9a25f; letter-spacing: .04em;
  }
  .text { font-size: 24px; line-height: 1.55; color: #cfcabf; white-space: pre-wrap; overflow-wrap: anywhere; }
  .note .text { font-size: 20px; color: #a8a294; }
  .more {
    margin: 20px 0 0; font: 400 18px/1.4 'IBM Plex Mono', ui-monospace, Menlo, monospace;
    color: #8f8a7e;
  }
  .foot {
    margin-top: 48px; display: flex; justify-content: space-between; align-items: baseline;
    font: 400 19px/1 'IBM Plex Mono', ui-monospace, Menlo, monospace; color: #8f8a7e;
  }
  .foot .beta { color: #c9a25f; }
</style>
<body>
<div class="card">
  <p class="cite"${title ? '' : ' style="margin-bottom:30px"'}>${escapeHtml(cite)}</p>
  ${title ? `<p class="title">${escapeHtml(title)}</p>` : ''}${body}
  <div class="foot">
    <span>${escapeHtml(host)}</span>
    <span>every <span class="beta">β</span>yte decodes back — the chain&#39;s own speech</span>
  </div>
</div>
</body>`;
}

// The image's alt text: the whole passage, for readers who won't see the
// page. X caps alt text at 1,000 characters.
export function passageAltText({ cite, title, txidProse, section }) {
  const verse = section ? section.flat.replace(/\n/g, ' · ') : txidProse;
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
