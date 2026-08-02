<!-- SPDX-License-Identifier: MIT OR Apache-2.0 -->

# Coins locked and coins burned

Research toward future curated entries: the famous passages where coins were
either locked far longer than anyone intended or put beyond spending on
purpose. The chain never says "burned" — it only says which script an output
went to and whether anything has ever satisfied it — so every entry here is a
reading of the record, and the record is quoted beside each claim. What this
file supports:

- **`web/notables.yaml`** — candidate chapter and section entries, drafted at
  the end of this file in the file's own grammar, ready to paste when the
  editor decides a passage has earned its row.
- **`web/btc-index-data.js`** — candidate ledgers: three of the stories below
  are addresses rather than places, and read in the Ledger.
- The editorial rule this file obeys: a story not yet checked against the
  chain stays a note here rather than becoming published commentary.
  Publishing is the assertion.

Every claim carries where it came from:

- **[verified]** — read off the chain for this file, 2026-08-02, via
  Esplora-compatible APIs (blockstream.info, mempool.space): the transaction,
  its scripts and values, its block position, and — for addresses — the
  funded/spent totals.
- **[rule]** — consensus or a BIP: true of every block, or the block is
  invalid.
- **[reported]** — secondary sources, not yet re-checked against the chain
  here. Say so out loud.

## The grammar of unspendability

Three different mechanisms produce "coins nobody will ever spend," and the
book should keep them distinct, because they are visible in the record in
three different ways:

1. **Burned by script.** The output's `scriptPubkey` cannot be satisfied:
   `OP_RETURN` (provably, by opcode — the sanctioned form since v0.9), a hash
   with no known preimage (an "eater" address, ground for its vanity text
   rather than derived from a key), or a script malformed so that no input
   can complete it. The burn is in the passage itself. **[rule]**
2. **Destroyed by the coinbase.** A block's coinbase may claim *up to*
   subsidy plus fees; claiming less destroys the difference — not sent
   anywhere, simply never created (`GetBlockSubsidy` is a ceiling, not a
   floor). Visible as arithmetic between a chapter's frontispiece and its §1.
   **[rule]**
3. **Locked by time.** `OP_CHECKLOCKTIMEVERIFY` compares against a number
   that is a block height below 500,000,000 and a unix timestamp at or above
   it (`LOCKTIME_THRESHOLD`), and fails on a type mismatch between the stack
   value and the spending transaction's `nLockTime`. A unit slip on either
   side of that boundary locks coins for decades or centuries. The lock is in
   the script; the mistake is only legible with hindsight. **[rule]**

A fourth mechanism — losing the keys — leaves **no mark on the record at
all**, which is why the Quadrigas and forgotten-passphrase stories of the
world, however famous, are outside this file's scope: nothing in any passage
distinguishes a lost key from a patient holder. The book can only keep what
the chain can show.

`nLockTime` alone cannot strand coins on-chain: a transaction locked to the
future simply cannot confirm, so the mistake never becomes a passage. And
BIP68's relative locks are capped at 65,535 blocks (~15 months) — bounded by
construction. The multi-century accidents all live in absolute CLTV scripts.
**[rule]**

## Burned on purpose

### The satoshi left on the table — block 124,724

The chain's smallest and most deliberate burn. The coinbase of block 124,724
(May 18, 2011) claims **49.99999999 BTC** — 4,999,999,999 satoshis — where
the block was entitled to 50 BTC of subsidy plus 0.01 BTC in fees (8
transactions, 1,000,000 sats of fees): one satoshi of subsidy and all the
fees forgone, 1,000,001 satoshis destroyed in total. **[verified]** The
miner, the Bitcoin developer known as midnightmagic, described it as a
deliberate tribute to Satoshi Nakamoto, who had withdrawn from the project
weeks earlier. **[reported]** The coinbase scriptSig ends in a lone `0x69`.
Coinbase txid `5d80a29b…c10d`, citation **I β62 ■1749 §1**.

### The Counterparty proof-of-burn — 1CounterpartyXXXXXXXXXXXXXXXUWLpVr

