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

Two licenses, because there are two kinds of material here.

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

(Where the book's text is accompanied by material genuinely written by a
human — introductions, essays, annotations in an authorial voice — that
material is the author's own speech and is offered under the same CC0 terms,
so that no part of the book carries a condition the rest does not.)
