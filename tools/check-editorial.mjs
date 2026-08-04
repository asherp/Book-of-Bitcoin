// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/check-editorial.mjs — read the editorial layer the way the browser
// will, and fail loudly if it would not read.
//
//   node tools/check-editorial.mjs
//
// The curated contents, its appendix and its commentary are hand-authored files
// with nothing generated from them (web/notables.yaml, web/appendix.yaml,
// web/commentary/*.md), which is what
// makes them pleasant to write and also what makes a typo shippable: a mangled
// line, a renamed file, a reading nothing points at. This is the check that
// stands in for a build step. It parses the index with the same reader the
// pages use and then verifies every claim the index makes about the filesystem.
//
// Exits non-zero on anything that would reach a reader as a missing reading or
// an empty contents. Run it before opening a pull request; the deploy runs it
// too, ahead of everything expensive.

import { readdir, readFile } from 'node:fs/promises';
import { parseNotables, parseAppendix, setNotables, places, placeTitle } from '../web/btc-notables.js';
import { parseYamlSequence } from '../web/btc-yaml.js';
import { parseReference, reference, footnoteMark } from '../web/btc-citation.js';
import { looksLikeAddress } from '../web/btc-lookup.js';
import { INDEXED } from '../web/btc-index-data.js';
import { readingsOf } from '../web/btc-commentary.js';
import { markdownParagraphs } from '../web/btc-markdown.js';
import { readProof, attests, citeOf } from '../web/btc-proofs.js';

const WEB = new URL('../web/', import.meta.url);
const problems = [];
const notes = [];

const source = await readFile(new URL('notables.yaml', WEB), 'utf8');
// The appendix is authored the same way and read by the same machinery: parts
// the contents gathers after the volumes, one of which lists places of its own.
const backSource = await readFile(new URL('appendix.yaml', WEB), 'utf8');
const parts = parseAppendix(backSource);
const entries = setNotables(parseNotables(source), parts);
if (!entries.length) problems.push('notables.yaml parsed to no entries at all');
// An entry may be found in several places; the checks below are per place,
// since a place is what a row, a title and a static passage are made of.
const allPlaces = places();

// An id may be written as a reference ("I β29 ■596 §85") and is resolved to a
// height by arithmetic; show the resolution, so an author can see that the
// citation they wrote points where they think it does.
for (const raw of parseYamlSequence(source)) {
  for (const p of raw.ids ?? [raw]) {
    const ref = parseReference(String(p.id ?? '').trim());
    if (!ref) continue;
    notes.push(`"${raw.title}"${p.as ? ` (${p.as})` : ''}: ${p.id} resolves to block ${ref.height}`
      + (ref.section !== null ? ` §${ref.section}` : ref.index === -2 ? " (its book's leaf)" : ref.index === -3 ? " (its volume's leaf)" : '')
      + (ref.out !== null ? `.${ref.out}` : ''));
  }
}

