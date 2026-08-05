<!-- SPDX-License-Identifier: MIT OR Apache-2.0 -->

# Exporting the book as PDF

Notes toward a PDF of the book — what such a thing can honestly be, what the
repository already has that gets it most of the way there, and what a printed
leaf forces that a screen never asks. They exist to support three things,
none of which ships with this file:

- **`tools/export-pdf.mjs`** (future) — the exporter: the curated passages
  bound as one document and printed to PDF by the same headless Chromium the
  card renderer already drives.
- **A deploy step** — the edition rebuilt on every release, stamped with the
  release's own CalVer version, optional in exactly the way the cards are.
- **The editorial decisions** a printed page forces — paper or dark, page
  size, whether commentary rides in the edition — gathered at the end so
  they are decided once, out loud, rather than defaulted silently by
  whoever writes the exporter.

Every claim below carries where it came from:

- **[ran]** — verified by running it, 2026-08-03, in this repository:
  Chromium 1194 (the Playwright build) driven by `playwright-core`, over the
  passage renderer's own HTML. True of that run and of nothing newer.
- **[read]** — read out of this repository's source. True at the commit this
  file was written against.
- **[doc]** — documented Chromium or CSS behavior, not exercised here. Say
  so out loud.
- **[open]** — a decision this file does not make.

## What "the book as PDF" can mean

The book has no last page. The chain grows by a chapter every ten minutes,
a modern chapter runs to several thousand sections, and a single inscription
can run to megabytes of prose — so "export the book" is a category error,
the same one the back matter's design already answers: reading order cannot
carry what has no end. Any PDF is a selection, and the repository already
maintains exactly one selection worth binding: the curated table of
contents, the passages `tools/prerender-passages.mjs` renders as static
markdown and citation pages on every deploy. **[read]**

Three honest deliverables, in the order they are worth building:

1. **The curated edition.** Front matter (title leaf, terms), the contents,
   then every curated passage in contents order with its commentary ruled
   off behind its own heading — the same document `web/passages/` already is,
   typeset the way the cards are instead of flattened to markdown. Rebuilt
   each deploy, stamped with the release version.
2. **One passage as PDF**, on demand. **Done, and not the way this line
   first assumed** — see "The passage in the reader's hands" below. The
   deliverable was a reader's button, and a reader's browser already owns a
   PDF writer; the deploy-time renderer was never needed for it.
3. **The reader's own print** — `@media print` on the reading page. A
   nicety, not the foundation; see "paths not taken."

## What already exists

The distance from here to a PDF is one function call. Everything else is
already in the house:

- **The pipeline runs in Node.** `tools/prerender-passages.mjs` runs the
  full parse → compose → encode pipeline (btc-tx.js → btc-prose.js → the
  Glossia WASM engine) at deploy time, off the browser, and its
  `renderEntry` already returns every passage as composed fields plus
  rendered witness HTML — the exact shape the page renderer takes. **[read]**
- **The page exists as HTML off one root size.**
  `tools/twitter-bot/quote.mjs` sets a passage as the book's own manuscript
  page (`passageHtml` / `passageCss`), every measure an em off a single
  root, and `passageCss({ fixed: false })` is already the unpinned mode: no
  fixed height, no clipping, the page grows to what the passage needs —
  which is precisely what a paginated document wants to flow into leaves.
  **[read]**
- **Headless Chromium is already in the deploy.** The cards step installs
  Playwright Chromium (`continue-on-error`, cached), and
  `tools/twitter-bot/image.mjs` launches and drives it. **[read]**
- **Chromium emits PDF.** `page.pdf()` where the cards call
  `screenshot()` — same browser, same page, same CSS. **[ran]**

The README states the renderer principle this file leans on: *one renderer,
two consumers, the same page either way*. A PDF is the third consumer, not a
second typesetting system.

## The proof run here

A proof of concept was run in this repository's environment: the test
suite's fixture fields (`stubFields` in `tools/twitter-bot/test.mjs`, so no
engine and no network), set as three sections of increasing length through
`txFlowHtml`, styled by `passageCss({ fixed: false })` with a print overlay
laid on top, and printed by `page.pdf({ format: 'A5', printBackground:
true, preferCSSPageSize: true })`. **[ran]**

