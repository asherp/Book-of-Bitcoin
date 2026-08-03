<!-- SPDX-License-Identifier: MIT OR Apache-2.0 -->

# The Mt. Gox era thefts

Research toward curated entries: the thefts that emptied Mt. Gox — then the
dominant exchange — and what each one did and did not leave on the chain. The
chain never says "stolen": a stolen coin moves by a valid signature, and the
record shows a spend like any other. Every theft is therefore a reading of
the record, and this file keeps the two apart the way the book does: the
passage quoted beside each claim, and each claim carrying whose it is. What
this file supports:

- **`web/notables.yaml`** — two chapter-and-section entries drafted at the
  end of this file: the withdrawal of 1 March 2011 and the proof of 23 June
  2011, the era's two great on-chain artifacts.
- **`web/btc-index-data.js`** — one candidate ledger: the address known as
  1Feex, where the March coins still sit.
- The editorial rule this file obeys: a story not yet checked against the
  chain stays a note here rather than becoming published commentary.
  Publishing is the assertion.

Every claim carries where it came from:

- **[verified]** — read off the chain for this file, 2026-08-03, via
  Esplora-compatible APIs (blockstream.info, mempool.space): the
  transactions, their scripts and values, their block positions, and — for
  addresses — the funded/spent totals.
- **[rule]** — consensus or a BIP: true of every block, or the block is
  invalid.
- **[reported]** — secondary sources, court filings, and the parties' own
  statements, not re-checkable against the chain. Say so out loud.

## What a theft looks like on the chain

Nothing. That is the finding this file keeps returning to, and it is worth
stating as the frame before any of the stories.

A burn is legible in the record: the script cannot be satisfied, and anyone
can check it (`tools/locks-and-burns.md` is built on that legibility). A
theft is the opposite case. The thief spends with the real keys, so the
passage a theft leaves is perfectly formed — valid signatures, standard
scripts, nothing for a verifier to object to. The chain checks that the
keyholder signed; it has no register for whether the keyholder was the
owner. **[rule]** Whether a spend was a withdrawal or a robbery is never in
the passage. It is always a claim made beside it, by someone, resting on
evidence off the chain.

Mt. Gox's losses happen to demonstrate every register the problem has:

1. **A theft with a passage.** The 79,956 ₿ withdrawal of 1 March 2011 is
   one section — a single output the reporting can point at, whose
   never-moving balance anyone can watch. The theft is a claim; the passage
   is exact.
2. **A theft with no passage.** The drain of September 2011 onward — eight
   times larger — was designed to read as ordinary withdrawals, thousands
   of them, and does. No single section can be cited as *the* theft; the
   loss was only ever visible as arithmetic between what the exchange owed
   and what its keys still held.
3. **A loss that is all passage.** The 2,609 ₿ the exchange destroyed that
   same season with a malformed script (already in the book as *Mt. Gox
   pays the void*) is the inverse: provable from the record alone, no
   reporting required. The costliest *provable* loss in the exchange's
   history is the one nobody stole.
4. **The exchange answering.** The 424,242.42424242 ₿ proof of 23 June 2011
   is what an exchange under doubt could say on the chain: a signature is
   the only sentence the chain can verify, so Mt. Gox signed.

## 1 March 2011 — the 79,956 ₿ withdrawal

The era's one theft with a passage, and the largest exchange loss then on
record. In one section, twenty-seven inputs worth **79,956.55 ₿** are
gathered and paid — **79,956 ₿ exactly** — to a single P2PKH address,
`1FeexV6bAHb8ybZjqQMjJrcCrHGW9sb6uF`, with 0.55 ₿ of change and no fee.
Transaction `e67a0550…0114`, block 111,194, 1 March 2011, 10:26 UTC,
position 1 — citation **I β56 ■315 §2**, the output **§2.0**. The change
returns to `1GPuT4JD…`, itself one of the twenty-seven input addresses.
**[verified]**

The claim that makes it a theft is the operator's own. Mark Karpelès —
who bought the exchange from Jed McCaleb the same week the coins moved —
stated publicly (X, 1 August 2023) that **79,956.55 ₿** left Mt. Gox on
1 March 2011 "without authorization," and that the coins are stolen
property of the Mt. Gox estate. The figure he gave matches this section's
input total to the satoshi. **[reported]** The mechanism generally given —
a copied `wallet.dat` — is consistent with the shape of the passage (a
sweep of many funded addresses into one output) but is itself reporting,
not record. **[reported]** No one has ever been charged with this theft;
the September 2011 indictment (below) does not reach back to it.
**[reported]**

What the chain adds is the ending the reporting cannot write: the coins
have never moved. Fifteen years on, the output is unspent. **[verified]**

## The name 1Feex — the hoard as a ledger

Read whole, the address is a one-way record: **690 outputs received,
79,957.26866953 ₿ in all, none ever spent.** The first arrival is the
79,956 ₿ above; the other 689 outputs, arriving across the fifteen years
since, total **1.26866953 ₿** — the world's small sends to a famous
address: tributes, tests, dust, and (per 2025 reporting) phishing bait.
**[verified balance; the characterization of the dust reported]**

