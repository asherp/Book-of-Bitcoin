# The βitcoin βook

Bitcoin verbatim — a Bitcoin block, read as a chapter: each transaction
rendered as a paragraph of grammatically correct [Glossia](https://glossia.io/)
prose, with witness data collected as footnotes. Installable as a PWA and
offline-capable.

## A literal translation

The βitcoin βook is a verbatim translation of the chain into human language:
every byte of every transaction is carried in the words of the prose, and can
be read back out exactly — filter a passage against the payload wordlist and
the transaction returns, byte for byte, in order, with nothing added and
nothing omitted.

Like any translation, the phrasing belongs to the language: the connective
words that make a transaction into a sentence are the translator's grammar,
not the author's words, and the same transaction can be rendered in more than
one way. What survives every rendering is the content — losslessly, and
provably so. The book reads in English today, and the engine speaks other
languages; as the reader's own language becomes selectable, none of this
changes. The words differ, the book does not.

Which is the argument the book exists to make: **a transaction is a form of
speech.** It can be set down in prose, read aloud, quoted, transcribed by
hand, and carried back to the chain intact. That is not a metaphor about
transactions — it is a demonstration, and every page is a witness to it.

## The record and the readings of it

A translation this literal has one useful side effect: it separates two things
that are usually printed as one.

The record is what the chain says — this output moved to this script at this
height, in this block. It has no author. Anyone can read it, and any two
readers who read it honestly read the same thing.

The readings are what people say *about* the record: that a block is worth
noticing, that a transaction bought a pizza, that a run of outputs belongs to
one person, that an address belongs to a named party, that coins carry a
history worth acting on. Every one of those is a claim, made by someone,
resting on evidence and inference that can be examined and can be wrong.

This book keeps the two in different registers, visibly. A passage *is* its
transaction, byte for byte. "Bitcoin Pizza Day" is a name a person attached to
one — set apart as annotation, credited, and no more authoritative than the
argument behind it.

The distinction is worth insisting on because it is routinely collapsed
elsewhere. Attribution — clustering heuristics, entity labels, taint scoring —
is commentary: skilled, often useful, sometimes near-certain, and sometimes
wrong in ways that cost people their funds or their liberty. Presented flush
against the ledger it annotates, it borrows an authority it has not earned.
There is a tell, too: such datasets are held as proprietary work, and what
makes a compilation ownable is precisely the judgment poured into it. Facts
read off a public ledger belong to no one — which is exactly why this book's
prose is dedicated to the public domain below. A claim to own the attribution
is a claim of authorship, and authorship means opinion, not observation. It
cannot be both somebody's property and nobody's interpretation.

None of which says commentary is idle — this book is full of it, and the
better it is, the more it deserves a name on it. It says only that the record
belongs to no one and the readings belong to their readers, and that a reader
is entitled to see which is which. The licenses below are that principle,
written down.

Originally part of the [asherp/glossia](https://github.com/asherp/glossia)
repository; the book now lives here, while the Glossia engine (the Rust core
compiled to WASM) is consumed as a published
[crates.io release](https://crates.io/crates/glossia), pinned in
`build_web.sh` — so the book always builds against a released engine version.

## Layout

- `web/bitcoin-book.html` — the book: fetches a block from a configurable
  esplora-style endpoint (Blockstream, mempool.space, or your own node) and
  renders it as prose
- `web/bitcoin-contents.html` — table of contents / notable blocks
- `web/bitcoin-ledgers.html` — the Ledgers shelf: notable donation addresses
  (and any address the reader keeps), each with its current balance
- `web/bitcoin-ledger.html` — one ledger: a view of the manuscript focused
  on amounts. A ledger is a titled set of addresses (most hold one), read
  with the book's own carousel swipes (`?address=a,b,…` names the set).
  Its leaves: a title page per address (the address as its Glossia-encoded
  scriptPubKey, plus the state of what's gathered) with the address's
  record scrolling endlessly below — newest first, organized by reference
  alone (Volume, then Book), the next page prefetching as the reader nears
  the bottom — and past the last address the ledger's entries page: the
  one view organized by time, everything banked merged into one account
  with running balance, held coins in full ink and spent ones dimmed.
  Nothing backfills on its own — exploration is the sync — and every page
  found is banked for good, from the same Esplora-compatible endpoints the
  reading pages use; a ledger reconciles its entries against the chain's
  balance before its numbers are trusted
- `web/btc-tx.js`, `web/btc-prose.js`, `web/btc-citation.js`,
  `web/btc-contents.js`, `web/btc-index.js`, `web/btc-store.js` —
  transaction parsing, prose composition, citations, contents data,
  anthology data, and the archive (immutable chain data kept in IndexedDB,
  so revisited chapters and resolved citations read offline)
- `web/btc-contents-data.js`, `web/btc-index-data.js` — the curated entries
  themselves: which blocks and addresses the book keeps, what they are
  called, and the notes explaining why. The editorial layer, kept in its own
  files because it is licensed apart from the machinery that renders it
  (see [License](#license))
- **The sigla** — the marks the manuscript is written in, and where each
  lives:
  - the opcode alphabet (`OPCODE_SYMBOLS` in `web/btc-prose.js`): a glyph per
    opcode, families sharing a base mark with a subscript convention for
    their variants — `⧉` DUP, `⧉₂` 2DUP, `∇` CHECKSIG, `∇₊` CHECKSIGADD,
    `°₄` NOP4. Opcodes without a glyph fall back to their `OP_*` name
  - the citation sigla (`web/btc-citation.js`): Roman volumes, `β` the
    difficulty mark (a book is a difficulty window), `■` the block mark (a
    chapter is a block), `§` the section (a transaction) — e.g. `III β2 ■5 §1`
  - the block-version notation (`web/btc-prose.js`): BIP9's fields rendered as
    what they are — a word pair carrying the 16 version-rolling bits, then the
    signaling bits in plain binary (`accio library 100`). Invertible: the
    notation reads back to the nVersion integer
  - the amount conventions (`web/btc-prose.js`): `₿`, and the lone satoshi
  - the reader's key to all of it is built into `web/bitcoin-book.html`, behind
    the notation toggle in the section-nav bar
- `web/glossia-msg.js` — the encoding pipeline over the Glossia WASM engine
- `web/glossia.js`, `web/glossia_bg.wasm` — **build artifacts** (gitignored),
  produced by `build_web.sh` from the published glossia crate
- `web/sw.js`, `web/bitcoin-book.webmanifest`, `web/icons/` — PWA shell

## Building & running locally

Requires Rust and [wasm-pack](https://rustwasm.github.io/wasm-pack/).

```sh
./build_web.sh                # fetches the pinned glossia crate from crates.io
python3 -m http.server -d web 8080
```

Set `GLOSSIA_DIR=/path/to/glossia` to build an unreleased local checkout of
the engine instead.

Serve over HTTP, not `file://` — ES-module imports are CORS-blocked on
`file://` and the page never reaches its ready state.

## Updating the engine

The engine version is pinned by the `GLOSSIA_VERSION` default in
`build_web.sh`. To move to a new engine: publish the new glossia version
(push a `vX.Y.Z` tag in asherp/glossia — its publish workflow does the rest),
then bump the pin here. The pinned version must exist on crates.io before this
repo's builds can succeed.

## Deployment

- `.github/workflows/deploy-web.yml` — on every push to `main`, builds the
  WASM from the pinned glossia crate and deploys `web/` to the `gh-pages`
  branch (GitHub Pages).
- `.github/workflows/pr-preview.yml` — deploys a live preview of every pull
  request under `pr-preview/pr-<N>/` and comments the URL on the PR.

## License

Five kinds of material live here, and the terms follow the distinction the
book argues for: the record belongs to no one, the readings belong to their
readers.

| Material | Terms |
|---|---|
| Code | MIT OR Apache-2.0 |
| The book's prose — the chain's own speech | CC0 1.0 (public domain) |
| The sigla — the alphabet that prose is written in | CC0 1.0 (public domain) |
| Annotations, names, curation | CC BY 4.0 |
| Commentary by others | Theirs — not licensed here |

### The code

The software in this repository — the pages, scripts, and build tooling — is
licensed under either of

- Apache License, Version 2.0 ([LICENSE-APACHE](LICENSE-APACHE) or
  http://www.apache.org/licenses/LICENSE-2.0)
- MIT license ([LICENSE-MIT](LICENSE-MIT) or
  http://opensource.org/licenses/MIT)

at your option — the same terms as the
[Glossia engine](https://github.com/asherp/glossia) this book builds on.

Unless you explicitly state otherwise, any contribution intentionally
submitted for inclusion in this work by you, as defined in the Apache-2.0
license, shall be dual licensed as above, without any additional terms or
conditions.

### The book

The prose the book renders — its chapters, paragraphs, passages, in every
language — is dedicated to the public domain under
[CC0 1.0 Universal](LICENSE-CC0). No rights reserved. Quote it, print it,
recite it, republish it, build on it, in whole or in part, with or without
attribution, for any purpose.

Not as a generosity, but as a matter of consistency. The passages are a
literal, mechanical translation of public chain data — invertible, with no
authorial judgment anywhere in the loop. A translation that faithful authors
nothing, and so has nothing to license. Any other choice would contradict the
book itself: to require permission to quote a transaction, or credit for
having transcribed one, is to claim someone else's speech as your own work.
CC0 says plainly what the book argues at length — **these words are not mine;
they are Bitcoin's, made readable.** Speech needs no license to be quoted.

### The sigla

The notation the book writes in — the opcode alphabet, the citation sigla, the
block-version notation, the amount conventions — is dedicated to the public
domain under [CC0 1.0 Universal](LICENSE-CC0), on the same terms as the prose,
and for the same reason.

Sigla are orthography, not commentary. `⧉` *is* OP_DUP, the way a payload word
*is* its bytes: a substitution that carries the thing across and can be
reversed back to it. A siglum asserts nothing about the record — it is the
alphabet the record is written in.

Which is also why it cannot be licensed any other way without contradiction. A
passage that renders a script contains those glyphs; if the alphabet demanded
attribution, every quoted passage carrying a script would carry an obligation
with it, and the public-domain prose above would be written in an alphabet that
is not. Nor would a notation under conditions ever become anyone's habit — a
writing system earns its life by being adopted, and attribution is friction.
Write `⧉` for OP_DUP wherever you like, credit no one, and change it where it
serves you better.

(As with the prose, this mostly formalizes what is already the case. The glyphs
are ordinary Unicode characters, uncopyrightable individually, and a system of
notation is a system rather than an expression of one. The opcode *names* the
key falls back on — `OP_DUP`, `OP_CHECKSIG` — are Bitcoin Core's, taken from
its MIT-licensed sources and acknowledged with thanks.)

What remains editorial is the writing *about* the notation: why `∇` for
CHECKSIG, how the subscript convention orders a family, the notes in the
reader's key. Design rationale is commentary, and is covered below.

No file split is needed for any of this, because the two things live at
different levels. The lookup tables that implement the notation are source
code and stay MIT OR Apache-2.0 along with the files holding them; the CC0
dedication is over the notation itself — the convention that `⧉` means
OP_DUP — which is not a file and belongs to no one.

### The annotations

The editorial layer around the prose — the curated table of contents and the
ledgers, the names attached to notable blocks and transactions, the notes
explaining why each was chosen, the exposition of the notation, and any
introductions or essays — is authored work, and is licensed under
[CC BY 4.0](LICENSE-CC-BY). Reuse it freely, including commercially; just
credit it.

The different terms are the point. Nobody wrote the transactions, so nobody
signs them. Somebody did decide that a particular block is worth a reader's
attention and what to call it — and a reading with a name on it can be
weighed, argued with, and traced back to whoever made it. Attribution here is
not a toll; it is the label that keeps commentary distinguishable from record.

(Individual names and short titles are not copyrightable in any case, and
nothing here tries to claim otherwise. What CC BY covers is the body of
editorial work — the selection, the arrangement, and the writing.)

The boundary is a file boundary, so a machine can see it too. The editorial
data lives in `web/btc-contents-data.js` and `web/btc-index-data.js`, each
carrying `SPDX-License-Identifier: CC-BY-4.0`; every other source file carries
`MIT OR Apache-2.0`. The modules that render them re-export the data, so the
split costs importers nothing.

### Commentary by others

Commentary written by anyone other than this book's author is that person's
own. It is not this project's to license, and nothing above reaches it: the
writer holds their copyright, their name stays on their words, and any use of
them is between the user and the writer.

Commentary contributed to this repository is licensed by its author under
CC BY 4.0 — credited to them, on the same terms as the rest of the editorial
layer — so that it can be published and quoted with the book. See
[CONTRIBUTING.md](CONTRIBUTING.md). Commentary written by readers inside the
app, should the book ever accept it, is governed by that app's terms rather
than by this file.
