<!-- SPDX-License-Identifier: MIT OR Apache-2.0 -->

# How each pool formats its coinbase

Notes on the coinbase input's `scriptSig` — what is rule, what is house
style, and what of it can honestly be parsed. Written to support
`tools/coinbase-fields.mjs` (the reader) and `tools/coinbase-survey.mjs`
(the instrument that samples the chain and checks these claims against it).

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
notes were written in (outbound access to the chain APIs was blocked), so
nothing below is marked **[observed]** yet. Everything marked **[rule]**,
**[spec]** and **[source]** stands on its own citation; the per-pool byte
layouts of the closed builders are the part still owed a sample.

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

`web/btc-prose.js` currently assumes gap-early: `peelExtranonces` reads the
pushes immediately after the height as counters. That is right for the ckpool
family and wrong for the btcpool family, which puts something else there —
see the finding at the end.

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

## Who wrote it

Pool identification is by tag: mempool's
[`pools-v2.json`](https://github.com/mempool/mining-pools) lists ~171 pools,
each with the substrings its coinbases carry — `/AntPool/`, `/ViaBTC/`,
`Foundry USA Pool`, `/F2Pool/`, `MARA Made in USA`, `/SBICrypto.com Pool/`,
`/slush/`, `OCEAN.XYZ`, and so on. The survey fetches that list at run time and
falls back to a built-in subset.

Two cautions, both of which the book's own preface already insists on. A tag is
**a claim, not a fact**: it is unauthenticated, trivially copyable, and pools
have worn each other's. And identification by tag is commentary about the
record, not the record — which is why none of this changes a passage, and why
the survey reports what a coinbase *says about itself* rather than who mined it.

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

## What this means for the book

One finding is worth acting on, and it is a correction rather than an addition.

**The push after the height is often a timestamp, not an extranonce.**
`web/btc-prose.js` peels the pushes after the BIP34 height as counters and
marks them `η`, titled "the counter the miner rolled once the header's 32-bit
nonce was exhausted". For every pool on btcpool's lineage that second field is
`time(nullptr)` — the moment the template was built. **[source]**

The book's own recorded example says so too. `tools/coinbase-notation.test.mjs`
carries the push `04 fb7e6b6a` from block 960,281, read there as extranonce
1,785,429,755. That number is `2026-07-30T16:42:35Z` — within a day of the
block that contains it. A counter landing inside the right day by chance is
about a two-in-a-hundred-thousand shot; a clock lands there every time.

`tools/coinbase-fields.mjs` reads that slot as a timestamp when the value falls
in the plausible window, and only in that slot — the same four bytes further
along stay what they are. Whether the book should follow, and under which mark,
is an editorial decision and not a parsing one: `η` on a template clock says
something false in the notation key's own voice, and the fix touches
`web/btc-notation.js` as well as the prose. Flagged here, not taken.

Everything else the survey can find belongs where it is. The book stops reading
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
