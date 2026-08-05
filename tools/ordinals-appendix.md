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
  renders what the witness carries: an image as the figure, text in
  place, any other kind named rather than pretended — and, for a
  manifest, the members it names rather than the naming itself.
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
5. **The collection.** [convention] Here two different conventions are
   often confused, and the book should not confuse them:
   - **ord's own** mechanism is *provenance*: a child inscription names
     its parent in envelope **tag 3**, and ord accepts the claim only if
     the parent inscription is spent in the same transaction — so the
     link is made on-chain and is checkable. Ord also defines **tag 5**,
     `metadata` (CBOR), for on-chain metadata it will render itself.
     [convention, but ord's own and verifiable]
   - **The JSON manifest** — a body shaped `{"meta": {…}, "data":
     [{"id": "<txid>i<n>", …}]}` — is **not** an ord standard. It is a
     marketplace convention for registering a collection: the manifest
     is inscribed, a marketplace reads it, and the grouping exists
     because that marketplace says so. Nothing on-chain binds a member
     to it. (Which marketplace first defined the shape is not
     established here; treat the format as folk-standard.)

   Museum Outdoor is the second kind, and demonstrably so: its manifest
   and its members carry **tag 1 alone** — a content type and nothing
   else [verified 2026-08-05, read off the envelopes]. No parent tag, no
   metadata tag. The hundred photographs are a collection only because a
   JSON file in a witness says they are, and because somebody chose to
   read that file. A manifest is the most bookish object in the whole
   subject — a table of contents written into a witness — and the worked
   example below is one.

   This is why the book names a JSON body by the name it carries but
   files that name as the content's own word for itself rather than as a
   reading of the bytes: `witnessAsset` returns `source: 'name'` there,
   distinct from the `'bytes'` a magic number earns.

   **Is the rest of a collection identifiable without its manifest?** For
   Museum Outdoor, no — and that is not a gap in the book's reading, it
   is the shape of the thing. Read any one of its members and you have a
   JPEG in a witness: nothing in the envelope, the transaction or the
   output says which collection it belongs to, or that it belongs to one
   at all. The only thread is the manifest, and it runs one way — the
   manifest names the members; no member names the manifest. Lose the
   manifest and you lose the collection.

   That is a property of the marketplace convention, not of ordinals.
   A collection built on ord's **provenance** (tag 3) is identifiable from
   any member: the child carries its parent's inscription id, the parent
   had to be spent in the same transaction for ord to honour it, and the
   membership is therefore on-chain and checkable in either direction.
   Reading provenance is a natural next step for this part, and unlike a
   manifest it would let the book say "this belongs to that" as record
   rather than as somebody's claim.

## Already in the book

The subject is not arriving cold; it is arriving with entries and a
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

Appendix IV gathers these threads under one heading rather than re-stating
them: the first two are its entries, and the other two stay where they are —
a block's weight belongs to that block's row, and a fork belongs to
Appendix II.

## The worked example: a collection manifest

**Not a shipped entry.** Museum Outdoor is the collection this part was
built against, and it earned its keep as an example: it exercised the
manifest reader, the collection title page, the run of works, and the
naming rule, and every one of those still stands. But the book has no
business curating somebody's photo collection, so the row was removed
(see "What a reader keeps", below). What follows is the example as it was
read, kept because the findings are what the machinery was shaped by.

A collection index written whole into one witness. All chain facts [verified] 2026-08-04, and every one of them
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
   learned `'inscriptions'`, family `appendix` (it holds the book's own
   matter out of reading order, so it wears a numeral). Entries are
   places, so `normalizePlace` already parsed them; what the kind adds is
   `reveal:`, the one coordinate the citation's arithmetic cannot supply,
   validated as 64 hex. No fork machinery: no bits, ballots, or windows,
   because nothing here was ever voted on — which is rather the point.
   The part sits after the Ledgers index, so it is Appendix IV: a
   numeral now counts a part's place among the whole back matter, an
   index or the Citations register occupying a place without printing
   one (`partNumber`, shared by `partLabel` and the appendix leaf, which
   had been computing the same thing a second way).
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
   same mirrors everything there reads, parses the envelope, and shows
   the body: an image as the plate, text as text. Nothing else — no card
   of declarations above it, no gloss beneath. What the envelope says of
   itself (its type, its length, the input it rides) is the witness's own
   matter, and the witness is one turn away in the book, set out push by
   push in the book's own notation; the leaf's subtitle is that door. A
   leaf that reprinted those declarations would be describing the content
   instead of showing it. The one line that survives is the status the
   content replaces — and it stays only where there is nothing a plate
   can show (a compressed body, an unrenderable kind, a witness that will
   not answer).
4. **A manifest, shown as what it names.** A collection manifest is the
   one body the leaf does not display: it carries no content, only ids
   and whatever the collection says about itself. `parseCollection`
   hands those back apart, because they are different registers — the
   ids point at further witnesses the chain holds, the `meta` is the
   collection speaking about itself into the same breath, checkable
   against nothing. So the manifest gets **two levels**:
   - **Its title page** (`?ins=<reveal>`) takes the name the collection
     gives itself as the leaf's own title, and sets the rest of the
     `meta` beneath it as a form — the fields as written, in the
     manifest's own order, a link followed, an id or a key in the mono
     the book gives every raw string. Repeated, not vouched for.
   - **The works** (`&item=n`), one level below, where the ▾ leads:
     one work to a leaf, turned to sideways the way every run in this
     book is turned. The head carries the work's name and, beneath it
     and above the rule, its **citation** — the chapter, the section
     and the footnote its envelope reads at, resolved from the
     member's own merkle proof (the height, and the position in the
     block that IS the §section) with the footnote letter counted off
     the witness-bearing inputs, which is how the book letters its
     notes. It is the one line on the leaf the chain answers for, and
     the door back into the book at that footnote. Then the image, and
     beneath it the manifest's caption — the same form the
     collection's own statement takes one level up, because it is the
     same kind of claim: somebody's words about something the chain
     holds. A quotation is set as one and keeps its line breaks; the
     first work of Museum Outdoor quotes the line painted on the door
     it photographs.

     **The run closes at both ends.** A sideways turn walks the works
     and only the works; the way out is the ▴ and the pull-down, to
     the title page that names them. Turning left off the first work
     used to land on that page, which reads as a sideways move but is
     a level up — and pressing on from there walked out through the
     sibling inscriptions and into the neighbouring appendix, so a
     reader paging back through a collection could leave it without
     ever meaning to. The ballot's block leaves already settle this
     question the same way: a run turns within itself.
   - **The chrome stands down** at the level of one inscription and
     below. What is shown there is a picture, or a page of somebody's
     text, and it should be met as that rather than framed by a row of
     links offering three other places to be. Nothing is lost: the
     crumb above the title climbs, the ▴ and the pull-down ascend, and
     the masthead's own name stays as the running head.

   One leaf is one reveal fetched, which is the whole reason the works
   are a run rather than a page: a member is ~100 kB with the
   photograph in its witness, and a hundred of them at once is
   megabytes nobody asked for. A leaf whose run is not known until
   something is fetched wires its neighbours late (`setTurns`), so the
   swipe, the arrow keys and the foot's links all still agree.