// Places must be unique: the pages key placements, bookmarks and seeds by id, so
// a duplicate silently shadows one. A height+index pair is what tells two places
// at one height apart — how the twice-confirmed BIP30 coinbases are cited.
const seen = new Map();
for (const e of allPlaces) {
  const name = placeTitle(e);
  const key = `${e.id}#${e.index ?? ''}`;
  if (seen.has(key)) problems.push(`duplicate place: "${name}" repeats the id of "${seen.get(key)}"`);
  seen.set(key, name);
  if (e.address) {
    // An address entry names a ledger, not a place. It needs no shelving here
    // (the Ledger opens any address, curated or not), but a reading kept on an
    // address nobody has shelved will only be met by a reader who goes looking
    // for that address — worth saying, never an error.
    if (!looksLikeAddress(e.address)) problems.push(`"${name}": id "${e.address}" does not look like an address`);
    else if (!INDEXED.some((l) => (l.addresses ?? []).includes(e.address))) {
      notes.push(`"${name}": ${e.address} is not shelved in btc-index-data.js — its reading shows only on an ad-hoc ledger`);
    }
  } else if (e.script) {
    // A script entry names a ledger by the scriptPubKey itself -- the name of
    // an output no address can write. Same standing as an address: a ledger,
    // not a place, met in the Ledger by scripthash lookup.
    if (!/^(?:[0-9a-f]{2})+$/.test(e.script)) problems.push(`"${name}": script "${e.script}" is not whole bytes of lowercase hex`);
    else if (!INDEXED.some((l) => (l.scripts ?? []).includes(e.script))) {
      notes.push(`"${name}": script ${e.script} is not shelved in btc-index-data.js — its reading shows only on an ad-hoc ledger`);
    }
  } else if (!/^-?[0-9]+$/.test(e.id) && !/^[0-9a-f]{64}$/.test(e.id)) {
    problems.push(`"${name}": id "${e.id}" is neither a block height nor a 64-hex id`);
  }
  if (e.page !== undefined && e.page !== 'book' && e.page !== 'volume') {
    problems.push(`"${name}": page: ${e.page} — only "book" and "volume" are understood`);
  }
  if (e.out !== undefined && !(Number.isInteger(e.out) && e.out >= 0)) {
    problems.push(`"${name}": out must be a whole output number, got ${e.out}`);
  }
  if (e.out !== undefined && !(e.index >= 0)) {
    problems.push(`"${name}": out names an output within a section, so it needs a §section reference`);
  }
  if (e.index !== undefined && !Number.isInteger(e.index)) {
    problems.push(`"${name}": index must be a whole number, got ${e.index}`);
  }
}

// Every referenced reading must exist, say something, and carry its licence --
// the contents' and the appendix's alike, a future chapter carrying a reading
// the same way a written one does.
const readingBearers = [
  ...entries,
  ...parts,                                       // a part may carry a reading of what it gathers
  ...parts.filter((p) => p.entries).flatMap((p) => p.entries),
  // The Consensus part's forks carry readings on their title leaves, and each
  // fork's chapters carry their own, like any curated entry.
  ...parts.filter((p) => p.bips).flatMap((p) => p.bips),
  ...parts.filter((p) => p.bips).flatMap((p) => p.bips).flatMap((b) => b.entries),
];
const referenced = new Set();
for (const e of readingBearers) {
  for (const r of readingsOf(e)) {
    // A reading's translations (file-cs, file-de → r.files) are files like the
    // original: each must exist, carry prose, and wear the CC-BY SPDX line.
    const wanted = [r.file, ...Object.values(r.files ?? {})].filter(Boolean);
    if (!wanted.length) continue;                 // an inline note: nothing on disk to check
    for (const file of wanted) {
      referenced.add(file);
      let src;
      try {
        src = await readFile(new URL(`commentary/${file}`, WEB), 'utf8');
      } catch {
        problems.push(`"${e.title}" references commentary/${file}, which does not exist`);
        continue;
      }
      if (!markdownParagraphs(src).length) problems.push(`commentary/${file} has no prose in it`);
      if (!src.includes('SPDX-License-Identifier: CC-BY-4.0')) {
        problems.push(`commentary/${file} is missing its SPDX line (<!-- SPDX-License-Identifier: CC-BY-4.0 -->)`);
      }
    }
    // A credited reading is only credited if the name reaches the page.
    if (r.href && !/^https?:\/\//.test(r.href)) {
      problems.push(`commentary/${r.file}: href "${r.href}" is not an http(s) URL`);
    }
  }
}

// A file nothing points at is not an error — a reading can be written before
// its entry is settled — but it is silent, so it is worth saying out loud.
const onDisk = (await readdir(new URL('commentary/', WEB))).filter((f) => f.endsWith('.md'));
for (const f of onDisk) if (!referenced.has(f)) notes.push(`commentary/${f} is not referenced by any entry — nothing will show it`);