The overlay, in full — this is the entire distance between the card
stylesheet and a printable one:

```css
@page { size: A5; margin: 14mm 12mm 16mm; }
:root {  /* the paper palette, over the dark one */
  --page:#faf7f1; --ink:#1c1a16; --ink-soft:#2e2b25; --dim:#6b6558;
  --meta:#8a8375; --rule:#d8d2c4; --accent:#8a6a2f; --accent-2:#7a5c22;
}
.page { padding: 0; }
.passage { break-after: page; }
.tx-inputs > div, .tx-outputs > div, .footnote { break-inside: avoid; }
```

What the run showed:

- **A valid PDF, paginated.** Five A5 pages from three passages — each
  passage opening a fresh leaf (`break-after: page` honored), the longer
  ones flowing across pages, the manuscript grid fragmenting across the
  page boundary without losing its columns. ~70 KB. **[ran]**
- **The palette is a swap.** The whole page inverted to paper by
  overriding the one `:root` block — the stylesheet is custom properties
  throughout, so paper-vs-dark is an editorial decision, not an
  engineering one. **[ran]**
- **Fonts subset and embed themselves.** The PDF carried every glyph it
  used, subsetted (`BaseFont` names prefixed `AAAAAA+` etc.) — nothing to
  build. **[ran]**
- **And the font list is the finding.** The embedded fonts were
  LiberationSerif (the serif's last fallback — no Newsreader anywhere in
  the render environment), DejaVu Sans, DejaVu Sans Mono, FreeSerif, and
  WenQuanYi Zen Hei: the body text fell back past Georgia, and the sigla
  (⧉ ∇ ⌗ ● □ ₿ …) scattered across four system fonts, whichever happened
  to cover each glyph. **[ran]**

That last point is the one real gap, and it is not new: `passageHtml` ships
no `@font-face` and no font link — the live app fetches Newsreader, IBM
Plex Mono and Public Sans from Google Fonts (`web/bitcoin-book.html`), but
the card renderer renders whatever the CI image has installed, and always
has. **[read]** A card wears this quietly; a PDF does not — it is a
document people zoom, keep, and print, and it embeds its fallbacks
permanently. Fixing it fixes the cards too, which is why it is the first
step below.

## What a printed leaf forces

1. **Bundle the fonts; stop depending on the machine.** Newsreader and IBM
   Plex Mono are both under the SIL Open Font License and can be vendored
   as woff2 with an `@font-face` block in `passageCss` — one block, and the
   card and the PDF set the same on every machine. The sigla need a
   deliberate coverage audit against the chosen stack: the page's glyphs
   run well past Latin (⌘ ⓪ ⋔ β ■ □ § ‡ ₿ ⧉ ∇ ° ∅ ● † ‖ ⋯, the
   superscripts and subscripts), and today each falls to whatever covers
   it. Either the stack is chosen to cover them, or a known fallback (DejaVu
   is a reasonable one) is vendored explicitly so the fallback is at least
   the *same* fallback everywhere. **[read]**, coverage gap **[ran]**
2. **Choose the leaf's palette.** The dark page is the screen's
   (`--page:#08080a`); toner argues for paper. The swap is one `:root`
   block **[ran]**, so shipping both — a screen PDF and a print PDF — costs
   nearly nothing but doubles the artifacts. **[open]**
3. **Pagination is break rules, not new layout.** The unpinned page flows;
   `@page` sets the leaf, `break-after` opens each passage on a fresh one,
   `break-inside: avoid` keeps a margin-cite with its script and a footnote
   whole. The PoC's grids fragmented cleanly **[ran]**, but real sections
   are longer and stranger than the fixture — a section with eighty inputs,
   a blockquoted inscription — and CSS fragmentation inside grid is the
   part of the engine to distrust first; test with the real curated set
   before trusting it. **[doc]**
