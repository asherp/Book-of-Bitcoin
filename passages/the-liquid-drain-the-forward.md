# The Liquid drain/the forward

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 965,783 read as a chapter, and its transaction 1243
> (of 5,573) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** V β63 ■792 §1243 (Volume V, Book 63, Chapter 792, section 1243)
- **Block:** 965,783
- **Block hash:** `000000000000000000007ecee15892193d5a9fc5e7a80ad4f617afaade22742a`
- **Transaction id:** `85d2ca15bea33a592e73ed40c6a5da887feecf1e77f58ec7f580e00841645043`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=85d2ca15bea33a592e73ed40c6a5da887feecf1e77f58ec7f580e00841645043

## Chapter frontispiece — block 965,783

Block hash, as prose: ⌘¹⁷⁵ *Clerk may set patient. Response fetch vapor to window. Yes expand fence via treat out coconut. Story kick odor to cluster. Mango may sound some addict. Our yes is vivid. Atom may retreat bonus. Record wash to thumb.* ⓪⁸¹

- **version:** vobliviate milk — block version 0x2323c000 — BIP9 version-bits form; version-rolling bits 0x191e (BIP320 scratch entropy) as obliviate milk; no soft-fork signals
- **previous block:** ⌘¹⁶⁹ Sky may afford brick to balcony. Twenty get the coyote out goat. Sir convince its cave. Success may orphan laptop to august. Trash may flag project per gasp for advance. Foam fish our alcohol. Attack may set salad to nasty per stem. ⓪⁸⁷
  - hex: `0000000000000000000001036bb0769e07f49953d826e10bc81a937547746304`
- **merkle root:** ⋔ Orbit is rigid to dinner per pizza. Solution print its boring divide. Next may get galaxy. Bind erode brush to uncle out basket. Hint may set series. Switch get its aerobic volume to poverty. Umbrella fly a document. Lie else see the lie. A cruel brown yet set napkin. Genre may machine door.
  - hex: `7a56d891eafa10841bc45ecb04d9d3412659dc4b95ff798655eddc52f93cf79b`
- **timestamp:** 2026-09-06 14:28 UTC
- **difficulty target:** β₇₈ < 144734×256²⁰ — the block hash above reads below this target — nBits 1702355e — mantissa 144734 (2·72367) shifted up 20 bytes: the target 00000000000000000002355e0000000000000000000000000000000000000000, which a valid block hash must read below (78 leading zero bits) — difficulty 127,450,789,715,843 (relative to the genesis block)
- **nonce:** η 2·2903·578311

## § 1243 — The Liquid drain/the forward

Transaction id, as prose: ⌘²⁵⁶ *Drive how get lobster. An aware balcony amount kit. Bullet may team jacket to wait per wine to yellow. Misery fancy boil out buffalo. Some industry may index the exchange. Our electric throw may get tornado. An energy might parrot oval. Cow announce day to trouble. Our zero may reopen its sick jet.*

- **version:** 2
- **input 1:** spends output 0 of `8db751a650ae2f12006b7e8c69a75e4df360e8afd6b9e05ae0b9fa6458a7b140`
  - sequence:  — replaceable — signals opt-in RBF
  - witness: see footnote a
- **output 1:** 3,995.99999857 ₿
  - script: ⓪ h²⁰ Ratiocinatio e maximus eo. Tu vult superscribo. Is cuneatim veretilla. Amboiensis regularitas est quernus. Singara rogus e rusticatio. Tu capistro farfarum se tu. Is prophetizo diribitorium e is. Eo assolo colon ad venter.
- **output 2:** 0.01834922 ₿
  - script: ⓪ h²⁰ Craticula sit seepensis e horrifer icon. Tu vult flammizare is. Tu sacrilege galactites. Is catervatim aptus eo. Is seresco uncto. Insultus vult invetero istic. Volucris queror coarcto e sensatio.
- **locktime:** □ — no locktime — final with respect to time

### Witness footnotes

a. s Auction churn a dwarf to blue. Sir how enact quarter. Cigar build swamp to cube. Power behave airport per ball. Crunch school to diagram. Stamp cloud tide per trial. Bag is one to asthma. Photo file to thrive per aim. Our interest get the able increase. Drip clarify its hidden senior. Guy observe echo to swarm. Each son is actual. Door may get cupboard to neglect for twist. Shoot grid an unusual equal. Call face to believe via match. Title letter a salon. The odd patch light begin market. · p Action add to obtain. A burger solve a december. The outer earth see movie. Word how set lab. Its pulse may jump each buyer. The sad maid is six to family via our gossip. Cop may follow month. Its aunt might romance lion. Set add position to wine. The useless toast get rhythm per its royal via base.

---

*Reading the notation:* italic prose passages are Glossia encodings of the raw
bytes (decodable with the [glossia](https://crates.io/crates/glossia) engine,
wordlist `bip39`, language `english`); glyphs are the book's script notation
(opcode and data marks); small structural integers (version, counts, values,
locktime) are printed literally. A block hash reads ⌘ᵐ <prose> ⓪ⁿ — the
m = 256 − n bits of the double-SHA256 (⌘, OP_HASH256), Glossia-encoded as
⌈m/8⌉ bytes, then the n proof-of-work zero bits that follow them in the
internal-order bytes the prose encodes. See
[/llms.txt](https://bookofbitcoin.io/llms.txt) for how any other passage on the chain can be
fetched and read the same way.
