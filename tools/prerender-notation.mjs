// SPDX-License-Identifier: MIT OR Apache-2.0
//
// tools/prerender-notation.mjs — the notation key as a static document.
//
//   node tools/prerender-notation.mjs      # writes web/notation.md
//
// The book writes its scripts in an alphabet of marks, and until now that
// alphabet reached a reader in exactly one way: the sigla leaf and the
// notation toggle, both drawn in the browser from the tables in
// btc-sigla.js. A reader without JavaScript — a crawler, an AI assistant
// answering a question about a passage — therefore met `⧉ ⌖ h²⁰ … ≡ ∇` with
// nothing to read it by. The passages were legible and the notation they are
// written in was not.
//
// So this writes the key out. Everything here is DERIVED from the same tables
// the pages render, never restated: the alphabet from OPCODE_GROUPS with its
// names and marks, the tabled forms from termOfScript reading a script built
// out of TERMS' own body. A mark cannot drift from what the book prints
// because there is no second copy of it to drift.
//
// What is written rather than derived is the prose around the tables, and it
// is held to the tables by tools/notation-page.test.mjs: a letter this file
// glosses must be a letter the term module actually binds, and a mark it
// names must be one something in the book writes.
//
// No engine, no network: the sigla and the terms are notation rather than
// prose, and this runs on a bare checkout (which is also why it is a separate
// step from prerender-passages.mjs, whose passages need the WASM build).

import { writeFile } from 'node:fs/promises';

import { OPCODE_SYMBOLS, OPCODE_NAMES, OPCODE_GROUPS, toSuperscript } from '../web/btc-sigla.js';
import { TERMS, termOfScript, titleText, demandsOf } from '../web/btc-term.js';

const SITE = 'https://bookofbitcoin.io';
const OUT = new URL('../web/notation.md', import.meta.url);

const hex2 = (n) => n.toString(16).padStart(2, '0');

// ── the alphabet ──────────────────────────────────────────────────────────
// One table per family, in the order the key reads in. The completeness the
// sigla leaf asserts by rendering, this asserts by refusing: an opcode with
// no group, or a group naming a byte the alphabet has no mark for, is a hole
// in the key and stops the write rather than shipping a table with a gap in
// it nobody can see.
export function alphabet() {
  const grouped = new Map();
  for (const g of OPCODE_GROUPS) {
    for (const b of g.bytes) {
      if (grouped.has(b)) throw new Error(`opcode 0x${hex2(b)} is in two groups: ${grouped.get(b)} and ${g.title}`);
      grouped.set(b, g.title);
      if (!OPCODE_NAMES[b]) throw new Error(`group ${g.title} names byte 0x${hex2(b)}, which has no opcode name`);
      if (!OPCODE_SYMBOLS[b]) throw new Error(`opcode ${OPCODE_NAMES[b]} has no mark in the alphabet`);
    }
  }
  for (const b of Object.keys(OPCODE_NAMES).map(Number)) {
    if (!grouped.has(b)) throw new Error(`opcode ${OPCODE_NAMES[b]} (0x${hex2(b)}) is in no group — the key would leave it out`);
  }
  return OPCODE_GROUPS.map((g) => ({
    title: g.title,
    rows: g.bytes.map((b) => ({ mark: OPCODE_SYMBOLS[b], name: OPCODE_NAMES[b], byte: `0x${hex2(b)}` })),
  }));
}

// ── the tabled forms ──────────────────────────────────────────────────────
// Each form's own script, built from the body TERMS states, and then read
// back with termOfScript — so the term printed here is the one the book would
// print over that output, arrived at the same way: every push a binder, every
// opcode where it stands. The datum is zero bytes because a title never shows
// one; what it shows is the letter and how many bytes the letter takes.
export function forms() {
  return Object.entries(TERMS).map(([id, row]) => {
    const n = row.bytes ?? 33;
    const script = row.body
      .map((el) => (el === null ? hex2(n) + '00'.repeat(n) : hex2(el)))
      .join('');
    const t = termOfScript(script);
    if (!t) throw new Error(`${row.label}: its own body does not read back as a term`);
    const alts = demandsOf(t) ?? [];
    return {
      id,
      label: row.label,
      title: titleText(t),
      binder: t.holes.map((h) => `${h.name}${toSuperscript(h.bytes)}`).join(' '),
      datum: t.holes.map((h) => h.title).join('; '),
      brings: alts.map((a) => (a.runs ? `… ${a.brings.join(' ')}` : a.brings.join(' '))),
    };
  });
}