4. **Running furniture.** Chromium does not implement the `@page` margin
   boxes (`@top-center` etc.); running heads and PDF page numbers go
   through `page.pdf()`'s `headerTemplate` / `footerTemplate`. **[doc]**
   Two numbering schemes will coexist and must not be confused: the book's
   folios (`web/btc-pages.js` — the chain's running transaction count, a
   property of the passage) and the PDF's own leaf numbers (a property of
   the artifact). Both can be printed; the colophon already carries the
   citation per passage, and the footer should carry the leaf number and
   nothing borrowed. **[read]**
5. **The size caps apply as they do to every static rendering.**
   `MAX_ENCODE_BYTES` (8 KB) in the pre-renderer and `FOOTNOTE_MAX_CHARS`
   (2,000) in the page renderer exist because an inscription can run to
   megabytes of prose; the edition inherits them, and the elision is
   stated in the book's own idiom (⋯, "the live page renders it in full")
   rather than performed silently. **[read]**
6. **The terms leaf rides in front.** An edition binds three licenses into
   one file: the prose and sigla (CC0), the curation and the book's own
   notes (CC BY 4.0, credited), and commentary by others (theirs, named).
   The front matter already says all of this (`web/bitcoin-front.html`'s
   terms leaf); the edition opens with the title leaf and the terms the
   way the front matter orders them, and every commentary block keeps its
   `by:` credit exactly as the markdown passages already do. **[read]**
7. **Versioning is already solved.** Every deploy is a release
   (`vYYYY.0M.0D.HH`); the deploy computes the version before the passages
   render, so the exporter stamps it on the title leaf and into the
   filename or `/version.json`'s sibling. The step must be
   `continue-on-error` exactly as the cards are: a PDF must never block
   the site. **[read]**

## The paths not taken

- **Pandoc / LaTeX over `web/passages/*.md`.** The markdown exists, but it
  is deliberately the flattened text (`htmlToText` strips the marks'
  markup, the grid, the illuminated initial) — a second typesetting system
  would re-set the book from its plainest rendering, need its own sigla
  font work in TeX, and drift from the page the moment either moved.
  Rejected: the book already owns a typesetter.
- **`@media print` on the live reading page** — *as the way to make the
  edition.* It is not: the edition is a deploy-time artifact, bound in
  contents order, and no reader's browser is going to assemble it. But as
  the way to put **one passage** in a reader's hands it is exactly right,
  and it now exists (see below) — the same conclusion this section reached,
  read the other way round.
- **wkhtmltopdf and kin.** Unmaintained engines with none of the CSS the
  page already relies on, solving a problem the house Chromium has already
  solved. Rejected without ceremony.

## The passage in the reader's hands — built

A printer mark at the left corner of a section's own title, level with the
bookmark ribbon at its right and in the same faded gold: it writes the
passage in front of the reader to a PDF, the whole transaction with its
footnotes, set as a page of the book. The
mark is inline SVG on `currentColor` — drawn, not typed, because no font
the book carries has a printer glyph and a typed ⎙ would fall back to the
reader's machine (or to a colour emoji); the bookmark ribbon in the same
head is built the same way. Its name lives in `aria-label` and `title`,
and the busy state dims the mark rather than relabelling it, since writing
text into that button would delete the drawing.
`web/bitcoin-book.html` — the button, the `@media print` block, and
`exportPassage()`; guarded by `tools/export-passage.test.mjs`.

**Nothing draws a PDF.** The page already typesets a transaction, the fonts
are served from this origin, and `@media print` says what paper changes;
handing that to the browser's own print pipeline gives a PDF that is the
book's real typography. A PDF library in the page would have meant a second
implementation of the manuscript grid, the fonts embedded a second time,
and a megabyte of dependency to keep in step with the first — for a worse
result. The reader's Save-as-PDF is one dialogue away.

Where it sits is the argument for what it is. It belongs to the passage,
not to the app, so it rides the passage's own title rather than the
running head — the two marks a section carries, one at each corner, in one
weight of gold: the ribbon offering to keep the place, the printer to take
it away on paper. Level is a fact rather than a measurement, both being
absolute against the title that hosts them; and because `renderChapter`
empties that title on every section, the mark is find-or-create like the
ribbon (`printMarkOf`, beside `ribbonOf`). A leaf and a tombstone rebuild
the title without one, which is how they come to have no offer at all —
no hide to keep in step. **[read]**

