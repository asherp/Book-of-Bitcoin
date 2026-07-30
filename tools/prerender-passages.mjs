// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/prerender-passages.mjs — pre-render the curated passages (the table
// of contents in web/btc-contents-data.js) as static markdown under
// web/passages/, plus a sitemap.xml for the whole site, plus an archive seed
// (web/passages/seed.json) of the chain data behind those passages, which the
// reading pages import into IndexedDB on a first visit (web/btc-seed.js).
//
// Why this exists: the book is a pure client-side app — a passage's prose is
// composed in the browser by the Glossia WASM engine from data fetched off
// public Esplora APIs. A reader without JavaScript — which today includes
// every major AI crawler and most AI assistants' URL-fetch tools — gets an
// empty shell. This script runs the exact same pipeline (btc-tx.js parse →
// btc-prose.js compose → Glossia encode) at deploy time, in Node, and writes
// the result as plain markdown any crawler can read. The curated entries are
// the passages people are most likely to ask an assistant about; everything
// else stays on-demand in the browser, and llms.txt explains how to get it.
//
// Run from the repo root, after build_web.sh has dropped glossia.js /
// glossia_bg.wasm into web/:
//
//   node tools/prerender-passages.mjs
//
// Best-effort by design: a passage whose data can't be fetched is skipped
// with a log line, and the script exits 0 even so — a third-party explorer
// outage must never block a site deploy. The sitemap always covers the app
// shell; rendered passages are added as they succeed.

import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';

import { init, encodeSeedPhrase } from '../web/glossia-msg.js';
import { parseTransaction, parseBlockHeader } from '../web/btc-tx.js';
import { composeTransactionFields, composeBlockHeaderFields, renderWitness, toSuperscript } from '../web/btc-prose.js';
import { volumeBookChapter, toRoman, reference } from '../web/btc-citation.js';
import { NOTABLE } from '../web/btc-contents-data.js';
import { sectionParts } from './twitter-bot/quote.mjs';
import { loadRenderer } from './twitter-bot/image.mjs';
import {
  passagePath, cardPath, passagePageHtml, passagesByPath, CARD_WIDTH, CARD_HEIGHT,
} from './passage-page.mjs';

export const SITE = 'https://bookofbitcoin.io';
const OUT_DIR = new URL('../web/passages/', import.meta.url);
const SITEMAP = new URL('../web/sitemap.xml', import.meta.url);
const SEED_OUT = new URL('../web/passages/seed.json', import.meta.url);
// Each passage also gets a page at its citation's own path (web/III/2/5/1/)
// and a card under web/cards/ -- see tools/passage-page.mjs for why.
const WEB_DIR = new URL('../web/', import.meta.url);
const CARDS_DIR = new URL('../web/cards/', import.meta.url);

// Match the book's rendering choices exactly (bitcoin-book.html).
const BEST_OF = 5;

// A witness push or OP_RETURN payload beyond this many bytes is summarized
// instead of encoded — a data carrier (an inscription) can run to megabytes
// of prose, which belongs on the live page's lazy renderer, not in a static
// file. Body scripts are never this large in the curated set.
const MAX_ENCODE_BYTES = 8192;

// The public mirrors, or whatever PRERENDER_ESPLORA points at (comma-separated
// Esplora-compatible endpoints) — a local node, or a stand-in when testing the
// deploy pipeline offline. Same knob the reply bot takes as BOT_ESPLORA.
const ESPLORA_MIRRORS = (process.env.PRERENDER_ESPLORA || '')
  .split(',').map((s) => s.trim().replace(/\/$/, '')).filter(Boolean);
if (!ESPLORA_MIRRORS.length) {
  ESPLORA_MIRRORS.push('https://blockstream.info/api', 'https://mempool.space/api');
}

// ─── fetch, with mirror fallback ────────────────────────────────────────

