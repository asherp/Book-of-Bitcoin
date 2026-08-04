<!-- SPDX-License-Identifier: MIT OR Apache-2.0 -->

# The vendored fonts

The faces the passage renderer sets its pages with, carried in the
repository so a card, a static citation page, or a PDF renders the same on
every machine — the CI image, a contributor's laptop, a reader's browser —
instead of falling back to whatever that machine happens to have installed.
(That fallback was real: before these files, the deploy's cards set their
serif in Liberation Serif and scattered the sigla across four system fonts.)

The `@font-face` table that serves them is `FONT_FACES` /
`fontFacesCss(srcOf)` in `tools/twitter-bot/quote.mjs` — one table, every
consumer: the card renderer inlines the files as `data:` URIs, the static
citation pages address them at the site's `/fonts/`. The live reading pages
still load their fonts from Google Fonts and are not touched by this
directory.

## The text faces, verbatim

Unmodified woff2 files as served by the Google Fonts API (css2, a current
Chrome UA), with the unicode-range declarations copied from the same
response. Both families are licensed under the SIL Open Font License 1.1
(`OFL.txt` here).

| files | family | source |
|---|---|---|
| `newsreader-latin.woff2`, `newsreader-latin-ext.woff2`, `newsreader-italic-latin.woff2`, `newsreader-italic-latin-ext.woff2` | Newsreader — variable (wght 200–800, opsz 6–72), roman + italic, latin + latin-ext subsets | fonts.gstatic.com `/s/newsreader/v26/` |
| `plexmono-400-latin.woff2`, `plexmono-500-latin.woff2`, `plexmono-600-latin.woff2` | IBM Plex Mono — 400/500/600, latin subset | fonts.gstatic.com `/s/ibmplexmono/v20/` |

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
