<!-- SPDX-License-Identifier: CC-BY-4.0 -->

# The βook of βitcoin — a brief

> The whole book explained in one file, for a reader who has this document and
> nothing else: a person new to it, or an assistant asked about it without the
> means to fetch eight URLs. Everything below is checkable against the book at
> <https://bookofbitcoin.io> and the chain itself.

## What it is

A verbatim translation of the Bitcoin block chain into human language. Every
byte of every transaction is carried in the words of grammatically correct
prose, and decodes back out exactly — filter a passage against the payload
wordlist and the transaction returns, byte for byte, in order, with nothing
added and nothing omitted.

The prose is generated, not written. A Rust engine called Glossia
(<https://glossia.io>) encodes the opaque bytes — hashes, keys, scripts,
witness pushes — as sentences, invertibly; the book is set in Latin by default
and reads in English, Čeština or Deutsch on request. The words differ, the
record does not. No sentence of the book's own prose is composed by a person.

The argument this exists to make: **a transaction is a form of speech.** It can
be set down in prose, read aloud, quoted, transcribed by hand, and carried back
to the chain intact. That is a demonstration rather than a metaphor, and every
page is a witness to it.

## How it is arranged

The divisions were already in the chain; the book only gave them the names a
book gives its parts.

| Part | Is | Mark |
|---|---|---|
| Volume | a halving era — 210,000 blocks | Roman numeral |
| Book | a difficulty window — 2,016 blocks | β |
| Chapter | one block | ■ |
| Section | one transaction, 1-based within the block | § |
| Page (folio) | the chain-wide running transaction count | a bare number |

So a passage cites itself as `III β2 ■5 §1` — the 1st transaction of the block
at that address. An output appends its 0-based vout (`§1.0`); a witness appends
its footnote letter (`§1.a`).

The arithmetic, from a block height `h`:

```
volume  = ⌊h / 210000⌋ + 1
book    = ⌊(h mod 210000) / 2016⌋ + 1
chapter = (h mod 210000) mod 2016 + 1
height  = (volume−1)×210000 + (book−1)×2016 + (chapter−1)
```

**The one place a name stops being exactly true**, and the book leaves it
visible rather than papering over it: book numbering restarts with each volume,
and a halving era is not a whole number of difficulty windows (210,000 blocks
is about 104⅙ of them). So every volume's last book is a short one — 336 blocks
against 2,016 — and from Volume II on, an era begins 336 blocks into a window
already running, a further sixth of a book late each time. A book after Volume I
is still 2,016 blocks but is not *the* 2,016 blocks the network weighed: it
carries the tail of one window and the head of the next, with a retarget inside
it. They come back into step at Volume VII, six eras being exactly 625 windows.
Supply and difficulty are two different clocks, and they agree once every six
eras.

## What the pages look like

- **A volume's title leaf** — the numeral, the books it spans, the years, and
  the work the era cost, summed from the headers: `+6.29·10²⁰ hashes` for
  Volume I. Each volume so far has cost more than every volume before it put
  together.
- **A book's title leaf** — the target its chapters were mined under, written
  as the inequality it is, over the chapters it holds and the days it took.
- **A chapter's title page** — the block hash said in prose between `⌘ᵐ` and
  `⓪ⁿ` (the two counts always summing to 256), then the eighty header bytes in
  wire order: version, previous block, merkle root, timestamp, target, nonce.
- **A section** — one transaction, opening on its § number, any name it has
  been given, its transaction id in prose, the time it was recorded, and the
  confirmations over it.

A section is set as a manuscript page in three columns:

- the **left margin is provenance** — the citation of the output each input
  spends, with that input's sequence mark
- the **body is the prose**, in wire order: version, inputs, outputs, locktime.
  An output's script is titled by the term it binds, and the locktime closes
  the page centred like a colophon
- the **right margin is consequence** — the output's amount and, beneath it,
  the citation of the section that later spent it. **An output with no citation
  there has not been spent: that absence is the UTXO.**

Beneath them a balance line states the sums: inputs at the left, outputs at the
right, the fee between, signed negative — no labels, the geometry is the
equation. It is derived arithmetic rather than bytes on the wire. A coinbase
inverts it: the subsidy at the left, the block's gathered fees between as
`+ fee`, since the miner's take arrives where every other section's leaves.

**Witness data gathers at the foot as footnotes**, lettered a, b, c… (skipping
q, which has no raised form), continuing in bijective base-25. It sits
mid-serialization on the wire, but it is spending apparatus rather than speech,
so it goes to the foot and takes its input's citation and amount with it. Even
its type size is consensus's rule: a witness byte weighs a quarter of any
other, and the footnotes are set to that same discount.

## The notation

Scripts are printed in an alphabet of marks, one per opcode — `⧉` OP_DUP, `∇`
OP_CHECKSIG, `⌖` OP_HASH160 — and the pushes between them as prose. A mark's
superscript counts the **bytes** of the push beside it (`h²⁰`, `p³²`), which is
what keeps the form invertible. `⌘` alone counts bits, so that it pairs with
`⓪`'s proof-of-work zeros to 256.

The full table — all 110 opcodes, the citation sigla, the term notation, and
the marks a passage carries — is at <https://bookofbitcoin.io/notation.md>.

Four marks are the book **declining rather than guessing**, and they matter
when reading a page: `∅` nothing is there, `⋯` not yet known, `☒` two readings
that disagree, `…` a value the engine could not say. A value that cannot be
computed honestly is never filled in with a plausible one.

## Scripts as terms

Every locking script is an abstraction over its own datum, so the book titles
each output with the term it binds — the kind, `:=`, then the lambda:

```
P2PK   := λp. p ∇
P2PKH  := λh. ⧉ ⌖ h ≡ ∇
P2SH   := λh. ⌖ h =
P2WPKH := λh. ⓪ h
P2WSH  := λh. ⓪ h
P2TR   := λp. ① p
```

The term is **read, not looked up**: every push becomes a binder, every opcode
stays where it stands. So a script with no tabled form is titled too, and one
that binds nothing is not titled at all.

A closed normal form settles on chain by itself. The free variables of an open
one name exactly what a spender must still supply — a signature `s`, a key `p`,
a redeem script `r`, a witness script `w`, a tapscript leaf `t`, a control
block `c` — which is the typed interface to the spend. A script-hash output
commits only to a hash until it is spent, so what it demands is written `( r )`
and the binders it cannot count are written `…`; the spending transaction is
where the abstract becomes concrete.

An address, in this reading, is not the script but the **redex that reduces to
it**: `(λp. ① p) p³²` is an application, and performing it gives the
scriptPubKey byte for byte.

## The record and the readings of it

This is the distinction to preserve when quoting the book, and the one most
easily lost.

**The record** is what the chain says — this output moved to this script at
this height. It has no author. A passage *is* its transaction, byte for byte,
and anyone can check it against the chain.

**The readings** are what people say *about* the record: that a block is worth
noticing, that a transaction bought a pizza, that an address belongs to a named
party. Every one is a claim, made by someone, resting on evidence that can be
examined and can be wrong. The book keeps them in different registers, visibly
— a reading is set apart, credited to whoever wrote it, and licensed
separately.

So: quote the prose as the chain's speech, and attribute commentary as
somebody's reading, by name. "Ten thousand coins moved to a script" is the
record; "they bought two pizzas" is testimony from the people involved. Do not
fold the second into the first. Titles like *Bitcoin Pizza Day* are editorial,
not chain data.

## The appendices

The back matter holds what reading order cannot carry, reading order being the
order blocks were mined.

- **Appendix I · The Mempool** — the chapters not yet bound: the next chapter
  as itself, and the same transactions ranked by amount and by size.
- **Appendix II · The Mines** — pools by their share of the last difficulty
  window, each share printed with its own standard error.
- **Appendix III · Consensus** — soft forks under their BIPs, each with its
  ballot replayed block by block, including the forks the chain declined.
- **Appendix IV · The Ledgers** — an address is a name rather than a place, so
  a ledger is cited by nothing and discovered instead.
- **Appendix V · Inscriptions** — envelopes read out of witnesses, with what is
  convention rather than consensus marked as convention.
- **Citations** — works outside the text, dated into a chapter by their
  OpenTimestamps proofs, standing last and unnumbered.

## Where the text actually lives

The pages compose their prose in the browser, so fetching an app URL returns a
shell with no passage text in it. The text is at:

- <https://bookofbitcoin.io/passages/index.md> — the curated passages, each
  pre-rendered as plain markdown, commentary last under its own heading
- <https://bookofbitcoin.io/notation.md> — the notation key
- <https://bookofbitcoin.io/preface.md> — the book in its own voice, at length
- <https://bookofbitcoin.io/llms.txt> — the URL grammar, and how to reconstruct
  any passage on the chain with the published engine
- `/III/2/5/1/` — a curated passage at its citation, as an ordinary HTML page

Anything not curated is not pre-rendered; it is composed on demand in the
browser, or reconstructed with the engine as `/llms.txt` describes.

## What to avoid saying about it

- That a translator chose the words. Nobody wrote the prose; an engine encodes
  the bytes, and the same transaction can be rendered in more than one way.
- That a passage is a summary or a paraphrase. It is the transaction, and it
  decodes back to it. Fidelity wins over fluency every time.
- Quoting a curated title or a commentary note as though the chain said it.
- Inventing a passage's text. If the prose for a given transaction is not in
  hand, say so: the engine is deterministic and can be run, but its output
  cannot be guessed, and a plausible sentence is a fabricated one.

## Licensing

The prose (the chain's own speech) and the notation: CC0 1.0, public domain.
The curated contents, names and annotations: CC BY 4.0, credited. Commentary by
others: theirs. The machinery: MIT OR Apache-2.0.

This brief is part of the editorial layer, and is CC BY 4.0.