The name has been claimed in public twice, which is exactly what makes it
Ledger material — a ledger sets readings of a name apart from the name's
record:

- **The estate's claim.** Karpelès's 2023 statement above: stolen property,
  held for the creditors. **[reported]**
- **The claim the courts ended.** Tulip Trading Ltd — Craig Wright's
  vehicle — sued sixteen bitcoin developers (2021) to be given control of
  this address's coins, asserting its keys had been Wright's and were lost
  in a hack. The claim collapsed with its claimant: the COPA judgment
  (High Court, 2024) found Wright was not Satoshi Nakamoto and had lied
  and forged documents on a grand scale, and the Tulip Trading action was
  discontinued in its wake. **[reported — court record]**

The record itself supports neither claim, nor any other: an unspent balance
is patience, not identity. Whether the keys are held carefully, held by no
one, or lost is not written anywhere the chain can show.

## 19–20 June 2011 — the crash that left no passage

The famous hack is the one with *nothing* to cite. An attacker used a
compromised administrator account (Jed McCaleb's, retained from before the
sale) to credit themselves bitcoins **in the exchange's database** and sold
them into the order book, crashing the price from ~$17.50 to **$0.01**;
the apparent motive was the $1,000-per-day withdrawal limit, worth a
hundred thousand coins at a penny each. Roughly **2,000 ₿** were actually
withdrawn — "Got about 2,000 BTC out," in Karpelès's accounting — before
limits held; the trades were rolled back and the exchange closed for days.
**[reported]**

Database balances are not the chain. The sale that printed $0.01 moved no
coins; the rollback unmade it; and the ~2,000 ₿ that did leave left as
ordinary-looking withdrawals no reader can pick out of the era's sections.
The event that made "Mt. Gox hacked" a headline is, on the record, almost
nowhere — which is why it gets a section in this file and no entry in the
contents. **[reported]**

## 23 June 2011 — the 424,242.42424242 ₿ proof

Three days after the crash, with the exchange dark and solvency in open
doubt, Mt. Gox answered in the one register the chain can verify. Karpelès
had offered to move a uniquely identifiable amount as proof the exchange
still held its coins; the amount chosen was the joke number
**424,242.42424242 ₿**. **[reported]** The transaction is exact: nine
inputs totaling **442,000 ₿ even**, one output of 424,242.42424242 ₿ to
`1eHhgW6vquBYhwMPhQ668HPjxTtpvZGPC`, change of **17,757.57575758 ₿** — the
round total minus the joke leaves a second repeating decimal — and no fee.
Transaction `3a1b9e33…f8c4`, block 132,749, 23 June 2011, 06:50 UTC,
position 1 — citation **I β66 ■1710 §2**, the output **§2.1**.
**[verified]**

The proof was real and bounded. A signature over 442,000 ₿ proves control
of 442,000 ₿ at that block — it does not prove solvency, and it says
nothing about coins already gone (the March hoard had been sitting in
1Feex for sixteen weeks) or keys about to be copied (September was eleven
weeks away). The proof coins were spent onward from 18 July 2011 — first
spend at block 136,881 — and the receiving address's record closed
entirely: 474,320.43446353 ₿ in, all of it spent. **[verified]** With
hindsight the section reads as the era's high-water mark: the last day
anyone could sign for Mt. Gox's coins and be believed.

## September 2011 – mid-2013 — the drain

The theft that actually emptied the exchange has no passage to cite, and
the sources must carry the whole story. In September 2011 the server
holding Mt. Gox's wallets was breached and the hot-wallet keys copied — a
stolen `wallet.dat` **[reported]** — and from then until the coins ran
out, the thieves spent the exchange's spendable balance as it accumulated:
thousands of valid transactions shaped like the withdrawals around them.
WizSec's reconstruction (the published analyses of 2015–2017) puts the
discrepancy between owed and held as visible from **August–late 2011**,
"several hundred thousand BTC" by the end of 2011, and the wallets
effectively empty by **mid-2013** — roughly **630,000 ₿** taken, plus some
**40,000 ₿** lost to a related confusion in which the compromised keypool's
address reuse caused stolen coins moving through Gox's own deposit
addresses to be credited to customers as new money. The exchange traded
insolvent for over two years. **[reported]**

The public record is the indictment. In June 2023 the U.S. Department of
Justice charged Alexey Bilyuchenko and Aleksandr Verner with gaining
unauthorized access to Mt. Gox's wallet server in **September 2011** and
stealing approximately **647,000 ₿** through 2014, laundering the bulk
through accounts at two exchanges and more than 300,000 ₿ through a New
York bitcoin broker under a fraudulent advertising contract. Bilyuchenko
is further charged with operating BTC-e — the laundering exchange of the
era — with Alexander Vinnik, whose 2017 arrest came out of the same coin
tracing. **[reported — indictment; allegations, not adjudicated facts]**

For the book, the drain is the register-2 lesson stated at the top: the
largest theft in the exchange's history — among the largest ever — is
invisible as any single passage, *by design*. It enters the contents only
through its consequences: the void it bracketed (October 2011), and the
collapse it caused (February 2014).

