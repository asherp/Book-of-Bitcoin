<!-- SPDX-License-Identifier: MIT OR Apache-2.0 -->

# An appendix for Ordinals

Research behind the Inscriptions part of the back matter: files written
into witnesses and read back out by software that agrees where to look. The
chain never says "inscription": it says which bytes a witness carried and
which script they satisfied, and everything past that — the envelope, the
numbering, the collections, the market — is a convention held by people,
not a rule held by nodes. The book already knew this (see
`web/commentary/first-ordinals-inscription.md`) and already cited two
inscriptions as witness places; this file walked the step from two curated
footnotes to a gathered part, and the part now exists. What this file
supports:

- **`web/appendix.yaml`** — the Inscriptions part (`kind: inscriptions`),
  whose entries were drafted here first: each cites the witness footnote
  its envelope reads at (`§n.a`) and names its `reveal:`, the transaction
  the leaves fetch and parse.
- **`web/btc-inscriptions.js`** — the envelope reader the leaves share:
  the tapscript out of the witness, the `OP_FALSE OP_IF … OP_ENDIF`
  branch out of the tapscript, the content type and body out of the
  branch. Tested offline in `tools/inscriptions.test.mjs`, and validated
  against all three reveals below.
- **`web/bitcoin-appendix.html`** — the part's leaf (the shelf) and each
  inscription's own leaf (`?part=inscriptions&ins=<reveal>`), which
  renders what the witness carries: an image as the figure, text and JSON
  in place, any other kind named rather than pretended.
- The editorial rule this file obeys: a story not yet checked against the
  chain stays a note here rather than becoming published commentary.
  Publishing is the assertion.

Every claim carries where it came from:

- **[verified]** — read off the chain for this file, 2026-08-04, via
  Esplora-compatible APIs (blockstream.info, mempool.space): the
  transactions, their witnesses and values, and their block positions.
- **[rule]** — consensus or a BIP: true of every block, or the block is
  invalid.
- **[convention]** — the ord software's reading, or a marketplace's: held
  off-chain, checkable against the witness bytes it reads, and revocable
  by anyone who reads them differently. An inscription's *number*, its
  *sat*, and its *collection* all live here. Say so out loud — this
  register is the whole editorial difficulty of the subject, and the
  reason the appendix should exist: nowhere else in the book is the gap
  between what the chain records and what people read into it this wide.
- **[reported]** — secondary sources, not yet re-checked against the
  chain here.

## The grammar of an inscription

What the chain holds, layer by layer, from rule to reading:

1. **The witness.** [rule] SegWit (BIP 141) moved the satisfying data out
   of the transaction body and discounted its weight; Taproot (BIP 341)
   lifted the old script-size limits from the spending path. A tapscript
   witness can therefore carry tens of kilobytes of data cheaply, and a
   block up to nearly 4 MvB of it. Both forks are already gathered in
   Appendix II (`web/appendix.yaml`, BIP 141 and BIP 341), which is where
   an inscriptions part would point for its preconditions.
2. **The envelope.** [convention] ord wraps content in an unexecuted
   branch — `OP_FALSE OP_IF … OP_ENDIF` — inside a tapscript: pushes
   carrying the string `ord`, a content type, and the body, skipped by
   every validating node precisely because the `IF` is false. Consensus
   checks the script spends; it never reads the branch. The envelope is
   the whole trick: data that rides a valid spend without being executed
   by it.
3. **The identity.** [convention] An inscription is named by its reveal
   transaction and an index — `<txid>i0` — and numbered by the order ord
   first saw it. The book needs neither: its own citation scheme already
   names the same place as chapter, section, and witness footnote
   (`§n.a`), which is how the two existing entries cite.
4. **The sat.** [convention] Ordinal theory assigns each satoshi a number
   by mining order and tracks it first-in-first-out through spends; an
   inscription "lives on" the first sat of its reveal output and travels
   with it. The chain shows only the spends. Any statement about where an
   inscription now sits is ord's reading of the record, and the book
   should credit it the way it credits a signaling monitor's count: a
   claim, named as whose.