The largest deliberate burn in the chain's history, and the canonical
proof-of-burn. In January 2014 the Counterparty protocol issued its XCP
token exclusively to whoever destroyed bitcoin: send BTC to an address whose
text was chosen before anyone knew whether it could have a key —
`1CounterpartyXXXXXXXXXXXXXXXUWLpVr` — during a fixed window of blocks
(278,310–283,810), and the protocol credited XCP in proportion. No founder
allocation, no sale; the burn was the issuance. **[reported]** The address
has received **2,130.99778224 BTC** across 3,133 outputs and has never spent
one. **[verified]** This is an address, not a place: Ledger material.

### The eater addresses — 1BitcoinEaterAddressDontSendf59kuE

The generic burn address, its name its own warning label. A base58 address
is the hash of a key; grind the text you want and there is no key behind it,
only a hash nothing is known to produce. `1BitcoinEater…` has swallowed
**13.41710835 BTC** across 5,793 outputs, none ever spent. **[verified]**

### The 107 BTC burn of May 2026 — block 950,962

The largest single burn to the all-zeros address, and recent enough that its
motive is still argued. On May 25, 2026, five transactions in one block sent
a combined **107.13021951 BTC** (~$8.2M at the time) to
`1111111111111111111114oLvT2` — the address whose hash160 is twenty zero
bytes, for which no key can be expected to exist. **[verified]** The five,
all in block 950,962 (citation **V β56 ■83**):

| txid | pos | amount (BTC) |
|---|---|---|
| `ea6d6a23…1b1c` | §2216 | 20.02697328 |
| `c0ede983…a0b6` | §2221 | 28.88997433 |
| `ae1a4e36…1cee` | §2223 | 36.78748282 |
| `a5df6016…8c0d` | §2224 | 1.41584421 |
| `88d53e67…133d` | §2225 | 20.00994487 |

The onchain analyst Sani (Timechainindex) flagged it the next day; theories
ran from protest to key compromise to plain error, and none has evidence.
**[reported]** A model case for the book's discipline: the record shows the
coins moved to an unspendable script, and everything else is commentary.

### The all-zeros address as an institution — 1111111111111111111114oLvT2

Beyond that one burn, the zero address is the chain's default incinerator:
**809.42500016 BTC** received across 390,869 outputs, none ever spent.
**[verified]** Deliberate uses pile up beside the accidents: Blockstack
burned namespace-registration fees to it by protocol **[reported]**, and it
is the customary sink for proof-of-burn schemes precisely because its
all-zero hash is transparently keyless — a burn address you can verify by
reading it. A 2025 survey of burn addresses (arXiv:2503.14057) found
**3,197.61 BTC** provably burned across 7,905 burn addresses, over 99% of it
in three: Counterparty's, the zero address, and the Bitcoin Eater.
**[reported]**

### OP_RETURN — the burn the protocol blessed

Already in the book (First standard OP_RETURN, `8bae12b5…5684`). Worth
saying in this company: OP_RETURN was standardized in v0.9 (2014) precisely
so that data-embedders would stop burning value into fake hash addresses —
an output that is provably unspendable by opcode, prunable from the UTXO
set, and conventionally worth zero. The burns above are what OP_RETURN was
built to end; a nonzero value on an OP_RETURN output is still destroyed the
same way. **[rule]**

## Burned by mistake

### Mt. Gox pays the void — 2,609 BTC, October 2011

The most expensive malformed script in the chain's history. In late October
2011, Mt. Gox — then the dominant exchange — shipped withdrawal code that
built P2PKH outputs with an **empty push where the twenty-byte key-hash
belongs**: `76a90088ac`, which reads `OP_DUP OP_HASH160 <nothing>
OP_EQUALVERIFY OP_CHECKSIG`. No hash160 of anything is zero bytes long, so
nothing can ever satisfy it. **[rule]** Reported total across the faulty
batch: **2,609.36304319 BTC**. Mark Karpelès admitted the error on
Bitcointalk after user genjix's October 29, 2011 thread ("someone fucked up
and lost a lot of money"). **[reported]**