async function esplora(path, kind = 'text') {
  let lastErr;
  for (const base of ESPLORA_MIRRORS) {
    try {
      const res = await fetch(base + path);
      if (res.status === 404) return null;          // genuinely absent (e.g. a future block)
      if (!res.ok) throw new Error(`${res.status} on ${base + path}`);
      return kind === 'json' ? await res.json() : (await res.text()).trim();
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error(`all mirrors failed for ${path}`);
}

// ─── prose helpers ──────────────────────────────────────────────────────

// btc-prose.js composes field strings as HTML fragments (opcode glyphs and
// data marks are <span title=…> hover tokens). A markdown passage keeps the
// visible text — exactly what a sighted reader of the page sees.
export function htmlToText(s) {
  return String(s)
    .replace(/<span class="tab"><\/span>/g, '\t')
    .replace(/<sup[^>]*>([^<]*)<\/sup>/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

const reverseHex = (hex) => (hex.match(/../g) || []).reverse().join('');
const trimTrailingZeroBytes = (hex) => hex.replace(/(00)+$/, '');

// The block-hash notation ⓪ⁿ⌘ᵐ (matches bitcoin-book.html): ⓪ carries the
// hash's exact leading-zero-bit count -- the mining vernacular for the
// proof-of-work -- and ⌘ (OP_HASH256, the double-SHA256 that produced the
// hash) carries the remaining m = 256 - n bits, which are what the prose
// encodes. ⌘'s superscript counts bits by definition; the trim underneath is
// byte-granular (⌊n/8⌋ zero bytes dropped, ⌈m/8⌉ bytes encoded).
const blockHashParts = (displayHex) => {
  const hex = trimTrailingZeroBytes(reverseHex(displayHex));
  const stripped = displayHex.replace(/^0+/, '');
  let zeroBits = (displayHex.length - stripped.length) * 4;
  if (stripped) {
    const d = parseInt(stripped[0], 16);   // zero bits inside the first significant hex digit
    zeroBits += d >= 8 ? 0 : d >= 4 ? 1 : d >= 2 ? 2 : 3;
  }
  return { hex, zeroBits, remainBits: 256 - zeroBits };
};
const hashNotation = ({ zeroBits, remainBits }) => `⓪${toSuperscript(zeroBits)} ⌘${toSuperscript(remainBits)}`;

const proseOf = (hex) => encodeSeedPhrase(hex, 'english', BEST_OF).prose;

// The capped encoder handed to the composer for OP_RETURN payloads and used
// for witness pushes: real prose for reasonable sizes, an honest placeholder
// beyond the cap.
function encodeCapped(hex) {
  const bytes = hex.length / 2;
  if (bytes > MAX_ENCODE_BYTES) {
    return `⟨${bytes.toLocaleString('en-US')} bytes of data — too large for this static passage; ` +
      `the live page renders it in full⟩`;
  }
  return proseOf(hex);
}

export function slugify(title) {
  return title.toLowerCase()
    .replace(/[’'".,()]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ─── passage rendering ──────────────────────────────────────────────────

// The chapter frontispiece: the block header's fields, decoded the way the
// book's title page shows them.
export function frontispieceMd(header) {
  const hf = composeBlockHeaderFields(header);
  const isGenesisPrev = header.prevBlockHash === '00'.repeat(32);
  const prevParts = isGenesisPrev ? null : blockHashParts(header.prevBlockHash);
  const prev = isGenesisPrev
    ? `⓪${toSuperscript(256)} (no earlier block — this is the genesis block; all 256 bits zero)`
    : `${hashNotation(prevParts)} ${proseOf(prevParts.hex)}`;
  // Wire order throughout, as on the live page. The difficulty row states
  // the proof of work as the inequality it is -- β₇₈ < 213529×256²⁰ -- the
  // < binding the block hash printed above the frontispiece to the exact
  // target, without the field leaving its wire slot.
  const lines = [
    `- **version:** v${htmlToText(hf.version)} — ${htmlToText(hf.versionTitle)}`,
    `- **previous block:** ${prev}`,
    isGenesisPrev ? null : `  - hex: \`${header.prevBlockHash}\``,
    `- **merkle root:** ⋔ ${proseOf(reverseHex(header.merkleRoot))}`,
    `  - hex: \`${header.merkleRoot}\``,
    `- **timestamp:** ${hf.timestamp}`,
    `- **difficulty target:** ${htmlToText(hf.bits)}${hf.bitsExpr ? ` < ${hf.bitsExpr} — the block hash above reads below this target` : ''} — ${htmlToText(hf.bitsTitle)}`,
    `- **nonce:** η ${hf.nonce}`,
  ];
  return lines.filter(Boolean).join('\n');
}

// One transaction, rendered as its section: the same fields, in wire order,
// that bitcoin-book.html lays out as a manuscript page.
export function sectionMd({ txid, fields, sectionNum, eventTitle }) {
  const out = [];
  out.push(`## § ${sectionNum}${eventTitle ? ` — ${eventTitle}` : ''}`);
  out.push('');
  out.push(`Transaction id, as prose: ⌘${toSuperscript(256)} *${proseOf(reverseHex(txid))}*`);
  out.push('');
  out.push(`- **version:** ${fields.version}`);
  fields.inputs.forEach((inp, i) => {
    const src = inp.isNullPrevout
      ? 'coinbase (∅ — no previous output; new coin)'
      : `spends output ${inp.prevVout} of \`${inp.prevTxid}\``;
    out.push(`- **input ${i + 1}:** ${src}`);
    const script = htmlToText(inp.script).trim();
    if (script) out.push(`  - script: ${script}`);
    out.push(`  - sequence: ${htmlToText(inp.sequence)} — ${htmlToText(inp.sequenceTitle)}`);
    if (inp.witnessItems.length) {
      out.push(`  - witness: see footnote ${i + 1}`);
    }
  });
  fields.outputs.forEach((o, i) => {
    out.push(`- **output ${i + 1}:** ${htmlToText(o.value)}`);
    out.push(`  - script: ${htmlToText(o.script).trim()}`);
  });
  out.push(`- **locktime:** ${htmlToText(fields.locktime)} — ${htmlToText(fields.locktimeTitle)}`);

  const witnessed = fields.inputs
    .map((inp, i) => ({ inp, i }))
    .filter(({ inp }) => inp.witnessItems.length);
  if (witnessed.length) {
    out.push('');
    out.push('### Witness footnotes');
    out.push('');
    for (const { inp, i } of witnessed) {
      const w = inp.witnessZero ? '∅' : htmlToText(renderWitness(inp.witnessItems, encodeCapped));
      out.push(`${i + 1}. ${w}`);
    }
  }
  return out.join('\n');
}

export function passageMd({ title, height, blockHash, header, txCount, txid, index, fields }) {
  const { volume, book, chapter } = volumeBookChapter(height);
  const cite = `${reference(height)} §${index + 1}`;
  const liveUrl = `${SITE}/bitcoin-book.html?txid=${txid}`;
  const chapterEvents = NOTABLE
    .filter((e) => e.id === String(height) && e.page !== 'book')
    .map((e) => e.title);

  const md = [];
  md.push(`# ${title}`);
  md.push('');
  md.push(`> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is`);
  md.push(`> block ${height.toLocaleString('en-US')} read as a chapter, and its transaction ${index + 1}`);
  md.push(`> (of ${txCount.toLocaleString('en-US')}) read as a section of Glossia prose. Every byte of the`);
  md.push(`> transaction is carried in the prose and decodes back out losslessly; the`);
  md.push(`> connective grammar is the translator's, the content is the chain's.`);
  md.push('');
  md.push(`- **Citation:** ${cite} (Volume ${toRoman(volume)}, Book ${book}, Chapter ${chapter}, section ${index + 1})`);
  md.push(`- **Block:** ${height.toLocaleString('en-US')}${chapterEvents.length ? ` — ${chapterEvents.join(' · ')}` : ''}`);
  md.push(`- **Block hash:** \`${blockHash}\``);
  md.push(`- **Transaction id:** \`${txid}\``);
  md.push(`- **Read live:** ${liveUrl}`);
  md.push('');
  md.push(`## Chapter frontispiece — block ${height.toLocaleString('en-US')}`);
  md.push('');
  const bh = blockHashParts(blockHash);
  md.push(`Block hash, as prose: ${hashNotation(bh)} *${proseOf(bh.hex)}*`);
  md.push('');
  md.push(frontispieceMd(header));
  md.push('');
  md.push(sectionMd({ txid, fields, sectionNum: index + 1, eventTitle: title }));
  md.push('');
  md.push('---');
  md.push('');
  md.push(`*Reading the notation:* italic prose passages are Glossia encodings of the raw`);
  md.push(`bytes (decodable with the [glossia](https://crates.io/crates/glossia) engine,`);
  md.push(`wordlist \`bip39\`, language \`english\`); glyphs are the book's script notation`);
  md.push(`(opcode and data marks); small structural integers (version, counts, values,`);
  md.push(`locktime) are printed literally. A block hash reads ⓪ⁿ ⌘ᵐ — n leading`);
  md.push(`proof-of-work zero bits, then the remaining m = 256 − n bits of the`);
  md.push(`double-SHA256 (⌘, OP_HASH256), Glossia-encoded as ⌈m/8⌉ bytes. See`);
  md.push(`[/llms.txt](${SITE}/llms.txt) for how any other passage on the chain can be`);
  md.push(`fetched and read the same way.`);
  md.push('');
  return md.join('\n');
}

// ─── archive seed ───────────────────────────────────────────────────────
//
// Alongside each passage's markdown, collect the exact ingredients the
// reading pages keep in IndexedDB (btc-store.js): everything renderEntry
// fetches anyway, shaped store -> key -> value so the client-side import
// (web/btc-seed.js) is a dumb loop and the stored shapes can never drift
// from what the pages' own loaders write after the same fetches. All of it
// is immutable chain data, keyed by hash / txid / deep height -- exactly the
// archive's admission rule.

// A big block's txid list stays on-demand (it can run to ~100s of KB); under
// this JSON size (~480 txids) it ships, and the curated block entries that
// need the list to open their §section read offline on a first visit.
const SEED_MAX_TXIDS_JSON = 32 * 1024;

// A data-carrier transaction (an inscription) can run to megabytes of hex;
// past this it stays on-demand like any uncurated passage's bytes.
const SEED_MAX_TX_HEX = 256 * 1024;

// A citation's outputs beyond this JSON size stay on-demand -- an output-heavy
// transaction's vout list is the whole value of the seeded citation, and a
// truncated one would be kept forever (the archive never refetches).
const SEED_MAX_OUTPUTS_JSON = 32 * 1024;

export const emptySeed = () => ({ heights: {}, blocks: {}, txids: {}, tx: {}, placements: {}, citations: {} });

export function addToSeed(seed, { entryId, height, blockHash, block, headerHex, txid, pos, txHex, txids, outputs }) {
  seed.heights[height] = blockHash;
  seed.blocks[blockHash] = { block, headerHex };
  if (txHex && txHex.length <= SEED_MAX_TX_HEX) seed.tx[txid] = txHex;
  // A txid entry's placement, keyed by the id exactly as the contents data
  // writes it -- the same key resolvePlacement looks up. Block entries place
  // from their height offline already.
  if (entryId && isTxid(entryId)) seed.placements[entryId] = { height, pos };
  if (txids && JSON.stringify(txids).length <= SEED_MAX_TXIDS_JSON) seed.txids[blockHash] = txids;
  // The curated transactions are the ones most likely to be cited from other
  // chapters; seed the citation only WITH its outputs -- a kept { outputs:
  // null } would answer forever, worse than the network's full answer.
  if (outputs && JSON.stringify(outputs).length <= SEED_MAX_OUTPUTS_JSON) {
    seed.citations[txid] = { height, pos, outputs };
  }
}

export function seedJson(seed) {
  // Content-stamped so the client can mark what it imported; identical chain
  // data across deploys yields an identical stamp, and no reader re-imports.
  const stamp = createHash('sha256').update(JSON.stringify(seed)).digest('hex').slice(0, 16);
  return JSON.stringify({ v: 1, stamp, ...seed });
}

// ─── per-entry pipeline ─────────────────────────────────────────────────

const isTxid = (id) => /^[0-9a-f]{64}$/i.test(id);

async function blockContext(height) {
  const blockHash = await esplora(`/block-height/${height}`);
  if (!blockHash) return null;                       // not mined yet (BIP42's 13,440,000)
  const headerHex = await esplora(`/block/${blockHash}/header`);
  const meta = await esplora(`/block/${blockHash}`, 'json');
  return { blockHash, headerHex, block: meta, header: parseBlockHeader(headerHex), txCount: meta.tx_count };
}

async function renderEntry(entry, seed) {
  if (entry.page === 'book' || entry.id === '-1') return null;   // a leaf / the moving tip — no static passage

  let height, index, txid;
  const fromTxid = isTxid(entry.id);
  if (fromTxid) {
    txid = entry.id.toLowerCase();
    const proof = await esplora(`/tx/${txid}/merkle-proof`, 'json');
    if (!proof) return null;
    height = proof.block_height;
    index = proof.pos;
  } else {
    height = parseInt(entry.id, 10);
    index = entry.index ?? 0;                        // a block entry reads from its coinbase
  }

  const ctx = await blockContext(height);
  if (!ctx) return null;
  let txids = null;
  if (!txid) {
    txids = await esplora(`/block/${ctx.blockHash}/txids`, 'json');
    txid = txids[index];
  }
  const hex = await esplora(`/tx/${txid}/hex`);
  const parsed = parseTransaction(hex);
  const fields = composeTransactionFields(parsed, BEST_OF, encodeCapped);

  // The outputs behind this transaction's citation (resolveCitation shows a
  // spent output's amount under a reference). Its own fetch, and best-effort
  // on its own: a miss costs the seed one citation, never the passage.
  let outputs = null;
  try { outputs = (await esplora(`/tx/${txid}`, 'json'))?.vout ?? null; } catch { /* stays on-demand */ }

  addToSeed(seed, {
    entryId: entry.id, height, blockHash: ctx.blockHash, block: ctx.block,
    headerHex: ctx.headerHex, txid, pos: index, txHex: hex, txids, outputs,
  });

  // The section in the shape the page and the card set it: composed fields
  // plus rendered witness HTML, exactly as the reply bot builds it.
  const witnessOf = (inp) =>
    (inp.witnessItems.length ? (inp.witnessZero ? '∅' : renderWitness(inp.witnessItems, encodeCapped)) : null);
  const section = {
    ...sectionParts(fields, witnessOf),
    fields,
    footnotesHtml: fields.inputs.map(witnessOf).filter((w) => w !== null),
  };

  return {
    slug: slugify(entry.title),
    title: entry.title,
    fromTxid,
    height,
    index,
    txid,
    blockHash: ctx.blockHash,
    txCount: ctx.txCount,
    section,
    txidProse: proseOf(reverseHex(txid)),
    md: passageMd({ title: entry.title, height, index, txid, fields, ...ctx }),
  };
}

// ─── index + sitemap ────────────────────────────────────────────────────

export function indexMd(rendered) {
  const md = [];
  md.push('# The βook of βitcoin — curated passages, as plain text');
  md.push('');
  md.push('> Static markdown renderings of the book\'s table of contents — the blocks and');
  md.push('> transactions worth a reader\'s attention, each one a Bitcoin transaction');
  md.push('> rendered verbatim as Glossia prose. The live book renders any passage on the');
  md.push(`> chain, in the browser: ${SITE}/`);
  md.push('');
  md.push(`See [/llms.txt](${SITE}/llms.txt) for the site's structure, the citation`);
  md.push('scheme, and how to read passages beyond this curated set.');
  md.push('');
  for (const r of rendered) {
    md.push(`- [${r.title}](./${r.slug}.md) — ${reference(r.height)} §${r.index + 1} ` +
      `([as a page](${SITE}${passagePath(r.height, r.index + 1)}))`);
  }
  md.push('');
  return md.join('\n');
}

export function sitemapXml(rendered) {
  const pages = [
    '', 'bitcoin-book.html', 'bitcoin-contents.html', 'bitcoin-front.html',
    'bitcoin-search.html', 'bitcoin-ledger.html', 'bitcoin-ledgers.html',
    'preface.md', 'llms.txt', 'passages/index.md',
    ...rendered.map((r) => `passages/${r.slug}.md`),
    // The citation paths: a passage's canonical, shareable address, each
    // carrying its own card (see tools/passage-page.mjs). Listed without the
    // leading slash passagePath returns, since SITE supplies it.
    ...passagesByPath(rendered).map((r) => passagePath(r.height, r.index + 1).slice(1)),
  ];
  const urls = pages.map((p) => `  <url><loc>${SITE}/${p}</loc></url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

// ─── main ───────────────────────────────────────────────────────────────

async function main() {
  const wasmBytes = await readFile(new URL('../web/glossia_bg.wasm', import.meta.url));
  // wasm-bindgen's web-target init, fed bytes directly so it never tries a
  // browser-style URL fetch; the two call forms cover old and new bindgen.
  try { await init({ module_or_path: wasmBytes }); }
  catch { await init(wasmBytes); }

  await mkdir(OUT_DIR, { recursive: true });

  const rendered = [];
  const seed = emptySeed();
  let skipped = 0;
  for (const entry of NOTABLE) {
    try {
      const r = await renderEntry(entry, seed);
      if (!r) { skipped++; continue; }
      await writeFile(new URL(`${r.slug}.md`, OUT_DIR), r.md);
      rendered.push(r);
      console.log(`  ok  ${r.slug}.md  (${reference(r.height)} §${r.index + 1})`);
    } catch (e) {
      skipped++;
      console.warn(`  SKIP ${entry.title}: ${e.message}`);
    }
  }

  // ─── the citation pages, and their cards ──────────────────────────────
  //
  // Each passage gets a page at its own citation path, carrying its own
  // og:image. The card is rendered by the reply bot's renderer (headless
  // Chromium), which is optional here exactly as it is there: without it the
  // pages still ship and fall back to the site's standing card, so a deploy
  // never turns on a browser being installable.
  await writeFile(new URL('index.md', OUT_DIR), indexMd(rendered));

  let renderer = null;
  try { renderer = await loadRenderer(); } catch { /* pages without cards */ }
  if (!renderer && rendered.length) {
    console.warn('  no image renderer — citation pages will ship with the standing card');
  }
  let cards = 0;
  for (const r of passagesByPath(rendered)) {
    const sectionNum = r.index + 1;
    let cardUrl = null;
    if (renderer) {
      try {
        const passage = {
          cite: `${reference(r.height)} §${sectionNum}`,
          title: r.title, sectionNum,
          txidProse: r.txidProse, section: r.section,
        };
        const { png } = await renderer.render(passage,
          { site: SITE, width: CARD_WIDTH, height: CARD_HEIGHT });
        await mkdir(CARDS_DIR, { recursive: true });
        const rel = cardPath(r.height, sectionNum).replace(/^\/cards\//, '');
        await writeFile(new URL(rel, CARDS_DIR), png);
        cardUrl = SITE + cardPath(r.height, sectionNum);
        cards++;
      } catch (e) {
        console.warn(`  card SKIP ${r.slug}: ${e.message}`);
      }
    }
    const dir = new URL(`.${passagePath(r.height, sectionNum)}`, WEB_DIR);
    await mkdir(dir, { recursive: true });
    await writeFile(new URL('index.html', dir), passagePageHtml({
      site: SITE, height: r.height, sectionNum, title: r.title,
      txidProse: r.txidProse, section: r.section, txCount: r.txCount,
      blockHash: r.blockHash, txid: r.txid, cardUrl, slug: r.slug,
    }));
    console.log(`  page ${passagePath(r.height, sectionNum)}${cardUrl ? '  + card' : ''}`);
  }
  if (renderer) await renderer.close();

  await writeFile(SITEMAP, sitemapXml(rendered));
  // The archive seed rides with the passages -- but only when something
  // rendered: an explorer outage must not ship an empty seed, whose stamp
  // would mark first-time readers as provisioned with nothing.
  if (rendered.length) {
    const json = seedJson(seed);
    await writeFile(SEED_OUT, json);
    console.log(`  seed.json: ${Object.keys(seed.blocks).length} blocks, ` +
      `${Object.keys(seed.tx).length} transactions, ${Object.keys(seed.txids).length} txid lists, ` +
      `${Object.keys(seed.citations).length} citations (${Math.round(json.length / 1024)} KB)`);
  }
  console.log(`\n${rendered.length} passages rendered, ${skipped} skipped; ` +
    `${passagesByPath(rendered).length} citation pages, ${cards} cards.`);
  if (!rendered.length) {
    // Still exit 0: an explorer outage must not block the site deploy. The
    // shell, llms.txt and sitemap still ship; passages return next deploy.
    console.warn('WARNING: no passages rendered — explorer APIs unreachable?');
  }
}

// Import-safe: tests import the renderers above without touching the network.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
