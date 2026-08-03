<!-- SPDX-License-Identifier: MIT OR Apache-2.0 -->

# Thefts and seizures: Bitfinex and the Silk Road 50,000

Research toward curated entries: the two great thefts whose culprits were
caught years later — the Bitfinex breach of 2016 and James Zhong's Silk
Road fraud of 2012 — and what makes them the *inverse* of the Mt. Gox
story already surveyed in `tools/mtgox-era-thefts.md`. There, the thefts
ended in disappearance and the record could only watch coins sit. Here,
both thefts ended in United States custody, and the endings are written on
the chain: a seizure is a spend like any other, made with the thief's own
keys, and the passages it leaves are among the largest ever printed. What
this file supports:

- **`web/notables.yaml`** — three chapter-and-section entries drafted at
  the end of this file: one withdrawal of the 2016 hack, the largest sweep
  of the 2022 Bitfinex seizure, and the 40,000 ₿ section of the 2022
  Silk Road seizure.
- **`web/btc-index-data.js`** — one candidate ledger: the DOJ custody
  address the Bitfinex coins were swept into, which has never spent.
- The editorial rule this file obeys: a story not yet checked against the
  chain stays a note here rather than becoming published commentary.
  Publishing is the assertion.

Every claim carries where it came from:

- **[verified]** — read off the chain for this file, 2026-08-03, via
  Esplora-compatible APIs (blockstream.info, mempool.space): the
  transactions, their values and positions, and complete address records.
- **[rule]** — consensus or a BIP: true of every block, or the block is
  invalid.
- **[reported]** — court records, DOJ statements, and secondary sources.
  Say so out loud.

## The frame: a seizure reads exactly like a theft

`tools/mtgox-era-thefts.md` establishes that a theft leaves no mark of
itself: the thief signs with the real keys and the passage is perfectly
formed. **[rule]** A seizure is the same sentence with the parties
reversed — the state spends the thief's coins with the thief's own keys,
and nothing on the page says whether the signer is a robber or a marshal.
Both stories below therefore pair two passages: the theft's (a valid
spend, criminal only by reporting) and the seizure's (a valid spend,
lawful only by reporting). The chain's contribution is not to sort them
but to *connect* them — the same outputs, watchable across the years
between — and that connection is what the entries cite.

## Bitfinex, 2 August 2016 — the theft

On the morning of 2 August 2016 the Bitfinex exchange was breached and
**119,754 ₿** left its BitGo-multisig wallets in some 2,000 unauthorized
withdrawals — 2,072 in the count the U.S. case records give — shaped like
ordinary payments. The price fell about 20% on the news. **[reported]**

One of them, verified whole: transaction `01c7cdfe…7904`, block 423,299,
2 August 2016, 09:13 UTC, position 718 — citation **III β2 ■1284 §719** —
pays **109.02740674 ₿** from two of the exchange's P2SH wallets
(`3C82brP7…`, `35etnSCU…`) to the P2PKH address `1MiWBbyne…`.
**[verified]** That the sending wallets were Bitfinex's is reporting; what
the chain adds is the output's afterlife, below — the reason this
particular withdrawal can carry an entry at all.

## Bitfinex, 1 February 2022 — the sweep

Five and a half years later the coins moved again, all at once, and the
whole event is one address's funding record. `bc1qazcm76…uxwczt` — the
DOJ custody address — received **23 transactions on 1 February 2022,
totaling 94,643.29837084 ₿**, inside 133 minutes (blocks 721,283–721,296):
a 1 ₿ test send first (04:14 UTC), then the sweeps — 10,000 ₿ even from
223 addresses (`afdfeead…6389`, block 721,286), two of **15,000 ₿ even**
and another 10,000 in block 721,287, four more 10,000s in block 721,292
(the largest by input count drawing on 592 addresses), the mid-size and
small lots, and last a 510-input dust sweep of exactly **0.29837084 ₿**.
The largest single passage: `c49ff6bd…c17a`, block 721,287, 04:57 UTC,
position 675 — citation **IV β46 ■568 §676** — **562 inputs, 15,000 ₿
even to custody**, with 5.88594500 ₿ of change to a staging address
beside it and a 0.01057374 ₿ fee (each big sweep pairs its round custody
output with such a change line — the first sweep's 13.79062700 ₿ went to
`1MiWBbyne…`, below). **[verified]**

