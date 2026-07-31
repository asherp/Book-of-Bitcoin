<!-- SPDX-License-Identifier: MIT OR Apache-2.0 -->

# How each pool formats its coinbase

Notes on the coinbase input's `scriptSig` — what is rule, what is house
style, and what of it can honestly be parsed. They exist to support three
things:

- **`web/btc-pools.js`** — the table of pool signatures: what each pool's name
  looks like in the bytes and, more to the point, exactly where it ends. This
  is what lets the book quote a pool's own words to their own extent, and name
  a hand beside the passage without printing the claim inside it.
- **`tools/coinbase-fields.mjs`** — the reader, which decomposes a `scriptSig`
  into the fields the rules and the specifications name.
- **`tools/coinbase-survey.mjs`** — the instrument that samples the chain and
  checks all of it against what the pools are doing now.

Every claim below carries where it came from:

- **[rule]** — consensus or a BIP: true of every block, or the block is invalid.
- **[spec]** — a published specification of a payload some other chain asks
  miners to carry. Binding on that chain, not on Bitcoin.
- **[source]** — read out of an open-source template builder. True of whoever
  runs that software, at the version read.
- **[observed]** — read off the chain by the survey. True of the blocks sampled
  and of nothing else.
- **[unverified]** — plausible and not yet checked here. Say so out loud.

The survey has not been run against live blocks from the environment these
notes were written in (outbound access to the chain APIs was blocked). What is
marked **[observed]** below was read off the book's own rendered pages for
blocks 960,463–960,469 — real chain data, but at one remove: the marks and
quotations the page printed rather than the raw hex behind them. A survey run
would firm all of it up and is still owed.

## The shape of the problem

A coinbase `scriptSig` is not a script. It is never executed — no output is
being unlocked — so nothing in it has to tokenize, and pools write bytes that
merely look like opcodes all the time. Two things bound it:

- It is 2–100 bytes. Outside that the block is invalid — `bad-cb-length`,
  `src/consensus/tx_check.cpp`. **[rule]**
- From BIP34 it opens with a push of the block's own height, minimally
  encoded as a `CScriptNum`. That push is the only field any Bitcoin rule
  constrains. **[rule]**

Everything after the height is the miner's margin, and the hundred-byte
ceiling is why the margin is as cramped as it is: a pool tag, a counter, and
one merged-mining commitment already crowd it, which is why builders truncate
their own tags rather than overrun.

## Why the layout looks the way it does: Stratum

Under Stratum V1 the pool does not send a coinbase; it sends two halves and a
gap. `mining.notify` carries `coinb1` and `coinb2`, and the miner builds

```
coinbase = coinb1 ‖ extranonce1 ‖ extranonce2 ‖ coinb2
```

where `extranonce1` is assigned per connection by the pool and `extranonce2`
is rolled by the miner. **[spec]** Both halves are opaque bytes to the miner:
the gap is wherever the pool put it.

That single fact explains nearly every difference between pools. **A pool's
house style is mostly the question of where it left the gap.** Two families
fall straight out of it:

- **Gap early** — `coinb1` ends just past the height push, so the counters sit
  second and the pool's writing comes after them.
- **Gap late** — the pool writes its tag (and any commitment) first, and the
  counters land at the end.

`web/btc-prose.js` assumed gap-early throughout: `peelExtranonces` read every
push immediately after the height as a counter. That is right for the ckpool
family and wrong for the btcpool family, which puts a clock there — the
correction at the end of these notes, and the reason they were written.

## House styles, by template builder

Most pools do not write their own template builder. Reading the three open
ones gives the layouts directly; the closed ones have to be sampled.

### btcpool — BTC.com's server, and the lineage it seeded **[source]**

`src/bitcoin/StratumBitcoin.cc` assembles the `scriptSig` in this order:

| # | field | notes |
|---|-------|-------|
| 1 | block height | `scriptSig << (uint32_t)height_` |
| 2 | **template timestamp** | `scriptSig << CScriptNum((uint32_t)time(nullptr))` |
| 3 | pool coinbase info | the tag string, raw bytes, no push prefix |
| 4 | Namecoin merged mining | 44 bytes, only when `nmcAuxBits_ != 0` |
| 5 | extranonce placeholder | `extranonce1 + extranonce2` bytes of `0xEE`, later split into `coinb1`/`coinb2` |

The builder then refuses anything that would push the script past 100 bytes.
The placeholder is the tell: `coinb1` is everything before the run of `0xEE`,
`coinb2` everything after, so **the gap is fourth, not second**.

