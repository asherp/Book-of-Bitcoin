<!-- SPDX-License-Identifier: MIT OR Apache-2.0 -->

# The vendored fonts

The faces the passage renderer sets its pages with, carried in the
repository so a card, a static citation page, or a PDF renders the same on
every machine — the CI image, a contributor's laptop, a reader's browser —
instead of falling back to whatever that machine happens to have installed.
(That fallback was real: before these files, the deploy's cards set their
serif in Liberation Serif and scattered the sigla across four system fonts.)

Nothing here is fetched from a third party. The book's pages named Google
Fonts until these files landed, which meant every reader's browser
announced itself to fonts.googleapis.com to read a page about a chain that
asks no one's permission — and meant the app could not set its own text
offline, PWA or not. The pages now name only this directory.

## Who reads these files

The `@font-face` table is `FONT_FACES` / `fontFacesCss(srcOf)` in
`tools/twitter-bot/quote.mjs` — one table, and each consumer says where its
copies live:

- **The card renderer** (`tools/twitter-bot/image.mjs`) inlines the files as
  `data:` URIs — a `setContent` page has no origin to resolve a URL
  against — and waits on `document.fonts.ready` before measuring, so the
  fit search sizes a passage in the faces it will actually be set in.
- **The static citation pages** (`tools/passage-page.mjs`) address them at
  the site's own `/fonts/`, the same way those pages address their cards.
- **The app** (`web/bitcoin-*.html`) loads `fonts.css` from this directory.
  That file is generated from the same `FONT_FACES` table — regenerate it
  when the table changes; `tools/fonts.test.mjs` fails if the two disagree,
  if a file it names is missing from the service worker's precache, or if
  any page reaches for a third-party font host again.

`fonts.css` carries one face the renderer's table does not: **Public Sans**,
the app chrome's sans. No rendered passage uses it — a card sets no UI — so
it belongs to the app's stylesheet rather than to the passage table.

## What a first visit actually costs

Not the size of this directory. `unicode-range` means a browser asks for a
face only where its glyphs appear, so a cold visit to a reading page fetches
**four files, ~167 KB**: Newsreader latin, IBM Plex Mono 500 and 600, and
`sigla-dejavu`. The other nine wait until something needs them — the sigla
leaf, which prints the whole alphabet at rest, is the one page that pulls
all thirteen, and that is the page whose job is to.

For comparison, the Google Fonts stylesheet these files replaced declared
six distinct files for the same latin text (~199 KB before a word of italic,
~343 KB after), from two origins the browser had to resolve, connect and
shake hands with before the first byte of a font moved. Same Newsreader
bytes; two fewer origins on the critical path.

Every page preloads those four (`<link rel="preload" as="font" …
crossorigin>`), so their fetch begins alongside `fonts.css` rather than
after the browser has parsed it. Measured on an emulated fast-3G profile
(1.6 Mbps, 150 ms RTT), medians of nine cold loads of the reading page:
the first font byte moves at 192 ms rather than 652 ms, and every font is
in by 2,062 ms rather than 2,369 ms.

**`crossorigin` is load-bearing.** A font is fetched CORS-anonymous even
same-origin, so a preload without that attribute matches no request and
downloads the file a second time. The test pins the attribute and the
membership of the preload set both ways — a missing preload fails, and so
does one for a face the pages do not universally use.

All of it is precached by the service worker regardless (`web/sw.js`), so
the *second* visit and every offline one pay nothing.

## The text faces, verbatim

Unmodified woff2 files as served by the Google Fonts API (css2, a current
Chrome UA), with the unicode-range declarations copied from the same
response. Both families are licensed under the SIL Open Font License 1.1
(`OFL.txt` here).

