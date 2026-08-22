# The βook of βitcoin

What if you could read the blockchain like a manuscript, if every block is a chapter, every transaction a page, and ledgers are just references? This project uses [Glossia](https://glossia.io/) to provide Latin, English, German and Czech translations that make Bitcoin legible. Halving eras are volumes, books separate difficulty adjustments, chapters represent blocks. A transaction's inputs and outputs are just forward and back references shown in the margin, and a utxo is just an output with no forward reference. This allows for a deeper understanding of its function just by exploring the manuscript structure. The appendices provide context: ledgers collect related passages (addresses are just passages that may recur), the mempool represents future chapters not yet bound, yet inscriptions are renderings of a particular footnote (witness data). In practice, we find each aspect of Bitcoin has a natural place in the manuscript metaphor, allowing future versions of the Book to expand with our understanding.

**Read the book: <https://bookofbitcoin.io/>**

## What it does

The book is a *verbatim* translation of the chain into human language. Every
byte of every transaction is carried in the words of the prose and can be read
back out exactly — filter a passage against the payload wordlist and the
transaction returns, byte for byte, in order, with nothing added and nothing
omitted.

Like any translation, the phrasing belongs to the language: the connective
words that make a transaction into a sentence are the translator's grammar, not
the author's words. The book is set in Latin, and a reader who would rather
have English, Čeština or Deutsch may say so. The words differ, the record does
not.

Which is the argument the book exists to make: **a transaction is a form of
speech.** It can be set down in prose, read aloud, quoted, transcribed by hand,
and carried back to the chain intact.

A translation this literal also separates two things usually printed as one.
The **record** is what the chain says — this output moved to this script at
this height. It has no author. The **readings** are what people say *about* the
record: that a block is worth noticing, that a transaction bought a pizza, that
an address belongs to a named party. Every one of those is a claim, made by
someone, and the book keeps the two in different registers — a passage *is* its
transaction, while a reading is set apart, credited, and licensed to its
author. The book states all of this in its own voice, at length, in
[the preface](web/preface.md).

## How it works

[Glossia](https://glossia.io/) — a Rust engine compiled to WASM, consumed as a
published [crates.io release](https://crates.io/crates/glossia) and pinned in
`build_web.sh` — encodes a transaction's bytes as grammatically correct
sentences, invertibly. Everything around it is a static site: ES modules served
as-is, no bundler. A page fetches a block from any esplora-style endpoint
(Blockstream, mempool.space, or your own node), parses it, composes the prose
in the browser, and banks immutable chain data in IndexedDB, so a chapter read
once reads offline. It installs as a PWA, and the fonts are vendored — nothing
is fetched from a third party.

## Write a reading

**Most of the chain has nothing said about it yet.** That is the part of this
book a reader can add to.

The record needs no help — it is complete, and it is generated. What it lacks
is commentary: why a block mattered, what a transaction set in motion, what a
name is doing on a ledger, where the received story stops matching the bytes.
The book carries readings as a layer apart from the record, each credited to
whoever wrote it, and the book's own voice is simply one of them.

Every passage offers the door. Open the **Commentary** key at the foot of a
page and, where nothing has been written, it says so — *Nothing has been said
about V β61 ■145 §1 yet* — and offers **Add your commentary**, which opens a
file already named for that passage and already carrying its licence header,
forking the repository for you if you have no fork.

You keep the copyright in what you write; it is published with the book under
CC BY 4.0, with your name on it. What a good reading attends to, and the two
files it lives in: [CONTRIBUTING.md](CONTRIBUTING.md).

## Building & running locally

Requires Rust and [wasm-pack](https://rustwasm.github.io/wasm-pack/).

```sh
./build_web.sh                # fetches the pinned glossia crate from crates.io
python3 -m http.server -d web 8080
```

Serve over HTTP, not `file://` — ES-module imports are CORS-blocked there and
the page never reaches its ready state. Set `GLOSSIA_DIR=/path/to/glossia` to
build against a local checkout of the engine instead; to move to a new engine,
publish it and bump the `GLOSSIA_VERSION` default in `build_web.sh`.

Tests: `node --test tools/*.test.mjs`. Editing the contents, the appendix or
the commentary? Run `node tools/check-editorial.mjs` — it reads the authored
files the way the browser does and fails on anything a reader would meet as a
missing reading or an empty contents.

## Deployment

Every push to `main` runs the editorial check, builds the WASM from the pinned
crate and deploys `web/` to GitHub Pages; every pull request gets a live
preview. Releases are versioned by the deploy itself — [CalVer](https://calver.org/)
`vYYYY.0M.0D.HH`, stamped into the site as `/version.json` and tagged once the
deploy succeeds — so any two stamps say how far apart they are, and the app's
Update button can report the gap ("Update · 3 days behind"). Nothing is
versioned by hand.

## Reading without JavaScript (crawlers, AI assistants)

The prose is composed in the browser, so the pages ship as empty app shells.
For those readers the deploy publishes a static layer: `/llms.txt` (the site
explained for machine readers — where the text lives, the citation scheme, the
URL grammar), `/passages/` (every curated entry as plain Markdown, its
commentary last and behind its own heading, so a reader that flattens the page
cannot quote a reading as the record), and the curated entries as HTML pages at
their own citations (`/III/2/5/`, `/III/2/5/1/`, `/III/2/5/1/0/`), each with its
own preview card. `/robots.txt` and `/sitemap.xml` point at all of it.

## License

Five kinds of material live here, and the terms follow the distinction the book
argues for: the record belongs to no one, the readings belong to their readers.

| Material | Terms |
|---|---|
| Code | MIT OR Apache-2.0 |
| The book's prose — the chain's own speech | CC0 1.0 (public domain) |
| The sigla — the alphabet that prose is written in | CC0 1.0 (public domain) |
| Annotations, names, curation | CC BY 4.0 |
| Commentary by others | Theirs — not licensed here |

**The code** — the pages, scripts and build tooling — is licensed under either
[Apache-2.0](LICENSE-APACHE) or [MIT](LICENSE-MIT) at your option, the same
terms as the [Glossia engine](https://github.com/asherp/glossia) it builds on.
Unless you explicitly state otherwise, any contribution intentionally submitted
for inclusion in this work by you, as defined in the Apache-2.0 license, shall
be dual licensed as above, without any additional terms or conditions.

**The prose and the sigla** are dedicated to the public domain under
[CC0 1.0](LICENSE-CC0). Quote, print, recite, republish, in whole or in part,
with or without attribution, for any purpose. Not as a generosity but as a
matter of consistency: a translation this mechanical authors nothing, and an
alphabet asserts nothing about the record — `⧉` *is* OP_DUP, the way a payload
word *is* its bytes. These words are not mine; they are Bitcoin's, made
readable.

**The editorial layer** — the curated contents and ledgers, the names attached
to notable passages, the notes explaining why each was chosen, the exposition of
the notation — is authored work, licensed [CC BY 4.0](LICENSE-CC-BY). Reuse it
freely, including commercially; just credit it. Attribution here is not a toll,
it is the label that keeps commentary distinguishable from record. The boundary
is a file boundary so a machine can see it too: `web/notables.yaml`,
`web/appendix.yaml`, `web/commentary/*.md` and `web/btc-index-data.js` carry
`SPDX-License-Identifier: CC-BY-4.0`; every other source file carries
`MIT OR Apache-2.0`. Nothing is compiled from the one into the other.

**Commentary written by anyone other than this book's author** is that person's
own, and nothing above reaches it. Contributed here, it is licensed by its
author under CC BY 4.0 so that it can be published and quoted with the book —
credited to them, on the same terms as the rest of the editorial layer. See
[CONTRIBUTING.md](CONTRIBUTING.md).