The second field is a clock, not a counter. It is written once when the
template is built, it is the same in every share of that template, and it
tracks the wall clock rather than counting anything.

### ckpool — Con Kolivas's server, the solo and small-pool workhorse **[source]**

`src/stratifier.c`: `coinb1` is a 41-byte fixed header plus the length byte
and the BIP34 height, then the gap; `coinb2` opens with the seven bytes
`0a 63 6b 70 6f 6f 6c` (`0x0a`, then ASCII `ckpool`), followed by a single
length byte and the operator's configured signature (`btcsig`).

So the ckpool shape is **height, counters, then writing** — gap-early, which
is exactly what `peelExtranonces` expects. The `0x0a` ahead of `ckpool` is a
good example of the general warning: it reads as `OP_PUSHBYTES_10` and pushes
nothing of the sort.

### DATUM Gateway — OCEAN, and anyone building their own template **[source]**

`src/datum_coinbaser.c`: height, then the pool's *primary* tag, a separator
byte (`0x0F` when a secondary tag follows, else `0x00`), then the miner's own
*secondary* tag terminated by `0x00`, then the extranonce. Tag space is capped
at `MAX_COINBASE_TAG_SPACE` (86 bytes) explicitly to leave room for the height,
the extranonces and the pool's own tag; when the tags overrun, the secondary
is truncated first, and when there is no room left for the extranonce in the
input at all it moves into a 10-byte `OP_RETURN` **output** instead.

Two consequences worth carrying: under DATUM the coinbase carries *two* names
— the pool's and the individual miner's — and the extranonce is not reliably
in the `scriptSig`.

### The closed builders — Foundry USA, AntPool, F2Pool, MARA, ViaBTC, Braiins

No published layout. Their formats are observable only in the bytes, which is
what `tools/coinbase-survey.mjs` exists for: sample a few hundred blocks, group
by pool, and read off the shape, the tag, the counter width and the position of
the gap. Two structural hints to look for when running it:

- A plausible unix timestamp in the second push is btcpool ancestry.
- A tag *before* the counters is gap-late; a tag *after* them is gap-early.

Seven consecutive blocks, read off the page: **[observed]**

| height | pool | second field | then |
|---|---|---|---|
| 960,463 | Foundry USA | a 4-byte push, 146,504,335 | `/Foundry USA Pool #dropgold/`, binary |
| 960,464 | AntPool | *not push-shaped* | binary, `Mined by AntPool…` |
| 960,465 | AntPool | *not push-shaped* | binary, `Mined by AntPool ` |
| 960,466 | SECPOOL | *not push-shaped* | ` Mined by Secpool v…` |
| 960,467 | F2Pool | *not push-shaped* | binary, `🐟 /F2Pool/f` |
| 960,468 | Foundry USA | a 4-byte push, 317,032,499 | `/Foundry USA Pool #dropgold/`, binary |
| 960,469 | F2Pool | *not push-shaped* | binary, `🐟 /F2Pool/g` |

What that settles, for these pools and this window:

- **Not one of them writes a clock in the second slot.** The template timestamp
  is MARA's house style (block 960,281), not the majority's, and the correction
  below changes nothing on any of these pages.
- **Foundry is gap-early**: a counter directly behind the height, its tag after
  — ckpool's column, not btccom's. Its two counters read as 1974 and 1980 if
  taken for clocks, which is exactly the case a rule of "four bytes in the
  second slot is a timestamp" would have gotten wrong and the height-anchored
  window turns away.
- **AntPool, F2Pool and SECPOOL write no push-shaped field there at all**:
  their counters are raw bytes, so nothing is peeled and the whole tail is
  margin. Which is what surfaced the quotation problem below.

ViaBTC's tag is worth a note of its own: it embeds an account name
(`/ViaBTC/Mined by <user>/`), so the text field varies block to block while the
structure does not. Group by shape, not by tag. **[unverified]**

## The payloads that announce themselves

Three foreign chains ask a Bitcoin miner to carry a hash, and each publishes
the exact bytes to look for. These are the only structures in the margin a
parser may claim to have *found* rather than guessed at, and
`tools/coinbase-fields.mjs` reads exactly these three.

### Merged mining / AuxPoW — 44 bytes **[spec]**

```
fa be 6d 6d │ 32-byte aux chain merkle root │ u32le merkle size │ u32le nonce
```

