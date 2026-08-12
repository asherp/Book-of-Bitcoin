// SPDX-License-Identifier: MIT OR Apache-2.0
//
// btc-index.js — the ledgers of the Bitcoin Book: notable addresses, each a
// view of the manuscript focused on amounts. Shared by bitcoin-ledger.html
// (the Ledger compendium: every ledger in one document, ledgers over
// addresses over entries) and bitcoin-search.html (which decodes an address
// query with addressScriptHex, to write the term it binds — see btc-term.js —
// rather than routing it here). Besides the curated data, this module carries the machinery
// the ledger pages share: the mapping that discovers an address's chapters,
// the store that remembers them, and the renderers that lay them out. (The
// filename keeps its index-era name so cached module graphs never mix
// builds.)
//
// The curated ledgers themselves -- which addresses the book keeps, and the
// story behind each -- are editorial work and live in btc-index-data.js under
// CC BY 4.0; they are re-exported here so importers see one module. See the
// README's License section.

import { volumeBookChapter, toRoman } from './btc-citation.js';
import { storeGet, storePut } from './btc-store.js';
import { INDEXED as CURATED } from './btc-index-data.js';
import { usdOn } from './btc-price.js';
import { amountUnit, ownUnit, groupDigits, formatValuation } from './btc-amounts.js';
import { pathSegments } from './btc-path.js';
import { tokenizeScript } from './btc-tx.js';

// A loose shape test for the address forms the chain has used: base58 P2PKH
// ('1…') and P2SH ('3…'), and bech32/bech32m ('bc1…', matched lowercase --
// the all-uppercase QR form is normalized by the caller). Shape only, no
// checksum: its job is routing a query to the index page, whose chain lookup
// is the real validator.
export const isAddress = (s) =>
  /^([13][1-9A-HJ-NP-Za-km-z]{25,34}|bc1[02-9ac-hj-np-z]{11,87})$/.test(s);

// A ledger member is a NAME for a set of outputs, and two spellings of one
// exist: an address (the common case), and a raw scriptPubKey as lowercase
// hex -- the name of an output no address can write, like the malformed
// Mt. Gox withdrawal script. Esplora serves the same record for both; a
// script member is asked for by its scripthash (below). Members stay plain
// strings everywhere -- the store's keys, a kept ledger's list, the URL --
// and the two spellings are told apart only where the chain is asked or the
// passage is rendered. isAddress is consulted first wherever both could
// match: an address never reads as hex (base58 spells no '0'; bech32 wears
// its 'bc1'), but a rare hex string can shape-match an address, and a name
// that decodes as one is one.
export const isScriptHex = (s) => /^(?:[0-9a-f]{2})+$/.test(s) && !isAddress(s);
export const isMember = (s) => isAddress(s) || isScriptHex(s);

// The curated shelf, with each entry's `scripts:` -- members written as raw
// scriptPubKey hex -- folded into its member list. One list downstream, so
// every consumer (URL joins, set matching, the store) handles one shape; a
// member's spelling is re-told where it matters (isAddress / isScriptHex).
export const INDEXED = CURATED.map((e) => ({
  ...e,
  addresses: [...(e.addresses ?? []), ...(e.scripts ?? [])],
}));

// ── The kept-ledger registry ──────────────────────────────────────────────
// The reader's own shelf: ledgers kept from their pages, each a titled set
// of addresses. Older entries kept a single `address`; they read back as
// one-address ledgers, so nothing already kept is lost to the shape change.
const KEPT_KEY = 'glossia-btc-ledgers';
export function keptLedgers() {
  try {
    const v = JSON.parse(localStorage.getItem(KEPT_KEY));
    if (!Array.isArray(v)) return [];
    return v
      .map((k) => ({
        title: typeof k?.title === 'string' ? k.title : '',
        addresses: (Array.isArray(k?.addresses) ? k.addresses : [k?.address]).filter(isMember),
      }))
      .filter((k) => k.addresses.length);
  } catch { return []; }
}
export function saveKeptLedgers(list) {
  try { localStorage.setItem(KEPT_KEY, JSON.stringify(list)); } catch (_) { /* unavailable */ }
}

// Two ledgers are the same when they hold the same addresses, in any order.
export const sameAddresses = (a, b) => a.length === b.length && a.every((x) => b.includes(x));

// ── The shelf, filed ──────────────────────────────────────────────────────
// A slash in a kept ledger's title is a path (btc-path.js), exactly as it is
// in a bookmark's, and here it does more than group rows: a parent is a
// ledger in its own right, holding every member of everything beneath it,
// with its children partitioning it.
//
// The Coldcard hack is the argument for that reading. It has 221 members
// whose structure is real -- seven shared vaults from waves 1-2, and 214
// one-per-victim vaults from wave 3 whose whole distinguishing feature is
// that they are NOT shared -- so `Coldcard hack/waves 1–2` and
// `Coldcard hack/wave 3` are two tables answering different questions while
// `Coldcard hack` still totals all 221, which is the figure the incident is
// quoted by. A grouping that could not be opened would make the reader
// choose one of the two and lose the other.
//
// Three rules and a restraint:
//   · keeps sharing a full path are ONE ledger -- the union of their
//     members, in the order they were kept. Keeping under a name already
//     used folds into it rather than shelving a second ledger of that name.
//   · a parent's account is its own members plus every descendant's, in
//     shelf order, each member counted once however many children hold it.
//   · order is depth-first in the order the reader kept things, so the
//     shelf reads as it was built.
//   · a parent whose account is exactly its one child's is not shelved
//     twice: the same restraint the contents keeps in declining to raise a
//     heading over a lone row.
export function shelfLedgers(kept = keptLedgers()) {
  const byPath = new Map();          // 'a/b' -> { path, addresses }
  const own = (path) => {
    const key = path.join('/');
    if (!byPath.has(key)) byPath.set(key, { path, addresses: [] });
    return byPath.get(key);
  };
  for (const k of kept) {
    const segs = pathSegments(k.title);
    const node = own(segs.length ? segs : ['']);
    for (const a of k.addresses) if (!node.addresses.includes(a)) node.addresses.push(a);
    for (let d = 1; d < segs.length; d++) own(segs.slice(0, d));   // the parents it implies
  }
  // Depth-first over first-appearance order: a node's children are the keys
  // one segment longer that start with its path.
  const out = [];
  const shelved = new Set();   // the paths actually standing as rows, for the depth below
  const walk = (prefix) => {
    for (const node of byPath.values()) {
      if (node.path.length !== prefix.length + 1) continue;
      if (!prefix.every((s, i) => node.path[i] === s)) continue;
      const kids = [];
      const gather = (n) => {
        for (const m of byPath.values()) {
          if (m.path.length !== n.path.length + 1) continue;
          if (!n.path.every((s, i) => m.path[i] === s)) continue;
          kids.push(m); gather(m);
        }
      };
      gather(node);
      const addresses = [...node.addresses];
      for (const kid of kids) for (const a of kid.addresses) if (!addresses.includes(a)) addresses.push(a);
      // The restraint: a parent that would open the same account as its one
      // child stands as a heading over it in the listing and not as a second
      // ledger of the same coins.
      const doubles = kids.length === 1 && !node.addresses.length;
      if (!doubles) {
        // How far in a row stands is how many of its ancestors are actually
        // on the shelf, not how many segments its name has: a row whose
        // parent was skipped steps up to take its place, carrying the whole
        // name the skipped heading would have said.
        out.push({
          title: node.path.join('/'),
          name: node.path.join(' / '),
          leaf: shelved.has(node.path.slice(0, -1).join('/')) ? node.path[node.path.length - 1] : node.path.join(' / '),
          depth: node.path.slice(0, -1).filter((_, i) => shelved.has(node.path.slice(0, i + 1).join('/'))).length,
          addresses,
          parent: kids.length > 0,
        });
        shelved.add(node.path.join('/'));
      }
      walk(node.path);
    }
  };
  walk([]);
  return out.filter((l) => l.addresses.length);
}