The connection the chain writes by itself: `1MiWBbyne…` — the address the
2016 withdrawal above paid — is an *input* to these sweeps, and even took
the first big sweep's 13.79062700 ₿ of staging change before being
emptied into custody in block 721,292. Its whole record is three
transactions: funded by the hack, touched by the staging, drained by the
seizure. **[verified]** The theft's passage and the seizure's passage
share bytes; no attribution is needed to see that whoever signed in 2022
held the keys from 2016.

The reporting supplies the names. On 8 February 2022 the DOJ announced
the seizure — the largest financial seizure in its history, ~$3.6 billion
then — and the arrests of Ilya Lichtenstein and Heather Morgan; agents
had decrypted a cloud-stored file of Lichtenstein's holding the private
keys to some 2,000 hack addresses. Lichtenstein admitted at his 2023
guilty plea that he was the original hacker; he was sentenced to five
years in November 2024, Morgan to 18 months, and his release came in
January 2026. **[reported]**

And the record since: the custody address has never spent a satoshi.
Beyond the seizure it has received 158 more outputs — **0.18986935 ₿** of
dust sent by the world to a famous address — for a standing total of
**94,643.48824019 ₿ across 181 transactions, none out.** Where the coins
go next is a question for the forfeiture docket, not the chain.
**[verified balance; docket reported]**

## Silk Road, September 2012 — Zhong's fraud

The theft here predates even the Mt. Gox drain, and its mechanics are
database mechanics: in September 2012 James Zhong opened about nine
accounts on the Silk Road market, funded each with 200–2,000 ₿, and
triggered **over 140 withdrawals in rapid succession** — five withdrawals
of a 500 ₿ deposit within five seconds, in the indictment's example —
tricking the market's withdrawal processor into paying out **about
50,000 ₿**. He consolidated the take into two wallets, roughly 40,000 and
10,000, let them sit untouched for over a year, and shuffled them among
his own addresses from 2013 to 2019. **[reported — DOJ SDNY, IRS-CI,
Chainalysis]** No single 2012 passage is publicly pinned well enough to
cite as *the* theft; like Mt. Gox's drain, it enters the book through its
consequence.

## Silk Road, 25 March 2022 — the seizure sweep

The consequence is spectacular. On 9 November 2021, agents raided Zhong's
house in Gainesville, Georgia and seized devices holding
**50,676.17851897 ₿** — from an underground floor safe, and from a
single-board computer under blankets in a popcorn tin in a bathroom
closet. **[reported]** On 25 March 2022 the coins were swept on-chain
into government custody at `bc1qmxjef…g3y7wp`: a 0.1 ₿ test, then
**8,999.90803426 ₿** (73 inputs), then — one section, one output —
**40,000.32735811 ₿ from 33 inputs**: transaction `5435a6f7…5451`, block
728,977, 17:25 UTC, position 335 — citation **IV β50 ■194 §336** — with
two remnant sweeps (506.56452185, 318.82380974) behind it,
49,825.72380688 ₿ in all at that address. **[verified]**

The 40,000 is the entry's reason: the indictment's "two high-value
amounts" — 40,000 and 10,000 — are still legible in the seizure's own
shape a decade later, the larger hoard arriving in custody as a single
undivided output. It moved once more, still whole, on 7 March 2023
(40,000.32735811 ₿ again, one input, block 779,767), alongside the
9,000; the government's sale began that month — 9,861.17 ₿ through
Coinbase on 14 March 2023, by the court filings — and the custody
address's record closed with the remnants' move on 12 July 2023: in
49,825.72380688, out 49,825.72380688. **[verified moves; sale reported]**
Zhong pleaded guilty to wire fraud on 4 November 2022 and was sentenced
in April 2023 to a year and a day. **[reported]**