| files | family | source |
|---|---|---|
| `newsreader-latin.woff2`, `newsreader-latin-ext.woff2`, `newsreader-italic-latin.woff2`, `newsreader-italic-latin-ext.woff2` | Newsreader — variable (wght 200–800, opsz 6–72), roman + italic, latin + latin-ext subsets | fonts.gstatic.com `/s/newsreader/v26/` |
| `plexmono-400-latin.woff2`, `plexmono-500-latin.woff2`, `plexmono-600-latin.woff2` | IBM Plex Mono — 400/500/600, latin subset | fonts.gstatic.com `/s/ibmplexmono/v20/` |
| `publicsans-latin.woff2`, `publicsans-latin-ext.woff2` | Public Sans — variable (wght 100–900), latin + latin-ext subsets. The app's UI face; `fonts.css` only | fonts.gstatic.com `/s/publicsans/v21/` |

## Book Sigla — the sigla fallback

The manuscript's alphabet runs well past what any text face carries:
opcode sigla (⧉ ∇ ⌖ ⓪ …), the marks (⌘ ⋔ ■ □ ₿ ‖ ∅ …), Greek (β η),
superscripts and subscripts. `Book Sigla` is the family that owns all of
it — five subset faces, each declaring in its unicode-range exactly the
codepoints it serves, standing second in every font stack so a siglum
resolves there deterministically while letters pass through to the text
faces. Renamed internally from their donors (the OFL's Reserved Font Name
terms require it of a modified Noto; the Bitstream Vera terms permit it).

| file | glyphs | donor | license |
|---|---|---|---|
| `sigla-dejavu.woff2` | 85 — the bulk: Greek, super/subscripts, math and arrow sigla, geometry, ⌘ ⋔ ‖ ∅ … | DejaVu Sans (system 2.37) | `LICENSE-DEJAVU.txt` |
| `sigla-noto-symbols.woff2` | 17 — the enclosed-digit run ⓪ ① – ⑯, whole from one face so a multisig's circles match | Noto Sans Symbols v47 | `OFL.txt` |
| `sigla-noto-symbols-2.woff2` | 1 — ⌖ (HASH160) | Noto Sans Symbols 2 v25 | `OFL.txt` |
| `sigla-noto-math.woff2` | 1 — ⧉ (DUP) | Noto Sans Math v19 | `OFL.txt` |
| `sigla-noto-sans.woff2` | 1 — ₿ | Noto Sans v42, latin-ext | `OFL.txt` |

## Regenerating

The inventory rule: **every non-ASCII codepoint in a string literal of the
modules whose strings reach a rendered page** — `web/btc-sigla.js`,
`web/btc-prose.js`, `web/btc-citation.js`, `web/btc-pools.js`,
`tools/twitter-bot/quote.mjs`, `tools/passage-page.mjs` (comments
excluded; a glyph in a comment is not on any page). The sigla set is that
inventory minus what the vendored Newsreader actually serves (its cmap
intersected with its declared ranges). The test
`tools/twitter-bot/test.mjs` recomputes the inventory and fails when a
codepoint appears that no vendored face declares — that failure is the
signal to re-run this pipeline.

The subsets were produced with Python fontTools (4.63):

1. Compute the inventory and the sigla set as above (fontTools reads each
   woff2's cmap; the Google CSS supplies the declared ranges).
2. Assign each sigla codepoint a donor: the enclosed-digit run ⓪①–⑯ goes
   wholesale to Noto Sans Symbols; everything DejaVu Sans has goes to
   DejaVu; the remainder to whichever OFL Noto face covers it.
3. Subset each donor to its codepoints (`fontTools.subset`, flavor woff2,
   name IDs 0/13/14 kept so the copyright and license notices ride inside
   the files), rename family and full-name records to `Book Sigla`.
4. Update the `FONT_FACES` table in `tools/twitter-bot/quote.mjs` with the
   new files' unicode-ranges, and the two license files here if a donor
   changed.

A donor for a *new* siglum is found the same way these were: check DejaVu
first, then the Noto families, preferring OFL sources; `fc-list
":charset=<hex>"` answers who covers a codepoint.
