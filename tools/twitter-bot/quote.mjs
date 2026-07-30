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

import { reference, footnoteMark } from '../../web/btc-citation.js';
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
    const foot = wit != null ? ` ⁽${footnoteMark(footnotes.length)}⁾` : '';
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
    passage: { cite, title, sectionNum: index + 1, txidProse, section, url, height, index, txid },
  };
}


// ─── the passage as a page ──────────────────────────────────────────────
//
// The overflow image: the passage set the way bitcoin-book.html sets it —
// the § heading and its event title, the txid as prose beneath, a rule,
// then the transaction as a manuscript page: a three-column band grid
// with provenance in the left margin, the canonical prose in the body
// (the first line taking the illuminated initial), amounts in the right
// margin, and the locktime centred as a colophon. Witness data follows as
// numbered footnotes.
//
// The markup and the class names are the book's own, and so is the CSS —
// transposed from bitcoin-book.html into em units off a single root size,
// so image.mjs can scale the whole page by that one number to fit a target
// image (see fitFontSize). The running head and the section nav are the
// app's furniture, not the page's, and are left out; the colophon carries
// the citation instead.
//
// Field fragments arrive from btc-prose.js as HTML (opcode glyphs, data
// marks, quoted embedded text) and are inserted as markup, exactly as the
// book inserts them — btc-prose.js escapes the untrusted parts (a coinbase
// tag, an OP_RETURN message) at the source. Only strings this module owns
// — the title, citation, and host — are escaped here.

const escapeHtml = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

// Page geometry, in pixels. 4:5 is the tallest portrait X shows uncropped
// in a timeline, so it buys the most room for a passage.
export const PAGE_WIDTH = 1200;
export const PAGE_HEIGHT = 1500;

// The root size the page is set from. The renderer searches this range for
// the largest size whose passage still fits the page; a passage too long
// even at the floor keeps the floor and shows its opening — the top of the
// page — with the colophon still pinned beneath it.
//
// The ceiling is generous on purpose: a short section (a one-input, one-
// output spend) should be set large and airy rather than marooned at the
// top of an empty page, and the book's own proportions hold at any size
// because every measure is an em off this one. The floor is where a
// passage stops shrinking and starts being clipped — below it the prose
// stops being readable in a timeline, so more of the page is a worse
// trade than less of the passage.
export const FONT_MIN = 9;
export const FONT_MAX = 46;

// A witness footnote past this many characters is cut with an ellipsis: an
// inscription's stack can run to megabytes, and the live page carries it.
const FOOTNOTE_MAX_CHARS = 2000;

// The identity-hash mark leading the txid prose, exactly as the book leads
// it: ⌘ is HASH256 in the sigla, and a txid is the double-SHA256 of the
// transaction's bytes with no proof-of-work zeros to state — so all 256
// bits ride in the prose, and the superscript (bits, ⌘'s unit) says so.
// The superscript is written literally rather than through btc-prose.js's
// toSuperscript, because this module must stay engine-free: btc-prose.js
// imports the WASM bundle, and quote.mjs has to load on a bare checkout.
const TXID_MARK_TITLE = 'transaction id — the double-SHA256 of this transaction&#39;s bytes, ' +
  'its identity; all 256 bits carried in the prose';
const HASH_MARK =
  `<span class="cfx-gold" title="${TXID_MARK_TITLE}">⌘</span><span class="op op-push">²⁵⁶</span> `;

const shortRef = (txid, vout) => `${txid.slice(0, 6)}…:${vout}`;