One printing verified here: `81f59158…30fd` in block 150,951 (October 28,
2011), position 22 — citation **I β75 ■1768 §23** — whose output 1 pays
**100 BTC exactly** to `76a90088ac`. **[verified]** A fuller sweep for the
sibling transactions (the rest of the 2,609) needs a script-index query no
Esplora endpoint offers; owed before any commentary states the total as
chain fact rather than reported figure.

### The pool that paid "script" — block 170,029

The same class of bug in miniature, in a coinbase. P2Pool pays every miner
of its share-chain directly from the block's coinbase; in block 170,029
(March 7, 2012) output 0 of the 219-output coinbase pays 18,553 satoshis to
the raw bytes `736372697074` — the ASCII string **"script"** — a
configuration placeholder written where a script belonged. **[verified]**
Citation **I β85 ■686 §1.0**. Small money, perfect specimen: the burn is
the literal word "script," locking 0.00018553 BTC forever.

### The coinbase that claimed nothing — block 501,726

Mechanism 2 at full scale. Block 501,726 (December 30, 2017) contains one
transaction — its own coinbase — whose single output carries **0 satoshis**:
the entire 12.5 BTC subsidy was simply never created. The block being
otherwise empty, no fees were destroyed with it. **[verified]** Citation
**III β41 ■1087 §1**. Attributed to a misconfigured solo/pool template
setting the output value to zero. **[reported]**

### The half-claimed subsidy — block 526,591

Six months later (June 8, 2018) block 526,591 did it by half: its lone
coinbase output claims **6.25 BTC** of the 12.5 it was owed, destroying the
other 6.25. **[verified]** Citation **III β53 ■1760 §1**. Together with
501,726 these are the two largest single-block subsidy destructions of the
12.5 BTC era; dozens of much smaller under-claims (mostly unclaimed fees
from buggy pool software) dot 2011–2017 and would reward a systematic scan.
**[reported]**

### Already in the book

Two destructions the contents already keeps, cross-referenced rather than
re-argued: the **genesis coinbase's 50 BTC**, unspendable because Satoshi's
client never entered it into the transaction database (The Genesis Block);
and the **twice-confirmed coinbases** of 91,722/91,812, overwritten verbatim
by 91,880/91,842, which erased 100 BTC from the spendable record and begat
BIP30 (The twice-confirmed coinbases).

## Locked far longer than intended

### The 500,000,000 line

The whole family of timelock accidents comes from one constant: a locktime
below 500,000,000 is a block height, at or above it a unix timestamp.
**[rule]** Every mis-lock is a number on the wrong side of that line or in
the wrong units — seconds where blocks were meant, a date pasted where a
height belonged. A height-locked script whose author meant "tomorrow" in
seconds is locked for thousands of years; a timestamp miscomputed by one
field is locked for decades.

### The coinb.in 2042 lock — December 2015

The documented specimen. On December 28, 2015 — CLTV had activated on the
network two weeks earlier — a user of the coinb.in web wallet built a CLTV
address intending a lock that expired the previous day, and instead produced
one locked until **April 30, 2042**: twenty-six years, not minus one day.
Reported in the coinb.in issue tracker (OutCast3k/coinbin issue #35,
comment of Dec 28, 2015) and retold since as the standard cautionary tale.
**[reported]** The txid and redeem script are not stated in the secondary
tellings; pinning the actual output — and whether it still waits — needs the
primary comment thread and a chain check, owed before this becomes an entry.
Until then it stays here: a story this famous with a citation this thin is
exactly what the book's comment-not-commentary rule is for.

### What a scan would find

Far-future CLTV outputs are legible on chain (the lock value sits in the
redeem script or witness script, revealed at spend or inspectable when the
script is known), but finding *unspent, unrevealed* ones wants an index of
script templates over the whole chain — same tooling gap as the Mt. Gox
sweep above. A worthwhile future instrument: walk revealed CLTV scripts,
bucket the lock values by decade, and surface everything locked past 2100 —
the deliberate century-locks and the unit slips will sort themselves by
whether anyone ever came back for the coins.