Namecoin's and Dogecoin's `CAuxPow::check` enforce it from the other side: the
magic may appear **only once** in the parent coinbase, the merkle root must
start **immediately** after it, and eight bytes must follow. Where the magic is
absent for backward compatibility, the root must start within the first 20
bytes of the coinbase. The size must be a power of two, and the nonce selects
each chain's slot.

### Rootstock — 41 bytes **[spec]**

```
"RSKBLOCK:" (52 53 4b 42 4c 4f 43 4b 3a) │ 32 bytes
```

Under RSKIP110 those 32 bytes are not a bare hash: 20 bytes of the RSK block's
hash-for-merge-mining, a 7-byte commit-to-parents vector (one byte per
checkpoint), a 1-byte uncle count, and a 4-byte RSK block number — **big
endian**, unlike everything Bitcoin writes beside it. RSK also permits the tag
in an `OP_RETURN` output rather than the `scriptSig`, and requires at most 128
bytes after it with no second `RSKBLOCK:` among them.

### Hathor — 36 bytes **[spec]**

```
"Hath" (48 61 74 68) │ 32-byte aux block hash
```

The magic must be the end of `coinbase_tx_head` and must not appear earlier.
Four printable bytes is a short magic, so a reader has to check that what
follows is dense rather than more writing — the survey's reader does.

## The table of signatures

`web/btc-pools.js`. Each entry is a pool, the patterns its signature takes
(most specific first), and what is known about where that signature sits.

| pool | signature | layout |
|---|---|---|
| Foundry USA | `/Foundry USA Pool #dropgold/` | height · counter · signature · bytes **[observed]** |
| AntPool | `Mined by AntPool`, `/AntPool/` | height · bytes · signature · bytes **[observed]** |
| F2Pool | `🐟…/F2Pool/`, `/F2Pool/`, `七彩神仙鱼` | height · bytes · signature · bytes **[observed]** |
| SECPOOL | `Mined by Secpool` | height · bytes · signature · bytes **[observed]** |
| MARA Pool | `\| MARA Made in USA …\|v05`, `MARA Pool` | height · **template timestamp** · signature · bytes **[observed]** |
| ViaBTC | `/ViaBTC/Mined by <account>/`, `/ViaBTC/` | height · counter · signature · bytes |
| Braiins Pool | `/slush/` | height · counter · signature (ckpool) **[source]** |
| ckpool | `/ckpool/` | height · counter · signature **[source]** |
| OCEAN | `OCEAN.XYZ` | height · signature · miner's own tag · counter (DATUM) **[source]** |
| BTC.com | `/BTC.COM/` | height · timestamp · signature · … (btcpool) **[source]** |

…plus SpiderPool, Luxor, Binance, SBI Crypto, Poolin, ULTIMUSPOOL, WhitePool,
KuCoinPool, Titan, Terra Pool and Bitfury, whose signatures are recorded but
whose layouts are still owed a sample.

**A signature is a pattern, not a string**, because pools write around their
own names: MARA appends a version, ViaBTC embeds the miner's account, F2Pool
pads with spaces and follows the tag with a character that changes every block.
The pattern's whole job is to cover what the pool wrote and stop there. Where
the boundary is genuinely unknown — the digits after AntPool's name could be
the pool's or the counter's — the pattern claims only the part that is certain.
Under-claiming costs a few bytes their quotation marks; over-claiming puts
words in a pool's mouth.

### The two things the table buys, which are different in kind

**A parse.** Where the signature ends is a fact about the bytes, and without it
the book quotes whatever printable run it finds — so a counter byte leaning on
a tag reads as the pool's punctuation. That is the backtick in block 960,468's
`“/Foundry USA Pool #dropgold/\`”`, AntPool's `960x`, F2Pool's trailing `f`.
With the table the quotation closes where the pool closed it and the leaning
bytes rejoin the counter they came from. Nothing about that is a claim.

**An identification.** That `/Foundry USA Pool #dropgold/` is in the coinbase
is the record; that Foundry mined the block is an inference from an
unauthenticated string anyone can copy. So the passage prints the signature and
the name rides the mark — in the hover, and in `signature: { pool, link, text }`
on the composed input field, where the annotation layer, a running head or the
reply bot can say it out loud and a reader can weigh it. The record and the
readings of it in different registers, which is the book's own argument applied
to its own margin.