// The transaction, as the book lays it out. `fields` is
// composeTransactionFields output; `footnotesHtml[i]` is the rendered
// witness for the i-th witness-bearing input (in input order), and
// `citations[i]` an optional resolved reference for input i's prevout.
export function txFlowHtml(fields, footnotesHtml = [], citations = []) {
  const inputRows = [];
  const marginCites = [];
  const outputRows = [];

  // The first body line across the whole transaction claims the drop cap —
  // unless it opens with a mark rather than a word. A bare push count (⁶⁹ …)
  // would have its superscript's first digit blown up into a giant numeral;
  // a data mark (p⁶⁵, s⁷¹, h³²) would be torn from the count riding with it,
  // leaving a giant P beside an orphaned 65. Either way the mark is
  // annotation, not the opening word of the prose, so it cannot be
  // illuminated. Forfeited, not deferred: an illuminated initial belongs at
  // the top. (bitcoin-book.html's addLine guards the push count; the data
  // mark is the same hazard one span over.)
  const opensWithMark = (html) =>
    html.startsWith('<span class="op op-push') || html.startsWith('<span class="dt"');
  let leadUsed = false;
  const line = (html, { illuminate = true } = {}) => {
    if (!html) return '';
    const lead = illuminate && !leadUsed && !opensWithMark(html);
    leadUsed = true;
    return `<p class="tx-line${lead ? ' tx-body-lead' : ''}">${html}</p>`;
  };
  // Embedded human-readable text is a foreign voice quoted into the
  // transaction — a quote block, and never the drop cap.
  const quote = (html) => (html ? `<blockquote class="tx-ascii">${html}</blockquote>` : '');

  const pendingMargin = [];
  if (fields.version !== '1') {
    pendingMargin.push(`<div class="tx-in-cite tx-version">v${escapeHtml(fields.version)}</div>`);
  }

  let footnoteNum = 0;
  fields.inputs.forEach((inp, i) => {
    const ref = inp.isNullPrevout
      ? '∅'
      : escapeHtml(citations[i] || shortRef(inp.prevTxid, inp.prevVout));
    const hasWitness = footnotesHtml[footnoteNum] !== undefined && inp.witnessItems.length;
    const witRef = hasWitness ? `<sup class="tx-witness-ref">${footnoteMark(++footnoteNum)}</sup>` : '';
    const seqClass = `tx-seq tx-seq-${inp.sequenceKind}`;
    const seq = inp.sequenceRbf && inp.sequence
      ? `<span class="${seqClass}"><span class="tx-seq-rbf">†</span> ${inp.sequence}</span>`
      : `<span class="${seqClass}">${inp.sequenceRbf ? '†' : inp.sequence}</span>`;
    const cite =
      `<div class="tx-in-cite"><span class="cite-body">${ref}</span>${witRef}` +
      `<div class="cite-amount">${seq}</div></div>`;

    // A witness spend has an empty scriptSig and no body to sit beside; it
    // joins the pending list so the outputs can slide up past it.
    if (inp.scriptAscii || inp.script) {
      const group = `<div class="tx-in-cite-group">${pendingMargin.join('')}${cite}</div>`;
      pendingMargin.length = 0;
      const body = inp.scriptAscii ? quote(inp.scriptAscii) : line(inp.script);
      inputRows.push(group, `<div class="tx-in-script">${body}</div>`);
    } else {
      pendingMargin.push(cite);
    }
  });
  marginCites.push(...pendingMargin);

  fields.outputs.forEach((out) => {
    const body = out.scriptAscii ? quote(out.scriptAscii) : line(out.script);
    outputRows.push(
      `<div class="tx-out-script">${body}</div>`,
      `<div class="tx-note tx-out-value">${out.value}</div>`,
    );
  });

  const notes = footnotesHtml.length
    ? `<div class="footnotes">${footnotesHtml.map((f, i) => {
        const cut = f.length > FOOTNOTE_MAX_CHARS ? `${f.slice(0, FOOTNOTE_MAX_CHARS)} ⋯` : f;
        return `<p class="footnote"><sup>${footnoteMark(i + 1)}</sup> ${cut}</p>`;
      }).join('')}</div>`
    : '';

  return `<div class="tx-flow">
  <div class="tx-inputs">${inputRows.join('')}</div>
  <div class="tx-margin-cites">${marginCites.join('')}</div>
  <div class="tx-outputs">${outputRows.join('')}</div>
  <div class="tx-note tx-locktime">${fields.locktime}</div>
</div>${notes}`;
}

