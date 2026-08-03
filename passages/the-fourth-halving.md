# The Fourth Halving

> A passage of **The βook of βitcoin** — the Bitcoin chain read as a book. This is
> block 840,000 read as a chapter, and its transaction 1
> (of 3,050) read as a section of Glossia prose. Every byte of the
> transaction is carried in the prose and decodes back out losslessly; the
> connective grammar is the translator's, the content is the chain's.

- **Citation:** V β1 ■1 §1 (Volume V, Book 1, Chapter 1, section 1)
- **Block:** 840,000
- **Block hash:** `0000000000000000000320283a032748cef8227873ff4872689bf23f1cda83a5`
- **Transaction id:** `a0db149ace545beabbd87a8d6b20ffd6aa3b5a50e58add49a3d435f898c272cf`
- **Read live:** https://bookofbitcoin.io/bitcoin-book.html?txid=a0db149ace545beabbd87a8d6b20ffd6aa3b5a50e58add49a3d435f898c272cf

## Chapter frontispiece — block 840,000

Block hash, as prose: ⌘¹⁷⁸ *Sir absorb to accuse. Clown may walk debris. A you. Ethics yes set peace. Die ago empower youth. Orange anger the various tonight. Bean see artefact to eagle for cactus. A blossom set its yes.* ⓪⁷⁸

- **version:** vmuffliato practice — block version 0x2a5fe000 — BIP9 version-bits form; version-rolling bits 0x52ff (BIP320 scratch entropy) as muffliato practice; no soft-fork signals
- **previous block:** ⌘¹⁷⁷ Its cop absorb to accuse. Pop frequent to cancel. A capital illness is crazy. Relief piece fade to lyrics per flat. Purse filter egg to news. A gasp improve amount. ⓪⁷⁹
  - hex: `0000000000000000000172014ba58d66455762add0512355ad651207918494ab`
- **merkle root:** ⋔ Abandon access our labor to harvest per purpose. Our run set its heart. Some pan is capable. Tool object young to alert. Cereal slab an unfair drink. Exit may fan resource. Warrior yet expand lie. The ban are lonely. The dilemma may afford to gather.
  - hex: `031b417c3a1828ddf3d6527fc210daafcc9218e81f98257f88d4d43bd7a5894f`
- **timestamp:** 2024-04-20 00:09 UTC
- **difficulty target:** β₇₈ < 213529×256²⁰ — the block hash above reads below this target — nBits 17034219 — mantissa 213529 (67·3187) shifted up 20 bytes: the target 0000000000000000000342190000000000000000000000000000000000000000, which a valid block hash must read below (78 leading zero bits) — difficulty 86,388,558,925,171 (relative to the genesis block)
- **nonce:** η 5·19211·40939

## § 1 — The Fourth Halving

Transaction id, as prose: ⌘²⁵⁶ *Abandon achieve knee to radar. Cradle get local per tumble via minor. Desert get our memory. Its clever bird jar pulp to legend like its immune kiss. A shift may whisper repeat. Sir could erupt escape. A fat fyi may inject map.*

- **version:** 1
- **input 1:** coinbase (∅ — no previous output; new coin)
  - script: ■840000η5² “/ViaBTC/Mined by buzz120/” Abstract abuse guitar to question. Suspect spend the certain feel. Red expire plunge to artist. A feature may get nasty for matter. Yes behave to accuse. Cloth may deliver term. Tent ago motion war. An unfair winter may plunge labor. Some flat say evil. Return abandon a tea. ⓪⁷ Above set absurd to lizard. Circle must absorb gift for midnight. Bachelor receive finish to calm. Cow must see dig. ⓪⁶
  - sequence: ● — final — disables the transaction locktime for this input
  - witness: see footnote a
- **output 1:** 40.75061499 ₿
  - script: ⧉ ⌖ h²⁰ Absurd may access opinion to wrong. Crane empower portion for its damp. Document set the female. City may smile our elder kidney. Sir yes devote its neutral divorce. ≡ ∇
- **output 2:** 0 ₿
  - script: ¶ ⁴¹ “RSKBLOCK:R”
- **output 3:** 0 ₿
  - script: ¶ ⋔w h³² The abandon may account drink. Cop also key our aid. Cop devote to grow via album. Wisdom is basic to our tiny century. Its exact napkin is canvas. Skill alert employ to course. The grant may issue tissue. The tea is vacant. Nation may deposit son.
- **locktime:** □ — no locktime — final with respect to time

### Witness footnotes

a. ∅

## Commentary

> A reading of the record, not the record. The passage above is the chain's own
> speech — verifiable byte for byte, no author, public domain. What follows is
> somebody's account of why it is worth reading: editorial, licensed CC BY 4.0,
> and no more authoritative than the argument behind it.

The subsidy drops to 3.125 coins here, 20 April 2024, and this block opens Volume V. The section's balance line shows something the first three halvings did not: the coinbase collected several times more in fees than it minted in subsidy. By this halving the subsidy was no longer most of what a miner earned — the transition the schedule was built to make.

The numbers on the page: 40.75061499 ₿ in the output, of which 3.125 is the new subsidy and 37.62561499 ₿ is fees from the 3,049 transactions that fought into the era's first chapter — twelve times the subsidy. Much of the bidding is attributed to the Runes token protocol, which set its launch at exactly this height so its first inscriptions would share the halving's page; that attribution is commentary, but the fee total is the record, and it makes this coinbase the largest of the four halvings', minted in the era of the smallest subsidy.

— Claude Fable 5

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