/** Keep a set of members under a name — the one writer for both pages that
 *  offer it, so the fold is the same wherever it is done. Keeping under a
 *  name already used folds into that ledger rather than shelving a second of
 *  the name: two keeps sharing a path are one ledger, which is the whole
 *  point of reading the name as a path. An untitled keep appends as it
 *  always did — a name is what folds, and it has none. */
export function keepLedger(title, addresses) {
  const path = pathSegments(title).join('/');
  const all = keptLedgers();
  const mine = path ? all.find((k) => pathSegments(k.title).join('/') === path) : null;
  if (mine) mine.addresses = [...mine.addresses, ...addresses.filter((a) => !mine.addresses.includes(a))];
  else all.push({ title, addresses: [...addresses] });
  saveKeptLedgers(all);
  return path;
}

/** The shelved ledger a path names, or null. The path is the name a reader
 *  typed, so it is matched as they wrote it, trimmed segment by segment. */
export const shelfLedgerFor = (path, kept = keptLedgers()) => {
  const want = pathSegments(path).join('/');
  return want ? shelfLedgers(kept).find((l) => l.title === want) ?? null : null;
};

// Resolve the ledger a URL names from its address list. One address that
// belongs to a curated or kept ledger opens that whole ledger, positioned
// on the named address; a list is matched as a set; anything unrecognized
// opens as its own unkept ledger of exactly the addresses given.
export function ledgerFor(list) {
  for (const [pool, curated] of [[INDEXED, true], [keptLedgers(), false]]) {
    const hit = pool.find((e) => (list.length === 1
      ? e.addresses.includes(list[0])
      : sameAddresses(e.addresses, list)));
    if (hit) {
      return { title: hit.title, addresses: hit.addresses, curated,
               at: Math.max(0, hit.addresses.indexOf(list[0])) };
    }
  }
  return { title: '', addresses: list, curated: false, at: 0 };
}

// A citation link into the book for one appearance: the transaction's chapter
// opens by txid, and the book resolves its exact §section itself. An output
// index deepens the landing (&out=N): the book brings that output to the
// top, the same landing its own marginalia make.
// A citation's URL: the transaction, and where in it. `out` names an output --
// the coordinate a credit lands on -- and `wit` an input, which is where a
// spend's own data lives. The book takes the input as a plain vin number and
// resolves it to the footnote that carries it (landOnWitness), so nothing here
// has to know which inputs got footnotes and which did not.
export const citeHref = (txid, out, wit) =>
  `bitcoin-book.html?txid=${txid}${out != null ? `&out=${out}` : ''}`
  + `${wit != null ? `&wit=${wit}` : ''}`;

// The address's scriptPubKey, as hex: its on-chain identity, and the exact
// bytes the book Glossia-encodes wherever a chapter pays this address -- so a
// title page that encodes these bytes reads the same prose the chapters do.
// Handles the shapes isAddress admits: base58 P2PKH/P2SH (decoded without the
// checksum pass -- shape plus the chain's own answer already validate an
// address this module is asked about) and bech32/bech32m v0/v1 witness forms
// (whose checksum is pure arithmetic, so it *is* checked). Null when the form
// doesn't decode.
const B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const B32 = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
const toHex = (bytes) => bytes.map((b) => b.toString(16).padStart(2, '0')).join('');
function base58Payload(s) {
  let n = 0n;
  for (const c of s) {
    const i = B58.indexOf(c);
    if (i < 0) return null;
    n = n * 58n + BigInt(i);
  }
  const bytes = [];
  for (; n > 0n; n /= 256n) bytes.unshift(Number(n % 256n));
  for (const c of s) { if (c !== '1') break; bytes.unshift(0); }
  if (bytes.length !== 25) return null;               // version + hash160 + checksum
  return { version: bytes[0], hash: bytes.slice(1, 21) };
}
function bech32Polymod(values) {
  const GEN = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
  let chk = 1;
  for (const v of values) {
    const b = chk >> 25;
    chk = ((chk & 0x1ffffff) << 5) ^ v;
    for (let i = 0; i < 5; i++) if ((b >> i) & 1) chk ^= GEN[i];
  }
  return chk;
}
function bech32Witness(addr) {
  const data = [...addr.slice(3)].map((c) => B32.indexOf(c));   // past the 'bc1' hrp+separator
  if (data.includes(-1) || data.length < 7) return null;
  const hrpExpand = [3, 3, 0, 2, 3];                  // 'bc' expanded, per BIP173
  const version = data[0];
  const constant = version === 0 ? 1 : 0x2bc830a3;    // bech32 for v0, bech32m above
  if (bech32Polymod(hrpExpand.concat(data)) !== constant) return null;
  const program = [];
  let acc = 0, bits = 0;
  for (const v of data.slice(1, -6)) {
    acc = (acc << 5) | v;
    bits += 5;
    if (bits >= 8) { bits -= 8; program.push((acc >> bits) & 0xff); }
  }
  return { version, program };
}
export function addressScriptHex(address) {
  if (address.startsWith('bc1')) {
    const w = bech32Witness(address);
    if (!w || !w.program.length) return null;
    const op = w.version === 0 ? '00' : (0x50 + w.version).toString(16);
    return op + w.program.length.toString(16).padStart(2, '0') + toHex(w.program);
  }
  const p = base58Payload(address);
  if (!p) return null;
  if (p.version === 0x00) return '76a914' + toHex(p.hash) + '88ac';   // P2PKH
  if (p.version === 0x05) return 'a914' + toHex(p.hash) + '87';       // P2SH
  return null;
}

// A member's scriptPubKey, whichever spelling the member is written in: an
// address decodes to its script; a script member IS its script. This is the
// hex the ledger's passage leaf Glossia-encodes, and the bytes every entry
// of the member quotes.
export const memberScriptHex = (member) =>
  isAddress(member) ? addressScriptHex(member) : isScriptHex(member) ? member : null;

// Where Esplora is asked about a member. An address has its own endpoint
// family; a script is asked for by its scripthash -- the SHA-256 of the raw
// scriptPubKey, hex, unreversed -- under /scripthash/, an exact alias of
// /address/ across the endpoints this module uses (stats, /txs/chain,
// /utxo). The digest is computed once per member and remembered.
const scripthashMemo = new Map();
function scripthashOf(hex) {
  if (!scripthashMemo.has(hex)) {
    scripthashMemo.set(hex, (async () => {
      const bytes = new Uint8Array((hex.match(/../g) || []).map((b) => parseInt(b, 16)));
      const digest = await crypto.subtle.digest('SHA-256', bytes);
      return toHex([...new Uint8Array(digest)]);
    })().catch(() => { scripthashMemo.delete(hex); return null; }));
  }
  return scripthashMemo.get(hex);
}
async function memberPath(member) {
  if (isAddress(member)) return `/address/${member}`;
  const h = await scripthashOf(member);
  return h ? `/scripthash/${h}` : null;
}

// A net satoshi amount in the reader's chosen record notation
// (btc-amounts.js): ₿ with the full eight decimal places so a right-aligned
// column aligns on the point, the middle-dot satoshi grouping, or the bare
// integer. Signed, since an index line reads as a ledger: what the chapter
// paid the address (+) or spent from it (−). A valuation choice cannot be
// served here — it needs the row's own day, which arrives asynchronously
// (fillAmountCell below) — so this is also the fallback a valuation falls
// back TO: an entry with no day, or a day no source can price, reads in
// the record's own ₿ rather than in nothing at all.
export function formatNetBtc(sats) {
  const u = amountUnit();
  const sign = sats < 0 ? '−' : '+';
  const abs = Math.abs(sats);
  if (u === 'sats') return sats ? `${sign}${groupDigits(String(abs))} sats` : '0 sats';
  if (u === 'raw') return sats ? `${sign}${abs}` : '0';
  if (!sats) return '0 ₿';
  const whole = Math.floor(abs / 1e8).toLocaleString('en-US');
  const frac = String(abs % 1e8).padStart(8, '0');
  return `${sign}${whole}.${frac} ₿`;
}

