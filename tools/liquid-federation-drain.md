<!-- SPDX-License-Identifier: MIT OR Apache-2.0 -->

# The Liquid federation drain, 6–7 September 2026

Research toward curated entries: 3,996 ₿ left the Liquid Federation's peg
wallet on 6 September 2026, and 3,400 ₿ came back thirty hours later — with
the negotiation that returned it conducted **on this chain, in OP_RETURN
outputs**, in readable English. That last part is why the event belongs in
this book rather than only in a newspaper. Every theft surveyed in
`tools/thefts-and-seizures.md` and `tools/mtgox-era-thefts.md` leaves a
perfectly formed passage that says nothing about itself; the chain there
*connects* the parties without ever making them speak. Here they speak. The
book's own material — bytes carried in prose — includes, for once, sentences
their authors meant as sentences.

What this file supports:

- **`web/notables.yaml`** — eight entries drafted at the end of this file,
  filed as one group in chain order: the coins and the conversation about
  them interleaved, because the sequence is the story.
- The editorial rule this file obeys: a story not yet checked against the
  chain stays a note here rather than becoming published commentary.
  Publishing is the assertion.

Every claim carries where it came from:

- **[verified]** — read off the chain for this file, 2026-09-09, via
  Esplora-compatible APIs (blockstream.info, mempool.space): the
  transactions, their values, positions, fees, and the OP_RETURN payloads
  quoted below, decoded from the scripts themselves.
- **[reported]** — press accounts and the parties' own statements. Say so
  out loud.

## What the chain shows, and what it does not

**[verified]** A P2WSH address, `bc1qdlld6an…hwxxr`, paid out 3,996.01834922 ₿
in one transaction on 6 September; a second address forwarded essentially all
of it one hop on; thirty hours later 3,400 ₿ returned to the same P2WSH from
the address that received it. Between those two movements, sixteen
transactions carried OP_RETURN messages between two addresses, and the
messages discuss precisely that return.

**[reported]** That the P2WSH is the Liquid Federation's peg-in wallet; that
the intermediate address is SideSwap's peg-out payout address; that the
mechanism was a range-proof verification cache bug in Elements, which let
invalid L-BTC be minted and then withdrawn as real BTC through a peg-out
authorization key; that no federation signing key was compromised. The chain
cannot say any of this. What it corroborates is scale: that P2WSH has 584
transactions and holds 7,210.61944771 ₿ today. **[verified]**

Note carefully what the chain does *not* establish: **the word "whitehat" is
the sender's own claim about themselves**, written in an output they paid
for. The book can cite the sentence; it cannot endorse it.

## The movement of coins

**The rehearsal.** `afff7f39…443b`, block 965,780, 6 September 14:01 UTC,
position 908 — **V β63 ■789 §909**. Three inputs gather 2.57429765 ₿ and pay
2.49749857 ₿ to the address that would receive the drain twenty-seven minutes
later. **[verified]** Read as a dry run of the peg-out path; that reading is
inference, which is why it is a note here and not an entry.

**The peg-out.** `8db751a6…b140`, block 965,783, 14:28 UTC, position 1175 —
**V β63 ■792 §1176**. Eighty-three inputs, all from the peg wallet, gather
4,019.44426085 ₿. Thirteen outputs: **3,996.01834922 ₿** to
`bc1qgslsydz…wt7p`, two small payments, and ten outputs of ~1.678 ₿ each
returned to the peg wallet as change. 122,496 bytes for a 34,097-sat fee.
**[verified]** The largest passage of the event and the one the entry names
first: the coins leave in a single sentence.

**The forward.** `85d2ca15…5043`, the same block, position 1242 —
**V β63 ■792 §1243**. One input, two outputs: **3,995.99999857 ₿** onward to
`bc1ql4mfu6…jlte`, 0.01834922 ₿ of change, and a fee of **143 sats**.
**[verified]** Sixty-seven positions after the peg-out, in the same chapter:
the payout address does not hold the coins for a block.

**The return.** `a6d697a2…a46d`, block 965,950, 7 September 16:09 UTC,
position 128 — **V β63 ■959 §129**. Fifteen inputs totalling
3,998.49957662 ₿, two outputs: **3,400.00000000 ₿ back to the peg wallet**,
even to the satoshi, and 598.49955894 ₿ retained. **[verified]** Thirty
hours and twenty-six chapters after the peg-out.

**Still held.** `bc1ql4mfu6…jlte` has 241 confirmed transactions, has
received 28,180.49169638 ₿ in total and spent 27,581.99162285 ₿, leaving
**598.50007353 ₿** unspent as of block 966,157. **[verified]** The excess
over the 598.49955894 ₿ retained is dust sent by onlookers since — the same
phenomenon `tools/thefts-and-seizures.md` records at 1Feex, and the reason
any transaction list for this event must be windowed to its blocks.

