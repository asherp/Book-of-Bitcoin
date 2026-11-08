<!-- SPDX-License-Identifier: MIT OR Apache-2.0 -->

# The Binance hack, 29 October 2026

Research toward curated entries: 18,270.2 ₿ left one address in eleven
transactions on 29 October 2026, all confirmed in a single block, and before
that block closed the coins had been cut into seventeen pieces of exactly
1,000 ₿ and two remainders. Twenty-eight minutes later the last remainder
followed. Nothing has moved since. **[reported]** the largest theft in the
history of the asset class, roughly $6.3 billion across sixteen chains, of
which this chain's share — the only share nobody could freeze — was the
eighteen thousand coins this file follows.

This event is kept the way `tools/thefts-and-seizures.md` and
`tools/mtgox-era-thefts.md` keep theirs, and for the same reason: the chain
wrote a perfectly formed passage that says nothing about itself. Unlike the
Liquid drain (`tools/liquid-federation-drain.md`) nobody spoke in the
outputs; the parties here are silent. What the chain does say, and says
unusually clearly, is *shape* — eleven withdrawals every one of them a round
tenth of a bitcoin, a peel chain of nineteen cuts at a flat fee, and a
single block holding the whole of it from the first withdrawal to the
sweep. The book can show that shape where a newspaper can only assert it.

What this file supports:

- **`web/notables.yaml`** — five entries drafted at the end of this file,
  filed as one group in chain order.
- The editorial rule this file obeys: a story not yet checked against the
  chain stays a note here rather than becoming published commentary.
  Publishing is the assertion.

Every claim carries where it came from:

- **[verified]** — read off the chain for this file, 2026-11-08 at block
  975,011, via Esplora-compatible APIs (mempool.space and blockstream.info,
  agreeing on every position and value quoted): the transactions, their
  values, positions, fees, and what has and has not been spent since.
- **[reported]** — press accounts, the analytics firms' published notes,
  and the exchange's own statements. Say so out loud.

## What the chain shows, and what it does not

**[verified]** A P2WPKH address, `bc1qm34lsc6…7s3h`, paid out 18,270.2 ₿ to
a second P2WPKH address, `bc1q0mtc2f5…2mnm`, in eleven transactions
confirmed in block 973,732 at positions 146 through 159. The paying address
has 2,366,543 transactions and has received 61,354,289 ₿ over its life; it
holds 5.50677312 ₿ today. Within the same block, eighteen further
transactions cut the 18,270.2 ₿ into seventeen outputs of exactly 1,000 ₿
and one of 832.49990088 ₿, and in block 973,738 a nineteenth gathered the
rest into one of 437.69998739 ₿. Nineteen outputs, 18,270.19988827 ₿, and
every one of them unspent at block 975,011.

**[reported]** That the paying address is a Binance bitcoin hot wallet (the
exchange's own statements, Whale Alert's label, and every analytics firm
that has written on the event agree); that the eleven withdrawals were
unauthorized; that they were submitted through a service container reached
from a compromised engineer's laptop (Binance's first account), or through
wallet-signing infrastructure reached by way of a tampered developer tool,
a fake job interview and compromised internal AI tooling (Binance's report
of 3 November); that no private key leaked (Binance); that the actor was
TraderTraitor, the DPRK unit the FBI named for the 2025 Bybit theft (TRM
Labs, "with high confidence"; Chainalysis concurring; an FBI alert), which
the DPRK denied on 3 November. The chain cannot say any of this. What it
corroborates is the one thing it can: the signatures on all eleven
withdrawals are valid, and the address they spend is the address the
exchange had been spending from two million times before.

Note what the chain does *not* establish: that this was a theft. Eleven
valid signatures moved coins from one address to another. That the signer
was not entitled to is the exchange's claim about its own wallet, however
well corroborated, and the title these entries carry — *the Binance hack* —
is the name the event is known by, not a finding.

## The withdrawals

Eleven transactions, block 973,732 (**V β67 ■677**, timestamped 20:20:06
UTC), positions 146–159, interleaved with three unrelated transactions. All
eleven spend `bc1qm34lsc6…7s3h` alone, pay `bc1q0mtc2f5…2mnm`, and return
change to the address they spent. **[verified]**