5. **The collection.** [convention] A collection is itself an inscription:
   a JSON manifest listing member inscription IDs with editorial
   attributes, recognized by marketplaces rather than by any rule. A
   manifest is the most bookish object in the whole subject — a table of
   contents written into a witness — and the worked example below is one.

## Already in the book

The subject is not arriving cold; it is arriving with three entries and a
consensus group already on the shelf:

- **First Ordinals inscription** — IV β69 ■343 §2323.a (`web/notables.yaml`,
  commentary `first-ordinals-inscription.md`): the reveal in block 767430,
  cited at the footnote where the envelope's bytes read.
- **First BRC-20 inscription** — IV β75 ■649 §408.a: the ordi deploy,
  block 779832, same grammar.
- **Largest block (at the time)** — block 774628 (commentary
  `largest-block-at-the-time.md`): what the envelope did to block weight.
- **BIP 341 · Taproot** — Appendix II's group: the fork whose script
  freedoms the envelope rides.

The Inscriptions part gathers these threads under one heading rather than
re-stating them: the first two are its first two entries, and the other
two stay where they are — a block's weight belongs to that block's row,
and a fork belongs to Appendix II.

## The worked example: a collection manifest

The entry this file was opened for — a collection index written whole into
one witness. All chain facts [verified] 2026-08-04, and every one of them
re-read at page load by the leaf itself, off the reveal's own bytes; the
content readings that go past those bytes are [convention], via ord-aware
indexers (ordinals.com, ordiscan.com), quoted as their claims.

**Transaction** `40e261fc856304d5c26c2cb1dd2e21bab6e15101de47f125a88d5a2398c19414`
[verified]:

- Mined in block 812628 (hash `…b98e51fa`), 17 October 2023 15:35:11 UTC,
  at position 1244 of 1,303 transactions — the book's IV β91 ■1189 §1245.
- One input, one output. The output: 10,000 sats to the P2TR script
  `bc1pssaf2k4nydpqcgfdkhqyee4hsme4t0er5gq6g2gz8p04w2e4rgfsf5qpex`.
  Fee 16,117 sats — the fee exceeds the output, which is the shape of a
  reveal: the value is the payload, not the payment.
- The single witness carries three items: a 64-byte signature, a
  41,654-byte tapscript, a 33-byte control block. The tapscript is the
  envelope; inside it, a 41,353-byte `application/json` body.

**The body** [convention, read via ord]: the manifest of "Museum
Outdoor" — a collection of 100 street-art photographs. A `meta` object
names the collection (name, supply, slug, icon inscription, description,
a website, a Nostr public key, and a provenance disclaimer); a `data`
array lists 100 member inscription IDs — 100 further reveal
transactions — each with editorial attributes: the artist credited
(ROA, Okuda San Miguel, Seth Globepainter, Hueman, and others; some
"Unknown"), the city (Las Vegas, Miami, Houston, San Juan, Hong Kong,
San Francisco, and more), the date, the print dimensions. Ord numbers it
inscription 35,323,878 [convention].

**What it teaches, editorially:** the manifest is a table of contents —
supply, members, attributions, a disclaimer about attribution honesty —
inscribed into the same kind of place its members occupy. A book whose
appendix gathers inscriptions can point at this one and say: here is the
convention describing itself. And the gap between registers is on
display: the chain holds the 41,353 bytes [verified]; that they name 100
photographs, and who painted the walls in them, is the manifest's own
claim [convention], with a disclaimer saying exactly that.

**Where it now sits** [convention]: ord tracks the inscribed sat onward
from the reveal — at the time of reading, to output
`7a46c33e…e51decdf:0`, a 9,802-sat output. The chain shows the spends;
the "location" is ord's FIFO reading of them. An entry must not state a
current location as chain fact, and the book's own grammar agrees: a
notables row cites the reveal, which never moves.