// The appendix's own places: each must resolve to a height like any other, and
// a part that lists none but says it will is a part that renders empty. The
// Consensus part's places live a level down, under their BIPs; a bip's URL
// handle must be unique (it is how ?bip= finds the leaf), an expected row must
// be a height (□ is arithmetic on a height; a transaction cannot be expected),
// and a signaling fork must say how it is counted.
for (const part of parts) {
  if (part.kind !== 'consensus') continue;
  const handles = new Set();
  for (const bip of part.bips) {
    if (handles.has(bip.key)) problems.push(`appendix "${part.title}": two bips share the URL handle "${bip.key}"`);
    handles.add(bip.key);
    if (bip.status === 'signaling' && (!Number.isFinite(bip.bit) || !Number.isFinite(bip.threshold))) {
      problems.push(`appendix "${part.title}": ${bip.title} is signaling but names no bit/threshold to count by`);
    }
    // The ballot table needs a coherent reading of a yes: a bit, a minimum
    // version, or coinbase text (one of them, not two), a window, and -- for
    // a closed ballot -- an anchor whose window closes on a period boundary
    // where the fork HAD periods, since those boundaries are consensus
    // arithmetic and a misplaced anchor would tally the wrong blocks. A
    // coinbase ballot had no periods at all; its window is an editorial
    // frame, and its anchor stands wherever the story closed. A failed fork
    // is the same case whatever read its yes: no period ever closed on it,
    // and where its rule counted a rolling window (BIP109's 750 of the 1,000
    // preceding) there were no aligned boundaries even while it ran -- so
    // its anchor too is editorial, the era's high-water mark or the block
    // the argument left at, and only an ACTIVE bit fork must align.
    if ([bip.bit, bip.version, bip.coinbase].filter((x) => x != null).length > 1) {
      problems.push(`appendix "${part.title}": ${bip.title} names more than one way to read a yes — a bit, a version, or coinbase text, not several`);
    }
    if (bip.ballot != null) {
      if (bip.bit == null && bip.version == null && bip.coinbase == null) {
        problems.push(`appendix "${part.title}": ${bip.title} names a ballot but no bit, version, or coinbase text to read it by`);
      }
      if (!Number.isFinite(bip.window)) {
        problems.push(`appendix "${part.title}": ${bip.title} names a ballot but no window`);
      } else if (bip.bit != null && bip.status !== 'failed' && (bip.ballot + 1) % bip.window !== 0) {
        problems.push(`appendix "${part.title}": ${bip.title}'s ballot ${bip.ballot} does not close a ${bip.window}-block period (period boundaries align from genesis)`);
      }
    }
    if (bip.status === 'signaling' && bip.ballot != null) {
      problems.push(`appendix "${part.title}": ${bip.title} is still signaling — its ballot has not closed, so it names none and its leaf counts from the tip`);
    }
    // A monitor is an external claim the leaf will fetch and credit: it must
    // be an https URL, and only a fork still signaling has a period to ask
    // about -- a closed window's count is the chain's, not a site's.
    if (bip.monitor !== undefined) {
      if (!/^https:\/\//.test(bip.monitor)) {
        problems.push(`appendix "${part.title}": ${bip.title}'s monitor "${bip.monitor}" is not an https URL`);
      }
      if (bip.status !== 'signaling') {
        problems.push(`appendix "${part.title}": ${bip.title} names a monitor but is not signaling — a closed window's count is the chain's own`);
      }
    }
    for (const e of bip.entries) {
      if (!/^-?[0-9]+$/.test(e.id) && !/^[0-9a-f]{64}$/.test(e.id)) {
        problems.push(`appendix "${part.title}": "${e.title}" has an id that is neither a block height nor a 64-hex id`);
      }
      if (e.expected && !/^[0-9]+$/.test(e.id)) {
        problems.push(`appendix "${part.title}": "${e.title}" is expected but its id is not a height — only an unmined height can be expected`);
      }
      if (!e.note) notes.push(`appendix "${part.title}": "${e.title}" (${bip.title}) carries no note — the row will have nothing to say on hover`);
    }
    notes.push(`appendix "${part.title}": ${bip.title} — ${bip.status}, ${bip.entries.length} places`);
  }
}