## 28 October 2011 — the void, for completeness

Between the breach and the drain's peak, the exchange destroyed 2,609 ₿
itself: withdrawal code that built P2PKH outputs with an empty push where
the key-hash belongs, all 23 outputs in block 150,951. Already fully
treated — chain-verified to the satoshi — in `tools/locks-and-burns.md`
and in the book (*Mt. Gox pays the void*, I β75 ■1768 §23.1; the ledger
*The Mt. Gox void*, `script:76a90088ac`). It stays in this timeline
because the season is the same and the contrast is the point: the era's
one provable loss is the one that was an accident.

## February 2014 — the collapse, and the arithmetic of hindsight

On 7 February 2014 Mt. Gox halted withdrawals; on 28 February it filed for
bankruptcy protection in Tokyo, announcing about **850,000 ₿** missing —
roughly 750,000 of customers' and 100,000 of its own. In March 2014 it
reported finding **199,999.99 ₿** in an old-format wallet (the community
watched ~200,000 ₿ move on-chain that week before the announcement
explained it), leaving some **650,000 ₿** lost — a figure consistent with
the drain reconstruction above. A decade of proceedings followed:
bankruptcy became civil rehabilitation in 2018, and creditor repayments —
in bitcoin, from the found coins — finally began in July 2024.
**[reported]** The 79,956 ₿ of 1Feex are no part of the found coins; they
remain on the chain, claimed but unmoved. **[verified balance]**

## The era around the exchange

Context, all **[reported]**, none yet chain-checked, so none of it is
entries — the rule at the top of this file:

- **allinvain, 13 June 2011** — six days before the crash: a Bitcointalk
  user reported **25,000 ₿** swept from his Windows machine's unencrypted
  wallet, the first great personal theft and, at ~$500,000, briefly the
  largest. Never attributed.
- **MyBitcoin, July–August 2011** — the era's wallet service vanished and
  returned admitting about half its deposits gone (~78,739 ₿ is the figure
  usually given).
- **Linode, 1 March 2012** — a year to the day after 1Feex: the hosting
  provider's management interface was breached and hot wallets on its
  servers emptied — ~43,554 ₿ from Bitcoinica, ~3,094 ₿ from Slush's pool.
- **Bitfloor, September 2012** — ~24,000 ₿ taken via unencrypted backup
  keys; the exchange repaid customers for a year, then closed.

The pattern the era taught, across every one: keys on a networked machine
are the exchange's real balance sheet, whatever its database says.

## The entries

What the findings above became, in the grammar of the files they join —
references checked against `tools/check-editorial.mjs`:

- **The 79,956 ₿ theft** — I β56 ■315 §2 (`web/notables.yaml`, commentary
  `the-79956-btc-theft.md`): the passage is a withdrawal; the theft is the
  operator's own claim, matched to the satoshi; the coins have never
  moved.
- **The 424,242 ₿ proof** — I β66 ■1710 §2 (`web/notables.yaml`,
  commentary `the-424242-btc-proof.md`): the exchange speaking in the one
  sentence the chain can verify.
- **The 1Feex hoard** — `1FeexV6bAHb8ybZjqQMjJrcCrHGW9sb6uF`
  (`web/btc-index-data.js` + `web/notables.yaml`, commentary
  `mt-gox-1feex-ledger.md`): a ledger of arrivals with no departures, and
  two public claims on the name, set apart as the Ledger sets every claim
  about a name.

The crash and the drain get no rows, deliberately: the one left almost
nothing on the chain, the other left everything and marked none of it. The
research stays here so the next editor needn't re-walk it.

## Sources

- Chain data: blockstream.info and mempool.space Esplora APIs, read
  2026-08-03 — the two transactions, their blocks and positions, and the
  1Feex and 1eHhgW address totals.
- WizSec (Kim Nilsson), "The missing MtGox bitcoins" (April 2015) and
  "Breaking open the MtGox case, part 1" (July 2017) — the drain's
  reconstruction, timeline, and the Vinnik identification.
- U.S. Department of Justice, press release, 9 June 2023 — indictments of
  Alexey Bilyuchenko and Aleksandr Verner: September 2011 access, ~647,000
  BTC, the laundering routes, BTC-e.
- Mark Karpelès, public statement (X), 1 August 2023 — 79,956.55 BTC
  moved without authorization on 1 March 2011; the estate's claim to
  1Feex.
- BitMEX Research, "The June 2011 flash crash" — the June 19–20 mechanism,
  the $0.01 print, the ~2,000 BTC, the rollback; and contemporary
  reporting of the 424,242.42424242 proof announcement.
- COPA v Wright, High Court of England and Wales (2024) — the findings
  that ended Tulip Trading's claim to the 1Feex coins; Bitcoin Legal
  Defense Fund statements on the discontinuance.
- Mt. Gox bankruptcy filings and contemporary coverage, February–March
  2014 — the 850,000 figure, the 200,000 found, the repayment timeline.
- Era context (all reported): the allinvain Bitcointalk thread (June 13,
  2011) and retrospectives; MyBitcoin coverage (2011); Linode incident
  reporting (March 2012); Bitfloor disclosure (September 2012).