## What the pair adds to the shelf

- The **theft-to-seizure connection** is the chain's own: `1MiWBbyne…`
  funded by the 2016 hack and drained by the 2022 sweep; the 40,000 of
  2012 arriving whole in 2022. The book can cite these without borrowing
  anyone's attribution — the claims about *who* are credited to the
  dockets, but the *that* is bytes.
- The custody ledger mirrors the 1Feex hoard exactly: two of the chain's
  great one-way records, one held by a thief nobody has named, one held
  by the state that named him. The shelf keeps them a row apart, and
  their tables read the same: arrivals, dust, patience.
- The Mt. Gox contrast completes the register: Gox's thieves were charged
  but never caught and its coins never found; Bitfinex's and Silk Road's
  were caught *because the coins were found* — held too still, too long,
  by keys that could be seized with a house.

## The entries

References checked against `tools/check-editorial.mjs`:

- **One of Lichtenstein's 2,072** — III β2 ■1284 §719 (`web/notables.yaml`,
  commentary `one-of-the-2072.md`): a hack withdrawal whose afterlife the
  chain wrote itself.
- **The FBI's 15,000 ₿ sweep** — IV β46 ■568 §676 (`web/notables.yaml`,
  commentary `the-15000-btc-sweep.md`): the largest single passage of the
  Bitfinex seizure; the whole 23-transaction set reads in the ledger.
- **The IRS's 40,000 ₿ seizure** — IV β50 ■194 §336 (`web/notables.yaml`,
  commentary `the-40000-btc-seizure.md`): the 2012 hoard surviving intact
  into custody.
- **The Bitfinex custody** — `bc1qazcm763858nkj2dj986etajv6wquslv8uxwczt`
  (`web/btc-index-data.js` + `web/notables.yaml`, commentary
  `bitfinex-custody-ledger.md`): coins seized by a state actor, the
  shelf's welcome-criterion case.

The Zhong custody address (`bc1qmxjef…`) is verified above but not
shelved: its record opened and closed inside seventeen months, and the
40,000 ₿ entry already cites its best page. An editor wanting the full
table can add it from this file.

## Sources

- Chain data: blockstream.info and mempool.space Esplora APIs, read
  2026-08-03 — the hack withdrawal, the 23-transaction custody funding
  (summed to the satoshi), the `1MiWBbyne…` record, and the
  `bc1qmxjef…` sweep and close.
- DOJ press releases: 8 February 2022 (Lichtenstein/Morgan arrests,
  $3.6B seizure); 7 November 2022 (Zhong conviction, 50,676.17851897 ₿);
  sentencing releases of November 2024 (Lichtenstein, Morgan).
- U.S. Attorney SDNY and IRS-CI materials on Zhong — the nine accounts,
  the 140 withdrawals, the five-in-five-seconds example, the floor safe
  and popcorn tin.
- Chainalysis, "How IRS-CI Seized Billions From Silk Road Hacker James
  Zhong" — the two-wallet consolidation and 2013–2019 shuffles.
- Privacy Insight Solutions, "FBI Bitcoin Trace" — the sweep-by-sweep
  OSINT reconstruction this file re-verified against the chain
  (including the `1MiWBbyne…` example and staging change).
- PeckShield and contemporary coverage (March 2023) identifying
  `bc1qmxjef…` as the Zhong custody address; court filings on the March
  2023 Coinbase sale.
- CNBC and contemporary coverage: the 2016 hack's 119,754 ₿ and price
  drop; Lichtenstein's 2023 plea and January 2026 release.