// The passage stylesheet: the book's rules, transposed from
// bitcoin-book.html into em units off one root size. `fixed` pins the page
// to a card of exactly width x height and clips a passage that overruns it
// (what image.mjs screenshots); without it the page is responsive and grows
// to whatever the passage needs (what a shareable web page wants). Every
// other measure is identical either way, so a card and a page set the same.
export function passageCss({ fontSize = 19, width = PAGE_WIDTH, height = PAGE_HEIGHT, fixed = true } = {}) {
  return `
  :root {
    --page:#08080a; --ink:#e8e4da; --ink-soft:#cfcabf; --dim:#8f8a7e;
    --meta:#6f6a60; --rule:#232228; --accent:#c9a25f; --accent-2:#dcb877;
  }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--page); }

  /* One root size drives the whole page: every measure below is in em, so
     the renderer fits a passage by scaling this single number. */
  .page {
    ${fixed ? `width: ${width}px; height: ${height}px;` : 'width: 100%; max-width: 54rem; margin: 0 auto;'}
    font-size: ${fontSize}px;
    background: var(--page); color: var(--ink-soft);
    font-family: 'Newsreader', Georgia, 'Liberation Serif', 'Times New Roman', serif;
    font-variant-numeric: oldstyle-nums;
    display: flex; flex-direction: column;
    padding: 2.2em 2.6em 1.4em;
  }
  /* In a fixed-size card, a passage longer than the page keeps its opening
     and is clipped here — the top of the page, with the colophon still
     pinned beneath it. A web page has no such limit and simply grows. */
  .content { flex: 1 1 auto; min-height: 0; ${fixed ? 'overflow: hidden;' : ''} }

  /* ── the section heading ── */
  .section-title {
    text-align: center; margin: 0; font: 600 .68em/1 'IBM Plex Mono', ui-monospace, monospace;
    letter-spacing: .28em; text-transform: uppercase; color: var(--accent);
  }
  /* A footnote letter is part of an address; the heading's uppercase
     transform must not raise it, or §1.a would read as §1.A. */
  .fn-mark { text-transform: none; }
  .section-event {
    display: block; margin-top: .8em; font: 500 1.15em/1.3 'Newsreader', Georgia, serif;
    letter-spacing: 0; text-transform: none; color: var(--ink-soft);
  }
  .section-hash {
    margin: .9em auto 0; max-width: 46ch; text-align: center;
    font: italic 400 .76em/1.55 'Newsreader', Georgia, serif; color: var(--dim);
  }
  .section-hash .cfx-gold { color: var(--accent); font-weight: 700; font-style: normal; }
  .rule { border: 0; border-top: 1px solid var(--rule); margin: 1.6em 0; }

  /* ── the transaction as a manuscript page ── */
  .tx-flow {
    display: grid;
    grid-template-columns: [left] 6.5em [body] minmax(0,1fr) [right] 7em;
    column-gap: 1.3em; align-items: start;
    line-height: 1.75;
  }
  .tx-inputs {
    grid-column: left / right; grid-row: 1;
    display: grid; grid-template-columns: subgrid; column-gap: 1.3em; align-items: start;
  }
  .tx-in-cite {
    grid-column: 1; text-align: right; padding-top: .34em;
    font: 500 .63em/1.5 'IBM Plex Mono', ui-monospace, monospace;
    color: var(--dim); word-break: break-word;
  }
  .tx-in-cite-group { grid-column: 1; }
  .tx-in-cite-group > .tx-in-cite + .tx-in-cite { margin-top: .5em; }
  .tx-in-cite.tx-version { color: var(--meta); letter-spacing: .03em; }
  .tx-witness-ref { color: var(--accent); font-size: .8em; vertical-align: .4em; margin-left: .2em; }
  .cite-amount {
    margin-top: .1em; text-align: right;
    font: italic 400 1em/1.3 'Newsreader', Georgia, serif; color: var(--meta);
    font-variant-numeric: tabular-nums;
  }
  .tx-in-script { grid-column: 2; min-width: 0; }
  .tx-margin-cites { grid-column: left; grid-row: 2; align-self: start; }
  .tx-outputs {
    grid-column: body / -1; grid-row: 2;
    display: grid; grid-template-columns: subgrid; column-gap: 1.3em; align-items: start;
  }
  .tx-out-script { grid-column: 1; min-width: 0; }
  .tx-out-value { grid-column: 2; text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
  .tx-locktime { grid-column: left / -1; grid-row: 3; text-align: center; font-style: normal; }
  .tx-note { font: italic 400 .71em/1.4 'Newsreader', Georgia, serif; color: var(--dim); }
  .tx-seq { font-style: normal; color: var(--meta); }
  .tx-seq-rbf { color: var(--accent-2); }
  .tx-seq-block, .tx-seq-time { color: var(--dim); font-variant-numeric: normal; }
  .tx-line { margin: 0 0 .55em; }

  /* Opcodes and marks inside a script — the grammar that punctuates the
     prose data pushes. */
  .op { color: var(--accent); font-style: normal; }
  .op-name {
    font: 600 .62em/1 'IBM Plex Mono', ui-monospace, monospace; letter-spacing: .04em;
    color: var(--dim); font-style: normal; vertical-align: .14em; white-space: nowrap;
  }
  .op-push { color: var(--meta); }
  .dt { color: var(--accent); font-style: normal; font-weight: 700; }
  .wit-sep, .wit-empty { color: var(--meta); font-style: normal; }
  .glossia-lazy { color: var(--dim); }
  .tx-ascii {
    margin: 0 0 .55em; padding: .12em 0 .12em 1.05em;
    border-left: 2px solid var(--accent); border-radius: 1px;
    font: italic 400 .92em/1.6 'Newsreader', Georgia, serif; color: var(--ink-soft);
  }
  .tab { display: inline-block; width: 4ch; }
  /* The illuminated initial opening the transaction's prose. */
  .tx-line.tx-body-lead::first-letter {
    font-size: 3.4em; float: left; line-height: .82; padding: .04em .07em 0 0;
    font-weight: 500; color: var(--accent);
  }

  /* ── witness footnotes ── */
  .footnotes { margin-top: 1.6em; padding-top: 1.2em; border-top: 1px solid var(--rule); }
  .footnote {
    margin: 0 0 .6em; font: 400 .8em/1.6 'Newsreader', Georgia, serif; color: var(--dim);
    overflow-wrap: anywhere;
  }
  .footnote sup { color: var(--accent); margin-right: .3em; }

  /* ── a chapter card's head (bitcoin-book.html's chapter leaf) ── */
  .chapter-head { text-align: center; justify-content: center; }
  .chapter-title {
    font: 500 1.95em/1.2 'Newsreader', Georgia, serif; color: var(--ink);
    margin: 0 0 1.15em; letter-spacing: -.01em;
  }
  .chapter-hash {
    font: italic 400 .79em/1.5 'Newsreader', Georgia, serif; color: var(--dim);
    margin: 0 auto .85em; max-width: 46ch;
  }
  .chapter-hash .cfx-gold { color: var(--accent); font-weight: 700; font-style: normal; }
  .chapter-head .cfx { display: block; font: 400 .76em/1.55 'Newsreader', Georgia, serif; color: var(--dim); }
  .chapter-head .cfx + .cfx { margin-top: .45em; }
  .fx-mark { color: var(--accent); font-weight: 700; font-style: normal; }

  /* ── an output card: the amount over the script it locks ── */
  .out-one { max-width: 46ch; margin: 0 auto; }
  .out-value { text-align: center; margin-bottom: 1.1em; font-size: .95em; }
  .out-script { min-width: 0; }

  /* ── a witness card: the footnote alone, under its letter ── */
  .wit-one { max-width: 46ch; margin: 0 auto; }
  .wit-one .footnote { font-size: .9em; }
  .wit-one .footnote sup { color: var(--accent); margin-right: .4em; }

  /* A passage clipped at the page's foot says so in the book's own idiom —
     the ⋯ it uses wherever prose is elided — rather than stopping mid-word
     and letting the reader think that was the end of it. */
  .continues {
    flex: 0 0 auto; text-align: center; margin-top: .5em;
    font-size: 1.1em; line-height: 1; color: var(--meta);
  }

  /* ── the colophon (the app's running head and nav belong to the app) ── */
  .colophon {
    flex: 0 0 auto; margin-top: 1.2em; padding-top: .9em; border-top: 1px solid var(--rule);
    display: flex; justify-content: space-between; align-items: baseline;
    font: 400 .66em/1 'IBM Plex Mono', ui-monospace, monospace; color: var(--meta);
    letter-spacing: .06em;
  }
  .colophon .cite { color: var(--accent); }
`;
}