// The letters a spender's side is written in. Glossed here rather than
// imported because the module keeps them as an internal table; the test holds
// this list to what demandsOf and termOfScript actually bind, so a new letter
// arrives as a failure rather than as an unexplained mark.
export const LETTERS = [
  ['h', 'a hash the output committed to'],
  ['p', 'a public key'],
  ['d', 'data — an output that carries a payload rather than a lock'],
  ['s', 'a signature'],
  ['r', 'a redeem script, revealed by the spend (P2SH)'],
  ['w', 'a witness script, revealed by the spend (P2WSH)'],
  ['t', 'a tapscript leaf'],
  ['c', 'a control block — the leaf’s proof to the output key'],
  ['…', 'however many arguments the revealed script wants, uncountable until it is revealed'],
];

// Marks a reader meets in a passage that are not opcodes: the citation
// sigla, the fields of a chapter's frontispiece, and the book's refusals.
export const MARKS = [
  ['I II III', 'volume — a halving era, 210,000 blocks'],
  ['β', 'book — a difficulty window, 2,016 blocks (and, in a frontispiece, the target itself)'],
  ['■', 'chapter — one block, by its position in the book'],
  ['§', 'section — one transaction, by its 1-based position in the block'],
  ['§1.0', 'an output of that section, by its 0-based vout'],
  ['§1.a', 'a witness of that section, by its footnote letter'],
  ['⌘', 'a double-SHA256 hash — a block hash or a transaction id. Its superscript counts BITS, uniquely; every other mark’s counts bytes'],
  ['⓪', 'in a hash, the proof-of-work zero bits closing the line — ⌘ and ⓪ always sum to 256. In a script, OP_0'],
  ['⋔', 'a merkle root'],
  ['η', 'the header’s nonce'],
  ['v', 'the header’s version'],
  ['‡', 'a work cited outside the text, dated into this passage by its OpenTimestamps proof'],
  ['₿', 'an amount'],
  ['λ', 'an abstraction — the term a locking script binds (see below)'],
  ['□', 'no locktime — final with respect to time'],
  ['● ○ †', 'an input’s sequence: final, non-replaceable, replaceable (opt-in RBF)'],
  ['∅', 'nothing is there — a coinbase’s absent prior output, a field a flag zeroed'],
  ['⋯', 'not yet known — a value still being fetched, or one that cannot be priced'],
  ['☒', 'a disagreement — two readings of the same bytes that do not match'],
];

const table = (head, rows) => [
  `| ${head.join(' | ')} |`,
  `|${head.map(() => '---').join('|')}|`,
  ...rows.map((r) => `| ${r.join(' | ')} |`),
].join('\n');