// The same notation unsigned: a balance is what the address holds, not a
// ledger movement, so it carries no sign.
export const formatBalanceBtc = (sats) => formatNetBtc(sats).replace(/^[+−]/, '');

// The reconciliation test -- double-entry proof of a finished sync. Over a
// truly complete confirmed history, the ledger identity is exact: the sum of
// every entry (credits less debits) IS funded-minus-spent, the balance. So
// equality proves the map whole, and inequality names it still syncing -- a
// capped walk, a block that arrived mid-mapping, or a mirror that answered
// short. The pages gate a ledger behind this: nothing is displayed or
// entered until its numbers add up (the next revalidation converges it).
export const ledgerSum = (data) => data.entries.reduce((n, c) => n + c.sats, 0);
export const reconciled = (data) =>
  !!data && data.complete && data.balance != null && ledgerSum(data) === data.balance;

// ---------------------------------------------------------------------------
// The mapping, the store, and the renderers shared by the index-family pages.
//
// An address's *map* grows as the reader reads it. Esplora instances feed
// it, newest first: opening a ledger fetches the latest page (resolveLine),
// and each thumb deeper into the past fetches exactly one more
// (extendLine) -- there is no automatic backfill; exploration is the sync.
// Because past blocks are closed -- a transaction can never be inserted
// into mined history -- every page found is banked for good: found data
// survives any interruption, revisits resume at the banked cursor rather
// than restart, and a later top-up reads only above the banked frontier,
// which cannot overlap what's kept. Unreachable mirrors leave the stored
// state standing -- however deep it reaches -- or, with nothing stored,
// the syncing gate.

// --- Where the chain is asked: Esplora-compatible endpoints (Blockstream,
// mempool.space, or the reader's own node) -- the same API family, and the
// same stored settings, as the book's reading pages, so one Data source
// choice serves the whole app. Custom endpoints and the selected preference
// live in localStorage and are read at call time, so a change applies from
// the very next fetch. (The Blockbook pool served the mapping for a while;
// its rejections arrive without CORS headers, so from a browser every
// failure -- throttle, block, outage -- collapsed to a nameless
// "unreachable". Esplora's error responses keep their names, and its
// per-transaction pagination suits the newest-first backfill.)
export const DEFAULT_ESPLORA = ['https://blockstream.info/api', 'https://mempool.space/api'];
const ENDPOINTS_KEY = 'glossia-btc-endpoints';   // custom endpoints: [{label,url}] -- the book page's own store
const SELECTED_KEY = 'glossia-btc-endpoint';     // preferred endpoint url
export function esploraCustom() {
  try {
    const v = JSON.parse(localStorage.getItem(ENDPOINTS_KEY));
    return Array.isArray(v) ? v.map((m) => (m && typeof m.url === 'string' ? m.url : null)).filter(Boolean) : [];
  } catch { return []; }
}
function esploraMirrors() {
  const all = [...DEFAULT_ESPLORA, ...esploraCustom()];
  let sel = null;
  try { sel = localStorage.getItem(SELECTED_KEY); } catch { /* unavailable */ }
  return sel && all.includes(sel) ? [sel, ...all.filter((u) => u !== sel)] : all;
}
export const esploraSelected = () => esploraMirrors()[0];
// The settings writer: pass only what changes; null restores the default.
// Custom endpoints are written in the book page's {label, url} shape, so
// either page's picker reads the other's additions.
const hostOf = (url) => { try { return new URL(url).host; } catch { return url; } };
export function setEsploraSettings({ custom, selected } = {}) {
  try {
    if (custom !== undefined) localStorage.setItem(ENDPOINTS_KEY, JSON.stringify(custom.map((url) => ({ label: hostOf(url), url }))));
    if (selected !== undefined) {
      if (selected === null) localStorage.removeItem(SELECTED_KEY);
      else localStorage.setItem(SELECTED_KEY, selected);
    }
  } catch { /* unavailable; settings just don't stick */ }
}

