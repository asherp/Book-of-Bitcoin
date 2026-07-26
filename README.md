# The βitcoin βook

Bitcoin verbatim — a Bitcoin block, read as a chapter: each transaction
rendered as a paragraph of grammatically correct [Glossia](https://glossia.io/)
prose, with witness data collected as footnotes. Installable as a PWA and
offline-capable.

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
- `web/bitcoin-ledger.html` — the Ledger: a compendium of every ledger
  (curated donation addresses, any the reader keeps, and ad-hoc
  `?address=a,b,…` queries) in one document, read the way the book is
  read, three levels deep. Ledger title leaves at the top (title, balance,
  span — horizontal swipes browse between ledgers; a push up descends);
  address leaves below (a title page per address, its record scrolling
  endlessly below, newest first by reference; past the last address the
  merged entries leaf, organized by time; pulling down at the top ascends);
  and entry leaves underneath (one transaction as its own page, rendered
  from the bank alone — vertical swipes walk the address's timeline, a
  swipe over the record dives into the entry nearest the finger, and a
  swipe right is the one door back). Nothing backfills on its own —
  exploration is the sync — and every page found is banked for good, from
  the same Esplora-compatible endpoints the reading pages use; a ledger
  reconciles its entries against the chain's balance before its numbers
  are trusted
- `web/bitcoin-ledgers.html` — the old Ledgers shelf, now a redirect to
  the compendium (kept for bookmarks and cached mastheads)
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
