<!--
A pull request changing the book's machinery — the pages, the notation, the
tooling, the tests. This is the named form, reached by putting
`?template=code.md&expand=1` on the end of the compare URL; the default a pull
request opens on is the commentary one, because the door the book itself
offers a reader ("Add your commentary", at the foot of every passage) cannot
carry the parameter and that reader must land on the right questions.

So if you are here with a change to the code and the other form loaded
instead, this is the one you want: delete that and paste this in.

CONTRIBUTING.md is the long form; this is the short form, to fill in. Delete
any section that does not apply, and delete these comments as you go.
-->

## The change

<!-- What it does, and where it lives. A sentence or two, then the files if
the diff is spread out. -->

## Why

<!-- What prompted it: a passage that read wrongly, a mark that fit poorly, a
gap in what the page could say. If it came from something visible in the book,
cite it — a height, a transaction id, or the book's own citation
(`III β2 ■5`), so a reviewer can open the same page you were looking at. -->

## What the reader sees

<!-- Only if this changes the page. What is different in front of a reader:
a new mark, a line that moved, a value that now reads one way and read
another before. A screenshot of the passage helps more than a description. -->

## Fidelity

<!-- The book's central claim is that the prose decodes back to the exact bytes
of its transaction, so fidelity wins over fluency every time. If this touches
how bytes reach the page, say how the round trip survives: which bytes moved
register, and what puts them back. A mark that stands in for bytes has to
restore them exactly — that is what earns it the right to be there. -->

- [ ] Every byte still reaches the page exactly once, and rejoins in order
- [ ] Nothing is fabricated: a value that cannot be computed honestly is
      `null`, and the page shows a mark (… ∅ ⋯ ☒) with the claim in its hover
- [ ] No high-entropy value is set in type as hex — a hash, a key, a script, a
      txid, a digest, a preimage is said in prose or shows `…`, and the exact
      bytes travel by the copy menu

## Notation

<!-- Only if a mark is new or revised. The notation is dedicated to the public
domain under CC0: contribute one and you are adding to an alphabet nobody
owns, yours included. -->

- [ ] It follows the existing family conventions — a shared base glyph,
      subscripts distinguishing variants
- [ ] It is an ordinary Unicode character and renders in the book's monospace
      faces
- [ ] It has a row in the notation key (`web/btc-notation.js`) saying what it
      means, in the register a description in notation takes: name the thing,
      do not expound on it
- [ ] Where the mark has no literal of its own for the key filter to match, it
      answers to a synthetic token (`web/btc-key-filter.js`)

## Checks

- [ ] `node --test 'tools/**/*.test.mjs' tools/twitter-bot/test.mjs` passes on
      a bare checkout — no WASM engine, no browser, the tests that need either
      skipping themselves. This is what `git clone && node --test` gives a
      contributor, so it has to stay green in exactly that state
- [ ] `node tools/check-editorial.mjs` passes, if the editorial layer, the
      contents or the appendix moved
- [ ] New behaviour has a test, and it is a `tools/**/*.test.mjs` file — the
      workflow globs the directory, so a new file is covered the moment it
      lands
- [ ] Register followed the destination: code comments state what the code
      does and why, UI strings are brief and neutral, descriptions in notation
      are minimal, and no reader-facing sentence of the book itself is written
      by hand — Glossia generates those from the bytes

## Licensing

Code is MIT OR Apache-2.0, at the user's option. A new or revised mark for the
notation is CC0. Anything written in your own voice is CC BY 4.0 and keeps your
name on it; the three can live in the same pull request and need no separating
out by hand.

- [ ] Unless I have said otherwise below, my contribution is offered on those
      terms