Two things had to happen before the dialogue opens, and they are why this
is a function rather than an `onclick="print()"`:

1. **The prose has to exist.** This was the real hazard, and the one the
   note called out from the start: pushes are encoded on scroll, so a
   passage opened and immediately exported would print ⋯ for everything
   the reader never reached. `lazyEncode.fillAll` encodes the lot first.
   Measured on the pizza transaction (§2 of ■596, 23 KB): **126 deferred
   pushes before the click, 0 after.** A `beforeprint` listener does the
   same for a reader who just hits ⌘P. **[ran]**
2. **The file has to have a name.** Browsers take the PDF's filename from
   `document.title`, so it becomes the citation for the duration of the
   dialogue and is put back after: `I β29 ■596 §2 — Bitcoin Pizza Day`
   rather than a third copy of the site's own title. **[ran]**

A print-only colophon closes the leaf, because a page that leaves the book
should say what it is: the citation, the transaction id, the URL it came
from, and the terms — the prose is a translation of these bytes and is
public domain; any commentary is its author's.

Verified end to end against fixture chain data: all chrome gone (masthead,
both nav bars, menus, bookmark and keep ribbons, the button itself), the
manuscript grid and illuminated initial intact, the balance line settled
out of its sticky seat, the carousel's `overflow: clip` released so the
passage is not truncated at one screen, and the palette inverted to ink on
paper by overriding the one `:root` block. **[ran]**

One bug worth recording, because it fails silently and the test now pins
it: `#print-colophon` is `display:none` for the screen and `display:block`
inside `@media print`. Equal specificity — so with the base rule written
*after* the media block it won there too, and the colophon simply never
appeared on paper, with nothing anywhere reporting it.

## The recommendation

Three small steps, each shippable alone:

1. **Vendor the fonts.** Newsreader + IBM Plex Mono as woff2 (plus the
   chosen sigla-coverage fallback), an `@font-face` block in `passageCss`,
   fonts loaded from the repository rather than any network. This
   improves today's cards and og-images on its own, before any PDF exists.
   *Done — `web/fonts/`, with the sigla fallback built as five subset
   faces under one family (`Book Sigla`) covering the renderer's whole
   glyph inventory; see `web/fonts/README.md`. Re-verified here: the
   proof-of-concept PDF re-run against the vendored block embeds
   Newsreader, IBM Plex Mono, and the Book Sigla subsets exclusively —
   no system fonts.* **[ran]**
2. **`tools/export-pdf.mjs`.** The third consumer of the one renderer:
   takes what `renderEntry` already returns, composes the edition (title
   leaf, terms, contents rows, passages in contents order, commentary
   ruled off), applies the print overlay, and calls `page.pdf()`. The
   overlay is pure CSS over `quote.mjs`, so it tests offline on the
   fixture fields exactly as the renderer test does, skipping when
   Playwright is absent.
3. **The deploy step.** After the pre-render, optional, stamped:
   `web/book-of-bitcoin-vYYYY.0M.0D.HH.pdf` shipped beside the passages it
   binds. Per-passage PDFs at the citation paths
   (`/III/2/5/1/passage.pdf`) can follow if anyone wants them. **[open]**

## Open questions for the editor

- **Paper, dark, or both?** The palette is one variable block either way.
- **The leaf.** A5 was the proof's arbitrary choice; a US trade 6×9in is
  the other obvious candidate. The CSS does not care.
- **Does commentary ride in the edition?** Including it makes the PDF the
  full curated book and obliges the CC BY credits (already carried);
  excluding it makes a record-only edition, purely CC0. The passages
  markdown includes it, ruled off — the edition following suit is the
  consistent default.
- **Is the PDF a release asset or a site file?** The deploy tags a release
  after shipping; the PDF could ride gh-pages beside `version.json`, or be
  attached to the tag, or both.