// The Inscriptions part: each entry cites the witness its envelope reads at
// (§n.a — a height, a section, and a footnote, all offline arithmetic), and
// names the reveal transaction the leaf will fetch and parse. The reveal's
// 64-hex shape is enforced by the loader; what is checked here is that the
// citation actually reaches a footnote — a row citing a bare chapter would
// open the book somewhere the envelope is not.
for (const part of parts) {
  if (part.kind !== 'inscriptions') continue;
  for (const e of part.entries) {
    if (!/^[0-9]+$/.test(e.id) || e.index == null || e.wit == null) {
      problems.push(`appendix "${part.title}": "${e.title}" must cite a witness footnote (§n.a) so its row can open the book at the envelope`);
    }
    if (!e.note) notes.push(`appendix "${part.title}": "${e.title}" carries no note — the row will have nothing to say on hover`);
    else notes.push(`appendix "${part.title}": "${e.title}" — ${reference(Number(e.id))} §${e.index + 1}.${footnoteMark(e.wit)}, reveal ${e.reveal.slice(0, 8)}…`);
  }
}

// The Citations register's proofs are checked by replaying them, the only way a
// proof can be checked at all: the file must be there, it must parse, it must
// reach a Bitcoin block (a pending proof cites no chapter), and where the
// stamped file ships beside it the digest must match — otherwise the appendix
// would list a file under a proof that is about some other file. What is NOT
// checked here is the merkle root against the chain: this runs offline, ahead
// of everything expensive, and the page does that check when a reader opens it.
for (const part of parts) {
  if (part.kind !== 'proofs') continue;
  for (const e of part.entries) {
    let bytes;
    try { bytes = new Uint8Array(await readFile(new URL(`proofs/${e.proof}`, WEB))); }
    catch { problems.push(`appendix "${part.title}": "${e.title}" names proofs/${e.proof}, which is not there`); continue; }
    let read;
    try { read = await readProof(bytes); }
    catch (err) { problems.push(`appendix "${part.title}": proofs/${e.proof} will not read — ${err.message}`); continue; }
    if (!read.place) {
      problems.push(`appendix "${part.title}": proofs/${e.proof} reaches no Bitcoin block${
        read.pending.length ? ` (still pending at ${read.pending.join(', ')})` : ''} — it cites no chapter`);
      continue;
    }
    if (e.subject) {
      try {
        const subject = new Uint8Array(await readFile(new URL(`proofs/${e.subject}`, WEB)));
        if (!(await attests(read, subject))) {
          problems.push(`appendix "${part.title}": proofs/${e.proof} does not attest proofs/${e.subject} — the digests differ`);
        }
      } catch { problems.push(`appendix "${part.title}": "${e.title}" names proofs/${e.subject}, which is not there`); }
    }
    notes.push(`appendix "${part.title}": "${e.title}" is stamped into ${citeOf(read.place)}`);
  }
}

const credited = readingBearers.flatMap((e) => readingsOf(e).filter((r) => r.by).map((r) => r.by));
console.log(`notables.yaml: ${entries.length} entries in ${allPlaces.length} places, ${referenced.size} readings`
  + `; appendix.yaml: ${parts.map((p) => p.title).join(', ')}`
  + `${credited.length ? `, credited to ${[...new Set(credited)].join(', ')}` : ''}`);
for (const n of notes) console.warn(`  note: ${n}`);
for (const p of problems) console.error(`  error: ${p}`);
if (problems.length) {
  console.error(`\n${problems.length} problem${problems.length > 1 ? 's' : ''} in the editorial layer.`);
  process.exit(1);
}
console.log('The editorial layer reads.');