## The exchange

Sixteen transactions carry OP_RETURN messages **sent by one of the two
parties** — twelve spending from `bc1ql4mfu6…jlte`, four from
`bc1qn8mgsmx…fqym`. Attribution here is by *signature*, not by address
history: both addresses received a large volume of unrelated OP_RETURN
traffic from onlookers during the event, and only a transaction that spends
an address's own outputs was written by whoever holds it. **[verified]** The
turning points, quoted exactly:

| Chapter | Citation | Who | Message |
| --- | --- | --- | --- |
| 965,818 | **V β63 ■827 §1106** | receiver | `we are whitehats. contact us on chain` |
| 965,822 | **V β63 ■831 §684** | federation side | `Please contact security@blockstream.com` |
| 965,865 | V β63 ■874 §1390 | federation side | ECIES ciphertext to the receiver's key, plus a detached PGP signature and the fingerprint to check it against |
| 965,869 | **V β63 ■878 §1678** | receiver | `sending most back to bc1qdlld6…hwxxr, is that ok` |
| 965,875 | V β63 ■884 §1055 | receiver | asks that the bug be fixed and every node patched *first*, the detail encrypted |
| 965,875 | **V β63 ■884 §1278** | federation side | `Yes, thank you.`, PGP-signed |
| 965,922 | **V β63 ■931 §1397** | federation side | `Bridge nodes are patched, safe to return the funds.`, PGP-signed |
| 965,930 | V β63 ■939 §1830 | receiver | asks for confirmation of the return address once more |
| 966,087 | V β63 ■1096 §2966 | receiver | `All messages will be in plaintext.` |

**[verified]** The signed messages carry a PGP fingerprint ending
`6844 A2D6`, published at blockstream.com/pgp.txt — so the federation side of
this conversation is checkable by anyone holding the block, without trusting
the address. **[reported]** that the key is Blockstream's.

Two chapters are worth pausing on. **V β63 ■884** carries both a request that
the bug be fixed before any money moves (§1055) and the answer `Yes, thank
you.` (§1278) — question and answer in one chapter, 223 sections apart, which
is a thing the reading page can show and no newspaper can. And the return
(**V β63 ■959 §129**) follows the all-clear (**V β63 ■931 §1397**) by
twenty-eight chapters: the sequence the entries preserve is *patch, then
confirm, then pay*.

## An editorial hazard, recorded

Both addresses attracted a heavy volume of third-party OP_RETURN traffic
during the event: memecoin advertising, solicitations addressed to the
receiver, laundering advice, and **messages naming private individuals as
the perpetrators, with home addresses**. **[verified]** that these outputs
exist; **nothing whatever** supports their claims, and they were written by
anonymous parties who paid a few hundred sats for the privilege.

None of it is proposed as an entry, and the reason is a rule rather than a
judgment call about this event: a curated entry is an assertion that a
passage is worth a reader's attention *under the title the entry gives it*.
The book cannot title an accusation without repeating it. The chain carries
these bytes and the reading pages will render them like any others, in
sequence, where they stand; what the contents does not do is send anyone to
them. The distinction is the one the Ledger already draws — that these coins
are that party's is somebody's assertion, however well evidenced — applied to
naming a person a criminal, where the evidence is nil.

## Drafted entries

```yaml
- title: The Liquid drain/the peg-out
  id: V β63 ■792 §1176
- title: The Liquid drain/the forward
  id: V β63 ■792 §1243
- title: The Liquid drain/first contact
  id: V β63 ■827 §1106
- title: The Liquid drain/the answer
  id: V β63 ■831 §684
- title: The Liquid drain/consent asked
  id: V β63 ■878 §1678
- title: The Liquid drain/consent given
  id: V β63 ■884 §1278
- title: The Liquid drain/the all-clear
  id: V β63 ■931 §1397
- title: The Liquid drain/the return
  id: V β63 ■959 §129
```

One group, chain order. Filing the coins apart from the conversation about
them was the first draft's mistake: a group stands where its first member
stood, so two groups printed the return (**■959**) above the message that
asked whether to send it (**■878**). The contents is chronological, and here
chronology carries the whole argument — patch, then confirm, then pay.

No published reading yet. The event is three days old, the 598.5 ₿ is
unspent, and whether this ends as a bounty, a settlement, or a theft is not
yet a fact about the chain. The entries keep the places; the reading waits
for someone to have finished saying why.