// The whole page. `fontSize` is the root size the renderer has settled on;
// `width` / `height` fix the image. A section may be absent (its bytes
// couldn't be fetched), in which case the txid prose stands alone.
export function passageHtml({
  cite, title, sectionNum, txidProse, section, site,
  // A chapter card instead of a section card: the block's head, composed by
  // the caller (tools/prerender-passages.mjs) the same way its page is.
  chapter = false, blockProse = '', blockHashNotation = '', frontispieceRows = [],
  // Or one output of the section — its amount over the script it locks.
  outputNum = null,
  // Or one witness, as its lettered footnote.
  witnessMark = null, witnessHtml = '',
  fontSize = 19, width = PAGE_WIDTH, height = PAGE_HEIGHT, clipped = false,
}) {
  const host = String(site).replace(/^https?:\/\//, '');
  const flow = section
    ? txFlowHtml(section.fields, section.footnotesHtml || [], section.citations || [])
    : '';

  // A chapter's card carries the block's own head — title, hash prose,
  // frontispiece — rather than a transaction, so a shared chapter link
  // previews as the chapter's title page. The frame, and the fit, are the
  // same either way; only what fills .content differs.
  // One witness, set as its own card: the footnote alone, under its letter.
  const witHead = witnessMark !== null ? [
    `<h2 class="section-title"><span class="section-num">§ ${escapeHtml(String(sectionNum))}.<span class="fn-mark">${escapeHtml(String(witnessMark))}</span></span>` +
      `${title ? `<span class="section-event">${escapeHtml(title)}</span>` : ''}</h2>`,
    '<hr class="rule">',
    `<div class="wit-one"><p class="footnote"><sup>${escapeHtml(String(witnessMark))}</sup> ${witnessHtml || '∅'}</p></div>`,
  ].join('\n    ') : null;

  // One output, set as its own card: the amount over its script.
  const out = outputNum !== null ? section?.fields?.outputs?.[outputNum] : null;
  const outHead = out ? [
    `<h2 class="section-title"><span class="section-num">§ ${escapeHtml(String(sectionNum))}.${escapeHtml(String(outputNum))}</span>` +
      `${title ? `<span class="section-event">${escapeHtml(title)}</span>` : ''}</h2>`,
    '<hr class="rule">',
    `<div class="out-one"><div class="tx-note out-value">${out.value}</div>`,
    `<div class="out-script">${out.scriptAscii
      ? `<blockquote class="tx-ascii">${out.scriptAscii}</blockquote>`
      : `<p class="tx-line">${out.script}</p>`}</div></div>`,
  ].join('\n    ') : null;

  const head = witHead !== null ? witHead : outHead !== null ? outHead : chapter ? [
    `<h1 class="chapter-title">${escapeHtml(title || '')}</h1>`,
    `<div class="chapter-hash">${blockHashNotation} ${escapeHtml(blockProse)}</div>`,
    ...frontispieceRows.map(({ mark, text, gap }) => {
      const lead = mark
        ? `<span class="fx-mark">${escapeHtml(mark)}</span>${gap || !/^\d/.test(text) ? ' ' : ''}`
        : '';
      return `<span class="cfx">${lead}${text}</span>`;
    }),
  ].join('\n    ') : null;

  return `<!doctype html>
<meta charset="utf-8">
<style>${passageCss({ fontSize, width, height, fixed: true })}
</style>
<body>
<div class="page" id="page">
  <div class="content${chapter ? ' chapter-head' : ''}" id="content">
    ${head !== null ? head : `<h2 class="section-title">
      <span class="section-num">§ ${escapeHtml(String(sectionNum))}</span>
      ${title ? `<span class="section-event">${escapeHtml(title)}</span>` : ''}
    </h2>
    <div class="section-hash">${HASH_MARK}${escapeHtml(txidProse)}</div>
    <hr class="rule">
    ${flow}`}
  </div>
  ${clipped ? '<div class="continues" title="the passage continues on the live page">⋯</div>' : ''}
  <div class="colophon">
    <span>${escapeHtml(host)}</span>
    <span class="cite">${escapeHtml(cite)}</span>
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