Provenance: the tags as they sit on the chain (blocks 960,463–469 read
directly), cross-checked against mempool's
[`pools-v2.json`](https://github.com/mempool/mining-pools), which lists ~171
pools. Hand-authored rather than vendored — a name a pool writes into a block
is a fact off a public ledger, and which bytes belong to it is the book's own
reading. The survey still fetches mempool's list at run time and uses it to
widen identification to pools the table does not carry.

The other axis explorers use is the coinbase payout address, which is why
`pools-v2.json` carries addresses alongside tags. Under DATUM that axis breaks
down in the other direction: OCEAN pays participants directly, so the outputs
are many and are not the pool's own.

## The outputs, briefly

- **Witness commitment** — `OP_RETURN`, 36-byte push opening `aa21a9ed`, then
  the 32-byte commitment; the last such output wins. **[rule]** Already read by
  the book (`⋔w` in `web/btc-prose.js`).
- **Other `OP_RETURN`s** — RSK permits its tag here; DATUM parks the extranonce
  here when the input runs out of room; some pools carry additional commitments.
  **[spec]**
- **Payout shape** — one output for most pools, many for OCEAN's TIDES.
  Structural, not textual: a coinbase with dozens of outputs is a pool that
  pays its miners on chain. **[unverified]**

## What this meant for the book, and what was done about it

One finding was worth acting on, and it was a correction rather than an
addition. It has been made.

**The push after the height is often a timestamp, not an extranonce.**
`web/btc-prose.js` peeled the pushes after the BIP34 height as counters and
marked them `η`, titled "the counter the miner rolled once the header's 32-bit
nonce was exhausted". For every pool on btcpool's lineage that second field is
`time(nullptr)` — the moment the template was built. **[source]**

The book's own recorded example said so too. `tools/coinbase-notation.test.mjs`
carried the push `04 fb7e6b6a` from block 960,281, read there as extranonce
1,785,429,755. That number is `2026-07-30 16:42 UTC` — the day the block itself
was mined. A counter landing inside the right day by chance is about a
two-in-a-hundred-thousand shot; a clock lands there every time.

### How the two are told apart

Nothing in the bytes distinguishes a clock from a counter. What distinguishes
them is the height already standing beside it, which BIP34 put there: a clock
agrees with it, a counter has no reason to. So `web/btc-chaintime.js` dates a
height from the halvings — exact at the anchors, within days between them — and
a four-byte push in the second slot is read as a clock when it falls within
`PLAUSIBLE_WINDOW` (90 days) of that estimate.

The window is set an order of magnitude past the estimate's own error, so a
real timestamp is never turned away; the price is that a random counter landing
inside it is read as a clock about four times in a thousand. The asymmetry is
deliberate — both readings write the same bytes back, and only the hover text
differs, so the cheaper mistake is the one that admits a stray counter.

The test depends on the bytes and on nothing else — not on the current time, not
on the block's header, not on the network — which is why the survey, the book
page and a prerendered passage cannot disagree about what a number in that slot
is, and why re-reading a saved sample a year from now gives the same answer.

## The second correction: what may be quoted

The seven blocks above turned up a second error, and it is the same one a layer
down. Block 960,467's page carried this, in quotation marks:

> “KXG&\`WY”

Nobody wrote it. Those are seven bytes of F2Pool's counter that happened to
land in the printable range, and the margin's text scan took them for writing.
Block 960,468 shows the milder form: a stray backtick riding inside
`“/Foundry USA Pool #dropgold/\`”`, one byte of the counter pulled in against
the tag's own closing slash. **[observed]**

A quotation is the strongest claim the book makes about the margin — it says a
person wrote these bytes as text. Printable is not evidence for that: better
than a third of any counter's bytes are printable by chance, and over a
twenty-odd-byte tail a five-character run turns up about one block in seven.

So a run must now hold a **word** before it may be quoted: four letters
together, or three where the run is long enough to be unlikely on its own terms
(`looksLikeWriting` in `web/btc-tx.js`). Measured over random tails, that takes
a false quotation from one block in seven to one in thirty-seven. Every pool
tag the chain is known to carry survives it — `/F2Pool/`, `/slush/`,
`OCEAN.XYZ`, `/BTC.COM/`, `Mined by AntPool`, MARA's emoji and all, F2Pool's
`七彩神仙鱼` — and a tag with no word in it at all (Foundry's alternate
`/2cDw/`) now reads as prose instead. Nothing is lost by that: the bytes still
print, in the register the book keeps for bytes nobody can read.

What the word test does not fix is the backtick: that byte sits inside a run
that *is* writing, and telling it from the tag's own final slash takes knowing
where Foundry's signature ends. Which is what the table above is for, and what
it now does — the two corrections meet there. The word test decides whether a
run may be quoted at all; the signature decides where the quotation closes.

### What changed

- `web/btc-chaintime.js` — new: the halving-anchored estimate and the window.
- `web/btc-prose.js` — `templateTimePush` takes the clock before
  `peelExtranonces` sees it; the date prints in the chapter head's own form
  (`2026-07-30 16:42`), with no glyph of its own, because it is the same kind of
  thing the header states. `η` keeps its meaning and now only ever wears it.
- `web/btc-notation.js` — the key gains a row for the timestamp and the `η` row
  stops claiming the slot outright.
- `web/btc-key-filter.js` — the date differs in every block that carries one, so
  no literal in the key could name it: the mark answers to a synthetic
  `time:template`, as a bare push answers to `push:count`.
- `tools/coinbase-fields.mjs` reads the same slot by the same rule, imported
  from the same module.
- `web/btc-tx.js` — `looksLikeWriting`, and the word test in
  `splitReadableRuns` / `findTextRuns` (`requireWord: false` opts out, for a
  caller asking what is merely legible rather than what was written).
- `web/btc-notation.js` — the ■ row said the margin is "quoted where it is
  legible", which was the whole mistake in four words.
- `web/btc-pools.js` — the signature table, `findSignature`, `splitOnSignature`
  and `poolOf`; `web/btc-prose.js` cuts each readable run at the signature
  inside it and marks the quotation `.pool-sig`; the key gains a row for it and
  the filter a `sig:pool` token; `tools/coinbase-fields.mjs` and the survey
  identify by the same table, so the page and the instrument can never cut a
  tag at different bytes.

The rest of what the survey can find belongs where it is. The book stops reading
opcodes at the height mark deliberately, and none of the above is a reason to
start again: a pool tag is already quoted as the writing it is, and a
commitment recognized by its magic would be a *reading* of the margin — worth
having in the annotation layer, not in the passage.

## Running the survey

```sh
node tools/coinbase-survey.mjs --blocks 500 --save samples.json   # sample and keep
node tools/coinbase-survey.mjs --samples samples.json             # re-read offline
node tools/coinbase-survey.mjs --hex 0319a70e04fb7e6b6a…          # one scriptSig
node tools/coinbase-survey.mjs --blocks 200 --json > survey.json
```

`SURVEY_ESPLORA` points it at a local node or any Esplora-compatible mirror.
Saved samples are what makes a finding re-checkable rather than re-believable:
the analysis re-runs offline against exactly the blocks that were fetched.

What a run should settle, in order of what it would change here:

1. Which pools put a timestamp in the second slot (btcpool lineage), and which
   put the extranonce there (ckpool lineage).
2. Foundry USA's, AntPool's, F2Pool's and MARA's layouts, field by field.
3. How often each merged-mining commitment appears, and in whose blocks.
4. Whether any sampled coinbase defeats the reader — the survey counts blocks
   whose fields fail to reproduce their own bytes, and that count should be
   zero.

## Sources

- Bitcoin Core, `src/consensus/tx_check.cpp` — the 2–100 byte `bad-cb-length` rule
- [BIP34](https://github.com/bitcoin/bips/blob/master/bip-0034.mediawiki) — the height push
- [Stratum mining protocol](https://en.bitcoin.it/wiki/Stratum_mining_protocol) — `coinb1`/`coinb2`, `extranonce1`/`extranonce2`
- [btccom/btcpool](https://github.com/btccom/btcpool), `src/bitcoin/StratumBitcoin.cc`
- [ckolivas/ckpool](https://github.com/ckolivas/ckpool), `src/stratifier.c`
- [OCEAN-xyz/datum_gateway](https://github.com/OCEAN-xyz/datum_gateway), `src/datum_coinbaser.c`
- [dogecoin/dogecoin](https://github.com/dogecoin/dogecoin), `src/auxpow.cpp` — `CAuxPow::check`
- [RSKIP110](https://github.com/rsksmart/RSKIPs/blob/master/IPs/RSKIP110.md) — the RSK tag's fields
- [HathorNetwork/rfcs](https://github.com/HathorNetwork/rfcs/blob/master/text/0006-merged-mining-with-bitcoin.md) — merged mining with Bitcoin
- [mempool/mining-pools](https://github.com/mempool/mining-pools) — `pools-v2.json`, the tag table