// One esplora request, with patience: a throttle (429) honors its
// Retry-After (capped -- past a few seconds the UI state serves better than
// a hang) and a server-side stumble (5xx) gets brief backed-off retries
// before the mirror is given up on -- public instances rate-limit, and one
// refused page must not fail a whole walk. A definitive refusal (404 and
// kin) returns at once. The last failure's nature is kept so the pages can
// name it: a throttle reads differently from a refusal or a dead network.
let lastFailure = null;
export function chainFailureText() {
  if (lastFailure?.status === 429) return 'throttled (429)';
  if (lastFailure?.status) return `refused (${lastFailure.status})`;
  return typeof navigator !== 'undefined' && navigator.onLine === false ? 'offline' : 'unreachable';
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function esploraJson(mirror, path) {
  for (let attempt = 0; ; attempt++) {
    let delay = 400 * 2 ** attempt + Math.random() * 200;
    try {
      const res = await fetch(mirror + path);
      if (res.ok) { lastFailure = null; return await res.json(); }
      lastFailure = { status: res.status };
      if (res.status < 500 && res.status !== 429) return null;
      const ra = Number(res.headers.get('Retry-After'));
      if (res.status === 429 && ra > 0) delay = Math.min(ra * 1000, 5000);
    } catch { lastFailure = { network: true }; /* unreachable or CORS-refused */ }
    if (attempt >= 2) return null;
    await sleep(delay);
  }
}

// One page of an address's confirmed history, newest first: 25 transactions
// with their full inputs and outputs. The cursor is the last transaction
// already walked -- esplora resumes strictly after it, a bookmark into
// closed history that no new arrival can shift (and one that means the same
// thing on every mirror, so a resumed walk is free to switch).
const ESPLORA_PAGE = 25;
const chainPage = async (member, lastSeen) => {
  const base = await memberPath(member);
  return base ? `${base}/txs/chain${lastSeen ? `/${lastSeen}` : ''}` : null;
};

// An esplora transaction's touches on the member: what its outputs paid
// in (credit) and its inputs drew out (debit), kept apart -- a ledger does
// not net within a transaction, let alone within a block. One record per
// transaction; the entries derive from it. Unconfirmed transactions are
// left out -- the map holds mined history only. An address matches by the
// name esplora prints beside a standard output; a script member matches the
// scriptPubKey bytes themselves, which every output carries.
function esploraTouches(txs, member) {
  const byScript = !isAddress(member);
  const paysMember = (o) => (byScript ? o?.scriptpubkey === member : o?.scriptpubkey_address === member);
  const recs = [];
  for (const t of txs || []) {
    if (!t.status?.confirmed || !(t.status.block_height > 0)) continue;
    let credit = 0, debit = 0, out = null;
    (t.vout || []).forEach((o, i) => {
      if (paysMember(o)) {
        credit += Number(o.value || 0);
        if (out === null) out = i;   // the first paying output: the citation's .index
      }
    });
    for (const i of t.vin || []) if (paysMember(i.prevout)) debit += Number(i.value || 0);
    recs.push({ height: t.status.block_height, txid: t.txid, time: t.status.block_time || null, credit, debit, out });
  }
  return recs;
}

// ─── the chain's own copy of a member's script ───────────────────────────
//
// addressScriptHex derives a scriptPubKey from an address by decoding it. That
// is arithmetic, and arithmetic can be wrong in the same way twice -- a book
// that derived a script and then printed its own derivation would be checking
// nothing. So a page that means to SHOW a script asks the chain for an output
// that really carries it, and compares.
//
// One page of history, which is one request: esplora returns the newest 25
// confirmed transactions, and the oldest on that page is the earliest
// reference this cheaply reaches. When the page holds fewer than a full 25 it
// holds the member's whole confirmed history, and that oldest record is the
// FIRST reference outright -- `whole` says which case this is, because "the
// first time the chain wrote this script" and "some time the chain wrote it"
// are different claims and only one of them is usually true. Walking back to
// the true first on a busy member is the Ledger's work, not a search box's.
//
// The bytes come off an output paying the member, or off a spent prevout where
// the page's oldest transaction only drew from it -- esplora carries the
// scriptPubKey on both, and both are the chain's own copy.
// One page of esplora's newest-first history -> what that page says about the
// member's locking script. Pure, so the reading that matters is testable
// without a network.
//
// An address is a name for exactly one scriptPubKey, so this is not a sample:
// EVERY output paying the member on the page must carry the same bytes, and so
// must every prevout its spends consumed. The page is already fetched, so
// checking all of them costs nothing and catches what one sample cannot -- a
// single anomalous output among many. `scripts` is what was actually found,
// deduped; more than one entry means the chain does not agree with itself,
// which should be impossible and is therefore worth saying out loud.
//
// A transaction returned by an address query need not pay the member at all:
// a spend-only record touches it through the prevout it consumes, and on a
// busy address those are the majority. Their prevout carries the same script,
// so they count as references like any other -- and `earliest` falls back to
// one when the page's oldest record only drew from the member.
// What a spending input actually brought, as a list of pushed values in the
// order the spender wrote them. Segwit carries them as a witness stack and
// legacy as a scriptSig, which is a script whose every token is a push -- two
// spellings of one thing, and the term above them does not care which.
//
// Taproot's annex, if there is one, is dropped: it rides last, is flagged by a
// leading 0x50, is never an argument to the script, and BIP341 excludes it from
// the count that decides key path from script path. Keeping it would make a
// key-path spend look like a script-path one.
export function suppliedBy(vin) {
  const witness = Array.isArray(vin?.witness) ? vin.witness.map((w) => String(w).toLowerCase()) : [];
  if (witness.length) {
    const last = witness[witness.length - 1];
    return witness.length >= 2 && last.startsWith('50') ? witness.slice(0, -1) : witness;
  }
  const sig = String(vin?.scriptsig || '').toLowerCase();
  if (!sig) return [];
  try {
    const toks = tokenizeScript(sig);
    // A scriptSig that is not pushes end to end is not a list of arguments, and
    // saying what it brought would mean guessing which tokens were which.
    if (!toks.length || toks.some((tk) => tk.push === undefined)) return [];
    return toks.map((tk) => tk.push.toLowerCase());
  } catch { return []; }
}

// An input's citation mark, as { n, sig }: its 1-based number, and whether what
// it brought rode in a scriptSig rather than a witness. The number is the
// input's own position -- not an ordinal over some subset of the inputs -- so
// it needs no counting and cannot shift because a neighbour changed carriage.
// The case built from `sig` is what tells the two apart on the page.
export function inputMarkOf(vins, index) {
  const v = Array.isArray(vins) ? vins[index] : null;
  if (!v) return null;
  return { n: index + 1, sig: !(Array.isArray(v.witness) && v.witness.length > 0) };
}

export function readWitness(page, member) {
  const whole = page.length < ESPLORA_PAGE;
  const confirmed = page.filter((t) => t?.status?.confirmed && t.status.block_height > 0);
  const byScript = !isAddress(member);
  const pays = (o) => (byScript ? o?.scriptpubkey === member : o?.scriptpubkey_address === member);
  const scripts = new Set();
  let outputs = 0, prevouts = 0, earliest = null;
  // …and the first time anyone opened it, which is a different question and
  // has a different answer. A lock is bytes the chain can be asked for; the
  // arguments that satisfy it are not derivable from those bytes at all, so
  // the only way to know them is that somebody supplied them. This is where.
  let opened = null;
  // Newest first, so walking backwards reaches the oldest record last and the
  // earliest reference is whatever it leaves behind.
  for (let i = confirmed.length - 1; i >= 0; i--) {
    const t = confirmed[i];
    const at = (t.vout || []).findIndex(pays);
    (t.vout || []).forEach((o) => { if (pays(o)) { outputs++; scripts.add(String(o.scriptpubkey || '').toLowerCase()); } });
    (t.vin || []).forEach((v, n) => {
      if (!pays(v.prevout)) return;
      prevouts++;
      scripts.add(String(v.prevout.scriptpubkey || '').toLowerCase());
      // The walk runs oldest to newest, so the first one seen is the first
      // spend -- set once, exactly as the earliest reference above is.
      opened ??= { txid: t.txid, height: t.status.block_height, in: n,
        mark: inputMarkOf(t.vin, n), items: suppliedBy(v) };
    });
    if (earliest === null && (at >= 0 || (t.vin || []).some((v) => pays(v.prevout)))) {
      const spent = (t.vin || []).find((v) => pays(v.prevout));
      earliest = {
        script: String((at >= 0 ? t.vout[at] : spent.prevout).scriptpubkey || '').toLowerCase(),
        txid: t.txid, height: t.status.block_height, out: at >= 0 ? at : null,
      };
    }
  }
  if (!earliest) return { found: false, whole, outputs: 0, prevouts: 0, scripts: [], opened: null };
  return { found: true, whole, ...earliest, outputs, prevouts, scripts: [...scripts], opened };
}

export async function chainWitness(member) {
  const pagePath = await chainPage(member);
  if (!pagePath) return null;
  for (const mirror of esploraMirrors()) {
    const page = await esploraJson(mirror, pagePath);
    if (Array.isArray(page)) return readWitness(page, member);
  }
  return null;   // every mirror refused; chainFailureText() says how
}

// Our normal form against the chain's copy. Pure, so the reading is testable
// without a network: null witness means nobody could be asked, which is not
// the same as an answer, and must never read as agreement.
export function witnessVerdict(ours, witness) {
  if (!witness) return 'unreachable';
  if (!witness.found) return 'absent';
  const mine = String(ours || '').toLowerCase();
  // Every reference on the page, not just the one cited: agreement means the
  // chain wrote these bytes everywhere it named this member, and one odd
  // output among fifty is exactly the thing a single sample would miss.
  return witness.scripts.length === 1 && witness.scripts[0] === mine ? 'agrees' : 'differs';
}

// The reference on the page that disagrees, for a page that does.
export const witnessDisagreement = (ours, witness) =>
  (witness?.scripts ?? []).find((s) => s !== String(ours || '').toLowerCase()) ?? null;

// The member's chain state -- confirmed balance and transaction count --
// straight from its stats endpoint, no memory: the mapper reconciles
// against the chain's now, not a remembered figure.
async function chainState(member) {
  const path = await memberPath(member);
  if (!path) return null;
  for (const mirror of esploraMirrors()) {
    const j = await esploraJson(mirror, path);
    const c = j?.chain_stats;
    if (c && typeof c.tx_count === 'number') {
      return { balance: Number(c.funded_txo_sum) - Number(c.spent_txo_sum), txCount: c.tx_count };
    }
  }
  return null;
}

// Records -> ledger entries, ascending. Each entry is one *side* of one
// transaction: its outputs to the address (a credit, positive) or its inputs
// from it (a debit, negative) -- never a block's net: blocks hold many
// transactions, and an entry references what moved, not where it stood. A
// transaction that both receives and spends makes two entries, credit
// listed first; one that names the address without moving value posts a
// bare 0, so the map stays as complete as the count it reconciles against.
function buildEntries(records) {
  const entries = [];
  for (const r of records) {
    // A credit entry carries its output index -- the .index of a full
    // citation (§section.output) and the book's landing for it. Debits are
    // departures through inputs; their citation stops at the section.
    if (r.credit > 0) entries.push({ height: r.height, txid: r.txid, time: r.time, sats: r.credit, ...(r.out != null ? { out: r.out } : {}) });
    if (r.debit > 0) entries.push({ height: r.height, txid: r.txid, time: r.time, sats: -r.debit });
    if (!r.credit && !r.debit) entries.push({ height: r.height, txid: r.txid, time: r.time, sats: 0 });
  }
  return entries.sort((a, b) =>
    a.height - b.height || (a.txid < b.txid ? -1 : a.txid > b.txid ? 1 : b.sats - a.sats));
}


// --- The store: maps live in IndexedDB (a complete map of a busy address
// runs to megabytes -- past localStorage's means), with a small localStorage
// registry of last-use times so pruning never has to read the maps
// themselves. Bounded to the most recently used addresses so ad-hoc queries
// can't grow the store without end.

// Ask the browser to treat this origin's storage as persistent -- installed
// apps are usually granted it silently -- so what is kept here survives
// storage pressure instead of standing in the "best effort" eviction line.
try { navigator.storage?.persist?.().catch(() => { /* denied: merely evictable */ }); } catch (_) { /* unavailable */ }
const DB_NAME = 'glossia-btc-index';
const DB_STORE = 'lines';
const REGISTRY_KEY = 'glossia-btc-index-registry';
// The bank keeps the most recently read members and prunes the rest. Its
// floor is the largest shelved ledger's membership, because a ledger is
// read as ONE account: a cap below it could never let one be read whole --
// gathering the 221st Coldcard vault would evict the first, and the merge
// would shrink as the reader scrolled. Headroom above that for the
// passages a reader visits either side of whatever they are reading.
const STORE_MAX_ADDRESSES = Math.max(64, ...INDEXED.map((e) => e.addresses.length)) + 32;
// The pre-anthology localStorage cache is superseded; clear it once.
try { localStorage.removeItem('glossia-btc-index-cache'); } catch (_) { /* unavailable */ }

let dbPromise = null;
function db() {
  if (!dbPromise) dbPromise = new Promise((resolve) => {
    try {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(DB_STORE);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch { resolve(null); }
  });
  return dbPromise;
}
async function idb(mode, op) {
  const d = await db();
  if (!d) return null;
  return new Promise((resolve) => {
    try {
      const tx = d.transaction(DB_STORE, mode);
      const req = op(tx.objectStore(DB_STORE));
      // A get()'s value rides on the request; a put/delete has none to give.
      // A missing record resolves null, never a truthy sentinel -- callers
      // distinguish "no stored map" from a map by truthiness.
      tx.oncomplete = () => resolve(req ? req.result ?? null : null);
      tx.onerror = () => resolve(null);
    } catch { resolve(null); }
  });
}
const readRegistry = () => {
  try { const v = JSON.parse(localStorage.getItem(REGISTRY_KEY)); return v && typeof v === 'object' ? v : {}; }
  catch { return {}; }
};

// The stored map for an address, if any -- render it instantly, then let
// resolveLine confirm or extend it. Lines are versioned: v2 moved per-block
// chapters to per-side entries; v3 moved the backfill cursor from a
// blockbook height (`low`) to an esplora txid (`lastSeen`). A complete v2
// line carries no cursor and its entries are identical in shape, so it
// upgrades in place -- nothing already synced refetches. An incomplete v2
// checkpoint belongs to the old walk and reads as absent; the next
// resolution maps afresh, newest first.
const LINE_V = 3;
export async function cachedLine(address) {
  const line = await idb('readonly', (s) => s.get(address));
  if (!line) return null;
  if (line.v === LINE_V) return line;
  if (line.v === 2 && line.complete) return { ...line, v: LINE_V };
  return null;
}
async function saveLine(address, data) {
  await idb('readwrite', (s) => s.put(data, address));
  const reg = readRegistry();
  reg[address] = data.at;
  const keep = Object.entries(reg).sort((a, b) => b[1] - a[1]);
  for (const [addr] of keep.slice(STORE_MAX_ADDRESSES)) {
    await idb('readwrite', (s) => s.delete(addr));
  }
  try { localStorage.setItem(REGISTRY_KEY, JSON.stringify(Object.fromEntries(keep.slice(0, STORE_MAX_ADDRESSES)))); }
  catch (_) { /* unavailable; the store just prunes less precisely */ }
}

// --- Resolution: aim for the complete map, keep it current for pennies.

// A cached line -- complete or thumbed-partway -- tops up from the tip: new
// appearances can only lie in blocks above the highest banked one, so the
// walk reads newest pages until it steps below that frontier. The address
// totals are checked first, making the common case -- nothing new -- one
// small request; and the delta is all pages or nothing, since a delta with
// a hole would corrupt the map. Heights above the frontier are disjoint
// from what's banked by construction, so merging is concatenation, and the
// line's completeness (and its backfill cursor) ride through untouched.
// Unreachable mirrors leave the stored line standing, current as of its
// writing.
async function topUp(address, cached, onProgress) {
  const frontier = (cached.entries[cached.entries.length - 1]?.height ?? 0) + 1;
  const statsPath = await memberPath(address);
  if (!statsPath) return cached;
  outer: for (const mirror of esploraMirrors()) {
    const j = await esploraJson(mirror, statsPath);
    const cs = j?.chain_stats;
    if (!cs || typeof cs.tx_count !== 'number') continue;
    const txCount = cs.tx_count;
    const balance = Number(cs.funded_txo_sum) - Number(cs.spent_txo_sum);
    if (txCount === cached.txCount && balance === cached.balance) return cached;
    let cursor = null;
    const fresh = [];
    for (;;) {
      const page = await esploraJson(mirror, await chainPage(address, cursor));
      if (!Array.isArray(page)) continue outer;
      const recs = esploraTouches(page, address);
      fresh.push(...recs.filter((r) => r.height >= frontier));
      try { onProgress?.(cached.walked + fresh.length, txCount); } catch (_) { /* a watcher's error is not the map's */ }
      if (page.length < ESPLORA_PAGE || recs.some((r) => r.height < frontier)) break;
      cursor = page[page.length - 1].txid;
    }
    const entries = cached.entries.concat(buildEntries(fresh));
    const data = { v: LINE_V, at: Date.now(), txCount, balance, walked: cached.walked + fresh.length, complete: !!cached.complete, entries };
    if (!data.complete) data.lastSeen = cached.lastSeen;
    await saveLine(address, data);
    return data;
  }
  return cached;
}

// One page deeper into the past: the next 25 confirmed transactions after
// the banked cursor (the last txid already walked -- closed history, so
// the pagination never shifts, and the cursor means the same thing on
// every mirror), banked and returned. This is the whole backfill now:
// nothing walks the history on its own -- the reader thumbing down the
// ledger's pages is what reaches deeper, one prefetched page at a time,
// and every page found is kept. The final short page marks the line
// complete: the record read to its beginning.
async function extendOnce(address) {
  const cached = await cachedLine(address);
  if (!cached || cached.complete || cached.lastSeen == null) return cached;
  for (const mirror of esploraMirrors()) {
    const page = await esploraJson(mirror, await chainPage(address, cached.lastSeen));
    if (!Array.isArray(page)) continue;
    const recs = esploraTouches(page, address);
    const walked = cached.walked + recs.length;
    // A short page ends the record -- and so does the count: every known
    // transaction walked means nothing older remains, sparing the empty
    // probe a record sized an exact multiple of the page would otherwise
    // cost. (Arrivals since the count was taken land above the head; the
    // next visit's top-up carries them.)
    const complete = page.length < ESPLORA_PAGE || (cached.txCount > 0 && walked >= cached.txCount);
    const data = { v: LINE_V, at: Date.now(), txCount: cached.txCount, balance: cached.balance,
                   walked, complete, entries: buildEntries(recs).concat(cached.entries) };
    if (!complete) data.lastSeen = page[page.length - 1].txid;
    await saveLine(address, data);
    return data;
  }
  return cached;   // unreachable: the line stands as it was
}
// Single-flight per address: a reader's scroll and the fetch-ahead may ask
// together, and both must share one page rather than fetch it twice.
const extending = new Map();
export function extendLine(address) {
  if (!extending.has(address)) {
    extending.set(address, extendOnce(address).finally(() => extending.delete(address)));
  }
  return extending.get(address);
}

// Resolve an address's head: the stored line -- however deep the reader has
// thumbed it -- refreshed from the tip (new arrivals land above the banked
// frontier), or, with nothing stored, the first page of its history: the
// latest 25 transactions and the address totals. No backfill runs on its
// own; deeper pages arrive only as the reader thumbs down (extendLine).
// Returns the stored state unchanged when the mirrors are unreachable
// (offline reads still work), null when there's nothing at all to show.
// `onProgress(gathered, total)` ticks when the head lands.
export async function resolveLine(address, onProgress) {
  const cached = await cachedLine(address);
  if (cached) return topUp(address, cached, onProgress);
  const statsPath = await memberPath(address);
  if (!statsPath) return null;
  for (const mirror of esploraMirrors()) {
    const j = await esploraJson(mirror, statsPath);
    const cs = j?.chain_stats;
    if (!cs || typeof cs.tx_count !== 'number') continue;
    const page = await esploraJson(mirror, await chainPage(address, null));
    if (!Array.isArray(page)) continue;
    const recs = esploraTouches(page, address);
    // Short page or every known transaction walked: the record is whole.
    const complete = page.length < ESPLORA_PAGE || (cs.tx_count > 0 && recs.length >= cs.tx_count);
    const data = { v: LINE_V, at: Date.now(), txCount: cs.tx_count,
                   balance: Number(cs.funded_txo_sum) - Number(cs.spent_txo_sum),
                   walked: recs.length, complete, entries: buildEntries(recs) };
    if (!complete) data.lastSeen = page[page.length - 1].txid;
    await saveLine(address, data);
    try { onProgress?.(data.walked, data.txCount); } catch (_) { /* a watcher's error is not the map's */ }
    return data;
  }
  return null;
}

// The lightest possible ask: the address's chain state -- balance and
// confirmed transaction count -- one small request, no transaction pages.
// The shelf shows balances with this alone, starting nobody's sync; the
// mapping begins only when a reader steps into the ledger itself.
//
// The balance memory: a probe's answer is good for ten minutes -- balances
// move at chain speed, roughly a block, not at page-load speed -- so a
// shelf revisited within that window asks the network nothing. And the
// last answer is never thrown away: when every source fails, the state
// comes back marked `stale: true` -- last known, shown quietly -- rather
// than nothing at all. Kept in localStorage (a few dozen bytes per
// address), pruned oldest-first past a generous cap.
const BALANCE_KEY = 'glossia-btc-balances';
const BALANCE_TTL = 10 * 60 * 1000;
const BALANCE_MAX = 48;
const balanceCache = () => {
  try { const v = JSON.parse(localStorage.getItem(BALANCE_KEY)); return v && typeof v === 'object' ? v : {}; }
  catch { return {}; }
};
function keepBalance(address, state) {
  try {
    const all = balanceCache();
    all[address] = { balance: state.balance, txCount: state.txCount, at: Date.now() };
    const keys = Object.keys(all);
    if (keys.length > BALANCE_MAX) {
      keys.sort((a, b) => all[a].at - all[b].at);
      for (const k of keys.slice(0, keys.length - BALANCE_MAX)) delete all[k];
    }
    localStorage.setItem(BALANCE_KEY, JSON.stringify(all));
  } catch (_) { /* full or unavailable; the next probe asks again */ }
}
// The remembered state without any network: fresh within the window,
// `stale: true` past it, null if this address was never answered.
export function lastKnownState(address) {
  const e = balanceCache()[address];
  if (!e || typeof e.balance !== 'number') return null;
  return Date.now() - e.at < BALANCE_TTL
    ? { balance: e.balance, txCount: e.txCount }
    : { balance: e.balance, txCount: e.txCount, stale: true };
}

export async function addressState(address) {
  const known = lastKnownState(address);
  if (known && !known.stale) return known;
  const state = await chainState(address);
  if (state) { keepBalance(address, state); return state; }
  return known;   // every source failed: the last answer, marked stale -- or null
}

// The held view: the address's confirmed UTXOs -- the chain's own bookmarks,
// each unspent output resting where its transaction left it. This is the
// mutable complement of the map: spends shrink it, so it is a snapshot,
// fetched fresh beside every resolution and never stored. Returns the sum,
// the coin count, and sats-still-resting by txid (a UTXO belongs to a
// transaction's outputs, so the join to credit entries is exact), or null
// when the mirrors can't be had. Its sum is the third reconciliation
// identity (Σ held = balance = Σ entries); callers display the held view
// only when it agrees, the same discipline the gate keeps.
export async function heldCoins(address) {
  const base = await memberPath(address);
  if (!base) return null;
  for (const mirror of esploraMirrors()) {
    const utxos = await esploraJson(mirror, `${base}/utxo`);
    if (!Array.isArray(utxos)) continue;
    const byTxid = new Map();
    let sum = 0, count = 0;
    for (const u of utxos) {
      if (!u.status?.confirmed) continue;   // the held view is mined history only
      const sats = Number(u.value || 0);
      sum += sats;
      count++;
      byTxid.set(u.txid, (byTxid.get(u.txid) ?? 0) + sats);
    }
    return { sum, count, byTxid };
  }
  return null;
}

// --- The ledger's periods: entries bucketed by the calendar quarter of
// their block time -- the organization accountants keep, years then
// quarters, in place of the manuscript's own volumes and books (every entry
// still cites its canonical place in those; the citation is the folio
// reference, the period is just the filing). Buckets are keyed rather than
// run-length: block timestamps may wobble a couple of hours against height
// order near a boundary, and a keyed bucket absorbs the straggler instead
// of splitting the quarter in two. Only a complete map gets periods (the
// gate's rule); a closed quarter is as append-only as the chain that
// timestamps it.
export function periods(data) {
  if (!data?.complete || !data.entries.length) return null;
  const byKey = new Map();
  for (const c of data.entries) {
    const d = new Date((c.time ?? 0) * 1000);
    const year = d.getUTCFullYear();
    const q = Math.floor(d.getUTCMonth() / 3) + 1;
    const key = year * 10 + q;
    let b = byKey.get(key);
    if (!b) { b = { year, q, entries: [], sats: 0 }; byKey.set(key, b); }
    b.entries.push(c);
    b.sats += c.sats;
  }
  const quarters = [...byKey.values()].sort((a, b) => a.year - b.year || a.q - b.q);
  const years = [];
  for (const qt of quarters) {
    let y = years[years.length - 1];
    if (!y || y.year !== qt.year) { y = { year: qt.year, quarters: [], sats: 0, count: 0 }; years.push(y); }
    y.quarters.push(qt);
    y.sats += qt.sats;
    y.count += qt.entries.length;
  }
  return years;
}

// --- Renderers. The pages that call these share the idx-*/sp-* styles the
// class names refer to; DOM-building lives here rather than in each page so
// the index and the anthologies stay the same reading.

// The account, drawn newest-down (the direction the record is explored)
// in TIME's own grouping: a year's heading where the year turns, a
// quarter's beneath it, and the entries under that -- the organization
// accountants keep, in place of the manuscript's own volumes and books.
// Every row still cites its canonical place itself, so the two can never
// disagree: the period is the filing, the citation the folio. Buckets are
// read off each row's own block time, so a straggler near a boundary
// simply files where its timestamp says.
//
// Among them hang the reader's own bookmarks, each flying the ribbon it
// flies in the contents: a passage kept, standing at its height between
// the entries that bracket it. They are the reader's marks ON the record,
// not entries OF it, so they carry a title and a reference and no money at
// all -- and none of the account's arithmetic touches them.
//
// APPENDED to el, so an endless scroll just keeps appending -- which is
// why the grouping is CARRIED in `state` (groupState) rather than
// recomputed: a chunk knows which heading the chunk before it left open,
// and the scroll never redraws what it has already set. `held` feeds the
// status column from the chain's own bookmarks. The callers own any
// clearing and any notes around the run.
const BOOKMARK_RIBBON = '<svg viewBox="0 0 12 16"><path fill="currentColor" d="M0 0h12v16l-6-4-6 4z"/></svg>';
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_FULL = ['January', 'February', 'March', 'April', 'May', 'June',
                     'July', 'August', 'September', 'October', 'November', 'December'];
export const groupState = () => ({ year: null, q: null, mo: null, day: null });
export function renderRows(el, entries, held = null, { state = null, marks = null } = {}) {
  for (const c of [...entries].reverse()) {
    if (state) {
      const d = c.time ? new Date(c.time * 1000) : null;
      if (d) {
        const year = d.getUTCFullYear();
        const q = Math.floor(d.getUTCMonth() / 3) + 1;
        const mo = d.getUTCMonth();
        const day = d.getUTCDate();
        // Each level opens the ones beneath it afresh: turning a quarter
        // turns its month and day too, so a heading can never be left
        // standing over entries from the period before it.
        if (year !== state.year) {
          el.append(lineHead('idx-vol', String(year)));
          state.year = year; state.q = null; state.mo = null; state.day = null;
        }
        if (q !== state.q) {
          el.append(lineHead('idx-book', `Q${q} ${year}`));
          state.q = q; state.mo = null; state.day = null;
        }
        // Inside the quarter, the grain a reading needs when a whole story
        // lands in one of them -- a theft's three days would otherwise file
        // as a single undifferentiated Q.
        if (mo !== state.mo) {
          el.append(lineHead('idx-month', MONTHS_FULL[mo]));
          state.mo = mo; state.day = null;
        }
        if (day !== state.day) {
          el.append(lineHead('idx-day', `${MONTHS[mo]} ${day}`));
          state.day = day;
        }
      }
    }
    el.append(lineRow({ ...c, place: volumeBookChapter(c.height) }, held, marks));
  }
}

// The reader's marks, indexed for the account to wear. A ledger's table is
// its OWN transactions and nothing else, so a mark never stands as a row of
// its own here: it is a label the row it belongs to puts on, or it does not
// appear. Two ways a mark names one of these transactions --
//   by txid, when the mark was kept on a transaction id (its hex IS the
//     txid), which is exact and known at once; and
//   by place (height + section), which is how every other mark on a
//     transaction is stored -- an output's, a witness's -- and which the
//     row can only check once the archive knows its own section.
// A mark on a CHAPTER (pos null, the block hash) names no transaction, so
// it never labels a row: sharing a block with this ledger's entry is not
// pertaining to it, which is the whole bug this replaces.
export function markIndex(bookmarks) {
  const byTxid = new Map(), byPlace = new Map();
  for (const b of bookmarks) {
    if (b.pos == null) continue;                       // a chapter, not a transaction
    byPlace.set(`${b.height}:${b.pos}`, b);
    if (/^[0-9a-f]{64}$/.test(b.hex ?? '')) byTxid.set(b.hex, b);
  }
  return { byTxid, byPlace };
}



// One amount cell, in the reader's chosen notation and in that alone: a
// record notation prints at once, the reader's own unit prints at once at
// their rate, and a USD figure waits for its row's day price -- so a
// column reads in one unit, never in two at a time. The cell keeps the
// amount UNSIGNED: on the account rows the column it stands in (debit or
// credit) is the sign. Where a valuation cannot be had -- an entry with no
// day, or a source that has no price for it -- the cell falls back to the
// record's own ₿, which is the one figure always true.
export function fillAmountCell(cell, sats, time) {
  const u = amountUnit();
  if (u === 'own') {
    const o = ownUnit();
    if (o) {
      cell.textContent = formatValuation(sats, o);
      cell.title = `at your rate of ${o.perBtc.toLocaleString('en-US')} ${o.label} per ₿ — your valuation, not the record`;
      return;
    }
  } else if (u === 'usd' && time) {
    cell.textContent = '⋯';
    cell.dataset.time = String(time);
    cell.dataset.sats = String(sats);
    observeValuation(cell);
    return;
  }
  cell.textContent = formatBalanceBtc(sats);
}

// The valuation cells' lazy filler: one IntersectionObserver over every
// pending cell, asking btc-price.js (cached by source and day) only as a
// row approaches the viewport. A day with no answer -- before the source's
// record begins, or the source unreachable -- falls back to the record's ₿,
// never to a guessed figure.
let valObserver = null;
function observeValuation(cell) {
  if (!valObserver) {
    if (typeof IntersectionObserver === 'undefined') return;
    valObserver = new IntersectionObserver((hits) => {
      for (const h of hits) {
        if (!h.isIntersecting) continue;
        valObserver.unobserve(h.target);
        fillValuation(h.target);
      }
    }, { rootMargin: '300px' });
  }
  valObserver.observe(cell);
}
async function fillValuation(cell) {
  const sats = Number(cell.dataset.sats);
  const p = await usdOn(Number(cell.dataset.time));
  if (!p) {
    cell.textContent = formatBalanceBtc(sats);
    cell.title = 'no price for this day — before the source’s record begins, or the source unreachable; the record’s own figure stands instead';
    return;
  }
  cell.textContent = formatValuation(sats, { label: 'USD', perBtc: p.perBtc });
  cell.title = `at ${p.perBtc.toLocaleString('en-US')} USD per ₿ on ${p.date}, per ${p.source} — the day of this entry; a market's valuation, not the record`;
}

// The section of a transaction within its chapter -- the § of a full
// citation -- read from the archive ALONE, never fetched: the book
// archives every placement it resolves (and the contents page its own),
// so sections fill in as the reader actually visits the cited paragraphs.
// The record makes no lookups of its own -- a thousand rows cost nothing
// -- and an unknown section simply waits to be read.
export async function sectionOf(txid) {
  const kept = await storeGet('citations', txid) ?? await storeGet('placements', txid);
  return kept && Number.isInteger(kept.pos) ? kept.pos : null;
}

// A transaction's placement -- height and section -- from the archive when
// it knows (the book's citations store first, which also carries the
// referenced outputs; the placements store second), and otherwise from one
// merkle proof -- the same request the book resolves citations with --
// banked into placements ({height, pos}) so it is fetched at most once,
// ever. This is what completes a passage's citation (§section), and what
// resolves a reproduced section's margin citations, without walking
// anything: a proof names the position directly.
// Single-flight per txid (the book's citationCache discipline): a section
// whose inputs spend several outputs of one transaction, or a neighbour
// warming racing the leaf's own resolvers, must share one proof fetch --
// not race duplicates before the placement banks. Settled entries clear,
// so a failed resolution (mirrors unreachable) is asked again next time
// while a success answers from the archive forever.
const citePlaceInflight = new Map();
export function citePlace(txid) {
  if (!citePlaceInflight.has(txid)) {
    citePlaceInflight.set(txid, (async () => {
      const kept = await storeGet('citations', txid) ?? await storeGet('placements', txid);
      if (kept && Number.isInteger(kept.pos) && Number.isInteger(kept.height)) return kept;
      for (const mirror of esploraMirrors()) {
        const mp = await esploraJson(mirror, `/tx/${txid}/merkle-proof`);
        if (mp && Number.isInteger(mp.pos)) {
          const rec = { height: mp.block_height, pos: mp.pos };
          storePut('placements', txid, rec);
          return rec;
        }
      }
      return null;
    })().finally(() => citePlaceInflight.delete(txid)));
  }
  return citePlaceInflight.get(txid);
}
export const sectionOfFetched = async (txid) => (await citePlace(txid))?.pos ?? null;

// Esplora's plain-text answers (block hash by height, txid by position).
async function esploraText(mirror, path) {
  try {
    const r = await fetch(mirror + path);
    return r.ok ? (await r.text()).trim() : null;
  } catch { return null; }
}

// A citation, inverted: height + section -> the txid that sits there,
// straight from the chain (block hash by height, then the block's txid at
// that index) -- two small requests, no history walked. This is how a
// shared passage reference (v…b…c…s…) lands without carrying any txid.
export async function passageTxid(height, pos) {
  for (const mirror of esploraMirrors()) {
    const hash = await esploraText(mirror, `/block-height/${height}`);
    if (!hash || !/^[0-9a-f]{64}$/.test(hash)) continue;
    const txid = await esploraText(mirror, `/block/${hash}/txid/${pos}`);
    if (txid && /^[0-9a-f]{64}$/.test(txid)) return txid;
  }
  return null;
}

// A chapter's own particulars by height: the block hash, the merkle root its
// header commits to, when it was mined, and how many sections it holds. Two
// small requests, like passageTxid's -- hash by height, then the block. Read
// by anything that has a claim about a block to check rather than a passage
// to render: an OpenTimestamps proof's root is confirmed here.
export async function blockAt(height) {
  for (const mirror of esploraMirrors()) {
    const hash = await esploraText(mirror, `/block-height/${height}`);
    if (!hash || !/^[0-9a-f]{64}$/.test(hash)) continue;
    const b = await esploraJson(mirror, `/block/${hash}`);
    if (b && typeof b.merkle_root === 'string') {
      return { hash, merkleRoot: b.merkle_root, timestamp: b.timestamp ?? null, txCount: b.tx_count ?? null };
    }
  }
  return null;
}

// One transaction's touches on an address, shaped as ledger entries -- for
// rendering a passage that the banked record hasn't reached yet. The bank
// is untouched: a passage viewed this way banks nothing until the record's
// own walk arrives at it.
export async function passageEntries(address, txid) {
  for (const mirror of esploraMirrors()) {
    const tx = await esploraJson(mirror, `/tx/${txid}`);
    if (tx && tx.txid === txid) return buildEntries(esploraTouches([tx], address));
  }
  return null;
}

// A transaction's raw hex, from the same archive the book keeps ('tx' --
// immutable, the txid is its hash), fetched once on a miss and banked: a
// passage read in the ledger warms the book's cache, and vice versa.
export async function txHexOf(txid) {
  const kept = await storeGet('tx', txid);
  if (kept) return kept;
  for (const mirror of esploraMirrors()) {
    try {
      const r = await fetch(`${mirror}/tx/${txid}/hex`);
      if (!r.ok) continue;
      const hex = (await r.text()).trim();
      if (!/^[0-9a-f]+$/i.test(hex)) continue;
      storePut('tx', txid, hex);
      return hex;
    } catch { continue; }
  }
  return null;
}

// Every input's spent amount in one request sized by the transaction
// itself: Esplora has no endpoint for a single referenced output's value
// (/outspend/:vout carries spend status only), but a transaction's own
// JSON (/tx/:txid) lists each input's prevout -- value included -- so a
// section's margin amounts never require fetching the referenced
// transactions, however enormous (an exchange batch withdrawal) those
// are. Confirmed prevouts are immutable; memoized for the session, with
// the book's citations archive still answering first upstream.
const prevoutsMemo = new Map();
export function prevoutValuesOf(txid) {
  if (!prevoutsMemo.has(txid)) {
    prevoutsMemo.set(txid, (async () => {
      for (const mirror of esploraMirrors()) {
        const j = await esploraJson(mirror, `/tx/${txid}`);
        if (j && j.txid === txid && Array.isArray(j.vin)) {
          return j.vin.map((v) => (v.prevout && v.prevout.value != null ? Number(v.prevout.value) : null));
        }
      }
      prevoutsMemo.delete(txid);   // nothing answered -- ask again next time
      return null;
    })());
  }
  return prevoutsMemo.get(txid);
}

// The spending status of every output of a transaction at once (Esplora
// /outspends) -- what fills a reproduced section's forward citations, the
// same call the book makes. Chain-mutable (an unspent output spends later),
// so it is memoized for the session only, never banked; null when no mirror
// answers, and a missing forward reference is absence, not an error.
const outspendsMemo = new Map();
export function outspendsOf(txid) {
  if (!outspendsMemo.has(txid)) {
    outspendsMemo.set(txid, (async () => {
      for (const mirror of esploraMirrors()) {
        const spends = await esploraJson(mirror, `/tx/${txid}/outspends`);
        if (Array.isArray(spends)) return spends;
      }
      outspendsMemo.delete(txid);   // nothing answered -- ask again next time
      return null;
    })());
  }
  return outspendsMemo.get(txid);
}

// One record line: the citation whole, then debit, credit, status. An
// entry is one side of one transaction, so exactly one amount column
// carries ink (a zero-value touch posts a bare 0 credit). Status reads
// the chain's own bookmarks: `unspent` while any of a credit's coins
// still rest at the address, `spent` once the value has moved on (a debit
// being a departure by nature); it stays silent while the UTXO snapshot
// hasn't agreed with the chain -- the verdict waits, never guesses.
// (`pending` is reserved for mempool transactions, which the map doesn't
// carry yet.) A zero-value touch carries no coin to have a status.
function lineRow({ txid, sats, place, out, addr, time, height }, held, marks = null) {
  const row = document.createElement('a');
  row.className = 'idx-row acct';
  row.href = citeHref(txid, out);   // a credit lands the book on its output
  // The row names its entry (txid + sats name one side of one transaction)
  // and its home address -- the ledger page's dive reads these to pull in
  // the entry's own leaf.
  row.dataset.txid = txid;
  row.dataset.sats = String(sats);
  if (addr) row.dataset.addr = addr;
  const resting = held && sats > 0 ? held.get(txid) ?? 0 : 0;
  if (held) {
    if (resting > 0) row.title = `still unspent: ${formatBalanceBtc(resting)}`;
    else row.classList.add('spent');
  }
  const r = document.createElement('span'); r.className = 'idx-ref';
  r.textContent = `${toRoman(place.volume)} β${place.book} ■${place.chapter}`;
  // The section joins the citation only once the archive knows it -- a
  // paragraph the reader has visited fills in (§section.output, as the
  // reader's marginalia print it); the rest wait to be read.
  const sec = document.createElement('span');
  r.append(sec);
  // The reader's own mark, worn by the row it belongs to: the ribbon it
  // flies in the contents and the name they kept it under. A mark named by
  // txid is known at once; every other kind is placed by section, so it
  // joins when the archive's answer does -- the same answer the citation
  // above is waiting on, so no lookup is made for it.
  const wear = (bm) => {
    if (!bm || r.querySelector('.idx-bm')) return;
    const tag = document.createElement('span');
    tag.className = 'idx-bm';
    tag.title = `your bookmark — ${bm.title}`;
    const rib = document.createElement('span');
    rib.className = 'toc-bm';
    rib.setAttribute('aria-label', 'your bookmark');
    rib.innerHTML = BOOKMARK_RIBBON;
    tag.append(rib, document.createTextNode(bm.title));
    r.append(tag);
  };
  wear(marks?.byTxid.get(txid));
  sectionOf(txid).then((pos) => {
    if (pos == null) return;
    sec.textContent = ` §${pos + 1}${out != null ? `.${out}` : ''}`;
    wear(marks?.byPlace.get(`${height}:${pos}`));
  });
  // The amount, in the reader's chosen notation and in that alone
  // (fillAmountCell): a valuation replaces the record's figure rather than
  // joining it, so a column never reads in two units at once. Unsigned --
  // the column an amount stands in IS its sign -- and exactly one of the
  // two carries ink.
  const deb = document.createElement('span'); deb.className = 'idx-amt col-deb';
  const cred = document.createElement('span'); cred.className = 'idx-amt col-cred';
  if (sats < 0) fillAmountCell(deb, -sats, time);
  else if (sats > 0) fillAmountCell(cred, sats, time);
  else cred.textContent = formatBalanceBtc(0);
  const st = document.createElement('span'); st.className = 'idx-status col-status';
  if (held && sats !== 0) {
    if (resting > 0) { st.textContent = 'unspent'; st.classList.add('unspent'); }
    else st.textContent = 'spent';
  }
  row.append(r, deb, cred, st);
  return row;
}
function lineHead(cls, label) { const d = document.createElement('div'); d.className = cls; d.textContent = label; return d; }
export function lineNote(el, text) {
  const s = document.createElement('span');
  s.className = 'idx-note';
  s.textContent = text;
  el.append(s);
}