## What the part took

The machinery, in the order it was built — recorded here so the next
editor adding a kind of back matter can follow the same path:

1. **A `kind`.** `web/btc-notables.js`, `normalizePart` — the whitelist
   learned `'inscriptions'`, family `appendix` (numbered among
   appendices: it holds the book's own matter out of reading order).
   Entries are places, so `normalizePlace` already parsed them; what the
   kind adds is `reveal:`, the one coordinate the citation's arithmetic
   cannot supply, validated as 64 hex. No fork machinery: no bits,
   ballots, or windows, because nothing here was ever voted on — which is
   rather the point.
2. **The reader.** `web/btc-inscriptions.js` — the tapscript out of the
   witness (BIP341's second-from-last item, the annex set aside first),
   the `OP_FALSE OP_IF … OP_ENDIF` branch out of the tapscript, the
   tagged fields and body out of the branch. A branch that breaks the
   grammar reads as nothing rather than as half of something.
   `tools/inscriptions.test.mjs` composes its witnesses byte by byte, so
   the suite stays offline.
3. **The leaves.** `web/bitcoin-appendix.html` — the part's shelf
   (`?part=inscriptions`), and each inscription's own leaf
   (`?part=inscriptions&ins=<reveal>`), which fetches the reveal off the
   same mirrors everything there reads, parses the envelope, and prints
   what the witness holds: the declared type, the body's length, the
   input it rides, the block's clock. Then the body — an image as the
   figure, text and JSON in place (JSON re-spaced for the eye), anything
   else named rather than pretended.
4. **The contents row.** `web/bitcoin-contents.html` — a sub-line for the
   new kind and a row builder, placing through the same map the volumes'
   rows read, so a lookup runs once for both registers. The rows open the
   inscription's leaf, not the book: what this register has to show is
   the witness read whole, and the leaf carries the one door onward.
5. **The shell.** `web/sw.js` — the new module joins the precache list
   and the cache bumps, as it does whenever the shell list changes.

## The entries

What the findings above became, in the grammar of the file they joined —
references checked against `tools/check-editorial.mjs`, which now also
insists that an inscriptions row cite a witness footnote (a row citing a
bare chapter would open the book somewhere the envelope is not):

- **First Ordinals inscription** — IV β69 ■343 §2323.a, reveal
  `6fb976ab…2799`: 793 bytes of `image/png` in block 767430.
- **First BRC-20 inscription** — IV β75 ■649 §408.a, reveal
  `b61b0172…5735`: 94 bytes of `text/plain` in block 779832.
- **A collection's manifest** — IV β91 ■1189 §1245.a, reveal
  `40e261fc…9414`, commentary `a-collections-manifest.md`: the 41,353
  bytes above.

All three were parsed end to end for this file: the reader finds the
envelope in each, and the declared types and body lengths match what the
indexers report.

The part deliberately lists no inscription's number, sat, or current
location: those are ord's readings, and a row that stated them would
claim more than the witness it cites. Where the editor wants them, they
belong in commentary, credited — the way the Ledger sets apart every
claim about a name.

## Sources

- Chain data: blockstream.info and mempool.space Esplora APIs, read
  2026-08-04 — the manifest reveal (transaction, witness item sizes,
  block position, fee and value) and the first-inscription reveal's
  block.
- ord-aware indexers, read 2026-08-04: ordinals.com (inscription number,
  content type and length, the current-location reading) and
  ordiscan.com (the collection page the manifest feeds) — all
  [convention], quoted as their claims.
- Casey Rodarmor, the ord project and its handbook — the envelope
  grammar, inscription IDs, and ordinal theory's FIFO sat tracking
  [convention, from the convention's own author].
- BIPs 141 and 341 — the witness discount and the lifted script limits
  [rule]; already gathered in Appendix II.