export function notationMd() {
  const md = [];
  md.push('# The notation');
  md.push('');
  md.push('> The alphabet the βook of βitcoin writes its scripts in, and the marks a');
  md.push('> passage carries. Generated from the book’s own tables on every deploy');
  md.push('> (`tools/prerender-notation.mjs`), so it says what the pages say.');
  md.push('');
  md.push(`The book is at ${SITE}; [/llms.txt](${SITE}/llms.txt) says where its text`);
  md.push(`lives and how to reconstruct any passage, and [/brief.md](${SITE}/brief.md)`);
  md.push('is the whole book explained in one file.');
  md.push('');
  md.push('## How to read a mark');
  md.push('');
  md.push('A script is printed as marks, one per opcode, and the pushes between them');
  md.push('as prose. A mark’s **superscript counts the bytes** of the push beside it —');
  md.push('`h²⁰` is a 20-byte hash, `p³²` a 32-byte key — and that count is what makes');
  md.push('the notation invertible, since decoding needs to be told a payload’s length.');
  md.push('Subscripts distinguish a family’s variants: `⧉` DUP, `⧉₂` 2DUP, `°₄` NOP4,');
  md.push('`∇₊` CHECKSIGADD.');
  md.push('');
  md.push('One exception, and it is deliberate: **`⌘`’s superscript counts bits**, so');
  md.push('that it pairs with `⓪`’s count of proof-of-work zero bits and the two always');
  md.push('sum to 256.');
  md.push('');
  md.push('No hash, key, script, txid or preimage is ever set as hex in this book. It');
  md.push('is said in Glossia prose, or it shows `…`. What may be set as figures is');
  md.push('what carries no entropy: a version, a count, an index, an amount.');
  md.push('');
  md.push('## The opcode alphabet');
  md.push('');
  md.push('Every opcode consensus defines has exactly one mark, and the mapping is a');
  md.push('bijection — which is what lets a spelled script name a script and nothing');
  md.push('else. Disabled opcodes keep their mark like any other: a script is notation');
  md.push('whether or not the network would still run it.');
  md.push('');
  for (const g of alphabet()) {
    md.push(`### ${g.title}`);
    md.push('');
    md.push(table(['Mark', 'Opcode', 'Byte'], g.rows.map((r) => [`\`${r.mark}\``, r.name, r.byte])));
    md.push('');
  }
  md.push('## Scripts as terms');
  md.push('');
  md.push('Every locking script is an abstraction over its own datum, and the book');
  md.push('titles each output with the term it binds: the kind, `:=`, then the lambda.');
  md.push('The term is not looked up but **read** — every push becomes a binder, every');
  md.push('opcode stays where it stands — so a script with no tabled form is titled');
  md.push('too, and one that binds nothing is not titled at all.');
  md.push('');
  md.push('The six forms an address can write:');
  md.push('');
  md.push(table(
    ['Form', 'Term', 'Binds', 'A spend must bring'],
    forms().map((f) => [f.label, `\`${f.label} := ${f.title}\``, `\`${f.binder}\` — ${f.datum}`,
      f.brings.map((b) => `\`${b}\``).join(' or ')]),
  ));
  md.push('');
  md.push('A term in **closed** normal form settles on chain by itself; the free');
  md.push('variables of an **open** one name exactly what a spender must still supply,');
  md.push('which is the typed interface to the spend. A script-hash form (P2SH, P2WSH,');
  md.push('taproot’s script path) commits only to a hash until it is spent, so what it');
  md.push('demands is written `( r )` — whatever the revealed script demands — and the');
  md.push('binders it cannot count are written `…`. The spend is where the abstract');
  md.push('becomes concrete: the input hands over the bytes, and the revealed script');
  md.push('takes a title of its own.');
  md.push('');
  md.push('The letters:');
  md.push('');
  md.push(table(['Letter', 'What it names'], LETTERS.map(([l, s]) => [`\`${l}\``, s])));
  md.push('');
  md.push('## Marks a passage carries');
  md.push('');
  md.push(table(['Mark', 'What it means'], MARKS.map(([m, s]) => [`\`${m}\``, s])));
  md.push('');
  md.push('The last three are the book declining rather than guessing. A value that');
  md.push('cannot be computed honestly is never filled in with a plausible one: the');
  md.push('page shows the mark and puts the claim in its hover.');
  md.push('');
  md.push('## Licensing');
  md.push('');
  md.push('The notation — this alphabet, the citation sigla, the term notation — is');
  md.push('dedicated to the public domain under CC0 1.0. Sigla are orthography, not');
  md.push('commentary: `⧉` *is* OP_DUP, the way a payload word *is* its bytes. Write it');
  md.push('wherever you like, credit no one, and change it where it serves you better.');
  md.push('The opcode names it falls back on are Bitcoin Core’s, from its MIT-licensed');
  md.push('sources, with thanks.');
  md.push('');
  return md.join('\n');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const md = notationMd();
  await writeFile(OUT, md);
  const marks = alphabet().reduce((n, g) => n + g.rows.length, 0);
  console.log(`notation.md — ${marks} opcodes in ${OPCODE_GROUPS.length} families, ${forms().length} tabled forms`);
}