| § | txid | inputs | to the receiver | change | fee (sats) |
| --- | --- | --- | --- | --- | --- |
| 147 | `8b02cfb9…5cbf` | 9 | 44.2 | 2.45404986 | 6,870 |
| 148 | `6736fc29…ca84` | 27 | 194.3 | 6.40461608 | 19,160 |
| 150 | `6722aa3e…cec0` | 12 | 67.2 | 2.56440472 | 8,920 |
| 151 | `d9bf6caa…f651` | 39 | 369.6 | 8.37735691 | 27,350 |
| 152 | `82c0b6f2…04ce` | 93 | **7,636.8** | 2.98502475 | 64,200 |
| 154 | `574bc276…190f` | 80 | 2,946.9 | 7.35602683 | 55,330 |
| 155 | `3b1d3ded…2b32` | 95 | 4,696.6 | 19.48494217 | 65,570 |
| 156 | `5de2320e…f0ba` | 76 | 1,409.5 | 3.62320176 | 52,600 |
| 157 | `d3084140…410d` | 59 | 773.1 | 2.46567922 | 41,000 |
| 159 | `48ba4e60…e6a1` | 18 | 112.1 | 3.22479113 | 13,010 |
| 160 | `f9dcbbc6…0313` | 5 | 19.9 | 4.56268339 | 4,140 |

513 inputs, 77,027 bytes, 358,150 sats in fees, **18,270.2 ₿** delivered.
**[verified]** Every one of the eleven amounts is a round tenth of a
bitcoin, which is not how an exchange's own sweeps read and is the one
fact in this table a reader can see without being told anything.

**The first withdrawal.** `8b02cfb9…5cbf`, position 146 — **V β67 ■677
§147**. Nine inputs, 44.2 ₿ out. **[verified]** The smallest but one, and
where the story starts.

**The largest.** `82c0b6f2…04ce`, position 151 — **V β67 ■677 §152**.
Ninety-three inputs gather 7,639.78502475 ₿ and pay **7,636.8 ₿** in one
output; 13,886 bytes for a 64,200-sat fee. **[verified]** Two-fifths of the
event in a single sentence.

## The cuts

Nineteen transactions carry the coins from `bc1q0mtc2f5…2mnm` to where they
rest. Eighteen are in the same block as the withdrawals, positions
2086–2415; the nineteenth is in block 973,738. Each of the first fourteen
spends one output and writes two: **exactly 1,000 ₿** to a fresh address,
and the remainder onward, for a fee of 500 sats. The remainders are then
paired and cut again (positions 2338–2340, fee 700), and what is left is
swept. **[verified]**

| § | txid | spends | 1,000 ₿ to | remainder |
| --- | --- | --- | --- | --- |
| 2087 | `b1473693…ae00` | the 4,696.6 | `bc1q0ts8gaf…` | 3,696.599995 |
| 2088 | `50a9d0ab…b109` | the 7,636.8 | `bc1qjwdw6vr…` | 6,636.799995 |
| 2089 | `8fc80bf3…adb3` | 6,636.8 | `bc1qdfhmlrd…` | 5,636.79999 |
| 2090 | `97e16468…e71c` | 5,636.8 | `bc1qz8hdwv8…` | 4,636.799985 |
| 2091 | `d5b12696…1f13` | 4,636.8 | `bc1q63qrfrp…` | 3,636.79998 |
| 2101 | `f47b5991…f467` | the 2,946.9 | `bc1qs3aej5t…` | 1,946.899995 |
| 2103 | `20347f02…b0f5` | 3,636.8 | `bc1qs6xnmha…` | 2,636.799975 |
| 2104 | `7c06da6f…f6da` | 2,636.8 | `bc1qm8v88m5…` | 1,636.79997 |
| 2105 | `7954d0b8…6d70` | 1,636.8 | `bc1q42flhay…` | 636.799965 |
| 2106 | `fb5956f2…2492` | 3,696.6 | `bc1q2wvz0kc…` | 2,696.59999 |
| 2107 | `aa4e740e…65ec` | 2,696.6 | `bc1qalwnl7d…` | 1,696.599985 |
| 2108 | `046a4f5a…2687` | 1,696.6 | `bc1qf5cyvv9…` | 696.59998 |
| 2109 | `38d64c73…a499` | 1,946.9 | `bc1qm2j6v32…` | 946.89999 |
| 2112 | `07f4a693…3eb6` | the 1,409.5 | `bc1qxrxujwx…` | 409.499995 |
| 2339 | `b27d1816…dbdd` | 946.9 + 696.6 | `bc1qg3nrzpu…` | 643.499963 |
| 2340 | `a9ed8a85…c676` | 409.5 + 643.5 | `bc1qepc70u3…` | 52.999951 |
| 2341 | `27cdbffb…f68b` | the 773.1 + 369.6 | `bc1qnq6jj9j…` | 142.699993 |
| 2416 | `b167dcb0…8922` | 636.8 + 142.7 + 53.0 | — | **832.49990088** to `bc1qrg025e2…` |
| ■683 §386 | `58bb6e42…d625` | the 194.3 + 112.1 + 67.2 + 44.2 + 19.9 | — | **437.69998739** to `bc1qxg0l4p6…` |