5. **The contents row.** `web/bitcoin-contents.html` — a sub-line for the
   new kind and a row builder, placing through the same map the volumes'
   rows read, so a lookup runs once for both registers. The rows open the
   inscription's leaf, not the book: what this register has to show is
   the witness read whole, and the leaf carries the one door onward.
6. **The shell.** `web/sw.js` — the new module joins the precache list
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
Both were parsed end to end for this file: the reader finds the envelope
in each, and the declared types and body lengths match what the indexers
report. (A third, the Museum Outdoor manifest, was carried here for a
while and then removed — see the worked example above.)

The part deliberately lists no inscription's number, sat, or current
location: those are ord's readings, and a row that stated them would
claim more than the witness it cites. Where the editor wants them, they
belong in commentary, credited — the way the Ledger sets apart every
claim about a name.

## The formats this part reads

More than one convention writes into an ord envelope, and the book reads
several rather than assuming the one its example happened to use:

| what | where | register |
| --- | --- | --- |
| content type | tag 1 | ord's own; the inscriber's claim about the bytes |
| content encoding | tag 9 | ord's own; says the body is compressed |
| **parent** | **tag 3** | **ord's own, and checkable** — provenance |
| **metadata** | **tag 5** | **ord's own** — CBOR, a document about the inscription |
| **metaprotocol** | **tag 7** | ord's own; names a scheme layered on top |
| delegate | tag 11 | ord's own; the content is another inscription's |
| collection manifest | the BODY, as JSON | a marketplace convention, not ord's |
| the format itself | the body's first bytes | the chain's — a magic number |

The two in bold are new, and they change what the book can say. A manifest
is somebody's JSON and reads as a claim; tag 3 and tag 5 are written into
the envelope under numbered tags, in ord's own grammar. **Provenance is the
one membership claim that is checkable**: ord honours a parent only when
that parent inscription is spent in the same transaction, so the link is
made on chain and holds in both directions.

Naming follows the same order of authority: a name in tag 5 outranks a name
found inside a JSON body, because tag 5 is *about* the inscription while the
content is merely the thing itself. `witnessAsset` reports which it used
(`source: 'metadata' | 'name' | 'bytes' | 'declaration'`).

**Verification status, stated plainly.** The manifest format and the
magic-number sniffing were read off real inscriptions. Tags 3, 5 and 7 were
**not** — no live instance turned up to test against. The blocks scanned
for this file carried tag 1 and nothing else: 95 envelopes in the tail of
block 812628 (October 2023), plus ~800 transactions of a 2025 block that
held no envelopes at all. So the encodings here follow ord's specification
and are exercised byte by byte in `tools/inscriptions.test.mjs` against
composed envelopes, not against the chain. The id encoding in particular —
a reversed txid, then the index as a little-endian integer with trailing
zeroes dropped — deserves a real example before anything leans on it.

## What a reader keeps

The Museum Outdoor row is gone, and nothing replaced it. The part curates
the inscriptions the book has something to say about; a hundred street-art
photographs are not that, and the machinery the collection exercised does
not need a shipped example to stay reachable.

What replaces curation is the reader's own keeping, and it already works
end to end [verified in the browser, 2026-08-05]:

1. A witness that carries an asset is named in the reader — by the name a
   JSON body gives itself, or by what its bytes announce — and that name
   line is a door to the inscription's leaf.
2. The footnote's ribbon keeps the witness, asking for a title as it does
   for every other kept place. The reader's name overrides whatever the
   bytes were called, and persists.
3. The name, theirs or the book's, opens `?ins=<reveal>` — which takes any
   reveal, curated or not, and reads it off the chain. A manifest kept
   that way opens as the collection it names, works and all.

So a reader can keep Museum Outdoor themselves, under whatever name they
give it, and the book neither ships it nor stands in the way. The one
thing the leaf does NOT yet do is wear the reader's name for it — it
titles itself from the content, and the bookmark's name lives in the
reader. That is a small change if it is wanted.

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