## Negative findings

Checked and rejected — recorded so the next reader needn't re-walk them:

- **Romans 12:21 (block 666,666, `057954bb…fe99`)** — already kept in the
  contents without a reading. Its outputs pay `1GoDxxME…` and `1BibLEafd…`,
  which *look* like burn-style text addresses, but they are ground vanity
  addresses with real keys: the outputs were **spent** (first at height
  707,208, `628a72b9…caf5`). **[verified]** Any future reading of that entry
  must not call them burned.
- **Sermon on the Mount (`e53ac3be…7fd8`)** — a single P2TR output; the text
  rides the witness as an inscription. Nothing burned. **[verified]**
- **The genesis address tributes** — `1A1zP1eP…DivfNa` has received
  **57.32618366 BTC** across 77,198 outputs beyond its coinbase, none ever
  spent **[verified]**, including a famous 26.9 BTC send on January 5, 2024
  **[reported]**. But "burned" here rests on the *presumption* that Satoshi's
  keys are gone — an attribution, not a script fact. Ledger material, with
  the claim set apart as the Ledger sets every claim about a name.

## Candidate entries

Drafted in `notables.yaml`'s grammar; references resolved by the same
arithmetic the file's own comments use (volume from halving era, β from
2,016-block runs since the volume's start, ■ and § one-based) and checked
against `tools/check-editorial.mjs`'s published resolutions for neighboring
entries. Entries carry no `commentary:` — per the house rule, a reading is
published only once its story is fully checked; the two [reported] totals
above (Mt. Gox's 2,609, Counterparty's window) should be re-verified or
attributed as reported figures in any note that states them.

```yaml
- title: The satoshi left on the table
  id: I β62 ■1749 §1
- title: Mt. Gox pays the void
  id: I β75 ■1768 §23.1
- title: The pool that paid "script"
  id: I β85 ■686 §1.0
- title: The coinbase that claimed nothing
  id: III β41 ■1087 §1
- title: The half-claimed subsidy
  id: III β53 ■1760 §1
- title: The 107 BTC burn
  ids:
    - id: V β56 ■83 §2216
      as: 20.03 ₿
    - id: V β56 ■83 §2221
      as: 28.89 ₿
    - id: V β56 ■83 §2223
      as: 36.79 ₿
    - id: V β56 ■83 §2224
      as: 1.42 ₿
    - id: V β56 ■83 §2225
      as: 20.01 ₿
```

Ledger candidates (for `btc-index-data.js`): the Counterparty burn address,
the Bitcoin Eater, and the all-zeros address — each a name whose entire
record is coins arriving and never leaving, which the Ledger's
reconcile-against-the-chain machinery states better than any note could.

## Sources

- Ken Shirriff, "The programming error that cost Mt Gox 2609 bitcoins"
  (righto.com, March 2014) — the `76a90088ac` analysis and the P2Pool
  "script" output.
- Bitcoin.com News, "Bitcoin History Part 17: That Time Mt. Gox Destroyed
  2,609 BTC" — the genjix thread and Karpelès's admission.
- OutCast3k/coinbin issue #35 (GitHub), comment of Dec 28, 2015 — the 2042
  lock; secondary telling in Alistair Mann, "Bitcoin Timelocks and $5
  Wrenches" (Medium).
- BIP65 (OP_CHECKLOCKTIMEVERIFY), BIP68 (relative lock-time) — the
  500,000,000 threshold, type-mismatch failure, 65,535-block cap.
- Counterparty documentation and contemporary coverage — the January 2014
  burn window and XCP issuance.
- News.bitcoin.com, May 2026, "Bitcoin Burn Wallet Absorbs $8.2M…" and
  Sani/Timechainindex — the 107 BTC burn's discovery and reception.
- arXiv:2503.14057, "Bitcoin Burn Addresses: Unveiling the Permanent
  Losses" — 3,197.61 BTC across 7,905 burn addresses, >99% in three.
- Chain data: blockstream.info and mempool.space Esplora APIs, read
  2026-08-02.