**The first cut.** `b1473693…ae00`, position 2086 — **V β67 ■677 §2087**.
One input, the 4,696.6 ₿ withdrawal; two outputs, 1,000 ₿ and
3,696.599995 ₿; fee 500 sats. **[verified]** The pattern every cut after it
repeats, 1,927 positions after the withdrawals in the same chapter.

**The sweep.** `b167dcb0…8922`, position 2415 — **V β67 ■677 §2416**.
Three inputs — the three odd remainders the second round of cuts left —
gathered into **832.49990088 ₿** at one address; fee 812 sats.
**[verified]** The eighteenth piece, and the last transaction of the event
in its chapter.

**The last piece.** `58bb6e42…d625`, block 973,738 (**V β67 ■683**,
20:48:14 UTC), position 385 — **V β67 ■683 §386**. Five inputs — the five
smallest withdrawals, untouched by the cuts — gathered into
**437.69998739 ₿**; fee 1,261 sats. **[verified]** Six chapters and
twenty-eight minutes after the rest.

**The rest.** 19 transactions, 11,173 sats in fees, which is exactly the
difference between the 18,270.2 ₿ withdrawn and the 18,270.19988827 ₿ at
rest. **[verified]** Seventeen addresses hold 1,000.00000000 ₿ each, one
holds 832.49990088 ₿, one holds 437.69998739 ₿, and none has spent as of
block 975,011. **[reported]** that the actor is expected to feed these into
swap services and OTC desks in small batches; **[reported]** that proceeds
from the other fifteen chains have since been swapped into bitcoin
elsewhere (Elliptic, ~$124 million by 6 November). None of that is on these
nineteen outputs.

## Onlookers, recorded

`bc1q0mtc2f5…2mnm` has received one further payment: 779 sats on 30
October, block 973,848 §2054, in a transaction that also carries an
OP_RETURN. **[verified]** that it exists; it is onlooker dust, the same
phenomenon `tools/thefts-and-seizures.md` records at 1Feex and
`tools/liquid-federation-drain.md` at the Liquid addresses, and the reason
the receiver's funded total reads 18,270.20000779 ₿ rather than 18,270.2.
The nineteen resting addresses had drawn none at block 975,011. The payload
is not quoted and nothing is proposed as an entry for it, by the rule the
Liquid note states: a curated entry titles a passage, and the contents will
not title what an anonymous party paid a few hundred sats to say about
this event.

## Drafted entries

```yaml
- title: The Binance hack/the first withdrawal
  id: V β67 ■677 §147
- title: The Binance hack/the largest withdrawal
  id: V β67 ■677 §152
- title: The Binance hack/the first cut
  id: V β67 ■677 §2087
- title: The Binance hack/the sweep
  id: V β67 ■677 §2416
- title: The Binance hack/the last piece
  id: V β67 ■683 §386
```

One group, chain order, five places. Four of them are one chapter: the
withdrawals, the cuts, and the sweep are all **■677**, and a reader opening
the first withdrawal reads the whole event by turning the page — which is
why the eleven withdrawals and nineteen cuts are not each an entry. The
Coldcard entries made the same choice for the same reason: a contents
names where a story starts, and the remainder is a page-turn away. The
fifth place is the one piece that left the chapter.

No published reading. The event is ten days old, the nineteen outputs are
unspent, and how they end — frozen at an exchange, swept into a seizure
address as the Bitfinex coins were, or dispersed — is not yet a fact about
the chain. The entries keep the places; the reading waits.
